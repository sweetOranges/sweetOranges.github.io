// simple data transform
Context.transform = (function(ide) {
    function json(raw) {
        return JSON.parse(raw);
    }

    function csv(raw) {
        var lines = raw.split("\n");
        var header = lines.shift().split(",");
        var parser = function(acc, line) {
            var pices = line.split(",");
            if (pices.length != header.length) {
                return acc;
            }
            var item = {};
            header.forEach(function(key, index) {
                item[key] = pices[index];
            });
            acc.push(item);
            return acc;
        };
        return lines.reduce(parser, []);
    }

    return {
        csv: csv,
        json: json
    }
}
)(IDE);

Context.view = (function(ide) {
    function table(data) {
        var keys = Object.keys(data[0]);
        var thead = keys.map(function(key) {
            return `<th style=" position: sticky;top: 0;background:#fff;box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">${key}</th>`
        }).join('');
        var tbody = data.map(function(item) {
            return '<tr>' + keys.map(function(key) {
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
}</style></head><body>${html}<body></html>`);
        console.log('view: table_view render finished');
    }

    function income_view(data, x, y) {
        var group = data.reduce(function(acc, item) {
            if (!acc[item[x]])
                acc[item[x]] = [];
            acc[item[x]].push(item);
            return acc;
        }, {});
        var xs = Object.keys(group).sort();
        var base_y_sum = 0;
        var base_win = 0;
        var base_lose = 0;

        var ys = [];
        // 收益曲线
        var sl = [];
        // 胜率
        var ds = [];
        xs.forEach(function(x) {
            var t = 0;
            group[x].forEach((item)=>{
                if (item[y] > 0) {
                    base_win++;
                } else {
                    base_lose++;
                }
                t++;
                base_y_sum += item[y];
            }
            , 0);
            sl.push([x, base_win / (base_win + base_lose)]);
            ys.push([x, (base_y_sum * 1.0).toFixed(2)]);
            ds.push([x, t]);
        });
        var view = window.open('');
        var options = Object.assign({}, options, {
            grid: {
                top: 50
            },
            legend: {
                data: ['收益率曲线', '胜率曲线', '每日个数']
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            xAxis: {
                type: 'category',
                data: xs
            },
            yAxis: {
                type: 'value',
                min: 'dataMin',
                max: 'dataMax'
            },
            dataZoom: [{
                type: 'inside'
            }, {
                type: 'slider'
            }],
            series: [{
                'name': '收益率曲线',
                type: 'line',
                data: ys
            }, {
                'name': '胜率曲线',
                type: 'line',
                data: sl
            }, {
                'name': '每日个数',
                type: 'bar',
                data: ds
            }]
        });
        view.document.write(`<html><head>`)
        view.document.write(`<script src="https://cdn.bootcdn.net/ajax/libs/jquery/1.10.0/jquery.js"></script>`);
        view.document.write(`<script src="https://cdn.bootcdn.net/ajax/libs/echarts/4.1.0/echarts.min.js"></script>`)
        view.document.write(`</head><body><div id="view" style="width:${window.innerWidth}px;height:500px;"></div>
            <script>
                var charts = echarts.init(document.getElementById('view'));
                charts.setOption(${JSON.stringify(options)})
            </script
        </body></html>`);
        console.log('view: income_view render finished');
    }
    return {
        table: table,
        income_view: income_view
    }
}
)(IDE);

Context.github = (function(ide) {


    function get_token() {
        return window.localStorage.getItem('github-token');
    }

    function get_user() {
    	return window.localStorage.getItem('github-user') ? window.localStorage.getItem('github-user') : 'sweetoranges';
    }

    function get_repos() {
        return window.localStorage.getItem('github-repos');
    }

    let headers = {
        "Authorization": "Basic " + btoa("token:" + get_token())
    };

    let repos = get_repos();

    let user = get_user();

    // list file by github api
    async function list_file(path) {
        let res = await ide.request({
            url: 'https://api.github.com/repos/'+user+'/' + repos + '/contents/' + path,
            headers: headers
        })
        let items = JSON.parse(res);
        return items;
    }

    // list file name from repos and build menu
    async function build_menu() {
        console.log(`github: ======menu init start========`);
        $('#nav-project').html('<li class="dropdown-submenu"><a href="#">loading</a></li>');
        let files = await list_file('');
        var html = [];
        // use await... so do not use forEach
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type == 'dir') {
                html.push(`<li class="dropdown-submenu"><a href="#">${file.path}</a><ul class="dropdown-menu">`);
                let sub_files = await list_file(file.path);
                for (let j = 0; j < sub_files.length; j++) {
                    let sub_file = sub_files[j]
                    html.push(`<li data-sha="${sub_file.sha}" data-type="code"><a>${sub_file.path}</a></li>`);
                    console.log(`github ======${sub_file.path} ${sub_file.sha}========`);
                }
                html.push(`</ul></li>`)
            }
            if (file.type == 'file') {
                html.push(`<li data-sha="${file.sha}" data-type="code"><a>${file.path}</a></li>`);
                console.log(`github: ======${file.path} ${file.sha}========`);
            }
        }
        $('#nav-project').html(html.join(''));
        $('[data-type="code"]').bind('click', function() {
            console.log('github: start download code, sha=' + this.dataset.sha);
            ide.request({
                url: 'https://api.github.com/repos/'+user+'/' + repos + '/git/blobs/' + this.dataset.sha,
                headers: headers
            }).then(res=>{
                let data = JSON.parse(res);
                ide.get_editor().setValue(window.atob(data.content));
                console.log('github download done!');
            }
            );
        });
        console.log(`github: ======menu init success========`);
    }
    // check config options is correct?
    if (get_token() !== null && get_repos() !== null) {
        build_menu();
    } else {
        console.log('github: token and repos must be set!');
    }

    // download big file from github
    async function load_file(sha) {
        console.log('github: start download file, ' + sha)
        let content = await ide.request({
            url: 'https://api.github.com/repos/'+user+'/' + repos + "/git/blobs/" + sha,
            headers: headers
        });
        let data = JSON.parse(content);
        return window.atob(data.content)
    }

    return {
        load_file: load_file
    }
}
)(IDE);