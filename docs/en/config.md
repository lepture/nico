# Nico Configuration

----------

Nico supports two formats of configuration, Javascript and JSON. JSON is standard, but Javascript is more flexible.


## Basic

The required fields of nico:

```
{
    "source": "content",
    "output": "_site",
    "permalink": "{{filename}}.html",
    "theme": "_themes/one",
    "writers": [
        "nico.PostWriter",
        "nico.StaticWriter",
        "nico.FileWriter"
    ]
}
```

In Javascript format:

```javascript
exports.source = "content"
exports.output = "_site"
exports.permalink = "{{filename}}.html"

// you can use node library
var path = require('path')
exports.theme = path.join(__dirname, 'one')

exports.writers = [
    'nico.PostWriter',
    'nico.StaticWriter',
    'nico.FileWriter'
]
```

You can set source, output, permalink, theme in the terminal interface, get more help:

```
$ nico build -h
```

## Permalink

Set the permalink style you want. Here are some tips:

```
{{filename}}
{{filename}}.html

{{directory}}/{{filename}}
{{directory}}/{{filename}}.html

{{pubdate.year}}/{{filename}}
{{pubdate.year}}/{{filename}}.html
```

## Writer

Writer is the tool for writing html into your output directory. For example:

- PostWriter will write the post html
- FileWriter will copy files from source to output

Built-in writers:

- nico.PostWriter      - generate a post
- nico.PageWriter      - generate a page
- nico.FileWriter      - copy non-post files
- nico.StaticWriter    - copy static files in theme
- nico.ArchiveWriter   - generate archive
- nico.YearWriter      - generate archive by years
- nico.TagWriter       - generate archive by tags
- nico.TagCloudWriter  - generate tag clound page
- nico.DirectoryWriter - generate archive by direcotories
- nico.FeedWriter      - generate feed


## Cache

For large projects, you would like a cache for fast building. Set a `cachedir` in your config file:

```
cachedir: '.cache'
```

## perpage

Reset number of post on perpage, default is 20.

## post_template

Reset the post template name, default is `post`.

## page_template

Reset the page template name, default is `page`.

## archive_template

Reset the archive template name, default is `archive`.

## archive_output

Reset the archive output, default is `index.html`.

## directory_template

Reset the directory template name, default is `archive`.

## year_template

Reset the year template name, default is `archive`.

## tag_template

Reset the tag template name, default is `archive`.

## feed_template

Reset the feed template name, default is `feed`.

## feed_output

Reset the feed output, default is `feed.xml`.

## process_write

This is a function for processing file write action. Define in your config
file: nico.js

```js
exports.process_write = function(content, filename) {
    if (/\.html$/.test(filename)) {
        return compressHTML(content);
    }
    return content;
}
```

## process_copy

This is a function for procssing file copy action. Define in your config
file: nico.js

```js
exports.process_copy = function(buf, filename) {
    if (/\.css$/.test(filename)) {
        return compressCSS(buf.toString());
    }
    return buf;
}
```
