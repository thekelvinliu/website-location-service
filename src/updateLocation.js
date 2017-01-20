'use strict';

import * as lib from './lib.js';

// lambda function handler
export const handler = async (event, context, callback) => {
  // load location data from geonames api
  let data = await lib.getJSON(lib.GEONAMES_URL, lib.GEONAMES_QUERY)
    // extract geonames property
    .then(data => data.geonames[0])
    .catch(err => {
      console.warn(err);
    });
  console.log(!!data);
  callback(null, JSON.stringify(data));
};

handler('', '', () => {});
