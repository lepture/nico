# Nico 设置

----------

Nico 支持两种格式的配置文件：javascript 和 json。使用 json 格式的配置文件更标准，使用 javascript 格式的配置文件更灵活。


## Basic

Nico 所需要的设置并不多，基本的设置如下：

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

如果使用 javascript 做格式的话：

```javascript
exports.source = "content"
exports.output = "_site"
exports.permalink = "{{filename}}.html"

// 你可以使用 nodejs 的库哦
var path = require('path')
exports.theme = path.join(__dirname, 'one')

exports.writers = [
    'nico.PostWriter',
    'nico.StaticWriter',
    'nico.FileWriter'
]
```

如上所示的配置中， source, output, permalink, theme 都可以在命令行里重新指定，具体可查看：

```
$ nico build -h
```

## Permalink

permalink 是指你期望的链接格式，下面举一些常用的例子：

```
{{filename}}
{{filename}}.html

{{directory}}/{{filename}}
{{directory}}/{{filename}}.html

{{pubdate.year}}/{{filename}}
{{pubdate.year}}/{{filename}}.html
```

## Writer

Writer 是用来将内容写入 output 的，比如 PostWriter 用来生成文章页面，FileWriter 将文件从 source 中复制到 output 中。

内置的 Writer：

- nico.PostWriter      - 生成有发布时间的文章
- nico.PageWriter      - 生成无发布时间的页面
- nico.FileWriter      - 复制非文章类文件
- nico.StaticWriter    - 复制主题的静态文件
- nico.ArchiveWriter   - 生成归档页面
- nico.YearWriter      - 生成年份归档页面
- nico.TagWriter       - 生成 tag 归档页面
- nico.TagCloudWriter  - 生成 tag clound 页面
- nico.DirectoryWriter - 生成目录归档页面
- nico.FeedWriter      - 生成 feed


## 缓存

对于文章很多的人来说，设置一个缓存可以加快编译的速度。你可以在配置文件中设置：

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

## More

在配置文件里，除了必要的一些信息外，还可以提供额外的信息。这些额外的信息有些可以给 writer 用，有些可以给主题使用。

所有的配置信息都可以在模板里访问到，比如 ``{{config.source}}``。
