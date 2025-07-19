const {
    success,
    unknownError,
    serverValidation,
    badRequest,
} = require("../../../../globalHelper/response.globalHelper");

const { validationResult } = require("express-validator");

const axios = require("axios")
const path = require('path');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto');
const cibil_api_key = process.env.CIBIL_API_KEY
const cibil_member_ref = process.env.CIBIL_MEMBER_REF
const cibil_cust_ref = process.env.CIBIL_CUSTOMER_REF
const client_secret = process.env.CLIENT_SECRET
const password = process.env.CIBIL_PASSWORD

async function fetchCibilScore(cibil_request_body) {
    try {
        const cert = fs.readFileSync('./certificateProd.pem');
        const httpsAgent = new https.Agent({
            cert: cert,
            key: cert
        });
        let { idNumber, idType, firstName, lastName, birthDate, gender, stateCode, pinCode, line1, line2, telephoneNumber, line3, line4, line5 } = cibil_request_body;


        // const url = 'https://apiuat.cibilhawk.com/acquire/credit-assessment/v1/consumer-cir-cv'
           const url = 'https://api.transunioncibil.com/acquire/credit-assessment/v1/consumer-cir-cv'
        const headers = {
            'accept': '*/*',
            'apikey': cibil_api_key,
            'member-ref-id': cibil_member_ref,
            'cust-ref-id': cibil_cust_ref,
            'client-secret':client_secret,
            'Content-Type': 'application/json'
            
        };
        const body = {
            "serviceCode": "CN1CAS0011",
            "monitoringDate": "26082024",
            "consumerInputSubject": {
                "tuefHeader": {
                    "headerType": "TUEF",
                    "version": "12",
                    "memberRefNo": "NB4088",
                    "gstStateCode": "06",
                    "enquiryMemberUserId": "NB40889798_CIRC2CNPE",
                    "enquiryPassword": password,
                    "enquiryPurpose": "08",
                    "enquiryAmount": "000049500",
                    "scoreType": "08",
                    "outputFormat": "03",
                    "responseSize": "1",
                    "ioMedia": "CC",
                    "authenticationMethod": "L"
                },
                "names": [
                    {
                        "index": "N01",
                        firstName,
                        lastName,
                        birthDate,
                        gender
                    }
                ],
                "ids": [
                    {
                        "index": "I01",
                        "idNumber": idNumber,
                        "idType": idType
                    }
                ],
                "telephones": [
                    {
                        "index": "T01",
                        telephoneNumber,
                        "telephoneType": "01"
                    }
                ],
                "addresses": [
                    {
                        "index": "A01",
                        "line1": line1,
                        "line2": line2,
                        "line3": line3,
                        "line4": line4,
                        "line5": line5,
                        stateCode,
                        pinCode,
                        "addressCategory": "02"
                    }
                ],
                "enquiryAccounts": [
                    {
                        "index": "I01",
                        "accountNumber": "144"
                    }
                ]
            }
        }
        console.log("=================cibil console=======================")
        console.dir(body, {depth:null})
        console.log("===================cibil console=====================")
        const response = await axios.post(url, body, {
            headers: headers,
            httpsAgent: httpsAgent
        });
        return response.data

    } catch (err) {
        console.log(err);

        return { message: err }
    }
}

async function cibilGetDataTest(req, res) {
    try {
        const { type } = req.body
        let data
        let cibil_json = {
            idNumber: "EQYPD2896B",
            idType: "01",
            firstName: "Nikit",
            lastName:"Dwivedi",
            birthDate: "23071997",
            gender: "2",
            stateCode: "23",
            pinCode: "452010",
            line1: "sapphire 101",
            line2: "sai nest R-65",
            line3: "mahalaxmi nagar",
            line4: "indore vijay nagar",
            line5: "madhya pradesh",
            telephoneNumber: "",
        }
  
        if (!cibil_json.stateCode) {
            return badRequest(res, `${type}'s state is not valid`)
        }
        fs.writeFile(path.resolve(__dirname, './cibilScore_request.txt'), JSON.stringify(cibil_json), 'utf8', (err) => {
          if (err) {
              console.error('An error occurred while writing to the file:', err);
              return;
          }
          console.log('File written successfully!');
      });
        let cibil_response = await fetchCibilScore(cibil_json)
        fs.writeFile(path.resolve(__dirname, './cibilScore_response.txt'), JSON.stringify(cibil_response), 'utf8', (err) => {
          if (err) {
              console.error('An error occurred while writing to the file:', err);
              return;
          }
          console.log('File written successfully!');
      });
      return success(res, "done",  cibil_response)
    } catch (error) {
        console.log(error);
  
        return unknownError(res, error);
    }
  }

module.exports = {
    fetchCibilScore,
    cibilGetDataTest
}