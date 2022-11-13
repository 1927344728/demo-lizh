 /**
  * Not type checking this file because flow doesn't like attaching
  * properties to Elements.
  */
 /* istanbul ignore if */
 if (isIE9) {
   // http://www.matts411.com/post/internet-explorer-9-oninput/
   document.addEventListener('selectionchange', function () {
     var el = document.activeElement;
     // @ts-expect-error
     if (el && el.vmodel) {
       trigger(el, 'input');
     }
   });
 }
 var directive = {
   inserted: function (el, binding, vnode, oldVnode) {
     if (vnode.tag === 'select') {
       // #6903
       if (oldVnode.elm && !oldVnode.elm._vOptions) {
         mergeVNodeHook(vnode, 'postpatch', function () {
           directive.componentUpdated(el, binding, vnode);
         });
       }
       else {
         setSelected(el, binding, vnode.context);
       }
       el._vOptions = [].map.call(el.options, getValue);
     }
     else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
       el._vModifiers = binding.modifiers;
       if (!binding.modifiers.lazy) {
         el.addEventListener('compositionstart', onCompositionStart);
         el.addEventListener('compositionend', onCompositionEnd);
         // Safari < 10.2 & UIWebView doesn't fire compositionend when
         // switching focus before confirming composition choice
         // this also fixes the issue where some browsers e.g. iOS Chrome
         // fires "change" instead of "input" on autocomplete.
         el.addEventListener('change', onCompositionEnd);
         /* istanbul ignore if */
         if (isIE9) {
           el.vmodel = true;
         }
       }
     }
   },
   componentUpdated: function (el, binding, vnode) {
     if (vnode.tag === 'select') {
       setSelected(el, binding, vnode.context);
       // in case the options rendered by v-for have changed,
       // it's possible that the value is out-of-sync with the rendered options.
       // detect such cases and filter out values that no longer has a matching
       // option in the DOM.
       var prevOptions_1 = el._vOptions;
       var curOptions_1 = (el._vOptions = [].map.call(el.options, getValue));
       if (curOptions_1.some(function (o, i) { return !looseEqual(o, prevOptions_1[i]); })) {
         // trigger change event if
         // no matching option found for at least one value
         var needReset = el.multiple
           ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions_1); })
           : binding.value !== binding.oldValue &&
           hasNoMatchingOption(binding.value, curOptions_1);
         if (needReset) {
           trigger(el, 'change');
         }
       }
     }
   }
 };
 function setSelected(el, binding, vm) {
   actuallySetSelected(el, binding, vm);
   /* istanbul ignore if */
   if (isIE || isEdge) {
     setTimeout(function () {
       actuallySetSelected(el, binding, vm);
     }, 0);
   }
 }
 function actuallySetSelected(el, binding, vm) {
   var value = binding.value;
   var isMultiple = el.multiple;
   if (isMultiple && !Array.isArray(value)) {
     warn$2("<select multiple v-model=\"".concat(binding.expression, "\"> ") +
       "expects an Array value for its binding, but got ".concat(Object.prototype.toString
         .call(value)
         .slice(8, -1)), vm);
     return;
   }
   var selected, option;
   for (var i = 0, l = el.options.length; i < l; i++) {
     option = el.options[i];
     if (isMultiple) {
       selected = looseIndexOf(value, getValue(option)) > -1;
       if (option.selected !== selected) {
         option.selected = selected;
       }
     }
     else {
       if (looseEqual(getValue(option), value)) {
         if (el.selectedIndex !== i) {
           el.selectedIndex = i;
         }
         return;
       }
     }
   }
   if (!isMultiple) {
     el.selectedIndex = -1;
   }
 }
 function hasNoMatchingOption(value, options) {
   return options.every(function (o) { return !looseEqual(o, value); });
 }
 function getValue(option) {
   return '_value' in option ? option._value : option.value;
 }
 function onCompositionStart(e) {
   e.target.composing = true;
 }
 function onCompositionEnd(e) {
   // prevent triggering an input event for no reason
   if (!e.target.composing)
     return;
   e.target.composing = false;
   trigger(e.target, 'input');
 }
 function trigger(el, type) {
   var e = document.createEvent('HTMLEvents');
   e.initEvent(type, true, true);
   el.dispatchEvent(e);
 }
 
 // recursively search for possible transition defined inside the component root
 function locateNode(vnode) {
   // @ts-expect-error
   return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
     ? locateNode(vnode.componentInstance._vnode)
     : vnode;
 }
 var show = {
   bind: function (el, _a, vnode) {
     var value = _a.value;
     vnode = locateNode(vnode);
     var transition = vnode.data && vnode.data.transition;
     var originalDisplay = (el.__vOriginalDisplay =
       el.style.display === 'none' ? '' : el.style.display);
     if (value && transition) {
       vnode.data.show = true;
       enter(vnode, function () {
         el.style.display = originalDisplay;
       });
     }
     else {
       el.style.display = value ? originalDisplay : 'none';
     }
   },
   update: function (el, _a, vnode) {
     var value = _a.value, oldValue = _a.oldValue;
     /* istanbul ignore if */
     if (!value === !oldValue)
       return;
     vnode = locateNode(vnode);
     var transition = vnode.data && vnode.data.transition;
     if (transition) {
       vnode.data.show = true;
       if (value) {
         enter(vnode, function () {
           el.style.display = el.__vOriginalDisplay;
         });
       }
       else {
         leave(vnode, function () {
           el.style.display = 'none';
         });
       }
     }
     else {
       el.style.display = value ? el.__vOriginalDisplay : 'none';
     }
   },
   unbind: function (el, binding, vnode, oldVnode, isDestroy) {
     if (!isDestroy) {
       el.style.display = el.__vOriginalDisplay;
     }
   }
 };
 
 var platformDirectives = {
   model: directive,
   show: show
 };
 
 // Provides transition support for a single element/component.
 var transitionProps = {
   name: String,
   appear: Boolean,
   css: Boolean,
   mode: String,
   type: String,
   enterClass: String,
   leaveClass: String,
   enterToClass: String,
   leaveToClass: String,
   enterActiveClass: String,
   leaveActiveClass: String,
   appearClass: String,
   appearActiveClass: String,
   appearToClass: String,
   duration: [Number, String, Object]
 };
 // in case the child is also an abstract component, e.g. <keep-alive>
 // we want to recursively retrieve the real component to be rendered
 function getRealChild(vnode) {
   var compOptions = vnode && vnode.componentOptions;
   if (compOptions && compOptions.Ctor.options.abstract) {
     return getRealChild(getFirstComponentChild(compOptions.children));
   }
   else {
     return vnode;
   }
 }
 function extractTransitionData(comp) {
   var data = {};
   var options = comp.$options;
   // props
   for (var key in options.propsData) {
     data[key] = comp[key];
   }
   // events.
   // extract listeners and pass them directly to the transition methods
   var listeners = options._parentListeners;
   for (var key in listeners) {
     data[camelize(key)] = listeners[key];
   }
   return data;
 }
 function placeholder(h, rawChild) {
   // @ts-expect-error
   if (/\d-keep-alive$/.test(rawChild.tag)) {
     return h('keep-alive', {
       props: rawChild.componentOptions.propsData
     });
   }
 }
 function hasParentTransition(vnode) {
   while ((vnode = vnode.parent)) {
     if (vnode.data.transition) {
       return true;
     }
   }
 }
 function isSameChild(child, oldChild) {
   return oldChild.key === child.key && oldChild.tag === child.tag;
 }
 var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };
 var isVShowDirective = function (d) { return d.name === 'show'; };
 var Transition = {
   name: 'transition',
   props: transitionProps,
   abstract: true,
   render: function (h) {
     var _this = this;
     var children = this.$slots.default;
     if (!children) {
       return;
     }
     // filter out text nodes (possible whitespaces)
     children = children.filter(isNotTextNode);
     /* istanbul ignore if */
     if (!children.length) {
       return;
     }
     // warn multiple elements
     if (children.length > 1) {
       warn$2('<transition> can only be used on a single element. Use ' +
         '<transition-group> for lists.', this.$parent);
     }
     var mode = this.mode;
     // warn invalid mode
     if (mode && mode !== 'in-out' && mode !== 'out-in') {
       warn$2('invalid <transition> mode: ' + mode, this.$parent);
     }
     var rawChild = children[0];
     // if this is a component root node and the component's
     // parent container node also has transition, skip.
     if (hasParentTransition(this.$vnode)) {
       return rawChild;
     }
     // apply transition data to child
     // use getRealChild() to ignore abstract components e.g. keep-alive
     var child = getRealChild(rawChild);
     /* istanbul ignore if */
     if (!child) {
       return rawChild;
     }
     if (this._leaving) {
       return placeholder(h, rawChild);
     }
     // ensure a key that is unique to the vnode type and to this transition
     // component instance. This key will be used to remove pending leaving nodes
     // during entering.
     var id = "__transition-".concat(this._uid, "-");
     child.key =
       child.key == null
         ? child.isComment
           ? id + 'comment'
           : id + child.tag
         : isPrimitive(child.key)
           ? String(child.key).indexOf(id) === 0
             ? child.key
             : id + child.key
           : child.key;
     var data = ((child.data || (child.data = {})).transition =
       extractTransitionData(this));
     var oldRawChild = this._vnode;
     var oldChild = getRealChild(oldRawChild);
     // mark v-show
     // so that the transition module can hand over the control to the directive
     if (child.data.directives && child.data.directives.some(isVShowDirective)) {
       child.data.show = true;
     }
     if (oldChild &&
       oldChild.data &&
       !isSameChild(child, oldChild) &&
       !isAsyncPlaceholder(oldChild) &&
       // #6687 component root is a comment node
       !(oldChild.componentInstance &&
         oldChild.componentInstance._vnode.isComment)) {
       // replace old child transition data with fresh one
       // important for dynamic transitions!
       var oldData = (oldChild.data.transition = extend({}, data));
       // handle transition mode
       if (mode === 'out-in') {
         // return placeholder node and queue update when leave finishes
         this._leaving = true;
         mergeVNodeHook(oldData, 'afterLeave', function () {
           _this._leaving = false;
           _this.$forceUpdate();
         });
         return placeholder(h, rawChild);
       }
       else if (mode === 'in-out') {
         if (isAsyncPlaceholder(child)) {
           return oldRawChild;
         }
         var delayedLeave_1;
         var performLeave = function () {
           delayedLeave_1();
         };
         mergeVNodeHook(data, 'afterEnter', performLeave);
         mergeVNodeHook(data, 'enterCancelled', performLeave);
         mergeVNodeHook(oldData, 'delayLeave', function (leave) {
           delayedLeave_1 = leave;
         });
       }
     }
     return rawChild;
   }
 };
 
 // Provides transition support for list items.
 var props = extend({
   tag: String,
   moveClass: String
 }, transitionProps);
 delete props.mode;
 var TransitionGroup = {
   props: props,
   beforeMount: function () {
     var _this = this;
     var update = this._update;
     this._update = function (vnode, hydrating) {
       var restoreActiveInstance = setActiveInstance(_this);
       // force removing pass
       _this.__patch__(_this._vnode, _this.kept, false, // hydrating
         true // removeOnly (!important, avoids unnecessary moves)
       );
       _this._vnode = _this.kept;
       restoreActiveInstance();
       update.call(_this, vnode, hydrating);
     };
   },
   render: function (h) {
     var tag = this.tag || this.$vnode.data.tag || 'span';
     var map = Object.create(null);
     var prevChildren = (this.prevChildren = this.children);
     var rawChildren = this.$slots.default || [];
     var children = (this.children = []);
     var transitionData = extractTransitionData(this);
     for (var i = 0; i < rawChildren.length; i++) {
       var c = rawChildren[i];
       if (c.tag) {
         if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
           children.push(c);
           map[c.key] = c;
           (c.data || (c.data = {})).transition = transitionData;
         }
         else {
           var opts = c.componentOptions;
           var name_1 = opts
             ? getComponentName(opts.Ctor.options) || opts.tag || ''
             : c.tag;
           warn$2("<transition-group> children must be keyed: <".concat(name_1, ">"));
         }
       }
     }
     if (prevChildren) {
       var kept = [];
       var removed = [];
       for (var i = 0; i < prevChildren.length; i++) {
         var c = prevChildren[i];
         c.data.transition = transitionData;
         // @ts-expect-error .getBoundingClientRect is not typed in Node
         c.data.pos = c.elm.getBoundingClientRect();
         if (map[c.key]) {
           kept.push(c);
         }
         else {
           removed.push(c);
         }
       }
       this.kept = h(tag, null, kept);
       this.removed = removed;
     }
     return h(tag, null, children);
   },
   updated: function () {
     var children = this.prevChildren;
     var moveClass = this.moveClass || (this.name || 'v') + '-move';
     if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
       return;
     }
     // we divide the work into three loops to avoid mixing DOM reads and writes
     // in each iteration - which helps prevent layout thrashing.
     children.forEach(callPendingCbs);
     children.forEach(recordPosition);
     children.forEach(applyTranslation);
     // force reflow to put everything in position
     // assign to this to avoid being removed in tree-shaking
     // $flow-disable-line
     this._reflow = document.body.offsetHeight;
     children.forEach(function (c) {
       if (c.data.moved) {
         var el_1 = c.elm;
         var s = el_1.style;
         addTransitionClass(el_1, moveClass);
         s.transform = s.WebkitTransform = s.transitionDuration = '';
         el_1.addEventListener(transitionEndEvent, (el_1._moveCb = function cb(e) {
           if (e && e.target !== el_1) {
             return;
           }
           if (!e || /transform$/.test(e.propertyName)) {
             el_1.removeEventListener(transitionEndEvent, cb);
             el_1._moveCb = null;
             removeTransitionClass(el_1, moveClass);
           }
         }));
       }
     });
   },
   methods: {
     hasMove: function (el, moveClass) {
       /* istanbul ignore if */
       if (!hasTransition) {
         return false;
       }
       /* istanbul ignore if */
       if (this._hasMove) {
         return this._hasMove;
       }
       // Detect whether an element with the move class applied has
       // CSS transitions. Since the element may be inside an entering
       // transition at this very moment, we make a clone of it and remove
       // all other transition classes applied to ensure only the move class
       // is applied.
       var clone = el.cloneNode();
       if (el._transitionClasses) {
         el._transitionClasses.forEach(function (cls) {
           removeClass(clone, cls);
         });
       }
       addClass(clone, moveClass);
       clone.style.display = 'none';
       this.$el.appendChild(clone);
       var info = getTransitionInfo(clone);
       this.$el.removeChild(clone);
       return (this._hasMove = info.hasTransform);
     }
   }
 };
 function callPendingCbs(c) {
   /* istanbul ignore if */
   if (c.elm._moveCb) {
     c.elm._moveCb();
   }
   /* istanbul ignore if */
   if (c.elm._enterCb) {
     c.elm._enterCb();
   }
 }
 function recordPosition(c) {
   c.data.newPos = c.elm.getBoundingClientRect();
 }
 function applyTranslation(c) {
   var oldPos = c.data.pos;
   var newPos = c.data.newPos;
   var dx = oldPos.left - newPos.left;
   var dy = oldPos.top - newPos.top;
   if (dx || dy) {
     c.data.moved = true;
     var s = c.elm.style;
     s.transform = s.WebkitTransform = "translate(".concat(dx, "px,").concat(dy, "px)");
     s.transitionDuration = '0s';
   }
 }
 
 var platformComponents = {
   Transition: Transition,
   TransitionGroup: TransitionGroup
 };
 
 // install platform specific utils
 Vue.config.mustUseProp = mustUseProp;
 Vue.config.isReservedTag = isReservedTag;
 Vue.config.isReservedAttr = isReservedAttr;
 Vue.config.getTagNamespace = getTagNamespace;
 Vue.config.isUnknownElement = isUnknownElement;
 // install platform runtime directives & components
 extend(Vue.options.directives, platformDirectives);
 extend(Vue.options.components, platformComponents);
 // install platform patch function
 Vue.prototype.__patch__ = inBrowser ? patch : noop;
 // public mount method
 Vue.prototype.$mount = function (el, hydrating) {
   el = el && inBrowser ? query(el) : undefined;
   return mountComponent(this, el, hydrating);
 };
 // devtools global hook
 /* istanbul ignore next */
 if (inBrowser) {
   setTimeout(function () {
     if (config.devtools) {
       if (devtools) {
         devtools.emit('init', Vue);
       }
       else {
         // @ts-expect-error
         console[console.info ? 'info' : 'log']('Download the Vue Devtools extension for a better development experience:\n' +
           'https://github.com/vuejs/vue-devtools');
       }
     }
     if (config.productionTip !== false &&
       typeof console !== 'undefined') {
       // @ts-expect-error
       console[console.info ? 'info' : 'log']("You are running Vue in development mode.\n" +
         "Make sure to turn on production mode when deploying for production.\n" +
         "See more tips at https://vuejs.org/guide/deployment.html");
     }
   }, 0);
 }
 
 var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
 var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
 var buildRegex = cached(function (delimiters) {
   var open = delimiters[0].replace(regexEscapeRE, '\\$&');
   var close = delimiters[1].replace(regexEscapeRE, '\\$&');
   return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
 });
 function parseText(text, delimiters) {
   var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
   if (!tagRE.test(text)) {
     return;
   }
   var tokens = [];
   var rawTokens = [];
   var lastIndex = (tagRE.lastIndex = 0);
   var match, index, tokenValue;
   while ((match = tagRE.exec(text))) {
     index = match.index;
     // push text token
     if (index > lastIndex) {
       rawTokens.push((tokenValue = text.slice(lastIndex, index)));
       tokens.push(JSON.stringify(tokenValue));
     }
     // tag token
     var exp = parseFilters(match[1].trim());
     tokens.push("_s(".concat(exp, ")"));
     rawTokens.push({ '@binding': exp });
     lastIndex = index + match[0].length;
   }
   if (lastIndex < text.length) {
     rawTokens.push((tokenValue = text.slice(lastIndex)));
     tokens.push(JSON.stringify(tokenValue));
   }
   return {
     expression: tokens.join('+'),
     tokens: rawTokens
   };
 }
 
 function transformNode$1(el, options) {
   var warn = options.warn || baseWarn;
   var staticClass = getAndRemoveAttr(el, 'class');
   if (staticClass) {
     var res = parseText(staticClass, options.delimiters);
     if (res) {
       warn("class=\"".concat(staticClass, "\": ") +
         'Interpolation inside attributes has been removed. ' +
         'Use v-bind or the colon shorthand instead. For example, ' +
         'instead of <div class="{{ val }}">, use <div :class="val">.', el.rawAttrsMap['class']);
     }
   }
   if (staticClass) {
     el.staticClass = JSON.stringify(staticClass.replace(/\s+/g, ' ').trim());
   }
   var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
   if (classBinding) {
     el.classBinding = classBinding;
   }
 }
 function genData$2(el) {
   var data = '';
   if (el.staticClass) {
     data += "staticClass:".concat(el.staticClass, ",");
   }
   if (el.classBinding) {
     data += "class:".concat(el.classBinding, ",");
   }
   return data;
 }
 var klass = {
   staticKeys: ['staticClass'],
   transformNode: transformNode$1,
   genData: genData$2
 };
 
 function transformNode(el, options) {
   var warn = options.warn || baseWarn;
   var staticStyle = getAndRemoveAttr(el, 'style');
   if (staticStyle) {
     /* istanbul ignore if */
     {
       var res = parseText(staticStyle, options.delimiters);
       if (res) {
         warn("style=\"".concat(staticStyle, "\": ") +
           'Interpolation inside attributes has been removed. ' +
           'Use v-bind or the colon shorthand instead. For example, ' +
           'instead of <div style="{{ val }}">, use <div :style="val">.', el.rawAttrsMap['style']);
       }
     }
     el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
   }
   var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
   if (styleBinding) {
     el.styleBinding = styleBinding;
   }
 }
 function genData$1(el) {
   var data = '';
   if (el.staticStyle) {
     data += "staticStyle:".concat(el.staticStyle, ",");
   }
   if (el.styleBinding) {
     data += "style:(".concat(el.styleBinding, "),");
   }
   return data;
 }
 var style = {
   staticKeys: ['staticStyle'],
   transformNode: transformNode,
   genData: genData$1
 };
 
 var decoder;
 var he = {
   decode: function (html) {
     decoder = decoder || document.createElement('div');
     decoder.innerHTML = html;
     return decoder.textContent;
   }
 };
 
 var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
   'link,meta,param,source,track,wbr');
 // Elements that you can, intentionally, leave open
 // (and which close themselves)
 var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source');
 // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
 // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
 var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
   'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
   'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
   'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
   'title,tr,track');
 
 /**
  * Not type-checking this file because it's mostly vendor code.
  */
 // Regular Expressions for parsing tags and attributes
 var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
 var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
 var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*");
 var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
 var startTagOpen = new RegExp("^<".concat(qnameCapture));
 var startTagClose = /^\s*(\/?)>/;
 var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));
 var doctype = /^<!DOCTYPE [^>]+>/i;
 // #7298: escape - to avoid being passed as HTML comment when inlined in page
 var comment = /^<!\--/;
 var conditionalComment = /^<!\[/;
 // Special Elements (can contain anything)
 var isPlainTextElement = makeMap('script,style,textarea', true);
 var reCache = {};
 var decodingMap = {
   '&lt;': '<',
   '&gt;': '>',
   '&quot;': '"',
   '&amp;': '&',
   '&#10;': '\n',
   '&#9;': '\t',
   '&#39;': "'"
 };
 var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
 var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;
 // #5992
 var isIgnoreNewlineTag = makeMap('pre,textarea', true);
 var shouldIgnoreFirstNewline = function (tag, html) {
   return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
 };
 function decodeAttr(value, shouldDecodeNewlines) {
   var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
   return value.replace(re, function (match) { return decodingMap[match]; });
 }
 function parseHTML(html, options) {
   var stack = [];
   var expectHTML = options.expectHTML;
   var isUnaryTag = options.isUnaryTag || no;
   var canBeLeftOpenTag = options.canBeLeftOpenTag || no;
   var index = 0;
   var last, lastTag;
   var _loop_1 = function () {
     last = html;
     // Make sure we're not in a plaintext content element like script/style
     if (!lastTag || !isPlainTextElement(lastTag)) {
       var textEnd = html.indexOf('<');
       if (textEnd === 0) {
         // Comment:
         if (comment.test(html)) {
           var commentEnd = html.indexOf('-->');
           if (commentEnd >= 0) {
             if (options.shouldKeepComment && options.comment) {
               options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
             }
             advance(commentEnd + 3);
             return "continue";
           }
         }
         // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
         if (conditionalComment.test(html)) {
           var conditionalEnd = html.indexOf(']>');
           if (conditionalEnd >= 0) {
             advance(conditionalEnd + 2);
             return "continue";
           }
         }
         // Doctype:
         var doctypeMatch = html.match(doctype);
         if (doctypeMatch) {
           advance(doctypeMatch[0].length);
           return "continue";
         }
         // End tag:
         var endTagMatch = html.match(endTag);
         if (endTagMatch) {
           var curIndex = index;
           advance(endTagMatch[0].length);
           parseEndTag(endTagMatch[1], curIndex, index);
           return "continue";
         }
         // Start tag:
         var startTagMatch = parseStartTag();
         if (startTagMatch) {
           handleStartTag(startTagMatch);
           if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
             advance(1);
           }
           return "continue";
         }
       }
       var text = void 0, rest = void 0, next = void 0;
       if (textEnd >= 0) {
         rest = html.slice(textEnd);
         while (!endTag.test(rest) &&
           !startTagOpen.test(rest) &&
           !comment.test(rest) &&
           !conditionalComment.test(rest)) {
           // < in plain text, be forgiving and treat it as text
           next = rest.indexOf('<', 1);
           if (next < 0)
             break;
           textEnd += next;
           rest = html.slice(textEnd);
         }
         text = html.substring(0, textEnd);
       }
       if (textEnd < 0) {
         text = html;
       }
       if (text) {
         advance(text.length);
       }
       if (options.chars && text) {
         options.chars(text, index - text.length, index);
       }
     }
     else {
       var endTagLength_1 = 0;
       var stackedTag_1 = lastTag.toLowerCase();
       var reStackedTag = reCache[stackedTag_1] ||
         (reCache[stackedTag_1] = new RegExp('([\\s\\S]*?)(</' + stackedTag_1 + '[^>]*>)', 'i'));
       var rest = html.replace(reStackedTag, function (all, text, endTag) {
         endTagLength_1 = endTag.length;
         if (!isPlainTextElement(stackedTag_1) && stackedTag_1 !== 'noscript') {
           text = text
             .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
             .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
         }
         if (shouldIgnoreFirstNewline(stackedTag_1, text)) {
           text = text.slice(1);
         }
         if (options.chars) {
           options.chars(text);
         }
         return '';
       });
       index += html.length - rest.length;
       html = rest;
       parseEndTag(stackedTag_1, index - endTagLength_1, index);
     }
     if (html === last) {
       options.chars && options.chars(html);
       if (!stack.length && options.warn) {
         options.warn("Mal-formatted tag at end of template: \"".concat(html, "\""), {
           start: index + html.length
         });
       }
       return "break";
     }
   };
   while (html) {
     var state_1 = _loop_1();
     if (state_1 === "break")
       break;
   }
   // Clean up any remaining tags
   parseEndTag();
   function advance(n) {
     index += n;
     html = html.substring(n);
   }
   function parseStartTag() {
     var start = html.match(startTagOpen);
     if (start) {
       var match = {
         tagName: start[1],
         attrs: [],
         start: index
       };
       advance(start[0].length);
       var end = void 0, attr = void 0;
       while (!(end = html.match(startTagClose)) &&
         (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
         attr.start = index;
         advance(attr[0].length);
         attr.end = index;
         match.attrs.push(attr);
       }
       if (end) {
         match.unarySlash = end[1];
         advance(end[0].length);
         match.end = index;
         return match;
       }
     }
   }
   function handleStartTag(match) {
     var tagName = match.tagName;
     var unarySlash = match.unarySlash;
     if (expectHTML) {
       if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
         parseEndTag(lastTag);
       }
       if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
         parseEndTag(tagName);
       }
     }
     var unary = isUnaryTag(tagName) || !!unarySlash;
     var l = match.attrs.length;
     var attrs = new Array(l);
     for (var i = 0; i < l; i++) {
       var args = match.attrs[i];
       var value = args[3] || args[4] || args[5] || '';
       var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
         ? options.shouldDecodeNewlinesForHref
         : options.shouldDecodeNewlines;
       attrs[i] = {
         name: args[1],
         value: decodeAttr(value, shouldDecodeNewlines)
       };
       if (options.outputSourceRange) {
         attrs[i].start = args.start + args[0].match(/^\s*/).length;
         attrs[i].end = args.end;
       }
     }
     if (!unary) {
       stack.push({
         tag: tagName,
         lowerCasedTag: tagName.toLowerCase(),
         attrs: attrs,
         start: match.start,
         end: match.end
       });
       lastTag = tagName;
     }
     if (options.start) {
       options.start(tagName, attrs, unary, match.start, match.end);
     }
   }
   function parseEndTag(tagName, start, end) {
     var pos, lowerCasedTagName;
     if (start == null)
       start = index;
     if (end == null)
       end = index;
     // Find the closest opened tag of the same type
     if (tagName) {
       lowerCasedTagName = tagName.toLowerCase();
       for (pos = stack.length - 1; pos >= 0; pos--) {
         if (stack[pos].lowerCasedTag === lowerCasedTagName) {
           break;
         }
       }
     }
     else {
       // If no tag name is provided, clean shop
       pos = 0;
     }
     if (pos >= 0) {
       // Close all the open elements, up the stack
       for (var i = stack.length - 1; i >= pos; i--) {
         if ((i > pos || !tagName) && options.warn) {
           options.warn("tag <".concat(stack[i].tag, "> has no matching end tag."), {
             start: stack[i].start,
             end: stack[i].end
           });
         }
         if (options.end) {
           options.end(stack[i].tag, start, end);
         }
       }
       // Remove the open elements from the stack
       stack.length = pos;
       lastTag = pos && stack[pos - 1].tag;
     }
     else if (lowerCasedTagName === 'br') {
       if (options.start) {
         options.start(tagName, [], true, start, end);
       }
     }
     else if (lowerCasedTagName === 'p') {
       if (options.start) {
         options.start(tagName, [], false, start, end);
       }
       if (options.end) {
         options.end(tagName, start, end);
       }
     }
   }
 }
 
 var onRE = /^@|^v-on:/;
 var dirRE = /^v-|^@|^:|^#/;
 var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
 var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
 var stripParensRE = /^\(|\)$/g;
 var dynamicArgRE = /^\[.*\]$/;
 var argRE = /:(.*)$/;
 var bindRE = /^:|^\.|^v-bind:/;
 var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
 var slotRE = /^v-slot(:|$)|^#/;
 var lineBreakRE = /[\r\n]/;
 var whitespaceRE = /[ \f\t\r\n]+/g;
 var invalidAttributeRE = /[\s"'<>\/=]/;
 var decodeHTMLCached = cached(he.decode);
 var emptySlotScopeToken = "_empty_";
 // configurable state
 var warn;
 var delimiters;
 var transforms;
 var preTransforms;
 var postTransforms;
 var platformIsPreTag;
 var platformMustUseProp;
 var platformGetTagNamespace;
 var maybeComponent;
 function createASTElement(tag, attrs, parent) {
   return {
     type: 1,
     tag: tag,
     attrsList: attrs,
     attrsMap: makeAttrsMap(attrs),
     rawAttrsMap: {},
     parent: parent,
     children: []
   };
 }
 /**
  * Convert HTML string to AST.
  */
 function parse(template, options) {
   warn = options.warn || baseWarn;
   platformIsPreTag = options.isPreTag || no;
   platformMustUseProp = options.mustUseProp || no;
   platformGetTagNamespace = options.getTagNamespace || no;
   var isReservedTag = options.isReservedTag || no;
   maybeComponent = function (el) {
     return !!(el.component ||
       el.attrsMap[':is'] ||
       el.attrsMap['v-bind:is'] ||
       !(el.attrsMap.is ? isReservedTag(el.attrsMap.is) : isReservedTag(el.tag)));
   };
   transforms = pluckModuleFunction(options.modules, 'transformNode');
   preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
   postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
   delimiters = options.delimiters;
   var stack = [];
   var preserveWhitespace = options.preserveWhitespace !== false;
   var whitespaceOption = options.whitespace;
   var root;
   var currentParent;
   var inVPre = false;
   var inPre = false;
   var warned = false;
   function warnOnce(msg, range) {
     if (!warned) {
       warned = true;
       warn(msg, range);
     }
   }
   function closeElement(element) {
     trimEndingWhitespace(element);
     if (!inVPre && !element.processed) {
       element = processElement(element, options);
     }
     // tree management
     if (!stack.length && element !== root) {
       // allow root elements with v-if, v-else-if and v-else
       if (root.if && (element.elseif || element.else)) {
         {
           checkRootConstraints(element);
         }
         addIfCondition(root, {
           exp: element.elseif,
           block: element
         });
       }
       else {
         warnOnce("Component template should contain exactly one root element. " +
           "If you are using v-if on multiple elements, " +
           "use v-else-if to chain them instead.", { start: element.start });
       }
     }
     if (currentParent && !element.forbidden) {
       if (element.elseif || element.else) {
         processIfConditions(element, currentParent);
       }
       else {
         if (element.slotScope) {
           // scoped slot
           // keep it in the children list so that v-else(-if) conditions can
           // find it as the prev node.
           var name_1 = element.slotTarget || '"default"';
           (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name_1] = element;
         }
         currentParent.children.push(element);
         element.parent = currentParent;
       }
     }
     // final children cleanup
     // filter out scoped slots
     element.children = element.children.filter(function (c) { return !c.slotScope; });
     // remove trailing whitespace node again
     trimEndingWhitespace(element);
     // check pre state
     if (element.pre) {
       inVPre = false;
     }
     if (platformIsPreTag(element.tag)) {
       inPre = false;
     }
     // apply post-transforms
     for (var i = 0; i < postTransforms.length; i++) {
       postTransforms[i](element, options);
     }
   }
   function trimEndingWhitespace(el) {
     // remove trailing whitespace node
     if (!inPre) {
       var lastNode = void 0;
       while ((lastNode = el.children[el.children.length - 1]) &&
         lastNode.type === 3 &&
         lastNode.text === ' ') {
         el.children.pop();
       }
     }
   }
   function checkRootConstraints(el) {
     if (el.tag === 'slot' || el.tag === 'template') {
       warnOnce("Cannot use <".concat(el.tag, "> as component root element because it may ") +
         'contain multiple nodes.', { start: el.start });
     }
     if (el.attrsMap.hasOwnProperty('v-for')) {
       warnOnce('Cannot use v-for on stateful component root element because ' +
         'it renders multiple elements.', el.rawAttrsMap['v-for']);
     }
   }
   parseHTML(template, {
     warn: warn,
     expectHTML: options.expectHTML,
     isUnaryTag: options.isUnaryTag,
     canBeLeftOpenTag: options.canBeLeftOpenTag,
     shouldDecodeNewlines: options.shouldDecodeNewlines,
     shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
     shouldKeepComment: options.comments,
     outputSourceRange: options.outputSourceRange,
     start: function (tag, attrs, unary, start, end) {
       // check namespace.
       // inherit parent ns if there is one
       var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);
       // handle IE svg bug
       /* istanbul ignore if */
       if (isIE && ns === 'svg') {
         attrs = guardIESVGBug(attrs);
       }
       var element = createASTElement(tag, attrs, currentParent);
       if (ns) {
         element.ns = ns;
       }
       {
         if (options.outputSourceRange) {
           element.start = start;
           element.end = end;
           element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
             cumulated[attr.name] = attr;
             return cumulated;
           }, {});
         }
         attrs.forEach(function (attr) {
           if (invalidAttributeRE.test(attr.name)) {
             warn("Invalid dynamic argument expression: attribute names cannot contain " +
               "spaces, quotes, <, >, / or =.", options.outputSourceRange
               ? {
                 start: attr.start + attr.name.indexOf("["),
                 end: attr.start + attr.name.length
               }
               : undefined);
           }
         });
       }
       if (isForbiddenTag(element) && !isServerRendering()) {
         element.forbidden = true;
         warn('Templates should only be responsible for mapping the state to the ' +
           'UI. Avoid placing tags with side-effects in your templates, such as ' +
           "<".concat(tag, ">") +
           ', as they will not be parsed.', { start: element.start });
       }
       // apply pre-transforms
       for (var i = 0; i < preTransforms.length; i++) {
         element = preTransforms[i](element, options) || element;
       }
       if (!inVPre) {
         processPre(element);
         if (element.pre) {
           inVPre = true;
         }
       }
       if (platformIsPreTag(element.tag)) {
         inPre = true;
       }
       if (inVPre) {
         processRawAttrs(element);
       }
       else if (!element.processed) {
         // structural directives
         processFor(element);
         processIf(element);
         processOnce(element);
       }
       if (!root) {
         root = element;
         {
           checkRootConstraints(root);
         }
       }
       if (!unary) {
         currentParent = element;
         stack.push(element);
       }
       else {
         closeElement(element);
       }
     },
     end: function (tag, start, end) {
       var element = stack[stack.length - 1];
       // pop stack
       stack.length -= 1;
       currentParent = stack[stack.length - 1];
       if (options.outputSourceRange) {
         element.end = end;
       }
       closeElement(element);
     },
     chars: function (text, start, end) {
       if (!currentParent) {
         {
           if (text === template) {
             warnOnce('Component template requires a root element, rather than just text.', { start: start });
           }
           else if ((text = text.trim())) {
             warnOnce("text \"".concat(text, "\" outside root element will be ignored."), {
               start: start
             });
           }
         }
         return;
       }
       // IE textarea placeholder bug
       /* istanbul ignore if */
       if (isIE &&
         currentParent.tag === 'textarea' &&
         currentParent.attrsMap.placeholder === text) {
         return;
       }
       var children = currentParent.children;
       if (inPre || text.trim()) {
         text = isTextTag(currentParent)
           ? text
           : decodeHTMLCached(text);
       }
       else if (!children.length) {
         // remove the whitespace-only node right after an opening tag
         text = '';
       }
       else if (whitespaceOption) {
         if (whitespaceOption === 'condense') {
           // in condense mode, remove the whitespace node if it contains
           // line break, otherwise condense to a single space
           text = lineBreakRE.test(text) ? '' : ' ';
         }
         else {
           text = ' ';
         }
       }
       else {
         text = preserveWhitespace ? ' ' : '';
       }
       if (text) {
         if (!inPre && whitespaceOption === 'condense') {
           // condense consecutive whitespaces into single space
           text = text.replace(whitespaceRE, ' ');
         }
         var res = void 0;
         var child = void 0;
         if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
           child = {
             type: 2,
             expression: res.expression,
             tokens: res.tokens,
             text: text
           };
         }
         else if (text !== ' ' ||
           !children.length ||
           children[children.length - 1].text !== ' ') {
           child = {
             type: 3,
             text: text
           };
         }
         if (child) {
           if (options.outputSourceRange) {
             child.start = start;
             child.end = end;
           }
           children.push(child);
         }
       }
     },
     comment: function (text, start, end) {
       // adding anything as a sibling to the root node is forbidden
       // comments should still be allowed, but ignored
       if (currentParent) {
         var child = {
           type: 3,
           text: text,
           isComment: true
         };
         if (options.outputSourceRange) {
           child.start = start;
           child.end = end;
         }
         currentParent.children.push(child);
       }
     }
   });
   return root;
 }
 function processPre(el) {
   if (getAndRemoveAttr(el, 'v-pre') != null) {
     el.pre = true;
   }
 }
 function processRawAttrs(el) {
   var list = el.attrsList;
   var len = list.length;
   if (len) {
     var attrs = (el.attrs = new Array(len));
     for (var i = 0; i < len; i++) {
       attrs[i] = {
         name: list[i].name,
         value: JSON.stringify(list[i].value)
       };
       if (list[i].start != null) {
         attrs[i].start = list[i].start;
         attrs[i].end = list[i].end;
       }
     }
   }
   else if (!el.pre) {
     // non root node in pre blocks with no attributes
     el.plain = true;
   }
 }
 function processElement(element, options) {
   processKey(element);
   // determine whether this is a plain element after
   // removing structural attributes
   element.plain =
     !element.key && !element.scopedSlots && !element.attrsList.length;
   processRef(element);
   processSlotContent(element);
   processSlotOutlet(element);
   processComponent(element);
   for (var i = 0; i < transforms.length; i++) {
     element = transforms[i](element, options) || element;
   }
   processAttrs(element);
   return element;
 }
 function processKey(el) {
   var exp = getBindingAttr(el, 'key');
   if (exp) {
     {
       if (el.tag === 'template') {
         warn("<template> cannot be keyed. Place the key on real elements instead.", getRawBindingAttr(el, 'key'));
       }
       if (el.for) {
         var iterator = el.iterator2 || el.iterator1;
         var parent_1 = el.parent;
         if (iterator &&
           iterator === exp &&
           parent_1 &&
           parent_1.tag === 'transition-group') {
           warn("Do not use v-for index as key on <transition-group> children, " +
             "this is the same as not using keys.", getRawBindingAttr(el, 'key'), true /* tip */);
         }
       }
     }
     el.key = exp;
   }
 }
 function processRef(el) {
   var ref = getBindingAttr(el, 'ref');
   if (ref) {
     el.ref = ref;
     el.refInFor = checkInFor(el);
   }
 }
 function processFor(el) {
   var exp;
   if ((exp = getAndRemoveAttr(el, 'v-for'))) {
     var res = parseFor(exp);
     if (res) {
       extend(el, res);
     }
     else {
       warn("Invalid v-for expression: ".concat(exp), el.rawAttrsMap['v-for']);
     }
   }
 }
 function parseFor(exp) {
   var inMatch = exp.match(forAliasRE);
   if (!inMatch)
     return;
   var res = {};
   res.for = inMatch[2].trim();
   var alias = inMatch[1].trim().replace(stripParensRE, '');
   var iteratorMatch = alias.match(forIteratorRE);
   if (iteratorMatch) {
     res.alias = alias.replace(forIteratorRE, '').trim();
     res.iterator1 = iteratorMatch[1].trim();
     if (iteratorMatch[2]) {
       res.iterator2 = iteratorMatch[2].trim();
     }
   }
   else {
     res.alias = alias;
   }
   return res;
 }
 function processIf(el) {
   var exp = getAndRemoveAttr(el, 'v-if');
   if (exp) {
     el.if = exp;
     addIfCondition(el, {
       exp: exp,
       block: el
     });
   }
   else {
     if (getAndRemoveAttr(el, 'v-else') != null) {
       el.else = true;
     }
     var elseif = getAndRemoveAttr(el, 'v-else-if');
     if (elseif) {
       el.elseif = elseif;
     }
   }
 }
 function processIfConditions(el, parent) {
   var prev = findPrevElement(parent.children);
   if (prev && prev.if) {
     addIfCondition(prev, {
       exp: el.elseif,
       block: el
     });
   }
   else {
     warn("v-".concat(el.elseif ? 'else-if="' + el.elseif + '"' : 'else', " ") +
       "used on element <".concat(el.tag, "> without corresponding v-if."), el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']);
   }
 }
 function findPrevElement(children) {
   var i = children.length;
   while (i--) {
     if (children[i].type === 1) {
       return children[i];
     }
     else {
       if (children[i].text !== ' ') {
         warn("text \"".concat(children[i].text.trim(), "\" between v-if and v-else(-if) ") +
           "will be ignored.", children[i]);
       }
       children.pop();
     }
   }
 }
 function addIfCondition(el, condition) {
   if (!el.ifConditions) {
     el.ifConditions = [];
   }
   el.ifConditions.push(condition);
 }
 function processOnce(el) {
   var once = getAndRemoveAttr(el, 'v-once');
   if (once != null) {
     el.once = true;
   }
 }
 // handle content being passed to a component as slot,
 // e.g. <template slot="xxx">, <div slot-scope="xxx">
 function processSlotContent(el) {
   var slotScope;
   if (el.tag === 'template') {
     slotScope = getAndRemoveAttr(el, 'scope');
     /* istanbul ignore if */
     if (slotScope) {
       warn("the \"scope\" attribute for scoped slots have been deprecated and " +
         "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
         "can also be used on plain elements in addition to <template> to " +
         "denote scoped slots.", el.rawAttrsMap['scope'], true);
     }
     el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
   }
   else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
     /* istanbul ignore if */
     if (el.attrsMap['v-for']) {
       warn("Ambiguous combined usage of slot-scope and v-for on <".concat(el.tag, "> ") +
         "(v-for takes higher priority). Use a wrapper <template> for the " +
         "scoped slot to make it clearer.", el.rawAttrsMap['slot-scope'], true);
     }
     el.slotScope = slotScope;
   }
   // slot="xxx"
   var slotTarget = getBindingAttr(el, 'slot');
   if (slotTarget) {
     el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
     el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
     // preserve slot as an attribute for native shadow DOM compat
     // only for non-scoped slots.
     if (el.tag !== 'template' && !el.slotScope) {
       addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
     }
   }
   // 2.6 v-slot syntax
   {
     if (el.tag === 'template') {
       // v-slot on <template>
       var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
       if (slotBinding) {
         {
           if (el.slotTarget || el.slotScope) {
             warn("Unexpected mixed usage of different slot syntaxes.", el);
           }
           if (el.parent && !maybeComponent(el.parent)) {
             warn("<template v-slot> can only appear at the root level inside " +
               "the receiving component", el);
           }
         }
         var _a = getSlotName(slotBinding), name_2 = _a.name, dynamic = _a.dynamic;
         el.slotTarget = name_2;
         el.slotTargetDynamic = dynamic;
         el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
       }
     }
     else {
       // v-slot on component, denotes default slot
       var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
       if (slotBinding) {
         {
           if (!maybeComponent(el)) {
             warn("v-slot can only be used on components or <template>.", slotBinding);
           }
           if (el.slotScope || el.slotTarget) {
             warn("Unexpected mixed usage of different slot syntaxes.", el);
           }
           if (el.scopedSlots) {
             warn("To avoid scope ambiguity, the default slot should also use " +
               "<template> syntax when there are other named slots.", slotBinding);
           }
         }
         // add the component's children to its default slot
         var slots = el.scopedSlots || (el.scopedSlots = {});
         var _b = getSlotName(slotBinding), name_3 = _b.name, dynamic = _b.dynamic;
         var slotContainer_1 = (slots[name_3] = createASTElement('template', [], el));
         slotContainer_1.slotTarget = name_3;
         slotContainer_1.slotTargetDynamic = dynamic;
         slotContainer_1.children = el.children.filter(function (c) {
           if (!c.slotScope) {
             c.parent = slotContainer_1;
             return true;
           }
         });
         slotContainer_1.slotScope = slotBinding.value || emptySlotScopeToken;
         // remove children as they are returned from scopedSlots now
         el.children = [];
         // mark el non-plain so data gets generated
         el.plain = false;
       }
     }
   }
 }
 function getSlotName(binding) {
   var name = binding.name.replace(slotRE, '');
   if (!name) {
     if (binding.name[0] !== '#') {
       name = 'default';
     }
     else {
       warn("v-slot shorthand syntax requires a slot name.", binding);
     }
   }
   return dynamicArgRE.test(name)
     ? // dynamic [name]
     { name: name.slice(1, -1), dynamic: true }
     : // static name
     { name: "\"".concat(name, "\""), dynamic: false };
 }
 // handle <slot/> outlets
 function processSlotOutlet(el) {
   if (el.tag === 'slot') {
     el.slotName = getBindingAttr(el, 'name');
     if (el.key) {
       warn("`key` does not work on <slot> because slots are abstract outlets " +
         "and can possibly expand into multiple elements. " +
         "Use the key on a wrapping element instead.", getRawBindingAttr(el, 'key'));
     }
   }
 }
 function processComponent(el) {
   var binding;
   if ((binding = getBindingAttr(el, 'is'))) {
     el.component = binding;
   }
   if (getAndRemoveAttr(el, 'inline-template') != null) {
     el.inlineTemplate = true;
   }
 }
 function processAttrs(el) {
   var list = el.attrsList;
   var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
   for (i = 0, l = list.length; i < l; i++) {
     name = rawName = list[i].name;
     value = list[i].value;
     if (dirRE.test(name)) {
       // mark element as dynamic
       el.hasBindings = true;
       // modifiers
       modifiers = parseModifiers(name.replace(dirRE, ''));
       // support .foo shorthand syntax for the .prop modifier
       if (modifiers) {
         name = name.replace(modifierRE, '');
       }
       if (bindRE.test(name)) {
         // v-bind
         name = name.replace(bindRE, '');
         value = parseFilters(value);
         isDynamic = dynamicArgRE.test(name);
         if (isDynamic) {
           name = name.slice(1, -1);
         }
         if (value.trim().length === 0) {
           warn("The value for a v-bind expression cannot be empty. Found in \"v-bind:".concat(name, "\""));
         }
         if (modifiers) {
           if (modifiers.prop && !isDynamic) {
             name = camelize(name);
             if (name === 'innerHtml')
               name = 'innerHTML';
           }
           if (modifiers.camel && !isDynamic) {
             name = camelize(name);
           }
           if (modifiers.sync) {
             syncGen = genAssignmentCode(value, "$event");
             if (!isDynamic) {
               addHandler(el, "update:".concat(camelize(name)), syncGen, null, false, warn, list[i]);
               if (hyphenate(name) !== camelize(name)) {
                 addHandler(el, "update:".concat(hyphenate(name)), syncGen, null, false, warn, list[i]);
               }
             }
             else {
               // handler w/ dynamic event name
               addHandler(el, "\"update:\"+(".concat(name, ")"), syncGen, null, false, warn, list[i], true // dynamic
               );
             }
           }
         }
         if ((modifiers && modifiers.prop) ||
           (!el.component && platformMustUseProp(el.tag, el.attrsMap.type, name))) {
           addProp(el, name, value, list[i], isDynamic);
         }
         else {
           addAttr(el, name, value, list[i], isDynamic);
         }
       }
       else if (onRE.test(name)) {
         // v-on
         name = name.replace(onRE, '');
         isDynamic = dynamicArgRE.test(name);
         if (isDynamic) {
           name = name.slice(1, -1);
         }
         addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic);
       }
       else {
         // normal directives
         name = name.replace(dirRE, '');
         // parse arg
         var argMatch = name.match(argRE);
         var arg = argMatch && argMatch[1];
         isDynamic = false;
         if (arg) {
           name = name.slice(0, -(arg.length + 1));
           if (dynamicArgRE.test(arg)) {
             arg = arg.slice(1, -1);
             isDynamic = true;
           }
         }
         addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
         if (name === 'model') {
           checkForAliasModel(el, value);
         }
       }
     }
     else {
       // literal attribute
       {
         var res = parseText(value, delimiters);
         if (res) {
           warn("".concat(name, "=\"").concat(value, "\": ") +
             'Interpolation inside attributes has been removed. ' +
             'Use v-bind or the colon shorthand instead. For example, ' +
             'instead of <div id="{{ val }}">, use <div :id="val">.', list[i]);
         }
       }
       addAttr(el, name, JSON.stringify(value), list[i]);
       // #6887 firefox doesn't update muted state if set via attribute
       // even immediately after element creation
       if (!el.component &&
         name === 'muted' &&
         platformMustUseProp(el.tag, el.attrsMap.type, name)) {
         addProp(el, name, 'true', list[i]);
       }
     }
   }
 }
 function checkInFor(el) {
   var parent = el;
   while (parent) {
     if (parent.for !== undefined) {
       return true;
     }
     parent = parent.parent;
   }
   return false;
 }
 function parseModifiers(name) {
   var match = name.match(modifierRE);
   if (match) {
     var ret_1 = {};
     match.forEach(function (m) {
       ret_1[m.slice(1)] = true;
     });
     return ret_1;
   }
 }
 function makeAttrsMap(attrs) {
   var map = {};
   for (var i = 0, l = attrs.length; i < l; i++) {
     if (map[attrs[i].name] && !isIE && !isEdge) {
       warn('duplicate attribute: ' + attrs[i].name, attrs[i]);
     }
     map[attrs[i].name] = attrs[i].value;
   }
   return map;
 }
 // for script (e.g. type="x/template") or style, do not decode content
 function isTextTag(el) {
   return el.tag === 'script' || el.tag === 'style';
 }
 function isForbiddenTag(el) {
   return (el.tag === 'style' ||
     (el.tag === 'script' &&
       (!el.attrsMap.type || el.attrsMap.type === 'text/javascript')));
 }
 var ieNSBug = /^xmlns:NS\d+/;
 var ieNSPrefix = /^NS\d+:/;
 /* istanbul ignore next */
 function guardIESVGBug(attrs) {
   var res = [];
   for (var i = 0; i < attrs.length; i++) {
     var attr = attrs[i];
     if (!ieNSBug.test(attr.name)) {
       attr.name = attr.name.replace(ieNSPrefix, '');
       res.push(attr);
     }
   }
   return res;
 }
 function checkForAliasModel(el, value) {
   var _el = el;
   while (_el) {
     if (_el.for && _el.alias === value) {
       warn("<".concat(el.tag, " v-model=\"").concat(value, "\">: ") +
         "You are binding v-model directly to a v-for iteration alias. " +
         "This will not be able to modify the v-for source array because " +
         "writing to the alias is like modifying a function local variable. " +
         "Consider using an array of objects and use v-model on an object property instead.", el.rawAttrsMap['v-model']);
     }
     _el = _el.parent;
   }
 }
 
 /**
  * Expand input[v-model] with dynamic type bindings into v-if-else chains
  * Turn this:
  *   <input v-model="data[type]" :type="type">
  * into this:
  *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
  *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
  *   <input v-else :type="type" v-model="data[type]">
  */
 function preTransformNode(el, options) {
   if (el.tag === 'input') {
     var map = el.attrsMap;
     if (!map['v-model']) {
       return;
     }
     var typeBinding = void 0;
     if (map[':type'] || map['v-bind:type']) {
       typeBinding = getBindingAttr(el, 'type');
     }
     if (!map.type && !typeBinding && map['v-bind']) {
       typeBinding = "(".concat(map['v-bind'], ").type");
     }
     if (typeBinding) {
       var ifCondition = getAndRemoveAttr(el, 'v-if', true);
       var ifConditionExtra = ifCondition ? "&&(".concat(ifCondition, ")") : "";
       var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
       var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
       // 1. checkbox
       var branch0 = cloneASTElement(el);
       // process for on the main node
       processFor(branch0);
       addRawAttr(branch0, 'type', 'checkbox');
       processElement(branch0, options);
       branch0.processed = true; // prevent it from double-processed
       branch0.if = "(".concat(typeBinding, ")==='checkbox'") + ifConditionExtra;
       addIfCondition(branch0, {
         exp: branch0.if,
         block: branch0
       });
       // 2. add radio else-if condition
       var branch1 = cloneASTElement(el);
       getAndRemoveAttr(branch1, 'v-for', true);
       addRawAttr(branch1, 'type', 'radio');
       processElement(branch1, options);
       addIfCondition(branch0, {
         exp: "(".concat(typeBinding, ")==='radio'") + ifConditionExtra,
         block: branch1
       });
       // 3. other
       var branch2 = cloneASTElement(el);
       getAndRemoveAttr(branch2, 'v-for', true);
       addRawAttr(branch2, ':type', typeBinding);
       processElement(branch2, options);
       addIfCondition(branch0, {
         exp: ifCondition,
         block: branch2
       });
       if (hasElse) {
         branch0.else = true;
       }
       else if (elseIfCondition) {
         branch0.elseif = elseIfCondition;
       }
       return branch0;
     }
   }
 }
 function cloneASTElement(el) {
   return createASTElement(el.tag, el.attrsList.slice(), el.parent);
 }
 var model = {
   preTransformNode: preTransformNode
 };
 
 var modules = [klass, style, model];
 
 function text(el, dir) {
   if (dir.value) {
     addProp(el, 'textContent', "_s(".concat(dir.value, ")"), dir);
   }
 }
 
 function html(el, dir) {
   if (dir.value) {
     addProp(el, 'innerHTML', "_s(".concat(dir.value, ")"), dir);
   }
 }
 
 var directives = {
   model: model$1,
   text: text,
   html: html
 };
 
 var baseOptions = {
   expectHTML: true,
   modules: modules,
   directives: directives,
   isPreTag: isPreTag,
   isUnaryTag: isUnaryTag,
   mustUseProp: mustUseProp,
   canBeLeftOpenTag: canBeLeftOpenTag,
   isReservedTag: isReservedTag,
   getTagNamespace: getTagNamespace,
   staticKeys: genStaticKeys$1(modules)
 };
 
 var isStaticKey;
 var isPlatformReservedTag;
 var genStaticKeysCached = cached(genStaticKeys);
 /**
  * Goal of the optimizer: walk the generated template AST tree
  * and detect sub-trees that are purely static, i.e. parts of
  * the DOM that never needs to change.
  *
  * Once we detect these sub-trees, we can:
  *
  * 1. Hoist them into constants, so that we no longer need to
  *    create fresh nodes for them on each re-render;
  * 2. Completely skip them in the patching process.
  */
 function optimize(root, options) {
   if (!root)
     return;
   isStaticKey = genStaticKeysCached(options.staticKeys || '');
   isPlatformReservedTag = options.isReservedTag || no;
   // first pass: mark all non-static nodes.
   markStatic(root);
   // second pass: mark static roots.
   markStaticRoots(root, false);
 }
 function genStaticKeys(keys) {
   return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
     (keys ? ',' + keys : ''));
 }
 function markStatic(node) {
   node.static = isStatic(node);
   if (node.type === 1) {
     // do not make component slot content static. this avoids
     // 1. components not able to mutate slot nodes
     // 2. static slot content fails for hot-reloading
     if (!isPlatformReservedTag(node.tag) &&
       node.tag !== 'slot' &&
       node.attrsMap['inline-template'] == null) {
       return;
     }
     for (var i = 0, l = node.children.length; i < l; i++) {
       var child = node.children[i];
       markStatic(child);
       if (!child.static) {
         node.static = false;
       }
     }
     if (node.ifConditions) {
       for (var i = 1, l = node.ifConditions.length; i < l; i++) {
         var block = node.ifConditions[i].block;
         markStatic(block);
         if (!block.static) {
           node.static = false;
         }
       }
     }
   }
 }
 function markStaticRoots(node, isInFor) {
   if (node.type === 1) {
     if (node.static || node.once) {
       node.staticInFor = isInFor;
     }
     // For a node to qualify as a static root, it should have children that
     // are not just static text. Otherwise the cost of hoisting out will
     // outweigh the benefits and it's better off to just always render it fresh.
     if (node.static &&
       node.children.length &&
       !(node.children.length === 1 && node.children[0].type === 3)) {
       node.staticRoot = true;
       return;
     }
     else {
       node.staticRoot = false;
     }
     if (node.children) {
       for (var i = 0, l = node.children.length; i < l; i++) {
         markStaticRoots(node.children[i], isInFor || !!node.for);
       }
     }
     if (node.ifConditions) {
       for (var i = 1, l = node.ifConditions.length; i < l; i++) {
         markStaticRoots(node.ifConditions[i].block, isInFor);
       }
     }
   }
 }
 function isStatic(node) {
   if (node.type === 2) {
     // expression
     return false;
   }
   if (node.type === 3) {
     // text
     return true;
   }
   return !!(node.pre ||
     (!node.hasBindings && // no dynamic bindings
       !node.if &&
       !node.for && // not v-if or v-for or v-else
       !isBuiltInTag(node.tag) && // not a built-in
       isPlatformReservedTag(node.tag) && // not a component
       !isDirectChildOfTemplateFor(node) &&
       Object.keys(node).every(isStaticKey)));
 }
 function isDirectChildOfTemplateFor(node) {
   while (node.parent) {
     node = node.parent;
     if (node.tag !== 'template') {
       return false;
     }
     if (node.for) {
       return true;
     }
   }
   return false;
 }
 
 var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
 var fnInvokeRE = /\([^)]*?\);*$/;
 var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;
 // KeyboardEvent.keyCode aliases
 var keyCodes = {
   esc: 27,
   tab: 9,
   enter: 13,
   space: 32,
   up: 38,
   left: 37,
   right: 39,
   down: 40,
   delete: [8, 46]
 };
 // KeyboardEvent.key aliases
 var keyNames = {
   // #7880: IE11 and Edge use `Esc` for Escape key name.
   esc: ['Esc', 'Escape'],
   tab: 'Tab',
   enter: 'Enter',
   // #9112: IE11 uses `Spacebar` for Space key name.
   space: [' ', 'Spacebar'],
   // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
   up: ['Up', 'ArrowUp'],
   left: ['Left', 'ArrowLeft'],
   right: ['Right', 'ArrowRight'],
   down: ['Down', 'ArrowDown'],
   // #9112: IE11 uses `Del` for Delete key name.
   delete: ['Backspace', 'Delete', 'Del']
 };
 // #4868: modifiers that prevent the execution of the listener
 // need to explicitly return null so that we can determine whether to remove
 // the listener for .once
 var genGuard = function (condition) { return "if(".concat(condition, ")return null;"); };
 var modifierCode = {
   stop: '$event.stopPropagation();',
   prevent: '$event.preventDefault();',
   self: genGuard("$event.target !== $event.currentTarget"),
   ctrl: genGuard("!$event.ctrlKey"),
   shift: genGuard("!$event.shiftKey"),
   alt: genGuard("!$event.altKey"),
   meta: genGuard("!$event.metaKey"),
   left: genGuard("'button' in $event && $event.button !== 0"),
   middle: genGuard("'button' in $event && $event.button !== 1"),
   right: genGuard("'button' in $event && $event.button !== 2")
 };
 function genHandlers(events, isNative) {
   var prefix = isNative ? 'nativeOn:' : 'on:';
   var staticHandlers = "";
   var dynamicHandlers = "";
   for (var name_1 in events) {
     var handlerCode = genHandler(events[name_1]);
     if (events[name_1] && events[name_1].dynamic) {
       dynamicHandlers += "".concat(name_1, ",").concat(handlerCode, ",");
     }
     else {
       staticHandlers += "\"".concat(name_1, "\":").concat(handlerCode, ",");
     }
   }
   staticHandlers = "{".concat(staticHandlers.slice(0, -1), "}");
   if (dynamicHandlers) {
     return prefix + "_d(".concat(staticHandlers, ",[").concat(dynamicHandlers.slice(0, -1), "])");
   }
   else {
     return prefix + staticHandlers;
   }
 }
 function genHandler(handler) {
   if (!handler) {
     return 'function(){}';
   }
   if (Array.isArray(handler)) {
     return "[".concat(handler.map(function (handler) { return genHandler(handler); }).join(','), "]");
   }
   var isMethodPath = simplePathRE.test(handler.value);
   var isFunctionExpression = fnExpRE.test(handler.value);
   var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));
   if (!handler.modifiers) {
     if (isMethodPath || isFunctionExpression) {
       return handler.value;
     }
     return "function($event){".concat(isFunctionInvocation ? "return ".concat(handler.value) : handler.value, "}"); // inline statement
   }
   else {
     var code = '';
     var genModifierCode = '';
     var keys = [];
     var _loop_1 = function (key) {
       if (modifierCode[key]) {
         genModifierCode += modifierCode[key];
         // left/right
         if (keyCodes[key]) {
           keys.push(key);
         }
       }
       else if (key === 'exact') {
         var modifiers_1 = handler.modifiers;
         genModifierCode += genGuard(['ctrl', 'shift', 'alt', 'meta']
           .filter(function (keyModifier) { return !modifiers_1[keyModifier]; })
           .map(function (keyModifier) { return "$event.".concat(keyModifier, "Key"); })
           .join('||'));
       }
       else {
         keys.push(key);
       }
     };
     for (var key in handler.modifiers) {
       _loop_1(key);
     }
     if (keys.length) {
       code += genKeyFilter(keys);
     }
     // Make sure modifiers like prevent and stop get executed after key filtering
     if (genModifierCode) {
       code += genModifierCode;
     }
     var handlerCode = isMethodPath
       ? "return ".concat(handler.value, ".apply(null, arguments)")
       : isFunctionExpression
         ? "return (".concat(handler.value, ").apply(null, arguments)")
         : isFunctionInvocation
           ? "return ".concat(handler.value)
           : handler.value;
     return "function($event){".concat(code).concat(handlerCode, "}");
   }
 }
 function genKeyFilter(keys) {
   return (
     // make sure the key filters only apply to KeyboardEvents
     // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
     // key events that do not have keyCode property...
     "if(!$event.type.indexOf('key')&&" +
     "".concat(keys.map(genFilterCode).join('&&'), ")return null;"));
 }
 function genFilterCode(key) {
   var keyVal = parseInt(key, 10);
   if (keyVal) {
     return "$event.keyCode!==".concat(keyVal);
   }
   var keyCode = keyCodes[key];
   var keyName = keyNames[key];
   return ("_k($event.keyCode," +
     "".concat(JSON.stringify(key), ",") +
     "".concat(JSON.stringify(keyCode), ",") +
     "$event.key," +
     "".concat(JSON.stringify(keyName)) +
     ")");
 }
 
 function on(el, dir) {
   if (dir.modifiers) {
     warn$2("v-on without argument does not support modifiers.");
   }
   el.wrapListeners = function (code) { return "_g(".concat(code, ",").concat(dir.value, ")"); };
 }
 
 function bind(el, dir) {
   el.wrapData = function (code) {
     return "_b(".concat(code, ",'").concat(el.tag, "',").concat(dir.value, ",").concat(dir.modifiers && dir.modifiers.prop ? 'true' : 'false').concat(dir.modifiers && dir.modifiers.sync ? ',true' : '', ")");
   };
 }
 
 var baseDirectives = {
   on: on,
   bind: bind,
   cloak: noop
 };
 
 var CodegenState = /** @class */ (function () {
   function CodegenState(options) {
     this.options = options;
     this.warn = options.warn || baseWarn;
     this.transforms = pluckModuleFunction(options.modules, 'transformCode');
     this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
     this.directives = extend(extend({}, baseDirectives), options.directives);
     var isReservedTag = options.isReservedTag || no;
     this.maybeComponent = function (el) {
       return !!el.component || !isReservedTag(el.tag);
     };
     this.onceId = 0;
     this.staticRenderFns = [];
     this.pre = false;
   }
   return CodegenState;
 }());
 function generate(ast, options) {
   var state = new CodegenState(options);
   // fix #11483, Root level <script> tags should not be rendered.
   var code = ast
     ? ast.tag === 'script'
       ? 'null'
       : genElement(ast, state)
     : '_c("div")';
   return {
     render: "with(this){return ".concat(code, "}"),
     staticRenderFns: state.staticRenderFns
   };
 }
 function genElement(el, state) {
   if (el.parent) {
     el.pre = el.pre || el.parent.pre;
   }
   if (el.staticRoot && !el.staticProcessed) {
     return genStatic(el, state);
   }
   else if (el.once && !el.onceProcessed) {
     return genOnce(el, state);
   }
   else if (el.for && !el.forProcessed) {
     return genFor(el, state);
   }
   else if (el.if && !el.ifProcessed) {
     return genIf(el, state);
   }
   else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
     return genChildren(el, state) || 'void 0';
   }
   else if (el.tag === 'slot') {
     return genSlot(el, state);
   }
   else {
     // component or element
     var code = void 0;
     if (el.component) {
       code = genComponent(el.component, el, state);
     }
     else {
       var data = void 0;
       var maybeComponent = state.maybeComponent(el);
       if (!el.plain || (el.pre && maybeComponent)) {
         data = genData(el, state);
       }
       var tag
         // check if this is a component in <script setup>
         = void 0;
       // check if this is a component in <script setup>
       var bindings = state.options.bindings;
       if (maybeComponent && bindings && bindings.__isScriptSetup !== false) {
         tag = checkBindingType(bindings, el.tag);
       }
       if (!tag)
         tag = "'".concat(el.tag, "'");
       var children = el.inlineTemplate ? null : genChildren(el, state, true);
       code = "_c(".concat(tag).concat(data ? ",".concat(data) : '' // data
       ).concat(children ? ",".concat(children) : '' // children
         , ")");
     }
     // module transforms
     for (var i = 0; i < state.transforms.length; i++) {
       code = state.transforms[i](el, code);
     }
     return code;
   }
 }
 function checkBindingType(bindings, key) {
   var camelName = camelize(key);
   var PascalName = capitalize(camelName);
   var checkType = function (type) {
     if (bindings[key] === type) {
       return key;
     }
     if (bindings[camelName] === type) {
       return camelName;
     }
     if (bindings[PascalName] === type) {
       return PascalName;
     }
   };
   var fromConst = checkType("setup-const" /* BindingTypes.SETUP_CONST */) ||
     checkType("setup-reactive-const" /* BindingTypes.SETUP_REACTIVE_CONST */);
   if (fromConst) {
     return fromConst;
   }
   var fromMaybeRef = checkType("setup-let" /* BindingTypes.SETUP_LET */) ||
     checkType("setup-ref" /* BindingTypes.SETUP_REF */) ||
     checkType("setup-maybe-ref" /* BindingTypes.SETUP_MAYBE_REF */);
   if (fromMaybeRef) {
     return fromMaybeRef;
   }
 }
 // hoist static sub-trees out
 function genStatic(el, state) {
   el.staticProcessed = true;
   // Some elements (templates) need to behave differently inside of a v-pre
   // node.  All pre nodes are static roots, so we can use this as a location to
   // wrap a state change and reset it upon exiting the pre node.
   var originalPreState = state.pre;
   if (el.pre) {
     state.pre = el.pre;
   }
   state.staticRenderFns.push("with(this){return ".concat(genElement(el, state), "}"));
   state.pre = originalPreState;
   return "_m(".concat(state.staticRenderFns.length - 1).concat(el.staticInFor ? ',true' : '', ")");
 }
 // v-once
 function genOnce(el, state) {
   el.onceProcessed = true;
   if (el.if && !el.ifProcessed) {
     return genIf(el, state);
   }
   else if (el.staticInFor) {
     var key = '';
     var parent_1 = el.parent;
     while (parent_1) {
       if (parent_1.for) {
         key = parent_1.key;
         break;
       }
       parent_1 = parent_1.parent;
     }
     if (!key) {
       state.warn("v-once can only be used inside v-for that is keyed. ", el.rawAttrsMap['v-once']);
       return genElement(el, state);
     }
     return "_o(".concat(genElement(el, state), ",").concat(state.onceId++, ",").concat(key, ")");
   }
   else {
     return genStatic(el, state);
   }
 }
 function genIf(el, state, altGen, altEmpty) {
   el.ifProcessed = true; // avoid recursion
   return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty);
 }
 function genIfConditions(conditions, state, altGen, altEmpty) {
   if (!conditions.length) {
     return altEmpty || '_e()';
   }
   var condition = conditions.shift();
   if (condition.exp) {
     return "(".concat(condition.exp, ")?").concat(genTernaryExp(condition.block), ":").concat(genIfConditions(conditions, state, altGen, altEmpty));
   }
   else {
     return "".concat(genTernaryExp(condition.block));
   }
   // v-if with v-once should generate code like (a)?_m(0):_m(1)
   function genTernaryExp(el) {
     return altGen
       ? altGen(el, state)
       : el.once
         ? genOnce(el, state)
         : genElement(el, state);
   }
 }
 function genFor(el, state, altGen, altHelper) {
   var exp = el.for;
   var alias = el.alias;
   var iterator1 = el.iterator1 ? ",".concat(el.iterator1) : '';
   var iterator2 = el.iterator2 ? ",".concat(el.iterator2) : '';
   if (state.maybeComponent(el) &&
     el.tag !== 'slot' &&
     el.tag !== 'template' &&
     !el.key) {
     state.warn("<".concat(el.tag, " v-for=\"").concat(alias, " in ").concat(exp, "\">: component lists rendered with ") +
       "v-for should have explicit keys. " +
       "See https://v2.vuejs.org/v2/guide/list.html#key for more info.", el.rawAttrsMap['v-for'], true /* tip */);
   }
   el.forProcessed = true; // avoid recursion
   return ("".concat(altHelper || '_l', "((").concat(exp, "),") +
     "function(".concat(alias).concat(iterator1).concat(iterator2, "){") +
     "return ".concat((altGen || genElement)(el, state)) +
     '})');
 }
 function genData(el, state) {
   var data = '{';
   // directives first.
   // directives may mutate the el's other properties before they are generated.
   var dirs = genDirectives(el, state);
   if (dirs)
     data += dirs + ',';
   // key
   if (el.key) {
     data += "key:".concat(el.key, ",");
   }
   // ref
   if (el.ref) {
     data += "ref:".concat(el.ref, ",");
   }
   if (el.refInFor) {
     data += "refInFor:true,";
   }
   // pre
   if (el.pre) {
     data += "pre:true,";
   }
   // record original tag name for components using "is" attribute
   if (el.component) {
     data += "tag:\"".concat(el.tag, "\",");
   }
   // module data generation functions
   for (var i = 0; i < state.dataGenFns.length; i++) {
     data += state.dataGenFns[i](el);
   }
   // attributes
   if (el.attrs) {
     data += "attrs:".concat(genProps(el.attrs), ",");
   }
   // DOM props
   if (el.props) {
     data += "domProps:".concat(genProps(el.props), ",");
   }
   // event handlers
   if (el.events) {
     data += "".concat(genHandlers(el.events, false), ",");
   }
   if (el.nativeEvents) {
     data += "".concat(genHandlers(el.nativeEvents, true), ",");
   }
   // slot target
   // only for non-scoped slots
   if (el.slotTarget && !el.slotScope) {
     data += "slot:".concat(el.slotTarget, ",");
   }
   // scoped slots
   if (el.scopedSlots) {
     data += "".concat(genScopedSlots(el, el.scopedSlots, state), ",");
   }
   // component v-model
   if (el.model) {
     data += "model:{value:".concat(el.model.value, ",callback:").concat(el.model.callback, ",expression:").concat(el.model.expression, "},");
   }
   // inline-template
   if (el.inlineTemplate) {
     var inlineTemplate = genInlineTemplate(el, state);
     if (inlineTemplate) {
       data += "".concat(inlineTemplate, ",");
     }
   }
   data = data.replace(/,$/, '') + '}';
   // v-bind dynamic argument wrap
   // v-bind with dynamic arguments must be applied using the same v-bind object
   // merge helper so that class/style/mustUseProp attrs are handled correctly.
   if (el.dynamicAttrs) {
     data = "_b(".concat(data, ",\"").concat(el.tag, "\",").concat(genProps(el.dynamicAttrs), ")");
   }
   // v-bind data wrap
   if (el.wrapData) {
     data = el.wrapData(data);
   }
   // v-on data wrap
   if (el.wrapListeners) {
     data = el.wrapListeners(data);
   }
   return data;
 }
 function genDirectives(el, state) {
   var dirs = el.directives;
   if (!dirs)
     return;
   var res = 'directives:[';
   var hasRuntime = false;
   var i, l, dir, needRuntime;
   for (i = 0, l = dirs.length; i < l; i++) {
     dir = dirs[i];
     needRuntime = true;
     var gen = state.directives[dir.name];
     if (gen) {
       // compile-time directive that manipulates AST.
       // returns true if it also needs a runtime counterpart.
       needRuntime = !!gen(el, dir, state.warn);
     }
     if (needRuntime) {
       hasRuntime = true;
       res += "{name:\"".concat(dir.name, "\",rawName:\"").concat(dir.rawName, "\"").concat(dir.value
         ? ",value:(".concat(dir.value, "),expression:").concat(JSON.stringify(dir.value))
         : '').concat(dir.arg ? ",arg:".concat(dir.isDynamicArg ? dir.arg : "\"".concat(dir.arg, "\"")) : '').concat(dir.modifiers ? ",modifiers:".concat(JSON.stringify(dir.modifiers)) : '', "},");
     }
   }
   if (hasRuntime) {
     return res.slice(0, -1) + ']';
   }
 }
 function genInlineTemplate(el, state) {
   var ast = el.children[0];
   if ((el.children.length !== 1 || ast.type !== 1)) {
     state.warn('Inline-template components must have exactly one child element.', { start: el.start });
   }
   if (ast && ast.type === 1) {
     var inlineRenderFns = generate(ast, state.options);
     return "inlineTemplate:{render:function(){".concat(inlineRenderFns.render, "},staticRenderFns:[").concat(inlineRenderFns.staticRenderFns
       .map(function (code) { return "function(){".concat(code, "}"); })
       .join(','), "]}");
   }
 }
 function genScopedSlots(el, slots, state) {
   // by default scoped slots are considered "stable", this allows child
   // components with only scoped slots to skip forced updates from parent.
   // but in some cases we have to bail-out of this optimization
   // for example if the slot contains dynamic names, has v-if or v-for on them...
   var needsForceUpdate = el.for ||
     Object.keys(slots).some(function (key) {
       var slot = slots[key];
       return (slot.slotTargetDynamic || slot.if || slot.for || containsSlotChild(slot) // is passing down slot from parent which may be dynamic
       );
     });
   // #9534: if a component with scoped slots is inside a conditional branch,
   // it's possible for the same component to be reused but with different
   // compiled slot content. To avoid that, we generate a unique key based on
   // the generated code of all the slot contents.
   var needsKey = !!el.if;
   // OR when it is inside another scoped slot or v-for (the reactivity may be
   // disconnected due to the intermediate scope variable)
   // #9438, #9506
   // TODO: this can be further optimized by properly analyzing in-scope bindings
   // and skip force updating ones that do not actually use scope variables.
   if (!needsForceUpdate) {
     var parent_2 = el.parent;
     while (parent_2) {
       if ((parent_2.slotScope && parent_2.slotScope !== emptySlotScopeToken) ||
         parent_2.for) {
         needsForceUpdate = true;
         break;
       }
       if (parent_2.if) {
         needsKey = true;
       }
       parent_2 = parent_2.parent;
     }
   }
   var generatedSlots = Object.keys(slots)
     .map(function (key) { return genScopedSlot(slots[key], state); })
     .join(',');
   return "scopedSlots:_u([".concat(generatedSlots, "]").concat(needsForceUpdate ? ",null,true" : "").concat(!needsForceUpdate && needsKey ? ",null,false,".concat(hash(generatedSlots)) : "", ")");
 }
 function hash(str) {
   var hash = 5381;
   var i = str.length;
   while (i) {
     hash = (hash * 33) ^ str.charCodeAt(--i);
   }
   return hash >>> 0;
 }
 function containsSlotChild(el) {
   if (el.type === 1) {
     if (el.tag === 'slot') {
       return true;
     }
     return el.children.some(containsSlotChild);
   }
   return false;
 }
 function genScopedSlot(el, state) {
   var isLegacySyntax = el.attrsMap['slot-scope'];
   if (el.if && !el.ifProcessed && !isLegacySyntax) {
     return genIf(el, state, genScopedSlot, "null");
   }
   if (el.for && !el.forProcessed) {
     return genFor(el, state, genScopedSlot);
   }
   var slotScope = el.slotScope === emptySlotScopeToken ? "" : String(el.slotScope);
   var fn = "function(".concat(slotScope, "){") +
     "return ".concat(el.tag === 'template'
       ? el.if && isLegacySyntax
         ? "(".concat(el.if, ")?").concat(genChildren(el, state) || 'undefined', ":undefined")
         : genChildren(el, state) || 'undefined'
       : genElement(el, state), "}");
   // reverse proxy v-slot without scope on this.$slots
   var reverseProxy = slotScope ? "" : ",proxy:true";
   return "{key:".concat(el.slotTarget || "\"default\"", ",fn:").concat(fn).concat(reverseProxy, "}");
 }
 function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
   var children = el.children;
   if (children.length) {
     var el_1 = children[0];
     // optimize single v-for
     if (children.length === 1 &&
       el_1.for &&
       el_1.tag !== 'template' &&
       el_1.tag !== 'slot') {
       var normalizationType_1 = checkSkip
         ? state.maybeComponent(el_1)
           ? ",1"
           : ",0"
         : "";
       return "".concat((altGenElement || genElement)(el_1, state)).concat(normalizationType_1);
     }
     var normalizationType = checkSkip
       ? getNormalizationType(children, state.maybeComponent)
       : 0;
     var gen_1 = altGenNode || genNode;
     return "[".concat(children.map(function (c) { return gen_1(c, state); }).join(','), "]").concat(normalizationType ? ",".concat(normalizationType) : '');
   }
 }
 // determine the normalization needed for the children array.
 // 0: no normalization needed
 // 1: simple normalization needed (possible 1-level deep nested array)
 // 2: full normalization needed
 function getNormalizationType(children, maybeComponent) {
   var res = 0;
   for (var i = 0; i < children.length; i++) {
     var el = children[i];
     if (el.type !== 1) {
       continue;
     }
     if (needsNormalization(el) ||
       (el.ifConditions &&
         el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
       res = 2;
       break;
     }
     if (maybeComponent(el) ||
       (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
       res = 1;
     }
   }
   return res;
 }
 function needsNormalization(el) {
   return el.for !== undefined || el.tag === 'template' || el.tag === 'slot';
 }
 function genNode(node, state) {
   if (node.type === 1) {
     return genElement(node, state);
   }
   else if (node.type === 3 && node.isComment) {
     return genComment(node);
   }
   else {
     return genText(node);
   }
 }
 function genText(text) {
   return "_v(".concat(text.type === 2
     ? text.expression // no need for () because already wrapped in _s()
     : transformSpecialNewlines(JSON.stringify(text.text)), ")");
 }
 function genComment(comment) {
   return "_e(".concat(JSON.stringify(comment.text), ")");
 }
 function genSlot(el, state) {
   var slotName = el.slotName || '"default"';
   var children = genChildren(el, state);
   var res = "_t(".concat(slotName).concat(children ? ",function(){return ".concat(children, "}") : '');
   var attrs = el.attrs || el.dynamicAttrs
     ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) {
       return ({
         // slot props are camelized
         name: camelize(attr.name),
         value: attr.value,
         dynamic: attr.dynamic
       });
     }))
     : null;
   var bind = el.attrsMap['v-bind'];
   if ((attrs || bind) && !children) {
     res += ",null";
   }
   if (attrs) {
     res += ",".concat(attrs);
   }
   if (bind) {
     res += "".concat(attrs ? '' : ',null', ",").concat(bind);
   }
   return res + ')';
 }
 // componentName is el.component, take it as argument to shun flow's pessimistic refinement
 function genComponent(componentName, el, state) {
   var children = el.inlineTemplate ? null : genChildren(el, state, true);
   return "_c(".concat(componentName, ",").concat(genData(el, state)).concat(children ? ",".concat(children) : '', ")");
 }
 function genProps(props) {
   var staticProps = "";
   var dynamicProps = "";
   for (var i = 0; i < props.length; i++) {
     var prop = props[i];
     var value = transformSpecialNewlines(prop.value);
     if (prop.dynamic) {
       dynamicProps += "".concat(prop.name, ",").concat(value, ",");
     }
     else {
       staticProps += "\"".concat(prop.name, "\":").concat(value, ",");
     }
   }
   staticProps = "{".concat(staticProps.slice(0, -1), "}");
   if (dynamicProps) {
     return "_d(".concat(staticProps, ",[").concat(dynamicProps.slice(0, -1), "])");
   }
   else {
     return staticProps;
   }
 }
 // #3895, #4268
 function transformSpecialNewlines(text) {
   return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
 }
 
 // these keywords should not appear inside expressions, but operators like
 // typeof, instanceof and in are allowed
 var prohibitedKeywordRE = new RegExp('\\b' +
   ('do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
     'super,throw,while,yield,delete,export,import,return,switch,default,' +
     'extends,finally,continue,debugger,function,arguments')
     .split(',')
     .join('\\b|\\b') +
   '\\b');
 // these unary operators should not be used as property/method names
 var unaryOperatorsRE = new RegExp('\\b' +
   'delete,typeof,void'.split(',').join('\\s*\\([^\\)]*\\)|\\b') +
   '\\s*\\([^\\)]*\\)');
 // strip strings in expressions
 var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
 // detect problematic expressions in a template
 function detectErrors(ast, warn) {
   if (ast) {
     checkNode(ast, warn);
   }
 }
 function checkNode(node, warn) {
   if (node.type === 1) {
     for (var name_1 in node.attrsMap) {
       if (dirRE.test(name_1)) {
         var value = node.attrsMap[name_1];
         if (value) {
           var range = node.rawAttrsMap[name_1];
           if (name_1 === 'v-for') {
             checkFor(node, "v-for=\"".concat(value, "\""), warn, range);
           }
           else if (name_1 === 'v-slot' || name_1[0] === '#') {
             checkFunctionParameterExpression(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
           }
           else if (onRE.test(name_1)) {
             checkEvent(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
           }
           else {
             checkExpression(value, "".concat(name_1, "=\"").concat(value, "\""), warn, range);
           }
         }
       }
     }
     if (node.children) {
       for (var i = 0; i < node.children.length; i++) {
         checkNode(node.children[i], warn);
       }
     }
   }
   else if (node.type === 2) {
     checkExpression(node.expression, node.text, warn, node);
   }
 }
 function checkEvent(exp, text, warn, range) {
   var stripped = exp.replace(stripStringRE, '');
   var keywordMatch = stripped.match(unaryOperatorsRE);
   if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
     warn("avoid using JavaScript unary operator as property name: " +
       "\"".concat(keywordMatch[0], "\" in expression ").concat(text.trim()), range);
   }
   checkExpression(exp, text, warn, range);
 }
 function checkFor(node, text, warn, range) {
   checkExpression(node.for || '', text, warn, range);
   checkIdentifier(node.alias, 'v-for alias', text, warn, range);
   checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
   checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
 }
 function checkIdentifier(ident, type, text, warn, range) {
   if (typeof ident === 'string') {
     try {
       new Function("var ".concat(ident, "=_"));
     }
     catch (e) {
       warn("invalid ".concat(type, " \"").concat(ident, "\" in expression: ").concat(text.trim()), range);
     }
   }
 }
 function checkExpression(exp, text, warn, range) {
   try {
     new Function("return ".concat(exp));
   }
   catch (e) {
     var keywordMatch = exp
       .replace(stripStringRE, '')
       .match(prohibitedKeywordRE);
     if (keywordMatch) {
       warn("avoid using JavaScript keyword as property name: " +
         "\"".concat(keywordMatch[0], "\"\n  Raw expression: ").concat(text.trim()), range);
     }
     else {
       warn("invalid expression: ".concat(e.message, " in\n\n") +
         "    ".concat(exp, "\n\n") +
         "  Raw expression: ".concat(text.trim(), "\n"), range);
     }
   }
 }
 function checkFunctionParameterExpression(exp, text, warn, range) {
   try {
     new Function(exp, '');
   }
   catch (e) {
     warn("invalid function parameter expression: ".concat(e.message, " in\n\n") +
       "    ".concat(exp, "\n\n") +
       "  Raw expression: ".concat(text.trim(), "\n"), range);
   }
 }
 
 var range = 2;
 function generateCodeFrame(source, start, end) {
   if (start === void 0) { start = 0; }
   if (end === void 0) { end = source.length; }
   var lines = source.split(/\r?\n/);
   var count = 0;
   var res = [];
   for (var i = 0; i < lines.length; i++) {
     count += lines[i].length + 1;
     if (count >= start) {
       for (var j = i - range; j <= i + range || end > count; j++) {
         if (j < 0 || j >= lines.length)
           continue;
         res.push("".concat(j + 1).concat(repeat(" ", 3 - String(j + 1).length), "|  ").concat(lines[j]));
         var lineLength = lines[j].length;
         if (j === i) {
           // push underline
           var pad = start - (count - lineLength) + 1;
           var length_1 = end > count ? lineLength - pad : end - start;
           res.push("   |  " + repeat(" ", pad) + repeat("^", length_1));
         }
         else if (j > i) {
           if (end > count) {
             var length_2 = Math.min(end - count, lineLength);
             res.push("   |  " + repeat("^", length_2));
           }
           count += lineLength + 1;
         }
       }
       break;
     }
   }
   return res.join('\n');
 }
 function repeat(str, n) {
   var result = '';
   if (n > 0) {
     // eslint-disable-next-line no-constant-condition
     while (true) {
       // eslint-disable-line
       if (n & 1)
         result += str;
       n >>>= 1;
       if (n <= 0)
         break;
       str += str;
     }
   }
   return result;
 }
 
 function createFunction(code, errors) {
   try {
     return new Function(code);
   }
   catch (err) {
     errors.push({ err: err, code: code });
     return noop;
   }
 }
 function createCompileToFunctionFn(compile) {
   var cache = Object.create(null);
   return function compileToFunctions(template, options, vm) {
     options = extend({}, options);
     var warn = options.warn || warn$2;
     delete options.warn;
     /* istanbul ignore if */
     {
       // detect possible CSP restriction
       try {
         new Function('return 1');
       }
       catch (e) {
         if (e.toString().match(/unsafe-eval|CSP/)) {
           warn('It seems you are using the standalone build of Vue.js in an ' +
             'environment with Content Security Policy that prohibits unsafe-eval. ' +
             'The template compiler cannot work in this environment. Consider ' +
             'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
             'templates into render functions.');
         }
       }
     }
     // check cache
     var key = options.delimiters
       ? String(options.delimiters) + template
       : template;
     if (cache[key]) {
       return cache[key];
     }
     // compile
     var compiled = compile(template, options);
     // check compilation errors/tips
     {
       if (compiled.errors && compiled.errors.length) {
         if (options.outputSourceRange) {
           compiled.errors.forEach(function (e) {
             warn("Error compiling template:\n\n".concat(e.msg, "\n\n") +
               generateCodeFrame(template, e.start, e.end), vm);
           });
         }
         else {
           warn("Error compiling template:\n\n".concat(template, "\n\n") +
             compiled.errors.map(function (e) { return "- ".concat(e); }).join('\n') +
             '\n', vm);
         }
       }
       if (compiled.tips && compiled.tips.length) {
         if (options.outputSourceRange) {
           compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
         }
         else {
           compiled.tips.forEach(function (msg) { return tip(msg, vm); });
         }
       }
     }
     // turn code into functions
     var res = {};
     var fnGenErrors = [];
     res.render = createFunction(compiled.render, fnGenErrors);
     res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
       return createFunction(code, fnGenErrors);
     });
     // check function generation errors.
     // this should only happen if there is a bug in the compiler itself.
     // mostly for codegen development use
     /* istanbul ignore if */
     {
       if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
         warn("Failed to generate render function:\n\n" +
           fnGenErrors
             .map(function (_a) {
               var err = _a.err, code = _a.code;
               return "".concat(err.toString(), " in\n\n").concat(code, "\n");
             })
             .join('\n'), vm);
       }
     }
     return (cache[key] = res);
   };
 }
 
 function createCompilerCreator(baseCompile) {
   return function createCompiler(baseOptions) {
     function compile(template, options) {
       var finalOptions = Object.create(baseOptions);
       var errors = [];
       var tips = [];
       var warn = function (msg, range, tip) {
         (tip ? tips : errors).push(msg);
       };
       if (options) {
         if (options.outputSourceRange) {
           // $flow-disable-line
           var leadingSpaceLength_1 = template.match(/^\s*/)[0].length;
           warn = function (msg, range, tip) {
             var data = typeof msg === 'string' ? { msg: msg } : msg;
             if (range) {
               if (range.start != null) {
                 data.start = range.start + leadingSpaceLength_1;
               }
               if (range.end != null) {
                 data.end = range.end + leadingSpaceLength_1;
               }
             }
             (tip ? tips : errors).push(data);
           };
         }
         // merge custom modules
         if (options.modules) {
           finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
         }
         // merge custom directives
         if (options.directives) {
           finalOptions.directives = extend(Object.create(baseOptions.directives || null), options.directives);
         }
         // copy other options
         for (var key in options) {
           if (key !== 'modules' && key !== 'directives') {
             finalOptions[key] = options[key];
           }
         }
       }
       finalOptions.warn = warn;
       var compiled = baseCompile(template.trim(), finalOptions);
       {
         detectErrors(compiled.ast, warn);
       }
       compiled.errors = errors;
       compiled.tips = tips;
       return compiled;
     }
     return {
       compile: compile,
       compileToFunctions: createCompileToFunctionFn(compile)
     };
   };
 }
 
 // `createCompilerCreator` allows creating compilers that use alternative
 // parser/optimizer/codegen, e.g the SSR optimizing compiler.
 // Here we just export a default compiler using the default parts.
 var createCompiler = createCompilerCreator(function baseCompile(template, options) {
   var ast = parse(template.trim(), options);
   if (options.optimize !== false) {
     optimize(ast, options);
   }
   var code = generate(ast, options);
   return {
     ast: ast,
     render: code.render,
     staticRenderFns: code.staticRenderFns
   };
 });
 
 var _a = createCompiler(baseOptions), compileToFunctions = _a.compileToFunctions;
 
 // check whether current browser encodes a char inside attribute values
 var div;
 function getShouldDecode(href) {
   div = div || document.createElement('div');
   div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
   return div.innerHTML.indexOf('&#10;') > 0;
 }
 // #3663: IE encodes newlines inside attribute values while other browsers don't
 var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
 // #6828: chrome encodes content in a[href]
 var shouldDecodeNewlinesForHref = inBrowser
   ? getShouldDecode(true)
   : false;
 
 var idToTemplate = cached(function (id) {
   var el = query(id);
   return el && el.innerHTML;
 });
 var mount = Vue.prototype.$mount;
 Vue.prototype.$mount = function (el, hydrating) {
   el = el && query(el);
   /* istanbul ignore if */
   if (el === document.body || el === document.documentElement) {
     warn$2("Do not mount Vue to <html> or <body> - mount to normal elements instead.");
     return this;
   }
   var options = this.$options;
   // resolve template/el and convert to render function
   if (!options.render) {
     var template = options.template;
     if (template) {
       if (typeof template === 'string') {
         if (template.charAt(0) === '#') {
           template = idToTemplate(template);
           /* istanbul ignore if */
           if (!template) {
             warn$2("Template element not found or is empty: ".concat(options.template), this);
           }
         }
       }
       else if (template.nodeType) {
         template = template.innerHTML;
       }
       else {
         {
           warn$2('invalid template option:' + template, this);
         }
         return this;
       }
     }
     else if (el) {
       // @ts-expect-error
       template = getOuterHTML(el);
     }
     if (template) {
       /* istanbul ignore if */
       if (config.performance && mark) {
         mark('compile');
       }
       var _a = compileToFunctions(template, {
         outputSourceRange: true,
         shouldDecodeNewlines: shouldDecodeNewlines,
         shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
         delimiters: options.delimiters,
         comments: options.comments
       }, this), render = _a.render, staticRenderFns = _a.staticRenderFns;
       options.render = render;
       options.staticRenderFns = staticRenderFns;
       /* istanbul ignore if */
       if (config.performance && mark) {
         mark('compile end');
         measure("vue ".concat(this._name, " compile"), 'compile', 'compile end');
       }
     }
   }
   return mount.call(this, el, hydrating);
 };
 /**
  * Get outerHTML of elements, taking care
  * of SVG elements in IE as well.
  */
 function getOuterHTML(el) {
   if (el.outerHTML) {
     return el.outerHTML;
   }
   else {
     var container = document.createElement('div');
     container.appendChild(el.cloneNode(true));
     return container.innerHTML;
   }
 }
 Vue.compile = compileToFunctions;
 
 // export type EffectScheduler = (...args: any[]) => any
 /**
  * @internal since we are not exposing this in Vue 2, it's used only for
  * internal testing.
  */
 function effect(fn, scheduler) {
   var watcher = new Watcher(currentInstance, fn, noop, {
     sync: true
   });
   if (scheduler) {
     watcher.update = function () {
       scheduler(function () { return watcher.run(); });
     };
   }
 }
 
 extend(Vue, vca);
 Vue.effect = effect;