(function outer(modules, cache, entries) {
  /**
   * Global
   */

  var global = (function() {
    return this;
  })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name) {
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require) {
    var m = (cache[id] = { exports: {} });
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(
        m.exports,
        function(req) {
          var dep = modules[id][1][req];
          return require(dep || req);
        },
        m,
        m.exports,
        outer,
        modules,
        cache,
        entries
      );
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

  return require;
})(
  {
    1: [
      function(require, module, exports) {
        'use strict';

        /**
         * Module dependencies.
         */

        var ResultPanel = require('../lib/result-panel');
        var CheckPanel = require('../lib/check-panel');
        var classes = require('component/classes');
        var dataset = require('code42day/dataset');

        /**
         * Create a CheckPanel# for each check.
         */

        var checks = document.querySelectorAll('.check');

        [].slice.call(checks).forEach(function(el) {
          new CheckPanel(el);
        });

        /**
         * Create a ResultPanel# for each rule result.
         */

        var results = document.querySelectorAll('.result');

        [].slice.call(results).forEach(function(el) {
          new ResultPanel(el);
        });

        /**
         * Enable browser filtering.
         */

        var filter = document.querySelector('#browser-filter');
        var tocItems = document.querySelectorAll('.toc-item');

        filter.addEventListener('change', function() {
          [].slice.call(checks).forEach(function(check) {
            showOrHide(check);
          });
          [].slice.call(tocItems).forEach(function(item) {
            showOrHide(item);
          });
        });

        /**
         * Shows or hides a given check's container
         * or a given TOC item
         *
         * @param {Object} check
         * @param {String} val
         * @api private
         */

        function showOrHide(check) {
          var val = filter.value;
          if (val == 'all') {
            classes(check).remove('hide');
          } else {
            classes(check).remove('hide');
            if (dataset(check, 'browser') != val) {
              classes(check).add('hide');
            }
          }
        }
      },
      {
        '../lib/result-panel': 2,
        '../lib/check-panel': 3,
        'component/classes': 4,
        'code42day/dataset': 5
      }
    ],
    2: [
      function(require, module, exports) {
        'use strict';

        /**
         * Module dependencies.
         */

        var classes = require('component/classes');
        var events = require('component/events');

        /**
         * Expose `ResultPanel`.
         */

        module.exports = ResultPanel;

        /**
         * Construct an instance of `ResultPanel`.
         *
         * @param {HTMLElement} el
         * @api public
         */

        function ResultPanel(el) {
          this.el = el;
          this.events = events(this.el, this);
          this.events.bind('click .toggle-nodes', 'toggleNodes');
        }

        /**
         * Toggles the visibility of the "Nodes" section
         * of this ResultPanel#.
         *
         * @param {Event} e
         * @return {ResultPanel}
         * @api private
         */

        ResultPanel.prototype.toggleNodes = function(e) {
          classes(e.target).toggle('on');
          var nodes = this.el.querySelectorAll('.node');
          [].slice.call(nodes).forEach(function(node) {
            classes(node).toggle('hide');
          });
          return this;
        };
      },
      { 'component/classes': 4, 'component/events': 6 }
    ],
    4: [
      function(require, module, exports) {
        /**
         * Module dependencies.
         */

        var index = require('indexof');

        /**
         * Whitespace regexp.
         */

        var re = /\s+/;

        /**
         * toString reference.
         */

        var toString = Object.prototype.toString;

        /**
         * Wrap `el` in a `ClassList`.
         *
         * @param {Element} el
         * @return {ClassList}
         * @api public
         */

        module.exports = function(el) {
          return new ClassList(el);
        };

        /**
         * Initialize a new ClassList for `el`.
         *
         * @param {Element} el
         * @api private
         */

        function ClassList(el) {
          if (!el || !el.nodeType) {
            throw new Error('A DOM element reference is required');
          }
          this.el = el;
          this.list = el.classList;
        }

        /**
         * Add class `name` if not already present.
         *
         * @param {String} name
         * @return {ClassList}
         * @api public
         */

        ClassList.prototype.add = function(name) {
          // classList
          if (this.list) {
            this.list.add(name);
            return this;
          }

          // fallback
          var arr = this.array();
          var i = index(arr, name);
          if (!~i) arr.push(name);
          this.el.className = arr.join(' ');
          return this;
        };

        /**
         * Remove class `name` when present, or
         * pass a regular expression to remove
         * any which match.
         *
         * @param {String|RegExp} name
         * @return {ClassList}
         * @api public
         */

        ClassList.prototype.remove = function(name) {
          if ('[object RegExp]' == toString.call(name)) {
            return this.removeMatching(name);
          }

          // classList
          if (this.list) {
            this.list.remove(name);
            return this;
          }

          // fallback
          var arr = this.array();
          var i = index(arr, name);
          if (~i) arr.splice(i, 1);
          this.el.className = arr.join(' ');
          return this;
        };

        /**
         * Remove all classes matching `re`.
         *
         * @param {RegExp} re
         * @return {ClassList}
         * @api private
         */

        ClassList.prototype.removeMatching = function(re) {
          var arr = this.array();
          for (var i = 0; i < arr.length; i++) {
            if (re.test(arr[i])) {
              this.remove(arr[i]);
            }
          }
          return this;
        };

        /**
         * Toggle class `name`, can force state via `force`.
         *
         * For browsers that support classList, but do not support `force` yet,
         * the mistake will be detected and corrected.
         *
         * @param {String} name
         * @param {Boolean} force
         * @return {ClassList}
         * @api public
         */

        ClassList.prototype.toggle = function(name, force) {
          // classList
          if (this.list) {
            if ('undefined' !== typeof force) {
              if (force !== this.list.toggle(name, force)) {
                this.list.toggle(name); // toggle again to correct
              }
            } else {
              this.list.toggle(name);
            }
            return this;
          }

          // fallback
          if ('undefined' !== typeof force) {
            if (!force) {
              this.remove(name);
            } else {
              this.add(name);
            }
          } else {
            if (this.has(name)) {
              this.remove(name);
            } else {
              this.add(name);
            }
          }

          return this;
        };

        /**
         * Return an array of classes.
         *
         * @return {Array}
         * @api public
         */

        ClassList.prototype.array = function() {
          var className = this.el.getAttribute('class') || '';
          var str = className.replace(/^\s+|\s+$/g, '');
          var arr = str.split(re);
          if ('' === arr[0]) arr.shift();
          return arr;
        };

        /**
         * Check if class `name` is present.
         *
         * @param {String} name
         * @return {ClassList}
         * @api public
         */

        ClassList.prototype.has = ClassList.prototype.contains = function(
          name
        ) {
          return this.list
            ? this.list.contains(name)
            : !!~index(this.array(), name);
        };
      },
      { indexof: 7 }
    ],
    7: [
      function(require, module, exports) {
        module.exports = function(arr, obj) {
          if (arr.indexOf) return arr.indexOf(obj);
          for (var i = 0; i < arr.length; ++i) {
            if (arr[i] === obj) return i;
          }
          return -1;
        };
      },
      {}
    ],
    6: [
      function(require, module, exports) {
        /**
         * Module dependencies.
         */

        var events = require('event');
        var delegate = require('delegate');

        /**
         * Expose `Events`.
         */

        module.exports = Events;

        /**
         * Initialize an `Events` with the given
         * `el` object which events will be bound to,
         * and the `obj` which will receive method calls.
         *
         * @param {Object} el
         * @param {Object} obj
         * @api public
         */

        function Events(el, obj) {
          if (!(this instanceof Events)) return new Events(el, obj);
          if (!el) throw new Error('element required');
          if (!obj) throw new Error('object required');
          this.el = el;
          this.obj = obj;
          this._events = {};
        }

        /**
         * Subscription helper.
         */

        Events.prototype.sub = function(event, method, cb) {
          this._events[event] = this._events[event] || {};
          this._events[event][method] = cb;
        };

        /**
         * Bind to `event` with optional `method` name.
         * When `method` is undefined it becomes `event`
         * with the "on" prefix.
         *
         * Examples:
         *
         *  Direct event handling:
         *
         *    events.bind('click') // implies "onclick"
         *    events.bind('click', 'remove')
         *    events.bind('click', 'sort', 'asc')
         *
         *  Delegated event handling:
         *
         *    events.bind('click li > a')
         *    events.bind('click li > a', 'remove')
         *    events.bind('click a.sort-ascending', 'sort', 'asc')
         *    events.bind('click a.sort-descending', 'sort', 'desc')
         *
         * @param {String} event
         * @param {String|function} [method]
         * @return {Function} callback
         * @api public
         */

        Events.prototype.bind = function(event, method) {
          var e = parse(event);
          var el = this.el;
          var obj = this.obj;
          var name = e.name;
          var args = [].slice.call(arguments, 2);
          method = method || 'on' + name;

          // callback
          function cb() {
            var a = [].slice.call(arguments).concat(args);
            obj[method].apply(obj, a);
          }

          // bind
          if (e.selector) {
            var cb = delegate.bind(el, e.selector, name, cb);
          } else {
            events.bind(el, name, cb);
          }

          // subscription for unbinding
          this.sub(name, method, cb);

          return cb;
        };

        /**
         * Unbind a single binding, all bindings for `event`,
         * or all bindings within the manager.
         *
         * Examples:
         *
         *  Unbind direct handlers:
         *
         *     events.unbind('click', 'remove')
         *     events.unbind('click')
         *     events.unbind()
         *
         * Unbind delegate handlers:
         *
         *     events.unbind('click', 'remove')
         *     events.unbind('click')
         *     events.unbind()
         *
         * @param {String|Function} [event]
         * @param {String|Function} [method]
         * @api public
         */

        Events.prototype.unbind = function(event, method) {
          if (0 === arguments.length) return this.unbindAll();
          if (1 === arguments.length) return this.unbindAllOf(event);

          // no bindings for this event
          var bindings = this._events[event];
          if (!bindings) return;

          // no bindings for this method
          var cb = bindings[method];
          if (!cb) return;

          events.unbind(this.el, event, cb);
        };

        /**
         * Unbind all events.
         *
         * @api private
         */

        Events.prototype.unbindAll = function() {
          for (var event in this._events) {
            this.unbindAllOf(event);
          }
        };

        /**
         * Unbind all events for `event`.
         *
         * @param {String} event
         * @api private
         */

        Events.prototype.unbindAllOf = function(event) {
          var bindings = this._events[event];
          if (!bindings) return;

          for (var method in bindings) {
            this.unbind(event, method);
          }
        };

        /**
         * Parse `event`.
         *
         * @param {String} event
         * @return {Object}
         * @api private
         */

        function parse(event) {
          var parts = event.split(/ +/);
          return {
            name: parts.shift(),
            selector: parts.join(' ')
          };
        }
      },
      { event: 8, delegate: 9 }
    ],
    8: [
      function(require, module, exports) {
        var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
          unbind = window.removeEventListener
            ? 'removeEventListener'
            : 'detachEvent',
          prefix = bind !== 'addEventListener' ? 'on' : '';

        /**
         * Bind `el` event `type` to `fn`.
         *
         * @param {Element} el
         * @param {String} type
         * @param {Function} fn
         * @param {Boolean} capture
         * @return {Function}
         * @api public
         */

        exports.bind = function(el, type, fn, capture) {
          el[bind](prefix + type, fn, capture || false);
          return fn;
        };

        /**
         * Unbind `el` event `type`'s callback `fn`.
         *
         * @param {Element} el
         * @param {String} type
         * @param {Function} fn
         * @param {Boolean} capture
         * @return {Function}
         * @api public
         */

        exports.unbind = function(el, type, fn, capture) {
          el[unbind](prefix + type, fn, capture || false);
          return fn;
        };
      },
      {}
    ],
    9: [
      function(require, module, exports) {
        /**
         * Module dependencies.
         */

        var closest = require('closest'),
          event = require('event');

        /**
         * Delegate event `type` to `selector`
         * and invoke `fn(e)`. A callback function
         * is returned which may be passed to `.unbind()`.
         *
         * @param {Element} el
         * @param {String} selector
         * @param {String} type
         * @param {Function} fn
         * @param {Boolean} capture
         * @return {Function}
         * @api public
         */

        exports.bind = function(el, selector, type, fn, capture) {
          return event.bind(
            el,
            type,
            function(e) {
              var target = e.target || e.srcElement;
              e.delegateTarget = closest(target, selector, true, el);
              if (e.delegateTarget) fn.call(el, e);
            },
            capture
          );
        };

        /**
         * Unbind event `type`'s callback `fn`.
         *
         * @param {Element} el
         * @param {String} type
         * @param {Function} fn
         * @param {Boolean} capture
         * @api public
         */

        exports.unbind = function(el, type, fn, capture) {
          event.unbind(el, type, fn, capture);
        };
      },
      { closest: 10, event: 8 }
    ],
    10: [
      function(require, module, exports) {
        /**
         * Module Dependencies
         */

        var matches = require('matches-selector');

        /**
         * Export `closest`
         */

        module.exports = closest;

        /**
         * Closest
         *
         * @param {Element} el
         * @param {String} selector
         * @param {Element} scope (optional)
         */

        function closest(el, selector, scope) {
          scope = scope || document.documentElement;

          // walk up the dom
          while (el && el !== scope) {
            if (matches(el, selector)) return el;
            el = el.parentNode;
          }

          // check scope for match
          return matches(el, selector) ? el : null;
        }
      },
      { 'matches-selector': 11 }
    ],
    11: [
      function(require, module, exports) {
        /**
         * Module dependencies.
         */

        var query = require('query');

        /**
         * Element prototype.
         */

        var proto = Element.prototype;

        /**
         * Vendor function.
         */

        var vendor =
          proto.matches ||
          proto.webkitMatchesSelector ||
          proto.mozMatchesSelector ||
          proto.msMatchesSelector ||
          proto.oMatchesSelector;

        /**
         * Expose `match()`.
         */

        module.exports = match;

        /**
         * Match `el` to `selector`.
         *
         * @param {Element} el
         * @param {String} selector
         * @return {Boolean}
         * @api public
         */

        function match(el, selector) {
          if (!el || el.nodeType !== 1) return false;
          if (vendor) return vendor.call(el, selector);
          var nodes = query.all(selector, el.parentNode);
          for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i] == el) return true;
          }
          return false;
        }
      },
      { query: 12 }
    ],
    12: [
      function(require, module, exports) {
        function one(selector, el) {
          return el.querySelector(selector);
        }

        exports = module.exports = function(selector, el) {
          el = el || document;
          return one(selector, el);
        };

        exports.all = function(selector, el) {
          el = el || document;
          return el.querySelectorAll(selector);
        };

        exports.engine = function(obj) {
          if (!obj.one) throw new Error('.one callback required');
          if (!obj.all) throw new Error('.all callback required');
          one = obj.one;
          exports.all = obj.all;
          return exports;
        };
      },
      {}
    ],
    3: [
      function(require, module, exports) {
        'use strict';

        /**
         * Module dependencies.
         */

        var classes = require('component/classes');
        var events = require('component/events');

        /**
         * Expose `CheckPanel`.
         */

        module.exports = CheckPanel;

        /**
         * Construct an instance of `CheckPanel`.
         *
         * @param {HTMLElement} el
         * @api public
         */

        function CheckPanel(el) {
          this.el = el;
          this.events = events(this.el, this);
          this.events.bind('click .toggle-passes', 'togglePasses');
        }

        /**
         * Toggles the visibility of the "Passes" for this check.
         *
         * @param {Event} e
         * @return {CheckPanel}
         * @api private
         */

        CheckPanel.prototype.togglePasses = function(e) {
          classes(e.target).toggle('on');
          var el = this.el.querySelector('.passes');
          classes(el).toggle('hide');
          return this;
        };
      },
      { 'component/classes': 4, 'component/events': 6 }
    ],
    5: [
      function(require, module, exports) {
        module.exports = dataset;

        /*global document*/

        // replace namesLikeThis with names-like-this
        function toDashed(name) {
          return name.replace(/([A-Z])/g, function(u) {
            return '-' + u.toLowerCase();
          });
        }

        var fn;

        if (
          typeof document !== 'undefined' &&
          document.head &&
          document.head.dataset
        ) {
          fn = {
            set: function(node, attr, value) {
              node.dataset[attr] = value;
            },
            get: function(node, attr) {
              return node.dataset[attr];
            },
            del: function(node, attr) {
              delete node.dataset[attr];
            }
          };
        } else {
          fn = {
            set: function(node, attr, value) {
              node.setAttribute('data-' + toDashed(attr), value);
            },
            get: function(node, attr) {
              return node.getAttribute('data-' + toDashed(attr));
            },
            del: function(node, attr) {
              node.removeAttribute('data-' + toDashed(attr));
            }
          };
        }

        function dataset(node, attr, value) {
          var self = {
            set: set,
            get: get,
            del: del
          };

          function set(attr, value) {
            fn.set(node, attr, value);
            return self;
          }

          function del(attr) {
            fn.del(node, attr);
            return self;
          }

          function get(attr) {
            return fn.get(node, attr);
          }

          if (arguments.length === 3) {
            return set(attr, value);
          }
          if (arguments.length == 2) {
            return get(attr);
          }

          return self;
        }
      },
      {}
    ]
  },
  {},
  { '1': '' }
);
