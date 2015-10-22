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
						$body: $(document.body),
						$window: $(window),
						$pageWrapper: $('.page-wrapper'),
						$scrollableContent: $('.page-content')
					};

					sv.utils.compat();
					sv.tools.typography();
					sv.tools.enhance();

					if (sv.properties.lte600 /*|| 1*/) {
						$(document.head).append('<meta name="viewport" content="width=device-width, user-scalable=no">');
						// sv.properties.lte600 = true;
					}

					$.fn.svp = function() {
						var plugin = Array.prototype.shift.call(arguments);
						if (plugin in sv.plugins) {
							return sv.plugins[plugin].apply(this, arguments);
						} else {
							console.warn('plugin "%s" is not defined', plugin);
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

					sv.activateStep = null;
					sv.submitOrder = null;

					$('.fit-bg').svp('fitBg');
					$('.custom-select').svp('styleSelect');

					$('.hp-anchor').svp('popup', {
						container: $('.hp-callback'),
						documentEscClose: true
					});

					var $searchInput = $('.search-input');

					$('.h-search').svp('popup', {
						container: $('.search'),
						documentEscClose: true,
						hideEl: $('.s-hide'),
						onshow: function() {
							setTimeout(function() {
								$searchInput.focus();
							}, 50);
						}
					});

					$('.search .input')
						.on('focusin', function() {
							$(this).addClass('focused');
						})
						.on('focusout', function() {
							$(this).removeClass('focused');
						});

					var $imageContainer = $('.gallery-image');

					if ($imageContainer[0]) {
						var galleryPopup = sv.dom.$body.svp('popup', {
							container: $('.overlay-gallery'),
							hideEl: $('.og-hide'),
							documentClickClose: false,
							documentEscClose: true,
							showOnClick: false,
							onhide: function() {
								setTimeout(function() {
									$imageContainer.find('.gallery-media').remove();
								}, 200);
							}
						});

						if (galleryPopup) {
							var $curEl = $('.og-current'),
								$totalEl = $('.og-total');

							var gallery = sv.dom.$body.svp('gallery', {
								openFirst: false,
								disableClickOnActive: false,
								prevCtrl: $('.gallery-prev, .gallery-prev-underlay'),
								nextCtrl: $('.gallery-next, .gallery-next-underlay'),
								on: {
									beforeLoad: function() {
										galleryPopup.show();
									},
									load: function() {
										$curEl.html(gallery.getCurrent() + 1);
									}
								}
							});

							var totalItems = gallery.getTotal();

							if (totalItems > 1) {
								$totalEl.html(totalItems);
							} else {
								$('.og-counter').addClass('dn');
							}
						} else {

							var $galContainer = $('.pg-scrollable'),
								galContainer = $galContainer[0],
								$galWrapper = $('.pg-container');

							if (!galContainer) {
								console.warn('unknown gallery here');
							}

							var maxWidth = galContainer.scrollWidth - galContainer.clientWidth;

							var gallery = sv.dom.$body.svp('gallery', {
								on: {
									beforeLoad: function() {
										var position = this.offsetLeft,
											scroll = galContainer.scrollLeft,
											width = this.clientWidth,
											containerWidth = galContainer.clientWidth,
											newPos;

										if (position + width > scroll + containerWidth) {
											newPos = position - containerWidth + width;
											$galContainer.animate({scrollLeft: newPos});
										} else if (position < scroll) {
											newPos = position;
											$galContainer.animate({scrollLeft: newPos});
										} else {
											newPos = scroll;
										}

										if (galContainer.scrollWidth > containerWidth) {
											$galWrapper
												.toggleClass('scrollable-left', newPos > 0)
												.toggleClass('scrollable-right', newPos < maxWidth);
										}
									}
								}
							});
						}

						var image,
							x,
							y,
							origin,
							size,
							m;

						var _handle = function(e) {
							x = e.pageX - origin.left;
							y = e.pageY - origin.top;

							if (x < 0) {
								x = 0;
							} else if (x > size.x) {
								x = size.x;
							}

							if (y < 0) {
								y = 0;
							} else if (y > size.y) {
								y = size.y;
							}

							image.style.transformOrigin = x + 'px ' + y + 'px';
						};

						$imageContainer
							.on('mouseenter', 'img', function(e) {
								var $this = $(this);

								if ($this.hasClass('zoomable')) {
									return;
								}

								if (this.naturalWidth / this.clientWidth > 1) {
									$this.addClass('zoomable');
								}
							})
							.on('mousedown', 'img', function(e) {
								if (e.button !== 0) {
									return;
								}
								image = this;
								m = image.naturalWidth / image.clientWidth;

								if (m <= 1) {
									return console.log('no zoom needed (%s)', m);
								}
								e.preventDefault();
								sv.dom.$body.addClass('image-zoomed');

								origin = $imageContainer.offset();

								size = {
									x: image.clientWidth,
									y: image.clientHeight
								};

								_handle(e);

								image.style.transform = 'scale(' + m + ')';

								sv.dom.$window
									.on('mousemove.galleryZoom', function(e) {
										_handle(e);
									})
									.on('mouseup.galleryZoom', function() {
										$(this).off('.galleryZoom');
										image.style.transform = 'scale(1)';
										sv.dom.$body.removeClass('image-zoomed');
									});
							});
					}


					var checkInt = function() {
						if (this.value.match(/\D/)) {
							this.value = this.value.replace(/\D/g, '');
						}
					};

					var checkPhone = function() {
						if (this.value.match(/[^\d\+\s\(\)]/)) {
							this.value = this.value.replace(/[^\d\+\s\(\)]/g, '');
						}
					};


					sv.dom.$body
						.on('input', '.check-int', function() {
							checkInt.call(this);
						})
						.on('input', '.check-phone', function() {
							checkPhone.call(this);
						});


					var submitForm = function(id) {
						var $form = $(this);
						switch(id) {
							case '':
								console.warn('form', this, 'has no id');
							break;
							case 'order-step-2':
								sv.activateStep(2);
							break;
							case 'order-step-3':
								sv.submitOrder();
							break;
							default:
								console.warn('no action for form id %s', id);
						}
					};

					var checkValidity = function() {
						var	$form = $(this),
							isValid = true,
							firstFocused = false,
							$fields = $form.find('[required]'),
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

						$fields.each(function() {
							if (!$.trim(this.value)) {
								markInvalid.call(this);
							}

							if (this.getAttribute('type') === 'email' && !this.value.match(emailPattern)) {
								markInvalid.call(this);
							}
						});

						return isValid;
					};

					$('.validate')
						.each(function() {
							var $this = $(this);

							if ('noValidate' in this) {
								this.noValidate = true;
							}

							$this.find('[required]').on('input', function() {
								$(this).removeClass('invalid');
							});
						})
						.submit(function(e) {
							e.preventDefault();
							if (checkValidity.call(this)) {
								submitForm.call(this, this.id);
							} else {

							}
						});



					$('.pc-inner' + (sv.properties.lte600 ? ', .pc-inner-index' : '')).svp('liveCSS', function() {
						this.style.background = 'linear-gradient(rgba(27, 27, 31, 0), rgba(27, 27, 31, 0.9) ' + document.documentElement.clientHeight + 'px)';
					});

					if (sv.properties.lte600) {

						var $tabsContainer = $('.pf-tabs, .pls-tabs');

						$tabsContainer.each(function() {
							var _this = this,
								$this = $(_this);

							$this.on('click', 'a, li', function() {
								if (_this.scrollWidth > _this.clientWidth) {
									$this.animate({
										scrollLeft: this.offsetLeft + this.clientWidth / 2 - _this.clientWidth / 2
									}, 300);
								}
							});
						});
					}

					$('.h-menu-anchor').svp('popup', {
						container: $('.m-menu'),
						hideEl: $('.mm-hide')
					});

				})();
			break;
			case 'index':
				(function() {

					$('.ipn-tabs').svp('tabs', {
						containers: $('.ipn-slider')
					});

					$('.ipn-slider').svp('slider', {
						prefix: '.ipn',
						mode: 'class',
						speed: 250
					});

					$('.ip-slider').svp('slider', {
						prefix: '.ip',
						mode: 'class',
						speed: 300
					});


					if (sv.properties.lte600) {

						sv.dom.$body
							.addClass('loaded-step-1')
							.addClass('loaded-step-2');

						$('.ip-item').addClass('active');

						var $header = $('.header');

						$('.ip-title').css({
							marginTop: function() {
								return window.innerHeight - this.clientHeight - $header.outerHeight() - 50;
							}
						});

						$('.ip-container').svp('onImagesLoad', function() {
							this.height(function() {
								return Math.max.apply(null, $(this).find('.ip-inner').map(function() {
									return this.clientHeight;
								}));
							});
						});

					} else {
						$('.ip-inner').svp('liveCSS', function() {
							var $this = $(this),
								tallestChildHeight = Math.max($this.find('figure').height(), $this.find('article').height()),
								parentHeight = $this.closest('.ip-slide').height();

							console.assert(tallestChildHeight !== 0 && parentHeight !== 0);
							$this.toggleClass('h100', tallestChildHeight >= parentHeight);
						});

						sv.refreshTypo.call( $('.ip-inner article') );

						var video = $('.pb-video video')[0];

						video.width = 1280;
						video.height = 720;

						$('.fit-video').svp('fitBg', {
							selector: 'video'
						});

						var load = [
							function() {
								sv.dom.$body.addClass('loaded-step-1');

								setTimeout(function() {
									load[1]();
									sv.dom.$window.resize();
									video.play();
								}, 3000);

								video.load();
							},
							function(){
								$splash.addClass('hidden');
								sv.dom.$body.addClass('loaded-step-2');
							}
						];

						load[0]();

						var $splash = $('.index-splash');

						$splash.click(function() {
							load[1]();
						});

						var totalScrolled = 0,
							thrashold = 2000,
							calcTimer,
							slides = 2,
							curPage = 0;

						$('.index-pages').svp('slider', {
							prefix: '.ip',
							mode: 'class',
							slide: '.ip-item',
							navTag: null,
							navContainer: null,
							prevCtrl: null,
							nextCtrl: null,
							speed: 600
						});

						var slider = sv.sliders['.index-pages'];

						var showIndexSlide = function(index) {
							switch(index) {
								case 'prev':
									if (curPage - 1 < 0) {
										return console.log('first page already');
									} else {
										index = curPage - 1;
									}
								break;
								case 'next':
									if (curPage + 1 >= slides) {
										return console.log('last page already');
									} else {
										index = curPage + 1;
									}
								break;
								default:
							}
							slider.moveTo(index);

							curPage = index;
						};

						showIndexSlide(curPage);

						sv.dom.$window.on('wheel mousewheel', function(e) {
							// if (blockWindowScroll) {
								e.preventDefault();
								var delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -e.originalEvent.deltaY;

								totalScrolled += delta;

								clearTimeout(calcTimer);
								calcTimer = setTimeout(function() {
									totalScrolled = 0;
								}, 500);

								var direction = delta > 0 ? 'prev' : 'next',
									absTotal = Math.abs(totalScrolled);
								// blockWindowScroll = typeof _blockWindowScroll !== 'undefined' ? _blockWindowScroll : true;

								if (absTotal > thrashold) {
									showIndexSlide(direction);
								}
							// }
						});
					}

				})();
			break;
			case 'inner':
				(function() {

					$('.contacts-message-anchor').svp('popup', {
						container: $('.overlay-contact'),
						hideEl: $('.oc-hide'),
						directHideEl: $('.overlay-contact'),
						documentEscClose: true
					});

					var busy = false;

					if (sessionStorage.scrollTop) {
						sv.dom.$scrollableContent.scrollTop(sessionStorage.scrollTop);
					}

					sv.dom.$scrollableContent.scroll(function() {
						var _this = this;

						if (!busy) {
							sessionStorage.scrollTop = _this.scrollTop;
							busy = true;
							setTimeout(function() {
								busy = false;
								sessionStorage.scrollTop = _this.scrollTop;
							}, 250);
						}
					});

					sv.dom.$body.on('click', 'a', function(e) {
						if (!e.isDefaultPrevented()) {
							console.log('navigating to a different page');
							delete sessionStorage.scrollTop;
						}
					});


				})();
			break;
			case 'news':
				(function() {

					$('.news-tabs').svp('tabs', {
						element: 'li'
					});

					var loading = false;

					$('#news-load-more').click(function() {
						if (loading) {
							return;
						}

						var $button = $(this);

						$button.addClass('loading');

						setTimeout(function() {
							$button.removeClass('loading');
							loading = false;
						}, 1500);
					});

				})();
			break;
			case 'map':
				(function() {

					var mapContainer = $('.c-map')[0];

					var markers = [
						['Бизнес Центр «Колизей»', [55.7669655, 37.3719263]]
					];

					sv.initMap = function() {
						var map = new google.maps.Map(mapContainer, {
							zoom: 12,
							minZoom: 3,
							center: new google.maps.LatLng(markers[0][1][0], markers[0][1][1]),
							mapTypeId: google.maps.MapTypeId.ROADMAP,
							panControl: false,
							zoomControlOptions: {
								style: google.maps.ZoomControlStyle.SMALL
							},
							scrollwheel: false
						});

						markers.forEach(function(el) {
							new google.maps.Marker({
								position: new google.maps.LatLng(el[1][0], el[1][1]),
								map: map,
								title: el[0],
								cursor: 'default'/*,
								icon: {
									url: _spriteURL,
									origin: new google.maps.Point(121, 0),
									size: new google.maps.Size(36, 44)
								}*/
							});
						});

						delete sv.initMap;
					};

					sv.utils.loadJS('https://maps.googleapis.com/maps/api/js?v=3&sensor=false&callback=sv.initMap');

				})();
			break;
			case 'project':
				(function() {

					var $filter = $('.project-filter'),
						content = $('.p-content')[0],
						top = content.offsetTop - 15,
						left = content.offsetLeft;

					var _move = function() {
						var scrollTop = top - sv.dom.$scrollableContent.scrollTop();

						if (scrollTop > 0) {
							$filter.removeClass('floating');
						} else {
							scrollTop = 0;
							$filter.addClass('floating');
						}

						$filter.css({
							top: scrollTop
						});
					};

					sv.dom.$body.svp('liveCSS', function() {
						$filter
							.css({
								width: content.clientWidth,
								left: left,
								top: top
							});
						_move();
					});

					$filter.addClass('visible');

					sv.dom.$scrollableContent.scroll(function() {
						_move();
					});


					$('.pf-tabs').svp('tabs', {
						containers: '.pc-container'
					});

					var orderPopup = sv.dom.$body.svp('popup', {
						container: '.overlay-order',
						hideEl: '.oo-hide',
						documentClickClose: false,
						documentEscClose: true,
						showOnClick: false,
						onhide: function() {
							$higherLayer.width(0);
						}
					});

					var orderDone = sv.dom.$body.svp('popup', {
						container: '.overlay-order-done',
						directHideEl: '.overlay-order-done',
						hideEl: '.ood-hide',
						documentEscClose: true,
						showOnClick: false
					});


					var $progressSteps = $('.oop-higher span'),
						$steps = $('.oo-steps > div'),
						$higherLayer = $('.oop-higher'),

						$progressContainer = $('.oo-progress'),
						progressContainer = $progressContainer[0];

					sv.activateStep = function(index) {
						$progressSteps
							.removeClass('active')
							.eq(index).addClass('active');

						$steps
							.removeClass('active')
							.eq(index).addClass('active');

						var curPStep = $progressSteps[index];

						$higherLayer.width(curPStep.clientWidth + curPStep.offsetLeft + 20);

						if (progressContainer.scrollWidth > progressContainer.clientWidth) {
							$progressContainer.animate({
								scrollLeft: curPStep.offsetLeft + curPStep.clientWidth / 2 - progressContainer.clientWidth / 2
							}, 300);
						}
					};

					var loading = false;

					sv.submitOrder = function() {
						if (loading) {
							return;
						}
						$submitStep3.addClass('loading');
						loading = true;

						setTimeout(function() {
							$submitStep3.removeClass('loading');
							loading = false;

							orderPopup.hide();
							orderDone.show();
						}, 2000);
					};

					$('.order-button').click(function() {
						sv.activateStep(0);
						orderPopup.show();
					});

					$('.submit-step-1').click(function() {
						sv.activateStep(1);
					});

					$('.submit-step-2').click(function() {
						$('.oos-2').submit();
					});

					var $submitStep3 = $('.submit-step-3');

					$submitStep3.click(function() {
						$('.oos-3').submit();
					});

					$('.oo-file').svp('file');

				})();
			break;
			case 'project-section':
				(function() {

					$('.pls-tabs').svp('tabs', {
						element: 'li'
					});

					var rangeWidth = sv.properties.lte600 ? 256 : 151;

					var $rFrom = $('.fr-from'),
						$rTo = $('.fr-to');

					$('.filter-rooms').jRange({
						from: 1,
						to: 10,
						theme: 'theme-white',
						width: rangeWidth,
						step: 1,
						isRange: true,
						onstatechange: function(value) {
							var values = value.split(',');

							$rFrom.html(values[0]);
							$rTo.html(values[1]);
						}
					});

					var $aFrom = $('.fa-from'),
						$aTo = $('.fa-to');

					$('.filter-area').jRange({
						from: 250,
						to: 350,
						theme: 'theme-white',
						width: rangeWidth,
						step: 5,
						isRange: true,
						onstatechange: function(value) {
							var values = value.split(',');

							$aFrom.html(values[0]);
							$aTo.html(values[1]);
						}
					});

				})();
			break;
			case 'distribution':
				(function() {

					if (sv.properties.lte600) {

					} else {
						sv.refreshTypo.call( $('.distribution article') );
					}

				})();
			break;
			case 'partners':
				(function() {

					if (sv.properties.lte600) {

					} else {
						sv.refreshTypo.call( $('.partners article') );
					}

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