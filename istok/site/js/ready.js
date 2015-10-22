$(function() {
	'use strict';

	var initModule = function(module) {
		switch(module) {
			case 'before':
				(function() {

					document.documentElement.setAttribute('data-ready-state', 1);

					if (sv.properties.DEBUG === true || location.search.match(/([&?]|^)debug([&=]|$)/)) {
						console.debug('Debug mode is active!');
						sv.utils.loadJS('js/tests.js');
					}

					delete sv._loadJS;

					sv.dom = {
						$window: $(window),
						$pageWrapper: $('.page-wrapper'),
						$iOverlay: $('.inner-overlay'),
						$header: $('.header'),
						$footer: $('.footer'),
						$content: $('.content'),
						$body: $(document.body)
					};

					sv.utils.compat();
					sv.tools.typography();

					sv.ignoreEventForPin = false;

					$.fn.svp = function() {
						var plugin = Array.prototype.shift.call(arguments);
						if (plugin in sv.plugins) {
							return sv.plugins[plugin].apply(this, arguments);
						} else {
							console.warn('plugin "%s" is not defined', plugin);
						}
					};

					$.fn.trueclick = function(func) {
						return this.each(function() {

							var $this = $(this),
								movedTotal = 0;

							$this.mousedown(function(e) {

								var origin = {
									x: e.pageX,
									y: e.pageY
								};

								sv.dom.$window.on('mouseup.trueclick', function(e) {
									movedTotal = Math.abs(e.pageX - origin.x) + Math.abs(e.pageY - origin.y);
									sv.dom.$window.off('.trueclick');
									if (movedTotal < 5) {
										$this.trigger('trueclick');
									}
								});
							})

							$this.on('trueclick', func);
						});
					};

					$.fn.dataset = function(str1, str2) {
						if (arguments.length === 2) {
							return this.each(function() {
								this.dataset[str1] = str2;
							});
						} else {
							var firstInCollection = this[0];
							if (!firstInCollection) {
								return this;
							}

							if (arguments.length === 1) {
								return firstInCollection.dataset[str1];
							} else {
								return firstInCollection.dataset;
							}
						}
					};

				})();
			break;
			case 'after':
				(function() {

					document.documentElement.setAttribute('data-ready-state', 2);

				})();
			break;
			case 'common':
				(function() {

					$('.fit-bg').svp('fitBg');

					$('.offer-tabs').svp('tabs');

					$('.aside-slider').svp('slider', {
						prefix: '.as',
						// throttle: false,
						mode: 'class'
					});

					$('.inner-slider').svp('slider', {
						prefix: '.is',
						// throttle: false,
						mode: 'class',
						speed: 800
					});

					$('.f-slider').svp('slider', {
						prefix: '.fs',
						slide: '.fs-item',
						mode: 'class',
						loop: true,
						speed: 500
					});

					var $numbers = $('.fpn-number p');

					$('.fpn-tabs').svp('tabs', {
						element: 'li',
						onchange: function() {
							$numbers
								.removeClass('visible')
								.eq( $(this).index() ).addClass('visible');
						}
					});

					var resizeInnerOverlay = function() {
						var headerR = sv.dom.$header[0].getBoundingClientRect(),
							footerR = sv.dom.$footer[0].getBoundingClientRect(),
							docHeight = document.documentElement.clientHeight,
							height = null;

						if (footerR.top > docHeight) {
							height = docHeight - Math.max(headerR.bottom, 0);
						} else {
							height = footerR.top
						}

						if (headerR.bottom > 0 && footerR.top < docHeight) {
							height -= headerR.bottom
						}

						sv.dom.$iOverlay.css({
							top: headerR.bottom < 0 ? sv.dom.$pageWrapper.scrollTop() : 75,
							height: height
						});
					};

					sv.dom.$iOverlay.svp('liveCSS', function() {
						resizeInnerOverlay();
					});

					sv.dom.$pageWrapper.scroll(function() {
						resizeInnerOverlay();
					});


					var $submenuBg = $('.h-submenu');

					$('.h-nav')
						.on('mouseenter', '.has-nested', function() {
							$submenuBg.addClass('visible');
						})
						.on('mouseleave', '.has-nested', function() {
							$submenuBg.removeClass('visible');
						});


					$('.hn-cell > a > span').each(function() {
						if (this.clientHeight > 30) {
							sv.dom.$body.addClass('multi-lined-menu');
							return;
						}
					});


					$('.fullscreen').svp('liveCSS', function() {
						this.style.height = document.documentElement.clientHeight - sv.dom.$header.height() - sv.dom.$footer.height() + 'px';
					});

					$('.pin')
						.on('mouseenter', function() {
							if (sv.ignoreEventForPin) {
								return;
							}
							var $this = $(this),
								$cropper = $this.find('.p-text-cropper'),
								$text = $this.find('.p-text');

							$cropper.width( $text.innerWidth() );
						})
						.on('mouseleave', function() {
							if (sv.ignoreEventForPin) { // пока не обязательно
								return;
							}
							 $(this).find('.p-text-cropper').width('');
						});

					$('.ic-more').svp('popup', {
						container: $('.map-more'),
						hideEl: $('.mm-close')
					});

					var checkValidity = function() {
						var	$form = $(this),
							isValid = true,
							firstFocused = false,
							$fields = $form.find('[required]'),
							$validateFill = $fields.filter('[type=tel], [type=text], [type=email], [type=password], [type=search], textarea'),
							$validateEmail = $fields.filter('[type=email]'),
							emailPattern = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/);

						var markInvalid = function() {
							var $input = $(this);
							$input.addClass('invalid');
							isValid = false;
							if (!firstFocused) {
								$input.focus();
								firstFocused = true;
							}
						};

						$form.find('.invalid').removeClass('invalid');

						$validateFill.each(function() {
							if (!$.trim(this.value)) {
								markInvalid.call(this);
							}
						});

						$validateEmail.each(function() {
							if (!this.value.match(emailPattern)) {
								markInvalid.call(this);
							}
						});

						return isValid;
					};

					$('.validate')
						.each(function() {
							this.noValidate = true;

							$(this).find('[required]').on('input', function() {
								$(this).removeClass('invalid');
							});
						})
						.submit(function(e) {

							if (checkValidity.call(this)) {

							} else {
								e.preventDefault();
							}

						});


					var $minimap = $('.minimap'),
						$paths = $minimap.find('path');

					sv.highlight = function(id) {
						$paths.each(function() {
							this.classList.remove('highlighted');
						});

						var path = $paths.filter(id)[0];

						if (path) {
							path.classList.add('highlighted');
						}
					};

					var langStr = sv.dom.$body.attr('data-lang');

					switch(langStr) {
						case 'ru':
							sv.properties.LANG = 'ru';
						break;
						case 'en':
							sv.properties.LANG = 'en';
						break;
						default:
							sv.properties.LANG = 'en';
					}

				})();
			break;
			case 'gallery':
				(function() {

					var $galleryOverlay = sv.dom.$body.svp('popup', {
						container: '.inner-overlay',
						directHideEl: '.inner-overlay',
						hideEl: '.g-close',
						ignoreFrom: 'a',
						showOnClick: false,
						documentEscClose: true
					});

					var $gTitle = $('.gallery-title'),
						$gText = $('.gallery-text'),
						$gContainer = $('.gallery-container'),
						callerSlider = {
							moveTo: $.noop
						};

					$('.gallery').svp('gallery', {
						prefix: '.gallery',
						imageContainer: $('.gallery-image'),
						prevCtrl: $('.gallery-prev'),
						nextCtrl: $('.gallery-next'),
						disableClickOnActive: false,
						openFirst: false,
						callbacks: {
							beforeLoad: function() {
								$galleryOverlay.show();

								var $this = $(this),
									title = $this.attr('data-gallery-title'),
									text = $this.attr('data-gallery-text');

								if (title) {
									$gTitle.html(title);
									$gContainer.removeClass('no-title');
								} else {
									$gTitle.html(null);
									$gContainer.addClass('no-title');
								}

								if (text) {
									$gText.html(text);
									$gContainer.removeClass('no-text');
								} else {
									$gText.html(null);
									$gContainer.addClass('no-text');
								}

								var curSlider = $('.inner-slider')[0] || $('.aside-slider')[0];

								if (curSlider) {
									try {
										callerSlider = sv.sliders['.' + curSlider.className.match(/\S+-slider/)[0]];
									} catch(e) {
										console.warn('failed to find caller slide', e);
									}
								} else {
									console.info('caller slider wasn\'t found');
								}
							},
							prev: function() {
								callerSlider.moveTo('prev');
							},
							next: function() {
								callerSlider.moveTo('next');
							}
						}
					});

				})();
			break;
			case 'map':
				(function() {

					sv.Map = function(options) {

						var opts = $.extend({
							startPosition: {
								x: 0.5,
								y: 0.5
							},
							$dragElement: $('.map-drag-element'),
							oninit: null
						}, options);

						var $mapContainer = $('.map-container'),
							$map = $('.map'),
							map = $map[0],
							$mapImage = $('.map-image'),
							$dragElement = opts.$dragElement,
							mapImage = $mapImage[0],
							containerHeight,
							containerWidth,
							maxScrollX,
							maxScrollY,
							startPosition = opts.startPosition,
							offset,
							startingPoint,
							eventStartingPoint,
							curZoom = null,
							top,
							left,
							_this = this;

						var getOffset = {
							left: function(position) {
								return (containerWidth - mapImage.width) * (position || 0);
							},
							top: function(position) {
								return (containerHeight - mapImage.height) * (position || 0);
							}
						};

						this.getZoom = function() {
							return curZoom;
						};

						this.zoom = function(zoom, opts) {

							// console.time('zoomed in:');
							opts = $.extend({
								animation: 800,
								center: startPosition
							}, opts);

							var size;

							startPosition = opts.center;

							switch(zoom) {
								case 'fit':
									$mapImage.finish();
									if (mapImage.width / mapImage.height > containerWidth / containerHeight) {
										size = {
											width: containerHeight * (mapImage.naturalWidth / mapImage.naturalHeight),
											height: containerHeight
										};
									} else {
										size = {
											width: containerWidth,
											height: containerWidth / (mapImage.naturalWidth / mapImage.naturalHeight)
										};
									}

									if (opts.animation) {
										$mapImage.animate(size, {
											progress: this.move,
											duration: opts.animation
										});
									} else {
										$mapImage.css(size);
										this.move();
									}
									curZoom = mapImage.width / mapImage.naturalWidth;
								break;
								default:
									var level = parseFloat(zoom);

									if ($.isNumeric(level)) {

										size = {
											width: mapImage.naturalWidth * level,
											height: mapImage.naturalHeight * level
										};

										if (opts.animation) {
											$mapImage
												.finish()
												.animate(size, {
													progress: this.move,
													duration: opts.animation
												});
										} else {
											$mapImage.css(size);
											this.move();
										}
										curZoom = level;

									} else {
										console.warn('bad argument');
									}
							}
							// console.timeEnd('zoomed in:');
						};

						this.move = function() {
							offset = {
								x: getOffset.left(startPosition.x),
								y: getOffset.top(startPosition.y)
							};
							map.style.left = offset.x + 'px';
							map.style.top = offset.y + 'px';

							maxScrollX = containerWidth - mapImage.width;
							maxScrollY = containerHeight - mapImage.height;

							$mapContainer
								.addClass('h-stretched v-stretched')
								.toggleClass('scrollable-up', offset.y !== 0)
								.toggleClass('scrollable-right', offset.x !== maxScrollX)
								.toggleClass('scrollable-down', offset.y !== maxScrollY)
								.toggleClass('scrollable-left', offset.x !== 0)
						};


						this.init = function() {
							containerHeight = $mapContainer.height();
							containerWidth = $mapContainer.width();
							_this.zoom('fit', {
								animation: 0
							});
							// mapImage.style.width = 4000 + 'px';
							// mapImage.style.height = 1600 + 'px';
							$map.addClass('loaded');
							opts.oninit && opts.oninit();
						};

						this.reinit = function() {
							containerHeight = $mapContainer.height();
							containerWidth = $mapContainer.width();

							_this.zoom('fit', {
								animation: 0
							});
						};

						$dragElement.on({
							mousedown: function(e) {
								if (e.button !== 0) {
									return;
								}
								e.preventDefault();
								startingPoint = {
									x: parseInt(map.style.left, 10),
									y: parseInt(map.style.top, 10)
								};

								eventStartingPoint = {
									x: e.pageX,
									y: e.pageY
								};

								$mapContainer.addClass('drag');

								sv.dom.$window
									.on('mousemove.move', function(e) {
										sv.ignoreEventForPin = true;
										left = startingPoint.x + (e.pageX - eventStartingPoint.x);

										if (left > 0) {
											left = 0;
										} else if (left < maxScrollX) {
											left = maxScrollX;
										}
										map.style.left = left + 'px';

										top = startingPoint.y + (e.pageY - eventStartingPoint.y);

										if (top > 0) {
											top = 0;
										} else if (top < maxScrollY) {
											top = maxScrollY;
										}
										map.style.top = top + 'px';

										$mapContainer
											.toggleClass('scrollable-up', top !== 0)
											.toggleClass('scrollable-right', left !== maxScrollX)
											.toggleClass('scrollable-down', top !== maxScrollY)
											.toggleClass('scrollable-left', left !== 0);

										startPosition = {
											x: maxScrollX === 0 ? 0.5 : left / maxScrollX,
											y: maxScrollY === 0 ? 0.5 : top / maxScrollY
										};
									})
									.on('mouseup.move', function() {
										sv.ignoreEventForPin = false;
										sv.dom.$window.off('.move');
										$mapContainer.removeClass('drag');
									});
							}
						});

						sv.mapInstance = this;

						if (mapImage.complete) {
							this.init();
						} else {
							$mapImage.load(this.init);
						}

						sv.dom.$window.resize(this.reinit);

						if (sv.properties.DEBUG) {
							$map.click(function(e) {
								console.log( 'left: ' + (-(parseInt($map.css('left')) - e.pageX) / mapImage.width * 100).toFixed(2) + '%; top: ' +  (-(parseInt($map.css('top')) - e.pageY + 75) / mapImage.height * 100).toFixed(2) + '%;' );
							});							
						}
					};

				})();
			break;
			case 'other-map':
				(function() {

					new sv.Map;

				})();
			break;
			case 'ecology':
				(function() {

					var $clipper = $('.me-clipper'),
						clipper = $clipper[0],
						beforeMap = $('.me-before')[0],
						afterMap = $('.me-after')[0],
						$beforeEls = $('.met-before, .mes-before'),
						$afterEls = $('.met-after, .mes-after'),
						$ecologyMap = $('.map-ecology'),
						$meContainer = $('.me-container');

					var minPos,
						maxPos,
						cropPos,
						lastPos,
						lastPosChanged = 0,
						left;

					var _init = function() {
						minPos = $meContainer[0].getBoundingClientRect().left;
						maxPos = $meContainer[0].getBoundingClientRect().right;
					};

					var offset = beforeMap.getBoundingClientRect().left;

					var _handle = function(x) {
						lastPos = x;
						if (x < minPos) {
							cropPos = minPos;
						} else if (x > maxPos) {
							cropPos = maxPos;
						} else {
							cropPos = x;
						}

						if (x < minPos - 40) {
							left = minPos - 40;
						} else if (x > maxPos + 40) {
							left = maxPos + 40;
						} else {
							left = x;
						}

						clipper.style.left = left - minPos + 'px';

						var clipAmount = cropPos - offset;

						beforeMap.style.clip = 'rect(0, ' + clipAmount + 'px, 654px, 0)';
						afterMap.style.clip = 'rect(0, 990px, 654px, ' + clipAmount + 'px)';
					};

					$clipper.on({
						mousedown: function(e) {
							if (e.button !== 0) {
								return;
							}
							e.preventDefault();

							var startingPoint = e.pageX;

							$clipper.addClass('drag');

							sv.dom.$window
								.on('mousemove.clipper-move', function(e) {
									sv.ignoreEventForPin = true;
									if (e.pageX >= lastPos) {
										lastPosChanged++;
									} else {
										lastPosChanged--;
									}

									if (lastPosChanged === 5) {
										lastPosChanged = 0;
										$ecologyMap
											.removeClass('after')
											.addClass('before');
									} else if (lastPosChanged === -5) {
										lastPosChanged = 0;
										$ecologyMap
											.removeClass('before')
											.addClass('after');
									}

									_handle(e.pageX);
								})
								.on('mouseup.clipper-move', function() {
									sv.ignoreEventForPin = false;
									sv.dom.$window.off('.clipper-move');
									$clipper.removeClass('drag');
								});
						}
					});


					_init();
					_handle(offset + beforeMap.clientWidth / 2);

					sv.dom.$window.svp('liveCSS', function() {
						_init();
						_handle(lastPos);
					});

					$ecologyMap.addClass('before after');

				})();
			break;
			case 'infrastructure':
				(function() {

					var $container = $('.if-container'),
						$filters = $('.if-item'),
						$pins = $('.pin'),
						$controls = $('.if-prev, .if-next');

					$container.svp('liveCSS', function() {
						if (this.scrollHeight > this.clientHeight) {
							$controls.removeClass('hidden');
						} else {
							$controls.addClass('hidden');
						}
					});

					$filters
						.on('click', function() {
							$(this).toggleClass('active');

							var position = this.offsetTop,
								height = this.clientHeight,
								scroll = $container.prop('scrollTop'),
								containerHeight = $container.prop('clientHeight'),
								scrollAmount;

							if (position < scroll) {
								scrollAmount = position;
							} else if (position + height > scroll + containerHeight) {
								scrollAmount = position + height - containerHeight;
							}

							$container.animate({
								scrollTop: scrollAmount
							}, 150);


							var filters = [];

							$filters.each(function() {
								if ($(this).hasClass('active')) {
									filters.push(this.getAttribute('data-pin-type'));
								}
							});

							if (filters.length) {
								$pins
									.addClass('hidden')
									.each(function() {
										if (~filters.indexOf(this.getAttribute('data-pin-type'))) {
											$(this).removeClass('hidden');
										}
									});
							} else {
								$pins.removeClass('hidden');
							}
						})
						.on('mouseenter', function() {
							var $this = $(this),
								$cropper = $this.find('.if-text'),
								$text = $cropper.find('span');

							$cropper.width($text.width() + 15);
						})
						.on('mouseleave', function() {
							 $(this).find('.if-text').width('');
						});


					$('.if-prev').click(function() {
						var index = Math.ceil(($container.prop('scrollTop') + 1) / 61) - 1;
						$container.animate({
							scrollTop: index * 61 - 1
						}, 150);
					});

					$('.if-next').click(function() {
						var index = Math.ceil(($container.prop('scrollTop') + $container.prop('clientHeight') + 1) / 61);
						$container.animate({
							scrollTop: index * 61 - $container.prop('clientHeight')
						}, 150);
					});

					var zoomed = false,
						$map = $('.map'),
						$backButton = $('.map-back'),
						map = new sv.Map;

					$('.infrastructure-center-label').trueclick(function() {
						if (!zoomed) {
							map.zoom(1, {
								center: {
									x: 0.5,
									y: 0.5
								}
							});
							$map.addClass('zoomed');
							$backButton.addClass('visible');
							zoomed = true;
						}
					});

					$backButton.trueclick(function() {
						if (zoomed) {
							map.zoom('fit');
							$map.removeClass('zoomed');
							$backButton.removeClass('visible');
							zoomed = false;
						}
					});

				})();
			break;
			case 'structure':
				(function() {

					var zoomed = false,
						$map = $('.map'),
						$backButton = $('.map-back'),
						map = new sv.Map;

					$('.zoom-trigger').trueclick(function() {
						if (!zoomed) {
							map.zoom(1, {
								center: {
									x: 0.6,
									y: 0.43
								}
							});
							$map.addClass('zoomed');
							$backButton.addClass('visible');
							zoomed = true;
							$triggers.trigger('mouseleave'); // refreshing mouse movements
							sv.highlight('#mm-5');
						}
					});

					$backButton.trueclick(function() {
						if (zoomed) {
							map.zoom('fit');
							$map.removeClass('zoomed');
							$backButton.removeClass('visible');
							zoomed = false;
							sv.highlight(null);
						}
					});

					var $triggers = $('[data-trigger-path]'),
						$pathsToTrigger = $('[data-path-id]'),
						classMethod,
						pinClassMethod,
						pinEvent;

					var _handle = function() {
						var path = this.getAttribute('data-trigger-path');

						$pathsToTrigger
							.filter('[data-path-id=' + path + ']')[0].classList[classMethod]('visible');

						var $thisPathPin = $triggers.filter('.pin[data-trigger-path=' + path + ']').not(this);

						if ($thisPathPin[0]) {
							$thisPathPin
								[pinClassMethod]('hover')
								.trigger(pinEvent)
								.find('.p-container')[pinClassMethod]('hover');
						}
					};

					$triggers
						.on('mouseenter', function() {
							classMethod = 'add';
							pinClassMethod = 'addClass';
							pinEvent = 'mouseenter';
							_handle.call(this);
						})
						.on('mouseleave', function() {
							classMethod = 'remove';
							pinClassMethod = 'removeClass';
							pinEvent = 'mouseleave';
							_handle.call(this);
						})
						.trueclick(function() {
							var $thisPathPin = $triggers.filter('.pin[data-trigger-path=' + this.getAttribute('data-trigger-path') + ']').not(this);

							if ($thisPathPin[0]) {
								$thisPathPin[0].click();
							}
						});

				})();
			break;
			case 'structure-item':
				(function() {

					var $imageContainer = $('.structure-image');

					$('.structure-container').svp('gallery', {
						imageContainer: $('.structure-image'),
						callbacks: {
							load: function() {
								$imageContainer.append('<img src="' + this.href + '">').svp('fitBg', {
									imageSelector: 'img:last'
								});
								var otherImages = $imageContainer.find('img:not(:last)');
								otherImages.addClass('disabled');

								setTimeout(function() {
									otherImages.remove();
								}, 0);
								$imageContainer.svp('fitBg', {
									// mode: 'fill'
								});
							}
						}
					});

					var $leftShadow = $('.so-left'),
						$rightShadow = $('.so-right'),
						$sOverlay = $('.structure-overlay');

					var drawShadows = function() {
						var excessPx = document.documentElement.clientWidth - $sOverlay.width(),
							width;

						if (excessPx > 0) {
							width = excessPx / 2;
						} else {
							width = 0;
						}

						$leftShadow.add($rightShadow).css({
							width: width
						});
					};

					sv.dom.$window.svp('liveCSS', function() {
						drawShadows();
					});

					var dId = sv.dom.$body.attr('data-district-id');

					if (dId) {
						sv.highlight('#mm-' + dId);
					}

					// 1. left
					(function() {

						var _$reel = $('.structure-info'),
							_$slides = $('.ics-item'),
							_slidesLength = _$slides.length,
							curSlide = 0;

						var _move = function(index) {
							if (index === 'next') {

								if (curSlide + 1 === _slidesLength) {
									index = 0;
								} else {
									index = curSlide + 1;
								}

							} else if (index === 'prev') {

								if (curSlide === 0) {
									index = _slidesLength - 1;
								} else {
									index = curSlide - 1;
								}
							}
							var $targetSlide = _$slides.eq(index);
							curSlide = index;

							$targetSlide
								.addClass('visible')
								.siblings().removeClass('visible');

						};

						if (_$reel[0]) {
							_move(0);
						}

						setInterval(function() {
							_move('next');
						}, 5000);

					})();


					// 2. right
					(function() {

						var _$reel = $('.structure-reel'),
							_$slides = _$reel.find('.sc-item'),
							_$prev = $('.ss-prev'),
							_$next = $('.ss-next'),
							_slidesLength = _$slides.length,
							_viewport = 4,
							curSlide = 0;

						if (_slidesLength > _viewport) {
							_$prev.add(_$next).removeClass('disabled');
						} else {
							return;
						}

						var _move = function(index) {
							if (index === 'next') {

								if (curSlide + 1 === _slidesLength - _viewport + 1) {
									return;
								} else {
									index = curSlide + 1;
								}

							} else if (index === 'prev') {

								if (curSlide === 0) {
									return;
								} else {
									index = curSlide - 1;
								}
							}
							var $targetSlide = _$slides.eq(index);
							curSlide = index;

							_$prev.toggleClass('inactive', index <= 0);
							_$next.toggleClass('inactive', index >= _slidesLength - _viewport);

							$targetSlide
								.addClass('visible')
								.siblings().removeClass('visible');

							_$reel.css({
								top: -$targetSlide.position().top
							});
						};

						if (_$reel[0]) {
							_move(0);
						}

						_$prev.click(function() {
							_move('prev');
						});

						_$next.click(function() {
							_move('next');
						});

					})();

				})();
			break;
			case 'traffic':
				(function() {

					var $zoomLevelEl = $('.mzi-number');

					var updateZoomLevel = function(zoom, useSetNumber) {
						if (useSetNumber === true) {
							$zoomLevelEl.svp('setNumber', Math.round(zoom * 100));
						} else {
							$zoomLevelEl.html( Math.round(zoom * 100) );
						}
					};

					var nextZoom,
						offset = $('.mz-range').offset().top,
						height = $('.mz-range').height(),
						level = $('.mz-level'),
						maxZoom = null,
						minZoom = null,
						availZoomRange = null;

					var updateMap = function(useSetNumber) {

						level.css({
							top: Math.round((nextZoom - zoom) / availZoomRange * 100) + '%'
						});

						updateZoomLevel(nextZoom, useSetNumber);

						map.zoom(nextZoom, {
							animation: 200
						});
					};


					var $filters = $('.if-item'),
						$routes = $('.route'),
						zoom = null,
						map = new sv.Map({
							startPosition: {
								x: 1,
								y: 0.5
							},
							oninit: function() {

								maxZoom = 1;
								minZoom = sv.mapInstance.getZoom(); // FIXME
								availZoomRange = maxZoom - minZoom;

								zoom = minZoom;
								updateZoomLevel(zoom, true);


								$('.mz-in').click(function() {
									nextZoom = map.getZoom() + (availZoomRange / 3);

									if (nextZoom > maxZoom) {
										nextZoom = maxZoom;
									}
									updateMap(true);
								});

								$('.mz-out').click(function() {
									nextZoom = map.getZoom() - (availZoomRange / 3);

									if (nextZoom < minZoom) {
										nextZoom = minZoom;
									}
									updateMap(true);
								});


								var handle = function(pageY) {

									var y = pageY - offset + sv.dom.$pageWrapper.scrollTop();

									if (y < 0) {
										y = 0;
									} else if (y > height) {
										y = height;
									}

									var p = y / height;

									map.zoom(zoom + availZoomRange * p, {
										animation: 0
									});

									level.css({
										top: p * 100 + '%'
									});

									updateZoomLevel(zoom + availZoomRange * p);
								};

								$('.mz-range').mousedown(function(e) {
									if (e.button !== 0) {
										return;
									}
									e.preventDefault();

									handle(e.pageY);
									level.addClass('no-transition');

									sv.dom.$window.on('mousemove.zoomrange', function(e) {
										handle(e.pageY);
									});

									sv.dom.$window.on('mouseup.zoomrange', function() {
										sv.dom.$window.off('.zoomrange');
										level.removeClass('no-transition');
									});
								});
							}
						});

					$filters
						.on('click', function() {
							$(this).toggleClass('active');

							var filters = [];

							$filters.each(function() {
								if ($(this).hasClass('active')) {
									filters.push(this.getAttribute('data-route-type'));
								}
							});

							if (filters.length) {
								$routes
									.addClass('hidden')
									.each(function() {
										if (~filters.indexOf(this.getAttribute('data-route-type'))) {
											$(this).removeClass('hidden');
										}
									});
							} else {
								$routes.removeClass('hidden');
							}
						})
						.on('mouseenter', function() {
							var $this = $(this),
								$cropper = $this.find('.if-text'),
								$text = $cropper.find('span');

							$cropper.width($text.width() + 15);
						})
						.on('mouseleave', function() {
							 $(this).find('.if-text').width('');
						});

				})();
			break;
			case 'roads':
				(function() {

					var $zoomLevelEl = $('.mzi-number');

					var updateZoomLevel = function(zoom, useSetNumber) {
						if (useSetNumber === true) {
							$zoomLevelEl.svp('setNumber', Math.round(zoom * 100));
						} else {
							$zoomLevelEl.html( Math.round(zoom * 100) );
						}
					};

					var nextZoom,
						offset = $('.mz-range').offset().top,
						height = $('.mz-range').height(),
						level = $('.mz-level'),
						maxZoom = null,
						minZoom = null,
						availZoomRange = null;

					var updateMap = function(useSetNumber) {

						level.css({
							top: Math.round((nextZoom - zoom) / availZoomRange * 100) + '%'
						});

						updateZoomLevel(nextZoom, useSetNumber);

						map.zoom(nextZoom, {
							animation: 200
						});
					};

					var $filters = $('.if-item'),
						$routes = $('.route'),
						zoom = null,
						map = new sv.Map({
							startPosition: {
								x: 1,
								y: 0.5
							},
							oninit: function() {

								maxZoom = 1;
								minZoom = sv.mapInstance.getZoom(); // FIXME
								availZoomRange = maxZoom - minZoom;

								zoom = minZoom;
								updateZoomLevel(zoom, true);


								$('.mz-in').click(function() {
									nextZoom = map.getZoom() + (availZoomRange / 3);

									if (nextZoom > maxZoom) {
										nextZoom = maxZoom;
									}
									updateMap(true);
								});

								$('.mz-out').click(function() {
									nextZoom = map.getZoom() - (availZoomRange / 3);

									if (nextZoom < minZoom) {
										nextZoom = minZoom;
									}
									updateMap(true);
								});


								var handle = function(pageY) {

									var y = pageY - offset + sv.dom.$pageWrapper.scrollTop();

									if (y < 0) {
										y = 0;
									} else if (y > height) {
										y = height;
									}

									var p = y / height;

									map.zoom(zoom + availZoomRange * p, {
										animation: 0
									});

									level.css({
										top: p * 100 + '%'
									});

									updateZoomLevel(zoom + availZoomRange * p);
								};

								$('.mz-range').mousedown(function(e) {
									if (e.button !== 0) {
										return;
									}
									e.preventDefault();

									handle(e.pageY);
									level.addClass('no-transition');

									sv.dom.$window.on('mousemove.zoomrange', function(e) {
										handle(e.pageY);
									});

									sv.dom.$window.on('mouseup.zoomrange', function() {
										sv.dom.$window.off('.zoomrange');
										level.removeClass('no-transition');
									});
								});
							}
						});


					$('.mn-close, .map-nested').trueclick(function() {
						sv.dom.$body.removeClass('roads-overlay-visible');
					});


					var $legend = $('.map-legend'),
						$lInner = $('.ml-inner'),
						$lContainer = $('.ml-container');

					$('.ml-toggle')
						.click(function() {
							$legend.toggleClass('hidden');
						})
						.svp('liveCSS', function() {
							var h1 = $lInner.position().top + $lInner.height(),
								h2 = $lContainer.position().top + $lContainer.outerHeight(),
								bottom;

							if (h1 > h2) {
								bottom = $legend.height() - 43 - h2;
							} else {
								bottom = $legend.height() - 23 - h1;
							}
							this.style.bottom = bottom + 'px';
						});

				})();
			break;
			case 'contacts':
				(function() {

					$('.mc-tabs').svp('tabs', {
						containers: '.mc-tab'
					});

					var map,
						markers = [],
						yCoord = null;

					if (sv.properties.LANG === 'en') {
						yCoord = 609;
					} else {
						yCoord = 897;
					}

					sv.initMap = function() {
						var $contactsMap = $('.contacts-map-container'),
							icons = [{
								anchor: new google.maps.Point(51, 110),
								url: sv.properties.spriteURL,
								origin: new google.maps.Point(0, yCoord),
								size: new google.maps.Size(103, 128)
							}, {
								anchor: new google.maps.Point(51, 110),
								url: sv.properties.spriteURL,
								origin: new google.maps.Point(104, yCoord),
								size: new google.maps.Size(103, 128)
							}],
							addresses = [
								[55.785181,37.558712,18,0],
								[56.816047,60.621289,17,1]
							];

						map = new google.maps.Map($contactsMap[0], {
							zoom: 4,
							minZoom: 3,
							center: new google.maps.LatLng(58.053594, 32.086032),
							mapTypeId: google.maps.MapTypeId.ROADMAP,
							panControl: false,
							zoomControlOptions: {
								style: google.maps.ZoomControlStyle.SMALL,
							    position: google.maps.ControlPosition.RIGHT_TOP
							},
							scrollwheel: false,
							streetViewControl: true,
							streetViewControlOptions: {
							    position: google.maps.ControlPosition.RIGHT_TOP
							},
							styles: [{"featureType": "administrative", "elementType": "all", "stylers": [{"visibility": "on"} ] }, {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{"color": "#d6ebf7"} ] }, {"featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{"color": "#bbd0dc"} ] }, {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{"color": "#ebf7ff"} ] }, {"featureType": "poi", "elementType": "geometry.fill", "stylers": [{"color": "#ebf7ff"} ] }, {"featureType": "road", "elementType": "geometry.fill", "stylers": [{"color": "#ffffff"} ] }, {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"color": "#cbe0ec"} ] }, {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"color": "#b3c8d4"} ] } ]
						});

						addresses.forEach(function(el) {
							var m = new google.maps.Marker({
								position: new google.maps.LatLng(el[0], el[1]),
								map: map,
								// cursor: 'default',
								icon: icons[el[3]]
							});
							m.zoom = el[2];
							markers.push(m);
							google.maps.event.addListener(m, 'click', function() {
								map.panTo(m.getPosition());
								map.setZoom(m.zoom);
							});
						});

						delete sv.initMap;
					};

					sv.utils.loadJS('https://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=sv.initMap');

					var $mapContacts = $('.map-contacts');

					$('.mail-us').click(function() {
						$mapContacts.addClass('show-form');
					});

					$('.mc-hide').click(function() {
						$mapContacts.removeClass('show-form');
					});

					$('.cm-bookmark').click(function() {
						map.panTo(markers[this.getAttribute('data-address')].getPosition());
						map.setZoom(markers[this.getAttribute('data-address')].zoom);
					});

				})();
			break;
			case 'location':
				(function() {

					new sv.Map;

				})();
			break;
			case 'economy':
				(function() {

					$('.ecf-notes > div').each(function() {

						var $this = $(this),
							p = $this.find('p')[0],
							mark = $this.find('mark')[0],
							span = $this.find('span')[0];

						if (p.clientWidth === 0) {
							console.warn('%o is hidden!', p);
						}

						mark.style.width = span.offsetLeft - p.offsetLeft - p.clientWidth - 10 + 'px';

					});

					var $ecItems = $('.ec-item');

					$('.ec-tabs').svp('tabs', {
						element: 'li',
						onchange: function() {
							$ecItems
								.removeClass('active')
								.filter('[data-type=' + this.getAttribute('data-type') + ']').addClass('active');
						}
					});


					var $reel = $('.ec-reel'),
						$slides = $reel.find('section'),
						$prev = $('.ec-prev'),
						$next = $('.ec-next'),
						slidesLength = $slides.length,
						curSlide = 0;

					var onmove = function(index) {
						var $frames = $('.eq-' + index);

						$frames
							.addClass('visible')
							.siblings().removeClass('visible');
					};

					var move = function(index) {
						if (index === 'next') {

							if (curSlide + 1 === slidesLength) {
								return;
							} else {
								index = curSlide + 1;
							}

						} else if (index === 'prev') {

							if (curSlide === 0) {
								return;
							} else {
								index = curSlide - 1;
							}
						}
						var $targetSlide = $slides.eq(index);
						curSlide = index;

						$prev.toggleClass('inactive', index <= 0);
						$next.toggleClass('inactive', index >= slidesLength - 1);

						$targetSlide
							.addClass('visible')
							.siblings().removeClass('visible');

						$reel.css({
							left: -$targetSlide.position().left
						});
						onmove(index);
					};

					if ($reel[0]) {
						move(0);
					}

					$slides.click(function() {
						move( $(this).index() );
					});

					$prev.click(function() {
						move('prev');
					});

					$next.click(function() {
						move('next');
					});

				})();
			break;
			case 'index':
				(function() {

					$('.ic-stats').svp('slider', {
						prefix: '.ics',
						slide: '.ics-item',
						mode: 'class',
						loop: true,
						speed: 800,
						autoTimer: 5000
					});

					sv.utils.loadJS('js/libs/jquery.parallax.min.js', function() {
						$('.index-parallax').parallax({
							scalarX: 3,
							scalarY: 7,
							frictionY: 0.05,
							frictionX: 0.05
						});
					});

					var maxZoom,
						minZoom,
						availZoomRange,
						clouds = $('.map-clouds')[0];

					var map = new sv.Map({
						startPosition: {
							x: 0.5,
							y: 0
						},
						oninit: function() {
							maxZoom = 1;
							minZoom = sv.mapInstance.getZoom(); // FIXME
							availZoomRange = maxZoom - minZoom;

							sv.proxiedZoom = function(number, opts) {
								console.log(opts)
								map.zoom(minZoom + number * availZoomRange, opts);
							};

							var $triggers = $('[data-trigger-path]'),
								$pathsToTrigger = $('[data-path-id]'),
								className,
								classMethod;

							var _handle = function() {
								var path = this.getAttribute('data-trigger-path');

								$pathsToTrigger
									.filter('[data-path-id=' + path + ']')[0].classList[classMethod](className);
							};

							var deselectAll = function() {
								$triggers.not(this).each(function() {
									this.classList.remove('highlighted');
									classMethod = 'remove';
									className = 'bright-visible';
									_handle.call(this);
								});
							};

							$triggers
								.on('mouseenter', function() {
									classMethod = 'add';
									className = 'visible';
									_handle.call(this);
								})
								.on('mouseleave', function() {
									classMethod = 'remove';
									className = 'visible';
									_handle.call(this);
								})
								.trueclick(function() {
									if (this.classList.contains('highlighted')) {
										classMethod = 'remove';
										this.classList.remove('highlighted');
										map.zoom('fit', {
											center: {
												x: 0.5,
												y: 0
											}
										});
										clouds.style.transform = 'scale(1)';
										clouds.style.transformOrigin = '50% 0';
										sv.dom.$body.removeClass('map-zoomed');
									} else {
										deselectAll.call(this);
										classMethod = 'add';
										this.classList.add('highlighted');

										var pointArr = this.getAttribute('data-map-point').trim().split(/\s*,\s*/);
										sv.proxiedZoom(parseFloat(this.getAttribute('data-map-zoom')), {
											center: {
												x: parseFloat(pointArr[0]),
												y: parseFloat(pointArr[1])
											}
										});
										clouds.style.transform = 'scale(' + (1 + parseFloat(this.getAttribute('data-map-zoom'))) + ')';
										clouds.style.transformOrigin = (parseFloat(pointArr[0]) * 100) + '% ' + (parseFloat(pointArr[1]) * 100) + '%';
										sv.dom.$body.addClass('map-zoomed');
									}
									className = 'bright-visible';
									_handle.call(this);
								});
						}
					});


				})();
			break;
			default:
				console.warn('no init block for page id "%s"', page);
		}
	};

	var pageModules = document.documentElement.getAttribute('data-modules'),
		ids;

	if (pageModules === null) {
		console.info('no module definition found');
		document.documentElement.setAttribute('data-modules', '');
		ids = ['before', 'common', 'after'];
	} else if (pageModules.trim() === '') {
		console.info('no modules defined');
		ids = ['before', 'common', 'after'];
	} else {
		ids = ['before', 'common'].concat(pageModules.split(' '));
		ids.push('after');
	}

	ids.forEach(function(el) {
		initModule(el);
	});
});