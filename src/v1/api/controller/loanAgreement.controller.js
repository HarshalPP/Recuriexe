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

const pdfLogo = path.join(
  __dirname,
  "../../../../assets/image/FINCOOPERSLOGO.png"
);

// Function to create the loan agreement PDF with tables
function createLoanAgreementPDFWithTables(outputPath) {
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

  function drawTable(tableTitle, tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const columnWidths = [500];

    const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    console.log(columnWidths[0], keyWidth, valueWidth);

    // Set fill color for the header background
    doc.lineWidth(0.5);
    doc
      .rect(
        startX,
        startY,
        columnWidths.reduce((a, b) => a + b),
        20
      )
      .fillAndStroke("white", "black");
    doc
      .font(fontBold)
      .fillColor("black")
      .fontSize(9.5)
      .text(tableTitle, startX + 5, startY + 5, { baseline: "hanging" });

    // Reset fill color to white for table rows
    startY += 20;

    // Define table data (replace this with the actual data you want)

    // Render table rows
    tableData.forEach((row, rowIndex) => {
      // Alternate row background color
      let valueRowHeight = 100;

      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX, startY, keyWidth, valueRowHeight)
        .stroke("black")
        .fill();

      // Draw text in each cell
      doc
        .font(font)
        .fillColor("black")
        .fontSize(8.3)
        .text(row.field1, startX + 5, startY + 5, { baseline: "hanging" });
      // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

      // Alternate row background color
      doc
        .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
        .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
        .stroke("black")
        .fill();

      // Draw text in each cell
      doc
        .font(font)
        .fillColor("black")
        .fontSize(7.2)
        .text(row.value1, startX + keyWidth + 5, startY + 5, {
          baseline: "hanging",
        });

      // Move to next row position
      startY += valueRowHeight;
    });

    // Add another section as an example
    // doc.moveDown().fontSize(12).text('Sourcing Details');

    // You can continue adding more tables/sections in a similar fashion
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const pdfFilename = `loanAgreement.pdf`;
  const pdfPath = path.join(outputDir, pdfFilename);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(pdfPath);

  doc.pipe(stream);

  // Add logo and border to the first page
  addLogo();
  //   addWatermark();
  drawBorder();

  // Title styling for OFFER LETTER in uppercase and underlined
  doc.moveDown(5);
  doc
    .fontSize(12)
    .font(fontBold)
    .text("Schedule", { align: "center", underline: true });
  doc.moveDown(1);
  // Format the borrower details to the left side
  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `DATED : 10/10/2024\n` +
        `Place of Agreement : Indore\n` +
        `Location of the Lender’s Office/Branch : Indore\n`,
      {
        lineGap: 2,
        align: "left",
      }
    );
  const borrowerTableData = [
    {
      field1:
        "Borrower/Security Provider Details\n\n •Name of Borrower/Security Provider\n • Residence Address\n • Registered Office Address \n • Corporate Office Address \n • Email Address Constitution Unique Identity Number (PAN/CIN/Reg. No)\n • Type of Borrower (Main Applicant/Co-Applicant)\n • Business or Employment of the Borrower/Security Provider ",
      value1: "Loan (“Facility”)",
    },
    { field1: "Program Name", value1: "SECURED PROGRAM" },
    { field1: "Loan Amount Sanctioned", value1: "Rs. 430000" },
    { field1: "Purpose of the Loan", value1: "Business Purpose" },
    { field1: "Tenure of the Loan", value1: "47 months" },
    { field1: "Principal Moratorium (applicable months)", value1: "NA" },
    { field1: "Interest Type", value1: "Floating" },
    { field1: "Interest Payable", value1: "Monthly" },
    { field1: "Current FIN COOPERS Reference Rate", value1: "15% per annum" },
    {
      field1: "Applicable Floating Rate of Interest (Current URR +/- Margin)",
      value1: "15% + 8% =23%per annum",
    },
    {
      field1: "Installment Amount/ Graded Installments",
      value1: "Rs 13963 for a period of 47 months",
    },
    {
      field1: "Break up of total amount payable (Excluding Pre EMI)",
      value1:
        "Principal: Rs. 430000   |   Interest: Rs. 226215  |   Total: Rs. 656215",
    },
    { field1: "Frequency of repayment", value1: "10th of every month" },
    {
      field1:
        "EMI/ Installment date (Exact dates of repayment depends on the disbursement date and the same shall be mentioned in the loan agreement and repayment schedule whicand repayment schedule which shall be shared with the Borrower post disbursement)",
      value1: "SECURED",
    },
    { field1: "IMD Received", value1: "NIL" },
    {
      field1: "Fees and Other Charges",
      value1:
        "Processing Fee: 2 % + GST Pre-EMI (Per Day): As Applicable Fee received with Application Form: NA CERSAI charges: As applicable (* subject to realization of funds)",
    },
    { field1: "Number of Advance Installments", value1: "SECURED" },
    { field1: "Installment Mode", value1: "NACH/ CHEQUE" },
    {
      field1: "Details of the security to be provided for the loan",
      value1:
        "HOUSE NO 85 SURVEY NO 122 PATWARI HALKA NO 77 WARD NO 07 VILLAGE RASULPURA GRAM PANCHYAT KALPONI TEHSIL KHUJNER DISTRICT RAJGARH STATE MADHYA PRADESH PIN CODE 465687",
    },
    {
      field1: "DSRA",
      value1: "NA",
    },
    {
      field1:
        "Foreclosure Charges* Please note that there are no charges on foreclosure or prepayment on floating rate term loans sanctioned    only to individual borrowers for other than business purposes",
      value1:
        "6% of principal outstanding for loan foreclosed within 12 months of loan sanction.· 4% of principal outstanding for loan foreclosed after 12 months of loan sanction",
    },
  ];
  drawTable("Borrower(s) Details", borrowerTableData);
  // Close the PDF and end the stream
  doc.end();

  const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve(pdfFileUrl);
    });
    stream.on("error", reject);
  });
}

// Call the function to generate the PDF with tables

console.log("PDF with tables generated!");

// ------------------HRMS  create offer letter pdf ---------------------------------------

async function generateLoanAgreementPdf(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const candidateDetails = "Data";

    const pdfPath = await createLoanAgreementPDFWithTables(candidateDetails);
    // console.log("pdfPath", pdfPath);
    console.log("http://localhost:5500" + pdfPath);

    if (!pdfPath) {
      return res.status(500).json({
        errorName: "pdfGenerationError",
        message: "Error generating the Sanction Letter Pdf",
      });
    }

    success(res, "PDF generated successfully", pdfPath);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}

module.exports = { createLoanAgreementPDFWithTables, generateLoanAgreementPdf };
