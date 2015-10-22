sv.plugins = (function() {
	'use strict';

	var jGet = sv.utils.jGet;

	var plugins = {
		liveCSS: function(callback) {
			return this.each(function() {
				var proxied = $.proxy(callback, this);

				sv.dom.$window.resize(proxied).load(proxied);
				proxied();
			});
		},
		fitBg: function(options) {

			var opts = $.extend({
				selector: 'img',
				loadResize: true, // нужно?
				watchResize: true
			}, options);

			return this.each(function() {
				var container = $(this),
					$image = container.find(opts.selector),
					image = $image[0],
					imageResize,
					containerHeight,
					containerWidth,
					imageRatio,
					nodeName = image.nodeName.toLowerCase();

				imageResize = function() {
					containerHeight = container.height();
					containerWidth = container.width();

					if (imageRatio > containerWidth / containerHeight) {
						$image.addClass('v-stretch');
						image.style.left = (containerWidth - image.clientWidth) / 2 + 'px';
						image.style.top = 0;
					} else {
						$image.removeClass('v-stretch');
						image.style.top = (containerHeight - image.clientHeight) / 2 + 'px'; // was plain height here
						image.style.left = 0;
					}
				};

				var loadImage = function() {
					imageRatio = image.width / image.height;

					if (opts.loadResize) {
						imageResize();
					}

					$image.addClass('loaded');
				};


				if (nodeName === 'img') {
					image.onload = function() {
						loadImage();
		 			};
					image.onerror = function() {
						console.warn('image %o wasn\'t loaded', this);
					};
		 			image.src = image.src; // opera and IE bug
					if (image.complete) image.onload();
				} else {
					loadImage();
				}

				if (opts.watchResize) {
					sv.dom.$window.resize(imageResize);
				}
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
								opts.onchange && opts.onchange.call(firstEl[0]); // achtung
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

				if (!firstLink) {
					return console.warn('no <a> elements with a hash have been found');
				}

				if (firstLink.protocol + '/' + firstLink.pathname !== location.protocol + '/' + location.pathname) {
					return console.warn('link %o leads to a different page', firstLink);
				}

				var tabExists = function(selector) {
					try {
						$('[href*=' + selector + ']');
					} catch(e) {
						return console.warn('sv.tabs: bad selector %s - %o', selector, e);
					}

					return tabs.find('a[href$=' + selector + ']')[0];
				};

				var showTab = function(id) {

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
					w.onpopstate = function() { // fails on multiple calls FIXME
						console.log('state change detected wtih position %s', w.history.state);
						showTab(location.hash);
						w.scroll(0, w.history.state);
					};
				}


				var stateMethod = opts.pushStateOnTabChange ? 'pushState' : 'replaceState';

				tabs.on('click', 'a[href*=#]', function(e) {
					$this = $(this);
					opts.preventDefault && e.preventDefault();

					if ( $this.hasClass('active') ) return;

					opts.changeHash && w.history[stateMethod](sv.dom.$window.scrollTop(), null, this.hash);

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
				documentEscClose: false, // error prone
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
					return console.warn('svp.popup: container "%s" not found', opts.container.selector || opts.container);
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

				if (opts.documentClickClose) { // capturing events before the popup was ever opened (BUT not for Esc)
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

			if (!this[0]) {
				console.warn('"%s" element not found', this.selector);
				return $();
			}

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
				noQueue: false, // not used
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

				correction: 0, // not used
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
					return console.warn('"%s" slides not found', opts.slide);
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
							$slides.first().addClass('active');
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

						$slides = parent.find(opts.slide);
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
							if ( $this.hasClass(opts.inactiveClass) || $this.hasClass(opts.disabledClass) || moving ) return;
							slider.moveTo('prev');
						});

						$nextCtrl.click(function() {
							$this = $(this);
							if ( $this.hasClass(opts.inactiveClass) || $this.hasClass(opts.disabledClass) || moving ) return;
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
								if (curSlide < nextSlide) {
									outClass = 'out-next';
									inClass = 'in-next';
								} else {
									outClass = 'out-prev';
									inClass = 'in-prev';
								}
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
							opts.onbeforemove && opts.onbeforemove.call(this.element, nextSlide, nextSlideElement);

							var cs = $slides.eq(curSlide),
								ns = $slides.eq(nextSlide);


							cs.removeClass('active').addClass(outClass);

							noTransition(ns, function() {
								ns.addClass(inClass);
							});

							ns.addClass('active').removeClass(inClass);

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
						opts.onbeforemove && opts.onbeforemove.call(this.element, nextSlide, nextSlideElement);
						setTimeout(function() {
							moving = false;
						}, opts.speed);

						moveReel(-this.getNextSlide().position);
						opts.onmove && opts.onmove.call(this.element, nextSlide, nextSlideElement);
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
								if ( $this.hasClass('active') || moving ) return;

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
					nav: !!$navContainer[0],
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
		styleSelect: function(options) {

			var opts = $.extend({
				setIndexes: false,
				selectClass: 'select',
				element: null,
				header: 'header',
				title: 'em',
				list: 'div',
				listItem: 'span',

				hideOnSelect: true,
				onselect: null
			}, options);

			sv.styleSelect = sv.styleSelect || {
				index: 99
			}

			return this.each(function() {

				var select = this,
					$select = $(select),
					$options = $select.find('option'),
					$selectBox,
					$header,
					$title,
					$optionList,
					optionsString = '',
					index,
					$this,
					popup;

				if (opts.element) {
					$selectBox = $select.next(opts.element);
					$header = $selectBox.find(opts.header);
					$title = $selectBox.find(opts.title);
					$optionList = $selectBox.find(opts.list);
				} else {
					$selectBox = $('<div class="' + opts.selectClass + '">');
					$header = $('<header>');
					$title = $('<em>');
					$optionList = $('<div>');
				}

				if (!$options[0]) {
					console.warn('%o has no option elements', this);
					return;
				}

				if (!opts.element) {
					$select.after(
						$selectBox.append(
							$header.append($title)
						).append(
							$optionList
						)
					)
				}

				$options.each(function() {
					optionsString += '<' + opts.listItem + '>' + this.innerHTML + '</' + opts.listItem + '>';
				});
				$optionList.html(optionsString);

				$select.hide();

				popup = $header.svp('popup', {
					container: $optionList,
					onhide: function() {
						$selectBox.removeClass('opened');
					},
					onshow: function() {
						$selectBox.addClass('opened');
					}
				});

				if (opts.setIndexes) {
					$selectBox.css({
						zIndex: sv.styleSelect.index--
					});
				}

				$optionList.on('click', opts.listItem, function(e) {
					$this = $(this);

					if ( $this.hasClass('selected') ) {
						return;
					}

					$this.addClass('selected').siblings().removeClass('selected');
					$title.text(this.innerHTML);
					index = $this.index();
					select.selectedIndex = select[index] ? index : -1;
					$options.eq(index).attr('selected', true).siblings().removeAttr('selected');
					if (opts.hideOnSelect) { // BETA
						popup.hide();
					}
					$select.change();
					opts.onselect && opts.onselect.call(this, popup); // BETA
				});

				index = select.selectedIndex;
				$optionList.find(opts.listItem).eq(index).addClass('selected');
				$title.text(select[index].innerHTML);
			});
		},
		file: function(options) {
			var opts = $.extend({
				input: '.file-input',
				anchor: '.file-anchor',
				name: '.file-name',
				className: 'file-chosen'
			}, options);

			return this.each(function() {

				var $container = $(this),
					$input = $container.find(opts.input),
					$anchor = $container.find(opts.anchor),
					$name = $container.find(opts.name);

				$input.change(function() {
					if (this.files.length) {
						$container.addClass(opts.className);
						$name.html(this.files[0].name);
					} else {
						$container.removeClass(opts.className);
						$name.html('');
					}
				});

				$anchor.click(function() {
					$input.click();
				});
			});
		},
		gallery: function(options) {

			var prefix = options.prefix || '.gallery';

			var opts = $.extend({
				boundingElement: prefix + '-container',
				imageContainer: prefix + '-image',
				prevCtrl: prefix + '-prev',
				nextCtrl: prefix + '-next',
				anchor: prefix + '-anchor',
				addMethod: 'prepend',

				// youtube: true,
				disableClickOnActive: true,
				openFirst: true, // false if overlay opens
				loadingClass: 'loading',
				on: {
					beforeLoad: null,
					load: null,
					prev: null,
					next: null
				}
			}, options);

			var curAnchor = null,
				totalAnchors = null;

			var Gallery = function() {
				this.getTotal = function() {
					return totalAnchors;
				};
				this.getCurrent = function() {
					return curAnchor;
				};
			};

			var gallery = new Gallery;

			this.each(function() {
				var container = $(this),
					$anchors = jGet.call(this, opts.anchor),
					$imageContainer = jGet.call(this, opts.imageContainer),
					$boundingElement = jGet.call(this, opts.boundingElement),
					$prevCtrl = jGet.call(this, opts.prevCtrl),
					$nextCtrl = jGet.call(this, opts.nextCtrl);

				if (!$imageContainer[0]) {
					return console.warn('svp.gallery: image container "%s" not found', opts.imageContainer.selector || opts.imageContainer);
				}

				if (!$boundingElement[0]) {
					return console.warn('svp.gallery: bounding element "%s" not found', opts.boundingElement.selector || opts.boundingElement);
				}

				totalAnchors = $anchors.length;

				if (totalAnchors < 2) {
					$prevCtrl.add($nextCtrl).addClass('disabled');
				}

				container.on('click', opts.anchor, function(e) {
					e.preventDefault();

					var _this = this,
						source = this.href,
						$this = $(this),
						$media;

					if (opts.disableClickOnActive && $this.hasClass('active')) return;

					$anchors.removeClass('active');
					$this.addClass('active');
					curAnchor = $this.index(); // unreliable

					opts.on.beforeLoad && opts.on.beforeLoad.call(_this);

					if (source.match(/youtube|youtu\.be/)) {

						var $iframe = $('<iframe>', {
							src: 'https://www.youtube.com/embed/' + source.substr(source.lastIndexOf('/') + 1),
							frameborder: 0,
							allowfullscreen: true
						}).addClass('gallery-media'); // размеры можно из css передвинуть сюда


						$imageContainer
							.find('.gallery-media').remove().end()
							[opts.addMethod]($iframe)
							opts.on.load && opts.on.load.call(_this);

						$iframe
							.css({
								maxWidth: $boundingElement.width(),
								maxHeight: $boundingElement.height()
							});

						sv.dom.$window
							.off('.gallery')
							.on('resize.gallery', function() {
								$iframe.css({
									maxWidth: $boundingElement.width(),
									maxHeight: $boundingElement.height()
								});
							});

							// add error handler

					} else {

						$imageContainer.addClass(opts.loadingClass);

						var $image = $('<img>');

						$image
							.on({
								load: function() {
									$imageContainer
										.find('.gallery-media').remove().end()
										[opts.addMethod](this)
										.removeClass(opts.loadingClass);

									$image
										.css({
											maxWidth: $boundingElement.width(),
											maxHeight: $boundingElement.height()
										})
										.removeClass('loading');

									sv.dom.$window
										.off('.gallery')
										.on('resize.gallery', function() {
											$image.css({
												maxWidth: $boundingElement.width(),
												maxHeight: $boundingElement.height()
											});
										});

									opts.on.load && opts.on.load.call(_this);
								},
								error: function() {
									$imageContainer
										.removeClass(opts.loadingClass);
									console.error('Error loading %s', source);
								}
							})
							.addClass('gallery-media loading')
							.attr('src', source);
					}

				});

				var $nextAnchor = null;

				$prevCtrl.click(function() {
					$nextAnchor = $anchors.filter('.active').prev(opts.anchor);
					if (!$nextAnchor[0]) {
						$nextAnchor = $anchors.last();
					}
					$nextAnchor.click();
					opts.on.prev && opts.on.prev.call(this);
				});
				$nextCtrl.click(function() {
					$nextAnchor = $anchors.filter('.active').next(opts.anchor);
					if (!$nextAnchor[0]) {
						$nextAnchor = $anchors.first();
					}
					$nextAnchor.click();
					opts.on.next && opts.on.next.call(this);
				});


				sv.dom.$body
					.off('.galleryArrows')
					.on('keydown.galleryArrows', function(e) {
						switch(e.keyCode) {
							case 37:
								$prevCtrl.first().click();
							break;
							case 39:
								$nextCtrl.first().click();
							break;
							default:
						}
					});

				opts.openFirst && $anchors.first().click();
			});

			return gallery;
		},
		onImagesLoad: function(callback) {
			var $this = this,
				$images = $this.find('img'),
				length = $images.length,
				loaded = 0;

			var _increment = function() {
				loaded++;
				console.debug('loaded %d/%d', loaded, length);
				if (loaded === length) {
					callback.call($this);
				}
			};

			$images.each(function() {
				if (this.complete) {
					_increment();
				} else {
					this.addEventListener('load', function() {
						_increment();
					});
				}
			});

			return this;
		}
	};

	return plugins;
})();