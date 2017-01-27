'use strict';

import bfj from 'bfj';
import * as lib from './lib.js';

let data;

// lambda function handler
// exprected to be triggered by the website and return most recent locaiton data
export const handler = async (event, context, callback) => {
  // log timestamp
  lib.logger.info('lambda triggered at', Date.now());
  // attempt to query dynamo
  try {
    // simple cache, but not during tests
    if (!data || process.env.IS_TEST)
      data = await lib.dynamoClient().query({
        TableName: lib.LOCATION_TABLE,
        KeyConditionExpression: 'ver = :vn',
        ExpressionAttributeValues: {
          ':vn': 1
        },
        Limit: 1,
        ScanIndexForward: false
      }).promise();
    // this should never happen because limit 1
    if (data.Count !== 1) {
      lib.httpError(500, `query returned unexpected results`);
      bfj.stringify(data).then(json => lib.logger.error(json));
    }
    // log the retrieved item
    bfj.stringify(data.Items[0]).then(json => {
      lib.logger.info(`query found: ${json}`);
    });
    return callback(null, await lib.createResponse(200, data.Items[0], event));
  } catch (err) {
    lib.logger.error(err.message);
    return callback(null, await lib.createResponse(err.status || 500, err.message));
  }
};
