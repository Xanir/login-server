
var capKeys = function(obj) {
	var normalized = {};
	if (obj && typeof obj === 'object') {
		Object.keys(obj).forEach(function(key) {
			normalized[key.toUpperCase()] = obj[key];
		});
	}

	return normalized;
};

var Cookie = function(cookie, params) {
	var self = this;
	self._crumbChanges = {};
	self._crumbs = {};
	self._defaultParams = capKeys(params);

	if (cookie) {
		if (typeof cookie !== 'string') {
			throw 'decoded cookie must be a string';
		}

		var cookieCrumbs = cookie.split(';');
		cookieCrumbs.forEach(function(crumb) {
			crumb = crumb.trim();
			var keyValue = self._crumbSplitRegex.exec(crumb);
			self._crumbs[keyValue[1]] = keyValue[2];
		});
	}
}
Cookie.prototype._crumbSplitRegex = /(.*?)=(.*)/;
Cookie.prototype.get = function(key) {
	return this._crumbs[key];
};
Cookie.prototype.set = function(key, value, params) {
	params = capKeys(params);

	var self = this;
	self._crumbChanges[key] = {
		value: value,
		params: Object.assign({}, self._defaultParams, params)
	};
};

Cookie.prototype._standardHeaders = Object.freeze([
	'Expires',
	'Max-Age',
	'Domain',
	'Path'
]);

Cookie.prototype.toHeaders = function() {
	var self = this;
	return Object.keys(self._crumbChanges).map(function(key) {
		var crumbData = self._crumbChanges[key];

		var headerData = [];
		headerData.push(key + '=' + crumbData.value);

		self._standardHeaders.forEach(function(headerName) {
			var value = crumbData.params[headerName.toUpperCase()];
			if (value) {
				headerData.push(headerName + '=' + value);
			}
		});

		if (crumbData.params['Secure'.toUpperCase()] === true) {
			headerData.push('Secure');
		}
		if (crumbData.params['HttpOnly'.toUpperCase()] === true) {
			headerData.push('HttpOnly');
		}

		headerData.push('');
		return headerData.join('; ');
	});
};

module.exports = Cookie;
