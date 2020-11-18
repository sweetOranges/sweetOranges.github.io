var Context = {};

var IDE = (function(context){

	var g_editer;
	var g_id = 1;
	var g_task = new Map();
	var g_worker = new Worker('./js/ide.worker.js');

	ace.config.set('basePath', 'https://cdn.bootcdn.net/ajax/libs/ace/1.4.9/');

	function init() {
		g_editer = ace.edit("editor");
		g_editer.setTheme("ace/theme/monokai");
	    g_editer.session.setMode("ace/mode/javascript");
	    g_editer.setFontSize(14);
		g_worker.onmessage = onmessage;
		log('init success');
	}

	function get_editor() {
		return g_editer;
	}

	function onmessage(e) {
		let resp = e.data;
		if (!resp.type) {
			log('type not in resp');
			return;
		}
		if (resp.type == 'log') {
			log(resp.data);
			return;
		}
		if (!resp.id) {
			log('id not in resp');
			return;
		}
		if (!g_task.has(resp.id)) {
			log('g_task not has task_id:' + resp.id);
			return;
		}
		log('onmessage, id=' + resp.id);
		let cb = g_task.get(resp.id);
		if (resp.type == 'error') {
			cb.reject(resp.data);
		} else {
			cb.resolve(resp.data);
		}
		g_task.delete(resp.id);
	}

	function post(method, args) {
		return new Promise(function(resolve, reject) {
			let id = g_id++;
			let task = {method: method, args: args, id: id};
			g_worker.postMessage(task);
			log('post, method=' + method + ",id=" + id);
			g_task.set(id, {resolve: resolve, reject: reject});
		});
	}

	function async(main, deps, args) {
		let code = `var main=(${main.toString()});`;
		let dep_code = deps.map((item) => {
			return item.toString() + "\n";
		});
		code += dep_code.join('');
		return post('async', [code, args]);
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

	Context.network = {request: request};
	Context.async = async;

	return {
		log: log,
		init: init,
		run: run,
		post: post,
		request: request,
		get_editor: get_editor
	}
})(Context);