const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
 

  const axios = require("axios");
  
  // ------------Fetching Api Using 3rd Party Api---------------------
  async function cibilScore(req, res) {
    try {
      const { firstName, middleName, lastName, birthDate, gender, idNumber, stateCode, pinCode, telephoneNumber } = req.body;
  
      // Prepare the request body as per the provided structure
      const requestBody = {
        serviceCode: "CAS10001",
        monitoringDate: "08102020",
        consumerInputSubject: {
          tuefHeader: {
            headerType: "TUEF",
            version: "12",
            memberRefNo: "TESTING TUEF IN JSON",
            gstStateCode: "01",
            enquiryMemberUserId: "Member User ID",
            enquiryPassword: "*******",
            enquiryPurpose: "10",
            enquiryAmount: "000049500",
            scoreType: "08",
            outputFormat: "03",
            responseSize: "1",
            ioMedia: "CC",
            authenticationMethod: "L"
          },
          names: [
            {
              index: "N01",
              firstName,
              middleName,
              lastName,
              birthDate,
              gender
            }
          ],
          ids: [
            {
              index: "I01",
              idNumber,
              idType: "03"
            }
          ],
          telephones: [
            {
              index: "T01",
              telephoneNumber,
              telephoneType: "01"
            }
          ],
          addresses: [
            {
              index: "A01",
              line1: "NO 843",
              line2: "KONGU VIBROSTREET TNAGAR",
              stateCode,
              pinCode,
              addressCategory: "01",
              residenceCode: "01"
            }
          ],
          enquiryAccounts: [
            {
              index: "I01",
              accountNumber: ""
            }
          ]
        }
      };
      console.log("cibil request Body" ,requestBody)
      // Make the POST request to the third-party API
      const response = await axios.post(
        'https://api.transunioncibil.com/acquire/credit-assessment/v1/consumer-cir-cv',
        requestBody,
        {
          headers: {
            'apikey': 'l77edbc029b0924d30b32615ff8639b423',
            'member-ref-id': 'NB4088',
            'cust-bu-no': 'GST0001',
            'sub-bu-code': 'A01',
            'cust-ref-id': '1557313',
            'accept': ' application/json',
            'Content-Type': 'application/json'
          }
        }
      );
     console.log("cibil score" ,response.data )
      success(res, "Cibil Score Get", response.data);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }

  async function fetchIDVEfficiency(req, res) {
    try {
      const options = {
        method: 'GET',
        url: 'https://apiuat.cibilhawk.com/fraud-id-management/verification/v1/IDV-efficiency',
        headers: {
          'Clientid': 'NB4088GOIN_UATNUC',
          'Content-Type': 'application/json',
          'client-token': 'db1633c8-e25a-4fbe-8f9d-8bae7f1ecc50',
          'apikey': 'l77edbc029b0924d30b32615ff8639b423',
          'cust-ref-id': '17235683',
          'member-ref-id': 'NB4088',
          'client-secret': '86e1ba520a6648afbe63db543678c50e',
          'sub-bu-code': 'A01',
        //  curl -v --cert-type P12 --cert p12certificatefolder.p12:'Nikit Dwivedi @ 1997' --location --request POST '' --header 'member-ref-id: NB4088 ' --header 'cust-ref-id: 123456' --header 'apikey: l77edbc029b0924d30b32615ff8639b423 ' --header 'Content-Type: application/json' --data ' --header 'client-secrate: 86e1ba520a6648afbe63db543678c50e' --data ''
        },
        data: req.body // Correct assignment
      };
  
      const response = await axios(options);
      console.log("Response Data:", response.data);
      res.status(200).json(response.data); // Send response back to client
    } catch (error) {
      console.error("Error fetching IDV Efficiency:", error);
      res.status(500).json({ error: error }); // Handle error and send response
    }
  }
    
  
  
  module.exports = {
    cibilScore,
    fetchIDVEfficiency,
  };
  