# Nico 主题

------------

想要开发自己的主题？其实很简单。大多数时候，例子会更有帮助，所以去看 [one](https://github.com/lepture/nico-one) 吧。

## 结构

一个主题包含三个部分：主题的信息，模板，静态文件。它的文件目录结构如下：

```
theme-name/
    theme.js             - 主题的信息，其实可以没有
    templates/           - 模板
        post.html
        page.html
        ...
    static/              - 静态文件
        app.css
        jquery.js
        ...
```

## 模板

Nico 使用 swig 做为模板引擎，所以你需要了解一下 swig 的语法。如果你有用过 Django 或者 Jinja，你已经大致了解语法了。更多内容请访问 [swig](http://paularmstrong.github.com/swig/)。

不同的 writer 需要不用的模板，比如 PostWriter 需要 post.html，ArchiveWriter 需要 archive.html。一个完备的主题应该包含：

```
post.html             - PostWriter
page.html             - PageWriter
archive.html          - ArchiveWriter, YearWriter, DirectoryWriter ...
feed.html             - FeedWriter
```

当然，如果你的主题只供自己使用，只需要提供自己所需的模板就可以了。


### Jade

将模板引擎换为 Jade:

```
// nico.json
{
    "engine": "jade"
}
```

你需要额外安装 Jade，并保正 Jade 能被 require。


## 变量

- 全局变量：在所有模板中都可以访问的变量，
- 模板变量：只有在特定的模板中才有的变量，

### system

全局变量，这个是系统变量：

```
{
    "name": "nico",
    "version": "0.1.0",
    "homepage": "http://lab.lepture.com/nico/"
}
```

事实上，这个变量包含了所有 [nico/package.json](https://github.com/lepture/nico/blob/master/package.json) 的信息。

### theme

全局变量，由主题提供，也就是说是由 `theme.js` 暴露出来的变量。

### config

全局变量，这个是用户的配置信息，所有的配置信息都可以通过 config 获取。

### resource

全局变量，用户总共有哪些资源。

### post

模板变量，有 PostWriter 与 PageWriter 渲染的模板有该变量。

### pagination

模板变量，对文章有批量操作的 writer 会有该变量，比如 ArchiveWriter。

## 方法

方法是一些函数，你可以通过配置来新增一些方法。

内置的方法有：

### permalink_url

根据用户配置的 permalink style 来生成文章的链接。比如 `{{permalink_url(post)}}`。

### content_url

用来生成某地址的相对链接，比如当前所在页为 `a/b.html`，在该页面里的 `{{content_url('index.html')}}` 将生成 `../`。

### static_url

同 content_url ，用来生成静态文件的链接。如当前页为 `a/b.html`，那么 `{{static_url('css/a.css')}}` 将生成  `../static/css/a.css`。


## filter

你需要了解 filter 是什么，请先阅读 swig 的文档。代码上来讲，filter 也是一类方法。

你可以通过配置来新增一些 filter。
