// simple ajax
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



function handleRequest(task) {
	return request(task);
}


function handleSetData(task) {
	data = task;
}

function log(level, msg) {
	postMessage({code: -1, id: 0, msg: msg, level: level, method: 'worker_log'});
}

var cbs = {};
var data;

cbs['request'] = handleRequest;
cbs['setData'] = handleSetData;


onmessage =  function(e) {
  log('info', 'Worker: Message received from main script, task=' + JSON.stringify(e.data));
  var data = e.data;
  if (!cbs[data.method]) {
  	postMessage({code: -1, id: data.id ? data.id: 0, msg: 'unknow method'});
  	return;
  }
  
  var p = cbs[data.method](data.data);
  p.then(function(data){
  	postMessage({code: 0, id: data.id ? data.id : 0, msg: 'success', method: data.method, data: data});
  }).catch(function(e) {
	postMessage({code: -1, id: data.id ? data.id: 0, msg: e, method: data.method});
  });
}