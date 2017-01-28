'use strict';

import Promise from 'bluebird';
import * as lib from './lib.js';

// lambda function handler
// expected to get triggered by a yo location (yolo) via the yo api
export const handler = (event, context, callback) => {
  // save the datetime
  const dt = Date.now();
  lib.logger.info('lambda triggered at', dt);
  lib.logger.info('lambda triggered with', event.queryStringParameters || {});
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
      (params.username === lib.UPDATE_USER)
        ? params
        : lib.httpError(403, `username '${params.username}' is not valid`))
    // extract and convert location data
    .then(({ location }) => location.split(';').map(parseFloat))
    // ensure that the location is valid lat;lng coordinates
    .then(loc =>
      (!loc.some(isNaN))
        ? loc
        : lib.httpError(400, `location (${loc.join(', ')}) is not valid`))
    .then(loc =>
      (loc.length === 2)
        ? loc
        : lib.httpError(400, `location (${loc.join(', ')}) isn't a coordinate`))
    // log the location
    .then(loc => {
      lib.logger.info(`requesting data for (${loc.join(', ')})`);
      return loc;
    })
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
      createdDate: dt,
      distance: info.distance,
      geonameId: info.geonameId,
      lat: parseFloat(info.lat),
      lng: parseFloat(info.lng),
      name: info.name,
      population: info.population,
      toponymName: info.toponymName,
      ver: 1
    }))
    // save location data
    .then(payload =>
      lib.dynamoClient().put({
        TableName: lib.LOCATION_TABLE,
        Item: payload
      }).promise()
        // log the saved payload
        .then(() => {
        lib.logger.info('finished saving locaiton:', payload);
        return 'success';
      }))
    // final then calls the lambda callback
    .then(async result => callback(null, await lib.response(200, result)))
    // log the error message and do the callback
    .catch(async err => {
      lib.logger.error(err.message);
      return callback(null, await lib.response(err.status || 500, err.message));
    });
};
