# nico 中文文档

-----------

Nico 是基于 nodejs 的静态站点生成工具。所以在安装 nico 之前，你需要安装 node。通常来说，你应该已经安装好了 node，不过这里还是重复一下。

你可以在 [nodejs.org](http://nodejs.org/) 下载安装包安装，也可以通过包管理器（比如在 Mac 上用 homebrew，同时推荐在 Mac 上用 homebrew）。

Windows XP/Vista/7 还需要安装：

- Python [2.7.3](http://www.python.org/download/releases/2.7.3#download)
- Microsoft Visual Studio C++ 2010 ([Express version](http://go.microsoft.com/?linkid=9709949))
- 如果你是 64 位的Windows 7，还需要安装 [Windows 7 64-bit SDK](http://www.microsoft.com/en-us/download/details.aspx?id=8279)

Windows 8 还需要安装：

- Python [2.7.3](http://www.python.org/download/releases/2.7.3#download)
- Microsoft Visual Studio C++ 2012 for Windows Desktop [Express version](http://go.microsoft.com/?linkid=9816758)

参考 <https://github.com/TooTallNate/node-gyp>

安装完成后也许还需要设置环境变量 NODE_PATH，Linux & Mac 用户在自己的 shell 配置文件(.bash_profile | .bashrc | .zshrc)里设置，如

```
export NODE_PATH="/usr/local/share/npm/lib/node_modules"
```

具体的地址可能不是如上所示，请根据实际情况自行处理。另外也许还需要设置 PATH：

```
export PATH="$PATH:/usr/local/share/npm/bin"
```

Windows 用户也需要设置环境变量 NODE_PATH（如不知道在哪里设置，请自行[搜索](https://www.google.com/search?q=windows+%E8%AE%BE%E7%BD%AE%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)），一般来说设置为：

```
NODE_PATH = C:\Users\{{username}}\AppData\Roaming\npm\node_modules
```


## 安装

你已经安装好了 node，使用 node 提供的包管理工具 npm 来安装 nico 很简单，只需要在终端里输入：

```
$ npm install nico -g
```

注意，一定要有 ``-g`` 哦，这样才能够在终端里调用到 nico。

另外，如果安装了 `socket.io` 的话，`nico server` 将会有 `live reload` 功能。


## 主题

Nico 没有提供内置的主题，在可见的未来也不会内置主题，但是我已经为你写好了一个主题  [one](https://github.com/lepture/nico-one)，在你还不会自己写主题时，你可以暂时使用 one 做为你的主题。另外说明一下，你所访问的这个站点就是用的 one。

我们先下载这个主题：

```
$ git clone git://github.com/lepture/nico-one.git
```

关于如何制作自己的主题，请参考 [主题篇](./theme)。

## 写作

我们来试着写一篇文章，假设你的目录结构如下：

```
content/
  hello-world.md
nico-one
  templates/
  static/
  ...
```

我们来编写 `content/hello-world.md`：

```
# Hello Nico

- pubdate: 2012-12-12

------

Hello World, Hello Nico.
```

在终端里运行：

```
$ nico build --source=content --output=_site --theme=nico-one
```

这时可以看到在当前目录下生成了一个 ``_site`` 文件夹，里面有一篇 ``hello-world.html`` 的文章。

了解终端里的命令：

```
$ nico -h
$ nico build -h
$ nico server -h
```

了解更多文章格式的内容，请参考 [写作篇](./syntax)。

## 配置

上面生成出的内容远远不够用，这个时候你需要一份配置文件来让 nico 正常工作。在当前目录下新建一个 ``nico.json`` 文件：

```
{
    "source": "content",
    "output": "_site",
    "theme": "nico-one",
    "permalink": "{{directory}}/{{filename}}.html",
    "writers": [
        "nico.PostWriter",
        "nico.FileWriter",
        "nico.StaticWriter"
    ]
}
```

这时我们再在终端里执行：

```
$ nico build
```

你可以用浏览器打开生成出来的 ``_site/hello-world.html`` 看看生成后的效果。

更多关于配置文件的信息，请参考 [配置篇](./config)。


## 开发者文档

你是开发者，你对 nico 这个程序感兴趣，想要为 nico 做点贡献，请先阅读 [Contributing Guide](https://github.com/lepture/nico/blob/master/CONTRIBUTING.md)。

首先请试着阅读源码，如果觉得有困难，可参考 [开发篇](./contribute) 获得指引。

## Bug Report

I keep an issue tracker at [GitHub](https://github.com/lepture/nico/issues),
you can report bugs by [openning a new issue](https://github.com/lepture/nico/issues/new).
If you want any help, please contact <lepture@me.com>, English and Chinese are acceptable.
