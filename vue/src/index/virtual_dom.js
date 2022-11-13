/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */
 var emptyNode = new VNode('', {}, []);
 var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
 function sameVnode(a, b) {
   return (a.key === b.key &&
     a.asyncFactory === b.asyncFactory &&
     ((a.tag === b.tag &&
       a.isComment === b.isComment &&
       isDef(a.data) === isDef(b.data) &&
       sameInputType(a, b)) ||
       (isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error))));
 }
 function sameInputType(a, b) {
   if (a.tag !== 'input')
     return true;
   var i;
   var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
   var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;
   return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB));
 }
 function createKeyToOldIdx(children, beginIdx, endIdx) {
   var i, key;
   var map = {};
   for (i = beginIdx; i <= endIdx; ++i) {
     key = children[i].key;
     if (isDef(key))
       map[key] = i;
   }
   return map;
 }
 function createPatchFunction(backend) {
   var i, j;
   var cbs = {};
   var modules = backend.modules, nodeOps = backend.nodeOps;
   for (i = 0; i < hooks.length; ++i) {
     cbs[hooks[i]] = [];
     for (j = 0; j < modules.length; ++j) {
       if (isDef(modules[j][hooks[i]])) {
         cbs[hooks[i]].push(modules[j][hooks[i]]);
       }
     }
   }
   function emptyNodeAt(elm) {
     return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
   }
   function createRmCb(childElm, listeners) {
     function remove() {
       if (--remove.listeners === 0) {
         removeNode(childElm);
       }
     }
     remove.listeners = listeners;
     return remove;
   }
   function removeNode(el) {
     var parent = nodeOps.parentNode(el);
     // element may have already been removed due to v-html / v-text
     if (isDef(parent)) {
       nodeOps.removeChild(parent, el);
     }
   }
   function isUnknownElement(vnode, inVPre) {
     return (!inVPre &&
       !vnode.ns &&
       !(config.ignoredElements.length &&
         config.ignoredElements.some(function (ignore) {
           return isRegExp(ignore)
             ? ignore.test(vnode.tag)
             : ignore === vnode.tag;
         })) &&
       config.isUnknownElement(vnode.tag));
   }
   var creatingElmInVPre = 0;
   function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
     if (isDef(vnode.elm) && isDef(ownerArray)) {
       // This vnode was used in a previous render!
       // now it's used as a new node, overwriting its elm would cause
       // potential patch errors down the road when it's used as an insertion
       // reference node. Instead, we clone the node on-demand before creating
       // associated DOM element for it.
       vnode = ownerArray[index] = cloneVNode(vnode);
     }
     vnode.isRootInsert = !nested; // for transition enter check
     if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
       return;
     }
     var data = vnode.data;
     var children = vnode.children;
     var tag = vnode.tag;
     if (isDef(tag)) {
       {
         if (data && data.pre) {
           creatingElmInVPre++;
         }
         if (isUnknownElement(vnode, creatingElmInVPre)) {
           warn$2('Unknown custom element: <' +
             tag +
             '> - did you ' +
             'register the component correctly? For recursive components, ' +
             'make sure to provide the "name" option.', vnode.context);
         }
       }
       vnode.elm = vnode.ns
         ? nodeOps.createElementNS(vnode.ns, tag)
         : nodeOps.createElement(tag, vnode);
       setScope(vnode);
       createChildren(vnode, children, insertedVnodeQueue);
       if (isDef(data)) {
         invokeCreateHooks(vnode, insertedVnodeQueue);
       }
       insert(parentElm, vnode.elm, refElm);
       if (data && data.pre) {
         creatingElmInVPre--;
       }
     }
     else if (isTrue(vnode.isComment)) {
       vnode.elm = nodeOps.createComment(vnode.text);
       insert(parentElm, vnode.elm, refElm);
     }
     else {
       vnode.elm = nodeOps.createTextNode(vnode.text);
       insert(parentElm, vnode.elm, refElm);
     }
   }
   function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
     var i = vnode.data;
     if (isDef(i)) {
       var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
       if (isDef((i = i.hook)) && isDef((i = i.init))) {
         i(vnode, false /* hydrating */);
       }
       // after calling the init hook, if the vnode is a child component
       // it should've created a child instance and mounted it. the child
       // component also has set the placeholder vnode's elm.
       // in that case we can just return the element and be done.
       if (isDef(vnode.componentInstance)) {
         initComponent(vnode, insertedVnodeQueue);
         insert(parentElm, vnode.elm, refElm);
         if (isTrue(isReactivated)) {
           reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
         }
         return true;
       }
     }
   }
   function initComponent(vnode, insertedVnodeQueue) {
     if (isDef(vnode.data.pendingInsert)) {
       insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
       vnode.data.pendingInsert = null;
     }
     vnode.elm = vnode.componentInstance.$el;
     if (isPatchable(vnode)) {
       invokeCreateHooks(vnode, insertedVnodeQueue);
       setScope(vnode);
     }
     else {
       // empty component root.
       // skip all element-related modules except for ref (#3455)
       registerRef(vnode);
       // make sure to invoke the insert hook
       insertedVnodeQueue.push(vnode);
     }
   }
   function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
     var i;
     // hack for #4339: a reactivated component with inner transition
     // does not trigger because the inner node's created hooks are not called
     // again. It's not ideal to involve module-specific logic in here but
     // there doesn't seem to be a better way to do it.
     var innerNode = vnode;
     while (innerNode.componentInstance) {
       innerNode = innerNode.componentInstance._vnode;
       if (isDef((i = innerNode.data)) && isDef((i = i.transition))) {
         for (i = 0; i < cbs.activate.length; ++i) {
           cbs.activate[i](emptyNode, innerNode);
         }
         insertedVnodeQueue.push(innerNode);
         break;
       }
     }
     // unlike a newly created component,
     // a reactivated keep-alive component doesn't insert itself
     insert(parentElm, vnode.elm, refElm);
   }
   function insert(parent, elm, ref) {
     if (isDef(parent)) {
       if (isDef(ref)) {
         if (nodeOps.parentNode(ref) === parent) {
           nodeOps.insertBefore(parent, elm, ref);
         }
       }
       else {
         nodeOps.appendChild(parent, elm);
       }
     }
   }
   function createChildren(vnode, children, insertedVnodeQueue) {
     if (isArray(children)) {
       {
         checkDuplicateKeys(children);
       }
       for (var i_1 = 0; i_1 < children.length; ++i_1) {
         createElm(children[i_1], insertedVnodeQueue, vnode.elm, null, true, children, i_1);
       }
     }
     else if (isPrimitive(vnode.text)) {
       nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
     }
   }
   function isPatchable(vnode) {
     while (vnode.componentInstance) {
       vnode = vnode.componentInstance._vnode;
     }
     return isDef(vnode.tag);
   }
   function invokeCreateHooks(vnode, insertedVnodeQueue) {
     for (var i_2 = 0; i_2 < cbs.create.length; ++i_2) {
       cbs.create[i_2](emptyNode, vnode);
     }
     i = vnode.data.hook; // Reuse variable
     if (isDef(i)) {
       if (isDef(i.create))
         i.create(emptyNode, vnode);
       if (isDef(i.insert))
         insertedVnodeQueue.push(vnode);
     }
   }
   // set scope id attribute for scoped CSS.
   // this is implemented as a special case to avoid the overhead
   // of going through the normal attribute patching process.
   function setScope(vnode) {
     var i;
     if (isDef((i = vnode.fnScopeId))) {
       nodeOps.setStyleScope(vnode.elm, i);
     }
     else {
       var ancestor = vnode;
       while (ancestor) {
         if (isDef((i = ancestor.context)) && isDef((i = i.$options._scopeId))) {
           nodeOps.setStyleScope(vnode.elm, i);
         }
         ancestor = ancestor.parent;
       }
     }
     // for slot content they should also get the scopeId from the host instance.
     if (isDef((i = activeInstance)) &&
       i !== vnode.context &&
       i !== vnode.fnContext &&
       isDef((i = i.$options._scopeId))) {
       nodeOps.setStyleScope(vnode.elm, i);
     }
   }
   function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
     for (; startIdx <= endIdx; ++startIdx) {
       createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
     }
   }
   function invokeDestroyHook(vnode) {
     var i, j;
     var data = vnode.data;
     if (isDef(data)) {
       if (isDef((i = data.hook)) && isDef((i = i.destroy)))
         i(vnode);
       for (i = 0; i < cbs.destroy.length; ++i)
         cbs.destroy[i](vnode);
     }
     if (isDef((i = vnode.children))) {
       for (j = 0; j < vnode.children.length; ++j) {
         invokeDestroyHook(vnode.children[j]);
       }
     }
   }
   function removeVnodes(vnodes, startIdx, endIdx) {
     for (; startIdx <= endIdx; ++startIdx) {
       var ch = vnodes[startIdx];
       if (isDef(ch)) {
         if (isDef(ch.tag)) {
           removeAndInvokeRemoveHook(ch);
           invokeDestroyHook(ch);
         }
         else {
           // Text node
           removeNode(ch.elm);
         }
       }
     }
   }
   function removeAndInvokeRemoveHook(vnode, rm) {
     if (isDef(rm) || isDef(vnode.data)) {
       var i_3;
       var listeners = cbs.remove.length + 1;
       if (isDef(rm)) {
         // we have a recursively passed down rm callback
         // increase the listeners count
         rm.listeners += listeners;
       }
       else {
         // directly removing
         rm = createRmCb(vnode.elm, listeners);
       }
       // recursively invoke hooks on child component root node
       if (isDef((i_3 = vnode.componentInstance)) &&
         isDef((i_3 = i_3._vnode)) &&
         isDef(i_3.data)) {
         removeAndInvokeRemoveHook(i_3, rm);
       }
       for (i_3 = 0; i_3 < cbs.remove.length; ++i_3) {
         cbs.remove[i_3](vnode, rm);
       }
       if (isDef((i_3 = vnode.data.hook)) && isDef((i_3 = i_3.remove))) {
         i_3(vnode, rm);
       }
       else {
         rm();
       }
     }
     else {
       removeNode(vnode.elm);
     }
   }
   function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
     var oldStartIdx = 0;
     var newStartIdx = 0;
     var oldEndIdx = oldCh.length - 1;
     var oldStartVnode = oldCh[0];
     var oldEndVnode = oldCh[oldEndIdx];
     var newEndIdx = newCh.length - 1;
     var newStartVnode = newCh[0];
     var newEndVnode = newCh[newEndIdx];
     var oldKeyToIdx, idxInOld, vnodeToMove, refElm;
     // removeOnly is a special flag used only by <transition-group>
     // to ensure removed elements stay in correct relative positions
     // during leaving transitions
     var canMove = !removeOnly;
     {
       checkDuplicateKeys(newCh);
     }
     while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
       if (isUndef(oldStartVnode)) {
         oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
       }
       else if (isUndef(oldEndVnode)) {
         oldEndVnode = oldCh[--oldEndIdx];
       }
       else if (sameVnode(oldStartVnode, newStartVnode)) {
         patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
         oldStartVnode = oldCh[++oldStartIdx];
         newStartVnode = newCh[++newStartIdx];
       }
       else if (sameVnode(oldEndVnode, newEndVnode)) {
         patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
         oldEndVnode = oldCh[--oldEndIdx];
         newEndVnode = newCh[--newEndIdx];
       }
       else if (sameVnode(oldStartVnode, newEndVnode)) {
         // Vnode moved right
         patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
         canMove &&
           nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
         oldStartVnode = oldCh[++oldStartIdx];
         newEndVnode = newCh[--newEndIdx];
       }
       else if (sameVnode(oldEndVnode, newStartVnode)) {
         // Vnode moved left
         patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
         canMove &&
           nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
         oldEndVnode = oldCh[--oldEndIdx];
         newStartVnode = newCh[++newStartIdx];
       }
       else {
         if (isUndef(oldKeyToIdx))
           oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
         idxInOld = isDef(newStartVnode.key)
           ? oldKeyToIdx[newStartVnode.key]
           : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
         if (isUndef(idxInOld)) {
           // New element
           createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
         }
         else {
           vnodeToMove = oldCh[idxInOld];
           if (sameVnode(vnodeToMove, newStartVnode)) {
             patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
             oldCh[idxInOld] = undefined;
             canMove &&
               nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
           }
           else {
             // same key but different element. treat as new element
             createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
           }
         }
         newStartVnode = newCh[++newStartIdx];
       }
     }
     if (oldStartIdx > oldEndIdx) {
       refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
       addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
     }
     else if (newStartIdx > newEndIdx) {
       removeVnodes(oldCh, oldStartIdx, oldEndIdx);
     }
   }
   function checkDuplicateKeys(children) {
     var seenKeys = {};
     for (var i_4 = 0; i_4 < children.length; i_4++) {
       var vnode = children[i_4];
       var key = vnode.key;
       if (isDef(key)) {
         if (seenKeys[key]) {
           warn$2("Duplicate keys detected: '".concat(key, "'. This may cause an update error."), vnode.context);
         }
         else {
           seenKeys[key] = true;
         }
       }
     }
   }
   function findIdxInOld(node, oldCh, start, end) {
     for (var i_5 = start; i_5 < end; i_5++) {
       var c = oldCh[i_5];
       if (isDef(c) && sameVnode(node, c))
         return i_5;
     }
   }
   function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
     if (oldVnode === vnode) {
       return;
     }
     if (isDef(vnode.elm) && isDef(ownerArray)) {
       // clone reused vnode
       vnode = ownerArray[index] = cloneVNode(vnode);
     }
     var elm = (vnode.elm = oldVnode.elm);
     if (isTrue(oldVnode.isAsyncPlaceholder)) {
       if (isDef(vnode.asyncFactory.resolved)) {
         hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
       }
       else {
         vnode.isAsyncPlaceholder = true;
       }
       return;
     }
     // reuse element for static trees.
     // note we only do this if the vnode is cloned -
     // if the new node is not cloned it means the render functions have been
     // reset by the hot-reload-api and we need to do a proper re-render.
     if (isTrue(vnode.isStatic) &&
       isTrue(oldVnode.isStatic) &&
       vnode.key === oldVnode.key &&
       (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
       vnode.componentInstance = oldVnode.componentInstance;
       return;
     }
     var i;
     var data = vnode.data;
     if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
       i(oldVnode, vnode);
     }
     var oldCh = oldVnode.children;
     var ch = vnode.children;
     if (isDef(data) && isPatchable(vnode)) {
       for (i = 0; i < cbs.update.length; ++i)
         cbs.update[i](oldVnode, vnode);
       if (isDef((i = data.hook)) && isDef((i = i.update)))
         i(oldVnode, vnode);
     }
     if (isUndef(vnode.text)) {
       if (isDef(oldCh) && isDef(ch)) {
         if (oldCh !== ch)
           updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
       }
       else if (isDef(ch)) {
         {
           checkDuplicateKeys(ch);
         }
         if (isDef(oldVnode.text))
           nodeOps.setTextContent(elm, '');
         addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
       }
       else if (isDef(oldCh)) {
         removeVnodes(oldCh, 0, oldCh.length - 1);
       }
       else if (isDef(oldVnode.text)) {
         nodeOps.setTextContent(elm, '');
       }
     }
     else if (oldVnode.text !== vnode.text) {
       nodeOps.setTextContent(elm, vnode.text);
     }
     if (isDef(data)) {
       if (isDef((i = data.hook)) && isDef((i = i.postpatch)))
         i(oldVnode, vnode);
     }
   }
   function invokeInsertHook(vnode, queue, initial) {
     // delay insert hooks for component root nodes, invoke them after the
     // element is really inserted
     if (isTrue(initial) && isDef(vnode.parent)) {
       vnode.parent.data.pendingInsert = queue;
     }
     else {
       for (var i_6 = 0; i_6 < queue.length; ++i_6) {
         queue[i_6].data.hook.insert(queue[i_6]);
       }
     }
   }
   var hydrationBailed = false;
   // list of modules that can skip create hook during hydration because they
   // are already rendered on the client or has no need for initialization
   // Note: style is excluded because it relies on initial clone for future
   // deep updates (#7063).
   var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');
   // Note: this is a browser-only function so we can assume elms are DOM nodes.
   function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
     var i;
     var tag = vnode.tag, data = vnode.data, children = vnode.children;
     inVPre = inVPre || (data && data.pre);
     vnode.elm = elm;
     if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
       vnode.isAsyncPlaceholder = true;
       return true;
     }
     // assert node match
     {
       if (!assertNodeMatch(elm, vnode, inVPre)) {
         return false;
       }
     }
     if (isDef(data)) {
       if (isDef((i = data.hook)) && isDef((i = i.init)))
         i(vnode, true /* hydrating */);
       if (isDef((i = vnode.componentInstance))) {
         // child component. it should have hydrated its own tree.
         initComponent(vnode, insertedVnodeQueue);
         return true;
       }
     }
     if (isDef(tag)) {
       if (isDef(children)) {
         // empty element, allow client to pick up and populate children
         if (!elm.hasChildNodes()) {
           createChildren(vnode, children, insertedVnodeQueue);
         }
         else {
           // v-html and domProps: innerHTML
           if (isDef((i = data)) &&
             isDef((i = i.domProps)) &&
             isDef((i = i.innerHTML))) {
             if (i !== elm.innerHTML) {
               /* istanbul ignore if */
               if (typeof console !== 'undefined' &&
                 !hydrationBailed) {
                 hydrationBailed = true;
                 console.warn('Parent: ', elm);
                 console.warn('server innerHTML: ', i);
                 console.warn('client innerHTML: ', elm.innerHTML);
               }
               return false;
             }
           }
           else {
             // iterate and compare children lists
             var childrenMatch = true;
             var childNode = elm.firstChild;
             for (var i_7 = 0; i_7 < children.length; i_7++) {
               if (!childNode ||
                 !hydrate(childNode, children[i_7], insertedVnodeQueue, inVPre)) {
                 childrenMatch = false;
                 break;
               }
               childNode = childNode.nextSibling;
             }
             // if childNode is not null, it means the actual childNodes list is
             // longer than the virtual children list.
             if (!childrenMatch || childNode) {
               /* istanbul ignore if */
               if (typeof console !== 'undefined' &&
                 !hydrationBailed) {
                 hydrationBailed = true;
                 console.warn('Parent: ', elm);
                 console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
               }
               return false;
             }
           }
         }
       }
       if (isDef(data)) {
         var fullInvoke = false;
         for (var key in data) {
           if (!isRenderedModule(key)) {
             fullInvoke = true;
             invokeCreateHooks(vnode, insertedVnodeQueue);
             break;
           }
         }
         if (!fullInvoke && data['class']) {
           // ensure collecting deps for deep class bindings for future updates
           traverse(data['class']);
         }
       }
     }
     else if (elm.data !== vnode.text) {
       elm.data = vnode.text;
     }
     return true;
   }
   function assertNodeMatch(node, vnode, inVPre) {
     if (isDef(vnode.tag)) {
       return (vnode.tag.indexOf('vue-component') === 0 ||
         (!isUnknownElement(vnode, inVPre) &&
           vnode.tag.toLowerCase() ===
           (node.tagName && node.tagName.toLowerCase())));
     }
     else {
       return node.nodeType === (vnode.isComment ? 8 : 3);
     }
   }
   return function patch(oldVnode, vnode, hydrating, removeOnly) {
     if (isUndef(vnode)) {
       if (isDef(oldVnode))
         invokeDestroyHook(oldVnode);
       return;
     }
     var isInitialPatch = false;
     var insertedVnodeQueue = [];
     if (isUndef(oldVnode)) {
       // empty mount (likely as component), create new root element
       isInitialPatch = true;
       createElm(vnode, insertedVnodeQueue);
     }
     else {
       var isRealElement = isDef(oldVnode.nodeType);
       if (!isRealElement && sameVnode(oldVnode, vnode)) {
         // patch existing root node
         patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
       }
       else {
         if (isRealElement) {
           // mounting to a real element
           // check if this is server-rendered content and if we can perform
           // a successful hydration.
           if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
             oldVnode.removeAttribute(SSR_ATTR);
             hydrating = true;
           }
           if (isTrue(hydrating)) {
             if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
               invokeInsertHook(vnode, insertedVnodeQueue, true);
               return oldVnode;
             }
             else {
               warn$2('The client-side rendered virtual DOM tree is not matching ' +
                 'server-rendered content. This is likely caused by incorrect ' +
                 'HTML markup, for example nesting block-level elements inside ' +
                 '<p>, or missing <tbody>. Bailing hydration and performing ' +
                 'full client-side render.');
             }
           }
           // either not server-rendered, or hydration failed.
           // create an empty node and replace it
           oldVnode = emptyNodeAt(oldVnode);
         }
         // replacing existing element
         var oldElm = oldVnode.elm;
         var parentElm = nodeOps.parentNode(oldElm);
         // create new node
         createElm(vnode, insertedVnodeQueue,
           // extremely rare edge case: do not insert if old element is in a
           // leaving transition. Only happens when combining transition +
           // keep-alive + HOCs. (#4590)
           oldElm._leaveCb ? null : parentElm, nodeOps.nextSibling(oldElm));
         // update parent placeholder node element, recursively
         if (isDef(vnode.parent)) {
           var ancestor = vnode.parent;
           var patchable = isPatchable(vnode);
           while (ancestor) {
             for (var i_8 = 0; i_8 < cbs.destroy.length; ++i_8) {
               cbs.destroy[i_8](ancestor);
             }
             ancestor.elm = vnode.elm;
             if (patchable) {
               for (var i_9 = 0; i_9 < cbs.create.length; ++i_9) {
                 cbs.create[i_9](emptyNode, ancestor);
               }
               // #6513
               // invoke insert hooks that may have been merged by create hooks.
               // e.g. for directives that uses the "inserted" hook.
               var insert_1 = ancestor.data.hook.insert;
               if (insert_1.merged) {
                 // start at index 1 to avoid re-invoking component mounted hook
                 for (var i_10 = 1; i_10 < insert_1.fns.length; i_10++) {
                   insert_1.fns[i_10]();
                 }
               }
             }
             else {
               registerRef(ancestor);
             }
             ancestor = ancestor.parent;
           }
         }
         // destroy old node
         if (isDef(parentElm)) {
           removeVnodes([oldVnode], 0, 0);
         }
         else if (isDef(oldVnode.tag)) {
           invokeDestroyHook(oldVnode);
         }
       }
     }
     invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
     return vnode.elm;
   };
 }
 
 var directives$1 = {
   create: updateDirectives,
   update: updateDirectives,
   destroy: function unbindDirectives(vnode) {
     // @ts-expect-error emptyNode is not VNodeWithData
     updateDirectives(vnode, emptyNode);
   }
 };
 function updateDirectives(oldVnode, vnode) {
   if (oldVnode.data.directives || vnode.data.directives) {
     _update(oldVnode, vnode);
   }
 }
 function _update(oldVnode, vnode) {
   var isCreate = oldVnode === emptyNode;
   var isDestroy = vnode === emptyNode;
   var oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context);
   var newDirs = normalizeDirectives(vnode.data.directives, vnode.context);
   var dirsWithInsert = [];
   var dirsWithPostpatch = [];
   var key, oldDir, dir;
   for (key in newDirs) {
     oldDir = oldDirs[key];
     dir = newDirs[key];
     if (!oldDir) {
       // new directive, bind
       callHook(dir, 'bind', vnode, oldVnode);
       if (dir.def && dir.def.inserted) {
         dirsWithInsert.push(dir);
       }
     }
     else {
       // existing directive, update
       dir.oldValue = oldDir.value;
       dir.oldArg = oldDir.arg;
       callHook(dir, 'update', vnode, oldVnode);
       if (dir.def && dir.def.componentUpdated) {
         dirsWithPostpatch.push(dir);
       }
     }
   }
   if (dirsWithInsert.length) {
     var callInsert = function () {
       for (var i = 0; i < dirsWithInsert.length; i++) {
         callHook(dirsWithInsert[i], 'inserted', vnode, oldVnode);
       }
     };
     if (isCreate) {
       mergeVNodeHook(vnode, 'insert', callInsert);
     }
     else {
       callInsert();
     }
   }
   if (dirsWithPostpatch.length) {
     mergeVNodeHook(vnode, 'postpatch', function () {
       for (var i = 0; i < dirsWithPostpatch.length; i++) {
         callHook(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
       }
     });
   }
   if (!isCreate) {
     for (key in oldDirs) {
       if (!newDirs[key]) {
         // no longer present, unbind
         callHook(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
       }
     }
   }
 }
 var emptyModifiers = Object.create(null);
 function normalizeDirectives(dirs, vm) {
   var res = Object.create(null);
   if (!dirs) {
     // $flow-disable-line
     return res;
   }
   var i, dir;
   for (i = 0; i < dirs.length; i++) {
     dir = dirs[i];
     if (!dir.modifiers) {
       // $flow-disable-line
       dir.modifiers = emptyModifiers;
     }
     res[getRawDirName(dir)] = dir;
     if (vm._setupState && vm._setupState.__sfc) {
       var setupDef = dir.def || resolveAsset(vm, '_setupState', 'v-' + dir.name);
       if (typeof setupDef === 'function') {
         dir.def = {
           bind: setupDef,
           update: setupDef,
         };
       }
       else {
         dir.def = setupDef;
       }
     }
     dir.def = dir.def || resolveAsset(vm.$options, 'directives', dir.name, true);
   }
   // $flow-disable-line
   return res;
 }
 function getRawDirName(dir) {
   return (dir.rawName || "".concat(dir.name, ".").concat(Object.keys(dir.modifiers || {}).join('.')));
 }
 function callHook(dir, hook, vnode, oldVnode, isDestroy) {
   var fn = dir.def && dir.def[hook];
   if (fn) {
     try {
       fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
     }
     catch (e) {
       handleError(e, vnode.context, "directive ".concat(dir.name, " ").concat(hook, " hook"));
     }
   }
 }
 
 var baseModules = [ref, directives$1];
 
 function updateAttrs(oldVnode, vnode) {
   var opts = vnode.componentOptions;
   if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
     return;
   }
   if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
     return;
   }
   var key, cur, old;
   var elm = vnode.elm;
   var oldAttrs = oldVnode.data.attrs || {};
   var attrs = vnode.data.attrs || {};
   // clone observed objects, as the user probably wants to mutate it
   if (isDef(attrs.__ob__) || isTrue(attrs._v_attr_proxy)) {
     attrs = vnode.data.attrs = extend({}, attrs);
   }
   for (key in attrs) {
     cur = attrs[key];
     old = oldAttrs[key];
     if (old !== cur) {
       setAttr(elm, key, cur, vnode.data.pre);
     }
   }
   // #4391: in IE9, setting type can reset value for input[type=radio]
   // #6666: IE/Edge forces progress value down to 1 before setting a max
   /* istanbul ignore if */
   if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
     setAttr(elm, 'value', attrs.value);
   }
   for (key in oldAttrs) {
     if (isUndef(attrs[key])) {
       if (isXlink(key)) {
         elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
       }
       else if (!isEnumeratedAttr(key)) {
         elm.removeAttribute(key);
       }
     }
   }
 }
 function setAttr(el, key, value, isInPre) {
   if (isInPre || el.tagName.indexOf('-') > -1) {
     baseSetAttr(el, key, value);
   }
   else if (isBooleanAttr(key)) {
     // set attribute for blank value
     // e.g. <option disabled>Select one</option>
     if (isFalsyAttrValue(value)) {
       el.removeAttribute(key);
     }
     else {
       // technically allowfullscreen is a boolean attribute for <iframe>,
       // but Flash expects a value of "true" when used on <embed> tag
       value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key;
       el.setAttribute(key, value);
     }
   }
   else if (isEnumeratedAttr(key)) {
     el.setAttribute(key, convertEnumeratedValue(key, value));
   }
   else if (isXlink(key)) {
     if (isFalsyAttrValue(value)) {
       el.removeAttributeNS(xlinkNS, getXlinkProp(key));
     }
     else {
       el.setAttributeNS(xlinkNS, key, value);
     }
   }
   else {
     baseSetAttr(el, key, value);
   }
 }
 function baseSetAttr(el, key, value) {
   if (isFalsyAttrValue(value)) {
     el.removeAttribute(key);
   }
   else {
     // #7138: IE10 & 11 fires input event when setting placeholder on
     // <textarea>... block the first input event and remove the blocker
     // immediately.
     /* istanbul ignore if */
     if (isIE &&
       !isIE9 &&
       el.tagName === 'TEXTAREA' &&
       key === 'placeholder' &&
       value !== '' &&
       !el.__ieph) {
       var blocker_1 = function (e) {
         e.stopImmediatePropagation();
         el.removeEventListener('input', blocker_1);
       };
       el.addEventListener('input', blocker_1);
       // $flow-disable-line
       el.__ieph = true; /* IE placeholder patched */
     }
     el.setAttribute(key, value);
   }
 }
 var attrs = {
   create: updateAttrs,
   update: updateAttrs
 };
 
 function updateClass(oldVnode, vnode) {
   var el = vnode.elm;
   var data = vnode.data;
   var oldData = oldVnode.data;
   if (isUndef(data.staticClass) &&
     isUndef(data.class) &&
     (isUndef(oldData) ||
       (isUndef(oldData.staticClass) && isUndef(oldData.class)))) {
     return;
   }
   var cls = genClassForVnode(vnode);
   // handle transition classes
   var transitionClass = el._transitionClasses;
   if (isDef(transitionClass)) {
     cls = concat(cls, stringifyClass(transitionClass));
   }
   // set the class
   if (cls !== el._prevClass) {
     el.setAttribute('class', cls);
     el._prevClass = cls;
   }
 }
 var klass$1 = {
   create: updateClass,
   update: updateClass
 };
 
 var validDivisionCharRE = /[\w).+\-_$\]]/;
 function parseFilters(exp) {
   var inSingle = false;
   var inDouble = false;
   var inTemplateString = false;
   var inRegex = false;
   var curly = 0;
   var square = 0;
   var paren = 0;
   var lastFilterIndex = 0;
   var c, prev, i, expression, filters;
   for (i = 0; i < exp.length; i++) {
     prev = c;
     c = exp.charCodeAt(i);
     if (inSingle) {
       if (c === 0x27 && prev !== 0x5c)
         inSingle = false;
     }
     else if (inDouble) {
       if (c === 0x22 && prev !== 0x5c)
         inDouble = false;
     }
     else if (inTemplateString) {
       if (c === 0x60 && prev !== 0x5c)
         inTemplateString = false;
     }
     else if (inRegex) {
       if (c === 0x2f && prev !== 0x5c)
         inRegex = false;
     }
     else if (c === 0x7c && // pipe
       exp.charCodeAt(i + 1) !== 0x7c &&
       exp.charCodeAt(i - 1) !== 0x7c &&
       !curly &&
       !square &&
       !paren) {
       if (expression === undefined) {
         // first filter, end of expression
         lastFilterIndex = i + 1;
         expression = exp.slice(0, i).trim();
       }
       else {
         pushFilter();
       }
     }
     else {
       switch (c) {
         case 0x22:
           inDouble = true;
           break; // "
         case 0x27:
           inSingle = true;
           break; // '
         case 0x60:
           inTemplateString = true;
           break; // `
         case 0x28:
           paren++;
           break; // (
         case 0x29:
           paren--;
           break; // )
         case 0x5b:
           square++;
           break; // [
         case 0x5d:
           square--;
           break; // ]
         case 0x7b:
           curly++;
           break; // {
         case 0x7d:
           curly--;
           break; // }
       }
       if (c === 0x2f) {
         // /
         var j = i - 1;
         var p
           // find first non-whitespace prev char
           = void 0;
         // find first non-whitespace prev char
         for (; j >= 0; j--) {
           p = exp.charAt(j);
           if (p !== ' ')
             break;
         }
         if (!p || !validDivisionCharRE.test(p)) {
           inRegex = true;
         }
       }
     }
   }
   if (expression === undefined) {
     expression = exp.slice(0, i).trim();
   }
   else if (lastFilterIndex !== 0) {
     pushFilter();
   }
   function pushFilter() {
     (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
     lastFilterIndex = i + 1;
   }
   if (filters) {
     for (i = 0; i < filters.length; i++) {
       expression = wrapFilter(expression, filters[i]);
     }
   }
   return expression;
 }
 function wrapFilter(exp, filter) {
   var i = filter.indexOf('(');
   if (i < 0) {
     // _f: resolveFilter
     return "_f(\"".concat(filter, "\")(").concat(exp, ")");
   }
   else {
     var name_1 = filter.slice(0, i);
     var args = filter.slice(i + 1);
     return "_f(\"".concat(name_1, "\")(").concat(exp).concat(args !== ')' ? ',' + args : args);
   }
 }
 
 /* eslint-disable no-unused-vars */
 function baseWarn(msg, range) {
   console.error("[Vue compiler]: ".concat(msg));
 }
 /* eslint-enable no-unused-vars */
 function pluckModuleFunction(modules, key) {
   return modules ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; }) : [];
 }
 function addProp(el, name, value, range, dynamic) {
   (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
   el.plain = false;
 }
 function addAttr(el, name, value, range, dynamic) {
   var attrs = dynamic
     ? el.dynamicAttrs || (el.dynamicAttrs = [])
     : el.attrs || (el.attrs = []);
   attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
   el.plain = false;
 }
 // add a raw attr (use this in preTransforms)
 function addRawAttr(el, name, value, range) {
   el.attrsMap[name] = value;
   el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
 }
 function addDirective(el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
   (el.directives || (el.directives = [])).push(rangeSetItem({
     name: name,
     rawName: rawName,
     value: value,
     arg: arg,
     isDynamicArg: isDynamicArg,
     modifiers: modifiers
   }, range));
   el.plain = false;
 }
 function prependModifierMarker(symbol, name, dynamic) {
   return dynamic ? "_p(".concat(name, ",\"").concat(symbol, "\")") : symbol + name; // mark the event as captured
 }
 function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
   modifiers = modifiers || emptyObject;
   // warn prevent and passive modifier
   /* istanbul ignore if */
   if (warn && modifiers.prevent && modifiers.passive) {
     warn("passive and prevent can't be used together. " +
       "Passive handler can't prevent default event.", range);
   }
   // normalize click.right and click.middle since they don't actually fire
   // this is technically browser-specific, but at least for now browsers are
   // the only target envs that have right/middle clicks.
   if (modifiers.right) {
     if (dynamic) {
       name = "(".concat(name, ")==='click'?'contextmenu':(").concat(name, ")");
     }
     else if (name === 'click') {
       name = 'contextmenu';
       delete modifiers.right;
     }
   }
   else if (modifiers.middle) {
     if (dynamic) {
       name = "(".concat(name, ")==='click'?'mouseup':(").concat(name, ")");
     }
     else if (name === 'click') {
       name = 'mouseup';
     }
   }
   // check capture modifier
   if (modifiers.capture) {
     delete modifiers.capture;
     name = prependModifierMarker('!', name, dynamic);
   }
   if (modifiers.once) {
     delete modifiers.once;
     name = prependModifierMarker('~', name, dynamic);
   }
   /* istanbul ignore if */
   if (modifiers.passive) {
     delete modifiers.passive;
     name = prependModifierMarker('&', name, dynamic);
   }
   var events;
   if (modifiers.native) {
     delete modifiers.native;
     events = el.nativeEvents || (el.nativeEvents = {});
   }
   else {
     events = el.events || (el.events = {});
   }
   var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
   if (modifiers !== emptyObject) {
     newHandler.modifiers = modifiers;
   }
   var handlers = events[name];
   /* istanbul ignore if */
   if (Array.isArray(handlers)) {
     important ? handlers.unshift(newHandler) : handlers.push(newHandler);
   }
   else if (handlers) {
     events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
   }
   else {
     events[name] = newHandler;
   }
   el.plain = false;
 }
 function getRawBindingAttr(el, name) {
   return (el.rawAttrsMap[':' + name] ||
     el.rawAttrsMap['v-bind:' + name] ||
     el.rawAttrsMap[name]);
 }
 function getBindingAttr(el, name, getStatic) {
   var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);
   if (dynamicValue != null) {
     return parseFilters(dynamicValue);
   }
   else if (getStatic !== false) {
     var staticValue = getAndRemoveAttr(el, name);
     if (staticValue != null) {
       return JSON.stringify(staticValue);
     }
   }
 }
 // note: this only removes the attr from the Array (attrsList) so that it
 // doesn't get processed by processAttrs.
 // By default it does NOT remove it from the map (attrsMap) because the map is
 // needed during codegen.
 function getAndRemoveAttr(el, name, removeFromMap) {
   var val;
   if ((val = el.attrsMap[name]) != null) {
     var list = el.attrsList;
     for (var i = 0, l = list.length; i < l; i++) {
       if (list[i].name === name) {
         list.splice(i, 1);
         break;
       }
     }
   }
   if (removeFromMap) {
     delete el.attrsMap[name];
   }
   return val;
 }
 function getAndRemoveAttrByRegex(el, name) {
   var list = el.attrsList;
   for (var i = 0, l = list.length; i < l; i++) {
     var attr = list[i];
     if (name.test(attr.name)) {
       list.splice(i, 1);
       return attr;
     }
   }
 }
 function rangeSetItem(item, range) {
   if (range) {
     if (range.start != null) {
       item.start = range.start;
     }
     if (range.end != null) {
       item.end = range.end;
     }
   }
   return item;
 }
 
 /**
  * Cross-platform code generation for component v-model
  */
 function genComponentModel(el, value, modifiers) {
   var _a = modifiers || {}, number = _a.number, trim = _a.trim;
   var baseValueExpression = '$$v';
   var valueExpression = baseValueExpression;
   if (trim) {
     valueExpression =
       "(typeof ".concat(baseValueExpression, " === 'string'") +
       "? ".concat(baseValueExpression, ".trim()") +
       ": ".concat(baseValueExpression, ")");
   }
   if (number) {
     valueExpression = "_n(".concat(valueExpression, ")");
   }
   var assignment = genAssignmentCode(value, valueExpression);
   el.model = {
     value: "(".concat(value, ")"),
     expression: JSON.stringify(value),
     callback: "function (".concat(baseValueExpression, ") {").concat(assignment, "}")
   };
 }
 /**
  * Cross-platform codegen helper for generating v-model value assignment code.
  */
 function genAssignmentCode(value, assignment) {
   var res = parseModel(value);
   if (res.key === null) {
     return "".concat(value, "=").concat(assignment);
   }
   else {
     return "$set(".concat(res.exp, ", ").concat(res.key, ", ").concat(assignment, ")");
   }
 }
 /**
  * Parse a v-model expression into a base path and a final key segment.
  * Handles both dot-path and possible square brackets.
  *
  * Possible cases:
  *
  * - test
  * - test[key]
  * - test[test1[key]]
  * - test["a"][key]
  * - xxx.test[a[a].test1[key]]
  * - test.xxx.a["asa"][test1[key]]
  *
  */
 var len, str, chr, index, expressionPos, expressionEndPos;
 function parseModel(val) {
   // Fix https://github.com/vuejs/vue/pull/7730
   // allow v-model="obj.val " (trailing whitespace)
   val = val.trim();
   len = val.length;
   if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
     index = val.lastIndexOf('.');
     if (index > -1) {
       return {
         exp: val.slice(0, index),
         key: '"' + val.slice(index + 1) + '"'
       };
     }
     else {
       return {
         exp: val,
         key: null
       };
     }
   }
   str = val;
   index = expressionPos = expressionEndPos = 0;
   while (!eof()) {
     chr = next();
     /* istanbul ignore if */
     if (isStringStart(chr)) {
       parseString(chr);
     }
     else if (chr === 0x5b) {
       parseBracket(chr);
     }
   }
   return {
     exp: val.slice(0, expressionPos),
     key: val.slice(expressionPos + 1, expressionEndPos)
   };
 }
 function next() {
   return str.charCodeAt(++index);
 }
 function eof() {
   return index >= len;
 }
 function isStringStart(chr) {
   return chr === 0x22 || chr === 0x27;
 }
 function parseBracket(chr) {
   var inBracket = 1;
   expressionPos = index;
   while (!eof()) {
     chr = next();
     if (isStringStart(chr)) {
       parseString(chr);
       continue;
     }
     if (chr === 0x5b)
       inBracket++;
     if (chr === 0x5d)
       inBracket--;
     if (inBracket === 0) {
       expressionEndPos = index;
       break;
     }
   }
 }
 function parseString(chr) {
   var stringQuote = chr;
   while (!eof()) {
     chr = next();
     if (chr === stringQuote) {
       break;
     }
   }
 }
 
 var warn$1;
 // in some cases, the event used has to be determined at runtime
 // so we used some reserved tokens during compile.
 var RANGE_TOKEN = '__r';
 var CHECKBOX_RADIO_TOKEN = '__c';
 function model$1(el, dir, _warn) {
   warn$1 = _warn;
   var value = dir.value;
   var modifiers = dir.modifiers;
   var tag = el.tag;
   var type = el.attrsMap.type;
   {
     // inputs with type="file" are read only and setting the input's
     // value will throw an error.
     if (tag === 'input' && type === 'file') {
       warn$1("<".concat(el.tag, " v-model=\"").concat(value, "\" type=\"file\">:\n") +
         "File inputs are read only. Use a v-on:change listener instead.", el.rawAttrsMap['v-model']);
     }
   }
   if (el.component) {
     genComponentModel(el, value, modifiers);
     // component v-model doesn't need extra runtime
     return false;
   }
   else if (tag === 'select') {
     genSelect(el, value, modifiers);
   }
   else if (tag === 'input' && type === 'checkbox') {
     genCheckboxModel(el, value, modifiers);
   }
   else if (tag === 'input' && type === 'radio') {
     genRadioModel(el, value, modifiers);
   }
   else if (tag === 'input' || tag === 'textarea') {
     genDefaultModel(el, value, modifiers);
   }
   else if (!config.isReservedTag(tag)) {
     genComponentModel(el, value, modifiers);
     // component v-model doesn't need extra runtime
     return false;
   }
   else {
     warn$1("<".concat(el.tag, " v-model=\"").concat(value, "\">: ") +
       "v-model is not supported on this element type. " +
       "If you are working with contenteditable, it's recommended to " +
       'wrap a library dedicated for that purpose inside a custom component.', el.rawAttrsMap['v-model']);
   }
   // ensure runtime directive metadata
   return true;
 }
 function genCheckboxModel(el, value, modifiers) {
   var number = modifiers && modifiers.number;
   var valueBinding = getBindingAttr(el, 'value') || 'null';
   var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
   var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
   addProp(el, 'checked', "Array.isArray(".concat(value, ")") +
     "?_i(".concat(value, ",").concat(valueBinding, ")>-1") +
     (trueValueBinding === 'true'
       ? ":(".concat(value, ")")
       : ":_q(".concat(value, ",").concat(trueValueBinding, ")")));
   addHandler(el, 'change', "var $$a=".concat(value, ",") +
     '$$el=$event.target,' +
     "$$c=$$el.checked?(".concat(trueValueBinding, "):(").concat(falseValueBinding, ");") +
     'if(Array.isArray($$a)){' +
     "var $$v=".concat(number ? '_n(' + valueBinding + ')' : valueBinding, ",") +
     '$$i=_i($$a,$$v);' +
     "if($$el.checked){$$i<0&&(".concat(genAssignmentCode(value, '$$a.concat([$$v])'), ")}") +
     "else{$$i>-1&&(".concat(genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))'), ")}") +
     "}else{".concat(genAssignmentCode(value, '$$c'), "}"), null, true);
 }
 function genRadioModel(el, value, modifiers) {
   var number = modifiers && modifiers.number;
   var valueBinding = getBindingAttr(el, 'value') || 'null';
   valueBinding = number ? "_n(".concat(valueBinding, ")") : valueBinding;
   addProp(el, 'checked', "_q(".concat(value, ",").concat(valueBinding, ")"));
   addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
 }
 function genSelect(el, value, modifiers) {
   var number = modifiers && modifiers.number;
   var selectedVal = "Array.prototype.filter" +
     ".call($event.target.options,function(o){return o.selected})" +
     ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
     "return ".concat(number ? '_n(val)' : 'val', "})");
   var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
   var code = "var $$selectedVal = ".concat(selectedVal, ";");
   code = "".concat(code, " ").concat(genAssignmentCode(value, assignment));
   addHandler(el, 'change', code, null, true);
 }
 function genDefaultModel(el, value, modifiers) {
   var type = el.attrsMap.type;
   // warn if v-bind:value conflicts with v-model
   // except for inputs with v-bind:type
   {
     var value_1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
     var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
     if (value_1 && !typeBinding) {
       var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
       warn$1("".concat(binding, "=\"").concat(value_1, "\" conflicts with v-model on the same element ") +
         'because the latter already expands to a value binding internally', el.rawAttrsMap[binding]);
     }
   }
   var _a = modifiers || {}, lazy = _a.lazy, number = _a.number, trim = _a.trim;
   var needCompositionGuard = !lazy && type !== 'range';
   var event = lazy ? 'change' : type === 'range' ? RANGE_TOKEN : 'input';
   var valueExpression = '$event.target.value';
   if (trim) {
     valueExpression = "$event.target.value.trim()";
   }
   if (number) {
     valueExpression = "_n(".concat(valueExpression, ")");
   }
   var code = genAssignmentCode(value, valueExpression);
   if (needCompositionGuard) {
     code = "if($event.target.composing)return;".concat(code);
   }
   addProp(el, 'value', "(".concat(value, ")"));
   addHandler(el, event, code, null, true);
   if (trim || number) {
     addHandler(el, 'blur', '$forceUpdate()');
   }
 }
 
 // normalize v-model event tokens that can only be determined at runtime.
 // it's important to place the event as the first in the array because
 // the whole point is ensuring the v-model callback gets called before
 // user-attached handlers.
 function normalizeEvents(on) {
   /* istanbul ignore if */
   if (isDef(on[RANGE_TOKEN])) {
     // IE input[type=range] only supports `change` event
     var event_1 = isIE ? 'change' : 'input';
     on[event_1] = [].concat(on[RANGE_TOKEN], on[event_1] || []);
     delete on[RANGE_TOKEN];
   }
   // This was originally intended to fix #4521 but no longer necessary
   // after 2.5. Keeping it for backwards compat with generated code from < 2.4
   /* istanbul ignore if */
   if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
     on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
     delete on[CHECKBOX_RADIO_TOKEN];
   }
 }
 var target;
 function createOnceHandler(event, handler, capture) {
   var _target = target; // save current target element in closure
   return function onceHandler() {
     var res = handler.apply(null, arguments);
     if (res !== null) {
       remove(event, onceHandler, capture, _target);
     }
   };
 }
 // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
 // implementation and does not fire microtasks in between event propagation, so
 // safe to exclude.
 var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);
 function add(name, handler, capture, passive) {
   // async edge case #6566: inner click event triggers patch, event handler
   // attached to outer element during patch, and triggered again. This
   // happens because browsers fire microtask ticks between event propagation.
   // the solution is simple: we save the timestamp when a handler is attached,
   // and the handler would only fire if the event passed to it was fired
   // AFTER it was attached.
   if (useMicrotaskFix) {
     var attachedTimestamp_1 = currentFlushTimestamp;
     var original_1 = handler;
     handler = original_1._wrapper = function (e) {
       if (
         // no bubbling, should always fire.
         // this is just a safety net in case event.timeStamp is unreliable in
         // certain weird environments...
         e.target === e.currentTarget ||
         // event is fired after handler attachment
         e.timeStamp >= attachedTimestamp_1 ||
         // bail for environments that have buggy event.timeStamp implementations
         // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
         // #9681 QtWebEngine event.timeStamp is negative value
         e.timeStamp <= 0 ||
         // #9448 bail if event is fired in another document in a multi-page
         // electron/nw.js app, since event.timeStamp will be using a different
         // starting reference
         e.target.ownerDocument !== document) {
         return original_1.apply(this, arguments);
       }
     };
   }
   target.addEventListener(name, handler, supportsPassive ? { capture: capture, passive: passive } : capture);
 }
 function remove(name, handler, capture, _target) {
   (_target || target).removeEventListener(name,
     handler._wrapper || handler, capture);
 }
 function updateDOMListeners(oldVnode, vnode) {
   if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
     return;
   }
   var on = vnode.data.on || {};
   var oldOn = oldVnode.data.on || {};
   // vnode is empty when removing all listeners,
   // and use old vnode dom element
   target = vnode.elm || oldVnode.elm;
   normalizeEvents(on);
   updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context);
   target = undefined;
 }
 var events = {
   create: updateDOMListeners,
   update: updateDOMListeners,
   // @ts-expect-error emptyNode has actually data
   destroy: function (vnode) { return updateDOMListeners(vnode, emptyNode); }
 };
 
 var svgContainer;
 function updateDOMProps(oldVnode, vnode) {
   if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
     return;
   }
   var key, cur;
   var elm = vnode.elm;
   var oldProps = oldVnode.data.domProps || {};
   var props = vnode.data.domProps || {};
   // clone observed objects, as the user probably wants to mutate it
   if (isDef(props.__ob__) || isTrue(props._v_attr_proxy)) {
     props = vnode.data.domProps = extend({}, props);
   }
   for (key in oldProps) {
     if (!(key in props)) {
       elm[key] = '';
     }
   }
   for (key in props) {
     cur = props[key];
     // ignore children if the node has textContent or innerHTML,
     // as these will throw away existing DOM nodes and cause removal errors
     // on subsequent patches (#3360)
     if (key === 'textContent' || key === 'innerHTML') {
       if (vnode.children)
         vnode.children.length = 0;
       if (cur === oldProps[key])
         continue;
       // #6601 work around Chrome version <= 55 bug where single textNode
       // replaced by innerHTML/textContent retains its parentNode property
       if (elm.childNodes.length === 1) {
         elm.removeChild(elm.childNodes[0]);
       }
     }
     if (key === 'value' && elm.tagName !== 'PROGRESS') {
       // store value as _value as well since
       // non-string values will be stringified
       elm._value = cur;
       // avoid resetting cursor position when value is the same
       var strCur = isUndef(cur) ? '' : String(cur);
       if (shouldUpdateValue(elm, strCur)) {
         elm.value = strCur;
       }
     }
     else if (key === 'innerHTML' &&
       isSVG(elm.tagName) &&
       isUndef(elm.innerHTML)) {
       // IE doesn't support innerHTML for SVG elements
       svgContainer = svgContainer || document.createElement('div');
       svgContainer.innerHTML = "<svg>".concat(cur, "</svg>");
       var svg = svgContainer.firstChild;
       while (elm.firstChild) {
         elm.removeChild(elm.firstChild);
       }
       while (svg.firstChild) {
         elm.appendChild(svg.firstChild);
       }
     }
     else if (
       // skip the update if old and new VDOM state is the same.
       // `value` is handled separately because the DOM value may be temporarily
       // out of sync with VDOM state due to focus, composition and modifiers.
       // This  #4521 by skipping the unnecessary `checked` update.
       cur !== oldProps[key]) {
       // some property updates can throw
       // e.g. `value` on <progress> w/ non-finite value
       try {
         elm[key] = cur;
       }
       catch (e) { }
     }
   }
 }
 function shouldUpdateValue(elm, checkVal) {
   return (
     !elm.composing &&
     (elm.tagName === 'OPTION' ||
       isNotInFocusAndDirty(elm, checkVal) ||
       isDirtyWithModifiers(elm, checkVal)));
 }
 function isNotInFocusAndDirty(elm, checkVal) {
   // return true when textbox (.number and .trim) loses focus and its value is
   // not equal to the updated value
   var notInFocus = true;
   // #6157
   // work around IE bug when accessing document.activeElement in an iframe
   try {
     notInFocus = document.activeElement !== elm;
   }
   catch (e) { }
   return notInFocus && elm.value !== checkVal;
 }
 function isDirtyWithModifiers(elm, newVal) {
   var value = elm.value;
   var modifiers = elm._vModifiers; // injected by v-model runtime
   if (isDef(modifiers)) {
     if (modifiers.number) {
       return toNumber(value) !== toNumber(newVal);
     }
     if (modifiers.trim) {
       return value.trim() !== newVal.trim();
     }
   }
   return value !== newVal;
 }
 var domProps = {
   create: updateDOMProps,
   update: updateDOMProps
 };
 
 var parseStyleText = cached(function (cssText) {
   var res = {};
   var listDelimiter = /;(?![^(]*\))/g;
   var propertyDelimiter = /:(.+)/;
   cssText.split(listDelimiter).forEach(function (item) {
     if (item) {
       var tmp = item.split(propertyDelimiter);
       tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
     }
   });
   return res;
 });
 // merge static and dynamic style data on the same vnode
 function normalizeStyleData(data) {
   var style = normalizeStyleBinding(data.style);
   // static style is pre-processed into an object during compilation
   // and is always a fresh object, so it's safe to merge into it
   return data.staticStyle ? extend(data.staticStyle, style) : style;
 }
 // normalize possible array / string values into Object
 function normalizeStyleBinding(bindingStyle) {
   if (Array.isArray(bindingStyle)) {
     return toObject(bindingStyle);
   }
   if (typeof bindingStyle === 'string') {
     return parseStyleText(bindingStyle);
   }
   return bindingStyle;
 }
 /**
  * parent component style should be after child's
  * so that parent component's style could override it
  */
 function getStyle(vnode, checkChild) {
   var res = {};
   var styleData;
   if (checkChild) {
     var childNode = vnode;
     while (childNode.componentInstance) {
       childNode = childNode.componentInstance._vnode;
       if (childNode &&
         childNode.data &&
         (styleData = normalizeStyleData(childNode.data))) {
         extend(res, styleData);
       }
     }
   }
   if ((styleData = normalizeStyleData(vnode.data))) {
     extend(res, styleData);
   }
   var parentNode = vnode;
   // @ts-expect-error parentNode.parent not VNodeWithData
   while ((parentNode = parentNode.parent)) {
     if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
       extend(res, styleData);
     }
   }
   return res;
 }
 
 var cssVarRE = /^--/;
 var importantRE = /\s*!important$/;
 var setProp = function (el, name, val) {
   /* istanbul ignore if */
   if (cssVarRE.test(name)) {
     el.style.setProperty(name, val);
   }
   else if (importantRE.test(val)) {
     el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
   }
   else {
     var normalizedName = normalize(name);
     if (Array.isArray(val)) {
       // Support values array created by autoprefixer, e.g.
       // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
       // Set them one by one, and the browser will only set those it can recognize
       for (var i = 0, len = val.length; i < len; i++) {
         el.style[normalizedName] = val[i];
       }
     }
     else {
       el.style[normalizedName] = val;
     }
   }
 };
 var vendorNames = ['Webkit', 'Moz', 'ms'];
 var emptyStyle;
 var normalize = cached(function (prop) {
   emptyStyle = emptyStyle || document.createElement('div').style;
   prop = camelize(prop);
   if (prop !== 'filter' && prop in emptyStyle) {
     return prop;
   }
   var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
   for (var i = 0; i < vendorNames.length; i++) {
     var name_1 = vendorNames[i] + capName;
     if (name_1 in emptyStyle) {
       return name_1;
     }
   }
 });
 function updateStyle(oldVnode, vnode) {
   var data = vnode.data;
   var oldData = oldVnode.data;
   if (isUndef(data.staticStyle) &&
     isUndef(data.style) &&
     isUndef(oldData.staticStyle) &&
     isUndef(oldData.style)) {
     return;
   }
   var cur, name;
   var el = vnode.elm;
   var oldStaticStyle = oldData.staticStyle;
   var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};
   // if static style exists, stylebinding already merged into it when doing normalizeStyleData
   var oldStyle = oldStaticStyle || oldStyleBinding;
   var style = normalizeStyleBinding(vnode.data.style) || {};
   // store normalized style under a different key for next diff
   // make sure to clone it if it's reactive, since the user likely wants
   // to mutate it.
   vnode.data.normalizedStyle = isDef(style.__ob__) ? extend({}, style) : style;
   var newStyle = getStyle(vnode, true);
   for (name in oldStyle) {
     if (isUndef(newStyle[name])) {
       setProp(el, name, '');
     }
   }
   for (name in newStyle) {
     cur = newStyle[name];
     if (cur !== oldStyle[name]) {
       // ie9 setting to null has no effect, must use empty string
       setProp(el, name, cur == null ? '' : cur);
     }
   }
 }
 var style$1 = {
   create: updateStyle,
   update: updateStyle
 };
 
 var whitespaceRE$1 = /\s+/;
 /**
  * Add class with compatibility for SVG since classList is not supported on
  * SVG elements in IE
  */
 function addClass(el, cls) {
   /* istanbul ignore if */
   if (!cls || !(cls = cls.trim())) {
     return;
   }
   /* istanbul ignore else */
   if (el.classList) {
     if (cls.indexOf(' ') > -1) {
       cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.add(c); });
     }
     else {
       el.classList.add(cls);
     }
   }
   else {
     var cur = " ".concat(el.getAttribute('class') || '', " ");
     if (cur.indexOf(' ' + cls + ' ') < 0) {
       el.setAttribute('class', (cur + cls).trim());
     }
   }
 }
 /**
  * Remove class with compatibility for SVG since classList is not supported on
  * SVG elements in IE
  */
 function removeClass(el, cls) {
   /* istanbul ignore if */
   if (!cls || !(cls = cls.trim())) {
     return;
   }
   /* istanbul ignore else */
   if (el.classList) {
     if (cls.indexOf(' ') > -1) {
       cls.split(whitespaceRE$1).forEach(function (c) { return el.classList.remove(c); });
     }
     else {
       el.classList.remove(cls);
     }
     if (!el.classList.length) {
       el.removeAttribute('class');
     }
   }
   else {
     var cur = " ".concat(el.getAttribute('class') || '', " ");
     var tar = ' ' + cls + ' ';
     while (cur.indexOf(tar) >= 0) {
       cur = cur.replace(tar, ' ');
     }
     cur = cur.trim();
     if (cur) {
       el.setAttribute('class', cur);
     }
     else {
       el.removeAttribute('class');
     }
   }
 }
 
 function resolveTransition(def) {
   if (!def) {
     return;
   }
   /* istanbul ignore else */
   if (typeof def === 'object') {
     var res = {};
     if (def.css !== false) {
       extend(res, autoCssTransition(def.name || 'v'));
     }
     extend(res, def);
     return res;
   }
   else if (typeof def === 'string') {
     return autoCssTransition(def);
   }
 }
 var autoCssTransition = cached(function (name) {
   return {
     enterClass: "".concat(name, "-enter"),
     enterToClass: "".concat(name, "-enter-to"),
     enterActiveClass: "".concat(name, "-enter-active"),
     leaveClass: "".concat(name, "-leave"),
     leaveToClass: "".concat(name, "-leave-to"),
     leaveActiveClass: "".concat(name, "-leave-active")
   };
 });
 var hasTransition = inBrowser && !isIE9;
 var TRANSITION = 'transition';
 var ANIMATION = 'animation';
 // Transition property/event sniffing
 var transitionProp = 'transition';
 var transitionEndEvent = 'transitionend';
 var animationProp = 'animation';
 var animationEndEvent = 'animationend';
 if (hasTransition) {
   /* istanbul ignore if */
   if (window.ontransitionend === undefined &&
     window.onwebkittransitionend !== undefined) {
     transitionProp = 'WebkitTransition';
     transitionEndEvent = 'webkitTransitionEnd';
   }
   if (window.onanimationend === undefined &&
     window.onwebkitanimationend !== undefined) {
     animationProp = 'WebkitAnimation';
     animationEndEvent = 'webkitAnimationEnd';
   }
 }
 // binding to window is necessary to make hot reload work in IE in strict mode
 var raf = inBrowser
   ? window.requestAnimationFrame
     ? window.requestAnimationFrame.bind(window)
     : setTimeout
   : /* istanbul ignore next */ function (/* istanbul ignore next */ fn) { return fn(); };
 function nextFrame(fn) {
   raf(function () {
     // @ts-expect-error
     raf(fn);
   });
 }
 function addTransitionClass(el, cls) {
   var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
   if (transitionClasses.indexOf(cls) < 0) {
     transitionClasses.push(cls);
     addClass(el, cls);
   }
 }
 function removeTransitionClass(el, cls) {
   if (el._transitionClasses) {
     remove$2(el._transitionClasses, cls);
   }
   removeClass(el, cls);
 }
 function whenTransitionEnds(el, expectedType, cb) {
   var _a = getTransitionInfo(el, expectedType), type = _a.type, timeout = _a.timeout, propCount = _a.propCount;
   if (!type)
     return cb();
   var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
   var ended = 0;
   var end = function () {
     el.removeEventListener(event, onEnd);
     cb();
   };
   var onEnd = function (e) {
     if (e.target === el) {
       if (++ended >= propCount) {
         end();
       }
     }
   };
   setTimeout(function () {
     if (ended < propCount) {
       end();
     }
   }, timeout + 1);
   el.addEventListener(event, onEnd);
 }
 var transformRE = /\b(transform|all)(,|$)/;
 function getTransitionInfo(el, expectedType) {
   var styles = window.getComputedStyle(el);
   // JSDOM may return undefined for transition properties
   var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
   var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
   var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
   var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
   var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
   var animationTimeout = getTimeout(animationDelays, animationDurations);
   var type;
   var timeout = 0;
   var propCount = 0;
   /* istanbul ignore if */
   if (expectedType === TRANSITION) {
     if (transitionTimeout > 0) {
       type = TRANSITION;
       timeout = transitionTimeout;
       propCount = transitionDurations.length;
     }
   }
   else if (expectedType === ANIMATION) {
     if (animationTimeout > 0) {
       type = ANIMATION;
       timeout = animationTimeout;
       propCount = animationDurations.length;
     }
   }
   else {
     timeout = Math.max(transitionTimeout, animationTimeout);
     type =
       timeout > 0
         ? transitionTimeout > animationTimeout
           ? TRANSITION
           : ANIMATION
         : null;
     propCount = type
       ? type === TRANSITION
         ? transitionDurations.length
         : animationDurations.length
       : 0;
   }
   var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
   return {
     type: type,
     timeout: timeout,
     propCount: propCount,
     hasTransform: hasTransform
   };
 }
 function getTimeout(delays, durations) {
   /* istanbul ignore next */
   while (delays.length < durations.length) {
     delays = delays.concat(delays);
   }
   return Math.max.apply(null, durations.map(function (d, i) {
     return toMs(d) + toMs(delays[i]);
   }));
 }
 // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
 // in a locale-dependent way, using a comma instead of a dot.
 // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
 // as a floor function) causing unexpected behaviors
 function toMs(s) {
   return Number(s.slice(0, -1).replace(',', '.')) * 1000;
 }
 
 function enter(vnode, toggleDisplay) {
   var el = vnode.elm;
   // call leave callback now
   if (isDef(el._leaveCb)) {
     el._leaveCb.cancelled = true;
     el._leaveCb();
   }
   var data = resolveTransition(vnode.data.transition);
   if (isUndef(data)) {
     return;
   }
   /* istanbul ignore if */
   if (isDef(el._enterCb) || el.nodeType !== 1) {
     return;
   }
   var css = data.css, type = data.type, enterClass = data.enterClass, enterToClass = data.enterToClass, enterActiveClass = data.enterActiveClass, appearClass = data.appearClass, appearToClass = data.appearToClass, appearActiveClass = data.appearActiveClass, beforeEnter = data.beforeEnter, enter = data.enter, afterEnter = data.afterEnter, enterCancelled = data.enterCancelled, beforeAppear = data.beforeAppear, appear = data.appear, afterAppear = data.afterAppear, appearCancelled = data.appearCancelled, duration = data.duration;
   // activeInstance will always be the <transition> component managing this
   // transition. One edge case to check is when the <transition> is placed
   // as the root node of a child component. In that case we need to check
   // <transition>'s parent for appear check.
   var context = activeInstance;
   var transitionNode = activeInstance.$vnode;
   while (transitionNode && transitionNode.parent) {
     context = transitionNode.context;
     transitionNode = transitionNode.parent;
   }
   var isAppear = !context._isMounted || !vnode.isRootInsert;
   if (isAppear && !appear && appear !== '') {
     return;
   }
   var startClass = isAppear && appearClass ? appearClass : enterClass;
   var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
   var toClass = isAppear && appearToClass ? appearToClass : enterToClass;
   var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
   var enterHook = isAppear ? (isFunction(appear) ? appear : enter) : enter;
   var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
   var enterCancelledHook = isAppear
     ? appearCancelled || enterCancelled
     : enterCancelled;
   var explicitEnterDuration = toNumber(isObject(duration) ? duration.enter : duration);
   if (explicitEnterDuration != null) {
     checkDuration(explicitEnterDuration, 'enter', vnode);
   }
   var expectsCSS = css !== false && !isIE9;
   var userWantsControl = getHookArgumentsLength(enterHook);
   var cb = (el._enterCb = once(function () {
     if (expectsCSS) {
       removeTransitionClass(el, toClass);
       removeTransitionClass(el, activeClass);
     }
     // @ts-expect-error
     if (cb.cancelled) {
       if (expectsCSS) {
         removeTransitionClass(el, startClass);
       }
       enterCancelledHook && enterCancelledHook(el);
     }
     else {
       afterEnterHook && afterEnterHook(el);
     }
     el._enterCb = null;
   }));
   if (!vnode.data.show) {
     // remove pending leave element on enter by injecting an insert hook
     mergeVNodeHook(vnode, 'insert', function () {
       var parent = el.parentNode;
       var pendingNode = parent && parent._pending && parent._pending[vnode.key];
       if (pendingNode &&
         pendingNode.tag === vnode.tag &&
         pendingNode.elm._leaveCb) {
         pendingNode.elm._leaveCb();
       }
       enterHook && enterHook(el, cb);
     });
   }
   // start enter transition
   beforeEnterHook && beforeEnterHook(el);
   if (expectsCSS) {
     addTransitionClass(el, startClass);
     addTransitionClass(el, activeClass);
     nextFrame(function () {
       removeTransitionClass(el, startClass);
       // @ts-expect-error
       if (!cb.cancelled) {
         addTransitionClass(el, toClass);
         if (!userWantsControl) {
           if (isValidDuration(explicitEnterDuration)) {
             setTimeout(cb, explicitEnterDuration);
           }
           else {
             whenTransitionEnds(el, type, cb);
           }
         }
       }
     });
   }
   if (vnode.data.show) {
     toggleDisplay && toggleDisplay();
     enterHook && enterHook(el, cb);
   }
   if (!expectsCSS && !userWantsControl) {
     cb();
   }
 }
 function leave(vnode, rm) {
   var el = vnode.elm;
   // call enter callback now
   if (isDef(el._enterCb)) {
     el._enterCb.cancelled = true;
     el._enterCb();
   }
   var data = resolveTransition(vnode.data.transition);
   if (isUndef(data) || el.nodeType !== 1) {
     return rm();
   }
   /* istanbul ignore if */
   if (isDef(el._leaveCb)) {
     return;
   }
   var css = data.css, type = data.type, leaveClass = data.leaveClass, leaveToClass = data.leaveToClass, leaveActiveClass = data.leaveActiveClass, beforeLeave = data.beforeLeave, leave = data.leave, afterLeave = data.afterLeave, leaveCancelled = data.leaveCancelled, delayLeave = data.delayLeave, duration = data.duration;
   var expectsCSS = css !== false && !isIE9;
   var userWantsControl = getHookArgumentsLength(leave);
   var explicitLeaveDuration = toNumber(isObject(duration) ? duration.leave : duration);
   if (isDef(explicitLeaveDuration)) {
     checkDuration(explicitLeaveDuration, 'leave', vnode);
   }
   var cb = (el._leaveCb = once(function () {
     if (el.parentNode && el.parentNode._pending) {
       el.parentNode._pending[vnode.key] = null;
     }
     if (expectsCSS) {
       removeTransitionClass(el, leaveToClass);
       removeTransitionClass(el, leaveActiveClass);
     }
     // @ts-expect-error
     if (cb.cancelled) {
       if (expectsCSS) {
         removeTransitionClass(el, leaveClass);
       }
       leaveCancelled && leaveCancelled(el);
     }
     else {
       rm();
       afterLeave && afterLeave(el);
     }
     el._leaveCb = null;
   }));
   if (delayLeave) {
     delayLeave(performLeave);
   }
   else {
     performLeave();
   }
   function performLeave() {
     // the delayed leave may have already been cancelled
     // @ts-expect-error
     if (cb.cancelled) {
       return;
     }
     // record leaving element
     if (!vnode.data.show && el.parentNode) {
       (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] =
         vnode;
     }
     beforeLeave && beforeLeave(el);
     if (expectsCSS) {
       addTransitionClass(el, leaveClass);
       addTransitionClass(el, leaveActiveClass);
       nextFrame(function () {
         removeTransitionClass(el, leaveClass);
         // @ts-expect-error
         if (!cb.cancelled) {
           addTransitionClass(el, leaveToClass);
           if (!userWantsControl) {
             if (isValidDuration(explicitLeaveDuration)) {
               setTimeout(cb, explicitLeaveDuration);
             }
             else {
               whenTransitionEnds(el, type, cb);
             }
           }
         }
       });
     }
     leave && leave(el, cb);
     if (!expectsCSS && !userWantsControl) {
       cb();
     }
   }
 }
 // only used in dev mode
 function checkDuration(val, name, vnode) {
   if (typeof val !== 'number') {
     warn$2("<transition> explicit ".concat(name, " duration is not a valid number - ") +
       "got ".concat(JSON.stringify(val), "."), vnode.context);
   }
   else if (isNaN(val)) {
     warn$2("<transition> explicit ".concat(name, " duration is NaN - ") +
       'the duration expression might be incorrect.', vnode.context);
   }
 }
 function isValidDuration(val) {
   return typeof val === 'number' && !isNaN(val);
 }
 /**
  * Normalize a transition hook's argument length. The hook may be:
  * - a merged hook (invoker) with the original in .fns
  * - a wrapped component method (check ._length)
  * - a plain function (.length)
  */
 function getHookArgumentsLength(fn) {
   if (isUndef(fn)) {
     return false;
   }
   // @ts-expect-error
   var invokerFns = fn.fns;
   if (isDef(invokerFns)) {
     // invoker
     return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
   }
   else {
     // @ts-expect-error
     return (fn._length || fn.length) > 1;
   }
 }
 function _enter(_, vnode) {
   if (vnode.data.show !== true) {
     enter(vnode);
   }
 }
 var transition = inBrowser
   ? {
     create: _enter,
     activate: _enter,
     remove: function (vnode, rm) {
       /* istanbul ignore else */
       if (vnode.data.show !== true) {
         // @ts-expect-error
         leave(vnode, rm);
       }
       else {
         rm();
       }
     }
   }
   : {};
 
 var platformModules = [attrs, klass$1, events, domProps, style$1, transition];
 
 // the directive module should be applied last, after all
 // built-in modules have been applied.
 var modules$1 = platformModules.concat(baseModules);
 var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules$1 });
 