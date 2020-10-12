onmessage =  function(e) {
  var task = e.data;
  try {
    var func = new Function('context', 'data', `var task=(${task.task});task(context, data)`);
    func({
      send: function(data) {
        postMessage({type: 'data',data: data, task_id: task.task_id});
      }
    }, task.data);
  } catch(e) {
    postMessage({type: 'error',data: e, task_id: task.task_id});
  } finally {
    postMessage({type: 'end',data: '', task_id: task.task_id});
  }
}