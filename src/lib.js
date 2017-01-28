'use strict';

import qs from 'querystring';
import AWS from 'aws-sdk';
import BbPromise from 'bluebird';
import fetch from 'node-fetch';
import jprom from 'json-promise';

// plug bluebird
AWS.config.setPromisesDependency(BbPromise);
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
export const getJSON = (u, q) =>
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
    if (!process.env.IS_TEST || process.env.DEBUG) console.info(...args);
  },
  error(...args) {
    if (!process.env.IS_TEST || process.env.DEBUG) console.error(...args);
  }
};
// returns a simple response object
export const response = (code, msg, { headers } = { headers: {} }) =>
  jprom.stringify({ message: msg })
    .then(body => ({
      statusCode: code,
      body
    }))
    .then(res => {
      const host = headers.Host || '';
      const validHost = [process.env.DOMAIN, 'ngrok.io', 'localhost']
        .map(str => host.indexOf(str))
        .some(val => val !== -1);
      if (validHost)
        res.headers = {
          'Access-Control-Allow-Origin': ['http://', 'https://']
            .map(protocol => `${protocol}${headers.Host}`)
            .join(' '),
          'Access-Control-Allow-Credentials': true
        };
      return res;
    })
    .catch(err => {
      logger.error(err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err.message })
      };
    });
