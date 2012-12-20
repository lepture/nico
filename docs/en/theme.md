# Nico Theme

------------

It's not that difficult to create a theme, an example tells more, head over to [one](https://github.com/lepture/nico-one), and learn how to write a theme.


## Structure

A theme contains three parts: theme information, templates and static. The structure:

```
theme-name/
    theme.js                 - theme information
    templates/
        post.html
        page.html
        ...
    static/
        app.css
        jquery.js
        ...
```


## Templates

Swig is the template engine used by nico, if you want to create your own theme, you need some acknowledge of swig. However, if you know Django and Jinja, it will help. Get more information at [swig](http://paularmstrong.github.com/swig/).

Every writer need a template, they may share a same template:

```
post.html             - PostWriter
page.html             - PageWriter
archive.html          - ArchiveWriter, YearWriter, DirectoryWriter ...
feed.html             - FeedWriter
```

## Variables

- Global variable: you can access global variable in every template
- Template variable: you can only access template variable in the specified template


### system

Global variable. This describe the system information of nico.

```
{
    "name": "nico",
    "version": "0.1.0",
    "homepage": "http://lab.lepture.com/nico/"
}
```

Actually, it contains every field in [nico/package.json](https://github.com/lepture/nico/blob/master/package.json).

### theme

Global variable. This describe the theme information. It contains every information in `theme.js`.

### config

Global variable. Every information in the config file.

### resource

Global variable. It's hard to explain.

### post

### pagination


## Functions


Built-in functions:

### permalink_url

`{{permalink_url(post)}}`

### content_url

`{{content_url('index.html')}}`

### static_url

`{{static_url('css/a.css')}}`


## filter

