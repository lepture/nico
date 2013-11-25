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

Swig is the default engine used by nico, if you want to create your own theme, you need some acknowledge of swig. However, if you know Django and Jinja, it will help. Get more information at [swig](http://paularmstrong.github.com/swig/).

Every writer need a template, they may share a same template:

```
post.html             - PostWriter
page.html             - PageWriter
archive.html          - ArchiveWriter, YearWriter, DirectoryWriter ...
feed.html             - FeedWriter
```

### Jade

Change template engine to jade:

```
// nico.json
{
    "engine": "jade"
}
```

Make sure `jade` can be required. If you have set a `NODE_PATH` and jade is installed global, it can be required. You can also install jade in the current directory.

Try jade:

```
$ node
```

```
> require('jade')
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

Global variable. Every information in the config file (`nico.json`).


### resource

Global variable. The resource we have. It contains:

- resource.posts: all posts we have. (use `read` filter to get the full post)
- resource.pages: all pages we have. (use `read` filter to get the full page)


### post

Template variable. Available in `post.html`, and `page.html`.

A post is an object with these information:

- post.title: title of the post
- post.meta: meta information you defined
- post.pubdate: (available for `post.html`), the publish date
- post.tags: tags of the post
- post.html: rendered html of the post
- post.directory: directory of the post
- post.status: status of the post. (public, draft, secret, etc..)
- post.toc: tabe of content of the post

You can get every raw data from `post.meta` that you defined.

### pagination

Template Variable. Available in `archive.html`.

- pagination.page: current page of the pagination
- pagination.pages: total pages the pagination has
- pagination.perpage: count of post that perpage has
- pagination.total_items: all the items
- pagination.total: total count of the pagination
- pagination.items: items for current page
- pagination.has_prev: has a previous page?
- pagination.prev_num: previous page number
- pagination.has_next: has a next page?
- pagination.next_num: next page number
- pagination.iter_pages: iter pages of the pagination


**NOTICE**

The item in `pagination.items` is not a full post, you should use `read` filter to get the rendered html.


## Functions


Built-in functions:

### permalink_url (alias: relative_url)

Create permalink of a post. This permalink is a relative url.

`{{permalink_url(post)}}`

### absolute_url

`{{absolute_url(post)}}`

An absolute url of the post, you can expand it with site url:

`{{absolute_url(config.siteurl, post)}}`

### content_url

`{{content_url('index.html')}}`

### static_url

`{{static_url('css/a.css')}}`


## filter

The built in filters of nico:

### xmldatetime

Generate a `ISOString` of the Date.

### markdown

Render the raw text to html with markdown.

### highlight

Highlight a code block with specified language.

### read

Read is designed for `pagination.items`, to fulfill the post.

### sortby

Sort items by a key. For example:

```
{{ items|sortby('pubdate') }}

// reverse sort
{{ items|sortby('-pubdate') }}
```
