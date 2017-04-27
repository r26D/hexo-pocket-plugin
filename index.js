#!/usr/bin/node

var osmosis = require('osmosis');
var moment = require('moment');

//https://getpocket.com/@belmendo
//https://getpocket.com/@economysizegeek
//https://getpocket.com/@harperreed
osmosis
.get('https://getpocket.com/@harperreed')
.find("div.sprofile-post")
.set( {
  'img': ".sprofile-article-img @data-bgimg",
  'link': '.sprofile-article-link @href',
  'title': ".sprofile-article-title",
  'comment': ".sprofile-attribution-comment",
  'posted_on': ".sprofile-post-time"
})
.data(function(data) {
   var num_pattern =/\d+/;
   var number = data.posted_on.match(num_pattern)[0];
   console.log("Number is",number);
    if (data.posted_on.match("hour")) {
      data.posted_date = moment().subtract(number, "hours");
    }
    else {
      data.posted_date = moment().subtract(number, "days");
    }

       console.log(data);      // Data here would be each search result with the properties that we set above
})
.log(console.log)
.error(console.log)
.debug(console.log)
