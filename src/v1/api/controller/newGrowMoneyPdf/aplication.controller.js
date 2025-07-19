const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

const moment = require("moment");
const { validationResult } = require("express-validator");
  const stream = require('stream')
  //   const { uploadToSpaces } = require("../../services/spaces.service.js")
  const uploadToSpaces = require("../../services/spaces.service.js");
  
    const { EventEmitter } = require('events');
  const myEmitter = new EventEmitter(); 
const mongoose = require('mongoose')


const customerModel = require('../../model/customer.model')
const coApplicantModel = require('../../model/co-Applicant.model')
const guarantorModel = require('../../model/guarantorDetail.model')
const applicantModel = require('../../model/applicant.model')
const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel')
const appPdcModel = require('../../model/branchPendency/appPdc.model')
disbursementModel =require('../../model/fileProcess/disbursement.model')
// finalSanctionModel = require('../../model/fileProcess/finalSanction.model')
gtrPdcModel = require('../../model/branchPendency/gtrPdc.model')
const creditPdModel = require('../../model/credit.Pd.model')
const sanctionModel =  require('../../model/finalApproval/sanctionPendency.model')
const finalsanctionModel =  require('../../model/finalSanction/finalSnction.model')
const externalBranchModel = require("../../model/adminMaster/newBranch.model.js");
const bankDeatilsKycs = require('../../model/branchPendency/bankStatementKyc.model');
const endUseOfLoanModeldata = require('../../model/endUseOfLoan.model.js');




const pdfLogo = path.join(__dirname, "../../../../../assets/image/FINCOOPERSLOGO.png");
// const imagelogo = path.join(__dirname, "../../../../../assets/image/ellipse321.jpeg")
const watermarklogo = path.join(__dirname, "../../../../../assets/image/watermarklogo.png");

function capitalizeFirstLetter(name) {
  return name.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}



async function growpdf(allPerameters,logo,partnerName) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }

  // function addLogo() {
  //   if (fs.existsSync(logo)) {
  //     doc.image(logo, 400, 50, {
  //       fit: [150, 50],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${pdfLogo}`);
  //   }
  // }
const FinpdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);
console.log(FinpdfLogo,"FinpdfLogo")

  function addLogo(doc) {
    if (fs.existsSync(FinpdfLogo)) {
      doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
    } else {
      console.error(`Logo file not found at: ${FinpdfLogo}`);
    }

    if (fs.existsSync(logo)) {
            doc.image(logo, 40, 50, {
              fit: [150, 50],
              align: "right",
              valign: "bottom",
            });
          } else {
            console.error(`Left logo file not found at: ${logo}`);
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.com", {
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

  // const pdfFilename = `applicantion.pdf`;
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

  doc.moveDown(4);
  doc.fontSize(8).font(fontBold).text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All ields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                    ${allPerameters.date}`, { align: "left" });
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "left" });
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
    const columnWidths = [200, 300, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#1E90FF"; // Light blue background color
  
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
    console.log(dataLength);
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
    const noteHeight = doc.heightOfString(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`) + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`, startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {//imagelogo
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
  const specialRowColor = "#1E90FF"; // Light blue background color

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
    //   .fill("#1E90FF")  // Color for the section title (same as before)
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
  addLogo(doc);
  addWatermark(doc);
  drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value: `${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    { key: "Loan Purpose", value: `${allPerameters.loanPurpose}` },
    { key: "Loan Type", value: allPerameters.loanType || "SECURED" },
  ];
  drawTable("Loan Details", loanDetails);

  // Sourcing Details Section

  const sourcingDetails = [{
    key:`Sourcing Type`,
    value: `${allPerameters.sourceType}` || "NA",

  }, {
    key: "Gen Partner Name",
    value: allPerameters.genPartnerName || "NA",
  }, {
    key: "Sourcing Agent Name : ",
    value: allPerameters.sourcingAgentName || "NA",
  }, {
    key: "Sourcing Agent Code : ",
    value: allPerameters.sourcingAgentCode || "NA",
  }, {
    key: "Sourcing Agent Location : ",
    value: allPerameters.sourcingAgentLocation || "NA",
  }, {
    key: "Sourcing RM Name : ",
    value: allPerameters.sourcingRMName || "NA",
  }, {
    key: "Sourcing RM Code : ",
    value: allPerameters.sourcingRMCode || "NA",
  }]

  drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
  const productProgramDetails = [
    { key: "Industry Type", value: "FIN COOPERS" },
    { key: "Sub Industry Type", value: "FIN COOPERS" },
    { key: "Product Type", value: "SECURED" },
    { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
    { key: "Secured/Un-Secured", value: "SECURED" },
    { key: "Property Value", value: "Rs. 500000" },
    { key: "BT EMI Value", value: "NA" },
  ];
  drawTable("Product Program Details", productProgramDetails);
  addFooter(doc);
  addLogo(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });


  const applicantDetails = [

    {
      key: "Application Type", value: `${allPerameters.appType}`
    }, {
      key: "Business Type", value: `${allPerameters.buisnessType}`
    }, {
      key: "Applicant Name", value: `${allPerameters.borrowerName}`
    }, {
      key: "Applicant Father/Spouse Name", value: `${allPerameters.appFather}`
    }, {
      key: "Applicant Mother Name", value: `${allPerameters.appMother}`
    }, {
      key: "Mobile No.1", value: `${allPerameters.appMob1}`
    }, {
      key: "Mobile No.2", value: `${allPerameters.appMob2}`
    }, {
      key: "Email ID", value: `${allPerameters.appEmail}`
    }, {
      key: "Education Qualification", value: `${allPerameters.appEdu}`
    }, {
      key: "Applicant DOB", value: `${allPerameters.appDOB}`
    }, {
      key: "Gender", value: `${allPerameters.appGender}`
    }, {
      key: "Marital Status", value: `${allPerameters.appMaritalStatus}`
    }, {
      key: "Pan Number", value: `${allPerameters.appPan}`
    }, {
      key: "Aadhar Number", value: `${allPerameters.appAdhar}`
    }, {
      key: "Voter Id Number", value: `${allPerameters.AppVoterId}`
    }
  ];




  const communicationAddress = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.appadharadress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.appCityName}`,
    }, {
      key: "District Name", value: `${allPerameters.appdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`
    }, {
      key: "State", value: `${allPerameters.AppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`
    }
  ]


  // const PermanentAddress = [
  //   {
  //     key: "Same as Communication address", value: "YES",
  //   }, {
  //     key: "Address", value: `${allPerameters.appadharadress}`,
  //   }, {
  //     key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
  //   }
  // ]


  // Application details -2  ---- Parent address --- last 4 data //

  // Add the new page 

  const PermanentAddress = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.appadharadress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
    },
    {
      key: "District Name", value: `${allPerameters.appdistrict}`,
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`,
    }, {
      key: "State", value: `${allPerameters.AppState}`,
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
    }
  ]
  // const ParmentAddress2 = [
  //   , {
  //     key: "District Name", value: `${allPerameters.appdistrict}`,
  //   }, {
  //     key: "Pin Code", value: `${allPerameters.AppPin}`,
  //   }, {
  //     key: "State", value: `${allPerameters.AppState}`,
  //   }, {
  //     key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
  //   }
  // ]










// const imagelogo =path.join(__dirname, `../../../../..${allPerameters.appImage}`);

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
  console.log(imagePath, "imagePathimagePath");

  // Call the function in the PDF generation pipeline
  drawTable3("Applicant Details", applicantDetails, imagePath);
  doc.moveDown(1);
  drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // drawNewPage(ParmentAddress2);
  drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3: Co-applicant/Guarantor Details", { underline: true });

  const coApplicantDetails = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.coRelWithApp}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob1}`,
    },{
      key: "Mobile No.2", value: `${allPerameters.coappMob2}`
    },
     {
      key: "Email ID", value: `${allPerameters.coAppEmail}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId}`,
    }
  ]

  const communicationAddressco = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    }, {
      key: "State", value: `${allPerameters.coAppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppcurentAdress}`
    }
  ]

  const ParentAddressco = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    },
    { key: "State", value: `${allPerameters.coAppState}` },
    { key: "Years at Permanent addres", value: `${allPerameters.coAppcurentAdress}` }
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]


  
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
  const imagelogo1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  // const imagelogo1 =path.join(__dirname, `../../../../..${allPerameters.co1Image}`);


  drawTable3("Co-Applicant Details-1", coApplicantDetails, imagelogo1);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco);
  addFooter(doc);

  //coApplicant 2
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3:  Additional Co-Applicant Details", { underline: true });

  const coApplicantDetails1 = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType2}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName2}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.corelwithApp2}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather2}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother2}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob12}`,
    }
    , 
    {
      key: "Mobile No.2", value: `${allPerameters.coappMob22}`
    },{
      key: "Email ID", value: `${allPerameters.coAppEmail2}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu2}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob2}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender2}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus2}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan2}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar2}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId2}`,
    }
  ]

  const communicationAddressco1 = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress2}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity2}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict2}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN2}`
    }, {
      key: "State", value: `${allPerameters.coAppState2}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppNoOfYearsATCurrentAddress2}`
    }
  ]

  const ParentAddressco1 = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress2}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity2}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict2}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN2}`
    },
    { key: "State", value: `${allPerameters.coAppState2}` },
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]



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
const imagelogo2 = await saveImageLocally2(`${allPerameters.co2Image}`);
  // const imagelogo2 =path.join(__dirname, `../../../../..${allPerameters.co2Image}`);


  drawTable3("Co-Applicant Details-2", coApplicantDetails1, imagelogo2);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco1);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco1);
  addFooter(doc);


  // add a new page for section 4
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)





  // Guarnator Details //

  const GuarnatorDetails = [
    {
      key: "Guarantor Type",
      value: `${allPerameters.guaType}`
    }, {
      key: "Guarantor Name",
      value: `${allPerameters.guaName}`
    }, {
      key: "Relation with Applicant",
      value:`${allPerameters.guaRelWithApplicant}`
    }, {
      key: "Guarantor Father/Spouse Name",
      value: `${allPerameters.guaFather}`
    }, {
      key: "Guarantor Mother Name",
      value: `${allPerameters.guaMother}`
    }, {
      key: "Mobile No.1",
      value: `${allPerameters.guaMobile}`
    },
    {
      key: "Mobile No.2", value: `${allPerameters.guaMobileNo2}`
    },  {
      key: "Email ID",
      value: `${allPerameters.guaEmail}`
    }, {
      key: "Education Qualification",
      value: `${allPerameters.guaEdu}`
    }, {
      key: "Guarantor DOB",
      value: `${allPerameters.guaDob}`
    }, {
      key: "Gender",
      value: `${allPerameters.guaGender}`
    }, {
      key: "Marital Status",
      value: `${allPerameters.guaMaritialStatus}`
    }, {
      key: "Pan Number",
      value: `${allPerameters.guaPan}`
    }, {
      key: "Aadhar Number",
      value: `${allPerameters.guaAdhar}`
    }, {
      key: "Voter Id Number",
      value:`${allPerameters.guaVoterId}`
    }
  ]

  const communicationAddressGuarnator = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.guaAdressAdhar}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.guaCity}`,
    }, {
      key: "District Name", value: `${allPerameters.guaDist}`
    }, {
      key: "Pin Code", value: `${allPerameters.guaPin}`
    }, {
      key: "State", value: `${allPerameters.guaState}`
    }, {
      key: "Years at current address", value: `${allPerameters.guaYearsCurrentAddress}`
    }
  ]

  const GuarnatorParentAddress = [
    {
      key: "Same as Communication address", value: "YES"

    }, {
      key: "Address",
      value: `${allPerameters.guaAdressAdhar}`
    }, {
      key: "Name of City/Town/Village",
      value: `${allPerameters.guaCity}`
    }, {
      key: "District Name ",
      value: `${allPerameters.guaDist}`
    }, {
      key: "Pin Code", value: `${allPerameters.guaPin}`
    },
    {
      key: "State",
      value: `${allPerameters.guaState}`
    }, {
      key: "Years at Permanent address",
      value: `${allPerameters.guaYearsCurrentAddress}`
    }
  ]

  const GuarnatorParentAddress1 = [
    {
      key: "Same as Communication address", value: "NA",
    }, {
      key: "Address", value: "NA",
    }, {
      key: "Name of City/Town/Village", value: "NA",
    }]

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
      const imagelogo3 = await saveImageLocally3(`${allPerameters.guaImage}`);
    // const imagelogo3 =path.join(__dirname, `../../../../..${allPerameters.guaImage}`);


  drawTable3("Guarnator Details", GuarnatorDetails, imagelogo3);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressGuarnator);
  // drawTable("Permanent Address", GuarnatorParentAddress);
  doc.moveDown(1);
  addFooter(doc);


  // Add the new page  GuarnatorParentAddress-1//
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  drawTable("Permanent Address", GuarnatorParentAddress);
  addFooter(doc);


  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  const CollateralsDetails = [
    { key: "Type", value: "RESIDENTIAL" },
    { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  ]

  const BankDetails = [
    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  drawTable("Collaterals Details", CollateralsDetails);
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

  const ReferanceDetails = [
    { 
      key: "Reference 1 - Name", value: `${allPerameters.ref1name}` ,
    },{ 
      key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    },{ 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
     {
       key: "Reference 2 - Name", value: `${allPerameters.ref2name}`

    },{ key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

     },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTable("Referance Detail", ReferanceDetails)




  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // Define styles
  const titleFontSize = 11;
  const contentFontSize = 9;
  const headingFontsize = 8
  const leftMargin = 50;
  const textWidth = doc.page.width - 2 * leftMargin;
  const lineSpacing = 1.5;

  // Section title: COMMON DECLARATIONS

  doc.moveDown(2);
  doc.fontSize(headingFontsize)
    .text("We acknowledge the receipt of your application for availment of Loan & the same will be processed within a period of 15 days from today.", leftMargin, doc.y);

  doc.moveDown(2);

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("COMMON DECLARATIONS");
  doc.moveDown(0.5)

  doc.fontSize(contentFontSize)
    .text("I/We hereby acknowledge and confirm that:", {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    })
  // Array of declarations text
  const declarations = [

    `I hereby declare that I am not involved in any type of production or trading activity that comes under International Finance Corporation exclusion list.*Production or trade in any product or activity deemed illegal, pharmaceuticals, pesticides/herbicides, ozone-depleting substances, PCB's, wildlife, weapons, munitions, alcoholic beverages (excluding beer and wine), tobacco, gambling, casinos, radioactive materials, unbonded asbestos fibers, drift net fishing in the marine environment.`,
    `The executive of Fin Coopers Capital Pvt Ltd (Lender), collecting the application/documents has informed me/us of the applicable schedule of charges, fees, commissions, and key facts, as more particularly mentioned in the “Schedule of charges” on the website of the company.`,
    `Submission of loan application to the lender does not imply automatic approval by the lender and the lender will decide the quantum of the loan at its sole & absolute discretion. The lender in its sole and absolute discretion may either approve or reject the application for granting the loan. In case of rejection, the lender shall not be required to give any reason.`,
    `I/We authorized and give consent to Fin Coopers Capital Pvt Ltd to disclose, without noticing me/us, the information furnished by me/us in the application form(s)/ related documents executed/to be executed in the relation to the facilities to be availed by me/us from Fin Coopers Capital Pvt Ltd, to other branches/Subsidiaries/affiliates/credit Bureaus/CIBIL/Rating Agencies/service providers, Banks/financial institutes, governmental/regulatory authorities or third parties who may need, process & publish the information in such manner and through such medium as it may be deemed necessary by the lender/RBI, including publishing the name as part of wilful defaulter’s list from time to time, as also use for KYC information verification, credit risk analysis or for any other purposes as the lender deemed necessary.`,
    `I/We declare that all the particulars and information and documents provided with this form are genuine, true, correct, complete, and up to date in all respects and that I/We have not withheld/suppressed any information/document whatsoever. I/We also authorized Genesis Securities Pvt Ltd to use the documents, download records from CKYCR using the KYC identifier submitted, video record the KYC document, personal discussion, and any other information provided herewith to extract additional information from the various public domains, including but not limited to CIBIL/Bureau report, Perfios report, etc. or for any other regulatory & compliance-related matters, prior to sanction/post sanction.`,
    `I/We have been informed of the documents to be submitted with the loan application form and have submitted the same. I/ We shall furnish any additional documents as and when required by the lender.`,
    `The executive collection of the application/documents has informed me/us of the rate of interest and approach for gradation of risk and rational of charging different rates of interest to different categories of borrowers, the particulars whereof have specified in the Loan Application form.`,
    `The rate of interest is arrived at based on various factors such as cost of funds, administrative cost, risk premium, margin, etc. The decision to give a loan and the interest rate applicable to each loan account are assessed on a case-to-case basis, based on multiple parameters such as borrower proile, repayment capacity, the asset being inanced, borrower’s other inancial commitments, past repayment track record, if any,security, tenure, etc. The rate of interest is subject to change as the situation warrants and is subject to the discretion of the company.`,
    `The credit decision is based on the credit model which includes factors like credit history, repayment track record, banking habit, business stability & cash flow analysis which is assessed through a combination of personal discussion and documentation.`,
  ];

  // Loop to display declarations with numbering
  declarations.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  });
  addFooter(doc);

  // add the new page for section 7
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  const DeclarationDetails = [
    `Incomplete/defective application will not be processed and the lender shall not be responsible in any manner for the resulting delay or otherwis.`,
    ` Loan foreclose charges should be as per sanction terms.`,
    `The loan term as sanctioned are applicable for the specified product as indicated in the loan application and are valid for the period of 60 days only. Where for some reason, there is a delay in concluding the loan, the lender reserves the right to revise the loan term as may be applicable at the\ntime of actual loan availment upon providing a copy of revisions to me/us.`,
    `All the particulars and the information and details are given/illed in this application form are true, correct, complete, and up to date in all respects, and I/We have not withheld any information whatsoever.`,
    `Any fault or misrepresentation in the documents will be my/our sole responsibility and Fin Coopers Capital Pvt Ltd has the authority to take rightful action against any such fault/misrepresentation.`,
    ` I/we shall inform the lender regarding any changes in my/our address(s) or my employment or profession, or any material deviation from the information provided in the loan application form.`,
    ` I/We hereby confirm that I/we am/are competent and fully authorized to give declarations, undertaking, etc., and to execute and submit this application form and all other documents for the purpose of availing the loan, creation of security, and representing generally for all the purposes.`,
    `I/We acknowledge and understand that the application/processing fees collected from me/us by Fin Coopers Capital Pvt Ltd, is for reviewing the loan application as per its own parameters and its not refundable to me/us under any circumstances whatsoever, irrespective of whether FinCoopers Capital Pvt Ltd sanction this loan application of mine or not. No cash has been given by me/us to any person for whatsoever reason related to the loan application.`,
    ` The lender has the right to retain the documents along with the photographs submitted with the loan application, and the same will not be returned to the applicant.`,
    `I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other social media applications.`,
    ` Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).`,
    `I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our vernacular language(s), & we have understood the same.`,

  ]

  // Loop to display declarations with numbering
  DeclarationDetails.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 10}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // const DeclarationDetails1 = [
  //   "I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other\nsocial media applications.",
  //   " Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).",
  //   "I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our\nvernacular language(s), & we have understood the same"
  // ]

  // Loop to display declarations with numbering
  // DeclarationDetails1.forEach((text, index) => {
  //   // Numbered list item
  //   doc.font('Helvetica')
  //     .fontSize(contentFontSize)
  //     .text(`${index + 7}. ${text}`, leftMargin, doc.y, {
  //       width: textWidth,
  //       lineGap: lineSpacing,
  //       align: 'justify',
  //     });
  //   // Add spacing between items if needed
  //   doc.moveDown(0.5);
  // }
  // );

  doc.moveDown(1)

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("OTHER TERMS & CONDITIONS:", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });
 
  doc.moveDown(1)

  const DeclarationDetails2 = [
    "Payment: No cash/bearer cheque has been collected from me up-front towards processing the loan application.",
    "Details with respect to the EMI presentation dates, number of EMIs, amount, and other terms & conditions of the loan will be communicated separately along with the welcome letter.",
    "No discount/fees gifts or any other commitment is given whatsoever which is not documented in the loan agreement by the lender or any of its authorized representative(s).",
    "The lender shall make all attempts to process the application and disburse the loan within 30 (thirty) working days from the date of the completion and submission of all relevant loan documents as specified therein.",
    "Other charges: Loan processing fees would be up to 4% of the loan amount.",
    "Charges which are in nature of fees are exclusive of good and service tax. Goods and services tax and other government levies, as applicable, would be charged additionally.",
    "Fin Coopers shall have a right to either process and disburse the entire loan amount singly or jointly together with such other co-lending partners i.e. bank/NBFCs as it may be deemed fit."
  ]

    // Sample data
const signatureData = [
  'Signature Applicant (Authorised   Signatory)                ',
  'Signature Co-Applicant-1/Guarantor-1 (Authorised Signatory)',
  'Signature Co-Applicant-2/Guarantor-2 (Authorised Signatory)',
  '  Signature      Guarantor              (Authorised Signatory)',
];

  // Loop to display declarations with numbering
  DeclarationDetails2.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  doc.moveDown(4)

  doc.font('Helvetica')
    .fontSize(headingFontsize)
    .text("If applicant / borrower require any clariication regarding their application / loan, they may write into :", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });

  doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("Fin Coopers Capital Pvt Ltd, 401,174/3,Nehru Nagar,Indore-452011 (M.P.), or email us at: Info@incoopers.com", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.moveDown(1)

    doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.font('Helvetica')
     .fontSize(headingFontsize)
      .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
       width: textWidth,
       lineGap: lineSpacing,
       align: 'justify',
      })

     doc.moveDown(1)

    createSignatureTablePDF(signatureData, 38, 120); // Adjusts left margin to 50 and top margin to 120




  // .fontSize(contentFontSize)
  // .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.")
  // .fontSize(headingFontsize)
  // .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.")

  addFooter(doc);


  
  // Make  a new page for the section 8 //
  doc.addPage();
  drawBorder();
  addLogo(doc);
  doc.moveDown(1)

  // const sectionTitle = "A. Loan Details";
  // const headers = ["", "UNSECURED", "SECURED", "P&M"];
  // const data = [
  //   ["Min Loan Amount", "1", "2", "3"],
  //   ["Max Loan Amount", "10", "15", "20"],
  //   ["Tenure", "5", "10", "7"],
  //   ["ROI (%)", "8%", "10%", "9%"],
  //   ["Pre-EMI (Rs.)", "(Pre-EMI interest details)", "5000", "4500"],
  //   ["EMI (Rs.)", "3000", "3500", "3200"],
  //   ["Rate Type", "Floating", "Fixed", "Floating"],
  //   ["Type of Transaction", "Loan", "Loan", "Loan"],
  // ];

 // Example Data
const headers = ["", "UNSECURED", "SECURED", "P&M"];
const data = [
  ["Min Loan Amount Possible", "1", "1", "1"],
  ["Max Loan Amount Possible", "10", "10", "10"],
  ["Tenure (Yrs)", "3-6 yrs", "3-6 yrs", "3-6 yrs"],
  ["ROI (%)", "20% - 26%", "20% - 26%", "11% - 17%"],
  ["Pre-EMI (Rs.)", "(Pre-EMI interest is to be paid from the day of the disbursement (fully & partially) till the date of commencement of EMI. ROI will be same as that for EMI)"], 
  ["EMI (Rs.)", "EMI will be based on inal loan amount, rate of interest and tenor approved."],
  ["Rate Type", "Floating", "Floating", "Floating"],
  ["Type of transaction" , "Charges"]
];

const sectionA = [
  ["Loan Applied - First or Incremental", "Upto 4%", "Upto 4%", "Upto 4%"],
  ["File Charges", "NA", "Rs 5900/-", "Rs 2500/-"],
  ["Legal Verification Charges", "NA", "At actuals", "Rs 2500/-"],
  ["Technical Verification / Valuation", "NA", "At actuals", "Rs 6500/-"],
];

const sectionB = [
  [`Early Payments within 12 months of
    loan sanction`, "NA", `6% of Principal outstanding for loan foreclosed within 12 monthsof loan
    sanction`, "NA"],

  [`Early payment after 12 months of loan sanction above 25% of principal outstanding at the beginning of financial year`, "NA", "4%", "6%"],
  ["Foreclosure Charges (Within 12 Months)", "NA", "6%", "6%"],
  ["Foreclosure Charges (After 12 Months)", "NA", "5%", "4%"],
];

const footerNote = "There are no charges on foreclosure or pre-payment on floating rate term loans sanctioned to individual borrowers. The above partprepayment and foreclosure charges are subject to the regulatory requirements and directions prescribed by Reserve Bank of India from Time to time";



// Generate the PDF
// Calling the function with custom font size and border width:
drawComplexTable(headers, data, sectionA, sectionB, footerNote, 8, 0.5);
doc.moveDown(1);
addFooter(doc);



//ankit //
doc.addPage();
drawBorder();
addLogo(doc);

doc.moveDown(10);
doc
.fillColor("black")
.font('Helvetica-Bold')
.text(`C. Other Charges  :-   `,{align:'center'});
doc.moveDown()

// Layout configuration
const startX = 48;
let startY = doc.y;
const tableWidth = 500;
const cellHeight = 20;
const cellWidth = 500; // Total width of the cell
const borderThickness = 0.5;
const customHeight = 40; // Custom height for the cell


function createTwoColumnCellFirst(doc, data, startX, startY, cellWidth, cellHeight, borderThickness) {
      const column1Width = cellWidth * 0.4; // 40% of the total width
      const column2Width = cellWidth * 0.6; // 60% of the total width
  
      // Set border properties
      doc.strokeColor('black').lineWidth(borderThickness);
  
      // Draw outer border for the cell
      doc.rect(startX, startY, cellWidth, cellHeight).stroke();
  
      // Draw divider for the two columns
      doc.moveTo(startX + column1Width, startY)
          .lineTo(startX + column1Width, startY + cellHeight)
          .stroke();
  
      // Add text to the first column
      doc.text(data[0], startX + 5, startY + 5, {
          width: column1Width - 10, // Padding of 5 on each side
          align: 'left',
      });
  
      // Add text to the second column
      doc.text(data[1], startX + column1Width + 5, startY + 5, {
          width: column2Width - 10, // Padding of 5 on each side
          align: 'center',
      });
  
      return startY + cellHeight; // Return updated Y position after the cell
  }
  

  const DateOfTransfers = ['PDC/ ECS/ NACH Bounce Charges / per tr', 'Rs 750/'];

  startY = createTwoColumnCellFirst(doc, DateOfTransfers, startX, startY, cellWidth, cellHeight, borderThickness);
  
doc.moveDown(2)

// Function to render a five-column row
function renderFiveColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in each column
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw vertical dividers for each column
  let x = startX;
  for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      doc.moveTo(x, startY)
          .lineTo(x, startY + maxHeight)
          .stroke();
  }

  // Add text to each column
  x = startX;
  for (let i = 0; i < data.length; i++) {
      doc.text(data[i], x + 5, startY + 5, {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      x += columnWidths[i];
  }

  return startY + maxHeight; // Return updated Y position
}


// Function to render a two-column row
function renderTwoColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in both columns
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'center',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw the divider for the columns
  doc.moveTo(startX + columnWidths[0], startY)
      .lineTo(startX + columnWidths[0], startY + maxHeight)
      .stroke();

  // Add text to each column
  doc.text(data[0], startX + 5, startY + 5, {
      width: columnWidths[0] - padding,
      align: 'left',
  });
  doc.text(data[1], startX + columnWidths[0] + 5, startY + 5, {
      width: columnWidths[1] - padding,
      align: 'center',
  });

  return startY + maxHeight; // Return updated Y position
}


// Refactored createFiveColumnCell function
function createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness) {
  // Define column widths
  const fiveColumnWidths = [
      tableWidth * 0.3, // Column 1: 30%
      tableWidth * 0.1, // Column 2: 10%
      tableWidth * 0.2, // Column 3: 20%
      tableWidth * 0.2, // Column 4: 20%
      tableWidth * 0.2, // Column 5: 20%
  ];
  const twoColumnWidths = [
      tableWidth * 0.4, // Column 1: 40%
      tableWidth * 0.6, // Column 2: 60%
  ];

  
  // Render the five-column row
  startY = renderFiveColumnRow(doc, fiveColumnData, startX, startY, fiveColumnWidths, cellHeight, borderThickness);


  // Render the first two-column row
  startY = renderTwoColumnRow(doc, twoColumnData, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  // Render the second two-column row
  startY = renderTwoColumnRow(doc, twoColumnData1, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData1, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY= renderTwoColumnRow(doc, twoColumnData2, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData3, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData4, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData5, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData6, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY = renderFiveColumnRow(doc, fiveColumnData2, startX, startY, fiveColumnWidths, cellHeight, borderThickness);
  
  startY = renderTwoColumnRow(doc, twoColumnData7, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc, twoColumnData8, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData3, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData4, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData5, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData6, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData7, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc , twoColumnData9 , startX , startY , twoColumnWidths , cellHeight , borderThickness)
  return startY; // Return the final updated Y position

}

function renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness) {
  const padding = 10; // Padding for text within the cell
  
  // Set bold text style
  doc.font('Helvetica-Bold');

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startX, startY, tableWidth, customHeight).stroke();

  // Add the bold text in the cell
  doc.text(text, startX + padding, startY + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: 'left',
      continued: false
  });

  // Return the updated Y position after the cell
  return startY + customHeight;
}


// Data for the table
const fiveColumnData = ['Field collection charges per E' ,'NA',  'NA' ,'' , 'NA'];
const fiveColumnData1=[`Modiication of loan terms
after irst disbursement
including but not limited
to re - scheduling of loan
repayment term, addition/
deletion of coborrowers etc`
 ,`Upto 2% of
outstanding
principal
amount (As
on the date
of
transaction)`,

`Upto 2% of outstanding
principal amount
` ,'' , `Upto 2% of outstanding principal
amount
`]
const fiveColumnData2=[`Cersai Charges` , `NA ` ,  `Rs 500/- ` , `` ,`Rs 500/-`]
const fiveColumnData3=[`RTO transfer charges**` , `NA `, `NA`, ``, `Rs10000/-`]
const fiveColumnData4=[`Applicate RC issuance charges` , `NA` , `NA`, `` , `Rs10000/-`]
const fiveColumnData5=[`MOD Registration Expenses` , `NA` , `NA` ,`` , `NA`]
const fiveColumnData6=[`Stamp Duty and`, `NA`, `NA` , ``, `NA`]
const fiveColumnData7=[`EC` , `NA`, `NA` , ``, `NA`]






const twoColumnData = [`Repayment instrument
change/ swap charges`, `Rs 1000/-`];
const twoColumnData1 = [`EMI repayment cycle date`,  `Rs 1000/-`];
const twoColumnData2=[`Issuance of duplicate 
  income tax certiicate` ,
  `Rs 500 /-`
]
const twoColumnData3=[`Issuance of Duplicate No
objection certiicate (NOC)
` , `Rs 500 /-`]

const twoColumnData4=[`Acticate Statement of Accounts`, `Rs 500 /-`]
const twoColumnData5=[`Document retrieval` , `Rs 1000/- `]
const twoColumnData6=[`Loan Cancellation Charges` , `Rs 20000 + rate of interest from the date of disbursement till date of request of cancellation`]
const twoColumnData7=[`Renewal Charges ` , `NA`]
const twoColumnData8=[`Tranche release charges` , `NA`]
const twoColumnData9=[`Penal Charges` , `3% pm on Instalment overdue`]



// Text to display in the cell
const text = `* Please note that above fee and charges are exclusive of GST, education cess and other government taxes, levies etc. The above schedule of
charges is subject to change and will be at the sole discretion of Fin Coopers Capital Pvt Ltd, The Changes will be available on Fin Coopers`;




// Call the function
startY = createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness);

// Create the full-width bold cell
startY = renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness);

addFooter(doc);

// Add a new Page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);  // Add some space after the logo

let startx = 48;
let starty = doc.y;  // Get the current Y position to start the first table
const Height=20

const fiveColumnWidths = [
  tableWidth * 0.3, // Column 1: 30%
  tableWidth * 0.1, // Column 2: 10%
  tableWidth * 0.2, // Column 3: 20%
  tableWidth * 0.2, // Column 4: 20%
  tableWidth * 0.2, // Column 5: 20%
];




// Function to render a full-width bold cell with custom font size and padding
function renderFullWidthBoldCell1(doc, text, startx, starty, tableWidth, customHeight, borderThickness, fontSize, padding, alignment) {
  // Set bold text style and custom font size
  doc.font('Helvetica-Bold').fontSize(fontSize);

  // Calculate the height of the text
  const textHeight = doc.heightOfString(text, {
      width: tableWidth - 2 * padding, // Width available for the text
  });

  // Adjust the cell height if the text height exceeds the current custom height
  customHeight = Math.max(customHeight, textHeight + 2 * padding);

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startx, starty, tableWidth, customHeight).stroke();

  // Add the bold text in the cell with custom padding
  doc.text(text, startx + padding, starty + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: alignment, // Text alignment
      continued: false,
  });

  // Return the updated Y position after the cell
  return starty + customHeight; // Return the new startY for the next content
}


// Text to display in the first cell
const text1 = `Revised MSME Classiication applicable w.e.f 1st July 2020`;

// Define custom font size and padding
const fontSize = 6;  // Customize the font size as needed
const padding = 6;    // Customize the padding as needed

// Render the first table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text1, startx, starty, tableWidth, Height, borderThickness, fontSize, padding , allignment="center");

// Text to display in the second cell
const text2 = "Composite Criteria#: Investment in Plant & Machinery/equipment and Annual Turnover";
const text3=`# Meaning of Composite Criteria - If an enterprise crosses the ceiling limits specified for its present category in either of the two criteria of
investment or turnover, it will cease to exist in that category and be placed in the next higher category but no enterprise shall be placed in the
lower category unless it goes below the ceiling limits specified for its present category in both the criteria of investment as well as turnover
`

const text4=`*All units with Goods and Services Tax Identiication Number (GSTIN) listed against the same Permanent Account Number (PAN) shall be
collectively treated as one enterprise and the turnover and investment igures for all of such entities shall be seen together and only the aggregate
values will be considered for deciding the category as micro, small or medium enterprise.
`
// Render the second table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text2, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");

// Add more content or tables as needed

const fiveColumnData10=[`Enterprise Classiication` , `Micro `, `Small ` , ``, `Medium`]

const fiveColumnData11 = [`Investment in Plant and
Machinery or Equipment,not exceeding,` , `₹ 1 Crore` , `₹ 10 Crore ` ,  ` `, `₹ 50 Crore` ]

const fiveColumnData12 = [`Annual Turnover, not exceeding` , `₹ 5 Crore` , `₹ 50 Crore `  , ` ` , `₹ 250 Crore`]

starty = renderFiveColumnRow(doc, fiveColumnData10, startx, starty, fiveColumnWidths, cellHeight, borderThickness);
starty=  renderFiveColumnRow(doc , fiveColumnData11 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFiveColumnRow(doc , fiveColumnData12 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFullWidthBoldCell1(doc, text3, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
starty = renderFullWidthBoldCell1(doc, text4, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
// Add footer to the document
addFooter(doc);



doc.addPage();
  drawBorder();
  addLogo(doc);
doc.moveDown(8)

const datatable = [
  { documentName: 'Application Form:',
   documentDetails: `Completed application form duly signed by all applicants, guarantors, and co-applicants (if any)` },
  {
    documentName:'Photograph',
    documentDetails:  `Signed coloured photograph of each applicant(except non-individuals) graph of each applicant (except non-individuals),individual guarantors and co-applicants (if any)`
  },{
    documentName:`Age Proof (For individuals):[Copy of any one of the following]
`,
  documentDetails:`Passport (Not Expired), Pan Card OR Form 60, Voters ID card with complete date of Birth, Driving
License (Not Expired), High School Mark sheet/ Certiicate, LIC policy bond with latest premium paid
receipt (Minimum 12 months in force),
Sr Citizen ID card issued by Govt Body, Birth Certiicate/ Corporation Certiicate (Should have name mentioned on it).
`
  },{
    documentName:`Signature Veriication [Copy of any one of the following](wherever applicable):`,

  documentDetails:` Passport (Not Expired), Pan Card OR Form 60, Driving License (Not Expired), Copy of any cheque
issued in favor of Genesis Securities Pvt Ltd. (Subject to cheque must be cleared), Identity card with
applicants photograph & sign issued by Central/State Government Departments, Original Bankers
Veriication (not older than 30 days)
`
    
  },{

    documentName:`Income Proof*`,
    documentDetails:`  Latest ITR, Latest Form 16, Latest Salary Slip/Certificate, Latest Audited Financials, Bank details with
last 3 months salary
credited, Add- Business Proof-Qualification Certificate/Certificate of Practice (COP), Shop Act
License/MOA & AOA/Sales TaxNat registration/Partnership Deed.`
  },
  {documentName:`Property Document*`,
  documentDetails:`Copy of original sales deed, Allotment possession letter, NOC from society and other documents as per
legal report. The application will be assessed quickly after receiving the required documents.`
  },{
    documentName:`Proof of Identity & Address: (For Individual /Authorized Person)`,
    documentDetails:`Passport (not expired), PAN Card, Voter’s Identity Card issue by Election Commission of India, Driving
License, Proof of Possession of Aadhar (Voluntary), Job Card Issued by NREGA duly signed by office of
State Govt and Letter issued by the
National Population Register containing details of name and address, Ration Card, Bank Statement,
Electricity/Telephone Bill, Sale deed/property purchase agreement (for owned properties)`
  },{
    documentName:`For Trust:
   [Certified copies of each of the following
   documents]`,

    documentDetails:`Registration Certificate, Trust Deed, PAN No. or Form 60 of Trust, * Documents relating to beneficial owner, trustees’ managers, officers or employees as the case may be, holding an attorney to transact on its behalf.
`,
  }
];

createDocumentsRequiredTable(datatable)
addFooter(doc);


// // Add the new page for section 8//

doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8)

const datatables =[
  {
documentName:`For Sole Proprietorship: [Certified copy
of any two* of the following documents
in the name of the proprietary concern]`,
documentDetails:`* Proof of Identity/Address of Individual, Registration Certiicate, Certiicate/licence issued by the municipal authorities under Shop and Establishment Act., Sales and income tax returns, CST/VAT/ GST certiicate (provisional/inal), Certiicate/registration document issued by Sales Tax/Service Tax/Professional Tax authorities, Importer Exporter Code issued by the ofice of DGFT or License/ Certiicate of practice issued in name of the Proprietary concern by professional body incorporated under statute, The complete Income Tax Return in the name of the sole proprietor where the irm’s name and income is relected duly authenticated/acknowledged by the Income Tax Authorities, Utility bills such as electricity, water, and landline telephone bills in the name of the proprietary concern.`

  },
  {
documentName:`For Society Unregistered Partnership Firm:[Certified copy of any two* of the following documents in the name of the proprietary concern]`,
documentDetails:`Board Resolution of the Society/ Firm, PAN or Form 60 of the Society/ Firm, PAN or Form 60 of the
Society/ Firm,
*Documents relating to beneicial owner, ofice bearers, authorised signatories, managers, oficers or
employees, as the case may be, holding an attorney to transact on its behalf, such information as may
be required by the company to collectively establish the legal existence of such an association or body
of individuals.`},{

  documentName:`Note`,
  documentDetails:`1) * Documents relating to beneficial owner, managers, partners, trustees, officers or employees,
authorised signatories, as the case may be, holding an attorney to transact on its behalf: Same list of
documents as for the Individual/ Authorised Person as mentioned above.
2) All the customer documentation to be self-attested. In case of bank statement and inancials irst and
last page needs to be self-attested.
3) The Partnership Deed and the MOA & AOA should be attested stating ‘Certiied that this is duly
Amended & Latest True copy’.
4) All documents to be signed by the customer and OS done by our FTE/Contractual employee/
Genesis Authorized Representative.
5) Driving License - Booklet form is not accepted as KYC document.`
}
]

createDocumentsRequiredTable(datatables)
addFooter(doc);





// Add a new page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);


  function createAadhaarConsentPDF(executants) {
    // Title
    doc.fontSize(10).font('Helvetica-Bold').text('2. MOST IMPORTANT INFORMATION (Aadhaar Consent)', {
      align: 'center'
    });
  
    doc.moveDown(3.5);
  
    // Add the main content
    doc.fontSize(8).font('Helvetica').text(
      `I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company herewith shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in accordance with the applicable law.\n\n` +
        `I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained in vernacular (the language known to me):`,
      { align: 'justify' }
    );
  
    // Add numbered list
    doc.moveDown(1);
    doc.text(`i) the purpose and the uses of collecting Aadhaar;`);
    doc.moveDown(1);
    doc.text(`ii) the nature of information that may be shared upon offline verification;`);
    doc.moveDown(1);
    doc.text(`iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter's ID, driving license, etc.).`);
  
    doc.moveDown(1);
    doc.text(
      `I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of its officials responsible in case of any incorrect / false information or forged document provided by me.\n\n\n\n` +
        `This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in respect of the submission of his/her Aadhaar.`
    );
  
    // Add the footer information
    doc.moveDown(1);
    const date =`${allPerameters.appdate}`;
    const place = `${allPerameters.branchcity}`;
  
    doc.text(`DATE: ${date}`, { align: 'left' });
    doc.text(`PLACE: ${place}`, { align: 'left' });
  
    doc.moveDown(2);
  
    // Add signature table dynamically based on the passed array
    // executants.forEach((executant, index) => {
    //   doc.text(`Name of the Executant(s): ${executant.name}`, { align: 'left' });
    //   doc.text(`Signature: ________________________________`, { align: 'right' });
    //   if (index < executants.length - 1) doc.moveDown(1);
    // });

const docWidth = doc.page.width; // Get the page width
const marginRight = 50; // Set a custom right margin
const textIndent = 10; // Custom right alignment indent





    // Add the signature table
    doc.text(`Name of the Executant(s):`, { align: 'left' });
    doc.text(`Signature:`, { align: 'right' , indent: textIndent});
    doc.moveDown(1.5)
    doc.text(`${allPerameters.borrowerName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.coAppName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.guaName}`)
   
  
  }


// Example Usage
const executantsArray = [
  { name: `${allPerameters.borrowerName}` },
  { name: `${allPerameters.coAppName}` },
  { name: `${allPerameters.guaName}` },
];

createAadhaarConsentPDF(executantsArray);

  addFooter(doc);
  doc.end();





  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;


  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => resolve(pdfFileUrl));
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

async function growpdf1(allPerameters,logo,partnerName) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }
const FinpdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);
console.log(FinpdfLogo,"FinpdfLogo")

  function addLogo(doc) {
    if (fs.existsSync(FinpdfLogo)) {
      doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
    } else {
      console.error(`Logo file not found at: ${FinpdfLogo}`);
    }

    if (fs.existsSync(logo)) {
            doc.image(logo, 40, 50, {
              fit: [150, 50],
              align: "right",
              valign: "bottom",
            });
          } else {
            console.error(`Left logo file not found at: ${logo}`);
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

  function addFooter() {
    if( partnerName == "GROW MONEY CAPITAL PVT LTD") {
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.com", {
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

  // const pdfFilename = `applicantion.pdf`;
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

  doc.moveDown(4);
  doc.fontSize(8).font(fontBold).text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All ields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                    ${allPerameters.date}`, { align: "left" });
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "left" });
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
    const columnWidths = [200, 300, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#1E90FF"; // Light blue background color
  
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
    console.log(dataLength);
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
    const noteHeight = doc.heightOfString(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`) + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`, startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {//imagelogo
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
  const specialRowColor = "#1E90FF"; // Light blue background color

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
    //   .fill("#1E90FF")  // Color for the section title (same as before)
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
  addLogo(doc);
  addWatermark(doc);
  drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value: allPerameters.loanAmount || `${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: allPerameters.loanTenure || `${allPerameters.tenure}` },
    { key: "Loan Purpose", value: allPerameters.loanPurpose || "BUSINESS EXPANSION" },
    { key: "Loan Type", value: allPerameters.loanType || "SECURED" },
  ];
  drawTable("Loan Details", loanDetails);

  // Sourcing Details Section

  const sourcingDetails = [{
    key:`Sourcing Type`,
    value: `${allPerameters.sourceType}` || "NA",

  }, {
    key: "Gen Partner Name",
    value: allPerameters.genPartnerName || "NA",
  }, {
    key: "Sourcing Agent Name : ",
    value: allPerameters.sourcingAgentName || "NA",
  }, {
    key: "Sourcing Agent Code : ",
    value: allPerameters.sourcingAgentCode || "NA",
  }, {
    key: "Sourcing Agent Location : ",
    value: allPerameters.sourcingAgentLocation || "NA",
  }, {
    key: "Sourcing RM Name : ",
    value: allPerameters.sourcingRMName || "NA",
  }, {
    key: "Sourcing RM Code : ",
    value: allPerameters.sourcingRMCode || "NA",
  }]

  drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
  const productProgramDetails = [
    { key: "Industry Type", value: "FIN COOPERS" },
    { key: "Sub Industry Type", value: "FIN COOPERS" },
    { key: "Product Type", value: "SECURED" },
    { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
    { key: "Secured/Un-Secured", value: "SECURED" },
    { key: "Property Value", value: "Rs. 500000" },
    { key: "BT EMI Value", value: "NA" },
  ];
  drawTable("Product Program Details", productProgramDetails);
  addFooter(doc);
  addLogo(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });


  const applicantDetails = [

    {
      key: "Application Type", value: `${allPerameters.appType}`
    }, {
      key: "Business Type", value: `${allPerameters.buisnessType}`
    }, {
      key: "Applicant Name", value: `${allPerameters.borrowerName}`
    }, {
      key: "Applicant Father/Spouse Name", value: `${allPerameters.appFather}`
    }, {
      key: "Applicant Mother Name", value: `${allPerameters.appMother}`
    }, {
      key: "Mobile No.1", value: `${allPerameters.appMob1}`
    }, {
      key: "Mobile No.2", value: `${allPerameters.appMob2}`
    }, {
      key: "Email ID", value: `${allPerameters.appEmail}`
    }, {
      key: "Education Qualification", value: `${allPerameters.appEdu}`
    }, {
      key: "Applicant DOB", value: `${allPerameters.appDOB}`
    }, {
      key: "Gender", value: `${allPerameters.appGender}`
    }, {
      key: "Marital Status", value: `${allPerameters.appMaritalStatus}`
    }, {
      key: "Pan Number", value: `${allPerameters.appPan}`
    }, {
      key: "Aadhar Number", value: `${allPerameters.appAdhar}`
    }, {
      key: "Voter Id Number", value: `${allPerameters.AppVoterId}`
    }
  ];




  const communicationAddress = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.appadharadress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.appCityName}`,
    }, {
      key: "District Name", value: `${allPerameters.appdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`
    }, {
      key: "State", value: `${allPerameters.AppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`
    }
  ]


  // const PermanentAddress = [
  //   {
  //     key: "Same as Communication address", value: "YES",
  //   }, {
  //     key: "Address", value: `${allPerameters.appadharadress}`,
  //   }, {
  //     key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
  //   }
  // ]


  // Application details -2  ---- Parent address --- last 4 data //

  // Add the new page 

  const PermanentAddress = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.appadharadress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
    },
    {
      key: "District Name", value: `${allPerameters.appdistrict}`,
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`,
    }, {
      key: "State", value: `${allPerameters.AppState}`,
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
    }
  ]
  // const ParmentAddress2 = [
  //   , {
  //     key: "District Name", value: `${allPerameters.appdistrict}`,
  //   }, {
  //     key: "Pin Code", value: `${allPerameters.AppPin}`,
  //   }, {
  //     key: "State", value: `${allPerameters.AppState}`,
  //   }, {
  //     key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
  //   }
  // ]










// const imagelogo =path.join(__dirname, `../../../../..${allPerameters.appImage}`);

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
  console.log(imagePath, "imagePathimagePath");

  // Call the function in the PDF generation pipeline
  drawTable3("Applicant Details", applicantDetails, imagePath);
  doc.moveDown(1);
  drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // drawNewPage(ParmentAddress2);
  drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3: Co-applicant/Guarantor Details", { underline: true });

  const coApplicantDetails = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.coRelWithApp}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob1}`,
    },{
      key: "Mobile No.2", value: `${allPerameters.coappMob2}`
    },
     {
      key: "Email ID", value: `${allPerameters.coAppEmail}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId}`,
    }
  ]

  const communicationAddressco = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    }, {
      key: "State", value: `${allPerameters.coAppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppcurentAdress}`
    }
  ]

  const ParentAddressco = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    },
    { key: "State", value: `${allPerameters.coAppState}` },
    { key: "Years at Permanent addres", value: `${allPerameters.coAppcurentAdress}` }
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]


  
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
  const imagelogo1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  // const imagelogo1 =path.join(__dirname, `../../../../..${allPerameters.co1Image}`);


  drawTable3("Co-Applicant Details-1", coApplicantDetails, imagelogo1);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco);
  addFooter(doc);

  //coApplicant 2
 

  // add a new page for section 4
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)





  // Guarnator Details //

  const GuarnatorDetails = [
    {
      key: "Guarantor Type",
      value: `${allPerameters.guaType}`
    }, {
      key: "Guarantor Name",
      value: `${allPerameters.guaName}`
    }, {
      key: "Relation with Applicant",
      value:`${allPerameters.guaRelWithApplicant}`
    }, {
      key: "Guarantor Father/Spouse Name",
      value: `${allPerameters.guaFather}`
    }, {
      key: "Guarantor Mother Name",
      value: `${allPerameters.guaMother}`
    }, {
      key: "Mobile No.1",
      value: `${allPerameters.guaMobile}`
    },
    {
      key: "Mobile No.2", value: `${allPerameters.guaMobileNo2}`
    }, {
      key: "Email ID",
      value: `${allPerameters.guaEmail}`
    }, {
      key: "Education Qualification",
      value: `${allPerameters.guaEdu}`
    }, {
      key: "Guarantor DOB",
      value: `${allPerameters.guaDob}`
    }, {
      key: "Gender",
      value: `${allPerameters.guaGender}`
    }, {
      key: "Marital Status",
      value: `${allPerameters.guaMaritialStatus}`
    }, {
      key: "Pan Number",
      value: `${allPerameters.guaPan}`
    }, {
      key: "Aadhar Number",
      value: `${allPerameters.guaAdhar}`
    }, {
      key: "Voter Id Number",
      value:`${allPerameters.guaVoterId}`
    }
  ]

  const communicationAddressGuarnator = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.guaAdressAdhar}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.guaCity}`,
    }, {
      key: "District Name", value: `${allPerameters.guaDist}`
    }, {
      key: "Pin Code", value: `${allPerameters.guaPin}`
    }, {
      key: "State", value: `${allPerameters.guaState}`
    }, {
      key: "Years at current address", value: `${allPerameters.guaYearsCurrentAddress}`
    }
  ]

  const GuarnatorParentAddress = [
    {
      key: "Same as Communication address", value: "YES"

    }, {
      key: "Address",
      value: `${allPerameters.guaAdressAdhar}`
    }, {
      key: "Name of City/Town/Village",
      value: `${allPerameters.guaCity}`
    }, {
      key: "District Name ",
      value: `${allPerameters.guaDist}`
    },
    {
      key: "State",
      value: `${allPerameters.guaState}`
    }, {
      key: "Years at Permanent address",
      value: `${allPerameters.guaYearsCurrentAddress}`
    }
  ]

  const GuarnatorParentAddress1 = [
    {
      key: "Same as Communication address", value: "NA",
    }, {
      key: "Address", value: "NA",
    }, {
      key: "Name of City/Town/Village", value: "NA",
    }]

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
      const imagelogo3 = await saveImageLocally3(`${allPerameters.guaImage}`);
    // const imagelogo3 =path.join(__dirname, `../../../../..${allPerameters.guaImage}`);


  drawTable3("Guarnator Details", GuarnatorDetails, imagelogo3);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressGuarnator);
  // drawTable("Permanent Address", GuarnatorParentAddress);
  doc.moveDown(1);
  addFooter(doc);


  // Add the new page  GuarnatorParentAddress-1//
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  drawTable("Permanent Address", GuarnatorParentAddress);
  addFooter(doc);


  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  const CollateralsDetails = [
    { key: "Type", value: "RESIDENTIAL" },
    { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  ]

  const BankDetails = [
    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  drawTable("Collaterals Details", CollateralsDetails);
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

  const ReferanceDetails = [
    { 
      key: "Reference 1 - Name", value: `${allPerameters.ref1name}` ,
    },{ 
      key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    },{ 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
     {
       key: "Reference 2 - Name", value: `${allPerameters.ref2name}`

    },{ key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

     },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTable("Referance Detail", ReferanceDetails)




  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // Define styles
  const titleFontSize = 11;
  const contentFontSize = 9;
  const headingFontsize = 8
  const leftMargin = 50;
  const textWidth = doc.page.width - 2 * leftMargin;
  const lineSpacing = 1.5;

  // Section title: COMMON DECLARATIONS

  doc.moveDown(2);
  doc.fontSize(headingFontsize)
    .text("We acknowledge the receipt of your application for availment of Loan & the same will be processed within a period of 15 days from today.", leftMargin, doc.y);

  doc.moveDown(2);

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("COMMON DECLARATIONS");
  doc.moveDown(0.5)

  doc.fontSize(contentFontSize)
    .text("I/We hereby acknowledge and confirm that:", {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    })
  // Array of declarations text
  const declarations = [

    `I hereby declare that I am not involved in any type of production or trading activity that comes under International Finance Corporation exclusion list.*Production or trade in any product or activity deemed illegal, pharmaceuticals, pesticides/herbicides, ozone-depleting substances, PCB's, wildlife, weapons, munitions, alcoholic beverages (excluding beer and wine), tobacco, gambling, casinos, radioactive materials, unbonded asbestos fibers, drift net fishing in the marine environment.`,
    `The executive of Fin Coopers Capital Pvt Ltd (Lender), collecting the application/documents has informed me/us of the applicable schedule of charges, fees, commissions, and key facts, as more particularly mentioned in the “Schedule of charges” on the website of the company.`,
    `Submission of loan application to the lender does not imply automatic approval by the lender and the lender will decide the quantum of the loan at its sole & absolute discretion. The lender in its sole and absolute discretion may either approve or reject the application for granting the loan. In case of rejection, the lender shall not be required to give any reason.`,
    `I/We authorized and give consent to Fin Coopers Capital Pvt Ltd to disclose, without noticing me/us, the information furnished by me/us in the application form(s)/ related documents executed/to be executed in the relation to the facilities to be availed by me/us from Fin Coopers Capital Pvt Ltd, to other branches/Subsidiaries/affiliates/credit Bureaus/CIBIL/Rating Agencies/service providers, Banks/financial institutes, governmental/regulatory authorities or third parties who may need, process & publish the information in such manner and through such medium as it may be deemed necessary by the lender/RBI, including publishing the name as part of wilful defaulter’s list from time to time, as also use for KYC information verification, credit risk analysis or for any other purposes as the lender deemed necessary.`,
    `I/We declare that all the particulars and information and documents provided with this form are genuine, true, correct, complete, and up to date in all respects and that I/We have not withheld/suppressed any information/document whatsoever. I/We also authorized Genesis Securities Pvt Ltd to use the documents, download records from CKYCR using the KYC identifier submitted, video record the KYC document, personal discussion, and any other information provided herewith to extract additional information from the various public domains, including but not limited to CIBIL/Bureau report, Perfios report, etc. or for any other regulatory & compliance-related matters, prior to sanction/post sanction.`,
    `I/We have been informed of the documents to be submitted with the loan application form and have submitted the same. I/ We shall furnish any additional documents as and when required by the lender.`,
    `The executive collection of the application/documents has informed me/us of the rate of interest and approach for gradation of risk and rational of charging different rates of interest to different categories of borrowers, the particulars whereof have specified in the Loan Application form.`,
    `The rate of interest is arrived at based on various factors such as cost of funds, administrative cost, risk premium, margin, etc. The decision to give a loan and the interest rate applicable to each loan account are assessed on a case-to-case basis, based on multiple parameters such as borrower proile, repayment capacity, the asset being inanced, borrower’s other inancial commitments, past repayment track record, if any,security, tenure, etc. The rate of interest is subject to change as the situation warrants and is subject to the discretion of the company.`,
    `The credit decision is based on the credit model which includes factors like credit history, repayment track record, banking habit, business stability & cash flow analysis which is assessed through a combination of personal discussion and documentation.`,
  ];

  // Loop to display declarations with numbering
  declarations.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  });
  addFooter(doc);

  // add the new page for section 7
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  const DeclarationDetails = [
    `Incomplete/defective application will not be processed and the lender shall not be responsible in any manner for the resulting delay or otherwis.`,
    ` Loan foreclose charges should be as per sanction terms.`,
    `The loan term as sanctioned are applicable for the specified product as indicated in the loan application and are valid for the period of 60 days only. Where for some reason, there is a delay in concluding the loan, the lender reserves the right to revise the loan term as may be applicable at the\ntime of actual loan availment upon providing a copy of revisions to me/us.`,
    `All the particulars and the information and details are given/illed in this application form are true, correct, complete, and up to date in all respects, and I/We have not withheld any information whatsoever.`,
    `Any fault or misrepresentation in the documents will be my/our sole responsibility and Fin Coopers Capital Pvt Ltd has the authority to take rightful action against any such fault/misrepresentation.`,
    ` I/we shall inform the lender regarding any changes in my/our address(s) or my employment or profession, or any material deviation from the information provided in the loan application form.`,
    ` I/We hereby confirm that I/we am/are competent and fully authorized to give declarations, undertaking, etc., and to execute and submit this application form and all other documents for the purpose of availing the loan, creation of security, and representing generally for all the purposes.`,
    `I/We acknowledge and understand that the application/processing fees collected from me/us by Fin Coopers Capital Pvt Ltd, is for reviewing the loan application as per its own parameters and its not refundable to me/us under any circumstances whatsoever, irrespective of whether FinCoopers Capital Pvt Ltd sanction this loan application of mine or not. No cash has been given by me/us to any person for whatsoever reason related to the loan application.`,
    ` The lender has the right to retain the documents along with the photographs submitted with the loan application, and the same will not be returned to the applicant.`,
    `I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other social media applications.`,
    ` Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).`,
    `I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our vernacular language(s), & we have understood the same.`,

  ]

  // Loop to display declarations with numbering
  DeclarationDetails.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 10}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // const DeclarationDetails1 = [
  //   "I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other\nsocial media applications.",
  //   " Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).",
  //   "I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our\nvernacular language(s), & we have understood the same"
  // ]

  // Loop to display declarations with numbering
  // DeclarationDetails1.forEach((text, index) => {
  //   // Numbered list item
  //   doc.font('Helvetica')
  //     .fontSize(contentFontSize)
  //     .text(`${index + 7}. ${text}`, leftMargin, doc.y, {
  //       width: textWidth,
  //       lineGap: lineSpacing,
  //       align: 'justify',
  //     });
  //   // Add spacing between items if needed
  //   doc.moveDown(0.5);
  // }
  // );

  doc.moveDown(1)

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("OTHER TERMS & CONDITIONS:", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });
 
  doc.moveDown(1)

  const DeclarationDetails2 = [
    "Payment: No cash/bearer cheque has been collected from me up-front towards processing the loan application.",
    "Details with respect to the EMI presentation dates, number of EMIs, amount, and other terms & conditions of the loan will be communicated separately along with the welcome letter.",
    "No discount/fees gifts or any other commitment is given whatsoever which is not documented in the loan agreement by the lender or any of its authorized representative(s).",
    "The lender shall make all attempts to process the application and disburse the loan within 30 (thirty) working days from the date of the completion and submission of all relevant loan documents as specified therein.",
    "Other charges: Loan processing fees would be up to 4% of the loan amount.",
    "Charges which are in nature of fees are exclusive of good and service tax. Goods and services tax and other government levies, as applicable, would be charged additionally.",
    "Fin Coopers shall have a right to either process and disburse the entire loan amount singly or jointly together with such other co-lending partners i.e. bank/NBFCs as it may be deemed fit."
  ]

    // Sample data
const signatureData = [
  'Signature Applicant (Authorised   Signatory)                ',
  'Signature Co-Applicant-1/Guarantor-1 (Authorised Signatory)',
  'Signature Co-Applicant-2/Guarantor-2 (Authorised Signatory)',
  '  Signature      Guarantor              (Authorised Signatory)',
];

  // Loop to display declarations with numbering
  DeclarationDetails2.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  doc.moveDown(4)

  doc.font('Helvetica')
    .fontSize(headingFontsize)
    .text("If applicant / borrower require any clariication regarding their application / loan, they may write into :", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });

  doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("Fin Coopers Capital Pvt Ltd, 401,174/3,Nehru Nagar,Indore-452011 (M.P.), or email us at: Info@incoopers.com", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.moveDown(1)

    doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.font('Helvetica')
     .fontSize(headingFontsize)
      .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
       width: textWidth,
       lineGap: lineSpacing,
       align: 'justify',
      })

     doc.moveDown(1)

    createSignatureTablePDF(signatureData, 38, 120); // Adjusts left margin to 50 and top margin to 120




  // .fontSize(contentFontSize)
  // .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.")
  // .fontSize(headingFontsize)
  // .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.")

  addFooter(doc);


  
  // Make  a new page for the section 8 //
  doc.addPage();
  drawBorder();
  addLogo(doc);
  doc.moveDown(1)

  // const sectionTitle = "A. Loan Details";
  // const headers = ["", "UNSECURED", "SECURED", "P&M"];
  // const data = [
  //   ["Min Loan Amount", "1", "2", "3"],
  //   ["Max Loan Amount", "10", "15", "20"],
  //   ["Tenure", "5", "10", "7"],
  //   ["ROI (%)", "8%", "10%", "9%"],
  //   ["Pre-EMI (Rs.)", "(Pre-EMI interest details)", "5000", "4500"],
  //   ["EMI (Rs.)", "3000", "3500", "3200"],
  //   ["Rate Type", "Floating", "Fixed", "Floating"],
  //   ["Type of Transaction", "Loan", "Loan", "Loan"],
  // ];

 // Example Data
const headers = ["", "UNSECURED", "SECURED", "P&M"];
const data = [
  ["Min Loan Amount Possible", "1", "1", "1"],
  ["Max Loan Amount Possible", "10", "10", "10"],
  ["Tenure (Yrs)", "3-6 yrs", "3-6 yrs", "3-6 yrs"],
  ["ROI (%)", "20% - 26%", "20% - 26%", "11% - 17%"],
  ["Pre-EMI (Rs.)", "(Pre-EMI interest is to be paid from the day of the disbursement (fully & partially) till the date of commencement of EMI. ROI will be same as that for EMI)"], 
  ["EMI (Rs.)", "EMI will be based on inal loan amount, rate of interest and tenor approved."],
  ["Rate Type", "Floating", "Floating", "Floating"],
  ["Type of transaction" , "Charges"]
];

const sectionA = [
  ["Loan Applied - First or Incremental", "Upto 4%", "Upto 4%", "Upto 4%"],
  ["File Charges", "NA", "Rs 5900/-", "Rs 2500/-"],
  ["Legal Verification Charges", "NA", "At actuals", "Rs 2500/-"],
  ["Technical Verification / Valuation", "NA", "At actuals", "Rs 6500/-"],
];

const sectionB = [
  [`Early Payments within 12 months of
    loan sanction`, "NA", `6% of Principal outstanding for loan foreclosed within 12 monthsof loan
    sanction`, "NA"],

  [`Early payment after 12 months of loan sanction above 25% of principal outstanding at the beginning of financial year`, "NA", "4%", "6%"],
  ["Foreclosure Charges (Within 12 Months)", "NA", "6%", "6%"],
  ["Foreclosure Charges (After 12 Months)", "NA", "5%", "4%"],
];

const footerNote = "There are no charges on foreclosure or pre-payment on floating rate term loans sanctioned to individual borrowers. The above partprepayment and foreclosure charges are subject to the regulatory requirements and directions prescribed by Reserve Bank of India from Time to time";



// Generate the PDF
// Calling the function with custom font size and border width:
drawComplexTable(headers, data, sectionA, sectionB, footerNote, 8, 0.5);
doc.moveDown(1);
addFooter(doc);



//ankit //
doc.addPage();
drawBorder();
addLogo(doc);

doc.moveDown(10);
doc
.fillColor("black")
.font('Helvetica-Bold')
.text(`C. Other Charges  :-   `,{align:'center'});
doc.moveDown()

// Layout configuration
const startX = 48;
let startY = doc.y;
const tableWidth = 500;
const cellHeight = 20;
const cellWidth = 500; // Total width of the cell
const borderThickness = 0.5;
const customHeight = 40; // Custom height for the cell


function createTwoColumnCellFirst(doc, data, startX, startY, cellWidth, cellHeight, borderThickness) {
      const column1Width = cellWidth * 0.4; // 40% of the total width
      const column2Width = cellWidth * 0.6; // 60% of the total width
  
      // Set border properties
      doc.strokeColor('black').lineWidth(borderThickness);
  
      // Draw outer border for the cell
      doc.rect(startX, startY, cellWidth, cellHeight).stroke();
  
      // Draw divider for the two columns
      doc.moveTo(startX + column1Width, startY)
          .lineTo(startX + column1Width, startY + cellHeight)
          .stroke();
  
      // Add text to the first column
      doc.text(data[0], startX + 5, startY + 5, {
          width: column1Width - 10, // Padding of 5 on each side
          align: 'left',
      });
  
      // Add text to the second column
      doc.text(data[1], startX + column1Width + 5, startY + 5, {
          width: column2Width - 10, // Padding of 5 on each side
          align: 'center',
      });
  
      return startY + cellHeight; // Return updated Y position after the cell
  }
  

  const DateOfTransfers = ['PDC/ ECS/ NACH Bounce Charges / per tr', 'Rs 750/'];

  startY = createTwoColumnCellFirst(doc, DateOfTransfers, startX, startY, cellWidth, cellHeight, borderThickness);
  
doc.moveDown(2)

// Function to render a five-column row
function renderFiveColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in each column
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw vertical dividers for each column
  let x = startX;
  for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      doc.moveTo(x, startY)
          .lineTo(x, startY + maxHeight)
          .stroke();
  }

  // Add text to each column
  x = startX;
  for (let i = 0; i < data.length; i++) {
      doc.text(data[i], x + 5, startY + 5, {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      x += columnWidths[i];
  }

  return startY + maxHeight; // Return updated Y position
}


// Function to render a two-column row
function renderTwoColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in both columns
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'center',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw the divider for the columns
  doc.moveTo(startX + columnWidths[0], startY)
      .lineTo(startX + columnWidths[0], startY + maxHeight)
      .stroke();

  // Add text to each column
  doc.text(data[0], startX + 5, startY + 5, {
      width: columnWidths[0] - padding,
      align: 'left',
  });
  doc.text(data[1], startX + columnWidths[0] + 5, startY + 5, {
      width: columnWidths[1] - padding,
      align: 'center',
  });

  return startY + maxHeight; // Return updated Y position
}


// Refactored createFiveColumnCell function
function createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness) {
  // Define column widths
  const fiveColumnWidths = [
      tableWidth * 0.3, // Column 1: 30%
      tableWidth * 0.1, // Column 2: 10%
      tableWidth * 0.2, // Column 3: 20%
      tableWidth * 0.2, // Column 4: 20%
      tableWidth * 0.2, // Column 5: 20%
  ];
  const twoColumnWidths = [
      tableWidth * 0.4, // Column 1: 40%
      tableWidth * 0.6, // Column 2: 60%
  ];

  
  // Render the five-column row
  startY = renderFiveColumnRow(doc, fiveColumnData, startX, startY, fiveColumnWidths, cellHeight, borderThickness);


  // Render the first two-column row
  startY = renderTwoColumnRow(doc, twoColumnData, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  // Render the second two-column row
  startY = renderTwoColumnRow(doc, twoColumnData1, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData1, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY= renderTwoColumnRow(doc, twoColumnData2, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData3, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData4, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData5, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData6, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY = renderFiveColumnRow(doc, fiveColumnData2, startX, startY, fiveColumnWidths, cellHeight, borderThickness);
  
  startY = renderTwoColumnRow(doc, twoColumnData7, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc, twoColumnData8, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData3, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData4, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData5, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData6, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData7, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc , twoColumnData9 , startX , startY , twoColumnWidths , cellHeight , borderThickness)
  return startY; // Return the final updated Y position

}

function renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness) {
  const padding = 10; // Padding for text within the cell
  
  // Set bold text style
  doc.font('Helvetica-Bold');

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startX, startY, tableWidth, customHeight).stroke();

  // Add the bold text in the cell
  doc.text(text, startX + padding, startY + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: 'left',
      continued: false
  });

  // Return the updated Y position after the cell
  return startY + customHeight;
}


// Data for the table
const fiveColumnData = ['Field collection charges per E' ,'NA',  'NA' ,'' , 'NA'];
const fiveColumnData1=[`Modiication of loan terms
after irst disbursement
including but not limited
to re - scheduling of loan
repayment term, addition/
deletion of coborrowers etc`
 ,`Upto 2% of
outstanding
principal
amount (As
on the date
of
transaction)`,

`Upto 2% of outstanding
principal amount
` ,'' , `Upto 2% of outstanding principal
amount
`]
const fiveColumnData2=[`Cersai Charges` , `NA ` ,  `Rs 500/- ` , `` ,`Rs 500/-`]
const fiveColumnData3=[`RTO transfer charges**` , `NA `, `NA`, ``, `Rs10000/-`]
const fiveColumnData4=[`Applicate RC issuance charges` , `NA` , `NA`, `` , `Rs10000/-`]
const fiveColumnData5=[`MOD Registration Expenses` , `NA` , `NA` ,`` , `NA`]
const fiveColumnData6=[`Stamp Duty and`, `NA`, `NA` , ``, `NA`]
const fiveColumnData7=[`EC` , `NA`, `NA` , ``, `NA`]






const twoColumnData = [`Repayment instrument
change/ swap charges`, `Rs 1000/-`];
const twoColumnData1 = [`EMI repayment cycle date`,  `Rs 1000/-`];
const twoColumnData2=[`Issuance of duplicate 
  income tax certiicate` ,
  `Rs 500 /-`
]
const twoColumnData3=[`Issuance of Duplicate No
objection certiicate (NOC)
` , `Rs 500 /-`]

const twoColumnData4=[`Acticate Statement of Accounts`, `Rs 500 /-`]
const twoColumnData5=[`Document retrieval` , `Rs 1000/- `]
const twoColumnData6=[`Loan Cancellation Charges` , `Rs 20000 + rate of interest from the date of disbursement till date of request of cancellation`]
const twoColumnData7=[`Renewal Charges ` , `NA`]
const twoColumnData8=[`Tranche release charges` , `NA`]
const twoColumnData9=[`Penal Charges` , `3% pm on Instalment overdue`]



// Text to display in the cell
const text = `* Please note that above fee and charges are exclusive of GST, education cess and other government taxes, levies etc. The above schedule of
charges is subject to change and will be at the sole discretion of Fin Coopers Capital Pvt Ltd, The Changes will be available on Fin Coopers`;




// Call the function
startY = createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness);

// Create the full-width bold cell
startY = renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness);

addFooter(doc);

// Add a new Page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);  // Add some space after the logo

let startx = 48;
let starty = doc.y;  // Get the current Y position to start the first table
const Height=20

const fiveColumnWidths = [
  tableWidth * 0.3, // Column 1: 30%
  tableWidth * 0.1, // Column 2: 10%
  tableWidth * 0.2, // Column 3: 20%
  tableWidth * 0.2, // Column 4: 20%
  tableWidth * 0.2, // Column 5: 20%
];




// Function to render a full-width bold cell with custom font size and padding
function renderFullWidthBoldCell1(doc, text, startx, starty, tableWidth, customHeight, borderThickness, fontSize, padding, alignment) {
  // Set bold text style and custom font size
  doc.font('Helvetica-Bold').fontSize(fontSize);

  // Calculate the height of the text
  const textHeight = doc.heightOfString(text, {
      width: tableWidth - 2 * padding, // Width available for the text
  });

  // Adjust the cell height if the text height exceeds the current custom height
  customHeight = Math.max(customHeight, textHeight + 2 * padding);

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startx, starty, tableWidth, customHeight).stroke();

  // Add the bold text in the cell with custom padding
  doc.text(text, startx + padding, starty + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: alignment, // Text alignment
      continued: false,
  });

  // Return the updated Y position after the cell
  return starty + customHeight; // Return the new startY for the next content
}


// Text to display in the first cell
const text1 = `Revised MSME Classiication applicable w.e.f 1st July 2020`;

// Define custom font size and padding
const fontSize = 6;  // Customize the font size as needed
const padding = 6;    // Customize the padding as needed

// Render the first table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text1, startx, starty, tableWidth, Height, borderThickness, fontSize, padding , allignment="center");

// Text to display in the second cell
const text2 = "Composite Criteria#: Investment in Plant & Machinery/equipment and Annual Turnover";
const text3=`# Meaning of Composite Criteria - If an enterprise crosses the ceiling limits specified for its present category in either of the two criteria of
investment or turnover, it will cease to exist in that category and be placed in the next higher category but no enterprise shall be placed in the
lower category unless it goes below the ceiling limits specified for its present category in both the criteria of investment as well as turnover
`

const text4=`*All units with Goods and Services Tax Identiication Number (GSTIN) listed against the same Permanent Account Number (PAN) shall be
collectively treated as one enterprise and the turnover and investment igures for all of such entities shall be seen together and only the aggregate
values will be considered for deciding the category as micro, small or medium enterprise.
`
// Render the second table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text2, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");

// Add more content or tables as needed

const fiveColumnData10=[`Enterprise Classiication` , `Micro `, `Small ` , ``, `Medium`]

const fiveColumnData11 = [`Investment in Plant and
Machinery or Equipment,not exceeding,` , `₹ 1 Crore` , `₹ 10 Crore ` ,  ` `, `₹ 50 Crore` ]

const fiveColumnData12 = [`Annual Turnover, not exceeding` , `₹ 5 Crore` , `₹ 50 Crore `  , ` ` , `₹ 250 Crore`]

starty = renderFiveColumnRow(doc, fiveColumnData10, startx, starty, fiveColumnWidths, cellHeight, borderThickness);
starty=  renderFiveColumnRow(doc , fiveColumnData11 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFiveColumnRow(doc , fiveColumnData12 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFullWidthBoldCell1(doc, text3, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
starty = renderFullWidthBoldCell1(doc, text4, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
// Add footer to the document
addFooter(doc);



doc.addPage();
  drawBorder();
  addLogo(doc);
doc.moveDown(8)

const datatable = [
  { documentName: 'Application Form:',
   documentDetails: `Completed application form duly signed by all applicants, guarantors, and co-applicants (if any)` },
  {
    documentName:'Photograph',
    documentDetails:  `Signed coloured photograph of each applicant(except non-individuals) graph of each applicant (except non-individuals),individual guarantors and co-applicants (if any)`
  },{
    documentName:`Age Proof (For individuals):[Copy of any one of the following]
`,
  documentDetails:`Passport (Not Expired), Pan Card OR Form 60, Voters ID card with complete date of Birth, Driving
License (Not Expired), High School Mark sheet/ Certiicate, LIC policy bond with latest premium paid
receipt (Minimum 12 months in force),
Sr Citizen ID card issued by Govt Body, Birth Certiicate/ Corporation Certiicate (Should have name mentioned on it).
`
  },{
    documentName:`Signature Veriication [Copy of any one of the following](wherever applicable):`,

  documentDetails:` Passport (Not Expired), Pan Card OR Form 60, Driving License (Not Expired), Copy of any cheque
issued in favor of Genesis Securities Pvt Ltd. (Subject to cheque must be cleared), Identity card with
applicants photograph & sign issued by Central/State Government Departments, Original Bankers
Veriication (not older than 30 days)
`
    
  },{

    documentName:`Income Proof*`,
    documentDetails:`  Latest ITR, Latest Form 16, Latest Salary Slip/Certificate, Latest Audited Financials, Bank details with
last 3 months salary
credited, Add- Business Proof-Qualification Certificate/Certificate of Practice (COP), Shop Act
License/MOA & AOA/Sales TaxNat registration/Partnership Deed.`
  },
  {documentName:`Property Document*`,
  documentDetails:`Copy of original sales deed, Allotment possession letter, NOC from society and other documents as per
legal report. The application will be assessed quickly after receiving the required documents.`
  },{
    documentName:`Proof of Identity & Address: (For Individual /Authorized Person)`,
    documentDetails:`Passport (not expired), PAN Card, Voter’s Identity Card issue by Election Commission of India, Driving
License, Proof of Possession of Aadhar (Voluntary), Job Card Issued by NREGA duly signed by office of
State Govt and Letter issued by the
National Population Register containing details of name and address, Ration Card, Bank Statement,
Electricity/Telephone Bill, Sale deed/property purchase agreement (for owned properties)`
  },{
    documentName:`For Trust:
   [Certified copies of each of the following
   documents]`,

    documentDetails:`Registration Certificate, Trust Deed, PAN No. or Form 60 of Trust, * Documents relating to beneficial owner, trustees’ managers, officers or employees as the case may be, holding an attorney to transact on its behalf.
`,
  }
];

createDocumentsRequiredTable(datatable)
addFooter(doc);


// // Add the new page for section 8//

doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8)

const datatables =[
  {
documentName:`For Sole Proprietorship: [Certified copy
of any two* of the following documents
in the name of the proprietary concern]`,
documentDetails:`* Proof of Identity/Address of Individual, Registration Certiicate, Certiicate/licence issued by the municipal authorities under Shop and Establishment Act., Sales and income tax returns, CST/VAT/ GST certiicate (provisional/inal), Certiicate/registration document issued by Sales Tax/Service Tax/Professional Tax authorities, Importer Exporter Code issued by the ofice of DGFT or License/ Certiicate of practice issued in name of the Proprietary concern by professional body incorporated under statute, The complete Income Tax Return in the name of the sole proprietor where the irm’s name and income is relected duly authenticated/acknowledged by the Income Tax Authorities, Utility bills such as electricity, water, and landline telephone bills in the name of the proprietary concern.`

  },
  {
documentName:`For Society Unregistered Partnership Firm:[Certified copy of any two* of the following documents in the name of the proprietary concern]`,
documentDetails:`Board Resolution of the Society/ Firm, PAN or Form 60 of the Society/ Firm, PAN or Form 60 of the
Society/ Firm,
*Documents relating to beneicial owner, ofice bearers, authorised signatories, managers, oficers or
employees, as the case may be, holding an attorney to transact on its behalf, such information as may
be required by the company to collectively establish the legal existence of such an association or body
of individuals.`},{

  documentName:`Note`,
  documentDetails:`1) * Documents relating to beneficial owner, managers, partners, trustees, officers or employees,
authorised signatories, as the case may be, holding an attorney to transact on its behalf: Same list of
documents as for the Individual/ Authorised Person as mentioned above.
2) All the customer documentation to be self-attested. In case of bank statement and inancials irst and
last page needs to be self-attested.
3) The Partnership Deed and the MOA & AOA should be attested stating ‘Certiied that this is duly
Amended & Latest True copy’.
4) All documents to be signed by the customer and OS done by our FTE/Contractual employee/
Genesis Authorized Representative.
5) Driving License - Booklet form is not accepted as KYC document.`
}
]

createDocumentsRequiredTable(datatables)
addFooter(doc);





// Add a new page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);


  function createAadhaarConsentPDF(executants) {
    // Title
    doc.fontSize(10).font('Helvetica-Bold').text('2. MOST IMPORTANT INFORMATION (Aadhaar Consent)', {
      align: 'center'
    });
  
    doc.moveDown(3.5);
  
    // Add the main content
    doc.fontSize(8).font('Helvetica').text(
      `I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company herewith shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in accordance with the applicable law.\n\n` +
        `I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained in vernacular (the language known to me):`,
      { align: 'justify' }
    );
  
    // Add numbered list
    doc.moveDown(1);
    doc.text(`i) the purpose and the uses of collecting Aadhaar;`);
    doc.moveDown(1);
    doc.text(`ii) the nature of information that may be shared upon offline verification;`);
    doc.moveDown(1);
    doc.text(`iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter's ID, driving license, etc.).`);
  
    doc.moveDown(1);
    doc.text(
      `I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of its officials responsible in case of any incorrect / false information or forged document provided by me.\n\n\n\n` +
        `This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in respect of the submission of his/her Aadhaar.`
    );
  
    // Add the footer information
    doc.moveDown(1);
    const date =`${allPerameters.appdate}`;
    const place = `${allPerameters.branchcity}`;
  
    doc.text(`DATE: ${date}`, { align: 'left' });
    doc.text(`PLACE: ${place}`, { align: 'left' });
  
    doc.moveDown(2);
  
    // Add signature table dynamically based on the passed array
    // executants.forEach((executant, index) => {
    //   doc.text(`Name of the Executant(s): ${executant.name}`, { align: 'left' });
    //   doc.text(`Signature: ________________________________`, { align: 'right' });
    //   if (index < executants.length - 1) doc.moveDown(1);
    // });

const docWidth = doc.page.width; // Get the page width
const marginRight = 50; // Set a custom right margin
const textIndent = 10; // Custom right alignment indent





    // Add the signature table
    doc.text(`Name of the Executant(s):`, { align: 'left' });
    doc.text(`Signature:`, { align: 'right' , indent: textIndent});
    doc.moveDown(1.5)
    doc.text(`${allPerameters.borrowerName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.coAppName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.guaName}`)
   
  
  }


// Example Usage
const executantsArray = [
  { name: `${allPerameters.borrowerName}` },
  { name: `${allPerameters.coAppName}` },
  { name: `${allPerameters.guaName}` },
];

createAadhaarConsentPDF(executantsArray);

  addFooter(doc);
  doc.end();





  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;


  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => resolve(pdfFileUrl));
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

async function growpdf2(allPerameters,logo,partnerName) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }
const FinpdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);
console.log(FinpdfLogo,"FinpdfLogo")

  function addLogo(doc) {
    if (fs.existsSync(FinpdfLogo)) {
      doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
    } else {
      console.error(`Logo file not found at: ${FinpdfLogo}`);
    }

    if (fs.existsSync(logo)) {
            doc.image(logo, 40, 50, {
              fit: [150, 50],
              align: "right",
              valign: "bottom",
            });
          } else {
            console.error(`Left logo file not found at: ${logo}`);
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

  function addFooter() {
    if( partnerName == "GROW MONEY CAPITAL PVT LTD") {
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.com", {
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

  // const pdfFilename = `applicantion.pdf`;
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

  doc.moveDown(4);
  doc.fontSize(8).font(fontBold).text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All ields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                    ${allPerameters.date}`, { align: "left" });
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "left" });
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
    const columnWidths = [200, 300, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#1E90FF"; // Light blue background color
  
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
    console.log(dataLength);
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
    const noteHeight = doc.heightOfString(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`) + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`, startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {//imagelogo
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
  const specialRowColor = "#1E90FF"; // Light blue background color

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
    //   .fill("#1E90FF")  // Color for the section title (same as before)
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
  addLogo(doc);
  addWatermark(doc);
  drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value: allPerameters.loanAmount || `${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: allPerameters.loanTenure || `${allPerameters.tenure}` },
    { key: "Loan Purpose", value: allPerameters.loanPurpose || "BUSINESS EXPANSION" },
    { key: "Loan Type", value: allPerameters.loanType || "SECURED" },
  ];
  drawTable("Loan Details", loanDetails);

  // Sourcing Details Section

  const sourcingDetails = [{
    key:`Sourcing Type`,
    value: `${allPerameters.sourceType}` || "NA",

  }, {
    key: "Gen Partner Name",
    value: allPerameters.genPartnerName || "NA",
  }, {
    key: "Sourcing Agent Name : ",
    value: allPerameters.sourcingAgentName || "NA",
  }, {
    key: "Sourcing Agent Code : ",
    value: allPerameters.sourcingAgentCode || "NA",
  }, {
    key: "Sourcing Agent Location : ",
    value: allPerameters.sourcingAgentLocation || "NA",
  }, {
    key: "Sourcing RM Name : ",
    value: allPerameters.sourcingRMName || "NA",
  }, {
    key: "Sourcing RM Code : ",
    value: allPerameters.sourcingRMCode || "NA",
  }]

  drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
  const productProgramDetails = [
    { key: "Industry Type", value: "FIN COOPERS" },
    { key: "Sub Industry Type", value: "FIN COOPERS" },
    { key: "Product Type", value: "SECURED" },
    { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
    { key: "Secured/Un-Secured", value: "SECURED" },
    { key: "Property Value", value: "Rs. 500000" },
    { key: "BT EMI Value", value: "NA" },
  ];
  drawTable("Product Program Details", productProgramDetails);
  addFooter(doc);
  addLogo(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });


  const applicantDetails = [

    {
      key: "Application Type", value: `${allPerameters.appType}`
    }, {
      key: "Business Type", value: `${allPerameters.buisnessType}`
    }, {
      key: "Applicant Name", value: `${allPerameters.borrowerName}`
    }, {
      key: "Applicant Father/Spouse Name", value: `${allPerameters.appFather}`
    }, {
      key: "Applicant Mother Name", value: `${allPerameters.appMother}`
    }, {
      key: "Mobile No.1", value: `${allPerameters.appMob1}`
    }, {
      key: "Mobile No.2", value: `${allPerameters.appMob2}`
    }, {
      key: "Email ID", value: `${allPerameters.appEmail}`
    }, {
      key: "Education Qualification", value: `${allPerameters.appEdu}`
    }, {
      key: "Applicant DOB", value: `${allPerameters.appDOB}`
    }, {
      key: "Gender", value: `${allPerameters.appGender}`
    }, {
      key: "Marital Status", value: `${allPerameters.appMaritalStatus}`
    }, {
      key: "Pan Number", value: `${allPerameters.appPan}`
    }, {
      key: "Aadhar Number", value: `${allPerameters.appAdhar}`
    }, {
      key: "Voter Id Number", value: `${allPerameters.AppVoterId}`
    }
  ];




  const communicationAddress = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.appadharadress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.appCityName}`,
    }, {
      key: "District Name", value: `${allPerameters.appdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`
    }, {
      key: "State", value: `${allPerameters.AppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`
    }
  ]


  // const PermanentAddress = [
  //   {
  //     key: "Same as Communication address", value: "YES",
  //   }, {
  //     key: "Address", value: `${allPerameters.appadharadress}`,
  //   }, {
  //     key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
  //   }
  // ]


  // Application details -2  ---- Parent address --- last 4 data //

  // Add the new page 

  const PermanentAddress = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.appadharadress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
    },
    {
      key: "District Name", value: `${allPerameters.appdistrict}`,
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`,
    }, {
      key: "State", value: `${allPerameters.AppState}`,
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
    }
  ]
  // const ParmentAddress2 = [
  //   , {
  //     key: "District Name", value: `${allPerameters.appdistrict}`,
  //   }, {
  //     key: "Pin Code", value: `${allPerameters.AppPin}`,
  //   }, {
  //     key: "State", value: `${allPerameters.AppState}`,
  //   }, {
  //     key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
  //   }
  // ]










// const imagelogo =path.join(__dirname, `../../../../..${allPerameters.appImage}`);

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
  console.log(imagePath, "imagePathimagePath");

  // Call the function in the PDF generation pipeline
  drawTable3("Applicant Details", applicantDetails, imagePath);
  doc.moveDown(1);
  drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // drawNewPage(ParmentAddress2);
  drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3: Co-applicant/Guarantor Details", { underline: true });

  const coApplicantDetails = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.coRelWithApp}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob1}`,
    },{
      key: "Mobile No.2", value: `${allPerameters.coappMob2}`
    },
     {
      key: "Email ID", value: `${allPerameters.coAppEmail}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId}`,
    }
  ]

  const communicationAddressco = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    }, {
      key: "State", value: `${allPerameters.coAppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppcurentAdress}`
    }
  ]

  const ParentAddressco = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    },
    { key: "State", value: `${allPerameters.coAppState}` },
    { key: "Years at Permanent addres", value: `${allPerameters.coAppcurentAdress}` }
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]


  
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
  const imagelogo1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  // const imagelogo1 =path.join(__dirname, `../../../../..${allPerameters.co1Image}`);


  drawTable3("Co-Applicant Details-1", coApplicantDetails, imagelogo1);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco);
  addFooter(doc);

  //coApplicant 2
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3:  Additional Co-Applicant Details", { underline: true });

  const coApplicantDetails1 = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType2}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName2}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.corelwithApp2}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather2}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother2}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob12}`,
    }
    , 
    {
      key: "Mobile No.2", value: `${allPerameters.coappMob22}`
    },{
      key: "Email ID", value: `${allPerameters.coAppEmail2}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu2}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob2}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender2}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus2}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan2}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar2}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId2}`,
    }
  ]

  const communicationAddressco1 = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress2}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity2}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict2}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN2}`
    }, {
      key: "State", value: `${allPerameters.coAppState2}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppNoOfYearsATCurrentAddress2}`
    }
  ]

  const ParentAddressco1 = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress2}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity2}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict2}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN2}`
    },
    { key: "State", value: `${allPerameters.coAppState2}` },
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]



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
const imagelogo2 = await saveImageLocally2(`${allPerameters.co2Image}`);
  // const imagelogo2 =path.join(__dirname, `../../../../..${allPerameters.co2Image}`);


  drawTable3("Co-Applicant Details-2", coApplicantDetails1, imagelogo2);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco1);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco1);
  addFooter(doc);


  // add a new page for section 4



  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  const CollateralsDetails = [
    { key: "Type", value: "RESIDENTIAL" },
    { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  ]

  const BankDetails = [
    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  drawTable("Collaterals Details", CollateralsDetails);
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

  const ReferanceDetails = [
    { 
      key: "Reference 1 - Name", value: `${allPerameters.ref1name}` ,
    },{ 
      key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    },{ 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
     {
       key: "Reference 2 - Name", value: `${allPerameters.ref2name}`

    },{ key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

     },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTable("Referance Detail", ReferanceDetails)




  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // Define styles
  const titleFontSize = 11;
  const contentFontSize = 9;
  const headingFontsize = 8
  const leftMargin = 50;
  const textWidth = doc.page.width - 2 * leftMargin;
  const lineSpacing = 1.5;

  // Section title: COMMON DECLARATIONS

  doc.moveDown(2);
  doc.fontSize(headingFontsize)
    .text("We acknowledge the receipt of your application for availment of Loan & the same will be processed within a period of 15 days from today.", leftMargin, doc.y);

  doc.moveDown(2);

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("COMMON DECLARATIONS");
  doc.moveDown(0.5)

  doc.fontSize(contentFontSize)
    .text("I/We hereby acknowledge and confirm that:", {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    })
  // Array of declarations text
  const declarations = [

    `I hereby declare that I am not involved in any type of production or trading activity that comes under International Finance Corporation exclusion list.*Production or trade in any product or activity deemed illegal, pharmaceuticals, pesticides/herbicides, ozone-depleting substances, PCB's, wildlife, weapons, munitions, alcoholic beverages (excluding beer and wine), tobacco, gambling, casinos, radioactive materials, unbonded asbestos fibers, drift net fishing in the marine environment.`,
    `The executive of Fin Coopers Capital Pvt Ltd (Lender), collecting the application/documents has informed me/us of the applicable schedule of charges, fees, commissions, and key facts, as more particularly mentioned in the “Schedule of charges” on the website of the company.`,
    `Submission of loan application to the lender does not imply automatic approval by the lender and the lender will decide the quantum of the loan at its sole & absolute discretion. The lender in its sole and absolute discretion may either approve or reject the application for granting the loan. In case of rejection, the lender shall not be required to give any reason.`,
    `I/We authorized and give consent to Fin Coopers Capital Pvt Ltd to disclose, without noticing me/us, the information furnished by me/us in the application form(s)/ related documents executed/to be executed in the relation to the facilities to be availed by me/us from Fin Coopers Capital Pvt Ltd, to other branches/Subsidiaries/affiliates/credit Bureaus/CIBIL/Rating Agencies/service providers, Banks/financial institutes, governmental/regulatory authorities or third parties who may need, process & publish the information in such manner and through such medium as it may be deemed necessary by the lender/RBI, including publishing the name as part of wilful defaulter’s list from time to time, as also use for KYC information verification, credit risk analysis or for any other purposes as the lender deemed necessary.`,
    `I/We declare that all the particulars and information and documents provided with this form are genuine, true, correct, complete, and up to date in all respects and that I/We have not withheld/suppressed any information/document whatsoever. I/We also authorized Genesis Securities Pvt Ltd to use the documents, download records from CKYCR using the KYC identifier submitted, video record the KYC document, personal discussion, and any other information provided herewith to extract additional information from the various public domains, including but not limited to CIBIL/Bureau report, Perfios report, etc. or for any other regulatory & compliance-related matters, prior to sanction/post sanction.`,
    `I/We have been informed of the documents to be submitted with the loan application form and have submitted the same. I/ We shall furnish any additional documents as and when required by the lender.`,
    `The executive collection of the application/documents has informed me/us of the rate of interest and approach for gradation of risk and rational of charging different rates of interest to different categories of borrowers, the particulars whereof have specified in the Loan Application form.`,
    `The rate of interest is arrived at based on various factors such as cost of funds, administrative cost, risk premium, margin, etc. The decision to give a loan and the interest rate applicable to each loan account are assessed on a case-to-case basis, based on multiple parameters such as borrower proile, repayment capacity, the asset being inanced, borrower’s other inancial commitments, past repayment track record, if any,security, tenure, etc. The rate of interest is subject to change as the situation warrants and is subject to the discretion of the company.`,
    `The credit decision is based on the credit model which includes factors like credit history, repayment track record, banking habit, business stability & cash flow analysis which is assessed through a combination of personal discussion and documentation.`,
  ];

  // Loop to display declarations with numbering
  declarations.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  });
  addFooter(doc);

  // add the new page for section 7
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  const DeclarationDetails = [
    `Incomplete/defective application will not be processed and the lender shall not be responsible in any manner for the resulting delay or otherwis.`,
    ` Loan foreclose charges should be as per sanction terms.`,
    `The loan term as sanctioned are applicable for the specified product as indicated in the loan application and are valid for the period of 60 days only. Where for some reason, there is a delay in concluding the loan, the lender reserves the right to revise the loan term as may be applicable at the\ntime of actual loan availment upon providing a copy of revisions to me/us.`,
    `All the particulars and the information and details are given/illed in this application form are true, correct, complete, and up to date in all respects, and I/We have not withheld any information whatsoever.`,
    `Any fault or misrepresentation in the documents will be my/our sole responsibility and Fin Coopers Capital Pvt Ltd has the authority to take rightful action against any such fault/misrepresentation.`,
    ` I/we shall inform the lender regarding any changes in my/our address(s) or my employment or profession, or any material deviation from the information provided in the loan application form.`,
    ` I/We hereby confirm that I/we am/are competent and fully authorized to give declarations, undertaking, etc., and to execute and submit this application form and all other documents for the purpose of availing the loan, creation of security, and representing generally for all the purposes.`,
    `I/We acknowledge and understand that the application/processing fees collected from me/us by Fin Coopers Capital Pvt Ltd, is for reviewing the loan application as per its own parameters and its not refundable to me/us under any circumstances whatsoever, irrespective of whether FinCoopers Capital Pvt Ltd sanction this loan application of mine or not. No cash has been given by me/us to any person for whatsoever reason related to the loan application.`,
    ` The lender has the right to retain the documents along with the photographs submitted with the loan application, and the same will not be returned to the applicant.`,
    `I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other social media applications.`,
    ` Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).`,
    `I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our vernacular language(s), & we have understood the same.`,

  ]

  // Loop to display declarations with numbering
  DeclarationDetails.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 10}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // const DeclarationDetails1 = [
  //   "I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other\nsocial media applications.",
  //   " Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).",
  //   "I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our\nvernacular language(s), & we have understood the same"
  // ]

  // Loop to display declarations with numbering
  // DeclarationDetails1.forEach((text, index) => {
  //   // Numbered list item
  //   doc.font('Helvetica')
  //     .fontSize(contentFontSize)
  //     .text(`${index + 7}. ${text}`, leftMargin, doc.y, {
  //       width: textWidth,
  //       lineGap: lineSpacing,
  //       align: 'justify',
  //     });
  //   // Add spacing between items if needed
  //   doc.moveDown(0.5);
  // }
  // );

  doc.moveDown(1)

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("OTHER TERMS & CONDITIONS:", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });
 
  doc.moveDown(1)

  const DeclarationDetails2 = [
    "Payment: No cash/bearer cheque has been collected from me up-front towards processing the loan application.",
    "Details with respect to the EMI presentation dates, number of EMIs, amount, and other terms & conditions of the loan will be communicated separately along with the welcome letter.",
    "No discount/fees gifts or any other commitment is given whatsoever which is not documented in the loan agreement by the lender or any of its authorized representative(s).",
    "The lender shall make all attempts to process the application and disburse the loan within 30 (thirty) working days from the date of the completion and submission of all relevant loan documents as specified therein.",
    "Other charges: Loan processing fees would be up to 4% of the loan amount.",
    "Charges which are in nature of fees are exclusive of good and service tax. Goods and services tax and other government levies, as applicable, would be charged additionally.",
    "Fin Coopers shall have a right to either process and disburse the entire loan amount singly or jointly together with such other co-lending partners i.e. bank/NBFCs as it may be deemed fit."
  ]

    // Sample data
const signatureData = [
  'Signature Applicant (Authorised   Signatory)                ',
  'Signature Co-Applicant-1/Guarantor-1 (Authorised Signatory)',
  'Signature Co-Applicant-2/Guarantor-2 (Authorised Signatory)',
  '  Signature      Guarantor              (Authorised Signatory)',
];

  // Loop to display declarations with numbering
  DeclarationDetails2.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  doc.moveDown(4)

  doc.font('Helvetica')
    .fontSize(headingFontsize)
    .text("If applicant / borrower require any clariication regarding their application / loan, they may write into :", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });

  doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("Fin Coopers Capital Pvt Ltd, 401,174/3,Nehru Nagar,Indore-452011 (M.P.), or email us at: Info@incoopers.com", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.moveDown(1)

    doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.font('Helvetica')
     .fontSize(headingFontsize)
      .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
       width: textWidth,
       lineGap: lineSpacing,
       align: 'justify',
      })

     doc.moveDown(1)

    createSignatureTablePDF(signatureData, 38, 120); // Adjusts left margin to 50 and top margin to 120




  // .fontSize(contentFontSize)
  // .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.")
  // .fontSize(headingFontsize)
  // .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.")

  addFooter(doc);


  
  // Make  a new page for the section 8 //
  doc.addPage();
  drawBorder();
  addLogo(doc);
  doc.moveDown(1)

  // const sectionTitle = "A. Loan Details";
  // const headers = ["", "UNSECURED", "SECURED", "P&M"];
  // const data = [
  //   ["Min Loan Amount", "1", "2", "3"],
  //   ["Max Loan Amount", "10", "15", "20"],
  //   ["Tenure", "5", "10", "7"],
  //   ["ROI (%)", "8%", "10%", "9%"],
  //   ["Pre-EMI (Rs.)", "(Pre-EMI interest details)", "5000", "4500"],
  //   ["EMI (Rs.)", "3000", "3500", "3200"],
  //   ["Rate Type", "Floating", "Fixed", "Floating"],
  //   ["Type of Transaction", "Loan", "Loan", "Loan"],
  // ];

 // Example Data
const headers = ["", "UNSECURED", "SECURED", "P&M"];
const data = [
  ["Min Loan Amount Possible", "1", "1", "1"],
  ["Max Loan Amount Possible", "10", "10", "10"],
  ["Tenure (Yrs)", "3-6 yrs", "3-6 yrs", "3-6 yrs"],
  ["ROI (%)", "20% - 26%", "20% - 26%", "11% - 17%"],
  ["Pre-EMI (Rs.)", "(Pre-EMI interest is to be paid from the day of the disbursement (fully & partially) till the date of commencement of EMI. ROI will be same as that for EMI)"], 
  ["EMI (Rs.)", "EMI will be based on inal loan amount, rate of interest and tenor approved."],
  ["Rate Type", "Floating", "Floating", "Floating"],
  ["Type of transaction" , "Charges"]
];

const sectionA = [
  ["Loan Applied - First or Incremental", "Upto 4%", "Upto 4%", "Upto 4%"],
  ["File Charges", "NA", "Rs 5900/-", "Rs 2500/-"],
  ["Legal Verification Charges", "NA", "At actuals", "Rs 2500/-"],
  ["Technical Verification / Valuation", "NA", "At actuals", "Rs 6500/-"],
];

const sectionB = [
  [`Early Payments within 12 months of
    loan sanction`, "NA", `6% of Principal outstanding for loan foreclosed within 12 monthsof loan
    sanction`, "NA"],

  [`Early payment after 12 months of loan sanction above 25% of principal outstanding at the beginning of financial year`, "NA", "4%", "6%"],
  ["Foreclosure Charges (Within 12 Months)", "NA", "6%", "6%"],
  ["Foreclosure Charges (After 12 Months)", "NA", "5%", "4%"],
];

const footerNote = "There are no charges on foreclosure or pre-payment on floating rate term loans sanctioned to individual borrowers. The above partprepayment and foreclosure charges are subject to the regulatory requirements and directions prescribed by Reserve Bank of India from Time to time";



// Generate the PDF
// Calling the function with custom font size and border width:
drawComplexTable(headers, data, sectionA, sectionB, footerNote, 8, 0.5);
doc.moveDown(1);
addFooter(doc);



//ankit //
doc.addPage();
drawBorder();
addLogo(doc);

doc.moveDown(10);
doc
.fillColor("black")
.font('Helvetica-Bold')
.text(`C. Other Charges  :-   `,{align:'center'});
doc.moveDown()

// Layout configuration
const startX = 48;
let startY = doc.y;
const tableWidth = 500;
const cellHeight = 20;
const cellWidth = 500; // Total width of the cell
const borderThickness = 0.5;
const customHeight = 40; // Custom height for the cell


function createTwoColumnCellFirst(doc, data, startX, startY, cellWidth, cellHeight, borderThickness) {
      const column1Width = cellWidth * 0.4; // 40% of the total width
      const column2Width = cellWidth * 0.6; // 60% of the total width
  
      // Set border properties
      doc.strokeColor('black').lineWidth(borderThickness);
  
      // Draw outer border for the cell
      doc.rect(startX, startY, cellWidth, cellHeight).stroke();
  
      // Draw divider for the two columns
      doc.moveTo(startX + column1Width, startY)
          .lineTo(startX + column1Width, startY + cellHeight)
          .stroke();
  
      // Add text to the first column
      doc.text(data[0], startX + 5, startY + 5, {
          width: column1Width - 10, // Padding of 5 on each side
          align: 'left',
      });
  
      // Add text to the second column
      doc.text(data[1], startX + column1Width + 5, startY + 5, {
          width: column2Width - 10, // Padding of 5 on each side
          align: 'center',
      });
  
      return startY + cellHeight; // Return updated Y position after the cell
  }
  

  const DateOfTransfers = ['PDC/ ECS/ NACH Bounce Charges / per tr', 'Rs 750/'];

  startY = createTwoColumnCellFirst(doc, DateOfTransfers, startX, startY, cellWidth, cellHeight, borderThickness);
  
doc.moveDown(2)

// Function to render a five-column row
function renderFiveColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in each column
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw vertical dividers for each column
  let x = startX;
  for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      doc.moveTo(x, startY)
          .lineTo(x, startY + maxHeight)
          .stroke();
  }

  // Add text to each column
  x = startX;
  for (let i = 0; i < data.length; i++) {
      doc.text(data[i], x + 5, startY + 5, {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      x += columnWidths[i];
  }

  return startY + maxHeight; // Return updated Y position
}


// Function to render a two-column row
function renderTwoColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in both columns
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'center',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw the divider for the columns
  doc.moveTo(startX + columnWidths[0], startY)
      .lineTo(startX + columnWidths[0], startY + maxHeight)
      .stroke();

  // Add text to each column
  doc.text(data[0], startX + 5, startY + 5, {
      width: columnWidths[0] - padding,
      align: 'left',
  });
  doc.text(data[1], startX + columnWidths[0] + 5, startY + 5, {
      width: columnWidths[1] - padding,
      align: 'center',
  });

  return startY + maxHeight; // Return updated Y position
}


// Refactored createFiveColumnCell function
function createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness) {
  // Define column widths
  const fiveColumnWidths = [
      tableWidth * 0.3, // Column 1: 30%
      tableWidth * 0.1, // Column 2: 10%
      tableWidth * 0.2, // Column 3: 20%
      tableWidth * 0.2, // Column 4: 20%
      tableWidth * 0.2, // Column 5: 20%
  ];
  const twoColumnWidths = [
      tableWidth * 0.4, // Column 1: 40%
      tableWidth * 0.6, // Column 2: 60%
  ];

  
  // Render the five-column row
  startY = renderFiveColumnRow(doc, fiveColumnData, startX, startY, fiveColumnWidths, cellHeight, borderThickness);


  // Render the first two-column row
  startY = renderTwoColumnRow(doc, twoColumnData, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  // Render the second two-column row
  startY = renderTwoColumnRow(doc, twoColumnData1, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData1, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY= renderTwoColumnRow(doc, twoColumnData2, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData3, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData4, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData5, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData6, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY = renderFiveColumnRow(doc, fiveColumnData2, startX, startY, fiveColumnWidths, cellHeight, borderThickness);
  
  startY = renderTwoColumnRow(doc, twoColumnData7, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc, twoColumnData8, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData3, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData4, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData5, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData6, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData7, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc , twoColumnData9 , startX , startY , twoColumnWidths , cellHeight , borderThickness)
  return startY; // Return the final updated Y position

}

function renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness) {
  const padding = 10; // Padding for text within the cell
  
  // Set bold text style
  doc.font('Helvetica-Bold');

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startX, startY, tableWidth, customHeight).stroke();

  // Add the bold text in the cell
  doc.text(text, startX + padding, startY + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: 'left',
      continued: false
  });

  // Return the updated Y position after the cell
  return startY + customHeight;
}


// Data for the table
const fiveColumnData = ['Field collection charges per E' ,'NA',  'NA' ,'' , 'NA'];
const fiveColumnData1=[`Modiication of loan terms
after irst disbursement
including but not limited
to re - scheduling of loan
repayment term, addition/
deletion of coborrowers etc`
 ,`Upto 2% of
outstanding
principal
amount (As
on the date
of
transaction)`,

`Upto 2% of outstanding
principal amount
` ,'' , `Upto 2% of outstanding principal
amount
`]
const fiveColumnData2=[`Cersai Charges` , `NA ` ,  `Rs 500/- ` , `` ,`Rs 500/-`]
const fiveColumnData3=[`RTO transfer charges**` , `NA `, `NA`, ``, `Rs10000/-`]
const fiveColumnData4=[`Applicate RC issuance charges` , `NA` , `NA`, `` , `Rs10000/-`]
const fiveColumnData5=[`MOD Registration Expenses` , `NA` , `NA` ,`` , `NA`]
const fiveColumnData6=[`Stamp Duty and`, `NA`, `NA` , ``, `NA`]
const fiveColumnData7=[`EC` , `NA`, `NA` , ``, `NA`]






const twoColumnData = [`Repayment instrument
change/ swap charges`, `Rs 1000/-`];
const twoColumnData1 = [`EMI repayment cycle date`,  `Rs 1000/-`];
const twoColumnData2=[`Issuance of duplicate 
  income tax certiicate` ,
  `Rs 500 /-`
]
const twoColumnData3=[`Issuance of Duplicate No
objection certiicate (NOC)
` , `Rs 500 /-`]

const twoColumnData4=[`Acticate Statement of Accounts`, `Rs 500 /-`]
const twoColumnData5=[`Document retrieval` , `Rs 1000/- `]
const twoColumnData6=[`Loan Cancellation Charges` , `Rs 20000 + rate of interest from the date of disbursement till date of request of cancellation`]
const twoColumnData7=[`Renewal Charges ` , `NA`]
const twoColumnData8=[`Tranche release charges` , `NA`]
const twoColumnData9=[`Penal Charges` , `3% pm on Instalment overdue`]



// Text to display in the cell
const text = `* Please note that above fee and charges are exclusive of GST, education cess and other government taxes, levies etc. The above schedule of
charges is subject to change and will be at the sole discretion of Fin Coopers Capital Pvt Ltd, The Changes will be available on Fin Coopers`;




// Call the function
startY = createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness);

// Create the full-width bold cell
startY = renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness);

addFooter(doc);

// Add a new Page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);  // Add some space after the logo

let startx = 48;
let starty = doc.y;  // Get the current Y position to start the first table
const Height=20

const fiveColumnWidths = [
  tableWidth * 0.3, // Column 1: 30%
  tableWidth * 0.1, // Column 2: 10%
  tableWidth * 0.2, // Column 3: 20%
  tableWidth * 0.2, // Column 4: 20%
  tableWidth * 0.2, // Column 5: 20%
];




// Function to render a full-width bold cell with custom font size and padding
function renderFullWidthBoldCell1(doc, text, startx, starty, tableWidth, customHeight, borderThickness, fontSize, padding, alignment) {
  // Set bold text style and custom font size
  doc.font('Helvetica-Bold').fontSize(fontSize);

  // Calculate the height of the text
  const textHeight = doc.heightOfString(text, {
      width: tableWidth - 2 * padding, // Width available for the text
  });

  // Adjust the cell height if the text height exceeds the current custom height
  customHeight = Math.max(customHeight, textHeight + 2 * padding);

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startx, starty, tableWidth, customHeight).stroke();

  // Add the bold text in the cell with custom padding
  doc.text(text, startx + padding, starty + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: alignment, // Text alignment
      continued: false,
  });

  // Return the updated Y position after the cell
  return starty + customHeight; // Return the new startY for the next content
}


// Text to display in the first cell
const text1 = `Revised MSME Classiication applicable w.e.f 1st July 2020`;

// Define custom font size and padding
const fontSize = 6;  // Customize the font size as needed
const padding = 6;    // Customize the padding as needed

// Render the first table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text1, startx, starty, tableWidth, Height, borderThickness, fontSize, padding , allignment="center");

// Text to display in the second cell
const text2 = "Composite Criteria#: Investment in Plant & Machinery/equipment and Annual Turnover";
const text3=`# Meaning of Composite Criteria - If an enterprise crosses the ceiling limits specified for its present category in either of the two criteria of
investment or turnover, it will cease to exist in that category and be placed in the next higher category but no enterprise shall be placed in the
lower category unless it goes below the ceiling limits specified for its present category in both the criteria of investment as well as turnover
`

const text4=`*All units with Goods and Services Tax Identiication Number (GSTIN) listed against the same Permanent Account Number (PAN) shall be
collectively treated as one enterprise and the turnover and investment igures for all of such entities shall be seen together and only the aggregate
values will be considered for deciding the category as micro, small or medium enterprise.
`
// Render the second table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text2, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");

// Add more content or tables as needed

const fiveColumnData10=[`Enterprise Classiication` , `Micro `, `Small ` , ``, `Medium`]

const fiveColumnData11 = [`Investment in Plant and
Machinery or Equipment,not exceeding,` , `₹ 1 Crore` , `₹ 10 Crore ` ,  ` `, `₹ 50 Crore` ]

const fiveColumnData12 = [`Annual Turnover, not exceeding` , `₹ 5 Crore` , `₹ 50 Crore `  , ` ` , `₹ 250 Crore`]

starty = renderFiveColumnRow(doc, fiveColumnData10, startx, starty, fiveColumnWidths, cellHeight, borderThickness);
starty=  renderFiveColumnRow(doc , fiveColumnData11 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFiveColumnRow(doc , fiveColumnData12 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFullWidthBoldCell1(doc, text3, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
starty = renderFullWidthBoldCell1(doc, text4, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
// Add footer to the document
addFooter(doc);



doc.addPage();
  drawBorder();
  addLogo(doc);
doc.moveDown(8)

const datatable = [
  { documentName: 'Application Form:',
   documentDetails: `Completed application form duly signed by all applicants, guarantors, and co-applicants (if any)` },
  {
    documentName:'Photograph',
    documentDetails:  `Signed coloured photograph of each applicant(except non-individuals) graph of each applicant (except non-individuals),individual guarantors and co-applicants (if any)`
  },{
    documentName:`Age Proof (For individuals):[Copy of any one of the following]
`,
  documentDetails:`Passport (Not Expired), Pan Card OR Form 60, Voters ID card with complete date of Birth, Driving
License (Not Expired), High School Mark sheet/ Certiicate, LIC policy bond with latest premium paid
receipt (Minimum 12 months in force),
Sr Citizen ID card issued by Govt Body, Birth Certiicate/ Corporation Certiicate (Should have name mentioned on it).
`
  },{
    documentName:`Signature Veriication [Copy of any one of the following](wherever applicable):`,

  documentDetails:` Passport (Not Expired), Pan Card OR Form 60, Driving License (Not Expired), Copy of any cheque
issued in favor of Genesis Securities Pvt Ltd. (Subject to cheque must be cleared), Identity card with
applicants photograph & sign issued by Central/State Government Departments, Original Bankers
Veriication (not older than 30 days)
`
    
  },{

    documentName:`Income Proof*`,
    documentDetails:`  Latest ITR, Latest Form 16, Latest Salary Slip/Certificate, Latest Audited Financials, Bank details with
last 3 months salary
credited, Add- Business Proof-Qualification Certificate/Certificate of Practice (COP), Shop Act
License/MOA & AOA/Sales TaxNat registration/Partnership Deed.`
  },
  {documentName:`Property Document*`,
  documentDetails:`Copy of original sales deed, Allotment possession letter, NOC from society and other documents as per
legal report. The application will be assessed quickly after receiving the required documents.`
  },{
    documentName:`Proof of Identity & Address: (For Individual /Authorized Person)`,
    documentDetails:`Passport (not expired), PAN Card, Voter’s Identity Card issue by Election Commission of India, Driving
License, Proof of Possession of Aadhar (Voluntary), Job Card Issued by NREGA duly signed by office of
State Govt and Letter issued by the
National Population Register containing details of name and address, Ration Card, Bank Statement,
Electricity/Telephone Bill, Sale deed/property purchase agreement (for owned properties)`
  },{
    documentName:`For Trust:
   [Certified copies of each of the following
   documents]`,

    documentDetails:`Registration Certificate, Trust Deed, PAN No. or Form 60 of Trust, * Documents relating to beneficial owner, trustees’ managers, officers or employees as the case may be, holding an attorney to transact on its behalf.
`,
  }
];

createDocumentsRequiredTable(datatable)
addFooter(doc);


// // Add the new page for section 8//

doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8)

const datatables =[
  {
documentName:`For Sole Proprietorship: [Certified copy
of any two* of the following documents
in the name of the proprietary concern]`,
documentDetails:`* Proof of Identity/Address of Individual, Registration Certiicate, Certiicate/licence issued by the municipal authorities under Shop and Establishment Act., Sales and income tax returns, CST/VAT/ GST certiicate (provisional/inal), Certiicate/registration document issued by Sales Tax/Service Tax/Professional Tax authorities, Importer Exporter Code issued by the ofice of DGFT or License/ Certiicate of practice issued in name of the Proprietary concern by professional body incorporated under statute, The complete Income Tax Return in the name of the sole proprietor where the irm’s name and income is relected duly authenticated/acknowledged by the Income Tax Authorities, Utility bills such as electricity, water, and landline telephone bills in the name of the proprietary concern.`

  },
  {
documentName:`For Society Unregistered Partnership Firm:[Certified copy of any two* of the following documents in the name of the proprietary concern]`,
documentDetails:`Board Resolution of the Society/ Firm, PAN or Form 60 of the Society/ Firm, PAN or Form 60 of the
Society/ Firm,
*Documents relating to beneicial owner, ofice bearers, authorised signatories, managers, oficers or
employees, as the case may be, holding an attorney to transact on its behalf, such information as may
be required by the company to collectively establish the legal existence of such an association or body
of individuals.`},{

  documentName:`Note`,
  documentDetails:`1) * Documents relating to beneficial owner, managers, partners, trustees, officers or employees,
authorised signatories, as the case may be, holding an attorney to transact on its behalf: Same list of
documents as for the Individual/ Authorised Person as mentioned above.
2) All the customer documentation to be self-attested. In case of bank statement and inancials irst and
last page needs to be self-attested.
3) The Partnership Deed and the MOA & AOA should be attested stating ‘Certiied that this is duly
Amended & Latest True copy’.
4) All documents to be signed by the customer and OS done by our FTE/Contractual employee/
Genesis Authorized Representative.
5) Driving License - Booklet form is not accepted as KYC document.`
}
]

createDocumentsRequiredTable(datatables)
addFooter(doc);





// Add a new page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);


  function createAadhaarConsentPDF(executants) {
    // Title
    doc.fontSize(10).font('Helvetica-Bold').text('2. MOST IMPORTANT INFORMATION (Aadhaar Consent)', {
      align: 'center'
    });
  
    doc.moveDown(3.5);
  
    // Add the main content
    doc.fontSize(8).font('Helvetica').text(
      `I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company herewith shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in accordance with the applicable law.\n\n` +
        `I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained in vernacular (the language known to me):`,
      { align: 'justify' }
    );
  
    // Add numbered list
    doc.moveDown(1);
    doc.text(`i) the purpose and the uses of collecting Aadhaar;`);
    doc.moveDown(1);
    doc.text(`ii) the nature of information that may be shared upon offline verification;`);
    doc.moveDown(1);
    doc.text(`iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter's ID, driving license, etc.).`);
  
    doc.moveDown(1);
    doc.text(
      `I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of its officials responsible in case of any incorrect / false information or forged document provided by me.\n\n\n\n` +
        `This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in respect of the submission of his/her Aadhaar.`
    );
  
    // Add the footer information
    doc.moveDown(1);
    const date =`${allPerameters.appdate}`;
    const place = `${allPerameters.branchcity}`;
  
    doc.text(`DATE: ${date}`, { align: 'left' });
    doc.text(`PLACE: ${place}`, { align: 'left' });
  
    doc.moveDown(2);
  
    // Add signature table dynamically based on the passed array
    // executants.forEach((executant, index) => {
    //   doc.text(`Name of the Executant(s): ${executant.name}`, { align: 'left' });
    //   doc.text(`Signature: ________________________________`, { align: 'right' });
    //   if (index < executants.length - 1) doc.moveDown(1);
    // });

const docWidth = doc.page.width; // Get the page width
const marginRight = 50; // Set a custom right margin
const textIndent = 10; // Custom right alignment indent





    // Add the signature table
    doc.text(`Name of the Executant(s):`, { align: 'left' });
    doc.text(`Signature:`, { align: 'right' , indent: textIndent});
    doc.moveDown(1.5)
    doc.text(`${allPerameters.borrowerName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.coAppName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.guaName}`)
   
  
  }


// Example Usage
const executantsArray = [
  { name: `${allPerameters.borrowerName}` },
  { name: `${allPerameters.coAppName}` },
  { name: `${allPerameters.guaName}` },
];

createAadhaarConsentPDF(executantsArray);

  addFooter(doc);
  doc.end();





  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;


  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => resolve(pdfFileUrl));
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

async function growpdf3(allPerameters,logo,partnerName) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: "A4" });
  
    // Buffer to hold the PDF content
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));

  //   function drawBorder(doc) {
  //     const pageWidth = doc.page.width;
  //     const pageHeight = doc.page.height;
  //     const margin = 30;
  //     const lineWidth = 2;

  //     doc.lineWidth(lineWidth);
  //     doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin).strokeColor("#324e98").stroke();
  //   }
const FinpdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);
console.log(FinpdfLogo,"FinpdfLogo")

  function addLogo(doc) {
    if (fs.existsSync(FinpdfLogo)) {
      doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
    } else {
      console.error(`Logo file not found at: ${FinpdfLogo}`);
    }

    if (fs.existsSync(logo)) {
            doc.image(logo, 40, 50, {
              fit: [150, 50],
              align: "right",
              valign: "bottom",
            });
          } else {
            console.error(`Left logo file not found at: ${logo}`);
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.com", {
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

  // const pdfFilename = `applicantion.pdf`;
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

  doc.moveDown(4);
  doc.fontSize(8).font(fontBold).text("For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS. (Tick boxes where appropriate and write N.A. if not applicable. All ields are mandatory)",);
  doc.moveDown(1);
  doc.font(fontBold)
    .fontSize(9)
    .text(`Date:                    ${allPerameters.date}`, { align: "left" });
  doc.text(`Application Form No:    ${allPerameters.customerNO}`, { align: "left" });
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
    const columnWidths = [200, 300, 70];
  
    // Draw the special row at the top of the table (Loan Details)
    const specialRowHeight = 23; // Height of the special row
    const specialRowText = `${sectionTitle}`; // Text for the special row
    const specialRowColor = "#1E90FF"; // Light blue background color
  
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
    console.log(dataLength);
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
    const noteHeight = doc.heightOfString(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`) + 2 * padding;
    doc.rect(startX, currentY, cellWidth1 + cellWidth2, noteHeight).stroke();
    doc.fontSize(7).text(`Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).
*Requirement of documents might vary according to the scheme chosen.`, startX + padding, currentY + padding, { align: 'left' });
}

  function drawTable3(sectionTitle, data, imagePath) {//imagelogo
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
  const specialRowColor = "#1E90FF"; // Light blue background color

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
    //   .fill("#1E90FF")  // Color for the section title (same as before)
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
  addLogo(doc);
  addWatermark(doc);
  drawBorder(doc);

  doc.font(fontBold)
    .fontSize(11)
    .fillColor('black')
    .text("Section 1: Application Details", { underline: true  });


  // Loan Details Section
  const loanDetails = [
    { key: "Loan Amount Requested", value: allPerameters.loanAmount || `${allPerameters.loanAmountRequested}` },
    { key: "Loan Tenure Requested (in months)", value: allPerameters.loanTenure || `${allPerameters.tenure}` },
    { key: "Loan Purpose", value: allPerameters.loanPurpose || "BUSINESS EXPANSION" },
    { key: "Loan Type", value: allPerameters.loanType || "SECURED" },
  ];
  drawTable("Loan Details", loanDetails);

  // Sourcing Details Section

  const sourcingDetails = [{
    key:`Sourcing Type`,
    value: `${allPerameters.sourceType}` || "NA",

  }, {
    key: "Gen Partner Name",
    value: allPerameters.genPartnerName || "NA",
  }, {
    key: "Sourcing Agent Name : ",
    value: allPerameters.sourcingAgentName || "NA",
  }, {
    key: "Sourcing Agent Code : ",
    value: allPerameters.sourcingAgentCode || "NA",
  }, {
    key: "Sourcing Agent Location : ",
    value: allPerameters.sourcingAgentLocation || "NA",
  }, {
    key: "Sourcing RM Name : ",
    value: allPerameters.sourcingRMName || "NA",
  }, {
    key: "Sourcing RM Code : ",
    value: allPerameters.sourcingRMCode || "NA",
  }]

  drawTable("Sourcing Details", sourcingDetails);

  // Product Program Details Section
  const productProgramDetails = [
    { key: "Industry Type", value: "FIN COOPERS" },
    { key: "Sub Industry Type", value: "FIN COOPERS" },
    { key: "Product Type", value: "SECURED" },
    { key: "Program", value: "SL-FIN COOPERS CAPITAL PROGRAMME SECURED" },
    { key: "Secured/Un-Secured", value: "SECURED" },
    { key: "Property Value", value: "Rs. 500000" },
    { key: "BT EMI Value", value: "NA" },
  ];
  drawTable("Product Program Details", productProgramDetails);
  addFooter(doc);
  addLogo(doc);

   // page second
  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true });


  const applicantDetails = [

    {
      key: "Application Type", value: `${allPerameters.appType}`
    }, {
      key: "Business Type", value: `${allPerameters.buisnessType}`
    }, {
      key: "Applicant Name", value: `${allPerameters.borrowerName}`
    }, {
      key: "Applicant Father/Spouse Name", value: `${allPerameters.appFather}`
    }, {
      key: "Applicant Mother Name", value: `${allPerameters.appMother}`
    }, {
      key: "Mobile No.1", value: `${allPerameters.appMob1}`
    }, {
      key: "Mobile No.2", value: `${allPerameters.appMob2}`
    }, {
      key: "Email ID", value: `${allPerameters.appEmail}`
    }, {
      key: "Education Qualification", value: `${allPerameters.appEdu}`
    }, {
      key: "Applicant DOB", value: `${allPerameters.appDOB}`
    }, {
      key: "Gender", value: `${allPerameters.appGender}`
    }, {
      key: "Marital Status", value: `${allPerameters.appMaritalStatus}`
    }, {
      key: "Pan Number", value: `${allPerameters.appPan}`
    }, {
      key: "Aadhar Number", value: `${allPerameters.appAdhar}`
    }, {
      key: "Voter Id Number", value: `${allPerameters.AppVoterId}`
    }
  ];




  const communicationAddress = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.appadharadress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.appCityName}`,
    }, {
      key: "District Name", value: `${allPerameters.appdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`
    }, {
      key: "State", value: `${allPerameters.AppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`
    }
  ]


  // const PermanentAddress = [
  //   {
  //     key: "Same as Communication address", value: "YES",
  //   }, {
  //     key: "Address", value: `${allPerameters.appadharadress}`,
  //   }, {
  //     key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
  //   }
  // ]


  // Application details -2  ---- Parent address --- last 4 data //

  // Add the new page 

  const PermanentAddress = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.appadharadress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.appCityName}`,
    },
    {
      key: "District Name", value: `${allPerameters.appdistrict}`,
    }, {
      key: "Pin Code", value: `${allPerameters.AppPin}`,
    }, {
      key: "State", value: `${allPerameters.AppState}`,
    }, {
      key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
    }
  ]
  // const ParmentAddress2 = [
  //   , {
  //     key: "District Name", value: `${allPerameters.appdistrict}`,
  //   }, {
  //     key: "Pin Code", value: `${allPerameters.AppPin}`,
  //   }, {
  //     key: "State", value: `${allPerameters.AppState}`,
  //   }, {
  //     key: "Years at current address", value: `${allPerameters.AppYearsAtCureentAdress}`,
  //   }
  // ]










// const imagelogo =path.join(__dirname, `../../../../..${allPerameters.appImage}`);

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
  console.log(imagePath, "imagePathimagePath");

  // Call the function in the PDF generation pipeline
  drawTable3("Applicant Details", applicantDetails, imagePath);
  doc.moveDown(1);
  drawTable("Communication Address", communicationAddress);
  // drawTable("Permanent Address", PermanentAddress);
  addFooter(doc);

  // Add the new Page for ParmentAddresss // 
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // drawNewPage(ParmentAddress2);
  drawTable("Permanent Address", PermanentAddress);

  doc.moveDown(1);
  // add the footer
  addFooter(doc);


  // add a new page for section 3//
  doc.addPage();
  addLogo(doc);
  drawBorder()
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 3: Co-applicant/Guarantor Details", { underline: true });

  const coApplicantDetails = [
    {
      key: "Co-Applicant Type", value: `${allPerameters.coAppType}`,
    }, {
      key: "Co-Applicant Name", value: `${allPerameters.coAppName}`,
    }, {
      key: "Relation with Applicant ", value: `${allPerameters.coRelWithApp}`,
    }, {
      key: "Co-Applicant Father/Spouse Name", value: `${allPerameters.coAppFather}`,
    }, {
      key: "Co-Applicant Mother Name", value: `${allPerameters.coAppMother}`,
    }, {
      key: "Mobile No.1", value: `${allPerameters.coAppMob1}`,
    },{
      key: "Mobile No.2", value: `${allPerameters.coappMob2}`
    },
     {
      key: "Email ID", value: `${allPerameters.coAppEmail}`,
    }, {
      key: "Education Qualification", value: `${allPerameters.coAppEdu}`,
    }, {
      key: "Co-Applicant DOB", value: `${allPerameters.coAPPDob}`,
    }, {
      key: "Gender", value: `${allPerameters.coAppGender}`,
    }, {
      key: "Marrital Status ", value: `${allPerameters.coAppMarritalStatus}`,
    }, {
      key: "Pan Number", value: `${allPerameters.coAppPan}`,
    }, {
      key: "Aadhar Number", value: `${allPerameters.coAPPAdhar}`,
    }, {
      key: "Voter Id Number", value: `${allPerameters.coAppvoterId}`,
    }
  ]

  const communicationAddressco = [
    {
      key: "Adress as per Aadhar", value: `${allPerameters.coAppAdharAdress}`,

    }, {
      key: "Name of the City/Town/Village", value: `${allPerameters.coAppcity}`,
    }, {
      key: "District Name", value: `${allPerameters.coAppdistrict}`
    }, {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    }, {
      key: "State", value: `${allPerameters.coAppState}`
    }, {
      key: "Years at current address", value: `${allPerameters.coAppcurentAdress}`
    }
  ]

  const ParentAddressco = [
    {
      key: "Same as Communication address", value: "YES",
    }, {
      key: "Address", value: `${allPerameters.coAppAdharAdress}`,
    }, {
      key: "Name of City/Town/Village", value: `${allPerameters.coAppcity}`,
    },
    { key: "DistrictName", value: `${allPerameters.coAppdistrict}` },
    {
      key: "Pin Code", value: `${allPerameters.coAppPIN}`
    },
    { key: "State", value: `${allPerameters.coAppState}` },
    { key: "Years at Permanent addres", value: `${allPerameters.coAppcurentAdress}` }
  ]


  // const ParentAddressco1 = [
  //   { key: "DistrictName", value: "N/A" },
  //   { key: "State", value: "N/A" },
  //   { key: "Years at Permanent addres", value: "N/A" }
  // ]


  
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
  const imagelogo1 = await saveImageLocally1(`${allPerameters.co1Image}`);
  // const imagelogo1 =path.join(__dirname, `../../../../..${allPerameters.co1Image}`);


  drawTable3("Co-Applicant Details-1", coApplicantDetails, imagelogo1);
  doc.moveDown(1)
  drawTable("Communication Address", communicationAddressco);
  // drawTable("Permanent Address", ParentAddressco);
  doc.moveDown(1);
  addFooter(doc);



  // Add the new page for ParentAddresco //

  doc.addPage()
  drawBorder()
  addLogo(doc)
  doc.moveDown(8)
  drawTable("Permanent Address", ParentAddressco);
  addFooter(doc);

  //coApplicant 2



  // add a new page for section 4



  // Section -4 // -- Collateral Details //

  // Add new page for Section 2
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)
  doc.font(fontBold).fontSize(11).text("Section 4: Collaterals Details", { underline: true });

  const CollateralsDetails = [
    { key: "Type", value: "RESIDENTIAL" },
    { key: "Address", value: `${allPerameters.technicalFullADDRESS}` }
  ]

  const BankDetails = [
    { key: "Name of Bank", value: `${allPerameters.bankName}` },
    { key: "Branch", value: `${allPerameters.branchName}` },
    { key: "Account No", value: `${allPerameters.accNo}` },
    { key: "Account Type", value: `${allPerameters.accType}` },
    { key: "IFSC Code", value: `${allPerameters.ifscCode}` },
  ]

  drawTable("Collaterals Details", CollateralsDetails);
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

  const ReferanceDetails = [
    { 
      key: "Reference 1 - Name", value: `${allPerameters.ref1name}` ,
    },{ 
      key: "Reference 1 - Relation", value: `${allPerameters.ref1rel}`
    },{ 
      key: "Reference 1 - Address", value: `${allPerameters.ref1add}` 
    },{ 
      key: "Reference 1 - Mobile Number", value: `${allPerameters.re1mob}`
     },{},
     {
       key: "Reference 2 - Name", value: `${allPerameters.ref2name}`

    },{ key: "Reference 2 - Relation", value: `${allPerameters.ref2rel}`

     },
    { 
      key: "Reference 2 - Address", value: `${allPerameters.ref2add}` 
    },
    { 
      key: "Reference 2 - Mobile Number", value: `${allPerameters.ref2accType}` 
    }
  ]
  drawTable("Referance Detail", ReferanceDetails)




  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // Define styles
  const titleFontSize = 11;
  const contentFontSize = 9;
  const headingFontsize = 8
  const leftMargin = 50;
  const textWidth = doc.page.width - 2 * leftMargin;
  const lineSpacing = 1.5;

  // Section title: COMMON DECLARATIONS

  doc.moveDown(2);
  doc.fontSize(headingFontsize)
    .text("We acknowledge the receipt of your application for availment of Loan & the same will be processed within a period of 15 days from today.", leftMargin, doc.y);

  doc.moveDown(2);

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("COMMON DECLARATIONS");
  doc.moveDown(0.5)

  doc.fontSize(contentFontSize)
    .text("I/We hereby acknowledge and confirm that:", {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    })
  // Array of declarations text
  const declarations = [

    `I hereby declare that I am not involved in any type of production or trading activity that comes under International Finance Corporation exclusion list.*Production or trade in any product or activity deemed illegal, pharmaceuticals, pesticides/herbicides, ozone-depleting substances, PCB's, wildlife, weapons, munitions, alcoholic beverages (excluding beer and wine), tobacco, gambling, casinos, radioactive materials, unbonded asbestos fibers, drift net fishing in the marine environment.`,
    `The executive of Fin Coopers Capital Pvt Ltd (Lender), collecting the application/documents has informed me/us of the applicable schedule of charges, fees, commissions, and key facts, as more particularly mentioned in the “Schedule of charges” on the website of the company.`,
    `Submission of loan application to the lender does not imply automatic approval by the lender and the lender will decide the quantum of the loan at its sole & absolute discretion. The lender in its sole and absolute discretion may either approve or reject the application for granting the loan. In case of rejection, the lender shall not be required to give any reason.`,
    `I/We authorized and give consent to Fin Coopers Capital Pvt Ltd to disclose, without noticing me/us, the information furnished by me/us in the application form(s)/ related documents executed/to be executed in the relation to the facilities to be availed by me/us from Fin Coopers Capital Pvt Ltd, to other branches/Subsidiaries/affiliates/credit Bureaus/CIBIL/Rating Agencies/service providers, Banks/financial institutes, governmental/regulatory authorities or third parties who may need, process & publish the information in such manner and through such medium as it may be deemed necessary by the lender/RBI, including publishing the name as part of wilful defaulter’s list from time to time, as also use for KYC information verification, credit risk analysis or for any other purposes as the lender deemed necessary.`,
    `I/We declare that all the particulars and information and documents provided with this form are genuine, true, correct, complete, and up to date in all respects and that I/We have not withheld/suppressed any information/document whatsoever. I/We also authorized Genesis Securities Pvt Ltd to use the documents, download records from CKYCR using the KYC identifier submitted, video record the KYC document, personal discussion, and any other information provided herewith to extract additional information from the various public domains, including but not limited to CIBIL/Bureau report, Perfios report, etc. or for any other regulatory & compliance-related matters, prior to sanction/post sanction.`,
    `I/We have been informed of the documents to be submitted with the loan application form and have submitted the same. I/ We shall furnish any additional documents as and when required by the lender.`,
    `The executive collection of the application/documents has informed me/us of the rate of interest and approach for gradation of risk and rational of charging different rates of interest to different categories of borrowers, the particulars whereof have specified in the Loan Application form.`,
    `The rate of interest is arrived at based on various factors such as cost of funds, administrative cost, risk premium, margin, etc. The decision to give a loan and the interest rate applicable to each loan account are assessed on a case-to-case basis, based on multiple parameters such as borrower proile, repayment capacity, the asset being inanced, borrower’s other inancial commitments, past repayment track record, if any,security, tenure, etc. The rate of interest is subject to change as the situation warrants and is subject to the discretion of the company.`,
    `The credit decision is based on the credit model which includes factors like credit history, repayment track record, banking habit, business stability & cash flow analysis which is assessed through a combination of personal discussion and documentation.`,
  ];

  // Loop to display declarations with numbering
  declarations.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  });
  addFooter(doc);

  // add the new page for section 7
  doc.addPage();
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  const DeclarationDetails = [
    `Incomplete/defective application will not be processed and the lender shall not be responsible in any manner for the resulting delay or otherwis.`,
    ` Loan foreclose charges should be as per sanction terms.`,
    `The loan term as sanctioned are applicable for the specified product as indicated in the loan application and are valid for the period of 60 days only. Where for some reason, there is a delay in concluding the loan, the lender reserves the right to revise the loan term as may be applicable at the\ntime of actual loan availment upon providing a copy of revisions to me/us.`,
    `All the particulars and the information and details are given/illed in this application form are true, correct, complete, and up to date in all respects, and I/We have not withheld any information whatsoever.`,
    `Any fault or misrepresentation in the documents will be my/our sole responsibility and Fin Coopers Capital Pvt Ltd has the authority to take rightful action against any such fault/misrepresentation.`,
    ` I/we shall inform the lender regarding any changes in my/our address(s) or my employment or profession, or any material deviation from the information provided in the loan application form.`,
    ` I/We hereby confirm that I/we am/are competent and fully authorized to give declarations, undertaking, etc., and to execute and submit this application form and all other documents for the purpose of availing the loan, creation of security, and representing generally for all the purposes.`,
    `I/We acknowledge and understand that the application/processing fees collected from me/us by Fin Coopers Capital Pvt Ltd, is for reviewing the loan application as per its own parameters and its not refundable to me/us under any circumstances whatsoever, irrespective of whether FinCoopers Capital Pvt Ltd sanction this loan application of mine or not. No cash has been given by me/us to any person for whatsoever reason related to the loan application.`,
    ` The lender has the right to retain the documents along with the photographs submitted with the loan application, and the same will not be returned to the applicant.`,
    `I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other social media applications.`,
    ` Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).`,
    `I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our vernacular language(s), & we have understood the same.`,

  ]

  // Loop to display declarations with numbering
  DeclarationDetails.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 10}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  addFooter(doc);


  // Section - paragraph //

  doc.addPage()
  drawBorder()
  addLogo(doc);
  doc.moveDown(8)

  // const DeclarationDetails1 = [
  //   "I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other\nsocial media applications.",
  //   " Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main\npromoter/director/partner and I/we hereby authorize you/subsidiaries/afiliates/third party vendor for sending any promotional/transactional\nsms.Further I/We conirm that the provided number/s are not registered with DO NOT DISTURB (DND).",
  //   "I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our\nvernacular language(s), & we have understood the same"
  // ]

  // Loop to display declarations with numbering
  // DeclarationDetails1.forEach((text, index) => {
  //   // Numbered list item
  //   doc.font('Helvetica')
  //     .fontSize(contentFontSize)
  //     .text(`${index + 7}. ${text}`, leftMargin, doc.y, {
  //       width: textWidth,
  //       lineGap: lineSpacing,
  //       align: 'justify',
  //     });
  //   // Add spacing between items if needed
  //   doc.moveDown(0.5);
  // }
  // );

  doc.moveDown(1)

  doc.font('Helvetica-Bold')
    .fontSize(titleFontSize)
    .text("OTHER TERMS & CONDITIONS:", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });
 
  doc.moveDown(1)

  const DeclarationDetails2 = [
    "Payment: No cash/bearer cheque has been collected from me up-front towards processing the loan application.",
    "Details with respect to the EMI presentation dates, number of EMIs, amount, and other terms & conditions of the loan will be communicated separately along with the welcome letter.",
    "No discount/fees gifts or any other commitment is given whatsoever which is not documented in the loan agreement by the lender or any of its authorized representative(s).",
    "The lender shall make all attempts to process the application and disburse the loan within 30 (thirty) working days from the date of the completion and submission of all relevant loan documents as specified therein.",
    "Other charges: Loan processing fees would be up to 4% of the loan amount.",
    "Charges which are in nature of fees are exclusive of good and service tax. Goods and services tax and other government levies, as applicable, would be charged additionally.",
    "Fin Coopers shall have a right to either process and disburse the entire loan amount singly or jointly together with such other co-lending partners i.e. bank/NBFCs as it may be deemed fit."
  ]

    // Sample data
const signatureData = [
  'Signature Applicant (Authorised   Signatory)                ',
  'Signature Co-Applicant-1/Guarantor-1 (Authorised Signatory)',
  'Signature Co-Applicant-2/Guarantor-2 (Authorised Signatory)',
  '  Signature      Guarantor              (Authorised Signatory)',
];

  // Loop to display declarations with numbering
  DeclarationDetails2.forEach((text, index) => {
    // Numbered list item
    doc.font('Helvetica')
      .fontSize(contentFontSize)
      .text(`${index + 1}. ${text}`, leftMargin, doc.y, {
        width: textWidth,
        lineGap: lineSpacing,
        align: 'justify',
      });
    // Add spacing between items if needed
    doc.moveDown(0.5);
  }
  );
  doc.moveDown(4)

  doc.font('Helvetica')
    .fontSize(headingFontsize)
    .text("If applicant / borrower require any clariication regarding their application / loan, they may write into :", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
    });

  doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("Fin Coopers Capital Pvt Ltd, 401,174/3,Nehru Nagar,Indore-452011 (M.P.), or email us at: Info@incoopers.com", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.moveDown(1)

    doc.font('Helvetica-Bold')
    .fontSize(contentFontSize)
     .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
      width: textWidth,
      lineGap: lineSpacing,
      align: 'justify',
     })

     doc.font('Helvetica')
     .fontSize(headingFontsize)
      .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", leftMargin, doc.y, {
       width: textWidth,
       lineGap: lineSpacing,
       align: 'justify',
      })

     doc.moveDown(1)

    createSignatureTablePDF(signatureData, 38, 120); // Adjusts left margin to 50 and top margin to 120




  // .fontSize(contentFontSize)
  // .text("The brand Genesis is presented by Fin Coopers Capital Pvt Ltd.")
  // .fontSize(headingFontsize)
  // .text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.")

  addFooter(doc);


  
  // Make  a new page for the section 8 //
  doc.addPage();
  drawBorder();
  addLogo(doc);
  doc.moveDown(1)

  // const sectionTitle = "A. Loan Details";
  // const headers = ["", "UNSECURED", "SECURED", "P&M"];
  // const data = [
  //   ["Min Loan Amount", "1", "2", "3"],
  //   ["Max Loan Amount", "10", "15", "20"],
  //   ["Tenure", "5", "10", "7"],
  //   ["ROI (%)", "8%", "10%", "9%"],
  //   ["Pre-EMI (Rs.)", "(Pre-EMI interest details)", "5000", "4500"],
  //   ["EMI (Rs.)", "3000", "3500", "3200"],
  //   ["Rate Type", "Floating", "Fixed", "Floating"],
  //   ["Type of Transaction", "Loan", "Loan", "Loan"],
  // ];

 // Example Data
const headers = ["", "UNSECURED", "SECURED", "P&M"];
const data = [
  ["Min Loan Amount Possible", "1", "1", "1"],
  ["Max Loan Amount Possible", "10", "10", "10"],
  ["Tenure (Yrs)", "3-6 yrs", "3-6 yrs", "3-6 yrs"],
  ["ROI (%)", "20% - 26%", "20% - 26%", "11% - 17%"],
  ["Pre-EMI (Rs.)", "(Pre-EMI interest is to be paid from the day of the disbursement (fully & partially) till the date of commencement of EMI. ROI will be same as that for EMI)"], 
  ["EMI (Rs.)", "EMI will be based on inal loan amount, rate of interest and tenor approved."],
  ["Rate Type", "Floating", "Floating", "Floating"],
  ["Type of transaction" , "Charges"]
];

const sectionA = [
  ["Loan Applied - First or Incremental", "Upto 4%", "Upto 4%", "Upto 4%"],
  ["File Charges", "NA", "Rs 5900/-", "Rs 2500/-"],
  ["Legal Verification Charges", "NA", "At actuals", "Rs 2500/-"],
  ["Technical Verification / Valuation", "NA", "At actuals", "Rs 6500/-"],
];

const sectionB = [
  [`Early Payments within 12 months of
    loan sanction`, "NA", `6% of Principal outstanding for loan foreclosed within 12 monthsof loan
    sanction`, "NA"],

  [`Early payment after 12 months of loan sanction above 25% of principal outstanding at the beginning of financial year`, "NA", "4%", "6%"],
  ["Foreclosure Charges (Within 12 Months)", "NA", "6%", "6%"],
  ["Foreclosure Charges (After 12 Months)", "NA", "5%", "4%"],
];

const footerNote = "There are no charges on foreclosure or pre-payment on floating rate term loans sanctioned to individual borrowers. The above partprepayment and foreclosure charges are subject to the regulatory requirements and directions prescribed by Reserve Bank of India from Time to time";



// Generate the PDF
// Calling the function with custom font size and border width:
drawComplexTable(headers, data, sectionA, sectionB, footerNote, 8, 0.5);
doc.moveDown(1);
addFooter(doc);



//ankit //
doc.addPage();
drawBorder();
addLogo(doc);

doc.moveDown(10);
doc
.fillColor("black")
.font('Helvetica-Bold')
.text(`C. Other Charges  :-   `,{align:'center'});
doc.moveDown()

// Layout configuration
const startX = 48;
let startY = doc.y;
const tableWidth = 500;
const cellHeight = 20;
const cellWidth = 500; // Total width of the cell
const borderThickness = 0.5;
const customHeight = 40; // Custom height for the cell


function createTwoColumnCellFirst(doc, data, startX, startY, cellWidth, cellHeight, borderThickness) {
      const column1Width = cellWidth * 0.4; // 40% of the total width
      const column2Width = cellWidth * 0.6; // 60% of the total width
  
      // Set border properties
      doc.strokeColor('black').lineWidth(borderThickness);
  
      // Draw outer border for the cell
      doc.rect(startX, startY, cellWidth, cellHeight).stroke();
  
      // Draw divider for the two columns
      doc.moveTo(startX + column1Width, startY)
          .lineTo(startX + column1Width, startY + cellHeight)
          .stroke();
  
      // Add text to the first column
      doc.text(data[0], startX + 5, startY + 5, {
          width: column1Width - 10, // Padding of 5 on each side
          align: 'left',
      });
  
      // Add text to the second column
      doc.text(data[1], startX + column1Width + 5, startY + 5, {
          width: column2Width - 10, // Padding of 5 on each side
          align: 'center',
      });
  
      return startY + cellHeight; // Return updated Y position after the cell
  }
  

  const DateOfTransfers = ['PDC/ ECS/ NACH Bounce Charges / per tr', 'Rs 750/'];

  startY = createTwoColumnCellFirst(doc, DateOfTransfers, startX, startY, cellWidth, cellHeight, borderThickness);
  
doc.moveDown(2)

// Function to render a five-column row
function renderFiveColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in each column
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw vertical dividers for each column
  let x = startX;
  for (let i = 0; i < columnWidths.length - 1; i++) {
      x += columnWidths[i];
      doc.moveTo(x, startY)
          .lineTo(x, startY + maxHeight)
          .stroke();
  }

  // Add text to each column
  x = startX;
  for (let i = 0; i < data.length; i++) {
      doc.text(data[i], x + 5, startY + 5, {
          width: columnWidths[i] - padding,
          align: 'left',
      });
      x += columnWidths[i];
  }

  return startY + maxHeight; // Return updated Y position
}


// Function to render a two-column row
function renderTwoColumnRow(doc, data, startX, startY, columnWidths, baseCellHeight, borderThickness) {
  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Determine the maximum height required for the text in both columns
  let maxHeight = baseCellHeight;
  const padding = 10; // Padding for text within the cell

  for (let i = 0; i < data.length; i++) {
      const textHeight = doc.heightOfString(data[i], {
          width: columnWidths[i] - padding,
          align: 'center',
      });
      if (textHeight + padding > maxHeight) {
          maxHeight = textHeight + padding; // Update the cell height if the text requires more space
      }
  }

  // Draw the main border for the row
  doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), maxHeight).stroke();

  // Draw the divider for the columns
  doc.moveTo(startX + columnWidths[0], startY)
      .lineTo(startX + columnWidths[0], startY + maxHeight)
      .stroke();

  // Add text to each column
  doc.text(data[0], startX + 5, startY + 5, {
      width: columnWidths[0] - padding,
      align: 'left',
  });
  doc.text(data[1], startX + columnWidths[0] + 5, startY + 5, {
      width: columnWidths[1] - padding,
      align: 'center',
  });

  return startY + maxHeight; // Return updated Y position
}


// Refactored createFiveColumnCell function
function createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness) {
  // Define column widths
  const fiveColumnWidths = [
      tableWidth * 0.3, // Column 1: 30%
      tableWidth * 0.1, // Column 2: 10%
      tableWidth * 0.2, // Column 3: 20%
      tableWidth * 0.2, // Column 4: 20%
      tableWidth * 0.2, // Column 5: 20%
  ];
  const twoColumnWidths = [
      tableWidth * 0.4, // Column 1: 40%
      tableWidth * 0.6, // Column 2: 60%
  ];

  
  // Render the five-column row
  startY = renderFiveColumnRow(doc, fiveColumnData, startX, startY, fiveColumnWidths, cellHeight, borderThickness);


  // Render the first two-column row
  startY = renderTwoColumnRow(doc, twoColumnData, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  // Render the second two-column row
  startY = renderTwoColumnRow(doc, twoColumnData1, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData1, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY= renderTwoColumnRow(doc, twoColumnData2, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData3, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData4, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData5, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY= renderTwoColumnRow(doc, twoColumnData6, startX, startY, twoColumnWidths, cellHeight, borderThickness)

  startY = renderFiveColumnRow(doc, fiveColumnData2, startX, startY, fiveColumnWidths, cellHeight, borderThickness);
  
  startY = renderTwoColumnRow(doc, twoColumnData7, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc, twoColumnData8, startX, startY, twoColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData3, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData4, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData5, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData6, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderFiveColumnRow(doc, fiveColumnData7, startX, startY, fiveColumnWidths, cellHeight, borderThickness);

  startY = renderTwoColumnRow(doc , twoColumnData9 , startX , startY , twoColumnWidths , cellHeight , borderThickness)
  return startY; // Return the final updated Y position

}

function renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness) {
  const padding = 10; // Padding for text within the cell
  
  // Set bold text style
  doc.font('Helvetica-Bold');

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startX, startY, tableWidth, customHeight).stroke();

  // Add the bold text in the cell
  doc.text(text, startX + padding, startY + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: 'left',
      continued: false
  });

  // Return the updated Y position after the cell
  return startY + customHeight;
}


// Data for the table
const fiveColumnData = ['Field collection charges per E' ,'NA',  'NA' ,'' , 'NA'];
const fiveColumnData1=[`Modiication of loan terms
after irst disbursement
including but not limited
to re - scheduling of loan
repayment term, addition/
deletion of coborrowers etc`
 ,`Upto 2% of
outstanding
principal
amount (As
on the date
of
transaction)`,

`Upto 2% of outstanding
principal amount
` ,'' , `Upto 2% of outstanding principal
amount
`]
const fiveColumnData2=[`Cersai Charges` , `NA ` ,  `Rs 500/- ` , `` ,`Rs 500/-`]
const fiveColumnData3=[`RTO transfer charges**` , `NA `, `NA`, ``, `Rs10000/-`]
const fiveColumnData4=[`Applicate RC issuance charges` , `NA` , `NA`, `` , `Rs10000/-`]
const fiveColumnData5=[`MOD Registration Expenses` , `NA` , `NA` ,`` , `NA`]
const fiveColumnData6=[`Stamp Duty and`, `NA`, `NA` , ``, `NA`]
const fiveColumnData7=[`EC` , `NA`, `NA` , ``, `NA`]






const twoColumnData = [`Repayment instrument
change/ swap charges`, `Rs 1000/-`];
const twoColumnData1 = [`EMI repayment cycle date`,  `Rs 1000/-`];
const twoColumnData2=[`Issuance of duplicate 
  income tax certiicate` ,
  `Rs 500 /-`
]
const twoColumnData3=[`Issuance of Duplicate No
objection certiicate (NOC)
` , `Rs 500 /-`]

const twoColumnData4=[`Acticate Statement of Accounts`, `Rs 500 /-`]
const twoColumnData5=[`Document retrieval` , `Rs 1000/- `]
const twoColumnData6=[`Loan Cancellation Charges` , `Rs 20000 + rate of interest from the date of disbursement till date of request of cancellation`]
const twoColumnData7=[`Renewal Charges ` , `NA`]
const twoColumnData8=[`Tranche release charges` , `NA`]
const twoColumnData9=[`Penal Charges` , `3% pm on Instalment overdue`]



// Text to display in the cell
const text = `* Please note that above fee and charges are exclusive of GST, education cess and other government taxes, levies etc. The above schedule of
charges is subject to change and will be at the sole discretion of Fin Coopers Capital Pvt Ltd, The Changes will be available on Fin Coopers`;




// Call the function
startY = createFiveColumnCell(doc, fiveColumnData, twoColumnData, twoColumnData1, startX, startY, tableWidth, cellHeight, borderThickness);

// Create the full-width bold cell
startY = renderFullWidthBoldCell(doc, text, startX, startY, tableWidth, customHeight, borderThickness);

addFooter(doc);

// Add a new Page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);  // Add some space after the logo

let startx = 48;
let starty = doc.y;  // Get the current Y position to start the first table
const Height=20

const fiveColumnWidths = [
  tableWidth * 0.3, // Column 1: 30%
  tableWidth * 0.1, // Column 2: 10%
  tableWidth * 0.2, // Column 3: 20%
  tableWidth * 0.2, // Column 4: 20%
  tableWidth * 0.2, // Column 5: 20%
];




// Function to render a full-width bold cell with custom font size and padding
function renderFullWidthBoldCell1(doc, text, startx, starty, tableWidth, customHeight, borderThickness, fontSize, padding, alignment) {
  // Set bold text style and custom font size
  doc.font('Helvetica-Bold').fontSize(fontSize);

  // Calculate the height of the text
  const textHeight = doc.heightOfString(text, {
      width: tableWidth - 2 * padding, // Width available for the text
  });

  // Adjust the cell height if the text height exceeds the current custom height
  customHeight = Math.max(customHeight, textHeight + 2 * padding);

  // Set border properties
  doc.strokeColor('black').lineWidth(borderThickness);

  // Draw the main border for the cell (spans the full table width)
  doc.rect(startx, starty, tableWidth, customHeight).stroke();

  // Add the bold text in the cell with custom padding
  doc.text(text, startx + padding, starty + padding, {
      width: tableWidth - 2 * padding, // Full width minus padding
      align: alignment, // Text alignment
      continued: false,
  });

  // Return the updated Y position after the cell
  return starty + customHeight; // Return the new startY for the next content
}


// Text to display in the first cell
const text1 = `Revised MSME Classiication applicable w.e.f 1st July 2020`;

// Define custom font size and padding
const fontSize = 6;  // Customize the font size as needed
const padding = 6;    // Customize the padding as needed

// Render the first table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text1, startx, starty, tableWidth, Height, borderThickness, fontSize, padding , allignment="center");

// Text to display in the second cell
const text2 = "Composite Criteria#: Investment in Plant & Machinery/equipment and Annual Turnover";
const text3=`# Meaning of Composite Criteria - If an enterprise crosses the ceiling limits specified for its present category in either of the two criteria of
investment or turnover, it will cease to exist in that category and be placed in the next higher category but no enterprise shall be placed in the
lower category unless it goes below the ceiling limits specified for its present category in both the criteria of investment as well as turnover
`

const text4=`*All units with Goods and Services Tax Identiication Number (GSTIN) listed against the same Permanent Account Number (PAN) shall be
collectively treated as one enterprise and the turnover and investment igures for all of such entities shall be seen together and only the aggregate
values will be considered for deciding the category as micro, small or medium enterprise.
`
// Render the second table (full-width bold cell)
starty = renderFullWidthBoldCell1(doc, text2, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");

// Add more content or tables as needed

const fiveColumnData10=[`Enterprise Classiication` , `Micro `, `Small ` , ``, `Medium`]

const fiveColumnData11 = [`Investment in Plant and
Machinery or Equipment,not exceeding,` , `₹ 1 Crore` , `₹ 10 Crore ` ,  ` `, `₹ 50 Crore` ]

const fiveColumnData12 = [`Annual Turnover, not exceeding` , `₹ 5 Crore` , `₹ 50 Crore `  , ` ` , `₹ 250 Crore`]

starty = renderFiveColumnRow(doc, fiveColumnData10, startx, starty, fiveColumnWidths, cellHeight, borderThickness);
starty=  renderFiveColumnRow(doc , fiveColumnData11 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFiveColumnRow(doc , fiveColumnData12 , startx , starty , fiveColumnWidths , cellHeight , borderThickness)
starty = renderFullWidthBoldCell1(doc, text3, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
starty = renderFullWidthBoldCell1(doc, text4, startx, starty, tableWidth, Height, borderThickness, fontSize, padding ,allignment="left");
// Add footer to the document
addFooter(doc);



doc.addPage();
  drawBorder();
  addLogo(doc);
doc.moveDown(8)

const datatable = [
  { documentName: 'Application Form:',
   documentDetails: `Completed application form duly signed by all applicants, guarantors, and co-applicants (if any)` },
  {
    documentName:'Photograph',
    documentDetails:  `Signed coloured photograph of each applicant(except non-individuals) graph of each applicant (except non-individuals),individual guarantors and co-applicants (if any)`
  },{
    documentName:`Age Proof (For individuals):[Copy of any one of the following]
`,
  documentDetails:`Passport (Not Expired), Pan Card OR Form 60, Voters ID card with complete date of Birth, Driving
License (Not Expired), High School Mark sheet/ Certiicate, LIC policy bond with latest premium paid
receipt (Minimum 12 months in force),
Sr Citizen ID card issued by Govt Body, Birth Certiicate/ Corporation Certiicate (Should have name mentioned on it).
`
  },{
    documentName:`Signature Veriication [Copy of any one of the following](wherever applicable):`,

  documentDetails:` Passport (Not Expired), Pan Card OR Form 60, Driving License (Not Expired), Copy of any cheque
issued in favor of Genesis Securities Pvt Ltd. (Subject to cheque must be cleared), Identity card with
applicants photograph & sign issued by Central/State Government Departments, Original Bankers
Veriication (not older than 30 days)
`
    
  },{

    documentName:`Income Proof*`,
    documentDetails:`  Latest ITR, Latest Form 16, Latest Salary Slip/Certificate, Latest Audited Financials, Bank details with
last 3 months salary
credited, Add- Business Proof-Qualification Certificate/Certificate of Practice (COP), Shop Act
License/MOA & AOA/Sales TaxNat registration/Partnership Deed.`
  },
  {documentName:`Property Document*`,
  documentDetails:`Copy of original sales deed, Allotment possession letter, NOC from society and other documents as per
legal report. The application will be assessed quickly after receiving the required documents.`
  },{
    documentName:`Proof of Identity & Address: (For Individual /Authorized Person)`,
    documentDetails:`Passport (not expired), PAN Card, Voter’s Identity Card issue by Election Commission of India, Driving
License, Proof of Possession of Aadhar (Voluntary), Job Card Issued by NREGA duly signed by office of
State Govt and Letter issued by the
National Population Register containing details of name and address, Ration Card, Bank Statement,
Electricity/Telephone Bill, Sale deed/property purchase agreement (for owned properties)`
  },{
    documentName:`For Trust:
   [Certified copies of each of the following
   documents]`,

    documentDetails:`Registration Certificate, Trust Deed, PAN No. or Form 60 of Trust, * Documents relating to beneficial owner, trustees’ managers, officers or employees as the case may be, holding an attorney to transact on its behalf.
`,
  }
];

createDocumentsRequiredTable(datatable)
addFooter(doc);


// // Add the new page for section 8//

doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8)

const datatables =[
  {
documentName:`For Sole Proprietorship: [Certified copy
of any two* of the following documents
in the name of the proprietary concern]`,
documentDetails:`* Proof of Identity/Address of Individual, Registration Certiicate, Certiicate/licence issued by the municipal authorities under Shop and Establishment Act., Sales and income tax returns, CST/VAT/ GST certiicate (provisional/inal), Certiicate/registration document issued by Sales Tax/Service Tax/Professional Tax authorities, Importer Exporter Code issued by the ofice of DGFT or License/ Certiicate of practice issued in name of the Proprietary concern by professional body incorporated under statute, The complete Income Tax Return in the name of the sole proprietor where the irm’s name and income is relected duly authenticated/acknowledged by the Income Tax Authorities, Utility bills such as electricity, water, and landline telephone bills in the name of the proprietary concern.`

  },
  {
documentName:`For Society Unregistered Partnership Firm:[Certified copy of any two* of the following documents in the name of the proprietary concern]`,
documentDetails:`Board Resolution of the Society/ Firm, PAN or Form 60 of the Society/ Firm, PAN or Form 60 of the
Society/ Firm,
*Documents relating to beneicial owner, ofice bearers, authorised signatories, managers, oficers or
employees, as the case may be, holding an attorney to transact on its behalf, such information as may
be required by the company to collectively establish the legal existence of such an association or body
of individuals.`},{

  documentName:`Note`,
  documentDetails:`1) * Documents relating to beneficial owner, managers, partners, trustees, officers or employees,
authorised signatories, as the case may be, holding an attorney to transact on its behalf: Same list of
documents as for the Individual/ Authorised Person as mentioned above.
2) All the customer documentation to be self-attested. In case of bank statement and inancials irst and
last page needs to be self-attested.
3) The Partnership Deed and the MOA & AOA should be attested stating ‘Certiied that this is duly
Amended & Latest True copy’.
4) All documents to be signed by the customer and OS done by our FTE/Contractual employee/
Genesis Authorized Representative.
5) Driving License - Booklet form is not accepted as KYC document.`
}
]

createDocumentsRequiredTable(datatables)
addFooter(doc);





// Add a new page
doc.addPage();
drawBorder();
addLogo(doc);
doc.moveDown(8);


  function createAadhaarConsentPDF(executants) {
    // Title
    doc.fontSize(10).font('Helvetica-Bold').text('2. MOST IMPORTANT INFORMATION (Aadhaar Consent)', {
      align: 'center'
    });
  
    doc.moveDown(3.5);
  
    // Add the main content
    doc.fontSize(8).font('Helvetica').text(
      `I further confirm that the representative(s) of the Company has informed me that my Aadhaar submitted to the Company herewith shall not be used for any purpose other than as mentioned above, or as may be required under applicable law. The representative(s) of the Company has further informed me that this consent and my Aadhaar will be stored in accordance with the applicable law.\n\n` +
        `I hereby acknowledge and confirm that the representative(s) of the Company, prior to accepting my Aadhaar, has explained in vernacular (the language known to me):`,
      { align: 'justify' }
    );
  
    // Add numbered list
    doc.moveDown(1);
    doc.text(`i) the purpose and the uses of collecting Aadhaar;`);
    doc.moveDown(1);
    doc.text(`ii) the nature of information that may be shared upon offline verification;`);
    doc.moveDown(1);
    doc.text(`iii) other KYC documents that could have been submitted by me instead of Aadhaar (like passport, voter's ID, driving license, etc.).`);
  
    doc.moveDown(1);
    doc.text(
      `I hereby declare that all the information furnished by me is true, correct and complete. I will not hold the Company or any of its officials responsible in case of any incorrect / false information or forged document provided by me.\n\n\n\n` +
        `This Aadhaar Consent has been read, understood, and executed by each Executant in his/her individual capacity in respect of the submission of his/her Aadhaar.`
    );
  
    // Add the footer information
    doc.moveDown(1);
    const date =`${allPerameters.appdate}`;
    const place = `${allPerameters.branchcity}`;
  
    doc.text(`DATE: ${date}`, { align: 'left' });
    doc.text(`PLACE: ${place}`, { align: 'left' });
  
    doc.moveDown(2);
  
    // Add signature table dynamically based on the passed array
    // executants.forEach((executant, index) => {
    //   doc.text(`Name of the Executant(s): ${executant.name}`, { align: 'left' });
    //   doc.text(`Signature: ________________________________`, { align: 'right' });
    //   if (index < executants.length - 1) doc.moveDown(1);
    // });

const docWidth = doc.page.width; // Get the page width
const marginRight = 50; // Set a custom right margin
const textIndent = 10; // Custom right alignment indent





    // Add the signature table
    doc.text(`Name of the Executant(s):`, { align: 'left' });
    doc.text(`Signature:`, { align: 'right' , indent: textIndent});
    doc.moveDown(1.5)
    doc.text(`${allPerameters.borrowerName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.coAppName}`)
    doc.moveDown(1)
    doc.text(`${allPerameters.guaName}`)
   
  
  }


// Example Usage
const executantsArray = [
  { name: `${allPerameters.borrowerName}` },
  { name: `${allPerameters.coAppName}` },
  { name: `${allPerameters.guaName}` },
];

createAadhaarConsentPDF(executantsArray);

  addFooter(doc);
  doc.end();





  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;


  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => resolve(pdfFileUrl));
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}



// make a fucntion that call the growpdf function

async function growApplicantPdf(customerId ,logo,partnerName, ) {
  try {

//     const customerSelections = selections.split(','); // This part is correct
// //  console.log(customerSelections,"customerSelections"); // "acg"
//  console.log(selectionData,"selectionsdatat"); // "acg"
 console.log(logo,"logo"); // "acg"

    // const { customerId } = req.query;
    console.log(partnerName,"partnerName<>>><><><><><>")
    const customerDetails = await customerModel.findOne({ _id: customerId});
    const coApplicantDetails = await coApplicantModel.find({ customerId: new mongoose.Types.ObjectId(customerId) });
    const guarantorDetails = await guarantorModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const applicantDetails = await applicantModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const technicalDetails = await technicalModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const appPdcDetails = await appPdcModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const disbursementDetails = await disbursementModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const gtrPdcDetail= await gtrPdcModel.findOne({ customerId:new mongoose.Types.ObjectId(customerId) });
    const creditPdDetails = await creditPdModel.findOne({customerId})
    const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
    const bankKycsDEtails = await bankDeatilsKycs.findOne({ customerId });
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
        const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
      console.log(customerDetails,"customerDetails")

      const BranchNameId = customerDetails?.branch;
  // console.log("BranchNameId",BranchNameId)
        const branchData = await externalBranchModel.findById({_id:BranchNameId});
        // if (!branchData) {
        //     return badRequest(res, "Branch data not found for the given branchId");
        // }
        // const newBranch = 
        const branchName = branchData?.city; 



      const guarantorAddress =
       guarantorDetails?.[0] ? 
       [
        guarantorDetails[0].permanentAddress?.addressLine1,
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

      const formatAadhaar = (aadhaarNo) => {
        if (!aadhaarNo || aadhaarNo.length !== 12) {
          return "Invalid Aadhaar";
        }
        return "XXXXXXXX" + aadhaarNo.slice(-4);
      };



      const formatDate = (praMANpATRADate) => {
        if (!praMANpATRADate) return "NA"; // Agar DOB available nahi hai to "NA" return karega
        const date = new Date(praMANpATRADate); // Date object me convert kar dega
        const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 sirf digits dega
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
        const year = String(date.getFullYear()).slice(); 
        return `${day}-${month}-${year}`; // Final format
        };

        const endusofloan = finalsanctionDetails?.EndUseOfLoan;
        const purpose = await endUseOfLoanModeldata.findById( endusofloan );
        const loanPurpose = purpose?.name;
      let allParameters = {
        
        date:formatDate(sanctionPendencyDetails?.sanctionDate) || "NA",
        customerNO:sanctionPendencyDetails?.partnerCustomerId|| "NA",

        // customerNO:sanctionPendencyDetails?.partnerLoanNo|| "NA",
           loanAmountRequested: finalsanctionDetails?.finalLoanAmount || "NA",// page no 1
            tenure: finalsanctionDetails?.tenureInMonth || "NA",
            loanPurpose:loanPurpose||"NA",
            sourceType : "NA",

        // applicant details
        appType : applicantDetails?.applicantType || "NA",//page no.1
        buisnessType : applicantDetails?.businessType || "NA",//page no.1

        borrowerName : applicantDetails?.fullName || "NA",//page no.1
        appFather : applicantDetails?.fatherName || "NA",//page no.1
        appMother : applicantDetails?.motherName || "NA",//page no.1
        appMob1 : applicantDetails?.mobileNo || "NA",//page no.1
        appMob2 : applicantDetails?.alternateMobileNo || "NA",//page no.1
        appEmail : applicantDetails?.email || "NA",//page no.1
        appEdu : applicantDetails?.education || "NA",//page no.1
        appDOB : formatDate(applicantDetails?.dob)|| "NA",//page no.1
        appGender : applicantDetails?.gender || "NA",//page no.1
        appMaritalStatus : applicantDetails?.maritalStatus || "NA",//page no.1
        appPan : applicantDetails?.panNo || "NA",//page no.1
        appAdhar : applicantDetails?.aadharNo?formatAadhaar(applicantDetails.aadharNo):"NA",//page no.1
        AppVoterId : applicantDetails?.voterIdNo || "NA",//page no.1

        //   communicationAddress
        appadharadress : address || "NA",
        appCityName : applicantDetails?.localAddress?.city|| "NA",
        appdistrict : applicantDetails?.localAddress?.district|| "NA",
        AppPin : applicantDetails?.localAddress?.pinCode|| "NA",
        AppState : applicantDetails?.localAddress?.state|| "NA",
        AppYearsAtCureentAdress : applicantDetails?.noOfyearsAtCurrentAddress || "NA",
        branchcity:branchName||"NA",
        //coApplicant details
        coAppType :coApplicantDetails?.[0]?.coApplicantType || "NA",

        coAppName : coApplicantDetails?.[0]?.fullName || "NA",//page no.1
        coRelWithApp : coApplicantDetails?.[0]?.relationWithApplicant || "NA",//page no.1
        coAppFather : coApplicantDetails?.[0]?.fatherName || "NA",//page no.1
        coAppMother : coApplicantDetails?.[0]?.motherName || "NA",//page no.1
        coAppMob1 : coApplicantDetails?.[0]?.mobileNo || "NA",//page no.1
        coappMob2 :  coApplicantDetails?.[0]?.alternateMobileNo || "NA",//page no.1
        coAppEmail : coApplicantDetails?.[0]?.email || "NA",//page no.1
        coAppEdu : coApplicantDetails?.[0]?.education || "NA",//page no.1
        coAPPDob : formatDate(coApplicantDetails?.[0]?.dob) || "NA",//page no.1
        coAppGender : coApplicantDetails?.[0]?.gender || "NA",//page no.1
        coAppMarritalStatus : coApplicantDetails?.[0]?.maritalStatus || "NA",//page no.1
        coAppPan :  coApplicantDetails?.[0]?.docType === 'panCard' ? coApplicantDetails?.[0]?.docNo || '':'NA',
        coAPPAdhar : coApplicantDetails?.[0]?.aadharNo  ?formatAadhaar(coApplicantDetails[0].aadharNo):"NA",//page no.1
        coAppvoterId : coApplicantDetails?.[0]?.docType === 'voterId' ? coApplicantDetails?.[0]?.docNo || '':'NA',

        //   communicationAddress
        coAppAdharAdress : coborroweraddress || "NA",
        coAppcity : coApplicantDetails?.[0]?.localAddress?.city|| "NA",
        coAppdistrict : coApplicantDetails?.[0]?.localAddress?.district||"NA",
        coAppPIN : coApplicantDetails?.[0]?.localAddress?.pinCode|| "NA",
        coAppState : coApplicantDetails?.[0]?.localAddress?.state|| "NA",
        coAppcurentAdress : coApplicantDetails?.[0]?.noOfyearsAtCurrentAddress || "NA",

        //coapp2  
        coAppType2 : coApplicantDetails?.[1]?.coApplicantType || "NA",
        coAppbuiType2:coApplicantDetails?.[1]?.businessType || "NA",

        coAppName2 : coApplicantDetails?.[1]?.fullName || "NA",//page no.1
        coRelWithApp2 : coApplicantDetails?.[1]?.relationWithApplicant || "NA",//page no.1
        coAppFather2 : coApplicantDetails?.[1]?.fatherName || "NA",//page no.1
        coAppMother2 : coApplicantDetails?.[1]?.motherName || "NA",//page no.1
        coAppMob12 : coApplicantDetails?.[1]?.mobileNo || "NA",//page no.1
        coappMob22:  coApplicantDetails?.[1]?.alternateMobileNo || "NA",//page no.1

        corelwithApp2:coApplicantDetails?.[1]?.relationWithApplicant || "NA",

        // appMob2 : coApplicantDetails?.mobileNo || "NA",//page no.1
        coAppEmail2 : coApplicantDetails?.[1]?.email || "NA",//page no.1
        coAppEdu2 : coApplicantDetails?.[1]?.education || "NA",//page no.1
        coAPPDob2 : formatDate(coApplicantDetails?.[1]?.dob) || "NA",//page no.1
        coAppGender2 : coApplicantDetails?.[1]?.gender || "NA",//page no.1
        coAppMarritalStatus2 : coApplicantDetails?.[1]?.maritalStatus || "NA",//page no.1
        // coAppPan2 : coApplicantDetails?.[1]?.panNo || "NA",//page no.1
        coAppPan2 : coApplicantDetails?.[1]?.docType === 'panCard' ? coApplicantDetails?.[1]?.docNo || '':'NA',


        coAPPAdhar2 : coApplicantDetails?.[1]?.aadharNo  ?formatAadhaar(coApplicantDetails[1].aadharNo):"NA",
        coAppvoterId2 : coApplicantDetails?.[1]?.docType === 'voterId' ? coApplicantDetails?.[1]?.docNo || '':'NA',
        coAppreligion2:coApplicantDetails?.[1]?.religion || "NA",
       //  coAppNationality2:creditPdDetails?.co_Applicant?.[1]?.nationality || "NA",
       coAppNationality2: "Indian",

        coAppCategory2:coApplicantDetails?.[1]?.category || "NA",
        coAppNoOfDependentd2:"NA", 
        coAppUdhyamAaadharNo2:"NA",

        //   communicationAddress
        coAppAdharAdress2 :coApplicantDetails?.[1]?.localAddress?.addressLine1|| "NA",
        coAppcity2 : coApplicantDetails?.[1]?.localAddress?.city|| "NA",
        coAppdistrict2 : coApplicantDetails?.[1]?.localAddress?.district|| "NA",
        coAppPIN2 : coApplicantDetails?.[1]?.localAddress?.pinCode|| "NA",
        coAppState2 : coApplicantDetails?.[1]?.localAddress?.state|| "NA",
        coAppcurentAdress2 : coApplicantDetails?.[1]?.noOfyearsAtCurrentAddress || "NA",
        coappLandMark2:coApplicantDetails?.[1]?.houseLandMark || "NA",
        coAppCountry2:"India",
        coAppNoOfYearsATCurrentAddress2:coApplicantDetails?.[1]?.noOfyearsAtCurrentAddress || "NA",


      //   coBorrowername: coApplicantDetails?.[0]?.fullName || "NA",
      //   constitutionCoBorrower:"INDIVIDUAL",
      //   panTanCin : coApplicantDetails?.docNo || "NA",
      // coBorroweraddress: coborroweraddress,
      // coBorroeremail: coApplicantDetails?.[0]?.email || "NA",
      // coBorrowerphoneNo: coApplicantDetails?.[0]?.mobileNo || "NA",
 
      //guarantor details

      guaType : guarantorDetails?.guarantorType || "NA",

      guaName : guarantorDetails?.fullName || "NA",//page no.1
      guaRelWithApplicant : guarantorDetails?.relationWithApplicant || "NA",//page no.1
      guaFather : guarantorDetails?.fatherName || "NA",//page no.1
      guaMother : guarantorDetails?.motherName || "NA",//page no.1
      guaMobile : guarantorDetails?.mobileNo || "NA",//page no.1
      guaMobileNo2 : guarantorDetails?.alternateMobileNo|| "NA",
      guaEmail : guarantorDetails?.email || "NA",//page no.1
      guaEdu : guarantorDetails?.education || "NA",//page no.1
      guaDob : formatDate(guarantorDetails?.dob) || "NA",//page no.1
      guaGender : guarantorDetails?.gender || "NA",//page no.1
      guaMaritialStatus : guarantorDetails?.maritalStatus || "NA",//page no.1
      guaPan : guarantorDetails?.docType === 'panCard' ? guarantorDetails?.docNo || '':'NA',

      guaAdhar : guarantorDetails?.aadharNo ? formatAadhaar(guarantorDetails.aadharNo):"NA",//page no.1
      guaVoterId : guarantorDetails?.docType === 'voterId' ? guarantorDetails?.docNo || '':'NA',

        //   communicationAddress
        guaAdressAdhar :guarantorDetails?.localAddress?.addressLine1|| "NA",
        guaCity : guarantorDetails?.localAddress?.city|| "NA",
        guaDist : guarantorDetails?.localAddress?.district|| "NA",
        guaPin : guarantorDetails?.localAddress?.pinCode|| "NA",
        guaState : guarantorDetails?.localAddress?.state|| "NA",
        guaYearsCurrentAddress : guarantorDetails?.localAddress?.years || "NA",


        //colletral Address
        technicalFullADDRESS : technicalDetails?.fullAddressOfProperty || "NA",
        

        //bank Details

        // bankName : creditPdDetails?.bankDetail?.nameOfBank|| "NA",
        // branchName : creditPdDetails?.bankDetail?.branchName|| "NA",
        // accNo : creditPdDetails?.bankDetail?.accountNo|| "NA",
        // accType : creditPdDetails?.bankDetail?.accountType|| "NA",
        // ifscCode : creditPdDetails?.bankDetail?.IFSCCode || "NA",


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

        // appdate : customerDetails.createdAt
        // ? `${customerDetails.createdAt.getDate()}-${customerDetails.createdAt.getMonth() + 1}-${customerDetails.createdAt.getFullYear()}`: "NA",

        appdate : formatDate(sanctionPendencyDetails?.sanctionDate) || "NA",
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
    
        let selectionData = partnerData?.pdfSelection || "acg";
if (selectionData && typeof selectionData === "string") {
selectionData = selectionData.toLowerCase();
}
          console.log(selectionData,"selectionDataff")
        
        // Generate PDF with skipped pages
        // if (selections === "acg") {
        //   const pdfPath = await growpdf1(allParameters,logo);
        //   console.log(pdfPath, "growpdf1");
        //   return pdfPath;
        // }
    
        // if (selections === "accg") {
        //   const pdfPath = await growpdf(allParameters,logo);
        //   console.log(pdfPath, "growpdf");
        //   return pdfPath;
        // }
    
        // if (selections === "acc") {
        //   const pdfPath = await growpdf2(allParameters,logo);
        //   console.log(pdfPath, "growpdf2");
        //   return pdfPath;
        // }
    
        // if (selections === "ac") {
        //   const pdfPath = await growpdf3(allParameters,logo);
        //   console.log(pdfPath, "growpdf3");
        //   return pdfPath;
        // }
        let pdfPath = ""; // Initialize pdfPath to avoid undefined errors

    if (selectionData === "acg") 
    {
       pdfPath = await growpdf1(allParameters,logo,partnerName);
            console.log(pdfPath, "applicant");
    } 
    else if (selectionData === "accg") 
    {
       pdfPath = await growpdf(allParameters,logo,partnerName);
      console.log(pdfPath, "coapplicant");
    } 
    else if (selectionData === "acc")
    {
       pdfPath = await growpdf2(allParameters,logo,partnerName);
      console.log(pdfPath, "gaurantor");
    }
     else if (selectionData === "ac")
   {
      pdfPath = await growpdf3(allParameters,logo,partnerName);
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
   
          const uploadResponse = await uploadPDFToBucket(pdfPath, `GrowMoneyApplicant${Date.now()}.pdf`);
          const url = uploadResponse.url
          console.log(url,"url")     

          await finalsanctionModel.findOneAndUpdate(
            { customerId }, // Query to find the specific customer document
            {
              $set: { "growMoneyPdfUrls.growApplicantPdf": url } // Dot notation for nested update
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
    // res.status(500).send("Internal Server Error");
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

module.exports = {growApplicantPdf };
