# Underscore.js

- version: 1.4.3
- canonical: http://underscorejs.org/
- writer: ./lib/writers/contrib.ApiWriter

![Underscore.js](http://underscorejs.org/docs/images/underscore.png)

------------

[Underscore](http://github.com/documentcloud/underscore/) is a utility-belt library for JavaScript that provides a lot of the functional programming support that you would expect in [Prototype.js](http://prototypejs.org/doc/latest/) (or [Ruby](http://www.ruby-doc.org/core/classes/Enumerable.html)), but without extending any of the built-in JavaScript objects. It's the tie to go along with [jQuery](http://docs.jquery.com/)'s tux, and [Backbone.js](http://backbonejs.org/)'s suspenders.

Underscore provides 80-odd functions that support both the usual functional suspects: **map**, **select**, **invoke** — as well as more specialized helpers: function binding, javascript templating, deep equality testing, and so on. It delegates to built-in functions, if present, so modern browsers will use the native implementations of **forEach**, **map**, **reduce**, **filter**, **every**, **some** and **indexOf**.

A complete [Test & Benchmark Suite](http://underscorejs.org/test/) is included for your perusal.

You may also read through the annotated source code.

The project is [hosted on GitHub](http://github.com/documentcloud/underscore/). You can report bugs and discuss features on the issues page, on Freenode in the #documentcloud channel, or send tweets to @documentcloud.

Underscore is an open-source component of DocumentCloud.



:section Collections: Collection Functions (Arrays or Objects)

:item each: `_.each(list, iterator, [context])` <span class="alias">Alias: **forEach**</span><br>
Iterates over a list of elements, yielding each in turn to an iterator function. The iterator is bound to the context object, if one is passed. Each invocation of iterator is called with three arguments: (element, index, list). If list is a JavaScript object, iterator's arguments will be (value, key, list). Delegates to the native forEach function if it exists.

```
_.each([1, 2, 3], alert);
=> alerts each number in turn...
_.each({one : 1, two : 2, three : 3}, alert);
=> alerts each number value in turn...
```

:item map: `_.map(list, iterator, [context])` <span class="alias">Alias: **collect**</span><br>
Produces a new array of values by mapping each value in list through a transformation function (iterator). If the native map method exists, it will be used instead. If list is a JavaScript object, iterator's arguments will be (value, key, list).

```
_.map([1, 2, 3], function(num){ return num * 3; });
=> [3, 6, 9]
_.map({one : 1, two : 2, three : 3}, function(num, key){ return num * 3; });
=> [3, 6, 9]
```

:section Arrays: Array Functions

*Note: All array functions will also work on the __arguments__ object. However, Underscore functions are not designed to work on "sparse" arrays.*

:item first: `_.first(array, [n])` <span class="alias">Alias: **head**, **take**</span><br>
Returns the first element of an array. Passing n will return the first n elements of the array.

```
_.first([5, 4, 3, 2, 1]);
=> 5
```

:section Change Log: Change Log

<b class="header">1.4.3</b> — <small><i>Dec. 4, 2012</i></small> — <a href="https://github.com/documentcloud/underscore/compare/1.4.2...1.4.3">Diff</a>

- Improved Underscore compatibility with Adobe's JS engine that can be used to script Illustrator, Photoshop, and friends.
- Added a default `_.identity` iterator to `countBy` and `groupBy`.
