
const http = require('https');
var promisedHTTP = function() {};

promisedHTTP.prototype.get = function(url) {
	return new Promise((resolve, reject) => {
		http.get(url, function(response) {
			if (response.statusCode !== 200) {
				// consume response data to free up memory
				//response.resume();
				//reject();
				let rawData = '';
				response.on('data', (chunk) => rawData += chunk);
				response.on('end', () => {
					try {
					let parsedData = JSON.parse(rawData);
					console.log(rawData)
						resolve(parsedData);
					} catch (e) {
						reject();
					}
				});
			} else {
				response.setEncoding('utf8');
				let rawData = '';
				response.on('data', (chunk) => rawData += chunk);
				response.on('end', () => {
					try {
					let parsedData = JSON.parse(rawData);
						resolve(parsedData);
					} catch (e) {
						reject();
					}
				});
			}
		});

	});
};

module.exports = new promisedHTTP();