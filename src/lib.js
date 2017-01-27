'use strict';

import qs from 'querystring';
import AWS from 'aws-sdk';
import BbPromise from 'bluebird';
import bfj from 'bfj';
import fetch from 'node-fetch';

// plug bluebird
AWS.config.setPromisesDependency(Promise);
fetch.Promise = BbPromise;

// constants
export const GEONAMES_URL = 'http://api.geonames.org/findNearbyPlaceNameJSON';
export const GEONAMES_USER = 'kelvinliu';
export const LOCATION_TABLE = (process.env.IS_OFFLINE)
  ? 'locations'
  : process.env.LOCATION_TABLE;
export const UPDATE_USER = process.env.UPDATE_USER;

// functions
// returns whether obj contains k
export const contains = (obj, k) => typeof obj[k] !== 'undefined';
// returns a simple response object
export const createResponse = async (statusCode, message) =>
  bfj.stringify({ message })
    .then(body => ({
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': process.env.DOMAIN,
        'Access-Control-Allow-Credentials': true
      },
      body
    }));
// returns an dynamodb document client
export const dynamoClient = () => new AWS.DynamoDB.DocumentClient(
  (process.env.IS_OFFLINE)
    ? { region: 'localhost', endpoint: 'http://localhost:8000' }
    : {}
);
// throws an error with an http status code
export const httpError = (code, msg) => {
  let err = new Error(`[${code}] ${msg}`);
  err.status = code;
  throw err;
};
// returns json from a given url and query
export const getJSON = async (u, q) =>
  fetch([u, qs.stringify(q)].join('?')).then(res => res.json());
// returns whether obj is empty
export const isEmpty = obj => {
  for (const k in obj)
    if (contains(obj, k))
      return false;
  return true;
};
// a logger that only logs in non-test environments
export const logger = {
  info(...args) {
    if (!process.env.IS_TEST) console.info(...args);
  },
  error(...args) {
    if (!process.env.IS_TEST) console.error(...args);
  }
};
