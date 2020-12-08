var Context = {};

var IDE = (function(context) {

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
        new VConsole();
        console.log('ide: init finished');
    }

    function get_editor() {
        return g_editer;
    }

    function onmessage(e) {
        let resp = e.data;
        if (!resp.type) {
            console.log('ide: type not in resp');
            return;
        }
        if (resp.type == 'log') {
            console.log(resp.data);
            return;
        }
        if (!resp.id) {
            console.log('ide: id not in resp');
            return;
        }
        if (!g_task.has(resp.id)) {
            console.log('ide: g_task not has task_id:' + resp.id);
            return;
        }
        console.log('onmessage, id=' + resp.id);
        let cb = g_task.get(resp.id);
        if (resp.type == 'error') {
            cb.reject(resp.data);
        } else {
            cb.resolve(resp.data);
        }
        g_task.delete(resp.id);
    }

    function async(main, deps, args) {
        let code = `var main=(${main.toString()});`;
        let dep_code = deps.map((item)=>{
            return item.toString() + "\n";
        }
        );
        code += dep_code.join('');
        return new Promise(function(resolve, reject) {
            let id = g_id++;
            let task = {
                method: 'async',
                args: [code, args],
                id: id
            };
            g_worker.postMessage(task);
            console.log('ide: async task submit, method=async', {
                method: 'async',
                id: id
            });
            g_task.set(id, {
                resolve: resolve,
                reject: reject
            });
        }
        );
    }

    function pify(task, resolveName, rejectName) {
        return new Promise(function(resolve, reject) {
            var request = task(resolve, reject);
            if (Array.isArray(resolveName)) {
                resolveName.forEach(function(name) {
                    request[name] = resolve;
                });
            }
            if (Array.isArray(rejectName)) {
                rejectName.forEach(function(name) {
                    request[name] = reject;
                });
            }
        }
        );
    }

    function run() {
        try {
            var __code = g_editer.getValue();
            var code = `var main;${__code};if(main) {main(context);}`;
            var compiler = new Function('context',code);
            compiler(context);
        } catch (e) {
            console.error(e)
        }

    }

    function request(obj) {
        return new Promise((resolve,reject)=>{
            let xhr = new XMLHttpRequest();
            xhr.open(obj.method || "GET", obj.url);
            if (obj.headers) {
                Object.keys(obj.headers).forEach(key=>{
                    xhr.setRequestHeader(key, obj.headers[key]);
                }
                );
            }
            xhr.onload = ()=>{
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            }
            ;
            xhr.onerror = ()=>reject(xhr.statusText);
            xhr.send(obj.body);
        }
        );
    }

    Context.util = {
        async: async,
        pify: pify,
        request: request
    };

    return {
        init: init,
        run: run,
        pify: pify,
        request: request,
        get_editor: get_editor
    }
}
)(Context);
