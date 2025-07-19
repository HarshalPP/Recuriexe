
const {
    serverValidation,
    success,
    notFound,
    badRequest,
    unknownError } = require('../../../../globalHelper/response.globalHelper');


const { validationResult } = require('express-validator');
const nodemailer = require("nodemailer");
const ObjectId = require('mongoose').Types.ObjectId;
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const credentials = require('../../../../credential.json');
const employeModel = require('../model/adminMaster/employe.model'); 
// const { JSDOM } = require('jsdom');
const xlsx = require('xlsx');
const url ="http://localhost:4500/"

async function sendEmail(userEmail, subject, html, res){
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: html,
    });

    return true;
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

// ------------------Filter APi From Google Sheet--------------------------------
// async function filterFromGoogleSheet(req, res) {
//     try {
//       const auth = new google.auth.GoogleAuth({
//         credentials,
//         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//       });
//       const authClient = await auth.getClient();
//       const sheets = google.sheets({ version: 'v4', auth: authClient });
  
//       const spreadsheetId = '1siF0ZO98o7KHx9IB9uzK2rdR447O06Q_eBPn3l3WFjk';
//       const sheetName = 'EMI OVERALL';
  
//       const response = await sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: sheetName,
//       });
  
//       const rows = response.data.values;

//       if (rows.length === 0) {
//         return badRequest(res, "No data available",);
//       }
  
//       // Extract headers and normalize to lowercase for case-insensitive filtering
//       const headers = rows[0];
//       const headerMap = headers.reduce((acc, header, index) => {
//         acc[header.toLowerCase()] = index;
//         return acc;
//       }, {});
  
//       const data = rows.slice(1);
  
//       // Extract filters from query parameters
//       const filters = req.query;
  
//       // Function to apply filters case-insensitively
//       const applyFilters = (row) => {
//         return Object.keys(filters).every(key => {
//           const filterKey = key.toLowerCase();
//           const filterValue = filters[key].toLowerCase();
//           const columnIndex = headerMap[filterKey];
//           if (columnIndex !== undefined) {
//             return row[columnIndex] && row[columnIndex].toLowerCase() === filterValue;
//           }
//           return true;
//         });
//       };
  
//       // Filter the data based on provided filters
//       const filteredData = data.filter(row => applyFilters(row));
//       if (filteredData.length === 0) {
//         return notFound(res, "No Record", []); 
//       }
  
//       // Convert filtered data back to objects with original case from headers
//       const result = filteredData.map(row => {
//         return headers.reduce((acc, header, index) => {
//         //   acc[header] = row[index];
//           acc[header] = row[index] !== undefined ? row[index] : null;
//           return acc;
//         }, {});
//       });

      
//       success(res, "Filter Detail" , result)
  
//     } catch (error) {
//       console.log(error);
//       return unknownError(res, error);
//     }
//   }

async function filterFromGoogleSheet(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = '1siF0ZO98o7KHx9IB9uzK2rdR447O06Q_eBPn3l3WFjk';
    const sheetName = 'EMI OVERALL';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });

    const rows = response.data.values;

    if (rows.length === 0) {
      return badRequest(res, 'No data available');
    }

    // Extract headers and normalize to lowercase for case-insensitive filtering
    const headers = rows[0];
    const headerMap = headers.reduce((acc, header, index) => {
      acc[header.toLowerCase()] = index;
      return acc;
    }, {});

    const data = rows.slice(1);

    // Extract filters from query parameters
    const filters = req.query;

    // Function to apply filters case-insensitively
    const applyFilters = (row) => {
      return Object.keys(filters).every((key) => {
        const filterKey = key.toLowerCase();
        const filterValue = filters[key].toLowerCase();
        const columnIndex = headerMap[filterKey];
        if (columnIndex !== undefined) {
          return (
            row[columnIndex] && row[columnIndex].toLowerCase() === filterValue
          );
        }
        return true;
      });
    };

    // Filter the data based on provided filters
    const filteredData = data.filter((row) => applyFilters(row));
    if (filteredData.length === 0) {
      return notFound(res, 'No Record', []);
    }

    // Pagination logic
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit of 10
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Convert paginated data back to objects with original case from headers
    const result = paginatedData.map((row) => {
      return headers.reduce((acc, header, index) => {
        acc[header] = row[index] !== undefined ? row[index] : null;
        return acc;
      }, {});
    });

    // Prepare pagination metadata
    const pagination = {
      totalItems: filteredData.length,
      currentPage: page,
      totalPages: Math.ceil(filteredData.length / limit),
      pageSize: limit,
    };

    success(res, 'Filter Detail', {pagination, result});
  } catch (error) {
    console.log(error);
    return unknownError(res, error);
  }
}


//  async function pdfData(req, res){
//   try {
//   const dom = new JSDOM(htmlTemplate);
//   const document = dom.window.document;

//   const canvas = await html2canvas(document.body);
//   const imgData = canvas.toDataURL('image/png');

//   const pdf = new jsPDF('p', 'mm', 'a4');
//   const imgProps = pdf.getImageProperties(imgData);
//   const pdfWidth = pdf.internal.pageSize.getWidth();
//   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

//   const pdfBuffer = pdf.output('arraybuffer');
  
//   res.contentType('application/pdf');
//   res.send(Buffer.from(pdfBuffer));
// } catch (error) {
//   console.log(error);
//   return unknownError(res, error);
// }
// }



module.exports = {
    filterFromGoogleSheet
}
