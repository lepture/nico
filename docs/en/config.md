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

var nico = require('nico')
exports.writers = [
    nico.PostWriter,
    nico.StaticWriter,
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

- nico.PostWriter
- nico.FileWriter
- nico.StaticWriter
- nico.YearWriter
- nico.ArchiveWriter
- nico.FeedWriter


## More
