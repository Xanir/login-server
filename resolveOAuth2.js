
var url = require('url');
var promisedHTTP = require('./promisedHTTP');

var OAuth2 = async function(config, redirectURI, code) {

	var resolveToTokenURL = function() {
		var urlObj = url.parse(config.baseUrl, true);
		urlObj.path = '';
		urlObj.pathname += config.aquireTokenUrlPath;
		urlObj.query.redirect_uri = redirectURI;
		urlObj.query.client_id = config.clientId;
		urlObj.query.client_secret = config.clientSecret;
		urlObj.query.code = code;

		return url.format(urlObj);
	};
	var resolveToIdUrl = function(token) {
		var urlObj = url.parse(config.baseUrl, true);
		urlObj.path = '';
		urlObj.pathname += config.aquireIdUrlPath;
		urlObj.query.access_token = token;

		return url.format(urlObj);
	};

	var userId = null;
	var urlGetToken = resolveToTokenURL();
	try {
		var httpTokenBody = await promisedHTTP.get(urlGetToken);
		var urlGetId = resolveToIdUrl(httpTokenBody.access_token);
		var httpIdBody = await promisedHTTP.get(urlGetId);
		userId = httpIdBody[config.aquireIdObjPath];
	} catch (e) {
		throw 'login failed';
	}

	return userId;
};

module.exports = OAuth2;