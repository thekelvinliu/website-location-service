'use strict';

import bluebird from 'bluebird';
import fetch from 'node-fetch';
import Random from 'random-js';

// plug bluebird into fetch
fetch.Promise = bluebird;

// setup a random generator
const r = new Random(Random.engines.mt19937().autoSeed());

async function getJSON(url) {
  return await fetch(url).then(res => res.json());
}

let data = getJSON('https://jsonplaceholder.typicode.com/users');
console.log(data.length);
// console.log(data[r.integer(0, data.length - 1)]);

// lambda
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
