var Context = {};

var IDE = (function(context){

	var g_editer;
	var g_left;

	ace.config.set('basePath', 'https://cdn.bootcdn.net/ajax/libs/ace/1.4.9/');


	function init_editer() {
		g_editer = ace.edit("editor");
		g_editer.setTheme("ace/theme/monokai");
	    g_editer.session.setMode("ace/mode/javascript");
	    g_editer.setFontSize(14);
	}

	function init() {
		init_editer();
		log('editor init success');
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
        	console.error(e)
        }
        
	}

	// dead simple ajax
	function request(obj) {
		return new Promise((resolve, reject) => {
	        let xhr = new XMLHttpRequest();
	        xhr.open(obj.method || "GET", obj.url);
	        if (obj.headers) {
	            Object.keys(obj.headers).forEach(key => {
	                xhr.setRequestHeader(key, obj.headers[key]);
	            });
	        }
	        xhr.onload = () => {
	            if (xhr.status >= 200 && xhr.status < 300) {
	                resolve(xhr.response);
	            } else {
	                reject(xhr.statusText);
	            }
	        };
	        xhr.onerror = () => reject(xhr.statusText);
	        xhr.send(obj.body);
	    });
	}

	function log(msg) {
		var fmt = '<div>[' + new Date() + ']  ' + msg + "</div>";
		$('#console').append(fmt);

	}
	
	context.network = {request: request};

	return {
		log: log,
		init: init,
		run: run,
		request: request,
		get_editor: get_editor
	}
})(Context);