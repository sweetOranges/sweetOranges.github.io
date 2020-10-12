Context.worker = (function(ide){
	var g_id = 1;
	var g_task = {};
	var worker_url = './js/ide.worker.task.js';
	var g_worker = new Worker(worker_url);

	function init() {
		var handleMessage =  function(e) {
			ide.log('info','worker handleMessage, e=' + JSON.stringify(e));
			if (e.data.task_id == -1) {
				return;
			}
			if (!g_task[e.data.task_id]) {
				return;
			}
			var cb = g_task[e.data.task_id];
			if (e.data.type == 'data') {
				cb.data(e.data.data);
			} 
			if (e.data.type == 'end') {
				cb.end();
				ide.log('info','worker delete task, task_id=' + e.data.task_id);
				delete g_task[e.data.task_id];
			}
		}
		g_worker.onmessage = handleMessage;
	}
	

	function async(task, data, cb) {
		var task_id = g_id++;
		var req = {task: task.toString(), data:data, task_id: task_id};
		g_worker.postMessage(req);
		g_task[task_id] = cb;
	}

	init();

	return {
		async: async
	}

})(IDE);
