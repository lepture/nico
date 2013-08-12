# nico 中文文档

-----------

Nico 是基于 nodejs 的静态站点生成工具。所以在安装 nico 之前，你需要安装 node。通常来说，你应该已经安装好了 node，不过这里还是重复一下。

你可以在 [nodejs.org](http://nodejs.org/) 下载安装包安装，也可以通过包管理器（比如在 Mac 上用 homebrew，同时推荐在 Mac 上用 homebrew）。


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
$ git clone git://github.com/lepture/nico-one.git _themes/one
```

<a class="button" href="./theme">Read More</a>


## 配置

你需要一份配置文件来让 nico 正常工作。在当前目录下新建一个 ``nico.json`` 文件：

```
{
    "source": "content",
    "output": "_site",
    "theme": "_themes/one",
    "permalink": "{{directory}}/{{filename}}.html",
    "writers": [
        "nico.PostWriter",
        "nico.FileWriter",
        "nico.StaticWriter"
    ]
}
```

<a class="button" href="./config">Read More</a>


## 写作

我们来试着写一篇文章，假设你的目录结构如下：

```
nico.json
content/
  hello-world.md
_themes/
  one/
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
$ nico build
```

这时可以看到在当前目录下生成了一个 ``_site`` 文件夹，里面有一篇 ``hello-world.html`` 的文章。

了解终端里的命令：

```
$ nico -h
$ nico build -h
$ nico server -h
```

<a class="button" href="./syntax">Read More</a>


## 开发者文档

你是开发者，你对 nico 这个程序感兴趣，想要为 nico 做点贡献，请先阅读 [Contributing Guide](https://github.com/lepture/nico/blob/master/CONTRIBUTING.md)。

首先请试着阅读源码，如果觉得有困难，可参考 [开发篇](./contribute) 获得指引。

## Bug Report

I keep an issue tracker at [GitHub](https://github.com/lepture/nico/issues),
you can report bugs by [openning a new issue](https://github.com/lepture/nico/issues/new).
If you want any help, please contact <me@lepture.com>, English and Chinese are acceptable.
