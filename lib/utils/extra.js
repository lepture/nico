var colorful = require('colorful');
exports.logging = new colorful.Logging();


function Pagination(items, page, per_page) {
  this.total_items = items;
  this.page = page;
  this.per_page = per_page;
}
Pagination.prototype.iter_pages = function(edge) {
  edge = edge || 4;
  if (this.page <= edge) {
    return _.range(1, Math.min(this.pages, 2 * edge + 1) + 1);
  }
  if (self.page + edge > this.pages) {
    return _.range(Math.max(this.pages - 2 * edge, 1), this.pages + 1);
  }
  return _.range(this.page - edge, Math.min(this.pages, this.page + edge) + 1);
};
Object.defineProperty(Pagination.prototype, 'total', {
  get: function() {
    return this.total_items.length;
  }
});
Object.defineProperty(Pagination.prototype, 'pages', {
  get: function() {
    return parseInt((this.total - 1) / this.per_page, 10) + 1;
  }
});
Object.defineProperty(Pagination.prototype, 'has_prev', {
  get: function() {
    return this.page > 1;
  }
});
Object.defineProperty(Pagination.prototype, 'prev_num', {
  get: function() {
    return this.page - 1;
  }
});
Object.defineProperty(Pagination.prototype, 'has_next', {
  get: function() {
    return this.page < this.pages;
  }
});
Object.defineProperty(Pagination.prototype, 'next_num', {
  get: function() {
    return this.page + 1;
  }
});
Object.defineProperty(Pagination.prototype, 'items', {
  get: function() {
    var start = (this.page - 1) * this.per_page;
    var end = this.page * this.per_page;
    var ret = this.total_items.slice(start, end);
    return ret;
  }
});
exports.Pagination = Pagination;
