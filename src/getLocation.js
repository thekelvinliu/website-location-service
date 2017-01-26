'use strict';

import * as lib from './lib.js';

// lambda function handler
// exprected to be triggered by the website and return most recent locaiton data
export const handler = async (event, context, callback) => {
  // query for newest document
  const data = await lib.dynamoClient().query({
    TableName: lib.LOCATION_TABLE,
    KeyConditionExpression: 'ver = :vn',
    ExpressionAttributeValues: {
      ':vn': 1
    },
    Limit: 1,
    ScanIndexForward: false
  }).promise();
  // no recorded location
  if (data.Count < 1)
    return callback(null, lib.createResponse(500, 'no data found'));
  else
    return callback(null, lib.createResponse(200, data.Items[0]));
};
