var Context = {};



var IDE = (function(context){

	var g_editer;

	ace.config.set('basePath', 'https://cdn.bootcdn.net/ajax/libs/ace/1.4.9/');


	function init_editer() {
		g_editer = ace.edit("editor");
		g_editer.setTheme("ace/theme/monokai");
	    g_editer.session.setMode("ace/mode/javascript");
	    g_editer.setFontSize(14);
	    log('info', 'init_editer success');
	}


	function log(l, msg) {
		$('#console').append(`<div><span style="color:${ l == 'info' ? '#00f': '#f00'}">${new Date}:</span> ${msg}</div>`);
		$("#console").scrollTop = $("#console").scrollHeight;
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
	}

	function get_editor() {
		return g_editer;
	}

	function run() {
        try {
			var __code = g_editer.getValue();
	        var code = `var main;${__code};if(main) {main(context);}`;
	        var compiler = new Function('context', code);
	        compiler(context);
        } catch(e) {
        	console.log(e)
        	log('error', e)
        }
        
	}
	return {
		init: init,
		log: log,
		get_editor: get_editor,
		show_view: render_view,
		show_code: render_code,
		run: run
	}
})(Context);