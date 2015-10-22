sv.utils = (function() {
	'use strict';

	var utils = {
		compat: function() {
			var noop = function() {};
			if (!window.requestAnimationFrame) {
				console.info('animation frames aren\'t supported');
				window.requestAnimationFrame = window.cancelAnimationFrame = noop;
			}
			if (!window.localStorage) {
				console.info('storages aren\'t supported');
				window.localStorage = window.sessionStorage = {};
			}
			if (window.history.state === undefined) {
				console.info('HTML5 history isn\'t supported');
				window.history.state = null;
				window.history.pushState = window.history.replaceState = noop;
			}
		},
		getStyleProperties: function(props) {
			var style = document.documentElement.style,
				props = [].concat(props),
				supportedProps = {},
				prefixes = ['webkit', 'Webkit', 'Moz', 'ms', 'O'],
				property,
				capitalizedProperty;

			checkNext:
			for (var i in props) {
				property = props[i];

				if (property in style) {
					supportedProps[property] = property;
				} else {
					capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);

					for (var j in prefixes) {
						if (prefixes[j] + capitalizedProperty in style) {
							supportedProps[property] = prefixes[j] + capitalizedProperty;
							continue checkNext;
						}
					}
					supportedProps[property] = false;
				}
			}
			return supportedProps;
		},
		move: function() {
			var xProperty,
				yProperty,
				xPrefix,
				yPrefix,
				xPostfix,
				yPostfix,
				xyPrefix,
				xyPostfix;

			var CSSprops = utils.getStyleProperties(['transform', 'perspective']);

			if (CSSprops.transform) {
				xProperty = yProperty = CSSprops.transform;
				if (CSSprops.perspective) {
					xPrefix = 'translate3d(';
					yPrefix = 'translate3d(0, ';
					xPostfix = 'px, 0, 0)';
					yPostfix = xyPostfix = 'px, 0)';
					xyPrefix = 'translate3d(';
				} else {
					xPrefix = 'translateX(';
					yPrefix = 'translateY(';
					xPostfix = yPostfix = xyPostfix = 'px)';
					xyPrefix = 'translate(';
				}
			} else {
				xProperty = 'left';
				yProperty = 'top';
				xPrefix = yPrefix = '';
				xPostfix = yPostfix = 'px';
			}

			var axes = {
				x: function(dist) {
					this.style[xProperty] = xPrefix + dist + xPostfix;
				},
				y: function(dist) {
					this.style[yProperty] = yPrefix + dist + yPostfix;
				}
			}

			if (CSSprops.transform) {
				axes.xy = function(distX, distY) {
					this.style[CSSprops.transform] = xyPrefix + distX + 'px, ' + distY + xyPostfix;
				};
			} else {
				axes.xy = function(distX, distY) {
					this.style.left = distX + 'px';
					this.style.top = distY + 'px';
				}
			}

			return axes;
		},
		raf: function() {

			var lastTime = 0,
				vendors = ['ms', 'moz', 'webkit', 'o'];

			for (var x = 0; x < vendors.length; ++x) {
				window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
			}

			window.requestAnimationFrame = function(callback, element) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

			window.cancelAnimationFrame = function(id) {
				clearTimeout(id);
			};
		},
		jGet: function(selector) {
			return $(selector, typeof selector === 'string' ? this : null);
		},
		loadJS: sv._loadJS
	};

	utils.move = utils.move();

	return utils;
})();