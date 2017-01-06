
const cryptoAlgorithm = 'RC4';
const cryptoPassword = 'foobar';
/* Cypher Algorithms
aes192
RC4
*/
var crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

const encode = function(data) {
	const cipher = crypto.createCipher(cryptoAlgorithm, cryptoPassword);
	return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};

const decode = function(data) {
	const decipher = crypto.createDecipher(cryptoAlgorithm, cryptoPassword);
	return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
};
