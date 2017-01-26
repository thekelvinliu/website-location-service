'use strict';

// import AWS from 'aws-sdk';
// import * as lib from './lib.js';

// lambda function handler
// exprected to be triggered by the website and return most recent locaiton data
export const handler = async (event, context, callback) => {
  // // get newest document
  // const doc = await new AWS.DynamoDB.DocumentClient(lib.DYNAMO_PARAMS).get({
  //   TableName: lib.LOCATION_TABLE
  // }).promise();
  // // some conjecture pseudocode
  // if (!doc.rejected)
  //   return callback(null, lib.createResponse(200, doc));
  // else {
  //   console.error(doc.errorMessage);
  //   return callback(null, lib.createResponse(doc.errorCode || 500, doc.errorMessage));
  // }
  return callback(null, {
    statusCode: 200,
    body: (process.env.IS_TEST) ? 'this is a test' : 'this is real'
  });
};
