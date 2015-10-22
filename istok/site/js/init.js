(function() {
	'use strict';

	if (!Array.prototype.forEach) {
		alert('This is a bad and old broswer. Use IE9+');
		return;
	}

	var logWithArguments = function() {
			console.log.apply(console, arguments);
		},
		consoleMethods = ['assert', 'error', 'debug', 'log', 'warn', 'info', 'table', 'count'];

	consoleMethods.forEach(function(m) {
		if (!window.console[m]) {
			window.console[m] = console.log.apply ? logWithArguments : console.log;
		}
	});

	if (window.sv) {
		console.error('window.sv is already defined');
		return;
	}
	document.documentElement.setAttribute('data-ready-state', 0);
	window.sv = {};

	var appendScript = function(path, onload, onerror) {
		var script = document.createElement('script');
		script.onload = onload;
		script.onerror = onerror;
		script.src = path;
		document.head.appendChild(script);
	};

	sv._loadJS = function(paths, done) {
		paths = [].concat(paths);

		var length = paths.length,
			loadedCounter = 0;

		var increaseCounter = function() {
			if (++loadedCounter === length) {
				if (typeof done === 'function') {
					done();
				}
			} else {
				appendNext();
			}
		};

		var appendNext = function() {
			var path = paths[loadedCounter];
			appendScript(path, function() {
				console.info('loaded "%s"', path);
				increaseCounter();
			}, function() {
				console.info('failed to load "%s"', path);
				increaseCounter();
			});
		};

		appendNext();
	};

	sv._loadJS('js/utils.js', function() {
		sv._loadJS([
			'js/tools.js', 
			'js/plugins.js',
			// 'js/libs/prefixfree.min.js',
			'js/libs/jquery-1.11.1.min.js'
		], function() {
			sv._loadJS('js/ready.js');
		});
	});

	sv.properties = {
		opera: !!~navigator.userAgent.indexOf('Opera'),
		mobile: !!~navigator.userAgent.search(/Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry/),
		lte600: Math.min(screen.availWidth, document.documentElement.clientWidth) <= 600,
		spriteURL: 'images/sprite.png',
		DEBUG: true
	};

})();