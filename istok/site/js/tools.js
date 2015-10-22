sv.tools = (function() {
	'use strict';

	var tools = {
		calendar: function(options) {

		    var opts = $.extend({
		        rootElement: 'table'
		    }, options);

		    sv.calendarRadioNS = sv.calendarRadioNS || 0;

		    var radioNS = sv.calendarRadioNS;

		    var getDays = function(month, year) {
		        var d = new Date();

		        d.setDate(1);
		        d.setFullYear(year);
		        d.setMonth(month);

		        var arr = [];
		        for (i = 1; i < 40; i++){
		            d.setDate(i);
		            if (d.getMonth() !== month) {
		                break;
		            }
		            arr.push(i);
		        }

		        return arr;
		    };

		    var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		        ruDays = {
		            0: 6,
		            1: 0,
		            2: 1,
		            3: 2,
		            4: 3,
		            5: 4,
		            6: 5
		        },
		        html = '<label><input type="radio" name="calendar-' + sv.calendarRadioNS + '"><span>$a</span></label>',
		        prevHtml = '<span class="cal-cell-prev">$a</span>',
		        nextHtml = '<span class="cal-cell-next">$a</span>';

		    var Calendar = function() {
		        var today = new Date,
		            _year = today.getFullYear(),
		            _month = today.getMonth();

		        this.setDate = function(year, month) {
		            if (year === 'next') {
		                _year++;
		            } else if (year === 'prev') {
		                _year--;
		            } else if (year === 'preserve') {

		            } else if (!isNaN(parseInt(year, 10))) {
		                _year = parseInt(year, 10);
		            } else {
		                _year = today.getFullYear();
		            }

		            if (month === 'next') {
		                if (_month === 11) {
		                    _month = 0;
		                    _year++;
		                } else {
		                    _month++;
		                }
		            } else if (month === 'prev') {
		                if (_month === 0) {
		                    _month = 11;
		                    _year--;
		                } else {
		                    _month--;
		                }
		            } else if (month == 'preserve') {

		            } else if (!isNaN(parseInt(month, 10))) {
		                _month = parseInt(month, 10);
		            } else {
		                _month = today.getMonth();
		            }
		        };
		        this.getDate = function() {
		            return {
		                month: _month,
		                monthName: monthNames[_month],
		                year: _year,
		            };
		        };
		        this.build = function(year, month) {
		            var table = document.createElement(opts.rootElement);

		            this.setDate(year, month);

		            var monthDays = getDays(_month, _year),
		                prevMonth = _month ? _month - 1 : 11,
		                prevMonthDays = getDays(prevMonth, _year),
		                startingDay = ruDays[(new Date(_year, _month, 1)).getDay()],
		                index = 0,
		                nextIndex = 1,
		                prevIndex = prevMonthDays[prevMonthDays.length - 1 - startingDay],
		                totalIndex = 0,
		                row,
		                cell;

		            while(index < monthDays.length) {
		                row = table.insertRow(-1);
		                for (i = 0; i < 7; i++) {
		                    cell = row.insertCell(-1);

		                    if (totalIndex < startingDay) {
		                        cell.innerHTML = prevHtml.replace('$a', prevMonthDays[prevIndex]);
		                        prevIndex++;
		                    } else {
		                        if (monthDays[index]) {
		                            cell.innerHTML = html.replace('$a', monthDays[index]);
		                            index++;
		                        } else {
		                            cell.innerHTML = nextHtml.replace('$a', nextIndex);
		                            nextIndex++;
		                        }
		                    }
		                    totalIndex++;
		                }
		            }

		            return table;
		        };
		    };

		    sv.calendarRadioNS++;

		    return(new Calendar);
		},
		inputLinks: function() {

			var checkSelector = function(selector) {
				try {
					var $node = $(selector);
				} catch(e) {
					console.warn('bad selector: %s', selector);
					return $();
				}
				return $node;
			};

			var checkValue = function() {
				var selector = this.getAttribute('data-linked-node-selector'),
					nodeClass = null,
					$node = checkSelector(selector);

				if (!$node[0]) {
					console.warn('linked node "%s" not found', selector);
					return;
				}

				if (this.getAttribute('data-linked-node-class')) {
					nodeClass = 'linked-node-' + this.getAttribute('data-linked-node-class');
					if (!$node.hasClass(nodeClass)) {
						$node.addClass(nodeClass);
					}
				}
				$node
					.toggleClass('active', this.checked)
					.trigger('classChanged');
			};


			sv.updateInputLinks = function() {
				var $linkedCheckboxes = $(':checkbox[data-linked-node-selector]'),
					$linkedRadios = $(':radio[data-linked-node-selector]');

				$linkedRadios
					.off('.inputLinks')
					.each(function() {
						var radio = this;

						$(':radio[name="' + radio.name + '"]').on('change.inputLinks', function() {
							checkValue.call(radio);
						});
						checkValue.call(this);
					});

				$linkedCheckboxes
					.off('.inputLinks')
					.each(function() {
						$(this).on('change.inputLinks', function() {
							checkValue.call(this);
						});
						checkValue.call(this);
					});
			};

			sv.updateInputLinks();
		},
		enhance: function() {

			$('.input')
				.on('focusin', function() {
					$(this).addClass('focused');
				})
				.on('focusout', function() {
					$(this).removeClass('focused');
				});

			var checkInput = function() {
				if ($.trim(this.value).length > 0) {
					$(this).removeClass('empty').addClass('filled');
				} else {
					$(this).removeClass('filled').addClass('empty');
				}
			};

			/*$body.on('change', 'input, textarea', function() { // for masks
				checkInput.call(this);
			});*/

			var inputTypes = ['date', 'email', 'password', 'search', 'tel', 'text', 'url'],
				inputTypesSelector = $.map(inputTypes, function(el) { return 'input[type=' + el + ']'; }).join(', ') + ', textarea';

			$(inputTypesSelector).each(function() {
				checkInput.call(this);
			});

			sv.dom.$body.on('input', inputTypesSelector, function() {
				checkInput.call(this);
			});
		},
		typography: function() {

			var totalLh = null;

			var getLh = function() {
				this.style.lineHeight = null;

				var lh = parseInt(getComputedStyle(this).lineHeight, 10),
					newLh = Math.round(this.clientWidth / 12 / parseInt(getComputedStyle(this).fontSize, 10));

				if (newLh > 7) {
					newLh = 7;
				} else if (newLh < 2) {
					newLh = 2;
				}
				totalLh = lh + newLh;
				this.style.lineHeight = totalLh + 'px';

			};

			var getMargins = function(i) {
				var tag = this.nodeName.toLowerCase();
				this.style.marginBottom = Math.round(totalLh / 2) + 'px';
				if (i !== 0 && tag !== 'p' && tag !== 'ul'){
					this.style.paddingTop = Math.round(totalLh / 2) + 'px';
				}
			};

			var refreshTypo = function() {
				$('article').each(function(i) {

					this.style.lineHeight = null;

					var $this = $(this),
						elements = $this.find('p, ul, h1, h2, h3, h4, h5, h6');

					elements.each(function(i) {
						getLh.call(this);
						getMargins.call(this, i);
					});

					getLh.call(this);
				});
			};

			sv.refreshTypo = refreshTypo;

			refreshTypo();
			sv.dom.$window.resize(refreshTypo);
		},
		validate: function() {

			sv.checkValidity = function(options) {

				var opts = $.extend({
					requiredSelector: '[required]'
				}, options);

				var $container,
					container;

				if (this instanceof $) {
					container = this[0];
					$container = this;
					if (!container) {
						console.error('check validity: Empty jQuery object');
						return;
					}
				} else if (this instanceof HTMLElement) {
					container = this;
					$container = $(this);
				} else {
					console.error('check validity: Argument is not a container. Must be called with HTMLElement or jQuery object');
					return;
				}

				var $fields = $container.find(opts.requiredSelector);

				if (!$fields[0]) {
					console.error('check validity: no required fields found');
					return;
				}

				if ('noValidate' in container) {
					container.noValidate = true;
				} else {
					var $form = $container.find('form');

					if ($form.length > 1) {
						console.error('check validity: more than one form found');
						return;
					} else {
						$form[0].noValidate = true;
					}
				}

				$container.removeClass('invalid invalid-check invalid-select invalid-fill invalid-email')

				$fields
					.off('.checkValidity')
					.on('input.checkValidity change.checkValidity', function() {
						$(this).removeClass('invalid');
					});

				var valid = true,
					firstFocused = false,
					emailRegexp = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/);

				var markInvalid = function(className) {
					var $input = $(this),
						$container = $input.closest('.validate');

					$input.addClass('invalid');
					$container.addClass('invalid invalid-' + className);
					valid = false;
					if (!firstFocused) {
						$input.focus();
						firstFocused = true;
					}
				};

				$fields
					.filter('.invalid').removeClass('invalid').end()
					.each(function() {
						var type = this.type;
						if (type === 'checkbox' && !this.checked) {
							markInvalid.call(this, 'check');
							return;
						}

						if ((type === 'select-one' || type === 'select-multiple') && !~this.selectedIndex) {
							markInvalid.call(this, 'select');
							return;
						}

						if (!$.trim(this.value)) {
							markInvalid.call(this, 'fill');
							return; // !!!
						}

						if (this.type === 'email' && !this.value.match(emailRegexp)) {
							markInvalid.call(this, 'email');
						}
					});

				return valid;
			};

			var submitParentForm = function() {
				var $container = $(this).closest('.validate'),
					$form;

				if (sv.checkValidity.call($container)) {
					$form = $container.find('form');

					var submitEvent;

					try {
						submitEvent = new Event('submit');
					} catch(e) {
						submitEvent = document.createEvent('Event');
						submitEvent.initEvent('submit', true, true);
					}
					$form[0].dispatchEvent(submitEvent);
					$form.submit();
				}
			};

			$('.form-submit').click(function() {
				submitParentForm.call(this);
			});

			$('.validate')
				.find('input').keypress(function(e) {
					if (e.keyCode === 13) {
						submitParentForm.call(this);
					}
				}).end()
				.find(':submit').each(function() {
					console.error('check validity: submit found %o', this);
				});
		}
	};

	return tools;
})();