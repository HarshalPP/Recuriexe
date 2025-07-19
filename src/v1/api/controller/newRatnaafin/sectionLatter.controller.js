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
  const pdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png"
);
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
const bankDeatilsKycs = require('../../model/branchPendency/bankStatementKyc.model');
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js"); 
const endUseOfLoanModeldata = require('../../model/endUseOfLoan.model.js');




const { initESign } = require('../../services/legality.services.js');
const { calculateLoanAmortization } = require("../../services/amotization.services.js");


// Helper function to capitalize the first letter of each word in a name
function capitalizeFirstLetter(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function ratannaFinSanctionLetterPdf(allPerameters) {

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
    // doc.moveDown(-5)
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 400, 9, {
        fit: [160, 140],
        align: "right",
        valign: "bottom",
      });
    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
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

  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir, { recursive: true });
  // }

  const timestamp = Date.now();
  // const pdfFilename = `ratnafinSanctionLatter.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);

  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

  // doc.pipe(stream);

  // Add logo and border to the first page
  addLogo();
  drawBorder();
  doc.moveDown(5);
  
    doc
    .fontSize(9)
    .font(fontBold)
    .text("PRIVATE AND CONFIDENTIAL", { align: "center", underline: true });
  doc.moveDown(2);

  const startX = 50; // Set a left margin
  const startY = doc.y; // Get the current Y position
  doc
    .fontSize(7)
    .font('Helvetica')
    .text(`Sanction Letter No.:-${allPerameters.pENDENCYlOANnumber}`, startX, doc.y, { align: "left", x: 50 }) // Adjusting x to align left
    .text(`Date: ${allPerameters.sanctionpendencyDate}`, { align: "right", x: 450 })
    .moveDown(1);
  
  doc
    .font(fontBold)
    .fontSize(8)
    .text(`CUSTOMER NAME:${allPerameters.customerName}`, startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
  
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(`address:${allPerameters.address}`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
  
  doc
    .font(fontBold)
    .fontSize(8)
    .text(`K/A: ${allPerameters.KAndA}`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
  
  doc
    .font('Helvetica')
    .fontSize(8)
    .text(`(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\nWith reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\nYour loan account details and the loan repayment schedule are attached herewith for your reference.`, { align: "left", x: 50 })
    .moveDown(1);
  
  // Define table drawing function with left alignment adjustments
  // function drawTable(tableData) {
  //     const startX = 50; // Adjusting startX for left alignment
  //     let startY = doc.y + 10;
  //     const columnWidths = [500];
    
  //     const keyWidth = Math.round((columnWidths[0] * 1) / 2);
  //     const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    
  //     tableData.forEach((row, rowIndex) => {
  //         let rowHeight = 15;
  
  //         const field1TextHeight = doc
  //             .font(font)
  //             .fontSize(7.2)
  //             .heightOfString(row.field1, { width: keyWidth });
          
  //         let value1TextHeight = 0;
  //         if (row.value1) {
  //             value1TextHeight = doc
  //                 .font(font)
  //                 .fontSize(7.2)
  //                 .heightOfString(row.value1, { width: valueWidth });
  //         }
  
  //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
  //         if (!row.value1) {
  //             doc
  //                 .fillColor("blue")
  //                 .rect(startX, startY, columnWidths[0], rowHeight)
  //                 .stroke("black")
  //                 .fill();
  
  //             doc
  //                 .font(font)
  //                 .fillColor("black")
  //                 .fontSize(7.2)
  //                 .text(row.field1, startX + 5, startY + 5, {
  //                     baseline: "hanging",
  //                     width: columnWidths[0],
  //                 });
  //         } else {
  //             doc.lineWidth(0.5);
  //             doc
  //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //                 .rect(startX, startY, keyWidth, rowHeight)
  //                 .stroke("black")
  //                 .fill();
  
  //             doc
  //                 .font(font)
  //                 .fillColor("black")
  //                 .fontSize(7.2)
  //                 .text(row.field1, startX + 5, startY + 5, {
  //                     baseline: "hanging",
  //                     width: keyWidth,
  //                 });
  
  //             doc
  //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //                 .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //                 .stroke()
  //                 .fill();
  
  //             doc
  //                 .font(font)
  //                 .fillColor("black")
  //                 .fontSize(7.2)
  //                 .text(row.value1, startX + keyWidth + 5, startY + 5, {
  //                     baseline: "hanging",
  //                     width: valueWidth,
  //                 });
  //         }
  //         startY += rowHeight;
  //     });
  // }
  function drawTable(tableData) {
    const startX = 50; // Adjusting startX for left alignment
    let startY = doc.y + 10;
    const columnWidths = [500];
  
    const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    const valueWidth = Math.round((columnWidths[0] * 1) / 2);
  
    tableData.forEach((row, rowIndex) => {
      let rowHeight = 15;
  
      // Calculate text height for dynamic row size
      const field1TextHeight = doc
        .font(font)
        .fontSize(7.2)
        .heightOfString(row.field1, { width: keyWidth });
  
      let value1TextHeight = 0;
      if (row.value1) {
        value1TextHeight = doc
          .font(font)
          .fontSize(7.2)
          .heightOfString(row.value1, { width: valueWidth });
      }
  
      rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
      // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
      const isSpecialRow =
        row.field1.toUpperCase() === "CHARGES" ||
        row.field1.toUpperCase() === "NEW LOAN DETAILS";
  
      // Row background and border for special rows
      if (isSpecialRow) {
        doc
          .fillColor("#00BFFF") // Background color
          .rect(startX, startY, columnWidths[0], rowHeight)
          .fill()
          .stroke("black", 0.5); // Thin border
  
        doc
          .font(font)
          .fillColor("black") // Text color
          .fontSize(7.2)
          .text(row.field1, startX + 5, startY + 5, {
            baseline: "hanging",
            width: columnWidths[0],
          });
      } else {
        // Normal rows
        doc.lineWidth(0.5); // Thin border for regular rows
  
        // Key Column
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX, startY, keyWidth, rowHeight)
          .stroke("black")
          .fill();
  
        doc
          .font(font)
          .fillColor("black")
          .fontSize(7.2)
          .text(row.field1, startX + 5, startY + 5, {
            baseline: "hanging",
            width: keyWidth,
          });
  
        // Value Column
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX + keyWidth, startY, valueWidth, rowHeight)
          .stroke("black")
          .fill();
  
        doc
          .font(font)
          .fillColor("black")
          .fontSize(7.2)
          .text(row.value1, startX + keyWidth + 5, startY + 5, {
            baseline: "hanging",
            width: valueWidth,
          });
      }
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
      
    const loanTableData = [
      { field1: "NEW LOAN DETAILS" },
      { field1: "Customer ID", value1: `${allPerameters.customerID}` },
      { field1: "Loan Borrower name", value1: `${allPerameters.loanBorrowerName}` },
      { field1: "Loan Co-borrower name", value1: `${allPerameters.loanCoborrowerName}` },
      { field1: "Loan Co-borrower name-2", value1: `${allPerameters.loanCoborrowerNameTwo}` },
      { field1: "Loan Guarantor name", value1: `${allPerameters.loanGuarantorName}` },
      { field1: "Product", value1: `${allPerameters.product}` },
      { field1: "Loan Amount", value1: `${allPerameters.loanAmount}/-${allPerameters.loanAmountinwords}` },
      { field1: "Description of Collateral Property", value1: `As per Annexure I
` },
      // { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
      {
        field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}`,
      },
      {
        field1: "Purpose of Loan ", value1: `${allPerameters.PURPOSEoFlOAN}`,
      },
      {
        field1: "Tenure", value1: `${allPerameters.tenureinMonths} months`,
      },
      {
        field1: "Interest Rate",
        value1: `${allPerameters.interestRate} %`,
      },
      {
        field1: "Interest Type",
        value1:
          `Linked to Floating Reference Rate (FRR – 19.20% + ${allPerameters.interestType}%)`,
      },
      {
        field1: "EMI Amount",
        value1:
          `Rs ${allPerameters.emiAmount} for a period of ${allPerameters.tenureinMonths} months`,
      },
      { field1: "Penal charges", value1: `${allPerameters.penalCharges}` },
      {
        field1:"Prepayment Charges",
        value1: `No prepayment allowed till completion of 12 months from the date of 1st\n disbursement. After completion of 12 months from the date of 1st disburseme\n-nt, prepayment from personal funds may be made without incurring any fees.\n In case of balance transfer, 4% charges will be applicable.`,
      },
      { field1: "DSRA", value1: `${allPerameters.DSRA}` },
      {
        field1: "EMI Payment Bank ",
        value1:
         `${allPerameters.emiPaymentBank}`,
      },
      { field1: "EMI Payment Bank A/c Number", value1: `${allPerameters.emiaccNumber}` },
      {
        field1: "Mode of Payment ",
        value1:
          `${allPerameters.modeOfPayment}`,
      },
     
    ];
    drawTable(loanTableData);
    // addFooter()

    //-------------------------------------- new page 2-------------------------------------------------------
  
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(5);
    // function drawTable1(tableData) {
    //   const startX = 50; // Adjusting startX for left alignment
    //   let startY = doc.y + 10;
    //   const columnWidths = [500];
    
    //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    
    //   tableData.forEach((row, rowIndex) => {
    //     let rowHeight = 15;
    
    //     // Calculate text height for dynamic row size
    //     const field1TextHeight = doc
    //       .font(font)
    //       .fontSize(7.2)
    //       .heightOfString(row.field1, { width: keyWidth });
    
    //     let value1TextHeight = 0;
    //     if (row.value1) {
    //       value1TextHeight = doc
    //         .font(font)
    //         .fontSize(7.2)
    //         .heightOfString(row.value1, { width: valueWidth });
    //     }
    
    //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //     // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
    //     const isSpecialRow =
    //       row.field1.toUpperCase() === "CHARGES" ||
    //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
    
    //     // Row background and border for special rows
    //     if (isSpecialRow) {
    //       doc
    //         .fillColor("#00BFFF") // Background color
    //         .rect(startX, startY, columnWidths[0], rowHeight)
    //         .fill()
    //         .stroke("black", 0.5); // Thin border
    
    //       doc
    //         .font(font)
    //         .fillColor("black") // Text color
    //         .fontSize(7.2)
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidths[0],
    //         });
    //     } else {
    //       // Normal rows
    //       doc.lineWidth(0.5); // Thin border for regular rows
    
    //       // Key Column
    //       doc
    //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //         .rect(startX, startY, keyWidth, rowHeight)
    //         .stroke("black")
    //         .fill();
    
    //       doc
    //         .font(font)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: keyWidth,
    //         });
    
    //       // Value Column
    //       doc
    //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //         .stroke("black")
    //         .fill();
    
    //       doc
    //         .font(font)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: valueWidth,
    //         });
    //     }
    
    //     // Move to the next row
    //     startY += rowHeight;
    //   });
    // }

    function drawTable1(tableData) {
      const startX = 50; // Adjusting startX for left alignment
      let startY = doc.y + 10;
      const columnWidths = [500]; // Full table width
    
      const keyWidth = Math.round((columnWidths[0] * 1) / 2);
      const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    
      tableData.forEach((row, rowIndex) => {
        let rowHeight = 15;
    
        // Calculate text height for dynamic row size
        const field1TextHeight = doc
          .font(font)
          .fontSize(7.2)
          .heightOfString(row.field1, { width: keyWidth });
    
        let value1TextHeight = 0;
        if (row.value1) {
          value1TextHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.value1, { width: valueWidth });
        }
    
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
        // Check if the row is "CHARGES"
        const isChargesRow = row.field1.toUpperCase() === "CHARGES";
    
        // Check if the row is "ADDITIONAL FINANCIAL PRODUCTS"
        const isAdditionalProductsRow =
          row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
    
        if (isChargesRow) {
          // "CHARGES" row with blue background and thin border
          doc
            .fillColor("#00BFFF") // Blue background
            .rect(startX, startY, columnWidths[0], rowHeight)
            .fill()
            .stroke("black", 0.5); // Thin black border
    
          doc
            .font(font)
            .fillColor("black") // Text color
            .fontSize(8.5) // Slightly larger font for bold rows
            .font("Helvetica-Bold") // Bold font
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: columnWidths[0],
              align: "left",
            });
        } else if (isAdditionalProductsRow) {
          // "ADDITIONAL FINANCIAL PRODUCTS" row with no background, bold font, and border
          doc
            .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
            .stroke("black");
    
          doc
            .font(font)
            .fillColor("black") // Text color
            .fontSize(8.5) // Slightly larger font for bold rows
            .font("Helvetica-Bold") // Bold font
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: columnWidths[0],
              align: "left",
            });
        } else {
          // Normal rows with two columns
          doc.lineWidth(0.5); // Thin border for regular rows
    
          // Key Column
          doc
            .rect(startX, startY, keyWidth, rowHeight)
            .stroke("black"); // Border for key column
    
          doc
            .font(font)
            .fontSize(7.2)
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: keyWidth,
            });
    
          // Value Column
          doc
            .rect(startX + keyWidth, startY, valueWidth, rowHeight)
            .stroke("black"); // Border for value column
    
          doc
            .font(font)
            .fontSize(7.2)
            .text(row.value1, startX + keyWidth + 5, startY + 5, {
              baseline: "hanging",
              width: valueWidth,
            });
        }
    
        // Move to the next row
        startY += rowHeight;
      });
    }
    

    // function drawTable1(tableData) {
    //   const startX = 50; // Adjusting startX for left alignment
    //   let startY = doc.y + 10;
    //   const columnWidths = [500]; // Full table width
    
    //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    
    //   tableData.forEach((row, rowIndex) => {
    //     let rowHeight = 15;
    
    //     // Calculate text height for dynamic row size
    //     const field1TextHeight = doc
    //       .font(font)
    //       .fontSize(7.2)
    //       .heightOfString(row.field1, { width: keyWidth });
    
    //     let value1TextHeight = 0;
    //     if (row.value1) {
    //       value1TextHeight = doc
    //         .font(font)
    //         .fontSize(7.2)
    //         .heightOfString(row.value1, { width: valueWidth });
    //     }
    
    //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //     // Check for "CHARGES" or "NEW LOAN DETAILS" row
    //     const isSpecialRow =
    //       row.field1.toUpperCase() === "CHARGES" ||
    //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
    
    //     // Check for "ADDITIONAL FINANCIAL PRODUCTS" row
    //     const isAdditionalProductsRow =
    //       row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
    
    //     if (isSpecialRow || isAdditionalProductsRow) {
    //       // Special rows with a bold title
    //       doc
    //         .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
    //         .stroke("black");
    
    //       doc
    //         .font(font)
    //         .fontSize(8.5) // Slightly larger font for bold rows
    //         .font("Helvetica-Bold") // Bold font for special rows
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidths[0],
    //           align: "left", // Align text to the left
    //         });
    //     } else {
    //       // Normal rows with two columns
    //       doc.lineWidth(0.5); // Thin border for regular rows
    
    //       // Key Column
    //       doc
    //         .rect(startX, startY, keyWidth, rowHeight)
    //         .stroke("black"); // Border for key column
    
    //       doc
    //         .font(font)
    //         .fontSize(7.2)
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: keyWidth,
    //         });
    
    //       // Value Column
    //       doc
    //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //         .stroke("black"); // Border for value column
    
    //       doc
    //         .font(font)
    //         .fontSize(7.2)
    //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: valueWidth,
    //         });
    //     }
    
    //     // Move to the next row
    //     startY += rowHeight;
    //   });
    // }
    
    

    const loanSecondTable = [
      {
        field1: "CHARGES" },
      {
        field1:
          "Login Fees",
        value1:
          `${allPerameters.loginFees}`,
      },
      {
        field1:
          "Non-refundable Processing Fee",
        value1:
         `${allPerameters.nonRefundableProcessingFee}`,
      },
      {
        field1:
          "Documentation Charges",  value1:`${allPerameters.documentationCharges}`,
      },
      {
        field1:
          "Stamp duty charges",
        value1:
          `${allPerameters.stampDutyCharges}`,
      },
      {
        field1:
          "ADDITIONAL FINANCIAL PRODUCTS",
      },
      {
        field1:
          "Life Insurance Premium for Individual **",
          value1:
         `${allPerameters.lifeInsurancePremiumForIndividual}`,
      },
      {
        field1:
          "Insurance Premium for Collateral Security",
          value1:
          `${allPerameters.insurancePremiumForCollateralSecurity}`,
      },
    ]
    drawTable1(loanSecondTable);

    doc.moveDown(3);

    doc
    .font('Helvetica')
    .fontSize(8)
    .text(`[The net disbursal amount credited to your account = Loan amount – Charges and fees (additional financial products mentioned above).]\n\n *Broken period interest is charged on the loan amount from the date of disbursement to the date of EMI commencement.\n\n **Any pre-existing disease/ailments/surgeries undergone in the past need to be declared at the time of insurance acceptance otherwise the insurance claim will be repudiated.\n\nDSRA taken at the time of disbursement cannot be adjusted to POS for foreclosure. \n\nFor Disbursement done on or before the 10th of month, EMI Start date would be 10th of the following month.\n\n However, for all the Disbursements happening after 10th of the Particular Month will have EMI Start date as 10th of the month next to the following month.`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1.5);

    doc
    .font('Helvetica')
    .fontSize(8)
    .text(`Lock In period: The Borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount either in part or in full till the completion of 12 months of loan tenure from the 1st date of disbursement.
      
    The Lender may in its sole discretion Prospecvely increase / decrease / change the spread suitably in the event of unforeseen or
     exceponal or  exceptional changes in the money market condition taking place or occurrence of an increase cost situation.

All payments to be made by the Borrower to the Lender shall be made free and clear of and without any deduction for on account of any
taxes. If the Borrower is required to make such deduction, then, in such case, the sum payable to the Lender shall be increased to the
extent necessary to ensure that, aer making such deduction, the Lender receives a sum equal to the sum which it would have received had
such deduction not been made or required to be made. The Borrower shall submit the relevant tax deduction to the taxing authorities and 
deliver to the Lender evidence reasonably satisfactory to the Lender that the tax deduction has been made (as applicable) and appropriate
payment is paid to the relevant taxing authorities and the Lender shall there after repay such applicable tax amount to the Borrower.
`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1.5);

    doc
    .font('Helvetica')
    .fontSize(8)
    .text(`Advance Notice of 30 working days is Must before any prepayment/Part payment post lock in period\n\n Validity of Sanction letter is up to 3 months from the date of sanction.`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1.5);

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Email Address & Contact Nos to be used for customer service / for assistance required post disbursement: pna.ops@ratnaafin.com, (M) +91 9512011220`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Special Terms & Conditions: Pre-disbursement Conditions`,startX, doc.y, { align: "center", x: 50 })
    .moveDown(1);


  //   function latterTableFunction(tableData) {
  //     // Add Table Header
  //     const startX = 50;
  //     let startY = doc.y + 10;
  //     const totalWidth = 500; // Total column width
  //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
  //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  
  //     tableData.forEach((row, rowIndex) => {
  //         // Set default row height
  //         let rowHeight = 15;
  
  //         // Calculate the height of the text for field1 with word wrapping
  //         const field1TextHeight = doc
  //             .font(font)
  //             .fontSize(7.2)
  //             .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
  
  //         // Calculate the height of the text for value1 with word wrapping if it exists
  //         let value1TextHeight = 0;
  //         if (row.value1) {
  //             value1TextHeight = doc
  //                 .font(font)
  //                 .fontSize(7.2)
  //                 .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
  //         }
  
  //         // Determine the maximum height between field1 and value1 to set row height
  //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
  //         // Alternate row background color
  //         doc.lineWidth(0.5);
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX, startY, keyWidth, rowHeight)
  //             .stroke("black")
  //             .fill();
  
  //         // Draw text in field1 cell with word wrapping
  //         doc
  //             .font(font)
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(row.field1, startX + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: keyWidth,
  //                 height: rowHeight - 10, // Adjust the height so the text stays inside
  //                 align: "left",
  //                 wordBreak: 'break-word'  // Enable word wrapping for field1
  //             });
  
  //         // Draw the second column, even if value1 is absent
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //             .stroke()
  //             .fill();
  
  //         // Draw the `value1` text with word wrapping if present
  //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
  //         doc
  //             .font(font)
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: valueWidth,
  //                 height: rowHeight - 10, // Adjust the height so the text stays inside
  //                 align: "left",
  //                 wordBreak: 'break-word'  // Enable word wrapping for value1
  //             });
  
  //         // Draw vertical line between the columns
  //         doc.lineWidth(0.5);
  //         doc.strokeColor("black");
  //         doc.moveTo(startX + keyWidth, startY);
  //         doc.lineTo(startX + keyWidth, startY + rowHeight);
  //         doc.stroke();
  
  //         // Move to the next row position
  //         startY += rowHeight;
  //     });
  // }

  function latterTableFunction(tableData) { 
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total column width
    const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
    const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

    tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;

        // Calculate the height of the text for field1 with word wrapping
        const field1TextHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });

        // Calculate the height of the text for value1 with word wrapping if it exists
        let value1TextHeight = 0;
        if (row.value1) {
            value1TextHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
        }

        // Determine the maximum height between field1 and value1 to set row height
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

        // Check if field1 contains "S. No" (case-insensitive)
        const isSpecialRow = row.field1.toUpperCase().includes("S. NO");

        // Apply special row styling
        if (isSpecialRow) {
            doc
                .fillColor("#00BFFF") // Background color for "S. No" rows
                .rect(startX, startY, totalWidth, rowHeight)
                .fill()
                .stroke("black", 0.5); // Thin border

            // Draw text in field1 cell with special styling
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: keyWidth,
                    height: rowHeight - 10, // Adjust the height so the text stays inside
                    align: "left",
                    wordBreak: 'break-word' // Enable word wrapping for field1
                });

            const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                    baseline: "hanging",
                    width: valueWidth,
                    height: rowHeight - 10, // Adjust the height so the text stays inside
                    align: "left",
                    wordBreak: 'break-word' // Enable word wrapping for value1
                });
        } else {
            // Alternate row background color for non-"S. No" rows
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();

            // Draw text in field1 cell
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: keyWidth,
                    height: rowHeight - 10, // Adjust the height so the text stays inside
                    align: "left",
                    wordBreak: 'break-word' // Enable word wrapping for field1
                });

            // Draw the second column, even if value1 is absent
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();

            // Draw text in value1 cell
            const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                    baseline: "hanging",
                    width: valueWidth,
                    height: rowHeight - 10, // Adjust the height so the text stays inside
                    align: "left",
                    wordBreak: 'break-word' // Enable word wrapping for value1
                });
        }

        // Draw vertical line between the columns
        doc.lineWidth(0.5);
        doc.strokeColor("black");
        doc.moveTo(startX + keyWidth, startY);
        doc.lineTo(startX + keyWidth, startY + rowHeight);
        doc.stroke();

        // Move to the next row position
        startY += rowHeight;
    });
}

  const  PreDisbursementTablee = [
    { field1: "S. NO", value1: `Pre-disbursement Terms and Conditions` },
    { field1: "1", value1: `${allPerameters.specialTermsConditionOne}` },
    { field1: "2", value1: `5 PDCs of borrower and 2 PDC of Financial Guarantor / Third Party Gurantors are to be submitted at the time of disbursement.` },
    { field1: "3", value1: `Life insurance of the key earning member is mandatory` },
    { field1: "4", value1: `Original documents to be vetted by RCPL empanelled Vendor` },
    { field1: "5", value1: `Registered mortgage deed to be executed in favor of Ratnaafin Capital Private Limited.` },
    { field1: "6", value1: `Registered Mortgage in Favour of RCPL to be created on property.` },
    { field1: "7", value1: `No single property will be released. Complete loan to be foreclosed for release of any property under mortgage.` },
    // { field1: "8", value1: `Hypothecation on machinery to be done.` },
    // { field1: "9", value1: `Prepayment of 20% of principal outstanding can be done post one year of disbursement.` },
  ];
  
  latterTableFunction(PreDisbursementTablee);


    // addFooter()

//     //-------------------------------------- new page 3-------------------------------------------------------------
   
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(9);
    
   

  doc
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(` For,\n Ratnaafin Capital Private Limited\n\n Authorised Signatory\n\n\n\n\n Sanction Letter Acceptance\n\n\n I/We have read the terms and conditions mentioned in the sanction letter and accept the Same.\n\n\n Signature/thumb impression: - `,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1);


//   function thumbImpressionTableFunction(tableData) {
//     // Add Table Header
//     const startX = 50;
//     let startY = doc.y + 10;
//     const totalWidth = 500; // Total column width
//     const keyWidth = Math.round(totalWidth * 0.4); // Increase field1 width to 40% of the total width
//     const valueWidth = totalWidth - keyWidth; // Remaining width for the value1 column

//     tableData.forEach((row, rowIndex) => {
//         // Set default row height and add extra space for readability
//         let rowHeight = 40; // further increased default row height

//         // Calculate the height of the text for field1 and value1
//         const field1TextHeight = doc
//             .font(fontBold) // Bold font for field1
//             .fontSize(7.2)
//             .heightOfString(row.field1, { width: keyWidth });

//         let value1TextHeight = 0;
//         if (row.value1) {
//             value1TextHeight = doc
//                 .font(fontBold) // Bold font if value1 is "SIGNATURE"
//                 .fontSize(7.2)
//                 .heightOfString(row.value1, { width: valueWidth });
//         }

//         // Determine the maximum height between field1 and value1 to set row height
//         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 25 // more padding for increased row height

//         // Alternate row background color
//         doc.lineWidth(0.5);
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX, startY, keyWidth, rowHeight)
//             .stroke("black")
//             .fill();

//         // Draw bold text in field1 cell
//         doc
//             .font(fontBold)
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(row.field1, startX + 5, startY + 15, { // increased vertical padding
//                 baseline: "hanging",
//                 width: keyWidth,
//             });

//         // Draw the second column, even if value1 is absent
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
//             .stroke()
//             .fill();

//         // Draw bold text for the `value1` if it contains "SIGNATURE"
//         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
//         doc
//             .font(row.value1 === "SIGNATURE" ? fontBold : font) // Use bold if value is "SIGNATURE"
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(keyValueText, startX + keyWidth + 5, startY + 10, { // increased vertical padding
//                 baseline: "hanging",
//                 width: valueWidth,
//             });

//         // Draw vertical line between the columns
//         doc.lineWidth(0.5);
//         doc.strokeColor("black");
//         doc.moveTo(startX + keyWidth, startY);
//         doc.lineTo(startX + keyWidth, startY + rowHeight);
//         doc.stroke();

//         // Move to the next row position
//         startY += rowHeight;
//     });
// }


  // const  thumbImpressionTable = [
  //   { field1: "NAME", value1: `SIGNATURE` },
  //   { field1: `BORROWERS NAME : ${allPerameters.borrowersName}`, value1: `` },
  //   { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowersName}`, value1: `` },
  //   { field1: `CO-BORROWERS NAME-2 : ${allPerameters.coBorrowersNameTwo}`, value1: `` },
  //   { field1: `GUARANTORS NAME : ${allPerameters.guarantorsName}`, value1: `` },
  // ];

  doc
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(`BORROWERS NAME : ${allPerameters.borrowersName}`,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1)
  doc
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(`CO-BORROWERS NAME : ${allPerameters.coBorrowersName} `,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1)
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(`CO-BORROWERS NAME-2 : : ${allPerameters.coBorrowersNameTwo} `,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1)
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(`GUARANTORS NAME : ${allPerameters.guarantorsName} `,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1);
  
  // thumbImpressionTableFunction(thumbImpressionTable);
doc.moveDown(6)
  doc
  .font('Helvetica-Bold')
  .fontSize(8)
  .text(`Annexure I: Security Details`,startX, doc.y, { align: "left", x: 50 })
  .moveDown(1);

//   function securityDetailsTableFunction(tableData) {
//     // Add Table Header
//     const startX = 50;
//     let startY = doc.y + 10;
//     const totalWidth = 500; // Total column width
//     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
//     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

//     tableData.forEach((row, rowIndex) => {
//         // Set default row height
//         let rowHeight = 15;

//         // Calculate the height of the text for field1 and value1
//         const field1TextHeight = doc
//             .font(fontBold) // Use bold font for field1
//             .fontSize(7.2)
//             .heightOfString(row.field1, { width: keyWidth });

//         let value1TextHeight = 0;
//         if (row.value1) {
//             value1TextHeight = doc
//                 .font(font) // Use regular font for value1
//                 .fontSize(7.2)
//                 .heightOfString(row.value1, { width: valueWidth });
//         }

//         // Determine the maximum height between field1 and value1 to set row height
//         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

//         // Alternate row background color
//         doc.lineWidth(0.5);
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX, startY, keyWidth, rowHeight)
//             .stroke("black")
//             .fill();

//         // Draw bold text in field1 cell
//         doc
//             .font(fontBold) // Set font to bold
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(row.field1, startX + 5, startY + 5, {
//                 baseline: "hanging",
//                 width: keyWidth,
//             });

//         // Draw the second column, even if value1 is absent
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
//             .stroke()
//             .fill();

//         // Draw only the `value1` text without any prefix
//         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
//         doc
//             .font(font) // Use regular font for value1
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
//                 baseline: "hanging",
//                 width: valueWidth,
//             });

//         // Draw vertical line between the columns
//         doc.lineWidth(0.5);
//         doc.strokeColor("black");
//         doc.moveTo(startX + keyWidth, startY);
//         doc.lineTo(startX + keyWidth, startY + rowHeight);
//         doc.stroke();

//         // Move to the next row position
//         startY += rowHeight;
//     });
// }
   

//   const  securityDetailsTable = [
//     { field1: "Security Type", value1: `Collateral` },
//     { field1: "Description", value1: `Residential property` },
//     { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
//     { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
//     { field1: "Property Type", value1: `Residential property` },
//     { field1: "Area", value1: `${allPerameters.SecurityDetailsArea}.                         | Construction - ${allPerameters.Construction}` },
//     { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
//   ];
  
//   securityDetailsTableFunction(securityDetailsTable);

//    addFooter()
//     //---------------------------------------------------- new page 4 ----------------------------------------------------

function securityDetailsTableFunction(tableData) {
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total table width
  const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
  const valueWidth = totalWidth - keyWidth; // Value column width (70%)
  const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths

  // Set thin border width
  const borderWidth = 0.3;

  tableData.forEach((row, rowIndex) => {
      let rowHeight = 15;

      // Row 6: Adjust for 3 columns
      if (rowIndex === 5) {
          // Calculate heights for three columns
          const heights = row.columns.map((col, i) =>
              doc.font(i === 0 ? fontBold : font).fontSize(7.2).heightOfString(col.value, { width: colWidths[i] })
          );
          rowHeight = Math.max(...heights) + 10;

          // Draw three-column row
          let currentX = startX;
          row.columns.forEach((col, i) => {
              // Background
              doc.lineWidth(borderWidth)
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(currentX, startY, colWidths[i], rowHeight)
                  .stroke("black")
                  .fill();

              // Text
              doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                  width: colWidths[i],
                  baseline: "hanging",
              });

              // Update X for next column
              currentX += colWidths[i];
          });
      } else {
          // Rows with 2 columns
          const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
          const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
          rowHeight = Math.max(field1Height, value1Height) + 10;

          // Draw key column
          doc.lineWidth(borderWidth)
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
          doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
              width: keyWidth,
              baseline: "hanging",
          });

          // Draw value column
          doc.lineWidth(borderWidth)
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black")
              .fill();
          doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
              width: valueWidth,
              baseline: "hanging",
          });
      }

      // Move to the next row
      startY += rowHeight;
  });
}
function securityDetailsTableFunction1(tableData) {
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total table width
  const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
  const valueWidth = totalWidth - keyWidth; // Value column width (70%)
  const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths

  tableData.forEach((row, rowIndex) => {
      let rowHeight = 15;

      // Row 6: Adjust for 3 columns
      if (rowIndex === 5) {
          // Calculate heights for three columns
          const heights = row.columns.map((col, i) =>
              doc
                  .font(i === 0 ? fontBold : font)
                  .fontSize(7.2)
                  .heightOfString(col.value, { width: colWidths[i] })
          );
          rowHeight = Math.max(...heights) + 10;

          // Draw three-column row
          let currentX = startX;
          row.columns.forEach((col, i) => {
              // Set thin border width
              doc.lineWidth(0.5);

              // Background
              doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(currentX, startY, colWidths[i], rowHeight)
                  .stroke("black")
                  .fill();

              // Text
              doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                  width: colWidths[i],
                  baseline: "hanging",
              });

              // Update X for next column
              currentX += colWidths[i];
          });
      } else {
          // Rows with 2 columns
          const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
          const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
          rowHeight = Math.max(field1Height, value1Height) + 10;

          // Set thin border width
          doc.lineWidth(0.5);

          // Draw key column
          doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
          doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
              width: keyWidth,
              baseline: "hanging",
          });

          // Draw value column
          doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black")
              .fill();
          doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
              width: valueWidth,
              baseline: "hanging",
          });
      }

      // Move to the next row
      startY += rowHeight;
  });
}

const securityDetailsTable1 = [
  { field1: "Security Type", value1: `Collateral` },
  { field1: "Description", value1: `Residential property` },
  { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
  { field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}` },
  { field1: "Property Type", value1: `Residential property` },
  {
      // Row 6: Three columns
      columns: [
          { value: "Land Area " },
          { value: `${allPerameters.SecurityDetailsArea} sq.ft`},
          { value: `Construction -${allPerameters.Construction} `}, // Empty column if needed
      ],
  },
  { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
];

securityDetailsTableFunction1(securityDetailsTable1);


// const securityDetailsTable = [
//   { field1: "Security Type", value1: `Collateral` },
//   { field1: "Description", value1: `Residential property` },
//   { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
//   { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
//   { field1: "Property Type", value1: `Residential property` },
//   { field1: "Area", value1: `${allPerameters.SecurityDetailsArea} | Construction - ${allPerameters.Construction}` },
//   { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
// ];

// securityDetailsTableFunction(securityDetailsTable);

    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(7);

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Specified Terms & Conditions: -`,startX, doc.y, { align: "center", x: 50 })
    .moveDown(0.4);


// function termsConditionTableFunction(tableData) {
//     // Add Table Header
//     const startX = 50;
//     let startY = doc.y + 10;
//     const totalWidth = 500; // Total column width
//     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
//     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

//     tableData.forEach((row, rowIndex) => {
//         // Set default row height
//         let rowHeight = 15;

//         // Calculate the height of the text for field1 and value1
//         const field1TextHeight = doc
//             .font(rowIndex === 0 ? fontBold : font) // Use bold font for first row only
//             .fontSize(7.2)
//             .heightOfString(row.field1, { width: keyWidth });

//         let value1TextHeight = 0;
//         if (row.value1) {
//             value1TextHeight = doc
//                 .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
//                 .fontSize(7.2)
//                 .heightOfString(row.value1, { width: valueWidth });
//         }

//         // Determine the maximum height between field1 and value1 to set row height
//         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

//         // Alternate row background color
//         doc.lineWidth(0.5);
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX, startY, keyWidth, rowHeight)
//             .stroke("black")
//             .fill();

//         // Draw text in field1 cell (bold for the first row, normal for others)
//         doc
//             .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(row.field1, startX + 5, startY + 5, {
//                 baseline: "hanging",
//                 width: keyWidth,
//             });

//         // Draw the second column, even if value1 is absent
//         doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
//             .stroke()
//             .fill();

//         // For the first row, make value1 bold, otherwise use regular font
//         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
//         doc
//             .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
//             .fillColor("black")
//             .fontSize(7.2)
//             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
//                 baseline: "hanging",
//                 width: valueWidth,
//             });

//         // Draw vertical line between the columns
//         doc.lineWidth(0.5);
//         doc.strokeColor("black");
//         doc.moveTo(startX + keyWidth, startY);
//         doc.lineTo(startX + keyWidth, startY + rowHeight);
//         doc.stroke();

//         // Move to the next row position
//         startY += rowHeight;
//     });
// }
function termsConditionTableFunction(tableData) {
  // Add Table Header
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total column width
  const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
  const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  const padding = 5; // Padding to ensure text doesn't touch the border

  tableData.forEach((row, rowIndex) => {
    // Set default row height
    let rowHeight = 15;

    // Calculate the height of the text for field1 and value1
    const field1TextHeight = doc
      .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
      .fontSize(7.2)
      .heightOfString(row.field1, { width: keyWidth - 2 * padding });

    let value1TextHeight = 0;
    if (row.value1) {
      value1TextHeight = doc
        .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
        .fontSize(7.2)
        .heightOfString(row.value1, { width: valueWidth - 2 * padding });
    }

    // Determine the maximum height between field1 and value1 to set row height
    rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;

    // Check if field1 contains "S. No" (case-insensitive match)
    const isSpecialRow = row.field1.toUpperCase().includes("S. NO");

    // Apply special row styling
    if (isSpecialRow) {
      doc
        .fillColor("#00BFFF") // Background color
        .rect(startX, startY, totalWidth, rowHeight)
        .fill()
        .stroke("black", 0.5); // Thin border

      doc
        .font(font)
        .fillColor("black") // Text color
        .fontSize(7.2)
        .text(row.field1, startX + padding, startY + padding, {
          baseline: "hanging",
          width: keyWidth - 2 * padding,
        });

      const keyValueText = row.value1 || ""; // Display value1 text if present
      doc
        .font(font)
        .fillColor("black")
        .fontSize(7.2)
        .text(keyValueText, startX + keyWidth + padding, startY + padding, {
          baseline: "hanging",
          width: valueWidth - 2 * padding,
        });
    } else {
      // Alternate row background color
      doc.lineWidth(0.5);
      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX, startY, keyWidth, rowHeight)
        .stroke("black")
        .fill();

      // Draw text in field1 cell
      doc
        .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
        .fillColor("black")
        .fontSize(7.2)
        .text(row.field1, startX + padding, startY + padding, {
          baseline: "hanging",
          width: keyWidth - 2 * padding,
        });

      // Draw the second column, even if value1 is absent
      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX + keyWidth, startY, valueWidth, rowHeight)
        .stroke("black")
        .fill();

      // Draw text in value1 cell
      const keyValueText = row.value1 || ""; // Display value1 text if present
      doc
        .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
        .fillColor("black")
        .fontSize(7.2)
        .text(keyValueText, startX + keyWidth + padding, startY + padding, {
          baseline: "hanging",
          width: valueWidth - 2 * padding,
        });
    }

    // Draw vertical line between the columns
    doc.lineWidth(0.5);
    doc.strokeColor("black");
    doc.moveTo(startX + keyWidth, startY);
    doc.lineTo(startX + keyWidth, startY + rowHeight);
    doc.stroke();

    // Move to the next row position
    startY += rowHeight;
  });
}


// function termsConditionTableFunction(tableData) {
//   // Add Table Header
//   const startX = 50;
//   let startY = doc.y + 10;
//   const totalWidth = 500; // Total column width
//   const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
//   const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

//   tableData.forEach((row, rowIndex) => {
//     // Set default row height
//     let rowHeight = 15;

//     // Calculate the height of the text for field1 and value1
//     const field1TextHeight = doc
//       .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
//       .fontSize(7.2)
//       .heightOfString(row.field1, { width: keyWidth });

//     let value1TextHeight = 0;
//     if (row.value1) {
//       value1TextHeight = doc
//         .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
//         .fontSize(7.2)
//         .heightOfString(row.value1, { width: valueWidth });
//     }

//     // Determine the maximum height between field1 and value1 to set row height
//     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

//     // Check if field1 contains "S. No" (case-insensitive match)
//     const isSpecialRow = row.field1.toUpperCase().includes("S. NO");

//     // Apply special row styling
//     if (isSpecialRow) {
//       doc
//         .fillColor("#00BFFF") // Background color
//         .rect(startX, startY, totalWidth, rowHeight)
//         .fill()
//         .stroke("black", 0.5); // Thin border

//       doc
//         .font(font)
//         .fillColor("black") // Text color
//         .fontSize(7.2)
//         .text(row.field1, startX + 5, startY + 5, {
//           baseline: "hanging",
//           width: keyWidth,
//         });

//       const keyValueText = row.value1 || ""; // Display value1 text if present
//       doc
//         .font(font)
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
//           baseline: "hanging",
//           width: valueWidth,
//         });
//     } else {
//       // Alternate row background color
//       doc.lineWidth(0.5);
//       doc
//         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//         .rect(startX, startY, keyWidth, rowHeight)
//         .stroke("black")
//         .fill();

//       // Draw text in field1 cell (bold for the first row, normal for others)
//       doc
//         .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(row.field1, startX + 5, startY + 5, {
//           baseline: "hanging",
//           width: keyWidth,
//         });

//       // Draw the second column, even if value1 is absent
//       doc
//         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
//         .stroke("black")
//         .fill();

//       // Draw text in value1 cell (bold for the first row, normal for others)
//       const keyValueText = row.value1 || ""; // Display value1 text if present
//       doc
//         .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
//           baseline: "hanging",
//           width: valueWidth,
//         });
//     }

//     // Draw vertical line between the columns
//     doc.lineWidth(0.5);
//     doc.strokeColor("black");
//     doc.moveTo(startX + keyWidth, startY);
//     doc.lineTo(startX + keyWidth, startY + rowHeight);
//     doc.stroke();

//     // Move to the next row position
//     startY += rowHeight;
//   });
// }


  
    const  termsConditionTable = [
      { field1: "S. No", value1: `Specified Terms & Condition` },
      { field1: "1", value1: `Registered Mortgage to be created and release cost to be borne by the customer. Security to be created cost to be borne by the Borrower or the Guarantor, as the case may be.` },
      { field1: "2", value1: `Facility is subject to satisfactory compliance of all terms and conditions as stipulated in the legal opinion report, the title of which should be clear and marketable given by the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved lawyer and the cost of which should be borne by the Borrower or the Guarantor, as the case may be.` },
      { field1: "3", value1: `Facility account will be setup subject to technical clearance of the property to be mortgaged, as assessed by RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "4", value1: `The quantum of Facility amount will be based on a satisfactory valuation report from the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved valuer.` },
      { field1: "5", value1: `The security charged to the RATNAAFIN CAPITAL PRIVATE LIMITED including property etc. should be comprehensively insured (fire, riots and other hazards like earthquake, floods, etc.) with RATNAAFIN CAPITAL PRIVATE LIMITED Clause and the policy document /a copy of the policy document to be submitted for.` },
      { field1: "6", value1: `The property shall be well maintained at all times and during the pendency of the loan if the property suffers any loss on account of natural calamities or due to riots etc., the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED without fail.` },
      { field1: "7", value1: `Borrower and the Guarantor shall not voluntarily cause any harm to the property that may in any way be detrimental to the interests of the RATNAAFIN CAPITAL PRIVATE LIMITED. You shall make up for any loss incurred to the RATNAAFIN CAPITAL PRIVATE LIMITED on account of any damages occurring to the property due to deviation from the approved plan.` },
      { field1: "8", value1: `You will ensure that the property tax is promptly paid.` },
      { field1: "9", value1: `You will not be entitled to sell, mortgage, lease, surrender or alienate the mortgaged property, or any part thereof, during the subsistence of the mortgage without prior intimation to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "10", value1: `In case of foreclosure of Loan, 4% on the principal outstanding amount will be applicable. In case of balance transfer, 4% charges will be applicable.\n\n Foreclosure charges shall not be levied on individual borrowers for floating rates loans.` },
      { field1: "11", value1: `FRR as applicable on the date of disbursement and the same shall be reset at an interval as per the internal Guidelines of RATNAAFIN CAPITAL PRIVATE LIMITED. It shall be the responsibility of the borrower(s) to inquire or avail from Ratnaafin Capital Private Limited the details thereof on the reset date specified in the agreement. RATNAAFIN CAPITAL PRIVATE LIMITED is entitled to change the reset frequency at any point of time.` },
      { field1: "12", value1: `In case of Takeover of the facility, 4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement).\n\n Takeover charges shall not be levied on individual borrowers for floating rates.` },
      { field1: "13", value1: `The Processing Fees and / or Login Fees are non-refundable.` },
      { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED is authorised to debit Processing fees and other charges / insurance premium mentioned in the sanction\n\n letter from the account/s of the firm company maintained with the Bank.` },
      { field1: "15", value1: `The Borrower and Security Providers shall be deemed to have given their express consent to the RATNAAFIN CAPITAL PRIVATE LIMITED to disclose the information and data furnished by them to the RATNAAFIN CAPITAL PRIVATE LIMITED and also those regarding the credit facility or facilities enjoyed by the borrower, conduct of accounts and guarantee obligations undertaken by guarantor to the Credit Information Companies , or any other credit bureau or RBI or any other agencies specified by RBI who are authorized to seek and publish information, upon signing the copy of the sanction letter.` },
      { field1: "16", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED also reserves the right to assign, securitize or otherwise transfer the loan hereby agreed to be granted or a portion thereof to any person or third party assignee without any notice or consent along with or without underlying security or securities whether movable and or immovable created or to be created for the benefit of the RATNAAFIN CAPITAL PRIVATE LIMITED and pursuant to which the assignee shall be entitled to all or any rights and benefits under the loan and other agreements and or the security or securities created or to be created by me or us or the security providers.` },
    ];
    
    termsConditionTableFunction(termsConditionTable);

////    addFooter()

//     //----------------------------------------------------new page 5-------------------------------

    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(9);
    function termsConditionTableFunction1(tableData) {
      // Add Table Header
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total column width
      const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
      const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      const padding = 5; // Padding to ensure text doesn't touch the border
    
      tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;
    
        // Calculate the height of the text for field1 and value1
        const field1TextHeight = doc
          .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
          .fontSize(7.2)
          .heightOfString(row.field1, { width: keyWidth - 2 * padding });
    
        let value1TextHeight = 0;
        if (row.value1) {
          value1TextHeight = doc
            .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
            .fontSize(7.2)
            .heightOfString(row.value1, { width: valueWidth - 2 * padding });
        }
    
        // Determine the maximum height between field1 and value1 to set row height
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
    
        // Check if field1 contains "S. No" (case-insensitive match)
        const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
    
        // Apply special row styling
        if (isSpecialRow) {
          doc
            .fillColor("#00BFFF") // Background color
            .rect(startX, startY, totalWidth, rowHeight)
            .fill()
            .stroke("black", 0.5); // Thin border
    
          doc
            .font(font)
            .fillColor("black") // Text color
            .fontSize(7.2)
            .text(row.field1, startX + padding, startY + padding, {
              baseline: "hanging",
              width: keyWidth - 2 * padding,
            });
    
          const keyValueText = row.value1 || ""; // Display value1 text if present
          doc
            .font(font)
            .fillColor("black")
            .fontSize(7.2)
            .text(keyValueText, startX + keyWidth + padding, startY + padding, {
              baseline: "hanging",
              width: valueWidth - 2 * padding,
            });
        } else {
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, keyWidth, rowHeight)
            .stroke("black")
            .fill();
    
          // Draw text in field1 cell
          doc
            .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
            .fillColor("black")
            .fontSize(7.2)
            .text(row.field1, startX + padding, startY + padding, {
              baseline: "hanging",
              width: keyWidth - 2 * padding,
            });
    
          // Draw the second column, even if value1 is absent
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + keyWidth, startY, valueWidth, rowHeight)
            .stroke("black")
            .fill();
    
          // Draw text in value1 cell
          const keyValueText = row.value1 || ""; // Display value1 text if present
          doc
            .font(rowIndex === 0 ? font: font) // Bold for the first row only
            .fillColor("black")
            .fontSize(7.2)
            .text(keyValueText, startX + keyWidth + padding, startY + padding, {
              baseline: "hanging",
              width: valueWidth - 2 * padding,
            });
        }
    
        // Draw vertical line between the columns
        doc.lineWidth(0.5);
        doc.strokeColor("black");
        doc.moveTo(startX + keyWidth, startY);
        doc.lineTo(startX + keyWidth, startY + rowHeight);
        doc.stroke();
    
        // Move to the next row position
        startY += rowHeight;
      });
    }

    const conditonsTable = [
      { field1: "17", value1: `In the event of any change of address for communication, any change in job, profession by you or the guarantors, the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED immediately` },
      { field1: "18", value1: `General undertaking to be taken from borrower are as mentioned below, if applicable\nThat the Firm not to pay any consideration by way of commission, brokerage, fees or any other form to guarantors directly or indirectly.That working capital funds would not be diverted for long term use\nThat none of the directors of Ratnaafin Capital Private Limited or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or of a subsidiary of the borrower or of the holding company of the borrower and that none of them hold substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrowers knowledge none of the directors of any other bank or the subsidiaries of the banks or trustees of mutual funds or venture capital funds set up by the banks or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them holds substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrower’s knowledge none of senior officials of the RATNAAFIN CAPITAL PRIVATE LIMITED or the participating banks under consortium or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them hold substantial interest in the borrower or its subsidiary or its holding company. That in case if any of the above requirement is breached, the borrower shall inform of the RATNAAFIN CAPITAL PRIVATE LIMITED the same immediately.` },
    ]

    termsConditionTableFunction1(conditonsTable);
    doc.moveDown(1.5)

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
    .moveDown(0.5);

    const  standardConditionTable = [
      { field1: "S. No", value1: `Standard Terms & Condition` },
      { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
      { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof.` },
      { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
      { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED will have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
      { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
      { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
      // { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
      // { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
      // { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      // { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
      // { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      // { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
    ];

    termsConditionTableFunction(standardConditionTable);

////    addFooter()

//     // ------------------------------------new page 6---------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(7);

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
    .moveDown(0.5);

    const  standardConditionTablee = [
      // { field1: "S. No", value1: `Standard Terms & Condition` },
      // { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      // { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
      // { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof` },
      // { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
      // { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITEDwill have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
      // { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
      // { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
      { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
      { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
      { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
      { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
      { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
      { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
      { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
      { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
      { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
      { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
      { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
      { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
      { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
      // { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
      // { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
      // { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
      // { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
      // { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
    
    ];

    termsConditionTableFunction1(standardConditionTablee);

////    addFooter()


//     //-------------------------------------new page 7--------------------------------------------------
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(5);

    const table = [
      //  { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
      // { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
      // { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
      // { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
      // { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
      // { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
      // { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
      // { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
      // { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
      { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
      { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
      { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
      { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
      { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      { field1: "28", value1: `For cases where charge was registered with Registrar of Companies for securities proposed with Ratnaafin Capital Private Limited, borrower will arrange satisfaction of charge post security creation with Ratnaafin Capital Private Limited.` },
      { field1: "29", value1: `CERSAI Charges for registration of security interest will be levied as follows. Non-refundable charges levied by Central Registry of Securitization of Asset Reconstruction and Security Interest of India. For Registration of Individual Security Primary and or Collateral created in favour of Ratnaafin Capital Private Limited i. When facility amount is equal to Rs 5 lacs or lesser, Rs 50 plus GST ii. When facility amount is greater than Rs 5 Lacs, Rs 100 plus GST` },
      { field1: "30", value1: `Insurance renewal condition, Borrower to submit valid copy of Insurance of the property, and other assets duly charged in favour of Ratnaafin Capital Private Limited. Further borrower to ensure that fresh copy of insurance is provided to the RATNAAFIN CAPITAL PRIVATE LIMITED within 7 days before the expiry of insurance policy. In absence of that, Cash Credit or Overdraft or Current account shall be debited towards the insurance premium amount on the date of expiry of Insurance policy.` },   
   
    ];

    termsConditionTableFunction1(table);
    doc.moveDown(2)
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(7);

    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`KEY FACTS STATEMENT \n\n PART-1 Interest rate and fees / charges`,startX, doc.y, { align: "center", x: 50 })
    .moveDown(0.5);

    function securityDetailsTableFunction(tableData) {
      // Add Table Header
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
      const field1Width = Math.round(totalWidth * 0.1); // 10% for field1
      const field2Width = Math.round(totalWidth * 0.45); // 45% for field2
      const field3Width = totalWidth - field1Width - field2Width; // Remaining 45% for field3
  
      tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
  
          // Calculate the height of the text for field1, field2, and field3
          const field1TextHeight = doc
              .font(fontBold) // Bold font for field1
              .fontSize(7.2)
              .heightOfString(row.field1, { width: field1Width });
  
          const field2TextHeight = doc
              .font(font) // Regular font for field2
              .fontSize(7.2)
              .heightOfString(row.field2, { width: field2Width });
  
          const field3TextHeight = doc
              .font(font) // Regular font for field3
              .fontSize(7.2)
              .heightOfString(row.field3, { width: field3Width });
  
          // Determine the maximum height between all fields to set row height
          rowHeight = Math.max(field1TextHeight, field2TextHeight, field3TextHeight) + 10;
  
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, totalWidth, rowHeight)
              .stroke("black")
              .fill();
  
          // Draw field1 text in the first column
          doc
              .font(fontBold) // Bold font for field1
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: field1Width,
              });
  
          // Draw field2 text in the second column
          doc
              .font(font) // Regular font for field2
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field2, startX + field1Width + 5, startY + 5, {
                  baseline: "hanging",
                  width: field2Width,
              });
  
          // Draw field3 text in the third column
          doc
              .font(font) // Regular font for field3
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field3 || "", startX + field1Width + field2Width + 5, startY + 5, {
                  baseline: "hanging",
                  width: field3Width,
              });
  
          // Draw vertical lines between columns
          doc.strokeColor("black").lineWidth(0.5);
          doc.moveTo(startX + field1Width, startY).lineTo(startX + field1Width, startY + rowHeight).stroke();
          doc.moveTo(startX + field1Width + field2Width, startY).lineTo(startX + field1Width + field2Width, startY + rowHeight).stroke();
  
          // Move to the next row position
          startY += rowHeight;
      });
  }
  
  // Table Data
  const kycTable = [
      { field1: "1", field2: "Loan proposal/ account No.", field3: `${allPerameters.pENDENCYlOANnumber}` },
      { field1: "", field2: "Type of Loan", field3: "Agri Micro Loan Against Property" },
      { field1: "2", field2: "Sanctioned Loan amount (in Rupees)", field3: `Rs.${allPerameters.loanAmount} ${allPerameters.loanAmountinwords}` },
      { field1: "3", field2: "Disbursal schedule\n (i) Disbursement in stages or 100% upfront.\n(ii) If it is stage wise, mention the clause of loan agreement having relevant details", field3: "100 % upfront / As per Clause 3 (a)" },
      { field1: "4", field2: "Loan term (year/months/days)", field3: `${allPerameters.tenureinMonths} months` },
  ];
  
  // Call the function
  securityDetailsTableFunction(kycTable);

  function instalmentTableFunction(tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total table width

    // Determine the maximum number of fields in the table
    const maxFields = Math.max(
        ...tableData.map((row) => Object.keys(row).length)
    );

    // Calculate dynamic column width based on the number of fields
    const columnWidth = totalWidth / maxFields;

    tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;

        // Calculate the height for each field dynamically
        const fieldHeights = Object.keys(row).map((key) => {
            return doc
                .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                .fontSize(7.2)
                .heightOfString(row[key] || "", { width: columnWidth });
        });

        // Determine the maximum height between all fields
        rowHeight = Math.max(...fieldHeights) + 10;

        // Alternate row background color
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, totalWidth, rowHeight)
            .stroke("black")
            .fill();

        // Draw text for each field dynamically
        let currentX = startX;
        Object.keys(row).forEach((key, index) => {
            doc
                .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                .fillColor("black")
                .fontSize(7.2)
                .text(row[key] || "", currentX + 5, startY + 5, {
                    baseline: "hanging",
                    width: columnWidth,
                });

            // Draw vertical line after the column
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + columnWidth, startY)
                .lineTo(currentX + columnWidth, startY + rowHeight)
                .stroke();

            currentX += columnWidth;
        });

        // Move to the next row position
        startY += rowHeight;
    });
}
// Table instalment data examples
const instalmentTable = [
    { field1: "5", field2: "Instalment details" },
    { field1: "Type of instalments", field2: "Number of EPIs", field3: `EPI (Rs)`, field4: "Commencement of repayment, post sanction" },
    { field1: "Monthly", field2: `${allPerameters.tenureinMonths}`, field3: `Rs ${allPerameters.emiAmount}`, field4: `10th of the month next to the \nfollowing month` },
];
// Call the function
instalmentTableFunction(instalmentTable);

// function loanTableFunction(tableData) {
//   const startX = 50;
//   let startY = doc.y + 10;
//   const totalWidth = 500; // Total table width

//   // Determine the maximum number of fields in the table
//   const maxFields = Math.max(
//     ...tableData.map((row) => Object.keys(row).length)
//   );

//   // Calculate dynamic column width based on the number of fields
//   const columnWidth = totalWidth / maxFields;

//   tableData.forEach((row, rowIndex) => {
//     // Set default row height
//     let rowHeight = 15;

//     // Calculate the height for each field dynamically
//     const fieldHeights = Object.keys(row).map((key) => {
//       return doc
//         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
//         .fontSize(7.2)
//         .heightOfString(row[key] || "", { width: columnWidth });
//     });

//     // Determine the maximum height between all fields
//     rowHeight = Math.max(...fieldHeights) + 10;

//     // Alternate row background color
//     doc.lineWidth(0.5);
//     doc
//       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//       .rect(startX, startY, totalWidth, rowHeight)
//       .stroke("black")
//       .fill();

//     // Draw text for each field dynamically
//     let currentX = startX;
//     Object.keys(row).forEach((key, index) => {
//       // Draw the text for each field
//       doc
//         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(row[key] || "", currentX + 5, startY + 5, {
//           baseline: "hanging",
//           width: columnWidth,
//         });

//       // Draw vertical line after the column
//       doc.strokeColor("black").lineWidth(0.5);
//       doc
//         .moveTo(currentX + columnWidth, startY)
//         .lineTo(currentX + columnWidth, startY + rowHeight)
//         .stroke();

//       currentX += columnWidth;
//     });

//     // Move to the next row position
//     startY += rowHeight;
//   });
// }
function loanTableFunction(tableData, customWidths = []) {
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total table width

  tableData.forEach((row, rowIndex) => {
    // Determine if custom widths are provided for the current row
    const numColumns = Object.keys(row).length;
    const rowWidths = customWidths[rowIndex] || Array(numColumns).fill(totalWidth / numColumns);

    // Set default row height
    let rowHeight = 15;

    // Calculate the height for each field dynamically
    const fieldHeights = Object.keys(row).map((key, index) => {
      return doc
        .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
        .fontSize(7.2)
        .heightOfString(row[key] || "", { width: rowWidths[index] });
    });

    // Determine the maximum height between all fields
    rowHeight = Math.max(...fieldHeights) + 10;

    // Alternate row background color
    doc.lineWidth(0.5);
    doc
      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      .rect(startX, startY, totalWidth, rowHeight)
      .stroke("black")
      .fill();

    // Draw text for each field dynamically
    let currentX = startX;
    Object.keys(row).forEach((key, index) => {
      // Draw the text for each field
      doc
        .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
        .fillColor("black")
        .fontSize(7.2)
        .text(row[key] || "", currentX + 5, startY + 5, {
          baseline: "hanging",
          width: rowWidths[index],
        });

      // Draw vertical line after the column
      doc.strokeColor("black").lineWidth(0.5);
      doc
        .moveTo(currentX + rowWidths[index], startY)
        .lineTo(currentX + rowWidths[index], startY + rowHeight)
        .stroke();

      currentX += rowWidths[index];
    });

    // Move to the next row position
    startY += rowHeight;
  });
}

const loanTable = [
  { field1: "6", field2: "Interest rate (%) and type (fixed or floating or hybrid)",field3: `${allPerameters.interestRate}% p.a (floating)` },
  { field1: "7", field2: "Additional Information in case of Floating rate of interest" },
  { field1: "Reference Benchmark", field2: "Benchmark rate (%) (B)", field3: "Spread (%) (S)",field4: "Final rate (%) R = (B) + (S)"  },
  { field1: "FRR", field2: "19.20%", field3: `${allPerameters.interestType}%`,field4: `${allPerameters.interestRate}%` },
];

const customWidths = [
  [50, 300, 150], // Custom widths for the 1st row (3 columns)
  [50, 450],     // Custom widths for the 2nd row (2 columns)
  null,           // Default dynamic widths for the 3rd row
  null,           // Default dynamic widths for the 4th row
];
  //interestRate
loanTableFunction(loanTable,customWidths);

// function resetTableFunction(tableData) {
//   const startX = 50;
//   let startY = doc.y + 10;
//   const totalWidth = 500; // Total table width

//   // Determine the maximum number of fields in the table
//   const maxFields = Math.max(
//     ...tableData.map((row) => Object.keys(row).length)
//   );

//   // Calculate dynamic column width based on the number of fields
//   const columnWidth = totalWidth / maxFields;

//   tableData.forEach((row, rowIndex) => {
//     // Set default row height
//     let rowHeight = 15;

//     // Calculate the height for each field dynamically
//     const fieldHeights = Object.keys(row).map((key) => {
//       return doc
//         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
//         .fontSize(7.2)
//         .heightOfString(row[key] || "", { width: columnWidth });
//     });

//     // Determine the maximum height between all fields
//     rowHeight = Math.max(...fieldHeights) + 10;

//     // Alternate row background color
//     doc.lineWidth(0.5);
//     doc
//       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//       .rect(startX, startY, totalWidth, rowHeight)
//       .stroke("black")
//       .fill();

//     // Draw text for each field dynamically
//     let currentX = startX;

//     if (rowIndex === 1) {
//       // For the second row, only span field2 and field3
//       // Field 1 remains in the first column
//       doc
//         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(row.field1 || "", currentX + 5, startY + 5, {
//           baseline: "hanging",
//           width: columnWidth, // field1 takes only the first column width
//         });

//       // Span field2 and field3 across the remaining columns
//       currentX += columnWidth; // move to the next column for field2
//       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
//       doc
//         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(row.field2 || "", currentX + 5, startY + 5, {
//           baseline: "hanging",
//           width: spanWidth, // field2 spans the rest of the row width
//         });
//     } else {
//       // Regular row processing (for all other rows)
//       Object.keys(row).forEach((key, index) => {
//         // Draw the text for each field
//         doc
//           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
//           .fillColor("black")
//           .fontSize(7.2)
//           .text(row[key] || "", currentX + 5, startY + 5, {
//             baseline: "hanging",
//             width: columnWidth,
//           });

//         // Draw vertical line after the column
//         doc.strokeColor("black").lineWidth(0.5);
//         doc
//           .moveTo(currentX + columnWidth, startY)
//           .lineTo(currentX + columnWidth, startY + rowHeight)
//           .stroke();

//         currentX += columnWidth;
//       });
//     }

//     // Move to the next row position
//     startY += rowHeight;
//   });
// }

// const resetTable = [
//   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
//   { field1: "", field2: "Every 3 month" },
// ];
  
// resetTableFunction(resetTable);

// function impactTableFunction(tableData) {
//   const startX = 50;
//   let startY = doc.y + 10;
//   const totalWidth = 500; // Total table width

//   // Set the number of columns explicitly (3 columns)
//   const columns = ['field1', 'field2', 'field3'];

//   // Calculate dynamic column width based on the number of columns
//   const columnWidth = totalWidth / columns.length;

//   tableData.forEach((row, rowIndex) => {
//     // Set default row height
//     let rowHeight = 15;

//     // Calculate the height for each field dynamically
//     const fieldHeights = columns.map((key) => {
//       return doc
//         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
//         .fontSize(7.2)
//         .heightOfString(row[key] || "", { width: columnWidth });
//     });

//     // Determine the maximum height between all fields
//     rowHeight = Math.max(...fieldHeights) + 10;

//     // Alternate row background color
//     doc.lineWidth(0.5);
//     doc
//       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//       .rect(startX, startY, totalWidth, rowHeight)
//       .stroke("black")
//       .fill();

//     // Draw text for each field dynamically
//     let currentX = startX;
//     columns.forEach((key, index) => {
//       // Check if field is empty, and show blank if needed
//       const fieldValue = row[key] || " ";

//       doc
//         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
//         .fillColor("black")
//         .fontSize(7.2)
//         .text(fieldValue, currentX + 5, startY + 5, {
//           baseline: "hanging",
//           width: columnWidth,
//         });

//       // Draw vertical line after the column
//       doc.strokeColor("black").lineWidth(0.5);
//       doc
//         .moveTo(currentX + columnWidth, startY)
//         .lineTo(currentX + columnWidth, startY + rowHeight)
//         .stroke();

//       currentX += columnWidth;
//     });

//     // Move to the next row position
//     startY += rowHeight;
//   });
// }

// const impactTable = [
//   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: `EPI\u20B9`,field3: "No. of EPIs" },
//   { field1: "", field2:  `${allPerameters.epi}`,field3:  `${allPerameters.noOfEpi}` },
// ];
  
// impactTableFunction(impactTable);
function chargesTableFunction1(doc, tableData, font, fontBold) {
  const startX = 50; // Starting X position
  let startY = doc.y + 10; // Starting Y position
  const totalWidth = 500; // Total table width
  const baseColumnWidth = totalWidth / 4; // Base column width (4 columns in total)

  tableData.forEach((row, rowIndex) => {
    let currentX = startX;
    let rowHeight = 15;

    row.forEach((cell) => {
      const colWidth = baseColumnWidth * (cell.colSpan || 1); // Adjust width by colSpan
      const fieldHeight = doc
        .font(cell.bold ? fontBold : font) // Bold if specified
        .fontSize(7.2)
        .heightOfString(cell.text, { width: colWidth });

      rowHeight = Math.max(rowHeight, fieldHeight + 10);

      // Draw cell background
      doc.lineWidth(0.5)
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(currentX, startY, colWidth, rowHeight)
        .stroke("black")
        .fill();

      // Draw text inside the cell
      doc.fillColor("black")
        .font(cell.bold ? fontBold : font)
        .fontSize(7.2)
        .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });

      // Move to the next cell position
      currentX += colWidth;
    });

    // Move to the next row
    startY += rowHeight;
  });
}

// function chargesTableFunction1(doc, tableData, font, fontBold) {
//   const startX = 50; // Starting X position
//   let startY = doc.y + 10; // Starting Y position
//   const totalWidth = 500; // Total table width

//   tableData.forEach((row, rowIndex) => {
//     let currentX = startX;
//     let rowHeight = 15;

//     row.forEach((cell) => {
//       const colWidth = (totalWidth / 4) * (cell.colSpan || 1); // Adjust width by colSpan
//       const fieldHeight = doc
//         .font(cell.bold ? fontBold : font) // Bold if specified
//         .fontSize(7.2)
//         .heightOfString(cell.text, { width: colWidth });

//       rowHeight = Math.max(rowHeight, fieldHeight + 10);

//       // Draw cell background
//       doc.lineWidth(0.5)
//         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//         .rect(currentX, startY, colWidth, rowHeight)
//         .stroke("black")
//         .fill();

//       // Draw text inside the cell
//       doc.fillColor("black")
//         .font(cell.bold ? fontBold : font)
//         .fontSize(7.2)
//         .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });

//       // Move to the next cell position
//       currentX += colWidth;
//     });

//     // Move to the next row
//     startY += rowHeight;
//   });
// }

// const tableData1 = [
//   [
//     { text: "Reset periodicity (Months)", colSpan: 2, bold: true },
//     { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: true },
//   ],
//   [
//     { text: "B", bold: true },
//     { text: "S", bold: true },
//     { text: "EPI (₹)", bold: true },
//     { text: "No. of EPIs", bold: true },
//   ],
//   [
//     { text: "Every 3 months", colSpan: 2, bold: false },
//     { text: "14749", bold: true },
//     { text: "61", bold: true },
//   ],
// ];
const tableData1 = [
  [
    { text: `Reset periodicity \n(Months)`, colSpan: 2, bold: false }, // Spanning 2 columns
    { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: false }, // Spanning 2 columns
  ],
  [
    { text: "B", bold: false }, // Single column
    { text: "S", bold: false }, // Single column
    { text: "EPI (Rs)", bold: false }, // Single column
    { text: "No. of EPIs", bold: false }, // Single column
  ],
  [
    { text: "Every 3 months", colSpan: 2, bold: false }, // Spanning 2 columns
    { text: `Rs ${allPerameters.epi}`, bold: false }, // Single column
    { text:  `${allPerameters.noOfEpi}`, bold: false }, // Single column
  ],
];


chargesTableFunction1(doc, tableData1, font, fontBold);

function chargesTableFunction(tableData) {
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total table width

  // Set the number of columns explicitly (3 columns)
  const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed

  // Calculate dynamic column width based on the number of columns
  const columnWidth = totalWidth / columns.length;

  tableData.forEach((row, rowIndex) => {
    // Set default row height
    let rowHeight = 15;

    // Calculate the height for each field dynamically
    const fieldHeights = columns.map((key) => {
      return doc
        .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
        .fontSize(7.2)
        .heightOfString(row[key] || "", { width: columnWidth });
    });

    // Determine the maximum height between all fields
    rowHeight = Math.max(...fieldHeights) + 10;

    // Alternate row background color
    doc.lineWidth(0.5);
    doc
      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      .rect(startX, startY, totalWidth, rowHeight)
      .stroke("black")
      .fill();

    // Draw text for each field dynamically
    let currentX = startX;
    columns.forEach((key, index) => {
      // Check if field is empty, and show blank if needed
      const fieldValue = row[key] || " ";

      doc
        .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
        .fillColor("black")
        .fontSize(7.2)
        .text(fieldValue, currentX + 5, startY + 5, {
          baseline: "hanging",
          width: columnWidth,
        });

      // Draw vertical line after the column
      doc.strokeColor("black").lineWidth(0.5);
      doc
        .moveTo(currentX + columnWidth, startY)
        .lineTo(currentX + columnWidth, startY + rowHeight)
        .stroke();

      currentX += columnWidth;
    });

    // Move to the next row position
    startY += rowHeight;
  });
}

const chargesTable = [
  { field1: "8", field2: "Fee/ Charges" },
  { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
];

chargesTableFunction(chargesTable);


function generateFeeChargesTableFromThirdRow(doc, tableData) {
  const startX = 50; // Starting X-coordinate
  let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
  const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns

  tableData.forEach((row, rowIndex) => {
      // Set default row height
      let rowHeight = 15;

      // Dynamically calculate the height of each cell's content
      const cellHeights = Object.keys(row).map((key, index) => {
          return doc
              .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
              .fontSize(8)
              .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
      });

      rowHeight = Math.max(...cellHeights) + 10;

      // Alternate row background color
      doc.lineWidth(0.5);
      doc
          .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
          .stroke("black")
          .fill();

      // Draw cell contents and vertical borders
      let currentX = startX;
      Object.keys(row).forEach((key, index) => {
          doc
              .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
              .fontSize(8)
              .fillColor("black")
              .text(row[key] || "", currentX + 5, startY + 5, {
                  width: columnWidths[index] - 10,
                  baseline: "hanging",
                  align: "left",
              });

          // Draw vertical lines for columns
          doc.strokeColor("black").lineWidth(0.5);
          doc
              .moveTo(currentX + columnWidths[index], startY)
              .lineTo(currentX + columnWidths[index], startY + rowHeight)
              .stroke();

          currentX += columnWidths[index];
      });

      // Move to the next row
      startY += rowHeight;
      doc.moveDown(1.8);

  });

  // Ensure table border ends properly
  doc.stroke();
}

const tableData = [
{
  col1: "",
  col2: "",
  col3: "One-time/Recurring",
  col4: `Amount (in Rs) or Percentage(%) asapplicable`,
  col5: "One-time/Recurring",
  col6: `Amount (in Rs) or Percentage(%) as applicable`,
},
{
    col1: "(i)",
    col2: "Processing fees",
    col3: "One time",
    col4: `Rs.${allPerameters.processingfees}`,
    col5: "",
    col6: "",
},
{
    col1: "(ii)",
    col2: "Insurance charges",
    col3: "One time",
    col4: "",
    col5: "One time",
    col6:  `Rs.${allPerameters.insuranceCharges}`,
},
{
    col1: "(iii)",
    col2: "Valuation fees",
    col3: "One time",
    col4: "0",
    col5: "",
    col6: "",
},
{
    col1: "(iv)",
    col2: "Any other (please specify)",
    col3: "Documentation Charges, CERSAI Charges",
    col4:  `Rs.${allPerameters.docCharges} \n\nRs.${allPerameters.cersaiCharges}`,
    col5: "",
    col6: "",
},
];

generateFeeChargesTableFromThirdRow(doc, tableData);

function generateFeeChargesTableFromThirdRowten(doc,tableDataten) {
  const startX = 50; // Starting X-coordinate
  let startY = doc.y + 10; // Starting Y-coordinate
  const columnConfigurations = [
      [80, 270, 153], // First row: Three columns
      [80, 423],      // Second row: Two columns
      [80, 200, 222], // Rows 3 to 7: Three columns
  ];

  tableDataten.forEach((row, rowIndex) => {
      // Determine the column configuration for the current row
      const columnWidths = columnConfigurations[row.configurationIndex];
      
      // Set default row height
      let rowHeight = 15;

      // Dynamically calculate the height of each cell's content
      const cellHeights = row.columns.map((col, index) => {
          return doc
              .font("Helvetica")
              .fontSize(8)
              .heightOfString(col || "", { width: columnWidths[index] - 10 });
      });

      rowHeight = Math.max(...cellHeights) + 10;

      // Alternate row background color
      doc.lineWidth(0.5);
      doc
          .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
          .stroke("black")
          .fill();

      // Draw cell contents and vertical borders
      let currentX = startX;
      row.columns.forEach((col, index) => {
          doc
              .font("Helvetica")
              .fontSize(8)
              .fillColor("black")
              .text(col || "", currentX + 5, startY + 5, {
                  width: columnWidths[index] - 10,
                  baseline: "hanging",
                  align: "left",
              });

          // Draw vertical lines for columns
          doc.strokeColor("black").lineWidth(0.5);
          doc
              .moveTo(currentX + columnWidths[index], startY)
              .lineTo(currentX + columnWidths[index], startY + rowHeight)
              .stroke();

          currentX += columnWidths[index];
      });

      // Move to the next row
      startY += rowHeight;
  });

  // Ensure table border ends properly
  doc.stroke();

}

const tableDataten = [
  {
      configurationIndex: 0, // First row: 3 columns
      columns: ["9", "Annual Percentage Rate (APR) (%)", `${allPerameters.annualPercentageRateAprPercentage}%`],
  },
  {
      configurationIndex: 1, // Second row: 2 columns
      columns: ["10", `Details of Contingent Charges (in Rs or %, as applicable)`],
  },
  // {
  //     configurationIndex: 2, // Rows 3 to 7: 3 columns
  //     columns: [
  //         "(i)",
  //         "Penal charges, if any, in case of delayed payment",
  //         "2% per month on the Outstanding Dues plus, applicable Taxes",
  //     ],
  // },
  // {
  //     configurationIndex: 2,
  //     columns: [
  //         "(ii)",
  //         "Other penal charges, if any",
  //         "2% per month on the Outstanding Dues plus, applicable Taxes",
  //     ],
  // },
  // {
  //     configurationIndex: 2,
  //     columns: [
  //         "(iii)",
  //         "Foreclosure charges, if applicable",
  //         "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
  //     ],
  // },
  // {
  //     configurationIndex: 2,
  //     columns: [
  //         "(iv)",
  //         "Charges for switching of loans from floating to fixed rate and vice versa",
  //         "Not Applicable",
  //     ],
  // },
  // {
  //     configurationIndex: 2,
  //     columns: [
  //         "(v)",
  //         "Any other charges (please specify)",
  //         "Not Applicable",
  //     ],
  // },
];

// Call the function with your doc object and table data
doc.moveDown();
generateFeeChargesTableFromThirdRowten(doc, tableDataten);
doc.moveDown(2.5);

////    addFooter()

//     //------------------------------------------------new pdf 8--------------------------------------------------------

    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(4.8);

    // function resetTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Determine the maximum number of fields in the table
    //   const maxFields = Math.max(
    //     ...tableData.map((row) => Object.keys(row).length)
    //   );
    
    //   // Calculate dynamic column width based on the number of fields
    //   const columnWidth = totalWidth / maxFields;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = Object.keys(row).map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    
    //     if (rowIndex === 1) {
    //       // For the second row, only span field2 and field3
    //       // Field 1 remains in the first column
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field1 || "", currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth, // field1 takes only the first column width
    //         });
    
    //       // Span field2 and field3 across the remaining columns
    //       currentX += columnWidth; // move to the next column for field2
    //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field2 || "", currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: spanWidth, // field2 spans the rest of the row width
    //         });
    //     } else {
    //       // Regular row processing (for all other rows)
    //       Object.keys(row).forEach((key, index) => {
    //         // Draw the text for each field
    //         doc
    //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
    //           .fillColor("black")
    //           .fontSize(7.2)
    //           .text(row[key] || "", currentX + 5, startY + 5, {
    //             baseline: "hanging",
    //             width: columnWidth,
    //           });
    
    //         // Draw vertical line after the column
    //         doc.strokeColor("black").lineWidth(0.5);
    //         doc
    //           .moveTo(currentX + columnWidth, startY)
    //           .lineTo(currentX + columnWidth, startY + rowHeight)
    //           .stroke();
    
    //         currentX += columnWidth;
    //       });
    //     }
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }

    // const resetTable = [
    //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
    //   { field1: "", field2: "Every 3 month" },
    // ];
      
    // resetTableFunction(resetTable);

    // function impactTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Set the number of columns explicitly (3 columns)
    //   const columns = ['field1', 'field2', 'field3'];
    
    //   // Calculate dynamic column width based on the number of columns
    //   const columnWidth = totalWidth / columns.length;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = columns.map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    //     columns.forEach((key, index) => {
    //       // Check if field is empty, and show blank if needed
    //       const fieldValue = row[key] || " ";
    
    //       doc
    //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(fieldValue, currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth,
    //         });
    
    //       // Draw vertical line after the column
    //       doc.strokeColor("black").lineWidth(0.5);
    //       doc
    //         .moveTo(currentX + columnWidth, startY)
    //         .lineTo(currentX + columnWidth, startY + rowHeight)
    //         .stroke();
    
    //       currentX += columnWidth;
    //     });
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }

    // const impactTable = [
    //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: "EPI",field3: "No. of EPIs" },
    //   { field1: "", field2: "14749 ",field3: "61" },
    // ];
      
    // impactTableFunction(impactTable);


    // function chargesTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Set the number of columns explicitly (3 columns)
    //   const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
    
    //   // Calculate dynamic column width based on the number of columns
    //   const columnWidth = totalWidth / columns.length;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = columns.map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    //     columns.forEach((key, index) => {
    //       // Check if field is empty, and show blank if needed
    //       const fieldValue = row[key] || " ";
    
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(fieldValue, currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth,
    //         });
    
    //       // Draw vertical line after the column
    //       doc.strokeColor("black").lineWidth(0.5);
    //       doc
    //         .moveTo(currentX + columnWidth, startY)
    //         .lineTo(currentX + columnWidth, startY + rowHeight)
    //         .stroke();
    
    //       currentX += columnWidth;
    //     });
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    
    // const chargesTable = [
    //   { field1: "8", field2: "Fee/ Charges" },
    //   { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
    // ];
    
    // chargesTableFunction(chargesTable);

//     function generateFeeChargesTableFromThirdRow(doc, tableData) {
//       const startX = 50; // Starting X-coordinate
//       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
//       const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
  
//       tableData.forEach((row, rowIndex) => {
//           // Set default row height
//           let rowHeight = 15;
  
//           // Dynamically calculate the height of each cell's content
//           const cellHeights = Object.keys(row).map((key, index) => {
//               return doc
//                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
//                   .fontSize(8)
//                   .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
//           });
  
//           rowHeight = Math.max(...cellHeights) + 10;
  
//           // Alternate row background color
//           doc.lineWidth(0.5);
//           doc
//               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
//               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//               .stroke("black")
//               .fill();
  
//           // Draw cell contents and vertical borders
//           let currentX = startX;
//           Object.keys(row).forEach((key, index) => {
//               doc
//                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
//                   .fontSize(8)
//                   .fillColor("black")
//                   .text(row[key] || "", currentX + 5, startY + 5, {
//                       width: columnWidths[index] - 10,
//                       baseline: "hanging",
//                       align: "left",
//                   });
  
//               // Draw vertical lines for columns
//               doc.strokeColor("black").lineWidth(0.5);
//               doc
//                   .moveTo(currentX + columnWidths[index], startY)
//                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
//                   .stroke();
  
//               currentX += columnWidths[index];
//           });
  
//           // Move to the next row
//           startY += rowHeight;
//       });
  
//       // Ensure table border ends properly
//       doc.stroke();
//   }

//   const tableData = [
//     {
//       col1: "",
//       col2: "",
//       col3: "One-time/Recurring",
//       col4: "Amount (in₹) or Percentage(%) asapplicable",
//       col5: "One-time/Recurring",
//       col6: "Amount (in ₹) or Percentage(%) as applicable",
//   },
//     {
//         col1: "(i)",
//         col2: "Processing fees",
//         col3: "One time",
//         col4: "11800",
//         col5: "One time",
//         col6: "3930",
//     },
//     {
//         col1: "(ii)",
//         col2: "Insurance charges",
//         col3: "One time",
//         col4: "3930",
//         col5: "",
//         col6: "",
//     },
//     {
//         col1: "(iii)",
//         col2: "Valuation fees",
//         col3: "One time",
//         col4: "0",
//         col5: "",
//         col6: "",
//     },
//     {
//         col1: "(iv)",
//         col2: "Any other (please specify)",
//         col3: "Documentation Charges, CERSAI Charges",
//         col4: "11800",
//         col5: "",
//         col6: "",
//     },
// ];

// generateFeeChargesTableFromThirdRow(doc, tableData);
// doc.moveDown(2.5);

function generateFeeChargesTableFromThirdRowtenv(doc,tableDatatenv) {
  const startX = 50; // Starting X-coordinate
  let startY = doc.y + 10; // Starting Y-coordinate
  const columnConfigurations = [
      [80, 270, 153], // First row: Three columns
      [80, 423],      // Second row: Two columns
      [80, 200, 222], // Rows 3 to 7: Three columns
  ];

  tableDatatenv.forEach((row, rowIndex) => {
      // Determine the column configuration for the current row
      const columnWidths = columnConfigurations[row.configurationIndex];
      
      // Set default row height
      let rowHeight = 15;

      // Dynamically calculate the height of each cell's content
      const cellHeights = row.columns.map((col, index) => {
          return doc
              .font("Helvetica")
              .fontSize(7)
              .heightOfString(col || "", { width: columnWidths[index] - 10 });
      });

      rowHeight = Math.max(...cellHeights) + 10;

      // Alternate row background color
      doc.lineWidth(0.5);
      doc
          .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
          .stroke("black")
          .fill();

      // Draw cell contents and vertical borders
      let currentX = startX;
      row.columns.forEach((col, index) => {
          doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor("black")
              .text(col || "", currentX + 5, startY + 5, {
                  width: columnWidths[index] - 10,
                  baseline: "hanging",
                  align: "left",
              });

          // Draw vertical lines for columns
          doc.strokeColor("black").lineWidth(0.5);
          doc
              .moveTo(currentX + columnWidths[index], startY)
              .lineTo(currentX + columnWidths[index], startY + rowHeight)
              .stroke();

          currentX += columnWidths[index];
      });

      // Move to the next row
      startY += rowHeight;
  });

  // Ensure table border ends properly
  doc.stroke();
}

const tableDatatenv = [
//   {
//       configurationIndex: 0, // First row: 3 columns
//       columns: ["9", "Annual Percentage Rate (APR) (%)", "27.88%"],
//   },
//   {
//       configurationIndex: 1, // Second row: 2 columns
//       columns: ["10", "Details of Contingent Charges (in ₹ or %, as applicable)"],
//   },
  {
      configurationIndex: 2, // Rows 3 to 7: 3 columns
      columns: [
          "(i)",
          "Penal charges, if any, in case of delayed payment",
          "2% per month on the Outstanding Dues plus, applicable Taxes",
      ],
  },
  {
      configurationIndex: 2,
      columns: [
          "(ii)",
          "Other penal charges, if any",
          "2% per month on the Outstanding Dues plus, applicable Taxes",
      ],
  },
  {
      configurationIndex: 2,
      columns: [
          "(iii)",
          "Foreclosure charges, if applicable",
          "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
      ],
  },
  {
      configurationIndex: 2,
      columns: [
          "(iv)",
          "Charges for switching of loans from floating to fixed rate and vice versa",
          "Not Applicable",
      ],
  },
  {
      configurationIndex: 2,
      columns: [
          "(v)",
          "Any other charges (please specify)",
          "Not Applicable",
      ],
  },
];

// Call the function with your doc object and table data
generateFeeChargesTableFromThirdRowtenv(doc, tableDatatenv);
doc.moveDown()
doc
  .font('Helvetica-Bold')
  .fontSize(7)
  .text(`Part 2 (Other qualitative information)`,startX, doc.y, { align: "left"});
  doc.moveDown(0.1)

function generateThreeColumnTable(doc, tableDatatab) {
  const startX = 50; // Starting X-coordinate
  let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
  const columnWidths = [61, 210, 230] // Widths for the three columns

  tableDatatab.forEach((row, rowIndex) => {
      // Set default row height
      let rowHeight = 15;

      // Dynamically calculate the height of each cell's content
      const cellHeights = row.columns.map((col, index) => {
          return doc
              .font("Helvetica")
              .fontSize(7)
              .heightOfString(col || "", { width: columnWidths[index] - 10 });
      });

      rowHeight = Math.max(...cellHeights) + 10;

      // Alternate row background color
      doc.lineWidth(0.5);
      doc
          .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
          .stroke("black")
          .fill();

      // Draw cell contents and vertical borders
      let currentX = startX;
      row.columns.forEach((col, index) => {
          doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor("black")
              .text(col || "", currentX + 5, startY + 5, {
                  width: columnWidths[index] - 10,
                  baseline: "hanging",
                  align: "left",
              });

          // Draw vertical lines for columns
          doc.strokeColor("black").lineWidth(0.5);
          doc
              .moveTo(currentX + columnWidths[index], startY)
              .lineTo(currentX + columnWidths[index], startY + rowHeight)
              .stroke();

          currentX += columnWidths[index];
      });

      // Move to the next row
      startY += rowHeight;
  });

  // Ensure table border ends properly
  doc.stroke();
}

const tableDatatab = [
{
    columns: [
        "1", 
        "Clause of Loan agreement relating to engagement of recovery agents",
        "Annexure II – Clause 1"
    ],
},
{
    columns: [
        "2", 
        "Clause of Loan agreement which details grievance redressal mechanism",
        "Annexure II – Clause 2"
    ],
},
{
    columns: [
        "3", 
        "Phone number and email id of the nodal grievance redressal officer",
        `1. Ratnaafin Capital Private Limited
Grievance Officer: Mr. Bhavesh Patel
Designation: VP-Operations

For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.

2. Fin Coopers Capital Private Limited
Grievance Officer: Shakti Singh

For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
    ],
},
];

generateThreeColumnTable(doc, tableDatatab);

function generateDynamicTable(doc, tableDatady, columnWidths) {
const startX = 50; // Starting X-coordinate
let startY = doc.y + 10; // Starting Y-coordinate

tableDatady.forEach((row, rowIndex) => {
  const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
  if (!Array.isArray(rowWidths)) {
      console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
      return;
  }

  let rowHeight = 15;

  // Dynamically calculate the height of each cell's content
  const cellHeights = row.map((col, index) => {
      const width = rowWidths[index] || 0; // Default to 0 if width is missing
      return doc
          .font("Helvetica")
          .fontSize(7)
          .heightOfString(col || "", { width: width - 10 });
  });

  // Use the maximum height for the row
  rowHeight = Math.max(...cellHeights, 15) + 10;

  // Draw the row background
  doc.lineWidth(0.5);
  doc
      .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
      .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
      .stroke("black")
      .fill();

  // Draw each cell in the row
  let currentX = startX;
  row.forEach((col, index) => {
      const width = rowWidths[index] || 0;
      doc
          .font("Helvetica")
          .fontSize(7)
          .fillColor("black")
          .text(col || "", currentX + 5, startY + 5, {
              width: width - 10,
              align: "left",
          });

      // Draw column borders
      doc.strokeColor("black").lineWidth(0.5);
      doc
          .moveTo(currentX + width, startY)
          .lineTo(currentX + width, startY + rowHeight)
          .stroke();

      currentX += width;
  });

  startY += rowHeight; // Move to the next row
});

// Draw table border
// doc.stroke();
}
const tableDatady = [
["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
["Name of the originating RE, along with its fund", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
["Fin Coopers Capital Pvt Ltd-0%", "Ratnaafin Capital Pvt Ltd-100%", `${allPerameters.interestRate}%`],
["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
    `Fin Coopers Capital Private Limited:
Website: https://www.fincoopers.com/
Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
Email ID: INFO@FINCOOPERS.COM
Contact No.: 07314902200`]
];

const columnWidths = [
// [50, 245, 200], // Row 1
// [50, 445],      // Row 2
// [165, 165, 165],// Row 3
// [165, 165, 165],// Row 4
// [50, 445],      // Row 5
// [247, 248],     // Row 6
// [247, 248]      // Row 7
// [50, 325, 120], // Row 1
// [50, 445],      // Row 2
// [165, 165, 165],// Row 3
// [165, 165, 165],// Row 4
// [50, 445],      // Row 5
// [245, 250],     // Row 6
// [245, 249],     // Row 7
// [50, 447],      // Row 8
// [245, 250],     // Row 9
// [245, 250]      //
[50, 325, 128],  // Row 1
[50, 453],       // Row 2
[165, 165, 173], // Row 3
[165, 165, 173], // Row 4
[50, 453],       // Row 5
[245, 258],      // Row 6
[245, 258],      // Row 7
[50, 453],       // Row 8
[245, 258],      // Row 9
[245, 258]       // Row 10

];

// Call the function
generateDynamicTable(doc, tableDatady, columnWidths);



    
// addFooter()

    // { field1: "", field2: "",field3A: "One-time/Recurring", field3B:"Amount (in ₹) or Percentage (%) as applicable",field4A: "One-time/Recurring",field4B: "One-time/Recurring", },
  
    // doc.addPage();
    // addLogo();
    // drawBorder();
    // doc.moveDown(7);

//     function generateThreeColumnTable(doc, tableDatatab) {
//       const startX = 50; // Starting X-coordinate
//       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
//       const columnWidths = [50, 210, 230] // Widths for the three columns
  
//       tableDatatab.forEach((row, rowIndex) => {
//           // Set default row height
//           let rowHeight = 15;
  
//           // Dynamically calculate the height of each cell's content
//           const cellHeights = row.columns.map((col, index) => {
//               return doc
//                   .font("Helvetica")
//                   .fontSize(8)
//                   .heightOfString(col || "", { width: columnWidths[index] - 10 });
//           });
  
//           rowHeight = Math.max(...cellHeights) + 10;
  
//           // Alternate row background color
//           doc.lineWidth(0.5);
//           doc
//               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
//               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
//               .stroke("black")
//               .fill();
  
//           // Draw cell contents and vertical borders
//           let currentX = startX;
//           row.columns.forEach((col, index) => {
//               doc
//                   .font("Helvetica")
//                   .fontSize(8)
//                   .fillColor("black")
//                   .text(col || "", currentX + 5, startY + 5, {
//                       width: columnWidths[index] - 10,
//                       baseline: "hanging",
//                       align: "left",
//                   });
  
//               // Draw vertical lines for columns
//               doc.strokeColor("black").lineWidth(0.5);
//               doc
//                   .moveTo(currentX + columnWidths[index], startY)
//                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
//                   .stroke();
  
//               currentX += columnWidths[index];
//           });
  
//           // Move to the next row
//           startY += rowHeight;
//       });
  
//       // Ensure table border ends properly
//       doc.stroke();
//   }

//   const tableDatatab = [
//     {
//         columns: [
//             "1", 
//             "Clause of Loan agreement relating to engagement of recovery agents",
//             "Annexure II – Clause 1"
//         ],
//     },
//     {
//         columns: [
//             "2", 
//             "Clause of Loan agreement which details grievance redressal mechanism",
//             "Annexure II – Clause 2"
//         ],
//     },
//     {
//         columns: [
//             "3", 
//             "Phone number and email id of the nodal grievance redressal officer",
//             `1. Ratnaafin Capital Private Limited
// Grievance Officer: Mr. Bhavesh Patel
// Designation: VP-Operations

// For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.

// 2. Fin Coopers Capital Private Limited
// Grievance Officer: Shakti Singh

// For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
//         ],
//     },
// ];

// generateThreeColumnTable(doc, tableDatatab);

// function generateDynamicTable(doc, tableDatady, columnWidths) {
//   const startX = 50; // Starting X-coordinate
//   let startY = doc.y + 10; // Starting Y-coordinate

//   tableDatady.forEach((row, rowIndex) => {
//       const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
//       if (!Array.isArray(rowWidths)) {
//           console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
//           return;
//       }

//       let rowHeight = 15;

//       // Dynamically calculate the height of each cell's content
//       const cellHeights = row.map((col, index) => {
//           const width = rowWidths[index] || 0; // Default to 0 if width is missing
//           return doc
//               .font("Helvetica")
//               .fontSize(8)
//               .heightOfString(col || "", { width: width - 10 });
//       });

//       // Use the maximum height for the row
//       rowHeight = Math.max(...cellHeights, 15) + 10;

//       // Draw the row background
//       doc.lineWidth(0.5);
//       doc
//           .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
//           .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
//           .stroke("black")
//           .fill();

//       // Draw each cell in the row
//       let currentX = startX;
//       row.forEach((col, index) => {
//           const width = rowWidths[index] || 0;
//           doc
//               .font("Helvetica")
//               .fontSize(8)
//               .fillColor("black")
//               .text(col || "", currentX + 5, startY + 5, {
//                   width: width - 10,
//                   align: "left",
//               });

//           // Draw column borders
//           doc.strokeColor("black").lineWidth(0.5);
//           doc
//               .moveTo(currentX + width, startY)
//               .lineTo(currentX + width, startY + rowHeight)
//               .stroke();

//           currentX += width;
//       });

//       startY += rowHeight; // Move to the next row
//   });

//   // Draw table border
//   doc.stroke();
// }



// const tableDatady = [
//   ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
//     ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
//     ["Name of the originating RE, along with its function", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
//     ["Fin Coopers Capital Pvt Ltd-0%", "Ratna Fin Capital Pvt Ltd-100%", "25%"],
//     ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
//     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
//     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
//     ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
//     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
//     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
//         `Fin Coopers Capital Private Limited:
// Website: https://www.fincoopers.com/
// Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
// Email ID: INFO@FINCOOPERS.COM
// Contact No.: 07314902200`]
// ];

// const columnWidths = [
//   // [50, 245, 200], // Row 1
//   // [50, 445],      // Row 2
//   // [165, 165, 165],// Row 3
//   // [165, 165, 165],// Row 4
//   // [50, 445],      // Row 5
//   // [247, 248],     // Row 6
//   // [247, 248]      // Row 7
//   [50, 325, 120], // Row 1
//     [50, 445],      // Row 2
//     [165, 165, 165],// Row 3
//     [165, 165, 165],// Row 4
//     [50, 445],      // Row 5
//     [245, 247],     // Row 6
//     [245, 247],     // Row 7
//     [50, 447],      // Row 8
//     [245, 247],     // Row 9
//     [245, 247]      //
// ];

// // Call the function
// generateDynamicTable(doc, tableDatady, columnWidths);


  
////    addFooter()
    // Finalize the PDF
   
   
    function drawTableForAmotization(tableData,loanDataForTable) {
      // Some layout constants
      const PAGE_HEIGHT = doc.page.height;
      const PAGE_BOTTOM_MARGIN = doc.page.margins.bottom;
      const rowHeight = 20;
    
      // Starting X/Y positions
      let startX = 50;
      // doc.y is wherever the PDF "cursor" currently is. We'll add 10 for spacing.
      let startY = doc.y + 10;
    
      // Column widths (6 columns total):
      // Adjust these numbers as needed to fit your layout
      const columnWidths = [50, 90, 80, 90, 80, 90];
    
      // Thinner stroke for borders
      doc.lineWidth(0.2);
    
      //-----------
      // 1) FUNCTION: Draw the big "Repayment Schedule" title bar
      //-----------
      function drawScheduleTitle() {
        // This "title bar" spans across all 6 columns
        const totalTableWidth = columnWidths.reduce((acc, w) => acc + w, 0);
    
        // Draw the filled rectangle for the title
        doc
          .rect(startX, startY, totalTableWidth, rowHeight)
          .fillAndStroke('#00bfff', '#000000');
    
        // Write the title text
        doc
          .font(fontBold)
          .fillColor('black')
          .fontSize(9.5)
          .text(
            'Repayment Schedule',
            startX + 5,
            startY + 5,
            {
              baseline: 'hanging',
              // If you want to truly center across the entire width:
              // width: totalTableWidth,
              align: 'center'
            }
          );
          startY += rowHeight + 15
          loanDataForTable.forEach((row) => {
            // Before drawing each row, check for possible page overflow
        
            // Current X resets for each row
            let currentX = startX;
        
            // Choose row fill color (e.g., always white, or alternate, etc.)
            const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
        
            // Column 1: Month
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, 100, rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.field), currentX + 5, startY + 5, { baseline: 'hanging',width:100, align:"left" });
            currentX += 100;
        
            // Column 2: Opening Principal
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, 100, rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.value), currentX + 5, startY + 5, { baseline: 'hanging',width:90, align:"right" });
            currentX += 100;
    
            // Move down to the next row
            startY += rowHeight;
          });
    
        // Move Y down by rowHeight
        startY += rowHeight;
      }
    
      //-----------
      // 2) FUNCTION: Draw the header row with column names
      //-----------
      function drawHeaderRow() {
        // 6 columns:
        // 1) month
        // 2) openingPrincipal
        // 3) monthlyPayment
        // 4) principalPayment
        // 5) interestPayment
        // 6) remainingBalance
    
        const headers = [
          'Month',
          'Opening Principal',
          'Monthly Payment',
          'Principal Payment',
          'Interest Payment',
          'Remaining Balance'
        ];
    
        let currentX = startX;
    
        for (let i = 0; i < headers.length; i++) {
          doc
            .rect(currentX, startY, columnWidths[i], rowHeight)
            .fillAndStroke('#66ee79', '#000000')
            .fill();
    
          doc
            .font(fontBold)
            .fontSize(9)
            .fillColor('black')
            .text(headers[i], currentX + 5, startY + 5, { baseline: 'hanging' });
    
          currentX += columnWidths[i];
        }
    
        // Move Y down by rowHeight
        startY += rowHeight;
      }
    
      //-----------
      // 3) FUNCTION: Check for page overflow & insert new page if needed
      //-----------
      function checkPageOverflow() {
        // If adding another row will go beyond the page bottom, do a page break:
        if (startY + rowHeight > PAGE_HEIGHT - PAGE_BOTTOM_MARGIN) {
          // Add a new page
          doc.addPage();
    
          // Your custom functions:
          addLogo();
          drawBorder();
    
          // Move down a bit after the border
          doc.moveDown(5);
    
          // Reset startY to current doc.y (top of the new page)
          startX = 50
          startY = doc.y + 10;
          doc.lineWidth(0.2);
  
    
          // Re-draw the table title and header row on the new page
          drawHeaderRow();
        }
      }
    
      //-----------
      // 4) START: Actually draw the table now
      //-----------
    
      // Draw the main "Repayment Schedule" title bar first
      drawScheduleTitle();
    
      // Then draw the header row (column titles)
      drawHeaderRow();
    
  
      // Now loop over your table data rows
      tableData.forEach((row) => {
        // Before drawing each row, check for possible page overflow
        checkPageOverflow();
    
        // Current X resets for each row
        let currentX = startX;
    
        // Choose row fill color (e.g., always white, or alternate, etc.)
        const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
    
        // Column 1: Month
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[0], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.month), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[0];
    
        // Column 2: Opening Principal
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[1], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.openingPrincipal), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[1];
    
        // Column 3: Monthly Payment
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[2], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.monthlyPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[2];
    
        // Column 4: Principal Payment
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[3], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.principalPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[3];
    
        // Column 5: Interest Payment
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[4], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.interestPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[4];
    
        // Column 6: Remaining Balance
        doc.fillColor(rowFillColor)
          .rect(currentX, startY, columnWidths[5], rowHeight)
          .stroke()
          .fill();
        doc.font(font)
          .fontSize(8)
          .fillColor('black')
          .text(String(row.remainingBalance), currentX + 5, startY + 5, { baseline: 'hanging' });
        currentX += columnWidths[5];
    
        // Move down to the next row
        startY += rowHeight;
      });
      
      // Optionally, continue adding content after the table ...
    }
    
  
    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(5);
   
    const loanTableData1 = calculateLoanAmortization(
      allPerameters.loanAmount,
      allPerameters.tenureinMonths,
      allPerameters.interestRate,
      "2025-01-01"
    );
    let loanDataForTable = [{
      field:"Loan Amount (Rs.)",
      value: allPerameters.loanAmount
    },
    {
      field:"Loan Tenure (Month)",
      value: allPerameters.tenureinMonths
    },
    {
      field:"ROI (%)",
      value: allPerameters.interestRate
    },
    {
      field:"EMI (Rs.)",
      value: allPerameters.emiAmount
    }]

    console.log(allPerameters)
    drawTableForAmotization(loanTableData1,loanDataForTable);


    doc.addPage();
    addLogo();
    drawBorder();
    doc.moveDown(5);

  //   function DRAWTABLE123(tableTitle, tableData) {
  //     const startX = 50;
  //     let startY = doc.y + 10;
  //     const columnWidths = [500];
  //     const indexWidth = 30;
  //     const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
  //     const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
  
  //     // Draw table title with a colored header
  //     doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
  //     doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
  //         .text(tableTitle, startX + 5, startY + 5, { align: 'center' });
  
  //     startY += 20; // Move down for the first row
  
  //     let sectionIndex = null; // Track the section index to span the column
  
  //     // Render each row in the table
  //     tableData.forEach((row, rowIndex) => {
  //         // Apply custom style for row 1 (title2)
          
  
  //         // Measure text height for row.field1 and row.value1
  //         const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
  //         const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
  
  //         // Calculate row height based on the tallest content
  //         const rowHeight = Math.max(20, field1Height, value1Height) + 10; // Adding padding for better spacing
  
  //         // Only display the index once per section, in the first row
  //         const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
  //         if (row.index) {
  //             sectionIndex = row.index; // Set current section index
  //         }
  
  //         // Draw the index in the first column (only for the first row of each section)
  //         doc.fillColor('#ffffff')
  //             .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Stroke color set to black
  //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
  //             .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
  
  //         // Draw the key in the second column
  //         doc.fillColor('#f5f5f5')
  //             .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
  //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
  //             .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
  
  //         // Draw the value in the third column
  //         doc.fillColor('#ffffff')
  //             .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
  //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
  //             .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
  
  //         // Move startY down by rowHeight for the next row
  //         startY += rowHeight;
  //     });
  // }
  

  function DRAWTABLE123(tableTitle, tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const columnWidths = [500];
    const indexWidth = 30;
    const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
    const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
  
    // Draw table title with a colored header
    doc.lineWidth(0.5); // Set a thin border for the table
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
        doc.font('Helvetica').fillColor('black').fontSize(7.2)
            .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
  
        // Draw the key in the second column
        doc.fillColor('#f5f5f5')
            .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
        doc.font('Helvetica').fillColor('black').fontSize(7.2)
            .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
  
        // Draw the value in the third column
        doc.fillColor('#ffffff')
            .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
        doc.font('Helvetica').fillColor('black').fontSize(7.2)
            .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
  
        // Move startY down by rowHeight for the next row
        startY += rowHeight;
    });
  }
  
 



  const scheduleOfCharges = [
    { index: "sr.No", field1: "Particulars of Charges", value1: "Charge Details" },

    { index: "1", field1: "Repayment Instruction / Instrument Return Charges / PDC / ECS / NACH Bounce Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
    { index: "2", field1: "Repayment Mode Swap Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
    { index: "3", field1: "Penal Charges", value1: "- 2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan installments\n- 2% per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter" },
    { index: "4", field1: "Duplicate Statement Issuance Charges (SOA / RPS)", value1: "Free once in a Financial Year. Rs.250/- (Plus GST as applicable)" },
    { index: "5", field1: "Cheque / NACH Representation Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
    { index: "6", field1: "Duplicate Amortization Schedule Issuance Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
    { index: "7", field1: "Document Retrieval Charges", value1: "Rs.500/- Per Instance per set (Plus GST as applicable)" },
    { index: "8", field1: "Charges for Subsequent Set of Photocopy of Loan Agreement/Documents Were Requested by Borrower", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
    { index: "9", field1: "Stamp Duty Charges", value1: "As applicable in the state stamp act" },
    { index: "10", field1: "Prepayment Charges", value1: "No prepayment allowed till completion of 12 months from the date of 1st disbursement. After completion of 12 months from the date of 1st disbursement, prepayment from personal funds may be made without incurring any fees. In case of balance transfer, 4% charges will be applicable." },
    { index: "11", field1: "Foreclosure Charges", value1: "In case of foreclosure of Loan from Owned Funds, no Foreclosure Charges will be applicable. In case of balance transfer, 4% of the Outstanding Principal Amount will be applicable." },
    { index: "12", field1: "Administrative Charges / Processing Fees & Other Charges", value1: "Nil" },
    { index: "13", field1: "Charges for Duplicate NOC / No Due Certificate", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
    { index: "14", field1: "Charges for Revalidation NOC", value1: "Rs. 250/- Per Instance per set (Plus GST as applicable)" },
    { index: "15", field1: "Cersai Charge", value1: "- When facility amount is equal to Rs. 5 Lacs or lesser, Rs. 50 plus GST\n- When facility amount is greater than Rs.5 Lacs, Rs. 100 plus GST" },
    { index: "16", field1: "Login Fees", value1: "Rs.1950/- (Inclusive of all Applicable Taxes)" },
    { index: "17", field1: "Processing Fees", value1: "2% of loan amount + Applicable taxes" },
    { index: "18", field1: "Documentation Charges", value1: "2% of loan amount + Applicable taxes (For under construction cases 3% of loan amount + Applicable taxes)" },
    { index: "19", field1: "Issuance of Duplicate Income Tax Certificate", value1: "NIL" },
    { index: "20", field1: "Legal / Collections / Vehicle Storage / Repossession and Incidental Charges", value1: "As per Actuals" }
  ];

  DRAWTABLE123("Schedule of Charges (MITC)", scheduleOfCharges);



    doc.end();
  

    // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
    // doc.pipe(fs.createWriteStream(pdfPath));
    
  //   const objData = {
  //     fileName: pdfFileUrl,
  //     // file: doc.toString('base64')
  //  }
  //   await initESign(objData)
  
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

  async function ratannaFinSanctionLetterPdf1(allPerameters) {
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
      // doc.moveDown(-5)
      if (fs.existsSync(pdfLogo)) {
        doc.image(pdfLogo, 400, 9, {
          fit: [160, 140],
          align: "right",
          valign: "bottom",
        });
      } else {
        console.error(`Logo file not found at: ${pdfLogo}`);
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
  
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir, { recursive: true });
    // }
  
    const timestamp = Date.now();
    // const pdfFilename = `ratnafinSanctionLatter.pdf`;
    // const pdfPath = path.join(outputDir, pdfFilename);
  
    // const doc = new PDFDocument({ margin: 50, size: "A4" });
    // const stream = fs.createWriteStream(pdfPath);
  
    // doc.pipe(stream);
  
    // Add logo and border to the first page
    addLogo();
    drawBorder();
    doc.moveDown(5);
    
      doc
      .fontSize(9)
      .font(fontBold)
      .text("PRIVATE AND CONFIDENTIAL", { align: "center", underline: true });
    doc.moveDown(2);
  
    const startX = 50; // Set a left margin
    const startY = doc.y; // Get the current Y position
    doc
      .fontSize(7)
      .font('Helvetica')
      .text(`Sanction Letter No.:-${allPerameters.pENDENCYlOANnumber}`, startX, doc.y, { align: "left", x: 50 }) // Adjusting x to align left
      .text(`Date: ${allPerameters.sanctionpendencyDate}`, { align: "right", x: 450 })
      .moveDown(1);
    
    doc
      .font(fontBold)
      .fontSize(8)
      .text(`CUSTOMER NAME:${allPerameters.customerName}`, startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
    
    doc
      .font("Helvetica")
      .fontSize(8)
      .text(`address:${allPerameters.address}`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
    
    doc
      .font(fontBold)
      .fontSize(8)
      .text(`K/A: ${allPerameters.loanBorrowerName},${allPerameters.loanCoborrowerName},${allPerameters.loanGuarantorName}`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
    
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(`(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\nWith reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\nYour loan account details and the loan repayment schedule are attached herewith for your reference.`, { align: "left", x: 50 })
      .moveDown(1);
    
    // Define table drawing function with left alignment adjustments
    // function drawTable(tableData) {
    //     const startX = 50; // Adjusting startX for left alignment
    //     let startY = doc.y + 10;
    //     const columnWidths = [500];
      
    //     const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    //     const valueWidth = Math.round((columnWidths[0] * 1) / 2);
      
    //     tableData.forEach((row, rowIndex) => {
    //         let rowHeight = 15;
    
    //         const field1TextHeight = doc
    //             .font(font)
    //             .fontSize(7.2)
    //             .heightOfString(row.field1, { width: keyWidth });
            
    //         let value1TextHeight = 0;
    //         if (row.value1) {
    //             value1TextHeight = doc
    //                 .font(font)
    //                 .fontSize(7.2)
    //                 .heightOfString(row.value1, { width: valueWidth });
    //         }
    
    //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //         if (!row.value1) {
    //             doc
    //                 .fillColor("blue")
    //                 .rect(startX, startY, columnWidths[0], rowHeight)
    //                 .stroke("black")
    //                 .fill();
    
    //             doc
    //                 .font(font)
    //                 .fillColor("black")
    //                 .fontSize(7.2)
    //                 .text(row.field1, startX + 5, startY + 5, {
    //                     baseline: "hanging",
    //                     width: columnWidths[0],
    //                 });
    //         } else {
    //             doc.lineWidth(0.5);
    //             doc
    //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //                 .rect(startX, startY, keyWidth, rowHeight)
    //                 .stroke("black")
    //                 .fill();
    
    //             doc
    //                 .font(font)
    //                 .fillColor("black")
    //                 .fontSize(7.2)
    //                 .text(row.field1, startX + 5, startY + 5, {
    //                     baseline: "hanging",
    //                     width: keyWidth,
    //                 });
    
    //             doc
    //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //                 .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //                 .stroke()
    //                 .fill();
    
    //             doc
    //                 .font(font)
    //                 .fillColor("black")
    //                 .fontSize(7.2)
    //                 .text(row.value1, startX + keyWidth + 5, startY + 5, {
    //                     baseline: "hanging",
    //                     width: valueWidth,
    //                 });
    //         }
    //         startY += rowHeight;
    //     });
    // }
    function drawTable(tableData) {
      const startX = 50; // Adjusting startX for left alignment
      let startY = doc.y + 10;
      const columnWidths = [500];
    
      const keyWidth = Math.round((columnWidths[0] * 1) / 2);
      const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    
      tableData.forEach((row, rowIndex) => {
        let rowHeight = 15;
    
        // Calculate text height for dynamic row size
        const field1TextHeight = doc
          .font(font)
          .fontSize(7.2)
          .heightOfString(row.field1, { width: keyWidth });
    
        let value1TextHeight = 0;
        if (row.value1) {
          value1TextHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.value1, { width: valueWidth });
        }
    
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
        // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
        const isSpecialRow =
          row.field1.toUpperCase() === "CHARGES" ||
          row.field1.toUpperCase() === "NEW LOAN DETAILS";
    
        // Row background and border for special rows
        if (isSpecialRow) {
          doc
            .fillColor("#00BFFF") // Background color
            .rect(startX, startY, columnWidths[0], rowHeight)
            .fill()
            .stroke("black", 0.5); // Thin border
    
          doc
            .font(font)
            .fillColor("black") // Text color
            .fontSize(7.2)
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: columnWidths[0],
            });
        } else {
          // Normal rows
          doc.lineWidth(0.5); // Thin border for regular rows
    
          // Key Column
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, keyWidth, rowHeight)
            .stroke("black")
            .fill();
    
          doc
            .font(font)
            .fillColor("black")
            .fontSize(7.2)
            .text(row.field1, startX + 5, startY + 5, {
              baseline: "hanging",
              width: keyWidth,
            });
    
          // Value Column
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + keyWidth, startY, valueWidth, rowHeight)
            .stroke("black")
            .fill();
    
          doc
            .font(font)
            .fillColor("black")
            .fontSize(7.2)
            .text(row.value1, startX + keyWidth + 5, startY + 5, {
              baseline: "hanging",
              width: valueWidth,
            });
        }
    
        // Move to the next row
        startY += rowHeight;
      });
    }
    
        
      const loanTableData = [
        { field1: "NEW LOAN DETAILS" },
        { field1: "Customer ID", value1: `${allPerameters.customerID}` },
        { field1: "Loan Borrower name", value1: `${allPerameters.loanBorrowerName}` },
        { field1: "Loan Co-borrower name", value1: `${allPerameters.loanCoborrowerName}` },
        // { field1: "Loan Co-borrower name-2", value1: `${allPerameters.loanCoborrowerNameTwo}` },
        { field1: "Loan Guarantor name", value1: `${allPerameters.loanGuarantorName}` },
        { field1: "Product", value1: `${allPerameters.product}` },
        { field1: "Loan Amount", value1: `${allPerameters.loanAmount}/-${allPerameters.loanAmountinwords}` },
        { field1: "Description of Collateral Property", value1: `As per Annexure I
  ` },
        // { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
        {
          field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}`,
        },
        {
          field1: "Purpose of Loan ", value1: `${allPerameters.PURPOSEoFlOAN}`,
        },
        {
          field1: "Tenure", value1: `${allPerameters.tenureinMonths} months`,
        },
        {
          field1: "Interest Rate",
          value1: `${allPerameters.interestRate} %`,
        },
        {
          field1: "Interest Type",
          value1:
            `Linked to Floating Reference Rate (FRR – 19.20% + ${allPerameters.interestType}%)`,
        },
        {
          field1: "EMI Amount",
          value1:
            `Rs ${allPerameters.emiAmount} for a period of ${allPerameters.tenureinMonths} months`,
        },
        { field1: "Penal charges", value1: `${allPerameters.penalCharges}` },
        {
          field1:"Prepayment Charges",
          value1: `No prepayment allowed till completion of 12 months from the date of 1st\n disbursement. After completion of 12 months from the date of 1st disburseme\n-nt, prepayment from personal funds may be made without incurring any fees.\n In case of balance transfer, 4% charges will be applicable.`,
        },
        { field1: "DSRA", value1: `${allPerameters.DSRA}` },
        {
          field1: "EMI Payment Bank ",
          value1:
           `${allPerameters.emiPaymentBank}`,
        },
        { field1: "EMI Payment Bank A/c Number", value1: `${allPerameters.emiaccNumber}` },
        {
          field1: "Mode of Payment ",
          value1:
            `${allPerameters.modeOfPayment}`,
        },
       
      ];
      drawTable(loanTableData);
      // addFooter()
  
      //-------------------------------------- new page 2-------------------------------------------------------
    
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(5);
      // function drawTable1(tableData) {
      //   const startX = 50; // Adjusting startX for left alignment
      //   let startY = doc.y + 10;
      //   const columnWidths = [500];
      
      //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
      //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
      
      //   tableData.forEach((row, rowIndex) => {
      //     let rowHeight = 15;
      
      //     // Calculate text height for dynamic row size
      //     const field1TextHeight = doc
      //       .font(font)
      //       .fontSize(7.2)
      //       .heightOfString(row.field1, { width: keyWidth });
      
      //     let value1TextHeight = 0;
      //     if (row.value1) {
      //       value1TextHeight = doc
      //         .font(font)
      //         .fontSize(7.2)
      //         .heightOfString(row.value1, { width: valueWidth });
      //     }
      
      //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //     // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
      //     const isSpecialRow =
      //       row.field1.toUpperCase() === "CHARGES" ||
      //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
      
      //     // Row background and border for special rows
      //     if (isSpecialRow) {
      //       doc
      //         .fillColor("#00BFFF") // Background color
      //         .rect(startX, startY, columnWidths[0], rowHeight)
      //         .fill()
      //         .stroke("black", 0.5); // Thin border
      
      //       doc
      //         .font(font)
      //         .fillColor("black") // Text color
      //         .fontSize(7.2)
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidths[0],
      //         });
      //     } else {
      //       // Normal rows
      //       doc.lineWidth(0.5); // Thin border for regular rows
      
      //       // Key Column
      //       doc
      //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //         .rect(startX, startY, keyWidth, rowHeight)
      //         .stroke("black")
      //         .fill();
      
      //       doc
      //         .font(font)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: keyWidth,
      //         });
      
      //       // Value Column
      //       doc
      //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //         .stroke("black")
      //         .fill();
      
      //       doc
      //         .font(font)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: valueWidth,
      //         });
      //     }
      
      //     // Move to the next row
      //     startY += rowHeight;
      //   });
      // }
  
      function drawTable1(tableData) {
        const startX = 50; // Adjusting startX for left alignment
        let startY = doc.y + 10;
        const columnWidths = [500]; // Full table width
      
        const keyWidth = Math.round((columnWidths[0] * 1) / 2);
        const valueWidth = Math.round((columnWidths[0] * 1) / 2);
      
        tableData.forEach((row, rowIndex) => {
          let rowHeight = 15;
      
          // Calculate text height for dynamic row size
          const field1TextHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.field1, { width: keyWidth });
      
          let value1TextHeight = 0;
          if (row.value1) {
            value1TextHeight = doc
              .font(font)
              .fontSize(7.2)
              .heightOfString(row.value1, { width: valueWidth });
          }
      
          rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
          // Check if the row is "CHARGES"
          const isChargesRow = row.field1.toUpperCase() === "CHARGES";
      
          // Check if the row is "ADDITIONAL FINANCIAL PRODUCTS"
          const isAdditionalProductsRow =
            row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
      
          if (isChargesRow) {
            // "CHARGES" row with blue background and thin border
            doc
              .fillColor("#00BFFF") // Blue background
              .rect(startX, startY, columnWidths[0], rowHeight)
              .fill()
              .stroke("black", 0.5); // Thin black border
      
            doc
              .font(font)
              .fillColor("black") // Text color
              .fontSize(8.5) // Slightly larger font for bold rows
              .font("Helvetica-Bold") // Bold font
              .text(row.field1, startX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidths[0],
                align: "left",
              });
          } else if (isAdditionalProductsRow) {
            // "ADDITIONAL FINANCIAL PRODUCTS" row with no background, bold font, and border
            doc
              .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
              .stroke("black");
      
            doc
              .font(font)
              .fillColor("black") // Text color
              .fontSize(8.5) // Slightly larger font for bold rows
              .font("Helvetica-Bold") // Bold font
              .text(row.field1, startX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidths[0],
                align: "left",
              });
          } else {
            // Normal rows with two columns
            doc.lineWidth(0.5); // Thin border for regular rows
      
            // Key Column
            doc
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black"); // Border for key column
      
            doc
              .font(font)
              .fontSize(7.2)
              .text(row.field1, startX + 5, startY + 5, {
                baseline: "hanging",
                width: keyWidth,
              });
      
            // Value Column
            doc
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black"); // Border for value column
      
            doc
              .font(font)
              .fontSize(7.2)
              .text(row.value1, startX + keyWidth + 5, startY + 5, {
                baseline: "hanging",
                width: valueWidth,
              });
          }
      
          // Move to the next row
          startY += rowHeight;
        });
      }
      
  
      // function drawTable1(tableData) {
      //   const startX = 50; // Adjusting startX for left alignment
      //   let startY = doc.y + 10;
      //   const columnWidths = [500]; // Full table width
      
      //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
      //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
      
      //   tableData.forEach((row, rowIndex) => {
      //     let rowHeight = 15;
      
      //     // Calculate text height for dynamic row size
      //     const field1TextHeight = doc
      //       .font(font)
      //       .fontSize(7.2)
      //       .heightOfString(row.field1, { width: keyWidth });
      
      //     let value1TextHeight = 0;
      //     if (row.value1) {
      //       value1TextHeight = doc
      //         .font(font)
      //         .fontSize(7.2)
      //         .heightOfString(row.value1, { width: valueWidth });
      //     }
      
      //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //     // Check for "CHARGES" or "NEW LOAN DETAILS" row
      //     const isSpecialRow =
      //       row.field1.toUpperCase() === "CHARGES" ||
      //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
      
      //     // Check for "ADDITIONAL FINANCIAL PRODUCTS" row
      //     const isAdditionalProductsRow =
      //       row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
      
      //     if (isSpecialRow || isAdditionalProductsRow) {
      //       // Special rows with a bold title
      //       doc
      //         .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
      //         .stroke("black");
      
      //       doc
      //         .font(font)
      //         .fontSize(8.5) // Slightly larger font for bold rows
      //         .font("Helvetica-Bold") // Bold font for special rows
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidths[0],
      //           align: "left", // Align text to the left
      //         });
      //     } else {
      //       // Normal rows with two columns
      //       doc.lineWidth(0.5); // Thin border for regular rows
      
      //       // Key Column
      //       doc
      //         .rect(startX, startY, keyWidth, rowHeight)
      //         .stroke("black"); // Border for key column
      
      //       doc
      //         .font(font)
      //         .fontSize(7.2)
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: keyWidth,
      //         });
      
      //       // Value Column
      //       doc
      //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //         .stroke("black"); // Border for value column
      
      //       doc
      //         .font(font)
      //         .fontSize(7.2)
      //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: valueWidth,
      //         });
      //     }
      
      //     // Move to the next row
      //     startY += rowHeight;
      //   });
      // }
      
      
  
      const loanSecondTable = [
        {
          field1: "CHARGES" },
        {
          field1:
            "Login Fees",
          value1:
            `${allPerameters.loginFees}`,
        },
        {
          field1:
            "Non-refundable Processing Fee",
          value1:
           `${allPerameters.nonRefundableProcessingFee}`,
        },
        {
          field1:
            "Documentation Charges",  value1:`${allPerameters.documentationCharges}`,
        },
        {
          field1:
            "Stamp duty charges",
          value1:
            `${allPerameters.stampDutyCharges}`,
        },
        {
          field1:
            "ADDITIONAL FINANCIAL PRODUCTS",
        },
        {
          field1:
            "Life Insurance Premium for Individual **",
            value1:
           `${allPerameters.lifeInsurancePremiumForIndividual}`,
        },
        {
          field1:
            "Insurance Premium for Collateral Security",
            value1:
            `${allPerameters.insurancePremiumForCollateralSecurity}`,
        },
      ]
      drawTable1(loanSecondTable);
  
      doc.moveDown(3);
  
      doc
      .font('Helvetica')
      .fontSize(8)
      .text(`[The net disbursal amount credited to your account = Loan amount – Charges and fees (additional financial products mentioned above).]\n\n *Broken period interest is charged on the loan amount from the date of disbursement to the date of EMI commencement.\n\n **Any pre-existing disease/ailments/surgeries undergone in the past need to be declared at the time of insurance acceptance otherwise the insurance claim will be repudiated.\n\nDSRA taken at the time of disbursement cannot be adjusted to POS for foreclosure. \n\nFor Disbursement done on or before the 10th of month, EMI Start date would be 10th of the following month.\n\n However, for all the Disbursements happening after 10th of the Particular Month will have EMI Start date as 10th of the month next to the following month.`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1.5);
  
      doc
      .font('Helvetica')
      .fontSize(8)
      .text(`Lock In period: The Borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount either in part or in full till the completion of 12 months of loan tenure from the 1st date of disbursement.
        
      The Lender may in its sole discretion Prospecvely increase / decrease / change the spread suitably in the event of unforeseen or
       exceponal or  exceptional changes in the money market condition taking place or occurrence of an increase cost situation.
  
  All payments to be made by the Borrower to the Lender shall be made free and clear of and without any deduction for on account of any
  taxes. If the Borrower is required to make such deduction, then, in such case, the sum payable to the Lender shall be increased to the
  extent necessary to ensure that, aer making such deduction, the Lender receives a sum equal to the sum which it would have received had
  such deduction not been made or required to be made. The Borrower shall submit the relevant tax deduction to the taxing authorities and 
  deliver to the Lender evidence reasonably satisfactory to the Lender that the tax deduction has been made (as applicable) and appropriate
  payment is paid to the relevant taxing authorities and the Lender shall there after repay such applicable tax amount to the Borrower.
  `,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1.5);
  
      doc
      .font('Helvetica')
      .fontSize(8)
      .text(`Advance Notice of 30 working days is Must before any prepayment/Part payment post lock in period\n\n Validity of Sanction letter is up to 3 months from the date of sanction.`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1.5);
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Email Address & Contact Nos to be used for customer service / for assistance required post disbursement: pna.ops@ratnaafin.com, (M) +91 9512011220`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Special Terms & Conditions: Pre-disbursement Conditions`,startX, doc.y, { align: "center", x: 50 })
      .moveDown(1);
  
  
    //   function latterTableFunction(tableData) {
    //     // Add Table Header
    //     const startX = 50;
    //     let startY = doc.y + 10;
    //     const totalWidth = 500; // Total column width
    //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
    //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    
    //     tableData.forEach((row, rowIndex) => {
    //         // Set default row height
    //         let rowHeight = 15;
    
    //         // Calculate the height of the text for field1 with word wrapping
    //         const field1TextHeight = doc
    //             .font(font)
    //             .fontSize(7.2)
    //             .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
    
    //         // Calculate the height of the text for value1 with word wrapping if it exists
    //         let value1TextHeight = 0;
    //         if (row.value1) {
    //             value1TextHeight = doc
    //                 .font(font)
    //                 .fontSize(7.2)
    //                 .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
    //         }
    
    //         // Determine the maximum height between field1 and value1 to set row height
    //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //         // Alternate row background color
    //         doc.lineWidth(0.5);
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX, startY, keyWidth, rowHeight)
    //             .stroke("black")
    //             .fill();
    
    //         // Draw text in field1 cell with word wrapping
    //         doc
    //             .font(font)
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(row.field1, startX + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: keyWidth,
    //                 height: rowHeight - 10, // Adjust the height so the text stays inside
    //                 align: "left",
    //                 wordBreak: 'break-word'  // Enable word wrapping for field1
    //             });
    
    //         // Draw the second column, even if value1 is absent
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //             .stroke()
    //             .fill();
    
    //         // Draw the `value1` text with word wrapping if present
    //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
    //         doc
    //             .font(font)
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: valueWidth,
    //                 height: rowHeight - 10, // Adjust the height so the text stays inside
    //                 align: "left",
    //                 wordBreak: 'break-word'  // Enable word wrapping for value1
    //             });
    
    //         // Draw vertical line between the columns
    //         doc.lineWidth(0.5);
    //         doc.strokeColor("black");
    //         doc.moveTo(startX + keyWidth, startY);
    //         doc.lineTo(startX + keyWidth, startY + rowHeight);
    //         doc.stroke();
    
    //         // Move to the next row position
    //         startY += rowHeight;
    //     });
    // }
  
    function latterTableFunction(tableData) { 
      // Add Table Header
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total column width
      const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
      const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  
      tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
  
          // Calculate the height of the text for field1 with word wrapping
          const field1TextHeight = doc
              .font(font)
              .fontSize(7.2)
              .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
  
          // Calculate the height of the text for value1 with word wrapping if it exists
          let value1TextHeight = 0;
          if (row.value1) {
              value1TextHeight = doc
                  .font(font)
                  .fontSize(7.2)
                  .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
          }
  
          // Determine the maximum height between field1 and value1 to set row height
          rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
          // Check if field1 contains "S. No" (case-insensitive)
          const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
  
          // Apply special row styling
          if (isSpecialRow) {
              doc
                  .fillColor("#00BFFF") // Background color for "S. No" rows
                  .rect(startX, startY, totalWidth, rowHeight)
                  .fill()
                  .stroke("black", 0.5); // Thin border
  
              // Draw text in field1 cell with special styling
              doc
                  .font(font)
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field1, startX + 5, startY + 5, {
                      baseline: "hanging",
                      width: keyWidth,
                      height: rowHeight - 10, // Adjust the height so the text stays inside
                      align: "left",
                      wordBreak: 'break-word' // Enable word wrapping for field1
                  });
  
              const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
              doc
                  .font(font)
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                      baseline: "hanging",
                      width: valueWidth,
                      height: rowHeight - 10, // Adjust the height so the text stays inside
                      align: "left",
                      wordBreak: 'break-word' // Enable word wrapping for value1
                  });
          } else {
              // Alternate row background color for non-"S. No" rows
              doc.lineWidth(0.5);
              doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, keyWidth, rowHeight)
                  .stroke("black")
                  .fill();
  
              // Draw text in field1 cell
              doc
                  .font(font)
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field1, startX + 5, startY + 5, {
                      baseline: "hanging",
                      width: keyWidth,
                      height: rowHeight - 10, // Adjust the height so the text stays inside
                      align: "left",
                      wordBreak: 'break-word' // Enable word wrapping for field1
                  });
  
              // Draw the second column, even if value1 is absent
              doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                  .stroke("black")
                  .fill();
  
              // Draw text in value1 cell
              const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
              doc
                  .font(font)
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                      baseline: "hanging",
                      width: valueWidth,
                      height: rowHeight - 10, // Adjust the height so the text stays inside
                      align: "left",
                      wordBreak: 'break-word' // Enable word wrapping for value1
                  });
          }
  
          // Draw vertical line between the columns
          doc.lineWidth(0.5);
          doc.strokeColor("black");
          doc.moveTo(startX + keyWidth, startY);
          doc.lineTo(startX + keyWidth, startY + rowHeight);
          doc.stroke();
  
          // Move to the next row position
          startY += rowHeight;
      });
  }
  
    const  PreDisbursementTablee = [
      { field1: "S. NO", value1: `Pre-disbursement Terms and Conditions` },
      { field1: "1", value1: `${allPerameters.specialTermsConditionOne}` },
      { field1: "2", value1: `5 PDCs of borrower and 2 PDC of Financial Guarantor / Third Party Gurantors are to be submitted at the time of disbursement.` },
      { field1: "3", value1: `Life insurance of the key earning member is mandatory` },
      { field1: "4", value1: `Original documents to be vetted by RCPL empanelled Vendor` },
      { field1: "5", value1: `Registered mortgage deed to be executed in favor of Ratnaafin Capital Private Limited.` },
      { field1: "6", value1: `Registered Mortgage in Favour of RCPL to be created on property.` },
      { field1: "7", value1: `No single property will be released. Complete loan to be foreclosed for release of any property under mortgage.` },
      // { field1: "8", value1: `Hypothecation on machinery to be done.` },
      // { field1: "9", value1: `Prepayment of 20% of principal outstanding can be done post one year of disbursement.` },
    ];
    
    latterTableFunction(PreDisbursementTablee);
  
  
      // addFooter()
  
  //     //-------------------------------------- new page 3-------------------------------------------------------------
     
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(9);
      
     
  
    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(` For,\n Ratnaafin Capital Private Limited\n\n Authorised Signatory\n\n\n\n\n Sanction Letter Acceptance\n\n\n I/We have read the terms and conditions mentioned in the sanction letter and accept the Same.\n\n\n Signature/thumb impression: - `,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
  
  
  //   function thumbImpressionTableFunction(tableData) {
  //     // Add Table Header
  //     const startX = 50;
  //     let startY = doc.y + 10;
  //     const totalWidth = 500; // Total column width
  //     const keyWidth = Math.round(totalWidth * 0.4); // Increase field1 width to 40% of the total width
  //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value1 column
  
  //     tableData.forEach((row, rowIndex) => {
  //         // Set default row height and add extra space for readability
  //         let rowHeight = 40; // further increased default row height
  
  //         // Calculate the height of the text for field1 and value1
  //         const field1TextHeight = doc
  //             .font(fontBold) // Bold font for field1
  //             .fontSize(7.2)
  //             .heightOfString(row.field1, { width: keyWidth });
  
  //         let value1TextHeight = 0;
  //         if (row.value1) {
  //             value1TextHeight = doc
  //                 .font(fontBold) // Bold font if value1 is "SIGNATURE"
  //                 .fontSize(7.2)
  //                 .heightOfString(row.value1, { width: valueWidth });
  //         }
  
  //         // Determine the maximum height between field1 and value1 to set row height
  //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 25 // more padding for increased row height
  
  //         // Alternate row background color
  //         doc.lineWidth(0.5);
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX, startY, keyWidth, rowHeight)
  //             .stroke("black")
  //             .fill();
  
  //         // Draw bold text in field1 cell
  //         doc
  //             .font(fontBold)
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(row.field1, startX + 5, startY + 15, { // increased vertical padding
  //                 baseline: "hanging",
  //                 width: keyWidth,
  //             });
  
  //         // Draw the second column, even if value1 is absent
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //             .stroke()
  //             .fill();
  
  //         // Draw bold text for the `value1` if it contains "SIGNATURE"
  //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
  //         doc
  //             .font(row.value1 === "SIGNATURE" ? fontBold : font) // Use bold if value is "SIGNATURE"
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(keyValueText, startX + keyWidth + 5, startY + 10, { // increased vertical padding
  //                 baseline: "hanging",
  //                 width: valueWidth,
  //             });
  
  //         // Draw vertical line between the columns
  //         doc.lineWidth(0.5);
  //         doc.strokeColor("black");
  //         doc.moveTo(startX + keyWidth, startY);
  //         doc.lineTo(startX + keyWidth, startY + rowHeight);
  //         doc.stroke();
  
  //         // Move to the next row position
  //         startY += rowHeight;
  //     });
  // }
  
  
    // const  thumbImpressionTable = [
    //   { field1: "NAME", value1: `SIGNATURE` },
    //   { field1: `BORROWERS NAME : ${allPerameters.borrowersName}`, value1: `` },
    //   { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowersName}`, value1: `` },
    //   { field1: `CO-BORROWERS NAME-2 : ${allPerameters.coBorrowersNameTwo}`, value1: `` },
    //   { field1: `GUARANTORS NAME : ${allPerameters.guarantorsName}`, value1: `` },
    // ];
  
    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`BORROWERS NAME : ${allPerameters.borrowersName}`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1)
    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`CO-BORROWERS NAME : ${allPerameters.coBorrowersName} `,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1)
    // .font('Helvetica-Bold')
    // .fontSize(8)
    // .text(`CO-BORROWERS NAME-2 : : ${allPerameters.coBorrowersNameTwo} `,startX, doc.y, { align: "left", x: 50 })
    // .moveDown(1)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`GUARANTORS NAME : ${allPerameters.guarantorsName} `,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
    
    // thumbImpressionTableFunction(thumbImpressionTable);
  doc.moveDown(6)
    doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(`Annexure I: Security Details`,startX, doc.y, { align: "left", x: 50 })
    .moveDown(1);
  
  //   function securityDetailsTableFunction(tableData) {
  //     // Add Table Header
  //     const startX = 50;
  //     let startY = doc.y + 10;
  //     const totalWidth = 500; // Total column width
  //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
  //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  
  //     tableData.forEach((row, rowIndex) => {
  //         // Set default row height
  //         let rowHeight = 15;
  
  //         // Calculate the height of the text for field1 and value1
  //         const field1TextHeight = doc
  //             .font(fontBold) // Use bold font for field1
  //             .fontSize(7.2)
  //             .heightOfString(row.field1, { width: keyWidth });
  
  //         let value1TextHeight = 0;
  //         if (row.value1) {
  //             value1TextHeight = doc
  //                 .font(font) // Use regular font for value1
  //                 .fontSize(7.2)
  //                 .heightOfString(row.value1, { width: valueWidth });
  //         }
  
  //         // Determine the maximum height between field1 and value1 to set row height
  //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
  //         // Alternate row background color
  //         doc.lineWidth(0.5);
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX, startY, keyWidth, rowHeight)
  //             .stroke("black")
  //             .fill();
  
  //         // Draw bold text in field1 cell
  //         doc
  //             .font(fontBold) // Set font to bold
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(row.field1, startX + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: keyWidth,
  //             });
  
  //         // Draw the second column, even if value1 is absent
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //             .stroke()
  //             .fill();
  
  //         // Draw only the `value1` text without any prefix
  //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
  //         doc
  //             .font(font) // Use regular font for value1
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: valueWidth,
  //             });
  
  //         // Draw vertical line between the columns
  //         doc.lineWidth(0.5);
  //         doc.strokeColor("black");
  //         doc.moveTo(startX + keyWidth, startY);
  //         doc.lineTo(startX + keyWidth, startY + rowHeight);
  //         doc.stroke();
  
  //         // Move to the next row position
  //         startY += rowHeight;
  //     });
  // }
     
  
  //   const  securityDetailsTable = [
  //     { field1: "Security Type", value1: `Collateral` },
  //     { field1: "Description", value1: `Residential property` },
  //     { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
  //     { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
  //     { field1: "Property Type", value1: `Residential property` },
  //     { field1: "Area", value1: `${allPerameters.SecurityDetailsArea}.                         | Construction - ${allPerameters.Construction}` },
  //     { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
  //   ];
    
  //   securityDetailsTableFunction(securityDetailsTable);
  
  //    addFooter()
  //     //---------------------------------------------------- new page 4 ----------------------------------------------------
  
  function securityDetailsTableFunction(tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total table width
    const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
    const valueWidth = totalWidth - keyWidth; // Value column width (70%)
    const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
  
    // Set thin border width
    const borderWidth = 0.3;
  
    tableData.forEach((row, rowIndex) => {
        let rowHeight = 15;
  
        // Row 6: Adjust for 3 columns
        if (rowIndex === 5) {
            // Calculate heights for three columns
            const heights = row.columns.map((col, i) =>
                doc.font(i === 0 ? fontBold : font).fontSize(7.2).heightOfString(col.value, { width: colWidths[i] })
            );
            rowHeight = Math.max(...heights) + 10;
  
            // Draw three-column row
            let currentX = startX;
            row.columns.forEach((col, i) => {
                // Background
                doc.lineWidth(borderWidth)
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(currentX, startY, colWidths[i], rowHeight)
                    .stroke("black")
                    .fill();
  
                // Text
                doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                    width: colWidths[i],
                    baseline: "hanging",
                });
  
                // Update X for next column
                currentX += colWidths[i];
            });
        } else {
            // Rows with 2 columns
            const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
            const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
            rowHeight = Math.max(field1Height, value1Height) + 10;
  
            // Draw key column
            doc.lineWidth(borderWidth)
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                width: keyWidth,
                baseline: "hanging",
            });
  
            // Draw value column
            doc.lineWidth(borderWidth)
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                width: valueWidth,
                baseline: "hanging",
            });
        }
  
        // Move to the next row
        startY += rowHeight;
    });
  }
  function securityDetailsTableFunction1(tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total table width
    const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
    const valueWidth = totalWidth - keyWidth; // Value column width (70%)
    const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
  
    tableData.forEach((row, rowIndex) => {
        let rowHeight = 15;
  
        // Row 6: Adjust for 3 columns
        if (rowIndex === 5) {
            // Calculate heights for three columns
            const heights = row.columns.map((col, i) =>
                doc
                    .font(i === 0 ? fontBold : font)
                    .fontSize(7.2)
                    .heightOfString(col.value, { width: colWidths[i] })
            );
            rowHeight = Math.max(...heights) + 10;
  
            // Draw three-column row
            let currentX = startX;
            row.columns.forEach((col, i) => {
                // Set thin border width
                doc.lineWidth(0.5);
  
                // Background
                doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(currentX, startY, colWidths[i], rowHeight)
                    .stroke("black")
                    .fill();
  
                // Text
                doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                    width: colWidths[i],
                    baseline: "hanging",
                });
  
                // Update X for next column
                currentX += colWidths[i];
            });
        } else {
            // Rows with 2 columns
            const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
            const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
            rowHeight = Math.max(field1Height, value1Height) + 10;
  
            // Set thin border width
            doc.lineWidth(0.5);
  
            // Draw key column
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                width: keyWidth,
                baseline: "hanging",
            });
  
            // Draw value column
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                width: valueWidth,
                baseline: "hanging",
            });
        }
  
        // Move to the next row
        startY += rowHeight;
    });
  }
  
  const securityDetailsTable1 = [
    { field1: "Security Type", value1: `Collateral` },
    { field1: "Description", value1: `Residential property` },
    { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
    { field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}` },
    { field1: "Property Type", value1: `Residential property` },
    {
        // Row 6: Three columns
        columns: [
            { value: "Land Area " },
            { value: `${allPerameters.SecurityDetailsArea} sq.ft`},
            { value: `Construction -${allPerameters.Construction} `}, // Empty column if needed
        ],
    },
    { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
  ];
  
  securityDetailsTableFunction1(securityDetailsTable1);
  
  
  // const securityDetailsTable = [
  //   { field1: "Security Type", value1: `Collateral` },
  //   { field1: "Description", value1: `Residential property` },
  //   { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
  //   { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
  //   { field1: "Property Type", value1: `Residential property` },
  //   { field1: "Area", value1: `${allPerameters.SecurityDetailsArea} | Construction - ${allPerameters.Construction}` },
  //   { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
  // ];
  
  // securityDetailsTableFunction(securityDetailsTable);
  
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(7);
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Specified Terms & Conditions: -`,startX, doc.y, { align: "center", x: 50 })
      .moveDown(0.4);
  
  
  // function termsConditionTableFunction(tableData) {
  //     // Add Table Header
  //     const startX = 50;
  //     let startY = doc.y + 10;
  //     const totalWidth = 500; // Total column width
  //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
  //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  
  //     tableData.forEach((row, rowIndex) => {
  //         // Set default row height
  //         let rowHeight = 15;
  
  //         // Calculate the height of the text for field1 and value1
  //         const field1TextHeight = doc
  //             .font(rowIndex === 0 ? fontBold : font) // Use bold font for first row only
  //             .fontSize(7.2)
  //             .heightOfString(row.field1, { width: keyWidth });
  
  //         let value1TextHeight = 0;
  //         if (row.value1) {
  //             value1TextHeight = doc
  //                 .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
  //                 .fontSize(7.2)
  //                 .heightOfString(row.value1, { width: valueWidth });
  //         }
  
  //         // Determine the maximum height between field1 and value1 to set row height
  //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
  //         // Alternate row background color
  //         doc.lineWidth(0.5);
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX, startY, keyWidth, rowHeight)
  //             .stroke("black")
  //             .fill();
  
  //         // Draw text in field1 cell (bold for the first row, normal for others)
  //         doc
  //             .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(row.field1, startX + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: keyWidth,
  //             });
  
  //         // Draw the second column, even if value1 is absent
  //         doc
  //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //             .stroke()
  //             .fill();
  
  //         // For the first row, make value1 bold, otherwise use regular font
  //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
  //         doc
  //             .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
  //             .fillColor("black")
  //             .fontSize(7.2)
  //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
  //                 baseline: "hanging",
  //                 width: valueWidth,
  //             });
  
  //         // Draw vertical line between the columns
  //         doc.lineWidth(0.5);
  //         doc.strokeColor("black");
  //         doc.moveTo(startX + keyWidth, startY);
  //         doc.lineTo(startX + keyWidth, startY + rowHeight);
  //         doc.stroke();
  
  //         // Move to the next row position
  //         startY += rowHeight;
  //     });
  // }
  function termsConditionTableFunction(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total column width
    const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
    const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    const padding = 5; // Padding to ensure text doesn't touch the border
  
    tableData.forEach((row, rowIndex) => {
      // Set default row height
      let rowHeight = 15;
  
      // Calculate the height of the text for field1 and value1
      const field1TextHeight = doc
        .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
        .fontSize(7.2)
        .heightOfString(row.field1, { width: keyWidth - 2 * padding });
  
      let value1TextHeight = 0;
      if (row.value1) {
        value1TextHeight = doc
          .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
          .fontSize(7.2)
          .heightOfString(row.value1, { width: valueWidth - 2 * padding });
      }
  
      // Determine the maximum height between field1 and value1 to set row height
      rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
  
      // Check if field1 contains "S. No" (case-insensitive match)
      const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
  
      // Apply special row styling
      if (isSpecialRow) {
        doc
          .fillColor("#00BFFF") // Background color
          .rect(startX, startY, totalWidth, rowHeight)
          .fill()
          .stroke("black", 0.5); // Thin border
  
        doc
          .font(font)
          .fillColor("black") // Text color
          .fontSize(7.2)
          .text(row.field1, startX + padding, startY + padding, {
            baseline: "hanging",
            width: keyWidth - 2 * padding,
          });
  
        const keyValueText = row.value1 || ""; // Display value1 text if present
        doc
          .font(font)
          .fillColor("black")
          .fontSize(7.2)
          .text(keyValueText, startX + keyWidth + padding, startY + padding, {
            baseline: "hanging",
            width: valueWidth - 2 * padding,
          });
      } else {
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX, startY, keyWidth, rowHeight)
          .stroke("black")
          .fill();
  
        // Draw text in field1 cell
        doc
          .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
          .fillColor("black")
          .fontSize(7.2)
          .text(row.field1, startX + padding, startY + padding, {
            baseline: "hanging",
            width: keyWidth - 2 * padding,
          });
  
        // Draw the second column, even if value1 is absent
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX + keyWidth, startY, valueWidth, rowHeight)
          .stroke("black")
          .fill();
  
        // Draw text in value1 cell
        const keyValueText = row.value1 || ""; // Display value1 text if present
        doc
          .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
          .fillColor("black")
          .fontSize(7.2)
          .text(keyValueText, startX + keyWidth + padding, startY + padding, {
            baseline: "hanging",
            width: valueWidth - 2 * padding,
          });
      }
  
      // Draw vertical line between the columns
      doc.lineWidth(0.5);
      doc.strokeColor("black");
      doc.moveTo(startX + keyWidth, startY);
      doc.lineTo(startX + keyWidth, startY + rowHeight);
      doc.stroke();
  
      // Move to the next row position
      startY += rowHeight;
    });
  }
  
  
  // function termsConditionTableFunction(tableData) {
  //   // Add Table Header
  //   const startX = 50;
  //   let startY = doc.y + 10;
  //   const totalWidth = 500; // Total column width
  //   const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
  //   const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
  
  //   tableData.forEach((row, rowIndex) => {
  //     // Set default row height
  //     let rowHeight = 15;
  
  //     // Calculate the height of the text for field1 and value1
  //     const field1TextHeight = doc
  //       .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
  //       .fontSize(7.2)
  //       .heightOfString(row.field1, { width: keyWidth });
  
  //     let value1TextHeight = 0;
  //     if (row.value1) {
  //       value1TextHeight = doc
  //         .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
  //         .fontSize(7.2)
  //         .heightOfString(row.value1, { width: valueWidth });
  //     }
  
  //     // Determine the maximum height between field1 and value1 to set row height
  //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
  
  //     // Check if field1 contains "S. No" (case-insensitive match)
  //     const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
  
  //     // Apply special row styling
  //     if (isSpecialRow) {
  //       doc
  //         .fillColor("#00BFFF") // Background color
  //         .rect(startX, startY, totalWidth, rowHeight)
  //         .fill()
  //         .stroke("black", 0.5); // Thin border
  
  //       doc
  //         .font(font)
  //         .fillColor("black") // Text color
  //         .fontSize(7.2)
  //         .text(row.field1, startX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: keyWidth,
  //         });
  
  //       const keyValueText = row.value1 || ""; // Display value1 text if present
  //       doc
  //         .font(font)
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: valueWidth,
  //         });
  //     } else {
  //       // Alternate row background color
  //       doc.lineWidth(0.5);
  //       doc
  //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //         .rect(startX, startY, keyWidth, rowHeight)
  //         .stroke("black")
  //         .fill();
  
  //       // Draw text in field1 cell (bold for the first row, normal for others)
  //       doc
  //         .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(row.field1, startX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: keyWidth,
  //         });
  
  //       // Draw the second column, even if value1 is absent
  //       doc
  //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
  //         .stroke("black")
  //         .fill();
  
  //       // Draw text in value1 cell (bold for the first row, normal for others)
  //       const keyValueText = row.value1 || ""; // Display value1 text if present
  //       doc
  //         .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: valueWidth,
  //         });
  //     }
  
  //     // Draw vertical line between the columns
  //     doc.lineWidth(0.5);
  //     doc.strokeColor("black");
  //     doc.moveTo(startX + keyWidth, startY);
  //     doc.lineTo(startX + keyWidth, startY + rowHeight);
  //     doc.stroke();
  
  //     // Move to the next row position
  //     startY += rowHeight;
  //   });
  // }
  
  
    
      const  termsConditionTable = [
        { field1: "S. No", value1: `Specified Terms & Condition` },
        { field1: "1", value1: `Registered Mortgage to be created and release cost to be borne by the customer. Security to be created cost to be borne by the Borrower or the Guarantor, as the case may be.` },
        { field1: "2", value1: `Facility is subject to satisfactory compliance of all terms and conditions as stipulated in the legal opinion report, the title of which should be clear and marketable given by the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved lawyer and the cost of which should be borne by the Borrower or the Guarantor, as the case may be.` },
        { field1: "3", value1: `Facility account will be setup subject to technical clearance of the property to be mortgaged, as assessed by RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "4", value1: `The quantum of Facility amount will be based on a satisfactory valuation report from the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved valuer.` },
        { field1: "5", value1: `The security charged to the RATNAAFIN CAPITAL PRIVATE LIMITED including property etc. should be comprehensively insured (fire, riots and other hazards like earthquake, floods, etc.) with RATNAAFIN CAPITAL PRIVATE LIMITED Clause and the policy document /a copy of the policy document to be submitted for.` },
        { field1: "6", value1: `The property shall be well maintained at all times and during the pendency of the loan if the property suffers any loss on account of natural calamities or due to riots etc., the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED without fail.` },
        { field1: "7", value1: `Borrower and the Guarantor shall not voluntarily cause any harm to the property that may in any way be detrimental to the interests of the RATNAAFIN CAPITAL PRIVATE LIMITED. You shall make up for any loss incurred to the RATNAAFIN CAPITAL PRIVATE LIMITED on account of any damages occurring to the property due to deviation from the approved plan.` },
        { field1: "8", value1: `You will ensure that the property tax is promptly paid.` },
        { field1: "9", value1: `You will not be entitled to sell, mortgage, lease, surrender or alienate the mortgaged property, or any part thereof, during the subsistence of the mortgage without prior intimation to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "10", value1: `In case of foreclosure of Loan, 4% on the principal outstanding amount will be applicable. In case of balance transfer, 4% charges will be applicable.\n\n Foreclosure charges shall not be levied on individual borrowers for floating rates loans.` },
        { field1: "11", value1: `FRR as applicable on the date of disbursement and the same shall be reset at an interval as per the internal Guidelines of RATNAAFIN CAPITAL PRIVATE LIMITED. It shall be the responsibility of the borrower(s) to inquire or avail from Ratnaafin Capital Private Limited the details thereof on the reset date specified in the agreement. RATNAAFIN CAPITAL PRIVATE LIMITED is entitled to change the reset frequency at any point of time.` },
        { field1: "12", value1: `In case of Takeover of the facility, 4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement).\n\n Takeover charges shall not be levied on individual borrowers for floating rates.` },
        { field1: "13", value1: `The Processing Fees and / or Login Fees are non-refundable.` },
        { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED is authorised to debit Processing fees and other charges / insurance premium mentioned in the sanction\n\n letter from the account/s of the firm company maintained with the Bank.` },
        { field1: "15", value1: `The Borrower and Security Providers shall be deemed to have given their express consent to the RATNAAFIN CAPITAL PRIVATE LIMITED to disclose the information and data furnished by them to the RATNAAFIN CAPITAL PRIVATE LIMITED and also those regarding the credit facility or facilities enjoyed by the borrower, conduct of accounts and guarantee obligations undertaken by guarantor to the Credit Information Companies , or any other credit bureau or RBI or any other agencies specified by RBI who are authorized to seek and publish information, upon signing the copy of the sanction letter.` },
        { field1: "16", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED also reserves the right to assign, securitize or otherwise transfer the loan hereby agreed to be granted or a portion thereof to any person or third party assignee without any notice or consent along with or without underlying security or securities whether movable and or immovable created or to be created for the benefit of the RATNAAFIN CAPITAL PRIVATE LIMITED and pursuant to which the assignee shall be entitled to all or any rights and benefits under the loan and other agreements and or the security or securities created or to be created by me or us or the security providers.` },
      ];
      
      termsConditionTableFunction(termsConditionTable);
  
  ////    addFooter()
  
  //     //----------------------------------------------------new page 5-------------------------------
  
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(9);
      function termsConditionTableFunction1(tableData) {
        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total column width
        const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
        const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
        const padding = 5; // Padding to ensure text doesn't touch the border
      
        tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
      
          // Calculate the height of the text for field1 and value1
          const field1TextHeight = doc
            .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
            .fontSize(7.2)
            .heightOfString(row.field1, { width: keyWidth - 2 * padding });
      
          let value1TextHeight = 0;
          if (row.value1) {
            value1TextHeight = doc
              .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
              .fontSize(7.2)
              .heightOfString(row.value1, { width: valueWidth - 2 * padding });
          }
      
          // Determine the maximum height between field1 and value1 to set row height
          rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
      
          // Check if field1 contains "S. No" (case-insensitive match)
          const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
      
          // Apply special row styling
          if (isSpecialRow) {
            doc
              .fillColor("#00BFFF") // Background color
              .rect(startX, startY, totalWidth, rowHeight)
              .fill()
              .stroke("black", 0.5); // Thin border
      
            doc
              .font(font)
              .fillColor("black") // Text color
              .fontSize(7.2)
              .text(row.field1, startX + padding, startY + padding, {
                baseline: "hanging",
                width: keyWidth - 2 * padding,
              });
      
            const keyValueText = row.value1 || ""; // Display value1 text if present
            doc
              .font(font)
              .fillColor("black")
              .fontSize(7.2)
              .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                baseline: "hanging",
                width: valueWidth - 2 * padding,
              });
          } else {
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
      
            // Draw text in field1 cell
            doc
              .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field1, startX + padding, startY + padding, {
                baseline: "hanging",
                width: keyWidth - 2 * padding,
              });
      
            // Draw the second column, even if value1 is absent
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black")
              .fill();
      
            // Draw text in value1 cell
            const keyValueText = row.value1 || ""; // Display value1 text if present
            doc
              .font(rowIndex === 0 ? font: font) // Bold for the first row only
              .fillColor("black")
              .fontSize(7.2)
              .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                baseline: "hanging",
                width: valueWidth - 2 * padding,
              });
          }
      
          // Draw vertical line between the columns
          doc.lineWidth(0.5);
          doc.strokeColor("black");
          doc.moveTo(startX + keyWidth, startY);
          doc.lineTo(startX + keyWidth, startY + rowHeight);
          doc.stroke();
      
          // Move to the next row position
          startY += rowHeight;
        });
      }
  
      const conditonsTable = [
        { field1: "17", value1: `In the event of any change of address for communication, any change in job, profession by you or the guarantors, the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED immediately` },
        { field1: "18", value1: `General undertaking to be taken from borrower are as mentioned below, if applicable\nThat the Firm not to pay any consideration by way of commission, brokerage, fees or any other form to guarantors directly or indirectly.That working capital funds would not be diverted for long term use\nThat none of the directors of Ratnaafin Capital Private Limited or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or of a subsidiary of the borrower or of the holding company of the borrower and that none of them hold substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrowers knowledge none of the directors of any other bank or the subsidiaries of the banks or trustees of mutual funds or venture capital funds set up by the banks or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them holds substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrower’s knowledge none of senior officials of the RATNAAFIN CAPITAL PRIVATE LIMITED or the participating banks under consortium or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them hold substantial interest in the borrower or its subsidiary or its holding company. That in case if any of the above requirement is breached, the borrower shall inform of the RATNAAFIN CAPITAL PRIVATE LIMITED the same immediately.` },
      ]
  
      termsConditionTableFunction1(conditonsTable);
      doc.moveDown(1.5)
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
      .moveDown(0.5);
  
      const  standardConditionTable = [
        { field1: "S. No", value1: `Standard Terms & Condition` },
        { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
        { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof.` },
        { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
        { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED will have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
        { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
        { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
        // { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
        // { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
        // { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        // { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
        // { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        // { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
      ];
  
      termsConditionTableFunction(standardConditionTable);
  
  ////    addFooter()
  
  //     // ------------------------------------new page 6---------------------------------------
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(7);
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
      .moveDown(0.5);
  
      const  standardConditionTablee = [
        // { field1: "S. No", value1: `Standard Terms & Condition` },
        // { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        // { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
        // { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof` },
        // { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
        // { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITEDwill have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
        // { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
        // { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
        { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
        { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
        { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
        { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
        { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
        { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
        { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
        { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
        { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
        { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
        { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
        { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
        { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
        // { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
        // { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
        // { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
        // { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
        // { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
      
      ];
  
      termsConditionTableFunction1(standardConditionTablee);
  
  ////    addFooter()
  
  
  //     //-------------------------------------new page 7--------------------------------------------------
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(5);
  
      const table = [
        //  { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
        // { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
        // { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
        // { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
        // { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
        // { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
        // { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
        // { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
        // { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
        { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
        { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
        { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
        { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
        { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        { field1: "28", value1: `For cases where charge was registered with Registrar of Companies for securities proposed with Ratnaafin Capital Private Limited, borrower will arrange satisfaction of charge post security creation with Ratnaafin Capital Private Limited.` },
        { field1: "29", value1: `CERSAI Charges for registration of security interest will be levied as follows. Non-refundable charges levied by Central Registry of Securitization of Asset Reconstruction and Security Interest of India. For Registration of Individual Security Primary and or Collateral created in favour of Ratnaafin Capital Private Limited i. When facility amount is equal to Rs 5 lacs or lesser, Rs 50 plus GST ii. When facility amount is greater than Rs 5 Lacs, Rs 100 plus GST` },
        { field1: "30", value1: `Insurance renewal condition, Borrower to submit valid copy of Insurance of the property, and other assets duly charged in favour of Ratnaafin Capital Private Limited. Further borrower to ensure that fresh copy of insurance is provided to the RATNAAFIN CAPITAL PRIVATE LIMITED within 7 days before the expiry of insurance policy. In absence of that, Cash Credit or Overdraft or Current account shall be debited towards the insurance premium amount on the date of expiry of Insurance policy.` },   
     
      ];
  
      termsConditionTableFunction1(table);
      doc.moveDown(2)
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(7);
  
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`KEY FACTS STATEMENT \n\n PART-1 Interest rate and fees / charges`,startX, doc.y, { align: "center", x: 50 })
      .moveDown(0.5);
  
      function securityDetailsTableFunction(tableData) {
        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
        const field1Width = Math.round(totalWidth * 0.1); // 10% for field1
        const field2Width = Math.round(totalWidth * 0.45); // 45% for field2
        const field3Width = totalWidth - field1Width - field2Width; // Remaining 45% for field3
    
        tableData.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
    
            // Calculate the height of the text for field1, field2, and field3
            const field1TextHeight = doc
                .font(fontBold) // Bold font for field1
                .fontSize(7.2)
                .heightOfString(row.field1, { width: field1Width });
    
            const field2TextHeight = doc
                .font(font) // Regular font for field2
                .fontSize(7.2)
                .heightOfString(row.field2, { width: field2Width });
    
            const field3TextHeight = doc
                .font(font) // Regular font for field3
                .fontSize(7.2)
                .heightOfString(row.field3, { width: field3Width });
    
            // Determine the maximum height between all fields to set row height
            rowHeight = Math.max(field1TextHeight, field2TextHeight, field3TextHeight) + 10;
    
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, totalWidth, rowHeight)
                .stroke("black")
                .fill();
    
            // Draw field1 text in the first column
            doc
                .font(fontBold) // Bold font for field1
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: field1Width,
                });
    
            // Draw field2 text in the second column
            doc
                .font(font) // Regular font for field2
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field2, startX + field1Width + 5, startY + 5, {
                    baseline: "hanging",
                    width: field2Width,
                });
    
            // Draw field3 text in the third column
            doc
                .font(font) // Regular font for field3
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field3 || "", startX + field1Width + field2Width + 5, startY + 5, {
                    baseline: "hanging",
                    width: field3Width,
                });
    
            // Draw vertical lines between columns
            doc.strokeColor("black").lineWidth(0.5);
            doc.moveTo(startX + field1Width, startY).lineTo(startX + field1Width, startY + rowHeight).stroke();
            doc.moveTo(startX + field1Width + field2Width, startY).lineTo(startX + field1Width + field2Width, startY + rowHeight).stroke();
    
            // Move to the next row position
            startY += rowHeight;
        });
    }
    
    // Table Data
    const kycTable = [
        { field1: "1", field2: "Loan proposal/ account No.", field3: `${allPerameters.pENDENCYlOANnumber}` },
        { field1: "", field2: "Type of Loan", field3: "Agri Micro Loan Against Property" },
        { field1: "2", field2: "Sanctioned Loan amount (in Rupees)", field3: `Rs.${allPerameters.loanAmount} ${allPerameters.loanAmountinwords}` },
        { field1: "3", field2: "Disbursal schedule\n (i) Disbursement in stages or 100% upfront.\n(ii) If it is stage wise, mention the clause of loan agreement having relevant details", field3: "100 % upfront / As per Clause 3 (a)" },
        { field1: "4", field2: "Loan term (year/months/days)", field3: `${allPerameters.tenureinMonths} months` },
    ];
    
    // Call the function
    securityDetailsTableFunction(kycTable);
  
    function instalmentTableFunction(tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
  
      // Determine the maximum number of fields in the table
      const maxFields = Math.max(
          ...tableData.map((row) => Object.keys(row).length)
      );
  
      // Calculate dynamic column width based on the number of fields
      const columnWidth = totalWidth / maxFields;
  
      tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
  
          // Calculate the height for each field dynamically
          const fieldHeights = Object.keys(row).map((key) => {
              return doc
                  .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                  .fontSize(7.2)
                  .heightOfString(row[key] || "", { width: columnWidth });
          });
  
          // Determine the maximum height between all fields
          rowHeight = Math.max(...fieldHeights) + 10;
  
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, totalWidth, rowHeight)
              .stroke("black")
              .fill();
  
          // Draw text for each field dynamically
          let currentX = startX;
          Object.keys(row).forEach((key, index) => {
              doc
                  .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row[key] || "", currentX + 5, startY + 5, {
                      baseline: "hanging",
                      width: columnWidth,
                  });
  
              // Draw vertical line after the column
              doc.strokeColor("black").lineWidth(0.5);
              doc
                  .moveTo(currentX + columnWidth, startY)
                  .lineTo(currentX + columnWidth, startY + rowHeight)
                  .stroke();
  
              currentX += columnWidth;
          });
  
          // Move to the next row position
          startY += rowHeight;
      });
  }
  // Table instalment data examples
  const instalmentTable = [
      { field1: "5", field2: "Instalment details" },
      { field1: "Type of instalments", field2: "Number of EPIs", field3: `EPI (Rs)`, field4: "Commencement of repayment, post sanction" },
      { field1: "Monthly", field2: `${allPerameters.tenureinMonths}`, field3: `Rs ${allPerameters.emiAmount}`, field4: `10th of the month next to the \nfollowing month` },
  ];
  // Call the function
  instalmentTableFunction(instalmentTable);
  
  // function loanTableFunction(tableData) {
  //   const startX = 50;
  //   let startY = doc.y + 10;
  //   const totalWidth = 500; // Total table width
  
  //   // Determine the maximum number of fields in the table
  //   const maxFields = Math.max(
  //     ...tableData.map((row) => Object.keys(row).length)
  //   );
  
  //   // Calculate dynamic column width based on the number of fields
  //   const columnWidth = totalWidth / maxFields;
  
  //   tableData.forEach((row, rowIndex) => {
  //     // Set default row height
  //     let rowHeight = 15;
  
  //     // Calculate the height for each field dynamically
  //     const fieldHeights = Object.keys(row).map((key) => {
  //       return doc
  //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
  //         .fontSize(7.2)
  //         .heightOfString(row[key] || "", { width: columnWidth });
  //     });
  
  //     // Determine the maximum height between all fields
  //     rowHeight = Math.max(...fieldHeights) + 10;
  
  //     // Alternate row background color
  //     doc.lineWidth(0.5);
  //     doc
  //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //       .rect(startX, startY, totalWidth, rowHeight)
  //       .stroke("black")
  //       .fill();
  
  //     // Draw text for each field dynamically
  //     let currentX = startX;
  //     Object.keys(row).forEach((key, index) => {
  //       // Draw the text for each field
  //       doc
  //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(row[key] || "", currentX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: columnWidth,
  //         });
  
  //       // Draw vertical line after the column
  //       doc.strokeColor("black").lineWidth(0.5);
  //       doc
  //         .moveTo(currentX + columnWidth, startY)
  //         .lineTo(currentX + columnWidth, startY + rowHeight)
  //         .stroke();
  
  //       currentX += columnWidth;
  //     });
  
  //     // Move to the next row position
  //     startY += rowHeight;
  //   });
  // }
  function loanTableFunction(tableData, customWidths = []) {
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total table width
  
    tableData.forEach((row, rowIndex) => {
      // Determine if custom widths are provided for the current row
      const numColumns = Object.keys(row).length;
      const rowWidths = customWidths[rowIndex] || Array(numColumns).fill(totalWidth / numColumns);
  
      // Set default row height
      let rowHeight = 15;
  
      // Calculate the height for each field dynamically
      const fieldHeights = Object.keys(row).map((key, index) => {
        return doc
          .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
          .fontSize(7.2)
          .heightOfString(row[key] || "", { width: rowWidths[index] });
      });
  
      // Determine the maximum height between all fields
      rowHeight = Math.max(...fieldHeights) + 10;
  
      // Alternate row background color
      doc.lineWidth(0.5);
      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX, startY, totalWidth, rowHeight)
        .stroke("black")
        .fill();
  
      // Draw text for each field dynamically
      let currentX = startX;
      Object.keys(row).forEach((key, index) => {
        // Draw the text for each field
        doc
          .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
          .fillColor("black")
          .fontSize(7.2)
          .text(row[key] || "", currentX + 5, startY + 5, {
            baseline: "hanging",
            width: rowWidths[index],
          });
  
        // Draw vertical line after the column
        doc.strokeColor("black").lineWidth(0.5);
        doc
          .moveTo(currentX + rowWidths[index], startY)
          .lineTo(currentX + rowWidths[index], startY + rowHeight)
          .stroke();
  
        currentX += rowWidths[index];
      });
  
      // Move to the next row position
      startY += rowHeight;
    });
  }
  
  const loanTable = [
    { field1: "6", field2: "Interest rate (%) and type (fixed or floating or hybrid)",field3: `${allPerameters.interestRate}% p.a (floating)` },
    { field1: "7", field2: "Additional Information in case of Floating rate of interest" },
    { field1: "Reference Benchmark", field2: "Benchmark rate (%) (B)", field3: "Spread (%) (S)",field4: "Final rate (%) R = (B) + (S)"  },
    { field1: "FRR", field2: "19.20%", field3: `${allPerameters.interestType}%`,field4: `${allPerameters.interestRate}%` },
  ];
  
  const customWidths = [
    [50, 300, 150], // Custom widths for the 1st row (3 columns)
    [50, 450],     // Custom widths for the 2nd row (2 columns)
    null,           // Default dynamic widths for the 3rd row
    null,           // Default dynamic widths for the 4th row
  ];
    //interestRate
  loanTableFunction(loanTable,customWidths);
  
  // function resetTableFunction(tableData) {
  //   const startX = 50;
  //   let startY = doc.y + 10;
  //   const totalWidth = 500; // Total table width
  
  //   // Determine the maximum number of fields in the table
  //   const maxFields = Math.max(
  //     ...tableData.map((row) => Object.keys(row).length)
  //   );
  
  //   // Calculate dynamic column width based on the number of fields
  //   const columnWidth = totalWidth / maxFields;
  
  //   tableData.forEach((row, rowIndex) => {
  //     // Set default row height
  //     let rowHeight = 15;
  
  //     // Calculate the height for each field dynamically
  //     const fieldHeights = Object.keys(row).map((key) => {
  //       return doc
  //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
  //         .fontSize(7.2)
  //         .heightOfString(row[key] || "", { width: columnWidth });
  //     });
  
  //     // Determine the maximum height between all fields
  //     rowHeight = Math.max(...fieldHeights) + 10;
  
  //     // Alternate row background color
  //     doc.lineWidth(0.5);
  //     doc
  //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //       .rect(startX, startY, totalWidth, rowHeight)
  //       .stroke("black")
  //       .fill();
  
  //     // Draw text for each field dynamically
  //     let currentX = startX;
  
  //     if (rowIndex === 1) {
  //       // For the second row, only span field2 and field3
  //       // Field 1 remains in the first column
  //       doc
  //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(row.field1 || "", currentX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: columnWidth, // field1 takes only the first column width
  //         });
  
  //       // Span field2 and field3 across the remaining columns
  //       currentX += columnWidth; // move to the next column for field2
  //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
  //       doc
  //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(row.field2 || "", currentX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: spanWidth, // field2 spans the rest of the row width
  //         });
  //     } else {
  //       // Regular row processing (for all other rows)
  //       Object.keys(row).forEach((key, index) => {
  //         // Draw the text for each field
  //         doc
  //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
  //           .fillColor("black")
  //           .fontSize(7.2)
  //           .text(row[key] || "", currentX + 5, startY + 5, {
  //             baseline: "hanging",
  //             width: columnWidth,
  //           });
  
  //         // Draw vertical line after the column
  //         doc.strokeColor("black").lineWidth(0.5);
  //         doc
  //           .moveTo(currentX + columnWidth, startY)
  //           .lineTo(currentX + columnWidth, startY + rowHeight)
  //           .stroke();
  
  //         currentX += columnWidth;
  //       });
  //     }
  
  //     // Move to the next row position
  //     startY += rowHeight;
  //   });
  // }
  
  // const resetTable = [
  //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
  //   { field1: "", field2: "Every 3 month" },
  // ];
    
  // resetTableFunction(resetTable);
  
  // function impactTableFunction(tableData) {
  //   const startX = 50;
  //   let startY = doc.y + 10;
  //   const totalWidth = 500; // Total table width
  
  //   // Set the number of columns explicitly (3 columns)
  //   const columns = ['field1', 'field2', 'field3'];
  
  //   // Calculate dynamic column width based on the number of columns
  //   const columnWidth = totalWidth / columns.length;
  
  //   tableData.forEach((row, rowIndex) => {
  //     // Set default row height
  //     let rowHeight = 15;
  
  //     // Calculate the height for each field dynamically
  //     const fieldHeights = columns.map((key) => {
  //       return doc
  //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
  //         .fontSize(7.2)
  //         .heightOfString(row[key] || "", { width: columnWidth });
  //     });
  
  //     // Determine the maximum height between all fields
  //     rowHeight = Math.max(...fieldHeights) + 10;
  
  //     // Alternate row background color
  //     doc.lineWidth(0.5);
  //     doc
  //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
  //       .rect(startX, startY, totalWidth, rowHeight)
  //       .stroke("black")
  //       .fill();
  
  //     // Draw text for each field dynamically
  //     let currentX = startX;
  //     columns.forEach((key, index) => {
  //       // Check if field is empty, and show blank if needed
  //       const fieldValue = row[key] || " ";
  
  //       doc
  //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
  //         .fillColor("black")
  //         .fontSize(7.2)
  //         .text(fieldValue, currentX + 5, startY + 5, {
  //           baseline: "hanging",
  //           width: columnWidth,
  //         });
  
  //       // Draw vertical line after the column
  //       doc.strokeColor("black").lineWidth(0.5);
  //       doc
  //         .moveTo(currentX + columnWidth, startY)
  //         .lineTo(currentX + columnWidth, startY + rowHeight)
  //         .stroke();
  
  //       currentX += columnWidth;
  //     });
  
  //     // Move to the next row position
  //     startY += rowHeight;
  //   });
  // }
  
  // const impactTable = [
  //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: `EPI\u20B9`,field3: "No. of EPIs" },
  //   { field1: "", field2:  `${allPerameters.epi}`,field3:  `${allPerameters.noOfEpi}` },
  // ];
    
  // impactTableFunction(impactTable);
  function chargesTableFunction11(doc, tableData, font, fontBold) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const totalWidth = 500; // Total table width
    const baseColumnWidth = totalWidth / 4; // Base column width (4 columns in total)
  
    tableData.forEach((row, rowIndex) => {
      let currentX = startX;
      let rowHeight = 15;
  
      row.forEach((cell) => {
        const colWidth = baseColumnWidth * (cell.colSpan || 1); // Adjust width by colSpan
        const fieldHeight = doc
          .font(cell.bold ? fontBold : font) // Bold if specified
          .fontSize(7.2)
          .heightOfString(cell.text, { width: colWidth });
  
        rowHeight = Math.max(rowHeight, fieldHeight + 10);
  
        // Draw cell background
        doc.lineWidth(0.5)
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(currentX, startY, colWidth, rowHeight)
          .stroke("black")
          .fill();
  
        // Draw text inside the cell
        doc.fillColor("black")
          .font(cell.bold ? fontBold : font)
          .fontSize(7.2)
          .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
  
        // Move to the next cell position
        currentX += colWidth;
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
  function chargesTableFunction1(doc, tableData, font, fontBold) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const totalWidth = 500; // Total table width
  
    tableData.forEach((row, rowIndex) => {
      let currentX = startX;
      let rowHeight = 15;
  
      row.forEach((cell) => {
        const colWidth = (totalWidth / 4) * (cell.colSpan||1); // Adjust width by colSpan
        const fieldHeight = doc
          .font(cell.bold ? fontBold : font) // Bold if specified
          .fontSize(7.2)
          .heightOfString(cell.text, { width: colWidth });
  
        rowHeight = Math.max(rowHeight, fieldHeight + 10);
  
        // Draw cell background
        doc.lineWidth(0.5)
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(currentX, startY, colWidth, rowHeight)
          .stroke("black")
          .fill();
  
        // Draw text inside the cell
        doc.fillColor("black")
          .font(cell.bold ? fontBold : font)
          .fontSize(7.2)
          .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
  
        // Move to the next cell position
        currentX += colWidth;
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
  // const tableData1 = [
  //   [
  //     { text: "Reset periodicity (Months)", colSpan: 2, bold: true },
  //     { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: true },
  //   ],
  //   [
  //     { text: "B", bold: true },
  //     { text: "S", bold: true },
  //     { text: "EPI (₹)", bold: true },
  //     { text: "No. of EPIs", bold: true },
  //   ],
  //   [
  //     { text: "Every 3 months", colSpan: 2, bold: false },
  //     { text: "14749", bold: true },
  //     { text: "61", bold: true },
  //   ],
  // ];
  
  const tableData1 = [
    [
      { text: `Reset periodicity \n(Months)`, colSpan: 2, bold: false }, // Spanning 2 columns
      { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: false }, // Spanning 2 columns
    ],
    [
      { text: "B", bold: false }, // Single column
      { text: "S", bold: false }, // Single column
      { text: "EPI (Rs)", bold: false }, // Single column
      { text: "No. of EPIs", bold: false }, // Single column
    ],
    [
      { text: "Every 3 months", colSpan: 1, bold: false },
      { text: "Every 3 months", colSpan: 1, bold: false }, // Spanning 2 columns
      // Spanning 2 columns
      { text: `Rs ${allPerameters.epi}`, bold: false }, // Single column
      { text:  `${allPerameters.noOfEpi}`, bold: false }, // Single column
    ],
  ];
  
  
  chargesTableFunction1(doc, tableData1, font, fontBold);
  
  function chargesTableFunction(tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total table width
  
    // Set the number of columns explicitly (3 columns)
    const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
  
    // Calculate dynamic column width based on the number of columns
    const columnWidth = totalWidth / columns.length;
  
    tableData.forEach((row, rowIndex) => {
      // Set default row height
      let rowHeight = 15;
  
      // Calculate the height for each field dynamically
      const fieldHeights = columns.map((key) => {
        return doc
          .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
          .fontSize(7.2)
          .heightOfString(row[key] || "", { width: columnWidth });
      });
  
      // Determine the maximum height between all fields
      rowHeight = Math.max(...fieldHeights) + 10;
  
      // Alternate row background color
      doc.lineWidth(0.5);
      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX, startY, totalWidth, rowHeight)
        .stroke("black")
        .fill();
  
      // Draw text for each field dynamically
      let currentX = startX;
      columns.forEach((key, index) => {
        // Check if field is empty, and show blank if needed
        const fieldValue = row[key] || " ";
  
        doc
          .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
          .fillColor("black")
          .fontSize(7.2)
          .text(fieldValue, currentX + 5, startY + 5, {
            baseline: "hanging",
            width: columnWidth,
          });
  
        // Draw vertical line after the column
        doc.strokeColor("black").lineWidth(0.5);
        doc
          .moveTo(currentX + columnWidth, startY)
          .lineTo(currentX + columnWidth, startY + rowHeight)
          .stroke();
  
        currentX += columnWidth;
      });
  
      // Move to the next row position
      startY += rowHeight;
    });
  }
  
  const chargesTable = [
    { field1: "8", field2: "Fee/ Charges" },
    { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
  ];
  
  chargesTableFunction(chargesTable);
  
  
  function generateFeeChargesTableFromThirdRow(doc, tableData) {
    const startX = 50; // Starting X-coordinate
    let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
    const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
  
    tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;
  
        // Dynamically calculate the height of each cell's content
        const cellHeights = Object.keys(row).map((key, index) => {
            return doc
                .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                .fontSize(8)
                .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
        });
  
        rowHeight = Math.max(...cellHeights) + 10;
  
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
            .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
            .stroke("black")
            .fill();
  
        // Draw cell contents and vertical borders
        let currentX = startX;
        Object.keys(row).forEach((key, index) => {
            doc
                .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                .fontSize(8)
                .fillColor("black")
                .text(row[key] || "", currentX + 5, startY + 5, {
                    width: columnWidths[index] - 10,
                    baseline: "hanging",
                    align: "left",
                });
  
            // Draw vertical lines for columns
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + columnWidths[index], startY)
                .lineTo(currentX + columnWidths[index], startY + rowHeight)
                .stroke();
  
            currentX += columnWidths[index];
        });
  
        // Move to the next row
        startY += rowHeight;
        doc.moveDown(1.8);
  
    });
  
    // Ensure table border ends properly
    doc.stroke();
  }
  
  const tableData = [
  {
    col1: "",
    col2: "",
    col3: "One-time/Recurring",
    col4: `Amount (in Rs) or Percentage(%) asapplicable`,
    col5: "One-time/Recurring",
    col6: `Amount (in Rs) or Percentage(%) as applicable`,
  },
  {
      col1: "(i)",
      col2: "Processing fees",
      col3: "One time",
      col4: `Rs.${allPerameters.processingfees}`,
      col5: "",
      col6: "",
  },
  {
      col1: "(ii)",
      col2: "Insurance charges",
      col3: "One time",
      col4: "",
      col5: "One time",
      col6:  `Rs.${allPerameters.insuranceCharges}`,
  },
  {
      col1: "(iii)",
      col2: "Valuation fees",
      col3: "One time",
      col4: "0",
      col5: "",
      col6: "",
  },
  {
      col1: "(iv)",
      col2: "Any other (please specify)",
      col3: "Documentation Charges, CERSAI Charges",
      col4:  `Rs.${allPerameters.docCharges} \n\nRs.${allPerameters.cersaiCharges}`,
      col5: "",
      col6: "",
  },
  ];
  
  generateFeeChargesTableFromThirdRow(doc, tableData);
  
  function generateFeeChargesTableFromThirdRowten(doc,tableDataten) {
    const startX = 50; // Starting X-coordinate
    let startY = doc.y + 10; // Starting Y-coordinate
    const columnConfigurations = [
        [80, 270, 153], // First row: Three columns
        [80, 423],      // Second row: Two columns
        [80, 200, 222], // Rows 3 to 7: Three columns
    ];
  
    tableDataten.forEach((row, rowIndex) => {
        // Determine the column configuration for the current row
        const columnWidths = columnConfigurations[row.configurationIndex];
        
        // Set default row height
        let rowHeight = 15;
  
        // Dynamically calculate the height of each cell's content
        const cellHeights = row.columns.map((col, index) => {
            return doc
                .font("Helvetica")
                .fontSize(8)
                .heightOfString(col || "", { width: columnWidths[index] - 10 });
        });
  
        rowHeight = Math.max(...cellHeights) + 10;
  
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
            .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
            .stroke("black")
            .fill();
  
        // Draw cell contents and vertical borders
        let currentX = startX;
        row.columns.forEach((col, index) => {
            doc
                .font("Helvetica")
                .fontSize(8)
                .fillColor("black")
                .text(col || "", currentX + 5, startY + 5, {
                    width: columnWidths[index] - 10,
                    baseline: "hanging",
                    align: "left",
                });
  
            // Draw vertical lines for columns
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + columnWidths[index], startY)
                .lineTo(currentX + columnWidths[index], startY + rowHeight)
                .stroke();
  
            currentX += columnWidths[index];
        });
  
        // Move to the next row
        startY += rowHeight;
    });
  
    // Ensure table border ends properly
    doc.stroke();
  
  }
  
  const tableDataten = [
    {
        configurationIndex: 0, // First row: 3 columns
        columns: ["9", "Annual Percentage Rate (APR) (%)", `${allPerameters.annualPercentageRateAprPercentage}%`],
    },
    {
        configurationIndex: 1, // Second row: 2 columns
        columns: ["10", `Details of Contingent Charges (in Rs or %, as applicable)`],
    },
    // {
    //     configurationIndex: 2, // Rows 3 to 7: 3 columns
    //     columns: [
    //         "(i)",
    //         "Penal charges, if any, in case of delayed payment",
    //         "2% per month on the Outstanding Dues plus, applicable Taxes",
    //     ],
    // },
    // {
    //     configurationIndex: 2,
    //     columns: [
    //         "(ii)",
    //         "Other penal charges, if any",
    //         "2% per month on the Outstanding Dues plus, applicable Taxes",
    //     ],
    // },
    // {
    //     configurationIndex: 2,
    //     columns: [
    //         "(iii)",
    //         "Foreclosure charges, if applicable",
    //         "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
    //     ],
    // },
    // {
    //     configurationIndex: 2,
    //     columns: [
    //         "(iv)",
    //         "Charges for switching of loans from floating to fixed rate and vice versa",
    //         "Not Applicable",
    //     ],
    // },
    // {
    //     configurationIndex: 2,
    //     columns: [
    //         "(v)",
    //         "Any other charges (please specify)",
    //         "Not Applicable",
    //     ],
    // },
  ];
  
  // Call the function with your doc object and table data
  doc.moveDown();
  generateFeeChargesTableFromThirdRowten(doc, tableDataten);
  doc.moveDown(2.5);
  
  ////    addFooter()
  
  //     //------------------------------------------------new pdf 8--------------------------------------------------------
  
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(4.8);
  
      // function resetTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Determine the maximum number of fields in the table
      //   const maxFields = Math.max(
      //     ...tableData.map((row) => Object.keys(row).length)
      //   );
      
      //   // Calculate dynamic column width based on the number of fields
      //   const columnWidth = totalWidth / maxFields;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = Object.keys(row).map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      
      //     if (rowIndex === 1) {
      //       // For the second row, only span field2 and field3
      //       // Field 1 remains in the first column
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field1 || "", currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth, // field1 takes only the first column width
      //         });
      
      //       // Span field2 and field3 across the remaining columns
      //       currentX += columnWidth; // move to the next column for field2
      //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field2 || "", currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: spanWidth, // field2 spans the rest of the row width
      //         });
      //     } else {
      //       // Regular row processing (for all other rows)
      //       Object.keys(row).forEach((key, index) => {
      //         // Draw the text for each field
      //         doc
      //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
      //           .fillColor("black")
      //           .fontSize(7.2)
      //           .text(row[key] || "", currentX + 5, startY + 5, {
      //             baseline: "hanging",
      //             width: columnWidth,
      //           });
      
      //         // Draw vertical line after the column
      //         doc.strokeColor("black").lineWidth(0.5);
      //         doc
      //           .moveTo(currentX + columnWidth, startY)
      //           .lineTo(currentX + columnWidth, startY + rowHeight)
      //           .stroke();
      
      //         currentX += columnWidth;
      //       });
      //     }
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
  
      // const resetTable = [
      //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
      //   { field1: "", field2: "Every 3 month" },
      // ];
        
      // resetTableFunction(resetTable);
  
      // function impactTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Set the number of columns explicitly (3 columns)
      //   const columns = ['field1', 'field2', 'field3'];
      
      //   // Calculate dynamic column width based on the number of columns
      //   const columnWidth = totalWidth / columns.length;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = columns.map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      //     columns.forEach((key, index) => {
      //       // Check if field is empty, and show blank if needed
      //       const fieldValue = row[key] || " ";
      
      //       doc
      //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(fieldValue, currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth,
      //         });
      
      //       // Draw vertical line after the column
      //       doc.strokeColor("black").lineWidth(0.5);
      //       doc
      //         .moveTo(currentX + columnWidth, startY)
      //         .lineTo(currentX + columnWidth, startY + rowHeight)
      //         .stroke();
      
      //       currentX += columnWidth;
      //     });
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
  
      // const impactTable = [
      //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: "EPI",field3: "No. of EPIs" },
      //   { field1: "", field2: "14749 ",field3: "61" },
      // ];
        
      // impactTableFunction(impactTable);
  
  
      // function chargesTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Set the number of columns explicitly (3 columns)
      //   const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
      
      //   // Calculate dynamic column width based on the number of columns
      //   const columnWidth = totalWidth / columns.length;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = columns.map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      //     columns.forEach((key, index) => {
      //       // Check if field is empty, and show blank if needed
      //       const fieldValue = row[key] || " ";
      
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(fieldValue, currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth,
      //         });
      
      //       // Draw vertical line after the column
      //       doc.strokeColor("black").lineWidth(0.5);
      //       doc
      //         .moveTo(currentX + columnWidth, startY)
      //         .lineTo(currentX + columnWidth, startY + rowHeight)
      //         .stroke();
      
      //       currentX += columnWidth;
      //     });
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
      
      // const chargesTable = [
      //   { field1: "8", field2: "Fee/ Charges" },
      //   { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
      // ];
      
      // chargesTableFunction(chargesTable);
  
  //     function generateFeeChargesTableFromThirdRow(doc, tableData) {
  //       const startX = 50; // Starting X-coordinate
  //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
  //       const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
    
  //       tableData.forEach((row, rowIndex) => {
  //           // Set default row height
  //           let rowHeight = 15;
    
  //           // Dynamically calculate the height of each cell's content
  //           const cellHeights = Object.keys(row).map((key, index) => {
  //               return doc
  //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
  //                   .fontSize(8)
  //                   .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
  //           });
    
  //           rowHeight = Math.max(...cellHeights) + 10;
    
  //           // Alternate row background color
  //           doc.lineWidth(0.5);
  //           doc
  //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
  //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
  //               .stroke("black")
  //               .fill();
    
  //           // Draw cell contents and vertical borders
  //           let currentX = startX;
  //           Object.keys(row).forEach((key, index) => {
  //               doc
  //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
  //                   .fontSize(8)
  //                   .fillColor("black")
  //                   .text(row[key] || "", currentX + 5, startY + 5, {
  //                       width: columnWidths[index] - 10,
  //                       baseline: "hanging",
  //                       align: "left",
  //                   });
    
  //               // Draw vertical lines for columns
  //               doc.strokeColor("black").lineWidth(0.5);
  //               doc
  //                   .moveTo(currentX + columnWidths[index], startY)
  //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
  //                   .stroke();
    
  //               currentX += columnWidths[index];
  //           });
    
  //           // Move to the next row
  //           startY += rowHeight;
  //       });
    
  //       // Ensure table border ends properly
  //       doc.stroke();
  //   }
  
  //   const tableData = [
  //     {
  //       col1: "",
  //       col2: "",
  //       col3: "One-time/Recurring",
  //       col4: "Amount (in₹) or Percentage(%) asapplicable",
  //       col5: "One-time/Recurring",
  //       col6: "Amount (in ₹) or Percentage(%) as applicable",
  //   },
  //     {
  //         col1: "(i)",
  //         col2: "Processing fees",
  //         col3: "One time",
  //         col4: "11800",
  //         col5: "One time",
  //         col6: "3930",
  //     },
  //     {
  //         col1: "(ii)",
  //         col2: "Insurance charges",
  //         col3: "One time",
  //         col4: "3930",
  //         col5: "",
  //         col6: "",
  //     },
  //     {
  //         col1: "(iii)",
  //         col2: "Valuation fees",
  //         col3: "One time",
  //         col4: "0",
  //         col5: "",
  //         col6: "",
  //     },
  //     {
  //         col1: "(iv)",
  //         col2: "Any other (please specify)",
  //         col3: "Documentation Charges, CERSAI Charges",
  //         col4: "11800",
  //         col5: "",
  //         col6: "",
  //     },
  // ];
  
  // generateFeeChargesTableFromThirdRow(doc, tableData);
  // doc.moveDown(2.5);
  
  function generateFeeChargesTableFromThirdRowtenv(doc,tableDatatenv) {
    const startX = 50; // Starting X-coordinate
    let startY = doc.y + 10; // Starting Y-coordinate
    const columnConfigurations = [
        [80, 270, 153], // First row: Three columns
        [80, 423],      // Second row: Two columns
        [80, 200, 222], // Rows 3 to 7: Three columns
    ];
  
    tableDatatenv.forEach((row, rowIndex) => {
        // Determine the column configuration for the current row
        const columnWidths = columnConfigurations[row.configurationIndex];
        
        // Set default row height
        let rowHeight = 15;
  
        // Dynamically calculate the height of each cell's content
        const cellHeights = row.columns.map((col, index) => {
            return doc
                .font("Helvetica")
                .fontSize(7)
                .heightOfString(col || "", { width: columnWidths[index] - 10 });
        });
  
        rowHeight = Math.max(...cellHeights) + 10;
  
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
            .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
            .stroke("black")
            .fill();
  
        // Draw cell contents and vertical borders
        let currentX = startX;
        row.columns.forEach((col, index) => {
            doc
                .font("Helvetica")
                .fontSize(7)
                .fillColor("black")
                .text(col || "", currentX + 5, startY + 5, {
                    width: columnWidths[index] - 10,
                    baseline: "hanging",
                    align: "left",
                });
  
            // Draw vertical lines for columns
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + columnWidths[index], startY)
                .lineTo(currentX + columnWidths[index], startY + rowHeight)
                .stroke();
  
            currentX += columnWidths[index];
        });
  
        // Move to the next row
        startY += rowHeight;
    });
  
    // Ensure table border ends properly
    doc.stroke();
  }
  
  const tableDatatenv = [
  //   {
  //       configurationIndex: 0, // First row: 3 columns
  //       columns: ["9", "Annual Percentage Rate (APR) (%)", "27.88%"],
  //   },
  //   {
  //       configurationIndex: 1, // Second row: 2 columns
  //       columns: ["10", "Details of Contingent Charges (in ₹ or %, as applicable)"],
  //   },
    {
        configurationIndex: 2, // Rows 3 to 7: 3 columns
        columns: [
            "(i)",
            "Penal charges, if any, in case of delayed payment",
            "2% per month on the Outstanding Dues plus, applicable Taxes",
        ],
    },
    {
        configurationIndex: 2,
        columns: [
            "(ii)",
            "Other penal charges, if any",
            "2% per month on the Outstanding Dues plus, applicable Taxes",
        ],
    },
    {
        configurationIndex: 2,
        columns: [
            "(iii)",
            "Foreclosure charges, if applicable",
            "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
        ],
    },
    {
        configurationIndex: 2,
        columns: [
            "(iv)",
            "Charges for switching of loans from floating to fixed rate and vice versa",
            "Not Applicable",
        ],
    },
    {
        configurationIndex: 2,
        columns: [
            "(v)",
            "Any other charges (please specify)",
            "Not Applicable",
        ],
    },
  ];
  
  // Call the function with your doc object and table data
  generateFeeChargesTableFromThirdRowtenv(doc, tableDatatenv);
  doc.moveDown()
  doc
    .font('Helvetica-Bold')
    .fontSize(7)
    .text(`Part 2 (Other qualitative information)`,startX, doc.y, { align: "left"});
    doc.moveDown(0.1)
  
  function generateThreeColumnTable(doc, tableDatatab) {
    const startX = 50; // Starting X-coordinate
    let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
    const columnWidths = [61, 210, 230] // Widths for the three columns
  
    tableDatatab.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;
  
        // Dynamically calculate the height of each cell's content
        const cellHeights = row.columns.map((col, index) => {
            return doc
                .font("Helvetica")
                .fontSize(7)
                .heightOfString(col || "", { width: columnWidths[index] - 10 });
        });
  
        rowHeight = Math.max(...cellHeights) + 10;
  
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
            .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
            .stroke("black")
            .fill();
  
        // Draw cell contents and vertical borders
        let currentX = startX;
        row.columns.forEach((col, index) => {
            doc
                .font("Helvetica")
                .fontSize(7)
                .fillColor("black")
                .text(col || "", currentX + 5, startY + 5, {
                    width: columnWidths[index] - 10,
                    baseline: "hanging",
                    align: "left",
                });
  
            // Draw vertical lines for columns
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + columnWidths[index], startY)
                .lineTo(currentX + columnWidths[index], startY + rowHeight)
                .stroke();
  
            currentX += columnWidths[index];
        });
  
        // Move to the next row
        startY += rowHeight;
    });
  
    // Ensure table border ends properly
    doc.stroke();
  }
  
  const tableDatatab = [
  {
      columns: [
          "1", 
          "Clause of Loan agreement relating to engagement of recovery agents",
          "Annexure II – Clause 1"
      ],
  },
  {
      columns: [
          "2", 
          "Clause of Loan agreement which details grievance redressal mechanism",
          "Annexure II – Clause 2"
      ],
  },
  {
      columns: [
          "3", 
          "Phone number and email id of the nodal grievance redressal officer",
          `1. Ratnaafin Capital Private Limited
  Grievance Officer: Mr. Bhavesh Patel
  Designation: VP-Operations
  
  For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
  
  2. Fin Coopers Capital Private Limited
  Grievance Officer: Shakti Singh
  
  For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
      ],
  },
  ];
  
  generateThreeColumnTable(doc, tableDatatab);
  
  function generateDynamicTable(doc, tableDatady, columnWidths) {
  const startX = 50; // Starting X-coordinate
  let startY = doc.y + 10; // Starting Y-coordinate
  
  tableDatady.forEach((row, rowIndex) => {
    const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
    if (!Array.isArray(rowWidths)) {
        console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
        return;
    }
  
    let rowHeight = 15;
  
    // Dynamically calculate the height of each cell's content
    const cellHeights = row.map((col, index) => {
        const width = rowWidths[index] || 0; // Default to 0 if width is missing
        return doc
            .font("Helvetica")
            .fontSize(7)
            .heightOfString(col || "", { width: width - 10 });
    });
  
    // Use the maximum height for the row
    rowHeight = Math.max(...cellHeights, 15) + 10;
  
    // Draw the row background
    doc.lineWidth(0.5);
    doc
        .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
        .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
        .stroke("black")
        .fill();
  
    // Draw each cell in the row
    let currentX = startX;
    row.forEach((col, index) => {
        const width = rowWidths[index] || 0;
        doc
            .font("Helvetica")
            .fontSize(7)
            .fillColor("black")
            .text(col || "", currentX + 5, startY + 5, {
                width: width - 10,
                align: "left",
            });
  
        // Draw column borders
        doc.strokeColor("black").lineWidth(0.5);
        doc
            .moveTo(currentX + width, startY)
            .lineTo(currentX + width, startY + rowHeight)
            .stroke();
  
        currentX += width;
    });
  
    startY += rowHeight; // Move to the next row
  });
  
  // Draw table border
  // doc.stroke();
  }
  const tableDatady = [
  ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
  ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
  ["Name of the originating RE, along with its fund", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
  ["Fin Coopers Capital Pvt Ltd-0%", "Ratnaafin Capital Pvt Ltd-100%", `${allPerameters.interestRate}%`],
  ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
  ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
  ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
  ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
  ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
  ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
      `Fin Coopers Capital Private Limited:
  Website: https://www.fincoopers.com/
  Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
  Email ID: INFO@FINCOOPERS.COM
  Contact No.: 07314902200`]
  ];
  
  const columnWidths = [
  // [50, 245, 200], // Row 1
  // [50, 445],      // Row 2
  // [165, 165, 165],// Row 3
  // [165, 165, 165],// Row 4
  // [50, 445],      // Row 5
  // [247, 248],     // Row 6
  // [247, 248]      // Row 7
  // [50, 325, 120], // Row 1
  // [50, 445],      // Row 2
  // [165, 165, 165],// Row 3
  // [165, 165, 165],// Row 4
  // [50, 445],      // Row 5
  // [245, 250],     // Row 6
  // [245, 249],     // Row 7
  // [50, 447],      // Row 8
  // [245, 250],     // Row 9
  // [245, 250]      //
  [50, 325, 128],  // Row 1
  [50, 453],       // Row 2
  [165, 165, 173], // Row 3
  [165, 165, 173], // Row 4
  [50, 453],       // Row 5
  [245, 258],      // Row 6
  [245, 258],      // Row 7
  [50, 453],       // Row 8
  [245, 258],      // Row 9
  [245, 258]       // Row 10
  
  ];
  
  // Call the function
  generateDynamicTable(doc, tableDatady, columnWidths);
  
  
  
      
  // addFooter()
  
      // { field1: "", field2: "",field3A: "One-time/Recurring", field3B:"Amount (in ₹) or Percentage (%) as applicable",field4A: "One-time/Recurring",field4B: "One-time/Recurring", },
    
      // doc.addPage();
      // addLogo();
      // drawBorder();
      // doc.moveDown(7);
  
  //     function generateThreeColumnTable(doc, tableDatatab) {
  //       const startX = 50; // Starting X-coordinate
  //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
  //       const columnWidths = [50, 210, 230] // Widths for the three columns
    
  //       tableDatatab.forEach((row, rowIndex) => {
  //           // Set default row height
  //           let rowHeight = 15;
    
  //           // Dynamically calculate the height of each cell's content
  //           const cellHeights = row.columns.map((col, index) => {
  //               return doc
  //                   .font("Helvetica")
  //                   .fontSize(8)
  //                   .heightOfString(col || "", { width: columnWidths[index] - 10 });
  //           });
    
  //           rowHeight = Math.max(...cellHeights) + 10;
    
  //           // Alternate row background color
  //           doc.lineWidth(0.5);
  //           doc
  //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
  //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
  //               .stroke("black")
  //               .fill();
    
  //           // Draw cell contents and vertical borders
  //           let currentX = startX;
  //           row.columns.forEach((col, index) => {
  //               doc
  //                   .font("Helvetica")
  //                   .fontSize(8)
  //                   .fillColor("black")
  //                   .text(col || "", currentX + 5, startY + 5, {
  //                       width: columnWidths[index] - 10,
  //                       baseline: "hanging",
  //                       align: "left",
  //                   });
    
  //               // Draw vertical lines for columns
  //               doc.strokeColor("black").lineWidth(0.5);
  //               doc
  //                   .moveTo(currentX + columnWidths[index], startY)
  //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
  //                   .stroke();
    
  //               currentX += columnWidths[index];
  //           });
    
  //           // Move to the next row
  //           startY += rowHeight;
  //       });
    
  //       // Ensure table border ends properly
  //       doc.stroke();
  //   }
  
  //   const tableDatatab = [
  //     {
  //         columns: [
  //             "1", 
  //             "Clause of Loan agreement relating to engagement of recovery agents",
  //             "Annexure II – Clause 1"
  //         ],
  //     },
  //     {
  //         columns: [
  //             "2", 
  //             "Clause of Loan agreement which details grievance redressal mechanism",
  //             "Annexure II – Clause 2"
  //         ],
  //     },
  //     {
  //         columns: [
  //             "3", 
  //             "Phone number and email id of the nodal grievance redressal officer",
  //             `1. Ratnaafin Capital Private Limited
  // Grievance Officer: Mr. Bhavesh Patel
  // Designation: VP-Operations
  
  // For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
  
  // 2. Fin Coopers Capital Private Limited
  // Grievance Officer: Shakti Singh
  
  // For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
  //         ],
  //     },
  // ];
  
  // generateThreeColumnTable(doc, tableDatatab);
  
  // function generateDynamicTable(doc, tableDatady, columnWidths) {
  //   const startX = 50; // Starting X-coordinate
  //   let startY = doc.y + 10; // Starting Y-coordinate
  
  //   tableDatady.forEach((row, rowIndex) => {
  //       const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
  //       if (!Array.isArray(rowWidths)) {
  //           console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
  //           return;
  //       }
  
  //       let rowHeight = 15;
  
  //       // Dynamically calculate the height of each cell's content
  //       const cellHeights = row.map((col, index) => {
  //           const width = rowWidths[index] || 0; // Default to 0 if width is missing
  //           return doc
  //               .font("Helvetica")
  //               .fontSize(8)
  //               .heightOfString(col || "", { width: width - 10 });
  //       });
  
  //       // Use the maximum height for the row
  //       rowHeight = Math.max(...cellHeights, 15) + 10;
  
  //       // Draw the row background
  //       doc.lineWidth(0.5);
  //       doc
  //           .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
  //           .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
  //           .stroke("black")
  //           .fill();
  
  //       // Draw each cell in the row
  //       let currentX = startX;
  //       row.forEach((col, index) => {
  //           const width = rowWidths[index] || 0;
  //           doc
  //               .font("Helvetica")
  //               .fontSize(8)
  //               .fillColor("black")
  //               .text(col || "", currentX + 5, startY + 5, {
  //                   width: width - 10,
  //                   align: "left",
  //               });
  
  //           // Draw column borders
  //           doc.strokeColor("black").lineWidth(0.5);
  //           doc
  //               .moveTo(currentX + width, startY)
  //               .lineTo(currentX + width, startY + rowHeight)
  //               .stroke();
  
  //           currentX += width;
  //       });
  
  //       startY += rowHeight; // Move to the next row
  //   });
  
  //   // Draw table border
  //   doc.stroke();
  // }
  
  
  
  // const tableDatady = [
  //   ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
  //     ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
  //     ["Name of the originating RE, along with its function", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
  //     ["Fin Coopers Capital Pvt Ltd-0%", "Ratna Fin Capital Pvt Ltd-100%", "25%"],
  //     ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
  //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
  //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
  //     ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
  //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
  //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
  //         `Fin Coopers Capital Private Limited:
  // Website: https://www.fincoopers.com/
  // Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
  // Email ID: INFO@FINCOOPERS.COM
  // Contact No.: 07314902200`]
  // ];
  
  // const columnWidths = [
  //   // [50, 245, 200], // Row 1
  //   // [50, 445],      // Row 2
  //   // [165, 165, 165],// Row 3
  //   // [165, 165, 165],// Row 4
  //   // [50, 445],      // Row 5
  //   // [247, 248],     // Row 6
  //   // [247, 248]      // Row 7
  //   [50, 325, 120], // Row 1
  //     [50, 445],      // Row 2
  //     [165, 165, 165],// Row 3
  //     [165, 165, 165],// Row 4
  //     [50, 445],      // Row 5
  //     [245, 247],     // Row 6
  //     [245, 247],     // Row 7
  //     [50, 447],      // Row 8
  //     [245, 247],     // Row 9
  //     [245, 247]      //
  // ];
  
  // // Call the function
  // generateDynamicTable(doc, tableDatady, columnWidths);
  
  
    
  ////    addFooter()
      // Finalize the PDF
     
     
      function drawTableForAmotization(tableData,loanDataForTable) {
        // Some layout constants
        const PAGE_HEIGHT = doc.page.height;
        const PAGE_BOTTOM_MARGIN = doc.page.margins.bottom;
        const rowHeight = 20;
      
        // Starting X/Y positions
        let startX = 50;
        // doc.y is wherever the PDF "cursor" currently is. We'll add 10 for spacing.
        let startY = doc.y + 10;
      
        // Column widths (6 columns total):
        // Adjust these numbers as needed to fit your layout
        const columnWidths = [50, 90, 80, 90, 80, 90];
      
        // Thinner stroke for borders
        doc.lineWidth(0.2);
      
        //-----------
        // 1) FUNCTION: Draw the big "Repayment Schedule" title bar
        //-----------
        function drawScheduleTitle() {
          // This "title bar" spans across all 6 columns
          const totalTableWidth = columnWidths.reduce((acc, w) => acc + w, 0);
      
          // Draw the filled rectangle for the title
          doc
            .rect(startX, startY, totalTableWidth, rowHeight)
            .fillAndStroke('#00bfff', '#000000');
      
          // Write the title text
          doc
            .font(fontBold)
            .fillColor('black')
            .fontSize(9.5)
            .text(
              'Repayment Schedule',
              startX + 5,
              startY + 5,
              {
                baseline: 'hanging',
                // If you want to truly center across the entire width:
                // width: totalTableWidth,
                align: 'center'
              }
            );
            startY += rowHeight + 15
            loanDataForTable.forEach((row) => {
              // Before drawing each row, check for possible page overflow
          
              // Current X resets for each row
              let currentX = startX;
          
              // Choose row fill color (e.g., always white, or alternate, etc.)
              const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
          
              // Column 1: Month
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, 100, rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.field), currentX + 5, startY + 5, { baseline: 'hanging',width:100, align:"left" });
              currentX += 100;
          
              // Column 2: Opening Principal
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, 100, rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.value), currentX + 5, startY + 5, { baseline: 'hanging',width:90, align:"right" });
              currentX += 100;
      
              // Move down to the next row
              startY += rowHeight;
            });
      
          // Move Y down by rowHeight
          startY += rowHeight;
        }
      
        //-----------
        // 2) FUNCTION: Draw the header row with column names
        //-----------
        function drawHeaderRow() {
          // 6 columns:
          // 1) month
          // 2) openingPrincipal
          // 3) monthlyPayment
          // 4) principalPayment
          // 5) interestPayment
          // 6) remainingBalance
      
          const headers = [
            'Month',
            'Opening Principal',
            'Monthly Payment',
            'Principal Payment',
            'Interest Payment',
            'Remaining Balance'
          ];
      
          let currentX = startX;
      
          for (let i = 0; i < headers.length; i++) {
            doc
              .rect(currentX, startY, columnWidths[i], rowHeight)
              .fillAndStroke('#66ee79', '#000000')
              .fill();
      
            doc
              .font(fontBold)
              .fontSize(9)
              .fillColor('black')
              .text(headers[i], currentX + 5, startY + 5, { baseline: 'hanging' });
      
            currentX += columnWidths[i];
          }
      
          // Move Y down by rowHeight
          startY += rowHeight;
        }
      
        //-----------
        // 3) FUNCTION: Check for page overflow & insert new page if needed
        //-----------
        function checkPageOverflow() {
          // If adding another row will go beyond the page bottom, do a page break:
          if (startY + rowHeight > PAGE_HEIGHT - PAGE_BOTTOM_MARGIN) {
            // Add a new page
            doc.addPage();
      
            // Your custom functions:
            addLogo();
            drawBorder();
      
            // Move down a bit after the border
            doc.moveDown(5);
      
            // Reset startY to current doc.y (top of the new page)
            startX = 50
            startY = doc.y + 10;
            doc.lineWidth(0.2);
    
      
            // Re-draw the table title and header row on the new page
            drawHeaderRow();
          }
        }
      
        //-----------
        // 4) START: Actually draw the table now
        //-----------
      
        // Draw the main "Repayment Schedule" title bar first
        drawScheduleTitle();
      
        // Then draw the header row (column titles)
        drawHeaderRow();
      
    
        // Now loop over your table data rows
        tableData.forEach((row) => {
          // Before drawing each row, check for possible page overflow
          checkPageOverflow();
      
          // Current X resets for each row
          let currentX = startX;
      
          // Choose row fill color (e.g., always white, or alternate, etc.)
          const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
      
          // Column 1: Month
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[0], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.month), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[0];
      
          // Column 2: Opening Principal
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[1], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.openingPrincipal), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[1];
      
          // Column 3: Monthly Payment
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[2], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.monthlyPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[2];
      
          // Column 4: Principal Payment
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[3], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.principalPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[3];
      
          // Column 5: Interest Payment
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[4], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.interestPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[4];
      
          // Column 6: Remaining Balance
          doc.fillColor(rowFillColor)
            .rect(currentX, startY, columnWidths[5], rowHeight)
            .stroke()
            .fill();
          doc.font(font)
            .fontSize(8)
            .fillColor('black')
            .text(String(row.remainingBalance), currentX + 5, startY + 5, { baseline: 'hanging' });
          currentX += columnWidths[5];
      
          // Move down to the next row
          startY += rowHeight;
        });
        
        // Optionally, continue adding content after the table ...
      }
      
    
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(5);
     
      const loanTableData1 = calculateLoanAmortization(
        allPerameters.loanAmount,
        allPerameters.tenureinMonths,
        allPerameters.interestRate,
        "2025-01-01"
      );
      let loanDataForTable = [{
        field:"Loan Amount (Rs.)",
        value: allPerameters.loanAmount
      },
      {
        field:"Loan Tenure (Month)",
        value: allPerameters.tenureinMonths
      },
      {
        field:"ROI (%)",
        value: allPerameters.interestRate
      },
      {
        field:"EMI (Rs.)",
        value: allPerameters.emiAmount
      }]
  
      console.log(allPerameters)
      drawTableForAmotization(loanTableData1,loanDataForTable);
  
  
      doc.addPage();
      addLogo();
      drawBorder();
      doc.moveDown(5);
  
    //   function DRAWTABLE123(tableTitle, tableData) {
    //     const startX = 50;
    //     let startY = doc.y + 10;
    //     const columnWidths = [500];
    //     const indexWidth = 30;
    //     const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
    //     const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
    //     // Draw table title with a colored header
    //     doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
    //     doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
    //         .text(tableTitle, startX + 5, startY + 5, { align: 'center' });
    
    //     startY += 20; // Move down for the first row
    
    //     let sectionIndex = null; // Track the section index to span the column
    
    //     // Render each row in the table
    //     tableData.forEach((row, rowIndex) => {
    //         // Apply custom style for row 1 (title2)
            
    
    //         // Measure text height for row.field1 and row.value1
    //         const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
    //         const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
    
    //         // Calculate row height based on the tallest content
    //         const rowHeight = Math.max(20, field1Height, value1Height) + 10; // Adding padding for better spacing
    
    //         // Only display the index once per section, in the first row
    //         const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
    //         if (row.index) {
    //             sectionIndex = row.index; // Set current section index
    //         }
    
    //         // Draw the index in the first column (only for the first row of each section)
    //         doc.fillColor('#ffffff')
    //             .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Stroke color set to black
    //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
    //             .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
    
    //         // Draw the key in the second column
    //         doc.fillColor('#f5f5f5')
    //             .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
    //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
    //             .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
    
    //         // Draw the value in the third column
    //         doc.fillColor('#ffffff')
    //             .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
    //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
    //             .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
    
    //         // Move startY down by rowHeight for the next row
    //         startY += rowHeight;
    //     });
    // }
    
  
    function DRAWTABLE123(tableTitle, tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const columnWidths = [500];
      const indexWidth = 30;
      const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
    
      // Draw table title with a colored header
      doc.lineWidth(0.5); // Set a thin border for the table
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
          doc.font('Helvetica').fillColor('black').fontSize(7.2)
              .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
    
          // Draw the key in the second column
          doc.fillColor('#f5f5f5')
              .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(7.2)
              .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
    
          // Draw the value in the third column
          doc.fillColor('#ffffff')
              .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
          doc.font('Helvetica').fillColor('black').fontSize(7.2)
              .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
    
          // Move startY down by rowHeight for the next row
          startY += rowHeight;
      });
    }
    
   
  
  
  
    const scheduleOfCharges = [
      { index: "sr.No", field1: "Particulars of Charges", value1: "Charge Details" },
  
      { index: "1", field1: "Repayment Instruction / Instrument Return Charges / PDC / ECS / NACH Bounce Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
      { index: "2", field1: "Repayment Mode Swap Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
      { index: "3", field1: "Penal Charges", value1: "- 2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan installments\n- 2% per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter" },
      { index: "4", field1: "Duplicate Statement Issuance Charges (SOA / RPS)", value1: "Free once in a Financial Year. Rs.250/- (Plus GST as applicable)" },
      { index: "5", field1: "Cheque / NACH Representation Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
      { index: "6", field1: "Duplicate Amortization Schedule Issuance Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
      { index: "7", field1: "Document Retrieval Charges", value1: "Rs.500/- Per Instance per set (Plus GST as applicable)" },
      { index: "8", field1: "Charges for Subsequent Set of Photocopy of Loan Agreement/Documents Were Requested by Borrower", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
      { index: "9", field1: "Stamp Duty Charges", value1: "As applicable in the state stamp act" },
      { index: "10", field1: "Prepayment Charges", value1: "No prepayment allowed till completion of 12 months from the date of 1st disbursement. After completion of 12 months from the date of 1st disbursement, prepayment from personal funds may be made without incurring any fees. In case of balance transfer, 4% charges will be applicable." },
      { index: "11", field1: "Foreclosure Charges", value1: "In case of foreclosure of Loan from Owned Funds, no Foreclosure Charges will be applicable. In case of balance transfer, 4% of the Outstanding Principal Amount will be applicable." },
      { index: "12", field1: "Administrative Charges / Processing Fees & Other Charges", value1: "Nil" },
      { index: "13", field1: "Charges for Duplicate NOC / No Due Certificate", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
      { index: "14", field1: "Charges for Revalidation NOC", value1: "Rs. 250/- Per Instance per set (Plus GST as applicable)" },
      { index: "15", field1: "Cersai Charge", value1: "- When facility amount is equal to Rs. 5 Lacs or lesser, Rs. 50 plus GST\n- When facility amount is greater than Rs.5 Lacs, Rs. 100 plus GST" },
      { index: "16", field1: "Login Fees", value1: "Rs.1950/- (Inclusive of all Applicable Taxes)" },
      { index: "17", field1: "Processing Fees", value1: "2% of loan amount + Applicable taxes" },
      { index: "18", field1: "Documentation Charges", value1: "2% of loan amount + Applicable taxes (For under construction cases 3% of loan amount + Applicable taxes)" },
      { index: "19", field1: "Issuance of Duplicate Income Tax Certificate", value1: "NIL" },
      { index: "20", field1: "Legal / Collections / Vehicle Storage / Repossession and Incidental Charges", value1: "As per Actuals" }
    ];
  
    DRAWTABLE123("Schedule of Charges (MITC)", scheduleOfCharges);
  
  
  
      doc.end();
    
  
      // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
      // doc.pipe(fs.createWriteStream(pdfPath));
      
    //   const objData = {
    //     fileName: pdfFileUrl,
    //     // file: doc.toString('base64')
    //  }
    //   await initESign(objData)
    
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


    async function ratannaFinSanctionLetterPdf2(allPerameters) {

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
        // doc.moveDown(-5)
        if (fs.existsSync(pdfLogo)) {
          doc.image(pdfLogo, 400, 9, {
            fit: [160, 140],
            align: "right",
            valign: "bottom",
          });
        } else {
          console.error(`Logo file not found at: ${pdfLogo}`);
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
    
      // if (!fs.existsSync(outputDir)) {
      //   fs.mkdirSync(outputDir, { recursive: true });
      // }
    
      const timestamp = Date.now();
      // const pdfFilename = `ratnafinSanctionLatter.pdf`;
      // const pdfPath = path.join(outputDir, pdfFilename);
    
      // const doc = new PDFDocument({ margin: 50, size: "A4" });
      // const stream = fs.createWriteStream(pdfPath);
    
      // doc.pipe(stream);
    
      // Add logo and border to the first page
      addLogo();
      drawBorder();
      doc.moveDown(5);
      
        doc
        .fontSize(9)
        .font(fontBold)
        .text("PRIVATE AND CONFIDENTIAL", { align: "center", underline: true });
      doc.moveDown(2);
    
      const startX = 50; // Set a left margin
      const startY = doc.y; // Get the current Y position
      doc
        .fontSize(7)
        .font('Helvetica')
        .text(`Sanction Letter No.:-${allPerameters.pENDENCYlOANnumber}`, startX, doc.y, { align: "left", x: 50 }) // Adjusting x to align left
        .text(`Date: ${allPerameters.sanctionpendencyDate}`, { align: "right", x: 450 })
        .moveDown(1);
      
      doc
        .font(fontBold)
        .fontSize(8)
        .text(`CUSTOMER NAME:${allPerameters.customerName}`, startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
      
      doc
        .font("Helvetica")
        .fontSize(8)
        .text(`address:${allPerameters.address}`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
      
      doc
        .font(fontBold)
        .fontSize(8)
        .text(`K/A: ${allPerameters.loanBorrowerName},${allPerameters.loanCoborrowerName},${allPerameters.loanCoborrowerNameTwo}`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
      
      doc
        .font('Helvetica')
        .fontSize(8)
        .text(`(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\nWith reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\nYour loan account details and the loan repayment schedule are attached herewith for your reference.`, { align: "left", x: 50 })
        .moveDown(1);
      
      // Define table drawing function with left alignment adjustments
      // function drawTable(tableData) {
      //     const startX = 50; // Adjusting startX for left alignment
      //     let startY = doc.y + 10;
      //     const columnWidths = [500];
        
      //     const keyWidth = Math.round((columnWidths[0] * 1) / 2);
      //     const valueWidth = Math.round((columnWidths[0] * 1) / 2);
        
      //     tableData.forEach((row, rowIndex) => {
      //         let rowHeight = 15;
      
      //         const field1TextHeight = doc
      //             .font(font)
      //             .fontSize(7.2)
      //             .heightOfString(row.field1, { width: keyWidth });
              
      //         let value1TextHeight = 0;
      //         if (row.value1) {
      //             value1TextHeight = doc
      //                 .font(font)
      //                 .fontSize(7.2)
      //                 .heightOfString(row.value1, { width: valueWidth });
      //         }
      
      //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //         if (!row.value1) {
      //             doc
      //                 .fillColor("blue")
      //                 .rect(startX, startY, columnWidths[0], rowHeight)
      //                 .stroke("black")
      //                 .fill();
      
      //             doc
      //                 .font(font)
      //                 .fillColor("black")
      //                 .fontSize(7.2)
      //                 .text(row.field1, startX + 5, startY + 5, {
      //                     baseline: "hanging",
      //                     width: columnWidths[0],
      //                 });
      //         } else {
      //             doc.lineWidth(0.5);
      //             doc
      //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //                 .rect(startX, startY, keyWidth, rowHeight)
      //                 .stroke("black")
      //                 .fill();
      
      //             doc
      //                 .font(font)
      //                 .fillColor("black")
      //                 .fontSize(7.2)
      //                 .text(row.field1, startX + 5, startY + 5, {
      //                     baseline: "hanging",
      //                     width: keyWidth,
      //                 });
      
      //             doc
      //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //                 .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //                 .stroke()
      //                 .fill();
      
      //             doc
      //                 .font(font)
      //                 .fillColor("black")
      //                 .fontSize(7.2)
      //                 .text(row.value1, startX + keyWidth + 5, startY + 5, {
      //                     baseline: "hanging",
      //                     width: valueWidth,
      //                 });
      //         }
      //         startY += rowHeight;
      //     });
      // }
      function drawTable(tableData) {
        const startX = 50; // Adjusting startX for left alignment
        let startY = doc.y + 10;
        const columnWidths = [500];
      
        const keyWidth = Math.round((columnWidths[0] * 1) / 2);
        const valueWidth = Math.round((columnWidths[0] * 1) / 2);
      
        tableData.forEach((row, rowIndex) => {
          let rowHeight = 15;
      
          // Calculate text height for dynamic row size
          const field1TextHeight = doc
            .font(font)
            .fontSize(7.2)
            .heightOfString(row.field1, { width: keyWidth });
      
          let value1TextHeight = 0;
          if (row.value1) {
            value1TextHeight = doc
              .font(font)
              .fontSize(7.2)
              .heightOfString(row.value1, { width: valueWidth });
          }
      
          rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
          // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
          const isSpecialRow =
            row.field1.toUpperCase() === "CHARGES" ||
            row.field1.toUpperCase() === "NEW LOAN DETAILS";
      
          // Row background and border for special rows
          if (isSpecialRow) {
            doc
              .fillColor("#00BFFF") // Background color
              .rect(startX, startY, columnWidths[0], rowHeight)
              .fill()
              .stroke("black", 0.5); // Thin border
      
            doc
              .font(font)
              .fillColor("black") // Text color
              .fontSize(7.2)
              .text(row.field1, startX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidths[0],
              });
          } else {
            // Normal rows
            doc.lineWidth(0.5); // Thin border for regular rows
      
            // Key Column
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
      
            doc
              .font(font)
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field1, startX + 5, startY + 5, {
                baseline: "hanging",
                width: keyWidth,
              });
      
            // Value Column
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black")
              .fill();
      
            doc
              .font(font)
              .fillColor("black")
              .fontSize(7.2)
              .text(row.value1, startX + keyWidth + 5, startY + 5, {
                baseline: "hanging",
                width: valueWidth,
              });
          }
      
          // Move to the next row
          startY += rowHeight;
        });
      }
      
          
        const loanTableData = [
          { field1: "NEW LOAN DETAILS" },
          { field1: "Customer ID", value1: `${allPerameters.customerID}` },
          { field1: "Loan Borrower name", value1: `${allPerameters.loanBorrowerName}` },
          { field1: "Loan Co-borrower name", value1: `${allPerameters.loanCoborrowerName}` },
          { field1: "Loan Co-borrower name-2", value1: `${allPerameters.loanCoborrowerNameTwo}` },
          // { field1: "Loan Guarantor name", value1: `${allPerameters.loanGuarantorName}` },
          { field1: "Product", value1: `${allPerameters.product}` },
          { field1: "Loan Amount", value1: `${allPerameters.loanAmount}/-${allPerameters.loanAmountinwords}` },
          { field1: "Description of Collateral Property", value1: `As per Annexure I
    ` },
          // { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
          {
            field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}`,
          },
          {
            field1: "Purpose of Loan ", value1: `${allPerameters.PURPOSEoFlOAN}`,
          },
          {
            field1: "Tenure", value1: `${allPerameters.tenureinMonths} months`,
          },
          {
            field1: "Interest Rate",
            value1: `${allPerameters.interestRate} %`,
          },
          {
            field1: "Interest Type",
            value1:
              `Linked to Floating Reference Rate (FRR – 19.20% + ${allPerameters.interestType}%)`,
          },
          {
            field1: "EMI Amount",
            value1:
              `Rs ${allPerameters.emiAmount} for a period of ${allPerameters.tenureinMonths} months`,
          },
          { field1: "Penal charges", value1: `${allPerameters.penalCharges}` },
          {
            field1:"Prepayment Charges",
            value1: `No prepayment allowed till completion of 12 months from the date of 1st\n disbursement. After completion of 12 months from the date of 1st disburseme\n-nt, prepayment from personal funds may be made without incurring any fees.\n In case of balance transfer, 4% charges will be applicable.`,
          },
          { field1: "DSRA", value1: `${allPerameters.DSRA}` },
          {
            field1: "EMI Payment Bank ",
            value1:
             `${allPerameters.emiPaymentBank}`,
          },
          { field1: "EMI Payment Bank A/c Number", value1: `${allPerameters.emiaccNumber}` },
          {
            field1: "Mode of Payment ",
            value1:
              `${allPerameters.modeOfPayment}`,
          },
         
        ];
        drawTable(loanTableData);
        // addFooter()
    
        //-------------------------------------- new page 2-------------------------------------------------------
      
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(5);
        // function drawTable1(tableData) {
        //   const startX = 50; // Adjusting startX for left alignment
        //   let startY = doc.y + 10;
        //   const columnWidths = [500];
        
        //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
        //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
        
        //   tableData.forEach((row, rowIndex) => {
        //     let rowHeight = 15;
        
        //     // Calculate text height for dynamic row size
        //     const field1TextHeight = doc
        //       .font(font)
        //       .fontSize(7.2)
        //       .heightOfString(row.field1, { width: keyWidth });
        
        //     let value1TextHeight = 0;
        //     if (row.value1) {
        //       value1TextHeight = doc
        //         .font(font)
        //         .fontSize(7.2)
        //         .heightOfString(row.value1, { width: valueWidth });
        //     }
        
        //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
        //     // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
        //     const isSpecialRow =
        //       row.field1.toUpperCase() === "CHARGES" ||
        //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
        
        //     // Row background and border for special rows
        //     if (isSpecialRow) {
        //       doc
        //         .fillColor("#00BFFF") // Background color
        //         .rect(startX, startY, columnWidths[0], rowHeight)
        //         .fill()
        //         .stroke("black", 0.5); // Thin border
        
        //       doc
        //         .font(font)
        //         .fillColor("black") // Text color
        //         .fontSize(7.2)
        //         .text(row.field1, startX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: columnWidths[0],
        //         });
        //     } else {
        //       // Normal rows
        //       doc.lineWidth(0.5); // Thin border for regular rows
        
        //       // Key Column
        //       doc
        //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //         .rect(startX, startY, keyWidth, rowHeight)
        //         .stroke("black")
        //         .fill();
        
        //       doc
        //         .font(font)
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(row.field1, startX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: keyWidth,
        //         });
        
        //       // Value Column
        //       doc
        //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
        //         .stroke("black")
        //         .fill();
        
        //       doc
        //         .font(font)
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: valueWidth,
        //         });
        //     }
        
        //     // Move to the next row
        //     startY += rowHeight;
        //   });
        // }
    
        function drawTable1(tableData) {
          const startX = 50; // Adjusting startX for left alignment
          let startY = doc.y + 10;
          const columnWidths = [500]; // Full table width
        
          const keyWidth = Math.round((columnWidths[0] * 1) / 2);
          const valueWidth = Math.round((columnWidths[0] * 1) / 2);
        
          tableData.forEach((row, rowIndex) => {
            let rowHeight = 15;
        
            // Calculate text height for dynamic row size
            const field1TextHeight = doc
              .font(font)
              .fontSize(7.2)
              .heightOfString(row.field1, { width: keyWidth });
        
            let value1TextHeight = 0;
            if (row.value1) {
              value1TextHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(row.value1, { width: valueWidth });
            }
        
            rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
            // Check if the row is "CHARGES"
            const isChargesRow = row.field1.toUpperCase() === "CHARGES";
        
            // Check if the row is "ADDITIONAL FINANCIAL PRODUCTS"
            const isAdditionalProductsRow =
              row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
        
            if (isChargesRow) {
              // "CHARGES" row with blue background and thin border
              doc
                .fillColor("#00BFFF") // Blue background
                .rect(startX, startY, columnWidths[0], rowHeight)
                .fill()
                .stroke("black", 0.5); // Thin black border
        
              doc
                .font(font)
                .fillColor("black") // Text color
                .fontSize(8.5) // Slightly larger font for bold rows
                .font("Helvetica-Bold") // Bold font
                .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: columnWidths[0],
                  align: "left",
                });
            } else if (isAdditionalProductsRow) {
              // "ADDITIONAL FINANCIAL PRODUCTS" row with no background, bold font, and border
              doc
                .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
                .stroke("black");
        
              doc
                .font(font)
                .fillColor("black") // Text color
                .fontSize(8.5) // Slightly larger font for bold rows
                .font("Helvetica-Bold") // Bold font
                .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: columnWidths[0],
                  align: "left",
                });
            } else {
              // Normal rows with two columns
              doc.lineWidth(0.5); // Thin border for regular rows
        
              // Key Column
              doc
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black"); // Border for key column
        
              doc
                .font(font)
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: keyWidth,
                });
        
              // Value Column
              doc
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black"); // Border for value column
        
              doc
                .font(font)
                .fontSize(7.2)
                .text(row.value1, startX + keyWidth + 5, startY + 5, {
                  baseline: "hanging",
                  width: valueWidth,
                });
            }
        
            // Move to the next row
            startY += rowHeight;
          });
        }
        
    
        // function drawTable1(tableData) {
        //   const startX = 50; // Adjusting startX for left alignment
        //   let startY = doc.y + 10;
        //   const columnWidths = [500]; // Full table width
        
        //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
        //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
        
        //   tableData.forEach((row, rowIndex) => {
        //     let rowHeight = 15;
        
        //     // Calculate text height for dynamic row size
        //     const field1TextHeight = doc
        //       .font(font)
        //       .fontSize(7.2)
        //       .heightOfString(row.field1, { width: keyWidth });
        
        //     let value1TextHeight = 0;
        //     if (row.value1) {
        //       value1TextHeight = doc
        //         .font(font)
        //         .fontSize(7.2)
        //         .heightOfString(row.value1, { width: valueWidth });
        //     }
        
        //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
        //     // Check for "CHARGES" or "NEW LOAN DETAILS" row
        //     const isSpecialRow =
        //       row.field1.toUpperCase() === "CHARGES" ||
        //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
        
        //     // Check for "ADDITIONAL FINANCIAL PRODUCTS" row
        //     const isAdditionalProductsRow =
        //       row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
        
        //     if (isSpecialRow || isAdditionalProductsRow) {
        //       // Special rows with a bold title
        //       doc
        //         .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
        //         .stroke("black");
        
        //       doc
        //         .font(font)
        //         .fontSize(8.5) // Slightly larger font for bold rows
        //         .font("Helvetica-Bold") // Bold font for special rows
        //         .text(row.field1, startX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: columnWidths[0],
        //           align: "left", // Align text to the left
        //         });
        //     } else {
        //       // Normal rows with two columns
        //       doc.lineWidth(0.5); // Thin border for regular rows
        
        //       // Key Column
        //       doc
        //         .rect(startX, startY, keyWidth, rowHeight)
        //         .stroke("black"); // Border for key column
        
        //       doc
        //         .font(font)
        //         .fontSize(7.2)
        //         .text(row.field1, startX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: keyWidth,
        //         });
        
        //       // Value Column
        //       doc
        //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
        //         .stroke("black"); // Border for value column
        
        //       doc
        //         .font(font)
        //         .fontSize(7.2)
        //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: valueWidth,
        //         });
        //     }
        
        //     // Move to the next row
        //     startY += rowHeight;
        //   });
        // }
        
        
    
        const loanSecondTable = [
          {
            field1: "CHARGES" },
          {
            field1:
              "Login Fees",
            value1:
              `${allPerameters.loginFees}`,
          },
          {
            field1:
              "Non-refundable Processing Fee",
            value1:
             `${allPerameters.nonRefundableProcessingFee}`,
          },
          {
            field1:
              "Documentation Charges",  value1:`${allPerameters.documentationCharges}`,
          },
          {
            field1:
              "Stamp duty charges",
            value1:
              `${allPerameters.stampDutyCharges}`,
          },
          {
            field1:
              "ADDITIONAL FINANCIAL PRODUCTS",
          },
          {
            field1:
              "Life Insurance Premium for Individual **",
              value1:
             `${allPerameters.lifeInsurancePremiumForIndividual}`,
          },
          {
            field1:
              "Insurance Premium for Collateral Security",
              value1:
              `${allPerameters.insurancePremiumForCollateralSecurity}`,
          },
        ]
        drawTable1(loanSecondTable);
    
        doc.moveDown(3);
    
        doc
        .font('Helvetica')
        .fontSize(8)
        .text(`[The net disbursal amount credited to your account = Loan amount – Charges and fees (additional financial products mentioned above).]\n\n *Broken period interest is charged on the loan amount from the date of disbursement to the date of EMI commencement.\n\n **Any pre-existing disease/ailments/surgeries undergone in the past need to be declared at the time of insurance acceptance otherwise the insurance claim will be repudiated.\n\nDSRA taken at the time of disbursement cannot be adjusted to POS for foreclosure. \n\nFor Disbursement done on or before the 10th of month, EMI Start date would be 10th of the following month.\n\n However, for all the Disbursements happening after 10th of the Particular Month will have EMI Start date as 10th of the month next to the following month.`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1.5);
    
        doc
        .font('Helvetica')
        .fontSize(8)
        .text(`Lock In period: The Borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount either in part or in full till the completion of 12 months of loan tenure from the 1st date of disbursement.
          
        The Lender may in its sole discretion Prospecvely increase / decrease / change the spread suitably in the event of unforeseen or
         exceponal or  exceptional changes in the money market condition taking place or occurrence of an increase cost situation.
    
    All payments to be made by the Borrower to the Lender shall be made free and clear of and without any deduction for on account of any
    taxes. If the Borrower is required to make such deduction, then, in such case, the sum payable to the Lender shall be increased to the
    extent necessary to ensure that, aer making such deduction, the Lender receives a sum equal to the sum which it would have received had
    such deduction not been made or required to be made. The Borrower shall submit the relevant tax deduction to the taxing authorities and 
    deliver to the Lender evidence reasonably satisfactory to the Lender that the tax deduction has been made (as applicable) and appropriate
    payment is paid to the relevant taxing authorities and the Lender shall there after repay such applicable tax amount to the Borrower.
    `,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1.5);
    
        doc
        .font('Helvetica')
        .fontSize(8)
        .text(`Advance Notice of 30 working days is Must before any prepayment/Part payment post lock in period\n\n Validity of Sanction letter is up to 3 months from the date of sanction.`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1.5);
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Email Address & Contact Nos to be used for customer service / for assistance required post disbursement: pna.ops@ratnaafin.com, (M) +91 9512011220`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Special Terms & Conditions: Pre-disbursement Conditions`,startX, doc.y, { align: "center", x: 50 })
        .moveDown(1);
    
    
      //   function latterTableFunction(tableData) {
      //     // Add Table Header
      //     const startX = 50;
      //     let startY = doc.y + 10;
      //     const totalWidth = 500; // Total column width
      //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
      //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      
      //     tableData.forEach((row, rowIndex) => {
      //         // Set default row height
      //         let rowHeight = 15;
      
      //         // Calculate the height of the text for field1 with word wrapping
      //         const field1TextHeight = doc
      //             .font(font)
      //             .fontSize(7.2)
      //             .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
      
      //         // Calculate the height of the text for value1 with word wrapping if it exists
      //         let value1TextHeight = 0;
      //         if (row.value1) {
      //             value1TextHeight = doc
      //                 .font(font)
      //                 .fontSize(7.2)
      //                 .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
      //         }
      
      //         // Determine the maximum height between field1 and value1 to set row height
      //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //         // Alternate row background color
      //         doc.lineWidth(0.5);
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX, startY, keyWidth, rowHeight)
      //             .stroke("black")
      //             .fill();
      
      //         // Draw text in field1 cell with word wrapping
      //         doc
      //             .font(font)
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(row.field1, startX + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: keyWidth,
      //                 height: rowHeight - 10, // Adjust the height so the text stays inside
      //                 align: "left",
      //                 wordBreak: 'break-word'  // Enable word wrapping for field1
      //             });
      
      //         // Draw the second column, even if value1 is absent
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //             .stroke()
      //             .fill();
      
      //         // Draw the `value1` text with word wrapping if present
      //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
      //         doc
      //             .font(font)
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: valueWidth,
      //                 height: rowHeight - 10, // Adjust the height so the text stays inside
      //                 align: "left",
      //                 wordBreak: 'break-word'  // Enable word wrapping for value1
      //             });
      
      //         // Draw vertical line between the columns
      //         doc.lineWidth(0.5);
      //         doc.strokeColor("black");
      //         doc.moveTo(startX + keyWidth, startY);
      //         doc.lineTo(startX + keyWidth, startY + rowHeight);
      //         doc.stroke();
      
      //         // Move to the next row position
      //         startY += rowHeight;
      //     });
      // }
    
      function latterTableFunction(tableData) { 
        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total column width
        const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
        const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    
        tableData.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
    
            // Calculate the height of the text for field1 with word wrapping
            const field1TextHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
    
            // Calculate the height of the text for value1 with word wrapping if it exists
            let value1TextHeight = 0;
            if (row.value1) {
                value1TextHeight = doc
                    .font(font)
                    .fontSize(7.2)
                    .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
            }
    
            // Determine the maximum height between field1 and value1 to set row height
            rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
            // Check if field1 contains "S. No" (case-insensitive)
            const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
    
            // Apply special row styling
            if (isSpecialRow) {
                doc
                    .fillColor("#00BFFF") // Background color for "S. No" rows
                    .rect(startX, startY, totalWidth, rowHeight)
                    .fill()
                    .stroke("black", 0.5); // Thin border
    
                // Draw text in field1 cell with special styling
                doc
                    .font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, {
                        baseline: "hanging",
                        width: keyWidth,
                        height: rowHeight - 10, // Adjust the height so the text stays inside
                        align: "left",
                        wordBreak: 'break-word' // Enable word wrapping for field1
                    });
    
                const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
                doc
                    .font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                        baseline: "hanging",
                        width: valueWidth,
                        height: rowHeight - 10, // Adjust the height so the text stays inside
                        align: "left",
                        wordBreak: 'break-word' // Enable word wrapping for value1
                    });
            } else {
                // Alternate row background color for non-"S. No" rows
                doc.lineWidth(0.5);
                doc
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX, startY, keyWidth, rowHeight)
                    .stroke("black")
                    .fill();
    
                // Draw text in field1 cell
                doc
                    .font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, {
                        baseline: "hanging",
                        width: keyWidth,
                        height: rowHeight - 10, // Adjust the height so the text stays inside
                        align: "left",
                        wordBreak: 'break-word' // Enable word wrapping for field1
                    });
    
                // Draw the second column, even if value1 is absent
                doc
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                    .stroke("black")
                    .fill();
    
                // Draw text in value1 cell
                const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
                doc
                    .font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                        baseline: "hanging",
                        width: valueWidth,
                        height: rowHeight - 10, // Adjust the height so the text stays inside
                        align: "left",
                        wordBreak: 'break-word' // Enable word wrapping for value1
                    });
            }
    
            // Draw vertical line between the columns
            doc.lineWidth(0.5);
            doc.strokeColor("black");
            doc.moveTo(startX + keyWidth, startY);
            doc.lineTo(startX + keyWidth, startY + rowHeight);
            doc.stroke();
    
            // Move to the next row position
            startY += rowHeight;
        });
    }
    
      const  PreDisbursementTablee = [
        { field1: "S. NO", value1: `Pre-disbursement Terms and Conditions` },
        { field1: "1", value1: `${allPerameters.specialTermsConditionOne}` },
        { field1: "2", value1: `5 PDCs of borrower and 2 PDC of Financial Guarantor / Third Party Gurantors are to be submitted at the time of disbursement.` },
        { field1: "3", value1: `Life insurance of the key earning member is mandatory` },
        { field1: "4", value1: `Original documents to be vetted by RCPL empanelled Vendor` },
        { field1: "5", value1: `Registered mortgage deed to be executed in favor of Ratnaafin Capital Private Limited.` },
        { field1: "6", value1: `Registered Mortgage in Favour of RCPL to be created on property.` },
        { field1: "7", value1: `No single property will be released. Complete loan to be foreclosed for release of any property under mortgage.` },
        // { field1: "8", value1: `Hypothecation on machinery to be done.` },
        // { field1: "9", value1: `Prepayment of 20% of principal outstanding can be done post one year of disbursement.` },
      ];
      
      latterTableFunction(PreDisbursementTablee);
    
    
        // addFooter()
    
    //     //-------------------------------------- new page 3-------------------------------------------------------------
       
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(9);
        
       
    
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(` For,\n Ratnaafin Capital Private Limited\n\n Authorised Signatory\n\n\n\n\n Sanction Letter Acceptance\n\n\n I/We have read the terms and conditions mentioned in the sanction letter and accept the Same.\n\n\n Signature/thumb impression: - `,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
    
    
    //   function thumbImpressionTableFunction(tableData) {
    //     // Add Table Header
    //     const startX = 50;
    //     let startY = doc.y + 10;
    //     const totalWidth = 500; // Total column width
    //     const keyWidth = Math.round(totalWidth * 0.4); // Increase field1 width to 40% of the total width
    //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value1 column
    
    //     tableData.forEach((row, rowIndex) => {
    //         // Set default row height and add extra space for readability
    //         let rowHeight = 40; // further increased default row height
    
    //         // Calculate the height of the text for field1 and value1
    //         const field1TextHeight = doc
    //             .font(fontBold) // Bold font for field1
    //             .fontSize(7.2)
    //             .heightOfString(row.field1, { width: keyWidth });
    
    //         let value1TextHeight = 0;
    //         if (row.value1) {
    //             value1TextHeight = doc
    //                 .font(fontBold) // Bold font if value1 is "SIGNATURE"
    //                 .fontSize(7.2)
    //                 .heightOfString(row.value1, { width: valueWidth });
    //         }
    
    //         // Determine the maximum height between field1 and value1 to set row height
    //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 25 // more padding for increased row height
    
    //         // Alternate row background color
    //         doc.lineWidth(0.5);
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX, startY, keyWidth, rowHeight)
    //             .stroke("black")
    //             .fill();
    
    //         // Draw bold text in field1 cell
    //         doc
    //             .font(fontBold)
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(row.field1, startX + 5, startY + 15, { // increased vertical padding
    //                 baseline: "hanging",
    //                 width: keyWidth,
    //             });
    
    //         // Draw the second column, even if value1 is absent
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //             .stroke()
    //             .fill();
    
    //         // Draw bold text for the `value1` if it contains "SIGNATURE"
    //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
    //         doc
    //             .font(row.value1 === "SIGNATURE" ? fontBold : font) // Use bold if value is "SIGNATURE"
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(keyValueText, startX + keyWidth + 5, startY + 10, { // increased vertical padding
    //                 baseline: "hanging",
    //                 width: valueWidth,
    //             });
    
    //         // Draw vertical line between the columns
    //         doc.lineWidth(0.5);
    //         doc.strokeColor("black");
    //         doc.moveTo(startX + keyWidth, startY);
    //         doc.lineTo(startX + keyWidth, startY + rowHeight);
    //         doc.stroke();
    
    //         // Move to the next row position
    //         startY += rowHeight;
    //     });
    // }
    
    
      // const  thumbImpressionTable = [
      //   { field1: "NAME", value1: `SIGNATURE` },
      //   { field1: `BORROWERS NAME : ${allPerameters.borrowersName}`, value1: `` },
      //   { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowersName}`, value1: `` },
      //   { field1: `CO-BORROWERS NAME-2 : ${allPerameters.coBorrowersNameTwo}`, value1: `` },
      //   { field1: `GUARANTORS NAME : ${allPerameters.guarantorsName}`, value1: `` },
      // ];
    
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`BORROWERS NAME : ${allPerameters.borrowersName}`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1)
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`CO-BORROWERS NAME : ${allPerameters.coBorrowersName} `,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`CO-BORROWERS NAME-2 : : ${allPerameters.coBorrowersNameTwo} `,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1)
      // .font('Helvetica-Bold')
      // .fontSize(8)
      // .text(`GUARANTORS NAME : ${allPerameters.guarantorsName} `,startX, doc.y, { align: "left", x: 50 })
      // .moveDown(1);
      
      // thumbImpressionTableFunction(thumbImpressionTable);
    doc.moveDown(6)
      doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`Annexure I: Security Details`,startX, doc.y, { align: "left", x: 50 })
      .moveDown(1);
    
    //   function securityDetailsTableFunction(tableData) {
    //     // Add Table Header
    //     const startX = 50;
    //     let startY = doc.y + 10;
    //     const totalWidth = 500; // Total column width
    //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
    //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    
    //     tableData.forEach((row, rowIndex) => {
    //         // Set default row height
    //         let rowHeight = 15;
    
    //         // Calculate the height of the text for field1 and value1
    //         const field1TextHeight = doc
    //             .font(fontBold) // Use bold font for field1
    //             .fontSize(7.2)
    //             .heightOfString(row.field1, { width: keyWidth });
    
    //         let value1TextHeight = 0;
    //         if (row.value1) {
    //             value1TextHeight = doc
    //                 .font(font) // Use regular font for value1
    //                 .fontSize(7.2)
    //                 .heightOfString(row.value1, { width: valueWidth });
    //         }
    
    //         // Determine the maximum height between field1 and value1 to set row height
    //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //         // Alternate row background color
    //         doc.lineWidth(0.5);
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX, startY, keyWidth, rowHeight)
    //             .stroke("black")
    //             .fill();
    
    //         // Draw bold text in field1 cell
    //         doc
    //             .font(fontBold) // Set font to bold
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(row.field1, startX + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: keyWidth,
    //             });
    
    //         // Draw the second column, even if value1 is absent
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //             .stroke()
    //             .fill();
    
    //         // Draw only the `value1` text without any prefix
    //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
    //         doc
    //             .font(font) // Use regular font for value1
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: valueWidth,
    //             });
    
    //         // Draw vertical line between the columns
    //         doc.lineWidth(0.5);
    //         doc.strokeColor("black");
    //         doc.moveTo(startX + keyWidth, startY);
    //         doc.lineTo(startX + keyWidth, startY + rowHeight);
    //         doc.stroke();
    
    //         // Move to the next row position
    //         startY += rowHeight;
    //     });
    // }
       
    
    //   const  securityDetailsTable = [
    //     { field1: "Security Type", value1: `Collateral` },
    //     { field1: "Description", value1: `Residential property` },
    //     { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
    //     { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
    //     { field1: "Property Type", value1: `Residential property` },
    //     { field1: "Area", value1: `${allPerameters.SecurityDetailsArea}.                         | Construction - ${allPerameters.Construction}` },
    //     { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
    //   ];
      
    //   securityDetailsTableFunction(securityDetailsTable);
    
    //    addFooter()
    //     //---------------------------------------------------- new page 4 ----------------------------------------------------
    
    function securityDetailsTableFunction(tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
      const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
      const valueWidth = totalWidth - keyWidth; // Value column width (70%)
      const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
    
      // Set thin border width
      const borderWidth = 0.3;
    
      tableData.forEach((row, rowIndex) => {
          let rowHeight = 15;
    
          // Row 6: Adjust for 3 columns
          if (rowIndex === 5) {
              // Calculate heights for three columns
              const heights = row.columns.map((col, i) =>
                  doc.font(i === 0 ? fontBold : font).fontSize(7.2).heightOfString(col.value, { width: colWidths[i] })
              );
              rowHeight = Math.max(...heights) + 10;
    
              // Draw three-column row
              let currentX = startX;
              row.columns.forEach((col, i) => {
                  // Background
                  doc.lineWidth(borderWidth)
                      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                      .rect(currentX, startY, colWidths[i], rowHeight)
                      .stroke("black")
                      .fill();
    
                  // Text
                  doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                      width: colWidths[i],
                      baseline: "hanging",
                  });
    
                  // Update X for next column
                  currentX += colWidths[i];
              });
          } else {
              // Rows with 2 columns
              const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
              const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
              rowHeight = Math.max(field1Height, value1Height) + 10;
    
              // Draw key column
              doc.lineWidth(borderWidth)
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, keyWidth, rowHeight)
                  .stroke("black")
                  .fill();
              doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                  width: keyWidth,
                  baseline: "hanging",
              });
    
              // Draw value column
              doc.lineWidth(borderWidth)
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                  .stroke("black")
                  .fill();
              doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                  width: valueWidth,
                  baseline: "hanging",
              });
          }
    
          // Move to the next row
          startY += rowHeight;
      });
    }
    function securityDetailsTableFunction1(tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
      const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
      const valueWidth = totalWidth - keyWidth; // Value column width (70%)
      const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
    
      tableData.forEach((row, rowIndex) => {
          let rowHeight = 15;
    
          // Row 6: Adjust for 3 columns
          if (rowIndex === 5) {
              // Calculate heights for three columns
              const heights = row.columns.map((col, i) =>
                  doc
                      .font(i === 0 ? fontBold : font)
                      .fontSize(7.2)
                      .heightOfString(col.value, { width: colWidths[i] })
              );
              rowHeight = Math.max(...heights) + 10;
    
              // Draw three-column row
              let currentX = startX;
              row.columns.forEach((col, i) => {
                  // Set thin border width
                  doc.lineWidth(0.5);
    
                  // Background
                  doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                      .rect(currentX, startY, colWidths[i], rowHeight)
                      .stroke("black")
                      .fill();
    
                  // Text
                  doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                      width: colWidths[i],
                      baseline: "hanging",
                  });
    
                  // Update X for next column
                  currentX += colWidths[i];
              });
          } else {
              // Rows with 2 columns
              const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
              const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
              rowHeight = Math.max(field1Height, value1Height) + 10;
    
              // Set thin border width
              doc.lineWidth(0.5);
    
              // Draw key column
              doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, keyWidth, rowHeight)
                  .stroke("black")
                  .fill();
              doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                  width: keyWidth,
                  baseline: "hanging",
              });
    
              // Draw value column
              doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                  .stroke("black")
                  .fill();
              doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                  width: valueWidth,
                  baseline: "hanging",
              });
          }
    
          // Move to the next row
          startY += rowHeight;
      });
    }
    
    const securityDetailsTable1 = [
      { field1: "Security Type", value1: `Collateral` },
      { field1: "Description", value1: `Residential property` },
      { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
      { field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}` },
      { field1: "Property Type", value1: `Residential property` },
      {
          // Row 6: Three columns
          columns: [
              { value: "Land Area " },
              { value: `${allPerameters.SecurityDetailsArea} sq.ft`},
              { value: `Construction -${allPerameters.Construction} `}, // Empty column if needed
          ],
      },
      { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
    ];
    
    securityDetailsTableFunction1(securityDetailsTable1);
    
    
    // const securityDetailsTable = [
    //   { field1: "Security Type", value1: `Collateral` },
    //   { field1: "Description", value1: `Residential property` },
    //   { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
    //   { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
    //   { field1: "Property Type", value1: `Residential property` },
    //   { field1: "Area", value1: `${allPerameters.SecurityDetailsArea} | Construction - ${allPerameters.Construction}` },
    //   { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
    // ];
    
    // securityDetailsTableFunction(securityDetailsTable);
    
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(7);
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Specified Terms & Conditions: -`,startX, doc.y, { align: "center", x: 50 })
        .moveDown(0.4);
    
    
    // function termsConditionTableFunction(tableData) {
    //     // Add Table Header
    //     const startX = 50;
    //     let startY = doc.y + 10;
    //     const totalWidth = 500; // Total column width
    //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
    //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    
    //     tableData.forEach((row, rowIndex) => {
    //         // Set default row height
    //         let rowHeight = 15;
    
    //         // Calculate the height of the text for field1 and value1
    //         const field1TextHeight = doc
    //             .font(rowIndex === 0 ? fontBold : font) // Use bold font for first row only
    //             .fontSize(7.2)
    //             .heightOfString(row.field1, { width: keyWidth });
    
    //         let value1TextHeight = 0;
    //         if (row.value1) {
    //             value1TextHeight = doc
    //                 .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
    //                 .fontSize(7.2)
    //                 .heightOfString(row.value1, { width: valueWidth });
    //         }
    
    //         // Determine the maximum height between field1 and value1 to set row height
    //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //         // Alternate row background color
    //         doc.lineWidth(0.5);
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX, startY, keyWidth, rowHeight)
    //             .stroke("black")
    //             .fill();
    
    //         // Draw text in field1 cell (bold for the first row, normal for others)
    //         doc
    //             .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(row.field1, startX + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: keyWidth,
    //             });
    
    //         // Draw the second column, even if value1 is absent
    //         doc
    //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //             .stroke()
    //             .fill();
    
    //         // For the first row, make value1 bold, otherwise use regular font
    //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
    //         doc
    //             .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
    //             .fillColor("black")
    //             .fontSize(7.2)
    //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
    //                 baseline: "hanging",
    //                 width: valueWidth,
    //             });
    
    //         // Draw vertical line between the columns
    //         doc.lineWidth(0.5);
    //         doc.strokeColor("black");
    //         doc.moveTo(startX + keyWidth, startY);
    //         doc.lineTo(startX + keyWidth, startY + rowHeight);
    //         doc.stroke();
    
    //         // Move to the next row position
    //         startY += rowHeight;
    //     });
    // }
    function termsConditionTableFunction(tableData) {
      // Add Table Header
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total column width
      const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
      const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      const padding = 5; // Padding to ensure text doesn't touch the border
    
      tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;
    
        // Calculate the height of the text for field1 and value1
        const field1TextHeight = doc
          .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
          .fontSize(7.2)
          .heightOfString(row.field1, { width: keyWidth - 2 * padding });
    
        let value1TextHeight = 0;
        if (row.value1) {
          value1TextHeight = doc
            .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
            .fontSize(7.2)
            .heightOfString(row.value1, { width: valueWidth - 2 * padding });
        }
    
        // Determine the maximum height between field1 and value1 to set row height
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
    
        // Check if field1 contains "S. No" (case-insensitive match)
        const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
    
        // Apply special row styling
        if (isSpecialRow) {
          doc
            .fillColor("#00BFFF") // Background color
            .rect(startX, startY, totalWidth, rowHeight)
            .fill()
            .stroke("black", 0.5); // Thin border
    
          doc
            .font(font)
            .fillColor("black") // Text color
            .fontSize(7.2)
            .text(row.field1, startX + padding, startY + padding, {
              baseline: "hanging",
              width: keyWidth - 2 * padding,
            });
    
          const keyValueText = row.value1 || ""; // Display value1 text if present
          doc
            .font(font)
            .fillColor("black")
            .fontSize(7.2)
            .text(keyValueText, startX + keyWidth + padding, startY + padding, {
              baseline: "hanging",
              width: valueWidth - 2 * padding,
            });
        } else {
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, keyWidth, rowHeight)
            .stroke("black")
            .fill();
    
          // Draw text in field1 cell
          doc
            .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
            .fillColor("black")
            .fontSize(7.2)
            .text(row.field1, startX + padding, startY + padding, {
              baseline: "hanging",
              width: keyWidth - 2 * padding,
            });
    
          // Draw the second column, even if value1 is absent
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + keyWidth, startY, valueWidth, rowHeight)
            .stroke("black")
            .fill();
    
          // Draw text in value1 cell
          const keyValueText = row.value1 || ""; // Display value1 text if present
          doc
            .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
            .fillColor("black")
            .fontSize(7.2)
            .text(keyValueText, startX + keyWidth + padding, startY + padding, {
              baseline: "hanging",
              width: valueWidth - 2 * padding,
            });
        }
    
        // Draw vertical line between the columns
        doc.lineWidth(0.5);
        doc.strokeColor("black");
        doc.moveTo(startX + keyWidth, startY);
        doc.lineTo(startX + keyWidth, startY + rowHeight);
        doc.stroke();
    
        // Move to the next row position
        startY += rowHeight;
      });
    }
    
    
    // function termsConditionTableFunction(tableData) {
    //   // Add Table Header
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total column width
    //   const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
    //   const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height of the text for field1 and value1
    //     const field1TextHeight = doc
    //       .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
    //       .fontSize(7.2)
    //       .heightOfString(row.field1, { width: keyWidth });
    
    //     let value1TextHeight = 0;
    //     if (row.value1) {
    //       value1TextHeight = doc
    //         .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
    //         .fontSize(7.2)
    //         .heightOfString(row.value1, { width: valueWidth });
    //     }
    
    //     // Determine the maximum height between field1 and value1 to set row height
    //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
    
    //     // Check if field1 contains "S. No" (case-insensitive match)
    //     const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
    
    //     // Apply special row styling
    //     if (isSpecialRow) {
    //       doc
    //         .fillColor("#00BFFF") // Background color
    //         .rect(startX, startY, totalWidth, rowHeight)
    //         .fill()
    //         .stroke("black", 0.5); // Thin border
    
    //       doc
    //         .font(font)
    //         .fillColor("black") // Text color
    //         .fontSize(7.2)
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: keyWidth,
    //         });
    
    //       const keyValueText = row.value1 || ""; // Display value1 text if present
    //       doc
    //         .font(font)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: valueWidth,
    //         });
    //     } else {
    //       // Alternate row background color
    //       doc.lineWidth(0.5);
    //       doc
    //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //         .rect(startX, startY, keyWidth, rowHeight)
    //         .stroke("black")
    //         .fill();
    
    //       // Draw text in field1 cell (bold for the first row, normal for others)
    //       doc
    //         .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field1, startX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: keyWidth,
    //         });
    
    //       // Draw the second column, even if value1 is absent
    //       doc
    //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
    //         .stroke("black")
    //         .fill();
    
    //       // Draw text in value1 cell (bold for the first row, normal for others)
    //       const keyValueText = row.value1 || ""; // Display value1 text if present
    //       doc
    //         .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: valueWidth,
    //         });
    //     }
    
    //     // Draw vertical line between the columns
    //     doc.lineWidth(0.5);
    //     doc.strokeColor("black");
    //     doc.moveTo(startX + keyWidth, startY);
    //     doc.lineTo(startX + keyWidth, startY + rowHeight);
    //     doc.stroke();
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    
    
      
        const  termsConditionTable = [
          { field1: "S. No", value1: `Specified Terms & Condition` },
          { field1: "1", value1: `Registered Mortgage to be created and release cost to be borne by the customer. Security to be created cost to be borne by the Borrower or the Guarantor, as the case may be.` },
          { field1: "2", value1: `Facility is subject to satisfactory compliance of all terms and conditions as stipulated in the legal opinion report, the title of which should be clear and marketable given by the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved lawyer and the cost of which should be borne by the Borrower or the Guarantor, as the case may be.` },
          { field1: "3", value1: `Facility account will be setup subject to technical clearance of the property to be mortgaged, as assessed by RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "4", value1: `The quantum of Facility amount will be based on a satisfactory valuation report from the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved valuer.` },
          { field1: "5", value1: `The security charged to the RATNAAFIN CAPITAL PRIVATE LIMITED including property etc. should be comprehensively insured (fire, riots and other hazards like earthquake, floods, etc.) with RATNAAFIN CAPITAL PRIVATE LIMITED Clause and the policy document /a copy of the policy document to be submitted for.` },
          { field1: "6", value1: `The property shall be well maintained at all times and during the pendency of the loan if the property suffers any loss on account of natural calamities or due to riots etc., the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED without fail.` },
          { field1: "7", value1: `Borrower and the Guarantor shall not voluntarily cause any harm to the property that may in any way be detrimental to the interests of the RATNAAFIN CAPITAL PRIVATE LIMITED. You shall make up for any loss incurred to the RATNAAFIN CAPITAL PRIVATE LIMITED on account of any damages occurring to the property due to deviation from the approved plan.` },
          { field1: "8", value1: `You will ensure that the property tax is promptly paid.` },
          { field1: "9", value1: `You will not be entitled to sell, mortgage, lease, surrender or alienate the mortgaged property, or any part thereof, during the subsistence of the mortgage without prior intimation to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "10", value1: `In case of foreclosure of Loan, 4% on the principal outstanding amount will be applicable. In case of balance transfer, 4% charges will be applicable.\n\n Foreclosure charges shall not be levied on individual borrowers for floating rates loans.` },
          { field1: "11", value1: `FRR as applicable on the date of disbursement and the same shall be reset at an interval as per the internal Guidelines of RATNAAFIN CAPITAL PRIVATE LIMITED. It shall be the responsibility of the borrower(s) to inquire or avail from Ratnaafin Capital Private Limited the details thereof on the reset date specified in the agreement. RATNAAFIN CAPITAL PRIVATE LIMITED is entitled to change the reset frequency at any point of time.` },
          { field1: "12", value1: `In case of Takeover of the facility, 4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement).\n\n Takeover charges shall not be levied on individual borrowers for floating rates.` },
          { field1: "13", value1: `The Processing Fees and / or Login Fees are non-refundable.` },
          { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED is authorised to debit Processing fees and other charges / insurance premium mentioned in the sanction\n\n letter from the account/s of the firm company maintained with the Bank.` },
          { field1: "15", value1: `The Borrower and Security Providers shall be deemed to have given their express consent to the RATNAAFIN CAPITAL PRIVATE LIMITED to disclose the information and data furnished by them to the RATNAAFIN CAPITAL PRIVATE LIMITED and also those regarding the credit facility or facilities enjoyed by the borrower, conduct of accounts and guarantee obligations undertaken by guarantor to the Credit Information Companies , or any other credit bureau or RBI or any other agencies specified by RBI who are authorized to seek and publish information, upon signing the copy of the sanction letter.` },
          { field1: "16", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED also reserves the right to assign, securitize or otherwise transfer the loan hereby agreed to be granted or a portion thereof to any person or third party assignee without any notice or consent along with or without underlying security or securities whether movable and or immovable created or to be created for the benefit of the RATNAAFIN CAPITAL PRIVATE LIMITED and pursuant to which the assignee shall be entitled to all or any rights and benefits under the loan and other agreements and or the security or securities created or to be created by me or us or the security providers.` },
        ];
        
        termsConditionTableFunction(termsConditionTable);
    
    ////    addFooter()
    
    //     //----------------------------------------------------new page 5-------------------------------
    
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(9);
        function termsConditionTableFunction1(tableData) {
          // Add Table Header
          const startX = 50;
          let startY = doc.y + 10;
          const totalWidth = 500; // Total column width
          const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
          const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
          const padding = 5; // Padding to ensure text doesn't touch the border
        
          tableData.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
        
            // Calculate the height of the text for field1 and value1
            const field1TextHeight = doc
              .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
              .fontSize(7.2)
              .heightOfString(row.field1, { width: keyWidth - 2 * padding });
        
            let value1TextHeight = 0;
            if (row.value1) {
              value1TextHeight = doc
                .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
                .fontSize(7.2)
                .heightOfString(row.value1, { width: valueWidth - 2 * padding });
            }
        
            // Determine the maximum height between field1 and value1 to set row height
            rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
        
            // Check if field1 contains "S. No" (case-insensitive match)
            const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
        
            // Apply special row styling
            if (isSpecialRow) {
              doc
                .fillColor("#00BFFF") // Background color
                .rect(startX, startY, totalWidth, rowHeight)
                .fill()
                .stroke("black", 0.5); // Thin border
        
              doc
                .font(font)
                .fillColor("black") // Text color
                .fontSize(7.2)
                .text(row.field1, startX + padding, startY + padding, {
                  baseline: "hanging",
                  width: keyWidth - 2 * padding,
                });
        
              const keyValueText = row.value1 || ""; // Display value1 text if present
              doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                  baseline: "hanging",
                  width: valueWidth - 2 * padding,
                });
            } else {
              // Alternate row background color
              doc.lineWidth(0.5);
              doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();
        
              // Draw text in field1 cell
              doc
                .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + padding, startY + padding, {
                  baseline: "hanging",
                  width: keyWidth - 2 * padding,
                });
        
              // Draw the second column, even if value1 is absent
              doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();
        
              // Draw text in value1 cell
              const keyValueText = row.value1 || ""; // Display value1 text if present
              doc
                .font(rowIndex === 0 ? font: font) // Bold for the first row only
                .fillColor("black")
                .fontSize(7.2)
                .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                  baseline: "hanging",
                  width: valueWidth - 2 * padding,
                });
            }
        
            // Draw vertical line between the columns
            doc.lineWidth(0.5);
            doc.strokeColor("black");
            doc.moveTo(startX + keyWidth, startY);
            doc.lineTo(startX + keyWidth, startY + rowHeight);
            doc.stroke();
        
            // Move to the next row position
            startY += rowHeight;
          });
        }
    
        const conditonsTable = [
          { field1: "17", value1: `In the event of any change of address for communication, any change in job, profession by you or the guarantors, the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED immediately` },
          { field1: "18", value1: `General undertaking to be taken from borrower are as mentioned below, if applicable\nThat the Firm not to pay any consideration by way of commission, brokerage, fees or any other form to guarantors directly or indirectly.That working capital funds would not be diverted for long term use\nThat none of the directors of Ratnaafin Capital Private Limited or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or of a subsidiary of the borrower or of the holding company of the borrower and that none of them hold substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrowers knowledge none of the directors of any other bank or the subsidiaries of the banks or trustees of mutual funds or venture capital funds set up by the banks or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them holds substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrower’s knowledge none of senior officials of the RATNAAFIN CAPITAL PRIVATE LIMITED or the participating banks under consortium or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them hold substantial interest in the borrower or its subsidiary or its holding company. That in case if any of the above requirement is breached, the borrower shall inform of the RATNAAFIN CAPITAL PRIVATE LIMITED the same immediately.` },
        ]
    
        termsConditionTableFunction1(conditonsTable);
        doc.moveDown(1.5)
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
        .moveDown(0.5);
    
        const  standardConditionTable = [
          { field1: "S. No", value1: `Standard Terms & Condition` },
          { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
          { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof.` },
          { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
          { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED will have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
          { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
          { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
          // { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
          // { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
          // { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          // { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
          // { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          // { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
        ];
    
        termsConditionTableFunction(standardConditionTable);
    
    ////    addFooter()
    
    //     // ------------------------------------new page 6---------------------------------------
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(7);
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
        .moveDown(0.5);
    
        const  standardConditionTablee = [
          // { field1: "S. No", value1: `Standard Terms & Condition` },
          // { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          // { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
          // { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof` },
          // { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
          // { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITEDwill have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
          // { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
          // { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
          { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
          { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
          { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
          { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
          { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
          { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
          { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
          { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
          { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
          { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
          { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
          { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
          { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
          // { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
          // { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
          // { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
          // { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
          // { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
        
        ];
    
        termsConditionTableFunction1(standardConditionTablee);
    
    ////    addFooter()
    
    
    //     //-------------------------------------new page 7--------------------------------------------------
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(5);
    
        const table = [
          //  { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
          // { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
          // { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
          // { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
          // { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
          // { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
          // { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
          // { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
          // { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
          { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
          { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
          { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
          { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
          { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          { field1: "28", value1: `For cases where charge was registered with Registrar of Companies for securities proposed with Ratnaafin Capital Private Limited, borrower will arrange satisfaction of charge post security creation with Ratnaafin Capital Private Limited.` },
          { field1: "29", value1: `CERSAI Charges for registration of security interest will be levied as follows. Non-refundable charges levied by Central Registry of Securitization of Asset Reconstruction and Security Interest of India. For Registration of Individual Security Primary and or Collateral created in favour of Ratnaafin Capital Private Limited i. When facility amount is equal to Rs 5 lacs or lesser, Rs 50 plus GST ii. When facility amount is greater than Rs 5 Lacs, Rs 100 plus GST` },
          { field1: "30", value1: `Insurance renewal condition, Borrower to submit valid copy of Insurance of the property, and other assets duly charged in favour of Ratnaafin Capital Private Limited. Further borrower to ensure that fresh copy of insurance is provided to the RATNAAFIN CAPITAL PRIVATE LIMITED within 7 days before the expiry of insurance policy. In absence of that, Cash Credit or Overdraft or Current account shall be debited towards the insurance premium amount on the date of expiry of Insurance policy.` },   
       
        ];
    
        termsConditionTableFunction1(table);
        doc.moveDown(2)
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(7);
    
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`KEY FACTS STATEMENT \n\n PART-1 Interest rate and fees / charges`,startX, doc.y, { align: "center", x: 50 })
        .moveDown(0.5);
    
        function securityDetailsTableFunction(tableData) {
          // Add Table Header
          const startX = 50;
          let startY = doc.y + 10;
          const totalWidth = 500; // Total table width
          const field1Width = Math.round(totalWidth * 0.1); // 10% for field1
          const field2Width = Math.round(totalWidth * 0.45); // 45% for field2
          const field3Width = totalWidth - field1Width - field2Width; // Remaining 45% for field3
      
          tableData.forEach((row, rowIndex) => {
              // Set default row height
              let rowHeight = 15;
      
              // Calculate the height of the text for field1, field2, and field3
              const field1TextHeight = doc
                  .font(fontBold) // Bold font for field1
                  .fontSize(7.2)
                  .heightOfString(row.field1, { width: field1Width });
      
              const field2TextHeight = doc
                  .font(font) // Regular font for field2
                  .fontSize(7.2)
                  .heightOfString(row.field2, { width: field2Width });
      
              const field3TextHeight = doc
                  .font(font) // Regular font for field3
                  .fontSize(7.2)
                  .heightOfString(row.field3, { width: field3Width });
      
              // Determine the maximum height between all fields to set row height
              rowHeight = Math.max(field1TextHeight, field2TextHeight, field3TextHeight) + 10;
      
              // Alternate row background color
              doc.lineWidth(0.5);
              doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, totalWidth, rowHeight)
                  .stroke("black")
                  .fill();
      
              // Draw field1 text in the first column
              doc
                  .font(fontBold) // Bold font for field1
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field1, startX + 5, startY + 5, {
                      baseline: "hanging",
                      width: field1Width,
                  });
      
              // Draw field2 text in the second column
              doc
                  .font(font) // Regular font for field2
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field2, startX + field1Width + 5, startY + 5, {
                      baseline: "hanging",
                      width: field2Width,
                  });
      
              // Draw field3 text in the third column
              doc
                  .font(font) // Regular font for field3
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field3 || "", startX + field1Width + field2Width + 5, startY + 5, {
                      baseline: "hanging",
                      width: field3Width,
                  });
      
              // Draw vertical lines between columns
              doc.strokeColor("black").lineWidth(0.5);
              doc.moveTo(startX + field1Width, startY).lineTo(startX + field1Width, startY + rowHeight).stroke();
              doc.moveTo(startX + field1Width + field2Width, startY).lineTo(startX + field1Width + field2Width, startY + rowHeight).stroke();
      
              // Move to the next row position
              startY += rowHeight;
          });
      }
      
      // Table Data
      const kycTable = [
          { field1: "1", field2: "Loan proposal/ account No.", field3: `${allPerameters.pENDENCYlOANnumber}` },
          { field1: "", field2: "Type of Loan", field3: "Agri Micro Loan Against Property" },
          { field1: "2", field2: "Sanctioned Loan amount (in Rupees)", field3: `Rs.${allPerameters.loanAmount} ${allPerameters.loanAmountinwords}` },
          { field1: "3", field2: "Disbursal schedule\n (i) Disbursement in stages or 100% upfront.\n(ii) If it is stage wise, mention the clause of loan agreement having relevant details", field3: "100 % upfront / As per Clause 3 (a)" },
          { field1: "4", field2: "Loan term (year/months/days)", field3: `${allPerameters.tenureinMonths} months` },
      ];
      
      // Call the function
      securityDetailsTableFunction(kycTable);
    
      function instalmentTableFunction(tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
    
        // Determine the maximum number of fields in the table
        const maxFields = Math.max(
            ...tableData.map((row) => Object.keys(row).length)
        );
    
        // Calculate dynamic column width based on the number of fields
        const columnWidth = totalWidth / maxFields;
    
        tableData.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
    
            // Calculate the height for each field dynamically
            const fieldHeights = Object.keys(row).map((key) => {
                return doc
                    .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                    .fontSize(7.2)
                    .heightOfString(row[key] || "", { width: columnWidth });
            });
    
            // Determine the maximum height between all fields
            rowHeight = Math.max(...fieldHeights) + 10;
    
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, totalWidth, rowHeight)
                .stroke("black")
                .fill();
    
            // Draw text for each field dynamically
            let currentX = startX;
            Object.keys(row).forEach((key, index) => {
                doc
                    .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row[key] || "", currentX + 5, startY + 5, {
                        baseline: "hanging",
                        width: columnWidth,
                    });
    
                // Draw vertical line after the column
                doc.strokeColor("black").lineWidth(0.5);
                doc
                    .moveTo(currentX + columnWidth, startY)
                    .lineTo(currentX + columnWidth, startY + rowHeight)
                    .stroke();
    
                currentX += columnWidth;
            });
    
            // Move to the next row position
            startY += rowHeight;
        });
    }
    // Table instalment data examples
    const instalmentTable = [
        { field1: "5", field2: "Instalment details" },
        { field1: "Type of instalments", field2: "Number of EPIs", field3: `EPI (Rs)`, field4: "Commencement of repayment, post sanction" },
        { field1: "Monthly", field2: `${allPerameters.tenureinMonths}`, field3: `Rs ${allPerameters.emiAmount}`, field4: `10th of the month next to the \nfollowing month` },
    ];
    // Call the function
    instalmentTableFunction(instalmentTable);
    
    // function loanTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Determine the maximum number of fields in the table
    //   const maxFields = Math.max(
    //     ...tableData.map((row) => Object.keys(row).length)
    //   );
    
    //   // Calculate dynamic column width based on the number of fields
    //   const columnWidth = totalWidth / maxFields;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = Object.keys(row).map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    //     Object.keys(row).forEach((key, index) => {
    //       // Draw the text for each field
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row[key] || "", currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth,
    //         });
    
    //       // Draw vertical line after the column
    //       doc.strokeColor("black").lineWidth(0.5);
    //       doc
    //         .moveTo(currentX + columnWidth, startY)
    //         .lineTo(currentX + columnWidth, startY + rowHeight)
    //         .stroke();
    
    //       currentX += columnWidth;
    //     });
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    function loanTableFunction(tableData, customWidths = []) {
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
    
      tableData.forEach((row, rowIndex) => {
        // Determine if custom widths are provided for the current row
        const numColumns = Object.keys(row).length;
        const rowWidths = customWidths[rowIndex] || Array(numColumns).fill(totalWidth / numColumns);
    
        // Set default row height
        let rowHeight = 15;
    
        // Calculate the height for each field dynamically
        const fieldHeights = Object.keys(row).map((key, index) => {
          return doc
            .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
            .fontSize(7.2)
            .heightOfString(row[key] || "", { width: rowWidths[index] });
        });
    
        // Determine the maximum height between all fields
        rowHeight = Math.max(...fieldHeights) + 10;
    
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX, startY, totalWidth, rowHeight)
          .stroke("black")
          .fill();
    
        // Draw text for each field dynamically
        let currentX = startX;
        Object.keys(row).forEach((key, index) => {
          // Draw the text for each field
          doc
            .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
            .fillColor("black")
            .fontSize(7.2)
            .text(row[key] || "", currentX + 5, startY + 5, {
              baseline: "hanging",
              width: rowWidths[index],
            });
    
          // Draw vertical line after the column
          doc.strokeColor("black").lineWidth(0.5);
          doc
            .moveTo(currentX + rowWidths[index], startY)
            .lineTo(currentX + rowWidths[index], startY + rowHeight)
            .stroke();
    
          currentX += rowWidths[index];
        });
    
        // Move to the next row position
        startY += rowHeight;
      });
    }
    
    const loanTable = [
      { field1: "6", field2: "Interest rate (%) and type (fixed or floating or hybrid)",field3: `${allPerameters.interestRate}% p.a (floating)` },
      { field1: "7", field2: "Additional Information in case of Floating rate of interest" },
      { field1: "Reference Benchmark", field2: "Benchmark rate (%) (B)", field3: "Spread (%) (S)",field4: "Final rate (%) R = (B) + (S)"  },
      { field1: "FRR", field2: "19.20%", field3: `${allPerameters.interestType}%`,field4: `${allPerameters.interestRate}%` },
    ];
    
    const customWidths = [
      [50, 300, 150], // Custom widths for the 1st row (3 columns)
      [50, 450],     // Custom widths for the 2nd row (2 columns)
      null,           // Default dynamic widths for the 3rd row
      null,           // Default dynamic widths for the 4th row
    ];
      //interestRate
    loanTableFunction(loanTable,customWidths);
    
    // function resetTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Determine the maximum number of fields in the table
    //   const maxFields = Math.max(
    //     ...tableData.map((row) => Object.keys(row).length)
    //   );
    
    //   // Calculate dynamic column width based on the number of fields
    //   const columnWidth = totalWidth / maxFields;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = Object.keys(row).map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    
    //     if (rowIndex === 1) {
    //       // For the second row, only span field2 and field3
    //       // Field 1 remains in the first column
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field1 || "", currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth, // field1 takes only the first column width
    //         });
    
    //       // Span field2 and field3 across the remaining columns
    //       currentX += columnWidth; // move to the next column for field2
    //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
    //       doc
    //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(row.field2 || "", currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: spanWidth, // field2 spans the rest of the row width
    //         });
    //     } else {
    //       // Regular row processing (for all other rows)
    //       Object.keys(row).forEach((key, index) => {
    //         // Draw the text for each field
    //         doc
    //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
    //           .fillColor("black")
    //           .fontSize(7.2)
    //           .text(row[key] || "", currentX + 5, startY + 5, {
    //             baseline: "hanging",
    //             width: columnWidth,
    //           });
    
    //         // Draw vertical line after the column
    //         doc.strokeColor("black").lineWidth(0.5);
    //         doc
    //           .moveTo(currentX + columnWidth, startY)
    //           .lineTo(currentX + columnWidth, startY + rowHeight)
    //           .stroke();
    
    //         currentX += columnWidth;
    //       });
    //     }
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    
    // const resetTable = [
    //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
    //   { field1: "", field2: "Every 3 month" },
    // ];
      
    // resetTableFunction(resetTable);
    
    // function impactTableFunction(tableData) {
    //   const startX = 50;
    //   let startY = doc.y + 10;
    //   const totalWidth = 500; // Total table width
    
    //   // Set the number of columns explicitly (3 columns)
    //   const columns = ['field1', 'field2', 'field3'];
    
    //   // Calculate dynamic column width based on the number of columns
    //   const columnWidth = totalWidth / columns.length;
    
    //   tableData.forEach((row, rowIndex) => {
    //     // Set default row height
    //     let rowHeight = 15;
    
    //     // Calculate the height for each field dynamically
    //     const fieldHeights = columns.map((key) => {
    //       return doc
    //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fontSize(7.2)
    //         .heightOfString(row[key] || "", { width: columnWidth });
    //     });
    
    //     // Determine the maximum height between all fields
    //     rowHeight = Math.max(...fieldHeights) + 10;
    
    //     // Alternate row background color
    //     doc.lineWidth(0.5);
    //     doc
    //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //       .rect(startX, startY, totalWidth, rowHeight)
    //       .stroke("black")
    //       .fill();
    
    //     // Draw text for each field dynamically
    //     let currentX = startX;
    //     columns.forEach((key, index) => {
    //       // Check if field is empty, and show blank if needed
    //       const fieldValue = row[key] || " ";
    
    //       doc
    //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
    //         .fillColor("black")
    //         .fontSize(7.2)
    //         .text(fieldValue, currentX + 5, startY + 5, {
    //           baseline: "hanging",
    //           width: columnWidth,
    //         });
    
    //       // Draw vertical line after the column
    //       doc.strokeColor("black").lineWidth(0.5);
    //       doc
    //         .moveTo(currentX + columnWidth, startY)
    //         .lineTo(currentX + columnWidth, startY + rowHeight)
    //         .stroke();
    
    //       currentX += columnWidth;
    //     });
    
    //     // Move to the next row position
    //     startY += rowHeight;
    //   });
    // }
    
    // const impactTable = [
    //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: `EPI\u20B9`,field3: "No. of EPIs" },
    //   { field1: "", field2:  `${allPerameters.epi}`,field3:  `${allPerameters.noOfEpi}` },
    // ];
      
    // impactTableFunction(impactTable);
    function chargesTableFunction1(doc, tableData, font, fontBold) {
      const startX = 50; // Starting X position
      let startY = doc.y + 10; // Starting Y position
      const totalWidth = 500; // Total table width
      const baseColumnWidth = totalWidth / 4; // Base column width (4 columns in total)
    
      tableData.forEach((row, rowIndex) => {
        let currentX = startX;
        let rowHeight = 15;
    
        row.forEach((cell) => {
          const colWidth = baseColumnWidth * (cell.colSpan || 1); // Adjust width by colSpan
          const fieldHeight = doc
            .font(cell.bold ? fontBold : font) // Bold if specified
            .fontSize(7.2)
            .heightOfString(cell.text, { width: colWidth });
    
          rowHeight = Math.max(rowHeight, fieldHeight + 10);
    
          // Draw cell background
          doc.lineWidth(0.5)
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(currentX, startY, colWidth, rowHeight)
            .stroke("black")
            .fill();
    
          // Draw text inside the cell
          doc.fillColor("black")
            .font(cell.bold ? fontBold : font)
            .fontSize(7.2)
            .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
    
          // Move to the next cell position
          currentX += colWidth;
        });
    
        // Move to the next row
        startY += rowHeight;
      });
    }
    
    // function chargesTableFunction1(doc, tableData, font, fontBold) {
    //   const startX = 50; // Starting X position
    //   let startY = doc.y + 10; // Starting Y position
    //   const totalWidth = 500; // Total table width
    
    //   tableData.forEach((row, rowIndex) => {
    //     let currentX = startX;
    //     let rowHeight = 15;
    
    //     row.forEach((cell) => {
    //       const colWidth = (totalWidth / 4) * (cell.colSpan || 1); // Adjust width by colSpan
    //       const fieldHeight = doc
    //         .font(cell.bold ? fontBold : font) // Bold if specified
    //         .fontSize(7.2)
    //         .heightOfString(cell.text, { width: colWidth });
    
    //       rowHeight = Math.max(rowHeight, fieldHeight + 10);
    
    //       // Draw cell background
    //       doc.lineWidth(0.5)
    //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
    //         .rect(currentX, startY, colWidth, rowHeight)
    //         .stroke("black")
    //         .fill();
    
    //       // Draw text inside the cell
    //       doc.fillColor("black")
    //         .font(cell.bold ? fontBold : font)
    //         .fontSize(7.2)
    //         .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
    
    //       // Move to the next cell position
    //       currentX += colWidth;
    //     });
    
    //     // Move to the next row
    //     startY += rowHeight;
    //   });
    // }
    
    // const tableData1 = [
    //   [
    //     { text: "Reset periodicity (Months)", colSpan: 2, bold: true },
    //     { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: true },
    //   ],
    //   [
    //     { text: "B", bold: true },
    //     { text: "S", bold: true },
    //     { text: "EPI (₹)", bold: true },
    //     { text: "No. of EPIs", bold: true },
    //   ],
    //   [
    //     { text: "Every 3 months", colSpan: 2, bold: false },
    //     { text: "14749", bold: true },
    //     { text: "61", bold: true },
    //   ],
    // ];
    const tableData1 = [
      [
        { text: `Reset periodicity \n(Months)`, colSpan: 2, bold: false }, // Spanning 2 columns
        { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: false }, // Spanning 2 columns
      ],
      [
        { text: "B", bold: false }, // Single column
        { text: "S", bold: false }, // Single column
        { text: "EPI (Rs)", bold: false }, // Single column
        { text: "No. of EPIs", bold: false }, // Single column
      ],
      [
        { text: "Every 3 months", colSpan: 2, bold: false }, // Spanning 2 columns
        { text: `Rs ${allPerameters.epi}`, bold: false }, // Single column
        { text:  `${allPerameters.noOfEpi}`, bold: false }, // Single column
      ],
    ];
    
    
    chargesTableFunction1(doc, tableData1, font, fontBold);
    
    function chargesTableFunction(tableData) {
      const startX = 50;
      let startY = doc.y + 10;
      const totalWidth = 500; // Total table width
    
      // Set the number of columns explicitly (3 columns)
      const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
    
      // Calculate dynamic column width based on the number of columns
      const columnWidth = totalWidth / columns.length;
    
      tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;
    
        // Calculate the height for each field dynamically
        const fieldHeights = columns.map((key) => {
          return doc
            .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
            .fontSize(7.2)
            .heightOfString(row[key] || "", { width: columnWidth });
        });
    
        // Determine the maximum height between all fields
        rowHeight = Math.max(...fieldHeights) + 10;
    
        // Alternate row background color
        doc.lineWidth(0.5);
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(startX, startY, totalWidth, rowHeight)
          .stroke("black")
          .fill();
    
        // Draw text for each field dynamically
        let currentX = startX;
        columns.forEach((key, index) => {
          // Check if field is empty, and show blank if needed
          const fieldValue = row[key] || " ";
    
          doc
            .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
            .fillColor("black")
            .fontSize(7.2)
            .text(fieldValue, currentX + 5, startY + 5, {
              baseline: "hanging",
              width: columnWidth,
            });
    
          // Draw vertical line after the column
          doc.strokeColor("black").lineWidth(0.5);
          doc
            .moveTo(currentX + columnWidth, startY)
            .lineTo(currentX + columnWidth, startY + rowHeight)
            .stroke();
    
          currentX += columnWidth;
        });
    
        // Move to the next row position
        startY += rowHeight;
      });
    }
    
    const chargesTable = [
      { field1: "8", field2: "Fee/ Charges" },
      { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
    ];
    
    chargesTableFunction(chargesTable);
    
    
    function generateFeeChargesTableFromThirdRow(doc, tableData) {
      const startX = 50; // Starting X-coordinate
      let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
      const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
    
      tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
    
          // Dynamically calculate the height of each cell's content
          const cellHeights = Object.keys(row).map((key, index) => {
              return doc
                  .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                  .fontSize(8)
                  .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
          });
    
          rowHeight = Math.max(...cellHeights) + 10;
    
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
              .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
              .stroke("black")
              .fill();
    
          // Draw cell contents and vertical borders
          let currentX = startX;
          Object.keys(row).forEach((key, index) => {
              doc
                  .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                  .fontSize(8)
                  .fillColor("black")
                  .text(row[key] || "", currentX + 5, startY + 5, {
                      width: columnWidths[index] - 10,
                      baseline: "hanging",
                      align: "left",
                  });
    
              // Draw vertical lines for columns
              doc.strokeColor("black").lineWidth(0.5);
              doc
                  .moveTo(currentX + columnWidths[index], startY)
                  .lineTo(currentX + columnWidths[index], startY + rowHeight)
                  .stroke();
    
              currentX += columnWidths[index];
          });
    
          // Move to the next row
          startY += rowHeight;
          doc.moveDown(1.8);
    
      });
    
      // Ensure table border ends properly
      doc.stroke();
    }
    
    const tableData = [
    {
      col1: "",
      col2: "",
      col3: "One-time/Recurring",
      col4: `Amount (in Rs) or Percentage(%) asapplicable`,
      col5: "One-time/Recurring",
      col6: `Amount (in Rs) or Percentage(%) as applicable`,
    },
    {
        col1: "(i)",
        col2: "Processing fees",
        col3: "One time",
        col4: `Rs.${allPerameters.processingfees}`,
        col5: "",
        col6: "",
    },
    {
        col1: "(ii)",
        col2: "Insurance charges",
        col3: "One time",
        col4: "",
        col5: "One time",
        col6:  `Rs.${allPerameters.insuranceCharges}`,
    },
    {
        col1: "(iii)",
        col2: "Valuation fees",
        col3: "One time",
        col4: "0",
        col5: "",
        col6: "",
    },
    {
        col1: "(iv)",
        col2: "Any other (please specify)",
        col3: "Documentation Charges, CERSAI Charges",
        col4:  `Rs.${allPerameters.docCharges} \n\nRs.${allPerameters.cersaiCharges}`,
        col5: "",
        col6: "",
    },
    ];
    
    generateFeeChargesTableFromThirdRow(doc, tableData);
    
    function generateFeeChargesTableFromThirdRowten(doc,tableDataten) {
      const startX = 50; // Starting X-coordinate
      let startY = doc.y + 10; // Starting Y-coordinate
      const columnConfigurations = [
          [80, 270, 153], // First row: Three columns
          [80, 423],      // Second row: Two columns
          [80, 200, 222], // Rows 3 to 7: Three columns
      ];
    
      tableDataten.forEach((row, rowIndex) => {
          // Determine the column configuration for the current row
          const columnWidths = columnConfigurations[row.configurationIndex];
          
          // Set default row height
          let rowHeight = 15;
    
          // Dynamically calculate the height of each cell's content
          const cellHeights = row.columns.map((col, index) => {
              return doc
                  .font("Helvetica")
                  .fontSize(8)
                  .heightOfString(col || "", { width: columnWidths[index] - 10 });
          });
    
          rowHeight = Math.max(...cellHeights) + 10;
    
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
              .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
              .stroke("black")
              .fill();
    
          // Draw cell contents and vertical borders
          let currentX = startX;
          row.columns.forEach((col, index) => {
              doc
                  .font("Helvetica")
                  .fontSize(8)
                  .fillColor("black")
                  .text(col || "", currentX + 5, startY + 5, {
                      width: columnWidths[index] - 10,
                      baseline: "hanging",
                      align: "left",
                  });
    
              // Draw vertical lines for columns
              doc.strokeColor("black").lineWidth(0.5);
              doc
                  .moveTo(currentX + columnWidths[index], startY)
                  .lineTo(currentX + columnWidths[index], startY + rowHeight)
                  .stroke();
    
              currentX += columnWidths[index];
          });
    
          // Move to the next row
          startY += rowHeight;
      });
    
      // Ensure table border ends properly
      doc.stroke();
    
    }
    
    const tableDataten = [
      {
          configurationIndex: 0, // First row: 3 columns
          columns: ["9", "Annual Percentage Rate (APR) (%)", `${allPerameters.annualPercentageRateAprPercentage}%`],
      },
      {
          configurationIndex: 1, // Second row: 2 columns
          columns: ["10", `Details of Contingent Charges (in Rs or %, as applicable)`],
      },
      // {
      //     configurationIndex: 2, // Rows 3 to 7: 3 columns
      //     columns: [
      //         "(i)",
      //         "Penal charges, if any, in case of delayed payment",
      //         "2% per month on the Outstanding Dues plus, applicable Taxes",
      //     ],
      // },
      // {
      //     configurationIndex: 2,
      //     columns: [
      //         "(ii)",
      //         "Other penal charges, if any",
      //         "2% per month on the Outstanding Dues plus, applicable Taxes",
      //     ],
      // },
      // {
      //     configurationIndex: 2,
      //     columns: [
      //         "(iii)",
      //         "Foreclosure charges, if applicable",
      //         "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
      //     ],
      // },
      // {
      //     configurationIndex: 2,
      //     columns: [
      //         "(iv)",
      //         "Charges for switching of loans from floating to fixed rate and vice versa",
      //         "Not Applicable",
      //     ],
      // },
      // {
      //     configurationIndex: 2,
      //     columns: [
      //         "(v)",
      //         "Any other charges (please specify)",
      //         "Not Applicable",
      //     ],
      // },
    ];
    
    // Call the function with your doc object and table data
    doc.moveDown();
    generateFeeChargesTableFromThirdRowten(doc, tableDataten);
    doc.moveDown(2.5);
    
    ////    addFooter()
    
    //     //------------------------------------------------new pdf 8--------------------------------------------------------
    
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(4.8);
    
        // function resetTableFunction(tableData) {
        //   const startX = 50;
        //   let startY = doc.y + 10;
        //   const totalWidth = 500; // Total table width
        
        //   // Determine the maximum number of fields in the table
        //   const maxFields = Math.max(
        //     ...tableData.map((row) => Object.keys(row).length)
        //   );
        
        //   // Calculate dynamic column width based on the number of fields
        //   const columnWidth = totalWidth / maxFields;
        
        //   tableData.forEach((row, rowIndex) => {
        //     // Set default row height
        //     let rowHeight = 15;
        
        //     // Calculate the height for each field dynamically
        //     const fieldHeights = Object.keys(row).map((key) => {
        //       return doc
        //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
        //         .fontSize(7.2)
        //         .heightOfString(row[key] || "", { width: columnWidth });
        //     });
        
        //     // Determine the maximum height between all fields
        //     rowHeight = Math.max(...fieldHeights) + 10;
        
        //     // Alternate row background color
        //     doc.lineWidth(0.5);
        //     doc
        //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //       .rect(startX, startY, totalWidth, rowHeight)
        //       .stroke("black")
        //       .fill();
        
        //     // Draw text for each field dynamically
        //     let currentX = startX;
        
        //     if (rowIndex === 1) {
        //       // For the second row, only span field2 and field3
        //       // Field 1 remains in the first column
        //       doc
        //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(row.field1 || "", currentX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: columnWidth, // field1 takes only the first column width
        //         });
        
        //       // Span field2 and field3 across the remaining columns
        //       currentX += columnWidth; // move to the next column for field2
        //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
        //       doc
        //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(row.field2 || "", currentX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: spanWidth, // field2 spans the rest of the row width
        //         });
        //     } else {
        //       // Regular row processing (for all other rows)
        //       Object.keys(row).forEach((key, index) => {
        //         // Draw the text for each field
        //         doc
        //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
        //           .fillColor("black")
        //           .fontSize(7.2)
        //           .text(row[key] || "", currentX + 5, startY + 5, {
        //             baseline: "hanging",
        //             width: columnWidth,
        //           });
        
        //         // Draw vertical line after the column
        //         doc.strokeColor("black").lineWidth(0.5);
        //         doc
        //           .moveTo(currentX + columnWidth, startY)
        //           .lineTo(currentX + columnWidth, startY + rowHeight)
        //           .stroke();
        
        //         currentX += columnWidth;
        //       });
        //     }
        
        //     // Move to the next row position
        //     startY += rowHeight;
        //   });
        // }
    
        // const resetTable = [
        //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
        //   { field1: "", field2: "Every 3 month" },
        // ];
          
        // resetTableFunction(resetTable);
    
        // function impactTableFunction(tableData) {
        //   const startX = 50;
        //   let startY = doc.y + 10;
        //   const totalWidth = 500; // Total table width
        
        //   // Set the number of columns explicitly (3 columns)
        //   const columns = ['field1', 'field2', 'field3'];
        
        //   // Calculate dynamic column width based on the number of columns
        //   const columnWidth = totalWidth / columns.length;
        
        //   tableData.forEach((row, rowIndex) => {
        //     // Set default row height
        //     let rowHeight = 15;
        
        //     // Calculate the height for each field dynamically
        //     const fieldHeights = columns.map((key) => {
        //       return doc
        //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
        //         .fontSize(7.2)
        //         .heightOfString(row[key] || "", { width: columnWidth });
        //     });
        
        //     // Determine the maximum height between all fields
        //     rowHeight = Math.max(...fieldHeights) + 10;
        
        //     // Alternate row background color
        //     doc.lineWidth(0.5);
        //     doc
        //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //       .rect(startX, startY, totalWidth, rowHeight)
        //       .stroke("black")
        //       .fill();
        
        //     // Draw text for each field dynamically
        //     let currentX = startX;
        //     columns.forEach((key, index) => {
        //       // Check if field is empty, and show blank if needed
        //       const fieldValue = row[key] || " ";
        
        //       doc
        //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(fieldValue, currentX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: columnWidth,
        //         });
        
        //       // Draw vertical line after the column
        //       doc.strokeColor("black").lineWidth(0.5);
        //       doc
        //         .moveTo(currentX + columnWidth, startY)
        //         .lineTo(currentX + columnWidth, startY + rowHeight)
        //         .stroke();
        
        //       currentX += columnWidth;
        //     });
        
        //     // Move to the next row position
        //     startY += rowHeight;
        //   });
        // }
    
        // const impactTable = [
        //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: "EPI",field3: "No. of EPIs" },
        //   { field1: "", field2: "14749 ",field3: "61" },
        // ];
          
        // impactTableFunction(impactTable);
    
    
        // function chargesTableFunction(tableData) {
        //   const startX = 50;
        //   let startY = doc.y + 10;
        //   const totalWidth = 500; // Total table width
        
        //   // Set the number of columns explicitly (3 columns)
        //   const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
        
        //   // Calculate dynamic column width based on the number of columns
        //   const columnWidth = totalWidth / columns.length;
        
        //   tableData.forEach((row, rowIndex) => {
        //     // Set default row height
        //     let rowHeight = 15;
        
        //     // Calculate the height for each field dynamically
        //     const fieldHeights = columns.map((key) => {
        //       return doc
        //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
        //         .fontSize(7.2)
        //         .heightOfString(row[key] || "", { width: columnWidth });
        //     });
        
        //     // Determine the maximum height between all fields
        //     rowHeight = Math.max(...fieldHeights) + 10;
        
        //     // Alternate row background color
        //     doc.lineWidth(0.5);
        //     doc
        //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //       .rect(startX, startY, totalWidth, rowHeight)
        //       .stroke("black")
        //       .fill();
        
        //     // Draw text for each field dynamically
        //     let currentX = startX;
        //     columns.forEach((key, index) => {
        //       // Check if field is empty, and show blank if needed
        //       const fieldValue = row[key] || " ";
        
        //       doc
        //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
        //         .fillColor("black")
        //         .fontSize(7.2)
        //         .text(fieldValue, currentX + 5, startY + 5, {
        //           baseline: "hanging",
        //           width: columnWidth,
        //         });
        
        //       // Draw vertical line after the column
        //       doc.strokeColor("black").lineWidth(0.5);
        //       doc
        //         .moveTo(currentX + columnWidth, startY)
        //         .lineTo(currentX + columnWidth, startY + rowHeight)
        //         .stroke();
        
        //       currentX += columnWidth;
        //     });
        
        //     // Move to the next row position
        //     startY += rowHeight;
        //   });
        // }
        
        // const chargesTable = [
        //   { field1: "8", field2: "Fee/ Charges" },
        //   { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
        // ];
        
        // chargesTableFunction(chargesTable);
    
    //     function generateFeeChargesTableFromThirdRow(doc, tableData) {
    //       const startX = 50; // Starting X-coordinate
    //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
    //       const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
      
    //       tableData.forEach((row, rowIndex) => {
    //           // Set default row height
    //           let rowHeight = 15;
      
    //           // Dynamically calculate the height of each cell's content
    //           const cellHeights = Object.keys(row).map((key, index) => {
    //               return doc
    //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
    //                   .fontSize(8)
    //                   .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
    //           });
      
    //           rowHeight = Math.max(...cellHeights) + 10;
      
    //           // Alternate row background color
    //           doc.lineWidth(0.5);
    //           doc
    //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
    //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
    //               .stroke("black")
    //               .fill();
      
    //           // Draw cell contents and vertical borders
    //           let currentX = startX;
    //           Object.keys(row).forEach((key, index) => {
    //               doc
    //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
    //                   .fontSize(8)
    //                   .fillColor("black")
    //                   .text(row[key] || "", currentX + 5, startY + 5, {
    //                       width: columnWidths[index] - 10,
    //                       baseline: "hanging",
    //                       align: "left",
    //                   });
      
    //               // Draw vertical lines for columns
    //               doc.strokeColor("black").lineWidth(0.5);
    //               doc
    //                   .moveTo(currentX + columnWidths[index], startY)
    //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
    //                   .stroke();
      
    //               currentX += columnWidths[index];
    //           });
      
    //           // Move to the next row
    //           startY += rowHeight;
    //       });
      
    //       // Ensure table border ends properly
    //       doc.stroke();
    //   }
    
    //   const tableData = [
    //     {
    //       col1: "",
    //       col2: "",
    //       col3: "One-time/Recurring",
    //       col4: "Amount (in₹) or Percentage(%) asapplicable",
    //       col5: "One-time/Recurring",
    //       col6: "Amount (in ₹) or Percentage(%) as applicable",
    //   },
    //     {
    //         col1: "(i)",
    //         col2: "Processing fees",
    //         col3: "One time",
    //         col4: "11800",
    //         col5: "One time",
    //         col6: "3930",
    //     },
    //     {
    //         col1: "(ii)",
    //         col2: "Insurance charges",
    //         col3: "One time",
    //         col4: "3930",
    //         col5: "",
    //         col6: "",
    //     },
    //     {
    //         col1: "(iii)",
    //         col2: "Valuation fees",
    //         col3: "One time",
    //         col4: "0",
    //         col5: "",
    //         col6: "",
    //     },
    //     {
    //         col1: "(iv)",
    //         col2: "Any other (please specify)",
    //         col3: "Documentation Charges, CERSAI Charges",
    //         col4: "11800",
    //         col5: "",
    //         col6: "",
    //     },
    // ];
    
    // generateFeeChargesTableFromThirdRow(doc, tableData);
    // doc.moveDown(2.5);
    
    function generateFeeChargesTableFromThirdRowtenv(doc,tableDatatenv) {
      const startX = 50; // Starting X-coordinate
      let startY = doc.y + 10; // Starting Y-coordinate
      const columnConfigurations = [
          [80, 270, 153], // First row: Three columns
          [80, 423],      // Second row: Two columns
          [80, 200, 222], // Rows 3 to 7: Three columns
      ];
    
      tableDatatenv.forEach((row, rowIndex) => {
          // Determine the column configuration for the current row
          const columnWidths = columnConfigurations[row.configurationIndex];
          
          // Set default row height
          let rowHeight = 15;
    
          // Dynamically calculate the height of each cell's content
          const cellHeights = row.columns.map((col, index) => {
              return doc
                  .font("Helvetica")
                  .fontSize(7)
                  .heightOfString(col || "", { width: columnWidths[index] - 10 });
          });
    
          rowHeight = Math.max(...cellHeights) + 10;
    
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
              .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
              .stroke("black")
              .fill();
    
          // Draw cell contents and vertical borders
          let currentX = startX;
          row.columns.forEach((col, index) => {
              doc
                  .font("Helvetica")
                  .fontSize(7)
                  .fillColor("black")
                  .text(col || "", currentX + 5, startY + 5, {
                      width: columnWidths[index] - 10,
                      baseline: "hanging",
                      align: "left",
                  });
    
              // Draw vertical lines for columns
              doc.strokeColor("black").lineWidth(0.5);
              doc
                  .moveTo(currentX + columnWidths[index], startY)
                  .lineTo(currentX + columnWidths[index], startY + rowHeight)
                  .stroke();
    
              currentX += columnWidths[index];
          });
    
          // Move to the next row
          startY += rowHeight;
      });
    
      // Ensure table border ends properly
      doc.stroke();
    }
    
    const tableDatatenv = [
    //   {
    //       configurationIndex: 0, // First row: 3 columns
    //       columns: ["9", "Annual Percentage Rate (APR) (%)", "27.88%"],
    //   },
    //   {
    //       configurationIndex: 1, // Second row: 2 columns
    //       columns: ["10", "Details of Contingent Charges (in ₹ or %, as applicable)"],
    //   },
      {
          configurationIndex: 2, // Rows 3 to 7: 3 columns
          columns: [
              "(i)",
              "Penal charges, if any, in case of delayed payment",
              "2% per month on the Outstanding Dues plus, applicable Taxes",
          ],
      },
      {
          configurationIndex: 2,
          columns: [
              "(ii)",
              "Other penal charges, if any",
              "2% per month on the Outstanding Dues plus, applicable Taxes",
          ],
      },
      {
          configurationIndex: 2,
          columns: [
              "(iii)",
              "Foreclosure charges, if applicable",
              "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
          ],
      },
      {
          configurationIndex: 2,
          columns: [
              "(iv)",
              "Charges for switching of loans from floating to fixed rate and vice versa",
              "Not Applicable",
          ],
      },
      {
          configurationIndex: 2,
          columns: [
              "(v)",
              "Any other charges (please specify)",
              "Not Applicable",
          ],
      },
    ];
    
    // Call the function with your doc object and table data
    generateFeeChargesTableFromThirdRowtenv(doc, tableDatatenv);
    doc.moveDown()
    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .text(`Part 2 (Other qualitative information)`,startX, doc.y, { align: "left"});
      doc.moveDown(0.1)
    
    function generateThreeColumnTable(doc, tableDatatab) {
      const startX = 50; // Starting X-coordinate
      let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
      const columnWidths = [61, 210, 230] // Widths for the three columns
    
      tableDatatab.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
    
          // Dynamically calculate the height of each cell's content
          const cellHeights = row.columns.map((col, index) => {
              return doc
                  .font("Helvetica")
                  .fontSize(7)
                  .heightOfString(col || "", { width: columnWidths[index] - 10 });
          });
    
          rowHeight = Math.max(...cellHeights) + 10;
    
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
              .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
              .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
              .stroke("black")
              .fill();
    
          // Draw cell contents and vertical borders
          let currentX = startX;
          row.columns.forEach((col, index) => {
              doc
                  .font("Helvetica")
                  .fontSize(7)
                  .fillColor("black")
                  .text(col || "", currentX + 5, startY + 5, {
                      width: columnWidths[index] - 10,
                      baseline: "hanging",
                      align: "left",
                  });
    
              // Draw vertical lines for columns
              doc.strokeColor("black").lineWidth(0.5);
              doc
                  .moveTo(currentX + columnWidths[index], startY)
                  .lineTo(currentX + columnWidths[index], startY + rowHeight)
                  .stroke();
    
              currentX += columnWidths[index];
          });
    
          // Move to the next row
          startY += rowHeight;
      });
    
      // Ensure table border ends properly
      doc.stroke();
    }
    
    const tableDatatab = [
    {
        columns: [
            "1", 
            "Clause of Loan agreement relating to engagement of recovery agents",
            "Annexure II – Clause 1"
        ],
    },
    {
        columns: [
            "2", 
            "Clause of Loan agreement which details grievance redressal mechanism",
            "Annexure II – Clause 2"
        ],
    },
    {
        columns: [
            "3", 
            "Phone number and email id of the nodal grievance redressal officer",
            `1. Ratnaafin Capital Private Limited
    Grievance Officer: Mr. Bhavesh Patel
    Designation: VP-Operations
    
    For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
    
    2. Fin Coopers Capital Private Limited
    Grievance Officer: Shakti Singh
    
    For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
        ],
    },
    ];
    
    generateThreeColumnTable(doc, tableDatatab);
    
    function generateDynamicTable(doc, tableDatady, columnWidths) {
    const startX = 50; // Starting X-coordinate
    let startY = doc.y + 10; // Starting Y-coordinate
    
    tableDatady.forEach((row, rowIndex) => {
      const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
      if (!Array.isArray(rowWidths)) {
          console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
          return;
      }
    
      let rowHeight = 15;
    
      // Dynamically calculate the height of each cell's content
      const cellHeights = row.map((col, index) => {
          const width = rowWidths[index] || 0; // Default to 0 if width is missing
          return doc
              .font("Helvetica")
              .fontSize(7)
              .heightOfString(col || "", { width: width - 10 });
      });
    
      // Use the maximum height for the row
      rowHeight = Math.max(...cellHeights, 15) + 10;
    
      // Draw the row background
      doc.lineWidth(0.5);
      doc
          .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
          .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
          .stroke("black")
          .fill();
    
      // Draw each cell in the row
      let currentX = startX;
      row.forEach((col, index) => {
          const width = rowWidths[index] || 0;
          doc
              .font("Helvetica")
              .fontSize(7)
              .fillColor("black")
              .text(col || "", currentX + 5, startY + 5, {
                  width: width - 10,
                  align: "left",
              });
    
          // Draw column borders
          doc.strokeColor("black").lineWidth(0.5);
          doc
              .moveTo(currentX + width, startY)
              .lineTo(currentX + width, startY + rowHeight)
              .stroke();
    
          currentX += width;
      });
    
      startY += rowHeight; // Move to the next row
    });
    
    // Draw table border
    // doc.stroke();
    }
    const tableDatady = [
    ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
    ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
    ["Name of the originating RE, along with its fund", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
    ["Fin Coopers Capital Pvt Ltd-0%", "Ratnaafin Capital Pvt Ltd-100%", `${allPerameters.interestRate}%`],
    ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
    ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
    ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
    ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
    ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
    ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
        `Fin Coopers Capital Private Limited:
    Website: https://www.fincoopers.com/
    Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
    Email ID: INFO@FINCOOPERS.COM
    Contact No.: 07314902200`]
    ];
    
    const columnWidths = [
    // [50, 245, 200], // Row 1
    // [50, 445],      // Row 2
    // [165, 165, 165],// Row 3
    // [165, 165, 165],// Row 4
    // [50, 445],      // Row 5
    // [247, 248],     // Row 6
    // [247, 248]      // Row 7
    // [50, 325, 120], // Row 1
    // [50, 445],      // Row 2
    // [165, 165, 165],// Row 3
    // [165, 165, 165],// Row 4
    // [50, 445],      // Row 5
    // [245, 250],     // Row 6
    // [245, 249],     // Row 7
    // [50, 447],      // Row 8
    // [245, 250],     // Row 9
    // [245, 250]      //
    [50, 325, 128],  // Row 1
    [50, 453],       // Row 2
    [165, 165, 173], // Row 3
    [165, 165, 173], // Row 4
    [50, 453],       // Row 5
    [245, 258],      // Row 6
    [245, 258],      // Row 7
    [50, 453],       // Row 8
    [245, 258],      // Row 9
    [245, 258]       // Row 10
    
    ];
    
    // Call the function
    generateDynamicTable(doc, tableDatady, columnWidths);
    
    
    
        
    // addFooter()
    
        // { field1: "", field2: "",field3A: "One-time/Recurring", field3B:"Amount (in ₹) or Percentage (%) as applicable",field4A: "One-time/Recurring",field4B: "One-time/Recurring", },
      
        // doc.addPage();
        // addLogo();
        // drawBorder();
        // doc.moveDown(7);
    
    //     function generateThreeColumnTable(doc, tableDatatab) {
    //       const startX = 50; // Starting X-coordinate
    //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
    //       const columnWidths = [50, 210, 230] // Widths for the three columns
      
    //       tableDatatab.forEach((row, rowIndex) => {
    //           // Set default row height
    //           let rowHeight = 15;
      
    //           // Dynamically calculate the height of each cell's content
    //           const cellHeights = row.columns.map((col, index) => {
    //               return doc
    //                   .font("Helvetica")
    //                   .fontSize(8)
    //                   .heightOfString(col || "", { width: columnWidths[index] - 10 });
    //           });
      
    //           rowHeight = Math.max(...cellHeights) + 10;
      
    //           // Alternate row background color
    //           doc.lineWidth(0.5);
    //           doc
    //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
    //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
    //               .stroke("black")
    //               .fill();
      
    //           // Draw cell contents and vertical borders
    //           let currentX = startX;
    //           row.columns.forEach((col, index) => {
    //               doc
    //                   .font("Helvetica")
    //                   .fontSize(8)
    //                   .fillColor("black")
    //                   .text(col || "", currentX + 5, startY + 5, {
    //                       width: columnWidths[index] - 10,
    //                       baseline: "hanging",
    //                       align: "left",
    //                   });
      
    //               // Draw vertical lines for columns
    //               doc.strokeColor("black").lineWidth(0.5);
    //               doc
    //                   .moveTo(currentX + columnWidths[index], startY)
    //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
    //                   .stroke();
      
    //               currentX += columnWidths[index];
    //           });
      
    //           // Move to the next row
    //           startY += rowHeight;
    //       });
      
    //       // Ensure table border ends properly
    //       doc.stroke();
    //   }
    
    //   const tableDatatab = [
    //     {
    //         columns: [
    //             "1", 
    //             "Clause of Loan agreement relating to engagement of recovery agents",
    //             "Annexure II – Clause 1"
    //         ],
    //     },
    //     {
    //         columns: [
    //             "2", 
    //             "Clause of Loan agreement which details grievance redressal mechanism",
    //             "Annexure II – Clause 2"
    //         ],
    //     },
    //     {
    //         columns: [
    //             "3", 
    //             "Phone number and email id of the nodal grievance redressal officer",
    //             `1. Ratnaafin Capital Private Limited
    // Grievance Officer: Mr. Bhavesh Patel
    // Designation: VP-Operations
    
    // For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
    
    // 2. Fin Coopers Capital Private Limited
    // Grievance Officer: Shakti Singh
    
    // For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
    //         ],
    //     },
    // ];
    
    // generateThreeColumnTable(doc, tableDatatab);
    
    // function generateDynamicTable(doc, tableDatady, columnWidths) {
    //   const startX = 50; // Starting X-coordinate
    //   let startY = doc.y + 10; // Starting Y-coordinate
    
    //   tableDatady.forEach((row, rowIndex) => {
    //       const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
    //       if (!Array.isArray(rowWidths)) {
    //           console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
    //           return;
    //       }
    
    //       let rowHeight = 15;
    
    //       // Dynamically calculate the height of each cell's content
    //       const cellHeights = row.map((col, index) => {
    //           const width = rowWidths[index] || 0; // Default to 0 if width is missing
    //           return doc
    //               .font("Helvetica")
    //               .fontSize(8)
    //               .heightOfString(col || "", { width: width - 10 });
    //       });
    
    //       // Use the maximum height for the row
    //       rowHeight = Math.max(...cellHeights, 15) + 10;
    
    //       // Draw the row background
    //       doc.lineWidth(0.5);
    //       doc
    //           .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
    //           .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
    //           .stroke("black")
    //           .fill();
    
    //       // Draw each cell in the row
    //       let currentX = startX;
    //       row.forEach((col, index) => {
    //           const width = rowWidths[index] || 0;
    //           doc
    //               .font("Helvetica")
    //               .fontSize(8)
    //               .fillColor("black")
    //               .text(col || "", currentX + 5, startY + 5, {
    //                   width: width - 10,
    //                   align: "left",
    //               });
    
    //           // Draw column borders
    //           doc.strokeColor("black").lineWidth(0.5);
    //           doc
    //               .moveTo(currentX + width, startY)
    //               .lineTo(currentX + width, startY + rowHeight)
    //               .stroke();
    
    //           currentX += width;
    //       });
    
    //       startY += rowHeight; // Move to the next row
    //   });
    
    //   // Draw table border
    //   doc.stroke();
    // }
    
    
    
    // const tableDatady = [
    //   ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
    //     ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
    //     ["Name of the originating RE, along with its function", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
    //     ["Fin Coopers Capital Pvt Ltd-0%", "Ratna Fin Capital Pvt Ltd-100%", "25%"],
    //     ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
    //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
    //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
    //     ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
    //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
    //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
    //         `Fin Coopers Capital Private Limited:
    // Website: https://www.fincoopers.com/
    // Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
    // Email ID: INFO@FINCOOPERS.COM
    // Contact No.: 07314902200`]
    // ];
    
    // const columnWidths = [
    //   // [50, 245, 200], // Row 1
    //   // [50, 445],      // Row 2
    //   // [165, 165, 165],// Row 3
    //   // [165, 165, 165],// Row 4
    //   // [50, 445],      // Row 5
    //   // [247, 248],     // Row 6
    //   // [247, 248]      // Row 7
    //   [50, 325, 120], // Row 1
    //     [50, 445],      // Row 2
    //     [165, 165, 165],// Row 3
    //     [165, 165, 165],// Row 4
    //     [50, 445],      // Row 5
    //     [245, 247],     // Row 6
    //     [245, 247],     // Row 7
    //     [50, 447],      // Row 8
    //     [245, 247],     // Row 9
    //     [245, 247]      //
    // ];
    
    // // Call the function
    // generateDynamicTable(doc, tableDatady, columnWidths);
    
    
      
    ////    addFooter()
        // Finalize the PDF
       
       
        function drawTableForAmotization(tableData,loanDataForTable) {
          // Some layout constants
          const PAGE_HEIGHT = doc.page.height;
          const PAGE_BOTTOM_MARGIN = doc.page.margins.bottom;
          const rowHeight = 20;
        
          // Starting X/Y positions
          let startX = 50;
          // doc.y is wherever the PDF "cursor" currently is. We'll add 10 for spacing.
          let startY = doc.y + 10;
        
          // Column widths (6 columns total):
          // Adjust these numbers as needed to fit your layout
          const columnWidths = [50, 90, 80, 90, 80, 90];
        
          // Thinner stroke for borders
          doc.lineWidth(0.2);
        
          //-----------
          // 1) FUNCTION: Draw the big "Repayment Schedule" title bar
          //-----------
          function drawScheduleTitle() {
            // This "title bar" spans across all 6 columns
            const totalTableWidth = columnWidths.reduce((acc, w) => acc + w, 0);
        
            // Draw the filled rectangle for the title
            doc
              .rect(startX, startY, totalTableWidth, rowHeight)
              .fillAndStroke('#00bfff', '#000000');
        
            // Write the title text
            doc
              .font(fontBold)
              .fillColor('black')
              .fontSize(9.5)
              .text(
                'Repayment Schedule',
                startX + 5,
                startY + 5,
                {
                  baseline: 'hanging',
                  // If you want to truly center across the entire width:
                  // width: totalTableWidth,
                  align: 'center'
                }
              );
              startY += rowHeight + 15
              loanDataForTable.forEach((row) => {
                // Before drawing each row, check for possible page overflow
            
                // Current X resets for each row
                let currentX = startX;
            
                // Choose row fill color (e.g., always white, or alternate, etc.)
                const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
            
                // Column 1: Month
                doc.fillColor(rowFillColor)
                  .rect(currentX, startY, 100, rowHeight)
                  .stroke()
                  .fill();
                doc.font(font)
                  .fontSize(8)
                  .fillColor('black')
                  .text(String(row.field), currentX + 5, startY + 5, { baseline: 'hanging',width:100, align:"left" });
                currentX += 100;
            
                // Column 2: Opening Principal
                doc.fillColor(rowFillColor)
                  .rect(currentX, startY, 100, rowHeight)
                  .stroke()
                  .fill();
                doc.font(font)
                  .fontSize(8)
                  .fillColor('black')
                  .text(String(row.value), currentX + 5, startY + 5, { baseline: 'hanging',width:90, align:"right" });
                currentX += 100;
        
                // Move down to the next row
                startY += rowHeight;
              });
        
            // Move Y down by rowHeight
            startY += rowHeight;
          }
        
          //-----------
          // 2) FUNCTION: Draw the header row with column names
          //-----------
          function drawHeaderRow() {
            // 6 columns:
            // 1) month
            // 2) openingPrincipal
            // 3) monthlyPayment
            // 4) principalPayment
            // 5) interestPayment
            // 6) remainingBalance
        
            const headers = [
              'Month',
              'Opening Principal',
              'Monthly Payment',
              'Principal Payment',
              'Interest Payment',
              'Remaining Balance'
            ];
        
            let currentX = startX;
        
            for (let i = 0; i < headers.length; i++) {
              doc
                .rect(currentX, startY, columnWidths[i], rowHeight)
                .fillAndStroke('#66ee79', '#000000')
                .fill();
        
              doc
                .font(fontBold)
                .fontSize(9)
                .fillColor('black')
                .text(headers[i], currentX + 5, startY + 5, { baseline: 'hanging' });
        
              currentX += columnWidths[i];
            }
        
            // Move Y down by rowHeight
            startY += rowHeight;
          }
        
          //-----------
          // 3) FUNCTION: Check for page overflow & insert new page if needed
          //-----------
          function checkPageOverflow() {
            // If adding another row will go beyond the page bottom, do a page break:
            if (startY + rowHeight > PAGE_HEIGHT - PAGE_BOTTOM_MARGIN) {
              // Add a new page
              doc.addPage();
        
              // Your custom functions:
              addLogo();
              drawBorder();
        
              // Move down a bit after the border
              doc.moveDown(5);
        
              // Reset startY to current doc.y (top of the new page)
              startX = 50
              startY = doc.y + 10;
              doc.lineWidth(0.2);
      
        
              // Re-draw the table title and header row on the new page
              drawHeaderRow();
            }
          }
        
          //-----------
          // 4) START: Actually draw the table now
          //-----------
        
          // Draw the main "Repayment Schedule" title bar first
          drawScheduleTitle();
        
          // Then draw the header row (column titles)
          drawHeaderRow();
        
      
          // Now loop over your table data rows
          tableData.forEach((row) => {
            // Before drawing each row, check for possible page overflow
            checkPageOverflow();
        
            // Current X resets for each row
            let currentX = startX;
        
            // Choose row fill color (e.g., always white, or alternate, etc.)
            const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
        
            // Column 1: Month
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[0], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.month), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[0];
        
            // Column 2: Opening Principal
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[1], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.openingPrincipal), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[1];
        
            // Column 3: Monthly Payment
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[2], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.monthlyPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[2];
        
            // Column 4: Principal Payment
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[3], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.principalPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[3];
        
            // Column 5: Interest Payment
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[4], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.interestPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[4];
        
            // Column 6: Remaining Balance
            doc.fillColor(rowFillColor)
              .rect(currentX, startY, columnWidths[5], rowHeight)
              .stroke()
              .fill();
            doc.font(font)
              .fontSize(8)
              .fillColor('black')
              .text(String(row.remainingBalance), currentX + 5, startY + 5, { baseline: 'hanging' });
            currentX += columnWidths[5];
        
            // Move down to the next row
            startY += rowHeight;
          });
          
          // Optionally, continue adding content after the table ...
        }
        
      
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(5);
       
        const loanTableData1 = calculateLoanAmortization(
          allPerameters.loanAmount,
          allPerameters.tenureinMonths,
          allPerameters.interestRate,
          "2025-01-01"
        );
        let loanDataForTable = [{
          field:"Loan Amount (Rs.)",
          value: allPerameters.loanAmount
        },
        {
          field:"Loan Tenure (Month)",
          value: allPerameters.tenureinMonths
        },
        {
          field:"ROI (%)",
          value: allPerameters.interestRate
        },
        {
          field:"EMI (Rs.)",
          value: allPerameters.emiAmount
        }]
    
        console.log(allPerameters)
        drawTableForAmotization(loanTableData1,loanDataForTable);
    
    
        doc.addPage();
        addLogo();
        drawBorder();
        doc.moveDown(5);
    
      //   function DRAWTABLE123(tableTitle, tableData) {
      //     const startX = 50;
      //     let startY = doc.y + 10;
      //     const columnWidths = [500];
      //     const indexWidth = 30;
      //     const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
      //     const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
      
      //     // Draw table title with a colored header
      //     doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
      //     doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
      //         .text(tableTitle, startX + 5, startY + 5, { align: 'center' });
      
      //     startY += 20; // Move down for the first row
      
      //     let sectionIndex = null; // Track the section index to span the column
      
      //     // Render each row in the table
      //     tableData.forEach((row, rowIndex) => {
      //         // Apply custom style for row 1 (title2)
              
      
      //         // Measure text height for row.field1 and row.value1
      //         const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
      //         const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
      
      //         // Calculate row height based on the tallest content
      //         const rowHeight = Math.max(20, field1Height, value1Height) + 10; // Adding padding for better spacing
      
      //         // Only display the index once per section, in the first row
      //         const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
      //         if (row.index) {
      //             sectionIndex = row.index; // Set current section index
      //         }
      
      //         // Draw the index in the first column (only for the first row of each section)
      //         doc.fillColor('#ffffff')
      //             .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Stroke color set to black
      //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
      //             .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
      
      //         // Draw the key in the second column
      //         doc.fillColor('#f5f5f5')
      //             .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
      //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
      //             .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
      
      //         // Draw the value in the third column
      //         doc.fillColor('#ffffff')
      //             .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
      //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
      //             .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
      
      //         // Move startY down by rowHeight for the next row
      //         startY += rowHeight;
      //     });
      // }
      
    
      function DRAWTABLE123(tableTitle, tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500];
        const indexWidth = 30;
        const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
        const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
      
        // Draw table title with a colored header
        doc.lineWidth(0.5); // Set a thin border for the table
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
            doc.font('Helvetica').fillColor('black').fontSize(7.2)
                .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
      
            // Draw the key in the second column
            doc.fillColor('#f5f5f5')
                .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
            doc.font('Helvetica').fillColor('black').fontSize(7.2)
                .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
      
            // Draw the value in the third column
            doc.fillColor('#ffffff')
                .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
            doc.font('Helvetica').fillColor('black').fontSize(7.2)
                .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
      
            // Move startY down by rowHeight for the next row
            startY += rowHeight;
        });
      }
      
     
    
    
    
      const scheduleOfCharges = [
        { index: "sr.No", field1: "Particulars of Charges", value1: "Charge Details" },
    
        { index: "1", field1: "Repayment Instruction / Instrument Return Charges / PDC / ECS / NACH Bounce Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
        { index: "2", field1: "Repayment Mode Swap Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
        { index: "3", field1: "Penal Charges", value1: "- 2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan installments\n- 2% per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter" },
        { index: "4", field1: "Duplicate Statement Issuance Charges (SOA / RPS)", value1: "Free once in a Financial Year. Rs.250/- (Plus GST as applicable)" },
        { index: "5", field1: "Cheque / NACH Representation Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
        { index: "6", field1: "Duplicate Amortization Schedule Issuance Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
        { index: "7", field1: "Document Retrieval Charges", value1: "Rs.500/- Per Instance per set (Plus GST as applicable)" },
        { index: "8", field1: "Charges for Subsequent Set of Photocopy of Loan Agreement/Documents Were Requested by Borrower", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
        { index: "9", field1: "Stamp Duty Charges", value1: "As applicable in the state stamp act" },
        { index: "10", field1: "Prepayment Charges", value1: "No prepayment allowed till completion of 12 months from the date of 1st disbursement. After completion of 12 months from the date of 1st disbursement, prepayment from personal funds may be made without incurring any fees. In case of balance transfer, 4% charges will be applicable." },
        { index: "11", field1: "Foreclosure Charges", value1: "In case of foreclosure of Loan from Owned Funds, no Foreclosure Charges will be applicable. In case of balance transfer, 4% of the Outstanding Principal Amount will be applicable." },
        { index: "12", field1: "Administrative Charges / Processing Fees & Other Charges", value1: "Nil" },
        { index: "13", field1: "Charges for Duplicate NOC / No Due Certificate", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
        { index: "14", field1: "Charges for Revalidation NOC", value1: "Rs. 250/- Per Instance per set (Plus GST as applicable)" },
        { index: "15", field1: "Cersai Charge", value1: "- When facility amount is equal to Rs. 5 Lacs or lesser, Rs. 50 plus GST\n- When facility amount is greater than Rs.5 Lacs, Rs. 100 plus GST" },
        { index: "16", field1: "Login Fees", value1: "Rs.1950/- (Inclusive of all Applicable Taxes)" },
        { index: "17", field1: "Processing Fees", value1: "2% of loan amount + Applicable taxes" },
        { index: "18", field1: "Documentation Charges", value1: "2% of loan amount + Applicable taxes (For under construction cases 3% of loan amount + Applicable taxes)" },
        { index: "19", field1: "Issuance of Duplicate Income Tax Certificate", value1: "NIL" },
        { index: "20", field1: "Legal / Collections / Vehicle Storage / Repossession and Incidental Charges", value1: "As per Actuals" }
      ];
    
      DRAWTABLE123("Schedule of Charges (MITC)", scheduleOfCharges);
    
    
    
        doc.end();
      
    
        // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
        // doc.pipe(fs.createWriteStream(pdfPath));
        
      //   const objData = {
      //     fileName: pdfFileUrl,
      //     // file: doc.toString('base64')
      //  }
      //   await initESign(objData)
      
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

      async function ratannaFinSanctionLetterPdf3(allPerameters) {

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
          // doc.moveDown(-5)
          if (fs.existsSync(pdfLogo)) {
            doc.image(pdfLogo, 400, 9, {
              fit: [160, 140],
              align: "right",
              valign: "bottom",
            });
          } else {
            console.error(`Logo file not found at: ${pdfLogo}`);
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
      
        // if (!fs.existsSync(outputDir)) {
        //   fs.mkdirSync(outputDir, { recursive: true });
        // }
      
        const timestamp = Date.now();
        // const pdfFilename = `ratnafinSanctionLatter.pdf`;
        // const pdfPath = path.join(outputDir, pdfFilename);
      
        // const doc = new PDFDocument({ margin: 50, size: "A4" });
        // const stream = fs.createWriteStream(pdfPath);
      
        // doc.pipe(stream);
      
        // Add logo and border to the first page
        addLogo();
        drawBorder();
        doc.moveDown(5);
        
          doc
          .fontSize(9)
          .font(fontBold)
          .text("PRIVATE AND CONFIDENTIAL", { align: "center", underline: true });
        doc.moveDown(2);
      
        const startX = 50; // Set a left margin
        const startY = doc.y; // Get the current Y position
        doc
          .fontSize(7)
          .font('Helvetica')
          .text(`Sanction Letter No.:-${allPerameters.pENDENCYlOANnumber}`, startX, doc.y, { align: "left", x: 50 }) // Adjusting x to align left
          .text(`Date: ${allPerameters.sanctionpendencyDate}`, { align: "right", x: 450 })
          .moveDown(1);
        
        doc
          .font(fontBold)
          .fontSize(8)
          .text(`CUSTOMER NAME:${allPerameters.customerName}`, startX, doc.y, { align: "left", x: 50 })
          .moveDown(1);
        
        doc
          .font("Helvetica")
          .fontSize(8)
          .text(`address:${allPerameters.address}`,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1);
        
        doc
          .font(fontBold)
          .fontSize(8)
          .text(`K/A: ${allPerameters.loanBorrowerName},${allPerameters.loanCoborrowerName}`,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1);
        
        doc
          .font('Helvetica')
          .fontSize(8)
          .text(`(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\nWith reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\nYour loan account details and the loan repayment schedule are attached herewith for your reference.`, { align: "left", x: 50 })
          .moveDown(1);
        
        // Define table drawing function with left alignment adjustments
        // function drawTable(tableData) {
        //     const startX = 50; // Adjusting startX for left alignment
        //     let startY = doc.y + 10;
        //     const columnWidths = [500];
          
        //     const keyWidth = Math.round((columnWidths[0] * 1) / 2);
        //     const valueWidth = Math.round((columnWidths[0] * 1) / 2);
          
        //     tableData.forEach((row, rowIndex) => {
        //         let rowHeight = 15;
        
        //         const field1TextHeight = doc
        //             .font(font)
        //             .fontSize(7.2)
        //             .heightOfString(row.field1, { width: keyWidth });
                
        //         let value1TextHeight = 0;
        //         if (row.value1) {
        //             value1TextHeight = doc
        //                 .font(font)
        //                 .fontSize(7.2)
        //                 .heightOfString(row.value1, { width: valueWidth });
        //         }
        
        //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
        //         if (!row.value1) {
        //             doc
        //                 .fillColor("blue")
        //                 .rect(startX, startY, columnWidths[0], rowHeight)
        //                 .stroke("black")
        //                 .fill();
        
        //             doc
        //                 .font(font)
        //                 .fillColor("black")
        //                 .fontSize(7.2)
        //                 .text(row.field1, startX + 5, startY + 5, {
        //                     baseline: "hanging",
        //                     width: columnWidths[0],
        //                 });
        //         } else {
        //             doc.lineWidth(0.5);
        //             doc
        //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //                 .rect(startX, startY, keyWidth, rowHeight)
        //                 .stroke("black")
        //                 .fill();
        
        //             doc
        //                 .font(font)
        //                 .fillColor("black")
        //                 .fontSize(7.2)
        //                 .text(row.field1, startX + 5, startY + 5, {
        //                     baseline: "hanging",
        //                     width: keyWidth,
        //                 });
        
        //             doc
        //                 .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //                 .rect(startX + keyWidth, startY, valueWidth, rowHeight)
        //                 .stroke()
        //                 .fill();
        
        //             doc
        //                 .font(font)
        //                 .fillColor("black")
        //                 .fontSize(7.2)
        //                 .text(row.value1, startX + keyWidth + 5, startY + 5, {
        //                     baseline: "hanging",
        //                     width: valueWidth,
        //                 });
        //         }
        //         startY += rowHeight;
        //     });
        // }
        function drawTable(tableData) {
          const startX = 50; // Adjusting startX for left alignment
          let startY = doc.y + 10;
          const columnWidths = [500];
        
          const keyWidth = Math.round((columnWidths[0] * 1) / 2);
          const valueWidth = Math.round((columnWidths[0] * 1) / 2);
        
          tableData.forEach((row, rowIndex) => {
            let rowHeight = 15;
        
            // Calculate text height for dynamic row size
            const field1TextHeight = doc
              .font(font)
              .fontSize(7.2)
              .heightOfString(row.field1, { width: keyWidth });
        
            let value1TextHeight = 0;
            if (row.value1) {
              value1TextHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(row.value1, { width: valueWidth });
            }
        
            rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
            // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
            const isSpecialRow =
              row.field1.toUpperCase() === "CHARGES" ||
              row.field1.toUpperCase() === "NEW LOAN DETAILS";
        
            // Row background and border for special rows
            if (isSpecialRow) {
              doc
                .fillColor("#00BFFF") // Background color
                .rect(startX, startY, columnWidths[0], rowHeight)
                .fill()
                .stroke("black", 0.5); // Thin border
        
              doc
                .font(font)
                .fillColor("black") // Text color
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: columnWidths[0],
                });
            } else {
              // Normal rows
              doc.lineWidth(0.5); // Thin border for regular rows
        
              // Key Column
              doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();
        
              doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 5, {
                  baseline: "hanging",
                  width: keyWidth,
                });
        
              // Value Column
              doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();
        
              doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.value1, startX + keyWidth + 5, startY + 5, {
                  baseline: "hanging",
                  width: valueWidth,
                });
            }
        
            // Move to the next row
            startY += rowHeight;
          });
        }
        
            
          const loanTableData = [
            { field1: "NEW LOAN DETAILS" },
            { field1: "Customer ID", value1: `${allPerameters.customerID}` },
            { field1: "Loan Borrower name", value1: `${allPerameters.loanBorrowerName}` },
            { field1: "Loan Co-borrower name", value1: `${allPerameters.loanCoborrowerName}` },
            // { field1: "Loan Co-borrower name-2", value1: `${allPerameters.loanCoborrowerNameTwo}` },
            // { field1: "Loan Guarantor name", value1: `${allPerameters.loanGuarantorName}` },
            { field1: "Product", value1: `${allPerameters.product}` },
            { field1: "Loan Amount", value1: `${allPerameters.loanAmount}/-${allPerameters.loanAmountinwords}` },
            { field1: "Description of Collateral Property", value1: `As per Annexure I
      ` },
            // { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
            {
              field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}`,
            },
            {
              field1: "Purpose of Loan ", value1: `${allPerameters.PURPOSEoFlOAN}`,
            },
            {
              field1: "Tenure", value1: `${allPerameters.tenureinMonths} months`,
            },
            {
              field1: "Interest Rate",
              value1: `${allPerameters.interestRate} %`,
            },
            {
              field1: "Interest Type",
              value1:
                `Linked to Floating Reference Rate (FRR – 19.20% + ${allPerameters.interestType}%)`,
            },
            {
              field1: "EMI Amount",
              value1:
                `Rs ${allPerameters.emiAmount} for a period of ${allPerameters.tenureinMonths} months`,
            },
            { field1: "Penal charges", value1: `${allPerameters.penalCharges}` },
            {
              field1:"Prepayment Charges",
              value1: `No prepayment allowed till completion of 12 months from the date of 1st\n disbursement. After completion of 12 months from the date of 1st disburseme\n-nt, prepayment from personal funds may be made without incurring any fees.\n In case of balance transfer, 4% charges will be applicable.`,
            },
            { field1: "DSRA", value1: `${allPerameters.DSRA}` },
            {
              field1: "EMI Payment Bank ",
              value1:
               `${allPerameters.emiPaymentBank}`,
            },
            { field1: "EMI Payment Bank A/c Number", value1: `${allPerameters.emiaccNumber}` },
            {
              field1: "Mode of Payment ",
              value1:
                `${allPerameters.modeOfPayment}`,
            },
           
          ];
          drawTable(loanTableData);
          // addFooter()
      
          //-------------------------------------- new page 2-------------------------------------------------------
        
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(5);
          // function drawTable1(tableData) {
          //   const startX = 50; // Adjusting startX for left alignment
          //   let startY = doc.y + 10;
          //   const columnWidths = [500];
          
          //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
          //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
          
          //   tableData.forEach((row, rowIndex) => {
          //     let rowHeight = 15;
          
          //     // Calculate text height for dynamic row size
          //     const field1TextHeight = doc
          //       .font(font)
          //       .fontSize(7.2)
          //       .heightOfString(row.field1, { width: keyWidth });
          
          //     let value1TextHeight = 0;
          //     if (row.value1) {
          //       value1TextHeight = doc
          //         .font(font)
          //         .fontSize(7.2)
          //         .heightOfString(row.value1, { width: valueWidth });
          //     }
          
          //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
          
          //     // Check if field1 matches "CHARGES" or "NEW LOAN DETAILS"
          //     const isSpecialRow =
          //       row.field1.toUpperCase() === "CHARGES" ||
          //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
          
          //     // Row background and border for special rows
          //     if (isSpecialRow) {
          //       doc
          //         .fillColor("#00BFFF") // Background color
          //         .rect(startX, startY, columnWidths[0], rowHeight)
          //         .fill()
          //         .stroke("black", 0.5); // Thin border
          
          //       doc
          //         .font(font)
          //         .fillColor("black") // Text color
          //         .fontSize(7.2)
          //         .text(row.field1, startX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: columnWidths[0],
          //         });
          //     } else {
          //       // Normal rows
          //       doc.lineWidth(0.5); // Thin border for regular rows
          
          //       // Key Column
          //       doc
          //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          //         .rect(startX, startY, keyWidth, rowHeight)
          //         .stroke("black")
          //         .fill();
          
          //       doc
          //         .font(font)
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(row.field1, startX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: keyWidth,
          //         });
          
          //       // Value Column
          //       doc
          //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
          //         .stroke("black")
          //         .fill();
          
          //       doc
          //         .font(font)
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: valueWidth,
          //         });
          //     }
          
          //     // Move to the next row
          //     startY += rowHeight;
          //   });
          // }
      
          function drawTable1(tableData) {
            const startX = 50; // Adjusting startX for left alignment
            let startY = doc.y + 10;
            const columnWidths = [500]; // Full table width
          
            const keyWidth = Math.round((columnWidths[0] * 1) / 2);
            const valueWidth = Math.round((columnWidths[0] * 1) / 2);
          
            tableData.forEach((row, rowIndex) => {
              let rowHeight = 15;
          
              // Calculate text height for dynamic row size
              const field1TextHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(row.field1, { width: keyWidth });
          
              let value1TextHeight = 0;
              if (row.value1) {
                value1TextHeight = doc
                  .font(font)
                  .fontSize(7.2)
                  .heightOfString(row.value1, { width: valueWidth });
              }
          
              rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
          
              // Check if the row is "CHARGES"
              const isChargesRow = row.field1.toUpperCase() === "CHARGES";
          
              // Check if the row is "ADDITIONAL FINANCIAL PRODUCTS"
              const isAdditionalProductsRow =
                row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
          
              if (isChargesRow) {
                // "CHARGES" row with blue background and thin border
                doc
                  .fillColor("#00BFFF") // Blue background
                  .rect(startX, startY, columnWidths[0], rowHeight)
                  .fill()
                  .stroke("black", 0.5); // Thin black border
          
                doc
                  .font(font)
                  .fillColor("black") // Text color
                  .fontSize(8.5) // Slightly larger font for bold rows
                  .font("Helvetica-Bold") // Bold font
                  .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: columnWidths[0],
                    align: "left",
                  });
              } else if (isAdditionalProductsRow) {
                // "ADDITIONAL FINANCIAL PRODUCTS" row with no background, bold font, and border
                doc
                  .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
                  .stroke("black");
          
                doc
                  .font(font)
                  .fillColor("black") // Text color
                  .fontSize(8.5) // Slightly larger font for bold rows
                  .font("Helvetica-Bold") // Bold font
                  .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: columnWidths[0],
                    align: "left",
                  });
              } else {
                // Normal rows with two columns
                doc.lineWidth(0.5); // Thin border for regular rows
          
                // Key Column
                doc
                  .rect(startX, startY, keyWidth, rowHeight)
                  .stroke("black"); // Border for key column
          
                doc
                  .font(font)
                  .fontSize(7.2)
                  .text(row.field1, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: keyWidth,
                  });
          
                // Value Column
                doc
                  .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                  .stroke("black"); // Border for value column
          
                doc
                  .font(font)
                  .fontSize(7.2)
                  .text(row.value1, startX + keyWidth + 5, startY + 5, {
                    baseline: "hanging",
                    width: valueWidth,
                  });
              }
          
              // Move to the next row
              startY += rowHeight;
            });
          }
          
      
          // function drawTable1(tableData) {
          //   const startX = 50; // Adjusting startX for left alignment
          //   let startY = doc.y + 10;
          //   const columnWidths = [500]; // Full table width
          
          //   const keyWidth = Math.round((columnWidths[0] * 1) / 2);
          //   const valueWidth = Math.round((columnWidths[0] * 1) / 2);
          
          //   tableData.forEach((row, rowIndex) => {
          //     let rowHeight = 15;
          
          //     // Calculate text height for dynamic row size
          //     const field1TextHeight = doc
          //       .font(font)
          //       .fontSize(7.2)
          //       .heightOfString(row.field1, { width: keyWidth });
          
          //     let value1TextHeight = 0;
          //     if (row.value1) {
          //       value1TextHeight = doc
          //         .font(font)
          //         .fontSize(7.2)
          //         .heightOfString(row.value1, { width: valueWidth });
          //     }
          
          //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
          
          //     // Check for "CHARGES" or "NEW LOAN DETAILS" row
          //     const isSpecialRow =
          //       row.field1.toUpperCase() === "CHARGES" ||
          //       row.field1.toUpperCase() === "NEW LOAN DETAILS";
          
          //     // Check for "ADDITIONAL FINANCIAL PRODUCTS" row
          //     const isAdditionalProductsRow =
          //       row.field1.toUpperCase() === "ADDITIONAL FINANCIAL PRODUCTS";
          
          //     if (isSpecialRow || isAdditionalProductsRow) {
          //       // Special rows with a bold title
          //       doc
          //         .rect(startX, startY, columnWidths[0], rowHeight) // Border for title row
          //         .stroke("black");
          
          //       doc
          //         .font(font)
          //         .fontSize(8.5) // Slightly larger font for bold rows
          //         .font("Helvetica-Bold") // Bold font for special rows
          //         .text(row.field1, startX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: columnWidths[0],
          //           align: "left", // Align text to the left
          //         });
          //     } else {
          //       // Normal rows with two columns
          //       doc.lineWidth(0.5); // Thin border for regular rows
          
          //       // Key Column
          //       doc
          //         .rect(startX, startY, keyWidth, rowHeight)
          //         .stroke("black"); // Border for key column
          
          //       doc
          //         .font(font)
          //         .fontSize(7.2)
          //         .text(row.field1, startX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: keyWidth,
          //         });
          
          //       // Value Column
          //       doc
          //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
          //         .stroke("black"); // Border for value column
          
          //       doc
          //         .font(font)
          //         .fontSize(7.2)
          //         .text(row.value1, startX + keyWidth + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: valueWidth,
          //         });
          //     }
          
          //     // Move to the next row
          //     startY += rowHeight;
          //   });
          // }
          
          
      
          const loanSecondTable = [
            {
              field1: "CHARGES" },
            {
              field1:
                "Login Fees",
              value1:
                `${allPerameters.loginFees}`,
            },
            {
              field1:
                "Non-refundable Processing Fee",
              value1:
               `${allPerameters.nonRefundableProcessingFee}`,
            },
            {
              field1:
                "Documentation Charges",  value1:`${allPerameters.documentationCharges}`,
            },
            {
              field1:
                "Stamp duty charges",
              value1:
                `${allPerameters.stampDutyCharges}`,
            },
            {
              field1:
                "ADDITIONAL FINANCIAL PRODUCTS",
            },
            {
              field1:
                "Life Insurance Premium for Individual **",
                value1:
               `${allPerameters.lifeInsurancePremiumForIndividual}`,
            },
            {
              field1:
                "Insurance Premium for Collateral Security",
                value1:
                `${allPerameters.insurancePremiumForCollateralSecurity}`,
            },
          ]
          drawTable1(loanSecondTable);
      
          doc.moveDown(3);
      
          doc
          .font('Helvetica')
          .fontSize(8)
          .text(`[The net disbursal amount credited to your account = Loan amount – Charges and fees (additional financial products mentioned above).]\n\n *Broken period interest is charged on the loan amount from the date of disbursement to the date of EMI commencement.\n\n **Any pre-existing disease/ailments/surgeries undergone in the past need to be declared at the time of insurance acceptance otherwise the insurance claim will be repudiated.\n\nDSRA taken at the time of disbursement cannot be adjusted to POS for foreclosure. \n\nFor Disbursement done on or before the 10th of month, EMI Start date would be 10th of the following month.\n\n However, for all the Disbursements happening after 10th of the Particular Month will have EMI Start date as 10th of the month next to the following month.`,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1.5);
      
          doc
          .font('Helvetica')
          .fontSize(8)
          .text(`Lock In period: The Borrower shall not repay/prepay/foreclose any portion of the outstanding loan amount either in part or in full till the completion of 12 months of loan tenure from the 1st date of disbursement.
            
          The Lender may in its sole discretion Prospecvely increase / decrease / change the spread suitably in the event of unforeseen or
           exceponal or  exceptional changes in the money market condition taking place or occurrence of an increase cost situation.
      
      All payments to be made by the Borrower to the Lender shall be made free and clear of and without any deduction for on account of any
      taxes. If the Borrower is required to make such deduction, then, in such case, the sum payable to the Lender shall be increased to the
      extent necessary to ensure that, aer making such deduction, the Lender receives a sum equal to the sum which it would have received had
      such deduction not been made or required to be made. The Borrower shall submit the relevant tax deduction to the taxing authorities and 
      deliver to the Lender evidence reasonably satisfactory to the Lender that the tax deduction has been made (as applicable) and appropriate
      payment is paid to the relevant taxing authorities and the Lender shall there after repay such applicable tax amount to the Borrower.
      `,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1.5);
      
          doc
          .font('Helvetica')
          .fontSize(8)
          .text(`Advance Notice of 30 working days is Must before any prepayment/Part payment post lock in period\n\n Validity of Sanction letter is up to 3 months from the date of sanction.`,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1.5);
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`Email Address & Contact Nos to be used for customer service / for assistance required post disbursement: pna.ops@ratnaafin.com, (M) +91 9512011220`,startX, doc.y, { align: "left", x: 50 })
          .moveDown(1);
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`Special Terms & Conditions: Pre-disbursement Conditions`,startX, doc.y, { align: "center", x: 50 })
          .moveDown(1);
      
      
        //   function latterTableFunction(tableData) {
        //     // Add Table Header
        //     const startX = 50;
        //     let startY = doc.y + 10;
        //     const totalWidth = 500; // Total column width
        //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
        //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
        
        //     tableData.forEach((row, rowIndex) => {
        //         // Set default row height
        //         let rowHeight = 15;
        
        //         // Calculate the height of the text for field1 with word wrapping
        //         const field1TextHeight = doc
        //             .font(font)
        //             .fontSize(7.2)
        //             .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
        
        //         // Calculate the height of the text for value1 with word wrapping if it exists
        //         let value1TextHeight = 0;
        //         if (row.value1) {
        //             value1TextHeight = doc
        //                 .font(font)
        //                 .fontSize(7.2)
        //                 .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
        //         }
        
        //         // Determine the maximum height between field1 and value1 to set row height
        //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
        
        //         // Alternate row background color
        //         doc.lineWidth(0.5);
        //         doc
        //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //             .rect(startX, startY, keyWidth, rowHeight)
        //             .stroke("black")
        //             .fill();
        
        //         // Draw text in field1 cell with word wrapping
        //         doc
        //             .font(font)
        //             .fillColor("black")
        //             .fontSize(7.2)
        //             .text(row.field1, startX + 5, startY + 5, {
        //                 baseline: "hanging",
        //                 width: keyWidth,
        //                 height: rowHeight - 10, // Adjust the height so the text stays inside
        //                 align: "left",
        //                 wordBreak: 'break-word'  // Enable word wrapping for field1
        //             });
        
        //         // Draw the second column, even if value1 is absent
        //         doc
        //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
        //             .stroke()
        //             .fill();
        
        //         // Draw the `value1` text with word wrapping if present
        //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
        //         doc
        //             .font(font)
        //             .fillColor("black")
        //             .fontSize(7.2)
        //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
        //                 baseline: "hanging",
        //                 width: valueWidth,
        //                 height: rowHeight - 10, // Adjust the height so the text stays inside
        //                 align: "left",
        //                 wordBreak: 'break-word'  // Enable word wrapping for value1
        //             });
        
        //         // Draw vertical line between the columns
        //         doc.lineWidth(0.5);
        //         doc.strokeColor("black");
        //         doc.moveTo(startX + keyWidth, startY);
        //         doc.lineTo(startX + keyWidth, startY + rowHeight);
        //         doc.stroke();
        
        //         // Move to the next row position
        //         startY += rowHeight;
        //     });
        // }
      
        function latterTableFunction(tableData) { 
          // Add Table Header
          const startX = 50;
          let startY = doc.y + 10;
          const totalWidth = 500; // Total column width
          const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
          const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      
          tableData.forEach((row, rowIndex) => {
              // Set default row height
              let rowHeight = 15;
      
              // Calculate the height of the text for field1 with word wrapping
              const field1TextHeight = doc
                  .font(font)
                  .fontSize(7.2)
                  .heightOfString(row.field1, { width: keyWidth, wordBreak: 'break-word' });
      
              // Calculate the height of the text for value1 with word wrapping if it exists
              let value1TextHeight = 0;
              if (row.value1) {
                  value1TextHeight = doc
                      .font(font)
                      .fontSize(7.2)
                      .heightOfString(row.value1, { width: valueWidth, wordBreak: 'break-word' });
              }
      
              // Determine the maximum height between field1 and value1 to set row height
              rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
              // Check if field1 contains "S. No" (case-insensitive)
              const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
      
              // Apply special row styling
              if (isSpecialRow) {
                  doc
                      .fillColor("#00BFFF") // Background color for "S. No" rows
                      .rect(startX, startY, totalWidth, rowHeight)
                      .fill()
                      .stroke("black", 0.5); // Thin border
      
                  // Draw text in field1 cell with special styling
                  doc
                      .font(font)
                      .fillColor("black")
                      .fontSize(7.2)
                      .text(row.field1, startX + 5, startY + 5, {
                          baseline: "hanging",
                          width: keyWidth,
                          height: rowHeight - 10, // Adjust the height so the text stays inside
                          align: "left",
                          wordBreak: 'break-word' // Enable word wrapping for field1
                      });
      
                  const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
                  doc
                      .font(font)
                      .fillColor("black")
                      .fontSize(7.2)
                      .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                          baseline: "hanging",
                          width: valueWidth,
                          height: rowHeight - 10, // Adjust the height so the text stays inside
                          align: "left",
                          wordBreak: 'break-word' // Enable word wrapping for value1
                      });
              } else {
                  // Alternate row background color for non-"S. No" rows
                  doc.lineWidth(0.5);
                  doc
                      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                      .rect(startX, startY, keyWidth, rowHeight)
                      .stroke("black")
                      .fill();
      
                  // Draw text in field1 cell
                  doc
                      .font(font)
                      .fillColor("black")
                      .fontSize(7.2)
                      .text(row.field1, startX + 5, startY + 5, {
                          baseline: "hanging",
                          width: keyWidth,
                          height: rowHeight - 10, // Adjust the height so the text stays inside
                          align: "left",
                          wordBreak: 'break-word' // Enable word wrapping for field1
                      });
      
                  // Draw the second column, even if value1 is absent
                  doc
                      .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                      .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                      .stroke("black")
                      .fill();
      
                  // Draw text in value1 cell
                  const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
                  doc
                      .font(font)
                      .fillColor("black")
                      .fontSize(7.2)
                      .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                          baseline: "hanging",
                          width: valueWidth,
                          height: rowHeight - 10, // Adjust the height so the text stays inside
                          align: "left",
                          wordBreak: 'break-word' // Enable word wrapping for value1
                      });
              }
      
              // Draw vertical line between the columns
              doc.lineWidth(0.5);
              doc.strokeColor("black");
              doc.moveTo(startX + keyWidth, startY);
              doc.lineTo(startX + keyWidth, startY + rowHeight);
              doc.stroke();
      
              // Move to the next row position
              startY += rowHeight;
          });
      }
      
        const  PreDisbursementTablee = [
          { field1: "S. NO", value1: `Pre-disbursement Terms and Conditions` },
          { field1: "1", value1: `${allPerameters.specialTermsConditionOne}` },
          { field1: "2", value1: `5 PDCs of borrower and 2 PDC of Financial Guarantor / Third Party Gurantors are to be submitted at the time of disbursement.` },
          { field1: "3", value1: `Life insurance of the key earning member is mandatory` },
          { field1: "4", value1: `Original documents to be vetted by RCPL empanelled Vendor` },
          { field1: "5", value1: `Registered mortgage deed to be executed in favor of Ratnaafin Capital Private Limited.` },
          { field1: "6", value1: `Registered Mortgage in Favour of RCPL to be created on property.` },
          { field1: "7", value1: `No single property will be released. Complete loan to be foreclosed for release of any property under mortgage.` },
          // { field1: "8", value1: `Hypothecation on machinery to be done.` },
          // { field1: "9", value1: `Prepayment of 20% of principal outstanding can be done post one year of disbursement.` },
        ];
        
        latterTableFunction(PreDisbursementTablee);
      
      
          // addFooter()
      
      //     //-------------------------------------- new page 3-------------------------------------------------------------
         
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(9);
          
         
      
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(` For,\n Ratnaafin Capital Private Limited\n\n Authorised Signatory\n\n\n\n\n Sanction Letter Acceptance\n\n\n I/We have read the terms and conditions mentioned in the sanction letter and accept the Same.\n\n\n Signature/thumb impression: - `,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
      
      
      //   function thumbImpressionTableFunction(tableData) {
      //     // Add Table Header
      //     const startX = 50;
      //     let startY = doc.y + 10;
      //     const totalWidth = 500; // Total column width
      //     const keyWidth = Math.round(totalWidth * 0.4); // Increase field1 width to 40% of the total width
      //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value1 column
      
      //     tableData.forEach((row, rowIndex) => {
      //         // Set default row height and add extra space for readability
      //         let rowHeight = 40; // further increased default row height
      
      //         // Calculate the height of the text for field1 and value1
      //         const field1TextHeight = doc
      //             .font(fontBold) // Bold font for field1
      //             .fontSize(7.2)
      //             .heightOfString(row.field1, { width: keyWidth });
      
      //         let value1TextHeight = 0;
      //         if (row.value1) {
      //             value1TextHeight = doc
      //                 .font(fontBold) // Bold font if value1 is "SIGNATURE"
      //                 .fontSize(7.2)
      //                 .heightOfString(row.value1, { width: valueWidth });
      //         }
      
      //         // Determine the maximum height between field1 and value1 to set row height
      //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 25 // more padding for increased row height
      
      //         // Alternate row background color
      //         doc.lineWidth(0.5);
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX, startY, keyWidth, rowHeight)
      //             .stroke("black")
      //             .fill();
      
      //         // Draw bold text in field1 cell
      //         doc
      //             .font(fontBold)
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(row.field1, startX + 5, startY + 15, { // increased vertical padding
      //                 baseline: "hanging",
      //                 width: keyWidth,
      //             });
      
      //         // Draw the second column, even if value1 is absent
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //             .stroke()
      //             .fill();
      
      //         // Draw bold text for the `value1` if it contains "SIGNATURE"
      //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
      //         doc
      //             .font(row.value1 === "SIGNATURE" ? fontBold : font) // Use bold if value is "SIGNATURE"
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(keyValueText, startX + keyWidth + 5, startY + 10, { // increased vertical padding
      //                 baseline: "hanging",
      //                 width: valueWidth,
      //             });
      
      //         // Draw vertical line between the columns
      //         doc.lineWidth(0.5);
      //         doc.strokeColor("black");
      //         doc.moveTo(startX + keyWidth, startY);
      //         doc.lineTo(startX + keyWidth, startY + rowHeight);
      //         doc.stroke();
      
      //         // Move to the next row position
      //         startY += rowHeight;
      //     });
      // }
      
      
        // const  thumbImpressionTable = [
        //   { field1: "NAME", value1: `SIGNATURE` },
        //   { field1: `BORROWERS NAME : ${allPerameters.borrowersName}`, value1: `` },
        //   { field1: `CO-BORROWERS NAME : ${allPerameters.coBorrowersName}`, value1: `` },
        //   { field1: `CO-BORROWERS NAME-2 : ${allPerameters.coBorrowersNameTwo}`, value1: `` },
        //   { field1: `GUARANTORS NAME : ${allPerameters.guarantorsName}`, value1: `` },
        // ];
      
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`BORROWERS NAME : ${allPerameters.borrowersName}`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1)
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`CO-BORROWERS NAME : ${allPerameters.coBorrowersName} `,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1)
        // .font('Helvetica-Bold')
        // .fontSize(8)
        // .text(`CO-BORROWERS NAME-2 : : ${allPerameters.coBorrowersNameTwo} `,startX, doc.y, { align: "left", x: 50 })
        // .moveDown(1)
        // .font('Helvetica-Bold')
        // .fontSize(8)
        // .text(`GUARANTORS NAME : ${allPerameters.guarantorsName} `,startX, doc.y, { align: "left", x: 50 })
        // .moveDown(1);
        
        // thumbImpressionTableFunction(thumbImpressionTable);
      doc.moveDown(6)
        doc
        .font('Helvetica-Bold')
        .fontSize(8)
        .text(`Annexure I: Security Details`,startX, doc.y, { align: "left", x: 50 })
        .moveDown(1);
      
      //   function securityDetailsTableFunction(tableData) {
      //     // Add Table Header
      //     const startX = 50;
      //     let startY = doc.y + 10;
      //     const totalWidth = 500; // Total column width
      //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
      //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      
      //     tableData.forEach((row, rowIndex) => {
      //         // Set default row height
      //         let rowHeight = 15;
      
      //         // Calculate the height of the text for field1 and value1
      //         const field1TextHeight = doc
      //             .font(fontBold) // Use bold font for field1
      //             .fontSize(7.2)
      //             .heightOfString(row.field1, { width: keyWidth });
      
      //         let value1TextHeight = 0;
      //         if (row.value1) {
      //             value1TextHeight = doc
      //                 .font(font) // Use regular font for value1
      //                 .fontSize(7.2)
      //                 .heightOfString(row.value1, { width: valueWidth });
      //         }
      
      //         // Determine the maximum height between field1 and value1 to set row height
      //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //         // Alternate row background color
      //         doc.lineWidth(0.5);
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX, startY, keyWidth, rowHeight)
      //             .stroke("black")
      //             .fill();
      
      //         // Draw bold text in field1 cell
      //         doc
      //             .font(fontBold) // Set font to bold
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(row.field1, startX + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: keyWidth,
      //             });
      
      //         // Draw the second column, even if value1 is absent
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //             .stroke()
      //             .fill();
      
      //         // Draw only the `value1` text without any prefix
      //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
      //         doc
      //             .font(font) // Use regular font for value1
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: valueWidth,
      //             });
      
      //         // Draw vertical line between the columns
      //         doc.lineWidth(0.5);
      //         doc.strokeColor("black");
      //         doc.moveTo(startX + keyWidth, startY);
      //         doc.lineTo(startX + keyWidth, startY + rowHeight);
      //         doc.stroke();
      
      //         // Move to the next row position
      //         startY += rowHeight;
      //     });
      // }
         
      
      //   const  securityDetailsTable = [
      //     { field1: "Security Type", value1: `Collateral` },
      //     { field1: "Description", value1: `Residential property` },
      //     { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
      //     { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
      //     { field1: "Property Type", value1: `Residential property` },
      //     { field1: "Area", value1: `${allPerameters.SecurityDetailsArea}.                         | Construction - ${allPerameters.Construction}` },
      //     { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
      //   ];
        
      //   securityDetailsTableFunction(securityDetailsTable);
      
      //    addFooter()
      //     //---------------------------------------------------- new page 4 ----------------------------------------------------
      
      function securityDetailsTableFunction(tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
        const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
        const valueWidth = totalWidth - keyWidth; // Value column width (70%)
        const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
      
        // Set thin border width
        const borderWidth = 0.3;
      
        tableData.forEach((row, rowIndex) => {
            let rowHeight = 15;
      
            // Row 6: Adjust for 3 columns
            if (rowIndex === 5) {
                // Calculate heights for three columns
                const heights = row.columns.map((col, i) =>
                    doc.font(i === 0 ? fontBold : font).fontSize(7.2).heightOfString(col.value, { width: colWidths[i] })
                );
                rowHeight = Math.max(...heights) + 10;
      
                // Draw three-column row
                let currentX = startX;
                row.columns.forEach((col, i) => {
                    // Background
                    doc.lineWidth(borderWidth)
                        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                        .rect(currentX, startY, colWidths[i], rowHeight)
                        .stroke("black")
                        .fill();
      
                    // Text
                    doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                        width: colWidths[i],
                        baseline: "hanging",
                    });
      
                    // Update X for next column
                    currentX += colWidths[i];
                });
            } else {
                // Rows with 2 columns
                const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
                const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
                rowHeight = Math.max(field1Height, value1Height) + 10;
      
                // Draw key column
                doc.lineWidth(borderWidth)
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX, startY, keyWidth, rowHeight)
                    .stroke("black")
                    .fill();
                doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                    width: keyWidth,
                    baseline: "hanging",
                });
      
                // Draw value column
                doc.lineWidth(borderWidth)
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                    .stroke("black")
                    .fill();
                doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                    width: valueWidth,
                    baseline: "hanging",
                });
            }
      
            // Move to the next row
            startY += rowHeight;
        });
      }
      function securityDetailsTableFunction1(tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
        const keyWidth = Math.round(totalWidth * 0.3); // Key column width (30%)
        const valueWidth = totalWidth - keyWidth; // Value column width (70%)
        const colWidths = [Math.round(totalWidth * 0.3), Math.round(totalWidth * 0.35), Math.round(totalWidth * 0.35)]; // Three-column widths
      
        tableData.forEach((row, rowIndex) => {
            let rowHeight = 15;
      
            // Row 6: Adjust for 3 columns
            if (rowIndex === 5) {
                // Calculate heights for three columns
                const heights = row.columns.map((col, i) =>
                    doc
                        .font(i === 0 ? fontBold : font)
                        .fontSize(7.2)
                        .heightOfString(col.value, { width: colWidths[i] })
                );
                rowHeight = Math.max(...heights) + 10;
      
                // Draw three-column row
                let currentX = startX;
                row.columns.forEach((col, i) => {
                    // Set thin border width
                    doc.lineWidth(0.5);
      
                    // Background
                    doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                        .rect(currentX, startY, colWidths[i], rowHeight)
                        .stroke("black")
                        .fill();
      
                    // Text
                    doc.font(i === 0 ? fontBold : font).fillColor("black").fontSize(7.2).text(col.value, currentX + 5, startY + 5, {
                        width: colWidths[i],
                        baseline: "hanging",
                    });
      
                    // Update X for next column
                    currentX += colWidths[i];
                });
            } else {
                // Rows with 2 columns
                const field1Height = doc.font(fontBold).fontSize(7.2).heightOfString(row.field1, { width: keyWidth });
                const value1Height = doc.font(font).fontSize(7.2).heightOfString(row.value1, { width: valueWidth });
                rowHeight = Math.max(field1Height, value1Height) + 10;
      
                // Set thin border width
                doc.lineWidth(0.5);
      
                // Draw key column
                doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX, startY, keyWidth, rowHeight)
                    .stroke("black")
                    .fill();
                doc.font(fontBold).fillColor("black").fontSize(7.2).text(row.field1, startX + 5, startY + 5, {
                    width: keyWidth,
                    baseline: "hanging",
                });
      
                // Draw value column
                doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                    .stroke("black")
                    .fill();
                doc.font(font).fillColor("black").fontSize(7.2).text(row.value1, startX + keyWidth + 5, startY + 5, {
                    width: valueWidth,
                    baseline: "hanging",
                });
            }
      
            // Move to the next row
            startY += rowHeight;
        });
      }
      
      const securityDetailsTable1 = [
        { field1: "Security Type", value1: `Collateral` },
        { field1: "Description", value1: `Residential property` },
        { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
        { field1: "Property Owner", value1: `${allPerameters.sellerName} & ${allPerameters.buyerName}` },
        { field1: "Property Type", value1: `Residential property` },
        {
            // Row 6: Three columns
            columns: [
                { value: "Land Area " },
                { value: `${allPerameters.SecurityDetailsArea} sq.ft`},
                { value: `Construction -${allPerameters.Construction} `}, // Empty column if needed
            ],
        },
        { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
      ];
      
      securityDetailsTableFunction1(securityDetailsTable1);
      
      
      // const securityDetailsTable = [
      //   { field1: "Security Type", value1: `Collateral` },
      //   { field1: "Description", value1: `Residential property` },
      //   { field1: "Address Details", value1: `${allPerameters.AddressDetails}` },
      //   { field1: "Property Owner", value1: `${allPerameters.propertyOwner}` },
      //   { field1: "Property Type", value1: `Residential property` },
      //   { field1: "Area", value1: `${allPerameters.SecurityDetailsArea} | Construction - ${allPerameters.Construction}` },
      //   { field1: "For Facility Type", value1: `Agri Micro Loan Against Property` },
      // ];
      
      // securityDetailsTableFunction(securityDetailsTable);
      
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(7);
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`Specified Terms & Conditions: -`,startX, doc.y, { align: "center", x: 50 })
          .moveDown(0.4);
      
      
      // function termsConditionTableFunction(tableData) {
      //     // Add Table Header
      //     const startX = 50;
      //     let startY = doc.y + 10;
      //     const totalWidth = 500; // Total column width
      //     const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
      //     const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      
      //     tableData.forEach((row, rowIndex) => {
      //         // Set default row height
      //         let rowHeight = 15;
      
      //         // Calculate the height of the text for field1 and value1
      //         const field1TextHeight = doc
      //             .font(rowIndex === 0 ? fontBold : font) // Use bold font for first row only
      //             .fontSize(7.2)
      //             .heightOfString(row.field1, { width: keyWidth });
      
      //         let value1TextHeight = 0;
      //         if (row.value1) {
      //             value1TextHeight = doc
      //                 .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
      //                 .fontSize(7.2)
      //                 .heightOfString(row.value1, { width: valueWidth });
      //         }
      
      //         // Determine the maximum height between field1 and value1 to set row height
      //         rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //         // Alternate row background color
      //         doc.lineWidth(0.5);
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX, startY, keyWidth, rowHeight)
      //             .stroke("black")
      //             .fill();
      
      //         // Draw text in field1 cell (bold for the first row, normal for others)
      //         doc
      //             .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(row.field1, startX + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: keyWidth,
      //             });
      
      //         // Draw the second column, even if value1 is absent
      //         doc
      //             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //             .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //             .stroke()
      //             .fill();
      
      //         // For the first row, make value1 bold, otherwise use regular font
      //         const keyValueText = row.value1 ? row.value1 : ""; // Show only value1 text if present
      //         doc
      //             .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
      //             .fillColor("black")
      //             .fontSize(7.2)
      //             .text(keyValueText, startX + keyWidth + 5, startY + 5, {
      //                 baseline: "hanging",
      //                 width: valueWidth,
      //             });
      
      //         // Draw vertical line between the columns
      //         doc.lineWidth(0.5);
      //         doc.strokeColor("black");
      //         doc.moveTo(startX + keyWidth, startY);
      //         doc.lineTo(startX + keyWidth, startY + rowHeight);
      //         doc.stroke();
      
      //         // Move to the next row position
      //         startY += rowHeight;
      //     });
      // }
      function termsConditionTableFunction(tableData) {
        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total column width
        const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
        const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
        const padding = 5; // Padding to ensure text doesn't touch the border
      
        tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
      
          // Calculate the height of the text for field1 and value1
          const field1TextHeight = doc
            .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
            .fontSize(7.2)
            .heightOfString(row.field1, { width: keyWidth - 2 * padding });
      
          let value1TextHeight = 0;
          if (row.value1) {
            value1TextHeight = doc
              .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
              .fontSize(7.2)
              .heightOfString(row.value1, { width: valueWidth - 2 * padding });
          }
      
          // Determine the maximum height between field1 and value1 to set row height
          rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
      
          // Check if field1 contains "S. No" (case-insensitive match)
          const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
      
          // Apply special row styling
          if (isSpecialRow) {
            doc
              .fillColor("#00BFFF") // Background color
              .rect(startX, startY, totalWidth, rowHeight)
              .fill()
              .stroke("black", 0.5); // Thin border
      
            doc
              .font(font)
              .fillColor("black") // Text color
              .fontSize(7.2)
              .text(row.field1, startX + padding, startY + padding, {
                baseline: "hanging",
                width: keyWidth - 2 * padding,
              });
      
            const keyValueText = row.value1 || ""; // Display value1 text if present
            doc
              .font(font)
              .fillColor("black")
              .fontSize(7.2)
              .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                baseline: "hanging",
                width: valueWidth - 2 * padding,
              });
          } else {
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX, startY, keyWidth, rowHeight)
              .stroke("black")
              .fill();
      
            // Draw text in field1 cell
            doc
              .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
              .fillColor("black")
              .fontSize(7.2)
              .text(row.field1, startX + padding, startY + padding, {
                baseline: "hanging",
                width: keyWidth - 2 * padding,
              });
      
            // Draw the second column, even if value1 is absent
            doc
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(startX + keyWidth, startY, valueWidth, rowHeight)
              .stroke("black")
              .fill();
      
            // Draw text in value1 cell
            const keyValueText = row.value1 || ""; // Display value1 text if present
            doc
              .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
              .fillColor("black")
              .fontSize(7.2)
              .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                baseline: "hanging",
                width: valueWidth - 2 * padding,
              });
          }
      
          // Draw vertical line between the columns
          doc.lineWidth(0.5);
          doc.strokeColor("black");
          doc.moveTo(startX + keyWidth, startY);
          doc.lineTo(startX + keyWidth, startY + rowHeight);
          doc.stroke();
      
          // Move to the next row position
          startY += rowHeight;
        });
      }
      
      
      // function termsConditionTableFunction(tableData) {
      //   // Add Table Header
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total column width
      //   const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
      //   const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height of the text for field1 and value1
      //     const field1TextHeight = doc
      //       .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
      //       .fontSize(7.2)
      //       .heightOfString(row.field1, { width: keyWidth });
      
      //     let value1TextHeight = 0;
      //     if (row.value1) {
      //       value1TextHeight = doc
      //         .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
      //         .fontSize(7.2)
      //         .heightOfString(row.value1, { width: valueWidth });
      //     }
      
      //     // Determine the maximum height between field1 and value1 to set row height
      //     rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;
      
      //     // Check if field1 contains "S. No" (case-insensitive match)
      //     const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
      
      //     // Apply special row styling
      //     if (isSpecialRow) {
      //       doc
      //         .fillColor("#00BFFF") // Background color
      //         .rect(startX, startY, totalWidth, rowHeight)
      //         .fill()
      //         .stroke("black", 0.5); // Thin border
      
      //       doc
      //         .font(font)
      //         .fillColor("black") // Text color
      //         .fontSize(7.2)
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: keyWidth,
      //         });
      
      //       const keyValueText = row.value1 || ""; // Display value1 text if present
      //       doc
      //         .font(font)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: valueWidth,
      //         });
      //     } else {
      //       // Alternate row background color
      //       doc.lineWidth(0.5);
      //       doc
      //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //         .rect(startX, startY, keyWidth, rowHeight)
      //         .stroke("black")
      //         .fill();
      
      //       // Draw text in field1 cell (bold for the first row, normal for others)
      //       doc
      //         .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field1, startX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: keyWidth,
      //         });
      
      //       // Draw the second column, even if value1 is absent
      //       doc
      //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //         .rect(startX + keyWidth, startY, valueWidth, rowHeight)
      //         .stroke("black")
      //         .fill();
      
      //       // Draw text in value1 cell (bold for the first row, normal for others)
      //       const keyValueText = row.value1 || ""; // Display value1 text if present
      //       doc
      //         .font(rowIndex === 0 ? fontBold : font) // Bold for the first row only
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(keyValueText, startX + keyWidth + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: valueWidth,
      //         });
      //     }
      
      //     // Draw vertical line between the columns
      //     doc.lineWidth(0.5);
      //     doc.strokeColor("black");
      //     doc.moveTo(startX + keyWidth, startY);
      //     doc.lineTo(startX + keyWidth, startY + rowHeight);
      //     doc.stroke();
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
      
      
        
          const  termsConditionTable = [
            { field1: "S. No", value1: `Specified Terms & Condition` },
            { field1: "1", value1: `Registered Mortgage to be created and release cost to be borne by the customer. Security to be created cost to be borne by the Borrower or the Guarantor, as the case may be.` },
            { field1: "2", value1: `Facility is subject to satisfactory compliance of all terms and conditions as stipulated in the legal opinion report, the title of which should be clear and marketable given by the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved lawyer and the cost of which should be borne by the Borrower or the Guarantor, as the case may be.` },
            { field1: "3", value1: `Facility account will be setup subject to technical clearance of the property to be mortgaged, as assessed by RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "4", value1: `The quantum of Facility amount will be based on a satisfactory valuation report from the RATNAAFIN CAPITAL PRIVATE LIMITED’s approved valuer.` },
            { field1: "5", value1: `The security charged to the RATNAAFIN CAPITAL PRIVATE LIMITED including property etc. should be comprehensively insured (fire, riots and other hazards like earthquake, floods, etc.) with RATNAAFIN CAPITAL PRIVATE LIMITED Clause and the policy document /a copy of the policy document to be submitted for.` },
            { field1: "6", value1: `The property shall be well maintained at all times and during the pendency of the loan if the property suffers any loss on account of natural calamities or due to riots etc., the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED without fail.` },
            { field1: "7", value1: `Borrower and the Guarantor shall not voluntarily cause any harm to the property that may in any way be detrimental to the interests of the RATNAAFIN CAPITAL PRIVATE LIMITED. You shall make up for any loss incurred to the RATNAAFIN CAPITAL PRIVATE LIMITED on account of any damages occurring to the property due to deviation from the approved plan.` },
            { field1: "8", value1: `You will ensure that the property tax is promptly paid.` },
            { field1: "9", value1: `You will not be entitled to sell, mortgage, lease, surrender or alienate the mortgaged property, or any part thereof, during the subsistence of the mortgage without prior intimation to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "10", value1: `In case of foreclosure of Loan, 4% on the principal outstanding amount will be applicable. In case of balance transfer, 4% charges will be applicable.\n\n Foreclosure charges shall not be levied on individual borrowers for floating rates loans.` },
            { field1: "11", value1: `FRR as applicable on the date of disbursement and the same shall be reset at an interval as per the internal Guidelines of RATNAAFIN CAPITAL PRIVATE LIMITED. It shall be the responsibility of the borrower(s) to inquire or avail from Ratnaafin Capital Private Limited the details thereof on the reset date specified in the agreement. RATNAAFIN CAPITAL PRIVATE LIMITED is entitled to change the reset frequency at any point of time.` },
            { field1: "12", value1: `In case of Takeover of the facility, 4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement).\n\n Takeover charges shall not be levied on individual borrowers for floating rates.` },
            { field1: "13", value1: `The Processing Fees and / or Login Fees are non-refundable.` },
            { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED is authorised to debit Processing fees and other charges / insurance premium mentioned in the sanction\n\n letter from the account/s of the firm company maintained with the Bank.` },
            { field1: "15", value1: `The Borrower and Security Providers shall be deemed to have given their express consent to the RATNAAFIN CAPITAL PRIVATE LIMITED to disclose the information and data furnished by them to the RATNAAFIN CAPITAL PRIVATE LIMITED and also those regarding the credit facility or facilities enjoyed by the borrower, conduct of accounts and guarantee obligations undertaken by guarantor to the Credit Information Companies , or any other credit bureau or RBI or any other agencies specified by RBI who are authorized to seek and publish information, upon signing the copy of the sanction letter.` },
            { field1: "16", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED also reserves the right to assign, securitize or otherwise transfer the loan hereby agreed to be granted or a portion thereof to any person or third party assignee without any notice or consent along with or without underlying security or securities whether movable and or immovable created or to be created for the benefit of the RATNAAFIN CAPITAL PRIVATE LIMITED and pursuant to which the assignee shall be entitled to all or any rights and benefits under the loan and other agreements and or the security or securities created or to be created by me or us or the security providers.` },
          ];
          
          termsConditionTableFunction(termsConditionTable);
      
      ////    addFooter()
      
      //     //----------------------------------------------------new page 5-------------------------------
      
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(9);
          function termsConditionTableFunction1(tableData) {
            // Add Table Header
            const startX = 50;
            let startY = doc.y + 10;
            const totalWidth = 500; // Total column width
            const keyWidth = Math.round(totalWidth * 0.20); // 30% of the total width
            const valueWidth = totalWidth - keyWidth; // Remaining width for the value column
            const padding = 5; // Padding to ensure text doesn't touch the border
          
            tableData.forEach((row, rowIndex) => {
              // Set default row height
              let rowHeight = 15;
          
              // Calculate the height of the text for field1 and value1
              const field1TextHeight = doc
                .font(rowIndex === 0 ? fontBold : font) // Use bold font for the first row only
                .fontSize(7.2)
                .heightOfString(row.field1, { width: keyWidth - 2 * padding });
          
              let value1TextHeight = 0;
              if (row.value1) {
                value1TextHeight = doc
                  .font(rowIndex === 0 ? fontBold : font) // Use bold font for value1 in the first row only
                  .fontSize(7.2)
                  .heightOfString(row.value1, { width: valueWidth - 2 * padding });
              }
          
              // Determine the maximum height between field1 and value1 to set row height
              rowHeight = Math.max(field1TextHeight, value1TextHeight) + 2 * padding;
          
              // Check if field1 contains "S. No" (case-insensitive match)
              const isSpecialRow = row.field1.toUpperCase().includes("S. NO");
          
              // Apply special row styling
              if (isSpecialRow) {
                doc
                  .fillColor("#00BFFF") // Background color
                  .rect(startX, startY, totalWidth, rowHeight)
                  .fill()
                  .stroke("black", 0.5); // Thin border
          
                doc
                  .font(font)
                  .fillColor("black") // Text color
                  .fontSize(7.2)
                  .text(row.field1, startX + padding, startY + padding, {
                    baseline: "hanging",
                    width: keyWidth - 2 * padding,
                  });
          
                const keyValueText = row.value1 || ""; // Display value1 text if present
                doc
                  .font(font)
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                    baseline: "hanging",
                    width: valueWidth - 2 * padding,
                  });
              } else {
                // Alternate row background color
                doc.lineWidth(0.5);
                doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, keyWidth, rowHeight)
                  .stroke("black")
                  .fill();
          
                // Draw text in field1 cell
                doc
                  .font(rowIndex === 0 ? fontBold : font) // Set font to bold for the first row only
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(row.field1, startX + padding, startY + padding, {
                    baseline: "hanging",
                    width: keyWidth - 2 * padding,
                  });
          
                // Draw the second column, even if value1 is absent
                doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                  .stroke("black")
                  .fill();
          
                // Draw text in value1 cell
                const keyValueText = row.value1 || ""; // Display value1 text if present
                doc
                  .font(rowIndex === 0 ? font: font) // Bold for the first row only
                  .fillColor("black")
                  .fontSize(7.2)
                  .text(keyValueText, startX + keyWidth + padding, startY + padding, {
                    baseline: "hanging",
                    width: valueWidth - 2 * padding,
                  });
              }
          
              // Draw vertical line between the columns
              doc.lineWidth(0.5);
              doc.strokeColor("black");
              doc.moveTo(startX + keyWidth, startY);
              doc.lineTo(startX + keyWidth, startY + rowHeight);
              doc.stroke();
          
              // Move to the next row position
              startY += rowHeight;
            });
          }
      
          const conditonsTable = [
            { field1: "17", value1: `In the event of any change of address for communication, any change in job, profession by you or the guarantors, the same should be intimated to the RATNAAFIN CAPITAL PRIVATE LIMITED immediately` },
            { field1: "18", value1: `General undertaking to be taken from borrower are as mentioned below, if applicable\nThat the Firm not to pay any consideration by way of commission, brokerage, fees or any other form to guarantors directly or indirectly.That working capital funds would not be diverted for long term use\nThat none of the directors of Ratnaafin Capital Private Limited or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or of a subsidiary of the borrower or of the holding company of the borrower and that none of them hold substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrowers knowledge none of the directors of any other bank or the subsidiaries of the banks or trustees of mutual funds or venture capital funds set up by the banks or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them holds substantial interest in the borrower or its subsidiary or its holding company.\nThat to the best of the borrower’s knowledge none of senior officials of the RATNAAFIN CAPITAL PRIVATE LIMITED or the participating banks under consortium or their relatives as defined in the RBI Master Circular Loans and Advances Statutory and Other Restrictions is a director or partner, manager, managing agent, employee or guarantor of the borrower or its subsidiary or its holding company and that none of them hold substantial interest in the borrower or its subsidiary or its holding company. That in case if any of the above requirement is breached, the borrower shall inform of the RATNAAFIN CAPITAL PRIVATE LIMITED the same immediately.` },
          ]
      
          termsConditionTableFunction1(conditonsTable);
          doc.moveDown(1.5)
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
          .moveDown(0.5);
      
          const  standardConditionTable = [
            { field1: "S. No", value1: `Standard Terms & Condition` },
            { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
            { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof.` },
            { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
            { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED will have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
            { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
            { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
            // { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
            // { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
            // { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            // { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
            // { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            // { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
          ];
      
          termsConditionTableFunction(standardConditionTable);
      
      ////    addFooter()
      
      //     // ------------------------------------new page 6---------------------------------------
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(7);
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`Standard Terms & Conditions`,startX, doc.y, { align: "center", x: 50 })
          .moveDown(0.5);
      
          const  standardConditionTablee = [
            // { field1: "S. No", value1: `Standard Terms & Condition` },
            // { field1: "1", value1: `The facility is subject to the borrower furnishing any information or documents or to submit or execute the relevant post disbursement documents, as required by the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            // { field1: "2", value1: `The rate of interest applicable to the facility shall be prevailing on the date of disbursement and as stated in the Schedule to the Loan agreement.` },
            // { field1: "3", value1: `The Borrower(s) hereby agree(s) and confirms that Ratnaafin Capital Private Limited shall have the absolute right to levy such charges as it may deem fit including but not limited to Cheque bounce / return and any other penal charges for the delayed/ late payment or otherwise. The Borrower(s) agree(s) that in the event of such a levy, the Borrower(s) shall forthwith pay the said amount without demur or protest and that it shall not object to such levy nor claim waiver of or make a claim or a defence that the same was not brought to his/her/ their notice. The Borrower(s) is / are aware of the fact that it is not mandatory for Ratnaafin Capital Private Limited to inform either in advance or subsequently of the said levy and/ or change in the levy or introduction of such levy. It shalt be the responsibility of the Borrower(s) to enquire or avail from Ratnaafin Capital Private Limited the details thereof` },
            // { field1: "4", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED may at its sole discretion disclose such information to such institution(s) / bank in connection with the credit facilities granted to the borrower.` },
            // { field1: "5", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITEDwill have the right to examine at all times, the borrower's books of accounts and to have the its offices/ sites/ factory(ies)/ stocking points inspected from time to time by officer(s) of the RATNAAFIN CAPITAL PRIVATE LIMITED and / or qualified auditors and / or technical experts and / or management consultants of the RATNAAFIN CAPITAL PRIVATE LIMITED’s choice. Cost of such inspection shall be borne by the borrower.` },
            // { field1: "6", value1: `During the currency of the RATNAAFIN CAPITAL PRIVATE LIMITED’s facilities, the borrower will not without the permission of the RATNAAFIN CAPITAL PRIVATE LIMITED in writing a)Effect any Change in management structure b)Formulate any scheme of amalgamation with any other borrower/third party or reconstitution any borrower or third party c)Invest by way of share capital in or lend or advance funds to place deposits with any other concerns, except in normal course of business or as advances to employees d)Declare dividends for any year except out of profits relating to that year after making all due and necessary provisions and provided further that no default had occurred in any repayment obligations e)Grant Loans to Promoters/associates and other companies f)Undertake guarantee obligations on behalf of any other borrower or any third party except in normal course of its business g) Withdraw monies brought in by key promoters/depositors h) Make any drastic change in its management set up.` },
            // { field1: "7", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED informed of the happening of any event, likely to have a substantial effect on their production, sales, profits, etc., such as labour problem, power cut, etc., and the remedial steps proposed to be taken by it.` },
            { field1: "8", value1: `The borrower will keep the RATNAAFIN CAPITAL PRIVATE LIMITED advised of any circumstances adversely affecting the financial position of its subsidiaries/sister concerns (if any) including any action, taken by any creditor against any of the subsidiaries.` },
            { field1: "9", value1: `The borrower shall furnish to the RATNAAFIN CAPITAL PRIVATE LIMITED, every year, two copies of audited/unaudited financial statements immediately on being published/signed by the auditors/certified by CA.` },
            { field1: "10", value1: `The borrower shall provide ancillary business wherever possible to the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "11", value1: `The interest per annum means interest for 365 days irrespective of leap year` },
            { field1: "12", value1: `The credit facilities shall not be transferred /assigned by the borrower to any other entity without permission of the RATNAAFIN CAPITAL PRIVATE LIMITED. In case there is any transfer/assignment the loan shall be recalled at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "13", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to discontinue the facility and to withhold/stop any disbursement without giving any notice in case of non-compliance/breach of any terms and conditions stipulated herein and from time to time as also in the relevant documents or any information/particulars furnished to us is found to be incorrect or in case of any development or situations in the opinion of the RATNAAFIN CAPITAL PRIVATE LIMITED , its interest will be/is likely to be prejudicially affected by such continuation or disbursement.` },
            { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
            { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
            { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
            { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
            { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
            { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
            { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
            { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
            { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
            // { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
            // { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
            // { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
            // { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
            // { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
          
          ];
      
          termsConditionTableFunction1(standardConditionTablee);
      
      ////    addFooter()
      
      
      //     //-------------------------------------new page 7--------------------------------------------------
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(5);
      
          const table = [
            //  { field1: "14", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED reserves the right to revise the spread over Base Rate/G-Sec/LIBOR/MCLR (any other benchmark rate fixed by the RATNAAFIN CAPITAL PRIVATE LIMITED) on the facility RATNAAFIN CAPITAL PRIVATE LIMITED shall have absolute right to decide and apply the spread over the FRR, Spread shall consist of credit risk premium (which is subject to change in case there is substantial change in the Borrowers credit assessment as agreed in this T&C), operating costs and other costs. The same will be reset periodically once in three years from the date of disbursement. The credit risk premium of the borrower shall be reviewed by the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals and shall undergo a revision in case of a substantial change in the borrower’s credit assessment.` },
            // { field1: "15", value1: `In the event of the borrower committing default in the repayment of term loan instalments or payment of interest on due dates, Ratnaafin Capital Private Limited shall have an unqualified right to disclose the names of the Borrower and its directors to the Reserve Bank of India (RBI). The borrower shall give its consent to Ratnaafin Capital Private Limited and / or to RBI to publish its name and the names of its directors as defaulters in such manner and through such medium as Ratnaafin Capital Private Limited in their absolute discretion may think fit. The aforesaid right shall be available to Ratnaafin Capital Private Limited in addition to and not in derogation of any other rights available under the Loan Agreement or the General Conditions, as the case may be.` },
            // { field1: "16", value1: `The credit facilities granted will be subject to RBI guidelines / RATNAAFIN CAPITAL PRIVATE LIMITED’s policies from time to time.` },
            // { field1: "17", value1: `The loan shall be utilized for the purpose for which it is sanctioned and it should not be utilized for a) Subscription to or purchase of Shares/Debentures b) Extending loans to subsidiary companies or for making inter-corporate deposits c) Any Speculative purposes d) investment in capital market e) Adjustment/payment of any debt deemed bad or doubtful for recovery.` },
            // { field1: "18", value1: `The borrower shall maintain adequate books and records which should correctly reflect their financial position and operations and it should submit to the RATNAAFIN CAPITAL PRIVATE LIMITED at regular intervals such statements as may be prescribed by the RATNAAFIN CAPITAL PRIVATE LIMITED in terms of the RBI / RATNAAFIN CAPITAL PRIVATE LIMITED's instructions issued from time to time` },
            // { field1: "19", value1: `The sanction does not vest with the Borrower any right to claim any damages against the RATNAAFIN CAPITAL PRIVATE LIMITED for any reason whatsoever.` },
            // { field1: "20", value1: `The RATNAAFIN CAPITAL PRIVATE LIMITED has a right to cancel / suspend / reduce any of the borrowing / banking facility so granted and to alter / amend / vary the terms of RATNAAFIN CAPITAL PRIVATE LIMITED’s sanction including the rate of interest/margin/repayment period at the RATNAAFIN CAPITAL PRIVATE LIMITED’s sole discretion without having to assign any reason.` },
            // { field1: "21", value1: `The borrower shall arrange for inspection of the unit by RATNAAFIN CAPITAL PRIVATE LIMITED’s officials, at its cost, as and when required.` },
            // { field1: "22", value1: `The company needs to file necessary charges / modification of charges with the Registrar of Companies (as applicable) within 30 days of creation/modification of charges and certificate of Registration/modification of charge shall be submitted for our records` },
            { field1: "23", value1: `The borrower shall adhere to any other covenants stipulated by the RATNAAFIN CAPITAL PRIVATE LIMITED from time to time.` },
            { field1: "24", value1: `Any other terms and conditions, which are not specifically covered herein but stipulated in the sanction, should be strictly complied with.` },
            { field1: "25", value1: `Ratnaafin Capital Private Limited is entitled to add to, delete or modify all or any of the aforesaid terms and conditions.` },
            { field1: "26", value1: `This sanction letter shall remain in force till the validity period mentioned in this sanction letter from date of sanction. However, the revalidation is subject to and at the sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED, on application of the borrower/s.` },
            { field1: "27", value1: `The Loan/facility is at sole discretion of the RATNAAFIN CAPITAL PRIVATE LIMITED.` },
            { field1: "28", value1: `For cases where charge was registered with Registrar of Companies for securities proposed with Ratnaafin Capital Private Limited, borrower will arrange satisfaction of charge post security creation with Ratnaafin Capital Private Limited.` },
            { field1: "29", value1: `CERSAI Charges for registration of security interest will be levied as follows. Non-refundable charges levied by Central Registry of Securitization of Asset Reconstruction and Security Interest of India. For Registration of Individual Security Primary and or Collateral created in favour of Ratnaafin Capital Private Limited i. When facility amount is equal to Rs 5 lacs or lesser, Rs 50 plus GST ii. When facility amount is greater than Rs 5 Lacs, Rs 100 plus GST` },
            { field1: "30", value1: `Insurance renewal condition, Borrower to submit valid copy of Insurance of the property, and other assets duly charged in favour of Ratnaafin Capital Private Limited. Further borrower to ensure that fresh copy of insurance is provided to the RATNAAFIN CAPITAL PRIVATE LIMITED within 7 days before the expiry of insurance policy. In absence of that, Cash Credit or Overdraft or Current account shall be debited towards the insurance premium amount on the date of expiry of Insurance policy.` },   
         
          ];
      
          termsConditionTableFunction1(table);
          doc.moveDown(2)
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(7);
      
          doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .text(`KEY FACTS STATEMENT \n\n PART-1 Interest rate and fees / charges`,startX, doc.y, { align: "center", x: 50 })
          .moveDown(0.5);
      
          function securityDetailsTableFunction(tableData) {
            // Add Table Header
            const startX = 50;
            let startY = doc.y + 10;
            const totalWidth = 500; // Total table width
            const field1Width = Math.round(totalWidth * 0.1); // 10% for field1
            const field2Width = Math.round(totalWidth * 0.45); // 45% for field2
            const field3Width = totalWidth - field1Width - field2Width; // Remaining 45% for field3
        
            tableData.forEach((row, rowIndex) => {
                // Set default row height
                let rowHeight = 15;
        
                // Calculate the height of the text for field1, field2, and field3
                const field1TextHeight = doc
                    .font(fontBold) // Bold font for field1
                    .fontSize(7.2)
                    .heightOfString(row.field1, { width: field1Width });
        
                const field2TextHeight = doc
                    .font(font) // Regular font for field2
                    .fontSize(7.2)
                    .heightOfString(row.field2, { width: field2Width });
        
                const field3TextHeight = doc
                    .font(font) // Regular font for field3
                    .fontSize(7.2)
                    .heightOfString(row.field3, { width: field3Width });
        
                // Determine the maximum height between all fields to set row height
                rowHeight = Math.max(field1TextHeight, field2TextHeight, field3TextHeight) + 10;
        
                // Alternate row background color
                doc.lineWidth(0.5);
                doc
                    .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX, startY, totalWidth, rowHeight)
                    .stroke("black")
                    .fill();
        
                // Draw field1 text in the first column
                doc
                    .font(fontBold) // Bold font for field1
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, {
                        baseline: "hanging",
                        width: field1Width,
                    });
        
                // Draw field2 text in the second column
                doc
                    .font(font) // Regular font for field2
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row.field2, startX + field1Width + 5, startY + 5, {
                        baseline: "hanging",
                        width: field2Width,
                    });
        
                // Draw field3 text in the third column
                doc
                    .font(font) // Regular font for field3
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(row.field3 || "", startX + field1Width + field2Width + 5, startY + 5, {
                        baseline: "hanging",
                        width: field3Width,
                    });
        
                // Draw vertical lines between columns
                doc.strokeColor("black").lineWidth(0.5);
                doc.moveTo(startX + field1Width, startY).lineTo(startX + field1Width, startY + rowHeight).stroke();
                doc.moveTo(startX + field1Width + field2Width, startY).lineTo(startX + field1Width + field2Width, startY + rowHeight).stroke();
        
                // Move to the next row position
                startY += rowHeight;
            });
        }
        
        // Table Data
        const kycTable = [
            { field1: "1", field2: "Loan proposal/ account No.", field3: `${allPerameters.pENDENCYlOANnumber}` },
            { field1: "", field2: "Type of Loan", field3: "Agri Micro Loan Against Property" },
            { field1: "2", field2: "Sanctioned Loan amount (in Rupees)", field3: `Rs.${allPerameters.loanAmount} ${allPerameters.loanAmountinwords}` },
            { field1: "3", field2: "Disbursal schedule\n (i) Disbursement in stages or 100% upfront.\n(ii) If it is stage wise, mention the clause of loan agreement having relevant details", field3: "100 % upfront / As per Clause 3 (a)" },
            { field1: "4", field2: "Loan term (year/months/days)", field3: `${allPerameters.tenureinMonths} months` },
        ];
        
        // Call the function
        securityDetailsTableFunction(kycTable);
      
        function instalmentTableFunction(tableData) {
          const startX = 50;
          let startY = doc.y + 10;
          const totalWidth = 500; // Total table width
      
          // Determine the maximum number of fields in the table
          const maxFields = Math.max(
              ...tableData.map((row) => Object.keys(row).length)
          );
      
          // Calculate dynamic column width based on the number of fields
          const columnWidth = totalWidth / maxFields;
      
          tableData.forEach((row, rowIndex) => {
              // Set default row height
              let rowHeight = 15;
      
              // Calculate the height for each field dynamically
              const fieldHeights = Object.keys(row).map((key) => {
                  return doc
                      .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                      .fontSize(7.2)
                      .heightOfString(row[key] || "", { width: columnWidth });
              });
      
              // Determine the maximum height between all fields
              rowHeight = Math.max(...fieldHeights) + 10;
      
              // Alternate row background color
              doc.lineWidth(0.5);
              doc
                  .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                  .rect(startX, startY, totalWidth, rowHeight)
                  .stroke("black")
                  .fill();
      
              // Draw text for each field dynamically
              let currentX = startX;
              Object.keys(row).forEach((key, index) => {
                  doc
                      .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
                      .fillColor("black")
                      .fontSize(7.2)
                      .text(row[key] || "", currentX + 5, startY + 5, {
                          baseline: "hanging",
                          width: columnWidth,
                      });
      
                  // Draw vertical line after the column
                  doc.strokeColor("black").lineWidth(0.5);
                  doc
                      .moveTo(currentX + columnWidth, startY)
                      .lineTo(currentX + columnWidth, startY + rowHeight)
                      .stroke();
      
                  currentX += columnWidth;
              });
      
              // Move to the next row position
              startY += rowHeight;
          });
      }
      // Table instalment data examples
      const instalmentTable = [
          { field1: "5", field2: "Instalment details" },
          { field1: "Type of instalments", field2: "Number of EPIs", field3: `EPI (Rs)`, field4: "Commencement of repayment, post sanction" },
          { field1: "Monthly", field2: `${allPerameters.tenureinMonths}`, field3: `Rs ${allPerameters.emiAmount}`, field4: `10th of the month next to the \nfollowing month` },
      ];
      // Call the function
      instalmentTableFunction(instalmentTable);
      
      // function loanTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Determine the maximum number of fields in the table
      //   const maxFields = Math.max(
      //     ...tableData.map((row) => Object.keys(row).length)
      //   );
      
      //   // Calculate dynamic column width based on the number of fields
      //   const columnWidth = totalWidth / maxFields;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = Object.keys(row).map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      //     Object.keys(row).forEach((key, index) => {
      //       // Draw the text for each field
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row[key] || "", currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth,
      //         });
      
      //       // Draw vertical line after the column
      //       doc.strokeColor("black").lineWidth(0.5);
      //       doc
      //         .moveTo(currentX + columnWidth, startY)
      //         .lineTo(currentX + columnWidth, startY + rowHeight)
      //         .stroke();
      
      //       currentX += columnWidth;
      //     });
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
      function loanTableFunction(tableData, customWidths = []) {
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
      
        tableData.forEach((row, rowIndex) => {
          // Determine if custom widths are provided for the current row
          const numColumns = Object.keys(row).length;
          const rowWidths = customWidths[rowIndex] || Array(numColumns).fill(totalWidth / numColumns);
      
          // Set default row height
          let rowHeight = 15;
      
          // Calculate the height for each field dynamically
          const fieldHeights = Object.keys(row).map((key, index) => {
            return doc
              .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
              .fontSize(7.2)
              .heightOfString(row[key] || "", { width: rowWidths[index] });
          });
      
          // Determine the maximum height between all fields
          rowHeight = Math.max(...fieldHeights) + 10;
      
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, totalWidth, rowHeight)
            .stroke("black")
            .fill();
      
          // Draw text for each field dynamically
          let currentX = startX;
          Object.keys(row).forEach((key, index) => {
            // Draw the text for each field
            doc
              .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specific fields
              .fillColor("black")
              .fontSize(7.2)
              .text(row[key] || "", currentX + 5, startY + 5, {
                baseline: "hanging",
                width: rowWidths[index],
              });
      
            // Draw vertical line after the column
            doc.strokeColor("black").lineWidth(0.5);
            doc
              .moveTo(currentX + rowWidths[index], startY)
              .lineTo(currentX + rowWidths[index], startY + rowHeight)
              .stroke();
      
            currentX += rowWidths[index];
          });
      
          // Move to the next row position
          startY += rowHeight;
        });
      }
      
      const loanTable = [
        { field1: "6", field2: "Interest rate (%) and type (fixed or floating or hybrid)",field3: `${allPerameters.interestRate}% p.a (floating)` },
        { field1: "7", field2: "Additional Information in case of Floating rate of interest" },
        { field1: "Reference Benchmark", field2: "Benchmark rate (%) (B)", field3: "Spread (%) (S)",field4: "Final rate (%) R = (B) + (S)"  },
        { field1: "FRR", field2: "19.20%", field3: `${allPerameters.interestType}%`,field4: `${allPerameters.interestRate}%` },
      ];
      
      const customWidths = [
        [50, 300, 150], // Custom widths for the 1st row (3 columns)
        [50, 450],     // Custom widths for the 2nd row (2 columns)
        null,           // Default dynamic widths for the 3rd row
        null,           // Default dynamic widths for the 4th row
      ];
        //interestRate
      loanTableFunction(loanTable,customWidths);
      
      // function resetTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Determine the maximum number of fields in the table
      //   const maxFields = Math.max(
      //     ...tableData.map((row) => Object.keys(row).length)
      //   );
      
      //   // Calculate dynamic column width based on the number of fields
      //   const columnWidth = totalWidth / maxFields;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = Object.keys(row).map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      
      //     if (rowIndex === 1) {
      //       // For the second row, only span field2 and field3
      //       // Field 1 remains in the first column
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field1 || "", currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth, // field1 takes only the first column width
      //         });
      
      //       // Span field2 and field3 across the remaining columns
      //       currentX += columnWidth; // move to the next column for field2
      //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
      //       doc
      //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(row.field2 || "", currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: spanWidth, // field2 spans the rest of the row width
      //         });
      //     } else {
      //       // Regular row processing (for all other rows)
      //       Object.keys(row).forEach((key, index) => {
      //         // Draw the text for each field
      //         doc
      //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
      //           .fillColor("black")
      //           .fontSize(7.2)
      //           .text(row[key] || "", currentX + 5, startY + 5, {
      //             baseline: "hanging",
      //             width: columnWidth,
      //           });
      
      //         // Draw vertical line after the column
      //         doc.strokeColor("black").lineWidth(0.5);
      //         doc
      //           .moveTo(currentX + columnWidth, startY)
      //           .lineTo(currentX + columnWidth, startY + rowHeight)
      //           .stroke();
      
      //         currentX += columnWidth;
      //       });
      //     }
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
      
      // const resetTable = [
      //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
      //   { field1: "", field2: "Every 3 month" },
      // ];
        
      // resetTableFunction(resetTable);
      
      // function impactTableFunction(tableData) {
      //   const startX = 50;
      //   let startY = doc.y + 10;
      //   const totalWidth = 500; // Total table width
      
      //   // Set the number of columns explicitly (3 columns)
      //   const columns = ['field1', 'field2', 'field3'];
      
      //   // Calculate dynamic column width based on the number of columns
      //   const columnWidth = totalWidth / columns.length;
      
      //   tableData.forEach((row, rowIndex) => {
      //     // Set default row height
      //     let rowHeight = 15;
      
      //     // Calculate the height for each field dynamically
      //     const fieldHeights = columns.map((key) => {
      //       return doc
      //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fontSize(7.2)
      //         .heightOfString(row[key] || "", { width: columnWidth });
      //     });
      
      //     // Determine the maximum height between all fields
      //     rowHeight = Math.max(...fieldHeights) + 10;
      
      //     // Alternate row background color
      //     doc.lineWidth(0.5);
      //     doc
      //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //       .rect(startX, startY, totalWidth, rowHeight)
      //       .stroke("black")
      //       .fill();
      
      //     // Draw text for each field dynamically
      //     let currentX = startX;
      //     columns.forEach((key, index) => {
      //       // Check if field is empty, and show blank if needed
      //       const fieldValue = row[key] || " ";
      
      //       doc
      //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
      //         .fillColor("black")
      //         .fontSize(7.2)
      //         .text(fieldValue, currentX + 5, startY + 5, {
      //           baseline: "hanging",
      //           width: columnWidth,
      //         });
      
      //       // Draw vertical line after the column
      //       doc.strokeColor("black").lineWidth(0.5);
      //       doc
      //         .moveTo(currentX + columnWidth, startY)
      //         .lineTo(currentX + columnWidth, startY + rowHeight)
      //         .stroke();
      
      //       currentX += columnWidth;
      //     });
      
      //     // Move to the next row position
      //     startY += rowHeight;
      //   });
      // }
      
      // const impactTable = [
      //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: `EPI\u20B9`,field3: "No. of EPIs" },
      //   { field1: "", field2:  `${allPerameters.epi}`,field3:  `${allPerameters.noOfEpi}` },
      // ];
        
      // impactTableFunction(impactTable);
      function chargesTableFunction1(doc, tableData, font, fontBold) {
        const startX = 50; // Starting X position
        let startY = doc.y + 10; // Starting Y position
        const totalWidth = 500; // Total table width
        const baseColumnWidth = totalWidth / 4; // Base column width (4 columns in total)
      
        tableData.forEach((row, rowIndex) => {
          let currentX = startX;
          let rowHeight = 15;
      
          row.forEach((cell) => {
            const colWidth = baseColumnWidth * (cell.colSpan || 1); // Adjust width by colSpan
            const fieldHeight = doc
              .font(cell.bold ? fontBold : font) // Bold if specified
              .fontSize(7.2)
              .heightOfString(cell.text, { width: colWidth });
      
            rowHeight = Math.max(rowHeight, fieldHeight + 10);
      
            // Draw cell background
            doc.lineWidth(0.5)
              .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
              .rect(currentX, startY, colWidth, rowHeight)
              .stroke("black")
              .fill();
      
            // Draw text inside the cell
            doc.fillColor("black")
              .font(cell.bold ? fontBold : font)
              .fontSize(7.2)
              .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
      
            // Move to the next cell position
            currentX += colWidth;
          });
      
          // Move to the next row
          startY += rowHeight;
        });
      }
      
      // function chargesTableFunction1(doc, tableData, font, fontBold) {
      //   const startX = 50; // Starting X position
      //   let startY = doc.y + 10; // Starting Y position
      //   const totalWidth = 500; // Total table width
      
      //   tableData.forEach((row, rowIndex) => {
      //     let currentX = startX;
      //     let rowHeight = 15;
      
      //     row.forEach((cell) => {
      //       const colWidth = (totalWidth / 4) * (cell.colSpan || 1); // Adjust width by colSpan
      //       const fieldHeight = doc
      //         .font(cell.bold ? fontBold : font) // Bold if specified
      //         .fontSize(7.2)
      //         .heightOfString(cell.text, { width: colWidth });
      
      //       rowHeight = Math.max(rowHeight, fieldHeight + 10);
      
      //       // Draw cell background
      //       doc.lineWidth(0.5)
      //         .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
      //         .rect(currentX, startY, colWidth, rowHeight)
      //         .stroke("black")
      //         .fill();
      
      //       // Draw text inside the cell
      //       doc.fillColor("black")
      //         .font(cell.bold ? fontBold : font)
      //         .fontSize(7.2)
      //         .text(cell.text, currentX + 5, startY + 5, { width: colWidth, baseline: "hanging" });
      
      //       // Move to the next cell position
      //       currentX += colWidth;
      //     });
      
      //     // Move to the next row
      //     startY += rowHeight;
      //   });
      // }
      
      // const tableData1 = [
      //   [
      //     { text: "Reset periodicity (Months)", colSpan: 2, bold: true },
      //     { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: true },
      //   ],
      //   [
      //     { text: "B", bold: true },
      //     { text: "S", bold: true },
      //     { text: "EPI (₹)", bold: true },
      //     { text: "No. of EPIs", bold: true },
      //   ],
      //   [
      //     { text: "Every 3 months", colSpan: 2, bold: false },
      //     { text: "14749", bold: true },
      //     { text: "61", bold: true },
      //   ],
      // ];
      const tableData1 = [
        [
          { text: `Reset periodicity \n(Months)`, colSpan: 2, bold: false }, // Spanning 2 columns
          { text: "Impact of change in the reference benchmark\n(for 25 bps change in 'R', change in:)", colSpan: 2, bold: false }, // Spanning 2 columns
        ],
        [
          { text: "B", bold: false }, // Single column
          { text: "S", bold: false }, // Single column
          { text: "EPI (Rs)", bold: false }, // Single column
          { text: "No. of EPIs", bold: false }, // Single column
        ],
        [
          { text: "Every 3 months", colSpan: 2, bold: false }, // Spanning 2 columns
          { text: `Rs ${allPerameters.epi}`, bold: false }, // Single column
          { text:  `${allPerameters.noOfEpi}`, bold: false }, // Single column
        ],
      ];
      
      
      chargesTableFunction1(doc, tableData1, font, fontBold);
      
      function chargesTableFunction(tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const totalWidth = 500; // Total table width
      
        // Set the number of columns explicitly (3 columns)
        const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
      
        // Calculate dynamic column width based on the number of columns
        const columnWidth = totalWidth / columns.length;
      
        tableData.forEach((row, rowIndex) => {
          // Set default row height
          let rowHeight = 15;
      
          // Calculate the height for each field dynamically
          const fieldHeights = columns.map((key) => {
            return doc
              .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
              .fontSize(7.2)
              .heightOfString(row[key] || "", { width: columnWidth });
          });
      
          // Determine the maximum height between all fields
          rowHeight = Math.max(...fieldHeights) + 10;
      
          // Alternate row background color
          doc.lineWidth(0.5);
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, totalWidth, rowHeight)
            .stroke("black")
            .fill();
      
          // Draw text for each field dynamically
          let currentX = startX;
          columns.forEach((key, index) => {
            // Check if field is empty, and show blank if needed
            const fieldValue = row[key] || " ";
      
            doc
              .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
              .fillColor("black")
              .fontSize(7.2)
              .text(fieldValue, currentX + 5, startY + 5, {
                baseline: "hanging",
                width: columnWidth,
              });
      
            // Draw vertical line after the column
            doc.strokeColor("black").lineWidth(0.5);
            doc
              .moveTo(currentX + columnWidth, startY)
              .lineTo(currentX + columnWidth, startY + rowHeight)
              .stroke();
      
            currentX += columnWidth;
          });
      
          // Move to the next row position
          startY += rowHeight;
        });
      }
      
      const chargesTable = [
        { field1: "8", field2: "Fee/ Charges" },
        { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
      ];
      
      chargesTableFunction(chargesTable);
      
      
      function generateFeeChargesTableFromThirdRow(doc, tableData) {
        const startX = 50; // Starting X-coordinate
        let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
        const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
      
        tableData.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
      
            // Dynamically calculate the height of each cell's content
            const cellHeights = Object.keys(row).map((key, index) => {
                return doc
                    .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                    .fontSize(8)
                    .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
            });
      
            rowHeight = Math.max(...cellHeights) + 10;
      
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
                .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                .stroke("black")
                .fill();
      
            // Draw cell contents and vertical borders
            let currentX = startX;
            Object.keys(row).forEach((key, index) => {
                doc
                    .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
                    .fontSize(8)
                    .fillColor("black")
                    .text(row[key] || "", currentX + 5, startY + 5, {
                        width: columnWidths[index] - 10,
                        baseline: "hanging",
                        align: "left",
                    });
      
                // Draw vertical lines for columns
                doc.strokeColor("black").lineWidth(0.5);
                doc
                    .moveTo(currentX + columnWidths[index], startY)
                    .lineTo(currentX + columnWidths[index], startY + rowHeight)
                    .stroke();
      
                currentX += columnWidths[index];
            });
      
            // Move to the next row
            startY += rowHeight;
            doc.moveDown(1.8);
      
        });
      
        // Ensure table border ends properly
        doc.stroke();
      }
      
      const tableData = [
      {
        col1: "",
        col2: "",
        col3: "One-time/Recurring",
        col4: `Amount (in Rs) or Percentage(%) asapplicable`,
        col5: "One-time/Recurring",
        col6: `Amount (in Rs) or Percentage(%) as applicable`,
      },
      {
          col1: "(i)",
          col2: "Processing fees",
          col3: "One time",
          col4: `Rs.${allPerameters.processingfees}`,
          col5: "",
          col6: "",
      },
      {
          col1: "(ii)",
          col2: "Insurance charges",
          col3: "One time",
          col4: "",
          col5: "One time",
          col6:  `Rs.${allPerameters.insuranceCharges}`,
      },
      {
          col1: "(iii)",
          col2: "Valuation fees",
          col3: "One time",
          col4: "0",
          col5: "",
          col6: "",
      },
      {
          col1: "(iv)",
          col2: "Any other (please specify)",
          col3: "Documentation Charges, CERSAI Charges",
          col4:  `Rs.${allPerameters.docCharges} \n\nRs.${allPerameters.cersaiCharges}`,
          col5: "",
          col6: "",
      },
      ];
      
      generateFeeChargesTableFromThirdRow(doc, tableData);
      
      function generateFeeChargesTableFromThirdRowten(doc,tableDataten) {
        const startX = 50; // Starting X-coordinate
        let startY = doc.y + 10; // Starting Y-coordinate
        const columnConfigurations = [
            [80, 270, 153], // First row: Three columns
            [80, 423],      // Second row: Two columns
            [80, 200, 222], // Rows 3 to 7: Three columns
        ];
      
        tableDataten.forEach((row, rowIndex) => {
            // Determine the column configuration for the current row
            const columnWidths = columnConfigurations[row.configurationIndex];
            
            // Set default row height
            let rowHeight = 15;
      
            // Dynamically calculate the height of each cell's content
            const cellHeights = row.columns.map((col, index) => {
                return doc
                    .font("Helvetica")
                    .fontSize(8)
                    .heightOfString(col || "", { width: columnWidths[index] - 10 });
            });
      
            rowHeight = Math.max(...cellHeights) + 10;
      
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
                .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                .stroke("black")
                .fill();
      
            // Draw cell contents and vertical borders
            let currentX = startX;
            row.columns.forEach((col, index) => {
                doc
                    .font("Helvetica")
                    .fontSize(8)
                    .fillColor("black")
                    .text(col || "", currentX + 5, startY + 5, {
                        width: columnWidths[index] - 10,
                        baseline: "hanging",
                        align: "left",
                    });
      
                // Draw vertical lines for columns
                doc.strokeColor("black").lineWidth(0.5);
                doc
                    .moveTo(currentX + columnWidths[index], startY)
                    .lineTo(currentX + columnWidths[index], startY + rowHeight)
                    .stroke();
      
                currentX += columnWidths[index];
            });
      
            // Move to the next row
            startY += rowHeight;
        });
      
        // Ensure table border ends properly
        doc.stroke();
      
      }
      
      const tableDataten = [
        {
            configurationIndex: 0, // First row: 3 columns
            columns: ["9", "Annual Percentage Rate (APR) (%)", `${allPerameters.annualPercentageRateAprPercentage}%`],
        },
        {
            configurationIndex: 1, // Second row: 2 columns
            columns: ["10", `Details of Contingent Charges (in Rs or %, as applicable)`],
        },
        // {
        //     configurationIndex: 2, // Rows 3 to 7: 3 columns
        //     columns: [
        //         "(i)",
        //         "Penal charges, if any, in case of delayed payment",
        //         "2% per month on the Outstanding Dues plus, applicable Taxes",
        //     ],
        // },
        // {
        //     configurationIndex: 2,
        //     columns: [
        //         "(ii)",
        //         "Other penal charges, if any",
        //         "2% per month on the Outstanding Dues plus, applicable Taxes",
        //     ],
        // },
        // {
        //     configurationIndex: 2,
        //     columns: [
        //         "(iii)",
        //         "Foreclosure charges, if applicable",
        //         "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
        //     ],
        // },
        // {
        //     configurationIndex: 2,
        //     columns: [
        //         "(iv)",
        //         "Charges for switching of loans from floating to fixed rate and vice versa",
        //         "Not Applicable",
        //     ],
        // },
        // {
        //     configurationIndex: 2,
        //     columns: [
        //         "(v)",
        //         "Any other charges (please specify)",
        //         "Not Applicable",
        //     ],
        // },
      ];
      
      // Call the function with your doc object and table data
      doc.moveDown();
      generateFeeChargesTableFromThirdRowten(doc, tableDataten);
      doc.moveDown(2.5);
      
      ////    addFooter()
      
      //     //------------------------------------------------new pdf 8--------------------------------------------------------
      
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(4.8);
      
          // function resetTableFunction(tableData) {
          //   const startX = 50;
          //   let startY = doc.y + 10;
          //   const totalWidth = 500; // Total table width
          
          //   // Determine the maximum number of fields in the table
          //   const maxFields = Math.max(
          //     ...tableData.map((row) => Object.keys(row).length)
          //   );
          
          //   // Calculate dynamic column width based on the number of fields
          //   const columnWidth = totalWidth / maxFields;
          
          //   tableData.forEach((row, rowIndex) => {
          //     // Set default row height
          //     let rowHeight = 15;
          
          //     // Calculate the height for each field dynamically
          //     const fieldHeights = Object.keys(row).map((key) => {
          //       return doc
          //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
          //         .fontSize(7.2)
          //         .heightOfString(row[key] || "", { width: columnWidth });
          //     });
          
          //     // Determine the maximum height between all fields
          //     rowHeight = Math.max(...fieldHeights) + 10;
          
          //     // Alternate row background color
          //     doc.lineWidth(0.5);
          //     doc
          //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          //       .rect(startX, startY, totalWidth, rowHeight)
          //       .stroke("black")
          //       .fill();
          
          //     // Draw text for each field dynamically
          //     let currentX = startX;
          
          //     if (rowIndex === 1) {
          //       // For the second row, only span field2 and field3
          //       // Field 1 remains in the first column
          //       doc
          //         .font(["field1", "field2", "field3", "field4"].includes("field1") ? font : fontBold)
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(row.field1 || "", currentX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: columnWidth, // field1 takes only the first column width
          //         });
          
          //       // Span field2 and field3 across the remaining columns
          //       currentX += columnWidth; // move to the next column for field2
          //       const spanWidth = totalWidth - 2 * columnWidth; // field2 and field3 span across the remaining width
          //       doc
          //         .font(["field1", "field2", "field3", "field4"].includes("field2") ? font : fontBold)
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(row.field2 || "", currentX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: spanWidth, // field2 spans the rest of the row width
          //         });
          //     } else {
          //       // Regular row processing (for all other rows)
          //       Object.keys(row).forEach((key, index) => {
          //         // Draw the text for each field
          //         doc
          //           .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold)
          //           .fillColor("black")
          //           .fontSize(7.2)
          //           .text(row[key] || "", currentX + 5, startY + 5, {
          //             baseline: "hanging",
          //             width: columnWidth,
          //           });
          
          //         // Draw vertical line after the column
          //         doc.strokeColor("black").lineWidth(0.5);
          //         doc
          //           .moveTo(currentX + columnWidth, startY)
          //           .lineTo(currentX + columnWidth, startY + rowHeight)
          //           .stroke();
          
          //         currentX += columnWidth;
          //       });
          //     }
          
          //     // Move to the next row position
          //     startY += rowHeight;
          //   });
          // }
      
          // const resetTable = [
          //   { field1: "Resetperiodicity(Months)", field2: "B",field3: "S" },
          //   { field1: "", field2: "Every 3 month" },
          // ];
            
          // resetTableFunction(resetTable);
      
          // function impactTableFunction(tableData) {
          //   const startX = 50;
          //   let startY = doc.y + 10;
          //   const totalWidth = 500; // Total table width
          
          //   // Set the number of columns explicitly (3 columns)
          //   const columns = ['field1', 'field2', 'field3'];
          
          //   // Calculate dynamic column width based on the number of columns
          //   const columnWidth = totalWidth / columns.length;
          
          //   tableData.forEach((row, rowIndex) => {
          //     // Set default row height
          //     let rowHeight = 15;
          
          //     // Calculate the height for each field dynamically
          //     const fieldHeights = columns.map((key) => {
          //       return doc
          //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
          //         .fontSize(7.2)
          //         .heightOfString(row[key] || "", { width: columnWidth });
          //     });
          
          //     // Determine the maximum height between all fields
          //     rowHeight = Math.max(...fieldHeights) + 10;
          
          //     // Alternate row background color
          //     doc.lineWidth(0.5);
          //     doc
          //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          //       .rect(startX, startY, totalWidth, rowHeight)
          //       .stroke("black")
          //       .fill();
          
          //     // Draw text for each field dynamically
          //     let currentX = startX;
          //     columns.forEach((key, index) => {
          //       // Check if field is empty, and show blank if needed
          //       const fieldValue = row[key] || " ";
          
          //       doc
          //         .font(["field1", "field2", "field3"].includes(key) ? font : fontBold) // Bold for all except specified fields
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(fieldValue, currentX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: columnWidth,
          //         });
          
          //       // Draw vertical line after the column
          //       doc.strokeColor("black").lineWidth(0.5);
          //       doc
          //         .moveTo(currentX + columnWidth, startY)
          //         .lineTo(currentX + columnWidth, startY + rowHeight)
          //         .stroke();
          
          //       currentX += columnWidth;
          //     });
          
          //     // Move to the next row position
          //     startY += rowHeight;
          //   });
          // }
      
          // const impactTable = [
          //   { field1: "Impact of change in the reference benchmark (for 25 bps change in ‘R’, change in:)", field2: "EPI",field3: "No. of EPIs" },
          //   { field1: "", field2: "14749 ",field3: "61" },
          // ];
            
          // impactTableFunction(impactTable);
      
      
          // function chargesTableFunction(tableData) {
          //   const startX = 50;
          //   let startY = doc.y + 10;
          //   const totalWidth = 500; // Total table width
          
          //   // Set the number of columns explicitly (3 columns)
          //   const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
          
          //   // Calculate dynamic column width based on the number of columns
          //   const columnWidth = totalWidth / columns.length;
          
          //   tableData.forEach((row, rowIndex) => {
          //     // Set default row height
          //     let rowHeight = 15;
          
          //     // Calculate the height for each field dynamically
          //     const fieldHeights = columns.map((key) => {
          //       return doc
          //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for specified fields
          //         .fontSize(7.2)
          //         .heightOfString(row[key] || "", { width: columnWidth });
          //     });
          
          //     // Determine the maximum height between all fields
          //     rowHeight = Math.max(...fieldHeights) + 10;
          
          //     // Alternate row background color
          //     doc.lineWidth(0.5);
          //     doc
          //       .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          //       .rect(startX, startY, totalWidth, rowHeight)
          //       .stroke("black")
          //       .fill();
          
          //     // Draw text for each field dynamically
          //     let currentX = startX;
          //     columns.forEach((key, index) => {
          //       // Check if field is empty, and show blank if needed
          //       const fieldValue = row[key] || " ";
          
          //       doc
          //         .font(["field1", "field2", "field3", "field4"].includes(key) ? font : fontBold) // Bold for all except specified fields
          //         .fillColor("black")
          //         .fontSize(7.2)
          //         .text(fieldValue, currentX + 5, startY + 5, {
          //           baseline: "hanging",
          //           width: columnWidth,
          //         });
          
          //       // Draw vertical line after the column
          //       doc.strokeColor("black").lineWidth(0.5);
          //       doc
          //         .moveTo(currentX + columnWidth, startY)
          //         .lineTo(currentX + columnWidth, startY + rowHeight)
          //         .stroke();
          
          //       currentX += columnWidth;
          //     });
          
          //     // Move to the next row position
          //     startY += rowHeight;
          //   });
          // }
          
          // const chargesTable = [
          //   { field1: "8", field2: "Fee/ Charges" },
          //   { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
          // ];
          
          // chargesTableFunction(chargesTable);
      
      //     function generateFeeChargesTableFromThirdRow(doc, tableData) {
      //       const startX = 50; // Starting X-coordinate
      //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
      //       const columnWidths = [80, 150, 75, 70, 65, 63]; // Widths for six columns
        
      //       tableData.forEach((row, rowIndex) => {
      //           // Set default row height
      //           let rowHeight = 15;
        
      //           // Dynamically calculate the height of each cell's content
      //           const cellHeights = Object.keys(row).map((key, index) => {
      //               return doc
      //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
      //                   .fontSize(8)
      //                   .heightOfString(row[key] || "", { width: columnWidths[index] - 10 });
      //           });
        
      //           rowHeight = Math.max(...cellHeights) + 10;
        
      //           // Alternate row background color
      //           doc.lineWidth(0.5);
      //           doc
      //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
      //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
      //               .stroke("black")
      //               .fill();
        
      //           // Draw cell contents and vertical borders
      //           let currentX = startX;
      //           Object.keys(row).forEach((key, index) => {
      //               doc
      //                   .font(["col1", "col2", "col3", "col4", "col5", "col6"].includes(key) ? "Helvetica" : "Helvetica")
      //                   .fontSize(8)
      //                   .fillColor("black")
      //                   .text(row[key] || "", currentX + 5, startY + 5, {
      //                       width: columnWidths[index] - 10,
      //                       baseline: "hanging",
      //                       align: "left",
      //                   });
        
      //               // Draw vertical lines for columns
      //               doc.strokeColor("black").lineWidth(0.5);
      //               doc
      //                   .moveTo(currentX + columnWidths[index], startY)
      //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
      //                   .stroke();
        
      //               currentX += columnWidths[index];
      //           });
        
      //           // Move to the next row
      //           startY += rowHeight;
      //       });
        
      //       // Ensure table border ends properly
      //       doc.stroke();
      //   }
      
      //   const tableData = [
      //     {
      //       col1: "",
      //       col2: "",
      //       col3: "One-time/Recurring",
      //       col4: "Amount (in₹) or Percentage(%) asapplicable",
      //       col5: "One-time/Recurring",
      //       col6: "Amount (in ₹) or Percentage(%) as applicable",
      //   },
      //     {
      //         col1: "(i)",
      //         col2: "Processing fees",
      //         col3: "One time",
      //         col4: "11800",
      //         col5: "One time",
      //         col6: "3930",
      //     },
      //     {
      //         col1: "(ii)",
      //         col2: "Insurance charges",
      //         col3: "One time",
      //         col4: "3930",
      //         col5: "",
      //         col6: "",
      //     },
      //     {
      //         col1: "(iii)",
      //         col2: "Valuation fees",
      //         col3: "One time",
      //         col4: "0",
      //         col5: "",
      //         col6: "",
      //     },
      //     {
      //         col1: "(iv)",
      //         col2: "Any other (please specify)",
      //         col3: "Documentation Charges, CERSAI Charges",
      //         col4: "11800",
      //         col5: "",
      //         col6: "",
      //     },
      // ];
      
      // generateFeeChargesTableFromThirdRow(doc, tableData);
      // doc.moveDown(2.5);
      
      function generateFeeChargesTableFromThirdRowtenv(doc,tableDatatenv) {
        const startX = 50; // Starting X-coordinate
        let startY = doc.y + 10; // Starting Y-coordinate
        const columnConfigurations = [
            [80, 270, 153], // First row: Three columns
            [80, 423],      // Second row: Two columns
            [80, 200, 222], // Rows 3 to 7: Three columns
        ];
      
        tableDatatenv.forEach((row, rowIndex) => {
            // Determine the column configuration for the current row
            const columnWidths = columnConfigurations[row.configurationIndex];
            
            // Set default row height
            let rowHeight = 15;
      
            // Dynamically calculate the height of each cell's content
            const cellHeights = row.columns.map((col, index) => {
                return doc
                    .font("Helvetica")
                    .fontSize(7)
                    .heightOfString(col || "", { width: columnWidths[index] - 10 });
            });
      
            rowHeight = Math.max(...cellHeights) + 10;
      
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
                .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                .stroke("black")
                .fill();
      
            // Draw cell contents and vertical borders
            let currentX = startX;
            row.columns.forEach((col, index) => {
                doc
                    .font("Helvetica")
                    .fontSize(7)
                    .fillColor("black")
                    .text(col || "", currentX + 5, startY + 5, {
                        width: columnWidths[index] - 10,
                        baseline: "hanging",
                        align: "left",
                    });
      
                // Draw vertical lines for columns
                doc.strokeColor("black").lineWidth(0.5);
                doc
                    .moveTo(currentX + columnWidths[index], startY)
                    .lineTo(currentX + columnWidths[index], startY + rowHeight)
                    .stroke();
      
                currentX += columnWidths[index];
            });
      
            // Move to the next row
            startY += rowHeight;
        });
      
        // Ensure table border ends properly
        doc.stroke();
      }
      
      const tableDatatenv = [
      //   {
      //       configurationIndex: 0, // First row: 3 columns
      //       columns: ["9", "Annual Percentage Rate (APR) (%)", "27.88%"],
      //   },
      //   {
      //       configurationIndex: 1, // Second row: 2 columns
      //       columns: ["10", "Details of Contingent Charges (in ₹ or %, as applicable)"],
      //   },
        {
            configurationIndex: 2, // Rows 3 to 7: 3 columns
            columns: [
                "(i)",
                "Penal charges, if any, in case of delayed payment",
                "2% per month on the Outstanding Dues plus, applicable Taxes",
            ],
        },
        {
            configurationIndex: 2,
            columns: [
                "(ii)",
                "Other penal charges, if any",
                "2% per month on the Outstanding Dues plus, applicable Taxes",
            ],
        },
        {
            configurationIndex: 2,
            columns: [
                "(iii)",
                "Foreclosure charges, if applicable",
                "4% on principal outstanding (No prepayment allowed till completion of 12 months from the date of 1st disbursement). No foreclosure charges after completion of 1 year from the date of 1st disbursement if the repayment is done from owned fund. In case of balance transfer, 4% charges will be applicable.",
            ],
        },
        {
            configurationIndex: 2,
            columns: [
                "(iv)",
                "Charges for switching of loans from floating to fixed rate and vice versa",
                "Not Applicable",
            ],
        },
        {
            configurationIndex: 2,
            columns: [
                "(v)",
                "Any other charges (please specify)",
                "Not Applicable",
            ],
        },
      ];
      
      // Call the function with your doc object and table data
      generateFeeChargesTableFromThirdRowtenv(doc, tableDatatenv);
      doc.moveDown()
      doc
        .font('Helvetica-Bold')
        .fontSize(7)
        .text(`Part 2 (Other qualitative information)`,startX, doc.y, { align: "left"});
        doc.moveDown(0.1)
      
      function generateThreeColumnTable(doc, tableDatatab) {
        const startX = 50; // Starting X-coordinate
        let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
        const columnWidths = [61, 210, 230] // Widths for the three columns
      
        tableDatatab.forEach((row, rowIndex) => {
            // Set default row height
            let rowHeight = 15;
      
            // Dynamically calculate the height of each cell's content
            const cellHeights = row.columns.map((col, index) => {
                return doc
                    .font("Helvetica")
                    .fontSize(7)
                    .heightOfString(col || "", { width: columnWidths[index] - 10 });
            });
      
            rowHeight = Math.max(...cellHeights) + 10;
      
            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
                .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
                .stroke("black")
                .fill();
      
            // Draw cell contents and vertical borders
            let currentX = startX;
            row.columns.forEach((col, index) => {
                doc
                    .font("Helvetica")
                    .fontSize(7)
                    .fillColor("black")
                    .text(col || "", currentX + 5, startY + 5, {
                        width: columnWidths[index] - 10,
                        baseline: "hanging",
                        align: "left",
                    });
      
                // Draw vertical lines for columns
                doc.strokeColor("black").lineWidth(0.5);
                doc
                    .moveTo(currentX + columnWidths[index], startY)
                    .lineTo(currentX + columnWidths[index], startY + rowHeight)
                    .stroke();
      
                currentX += columnWidths[index];
            });
      
            // Move to the next row
            startY += rowHeight;
        });
      
        // Ensure table border ends properly
        doc.stroke();
      }
      
      const tableDatatab = [
      {
          columns: [
              "1", 
              "Clause of Loan agreement relating to engagement of recovery agents",
              "Annexure II – Clause 1"
          ],
      },
      {
          columns: [
              "2", 
              "Clause of Loan agreement which details grievance redressal mechanism",
              "Annexure II – Clause 2"
          ],
      },
      {
          columns: [
              "3", 
              "Phone number and email id of the nodal grievance redressal officer",
              `1. Ratnaafin Capital Private Limited
      Grievance Officer: Mr. Bhavesh Patel
      Designation: VP-Operations
      
      For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
      
      2. Fin Coopers Capital Private Limited
      Grievance Officer: Shakti Singh
      
      For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
          ],
      },
      ];
      
      generateThreeColumnTable(doc, tableDatatab);
      
      function generateDynamicTable(doc, tableDatady, columnWidths) {
      const startX = 50; // Starting X-coordinate
      let startY = doc.y + 10; // Starting Y-coordinate
      
      tableDatady.forEach((row, rowIndex) => {
        const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
        if (!Array.isArray(rowWidths)) {
            console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
            return;
        }
      
        let rowHeight = 15;
      
        // Dynamically calculate the height of each cell's content
        const cellHeights = row.map((col, index) => {
            const width = rowWidths[index] || 0; // Default to 0 if width is missing
            return doc
                .font("Helvetica")
                .fontSize(7)
                .heightOfString(col || "", { width: width - 10 });
        });
      
        // Use the maximum height for the row
        rowHeight = Math.max(...cellHeights, 15) + 10;
      
        // Draw the row background
        doc.lineWidth(0.5);
        doc
            .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
            .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
            .stroke("black")
            .fill();
      
        // Draw each cell in the row
        let currentX = startX;
        row.forEach((col, index) => {
            const width = rowWidths[index] || 0;
            doc
                .font("Helvetica")
                .fontSize(7)
                .fillColor("black")
                .text(col || "", currentX + 5, startY + 5, {
                    width: width - 10,
                    align: "left",
                });
      
            // Draw column borders
            doc.strokeColor("black").lineWidth(0.5);
            doc
                .moveTo(currentX + width, startY)
                .lineTo(currentX + width, startY + rowHeight)
                .stroke();
      
            currentX += width;
        });
      
        startY += rowHeight; // Move to the next row
      });
      
      // Draw table border
      // doc.stroke();
      }
      const tableDatady = [
      ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
      ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
      ["Name of the originating RE, along with its fund", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
      ["Fin Coopers Capital Pvt Ltd-0%", "Ratnaafin Capital Pvt Ltd-100%", `${allPerameters.interestRate}%`],
      ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
      ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
      ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
      ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
      ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
      ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
          `Fin Coopers Capital Private Limited:
      Website: https://www.fincoopers.com/
      Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
      Email ID: INFO@FINCOOPERS.COM
      Contact No.: 07314902200`]
      ];
      
      const columnWidths = [
      // [50, 245, 200], // Row 1
      // [50, 445],      // Row 2
      // [165, 165, 165],// Row 3
      // [165, 165, 165],// Row 4
      // [50, 445],      // Row 5
      // [247, 248],     // Row 6
      // [247, 248]      // Row 7
      // [50, 325, 120], // Row 1
      // [50, 445],      // Row 2
      // [165, 165, 165],// Row 3
      // [165, 165, 165],// Row 4
      // [50, 445],      // Row 5
      // [245, 250],     // Row 6
      // [245, 249],     // Row 7
      // [50, 447],      // Row 8
      // [245, 250],     // Row 9
      // [245, 250]      //
      [50, 325, 128],  // Row 1
      [50, 453],       // Row 2
      [165, 165, 173], // Row 3
      [165, 165, 173], // Row 4
      [50, 453],       // Row 5
      [245, 258],      // Row 6
      [245, 258],      // Row 7
      [50, 453],       // Row 8
      [245, 258],      // Row 9
      [245, 258]       // Row 10
      
      ];
      
      // Call the function
      generateDynamicTable(doc, tableDatady, columnWidths);
      
      
      
          
      // addFooter()
      
          // { field1: "", field2: "",field3A: "One-time/Recurring", field3B:"Amount (in ₹) or Percentage (%) as applicable",field4A: "One-time/Recurring",field4B: "One-time/Recurring", },
        
          // doc.addPage();
          // addLogo();
          // drawBorder();
          // doc.moveDown(7);
      
      //     function generateThreeColumnTable(doc, tableDatatab) {
      //       const startX = 50; // Starting X-coordinate
      //       let startY = doc.y + 10; // Starting Y-coordinate (adjusted for the new table section)
      //       const columnWidths = [50, 210, 230] // Widths for the three columns
        
      //       tableDatatab.forEach((row, rowIndex) => {
      //           // Set default row height
      //           let rowHeight = 15;
        
      //           // Dynamically calculate the height of each cell's content
      //           const cellHeights = row.columns.map((col, index) => {
      //               return doc
      //                   .font("Helvetica")
      //                   .fontSize(8)
      //                   .heightOfString(col || "", { width: columnWidths[index] - 10 });
      //           });
        
      //           rowHeight = Math.max(...cellHeights) + 10;
        
      //           // Alternate row background color
      //           doc.lineWidth(0.5);
      //           doc
      //               .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
      //               .rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), rowHeight)
      //               .stroke("black")
      //               .fill();
        
      //           // Draw cell contents and vertical borders
      //           let currentX = startX;
      //           row.columns.forEach((col, index) => {
      //               doc
      //                   .font("Helvetica")
      //                   .fontSize(8)
      //                   .fillColor("black")
      //                   .text(col || "", currentX + 5, startY + 5, {
      //                       width: columnWidths[index] - 10,
      //                       baseline: "hanging",
      //                       align: "left",
      //                   });
        
      //               // Draw vertical lines for columns
      //               doc.strokeColor("black").lineWidth(0.5);
      //               doc
      //                   .moveTo(currentX + columnWidths[index], startY)
      //                   .lineTo(currentX + columnWidths[index], startY + rowHeight)
      //                   .stroke();
        
      //               currentX += columnWidths[index];
      //           });
        
      //           // Move to the next row
      //           startY += rowHeight;
      //       });
        
      //       // Ensure table border ends properly
      //       doc.stroke();
      //   }
      
      //   const tableDatatab = [
      //     {
      //         columns: [
      //             "1", 
      //             "Clause of Loan agreement relating to engagement of recovery agents",
      //             "Annexure II – Clause 1"
      //         ],
      //     },
      //     {
      //         columns: [
      //             "2", 
      //             "Clause of Loan agreement which details grievance redressal mechanism",
      //             "Annexure II – Clause 2"
      //         ],
      //     },
      //     {
      //         columns: [
      //             "3", 
      //             "Phone number and email id of the nodal grievance redressal officer",
      //             `1. Ratnaafin Capital Private Limited
      // Grievance Officer: Mr. Bhavesh Patel
      // Designation: VP-Operations
      
      // For any grievances in relation to the loan the customer can call / write to us at 9512011220 / grievance@ratnaafin.com.
      
      // 2. Fin Coopers Capital Private Limited
      // Grievance Officer: Shakti Singh
      
      // For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
      //         ],
      //     },
      // ];
      
      // generateThreeColumnTable(doc, tableDatatab);
      
      // function generateDynamicTable(doc, tableDatady, columnWidths) {
      //   const startX = 50; // Starting X-coordinate
      //   let startY = doc.y + 10; // Starting Y-coordinate
      
      //   tableDatady.forEach((row, rowIndex) => {
      //       const rowWidths = columnWidths[rowIndex] || []; // Fallback to an empty array
      //       if (!Array.isArray(rowWidths)) {
      //           console.error(`Invalid rowWidths at index ${rowIndex}:`, rowWidths);
      //           return;
      //       }
      
      //       let rowHeight = 15;
      
      //       // Dynamically calculate the height of each cell's content
      //       const cellHeights = row.map((col, index) => {
      //           const width = rowWidths[index] || 0; // Default to 0 if width is missing
      //           return doc
      //               .font("Helvetica")
      //               .fontSize(8)
      //               .heightOfString(col || "", { width: width - 10 });
      //       });
      
      //       // Use the maximum height for the row
      //       rowHeight = Math.max(...cellHeights, 15) + 10;
      
      //       // Draw the row background
      //       doc.lineWidth(0.5);
      //       doc
      //           .fillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F5F5F5")
      //           .rect(startX, startY, rowWidths.reduce((a, b) => a + b, 0), rowHeight)
      //           .stroke("black")
      //           .fill();
      
      //       // Draw each cell in the row
      //       let currentX = startX;
      //       row.forEach((col, index) => {
      //           const width = rowWidths[index] || 0;
      //           doc
      //               .font("Helvetica")
      //               .fontSize(8)
      //               .fillColor("black")
      //               .text(col || "", currentX + 5, startY + 5, {
      //                   width: width - 10,
      //                   align: "left",
      //               });
      
      //           // Draw column borders
      //           doc.strokeColor("black").lineWidth(0.5);
      //           doc
      //               .moveTo(currentX + width, startY)
      //               .lineTo(currentX + width, startY + rowHeight)
      //               .stroke();
      
      //           currentX += width;
      //       });
      
      //       startY += rowHeight; // Move to the next row
      //   });
      
      //   // Draw table border
      //   doc.stroke();
      // }
      
      
      
      // const tableDatady = [
      //   ["4", "Whether the loan is, or in future maybe, subject to transfer to other REs or securitization (Yes/No)", "Yes"],
      //     ["5", "In case of lending under collaborative lending arrangements (e.g., co-lending/outsourcing), following additional details may be furnished: Not Applicable"],
      //     ["Name of the originating RE, along with its function", "Name of the partner RE along with its proportion of funding", "Blended rate of interest"],
      //     ["Fin Coopers Capital Pvt Ltd-0%", "Ratna Fin Capital Pvt Ltd-100%", "25%"],
      //     ["6", "In case of digital loans, following specific disclosures may be furnished: Not Applicable"],
      //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
      //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", "Not Applicable"],
      //     ["7", "In case of Non-digital loans, following specific disclosures may be furnished:"],
      //     ["(i) Cooling off/look-up period, in terms of RE’s board approved policy, during which borrower shall not be charged any penalty on prepayment of loan", "Not Applicable"],
      //     ["(ii) Details of LSP acting as recovery agent and authorized to approach the borrower", 
      //         `Fin Coopers Capital Private Limited:
      // Website: https://www.fincoopers.com/
      // Address: 174/3 Nehru Nagar, Indore, Madhya Pradesh - 452011, India.
      // Email ID: INFO@FINCOOPERS.COM
      // Contact No.: 07314902200`]
      // ];
      
      // const columnWidths = [
      //   // [50, 245, 200], // Row 1
      //   // [50, 445],      // Row 2
      //   // [165, 165, 165],// Row 3
      //   // [165, 165, 165],// Row 4
      //   // [50, 445],      // Row 5
      //   // [247, 248],     // Row 6
      //   // [247, 248]      // Row 7
      //   [50, 325, 120], // Row 1
      //     [50, 445],      // Row 2
      //     [165, 165, 165],// Row 3
      //     [165, 165, 165],// Row 4
      //     [50, 445],      // Row 5
      //     [245, 247],     // Row 6
      //     [245, 247],     // Row 7
      //     [50, 447],      // Row 8
      //     [245, 247],     // Row 9
      //     [245, 247]      //
      // ];
      
      // // Call the function
      // generateDynamicTable(doc, tableDatady, columnWidths);
      
      
        
      ////    addFooter()
          // Finalize the PDF
         
         
          function drawTableForAmotization(tableData,loanDataForTable) {
            // Some layout constants
            const PAGE_HEIGHT = doc.page.height;
            const PAGE_BOTTOM_MARGIN = doc.page.margins.bottom;
            const rowHeight = 20;
          
            // Starting X/Y positions
            let startX = 50;
            // doc.y is wherever the PDF "cursor" currently is. We'll add 10 for spacing.
            let startY = doc.y + 10;
          
            // Column widths (6 columns total):
            // Adjust these numbers as needed to fit your layout
            const columnWidths = [50, 90, 80, 90, 80, 90];
          
            // Thinner stroke for borders
            doc.lineWidth(0.2);
          
            //-----------
            // 1) FUNCTION: Draw the big "Repayment Schedule" title bar
            //-----------
            function drawScheduleTitle() {
              // This "title bar" spans across all 6 columns
              const totalTableWidth = columnWidths.reduce((acc, w) => acc + w, 0);
          
              // Draw the filled rectangle for the title
              doc
                .rect(startX, startY, totalTableWidth, rowHeight)
                .fillAndStroke('#00bfff', '#000000');
          
              // Write the title text
              doc
                .font(fontBold)
                .fillColor('black')
                .fontSize(9.5)
                .text(
                  'Repayment Schedule',
                  startX + 5,
                  startY + 5,
                  {
                    baseline: 'hanging',
                    // If you want to truly center across the entire width:
                    // width: totalTableWidth,
                    align: 'center'
                  }
                );
                startY += rowHeight + 15
                loanDataForTable.forEach((row) => {
                  // Before drawing each row, check for possible page overflow
              
                  // Current X resets for each row
                  let currentX = startX;
              
                  // Choose row fill color (e.g., always white, or alternate, etc.)
                  const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
              
                  // Column 1: Month
                  doc.fillColor(rowFillColor)
                    .rect(currentX, startY, 100, rowHeight)
                    .stroke()
                    .fill();
                  doc.font(font)
                    .fontSize(8)
                    .fillColor('black')
                    .text(String(row.field), currentX + 5, startY + 5, { baseline: 'hanging',width:100, align:"left" });
                  currentX += 100;
              
                  // Column 2: Opening Principal
                  doc.fillColor(rowFillColor)
                    .rect(currentX, startY, 100, rowHeight)
                    .stroke()
                    .fill();
                  doc.font(font)
                    .fontSize(8)
                    .fillColor('black')
                    .text(String(row.value), currentX + 5, startY + 5, { baseline: 'hanging',width:90, align:"right" });
                  currentX += 100;
          
                  // Move down to the next row
                  startY += rowHeight;
                });
          
              // Move Y down by rowHeight
              startY += rowHeight;
            }
          
            //-----------
            // 2) FUNCTION: Draw the header row with column names
            //-----------
            function drawHeaderRow() {
              // 6 columns:
              // 1) month
              // 2) openingPrincipal
              // 3) monthlyPayment
              // 4) principalPayment
              // 5) interestPayment
              // 6) remainingBalance
          
              const headers = [
                'Month',
                'Opening Principal',
                'Monthly Payment',
                'Principal Payment',
                'Interest Payment',
                'Remaining Balance'
              ];
          
              let currentX = startX;
          
              for (let i = 0; i < headers.length; i++) {
                doc
                  .rect(currentX, startY, columnWidths[i], rowHeight)
                  .fillAndStroke('#66ee79', '#000000')
                  .fill();
          
                doc
                  .font(fontBold)
                  .fontSize(9)
                  .fillColor('black')
                  .text(headers[i], currentX + 5, startY + 5, { baseline: 'hanging' });
          
                currentX += columnWidths[i];
              }
          
              // Move Y down by rowHeight
              startY += rowHeight;
            }
          
            //-----------
            // 3) FUNCTION: Check for page overflow & insert new page if needed
            //-----------
            function checkPageOverflow() {
              // If adding another row will go beyond the page bottom, do a page break:
              if (startY + rowHeight > PAGE_HEIGHT - PAGE_BOTTOM_MARGIN) {
                // Add a new page
                doc.addPage();
          
                // Your custom functions:
                addLogo();
                drawBorder();
          
                // Move down a bit after the border
                doc.moveDown(5);
          
                // Reset startY to current doc.y (top of the new page)
                startX = 50
                startY = doc.y + 10;
                doc.lineWidth(0.2);
        
          
                // Re-draw the table title and header row on the new page
                drawHeaderRow();
              }
            }
          
            //-----------
            // 4) START: Actually draw the table now
            //-----------
          
            // Draw the main "Repayment Schedule" title bar first
            drawScheduleTitle();
          
            // Then draw the header row (column titles)
            drawHeaderRow();
          
        
            // Now loop over your table data rows
            tableData.forEach((row) => {
              // Before drawing each row, check for possible page overflow
              checkPageOverflow();
          
              // Current X resets for each row
              let currentX = startX;
          
              // Choose row fill color (e.g., always white, or alternate, etc.)
              const rowFillColor = '#ffffff';  // You can alternate with #f5f5f5 if you want
          
              // Column 1: Month
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[0], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.month), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[0];
          
              // Column 2: Opening Principal
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[1], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.openingPrincipal), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[1];
          
              // Column 3: Monthly Payment
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[2], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.monthlyPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[2];
          
              // Column 4: Principal Payment
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[3], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.principalPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[3];
          
              // Column 5: Interest Payment
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[4], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.interestPayment), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[4];
          
              // Column 6: Remaining Balance
              doc.fillColor(rowFillColor)
                .rect(currentX, startY, columnWidths[5], rowHeight)
                .stroke()
                .fill();
              doc.font(font)
                .fontSize(8)
                .fillColor('black')
                .text(String(row.remainingBalance), currentX + 5, startY + 5, { baseline: 'hanging' });
              currentX += columnWidths[5];
          
              // Move down to the next row
              startY += rowHeight;
            });
            
            // Optionally, continue adding content after the table ...
          }
          
        
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(5);
         
          const loanTableData1 = calculateLoanAmortization(
            allPerameters.loanAmount,
            allPerameters.tenureinMonths,
            allPerameters.interestRate,
            "2025-01-01"
          );
          let loanDataForTable = [{
            field:"Loan Amount (Rs.)",
            value: allPerameters.loanAmount
          },
          {
            field:"Loan Tenure (Month)",
            value: allPerameters.tenureinMonths
          },
          {
            field:"ROI (%)",
            value: allPerameters.interestRate
          },
          {
            field:"EMI (Rs.)",
            value: allPerameters.emiAmount
          }]
      
          console.log(allPerameters)
          drawTableForAmotization(loanTableData1,loanDataForTable);
      
      
          doc.addPage();
          addLogo();
          drawBorder();
          doc.moveDown(5);
      
        //   function DRAWTABLE123(tableTitle, tableData) {
        //     const startX = 50;
        //     let startY = doc.y + 10;
        //     const columnWidths = [500];
        //     const indexWidth = 30;
        //     const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
        //     const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
        
        //     // Draw table title with a colored header
        //     doc.rect(startX, startY, columnWidths[0], 20).fillAndStroke('#00a7ff', "#000000");
        //     doc.font('Helvetica-Bold').fillColor('black').fontSize(9.5)
        //         .text(tableTitle, startX + 5, startY + 5, { align: 'center' });
        
        //     startY += 20; // Move down for the first row
        
        //     let sectionIndex = null; // Track the section index to span the column
        
        //     // Render each row in the table
        //     tableData.forEach((row, rowIndex) => {
        //         // Apply custom style for row 1 (title2)
                
        
        //         // Measure text height for row.field1 and row.value1
        //         const field1Height = doc.heightOfString(row.field1, { width: keyWidth - 10, fontSize: 8.3 });
        //         const value1Height = doc.heightOfString(row.value1, { width: valueWidth - 10, fontSize: 8.3 });
        
        //         // Calculate row height based on the tallest content
        //         const rowHeight = Math.max(20, field1Height, value1Height) + 10; // Adding padding for better spacing
        
        //         // Only display the index once per section, in the first row
        //         const indexLabel = row.index && sectionIndex !== row.index ? row.index : '';
        //         if (row.index) {
        //             sectionIndex = row.index; // Set current section index
        //         }
        
        //         // Draw the index in the first column (only for the first row of each section)
        //         doc.fillColor('#ffffff')
        //             .rect(startX, startY, indexWidth, rowHeight).stroke('#000000').fill(); // Stroke color set to black
        //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
        //             .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
        
        //         // Draw the key in the second column
        //         doc.fillColor('#f5f5f5')
        //             .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
        //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
        //             .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
        
        //         // Draw the value in the third column
        //         doc.fillColor('#ffffff')
        //             .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
        //         doc.font('Helvetica').fillColor('black').fontSize(7.2)
        //             .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
        
        //         // Move startY down by rowHeight for the next row
        //         startY += rowHeight;
        //     });
        // }
        
      
        function DRAWTABLE123(tableTitle, tableData) {
          const startX = 50;
          let startY = doc.y + 10;
          const columnWidths = [500];
          const indexWidth = 30;
          const keyWidth = Math.round((columnWidths[0] - indexWidth) / 3);
          const valueWidth = Math.round((columnWidths[0] - indexWidth) * 2 / 3);
        
          // Draw table title with a colored header
          doc.lineWidth(0.5); // Set a thin border for the table
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
              doc.font('Helvetica').fillColor('black').fontSize(7.2)
                  .text(indexLabel, startX + 5, startY + (rowHeight - field1Height) / 2, { width: indexWidth - 10 });
        
              // Draw the key in the second column
              doc.fillColor('#f5f5f5')
                  .rect(startX + indexWidth, startY, keyWidth, rowHeight).stroke('#000000').fill();
              doc.font('Helvetica').fillColor('black').fontSize(7.2)
                  .text(row.field1, startX + indexWidth + 5, startY + (rowHeight - field1Height) / 2, { width: keyWidth - 10 });
        
              // Draw the value in the third column
              doc.fillColor('#ffffff')
                  .rect(startX + indexWidth + keyWidth, startY, valueWidth, rowHeight).stroke('#000000').fill();
              doc.font('Helvetica').fillColor('black').fontSize(7.2)
                  .text(row.value1, startX + indexWidth + keyWidth + 5, startY + (rowHeight - value1Height) / 2, { width: valueWidth - 10 });
        
              // Move startY down by rowHeight for the next row
              startY += rowHeight;
          });
        }
        
       
      
      
      
        const scheduleOfCharges = [
          { index: "sr.No", field1: "Particulars of Charges", value1: "Charge Details" },
      
          { index: "1", field1: "Repayment Instruction / Instrument Return Charges / PDC / ECS / NACH Bounce Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
          { index: "2", field1: "Repayment Mode Swap Charges", value1: "Rs.750/- Per Instance (Plus GST as applicable)" },
          { index: "3", field1: "Penal Charges", value1: "- 2% per month on the overdue amount plus applicable taxes in the event of default in repayment of loan installments\n- 2% per month on the outstanding loan facility amount plus applicable taxes for non-compliance of agreed terms and conditions mentioned in the Sanction Letter" },
          { index: "4", field1: "Duplicate Statement Issuance Charges (SOA / RPS)", value1: "Free once in a Financial Year. Rs.250/- (Plus GST as applicable)" },
          { index: "5", field1: "Cheque / NACH Representation Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
          { index: "6", field1: "Duplicate Amortization Schedule Issuance Charges", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
          { index: "7", field1: "Document Retrieval Charges", value1: "Rs.500/- Per Instance per set (Plus GST as applicable)" },
          { index: "8", field1: "Charges for Subsequent Set of Photocopy of Loan Agreement/Documents Were Requested by Borrower", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
          { index: "9", field1: "Stamp Duty Charges", value1: "As applicable in the state stamp act" },
          { index: "10", field1: "Prepayment Charges", value1: "No prepayment allowed till completion of 12 months from the date of 1st disbursement. After completion of 12 months from the date of 1st disbursement, prepayment from personal funds may be made without incurring any fees. In case of balance transfer, 4% charges will be applicable." },
          { index: "11", field1: "Foreclosure Charges", value1: "In case of foreclosure of Loan from Owned Funds, no Foreclosure Charges will be applicable. In case of balance transfer, 4% of the Outstanding Principal Amount will be applicable." },
          { index: "12", field1: "Administrative Charges / Processing Fees & Other Charges", value1: "Nil" },
          { index: "13", field1: "Charges for Duplicate NOC / No Due Certificate", value1: "Rs.250/- Per Instance per set (Plus GST as applicable)" },
          { index: "14", field1: "Charges for Revalidation NOC", value1: "Rs. 250/- Per Instance per set (Plus GST as applicable)" },
          { index: "15", field1: "Cersai Charge", value1: "- When facility amount is equal to Rs. 5 Lacs or lesser, Rs. 50 plus GST\n- When facility amount is greater than Rs.5 Lacs, Rs. 100 plus GST" },
          { index: "16", field1: "Login Fees", value1: "Rs.1950/- (Inclusive of all Applicable Taxes)" },
          { index: "17", field1: "Processing Fees", value1: "2% of loan amount + Applicable taxes" },
          { index: "18", field1: "Documentation Charges", value1: "2% of loan amount + Applicable taxes (For under construction cases 3% of loan amount + Applicable taxes)" },
          { index: "19", field1: "Issuance of Duplicate Income Tax Certificate", value1: "NIL" },
          { index: "20", field1: "Legal / Collections / Vehicle Storage / Repossession and Incidental Charges", value1: "As per Actuals" }
        ];
      
        DRAWTABLE123("Schedule of Charges (MITC)", scheduleOfCharges);
      
      
      
          doc.end();
        
      
          // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
          // doc.pipe(fs.createWriteStream(pdfPath));
          
        //   const objData = {
        //     fileName: pdfFileUrl,
        //     // file: doc.toString('base64')
        //  }
        //   await initESign(objData)
        
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
  


const sectionLatter = async(customerId) =>{

    try {
      // console.log(customerId,"in sanction latter") cibilModel finalsanctionModel
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
      const bankKycsDEtails = await bankDeatilsKycs.findOne({ customerId });
      const internalLegalDATA = await internalLegalModel.findOne({ customerId });



      const address = [
        applicantDetails?.localAddress?.addressLine1,
        // applicantDetails?.permanentAddress?.addressLine2,
        // applicantDetails?.permanentAddress?.city,
        // applicantDetails?.permanentAddress?.district,
        // applicantDetails?.permanentAddress?.state,
        // applicantDetails?.permanentAddress?.pinCode
      ].filter(Boolean).join(', ');

      const KAndA = [
        applicantDetails?.fullName||"",
        coApplicantDetails[0]?.fullName||"",
        coApplicantDetails[1]?.fullName||"",
        guarantorDetails?.fullName||""
      ].filter(Boolean).join(', ');

      // console.log("KAndA",KAndA)
      const bankDetail = bankKycsDEtails?.bankDetails?.find(
        (detail) => detail.E_Nach_Remarks === "true"
      ) || {}; // Default to an empty object if no bank details are found
  
      const bankDetails = {
        bankName: bankDetail?.bankName || "NA",
        branchName: bankDetail?.branchName || "NA",
        accNo: bankDetail?.accountNumber || "NA",
        accType: bankDetail?.accountType || "NA",
        ifscCode: bankDetail?.ifscCode || "NA",
      };      
      const formatDate = (dob) => {
        if (!dob) return "NA"; 
        const date = new Date(dob); // Date object me convert kare
        const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
        const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
        return `${day}-${month}-${year}`; // Final format
    };

    const emiAmounts  = finalsanctionDetails?.emiAmount;
     const roundEmi = Math.round(emiAmounts);

     const endusofloan = finalsanctionDetails?.EndUseOfLoan;
     const purpose = await endUseOfLoanModeldata.findById( endusofloan );
     const loanPurpose = purpose?.name;


      const allPerameters = {
        sellerName:internalLegalDATA?.sellerName||"NA",
        buyerName:internalLegalDATA?.buyerName||"NA",

        processingfees:disbuDetail?.kfsDetails?.processingFees || "NA",//page no.1
        insuranceCharges:disbuDetail?.kfsDetails?.insuranceCharges || "NA",//page no.1
        docCharges:disbuDetail?.kfsDetails?.documentsCharges || "NA",//page no.1
        cersaiCharges:disbuDetail?.kfsDetails?.cersaiCharges || "NA",//page no.1
        pENDENCYlOANnumber:sanctionPendencyDetails?.partnerLoanNo|| "NA",//page no.1
        sanctionpendencyDate:formatDate(sanctionPendencyDetails?.sanctionDate) || "NA",//page no.1
        customerName : applicantDetails?.fullName || "NA",//page no.1
        address : address,
        KAndA: KAndA,
        customerID: sanctionPendencyDetails?.partnerCustomerId|| "NA",
        loanBorrowerName : applicantDetails?.fullName || "NA",
        loanCoborrowerName : coApplicantDetails[0]?.fullName || "NA" ,
        loanCoborrowerNameTwo : coApplicantDetails[1]?.fullName || "NA" ,
        loanGuarantorName : guarantorDetails?.fullName || "NA",
        product :  "Agri Micro Loan Against Property",
        loanAmount :finalsanctionDetails?.finalLoanAmount|| "NA",
        loanAmountinwords :finalsanctionDetails?.loanAmountInWords|| "NA",
        tenureinMonths: finalsanctionDetails?.tenureInMonth||"NA",
        emiAmount:roundEmi|| "NA",
        interestRate : finalsanctionDetails?.roi || "NA",//roi
        interestType : disbuDetail?.kfsDetails?.SpreadInterestRate||"NA",//cam
        annualPercentageRateAprPercentage: disbuDetail?.kfsDetails?.annualPercentageRateAprPercentage||"NA",//cam
        epi:disbuDetail?.kfsDetails?.epi||"NA",//cam
        noOfEpi:disbuDetail?.kfsDetails?.noOfEpi||"NA",//cam
        prepaymentCharges : "NA",
        PURPOSEoFlOAN:loanPurpose|| "NA",
        penalCharges: "2 % per month on the overdue amount plus applicable Taxes in the event of default in repayment of loan instalments.\n\n 2 % per month on the outstanding loan facility amount plus applicable taxes\n for non-compliance of agreed terms and conditions mentioned in the\n Sanction Letter.",
        DSRA : "NIL",
        emiPaymentBank : bankDetails?.bankName || 'NA',
        emiaccNumber: bankDetails?.accNo || "NA",
        modeOfPayment: "NACH",
        loginFees: `Rs. 1950 /- (Inclusive of Applicable Taxes)`,//page 2
        nonRefundableProcessingFee:"2% of loan amounts + Applicable taxes",
        documentationCharges:"2% of loan amounts + Applicable taxes (For under construction cases 3 % of Loan amount + Applicable taxes)",
        stampDutyCharges: "As applicable and to be borne by the Customer",
        lifeInsurancePremiumForIndividual:"Life Insurance is mandatory and the premium is to be borne by customer.",
        insurancePremiumForCollateralSecurity:"Not Applicable",
        borrowersName: applicantDetails?.fullName || "NA",// page 3
        coBorrowersName: coApplicantDetails[0]?.fullName || "NA",
        coBorrowersNameTwo: coApplicantDetails[1]?.fullName || "NA",
        guarantorsName : guarantorDetails?.fullName || "NA",
        specialTermsConditionOne: `Repayment to be taken from ${bankDetail?.bankName} - saving account of M/s ${bankDetail?.acHolderName}  – A/c No.${bankDetail?.accountNumber}`,
        AddressDetails: technicalDetails?.fullAddressOfProperty || "NA",//page 4
        propertyOwner: technicalDetails?.nameOfDocumentHolder || "NA",
        SecurityDetailsArea: `Land Area - ${technicalDetails?.totalLandArea}`,
        Construction: ` ${technicalDetails?.totalBuiltUpArea} __ Sq. Ft`
      }
        // const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
        // console.log("pdfPath", pdfPath);
        // console.log("http://localhost:5500" + pdfPath);
    
        // if (!pdfPath) {
        //  console.log("Error generating the Sanction Letter Pdf")
        // }
        const partnerData = await finalsanctionModel.findOne({ customerId });
    
        if (!partnerData) {
          return badRequest(res, "partner's is required.");
        }
    
        let selectionData = partnerData?.pdfSelection || "acg";
        if (selectionData && typeof selectionData === "string") {
        selectionData = selectionData.toLowerCase();
        }
          console.log(selectionData,"selectionDataff")

        let pdfPath = "";

        
    if (selectionData === "acg") 
      {
         pdfPath = await ratannaFinSanctionLetterPdf1(allPerameters );
              console.log(pdfPath, "applicant");
      } 
      else if (selectionData === "accg") 
      {
         pdfPath = await ratannaFinSanctionLetterPdf(allPerameters );
        console.log(pdfPath, "coapplicant");
      } 
      else if (selectionData === "acc")
      {
         pdfPath = await ratannaFinSanctionLetterPdf2(allPerameters );
        console.log(pdfPath, "gaurantor");
      }
       else if (selectionData === "ac")
     {
        pdfPath = await ratannaFinSanctionLetterPdf3(allPerameters );
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

        const uploadResponse = await uploadPDFToBucket(pdfPath, `Ratna_SanctionLatter${Date.now()}.pdf`);
        const url = uploadResponse.url
        console.log(url,"url")    
        
        
        await finalsanctionModel.findOneAndUpdate(
          { customerId }, // Query to find the specific customer document
          {
            $set: { "ratnaPdfUrls.sectionLatter": url } // Dot notation for nested update
          },
        { new: true, upsert: false } // Options: Return the updated document, don't create a new one
      );
      
        console.log(pdfPath,"sanction pdfpath")
        // return pdfPath
        // success(res, "PDF generated successfully", pdfPath);
        // return pdfPath
        return (
          {
            SANCTION_LETTER:url,
        });
        // success(res, "PDF generated successfully", pdfPath);
        console.log(pdfPath,"pdfPath pdfPath")
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


// const sectionLatter = async(req,res) =>{
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//           return serverValidation({
//             errorName: "serverValidation",
//             errors: errors.array(),
//           });
//         }
    
//    const customerDetails = await customerModel.findOne({})     
    
//         const pdfPath = await ratannaFinSanctionLetterPdf(req);
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
    sectionLatter
}