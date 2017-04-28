"use strict";
const osmosis = require("osmosis");
const moment = require("moment");
const fs = require("hexo-fs");
const chalk = require("chalk");
const lodash = require("lodash");

const hexo_util = require("hexo-util");
const POCKET_URL = "https://getpocket.com/@";

module.exports = function(config, logger) {
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
      logger.debug(
        "hexo-pocket-plugin:",
        chalk.cyan("Checking on " + username)
      );

      if (fs.existsSync(feed_filename)) {
        var current_feed_data = fs.readFileSync(feed_filename);
        current_feed_data = JSON.parse(current_feed_data);

        if (timestamp - current_feed_data.fetched < 1000 * 60 * 60) {
          logger.info(
            "hexo-pocket-plugin:",
            chalk.cyan("Using cached data from Pocket for " + username)
          );
          current_feed_data.data.map(function(item) {
            item.posted_date = moment(item.posted_date);
            feed_data.push(item);
          });
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
            if (data.title == "" ||!data.title  ) {
                data.title = "Recent Article";
            }
            data.username = username;
            data.author_name = feed.author_name;
            logger.debug(
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
        var item_filename =
          "source/_posts/" +
          hexo_util.slugize(item.title).replace(/[^A-Za-z0-9_-]+/g, "") +
          ".md";

        if (!config.pocket.override && fs.existsSync(item_filename)) {
          logger.debug(
            "hexo-pocket-plugin:",
            chalk.grey("Already exists:" + item.title)
          );
        } else {
          logger.debug(
            "hexo-pocket-plugin:",
            chalk.magenta("Generating " + item.title)
          );
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
          content.push("title: '"+ config.pocket.title_prefix + item.title.replace(/'/g,"''") +"'");
          content.push("author: " + item.author_name);
          content.push(
            "date: " + item.posted_date.format('"YYYY-MM-DD HH:mm:ss"')
          );
          if (config.pocket.default_tag) {
            content.push("tags: ");
            content.push("  - " + config.pocket.default_tag);
          }
          if (config.pocket.default_category) {
            content.push("categories: ");
            content.push("  - " + config.pocket.default_category);
          }

          content.push("---");
          content.push("");
          content.push(item.comment);
          content.push("");
          /*
                     Writing HTML so we can prevent an image link from being inserted
                      https://github.com/hexojs/hexo/issues/2150 
                     */

          content.push(
            '<a href="' +
              item.link +
              '"  class="fancybox image-link" target="_blank" rel="external">'
          );
          content.push('    <img src="' + item.img + '" >');
          content.push("</a>");
          content.push(
            '<a href="' +
              item.link +
              '"  class="fancybox image-link" target="_blank" rel="external"><h3>Read More..</h3></a>'
          );

          fs.writeFileSync(item_filename, content.join("\n"));
        }
      });
    });
};
