'use strict';

// import Promise from 'bluebird';
import * as lib from './lib.js';

// returns a simple response object
const createResponse = (code, message) => ({
  statusCode: code,
  body: JSON.stringify({ message })
});

// lambda function handler
// expected to get triggered by a yo location (yolo) via the yo api
export const handler = async (event, context, callback) => {
  // default status code and message
  let code = 200;
  let message = 'OK';
  // respond with 400 when request has no params
  if (lib.isEmpty(event.queryStringParameters)) {
    code = 400;
    message = lib.errStr(code, 'initial request has no parameters');
    console.error(message);
    return callback(null, createResponse(code, message));
  }
  // extract params
  const params = event.queryStringParameters;
  // respond with 400 when params do not include both username and location
  if (['username', 'location'].every(e => !lib.contains(params, e))) {
    code = 400;
    message = lib.errStr(code, 'request is missing username and location parameters');
    console.error(message);
    return callback(null, createResponse(code, message));
  }
  // respond with 403 when the username is not the valid update user
  if (params.username !== process.env.UPDATE_USER) {
    code = 403;
    message = lib.errStr(code, `username ${params.username} is not valid`);
    console.error(message);
    return callback(null, createResponse(code, message));
  }
  // respond with 400 when the location does not contain lat;lng coordinates
  const [lat, lng] = params.location.split(';').map(parseFloat);
  if (!lat || ! lng) {
    code = 400;
    message = lib.errStr(code, `location ${params.location} is not valid`);
    console.error(message);
    return callback(null, createResponse(code, message));
  }






    // unpack latlng coords
    cb => {
      const [lat, lng] = qs.location.split(';');
      return (lat && lng)
        ? cb(null, lat, lng) : cb(newErr(400, 'invalid location'));
    },
    // send request to geonames to get metadata on latlng coords
    (lat, lng, cb) => request({
      url: 'http://api.geonames.org/findNearbyPlaceNameJSON',
      qs: {
        username: 'kelvinliu',
        lat,
        lng
      },
      json: true
    }, (err, response, body) => {
      if (err) return cb(err);
      else if (contains(body, 'geonames')) {
        const data = body.geonames[0];
        if (isEmpty(data)) return cb(newErr(500, 'GeoNames request failed'));
        else return cb(null, data);
      } else return cb(newErr(500, 'GeoNames request failed'));
    }),


  // respond with the params
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(event.queryStringParameters)
  });
  // // load location data from geonames api
  // let data = await lib.getJSON(lib.GEONAMES_URL, {
  //   username: lib.GEONAMES_USER,
  //   lat: 10,
  //   lng: '10'
  // });
  // // extract useful information
  // const info = (lib.contains(data, 'geonames')) ? data.geonames[0] : null;
  // callback(null, {
  //   statusCode: 200,
  //   headers: { 'content-type': 'application/json' },
  //   body: JSON.stringify({ event })
  // });
};
