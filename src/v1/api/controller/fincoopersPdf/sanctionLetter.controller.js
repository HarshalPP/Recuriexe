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
  const { calculateLoanAmortization } = require("../../services/amotization.services.js");

  
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
const externalBranchModel = require("../../model/adminMaster/newBranch.model.js");
const endUseOfLoanModeldata = require('../../model/endUseOfLoan.model.js');


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
    if (fs.existsSync(logo)) {
      doc.image(logo, 400, 50, {
        fit: [150, 50],
        align: "right",
        valign: "bottom",
      });
    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }
  
  // const FinpdfLogo = path.join(
  //   __dirname,
  //   "../../../../../assets/image/FINCOOPERSLOGO.png"
  // );
  // console.log(FinpdfLogo,"FinpdfLogo")
  
  //   function addLogo() {
  //     if (fs.existsSync(FinpdfLogo)) {
  //       doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
  //     } else {
  //       console.error(`Logo file not found at: ${FinpdfLogo}`);
  //     }
  
  //     if (fs.existsSync(logo)) {
  //             doc.image(logo, 40, 50, {
  //               fit: [150, 50],
  //               align: "right",
  //               valign: "bottom",
  //             });
  //           } else {
  //             console.error(`Left logo file not found at: ${logo}`);
  //           }
  //   }
  

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
    if( partnerName == "FinCoopers Capital Pvt Ltd"){
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.in", {
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
        .text("Phone: +91 7374911911 | Email: info@fincoopers.in", {
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
  // const pdfFilename = `sactionletter.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);

  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

  // doc.pipe(stream);

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
      `Date: ${allPerameters.agreementdate}\n` +
        `Name of Borrower: - ${allPerameters.loanBorrowerName}\n` +
        `Address of Borrower: - ${allPerameters.address}\n` +
        `Mobile No. of Borrower: ${allPerameters.appMob1}\n` +
        `Name of Co-borrowers: ${allPerameters.loanCoborrowerName},${allPerameters.loanCoborrowerNameTwo}\n` +
        `Name of Guarantor: ${allPerameters.loanGuarantorName}\n` +
        `Branch Name: ${allPerameters.branchName}\n` +
        `Subject: Loan Number: ${allPerameters.loanNumber}\n`,
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
    { field1: "Loan Amount Sanctioned", value1: `Rs.${allPerameters.loanAmount}` },
    { field1: "Purpose of the Loan", value1: `${allPerameters.PURPOSEoFlOAN}` },
    { field1: "Tenure of the Loan", value1: `${allPerameters.tenureinMonths} months` },
    { field1: "Principal Moratorium (applicable months)", value1: "NA" },
    { field1: "Interest Type", value1:  `Floating` },
    { field1: "Interest Payable", value1: "Monthly" },
    { field1: "Current FIN COOPERS Reference Rate", value1: `${allPerameters.interestRate}% per annum` },
    {
      field1: "Applicable Floating Rate of Interest (Current URR +/- Margin)",
      value1: `${allPerameters.interestRate}%+ 0% = ${allPerameters.interestRate}% per annum`,
    },
    {
      field1: "Installment Amount/ Graded Installments",
      value1: `Rs ${allPerameters.emiAmount} for a period of ${allPerameters.tenureinMonths}`,
    },
    {
      field1: "Break up of total amount payable (Excluding Pre EMI)",
      value1:
        `Principal: Rs. ${allPerameters.loanAmount}   `,
    },
    { field1: "Frequency of repayment", value1: "Monthly" },
    {
      field1:
        "EMI/ Installment date (Exact dates of repayment depends on the disbursement date and the same shall be mentioned in the loan agreement and repayment schedule whicand repayment schedule which shall be shared with the Borrower post disbursement)",
      value1: `10th of every month`,
    },
    { field1: "IMD Received", value1: "NIL" },
    {
      field1: "Fees and Other Charges",
      value1:
        "Processing Fee: 2 % + GST Pre-EMI (Per Day): As Applicable Fee received with Application Form: NA CERSAI charges: As applicable (* subject to realization of funds)",
    },
    { field1: "Number of Advance Installments", value1: "NIL" },
    { field1: "Installment Mode", value1: "NACH/ CHEQUE" },
    {
      field1: "Details of the security to be provided for the loan",
      value1:
        `${allPerameters.detailsOfSecurity}`,
    },
    {
      field1: "DSRA",
      value1: "NA",
    },
    {
      field1:
        "Foreclosure Charges* Please note that there are no charges on foreclosure or prepayment on floating rate term loans sanctioned    only to individual borrowers for other than business purposes",
      value1:
        `6% of principal outstanding for loan foreclosed within 12 months of loan sanction.· 4% of principal outstanding for loan foreclosed after 12 months of loan sanction`,
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

1. Reports on title veriication and technical valuation of the property should be acceptable to   FinCoopers  CAPITALand all property paper as per legal report to be documented.
2. Applicable rate of interest is annualized & loating / ixed in nature and is linked to benchmark   Fin Coopers Capital Pvt Ltd  Reference Rate (URR)as on the date of disbursement and as may be notiied/ announced by   Fin Coopers Capital Pvt Ltd .
3. This sanction is subject to positive credit report with a credit information company, other FCU/ FI reportsand payment / clearance of processing / application fee. Further, the terms of sanction contained herein are subject to review by   FinCoopers  CAPITALfrom time to time.
4. Any material fact concerning the borrower’s / guarantor’s income / ability to repay / any other relevant aspect should be disclosed and not suppressed or concealed in your proposal for the Facility.
5. Subsequent tranche(s) of the Facility, if any, shall be released only after the receipt of required property title documents, any other documents and details to the satisfaction of   Fin Coopers Capital Pvt Ltd .`,
      {
        lineGap: 3,
        align: "left",
        align: "justify",
      }
    );
  // doc.moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      `
6. All statutory taxes, duties and levies under the applicable laws, as may be amended from time to time, shall be additionally payable by you.
7. The additional sanction conditions applicable are
8. Positive FI Report
9. Technical Report to be upload in DOPS
`,
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
      `
We would like to inform you that the issuance of this in-principle sanction letter shall not guarantee the loan disbursement which will be done at the sole discretion of   Fin Coopers Capital Pvt Ltd .It shall neither constitute an offer nor a contract.

As a token of acceptance of this sanction, you are requested to return a copy of this letter duly signed and accepted by you and other co-borrower(s). The sanction will remain valid for a period of 60 days from the date of issue thereof.

Fin Coopers Capital Pvt Ltd  reserves the rights to anytime assign/sell/transfer or enter into co-lending arrangement regarding amount under Facility or any part thereof to/with any other inancial institution or bank as maybe decided by   FinCoopers  CAPITALin its absolute discretion. In case of such transfer/ assignment, the taking over bank/ co- lender, inter alia, shall have the right to inspect the property mortgaged as security for the Facility and carry out valuation, if required

In case of any query you may have regarding sanctioning of this loan facility, kindly contact our customer service team through any of the channels mentioned below.

Yours Sincerely,

Authorized Signatory
FinCoopers Capital Pvt Ltd`,
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
      `I/We understand and accept the above terms and conditions for availing the Facility.`,
      {
        lineGap: 1,
        align: "left",
        align: "justify",
      }
    ).moveDown();

    doc
    .text(`Applicant Name: ${allPerameters.loanBorrowerName}`,{align:'left',continued:true})
    .text(`Co-applicant Name: ${allPerameters.loanCoborrowerName}`,{align:'right',})
    // .text(`Signature:`,{align:'left',continued:true}).moveDown(0.9)
    // .text(`Signature:`,{align:'right'});

    doc
    .text(`Place: ${allPerameters.placeOfExecution}  `,{align:'left',continued:true})
    .text(`Place: ${allPerameters.placeOfExecution}  `,{align:'right',})
    .text(`Date: ${allPerameters.agreementdate}`,{align:'left',continued:true})
    .text(`Date: ${allPerameters.agreementdate}`,{align:'right'});

    
  doc.moveDown(0.8);

  doc
    .text(`2nd Co-applicant Name: ${allPerameters.loanCoborrowerNameTwo}`,{align:'left',continued:true})
    .text(`Guarantor Name: ${allPerameters.loanGuarantorName}`,{align:'right',})
    // .text(`Signature:`,{align:'left',continued:true}).moveDown(0.9)
    // .text(`Signature:`,{align:'right'});

    doc
    .text(`Place: ${allPerameters.placeOfExecution}  `,{align:'left',continued:true})
    .text(`Place: ${allPerameters.placeOfExecution}  `,{align:'right',})
    .text(`Date: ${allPerameters.agreementdate}`,{align:'left',continued:true})
    .text(`Date: ${allPerameters.agreementdate}`,{align:'right'});
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
    .text("Call us at: +91 7374911911 ")
    .fillColor("blue")
    .text("Email us at: info@fincoopers.com")
    .text(
      "Write to us at – Fin Coopers Capital Pvt Ltd, : 174/3, Nehru Nagar, Indore-452011 (M.P.)"
    )
    .moveDown(1);

  doc
    .font(fontBold)
    .fontSize(9)
    .fillColor("black")
    .text("Other terms and conditions", { underline: true })
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "1. Disbursement shall be subject to execution of transaction documents and creation of security and the facility/loan agreement and other transaction documents may / will contain terms and in addition to or in modiication of those set out in this letter."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "2. The continuance of the Facility is subject to cancellation and / or repayment to   Fin Coopers Capital Pvt Ltd  on demand without assigning any reason for the same."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(9)
    .fillColor("black")
    .text(
      "3. The Repayments shall be made to the designated bank account of   Fin Coopers Capital Pvt Ltd , details of which are as under or such other designated account as may be intimated by   FinCoopers  CAPITALto the borrower:"
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text("   Bank Account Number - 924020036958406 ", { align: "center"}).moveDown(1)
    .text("   Bank Account Name - Fin Coopers Capital Pvt Ltd", { align: "center"}).moveDown(1)
    .text("   Bank Name - Axis BANK", { align: "center"}).moveDown(1)
    .text("   Branch Name - Indore", { align: "center"}).moveDown(1)
    .text("   IFSC Code - UTIB0000043", { align: "center"})
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "4.   Fin Coopers Capital Pvt Ltd  is entitled to add to, delete or modify all or any of the terms and conditions for the facility and/or the Standard Terms applicable to the Facility."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "5. The borrower/s shall immediately intimate   FinCoopers  CAPITALin the event of any change in the repayment capacity of the borrower/sincluding a loss / change in job / profession etc. any change in the information submitted earlier."
    )
    .moveDown(0.5);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "6. You have an option to enrol under Group Insurance scheme to cover the loan facility availed in full or part disbursal. You are free to avail insurance from any of the Insurance intermediaries and companies operating in the market. You will be required to pay insurance premium separately as applicable."
    )
    .moveDown(0.5);

    doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "7. Please note that risk-based pricing is determined based on the risk associated with type of loan (Risk Gradation), cost of funds, tenor of the loan, collateral and quantum of loan. In addition, there is a regular review exercise of the interest rates and product features with the competition offerings. An additional risk premium may incorporated in the pricing which is based on the credit risk associated with the customer which is a function of his credit history, bureau information, internal rating along with other factors like the borrowers income etc. Hence, it should be noted, that the interest rate applied is different from customer to customer and his/her loans/advances. The range of rates of interest and approach for gradation of risks are also available on the website of FinCoopers Capital Pvt Ltd."
    )
    .moveDown(0.5);
  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "8. Please note that this is the only sanction letter issued by   FinCoopers  CAPITALin respect of the abovementioned proposed loan facility.   FinCoopers  CAPITALshall not be liable, responsible or bound by any other letter / communication issued by any person in relation to the proposed loan facility."
    )
    .moveDown(1);

  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "9. Revision in reference rate and interest reset shall be applied from the irst of the month following the month of the year in which URR is changed. In absence of any speciic instruction,   FinCoopers  CAPITALwill prefer to keep the EMI amount constant irrespective of revisions in URR."
    )
    .moveDown(1);
  doc
    .font(font)
    .fontSize(8)
    .fillColor("black")
    .text(
      "10.Funds / Loan facility, which is sanctioned on the request of the applicant should only be used as communicated by him and mentioned on the application form and this sanction letter. The entire onus of correct utilisation of funds is on the borrower and co-borrower(s), and   FinCoopers  CAPITALSecurities, have right to re-call the loan, if any ambiguity is established later on"
    )
    .moveDown(1);

  doc
    .font(fontBold)
    .fontSize(8)
    .fillColor("black")
    .text("Clarification on due dates and defaults:",{underline:true})
    .font(font)

    .text(
      "If any amount due under the Loan is not received before the Lender runs its day end process on the due date, the same shall be considered as overdue and if continued to be overdue the account will be classiied as SMA-1 at 31st day, SMA-2 at 61st day and Non-performing Asset at 91st day after the day end process of the respective dates. For example, if due date is 05-01-22 then if continuously being unpaid the same shall be classiied as SMA-1 as at 04-02-22, SMA-2 as at 06-03-22 and NPA as at 05-04-22. If there is any overdue in an account, the default/ non-repayment is reported with the credit bureau companies like CIBIL etc. and the CIBIL report of the customer will relect defaults and its classiication status and no. of days for which an account remains overdue is known as DPD (Days past due). Once an account is classiied as NPAs then it shall be upgraded as ‘standard’ asset only if entire arrears of interest and principal are paid by the borrower. Detailed illustration and information about the same shall be available in the Loan agreement."
    )
    .moveDown(3);

  addFooter();

  ///==============

  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(7);

  doc.moveDown(2)

  const startX = 50; // Set a left margin

    
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
    { field1: "1", field2: "Loan proposal/ account No.", field3: `${allPerameters.loanNumber}` },
    { field1: "", field2: "Type of Loan", field3: "Micro Loan Against Property" },
    { field1: "2", field2: "Sanctioned Loan amount (in Rupees)", field3: `${allPerameters.loanAmount} ${allPerameters.loanAmountinwords}` },
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
  { field1: "5", field2: "Installment details" },
  { field1: "Type of installments", field2: "Number of EPIs", field3: `EPI Rs`, field4: "Commencement of repayment, post sanction" },
  { field1: "Monthly", field2: `${allPerameters.tenureinMonths}`, field3: `${allPerameters.emiAmount}`, field4: `10th of the month next to the \nfollowing month` },
];
// Call the function
instalmentTableFunction(instalmentTable);


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
{ field1: "FRR", field2: `${allPerameters.benchmarkInterest}%`, field3: `${allPerameters.SpreadInterestRate}%`,field4: `${allPerameters.interestRate}%` },
];

const customWidths = [
[50, 300, 150], // Custom widths for the 1st row (3 columns)
[50, 450],     // Custom widths for the 2nd row (2 columns)
null,           // Default dynamic widths for the 3rd row
null,           // Default dynamic widths for the 4th row
];
//interestRate
loanTableFunction(loanTable,customWidths);


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
  { text: "Every 3 months", colSpan: 1, bold: false }, // Spanning 2 columns
  { text: "Every 3 months", colSpan: 1, bold: false }, // Spanning 2 columns
  { text: `Rs.${allPerameters.epi}`, bold: false }, // Single column
  { text:  `${allPerameters.noOfEpi}`, bold: false }, // Single column
],
];


chargesTableFunction1(doc, tableData1, font, fontBold);


function chargesTableFunction3(tableData) {
  const startX = 50;
  let startY = doc.y + 10;
  const totalWidth = 500; // Total table width
  
  // Set the number of columns explicitly (3 columns)
  // const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
  const columns = ['field1'];  // Include field4 if needed
  
  
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
  doc.moveDown(0.1)

  }
  
  const chargesTable3 = [
  // { field1: "8", field2: "Fee/ Charges" },
  { field1: "8.  Fee/ Charges" },
  
  // { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
  // {  field2: "Payable to the RE (A)", field3: "Payable to a third party through RE (B)" },
  
  ];
  
  chargesTableFunction3(chargesTable3);

doc.moveDown(0.1)

function chargesTableFunction(tableData) {
const startX = 50;
let startY = doc.y + 10;
const totalWidth = 500; // Total table width

// Set the number of columns explicitly (3 columns)
// const columns = ['field1', 'field2', 'field3', 'field4'];  // Include field4 if needed
const columns = ['field1', 'field2', 'field3', ];  // Include field4 if needed


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
// { field1: "8", field2: "Fee/ Charges" },
// { field1: "8.  Fee/ Charges" },

// { field1: "", field2: "", field3: "Payable to the RE (A)", field4: "Payable to a third party through RE (B)" },
{  field2: "Payable to the RE (A)", field3: "Payable to a third party through RE (B)" },

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
  col4: `${allPerameters.processingfees}`,
  col5: "",
  col6: "",
},
{
  col1: "(ii)",
  col2: "Insurance charges",
  col3: "One time",
  col4: "",
  col5: "One time",
  col6:  `${allPerameters.insuranceCharges}`,
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
  col4:  `${allPerameters.docCharges} \n\n ${allPerameters.cersaiCharges}`,
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
    columns: ["10", `Details of Contingent Charges (in Rs. or %, as applicable)`],
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
      `
1. Fin Coopers Capital Private Limited
Grievance Officer: Shakti Singh

For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
  ],

// columns: [
//   "3", 
//   "Phone number and email id of the nodal grievance redressal officer",
//   `
// 1. Fin Coopers Capital Private Limited
// Grievance Officer: Shakti Singh

// For any grievances in relation to the loan the customer can call / write to us at 91111 30830 / shakti@fincoopers.com.`
// ],
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
["Fin Coopers Capital Pvt Ltd  -100%", "NA", `${allPerameters.interestRate}%`],
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



  
    addFooter()
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
  const FincooperSanctionLetterPdf = async(customerId,logo,partnerName) =>{

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


  const BranchNameId = customerDetails?.branch;
  // console.log("BranchNameId",BranchNameId)
        const branchData = await externalBranchModel.findById(BranchNameId);
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
      applicantDetails?.localAddress?.addressLine1,
      // applicantDetails?.permanentAddress?.addressLine2,
      // applicantDetails?.permanentAddress?.city,
      // applicantDetails?.permanentAddress?.district,
      // applicantDetails?.permanentAddress?.state,
      // applicantDetails?.permanentAddress?.pinCode
    ].filter(Boolean).join(', ');

    const formatDate = (praMANpATRADate) => {
      if (!praMANpATRADate) return "NA"; // Agar DOB available nahi hai to "NA" return kare
      const date = new Date(praMANpATRADate); // Date object me convert kare
      const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
      const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
      return `${day}-${month}-${year}`; // Final format
      };

      const endusofloan = finalsanctionDetails?.EndUseOfLoan;
     const purpose = await endUseOfLoanModeldata.findById( endusofloan );
     const loanPurpose = purpose?.name;
    
    const allPerameters = {
      branchName:branchName||"NA",
      loanNumber:sanctionPendencyDetails?.partnerLoanNo,

      benchmarkInterest:disbuDetail?.kfsDetails?.benchmarkinterestRate || "NA",//page no.1
      SpreadInterestRate:disbuDetail?.kfsDetails?.SpreadInterestRate || "NA",//page no.1



      agreementdate:formatDate(sanctionPendencyDetails?.sanctionDate)||"NA",
      // placeOfExecution:disbuDetail?.preDisbursementForm?.placeOfExecution||"NA",
      placeOfExecution:branchName||"NA",

      processingfees:disbuDetail?.kfsDetails?.processingFees || "NA",//page no.1
      insuranceCharges:disbuDetail?.kfsDetails?.insuranceCharges || "NA",//page no.1
      docCharges:disbuDetail?.kfsDetails?.documentsCharges || "NA",//page no.1
      cersaiCharges:disbuDetail?.kfsDetails?.cersaiCharges || "NA",//page no.1
      pENDENCYlOANnumber:disbuDetail?.preDisbursementForm?.loanNumber || "NA",//page no.1
      sanctionpendencyDate:formatDate(disbuDetail?.preDisbursementForm?.dateOfSanction) || "NA",//page no.1
      customerName : applicantDetails?.fullName || "NA",//page no.1
      address : address,
      appMob1 : applicantDetails?.mobileNo || "NA",//page no.1

      customerID: sanctionPendencyDetails?.partnerCustomerId|| "NA",
      loanBorrowerName : applicantDetails?.fullName || "NA",
      loanCoborrowerName : coApplicantDetails[0]?.fullName || "NA" ,
      loanCoborrowerNameTwo : coApplicantDetails[1]?.fullName || "" ,
      loanGuarantorName : guarantorDetails?.fullName || "NA",
      product :  "Agri Micro Loan Against Property",
      loanAmount :finalsanctionDetails?.finalLoanAmount|| "NA",
      loanAmountinwords :finalsanctionDetails?.loanAmountInWords|| "NA",
      tenureinMonths: finalsanctionDetails?.tenureInMonth||"NA",
      emiAmount:finalsanctionDetails?.emiAmount|| "NA",
      interestRate : finalsanctionDetails?.roi || "NA",//roi
      interestType : disbuDetail?.kfsDetails?.SpreadInterestRate||"NA",//cam
      annualPercentageRateAprPercentage: disbuDetail?.kfsDetails?.annualPercentageRateAprPercentage||"NA",//cam
      epi:disbuDetail?.kfsDetails?.epi||"NA",//cam
      noOfEpi:disbuDetail?.kfsDetails?.noOfEpi||"NA",//cam
      prepaymentCharges : "NA",
      PURPOSEoFlOAN:loanPurpose|| "NA",
      penalCharges: "2 % per month on the overdue amount plus applicable Taxes in the event of default in repayment of loan instalments.\n\n 2 % per month on the outstanding loan facility amount plus applicable taxes\n for non-compliance of agreed terms and conditions mentioned in the\n Sanction Letter.",
      DSRA : "NIL",
      emiPaymentBank : appPdcDetails?.bankName || 'NA',
      accNumber: appPdcDetails?.accountNumber || "NA",
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
      specialTermsConditionOne: `Repayment to be taken from ${appPdcDetails?.bankName} - saving account of M/s ${appPdcDetails?.acHolderName}  – A/c ${appPdcDetails?.accountNumber}`,
      AddressDetails: technicalDetails?.fullAddressOfProperty || "NA",//page 4
      propertyOwner: technicalDetails?.nameOfDocumentHolder || "NA",
      SecurityDetailsArea: `Land Area - ${technicalDetails?.totalLandArea}`,
      Construction: ` ${technicalDetails?.totalBuiltUpArea} __ Sq. Ft`,
      detailsOfSecurity:technicalDetails?.fullAddressOfProperty||"NA",

    }
      const pdfPath = await sanctionLetterPdf(allPerameters,logo,partnerName);
      // console.log("sanctionLetterPdf", sanctionLetterPdf);
      // console.log("http://localhost:5500" + pdfPath);
  
      if (!pdfPath) {
       console.log("Error generating the Sanction Letter Pdf")
      }
      console.log(pdfPath,"sanction pdfpath")

      const uploadResponse = await uploadPDFToBucket(pdfPath, `fincooperSanctionLetter${Date.now()}.pdf`);
        const url = uploadResponse.url
        console.log(url,"url")     

        await finalsanctionModel.findOneAndUpdate(
          { customerId }, 
          {
            $set: { "fcplPdfUrls.fincooperSanctionLetterPdf": url } 
          },
        { new: true, upsert: true } 
      );
      
        console.log(pdfPath,"sanction pdfpath")
        // return pdfPath
        // success(res, "PDF generated successfully", pdfPath);
        // return pdfPath
        return (
          {
            SANCTION_LETTER:url,
        });
      // return pdfPath
      // success(res, "PDF generated successfully", pdfPath);
      // return pdfPath
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



// async function generateSanctionLetterPdf(req, res) {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return serverValidation({
//         errorName: "serverValidation",
//         errors: errors.array(),
//       });
//     }

//     const candidateDetails = "Data";

//     const pdfPath = await sanctionLetterPdf(candidateDetails);
//     // console.log("pdfPath", pdfPath);
//     console.log("http://localhost:5500" + pdfPath);

//     if (!pdfPath) {
//       return res.status(500).json({
//         errorName: "pdfGenerationError",
//         message: "Error generating the Sanction Letter Pdf",
//       });
//     }

//     success(res, "PDF generated successfully", pdfPath);
//   } catch (error) {
//     console.log(error);
//     unknownError(res, error);
//   }
// }

module.exports = { sanctionLetterPdf, FincooperSanctionLetterPdf };
