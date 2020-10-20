var Context = {};




var IDE = (function(context){

	var g_editer;
	var g_view;
	var g_data;

	ace.config.set('basePath', 'https://cdn.bootcdn.net/ajax/libs/ace/1.4.9/');


	function init_editer() {
		g_editer = ace.edit("editor");
		g_editer.setTheme("ace/theme/monokai");
	    g_editer.session.setMode("ace/mode/javascript");
	    g_editer.setFontSize(14);
	}

	function init_view() {
		g_view = $('#view');
	}

	function init_data() {
		g_data = $('#data');
	}


	function render_code() {
		$('#editor').show();
		$('#data').hide();
		$('#view').hide();
	}

	function render_view() {
		$('#editor').hide();
		$('#data').hide();
		$('#view').show();
	}

	function render_data() {
		$('#editor').hide();
		$('#data').show();
		$('#view').hide();
	}

	function init() {
		init_editer();
		init_view();
		init_data();
	}

	function get_editor() {
		return g_editer;
	}

	function get_view() {
		return g_view;
	}

	function get_data() {
		return g_data;
	}

	function raw_data() {
		return get_data().find('textarea').val();
	}

	function run() {
        try {
			var __code = g_editer.getValue();
	        var code = `var main;${__code};if(main) {main(context);}`;
	        var compiler = new Function('context', code);
	        compiler(context);
        } catch(e) {
        	console.error(e)
        }
        
	}
	return {
		init: init,
		get_editor: get_editor,
		get_view: get_view,
		get_data: get_data,
		show_view: render_view,
		show_code: render_code,
		show_data: render_data,
		run: run,
		raw_data: raw_data
	}
})(Context);


Context.data = (function(ide){
	function json() {
		return JSON.parse(ide.raw_data());
	}

	function csv() {
		var raw = ide.raw_data().trim();
		var lines = raw.split("\n");
		var header = lines.shift().split(",");
		return lines.reduce(function(acc, line) {
			var pices = line.split(",");
			if (pices.length != header.length) {
				return acc;
			}
			var item = {};
			header.forEach(function(key, index) {
				item[key] = pices[index]; 
			});
			acc.push(item);
			return acc;
		}, []);
		return ret;
	}

	return {
		csv: csv,
		json: json
	}
})(IDE);
