# Documentation of Nico

Good to know you are here.

-----------------

Nico is built on nodejs, which means you have to install nodejs. I believe you have installed nodejs, but I'd like to repeat this part.

You can download the package on [nodejs.org](http://nodejs.org) or through a package manager like apt-get and homebrew.


## Installation

Install nico is simple with npm:

```
$ npm install nico -g
```

Please install it with ``-g`` option, otherwise you can't use it in command line.

If you want a live reload feature, you have to install socket.io by yourself:

```
$ npm install socket.io -g
```


## Theme

Nico didn't provide a default theme, and it will not provide a default theme in the foreseen future. But I wrote a theme for you, which is [one](https://github.com/lepture/nico-one). You can learn how to write your own theme with one.

Let's grab the theme:

    $ git clone git://github.com/lepture/nico-one.git _themes/one

<a class="button" href="./theme">Read More</a>


## Configure

Nico can't work well without a configuration. Let's create a `nico.json`:


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


## Writing

It's the time for us to write something:

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

And we will edit `content/hello-world.md`:

```
# Hello Nico

- pubdate: 2012-12-12

------

Hello World, Hello Nico.
```

Run the command in the terminal:

```
$ nico build
```

It will create a folder `_site` in the current working directory, and there will be an article `hello-world.html`.

Learn more about `nico` in terminal:

```
$ nico -h
$ nico build -h
$ nico server -h
```

<a class="button" href="./syntax">Read More</a>


## Developer Guide

Actually the code of nico is easy to understand.


## Bug Report

I keep an issue tracker at [GitHub](https://github.com/lepture/nico/issues),
you can report bugs by [openning a new issue](https://github.com/lepture/nico/issues/new).
If you want any help, please contact <me@lepture.com>, English and Chinese are acceptable.
