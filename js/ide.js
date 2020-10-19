var Context = {};



var IDE = (function(context){

	var g_editer;
	var g_view;

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


	function render_code() {
		$('#editor').show();
		$('#view').hide();
	}

	function render_view() {
		$('#editor').hide();
		$('#view').show();
	}

	function init() {
		init_editer();
		init_view();
	}

	function get_editor() {
		return g_editer;
	}

	function get_view() {
		return g_view;
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
		show_view: render_view,
		show_code: render_code,
		run: run
	}
})(Context);