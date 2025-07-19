const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  const PDFDocument = require("pdfkit");
  const path = require("path");
  const fs = require("fs");
  const moment = require("moment");
  const { validationResult } = require("express-validator");
//   const vv = require("../../../../../assets/image/FINCOOPERSLOGO.png")
  const pdfLogo = path.join(
    __dirname,
    "../../../../assets/image/FINCOOPERSLOGO.png"
  );
  const checkedLogo = path.join( __dirname,
    "../../../../assets/image/checkbox-checked.png")
  const unCheckedLogo = path.join( __dirname,
      "../../../../assets/image/checkbox-unchecked.256x256.png")
  const watermarklogo = path.join(
    __dirname,
    "../../../../assets/image/watermarklogo.png"
  );
  const mongoose = require("mongoose");


  const customerModel = require('../model/customer.model')
const coApplicantModel = require('../model/co-Applicant.model')
const guarantorModel = require('../model/guarantorDetail.model')
const applicantModel = require('../model/applicant.model')
const technicalModel = require('../model/branchPendency/approverTechnicalFormModel')
const appPdcModel = require('../model/branchPendency/appPdc.model')
disbursementModel =require('../model/fileProcess/disbursement.model')
finalSanctionModel = require('../model/fileProcess/finalSanction.model')
gtrPdcModel = require('../model/branchPendency/gtrPdc.model')




  // Helper function to capitalize the first letter of each word in a name
function capitalizeFirstLetter(name) {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  async function RcplLdAndPgDeedpdf(allPerameters) {
    const font = "assets/font/Cambria.ttf";
    const fontBold = "assets/font/Cambria-Bold.ttf";
    const fontKerlaTamil = "assets/font/KarlaTamilUpright-Regular.ttf"
    const fontUrdu = "assets/font/IBMPlexSansArabic-Regular.ttf"
    const fontTelugu = "assets/font/TiroTelugu-Regular.ttf"
    const fontPanjabi = "assets/font/BalooPaaji2-VariableFont_wght.ttf"
    const fontMalayam = "assets/font/AnekMalayalam-VariableFont_wdth.ttf"
    const fontKannada = "assets/font/NotoSansKannada-VariableFont_wdth.ttf"
    const fontGujarati = "assets/font/Rasa-VariableFont_wght.ttf"
    const fontHindi = "assets/font/Mukta-Regular.ttf"
    const fontOriya = 'assets/font/BalooBhaina2-VariableFont_wght.ttf'
    const fontMarathi = 'assets/font/Hind-Regular.ttf'
    const fontBengali = 'assets/font/NotoSansBengali-VariableFont_wdth.ttf'
    const baseDir = path.join("./uploads/");
    const outputDir = path.join(baseDir, "pdf/");
//fontKerlaTamil,fontUrdu,fontTelugu,fontSans,fontGurmukhi,fontMalayam
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
    function addLogo() {
      if (fs.existsSync(pdfLogo)) {
        doc.image(pdfLogo, 400, 50, {
          fit: [150, 50],
          align: "right",
          valign: "bottom",
        });
      } else {
        console.error(`Logo file not found at: ${pdfLogo}`);
      }
    }
  
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
    // Footer with border and stylized text
    function addFooter() {
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
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const timestamp = Date.now();
    // const candidateName = 
    // (`${candidateDetails.name}`); // Capitalize name
    const pdfFilename = `RcplLdAndPgDeed.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
  
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
  
    doc.pipe(stream);
  
    // Add logo and border to the first page
    addLogo();
    //   addWatermark();
    drawBorder();
  
    // Title styling for OFFER LETTER in uppercase and underlined
    doc.moveDown(4);
    const yPosition = doc.y; // Get the current y position

    function DRAWTABLE(tableTitle, tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const indexWidth = 30;
      const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
      // Draw table title with a colored header
      doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
      doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
          .text(tableTitle, startX + 5, startY + 5, { align: 'center' });
    
      startY += 20; // Move down for the first row
    
      let sectionIndex = null; // Track the section index to span the column
      
      // Render each row in the table
      tableData.forEach((row, rowIndex) => {
          // Measure text height for row.field1 and row.value1
          const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
          const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
    
          // Calculate row height based on the tallest content
          const rowHeight = Math.max(20, field1Height, value1Height) + 10; // Adding padding for better spacing
    
          // Only display the index once per section, in the first row
          const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
          if (row.index) {
              sectionIndex = row.index; // Set current section index
          }
    
          // Draw the index in the first column (only for the first row of each section)
          doc.fillColor('#ffffff')
              .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Stroke color set to black
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
    
          // Draw the key in the second column
          doc.fillColor('#f5f5f5')
              .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
    
          // Draw the value in the third column
          doc.fillColor('#ffffff')
              .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
    
          // Move startY down by rowHeight for the next row
          startY += rowHeight;
      });
    }
    
    
    function DrawTablewithoutHeader(tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const indexWidth = 30;
      const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
      let sectionIndex = null; // Track the section index to span the column
      
      // Render each row in the table
      tableData.forEach((row, rowIndex) => {
          // Measure text height for row.field1 and row.value1
          const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
          const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
    
          // Calculate row height based on the taller content
          const rowHeight = Math.max(20, field1Height, value1Height) + 10; // 10 for padding
    
          // Only display the index once per section, in the first row
          const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
          if (row.index) {
              sectionIndex = row.index; // Set current section index
          }
    
           if (["penal Charges"].includes(row.field1)) {
            rowHeight = Math.max(rowHeight, 38.5); 
                   }
    
          // Draw the index in the first column (only for the first row of each section)
          doc.fillColor('#ffffff')
              .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Line color set to black
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
    
          // Draw the key in the second column
          doc.fillColor('#f5f5f5')
              .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
    
          // Draw the value in the third column
          doc.fillColor('#ffffff')
              .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
    
          // Move startY down by rowHeight for the next row
          startY += rowHeight;
      });
    }
    
    
    // function DRawTable(tableTitle, tableData, spanIndex) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const columnWidths = [500];
    //   const indexWidth = 30;
    //   const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
    //   const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
    //   // Add table title
    //   doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
    //   doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5).text(tableTitle, startX + 5, startY + 5, { align: 'center' });
    
    //   startY += 20; // Move down for the first row
    
    //   let sectionIndex = null;
    
    //   // Helper function to calculate the height of the text
    //   function calculateTextHeight(text, width) {
    //     return doc.font('Helvetica').fontSize(8.3).heightOfString(text, { width });
    //   }
    
    //   // Render each row in the table
    //   tableData.forEach((row, rowIndex) => {
    //       // Calculate the height needed for each cell's text
    //       const field1Height = calculateTextHeight(row.field1, keyWidth);
    //       const value1Height = calculateTextHeight(row.value1, valueWidth);
    //       const rowHeight = Math.max(field1Height, value1Height) + 10; // Add padding for readability
    
    //       // Display the index only once if it matches a section needing a span
    //       const indexLabel = row.index && spanIndex ? row.index : '';
    
    //       if (row.index) {
    //           sectionIndex = row.index;
    //       }
    
    //       // Draw the index in the first column (only once if spanIndex is true)
    //       if (indexLabel) {
    //           doc.fillColor('#ffffff')
    //               .rect(startX, startY, indexWidth, rowHeight * tableData.length).stroke().fill(); // Span vertically for entire section
    //           doc.font('Helvetica').fillColor('black').fontSize(8.3)
    //               .text(indexLabel, startX + 5, startY + 5, { width: indexWidth - 10, height: rowHeight * tableData.length });
    //       }
    
    //       // Draw the key in the second column
    //       doc.fillColor('#f5f5f5')
    //           .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke().fill();
    //       doc.font('Helvetica').fillColor('black').fontSize(8.3)
    //           .text(row.field1, startX + indexWidth + 5, startY + 5, { width: keyWidth - 10 });
    
    //       // Draw the value in the third column
    //       doc.fillColor('#ffffff')
    //           .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke().fill();
    //       doc.font('Helvetica').fillColor('black').fontSize(8.3)
    //           .text(row.value1, startX + indexWidth + keyWidth + 5, startY + 5, { width: valueWidth - 10 });
    
    //       startY += rowHeight; // Move down to the next row, based on dynamic height
    //   });
    // }

    function DRawTable(tableTitle, tableData, spanIndex) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const indexWidth = 30;
      const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
  
      // Add table title
      doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
      doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5).text(tableTitle, startX + 5, startY + 5, { align: 'center' });
  
      startY += 20; // Move down for the first row
  
      let sectionIndex = null;
      let totalSectionHeight = 0;
  
      // Calculate total height needed for all rows if spanIndex is true
      tableData.forEach(row => {
          const field1Height = doc.font('Helvetica').fontSize(8.3).heightOfString(row.field1, { width: keyWidth });
          const value1Height = doc.font('Helvetica').fontSize(8.3).heightOfString(row.value1, { width: valueWidth });
          totalSectionHeight += Math.max(field1Height, value1Height) + 10;
      });
  
      // Draw the index as a single cell spanning the full height if spanIndex is true
      if (spanIndex && tableData[0].index) {
          sectionIndex = tableData[0].index;
          doc.fillColor('#ffffff')
              .rect(startX, startY, indexWidth, totalSectionHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(sectionIndex, startX + 5, startY + (totalSectionHeight / 2) - 5, {
                  width: indexWidth - 10,
                  align: 'center',
                  height: totalSectionHeight
              });
      }
  
      // Render each row in the table without the index label
      tableData.forEach(row => {
          // Calculate the height needed for each cell's text
          const field1Height = doc.font('Helvetica').fontSize(8.3).heightOfString(row.field1, { width: keyWidth });
          const value1Height = doc.font('Helvetica').fontSize(8.3).heightOfString(row.value1, { width: valueWidth });
          const rowHeight = Math.max(field1Height, value1Height) + 10; // Add padding for readability
  
          // Draw the key in the second column
          doc.fillColor('#f5f5f5')
              .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.field1, startX + indexWidth + 5, startY + 5, { width: keyWidth - 10 });
  
          // Draw the value in the third column
          doc.fillColor('#ffffff')
              .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.value1, startX + indexWidth + keyWidth + 5, startY + 5, { width: valueWidth - 10 });
  
          startY += rowHeight; // Move down to the next row, based on dynamic height
      });
  }
  
  
  
    
    
    
    function DRAWTable(tableData, spanIndex) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const indexWidth = 30;
      const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
      doc.strokeColor('#000000'); // Set border line color to black for the entire table
    
    
      let sectionIndex = null;
    
      // Helper function to calculate the height of the text
      function calculateTextHeight(text, width) {
        return doc.font('Helvetica').fontSize(8.3).heightOfString(text, { width });
      }
    
      // Render each row in the table
      tableData.forEach((row, rowIndex) => {
          // Calculate the height needed for each cell's text
          const field1Height = calculateTextHeight(row.field1, keyWidth);
          const value1Height = calculateTextHeight(row.value1, valueWidth);
          const rowHeight = Math.max(field1Height, value1Height) + 10; // Add padding for readability
    
          // Display the index only once if it matches a section needing a span
          const indexLabel = row.index && spanIndex ? row.index : '';
    
          if (row.index) {
              sectionIndex = row.index;
          }
    
          // Draw the index in the first column (only once if spanIndex is true)
          if (indexLabel) {
              doc.fillColor('#ffffff')
                  .rect(startX, startY, indexWidth, rowHeight * tableData.length).stroke().fill(); // Span vertically for entire section
              doc.font('Helvetica').fillColor('black').fontSize(8.3)
                  .text(indexLabel, startX + 5, startY + 5, { width: indexWidth - 10, height: rowHeight * tableData.length });
          }
    
          // Draw the key in the second column
          doc.fillColor('#f5f5f5')
              .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.field1, startX + indexWidth + 5, startY + 5, { width: keyWidth - 10 });
    
          // Draw the value in the third column
          doc.fillColor('#ffffff')
              .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(row.value1, startX + indexWidth + keyWidth + 5, startY + 5, { width: valueWidth - 10 });
    
          startY += rowHeight; // Move down to the next row, based on dynamic height
      });
    }

  doc
    .fontSize(12)
    .font(fontBold)
    .text("Schedule I", { align: "center", underline: true });
  doc.moveDown(0.6);

  // Format the borrower details to the left side
  doc
    .font(fontBold)
    .fontSize(12)
    .fillColor("black")
    .text(
      "Details of the Loan",
        
      {
        lineGap: 1,
        align: "center",
         underline: true
      }
    );
    doc.moveDown(1);
    
//  unworked
    const AgreementDetails = [
      {index: '1',field1:"Date of the Agreement",value1:`${allPerameters.agreementdate}` },
      {index: '2',field1: "Place of Execution ",value1: `${allPerameters.placeOfExecution}` },
    ];
    DRAWTABLE("Agreement Details", AgreementDetails,false)
    doc.moveDown();

      const DetailsoftheBorrower = [
        {index: '3', field1: "Name of the Borrower(s)", value1: `${allPerameters.borrowerName}` },
        { field1: 'Constitution of the Borrower(s) ', value1: `${allPerameters?.constitutionBorrower}` },
        { field1: 'PAN/TAN/CIN of the Borrower(s)', value1: `${allPerameters.borrowerpanNo}` }, //unworked constitution
        { field1: 'Address of the Borrower(s)', value1: `${allPerameters.borroewraddress}` },
        { field1: 'Email – address(es)', value1: `${allPerameters.borroweremail}` },
        { field1: 'Phone No. (s)', value1: `${allPerameters.borrwermobileNo}` },
        {field1: 'Attention: Mr./Ms.', value1: `${allPerameters.borrowerName}` },// unworked mr/ms
    ];
    DRawTable("Details of the Borrower",DetailsoftheBorrower,true)
    
    doc.moveDown();
    
    const DetailsoftheCoBorrower = [
      { index: '4',field1: 'Name of the Borrower(s)', value1: `${allPerameters.coBorrowername}` },
      { field1: 'Constitution of the Co-Borrower(s) ', value1: `${allPerameters.constitutionCoBorrower}` },
      { field1: 'PAN/TAN/CIN of the Co-Borrower(s)', value1: `${allPerameters.panTanCin}` },
      { field1: 'Address of the Co-Borrower(s)', value1: `${allPerameters.coBorroweraddress}` },
      { field1: 'Email – address(es)', value1: `${allPerameters.coBorroeremail}` },
      { field1: 'Phone No. (s)', value1:  `${allPerameters.coBorrowerphoneNo}` },
      { field1: 'Attention: Mr./Ms.', value1: `${allPerameters.coBorrowername}` },
    ];
    
    DRawTable("Details of the Co-Borrower", DetailsoftheCoBorrower,true);
    doc.moveDown();
    
    const DetailsoftheGuarantor = [
      { index: '5', field1: "Name of the Guarantor", value1: `${allPerameters.guarantorname}` },
      { field1: 'Constitution of the Guarantor', value1:  `${allPerameters.constitutionGuarentor}` },
      { field1: 'PAN/TAN/CIN of the Guarantor', value1: `${allPerameters.guarantorpanTanCin}` },
      { field1: 'Address of the Guarantor', value1:  `${allPerameters.guarantoraddress}` },
      // { field1: 'Email – address(es)', value1: `${req.body.detailsoftheGuarantor?.email}` },
    
      // { field1: 'Phone No. (s)', value1: `${req.body.detailsoftheGuarantor?.phoneNo}` },
      // { field1: 'Attention: Mr./Ms', value1: `${req.body.detailsoftheGuarantor?.attentioMrMs}`},
    
    
    ];
    DRawTable("Details of the Guarantor", DetailsoftheGuarantor, true);
    
    
    
      addFooter();
    
//       //---------------------------------NEW PAGE ------------------------------------------------
      
    
//       // //---------------------------------------------------new page---------------------------------------------------------------
      doc.addPage();
      addLogo();
      drawBorder();
    
      doc.moveDown(8);
    
      const DetailsoftheGuarantorr = [
        
        { index:'.',field1: 'Email – address(es)', value1: `${allPerameters.guarantoremail}` },
      
        { field1: 'Phone No. (s)', value1: `${allPerameters.guarantorphoneNo}` },
        { field1: 'Attention: Mr./Ms', value1: `${allPerameters.guarantorname}`},
      
      
      ];
      DRAWTable( DetailsoftheGuarantorr, true);
    
      const DetailsoftheBranch = [
        {index: '6', field1: 'Place of the Branch ', value1: `${allPerameters.branchplace}` },
        { field1: 'Address of the Branch', value1: `${allPerameters.branchaddress}` },
        { field1: 'Email – address(es)', value1: `${allPerameters.branchemail}` },
        { field1: 'Phone No. (s)', value1: `${allPerameters.branchphoneNo}` },
        { field1: 'Attention: Mr./Ms.', value1: `${allPerameters.attentionMrMs}` },
      ];
    
      DRawTable("Details of the Branch", DetailsoftheBranch,true);
    
      doc.moveDown();
    
    
      const DetailsoftheLoan = [
        { index: '7',field1: 'Sanction Letter No.', value1: `${allPerameters.sanctionLetterNo}` },
        {index: '8', field1: 'Date of Sanction Letter', value1: `${allPerameters.sanctionLetterDate}` },
      
        { index: '9',field1: 'Facility Type ', value1: `${allPerameters.facilityType}` },
        { index: '10',field1: 'Specified Purpose ', value1: `${allPerameters.specifiedPurpose}` },
        {index: '11', field1: 'Amount of Loan', value1: `${allPerameters.amountOfLoan}`},
        {index: '12', field1: 'Rate of Interest', value1: `${allPerameters.rateOfInterest}` },
        {index: '13', field1: 'Login Fees .', value1: `${allPerameters.loginFees}` },
        { index: '14',field1: 'Loan Processing fee', value1: `${allPerameters.loanProcessingFees}` },
        { index: '15',field1: 'Documentation Charges', value1: `${allPerameters.documentCharges}` },
        { index: '16',field1: 'Tenure of Loan ', value1: `${allPerameters.tenureOfLoan}` },
        // {index: '17', field1: 'Penal charges', value1: `-2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan instalments -2 % per month on the outstanding loan facility amount plus applicable taxes for non-\ncompliance of agreed terms and conditions mentioned in the Sanction Letter`},
        // {index: '18', field1: 'Repayment Method ', value1: 'NACH' },
        // { index: '19',field1: 'Monthly Installment Date ', value1: '10th of the month' },
        // { index: '20',field1: `Repayment Date of all Outstanding Obligations\n(End date of loan Tenure)`, value1: 'As per Repayment Schedule' },
        // { index: '21',field1: 'Number of Installments', value1: '60 months' },
        // {index: '22', field1: 'Foreclosure of Loan ', value1: 'No Foreclosure allowed till completion of 12 months from the date of 1st disbursement.After completion of 12 months from the date of 1st disbursement, Foreclosure from personal funds may be made without incurring any fees.In case of balance transfer, 4% charges will be applicable.' },
        // {index: '23', field1: 'Taxes', value1: 'Goods and Services tax (GST) will be charged extra as per the applicable rates, on interest, penal charges,other charges and fees (wherever GST is applicable)' },
    //     {index: '24', field1: 'Security', value1: `1. Personal guarantee of PAWAN NAGAR ) \n 2. Corporate guarantee of NA \n 3. Demand Promissory Notes \n 4. Cheques as per UDC Covering Letter. \n 5. First and exclusive charge over the Immovable Property as mentioned in Schedule III.`},
    //     { index: '25',field1: 'Security Deposit/DSRA ', value1: 'NIL' },
    //     { index: '26',field1: 'Lock–in Period  ', value1: `The borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount
    //   either in part or in full within 1 year completion of loan tenure from the date of 1st
    // disbursement of the loan.` },
    
      ];
      
      DRAWTABLE("Details of the Loan", DetailsoftheLoan);
      
      
      
      addFooter();
    //=================-------------------------------------------------------
      doc.addPage();
      addLogo();
      drawBorder();
      // Add title and content from the image
      doc.moveDown(8);
    
      const DetailsoftheBranchh =[
        {index: '17', field1: 'Penal charges', value1: `${allPerameters.penalCharges}`},
        {index: '18', field1: 'Repayment Method ', value1: `${allPerameters.repaymentMethod}` },
        { index: '19',field1: 'Monthly Installment Date ', value1: `${allPerameters.monthlyInstallmentDate}` },
        { index: '20',field1: `Repayment Date of all Outstanding Obligations\n(End date of loan Tenure)`, value1: `${allPerameters.endDateOfLoanTenure}` },
        { index: '21',field1: 'Number of Installments', value1: `${allPerameters.noOfInstallment}` },
        {index: '22', field1: 'Foreclosure of Loan ', value1: `${allPerameters.foreClosereOfLoan}` },
        {index: '23', field1: 'Taxes', value1: `${allPerameters.taxes}` },
        
        {index: '24', field1: 'Security', value1: `${allPerameters.security}`},
        { index: '25',field1: 'Security Deposit/DSRA ', value1: `${allPerameters.securityDepositOrDsra}` },
        { index: '26',field1: 'Lock–in Period  ', value1: `${allPerameters.lockPeriod}` },
    
      ];
      
      DrawTablewithoutHeader(DetailsoftheBranchh);

    
    
    function DrawCombinedTable(doc, sections) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const keyWidth = Math.round(columnWidths[0] * 1 / 3);
      const valueWidth = Math.round(columnWidths[0] * 2 / 3);
    
      sections.forEach(section => {
        // Section Header
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20)
            .fillAndStroke('#00a7ff', "#000000");
        doc.font(fontBold).fillColor('black').fontSize(9.5)
            .text(section.title, startX + 5, startY + 5, { baseline: 'hanging', align: 'center' });
    
        startY += 20;
    
        section.data.forEach((row, rowIndex) => {
            let valueRowHeight = 22;
    
            // Calculate dynamic row height
            const field1TextHeight = doc.heightOfString(row.field1, { width: keyWidth - 10 });
            const value1TextHeight = doc.heightOfString(row.value1, { width: valueWidth - 10 });
            valueRowHeight = Math.max(valueRowHeight, field1TextHeight, value1TextHeight);
    
            const backgroundColor = rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff';
    
            if (["Prepayment Charges"].includes(row.field1)) {
                       valueRowHeight = Math.max(valueRowHeight, 38.5); 
                   }
    
            // Render field and value cells
            doc.fillColor(backgroundColor).rect(startX, startY, keyWidth, valueRowHeight).stroke().fill();
            doc.font(font).fillColor('black').fontSize(8.3)
                .text(row.field1, startX + 5, startY + 5, { width: keyWidth - 10 });
    
            doc.fillColor(backgroundColor).rect(startX + keyWidth, startY, valueWidth, valueRowHeight).stroke().fill();
            doc.font(font).fillColor('black').fontSize(7.2)
                .text(row.value1, startX + keyWidth + 5, startY + 5, { width: valueWidth - 10 });
    
            startY += valueRowHeight;
    
            if (row.tiltle === "CHARGES") {
              startY += 10; 
              doc.font(font).fillColor('black').fontSize(7.5)
                  .text("NOTE: Goods and Services tax (GST) will be charged extra as per the applicable rates, on all the charges and fees (wherever GST is applicable). The aforementioned charges/fees may be modified by Ratnaafin Capital Private Limited from time to time upon prior intimation via acceptable modes of communication from Ratnaafin Capital Private Limited in this regard.", 
                        startX + 5, startY, { width: columnWidths[0] - 10, align: 'justify', lineGap: 3 });
              startY += 30; // Extra space after the NOTE before the next section
          }
      });
    
        // Additional spacing between sections
        startY += 15;
      });
    
     
    }
    
    // Define data for each section
    const charges = {
      title: "CHARGES",
      data: [
        { field1: "Details", value1: `Particulars` },
        { field1: 'Processing Fees ', value1: `${allPerameters.processingFees}` },
        { field1: 'Document Processing Charges', value1: `${allPerameters.documentProcessingCharges}` },
        { field1: 'Prepayment Charges', value1: `${allPerameters.prepaymentCharges}` },
        { field1: 'Bounce Charges', value1: `${allPerameters.bounceCharges}` },
        { field1: 'Outstation Collection Charges', value1: `${allPerameters.outstationCollectionCharges}` },
        { field1: 'Cheque Swap Charges', value1: `${allPerameters.chequeSwapCharges}` },
        { field1: 'Stamp Duty', value1: `${allPerameters.stampDuety}` },
        { field1: 'Duplicate NOC charges', value1: `${allPerameters.duplicateNocCharges}` },
        
      ]
    };
    
    

    // Draw combined table
    DrawCombinedTable(doc, [charges]);
    
    
    addFooter();
    
    doc.addPage();
      addLogo();
      drawBorder();
      // Add title and content from the image
      doc.moveDown(8);
      
      const chequeDetails = {   
        title: "CHEQUE DETAILS",
        data: [
            { field1: "Bank Name", value1: `${allPerameters.chequebankName}` },
            { field1: "Bank Account Number", value1: `${allPerameters.chequebankAccountNo}` },
            { field1: "Number of Cheques", value1: `${allPerameters.chequenumberOfCheques}` },
            { field1: "Amount (in INR)", value1: `${allPerameters.chequeaccountInINR}` },
            { field1: "Local/Outstation", value1: `${allPerameters.chequelocalOutstation}` }
        ]
      };
      
      const ecsNachDetails = {
        title: "DETAILS OF ECS/NACH",
        data: [
            { field1: "Bank Name", value1: `${allPerameters.ecsNachbankName}` },
            { field1: "Bank Account Number", value1: `${allPerameters.ecsNachbankAccountNumber}` },
            { field1: "Installment Amount", value1: `${allPerameters.ecsNachinstallmentAmount}` }
        ]
      };
    
      DrawCombinedTable(doc, [ chequeDetails, ecsNachDetails]);
    
    
    doc.moveDown()
    
    const sections = [
      {
        title: "LOAN DISBURSEMENT MODE",
        data: [
          {
            col1: "Account Transfer Type",
            col2: [
              { text: "Bank Name" },
              { text: "Type of Account (Savings/ Current)" }
            ],
            col3: [
              { text: `${allPerameters.accountTransferbankName}` },
              { text: `${allPerameters.accountTransfertypeOfAccount}` }
            ]
          },
          {
            col1: "RTGS/NEFT/IMPS",
            col2: [
              { text: "IFSC Code" },
              { text: "Bank Account Number" }
            ],
            col3: [
              { text: `${allPerameters.rtgsifscCode}` },
              { text: `${allPerameters.rtgsbankAccountNumber}` }
            ]
          },
          {
           col1: "Account Payee Cheque\n\n\n\nUse of Existing\nECS/NACH",  // Added gap with double newlines
            col2: [
              { text: "e A/c Holder Name as per Bank Account" },
              { text: "Cheque in favour of" },
              { text: `${allPerameters.existingEcsNach}`}
            ],
            col3: [
              { text: `${allPerameters.accountHolderName}` },
              { text: `${allPerameters.inFavorOf}` },
              { text: "Cheque in favor of: Sheetal Kulkarni" }
            ],
            col3Split: {  // Split last row in col3 into two parts
              part1: "Use of Existing KYC documents",
              part2: `${allPerameters.existingKycDocument}`
            }
          },
        ]
      }
    ];
    
    
    function DrawCTable(doc, sections) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [160, 160, 160];
    
      sections.forEach(section => {
        // Section Header
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20)
          .fillAndStroke('#00a7ff', "#000000");
        doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
          .text(section.title, startX + 5, startY + 5, { baseline: 'hanging', align: 'center' });
    
        startY += 20;
    
        section.data.forEach((row, index) => {
          let rowHeight = 22;
          const backgroundColor = index % 2 === 0 ? '#f5f5f5' : '#ffffff';
    
          // Calculate the height of col1 and check if nested rows exist in col2 and col3
          const col1Height = doc.heightOfString(row.col1, { width: columnWidths[0] - 10 });
          const maxRowHeight = Math.max(col1Height, rowHeight * row.col2.length);
    
          // Column 1 - Render with gap between lines
          doc.fillColor(backgroundColor).rect(startX, startY, columnWidths[0], maxRowHeight).stroke().fill();
          doc.font('Helvetica').fillColor('black').fontSize(8.3)
            .text(row.col1, startX + 5, startY + 5, { width: columnWidths[0] - 10, lineBreak: true });
    
          // Column 2 - Nested rows
          let nestedY = startY;
          row.col2.forEach(nestedRow => {
            doc.fillColor(backgroundColor).rect(startX + columnWidths[0], nestedY, columnWidths[1], rowHeight).stroke().fill();
            doc.font('Helvetica').fillColor('black').fontSize(8.3)
              .text(nestedRow.text, startX + columnWidths[0] + 5, nestedY + 5, { width: columnWidths[1] - 10 });
            nestedY += rowHeight;
          });
    
          // Column 3 - Nested rows with last row split into two columns
          nestedY = startY;
          row.col3.forEach((nestedRow, rowIndex) => {
            if (rowIndex === row.col3.length - 1 && row.col3Split) {
              // Split the last row in col3 into two parts
              const halfWidth = columnWidths[2] / 2;
    
              // Part 1
              doc.fillColor(backgroundColor).rect(startX + columnWidths[0] + columnWidths[1], nestedY, halfWidth, rowHeight).stroke().fill();
              doc.font('Helvetica').fillColor('black').fontSize(8.3)
                .text(row.col3Split.part1, startX + columnWidths[0] + columnWidths[1] + 5, nestedY + 5, { width: halfWidth - 10 });
    
              // Part 2
              doc.fillColor(backgroundColor).rect(startX + columnWidths[0] + columnWidths[1] + halfWidth, nestedY, halfWidth, rowHeight).stroke().fill();
              doc.font('Helvetica').fillColor('black').fontSize(8.3)
                .text(row.col3Split.part2, startX + columnWidths[0] + columnWidths[1] + halfWidth + 5, nestedY + 5, { width: halfWidth - 10 });
            } else {
              // Regular nested row in col3
              doc.fillColor(backgroundColor).rect(startX + columnWidths[0] + columnWidths[1], nestedY, columnWidths[2], rowHeight).stroke().fill();
              doc.font('Helvetica').fillColor('black').fontSize(8.3)
                .text(nestedRow.text, startX + columnWidths[0] + columnWidths[1] + 5, nestedY + 5, { width: columnWidths[2] - 10 });
            }
            nestedY += rowHeight;
          });
    
          startY += maxRowHeight;
        });
    
        startY += 15;
      });
    };
    
    DrawCTable(doc, sections);
    
    doc.moveDown(6);
    
    
    const pageWidth = doc.page.width;
    
    doc
       .fontSize(12) 
       .text("Schedule II", (pageWidth / 2) - (doc.widthOfString("Schedule II") / 2), doc.y, {
           baseline: 'hanging'
       });
    
    doc.moveDown(1);
    
    // Center "Repayment Schedule"
    doc.fontSize(12)
       .text("Repayment Schedule", (pageWidth / 2) - (doc.widthOfString("Repayment Schedule") / 2), doc.y);
    
    doc.moveDown(1);
    
    // Center "As Separately Provided"
    doc
       .fontSize(12)
       .text("As Separately Provided", (pageWidth / 2) - (doc.widthOfString("As Separately Provided") / 2), doc.y, {
           lineGap: 1
       });
    
    doc.moveDown(1);
    
    
    
      
    
      addFooter();
    
//       //------------------------------------------------------------new page----------------------------------------------
      doc.addPage();
      addLogo();
      drawBorder();
      // Add title and content from the image
      doc.moveDown(8);
    
      doc
      .fontSize(7)
      .font(fontBold)
      .text("Schedule III", { align: "center" })
      .text("Description of Immovable Property", { align: "center" })
      .moveDown(0.5)
      .text("Property 1:", { align: "center" })
      .moveDown(0.5)
      .text("House No 89 Survey No 320 Patwari Halka No 89 Ward No 04 Village Sikandari", { align: "center" })
      .moveDown(0.5)
      .text("Gram Panchyat Sikandari Tehsil Khilchipur District Rajgarh", { align: "center" })
      .moveDown(0.5)
      .text("State Madhya Pradesh Pin Code 465687", { align: "center" })
      .fontSize(9)
      .moveDown(0.5)
      .text("SCHEDULE OF CHARGES", { align: "center" });
    
    doc.moveDown(1);
    // Add a function to draw black table borders
    function drawTable(tableData) {
        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [50, 150, 150, 150]; // Adjust column widths as needed
        const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
    
        // Draw the title row (first row)
        const titleRow = tableData[0];
        const titleWidth = totalWidth; // Span all columns
    
        // Calculate title row height based on text height
        const titleHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(titleRow.field1, { width: titleWidth });
    
        // Draw a single rectangle for the title row
        doc
            .fillColor("blue") // Light sky blue color
            .rect(startX, startY, titleWidth, titleHeight + 10) // Height adjusted for title text
            .stroke("black")
            .fill();
    
        // Draw the title text centered and bold
        doc
            .font('Helvetica-Bold') // Make title bold
            .fillColor("black")
            .fontSize(7.2)
            .text(titleRow.field1, startX, startY + 5, {
                baseline: "hanging",
                width: titleWidth,
                align: "center" // Center align the title text
            });
    
        // Move startY down for the next row
        startY += titleHeight + 10;
    
        // Draw column headers (second row)
        const headers = tableData[1];
        const headerHeight = 15; // Fixed height for headers
    
        columnWidths.forEach((colWidth, index) => {
            const headerX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
            doc
                .fillColor("#f5f5f5")
                .rect(headerX, startY, colWidth, headerHeight)
                .stroke("black") // Draw border around header cell
                .fill();
    
            // Draw header text centered and bold
            const headerText = headers[`field${index + 1}`]; // Adjust index for field names
            doc
                .font('Helvetica-Bold') // Make header bold
                .fillColor("black")
                .fontSize(7.2)
                .text(headerText, headerX, startY + 5, {
                    baseline: "hanging",
                    width: colWidth,
                    align: "center" // Center align header text
                });
        });
    
        // Move startY down for the next row
        startY += headerHeight;
    
        // Draw data rows (starting from the third row)
        for (let i = 2; i < tableData.length; i++) {
            const row = tableData[i];
    
            // Calculate row height based on the cell contents
            const rowHeight = Math.max(
                doc.font(font).fontSize(7.2).heightOfString(row.value1 || "", { width: columnWidths[0] }),
                doc.font(font).fontSize(7.2).heightOfString(row.value2 || "", { width: columnWidths[1] }),
                doc.font(font).fontSize(7.2).heightOfString(row.value3 || "", { width: columnWidths[2] }),
                doc.font(font).fontSize(7.2).heightOfString(row.value4 || "", { width: columnWidths[3] })
            ) + 10; // Additional space for padding
    
            // Alternate row background color
            doc.fillColor(i % 2 === 0 ? "#f5f5f5" : "#ffffff");
            doc.rect(startX, startY, totalWidth, rowHeight).stroke("black").fill();
    
            // Draw cells normally
            doc.fillColor("#ffffff"); // Ensure cell background is white for content
    
            // Check if value4 is missing and determine how to draw the cells
            if (!row.value4) {
                // If value4 is missing, span value3 across the last two columns
                const spanWidth = columnWidths[2] + columnWidths[3]; // Combine width of value3 and value4
                const cellX = startX + columnWidths[0] + columnWidths[1]; // Starting position for value3
    
                doc.rect(cellX, startY, spanWidth, rowHeight).stroke("black").fill();
                doc.font('Helvetica-Bold').fillColor("black").fontSize(7.2)
                    .text(row.value3 || "", cellX, startY + 5, {
                        baseline: "hanging",
                        width: spanWidth,
                        align: "center" // Center align cell text
                    });
    
                // Draw value1, value2 normally
                columnWidths.slice(0, 2).forEach((colWidth, index) => {
                    const cellText = row[`value${index + 1}`] || ""; // Adjust index for value names
                    const cellX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
    
                    doc.rect(cellX, startY, colWidth, rowHeight).stroke("black").fill();
                    doc.font('Helvetica-Bold').fillColor("black").fontSize(7.2)
                        .text(cellText, cellX, startY + 5, {
                            baseline: "hanging",
                            width: colWidth,
                            align: "center" // Center align cell text
                        });
                });
            } else {
                // Draw each column in the row normally
                columnWidths.forEach((colWidth, index) => {
                    const cellText = row[`value${index + 1}`] || ""; // Adjust index for value names
                    const cellX = startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
    
                    doc.rect(cellX, startY, colWidth, rowHeight).stroke("black").fill();
                    doc.font('Helvetica-Bold').fillColor("black").fontSize(7.2)
                        .text(cellText, cellX, startY + 5, {
                            baseline: "hanging",
                            width: colWidth,
                            align: "center" // Center align cell text
                        });
                });
            }
    
            startY += rowHeight;
        }
    }
    
    const loanTableData = [
        { field1: "Other Charges during the term of loan" },
        { field1: "Sr. No.", field2: "Particulars of Charges", field3: "Charges (In Rs./%)", field4: "Charge Details" },
        { value1: "1", value2: "Repayment Instruction / Instrument Return Charge", value3: `Rs. 750`, value4: "Per Instance of dishonor of cheque / ECS debit instruction + GST as Applicable" },
        { value1: "2", value2: "Repayment mode Swap Charges", value3:  `Rs. 750`, value4: "Per Instance of dishonor of cheque / ECS debit instruction + GST as Applicable" },
        { value1: "3", value2: "Penal Charges", value3:`- 2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan instalments \n\n - 2 % per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter`},
        { value1: "4", value2: "Duplicate statement issuance charges", value3: `Rs.250`, value4: "Per Instance per set + GST as Applicable" },
        { value1: "5", value2: "Cheque re-presentation charges", value3: `Rs.250`, value4: "Per Instance per set + GST as Applicable" },
        { value1: "6", value2: "Duplicate Amortization schedule issuance charges", value3: `Rs.250`, value4: "Per Instance per set + GST as Applicable" },
        { value1: "7", value2: "Document Retrieval Charges", value3: `"Rs.500`, value4: "Per Instance per set + GST as Applicable"},
        { value1: "8", value2: "Charges for subsequent set of Photocopy of loan agreement/documents were requested by Borrower", value3: `Rs.250`, value4: "Per Instance per set + GST as Applicable"},
        { value1: "9", value2: "Stamp Duty Charges", value3:`As applicable in the state stamp act`},
        { value1: "10", value2: "Prepayment/Pre-loan closure charges (including part payment) ", value3: `As per Sanction Terms and Conditions`},
        { value1: "11", value2: "Administrative Charges/Processing Fees & Other Charges", value3: `As per Sanction Terms and Conditions`},
        { value1: "12", value2: "Charges for duplicate NOC / No due certificate", value3:`Rs. 250`, value4: "Per Instance per set + GST as Applicable"},
        { value1: "13", value2: "Charges for revalidation NOC", value3:`Rs. 250`, value4: "Per Instance per set + GST as Applicable"}, 
    ];
      
    drawTable(loanTableData);
    
    doc.moveDown(2);
    const startX = 50; // Starting position for text from the left (adjust as per your margins)
    
    doc
    .font(fontBold) // Ensure bold font is applied
    .fontSize(8)
    .fillColor("black")
    .text(
    `IN WITNESS WHEREOF the Parties have executed this Agreement on the day and the year as mentioned in the Schedule:,\n
    SIGNED AND DELIVERED BY WITHIN NAMED BORROWER/ CO-BORROWER \n
    If Company/Trust/Society, by its Authorized Signatory with its seal/stamp OR If Limited Liability Partnership, by its Designated Partner and Authorized Signatory seal/stamp OR If Partnership Firm, by its Designated Partner and Authorized Signatory seal/stamp OR If HUF, through its Karta or If Individual, by the individual Borrower; AND by the Co-Borrower (if applicable):\n
    SIGNED AND DELIVERED BY WITHIN NAMED GUARANTOR(s);\n
    If Company, by its Authorized Signatory OR If Limited Liability Partnership, by its Designated Partner and Authorized Signatory OR If Partnership Firm, by its Designated Partner and Authorized Signatory OR If HUF, through its Karta Or If Individual, by the individual Borrower;`,
    startX, // Start from the left position (left margin)
    doc.y, // Current vertical position (doc.y)
    {
      align: 'left', // Align the text to the left (default)
      align: "justify",
      width: doc.page.width - 2 * startX, // Width to ensure margins are respected
    }
    );
    
    
    doc.moveDown(2);
    addFooter();
    
//     //---------------------------------------------------new page---------------------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(6);
    
    function firstBoxTable(tableData) {
        // Add Table Header
        const startX = 50; // Starting X position for the box
        let startY = doc.y + 10; // Starting Y position for the box
        const boxWidth = 500; // Adjust the width of the box as per your need
      
        // Calculate the total height needed for the entire box
        let totalHeight = 0;
      
        // Calculate the height for each row and determine the total height of the box
        tableData.forEach((row) => {
          const rowHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.field1, { width: boxWidth }) + 10; // Add padding
      
          totalHeight += rowHeight; // Accumulate the total height
        });
      
        // Draw the outer rectangle for the box
        doc
          .fillColor("#f0f0f0") // Box background color
          .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
          .stroke("black") // Border color
          .fill();
      
        // Loop through the data and draw the text inside the box
        tableData.forEach((row, rowIndex) => {
          // Calculate row height based on the content
          const rowHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.field1, { width: boxWidth }) + 10; // Add padding
      
          // Alternate row background color (optional)
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff") // Alternate row colors
            .rect(startX, startY, boxWidth, rowHeight) // Draw rectangle for each row
            .stroke("black") // Border color for each row
            .fill();
      
          // Draw the text in the box
          doc
            .font(font)
            .font('Helvetica-Bold')
            .fillColor("black")
            .fontSize(7.2)
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: boxWidth - 10, // Adjust width to provide padding inside the box
              align: "left", // Align text to the left
            });
      
          // Move to the next row
          startY += rowHeight;
        });
      }
      
      const firstBoxLine = [
        { field1: `BORROWER'S NAME : ${allPerameters.borrowerName}` },
        { field1: `CO-APPLICANT'S NAME : ${allPerameters.coBorrowername}` },
        { field1: `GUARANTOR'S NAME : ${allPerameters.guarantorname}` },
      ];
      
      firstBoxTable(firstBoxLine);
      doc.moveDown(1);
      doc
      .font(fontBold) // Ensure bold font is applied
      .fontSize(8)
      .fillColor("black")
      .text(
        `AND SIGNED AND DELIVERED BY THE WITHIN NAMED LENDER,\n
        Ratnaa fin Capital Private Limited, by the hands of pls confirm authorized name its authorized official.`,
        startX, // Start from the left position (left margin)
        doc.y, // Current vertical position (doc.y)
        {
          align: 'left', // Align the text to the left (default)
          align: "justify",
          width: doc.page.width - 2 * startX, // Width to ensure margins are respected
        }
      );
    
      function secondBoxLine(tableData) {
        // Add Table Header
        const startX = 50; // Starting X position for the box
        let startY = doc.y + 10; // Starting Y position for the box
        const boxWidth = 500; // Total width of the box
        const field1Width = 100; // Width for the field1 column
        const valueWidth = boxWidth - field1Width; // Width for the value column
        
        // Calculate the total height needed for the entire box
        let totalHeight = 0;
      
        // Calculate the height for each row and determine the total height of the box
        tableData.forEach((row) => {
          // Calculate row height based on the content in the value field
          const valueTextHeight = doc
            .font('Helvetica') // Regular font for calculating height
            .fontSize(7.2)
            .heightOfString(row.value || '', { width: valueWidth }) + 10; // Add padding
      
          totalHeight += valueTextHeight; // Accumulate the total height
        });
      
        // Draw the outer rectangle for the box
        doc
          .fillColor("#f0f0f0") // Box background color
          .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
          .stroke("black") // Border color
          .fill();
      
        // Loop through the data and draw the text inside the box
        tableData.forEach((row) => {
          // Calculate row height based on the content in value field
          const valueTextHeight = doc
            .font('Helvetica') // Regular font for calculating height
            .fontSize(7.2)
            .heightOfString(row.value || '', { width: valueWidth }) + 10; // Add padding
      
          // Draw rectangle for the field1 box
          doc
            .fillColor("#f5f5f5") // Background color for field1 (empty box)
            .rect(startX, startY, field1Width, valueTextHeight)
            .stroke("black") // Border for field1 box
            .fill();
      
          // Draw rectangle for the value box
          doc
            .fillColor("#ffffff") // Background color for value
            .rect(startX + field1Width, startY, valueWidth, valueTextHeight)
            .stroke("black") // Border for value box
            .fill();
      
          // Draw the field1 text in the left column (in bold)
          doc
            .font('Helvetica-Bold') // Set font to bold for field1
            .fillColor("black")
            .fontSize(7.2)
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: field1Width - 10, // Adjust width to provide padding inside the box
              align: "left", // Align text to the left
            });
      
          // Draw the value text in the right column (regular font)
          doc
            .font('Helvetica') // Set font back to regular for value
            .fillColor("black")
            .fontSize(7.2)
            .text(row.value, startX + field1Width + 5, startY + 5, {
              baseline: "hanging",
              width: valueWidth - 10, // Adjust width to provide padding inside the box
              align: "left", // Align text to the left
            });
      
          // Move to the next row
          startY += valueTextHeight;
        });
      }
      
      const secondBox = [
        { field1: " ", value: `Authorised official's Name: ${allPerameters.borrowerName}\n\nAuthorised official's Signature: ` }
      ];
      secondBoxLine(secondBox); 
      doc.moveDown(4);
    
    // Define the left margin and the width for centering
    const leftX = 50; // Left margin for left-aligned text
    const titleWidth = 400; // Width for the title text
    const centerX = (doc.page.width - titleWidth) / 2; // Calculate center position manually
    
    // Title (Centered and Bold)
    doc
    .fontSize(9)
    .font(fontBold) // Bold for title
    .text("DECLARATIONS CUM UNDERTAKINGS CUM AUTHORITY", centerX, doc.y, { width: titleWidth, align: "center" }) // Manually centered
    .moveDown(0.7);
    
    // Left-aligned text
    doc
    .font(font) // Regular font for left-aligned text
    .fontSize(8)
    .text(`IN CONSIDERATION OF ${allPerameters.companyName}, (the Lender) providing or agreeing to provide the to me/us on the terms and conditions contained in the Loan Agreement dated ${allPerameters.date} and other Transaction Documents,`, leftX, doc.y, { width: doc.page.width - 100, align: "left" })
    .moveDown(0.8);
    
    // Center-aligned bold text
    doc
    .font(fontBold) // Bold for center-aligned text
    .fontSize(8)
    .text("In case of Individual Borrower", centerX, doc.y, { width: titleWidth, align: "center", underline: true })
    .moveDown(0.8);
    
    // Left-aligned text
    doc
    .font(font) // Regular font for left-aligned text
    .fontSize(9)
    .text(`I/We, ${allPerameters.borrowerName} residing at ${allPerameters.borroewraddress}`, leftX, doc.y, { width: doc.page.width - 100, align: "left" })
    .moveDown(0.8);
    
    // Center-aligned bold "AND"
    doc
    .font(fontBold) // Bold for center-aligned text
    .fontSize(9)
    .text("AND", centerX, doc.y, { width: titleWidth, align: "center" })
    .moveDown(0.8);
    
    // Left-aligned text
    doc
    .font(font) // Regular font for left-aligned text
    .text(`I/We, ${allPerameters.coBorrowername} residing at ${allPerameters.coBorroweraddress}`, leftX, doc.y, { width: doc.page.width - 100, align: "left" })
    .moveDown(0.8);
    
    // Center-aligned bold "AND"
    doc
    .font(fontBold) // Bold for center-aligned text
    .fontSize(9)
    .text("AND", centerX, doc.y, { width: titleWidth, align: "center" })
    .moveDown(0.8);
    
    // Left-aligned text
    doc
    .font(font) // Regular font for left-aligned text
    .text(`I/We, ${allPerameters.guarantorname} residing at ${allPerameters.guarantoraddress}`, leftX, doc.y, { width: doc.page.width - 100, align: "left" })
    .moveDown(0.8);
    
    // Final paragraph (Left-aligned)
    
    doc
    .fontSize(9)
    .text("(Hereinafter referred to as ”the Guarantors”/”Co-Borrowers”) hereby jointly and severally, agree, undertake, authorize, assure and affirm as follows:", leftX, doc.y, { width: doc.page.width - 100, align: "left" });
    
    doc.moveDown(2);
    // Format the borrower details to the left side
    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `1. I/We agree and undertake that for the credit facilities granted to the Borrowers and/or availed by the Borrowers, the Lender will be entitled/authorized/permitted to charge and/or deduct/debit/recover from my/our Accounts such sum or sums of money as the Lender may stipulate, incur or bear by way of guarantee fee, document verification fees, or any other levy or charge payable by the Borrower to the Lender for availing finance, including for verification of security documents by the Lender’s Advocate/s and other such fees as payable by the Borrower to the Lender in respect of facilities extended to the Borrowers.\n\n
       2. I/We further agree, authorize, assure and confirm that in the event of any default committed by me/us in compliance with the terms and conditions or any of them stipulated by the Lender from time to time, the Lender shall be entitled, permitted, and authorized to charge, without any intimation to us, penal charges at such rate and in accordance with such rules/regulations of the Lender and/or such Rules or regulations or stipulations/directives/guidelines of the Reserve Bank of India on the amount due and payable by the Borrowers to the Lender in respect of the credit facilities/financial accommodation extended to the Borrowers by the Lender.\n\n
       3. I/We further agree, authorize, assure and confirm that in the event of the Lender obtaining any insurance cover or cover for financial risk from an insurance company/ies or any other institution/firm/Body Corporate or otherwise over the assets charged/hypothecated/pledged or mortgaged to the Lender or otherwise taken possession of by the Lender on account of or in consideration of the dues payable by the Borrower for the facilities extended to my/our Account/s without any further formalities and intimation by the Lender of having obtained such insurance, or financial risk cover, and such letter informing about the Lender having taken such insurance cover, etc., would be sufficient proof thereof enabling the Lender to recover and/or charge the same to my/our accounts/s.`,
      {
        lineGap: 2,
        align: "left",
        align: "justify",
        width: 500, // Set a maximum width
      }
    );
    
    
    addFooter();
    
//     //---------------------------------------------new page ------------------------------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(8);
    
    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `4. I/We further agree, authorize, assure and confirm that the Lender shall be entitled to charge interest at the rate as may be decided by the Lender for the adhoc facility/facilities agreed to be extended/may be extended by the Lender to the Borrower and such interest may be continued to be charged to me/us by the Lender as long as the Borrower avails such adhoc facility and/or earlier, as may be decided by the Lender from time to time.\n\n
       5. I/We further agree, assure and undertake that in the event of the Lender requiring any information for processing/review of my/our account, including furnishing of statements of stocks/Balance Sheet (audited or otherwise), CMA Data, and other particulars that may be required by the Lender within the stipulated period or at the time of processing/review of my/our account, and if for any reason whatsoever I am/we are unable to furnish the same within a week or such other reasonable time as the Lender may, upon specific request by me/us, agree to in writing, then the Lender shall be entitled to charge to my/our account and/or claim penal charges at the rate of 24% P.A. on outstanding dues, notwithstanding the technical review of my/our account as may be otherwise carried out by the Lender in the absence of such information submission as required by the Lender.\n\n
       6. In case the information about legal heirs is incomplete, inadequate, or not provided, I/We, the undersigned, hereby irrevocably agree, declare, undertake, assure, and confirm that the legal heirs, as mandated under the relevant applicable laws of India, represent the comprehensive enumeration of all my/our legal heirs, both known and unknown, at the time of executing this agreement. I hereby provide my irrevocable consent to the Lender, its successors, and assigns, to pursue any and all legal remedies for the recovery of any outstanding obligations, including but not limited to, the repayment of loans, accrued interest, fees, and charges, from any and all of my/our legal heirs, including those who may come into existence after the execution of this agreement, in the event of my/our demise or the demise of any and all of us during the existence or pendency of credit facilities extended by the Lender to the Borrower. Furthermore, I acknowledge that this consent shall remain in full force and effect throughout the entire term of any credit facility and beyond until all outstanding obligations to the Lender have been fully discharged and satisfied. I also undertake to promptly notify the Lender of any changes in the composition of my/our legal heirs, including additions or alterations.\n\n
       7. I/We further agree, undertake, and assure that I/We shall promptly inform you in writing of any change in the above particulars of my/our legal heirs that may be occasioned by birth, death, marriage, etc., and/or on account of any amendment/change in the general statutes/laws of the country.\n\n
       8. I/We also hereunder submit the particulars of immovable properties belonging to me/us, which have been charged to the Lender as security for financial assistance granted to the Borrower.`,
      {
        lineGap: 2,
        align: "left",
        align: "justify",
        width: 500, // Set a maximum width
      }
    );
    doc.moveDown(1);
    
    function tableFunction(tableData) {
        // Add Table Header
        const startX = 50; // Starting X position for the box
        let startY = doc.y + 10; // Starting Y position for the box
        const boxWidth = 500; // Total width of the box
        const numFields = Object.keys(tableData[0]).length; // Get number of fields from the first row
        const fieldWidth = boxWidth / numFields; // Calculate width for each column
    
        // Calculate the total height needed for the entire box
        let totalHeight = 0;
    
        // Calculate the height for each row and determine the total height of the box
        tableData.forEach((row) => {
            // Calculate row height based on the content in each field
            let rowHeight = 0;
            for (let field in row) {
                const fieldTextHeight = doc
                    .font('Helvetica') // Regular font for calculating height
                    .fontSize(7.2)
                    .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
                rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
            }
            totalHeight += rowHeight; // Accumulate the total height
        });
    
        // Draw the outer rectangle for the box
        doc
            .fillColor("#f0f0f0") // Box background color
            .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
            .stroke("black") // Border color
            .fill();
    
        // Loop through the data and draw the text inside the box
        tableData.forEach((row, rowIndex) => {
            let currentX = startX; // Reset the starting X position for each row
            // Calculate row height based on the content in each field
            let rowHeight = 0;
            for (let field in row) {
                const fieldTextHeight = doc
                    .font('Helvetica') // Regular font for calculating height
                    .fontSize(7.2)
                    .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
                rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
            }
    
            // Draw rectangles for each field in the row
            for (let field in row) {
                // Draw rectangle for the field box
                doc
                    .fillColor("#f5f5f5") // Background color for field (empty box)
                    .rect(currentX, startY, fieldWidth, rowHeight)
                    .stroke("black") // Border for field box
                    .fill();
    
                // Set font style based on whether it's the header row
                const isHeader = rowIndex === 0; // Check if it's the header row
                doc
                    .font(isHeader ? 'Helvetica-Bold' : 'Helvetica') // Set font to bold for header
                    .fillColor("black")
                    .fontSize(7.2);
    
                // Determine text alignment based on field index (you can customize this as needed)
                const align = (field === 'field3') ? 'center' : 'left'; // Center field3, left for others
    
                // Draw the field text in the box
                doc.text(row[field], currentX + 5, startY + 5, {
                    baseline: "hanging",
                    width: fieldWidth - 10, // Adjust width to provide padding inside the box
                    align: align, // Align text based on content
                });
    
                // Move to the next column
                currentX += fieldWidth; // Update X position for the next field
            }
    
            // Move to the next row
            startY += rowHeight; // Update Y position for the next row
        });
    }
        
    const tableData = [
        { field1: "Item No.", field2: "Particulars of Immovable properties with full address (where situate, etc.)", field3: "Charges (In Rs./%)", field4: "In whose name the property stands", field5: "Whether leasehold or ownership", field6: "Present Market Value" },
        { field1: "1", field2: `${allPerameters.particularsImmovablePropertiesFullAddress}`, field3:`${allPerameters.inWhoseNameThePropertyStands}`, field4: `${allPerameters.presentEncumbrance}`, field5: `${allPerameters.whetherLeaseholdOrOwnership}`, field6: `${allPerameters.presentMarketValue}` },
    ];
    
    // Call the function to create the table
    tableFunction(tableData);   
    
    doc.moveDown(10);
    
    
    const leftMargin = 50; // Set a custom left margin if needed
    const startY = doc.y;  // Start at the current y position
    
    doc
      .font(font)
      .fontSize(8)
      .fillColor("black")
      .text(
        `9. I/We also undertake, agree, assure, and confirm that I/We shall not transfer, dispose of, alienate, encumber, or deal with in any manner, without the prior permission in writing of the Lender, the assets and properties, whether tangible or intangible or immovable, that are charged or mortgaged to the Lender, except in the usual course of my/our business or as provided for in documents executed in that behalf.`,
        leftMargin, // Set X position explicitly
        startY,     // Set Y position explicitly
        {
          lineGap: 2,
          width: 500, // Set a maximum width
          align: "left", // Align text to the left
          align: "justify"
        }
      );
    
    addFooter();
    
//     //------------------------------------------new page ------------------------------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(8);
    
    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `10. I/We hereby declare further that the particulars of legal heirs, assets, etc., furnished by me/us as above are correct and complete, and that we are fully aware that the Lender will be granting credit/other facilities to the Borrower inter-alia on the faith of this Undertaking-cum-Declaration-cum-Authority.
        
    11. I/We also agree, undertake, and assure that charging or non-charging of penal charges in terms aforesaid shall not in any way be construed as a waiver or satisfaction of any of the terms and conditions stipulated by the Lender for compliance in terms of this undertaking or otherwise.
        
    12. I/We declare that I/We am/are absolutely seized and possessed of or otherwise well and sufficiently entitled to the Immovable property being (1) HOUSE NO 79 SURVEY NO 683 PATWARI HALKA NO 2 WARD NO 06 VILLAGE BABALDI GRAM PANCHAYAT BABALDI TEHSIL PACHORE DISTRICT RAJGARH STATE MADHYA PRADESH PIN CODE 465687, more particularly described in the Schedule hereunder written (hereinafter referred to as the "said Immovable Property").
        
    13. I/We declare that I/We have not created any charges or encumbrances in respect of the Immovable Property more particularly described in the Schedule hereunder.
        
    14. I/We declare that the said Immovable Property is proposed to be mortgaged and charged to Ratnaafin Capital Private Limited, PACHORE Branch, to secure by way of First Charge for the due repayment and discharge of the secured Loan of Rs. 600,000/- (Rupees six hundred thousand only) granted by RCPL to DURGA PRASAD, together with interest, penal charges, and other monies payable to Ratnaafin Capital Private Limited under their loan agreements, letter of sanction, and other transaction documents, as amended from time to time.
        
    15. The said Ratnaafin Capital Private Limited is/are hereinafter referred to as the "Lender."
        
    16. I/We declare that the said Immovable Property is free from all encumbrances or charges (statutory or otherwise), claims, and demands, and that the same or any part thereof is not subject to any Lien/Lis Pendens, attachment, or any other process issued by any Court or Authority. I/We further declare that I/We have not created any Trust in respect thereof, and the said Immovable Property has been in my/our exclusive, uninterrupted, and undisturbed possession and enjoyment since the date of purchase/acquisition thereof. No adverse claims have been made against me/us in respect of the said Immovable Property or any part thereof, and the same is not affected by any notices of acquisition or requisition. Furthermore, no proceedings are pending or initiated against me/us under the Income Tax Act, 1961, or any other law in force in India, and no notice has been received or served on me/us under the Income Tax Act, 1961, or any other law. There is no pending attachment whatsoever against the said Immovable Property.
        
    17. I/We declare that I/We have duly paid all rents, royalties, and all public demands, including Income Tax, Corporation/Municipal Tax, and all other taxes and revenue payable to the Government of India, the Government of any State, or any Local Authority. At present, there are no arrears of such dues, rents, royalties, taxes, and revenue dues outstanding, and no attachments or warrants have been served on me/us for Income Tax, Government Revenues, and other taxes.
        
    18. I/We also agree and undertake to give such declarations, undertakings, and other writings as may be required by the Lender or their solicitors and satisfactorily comply with all other requirements and requisitions submitted by or on behalf of the Lender.
        
    19. I/We declare that I/We have obtained the requisite consent from the Income Tax authorities pursuant to the provisions contained in Section 281 of the Income Tax Act, 1961, for the alienation of my/our property in favor of the Lender.
        
    20. I/We assure, agree, and declare that the security to be created in favor of the Lender shall extend in respect of my/our Immovable Property, both present and future, and that the documents of title, evidences, deeds, and writings in relation to the said Immovable Property are the only documents of title relating to the said Immovable Property.
        
    21. I/We hereby agree and undertake that the MORTGAGOR shall, within a period of three months from the date hereof or such extended date as may be permitted by the Lender in writing:
        
    a) Perfectly assure the title to the properties comprised in the mortgage security and comply with all requisitions that may be made from time to time by or on behalf of the Lender in that regard.
    
    b) Provide such declarations, undertakings, and other writings as may be required by the Lender and satisfactorily comply with all other requirements and requisitions submitted by or on behalf of the Lender.`,
      {
        lineGap: 2,
        align: "left",
        align: "justify",
        width: 500, // Set a maximum width
      }
    ); 
    
    addFooter();
    
//     // ------------------------------------------------- new page --------------------------------------------------------------------
    
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(8);
    
    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
     `c) Pay all rents, rates, taxes, cesses, fees, revenues, assessments, duties, and other outgoings due in respect of the said Immovable Property. I/We shall observe and perform all the rules and regulations pertaining to the same and will not do or omit to do or suffer to be done anything whereby the mortgaged security, as proposed to be created in favor of the Lender, may be affected or prejudiced in any manner whatsoever.
    
    22. I/We further undertake that no mortgage, charge, lien, or other encumbrance whatsoever will be created on the properties comprised in the mortgaged security, save and except with the permission of the Lender.
    
    23. I/We are not aware of any act, deed, matter, thing, or circumstance which prevents me/us from charging or further charging the said Immovable Property in favor of the Lender.
    
    24. I/We (for borrower/s) hereby unconditionally and irrevocably agree, as a condition of such loan/advances extended to the Borrower by the Lender, that in case I/We commit default in the repayment of such loan/advances, or in the repayment of interest thereon, or any of the agreed installments of the loan on the due date, the Lender and/or the Reserve Bank of India will have an unqualified right to disclose or publish my/our name or the name of our company/firm/unit and/or its directors/partners/proprietors as defaulter/s in such manner and through such medium as the Lender or Reserve Bank of India in their absolute discretion may think fit.
    
    25. I/We further understand that, as a pre-condition relating to the grant of the loans/advances/credit facilities to the Borrower, the Lender requires my/our consent for the disclosure by the Lender of information and data relating to me/us, the credit facility availed of/to be availed by me/us, obligations assumed/to be assumed by me/us, and any default committed in relation thereto.
    
    26. Accordingly, I/We hereby agree and give consent to the disclosure by the Lender of all or any such:
     
     a. Information and data relating to me/us.
     
     b. Information or data relating to any credit facility availed of/to be availed by me/us.
     
     c. Default, if any, committed by me/us in discharge of my/our obligations, as the Lender may deem appropriate and necessary to disclose and furnish to any agency authorized by the RBI.
    
     I/We declare that the information and data furnished by me/us to the Lender are true and correct.
    
    27. Further, in consideration of the Lender agreeing to grant the Loan against Property and in consideration of the Lender, at our request, continuing and having continued the above-mentioned facilities, I/We agree, confirm, and undertake:
    
     a) To keep the mortgaged security fully insured against fire and such other risks as may be required by the Lender, and to submit the respective insurance policies to the Lender.
    
     b) To allow the Lender to carry out inspections of the mortgaged securities at periodical intervals, and to bear the inspection charges and other incidental charges incurred by the Lender in connection therewith.
    
     c) To allow the Lender to charge penal interest @ 2% P.M above the rate applicable to the Loan Account in the following circumstances:
     
       ● The entire overdue amount in case of default in repayment of loan installments.
       
       ● The entire outstanding amount of loan facilities for non-compliance with agreed terms and conditions mentioned in the Sanction Letter.
     
     d) To obtain the Lender's written consent in respect of the following matters:
     
       ● Making investments in or giving loans to subordinates, associate concerns, individuals, or other parties.
       
       ● Effecting mergers and acquisitions.
       
       ● Paying dividends other than out of the current year's earnings after making due provisions.
       
       ● Giving guarantees on behalf of third parties.
       
       ● Premature repayment of loans and discharge of other liabilities.
    `,
     {
       lineGap: 2,
       align: "left",
       align: "justify",
       width: 500, // Set a maximum width
     }
    );
    
    
    addFooter();
//     //-------------------------------------------- new page --------------------------------------------------------------------
    
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(8);
    
    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `e) Not to create, without the Lender's prior written consent, any charges on all or any of the assets and properties, other than the existing/proposed charges in favor of other Financial Institutions/Banks (if any).
    
    f) That all the monies advanced or to be advanced by the Lender under the facilities mentioned hereinabove shall be utilized exclusively for the purposes set forth in our proposal and for no other purpose. If the said loan/advance is utilized or attempted to be utilized for any other purpose, or if the Lender apprehends or has reasons to believe that the said loan/advance is being utilized for any other purpose, the Lender shall have the right to forthwith recall the entire or any part of the loan/advance without assigning any reason thereof.
    
    g) That notwithstanding anything to the contrary contained in any of the documents/agreements executed/to be executed by us, as well as in the Letter of Sanction by the Lender, the Lender shall be entitled to charge the contractual rate of interest at its own discretion, without any intimation to us, to bring it in conformity with the rate of interest prescribed by the Reserve Bank of India or any other eventuality, such as reintroduction of Interest Tax, etc., from time to time, and the same shall be binding on us as if such changes were already incorporated in the documents executed by us.
    
    h) That in the event of any irregularity, the Lender, at its discretion, shall be entitled to charge on the entire outstanding or any portion thereof interest at such enhanced rates as it may fix during the continuance of such irregularity. We understand that it is on the faith of the aforesaid representations and express undertakings that the Lender has consented to entertain our proposal for the said facilities.
    
    28. I/We undertake that:
    
    a. The Credit Information Bureau (India) Ltd. and any other agency so authorized may use and process the said information and data disclosed by the Lender in the manner as deemed fit by them.
    
    b. The Credit Information Bureau (India) Ltd. and any other agency so authorized may furnish, for consideration, the processed information and data or products thereof prepared by them to Lenders/Financial Institutions and other credit grantors or registered users, as may be specified by the Reserve Bank of India in this behalf.
    
    c. I/We certify that: (i) all information furnished by me/us is true, (ii) except as indicated in this application, there are no overdues/statutory dues against me/us, (iii) except as indicated in this application, no legal action has been/is being taken against me/us, (iv) I/We shall furnish the details of any legal actions or recovery processes, if any, initiated against me/us in the future by any person/body/authority, together with the details of the liability/claim therein and the actions taken by me/us to defend/counter the same, immediately upon my/our coming to know of such litigations, (v) I/We shall furnish all other information that may be required by you in connection with these credit facilities, and (vi) this information may also be exchanged by you with any agency you may deem fit, and you, your representatives, representatives of the Reserve Bank of India, or any other agency.
    
    29. I/We, the Borrower/s, hereby declare, state, and confirm as follows:
    
    a) There is no litigation, suit, recovery proceedings/execution application, or any other coercive action or process issued, undertaken, or adjudicated, or pending against us in any judicial forum/court of law/DRT/any tribunal/Revenue or other Recovery Authorities in respect of any loan, borrowing, or advance availed by me/us from any Lender/FI/Co-operative Society/NBFC or any other private/government/semi-government or public sector undertaking or institution. In case any such litigation/action or process is issued/filed or undertaken against us in the future, we shall immediately arrange to intimate/furnish (i) the details/particulars thereof in writing to the Lender/Branch, and (ii) the details of actions initiated/taken by me/us to counter/defend the same appropriately.
    
    b) There is litigation/insolvency proceedings/dispute/claim/coercive process/execution petition presently pending/adjudicated, though not finally, against me/us, the details whereof are as under:
    
    We further agree that it is on the faith of the above declaration/undertaking that the Lender has granted/sanctioned or proposes to sanction to the Borrowers the proposed/present/reviewed loan/advance facility(ies), and in case the above is found incomplete, incorrect, or false, then the Lender shall have the right to recall the advance/loan account and take/initiate any or all actions against me/us, including civil or criminal action or proceedings, and enforce its rights in a court of competent jurisdiction under any rules/regulations, act/s, or law/s in force.
    `,
      {
        lineGap: 2,
        align: "left",
        align: "justify",
        width: 500, // Set a maximum width
      }
    );
    
    addFooter();
    
//     // -------------------------------------------------- new page -----------------------------------------------------------------------------
    
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(8);
    
    doc
    .fontSize(9)
    .font(fontBold)
    .text("-: SCHEDULE ABOVE REFEERED TO :-", { align: "center" })
    .moveDown(0.8)
    .fontSize(8)
    .text("(Description of the Immovable Property)", { align: "center" })
    .moveDown(0.9)
    
    doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor("black") // Normal text color
    .text("Address of Immovable Property - 1: ", { continued: true })  // Keep this text inline
    .text("HOUSE NO 79 SURVEY NO 683 PATWARI HALKA NO 2 WARD NO 06 VILLAGE BABALDI GRAM PANCHYAT BABALDI TEHSIL PACHORE DISTRICT RAJGARH STATE MADHYA PRADESH PIN CODE 465687", 
          { align: "left", indent: 235 })  // Indentation for the second line onwards
    .moveDown(0.9)
    .font(fontBold)
    .fontSize(9)
    .text("Boundaries of Property", { align: "left" });
    
    doc.moveDown(0.5);
    
    function BoundariesFunction(tableData) {
        // Add Table Header
        const startX = 50; // Starting X position for the box
        let startY = doc.y + 10; // Starting Y position for the box
        const boxWidth = 500; // Total width of the box
        const numFields = 3; // Fixed number of columns (Direction, Separator, Description)
    
        // Adjusted widths for columns: first and last wider, middle narrower
        const firstColumnWidth = boxWidth * 0.4; // 40% for the first column
        const middleColumnWidth = boxWidth * 0.2; // 20% for the middle column
        const lastColumnWidth = boxWidth * 0.4; // 40% for the last column
    
        // Calculate the total height needed for the entire box
        let totalHeight = 0;
    
        // Calculate the height for each row and determine the total height of the box
        tableData.forEach((row) => {
            let rowHeight = 0;
            Object.values(row).forEach((field) => {
                const fieldTextHeight = doc
                    .font('Helvetica') // Regular font for calculating height
                    .fontSize(7.2)
                    .heightOfString(field || '', { width: firstColumnWidth }) + 10; // Add padding
                rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
            });
            totalHeight += rowHeight; // Accumulate the total height
        });
    
        // Draw the outer rectangle for the box
        doc
            .fillColor("#f0f0f0") // Box background color
            .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
            .stroke("black") // Border color (normal line)
            .fill();
    
        // Loop through the data and draw the text inside the box
        tableData.forEach((row) => {
            let currentX = startX; // Reset the starting X position for each row
            // Calculate row height based on the content in each field
            let rowHeight = 0;
            Object.values(row).forEach((field) => {
                const fieldTextHeight = doc
                    .font('Helvetica') // Regular font for calculating height
                    .fontSize(7.2)
                    .heightOfString(field || '', { width: firstColumnWidth }) + 10; // Add padding
                rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
            });
    
            // Draw rectangles for each field in the row
            Object.entries(row).forEach(([key, field], fieldIndex) => {
                // Set the width for each column
                const fieldWidth = fieldIndex === 1 ? middleColumnWidth : (fieldIndex === 0 ? firstColumnWidth : lastColumnWidth);
    
                // Draw rectangle for the field box
                doc
                    .fillColor("#f5f5f5") // Background color for field (empty box)
                    .rect(currentX, startY, fieldWidth, rowHeight)
                    .stroke("black") // Normal line border for field box
                    .fill();
    
                // Set font style based on whether it's a field (bold) or value (normal)
                const isFieldValue = key === 'value'; // Check if it's the value field
                doc
                    .font(isFieldValue ? 'Helvetica' : 'Helvetica-Bold') // Bold for field, normal for value
                    .fillColor("black")
                    .fontSize(7.2);
    
                // Align text properly based on column index
                const align = fieldIndex === 1 ? 'left' : (fieldIndex === 0 ? 'left' : 'left'); // Align all to left
    
                // Draw the field text in the box
                doc.text(field, currentX + 5, startY + 5, {
                    baseline: "hanging",
                    width: fieldWidth - 10, // Adjust width to provide padding inside the box
                    align: align, // Align text based on content
                });
    
                // Move to the next column
                currentX += fieldWidth; // Update X position for the next field
            });
    
            // Move to the next row
            startY += rowHeight; // Update Y position for the next row
        });
    }
    
    const boundariesData = [
        { field1: "On or towards North", field2: ": ", value: `${allPerameters.OnOrTowardsNorth}` },
        { field1: "On or towards South", field2: ": ", value: `${allPerameters.OnOrTowardsSouth}` },
        { field1: "On or towards East",  field2: ": ", value: `${allPerameters.OnOrTowardsEast}` },
        { field1: "On or towards West",  field2: ": ", value: `${allPerameters.OnOrTowardsWest}` },
    ];
    
    // Call the function to create the table
    BoundariesFunction(boundariesData);
    
    doc.moveDown(2);
    
    doc
    .fontSize(9)
    .font('Helvetica')
    .text(`DATE This: 19/9/2024`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(2);
    
    // Set initial font and size
    doc
    .font(font) // Assuming 'font' is defined elsewhere as your base font
    .fontSize(9)
    .fillColor("black")
    .text(`IN WITNESS WHEREOF the Borrower, Co-Borrowers & Guarantors set and subscribed their hands to these presents on the day and year
    first hereinabove written.\n\n`, {
    lineGap: 2,
    align: "left",
    width: 500, // Set a maximum width
    });
    
    // Bold text for "SIGNED & DELIVERED BY THE"
    doc
    .fontSize(9)
    .font('Helvetica-Bold') // Change to bold font
    .text(`SIGNED & DELIVERED BY THE`, {
    lineGap: 2,
    align: "left",
    width: 500, // Set a maximum width
    });
    
    // Change back to normal font for the rest of the text
    doc
    .fontSize(9)
    .font(font) // Switch back to normal font
    .text(`\n\n\nWITH IN NAMED\n\n\n(1) ${allPerameters.borrowerName}\n\n\n[Borrower]\n\n\n(2)${allPerameters.coBorrowername}\n\n\n[Co-Borrower]\n\n\n(3) ${allPerameters.guarantorname}\n\n\n`, {
    lineGap: 2,
    align: "left",
    width: 500, // Set a maximum width
    });
    
    addFooter();
    
//     //------------------------------------- new page -----------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(9);
    
    doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(`DEMAND PROMISSORY NOTE`, startX, doc.y, { align: "center", width: 500 });
    doc.moveDown(1);
    
    doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Place: INDORE \n\n Date: 19/9/2024`, startX, doc.y, { align: "right", width: 470 });
    doc.moveDown(2);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`ON DEMAND,I/We (1) ${allPerameters.borrowerName} (2) ${allPerameters.coBorrowername} (3) ${allPerameters.guarantorname} , Residing At 79 GRAM BABALDI BABALDI BABLDA RAJGARH SARANGPUR MADHYA PRADESH 465687`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(4);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(
    `(Hereinafter referred to as “Borrowers”/”Co-Borrowers”/”Guarantors” which term shall, unless repugnant to the context be deemed to include in case of (a) an individual, my/ our heirs, legal representatives, executors, administrators and permitted assigns, (b) a proprietorship firm, the proprietor(ess) (both in my/our personal capacity and as proprietor(ess) of the concern) and my/our heirs, legal representatives, executors, administrators, permitted assigns and successors of the concern, (c) a company, its successors and permitted assigns, (d) a limited liability partnership, its successors and permitted assigns, (e) a partnership firm, any or each of the partners and survivor(s) of them and the partners from time to time (both in their personal capacity and as partners of the firm) and their respective heirs, legal representatives , executors, administrators, permitted assigns and successors of the firm) jointly and severally promise to pay to RATNAAFIN CAPITAL PRIVATE LIMITED, a company incorporated under the provisions of the Companies Act, 2013, having its registered office at 201-202, Shilp Aperia, Near Ashok Vatika, Bopal -Ambli Road, Ahmedabad, Gujarat - 380054 (hereinafter referred to as the “Lender”, which expression shall, unless repugnant to the context, include its successors and assigns) the sum of Rs.600000/- (Rupees six hundred thousand Only) and with rate of interest at 19% Per Annum and/or such other rate as RCPL may fix from time to time for value received (to be paid monthly and to be calculated on the basis of 365 (three hundred and sixty five days)) and other amounts payable to the Lender in terms of the loan agreement dated 19/9/2024,, executed by and amongst the Borrowers and the Lender`,
       startX, // Starting X position
    doc.y, // Current Y position
    {
      align: "justify", // Align text for justification
      width: 500,      // Set a maximum width
      lineGap: 2,      // Optional line spacing
    }
    );
    
    doc.moveDown(3); // Move down after the text block
    
    doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Presentment for payment, notice of non-payment and noting and protest of the note are hereby unconditionally and irrevocably waived.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);
    // paymentTable
    
    function presentment(tableData) {
    // Add Table Header
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    const boxWidth = 500; // Adjust the width of the box as per your need
    
    // Calculate the total height needed for the entire box
    let totalHeight = 0;
    
    // Calculate the height for each row and determine the total height of the box
    tableData.forEach((row) => {
    const rowHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(row.field1, { width: boxWidth }) + 40; // Add padding
    
    totalHeight += rowHeight; // Accumulate the total height
    });
    
    // Draw the outer rectangle for the box
    doc
    .fillColor("#f0f0f0") // Box background color
    .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
    .stroke("black") // Border color
    .fill();
    
    // Loop through the data and draw the text inside the box
    tableData.forEach((row, rowIndex) => {
    // Calculate row height based on the content
    const rowHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(row.field1, { width: boxWidth }) + 40; // Add padding
    
    // Alternate row background color (optional)
    doc
      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff") // Alternate row colors
      .rect(startX, startY, boxWidth, rowHeight) // Draw rectangle for each row
      .stroke("black") // Border color for each row
      .fill();
    
    // Draw the text in the box
    doc
      .font(font)
      .font('Helvetica-Bold')
      .fillColor("black")
      .fontSize(7.2)
      .text(row.field1, startX + 5, startY + 5, {
        baseline: "hanging",
        width: boxWidth - 10, // Adjust width to provide padding inside the box
        align: "left", // Align text to the left
      });
    
    // Move to the next row
    startY += rowHeight;
    });
    }
    
    const presentmentpayment = [
    { field1: `BORROWERS NAME : ${allPerameters.borrowerName}`},
    { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowername}` },
    { field1: `GUARANTOR'S NAME : ${allPerameters.guarantorname}` },
    ];
    
    presentment(presentmentpayment);
    // presentmentpayment
    addFooter();
    
    
//     // ------------------------------------------------------ new page ------------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(9);
    
    doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(`LETTER OF CONTINUITY FOR DEMAND PROMISSORY NOTE`, startX, doc.y, { align: "center", width: 500 });
    doc.moveDown(2);
    
    doc
    .fontSize(9)
    .font('Helvetica')
    .text(`Place: INDORE \n\n  Date: ${allPerameters.agreementdate}`, startX, doc.y, { align: "right", width: 470 });
    doc.moveDown(1);
    
    doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`To,`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(2);
    
    doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Ratnaafin Capital Private Limited`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(2);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(` 201-202, Shilp Aperia,\n Near Ashok Vatika,\n Bopal-Ambli Road,\n Ahmedabad, Gujarat – 380054 \n\n Dear Sirs, \n\n\n I/We (1) ${allPerameters.borrowerName} (2)${allPerameters.coBorrowername} (3) ${allPerameters.guarantorname} ,  ${allPerameters.borroewraddress}`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(4);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`(Hereinafter referred to as “Borrowers”/”Co-Borrowers”/”Guarantors” which term shall, unless repugnant to the context be deemed to include in case (a) an individual, his/her heirs, legal representatives, executors, administrators and permitted assigns, (b) a proprietorship firm, the proprietor(ess) (both in my/our personal capacity and as proprietor(ess) of the concern) and his/her heirs, legal representatives, executors, administrators, permitted assigns and successors of the concern, (c) a company, its successors and permitted assigns, (d) a limited liability partnership, its successors and permitted assigns, (e) a partnership firm, any or each of the partners and survivor(s) of them and the partners from time to time (both in their personal capacity and as partners of the firm) and their respective heirs, legal representatives, executors, administrators, permitted assigns and successors of the firm) have executed a Demand Promissory Note for Rs. 600000/- (Rupees six hundred thousand Only) and with rate of interest at 19% Per Annum and/or such other rate as RCPL may fix from time to time for value received, dated 19/9/2024 duly signed and delivered by me/us to you, as security for the repayment of all amounts due and/or payable by us under the loan agreement dated 19/9/2024 and/or any amendment(s)/addendum(s) thereto (“Loan Agreement”).\n\n\nWe hereby irrevocably and unconditionally, agree, confirm and undertake that the said Demand Promissory Note shall operate as a continuing security to you to be enforceable for the repayment of the ultimate balance and/or all sums remaining unpaid under the Loan Agreement now or hereafter,including all interest to become payable under the Loan Agreement, and also all monies lent, advanced, paid or incurred in respect of/under the Loan Agreement or which may in future be advanced or incurred together with interest, discount, commission and other charges and all other costs, charges and expenses which may be or become payable in connection therewith.\n\n\n Thanking you `, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);
    
    presentment(presentmentpayment);
    
    addFooter();
    
    
//     // ----------------------------------------------new page ------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(9);
    
    doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text(`UDC Covering Letter (APPLICANT)`, startX, doc.y, { align: "center",underline: true, width: 500 });
    doc.moveDown(2);
    
    doc
    .fontSize(9)
    .font('Helvetica')
    .text(`${allPerameters.agreementdate}`, startX, doc.y, { align: "right", width: 470 });
    doc.moveDown(1);
    
    doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`To,`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(1);
    
    doc
    .fontSize(8)
    .font('Helvetica-Bold')
    .text(`Ratnaafin Capital Private Limited`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(1);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`201-202, Shilp Aperia,\n Near Ashok Vatika,\n Bopal-Ambli Road,\n Ahmedabad, Gujarat – 380054 \n\n Sirs, \n `, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(2);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`subject:Credit Facility of Rs. ${allPerameters.loanAmounts}(${allPerameters.loanAmountInWord}) sanctioned to ${allPerameters.borrowerName}`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);
    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`In consideration of and towards repayment of the aforesaid credit facilities granted/agreed to be granted by Ratnaafin Capital Pvt. Ltd Lender I/We, ${allPerameters.borrowerName} hereby inter alia deliver to the Lender the cheques (as detailed hereunder) drawn in favour of the Lender being blank as regards the date of the cheque and the amount.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);
    
    function chequeTable(tableData) {
    // Add Table Header
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    
    // Define custom column widths
    const columnWidths = {
        field1: 50,   // Sr. No.
        field2: 100,  // Cheque No.
        field3: 200,  // Bank Details
        field4: 150,  // Name of the account holder
    };
    
    // Function to calculate row height dynamically based on content
    const calculateRowHeight = (row) => {
        let maxHeight = 0;
        Object.keys(row).forEach((field) => {
            const text = row[field] || ''; // Default to empty string if no value
            const columnWidth = columnWidths[field] || 100; // Default width
            const textHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(text, { width: columnWidth }) + 10; // Add padding
            maxHeight = Math.max(maxHeight, textHeight);
        });
        return maxHeight;
    };
    
    // Calculate total height for the table
    let totalHeight = 0;
    tableData.forEach(row => {
        totalHeight += calculateRowHeight(row);
    });
    
    // Draw the outer rectangle for the box
    doc
        .fillColor("#f0f0f0")
        .rect(startX, startY, 500, totalHeight) // Adjust box width to the total width of columns
        .stroke("black")
        .fill();
    
    // Loop through the data and draw the text inside the box
    tableData.forEach((row, rowIndex) => {
        let currentX = startX; // Reset the starting X position for each row
        const rowHeight = calculateRowHeight(row);
    
        // Draw rectangles and fill in data
        Object.keys(columnWidths).forEach((field) => {
            const columnWidth = columnWidths[field];
            const text = row[field] || ''; // Handle blank fields
    
            // Draw rectangle for the field box
            doc
                .fillColor("#f5f5f5") // Background color for the box
                .rect(currentX, startY, columnWidth, rowHeight)
                .stroke("black")
                .fill();
    
            // Set font style for header or regular row
            const isHeader = rowIndex === 0; // Check if it's the header row
            doc
                .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                .fillColor("black")
                .fontSize(7.2);
    
            // Draw the field text, align left
            doc.text(text, currentX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidth - 10, // Adjust width for padding
                align: 'left', // Align text to the left
            });
    
            currentX += columnWidth; // Update X for next field
        });
    
        // Move to the next row
        startY += rowHeight;
    });
    }
    
    // Updated applicant table with dynamic fields
    const applicantTable = [
    { field1: "Sr. No.", field2: "Cheque No.", field3: "Bank Details", field4: "Name of the account holder" },
    { field1: "1", field2: `${allPerameters.table?.[0]?.appchequeNo1}`, field3: `${allPerameters.table?.[0]?.bankDetail1}`, field4: `${allPerameters.table?.[0]?.accountHolderName1}` },
    { field1: "2", field2: `${allPerameters.table?.[1]?.appchequeNo2}`, field3: `${allPerameters.table?.[1]?.bankDetail1}`, field4: `${allPerameters.table?.[1]?.accountHolderName2}` },
    { field1: "3", field2: `${allPerameters.table?.[2]?.appchequeNo3}`, field3: `${allPerameters.table?.[2]?.bankDetail1}`, field4: `${allPerameters.table?.[2]?.accountHolderName3}` },
    { field1: "4", field2: `${allPerameters.table?.[3]?.appchequeNo4}`, field3: `${allPerameters.table?.[3]?.bankDetail4}`, field4: `${allPerameters.table?.[3]?.accountHolderName4}` },
    { field1: "5", field2:`${allPerameters.table?.[4]?.appchequeNo5}`, field3: `${allPerameters.table?.[4]?.bankDetail5}`, field4: `${allPerameters.table?.[4]?.accountHolderName5}` },
    { field1: "6", field2: `${allPerameters.table?.[5]?.appchequeNo6}`, field3: `${allPerameters.table?.[5]?.bankDetail6}`, field4: `${allPerameters.table?.[5]?.accountHolderName6}` },
    { field1: "7", field2: `${allPerameters.table?.[6]?.appchequeNo7}`, field3: `${allPerameters.table?.[6]?.bankDetail7}`, field4: `${allPerameters.table?.[6]?.accountHolderName7}` },
    ];
    
    // Call the function to create the table
    chequeTable(applicantTable);
    doc.moveDown(2);
    doc.moveDown(2);

    
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`I/we do hereby agree and acknowledge in accordance with the provisions of section 20 of the Negotiable Instruments Act ("The Act") the Lender in the present case as the holder of the said cheques shall have the authority to complete the said cheques.\n\n In addition to the express provisions of the Act as mentioned above authorizing the Lender to complete the said cheques to the extent of credit facility outstanding including any interest, penal charges , other charges, etc. that the Lender may incur I / We hereby unconditionally and irrevocably authorize and confirm the authority of the Lender to fill in the date and the amount on the said cheques and to present the same for payment.\n\nI/We hereby undertake to be absolutely bound as the drawer of the said cheques so completed by the Lender as above and shall be liable in the same manner as the said cheques were drawn and completed by me/us and shall ensure that the said cheques are honored on presentation for payment\n\nI/We agree and acknowledge that any dishonoring of the said cheques would make me/us liable including under the provisions of section 138 of the Negotiable Instruments Act,1881.\n\nFor and on behalf of:
    `, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);
    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`___________________________`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);

// doc
// .fontSize(8)
// .font('Helvetica')
// .text(`I/we do hereby agree and acknowledge in accordance with the provisions of section 20 of the Negotiable Instruments Act ("The Act") the Lender in the present case as the holder of the said cheques shall have the authority to complete the said cheques.\n\n In addition to the express provisions of the Act as mentioned above authorizing the Lender to complete the said cheques to the extent of credit facility outstanding including any interest, penal charges , other charges, etc. that the Lender may incur I / We hereby unconditionally and irrevocably authorize and confirm the authority of the Lender to fill in the date and the amount on the said cheques and to present the same for payment.\n\nI/We hereby undertake to be absolutely bound as the drawer of the said cheques so completed by the Lender as above and shall be liable in the same manner as the said cheques were drawn and completed by me/us and shall ensure that the said cheques are honored on presentation for payment\n\nI/We agree and acknowledge that any dishonoring of the said cheques would make me/us liable including under the provisions of section 138 of the Negotiable Instruments Act,1881.\n\nFor and on behalf of:
// `, startX, doc.y, { align: "left",align: "justify", width: 500 });
//  doc.moveDown(1);

  addFooter();

//   //------------------------------- new page 12 ----------------------------------------------

  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(9);

  doc
  .fontSize(9)
  .font('Helvetica-Bold')
  .text(`UDC Covering Letter (Guarantor)`, startX, doc.y, { align: "center",underline: true, width: 500 });
  doc.moveDown(2);

  doc
  .fontSize(9)
  .font('Helvetica')
  .text(`${allPerameters.agreementdate}`, startX, doc.y, { align: "right", width: 470 });
  doc.moveDown(1);

  doc
  .fontSize(8)
  .font('Helvetica-Bold')
  .text(`To,`, startX, doc.y, { align: "left", width: 500 });
  doc.moveDown(1);

  doc
  .fontSize(8)
  .font('Helvetica-Bold')
  .text(`Ratnaafin Capital Private Limited`, startX, doc.y, { align: "left", width: 500 });
  doc.moveDown(1);

  doc
  .fontSize(8)
  .font('Helvetica')
  .text(` 201-202, Shilp Aperia,\n Near Ashok Vatika,\n Bopal-Ambli Road,\n Ahmedabad, Gujarat – 380054\n\n Sirs, \n `, startX, doc.y, { align: "left",align: "justify", width: 500 });
  doc.moveDown(2);

  doc
  .fontSize(8)
  .font('Helvetica')
  .text(`subject:Credit Facility of Rs. ${allPerameters.loanAmounts}(${allPerameters.loanAmountInWord}) sanctioned to ${allPerameters.borrowerName}`, startX, doc.y, { align: "left",align: "justify", width: 500 });
  doc.moveDown(1);

  doc
  .fontSize(8)
  .font('Helvetica')
  .text(`In consideration of and towards repayment of the aforesaid credit facilities granted/agreed to be granted by Ratnaafin Capital Pvt. Ltd Lender I/We, ${allPerameters.guarantorname} hereby inter alia deliver to the Lender the cheques (as detailed hereunder) drawn in favour of the Lender being blank as regards the date of the cheque and the amount.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
   doc.moveDown(1);


   function ChequETaBLE(tableData) {
    // Add Table Header
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    
    // Define custom column widths
    const columnWidths = {
        field1: 50,   // Sr. No.
        field2: 100,  // Cheque No.
        field3: 200,  // Bank Details
        field4: 150,  // Name of the account holder
    };
    
    // Function to calculate row height dynamically based on content
    const calculateRowHeight = (row) => {
        let maxHeight = 0;
        Object.keys(row).forEach((field) => {
            const text = row[field] || ''; // Default to empty string if no value
            const columnWidth = columnWidths[field] || 100; // Default width
            const textHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(text, { width: columnWidth }) + 10; // Add padding
            maxHeight = Math.max(maxHeight, textHeight);
        });
        return maxHeight;
    };
    
    // Calculate total height for the table
    let totalHeight = 0;
    tableData.forEach(row => {
        totalHeight += calculateRowHeight(row);
    });
    
    // Draw the outer rectangle for the box
    doc
        .fillColor("#f0f0f0")
        .rect(startX, startY, 500, totalHeight) // Adjust box width to the total width of columns
        .stroke("black")
        .fill();
    
    // Loop through the data and draw the text inside the box
    tableData.forEach((row, rowIndex) => {
        let currentX = startX; // Reset the starting X position for each row
        const rowHeight = calculateRowHeight(row);
    
        // Draw rectangles and fill in data
        Object.keys(columnWidths).forEach((field) => {
            const columnWidth = columnWidths[field];
            const text = row[field] || ''; // Handle blank fields
    
            // Draw rectangle for the field box
            doc
                .fillColor("#f5f5f5") // Background color for the box
                .rect(currentX, startY, columnWidth, rowHeight)
                .stroke("black")
                .fill();
    
            // Set font style for header or regular row
            const isHeader = rowIndex === 0; // Check if it's the header row
            doc
                .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
                .fillColor("black")
                .fontSize(7.2);
    
            // Draw the field text, align left
            doc.text(text, currentX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidth - 10, // Adjust width for padding
                align: 'left', // Align text to the left
            });
    
            currentX += columnWidth; // Update X for next field
        });
    
        // Move to the next row
        startY += rowHeight;
    });
    }

// Updated applicant table with dynamic fields
const guarantorTable = [
  { field1: "Sr. No.", field2: "Cheque No.", field3: "Bank Details", field4: "Name of the account holder" },
  { field1: "1", field2: `${allPerameters.table?.[0]?.guchequeNo1}`, field3: `${allPerameters.tableno2?.[0]?.gubankDetail1}`, field4: `${allPerameters.tableno2?.[0]?.guaccountHolderName1}` },
  { field1: "2", field2: `${allPerameters.tableno2?.[1]?.guchequeNo2}`, field3: `${allPerameters.tableno2?.[1]?.gubankDetail2}`, field4: `${allPerameters.tableno2?.[1]?.guaccountHolderName2}` },
  { field1: "3", field2: `${allPerameters.tableno2?.[2]?.guchequeNo3}`, field3: `${allPerameters.tableno2?.[2]?.gubankDetail3}`, field4: `${allPerameters.tableno2?.[2]?.guaccountHolderName3}` },
  { field1: "4", field2: `${allPerameters.tableno2?.[3]?.guchequeNo4}`, field3: `${allPerameters.tableno2?.[3]?.gubankDetail4}`, field4: `${allPerameters.tableno2?.[3]?.guaccountHolderName4}` },
  { field1: "5", field2:`${allPerameters.tableno2?.[4]?.guchequeNo5}`, field3: `${allPerameters.tableno2?.[4]?.gubankDetail5}`, field4: `${allPerameters.tableno2?.[4]?.guaccountHolderName5}` },
  { field1: "6", field2: `${allPerameters.tableno2?.[5]?.guchequeNo6}`, field3: `${allPerameters.tableno2?.[5]?.gubankDetail6}`, field4: `${allPerameters.tableno2?.[5]?.guaccountHolderName6}` },
  { field1: "7", field2: `${allPerameters.tableno2?.[6]?.guchequeNo7}`, field3: `${allPerameters.tableno2?.[6]?.gubankDetail7}`, field4: `${allPerameters.tableno2?.[6]?.guaccountHolderName7}` },
  ];
// Call the function to create the table
ChequETaBLE(guarantorTable);
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`I/we do hereby agree and acknowledge in accordance with the provisions of section 20 of the Negotiable Instruments Act ("The Act") the Lender in the present case as the holder of the said cheques shall have the authority to complete the said cheques.\n\n In addition to the express provisions of the Act as mentioned above authorizing the Lender to complete the said cheques to the extent of credit facility outstanding including any interest, penal charges , other charges, etc. that the Lender may incur I / We hereby unconditionally and irrevocably authorize and confirm the authority of the Lender to fill in the date and the amount on the said cheques and to present the same for payment.\n\nI/We hereby undertake to be absolutely bound as the drawer of the said cheques so completed by the Lender as above and shall be liable in the same manner as the said cheques were drawn and completed by me/us and shall ensure that the said cheques are honored on presentation for payment\n\nI/We agree and acknowledge that any dishonoring of the said cheques would make me/us liable including under the provisions of section 138 of the Negotiable Instruments Act,1881.\n\nFor and on behalf of:
`, startX, doc.y, { align: "left",align: "justify", width: 500 });
 doc.moveDown(1);

 doc
    .fontSize(8)
    .font('Helvetica')
    .text(`___________________________`, startX, doc.y, { align: "left",align: "justify", width: 500 });
    doc.moveDown(1);

  addFooter();

// // -------------------------------------------new page 13 --------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(7);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`VERNACULAR CONFIRMATION LETTER`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`${allPerameters.agreementdate}`, startX, doc.y, { align: "right", width: 470 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`To,`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`RATNAAFIN CAPITAL PRIVATE LIMITED`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`201-202, Shilp Aperia,\n Near Ashok Vatika,\n Bopal-Ambli Road,\n Ahmedabad, Gujarat – 380054`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(3);


doc
.fontSize(8)
.font('Helvetica')
.text(`I/We hereby acknowledge and confirm that I/we have received the copy of the loan Agreement dated ${allPerameters.agreementdate} executed between RCPL and me/us ('Loan Agreement') and the contents of the loan Agreement have been fully explained to and understood by me/us at the time of availing the loan in the language understood by me/us) \n\n I/We further confirm that am/are fully aware of and completely understand the rights and obligations contained in the loan documents mentioned below:`, startX, doc.y, { align: "left",align: "justify", width: 500 });
 doc.moveDown(1);

 doc
.fontSize(8)
.font('Helvetica')
.text(` 1. Loan application form\n 2. KYC form\n 3. Sanction letter\n 4. DP Note\n 5. Declaration cum Undertaking\n 6. Guarantee Agreement \n 7. Loan Facility Agreement\n 8. Mortgage Deed \n 9. Any other document related to loan`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(3);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`Cum Authority by the Borrower,Co-Borrower & Guarantor`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

const confirmationTable = [
  { field1: `BORROWERS NAME : ${allPerameters.borrowerName}`},
  { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowername}` },
  { field1: `GUARANTOR'S NAME : ${allPerameters.guarantorname}` },
];

presentment(confirmationTable);
addFooter();
// //---------------------------------------------------- new page 14-------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(7);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`VERNACULAR DECLARATION FORM`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(2);


function declarationTableFunction(tableData) {
  const startX = 50;
  let startY = doc.y + 10;

  const columnWidths = {
    field1: 50,
    field2: 100,
    field3: 330,
  };

  // Define min and max row height to avoid extremes
  const MIN_ROW_HEIGHT = 15;
  const MAX_ROW_HEIGHT = 45;

  // Function to calculate row height based on text content
  const calculateRowHeight = (row) => {
    let maxHeight = 0;
    Object.keys(row).forEach((field) => {
      const text = row[field] || '';
      const columnWidth = columnWidths[field] || 100;

      // Calculate the text height for each field
      const textHeight = doc
        .font(field === 'field3' ? fontKerlaTamil : 'Helvetica')
        .fontSize(7.2)
        .heightOfString(text, { width: columnWidth });

      // Track the highest text height in the row
      maxHeight = Math.max(maxHeight, textHeight);
    });

    // Ensure the row height stays within the defined min and max limits
    return Math.max(MIN_ROW_HEIGHT, Math.min(maxHeight, MAX_ROW_HEIGHT));
  };

  const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);

  tableData.forEach((row, rowIndex) => {
    let currentX = startX;
    const rowHeight = calculateRowHeight(row); // Calculate the row height based on text content

    // Set up the table border at the beginning
    doc
      .lineWidth(0.25)
      .rect(startX, startY, totalWidth, rowHeight)
      .stroke("black");

    Object.keys(columnWidths).forEach((field) => {
      const columnWidth = columnWidths[field];
      const content = row[field] || '';

      doc
        .lineWidth(0.25)
        .rect(currentX, startY, columnWidth, rowHeight)
        .stroke("black");

      const isHeader = rowIndex === 0;
      const paddingTop = 2;  // Adjust padding from the top (increase if needed)
      const textYPosition = startY + paddingTop;

      if (field === 'field1' && content) {
        doc.image(content, currentX + 5, textYPosition + (rowHeight - 8) / 2, { width: 8, height: 8 });
      } else {
        doc
          .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor("black")
          .fontSize(7.2);

        const text = content || '';
        if (field === 'field3') {
          // Checking for specific languages to apply respective fonts
          if (/[\u0C00-\u0C7F]/.test(text)) {  // Telugu Unicode range
            doc.font(fontTelugu)
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
          } else if (/[\u0D00-\u0D7F]/.test(text)) {  // Malayalam Unicode range
            doc.font(fontMalayam).text(text, currentX + 3, textYPosition, {
              baseline: "top",
              width: columnWidth - 6,
              align: 'left',
            });
          } else if (/[\u0C80-\u0CFF]/.test(text)) {  // Kannada Unicode range
            doc.font(fontKannada).text(text, currentX + 3, textYPosition, {
              baseline: "top",
              width: columnWidth - 6,
              align: 'left',
            });
          } else if (/[\u0A80-\u0AFF]/.test(text)) {  // Gujarati Unicode range
            doc.font(fontGujarati)
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
          } else if (/[\u0600-\u06FF]/.test(text)) {  // Urdu Unicode range
            doc.font(fontUrdu)
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'right',
               });
          } else if (/[\u0A00-\u0A7F]/.test(text)) {  // Punjabi Unicode range
            doc.font(fontPanjabi)
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
          } else if (/[\u0B80-\u0BFF]/.test(text)) {  // Tamil Unicode range
            doc.font(fontKerlaTamil).text(text, currentX + 3, textYPosition, {
                baseline: "top",
                width: columnWidth - 6,
                align: 'left',
            });
          } else if (/[\u0900-\u097F]/.test(text)) {  // Hindi Unicode range
            doc.font(fontHindi)
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
          } else  if (/[\u0B00-\u0B7F]/.test(text)) {  // Odia Unicode range
            doc.font(fontOriya)  // Make sure 'fontOdia' is defined and points to the correct font file
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
           } else if (/[\u0900-\u097F]/.test(text)) {  // Marathi (Devanagari Unicode range)
            doc.font(fontMarathi)  // Ensure you have the Marathi font file available
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
        } else if (/[\u0980-\u09FF]/.test(text)) {  // Bengali Unicode range
          doc.font(fontBengali)  // Ensure you have the Bengali font file available
             .text(text, currentX + 3, textYPosition, {
               baseline: "top",
               width: columnWidth - 6,
               align: 'left',
             });
        }else {
            doc.font('Helvetica')
               .text(text, currentX + 3, textYPosition, {
                 baseline: "top",
                 width: columnWidth - 6,
                 align: 'left',
               });
          }
        } else {
          doc.font('Helvetica')
             .text(text, currentX + 3, textYPosition, {
               baseline: "top",
               width: columnWidth - 6,
               align: 'left',
             });
        }
      }

      currentX += columnWidth;
    });

    startY += rowHeight; // Adjust to the row's actual height
  });
}

const gujratiFont = [
'આ અરજી/કરાર/પત્ર/નિયમો અને શરતોનો સામગ્રી અરજીકર્તા/ઋણગ્રાહક અને સહ-ઋણગ્રાહકને અંગ્રેજીમાં વાંચીને સમજાવી',
'  અને વ્યાખ્યા કરવામાં આવી છે અને અરજીકર્તા/ઋણગ્રાહક અને સહ-ઋણગ્રાહક દ્વારા તેને સમજવામાં આવી છે',
]

const declarationTable = [
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "English", 
    field3: "The content of this Application/ Agreement/letter/Terms and Conditions has been read out, explained and interpreted to the applicant(s)/Borrower and to the Co-Borrower(s) in English and understood by the applicant(s)/Borrower and Co-Borrower(s).",  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Hindi", 
    field3: "इसआवेदन / समझौ ते / पत्र / नि यमों औमों रशर्तों की सा मग्री को आवेदक (ओं)ओं / उधा रकर्ता औरअंग्रेजीग्रे जीमेंसह-उधा रकर्ता (ओं)ओं को समझा औरसमझा यागयाहैऔहै रआवेदक (ओं)ओं याउधा रकर्ता द्वा रा समझा गया है ।",  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Punjabi", 
    field3: "ਇਸਬਿ ਨੈ-ਪੱਤਰ / ਸਮਝੌਤੇਝੌਤੇ/ ਪੱਤਰ / ਨਿ ਯਮਾਂ ਅਮਾਂ ਤੇਸ਼ਰਤਾਂ ਦੀਤਾਂ ਦੀਸਮੱਗਰੀ ਨੂੰਬਿ ਨੈਕਾ ਰ /ਉਧਾ ਰਲੈਣਵਾ ਲੇਅਤੇਅੰਗ੍ਰੇਜ਼ੀ ਵਿ ਚਸਹਿ -ਉਧਾ ਰਲੈਣਵਾ ਲੇਨੂੰਸਮਝਾ ਕੇਸਮਝਾ ਇਆਗਿ ਆਹੈਅਤੇਬਿ ਨੈਕਾ ਰਦੁਆਰਾ ਸਮਝੇਗਝੇ ਏਅਤੇਸਹਿ -ਉਧਾ ਰਲੈਣਵਾ ਲੇ।",  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Kannada", 
    field3: "ಈ ಅಪ್ಲಿಕೇ ಶನ್/ಒಪ್ಪಂ ದ/ಪತ್ರ / ನಿಯಮಗಳುಮತ್ತು ಷರತ್ತು ಗಳವಿಷಯವನ್ನು ಅರ್ಜಿ ದಾ ರ (ರು )/ ಸಾ ಲಗಾರಮತ್ತು ಇಂ ಗ್ಲಿಷ್ನಲ್ಲಿಸಹ-ಸಾ ಲಗಾರ(ಗಳು)ಗೆಓದಿ, ವಿವರಿಸಲಾ ಗಿದೆಮತ್ತು ವ್ಯಾ ಖ್ಯಾ ನಿಸಲಾ ಗಿದೆಮತ್ತು ಅರ್ಜಿ ದಾ ರರು (ಗಳು ) /ಸಾ ಲಗಾರರಿಂ ದಅರ್ಥ ಮಾ ಡಿಕೊ ಳ್ಳಲಾ ಗಿದೆಮತ್ತು ಸಹ-ಸಾ ಲಗಾ ರ (ಗಳು).  ",  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Telugu", 
    field3: "ఈ అప్లికేప్లిషన్ / ఒప్పం దం / లేఖ / నిబం ధనలుమరియుషరతులయొక్క కం టెం ట్దరట్ద ఖాస్తుదారు(లు) / రుణగ్ర హీతమరియుఆం గ్లం లోసహ-రుణగ్ర హీత (ల)కుచదవబడిం ది, వివరిం చబడిం దిమరియువివరిం చబడిం దిమరియుదరఖాస్తుదారు(లు) / రుణగ్ర హీతఅర్థం చేసుకున్నా రుమరియుసహ-రుణగ్ర హీత (లు)."
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Tamil", 
    field3: "இந்தவிண்ணப்பம் / ஒப்பந்தம் / கடிதம்வி தி முறைகள்மற்றும்நி பந்தனை களி ன்உள்ளடக்கம்விண்ணப்பதா ரர்(கள்)/கடன்வா ங்குபவர் மற்றும்இணைக்கடன்வா ங்குபவர்(கள்) ஆகி யோ ருக்குஆங்கி லத்தி ல்படித்துவி ளக்கப்பட்டுவி ளக்கம்அளி க்கப்பட்டுள்ளதுமற்றும்விண்ணப் பதா ரர்(கள்)/கடன்வா ங்குபவர்புர",  // Tamil text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Malayalam", 
    field3: 'ഈ ആപ്ലി ക്കേ ഷന്റെ ഉള്ളടക്കം / കരാ ർ / കത്ത് / നി ബന്ധനകളും വ്യ വസ്ഥകളും അപേ ക്ഷകന് / കടം വാ ങ്ങു ന്നയാ ൾക്കും ഇം ഗ്ലീ ഷി ൽ സഹ-കടം വാ ങ്ങു ന്നയാ ൾക്കും വാ യിക്കു കയും വി ശദീ കരിക്കു കയും വ്യാ ഖ്യാ നിക്കു കയും ചെ യ്തു കൂ ടാ തെ അ പേ ക്ഷകൻ (ങ്ങൾ) / കടം വാ ങ്ങു ന്നയാ ൾ മനസ്സി ലാ ക്കു കയും ചെ യ്യു ന്നു . ഒപ്പം സഹ-കടം വാ ങ്ങു ന്നവരും .',  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Oriya", 
    field3: 'ଏହିଆହି ବେ ଦନ / ଚୁକ୍ତିନା ମା / ଚିଠିଚି ଠି/ ସର୍ତ୍ତା ବଳୀ ଏବଂ ଚୁକ୍ତିନା ମା ଗୁଡିକଡି ଆବେ ଦନକା ରୀ (()) / orrଣଗ୍ରହୀ ତା ଏବଂ ସହ-orrଣଗ୍ରହୀ ତା ଙ୍କୁଇଂ ରା ଜୀ ରେ ପ read ା ଯା ଇଛି,ଛିବ୍ୟା ଖ୍ୟା କରା ଯା ଇଛିଏବଂ ଆବେ ଦନକା ରୀ (ମା ନେ ) / orrଣଦା ତା ଦ୍ୱା ରା ବୁଝିଛଝିନ୍ତିଏନ୍ତିବଂ ସହ-orrଣଦା ତା (ଗୁଡିକଡି ) |',  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Marathi", 
    field3: 'याअर्जा ची / करा रा ची / पत्रा ची / अटी व शर्तीं ची मा हि ती वा चूनका ढली गेली आहे,हेअर्जदा रा ला /कर्जदा रा ला आणि इंग्रजी मध्येसह-कर्जदा रा ला /केली आहे व अर्जदा रा ने /कर्जदा रा नेसमजूनघेतली आहे.हेआणि सह-कर्जदा र',  // English text
  },
  { 
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Gujarati", 
    field3: gujratiFont.join('\n'),  // English text
  },
  {
    field1: unCheckedLogo,  // Path to the image file (not doc.image)
    field2: "Urdu", 
    field3: "درخواست/معاہدہ/خط/شرائط و ضوابط کا مواد درخواست دہندہ/قرض دہندہ اور شریک قرض دہندہ کو انگریزی میں پڑھ کر سنایا گیا، وضاحت کی گئی اور اس کی تشریح کی گئی اور درخواست دہندہ/قرض دہندہ اور شریک قرض دہندہ نے اسے سمجھ لیا۔",  // Urdu text
  },
];

// // Call the table function to render the data
declarationTableFunction(declarationTable);
doc.moveDown(3);

doc
.fontSize(9)
.font('Helvetica')
.text(`___________________________`, startX, doc.y, { align: "left",underline: true, width: 500 });
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`Lender (Authorised Signatory`, startX, doc.y, { align: "left",underline: true, width: 500 });
doc.moveDown(1);
  
addFooter();
// // -------------------------------------- new page ------------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(10);

const lenderpayment = [
  { field1: `BORROWERS NAME : ${allPerameters.borrowerName}`},
  { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowername}` },
  { field1: `GUARANTOR'S NAME : ${allPerameters.guarantorname}` },
];

presentment(lenderpayment);

addFooter();

// // -------------------------------------- new page ------------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(7);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`Annexure-I`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`The Borrower and Co-Borrower(s) (“Borrowers”) hereby accept and acknowledge that they have been made aware of the terms set out in this Annexure below in accordance with applicable provisions under Reserve Bank of India (RBI) notification and that the terms set out in this Annexure shall from an integral part of this Loan Agreement (“Agreement”) executed between Borrowers and Ratnaafin Capital Private Limited (“the Company”/ “Ratnaafin Capital Pvt Ltd”/ “Lender”) on 19/9/2024 \n\nPlease note that Clause 1 and 2 of this Annexure may be amended in the Welcome Letter or Disbursement letter and/or by such additional amendments from time to time.\n\n 1. Due Dates of Repayment\n\n The Due Date of Repayment, Frequency of Repayment, Principal and Interest Amount* shall be as per the Schedule II attached hereof.\n\n *The principal and Interest amount indicated under Schedule II attached here to may change depending on the actual disbursement terms and conditions.\n\n 2.  Repayment Due Dates, in case, payment moratorium on principle and/or interest, if any, may be changed depending on the actual disbursement terms and conditions. * \n\n *In case of Interest Moratorium Period, the principal amount will continue to be paid.`, startX, doc.y, { align: "left", width: 500,  align: "justify", });
doc.moveDown(0.5);

function dateTableFunction(tableData) {
  // Set starting position and box width
  const startX = 50;
  let startY = doc.y + 10;
  const boxWidth = 500;

  // Loop through the data to calculate and render each row individually
  tableData.forEach((row, rowIndex) => {
    const rowContent = row.field1 || ""; // Fallback to an empty string if field1 is undefined
    const rowHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowContent, { width: boxWidth - 10 }) + 9; // Add padding

    // Set row color to gray for specific field values, keep border black
    const rowColor = (rowContent === "Interest Moratorium Start Date" || rowContent === "Repayment Start Date")
      ? "#d3d3d3"  // Gray for specific fields
      : (rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff"); // Alternate colors for other rows

    // Draw the background rectangle for the row with gray fill color
    doc
      .lineWidth(0.5)
      .fillColor(rowColor) // Set the fill color to gray for specific fields
      .rect(startX, startY, boxWidth, rowHeight)
      .fill(); // Only fill, no stroke yet

    // Draw the black border for the row
    doc
      .lineWidth(0.5) // Black border color
      .stroke("black") // Black border color
      .rect(startX, startY, boxWidth, rowHeight) // Apply the black border
      .stroke(); // Stroke to outline the rectangle

    // Draw the text inside the row
    doc
      .font(font)
      .font('Helvetica-Bold')
      .fillColor("black")
      .fontSize(7.2)
      .text(rowContent, startX + 5, startY + 5, {
        baseline: "hanging",
        width: boxWidth - 10,
        align: "left",
      });

    // Move to the next row's starting Y position
    startY += rowHeight;
  });
}

const dateTable = [
  { field1: ` Interest Moratorium Start Date` },
  { field1: `${allPerameters.moratoriumStartDate}`},
  { field1:  `Repayment Start Date` },
  { field1:  `${allPerameters.repaymentStartDate}` },

];

dateTableFunction(dateTable);
doc.moveDown(2);
doc
.fontSize(8)
.font('Helvetica')
.text(`3. Consequences of delayed Repayment- Classification as Special Mention Account (SMA) and Non-Performing Asset (NPA):\n\n In addition to the consequences of delayed or defaulted repayments under the Agreement, the Borrower’s account immediately on default shall be classified as Special Mention Accounts (“SMA”) or a Non-Performing Asset (“NPA”) on the following basis in accordance with RBI notifications and regulations:\n\nClassification of Special Mention Accounts and NPAs`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(0.2);

function revolvingFacilitiesFunction(tableData) {
  // Set starting position and box width
  const startX = 50;
  let startY = doc.y + 10;
  const boxWidth = 500;  // Total table width
  const minColWidth = 150; // Minimum width for columns
  const fixedColWidth = 230; // Fixed column width (each column)

  // Loop through the data to calculate and render each row individually
  tableData.forEach((row, rowIndex) => {
    const rowContent = row.field1 || ""; // Fallback to an empty string if field1 is undefined
    const rowValue = row.value || ""; // Value for the second column, fallback to empty string

    // Calculate the text height based on the content for both columns
    const rowContentHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowContent, { width: fixedColWidth - 10 });
    const rowValueHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowValue, { width: fixedColWidth - 10 });

    // Maximum row height (to keep row heights uniform)
    const rowHeight = Math.max(rowContentHeight, rowValueHeight) + 10; // Add padding

    // Set row color (alternating colors)
    const rowColor = (rowIndex === 0) ? "#d3d3d3" : (rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff");

    // Draw the background rectangle for the row with fill color
    doc
      .lineWidth(0.5)
      .fillColor(rowColor)
      .rect(startX, startY, boxWidth, rowHeight)
      .fill();

    // Draw the black border for the row
    doc
      .lineWidth(0.5)
      .stroke("black")
      .rect(startX, startY, boxWidth, rowHeight)
      .stroke();

    // Draw the text for the first column
    doc
      .font(font)
      .font('Helvetica-Bold')
      .fillColor("black")
      .fontSize(7.2)
      .text(rowContent, startX + 5, startY + 5, {
        baseline: "hanging",
        width: fixedColWidth - 10,
        align: "left",
      });

    // If there's a value for the second column, draw it
    if (rowValue) {
      doc
        .font(font)
        .font('Helvetica-Bold')
        .fillColor("black")
        .fontSize(7.2)
        .text(rowValue, startX + fixedColWidth + 5, startY + 5, {
          baseline: "hanging",
          width: fixedColWidth - 10,
          align: "left",
        });
    }

    // Draw the vertical line between the two columns
    doc
      .lineWidth(0.5)
      .stroke("black")
      .moveTo(startX + fixedColWidth, startY)  // Position of the first vertical line
      .lineTo(startX + fixedColWidth, startY + rowHeight) // Extend the line down
      .stroke();

    // Move to the next row's starting Y position
    startY += rowHeight;
  });
}

const revolvingFacilitiesTable = [
  { field1: "Loans other than revolving facilities" },
  { field1: "SMA Sub-categories", value: "Basis for classification – Principal or interest payment or any other amount wholly or partly overdue" },
  { field1: "SMA - 0", value:  ` Upto 30 days` },
  { field1: "SMA – 1", value: ` More than 31 days and upto 60 days` },
  { field1: "SMA – 2", value: ` More than 61 days and upto 90 days` },
  { field1: "NPA", value: ` More than 90 days` },
];

revolvingFacilitiesFunction(revolvingFacilitiesTable);

doc.moveDown(3);
doc
.fontSize(8)
.font('Helvetica')
.text(`The aforesaid categorization will apply only when the time intervals are continuous.\n\n\nFurther, the classifications shall be triggered/flagged by the Lender as part of its day- end processes irrespective of the time of running such processes. Similarly, classification of Borrower accounts as SMA as well as NPA shall be done as part of the day-end process for the relevant date and the SMA or NPA classification date shall be the calendar date for which the day-end process is run. In other words, the date of SMA/NPA shall reflect the asset classification status of an account at the day-end of that calendar date.\n\n\nExample: If the due date of a loan account is March 31,2021, and full dues are not received before the lending institution runs the day-end process for this date, the date of overdue shall be March 31, 2021. If it continues to remain overdue, then this account shall get tagged as SMA-1 upon running the day-end process on April 30, 2021 i.e. upon completion of 30 days of being continuously overdue.Accordingly, the date of SM A-1 classification for that account shall be April 30, 2021.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(0.2);

addFooter();

// // ------------------------------------------- new page ----------------------------------------------------
doc.addPage();
addLogo();
drawBorder();
doc.moveDown(10);
 

doc
.fontSize(8)
.font('Helvetica')
.text(`Similarly, if the account continues to remain overdue, it shall get tagged as SMA- 2 upon running day-end process on May 30, 2021 and if continues to remain overdue further, it shall get classified as NPA upon running day-end process onJune 30,2021.\n\nFurther, loan accounts classified as NPAs may be upgraded as ‘standard’ assets only if entire arrears of interest and principal are paid by the Borrowers.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`Acknowledged & Signed`, startX, doc.y, { align: "left",underline: true, width: 500 });
doc.moveDown(3);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`Annexure – II`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`1. Without prejudice to the right of the RCPL to proceed against the Borrower(s) under the civil law for recovery of the amount due, the Borrower(s) hereby give consent that the RCPL will be entitled to recover the dues under the provisions of the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest Act, 2002 and the Borrower(s) further agree(s) that he/ she/ they will be liable to pay to the RCPL all cost, charges and expenses incurred in that score. The Borrower(s) understand that the RCPL may at its sole discretion avail services of recovery agency/ agents of RCPL’s choice for initiating and continuing the recovery proceedings against the Borrower(s) until the full amounts due to the RCPL are recovered. The Borrower(s) further agree to reimburse to the RCPL, any fees,charges, costs or expenses paid to such recovery agency engaged by the RCPL, in this regard.\n\n\n2. For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com. The other details and the process for the Grievance Redressal Mechanism is available on the website of the Company www.ratnaafin.com`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(2);

addFooter();

// //------------------------------------------------- new page ------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(10);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`DEED OF GUARANTEE`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`This Deed of Guarantee (“Deed” or “Guarantee”) is executed is made at the place and on the date as set out in the Schedule.`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`BY`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`Guarantor(s), whose name(s), address(es) and other details are mentioned in Schedule (hereinafter referred to as the “Guarantor”)`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`The expression “Guarantor” unless it be repugnant to the context or meaning thereof, shall mean and include, if the Guarantor is a: (a) company within the meaning of the Companies Act, 1956 / Companies Act, 2013 or an LLP incorporated under the Limited Liability Partnership Act, 2008, its successors and permitted assigns; (b) a partnership firm for the purposes of the Indian Partnership Act, 1932,the partners for the time being and from time to time and their respective legal heirs, executors and administrators; (c) a sole proprietorship, the sole proprietor and his / her legal heirs, administrators and executors; and (d) an individual, his / her legal heirs,administrators and executors.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`IN FAVOUR OF`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(1);

doc
  .fontSize(8)
  .font('Helvetica-Bold')
  .text('RATNAAFIN CAPITAL PRIVATE LIMITED', startX, doc.y, { align: 'left', width: 500, continued: true, bold: true })
  .fontSize(8) // Resetting font size for the following text
  .font('Helvetica')
  .text(' a company incorporated under the Companies Act, 2013, having its CIN No. U65929GJ2018PTC105279, and having its Registered Office at 201, 202, Shilp Aperia, Near Landmark Hotel, Iscon Ambli Road, Ahmedabad – 380052 (hereinafter called the', { align: 'left', width: 500, continued: true })
  .fontSize(8)
  .text(' which expression shall, unless it be repugnant to the context or meaning thereof, mean and include its executors, successors and assigns)', { align: 'justify', width: 500 })
  .moveDown(2); // Maintain the same line spacing

  doc
 .fontSize(7)
 .font('Helvetica')
 .text(`(The Guarantor and the Lender are hereinafter collectively referred to as the “Parties” and individually as a “Party”).`, startX, doc.y, { align: "left", width: 500 });
  doc.moveDown(1);

  doc
 .fontSize(8)
 .font('Helvetica-Bold')
 .text(`WHEREAS:`, startX, doc.y, { align: "left", width: 500 });
  doc.moveDown(1);

  doc
  .fontSize(8)
  .font('Helvetica')
  .text(`A. Pursuant to the loan agreement executed between the Borrower(s) (more particularly mentioned in Schedule hereunder) and the Lender for the Loan more particularly mentioned in Schedule and/or any amendment(s)/ addendum(s) thereto (“Loan Agreement”) and at the request of the Guarantor, the Lender has agreed to lend and advance / lent and advanced the Loan to the Borrower(s) and the Borrower(s) has/have agreed to borrow / have borrowed the Loan from the Lender on the terms and conditions contained in the Loan Agreement and other Loan Documents\n\n B. One of the conditions of the Lender having agreed to grant/ granted the said Loan to the Borrower(s), was that the Guarantor shall execute, in favor of the Lender, an unconditional and irrevocable continuing guarantee to secure the repayment of the Outstanding Dues and the performance by the Borrower(s) of all other present and future obligations and liabilities in relation to the Loan.\n\n C. The Guarantor, in consideration of the Lender extending the Loan to the Borrower(s) pursuant to the Loan Agreement, have agreed to give this unconditional and irrevocable Guarantee in favour of the Lender as appearing hereinafter`, startX, doc.y, { align: "left",align: "justify", width: 500 });
   doc.moveDown(1);

   doc
   .fontSize(8)
   .font('Helvetica-Bold')
   .text(`IT IS THEREFORE AGREED AS FOLLOWS:`, startX, doc.y, { align: "left", width: 500 });
    doc.moveDown(1);

    doc
    .fontSize(8)
    .font('Helvetica')
    .text(`1. Terms defined in the Loan Agreement shall, unless otherwise defined in this Deed, bear the same meaning when used in this Guarantee. The rules of interpretation contained in the Loan Agreement shall apply to the construction of this Guarantee, unless the context requires otherwise.\n\n 2. For good and valuable consideration being the Lender providing the Loan to the Borrower(s) under the terms of the Loan Agreement, the receipt and sufficiency of which is hereby acknowledged, the We hereby irrevocably and unconditionally:\n\n i. Guarantees to the Lender punctual performance by the Borrower(s) of all the Borrower’s obligations under the Loan Documents including due and punctual repayment by the Borrower(s) of all the Outstanding Dues;\n\n ii. Undertakes that in the event of the Borrower(s) fails to perform any of its obligations under the Loan Documents, the Guarantor(s) shall, on first demand by the Lender (such notice to be conclusive proof of the default) and without any demur, contest or delay, shall pay to the Lender the Guarantee Amount as stipulated in Schedule of this Deed (the “Guarantee Amount”) and in addition thereto shall also pay all interest, penal charges costs, other charges, expenses payable by the Borrower(s) to the Lender under the Loan Documents or any part thereof \n\n iii. undertakes with the Lender that whenever the Borrower(s) do/does not pay any amount when due and/or payable under or in connection with the Loan Documents and/or does not comply with the terms and conditions of the Loan Documents, the Guarantor,without making any delay or demur, shall, within three (3) days of demand by the Lender, pay that amount to the Lender as if it were the principal obligor;\n\n iv. as a primary obligation, indemnifies the Lender immediately on demand against any cost, loss or liability suffered by the Lender if any obligation guaranteed by it is or becomes unenforceable, invalid or illegal. The amount of the cost, loss or liability shall be equal to the amount which the Lender would otherwise have been entitled to recover; and `, startX, doc.y, { align: "left",align: "justify", width: 500 });
     doc.moveDown(1);

addFooter();

// // ---------------------------------------------new page 17------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica')
.text(`v. accepts and acknowledges that the obligations hereunder are joint and several and independent of the obligations of the Borrower(s) and a separate action or actions may be brought against the Guarantor alone or jointly with the Borrower(s) and other guarantors.\n\n 3. The Guarantors herby agrees and acknowledges that this guarantee shall be unconditional and irrevocable and shall extend/ cover/ secure the due observance and performance of the Loan Documents. The Guarantor(s) hereby irrevocably and unconditionally agree that this guarantee shall extend to the ultimate balance of sums payable by the Borrower(s) under the Loan Documents.\n\n 4. This Deed shall be enforceable against the Guarantor(s) notwithstanding that any security created in favour of the Lender shall, at the time when the proceedings are taken against the Guarantor on this Guarantee, be outstanding or unrealized or lost. This Deed is in addition to and without prejudice to any other guarantee or security now or subsequently held by the Lender.\n\n 5. The Lenders shall have the sole discretion to make disbursement(s) and/or interim disbursement(s) to the Borrower from out of the total sanctioned Loan amount, at such time, on such conditions and in such manner as the Lenders may decide.\n\n 6. The Guarantor shall indemnify and keep the Lenders indemnified against all losses, damages, costs, claims and expenses whatsoever which the Lenders may suffer, pay or incur by reason of or in connection with any such default on the part of the Borrower including legal proceedings taken against the Borrower and/or the Guarantor for recovery of the entire Guarantee Amounts referred to in the Schedule of this Deed.\n\n 7. The Guarantors agree and understand that the Guarantors shall not be entitled to delay the payment of the Guarantee Amount for any reason whatsoever or raise any controversy, question or dispute which may arise between the Lender and Borrower(s) as regard to the terms and conditions of the Loan Agreement or the liability and/or payment of the amounts due thereunder.\n\n 
  8. The Guarantor(s) hereby agree that, without the concurrence of the Guarantor(s), the Lender shall be at liberty to vary, alter or modify the terms and conditions of the Loan Agreement and/or the other Loan Documents and in particular to defer, postpone or revise the repayment of the Loan and/or payment of interest and other moneys payable by the Borrower(s) to the Lender on such terms and conditions as may be considered necessary by the Lender including any increase in the rate of interest. The Lender shall also be at liberty to absolutely dispense with or release all or any of the security/ securities furnished or required to be furnished by the Borrower(s) to the Lender to secure the Loan. The Guarantor agrees that the liability under this Deed shall, in no manner be affected by any such variations, alterations, modifications, waiver, dispensation with or release of security, and that no further consent of the Guarantor(s) is required for giving effect to such variation alteration, modification, waiver, dispensation with, or release of security.\n\n 9. The Guarantor expressly waives all their rights including but not limited to any right it may have of first requiring the Lender (or any trustee or agent on its behalf) to proceed against or enforce any other rights or security or claim payment from any person before claiming from the Guarantor under this Deed. This waiver applies irrespective of any law or any provision of a Loan Documents to the contrary.\n\n 10. The rights and remedies of the Lender under this Deed shall be cumulative, in addition to and independent of every other guarantee or security which the Lender may at any time hold for the obligations of the Borrower(s) under the Loan Documents or any rights, powers and remedies provided by law. To give effect to this Guarantee, the Lender may act as though the Guarantor were the principal debtors to the Lender.\n\n 11. This Deed shall remain in full force and effect as a continuing guarantee unless and until such time as all amounts due to the Lender by the Borrower(s) and all amounts
   due hereunder have been completely and duly paid to the Lender to the complete and absolute satisfaction of the Lender and the Lender has in writing discharged the Borrower(s); however, if the obligations of the Guarantor under this Deed cease to be continuing for any reason, the liability of the Guarantor at the date of such cessation shall remain, regardless of any subsequent increase or reduction in the obligations of the Borrower(s) under the Loan Documents. The Guarantors hereby agree and undertake that this guarantee is irrevocable and cannot be revoked by them under any circumstance.\n\n 12. If the Guarantors have or shall hereafter take any security from the Borrower(s) in respect of their liability under this Deed, the Guarantors shall not enforce the same in the bankruptcy or insolvency of the Borrower(s) in respect thereof to the prejudice of the Lender and such security shall stand as a security for the Lender and shall forthwith be deposited with the Lender, in case of liability of the Borrower(s) to the Lender remaining unpaid.\n\n 13. Without prejudice to any other right or remedy to the Lender, so long as any money remains owing hereunder, the Lender shall have a first and paramount lien and the right of set-off on all the Guarantors moneys standing to their credit in any account whatsoever with the Lender and/or any of its group companies and/or subsidiaries and/or affiliates and/or holding company/s etc. or to proceed against and recover from any of Guarantor’s property or security lying with the Lender and/or any of its group companies and/or subsidiaries and/or affiliates and/or holding company/s etc. in relation hereto or any other transaction notwithstanding any restrictive provision thereunder with respect to right of enforcement, any amounts due and payable by the Guarantors to the Lender pursuant hereto. In case of default in payment by the Guarantor, on first demand by the Lender, of the sum due and payable hereunder, the Lender shall be entitled and have the authority, without any further notice to the Guarantors, to adjust and/or appropriate the credit balance in such account or any other monies coming to the hands of the Lender and/or any of its group companies and/or subsidiaries and/or affiliates and/or holding company/s etc. towards liquidation of the sum due and payable by the Guarantors hereunder.
`, startX, doc.y, { align: "left", width: 500 });
 doc.moveDown(1);

addFooter();

// //---------------------------------------------------new page 18---------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica')
.text(`14. The Guarantors further undertake that this Deed shall be binding upon the Guarantors executors, administrators and assigns and shall not be affected by any change in constitution of the Guarantors or the Lenders or the Borrower(s) constitution or by reason of the winding up, merger or amalgamation of the Borrower(s) or the Lender or the Guarantors with any other company, firm, corporation or concern.\n\n 15. The rights of the Lender against each of the Guarantor shall remain in full force and effect notwithstanding any arrangement which may be reached between the Lender and the other guarantor(s), if any, or notwithstanding the release of that other or others from liability and notwithstanding that any time hereafter the other guarantor(s) may cease for any reason whatsoever to be liable to the Lender, the Lender shall be at liberty to require performance by the Guarantor of their obligations hereunder to the same extent in all respects as if the Guarantor had at all times been solely liable to perform the said obligations.\n\n 16. The Lenders shall have full liberty, without notice to the Guarantor and without in any way affecting this Guarantee, to exercise at any time and in any manner any power or powers reserved to the Lenders under the Loan Agreement, to enforce or forbear to enforce payment of the Loan or any part thereof or interest or other moneys due to the Lenders from the Borrower or any of the remedies or securities available to the Lenders, to enter into any composition or compound with or to grant time or any other indulgence or Loan to the Borrower and the Guarantor shall not be released by act of Lenders exercising their liberty in regard to the matters referred to above or by any act or omission on the part of the Lenders or by any other matter or thing whatsoever which under the law relating to sureties would but for this provision have the effect of so releasing the Guarantor. The Guarantor hereby waive in favor of the Lender so far as may be necessary to give effect to any of the provisions of this Guarantee, all the suretyship and other rights which the Guarantor might otherwise be entitled to enforce.\n\n 17. This Deed shall not be wholly  or partially satisfied or exhausted by any payments made to or settled with the Lenders by the Borrower and shall be valid and binding on the Guarantor and operative until repayment in full of   all moneys due to the Lenders under the Loan Agreement.\n\n 
 18. This Deed shall be irrevocable and the obligations of the Guarantor hereunder shall not be conditional on the receipt of any prior notice by the Guarantor or by the Borrower and the demand or notice by the Lenders shall be sufficient notice to or demand on the Guarantor\n\n 19. The Guarantor agrees, at the request of the Lender, to sign, seal, execute and deliver any deed or other documents that may be necessary or required by the Lender, in connection with the Guarantors liability hereunder or the enforcement thereof\n\n 20. The absence or infirmity of borrowing powers on the part of the Borrower(s) or any irregularity in the exercise thereof shall not affect the Guarantor’s liability and any moneys advanced/lent to the Borrower(s) by the Lender shall be deemed to be due and owing notwithstanding such absence, infirmity or irregularity. The liability of the Guarantor, under this Deed, shall not be affected by the absence or deficiency of powers on the part of the Guarantor to give guarantees and/or indemnities or any irregularity in the exercise of such powers.\n\n 21. The Guarantors hereby declare that the entries in the Lender’s books and other records maintained by the Lender shall be conclusive and evidence of the transactions and their correctness and matters therein appearing and any certificate, statement of account or determination signed by an Officer of the Lender stating the sum due from the Borrower(s) or the Guarantors, in the absence of any manifest clerical or arithmetical error, be conclusive and binding on the Guarantors.\n\n 22. Any demand for payment or notice under this Guarantee shall be sufficiently given in writing if sent by registered post, courier, speed post, mail, email to the address provided by the Guarantor in the Schedule of this Deed. Such demand or notice is deemed to be made or given and shall be assumed to have reached the addressee in the course of registered post or any other aforesaid mode, if given by registered post or such other aforesaid mode and no period of limitation shall commence to run in favor of the Guarantor until after demand for payment in writing shall have been made or given as aforesaid. A certificate by any of the responsible officers of the Lenders that to the best of its knowledge and belief, the envelope containing the said notice was so posted shall be conclusive as against the Guarantor, even though it was returned unserved on account of refusal of the Guarantor or otherwise.
 In case of change in address of Guarantor, the Guarantor shall duly intimate the new address to the Lender in writing within seven days of such change.\n\n 23. In the event the Borrower(s) becomes insolvent or the Borrower(s) makes any arrangement or composition with its creditors, the Lender may (notwithstanding any payment made to the Lender by the Guarantor or any other person of the whole or any part of the amount due to the Lender) rank as creditor and prove against the assets of the Borrower(s) for the full amount of Lender’s claims against the Borrower(s) and the Lender may receive and retain the whole of the payments to the exclusion of all the Guarantors rights in competition with Lender until Lender’s claims are fully satisfied. Until all amounts which may be or become payable by the Borrower(s) under or in connection with the Loan Documents have been irrevocably paid in full or unless the Lender otherwise directs, the Guarantor will not exercise any rights which it may have by reason of performance by it of its obligations under the Loan Documents: \n\n i. to be indemnified by, or to receive any collateral from the Borrower(s);\n\n ii. to claim any contribution from any other guarantor of the Borrower(s) obligation under the Loan Documents; and/or \n\n  iii. to take benefit (in whole or in part and whether by way of subrogation or otherwise) of any rights of the Lender under the Loan Documents or of any other guarantee or security taken pursuant to, or in connection with, the Loan Documents by the Lender\n\n 24. The Guarantor hereby severally represents and warrants to the Lender on a continuing basis, and undertakes during the subsistence of this Guarantee that:`, startX, doc.y, { align: "left",align: "justify", width: 500 });
 doc.moveDown(1);

addFooter();

// // ----------------------------------------------------- new page 19 -------------------------------------------------------------------------
   
doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica')
.text(`i. The Guarantor has the competence, necessary power and authority to execute this Guarantee and perform its obligations as Guarantor under this Guarantee;\n\n ii. The execution, delivery and performance of this Guarantee do not and will not conflict with (a) any agreement binding on him or any of its assets; or (b) any applicable laws, rules, regulations or any official or judicial order applicable to him;\n\n iii. This Guarantee will be legal, valid and binding obligations of the Guarantor and enforceable in accordance with the terms hereof;\n\n iv. Neither the Guarantor nor any of its assets enjoy any right of immunity from set-off, suit or execution in respect of its obligations under this Guarantee;\n\n v. There are no actions, suits, proceedings or investigations pending, or to the knowledge of the Guarantor threatened by or against the Guarantor or the properties of the Guarantor before any court of law or government authority or any other competent authority which might have a material effect on the validity, enforceability or performance of this Guarantee by the Guarantor;\n\n vi. Any financial projections provided by the Guarantor have been prepared on the basis of recent information and on the basis of reasonable assumptions; \n\n vii. Nothing has occurred or been omitted from any information provided to the Lender and no information has been given or withheld that results in such information being untrue or misleading in any material respect;\n\n viii. All information supplied by the Guarantor under this Guarantee is true, complete and accurate in all material respects as at the date on which it was given and is not misleading in any respect;\n\n ix. The Guarantor has not defaulted in fulfillment of its obligations towards other lenders;\n\n x. The Guarantor has filed all the tax returns as required by the Applicable Laws to be filed by him and has paid all taxes payable by him;\n\n xi. The Guarantor is not in a breach of any material agreement to which it is a party;\n\n xii. The Guarantor is not in violation of the Prevention of Money Laundering Act, 2002 or any other applicable money laundering laws; and\n\n xiii. The Guarantor has not been declared as a wilful defaulter by the RBI.\n\n 25. The Guarantor hereby agree and hereby authorize the Lender that\n\n i. The Lender shall be entitled to disclose the credit information and other related/ relevant information of the Guarantor to the Reserve Bank of India, credit information
 company (e.g. CIBIL and/or other similar entities) credit rating agencies, statutory/ regulatory/ judicial/quasi-judicial authorities/bodies, statutory auditors and other persons pursuant to/in connection with/ under, inter alia, any law, regulations, guidelines and/or circulars, legal proceedings, audit, credit rating / gradings, the provisions of the Loan Documents and/or in the ordinary course of the Lender’s business; and;\n\n ii. In case the Guarantor commit(s) default in the payment/repayment of the Guarantee Amount (or part thereof) and/or upon occurrence of an Event of Default under the Loan Documents, the Lender, the Reserve Bank of India and/or credit information company will have an unqualified right to disclose or publish the name(s) of the Guarantor and its/their partners or directors as defaulter(s) in such manner and through such medium as the Lender, the Reserve Bank of India and/or the credit information company in their absolute discretion may think fit\n\n 26. The Guarantor and Lender agree that if any dispute/ disagreement/ differences (“Dispute”) arises between the Guarantor and the Lender during the subsistence of the Loan Documents (including this Deed) in connection with any nature whatsoever, then, the Dispute shall be referred to a sole arbitrator who shall be nominated/ appointed by the Lender only. The place of the arbitration shall be Ahmedabad and the arbitration proceedings shall be governed by the Arbitration & Conciliation Act, 1996 (or any statutory re-enactment thereof, for the time being in force) and shall be in the English language.\n\n 27. The validity, interpretation, implementation and resolution of disputes arising out of or in connection with Agreement shall be governed by Applicable law. The Parties agree that all matters arising out of/in relation to Agreement shall be subject to the exclusive jurisdiction of the courts or tribunals (as the case may be) at Ahmedabad, India.`, startX, doc.y, { align: "left",align: "justify", width: 500 });
 doc.moveDown(1);

addFooter();

// //-------------------------------------------------- new page 20--------------------------------------------------------------
doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`SCHEDULE REFERRED HERE IN ABOVE`, startX, doc.y, { align: "center", width: 500 });
 doc.moveDown(0.5);

 function referredTableFunction(tableData) {
  // Set starting position and box width
  const startX = 50;
  let startY = doc.y + 10;
  const boxWidth = 500;  // Total table width
  const fixedColWidth = 230; // Fixed column width for regular rows with two columns

  // Loop through the data to calculate and render each row individually
  tableData.forEach((row) => {
    const rowContent = row.field1 || ""; // Fallback to an empty string if field1 is undefined
    const rowValue = row.value || ""; // Value for the second column, fallback to empty string

    // Calculate text height based on content width; wider for single-column rows
    const contentWidth = rowValue ? fixedColWidth - 10 : boxWidth - 10;
    const rowContentHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowContent, { width: contentWidth });
    const rowValueHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowValue, { width: fixedColWidth - 10 });

    // Set row height to the maximum text height + padding
    const rowHeight = Math.max(rowContentHeight, rowValueHeight) + 10;

    // Draw the black border for the row
    doc
      .lineWidth(0.5)
      .stroke("black")
      .rect(startX, startY, boxWidth, rowHeight)
      .stroke();

    if (rowValue) {
      // Regular row with two columns
      // Draw the first column text (bold)
      doc
        .font(font)
        .font('Helvetica-Bold')
        .fillColor("black")
        .fontSize(7.2)
        .text(rowContent, startX + 5, startY + 5, {
          width: fixedColWidth - 10,
          align: "left",
        });

      // Draw the second column text (non-bold)
      doc
        .font(font)
        .font('Helvetica')
        .fillColor("black")
        .fontSize(7.2)
        .text(rowValue, startX + fixedColWidth + 5, startY + 5, {
          width: fixedColWidth - 10,
          align: "left",
        });

      // Draw vertical line between columns
      doc
        .lineWidth(0.5)
        .stroke("black")
        .moveTo(startX + fixedColWidth, startY)
        .lineTo(startX + fixedColWidth, startY + rowHeight)
        .stroke();
    } else {
      // Single-column centered row
      doc
        .font(font)
        .font('Helvetica-Bold')
        .fillColor("black")
        .fontSize(7.2)
        .text(rowContent, startX, startY + 5, {
          width: boxWidth - 10,
          align: "center",
        });
    }

    // Move Y position for the next row
    startY += rowHeight;
  });
}

const referredTable = [
  { field1: "Date of the Execution", value: ` ${allPerameters.agreementdate}` },
  { field1: "Place of Execution", value:  ` ${allPerameters.placeOfExecution}` },
  { field1: "Details of the Guarantor(s)" },
  { field1: "Name of Guarantor(s)", value:  ` ${allPerameters.guarantorname}` },
  { field1: "Constitution of the Guarantor(s)", value: ` ${allPerameters.constitutionGuarentor}` },
  { field1:  `Address of Guarantor(s) `,value:`${allPerameters.guarantoraddress}` },
  { field1: "PAN of the Guarantor(s)", value:  ` ${allPerameters.guarantorpanTanCin}` },
  { field1: "Email – address(es)", value:  ` ${allPerameters.guarantoremail}` },
  { field1: "Phone No. (s)", value:  ` ${allPerameters.guarantorphoneNo}` },
  { field1: "Details of the Borrower(s)" },
  { field1: "Name of Borrower(s)", value: ` ${allPerameters.borrowerName}` },
  { field1: "Address of Borrower", value:  ` ${allPerameters.borroewraddress}` },
  { field1: "Constitution of the Borrower(s)", value: ` ${allPerameters.constitutionBorrower}` },
  { field1: "PAN/TAN/CIN of the Borrower(s)", value:  ` ${allPerameters.borrowerpanNo}` },
  { field1: "Email – address(es)", value:  ` ${allPerameters.borroweremail}` },
  { field1: "Phone No. (s)", value:  ` ${allPerameters.borrwermobileNo}` },
  { field1: "Attention: Mr./Ms.", value:  ` ${allPerameters.borrowerName}` },
  { field1: "Loan Details" },
  { field1: `Loan Agreement`, value:` ${allPerameters.refferedTable?.loanDetails?.loanAgrrment}` },
  { field1: "Loan Amount", value:  ` ${allPerameters.refferedTable?.loanDetails?.loanAmount}` },
  { field1: "Guarantee Amount", value:  ` ${allPerameters.refferedTable?.loanDetails?.guarantorAmount}` },
];

referredTableFunction(referredTable);
doc.moveDown(2)
doc
  .fontSize(8)
  .font('Helvetica-Bold')
  .text('IN WITNESS WHEREOF', startX, doc.y, { align: 'left', width: 500, continued: true, bold: true })
  .fontSize(8) // Resetting font size for the following text
  .font('Helvetica')
  .text('this Guarantee has been signed and executed by the Guarantors and is intended to be and is hereby delivered by them as a deed on the date specified above', { align: 'left', width: 500, continued: true })
  .fontSize(8)
  .font('Helvetica-Bold')
  .text('\n\n SIGNED AND DELIVERED BY \n\n WITHINNAMED GUARANTOR(S)', { align: 'justify', width: 500 })
  .moveDown(2)
  .fontSize(8)
  .font('Helvetica')
  .text(`${allPerameters.guarantorname}`, { align: 'justify', width: 500 })
  .moveDown(2)

addFooter();

// // -------------------------------------------new page 21 ------------------------------------------------------
doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`END USE LETTER FROM THE RESIDENT INDIAN CUSTOMER`, startX, doc.y, { align: "center",underline: true, width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`${allPerameters.date}`, startX, doc.y, { align: "right", width: 470 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`To,`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`The Manager`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`${allPerameters.companyName}`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`Dear Madam/Sir,`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`Sub: ${allPerameters.subject} \n\n I/We, ${allPerameters.borrowerName} refer to the Application No./Sanction Letter No.${allPerameters.applicatinSacntionNo} Dated:${allPerameters.date} submitted by ${allPerameters.submittedby} to Ratnaafin Capital Pvt Ltd. for availing of a Loan from Ratnaafin Capital Pvt Ltd.)`, startX, doc.y, { align: "left",align: "justify", width: 500 });
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`The said Facility is for the purpose of (tick one)`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Education\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Business\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Agriculture & Allied Activity O Home Repair\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Other personal need. specify:`, startX, doc.y, { align: "left", width: 500 })
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`If the facility is to be used for Business Purpose, then please tick one of a) OR b) the following\n\n a) Investment in Plant & Machinery (only for Manufacturing industry) is:`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Less than or equal to Rs 5 lakh\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Above Rs 5 lakh and up to Rs 25 lakh\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Above Rs 25 lakh and up to Rs 5 Crore`, startX, doc.y, { align: "left", width: 500 })
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`b) Investment in Office Equipment (only for Service industry) is:`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Less than or equal to Rs 2lakh\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Above Rs 2 lakh and up to Rs 10Iakh\n`, startX, doc.y, { align: "left", width: 500 })
.image(unCheckedLogo, { width: 8, height: 8 })
.text(`         Above Rs 10 lakh and up to Rs 5 Crore`, startX, doc.y, { align: "left", width: 500 })
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`I/We hereby represent, warrant and confirm that the aforesaid purpose is a valid purpose and also agree and undertake to utilize the loan only for the above-mentioned purpose and that the loan shall not be used for any illegal and / or antisocial and/or speculative purposes including but not limited to participation in stock markets/IPOs.\n\n I/We hereby represent, warrant and confirm that the aforesaid purpose is a valid purpose and also agree and undertake to utilize the loan only for the above-mentioned purpose and that the loan shall not be used for any illegal and / or antisocial and/or speculative purposes including but not limited to participation in stock markets/IPOs.\n\n I/We are aware that it is on the faith representation, declaration and confirmation that you have agreed to consider my loan application for financial assistance under the category of Priority Advances defined in various circulars/guidelines of Reserve Bank Of India.`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`Thanking you\n\n\n`, startX, doc.y, { align: "left", width: 500 })
.text(`Yours Sincerely\n\n\n`, startX, doc.y, { align: "left", width: 500 })
.text(`APPLICANT NAME : ${allPerameters.borrowerName}\n\n\n`, startX, doc.y, { align: "left", width: 500 })
.text(`CO-APPLICANT NAME : ${allPerameters.coBorrowername}`, startX, doc.y, { align: "left", width: 500 })

doc.moveDown(1);

addFooter();

// //------------------------------------------------------------- new page 22 -----------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`Interest Rate Declaration \n Certificate to be signed by the borrower`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(3);

function rateTableFunction(tableData) {
  // Set starting position and box width
  const startX = 50;
  let startY = doc.y + 10;
  const boxWidth = 500;  // Total table width
  const minColWidth = 150; // Minimum width for columns
  const fixedColWidth = 230; // Fixed column width (each column)

  // Loop through the data to calculate and render each row individually
  tableData.forEach((row, rowIndex) => {
    const rowContent = row.field1 || ""; // Fallback to an empty string if field1 is undefined
    const rowValue = row.value || ""; // Value for the second column, fallback to empty string

    // Calculate the text height based on the content for both columns
    const rowContentHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowContent, { width: fixedColWidth - 10 });
    const rowValueHeight = doc
      .font(font)
      .fontSize(7.2)
      .heightOfString(rowValue, { width: fixedColWidth - 10 });

    // Maximum row height (to keep row heights uniform)
    const rowHeight = Math.max(rowContentHeight, rowValueHeight) + 10; // Add padding

    // Draw the background rectangle for the row with no fill color (no color logic)
    doc
      .lineWidth(0.5)
      .stroke("black")
      .rect(startX, startY, boxWidth, rowHeight)
      .stroke();

    // Draw the text for the first column (bold font)
    doc
      .font(font)
      .font('Helvetica-Bold')
      .fillColor("black")
      .fontSize(7.2)
      .text(rowContent, startX + 5, startY + 5, {
        baseline: "hanging",
        width: fixedColWidth - 10,
        align: "left",
      });

    // If there's a value for the second column, draw it in normal font
    if (rowValue) {
      doc
        .font(font)
        .font('Helvetica')  // Normal font for value
        .fillColor("black")
        .fontSize(7.2)
        .text(rowValue, startX + fixedColWidth + 5, startY + 5, {
          baseline: "hanging",
          width: fixedColWidth - 10,
          align: "left",
        });
    }

    // Draw the vertical line between the two columns
    doc
      .lineWidth(0.5)
      .stroke("black")
      .moveTo(startX + fixedColWidth, startY)  // Position of the first vertical line
      .lineTo(startX + fixedColWidth, startY + rowHeight) // Extend the line down
      .stroke();

    // Move to the next row's starting Y position
    startY += rowHeight;
  });
}

const rateTable = [
  { field1: "Name of the Borrower", value: ` ${allPerameters.borrowerName}` },
  { field1: "Address", value:  ` ${allPerameters.borroewraddress}` },
  { field1: "Constitution", value:  ` ${allPerameters.constitutionBorrower}` },
];

rateTableFunction(rateTable);

function loanTableFunction(tableData) {
  // Set starting position and box width
  const startX = 50;
  let startY = doc.y + 10;
  const boxWidth = 500;  // Total table width
  const minColWidth = 150; // Minimum width for columns
  const numColumns = Math.max(...tableData.map(row => Object.keys(row).length)); // Get the max number of fields in any row
  const colWidth = boxWidth / numColumns; // Column width based on the number of columns

  // Define the fields to be bold in the second row
  const boldFields = ["Facility", "Limits", "Sanction Letter No.", "Sanction Date"];

  // Loop through the data to calculate and render each row individually
  tableData.forEach((row, rowIndex) => {
    let maxHeight = 0;
    const rowContentHeights = [];

    // For the first row, span the entire table width and center the content
    if (rowIndex === 0) {
      const rowContent = row.field1 || ""; // Fallback to empty string if field1 is undefined

      // Calculate the text height based on the content for the full-width row
      const rowContentHeight = doc
        .font(font)
        .fontSize(7.2)
        .heightOfString(rowContent, { width: boxWidth - 10 });

      // Draw the background rectangle for the row
      doc
        .lineWidth(0.5)
        .stroke("black")
        .rect(startX, startY, boxWidth, rowContentHeight + 10)  // Adjusted row height
        .stroke();

      // Draw the text for the first row (spanning full width and centered)
      doc
        .font(font)
        .font('Helvetica-Bold')
        .fillColor("black")
        .fontSize(7.2)
        .text(rowContent, startX + 5, startY + 5, {
          baseline: "hanging",
          width: boxWidth - 10,
          align: "center", // Center the text
        });

      // Move to the next row's starting Y position
      startY += rowContentHeight + 10;  // Adjusted for row height + padding
    } else {
      let maxRowHeight = 0;
      // Calculate the content heights for each column in this row
      Object.keys(row).forEach((field, colIndex) => {
        const fieldValue = row[field] || ""; // Fallback to empty string if undefined
        const fieldHeight = doc
          .font(font)
          .fontSize(7.2)
          .heightOfString(fieldValue, { width: colWidth - 10 });

        rowContentHeights.push(fieldHeight);
        maxRowHeight = Math.max(maxRowHeight, fieldHeight); // Track the max height of this row
      });

      const rowHeight = maxRowHeight + 5; // Add padding

      // Draw the background rectangle for the row
      doc
        .lineWidth(0.5)
        .stroke("black")
        .rect(startX, startY, boxWidth, rowHeight)
        .stroke();

      // Draw each column in the row
      Object.keys(row).forEach((field, colIndex) => {
        const fieldValue = row[field] || ""; // Fallback to empty string if undefined

        // Check if the field needs to be bold
        const isBold = boldFields.includes(field);

        // Draw the text for the current column, apply bold if necessary
        doc
          .font(font)
          .fontSize(7.2)
          .fillColor("black")
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica') // Bold font for specified fields
          .text(fieldValue, startX + colIndex * colWidth + 5, startY + 5, {
            baseline: "hanging",
            width: colWidth - 10,
            align: "left",
          });

        // Draw the vertical line between columns
        if (colIndex < numColumns - 1) {
          doc
            .lineWidth(0.5)
            .stroke("black")
            .moveTo(startX + (colIndex + 1) * colWidth, startY)  // Position of the vertical line
            .lineTo(startX + (colIndex + 1) * colWidth, startY + rowHeight) // Extend the line down
            .stroke();
        }
      });

      // Draw the horizontal line at the bottom of the row
      doc
        .lineWidth(0.5)
        .stroke("black")
        .moveTo(startX, startY + rowHeight)
        .lineTo(startX + boxWidth, startY + rowHeight)
        .stroke();

      // Move to the next row's starting Y position
      startY += rowHeight;
    }
  });

  // Draw the horizontal line at the bottom of the table
  doc
    .lineWidth(0.5)
    .stroke("black")
    .moveTo(startX, startY)
    .lineTo(startX + boxWidth, startY)
    .stroke();
}

const loanTable = [
  { field1: "Details of Agri Micro Loan Against Property" }, // This will span full width and be centered
  { field1: "Facility", field2: "Limits", field3: "Sanction Letter No.", field4: "Sanction Date" }, // Multiple fields
  { field1:  ` ${allPerameters.facility}`, field2: ` ${allPerameters.limits}`, field3: ` ${allPerameters.sanctionLetterNo}`, field4: ` ${allPerameters.sanctionDate} `}, // Multiple fields
];

loanTableFunction(loanTable);
doc.moveDown(3);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`RATE OF INTEREST:`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`Linked to Floating Reference Rate (FRR – 19.20% -6.20%) (Spread) current effective 19% Per Annum\n\n The rate of interest shall be subject to change from time to time including on account of changes in interest rates made by the RBI from time to time.`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`Signature of Borrower(s)`, startX, doc.y, { align: "right", width: 470 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica')
.text(`Place:   ${allPerameters.place}`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica')
.text(` ${allPerameters.date}`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

addFooter();

// //-------------------------------------------- new page 22 --------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`DECLARATION FOR IMMOVABLE PROPERTY \n (for facility backed by mortgage)`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica')
.text(`I/We,  ${allPerameters.borrowerName} adult, occupation Salaried residing at ${allPerameters.borroewraddress}( hereinafter called as ${allPerameters.calledAs})`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`AND`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica')
.text(`I/We, ${allPerameters.coBorrowername} adult,${allPerameters.coBorroweraddress}( hereinafter called as ${allPerameters.calledAs})`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`do hereby declare and say as follows :-`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`1) I/We say that I/We am/are absolutely seized and possessed of or otherwise well and sufficiently entitled to the Immovable property being of (1) ${allPerameters.addressImmovableProperty}, more particularly described in the Schedule hereunder written (hereinafter referred to as the “said Immovable Property\n\n 2) I/We say that I/we have not created any charges or encumbrances in respect of the Immovable Property more particularly described in the Schedule hereunder.\n\n 3) I/We say that the said Immovable Property is proposed to be mortgaged and charged to Ratnaafin Capital Private Limited, indore Branch, to secure by way of First Charge for the due repayment and discharge of the secured Loan of Rs. ${allPerameters.securedLoanRs} granted by RCPL to ${allPerameters.grantedByRcplTo} together with interest, Penal charges , commitment charges and other monies payable to Ratnaafin Capital Private Limited under their loan agreements, letter of sanction and other transaction documents, amended from time to time.\n\n The said Ratnaafin Capital Private Limited, indore Branch, is/are hereinafter referred to as the “Lender”.\n\n 4) I/We say that the said Immovable Property is free from all encumbrances or charges (statutory or otherwise), claims and demands, and that the same or any of them or any part thereof are/is not subject to any Lien/Lispendens, attachment or any other process issued by any Court or Authority and that I/we have not created any Trust in respect thereof and that the said Immovable Property is/are in my/our exclusive, uninterrupted and undisturbed possession and enjoyment since the date of purchase/acquisition thereof and no adverse claims have been made against me in respect of the said Immovable Property or any of them or any part thereof and the same are not affected by any notices of acquisition or requisition, and that no proceedings are pending or initiated against me under the Income Tax Act, 1961, or under any other law in force in India for the time being and that no notice has been received by or served on me under the Income Tax Act,
 1961 and/or under any law and there is no pending attachment whatsoever issued or initiated against the said Immovable Property or any of them or any part thereof. \n\n 5) I/We say that I have duly paid all rents, royalties and all public demands including Income Tax, Corporation/Municipal Tax and all other taxes and revenue payable to the Government of India or to the Government of any State or to any Local Authority and that at present there are no arrears of such dues, rents, royalties, taxes and revenue dues and outstanding and that no attachments or warrants have been served on me of Income Tax, Government Revenues and other taxes.\n\n 6) I/We also agree and undertake to give such declarations, undertakings and other writings as may be required by the Lender or their solicitors and satisfactorily comply with all other requirements and requisitions submitted by or on behalf of the lender.\n\n 7) I/We say that I have obtained the requisite consent from the Income Tax authorities pursuant to the provisions contained in Section 281 of the Income Tax Act, 1961 for the alienation of my property in favour of the Lender.\n\n 8) I/We assure, agree and declare that the security to be created in favour of the Lender shall ensure in respect of my Immovable Property, both present & future and that the documents of title, evidences, deeds and writings in relation to the said Immovable Property are the only documents of title relating to the said Immovable Property.\n\n 9) I/We hereby agree and undertake that MORTGAGOR shall within a period of three months from the date hereof or such extended date as may be permitted by the Lender in writing :-\n\n a) perfectly assure the title to the properties comprised in the mortgage security and to comply with all requisitions, that may be made from time to time by or on behalf of the Lender in that behalf ;\n\n b) give such declarations, undertakings and other writings as may be required by the Lender and satisfactorily comply with all other requirements and requisitions submitted by or on behalf of the Lender;`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

addFooter();

// //------------------------------------------------------------- new page ----------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica')
.text(`c) pay all rents, rates, taxes, cesses, fees, revenues, assessments, duties and other outgoings and pay other amounts due in respect of the said Immovable Property and shall observe and perform all the rules and regulations pertaining to the same will not do or omit to do or suffer to be done anything whereby the mortgaged security as proposed to be created in favour of the Lender be affected or prejudiced in any manner whatsoever.\n\n 10) I/We further undertake that no mortgage, charge, lien or other encumbrance whatsoever will be created on the properties compromised in the mortgaged security save & except with the permission of the Lender.\n\n 11) I/We are not aware of any act, deeds, matter or thing or circumstance which prevents me from charging/further charging in favour of the Lender on the said Immovable Property.\n\n AND I/We make the aforesaid declaration solemnly and sincerely believing the same to be true and knowing full well that on the faith thereof the Lender has agreed to complete the said transaction of mortgage by legal mortgage in respect of the Immovable Property, described in the Schedule hereunder written.`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`-: SCHEDULE ABOVE REFEERED TO :-\n\n (Description of the Immovable Property)`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(1);

doc
.fontSize(7)
.font('Helvetica-Bold')
.text(` ${allPerameters.addressImmovableProperty}`, startX, doc.y, { align: "center", width: 500 });
doc.moveDown(1);
doc
.fontSize(7)
.font('Helvetica-Bold')
.text(`Boundaries of Property`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

const boundariesPropertyData = [
  { field1: "On or towards North", field2: ": ", value:  ` ${allPerameters.OnOrTowardsNorth}` },
  { field1: "On or towards South", field2: ": ", value:  ` ${allPerameters.OnOrTowardsSouth} `},
  { field1: "On or towards East",  field2: ": ", value:  ` ${allPerameters.OnOrTowardsEast}` },
  { field1: "On or towards West",  field2: ": ", value:  ` ${allPerameters.OnOrTowardsWest}` },
];

// Call the function to create the table
BoundariesFunction(boundariesPropertyData);
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text( ` Date:${allPerameters.datethis}`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica-Bold')
.text(`SIGNED & DELIVERED BY THE WITH IN NAMED`, startX, doc.y, { align: "left", width: 500 });
doc.moveDown(0.5);

  
const deliveredpayment = [
  { field1: `BORROWERS NAME :   ${allPerameters.borrowerName}` },
  { field1: `CO-BORROWERS NAME :  ${allPerameters.coBorrowername}` },
  { field1: `GUARANTOR'S NAME : ${allPerameters.guarantorname}` },
];

presentment(deliveredpayment);


addFooter();
// Finalize the PDF
    doc.end();
  
    const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
  
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(pdfFileUrl);
      });
      stream.on("error", reject);
    });
  }
  const rcplLdAndPdDeed = async(req,res) =>{

    const customerId = "66daf42b267db736881e7c4c"
    try{
    console.log(customerId,"in sanction latter")


      // const customerDetails = await customerModel.findOne({_id:customerId}).populate('productId')  
      // const coApplicantDetails = await coApplicantModel.find({customerId})
      // const guarantorDetails = await guarantorModel.findOne({customerId})  
      // const applicantDetails = await applicantModel.findOne({customerId})
      // const technicalDetails = await technicalModel.findOne({customerId})
      // const appPdcDetails = await appPdcModel.findOne({customerId})

      const customerDetails = await customerModel.findOne({ _id: customerId});
    const coApplicantDetails = await coApplicantModel.find({ customerId: new mongoose.Types.ObjectId(customerId) });
    const guarantorDetails = await guarantorModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const applicantDetails = await applicantModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const technicalDetails = await technicalModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const appPdcDetails = await appPdcModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const disbursementDetails = await disbursementModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const finalSanctionDetails = await finalSanctionModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const gtrPdcDetail= await gtrPdcModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });

      console.log(customerDetails,"customerDetails")

      const address = [
        applicantDetails?.permanentAddress?.addressLine1,
        applicantDetails?.permanentAddress?.addressLine2,
        applicantDetails?.permanentAddress?.city,
        applicantDetails?.permanentAddress?.district,
        applicantDetails?.permanentAddress?.state,
        applicantDetails?.permanentAddress?.pinCode
      ].filter(Boolean).join(', ');

     

      const guarantorAddress =
       guarantorDetails?.[0] ? 
       [
        guarantorDetails[0].permanentAddress?.addressLine1,
        guarantorDetails[0].permanentAddress?.addressLine2,
        guarantorDetails[0].permanentAddress?.city,
        guarantorDetails[0].permanentAddress?.district,
        guarantorDetails[0].permanentAddress?.state,
        guarantorDetails[0].permanentAddress?.pinCode
      ].filter(Boolean).join(', ') : "NA";

      const coborroweraddress = coApplicantDetails?.[0] ? [
        coApplicantDetails[0].permanentAddress?.addressLine1,
        coApplicantDetails[0].permanentAddress?.addressLine2,
        coApplicantDetails[0].permanentAddress?.city,
        coApplicantDetails[0].permanentAddress?.district,
        coApplicantDetails[0].permanentAddress?.state,
        coApplicantDetails[0].permanentAddress?.pinCode
      ].filter(Boolean).join(', ') : "NA";

      const allPerameters = {

        // Borrower details
        borrowerName : applicantDetails?.fullName || "NA",//page no.1
        constitutionBorrower:"INDIVIDUAL",
        borrowerpanNo : applicantDetails?.panNo || "NA",
        borroewraddress : address,
        borroweremail : applicantDetails?.email || "NA",
        borrwermobileNo : applicantDetails?.mobileNo || "NA",

        //co borrower details

        coBorrowername: coApplicantDetails?.[0]?.fullName || "NA",
        constitutionCoBorrower:"INDIVIDUAL",
        panTanCin : coApplicantDetails?.docNo || "NA",
      coBorroweraddress: coborroweraddress,
      coBorroeremail: coApplicantDetails?.[0]?.email || "NA",
      coBorrowerphoneNo: coApplicantDetails?.[0]?.mobileNo || "NA",

      //guarantor details
      guarantorname: guarantorDetails?.fullName || "NA",
      constitutionGuarentor:"INDIVIDUAL",
      guarantorpanTanCin: guarantorDetails?.[0]?.docNo || "NA",
      guarantoraddress: guarantorAddress,
      guarantoremail: guarantorDetails?.[0]?.email || "NA",
      guarantorphoneNo: guarantorDetails?.[0]?.mobileNo || "NA",

      // details of Branch || page No 2

      branchplace:"INDORE",
      branchaddress:"Address of the Branch - Office No. 411, 4th floor, orbit mall, Scheme No. 54, A.B.Road, Indore, Madhya Pradesh-452010","email":"pna.ops@ratnaafin.com",
      branchemail:"pna.ops@ratnaafin.com",
      branchphoneNo:"1800 3098 010",
      attentionMrMs:"Branch Manager",

      //details of the Loan
      sanctionLetterNo:"",
      sanctionLetterDate:"",
      facilityType:"",
      specifiedPurpose:'',
      amountOfLoan:"",
      rateOfInterest:'19% Per Annum',
      loginFees:"Rs. 1950/- (Inclusive of Applicable Taxes)",
      loanProcessingFees:'2 % of Loan Amount + Applicable Taxes',
      documentCharges:'2 % of Loan Amount + Applicable Taxes',
      tenureOfLoan:'60 months',

      //disbursement
      sanctionLetterNo:disbursementDetails?.preDisbursementForm?.sanctionLetterNumber||"NA",
      sanctionLetterDate:disbursementDetails?.preDisbursementForm?.dateOfSanction||"NA",

      // page  No : 3

      penalCharges:"-2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan instalments -2 % per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter",
      repaymentMethod:"NACH",
      monthlyInstallmentDate:"10th of the month",
      endDateOfLoanTenure:"As per Repayment Schedule",
      noOfInstallment:"60 months",
      foreClosereOfLoan:`No Foreclosure allowed till completion of 12 months from the date of 1st disbursement.After completion of 12 months from the date of 1st disbursement, Foreclosure from personal funds may be made without incurring any fees.In case of balance transfer, 4% charges will be applicable.`,
      taxes:"Goods and Services tax (GST) will be charged extra as per the applicable rates, on interest, penal charges,other charges and fees (wherever GST is applicable)",
      security:`1. Personal guarantee of PAWAN NAGAR ) \n 2. Corporate guarantee of NA \n 3. Demand Promissory Notes \n 4. Cheques as per UDC Covering Letter. \n 5. First and exclusive charge over the Immovable Property as mentioned in Schedule III.`,
      securityDepositOrDsra:"NIL",
      lockPeriod:`The borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount either in part or in full within 1 year completion of loan tenure from the date of 1st disbursement of the loan.`,

      // charges Details

      processingFees:"2% of Loan Amount + Applicable Taxes",
      documentProcessingCharges:"2% of Loan Amount + Applicable Taxes",
      prepaymentCharges:`No prepayment allowed till completion of 12 months from the date of 1st disbursement. After completion of 12 months from the date of 1st disbursement, prepayment from personal funds may be made without incurring any fees.In case of balance transfer, 4% charges will be applicable.`,
      bounceCharges:"As mentioned in Schedule of Charge ",
      outstationCollectionCharges:"-",
      chequeSwapCharges:"As mentioned in Schedule of Charge ",
      stampDuety:"As per State Stamp Duty ACT",
      duplicateNocCharges:"As mentioned in Schedule of Charge",

      // page 4
      chequebankName:appPdcDetails?.[0]?.fullName || "NA",
      accountTransfertypeOfAccount:appPdcDetails?.[0]?.fullName || "NA",
      rtgsifscCode:appPdcDetails?.[0]?.fullName || "NA",

      //   page 6


      //page No 14
      loanAmounts:finalSanctionDetails?.loanDetails?.loanAmount,
      loanAmountInWord:finalSanctionDetails?.loanDetails?.loanAmountInWords,
      // also page 1
      agreementdate:disbursementDetails?.preDisbursementForm?.dateOfTheAgreement||"",
      placeOfExecution:disbursementDetails?.preDisbursementForm?.placeOfExecution||"",

      // dateOfTheAgreement


        table: [
          {
              appchequeNo1: appPdcDetails?.chequeNo1 ,
              bankDetail1: appPdcDetails?.bankName ,
              accountHolderName1: appPdcDetails?.acHolderName ,
          },
          {
              appchequeNo2: appPdcDetails?.chequeNo2 ,
              bankDetail1: appPdcDetails?.bankName ,
              accountHolderName2: appPdcDetails?.acHolderName ,
          },
          {
              appchequeNo3: appPdcDetails?.chequeNo3 || "",
              bankDetail1: appPdcDetails?.bankName || "",
              accountHolderName3: appPdcDetails?.acHolderName || "",
          },
          {
              appchequeNo4: appPdcDetails?.chequeNo4 || "",
              bankDetail4: appPdcDetails?.bankName || "",
              accountHolderName4: appPdcDetails?.acHolderName || "",
          },
          {
              appchequeNo5: appPdcDetails?.chequeNo5 || "",
              bankDetail5: appPdcDetails?.bankName || "",
              accountHolderName5: appPdcDetails?.acHolderName || "",
          },
          {
              appchequeNo6: appPdcDetails?.chequeNo6 || "",
              bankDetail6: appPdcDetails?.bankName || "",
              accountHolderName6: appPdcDetails?.acHolderName || "",
          },
          {
              appchequeNo7: appPdcDetails?.chequeNo7 || "",
              bankDetail7: appPdcDetails?.bankName || "",
              accountHolderName7: appPdcDetails?.acHolderName || "",
          },
      ],

      //page No 15
      


      tableno2: [
          {
            guchequeNo1: gtrPdcDetail.chequeNo1 ,
            gubankDetail1: gtrPdcDetail?.bankName ,
            guaccountHolderName1: gtrPdcDetail?.acHolderName ,
          },
          {
            guchequeNo2: gtrPdcDetail?.chequeNo2 ,
            gubankDetail2: gtrPdcDetail?.bankName ,
            guaccountHolderName2: gtrPdcDetail?.acHolderName ,
          },
          {
            guchequeNo3: gtrPdcDetail?.chequeNo3 || "NA",
            gubankDetail3: gtrPdcDetail?.bankName || "NA",
            guaccountHolderName3: gtrPdcDetail?.acHolderName || "NA",
          },
          {
            guchequeNo4: gtrPdcDetail?.chequeNo4 || "",
            gubankDetail4: gtrPdcDetail?.bankName || "",
            guaccountHolderName4: gtrPdcDetail?.acHolderName || "",
          },
          {
            guchequeNo5: gtrPdcDetail?.chequeNo5 || "",
            gubankDetail5: gtrPdcDetail?.bankName || "",
            guaccountHolderName5: gtrPdcDetail?.acHolderName || "",
          },
          {
            guchequeNo6: gtrPdcDetail?.chequeNo6 || "",
            gubankDetail6: gtrPdcDetail?.bankName || "",
            guaccountHolderName6: gtrPdcDetail?.acHolderName || "",
          },
          {
            guchequeNo7: gtrPdcDetail?.chequeNo7 || "",
            gubankDetail7: gtrPdcDetail?.bankName || "",
            guaccountHolderName7: gtrPdcDetail?.acHolderName || "",
          }
      ],

      //page no 29
      OnOrTowardsNorth: technicalDetails?.northBoundary|| "",
      OnOrTowardsSouth: technicalDetails?.southBoundary|| "",
      OnOrTowardsEast: technicalDetails?.eastBoundary|| "",
      OnOrTowardsWest: technicalDetails?.westBoundary|| "",




      }

        const pdfPath = await RcplLdAndPgDeedpdf(allPerameters);
        console.log("pdfPath", pdfPath);
        console.log("http://localhost:5500" + pdfPath);
    
        if (!pdfPath) {
         console.log("Error generating the Sanction Letter Pdf")
        }
        console.log(pdfPath,"pdfPath pdfPath")
        return pdfPath
        // success(res, "PDF generated successfully", pdfPath);

      } catch (error) {
        console.log(error);
        // unknownError(res, error);
      }
}
  

// const rcplLdAndPdDeed = async(req,res) =>{
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//           return serverValidation({
//             errorName: "serverValidation",
//             errors: errors.array(),
//           });
//         }
    
    
//         const pdfPath = await RcplLdAndPgDeedpdf(req);
//         console.log("pdfPath", pdfPath);
//         console.log("http://localhost:5500" + pdfPath);
    
//         if (!pdfPath) {
//           return res.status(500).json({
//             errorName: "pdfGenerationError",
//             message: "Error generating the Sanction Letter Pdf",
//           });
//         }
//         success(res, "PDF generated successfully", pdfPath);
//       } catch (error) {
//         console.log(error);
//         unknownError(res, error);
//       }
// }

module.exports = {
    rcplLdAndPdDeed
}

