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

var nico = require('nico')
exports.writers = [
    nico.PostWriter,
    nico.StaticWriter,
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
- nico.DirectoryWriter - 生成目录归档页面
- nico.FeedWriter      - 生成 feed


## More

在配置文件里，除了必要的一些信息外，还可以提供额外的信息。这些额外的信息有些可以给 writer 用，有些可以给主题使用。

所有的配置信息都可以在模板里访问到，比如 ``{{config.source}}``。
