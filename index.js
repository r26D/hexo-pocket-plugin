#!/usr/bin/env node
"use strict";
const lodash = require("lodash");
const fetchFeeds = require('./lib/fetchFeeds');
const logger = require('hexo-log')({
  debug: true,
  silent: false
});
//https://getpocket.com/@belmendo
//https://getpocket.com/@economysizegeek
//https://getpocket.com/@harperreed

var config = {};
config.pocket = lodash.assign(
    {},
    {
        enable: true,
        feeds: [
            {
                username: "belmendo",
                author_name: "Brett Elmendorf"
            },
            {
                username: "economysizegeek",
                author_name: "Dirk Elmendorf"
            },
            {
                username: "harperread",
                author_name: "Harper Reed"
            }
        ]
    }
);

if (config.pocket.enable) {
    fetchFeeds(config, logger);
    // hexo.extend.filter.register('after_init', function() {
    //
    //   return fetchFeeds(config, logger);
    // });
    // hexo.extend.filter.register('after_render:html', function(str, data) {
    //
    //
    //   return generateAssets(str, data, config, logger);
    // });

}
