function async(code, args) {
  var code = `${code};if(main) { return main(args);}`;
  console.log('worker: start exec code', code);
  postMessage({type: 'log', data: "aysnc task start!"});
  var compiler = new Function('args', code);
  console.log('worker: finish job');
  postMessage({type: 'log', data: "aysnc task done!"});
  return compiler(args);
}

cbs = {};
cbs.async = async;

onmessage =  function(e) {
  var task = e.data;
  try {
    if (!cbs[task.method]) {
      postMessage({type: 'error', data: "no such method", id: task.id});
      return;
    }
    let res = cbs[task.method].apply(this, task.args);
    if (!res.then) {
      postMessage({type: 'success',data: res, id: task.id});
      return;
    } else {
      res.then((res) => {
        postMessage({type: 'success',data: res, id: task.id});
      }).catch((e) => {
        postMessage({type: 'error',data: e, id: task.id});
      }); 
    }
  } catch(e) {
    postMessage({type: 'error',data: e, id: task.id});
  }
}