const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound
} = require("../../../../globalHelper/response.globalHelper")

const axios = require("axios")
const customerModel = require("../model/customer.model");
const applicantModel = require("../model/applicant.model.js");
const BbpsModel = require("../model/bbps/bbps.model.js"); // Import the BBPS payment model
const {getGoogleEmil} = require("../controller/collection/emiCollect.Controller.js")
const { google } = require("googleapis");
const credentials = require("../../../../liveSheet.json")
const moment = require('moment')

const getCommonHeaders = () => {
    return {
        'AXIS-CHANNEL-ID': process.env.AXIS_CHANNEL_ID,
        'AXIS-BODY-CHANNEL-ID': process.env.AXIS_BODY_CHANNEL_ID,
        'AXIS-CLIENT-ID': process.env.AXIS_CLIENT_ID,
        'AXIS-CLIENT-SECRET': process.env.AXIS_CLIENT_SECRET,
        'AXIS-ENCRYPTION-KEY': process.env.AXIS_ENCRYPTION_KEY,
        'AXIS-SALT-KEY': process.env.AXIS_SALT_KEY,
        'AXIS-CHANNEL-PASSWORD': process.env.AXIS_CHANNEL_PASSWORD,
        'Content-Type': 'application/json',
    };
}

//API to register for a bill fetch
async function fetchPayment(req, res) {
    try {
        const requestBody = req.body;
        console.log("requestBody", requestBody);
        const headers = getCommonHeaders();

        const response = await axios.post(
            "https://docs.axis.setu.co/#operation/GetFetchedBill/api/bills/{env}/bill-fetch-request",
            requestBody,
            { headers }
        );
        return response;


    } catch (error) {
        console.error("Error in fetchDataBasedOnType:", error.message);
    }
}


// Function to call the fetch bill //

async function fetchBill(req, res) {

    try {

        const { agent, billerId, categoryCode, customerParams, mobileNumber } = req.body;
        if (!agent || !billerId || !categoryCode || !customerParams || !mobileNumber) {
            return badRequest(res, "Missing required fields: agent, billerId, categoryCode, customerParams, or mobileNumber");
        }
        const dynamicRequestBody = {
            agent,
            billerId,
            categoryCode,
            customerParams,
            mobileNumber
        };

        const featchBill = await fetchPayment({ body: dynamicRequestBody }, res);
        if (featchBill) {
            return success(res, "Bill fetched successfully", featchBill.data);
        }
    }
    catch (error) {
        console.error("Error in fetchDataBasedOnType:", error.message);
        return unknownError(res, error.message);

    }

}


//API to get fetched bill //

async function getFetchedBill(req, res) {
    try {
        const requestBody = req.body;
        console.log("requestBody", requestBody);
        const headers = getCommonHeaders();
        const response = await axios.post(
            "https://docs.axis.setu.co/#operation/GetFetchedBill/api/bills/{env}/get-fetched-bill",
            requestBody,
            { headers }
        );
        return response;
    } catch (error) {
        console.error("Error in getFetchedBill:", error.message);
    }
}


//API to get bill details //

async function getBillDetails(req, res) {
    try {
        const { context } = req.body;
        if (!context) {
            return badRequest(res, "Missing required fields: context");
        }
        const dynamicRequestBody = {
            context
        };

        const billResponse = await getFetchedBill({ body: dynamicRequestBody }, res);
        if (billResponse) {
            return success(res, "Bill details fetched successfully", billResponse.data);
        }
        return notFound(res, "Bill details not found");

    } catch (error) {
        console.error("Error in getBillDetails:", error.message);
        return unknownError(res, error.message);
    }
}

// API to get payment Status //

async function PaymentStatus(req, res) {

    try {
        const requestBody = req.body;
        const headers = getCommonHeaders();

        const res = await axios.post(
            "https://docs.axis.setu.co/#operation/GetFetchedBill/api/bills/{env}/get-payment-status",
            requestBody,
            { headers }
        );

        return res;

    }
    catch (error) {
        console.error("Error in PaymentStatus:", error.message);
        return unknownError(res, error.message);
    }

}

// API to get bill details //

async function getPayment(req, res) {
    try {

        const { context } = req.body;
        if (!context) {
            return badRequest(res, "Missing required fields: context");
        }
        const dynamicRequestBody = {
            context
        };

        const paymentResponse = await PaymentStatus({ body: dynamicRequestBody }, res);
        if (paymentResponse) {
            return success(res, "Payment details fetched successfully", paymentResponse.data);
        }
        return notFound(res, "Payment details not found");

    } catch (error) {
        console.error("Error in getPayment:", error.message);
        return unknownError(res, error.message);
    }
}


/// Make a custom BILL Featch API //

// add the validation  for LoanNumber //
/**
 * 
 Min Length : 5
Max Length: 15
Special Characters:Not allowed
Data type:String
 */


// WORKING ON PROD //
// async function CustomBillFeatch(req, res) {
//     try {
//         const { loan_number } = req.body;
//         if (!loan_number) {
//             return res.status(400).json({
//                 status: "FAILURE",
//                 errorCode: "400",
//                 message: "CUSTOMERFIN Is Required"
//             })
//         }

//         const findloanAmount = await customerModel.findOne({ customerFinId: loan_number });
//         if (!findloanAmount) {
//             return res.status(404).json({
//                 status: "FAILURE",
//                 errorCode: "404",
//                 message: "CUSTOMER Not Found"
//             })
//         }


//         if (findloanAmount.loanAmount <= 0) {
//             return res.status(200).json({
//                 status: "SUCCESS",
//                 message: "This loan is fully paid. No outstanding dues remaining."
//             });
//         }


//         const Applicant = await applicantModel.findOne({ customerId: findloanAmount._id })
//             .select("fullName mobileNo")

//         if (!Applicant) {
//             return res.status(404).json({
//                 status: "FAILURE",
//                 errorCode: "404",
//                 message: "CUSTOMER Not Found"
//             })
//         }


//         const result = {
//             customerName: Applicant.fullName,
//             loan_number: findloanAmount.customerFinId,
//             amountDue: findloanAmount.loanAmount ? findloanAmount.loanAmount : 0,
//             billDate: "2021-07-15",
//             dueDate: "2021-07-30",
//             billNumber: "TUVW1234",
//             billPeriod: "MONTHLY",
//             additionalInfo: {
//                 emiAmount: findloanAmount.emi,
//                 mobileNo: Applicant.mobileNo

//             }
//         }

//         return res.status(200).json({
//             status: "SUCCESS",
//             errorCode: "00",
//             message: "CUSTOMER FOUND",
//             data: result
//         })


//     } catch (error) {
//         return res.status(500).json({
//             status: "FAILURE",
//             errorCode: "500",
//             message: error.message
//         })
//     }
// }

const generateBillNumber = () => {
    return `BILL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};


async function CustomBillFeatch(req, res) {
    try {
        const { loan_number } = req.body;
        if (!loan_number) {
            return res.status(400).json({
                status: "FAILURE",
                errorCode: "400",
                message: "CUSTOMERFIN Is Required"
            })
        }

        const findloanAmount = await customerModel.findOne({ customerFinId: loan_number });
        if (!findloanAmount) {
            return res.status(404).json({
                status: "FAILURE",
                errorCode: "404",
                message: "CUSTOMER Not Found"
            })
        }


        if (findloanAmount.emi <= 0) {
            return res.status(200).json({
                status: "SUCCESS",
                message: "This loan is fully paid. No outstanding dues remaining."
            });
        }


        const Applicant = await applicantModel.findOne({ customerId: findloanAmount._id })
            .select("fullName mobileNo")

        if (!Applicant) {
            return res.status(404).json({
                status: "FAILURE",
                errorCode: "404",
                message: "CUSTOMER Not Found"
            })
        }


        const result = {
            customerName: Applicant.fullName,
            loan_number: findloanAmount.customerFinId,
            amountDue: findloanAmount.emi ? findloanAmount.emi : 0,
            billDate: "2021-07-15",
            dueDate: "2021-07-30",
            billNumber: generateBillNumber(),
            billPeriod: "MONTHLY",
            additionalInfo: {
                emiAmount: findloanAmount.emi,
                mobileNo: Applicant.mobileNo

            }
        }

        return res.status(200).json({
            status: "SUCCESS",
            errorCode: "00",
            message: "CUSTOMER FOUND",
            data: result
        })


    } catch (error) {
        return res.status(500).json({
            status: "FAILURE",
            errorCode: "500",
            message: error.message
        })
    }
}

// new Fetch api //


const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`; // Convert to "YYYY-MM-DD"
};


async function fetchLoanDetailsFromGoogleSheet(req, res) {
    try {
        const { loan_number } = req.body;

        if (!loan_number) {
            return res.status(400).json({
                status: "FAILURE",
                errorCode: "400",
                message: "LOAN NUMBER is required"
            });
        }

        // Fetch Google Sheet data
        const sheetData = await getGoogleEmil();

        if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
            return res.status(404).json({
                status: "FAILURE",
                errorCode: "404",
                message: "No data found in Google Sheet"
            });
        }

        // Find the record with the given LOAN NUMBER
        const loanData = sheetData.find(item => item["LOAN NUMBER"] == loan_number);

        if (!loanData) {
            return res.status(404).json({
                status: "FAILURE",
                errorCode: "404",
                message: "CUSTOMER Not Found"
            });
        }

                // Format billDate and dueDate to "YYYY-MM-DD"
        const formattedBillDate = formatDate(loanData["BILL DATE"]);
       const formattedDueDate = formatDate(loanData["DUE DATE"]);

       // Remove commas from amountDue and convert it to a number
       const amountDue = parseInt(loanData["AMOUNT DUE"].replace(/,/g, ""), 10);
        
        

        // Construct the response using data from the sheet
        const result = {
            customerName: loanData["CUSTOMER NAME"],
            loan_number: loanData["LOAN NUMBER"],
            amountDue: amountDue,
            billDate: formattedBillDate,
            dueDate: formattedDueDate,
            billNumber:  generateBillNumber(),// Generate if null
            billPeriod:'MONTHLY'
        };

        return res.status(200).json({
            status: "SUCCESS",
            errorCode: "00",
            message: "CUSTOMER FOUND",
            data: result
        })

    } catch (error) {
        return res.status(500).json({
            status: "FAILURE",
            errorCode: "500",
            message: error.message
        })

    }
}




let demiData = [];

// async function CustomPayment(req, res) {
//     try {
//         const { loan_number, amountPaid, transactionId, paymentMode, paymentDate, billNumber } = req.body;


//         if (!loan_number || !amountPaid || !transactionId) {
//             return res.status(400).json({
//                 status: "FAILURE",
//                 errorCode: "400",
//                 message: "Missing required fields: loan_number, amountPaid, transactionId"
//             });
//         }


//         const findloanAmount = await customerModel.findOne({ customerFinId: loan_number });
//         if (!findloanAmount) {
//             return res.status(404).json({
//                 status: "FAILURE",
//                 acknowledgementId: "",
//                 message: "Loan not found for the given loan_number"
//             });
//         }


//         const existingPayment = await demiData.find({ transactionId });
//         if (existingPayment) {
//             return res.status(200).json({
//                 status: "DUPLICATE",
//                 acknowledgementId: ""
//             });
//         }

//         const deminDatacreated = new demiData({
//             loan_number,
//             amountPaid,
//             transactionId,
//             paymentMode,
//             paymentDate,
//             billNumber
//         });

//         await deminDatacreated.save();

//         return res.status(200).json({
//             status: "SUCCESS",
//             acknowledgementId: "1AJI1344" 
//         });

//     } catch (error) {
//         console.error("Error in CustomPayment:", error.message);
//         return res.status(500).json({
//             status: "FAILURE",
//             errorCode: "500",
//             message: error.message
//         });
//     }
// }


// workijng on prod //
// async function CustomPayment(req, res) {
//     try {
//         const { loan_number, amountPaid, transactionId, paymentMode, paymentDate, billNumber } = req.body;


//         if (!loan_number || !amountPaid || !transactionId) {
//             return res.status(400).json({
//                 status: "FAILURE",
//                 errorCode: "400",
//                 message: "Missing required fields: loan_number, amountPaid, transactionId"
//             });
//         }


//         const findloanAmount = await customerModel.findOne({ customerFinId: loan_number });
//         if (!findloanAmount) {
//             return res.status(404).json({
//                 status: "FAILURE",
//                 acknowledgementId: "",
//                 message: "Loan not found for the given loan_number"
//             });
//         }

//         const existingPayment = demiData.find(payment => payment.transactionId === transactionId);
//         if (existingPayment) {
//             return res.status(200).json({
//                 status: "DUPLICATE",
//                 acknowledgementId: ""
//             });
//         }


//         const deminDatacreated = {
//             loan_number,
//             amountPaid,
//             transactionId,
//             paymentMode,
//             paymentDate,
//             billNumber
//         };

//         demiData.push(deminDatacreated);

//         return res.status(200).json({
//             status: "SUCCESS",
//             acknowledgementId: "1AJI1344"
//         });

//     } catch (error) {
//         console.error("Error in CustomPayment:", error.message);
//         return res.status(500).json({
//             status: "FAILURE",
//             errorCode: "500",
//             message: error.message
//         });
//     }
// }





async function CustomPayment(req, res) {
    try {
        const { loan_number, amountPaid, transactionId, paymentMode, paymentDate, billNumber } = req.body;

        if (!loan_number || !amountPaid || !transactionId) {
            return res.status(400).json({
                status: "FAILURE",
                errorCode: "400",
                message: "Missing required fields: loan_number, amountPaid, transactionId"
            });
        }

        const findloanAmount = await customerModel.findOne({ customerFinId: loan_number });
        if (!findloanAmount) {
            return res.status(404).json({
                status: "FAILURE",
                acknowledgementId: "",
                message: "Loan not found for the given loan_number"
            });
        }

        const existingPayment = await BbpsModel.findOne({ transactionId });
        if (existingPayment) {
            return res.status(200).json({
                status: "DUPLICATE",
                acknowledgementId: ""
            });
        }

        // Create and save a new payment record in the database
        const newPayment = new BbpsModel({
            loan_number,
            customerId: findloanAmount._id, // Linking customer
            amountPaid,
            transactionId,
            paymentMode,
            paymentDate: new Date(paymentDate), // Convert to Date format
            billNumber,
            status: "SUCCESS" // Add status field
        });

        await newPayment.save(); // Save to MongoDB

        return res.status(200).json({
            status: "SUCCESS",
            acknowledgementId: "1AJI1344" // Return MongoDB ID as acknowledgement
        });

    } catch (error) {
        console.error("Error in CustomPayment:", error.message);
        return res.status(500).json({
            status: "FAILURE",
            errorCode: "500",
            message: error.message
        });
    }
}


async function fetchGoogleSheetData(req, res) {
    try {
      const data = await getGoogleEmil();
      res.status(200).json({
        status: "SUCCESS",
        data
      });
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        message: error
      });
    }
  }


  // google sheet //


  // ✅ Function to Update Google Sheet working on prod //
// async function updateGoogleSheet(paymentData) {
//     try {
//         const auth = new google.auth.GoogleAuth({
//             credentials,
//             scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//         });

//         const authClient = await auth.getClient();
//         const sheets = google.sheets({ version: "v4", auth: authClient });

//         const spreadsheetId = "1eCtBKZdljVFtbXxIKjjIfiBZmk78WWa8t6TVGTEXnmg";
//         const sheetName = "BBPS PAYMENT RECEIVED DATA"; // Change this to your actual sheet name

//         // Fetch existing data
//         const response = await sheets.spreadsheets.values.get({
//             spreadsheetId,
//             range: `${sheetName}!A1:ZZZ`,
//         });

//         let rows = response.data.values || [];

//         if (rows.length === 0) {
//             console.log("Sheet is empty, adding headers.");
//             rows.push(["LOAN NUMBER", "DATE OF PAYMENT", "STATUS", "TRANSACTION ID", "BILL NO"]);
//         }

//         const headers = rows[0];
//         const loanNumberIndex = headers.indexOf("LOAN NUMBER");

//         if (loanNumberIndex === -1) {
//             throw new Error("LOAN NUMBER column not found in the sheet.");
//         }

//         // Check if transaction already exists
//         const transactionIndex = headers.indexOf("TRANSACTION ID");
//         const existingRowIndex = rows.findIndex(row => row[transactionIndex] === paymentData.transactionId);

//         if (existingRowIndex === -1) {
//             // Insert new row
//             rows.push([
//                 paymentData.loan_number,
//                 paymentData.paymentDate,
//                 paymentData.amountPaid,
//                 paymentData.status,
//                 paymentData.transactionId,
//                 paymentData.billNumber || ""
//             ]);
//         } else {
//             // Update existing row
//             headers.forEach((header, colIndex) => {
//                 if (paymentData.hasOwnProperty(header)) {
//                     rows[existingRowIndex][colIndex] = paymentData[header] || "";
//                 }
//             });
//         }

//         await sheets.spreadsheets.values.update({
//             spreadsheetId,
//             range: `${sheetName}!A1`,
//             valueInputOption: "RAW",
//             resource: { values: rows },
//         });

//         console.log("Google Sheet updated successfully.");
//     } catch (error) {
//         console.error("Error updating Google Sheet:", error);
//         throw error;
//     }
// }


async function updateGoogleSheet(paymentData) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: authClient });

        const spreadsheetId = "1eCtBKZdljVFtbXxIKjjIfiBZmk78WWa8t6TVGTEXnmg";
        const sheetName = "BBPS PAYMENT RECEIVED DATA"; // Change this to your actual sheet name

        // Fetch existing data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:ZZZ`,
        });

        let rows = response.data.values || [];

        // If sheet is empty, add headers
        if (rows.length === 0) {
            console.log("Sheet is empty, adding headers.");
            rows.push(["LOAN NUMBER", "DATE OF PAYMENT", "AMOUNT", "STATUS", "TRANSACTION ID", "BILL NO"]);
        }

        const headers = rows[0];
        const loanNumberIndex = headers.indexOf("LOAN NUMBER");

        if (loanNumberIndex === -1) {
            throw new Error("LOAN NUMBER column not found in the sheet.");
        }

        // Check if loan number exists
        const existingLoanRowIndex = rows.findIndex(row => row[loanNumberIndex] === paymentData.loan_number);

        if (existingLoanRowIndex !== -1) {
            // Loan number exists, determine how many previous payments are recorded
            let colSuffix = 1;
            while (headers.includes(`DATE OF PAYMENT${colSuffix}`)) {
                colSuffix++;
            }

            // Insert a blank column for spacing before adding new columns
            headers.push(""); // Empty column to maintain spacing

            // Add new column headers dynamically with an index space
            const newHeaders = [
                `DATE OF PAYMENT${colSuffix}`,
                `AMOUNT${colSuffix}`,
                `STATUS${colSuffix}`,
                `TRANSACTION ID${colSuffix}`,
                `BILL NO${colSuffix}`
            ];
            headers.push(...newHeaders);

            // Extend the existing row with an empty space, followed by new payment data
            rows[existingLoanRowIndex].push(
                "", // Empty column for spacing
                paymentData.paymentDate,
                paymentData.amountPaid,
                paymentData.status,
                paymentData.transactionId,
                paymentData.billNumber || ""
            );

            // Fill any previous columns with empty values if required
            while (rows[existingLoanRowIndex].length < headers.length) {
                rows[existingLoanRowIndex].push("");
            }
        } else {
            // Insert new row for the new loan number
            rows.push([
                paymentData.loan_number,
                paymentData.paymentDate,
                paymentData.amountPaid,
                paymentData.status,
                paymentData.transactionId,
                paymentData.billNumber || ""
            ]);
        }

        // Update the sheet with correctly aligned headers and data
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1`,
            valueInputOption: "RAW",
            resource: { values: rows },
        });

        console.log("Google Sheet updated successfully.");
    } catch (error) {
        console.error("Error updating Google Sheet:", error);
        throw error;
    }
}



async function CustomPaymentNew(req, res) {
    try {
        const { loan_number, amountPaid, transactionId, paymentMode, paymentDate, billNumber } = req.body;

        if (!loan_number || !amountPaid || !transactionId) {
            return res.status(400).json({
                status: "FAILURE",
                errorCode: "400",
                message: "Missing required fields: loan_number, amountPaid, transactionId"
            });
        }

        const existingPayment = await BbpsModel.findOne({ transactionId });
        if (existingPayment) {
            return res.status(200).json({
                status: "DUPLICATE",
                acknowledgementId: ""
            });
        }


        // Create and save a new payment record in the database
        const newPayment = new BbpsModel({
            loan_number,
            amountPaid,
            transactionId,
            paymentMode,
            paymentDate: new Date(paymentDate),
            billNumber,
            status: "SUCCESS"
        });

        await newPayment.save();

         res.status(200).json({
            status: "SUCCESS",
            acknowledgementId: "1AJI1344" // MongoDB ID as acknowledgement
        });

           // ✅ Update Google Sheets
           await updateGoogleSheet({
            loan_number,
            paymentDate,
            amountPaid,
            status: "SUCCESS",
            transactionId,
            billNumber
        });

    } catch (error) {
        console.error("Error in CustomPayment:", error.message);
        return res.status(500).json({
            status: "FAILURE",
            errorCode: "500",
            message: error.message
        });
    }
}



// make a api to get all data of bbps transaction //

async function getBbpsDashboard(req, res) {
    try {
        const { search, page = 1, limit = 100 , startDate, endDate } = req.query;
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);

        // Define match stage with a default empty filter
        let matchStage = {};

        if (search && search.trim() !== "") {
            matchStage = {
                $or: [
                    { loan_number: { $regex: search, $options: "i" } },
                    { transactionId: { $regex: search, $options: "i" } },
                    { billNumber: { $regex: search, $options: "i" } },
                    { paymentMode: { $regex: search, $options: "i" } }
                ]
            };
        }


        if (startDate || endDate) {
            matchStage.paymentDate = {};
            if (startDate) {
                matchStage.paymentDate.$gte = new Date(startDate);
            }
            if (endDate) {
                matchStage.paymentDate.$lte = new Date(endDate);
            }
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $facet: {
                    metadata: [
                        { $count: "totalRecords" },
                        { $addFields: { page: pageNumber, limit: pageSize } }
                    ],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize }
                    ]
                }
            },
            {
                $addFields: {
                    totalAmountPaid: { $sum: "$data.amountPaid" }
                }
            }
        ];

        const result = await BbpsModel.aggregate(aggregationPipeline);

        const responseData = {
            transactions: result[0].data || [],
            totalAmountPaid: result[0].totalAmountPaid || 0,
            totalRecords: result[0].metadata[0]?.totalRecords || 0,
            page: pageNumber,
            limit: pageSize
        };

        return success(res, "BBPS Transaction data fetched successfully", responseData);
    } catch (error) {
        return unknownError(res, error.message);
    }
}






module.exports = {
    fetchBill,
    getBillDetails,
    CustomBillFeatch,
    CustomPayment,
    fetchGoogleSheetData,
    fetchLoanDetailsFromGoogleSheet,
    CustomPaymentNew,
    getBbpsDashboard
}