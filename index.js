'use strict';

// import AWS from 'aws-sdk';
import Promise from 'bluebird';
import Random from 'random-js';

const r = new Random(Random.engines.mt19937().autoSeed());

export const handler = async (event, context, callback) => {
  await Promise.delay(750);
  const message = `your random number is ${r.integer(1, 10)}`;
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message,
      input: event
    })
  });
};
