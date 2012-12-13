# nico 中文文档

-----------

也许你已经安装好了 nico，但是我还是得重复一下。使用 npm 安装 nico 很简单，只需要在终端里输入：

```
$ npm install nico -g
```

注意，一定要有 ``-g`` 哦，这样才能够在终端里调用到 nico。

Windows 用户请注意，安装可能不会一帆风顺，在安装 nico 之前，请确认你的环境：

Windows XP/Vista/7 需要安装：

- Python [2.7.3](http://www.python.org/download/releases/2.7.3#download)
- Microsoft Visual Studio C++ 2010 ([Express version](http://go.microsoft.com/?linkid=9709949))
- 如果你是 64 位的Windows 7，还需要安装 [Windows 7 64-bit SDK](http://www.microsoft.com/en-us/download/details.aspx?id=8279)

Windows 8 需要安装：

- Python [2.7.3](http://www.python.org/download/releases/2.7.3#download)
- Microsoft Visual Studio C++ 2012 for Windows Desktop [Express version](http://go.microsoft.com/?linkid=9816758)

参考 <https://github.com/TooTallNate/node-gyp>


## 用户文档

获取 nico 帮助信息，在终端里输入：

    $ nico -h
    $ nico build -h
    $ nico server -h


### 配置

默认的配置文件是当前目录下的 `nico.js` 或者 `nico.json`，你也可以在命令里指定：

    $ nico build -C some-config.js

配置文件基本如下：

```json
{
    "source": "source directory, default is content",
    "output": "output directory, default is _site",
    "theme": "your theme path",
    "permalink": "permalink style",
    "writers": []
}
```

如果想要更强大的功能，可用 js 做配置文件：

```js
var path = require('path');

exports.source = path.join(__dirname, 'docs');
exports.writers = [
    'nico.PostWriter'
];
```

除了 `writers` 外，其它的必要的配置都可以在命令行里重设：

```
$ nico build -I docs -O _site --theme=_themes/one --permalink={{directory}}/{{filename}}.html
```



### 写作

一篇文章的基本格式：

    # This is title

    - pubdate: 2012-12-12
    - tags: javascript, python
    - meta-key: meta value

    This is the description, description is the part above ----

    ------------------

    content is here.


nico 目前只支持 Markdown，在可见的未来也将只会支持 Markdown。更多内容请参考：

- [Markdown 语法](./syntax)


## 开发者文档


## Bug Report

I keep an issue tracker at [GitHub](https://github.com/lepture/nico/issues),
you can report bugs by [openning a new issue](https://github.com/lepture/nico/issues/new).
If you want any help, please contact <lepture@me.com>, English and Chinese are acceptable.