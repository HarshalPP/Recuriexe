const {
  success,
  unknownError,
  serverValidation,
  badRequest,
  notFound,
  parseJwt,
  badRequestwitherror
} = require("../../../../globalHelper/response.globalHelper");
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const finalModel = require("../model/finalSanction/finalSnction.model.js");
const customerModel = require("../model/customer.model");
const https = require("https");
const { v4: uuidv4 } = require('uuid');
const { default: axios } = require("axios")
const path = require("path");
const { PDFDocument } = require('pdf-lib')

const signzyFunction = async (req,res,links,customerId) =>{
    try{
            // console.log(links,customerId,"links,customerId")
            const customerData = await customerModel.findOne({ _id: customerId })
            const applicantData = await applicantModel.findOne({ customerId })
            const coAppData = await coApplicantModel.find({ customerId })
            const guarantorData = await guarantorModel.findOne({ customerId })
            const finalData = await finalModel.findOne({ customerId })

            let invitees
            if (finalData && finalData.pdfSelection == "acg" || finalData.pdfSelection.toUpperCase() == "ACG") {
                invitees = [
                    {
                        signerName: applicantData?.fullName,
                        signerMobile: applicantData?.mobileNo ? String(applicantData.mobileNo) : '',
                        signerEmail: applicantData?.email,
                        signerGender: applicantData?.gender,
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            signaturePosition: ["BOTTOMLEFT"]
                          }
                        ]
                },
                {
                    signerName: coAppData[0]?.fullName,
                    signerMobile:   coAppData[0]?.mobileNo ? String(coAppData[0]?.mobileNo) : '',
                    signerEmail:  coAppData[0]?.email?.toLowerCase(),
                    signerGender: coAppData[0]?.gender,
                    // uidLastFourDigits: "",
                    // pincode: "",
                    // signerYearOfBirth: "",
                    // signerUniqueId: "",
                    signatureType: "AADHAARESIGN-OTP",
                    cancelBySigner: true,
                    // digitalConsent: {
                    //   consentData: [
                    //     { text: "I confirm that I have opted for debit card", required: false },
                    //     { text: "I agree to comply with applicable laws", required: true }
                    //   ],
                    //   // consentHeading: "Terms & Conditions"
                    // },
                    additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                    postVerification: ["OTP"],
                    // timer: 5,
                    // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                    signatures: [
                      {
                        pageNo: ["All"],
                        signaturePosition: ["BOTTOMCENTER"]
                      }
                    ]
                },
                  {
                    signerName: guarantorData?.fullName,
                    signerMobile:   guarantorData?.mobileNo ? String(guarantorData?.mobileNo) : '',
                    signerEmail:  guarantorData?.email?.toLowerCase(),
                    signerGender: guarantorData?.gender,
                    // uidLastFourDigits: "",
                    // pincode: "",
                    // signerYearOfBirth: "",
                    // signerUniqueId: "",
                    signatureType: "AADHAARESIGN-OTP",
                    cancelBySigner: true,
                    // digitalConsent: {
                    //   consentData: [
                    //     { text: "I confirm that I have opted for debit card", required: false },
                    //     { text: "I agree to comply with applicable laws", required: true }
                    //   ],
                    //   // consentHeading: "Terms & Conditions"
                    // },
                    additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                    postVerification: ["OTP"],
                    // timer: 5,
                    // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                    signatures: [
                      {
                        pageNo: ["All"],
                        signaturePosition: ["BOTTOMRIGHT"]
                      }
                    ]
                  },
                 ]
                 }
               if (finalData && finalData.pdfSelection == "ac" || finalData.pdfSelection.toUpperCase() == "AC") {
                    invitees = [
                            {
                                signerName: applicantData?.fullName,
                                signerMobile: applicantData?.mobileNo ? String(applicantData.mobileNo) : '',
                                signerEmail: applicantData?.email,
                                signerGender: applicantData?.gender,
                                signatureType: "AADHAARESIGN-OTP",
                                cancelBySigner: true,
                                // digitalConsent: {
                                //   consentData: [
                                //     { text: "I confirm that I have opted for debit card", required: false },
                                //     { text: "I agree to comply with applicable laws", required: true }
                                //   ],
                                //   // consentHeading: "Terms & Conditions"
                                // },
                                additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                                postVerification: ["OTP"],
                                signatures: [
                                  {
                                    pageNo: ["All"],
                                    signaturePosition: ["BottomLeft"]
                                  }
                                ]
                              },
                        {
                            signerName: coAppData[0]?.fullName,
                            signerMobile:   coAppData[0]?.mobileNo ? String(coAppData[0]?.mobileNo) : '',
                            signerEmail:  coAppData[0]?.email?.toLowerCase(),
                            signerGender: coAppData[0]?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                signaturePosition: ["BottomRight"]
                              }
                            ]
                          },
                    ]
                }

                if (finalData && finalData.pdfSelection == "acc" || finalData.pdfSelection.toUpperCase() == "ACC") {
                    invitees = [
                        {
                            signerName: applicantData?.fullName,
                            signerMobile: applicantData?.mobileNo ? String(applicantData.mobileNo) : '',
                            signerEmail: applicantData?.email,
                            signerGender: applicantData?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                signaturePosition: ["BOTTOMLEFT"]
                              }
                            ]
                    },
                    {
                        signerName: coAppData[0]?.fullName,
                        signerMobile:   coAppData[0]?.mobileNo ? String(coAppData[0]?.mobileNo) : '',
                        signerEmail:  coAppData[0]?.email?.toLowerCase(),
                        signerGender: coAppData[0]?.gender,
                        // signerGender: "male",
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            signaturePosition: ["BOTTOMCENTER"]
                          }
                        ]
                    },
                      {
                        signerName: coAppData[1]?.fullName,
                        signerMobile:   coAppData[1]?.mobileNo ? String(coAppData[1]?.mobileNo) : '',
                        signerEmail:  coAppData[1]?.email?.toLowerCase(),
                        signerGender: coAppData[1]?.gender,
                        // signerGender: "male",
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            signaturePosition: ["BOTTOMRIGHT"]
                          }
                        ]
                      },
                ]
                }

                  if (finalData && finalData.pdfSelection == "accg" || finalData.pdfSelection.toUpperCase() == "ACCG") {

                    invitees = [
                        {
                            signerName: applicantData?.fullName,
                            signerMobile: applicantData?.mobileNo ? String(applicantData.mobileNo) : '',
                            signerEmail: applicantData?.email,
                            signerGender: applicantData?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                "signaturePosition": [
                                    "customize"
                                ],
                                "xCoordinate": [
                                    50
                                ],
                                "yCoordinate": [
                                    50
                                ]
                              }
                            ]
                    },
                    {
                        signerName: coAppData[0]?.fullName,
                        signerMobile:   coAppData[0]?.mobileNo ? String(coAppData[0]?.mobileNo) : '',
                        signerEmail:  coAppData[0]?.email?.toLowerCase(),
                        signerGender: coAppData[0]?.gender,
                        // signerGender: "male",
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            "signaturePosition": [
                                "customize"
                            ],
                            "xCoordinate": [
                                170
                            ],
                            "yCoordinate": [
                                50
                            ]
                          }
                        ]
                    },
                      {
                        signerName: coAppData[1]?.fullName,
                        signerMobile:   coAppData[1]?.mobileNo ? String(coAppData[1]?.mobileNo) : '',
                        signerEmail:  coAppData[1]?.email?.toLowerCase(),
                        signerGender: coAppData[1]?.gender,
                        // signerGender: "male",
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            "signaturePosition": [
                                "customize"
                            ],
                            "xCoordinate": [
                                290
                            ],
                            "yCoordinate": [
                                50
                            ]
                          }
                        ]
                      },
                      {
                        signerName: guarantorData?.fullName,
                        signerMobile:   guarantorData?.mobileNo ? String(guarantorData?.mobileNo) : '',
                        signerEmail:  guarantorData?.email?.toLowerCase(),
                        signerGender: guarantorData?.gender,
                        // signerGender: "male",
                        // uidLastFourDigits: "",
                        // pincode: "",
                        // signerYearOfBirth: "",
                        // signerUniqueId: "",
                        signatureType: "AADHAARESIGN-OTP",
                        cancelBySigner: true,
                        // digitalConsent: {
                        //   consentData: [
                        //     { text: "I confirm that I have opted for debit card", required: false },
                        //     { text: "I agree to comply with applicable laws", required: true }
                        //   ],
                        //   // consentHeading: "Terms & Conditions"
                        // },
                        additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                        postVerification: ["OTP"],
                        // timer: 5,
                        // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                        signatures: [
                          {
                            pageNo: ["All"],
                            "signaturePosition": [
                                "customize"
                            ],
                            "xCoordinate": [
                                530
                            ],
                            "yCoordinate": [
                                50
                            ]
                          }
                        ]
                      },
                     ]
                    }

                    if (finalData && finalData.pdfSelection == "acccg" || finalData.pdfSelection.toUpperCase() == "ACCCG") {

                        invitees = [
                            {
                                signerName: applicantData?.fullName,
                                signerMobile: applicantData?.mobileNo ? String(applicantData.mobileNo) : '',
                                signerEmail: applicantData?.email,
                                signerGender: applicantData?.gender,
                                // signerGender: "male",
                                // uidLastFourDigits: "",
                                // pincode: "",
                                // signerYearOfBirth: "",
                                // signerUniqueId: "",
                                signatureType: "AADHAARESIGN-OTP",
                                cancelBySigner: true,
                                // digitalConsent: {
                                //   consentData: [
                                //     { text: "I confirm that I have opted for debit card", required: false },
                                //     { text: "I agree to comply with applicable laws", required: true }
                                //   ],
                                //   // consentHeading: "Terms & Conditions"
                                // },
                                additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                                postVerification: ["OTP"],
                                // timer: 5,
                                // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                                signatures: [
                                  {
                                    pageNo: ["All"],
                                    "signaturePosition": [
                                        "customize"
                                    ],
                                    "xCoordinate": [
                                        50
                                    ],
                                    "yCoordinate": [
                                        50
                                    ]
                                  }
                                ]
                        },
                        {
                            signerName: coAppData[0]?.fullName,
                            signerMobile:   coAppData[0]?.mobileNo ? String(coAppData[0]?.mobileNo) : '',
                            signerEmail:  coAppData[0]?.email?.toLowerCase(),
                            signerGender: coAppData[0]?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                "signaturePosition": [
                                    "customize"
                                ],
                                "xCoordinate": [
                                    150
                                ],
                                "yCoordinate": [
                                    50
                                ]
                              }
                            ]
                        },
                          {
                            signerName: coAppData[1]?.fullName,
                            signerMobile:   coAppData[1]?.mobileNo ? String(coAppData[1]?.mobileNo) : '',
                            signerEmail:  coAppData[1]?.email?.toLowerCase(),
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                "signaturePosition": [
                                    "customize"
                                ],
                                "xCoordinate": [
                                    250
                                ],
                                "yCoordinate": [
                                    50
                                ]
                              }
                            ]
                          },
                          {
                            signerName: coAppData[2]?.fullName,
                            signerMobile:   coAppData[2]?.mobileNo ? String(coAppData[2]?.mobileNo) : '',
                            signerEmail:  coAppData[2]?.email?.toLowerCase(),
                            signerGender: coAppData[2]?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                "signaturePosition": [
                                    "customize"
                                ],
                                "xCoordinate": [
                                    350
                                ],
                                "yCoordinate": [
                                    50
                                ]
                              }
                            ]
                          },
                          {
                            signerName: guarantorData?.fullName,
                            signerMobile:   guarantorData?.mobileNo ? String(guarantorData?.mobileNo) : '',
                            signerEmail:  guarantorData?.email?.toLowerCase(),
                            signerGender: guarantorData?.gender,
                            // signerGender: "male",
                            // uidLastFourDigits: "",
                            // pincode: "",
                            // signerYearOfBirth: "",
                            // signerUniqueId: "",
                            signatureType: "AADHAARESIGN-OTP",
                            cancelBySigner: true,
                            // digitalConsent: {
                            //   consentData: [
                            //     { text: "I confirm that I have opted for debit card", required: false },
                            //     { text: "I agree to comply with applicable laws", required: true }
                            //   ],
                            //   // consentHeading: "Terms & Conditions"
                            // },
                            additionalSignatureTypes: ["AADHAARESIGN-FINGERPRINT"],
                            postVerification: ["OTP"],
                            // timer: 5,
                            // matchScript: "My name is XYZ, I agree to comply with applicable laws",
                            signatures: [
                              {
                                pageNo: ["All"],
                                "signaturePosition": [
                                    "customize"
                                ],
                                "xCoordinate": [
                                    450
                                ],
                                "yCoordinate": [
                                    50
                                ]
                              }
                            ]
                          },
                         ]
                        }

                    console.log(invitees,"invitees invitees")
                    const headers = {
                    'Authorization': '3Ghi2XGNEhlMMq69dSnnLLRFHu4AD8G3',
                    'Content-Type': 'application/json',
                    'x-uniqueReferenceId': uuidv4()
                    };
        
        //    const base64Files = await Promise.all(links.map(async (fileUrl) => {
        //           try {

        //               const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        //               const base64String = Buffer.from(response.data).toString('base64'); // Convert to base64
          
        //               return {
        //                   name: path.basename(fileUrl),
        //                   file: base64String,
        //                   mimeType: 'application/pdf'
        //               };
        //           } catch (error) {
        //               console.error(`Failed to fetch file from URL: ${fileUrl}`, error.message);
        //               return null;
        //           }
        //       }));
        
        //    const validFiles = base64Files.filter(file => file !== null);
        //    console.log(validFiles,"validFiles")

        async function mergeAndConvertToBase64(links) {
            const pdfBuffers = [];
        
            // Step 1: Download all PDFs
            for (const url of links) {
                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    pdfBuffers.push(response.data);
                } catch (err) {
                    console.error(`Error downloading PDF from ${url}:`, err.message);
                }
            }
        
            if (pdfBuffers.length === 0) {
                throw new Error("No valid PDFs downloaded.");
            }
        
            // Step 2: Merge PDFs using PDF-lib
            const mergedPdf = await PDFDocument.create();
        
            for (const buffer of pdfBuffers) {
                const loadedPdf = await PDFDocument.load(buffer);
                const copiedPages = await mergedPdf.copyPages(loadedPdf, loadedPdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
        
            const mergedPdfBytes = await mergedPdf.save(); // Uint8Array
        
            // Step 3: Convert merged PDF to base64
            const base64String = Buffer.from(mergedPdfBytes).toString('base64');
        
            return base64String;
        }

        const pdfData = await mergeAndConvertToBase64(links)
            console.log(customerData?.customerFinId,"customerData?.customerFinId")

             const data = {
              pdf: pdfData,//validFiles[0].file,
              contractName: `${customerData?.customerFinId}`,
              contractExecuterName: "Signzy",
              successRedirectUrl: "https://signzy.com",
              failureRedirectUrl: "https://google.com",
              crossOtpVerification: true,
              signerdetail: invitees,
              workflow: true,
              isParallel: true,
              redirectTime: 5,
              locationCaptureMethod: "iP",
              initiationEmailSubject: "Please sign the document received on your email",
              emailPdfCustomNameFormat: "SIGNERNAME",
              signOnStamp: true,
              locationCaptureMethod:  "iP",
              clickwrapConfigurableText: "Digital Consent Record",
            };
             
            axios.post('https://api-preproduction.signzy.app/api/v3/contract/initiate', data, { headers })
            .then(async (response) => {
              console.log("Response:", response.data);
          
              const signerDetails = response.data.signerdetail || [];
          
              // Map signer details to your new object
              const transformedData = {};
          
              // contractId is directly under response.data.items, not under signerdetail
              if (response.data?.contractId) {
                transformedData.contractId = response.data.contractId;
              }
          
              if (finalData && finalData.pdfSelection == "acg" || finalData.pdfSelection.toUpperCase() == "ACG"){
                if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
                if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
                if (signerDetails[2]?.workflowUrl) transformedData.guarantor = signerDetails[2].workflowUrl;
              }
              if (finalData && finalData.pdfSelection == "ac" || finalData.pdfSelection.toUpperCase() == "AC"){
                if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
                if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
              }
              if (finalData && finalData.pdfSelection == "acc" || finalData.pdfSelection.toUpperCase() == "ACC"){
                if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
                if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
                if (signerDetails[2]?.workflowUrl) transformedData.coApplicantTwo = signerDetails[2].workflowUrl;
              }
              if (finalData && finalData.pdfSelection == "accg" || finalData.pdfSelection.toUpperCase() == "ACCG"){
                if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
                if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
                if (signerDetails[2]?.workflowUrl) transformedData.coApplicantTwo = signerDetails[2].workflowUrl;
                if (signerDetails[3]?.workflowUrl) transformedData.guarantor = signerDetails[3].workflowUrl;
              }
              if (finalData && finalData.pdfSelection == "acccg" || finalData.pdfSelection.toUpperCase() == "ACCCG"){
                if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
                if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
                if (signerDetails[2]?.workflowUrl) transformedData.coApplicantTwo = signerDetails[2].workflowUrl;
                if (signerDetails[3]?.workflowUrl) transformedData.coApplicantThree = signerDetails[3].workflowUrl;
                if (signerDetails[4]?.workflowUrl) transformedData.guarantor = signerDetails[4].workflowUrl;
              }

            //   if (signerDetails[0]?.workflowUrl) transformedData.applicant = signerDetails[0].workflowUrl;
            //   if (signerDetails[1]?.workflowUrl) transformedData.coApplicant = signerDetails[1].workflowUrl;
            //   if (signerDetails[2]?.workflowUrl) transformedData.coApplicantTwo = signerDetails[2].workflowUrl;
            //   if (signerDetails[3]?.workflowUrl) transformedData.coApplicantThree = signerDetails[3].workflowUrl;
            //   if (signerDetails[4]?.workflowUrl) transformedData.guarantor = signerDetails[4].workflowUrl;
                console.log(transformedData,"transformedDatatransformedData")
              // Directly await inside .then()
              await finalModel.findOneAndUpdate(
                { customerId },
                { $set: { esignLinks: transformedData } }
              );
          
              // Send response after database update
              return success(res, "PDF generated successfully.", transformedData);
            })
            .catch(error => {
              console.error("Error:", error.response ? error.response.data : error.message);
          
              if (error.response && error.response.data) {
                // If error from Signzy API
                return res.status(400).json({
                  name: 'error',
                  message: error.response.data.message || 'Something went wrong',
                  reason: error.response.data.reason || 'VALIDATION_ERROR',
                  type: error.response.data.type || 'Bad Request',
                  statusCode: 400
                });
              } else {
                // If network error or unknown error
                return res.status(500).json({
                  name: 'error',
                  message: error.message || 'Internal Server Error',
                  reason: 'UNKNOWN_ERROR',
                  type: 'Internal Server Error',
                  statusCode: 500
                });
              }
            });
          
    }
    catch(error){
   console.error('Error:', error);
    // Send appropriate error response back to the client
    return unknownError(res, error);
    }
}


module.exports = {
    signzyFunction
}