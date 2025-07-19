const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper.js");

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const numberToWords = require('number-to-words');


const moment = require("moment");
const { validationResult } = require("express-validator");
  const stream = require('stream')
  //   const { uploadToSpaces } = require("../../services/spaces.service.js")
  const uploadToSpaces = require("../../services/spaces.service.js");
  
    const { EventEmitter } = require('events');
  const myEmitter = new EventEmitter(); 
  const mongoose = require('mongoose')


const customerModel = require('../../model/customer.model.js')
const coApplicantModel = require('../../model/co-Applicant.model.js')
const guarantorModel = require('../../model/guarantorDetail.model.js')
const applicantModel = require('../../model/applicant.model.js')
const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel.js')
const appPdcModel = require('../../model/branchPendency/appPdc.model.js')
disbursementModel =require('../../model/fileProcess/disbursement.model.js')
// finalSanctionModel = require('../../model/fileProcess/finalSanction.model.js')
gtrPdcModel = require('../../model/branchPendency/gtrPdc.model.js')
const creditPdModel = require('../../model/credit.Pd.model.js')
const UdhyamModel = require('../../model/udyam.model.js');
const branchUdhyamModel = require('../../model/branchPendency/udhyamKyc.model.js');
const finalsanctionModel =  require('../../model/finalSanction/finalSnction.model.js')
const DISBURSEMENTModel = require('../../model/fileProcess/disbursement.model.js')
const sanctionModel =  require('../../model/finalApproval/sanctionPendency.model.js')
const externalBranchModel = require("../../model/externalManager/externalVendorDynamic.model.js");
const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
const bankDeatilsKycs = require('../../model/branchPendency/bankStatementKyc.model.js');

const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js"); 
const endUseOfLoanModeldata = require('../../model/endUseOfLoan.model.js');






// const { success } = require("../../../../globalHelper/response.globalHelper");


// const pdfLogo = path.join(__dirname, "../../../../../assets/image/FINCOOPERSLOGO.png");
const pdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);

const pdfLogos = path.join( __dirname,"../../../../../assets/image/ratnaLogo.png");


const imagelogo = path.join(__dirname, "../../../../../assets/image/ellipse321.jpeg")
const watermarklogo = path.join(__dirname, "../../../../../assets/image/watermarklogo.png");

function capitalizeFirstLetter(name) {
  return name.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

async function growpdf(allPerameters,skipPages) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));


  function  addLogo() {
    // doc.moveDown(-5)
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });

    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }

  function addWatermark(doc) {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      //   doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { fit: [450, 400], opacity: 0.05 });
      doc.restore();
    }
    //  else {
    //   console.error(`Logo file not found at: ${watermarklogo}`);
    // }
  }

  function addFooter1(doc) {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;

    doc.font(fontBold).fontSize(6.3).fillColor("#324e98").text("Fin Coopers Capital Pvt Ltd", pageWidth, pageHeight - 80, { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", { align: "center", });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("CIN: 67120MP1994PTC008686", { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Phone: +91 7374911911 | Email: info@fincoopers.com", { align: "center",link: "tel:7374911911",link: "mailto:info@fincoopers.com", // Make it clickable
  });

    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor("#324e98").lineWidth(1).stroke();
  }
  
  
 // ../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png
  // const pdfLogos = path.join( __dirname,"../../../../../assets/image/ratnaLogo.png");
  
  // function addFooter(doc) {
  //   // PDF dimensions
  //   const pageWidth = doc.page.width; 
  //   const pageHeight = doc.page.height; 
  
  //   // Add logo at the bottom-right corner
  //   if (fs.existsSync(pdfLogos)) {
  //     const logoWidth = 40; 
  //     const logoHeight = 25; 
  
  //     doc.image(pdfLogos, pageWidth - logoWidth - 10, pageHeight - logoHeight - 10, {
  //       fit: [logoWidth, logoHeight],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${pdfLogos}`);
  //   }
  // }
  
  

  // const pdfFilename = `NEWApplicantConditions.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);
  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

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

  // doc.pipe(stream);

  //   drawBorder(doc);
  addLogo(doc);
  doc.moveDown(4);
  doc.fontSize(9).font(fontBold).fillColor('#00BFFF').text("LOAN APPLICATION FORM",{ align: "center" });


  doc.moveDown(1);
  doc.fontSize(8).font(fontBold).fillColor('#000000.').text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All fields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                                  ${allPerameters.date}`, { align: "left" ,continued:true});
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "right" });
  // I have to move down here
  doc.moveDown(1);


  // for sectionA//

  function drawTable(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;
  
    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowHeight = 20; // Default row height
  
    // Set fixed column widths
    const columnWidths = [150, 350, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#0066B1"; // Light blue background color#00BFFF. 0066B1
  
    // Draw the special row with background color
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .fill(specialRowColor)
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();
  
    // Add black border around the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .strokeColor("#000000") // Black border
      .lineWidth(1)
      .stroke();
  
    // Add text inside the special row
    doc.font(fontBold)
      .fontSize(10)
      .fillColor("white")
      .text(specialRowText, startX + 5, startY + 8);
  
    // Move the Y position down after the special row
    startY += specialRowHeight;
  
    // Draw the actual table rows
    data.forEach((row) => {
      const minRowHeight = 20;
      const extraHeightPerLine = 3;  // Additional height for each line of overflow
  
      // Calculate the height needed for the cell content
      const keyTextHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, fontSize: 8 });
      const valueTextHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, fontSize: 8 });
  
      // Determine the number of lines based on text height and base line height (e.g., 10 per line)
      const keyLines = Math.ceil(keyTextHeight / 10);
      const valueLines = Math.ceil(valueTextHeight / 10);
  
      // Calculate extra height if content requires more lines than default row height
      const extraHeight = (Math.max(keyLines, valueLines) - 1) * extraHeightPerLine;
  
      // Use the maximum height needed for either cell content or the minimum row height plus extra height
      const cellHeight = Math.max(keyTextHeight, valueTextHeight, minRowHeight) + extraHeight;
  
      // Draw key cell border
      doc.rect(startX, startY, columnWidths[0], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Draw value cell border
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000")
        .text(row.key, startX + 5, startY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
  
      // Check if this row should display a checkbox with or without a checkmark
      if (row.key === "Same as Communication address") {
        const checkboxX = startX + columnWidths[0] + 10;
        const checkboxY = startY + 5;
  
        // Draw checkbox border
        doc.rect(checkboxX, checkboxY, 10, 10).stroke();
  
        // Draw checkmark if the value is "YES"
        if (row.value === "YES") {
          doc.moveTo(checkboxX + 2, checkboxY + 5)
            .lineTo(checkboxX + 5, checkboxY + 8)
            .lineTo(checkboxX + 8, checkboxY + 2)
            .strokeColor("black")
            .stroke();
        }
      } else {
        // Add text to the value cell (wrapped if necessary)
        doc.text(row.value, startX + columnWidths[0] + 15, startY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
  
      // Move startY down by the height of the current cell for the next row
      startY += cellHeight;
    });
  }
  



  function drawComplexTable(headers, data, sectionA, sectionB, footerNote, fontSize = 7, borderWidth = 0.5) {
    doc.moveDown(2);

    // Title with customizable font size
    doc.font(fontBold)
        .fontSize(10)
        .text("1. MOST IMPORTANT INFORMATION", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(8)
        .text("Attention: PLEASE READ CAREFULLY BEFORE SIGNING ACKNOWLEDGEMENT FORM", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(fontSize)
        .text(`I/We refer to application Sr. No dated submitted by me/us to Fin Coopers Capital Pvt Ltd.. I/We have been provided the
following information and have accordingly filled up the aforesaid form.`);
    doc.moveDown(0.5);

    // Helper function to draw rows with customizable font size and border width
    const drawTableRow = (doc, x, y, row, colWidths, height, fontSize, borderWidth, borderColor = 'black') => {
        let currentX = x;

        if (row[0] === "Pre-EMI (Rs.)" || row[0] === "EMI (Rs.)" || row[0] === "Type of transaction") {
            const labelWidth = colWidths[0];
            const valueWidth = colWidths.reduce((sum, width) => sum + width, 0) - labelWidth;

            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, labelWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[0], currentX + 5, y + 5, { width: labelWidth - 10, align: "center" });

            currentX += labelWidth;
            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, valueWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[1], currentX + 5, y + 5, { width: valueWidth - 10, align: "center", lineBreak: true });
        } else {
            row.forEach((text, i) => {
                const cellWidth = colWidths[i];
                doc
                    .lineWidth(borderWidth)
                    .strokeColor(borderColor)
                    .rect(currentX, y, cellWidth, height)
                    .stroke()
                    .fontSize(fontSize) // Set font size dynamically
                    .text(text, currentX + 5, y + 5, { width: cellWidth - 10, align: "center", lineBreak: true });
                currentX += cellWidth;
            });
        }
    };

    // Set up table coordinates
    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [120, 120, 120, 120]; // Fixed column widths

    // Dynamically adjust row height based on data length
    const dataLength = data.length;
    // //console.log(dataLength);
    const rowHeight = dataLength >9 ? 35 : 23; // If more than 7 rows, increase height

    // Draw the header
    drawTableRow(doc, tableX, tableY, headers, colWidths, rowHeight, fontSize, borderWidth, 'black');
    
    // Draw data rows
    let currentY = tableY + rowHeight;
    data.forEach((row) => {
      drawTableRow(doc, tableX, currentY, row, colWidths, rowHeight, fontSize, borderWidth, 'black');
      currentY += rowHeight;
    });

    // Section A
    const sectionAStartY = currentY; // Directly connect to the data rows
    const sectionWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const sectionX = tableX;

    doc.rect(sectionX, sectionAStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("  A. Loan Processing Fee", sectionX + 2, sectionAStartY + 10, { align: "center" });
    currentY = sectionAStartY + 30; // Update currentY after section header

    sectionA.forEach((row) => {
        drawTableRow(doc, sectionX, currentY, row, colWidths, rowHeight, fontSize, borderWidth);
        currentY += rowHeight;
    });

    // Section B - Increase row height for Section B data only
    const sectionBStartY = currentY; // Directly connect to Section A
    doc.rect(sectionX, sectionBStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("B. Part Prepayment / Foreclosure Charges", sectionX + 5, sectionBStartY + 10, { align: "center" });
    currentY = sectionBStartY + 30; // Update currentY after section header

    sectionB.forEach((row, index) => {
        // Increase row height specifically for Section B rows
        const sectionBRowHeight = 50; // Increase the height for Section B rows
        drawTableRow(doc, sectionX, currentY, row, colWidths, sectionBRowHeight, fontSize, borderWidth);
        currentY += sectionBRowHeight; // Update Y for next row
    });

    // Footer Note (connect directly after Section B)
    const footerStartY = currentY; // No extra space before footer
    const footerHeight = 38;
    doc.rect(sectionX, footerStartY, sectionWidth, footerHeight).stroke();
    doc.fontSize(8)
        .font(fontBold)
        .text(footerNote, sectionX + 5, footerStartY + 10, { width: sectionWidth - 10, align: "left" });
}

 /// make a function Singnature //
  function createSignatureTablePDF(data, marginX = 40, marginY = 100) {
    // Table settings with customizable margins
    const startX = 40; // X position based on left margin
    const startY = doc.y; // Y position based on top margin
    const cellWidth = 130; // Width of each cell
    const minCellHeight = 15; // Minimum cell height
  
    // Set table color and line thickness
    doc.strokeColor('black').lineWidth(0.5); // Set line color to black and line thickness to 1.2
  
    // Draw header row (blank cells)
    for (let i = 0; i < 4; i++) {
      const x = startX + i * cellWidth;
      doc.rect(x, startY, cellWidth, minCellHeight).stroke(); // Draws a blank cell
    }
  
    // Draw content row and add data below the header row
    data.forEach((text, index) => {
      const x = startX + index * cellWidth;
      const textHeight = doc.fontSize(6).heightOfString(text, { width: cellWidth - 10 });
      const cellHeight = Math.max(textHeight + 20, minCellHeight); // Set cell height based on text height, with padding
  
      const y = startY + minCellHeight; // Move down by one cell height for content row
  
      // Draw the cell border
      doc.rect(x, y, cellWidth, cellHeight).stroke();
  
      // Add text to the cell, with padding
      doc.font('Helvetica-Bold').fontSize(6)
      .text(text, x + 5, y + 10, { width: cellWidth - 10, align: 'center' });
    });
  }

  function createDocumentsRequiredTable(data) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 55; // Defined margin from the border
    const padding = 5; // Padding inside cells
    const minColumnWidth = 200; // Minimum width for the columns

    // Calculate available width for the table based on the margins
    const availableWidth = pageWidth - 2 * margin;

    // Set column widths as 40% for the left column and 60% for the right column
    let cellWidth1 = Math.max(availableWidth * 0.4, minColumnWidth); // 40% for document name
    let cellWidth2 = Math.max(availableWidth * 0.6, minColumnWidth); // 60% for document details

    // const startX = margin + 10; // Start X position inside the margin
    // const startY = margin + 40; // Start Y position inside the margin, accounting for some space for the header

    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position

    // Set table color and line thickness
    doc.strokeColor('#20211A').lineWidth(0.2);

    // Draw the header row (DOCUMENTS REQUIRED)
    doc.rect(startX, startY, cellWidth1 + cellWidth2, 20).stroke(); // Use a fixed height for the header
    doc.fontSize(12).text('DOCUMENTS REQUIRED', startX + padding, startY + padding, { align: 'center' });

    let currentY = startY + 20; // Set the Y position after the header

    // Loop through the data and create table rows
    data.forEach(item => {
        // Calculate the height of each column's content
        const docNameHeight = doc.heightOfString(item.documentName);
        const docDetailsHeight = doc.heightOfString(item.documentDetails);

        // Choose the maximum height between the two columns
        const rowHeight = Math.max(docNameHeight, docDetailsHeight) + 2 * padding; // Adding padding for spacing

        // Draw the border around the row
        doc.rect(startX, currentY, cellWidth1 + cellWidth2, rowHeight).stroke();

        // Draw a border between the two columns
        doc.moveTo(startX + cellWidth1, currentY).lineTo(startX + cellWidth1, currentY + rowHeight).stroke();

        // Draw the document name in the left column
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text(item.documentName, startX + padding, currentY + padding, { align: 'left', width: cellWidth1 - 2 * padding, lineBreak: true });

        // Draw the document details in the right column
        doc.fontSize(8)
           .font('Helvetica')
           .text(item.documentDetails, startX + cellWidth1 + padding, currentY + padding, { align: 'left', width: cellWidth2 - 2 * padding, lineBreak: true });

        // Move to the next row based on the calculated row height
        currentY += rowHeight;
    });

    // Draw a footer row for the "Note" section (connected with the previous row)
    const noteHeight = doc.heightOfString('Note: Documents relating to beneficial owners, office bearers...') + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text('Note: Documents relating to beneficial owners, office bearers...', startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const rowHeight = 20; // Default row height
    const columnWidths = [200, 200]; // Key and Value columns
    const imageWidth = 100; // Width for the image cell
    const totalWidth = columnWidths[0] + columnWidths[1] + imageWidth;

  // Draw the special row at the top of the table (Loan Details)
  const specialRowHeight = 20; // Height of the special row
  const specialRowText = `${sectionTitle}`; // Text for the special row
  const specialRowColor = "#00BFFF"; // Light blue background color

  // Draw the special row with background color
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .fill(specialRowColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();

  // Add black border around the special row
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .strokeColor("#000000") // Black border
    .lineWidth(1)
    .stroke();

  // Add text inside the special row
  doc.font(fontBold)
    .fontSize(10)
    .fillColor("black")
    .text(specialRowText, startX + 5, startY + 8);


    // Adjust `startY` to begin the table rows after the header row
    startY += rowHeight;

    // Calculate rows for image spanning
    const imageSpanRows = 5; // Number of rows the image spans
    const imageHeight = imageSpanRows * rowHeight; // Total height for the image cell

    // Draw table rows
    data.forEach((row, index) => {
      const rowY = startY + index * rowHeight; // Calculate row position
      if (index < imageSpanRows) {
        // Rows with the image column
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke()

        doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
          .strokeColor("black")

          .lineWidth(1)
          .stroke();

        // Add text for Key and Value columns
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: columnWidths[1] - 10,
          });

        // Draw the image column in the first row of the image span
        if (index === 0) {
          doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();

          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
              fit: [imageWidth - 10, imageHeight - 10], // Adjust image size with padding
            });
          } else {
            doc.font(fontBold)
              .fontSize(10)
              .fillColor("#ff0000") // Red text
              .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
          }
        }
      } else {
        // Rows after the image span, merge `Value` and `Image` columns
        const fullValueWidth = columnWidths[1] + imageWidth;

        // Draw Key cell
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Draw merged Value cell
        doc.rect(startX + columnWidths[0], rowY, fullValueWidth, rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Add Key and Value text
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: fullValueWidth - 10,
          });
      }
    });
  }

  function drawNewPage(data) {
    let datavalue = Array.isArray(data) ? data : [data];
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    // // Draw the section title with a colored background (same as original)
    // doc.rect(titleX, doc.y, titleWidth, titleHeight)
    //   .fill("#00BFFF")  // Color for the section title (same as before)
    //   .strokeColor("#20211A") // Black border for the title
    //   .lineWidth(1)
    //   .stroke();

    // doc.font(fontBold)
    //   .fontSize(11)
    //   .fillColor("#20211A")
    //   .text(sectionTitle, titleX + 3, doc.y + 6);



    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position
    const rowHeight = 20; // Height of each row
    const columnWidths = [250, 300, 70]; // Column widths

    // Draw table rows
    datavalue.forEach((row, index) => {
      const rowY = startY + index * rowHeight;


      // Draw background fill for the row (without covering borders)
      doc.rect(startX, rowY, columnWidths[0] + columnWidths[0], rowHeight)
      // .fillColor(fillColor)
      // .fill();

      // Draw key cell border
      doc.rect(startX, rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Draw value cell border
      doc.rect(startX + columnWidths[0], rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000") // No background fill, just the text color
        .text(row.key, startX + 5, rowY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
      // Check if this row should display a checkbox
      if (row.key === "Same as Communication address") {
        if (row.value === "YES") {
          // Draw a checked checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke(); // Draw checkbox border
          doc.moveTo(startX + columnWidths[0] + 12, rowY + 10)
            .lineTo(startX + columnWidths[0] + 15, rowY + 13)
            .lineTo(startX + columnWidths[0] + 20, rowY + 7)
            .stroke(); // Draw checkmark
        } else {
          // Draw an empty checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
        }
      } else {
        // Add text to the value cell
        doc.text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
    });


    // Move down after drawing the table
    doc.moveDown(data.length * 0.1 + 1);
  }


  // First Page //
  // Generate the PDF content
  //   //   // addLogo(doc);(doc);(doc);
  addWatermark(doc);
  // drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value:`${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    { key: "Loan Purpose", value:`${allPerameters.loanPurpose}`},
    { key: "Loan Type", value:`${allPerameters.loanType}` },
  ];
  drawTable("Loan Details", loanDetails);
  doc.moveDown()

  // function createStyledTable(doc, headers, tableData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidths = [150, 100, 150, 100]; // Column widths
  //   const rowHeight = 20; // Fixed row height
  //   const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
  //   // Draw headers
  //   doc
  //     .fillColor('#00BFFF') // Blue header background
  //     .rect(startX, startY, tableWidth, rowHeight) // Header rectangle
  //     .fill()
  //     .fillColor('black') // White text for headers
  //     .font('Helvetica-Bold')
  //     .fontSize(8);
  
  //   headers.forEach((header, colIndex) => {
  //     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  //     doc.text(header, cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //   });
  
  //   // Move to the next row (data rows)
  //   startY += rowHeight;
  
  //   tableData.forEach((row, rowIndex) => {
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, tableWidth, rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border
  //   doc
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, doc.y + 10, tableWidth, startY - doc.y - 10)
  //     .stroke();
  // }
  
  // Example usage
  function createStyledTable(doc, headers, tableData, isHeaderBoxed = false) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidths = [150, 100, 150, 100]; // Column widths
    const rowHeight = 20; // Fixed row height
    const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
    // Draw header as a full box with proper borders
    if (isHeaderBoxed) {
      // Draw a black-bordered rectangle for the header
      doc
        .lineWidth(1) // Black border thickness
        .strokeColor('black') // Black border color
        .fillColor('#0066B1') // Blue background for the header
        .rect(startX, startY, tableWidth, rowHeight) // Rectangle enclosing header
        .fillAndStroke(); // Fill the background and stroke the border
  
      // Draw the header text inside the box
      doc
        .fillColor('white') // Black text color
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(headers[0], startX + 5, startY + 5, {
          width: tableWidth - 10, // Center text within the header box
          align: 'left',
        });
  
      startY += rowHeight; // Move to the next row
    }
  
    // Draw table rows
    tableData.forEach((row, rowIndex) => {
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, tableWidth, rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  
    // Draw the outer border for the entire table
    // doc
    //   .lineWidth(0.5)
    //   .strokeColor('black')
    //   .rect(startX, doc.y + 10, tableWidth, startY - (doc.y + 10))
    //   .stroke();
  }
  const headers1 = ['Product Details'];
  const tableData1 = [
    { col1: 'Business Loan', col2: 'NA', col3: 'Personal Loan', col4: 'NA' },
    { col1: 'Working Capital Term Loan/Business Loan Secured', col2: 'NA', col3: 'Home Loan', col4: 'NA' },
    { col1: 'Loan Against Property/Shed Purchase', col2: 'MICRO LAP', col3: 'Others', col4: 'NA' },
  ];
  
  const headers2 = ['Product Program Details'];
  const tableData2 = [
    { col1: 'Industry Type', col2: 'NA', col3: 'Sub Industry Type', col4: 'NA' },
    { col1: 'Product Type', col2: 'MICRO LAP', col3: 'Secured/Unsecured', col4: 'SECURED' },
    { col1: 'Property Value', col2: 'NA', col3: 'BT EMI Value', col4: 'NA' },
    { col1: 'Program', col2: 'NA', col3: '', col4: '' },
  ];
  
  // Draw tables
  createStyledTable(doc, headers1, tableData1,true);
  doc.moveDown()

  createStyledTable(doc, headers2, tableData2,true);
  
  // Sourcing Details Section

//   const sourcingDetails = [{
//     key:`Sourcing Type`,
//     value: `${allPerameters.sourceType}` || "NA",

//   }, {
//     key: "Gen Partner Name",
//     value: allPerameters.genPartnerName || "NA",
//   }, {
//     key: "Sourcing Agent Name : ",
//     value: allPerameters.sourcingAgentName || "NA",
//   }, {
//     key: "Sourcing Agent Code : ",
//     value: allPerameters.sourcingAgentCode || "NA",
//   }, {
//     key: "Sourcing Agent Location : ",
//     value: allPerameters.sourcingAgentLocation || "NA",
//   }, {
//     key: "Sourcing RM Name : ",
//     value: allPerameters.sourcingRMName || "NA",
//   }, {
//     key: "Sourcing RM Code : ",
//     value: allPerameters.sourcingRMCode || "NA",
//   }]

//   drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
//   const productProgramDetails = [
//     { key: "Industry Type", value: "FIN COOPERS" },
//     { key: "Sub Industry Type", value: "FIN COOPERS" },
//     { key: "Product Type", value: "SECURED" },
//     { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
//     { key: "Secured/Un-Secured", value: "SECURED" },
//     { key: "Property Value", value: "Rs. 500000" },
//     { key: "BT EMI Value", value: "NA" },
//   ];
//   drawTable("Product Program Details", productProgramDetails);
//  addFooter(doc);
    //   // addLogo(doc);(doc);(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  // doc.moveDown(2)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });



 
  





//original working code

function drawTableneww(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}





  
 
const applicantDetailsData = [
  // First 5 rows - 2 columns with key-value pairs Applicant Mother's Name
  { key: "Applicant Type", value: `${allPerameters.appType}` },
  { key: "Business Type", value: `${allPerameters.buisnessType}` },
  { key: "Applicant Name", value: `${allPerameters.borrowerName}`},
  { key: "Applicant Father's/Spouse Name", value: `${allPerameters.appFather}` },
  { key: "Applicant Mother's Name.", value: `${allPerameters.appMother}` },

  { key1: "Mobile No.", value1: `${allPerameters.appMob1}`, key2: "Mobile No2.", value2: `${allPerameters.appMob2}` },

  // Row 6 - 4 columns
  { key1: "Email ID", value1: `${allPerameters.appEmail}` },

  // Row 7 - 2 columns with key-value pair
  { key1: "Educational Details", value1:`${allPerameters.appEdu}`, key2: "Religion", value2: `${allPerameters.appReligion}`},

  // Row 8 - 4 columns
  { key1: "Date Of Birth/Incorporation", value1:`${allPerameters.appDOB}`, key2: "Nationality", value2: `${allPerameters.appNationality}` },

  // Remaining rows - 4 columns layout
  { key1: "Gender", value1: `${allPerameters.appGender}`, key2: "Category", value2: `${allPerameters.appCategory}` },
  { key1: "Marital Status", value1: `${allPerameters.appMaritalStatus}`, key2: "No. of Dependents", value2: `${allPerameters.appNoOfDependentd}`},
  { key1: "Pan Number", value1: `${allPerameters.appPan}`, key2: "Voter Id Number ", value2: `${allPerameters.AppVoterId}` },
  { key1: "Aadhar Number", value1: `${allPerameters.appAdhar}`, key2: "Udyam Number", value2: `${allPerameters.appUshyamAdharNumber}`},
  // { key1: "Aadhar Number", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];




// //console.log("Applicant Details Data:", applicantDetailsData);
// const imagePath = "./uploads/applicant_photo.jpg";

const saveImageLocally = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "applicant_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};

// (async () => {
  const imagePath = await saveImageLocally(`${allPerameters.appImage}`);
// const imagePath = path.join(__dirname, `../../../../..${allPerameters.appImage}`);


const sectionTitle = "Applicant Details";
drawTablenew(sectionTitle, applicantDetailsData, imagePath);


  // drawTablenew(doc, applicantDetails,"Guarantor Details", imagelogo);
  // drawTablenew(doc, applicantDetails, imagelogo,"Applicant Details");

  doc.moveDown()

  
//   drawTablenew(doc, "Co-Applicant Details", applicantDetails, imagelogo);
function createStyledTable1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}



  const title = [" Present/Communication Address"]; // For the first row
const tableData = [
  { col1: "Address as per Aadhar ", col2: `${allPerameters.loacalAdharAdress}` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.localCity}` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.localDistrict}`, col3: "State", col4: `${allPerameters.loacalState}` },
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code ", col4: `${allPerameters.localPin}` },
  { col1: "Present Address is ", col2: `${allPerameters.appResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.AppYearsAtCureentAdress}` },

];
createStyledTable1(doc, title, tableData);
doc.moveDown(3)


  
  function createCustomTableWithCheckbox(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }

  const title1 = "Permanent Address"; // Table header
const tableDatacheck = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.appadharadress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.appCityName}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.appdistrict}`, col3: "State", col4: `${allPerameters.AppState}`}, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code", col4:`${allPerameters.AppPin}`}, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.appResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckbox(doc, title1, tableDatacheck);
  // drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
//  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)




function createStyledTableocc2(doc, titlet, tableDatat) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlet, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatat.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlet = ["Employement/Business Details"]; // For the first row
const tableDatat = [
  { col1: "Occupation ", col2: `${allPerameters.occupation}  `, col3: "Monthly Income", col4: `${allPerameters.monthlyIncome}  ` }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: `${allPerameters.isSelfEmployed}  `, col3: "Other Income", col4: `${allPerameters.otherIncome}  ` },
  { col1: "Firm Name M/S ", col2: `${allPerameters.firstName}  ` }, // First row (2 columns)
  { col1: "Type of Firm", col2: `${allPerameters.firmType}  `, col3: "Nature of Business ", col4: `${allPerameters.natureBuisness}` },
  { col1: "MSME Classification ", col2: `${allPerameters.msmeClassification}  `, col3: "UDYAM Registration No./Udyog Adhar", col4: `${allPerameters.appudhyam}  ` },

];

createStyledTableocc2(doc, titlet, tableDatat);

function createStyledTablereg(doc, titlereg, tableDatareg) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg = ["Registered Address of the Entity"]; // For the first row
const tableDatareg = [
  { col1: "Address ", col2: `${allPerameters.entityAdress}  ` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.entityLandmark}  `, col3: "Name of City/Town/Village", col4: `${allPerameters.entityCityTown}  ` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.entityDistrict}  `, col3: "State", col4: `${allPerameters.entityState}  ` },
  { col1: "Country", col2: `${allPerameters.entityCountry}  `, col3: "PIN Code ", col4: `${allPerameters.entitypin}  ` },
  { col1: "Mobile No.", col2: `${allPerameters.entityMobile}  `, col3: "Email Id", col4: `${allPerameters.entityemail}  ` },

];
createStyledTablereg(doc, titlereg, tableDatareg);

function createStyledTableop(doc, titleop, tableDataop) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop = ["Operating Address of the Entity"]; // For the first row
const tableDataop = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop(doc, titleop, tableDataop);

  

  // drawNewPage(ParmentAddress2);
  // drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
//  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
    //   // addLogo(doc);(doc);(doc);
  // drawBorder()
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("SECTION 2:Co-Applicant Details", { underline: true });

//   function drawTablenew1(sectionTitle1, data, imagePath1) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle1, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath1)) {
//                     doc.image(imagePath1, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew11(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew1(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}


  const coapplicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType}` },
    { key: "Business Type", value: `${allPerameters.coAppbuiType}` },
    { key: "Co-Applicant Name", value: `${allPerameters.coAppName}` },
    { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather}` },
    { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother}` },
    { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob1}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.coAppEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.coAppEdu}`, key2: "Religion", value2: `${allPerameters.coAppreligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob}`, key2: "Nationality", value2: `${allPerameters.coAppNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1:  `${allPerameters.coAppGender}`, key2: "Category", value2:  `${allPerameters.coAppCategory}` },
    { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd}`},
    { key1: "Pan Number", value1:  `${allPerameters.coAppPan}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId}` },
    { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  const saveImageLocally1 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant1_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  
  const sectionTitle1 = "Co-Applicant Details";
  drawTablenew1(sectionTitle1, coapplicantDetailsData, imagePath1);
  doc.moveDown()


//   function createStyledTablep(doc, titlep, tableDatap) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
//   const rowHeight = 20; // Fixed row height

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlep, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += rowHeight;

//   // Process table rows
//   tableDatap.forEach((row, rowIndex) => {
//     // Conditional column widths: first row has 2 columns, others have 4 columns
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });

//   // Draw the outer table border (around the entire table, excluding individual cell borders)
//   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
//   //   .stroke();
// }
function createStyledTablep(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

  const titlep = [" Present/Communication Address"]; // For the first row
const tableDatap = [
  { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2:  `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2:  `${allPerameters.coAppdistrict}`, col3: "State", col4:  `${allPerameters.coAppState}` },
    { col1: "Country", col2:  `${allPerameters.coAppCountry}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN}` },
    { col1: "Present Address is ", col2:  `${allPerameters.coResidence}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress}` },
  
  ];
createStyledTablep(doc, titlep, tableDatap);
doc.moveDown(3)

// function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//   const rowHeight = 20; // Fixed row height

//   const drawCheckbox = (doc, x, y, size, isChecked) => {
//     doc
//       .rect(x, y, size, size) // Draw checkbox square
//       .stroke();
//     if (isChecked) {
//       doc
//         .moveTo(x, y + size / 2)
//         .lineTo(x + size / 3, y + size - 2)
//         .lineTo(x + size - 2, y + 2)
//         .strokeColor('black')
//         .stroke();
//     }
//   };

//   // Calculate total table width
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (header row)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title border
//     .stroke();

//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//   startY += rowHeight; // Move to the next row

//   // Process table rows
//   tableDatacheckpe.forEach((row, rowIndex) => {
//     let columnWidths;
//     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//       // Rows 1, 2, and 6 use 2 columns
//       columnWidths = columnWidthsFirstRow;
//     } else {
//       // Rows 3 to 5 use 4 columns
//       columnWidths = columnWidthsOtherRows;
//     }

//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add content
//       if (rowIndex === 0 && colIndex === 1) {
//         // Add checkbox in 1st row, 2nd column
//         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//       } else {
//         doc
//           .fillColor('black')
//           .font('Helvetica')
//           .fontSize(7)
//           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//       }
//     });

//     startY += rowHeight; // Move to the next row
//   });

//   // Draw the outer table border (around the entire table)
//   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//   //   .stroke();
// }
function createCustomTableWithCheckboxpe(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe = "Permanent Address"; // Table header
const tableDatacheckpe = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.coResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

  


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]






  // drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
  doc.moveDown(1)
  // drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);

//  addFooter(doc);

  // Add the new page for ParentAddresco //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc)
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe = "Permanent Address"; // Table header
// const tableDatacheckpe = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//     { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
//     { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
//     { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
//     { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
//     { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress}` }, // 6th row (2 columns)
//   ];

// createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

function createStyledTablee(doc, titlee, tableDatae) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee = ["Employement/Business Details"]; // For the first row
const tableDatae = [
  { col1: "Occupation ", col2: `${allPerameters.coappocuupation1}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional  ", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee(doc, titlee, tableDatae);


function createStyledTablereg1(doc, titlereg1, tableDatareg1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg1 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg1 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg1(doc, titlereg1, tableDatareg1);

function createStyledTableop1(doc, titleop1, tableDataop1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop1 = ["Operating Address of the Entity"]; // For the first row
const tableDataop1 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop1(doc, titleop1, tableDataop1);
//  addFooter(doc);

  doc.addPage();
  //   // addLogo(doc);(doc);(doc);
// drawBorder()
doc.moveDown(3)
doc.font(fontBold).fontSize(11).text("SECTION 2: Additional Co-Applicant Details", { underline: true });

// function drawTablenewa(sectionTitlea, data, imagePatha) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   // const startX = 49;
//   const startX = titleX;

//   let startY = doc.y + titleHeight;
//   const rowHeight = 20;
//   const columnWidthsFirst5 = [125, 275]; // Two-column layout

//   // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//   const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//   const imageWidth = 100;
//   const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//   // Special row for section title
//   doc.rect(startX, startY, titleWidth, rowHeight)
//      .fill("#00BFFF")
//      .strokeColor("#151B54")
//      .lineWidth(1)
//      .stroke();

//   doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//      .text(sectionTitlea, startX + 5, startY + 8);
  
//   startY += rowHeight;

//   const imageSpanRows = 5;
//   const imageHeight = imageSpanRows * rowHeight;

//   data.forEach((row, index) => {
//       const rowY = startY + index * rowHeight;
      
//       if (index < 5) {
//         const columnWidths = columnWidthsFirst5;

//           // First 5 rows: two-column layout + image
//           doc.rect(startX, rowY, columnWidths[0], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//           if (index === 0) {
//               doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();

//               if (fs.existsSync(imagePatha)) {
//                   doc.image(imagePatha, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                       fit: [imageWidth - 10, imageHeight - 10]
//                   });
//               } else {
//                   doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                      .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//               }
//           }
//       } else if (index === 5 || index === 7) {
//           // 6th and 8th row transition to 4-column layout
//           columnWidths[0] = columnWidths[1] = 125;

//           // Draw four cells for these rows
//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       } else {
//           // 7th row and beyond: four-column layout without image
//           columnWidths[0] = columnWidths[1] = 125;

//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       }
//   });
// }
function drawTablenewaa(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenewa(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}


const coapplicantDetailsDataa = [
  // First 5 rows - 2 columns with key-value pairs
  { key: "Applicant Type", value: `${allPerameters.coAppType2}` },
{ key: "Business Type", value: `${allPerameters.coAppbuiType2}` },
{ key: "Co-Applicant Name", value: `${allPerameters.coAppName2}` },
{ key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather2}` },
{ key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother2}` },
{ key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp2}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob12}`},

// Row 6 - 4 columns
{ key1: "Email ID", value1: `${allPerameters.coAppEmail2}` },

// Row 7 - 2 columns with key-value pair
{ key1: "Educational Details", value1: `${allPerameters.coAppEdu2}`, key2: "Religion", value2: `${allPerameters.coAppreligion2}` },

// Row 8 - 4 columns
{ key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob2}`, key2: "Nationality", value2: `${allPerameters.coAppNationality2}` },

// Remaining rows - 4 columns layout
{ key1: "Gender", value1:  `${allPerameters.coAppGender2}`, key2: "Category", value2:  `${allPerameters.coAppCategory2}` },
{ key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus2}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd2}`},
{ key1: "Pan Number", value1:  `${allPerameters.coAppPan2}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId2}` },
{ key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar2}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo2}` },
// { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
// { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];




const saveImageLocally2 = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant2_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};


// const imagePath = "./uploads/applicant_photo.jpg";
// const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
const imagePatha = await saveImageLocally2(`${allPerameters.co2Image}`);

const sectionTitlea = "Co-Applicant Details";
drawTablenewa(sectionTitlea, coapplicantDetailsDataa, imagePatha);
doc.moveDown()


// function createStyledTablep1(doc, title, tableData) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   const titleHeight = 20; // Fixed title height
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, titleHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // Black text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += titleHeight;

//   // Process table rows
//   tableData.forEach((row, rowIndex) => {
//     // Determine column widths
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Calculate the row height dynamically based on the tallest cell
//     let rowHeight = 0;
//     const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
//       const columnWidth = columnWidths[colIndex] - 10; // Account for padding
//       return doc.heightOfString(cell || 'NA', {
//         width: columnWidth,
//         align: 'left',
//       });
//     });
//     rowHeight = Math.max(...cellHeights) + 10; // Add padding

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });
// }
function createStyledTablep1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

const titlep1 = [" Present/Communication Address"]; // For the first row
const tableDatap1 = [
{ col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress2}` }, // First row (2 columns)
{ col1: "Landmark ", col2:  `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity2}` }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2:  `${allPerameters.coAppdistrict2}`, col3: "State", col4:  `${allPerameters.coAppState2}` },
{ col1: "Country", col2:  `${allPerameters.coAppCountry2}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN2}` },
{ col1: "Present Address is ", col2:  `${allPerameters.coResidence2}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress2}` },

];
createStyledTablep1(doc, titlep1, tableDatap1);
doc.moveDown(3)
// function createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1) {
// const startX = 50; // Starting X position
// let startY = doc.y + 10; // Starting Y position
// const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
// const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
// const rowHeight = 20; // Fixed row height

// const drawCheckbox = (doc, x, y, size, isChecked) => {
//   doc
//     .rect(x, y, size, size) // Draw checkbox square
//     .stroke();
//   if (isChecked) {
//     doc
//       .moveTo(x, y + size / 2)
//       .lineTo(x + size / 3, y + size - 2)
//       .lineTo(x + size - 2, y + 2)
//       .strokeColor('black')
//       .stroke();
//   }
// };

// // Calculate total table width
// const tableWidth = Math.max(
//   columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//   columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
// );

// // Draw the title (header row)
// doc
//   .fillColor('#00BFFF') // Blue background
//   .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//   .fill()
//   .lineWidth(0.5)
//   .strokeColor('black')
//   .rect(startX, startY, tableWidth, rowHeight) // Title border
//   .stroke();

// doc
//   .fillColor('black') // White text
//   .font('Helvetica-Bold')
//   .fontSize(10)
//   .text(titlepe1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

// startY += rowHeight; // Move to the next row

// // Process table rows
// tableDatacheckpe1.forEach((row, rowIndex) => {
//   let columnWidths;
//   if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//     // Rows 1, 2, and 6 use 2 columns
//     columnWidths = columnWidthsFirstRow;
//   } else {
//     // Rows 3 to 5 use 4 columns
//     columnWidths = columnWidthsOtherRows;
//   }

//   const numColumns = columnWidths.length;

//   // Alternating row colors
//   const isGrayRow = rowIndex % 2 === 0;
//   const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//   // Draw background for the row
//   doc
//     .fillColor(rowColor)
//     .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//     .fill();

//   // Draw cell borders and content
//   Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//     // Draw border
//     doc
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//       .stroke();

//     // Add content
//     if (rowIndex === 0 && colIndex === 1) {
//       // Add checkbox in 1st row, 2nd column
//       drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//     } else {
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     }
//   });

//   startY += rowHeight; // Move to the next row
// });

// // Draw the outer table border (around the entire table)
// // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
// // doc
// //   .lineWidth(0.5)
// //   .strokeColor('black')
// //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
// //   .stroke();
// }
function createCustomTableWithCheckboxpe1(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe1 = "Permanent Address"; // Table header
const tableDatacheckpe1 = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
{ col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress2}` }, // 2nd row (2 columns)
{ col1: "Landmark", col2: `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity2}` }, // 3rd row (4 columns)
{ col1: "District Name ", col2: `${allPerameters.coAppdistrict2}`, col3: "State", col4: `${allPerameters.coAppState2}` }, // 4th row (4 columns)
{ col1: "Country", col2: `${allPerameters.coAppCountry2}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN2}` }, // 5th row (4 columns)
{ col1: "Present Address is", col2: `${allPerameters.coResidence2}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1);



// const ParentAddressco1 = [
//   { key: "DistrictName", value: "N/A" },
//   { key: "State", value: "N/A" },
//   { key: "Years at Permanent addres", value: "N/A" }
// ]






// drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
doc.moveDown(1)
// drawTable("Communication Address", communicationAddressco);
// drawTable("Permanent Address", ParentAddressco);
doc.moveDown(1);
// addFooter(doc);


// Add the new page for ParentAddresco //

doc.addPage()
// drawBorder()
  //   // addLogo(doc);(doc);(doc)
doc.moveDown(3)
//   function createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height

//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };

//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );

//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();

//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//     startY += rowHeight; // Move to the next row

//     // Process table rows
//     tableDatacheckpe1.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }

//       const numColumns = columnWidths.length;

//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();

//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();

//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });

//       startY += rowHeight; // Move to the next row
//     });

//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe1 = "Permanent Address"; // Table header
// const tableDatacheckpe1 = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//   { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress2}` }, // 2nd row (2 columns)
//   { col1: "Landmark", col2: `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity2}` }, // 3rd row (4 columns)
//   { col1: "District Name ", col2: `${allPerameters.coAppdistrict2}`, col3: "State", col4: `${allPerameters.coAppState2}` }, // 4th row (4 columns)
//   { col1: "Country", col2: `${allPerameters.coAppCountry2}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN2}` }, // 5th row (4 columns)
//   { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress2}` }, // 6th row (2 columns)
// ];

// createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1);

function createStyledTablee1(doc, titlee1, tableDatae1) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the widest row configuration
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titlee1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDatae1.forEach((row, rowIndex) => {
  // Define column widths based on the row index
  let columnWidths;
  if (rowIndex === 0) {
    columnWidths = columnWidthsFirstRow; // First row
  } else if (rowIndex === 2) {
    columnWidths = columnWidthsThirdRow; // Third row
  } else {
    columnWidths = columnWidthsOtherRows; // Other rows
  }

  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});
}




const titlee1 = ["Employement/Business Details"]; // For the first row
const tableDatae1 = [
{ col1: "Occupation ", col2:`${allPerameters.coappocuupation2}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "If Self Employed Professional", col2: "NA", col3: "Other Income", col4: "NA" },
{ col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
{ col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
{ col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee1(doc, titlee1, tableDatae1);


function createStyledTablereg2(doc, titlereg2, tableDatareg2) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the first-row column widths
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titlereg2, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDatareg2.forEach((row, rowIndex) => {
  // Conditional column widths: first row has 2 columns, others have 4 columns
  const isFirstRow = rowIndex === 0;
  const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});

}

const titlereg2 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg2 = [
{ col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
{ col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
{ col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
{ col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg2(doc, titlereg2, tableDatareg2);

function createStyledTableop2(doc, titleop2, tableDataop2) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the first-row column widths
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titleop2, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDataop2.forEach((row, rowIndex) => {
  // Conditional column widths: first row has 2 columns, others have 4 columns
  const isFirstRow = rowIndex === 0;
  const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});

}

const titleop2 = ["Operating Address of the Entity"]; // For the first row
const tableDataop2 = [
{ col1: "Address", col2: "NA" }, // First row (2 columns)
{ col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
{ col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
{ col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
{ col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop2(doc, titleop2, tableDataop2);
// addFooter(doc);
 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  doc.font(fontBold).fontSize(11).text("SECTION 3:Guarantor Details", { underline: true });
  



  // Guarnator Details //

//   function drawTablenew2(sectionTitle2, data, imagePath2) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle2, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath2)) {
//                     doc.image(imagePath2, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew22(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew2(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}


  const gauranterDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.guaType}` },
    { key: "Business Type", value: `${allPerameters.guaBuisType}` },
    { key: "Guarantor  Name", value: `${allPerameters.guaName}` },
    { key: `Guarantor Father's/Spouse Name`, value: `${allPerameters.guaFather}` },
    { key: "Guarantor Mother's Name", value: `${allPerameters.guaMother}` },


    { key1: "Mobile No 1", value1: `${allPerameters.guaMobile}`,key2:"Mobile No.2",value2:`${allPerameters.guaMobileNo2}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.guaEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.guaEdu}`, key2: "Religion", value2: `${allPerameters.giaReligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.guaDob}`, key2: "Nationality", value2: `${allPerameters.guaNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1: `${allPerameters.guaGender}`, key2: "Category", value2: `${allPerameters.guaCategory}` },
    { key1: "Marital Status", value1: `${allPerameters.guaMaritialStatus}`, key2: "No. of Dependents", value2: `${allPerameters.guaNoOfDependent}` },
    { key1: "Pan Number", value1: `${allPerameters.guaPan}`, key2: "Voter Id Number", value2: `${allPerameters.guaVoterId}` },
    { key1: "Aadhar Number", value1: `${allPerameters.guaAdhar}`, key2: "Udyam Number", value2: `${allPerameters.guaUdhyam}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  
  const saveImageLocally3 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "gau_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath2 = await saveImageLocally3(`${allPerameters.guaImage}`);
  
  const sectionTitle2 = ":Guarantor Details";
  drawTablenew2(sectionTitle2, gauranterDetailsData, imagePath2);
  doc.moveDown()


  

  // function createStyledTablep3(doc, titlep3, tableDatap3) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  //   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  //   const rowHeight = 20; // Fixed row height
  
  //   // Determine table width based on the first-row column widths
  //   const tableWidth = Math.max(
  //     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  //     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  //   );
  
  //   // Draw the title (full-width, blue background, with black border)
  //   doc
  //     .fillColor('#00BFFF') // Blue background
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row border
  //     .stroke();
  
  //   // Add the title text
  //   doc
  //     .fillColor('black') // White text
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .text(titlep3, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
  //   // Move to the next row
  //   startY += rowHeight;
  
  //   // Process table rows
  //   tableDatap3.forEach((row, rowIndex) => {
  //     // Conditional column widths: first row has 2 columns, others have 4 columns
  //     const isFirstRow = rowIndex === 0;
  //     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  //     const numColumns = columnWidths.length;
  
  //     // Alternating row colors
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border (around the entire table, excluding individual cell borders)
  //   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
  //   // doc
  //   //   .lineWidth(0.5)
  //   //   .strokeColor('black')
  //   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
  //   //   .stroke();
  // }
  function createStyledTablep3(doc, title, tableData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  
    // Determine table width based on the first-row column widths
    const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (full-width, blue background, with black border)
    const titleHeight = 20; // Fixed title height
    doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title row border
      .stroke();
  
    // Add the title text
    doc
      .fillColor('white') // Black text
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
    // Move to the next row
    startY += titleHeight;
  
    // Process table rows
    tableData.forEach((row, rowIndex) => {
      // Determine column widths
      const isFirstRow = rowIndex === 0;
      const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
      const numColumns = columnWidths.length;
  
      // Calculate the row height dynamically based on the tallest cell
      let rowHeight = 0;
      const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
        const columnWidth = columnWidths[colIndex] - 10; // Account for padding
        return doc.heightOfString(cell || 'NA', {
          width: columnWidth,
          align: 'left',
        });
      });
      rowHeight = Math.max(...cellHeights) + 10; // Add padding
  
      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
    const titlep3 = [" Present/Communication Address"]; // For the first row
  const tableDatap3 = [
    { col1: "Address as per Aadhar ", col2: `${allPerameters.gualoacalAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2: `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.gualocalCity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2: `${allPerameters.gualocalDistrict}`, col3: "State", col4: `${allPerameters.gualoacalState}` },
    { col1: "Country", col2: `${allPerameters.guaGender}`, col3: "PIN Code ", col4: `${allPerameters.guaGender}` },
    { col1: "Present Address is ", col2: `${allPerameters.guaResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.gualocalPin}` },
  ];
  createStyledTablep3(doc, titlep3, tableDatap3);
  


  // drawTable3("Guarnator Details", GuarnatorDetails, imagelogo);
  doc.moveDown(1)
  // function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  //   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  //   const rowHeight = 20; // Fixed row height
  
  //   const drawCheckbox = (doc, x, y, size, isChecked) => {
  //     doc
  //       .rect(x, y, size, size) // Draw checkbox square
  //       .stroke();
  //     if (isChecked) {
  //       doc
  //         .moveTo(x, y + size / 2)
  //         .lineTo(x + size / 3, y + size - 2)
  //         .lineTo(x + size - 2, y + 2)
  //         .strokeColor('black')
  //         .stroke();
  //     }
  //   };
  
  //   // Calculate total table width
  //   const tableWidth = Math.max(
  //     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  //     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  //   );
  
  //   // Draw the title (header row)
  //   doc
  //     .fillColor('#00BFFF') // Blue background
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight) // Title border
  //     .stroke();
  
  //   doc
  //     .fillColor('black') // White text
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .text(titlepe12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // Process table rows
  //   tableDatacheckpe12.forEach((row, rowIndex) => {
  //     let columnWidths;
  //     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
  //       // Rows 1, 2, and 6 use 2 columns
  //       columnWidths = columnWidthsFirstRow;
  //     } else {
  //       // Rows 3 to 5 use 4 columns
  //       columnWidths = columnWidthsOtherRows;
  //     }
  
  //     const numColumns = columnWidths.length;
  
  //     // Alternating row colors
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add content
  //       if (rowIndex === 0 && colIndex === 1) {
  //         // Add checkbox in 1st row, 2nd column
  //         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
  //       } else {
  //         doc
  //           .fillColor('black')
  //           .font('Helvetica')
  //           .fontSize(7)
  //           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //       }
  //     });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // Draw the outer table border (around the entire table)
  //   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
  //   // doc
  //   //   .lineWidth(0.5)
  //   //   .strokeColor('black')
  //   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
  //   //   .stroke();
  // }
  function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }
  

  const titlepe12 = "Permanent Address"; // Table header
const tableDatacheckpe12 = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2:  `${allPerameters.guaAdressAdhar}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2:  `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.guaCity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2:  `${allPerameters.guaDist}`, col3: "State", col4:  `${allPerameters.guaState}` }, // 4th row (4 columns)
  { col1: "Country", col2:  `${allPerameters.guaCountry}`, col3: "PIN Code", col4:  `${allPerameters.guaPin}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2:  `${allPerameters.guaResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12);
  // drawTable("Permanent Address", GuarnatorParentAddress);
  doc.moveDown(1);
//  addFooter(doc);


  // Add the new page  GuarnatorParentAddress-1//
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe12.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe12 = "Permanent Address"; // Table header
// const tableDatacheckpe12 = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//   { col1: "Permanent Address", col2:  `${allPerameters.guaAdressAdhar}` }, // 2nd row (2 columns)
//   { col1: "Landmark", col2:  `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.guapRESENTaddress}` }, // 3rd row (4 columns)
//   { col1: "District Name ", col2:  `${allPerameters.guaDist}`, col3: "State", col4:  `${allPerameters.guaState}` }, // 4th row (4 columns)
//   { col1: "Country", col2:  `${allPerameters.guaCountry}`, col3: "PIN Code", col4:  `${allPerameters.guapRESENTaddress}` }, // 5th row (4 columns)
//   { col1: "Present Address is", col2:  `${allPerameters.guapRESENTaddress}` }, // 6th row (2 columns)
// ];

// createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12);

function createStyledTablee12(doc, titlee12, tableDatae12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae12.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee12 = ["Employement/Business Details"]; // For the first row
const tableDatae12 = [
  { col1: "Occupation ", col2: `${allPerameters.gauOccupation}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },
];
createStyledTablee12(doc, titlee12, tableDatae12);


function createStyledTablereg22(doc, titlereg22, tableDatareg22) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg22, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg22.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg22 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg22 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg22(doc, titlereg22, tableDatareg22);

function createStyledTableop22(doc, titleop22, tableDataop22) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop22, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop22.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop22 = ["Operating Address of the Entity"]; // For the first row
const tableDataop22 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop22(doc, titleop22, tableDataop22);  
// addFooter(doc);


  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  // const CollateralsDetails = [
  //   { key: "Type", value: "RESIDENTIAL" },
  //   { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  // ]
  // drawTable("Collaterals Details", CollateralsDetails);
  function drawTableCollateral(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;

    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowPadding = 5; // Padding inside each cell

    // Set column widths dynamically
    const defaultColumnWidths = [200, 300]; // Default two-column layout
    const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

    // Draw the special row at the top of the table (section title)
    const specialRowHeight = 23; // Height of the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .fill("#0066B1") // Light blue background color
        .strokeColor("#00BFFF")
        .lineWidth(1)
        .stroke();

    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .strokeColor("black") // Black border
        .lineWidth(1)
        .stroke();

    // Add title text inside the special row
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("white")
        .text(sectionTitle, startX + rowPadding, startY + (specialRowHeight - 10) / 2, {
            width: titleWidth - 2 * rowPadding,
            align: "left",
        });

    // Move the Y position down after the special row
    startY += specialRowHeight;

    // Draw the table rows
    data.forEach((row, rowIndex) => {
        const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
        const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths;

        // Determine row height based on content
        let rowHeight = 20; // Minimum row height
        currentColumnWidths.forEach((width, colIndex) => {
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            const textHeight = doc
                .font(font)
                .fontSize(8)
                .heightOfString(text, { width: width - 2 * rowPadding });

            rowHeight = Math.max(rowHeight, textHeight + 2 * rowPadding);
        });

        // Draw the row cells
        let cellStartX = startX;
        currentColumnWidths.forEach((width, colIndex) => {
            // Draw cell border
            doc.rect(cellStartX, startY, width, rowHeight)
                .strokeColor("black")
                .lineWidth(1)
                .stroke();

            // Add text inside the cell
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            doc.font(font)
                .fontSize(8)
                .fillColor("#000000")
                .text(text, cellStartX + rowPadding, startY + rowPadding, {
                    align: "left",
                    width: width - 2 * rowPadding,
                    lineBreak: true,
                });

            // Move to the next column
            cellStartX += width;
        });

        // Move to the next row
        startY += rowHeight;
    });

    // Move down after the table ends
    doc.y = startY + 10; // Add spacing after the table
}


//   function drawTablecolleteral(sectionTitle, data) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const pageMargin = 48; // Margin on each side
//     const titleWidth = doc.page.width - 2 * titleX;

//     // Start drawing the table
//     const startX = titleX; // Start X position for the table
//     let startY = doc.y + titleHeight; // Start Y position for the table
//     const rowHeight = 20; // Default row height

//     // Set column widths dynamically
//     const defaultColumnWidths = [200, 300]; // Default two-column layout
//     const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

//     // Draw the special row at the top of the table (section title)
//     const specialRowHeight = 23; // Height of the special row
//     doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .fill("#00BFFF") // Light blue background color
//         .strokeColor("#00BFFF")
//         .lineWidth(1)
//         .stroke();

//         doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .strokeColor("black") // Black border
//         .lineWidth(1)
//         .stroke();

//     // Add title text inside the special row
//     doc.font(fontBold)
//         .fontSize(10)
//         .fillColor("black")
//         .text(sectionTitle, startX + 5, startY + 8);

//     // Move the Y position down after the special row
//     startY += specialRowHeight;

//     // Draw the table rows
//     data.forEach((row, rowIndex) => {
//         const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
//         const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
//         const cellHeight = rowHeight; // Fixed height for this example

//         // Draw the row cells
//         let cellStartX = startX;
//         currentColumnWidths.forEach((width, colIndex) => {
//             // Draw cell border
//             doc.rect(cellStartX, startY, width, cellHeight)
//                 .strokeColor("black")
//                 .lineWidth(1)
//                 .stroke();

//             // Add text inside the cell
//             const text = isSpecialRow
//                 ? row[colIndex] || "" // For special rows, use the value at index
//                 : colIndex === 0
//                 ? row.key
//                 : row.value; // For default rows, use key-value pairs

//             doc.font(font)
//                 .fontSize(8)
//                 .fillColor("#000000")
//                 .text(text, cellStartX + 5, startY + 5, {
//                     align: "left",
//                     width: width - 10,
//                     lineBreak: true,
//                 });

//             // Move to the next column
//             cellStartX += width;
//         });

//         // Move to the next row
//         startY += cellHeight;
//     });
// }

const CollateralsDetails = [
  { key: "Property Type", value: "Residential" },
  { key: "Property Address", value: `${allPerameters.technicalFullADDRESS}` },
  ["Name of Registered Owner", `${allPerameters.sellerName} & ${allPerameters.buyerName}`, "Relationship with Borrower", `${allPerameters.relationWithborrow}`],
  ["Area (In sq.ft)", `${allPerameters.sreaInSqFt}`, "Age of Property (In years)", `${allPerameters.propertyaGE}`],
  { key: "Market Value as on Date", value: `${allPerameters.marketValue} - ${allPerameters.marketValuetowor}` }
];

drawTableCollateral("Collaterals Details", CollateralsDetails);



  const BankDetails = [

    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  doc.moveDown(1)
  // Exact X and Y positioning without margins
  // Custom position with precise left alignment
  const customLeftPosition = 50; // Custom left offset in pixels
  const customWidth = 200; // Custom width for the text box, adjust as needed

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 5: Bank Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });


  drawTable("Bank Details", BankDetails)
  doc.moveDown(1);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 6: Referance Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });
    function drawTableref(sectionTitle, data) {
      doc.moveDown(1);
      const titleHeight = 20;
      const titleX = 48;
      const pageMargin = 48; // Margin on each side
      const titleWidth = doc.page.width - 2 * titleX;
  
      // Start drawing the table
      const startX = titleX; // Start X position for the table
      let startY = doc.y + titleHeight; // Start Y position for the table
      const rowHeight = 20; // Default row height
  
      // Set column widths dynamically
      const defaultColumnWidths = [200, 300]; // Default two-column layout
      const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows
  
      // Draw the special row at the top of the table (section title)
      const specialRowHeight = 23; // Height of the special row
      doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .fill("#0066B1") // Light blue background color
          .strokeColor("#00BFFF")
          .lineWidth(1)
          .stroke();
  
          doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .strokeColor("black") // Black border
          .lineWidth(1)
          .stroke();
  
      // Add title text inside the special row
      doc.font(fontBold)
          .fontSize(10)
          .fillColor("white")
          .text(sectionTitle, startX + 5, startY + 8);
  
      // Move the Y position down after the special row
      startY += specialRowHeight;
  
      // Draw the table rows
      data.forEach((row, rowIndex) => {
          const isSpecialRow = rowIndex === 0 || rowIndex === 4; // Rows 3 and 4 need 4 columns
          const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
          const cellHeight = rowHeight; // Fixed height for this example
  
          // Draw the row cells
          let cellStartX = startX;
          currentColumnWidths.forEach((width, colIndex) => {
              // Draw cell border
              doc.rect(cellStartX, startY, width, cellHeight)
                  .strokeColor("black")
                  .lineWidth(1)
                  .stroke();
  
              // Add text inside the cell
              const text = isSpecialRow
                  ? row[colIndex] || "" // For special rows, use the value at index
                  : colIndex === 0
                  ? row.key
                  : row.value; // For default rows, use key-value pairs
  
              doc.font(font)
                  .fontSize(8)
                  .fillColor("#000000")
                  .text(text, cellStartX + 5, startY + 5, {
                      align: "left",
                      width: width - 10,
                      lineBreak: true,
                  });
  
              // Move to the next column
              cellStartX += width;
          });
  
          // Move to the next row
          startY += cellHeight;
      });
  }

  const ReferanceDetails = [
    ["Reference 1 - Name", `${allPerameters.ref1name} `, "Reference 1 - Relation", `${allPerameters.ref1rel}`],

    // { 
    //   key: "Reference 1 - Name", value: `${allPerameters.ref1name}      Reference 1 - Relation    |${allPerameters.ref1rel}` ,
    // },
    // { 
    //   key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    // },
    { 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
    //  {
    //    key: "Reference 2 - Name", value: `${allPerameters.ref2name}      |Reference 2 - Relation    |${allPerameters.ref2rel}`

    // },
    ["Reference 2 - Name", `${allPerameters.ref2name} `, "Reference 2 - Relation", `${allPerameters.ref2rel}`],

    // { key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

    //  },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTableref("Referance Detail", ReferanceDetails)




//  // addFooter(doc); 


  // Section - paragraph //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  function drawTitletit(sectionTitle) {
    const titleHeight = 20;  // Height of the title bar
    const titleX = 48;  // X position for the title bar
    const titleWidth = doc.page.width - 2 * titleX;  // Width of the title bar
    
    const startY = doc.y;  // Y position (current position of the document)
    const titleBackgroundColor = "#0066B1";  // Background color (blue)
    
    // Draw the title background (rectangle)
    doc.rect(titleX, startY, titleWidth, titleHeight)
      .fill(titleBackgroundColor)
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
    
    // Add the title text inside the rectangle
    doc.font(fontBold)
      .fontSize(12)
      .fillColor("white")
      .text(sectionTitle, titleX + 5, startY + 5, {
        align: "center",
        width: titleWidth - 10,  // Adjust width to leave some padding
      });
  
    // Adjust y position for the content that follows
    doc.moveDown(1);
  }
  

//   doc.font('Helvetica-Bold')
// .fontSize(9)


// .text(
// `DECLARATION`,
// { align: 'justify', indent: 40, lineGap: 5 }
// );

drawTitletit("DECLARATION");

doc.font('Helvetica')
.fillColor("black")

.fontSize(9)
.text(`
1. I/We declare that we are citizens of India and all the particulars and information given in the application form is true,
correct and complete and no material information has been withheld/suppressed.
2. I/We shall adviseFCPL in writing of any change in my/our residential or employment/ business address.
3. I/We conirm that the funds shall be used for the stated purpose and will not be used for speculative or anti-social purpose.
4. I/We declare that I/we have not been in violation and shall not violate any provisions of the Prevention of Money
Laundering Act, 2002 and/ or any applicable law, rules, guidelines and circulars issued by the Reserve Bank of India
and/or any other statutory authority.
5. I/We authorise FCPL to make any enquiries regarding my/our application, including with other inance companies/registered credit bureau.
6.FCPL reserves the right to retain the photographs and documents submitted with this application and will not return the same to the applicant/s.
7. I/We have read the application form/ brochures and am/are aware of all the terms and conditions of availing inance from FCPL.
8. I/We understand that the sanction of this loan is at the sole discretion of FCPL and upon my/our executing necessary 
security (ies) and other formalities as required by FCPL and no commitment has been given regarding the same.
9. I/We authorise FCPL to conduct such credit checks as it considers necessary in its sole discretion and also authorise
FCPL to release such or any other information in its records for the purpose of credit appraisal/sharing for any other
purpose. I/We further agree that my/our loan shall be governed by the rules of FCPL which may be in force from time to
time.
10. I/We am/are aware that the upfront Legal, Technical, Processing fees, other fees and the applicable taxes collected from
me at the time of the application is non-refundable under any circumstances.
11. I/We am/are aware that FCPL does not accept any payment in cash. No payment in connection with the loan 
processing, sanction, disbursement, prepayment and repayment of loan shall be made to / in favour of any of
   FCPL intermediaries or any third party (ies) in cash or bearer cheque or in any other manner whatsoever.
12. No discount/free gift or any other commitment whatsoever has been which is not documented in the loan
agreement by FCPL or any of its authorised representatives.
13. I/We conirm that I/we have no insolvency proceedings initiated/pending against me/us nor have I/we ever been adjudicated insolvent.
14. Politically Exposed Person (PEP) Declaration:
Politically Exposed Persons” (PEPs) are individuals who are or have been entrusted with prominent public functions by a
foreign country, including the Heads of States.`,
{ align: 'justify',  lineGap: 5 }
).moveDown(0.1);

doc.font('Helvetica')
.fontSize(9)
.fillColor("black")

.text(`
/ Governments, senior politicians, senior government or judicial or military of oficers, senior executives of state-owned corporations and important 
Please tick Yes / No:
A.Applicant PEP/Relatives and close Associate of PEP ( ) Yes ( ) No
B.Co-Applicant PEP or Relatives and close Associate of PEP ( ) Yes ( ) No`,
{ align: 'justify',  lineGap: 5 }
).moveDown();


//  // addFooter(doc); 

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(5)

  doc.font('Helvetica')
  .fillColor("black")

.fontSize(9)
.text(`
15. The tenure/repayment/interest/other terms and conditions of the loan are subject to change as a consequence to any 
change in the money market conditions or on account of any other statutory or regulatory requirements or at FCPL 
discretion.   FCPL reserves the right to review and amend the terms of the loan in such manner and to such extent as
it may deem it.
16. I/We hereby declare and conirm if any detail or declaration made by me/us, if found to be false, then FCPL will be entitled to revoke and/or rec.
17. I/We hereby declare and conirm that any purchase by me/us of any insurance product is purely voluntary and is not
linked to availing of any credit facility from FCPL.
18. I/We hereby declare that the details furnished above are true and correct to the best of my/our knowledge and belief and
I/we undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false
or untrue or misleading or misrepresenting, I/we am/are aware that | /we may be held liable for it.
19. That there has never been an award or an adverse judgement or decree in a court case involving breach of contract, tax
malfeasance or other serious misconduct which shall adversely affect my/our ability to repay the loan.
20. I/We have never been a defaulter withFCPL or any other inancial institution.
21. That if any discrepancy is found or observed from the information given above and the documents produced in support 
thereof,  FCPL shall have the sole discretion to cancel the sanction at any stage and recall the loan if already disbursed
,in such an event, the processing fee shall be liable to be forfeited.
22. I/We permitFCPL to contact me/us with respect to the products and services being offered by FCPL or by any other
person (s) and further allowFCPL to cross sell the other products and services offered by such other person(s).
23. I/We further agree to receive SMS alerts/whatsapp/emails/letters etc. related to my/our application status and account
activities as well as product use messages  that FCPL and/or its group companies will send, from time to time on my/our 
mobile no./emails/letters etc as mentioned in this Application Form.
24. I/We conirm that laws in relation to the unsolicited communications referred in 'National Do Not Call Registry' as laid
down by 'Telecom Regulatory Authority of India' will not be applicable for such information/communication to me/us.
26. I/We shall create security and/or furnish guarantee in favour of FCPL as may be required.
27. I hereby submit voluntarily at my own discretion, the physical copy of Aadhaar card/physical e-Aadhaar / masked
Aadhaar / ofline electronic Aadhaar xml as issued by UIDAI (Aadhaar), toFCPL for the purpose of establishing my
identity / address proof.
28. The consent and purpose of collecting Aadhaar has been explained to me in local language.  FCPL has informed me
that my Aadhaar submitted toFCPL herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();




  


  
//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  drawTitletit("CKYC Explicit Consent");

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
    |/We, give my/our consent to download my/our KYC Records from the Central KYC Registry (CKYCR), only for the 
    purpose of veriication of my identity and address from the database of CKYCR Registry.
    I/we understand that my KYC Record includes my/our KYC Records / Personal information such as my/our
    name, address, date of birth / PAN num.
    I/We agree that my / our personal KYC details may be shared with Central KYC Registry or any other competent
    authority. | (we hereby consent to receive information from the Ratnaafin Capital Private Limited / Central
    KYC Registry or any other competent authority through SMS/email on my registered mobile number / e-mail
    address. | also agree that the non-receipt of any such SMS/e-mail shall not make the FCPL liable for any
    loss or damage whatsoever in nature.
    I/We hereby declare that there is no change in existing details and the details provided in CKYCR are updated as
    on date.
    
    Date :- ${allPerameters.date}                                                                                        PLACE:-   ${allPerameters.branchName}

    Applicant's signature                     Co-Applicant's signature              2ndCo-Applicant's signature                Guarantor's signature`,
     
  { align: 'justify',  lineGap: 5 }
  ).moveDown();

  drawTitletit("For detailed list of charges & penal charges please visit www.ratnaafin.com");
  doc.moveDown();
  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`TheFCPL's Sales Representative conirms he has: 
    (a) Collected self-attested copies of the above mentioned documents from the customer 
    (b) Not been given any payment in cash, bearer cheque or kind along with or in connection with this Loan application 
    from the customer.
    (c) Informed me/us that service tax and all other statutory taxes, levies including stamp duties and registration
    costs (if any), other fees, commissions, charges as may be applicable will be charged in connection with the loan. 
    (d) Informed me/us that the FCPL will not be liable for loss or delay in receipt of documents.
    (e) Informed me/us at incomplete / defective application will not be processed and the FCPL shall not be responsible in
    any manner for the resulting delay or otherwise. Notwithstanding the afore stated, the submission of loan application
    to the FCPL does not imply automatic approval by the FCPL and the FCPL will decide the quantum of the loan at 
    its sole and absolute discretion. TheFCPL in its sole and absolute discretion may either sanction or reject the
    application for granting the loan. In case of rejection, the FCPL shall communicate the reason for rejection.
    (f) Informed me/us that loan application may be disposed by FCPL within 30 working days of receipt of the same subject 
    to submission of all documents and details as may be required by FCPL in processing the Loan along with the 
    requisite fees. 
    (g) TheFCPL reserves its right to reject the loan application and retain the loan application form along with the
    photograph, information and documents.
  `,
{ align: 'justify',  lineGap: 5 }
);

//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
 (h) Informed to me/us that the FCPL shall have the right to make disclosure of any information relating to me/us including
  personal information, details in relation to loan, defaults, security, etc to the Credit Information Bureau of India 
  (CIBIL) and/or any other governmental/regulatory/statutory or private agency/entity,credit bureau, RBI, the FCPL’s other
  branches / subsidiaries / afiliates/ rating agencies, service providers, other Banks / inancial institutions, any third
  parties, any assigns / potential assignees or transferees, who may need, process and publish the information in such
  manner and through such medium as it may be deemed necessary by the publisher /  FCPL/ RBI, including publishing the 
  name as part of wilful defaulter’s list from time to time, as also use for KYC information veriication, credit risk
  analysis, or for other related purposes.
 (i) Informed & explained me/us all the charges and terms and conditions mentioned overleaf.
 (j) Informed me/us that the FCPL will send the Offer Letter to me/us on the e-mail ID mentioned by me/us in the loan application.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();

doc.font('Helvetica-Bold')
  .fontSize(9)
  .text(`
Do not Sign This Form if its Blank. Please Ensure all relevant sections and documents are completely filled to your satisfaction and then only sign the form 
`,
{ align: 'justify',  lineGap: 5 }
);

function createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsTitle = [500]; // Width for the title row
  const columnWidthsTable = [50, 450]; // Column widths: Sr. No (50), Particulars (450)
  const rowHeight = 20; // Fixed height for rows

  // Draw Table Title 1
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('white')
    .text(tableTitle1, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Title 2
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Header (Table Title 3)
  doc
    .fillColor('#d9d9d9') // Gray background
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('black')
    .text(tableTitle3, startX + 5, startY + 5, { width: columnWidthsTable[0] + columnWidthsTable[1] - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Rows
  tableDatatable.forEach((row, rowIndex) => {
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    const currentRowHeight = rowIndex === 0 ? 30 : rowHeight;


    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], currentRowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += currentRowHeight;
  });
}

const tableTitle1 = "DOCUMENTS CHECKLIST";
const tableTitle2 = "Login Documents";
const tableTitle3 = `Sr. No                                                 Particulars`;
const tableDatatable = [
{ srNo: "1", particulars: "KYC of Borrower and Co-Borrowers/Guarantors (Firm/Company) – PAN Card, COI, MOA, AOA, Udyam Registration Certiicate with Annexures, All Partnership Deed, All LLP Deed, GST Registration Certiicate (3 Pages) (For all states)." },
{ srNo: "2", particulars: "KYC Borrower and Co-Borrowers/Guarantors (Individuals/Proprietor/Partners): PAN Card and Aadhaar Card." },
{ srNo: "3", particulars: "Udyam Registration Certificate of Borrower." },
{ srNo: "4", particulars: "Application Form & CIBIL Consent." },
{ srNo: "5", particulars: "Business and Residence photos." },
{ srNo: "6", particulars: "Electricity Bill / Gas Dairy,Samagra ID (In Madhya Pradesh, the Samagra ID is a unique nine-digit number given to residents)" },
{ srNo: "7", particulars: "All CA/CC Bank Account statement for last 6 Months (In PDF)." },
{ srNo: "8", particulars: "ITR with Computation of Income for last 1 Year (If available)." },
{ srNo: "9", particulars: "Income Proof Documents." },
{ srNo: "10", particulars: "Latest Sanction letter of Existing loans with Statement of Account." },
{ srNo: "11", particulars: "CIBIL Reports of Borrower and Co-Borrowers/Guarantors." },
{ srNo: "12", particulars: "Farm CIBIL (On best effort basis)." },
{ srNo: "13", particulars: "BSV (Bank Signature Verification)." },
{ srNo: "14", particulars: "Legal Report, Technical Report." },
{ srNo: "15", particulars: "PD Report." },
{ srNo: "16", particulars: "FI / RCU / FCU Report." },
{ srNo: "17", particulars: "Property Documents." },
];

createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable);


//  // addFooter(doc); 

  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(1)


 
 
 
  // function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Property Documents" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Title: "Sr. No | Particulars" ===
  //   // Sr. No Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, columnWidths[0], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Sr. No', startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Particulars', startX + columnWidths[0] + 5, startY + 5, {
  //       width: columnWidths[1] - 10,
  //       align: 'left',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 3rd Title: "Gram Panchayat Patta Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableTitles[1], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === Rows with Sr. No and Particulars ===
  //   const rowHeightWithBullets =
  //     tableRow.particulars.length * bulletSpacing > rowHeight
  //       ? tableRow.particulars.length * bulletSpacing
  //       : rowHeight;
  
  //   // Sr. No Column
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableRow.srNo, startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Column with Bullet Points
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   tableRow.particulars.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   startY += rowHeightWithBullets; // Move to the next row
  //       // startY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;

  //   // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Footer background color
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(footerText, startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });

  // }

  function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const rowHeight = 20; // Default row height
    const bulletSpacing = 5; // Minimum spacing for bullet points in "Particulars"

    // === 1st Title: "Property Documents" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black')
        .text(tableTitles[0], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === 2nd Title: "Sr. No | Particulars" ===
    // Sr. No Header
    doc.fillColor('#d9d9d9').rect(startX, startY, columnWidths[0], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Sr. No', startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Header
    doc.fillColor('#d9d9d9').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Particulars', startX + columnWidths[0] + 5, startY + 5, { width: columnWidths[1] - 10, align: 'left' });
    startY += rowHeight;

    // === 3rd Title: "Gram Panchayat Patta Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableTitles[1], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === Rows with Sr. No and Particulars ===
    // Sr. No Column
    const particularsText = tableRow.particulars.join('\n• '); // Combine all bullets
    const particularsHeight = doc.heightOfString(`• ${particularsText}`, { width: columnWidths[1] - 15, align: 'left' });
    const rowHeightWithBullets = Math.max(particularsHeight + 10, rowHeight);

    // Sr. No Column
    doc.fillColor('#ffffff').rect(startX, startY, columnWidths[0], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableRow.srNo, startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Column
    doc.fillColor('#ffffff').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('black')
        .text(`• ${particularsText}`, startX + columnWidths[0] + 10, startY + 5, { width: columnWidths[1] - 15, align: 'left' });

    startY += rowHeightWithBullets;

    // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(footerText, startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
}

  

  

  const tableTitles = [
    "Property Documents",
    "Gram Panchayat Patta Properties",
  ];
  
  const tableRow = {
    srNo: "1",
    particulars: [
      "GP Patta / Ownership Certificate issued from Gram Panchayat office showing possession.",
      "Property Tax receipt.",
      "Mutation in the name of property owner (Jamabandi).",
      "Registered Title in form of Proposed Sale Deed/Co-ownership Deed/release deed/Gift Deed etc.",
      "Any Utility bill.",
      `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility bills, Ration Card, Tax record may be acceptable for possession proof.`,
      "Co-Ownership Deed executed between customer, spouse, son, or daughter is acceptable.",
      "Equitable Mortgage/Registered Mortgage.",
    ],
  };
  
  const footerText = "Nagar Parishad / Nagar Panchayat Properties";
  
  // Call the function
  drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText);

  function drawSingleRowTable(doc, rowData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Spacing between lines of text (line gap)
  
    // === Draw Sr. No Column ===
    const contentHeight = rowData.map((bullet) =>
      doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15, // Width of the "Particulars" column
      })
    );
    const rowHeightWithBullets = contentHeight.reduce((a, b) => a + b, 0) + bulletSpacing * rowData.length;
  
    // Draw Sr. No Cell
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text("1", startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // === Draw Particulars Column with Bullets ===
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    let bulletY = startY + 5;
    rowData.forEach((bullet) => {
      const bulletHeight = doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15,
      });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += bulletHeight + bulletSpacing; // Add spacing after each bullet
    });
  
    // Update Y position for future elements if needed
    return startY + rowHeightWithBullets;
  }
  
  // Sample Data
  const firstRowData = [
    "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
    "Property tax receipt in the name of property owner.",
    "Mutation order in the name of property owner.",
    `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
    bills, Ration Card, Tax record may be acceptable for possession proof.`,
    "NOC to Mortgage.",
    `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
    to be obtained.`,
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  drawSingleRowTable(doc, firstRowData);
  
  // function drawSingleRowTable(doc, rowData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === Draw Sr. No Column ===
  //   const rowHeightWithBullets = 
  //     rowData.length * bulletSpacing > 20 
  //       ? rowData.length * bulletSpacing 
  //       : 20; // Dynamic height based on content
  
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text("1", startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // === Draw Particulars Column with Dotted Data ===
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   rowData.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   // Update Y position for future elements if needed
  //   return startY + rowHeightWithBullets;
  // }
  
  
  
  // const firstRowData = [
  //   "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
  //   "Property tax receipt in the name of property owner.",
  //   "Mutation order in the name of property owner.",
  //   `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
  //    bills, Ration Card, Tax record may be acceptable for possession proof.`,
  //   "NOC to Mortgage",
  //   `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
  //    to be obtained.`,
  //   "Equitable Mortgage/Registered Mortgage",
  // ];
  
  // drawSingleRowTable(doc, firstRowData);
  

  // function drawCustomTableWithFooter1(doc, tableTitles1, tableRow, secondRowData, footerData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Municipal Corporation Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles1[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Row: Data in Two Columns ===
  //   secondRowData.forEach((item, index) => {
  //     // Sr. No Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX, startY, columnWidths[0], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(9)
  //       .fillColor('black')
  //       .text(index + 1, startX + 5, startY + 5, {
  //         width: columnWidths[0] - 10,
  //         align: 'center',
  //       });
  
  //     // Particulars Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(item, startX + columnWidths[0] + 5, startY + 5, {
  //         width: columnWidths[1] - 10,
  //         align: 'left',
  //       });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // === 3rd Title/Footer: Bullet Points ===
  //   footerData.forEach((footerItem) => {
  //     const footerHeight =
  //       footerItem.length * bulletSpacing > rowHeight
  //         ? footerItem.length * bulletSpacing
  //         : rowHeight;
  
  //     // Footer Section
  //     doc
  //       .fillColor('#ffffff') // White background for footer
  //       .rect(startX, startY, tableWidth, footerHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     let bulletY = startY + 5;
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${footerItem}`, startX + 5, bulletY, {
  //         width: tableWidth - 10,
  //         align: 'left',
  //       });
  
  //     startY += footerHeight; // Move to the next section
  //   });
  // }

  function drawCustomTableWithFooter1(doc, title, secondRowData, footerData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Line spacing for text in "Particulars"
  
    // === Title: "Municipal Corporation Properties" ===
    const titleHeight = 20; // Fixed height for title row
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, titleHeight)
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('black')
      .text(title, startX + 5, startY + 5, {
        width: tableWidth - 10,
        align: 'center',
      });
  
    startY += titleHeight; // Move to the next row
  
    // === Content: "Sr. No | Particulars" ===
    // Calculate the height of the "Particulars" content
    let contentHeight = secondRowData.reduce((totalHeight, bullet) => {
      return totalHeight + doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    }, 10); // Add padding
  
    // Sr. No Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], contentHeight)
      .strokeColor('black')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text('1', startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // Particulars Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], contentHeight)
      .strokeColor('black')
      .stroke();
  
    // Render each bullet point in "Particulars"
    let bulletY = startY + 5;
    secondRowData.forEach((bullet) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    });
  
    startY += contentHeight; // Move to the next section
  
    // === Footer Section ===
    const footerHeight = footerData.reduce((totalHeight, line) => {
      return totalHeight + doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    }, 10);
  
    // Footer Background
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, footerHeight)
      .fill()
      .strokeColor('black')
      .stroke();
  
    // Render each line in the footer
    let footerY = startY + 5;
    footerData.forEach((line) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${line}`, startX + 10, footerY, {
          width: tableWidth - 20,
          align: 'left',
          lineGap: 2,
        });
      footerY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    });
  }
  
  // Sample Data
  const secondRowData = [
    "Last 13 Years Complete Chain documents, i.e. Khasra / Notarized agreement / Sale Deed / Gift Deed / Co-ownership Deed.",
    "Architect plan/Site plan to be collected.",
    "Mutation in the name of Property owner.",
    "Latest property tax receipt.",
    "5-year-old Electricity bill in the name of seller/customer (to evidence possession) also Voter ID Card, any utility Bills, Ration card, and Tax record may be acceptable for possession proof.",
    "Indemnity from borrower.",
    "Latest registered title document shall be Sale deed / Gift deed / Co-ownership deed in case prior title document is not registered (e.g., notary/Khasra).",
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  const footerData = [
    "Legal opinion report of the property should state 'clear & marketable' and SARFAESI is applicable as issued by empanelled advocate.",
  ];
  
  // Call the function with the appropriate data
  drawCustomTableWithFooter1(doc, 'Municipal Corporation Properties', secondRowData, footerData);
//  // addFooter(doc); 

  
    
      doc.addPage();
    

function createChecklistTablet(doc, tableTitle, tableTitle2, tableData) {
  // Check if tableData is defined and an array
  if (!Array.isArray(tableData)) {
    console.error("tableData is not an array or is undefined");
    return;
  }

  // Initial configurations
  const startX = 50; // Starting X position for table
  let startY = doc.y + 10; // Starting Y position

  const rowHeight = 20;
  const rowHeightDefault = 20; // Default row height
  const columnWidthsTable = [50, 450]; // Widths for Sr. No and Particulars
  const columnWidthsTitle = [500]; // Width for the title row

  // Add Main Table Title (tableTitle)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('white')
    .text(tableTitle, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  startY += rowHeight;

  // Add Subtitle (tableTitle2)
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'left' });

  startY += rowHeight;

  // Draw Table Rows for `tableData`
  tableData.forEach((row, rowIndex) => {

    let rowHeight = rowIndex === 9? 30 : rowHeightDefault; // Increase height for row 3 (index 2)
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += rowHeight;
    doc.moveDown()

  });

}


const tableTitleT = "Disbursement DOCUMENTS";
const tableTitleT2 = `Sr. No                                                 Particulars`;
const tableDatatableT = [
  { srNo: "1", particulars: "Self-Attested KYC of Borrowers and Co-borrower." },
  { srNo: "2", particulars: "Self-Attested Udyam Registration Certiicate of Borrower." },
  { srNo: "3", particulars: "Sanction Letter signed by Borrower and Co-borrowers." },
  { srNo: "4", particulars: "NACH with Sign and Stamp / E-Nach Registeration." },
  { srNo: "5", particulars: "In case, Borrower is Partnership Firm or Company, Signed KYC of Borrower." },
  { srNo: "6", particulars: `5 UDC from Borrower and 2 UDC of Co-borrowers/Guarantors as per the Sanction Letter along with UDC Covering Letter.` },
  { srNo: "7", particulars: "Customer Disbursement Request form." },
  { srNo: "8", particulars: "Dual Declaration Form (If any )." },
  { srNo: "9", particulars: "Signed Personal Gaurantee Deed (If any )." },
  { srNo: "10", particulars: `Loan Agreement (MITC, Schedule, Insurance Form, Annexure 1, End Use Undertaking, DPN, Vernacular Language Declaration.\n\n` },
  { srNo: "11", particulars: "Sigend Sale deed / Gift Deed / Release deed / Co- ownership Deed." },
  { srNo: "12", particulars: "Signed Registered Mortgage / Equitable Mortgage Deed." },
  { srNo: "13", particulars: "Vetting Report." },
  { srNo: "14", particulars: "Revised Legal." },
  { srNo: "15", particulars: "FI and RCU Report." },
  { srNo: "16", particulars: "Insurance Form." },
  { srNo: "17", particulars: "Veterinary Doctor Certiicate (If applicable)." },
];


function drawTitletitt(sectionTitle) {

  const titleHeight = 20;  
  const titleX = 48; 
  const titleWidth = doc.page.width - 2 * titleX; 
  
  const startY = doc.y;  
  const titleBackgroundColor = "#0066B1";  
  
  doc.rect(titleX, startY, titleWidth, titleHeight)
    .fill(titleBackgroundColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();
  
  doc.font(fontBold)
    .fontSize(12)
    .fillColor("white")
    .text(sectionTitle, titleX + 5, startY + 5, {
      align: "center",
      width: titleWidth - 10,  
    });

 
}
createChecklistTablet(doc, tableTitleT, tableTitleT2, tableDatatableT);

drawTitletitt("MOST IMPORTANT INFORMATION (Adhar Consent)");

doc.font('Helvetica')
.fillColor("black")

  .fontSize(9)
  .text(`
I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company
here with shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. 
The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in 
accordance with the applicable law.
I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained
me in vernacular (the language known to me):
i) the purpose and the uses of collecting Aadhaar.
ii) the nature of information that may be shared upon ofline verification.
iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter’s ID, driving
license, etc.).
I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
its oficials responsible in case of any incorrect / false information or forged document provided by me.
This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
respect of the submission of his/her Aadhaar.
Date:-${allPerameters.date}
place:-${allPerameters.branchName}
  `,
{ align: 'justify',  lineGap: 5 }
);

// // addFooter(doc); 
addFooter1(doc);


// doc.addPage();
// // drawBorder()
//   //   // addLogo(doc);(doc);(doc);
// doc.moveDown(6)

// doc.font('Helvetica')
//   .fontSize(9)
//   .text(`
// I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
//  its oficials responsible in case of any incorrect / false information or forged document provided by me.

// This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
//  respect of the submission of his/her Aadhaar.

// Date:-

// place:-
//   `,
// { align: 'justify',  lineGap: 5 }
// );




// // Call the function with the PDF document and table data

// // Finalize the document (assuming you are writing to a file or streaming it)

  
  

  


// //  // addFooter(doc); 
//   addFooter1(doc);
  doc.end();

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // const objData = {
  //     fileName: pdfFileUrl,
  //     file: doc.toString('base64')
  // }
  // await initESign(objData)

  // return new Promise((resolve, reject) => {
  //     stream.on("finish", () => {
  //       resolve(pdfFileUrl);
  //     });
  //     stream.on("error", reject);
  //   });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

}


async function growpdf1(allPerameters,skipPages) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));


  function  addLogo() {
    // doc.moveDown(-5)
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });

    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }

  function addWatermark(doc) {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      //   doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { fit: [450, 400], opacity: 0.05 });
      doc.restore();
    }
    //  else {
    //   console.error(`Logo file not found at: ${watermarklogo}`);
    // }
  }

  function addFooter1(doc) {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;

    doc.font(fontBold).fontSize(6.3).fillColor("#324e98").text("Fin Coopers Capital Pvt Ltd", pageWidth, pageHeight - 80, { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", { align: "center", });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("CIN: 67120MP1994PTC008686", { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Phone: +91 7374911911 | Email: info@fincoopers.com", { align: "center",link: "tel:7374911911",link: "mailto:info@fincoopers.com", // Make it clickable
  });

    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor("#324e98").lineWidth(1).stroke();
  }
  
  
 // ../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png
  // const pdfLogos = path.join( __dirname,"../../../../../assets/image/ratnaLogo.png");
  
  // function addFooter(doc) {
  //   // PDF dimensions
  //   const pageWidth = doc.page.width; 
  //   const pageHeight = doc.page.height; 
  
  //   // Add logo at the bottom-right corner
  //   if (fs.existsSync(pdfLogos)) {
  //     const logoWidth = 40; 
  //     const logoHeight = 25; 
  
  //     doc.image(pdfLogos, pageWidth - logoWidth - 10, pageHeight - logoHeight - 10, {
  //       fit: [logoWidth, logoHeight],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${pdfLogos}`);
  //   }
  // }
  
  

  // const pdfFilename = `NEWApplicantConditions.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);
  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

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

  // doc.pipe(stream);

  //   drawBorder(doc);
  addLogo(doc);
  doc.moveDown(4);
  doc.fontSize(9).font(fontBold).fillColor('#00BFFF').text("LOAN APPLICATION FORM",{ align: "center" });


  doc.moveDown(1);
  doc.fontSize(8).font(fontBold).fillColor('#000000.').text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All fields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                                  ${allPerameters.date}`, { align: "left" ,continued:true});
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "right" });
  // I have to move down here
  doc.moveDown(1);


  // for sectionA//

  function drawTable(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;
  
    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowHeight = 20; // Default row height
  
    // Set fixed column widths
    const columnWidths = [150, 350, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#0066B1"; // Light blue background color#00BFFF. 0066B1
  
    // Draw the special row with background color
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .fill(specialRowColor)
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();
  
    // Add black border around the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .strokeColor("#000000") // Black border
      .lineWidth(1)
      .stroke();
  
    // Add text inside the special row
    doc.font(fontBold)
      .fontSize(10)
      .fillColor("white")
      .text(specialRowText, startX + 5, startY + 8);
  
    // Move the Y position down after the special row
    startY += specialRowHeight;
  
    // Draw the actual table rows
    data.forEach((row) => {
      const minRowHeight = 20;
      const extraHeightPerLine = 3;  // Additional height for each line of overflow
  
      // Calculate the height needed for the cell content
      const keyTextHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, fontSize: 8 });
      const valueTextHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, fontSize: 8 });
  
      // Determine the number of lines based on text height and base line height (e.g., 10 per line)
      const keyLines = Math.ceil(keyTextHeight / 10);
      const valueLines = Math.ceil(valueTextHeight / 10);
  
      // Calculate extra height if content requires more lines than default row height
      const extraHeight = (Math.max(keyLines, valueLines) - 1) * extraHeightPerLine;
  
      // Use the maximum height needed for either cell content or the minimum row height plus extra height
      const cellHeight = Math.max(keyTextHeight, valueTextHeight, minRowHeight) + extraHeight;
  
      // Draw key cell border
      doc.rect(startX, startY, columnWidths[0], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Draw value cell border
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000")
        .text(row.key, startX + 5, startY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
  
      // Check if this row should display a checkbox with or without a checkmark
      if (row.key === "Same as Communication address") {
        const checkboxX = startX + columnWidths[0] + 10;
        const checkboxY = startY + 5;
  
        // Draw checkbox border
        doc.rect(checkboxX, checkboxY, 10, 10).stroke();
  
        // Draw checkmark if the value is "YES"
        if (row.value === "YES") {
          doc.moveTo(checkboxX + 2, checkboxY + 5)
            .lineTo(checkboxX + 5, checkboxY + 8)
            .lineTo(checkboxX + 8, checkboxY + 2)
            .strokeColor("black")
            .stroke();
        }
      } else {
        // Add text to the value cell (wrapped if necessary)
        doc.text(row.value, startX + columnWidths[0] + 15, startY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
  
      // Move startY down by the height of the current cell for the next row
      startY += cellHeight;
    });
  }
  



  function drawComplexTable(headers, data, sectionA, sectionB, footerNote, fontSize = 7, borderWidth = 0.5) {
    doc.moveDown(2);

    // Title with customizable font size
    doc.font(fontBold)
        .fontSize(10)
        .text("1. MOST IMPORTANT INFORMATION", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(8)
        .text("Attention: PLEASE READ CAREFULLY BEFORE SIGNING ACKNOWLEDGEMENT FORM", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(fontSize)
        .text(`I/We refer to application Sr. No dated submitted by me/us to Fin Coopers Capital Pvt Ltd.. I/We have been provided the
following information and have accordingly filled up the aforesaid form.`);
    doc.moveDown(0.5);

    // Helper function to draw rows with customizable font size and border width
    const drawTableRow = (doc, x, y, row, colWidths, height, fontSize, borderWidth, borderColor = 'black') => {
        let currentX = x;

        if (row[0] === "Pre-EMI (Rs.)" || row[0] === "EMI (Rs.)" || row[0] === "Type of transaction") {
            const labelWidth = colWidths[0];
            const valueWidth = colWidths.reduce((sum, width) => sum + width, 0) - labelWidth;

            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, labelWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[0], currentX + 5, y + 5, { width: labelWidth - 10, align: "center" });

            currentX += labelWidth;
            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, valueWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[1], currentX + 5, y + 5, { width: valueWidth - 10, align: "center", lineBreak: true });
        } else {
            row.forEach((text, i) => {
                const cellWidth = colWidths[i];
                doc
                    .lineWidth(borderWidth)
                    .strokeColor(borderColor)
                    .rect(currentX, y, cellWidth, height)
                    .stroke()
                    .fontSize(fontSize) // Set font size dynamically
                    .text(text, currentX + 5, y + 5, { width: cellWidth - 10, align: "center", lineBreak: true });
                currentX += cellWidth;
            });
        }
    };

    // Set up table coordinates
    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [120, 120, 120, 120]; // Fixed column widths

    // Dynamically adjust row height based on data length
    const dataLength = data.length;
    // //console.log(dataLength);
    const rowHeight = dataLength >9 ? 35 : 23; // If more than 7 rows, increase height

    // Draw the header
    drawTableRow(doc, tableX, tableY, headers, colWidths, rowHeight, fontSize, borderWidth, 'black');
    
    // Draw data rows
    let currentY = tableY + rowHeight;
    data.forEach((row) => {
      drawTableRow(doc, tableX, currentY, row, colWidths, rowHeight, fontSize, borderWidth, 'black');
      currentY += rowHeight;
    });

    // Section A
    const sectionAStartY = currentY; // Directly connect to the data rows
    const sectionWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const sectionX = tableX;

    doc.rect(sectionX, sectionAStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("  A. Loan Processing Fee", sectionX + 2, sectionAStartY + 10, { align: "center" });
    currentY = sectionAStartY + 30; // Update currentY after section header

    sectionA.forEach((row) => {
        drawTableRow(doc, sectionX, currentY, row, colWidths, rowHeight, fontSize, borderWidth);
        currentY += rowHeight;
    });

    // Section B - Increase row height for Section B data only
    const sectionBStartY = currentY; // Directly connect to Section A
    doc.rect(sectionX, sectionBStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("B. Part Prepayment / Foreclosure Charges", sectionX + 5, sectionBStartY + 10, { align: "center" });
    currentY = sectionBStartY + 30; // Update currentY after section header

    sectionB.forEach((row, index) => {
        // Increase row height specifically for Section B rows
        const sectionBRowHeight = 50; // Increase the height for Section B rows
        drawTableRow(doc, sectionX, currentY, row, colWidths, sectionBRowHeight, fontSize, borderWidth);
        currentY += sectionBRowHeight; // Update Y for next row
    });

    // Footer Note (connect directly after Section B)
    const footerStartY = currentY; // No extra space before footer
    const footerHeight = 38;
    doc.rect(sectionX, footerStartY, sectionWidth, footerHeight).stroke();
    doc.fontSize(8)
        .font(fontBold)
        .text(footerNote, sectionX + 5, footerStartY + 10, { width: sectionWidth - 10, align: "left" });
}

 /// make a function Singnature //
  function createSignatureTablePDF(data, marginX = 40, marginY = 100) {
    // Table settings with customizable margins
    const startX = 40; // X position based on left margin
    const startY = doc.y; // Y position based on top margin
    const cellWidth = 130; // Width of each cell
    const minCellHeight = 15; // Minimum cell height
  
    // Set table color and line thickness
    doc.strokeColor('black').lineWidth(0.5); // Set line color to black and line thickness to 1.2
  
    // Draw header row (blank cells)
    for (let i = 0; i < 4; i++) {
      const x = startX + i * cellWidth;
      doc.rect(x, startY, cellWidth, minCellHeight).stroke(); // Draws a blank cell
    }
  
    // Draw content row and add data below the header row
    data.forEach((text, index) => {
      const x = startX + index * cellWidth;
      const textHeight = doc.fontSize(6).heightOfString(text, { width: cellWidth - 10 });
      const cellHeight = Math.max(textHeight + 20, minCellHeight); // Set cell height based on text height, with padding
  
      const y = startY + minCellHeight; // Move down by one cell height for content row
  
      // Draw the cell border
      doc.rect(x, y, cellWidth, cellHeight).stroke();
  
      // Add text to the cell, with padding
      doc.font('Helvetica-Bold').fontSize(6)
      .text(text, x + 5, y + 10, { width: cellWidth - 10, align: 'center' });
    });
  }

  function createDocumentsRequiredTable(data) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 55; // Defined margin from the border
    const padding = 5; // Padding inside cells
    const minColumnWidth = 200; // Minimum width for the columns

    // Calculate available width for the table based on the margins
    const availableWidth = pageWidth - 2 * margin;

    // Set column widths as 40% for the left column and 60% for the right column
    let cellWidth1 = Math.max(availableWidth * 0.4, minColumnWidth); // 40% for document name
    let cellWidth2 = Math.max(availableWidth * 0.6, minColumnWidth); // 60% for document details

    // const startX = margin + 10; // Start X position inside the margin
    // const startY = margin + 40; // Start Y position inside the margin, accounting for some space for the header

    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position

    // Set table color and line thickness
    doc.strokeColor('#20211A').lineWidth(0.2);

    // Draw the header row (DOCUMENTS REQUIRED)
    doc.rect(startX, startY, cellWidth1 + cellWidth2, 20).stroke(); // Use a fixed height for the header
    doc.fontSize(12).text('DOCUMENTS REQUIRED', startX + padding, startY + padding, { align: 'center' });

    let currentY = startY + 20; // Set the Y position after the header

    // Loop through the data and create table rows
    data.forEach(item => {
        // Calculate the height of each column's content
        const docNameHeight = doc.heightOfString(item.documentName);
        const docDetailsHeight = doc.heightOfString(item.documentDetails);

        // Choose the maximum height between the two columns
        const rowHeight = Math.max(docNameHeight, docDetailsHeight) + 2 * padding; // Adding padding for spacing

        // Draw the border around the row
        doc.rect(startX, currentY, cellWidth1 + cellWidth2, rowHeight).stroke();

        // Draw a border between the two columns
        doc.moveTo(startX + cellWidth1, currentY).lineTo(startX + cellWidth1, currentY + rowHeight).stroke();

        // Draw the document name in the left column
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text(item.documentName, startX + padding, currentY + padding, { align: 'left', width: cellWidth1 - 2 * padding, lineBreak: true });

        // Draw the document details in the right column
        doc.fontSize(8)
           .font('Helvetica')
           .text(item.documentDetails, startX + cellWidth1 + padding, currentY + padding, { align: 'left', width: cellWidth2 - 2 * padding, lineBreak: true });

        // Move to the next row based on the calculated row height
        currentY += rowHeight;
    });

    // Draw a footer row for the "Note" section (connected with the previous row)
    const noteHeight = doc.heightOfString('Note: Documents relating to beneficial owners, office bearers...') + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text('Note: Documents relating to beneficial owners, office bearers...', startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const rowHeight = 20; // Default row height
    const columnWidths = [200, 200]; // Key and Value columns
    const imageWidth = 100; // Width for the image cell
    const totalWidth = columnWidths[0] + columnWidths[1] + imageWidth;

  // Draw the special row at the top of the table (Loan Details)
  const specialRowHeight = 20; // Height of the special row
  const specialRowText = `${sectionTitle}`; // Text for the special row
  const specialRowColor = "#00BFFF"; // Light blue background color

  // Draw the special row with background color
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .fill(specialRowColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();

  // Add black border around the special row
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .strokeColor("#000000") // Black border
    .lineWidth(1)
    .stroke();

  // Add text inside the special row
  doc.font(fontBold)
    .fontSize(10)
    .fillColor("black")
    .text(specialRowText, startX + 5, startY + 8);


    // Adjust `startY` to begin the table rows after the header row
    startY += rowHeight;

    // Calculate rows for image spanning
    const imageSpanRows = 5; // Number of rows the image spans
    const imageHeight = imageSpanRows * rowHeight; // Total height for the image cell

    // Draw table rows
    data.forEach((row, index) => {
      const rowY = startY + index * rowHeight; // Calculate row position
      if (index < imageSpanRows) {
        // Rows with the image column
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke()

        doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
          .strokeColor("black")

          .lineWidth(1)
          .stroke();

        // Add text for Key and Value columns
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: columnWidths[1] - 10,
          });

        // Draw the image column in the first row of the image span
        if (index === 0) {
          doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();

          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
              fit: [imageWidth - 10, imageHeight - 10], // Adjust image size with padding
            });
          } else {
            doc.font(fontBold)
              .fontSize(10)
              .fillColor("#ff0000") // Red text
              .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
          }
        }
      } else {
        // Rows after the image span, merge `Value` and `Image` columns
        const fullValueWidth = columnWidths[1] + imageWidth;

        // Draw Key cell
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Draw merged Value cell
        doc.rect(startX + columnWidths[0], rowY, fullValueWidth, rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Add Key and Value text
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: fullValueWidth - 10,
          });
      }
    });
  }

  function drawNewPage(data) {
    let datavalue = Array.isArray(data) ? data : [data];
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    // // Draw the section title with a colored background (same as original)
    // doc.rect(titleX, doc.y, titleWidth, titleHeight)
    //   .fill("#00BFFF")  // Color for the section title (same as before)
    //   .strokeColor("#20211A") // Black border for the title
    //   .lineWidth(1)
    //   .stroke();

    // doc.font(fontBold)
    //   .fontSize(11)
    //   .fillColor("#20211A")
    //   .text(sectionTitle, titleX + 3, doc.y + 6);



    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position
    const rowHeight = 20; // Height of each row
    const columnWidths = [250, 300, 70]; // Column widths

    // Draw table rows
    datavalue.forEach((row, index) => {
      const rowY = startY + index * rowHeight;


      // Draw background fill for the row (without covering borders)
      doc.rect(startX, rowY, columnWidths[0] + columnWidths[0], rowHeight)
      // .fillColor(fillColor)
      // .fill();

      // Draw key cell border
      doc.rect(startX, rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Draw value cell border
      doc.rect(startX + columnWidths[0], rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000") // No background fill, just the text color
        .text(row.key, startX + 5, rowY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
      // Check if this row should display a checkbox
      if (row.key === "Same as Communication address") {
        if (row.value === "YES") {
          // Draw a checked checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke(); // Draw checkbox border
          doc.moveTo(startX + columnWidths[0] + 12, rowY + 10)
            .lineTo(startX + columnWidths[0] + 15, rowY + 13)
            .lineTo(startX + columnWidths[0] + 20, rowY + 7)
            .stroke(); // Draw checkmark
        } else {
          // Draw an empty checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
        }
      } else {
        // Add text to the value cell
        doc.text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
    });


    // Move down after drawing the table
    doc.moveDown(data.length * 0.1 + 1);
  }


  // First Page //
  // Generate the PDF content
  //   //   // addLogo(doc);(doc);(doc);
  addWatermark(doc);
  // drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value:`${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    { key: "Loan Purpose", value:`${allPerameters.loanPurpose}`},
    { key: "Loan Type", value:`${allPerameters.loanType}` },
  ];
  drawTable("Loan Details", loanDetails);
  doc.moveDown()

  // function createStyledTable(doc, headers, tableData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidths = [150, 100, 150, 100]; // Column widths
  //   const rowHeight = 20; // Fixed row height
  //   const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
  //   // Draw headers
  //   doc
  //     .fillColor('#00BFFF') // Blue header background
  //     .rect(startX, startY, tableWidth, rowHeight) // Header rectangle
  //     .fill()
  //     .fillColor('black') // White text for headers
  //     .font('Helvetica-Bold')
  //     .fontSize(8);
  
  //   headers.forEach((header, colIndex) => {
  //     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  //     doc.text(header, cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //   });
  
  //   // Move to the next row (data rows)
  //   startY += rowHeight;
  
  //   tableData.forEach((row, rowIndex) => {
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, tableWidth, rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border
  //   doc
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, doc.y + 10, tableWidth, startY - doc.y - 10)
  //     .stroke();
  // }
  
  // Example usage
  function createStyledTable(doc, headers, tableData, isHeaderBoxed = false) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidths = [150, 100, 150, 100]; // Column widths
    const rowHeight = 20; // Fixed row height
    const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
    // Draw header as a full box with proper borders
    if (isHeaderBoxed) {
      // Draw a black-bordered rectangle for the header
      doc
        .lineWidth(1) // Black border thickness
        .strokeColor('black') // Black border color
        .fillColor('#0066B1') // Blue background for the header
        .rect(startX, startY, tableWidth, rowHeight) // Rectangle enclosing header
        .fillAndStroke(); // Fill the background and stroke the border
  
      // Draw the header text inside the box
      doc
        .fillColor('white') // Black text color
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(headers[0], startX + 5, startY + 5, {
          width: tableWidth - 10, // Center text within the header box
          align: 'left',
        });
  
      startY += rowHeight; // Move to the next row
    }
  
    // Draw table rows
    tableData.forEach((row, rowIndex) => {
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, tableWidth, rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  
    // Draw the outer border for the entire table
    // doc
    //   .lineWidth(0.5)
    //   .strokeColor('black')
    //   .rect(startX, doc.y + 10, tableWidth, startY - (doc.y + 10))
    //   .stroke();
  }
  const headers1 = ['Product Details'];
  const tableData1 = [
    { col1: 'Business Loan', col2: 'NA', col3: 'Personal Loan', col4: 'NA' },
    { col1: 'Working Capital Term Loan/Business Loan Secured', col2: 'NA', col3: 'Home Loan', col4: 'NA' },
    { col1: 'Loan Against Property/Shed Purchase', col2: 'MICRO LAP', col3: 'Others', col4: 'NA' },
  ];
  
  const headers2 = ['Product Program Details'];
  const tableData2 = [
    { col1: 'Industry Type', col2: 'NA', col3: 'Sub Industry Type', col4: 'NA' },
    { col1: 'Product Type', col2: 'MICRO LAP', col3: 'Secured/Unsecured', col4: 'SECURED' },
    { col1: 'Property Value', col2: 'NA', col3: 'BT EMI Value', col4: 'NA' },
    { col1: 'Program', col2: 'NA', col3: '', col4: '' },
  ];
  
  // Draw tables
  createStyledTable(doc, headers1, tableData1,true);
  doc.moveDown()

  createStyledTable(doc, headers2, tableData2,true);
  
  // Sourcing Details Section

//   const sourcingDetails = [{
//     key:`Sourcing Type`,
//     value: `${allPerameters.sourceType}` || "NA",

//   }, {
//     key: "Gen Partner Name",
//     value: allPerameters.genPartnerName || "NA",
//   }, {
//     key: "Sourcing Agent Name : ",
//     value: allPerameters.sourcingAgentName || "NA",
//   }, {
//     key: "Sourcing Agent Code : ",
//     value: allPerameters.sourcingAgentCode || "NA",
//   }, {
//     key: "Sourcing Agent Location : ",
//     value: allPerameters.sourcingAgentLocation || "NA",
//   }, {
//     key: "Sourcing RM Name : ",
//     value: allPerameters.sourcingRMName || "NA",
//   }, {
//     key: "Sourcing RM Code : ",
//     value: allPerameters.sourcingRMCode || "NA",
//   }]

//   drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
//   const productProgramDetails = [
//     { key: "Industry Type", value: "FIN COOPERS" },
//     { key: "Sub Industry Type", value: "FIN COOPERS" },
//     { key: "Product Type", value: "SECURED" },
//     { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
//     { key: "Secured/Un-Secured", value: "SECURED" },
//     { key: "Property Value", value: "Rs. 500000" },
//     { key: "BT EMI Value", value: "NA" },
//   ];
//   drawTable("Product Program Details", productProgramDetails);
//  addFooter(doc);
    //   // addLogo(doc);(doc);(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  // doc.moveDown(2)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });



 
  





//original working code

function drawTablenewW(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}


// function drawTablenew(sectionTitle, data, imagePath) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   // const startX = 49;
//   const startX = titleX;

//   let startY = doc.y + titleHeight;
//   const rowHeight = 20;
//   // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//   const columnWidthsFirst5 = [125, 275]; // Two-column layout

//   const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//   const imageWidth = 100;
//   const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//   // Special row for section title
//   doc.rect(startX, startY, titleWidth, rowHeight)
//      .fill("#00BFFF")
//      .strokeColor("black")
//      .lineWidth(1)
//      .stroke();

//   doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//      .text(sectionTitle, startX + 5, startY + 8);
  
//   startY += rowHeight;

//   const imageSpanRows = 5;
//   const imageHeight = imageSpanRows * rowHeight;

//   data.forEach((row, index) => {
//       const rowY = startY + index * rowHeight;
      
//       if (index < 5) {
//         const columnWidths = columnWidthsFirst5;

//           // First 5 rows: two-column layout + image
//           doc.rect(startX, rowY, columnWidths[0], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//           if (index === 0) {
//               doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();

//               if (fs.existsSync(imagePath)) {
//                   doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                       fit: [imageWidth - 10, imageHeight - 10]
//                   });
//               } else {
//                   doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                      .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//               }
//           }
//       } else if (index === 5 || index === 7) {
//           // 6th and 8th row transition to 4-column layout
//           columnWidths[0] = columnWidths[1] = 125;

//           // Draw four cells for these rows
//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       } else {
//           // 7th row and beyond: four-column layout without image
//           columnWidths[0] = columnWidths[1] = 125;

//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       }
//   });
// }

 
const applicantDetailsData = [
  // First 5 rows - 2 columns with key-value pairs Applicant Mother's Name
  { key: "Applicant Type", value: `${allPerameters.appType}` },
  { key: "Business Type", value: `${allPerameters.buisnessType}` },
  { key: "Applicant Name", value: `${allPerameters.borrowerName}`},
  { key: "Applicant Father's/Spouse Name", value: `${allPerameters.appFather}` },
  { key: "Applicant Mother's Name.", value: `${allPerameters.appMother}` },

  { key1: "Mobile No.", value1: `${allPerameters.appMob1}`, key2: "Mobile No2.", value2: `${allPerameters.appMob2}` },

  // Row 6 - 4 columns
  { key1: "Email ID", value1: `${allPerameters.appEmail}` },

  // Row 7 - 2 columns with key-value pair
  { key1: "Educational Details", value1:`${allPerameters.appEdu}`, key2: "Religion", value2: `${allPerameters.appReligion}`},

  // Row 8 - 4 columns
  { key1: "Date Of Birth/Incorporation", value1:`${allPerameters.appDOB}`, key2: "Nationality", value2: `${allPerameters.appNationality}` },

  // Remaining rows - 4 columns layout
  { key1: "Gender", value1: `${allPerameters.appGender}`, key2: "Category", value2: `${allPerameters.appCategory}` },
  { key1: "Marital Status", value1: `${allPerameters.appMaritalStatus}`, key2: "No. of Dependents", value2: `${allPerameters.appNoOfDependentd}`},
  { key1: "Pan Number", value1: `${allPerameters.appPan}`, key2: "Voter Id Number ", value2: `${allPerameters.AppVoterId}` },
  { key1: "Aadhar Number", value1: `${allPerameters.appAdhar}`, key2: "Udyam Number", value2: `${allPerameters.appUshyamAdharNumber}`},
  // { key1: "Aadhar Number", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];


// //console.log("Applicant Details Data:", applicantDetailsData);
// const imagePath = "./uploads/applicant_photo.jpg";

const saveImageLocally = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "applicant_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};

// (async () => {
  const imagePath = await saveImageLocally(`${allPerameters.appImage}`);
// const imagePath = path.join(__dirname, `../../../../..${allPerameters.appImage}`);


const sectionTitle = "Applicant Details";
drawTablenew(sectionTitle, applicantDetailsData, imagePath);


  // drawTablenew(doc, applicantDetails,"Guarantor Details", imagelogo);
  // drawTablenew(doc, applicantDetails, imagelogo,"Applicant Details");

  doc.moveDown()

  
//   drawTablenew(doc, "Co-Applicant Details", applicantDetails, imagelogo);
function createStyledTable1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}



  const title = [" Present/Communication Address"]; // For the first row
const tableData = [
  { col1: "Address as per Aadhar ", col2: `${allPerameters.loacalAdharAdress}` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.localCity}` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.localDistrict}`, col3: "State", col4: `${allPerameters.loacalState}` },
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code ", col4: `${allPerameters.localPin}` },
  { col1: "Present Address is ", col2: `${allPerameters.appResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.AppYearsAtCureentAdress}` },

];
createStyledTable1(doc, title, tableData);
doc.moveDown(3)


  
  function createCustomTableWithCheckbox(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }

  const title1 = "Permanent Address"; // Table header
const tableDatacheck = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.appadharadress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.appCityName}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.appdistrict}`, col3: "State", col4: `${allPerameters.AppState}`}, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code", col4:`${allPerameters.AppPin}`}, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.appResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckbox(doc, title1, tableDatacheck);
  // drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
//  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)




function createStyledTableocc2(doc, titlet, tableDatat) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlet, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatat.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlet = ["Employement/Business Details"]; // For the first row
const tableDatat = [
  { col1: "Occupation ", col2: `${allPerameters.occupation}  `, col3: "Monthly Income", col4: `${allPerameters.monthlyIncome}  ` }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: `${allPerameters.isSelfEmployed}  `, col3: "Other Income", col4: `${allPerameters.otherIncome}  ` },
  { col1: "Firm Name M/S ", col2: `${allPerameters.firstName}  ` }, // First row (2 columns)
  { col1: "Type of Firm", col2: `${allPerameters.firmType}  `, col3: "Nature of Business ", col4: `${allPerameters.natureBuisness}` },
  { col1: "MSME Classification ", col2: `${allPerameters.msmeClassification}  `, col3: "UDYAM Registration No./Udyog Adhar", col4: `${allPerameters.appudhyam}  ` },

];

createStyledTableocc2(doc, titlet, tableDatat);

function createStyledTablereg(doc, titlereg, tableDatareg) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg = ["Registered Address of the Entity"]; // For the first row
const tableDatareg = [
  { col1: "Address ", col2: `${allPerameters.entityAdress}  ` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.entityLandmark}  `, col3: "Name of City/Town/Village", col4: `${allPerameters.entityCityTown}  ` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.entityDistrict}  `, col3: "State", col4: `${allPerameters.entityState}  ` },
  { col1: "Country", col2: `${allPerameters.entityCountry}  `, col3: "PIN Code ", col4: `${allPerameters.entitypin}  ` },
  { col1: "Mobile No.", col2: `${allPerameters.entityMobile}  `, col3: "Email Id", col4: `${allPerameters.entityemail}  ` },

];
createStyledTablereg(doc, titlereg, tableDatareg);

function createStyledTableop(doc, titleop, tableDataop) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop = ["Operating Address of the Entity"]; // For the first row
const tableDataop = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop(doc, titleop, tableDataop);

  

  // drawNewPage(ParmentAddress2);
  // drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
//  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
    //   // addLogo(doc);(doc);(doc);
  // drawBorder()
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("SECTION 2:Co-Applicant Details", { underline: true });

//   function drawTablenew1(sectionTitle1, data, imagePath1) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle1, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath1)) {
//                     doc.image(imagePath1, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew11(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew1(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

  const coapplicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType}` },
    { key: "Business Type", value: `${allPerameters.coAppbuiType}` },
    { key: "Co-Applicant Name", value: `${allPerameters.coAppName}` },
    { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather}` },
    { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother}` },
    { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob1}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.coAppEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.coAppEdu}`, key2: "Religion", value2: `${allPerameters.coAppreligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob}`, key2: "Nationality", value2: `${allPerameters.coAppNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1:  `${allPerameters.coAppGender}`, key2: "Category", value2:  `${allPerameters.coAppCategory}` },
    { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd}`},
    { key1: "Pan Number", value1:  `${allPerameters.coAppPan}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId}` },
    { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  const saveImageLocally1 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant1_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  
  const sectionTitle1 = "Co-Applicant Details";
  drawTablenew1(sectionTitle1, coapplicantDetailsData, imagePath1);
  doc.moveDown()


//   function createStyledTablep(doc, titlep, tableDatap) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
//   const rowHeight = 20; // Fixed row height

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlep, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += rowHeight;

//   // Process table rows
//   tableDatap.forEach((row, rowIndex) => {
//     // Conditional column widths: first row has 2 columns, others have 4 columns
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });

//   // Draw the outer table border (around the entire table, excluding individual cell borders)
//   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
//   //   .stroke();
// }
function createStyledTablep(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

  const titlep = [" Present/Communication Address"]; // For the first row
const tableDatap = [
  { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2:  `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2:  `${allPerameters.coAppdistrict}`, col3: "State", col4:  `${allPerameters.coAppState}` },
    { col1: "Country", col2:  `${allPerameters.coAppCountry}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN}` },
    { col1: "Present Address is ", col2:  `${allPerameters.coResidence}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress}` },
  
  ];
createStyledTablep(doc, titlep, tableDatap);
doc.moveDown(3)

// function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//   const rowHeight = 20; // Fixed row height

//   const drawCheckbox = (doc, x, y, size, isChecked) => {
//     doc
//       .rect(x, y, size, size) // Draw checkbox square
//       .stroke();
//     if (isChecked) {
//       doc
//         .moveTo(x, y + size / 2)
//         .lineTo(x + size / 3, y + size - 2)
//         .lineTo(x + size - 2, y + 2)
//         .strokeColor('black')
//         .stroke();
//     }
//   };

//   // Calculate total table width
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (header row)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title border
//     .stroke();

//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//   startY += rowHeight; // Move to the next row

//   // Process table rows
//   tableDatacheckpe.forEach((row, rowIndex) => {
//     let columnWidths;
//     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//       // Rows 1, 2, and 6 use 2 columns
//       columnWidths = columnWidthsFirstRow;
//     } else {
//       // Rows 3 to 5 use 4 columns
//       columnWidths = columnWidthsOtherRows;
//     }

//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add content
//       if (rowIndex === 0 && colIndex === 1) {
//         // Add checkbox in 1st row, 2nd column
//         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//       } else {
//         doc
//           .fillColor('black')
//           .font('Helvetica')
//           .fontSize(7)
//           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//       }
//     });

//     startY += rowHeight; // Move to the next row
//   });

//   // Draw the outer table border (around the entire table)
//   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//   //   .stroke();
// }
function createCustomTableWithCheckboxpe(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe = "Permanent Address"; // Table header
const tableDatacheckpe = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.coResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

  


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]






  // drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
  doc.moveDown(1)
  // drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);

//  addFooter(doc);

  // Add the new page for ParentAddresco //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc)
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe = "Permanent Address"; // Table header
// const tableDatacheckpe = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//     { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
//     { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
//     { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
//     { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
//     { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress}` }, // 6th row (2 columns)
//   ];

// createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

function createStyledTablee(doc, titlee, tableDatae) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee = ["Employement/Business Details"]; // For the first row
const tableDatae = [
  { col1: "Occupation ", col2: `${allPerameters.coappocuupation1}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional  ", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee(doc, titlee, tableDatae);


function createStyledTablereg1(doc, titlereg1, tableDatareg1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg1 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg1 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg1(doc, titlereg1, tableDatareg1);

function createStyledTableop1(doc, titleop1, tableDataop1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop1 = ["Operating Address of the Entity"]; // For the first row
const tableDataop1 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop1(doc, titleop1, tableDataop1);
//  addFooter(doc);


// addFooter(doc);
 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  doc.font(fontBold).fontSize(11).text("SECTION 3:Guarantor Details", { underline: true });
  



  // Guarnator Details //

//   function drawTablenew2(sectionTitle2, data, imagePath2) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle2, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath2)) {
//                     doc.image(imagePath2, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew22(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew2(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

  const gauranterDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.guaType}` },
    { key: "Business Type", value: `${allPerameters.guaBuisType}` },
    { key: "Guarantor  Name", value: `${allPerameters.guaName}` },
    { key: `Guarantor Father's/Spouse Name`, value: `${allPerameters.guaFather}` },
    { key: "Guarantor Mother's Name", value: `${allPerameters.guaMother}` },


    { key1: "Mobile No 1", value1: `${allPerameters.guaMobile}`,key2:"Mobile No.2",value2:`${allPerameters.guaMobileNo2}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.guaEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.guaEdu}`, key2: "Religion", value2: `${allPerameters.giaReligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.guaDob}`, key2: "Nationality", value2: `${allPerameters.guaNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1: `${allPerameters.guaGender}`, key2: "Category", value2: `${allPerameters.guaCategory}` },
    { key1: "Marital Status", value1: `${allPerameters.guaMaritialStatus}`, key2: "No. of Dependents", value2: `${allPerameters.guaNoOfDependent}` },
    { key1: "Pan Number", value1: `${allPerameters.guaPan}`, key2: "Voter Id Number", value2: `${allPerameters.guaVoterId}` },
    { key1: "Aadhar Number", value1: `${allPerameters.guaAdhar}`, key2: "Udyam Number", value2: `${allPerameters.guaUdhyam}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  
  const saveImageLocally3 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "gau_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath2 = await saveImageLocally3(`${allPerameters.guaImage}`);
  
  const sectionTitle2 = ":Guarantor Details";
  drawTablenew2(sectionTitle2, gauranterDetailsData, imagePath2);
  doc.moveDown()


  

  // function createStyledTablep3(doc, titlep3, tableDatap3) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  //   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  //   const rowHeight = 20; // Fixed row height
  
  //   // Determine table width based on the first-row column widths
  //   const tableWidth = Math.max(
  //     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  //     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  //   );
  
  //   // Draw the title (full-width, blue background, with black border)
  //   doc
  //     .fillColor('#00BFFF') // Blue background
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row border
  //     .stroke();
  
  //   // Add the title text
  //   doc
  //     .fillColor('black') // White text
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .text(titlep3, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
  //   // Move to the next row
  //   startY += rowHeight;
  
  //   // Process table rows
  //   tableDatap3.forEach((row, rowIndex) => {
  //     // Conditional column widths: first row has 2 columns, others have 4 columns
  //     const isFirstRow = rowIndex === 0;
  //     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  //     const numColumns = columnWidths.length;
  
  //     // Alternating row colors
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border (around the entire table, excluding individual cell borders)
  //   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
  //   // doc
  //   //   .lineWidth(0.5)
  //   //   .strokeColor('black')
  //   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
  //   //   .stroke();
  // }
  function createStyledTablep3(doc, title, tableData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  
    // Determine table width based on the first-row column widths
    const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (full-width, blue background, with black border)
    const titleHeight = 20; // Fixed title height
    doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title row border
      .stroke();
  
    // Add the title text
    doc
      .fillColor('white') // Black text
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
    // Move to the next row
    startY += titleHeight;
  
    // Process table rows
    tableData.forEach((row, rowIndex) => {
      // Determine column widths
      const isFirstRow = rowIndex === 0;
      const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
      const numColumns = columnWidths.length;
  
      // Calculate the row height dynamically based on the tallest cell
      let rowHeight = 0;
      const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
        const columnWidth = columnWidths[colIndex] - 10; // Account for padding
        return doc.heightOfString(cell || 'NA', {
          width: columnWidth,
          align: 'left',
        });
      });
      rowHeight = Math.max(...cellHeights) + 10; // Add padding
  
      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
    const titlep3 = [" Present/Communication Address"]; // For the first row
  const tableDatap3 = [
    { col1: "Address as per Aadhar ", col2: `${allPerameters.gualoacalAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2: `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.gualocalCity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2: `${allPerameters.gualocalDistrict}`, col3: "State", col4: `${allPerameters.gualoacalState}` },
    { col1: "Country", col2: `${allPerameters.guaGender}`, col3: "PIN Code ", col4: `${allPerameters.guaGender}` },
    { col1: "Present Address is ", col2: `${allPerameters.guaResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.gualocalPin}` },
  ];
  createStyledTablep3(doc, titlep3, tableDatap3);
  


  // drawTable3("Guarnator Details", GuarnatorDetails, imagelogo);
  doc.moveDown(1)
  // function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  //   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  //   const rowHeight = 20; // Fixed row height
  
  //   const drawCheckbox = (doc, x, y, size, isChecked) => {
  //     doc
  //       .rect(x, y, size, size) // Draw checkbox square
  //       .stroke();
  //     if (isChecked) {
  //       doc
  //         .moveTo(x, y + size / 2)
  //         .lineTo(x + size / 3, y + size - 2)
  //         .lineTo(x + size - 2, y + 2)
  //         .strokeColor('black')
  //         .stroke();
  //     }
  //   };
  
  //   // Calculate total table width
  //   const tableWidth = Math.max(
  //     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  //     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  //   );
  
  //   // Draw the title (header row)
  //   doc
  //     .fillColor('#00BFFF') // Blue background
  //     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight) // Title border
  //     .stroke();
  
  //   doc
  //     .fillColor('black') // White text
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .text(titlepe12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // Process table rows
  //   tableDatacheckpe12.forEach((row, rowIndex) => {
  //     let columnWidths;
  //     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
  //       // Rows 1, 2, and 6 use 2 columns
  //       columnWidths = columnWidthsFirstRow;
  //     } else {
  //       // Rows 3 to 5 use 4 columns
  //       columnWidths = columnWidthsOtherRows;
  //     }
  
  //     const numColumns = columnWidths.length;
  
  //     // Alternating row colors
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add content
  //       if (rowIndex === 0 && colIndex === 1) {
  //         // Add checkbox in 1st row, 2nd column
  //         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
  //       } else {
  //         doc
  //           .fillColor('black')
  //           .font('Helvetica')
  //           .fontSize(7)
  //           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //       }
  //     });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // Draw the outer table border (around the entire table)
  //   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
  //   // doc
  //   //   .lineWidth(0.5)
  //   //   .strokeColor('black')
  //   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
  //   //   .stroke();
  // }
  function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }
  

  const titlepe12 = "Permanent Address"; // Table header
const tableDatacheckpe12 = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2:  `${allPerameters.guaAdressAdhar}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2:  `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.guaCity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2:  `${allPerameters.guaDist}`, col3: "State", col4:  `${allPerameters.guaState}` }, // 4th row (4 columns)
  { col1: "Country", col2:  `${allPerameters.guaCountry}`, col3: "PIN Code", col4:  `${allPerameters.guaPin}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2:  `${allPerameters.guaResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12);
  // drawTable("Permanent Address", GuarnatorParentAddress);
  doc.moveDown(1);
//  addFooter(doc);


  // Add the new page  GuarnatorParentAddress-1//
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe12.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe12 = "Permanent Address"; // Table header
// const tableDatacheckpe12 = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//   { col1: "Permanent Address", col2:  `${allPerameters.guaAdressAdhar}` }, // 2nd row (2 columns)
//   { col1: "Landmark", col2:  `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.guapRESENTaddress}` }, // 3rd row (4 columns)
//   { col1: "District Name ", col2:  `${allPerameters.guaDist}`, col3: "State", col4:  `${allPerameters.guaState}` }, // 4th row (4 columns)
//   { col1: "Country", col2:  `${allPerameters.guaCountry}`, col3: "PIN Code", col4:  `${allPerameters.guapRESENTaddress}` }, // 5th row (4 columns)
//   { col1: "Present Address is", col2:  `${allPerameters.guapRESENTaddress}` }, // 6th row (2 columns)
// ];

// createCustomTableWithCheckboxpe12(doc, titlepe12, tableDatacheckpe12);

function createStyledTablee12(doc, titlee12, tableDatae12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee12, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae12.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee12 = ["Employement/Business Details"]; // For the first row
const tableDatae12 = [
  { col1: "Occupation ", col2: `${allPerameters.gauOccupation}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },
];
createStyledTablee12(doc, titlee12, tableDatae12);


function createStyledTablereg22(doc, titlereg22, tableDatareg22) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg22, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg22.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg22 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg22 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg22(doc, titlereg22, tableDatareg22);

function createStyledTableop22(doc, titleop22, tableDataop22) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop22, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop22.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop22 = ["Operating Address of the Entity"]; // For the first row
const tableDataop22 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop22(doc, titleop22, tableDataop22);  
// addFooter(doc);


  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  // const CollateralsDetails = [
  //   { key: "Type", value: "RESIDENTIAL" },
  //   { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  // ]
  // drawTable("Collaterals Details", CollateralsDetails);
  function drawTableCollateral(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;

    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowPadding = 5; // Padding inside each cell

    // Set column widths dynamically
    const defaultColumnWidths = [200, 300]; // Default two-column layout
    const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

    // Draw the special row at the top of the table (section title)
    const specialRowHeight = 23; // Height of the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .fill("#0066B1") // Light blue background color
        .strokeColor("#00BFFF")
        .lineWidth(1)
        .stroke();

    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .strokeColor("black") // Black border
        .lineWidth(1)
        .stroke();

    // Add title text inside the special row
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("white")
        .text(sectionTitle, startX + rowPadding, startY + (specialRowHeight - 10) / 2, {
            width: titleWidth - 2 * rowPadding,
            align: "left",
        });

    // Move the Y position down after the special row
    startY += specialRowHeight;

    // Draw the table rows
    data.forEach((row, rowIndex) => {
        const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
        const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths;

        // Determine row height based on content
        let rowHeight = 20; // Minimum row height
        currentColumnWidths.forEach((width, colIndex) => {
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            const textHeight = doc
                .font(font)
                .fontSize(8)
                .heightOfString(text, { width: width - 2 * rowPadding });

            rowHeight = Math.max(rowHeight, textHeight + 2 * rowPadding);
        });

        // Draw the row cells
        let cellStartX = startX;
        currentColumnWidths.forEach((width, colIndex) => {
            // Draw cell border
            doc.rect(cellStartX, startY, width, rowHeight)
                .strokeColor("black")
                .lineWidth(1)
                .stroke();

            // Add text inside the cell
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            doc.font(font)
                .fontSize(8)
                .fillColor("#000000")
                .text(text, cellStartX + rowPadding, startY + rowPadding, {
                    align: "left",
                    width: width - 2 * rowPadding,
                    lineBreak: true,
                });

            // Move to the next column
            cellStartX += width;
        });

        // Move to the next row
        startY += rowHeight;
    });

    // Move down after the table ends
    doc.y = startY + 10; // Add spacing after the table
}


//   function drawTablecolleteral(sectionTitle, data) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const pageMargin = 48; // Margin on each side
//     const titleWidth = doc.page.width - 2 * titleX;

//     // Start drawing the table
//     const startX = titleX; // Start X position for the table
//     let startY = doc.y + titleHeight; // Start Y position for the table
//     const rowHeight = 20; // Default row height

//     // Set column widths dynamically
//     const defaultColumnWidths = [200, 300]; // Default two-column layout
//     const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

//     // Draw the special row at the top of the table (section title)
//     const specialRowHeight = 23; // Height of the special row
//     doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .fill("#00BFFF") // Light blue background color
//         .strokeColor("#00BFFF")
//         .lineWidth(1)
//         .stroke();

//         doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .strokeColor("black") // Black border
//         .lineWidth(1)
//         .stroke();

//     // Add title text inside the special row
//     doc.font(fontBold)
//         .fontSize(10)
//         .fillColor("black")
//         .text(sectionTitle, startX + 5, startY + 8);

//     // Move the Y position down after the special row
//     startY += specialRowHeight;

//     // Draw the table rows
//     data.forEach((row, rowIndex) => {
//         const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
//         const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
//         const cellHeight = rowHeight; // Fixed height for this example

//         // Draw the row cells
//         let cellStartX = startX;
//         currentColumnWidths.forEach((width, colIndex) => {
//             // Draw cell border
//             doc.rect(cellStartX, startY, width, cellHeight)
//                 .strokeColor("black")
//                 .lineWidth(1)
//                 .stroke();

//             // Add text inside the cell
//             const text = isSpecialRow
//                 ? row[colIndex] || "" // For special rows, use the value at index
//                 : colIndex === 0
//                 ? row.key
//                 : row.value; // For default rows, use key-value pairs

//             doc.font(font)
//                 .fontSize(8)
//                 .fillColor("#000000")
//                 .text(text, cellStartX + 5, startY + 5, {
//                     align: "left",
//                     width: width - 10,
//                     lineBreak: true,
//                 });

//             // Move to the next column
//             cellStartX += width;
//         });

//         // Move to the next row
//         startY += cellHeight;
//     });
// }

const CollateralsDetails = [
  { key: "Property Type", value: "Residential" },
  { key: "Property Address", value: `${allPerameters.technicalFullADDRESS}` },
  ["Name of Registered Owner", `${allPerameters.sellerName} & ${allPerameters.buyerName}`, "Relationship with Borrower", `${allPerameters.relationWithborrow}`],
  ["Area (In sq.ft)", `${allPerameters.sreaInSqFt}`, "Age of Property (In years)", `${allPerameters.propertyaGE}`],
  { key: "Market Value as on Date", value: `${allPerameters.marketValue} - ${allPerameters.marketValuetowor}` }
];

drawTableCollateral("Collaterals Details", CollateralsDetails);



  const BankDetails = [

    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  doc.moveDown(1)
  // Exact X and Y positioning without margins
  // Custom position with precise left alignment
  const customLeftPosition = 50; // Custom left offset in pixels
  const customWidth = 200; // Custom width for the text box, adjust as needed

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 5: Bank Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });


  drawTable("Bank Details", BankDetails)
  doc.moveDown(1);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 6: Referance Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });
    function drawTableref(sectionTitle, data) {
      doc.moveDown(1);
      const titleHeight = 20;
      const titleX = 48;
      const pageMargin = 48; // Margin on each side
      const titleWidth = doc.page.width - 2 * titleX;
  
      // Start drawing the table
      const startX = titleX; // Start X position for the table
      let startY = doc.y + titleHeight; // Start Y position for the table
      const rowHeight = 20; // Default row height
  
      // Set column widths dynamically
      const defaultColumnWidths = [200, 300]; // Default two-column layout
      const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows
  
      // Draw the special row at the top of the table (section title)
      const specialRowHeight = 23; // Height of the special row
      doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .fill("#0066B1") // Light blue background color
          .strokeColor("#00BFFF")
          .lineWidth(1)
          .stroke();
  
          doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .strokeColor("black") // Black border
          .lineWidth(1)
          .stroke();
  
      // Add title text inside the special row
      doc.font(fontBold)
          .fontSize(10)
          .fillColor("white")
          .text(sectionTitle, startX + 5, startY + 8);
  
      // Move the Y position down after the special row
      startY += specialRowHeight;
  
      // Draw the table rows
      data.forEach((row, rowIndex) => {
          const isSpecialRow = rowIndex === 0 || rowIndex === 4; // Rows 3 and 4 need 4 columns
          const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
          const cellHeight = rowHeight; // Fixed height for this example
  
          // Draw the row cells
          let cellStartX = startX;
          currentColumnWidths.forEach((width, colIndex) => {
              // Draw cell border
              doc.rect(cellStartX, startY, width, cellHeight)
                  .strokeColor("black")
                  .lineWidth(1)
                  .stroke();
  
              // Add text inside the cell
              const text = isSpecialRow
                  ? row[colIndex] || "" // For special rows, use the value at index
                  : colIndex === 0
                  ? row.key
                  : row.value; // For default rows, use key-value pairs
  
              doc.font(font)
                  .fontSize(8)
                  .fillColor("#000000")
                  .text(text, cellStartX + 5, startY + 5, {
                      align: "left",
                      width: width - 10,
                      lineBreak: true,
                  });
  
              // Move to the next column
              cellStartX += width;
          });
  
          // Move to the next row
          startY += cellHeight;
      });
  }

  const ReferanceDetails = [
    ["Reference 1 - Name", `${allPerameters.ref1name} `, "Reference 1 - Relation", `${allPerameters.ref1rel}`],

    // { 
    //   key: "Reference 1 - Name", value: `${allPerameters.ref1name}      Reference 1 - Relation    |${allPerameters.ref1rel}` ,
    // },
    // { 
    //   key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    // },
    { 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
    //  {
    //    key: "Reference 2 - Name", value: `${allPerameters.ref2name}      |Reference 2 - Relation    |${allPerameters.ref2rel}`

    // },
    ["Reference 2 - Name", `${allPerameters.ref2name} `, "Reference 2 - Relation", `${allPerameters.ref2rel}`],

    // { key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

    //  },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTableref("Referance Detail", ReferanceDetails)




//  // addFooter(doc); 


  // Section - paragraph //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  function drawTitletit(sectionTitle) {
    const titleHeight = 20;  // Height of the title bar
    const titleX = 48;  // X position for the title bar
    const titleWidth = doc.page.width - 2 * titleX;  // Width of the title bar
    
    const startY = doc.y;  // Y position (current position of the document)
    const titleBackgroundColor = "#0066B1";  // Background color (blue)
    
    // Draw the title background (rectangle)
    doc.rect(titleX, startY, titleWidth, titleHeight)
      .fill(titleBackgroundColor)
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
    
    // Add the title text inside the rectangle
    doc.font(fontBold)
      .fontSize(12)
      .fillColor("white")
      .text(sectionTitle, titleX + 5, startY + 5, {
        align: "center",
        width: titleWidth - 10,  // Adjust width to leave some padding
      });
  
    // Adjust y position for the content that follows
    doc.moveDown(1);
  }
  

//   doc.font('Helvetica-Bold')
// .fontSize(9)


// .text(
// `DECLARATION`,
// { align: 'justify', indent: 40, lineGap: 5 }
// );

drawTitletit("DECLARATION");

doc.font('Helvetica')
.fillColor("black")

.fontSize(9)
.text(`
1. I/We declare that we are citizens of India and all the particulars and information given in the application form is true,
correct and complete and no material information has been withheld/suppressed.
2. I/We shall adviseFCPL in writing of any change in my/our residential or employment/ business address.
3. I/We conirm that the funds shall be used for the stated purpose and will not be used for speculative or anti-social purpose.
4. I/We declare that I/we have not been in violation and shall not violate any provisions of the Prevention of Money
Laundering Act, 2002 and/ or any applicable law, rules, guidelines and circulars issued by the Reserve Bank of India
and/or any other statutory authority.
5. I/We authorise FCPL to make any enquiries regarding my/our application, including with other inance companies/registered credit bureau.
6.FCPL reserves the right to retain the photographs and documents submitted with this application and will not return the same to the applicant/s.
7. I/We have read the application form/ brochures and am/are aware of all the terms and conditions of availing inance from FCPL.
8. I/We understand that the sanction of this loan is at the sole discretion of FCPL and upon my/our executing necessary 
security (ies) and other formalities as required by FCPL and no commitment has been given regarding the same.
9. I/We authorise FCPL to conduct such credit checks as it considers necessary in its sole discretion and also authorise
FCPL to release such or any other information in its records for the purpose of credit appraisal/sharing for any other
purpose. I/We further agree that my/our loan shall be governed by the rules of FCPL which may be in force from time to
time.
10. I/We am/are aware that the upfront Legal, Technical, Processing fees, other fees and the applicable taxes collected from
me at the time of the application is non-refundable under any circumstances.
11. I/We am/are aware that FCPL does not accept any payment in cash. No payment in connection with the loan 
processing, sanction, disbursement, prepayment and repayment of loan shall be made to / in favour of any of
   FCPL intermediaries or any third party (ies) in cash or bearer cheque or in any other manner whatsoever.
12. No discount/free gift or any other commitment whatsoever has been which is not documented in the loan
agreement by FCPL or any of its authorised representatives.
13. I/We conirm that I/we have no insolvency proceedings initiated/pending against me/us nor have I/we ever been adjudicated insolvent.
14. Politically Exposed Person (PEP) Declaration:
Politically Exposed Persons” (PEPs) are individuals who are or have been entrusted with prominent public functions by a
foreign country, including the Heads of States.`,
{ align: 'justify',  lineGap: 5 }
).moveDown(0.1);

doc.font('Helvetica')
.fontSize(9)
.fillColor("black")

.text(`
/ Governments, senior politicians, senior government or judicial or military of oficers, senior executives of state-owned corporations and important 
Please tick Yes / No:
A.Applicant PEP/Relatives and close Associate of PEP ( ) Yes ( ) No
B.Co-Applicant PEP or Relatives and close Associate of PEP ( ) Yes ( ) No`,
{ align: 'justify',  lineGap: 5 }
).moveDown();


//  // addFooter(doc); 

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(5)

  doc.font('Helvetica')
  .fillColor("black")

.fontSize(9)
.text(`
15. The tenure/repayment/interest/other terms and conditions of the loan are subject to change as a consequence to any 
change in the money market conditions or on account of any other statutory or regulatory requirements or at FCPL 
discretion.   FCPL reserves the right to review and amend the terms of the loan in such manner and to such extent as
it may deem it.
16. I/We hereby declare and conirm if any detail or declaration made by me/us, if found to be false, then FCPL will be entitled to revoke and/or rec.
17. I/We hereby declare and conirm that any purchase by me/us of any insurance product is purely voluntary and is not
linked to availing of any credit facility from FCPL.
18. I/We hereby declare that the details furnished above are true and correct to the best of my/our knowledge and belief and
I/we undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false
or untrue or misleading or misrepresenting, I/we am/are aware that | /we may be held liable for it.
19. That there has never been an award or an adverse judgement or decree in a court case involving breach of contract, tax
malfeasance or other serious misconduct which shall adversely affect my/our ability to repay the loan.
20. I/We have never been a defaulter withFCPL or any other inancial institution.
21. That if any discrepancy is found or observed from the information given above and the documents produced in support 
thereof,  FCPL shall have the sole discretion to cancel the sanction at any stage and recall the loan if already disbursed
,in such an event, the processing fee shall be liable to be forfeited.
22. I/We permitFCPL to contact me/us with respect to the products and services being offered by FCPL or by any other
person (s) and further allowFCPL to cross sell the other products and services offered by such other person(s).
23. I/We further agree to receive SMS alerts/whatsapp/emails/letters etc. related to my/our application status and account
activities as well as product use messages  that FCPL and/or its group companies will send, from time to time on my/our 
mobile no./emails/letters etc as mentioned in this Application Form.
24. I/We conirm that laws in relation to the unsolicited communications referred in 'National Do Not Call Registry' as laid
down by 'Telecom Regulatory Authority of India' will not be applicable for such information/communication to me/us.
26. I/We shall create security and/or furnish guarantee in favour of FCPL as may be required.
27. I hereby submit voluntarily at my own discretion, the physical copy of Aadhaar card/physical e-Aadhaar / masked
Aadhaar / ofline electronic Aadhaar xml as issued by UIDAI (Aadhaar), toFCPL for the purpose of establishing my
identity / address proof.
28. The consent and purpose of collecting Aadhaar has been explained to me in local language.  FCPL has informed me
that my Aadhaar submitted toFCPL herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();




  


  
//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  drawTitletit("CKYC Explicit Consent");

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
    |/We, give my/our consent to download my/our KYC Records from the Central KYC Registry (CKYCR), only for the 
    purpose of veriication of my identity and address from the database of CKYCR Registry.
    I/we understand that my KYC Record includes my/our KYC Records / Personal information such as my/our
    name, address, date of birth / PAN num.
    I/We agree that my / our personal KYC details may be shared with Central KYC Registry or any other competent
    authority. | (we hereby consent to receive information from the Ratnaafin Capital Private Limited / Central
    KYC Registry or any other competent authority through SMS/email on my registered mobile number / e-mail
    address. | also agree that the non-receipt of any such SMS/e-mail shall not make the FCPL liable for any
    loss or damage whatsoever in nature.
    I/We hereby declare that there is no change in existing details and the details provided in CKYCR are updated as
    on date.
    
    Date :- ${allPerameters.date}                                                                                        PLACE:-   ${allPerameters.branchName}

    Applicant's signature                     Co-Applicant's signature                  Guarantor's signature`,
     
  { align: 'justify',  lineGap: 5 }
  ).moveDown();

  drawTitletit("For detailed list of charges & penal charges please visit www.ratnaafin.com");
  doc.moveDown();
  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`TheFCPL's Sales Representative conirms he has: 
    (a) Collected self-attested copies of the above mentioned documents from the customer 
    (b) Not been given any payment in cash, bearer cheque or kind along with or in connection with this Loan application 
    from the customer.
    (c) Informed me/us that service tax and all other statutory taxes, levies including stamp duties and registration
    costs (if any), other fees, commissions, charges as may be applicable will be charged in connection with the loan. 
    (d) Informed me/us that the FCPL will not be liable for loss or delay in receipt of documents.
    (e) Informed me/us at incomplete / defective application will not be processed and the FCPL shall not be responsible in
    any manner for the resulting delay or otherwise. Notwithstanding the afore stated, the submission of loan application
    to the FCPL does not imply automatic approval by the FCPL and the FCPL will decide the quantum of the loan at 
    its sole and absolute discretion. TheFCPL in its sole and absolute discretion may either sanction or reject the
    application for granting the loan. In case of rejection, the FCPL shall communicate the reason for rejection.
    (f) Informed me/us that loan application may be disposed by FCPL within 30 working days of receipt of the same subject 
    to submission of all documents and details as may be required by FCPL in processing the Loan along with the 
    requisite fees. 
    (g) TheFCPL reserves its right to reject the loan application and retain the loan application form along with the
    photograph, information and documents.
  `,
{ align: 'justify',  lineGap: 5 }
);

//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
 (h) Informed to me/us that the FCPL shall have the right to make disclosure of any information relating to me/us including
  personal information, details in relation to loan, defaults, security, etc to the Credit Information Bureau of India 
  (CIBIL) and/or any other governmental/regulatory/statutory or private agency/entity,credit bureau, RBI, the FCPL’s other
  branches / subsidiaries / afiliates/ rating agencies, service providers, other Banks / inancial institutions, any third
  parties, any assigns / potential assignees or transferees, who may need, process and publish the information in such
  manner and through such medium as it may be deemed necessary by the publisher /  FCPL/ RBI, including publishing the 
  name as part of wilful defaulter’s list from time to time, as also use for KYC information veriication, credit risk
  analysis, or for other related purposes.
 (i) Informed & explained me/us all the charges and terms and conditions mentioned overleaf.
 (j) Informed me/us that the FCPL will send the Offer Letter to me/us on the e-mail ID mentioned by me/us in the loan application.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();

doc.font('Helvetica-Bold')
  .fontSize(9)
  .text(`
Do not Sign This Form if its Blank. Please Ensure all relevant sections and documents are completely filled to your satisfaction and then only sign the form 
`,
{ align: 'justify',  lineGap: 5 }
);

function createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsTitle = [500]; // Width for the title row
  const columnWidthsTable = [50, 450]; // Column widths: Sr. No (50), Particulars (450)
  const rowHeight = 20; // Fixed height for rows

  // Draw Table Title 1
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('white')
    .text(tableTitle1, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Title 2
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Header (Table Title 3)
  doc
    .fillColor('#d9d9d9') // Gray background
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('black')
    .text(tableTitle3, startX + 5, startY + 5, { width: columnWidthsTable[0] + columnWidthsTable[1] - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Rows
  tableDatatable.forEach((row, rowIndex) => {
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    const currentRowHeight = rowIndex === 0 ? 30 : rowHeight;


    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], currentRowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += currentRowHeight;
  });
}

const tableTitle1 = "DOCUMENTS CHECKLIST";
const tableTitle2 = "Login Documents";
const tableTitle3 = `Sr. No                                                 Particulars`;
const tableDatatable = [
{ srNo: "1", particulars: "KYC of Borrower and Co-Borrowers/Guarantors (Firm/Company) – PAN Card, COI, MOA, AOA, Udyam Registration Certiicate with Annexures, All Partnership Deed, All LLP Deed, GST Registration Certiicate (3 Pages) (For all states)." },
{ srNo: "2", particulars: "KYC Borrower and Co-Borrowers/Guarantors (Individuals/Proprietor/Partners): PAN Card and Aadhaar Card." },
{ srNo: "3", particulars: "Udyam Registration Certificate of Borrower." },
{ srNo: "4", particulars: "Application Form & CIBIL Consent." },
{ srNo: "5", particulars: "Business and Residence photos." },
{ srNo: "6", particulars: "Electricity Bill / Gas Dairy,Samagra ID (In Madhya Pradesh, the Samagra ID is a unique nine-digit number given to residents)" },
{ srNo: "7", particulars: "All CA/CC Bank Account statement for last 6 Months (In PDF)." },
{ srNo: "8", particulars: "ITR with Computation of Income for last 1 Year (If available)." },
{ srNo: "9", particulars: "Income Proof Documents." },
{ srNo: "10", particulars: "Latest Sanction letter of Existing loans with Statement of Account." },
{ srNo: "11", particulars: "CIBIL Reports of Borrower and Co-Borrowers/Guarantors." },
{ srNo: "12", particulars: "Farm CIBIL (On best effort basis)." },
{ srNo: "13", particulars: "BSV (Bank Signature Verification)." },
{ srNo: "14", particulars: "Legal Report, Technical Report." },
{ srNo: "15", particulars: "PD Report." },
{ srNo: "16", particulars: "FI / RCU / FCU Report." },
{ srNo: "17", particulars: "Property Documents." },
];

createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable);


//  // addFooter(doc); 

  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(1)


 
 
 
  // function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Property Documents" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Title: "Sr. No | Particulars" ===
  //   // Sr. No Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, columnWidths[0], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Sr. No', startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Particulars', startX + columnWidths[0] + 5, startY + 5, {
  //       width: columnWidths[1] - 10,
  //       align: 'left',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 3rd Title: "Gram Panchayat Patta Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableTitles[1], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === Rows with Sr. No and Particulars ===
  //   const rowHeightWithBullets =
  //     tableRow.particulars.length * bulletSpacing > rowHeight
  //       ? tableRow.particulars.length * bulletSpacing
  //       : rowHeight;
  
  //   // Sr. No Column
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableRow.srNo, startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Column with Bullet Points
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   tableRow.particulars.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   startY += rowHeightWithBullets; // Move to the next row
  //       // startY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;

  //   // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Footer background color
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(footerText, startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });

  // }

  function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const rowHeight = 20; // Default row height
    const bulletSpacing = 5; // Minimum spacing for bullet points in "Particulars"

    // === 1st Title: "Property Documents" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black')
        .text(tableTitles[0], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === 2nd Title: "Sr. No | Particulars" ===
    // Sr. No Header
    doc.fillColor('#d9d9d9').rect(startX, startY, columnWidths[0], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Sr. No', startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Header
    doc.fillColor('#d9d9d9').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Particulars', startX + columnWidths[0] + 5, startY + 5, { width: columnWidths[1] - 10, align: 'left' });
    startY += rowHeight;

    // === 3rd Title: "Gram Panchayat Patta Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableTitles[1], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === Rows with Sr. No and Particulars ===
    // Sr. No Column
    const particularsText = tableRow.particulars.join('\n• '); // Combine all bullets
    const particularsHeight = doc.heightOfString(`• ${particularsText}`, { width: columnWidths[1] - 15, align: 'left' });
    const rowHeightWithBullets = Math.max(particularsHeight + 10, rowHeight);

    // Sr. No Column
    doc.fillColor('#ffffff').rect(startX, startY, columnWidths[0], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableRow.srNo, startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Column
    doc.fillColor('#ffffff').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('black')
        .text(`• ${particularsText}`, startX + columnWidths[0] + 10, startY + 5, { width: columnWidths[1] - 15, align: 'left' });

    startY += rowHeightWithBullets;

    // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(footerText, startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
}

  

  

  const tableTitles = [
    "Property Documents",
    "Gram Panchayat Patta Properties",
  ];
  
  const tableRow = {
    srNo: "1",
    particulars: [
      "GP Patta / Ownership Certificate issued from Gram Panchayat office showing possession.",
      "Property Tax receipt.",
      "Mutation in the name of property owner (Jamabandi).",
      "Registered Title in form of Proposed Sale Deed/Co-ownership Deed/release deed/Gift Deed etc.",
      "Any Utility bill.",
      `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility bills, Ration Card, Tax record may be acceptable for possession proof.`,
      "Co-Ownership Deed executed between customer, spouse, son, or daughter is acceptable.",
      "Equitable Mortgage/Registered Mortgage.",
    ],
  };
  
  const footerText = "Nagar Parishad / Nagar Panchayat Properties";
  
  // Call the function
  drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText);

  function drawSingleRowTable(doc, rowData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Spacing between lines of text (line gap)
  
    // === Draw Sr. No Column ===
    const contentHeight = rowData.map((bullet) =>
      doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15, // Width of the "Particulars" column
      })
    );
    const rowHeightWithBullets = contentHeight.reduce((a, b) => a + b, 0) + bulletSpacing * rowData.length;
  
    // Draw Sr. No Cell
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text("1", startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // === Draw Particulars Column with Bullets ===
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    let bulletY = startY + 5;
    rowData.forEach((bullet) => {
      const bulletHeight = doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15,
      });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += bulletHeight + bulletSpacing; // Add spacing after each bullet
    });
  
    // Update Y position for future elements if needed
    return startY + rowHeightWithBullets;
  }
  
  // Sample Data
  const firstRowData = [
    "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
    "Property tax receipt in the name of property owner.",
    "Mutation order in the name of property owner.",
    `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
    bills, Ration Card, Tax record may be acceptable for possession proof.`,
    "NOC to Mortgage.",
    `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
    to be obtained.`,
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  drawSingleRowTable(doc, firstRowData);
  
  // function drawSingleRowTable(doc, rowData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === Draw Sr. No Column ===
  //   const rowHeightWithBullets = 
  //     rowData.length * bulletSpacing > 20 
  //       ? rowData.length * bulletSpacing 
  //       : 20; // Dynamic height based on content
  
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text("1", startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // === Draw Particulars Column with Dotted Data ===
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   rowData.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   // Update Y position for future elements if needed
  //   return startY + rowHeightWithBullets;
  // }
  
  
  
  // const firstRowData = [
  //   "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
  //   "Property tax receipt in the name of property owner.",
  //   "Mutation order in the name of property owner.",
  //   `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
  //    bills, Ration Card, Tax record may be acceptable for possession proof.`,
  //   "NOC to Mortgage",
  //   `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
  //    to be obtained.`,
  //   "Equitable Mortgage/Registered Mortgage",
  // ];
  
  // drawSingleRowTable(doc, firstRowData);
  

  // function drawCustomTableWithFooter1(doc, tableTitles1, tableRow, secondRowData, footerData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Municipal Corporation Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles1[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Row: Data in Two Columns ===
  //   secondRowData.forEach((item, index) => {
  //     // Sr. No Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX, startY, columnWidths[0], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(9)
  //       .fillColor('black')
  //       .text(index + 1, startX + 5, startY + 5, {
  //         width: columnWidths[0] - 10,
  //         align: 'center',
  //       });
  
  //     // Particulars Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(item, startX + columnWidths[0] + 5, startY + 5, {
  //         width: columnWidths[1] - 10,
  //         align: 'left',
  //       });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // === 3rd Title/Footer: Bullet Points ===
  //   footerData.forEach((footerItem) => {
  //     const footerHeight =
  //       footerItem.length * bulletSpacing > rowHeight
  //         ? footerItem.length * bulletSpacing
  //         : rowHeight;
  
  //     // Footer Section
  //     doc
  //       .fillColor('#ffffff') // White background for footer
  //       .rect(startX, startY, tableWidth, footerHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     let bulletY = startY + 5;
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${footerItem}`, startX + 5, bulletY, {
  //         width: tableWidth - 10,
  //         align: 'left',
  //       });
  
  //     startY += footerHeight; // Move to the next section
  //   });
  // }

  function drawCustomTableWithFooter1(doc, title, secondRowData, footerData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Line spacing for text in "Particulars"
  
    // === Title: "Municipal Corporation Properties" ===
    const titleHeight = 20; // Fixed height for title row
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, titleHeight)
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('black')
      .text(title, startX + 5, startY + 5, {
        width: tableWidth - 10,
        align: 'center',
      });
  
    startY += titleHeight; // Move to the next row
  
    // === Content: "Sr. No | Particulars" ===
    // Calculate the height of the "Particulars" content
    let contentHeight = secondRowData.reduce((totalHeight, bullet) => {
      return totalHeight + doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    }, 10); // Add padding
  
    // Sr. No Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], contentHeight)
      .strokeColor('black')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text('1', startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // Particulars Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], contentHeight)
      .strokeColor('black')
      .stroke();
  
    // Render each bullet point in "Particulars"
    let bulletY = startY + 5;
    secondRowData.forEach((bullet) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    });
  
    startY += contentHeight; // Move to the next section
  
    // === Footer Section ===
    const footerHeight = footerData.reduce((totalHeight, line) => {
      return totalHeight + doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    }, 10);
  
    // Footer Background
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, footerHeight)
      .fill()
      .strokeColor('black')
      .stroke();
  
    // Render each line in the footer
    let footerY = startY + 5;
    footerData.forEach((line) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${line}`, startX + 10, footerY, {
          width: tableWidth - 20,
          align: 'left',
          lineGap: 2,
        });
      footerY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    });
  }
  
  // Sample Data
  const secondRowData = [
    "Last 13 Years Complete Chain documents, i.e. Khasra / Notarized agreement / Sale Deed / Gift Deed / Co-ownership Deed.",
    "Architect plan/Site plan to be collected.",
    "Mutation in the name of Property owner.",
    "Latest property tax receipt.",
    "5-year-old Electricity bill in the name of seller/customer (to evidence possession) also Voter ID Card, any utility Bills, Ration card, and Tax record may be acceptable for possession proof.",
    "Indemnity from borrower.",
    "Latest registered title document shall be Sale deed / Gift deed / Co-ownership deed in case prior title document is not registered (e.g., notary/Khasra).",
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  const footerData = [
    "Legal opinion report of the property should state 'clear & marketable' and SARFAESI is applicable as issued by empanelled advocate.",
  ];
  
  // Call the function with the appropriate data
  drawCustomTableWithFooter1(doc, 'Municipal Corporation Properties', secondRowData, footerData);
//  // addFooter(doc); 

  
    
      doc.addPage();
    

function createChecklistTablet(doc, tableTitle, tableTitle2, tableData) {
  // Check if tableData is defined and an array
  if (!Array.isArray(tableData)) {
    console.error("tableData is not an array or is undefined");
    return;
  }

  // Initial configurations
  const startX = 50; // Starting X position for table
  let startY = doc.y + 10; // Starting Y position

  const rowHeight = 20;
  const rowHeightDefault = 20; // Default row height
  const columnWidthsTable = [50, 450]; // Widths for Sr. No and Particulars
  const columnWidthsTitle = [500]; // Width for the title row

  // Add Main Table Title (tableTitle)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('white')
    .text(tableTitle, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  startY += rowHeight;

  // Add Subtitle (tableTitle2)
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'left' });

  startY += rowHeight;

  // Draw Table Rows for `tableData`
  tableData.forEach((row, rowIndex) => {

    let rowHeight = rowIndex === 9? 30 : rowHeightDefault; // Increase height for row 3 (index 2)
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += rowHeight;
    doc.moveDown()

  });

}


const tableTitleT = "Disbursement DOCUMENTS";
const tableTitleT2 = `Sr. No                                                 Particulars`;
const tableDatatableT = [
  { srNo: "1", particulars: "Self-Attested KYC of Borrowers and Co-borrower." },
  { srNo: "2", particulars: "Self-Attested Udyam Registration Certiicate of Borrower." },
  { srNo: "3", particulars: "Sanction Letter signed by Borrower and Co-borrowers." },
  { srNo: "4", particulars: "NACH with Sign and Stamp / E-Nach Registeration." },
  { srNo: "5", particulars: "In case, Borrower is Partnership Firm or Company, Signed KYC of Borrower." },
  { srNo: "6", particulars: `5 UDC from Borrower and 2 UDC of Co-borrowers/Guarantors as per the Sanction Letter along with UDC Covering Letter.` },
  { srNo: "7", particulars: "Customer Disbursement Request form." },
  { srNo: "8", particulars: "Dual Declaration Form (If any )." },
  { srNo: "9", particulars: "Signed Personal Gaurantee Deed (If any )." },
  { srNo: "10", particulars: `Loan Agreement (MITC, Schedule, Insurance Form, Annexure 1, End Use Undertaking, DPN, Vernacular Language Declaration.\n\n` },
  { srNo: "11", particulars: "Sigend Sale deed / Gift Deed / Release deed / Co- ownership Deed." },
  { srNo: "12", particulars: "Signed Registered Mortgage / Equitable Mortgage Deed." },
  { srNo: "13", particulars: "Vetting Report." },
  { srNo: "14", particulars: "Revised Legal." },
  { srNo: "15", particulars: "FI and RCU Report." },
  { srNo: "16", particulars: "Insurance Form." },
  { srNo: "17", particulars: "Veterinary Doctor Certiicate (If applicable)." },
];


function drawTitletitt(sectionTitle) {

  const titleHeight = 20;  
  const titleX = 48; 
  const titleWidth = doc.page.width - 2 * titleX; 
  
  const startY = doc.y;  
  const titleBackgroundColor = "#0066B1";  
  
  doc.rect(titleX, startY, titleWidth, titleHeight)
    .fill(titleBackgroundColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();
  
  doc.font(fontBold)
    .fontSize(12)
    .fillColor("white")
    .text(sectionTitle, titleX + 5, startY + 5, {
      align: "center",
      width: titleWidth - 10,  
    });

 
}
createChecklistTablet(doc, tableTitleT, tableTitleT2, tableDatatableT);

drawTitletitt("MOST IMPORTANT INFORMATION (Adhar Consent)");

doc.font('Helvetica')
.fillColor("black")

  .fontSize(9)
  .text(`
I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company
here with shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. 
The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in 
accordance with the applicable law.
I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained
me in vernacular (the language known to me):
i) the purpose and the uses of collecting Aadhaar.
ii) the nature of information that may be shared upon ofline verification.
iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter’s ID, driving
license, etc.).
I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
its oficials responsible in case of any incorrect / false information or forged document provided by me.
This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
respect of the submission of his/her Aadhaar.
Date:-${allPerameters.date}
place:-${allPerameters.branchName}
  `,
{ align: 'justify',  lineGap: 5 }
);

// // addFooter(doc); 
addFooter1(doc);


// doc.addPage();
// // drawBorder()
//   //   // addLogo(doc);(doc);(doc);
// doc.moveDown(6)

// doc.font('Helvetica')
//   .fontSize(9)
//   .text(`
// I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
//  its oficials responsible in case of any incorrect / false information or forged document provided by me.

// This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
//  respect of the submission of his/her Aadhaar.

// Date:-

// place:-
//   `,
// { align: 'justify',  lineGap: 5 }
// );




// // Call the function with the PDF document and table data

// // Finalize the document (assuming you are writing to a file or streaming it)

  
  

  


// //  // addFooter(doc); 
//   addFooter1(doc);
  doc.end();

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // const objData = {
  //     fileName: pdfFileUrl,
  //     file: doc.toString('base64')
  // }
  // await initESign(objData)

  // return new Promise((resolve, reject) => {
  //     stream.on("finish", () => {
  //       resolve(pdfFileUrl);
  //     });
  //     stream.on("error", reject);
  //   });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

}

async function growpdf2(allPerameters,skipPages) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));


  function  addLogo() {
    // doc.moveDown(-5)
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });

    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }

  function addWatermark(doc) {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      //   doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { fit: [450, 400], opacity: 0.05 });
      doc.restore();
    }
    //  else {
    //   console.error(`Logo file not found at: ${watermarklogo}`);
    // }
  }

  function addFooter1(doc) {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;

    doc.font(fontBold).fontSize(6.3).fillColor("#324e98").text("Fin Coopers Capital Pvt Ltd", pageWidth, pageHeight - 80, { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", { align: "center", });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("CIN: 67120MP1994PTC008686", { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Phone: +91 7374911911 | Email: info@fincoopers.com", { align: "center",link: "tel:7374911911",link: "mailto:info@fincoopers.com", // Make it clickable
  });

    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor("#324e98").lineWidth(1).stroke();
  }
  
  
 // ../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png
  // const pdfLogos = path.join( __dirname,"../../../../../assets/image/ratnaLogo.png");
  
  // function addFooter(doc) {
  //   // PDF dimensions
  //   const pageWidth = doc.page.width; 
  //   const pageHeight = doc.page.height; 
  
  //   // Add logo at the bottom-right corner
  //   if (fs.existsSync(pdfLogos)) {
  //     const logoWidth = 40; 
  //     const logoHeight = 25; 
  
  //     doc.image(pdfLogos, pageWidth - logoWidth - 10, pageHeight - logoHeight - 10, {
  //       fit: [logoWidth, logoHeight],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${pdfLogos}`);
  //   }
  // }
  
  

  // const pdfFilename = `NEWApplicantConditions.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);
  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

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

  // doc.pipe(stream);

  //   drawBorder(doc);
  addLogo(doc);
  doc.moveDown(4);
  doc.fontSize(9).font(fontBold).fillColor('#00BFFF').text("LOAN APPLICATION FORM",{ align: "center" });


  doc.moveDown(1);
  doc.fontSize(8).font(fontBold).fillColor('#000000.').text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All fields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                                  ${allPerameters.date}`, { align: "left" ,continued:true});
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "right" });
  // I have to move down here
  doc.moveDown(1);


  // for sectionA//

  function drawTable(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;
  
    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowHeight = 20; // Default row height
  
    // Set fixed column widths
    const columnWidths = [150, 350, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#0066B1"; // Light blue background color#00BFFF. 0066B1
  
    // Draw the special row with background color
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .fill(specialRowColor)
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();
  
    // Add black border around the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .strokeColor("#000000") // Black border
      .lineWidth(1)
      .stroke();
  
    // Add text inside the special row
    doc.font(fontBold)
      .fontSize(10)
      .fillColor("white")
      .text(specialRowText, startX + 5, startY + 8);
  
    // Move the Y position down after the special row
    startY += specialRowHeight;
  
    // Draw the actual table rows
    data.forEach((row) => {
      const minRowHeight = 20;
      const extraHeightPerLine = 3;  // Additional height for each line of overflow
  
      // Calculate the height needed for the cell content
      const keyTextHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, fontSize: 8 });
      const valueTextHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, fontSize: 8 });
  
      // Determine the number of lines based on text height and base line height (e.g., 10 per line)
      const keyLines = Math.ceil(keyTextHeight / 10);
      const valueLines = Math.ceil(valueTextHeight / 10);
  
      // Calculate extra height if content requires more lines than default row height
      const extraHeight = (Math.max(keyLines, valueLines) - 1) * extraHeightPerLine;
  
      // Use the maximum height needed for either cell content or the minimum row height plus extra height
      const cellHeight = Math.max(keyTextHeight, valueTextHeight, minRowHeight) + extraHeight;
  
      // Draw key cell border
      doc.rect(startX, startY, columnWidths[0], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Draw value cell border
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000")
        .text(row.key, startX + 5, startY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
  
      // Check if this row should display a checkbox with or without a checkmark
      if (row.key === "Same as Communication address") {
        const checkboxX = startX + columnWidths[0] + 10;
        const checkboxY = startY + 5;
  
        // Draw checkbox border
        doc.rect(checkboxX, checkboxY, 10, 10).stroke();
  
        // Draw checkmark if the value is "YES"
        if (row.value === "YES") {
          doc.moveTo(checkboxX + 2, checkboxY + 5)
            .lineTo(checkboxX + 5, checkboxY + 8)
            .lineTo(checkboxX + 8, checkboxY + 2)
            .strokeColor("black")
            .stroke();
        }
      } else {
        // Add text to the value cell (wrapped if necessary)
        doc.text(row.value, startX + columnWidths[0] + 15, startY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
  
      // Move startY down by the height of the current cell for the next row
      startY += cellHeight;
    });
  }
  



  function drawComplexTable(headers, data, sectionA, sectionB, footerNote, fontSize = 7, borderWidth = 0.5) {
    doc.moveDown(2);

    // Title with customizable font size
    doc.font(fontBold)
        .fontSize(10)
        .text("1. MOST IMPORTANT INFORMATION", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(8)
        .text("Attention: PLEASE READ CAREFULLY BEFORE SIGNING ACKNOWLEDGEMENT FORM", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(fontSize)
        .text(`I/We refer to application Sr. No dated submitted by me/us to Fin Coopers Capital Pvt Ltd.. I/We have been provided the
following information and have accordingly filled up the aforesaid form.`);
    doc.moveDown(0.5);

    // Helper function to draw rows with customizable font size and border width
    const drawTableRow = (doc, x, y, row, colWidths, height, fontSize, borderWidth, borderColor = 'black') => {
        let currentX = x;

        if (row[0] === "Pre-EMI (Rs.)" || row[0] === "EMI (Rs.)" || row[0] === "Type of transaction") {
            const labelWidth = colWidths[0];
            const valueWidth = colWidths.reduce((sum, width) => sum + width, 0) - labelWidth;

            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, labelWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[0], currentX + 5, y + 5, { width: labelWidth - 10, align: "center" });

            currentX += labelWidth;
            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, valueWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[1], currentX + 5, y + 5, { width: valueWidth - 10, align: "center", lineBreak: true });
        } else {
            row.forEach((text, i) => {
                const cellWidth = colWidths[i];
                doc
                    .lineWidth(borderWidth)
                    .strokeColor(borderColor)
                    .rect(currentX, y, cellWidth, height)
                    .stroke()
                    .fontSize(fontSize) // Set font size dynamically
                    .text(text, currentX + 5, y + 5, { width: cellWidth - 10, align: "center", lineBreak: true });
                currentX += cellWidth;
            });
        }
    };

    // Set up table coordinates
    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [120, 120, 120, 120]; // Fixed column widths

    // Dynamically adjust row height based on data length
    const dataLength = data.length;
    // //console.log(dataLength);
    const rowHeight = dataLength >9 ? 35 : 23; // If more than 7 rows, increase height

    // Draw the header
    drawTableRow(doc, tableX, tableY, headers, colWidths, rowHeight, fontSize, borderWidth, 'black');
    
    // Draw data rows
    let currentY = tableY + rowHeight;
    data.forEach((row) => {
      drawTableRow(doc, tableX, currentY, row, colWidths, rowHeight, fontSize, borderWidth, 'black');
      currentY += rowHeight;
    });

    // Section A
    const sectionAStartY = currentY; // Directly connect to the data rows
    const sectionWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const sectionX = tableX;

    doc.rect(sectionX, sectionAStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("  A. Loan Processing Fee", sectionX + 2, sectionAStartY + 10, { align: "center" });
    currentY = sectionAStartY + 30; // Update currentY after section header

    sectionA.forEach((row) => {
        drawTableRow(doc, sectionX, currentY, row, colWidths, rowHeight, fontSize, borderWidth);
        currentY += rowHeight;
    });

    // Section B - Increase row height for Section B data only
    const sectionBStartY = currentY; // Directly connect to Section A
    doc.rect(sectionX, sectionBStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("B. Part Prepayment / Foreclosure Charges", sectionX + 5, sectionBStartY + 10, { align: "center" });
    currentY = sectionBStartY + 30; // Update currentY after section header

    sectionB.forEach((row, index) => {
        // Increase row height specifically for Section B rows
        const sectionBRowHeight = 50; // Increase the height for Section B rows
        drawTableRow(doc, sectionX, currentY, row, colWidths, sectionBRowHeight, fontSize, borderWidth);
        currentY += sectionBRowHeight; // Update Y for next row
    });

    // Footer Note (connect directly after Section B)
    const footerStartY = currentY; // No extra space before footer
    const footerHeight = 38;
    doc.rect(sectionX, footerStartY, sectionWidth, footerHeight).stroke();
    doc.fontSize(8)
        .font(fontBold)
        .text(footerNote, sectionX + 5, footerStartY + 10, { width: sectionWidth - 10, align: "left" });
}

 /// make a function Singnature //
  function createSignatureTablePDF(data, marginX = 40, marginY = 100) {
    // Table settings with customizable margins
    const startX = 40; // X position based on left margin
    const startY = doc.y; // Y position based on top margin
    const cellWidth = 130; // Width of each cell
    const minCellHeight = 15; // Minimum cell height
  
    // Set table color and line thickness
    doc.strokeColor('black').lineWidth(0.5); // Set line color to black and line thickness to 1.2
  
    // Draw header row (blank cells)
    for (let i = 0; i < 4; i++) {
      const x = startX + i * cellWidth;
      doc.rect(x, startY, cellWidth, minCellHeight).stroke(); // Draws a blank cell
    }
  
    // Draw content row and add data below the header row
    data.forEach((text, index) => {
      const x = startX + index * cellWidth;
      const textHeight = doc.fontSize(6).heightOfString(text, { width: cellWidth - 10 });
      const cellHeight = Math.max(textHeight + 20, minCellHeight); // Set cell height based on text height, with padding
  
      const y = startY + minCellHeight; // Move down by one cell height for content row
  
      // Draw the cell border
      doc.rect(x, y, cellWidth, cellHeight).stroke();
  
      // Add text to the cell, with padding
      doc.font('Helvetica-Bold').fontSize(6)
      .text(text, x + 5, y + 10, { width: cellWidth - 10, align: 'center' });
    });
  }

  function createDocumentsRequiredTable(data) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 55; // Defined margin from the border
    const padding = 5; // Padding inside cells
    const minColumnWidth = 200; // Minimum width for the columns

    // Calculate available width for the table based on the margins
    const availableWidth = pageWidth - 2 * margin;

    // Set column widths as 40% for the left column and 60% for the right column
    let cellWidth1 = Math.max(availableWidth * 0.4, minColumnWidth); // 40% for document name
    let cellWidth2 = Math.max(availableWidth * 0.6, minColumnWidth); // 60% for document details

    // const startX = margin + 10; // Start X position inside the margin
    // const startY = margin + 40; // Start Y position inside the margin, accounting for some space for the header

    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position

    // Set table color and line thickness
    doc.strokeColor('#20211A').lineWidth(0.2);

    // Draw the header row (DOCUMENTS REQUIRED)
    doc.rect(startX, startY, cellWidth1 + cellWidth2, 20).stroke(); // Use a fixed height for the header
    doc.fontSize(12).text('DOCUMENTS REQUIRED', startX + padding, startY + padding, { align: 'center' });

    let currentY = startY + 20; // Set the Y position after the header

    // Loop through the data and create table rows
    data.forEach(item => {
        // Calculate the height of each column's content
        const docNameHeight = doc.heightOfString(item.documentName);
        const docDetailsHeight = doc.heightOfString(item.documentDetails);

        // Choose the maximum height between the two columns
        const rowHeight = Math.max(docNameHeight, docDetailsHeight) + 2 * padding; // Adding padding for spacing

        // Draw the border around the row
        doc.rect(startX, currentY, cellWidth1 + cellWidth2, rowHeight).stroke();

        // Draw a border between the two columns
        doc.moveTo(startX + cellWidth1, currentY).lineTo(startX + cellWidth1, currentY + rowHeight).stroke();

        // Draw the document name in the left column
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text(item.documentName, startX + padding, currentY + padding, { align: 'left', width: cellWidth1 - 2 * padding, lineBreak: true });

        // Draw the document details in the right column
        doc.fontSize(8)
           .font('Helvetica')
           .text(item.documentDetails, startX + cellWidth1 + padding, currentY + padding, { align: 'left', width: cellWidth2 - 2 * padding, lineBreak: true });

        // Move to the next row based on the calculated row height
        currentY += rowHeight;
    });

    // Draw a footer row for the "Note" section (connected with the previous row)
    const noteHeight = doc.heightOfString('Note: Documents relating to beneficial owners, office bearers...') + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text('Note: Documents relating to beneficial owners, office bearers...', startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const rowHeight = 20; // Default row height
    const columnWidths = [200, 200]; // Key and Value columns
    const imageWidth = 100; // Width for the image cell
    const totalWidth = columnWidths[0] + columnWidths[1] + imageWidth;

  // Draw the special row at the top of the table (Loan Details)
  const specialRowHeight = 20; // Height of the special row
  const specialRowText = `${sectionTitle}`; // Text for the special row
  const specialRowColor = "#00BFFF"; // Light blue background color

  // Draw the special row with background color
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .fill(specialRowColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();

  // Add black border around the special row
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .strokeColor("#000000") // Black border
    .lineWidth(1)
    .stroke();

  // Add text inside the special row
  doc.font(fontBold)
    .fontSize(10)
    .fillColor("black")
    .text(specialRowText, startX + 5, startY + 8);


    // Adjust `startY` to begin the table rows after the header row
    startY += rowHeight;

    // Calculate rows for image spanning
    const imageSpanRows = 5; // Number of rows the image spans
    const imageHeight = imageSpanRows * rowHeight; // Total height for the image cell

    // Draw table rows
    data.forEach((row, index) => {
      const rowY = startY + index * rowHeight; // Calculate row position
      if (index < imageSpanRows) {
        // Rows with the image column
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke()

        doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
          .strokeColor("black")

          .lineWidth(1)
          .stroke();

        // Add text for Key and Value columns
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: columnWidths[1] - 10,
          });

        // Draw the image column in the first row of the image span
        if (index === 0) {
          doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();

          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
              fit: [imageWidth - 10, imageHeight - 10], // Adjust image size with padding
            });
          } else {
            doc.font(fontBold)
              .fontSize(10)
              .fillColor("#ff0000") // Red text
              .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
          }
        }
      } else {
        // Rows after the image span, merge `Value` and `Image` columns
        const fullValueWidth = columnWidths[1] + imageWidth;

        // Draw Key cell
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Draw merged Value cell
        doc.rect(startX + columnWidths[0], rowY, fullValueWidth, rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Add Key and Value text
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: fullValueWidth - 10,
          });
      }
    });
  }

  function drawNewPage(data) {
    let datavalue = Array.isArray(data) ? data : [data];
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    // // Draw the section title with a colored background (same as original)
    // doc.rect(titleX, doc.y, titleWidth, titleHeight)
    //   .fill("#00BFFF")  // Color for the section title (same as before)
    //   .strokeColor("#20211A") // Black border for the title
    //   .lineWidth(1)
    //   .stroke();

    // doc.font(fontBold)
    //   .fontSize(11)
    //   .fillColor("#20211A")
    //   .text(sectionTitle, titleX + 3, doc.y + 6);



    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position
    const rowHeight = 20; // Height of each row
    const columnWidths = [250, 300, 70]; // Column widths

    // Draw table rows
    datavalue.forEach((row, index) => {
      const rowY = startY + index * rowHeight;


      // Draw background fill for the row (without covering borders)
      doc.rect(startX, rowY, columnWidths[0] + columnWidths[0], rowHeight)
      // .fillColor(fillColor)
      // .fill();

      // Draw key cell border
      doc.rect(startX, rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Draw value cell border
      doc.rect(startX + columnWidths[0], rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000") // No background fill, just the text color
        .text(row.key, startX + 5, rowY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
      // Check if this row should display a checkbox
      if (row.key === "Same as Communication address") {
        if (row.value === "YES") {
          // Draw a checked checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke(); // Draw checkbox border
          doc.moveTo(startX + columnWidths[0] + 12, rowY + 10)
            .lineTo(startX + columnWidths[0] + 15, rowY + 13)
            .lineTo(startX + columnWidths[0] + 20, rowY + 7)
            .stroke(); // Draw checkmark
        } else {
          // Draw an empty checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
        }
      } else {
        // Add text to the value cell
        doc.text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
    });


    // Move down after drawing the table
    doc.moveDown(data.length * 0.1 + 1);
  }


  // First Page //
  // Generate the PDF content
  //   //   // addLogo(doc);(doc);(doc);
  addWatermark(doc);
  // drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value:`${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    { key: "Loan Purpose", value:`${allPerameters.loanPurpose}`},
    { key: "Loan Type", value:`${allPerameters.loanType}` },
  ];
  drawTable("Loan Details", loanDetails);
  doc.moveDown()

  // function createStyledTable(doc, headers, tableData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidths = [150, 100, 150, 100]; // Column widths
  //   const rowHeight = 20; // Fixed row height
  //   const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
  //   // Draw headers
  //   doc
  //     .fillColor('#00BFFF') // Blue header background
  //     .rect(startX, startY, tableWidth, rowHeight) // Header rectangle
  //     .fill()
  //     .fillColor('black') // White text for headers
  //     .font('Helvetica-Bold')
  //     .fontSize(8);
  
  //   headers.forEach((header, colIndex) => {
  //     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  //     doc.text(header, cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //   });
  
  //   // Move to the next row (data rows)
  //   startY += rowHeight;
  
  //   tableData.forEach((row, rowIndex) => {
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, tableWidth, rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border
  //   doc
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, doc.y + 10, tableWidth, startY - doc.y - 10)
  //     .stroke();
  // }
  
  // Example usage
  function createStyledTable(doc, headers, tableData, isHeaderBoxed = false) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidths = [150, 100, 150, 100]; // Column widths
    const rowHeight = 20; // Fixed row height
    const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
    // Draw header as a full box with proper borders
    if (isHeaderBoxed) {
      // Draw a black-bordered rectangle for the header
      doc
        .lineWidth(1) // Black border thickness
        .strokeColor('black') // Black border color
        .fillColor('#0066B1') // Blue background for the header
        .rect(startX, startY, tableWidth, rowHeight) // Rectangle enclosing header
        .fillAndStroke(); // Fill the background and stroke the border
  
      // Draw the header text inside the box
      doc
        .fillColor('white') // Black text color
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(headers[0], startX + 5, startY + 5, {
          width: tableWidth - 10, // Center text within the header box
          align: 'left',
        });
  
      startY += rowHeight; // Move to the next row
    }
  
    // Draw table rows
    tableData.forEach((row, rowIndex) => {
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, tableWidth, rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  
    // Draw the outer border for the entire table
    // doc
    //   .lineWidth(0.5)
    //   .strokeColor('black')
    //   .rect(startX, doc.y + 10, tableWidth, startY - (doc.y + 10))
    //   .stroke();
  }
  const headers1 = ['Product Details'];
  const tableData1 = [
    { col1: 'Business Loan', col2: 'NA', col3: 'Personal Loan', col4: 'NA' },
    { col1: 'Working Capital Term Loan/Business Loan Secured', col2: 'NA', col3: 'Home Loan', col4: 'NA' },
    { col1: 'Loan Against Property/Shed Purchase', col2: 'MICRO LAP', col3: 'Others', col4: 'NA' },
  ];
  
  const headers2 = ['Product Program Details'];
  const tableData2 = [
    { col1: 'Industry Type', col2: 'NA', col3: 'Sub Industry Type', col4: 'NA' },
    { col1: 'Product Type', col2: 'MICRO LAP', col3: 'Secured/Unsecured', col4: 'SECURED' },
    { col1: 'Property Value', col2: 'NA', col3: 'BT EMI Value', col4: 'NA' },
    { col1: 'Program', col2: 'NA', col3: '', col4: '' },
  ];
  
  // Draw tables
  createStyledTable(doc, headers1, tableData1,true);
  doc.moveDown()

  createStyledTable(doc, headers2, tableData2,true);
  
  // Sourcing Details Section

//   const sourcingDetails = [{
//     key:`Sourcing Type`,
//     value: `${allPerameters.sourceType}` || "NA",

//   }, {
//     key: "Gen Partner Name",
//     value: allPerameters.genPartnerName || "NA",
//   }, {
//     key: "Sourcing Agent Name : ",
//     value: allPerameters.sourcingAgentName || "NA",
//   }, {
//     key: "Sourcing Agent Code : ",
//     value: allPerameters.sourcingAgentCode || "NA",
//   }, {
//     key: "Sourcing Agent Location : ",
//     value: allPerameters.sourcingAgentLocation || "NA",
//   }, {
//     key: "Sourcing RM Name : ",
//     value: allPerameters.sourcingRMName || "NA",
//   }, {
//     key: "Sourcing RM Code : ",
//     value: allPerameters.sourcingRMCode || "NA",
//   }]

//   drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
//   const productProgramDetails = [
//     { key: "Industry Type", value: "FIN COOPERS" },
//     { key: "Sub Industry Type", value: "FIN COOPERS" },
//     { key: "Product Type", value: "SECURED" },
//     { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
//     { key: "Secured/Un-Secured", value: "SECURED" },
//     { key: "Property Value", value: "Rs. 500000" },
//     { key: "BT EMI Value", value: "NA" },
//   ];
//   drawTable("Product Program Details", productProgramDetails);
//  addFooter(doc);
    //   // addLogo(doc);(doc);(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  // doc.moveDown(2)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });



 
  





//original working code

function drawTablenewW(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}







// function drawTablenew(sectionTitle, data, imagePath) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   // const startX = 49;
//   const startX = titleX;

//   let startY = doc.y + titleHeight;
//   const rowHeight = 20;
//   // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//   const columnWidthsFirst5 = [125, 275]; // Two-column layout

//   const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//   const imageWidth = 100;
//   const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//   // Special row for section title
//   doc.rect(startX, startY, titleWidth, rowHeight)
//      .fill("#00BFFF")
//      .strokeColor("black")
//      .lineWidth(1)
//      .stroke();

//   doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//      .text(sectionTitle, startX + 5, startY + 8);
  
//   startY += rowHeight;

//   const imageSpanRows = 5;
//   const imageHeight = imageSpanRows * rowHeight;

//   data.forEach((row, index) => {
//       const rowY = startY + index * rowHeight;
      
//       if (index < 5) {
//         const columnWidths = columnWidthsFirst5;

//           // First 5 rows: two-column layout + image
//           doc.rect(startX, rowY, columnWidths[0], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//           if (index === 0) {
//               doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();

//               if (fs.existsSync(imagePath)) {
//                   doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                       fit: [imageWidth - 10, imageHeight - 10]
//                   });
//               } else {
//                   doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                      .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//               }
//           }
//       } else if (index === 5 || index === 7) {
//           // 6th and 8th row transition to 4-column layout
//           columnWidths[0] = columnWidths[1] = 125;

//           // Draw four cells for these rows
//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       } else {
//           // 7th row and beyond: four-column layout without image
//           columnWidths[0] = columnWidths[1] = 125;

//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       }
//   });
// }




  
 
const applicantDetailsData = [
  // First 5 rows - 2 columns with key-value pairs Applicant Mother's Name
  { key: "Applicant Type", value: `${allPerameters.appType}` },
  { key: "Business Type", value: `${allPerameters.buisnessType}` },
  { key: "Applicant Name", value: `${allPerameters.borrowerName}`},
  { key: "Applicant Father's/Spouse Name", value: `${allPerameters.appFather}` },
  { key: "Applicant Mother's Name.", value: `${allPerameters.appMother}` },

  { key1: "Mobile No.", value1: `${allPerameters.appMob1}`, key2: "Mobile No2.", value2: `${allPerameters.appMob2}` },

  // Row 6 - 4 columns
  { key1: "Email ID", value1: `${allPerameters.appEmail}` },

  // Row 7 - 2 columns with key-value pair
  { key1: "Educational Details", value1:`${allPerameters.appEdu}`, key2: "Religion", value2: `${allPerameters.appReligion}`},

  // Row 8 - 4 columns
  { key1: "Date Of Birth/Incorporation", value1:`${allPerameters.appDOB}`, key2: "Nationality", value2: `${allPerameters.appNationality}` },

  // Remaining rows - 4 columns layout
  { key1: "Gender", value1: `${allPerameters.appGender}`, key2: "Category", value2: `${allPerameters.appCategory}` },
  { key1: "Marital Status", value1: `${allPerameters.appMaritalStatus}`, key2: "No. of Dependents", value2: `${allPerameters.appNoOfDependentd}`},
  { key1: "Pan Number", value1: `${allPerameters.appPan}`, key2: "Voter Id Number ", value2: `${allPerameters.AppVoterId}` },
  { key1: "Aadhar Number", value1: `${allPerameters.appAdhar}`, key2: "Udyam Number", value2: `${allPerameters.appUshyamAdharNumber}`},
  // { key1: "Aadhar Number", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];




// //console.log("Applicant Details Data:", applicantDetailsData);
// const imagePath = "./uploads/applicant_photo.jpg";

const saveImageLocally = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "applicant_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};

// (async () => {
  const imagePath = await saveImageLocally(`${allPerameters.appImage}`);
// const imagePath = path.join(__dirname, `../../../../..${allPerameters.appImage}`);


const sectionTitle = "Applicant Details";
drawTablenew(sectionTitle, applicantDetailsData, imagePath);


  // drawTablenew(doc, applicantDetails,"Guarantor Details", imagelogo);
  // drawTablenew(doc, applicantDetails, imagelogo,"Applicant Details");

  doc.moveDown()

  
//   drawTablenew(doc, "Co-Applicant Details", applicantDetails, imagelogo);
function createStyledTable1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}



  const title = [" Present/Communication Address"]; // For the first row
const tableData = [
  { col1: "Address as per Aadhar ", col2: `${allPerameters.loacalAdharAdress}` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.localCity}` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.localDistrict}`, col3: "State", col4: `${allPerameters.loacalState}` },
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code ", col4: `${allPerameters.localPin}` },
  { col1: "Present Address is ", col2: `${allPerameters.appResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.AppYearsAtCureentAdress}` },

];
createStyledTable1(doc, title, tableData);
doc.moveDown(3)


  
  function createCustomTableWithCheckbox(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }

  const title1 = "Permanent Address"; // Table header
const tableDatacheck = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.appadharadress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.appCityName}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.appdistrict}`, col3: "State", col4: `${allPerameters.AppState}`}, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code", col4:`${allPerameters.AppPin}`}, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.appResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckbox(doc, title1, tableDatacheck);
  // drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
//  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)




function createStyledTableocc2(doc, titlet, tableDatat) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlet, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatat.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlet = ["Employement/Business Details"]; // For the first row
const tableDatat = [
  { col1: "Occupation ", col2: `${allPerameters.occupation}  `, col3: "Monthly Income", col4: `${allPerameters.monthlyIncome}  ` }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: `${allPerameters.isSelfEmployed}  `, col3: "Other Income", col4: `${allPerameters.otherIncome}  ` },
  { col1: "Firm Name M/S ", col2: `${allPerameters.firstName}  ` }, // First row (2 columns)
  { col1: "Type of Firm", col2: `${allPerameters.firmType}  `, col3: "Nature of Business ", col4: `${allPerameters.natureBuisness}` },
  { col1: "MSME Classification ", col2: `${allPerameters.msmeClassification}  `, col3: "UDYAM Registration No./Udyog Adhar", col4: `${allPerameters.appudhyam}  ` },

];

createStyledTableocc2(doc, titlet, tableDatat);

function createStyledTablereg(doc, titlereg, tableDatareg) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg = ["Registered Address of the Entity"]; // For the first row
const tableDatareg = [
  { col1: "Address ", col2: `${allPerameters.entityAdress}  ` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.entityLandmark}  `, col3: "Name of City/Town/Village", col4: `${allPerameters.entityCityTown}  ` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.entityDistrict}  `, col3: "State", col4: `${allPerameters.entityState}  ` },
  { col1: "Country", col2: `${allPerameters.entityCountry}  `, col3: "PIN Code ", col4: `${allPerameters.entitypin}  ` },
  { col1: "Mobile No.", col2: `${allPerameters.entityMobile}  `, col3: "Email Id", col4: `${allPerameters.entityemail}  ` },

];
createStyledTablereg(doc, titlereg, tableDatareg);

function createStyledTableop(doc, titleop, tableDataop) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop = ["Operating Address of the Entity"]; // For the first row
const tableDataop = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop(doc, titleop, tableDataop);

  

  // drawNewPage(ParmentAddress2);
  // drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
//  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
    //   // addLogo(doc);(doc);(doc);
  // drawBorder()
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("SECTION 2:Co-Applicant Details", { underline: true });

//   function drawTablenew1(sectionTitle1, data, imagePath1) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle1, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath1)) {
//                     doc.image(imagePath1, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew11(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew1(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

  const coapplicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType}` },
    { key: "Business Type", value: `${allPerameters.coAppbuiType}` },
    { key: "Co-Applicant Name", value: `${allPerameters.coAppName}` },
    { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather}` },
    { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother}` },
    { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob1}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.coAppEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.coAppEdu}`, key2: "Religion", value2: `${allPerameters.coAppreligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob}`, key2: "Nationality", value2: `${allPerameters.coAppNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1:  `${allPerameters.coAppGender}`, key2: "Category", value2:  `${allPerameters.coAppCategory}` },
    { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd}`},
    { key1: "Pan Number", value1:  `${allPerameters.coAppPan}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId}` },
    { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  const saveImageLocally1 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant1_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  
  const sectionTitle1 = "Co-Applicant Details";
  drawTablenew1(sectionTitle1, coapplicantDetailsData, imagePath1);
  doc.moveDown()


//   function createStyledTablep(doc, titlep, tableDatap) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
//   const rowHeight = 20; // Fixed row height

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlep, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += rowHeight;

//   // Process table rows
//   tableDatap.forEach((row, rowIndex) => {
//     // Conditional column widths: first row has 2 columns, others have 4 columns
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });

//   // Draw the outer table border (around the entire table, excluding individual cell borders)
//   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
//   //   .stroke();
// }
function createStyledTablep(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

  const titlep = [" Present/Communication Address"]; // For the first row
const tableDatap = [
  { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2:  `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2:  `${allPerameters.coAppdistrict}`, col3: "State", col4:  `${allPerameters.coAppState}` },
    { col1: "Country", col2:  `${allPerameters.coAppCountry}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN}` },
    { col1: "Present Address is ", col2:  `${allPerameters.coResidence}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress}` },
  
  ];
createStyledTablep(doc, titlep, tableDatap);
doc.moveDown(3)

// function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//   const rowHeight = 20; // Fixed row height

//   const drawCheckbox = (doc, x, y, size, isChecked) => {
//     doc
//       .rect(x, y, size, size) // Draw checkbox square
//       .stroke();
//     if (isChecked) {
//       doc
//         .moveTo(x, y + size / 2)
//         .lineTo(x + size / 3, y + size - 2)
//         .lineTo(x + size - 2, y + 2)
//         .strokeColor('black')
//         .stroke();
//     }
//   };

//   // Calculate total table width
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (header row)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title border
//     .stroke();

//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//   startY += rowHeight; // Move to the next row

//   // Process table rows
//   tableDatacheckpe.forEach((row, rowIndex) => {
//     let columnWidths;
//     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//       // Rows 1, 2, and 6 use 2 columns
//       columnWidths = columnWidthsFirstRow;
//     } else {
//       // Rows 3 to 5 use 4 columns
//       columnWidths = columnWidthsOtherRows;
//     }

//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add content
//       if (rowIndex === 0 && colIndex === 1) {
//         // Add checkbox in 1st row, 2nd column
//         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//       } else {
//         doc
//           .fillColor('black')
//           .font('Helvetica')
//           .fontSize(7)
//           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//       }
//     });

//     startY += rowHeight; // Move to the next row
//   });

//   // Draw the outer table border (around the entire table)
//   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//   //   .stroke();
// }
function createCustomTableWithCheckboxpe(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe = "Permanent Address"; // Table header
const tableDatacheckpe = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.coResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

  


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]






  // drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
  doc.moveDown(1)
  // drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);

//  addFooter(doc);

  // Add the new page for ParentAddresco //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc)
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe = "Permanent Address"; // Table header
// const tableDatacheckpe = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//     { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
//     { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
//     { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
//     { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
//     { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress}` }, // 6th row (2 columns)
//   ];

// createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

function createStyledTablee(doc, titlee, tableDatae) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee = ["Employement/Business Details"]; // For the first row
const tableDatae = [
  { col1: "Occupation ", col2: `${allPerameters.coappocuupation1}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional  ", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee(doc, titlee, tableDatae);


function createStyledTablereg1(doc, titlereg1, tableDatareg1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg1 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg1 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg1(doc, titlereg1, tableDatareg1);

function createStyledTableop1(doc, titleop1, tableDataop1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop1 = ["Operating Address of the Entity"]; // For the first row
const tableDataop1 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop1(doc, titleop1, tableDataop1);
//  addFooter(doc);

  doc.addPage();
  //   // addLogo(doc);(doc);(doc);
// drawBorder()
doc.moveDown(3)
doc.font(fontBold).fontSize(11).text("SECTION 2: Additional Co-Applicant Details", { underline: true });

// function drawTablenewa(sectionTitlea, data, imagePatha) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   // const startX = 49;
//   const startX = titleX;

//   let startY = doc.y + titleHeight;
//   const rowHeight = 20;
//   const columnWidthsFirst5 = [125, 275]; // Two-column layout

//   // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//   const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//   const imageWidth = 100;
//   const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//   // Special row for section title
//   doc.rect(startX, startY, titleWidth, rowHeight)
//      .fill("#00BFFF")
//      .strokeColor("#151B54")
//      .lineWidth(1)
//      .stroke();

//   doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//      .text(sectionTitlea, startX + 5, startY + 8);
  
//   startY += rowHeight;

//   const imageSpanRows = 5;
//   const imageHeight = imageSpanRows * rowHeight;

//   data.forEach((row, index) => {
//       const rowY = startY + index * rowHeight;
      
//       if (index < 5) {
//         const columnWidths = columnWidthsFirst5;

//           // First 5 rows: two-column layout + image
//           doc.rect(startX, rowY, columnWidths[0], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//           if (index === 0) {
//               doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();

//               if (fs.existsSync(imagePatha)) {
//                   doc.image(imagePatha, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                       fit: [imageWidth - 10, imageHeight - 10]
//                   });
//               } else {
//                   doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                      .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//               }
//           }
//       } else if (index === 5 || index === 7) {
//           // 6th and 8th row transition to 4-column layout
//           columnWidths[0] = columnWidths[1] = 125;

//           // Draw four cells for these rows
//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       } else {
//           // 7th row and beyond: four-column layout without image
//           columnWidths[0] = columnWidths[1] = 125;

//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       }
//   });
// }
function drawTablenewaa(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenewa(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}


const coapplicantDetailsDataa = [
  // First 5 rows - 2 columns with key-value pairs
  { key: "Applicant Type", value: `${allPerameters.coAppType2}` },
{ key: "Business Type", value: `${allPerameters.coAppbuiType2}` },
{ key: "Co-Applicant Name", value: `${allPerameters.coAppName2}` },
{ key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather2}` },
{ key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother2}` },
{ key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp2}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob12}`},

// Row 6 - 4 columns
{ key1: "Email ID", value1: `${allPerameters.coAppEmail2}` },

// Row 7 - 2 columns with key-value pair
{ key1: "Educational Details", value1: `${allPerameters.coAppEdu2}`, key2: "Religion", value2: `${allPerameters.coAppreligion2}` },

// Row 8 - 4 columns
{ key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob2}`, key2: "Nationality", value2: `${allPerameters.coAppNationality2}` },

// Remaining rows - 4 columns layout
{ key1: "Gender", value1:  `${allPerameters.coAppGender2}`, key2: "Category", value2:  `${allPerameters.coAppCategory2}` },
{ key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus2}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd2}`},
{ key1: "Pan Number", value1:  `${allPerameters.coAppPan2}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId2}` },
{ key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar2}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo2}` },
// { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
// { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];




const saveImageLocally2 = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant2_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};


// const imagePath = "./uploads/applicant_photo.jpg";
// const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
const imagePatha = await saveImageLocally2(`${allPerameters.co2Image}`);

const sectionTitlea = "Co-Applicant Details";
drawTablenewa(sectionTitlea, coapplicantDetailsDataa, imagePatha);
doc.moveDown()


// function createStyledTablep1(doc, title, tableData) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   const titleHeight = 20; // Fixed title height
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, titleHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // Black text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += titleHeight;

//   // Process table rows
//   tableData.forEach((row, rowIndex) => {
//     // Determine column widths
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Calculate the row height dynamically based on the tallest cell
//     let rowHeight = 0;
//     const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
//       const columnWidth = columnWidths[colIndex] - 10; // Account for padding
//       return doc.heightOfString(cell || 'NA', {
//         width: columnWidth,
//         align: 'left',
//       });
//     });
//     rowHeight = Math.max(...cellHeights) + 10; // Add padding

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });
// }
function createStyledTablep1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

const titlep1 = [" Present/Communication Address"]; // For the first row
const tableDatap1 = [
{ col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress2}` }, // First row (2 columns)
{ col1: "Landmark ", col2:  `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity2}` }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2:  `${allPerameters.coAppdistrict2}`, col3: "State", col4:  `${allPerameters.coAppState2}` },
{ col1: "Country", col2:  `${allPerameters.coAppCountry2}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN2}` },
{ col1: "Present Address is ", col2:  `${allPerameters.coResidence2}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress2}` },

];
createStyledTablep1(doc, titlep1, tableDatap1);
doc.moveDown(3)
// function createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1) {
// const startX = 50; // Starting X position
// let startY = doc.y + 10; // Starting Y position
// const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
// const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
// const rowHeight = 20; // Fixed row height

// const drawCheckbox = (doc, x, y, size, isChecked) => {
//   doc
//     .rect(x, y, size, size) // Draw checkbox square
//     .stroke();
//   if (isChecked) {
//     doc
//       .moveTo(x, y + size / 2)
//       .lineTo(x + size / 3, y + size - 2)
//       .lineTo(x + size - 2, y + 2)
//       .strokeColor('black')
//       .stroke();
//   }
// };

// // Calculate total table width
// const tableWidth = Math.max(
//   columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//   columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
// );

// // Draw the title (header row)
// doc
//   .fillColor('#00BFFF') // Blue background
//   .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//   .fill()
//   .lineWidth(0.5)
//   .strokeColor('black')
//   .rect(startX, startY, tableWidth, rowHeight) // Title border
//   .stroke();

// doc
//   .fillColor('black') // White text
//   .font('Helvetica-Bold')
//   .fontSize(10)
//   .text(titlepe1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

// startY += rowHeight; // Move to the next row

// // Process table rows
// tableDatacheckpe1.forEach((row, rowIndex) => {
//   let columnWidths;
//   if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//     // Rows 1, 2, and 6 use 2 columns
//     columnWidths = columnWidthsFirstRow;
//   } else {
//     // Rows 3 to 5 use 4 columns
//     columnWidths = columnWidthsOtherRows;
//   }

//   const numColumns = columnWidths.length;

//   // Alternating row colors
//   const isGrayRow = rowIndex % 2 === 0;
//   const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//   // Draw background for the row
//   doc
//     .fillColor(rowColor)
//     .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//     .fill();

//   // Draw cell borders and content
//   Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//     // Draw border
//     doc
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//       .stroke();

//     // Add content
//     if (rowIndex === 0 && colIndex === 1) {
//       // Add checkbox in 1st row, 2nd column
//       drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//     } else {
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     }
//   });

//   startY += rowHeight; // Move to the next row
// });

// // Draw the outer table border (around the entire table)
// // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
// // doc
// //   .lineWidth(0.5)
// //   .strokeColor('black')
// //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
// //   .stroke();
// }
function createCustomTableWithCheckboxpe1(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe1 = "Permanent Address"; // Table header
const tableDatacheckpe1 = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
{ col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress2}` }, // 2nd row (2 columns)
{ col1: "Landmark", col2: `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity2}` }, // 3rd row (4 columns)
{ col1: "District Name ", col2: `${allPerameters.coAppdistrict2}`, col3: "State", col4: `${allPerameters.coAppState2}` }, // 4th row (4 columns)
{ col1: "Country", col2: `${allPerameters.coAppCountry2}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN2}` }, // 5th row (4 columns)
{ col1: "Present Address is", col2: `${allPerameters.coResidence2}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1);



// const ParentAddressco1 = [
//   { key: "DistrictName", value: "N/A" },
//   { key: "State", value: "N/A" },
//   { key: "Years at Permanent addres", value: "N/A" }
// ]






// drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
doc.moveDown(1)
// drawTable("Communication Address", communicationAddressco);
// drawTable("Permanent Address", ParentAddressco);
doc.moveDown(1);
// addFooter(doc);


// Add the new page for ParentAddresco //

doc.addPage()
// drawBorder()
  //   // addLogo(doc);(doc);(doc)
doc.moveDown(3)
//   function createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height

//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };

//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );

//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();

//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//     startY += rowHeight; // Move to the next row

//     // Process table rows
//     tableDatacheckpe1.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }

//       const numColumns = columnWidths.length;

//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();

//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();

//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });

//       startY += rowHeight; // Move to the next row
//     });

//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe1 = "Permanent Address"; // Table header
// const tableDatacheckpe1 = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//   { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress2}` }, // 2nd row (2 columns)
//   { col1: "Landmark", col2: `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity2}` }, // 3rd row (4 columns)
//   { col1: "District Name ", col2: `${allPerameters.coAppdistrict2}`, col3: "State", col4: `${allPerameters.coAppState2}` }, // 4th row (4 columns)
//   { col1: "Country", col2: `${allPerameters.coAppCountry2}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN2}` }, // 5th row (4 columns)
//   { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress2}` }, // 6th row (2 columns)
// ];

// createCustomTableWithCheckboxpe1(doc, titlepe1, tableDatacheckpe1);

function createStyledTablee1(doc, titlee1, tableDatae1) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the widest row configuration
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titlee1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDatae1.forEach((row, rowIndex) => {
  // Define column widths based on the row index
  let columnWidths;
  if (rowIndex === 0) {
    columnWidths = columnWidthsFirstRow; // First row
  } else if (rowIndex === 2) {
    columnWidths = columnWidthsThirdRow; // Third row
  } else {
    columnWidths = columnWidthsOtherRows; // Other rows
  }

  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});
}




const titlee1 = ["Employement/Business Details"]; // For the first row
const tableDatae1 = [
{ col1: "Occupation ", col2:`${allPerameters.coappocuupation2}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "If Self Employed Professional", col2: "NA", col3: "Other Income", col4: "NA" },
{ col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
{ col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
{ col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee1(doc, titlee1, tableDatae1);


function createStyledTablereg2(doc, titlereg2, tableDatareg2) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the first-row column widths
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titlereg2, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDatareg2.forEach((row, rowIndex) => {
  // Conditional column widths: first row has 2 columns, others have 4 columns
  const isFirstRow = rowIndex === 0;
  const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});

}

const titlereg2 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg2 = [
{ col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
{ col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
{ col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
{ col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg2(doc, titlereg2, tableDatareg2);

function createStyledTableop2(doc, titleop2, tableDataop2) {
const startX = 50; // Starting X position
let startY = doc.y + 10; // Starting Y position
const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
const rowHeight = 20; // Fixed row height

// Determine table width based on the first-row column widths
const tableWidth = Math.max(
  columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
  columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
);

// Draw the title (full-width, blue background, with black border)
doc
  .fillColor('#0066B1') // Blue background
  .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
  .fill()
  .lineWidth(0.5)
  .strokeColor('black')
  .rect(startX, startY, tableWidth, rowHeight) // Title row border
  .stroke();

// Add the title text
doc
  .fillColor('white') // White text
  .font('Helvetica-Bold')
  .fontSize(10)
  .text(titleop2, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

// Move to the next row
startY += rowHeight;

// Process table rows
tableDataop2.forEach((row, rowIndex) => {
  // Conditional column widths: first row has 2 columns, others have 4 columns
  const isFirstRow = rowIndex === 0;
  const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
  const numColumns = columnWidths.length;

  // Alternating row colors
  const isGrayRow = rowIndex % 2 === 0;
  const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

  // Draw background for the row
  doc
    .fillColor(rowColor)
    .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
    .fill();

  // Draw cell borders and content
  Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
    const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

    // Draw border
    doc
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(cellX, startY, columnWidths[colIndex], rowHeight)
      .stroke();

    // Add text content
    doc
      .fillColor('black')
      .font('Helvetica')
      .fontSize(7)
      .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  });

  // Move to the next row
  startY += rowHeight;
});

}

const titleop2 = ["Operating Address of the Entity"]; // For the first row
const tableDataop2 = [
{ col1: "Address", col2: "NA" }, // First row (2 columns)
{ col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
{ col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
{ col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
{ col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
{ col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop2(doc, titleop2, tableDataop2);
// addFooter(doc);
 

// addFooter(doc);


  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  // const CollateralsDetails = [
  //   { key: "Type", value: "RESIDENTIAL" },
  //   { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  // ]
  // drawTable("Collaterals Details", CollateralsDetails);
  function drawTableCollateral(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;

    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowPadding = 5; // Padding inside each cell

    // Set column widths dynamically
    const defaultColumnWidths = [200, 300]; // Default two-column layout
    const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

    // Draw the special row at the top of the table (section title)
    const specialRowHeight = 23; // Height of the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .fill("#0066B1") // Light blue background color
        .strokeColor("#00BFFF")
        .lineWidth(1)
        .stroke();

    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .strokeColor("black") // Black border
        .lineWidth(1)
        .stroke();

    // Add title text inside the special row
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("white")
        .text(sectionTitle, startX + rowPadding, startY + (specialRowHeight - 10) / 2, {
            width: titleWidth - 2 * rowPadding,
            align: "left",
        });

    // Move the Y position down after the special row
    startY += specialRowHeight;

    // Draw the table rows
    data.forEach((row, rowIndex) => {
        const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
        const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths;

        // Determine row height based on content
        let rowHeight = 20; // Minimum row height
        currentColumnWidths.forEach((width, colIndex) => {
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            const textHeight = doc
                .font(font)
                .fontSize(8)
                .heightOfString(text, { width: width - 2 * rowPadding });

            rowHeight = Math.max(rowHeight, textHeight + 2 * rowPadding);
        });

        // Draw the row cells
        let cellStartX = startX;
        currentColumnWidths.forEach((width, colIndex) => {
            // Draw cell border
            doc.rect(cellStartX, startY, width, rowHeight)
                .strokeColor("black")
                .lineWidth(1)
                .stroke();

            // Add text inside the cell
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            doc.font(font)
                .fontSize(8)
                .fillColor("#000000")
                .text(text, cellStartX + rowPadding, startY + rowPadding, {
                    align: "left",
                    width: width - 2 * rowPadding,
                    lineBreak: true,
                });

            // Move to the next column
            cellStartX += width;
        });

        // Move to the next row
        startY += rowHeight;
    });

    // Move down after the table ends
    doc.y = startY + 10; // Add spacing after the table
}


//   function drawTablecolleteral(sectionTitle, data) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const pageMargin = 48; // Margin on each side
//     const titleWidth = doc.page.width - 2 * titleX;

//     // Start drawing the table
//     const startX = titleX; // Start X position for the table
//     let startY = doc.y + titleHeight; // Start Y position for the table
//     const rowHeight = 20; // Default row height

//     // Set column widths dynamically
//     const defaultColumnWidths = [200, 300]; // Default two-column layout
//     const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

//     // Draw the special row at the top of the table (section title)
//     const specialRowHeight = 23; // Height of the special row
//     doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .fill("#00BFFF") // Light blue background color
//         .strokeColor("#00BFFF")
//         .lineWidth(1)
//         .stroke();

//         doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .strokeColor("black") // Black border
//         .lineWidth(1)
//         .stroke();

//     // Add title text inside the special row
//     doc.font(fontBold)
//         .fontSize(10)
//         .fillColor("black")
//         .text(sectionTitle, startX + 5, startY + 8);

//     // Move the Y position down after the special row
//     startY += specialRowHeight;

//     // Draw the table rows
//     data.forEach((row, rowIndex) => {
//         const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
//         const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
//         const cellHeight = rowHeight; // Fixed height for this example

//         // Draw the row cells
//         let cellStartX = startX;
//         currentColumnWidths.forEach((width, colIndex) => {
//             // Draw cell border
//             doc.rect(cellStartX, startY, width, cellHeight)
//                 .strokeColor("black")
//                 .lineWidth(1)
//                 .stroke();

//             // Add text inside the cell
//             const text = isSpecialRow
//                 ? row[colIndex] || "" // For special rows, use the value at index
//                 : colIndex === 0
//                 ? row.key
//                 : row.value; // For default rows, use key-value pairs

//             doc.font(font)
//                 .fontSize(8)
//                 .fillColor("#000000")
//                 .text(text, cellStartX + 5, startY + 5, {
//                     align: "left",
//                     width: width - 10,
//                     lineBreak: true,
//                 });

//             // Move to the next column
//             cellStartX += width;
//         });

//         // Move to the next row
//         startY += cellHeight;
//     });
// }

const CollateralsDetails = [
  { key: "Property Type", value: "Residential" },
  { key: "Property Address", value: `${allPerameters.technicalFullADDRESS}` },
  ["Name of Registered Owner", `${allPerameters.sellerName} & ${allPerameters.buyerName}`, "Relationship with Borrower", `${allPerameters.relationWithborrow}`],
  ["Area (In sq.ft)", `${allPerameters.sreaInSqFt}`, "Age of Property (In years)", `${allPerameters.propertyaGE}`],
  { key: "Market Value as on Date", value: `${allPerameters.marketValue} - ${allPerameters.marketValuetowor}` }
];

drawTableCollateral("Collaterals Details", CollateralsDetails);



  const BankDetails = [

    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  doc.moveDown(1)
  // Exact X and Y positioning without margins
  // Custom position with precise left alignment
  const customLeftPosition = 50; // Custom left offset in pixels
  const customWidth = 200; // Custom width for the text box, adjust as needed

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 5: Bank Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });


  drawTable("Bank Details", BankDetails)
  doc.moveDown(1);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 6: Referance Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });
    function drawTableref(sectionTitle, data) {
      doc.moveDown(1);
      const titleHeight = 20;
      const titleX = 48;
      const pageMargin = 48; // Margin on each side
      const titleWidth = doc.page.width - 2 * titleX;
  
      // Start drawing the table
      const startX = titleX; // Start X position for the table
      let startY = doc.y + titleHeight; // Start Y position for the table
      const rowHeight = 20; // Default row height
  
      // Set column widths dynamically
      const defaultColumnWidths = [200, 300]; // Default two-column layout
      const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows
  
      // Draw the special row at the top of the table (section title)
      const specialRowHeight = 23; // Height of the special row
      doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .fill("#0066B1") // Light blue background color
          .strokeColor("#00BFFF")
          .lineWidth(1)
          .stroke();
  
          doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .strokeColor("black") // Black border
          .lineWidth(1)
          .stroke();
  
      // Add title text inside the special row
      doc.font(fontBold)
          .fontSize(10)
          .fillColor("white")
          .text(sectionTitle, startX + 5, startY + 8);
  
      // Move the Y position down after the special row
      startY += specialRowHeight;
  
      // Draw the table rows
      data.forEach((row, rowIndex) => {
          const isSpecialRow = rowIndex === 0 || rowIndex === 4; // Rows 3 and 4 need 4 columns
          const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
          const cellHeight = rowHeight; // Fixed height for this example
  
          // Draw the row cells
          let cellStartX = startX;
          currentColumnWidths.forEach((width, colIndex) => {
              // Draw cell border
              doc.rect(cellStartX, startY, width, cellHeight)
                  .strokeColor("black")
                  .lineWidth(1)
                  .stroke();
  
              // Add text inside the cell
              const text = isSpecialRow
                  ? row[colIndex] || "" // For special rows, use the value at index
                  : colIndex === 0
                  ? row.key
                  : row.value; // For default rows, use key-value pairs
  
              doc.font(font)
                  .fontSize(8)
                  .fillColor("#000000")
                  .text(text, cellStartX + 5, startY + 5, {
                      align: "left",
                      width: width - 10,
                      lineBreak: true,
                  });
  
              // Move to the next column
              cellStartX += width;
          });
  
          // Move to the next row
          startY += cellHeight;
      });
  }

  const ReferanceDetails = [
    ["Reference 1 - Name", `${allPerameters.ref1name} `, "Reference 1 - Relation", `${allPerameters.ref1rel}`],

    // { 
    //   key: "Reference 1 - Name", value: `${allPerameters.ref1name}      Reference 1 - Relation    |${allPerameters.ref1rel}` ,
    // },
    // { 
    //   key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    // },
    { 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
    //  {
    //    key: "Reference 2 - Name", value: `${allPerameters.ref2name}      |Reference 2 - Relation    |${allPerameters.ref2rel}`

    // },
    ["Reference 2 - Name", `${allPerameters.ref2name} `, "Reference 2 - Relation", `${allPerameters.ref2rel}`],

    // { key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

    //  },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTableref("Referance Detail", ReferanceDetails)




//  // addFooter(doc); 


  // Section - paragraph //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  function drawTitletit(sectionTitle) {
    const titleHeight = 20;  // Height of the title bar
    const titleX = 48;  // X position for the title bar
    const titleWidth = doc.page.width - 2 * titleX;  // Width of the title bar
    
    const startY = doc.y;  // Y position (current position of the document)
    const titleBackgroundColor = "#0066B1";  // Background color (blue)
    
    // Draw the title background (rectangle)
    doc.rect(titleX, startY, titleWidth, titleHeight)
      .fill(titleBackgroundColor)
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
    
    // Add the title text inside the rectangle
    doc.font(fontBold)
      .fontSize(12)
      .fillColor("white")
      .text(sectionTitle, titleX + 5, startY + 5, {
        align: "center",
        width: titleWidth - 10,  // Adjust width to leave some padding
      });
  
    // Adjust y position for the content that follows
    doc.moveDown(1);
  }
  

//   doc.font('Helvetica-Bold')
// .fontSize(9)


// .text(
// `DECLARATION`,
// { align: 'justify', indent: 40, lineGap: 5 }
// );

drawTitletit("DECLARATION");

doc.font('Helvetica')
.fillColor("black")

.fontSize(9)
.text(`
1. I/We declare that we are citizens of India and all the particulars and information given in the application form is true,
correct and complete and no material information has been withheld/suppressed.
2. I/We shall adviseFCPL in writing of any change in my/our residential or employment/ business address.
3. I/We conirm that the funds shall be used for the stated purpose and will not be used for speculative or anti-social purpose.
4. I/We declare that I/we have not been in violation and shall not violate any provisions of the Prevention of Money
Laundering Act, 2002 and/ or any applicable law, rules, guidelines and circulars issued by the Reserve Bank of India
and/or any other statutory authority.
5. I/We authorise FCPL to make any enquiries regarding my/our application, including with other inance companies/registered credit bureau.
6.FCPL reserves the right to retain the photographs and documents submitted with this application and will not return the same to the applicant/s.
7. I/We have read the application form/ brochures and am/are aware of all the terms and conditions of availing inance from FCPL.
8. I/We understand that the sanction of this loan is at the sole discretion of FCPL and upon my/our executing necessary 
security (ies) and other formalities as required by FCPL and no commitment has been given regarding the same.
9. I/We authorise FCPL to conduct such credit checks as it considers necessary in its sole discretion and also authorise
FCPL to release such or any other information in its records for the purpose of credit appraisal/sharing for any other
purpose. I/We further agree that my/our loan shall be governed by the rules of FCPL which may be in force from time to
time.
10. I/We am/are aware that the upfront Legal, Technical, Processing fees, other fees and the applicable taxes collected from
me at the time of the application is non-refundable under any circumstances.
11. I/We am/are aware that FCPL does not accept any payment in cash. No payment in connection with the loan 
processing, sanction, disbursement, prepayment and repayment of loan shall be made to / in favour of any of
   FCPL intermediaries or any third party (ies) in cash or bearer cheque or in any other manner whatsoever.
12. No discount/free gift or any other commitment whatsoever has been which is not documented in the loan
agreement by FCPL or any of its authorised representatives.
13. I/We conirm that I/we have no insolvency proceedings initiated/pending against me/us nor have I/we ever been adjudicated insolvent.
14. Politically Exposed Person (PEP) Declaration:
Politically Exposed Persons” (PEPs) are individuals who are or have been entrusted with prominent public functions by a
foreign country, including the Heads of States.`,
{ align: 'justify',  lineGap: 5 }
).moveDown(0.1);

doc.font('Helvetica')
.fontSize(9)
.fillColor("black")

.text(`
/ Governments, senior politicians, senior government or judicial or military of oficers, senior executives of state-owned corporations and important 
Please tick Yes / No:
A.Applicant PEP/Relatives and close Associate of PEP ( ) Yes ( ) No
B.Co-Applicant PEP or Relatives and close Associate of PEP ( ) Yes ( ) No`,
{ align: 'justify',  lineGap: 5 }
).moveDown();


//  // addFooter(doc); 

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(5)

  doc.font('Helvetica')
  .fillColor("black")

.fontSize(9)
.text(`
15. The tenure/repayment/interest/other terms and conditions of the loan are subject to change as a consequence to any 
change in the money market conditions or on account of any other statutory or regulatory requirements or at FCPL 
discretion.   FCPL reserves the right to review and amend the terms of the loan in such manner and to such extent as
it may deem it.
16. I/We hereby declare and conirm if any detail or declaration made by me/us, if found to be false, then FCPL will be entitled to revoke and/or rec.
17. I/We hereby declare and conirm that any purchase by me/us of any insurance product is purely voluntary and is not
linked to availing of any credit facility from FCPL.
18. I/We hereby declare that the details furnished above are true and correct to the best of my/our knowledge and belief and
I/we undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false
or untrue or misleading or misrepresenting, I/we am/are aware that | /we may be held liable for it.
19. That there has never been an award or an adverse judgement or decree in a court case involving breach of contract, tax
malfeasance or other serious misconduct which shall adversely affect my/our ability to repay the loan.
20. I/We have never been a defaulter withFCPL or any other inancial institution.
21. That if any discrepancy is found or observed from the information given above and the documents produced in support 
thereof,  FCPL shall have the sole discretion to cancel the sanction at any stage and recall the loan if already disbursed
,in such an event, the processing fee shall be liable to be forfeited.
22. I/We permitFCPL to contact me/us with respect to the products and services being offered by FCPL or by any other
person (s) and further allowFCPL to cross sell the other products and services offered by such other person(s).
23. I/We further agree to receive SMS alerts/whatsapp/emails/letters etc. related to my/our application status and account
activities as well as product use messages  that FCPL and/or its group companies will send, from time to time on my/our 
mobile no./emails/letters etc as mentioned in this Application Form.
24. I/We conirm that laws in relation to the unsolicited communications referred in 'National Do Not Call Registry' as laid
down by 'Telecom Regulatory Authority of India' will not be applicable for such information/communication to me/us.
26. I/We shall create security and/or furnish guarantee in favour of FCPL as may be required.
27. I hereby submit voluntarily at my own discretion, the physical copy of Aadhaar card/physical e-Aadhaar / masked
Aadhaar / ofline electronic Aadhaar xml as issued by UIDAI (Aadhaar), toFCPL for the purpose of establishing my
identity / address proof.
28. The consent and purpose of collecting Aadhaar has been explained to me in local language.  FCPL has informed me
that my Aadhaar submitted toFCPL herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();




  


  
//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  drawTitletit("CKYC Explicit Consent");

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
    |/We, give my/our consent to download my/our KYC Records from the Central KYC Registry (CKYCR), only for the 
    purpose of veriication of my identity and address from the database of CKYCR Registry.
    I/we understand that my KYC Record includes my/our KYC Records / Personal information such as my/our
    name, address, date of birth / PAN num.
    I/We agree that my / our personal KYC details may be shared with Central KYC Registry or any other competent
    authority. | (we hereby consent to receive information from the Ratnaafin Capital Private Limited / Central
    KYC Registry or any other competent authority through SMS/email on my registered mobile number / e-mail
    address. | also agree that the non-receipt of any such SMS/e-mail shall not make the FCPL liable for any
    loss or damage whatsoever in nature.
    I/We hereby declare that there is no change in existing details and the details provided in CKYCR are updated as
    on date.
    
    Date :- ${allPerameters.date}                                                                                        PLACE:-   ${allPerameters.branchName}

    Applicant's signature                     Co-Applicant's signature                  2ndCo-Applicant's signature `,
     
  { align: 'justify',  lineGap: 5 }
  ).moveDown();

  drawTitletit("For detailed list of charges & penal charges please visit www.ratnaafin.com");
  doc.moveDown();
  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`TheFCPL's Sales Representative conirms he has: 
    (a) Collected self-attested copies of the above mentioned documents from the customer 
    (b) Not been given any payment in cash, bearer cheque or kind along with or in connection with this Loan application 
    from the customer.
    (c) Informed me/us that service tax and all other statutory taxes, levies including stamp duties and registration
    costs (if any), other fees, commissions, charges as may be applicable will be charged in connection with the loan. 
    (d) Informed me/us that the FCPL will not be liable for loss or delay in receipt of documents.
    (e) Informed me/us at incomplete / defective application will not be processed and the FCPL shall not be responsible in
    any manner for the resulting delay or otherwise. Notwithstanding the afore stated, the submission of loan application
    to the FCPL does not imply automatic approval by the FCPL and the FCPL will decide the quantum of the loan at 
    its sole and absolute discretion. TheFCPL in its sole and absolute discretion may either sanction or reject the
    application for granting the loan. In case of rejection, the FCPL shall communicate the reason for rejection.
    (f) Informed me/us that loan application may be disposed by FCPL within 30 working days of receipt of the same subject 
    to submission of all documents and details as may be required by FCPL in processing the Loan along with the 
    requisite fees. 
    (g) TheFCPL reserves its right to reject the loan application and retain the loan application form along with the
    photograph, information and documents.
  `,
{ align: 'justify',  lineGap: 5 }
);

//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
 (h) Informed to me/us that the FCPL shall have the right to make disclosure of any information relating to me/us including
  personal information, details in relation to loan, defaults, security, etc to the Credit Information Bureau of India 
  (CIBIL) and/or any other governmental/regulatory/statutory or private agency/entity,credit bureau, RBI, the FCPL’s other
  branches / subsidiaries / afiliates/ rating agencies, service providers, other Banks / inancial institutions, any third
  parties, any assigns / potential assignees or transferees, who may need, process and publish the information in such
  manner and through such medium as it may be deemed necessary by the publisher /  FCPL/ RBI, including publishing the 
  name as part of wilful defaulter’s list from time to time, as also use for KYC information veriication, credit risk
  analysis, or for other related purposes.
 (i) Informed & explained me/us all the charges and terms and conditions mentioned overleaf.
 (j) Informed me/us that the FCPL will send the Offer Letter to me/us on the e-mail ID mentioned by me/us in the loan application.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();

doc.font('Helvetica-Bold')
  .fontSize(9)
  .text(`
Do not Sign This Form if its Blank. Please Ensure all relevant sections and documents are completely filled to your satisfaction and then only sign the form 
`,
{ align: 'justify',  lineGap: 5 }
);

function createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsTitle = [500]; // Width for the title row
  const columnWidthsTable = [50, 450]; // Column widths: Sr. No (50), Particulars (450)
  const rowHeight = 20; // Fixed height for rows

  // Draw Table Title 1
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('white')
    .text(tableTitle1, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Title 2
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Header (Table Title 3)
  doc
    .fillColor('#d9d9d9') // Gray background
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('black')
    .text(tableTitle3, startX + 5, startY + 5, { width: columnWidthsTable[0] + columnWidthsTable[1] - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Rows
  tableDatatable.forEach((row, rowIndex) => {
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    const currentRowHeight = rowIndex === 0 ? 30 : rowHeight;


    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], currentRowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += currentRowHeight;
  });
}

const tableTitle1 = "DOCUMENTS CHECKLIST";
const tableTitle2 = "Login Documents";
const tableTitle3 = `Sr. No                                                 Particulars`;
const tableDatatable = [
{ srNo: "1", particulars: "KYC of Borrower and Co-Borrowers/Guarantors (Firm/Company) – PAN Card, COI, MOA, AOA, Udyam Registration Certiicate with Annexures, All Partnership Deed, All LLP Deed, GST Registration Certiicate (3 Pages) (For all states)." },
{ srNo: "2", particulars: "KYC Borrower and Co-Borrowers/Guarantors (Individuals/Proprietor/Partners): PAN Card and Aadhaar Card." },
{ srNo: "3", particulars: "Udyam Registration Certificate of Borrower." },
{ srNo: "4", particulars: "Application Form & CIBIL Consent." },
{ srNo: "5", particulars: "Business and Residence photos." },
{ srNo: "6", particulars: "Electricity Bill / Gas Dairy,Samagra ID (In Madhya Pradesh, the Samagra ID is a unique nine-digit number given to residents)" },
{ srNo: "7", particulars: "All CA/CC Bank Account statement for last 6 Months (In PDF)." },
{ srNo: "8", particulars: "ITR with Computation of Income for last 1 Year (If available)." },
{ srNo: "9", particulars: "Income Proof Documents." },
{ srNo: "10", particulars: "Latest Sanction letter of Existing loans with Statement of Account." },
{ srNo: "11", particulars: "CIBIL Reports of Borrower and Co-Borrowers/Guarantors." },
{ srNo: "12", particulars: "Farm CIBIL (On best effort basis)." },
{ srNo: "13", particulars: "BSV (Bank Signature Verification)." },
{ srNo: "14", particulars: "Legal Report, Technical Report." },
{ srNo: "15", particulars: "PD Report." },
{ srNo: "16", particulars: "FI / RCU / FCU Report." },
{ srNo: "17", particulars: "Property Documents." },
];

createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable);


//  // addFooter(doc); 

  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(1)


 
 
 
  // function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Property Documents" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Title: "Sr. No | Particulars" ===
  //   // Sr. No Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, columnWidths[0], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Sr. No', startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Particulars', startX + columnWidths[0] + 5, startY + 5, {
  //       width: columnWidths[1] - 10,
  //       align: 'left',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 3rd Title: "Gram Panchayat Patta Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableTitles[1], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === Rows with Sr. No and Particulars ===
  //   const rowHeightWithBullets =
  //     tableRow.particulars.length * bulletSpacing > rowHeight
  //       ? tableRow.particulars.length * bulletSpacing
  //       : rowHeight;
  
  //   // Sr. No Column
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableRow.srNo, startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Column with Bullet Points
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   tableRow.particulars.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   startY += rowHeightWithBullets; // Move to the next row
  //       // startY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;

  //   // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Footer background color
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(footerText, startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });

  // }

  function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const rowHeight = 20; // Default row height
    const bulletSpacing = 5; // Minimum spacing for bullet points in "Particulars"

    // === 1st Title: "Property Documents" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black')
        .text(tableTitles[0], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === 2nd Title: "Sr. No | Particulars" ===
    // Sr. No Header
    doc.fillColor('#d9d9d9').rect(startX, startY, columnWidths[0], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Sr. No', startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Header
    doc.fillColor('#d9d9d9').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Particulars', startX + columnWidths[0] + 5, startY + 5, { width: columnWidths[1] - 10, align: 'left' });
    startY += rowHeight;

    // === 3rd Title: "Gram Panchayat Patta Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableTitles[1], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === Rows with Sr. No and Particulars ===
    // Sr. No Column
    const particularsText = tableRow.particulars.join('\n• '); // Combine all bullets
    const particularsHeight = doc.heightOfString(`• ${particularsText}`, { width: columnWidths[1] - 15, align: 'left' });
    const rowHeightWithBullets = Math.max(particularsHeight + 10, rowHeight);

    // Sr. No Column
    doc.fillColor('#ffffff').rect(startX, startY, columnWidths[0], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableRow.srNo, startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Column
    doc.fillColor('#ffffff').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('black')
        .text(`• ${particularsText}`, startX + columnWidths[0] + 10, startY + 5, { width: columnWidths[1] - 15, align: 'left' });

    startY += rowHeightWithBullets;

    // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(footerText, startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
}

  

  

  const tableTitles = [
    "Property Documents",
    "Gram Panchayat Patta Properties",
  ];
  
  const tableRow = {
    srNo: "1",
    particulars: [
      "GP Patta / Ownership Certificate issued from Gram Panchayat office showing possession.",
      "Property Tax receipt.",
      "Mutation in the name of property owner (Jamabandi).",
      "Registered Title in form of Proposed Sale Deed/Co-ownership Deed/release deed/Gift Deed etc.",
      "Any Utility bill.",
      `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility bills, Ration Card, Tax record may be acceptable for possession proof.`,
      "Co-Ownership Deed executed between customer, spouse, son, or daughter is acceptable.",
      "Equitable Mortgage/Registered Mortgage.",
    ],
  };
  
  const footerText = "Nagar Parishad / Nagar Panchayat Properties";
  
  // Call the function
  drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText);

  function drawSingleRowTable(doc, rowData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Spacing between lines of text (line gap)
  
    // === Draw Sr. No Column ===
    const contentHeight = rowData.map((bullet) =>
      doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15, // Width of the "Particulars" column
      })
    );
    const rowHeightWithBullets = contentHeight.reduce((a, b) => a + b, 0) + bulletSpacing * rowData.length;
  
    // Draw Sr. No Cell
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text("1", startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // === Draw Particulars Column with Bullets ===
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    let bulletY = startY + 5;
    rowData.forEach((bullet) => {
      const bulletHeight = doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15,
      });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += bulletHeight + bulletSpacing; // Add spacing after each bullet
    });
  
    // Update Y position for future elements if needed
    return startY + rowHeightWithBullets;
  }
  
  // Sample Data
  const firstRowData = [
    "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
    "Property tax receipt in the name of property owner.",
    "Mutation order in the name of property owner.",
    `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
    bills, Ration Card, Tax record may be acceptable for possession proof.`,
    "NOC to Mortgage.",
    `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
    to be obtained.`,
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  drawSingleRowTable(doc, firstRowData);
  
  // function drawSingleRowTable(doc, rowData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === Draw Sr. No Column ===
  //   const rowHeightWithBullets = 
  //     rowData.length * bulletSpacing > 20 
  //       ? rowData.length * bulletSpacing 
  //       : 20; // Dynamic height based on content
  
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text("1", startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // === Draw Particulars Column with Dotted Data ===
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   rowData.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   // Update Y position for future elements if needed
  //   return startY + rowHeightWithBullets;
  // }
  
  
  
  // const firstRowData = [
  //   "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
  //   "Property tax receipt in the name of property owner.",
  //   "Mutation order in the name of property owner.",
  //   `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
  //    bills, Ration Card, Tax record may be acceptable for possession proof.`,
  //   "NOC to Mortgage",
  //   `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
  //    to be obtained.`,
  //   "Equitable Mortgage/Registered Mortgage",
  // ];
  
  // drawSingleRowTable(doc, firstRowData);
  

  // function drawCustomTableWithFooter1(doc, tableTitles1, tableRow, secondRowData, footerData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Municipal Corporation Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles1[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Row: Data in Two Columns ===
  //   secondRowData.forEach((item, index) => {
  //     // Sr. No Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX, startY, columnWidths[0], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(9)
  //       .fillColor('black')
  //       .text(index + 1, startX + 5, startY + 5, {
  //         width: columnWidths[0] - 10,
  //         align: 'center',
  //       });
  
  //     // Particulars Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(item, startX + columnWidths[0] + 5, startY + 5, {
  //         width: columnWidths[1] - 10,
  //         align: 'left',
  //       });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // === 3rd Title/Footer: Bullet Points ===
  //   footerData.forEach((footerItem) => {
  //     const footerHeight =
  //       footerItem.length * bulletSpacing > rowHeight
  //         ? footerItem.length * bulletSpacing
  //         : rowHeight;
  
  //     // Footer Section
  //     doc
  //       .fillColor('#ffffff') // White background for footer
  //       .rect(startX, startY, tableWidth, footerHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     let bulletY = startY + 5;
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${footerItem}`, startX + 5, bulletY, {
  //         width: tableWidth - 10,
  //         align: 'left',
  //       });
  
  //     startY += footerHeight; // Move to the next section
  //   });
  // }

  function drawCustomTableWithFooter1(doc, title, secondRowData, footerData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Line spacing for text in "Particulars"
  
    // === Title: "Municipal Corporation Properties" ===
    const titleHeight = 20; // Fixed height for title row
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, titleHeight)
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('black')
      .text(title, startX + 5, startY + 5, {
        width: tableWidth - 10,
        align: 'center',
      });
  
    startY += titleHeight; // Move to the next row
  
    // === Content: "Sr. No | Particulars" ===
    // Calculate the height of the "Particulars" content
    let contentHeight = secondRowData.reduce((totalHeight, bullet) => {
      return totalHeight + doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    }, 10); // Add padding
  
    // Sr. No Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], contentHeight)
      .strokeColor('black')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text('1', startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // Particulars Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], contentHeight)
      .strokeColor('black')
      .stroke();
  
    // Render each bullet point in "Particulars"
    let bulletY = startY + 5;
    secondRowData.forEach((bullet) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    });
  
    startY += contentHeight; // Move to the next section
  
    // === Footer Section ===
    const footerHeight = footerData.reduce((totalHeight, line) => {
      return totalHeight + doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    }, 10);
  
    // Footer Background
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, footerHeight)
      .fill()
      .strokeColor('black')
      .stroke();
  
    // Render each line in the footer
    let footerY = startY + 5;
    footerData.forEach((line) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${line}`, startX + 10, footerY, {
          width: tableWidth - 20,
          align: 'left',
          lineGap: 2,
        });
      footerY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    });
  }
  
  // Sample Data
  const secondRowData = [
    "Last 13 Years Complete Chain documents, i.e. Khasra / Notarized agreement / Sale Deed / Gift Deed / Co-ownership Deed.",
    "Architect plan/Site plan to be collected.",
    "Mutation in the name of Property owner.",
    "Latest property tax receipt.",
    "5-year-old Electricity bill in the name of seller/customer (to evidence possession) also Voter ID Card, any utility Bills, Ration card, and Tax record may be acceptable for possession proof.",
    "Indemnity from borrower.",
    "Latest registered title document shall be Sale deed / Gift deed / Co-ownership deed in case prior title document is not registered (e.g., notary/Khasra).",
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  const footerData = [
    "Legal opinion report of the property should state 'clear & marketable' and SARFAESI is applicable as issued by empanelled advocate.",
  ];
  
  // Call the function with the appropriate data
  drawCustomTableWithFooter1(doc, 'Municipal Corporation Properties', secondRowData, footerData);
//  // addFooter(doc); 

  
    
      doc.addPage();
    

function createChecklistTablet(doc, tableTitle, tableTitle2, tableData) {
  // Check if tableData is defined and an array
  if (!Array.isArray(tableData)) {
    console.error("tableData is not an array or is undefined");
    return;
  }

  // Initial configurations
  const startX = 50; // Starting X position for table
  let startY = doc.y + 10; // Starting Y position

  const rowHeight = 20;
  const rowHeightDefault = 20; // Default row height
  const columnWidthsTable = [50, 450]; // Widths for Sr. No and Particulars
  const columnWidthsTitle = [500]; // Width for the title row

  // Add Main Table Title (tableTitle)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('white')
    .text(tableTitle, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  startY += rowHeight;

  // Add Subtitle (tableTitle2)
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'left' });

  startY += rowHeight;

  // Draw Table Rows for `tableData`
  tableData.forEach((row, rowIndex) => {

    let rowHeight = rowIndex === 9? 30 : rowHeightDefault; // Increase height for row 3 (index 2)
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += rowHeight;
    doc.moveDown()

  });

}


const tableTitleT = "Disbursement DOCUMENTS";
const tableTitleT2 = `Sr. No                                                 Particulars`;
const tableDatatableT = [
  { srNo: "1", particulars: "Self-Attested KYC of Borrowers and Co-borrower." },
  { srNo: "2", particulars: "Self-Attested Udyam Registration Certiicate of Borrower." },
  { srNo: "3", particulars: "Sanction Letter signed by Borrower and Co-borrowers." },
  { srNo: "4", particulars: "NACH with Sign and Stamp / E-Nach Registeration." },
  { srNo: "5", particulars: "In case, Borrower is Partnership Firm or Company, Signed KYC of Borrower." },
  { srNo: "6", particulars: `5 UDC from Borrower and 2 UDC of Co-borrowers/Guarantors as per the Sanction Letter along with UDC Covering Letter.` },
  { srNo: "7", particulars: "Customer Disbursement Request form." },
  { srNo: "8", particulars: "Dual Declaration Form (If any )." },
  { srNo: "9", particulars: "Signed Personal Gaurantee Deed (If any )." },
  { srNo: "10", particulars: `Loan Agreement (MITC, Schedule, Insurance Form, Annexure 1, End Use Undertaking, DPN, Vernacular Language Declaration.\n\n` },
  { srNo: "11", particulars: "Sigend Sale deed / Gift Deed / Release deed / Co- ownership Deed." },
  { srNo: "12", particulars: "Signed Registered Mortgage / Equitable Mortgage Deed." },
  { srNo: "13", particulars: "Vetting Report." },
  { srNo: "14", particulars: "Revised Legal." },
  { srNo: "15", particulars: "FI and RCU Report." },
  { srNo: "16", particulars: "Insurance Form." },
  { srNo: "17", particulars: "Veterinary Doctor Certiicate (If applicable)." },
];


function drawTitletitt(sectionTitle) {

  const titleHeight = 20;  
  const titleX = 48; 
  const titleWidth = doc.page.width - 2 * titleX; 
  
  const startY = doc.y;  
  const titleBackgroundColor = "#0066B1";  
  
  doc.rect(titleX, startY, titleWidth, titleHeight)
    .fill(titleBackgroundColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();
  
  doc.font(fontBold)
    .fontSize(12)
    .fillColor("white")
    .text(sectionTitle, titleX + 5, startY + 5, {
      align: "center",
      width: titleWidth - 10,  
    });

 
}
createChecklistTablet(doc, tableTitleT, tableTitleT2, tableDatatableT);

drawTitletitt("MOST IMPORTANT INFORMATION (Adhar Consent)");

doc.font('Helvetica')
.fillColor("black")

  .fontSize(9)
  .text(`
I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company
here with shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. 
The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in 
accordance with the applicable law.
I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained
me in vernacular (the language known to me):
i) the purpose and the uses of collecting Aadhaar.
ii) the nature of information that may be shared upon ofline verification.
iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter’s ID, driving
license, etc.).
I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
its oficials responsible in case of any incorrect / false information or forged document provided by me.
This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
respect of the submission of his/her Aadhaar.
Date:-${allPerameters.date}
place:-${allPerameters.branchName}
  `,
{ align: 'justify',  lineGap: 5 }
);

// // addFooter(doc); 
addFooter1(doc);


// doc.addPage();
// // drawBorder()
//   //   // addLogo(doc);(doc);(doc);
// doc.moveDown(6)

// doc.font('Helvetica')
//   .fontSize(9)
//   .text(`
// I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
//  its oficials responsible in case of any incorrect / false information or forged document provided by me.

// This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
//  respect of the submission of his/her Aadhaar.

// Date:-

// place:-
//   `,
// { align: 'justify',  lineGap: 5 }
// );




// // Call the function with the PDF document and table data

// // Finalize the document (assuming you are writing to a file or streaming it)

  
  

  


// //  // addFooter(doc); 
//   addFooter1(doc);
  doc.end();

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // const objData = {
  //     fileName: pdfFileUrl,
  //     file: doc.toString('base64')
  // }
  // await initESign(objData)

  // return new Promise((resolve, reject) => {
  //     stream.on("finish", () => {
  //       resolve(pdfFileUrl);
  //     });
  //     stream.on("error", reject);
  //   });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

}



async function growpdf3(allPerameters,skipPages) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));


  function  addLogo() {
    // doc.moveDown(-5)
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });

    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }

  function addWatermark(doc) {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      //   doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { fit: [450, 400], opacity: 0.05 });
      doc.restore();
    }
    //  else {
    //   console.error(`Logo file not found at: ${watermarklogo}`);
    // }
  }

  function addFooter1(doc) {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;

    doc.font(fontBold).fontSize(6.3).fillColor("#324e98").text("Fin Coopers Capital Pvt Ltd", pageWidth, pageHeight - 80, { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", { align: "center", });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("CIN: 67120MP1994PTC008686", { align: "center" });
    doc.font(fontBold).fontSize(6.3).fillColor("#000000").text("Phone: +91 7374911911 | Email: info@fincoopers.com", { align: "center",link: "tel:7374911911",link: "mailto:info@fincoopers.com", // Make it clickable
  });

    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor("#324e98").lineWidth(1).stroke();
  }
  
  
 // ../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png
  // const pdfLogos = path.join( __dirname,"../../../../../assets/image/ratnaLogo.png");
  
  // function addFooter(doc) {
  //   // PDF dimensions
  //   const pageWidth = doc.page.width; 
  //   const pageHeight = doc.page.height; 
  
  //   // Add logo at the bottom-right corner
  //   if (fs.existsSync(pdfLogos)) {
  //     const logoWidth = 40; 
  //     const logoHeight = 25; 
  
  //     doc.image(pdfLogos, pageWidth - logoWidth - 10, pageHeight - logoHeight - 10, {
  //       fit: [logoWidth, logoHeight],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${pdfLogos}`);
  //   }
  // }
  
  

  // const pdfFilename = `NEWApplicantConditions.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);
  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

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

  // doc.pipe(stream);

  //   drawBorder(doc);
  addLogo(doc);
  doc.moveDown(4);
  doc.fontSize(9).font(fontBold).fillColor('#00BFFF').text("LOAN APPLICATION FORM",{ align: "center" });


  doc.moveDown(1);
  doc.fontSize(8).font(fontBold).fillColor('#000000.').text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All fields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                                  ${allPerameters.date}`, { align: "left" ,continued:true});
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "right" });
  // I have to move down here
  doc.moveDown(1);


  // for sectionA//

  function drawTable(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;
  
    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowHeight = 20; // Default row height
  
    // Set fixed column widths
    const columnWidths = [150, 350, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#0066B1"; // Light blue background color#00BFFF. 0066B1
  
    // Draw the special row with background color
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .fill(specialRowColor)
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();
  
    // Add black border around the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
      .strokeColor("#000000") // Black border
      .lineWidth(1)
      .stroke();
  
    // Add text inside the special row
    doc.font(fontBold)
      .fontSize(10)
      .fillColor("white")
      .text(specialRowText, startX + 5, startY + 8);
  
    // Move the Y position down after the special row
    startY += specialRowHeight;
  
    // Draw the actual table rows
    data.forEach((row) => {
      const minRowHeight = 20;
      const extraHeightPerLine = 3;  // Additional height for each line of overflow
  
      // Calculate the height needed for the cell content
      const keyTextHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, fontSize: 8 });
      const valueTextHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, fontSize: 8 });
  
      // Determine the number of lines based on text height and base line height (e.g., 10 per line)
      const keyLines = Math.ceil(keyTextHeight / 10);
      const valueLines = Math.ceil(valueTextHeight / 10);
  
      // Calculate extra height if content requires more lines than default row height
      const extraHeight = (Math.max(keyLines, valueLines) - 1) * extraHeightPerLine;
  
      // Use the maximum height needed for either cell content or the minimum row height plus extra height
      const cellHeight = Math.max(keyTextHeight, valueTextHeight, minRowHeight) + extraHeight;
  
      // Draw key cell border
      doc.rect(startX, startY, columnWidths[0], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Draw value cell border
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], cellHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();
  
      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000")
        .text(row.key, startX + 5, startY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
  
      // Check if this row should display a checkbox with or without a checkmark
      if (row.key === "Same as Communication address") {
        const checkboxX = startX + columnWidths[0] + 10;
        const checkboxY = startY + 5;
  
        // Draw checkbox border
        doc.rect(checkboxX, checkboxY, 10, 10).stroke();
  
        // Draw checkmark if the value is "YES"
        if (row.value === "YES") {
          doc.moveTo(checkboxX + 2, checkboxY + 5)
            .lineTo(checkboxX + 5, checkboxY + 8)
            .lineTo(checkboxX + 8, checkboxY + 2)
            .strokeColor("black")
            .stroke();
        }
      } else {
        // Add text to the value cell (wrapped if necessary)
        doc.text(row.value, startX + columnWidths[0] + 15, startY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
  
      // Move startY down by the height of the current cell for the next row
      startY += cellHeight;
    });
  }
  



  function drawComplexTable(headers, data, sectionA, sectionB, footerNote, fontSize = 7, borderWidth = 0.5) {
    doc.moveDown(2);

    // Title with customizable font size
    doc.font(fontBold)
        .fontSize(10)
        .text("1. MOST IMPORTANT INFORMATION", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(8)
        .text("Attention: PLEASE READ CAREFULLY BEFORE SIGNING ACKNOWLEDGEMENT FORM", { align: "center" });
    doc.moveDown(1);

    doc.font(fontBold)
        .fontSize(fontSize)
        .text(`I/We refer to application Sr. No dated submitted by me/us to Fin Coopers Capital Pvt Ltd.. I/We have been provided the
following information and have accordingly filled up the aforesaid form.`);
    doc.moveDown(0.5);

    // Helper function to draw rows with customizable font size and border width
    const drawTableRow = (doc, x, y, row, colWidths, height, fontSize, borderWidth, borderColor = 'black') => {
        let currentX = x;

        if (row[0] === "Pre-EMI (Rs.)" || row[0] === "EMI (Rs.)" || row[0] === "Type of transaction") {
            const labelWidth = colWidths[0];
            const valueWidth = colWidths.reduce((sum, width) => sum + width, 0) - labelWidth;

            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, labelWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[0], currentX + 5, y + 5, { width: labelWidth - 10, align: "center" });

            currentX += labelWidth;
            doc
                .lineWidth(borderWidth)
                .strokeColor(borderColor)
                .rect(currentX, y, valueWidth, height)
                .stroke()
                .fontSize(fontSize) // Set font size dynamically
                .text(row[1], currentX + 5, y + 5, { width: valueWidth - 10, align: "center", lineBreak: true });
        } else {
            row.forEach((text, i) => {
                const cellWidth = colWidths[i];
                doc
                    .lineWidth(borderWidth)
                    .strokeColor(borderColor)
                    .rect(currentX, y, cellWidth, height)
                    .stroke()
                    .fontSize(fontSize) // Set font size dynamically
                    .text(text, currentX + 5, y + 5, { width: cellWidth - 10, align: "center", lineBreak: true });
                currentX += cellWidth;
            });
        }
    };

    // Set up table coordinates
    const tableX = 50;
    const tableY = doc.y;
    const colWidths = [120, 120, 120, 120]; // Fixed column widths

    // Dynamically adjust row height based on data length
    const dataLength = data.length;
    // //console.log(dataLength);
    const rowHeight = dataLength >9 ? 35 : 23; // If more than 7 rows, increase height

    // Draw the header
    drawTableRow(doc, tableX, tableY, headers, colWidths, rowHeight, fontSize, borderWidth, 'black');
    
    // Draw data rows
    let currentY = tableY + rowHeight;
    data.forEach((row) => {
      drawTableRow(doc, tableX, currentY, row, colWidths, rowHeight, fontSize, borderWidth, 'black');
      currentY += rowHeight;
    });

    // Section A
    const sectionAStartY = currentY; // Directly connect to the data rows
    const sectionWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const sectionX = tableX;

    doc.rect(sectionX, sectionAStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("  A. Loan Processing Fee", sectionX + 2, sectionAStartY + 10, { align: "center" });
    currentY = sectionAStartY + 30; // Update currentY after section header

    sectionA.forEach((row) => {
        drawTableRow(doc, sectionX, currentY, row, colWidths, rowHeight, fontSize, borderWidth);
        currentY += rowHeight;
    });

    // Section B - Increase row height for Section B data only
    const sectionBStartY = currentY; // Directly connect to Section A
    doc.rect(sectionX, sectionBStartY, sectionWidth, 30).stroke();
    doc.font(fontBold)
        .fontSize(8)
        .text("B. Part Prepayment / Foreclosure Charges", sectionX + 5, sectionBStartY + 10, { align: "center" });
    currentY = sectionBStartY + 30; // Update currentY after section header

    sectionB.forEach((row, index) => {
        // Increase row height specifically for Section B rows
        const sectionBRowHeight = 50; // Increase the height for Section B rows
        drawTableRow(doc, sectionX, currentY, row, colWidths, sectionBRowHeight, fontSize, borderWidth);
        currentY += sectionBRowHeight; // Update Y for next row
    });

    // Footer Note (connect directly after Section B)
    const footerStartY = currentY; // No extra space before footer
    const footerHeight = 38;
    doc.rect(sectionX, footerStartY, sectionWidth, footerHeight).stroke();
    doc.fontSize(8)
        .font(fontBold)
        .text(footerNote, sectionX + 5, footerStartY + 10, { width: sectionWidth - 10, align: "left" });
}

 /// make a function Singnature //
  function createSignatureTablePDF(data, marginX = 40, marginY = 100) {
    // Table settings with customizable margins
    const startX = 40; // X position based on left margin
    const startY = doc.y; // Y position based on top margin
    const cellWidth = 130; // Width of each cell
    const minCellHeight = 15; // Minimum cell height
  
    // Set table color and line thickness
    doc.strokeColor('black').lineWidth(0.5); // Set line color to black and line thickness to 1.2
  
    // Draw header row (blank cells)
    for (let i = 0; i < 4; i++) {
      const x = startX + i * cellWidth;
      doc.rect(x, startY, cellWidth, minCellHeight).stroke(); // Draws a blank cell
    }
  
    // Draw content row and add data below the header row
    data.forEach((text, index) => {
      const x = startX + index * cellWidth;
      const textHeight = doc.fontSize(6).heightOfString(text, { width: cellWidth - 10 });
      const cellHeight = Math.max(textHeight + 20, minCellHeight); // Set cell height based on text height, with padding
  
      const y = startY + minCellHeight; // Move down by one cell height for content row
  
      // Draw the cell border
      doc.rect(x, y, cellWidth, cellHeight).stroke();
  
      // Add text to the cell, with padding
      doc.font('Helvetica-Bold').fontSize(6)
      .text(text, x + 5, y + 10, { width: cellWidth - 10, align: 'center' });
    });
  }

  function createDocumentsRequiredTable(data) {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 55; // Defined margin from the border
    const padding = 5; // Padding inside cells
    const minColumnWidth = 200; // Minimum width for the columns

    // Calculate available width for the table based on the margins
    const availableWidth = pageWidth - 2 * margin;

    // Set column widths as 40% for the left column and 60% for the right column
    let cellWidth1 = Math.max(availableWidth * 0.4, minColumnWidth); // 40% for document name
    let cellWidth2 = Math.max(availableWidth * 0.6, minColumnWidth); // 60% for document details

    // const startX = margin + 10; // Start X position inside the margin
    // const startY = margin + 40; // Start Y position inside the margin, accounting for some space for the header

    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position

    // Set table color and line thickness
    doc.strokeColor('#20211A').lineWidth(0.2);

    // Draw the header row (DOCUMENTS REQUIRED)
    doc.rect(startX, startY, cellWidth1 + cellWidth2, 20).stroke(); // Use a fixed height for the header
    doc.fontSize(12).text('DOCUMENTS REQUIRED', startX + padding, startY + padding, { align: 'center' });

    let currentY = startY + 20; // Set the Y position after the header

    // Loop through the data and create table rows
    data.forEach(item => {
        // Calculate the height of each column's content
        const docNameHeight = doc.heightOfString(item.documentName);
        const docDetailsHeight = doc.heightOfString(item.documentDetails);

        // Choose the maximum height between the two columns
        const rowHeight = Math.max(docNameHeight, docDetailsHeight) + 2 * padding; // Adding padding for spacing

        // Draw the border around the row
        doc.rect(startX, currentY, cellWidth1 + cellWidth2, rowHeight).stroke();

        // Draw a border between the two columns
        doc.moveTo(startX + cellWidth1, currentY).lineTo(startX + cellWidth1, currentY + rowHeight).stroke();

        // Draw the document name in the left column
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .text(item.documentName, startX + padding, currentY + padding, { align: 'left', width: cellWidth1 - 2 * padding, lineBreak: true });

        // Draw the document details in the right column
        doc.fontSize(8)
           .font('Helvetica')
           .text(item.documentDetails, startX + cellWidth1 + padding, currentY + padding, { align: 'left', width: cellWidth2 - 2 * padding, lineBreak: true });

        // Move to the next row based on the calculated row height
        currentY += rowHeight;
    });

    // Draw a footer row for the "Note" section (connected with the previous row)
    const noteHeight = doc.heightOfString('Note: Documents relating to beneficial owners, office bearers...') + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text('Note: Documents relating to beneficial owners, office bearers...', startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const rowHeight = 20; // Default row height
    const columnWidths = [200, 200]; // Key and Value columns
    const imageWidth = 100; // Width for the image cell
    const totalWidth = columnWidths[0] + columnWidths[1] + imageWidth;

  // Draw the special row at the top of the table (Loan Details)
  const specialRowHeight = 20; // Height of the special row
  const specialRowText = `${sectionTitle}`; // Text for the special row
  const specialRowColor = "#00BFFF"; // Light blue background color

  // Draw the special row with background color
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .fill(specialRowColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();

  // Add black border around the special row
  doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    .strokeColor("#000000") // Black border
    .lineWidth(1)
    .stroke();

  // Add text inside the special row
  doc.font(fontBold)
    .fontSize(10)
    .fillColor("black")
    .text(specialRowText, startX + 5, startY + 8);


    // Adjust `startY` to begin the table rows after the header row
    startY += rowHeight;

    // Calculate rows for image spanning
    const imageSpanRows = 5; // Number of rows the image spans
    const imageHeight = imageSpanRows * rowHeight; // Total height for the image cell

    // Draw table rows
    data.forEach((row, index) => {
      const rowY = startY + index * rowHeight; // Calculate row position
      if (index < imageSpanRows) {
        // Rows with the image column
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke()

        doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
          .strokeColor("black")

          .lineWidth(1)
          .stroke();

        // Add text for Key and Value columns
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: columnWidths[1] - 10,
          });

        // Draw the image column in the first row of the image span
        if (index === 0) {
          doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();

          if (fs.existsSync(imagePath)) {
            doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
              fit: [imageWidth - 10, imageHeight - 10], // Adjust image size with padding
            });
          } else {
            doc.font(fontBold)
              .fontSize(10)
              .fillColor("#ff0000") // Red text
              .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
          }
        }
      } else {
        // Rows after the image span, merge `Value` and `Image` columns
        const fullValueWidth = columnWidths[1] + imageWidth;

        // Draw Key cell
        doc.rect(startX, rowY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Draw merged Value cell
        doc.rect(startX + columnWidths[0], rowY, fullValueWidth, rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        // Add Key and Value text
        doc.font(font)
          .fontSize(8)
          .fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, {
            align: "left",
            width: columnWidths[0] - 10,
          })
          .text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
            align: "left",
            width: fullValueWidth - 10,
          });
      }
    });
  }

  function drawNewPage(data) {
    let datavalue = Array.isArray(data) ? data : [data];
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;

    // // Draw the section title with a colored background (same as original)
    // doc.rect(titleX, doc.y, titleWidth, titleHeight)
    //   .fill("#00BFFF")  // Color for the section title (same as before)
    //   .strokeColor("#20211A") // Black border for the title
    //   .lineWidth(1)
    //   .stroke();

    // doc.font(fontBold)
    //   .fontSize(11)
    //   .fillColor("#20211A")
    //   .text(sectionTitle, titleX + 3, doc.y + 6);



    const startX = 49; // Starting X position for the table
    const startY = doc.y; // Starting Y position
    const rowHeight = 20; // Height of each row
    const columnWidths = [250, 300, 70]; // Column widths

    // Draw table rows
    datavalue.forEach((row, index) => {
      const rowY = startY + index * rowHeight;


      // Draw background fill for the row (without covering borders)
      doc.rect(startX, rowY, columnWidths[0] + columnWidths[0], rowHeight)
      // .fillColor(fillColor)
      // .fill();

      // Draw key cell border
      doc.rect(startX, rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Draw value cell border
      doc.rect(startX + columnWidths[0], rowY, columnWidths[0], rowHeight)
        .strokeColor("black")
        .lineWidth(1)
        .stroke();

      // Add text to the key cell (wrapped if necessary)
      doc.font(font)
        .fontSize(8)
        .fillColor("#000000") // No background fill, just the text color
        .text(row.key, startX + 5, rowY + 5, {
          align: "left",
          width: columnWidths[0] - 10,
          lineBreak: true,
        });
      // Check if this row should display a checkbox
      if (row.key === "Same as Communication address") {
        if (row.value === "YES") {
          // Draw a checked checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke(); // Draw checkbox border
          doc.moveTo(startX + columnWidths[0] + 12, rowY + 10)
            .lineTo(startX + columnWidths[0] + 15, rowY + 13)
            .lineTo(startX + columnWidths[0] + 20, rowY + 7)
            .stroke(); // Draw checkmark
        } else {
          // Draw an empty checkbox
          doc.rect(startX + columnWidths[0] + 10, rowY + 5, 10, 10)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
        }
      } else {
        // Add text to the value cell
        doc.text(row.value, startX + columnWidths[0] + 5, rowY + 5, {
          align: "left",
          width: columnWidths[1] - 10,
          lineBreak: true,
        });
      }
    });


    // Move down after drawing the table
    doc.moveDown(data.length * 0.1 + 1);
  }


  // First Page //
  // Generate the PDF content
  //   //   // addLogo(doc);(doc);(doc);
  addWatermark(doc);
  // drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value:`${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    { key: "Loan Purpose", value:`${allPerameters.loanPurpose}`},
    { key: "Loan Type", value:`${allPerameters.loanType}` },
  ];
  drawTable("Loan Details", loanDetails);
  doc.moveDown()

  // function createStyledTable(doc, headers, tableData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const columnWidths = [150, 100, 150, 100]; // Column widths
  //   const rowHeight = 20; // Fixed row height
  //   const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
  //   // Draw headers
  //   doc
  //     .fillColor('#00BFFF') // Blue header background
  //     .rect(startX, startY, tableWidth, rowHeight) // Header rectangle
  //     .fill()
  //     .fillColor('black') // White text for headers
  //     .font('Helvetica-Bold')
  //     .fontSize(8);
  
  //   headers.forEach((header, colIndex) => {
  //     const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  //     doc.text(header, cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //   });
  
  //   // Move to the next row (data rows)
  //   startY += rowHeight;
  
  //   tableData.forEach((row, rowIndex) => {
  //     const isGrayRow = rowIndex % 2 === 0;
  //     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
  //     // Draw background for the row
  //     doc
  //       .fillColor(rowColor)
  //       .rect(startX, startY, tableWidth, rowHeight)
  //       .fill();
  
  //     // Draw cell borders and content
  //     Object.values(row).forEach((cell, colIndex) => {
  //       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
  //       // Draw border
  //       doc
  //         .lineWidth(0.5)
  //         .strokeColor('black')
  //         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
  //         .stroke();
  
  //       // Add text content
  //       doc
  //         .fillColor('black')
  //         .font('Helvetica')
  //         .fontSize(7)
  //         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
  //     });
  
  //     // Move to the next row
  //     startY += rowHeight;
  //   });
  
  //   // Draw the outer table border
  //   doc
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, doc.y + 10, tableWidth, startY - doc.y - 10)
  //     .stroke();
  // }
  
  // Example usage
  function createStyledTable(doc, headers, tableData, isHeaderBoxed = false) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidths = [150, 100, 150, 100]; // Column widths
    const rowHeight = 20; // Fixed row height
    const tableWidth = columnWidths.reduce((acc, width) => acc + width, 0);
  
    // Draw header as a full box with proper borders
    if (isHeaderBoxed) {
      // Draw a black-bordered rectangle for the header
      doc
        .lineWidth(1) // Black border thickness
        .strokeColor('black') // Black border color
        .fillColor('#0066B1') // Blue background for the header
        .rect(startX, startY, tableWidth, rowHeight) // Rectangle enclosing header
        .fillAndStroke(); // Fill the background and stroke the border
  
      // Draw the header text inside the box
      doc
        .fillColor('white') // Black text color
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(headers[0], startX + 5, startY + 5, {
          width: tableWidth - 10, // Center text within the header box
          align: 'left',
        });
  
      startY += rowHeight; // Move to the next row
    }
  
    // Draw table rows
    tableData.forEach((row, rowIndex) => {
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, tableWidth, rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  
    // Draw the outer border for the entire table
    // doc
    //   .lineWidth(0.5)
    //   .strokeColor('black')
    //   .rect(startX, doc.y + 10, tableWidth, startY - (doc.y + 10))
    //   .stroke();
  }
  const headers1 = ['Product Details'];
  const tableData1 = [
    { col1: 'Business Loan', col2: 'NA', col3: 'Personal Loan', col4: 'NA' },
    { col1: 'Working Capital Term Loan/Business Loan Secured', col2: 'NA', col3: 'Home Loan', col4: 'NA' },
    { col1: 'Loan Against Property/Shed Purchase', col2: 'MICRO LAP', col3: 'Others', col4: 'NA' },
  ];
  
  const headers2 = ['Product Program Details'];
  const tableData2 = [
    { col1: 'Industry Type', col2: 'NA', col3: 'Sub Industry Type', col4: 'NA' },
    { col1: 'Product Type', col2: 'MICRO LAP', col3: 'Secured/Unsecured', col4: 'SECURED' },
    { col1: 'Property Value', col2: 'NA', col3: 'BT EMI Value', col4: 'NA' },
    { col1: 'Program', col2: 'NA', col3: '', col4: '' },
  ];
  
  // Draw tables
  createStyledTable(doc, headers1, tableData1,true);
  doc.moveDown()

  createStyledTable(doc, headers2, tableData2,true);
  
  // Sourcing Details Section

//   const sourcingDetails = [{
//     key:`Sourcing Type`,
//     value: `${allPerameters.sourceType}` || "NA",

//   }, {
//     key: "Gen Partner Name",
//     value: allPerameters.genPartnerName || "NA",
//   }, {
//     key: "Sourcing Agent Name : ",
//     value: allPerameters.sourcingAgentName || "NA",
//   }, {
//     key: "Sourcing Agent Code : ",
//     value: allPerameters.sourcingAgentCode || "NA",
//   }, {
//     key: "Sourcing Agent Location : ",
//     value: allPerameters.sourcingAgentLocation || "NA",
//   }, {
//     key: "Sourcing RM Name : ",
//     value: allPerameters.sourcingRMName || "NA",
//   }, {
//     key: "Sourcing RM Code : ",
//     value: allPerameters.sourcingRMCode || "NA",
//   }]

//   drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
//   const productProgramDetails = [
//     { key: "Industry Type", value: "FIN COOPERS" },
//     { key: "Sub Industry Type", value: "FIN COOPERS" },
//     { key: "Product Type", value: "SECURED" },
//     { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
//     { key: "Secured/Un-Secured", value: "SECURED" },
//     { key: "Property Value", value: "Rs. 500000" },
//     { key: "BT EMI Value", value: "NA" },
//   ];
//   drawTable("Product Program Details", productProgramDetails);
//  addFooter(doc);
    //   // addLogo(doc);(doc);(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  // doc.moveDown(2)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });



 
  





//original working code

function drawTablenewW(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}







// function drawTablenew(sectionTitle, data, imagePath) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   // const startX = 49;
//   const startX = titleX;

//   let startY = doc.y + titleHeight;
//   const rowHeight = 20;
//   // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//   const columnWidthsFirst5 = [125, 275]; // Two-column layout

//   const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//   const imageWidth = 100;
//   const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//   // Special row for section title
//   doc.rect(startX, startY, titleWidth, rowHeight)
//      .fill("#00BFFF")
//      .strokeColor("black")
//      .lineWidth(1)
//      .stroke();

//   doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//      .text(sectionTitle, startX + 5, startY + 8);
  
//   startY += rowHeight;

//   const imageSpanRows = 5;
//   const imageHeight = imageSpanRows * rowHeight;

//   data.forEach((row, index) => {
//       const rowY = startY + index * rowHeight;
      
//       if (index < 5) {
//         const columnWidths = columnWidthsFirst5;

//           // First 5 rows: two-column layout + image
//           doc.rect(startX, rowY, columnWidths[0], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//              .strokeColor("black")
//              .lineWidth(1)
//              .stroke();

//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//           if (index === 0) {
//               doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();

//               if (fs.existsSync(imagePath)) {
//                   doc.image(imagePath, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                       fit: [imageWidth - 10, imageHeight - 10]
//                   });
//               } else {
//                   doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                      .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//               }
//           }
//       } else if (index === 5 || index === 7) {
//           // 6th and 8th row transition to 4-column layout
//           columnWidths[0] = columnWidths[1] = 125;

//           // Draw four cells for these rows
//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       } else {
//           // 7th row and beyond: four-column layout without image
//           columnWidths[0] = columnWidths[1] = 125;

//           for (let i = 0; i < 4; i++) {
//               doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                  .strokeColor("black")
//                  .lineWidth(1)
//                  .stroke();
//           }
//           doc.font('Helvetica').fontSize(8).fillColor("#000000")
//              .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//              .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//       }
//   });
// }




  
 
const applicantDetailsData = [
  // First 5 rows - 2 columns with key-value pairs Applicant Mother's Name
  { key: "Applicant Type", value: `${allPerameters.appType}` },
  { key: "Business Type", value: `${allPerameters.buisnessType}` },
  { key: "Applicant Name", value: `${allPerameters.borrowerName}`},
  { key: "Applicant Father's/Spouse Name", value: `${allPerameters.appFather}` },
  { key: "Applicant Mother's Name.", value: `${allPerameters.appMother}` },

  { key1: "Mobile No.", value1: `${allPerameters.appMob1}`, key2: "Mobile No2.", value2: `${allPerameters.appMob2}` },

  // Row 6 - 4 columns
  { key1: "Email ID", value1: `${allPerameters.appEmail}` },

  // Row 7 - 2 columns with key-value pair
  { key1: "Educational Details", value1:`${allPerameters.appEdu}`, key2: "Religion", value2: `${allPerameters.appReligion}`},

  // Row 8 - 4 columns
  { key1: "Date Of Birth/Incorporation", value1:`${allPerameters.appDOB}`, key2: "Nationality", value2: `${allPerameters.appNationality}` },

  // Remaining rows - 4 columns layout
  { key1: "Gender", value1: `${allPerameters.appGender}`, key2: "Category", value2: `${allPerameters.appCategory}` },
  { key1: "Marital Status", value1: `${allPerameters.appMaritalStatus}`, key2: "No. of Dependents", value2: `${allPerameters.appNoOfDependentd}`},
  { key1: "Pan Number", value1: `${allPerameters.appPan}`, key2: "Voter Id Number ", value2: `${allPerameters.AppVoterId}` },
  { key1: "Aadhar Number", value1: `${allPerameters.appAdhar}`, key2: "Udyam Number", value2: `${allPerameters.appUshyamAdharNumber}`},
  // { key1: "Aadhar Number", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];




// //console.log("Applicant Details Data:", applicantDetailsData);
// const imagePath = "./uploads/applicant_photo.jpg";

const saveImageLocally = async (imageUrl) => {
  try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const filePath = path.join(__dirname, `../../../../../uploads`, "applicant_photo.jpg");

      fs.writeFileSync(filePath, Buffer.from(buffer));
      return filePath; // Yahi path PDF me pass karna hai
  } catch (error) {
      console.error("Error saving image:", error);
      return null;
  }
};

// (async () => {
  const imagePath = await saveImageLocally(`${allPerameters.appImage}`);
// const imagePath = path.join(__dirname, `../../../../..${allPerameters.appImage}`);


const sectionTitle = "Applicant Details";
drawTablenew(sectionTitle, applicantDetailsData, imagePath);


  // drawTablenew(doc, applicantDetails,"Guarantor Details", imagelogo);
  // drawTablenew(doc, applicantDetails, imagelogo,"Applicant Details");

  doc.moveDown()

  
//   drawTablenew(doc, "Co-Applicant Details", applicantDetails, imagelogo);
function createStyledTable1(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}



  const title = [" Present/Communication Address"]; // For the first row
const tableData = [
  { col1: "Address as per Aadhar ", col2: `${allPerameters.loacalAdharAdress}` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.localCity}` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.localDistrict}`, col3: "State", col4: `${allPerameters.loacalState}` },
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code ", col4: `${allPerameters.localPin}` },
  { col1: "Present Address is ", col2: `${allPerameters.appResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.AppYearsAtCureentAdress}` },

];
createStyledTable1(doc, title, tableData);
doc.moveDown(3)


  
  function createCustomTableWithCheckbox(doc, titlepe12, tableDatacheckpe12) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
    const padding = 5; // Padding inside each cell
  
    const drawCheckbox = (doc, x, y, size, isChecked) => {
        doc
            .rect(x, y, size, size) // Draw checkbox square
            .stroke();
        if (isChecked) {
            doc
                .moveTo(x, y + size / 2)
                .lineTo(x + size / 3, y + size - 2)
                .lineTo(x + size - 2, y + 2)
                .strokeColor('black')
                .stroke();
        }
    };
  
    const calculateRowHeight = (row, columnWidths) => {
        let maxHeight = 0;
        Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
            const text = cell || 'NA';
            const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
            maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
        });
        return maxHeight;
    };
  
    // Calculate total table width
    const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (header row)
    const titleHeight = 20; // Fixed title height
    doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title border
        .stroke();
  
    doc
        .fillColor('white') // Text color
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });
  
    startY += titleHeight; // Move to the next row
  
    // Process table rows
    tableDatacheckpe12.forEach((row, rowIndex) => {
        let columnWidths;
        if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
            // Rows 1, 2, and 6 use 2 columns
            columnWidths = columnWidthsFirstRow;
        } else {
            // Rows 3 to 5 use 4 columns
            columnWidths = columnWidthsOtherRows;
        }
  
        const numColumns = columnWidths.length;
  
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
        // Calculate row height dynamically
        const rowHeight = calculateRowHeight(row, columnWidths);
  
        // Draw background for the row
        doc
            .fillColor(rowColor)
            .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
            .fill();
  
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
            const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
            // Draw border
            doc
                .lineWidth(0.5)
                .strokeColor('black')
                .rect(cellX, startY, columnWidths[colIndex], rowHeight)
                .stroke();
  
            // Add content
            if (rowIndex === 0 && colIndex === 1) {
                // Add checkbox in 1st row, 2nd column
                drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
            } else {
                const text = cell || 'NA';
                doc
                    .fillColor('black')
                    .font('Helvetica')
                    .fontSize(7)
                    .text(text, cellX + padding, startY + padding, {
                        width: columnWidths[colIndex] - 2 * padding,
                        align: 'left',
                        lineBreak: true,
                    });
            }
        });
  
        startY += rowHeight; // Move to the next row
    });
  }

  const title1 = "Permanent Address"; // Table header
const tableDatacheck = [
  { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.appadharadress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.appCityName}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.appdistrict}`, col3: "State", col4: `${allPerameters.AppState}`}, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code", col4:`${allPerameters.AppPin}`}, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.appResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckbox(doc, title1, tableDatacheck);
  // drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
//  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)




function createStyledTableocc2(doc, titlet, tableDatat) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlet, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatat.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlet = ["Employement/Business Details"]; // For the first row
const tableDatat = [
  { col1: "Occupation ", col2: `${allPerameters.occupation}  `, col3: "Monthly Income", col4: `${allPerameters.monthlyIncome}  ` }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional", col2: `${allPerameters.isSelfEmployed}  `, col3: "Other Income", col4: `${allPerameters.otherIncome}  ` },
  { col1: "Firm Name M/S ", col2: `${allPerameters.firstName}  ` }, // First row (2 columns)
  { col1: "Type of Firm", col2: `${allPerameters.firmType}  `, col3: "Nature of Business ", col4: `${allPerameters.natureBuisness}` },
  { col1: "MSME Classification ", col2: `${allPerameters.msmeClassification}  `, col3: "UDYAM Registration No./Udyog Adhar", col4: `${allPerameters.appudhyam}  ` },

];

createStyledTableocc2(doc, titlet, tableDatat);

function createStyledTablereg(doc, titlereg, tableDatareg) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg = ["Registered Address of the Entity"]; // For the first row
const tableDatareg = [
  { col1: "Address ", col2: `${allPerameters.entityAdress}  ` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.entityLandmark}  `, col3: "Name of City/Town/Village", col4: `${allPerameters.entityCityTown}  ` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.entityDistrict}  `, col3: "State", col4: `${allPerameters.entityState}  ` },
  { col1: "Country", col2: `${allPerameters.entityCountry}  `, col3: "PIN Code ", col4: `${allPerameters.entitypin}  ` },
  { col1: "Mobile No.", col2: `${allPerameters.entityMobile}  `, col3: "Email Id", col4: `${allPerameters.entityemail}  ` },

];
createStyledTablereg(doc, titlereg, tableDatareg);

function createStyledTableop(doc, titleop, tableDataop) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop = ["Operating Address of the Entity"]; // For the first row
const tableDataop = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop(doc, titleop, tableDataop);

  

  // drawNewPage(ParmentAddress2);
  // drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
//  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
    //   // addLogo(doc);(doc);(doc);
  // drawBorder()
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("SECTION 2:Co-Applicant Details", { underline: true });

//   function drawTablenew1(sectionTitle1, data, imagePath1) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const titleWidth = doc.page.width - 2 * titleX;

//     // const startX = 49;
//     const startX = titleX;

//     let startY = doc.y + titleHeight;
//     const rowHeight = 20;
//     const columnWidthsFirst5 = [125, 275]; // Two-column layout

//     // const columnWidths = [150, 150, 100, 100]; // Adjusted column widths for 4-column layout
//     const columnWidths = [200, 200, 200, 200]; // Adjusted column widths for 4-column layout

//     const imageWidth = 100;
//     const totalWidth = columnWidthsFirst5[0] + columnWidthsFirst5[1] + imageWidth;

//     // Special row for section title
//     doc.rect(startX, startY, titleWidth, rowHeight)
//        .fill("#00BFFF")
//        .strokeColor("#151B54")
//        .lineWidth(1)
//        .stroke();

//     doc.font('Helvetica-Bold').fontSize(10).fillColor("black")
//        .text(sectionTitle1, startX + 5, startY + 8);
    
//     startY += rowHeight;

//     const imageSpanRows = 5;
//     const imageHeight = imageSpanRows * rowHeight;

//     data.forEach((row, index) => {
//         const rowY = startY + index * rowHeight;
        
//         if (index < 5) {
//           const columnWidths = columnWidthsFirst5;

//             // First 5 rows: two-column layout + image
//             doc.rect(startX, rowY, columnWidths[0], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.rect(startX + columnWidths[0], rowY, columnWidths[1], rowHeight)
//                .strokeColor("black")
//                .lineWidth(1)
//                .stroke();

//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[1] - 10 });

//             if (index === 0) {
//                 doc.rect(startX + columnWidths[0] + columnWidths[1], rowY, imageWidth, imageHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();

//                 if (fs.existsSync(imagePath1)) {
//                     doc.image(imagePath1, startX + columnWidths[0] + columnWidths[1] + 5, rowY + 5, {
//                         fit: [imageWidth - 10, imageHeight - 10]
//                     });
//                 } else {
//                     doc.font('Helvetica-Bold').fontSize(10).fillColor("#ff0000")
//                        .text("Image Not Found", startX + columnWidths[0] + columnWidths[1] + 10, rowY + imageHeight / 2 - 10);
//                 }
//             }
//         } else if (index === 5 || index === 7) {
//             // 6th and 8th row transition to 4-column layout
//             columnWidths[0] = columnWidths[1] = 125;

//             // Draw four cells for these rows
//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         } else {
//             // 7th row and beyond: four-column layout without image
//             columnWidths[0] = columnWidths[1] = 125;

//             for (let i = 0; i < 4; i++) {
//                 doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight)
//                    .strokeColor("black")
//                    .lineWidth(1)
//                    .stroke();
//             }
//             doc.font('Helvetica').fontSize(8).fillColor("#000000")
//                .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
//                .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
//         }
//     });
// }
function drawTablenew11(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 22;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

function drawTablenew1(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 275];
  const columnWidths = [125, 125, 125, 125];
  const columnWidthsTwo = [125, 375]; 
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    let rowHeight = 20; // Default row height

    // First 5 rows
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10;
    } 
    // 7th row should only have 2 columns
    else if (index === 7) {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidthsTwo[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidthsTwo[1] - 10, align: "left" })
      ) + 10;
    } 
    // Remaining rows (except 7th row) - 4 column layout
    else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10;
    }

    const rowY = startY;

    // First 5 rows with 2-column layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      if (index === 0) {
        doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

        if (fs.existsSync(imagePath)) {
          doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
            fit: [imageWidth - 10, imageHeight - 10],
          });
        } else {
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
            .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        }
      }
    } 
    // 7th row with only 2 columns
    else if (index === 6) {
      doc.rect(startX, rowY, columnWidthsTwo[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsTwo[0], rowY, columnWidthsTwo[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidthsTwo[0] - 10 })
        .text(row.value1, startX + columnWidthsTwo[0] + 5, rowY + 5, { width: columnWidthsTwo[1] - 10 });
    } 
    // Other rows with 4-column layout
    else {
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

  const coapplicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType}` },
    { key: "Business Type", value: `${allPerameters.coAppbuiType}` },
    { key: "Co-Applicant Name", value: `${allPerameters.coAppName}` },
    { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather}` },
    { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother}` },
    { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob1}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.coAppEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.coAppEdu}`, key2: "Religion", value2: `${allPerameters.coAppreligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob}`, key2: "Nationality", value2: `${allPerameters.coAppNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1:  `${allPerameters.coAppGender}`, key2: "Category", value2:  `${allPerameters.coAppCategory}` },
    { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd}`},
    { key1: "Pan Number", value1:  `${allPerameters.coAppPan}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId}` },
    { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  const saveImageLocally1 = async (imageUrl) => {
      try {
          const response = await fetch(imageUrl);
          const buffer = await response.arrayBuffer();
          const filePath = path.join(__dirname, `../../../../../uploads`, "Coapplicant1_photo.jpg");
    
          fs.writeFileSync(filePath, Buffer.from(buffer));
          return filePath; // Yahi path PDF me pass karna hai
      } catch (error) {
          console.error("Error saving image:", error);
          return null;
      }
    };
    
    
    // const imagePath = "./uploads/applicant_photo.jpg";
    // const imagePath1 = path.join(__dirname, `../../../../..${allPerameters.co1Image}`);
    const imagePath1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  
  const sectionTitle1 = "Co-Applicant Details";
  drawTablenew1(sectionTitle1, coapplicantDetailsData, imagePath1);
  doc.moveDown()


//   function createStyledTablep(doc, titlep, tableDatap) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
//   const rowHeight = 20; // Fixed row height

//   // Determine table width based on the first-row column widths
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (full-width, blue background, with black border)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title row border
//     .stroke();

//   // Add the title text
//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlep, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

//   // Move to the next row
//   startY += rowHeight;

//   // Process table rows
//   tableDatap.forEach((row, rowIndex) => {
//     // Conditional column widths: first row has 2 columns, others have 4 columns
//     const isFirstRow = rowIndex === 0;
//     const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add text content
//       doc
//         .fillColor('black')
//         .font('Helvetica')
//         .fontSize(7)
//         .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });

//   // Draw the outer table border (around the entire table, excluding individual cell borders)
//   // const outerHeight = tableData.length * rowHeight + rowHeight; // Total height = rows + title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, outerHeight)
//   //   .stroke();
// }
function createStyledTablep(doc, title, tableData) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  const titleHeight = 20; // Fixed title height
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, titleHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // Black text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += titleHeight;

  // Process table rows
  tableData.forEach((row, rowIndex) => {
    // Determine column widths
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Calculate the row height dynamically based on the tallest cell
    let rowHeight = 0;
    const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
      const columnWidth = columnWidths[colIndex] - 10; // Account for padding
      return doc.heightOfString(cell || 'NA', {
        width: columnWidth,
        align: 'left',
      });
    });
    rowHeight = Math.max(...cellHeights) + 10; // Add padding

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}

  const titlep = [" Present/Communication Address"]; // For the first row
const tableDatap = [
  { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress}` }, // First row (2 columns)
    { col1: "Landmark ", col2:  `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2:  `${allPerameters.coAppdistrict}`, col3: "State", col4:  `${allPerameters.coAppState}` },
    { col1: "Country", col2:  `${allPerameters.coAppCountry}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN}` },
    { col1: "Present Address is ", col2:  `${allPerameters.coResidence}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress}` },
  
  ];
createStyledTablep(doc, titlep, tableDatap);
doc.moveDown(3)

// function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//   const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//   const rowHeight = 20; // Fixed row height

//   const drawCheckbox = (doc, x, y, size, isChecked) => {
//     doc
//       .rect(x, y, size, size) // Draw checkbox square
//       .stroke();
//     if (isChecked) {
//       doc
//         .moveTo(x, y + size / 2)
//         .lineTo(x + size / 3, y + size - 2)
//         .lineTo(x + size - 2, y + 2)
//         .strokeColor('black')
//         .stroke();
//     }
//   };

//   // Calculate total table width
//   const tableWidth = Math.max(
//     columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//     columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//   );

//   // Draw the title (header row)
//   doc
//     .fillColor('#00BFFF') // Blue background
//     .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//     .fill()
//     .lineWidth(0.5)
//     .strokeColor('black')
//     .rect(startX, startY, tableWidth, rowHeight) // Title border
//     .stroke();

//   doc
//     .fillColor('black') // White text
//     .font('Helvetica-Bold')
//     .fontSize(10)
//     .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });

//   startY += rowHeight; // Move to the next row

//   // Process table rows
//   tableDatacheckpe.forEach((row, rowIndex) => {
//     let columnWidths;
//     if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//       // Rows 1, 2, and 6 use 2 columns
//       columnWidths = columnWidthsFirstRow;
//     } else {
//       // Rows 3 to 5 use 4 columns
//       columnWidths = columnWidthsOtherRows;
//     }

//     const numColumns = columnWidths.length;

//     // Alternating row colors
//     const isGrayRow = rowIndex % 2 === 0;
//     const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

//     // Draw background for the row
//     doc
//       .fillColor(rowColor)
//       .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//       .fill();

//     // Draw cell borders and content
//     Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//       const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

//       // Draw border
//       doc
//         .lineWidth(0.5)
//         .strokeColor('black')
//         .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//         .stroke();

//       // Add content
//       if (rowIndex === 0 && colIndex === 1) {
//         // Add checkbox in 1st row, 2nd column
//         drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//       } else {
//         doc
//           .fillColor('black')
//           .font('Helvetica')
//           .fontSize(7)
//           .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//       }
//     });

//     startY += rowHeight; // Move to the next row
//   });

//   // Draw the outer table border (around the entire table)
//   // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//   // doc
//   //   .lineWidth(0.5)
//   //   .strokeColor('black')
//   //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//   //   .stroke();
// }
function createCustomTableWithCheckboxpe(doc, titlepe12, tableDatacheckpe12) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
  const padding = 5; // Padding inside each cell

  const drawCheckbox = (doc, x, y, size, isChecked) => {
      doc
          .rect(x, y, size, size) // Draw checkbox square
          .stroke();
      if (isChecked) {
          doc
              .moveTo(x, y + size / 2)
              .lineTo(x + size / 3, y + size - 2)
              .lineTo(x + size - 2, y + 2)
              .strokeColor('black')
              .stroke();
      }
  };

  const calculateRowHeight = (row, columnWidths) => {
      let maxHeight = 0;
      Object.values(row).slice(0, columnWidths.length).forEach((cell, colIndex) => {
          const text = cell || 'NA';
          const cellHeight = doc.heightOfString(text, { width: columnWidths[colIndex] - 2 * padding, fontSize: 7 });
          maxHeight = Math.max(maxHeight, cellHeight + 2 * padding);
      });
      return maxHeight;
  };

  // Calculate total table width
  const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (header row)
  const titleHeight = 20; // Fixed title height
  doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title border
      .stroke();

  doc
      .fillColor('white') // Text color
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titlepe12, startX + padding, startY + padding, { width: tableWidth - 2 * padding, align: 'left' });

  startY += titleHeight; // Move to the next row

  // Process table rows
  tableDatacheckpe12.forEach((row, rowIndex) => {
      let columnWidths;
      if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
          // Rows 1, 2, and 6 use 2 columns
          columnWidths = columnWidthsFirstRow;
      } else {
          // Rows 3 to 5 use 4 columns
          columnWidths = columnWidthsOtherRows;
      }

      const numColumns = columnWidths.length;

      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

      // Calculate row height dynamically
      const rowHeight = calculateRowHeight(row, columnWidths);

      // Draw background for the row
      doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();

      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

          // Draw border
          doc
              .lineWidth(0.5)
              .strokeColor('black')
              .rect(cellX, startY, columnWidths[colIndex], rowHeight)
              .stroke();

          // Add content
          if (rowIndex === 0 && colIndex === 1) {
              // Add checkbox in 1st row, 2nd column
              drawCheckbox(doc, cellX + padding, startY + padding, 10, true); // Draw checkbox with tick
          } else {
              const text = cell || 'NA';
              doc
                  .fillColor('black')
                  .font('Helvetica')
                  .fontSize(7)
                  .text(text, cellX + padding, startY + padding, {
                      width: columnWidths[colIndex] - 2 * padding,
                      align: 'left',
                      lineBreak: true,
                  });
          }
      });

      startY += rowHeight; // Move to the next row
  });
}

const titlepe = "Permanent Address"; // Table header
const tableDatacheckpe = [
{ col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
  { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
  { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
  { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
  { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
  { col1: "Present Address is", col2: `${allPerameters.coResidence}` }, // 6th row (2 columns)
];

createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

  


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]






  // drawTable3("Co-Applicant Details", coApplicantDetails, imagelogo);
  doc.moveDown(1)
  // drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);

//  addFooter(doc);

  // Add the new page for ParentAddresco //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc)
  doc.moveDown(3)
//   function createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe) {
//     const startX = 50; // Starting X position
//     let startY = doc.y + 10; // Starting Y position
//     const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
//     const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for rows 3 to 5
//     const rowHeight = 20; // Fixed row height
  
//     const drawCheckbox = (doc, x, y, size, isChecked) => {
//       doc
//         .rect(x, y, size, size) // Draw checkbox square
//         .stroke();
//       if (isChecked) {
//         doc
//           .moveTo(x, y + size / 2)
//           .lineTo(x + size / 3, y + size - 2)
//           .lineTo(x + size - 2, y + 2)
//           .strokeColor('black')
//           .stroke();
//       }
//     };
  
//     // Calculate total table width
//     const tableWidth = Math.max(
//       columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
//       columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
//     );
  
//     // Draw the title (header row)
//     doc
//       .fillColor('#00BFFF') // Blue background
//       .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
//       .fill()
//       .lineWidth(0.5)
//       .strokeColor('black')
//       .rect(startX, startY, tableWidth, rowHeight) // Title border
//       .stroke();
  
//     doc
//       .fillColor('white') // White text
//       .font('Helvetica-Bold')
//       .fontSize(10)
//       .text(titlepe, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left ' });
  
//     startY += rowHeight; // Move to the next row
  
//     // Process table rows
//     tableDatacheckpe.forEach((row, rowIndex) => {
//       let columnWidths;
//       if (rowIndex === 0 || rowIndex === 1 || rowIndex === 5) {
//         // Rows 1, 2, and 6 use 2 columns
//         columnWidths = columnWidthsFirstRow;
//       } else {
//         // Rows 3 to 5 use 4 columns
//         columnWidths = columnWidthsOtherRows;
//       }
  
//       const numColumns = columnWidths.length;
  
//       // Alternating row colors
//       const isGrayRow = rowIndex % 2 === 0;
//       const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
//       // Draw background for the row
//       doc
//         .fillColor(rowColor)
//         .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
//         .fill();
  
//       // Draw cell borders and content
//       Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
//         const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
//         // Draw border
//         doc
//           .lineWidth(0.5)
//           .strokeColor('black')
//           .rect(cellX, startY, columnWidths[colIndex], rowHeight)
//           .stroke();
  
//         // Add content
//         if (rowIndex === 0 && colIndex === 1) {
//           // Add checkbox in 1st row, 2nd column
//           drawCheckbox(doc, cellX + 5, startY + 5, 10, true); // Draw checkbox with tick
//         } else {
//           doc
//             .fillColor('black')
//             .font('Helvetica')
//             .fontSize(7)
//             .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
//         }
//       });
  
//       startY += rowHeight; // Move to the next row
//     });
  
//     // Draw the outer table border (around the entire table)
//     // const totalHeight = tableData.length * rowHeight + rowHeight; // Includes title row
//     // doc
//     //   .lineWidth(0.5)
//     //   .strokeColor('black')
//     //   .rect(startX, doc.y + 10, tableWidth, totalHeight)
//     //   .stroke();
//   }

//   const titlepe = "Permanent Address"; // Table header
// const tableDatacheckpe = [
//   { col1: "Same as Communication address", col2: "" }, // 1st row (2 columns, checkbox in col2)
//     { col1: "Permanent Address", col2: `${allPerameters.coAppAdharAdress}` }, // 2nd row (2 columns)
//     { col1: "Landmark", col2: `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.coAppcity}` }, // 3rd row (4 columns)
//     { col1: "District Name ", col2: `${allPerameters.coAppdistrict}`, col3: "State", col4: `${allPerameters.coAppState}` }, // 4th row (4 columns)
//     { col1: "Country", col2: `${allPerameters.coAppCountry}`, col3: "PIN Code", col4: `${allPerameters.coAppPIN}` }, // 5th row (4 columns)
//     { col1: "Present Address is", col2: `${allPerameters.coAppcurentAdress}` }, // 6th row (2 columns)
//   ];

// createCustomTableWithCheckboxpe(doc, titlepe, tableDatacheckpe);

function createStyledTablee(doc, titlee, tableDatae) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 140, 110, 140]; // 4 columns for the first row
  const columnWidthsThirdRow = [110, 390]; // 2 columns for the third row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the widest row configuration
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsThirdRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlee, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatae.forEach((row, rowIndex) => {
    // Define column widths based on the row index
    let columnWidths;
    if (rowIndex === 0) {
      columnWidths = columnWidthsFirstRow; // First row
    } else if (rowIndex === 2) {
      columnWidths = columnWidthsThirdRow; // Third row
    } else {
      columnWidths = columnWidthsOtherRows; // Other rows
    }

    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });
}




  const titlee = ["Employement/Business Details"]; // For the first row
const tableDatae = [
  { col1: "Occupation ", col2: `${allPerameters.coappocuupation1}`, col3: "Monthly Income", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "If Self Employed Professional  ", col2: "NA", col3: "Other Income", col4: "NA" },
  { col1: "Firm Name M/S ", col2: "NA" }, // First row (2 columns)
  { col1: "Type of Firm", col2: "NA", col3: "Nature of Business ", col4: "NA" },
  { col1: "MSME Classification ", col2: "NA", col3: "UDYAM Registration No./Udyog Adhar", col4: "NA" },

];
createStyledTablee(doc, titlee, tableDatae);


function createStyledTablereg1(doc, titlereg1, tableDatareg1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titlereg1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDatareg1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titlereg1 = ["Registered Address of the Entity"]; // For the first row
const tableDatareg1 = [
  { col1: "Address as per Aadhar ", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },

];
createStyledTablereg1(doc, titlereg1, tableDatareg1);

function createStyledTableop1(doc, titleop1, tableDataop1) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsFirstRow = [110, 390] // 2 columns for the first row
  const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  const rowHeight = 20; // Fixed row height

  // Determine table width based on the first-row column widths
  const tableWidth = Math.max(
    columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
    columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
  );

  // Draw the title (full-width, blue background, with black border)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, tableWidth, rowHeight) // Title row rectangle
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, tableWidth, rowHeight) // Title row border
    .stroke();

  // Add the title text
  doc
    .fillColor('white') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text(titleop1, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Process table rows
  tableDataop1.forEach((row, rowIndex) => {
    // Conditional column widths: first row has 2 columns, others have 4 columns
    const isFirstRow = rowIndex === 0;
    const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
    const numColumns = columnWidths.length;

    // Alternating row colors
    const isGrayRow = rowIndex % 2 === 0;
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
      .fill();

    // Draw cell borders and content
    Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
      const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);

      // Draw border
      doc
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(cellX, startY, columnWidths[colIndex], rowHeight)
        .stroke();

      // Add text content
      doc
        .fillColor('black')
        .font('Helvetica')
        .fontSize(7)
        .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
    });

    // Move to the next row
    startY += rowHeight;
  });

}

  const titleop1 = ["Operating Address of the Entity"]; // For the first row
const tableDataop1 = [
  { col1: "Address", col2: "NA" }, // First row (2 columns)
  { col1: "Landmark ", col2: "NA", col3: "Name of City/Town/Village", col4: "NA" }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: "NA", col3: "State", col4: "NA" },
  { col1: "Country", col2: "NA", col3: "PIN Code ", col4: "NA" },
  { col1: "Mobile No.", col2: "NA", col3: "Email Id", col4: "NA" },
  { col1: "No. of Years in current business/job", col2: "NA", col3: "Business Premises is", col4: "NA" },

];
createStyledTableop1(doc, titleop1, tableDataop1);
//  addFooter(doc);


  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  // const CollateralsDetails = [
  //   { key: "Type", value: "RESIDENTIAL" },
  //   { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  // ]
  // drawTable("Collaterals Details", CollateralsDetails);
  function drawTableCollateral(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const pageMargin = 48; // Margin on each side
    const titleWidth = doc.page.width - 2 * titleX;

    // Start drawing the table
    const startX = titleX; // Start X position for the table
    let startY = doc.y + titleHeight; // Start Y position for the table
    const rowPadding = 5; // Padding inside each cell

    // Set column widths dynamically
    const defaultColumnWidths = [200, 300]; // Default two-column layout
    const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

    // Draw the special row at the top of the table (section title)
    const specialRowHeight = 23; // Height of the special row
    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .fill("#0066B1") // Light blue background color
        .strokeColor("#00BFFF")
        .lineWidth(1)
        .stroke();

    doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
        .strokeColor("black") // Black border
        .lineWidth(1)
        .stroke();

    // Add title text inside the special row
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("white")
        .text(sectionTitle, startX + rowPadding, startY + (specialRowHeight - 10) / 2, {
            width: titleWidth - 2 * rowPadding,
            align: "left",
        });

    // Move the Y position down after the special row
    startY += specialRowHeight;

    // Draw the table rows
    data.forEach((row, rowIndex) => {
        const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
        const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths;

        // Determine row height based on content
        let rowHeight = 20; // Minimum row height
        currentColumnWidths.forEach((width, colIndex) => {
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            const textHeight = doc
                .font(font)
                .fontSize(8)
                .heightOfString(text, { width: width - 2 * rowPadding });

            rowHeight = Math.max(rowHeight, textHeight + 2 * rowPadding);
        });

        // Draw the row cells
        let cellStartX = startX;
        currentColumnWidths.forEach((width, colIndex) => {
            // Draw cell border
            doc.rect(cellStartX, startY, width, rowHeight)
                .strokeColor("black")
                .lineWidth(1)
                .stroke();

            // Add text inside the cell
            const text = isSpecialRow
                ? row[colIndex] || "" // For special rows, use the value at index
                : colIndex === 0
                ? row.key
                : row.value; // For default rows, use key-value pairs

            doc.font(font)
                .fontSize(8)
                .fillColor("#000000")
                .text(text, cellStartX + rowPadding, startY + rowPadding, {
                    align: "left",
                    width: width - 2 * rowPadding,
                    lineBreak: true,
                });

            // Move to the next column
            cellStartX += width;
        });

        // Move to the next row
        startY += rowHeight;
    });

    // Move down after the table ends
    doc.y = startY + 10; // Add spacing after the table
}


//   function drawTablecolleteral(sectionTitle, data) {
//     doc.moveDown(1);
//     const titleHeight = 20;
//     const titleX = 48;
//     const pageMargin = 48; // Margin on each side
//     const titleWidth = doc.page.width - 2 * titleX;

//     // Start drawing the table
//     const startX = titleX; // Start X position for the table
//     let startY = doc.y + titleHeight; // Start Y position for the table
//     const rowHeight = 20; // Default row height

//     // Set column widths dynamically
//     const defaultColumnWidths = [200, 300]; // Default two-column layout
//     const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows

//     // Draw the special row at the top of the table (section title)
//     const specialRowHeight = 23; // Height of the special row
//     doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .fill("#00BFFF") // Light blue background color
//         .strokeColor("#00BFFF")
//         .lineWidth(1)
//         .stroke();

//         doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
//         .strokeColor("black") // Black border
//         .lineWidth(1)
//         .stroke();

//     // Add title text inside the special row
//     doc.font(fontBold)
//         .fontSize(10)
//         .fillColor("black")
//         .text(sectionTitle, startX + 5, startY + 8);

//     // Move the Y position down after the special row
//     startY += specialRowHeight;

//     // Draw the table rows
//     data.forEach((row, rowIndex) => {
//         const isSpecialRow = rowIndex === 2 || rowIndex === 3; // Rows 3 and 4 need 4 columns
//         const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
//         const cellHeight = rowHeight; // Fixed height for this example

//         // Draw the row cells
//         let cellStartX = startX;
//         currentColumnWidths.forEach((width, colIndex) => {
//             // Draw cell border
//             doc.rect(cellStartX, startY, width, cellHeight)
//                 .strokeColor("black")
//                 .lineWidth(1)
//                 .stroke();

//             // Add text inside the cell
//             const text = isSpecialRow
//                 ? row[colIndex] || "" // For special rows, use the value at index
//                 : colIndex === 0
//                 ? row.key
//                 : row.value; // For default rows, use key-value pairs

//             doc.font(font)
//                 .fontSize(8)
//                 .fillColor("#000000")
//                 .text(text, cellStartX + 5, startY + 5, {
//                     align: "left",
//                     width: width - 10,
//                     lineBreak: true,
//                 });

//             // Move to the next column
//             cellStartX += width;
//         });

//         // Move to the next row
//         startY += cellHeight;
//     });
// }

const CollateralsDetails = [
  { key: "Property Type", value: "Residential" },
  { key: "Property Address", value: `${allPerameters.technicalFullADDRESS}` },
  ["Name of Registered Owner", `${allPerameters.sellerName} & ${allPerameters.buyerName}`, "Relationship with Borrower", `${allPerameters.relationWithborrow}`],
  ["Area (In sq.ft)", `${allPerameters.sreaInSqFt}`, "Age of Property (In years)", `${allPerameters.propertyaGE}`],
  { key: "Market Value as on Date", value: `${allPerameters.marketValue} - ${allPerameters.marketValuetowor}` }
];

drawTableCollateral("Collaterals Details", CollateralsDetails);



  const BankDetails = [

    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  doc.moveDown(1)
  // Exact X and Y positioning without margins
  // Custom position with precise left alignment
  const customLeftPosition = 50; // Custom left offset in pixels
  const customWidth = 200; // Custom width for the text box, adjust as needed

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 5: Bank Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });


  drawTable("Bank Details", BankDetails)
  doc.moveDown(1);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor("#000000")
    .text("Section 6: Referance Details", customLeftPosition, doc.y, {
      underline: true,
      width: customWidth,  // Set the width of the text area to custom width
      align: "left",       // Align text within the custom width
    });
    function drawTableref(sectionTitle, data) {
      doc.moveDown(1);
      const titleHeight = 20;
      const titleX = 48;
      const pageMargin = 48; // Margin on each side
      const titleWidth = doc.page.width - 2 * titleX;
  
      // Start drawing the table
      const startX = titleX; // Start X position for the table
      let startY = doc.y + titleHeight; // Start Y position for the table
      const rowHeight = 20; // Default row height
  
      // Set column widths dynamically
      const defaultColumnWidths = [200, 300]; // Default two-column layout
      const specialColumnWidths = [200, 100, 125, 75]; // Four-column layout for specific rows
  
      // Draw the special row at the top of the table (section title)
      const specialRowHeight = 23; // Height of the special row
      doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .fill("#0066B1") // Light blue background color
          .strokeColor("#00BFFF")
          .lineWidth(1)
          .stroke();
  
          doc.rect(startX, startY, titleWidth, specialRowHeight) // Span the entire width
          .strokeColor("black") // Black border
          .lineWidth(1)
          .stroke();
  
      // Add title text inside the special row
      doc.font(fontBold)
          .fontSize(10)
          .fillColor("white")
          .text(sectionTitle, startX + 5, startY + 8);
  
      // Move the Y position down after the special row
      startY += specialRowHeight;
  
      // Draw the table rows
      data.forEach((row, rowIndex) => {
          const isSpecialRow = rowIndex === 0 || rowIndex === 4; // Rows 3 and 4 need 4 columns
          const currentColumnWidths = isSpecialRow ? specialColumnWidths : defaultColumnWidths; // Dynamic column widths
          const cellHeight = rowHeight; // Fixed height for this example
  
          // Draw the row cells
          let cellStartX = startX;
          currentColumnWidths.forEach((width, colIndex) => {
              // Draw cell border
              doc.rect(cellStartX, startY, width, cellHeight)
                  .strokeColor("black")
                  .lineWidth(1)
                  .stroke();
  
              // Add text inside the cell
              const text = isSpecialRow
                  ? row[colIndex] || "" // For special rows, use the value at index
                  : colIndex === 0
                  ? row.key
                  : row.value; // For default rows, use key-value pairs
  
              doc.font(font)
                  .fontSize(8)
                  .fillColor("#000000")
                  .text(text, cellStartX + 5, startY + 5, {
                      align: "left",
                      width: width - 10,
                      lineBreak: true,
                  });
  
              // Move to the next column
              cellStartX += width;
          });
  
          // Move to the next row
          startY += cellHeight;
      });
  }

  const ReferanceDetails = [
    ["Reference 1 - Name", `${allPerameters.ref1name} `, "Reference 1 - Relation", `${allPerameters.ref1rel}`],

    // { 
    //   key: "Reference 1 - Name", value: `${allPerameters.ref1name}      Reference 1 - Relation    |${allPerameters.ref1rel}` ,
    // },
    // { 
    //   key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    // },
    { 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
    //  {
    //    key: "Reference 2 - Name", value: `${allPerameters.ref2name}      |Reference 2 - Relation    |${allPerameters.ref2rel}`

    // },
    ["Reference 2 - Name", `${allPerameters.ref2name} `, "Reference 2 - Relation", `${allPerameters.ref2rel}`],

    // { key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

    //  },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTableref("Referance Detail", ReferanceDetails)




//  // addFooter(doc); 


  // Section - paragraph //

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(3)

  function drawTitletit(sectionTitle) {
    const titleHeight = 20;  // Height of the title bar
    const titleX = 48;  // X position for the title bar
    const titleWidth = doc.page.width - 2 * titleX;  // Width of the title bar
    
    const startY = doc.y;  // Y position (current position of the document)
    const titleBackgroundColor = "#0066B1";  // Background color (blue)
    
    // Draw the title background (rectangle)
    doc.rect(titleX, startY, titleWidth, titleHeight)
      .fill(titleBackgroundColor)
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
    
    // Add the title text inside the rectangle
    doc.font(fontBold)
      .fontSize(12)
      .fillColor("white")
      .text(sectionTitle, titleX + 5, startY + 5, {
        align: "center",
        width: titleWidth - 10,  // Adjust width to leave some padding
      });
  
    // Adjust y position for the content that follows
    doc.moveDown(1);
  }
  

//   doc.font('Helvetica-Bold')
// .fontSize(9)


// .text(
// `DECLARATION`,
// { align: 'justify', indent: 40, lineGap: 5 }
// );

drawTitletit("DECLARATION");

doc.font('Helvetica')
.fillColor("black")

.fontSize(9)
.text(`
1. I/We declare that we are citizens of India and all the particulars and information given in the application form is true,
correct and complete and no material information has been withheld/suppressed.
2. I/We shall adviseFCPL in writing of any change in my/our residential or employment/ business address.
3. I/We conirm that the funds shall be used for the stated purpose and will not be used for speculative or anti-social purpose.
4. I/We declare that I/we have not been in violation and shall not violate any provisions of the Prevention of Money
Laundering Act, 2002 and/ or any applicable law, rules, guidelines and circulars issued by the Reserve Bank of India
and/or any other statutory authority.
5. I/We authorise FCPL to make any enquiries regarding my/our application, including with other inance companies/registered credit bureau.
6.FCPL reserves the right to retain the photographs and documents submitted with this application and will not return the same to the applicant/s.
7. I/We have read the application form/ brochures and am/are aware of all the terms and conditions of availing inance from FCPL.
8. I/We understand that the sanction of this loan is at the sole discretion of FCPL and upon my/our executing necessary 
security (ies) and other formalities as required by FCPL and no commitment has been given regarding the same.
9. I/We authorise FCPL to conduct such credit checks as it considers necessary in its sole discretion and also authorise
FCPL to release such or any other information in its records for the purpose of credit appraisal/sharing for any other
purpose. I/We further agree that my/our loan shall be governed by the rules of FCPL which may be in force from time to
time.
10. I/We am/are aware that the upfront Legal, Technical, Processing fees, other fees and the applicable taxes collected from
me at the time of the application is non-refundable under any circumstances.
11. I/We am/are aware that FCPL does not accept any payment in cash. No payment in connection with the loan 
processing, sanction, disbursement, prepayment and repayment of loan shall be made to / in favour of any of
   FCPL intermediaries or any third party (ies) in cash or bearer cheque or in any other manner whatsoever.
12. No discount/free gift or any other commitment whatsoever has been which is not documented in the loan
agreement by FCPL or any of its authorised representatives.
13. I/We conirm that I/we have no insolvency proceedings initiated/pending against me/us nor have I/we ever been adjudicated insolvent.
14. Politically Exposed Person (PEP) Declaration:
Politically Exposed Persons” (PEPs) are individuals who are or have been entrusted with prominent public functions by a
foreign country, including the Heads of States.`,
{ align: 'justify',  lineGap: 5 }
).moveDown(0.1);

doc.font('Helvetica')
.fontSize(9)
.fillColor("black")

.text(`
/ Governments, senior politicians, senior government or judicial or military of oficers, senior executives of state-owned corporations and important 
Please tick Yes / No:
A.Applicant PEP/Relatives and close Associate of PEP ( ) Yes ( ) No
B.Co-Applicant PEP or Relatives and close Associate of PEP ( ) Yes ( ) No`,
{ align: 'justify',  lineGap: 5 }
).moveDown();


//  // addFooter(doc); 

  doc.addPage()
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(5)

  doc.font('Helvetica')
  .fillColor("black")

.fontSize(9)
.text(`
15. The tenure/repayment/interest/other terms and conditions of the loan are subject to change as a consequence to any 
change in the money market conditions or on account of any other statutory or regulatory requirements or at FCPL 
discretion.   FCPL reserves the right to review and amend the terms of the loan in such manner and to such extent as
it may deem it.
16. I/We hereby declare and conirm if any detail or declaration made by me/us, if found to be false, then FCPL will be entitled to revoke and/or rec.
17. I/We hereby declare and conirm that any purchase by me/us of any insurance product is purely voluntary and is not
linked to availing of any credit facility from FCPL.
18. I/We hereby declare that the details furnished above are true and correct to the best of my/our knowledge and belief and
I/we undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false
or untrue or misleading or misrepresenting, I/we am/are aware that | /we may be held liable for it.
19. That there has never been an award or an adverse judgement or decree in a court case involving breach of contract, tax
malfeasance or other serious misconduct which shall adversely affect my/our ability to repay the loan.
20. I/We have never been a defaulter withFCPL or any other inancial institution.
21. That if any discrepancy is found or observed from the information given above and the documents produced in support 
thereof,  FCPL shall have the sole discretion to cancel the sanction at any stage and recall the loan if already disbursed
,in such an event, the processing fee shall be liable to be forfeited.
22. I/We permitFCPL to contact me/us with respect to the products and services being offered by FCPL or by any other
person (s) and further allowFCPL to cross sell the other products and services offered by such other person(s).
23. I/We further agree to receive SMS alerts/whatsapp/emails/letters etc. related to my/our application status and account
activities as well as product use messages  that FCPL and/or its group companies will send, from time to time on my/our 
mobile no./emails/letters etc as mentioned in this Application Form.
24. I/We conirm that laws in relation to the unsolicited communications referred in 'National Do Not Call Registry' as laid
down by 'Telecom Regulatory Authority of India' will not be applicable for such information/communication to me/us.
26. I/We shall create security and/or furnish guarantee in favour of FCPL as may be required.
27. I hereby submit voluntarily at my own discretion, the physical copy of Aadhaar card/physical e-Aadhaar / masked
Aadhaar / ofline electronic Aadhaar xml as issued by UIDAI (Aadhaar), toFCPL for the purpose of establishing my
identity / address proof.
28. The consent and purpose of collecting Aadhaar has been explained to me in local language.  FCPL has informed me
that my Aadhaar submitted toFCPL herewith shall not be used for any purpose other than mentioned above, or as per requirements of law.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();




  


  
//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  drawTitletit("CKYC Explicit Consent");

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
    |/We, give my/our consent to download my/our KYC Records from the Central KYC Registry (CKYCR), only for the 
    purpose of veriication of my identity and address from the database of CKYCR Registry.
    I/we understand that my KYC Record includes my/our KYC Records / Personal information such as my/our
    name, address, date of birth / PAN num.
    I/We agree that my / our personal KYC details may be shared with Central KYC Registry or any other competent
    authority. | (we hereby consent to receive information from the Ratnaafin Capital Private Limited / Central
    KYC Registry or any other competent authority through SMS/email on my registered mobile number / e-mail
    address. | also agree that the non-receipt of any such SMS/e-mail shall not make the FCPL liable for any
    loss or damage whatsoever in nature.
    I/We hereby declare that there is no change in existing details and the details provided in CKYCR are updated as
    on date.
    
    Date :- ${allPerameters.date}                                                                                        PLACE:-   ${allPerameters.branchName}

    Applicant's signature                                                                                                Co-Applicant's signature                  `,
     
  { align: 'justify',  lineGap: 5 }
  ).moveDown();

  drawTitletit("For detailed list of charges & penal charges please visit www.ratnaafin.com");
  doc.moveDown();
  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`TheFCPL's Sales Representative conirms he has: 
    (a) Collected self-attested copies of the above mentioned documents from the customer 
    (b) Not been given any payment in cash, bearer cheque or kind along with or in connection with this Loan application 
    from the customer.
    (c) Informed me/us that service tax and all other statutory taxes, levies including stamp duties and registration
    costs (if any), other fees, commissions, charges as may be applicable will be charged in connection with the loan. 
    (d) Informed me/us that the FCPL will not be liable for loss or delay in receipt of documents.
    (e) Informed me/us at incomplete / defective application will not be processed and the FCPL shall not be responsible in
    any manner for the resulting delay or otherwise. Notwithstanding the afore stated, the submission of loan application
    to the FCPL does not imply automatic approval by the FCPL and the FCPL will decide the quantum of the loan at 
    its sole and absolute discretion. TheFCPL in its sole and absolute discretion may either sanction or reject the
    application for granting the loan. In case of rejection, the FCPL shall communicate the reason for rejection.
    (f) Informed me/us that loan application may be disposed by FCPL within 30 working days of receipt of the same subject 
    to submission of all documents and details as may be required by FCPL in processing the Loan along with the 
    requisite fees. 
    (g) TheFCPL reserves its right to reject the loan application and retain the loan application form along with the
    photograph, information and documents.
  `,
{ align: 'justify',  lineGap: 5 }
);

//  // addFooter(doc); 

  // add the new page for section 7
  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown()

  doc.font('Helvetica')
  .fillColor("black")

  .fontSize(9)
  .text(`
 (h) Informed to me/us that the FCPL shall have the right to make disclosure of any information relating to me/us including
  personal information, details in relation to loan, defaults, security, etc to the Credit Information Bureau of India 
  (CIBIL) and/or any other governmental/regulatory/statutory or private agency/entity,credit bureau, RBI, the FCPL’s other
  branches / subsidiaries / afiliates/ rating agencies, service providers, other Banks / inancial institutions, any third
  parties, any assigns / potential assignees or transferees, who may need, process and publish the information in such
  manner and through such medium as it may be deemed necessary by the publisher /  FCPL/ RBI, including publishing the 
  name as part of wilful defaulter’s list from time to time, as also use for KYC information veriication, credit risk
  analysis, or for other related purposes.
 (i) Informed & explained me/us all the charges and terms and conditions mentioned overleaf.
 (j) Informed me/us that the FCPL will send the Offer Letter to me/us on the e-mail ID mentioned by me/us in the loan application.
`,
{ align: 'justify',  lineGap: 5 }
).moveDown();

doc.font('Helvetica-Bold')
  .fontSize(9)
  .text(`
Do not Sign This Form if its Blank. Please Ensure all relevant sections and documents are completely filled to your satisfaction and then only sign the form 
`,
{ align: 'justify',  lineGap: 5 }
);

function createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const columnWidthsTitle = [500]; // Width for the title row
  const columnWidthsTable = [50, 450]; // Column widths: Sr. No (50), Particulars (450)
  const rowHeight = 20; // Fixed height for rows

  // Draw Table Title 1
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('white')
    .text(tableTitle1, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Title 2
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Header (Table Title 3)
  doc
    .fillColor('#d9d9d9') // Gray background
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('black')
    .text(tableTitle3, startX + 5, startY + 5, { width: columnWidthsTable[0] + columnWidthsTable[1] - 10, align: 'left' });

  // Move to the next row
  startY += rowHeight;

  // Draw Table Rows
  tableDatatable.forEach((row, rowIndex) => {
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    const currentRowHeight = rowIndex === 0 ? 30 : rowHeight;


    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], currentRowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], currentRowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += currentRowHeight;
  });
}

const tableTitle1 = "DOCUMENTS CHECKLIST";
const tableTitle2 = "Login Documents";
const tableTitle3 = `Sr. No                                                 Particulars`;
const tableDatatable = [
{ srNo: "1", particulars: "KYC of Borrower and Co-Borrowers/Guarantors (Firm/Company) – PAN Card, COI, MOA, AOA, Udyam Registration Certiicate with Annexures, All Partnership Deed, All LLP Deed, GST Registration Certiicate (3 Pages) (For all states)." },
{ srNo: "2", particulars: "KYC Borrower and Co-Borrowers/Guarantors (Individuals/Proprietor/Partners): PAN Card and Aadhaar Card." },
{ srNo: "3", particulars: "Udyam Registration Certificate of Borrower." },
{ srNo: "4", particulars: "Application Form & CIBIL Consent." },
{ srNo: "5", particulars: "Business and Residence photos." },
{ srNo: "6", particulars: "Electricity Bill / Gas Dairy,Samagra ID (In Madhya Pradesh, the Samagra ID is a unique nine-digit number given to residents)" },
{ srNo: "7", particulars: "All CA/CC Bank Account statement for last 6 Months (In PDF)." },
{ srNo: "8", particulars: "ITR with Computation of Income for last 1 Year (If available)." },
{ srNo: "9", particulars: "Income Proof Documents." },
{ srNo: "10", particulars: "Latest Sanction letter of Existing loans with Statement of Account." },
{ srNo: "11", particulars: "CIBIL Reports of Borrower and Co-Borrowers/Guarantors." },
{ srNo: "12", particulars: "Farm CIBIL (On best effort basis)." },
{ srNo: "13", particulars: "BSV (Bank Signature Verification)." },
{ srNo: "14", particulars: "Legal Report, Technical Report." },
{ srNo: "15", particulars: "PD Report." },
{ srNo: "16", particulars: "FI / RCU / FCU Report." },
{ srNo: "17", particulars: "Property Documents." },
];

createChecklistTable(doc, tableTitle1, tableTitle2, tableTitle3, tableDatatable);


//  // addFooter(doc); 

  doc.addPage();
  // drawBorder()
    //   // addLogo(doc);(doc);(doc);
  doc.moveDown(1)


 
 
 
  // function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Property Documents" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Title: "Sr. No | Particulars" ===
  //   // Sr. No Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, columnWidths[0], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Sr. No', startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Header
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //     .fill()
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text('Particulars', startX + columnWidths[0] + 5, startY + 5, {
  //       width: columnWidths[1] - 10,
  //       align: 'left',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 3rd Title: "Gram Panchayat Patta Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableTitles[1], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === Rows with Sr. No and Particulars ===
  //   const rowHeightWithBullets =
  //     tableRow.particulars.length * bulletSpacing > rowHeight
  //       ? tableRow.particulars.length * bulletSpacing
  //       : rowHeight;
  
  //   // Sr. No Column
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(tableRow.srNo, startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // Particulars Column with Bullet Points
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   tableRow.particulars.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   startY += rowHeightWithBullets; // Move to the next row
  //       // startY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;

  //   // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Footer background color
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text(footerText, startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });

  // }

  function drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const rowHeight = 20; // Default row height
    const bulletSpacing = 5; // Minimum spacing for bullet points in "Particulars"

    // === 1st Title: "Property Documents" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black')
        .text(tableTitles[0], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === 2nd Title: "Sr. No | Particulars" ===
    // Sr. No Header
    doc.fillColor('#d9d9d9').rect(startX, startY, columnWidths[0], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Sr. No', startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Header
    doc.fillColor('#d9d9d9').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text('Particulars', startX + columnWidths[0] + 5, startY + 5, { width: columnWidths[1] - 10, align: 'left' });
    startY += rowHeight;

    // === 3rd Title: "Gram Panchayat Patta Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableTitles[1], startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
    startY += rowHeight;

    // === Rows with Sr. No and Particulars ===
    // Sr. No Column
    const particularsText = tableRow.particulars.join('\n• '); // Combine all bullets
    const particularsHeight = doc.heightOfString(`• ${particularsText}`, { width: columnWidths[1] - 15, align: 'left' });
    const rowHeightWithBullets = Math.max(particularsHeight + 10, rowHeight);

    // Sr. No Column
    doc.fillColor('#ffffff').rect(startX, startY, columnWidths[0], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(tableRow.srNo, startX + 5, startY + 5, { width: columnWidths[0] - 10, align: 'center' });

    // Particulars Column
    doc.fillColor('#ffffff').rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets).strokeColor('black').stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('black')
        .text(`• ${particularsText}`, startX + columnWidths[0] + 10, startY + 5, { width: columnWidths[1] - 15, align: 'left' });

    startY += rowHeightWithBullets;

    // === Footer: "Nagar Parishad / Nagar Panchayat Properties" ===
    doc.fillColor('#d9d9d9').rect(startX, startY, tableWidth, rowHeight).fill()
        .strokeColor('black').stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('black')
        .text(footerText, startX + 5, startY + 5, { width: tableWidth - 10, align: 'center' });
}

  

  

  const tableTitles = [
    "Property Documents",
    "Gram Panchayat Patta Properties",
  ];
  
  const tableRow = {
    srNo: "1",
    particulars: [
      "GP Patta / Ownership Certificate issued from Gram Panchayat office showing possession.",
      "Property Tax receipt.",
      "Mutation in the name of property owner (Jamabandi).",
      "Registered Title in form of Proposed Sale Deed/Co-ownership Deed/release deed/Gift Deed etc.",
      "Any Utility bill.",
      `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility bills, Ration Card, Tax record may be acceptable for possession proof.`,
      "Co-Ownership Deed executed between customer, spouse, son, or daughter is acceptable.",
      "Equitable Mortgage/Registered Mortgage.",
    ],
  };
  
  const footerText = "Nagar Parishad / Nagar Panchayat Properties";
  
  // Call the function
  drawCustomTableWithFooter(doc, tableTitles, tableRow, footerText);

  function drawSingleRowTable(doc, rowData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Spacing between lines of text (line gap)
  
    // === Draw Sr. No Column ===
    const contentHeight = rowData.map((bullet) =>
      doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15, // Width of the "Particulars" column
      })
    );
    const rowHeightWithBullets = contentHeight.reduce((a, b) => a + b, 0) + bulletSpacing * rowData.length;
  
    // Draw Sr. No Cell
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text("1", startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // === Draw Particulars Column with Bullets ===
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
      .strokeColor('black')
      .stroke();
  
    let bulletY = startY + 5;
    rowData.forEach((bullet) => {
      const bulletHeight = doc.heightOfString(`• ${bullet}`, {
        width: columnWidths[1] - 15,
      });
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += bulletHeight + bulletSpacing; // Add spacing after each bullet
    });
  
    // Update Y position for future elements if needed
    return startY + rowHeightWithBullets;
  }
  
  // Sample Data
  const firstRowData = [
    "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
    "Property tax receipt in the name of property owner.",
    "Mutation order in the name of property owner.",
    `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
    bills, Ration Card, Tax record may be acceptable for possession proof.`,
    "NOC to Mortgage.",
    `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
    to be obtained.`,
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  drawSingleRowTable(doc, firstRowData);
  
  // function drawSingleRowTable(doc, rowData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === Draw Sr. No Column ===
  //   const rowHeightWithBullets = 
  //     rowData.length * bulletSpacing > 20 
  //       ? rowData.length * bulletSpacing 
  //       : 20; // Dynamic height based on content
  
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX, startY, columnWidths[0], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(9)
  //     .fillColor('black')
  //     .text("1", startX + 5, startY + 5, {
  //       width: columnWidths[0] - 10,
  //       align: 'center',
  //     });
  
  //   // === Draw Particulars Column with Dotted Data ===
  //   doc
  //     .fillColor('#ffffff') // White background
  //     .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeightWithBullets)
  //     .strokeColor('black')
  //     .stroke();
  
  //   let bulletY = startY + 5;
  //   rowData.forEach((bullet) => {
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
  //         width: columnWidths[1] - 15,
  //         align: 'left',
  //       });
  
  //     bulletY += bulletSpacing;
  //   });
  
  //   // Update Y position for future elements if needed
  //   return startY + rowHeightWithBullets;
  // }
  
  
  
  // const firstRowData = [
  //   "Allotment letter from Nagar Parishad / Panchayat office for possession proof.",
  //   "Property tax receipt in the name of property owner.",
  //   "Mutation order in the name of property owner.",
  //   `5-year-old Electricity bill in the name of seller / customer (to evidence possession) also Voter ID card, Any utility
  //    bills, Ration Card, Tax record may be acceptable for possession proof.`,
  //   "NOC to Mortgage",
  //   `Latest Title document Registered shall be a proposed Sale deed, Gift Deed, Release deed, Co-ownership deed
  //    to be obtained.`,
  //   "Equitable Mortgage/Registered Mortgage",
  // ];
  
  // drawSingleRowTable(doc, firstRowData);
  

  // function drawCustomTableWithFooter1(doc, tableTitles1, tableRow, secondRowData, footerData) {
  //   const startX = 50; // Starting X position
  //   let startY = doc.y + 10; // Starting Y position
  //   const tableWidth = 500; // Total table width
  //   const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
  //   const rowHeight = 20; // Default row height
  //   const bulletSpacing = 15; // Spacing for bullet points in "Particulars"
  
  //   // === 1st Title: "Municipal Corporation Properties" ===
  //   doc
  //     .fillColor('#d9d9d9') // Light gray background
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .fill()
  //     .lineWidth(0.5)
  //     .strokeColor('black')
  //     .rect(startX, startY, tableWidth, rowHeight)
  //     .stroke();
  //   doc
  //     .font('Helvetica-Bold')
  //     .fontSize(10)
  //     .fillColor('black')
  //     .text(tableTitles1[0], startX + 5, startY + 5, {
  //       width: tableWidth - 10,
  //       align: 'center',
  //     });
  
  //   startY += rowHeight; // Move to the next row
  
  //   // === 2nd Row: Data in Two Columns ===
  //   secondRowData.forEach((item, index) => {
  //     // Sr. No Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX, startY, columnWidths[0], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(9)
  //       .fillColor('black')
  //       .text(index + 1, startX + 5, startY + 5, {
  //         width: columnWidths[0] - 10,
  //         align: 'center',
  //       });
  
  //     // Particulars Column
  //     doc
  //       .fillColor('#ffffff') // White background
  //       .rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(item, startX + columnWidths[0] + 5, startY + 5, {
  //         width: columnWidths[1] - 10,
  //         align: 'left',
  //       });
  
  //     startY += rowHeight; // Move to the next row
  //   });
  
  //   // === 3rd Title/Footer: Bullet Points ===
  //   footerData.forEach((footerItem) => {
  //     const footerHeight =
  //       footerItem.length * bulletSpacing > rowHeight
  //         ? footerItem.length * bulletSpacing
  //         : rowHeight;
  
  //     // Footer Section
  //     doc
  //       .fillColor('#ffffff') // White background for footer
  //       .rect(startX, startY, tableWidth, footerHeight)
  //       .strokeColor('black')
  //       .stroke();
  //     let bulletY = startY + 5;
  //     doc
  //       .font('Helvetica')
  //       .fontSize(8.5)
  //       .fillColor('black')
  //       .text(`• ${footerItem}`, startX + 5, bulletY, {
  //         width: tableWidth - 10,
  //         align: 'left',
  //       });
  
  //     startY += footerHeight; // Move to the next section
  //   });
  // }

  function drawCustomTableWithFooter1(doc, title, secondRowData, footerData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const tableWidth = 500; // Total table width
    const columnWidths = [50, 450]; // Sr. No (50), Particulars (450)
    const bulletSpacing = 5; // Line spacing for text in "Particulars"
  
    // === Title: "Municipal Corporation Properties" ===
    const titleHeight = 20; // Fixed height for title row
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, titleHeight)
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight)
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('black')
      .text(title, startX + 5, startY + 5, {
        width: tableWidth - 10,
        align: 'center',
      });
  
    startY += titleHeight; // Move to the next row
  
    // === Content: "Sr. No | Particulars" ===
    // Calculate the height of the "Particulars" content
    let contentHeight = secondRowData.reduce((totalHeight, bullet) => {
      return totalHeight + doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    }, 10); // Add padding
  
    // Sr. No Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX, startY, columnWidths[0], contentHeight)
      .strokeColor('black')
      .stroke();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('black')
      .text('1', startX + 5, startY + 5, {
        width: columnWidths[0] - 10,
        align: 'center',
      });
  
    // Particulars Column
    doc
      .fillColor('#ffffff') // White background
      .rect(startX + columnWidths[0], startY, columnWidths[1], contentHeight)
      .strokeColor('black')
      .stroke();
  
    // Render each bullet point in "Particulars"
    let bulletY = startY + 5;
    secondRowData.forEach((bullet) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${bullet}`, startX + columnWidths[0] + 10, bulletY, {
          width: columnWidths[1] - 15,
          align: 'left',
          lineGap: 2,
        });
      bulletY += doc.heightOfString(`• ${bullet}`, { width: columnWidths[1] - 15 }) + bulletSpacing;
    });
  
    startY += contentHeight; // Move to the next section
  
    // === Footer Section ===
    const footerHeight = footerData.reduce((totalHeight, line) => {
      return totalHeight + doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    }, 10);
  
    // Footer Background
    doc
      .fillColor('#d9d9d9') // Light gray background
      .rect(startX, startY, tableWidth, footerHeight)
      .fill()
      .strokeColor('black')
      .stroke();
  
    // Render each line in the footer
    let footerY = startY + 5;
    footerData.forEach((line) => {
      doc
        .font('Helvetica')
        .fontSize(8.5)
        .fillColor('black')
        .text(`• ${line}`, startX + 10, footerY, {
          width: tableWidth - 20,
          align: 'left',
          lineGap: 2,
        });
      footerY += doc.heightOfString(`• ${line}`, { width: tableWidth - 20 }) + bulletSpacing;
    });
  }
  
  // Sample Data
  const secondRowData = [
    "Last 13 Years Complete Chain documents, i.e. Khasra / Notarized agreement / Sale Deed / Gift Deed / Co-ownership Deed.",
    "Architect plan/Site plan to be collected.",
    "Mutation in the name of Property owner.",
    "Latest property tax receipt.",
    "5-year-old Electricity bill in the name of seller/customer (to evidence possession) also Voter ID Card, any utility Bills, Ration card, and Tax record may be acceptable for possession proof.",
    "Indemnity from borrower.",
    "Latest registered title document shall be Sale deed / Gift deed / Co-ownership deed in case prior title document is not registered (e.g., notary/Khasra).",
    "Equitable Mortgage/Registered Mortgage.",
  ];
  
  const footerData = [
    "Legal opinion report of the property should state 'clear & marketable' and SARFAESI is applicable as issued by empanelled advocate.",
  ];
  
  // Call the function with the appropriate data
  drawCustomTableWithFooter1(doc, 'Municipal Corporation Properties', secondRowData, footerData);
//  // addFooter(doc); 

  
    
      doc.addPage();
    

function createChecklistTablet(doc, tableTitle, tableTitle2, tableData) {
  // Check if tableData is defined and an array
  if (!Array.isArray(tableData)) {
    console.error("tableData is not an array or is undefined");
    return;
  }

  // Initial configurations
  const startX = 50; // Starting X position for table
  let startY = doc.y + 10; // Starting Y position

  const rowHeight = 20;
  const rowHeightDefault = 20; // Default row height
  const columnWidthsTable = [50, 450]; // Widths for Sr. No and Particulars
  const columnWidthsTitle = [500]; // Width for the title row

  // Add Main Table Title (tableTitle)
  doc
    .fillColor('#0066B1') // Blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor('white')
    .text(tableTitle, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'center' });

  startY += rowHeight;

  // Add Subtitle (tableTitle2)
  doc
    .fillColor('#cfe2f3') // Light blue background
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .fill()
    .lineWidth(0.5)
    .strokeColor('black')
    .rect(startX, startY, columnWidthsTitle[0], rowHeight)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('black')
    .text(tableTitle2, startX + 5, startY + 5, { width: columnWidthsTitle[0] - 10, align: 'left' });

  startY += rowHeight;

  // Draw Table Rows for `tableData`
  tableData.forEach((row, rowIndex) => {

    let rowHeight = rowIndex === 9? 30 : rowHeightDefault; // Increase height for row 3 (index 2)
    const isGrayRow = rowIndex % 2 === 0; // Alternate row colors
    const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';

    // Draw background for the row
    doc
      .fillColor(rowColor)
      .rect(startX, startY, columnWidthsTable[0] + columnWidthsTable[1], rowHeight)
      .fill();

    // Draw Sr. No
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX, startY, columnWidthsTable[0], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.srNo, startX + 5, startY + 5, { width: columnWidthsTable[0] - 10, align: 'center' });

    // Draw Particulars
    doc
      .strokeColor('black')
      .lineWidth(0.5)
      .rect(startX + columnWidthsTable[0], startY, columnWidthsTable[1], rowHeight)
      .stroke();

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('black')
      .text(row.particulars, startX + columnWidthsTable[0] + 5, startY + 5, {
        width: columnWidthsTable[1] - 10,
        align: 'left',
      });

    // Move to the next row
    startY += rowHeight;
    doc.moveDown()

  });

}


const tableTitleT = "Disbursement DOCUMENTS";
const tableTitleT2 = `Sr. No                                                 Particulars`;
const tableDatatableT = [
  { srNo: "1", particulars: "Self-Attested KYC of Borrowers and Co-borrower." },
  { srNo: "2", particulars: "Self-Attested Udyam Registration Certiicate of Borrower." },
  { srNo: "3", particulars: "Sanction Letter signed by Borrower and Co-borrowers." },
  { srNo: "4", particulars: "NACH with Sign and Stamp / E-Nach Registeration." },
  { srNo: "5", particulars: "In case, Borrower is Partnership Firm or Company, Signed KYC of Borrower." },
  { srNo: "6", particulars: `5 UDC from Borrower and 2 UDC of Co-borrowers/Guarantors as per the Sanction Letter along with UDC Covering Letter.` },
  { srNo: "7", particulars: "Customer Disbursement Request form." },
  { srNo: "8", particulars: "Dual Declaration Form (If any )." },
  { srNo: "9", particulars: "Signed Personal Gaurantee Deed (If any )." },
  { srNo: "10", particulars: `Loan Agreement (MITC, Schedule, Insurance Form, Annexure 1, End Use Undertaking, DPN, Vernacular Language Declaration.\n\n` },
  { srNo: "11", particulars: "Sigend Sale deed / Gift Deed / Release deed / Co- ownership Deed." },
  { srNo: "12", particulars: "Signed Registered Mortgage / Equitable Mortgage Deed." },
  { srNo: "13", particulars: "Vetting Report." },
  { srNo: "14", particulars: "Revised Legal." },
  { srNo: "15", particulars: "FI and RCU Report." },
  { srNo: "16", particulars: "Insurance Form." },
  { srNo: "17", particulars: "Veterinary Doctor Certiicate (If applicable)." },
];


function drawTitletitt(sectionTitle) {

  const titleHeight = 20;  
  const titleX = 48; 
  const titleWidth = doc.page.width - 2 * titleX; 
  
  const startY = doc.y;  
  const titleBackgroundColor = "#0066B1";  
  
  doc.rect(titleX, startY, titleWidth, titleHeight)
    .fill(titleBackgroundColor)
    .strokeColor("#151B54")
    .lineWidth(1)
    .stroke();
  
  doc.font(fontBold)
    .fontSize(12)
    .fillColor("white")
    .text(sectionTitle, titleX + 5, startY + 5, {
      align: "center",
      width: titleWidth - 10,  
    });

 
}
createChecklistTablet(doc, tableTitleT, tableTitleT2, tableDatatableT);

drawTitletitt("MOST IMPORTANT INFORMATION (Adhar Consent)");

doc.font('Helvetica')
.fillColor("black")

  .fontSize(9)
  .text(`
I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company
here with shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. 
The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in 
accordance with the applicable law.
I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained
me in vernacular (the language known to me):
i) the purpose and the uses of collecting Aadhaar.
ii) the nature of information that may be shared upon ofline verification.
iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter’s ID, driving
license, etc.).
I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
its oficials responsible in case of any incorrect / false information or forged document provided by me.
This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
respect of the submission of his/her Aadhaar.
Date:-${allPerameters.date}
place:-${allPerameters.branchName}
  `,
{ align: 'justify',  lineGap: 5 }
);

// // addFooter(doc); 
addFooter1(doc);


// doc.addPage();
// // drawBorder()
//   //   // addLogo(doc);(doc);(doc);
// doc.moveDown(6)

// doc.font('Helvetica')
//   .fontSize(9)
//   .text(`
// I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of
//  its oficials responsible in case of any incorrect / false information or forged document provided by me.

// This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in
//  respect of the submission of his/her Aadhaar.

// Date:-

// place:-
//   `,
// { align: 'justify',  lineGap: 5 }
// );




// // Call the function with the PDF document and table data

// // Finalize the document (assuming you are writing to a file or streaming it)

  
  

  


// //  // addFooter(doc); 
//   addFooter1(doc);
  doc.end();

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // const objData = {
  //     fileName: pdfFileUrl,
  //     file: doc.toString('base64')
  // }
  // await initESign(objData)

  // return new Promise((resolve, reject) => {
  //     stream.on("finish", () => {
  //       resolve(pdfFileUrl);
  //     });
  //     stream.on("error", reject);
  //   });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });

}

// function numberToIndianWords(num) {
//   if (num === 0) return "Zero Rupees Only";

//   const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
//   const teens = ["Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
//   const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
//   const thousands = ["", "Thousand", "Lakh", "Crore"];

//   function convertLessThanThousand(n) {
//       let str = "";
//       if (n >= 100) {
//           str += ones[Math.floor(n / 100)] + " Hundred ";
//           n %= 100;
//       }
//       if (n > 10 && n < 20) {
//           str += teens[n - 11] + " ";
//       } else {
//           if (n >= 10) {
//               str += tens[Math.floor(n / 10)] + " ";
//               n %= 10;
//           }
//           if (n > 0) {
//               str += ones[n] + " ";
//           }
//       }
//       return str.trim();
//   }

//   let result = "";
//   let unitIndex = 0;

//   while (num > 0) {
//       let part = num % 1000;
//       if (part > 0) {
//           let prefix = convertLessThanThousand(part);
//           result = prefix + (unitIndex > 0 ? " " + thousands[unitIndex] + " " : "") + result;
//       }
//       num = Math.floor(num / (unitIndex === 0 ? 1000 : 100)); // First time divide by 1000, then by 100 for lakh/crore
//       unitIndex++;
//   }

//   return result.trim() + " Rupees Only";
// }

function numberToIndianWords(num) {
  if (!num) return "";
  if (num === 0) return "Zero";
   
  const belowTwenty = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const placeValues = ["", "Thousand", "Lakh", "Crore", "Ten Crore"];
   
  function helper(n) {
  if (n === 0) return "";
  else if (n < 20) return belowTwenty[n] + " ";
  else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
  else if (n < 1000) return belowTwenty[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
  else if (n < 100000) return helper(Math.floor(n / 1000)) + " Thousand " + helper(n % 1000);
  else if (n < 10000000) return helper(Math.floor(n / 100000)) + " Lakh " + helper(n % 100000);
  else return helper(Math.floor(n / 10000000)) + " Crore " + helper(n % 10000000);
  }
   
  return helper(parseInt(num)).trim();
  }

async function FincooperApplicantionPdf(customerId, ) {
  try {
   

    // const {  selections } = req.query;
    // const selections = "acg";
    // const customerSelections = selections.split(',');
    // const selections = "acg";
// const customerSelections = selections.split(','); // This part is correct
//  console.log(customerSelections,"customerSelections"); // "acg"
//  console.log(selections,"selections"); // "acg"


// Ensure selections is not accidentally called as a function
// console.log(selections,"selections"); // "acg"
// console.log(customerSelections,"customerSelections"); // ["acg"]

    // Fetch details from the database
    const customerDetails = await customerModel.findOne({ _id: customerId });
    const coApplicantDetails = await coApplicantModel.find({ customerId: new mongoose.Types.ObjectId(customerId) });
    const guarantorDetails = await guarantorModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const applicantDetails = await applicantModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const technicalDetails = await technicalModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const appPdcDetails = await appPdcModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const disbuDetail  = await DISBURSEMENTModel.findOne({customerId})
    const finalSanctionDetails = await finalsanctionModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const gtrPdcDetail = await gtrPdcModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
    const creditPdDetails = await creditPdModel.findOne({ customerId });
    const udhyamDetails = await UdhyamModel.findOne({ customerId });
    const branchUdhyam = await   branchUdhyamModel.findOne({ customerId });
    const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
    const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
    const bankKycsDEtails = await bankDeatilsKycs.findOne({ customerId });
    const internalLegalDATA = await internalLegalModel.findOne({ customerId });
   

    const netMonthlyIncome =finalsanctionDetails?.netCalculation?.totalNetMonthlyIncome;
    // console.log("netMonthlyIncome",netMonthlyIncome)
    const roundedIncome = Math.round(netMonthlyIncome);


    console.log(customerDetails,"customerDetails")

    const BranchNameId = customerDetails?.branch;
  // console.log("BranchNameId",BranchNameId) bankDeatilsKycs
        const branchData = await newBranchModel.findById({_id:BranchNameId});
        // if (!branchData) {
        //     return badRequest(res, "Branch data not found for the given branchId");
        // }
        // const newBranch = 
        const branchName = branchData?.city; 


    // Validate inputs
    // if (customerSelections.includes("c2") && !coApplicantDetails[1]) {
    //   throw new Error("Selected Co-Applicant 2 is not present in the database.");
    // }
    // if (customerSelections.includes("guarantor") && !guarantorDetails) {
    //   throw new Error("Guarantor is not present in the database.");
    // }
    // if (!customerSelections.includes("c2") && coApplicantDetails.length > 1) {
    //   throw new Error("Co-Applicant 2 is present in the database but not selected by the customer.");
    // }

    // let skipPages = [];
    // if (customerSelections.includes("acg")) {
    //   skipPages = [6, 7]; 
    // } else if (customerSelections.includes("ac1c2")) {
    //   skipPages = [8, 9];
    // } else if (customerSelections.includes("ac1c2g")) {
    //   skipPages = []; 
    // }

    // if (
    //   customerSelections.includes("acg") &&
    //   Array.isArray(coApplicantDetails) &&
    //   coApplicantDetails.length === 1 &&
    //   guarantorDetails
    // ) {
    //   skipPages.push(6, 7);
    // }

    // if (
    //   customerSelections.includes("ac1c2") &&
    //   (!guarantorDetails || guarantorDetails.length === 0)
    // ) {
    //   skipPages.push(8, 9);
    // }

    // console.log("Selections provided:", customerSelections);
    // console.log("Pages to Skip:", skipPages);

    const guarantorAddress =
       guarantorDetails?.[0] ? 
       [
        guarantorDetails[0].localAddress?.addressLine1,
        // guarantorDetails[0].permanentAddress?.addressLine2,
        // guarantorDetails[0].permanentAddress?.city,
        // guarantorDetails[0].permanentAddress?.district,
        // guarantorDetails[0].permanentAddress?.state,
        // guarantorDetails[0].permanentAddress?.pinCode
      ].filter(Boolean).join(', ') : "NA";

      const coborroweraddress = coApplicantDetails?.[0] ? [
        coApplicantDetails[0].localAddress?.addressLine1,
        // coApplicantDetails[0].permanentAddress?.addressLine2,
        // coApplicantDetails[0].permanentAddress?.city,
        // coApplicantDetails[0].permanentAddress?.district,
        // coApplicantDetails[0].permanentAddress?.state,
        // coApplicantDetails[0].permanentAddress?.pinCode
      ].filter(Boolean).join(', ') : "NA";

      const address = [
        applicantDetails?.localAddress?.addressLine1,
        // applicantDetails?.permanentAddress?.addressLine2,
      ].filter(Boolean).join(', ');

      const localaddress = [
        applicantDetails?.localAddress?.addressLine1,
        // applicantDetails?.localAddress?.addressLine2,
        // applicantDetails?.localAddress?.city,
        // applicantDetails?.localAddress?.state,
        // applicantDetails?.localAddress?.district,
        // applicantDetails?.localAddress?.pinCode,
      ].filter(Boolean).join(', ');

      const gualocaladdress = [

        guarantorDetails?.localAddress?.addressLine1,
        // guarantorDetails?.localAddress?.addressLine2,
        guarantorDetails?.localAddress?.city,
        guarantorDetails?.localAddress?.state,
        guarantorDetails?.localAddress?.district,
        guarantorDetails?.localAddress?.pinCode,
      ].filter(Boolean).join(', ');
      

      const formatDate = (dob) => {
        if (!dob) return "NA"; // Agar DOB available nahi hai to "NA" return kare
        const date = new Date(dob); // Date object me convert kare
        const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
        const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
        return `${day}-${month}-${year}`; // Final format
    };

      const formatAadhaar = (aadhaarNo) => {
        if (!aadhaarNo || aadhaarNo.length !== 12) {
          return "Invalid Aadhaar";
        }
        return "XXXXXXXX" + aadhaarNo.slice(-4);
      };


      const bankDetail = bankKycsDEtails?.bankDetails?.find(
        (detail) => detail.E_Nach_Remarks === "true"
      ) || {}; // Default to an empty object if no bank details are found
  
      // Prepare bank details
      const bankDetails = {
        bankName: bankDetail?.bankName || "NA",
        branchName: bankDetail?.branchName || "NA",
        accNo: bankDetail?.accountNumber || "NA",
        accType: bankDetail?.accountType || "NA",
        ifscCode: bankDetail?.ifscCode || "NA",
      };      

      const marketValueNumber = technicalDetails?.fairMarketValueOfLand;
      const marketValuetoword =marketValueNumber ? numberToIndianWords(marketValueNumber) : "NA";
console.log(marketValuetoword,"marketValuetoword");

const endusofloan = finalsanctionDetails?.EndUseOfLoan;
     const purpose = await endUseOfLoanModeldata.findById( endusofloan );
     const loanPurpose = purpose?.name;

    // Prepare parameters
    const allParameters = {
      sellerName:internalLegalDATA?.sellerName||"NA",
      buyerName:internalLegalDATA?.buyerName||"NA",

      branchName:branchName||"NA",
      date:customerDetails.createdAt
      ? `${customerDetails.createdAt.getDate()}-${customerDetails.createdAt.getMonth() + 1}-${customerDetails.createdAt.getFullYear()}`: "NA",
        customerNO:sanctionPendencyDetails?.partnerCustomerId|| "NA",



      loacalAdharAdress:applicantDetails?.localAddress?.addressLine1||"NA",
        localDistrict:applicantDetails?.localAddress?.district||"NA",
        localCity:applicantDetails?.localAddress?.city||"NA",
        loacalState:applicantDetails?.localAddress?.state||"NA",
        localPin:applicantDetails?.localAddress?.pinCode||"NA",

      pENDENCYlOANnumber:disbuDetail?.preDisbursementForm?.loanNumber || "NA",//page no.1
      sanctionpendencyDate:sanctionPendencyDetails?.sanctionDate || "NA",
      loanAmountRequested: finalSanctionDetails?.finalLoanAmount|| "NA",
                  tenure: finalSanctionDetails?.tenureInMonth||"NA",
                  sourceType : "NA",
                  loanPurpose:loanPurpose|| "NA",
                  loanType: "Secured",//page no.1
      
              // applicant details udhyamDetails
              appType : applicantDetails?.applicantType || "NA",//page no.1
              buisnessType : applicantDetails?.businessType || "NA",//page no.1
              borrowerName : applicantDetails?.fullName || "NA",//page no.1
              appFather : applicantDetails?.fatherName || "NA",//page no.1
              appMother : applicantDetails?.motherName || "NA",//page no.1
              appMob1 : applicantDetails?.mobileNo || "NA",//page no.1
              appMob2 : applicantDetails?.mobileNo || "NA",//page no.1
              appEmail : applicantDetails?.email || "NA",//page no.1
              appEdu : applicantDetails?.education || "NA",//page no.1
              appDOB : formatDate(applicantDetails?.dob) || "NA",
              appGender : applicantDetails?.gender || "NA",//page no.1
              appMaritalStatus : applicantDetails?.maritalStatus || "NA",//page no.1
              appPan : applicantDetails?.panNo || "FORM 60",//page no.1
              appAdhar : applicantDetails?.aadharNo?formatAadhaar(applicantDetails.aadharNo):"NA",//page no.1
              AppVoterId : applicantDetails?.voterIdNo || "NA",//page no.1
              appReligion:applicantDetails?.religion || "NA",
              // appNationality:creditPdDetails?.applicant?.nationality || "NA",
              appNationality: "Indian",

              appCategory:applicantDetails?.category || "NA",
              appNoOfDependentd:applicantDetails?.noOfDependentWithCustomer || "NA",
              appUshyamAdharNumber:branchUdhyam?.udhyamRegistrationNo || "NA",
      
      
              //   communicationAddress
              appadharadress : applicantDetails?.localAddress?.addressLine1||"NA",
              appCityName :applicantDetails?.localAddress?.city||"NA",
              appdistrict :applicantDetails?.localAddress?.district||"NA",
              AppPin : applicantDetails?.localAddress?.pinCode||"NA",
              AppState :applicantDetails?.localAddress?.state||"NA",
              AppYearsAtCureentAdress : creditPdDetails?.applicant?.noOfyearsAtCurrentAddress || "NA",
              appLandmark: creditPdDetails?.applicant?.houseLandMark || "NA",
              appCountry:"India",
              appResidence:creditPdDetails?.applicant?.residenceType || "NA",
              appPRESentAdress:applicantDetails?.localAddress?.addressLine1||"NA",
      
              //employeement buisness details udhyamDetails
              appudhyam: branchUdhyam?.udhyamRegistrationNo || "NA",
              occupation:creditPdDetails?.applicant?.occupation || "NA",
              monthlyIncome: roundedIncome||"NA",
              isSelfEmployed:"NA",
              otherIncome:"NA",
              firstName:branchUdhyam?.OrganisationName || "NA",
              firmType:branchUdhyam?.typeOfOrganisation || "NA",
              // natureBuisness:otherBuisnessData?.natureOfBuisness || "NA",
              natureBuisness: branchUdhyam?.natureOfBusiness ||"NA",

              msmeClassification:branchUdhyam?.MsmeClassification||"NA",

              //registered entity
              entityAdress: branchUdhyam?.AddressOfFirm?.fullAddress || "NA",
              entityLandmark: branchUdhyam?.AddressOfFirm?.landmark  || "NA",
              entityCityTown:branchUdhyam?.AddressOfFirm?.city || "NA",
              entityDistrict:branchUdhyam?.AddressOfFirm?.districtName || "NA",
              entityState:branchUdhyam?.AddressOfFirm?.state || "NA",
              entityCountry:branchUdhyam?.AddressOfFirm?.country || "NA",
              entitypin:branchUdhyam?.AddressOfFirm?.pinCode || "NA",
              entityMobile:branchUdhyam?.AddressOfFirm?.mobileNumber || "NA",
              entityemail:branchUdhyam?.AddressOfFirm?.emailId || "NA",
              //coApplicant detail
              coAppType : coApplicantDetails?.[0]?.coApplicantType || "NA",
              coAppbuiType:coApplicantDetails?.[0]?.businessType || "NA",
      
              coAppName : coApplicantDetails?.[0]?.fullName || "NA",//page no.1
              coRelWithApp : coApplicantDetails?.[0]?.relationWithApplicant || "NA",//page no.1
              coAppFather : coApplicantDetails?.[0]?.fatherName || "NA",//page no.1
              coAppMother : coApplicantDetails?.[0]?.motherName || "NA",//page no.1
              coAppMob1 : coApplicantDetails?.[0]?.mobileNo || "NA",//page no.1
              corelwithApp:coApplicantDetails?.[0]?.relationWithApplicant || "NA",
      
              // appMob2 : coApplicantDetails?.mobileNo || "NA",//page no.1
              coAppEmail : coApplicantDetails?.[0]?.email || "NA",//page no.1
              coAppEdu : coApplicantDetails?.[0]?.education || "NA",//page no.1
              coAPPDob : formatDate(coApplicantDetails?.[0]?.dob) || "NA",//page no.1
              coAppGender : coApplicantDetails?.[0]?.gender || "NA",//page no.1
              coAppMarritalStatus : coApplicantDetails?.[0]?.maritalStatus || "NA",//page no.1
              coAppPan : coApplicantDetails?.[0]?.docType === 'panCard' ? coApplicantDetails?.[0]?.docNo || '':'FORM 60',
              coAPPAdhar : coApplicantDetails?.[0]?.aadharNo ?formatAadhaar(coApplicantDetails[0].aadharNo):"NA",//page no.1
              coAppvoterId :coApplicantDetails?.[0]?.docType === 'voterId' ? coApplicantDetails?.[0]?.docNo || '':'NA',
              coAppreligion:coApplicantDetails?.[0]?.religion || "NA",
              // coAppNationality:coApplicantDetails?.[0]?.nationality || "NA",
              coAppNationality: "Indian",

              // coAppCategory:coApplicantDetails?.[0]?.category || "NA",
              coAppCategory:coApplicantDetails?.[0]?.category || "NA",

              coAppNoOfDependentd:"NA",
              coAppUdhyamAaadharNo:"NA",
      
              //   communicationAddress
              coAppAdharAdress : coborroweraddress || "NA",
              coAppcity : coApplicantDetails?.[0]?.localAddress?.city|| "NA",
              coAppdistrict : coApplicantDetails?.[0]?.localAddress?.district|| "NA",
              coAppPIN : coApplicantDetails?.[0]?.localAddress?.pinCode|| "NA",
              coAppState : coApplicantDetails?.[0]?.localAddress?.state|| "NA",
              coAppcurentAdress :coApplicantDetails?.[0]?.noOfyearsAtCurrentAddress || "NA",
              coappLandMark:coApplicantDetails?.[0]?.houseLandMark || "NA",
              coAppCountry:"India",
              coResidence:coApplicantDetails?.[0]?.occupation || "NA",

              coAppNoOfYearsATCurrentAddress:coApplicantDetails?.[0]?.noOfyearsAtCurrentAddress || "NA",
      
               //coApplicant details 2
               coAppType2 : creditPdDetails?.co_Applicant?.[1]?.coApplicantType || "NA",
               coAppbuiType2:creditPdDetails?.co_Applicant?.[1]?.businessType || "NA",
      
       
               coAppName2 : coApplicantDetails?.[1]?.fullName || "NA",//page no.1
               coRelWithApp2 : coApplicantDetails?.[1]?.relationWithApplicant || "NA",//page no.1
               coAppFather2 : coApplicantDetails?.[1]?.fatherName || "NA",//page no.1
               coAppMother2 : coApplicantDetails?.[1]?.motherName || "NA",//page no.1
               coAppMob12 : coApplicantDetails?.[1]?.mobileNo || "NA",//page no.1
               corelwithApp2:coApplicantDetails?.[1]?.relationWithApplicant || "NA",
       
               // appMob2 : coApplicantDetails?.mobileNo || "NA",//page no.1
               coAppEmail2 : coApplicantDetails?.[1]?.email || "NA",//page no.1
               coAppEdu2 : coApplicantDetails?.[1]?.education || "NA",//page no.1
               coAPPDob2 : formatDate(coApplicantDetails?.[1]?.dob) || "NA",//page no.1
               coAppGender2 : coApplicantDetails?.[1]?.gender || "NA",//page no.1
               coAppMarritalStatus2 : coApplicantDetails?.[1]?.maritalStatus || "NA",//page no.1
               coAppPan2 : coApplicantDetails?.[1]?.docType === 'panCard' ? coApplicantDetails?.[1]?.docNo || '':'FORM 60',
               coAPPAdhar2 : coApplicantDetails?.[1]?.aadharNo  ?formatAadhaar(coApplicantDetails[1].aadharNo):"NA",
               coAppvoterId2 : coApplicantDetails?.[1]?.docType === 'voterId' ? coApplicantDetails?.[1]?.docNo || '':'NA',
               coAppreligion2:coApplicantDetails?.[1]?.religion || "NA",
              //  coAppNationality2:creditPdDetails?.co_Applicant?.[1]?.nationality || "NA",
              coAppNationality2: "Indian",

               coAppCategory2:coApplicantDetails?.[1]?.category || "NA",
               coAppNoOfDependentd2:"NA",
               coAppUdhyamAaadharNo2:"NA",
       
               //   communicationAddress
               coAppAdharAdress2 : coApplicantDetails?.[1]?.localAddress?.addressLine1 || "NA",
               coAppcity2 : coApplicantDetails?.[1]?.localAddress?.city|| "NA",
               coAppdistrict2 : coApplicantDetails?.[1]?.localAddress?.district|| "NA",
               coAppPIN2 : coApplicantDetails?.[1]?.localAddress?.pinCode|| "NA",
               coAppState2 : coApplicantDetails?.[1]?.localAddress?.state|| "NA",
               coAppcurentAdress2 : coApplicantDetails?.[1]?.noOfyearsAtCurrentAddress || "NA",
               coappLandMark2:coApplicantDetails?.[1]?.houseLandMark || "NA",
               coAppCountry2:"India",
               coResidence2:coApplicantDetails?.[1]?.residenceType||"NA",
               coAppNoOfYearsATCurrentAddress2:coApplicantDetails?.[1]?.noOfyearsAtCurrentAddress || "NA",
               coappocuupation1:creditPdDetails?.co_Applicant?.[0]?.occupation || "NA",
               coappocuupation2:coApplicantDetails?.[1]?.occupation || "NA",
      
            //   coBorrowername: coApplicantDetails?.[0]?.fullName || "NA",
            //   constitutionCoBorrower:"INDIVIDUAL",
            //   panTanCin : coApplicantDetails?.docNo || "NA",
            // coBorroweraddress: coborroweraddress,
            // coBorroeremail: coApplicantDetails?.[0]?.email || "NA",
            // coBorrowerphoneNo: coApplicantDetails?.[0]?.mobileNo || "NA",
       
            //guarantor details
      
            guaType :guarantorDetails?.guarantorType || "NA",
            guaBuisType:guarantorDetails?.businessType||"NA",
            guaName : guarantorDetails?.fullName || "NA",//page no.1
            guaRelWithApplicant : guarantorDetails?.relationWithApplicant || "NA",//page no.1
            guaFather : guarantorDetails?.fatherName || "NA",//page no.1
            guaMother : guarantorDetails?.motherName || "NA",//page no.1
            guaMobile : guarantorDetails?.mobileNo || "NA",//page no.1
            guaMobileNo2 : guarantorDetails?.mobileNo || "NA",//page no.1
            guaEmail : guarantorDetails?.email || "NA",//page no.1
            guaEdu : guarantorDetails?.education || "NA",//page no.1
            giaReligion:guarantorDetails?.religion||"NA",
            guaDob : formatDate(guarantorDetails?.dob) || "NA",//page no.1
            guaNationality:"Indian",
            guaGender : guarantorDetails?.gender || "NA",//page no.1
            guaMaritialStatus : guarantorDetails?.maritalStatus || "NA",//page no.1

            
            // guaPan : guarantorDetails?.docNo || "NA",//page no.1
            guaAdhar : guarantorDetails?.aadharNo? formatAadhaar(guarantorDetails.aadharNo):"NA",//page no.1
            // guaVoterId : guarantorDetails?.docNo || "NA",//page no.1
             guaPan: guarantorDetails?.docType === 'panCard' ? guarantorDetails?.docNo || '':'FORM 60',

          guaVoterId : guarantorDetails?.docType === 'voterId' ? guarantorDetails?.docNo || '':'NA',
            guaCategory:guarantorDetails?.category||"NA",
            guaNoOfDependent:"na",
            guaUdhyam:"na",
      
              //   communicationAddress guaguarantorDetails?.occupation || "NA",

              gualoacalAdharAdress:guarantorDetails?.localAddress?.addressLine1||"NA",
              gualocalDistrict:guarantorDetails?.localAddress?.district||"NA",
              gualocalCity:guarantorDetails?.localAddress?.city||"NA",
              gualoacalState:guarantorDetails?.localAddress?.state||"NA",
              gualocalPin:guarantorDetails?.localAddress?.pinCode||"NA",     

              guaAdressAdhar :guarantorDetails?.localAddress?.addressLine1||"NA",
              guaCity : guarantorDetails?.localAddress?.city||"NA",
              guaDist : guarantorDetails?.localAddress?.district||"NA",
              guaPin : guarantorDetails?.localAddress?.pinCode||"NA",     
              guaState : guarantorDetails?.localAddress?.state||"NA",
              guaYearsCurrentAddress :guarantorDetails?.noOfyearsAtCurrentAddress || "NA",
              guapRESENTaddress:gualocaladdress,
              guaLandMark:guarantorDetails?.houseLandMark || "NA",
              guaResidence:guarantorDetails?.residenceType || "NA",
              guaCountry:"India",
              gauOccupation:guarantorDetails?.occupation || "NA",
      
              //colletral Address
              technicalFullADDRESS : technicalDetails?.fullAddressOfProperty || "NA",
              propertyHolder: technicalDetails?.nameOfDocumentHolder || "NA",
              relationWithborrow: technicalDetails?.relationWithApplicant || "NA",
              sreaInSqFt: technicalDetails?.totalLandArea || "NA",
              propertyaGE: technicalDetails?.propertyAge || "NA",
              marketValue: technicalDetails?.fairMarketValueOfLand || "NA",
              marketValuetowor:marketValuetoword||"NA",
      
              bankName : bankDetail?.bankName|| "NA",
              branchName :bankDetail?.branchName|| "NA",
              accNo : bankDetail?.accountNumber|| "NA",
              accType : bankDetail?.accountType|| "NA",
              ifscCode : bankDetail?.ifscCode || "NA",
      
              //refrence detail 1
              ref1name : creditPdDetails?.referenceDetails?.[0]?.name|| "NA",
              ref1add : creditPdDetails?.referenceDetails?.[0]?.address|| "NA",
              ref1rel : creditPdDetails?.referenceDetails?.[0]?.relation|| "NA",
              re1mob : creditPdDetails?.referenceDetails?.[0]?.mobileNumber|| "NA",
      
              //reference detail 2
              ref2name : creditPdDetails?.referenceDetails?.[1]?.name|| "NA",
              ref2add : creditPdDetails?.referenceDetails?.[1]?.address|| "NA",
              ref2rel : creditPdDetails?.referenceDetails?.[1]?.relation|| "NA",
              ref2accType : creditPdDetails?.referenceDetails?.[1]?.mobileNumber|| "NA",
      
              appdate : applicantDetails?.permanentAddress?.years || "NA",
              appImage:applicantDetails?.applicantPhoto||"NA",
              co1Image:coApplicantDetails?.[0]?.coApplicantPhoto||"NA",
              co2Image:coApplicantDetails?.[1]?.coApplicantPhoto||"NA",
              guaImage:guarantorDetails?.guarantorPhoto||"NA",


    };
    console.log(allParameters,"allParameters")

    const partnerData = await finalsanctionModel.findOne({ customerId });
    
        if (!partnerData) {
          return badRequest(res, "partner's is required.");
        }
    
        // let selectionData = partnerData?.pdfSelection || "acg";
        //   if (!selectionData || typeof selectionData !== "string") {
        //     selectionData;
        //   }

        let selectionData = partnerData?.pdfSelection || "acg";
if (selectionData && typeof selectionData === "string") {
  selectionData = selectionData.toLowerCase();
}


    
    // Generate PDF with skipped pages
    let pdfPath = ""; // Initialize pdfPath to avoid undefined errors

    if (selectionData === "acg") 
    {
       pdfPath = await growpdf1(allParameters );
            console.log(pdfPath, "applicant");
    } 
    else if (selectionData === "accg") 
    {
       pdfPath = await growpdf(allParameters );
      console.log(pdfPath, "coapplicant");
    } 
    else if (selectionData === "acc")
    {
       pdfPath = await growpdf2(allParameters );
      console.log(pdfPath, "gaurantor");
    }
     else if (selectionData === "ac")
   {
      pdfPath = await growpdf3(allParameters );
     console.log(pdfPath, "gaurantor");
   } 
    else 
    {
      throw new Error("Invalid selection type");
    }

    if (!pdfPath) {
      console.log("Error generating the Sanction Letter PDF");
      return { error: "PDF generation failed" };
    }
   
          const uploadResponse = await uploadPDFToBucket(pdfPath, `APPLICATION_FORM${Date.now()}.pdf`);
          const url = uploadResponse.url
          console.log(url,"url")   
          
          
          await finalsanctionModel.findOneAndUpdate(
            { customerId }, // Query to find the specific customer document
            {
              $set: { "fcplPdfUrls.fincooperApplicantPdf": url } // Dot notation for nested update
            },
            { new: true, upsert: false } // Options: Return updated doc, don't create new one
          );
          console.log(pdfPath,"sanction pdfpath")
          // return pdfPath
          // success(res, "PDF generated successfully", pdfPath);
          // return pdfPath
          return (
            {
              APPLICATION_FORM:url,
          });

  } catch (error) {
    console.error(error);
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


module.exports = { growpdf, FincooperApplicantionPdf };
