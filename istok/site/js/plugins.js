sv.plugins = (function() {
	'use strict';

	var jGet = sv.utils.jGet;

	var plugins = {
		setNumber: function(value, options) {

			var opts = $.extend({
				nan: function() {
					throw new Error('Failed to parse the string');
					el.innerHTML = value;
					return;
				},
				parts: 12
			}, options);

			var el = this[0],
				property = 'value' in el ? 'value' : 'innerHTML',
				number = parseFloat(el[property]),
				value = parseFloat(value),
				decimal;

			if ( !$.isNumeric(number) ) return opts.nan();

			if (!value) value = 0;

			var getDecimal = function(number) {
				var dec;
				try {
					dec = number.toString().split('.')[1].length;
				} catch(e) {
					dec = 0;
				}
				return dec;
			}

			decimal = Math.max(getDecimal(value), getDecimal(number));

			var sign = 1; // increasing

			if (value === number) {
				el[property] = value.toFixed(decimal);
				return;
			} else if (value < number) {
				sign = -1; // decreasing
			}

			var n = opts.parts,
				k = Math.log(Math.abs(value - number)) / n,
				parts = [],
				sum = 0;

			for (; n > 0; n--) {
				parts.push( Math.pow(Math.E, k * n) - Math.pow(Math.E, k * (n - 1)) );
			}
			var counter = 0;

			var increase = function() {
				number += parts.shift(0) * sign;
				el[property] = number.toFixed(decimal);

				if (parts.length) {
					requestAnimationFrame(increase);
				} else {
					el[property] = value.toFixed(decimal);
				}
			};

			requestAnimationFrame(increase);
		},
		fitBg: function(options) {

			var opts = $.extend({
				loadResize: true,
				watchResize: true,
				hideLoadingAnimation: false,
				orderedLoad: false,
				orderedLoadDelay: 100,
				loadFunction: $.noop,
				imageSelector: 'img'
			}, options),
				allContainers = this,
				allImages = [],
				loadedImages = 0;

			return this.each(function() {
				var container = $(this),
					$image = container.find(opts.imageSelector),
					image = $image[0],
					imageResize,
					containerHeight,
					containerWidth,
					imageRatio;

				allImages.push($image);

				imageResize = function() {
					containerHeight = container.height();
					containerWidth = container.width();

					if (imageRatio > containerWidth / containerHeight) {
						$image.addClass('v-stretch');
						image.style.left = (containerWidth - image.width) / 2 + 'px';
						image.style.top = 0;
					} else {
						$image.removeClass('v-stretch');
						image.style.top = (containerHeight - image.height) / 2 + 'px';
						image.style.left = 0;
					}
				};

				image.onload = function() {
					/*if ( $image.hasClass('loaded') ) return;*/
					if (opts.loadResize) {
						imageRatio = this.width / this.height;
						imageResize();
					}
					if (!opts.orderedLoad) {
						$image.addClass('loaded');
						if (opts.hideLoadingAnimation) container.css('background-image', 'none');
					}

					loadedImages++;
					if (loadedImages === allImages.length) {
						if (opts.orderedLoad) {
							var curImage = 0;
							(function showImage() {
								$(allImages[curImage]).addClass('loaded');
								if (opts.hideLoadingAnimation) allContainers[curImage].style.backgroundImage = 'none';

								if (allImages[curImage + 1]) {
									setTimeout(showImage, opts.orderedLoadDelay);
									curImage++;
								}
							})();
						}
						opts.loadFunction();
					}
	 			};
				image.onerror = function() {
					console.warn('image %o wasn\'t loaded', this);
				};

	 			image.src = image.src; // opera and IE bug
				if (image.complete) image.onload();

				if (opts.watchResize) sv.dom.$window.resize(imageResize);
			});
		},
		liveCSS: function(callback) {
			return this.each(function() {
				var proxied = $.proxy(callback, this);

				sv.dom.$window.resize(proxied).load(proxied);
				proxied();
			});
		},
		tabs: function(options) {

			var opts = $.extend({
				element: 'a',
				unselectable: false,
				checkFirst: true,
				emulateClick: true,
				allowActiveClick: false,

				containers: '.sv-tab',
				changeHash: false,
				pushStateOnTabChange: false,
				additionalTabs: null,
				preventDefault: true,
				onchange: null
			}, options);

			return this.each(function() {

				if (opts.element !== 'a') {

					var $container = $(this),
						firstEl = null;

					$container.on('click', opts.element, function(e) {
						var $this = $(this);
						opts.preventDefault && e.preventDefault();

						if ($this.hasClass('active')) {
							if (opts.unselectable) {
								$this.removeClass('active');
							} else {
								if (!opts.allowActiveClick) return;
							}
						} else {
							$container.find(opts.element).filter('.active').removeClass('active');
							$this.addClass('active');
						}

						opts.onchange && opts.onchange.call(this);
					});

					var activeElement = $container.find(opts.element).filter('.active');

					if (!activeElement[0]) {
						if (opts.checkFirst) {
							firstEl = $container.find(opts.element).first();
							if (opts.emulateClick) {
								firstEl.click();
							} else {
								firstEl.addClass('active');
								opts.onchange && opts.onchange.call(firstEl[0]); // FIXME
							}
						}
					} else {
						opts.onchange && opts.onchange.call(activeElement[0]);
					}

					return;
				}

				var tabs = opts.additionalTabs ? $(this).add(opts.additionalTabs) : $(this),
					$containers = $(opts.containers),
					$this;

				var firstLink = tabs.find('a[href*=#]').first()[0];

				if ( firstLink.protocol + '/' + firstLink.pathname !== location.protocol + '/' + location.pathname ) {
					console.warn('link %o leads to a different page', firstLink);
					return;
				}

				var tabExists = function(selector) {
					try {
						$('[href*=' + selector + ']');
					} catch(e) {
						console.error('%o, bad selector', e);
						return;
					}

					return tabs.find('a[href$=' + selector + ']')[0];
				};

				var showTab = function(id) {
					try {
						$('[href*=' + id + ']');
					} catch(e) {
						console.error('bad location hash for tab');
						return;
					}
					if (!id || !tabExists(id)) {
						console.error('anchor (?) with %s hash wasn\'t found', id);
						return;
					}

					tabs.find('a[href*=#]').removeClass('active').end()
						.find('a[href$=' + id + ']').addClass('active');

					var tabToShow = $containers.filter(id);
					if (!tabToShow[0]) {
						console.warn('tab with id "%s" wasn\'t found', id);
					}

					$containers.removeClass('active');
					tabToShow.addClass('active');
					opts.onchange && opts.onchange.call(this);
				};

				if (opts.changeHash) { // false by def
					window.onpopstate = function() { // fails on multiple calls FIXME
						console.log('state change detected wtih position %s', window.history.state);
						showTab(location.hash);
						window.scroll(0, window.history.state);
					};
				}


				var stateMethod = opts.pushStateOnTabChange ? 'pushState' : 'replaceState';

				tabs.on('click', 'a[href*=#]', function(e) {
					$this = $(this);
					opts.preventDefault && e.preventDefault();

					if ( $this.hasClass('active') ) return;

					opts.changeHash && window.history[stateMethod](sv.dom.$window.scrollTop(), null, this.hash);

					showTab.call(this, this.hash);
				});

				var firstAnchor = tabs.find('a[href*=#]').first()[0],
					firstAnchorHash = firstAnchor.hash;

				if (location.hash) {
					if (tabExists(location.hash)) {
						showTab.call(tabExists(location.hash), location.hash);
					} else {
						showTab.call(firstAnchor, firstAnchorHash);
					}
				} else {
					opts.checkFirst && showTab.call(firstAnchor, firstAnchorHash);
				}

			});
		},
		popup: function(options) {

			sv.popupCounter = sv.popupCounter || 0;

			var opts = $.extend({
				showClass: 'visible',
				container: $(),
				hideEl: $(),
				directHideEl: $(),
				ignoreFrom: $(),
				onhide: null,
				onshow: null,
				onclick: null,
				documentClickClose: true,
				documentEscClose: false,
				showOnClick: true,
				returnAll: false
			}, options),
				popups = [];

			this.each(function() {

				var eventNS = '.popup' + sv.popupCounter++;

				var $this = $(this),
					_this = this,
					dontClose = false,
					visible = false;

				var $container = jGet.call(this, opts.container),
					$hideEl = jGet.call(this, opts.hideEl),
					$directHideEl = jGet.call(this, opts.directHideEl),
					$ignoreFrom = jGet.call(this, opts.ignoreFrom);

				if (!$container[0]) {
					console.warn('svp.popup: container wasn\'t found');
				}

				var Popup = function() {
					this.hide = function() {
						if (!this.visible()) return;
						visible = false;
						$this.add($container).removeClass(opts.showClass);
						opts.documentClickClose && removeDocumentListener('click');
						opts.documentEscClose && removeDocumentListener('keydown');
						opts.onhide && opts.onhide.call(_this, this);
					};
					this.show = function() {
						if (initialListenerAdded && opts.documentClickClose) { // removing initial listener on a first show
							sv.dom.$body.off('click' + eventNS + '-initial');
							initialListenerAdded = false;
						}
						if (this.visible()) return;
						visible = true;
						$this.add($container).addClass(opts.showClass);
						opts.documentClickClose && addDocumentClickListener();
						opts.documentEscClose && addDocumentEscListener();
						opts.onshow && opts.onshow.call(_this, this);
					};
					this.visible = function() {
						return visible;
					};
				};

				var _popup = new Popup();

				popups.push(_popup);

				var addDocumentClickListener = function() {
					sv.dom.$body.on('click' + eventNS, function(e) {
						if (dontClose) {
							dontClose = false;
						} else {
							_popup.hide();
						}
					});
				};

				var addDocumentEscListener = function() {
					sv.dom.$body.on('keydown' + eventNS, function(e) {
						if (e.keyCode === 27) {
							_popup.hide();
						}
					});
				};

				var removeDocumentListener = function(e) {
					sv.dom.$body.off(e + eventNS);
				};

				if (opts.documentClickClose) { // capturing events before the popup was ever opened (BUT not for Esc!)
					sv.dom.$body.on('click' + eventNS + '-initial', function() {
						if (dontClose) {
							dontClose = false;
						}
					});
				}

				var initialListenerAdded = true;

				$container.add($ignoreFrom).on('click', function() {
					dontClose = true;
				});

				$this.click(function() {
					if (opts.showOnClick) {
						if (!visible) {
							_popup.show();
							dontClose = true;
						} else if (!opts.documentClickClose) {
							_popup.hide();
						}
					}
					opts.onclick && opts.onclick.call(this, _popup);
				});

				$hideEl.click(function() {
					_popup.hide();
				});

				$directHideEl.click(function(e) {
					if (e.target === this) _popup.hide();
				});

				if ($container.hasClass(opts.showClass)) {
					_popup.show();
				}
			});

			return opts.returnAll ? popups : popups[0];
		},
		slider: function(options) {

			options = options || {};

			if (!this[0]) return $();

			var prefix = options.prefix || '.';

			var opts = $.extend({
				parent: this,
				mode: 'position',

				reel: prefix + '-reel',
				slide: prefix + '-slide',
				prevCtrl: prefix + '-prev',
				nextCtrl: prefix + '-next',
				container: prefix + '-container',

				disabledClass: 'disabled',
				inactiveClass: 'inactive',

				horizontal: true,
				loop: true,
				step: 1,
				viewport: 'max',
				speed: 200,
				autoTimer: false,
				resizable: false,
				mouseScroll: false,
				throttle: true,
				fullSizeSlide: false,
				oninit: null,
				onmove: null,

				navContainer: prefix + '-nav',
				nav: true,
				navTag: '<span></span>',

				explicitSlideSize: null,
				explicitContainerSize: null,

				css3support: true,
				transitionTimingFunction: 'ease',
				quickSpeed: 300,
				deltaThreshold: 150,
				deltaMultiplier: .5,

				correction: 0, // WTF
				name: this.selector
			}, options);

			sv.sliders = sv.sliders || {};

			return this.each(function() {

				var $slider = $(this),
					parent = $slider.closest(opts.parent),
					$reel = parent.find(opts.reel),
					reel = $reel[0],
					$container = parent.find(opts.container),
					$slides = parent.find(opts.slide),
					$firstSlide = $slides.first(),
					$navContainer = parent.find(opts.navContainer),
					$navTag = $(opts.navTag),
					navTagName = '',
					slidesAmount = $slides.length,
					autoScroll,
					nextSlide = 0,
					nextSlideElement = null,
					realNext = 0,
					curSlide = 0,
					moving = false,
					slideSize,
					containerSize,
					viewport,
					step,
					auxSlides = 0,
					$prevCtrl = parent.find(opts.prevCtrl),
					$nextCtrl = parent.find(opts.nextCtrl),
					$controls = $prevCtrl.add($nextCtrl).add($navContainer),
					$this,
					moveReel,
					displaySlide = 0,
					getContainerSize,
					getSlideSize,
					transitionTimer,
					maxSlide,
					minSlide,
					outClass,
					inClass;

				if (!$slides[0]) {
					return console.warn('svp.slider: no slides found (%s)', opts.slide);
				}

				var CSSprops = sv.utils.getStyleProperties(['transform', 'perspective']);

				var instantMove = function(start) {
					if (opts.mode === 'class') return;
					reel.style[CSSprops.transition] = 'none';
					moveReel(start ? 0 : -slider.getNextSlide().position);

					if (opts.css3support) {
						clearTimeout(transitionTimer);
						transitionTimer = setTimeout(slider.css3);
					}
				};

				var noTransition = function(el, func) {
					el.css({transition: 'none'});
					func();
					el.width();
					el.css({transition: ''});
				};

				var normalize = function(index, loop) {
					if ( index < minSlide || !$.isNumeric(index) ) {
						index = loop ? maxSlide : minSlide;
					} else if (index > maxSlide) {
						index = loop ? minSlide : maxSlide;
					} else {
						index = Math.floor(index);
					}
					return index;
				};

				var Slider = function() {
					/*this.destroy = function() {
						$slides.data('slide-id').css('width', '');
					};*/
					this.getNearest = function() {
						return {
							prev: (realNext - 1 < minSlide) ? maxSlide : realNext - 1,
							next: (realNext + 1 > maxSlide) ? minSlide : realNext + 1
						}
					};
					this.getNextSlide = function() {
						nextSlideElement = $slides.eq(nextSlide + auxSlides / 2);
						return {
							position: nextSlideElement.position()[opts.horizontal ? 'left' : 'top'],
							id: nextSlideElement.data('slide-id')
						}
					};
					this.getSlide = function() {
						return {
							current: curSlide,
							next: nextSlide
						}
					};
					this.init = function() {
						if (!$container[0]) $container = $slider;
						this.element = $container;

						if (opts.explicitContainerSize) {
							if (typeof opts.explicitContainerSize === 'function') {
								getContainerSize = function() { return opts.explicitContainerSize() };
							} else {
								getContainerSize = function() { return opts.explicitContainerSize };
							}
						} else {
							if (opts.horizontal) {
								getContainerSize = function() { return $container.width(); };
							} else {
								getContainerSize = function() { return $container.height(); };
							}
						}

						containerSize = getContainerSize();

						if (opts.explicitSlideSize) {
							if (typeof opts.explicitContainerSize === 'function') {
								getSlideSize = function() { return opts.explicitSlideSize() };
							} else {
								getSlideSize = function() { return opts.explicitSlideSize };
							}
						} else {
							if (opts.horizontal) {
								getSlideSize = function() { return $firstSlide.outerWidth(true); };
							} else {
								getSlideSize = function() { return $firstSlide.outerHeight(true); };
							}
						}

						moveReel = $.proxy(opts.horizontal ? sv.utils.move.x : sv.utils.move.y, reel);

						$slides.each(function(i) {
							$(this).attr('data-slide-id', i);
						});

						if (opts.fullSizeSlide) {
							slideSize = getContainerSize() - $firstSlide.outerWidth(true) + $firstSlide.width();
							$slides.width(slideSize);
						} else {
							slideSize = getSlideSize();
						}


						switch(opts.viewport) {
							case 'adjust': viewport = Math.floor(containerSize / slideSize) + 1; break;
							case 'max': viewport = Math.floor(containerSize / slideSize); break;
							default: viewport = opts.viewport; break;
						}

						switch(opts.step) {
							case 'full': step = Math.floor(containerSize / slideSize); break;
							case 'half': step = Math.ceil(containerSize / slideSize / 2); break;
							default: step = opts.step; break;
						}

						if (opts.mode === 'class') {
							$slides.first().addClass('visible');
							if (!opts.loop) {
								$prevCtrl.addClass(opts.inactiveClass);
							}
						} else {
							if (opts.loop) {
								auxSlides = viewport * 2;
								for (i = 1; i < auxSlides; i += 2) {
									$reel.find(opts.slide).eq(-i).clone().prependTo($reel).addClass('aux');
									$reel.find(opts.slide).eq(i).clone().appendTo($reel).addClass('aux');
								}
							} else {
								$prevCtrl.addClass(opts.inactiveClass);
							}
						}

						minSlide = 0;
						maxSlide = slidesAmount - viewport;

						$slides = $container.find(opts.slide);
						instantMove();

						if (slidesAmount <= viewport) {
							$controls.addClass(opts.disabledClass);
							$slides.filter('.aux').hide();
							instantMove(true);
						} else {
							$controls.removeClass(opts.disabledClass);
							$slides.filter('.aux').show();
							instantMove();
						}

						$prevCtrl.click(function() {
							$this = $(this);
							if ( $this.hasClass(opts.inactiveClass) || $this.hasClass(opts.disabledClass) || (opts.throttle && moving) ) return;
							slider.moveTo('prev');
						});

						$nextCtrl.click(function() {
							$this = $(this);
							if ( $this.hasClass(opts.inactiveClass) || $this.hasClass(opts.disabledClass) || (opts.throttle && moving) ) return;
							slider.moveTo('next');
						});

						opts.oninit && opts.oninit.call(this); // same here
					};
					this.moveTo = function(index) {
						if (opts.mode === 'class') {
							curSlide = nextSlide;
						}

						switch(index) {
							case 'prev':

								nextSlide -= step;
								if (opts.loop && nextSlide <= minSlide - step && opts.mode !== 'class') {
									setTimeout(function() {
										nextSlide = maxSlide;
										instantMove();
									}, opts.speed);
								}
								outClass = 'out-prev';
								inClass = 'in-prev';

							break;
							case 'next':

								nextSlide += step;
								if (opts.loop && nextSlide >= maxSlide + step && opts.mode !== 'class') {
									setTimeout(function() {
										nextSlide = minSlide;
										instantMove();
									}, opts.speed);
								}
								outClass = 'out-next';
								inClass = 'in-next';

							break;
							default:
								nextSlide = index;
								outClass = 'out-next';
								inClass = 'in-next';
							break;
						}

						if (!opts.loop || opts.mode === 'class') {
							nextSlide = normalize(nextSlide, opts.mode === 'class');
						}

						realNext = this.getNextSlide().id;

						if (!opts.loop) {
							$prevCtrl.toggleClass(opts.inactiveClass, nextSlide <= minSlide);
							$nextCtrl.toggleClass(opts.inactiveClass, nextSlide >= maxSlide);
						}

						if (opts.autoTimer) this.modules.autoTimer();

						$navContainer.find(navTagName).eq(realNext).addClass('active')
											.siblings(navTagName).removeClass('active');

						if (opts.mode === 'class') {

							if (nextSlide === curSlide) {
								return;
							}

							var cs = $slides.eq(curSlide),
								ns = $slides.eq(nextSlide);

							cs.removeClass('visible').addClass(outClass);

							noTransition(ns, function() {
								ns.addClass(inClass);
							});

							ns.addClass('visible').removeClass(inClass);

							setTimeout(function() {
								noTransition(cs, function() {
									cs.removeClass(outClass);
								});
								moving = false;
							}, opts.speed);

							moving = true;
							opts.onmove && opts.onmove.call(this.element, nextSlide, nextSlideElement);
							return;
						}

						moving = true;
						opts.onmove && opts.onmove.call(this.element, nextSlide, nextSlideElement);
						setTimeout(function() {
							moving = false;
						}, opts.speed);

						moveReel(-this.getNextSlide().position);
					};
					this.modules = {
						resize: function() {
							containerSize = getContainerSize();
							if (opts.fullSizeSlide) {
								slideSize = containerSize;
								$slides.width(slideSize);
							}

							switch(opts.viewport) {
								case 'adjust': viewport = Math.floor(containerSize / slideSize) - 1; break;
								case 'max': viewport = Math.floor(containerSize / slideSize); break;
								default: viewport = opts.viewport; break;
							}

							if (slidesAmount <= viewport) {
								$controls.addClass(opts.disabledClass);
							} else {
								$controls.removeClass(opts.disabledClass);
							}

							instantMove();
						},
						css3: function() {
							reel.style[CSSprops.transition] = opts.speed + 'ms ' + opts.transitionTimingFunction;
						},
						mouseScroll: function() {
							$container.on('mousewheel.wheel wheel.wheel', function(event) {
								if (event.originalEvent.wheelDelta > 0 || event.originalEvent.deltaY < 0) {
									slider.moveTo('prev');
								} else {
									slider.moveTo('next');
								}
								return false;
							});
						},
						nav: function() {
							for (i = 0; i < slidesAmount; i++) {
								$navTag.clone().appendTo($navContainer);
							}
							navTagName = opts.navTag;
							navTagName = navTagName.substring(navTagName.indexOf('<') + 1, navTagName.indexOf('>'));

							$navContainer.on('click', navTagName, function() {
								$this = $(this);
								if ( $this.hasClass('active') ) return;

								slider.moveTo( $this.index() );
							}).find(navTagName).first().addClass('active');
						},
						resizable: function() {
							sv.dom.$window.resize(this.resize);
						},
						autoTimer: function() {
							clearInterval(autoScroll);
							autoScroll = setInterval(function() {
								slider.moveTo('next');
							}, opts.autoTimer);

							$container.off().on({
								mouseenter: function() {
									clearInterval(autoScroll);
								},
								mouseleave: slider.modules.autoTimer
							});
						}
					};
				};

				var _modules = {
					css3: opts.mode !== 'class' && opts.css3support,
					nav: $navContainer[0],
					resizable: opts.resizable,
					autoTimer: opts.autoTimer,
					mouseScroll: opts.mouseScroll,
				};

				var slider = new Slider();

				slider.init();

				for (var i in slider.modules) {
					if (_modules[i] !== false) slider.modules[i]();
				}

				var _slider = sv.sliders[opts.name];

				if (_slider) {
					if ( $.isArray(_slider) ) {
						sv.sliders[opts.name].push(slider);
					} else {
						sv.sliders[opts.name] = [_slider, slider];
					}
				} else {
					sv.sliders[opts.name] = slider;
				}
			});
		},
		gallery: function(options) {

			var prefix = options.prefix || '.';

			var opts = $.extend({
				imageContainer: prefix + '-image',
				prevCtrl: prefix + '-prev',
				nextCtrl: prefix + '-next',
				anchor: 'a',

				disableClickOnActive: true,
				openFirst: true, // false if overlay opens
				loadingClass: 'loading',
				callbacks: {
					beforeLoad: null,
					load: null,
					prev: null,
					next: null
				}
			}, options);

			return this.each(function() {
				var container = $(this),
					$anchors = jGet.call(this, opts.anchor),
					$imageContainer = jGet.call(this, opts.imageContainer),
					$prevCtrl = jGet.call(this, opts.prevCtrl),
					$nextCtrl = jGet.call(this, opts.nextCtrl);

				if (!$imageContainer[0]) {
					return console.warn('svp.gallery: image container ', opts.imageContainer, ' wasn\'t found');
				}

				if ($anchors.length < 2) {
					$prevCtrl.add($nextCtrl).addClass('disabled');
				}

				container.on('click', opts.anchor, function(e) {
					e.preventDefault();

					var _this = this,
						source = this.href,
						$this = $(this),
						$media;

					if ( opts.disableClickOnActive && $this.hasClass('active') ) return;

					$anchors.removeClass('active');
					$this.addClass('active');

					opts.callbacks.beforeLoad && opts.callbacks.beforeLoad.call(_this);

					if (source.match(/(?:jpg|jpeg|png|pdf|bmp|svg)/)) {

						$imageContainer.addClass(opts.loadingClass);

						var image = new Image,
							$image = $(image);

						$image
							.on({
								load: function() {
									$imageContainer
										.empty()
										.append(this)
										.removeClass(opts.loadingClass);
									$image.width();
									$image.removeClass('loading');
									opts.callbacks.load && opts.callbacks.load.call(_this);
								},
								error: function() {
									$imageContainer.removeClass(opts.loadingClass);
									console.error('Error loading %s', source);
								}
							})
							.addClass('loading');

						image.src = source;
					} else {
						console.log('not an image source, trying youtube');

						var $iframe = $('<iframe>', {
							src: 'https://www.youtube.com/embed/' + source.substr(source.lastIndexOf('/') + 1),
							frameborder: 0,
							allowfullscreen: true
						});

						$imageContainer
							.empty()
							.append($iframe)
							opts.callbacks.load && opts.callbacks.load.call(_this);
								/*error: function() {
									$imageContainer.removeClass(opts.loadingClass);
									console.error('Error loading %s', source);
								}*/
					}


				});

				var $nextAnchor = null;

				$prevCtrl.click(function() {
					$nextAnchor = $anchors.filter('.active').prev(opts.anchor);
					if (!$nextAnchor[0]) {
						$nextAnchor = $anchors.last();
					}
					$nextAnchor.click();
					opts.callbacks.prev && opts.callbacks.prev.call(this);
				});
				$nextCtrl.click(function() {
					$nextAnchor = $anchors.filter('.active').next(opts.anchor);
					if (!$nextAnchor[0]) {
						$nextAnchor = $anchors.first();
					}
					$nextAnchor.click();
					opts.callbacks.next && opts.callbacks.next.call(this);
				});

				opts.openFirst && $anchors.first().click();
			});
		}
	};

	return plugins;
})();