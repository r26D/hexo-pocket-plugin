
'use strict';
const osmosis = require('osmosis');
const moment = require('moment');
const fs = require('hexo-fs');
const chalk = require('chalk');
const lodash = require('lodash');
const POCKET_URL = "https://getpocket.com/@";

module.exports = function(config, logger) {

    console.log("Hello nurse");
    if (!fs.existsSync('cache')) {
      fs.mkdirsSync('cache');
    }
    var feed_data = [];
    Promise.resolve()
        .then(function() {
            lodash.forEach(config.pocket.feeds, function (feed) {
                const username = feed.username;
                const feed_filename = 'cache/' + username + '.feed.json';
                // var current_feed_data = {};
                // if (fs.existsSync(feed_filename)) {
                //     cached = fs.readFileSync(feed_filename);
                //     current_feed_data = JSON.parse(current_feed_data);
                //
                //
                //     if (timestamp - media.date < 1000 * 60 * 60 ) {
                //       logger.info('hexo-pocket-plugin:', chalk.cyan('Using cached data from Pocket for ' + username));
                //       return media.data;
                //     }
                //     else {
                //       logger.info('hexo-pocket-plugin:', chalk.cyan('Your cached Instagram data is too old. It\'s time to get new data!'));
                //     }
                //   }

                logger.info('hexo-pocket-plugin:', chalk.cyan('Checking on ' + username));
                osmosis
                    .get(POCKET_URL + username)
                    .find("div.sprofile-post")
                    .set({
                        img: ".sprofile-article-img @data-bgimg",
                        link: ".sprofile-article-link @href",
                        title: ".sprofile-article-title",
                        comment: ".sprofile-attribution-comment",
                        posted_on: ".sprofile-post-time"
                    })
                    .data(function (data) {
                        var num_pattern = /\d+/;
                        var number = data.posted_on.match(num_pattern)[0];

                        if (data.posted_on.match("hour")) {
                            data.posted_date = moment().subtract(number, "hours");
                        } else {
                            data.posted_date = moment().subtract(number, "days");
                        }
                        data.username = username;
                        data.author_name = feed.author_name;
                        logger.info('hexo-pocket-plugin:', chalk.cyan(data.title));
                        feed_data.push(data);

                    })


            })
        })
        .then(function() {
            logger.info('hexo-pocket-plugin:', chalk.cyan("Feed Count " + feed_data.length));
        });
// osmosis
//     .get("https://getpocket.com/@harperreed")
//     .find("div.sprofile-post")
//     .set({
//         img: ".sprofile-article-img @data-bgimg",
//         link: ".sprofile-article-link @href",
//         title: ".sprofile-article-title",
//         comment: ".sprofile-attribution-comment",
//         posted_on: ".sprofile-post-time"
//     })
//     .data(function (data) {
//         var num_pattern = /\d+/;
//         var number = data.posted_on.match(num_pattern)[0];
//         console.log("Number is", number);
//         if (data.posted_on.match("hour")) {
//             data.posted_date = moment().subtract(number, "hours");
//         } else {
//             data.posted_date = moment().subtract(number, "days");
//         }
//
//         console.log(data); // Data here would be each search result with the properties that we set above
//     })
//     .log(console.log)
//     .error(console.log)
//     .debug(console.log);

}