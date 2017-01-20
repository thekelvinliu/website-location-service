'use strict';

import qs from 'querystring';
import bluebird from 'bluebird';
import fetch from 'node-fetch';
// make fetch use bluebird promises
fetch.Promise = bluebird;

// constants
export const GEONAMES_URL = 'http://api.geonames.org/findNearbyPlaceNameJSON';
export const GEONAMES_USER = 'kelvinliu';

// functions
// returns whether obj contains k
export const contains = (obj, k) => typeof obj[k] !== 'undefined';
// returns a string error message
export const errStr = (code, str) => `[${code}] ${str}`;
// returns json from a given url and query
export const getJSON = async (u, q) => fetch([u, qs.stringify(q)].join('?'))
  .then(res => res.json());
// returns whether obj is empty
export const isEmpty = obj => {
  for (const k in obj)
    if (contains(obj, k))
      return false;
  return true;
};
