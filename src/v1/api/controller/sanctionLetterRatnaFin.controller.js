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

async function (candidateDetails) {
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

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`); // Capitalize name
  const pdfFilename = `sactionletterRatna.pdf`;
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
  doc
    .fontSize(12)
    .font(fontBold)
    .text("SANCTION LETTER", { align: "center", underline: true });
  doc.moveDown(1);

  // Format the borrower details to the left side
  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `Sanction Letter No: RCPL/AGRIMICROLAP/0007
        Date: 25/09/2024\n` +
        `CUSTOMER NAME : DURGA PRASAD\n` +
        `79 GRAM BABALDI BABALDI BABLDA RAJGARH SARANGPUR MADHYA PRADESH 465687\n` +
        `K/A : DURGA PRASAD &DEVKALA NAGAR &PAWAN NAGAR\n` +
        `(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\n` +
        `With reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\n` +
        `Your loan account details and the loan repayment schedule are attached herewith for your reference.\n`,
      {
        lineGap: 2,
        align: "left",
      }
    );

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

  const loanTableData = [
    { field1: "Loan Type ", value1: "Loan (“Facility”)" },
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
  drawTable(loanTableData);
  addFooter();
  //---------------------------------------------------new page---------------------------------------------------------------
  doc.addPage();
  addLogo();
  drawBorder();

  doc.moveDown(15);
  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `Please note that the facility will be subject to the following terms and conditions:
  
  Current FIN COOPERS Reference Rate:
  1.Applicable rate of interest is annualized & floating/fixed in nature and is linked to benchmark FIN COOPERS Reference Rate (URR%) on the date of disbursement and may be notified/announced by FIN COOPERS.
  2.This sanction is subject to positive credit reports with a credit information company and the FCUI, if reported payment/clearance of processing/ arrangement fee.
  3.Any material fact concerning the borrower's/guarantor's income/ability to repay/any other relevant aspect should be disclosed and not suppressed or concealed in your proposal for the Facility.
  4.Disbursement of the Facility (if any, shall be released only after the receipt of required property title documents, any other documents and details to the satisfaction of FIN COOPERS).
  5.All statutory taxes, duties and levies under the applicable laws, as amended from time to time, shall be additionally payable by you.`,
      {
        lineGap: 2,
        align: "left",
        align: "justify",
      }
    );
  doc.moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `The additional sanction conditions applicable are:
  
  1.Positive FI Report
  2.Technical Report to be uploaded in DOPS`,
      {
        lineGap: 1,
        align: "left",
        align: "justify",
      }
    );
  doc.moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `We wish to inform you that the issuance of this in-principle sanction letter shall not guarantee the loan disbursement which will be done at the sole discretion of FIN COOPERS. It shall neither constitute an offer nor a contract.
  
  As and when execution of this sanction, you are requested to furnish a copy of letter duly signed and accepted by you and other co-borrower(s). The sanction is valid for a period of 60 days from the date of issuance.
  
  FIN COOPERS reserves the rights to assign/sell/transfer or secure the sanctioned amount under the Facility or any part thereof with any other financial institution or as may be stipulated by FIN COOPERS in its absolute discretion. In case of such transfer/assignment, the taking over bank/assignee will also have the right to step into the rights and obligations of FIN COOPERS under the Facility and carry out a valuation, if required.
  
  For any query you may have regarding the sanctioning of this loan facility, kindly contact our customer service team through any of the channels mentioned below.
  
  
  Yours Sincerely,
  
  
  Authorized Signatory
  FIN COOPERS CAPITAL PVT LTD`,
      {
        lineGap: 1,
        align: "left",
        align: "justify",
      }
    );
  doc.moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `I/We understand and accept the above terms and conditions for availing the Facility.
  Applicant Name: RADHA BAI                                                      Co-applicant Name: MANOJ NAGAR
  Signature:                                                                          Signature:
        
  
  Place: PACHORE                                                                 Place: PACHORE
  Date: 10/10/2024                                                               Date: 10/10/2024
  
  Guarantor Name: KAILASHCHANDRA NAGAR
  Signature:
  
  
  Place: PACHORE
  Date: 10/10/2024
  `,
      {
        lineGap: 1,
        align: "left",
        align: "justify",
      }
    );
  doc.moveDown(1);
  // Add footer at the end of the second page
  addFooter();
  //------------------------------------------------------------new page----------------------------------------------
  doc.addPage();
  addLogo();
  drawBorder();
  // Add title and content from the image
  doc.moveDown(13);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text("For any inquiry:")
    .moveDown(0.2);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text("Call us at: +91 7374911911")
    .text("Email us at: info@fincoopers.com")
    .text(
      "Write to us at — FIN COOPERS CAPITAL Pvt Ltd. 174/3 Nehru Nagar, Indore-452011 (MP)"
    )
    .moveDown(1);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text("Other terms and conditions", { underline: true })
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "1. Disbursement shall be subject to execution of transaction documents and creation of security and the facility/loan agreement and other transaction documents may/will contain terms and conditions in addition to or in modification of those set out in this letter."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "2. The continuance of the Facility is subject to cancellation and/or repayment to FIN COOPERS on demand without assigning any reason for the same."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "3. The Repayments shall be made to the designated bank account of FIN COOPERS, details of which are as under or such other designated account as may be intimated by FIN COOPERS to the borrower:"
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text("   Bank Account Number - 777750987979")
    .text("   Bank Account Name - FIN COOPERS CAPITAL PVT LTD")
    .text("   Bank Name - ICICI BANK")
    .text("   Branch Name - Molar Patar")
    .text("   IFSC Code - ICIC00000041")
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "4. FIN COOPERS is entitled to add, delete or modify all or any of the terms and conditions for the facility and/or the Standard Terms applicable to the Facility."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "5. The borrower(s) shall immediately intimate FIN COOPERS in the event of any change in the repayment capacity of the borrower, including a loss/change of job/profession or any change in the information submitted earlier."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "6. You have an option to insure the secured loan by obtaining an insurance policy for the loan facility availed in full or part disbursal. You are free to avail insurance from any of the insurance intermediaries and companies operating in the market. We will not bind you to buy insurance premium separately as applicable."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "7. Please note that risk-based pricing is determined based on the risk associated with the type of loan (Risk Gradation), cost of funds, tenor of the loan, collateral provided, and your credit score. In addition, there is a regular interest and risk rate grid where interest rates and weighted averages with a comparison of offerings. An additional premium may be charged in some cases. Risk Pricing is a primary driver behind the determination of interest rates as a function of the credit standing, historical performance of the customer/borrower, and some other factors within the grading scale of the lending institution."
    )
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "FIN COOPERS is entitled to take any action for interest reset by FIN COOPERS on the sanctioned proposed loan facility. FIN COOPERS shall not be obligated to issue any letter post such reset. This letter will form part of the proposed loan facility."
    )
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "In case of a floating rate loan, the interest rate shall be linked to the rate of the RBI Variable URR. Interest shall increase or decrease with any revision in URR."
    )
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text("Clarification on due dates and defaults:")
    .text(
      "If any of the amounts or instalments are not received before the Lender’s fixed due date, the same shall be considered as overdue and reported in the credit bureau’s record."
    )
    .moveDown(3);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text("FIN COOPERS CAPITAL PRIVATE LIMITED")
    .text("Registered Office Address: 174/3, Nehru Nagar, Indore-452011 (M.P.)")
    .text("CIN: 61720MP1994PTC008866")
    .text("Mobile No: +91 7374911911")
    .text("Email: info@fincoopers.com");
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

// ------------------HRMS  create offer letter pdf ---------------------------------------

async function generateSanctionLetterPdf(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return serverValidation({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const candidateDetails = "Data";

    const pdfPath = await sanctionLetterPdf(candidateDetails);
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

module.exports = { sanctionLetterPdf, generateSanctionLetterPdf };
