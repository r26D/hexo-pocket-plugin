"use strict";
const osmosis = require("osmosis");
const moment = require("moment");
const fs = require("hexo-fs");
const chalk = require("chalk");
const lodash = require("lodash");
const yamljs = require("yamljs");
const hexo_util = require("hexo-util");
const POCKET_URL = "https://getpocket.com/@";

module.exports = function(config, logger) {
  console.log("Hello nurse");
  if (!fs.existsSync("cache")) {
    fs.mkdirsSync("cache");
  }
  var feed_data = [];
  var feed_by_user = {};
  var users = [];
  var timestamp = Date.now();

  Promise.all(
    config.pocket.feeds.map(function(feed) {
      const username = feed.username;

      const feed_filename = "cache/" + username + ".feed.json";
      // var current_feed_data = {};
      logger.info("hexo-pocket-plugin:", chalk.cyan("Checking on " + username));

      if (fs.existsSync(feed_filename)) {
        var current_feed_data = fs.readFileSync(feed_filename);
        current_feed_data = JSON.parse(current_feed_data);

        if (timestamp - current_feed_data.fetched < 1000 * 60 * 60) {
          logger.info(
            "hexo-pocket-plugin:",
            chalk.cyan("Using cached data from Pocket for " + username)
          );
          feed_data = feed_data.concat(current_feed_data.data);
        }
      } else {
        users.push(username);
        return osmosis
          .get(POCKET_URL + username)
          .find("div.sprofile-post")
          .set({
            img: ".sprofile-article-img @data-bgimg",
            link: ".sprofile-article-link @href",
            title: ".sprofile-article-title",
            comment: ".sprofile-attribution-comment",
            posted_on: ".sprofile-post-time"
          })
          .data(function(data) {
            var num_pattern = /\d+/;
            var number = data.posted_on.match(num_pattern)[0];

            if (data.posted_on.match("hour")) {
              data.posted_date = moment().subtract(number, "hours");
            } else {
              data.posted_date = moment().subtract(number, "days");
            }
            data.username = username;
            data.author_name = feed.author_name;
            logger.info(
              "hexo-pocket-plugin:",
              chalk.cyan(data.username + ":" + data.title)
            );
            feed_data.push(data);
            if (!feed_by_user[username]) {
              feed_by_user[username] = [];
            }
            feed_by_user[username].push(data);
          });
      }
    })
  )
    .then(function() {
      logger.info(
        "hexo-pocket-plugin:",
        chalk.magenta("Feed Count " + feed_data.length)
      );
      users.map(function(username) {
        fs.writeFileSync(
          "cache/" + username + ".feed.json",
          JSON.stringify({
            fetched: timestamp,
            data: feed_by_user[username]
          })
        );
      });
    })
    .then(function() {
      feed_data.map(function(item) {
          logger.info(
          "hexo-pocket-plugin:",
          chalk.magenta("Generating "+ item.title)
        );
        var item_filename = "source/_posts/" + hexo_util.slugize(item.title).replace(/[^A-Za-z0-9_-]+/g, "") +".md";

        if (fs.existsSync(item_filename)) {
          logger.info(
            "hexo-pocket-plugin:",
            chalk.grey("Already exists:" + item.title)
          );
        } else {
          // layout	Layout
          // title	Title
          // date	Published date	File created date
          // updated	Updated date	File updated date
          // comments	Enables comment feature for the post	true
          // tags	Tags (Not available for pages)
          // categories	Categories (Not available for pages)
          // permalink	Overrides the default permalink of the post
          var content = [];
          content.push("---");
          content.push("title:" + item.title);
          content.push("author:" + item.author_name);
          content.push("data:" + item.posted_date);
          content.push("tags:");
          content.push(" - recommended reading");
          content.push("categories:");
          content.push(" - recommended reading");
          content.push("---");
          content.push("# Recommended Reading: " + item.title);
          content.push("");
          content.push(item.comment);
          content.push("[!["+ item.title+"]("+ item.img+")]("+ item.link + ")");
          fs.writeFileSync(item_filename, content.join("\n"));
        }
      });
    });
};
