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
    // const pdfFilename = `btExecutedfinallegalPdf.pdf`;

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
        .text('LEGAL SCRUTINY REPORT', { align: 'center',underline:true });

        doc.fontSize(9).font('Helvetica-Bold')
        .text('To,', { align: 'left' })
        .text(`${allPerameters.partnerName}`, { align: 'left' })
        .font('Helvetica').text(`Registered Adress:-${allPerameters.partnerAdress},\n Corporate Adress:-${allPerameters.partnerCoAdress}`, { align: 'left' })
        .text(`Email:${allPerameters.partnerEmail}`, { align: 'left' })
        .text(`Contact No.${allPerameters.partnerContact}`, { align: 'left' })
        .text(`CIN-${allPerameters.partnerCinNo}`, { align: 'left' }).moveDown(0.3);

        doc.font('Helvetica-Bold').text(`Loan Application Of :   `, { align: 'left',continued:true });
        doc.fontSize(10).text(` ${allPerameters.applicantName} & ${allPerameters.CoapplicantName},${allPerameters.CoapplicantName1}`,{align:'right'}).moveDown(0.6);
    doc.font('Helvetica-Bold').text('Title Search Report/ Legal Verification Of Documents In Respect Of Freehold Residential House Built On', { align: 'left' }).moveDown(0.6);
    // doc.text('Built On', { align: 'left' });
    doc.font('Helvetica').text(`${allPerameters.techFullAdress}`, { align: 'left' }).moveDown(0.5);


    doc.fontSize(9).font('Helvetica-Bold').moveDown(0.5)
    .text('Dear Sir/Madam', { align: 'left' }).moveDown(0.5)
    .text(`This Is With Reference To Your Request For My Legal Opinion In The Matter Of The Title Of The Said Property.I Have Carefully Examined The Relevant Documents Of The Said Property Given To Me Which Are In Order. As Such I Am Submitting Here-In-Below My Legal Opinion On The Captioned Matter:-`, { align: 'left' })
        // .text('Said Property.I Have Carefully Examined The Relevant Documents Of The Said Property Given To', 50, 425)
        // .text('Me Which Are In Order. As Such I Am Submitting Here-In-Below My Legal Opinion On The', 50, 440)
        // .text('Captioned Matter:-', 50, 455);



        function drawTable1(tableData) {
          // Add Table Header
          const startX = 50;
          let startY = doc.y + 10;
          const columnWidths = [500];
        
          const keyWidth = Math.round((columnWidths[0] * 1) / 3);
      const valueWidth = Math.round((columnWidths[0] * 1) / 1.5);
        
          // Render table rows
          tableData.forEach((row, rowIndex) => {
            // Calculate the height of the text for both the key and value fields
            const keyTextHeight = doc
              .font(font)
              .fontSize(9)
              .heightOfString(row.field1 || "", {
                width: keyWidth - 10, // Subtracting padding for accurate measurement
              });
        
            const valueTextHeight = doc
              .font(font)
              .fontSize(9)
              .heightOfString(row.value1 || "", {
                width: valueWidth - 10, // Subtracting padding for accurate measurement
              });
        
            // Determine the row height based on the taller content
            const rowHeight = Math.max(keyTextHeight, valueTextHeight) + 10; // Add padding
        
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
        
            // Draw text in the key cell
            doc
              .font(font)
              .fillColor("black")
              .fontSize(9)
              .text(row.field1, startX + 5, startY + 5, {
                width: keyWidth - 10,
              });
        
            // Alternate row background color for the value cell
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke()
              .fill();
        
            // Draw text in the value cell
            doc
              .font(font)
              .fillColor("black")
              .fontSize(9)
              .text(row.value1, startX + keyWidth + 5, startY + 5, {
                width: valueWidth - 10,
              });
        
            // Move to the next row position
            startY += rowHeight;
          });
        }
        
  
    const loanTableData = [
      { field1: "1. Name Of Current Property Owner :", value1: `${allPerameters.sellerName}` },
      { field1: "2. Name Of Proposed Property Owner :", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}` },
      { field1: "3. Name Of The Applicant/Borrower(S)", value1: `${allPerameters.applicantName}` },
      { field1: "4. Name Of The Co-Applicant:", value1: `${allPerameters.CoapplicantName},${allPerameters.CoapplicantName1}` },
      { field1: `5. Mortgage Loan Disbursement\n Cheque To Be Issued In Favour Of :`, value1: `${allPerameters.applicantName},S/o ${allPerameters.applicantFatherName}` },
      { field1: "6. Nature Of The Property:", value1: `Freehold` },
      { field1: "7. Status Of Report :", value1: `Positive` },
      { field1: "8. Description Of The Property :", value1: `${allPerameters.techFullAdress}` },
    ];
    drawTable1(loanTableData);
    y = 170;
    doc.moveDown()

    // function drawTable2(tableData) {
    //   // Add Table Header
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const columnWidths = [500];
    
    //   const keyWidth = Math.round((columnWidths[0] * 1) / 3);
    //   const valueWidth = Math.round((columnWidths[0] * 1) / 1.5);
    
    //   // Render table rows
    //   tableData.forEach((row, rowIndex) => {
    //     // Calculate the height of the text for both the key and value fields
    //     const keyTextHeight = doc
    //       .font(font)
    //       .fontSize(7.2)
    //       .heightOfString(row.field1 || "", {
    //         width: keyWidth - 10, // Subtracting padding for accurate measurement
    //       });
    
    //     const valueTextHeight = doc
    //       .font(font)
    //       .fontSize(7.2)
    //       .heightOfString(row.value1 || "", {
    //         width: valueWidth - 10, // Subtracting padding for accurate measurement
    //       });
    
    //     // Determine the row height based on the taller content
    //     const rowHeight = Math.max(keyTextHeight, valueTextHeight) + 10; // Add padding
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, keyWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text in the key cell
    //     doc
    //       .font(font)
    //       .fillColor("black")
    //       .fontSize(7.2)
    //       .text(row.field1, startX + 5, startY + 5, {
    //         width: keyWidth - 10,
    //       });
    
    //     // Alternate row background color for the value cell
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //       .stroke()
    //       .fill();
    
    //     // Draw text in the value cell
    //     doc
    //       .font(font)
    //       .fillColor("black")
    //       .fontSize(7.2)
    //       .text(row.value1, startX + keyWidth + 5, startY + 5, {
    //         width: valueWidth - 10,
    //       });
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    
    

    // doc.fontSize(10).font('Helvetica')
    //     .text('Boundary Of The Plot',50,675)

    //     const loanTableData1 = [
    //       { field1: "East :", value1: `${allPerameters.OnOrTowardsEast}` },
    //       { field1: "West :", value1: `${allPerameters.OnOrTowardsWest}` },
    //       { field1: `North :`, value1: `${allPerameters.OnOrTowardsNorth}` },
    //       { field1: "South :", value1: `${allPerameters.OnOrTowardsSouth}` },
    //     ];
    //     drawTable2(loanTableData1);
      



    // addHeader();
    doc.addPage();
    addHeader(doc, logoPath);
        doc.moveDown(8);
        doc
        .fontSize(11)
        .fillColor("black")
        .font('Helvetica-Bold')

        function drawTable2(tableData) {
          // Add Table Header
          const startX = 50;
          let startY = doc.y + 10;
          const columnWidths = [500];
        
          const keyWidth = Math.round((columnWidths[0] * 1) / 3);
          const valueWidth = Math.round((columnWidths[0] * 1) / 1.5);
        
          // Render table rows
          tableData.forEach((row, rowIndex) => {
            // Calculate the height of the text for both the key and value fields
            const keyTextHeight = doc
              .font(font)
              .fontSize(9)
              .heightOfString(row.field1 || "", {
                width: keyWidth - 10, // Subtracting padding for accurate measurement
              });
        
            const valueTextHeight = doc
              .font(font)
              .fontSize(9)
              .heightOfString(row.value1 || "", {
                width: valueWidth - 10, // Subtracting padding for accurate measurement
              });
        
            // Determine the row height based on the taller content
            const rowHeight = Math.max(keyTextHeight, valueTextHeight) + 10; // Add padding
        
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
        
            // Draw text in the key cell
            doc
              .font(font)
              .fillColor("black")
              .fontSize(9)
              .text(row.field1, startX + 5, startY + 5, {
                width: keyWidth - 10,
              });
        
            // Alternate row background color for the value cell
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke()
              .fill();
        
            // Draw text in the value cell
            doc
              .font(font)
              .fillColor("black")
              .fontSize(9)
              .text(row.value1, startX + keyWidth + 5, startY + 5, {
                width: valueWidth - 10,
              });
        
            // Move to the next row position
            startY += rowHeight;
          });
        }
        
        
    
        doc.fontSize(9).font('Helvetica-Bold')
            .text('Boundary Of The Plot',50,168)
    
            const loanTableData1 = [
              { field1: "East :", value1: `${allPerameters.OnOrTowardsEast}` },
              { field1: "West :", value1: `${allPerameters.OnOrTowardsWest}` },
              { field1: `North :`, value1: `${allPerameters.OnOrTowardsNorth}` },
              { field1: "South :", value1: `${allPerameters.OnOrTowardsSouth}` },
            ];
            drawTable2(loanTableData1);

    doc.fontSize(9)
    .fillColor("black")
    .font('Helvetica-Bold')
        .text('7. Copy Of Documents Examined:',50,318, {align:`left`});
        doc.moveDown()


        doc.fontSize(9)
        .font('Helvetica')
        
            .text(
      `I.Copy of Co-Ownership Deed No. ${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate} Issued By Sub Ragitrar In Favour of ${allPerameters.sellerName} and${allPerameters.buyerName}. `, {align:`left`}).moveDown()
      // .text(
        // `II.Copy Of Praman Patra No.${allPerameters.pramanPatraNo} Dated ${allPerameters.praMANpATRADate} Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour Of ${allPerameters.applicantName} S/O ${allPerameters.applicantFatherName} & Sign By Sarpanch & Sachiv.`, {align:`left`}).moveDown()
     .text(
      `II. Copy Of Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By ${allPerameters.sealandSignedBy}.`, {align:`left`}).moveDown()
      .text(`III.LOD of ${allPerameters.BT_BANK_NAME}.`, {align:`left`}).moveDown()


   

    doc.font('Helvetica-Bold')
    .text('8. Observations',{align:'left'}).moveDown();
    y += 20;
    doc.text('That As Per Available Copy of Documents,Instructions And Policy Of The Company We Found That –',{align:'left'});
      doc.moveDown()
    doc.font('Helvetica')
    .text(
      `${allPerameters.techFullAdress} Owner And Possessed By Mr.${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName}`, {align:`left`}).moveDown()
            
    .text(
      `I.That Co-Ownership Deed No.${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate}. Issued By Sub Ragitrar In Favour of ${allPerameters.sellerName} and ${allPerameters.buyerName}.`, {align:`left`}).moveDown()
      // .text(
      //   `II.That Also Praman Patra No.${allPerameters.pramanPatraNo} Dated ${allPerameters.praMANpATRADate} Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour Of ${allPerameters.applicantName} S/O ${allPerameters.applicantFatherName} & Sign By Sarpanch & Sachiv.`, {align:`left`}).moveDown()
      .text(
        `II.That Said Owner /Possession Holder Also Paid Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By Sarpanch & Sachiv.`, {align:`left`}).moveDown()
        .text(
          `III. Said Property Already Mortage With ${allPerameters.BT_BANK_NAME}.`, {align:`left`}).moveDown();

    doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('9. Conclusion', {align:`left`});
    doc.moveDown()
    y += 20;
    doc.font('Helvetica').text(
      `${allPerameters.sellerName} S/O ${allPerameters.sellerFatherName} Is The Recorded Owner Of Freehold Residential Land Admeasuring Area ${allPerameters.landArea} Sq Ft ${allPerameters.techFullAdress} Having A Clear And Marketable Title Over The Said Property As Per Available Record And Documents  `, {align: 'left' });
      doc.moveDown()

      // doc
      // .fontSize(11)
      // .font('Helvetica-Bold').text('Search Certificate:',{align:`left`});
      // y += 20;
      // doc.font('Helvetica').text(
      //   `I Carried Out Search Of Index No. I Book No. I In The Concerned Office Of The Sub-Registrar In Respect Of ${allPerameters.techFullAdress} Measuring ${allPerameters.landArea} Sq. Ft. (Super Built Up Area) For The Last 13 Years And I Did Not Find Any Entry Therein Effecting Any Transfer Of The Property By Way Of Sale, Gift, Mortgage Etc `,{align:`left`}).moveDown(0.5);

    

    // PAGE 3
    doc.addPage();
    addHeader(doc, logoPath);


    // addHeader();

    // y = 170;
    doc
    .fontSize(11)
    .fillColor("black")
    .font('Helvetica-Bold')
    // .text('9. Conclusion', {align:`left`});
    // doc.moveDown()
    // y += 20;
    // doc.font('Helvetica').text(`
    // Kailash Ningwal S/O Sukhlal Is The Recorded Owner Of Freehold Residential Land Admeasuring Area 4800 Sq Ft House No 01 Survey No.520/825 Patwari Halka No.99/165 Ward No.01 Village Pipriman Gram Panchyat Pipriman Tehsil Manawar District Dhar State Madhya Pradesh Pin Code 454446 Having A Clear And Marketable Title Over The Said Property As Per Available Record And Documents  `, {align: 'left' });

    y += 80;
    doc.moveDown()
    doc
    .fontSize(9)
    .font('Helvetica-Bold').text('Search Certificate:',50,168,{align:`left`}).moveDown();
    y += 20;
    doc.font('Helvetica')
    .text(
      `I Carried Out Search Of Index No. I Book No. I In The Concerned Office of The Sub-Registrar In Respect of ${allPerameters.techFullAdress} Measuring ${allPerameters.landArea} Sq. Ft. (Super Built Up Area) For The Last 13 Years And I Did Not Find Any Entry Therein Effecting Any Transfer of The Property By Way Of Sale, Gift, Mortgage Etc `,{align:`left`}).moveDown()
    .text(
      `As Desired, The Documents As Received, Are Returned Herewith. We Confirm That The Subject Property/Floor Is Covered Under The Sarfaesi Act.After Takingnoc From Competent Authority For Mortgage ,Anaffidevit Regarding Ownership And Possession Along With Property Free From Litigation or Disputed or Free From Lien or Mortgage Must Be Taken As No Manual Record Since 2015 Available Also Some Record Not Found or Turn In Sro. `,{align:`left`}).moveDown(0.5);
   
    doc
    .fontSize(9)
    .font('Helvetica-Bold').text('Encl:-Electro State Copy Of Documents Examined As Per Para 3 (I To III) ',{align:`left`}).moveDown()
    .font('Helvetica-Bold').text('Documents Required For Creation of An Equitable Mortgage on The Said Property ',{align:`left`,underline:true});
doc.moveDown()
    doc.font('Helvetica')
    .text(
      `1 Documents To Be Collected By ${allPerameters.partnerName} Prior To Disbursement Of Cheque-As Per bellow  `,{align:`left`})
      // .text(
    // `2. Documents Required Post Disbursement/Follow-Up-As Per Annexure-I `,{align:`left`}).moveDown()
    doc.font('Helvetica')
    .text(`I. Original Co-Ownership Deed No. ${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate} Issued By Sub Ragitrar In Favour of ${allPerameters.sellerName} and ${allPerameters.buyerName}. `,{align:'left'}).moveDown()

    // doc.font('Helvetica').text(`II. Original Praman Patra No.${allPerameters.pramanPatraNo} Dated ${allPerameters.praMANpATRADate} Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour Of ${allPerameters.applicantName} S/O ${allPerameters.applicantFatherName} & Sign By Sarpanch & Sachiv. `,{align:'left'}).moveDown()

    doc.font('Helvetica').text(`II. Original Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By ${allPerameters.sealandSignedBy}.`,{align:'left'}).moveDown() 
 
    doc.font('Helvetica').text(`III. Equitable Mortgage Deed Regarding Said Property With Actual Area And House No . 
        `,{align:'left'}).moveDown()
    
        doc.font('Helvetica').font('Helvetica-Bold').text(`Documents To Be Collected By Prior To Disbursement Of Cheque-${allPerameters.partnerName} `,{align:`left`,underline:true}).moveDown();


    // y += 100;
    // doc.text('Documents Required For Creation Of An Equitable Mortgage On The Said Property:', 50, y);

    doc.font('Helvetica')
    .text(`I. Original Co-Ownership Deed No. ${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate} Issued By Sub Ragitrar In Favour Of ${allPerameters.sellerName} and ${allPerameters.buyerName}. `,{align:'left'}).moveDown()

    // doc.font('Helvetica').text(`II. Original Praman Patra No.${allPerameters.pramanPatraNo} Dated ${allPerameters.praMANpATRADate} Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour Of ${allPerameters.applicantName} S/O ${allPerameters.applicantFatherName} & Sign By Sarpanch & Sachiv. `,{align:'left'}).moveDown()

    doc.font('Helvetica').text(`II. Original Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour Of ${allPerameters.sellerName} S/O ${allPerameters.sellerFatherName} & Sign By Sarpanch & Sachiv.`,{align:'left'}).moveDown() 
    . text(`III. Equitable Mortgage Deed Regarding Said Property With Actual Area And House No . `,{align:'left'})
    doc.addPage();
    addHeader(doc, logoPath);


    // addHeader();

    // y = 170;
    doc
    .fontSize(9)
    .fillColor("black")
    .font('Helvetica')
    .moveDown()
    doc.font('Helvetica')
    // text(`III. Equitable Mortgage Deed Regarding Said Property With Actual Area And House No . 
    //     `,50,170,{align:'left'})
        .text(
          `VIII. LOD and NOC OF ${allPerameters.BT_BANK_NAME}.`,50,170, {align:`left`}).moveDown(5)
    // requiredDocs.forEach(text => {
    //     doc.text(text, 50, y, { width: 495 });
    //     y += 40;
    // });

    // y += 20;
    doc.font('Helvetica')
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
    const btexecutedfinallegalPdf = async(customerId,logo,partnerName) =>{
  
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

        propertyOwnerName:internalLegalDATA?.PropertyOwnerName||"NA",
        propertyOwnerFatherName:internalLegalDATA?.PropertyOwnerFatherName||"NA",


        techFullAdress:technicalDetails?.fullAddressOfProperty||"NA",
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

        BT_BANK_NAME:internalLegalDATA?.BT_BANK_NAME||"NA",

        landArea:technicalDetails?.totalLandArea||"NA",
      }
        const pdfPath = await sanctionLetterPdf(allPerameters,logo,partnerName);
        
    
        if (!pdfPath) {
         console.log("Error generating the Sanction Letter Pdf")
        }

        const uploadResponse = await uploadPDFToBucket(pdfPath, `btExecutedfinallegalPdf${Date.now()}.pdf`);
        const url = uploadResponse.url
        console.log(url,"url")        
        await internalLegalModel.findOneAndUpdate(
        { customerId }, // Query to find the specific customer document
        {
          Generate_final_legal: "true",
          Generate_final_legal_link: url,
        },
        { new: true, upsert: false } // Options: Return the updated document, don't create a new one
      );
        console.log(pdfPath,"sanction pdfpath")
        
        return (
          {
            btexecutedfinallegal:url,
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
  
  
  module.exports = { sanctionLetterPdf, btexecutedfinallegalPdf };
  