/*
 * reader for nico
 *
 * @author: Hsiaoming Yang <lepture@me.com>
 */

var fs = require('fs')
var util = require('util')
var path = require('path')
var moment = require('moment')
var rs = require('robotskirt')
var highlight = require('highlight.js')


function Post(filepath, root, parser) {
  this.filepath = filepath
  if (root) {
    this.relative_filepath = filepath.replace(root, '').replace(path.sep, '')
  } else {
    this.relative_filepath = filepath
  }
  this.parser = parser || new MarkdownParser()
  this.content = fs.readFileSync(filepath, 'utf8')

  var parsed = parseContent(this.content)
  this.header = parsed.header
  this.body = parsed.body
  this.title = this.meta.title
  return this
}

Object.defineProperty(Post.prototype, 'meta', {
  get: function() {
    return this.parser.meta(this.header)
  }
})

Object.defineProperty(Post.prototype, 'pubdate', {
  set: function(date) {
    this.meta.pubdate = date
  },
  get: function() {
    if (!this.meta.pubdate) return null;
    return moment(this.meta.pubdate)
  }
})

Object.defineProperty(Post.prototype, 'public', {
  get: function() {
    if (this.meta.public === 'false' || this.meta.public === 'no') return false;
    return true;
  }
})
Object.defineProperty(Post.prototype, 'tags', {
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

Object.defineProperty(Post.prototype, 'html', {
  get: function() {
    return this.parser.html(this.body)
  }
})

Object.defineProperty(Post.prototype, 'toc', {
  get: function() {
    return this.parser.toc(this.body)
  }
})

exports.Post = Post

var renderer = new rs.HtmlRenderer([rs.HTML_USE_XHTML])

renderer.blockcode = function(code, language) {
  if (!language || language === '+' || language === '-') {
    return '\n<pre>' + rs.houdini.escapeHTML(code) + '</pre>\n'
  }
  var indicate = language.slice(-1)
  var hide = indicate == '-'
  var inject = indicate == '-' || indicate == '+'
  if (inject) {
    language = language.slice(0, -1)
  }
  var shorts = {
    'js': 'javascript',
    'py': 'python'
  }
  if (language in shorts) {
    language = shorts[language]
  }
  inject = inject && ['javascript', 'css', 'html'].indexOf(language) !== -1
  var html = ''
  if (inject) {
    if (language == 'javascript') {
      html = util.format('\n<script>\n%s</script>\n', code)
    } else if (language == 'css') {
      html = util.format('\n<div class="nico-insert-code">%s</div>\n', code)
    }
  }
  if (hide && inject) {
    return html
  }
  html += highlight.highlight(language, code).value
  return html
}

renderer.header = function(text, level) {
  var id = text.match(/\w+/g).join('-').toLowerCase()
  return util.format('<h%d id="%s">%s</h%d>', level, id, text, level)
}

function MarkdownParser() {
  this.parser = new rs.Markdown(
    renderer,
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
  content = content.replace(/^````(\w+)/gm, '````$1+')
  content = content.replace(/^`````(\w+)/gm, '`````$1-')
  return this.parser.render(content)
}
MarkdownParser.prototype.toc = function(content) {
  return getToc(content)
}

exports.MarkdownParser = MarkdownParser

// helpers

function parseContent(content) {
  var lines = content.split(/\r\n|\r|\n/)
  var header = []
  var body = []
  var recording = true
  lines.forEach(function(line) {
    if (recording && line.slice(0, 3) == '---') {
      recording = false
    } else if (recording) {
      header.push(line)
    } else {
      body.push(line)
    }
  })
  return {header: header.join('\n'), body: body.join('\n')}
}

function getToc(content) {
  var renderer = new rs.HtmlRenderer()
  var toc = []
  renderer.header = function(text, level) {
    var id = text.match(/\w+/g).join('-').toLowerCase()
    toc.push({id: id, text: text, level: level})
    return util.format('<h%d id="%s">%s</h%d>', level, id, text, level)
  }
  var parser = new rs.Markdown(renderer)
  parser.render(content)
  return toc
}
