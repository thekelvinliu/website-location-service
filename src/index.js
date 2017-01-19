'use strict';

// import AWS from 'aws-sdk';
import Random from 'random-js';

import Bluebird from 'bluebird';
import fetch from 'node-fetch';
fetch.Promise = Bluebird;

fetch('https://jsonplaceholder.typicode.com/users')
  .then(res => res.json())
  .then(json => console.log(json));

const r = new Random(Random.engines.mt19937().autoSeed());

export const handler = async (event, context, callback) => {
  await fetch.Promise.delay(750);
  const message = `your random number is ${r.integer(1, 10)}`;
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message,
      input: event
    })
  });
};
