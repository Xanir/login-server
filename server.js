const express = require('express');
const Cookie = require('./cookies.js');
const https = require('https');
const fs = require('fs');

var app = express()

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

https.createServer({
	key: fs.readFileSync('./localhost.key'),
	cert: fs.readFileSync('./localhost.crt')
}, app).listen(9090);
