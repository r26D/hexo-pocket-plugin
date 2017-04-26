#!/usr/bin/node

var osmosis = require('osmosis');

//https://getpocket.com/@belmendo
osmosis
.get('https://getpocket.com/@economysizegeek')
.find("div.sprofile-post")
.set( {
  'img': ".sprofile-article-img @data-bgimg",
  'link': '.sprofile-article-link @href',
  'title': ".sprofile-article-title"
})
.data(function(data) {
       console.log(data);      // Data here would be each search result with the properties that we set above
})
.log(console.log)
.error(console.log)
.debug(console.log)
