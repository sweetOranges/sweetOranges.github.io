Context.transform = {};
Context.transform = (function(ide){
	function json(raw) {
		return JSON.parse(raw);
	}

	function csv(raw) {
		var lines = raw.split("\n");
		var header = lines.shift().split(",");
		return lines.reduce(function(acc, line) {
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
		}, []);
		return ret;
	}

	return {
		csv: csv,
		json: json
	}
})(IDE);
