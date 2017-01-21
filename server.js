const express = require('express');
const Cookie = require('./Cookie.js');
const https = require('https');
const fs = require('fs');
const resolveOAuth2 = require('./resolveOAuth2');

const config = require('./config/config.json');
const url = require('url');

config.hostUrl = url.parse(config.hostUrl);

const forge = require('node-forge');
const createCertificate = function() {
	var oneDay = (1000 * 60 * 60 * 24);
	var keys = forge.pki.rsa.generateKeyPair(1024);
	var cert = forge.pki.createCertificate();
	cert.publicKey = keys.publicKey;
	cert.validity.notBefore = new Date(new Date().getTime() - oneDay);
	cert.validity.notAfter = new Date(new Date().getTime() + oneDay);

	cert.sign(keys.privateKey);
	return {
		cert: forge.pki.certificateToPem(cert),
		privateKey: forge.pki.privateKeyToPem(keys.privateKey)
	};
};
var ssl = createCertificate();

var app = express();

app.use(function(req, res, next) {
	var cookies = req.header('Cookie');

	var cookieManager = new Cookie(cookies, {
		'Path': '/',
		'HttpOnly': true,
		'Secure': true
	});
	req.cookies = res.cookies = cookieManager;

	next();
});

var OAuth2LoginUrls = [];
config.OAuth2.forEach(function(row) {
	var oauth2Endpoint = '/auth/oauth2/' + row.name;

	var loginRedirectUrl = url.parse(config.hostUrl);
	loginRedirectUrl.path = '';
	loginRedirectUrl.pathname += oauth2Endpoint;
	
	var loginUrl = url.parse(row.aquireCodeUrlPath, true);
	loginUrl.path = '';
	loginUrl.query.client_id = row.clientId;
	loginUrl.query.redirect_uri = url.format(loginRedirectUrl);

	OAuth2LoginUrls.push({
		name: row.name,
		url: url.format(loginUrl)
	});

	app.get(oauth2Endpoint, function(req, res) {
		var code = req.query.code;
		if (!code) {
			res.end('bad request');
		}
		try {
			resolveOAuth2(row).then(function(userId) {
				res.end(JSON.stringify(userId));
			});
		} catch (e) {
			res.end('failed');
		}
	});

});

app.get('/auth', function(req, res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	res.end(JSON.stringify(OAuth2LoginUrls));
});

app.get('/get', function (req, res) {
	var cookieData1 = res.cookies.get('foo');
	var cookieData2 = res.cookies.get('bar');
	res.send('Got!: ' + cookieData1 + ' & ' + cookieData2);
});

app.get('/set', function (req, res) {
	res.cookies.set('foo', Date.now(), {'Domain': 'localhost'});
	res.cookies.set('bar', Date.now() / 2);
	res.setHeader('Set-Cookie', res.cookies.toHeaders());

	res.send('Changed');
});

app.use(express.static('public'))

https.createServer({
	key: ssl.privateKey,
	cert: ssl.cert
}, app).listen(config.hostUrl.port);
