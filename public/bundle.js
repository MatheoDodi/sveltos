
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        on_outro(() => {
            destroy_block(block, lookup);
        });
        block.o(1);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            if (block.i)
                block.i(1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                $$.fragment.l(children(options.target));
            }
            else {
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param value initial value
     * @param start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param stores input stores
     * @param fn function callback that aggregates the values
     * @param initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === '*' ? '*' : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/*`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.4.3 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            $$invalidate('hasActiveRoute', hasActiveRoute = true);
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.4.3 */

    // (35:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (38:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (36:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.routeParams
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = changed.routeParams ? get_spread_update(switch_instance_spread_levels, [
    				ctx.routeParams
    			]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	const writable_props = ['path', 'component'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		route,
    		routeParams,
    		$activeRoute,
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.4.3 */

    const file = "node_modules/svelte-routing/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Header.svelte generated by Svelte v3.4.3 */

    const file$1 = "src/Components/Header.svelte";

    // (32:2) <Link to="/">
    function create_default_slot_1(ctx) {
    	var h1;

    	return {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Sveltos";
    			h1.className = "svelte-1653ya8";
    			add_location(h1, file$1, 32, 4, 470);
    		},

    		m: function mount(target, anchor) {
    			insert(target, h1, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h1);
    			}
    		}
    	};
    }

    // (38:8) <Link to="/create">
    function create_default_slot(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Create Meetup");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var header, t, nav, ul, li, current;

    	var link0 = new Link({
    		props: {
    		to: "/",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: "/create",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			header = element("header");
    			link0.$$.fragment.c();
    			t = space();
    			nav = element("nav");
    			ul = element("ul");
    			li = element("li");
    			link1.$$.fragment.c();
    			li.className = "link";
    			add_location(li, file$1, 36, 6, 520);
    			ul.className = "svelte-1653ya8";
    			add_location(ul, file$1, 35, 4, 509);
    			add_location(nav, file$1, 34, 2, 499);
    			header.className = "svelte-1653ya8";
    			add_location(header, file$1, 30, 0, 441);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);
    			mount_component(link0, header, null);
    			append(header, t);
    			append(header, nav);
    			append(nav, ul);
    			append(ul, li);
    			mount_component(link1, li, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			link0.$$.fragment.i(local);

    			link1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link0.$$.fragment.o(local);
    			link1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    			}

    			link0.$destroy();

    			link1.$destroy();
    		}
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src/Components/PrimaryButton.svelte generated by Svelte v3.4.3 */

    const file$2 = "src/Components/PrimaryButton.svelte";

    function create_fragment$4(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(ctx.content);
    			button.className = "svelte-41ctsf";
    			add_location(button, file$2, 30, 0, 425);
    			dispose = listen(button, "click", prevent_default(ctx.handleClickEvent));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.content) {
    				set_data(t, ctx.content);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { content, onClick } = $$props;

      function handleClickEvent(e) {
        onClick(e);
      }

    	const writable_props = ['content', 'onClick'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<PrimaryButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('content' in $$props) $$invalidate('content', content = $$props.content);
    		if ('onClick' in $$props) $$invalidate('onClick', onClick = $$props.onClick);
    	};

    	return { content, onClick, handleClickEvent };
    }

    class PrimaryButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["content", "onClick"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.content === undefined && !('content' in props)) {
    			console.warn("<PrimaryButton> was created without expected prop 'content'");
    		}
    		if (ctx.onClick === undefined && !('onClick' in props)) {
    			console.warn("<PrimaryButton> was created without expected prop 'onClick'");
    		}
    	}

    	get content() {
    		throw new Error("<PrimaryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<PrimaryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<PrimaryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<PrimaryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/SecondaryButton.svelte generated by Svelte v3.4.3 */

    const file$3 = "src/Components/SecondaryButton.svelte";

    function create_fragment$5(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(ctx.content);
    			button.className = "svelte-1w01y4d";
    			add_location(button, file$3, 28, 0, 436);
    			dispose = listen(button, "click", prevent_default(ctx.click_handler));
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.content) {
    				set_data(t, ctx.content);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(button);
    			}

    			dispose();
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { content } = $$props;

    	const writable_props = ['content'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<SecondaryButton> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('content' in $$props) $$invalidate('content', content = $$props.content);
    	};

    	return { content, click_handler };
    }

    class SecondaryButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, ["content"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.content === undefined && !('content' in props)) {
    			console.warn("<SecondaryButton> was created without expected prop 'content'");
    		}
    	}

    	get content() {
    		throw new Error("<SecondaryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<SecondaryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/Badge.svelte generated by Svelte v3.4.3 */

    const file$4 = "src/Components/Badge.svelte";

    function create_fragment$6(ctx) {
    	var span, current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			span = element("span");

    			if (default_slot) default_slot.c();

    			span.className = "svelte-18zgvkj";
    			add_location(span, file$4, 14, 0, 269);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(span_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { $$slots, $$scope };
    }

    class Badge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
    	}
    }

    /* src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte generated by Svelte v3.4.3 */

    const file$5 = "src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte";

    // (122:6) {#if favorite}
    function create_if_block$1(ctx) {
    	var current;

    	var badge = new Badge({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			badge.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(badge, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			badge.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			badge.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			badge.$destroy(detaching);
    		}
    	};
    }

    // (123:8) <Badge>
    function create_default_slot$1(ctx) {
    	var t;

    	return {
    		c: function create() {
    			t = text("Favorite");
    		},

    		m: function mount(target, anchor) {
    			insert(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(t);
    			}
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var article, div0, div0_style_value, t0, div1, h1, t1, t2, t3, h2, t4, t5, p, t6, t7, a, t8, a_href_value, t9, footer, t10, current;

    	var if_block = (ctx.favorite) && create_if_block$1(ctx);

    	var primarybutton = new PrimaryButton({
    		props: {
    		onClick: ctx.showMore,
    		content: "See Details"
    	},
    		$$inline: true
    	});

    	var secondarybutton = new SecondaryButton({
    		props: { content: ctx.favorite ? 'Remove from Favorites' : 'Favorite' },
    		$$inline: true
    	});
    	secondarybutton.$on("click", ctx.handleFavorite);

    	return {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(ctx.snapTitle);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			h2 = element("h2");
    			t4 = text(ctx.snapSubtitle);
    			t5 = space();
    			p = element("p");
    			t6 = text(ctx.snapDescription);
    			t7 = space();
    			a = element("a");
    			t8 = text(ctx.snapContactEmail);
    			t9 = space();
    			footer = element("footer");
    			primarybutton.$$.fragment.c();
    			t10 = space();
    			secondarybutton.$$.fragment.c();
    			div0.className = "image svelte-irirdx";
    			div0.style.cssText = div0_style_value = `background-image: url(${ctx.snapImageUrl})`;
    			add_location(div0, file$5, 117, 2, 2288);
    			h1.className = "svelte-irirdx";
    			add_location(h1, file$5, 119, 4, 2387);
    			h2.className = "svelte-irirdx";
    			add_location(h2, file$5, 125, 4, 2490);
    			p.className = "svelte-irirdx";
    			add_location(p, file$5, 126, 4, 2518);
    			a.href = a_href_value = `mailto:${ctx.snapContactEmail}`;
    			a.className = "svelte-irirdx";
    			add_location(a, file$5, 128, 4, 2548);
    			footer.className = "svelte-irirdx";
    			add_location(footer, file$5, 129, 4, 2616);
    			div1.className = "content svelte-irirdx";
    			add_location(div1, file$5, 118, 2, 2361);
    			article.dataset.id = ctx.snapId;
    			article.className = "svelte-irirdx";
    			toggle_class(article, "favorite", ctx.favorite);
    			add_location(article, file$5, 116, 0, 2244);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, article, anchor);
    			append(article, div0);
    			append(article, t0);
    			append(article, div1);
    			append(div1, h1);
    			append(h1, t1);
    			append(h1, t2);
    			if (if_block) if_block.m(h1, null);
    			append(div1, t3);
    			append(div1, h2);
    			append(h2, t4);
    			append(div1, t5);
    			append(div1, p);
    			append(p, t6);
    			append(div1, t7);
    			append(div1, a);
    			append(a, t8);
    			append(div1, t9);
    			append(div1, footer);
    			mount_component(primarybutton, footer, null);
    			append(footer, t10);
    			mount_component(secondarybutton, footer, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.favorite) {
    				if (!if_block) {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(h1, null);
    				} else {
    									if_block.i(1);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}

    			if (!current || changed.snapDescription) {
    				set_data(t6, ctx.snapDescription);
    			}

    			var primarybutton_changes = {};
    			if (changed.showMore) primarybutton_changes.onClick = ctx.showMore;
    			primarybutton.$set(primarybutton_changes);

    			var secondarybutton_changes = {};
    			if (changed.favorite) secondarybutton_changes.content = ctx.favorite ? 'Remove from Favorites' : 'Favorite';
    			secondarybutton.$set(secondarybutton_changes);

    			if (changed.favorite) {
    				toggle_class(article, "favorite", ctx.favorite);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();

    			primarybutton.$$.fragment.i(local);

    			secondarybutton.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			primarybutton.$$.fragment.o(local);
    			secondarybutton.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(article);
    			}

    			if (if_block) if_block.d();

    			primarybutton.$destroy();

    			secondarybutton.$destroy();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      let { id, title, subtitle, description, imageUrl, address, contactEmail, favorite } = $$props;

      const dispatch = createEventDispatcher();
      const snapId = id;
      const snapTitle = title;
      const snapSubtitle = subtitle;
      let snapDescription = description;
      const snapImageUrl = imageUrl;
      const snapContactEmail = contactEmail;

      // Check to see if description is too long
      if (snapDescription.split(" ").length > 15) {
        // Trim description
        $$invalidate('snapDescription', snapDescription =
          description
            .split(" ")
            .slice(0, 16)
            .join(" ") + "...");
      }

      function showMore() {
        $$invalidate('snapDescription', snapDescription = "Hi!");
      }

      function handleFavorite() {
        dispatch("toggleFavorite", snapId);
      }

    	const writable_props = ['id', 'title', 'subtitle', 'description', 'imageUrl', 'address', 'contactEmail', 'favorite'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<MeetupItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('subtitle' in $$props) $$invalidate('subtitle', subtitle = $$props.subtitle);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('imageUrl' in $$props) $$invalidate('imageUrl', imageUrl = $$props.imageUrl);
    		if ('address' in $$props) $$invalidate('address', address = $$props.address);
    		if ('contactEmail' in $$props) $$invalidate('contactEmail', contactEmail = $$props.contactEmail);
    		if ('favorite' in $$props) $$invalidate('favorite', favorite = $$props.favorite);
    	};

    	return {
    		id,
    		title,
    		subtitle,
    		description,
    		imageUrl,
    		address,
    		contactEmail,
    		favorite,
    		snapId,
    		snapTitle,
    		snapSubtitle,
    		snapDescription,
    		snapImageUrl,
    		snapContactEmail,
    		showMore,
    		handleFavorite
    	};
    }

    class MeetupItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, ["id", "title", "subtitle", "description", "imageUrl", "address", "contactEmail", "favorite"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'id'");
    		}
    		if (ctx.title === undefined && !('title' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'title'");
    		}
    		if (ctx.subtitle === undefined && !('subtitle' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'subtitle'");
    		}
    		if (ctx.description === undefined && !('description' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'description'");
    		}
    		if (ctx.imageUrl === undefined && !('imageUrl' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'imageUrl'");
    		}
    		if (ctx.address === undefined && !('address' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'address'");
    		}
    		if (ctx.contactEmail === undefined && !('contactEmail' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'contactEmail'");
    		}
    		if (ctx.favorite === undefined && !('favorite' in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'favorite'");
    		}
    	}

    	get id() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subtitle() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subtitle(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imageUrl() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageUrl(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get address() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set address(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contactEmail() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contactEmail(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get favorite() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set favorite(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Containers/MeetupsList/MeetupsList.svelte generated by Svelte v3.4.3 */

    const file$6 = "src/Containers/MeetupsList/MeetupsList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.meetup = list[i];
    	return child_ctx;
    }

    // (19:2) {#each meetups as meetup (meetup.id)}
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var meetupitem_spread_levels = [
    		ctx.meetup
    	];

    	let meetupitem_props = {};
    	for (var i = 0; i < meetupitem_spread_levels.length; i += 1) {
    		meetupitem_props = assign(meetupitem_props, meetupitem_spread_levels[i]);
    	}
    	var meetupitem = new MeetupItem({ props: meetupitem_props, $$inline: true });
    	meetupitem.$on("toggleFavorite", ctx.toggleFavorite_handler);

    	return {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			meetupitem.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert(target, first, anchor);
    			mount_component(meetupitem, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var meetupitem_changes = changed.meetups ? get_spread_update(meetupitem_spread_levels, [
    				ctx.meetup
    			]) : {};
    			meetupitem.$set(meetupitem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			meetupitem.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			meetupitem.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(first);
    			}

    			meetupitem.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.meetups;

    	const get_key = ctx => ctx.meetup.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			div.className = "meetups-container svelte-6uvj0b";
    			add_location(div, file$6, 16, 0, 329);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].m(div, null);

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.meetups;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].o();

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].d();
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { meetups } = $$props;

    	const writable_props = ['meetups'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<MeetupsList> was created with unknown prop '${key}'`);
    	});

    	function toggleFavorite_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ('meetups' in $$props) $$invalidate('meetups', meetups = $$props.meetups);
    	};

    	return { meetups, toggleFavorite_handler };
    }

    class MeetupsList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$8, safe_not_equal, ["meetups"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.meetups === undefined && !('meetups' in props)) {
    			console.warn("<MeetupsList> was created without expected prop 'meetups'");
    		}
    	}

    	get meetups() {
    		throw new Error("<MeetupsList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meetups(value) {
    		throw new Error("<MeetupsList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Containers/EditMeetup/EditMeetup.svelte generated by Svelte v3.4.3 */

    const file$7 = "src/Containers/EditMeetup/EditMeetup.svelte";

    function create_fragment$9(ctx) {
    	var form, h1, t1, div0, input0, t2, label0, t4, div1, input1, t5, label1, t7, div2, input2, t8, label2, t10, div3, input3, t11, label3, t13, div4, input4, t14, label4, t16, div5, input5, t17, label5, t19, button, t20, button_disabled_value, dispose;

    	return {
    		c: function create() {
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Create a Meetup";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Title";
    			t4 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Subtitle";
    			t7 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t8 = space();
    			label2 = element("label");
    			label2.textContent = "Description";
    			t10 = space();
    			div3 = element("div");
    			input3 = element("input");
    			t11 = space();
    			label3 = element("label");
    			label3.textContent = "Image URL";
    			t13 = space();
    			div4 = element("div");
    			input4 = element("input");
    			t14 = space();
    			label4 = element("label");
    			label4.textContent = "Address";
    			t16 = space();
    			div5 = element("div");
    			input5 = element("input");
    			t17 = space();
    			label5 = element("label");
    			label5.textContent = "Email";
    			t19 = space();
    			button = element("button");
    			t20 = text("Create");
    			h1.className = "svelte-1vq8pt3";
    			add_location(h1, file$7, 146, 2, 2816);
    			input0.value = ctx.title;
    			attr(input0, "type", "text");
    			input0.name = "title";
    			input0.className = "svelte-1vq8pt3";
    			add_location(input0, file$7, 148, 4, 2874);
    			label0.htmlFor = "title";
    			label0.className = "svelte-1vq8pt3";
    			add_location(label0, file$7, 153, 4, 2992);
    			div0.className = "form-control svelte-1vq8pt3";
    			add_location(div0, file$7, 147, 2, 2843);
    			attr(input1, "type", "text");
    			input1.name = "subtitle";
    			input1.className = "svelte-1vq8pt3";
    			add_location(input1, file$7, 156, 4, 3067);
    			label1.htmlFor = "subtitle";
    			label1.className = "svelte-1vq8pt3";
    			add_location(label1, file$7, 157, 4, 3131);
    			div1.className = "form-control svelte-1vq8pt3";
    			add_location(div1, file$7, 155, 2, 3036);
    			attr(input2, "type", "text");
    			input2.name = "description";
    			input2.className = "svelte-1vq8pt3";
    			add_location(input2, file$7, 160, 4, 3212);
    			label2.htmlFor = "description";
    			label2.className = "svelte-1vq8pt3";
    			add_location(label2, file$7, 161, 4, 3282);
    			div2.className = "form-control svelte-1vq8pt3";
    			add_location(div2, file$7, 159, 2, 3181);
    			attr(input3, "type", "text");
    			input3.name = "imageUrl";
    			input3.className = "svelte-1vq8pt3";
    			add_location(input3, file$7, 164, 4, 3369);
    			label3.htmlFor = "imageUrl";
    			label3.className = "svelte-1vq8pt3";
    			add_location(label3, file$7, 165, 4, 3433);
    			div3.className = "form-control svelte-1vq8pt3";
    			add_location(div3, file$7, 163, 2, 3338);
    			attr(input4, "type", "text");
    			input4.name = "address";
    			input4.className = "svelte-1vq8pt3";
    			add_location(input4, file$7, 168, 4, 3515);
    			label4.htmlFor = "address";
    			label4.className = "svelte-1vq8pt3";
    			add_location(label4, file$7, 169, 4, 3577);
    			div4.className = "form-control svelte-1vq8pt3";
    			add_location(div4, file$7, 167, 2, 3484);
    			attr(input5, "type", "text");
    			input5.name = "contactEmail";
    			input5.className = "svelte-1vq8pt3";
    			add_location(input5, file$7, 172, 4, 3656);
    			label5.htmlFor = "contactEmail";
    			label5.className = "svelte-1vq8pt3";
    			add_location(label5, file$7, 173, 4, 3728);
    			div5.className = "form-control svelte-1vq8pt3";
    			add_location(div5, file$7, 171, 2, 3625);
    			button.type = "submit";
    			button.disabled = button_disabled_value = !ctx.formValid;
    			button.className = "svelte-1vq8pt3";
    			add_location(button, file$7, 175, 2, 3779);
    			form.className = "svelte-1vq8pt3";
    			add_location(form, file$7, 145, 0, 2741);

    			dispose = [
    				listen(input0, "input", ctx.input_handler),
    				listen(input1, "input", ctx.input1_input_handler),
    				listen(input2, "input", ctx.input2_input_handler),
    				listen(input3, "input", ctx.input3_input_handler),
    				listen(input4, "input", ctx.input4_input_handler),
    				listen(input5, "input", ctx.input5_input_handler),
    				listen(form, "submit", prevent_default(ctx.addMeetup)),
    				listen(form, "input", ctx.checkFormValidity)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, form, anchor);
    			append(form, h1);
    			append(form, t1);
    			append(form, div0);
    			append(div0, input0);
    			append(div0, t2);
    			append(div0, label0);
    			append(form, t4);
    			append(form, div1);
    			append(div1, input1);

    			input1.value = ctx.subtitle;

    			append(div1, t5);
    			append(div1, label1);
    			append(form, t7);
    			append(form, div2);
    			append(div2, input2);

    			input2.value = ctx.description;

    			append(div2, t8);
    			append(div2, label2);
    			append(form, t10);
    			append(form, div3);
    			append(div3, input3);

    			input3.value = ctx.imageUrl;

    			append(div3, t11);
    			append(div3, label3);
    			append(form, t13);
    			append(form, div4);
    			append(div4, input4);

    			input4.value = ctx.address;

    			append(div4, t14);
    			append(div4, label4);
    			append(form, t16);
    			append(form, div5);
    			append(div5, input5);

    			input5.value = ctx.contactEmail;

    			append(div5, t17);
    			append(div5, label5);
    			append(form, t19);
    			append(form, button);
    			append(button, t20);
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				input0.value = ctx.title;
    			}

    			if (changed.subtitle && (input1.value !== ctx.subtitle)) input1.value = ctx.subtitle;
    			if (changed.description && (input2.value !== ctx.description)) input2.value = ctx.description;
    			if (changed.imageUrl && (input3.value !== ctx.imageUrl)) input3.value = ctx.imageUrl;
    			if (changed.address && (input4.value !== ctx.address)) input4.value = ctx.address;
    			if (changed.contactEmail && (input5.value !== ctx.contactEmail)) input5.value = ctx.contactEmail;

    			if ((changed.formValid) && button_disabled_value !== (button_disabled_value = !ctx.formValid)) {
    				button.disabled = button_disabled_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(form);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let title = "";
      let subtitle = "";
      let description = "";
      let imageUrl = "";
      let address = "";
      let contactEmail = "";
      let formValid = false;

      function addMeetup() {
        const id = Date.now().toString();
        const newMeetup = {
          id,
          title,
          subtitle,
          description,
          imageUrl,
          address,
          contactEmail,
          favorite: false
        };
        meetups = [newMeetup, ...meetups];
        clearInputs();
      }

      function clearInputs() {
        $$invalidate('title', title = "");
        $$invalidate('subtitle', subtitle = "");
        $$invalidate('description', description = "");
        $$invalidate('imageUrl', imageUrl = "");
        $$invalidate('address', address = "");
        $$invalidate('contactEmail', contactEmail = "");
      }

      function checkFormValidity() {
        if (
          title.trim() &&
          subtitle.trim() &&
          description.trim() &&
          imageUrl.trim() &&
          address.trim() &&
          address.trim() &&
          contactEmail.trim()
        ) {
          $$invalidate('formValid', formValid = true);
        } else {
          $$invalidate('formValid', formValid = false);
        }
      }

    	function input_handler(e) {
    		const $$result = (title = e.target.value);
    		$$invalidate('title', title);
    		return $$result;
    	}

    	function input1_input_handler() {
    		subtitle = this.value;
    		$$invalidate('subtitle', subtitle);
    	}

    	function input2_input_handler() {
    		description = this.value;
    		$$invalidate('description', description);
    	}

    	function input3_input_handler() {
    		imageUrl = this.value;
    		$$invalidate('imageUrl', imageUrl);
    	}

    	function input4_input_handler() {
    		address = this.value;
    		$$invalidate('address', address);
    	}

    	function input5_input_handler() {
    		contactEmail = this.value;
    		$$invalidate('contactEmail', contactEmail);
    	}

    	return {
    		title,
    		subtitle,
    		description,
    		imageUrl,
    		address,
    		contactEmail,
    		formValid,
    		addMeetup,
    		checkFormValidity,
    		input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	};
    }

    class EditMeetup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, []);
    	}
    }

    /* src/App.svelte generated by Svelte v3.4.3 */

    const file$8 = "src/App.svelte";

    // (68:4) <Route path="/">
    function create_default_slot_1$1(ctx) {
    	var current;

    	var meetupslist = new MeetupsList({
    		props: { meetups: ctx.meetups },
    		$$inline: true
    	});
    	meetupslist.$on("toggleFavorite", ctx.handleFavorite);

    	return {
    		c: function create() {
    			meetupslist.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(meetupslist, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var meetupslist_changes = {};
    			if (changed.meetups) meetupslist_changes.meetups = ctx.meetups;
    			meetupslist.$set(meetupslist_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			meetupslist.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			meetupslist.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			meetupslist.$destroy(detaching);
    		}
    	};
    }

    // (64:0) <Router {url}>
    function create_default_slot$2(ctx) {
    	var t0, main, t1, current;

    	var header = new Header({ $$inline: true });

    	var route0 = new Route({
    		props: { path: "create", component: EditMeetup },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: {
    		path: "/",
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			main = element("main");
    			route0.$$.fragment.c();
    			t1 = space();
    			route1.$$.fragment.c();
    			main.className = "svelte-efloma";
    			add_location(main, file$8, 65, 2, 2254);
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			mount_component(route0, main, null);
    			append(main, t1);
    			mount_component(route1, main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route0_changes = {};
    			if (changed.EditMeetup) route0_changes.component = EditMeetup;
    			route0.$set(route0_changes);

    			var route1_changes = {};
    			if (changed.$$scope || changed.meetups) route1_changes.$$scope = { changed, ctx };
    			route1.$set(route1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			header.$$.fragment.i(local);

    			route0.$$.fragment.i(local);

    			route1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			header.$$.fragment.o(local);
    			route0.$$.fragment.o(local);
    			route1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			header.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(main);
    			}

    			route0.$destroy();

    			route1.$destroy();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var current;

    	var router = new Router({
    		props: {
    		url: ctx.url,
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.url) router_changes.url = ctx.url;
    			if (changed.$$scope || changed.meetups) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			router.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			router.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			router.$destroy(detaching);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

      let { url = "" } = $$props;
      let meetups = [
        {
          id: "m1",
          title: "Coding Bootcamp",
          subtitle: "Learn to code in 2 hours",
          description:
            "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
          imageUrl:
            "https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g",
          address: "9200 Irvine Center Dr, Irvine, CA 92618",
          contactEmail: "support@learningfuze.com",
          favorite: false
        },
        {
          id: "m2",
          title: "Coffee & Code OC",
          subtitle: "Let's talk about code!",
          description:
            "Lot's of code and good coffee, what's not to like?! Be there!",
          imageUrl:
            "https://s3-media1.fl.yelpcdn.com/bphoto/urKT6cl0DR3tDNFQlRKJ6g/o.jpg",
          address: " 18100 Culver Dr, Irvine, CA 92612",
          contactEmail: "support@coffee&code.com",
          favorite: false
        },
        {
          id: "m3",
          title: "Coding Bootcamp",
          subtitle: "Learn to code in 2 hours",
          description:
            "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
          imageUrl:
            "https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g",
          address: "9200 Irvine Center Dr, Irvine, CA 92618",
          contactEmail: "support@learningfuze.com",
          favorite: false
        }
      ];

      function handleFavorite(e) {
        const id = e.detail;

        const meetup = meetups.find(mtup => mtup.id === id);
        console.log(meetup);
        meetup.favorite = !meetup.favorite;
        $$invalidate('meetups', meetups = meetups.slice(0));
      }

    	const writable_props = ['url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	return { url, meetups, handleFavorite };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, ["url"]);
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
