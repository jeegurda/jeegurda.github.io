$(function() {
	$('input, textarea').dblclick(function() {
		$(this.form).find('input, textarea, select').each(function() {
			if (this.type === 'email') {
				this.value = 'test@test.test';
				$(this).trigger('input');
			} else if (this.type === 'checkbox') {
				this.checked = true;
				$(this).trigger('change');
			} else if (this.type === 'text' || this.type === 'search' || this.type === 'password' || this.type === 'tel' || this.type === 'url') {
				this.value = 'test';
				$(this).trigger('input');
			} else if (this.type === 'textarea') {
				this.value = 'test text';
				$(this).trigger('input');
			} else if (this.type === 'select-one' || this.type === 'select-multiple') {
				this.selectedIndex = 0;
				$(this).trigger('change');
			}
		})
	});
});
