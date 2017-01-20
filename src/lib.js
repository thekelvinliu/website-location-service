'use strict';

import qs from 'querystring';
import bluebird from 'bluebird';
import fetch from 'node-fetch';
// make fetch use bluebird promises
fetch.Promise = bluebird;

// constants
export const GEONAMES_URL = 'http://api.geonames.org/findNearbyPlaceNameJSON';
export const GEONAMES_QUERY = {
  username: 'kelvinliu',
  lat: 0,
  lng: 0
};

// functions
// returns whether obj contains k
export const contains = (obj, k) => typeof obj[k] !== 'undefined';
// returns json from a given url and query
export const getJSON = async (u, q) => fetch([u, qs.stringify(q)].join('?'))
  .then(res => res.json())
  .catch(err => {
    console.err(err);
  });
