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
        var view = window.open('');
        view.document.write(`<html><head><style>table.hovertable {
font-family: verdana,arial,sans-serif;
font-size:11px;
color:#333333;
border-width: 1px;
border-color: #999999;
border-collapse: collapse;
width: 100%;
}
table.hovertable th {
background-color:#c3dde0;
border-width: 1px;
padding: 8px;
border-style: solid;
border-color: #a9c6c9;
}
table.hovertable tr {
background-color:#d4e3e5;
}
table.hovertable td {
border-width: 1px;
padding: 8px;
border-style: solid;
border-color: #a9c6c9;
}</style></head><body>${html}<body></html>`)
    }

    function income_view(data, x, y) {
        var group = data.reduce(function(acc, item) {
            if (!acc[item[x]]) acc[item[x]] = [];
            acc[item[x]].push(item);
            return acc;
        }, {});
        var xs = Object.keys(group).sort();
        var base_y_sum = 0;
        var base_win = 0;
        var base_lose = 0;

        var ys = []; // 收益曲线
        var sl = []; // 胜率
        var ds = [];
        xs.forEach(function(x) {
            var t = 0;
            var sum = group[x].forEach((item) => {
                if (item[y] > 0){
                    base_win++;
                }else {
                    base_lose++;
                }
                t++;
                base_y_sum += item[y];
            }, 0);
            sl.push([x, base_win / (base_win + base_lose)]);
            ys.push([x, (base_y_sum * 1.0).toFixed(2)]);
            ds.push([x, t]);
        });
        // clean html first, then init echarts
        var view = window.open('');
        var options = Object.assign({}, options, {
            grid: {top: 50},
            legend: {data: ['收益率曲线', '胜率曲线', '每日个数']},
            tooltip: {trigger: 'axis', axisPointer: {type: 'cross'}},
            xAxis: {type: 'category', data: xs},
            yAxis: {type: 'value', min:'dataMin', max: 'dataMax'},
            dataZoom: [{type: 'inside'}, {type: 'slider'}],
            series:[
            {'name': '收益率曲线', type: 'line', data: ys},
            {'name': '胜率曲线', type: 'line', data: sl},
            {'name': '每日个数', type: 'bar', data: ds}]
        });
        view.document.write(`<html><head>`)
        view.document.write(`<script src="https://cdn.bootcdn.net/ajax/libs/jquery/1.10.0/jquery.js"></script>`);
        view.document.write(`<script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.1.0/echarts.min.js"></script>`)
        view.document.write(`</head><body><div id="view" style="width:100%;height:500px;"></div>
            <script>
                var charts = echarts.init(document.getElementById('view'));
                charts.setOption(${JSON.stringify(options)})
            </script
        </body></html>`);
    }
    return {
       table: table,
       income_view: income_view
    }
})(IDE);
