'use strict';

import jprom from 'json-promise';
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
    if (data.Count === 0) {
      jprom.stringify(data).then(json => lib.logger.error(json));
      lib.httpError(500, 'query found nothing');
    }
    // this should never happen because limit 1
    if (data.Count > 1) {
      jprom.stringify(data).then(json => lib.logger.error(json));
      lib.httpError(500, `query returned unexpected results`);
    }
    // log the retrieved item
    jprom.stringify(data.Items[0]).then(json => {
      lib.logger.info(`query found: ${json}`);
    });
    return callback(null, await lib.response(200, data.Items[0], event));
  } catch (err) {
    lib.logger.error(err.message);
    return callback(null, await lib.response(err.status || 500, err.message));
  }
};
