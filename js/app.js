
var ENV = (function(){
	var g_editer;
	var g_worker;
	var g_id = 0;
	var g_task = {};
	var g_data = [];

	var data_url = 'https://gw.alipayobjects.com/os/antvdemo/assets/data/nintendo.json';
	var worker_url = './js/worker.js';

	ace.config.set('basePath', 'https://cdn.bootcdn.net/ajax/libs/ace/1.4.9/');


	function send2Worker(req) {
		return new Promise(function(resolve, reject) {
			var task_id = g_id++;
			req.id = task_id;
			g_worker.postMessage(req);
			g_task[task_id] = {resolve: resolve, reject: reject};
		});
	}

	function init_worker() {
		g_worker = new Worker(worker_url);
		var handleMessage =  function(e) {
			if (e.data.method == 'worker_log') {
				log(e.data.level, e.data.msg);
				return;
			}
			if (!g_task[e.data.id]) {
				log('error', 'handleMessage can not found id, id=' + e.data.id);
				return;
			}
			var cb = g_task[e.data.id];
			cb.resolve(e.data.data);
			log('info', 'handleMessage success, id=' + e.data.id);
			delete g_task[cb.id];
		}
		g_worker.onmessage = handleMessage;
		log('info', 'init_worker init success');
	}

	function init_editer() {
		g_editer = ace.edit("dv-editor");
		g_editer.setTheme("ace/theme/monokai");
	    g_editer.session.setMode("ace/mode/javascript");
	    g_editer.setFontSize(14);
	    log('info', 'init_editer success');
	}

	function render_table() {
		$('#dv-editor').hide();
		$('#table').show();
		var keys = Object.keys(g_data[0]);
        var thead = keys.map(function(key) {
                return `<th style=" position: sticky;top: 0;background:#fff;box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">${key}</th>`
        }).join('');
        var tbody = g_data.map(function(item){
                return '<tr>' + keys.map(function(key){
                        return `<td>${item[key]}</td>`
                }).join('') + "</tr>";
        });
        var html = `<thead>${thead}</thead><tbody>${tbody}</tbody>`;
        $('#table table').html(html);
	}

	function log(l, msg) {
		$('#console').append(`<div><span style="color:${ l == 'info' ? '#00f': '#f00'}">${new Date}:</span> ${msg}</div>`);
		$("#console").scrollTop = $("#console").scrollHeight;
	}

	function load_data() {
		send2Worker({
			method: 'request',
			data: {
				url: data_url
			}
		}).then(function(res) {
			var data = JSON.parse(res);
			g_data = data;
			log('info', 'load_data success');
		});
	}


	function render_code() {
		$('#dv-editor').show();
		$('#table').hide();
	}

	function init() {
		init_editer();
		init_worker();
		//init_gists();
	}

	function run() {
        try {
			var __code = g_editer.getValue();
	        var code = `var main;${__code};if(main) {main(rows);}`;
	        log('info', code)
	        var compiler = new Function('rows', code);
	        compiler(g_data);
        } catch(e) {
        	log('error', e)
        }
        
	}
	return {
		init: init,
		load_data: load_data,
		render_table: render_table,
		render_code: render_code,
		run: run
	}
})();