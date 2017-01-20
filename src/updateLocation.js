'use strict';

import * as lib from './lib.js';

// lambda function handler
// expected to get triggered by a yo location (yolo) via the yo api
export const handler = async (event, context, callback) => {
  // respond with 400 when request has no params
  if (lib.isEmpty(event.queryStringParameters)) {
    const code = 400;
    const message = lib.errStr(code, 'initial request has no parameters');
    console.error(message);
    return callback(null, {
      statusCode: code,
      body: JSON.stringify({ message })
    });
  }
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
