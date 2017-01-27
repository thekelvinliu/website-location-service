'use strict';

import * as lib from './lib.js';

// lambda function handler
// exprected to be triggered by the website and return most recent locaiton data
export const handler = async (event, context, callback) => {
  // log timestamp
  lib.logger.info('lambda triggered at', Date.now());
  // attempt to query dynamo
  try {
    const data = await lib.dynamoClient().query({
      TableName: lib.LOCATION_TABLE,
      KeyConditionExpression: 'ver = :vn',
      ExpressionAttributeValues: {
        ':vn': 1
      },
      Limit: 1,
      ScanIndexForward: false
    }).promise();
    if (data.Count !== 1)
      lib.httpError(500, `query returned unexpected results: ${data}`);
    // log the retrieved item
    lib.logger.info(`query found: ${data.Items[0]}`);
    return callback(null, lib.createResponse(200, data.Items[0]));
  } catch (err) {
    lib.logger.error(err.message);
    return callback(null, lib.createResponse(err.status || 500, err.message));
  }
};
