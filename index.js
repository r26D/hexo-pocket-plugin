"use strict";
const lodash = require("lodash");
const fetchFeeds = require("./lib/fetchFeeds");
const chalk = require("chalk");
const logger = require("hexo-log")({
  debug: false,
  silent: false
});

const config = hexo.config;

config.pocket = lodash.assign(
  {},
  {
    enabled: false,
    override: false,
    title_prefix: "Recommended Reading - ",
    default_tag: "recommended reading",
    default_category: "Recommended Reading",
    feeds: []
  },
  config.pocket
);

if (config.pocket.enable) {
  fetchFeeds(config, logger);
  hexo.extend.filter.register("after_init", function() {
    logger.info("hexo-pocket-plugin:", chalk.magenta("Handling Pocket Feeds"));
    return fetchFeeds(config, logger);
  });
}
