Context.github = (function(ide){

	function get_token() {
		return window.localStorage.getItem('github-token');
	}

	function get_repos() {
		return window.localStorage.getItem('github-repos');
	}

	let headers = {
		"Authorization": "Basic " + btoa("token:" + get_token())
	};

	let repos = get_repos();

	// list file by github api
	async function list_file(path) {
		let res = await ide.request({url: 'https://api.github.com/repos/sweetoranges/'+repos+'/contents/' + path,headers: headers})
		let items = JSON.parse(res);
		return items;
	}

	// list file name from repos and build menu
	async function build_menu() {
		ide.log(`======menu init start========`);
		$('#nav-project').html('<li class="dropdown-submenu"><a href="#">loading</a></li>');
		let files = await list_file('');
		var html = [];
		// use await... so do not use forEach
		for(let i = 0; i < files.length; i++) {
			let file = files[i];
			if (file.type == 'dir') {
				html.push(`<li class="dropdown-submenu"><a href="#">${file.path}</a><ul class="dropdown-menu">`);
				let sub_files = await list_file(file.path);
				for(let j = 0; j < sub_files.length; j++) {
					let sub_file = sub_files[j]
					html.push(`<li data-sha="${sub_file.sha}" data-type="code"><a>${sub_file.path}</a></li>`);
					ide.log(`======${sub_file.path} ${sub_file.sha}========`);
				}
				html.push(`</ul></li>`)
			}
			if (file.type == 'file') {
				html.push(`<li data-sha="${file.sha}" data-type="code"><a>${file.path}</a></li>`);
				ide.log(`======${file.path} ${file.sha}========`);
			}
		}
		$('#nav-project').html(html.join(''));
		$('[data-type="code"]').bind('click', function (){
			ide.log('start download code, sha=' + this.dataset.sha);
			ide.request({url: 'https://api.github.com/repos/sweetoranges/'+repos+'/git/blobs/' + this.dataset.sha, headers: headers}).then(res => {
				let data = JSON.parse(res);
				ide.get_editor().setValue(window.atob(data.content));
				ide.log('download done!');
			});
		});
		ide.log(`======menu init success========`);
	}
	// check config options is correct?
	if (get_token() !== null && get_repos() !== null) {
		build_menu();
	} else {
		ide.log('token and repos must be set!');
	}

	// download big file from github
	async function load_file(sha){
		ide.log('start download file, ' + sha)
		let content = await ide.request({url: 'https://api.github.com/repos/sweetoranges/' + repos + "/git/blobs/" + sha, headers: headers});
		let data = JSON.parse(content);
		return window.atob(data.content)
	}

	return {
		load_file: load_file
	}
})(IDE);