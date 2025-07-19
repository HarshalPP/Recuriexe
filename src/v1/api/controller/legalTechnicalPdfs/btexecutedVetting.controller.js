const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const PDFDocument = require("pdfkit");
  
  const path = require("path");
  const fs = require("fs");
  const moment = require("moment");
  const { validationResult } = require("express-validator");
  const stream = require('stream')
  //   const { uploadToSpaces } = require("../../services/spaces.service.js")
  const uploadToSpaces = require("../../services/spaces.service.js");
  
    const mongoose = require("mongoose");
    const { EventEmitter } = require('events');
  const myEmitter = new EventEmitter();
  
  
 
const customerModel = require('../../model/customer.model')
const coApplicantModel = require('../../model/co-Applicant.model')
const guarantorModel = require('../../model/guarantorDetail.model')
const applicantModel = require('../../model/applicant.model')
const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel')
const appPdcModel = require('../../model/branchPendency/appPdc.model')
const cibilModel = require('../../model/cibilDetail.model')
const DISBURSEMENTModel = require('../../model/fileProcess/disbursement.model.js')
const creditPdModel = require('../../model/credit.Pd.model')
const sanctionModel =  require('../../model/finalApproval/sanctionPendency.model')
const finalsanctionModel =  require('../../model/finalSanction/finalSnction.model')
const externalBranchModel = require("../../model/externalManager/externalVendorDynamic.model.js");
const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
const lendersModel = require("../../model/lender.model.js");
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js"); 
  
  const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/gmcpl logo.png"
  );
  // const pdfLogo = path.join(
  //   __dirname,
  //   "../../../../../assets/image/FINCOOPERSLOGO.png"
  // );
  const watermarklogo = path.join(
    __dirname,
    "../../../../assets/image/watermarklogo.png"
  );
  // Helper function to capitalize the first letter of each word in a name
  function capitalizeFirstLetter(name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  
  async function sanctionLetterPdf(allPerameters,logo,partnerName) {
    const font = "assets/font/Cambria.ttf";
    const fontBold = "assets/font/Cambria-Bold.ttf";
    // const baseDir = path.join("./uploads/");
    // const outputDir = path.join(baseDir, "pdf/");

    const PDFDocument = require('pdfkit');
    // const doc = new PDFDocument();
    const doc = new PDFDocument({ margin: 50, size: "A4" });

  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));
  
    // draw a border around the page
    function drawBorder() {
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 30;
      const lineWidth = 2;
  
      // Draw a simple border rectangle
      doc.lineWidth(lineWidth);
      doc
        .rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin)
        .strokeColor("#324e98") // Set the color of the border
        .stroke();
    }
  
    // add logo to every page
    // function addLogo() {
    //   if (fs.existsSync(logo)) {
    //     doc.image(logo, 400, 50, {
    //       fit: [150, 50],
    //       align: "left",
    //       valign: "bottom",
    //     });
    //   } else {
    //     console.error(`Logo file not found at: ${pdfLogo}`);
    //   }
    // }
  
    // watermark function
    function addWatermark() {
      if (fs.existsSync(watermarklogo)) {
        doc.save();
        doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
  
        doc.image(
          watermarklogo,
          doc.page.width / 2 - 200,
          doc.page.height / 2 - 200,
          {
            fit: [450, 400],
            opacity: 0.05,
            align: "center",
            valign: "center",
          }
        );
  
        doc.restore();
      } else {
        console.error(`Logo file not found at: ${watermarklogo}`);
      }
    }
  
   
  
    // Footer with border and stylized text
    function addFooter() {
      if( partnerName == "GROW MONEY CAPITAL PVT LTD"){
        const pageWidth = doc.page.margins.left;
        const pageHeight = doc.page.height;
    
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#324e98")
          .text("FinCoopers Capital Pvt Ltd", pageWidth, pageHeight - 80, {
            align: "center",
          });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", {
            align: "center",
          });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("CIN: 67120MP1994PTC008686", { align: "center" });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("Phone: +91 7374911911 | Email: hr@fincoopers.com", {
            align: "center",
          });
    
        // Add a separator line above the footer
        doc
          .moveTo(50, doc.page.height - 100)
          .lineTo(doc.page.width - 50, doc.page.height - 100)
          .strokeColor("#324e98")
          .lineWidth(1)
          .stroke();
      }else {
        const pageWidth = doc.page.margins.left;
        const pageHeight = doc.page.height;
    
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#324e98")
          .text("FinCoopers Capital Pvt Ltd", pageWidth, pageHeight - 80, {
            align: "center",
          });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", {
            align: "center",
          });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("CIN: 67120MP1994PTC008686", { align: "center" });
        doc
          .font(fontBold)
          .fontSize(6.3)
          .fillColor("#000000")
          .text("Phone: +91 7374911911 | Email: hr@fincoopers.com", {
            align: "center",
          });
    
        // Add a separator line above the footer
        doc
          .moveTo(50, doc.page.height - 100)
          .lineTo(doc.page.width - 50, doc.page.height - 100)
          .strokeColor("#324e98")
          .lineWidth(1)
          .stroke();
      }
     
    }
  
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir, { recursive: true });
    // }
  
  
    const timestamp = Date.now();
    // const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`); // Capitalize name
    // const pdfFilename = `btExecutedvetting.pdf`;
  
    // const pdfPath = path.join(outputDir, pdfFilename);
  
    // const doc = new PDFDocument({ margin: 50, size: "A4" });
    // const stream = fs.createWriteStream(pdfPath);
  
    // doc.pipe(stream);
  
    // function addHeader(doc, logoPath) {
    //   if (!doc || typeof doc.font !== "function") {
    //     throw new Error("Invalid PDFDocument instance passed to addHeader.");
    //   }
    //     // Add the logo
    //     if (fs.existsSync(logoPath)) {
    //       doc.image(logoPath, 50, 30, {
    //         fit: [50, 50],
    //         align: "left",
    //       });
    //     } else {
    //       console.error(`Logo file not found at: ${logoPath}`);
    //     }
      
    //     // Add the advocate's name and title
        
    //       doc.font("Helvetica-Bold")
  
    //       .fontSize(18)
    //       .text("MOHAMMAD ALTAF KHAN", 120, 30);
      
    //     doc
    //       .fontSize(12)
    //       .font("Helvetica")
    //       .text("High Court Advocate", 120, 55);
      
    //     // Add contact details
    //     doc
    //       .fontSize(10)
    //       .text(
    //         "Office: 302, Indavar House Block-A,\nSouth Tukoganj, Indore [M.P.]\nResidence: 2-J, 16/2, Manikbagh,\nChoithram Road, Indore [M.P.]\nMob. No.: 97550-97878\nE-mail: advocate.makhan@yahoo.in",
    //         300,
    //         30,
    //         {
    //           align: "right",
    //         }
    //       );
      
    //     // Add a line divider
    //     doc
    //       .moveTo(50, 100)
    //       .lineTo(550, 100)
    //       .stroke();
    //   }
  
  
  
    // function addHeader2(doc, logoPath) { 
    //   if (!doc || typeof doc.font !== "function") {
    //     throw new Error("Invalid PDFDocument instance passed to addHeader.");
    //   }
    
    //   // Add the advocate's name and title
    //   doc
    //     .font("Helvetica-Bold")
    //     .fontSize(18)
    //     .text("MOHAMMAD ALTAF KHAN", 80, 30, { align: "left" });
    
    //   doc
    //     .fontSize(12)
    //     .font("Helvetica")
    //     .text("High Court Advocate", 80, 55, { align: "left" });
    
    //   // Add the logo image aligned to the left of the name and title
    //   if (fs.existsSync(logoPath)) {
    //     doc.image(logoPath,{
    //       fit: [40, 40], // Adjust size to fit proportionally
    //       align: "left",
    //     });
    //   } else {
    //     console.error(`Logo file not found at: ${logoPath}`);
    //   }
    
    //   // Add contact details aligned to the right
    //   const addressStartY = 30; // Starting Y position for the address
    //   const addressX = doc.page.width - 210; // Position aligned to the right
    
    //   doc
    //     .fontSize(10)
    //     .text("Office:302,Indavar House Block-A,", addressX, addressStartY, { align: "right" })
    //     .text("South Tukoganj, Indore [M.P.]", addressX, addressStartY + 15, { align: "right" })
    //     .text("Residence: 2-J, 16/2, Manikbagh,", addressX, addressStartY + 30, { align: "right" })
    //     .text("Choithram Road, Indore [M.P.]", addressX, addressStartY + 45, { align: "right" })
    //     .text("Mob. No.: 97550-97878", addressX, addressStartY + 60, { align: "right" })
    //     .text("E-mail: advocate.makhan@yahoo.in", addressX, addressStartY + 75, { align: "right" });
    
    //   // Add a line divider
    //   doc
    //     .moveTo(50, addressStartY + 110)
    //     .lineTo(doc.page.width - 50, addressStartY + 110)
    //     .stroke();
        
    // }
  //   function addHeader(doc, logoPath) {
  //     if (!doc || typeof doc.font !== "function") {
  //       throw new Error("Invalid PDFDocument instance passed to addHeader.");
  //     }
    
  //     // Add the advocate's name and title
  //     doc
  //       .font("Helvetica-Bold")
  //       .fontSize(18)
  //       .text("MOHAMMAD ALTAF KHAN", 80, 30, { align: "left" });
    
  //     doc
  //       .fontSize(12)
  //       .font("Helvetica")
  //       .text("High Court Advocate", 80, 55, { align: "left" });
    
  //     // Add the logo aligned to the left of the name and title
  //     if (fs.existsSync(logoPath)) {
  //       doc.image(logoPath,{
  //         fit: [40, 40], // Adjust size to fit proportionally
  //         align: "left",
  //       });
  //     } else {
  //       console.error(`Logo file not found at: ${logoPath}`);
  //     }
    
  //     // Add contact details aligned to the right but left-aligned text
  //     const addressStartY = 30; // Starting Y position for the address
  //     const addressX = doc.page.width - 260; // Adjust X position closer to the right margin
      
  //     doc
  //       .font("Helvetica")
  //       .fontSize(12)
  //       .text("Office: 302, Indavar House Block-A,", addressX, addressStartY, { align: "left" })
  //       .text("South Tukoganj, Indore [M.P.]", addressX, addressStartY + 15, { align: "left" })
  //       .text("Residence: 2-J, 16/2, Manikbagh,", addressX, addressStartY + 30, { align: "left" })
  //       .text("Choithram Road, Indore [M.P.]", addressX, addressStartY + 45, { align: "left" })
  //       .text("Mob. No.: 97550-97878", addressX, addressStartY + 60, { align: "left" })
  //       .text("E-mail:", addressX, addressStartY + 75, { align: "left",continued:true });
  //       const email = "advocate.makhan@yahoo.in";
  //    const emailY = addressStartY + 75; // Y position for the email
  // doc
  // .fillColor("blue")
  //    // Change text color to blue to indicate a link
  //   .text(email, addressX, emailY, { align: "left", link: `mailto:${email}` });
    
  //     // Add a line divider
  //     doc
  //       .moveTo(50, addressStartY + 110)
  //       .lineTo(doc.page.width - 50, addressStartY + 110)
  //       .stroke();
  //   }
    
   function addHeader(doc, logoPath) {
         if (!doc || typeof doc.font !== "function") {
           throw new Error("Invalid PDFDocument instance passed to addHeader.");
         }
       
         // Add the advocate's name and title
         doc
           .font("Helvetica-Bold")
           .fontSize(20)
           .text("MOHAMMAD ALTAF KHAN", 80, 30, { align: "left" });
       
         doc
           .fontSize(12)
           .font("Helvetica-Bold")
           .text("High Court Advocate", 80, 55, { align: "left" });
       
         // Add the logo aligned to the left of the name and title
         if (fs.existsSync(logoPath)) {
           doc.image(logoPath,{
             fit: [40, 40], // Adjust size to fit proportionally
             align: "left",
           });
         } else {
           console.error(`Logo file not found at: ${logoPath}`);
         }
       
         // Add contact details aligned to the right but left-aligned text
         const addressStartY = 50; // Starting Y position for the address
         const addressX = doc.page.width - 280; // Adjust X position closer to the right margin
         
         doc
           .font("Helvetica-Bold")
           .fontSize(12)
           .text("Office: 302, Indavar House Block-A,", addressX, addressStartY, { align: "left" })
           .text("South Tukoganj, Indore [M.P.]", addressX, addressStartY + 15, { align: "left" })
           .text("Residence: 2-J, 16/2, Manikbagh,", addressX, addressStartY + 30, { align: "left" })
           .text("Choithram Road, Indore [M.P.]", addressX, addressStartY + 45, { align: "left" })
           .text("Mob. No.: 97550-97878", addressX, addressStartY + 60, { align: "left" })
           .text("E-mail:", addressX, addressStartY + 75, { align: "left",continued:true });
           const email = "advocate.makhan@yahoo.in";
        const emailY = addressStartY + 75; // Y position for the email
     doc
     .fillColor("blue")
        // Change text color to blue to indicate a link
       .text(email, addressX, emailY, { align: "left", link: `mailto:${email}` });
       
         // Add a line divider
         doc
           .moveTo(50, addressStartY + 110)
           .lineTo(doc.page.width - 50, addressStartY + 110)
           .stroke();
       }
     
     
   
   
     // Add logo and border to the first page
   /    //   addWatermark();
     // drawBorder();
   
     // Title styling for OFFER LETTER in uppercase and underlined
     doc.moveDown(4);
     // doc
     //   .fontSize(12)
     //   .font(fontBold)
     //   .text("SANCTION LETTER", { align: "center", underline: true });
     // doc.moveDown(1);
   
     // Format the borrower details to the left side
     
   
     // Add a function to draw black table borders 
     function drawTable(tableData) {
       // Add Table Header
       const startX = 50;
       let startY = doc.y + 10;
       const columnWidths = [500];
   
       const keyWidth = Math.round((columnWidths[0] * 1) / 2);
       const valueWidth = Math.round((columnWidths[0] * 1) / 2);
       // console.log(columnWidths[0], keyWidth, valueWidth);
   
       // Reset fill color to white for table rows
   
       // Define table data (replace this with the actual data you want)
   
       // Render table rows
       tableData.forEach((row, rowIndex) => {
         // Alternate row background color
         doc.lineWidth(0.5);
   
         let valueRowHeight = 20;
   
         if ([13, 15, 18, 20].includes(rowIndex)) {
           valueRowHeight = 38.5;
         }
   
         doc
           .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
           .rect(startX, startY, keyWidth, valueRowHeight)
           .stroke("black")
           .fill();
   
         // Draw text in each cell
         doc
           .font(font)
           .fillColor("black")
           .fontSize(7.2)
           .text(row.field1, startX + 5, startY + 5, {
             baseline: "hanging",
             width: keyWidth,
           });
         // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)
   
         // Alternate row background color
         doc
           .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
           .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
           .stroke()
           .fill();
   
         // Draw text in each cell
         doc
           .font(font)
           .fillColor("black")
           .fontSize(7.2)
           .text(row.value1, startX + keyWidth + 5, startY + 5, {
             baseline: "hanging",
             width: valueWidth,
           });
   
         // Move to next row position
         startY += valueRowHeight;
       });
   
       // Add another section as an example
       // doc.moveDown().fontSize(12).text('Sourcing Details');
   
       // You can continue adding more tables/sections in a similar fashion
     }
   
     const startX = 50; // Set a left margin
   
   
   // doc.moveDown(10);
   const logoPath = path.join(
   __dirname,
   "../../../../../assets/image/legal.png"
   );
   addHeader(doc, logoPath);
   doc.moveDown(2);
   doc.font(font).fillColor("black").text(`Dated: ${allPerameters.date}`, 50, 168,{align:'right'});
   doc.moveDown();
   // doc.font(fontBold).text('LEGAL SCRUTINY REPORT', { align: 'center' });
   
   
   // doc.moveDown();
   
   // doc.text('________________________________', { align: 'left', indent: 40 });
   
   // doc.moveDown();
   // doc.text('_____________  ________________', { align: 'left', indent: 40 });
   
   // doc.moveDown();
   // doc.text('_______________________________', { align: 'left', indent: 40 });
   
   doc.moveDown(1);
   
   doc.fontSize(14).font('Helvetica-Bold')
         .text('VETTING REPORT', { align: 'center' });
   
         doc.fontSize(10).font('Helvetica-Bold')
         .text('To,', { align: 'left' })
         .text(`${allPerameters.partnerName}`, { align: 'left' })
         .font('Helvetica').text(`Registered Adress:-${allPerameters.partnerAdress},\nCorporate Adress:-${allPerameters.partnerCoAdress}`, { align: 'left' })
         .text(`Email:${allPerameters.partnerEmail}`, { align: 'left' })
         .text(`Contact No.${allPerameters.partnerContact}`, { align: 'left' })
         .text(`CIN-${allPerameters.partnerCinNo}`, { align: 'left' }).moveDown(0.3);
   
     
   
     doc.fontSize(18).font('Helvetica-Bold').text('CERTIFICATE', 50, 330,{align:'center',underline:true});
     
   //   doc.fontSize(10).text(`Loan A / c:`, 50, 375,{align:'left',continued:true});
   // doc.fontSize(10).text(`Mr KAILASH NINGWAL, Mrs NIRMALA BAI\n Mr ABHISHEK NINGWAL`, 50, 375,{align:'right'});
   
     // doc.fontSize(10).font('Helvetica-Bold')
     //     .text('Dear Sir/Madam', 50, 400)
     //     .text(`This Is With Reference To Your Request For My Legal Opinion In The Matter Of The Title Of The Said Property.I Have Carefully Examined The Relevant Documents Of The Said Property Given To Me Which Are In Order. As Such I Am Submitting Here-In-Below My Legal Opinion On The Captioned Matter:-`, 50, 425)
         // .text('Said Property.I Have Carefully Examined The Relevant Documents Of The Said Property Given To', 50, 425)
         // .text('Me Which Are In Order. As Such I Am Submitting Here-In-Below My Legal Opinion On The', 50, 440)
         // .text('Captioned Matter:-', 50, 455);
   
   
   
       //   function BoundariesFunction(tableData) {
       //     // Add Table Header
       //     const startX = 50; // Starting X position for the box
       //     let startY = doc.y + 10; // Starting Y position for the box
       //     const boxWidth = 500; // Total width of the box
       //     const numFields = 3; // Fixed number of columns (Direction, Separator, Description)
       
       //     // Adjusted widths for columns: first and last wider, middle narrower
       //     const firstColumnWidth = boxWidth * 0.3; // 40% for the first column
       //     const middleColumnWidth = boxWidth * 0.1; // 20% for the middle column
       //     const lastColumnWidth = boxWidth * 0.6; // 40% for the last column
       
       //     // Calculate the total height needed for the entire box
       //     let totalHeight = 0;
       
       //     // Calculate the height for each row and determine the total height of the box
       //     tableData.forEach((row) => {
       //         let rowHeight = 0;
       //         Object.values(row).forEach((field) => {
       //             const fieldTextHeight = doc
       //                 .font('Helvetica') // Regular font for calculating height
       //                 .fontSize(7.2)
       //                 .heightOfString(field || '', { width: firstColumnWidth }) + 10; // Add padding
       //             rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
       //         });
       //         totalHeight += rowHeight; // Accumulate the total height
       //     });
       
       //     // Draw the outer rectangle for the box
       //     doc
       //         .fillColor("#f0f0f0") // Box background color
       //         .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
       //         .stroke("black") // Border color (normal line)
       //         .fill();
       
       //     tableData.forEach((row) => {
       //         let currentX = startX; 
       //         let rowHeight = 0;
       //         Object.values(row).forEach((field) => {
       //             const fieldTextHeight = doc
       //                 .font('Helvetica') 
       //                 .fontSize(7.2)
       //                 .heightOfString(field || '', { width: firstColumnWidth }) + 10; 
       //             rowHeight = Math.max(rowHeight, fieldTextHeight);
       //         });
       
               
       //         Object.entries(row).forEach(([key, field], fieldIndex) => {
       //             const fieldWidth = fieldIndex === 1 ? middleColumnWidth : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
       
       //             doc
       //                 .fillColor("#f5f5f5") 
       //                 .rect(currentX, startY, fieldWidth, rowHeight)
       //                 .stroke("black") // Normal line border for field box
       //                 .fill();
       
       //             // Set font style based on whether it's a field (bold) or value (normal)
       //             const isFieldValue = key === 'value'; // Check if it's the value field
       //             doc
       //                 .font(isFieldValue ? 'Helvetica' : 'Helvetica-Bold') // Bold for field, normal for value
       //                 .fillColor("black")
       //                 .fontSize(10.2);
       
       //             // Align text properly based on column index
       //             const align = fieldIndex === 1 ? 'left' : (fieldIndex === 0 ? 'left' : 'left'); // Align all to left
       
       //             // Draw the field text in the box
       //             doc.text(field, currentX + 5, startY + 5, {
       //                 baseline: "hanging",
       //                 width: fieldWidth - 10, // Adjust width to provide padding inside the box
       //                 align: align, // Align text based on content
       //             });
       
       //             // Move to the next column
       //             currentX += fieldWidth; // Update X position for the next field
       //         });
       
       //         // Move to the next row
       //         startY += rowHeight; // Update Y position for the next row
       //     });
       // }
       function BoundariesFunction1(tableData) {
         // Starting positions
         const startX = 50; // Starting X position for the table
         let startY = doc.y + 10; // Starting Y position for the table
         const boxWidth = 500; // Total width of the table
         const numFields = 3; // Number of columns (e.g., Direction, Separator, Description)
     
         // Column widths: proportion of the total width
         const firstColumnWidth = boxWidth * 0.3; // 30% for the first column
         const middleColumnWidth = boxWidth * 0.1; // 10% for the middle column
         const lastColumnWidth = boxWidth * 0.6; // 60% for the last column
     
         const padding = 5; // Padding inside cells
     
         // Calculate the total height for the table
         let totalHeight = 0;
         tableData.forEach((row) => {
             let rowHeight = 0;
             Object.entries(row).forEach(([key, field], fieldIndex) => {
                 // Adjust the width of the current field
                 const fieldWidth = fieldIndex === 1
                     ? middleColumnWidth
                     : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
     
                 // Calculate the text height for the current field
                 const fieldTextHeight = doc
                     .font('Helvetica')
                     .fontSize(10.2) // Set font size to 10.2
                     .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding; // Add vertical padding
                 rowHeight = Math.max(rowHeight, fieldTextHeight); // Update the row height based on the tallest cell
             });
             totalHeight += rowHeight; // Add the row height to the total height
         });
     
         // Draw the outer box for the table
         doc
             .fillColor("#f0f0f0") // Background color for the table
             .rect(startX, startY, boxWidth, totalHeight) // Full table dimensions
             .stroke("black") // Border color
             .fill();
     
         // Draw table rows and cells
         tableData.forEach((row) => {
             let currentX = startX; // Reset X position for each row
             let rowHeight = 0;
     
             // Calculate row height
             Object.entries(row).forEach(([key, field], fieldIndex) => {
                 const fieldWidth = fieldIndex === 1
                     ? middleColumnWidth
                     : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
     
                 const fieldTextHeight = doc
                     .font('Helvetica')
                     .fontSize(10.2) // Set font size to 10.2
                     .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding;
                 rowHeight = Math.max(rowHeight, fieldTextHeight);
             });
     
             // Draw each cell in the row
             Object.entries(row).forEach(([key, field], fieldIndex) => {
                 const fieldWidth = fieldIndex === 1
                     ? middleColumnWidth
                     : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
     
                 // Draw the cell background and border
                 doc
                     .fillColor("#f5f5f5") // Cell background color
                     .rect(currentX, startY, fieldWidth, rowHeight)
                     .stroke("black")
                     .fill();
     
                 // Set the font style dynamically
                 let isBold = false;
                 if (fieldIndex === 0 || fieldIndex === 1) {
                     // Make all text in Column 1 and Column 2 bold
                     isBold = true;
                 } else if (fieldIndex === 2 && field === 'Boundries :-') {
                     // Make the specific text 'Boundaries' in Column 3 bold
                     isBold = true;
                 }
     
                 // Apply the font based on the `isBold` flag
                 doc
                     .font(isBold ? 'Helvetica-Bold' : 'Helvetica') // Bold or normal font
                     .fontSize(10.2) // Set font size to 10.2
                     .fillColor("black") // Text color
                     .text(field, currentX + padding, startY + padding, {
                         width: fieldWidth - 2 * padding, // Reduce width for padding
                         align: 'left', // Left-align text
                     });
     
                 currentX += fieldWidth; // Move to the next cell
             });
     
             startY += rowHeight; // Move to the next row
         });
     }
   //   function BoundariesFunction(tableData) {
   //     const startX = 50; // Starting X position for the table
   //     let startY = doc.y + 10; // Starting Y position for the table
   //     const boxWidth = 500; // Total width of the table
   //     const numFields = 3; // Number of columns (e.g., Direction, Separator, Description)
   
   //     // Column widths: proportion of the total width
   //     const firstColumnWidth = boxWidth * 0.3; // 30% for the first column
   //     const middleColumnWidth = boxWidth * 0.1; // 10% for the middle column
   //     const lastColumnWidth = boxWidth * 0.6; // 60% for the last column
   
   //     const padding = 5; // Padding inside cells
   
   //     // Calculate the total height for the table
   //     let totalHeight = 0;
   //     tableData.forEach((row) => {
   //         let rowHeight = 0;
   //         Object.entries(row).forEach(([key, field], fieldIndex) => {
   //             const fieldWidth = fieldIndex === 1
   //                 ? middleColumnWidth
   //                 : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
   
   //             const fieldTextHeight = doc
   //                 .font('Helvetica')
   //                 .fontSize(10.2) // Set font size to 10.2
   //                 .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding;
   //             rowHeight = Math.max(rowHeight, fieldTextHeight); // Update the row height based on the tallest cell
   //         });
   //         totalHeight += rowHeight; // Add the row height to the total height
   //     });
   
   //     // Draw the outer box for the table
   //     doc
   //         .fillColor("#f0f0f0") // Background color for the table
   //         .rect(startX, startY, boxWidth, totalHeight) // Full table dimensions
   //         .stroke("black") // Border color
   //         .fill();
   
   //     // Draw table rows and cells
   //     tableData.forEach((row) => {
   //         let currentX = startX; // Reset X position for each row
   //         let rowHeight = 0;
   
   //         // Calculate row height
   //         Object.entries(row).forEach(([key, field], fieldIndex) => {
   //             const fieldWidth = fieldIndex === 1
   //                 ? middleColumnWidth
   //                 : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
   
   //             const fieldTextHeight = doc
   //                 .font('Helvetica')
   //                 .fontSize(10.2) // Set font size to 10.2
   //                 .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding;
   //             rowHeight = Math.max(rowHeight, fieldTextHeight);
   //         });
   
   //         // Draw each cell in the row
   //         Object.entries(row).forEach(([key, field], fieldIndex) => {
   //             const fieldWidth = fieldIndex === 1
   //                 ? middleColumnWidth
   //                 : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
   
   //             // Draw the cell background and border
   //             doc
   //                 .fillColor("#f5f5f5") // Cell background color
   //                 .rect(currentX, startY, fieldWidth, rowHeight)
   //                 .stroke("black")
   //                 .fill();
   
   //             // Set text style and split for "Boundaries"
   //             if (fieldIndex === 2 && field.includes("Boundaries")) {
   //                 const parts = field.split("Boundaries"); // Split text into parts
   
   //                 doc.font('Helvetica').fontSize(10.2); // Regular font
   //                 doc.text(parts[0], currentX + padding, startY + padding, {
   //                     width: fieldWidth - 2 * padding,
   //                     align: 'left',
   //                 });
   
   //                 const textHeight = doc.heightOfString(parts[0] || '', { width: fieldWidth - 2 * padding });
   
   //                 // Bold for "Boundaries"
   //                 doc
   //                     .font('Helvetica-Bold')
   //                     .text("Boundaries", currentX + padding, startY + padding + textHeight, {
   //                         width: fieldWidth - 2 * padding,
   //                         align: 'left',
   //                     });
   
   //                 // Continue with the rest of the text
   //                 doc
   //                     .font('Helvetica')
   //                     .text(parts[1], currentX + padding, startY + padding + textHeight + 12, {
   //                         width: fieldWidth - 2 * padding,
   //                         align: 'left',
   //                     });
   //             } else {
   //                 const isBold = fieldIndex === 0 || fieldIndex === 1; // Bold for Column 1 and Column 2
   
   //                 doc
   //                     .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
   //                     .fontSize(10.2) // Font size
   //                     .fillColor("black") // Text color
   //                     .text(field, currentX + padding, startY + padding, {
   //                         width: fieldWidth - 2 * padding,
   //                         align: 'left',
   //                     });
   //             }
   
   //             currentX += fieldWidth; // Move to the next cell
   //         });
   
   //         startY += rowHeight; // Move to the next row
   //     });
   // }
   function BoundariesFunction(tableData) {
     const startX = 50; // Starting X position for the table
     let startY = doc.y + 10; // Starting Y position for the table
     const boxWidth = 500; // Total width of the table
     const numFields = 4; // Number of columns
   
     // Column widths: proportion of the total width
     const firstColumnWidth = boxWidth * 0.1; // 20% for the first column
     const secondColumnWidth = boxWidth * 0.3; // 10% for the second column (separator)
     const thirdColumnWidth = boxWidth * 0.1; // 30% for the third column
     const fourthColumnWidth = boxWidth * 0.5; // 40% for the fourth column
   
     const padding = 5; // Padding inside cells
   
     // Calculate the total height for the table
     let totalHeight = 0;
     tableData.forEach((row) => {
         let rowHeight = 0;
         Object.values(row).forEach((field, fieldIndex) => {
             const fieldWidth = 
                 fieldIndex === 0 ? firstColumnWidth :
                 fieldIndex === 1 ? secondColumnWidth :
                 fieldIndex === 2 ? thirdColumnWidth : fourthColumnWidth;
   
             const fieldTextHeight = doc
                 .font('Helvetica')
                 .fontSize(10.2) // Set font size to 10.2
                 .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding;
             rowHeight = Math.max(rowHeight, fieldTextHeight); // Update the row height based on the tallest cell
         });
         totalHeight += rowHeight; // Add the row height to the total height
     });
   
     // Draw the outer box for the table
     doc
         .fillColor("#f0f0f0") // Background color for the table
         .rect(startX, startY, boxWidth, totalHeight) // Full table dimensions
         .stroke("black") // Border color
         .fill();
   
     // Draw table rows and cells
     tableData.forEach((row) => {
         let currentX = startX; // Reset X position for each row
         let rowHeight = 0;
   
         // Calculate row height
         Object.values(row).forEach((field, fieldIndex) => {
             const fieldWidth = 
                 fieldIndex === 0 ? firstColumnWidth :
                 fieldIndex === 1 ? secondColumnWidth :
                 fieldIndex === 2 ? thirdColumnWidth : fourthColumnWidth;
   
             const fieldTextHeight = doc
                 .font('Helvetica')
                 .fontSize(10.2) // Set font size to 10.2
                 .heightOfString(field || '', { width: fieldWidth - 2 * padding }) + 2 * padding;
             rowHeight = Math.max(rowHeight, fieldTextHeight);
         });
   
         // Draw each cell in the row
         Object.values(row).forEach((field, fieldIndex) => {
             const fieldWidth = 
                 fieldIndex === 0 ? firstColumnWidth :
                 fieldIndex === 1 ? secondColumnWidth :
                 fieldIndex === 2 ? thirdColumnWidth : fourthColumnWidth;
   
             // Draw the cell background and border
             doc
                 .fillColor("#f5f5f5") // Cell background color
                 .rect(currentX, startY, fieldWidth, rowHeight)
                 .stroke("black")
                 .fill();
   
             const isBold = fieldIndex === 0 || fieldIndex === 2; // Bold for Column 1 and Column 3
   
             doc
                 .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
                 .fontSize(10.2) // Font size
                 .fillColor("black") // Text color
                 .text(field, currentX + padding, startY + padding, {
                     width: fieldWidth - 2 * padding,
                     align: 'left',
                 });
   
             currentX += fieldWidth; // Move to the next cell
         });
   
         startY += rowHeight; // Move to the next row
     });
   }
   
   
     
     
       doc.moveDown()
       const boundariesData = [
           {field1:"1.", field2: "Name of the Property Owner", field3: ": ", field4: `${allPerameters.sellerName} & ${allPerameters.buyerName}`},
           {field1:"2.", field2: "Name of the Applicant/Borrower", field3: ": ", field4: `${allPerameters.applicantName}`},
           {field1:"3.", field2: "Name of Co-Applicant", field3: ": ", field4: `${allPerameters.CoapplicantName},${allPerameters.CoapplicantName1}`},
           {field1:"4.", field2: "Name, Father’s name & Address of the present owner", field3: ": ", field4: `${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} \n\n ${allPerameters.appAdress}`},
           {field1:"5.", field2: "Description of the Property", field3: ": ", field4: `${allPerameters.techFullAdress}`},
   
           {field1:"6.", field2: "Four Boundaries", field3: ": ", field4: `
   East : ${allPerameters.OnOrTowardsEast}
   
   West : ${allPerameters.OnOrTowardsWest}
   
   North : ${allPerameters.OnOrTowardsNorth}
   
   South : ${allPerameters.OnOrTowardsSouth}
   ` },
           
       ]
           BoundariesFunction(boundariesData);
   
         
     doc.addPage();
     addHeader(doc, logoPath);
   
     // addHeader();
   
     y = 170;
     doc
     .fontSize(11)
     .fillColor("black")
     .font('Helvetica-Bold')
     // .text('9. Conclusion', {align:`left`});
     // doc.moveDown()
     // y += 20;
     doc.font('Helvetica-Bold').text(`Original documents submitted with the ${allPerameters.partnerName} for the purposes of creation of equitable mortgage of the said Property: `,50, 168, {align: 'left' }).moveDown();
   
     y += 80;
     doc.font('Helvetica')
       .text(
     `I. Original Co-Ownership Deed No. ${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate} Issued By Sub Ragitrar In Favour of ${allPerameters.sellerName} and ${allPerameters.buyerName}. `,{align:'left'}).moveDown()
           doc.font('Helvetica')
           doc.font('Helvetica').text(`II. Original Praman Patra No.${allPerameters.pramanPatraNo} Dated ${allPerameters.praMANpATRADate} Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By Sarpanch & Sachiv. `,{align:'left'}).moveDown()
   
           doc.font('Helvetica').text(`III. Original Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By ${allPerameters.sealandSignedBy}.`,{align:'left'}).moveDown() 
       .text(
     `IV. Equitable  Mortgage Deed No. ${allPerameters.emDeedNo} Dated ${allPerameters.emDeedDate} Regarding Said Property With Actual Area And House No .  `,{align:'left'}).moveDown()
     doc.font('Helvetica')
     .text(
   `That in furtherance to my Title Opinion and Search Report the aforementioned document is placed before me. on perusal of the document, I find it in order and properly executed and duly stamped.`,{align:'left'})
           doc.moveDown(5)

  doc
  .text(`Indore [M.P] `,{align:'left',continued:true})
  .text(`Yours Faithfully `,{align:'right',}).moveDown()
  .text(`Dated :${allPerameters.date}`,{align:'left'})
  doc.font('Helvetica-Bold').text(`{M.A. Khan} `,{align:'right'})
  doc.font('Helvetica').text(`Advocate`,{align:'right'})





 
  // Finalize the PDF
  doc.end();

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => {
  //     resolve(pdfFileUrl);
  //   });
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}
  
  // ------------------HRMS  create offer letter pdf ---------------------------------------
  // const generateSanctionLetterPdf = async(res,customerId) =>{
    const btexecutedvettingPdf = async(customerId,logo,partnerName) =>{
  
    // const customerId = "673de5ee3ecb1d6e805654a3"
    try{
    console.log(customerId,"in sanction latter")
  
    console.log(partnerName,"partnerName<>>><><><><><>")
  
    const customerDetails = await customerModel.findOne({_id:customerId}).populate('productId')  
    const coApplicantDetails = await coApplicantModel.find({customerId})
    const guarantorDetails = await guarantorModel.findOne({customerId})  
    const applicantDetails = await applicantModel.findOne({customerId})
    const technicalDetails = await technicalModel.findOne({customerId})
    const appPdcDetails = await appPdcModel.findOne({customerId})
    const cibilDetail = await cibilModel.findOne({customerId})
    const disbuDetail  = await DISBURSEMENTModel.findOne({customerId})
    const creditPdDetails = await creditPdModel.findOne({ customerId });
    const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
    const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
    //internalLegalModel
    const internalLegalDATA = await internalLegalModel.findOne({ customerId });
  
    const partnerModel = await lendersModel.findOne({
      _id: finalsanctionDetails.partnerId,
    });
  
    const BranchNameId = customerDetails?.branch;
    // console.log("BranchNameId",BranchNameId)  
          const branchData = await newBranchModel.findById(BranchNameId);
          // if (!branchData) {
          //     return badRequest(res, "Branch data not found for the given branchId");
          // }
          const branchName = branchData?.name; 
  
  
  
  
    // const BranchNameId = customerDetails?.branch;
    // // console.log("BranchNameId",BranchNameId)
    //       const branchData = await externalBranchModel.findById(BranchNameId);
    //       if (!branchData) {
    //           return badRequest(res, "Branch data not found for the given branchId");
    //       }
    //       const branchName = branchData.name; 
  
      // console.log(customerDetails,"customerDetails")
  
      const address = [
        applicantDetails?.permanentAddress?.addressLine1,
        applicantDetails?.permanentAddress?.addressLine2,
        applicantDetails?.permanentAddress?.city,
        applicantDetails?.permanentAddress?.district,
        applicantDetails?.permanentAddress?.state,
        applicantDetails?.permanentAddress?.pinCode
      ].filter(Boolean).join(', ');
  
      const timestamp = Date.now();
  
  // Convert timestamp to a Date object
  const currentDate = new Date(timestamp);
  
  // Format the date to dd/mm/yy
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
  });
  
  const formatDate = (praMANpATRADate) => {
  if (!praMANpATRADate) return "NA"; // Agar DOB available nahi hai to "NA" return kare
  const date = new Date(praMANpATRADate); // Date object me convert kare
  const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
  const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
  return `${day}-${month}-${year}`; // Final format
  };


  const AppAddress = applicantDetails?.fullName === internalLegalDATA?.sellerName
  ? (applicantDetails?.localAddress?.addressLine1 || 'NA')
  : coApplicantDetails?.[0]?.fullName === internalLegalDATA?.sellerName
    ? coApplicantDetails[0]?.localAddress?.addressLine1 || 'NA'
    : 'NA';
      
      const allPerameters = {
        date:formattedDate||"NA",
        partnerName:partnerModel?.fullName||"NA",
        partnerAdress:partnerModel?.registerAddress||"NA",
        partnerCoAdress:partnerModel?.corporateAddress||"NA",
        partnerEmail:partnerModel?.email||"NA",
        partnerContact:partnerModel?.phoneNumber||"NA",
        partnerCinNo:partnerModel?.cinNo||"NA",
  
  
        sellerFatherName:internalLegalDATA?.sellerFatherName||"NA",
      sealandSignedBy:internalLegalDATA?.SealandSignedBy?.signedBy||"NA",
        sellerName:internalLegalDATA?.sellerName||"NA",
        buyerName:internalLegalDATA?.buyerName||"NA",
        applicantName:applicantDetails?.fullName||"NA",
        applicantFatherName:applicantDetails?.fatherName||"NA",
  
        CoapplicantName:coApplicantDetails?.[0]?.fullName||"NA",
        CoapplicantName1:coApplicantDetails?.[1]?.fullName||"NA",

  
        techFullAdress:technicalDetails?.fullAddressOfProperty||"NA",
        propertyOwner:technicalDetails?.nameOfDocumentHolder||"NA",
  
        appAdress:AppAddress,
  
        OnOrTowardsNorth: technicalDetails?.northBoundary|| "NA",
        OnOrTowardsSouth: technicalDetails?.southBoundary|| "NA",
        OnOrTowardsEast: technicalDetails?.eastBoundary|| "NA",
        OnOrTowardsWest: technicalDetails?.westBoundary|| "NA",
  
        pramanPatraNo:internalLegalDATA?.pramanPatra?.no||"NA",
        praMANpATRADate:formatDate(internalLegalDATA?.pramanPatra?.date)||"NA",
        gramPanchayat:technicalDetails?.gramPanchayat||"NA",
        Tehsil:technicalDetails?.tehsil||"NA",
        district:technicalDetails?.district||"NA",
        state:technicalDetails?.state||"NA",
  
        taxReciptNo:internalLegalDATA?.taxReceipt?.no||"NA",
        taxReciptDate:formatDate(internalLegalDATA?.taxReceipt?.date)||"NA",
  
        coOwnerShipDeedNo:internalLegalDATA?.co_ownership_deed?.no||"NA",
        coOwnerShipDeedDate:formatDate(internalLegalDATA?.co_ownership_deed?.date)||"NA",
  
        emDeedNo:internalLegalDATA?.EM_DEED?.no||"NA",
        emDeedDate:formatDate(internalLegalDATA?.EM_DEED?.date)||"NA",
  
        landArea:technicalDetails?.totalLandArea||"NA",
      }
        const pdfPath = await sanctionLetterPdf(allPerameters,logo,partnerName);
        
    
        if (!pdfPath) {
         console.log("Error generating the Sanction Letter Pdf")
        }
        console.log(pdfPath,"sanction pdfpath")
        const uploadResponse = await uploadPDFToBucket(pdfPath, `btExecutedvetting${Date.now()}.pdf`);
         const url = uploadResponse.url
         console.log(url,"url")        
         await internalLegalModel.findOneAndUpdate(
         { customerId }, // Query to find the specific customer document
         {
          Generate_vetting_Report: "true",
          Generate_vetting_Report_link: url,
         },
         { new: true, upsert: false } // Options: Return the updated document, don't create a new one
       );
        // return pdfPath
        // success(res, "PDF generated successfully", pdfPath);
        return (
          {
            btexecutedvetting:url,
        }); 
      } catch (error) {
        console.log(error);
        // unknownError(res, error);
      }
  }

  const uploadPDFToBucket = async (pdfBuffer, fileName) => {
    try {
      const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${fileName}`;
      const bucketName = 'finexe'; 
      const contentType = 'application/pdf';
  
      const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, pdfBuffer, 'public-read', contentType);
  
      return { url: `https://cdn.fincooper.in/${filePathInBucket}` };
    } catch (error) {
      console.error('Error uploading PDF to bucket:', error);
      throw new Error('Upload failed');
    }
  };
  module.exports = { sanctionLetterPdf, btexecutedvettingPdf };
  