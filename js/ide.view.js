Context.view = (function(ide){
    function table(data) {
        var keys = Object.keys(data[0]);
        var thead = keys.map(function(key) {
                return `<th style=" position: sticky;top: 0;background:#fff;box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">${key}</th>`
        }).join('');
        var tbody = data.map(function(item){
                return '<tr>' + keys.map(function(key){
                        return `<td>${item[key]}</td>`
                }).join('') + "</tr>";
        }).join('');
        var html = `<table class="hovertable"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
        ide.show_view();
        $('#view').html(html);
    }
    return {
       table: table
    }
})(IDE);
