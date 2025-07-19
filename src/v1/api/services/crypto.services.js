const crypto = require('crypto');

// Encrypt function for E-Nach //
const encrypt = (inputString, key) => {
  // let id = "e73c89df39e86615cf855c235aee5bf9af73d0c10dca150cfe9165871ad3a6b6";
  let id = "c18e94848068900c82d68688431d5f01303b003a564ddf2251999e982e3d8d16";
  let iv = crypto.randomBytes(16);  
  let hash = crypto.createHash('sha256').update(key).digest(); 
  let hashstring = hash.toString('hex');
  hashstring = hashstring.substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', hashstring, iv);
  let encrypted = cipher.update(inputString, 'utf8', 'base64') + cipher.final('base64');
  encrypted = encrypted.split('+').join('-').split('/').join('_');
  console.log('Iv:', iv.toString('hex'));
  return id + '.' + iv.toString('hex') + '.' + encrypted;
};

// Decrypt function for E-Nach //
const decrypt = (encryptedText, key, ivHex) => {
  console.log('Starting decryption...');
  console.log('IV:', ivHex);
  console.log('Encrypted Data:', encryptedText);
  console.log('Key:', key);

 let hash = crypto.createHash('sha256').update(key).digest();  
 let hashstring = hash.toString('hex');
 hashstring = hashstring.substring(0, 32);
 iv = Buffer.from(ivHex, 'hex');
 encryptdata=encryptedText.split('-').join('+').split('_').join('/');
 let decipher = crypto.createDecipheriv('aes-256-cbc', hashstring, iv);
 let Decrypted = decipher.update(encryptdata, 'base64', 'utf8') + decipher.final('utf8');
  return Decrypted;

};


module.exports = { encrypt, decrypt };
