'use strict';

import AWS from 'aws-sdk';
import Promise from 'bluebird';
import * as lib from './lib.js';

// use bluebird promises
AWS.config.setPromisesDependency(Promise);

// returns a simple response object
const createResponse = (code, message) => ({
  statusCode: code,
  body: JSON.stringify({ message })
});

// lambda function handler
// expected to get triggered by a yo location (yolo) via the yo api
export const handler = async (event, context, callback) => {
  // save the datetime
  const dt = Date.now();
  // promise chain let's go
  Promise.resolve(event)
    // ensure that the request has parameters
    .then(event =>
      (!lib.isEmpty(event.queryStringParameters))
        ? event.queryStringParameters
        : lib.httpError(400, 'initial request has no parameters'))
    // ensure the parameters have both username and location parameters
    .then(params =>
      (['username', 'location'].every(e => lib.contains(params, e)))
        ? params
        : lib.httpError(400, 'request is missing username and/or location'))
    // ensure that the request was sent by a the valid user
    .then(params =>
      (params.username === process.env.UPDATE_USER)
        ? params.location.split(';').map(parseFloat)
        : lib.httpError(403, `username '${params.username}' is not valid`))
    // ensure that the location is valid lat;lng coordinates
    .then(loc =>
      (loc.length === 2 && !loc.some(isNaN))
        ? loc
        : lib.httpError(400, `location (${loc.join(', ')} is not valid`))
    // request geonames api
    .then(([lat, lng]) => lib.getJSON(lib.GEONAMES_URL, {
      username: lib.GEONAMES_USER,
      lat,
      lng
    }))
    // extract location information in the geonames property
    .then(data =>
      (lib.contains(data, 'geonames') && !lib.isEmpty(data.geonames[0]))
        ? data.geonames[0]
        : lib.httpError(500, 'geonames request failed'))
    // filter only certain properties
    .then(info => ({
      adminCode1: info.adminCode1,
      adminName1: info.adminName1,
      countryCode: info.countryCode,
      countryId: info.countryId,
      countryName: info.countryName,
      date: dt,
      distance: info.distance,
      geonameId: info.geonameId,
      lat: parseFloat(info.lat),
      lng: parseFloat(info.lng),
      name: info.name,
      population: info.population,
      toponymName: info.toponymName
    }))
    // save location data
    // .then(payload =>
    //   new AWS.DynamoDB.DocumentClient().put({
    //     TableName: 'locations',
    //     Item: payload
    //   })).promise()
    // final then
    .then(result => callback(null, createResponse(200, result)))
    // log the error message and do the callback
    .catch(err => {
      console.log(err.message);
      return callback(null, createResponse(err.status || 500, err.message));
    });
};
