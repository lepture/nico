# Nico 语法


--------

Nico 的语法简洁优雅，继承自 [liquidluck](https://github.com/lepture/liquidluck)。充分利用 Markdown 的语法，保证即使离开文档生成工具，该文章依然能优雅的渲染。

## 文章格式

先看一个例子，我们将以下面的例子讲解文章格式：

```
# 标题

- pubdate: 2012-12-12 12:00
- tags: nico, javascript

这里是一段简介，当然也可以不要。

----------------

中划线以下是文章正文。支持 Markdown 基本语法与扩展语法。
```

上面的例子里说明了一篇文章的四个要素：标题、元信息、简介和正文。其中标题与正文是必须要有的，元信息的不同会导致文章的属性不同。

### 元信息

文章的元信息将会影响文章的属性，比如 `pubdate`，如果没有这个元信息，这篇文章将会被当作 page 而不是 post 处理。page 的文章是由 PageWriter 生成的，post 的文章是由 PostWriter 生成的。

下面列举内置支持的元信息：

- pubdate: 文章的发布时间。（主题编写请注意：将会被转化为 moment 对象）
- tags: 文章标签。（将会被转化为 Array）
- status: 文章的状态（public, secret, draft，默认为 public）
- template: 文章用什么模板来渲染，post 类文章默认为 post.html，page 类文章默认为 page.html

上面内置支持的元信息，在主题编写中，可直接访问，如 ``{{post.pubdate}}``。除了内置支持的元信息，你还可以自己扩展，比如：

```
- topic: nico
```

这时，在主题中必须使用 ``{{post.meta.topic}}`` 才能获得该信息。


## Markdown 基本语法

如果你对 Markdown 还不太了解的话，你应该先花几分钟看看 [Markdown Syntax Guide](http://daringfireball.net/projects/markdown/syntax)。也可以看下面的语法简介。

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


    [link text][id]

    [id]: http://url.com "title"


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


    ![alt text][id]

    [id]: http://path/to/img.jpg "title"


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

## Markdown 扩展语法

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

充分利用扩展语法，你可以直接使用 Markdown 来写 DEMO，例如 [arale](http://aralejs.org) 就是使用 Markdown 来生成 DEMO 的。
