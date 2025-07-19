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
  const watermarklogo = path.join(
    __dirname,
    "../../../../assets/image/watermarklogo.png"
  );
  const customerModel = require('../model/customer.model.js')
  const coApplicantModel = require('../model/co-Applicant.model')
  const guarantorModel = require('../model/guarantorDetail.model')
  const applicantModel = require('../model/applicant.model')
  const technicalModel = require('../model/branchPendency/approverTechnicalFormModel')
  const appPdcModel = require('../model/branchPendency/appPdc.model')
  const { initESign } = require('../services/legality.services.js')
  const creditPdModel = require('../model/credit.Pd.model')


  
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
    const baseDir = path.join("./uploads/");
    const outputDir = path.join(baseDir, "pdf/");
  
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
    const pdfFilename = `rcplLoanAggrement.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
  
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
  
    doc.pipe(stream);
  
    // Add logo and border to the first page
    addLogo();
    //   addWatermark();
    drawBorder();
  
    // Title styling for OFFER LETTER in uppercase and underlined
    doc.moveDown(6);
    const yPosition = doc.y; // Get the current y position
  
    doc
      .fontSize(7)
      .font(fontBold)
      .text("Schedule", { align: "center" })
      .moveDown(1)
      .text("(Forming part & parcel of Agreement)", { align: "center" })
      .moveDown(1)
      .text(` DATED : 10/10/2024 \n\n Place of Agreement : Indore \n\n Location of the Lender’s Office/Branch : Indore` , { align: "left" })
    
    doc.moveDown(4);

    doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .text("Borrower(s) Details", { align: "left" })
    .moveDown(0.5)
    // Add a function to draw black table borders
    function drawTable(tableData) {
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500]; // Total width for the table
        const keyWidth = Math.round((columnWidths[0] * 1) / 2); // Half width for field names
        const valueWidth = Math.round((columnWidths[0] * 1) / 2); // Half width for values
        
        // Function to draw a block for borrower details
        function drawBorrowerBlock(borrowerData) {
            borrowerData.forEach((row, rowIndex) => {
                let valueRowHeight = 20; // Set height for each row
    
                // Check if it's a special row like "Borrower/Security Provider Details" or "Guarantor"
                if (row.field1 === "Borrower/Security Provider Details" || row.field1 === "Guarantor") {
                    // Draw a full-width row (horizontal lines only)
                    doc.lineWidth(0.5)
                        .fillColor("#f5f5f5")
                        .rect(startX, startY, keyWidth + valueWidth, valueRowHeight) // Full-width
                        .strokeColor("black")
                        .lineWidth(0.5)
                        .moveTo(startX, startY) // Top horizontal line
                        .lineTo(startX + keyWidth + valueWidth, startY)
                        .stroke()
                        .moveTo(startX, startY + valueRowHeight) // Bottom horizontal line
                        .lineTo(startX + keyWidth + valueWidth, startY + valueRowHeight)
                        .stroke()
                        .fill();
    
                    // Draw text across the full width
                    doc.font(font)
                        .fillColor("black")
                        .fontSize(7.2)
                        .text(row.field1, startX + 5, startY + 5, {
                            baseline: "hanging",
                            width: keyWidth + valueWidth // Full width for text
                        });
                } else {
                    // Draw field background (for regular fields like 'Name', 'Residence Address', etc.)
                    doc.lineWidth(0.5)
                        .fillColor("#f5f5f5")
                        .rect(startX, startY, keyWidth, valueRowHeight)
                        .strokeColor("black")
                        .moveTo(startX, startY) // Top horizontal line for field name
                        .lineTo(startX + keyWidth, startY)
                        .stroke()
                        .moveTo(startX, startY + valueRowHeight) // Bottom horizontal line for field name
                        .lineTo(startX + keyWidth, startY + valueRowHeight)
                        .stroke()
                        .fill();
    
                    // Draw field name (half-width)
                    doc.font(font)
                        .fillColor("black")
                        .fontSize(7.2)
                        .text(row.field1, startX + 5, startY + 5, {
                            baseline: "hanging",
                            width: keyWidth
                        });
    
                    // Draw value background (half-width for value)
                    doc.fillColor("#ffffff")
                        .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
                        .strokeColor("black")
                        .moveTo(startX + keyWidth, startY) // Top horizontal line for value
                        .lineTo(startX + keyWidth + valueWidth, startY)
                        .stroke()
                        .moveTo(startX + keyWidth, startY + valueRowHeight) // Bottom horizontal line for value
                        .lineTo(startX + keyWidth + valueWidth, startY + valueRowHeight)
                        .stroke()
                        .fill();
    
                    // Draw value text (half-width)
                    doc.font(font)
                        .fillColor("black")
                        .fontSize(7.2)
                        .text(row.value1 || "", startX + keyWidth + 5, startY + 5, {
                            baseline: "hanging",
                            width: valueWidth
                        });
                }
    
                // Move to next row
                startY += valueRowHeight;
            });
    
            // Add spacing after each borrower block
            startY += 10;
        }
    
        // Filter and group data for each borrower block
        const borrowerBlocks = [];
        let currentBlock = [];
    
        tableData.forEach(row => {
            if (row.field1.includes("Borrower/Security Provider Details") || row.field1 === "Guarantor") {
                if (currentBlock.length > 0) {
                    borrowerBlocks.push(currentBlock);
                }
                currentBlock = [];
            }
            currentBlock.push(row);
        });
    
        if (currentBlock.length > 0) {
            borrowerBlocks.push(currentBlock);
        }
    
        // Draw each borrower block
        borrowerBlocks.forEach(borrowerData => {
            drawBorrowerBlock(borrowerData);
        });
    }
    
    const loanTableData = [
        { field1: "Borrower/Security Provider Details" },
        { field1: "a) Name", value1: `${allPerameters.customerName}` },
        { field1: "b) Residence Address", value1: `${allPerameters.address}` },
        { field1: "c) Registered Office Address", value1: `${allPerameters.registeredOfficeAddress}` },
        { field1: "d) Corporate Office Address", value1: `${allPerameters.corporateOfficeAddress}` },
        { field1: "e) Email Address", value1: `${allPerameters.emailAddress}` },
        { field1: "f) Constitution", value1: `${allPerameters.constitution}` },
        { field1: "g) Unique Identity Number (PAN/CIN/Reg. No)", value1: `${allPerameters.identityNumber}` },
        { field1: "h) Type of Borrower (Main Applicant/Co-Applicant)", value1: `${allPerameters.typeOfBorrower}` },
        { field1: "i) Business or Employment of the Borrower/Security Provider", value1: `${allPerameters.securityProvider}` },
        { field1: "Borrower/Security Provider Details" },
        { field1: "a) Name", value1: `${allPerameters.coApplicantName}` },
        { field1: "b) Residence Address", value1: `${allPerameters.coResidenceAddress}` },
        { field1: "c) Registered Office Address", value1: `${allPerameters.coRegisteredOfficeAddress}` },
        { field1: "d) Corporate Office Address", value1: `${allPerameters.coCorporateOfficeAddress}` },
        { field1: "e) Email Address", value1: `${allPerameters.coEmailAddress}` },
        { field1: "f) Constitution", value1: `${allPerameters.coConstitution}` },
        { field1: "g) Unique Identity Number (PAN/CIN/Reg. No)", value1: `${allPerameters.coIdentityNumber}` },
        { field1: "h) Type of Borrower (Main Applicant/Co-Applicant)", value1: `${allPerameters.coTypeOfBorrower}` },
        { field1: "i) Business or Employment of the Borrower/Security Provider", value1: `${allPerameters.coSecurityProvider}` },
    ];
    
    // Call the drawTable function to generate the table
    drawTable(loanTableData);
    doc.moveDown(2);
  
    addFooter();
    
   
  //---------------------------------------- new page 2--------------------------------------------------
  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(7);
  
  const secondPageTable = [
    { field1: "Borrower/Security Provider Details" },
    { field1: "a) Name", value1: `${allPerameters.coApplicantNameTwo}` },
    { field1: "b) Residence Address", value1: `${allPerameters.coResidenceAddressTwo}` },
    { field1: "c) Registered Office Address", value1: `${allPerameters.coRegisteredOfficeAddressTwo}` },
    { field1: "d) Corporate Office Address", value1: `${allPerameters.coCorporateOfficeAddressTwo}` },
    { field1: "e) Email Address", value1: `${allPerameters.coEmailAddressTwo}` },
    { field1: "f) Constitution", value1: `${allPerameters.coConstitutionTwo}` },
    { field1: "g) Unique Identity Number (PAN/CIN/Reg. No)", value1: `${allPerameters.coIdentityNumberTwo}` },
    { field1: "h) Type of Borrower (Main Applicant/Co-Applicant)", value1: `${allPerameters.coTypeOfBorrowerTwo}` },
    { field1: "i) Business or Employment of the Borrower/Security Provider", value1: `${allPerameters.coSecurityProviderTwo}` },
    { field1: "Borrower/Security Provider Details" },
    { field1: "a) Name", value1: `${allPerameters.coApplicantNameThree}` },
    { field1: "b) Residence Address", value1: `${allPerameters.coResidenceAddressThree}` },
    { field1: "c) Registered Office Address", value1: `${allPerameters.coRegisteredOfficeAddressThree}` },
    { field1: "d) Corporate Office Address", value1: `${allPerameters.coCorporateOfficeAddressThree}` },
    { field1: "e) Email Address", value1: `${allPerameters.coEmailAddressThree}` },
    { field1: "f) Constitution", value1: `${allPerameters.coConstitutionThree}` },
    { field1: "g) Unique Identity Number (PAN/CIN/Reg. No)", value1: `${allPerameters.coIdentityNumberThree}` },
    { field1: "h) Type of Borrower (Main Applicant/Co-Applicant)", value1: `${allPerameters.coTypeOfBorrowerThree}` },
    { field1: "i) Business or Employment of the Borrower/Security Provider", value1: `${allPerameters.coSecurityProviderThree}` },
    { field1: "Guarantor" },
    { field1: "a) Name", value1: `${allPerameters.guarantorName}` },
    { field1: "b) Residence Address", value1: `${allPerameters.guarantorAddress}` },
    { field1: "c) Registered Office Address", value1: `${allPerameters.guarantorRegisteredOfficeAddress}` },
    { field1: "d) Corporate Office Address", value1: `${allPerameters.guarantorCorporateOfficeAddress}` },
    { field1: "e) Email Address", value1: `${allPerameters.guarantorEmailAddress}` },
    { field1: "f) Constitution", value1: `${allPerameters.guarantorConstitution}` },
    { field1: "g) Unique Identity Number (PAN/CIN/Reg. No)", value1: `${allPerameters.guarantorIdentityNumber}` },
    { field1: "h) Type of Borrower (Main Applicant/Co-Applicant)", value1: `${allPerameters.guarantorTypeOfBorrower}` },
    { field1: "i) Business or Employment of the Borrower/Security Provider", value1: `${allPerameters.guarantorSecurityProvider}` },
  ];
  drawTable(secondPageTable);
  doc.moveDown(2);
  addFooter();
  
//   // ------------------------------------- new page 3-------------------------------------------------
  
  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(9);

function newTable(tableData) {
    const startX = 50;
    let startY = doc.y + 10;
    const columnWidths = [500];

    const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    const valueWidth = Math.round((columnWidths[0] * 1) / 2);

    tableData.forEach((row, rowIndex) => {
        doc.lineWidth(0.5);

        const valueText = row.value1 || "";
        const isFullWidthRow = row.field1 === "Details of the Loan/Credit Facility" || row.field1.startsWith("Payment Instrument(s)");
        
        // Calculate row height to accommodate multiline text
        let rowWidth = isFullWidthRow ? columnWidths[0] : valueWidth;

        // Set specific height for "Payment Instrument(s)" row
        let rowHeight;
        if (row.field1.startsWith("Payment Instrument(s)")) {
            // Increase height for this specific row
            rowHeight = doc.heightOfString(valueText, { width: rowWidth, font: font, align: 'left' }) + 60; // Increase height as needed
        } else {
            rowHeight = doc.heightOfString(valueText, { width: rowWidth, font: font, align: 'left' }) + 10; // Normal height for other rows
        }
        rowHeight = Math.max(rowHeight, 20); // Set a minimum height if needed

        // Draw background for the row
        doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX, startY, columnWidths[0], rowHeight)
            .stroke("black")
            .fill();

        if (isFullWidthRow) {
            // Render full-width text with wrapping
            doc.font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1 + "\n" + valueText, startX + 5, startY + 8, {
                    baseline: "top",
                    width: columnWidths[0] - 10, // Slight padding to avoid overflow
                    align: 'left',
                    height: rowHeight - 10, // Ensure the text wraps within the row height
                });
        } else {
            // Draw first column cell
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, keyWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(row.field1, startX + 5, startY + 8, {
                    baseline: "top",
                    width: keyWidth,
                    align: 'left'
                });

            // Draw second column cell with wrapping
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke("black")
                .fill();
            doc.font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(valueText, startX + keyWidth + 5, startY + 8, {
                    baseline: "top",
                    width: valueWidth - 10, // Prevent overflow by setting width constraint
                    align: 'left',
                    height: rowHeight - 10, // Ensure the text wraps within the row height
                });
        }

        // Move to the next row position
        startY += rowHeight;
    });
}
  
  const details = [
    { field1: "Purpose of the Loan/Credit Facility", value1: `WORKING CAPITAL` },
    { field1: "Details of the Loan/Credit Facility", value1: ``},
    { field1: "Loan Amount/Credit Facility", value1: `${allPerameters.loanAmount}` },
    { field1: "Security Details (Details of the Security as per Sanction Letter such as Property Address/Equipment details/Intangible Collateral, etc.)", value1:`${allPerameters.securityDetails}` },
    { field1: "Security Cover", value1: `${allPerameters.securityCover}` },
    { field1: "Tenor or Tenure of the Loan/Credit Facility", value1: `${allPerameters.tenor}` },
    { field1: "Rate of Interest", value1: `FLOATING RATE OF INTEREST \n · FIN COOPERS Reference Rate (URR): 15% p.a (per cent per annum)\n · Floating Rate of Interest(p.a.): URR + 8%=23% p.a. (per cent per annum) Review Frequency: Monthly` },
    { field1: "Sanction Letter", value1: `${allPerameters.sanctionLetterDate}` },
    { field1: "Application Fees", value1: `2% + 18% GST` },
    { field1: "Processing Fees", value1: `2% + 18% GST` },
    { field1: "CERSAI Charges", value1: `AS APPLICABLE` },
    { field1: "Late Payment Interest/Additional Interest", value1: `___% p.m. (________ per cent per month) or _____ % p.a. (_________ per cent per annum) on the Instalment overdue from the date of overdue upto the date of payment` },
    { field1: "Repayment Bank A/c Details", value1: `${allPerameters.repaymentBank}` },
    { field1: "Details of Receivables", value1: `${allPerameters.detailsOfReceivables}`, },
    { field1: "Pre-payment/Foreclosure of the Facility", value1:  `· 6% of Principal outstanding for loan foreclosed within 12 months of loan sanction \n · 4% of Principal outstanding for loan foreclosed after 12 months of loan sanction \n regulatory requirements and directions prescribed by Reserve Bank of India from time to time.` },
    { field1: "Payment Instrument(s)\n Bank Account on which the Repayment Cheques are drawn and/or EDI (Electronic Debit Instrument)/NACH are made and details thereof\n · The Repayment Cheque/NACH can be used by the FIN COOPERS for realization of delayed payment charges/Default Interest also and in such events additional cheque(s)/NACH shall be furnished to cover the balance Repayment Amount.(“Account”)\n · Repayment Cheques should be in favour of “FIN COOPERS Securities Pvt Ltd”", value1: `` },
  ];
  
  newTable(details);
  
  doc.moveDown(2)
  
  doc
  .fontSize(8)
  .font('Helvetica')
  .text("Repayment details:", { align: "left" })
  .moveDown(1)
  
  
  function repaymentFunction(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    
    // Determine the number of columns from the first row, excluding blank fields
    const validColumns = Object.keys(tableData[0]).filter((key) => {
        return tableData.some(row => row[key] !== ""); // Exclude columns that are completely blank
    });
    const columnCount = validColumns.length;

    // Set column widths (first column wider)
    const columnWidths = [150, ...Array(columnCount - 1).fill((500 - 150) / (columnCount - 1))]; // First column = 150, others share the remaining width

    // Fixed row height for all rows
    const fixedRowHeight = 20; // Adjust as needed

    // Render first column spanning all rows
    const firstColumnValue = tableData[0][validColumns[0]]; // Value to be spanned in first column
    doc.fillColor("#f5f5f5")
        .rect(startX, startY, columnWidths[0], fixedRowHeight * tableData.length) // Spans across all rows
        .stroke("black")
        .fill();

    doc.font(font)
        .fillColor("black")
        .fontSize(7.2)
        .text(firstColumnValue, startX + 5, startY + 5, {
            width: columnWidths[0] - 10, // Adjust for padding
            align: 'left',
        });

    // Render the rest of the table row by row
    tableData.forEach((row, rowIndex) => {
        doc.lineWidth(0.5);

        // Alternate row background color
        doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + columnWidths[0], startY, 500 - columnWidths[0], fixedRowHeight) // Background for other columns
            .stroke("black")
            .fill();

        // Draw the rest of the columns (starting from the second column)
        validColumns.slice(1).forEach((columnKey, colIndex) => {
            const value = row[columnKey];
            const cellWidth = columnWidths[colIndex + 1];
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + columnWidths[0] + colIndex * cellWidth, startY, cellWidth, fixedRowHeight) // For each column after the first
                .stroke("black")
                .fill();

            // Handle line breaks in the cell
            const lines = (value || "").split('\n');
            lines.forEach((line, lineIndex) => {
                doc.font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(line, startX + columnWidths[0] + colIndex * cellWidth + 5, startY + 5 + (lineIndex * 10), {
                        baseline: "hanging",
                        width: cellWidth - 10, // Adjust for padding
                    });
            });
        });

        // Move to next row position
        startY += fixedRowHeight;
    });
}

const repaymentTable = [
    { field1: "Repayment Options", filed2: "EMI", field3: "Step Up", field4: "Step Down", field5: "Structured", field6: "Balloon", field7: "Bullet" },
    { field1: "", filed2: `${allPerameters.emi}`, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
];

repaymentFunction(repaymentTable);

doc.moveDown(0.2)
const repaymentFrequencyTable = [
    { field1: "Repayment Frequency", filed2: "Monthly", field3: "Bi-monthly", field4: "Quarterly", field5: "Half Yearly", field6: "Yearly",},
    { field1: "", filed2: `${allPerameters.monthly}`, field3: ``, field4: ``, field5: ``, field6: ``,  },
];

repaymentFunction(repaymentFrequencyTable);
  
  addFooter();
  
//   //---------------------------------------- new page 4--------------------------------------------------
  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(9);


const repaymentDateTable = [
    { field1: "Repayment Cycle date", filed2: "3rd of the month ", field3: "5th of the month", field4: "10th of the month" },
    { field1: "", filed2: ``, field3: ``, field4: ``,  },
];

repaymentFunction(repaymentDateTable);
doc.moveDown(0.5);

function intrestTableFunction(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total column width
    const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
    const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

    tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;

        // Calculate the height of the text for field1 and value1
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

        // Determine the maximum height between field1 and value1 to set row height
        rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

        // Alternate row background color
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
            });

        // Draw the second column, even if value1 is absent
        doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + keyWidth, startY, valueWidth, rowHeight)
            .stroke()
            .fill();

        // Draw the key-value pair for value1 or leave it empty
        const keyValueText = row.value1 ? `${row.value1}` : ""; // Show empty text if no value
        doc
            .font(font)
            .fillColor("black")
            .fontSize(7.2)
            .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                baseline: "hanging",
                width: valueWidth,
            });

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

  
const intrestData = [
  { field1: "Pre-Instalment Interest Date(s)",value1: `${allPerameters.preInstalmentInterestDate}` },
  { field1: "Date when first instalment is due", value1: `${allPerameters.dateWhenFirstInstalment}` },
  { field1: "Total No. of Instalments", value1: `${allPerameters.totalNoOfInstalments}` },
  { field1: "Amount of each instalment", value1: `${allPerameters.amountOfEachInstalment}` },
  { field1: "Exact dates of repayment", value1: `The instalments shall be due on the repayment cycle date as mentioned above basis the frequency agreed. \n The repayment dates are subject to change depending on the Disbursement of the Facility. Exact dates of repayment shall be communicated through a detailed repayment schedule which shall be sent along with a welcome letter` },
];

intrestTableFunction(intrestData);
doc.moveDown(-0.5);

function repaymentAmountFunction(tableData) {
    // Check if tableData is not empty
    if (!Array.isArray(tableData) || tableData.length === 0 || typeof tableData[0] !== 'object') {
        console.error("Invalid table data");
        return;
    }

    const fixedRowHeight = 20; // Define fixed row height

    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;

//     // Determine the number of columns from the first row, excluding blank fields
    const validColumns = Object.keys(tableData[0]).filter((key) => {
        return tableData.some(row => row[key] !== ""); // Exclude columns that are completely blank
    });
    const columnCount = validColumns.length;

    // Set column widths (first column wider)
    const columnWidths = [150, ...Array(columnCount - 1).fill((500 - 150) / (columnCount - 1))]; // First column = 150, others share the remaining width

    // Function to calculate required height based on text content
    const calculateRowHeight = (row, isLastRow) => {
        const lineHeight = 10; // Height of each line (adjust as necessary)
        let maxHeight = 0;

        // Calculate height needed for each column in the row
        validColumns.forEach((columnKey) => {
            const value = row[columnKey] || "";
            const lines = value.split('\n');
            const cellHeight = lines.length * lineHeight + 10; // 10 for padding
            maxHeight = Math.max(maxHeight, cellHeight);
        });

        // If it's the last row, ensure we check for the height of field2 specifically
        if (isLastRow) {
            const field2Height = (row[validColumns[1]] || "").split('\n').length * lineHeight + 10;
            maxHeight = Math.max(maxHeight, field2Height);
        }

        return maxHeight;
    };

    // Render first column spanning all rows
    const firstColumnValue = tableData[0][validColumns[0]]; // Value to be spanned in first column
    doc.fillColor("#f5f5f5")
        .rect(startX, startY, columnWidths[0], fixedRowHeight * tableData.length) // Spans across all rows
        .stroke("black")
        .fill();

    doc.font(font)
        .fillColor("black")
        .fontSize(7.2)
        .text(firstColumnValue, startX + 5, startY + 5, {
            width: columnWidths[0] - 10, // Adjust for padding
            align: 'left',
        });

    // Render the rest of the table row by row
    tableData.forEach((row, rowIndex) => {
        // Calculate the height for the current row
        const isLastRow = rowIndex === tableData.length - 1; // Check if it's the last row
        const rowHeight = calculateRowHeight(row, isLastRow);
        doc.lineWidth(0.5);

        // Alternate row background color
        doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(startX + columnWidths[0], startY, 500 - columnWidths[0], rowHeight) // Background for other columns
            .stroke("black")
            .fill();

        // Check if field3 and field4 are empty
        const isField3Empty = !row[validColumns[2]]; // Check if field3 is empty
        const isField4Empty = !row[validColumns[3]]; // Check if field4 is empty

        if (isField3Empty && isField4Empty) {
            // Span field2 across the rest of the columns
            const cellWidth = columnWidths[1] + columnWidths[2] + columnWidths[3]; // Total width of field2, field3, and field4 combined
            doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + columnWidths[0], startY, cellWidth, rowHeight) // Span cell
                .stroke("black")
                .fill();

            // Draw the value for field2
            const value = row[validColumns[1]];
            const lines = (value || "").split('\n');
            lines.forEach((line, lineIndex) => {
                doc.font(font)
                    .fillColor("black")
                    .fontSize(7.2)
                    .text(line, startX + columnWidths[0] + 5, startY + 5 + (lineIndex * 10), {
                        baseline: "hanging",
                        width: cellWidth - 10, // Adjust for padding
                    });
            });
        } else {
            // Draw field2, field3, and field4 normally
            validColumns.slice(1).forEach((columnKey, colIndex) => {
                const value = row[columnKey];
                const cellWidth = columnWidths[colIndex + 1];
                doc.fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                    .rect(startX + columnWidths[0] + colIndex * cellWidth, startY, cellWidth, rowHeight) // For each column after the first
                    .stroke("black")
                    .fill();

                // Handle line breaks in the cell
                const lines = (value || "").split('\n');
                lines.forEach((line, lineIndex) => {
                    doc.font(font)
                        .fillColor("black")
                        .fontSize(7.2)
                        .text(line, startX + columnWidths[0] + colIndex * cellWidth + 5, startY + 5 + (lineIndex * 10), {
                            baseline: "hanging",
                            width: cellWidth - 10, // Adjust for padding
                        });
                });
            });
        }

        // Move to next row position
        startY += rowHeight; // Adjust starting position based on calculated row height
    });
}

const repaymentAmountTable = [
    { field1: "Total Repayment Amount", filed2: "Principal ", field3: "Total Interest*", field4: "Total repayment amount" },
    { field1: "", filed2:  `${allPerameters.loanAmount}`, field3:  `${allPerameters.totalInterest}`, field4:  `${allPerameters.totalRepaymentAmount}`, },
    { field1: "", filed2: "*The interest amount is calculated basis the ROI and Tenure of the Facility and is excluding any Pre EMI/ broken period interest that may be computed and applied basis the Disbursement date", field3: "", field4: "", },
];

// Call the function with the correct parameter
repaymentAmountFunction(repaymentAmountTable);
doc.moveDown(-1.5);
const npaTable = [
    { field1: "Default and NPA  classification",value1: `Please refer Annexure 1` },
  ];
  intrestTableFunction(npaTable);
  doc.moveDown(1.5);

  const startX = 50; // Set a left margin
  const startY = doc.y; // Get the current Y position
  
  doc
    .fontSize(8)
    .font('Helvetica')
    .text(
      `Repayment Cheques should be drawn in favour of FIN COOPERS CAPITAL Pvt Ltd\n` +
      `Schedule of Charges on the Loan / Credit Facility\n\n\n\n` +
      `Details pertaining to the Loan Application by Borrower(s) / Co-Borrower(s)\n` +
      `Received copy of Agreement along with the Schedules and Annexure thereto`, 
      startX, // Use the startX value for left alignment
      startY, // Start at the current Y position
      {
        width: 500, // Define a width for text wrapping if needed
        indent: 0, // No indentation
        paragraphGap: 10, // Space between paragraphs
      }
    );
  addFooter();

// //------------------------------------------- new page 5--------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`Annexure 1`, startX, doc.y, { align: "center", width: 500, underline:true });
doc.moveDown(2);

doc
.fontSize(9)
.font('Helvetica-Bold')
.text(`Illustration on due dates and NPA classification`, startX, doc.y, { align: "left", width: 500, underline:true });
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`If due date of a loan account is March 31, 2021, and full dues are not received before the lending institution runs the day-end process for this date, the date of overdue shall be March 31, 2021. If it continues to remain overdue, then this account shall get tagged as SMA-1 upon running day-end process on April 30, 2021 i.e. upon completion of 30 days of being continuously overdue. Accordingly, the date of SMA-1 classification for that account shall be April 30, 2021.\n\nSimilarly, if the account continues to remain overdue, it shall get tagged as SMA-2 upon running day-end process on May 30, 2021 and if continues to remain overdue further, it shall get classified as NPA upon running day-end process on June 29, 2021.`, startX, doc.y, { align: "left", width: 500,});
doc.moveDown(2);


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

    // Set normal (thin) line width
    doc.lineWidth(0.5); // Set normal border thickness

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
            // Draw rectangle for the field box with thin lines
            doc
                .fillColor("#f5f5f5") // Background color for field (empty box)
                .rect(currentX, startY, fieldWidth, rowHeight)
                .stroke("black"); // Normal border thickness

            // Set regular font for all rows, no bold for header
            doc
                .font('Helvetica') // Regular font
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
    { field1: "Status", field2: "DPD", field3: "Illustration 2", field4: "Illustration 1", field5: "Illustration 3", field6: "Illustration 4 (Leap year)" },
    { field1: "*Due date/Overdue (if not paid)", field2: ``, field3: ``, field4:``, field5:``, field6: `` },
    { field1: "SMA-1", field2: ``, field3: ``, field4: ``, field5: ``, field6: `` },
    { field1: "SMA-2", field2: ``, field3: ``, field4: ``, field5: ``, field6: `` },
    { field1: "#Non-Performing Asset", field2: ``, field3: ``, field4: ``, field5: ``, field6: `` },
];

// Call the function to create the table
tableFunction(tableData);  
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`* Any amount due to the lender under any credit facility is ‘overdue’ if it is not paid on the due date fixed by the Lender. If there is any overdue in an account, the default/ non-repayment is reported with the credit bureau companies like CIBIL etc. and the CIBIL report of the customer will reflect defaults and its classification status.\n\n# Once an account is classified as NPAs then it shall be upgraded as ‘standard’ asset only if entire arrears of interest and principal are paid by the borrower\n\nIN WITNESS WHEREOF the Parties hereto have hereunto set and execute this Agreement on the day and year as first mentioned hereinabove.`, startX, doc.y, { align: "left", width: 500,});
doc.moveDown(2);

doc
.fontSize(7)
.font('Helvetica')
.text(`For the Lender:`,startX, doc.y, { align: "left", width: 500,underline:true})
doc.moveDown(1);
doc
.fontSize(8)
.font('Helvetica')
.text(`SIGNED AND DELIVERED by the within named FIN COOPERS\nCAPITALPVT LTD`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(6)
.font('Helvetica')
.text(`________________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(7)
.font('Helvetica')
.text(`Authorised Signatory.`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(7)
.font('Helvetica')
.text(`For the Borrowers and Co-Borrowers:`,startX, doc.y, { align: "left", width: 500,underline:true})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`SIGNED AND DELIVERED by the within named “Borrowers”\nand “Co-Borrowers”`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`.1 ${allPerameters.nameOne}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`____________________________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`.2 ${allPerameters.nameTwo}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`____________________________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`.3 ${allPerameters.namethird}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`____________________________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`.4 ${allPerameters.nameFourth}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`____________________________________`,startX, doc.y, { align: "left", width: 500})



addFooter();

// // --------------------------------------------new page 6-------------------------------------------------------


doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(9)
.font('Helvetica')
.text(`Affix Revenue Stamp`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica')
.text(`DEMAND PROMISSORY NOTE`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.font('Helvetica')
.text(`To,\nThe Manager\nFIN COOPERS Capital pvt ltd\n174/3,Nehru Nagar,Indore-452011 (M.P.)`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(4);

doc
.fontSize(9)
.fillColor('gray')
.font('Helvetica')
.text(`On demand I/We and our respective heirs, representatives, executors, administrators, successors and/or permitted assigns,(jointly & severally) unconditionally promise to pay FIN COOPERS CAPITAL pvt ltd (“FIN COOPERS”, including, its successors and assigns), or order, for value received, the sum of Rs. ${allPerameters.loanAmount} along with applicable interest and charges thereon, which may from time to time be varied in accordance with the policy decision of FIN COOPERS.`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(4);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`To be signed by the Borrower(s)\n\nPlace - ${allPerameters.borrowerPlace}\n\nDATED : ${allPerameters.borrowerDate}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`______________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);
doc
.fontSize(8)
.font('Helvetica')
.text(`Authorized Signatory`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);


addFooter();


// //----------------------------------------------new page 7-----------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(3);

doc
.fontSize(8)
.font('Helvetica')
.text(`DISBURSEMENT REQUEST FORM`,startX, doc.y, { align: "center", width: 500, underline:true})
doc.moveDown(1);

function requestFunction(tableData) {
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

    // Draw the outer rectangle for the box with normal line width
    doc
        .fillColor("#f0f0f0") // Box background color
        .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
        .lineWidth(0.5) // Set thinner line width for borders
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

        // Draw rectangles for each field in the row with normal line width
        for (let field in row) {
            // Draw rectangle for the field box
            doc
                .fillColor("#f5f5f5") // Background color for field (empty box)
                .rect(currentX, startY, fieldWidth, rowHeight)
                .lineWidth(0.5) // Set thinner line width for field borders
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

    
const requestTableData = [
    { field1: "Name of Applicant", field2: `${allPerameters.customerName}`},
    { field1: "Loan ID", field2: `${allPerameters.loanId}` },
    { field1: "Disbursement Amount Request", field2: `${allPerameters.disbursementAmount}` },
    { field1: "Date by which the Disbursement is required", field2: `${allPerameters.dateDisbursementRequired}` },
    { field1: "Loan Type ", field2: `Secured Loan` },
    { field1: "LAN No", field2: `${allPerameters.lanNo}` },
];

// Call the function to create the table
requestFunction(requestTableData); 
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`DISBURSEMENT REQUEST THROUGH CHEQUE(S)/DRAFT[1](S) REQUIRED`,startX, doc.y, { align: "center", width: 500})
doc.moveDown(1);

const requiredTable = [
    { field1: "Cheque/DD in favour of Payee", field2: "Payable At", field3: "Bank Name of Payee", field4: "Savings/Current Bank Account No of Payee", field5: "Amount" },
    { field1: ``, field2: ``, field3: ``, field4: ``, field5: `` },
    { field1: ``, field2: ``, field3: ``, field4: ``, field5: `` },
    { field1: ``, field2: ``, field3: ``, field4: ``, field5: `` },
    { field1: ``, field2: ``, field3: ``, field4: ``, field5: `` },
];

// Call the function to create the table
tableFunction(requiredTable);  
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`DISBURSEMENT REQUEST THROUGH RTGS`,startX, doc.y, { align: "center", width: 500})
doc.moveDown(1);

const rtgsTableData = [
    { field1: "PARTICULARS", field2: "CUSTOMER DETAILS"},
    { field1: "Account Holder Name", field2: `${allPerameters.accountHolderName}` },
    { field1: "Bank Name", field2: `${allPerameters.nameOfBank}` },
    { field1: "Bank Address", field2: `${allPerameters.bankAddress}` },
    { field1: "Bank Account No.", field2: `${allPerameters.accountNo}` },
    { field1: "Bank Account Type", field2: `${allPerameters.accountType}` },
    { field1: "IFSC Code", field2: `${allPerameters.IFSCCode}` },
    { field1: "Customer E-Mail Address", field2: `${allPerameters.emailAddress}` },
    { field1: "For Official Use", field2: `${allPerameters.officeUse}` },
    { field1: "Amount Payable", field2: `${allPerameters.amountPayable}` },
    { field1: "Application ID", field2: `${allPerameters.applicantId}` },
    { field1: "Agreement No", field2: `${allPerameters.agrementNo}` },
];

// Call the function to create the table
requestFunction(rtgsTableData); 
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`__________________`,startX, doc.y, { align: "right", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`Signature of Operation`,startX, doc.y, { align: "right", width: 500})
doc.moveDown(-2);

doc
.fontSize(8)
.font('Helvetica')
.text(`DATED : ${allPerameters.disbursementDate}`,startX, doc.y, { align: "left", width: 500, underline:true})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`__________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`Signature of Applicant`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`__________________`,startX, doc.y, { align: "right", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`Signature of Co-Applicants`,startX, doc.y, { align: "right", width: 500})
doc.moveDown(0.5);

addFooter();

// // -------------------------------------------------new page 8------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(9);

doc
.fontSize(8)
.font('Helvetica')
.text(`REPAYMENT CHEQUE ACKNOWLEDGEMENT LETTER`,startX, doc.y, { align: "center", width: 500})
doc.moveDown(0.5);

function latterTableFunction(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const totalWidth = 500; // Total column width
    const keyWidth = Math.round(totalWidth * 0.3); // 30% of the total width
    const valueWidth = totalWidth - keyWidth; // Remaining width for the value column

    tableData.forEach((row, rowIndex) => {
        // Set default row height
        let rowHeight = 15;

        // If it's the last field, span both columns
        if (rowIndex === tableData.length - 1) {
            const fullText = `${row.field1} ${row.value1 || ''}`.trim();
            const textHeight = doc
                .font(font)
                .fontSize(7.2)
                .heightOfString(fullText, { width: totalWidth });

            rowHeight = textHeight + 10; // Add some padding

            // Alternate row background color
            doc.lineWidth(0.5);
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX, startY, totalWidth, rowHeight)
                .stroke("black")
                .fill();

            // Draw the text spanning both columns
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(fullText, startX + 5, startY + 5, {
                    baseline: "hanging",
                    width: totalWidth,
                });
        } else {
            // Calculate the height of the text for field1 and value1
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

            // Determine the maximum height between field1 and value1 to set row height
            rowHeight = Math.max(field1TextHeight, value1TextHeight) + 10;

            // Alternate row background color
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
                });

            // Draw the second column, even if value1 is absent
            doc
                .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
                .rect(startX + keyWidth, startY, valueWidth, rowHeight)
                .stroke()
                .fill();

            // Draw the key-value pair for value1 or leave it empty
            const keyValueText = row.value1 ? `Value: ${row.value1}` : ""; // Show empty text if no value
            doc
                .font(font)
                .fillColor("black")
                .fontSize(7.2)
                .text(keyValueText, startX + keyWidth + 5, startY + 5, {
                    baseline: "hanging",
                    width: valueWidth,
                });

            // Draw vertical line between the columns
            doc.lineWidth(0.5);
            doc.strokeColor("black");
            doc.moveTo(startX + keyWidth, startY);
            doc.lineTo(startX + keyWidth, startY + rowHeight);
            doc.stroke();
        }

        // Move to the next row position
        startY += rowHeight;
    });
}

const letterData = [
  { field1: "Customer Name", value1: `${allPerameters.customerName}` },
  { field1: "Address", value1: `${allPerameters.address}` },
  { field1: "Contact Nos.", value1: `${allPerameters.registeredMobile}` },
  { field1: "Credit Facility", value1: `` },
  { field1: "Facility Amount", value1: `${allPerameters.loanAmount}` },
  { field1: "Repayment Mode", value1: `NACH / PDC` },
  { field1: `MENTION THE COUNT OF CHEQUE RECEIVED\n\nCheque Received (A) Undated: 5 (B) Cancelled: 0\n\nCheques Handed over to Mr./Mrs.: ${allPerameters.chequesHandedName}\n\nSourcing Channel Name:${allPerameters.sourcingChannelName}`, value1: "" }
];

latterTableFunction(letterData);

function draweeFunction(tableData) {
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    const boxWidth = 500; // Total width of the box
    const fieldWidths = [0.25 * boxWidth, 0.5 * boxWidth, 0.25 * boxWidth]; // Widths for each main column
    const extraPadding = 15; // Additional padding for row height

    // Calculate the total height for the entire box
    let totalHeight = 0;
    tableData.forEach(row => {
        let rowHeight = 0;
        ['field1', 'field2_1', 'field2_2', 'field3'].forEach(field => {
            const fieldTextHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(row[field] || '', { width: fieldWidths[1] / 2 }) + extraPadding;
            rowHeight = Math.max(rowHeight, fieldTextHeight);
        });
        totalHeight += rowHeight;
    });

    // Set normal (thin) line width
    doc.lineWidth(0.5);

    // Draw the outer rectangle for the box
    doc
        .fillColor("#f0f0f0")
        .rect(startX, startY, boxWidth, totalHeight)
        .stroke("black")
        .fill();

    // Loop through the data and draw the text inside the box
    tableData.forEach((row, rowIndex) => {
        let currentX = startX;
        let rowHeight = 0;

        // Determine row height with extra padding
        ['field1', 'field2_1', 'field2_2', 'field3'].forEach(field => {
            const fieldTextHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(row[field] || '', { width: fieldWidths[1] / 2 }) + extraPadding;
            rowHeight = Math.max(rowHeight, fieldTextHeight);
        });

        // Draw rectangles and text for each field in the row
        doc.fillColor("#f5f5f5").rect(currentX, startY, fieldWidths[0], rowHeight).stroke("black");
        doc.font('Helvetica').fillColor("black").fontSize(7.2).text(row.field1, currentX + 5, startY + 5, { baseline: "hanging", width: fieldWidths[0] - 10, align: 'left' });
        currentX += fieldWidths[0];

        if (rowIndex === 0) {
            doc.rect(currentX, startY, fieldWidths[1], rowHeight).stroke("black").fillColor("black").text(row.field2_1 || "", currentX + 5, startY + 5, { baseline: "hanging", width: fieldWidths[1] - 10, align: 'center' });
            currentX += fieldWidths[1];
        } else {
            const subFieldWidth = fieldWidths[1] / 2;
            doc.rect(currentX, startY, subFieldWidth, rowHeight).stroke("black").fillColor("black").text(row.field2_1 || "", currentX + 5, startY + 5, { baseline: "hanging", width: subFieldWidth - 10, align: 'center' });
            currentX += subFieldWidth;
            doc.rect(currentX, startY, subFieldWidth, rowHeight).stroke("black").fillColor("black").text(row.field2_2 || "", currentX + 5, startY + 5, { baseline: "hanging", width: subFieldWidth - 10, align: 'center' });
            currentX += subFieldWidth;
        }

        doc.fillColor("#f5f5f5").rect(currentX, startY, fieldWidths[2], rowHeight).stroke("black").fillColor("black").text(row.field3, currentX + 5, startY + 5, { baseline: "hanging", width: fieldWidths[2] - 10, align: 'center' });

        // Move to the next row
        startY += rowHeight;
    });
}

// Sample data
const DraweeData = [
    { field1: "Drawee Bank", field2_1: "Cheque No.", field2_2: "", field3: "No of Cheques" },
    { field1: " ", field2_1: "From", field2_2: "To", field3: " " },
    { field1: ``, field2_1: ``, field2_2: ``, field3: `` },
    { field1: ``, field2_1: ``, field2_2: ``, field3: `` },
    { field1: ``, field2_1: ``, field2_2: ``, field3: `` },
    { field1: ``, field2_1: ``, field2_2: ``, field3: `` },
];

// Call the function to create the table
draweeFunction(DraweeData);


doc.moveDown(3);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`I ${allPerameters.customerName} hereby confirm that I have handed over FIVE cheques detailed above towards repayment of Instalment(s) or security cheque for the loan/facility already taken/to be taken from FIN COOPERS CAPITAL Pvt Ltd and that all cheques were drawn in favour of “FINCOOPERS CAPITAL Pvt Ltd” and also recorded my name on the reverse side of the cheques.`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`DATED : ${allPerameters.repaymentChequeAcknowledgementAppDate}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`(Borrower Name) - ${allPerameters.customerName}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`(Borrower Signature)`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(9)
.fillColor('black')
.font('Helvetica')
.text(`This is to confirm that physical cheques were cross tallied with the above schedule and found correct.`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

function SignatureTableFunction(tableData) {
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    const boxWidth = 500; // Total width of the box
    const normalRowHeight = 20; // Normal height for other rows
    const signatureRowHeight = 40; // Increased height for the signature row

    // Define fixed column widths for three columns
    const columnWidths = [150, 150, 200]; // Adjust widths for your layout

    // Calculate total height needed for the entire box
    let totalHeight = tableData.length * normalRowHeight; // Total height based on normal row height

    // Set normal (thin) line width
    doc.lineWidth(0.5); // Set normal border thickness

    // Draw the outer rectangle for the box
    doc
        .fillColor("#f0f0f0") // Box background color
        .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
        .stroke("black") // Border color
        .fill();

    // Loop through the data and draw the text inside the box
    tableData.forEach((row, rowIndex) => {
        let currentX = startX; // Reset the starting X position for each row

        // Determine row height based on whether it's the signature row
        const rowHeight = rowIndex === 0 ? signatureRowHeight : normalRowHeight; // Change height for the first row (signature)

        // Draw rectangles for each field in the row
        columnWidths.forEach((width, index) => {
            const field = `field${index + 1}`;

            // Draw rectangle for the field box with thin lines
            doc
                .fillColor("#f5f5f5") // Background color for field (empty box)
                .rect(currentX, startY, width, rowHeight) // Use determined row height
                .stroke("black"); // Normal border thickness

            // Set regular font for all rows
            doc
                .font('Helvetica')
                .fillColor("black")
                .fontSize(7.2);

            // Draw the field text in the box
            const fieldValue = row[field] || ""; // Use empty string for missing fields
            doc.text(fieldValue, currentX + 3, startY + 5, {
                baseline: "hanging",
                width: width - 10, // Adjust width to provide padding inside the box
                align: 'left', // Align text to the left
            });

            // Move to the next column
            currentX += width; // Update X position for the next field
        });

        // Move to the next row
        startY += rowHeight; // Update Y position for the next row based on the determined height
    });
}

const SignatureTable = [
    { field1: "Signature", field2: "", field3: "" },
    { field1: "Name", field2: ``, field3: "" },
    { field1: "", field2: "Sales Executive / DSA", field3: "CPA / FIN COOPERS Staff" },
];

// Call the function to create the table
SignatureTableFunction(SignatureTable);

addFooter();

// //---------------------------------------------- new page 9---------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(8);

doc
.fontSize(8)
.font('Helvetica')
.text(`LETTER OF CONTINUITY`,startX, doc.y, { align: "center", width: 500})
doc.moveDown(2.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`Place: Indore`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`To,`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`The Manager,`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`FIN COOPERS Securities pvt ltd`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
.fontSize(8)
.font('Helvetica')
.text(`174/3,Nehru Nagar,Indore-452011 (M.P.)`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`Dear Sir(s),`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`I/We ${allPerameters.customerName} a company incorporated under the provisions of the Companies Act, 1956/2013 /a partnership firm registered under the provisions of the Indian Partnership Act, 1932/ sole proprietorship concern or an individual having its office/ place of business at ${allPerameters.place}, acting through _______________________________, who is duly authorized in that behalf vide board resolution/ letter of authority/power of attorney dated DATED : ${allPerameters.date} (the “Borrower(s)”), enclose a Promissory Note dated DATED : ${allPerameters.date} for Rs.${allPerameters.rupee} payable on demand which is given to you (“DPN”) as collateral security for repayment to FINCOOPERS CAPITAL Pvt Ltd, (hereinafter referred to as the “FIN COOPERS CAPITAL Pvt Ltd”, including its successors and assigns) of any sum now due or which may hereafter become due from me/us to FIN COOPERS CAPITAL Pvt Ltd in respect of Rs.${allPerameters.rupee} (hereinafter referred to as the “Facility”) granted by FIN COOPERS vide Facility Agreement dated DATED : ${allPerameters.date}.I/We hereby irrevocably and unconditionally agree, confirm and undertake that:\n\n1. the DPN shall operate as continuing security to you to be enforceable for the repayment of the ultimate balance and/or all sums remaining unpaid under the Facility now or hereafter, including all interest to become payable in respect of / under the Facility or which may in future be advanced; and\n\n2. we will remain liable on the DPN notwithstanding payment made into the account of the Facility from time to time or the Facility being reduced or extinguished from time to time or even if the balance in the account of the Facility may be in credit.`,startX, doc.y, { align: "left", width: 500, align:"justify"})
doc.moveDown(3);

doc
.fontSize(8)
.font('Helvetica')
.text(`Yours faithfully`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`(Borrowers)`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
.fontSize(8)
.font('Helvetica')
.text(`___________________________`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(1);

doc
.fontSize(8)
.font('Helvetica')
.text(`Authorized Signatory`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

addFooter();

// //----------------------------------------------- new page 10-----------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();
doc.moveDown(8);

doc
    .fontSize(8)
    .font('Helvetica-Bold') // Use the bold version of Helvetica
    .text(`END-USE UNDERTAKING`, startX, doc.y, { align: "center", width: 500, underline:true })
    .moveDown(2)

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`DATED : ${allPerameters.date}`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`To,`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`The Manager,`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`FIN COOPERS Securities pvt ltd`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(0.5);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`174/3,Nehru Nagar,Indore-452011 (M.P.)`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(3);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`Dear Sir/Madam,`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(3);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`Subject:- Undertaking regarding utilizations of Loans to be granted by Genesis Securities Pvt Ltd`,startX, doc.y, { align: "left", width: 500})
doc.moveDown(2);

doc
  .fontSize(8)
  .font('Helvetica')
  .text(`I/We ${allPerameters.customerName} acknowedge that FIN COOPERS CAPITAL has sanctioned loan amount of Rs. ${allPerameters.rupee} to subject to the terms and conditions as mentioned in the Sanction Letter __Date:${allPerameters.sanctionLatterDate}________________ (sanction letter). The Loan has been sanctioned by FIN COOPERS CAPITAL, inter alia, on the basis of my/our representation that we/I are/am engaged in the business of and the loan will be utilized only for the purpose of .\n\n I/We hereby solemnly confirm and certify that Loan shall be utilized only for the aforesaid purpose and no other purpose. I/We will never utilize the Loan or any part thereof for any speculative, illegal and prohibited activity (prohibited under any applicable laws/rules/regulations). Any breach or violation of the representation made herein, and other documents executed in relation to Loan will be my/our responsibility solely.\n\nI/We shall extend necessary support and co-operation to FIN COOPERS for any matter in connection with this letter and Facility Agreement.`,startX, doc.y, { align: "left", width: 500, align:"justify"})
doc.moveDown(2);

addFooter();
    // Finalize the PDF
    doc.end();
  
    const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

    // const objData = {
    //     fileName: pdfFileUrl,
    //     file: doc.toString('base64')
    //  }
    //   await initESign(objData)
  
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(pdfFileUrl);
      });
      stream.on("error", reject);
    });
  }
  
//   const rcplLoanAgreement = async(customerId,req,res) =>{
    const rcplLoanAgreement = async(customerId) =>{

    // const customerId = "66daf42b267db736881e7c4c"
    try {
        
        const customerDetails = await customerModel.findOne({_id:customerId}).populate('productId')  
        const coApplicantDetails = await coApplicantModel.find({customerId})
        const guarantorDetails = await guarantorModel.findOne({customerId})  
        const applicantDetails = await applicantModel.findOne({customerId})
        const technicalDetails = await technicalModel.findOne({customerId})
        const appPdcDetails = await appPdcModel.findOne({customerId})
        const creditPdDetails = await creditPdModel.findOne({customerId})


        const address = [
            applicantDetails?.permanentAddress?.addressLine1,
            applicantDetails?.permanentAddress?.addressLine2,
            applicantDetails?.permanentAddress?.city,
            applicantDetails?.permanentAddress?.district,
            applicantDetails?.permanentAddress?.state,
            applicantDetails?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const guarantorAddress = [
            guarantorDetails?.permanentAddress?.addressLine1,
            guarantorDetails?.permanentAddress?.addressLine2,
            guarantorDetails?.permanentAddress?.city,
            guarantorDetails?.permanentAddress?.district,
            guarantorDetails?.permanentAddress?.state,
            guarantorDetails?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const CoPermanentAddress = [
            coApplicantDetails[0]?.permanentAddress?.addressLine1,
            coApplicantDetails[0]?.permanentAddress?.addressLine2,
            coApplicantDetails[0]?.permanentAddress?.city,
            coApplicantDetails[0]?.permanentAddress?.district,
            coApplicantDetails[0]?.permanentAddress?.state,
            coApplicantDetails[0]?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const CoPermanentAddressTwo = [
            coApplicantDetails[1]?.permanentAddress?.addressLine1,
            coApplicantDetails[1]?.permanentAddress?.addressLine2,
            coApplicantDetails[1]?.permanentAddress?.city,
            coApplicantDetails[1]?.permanentAddress?.district,
            coApplicantDetails[1]?.permanentAddress?.state,
            coApplicantDetails[1]?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const CoPermanentAddressThree = [
            coApplicantDetails[2]?.permanentAddress?.addressLine2,
            coApplicantDetails[2]?.permanentAddress?.addressLine2,
            coApplicantDetails[2]?.permanentAddress?.city,
            coApplicantDetails[2]?.permanentAddress?.district,
            coApplicantDetails[2]?.permanentAddress?.state,
            coApplicantDetails[2]?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

        const allPerameters = {
            customerName : applicantDetails?.fullName || "",//page no.1
            address : address,
            registeredMobile: applicantDetails?.mobileNo || "NA",
            registeredOfficeAddress :"",
            corporateOfficeAddress :"",
            emailAddress: applicantDetails?.email || "",
            constitution : "",
            identityNumber: applicantDetails?.voterIdNo || "",
            typeOfBorrower: creditPdDetails?.applicant?.applicantType || "",
            securityProvider: creditPdDetails?.applicant?.businessType ||"",
            coApplicantName: coApplicantDetails[0]?.fullName || "",//table 2
            coResidenceAddress: CoPermanentAddress || "",
            coRegisteredOfficeAddress: "",
            coCorporateOfficeAddress: "",
            coEmailAddress: coApplicantDetails[0]?.email || "",
            coConstitution: "",
            coIdentityNumber: coApplicantDetails[0]?.pan || "",
            coTypeOfBorrower: coApplicantDetails[0]?.coApplicantType || "",
            coSecurityProvider: coApplicantDetails[0]?.businessType || "",
            coApplicantNameTwo: coApplicantDetails[1]?.fullName || "",//page 2
            coResidenceAddressTwo: CoPermanentAddressTwo || "",
            coRegisteredOfficeAddressTwo: "",
            coCorporateOfficeAddressTwo: "",
            coEmailAddressTwo: coApplicantDetails[1]?.email || "",
            coConstitutionTwo: "",
            coIdentityNumberTwo: coApplicantDetails[1]?.pan || "",
            coTypeOfBorrowerTwo: coApplicantDetails[1]?.coApplicantType || "",
            coSecurityProviderTwo: coApplicantDetails[1]?.businessType || "",
            coApplicantNameThree: coApplicantDetails[2]?.fullName || "",//page 3
            coResidenceAddressThree: CoPermanentAddressThree || "",
            coRegisteredOfficeAddressThree: "",
            coCorporateOfficeAddressThree: "",
            coEmailAddressThree: coApplicantDetails[2]?.email || "",
            coConstitutionThree: "",
            coIdentityNumberThree: coApplicantDetails[2]?.pan || "",
            coTypeOfBorrowerThree: coApplicantDetails[2]?.coApplicantType || "",
            coSecurityProviderThree: coApplicantDetails[2]?.businessType || "",
            guarantorName: guarantorDetails?.fullName || "",
            guarantorAddress : guarantorAddress || "",
            guarantorRegisteredOfficeAddress :"",
            guarantorCorporateOfficeAddress :"",
            guarantorEmailAddress: guarantorDetails?.email || "",
            guarantorConstitution : "",
            guarantorIdentityNumber: guarantorDetails?.docNo || "",
            guarantorTypeOfBorrower: creditPdDetails?.guarantor?.applicantType || "",
            guarantorSecurityProvider: creditPdDetails?.guarantor?.businessType ||"",
            loanAmount: customerDetails?.loanAmount || "",
            securityDetails: technicalDetails?.fullAddressOfProperty || "",
            securityCover:"PROPERTY DOCUMENTS",
            tenor: customerDetails?.tenure || "",
            sanctionLetterDate:"NA",
            repaymentBank:"Na",
            detailsOfReceivables:"Na",
            emi: customerDetails?.loanAmount ? "Yes" : "",
            monthly: "Yes",
            preInstalmentInterestDate:"",//4 page
            dateWhenFirstInstalment:"",
            totalNoOfInstalments:"",
            amountOfEachInstalment:"",
            exactDatesOfRepayment:"",
            totalInterest:"",
            totalRepaymentAmount:"",
            nameOne: applicantDetails?.fullName || "",
            nameTwo: coApplicantDetails[0]?.fullName || "",
            namethird: coApplicantDetails[1]?.fullName || "",
            nameFourth: coApplicantDetails[2]?.fullName || "",
            borrowerPlace:"",
            loanId:"",// page 8
            borrowerDate:"",
            disbursementAmount:"",
            dateDisbursementRequired:"",
            lanNo:"",
            nameOfBank: creditPdDetails?.bankDetail?.nameOfBank || "NA",// bank Details
            branch: creditPdDetails?.bankDetail?.branchName || "NA",
            accountNo : creditPdDetails?.bankDetail?.accountNo || "NA",
            accountType : creditPdDetails?.bankDetail?.accountType || "NA",
            IFSCCode:creditPdDetails?.bankDetail?.accountType || "NA",
            bankAddress:"",
            officeUse:"",
            amountPayable:"",
            applicantId:"",
            agrementNo:"",
            disbursementDate:"",
            chequesHandedName:"",// page 8
            sourcingChannelName:"",
            repaymentChequeAcknowledgementAppDate:"",
            place:"",// page 9
            date:"",
            rupee:"",
            sanctionLatterDate:"",
        }
    
        const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
        // console.log("pdfPath", pdfPath);
        // console.log("http://localhost:5500" + pdfPath);
    
        // if (!pdfPath) {
        //   return res.status(500).json({
        //     errorName: "pdfGenerationError",
        //     message: "Error generating the Sanction Letter Pdf",
        //   });
        // }
        // success(res, "PDF generated successfully", pdfPath);
        // console.log("PDF generated successfully",pdfPath)
        return pdfPath
      } catch (error) {
        console.log(error);
        // unknownError(res, error);
      }
  }
  
//   const rcplLoanAgreement = async(req,res) =>{
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//           return serverValidation({
//             errorName: "serverValidation",
//             errors: errors.array(),
//           });
//         }
    
//         const candidateDetails = "Data";
    
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
//   }
  
  module.exports = {
    rcplLoanAgreement
  }
  
  
