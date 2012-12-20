# Nico Syntax

-----

The nico markup is borrowed from [liquidluck](https://github.com/lepture/liquidluck), it's simple and elegant, even without nico, it can render pretty well.


## Article Syntax

Here is a simple example:

```
# title

- pubdate: 2012-12-12 12:00
- tags: nico, javascript

This is a simple description, it's not required.

----------------

entry content is below ----, it supports markdown syntax.
```

An article contains four part, which are title, meta, description and content. Title and content are required, others are not.


### Meta Data

Meta data is important, it makes article meaningful. Take `pubdate` as an example, an article with `pubdate` is **POST**, otherwise, it's **PAGE**. A post is rendered by PostWriter, and page is render by PageWriter.

Built-in supported meta data:

- pubdate: the time when the article is published
- tags: just tags, it will turn into Array
- status: status of an article, default is public, other choices are secret and draft
- template: the template that will render the article, post use post.html as default, page use page.html

You can access meta data in theme templates with something like `{{post.pubdate}}`.

Want define more meta data? It's easy:

```
- topic: nico
```

But you need to get the meta data in theme templates with `{{post.meta.topic}}`.


## Markdown Basic Syntax

If you are not familiar with Markdown,  you should spend 15 minutes and go over the excellent [Markdown Syntax Guide](http://daringfireball.net/projects/markdown/syntax) at Daring Fireball. Here is a brief.

### Strong and Emphasize

```
*emphasize*    **strong**
_emphasize_    __strong__
```

### Links and Email

Inline links:

```
[link text](http://url.com/ "title")
[link text](http://url.com/)
<http://url.com>
```

Reference-style links:

```
[link text][id]

    [id]: http://url.com "title"
```

Email:

```
<example@email.com>
```

### Images

Inline images:

```
![alt text](http://path/to/img.jpg "title")
![alt text](http://path/to/img.jpg)
```

Reference-style links:

```
![alt text][id]

    [id]: http://path/to/img.jpg "title"
```

### Headers

```
# h1
## h2
### h3
…
```

```
# h1 #
## h2 ##
…
```

### Lists

Ordered list:

```
1. foo
2. bar
```

Unordered list:

```
* foo
* bar
```

```
- foo
- bar
```

### Blockquotes

```
> blockquote
> > nested blockquote
> ### h3 in blockquote
```

### Inline Code

```
`code` span
```

### Block Code

Indent at least 4 spaces or 1 tab.

```
This is a normal paragraph

    this is code block
```

## Markdown Extra Syntax

Extra syntax is powered by nico.

### Fenced Code

    ```
    this is a code block
    ```

### Fenced Code with Highlight

    ```javascript
    var foo = "bar";
    ```

### Highlight Code with Inserted Code

    ````javascript
    var foo = "bar";
    ````

### Just insert code

    `````javascript
    var foo = "bar";
    `````

### Iframe support

Iframe will be render by the template `iframe.html`

    ````iframe
    This will be an iframe
    ````

    ````iframe:400
    This iframe with 400px height
    ````

Wow, you can see, nico is really friendly to front-end developers.
