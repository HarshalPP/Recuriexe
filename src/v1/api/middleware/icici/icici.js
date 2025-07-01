import Utility from "./iciciUtility.js";
import CONSTANTS from "./iciciConstants.js";

class SDK {
  initiate({
    txnRefNo = "",
    bankId = "",
    passCode = "",
    mcc = "",
    merchantId = "",
    terminalId = "",
    currency = "",
    encKey = "",
    saltKey = "",
    returnURL = "",
    amount = "",
    orderInfo = "",
    email = "",
    phone = "",
    UDF01 = "",
    UDF02 = "",
    UDF03 = "",
    UDF04 = "",
    UDF05 = "",
    UDF06 = "",
    UDF07 = "",
    UDF08 = "",
    UDF09 = "",
    UDF10 = "",
    firstName = "",
    lastName = "",
    street = "",
    city = "",
    state = "",
    zip = "",
  }) {
    if (!encKey || encKey?.toString()?.trim() == "") {
      return { status: false, message: "Encryption Key is required" };
    }
    if (!saltKey || saltKey?.toString()?.trim() == "") {
      return { status: false, message: "Salt Key is required" };
    }
    if (!merchantId || merchantId?.toString()?.trim() == "") {
      return { status: false, message: "Merchant ID is required" };
    }
    if (!terminalId || terminalId?.toString()?.trim() == "") {
      return { status: false, message: "Terminal ID is required" };
    }
    if (!currency || currency?.toString()?.trim() == "") {
      return { status: false, message: "Currency Code is required" };
    }
    if (
      !amount ||
      typeof amount != "string" ||
      amount?.toString()?.trim() == ""
    ) {
      return { status: false, message: "Amount is required in string format" };
    }
    if (
      !orderInfo ||
      orderInfo?.toString()?.trim() == "" ||
      !orderInfo.match(/^[a-zA-Z0-9]+$/)
    ) {
      return { status: false, message: "Valid Order Info is required" };
    }
    if (
      !email ||
      email?.toString()?.trim() == "" ||
      !email
        ?.toString()
        ?.trim()
        ?.match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
    ) {
      return { status: false, message: "Valid Email Address is required" };
    }
    if (
      !phone ||
      phone?.toString()?.trim() == "" ||
      !phone?.match(/[0-9]{10}/)
    ) {
      return {
        status: false,
        message: "Valid 10 digit Phone Number is required",
      };
    }
    if (!bankId || bankId?.toString()?.trim() == "") {
      return { status: false, message: "Bank ID is required" };
    }
    if (!passCode || passCode?.toString()?.trim() == "") {
      return { status: false, message: "Pass Code is required" };
    }
    if (!mcc || mcc?.toString()?.trim() == "") {
      return { status: false, message: "MCC is required" };
    }
    if (!returnURL || returnURL?.toString()?.trim() == "") {
      return { status: false, message: "Return URL is required" };
    }
    const UDFPattern = /^[a-zA-Z0-9 ,/?:@&=+$_.!~*')(#;}{[\]<>-]+$/;
    if (UDF01 && !UDFPattern.test(UDF01)) {
      return { status: false, message: "UDF01 has invalid value" };
    }
    if (UDF02 && !UDFPattern.test(UDF02)) {
      return { status: false, message: "UDF02 has invalid value" };
    }
    if (UDF03 && !UDFPattern.test(UDF03)) {
      return { status: false, message: "UDF03 has invalid value" };
    }
    if (UDF04 && !UDFPattern.test(UDF04)) {
      return { status: false, message: "UDF04 has invalid value" };
    }
    if (UDF05 && !UDFPattern.test(UDF05)) {
      return { status: false, message: "UDF05 has invalid value" };
    }
    if (UDF06 && !UDFPattern.test(UDF06)) {
      return { status: false, message: "UDF06 has invalid value" };
    }
    if (UDF07 && !UDFPattern.test(UDF07)) {
      return { status: false, message: "UDF07 has invalid value" };
    }
    if (UDF08 && !UDFPattern.test(UDF08)) {
      return { status: false, message: "UDF08 has invalid value" };
    }
    if (UDF09 && !UDFPattern.test(UDF09)) {
      return { status: false, message: "UDF09 has invalid value" };
    }
    if (UDF10 && !UDFPattern.test(UDF10)) {
      return { status: false, message: "UDF10 has invalid value" };
    }

    const version = CONSTANTS.VERSION;
    // const txnRefNo = "ORD" + Math.floor(100000 + Math.random() * 900000).toString();
    const txnType = "Pay";

    const utility = new Utility();

    const EncKey = encKey;
    const SECURE_SECRET = saltKey;
    const gatewayURL = CONSTANTS.GATEWAYURL;

    let data = {
      Version: version,
      PassCode: passCode,
      BankId: bankId,
      MerchantId: merchantId,
      MCC: mcc,
      TerminalId: terminalId,
      ReturnURL: returnURL,
      Amount: parseFloat(amount) * 100,
      TxnRefNo: txnRefNo,
      Currency: currency,
      TxnType: txnType,
      OrderInfo: orderInfo,
      Email: email,
      Phone: phone,
      UDF01: UDF01,
      UDF02: UDF02,
      UDF03: UDF03,
      UDF04: UDF04,
      UDF05: UDF05,
      UDF06: UDF06,
      UDF07: UDF07,
      UDF08: UDF08,
      UDF09: UDF09,
      UDF10: UDF10,
      City: firstName,
      FirstName: lastName,
      LastName: street,
      State: city,
      Street: state,
      ZIP: zip,
    };


    data = Object.fromEntries(Object.entries(data).sort());

    let dataToPostToPG = "";

    Object.keys(data).forEach((key) => {
      let value = data[key];
      if (value) {
        dataToPostToPG += key + "||" + value + "::";
      }
    });

    //Generate Secure hash on parameters
    const SecureHash = utility.generateSecurehash(data, SECURE_SECRET);
    //Appending hash and data with ::
    dataToPostToPG = `SecureHash||${encodeURIComponent(
      SecureHash
    )}::${dataToPostToPG}`;
    //Removing last 2 characters (::)
    dataToPostToPG = dataToPostToPG.slice(0, -2);

    const EncData = utility.encrypt(dataToPostToPG, EncKey);

    return {
      status: true,
      data: { gatewayURL, EncData, data, SecureHash },
    };
  }

  checkResponse({ encKey, saltKey, paymentResponse }) {

    if (!encKey || encKey.trim() == "") {
      return { status: false, message: "Encryption Key is required" };
    }
    if (!saltKey || saltKey.trim() == "") {
      return { status: false, message: "Salt Key is required" };
    }
    if (!paymentResponse || paymentResponse?.trim() == "") {
      return { status: false, message: "Payment Response is required" };
    }

    const utility = new Utility();

    const EncKey = encKey;
    const SECURE_SECRET = saltKey;

    const decodedPaymentResponse = decodeURIComponent(paymentResponse);

    if (!decodedPaymentResponse) {
      return { status: false, message: "Invalid data" };
    }

    const jsonData = JSON.parse(decodedPaymentResponse);
    const EncData = jsonData["EncData"] || "";
    const merchantId = jsonData["MerchantId"] || "";
    const bankID = jsonData["BankId"] || "";
    const terminalId = jsonData["TerminalId"] || "";

    if (
      bankID?.trim() == "" ||
      merchantId?.trim() == "" ||
      terminalId?.trim() == "" ||
      EncData?.trim() == ""
    ) {
      return { status: false, message: "Invalid data" };
    }

    const fomattedEncData = EncData?.replace(/ /g, "+");
    const data = utility.decrypt(fomattedEncData, EncKey);

    const dataArray = data?.split("::");

    let dataFromPostFromPG = {};

    for (const value of dataArray) {
      const valueSplit = value.split("||");
      dataFromPostFromPG[valueSplit[0]] = decodeURIComponent(valueSplit[1]);
    }

    const SecureHash = dataFromPostFromPG["SecureHash"];

    delete dataFromPostFromPG.SecureHash;

    const abc = Object.fromEntries(
      Object.entries(dataFromPostFromPG).filter(([key, value]) => value)
    );

    // const sortedAbc = Object.fromEntries(
    //   Object.entries(abc).sort((a, b) => a[0].localeCompare(b[0]))
    // );

    let sortedAbc = Object.keys(abc)
      .sort()
      .reduce((acc, key) => {
        acc[key] = abc[key];
        return acc;
      }, {});

    const secureHashFinal = utility
      .generateSecurehash(sortedAbc, SECURE_SECRET)
      .toUpperCase();

    let hashValidated = "Invalid Hash";

    if (secureHashFinal === SecureHash) {
      return {
        status: true,
        data: { ...sortedAbc, Amount: parseInt(dataFromPostFromPG.Amount) / 100 },
      };
    } else {
      return { status: false, message: hashValidated };
    }
  }

  async getPaymentStatus({
    encKey = "",
    saltKey = "",
    bankId = "",
    passCode = "",
    txnRefNo = "",
    merchantId = "",
    terminalId = "",
  }) {
    if (!encKey || encKey?.toString()?.trim() == "") {
      return { status: false, message: "Encryption Key is required" };
    }
    if (!saltKey || saltKey?.toString()?.trim() == "") {
      return { status: false, message: "Salt Key is required" };
    }
    if (!bankId || bankId?.toString()?.trim() == "") {
      return { status: false, message: "Bank ID is required" };
    }
    if (!passCode || passCode?.toString()?.trim() == "") {
      return { status: false, message: "Pass Code is required" };
    }
    if (!merchantId || merchantId?.toString()?.trim() == "") {
      return { status: false, message: "Merchant ID is required" };
    }
    if (!terminalId || terminalId?.toString()?.trim() == "") {
      return { status: false, message: "Terminal ID is required" };
    }
    if (!txnRefNo || txnRefNo?.toString()?.trim() == "") {
      return { status: false, message: "Txn Ref No. is required" };
    }

    const utility = new Utility();

    let data = {};

    const SECURE_SECRET = saltKey;
    const statusURL = CONSTANTS.STATUSURL;

    /* Arrange the values in following order to generate hash */
    data.BankId = bankId;
    data.MerchantId = merchantId;
    data.PassCode = passCode;
    data.TerminalId = terminalId;
    data.TxnRefNo = txnRefNo;
    data.TxnType = "Pay";

    const SecureHash = utility.generateSecurehash(data, SECURE_SECRET);
    const shArr = { SecureHash: SecureHash.toUpperCase() };
    let postData = { ...shArr, ...data };

    const postDataEncode = JSON.stringify(postData);

    try {
      const response = await fetch(statusURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "Path=/rbac-service",
        },
        body: postDataEncode,
      });


      const responseArray = await response.json();

      if (responseArray) {
        const rA = Object.fromEntries(
          Object.entries(responseArray).filter(([key, value]) => value)
        );
        return { status: true, data: responseArray };
      } else {
        return { status: false, message: "Invalid Payment" };
      }
    } catch (error) {
      return { status: false, message: "Something went wrong!" };
    }
  }

  async initiateRefund({
    encKey = "",
    saltKey = "",
    bankId = "",
    passCode = "",
    merchantId = "",
    terminalId = "",
    txnRefNo = "",
    retRefNo = "",
    refundAmount = "",
  }) {
    if (!encKey || encKey?.toString()?.trim() == "") {
      return { status: false, message: "Encryption Key is required" };
    }
    if (!saltKey || saltKey?.toString()?.trim() == "") {
      return { status: false, message: "Salt Key is required" };
    }
    if (!bankId || bankId?.toString()?.trim() == "") {
      return { status: false, message: "Bank ID is required" };
    }
    if (!passCode || passCode?.toString()?.trim() == "") {
      return { status: false, message: "Pass Code is required" };
    }
    if (!merchantId || merchantId?.toString()?.trim() == "") {
      return { status: false, message: "Merchant ID is required" };
    }
    if (!terminalId || terminalId?.toString()?.trim() == "") {
      return { status: false, message: "Terminal ID is required" };
    }
    if (!txnRefNo || txnRefNo?.toString()?.trim() == "") {
      return { status: false, message: "Txn Ref No. is required" };
    }
    if (!retRefNo || retRefNo?.toString()?.trim() == "") {
      return { status: false, message: "RetRef No. is required" };
    }
    if (!refundAmount || typeof refundAmount != "string" || refundAmount?.toString()?.trim() == "" || parseInt(refundAmount) < 1) {
      return { status: false, message: "Refund Amount is required. Amount should be minimum 1" };
    }

    const utility = new Utility();

    const EncKey = encKey;
    const SECURE_SECRET = saltKey;
    const refundURL = CONSTANTS.REFUNDURL;

    let data = {};

    /* Arrange the values in following order to generate hash */
    data.BankId = bankId;
    data.MerchantId = merchantId;
    data.PassCode = passCode;
    let refund_amount = parseInt(refundAmount) * 100;
    data.RefCancelId = Math.floor(new Date().getTime() / 1000).toString() + txnRefNo;
    data.RefundAmount = refund_amount.toString();
    data.RetRefNo = retRefNo;
    data.TerminalId = terminalId;
    data.TxnRefNo = txnRefNo;
    data.TxnType = 'Refund';

    const SecureHash = utility.generateSecurehash(data, SECURE_SECRET);
    const shArr = { SecureHash: SecureHash.toUpperCase() };
    let postData = { ...shArr, ...data };

    let sortedAbc = Object.keys(postData)
      .sort()
      .reduce((acc, key) => {
        acc[key] = postData[key];
        return acc;
      }, {});

    const postDataEncode = JSON.stringify(sortedAbc);

    try {
      const response = await fetch(refundURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "Path=/rbac-service",
        },
        body: postDataEncode,
      });

      const responseArray = await response.json();

      if (responseArray) {
        return { status: true, data: {...responseArray, RefundAmount: responseArray?.RefundAmount / 100} };
      } else {
        return { status: false, message: "Invalid Payment" };
      }
    } catch (error) {
      return { status: false, message: "Something went wrong!" };
    }
  }

  async getRefundStatus({
    encKey = "",
    saltKey = "",
    bankId = "",
    passCode = "",
    merchantId = "",
    terminalId = "",
    refCancelId = "",
    txnRefNo = "",
  }) {
    if (!encKey || encKey?.toString()?.trim() == "") {
      return { status: false, message: "Encryption Key is required" };
    }
    if (!saltKey || saltKey?.toString()?.trim() == "") {
      return { status: false, message: "Salt Key is required" };
    }
    if (!bankId || bankId?.toString()?.trim() == "") {
      return { status: false, message: "Bank ID is required" };
    }
    if (!passCode || passCode?.toString()?.trim() == "") {
      return { status: false, message: "Pass Code is required" };
    }
    if (!merchantId || merchantId?.toString()?.trim() == "") {
      return { status: false, message: "Merchant ID is required" };
    }
    if (!terminalId || terminalId?.toString()?.trim() == "") {
      return { status: false, message: "Terminal ID is required" };
    }
    if (!refCancelId || refCancelId?.toString()?.trim() == "") {
      return { status: false, message: "RefCancelId is required" };
    }
    if (!txnRefNo || txnRefNo?.toString()?.trim() == "") {
      return { status: false, message: "TxnRefNo is required" };
    }

    const utility = new Utility();

    let data = {};

    const SECURE_SECRET = saltKey;
    const statusURL = CONSTANTS.STATUSURL;

    /* Arrange the values in following order to generate hash */
    data.BankId = bankId;
    data.MerchantId = merchantId;
    data.PassCode = passCode;
    data.RefCancelId = refCancelId;
    data.TerminalId = terminalId;
    data.TxnRefNo = txnRefNo;
    data.TxnType = "Refund";

    const SecureHash = utility.generateSecurehash(data, SECURE_SECRET);
    const shArr = { SecureHash: SecureHash.toUpperCase() };
    let postData = { ...shArr, ...data };

    const postDataEncode = JSON.stringify(postData);

    try {
      const response = await fetch(statusURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "Path=/rbac-service",
        },
        body: postDataEncode,
      });

      const responseArray = await response.json();

      if (responseArray) {
        return { status: true, data: {...responseArray} };
      } else {
        return { status: false, message: "Invalid Payment" };
      }
    } catch (error) {
      return { status: false, message: "Something went wrong!" };
    }
  }
}
const sdk = new SDK();
export default sdk;


