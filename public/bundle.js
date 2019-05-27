
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

    /* src/Components/Header.svelte generated by Svelte v3.4.3 */

    const file = "src/Components/Header.svelte";

    function create_fragment(ctx) {
    	var header, h1;

    	return {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Sveltos";
    			h1.className = "svelte-tplhvh";
    			add_location(h1, file, 25, 2, 323);
    			header.className = "svelte-tplhvh";
    			add_location(header, file, 24, 0, 312);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);
    			append(header, h1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    			}
    		}
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src/Components/PrimaryButton.svelte generated by Svelte v3.4.3 */

    const file$1 = "src/Components/PrimaryButton.svelte";

    function create_fragment$1(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(ctx.content);
    			button.className = "svelte-41ctsf";
    			add_location(button, file$1, 30, 0, 425);
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

    function instance($$self, $$props, $$invalidate) {
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
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["content", "onClick"]);

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

    const file$2 = "src/Components/SecondaryButton.svelte";

    function create_fragment$2(ctx) {
    	var button, t, dispose;

    	return {
    		c: function create() {
    			button = element("button");
    			t = text(ctx.content);
    			button.className = "svelte-1w01y4d";
    			add_location(button, file$2, 28, 0, 436);
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

    function instance$1($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, ["content"]);

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

    /* src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte generated by Svelte v3.4.3 */

    const file$3 = "src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte";

    function create_fragment$3(ctx) {
    	var article, div0, div0_style_value, t0, div1, h1, t1, t2, h2, t3, t4, p, t5, t6, a, t7, a_href_value, t8, footer, t9, current;

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
    			h2 = element("h2");
    			t3 = text(ctx.snapSubtitle);
    			t4 = space();
    			p = element("p");
    			t5 = text(ctx.snapDescription);
    			t6 = space();
    			a = element("a");
    			t7 = text(ctx.snapContactEmail);
    			t8 = space();
    			footer = element("footer");
    			primarybutton.$$.fragment.c();
    			t9 = space();
    			secondarybutton.$$.fragment.c();
    			div0.className = "image svelte-irirdx";
    			div0.style.cssText = div0_style_value = `background-image: url(${ctx.snapImageUrl})`;
    			add_location(div0, file$3, 115, 2, 2231);
    			h1.className = "svelte-irirdx";
    			add_location(h1, file$3, 117, 4, 2330);
    			h2.className = "svelte-irirdx";
    			add_location(h2, file$3, 118, 4, 2355);
    			p.className = "svelte-irirdx";
    			add_location(p, file$3, 119, 4, 2383);
    			a.href = a_href_value = `mailto:${ctx.snapContactEmail}`;
    			a.className = "svelte-irirdx";
    			add_location(a, file$3, 120, 4, 2412);
    			footer.className = "svelte-irirdx";
    			add_location(footer, file$3, 121, 4, 2480);
    			div1.className = "content svelte-irirdx";
    			add_location(div1, file$3, 116, 2, 2304);
    			article.dataset.id = ctx.snapId;
    			article.className = "svelte-irirdx";
    			toggle_class(article, "favorite", ctx.favorite);
    			add_location(article, file$3, 114, 0, 2187);
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
    			append(div1, t2);
    			append(div1, h2);
    			append(h2, t3);
    			append(div1, t4);
    			append(div1, p);
    			append(p, t5);
    			append(div1, t6);
    			append(div1, a);
    			append(a, t7);
    			append(div1, t8);
    			append(div1, footer);
    			mount_component(primarybutton, footer, null);
    			append(footer, t9);
    			mount_component(secondarybutton, footer, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.snapDescription) {
    				set_data(t5, ctx.snapDescription);
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
    			primarybutton.$$.fragment.i(local);

    			secondarybutton.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			primarybutton.$$.fragment.o(local);
    			secondarybutton.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(article);
    			}

    			primarybutton.$destroy();

    			secondarybutton.$destroy();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
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
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["id", "title", "subtitle", "description", "imageUrl", "address", "contactEmail", "favorite"]);

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

    const file$4 = "src/Containers/MeetupsList/MeetupsList.svelte";

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

    function create_fragment$4(ctx) {
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
    			add_location(div, file$4, 16, 0, 329);
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

    function instance$3($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["meetups"]);

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

    /* src/App.svelte generated by Svelte v3.4.3 */

    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	var t0, main, form, h1, t2, div0, input0, t3, label0, t5, div1, input1, t6, label1, t8, div2, input2, t9, label2, t11, div3, input3, t12, label3, t14, div4, input4, t15, label4, t17, div5, input5, t18, label5, t20, button, t21, button_disabled_value, t22, current, dispose;

    	var header = new Header({ $$inline: true });

    	var meetupslist = new MeetupsList({
    		props: { meetups: ctx.meetups },
    		$$inline: true
    	});
    	meetupslist.$on("toggleFavorite", ctx.handleFavorite);

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			main = element("main");
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Create a Meetup";
    			t2 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t3 = space();
    			label0 = element("label");
    			label0.textContent = "Title";
    			t5 = space();
    			div1 = element("div");
    			input1 = element("input");
    			t6 = space();
    			label1 = element("label");
    			label1.textContent = "Subtitle";
    			t8 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Description";
    			t11 = space();
    			div3 = element("div");
    			input3 = element("input");
    			t12 = space();
    			label3 = element("label");
    			label3.textContent = "Image URL";
    			t14 = space();
    			div4 = element("div");
    			input4 = element("input");
    			t15 = space();
    			label4 = element("label");
    			label4.textContent = "Address";
    			t17 = space();
    			div5 = element("div");
    			input5 = element("input");
    			t18 = space();
    			label5 = element("label");
    			label5.textContent = "Email";
    			t20 = space();
    			button = element("button");
    			t21 = text("Create");
    			t22 = space();
    			meetupslist.$$.fragment.c();
    			h1.className = "svelte-19k4364";
    			add_location(h1, file$5, 203, 4, 4882);
    			input0.value = ctx.title;
    			attr(input0, "type", "text");
    			input0.name = "title";
    			input0.className = "svelte-19k4364";
    			add_location(input0, file$5, 205, 6, 4944);
    			label0.htmlFor = "title";
    			label0.className = "svelte-19k4364";
    			add_location(label0, file$5, 210, 6, 5072);
    			div0.className = "form-control svelte-19k4364";
    			add_location(div0, file$5, 204, 4, 4911);
    			attr(input1, "type", "text");
    			input1.name = "subtitle";
    			input1.className = "svelte-19k4364";
    			add_location(input1, file$5, 213, 6, 5153);
    			label1.htmlFor = "subtitle";
    			label1.className = "svelte-19k4364";
    			add_location(label1, file$5, 214, 6, 5219);
    			div1.className = "form-control svelte-19k4364";
    			add_location(div1, file$5, 212, 4, 5120);
    			attr(input2, "type", "text");
    			input2.name = "description";
    			input2.className = "svelte-19k4364";
    			add_location(input2, file$5, 217, 6, 5306);
    			label2.htmlFor = "description";
    			label2.className = "svelte-19k4364";
    			add_location(label2, file$5, 218, 6, 5378);
    			div2.className = "form-control svelte-19k4364";
    			add_location(div2, file$5, 216, 4, 5273);
    			attr(input3, "type", "text");
    			input3.name = "imageUrl";
    			input3.className = "svelte-19k4364";
    			add_location(input3, file$5, 221, 6, 5471);
    			label3.htmlFor = "imageUrl";
    			label3.className = "svelte-19k4364";
    			add_location(label3, file$5, 222, 6, 5537);
    			div3.className = "form-control svelte-19k4364";
    			add_location(div3, file$5, 220, 4, 5438);
    			attr(input4, "type", "text");
    			input4.name = "address";
    			input4.className = "svelte-19k4364";
    			add_location(input4, file$5, 225, 6, 5625);
    			label4.htmlFor = "address";
    			label4.className = "svelte-19k4364";
    			add_location(label4, file$5, 226, 6, 5689);
    			div4.className = "form-control svelte-19k4364";
    			add_location(div4, file$5, 224, 4, 5592);
    			attr(input5, "type", "text");
    			input5.name = "contactEmail";
    			input5.className = "svelte-19k4364";
    			add_location(input5, file$5, 229, 6, 5774);
    			label5.htmlFor = "contactEmail";
    			label5.className = "svelte-19k4364";
    			add_location(label5, file$5, 230, 6, 5848);
    			div5.className = "form-control svelte-19k4364";
    			add_location(div5, file$5, 228, 4, 5741);
    			button.type = "submit";
    			button.disabled = button_disabled_value = !ctx.formValid;
    			button.className = "svelte-19k4364";
    			add_location(button, file$5, 232, 4, 5903);
    			form.className = "svelte-19k4364";
    			add_location(form, file$5, 202, 2, 4805);
    			main.className = "svelte-19k4364";
    			add_location(main, file$5, 201, 0, 4796);

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
    			mount_component(header, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, main, anchor);
    			append(main, form);
    			append(form, h1);
    			append(form, t2);
    			append(form, div0);
    			append(div0, input0);
    			append(div0, t3);
    			append(div0, label0);
    			append(form, t5);
    			append(form, div1);
    			append(div1, input1);

    			input1.value = ctx.subtitle;

    			append(div1, t6);
    			append(div1, label1);
    			append(form, t8);
    			append(form, div2);
    			append(div2, input2);

    			input2.value = ctx.description;

    			append(div2, t9);
    			append(div2, label2);
    			append(form, t11);
    			append(form, div3);
    			append(div3, input3);

    			input3.value = ctx.imageUrl;

    			append(div3, t12);
    			append(div3, label3);
    			append(form, t14);
    			append(form, div4);
    			append(div4, input4);

    			input4.value = ctx.address;

    			append(div4, t15);
    			append(div4, label4);
    			append(form, t17);
    			append(form, div5);
    			append(div5, input5);

    			input5.value = ctx.contactEmail;

    			append(div5, t18);
    			append(div5, label5);
    			append(form, t20);
    			append(form, button);
    			append(button, t21);
    			append(main, t22);
    			mount_component(meetupslist, main, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.title) {
    				input0.value = ctx.title;
    			}

    			if (changed.subtitle && (input1.value !== ctx.subtitle)) input1.value = ctx.subtitle;
    			if (changed.description && (input2.value !== ctx.description)) input2.value = ctx.description;
    			if (changed.imageUrl && (input3.value !== ctx.imageUrl)) input3.value = ctx.imageUrl;
    			if (changed.address && (input4.value !== ctx.address)) input4.value = ctx.address;
    			if (changed.contactEmail && (input5.value !== ctx.contactEmail)) input5.value = ctx.contactEmail;

    			if ((!current || changed.formValid) && button_disabled_value !== (button_disabled_value = !ctx.formValid)) {
    				button.disabled = button_disabled_value;
    			}

    			var meetupslist_changes = {};
    			if (changed.meetups) meetupslist_changes.meetups = ctx.meetups;
    			meetupslist.$set(meetupslist_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			header.$$.fragment.i(local);

    			meetupslist.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			header.$$.fragment.o(local);
    			meetupslist.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			header.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    				detach(main);
    			}

    			meetupslist.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      let title = "";
      let subtitle = "";
      let description = "";
      let imageUrl = "";
      let address = "";
      let contactEmail = "";
      let formValid = false;

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
        $$invalidate('meetups', meetups = [newMeetup, ...meetups]);
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

      function handleFavorite(e) {
        const id = e.detail;

        const meetup = meetups.find(mtup => mtup.id === id);
        console.log(meetup);
        meetup.favorite = !meetup.favorite;
        $$invalidate('meetups', meetups = meetups.slice(0));
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
    		meetups,
    		addMeetup,
    		checkFormValidity,
    		handleFavorite,
    		input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_input_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
