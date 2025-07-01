import CryptoJS from "crypto-js";

export default class Utility {
  encrypt(input, key) {
    const cipher = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(input),
      CryptoJS.enc.Utf8.parse(key),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return cipher.toString();
  }

  decrypt(sStr, key) {
    const decrypted = CryptoJS.AES.decrypt(
      sStr,
      CryptoJS.enc.Utf8.parse(key),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  generateSecurehash(sortedData, secret) {
    let secureHash = secret;
    for (const val of Object.values(sortedData || {})) secureHash += val;
    return CryptoJS.SHA256(CryptoJS.enc.Utf8.parse(secureHash))
      .toString(CryptoJS.enc.Hex);
  }

  null2unknown(key, obj) {
    return obj[key] || "No Value Returned";
  }
}
