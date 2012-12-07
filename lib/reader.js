/*
 * reader for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs')
var util = require('util')
var moment = require('moment')
var rs = require('robotskirt')
var highlight = require('highlight.js')


function Post(filepath, parser) {
  this.filepath = filepath
  this.parser = parser || new MarkdownParser()
  this.content = fs.readFileSync(filepath, 'utf8')

  var parsed = parseContent(content)
  this.header = parsed.header
  this.body = parsed.body
  this.title = this.meta.title
}

Object.defineProperty(Post, 'meta', {
  get: function() {
    this.parser.meta(this.header)
  }
})

Object.defineProperty(Post, 'pubdate', {
  set: function(date) {
    this.meta.pubdate = date
  },
  get: function() {
    if (!this.meta.pubdate) return null;
    return moment(this.meta.pubdate)
  }
})

Object.defineProperty(Post, 'public', {
  get: function() {
    if (this.meta.public === 'false' || this.meta.public === 'no') return false;
    return true;
  }
})
Object.defineProperty(Post, 'tags', {
  get: function() {
    if (!this.meta.tags) return [];
    var ret = []
    var tags = this.meta.tags.split(',')
    tags.forEach(function(tag) {
      ret.push(tag.trim())
    })
    return ret
  }
})

Object.defineProperty(Post, 'html', {
  get: function() {
    return this.parser.render(this.body).html
  }
})

exports.Post = Post

var lightRender = new rs.HtmlRenderer([rs.HTML_USE_XHTML])
lightRender.tableOfContent = []

lightRender.blockcode = function(code, language) {
  if (!language) {
    return '\n<pre>' + rs.houdini.escapeHTML(code) + '</pre>\n'
  }
  var shorts = {
    'js': 'javascript',
    'py': 'python'
  }
  if (language in shorts) {
    language = shorts[language]
  }
  return highlight.highlight(language, code).value
}

lightRender.header = function(text, level) {
  var id = text.match(/\w+/g).join('-')
  lightRender.tableOfContent.push({id: id, text: text, level: level})
  return util.format('<h%d id="%s">%s</h%d>', level, id, text, level)
}

function MarkdownParser() {
  this.render = lightRender
  this.parser = new rs.Markdown(
    this.render,
    [
      rs.EXT_FENCED_CODE, rs.EXT_TABLES,
      rs.EXT_AUTOLINK, rs.EXT_NO_INTRA_EMPHASIS,
      rs.EXT_STRIKETHROUGH
    ]
  )
}

MarkdownParser.prototype.meta = function(content) {
  var parser = new rs.Markdown(new rs.HtmlRenderer())
  var html = parser.render(content)
  var m = html.match(/<h1>(.*?)<\/h1>/)
  var meta = {}
  if (!m) {
    meta.title = null
  } else {
    meta.title = m[1]
  }
  var items = html.match(/<li>(.*?)<\/li>/g)
  var items = []
  var regex = /<li>(.*?)<\/li>/g
  var match = regex.exec(html)
  while (match) {
    items.push(match[1])
    match = regex.exec(html)
  }
  if (items) {
    items.forEach(function(item) {
      var splits = item.split(':')
      var key = splits[0].trim()
      var value = splits.slice(1).join(':').trim()
      meta[key] = value
    })
  }
  var items = html.match(/<p>(.*?)<\/p>/g)
  if (items) {
    meta.description = items.join('\n')
  }
  return meta
}
MarkdownParser.prototype.html = function(content) {
  return this.parser.render(content)
}
MarkdownParser.prototype.toc = function(content) {
  this.parser.render(content)
  return this.render.tableOfContent
}

exports.MarkdownParser = MarkdownParser

// helpers

function parseContent(content) {
  var lines = content.split(/\r\n|\r\n/)
  var header = []
  var body = []
  var recording = true
  lines.forEach(function(line) {
    if (recording && line.indexOf('---') === 0) {
      recording = false
    } else if (recording) {
      header.push(line)
    } else {
      body.push(line)
    }
  })
  return {header: header.join('\n'), body: body.join('\n')}
}
