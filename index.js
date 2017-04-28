#!/usr/bin/env node
"use strict";
const lodash = require("lodash");
const fetchFeeds = require('./lib/fetchFeeds');
const logger = require('hexo-log')({
    debug: true,
    silent: false
});

const config = hexo.config;

config.pocket = lodash.assign(
    {},
    {
        enabled: false,
        feeds: []
    },
    config.pocket

);

if (config.pocket.enable) {
    fetchFeeds(config, logger);
    hexo.extend.filter.register('after_init', function () {

        return fetchFeeds(config, logger);
    });
}
