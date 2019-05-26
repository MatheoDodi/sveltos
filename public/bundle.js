
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    			h1.className = "svelte-n06kz2";
    			add_location(h1, file, 24, 2, 306);
    			header.className = "svelte-n06kz2";
    			add_location(header, file, 23, 0, 295);
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
    			add_location(button, file$1, 30, 0, 433);
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
    	let { content, handleClick } = $$props;

      function handleClickEvent(e) {
        handleClick(e);
      }

    	const writable_props = ['content', 'handleClick'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<PrimaryButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('content' in $$props) $$invalidate('content', content = $$props.content);
    		if ('handleClick' in $$props) $$invalidate('handleClick', handleClick = $$props.handleClick);
    	};

    	return { content, handleClick, handleClickEvent };
    }

    class PrimaryButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["content", "handleClick"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.content === undefined && !('content' in props)) {
    			console.warn("<PrimaryButton> was created without expected prop 'content'");
    		}
    		if (ctx.handleClick === undefined && !('handleClick' in props)) {
    			console.warn("<PrimaryButton> was created without expected prop 'handleClick'");
    		}
    	}

    	get content() {
    		throw new Error("<PrimaryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<PrimaryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClick() {
    		throw new Error("<PrimaryButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<PrimaryButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte generated by Svelte v3.4.3 */

    const file$2 = "src/Containers/MeetupsList/MeetupItem/MeetupItem.svelte";

    function create_fragment$2(ctx) {
    	var article, div0, div0_style_value, t0, div1, h1, t1, t2, h2, t3, t4, p, t5, t6, footer, t7, button, current;

    	var primarybutton = new PrimaryButton({
    		props: { content: "See Details" },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			article = element("article");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(ctx.title);
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(ctx.subtitle);
    			t4 = space();
    			p = element("p");
    			t5 = text(ctx.description);
    			t6 = space();
    			footer = element("footer");
    			primarybutton.$$.fragment.c();
    			t7 = space();
    			button = element("button");
    			button.textContent = "Favorite";
    			div0.className = "image svelte-1fnvwce";
    			div0.style.cssText = div0_style_value = `background-image: url(${ctx.imageUrl})`;
    			add_location(div0, file$2, 69, 2, 1313);
    			h1.className = "svelte-1fnvwce";
    			add_location(h1, file$2, 71, 4, 1408);
    			h2.className = "svelte-1fnvwce";
    			add_location(h2, file$2, 72, 4, 1429);
    			p.className = "svelte-1fnvwce";
    			add_location(p, file$2, 73, 4, 1453);
    			add_location(button, file$2, 76, 6, 1539);
    			footer.className = "svelte-1fnvwce";
    			add_location(footer, file$2, 74, 4, 1478);
    			div1.className = "content svelte-1fnvwce";
    			add_location(div1, file$2, 70, 2, 1382);
    			article.dataset.id = ctx.id;
    			article.className = "svelte-1fnvwce";
    			add_location(article, file$2, 68, 0, 1288);
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
    			append(div1, footer);
    			mount_component(primarybutton, footer, null);
    			append(footer, t7);
    			append(footer, button);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.imageUrl) && div0_style_value !== (div0_style_value = `background-image: url(${ctx.imageUrl})`)) {
    				div0.style.cssText = div0_style_value;
    			}

    			if (!current || changed.title) {
    				set_data(t1, ctx.title);
    			}

    			if (!current || changed.subtitle) {
    				set_data(t3, ctx.subtitle);
    			}

    			if (!current || changed.description) {
    				set_data(t5, ctx.description);
    			}

    			if (!current || changed.id) {
    				article.dataset.id = ctx.id;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			primarybutton.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			primarybutton.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(article);
    			}

    			primarybutton.$destroy();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { id, title, subtitle, description, imageUrl, address, contactEmail } = $$props;

      // Check to see if description is too long
      if (description.split(" ").length > 15) {
        // Trim description
        $$invalidate('description', description =
          description
            .split(" ")
            .slice(0, 16)
            .join(" ") + "...");
      }

    	const writable_props = ['id', 'title', 'subtitle', 'description', 'imageUrl', 'address', 'contactEmail'];
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
    	};

    	return {
    		id,
    		title,
    		subtitle,
    		description,
    		imageUrl,
    		address,
    		contactEmail
    	};
    }

    class MeetupItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, ["id", "title", "subtitle", "description", "imageUrl", "address", "contactEmail"]);

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
    }

    /* src/Containers/MeetupsList/MeetupsList.svelte generated by Svelte v3.4.3 */

    const file$3 = "src/Containers/MeetupsList/MeetupsList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.id = list[i].id;
    	child_ctx.title = list[i].title;
    	child_ctx.subtitle = list[i].subtitle;
    	child_ctx.description = list[i].description;
    	child_ctx.imageUrl = list[i].imageUrl;
    	child_ctx.address = list[i].address;
    	child_ctx.contactEmail = list[i].contactEmail;
    	child_ctx.index = i;
    	return child_ctx;
    }

    // (18:2) {#each meetups as { id, title, subtitle, description, imageUrl, address, contactEmail }
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var meetupitem = new MeetupItem({
    		props: {
    		id: ctx.id,
    		title: ctx.title,
    		subtitle: ctx.subtitle,
    		description: ctx.description,
    		imageUrl: ctx.imageUrl,
    		address: ctx.address,
    		contactEmail: ctx.contactEmail
    	},
    		$$inline: true
    	});

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
    			var meetupitem_changes = {};
    			if (changed.meetups) meetupitem_changes.id = ctx.id;
    			if (changed.meetups) meetupitem_changes.title = ctx.title;
    			if (changed.meetups) meetupitem_changes.subtitle = ctx.subtitle;
    			if (changed.meetups) meetupitem_changes.description = ctx.description;
    			if (changed.meetups) meetupitem_changes.imageUrl = ctx.imageUrl;
    			if (changed.meetups) meetupitem_changes.address = ctx.address;
    			if (changed.meetups) meetupitem_changes.contactEmail = ctx.contactEmail;
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

    function create_fragment$3(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	var each_value = ctx.meetups;

    	const get_key = ctx => ctx.id;

    	for (var i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (i = 0; i < each_blocks.length; i += 1) each_blocks[i].c();
    			div.className = "meetups-container svelte-zu69dg";
    			add_location(div, file$3, 15, 0, 272);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { meetups } = $$props;

    	const writable_props = ['meetups'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key)) console.warn(`<MeetupsList> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('meetups' in $$props) $$invalidate('meetups', meetups = $$props.meetups);
    	};

    	return { meetups };
    }

    class MeetupsList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["meetups"]);

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

    function create_fragment$4(ctx) {
    	var t, current;

    	var header = new Header({ $$inline: true });

    	var meetupslist = new MeetupsList({
    		props: { meetups: ctx.meetups },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t = space();
    			meetupslist.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert(target, t, anchor);
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
    				detach(t);
    			}

    			meetupslist.$destroy(detaching);
    		}
    	};
    }

    function instance$3($$self) {
    	

      const meetups = [
        {
          id: "m1",
          title: "Coding Bootcamp",
          subtitle: "Learn to code in 2 hours",
          description:
            "In this meetup we will have some experts in the web development community that will help you teach how to code! We will be creating 3 websites and we'll be having a lot of fun!",
          imageUrl:
            "https://media.licdn.com/dms/image/C561BAQG-AId6iHvIeA/company-background_10000/0?e=2159024400&v=beta&t=A1iCxUdk2c5nvgPEJ38SCAQjini9ozOA3o47NkYCk8g",
          address: "9200 Irvine Center Dr, Irvine, CA 92618",
          contactEmail: "support@learningfuze.com"
        },
        {
          id: "m1",
          title: "Coffee & Code OC",
          subtitle: "Let's talk about code!",
          description:
            "Lot's of code and good coffee, what's not to like?! Be there!",
          imageUrl:
            "https://s3-media1.fl.yelpcdn.com/bphoto/urKT6cl0DR3tDNFQlRKJ6g/o.jpg",
          address: " 18100 Culver Dr, Irvine, CA 92612",
          contactEmail: "support@coffee&code.com"
        }
      ];

    	return { meetups };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
