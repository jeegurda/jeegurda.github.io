!function(t,n){"object"===typeof exports&&"object"===typeof module?module.exports=n():"function"===typeof define&&define.amd?define([],n):"object"===typeof exports?exports.Button=n():t.Button=n()}(this,function(){return function(t){function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}var e={};return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:r})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="/",n(n.s=1)}([function(t,n,e){"use strict";function r(){}function o(t){try{return t.then}catch(t){return m=t,y}}function i(t,n){try{return t(n)}catch(t){return m=t,y}}function a(t,n,e){try{t(n,e)}catch(t){return m=t,y}}function s(t){if("object"!==typeof this)throw new TypeError("Promises must be constructed via new");if("function"!==typeof t)throw new TypeError("Promise constructor's argument is not a function");this._75=0,this._83=0,this._18=null,this._38=null,t!==r&&h(t,this)}function u(t,n,e){return new t.constructor(function(o,i){var a=new s(r);a.then(o,i),c(t,new d(n,e,a))})}function c(t,n){for(;3===t._83;)t=t._18;if(s._47&&s._47(t),0===t._83)return 0===t._75?(t._75=1,void(t._38=n)):1===t._75?(t._75=2,void(t._38=[t._38,n])):void t._38.push(n);l(t,n)}function l(t,n){b(function(){var e=1===t._83?n.onFulfilled:n.onRejected;if(null===e)return void(1===t._83?f(n.promise,t._18):p(n.promise,t._18));var r=i(e,t._18);r===y?p(n.promise,m):f(n.promise,r)})}function f(t,n){if(n===t)return p(t,new TypeError("A promise cannot be resolved with itself."));if(n&&("object"===typeof n||"function"===typeof n)){var e=o(n);if(e===y)return p(t,m);if(e===t.then&&n instanceof s)return t._83=3,t._18=n,void A(t);if("function"===typeof e)return void h(e.bind(n),t)}t._83=1,t._18=n,A(t)}function p(t,n){t._83=2,t._18=n,s._71&&s._71(t,n),A(t)}function A(t){if(1===t._75&&(c(t,t._38),t._38=null),2===t._75){for(var n=0;n<t._38.length;n++)c(t,t._38[n]);t._38=null}}function d(t,n,e){this.onFulfilled="function"===typeof t?t:null,this.onRejected="function"===typeof n?n:null,this.promise=e}function h(t,n){var e=!1,r=a(t,function(t){e||(e=!0,f(n,t))},function(t){e||(e=!0,p(n,t))});e||r!==y||(e=!0,p(n,m))}var b=e(4),m=null,y={};t.exports=s,s._47=null,s._71=null,s._44=r,s.prototype.then=function(t,n){if(this.constructor!==s)return u(this,t,n);var e=new s(r);return c(this,new d(t,n,e)),e}},function(t,n,e){e(2),t.exports=e(8)},function(t,n,e){"use strict";"undefined"===typeof Promise&&(e(3).enable(),window.Promise=e(6)),Object.assign=e(7)},function(t,n,e){"use strict";function r(){c=!1,s._47=null,s._71=null}function o(t){function n(n){(t.allRejections||a(f[n].error,t.whitelist||u))&&(f[n].displayId=l++,t.onUnhandled?(f[n].logged=!0,t.onUnhandled(f[n].displayId,f[n].error)):(f[n].logged=!0,i(f[n].displayId,f[n].error)))}function e(n){f[n].logged&&(t.onHandled?t.onHandled(f[n].displayId,f[n].error):f[n].onUnhandled||(console.warn("Promise Rejection Handled (id: "+f[n].displayId+"):"),console.warn('  This means you can ignore any previous messages of the form "Possible Unhandled Promise Rejection" with id '+f[n].displayId+".")))}t=t||{},c&&r(),c=!0;var o=0,l=0,f={};s._47=function(t){2===t._83&&f[t._56]&&(f[t._56].logged?e(t._56):clearTimeout(f[t._56].timeout),delete f[t._56])},s._71=function(t,e){0===t._75&&(t._56=o++,f[t._56]={displayId:null,error:e,timeout:setTimeout(n.bind(null,t._56),a(e,u)?100:2e3),logged:!1})}}function i(t,n){console.warn("Possible Unhandled Promise Rejection (id: "+t+"):"),((n&&(n.stack||n))+"").split("\n").forEach(function(t){console.warn("  "+t)})}function a(t,n){return n.some(function(n){return t instanceof n})}var s=e(0),u=[ReferenceError,TypeError,RangeError],c=!1;n.disable=r,n.enable=o},function(t,n,e){"use strict";(function(n){function e(t){a.length||(i(),s=!0),a[a.length]=t}function r(){for(;u<a.length;){var t=u;if(u+=1,a[t].call(),u>c){for(var n=0,e=a.length-u;n<e;n++)a[n]=a[n+u];a.length-=u,u=0}}a.length=0,u=0,s=!1}function o(t){return function(){function n(){clearTimeout(e),clearInterval(r),t()}var e=setTimeout(n,0),r=setInterval(n,50)}}t.exports=e;var i,a=[],s=!1,u=0,c=1024,l="undefined"!==typeof n?n:self,f=l.MutationObserver||l.WebKitMutationObserver;i="function"===typeof f?function(t){var n=1,e=new f(t),r=document.createTextNode("");return e.observe(r,{characterData:!0}),function(){n=-n,r.data=n}}(r):o(r),e.requestFlush=i,e.makeRequestCallFromTimer=o}).call(n,e(5))},function(t,n){var e;e=function(){return this}();try{e=e||Function("return this")()||(0,eval)("this")}catch(t){"object"===typeof window&&(e=window)}t.exports=e},function(t,n,e){"use strict";function r(t){var n=new o(o._44);return n._83=1,n._18=t,n}var o=e(0);t.exports=o;var i=r(!0),a=r(!1),s=r(null),u=r(void 0),c=r(0),l=r("");o.resolve=function(t){if(t instanceof o)return t;if(null===t)return s;if(void 0===t)return u;if(!0===t)return i;if(!1===t)return a;if(0===t)return c;if(""===t)return l;if("object"===typeof t||"function"===typeof t)try{var n=t.then;if("function"===typeof n)return new o(n.bind(t))}catch(t){return new o(function(n,e){e(t)})}return r(t)},o.all=function(t){var n=Array.prototype.slice.call(t);return new o(function(t,e){function r(a,s){if(s&&("object"===typeof s||"function"===typeof s)){if(s instanceof o&&s.then===o.prototype.then){for(;3===s._83;)s=s._18;return 1===s._83?r(a,s._18):(2===s._83&&e(s._18),void s.then(function(t){r(a,t)},e))}var u=s.then;if("function"===typeof u){return void new o(u.bind(s)).then(function(t){r(a,t)},e)}}n[a]=s,0===--i&&t(n)}if(0===n.length)return t([]);for(var i=n.length,a=0;a<n.length;a++)r(a,n[a])})},o.reject=function(t){return new o(function(n,e){e(t)})},o.race=function(t){return new o(function(n,e){t.forEach(function(t){o.resolve(t).then(n,e)})})},o.prototype.catch=function(t){return this.then(null,t)}},function(t,n,e){"use strict";function r(t){if(null===t||void 0===t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}var o=Object.getOwnPropertySymbols,i=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;t.exports=function(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var n={},e=0;e<10;e++)n["_"+String.fromCharCode(e)]=e;if("0123456789"!==Object.getOwnPropertyNames(n).map(function(t){return n[t]}).join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach(function(t){r[t]=t}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(t){return!1}}()?Object.assign:function(t,n){for(var e,s,u=r(t),c=1;c<arguments.length;c++){e=Object(arguments[c]);for(var l in e)i.call(e,l)&&(u[l]=e[l]);if(o){s=o(e);for(var f=0;f<s.length;f++)a.call(e,s[f])&&(u[s[f]]=e[s[f]])}}return u}},function(t,n,e){"use strict";e(9);var r=e(14),o=function(t){if(t&&t.__esModule)return t;var n={};if(null!=t)for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&(n[e]=t[e]);return n.default=t,n}(r),i="http://www.w3.org/2000/svg",a=[[80,300],[150,50],[350,50],[400,300]],s=[[null,null],[null,null],[null,null],[null,null]];s=a;var u=null,c={x:null,y:null},l={x:null,y:null},f=Number(o.tInput.value)/100;document.addEventListener("mousemove",function(t){1&t.buttons&&null!==u&&(s[u][0]=l.x-(c.x-t.pageX),s[u][1]=l.y-(c.y-t.pageY),p(u),d(),A())}),o.pins.forEach(function(t){t.addEventListener("mousedown",function(t){t.preventDefault(),u=t.target.getAttribute("data-id"),o.container.classList.add("no-transition"),c={x:t.pageX,y:t.pageY},l={x:s[u][0],y:s[u][1]};var n=function t(){o.container.classList.remove("no-transition"),s[u][0]>500?s[u][0]=500:s[u][0]<0&&(s[u][0]=0),s[u][1]>500?s[u][1]=500:s[u][1]<0&&(s[u][1]=0),p(u),d(),A(),u=null,document.removeEventListener("mouseup",t)};document.addEventListener("mouseup",n)})});var p=function(t){t?(o.pins[t].style.transform="translate(-50%, -50%) translate("+s[t][0]+"px, "+s[t][1]+"px)",o.pins[t].setAttribute("data-coords",s[t][0]+", "+s[t][1])):o.pins.forEach(function(t,n){t.style.transform="translate(-50%, -50%) translate("+s[n][0]+"px, "+s[n][1]+"px)",t.setAttribute("data-coords",s[n][0]+", "+s[n][1])})},A=function(){m.forEach(function(t,n){var e=(s[n+1][0]-s[n][0])*f,r=(s[n+1][1]-s[n][1])*f;t[0]=s[n][0]+e,t[1]=s[n][1]+r}),y.forEach(function(t,n){var e=(m[n+1][0]-m[n][0])*f,r=(m[n+1][1]-m[n][1])*f;t[0]=m[n][0]+e,t[1]=m[n][1]+r}),o.cast0.setAttribute("d","M "+m[0][0]+" "+m[0][1]+" L "+m[1][0]+" "+m[1][1]),o.cast1.setAttribute("d","M "+m[1][0]+" "+m[1][1]+" L "+m[2][0]+" "+m[2][1]),o.supp0Marker.setAttribute("cx",m[0][0]),o.supp0Marker.setAttribute("cy",m[0][1]),o.supp1Marker.setAttribute("cx",m[1][0]),o.supp1Marker.setAttribute("cy",m[1][1]),o.supp2Marker.setAttribute("cx",m[2][0]),o.supp2Marker.setAttribute("cy",m[2][1]),o.castTop.setAttribute("d","M "+y[0][0]+" "+y[0][1]+" L "+y[1][0]+" "+y[1][1]),o.cast0Marker.setAttribute("cx",y[0][0]),o.cast0Marker.setAttribute("cy",y[0][1]),o.cast1Marker.setAttribute("cx",y[1][0]),o.cast1Marker.setAttribute("cy",y[1][1]);var t=(y[1][0]-y[0][0])*f,n=(y[1][1]-y[0][1])*f;o.castTopMarker.setAttribute("cx",y[0][0]+t),o.castTopMarker.setAttribute("cy",y[0][1]+n)},d=function(){o.supp0.setAttribute("d","M "+s[0][0]+" "+s[0][1]+" L "+s[1][0]+" "+s[1][1]),o.supp1.setAttribute("d","M "+s[1][0]+" "+s[1][1]+" L "+s[2][0]+" "+s[2][1]),o.supp2.setAttribute("d","M "+s[2][0]+" "+s[2][1]+" L "+s[3][0]+" "+s[3][1]),o.path.setAttribute("d","M "+s[0][0]+" "+s[0][1]+" C "+s[1][0]+" "+s[1][1]+", "+s[2][0]+" "+s[2][1]+", "+s[3][0]+" "+s[3][1])};o.widthInput.addEventListener("input",function(t){b()}),o.tInput.addEventListener("input",function(t){f=Number(t.target.value)/100,A()}),o.tInput.addEventListener("mousedown",function(t){o.container.classList.add("no-transition")}),o.tInput.addEventListener("mouseup",function(t){o.container.classList.remove("no-transition")});var h=function(){return s.forEach(function(t){t[0]=500*Math.random()>>0,t[1]=500*Math.random()>>0})},b=function(){o.path.style.strokeWidth=o.widthInput.value},m=[[null,null],[null,null],[null,null]],y=[[null,null],[null,null]],v=function(){p(),d(),A()};o.randomize.addEventListener("click",function(){h(),v()}),b(),v(),function(){for(var t=0;t<500;t+=50){var n=document.createElementNS(i,"path");n.setAttribute("d","M 0 "+t+" H 500"),o.grid.appendChild(n)}for(var e=0;e<500;e+=50){var r=document.createElementNS(i,"path");r.setAttribute("d","M "+e+" 0 V 500"),o.grid.appendChild(r)}}()},function(t,n,e){var r=e(10);"string"===typeof r&&(r=[[t.i,r,""]]);var o={hmr:!0};o.transform=void 0;e(12)(r,o);r.locals&&(t.exports=r.locals)},function(t,n,e){n=t.exports=e(11)(!0),n.push([t.i,"body{margin:0;font-family:sans-serif}.container{height:500px;background:#f3f3f3;position:relative;-webkit-box-flex:0;-ms-flex:0 0 500px;flex:0 0 500px}.container.no-transition .pin,.container.no-transition circle,.container.no-transition path{-webkit-transition:none;transition:none}.le-path{stroke:rgba(0,0,0,.8);stroke-width:2;fill:none;-webkit-transition:d .2s;transition:d .2s}.supp-path{stroke:rgba(240,0,0,.6);stroke-dasharray:8 5}.cast-path,.supp-path{fill:none;-webkit-transition:d .2s;transition:d .2s}.cast-path{stroke:rgba(1,110,1,.6);stroke-dasharray:8 5}.cast-top-path{stroke:rgba(200,114,0,.8);fill:none;-webkit-transition:d .2s;transition:d .2s;stroke-dasharray:8 5}.marker{fill:rgba(0,0,0,.2);-webkit-transition:cx .2s,cy .2s;transition:cx .2s,cy .2s}.marker#marker-cast-top-path{fill:rgba(0,0,240,.8)}.grid path{stroke-width:1;stroke:rgba(0,0,0,.05)}.pin{position:absolute;width:15px;height:15px;border-radius:50%;background:rgba(0,0,200,.3);cursor:pointer;left:0;top:0;-webkit-transition:background .2s,-webkit-transform .2s;transition:background .2s,-webkit-transform .2s;transition:transform .2s,background .2s;transition:transform .2s,background .2s,-webkit-transform .2s}.pin:hover{background:rgba(0,0,200,.5)}.pin:after{content:attr(data-coords);position:absolute;left:50%;top:100%;font-size:12px;white-space:nowrap;-webkit-transform:translate(-50%);transform:translate(-50%);padding:5px 10px}.layout{display:-webkit-box;display:-ms-flexbox;display:flex}.input,.view{padding:50px 0}.opt-line{margin-bottom:30px;padding:0 50px}h3{margin:0}.t-input-labels{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between}","",{version:3,sources:["/Users/jee/Sites/vhost-test/curves/src/curves.css"],names:[],mappings:"AAAA,KACE,SAAU,AACV,sBAAwB,CACzB,AAED,WACE,aAAc,AACd,mBAAoB,AACpB,kBAAmB,AACnB,mBAAoB,AAChB,mBAAoB,AAChB,cAAe,CACxB,AAOD,4FAEM,wBAAyB,AACzB,eAAiB,CACtB,AAED,SACE,sBAA0B,AAC1B,eAAgB,AAChB,UAAW,AACX,yBAA2B,AAC3B,gBAAmB,CACpB,AAED,WACE,wBAA4B,AAI5B,oBAAsB,CACvB,AAED,sBANE,UAAW,AACX,yBAA2B,AAC3B,gBAAmB,CAUpB,AAND,WACE,wBAA4B,AAI5B,oBAAsB,CACvB,AAED,eACE,0BAA8B,AAC9B,UAAW,AACX,yBAA2B,AAC3B,iBAAmB,AACnB,oBAAsB,CACvB,AAED,QACE,oBAAwB,AACxB,iCAAqC,AACrC,wBAA4B,CAC7B,AAED,6BACE,qBAA0B,CAC3B,AAED,WACI,eAAgB,AAChB,sBAA2B,CAC5B,AAEH,KACE,kBAAmB,AACnB,WAAY,AACZ,YAAa,AACb,kBAAmB,AACnB,4BAAgC,AAChC,eAAgB,AAChB,OAAQ,AACR,MAAO,AACP,wDAA4D,AAC5D,gDAAoD,AACpD,wCAA4C,AAC5C,6DAAmE,CACpE,AAED,WACE,2BAAgC,CACjC,AAED,WACE,0BAA2B,AAC3B,kBAAmB,AACnB,SAAU,AACV,SAAU,AACV,eAAgB,AAChB,mBAAoB,AACpB,kCAAsC,AAC9B,0BAA8B,AACtC,gBAAkB,CACnB,AAED,QACE,oBAAqB,AACrB,oBAAqB,AACrB,YAAc,CACf,AAMD,aACE,cAAgB,CACjB,AAED,UACE,mBAAoB,AACpB,cAAgB,CACjB,AAED,GACE,QAAU,CACX,AAED,gBACE,oBAAqB,AACrB,oBAAqB,AACrB,aAAc,AACd,yBAA0B,AACtB,sBAAuB,AACnB,6BAA+B,CACxC",file:"curves.css",sourcesContent:["body {\n  margin: 0;\n  font-family: sans-serif;\n}\n\n.container {\n  height: 500px;\n  background: #f3f3f3;\n  position: relative;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 500px;\n          flex: 0 0 500px\n}\n\n.container.no-transition .pin {\n      -webkit-transition: none;\n      transition: none;\n}\n\n.container.no-transition path,\n    .container.no-transition circle {\n      -webkit-transition: none;\n      transition: none;\n}\n\n.le-path {\n  stroke: rgba(0, 0, 0, .8);\n  stroke-width: 2;\n  fill: none;\n  -webkit-transition: d 0.2s;\n  transition: d 0.2s;\n}\n\n.supp-path {\n  stroke: rgba(240, 0, 0, .6);\n  fill: none;\n  -webkit-transition: d 0.2s;\n  transition: d 0.2s;\n  stroke-dasharray: 8 5;\n}\n\n.cast-path {\n  stroke: rgba(1, 110, 1, .6);\n  fill: none;\n  -webkit-transition: d 0.2s;\n  transition: d 0.2s;\n  stroke-dasharray: 8 5;\n}\n\n.cast-top-path {\n  stroke: rgba(200, 114, 0, .8);\n  fill: none;\n  -webkit-transition: d 0.2s;\n  transition: d 0.2s;\n  stroke-dasharray: 8 5;\n}\n\n.marker {\n  fill: rgba(0, 0, 0, .2);\n  -webkit-transition: cx 0.2s, cy 0.2s;\n  transition: cx 0.2s, cy 0.2s\n}\n\n.marker#marker-cast-top-path {\n  fill: rgba(0, 0, 240, .8);\n}\n\n.grid path {\n    stroke-width: 1;\n    stroke: rgba(0, 0, 0, .05);\n  }\n\n.pin {\n  position: absolute;\n  width: 15px;\n  height: 15px;\n  border-radius: 50%;\n  background: rgba(0, 0, 200, .3);\n  cursor: pointer;\n  left: 0;\n  top: 0;\n  -webkit-transition: background 0.2s, -webkit-transform 0.2s;\n  transition: background 0.2s, -webkit-transform 0.2s;\n  transition: transform 0.2s, background 0.2s;\n  transition: transform 0.2s, background 0.2s, -webkit-transform 0.2s\n}\n\n.pin:hover {\n  background: rgba(0, 0, 200, .5);\n}\n\n.pin:after {\n  content: attr(data-coords);\n  position: absolute;\n  left: 50%;\n  top: 100%;\n  font-size: 12px;\n  white-space: nowrap;\n  -webkit-transform: translate(-50%, 0);\n          transform: translate(-50%, 0);\n  padding: 5px 10px;\n}\n\n.layout {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n\n.input {\n  padding: 50px 0;\n}\n\n.view {\n  padding: 50px 0;\n}\n\n.opt-line {\n  margin-bottom: 30px;\n  padding: 0 50px;\n}\n\nh3 {\n  margin: 0;\n}\n\n.t-input-labels {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n}\n"],sourceRoot:""}])},function(t,n){function e(t,n){var e=t[1]||"",o=t[3];if(!o)return e;if(n&&"function"===typeof btoa){var i=r(o);return[e].concat(o.sources.map(function(t){return"/*# sourceURL="+o.sourceRoot+t+" */"})).concat([i]).join("\n")}return[e].join("\n")}function r(t){return"/*# sourceMappingURL=data:application/json;charset=utf-8;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(t))))+" */"}t.exports=function(t){var n=[];return n.toString=function(){return this.map(function(n){var r=e(n,t);return n[2]?"@media "+n[2]+"{"+r+"}":r}).join("")},n.i=function(t,e){"string"===typeof t&&(t=[[null,t,""]]);for(var r={},o=0;o<this.length;o++){var i=this[o][0];"number"===typeof i&&(r[i]=!0)}for(o=0;o<t.length;o++){var a=t[o];"number"===typeof a[0]&&r[a[0]]||(e&&!a[2]?a[2]=e:e&&(a[2]="("+a[2]+") and ("+e+")"),n.push(a))}},n}},function(t,n,e){function r(t,n){for(var e=0;e<t.length;e++){var r=t[e],o=d[r.id];if(o){o.refs++;for(var i=0;i<o.parts.length;i++)o.parts[i](r.parts[i]);for(;i<r.parts.length;i++)o.parts.push(l(r.parts[i],n))}else{for(var a=[],i=0;i<r.parts.length;i++)a.push(l(r.parts[i],n));d[r.id]={id:r.id,refs:1,parts:a}}}}function o(t,n){for(var e=[],r={},o=0;o<t.length;o++){var i=t[o],a=n.base?i[0]+n.base:i[0],s=i[1],u=i[2],c=i[3],l={css:s,media:u,sourceMap:c};r[a]?r[a].parts.push(l):e.push(r[a]={id:a,parts:[l]})}return e}function i(t,n){var e=b(t.insertInto);if(!e)throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");var r=v[v.length-1];if("top"===t.insertAt)r?r.nextSibling?e.insertBefore(n,r.nextSibling):e.appendChild(n):e.insertBefore(n,e.firstChild),v.push(n);else if("bottom"===t.insertAt)e.appendChild(n);else{if("object"!==typeof t.insertAt||!t.insertAt.before)throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");var o=b(t.insertInto+" "+t.insertAt.before);e.insertBefore(n,o)}}function a(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t);var n=v.indexOf(t);n>=0&&v.splice(n,1)}function s(t){var n=document.createElement("style");return t.attrs.type="text/css",c(n,t.attrs),i(t,n),n}function u(t){var n=document.createElement("link");return t.attrs.type="text/css",t.attrs.rel="stylesheet",c(n,t.attrs),i(t,n),n}function c(t,n){Object.keys(n).forEach(function(e){t.setAttribute(e,n[e])})}function l(t,n){var e,r,o,i;if(n.transform&&t.css){if(!(i=n.transform(t.css)))return function(){};t.css=i}if(n.singleton){var c=y++;e=m||(m=s(n)),r=f.bind(null,e,c,!1),o=f.bind(null,e,c,!0)}else t.sourceMap&&"function"===typeof URL&&"function"===typeof URL.createObjectURL&&"function"===typeof URL.revokeObjectURL&&"function"===typeof Blob&&"function"===typeof btoa?(e=u(n),r=A.bind(null,e,n),o=function(){a(e),e.href&&URL.revokeObjectURL(e.href)}):(e=s(n),r=p.bind(null,e),o=function(){a(e)});return r(t),function(n){if(n){if(n.css===t.css&&n.media===t.media&&n.sourceMap===t.sourceMap)return;r(t=n)}else o()}}function f(t,n,e,r){var o=e?"":r.css;if(t.styleSheet)t.styleSheet.cssText=B(n,o);else{var i=document.createTextNode(o),a=t.childNodes;a[n]&&t.removeChild(a[n]),a.length?t.insertBefore(i,a[n]):t.appendChild(i)}}function p(t,n){var e=n.css,r=n.media;if(r&&t.setAttribute("media",r),t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}function A(t,n,e){var r=e.css,o=e.sourceMap,i=void 0===n.convertToAbsoluteUrls&&o;(n.convertToAbsoluteUrls||i)&&(r=g(r)),o&&(r+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */");var a=new Blob([r],{type:"text/css"}),s=t.href;t.href=URL.createObjectURL(a),s&&URL.revokeObjectURL(s)}var d={},h=function(t){var n;return function(){return"undefined"===typeof n&&(n=t.apply(this,arguments)),n}}(function(){return window&&document&&document.all&&!window.atob}),b=function(t){var n={};return function(e){if("undefined"===typeof n[e]){var r=t.call(this,e);if(r instanceof window.HTMLIFrameElement)try{r=r.contentDocument.head}catch(t){r=null}n[e]=r}return n[e]}}(function(t){return document.querySelector(t)}),m=null,y=0,v=[],g=e(13);t.exports=function(t,n){if("undefined"!==typeof DEBUG&&DEBUG&&"object"!==typeof document)throw new Error("The style-loader cannot be used in a non-browser environment");n=n||{},n.attrs="object"===typeof n.attrs?n.attrs:{},n.singleton||(n.singleton=h()),n.insertInto||(n.insertInto="head"),n.insertAt||(n.insertAt="bottom");var e=o(t,n);return r(e,n),function(t){for(var i=[],a=0;a<e.length;a++){var s=e[a],u=d[s.id];u.refs--,i.push(u)}if(t){r(o(t,n),n)}for(var a=0;a<i.length;a++){var u=i[a];if(0===u.refs){for(var c=0;c<u.parts.length;c++)u.parts[c]();delete d[u.id]}}}};var B=function(){var t=[];return function(n,e){return t[n]=e,t.filter(Boolean).join("\n")}}()},function(t,n){t.exports=function(t){var n="undefined"!==typeof window&&window.location;if(!n)throw new Error("fixUrls requires window.location");if(!t||"string"!==typeof t)return t;var e=n.protocol+"//"+n.host,r=e+n.pathname.replace(/\/[^\/]*$/,"/");return t.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi,function(t,n){var o=n.trim().replace(/^"(.*)"$/,function(t,n){return n}).replace(/^'(.*)'$/,function(t,n){return n});if(/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(o))return t;var i;return i=0===o.indexOf("//")?o:0===o.indexOf("/")?e+o:r+o.replace(/^\.\//,""),"url("+JSON.stringify(i)+")"})}},function(t,n,e){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.path=document.querySelector("#le-path"),n.grid=document.querySelector(".grid"),n.supp0=document.querySelector("#supp-path-0"),n.supp0Marker=document.querySelector("#marker-supp-path-0"),n.supp1=document.querySelector("#supp-path-1"),n.supp1Marker=document.querySelector("#marker-supp-path-1"),n.supp2=document.querySelector("#supp-path-2"),n.supp2Marker=document.querySelector("#marker-supp-path-2"),n.cast0=document.querySelector("#cast-path-0"),n.cast0Marker=document.querySelector("#marker-cast-path-0"),n.cast1=document.querySelector("#cast-path-1"),n.cast1Marker=document.querySelector("#marker-cast-path-1"),n.castTop=document.querySelector("#cast-top-path"),n.castTopMarker=document.querySelector("#marker-cast-top-path"),n.widthInput=document.querySelector("#width-input"),n.tInput=document.querySelector("#t-input"),n.container=document.querySelector(".container"),n.randomize=document.querySelector("#randomize"),n.pins=Array.from(document.querySelectorAll(".pin"))}])});
//# sourceMappingURL=maps/index.js.map