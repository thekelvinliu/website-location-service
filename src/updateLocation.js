'use strict';

import * as lib from './lib.js';

// lambda function handler
export const handler = async (event, context, callback) => {
  // load location data from geonames api
  let data = await lib.getJSON(lib.GEONAMES_URL, {
    username: lib.GEONAMES_USER,
    lat: 10,
    lng: '10'
  });
  // extract useful information
  const info = (lib.contains(data, 'geonames')) ? data.geonames[0] : null;
  callback(null, info);
};
