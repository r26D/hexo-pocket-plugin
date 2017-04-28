#  Hexo Pocket Plugin

I use [Pocket](https://getpocket.com/) to save and read articles.  Pocket 
allows you to recommend an article to people who follow you. I wanted to be able
to recommend articles in Pocket and have them show up as "Recommended Reading" in
my blog. 

This plugin can be configured to parse the public recommendation feed for a user. It will 
automatically create a blog post for that recommendation if one does not already exist.

## How to Configure
```
pocket:
  enable: true
  title_prefix: "Recomended Reading: "
  default_tag: "recommended reading"
  default_category: "Recommended Reading"
  feeds:
    - username:
      author_name:
      layout:
    - username:
      author_name:
      layout:
```


## Special Shout Out

I have to give special thanks to [Hexo Instagram Wall](https://github.com/rdgpt/hexo-instagram-wall) plugin.
This is the first hexo plugin I've ever used, and the Instagram plugin served as a great guide
on how to make this work.