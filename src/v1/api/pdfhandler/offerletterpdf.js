import PDFDocument from "pdfkit";
import fs from "fs";
import moment from "moment";
import stream from "stream";
import uploadToSpaces from "../services/spaceservices/space.service.js";
import axios from "axios";
import { fileURLToPath } from 'url';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const offerLetterPDF=async(
  candidateDetails,
  position,
  packages,
  joiningDate,
  company,
  PF,
  ESIC
)=> {
  // console.log(ESIC);
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");
  //----salary annexure data------
  // Function to format numbers with commas
  const formatNumber = (num) => {
    return Number(num).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const lpa = packages;
  const gross = lpa / 12; // Monthly gross salary
  const basic = gross / 2; // Basic salary (50% of gross)

  const hra = 0.4 * gross; // 40% of gross
  const specialAllowance = 0.1 * gross; // 10% of gross
  let epf = 0;
  let pfDeduction = 0;

  if (PF === "yes") {
    if ((gross - hra) > 15000) {
      epf = Math.round(0.1316 * 15000); // 13.61% of 15000, rounded to nearest integer
      pfDeduction = Math.round(0.12 * 15000); // 12% of 15000, rounded to nearest integer
    } else {
      epf = Math.round(0.1316 * (gross - hra)); // 13.61% of (gross - HRA), rounded to nearest integer
      pfDeduction = Math.round(0.12 * (gross - hra)); // 12% of (gross - HRA), rounded to nearest integer
    }
  } else if (PF === "no") {
    epf = 0;
    pfDeduction = 0;
  }
  // const epf = (0.1316 * (gross - hra)).toFixed(2); // 13.61% of (gross - HRA)

  // Calculate ESIC based on gross
  // console.log(ESIC);
  let esic = 0;
  let esicDeduction = 0;
  if (ESIC === "yes") {
    // console.log(gross);
    if (gross < 21000) {
      // console.log("gross");
      esicDeduction = Math.round(0.0075 * gross);
      // console.log(esicDeduction);
      esic = Math.round(0.0325 * gross); // 3.25% of (gross - HRA)
    } else {
      esicDeduction = 0;
      esic = 0; // No ESIC if gross is 21000 or more
    }
  }

  const subtotal = Math.round(parseFloat(epf) + parseFloat(esic)); // Subtotal
  const costOfCompany = Math.round(parseFloat(gross) + parseFloat(subtotal)); // Cost to company
  
  const totalDeduction = Math.round(parseFloat(pfDeduction) + parseFloat(esicDeduction));

  const inHand = Math.round(parseFloat(gross) - parseFloat(totalDeduction));

  // Helper function to draw a border around the page
  function drawBorder() {
    const pageHeight = doc.page.height;
    const margin = 30;
    const lineWidth = 2.2;
    const bottomGap = 60;
    // Draw a left border line
    doc.lineWidth(lineWidth);
    doc
      .moveTo(margin, margin) // Starting point of the line (top-left corner)
      .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
      .strokeColor("#324e98") // Set the color of the border
      .stroke();
  }

  // Function to add logo to every page
  function addLogo() {
    if (fs.existsSync(pdfLogo)) {
      doc.image(pdfLogo, 370, 30, {
        fit: [200, 50],
        align: "right",
        valign: "bottom",
      });
    } else {
      console.error(`Logo file not found at: ${pdfLogo}`);
    }
  }

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
      .font(font)
      .fontSize(8)
      .fillColor("#505050")
      .text(
        "This offer letter is system-generated and does not require a signature.",
        pageWidth,
        pageHeight - 120,
        { align: "center" }
      );

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
      .lineWidth(2.2)
      .stroke();
  }

  // Add a function to draw black table borders
  function drawThreeColumnTable(tableData) {
    // Define column widths
    const columnWidths = [260, 120, 120]; // First column wider than the others
    const startX = 50;
    let startY = doc.y + 10;

    // Render table rows
    tableData.forEach((row, rowIndex) => {
      doc.lineWidth(0.5);

      let valueRowHeight = 23;
      let fontSize = 10.5;
      if ([0, 5, 8, 9].includes(rowIndex)) {
        // fontSize = 11; // Larger font for specific rows
        valueRowHeight = 28;
      }
      if ([6].includes(rowIndex)) {
        fontSize = 8.5;
      }

      // Draw each cell
      columnWidths.forEach((width, colIndex) => {
        const xPosition =
          startX + columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);

        if ([0, 5, 8].includes(rowIndex)) {
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .rect(xPosition, startY, width, valueRowHeight)
            .fillAndStroke("#00a7ff", "#000000")
            .stroke("black")
            .fill();
        }
        // Set background color
        doc
          .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
          .rect(xPosition, startY, width, valueRowHeight)
          .stroke("black")
          .fill();

        // Draw text in each cell
        const cellText = row[`field${colIndex + 1}`]; // Assuming your row has field1, field2, field3
        doc
          .font(font)
          .fillColor("black")
          .fontSize(fontSize)
          .text(cellText, xPosition + 5, startY + 5, {
            baseline: "hanging",
            width: width - 10, // Leave some padding
          });
      });

      // Move to the next row position
      startY += valueRowHeight;
    });
  }

  // Add a function to draw black table borders
  function drawTable(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const columnWidths = [380, 120];

    const keyWidth = Math.round(columnWidths[0]);
    const valueWidth = Math.round(columnWidths[1]);
    // console.log(columnWidths[0], keyWidth, valueWidth);
    //----salary annexure data------
    const salary =
      // Render table rows
      tableData.forEach((row, rowIndex) => {
        // Alternate row background color
        doc.lineWidth(0.5);

        let valueRowHeight = 23;
        let fontSize = 10;

        if ([0, 4].includes(rowIndex)) {
          // fontSize = 11; // Larger font for specific rows
          valueRowHeight = 28;
        }
        if ([0, 4].includes(rowIndex)) {
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
            .fillAndStroke("#00a7ff", "#000000")
            .rect(startX, startY, keyWidth, valueRowHeight)
            .fill();
          doc
            .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff") // Same alternating color logic
            .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
            .fillAndStroke("#00a7ff", "#000000") // Fill with color and stroke
            .fill();
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
          .fontSize(fontSize)
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
          .fontSize(fontSize)
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

  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir, { recursive: true });
  // }

  const timestamp = Date.now();
  const dateFormatted = new Date(timestamp)
    .toLocaleDateString("en-US")
    .replace(/\//g, "-");
  const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`);
  const candidateNamePDF = capitalizeFirstLetter(
    candidateDetails.name.replace(/\s+/g, "")
  );

const bucketName = 'finexe';
const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/OfferLetter-${candidateNamePDF}-${dateFormatted}-${timestamp}.pdf`;

  // const pdfFilename = `OfferLetter-${candidateNamePDF}-${dateFormatted}-${timestamp}.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);

  const bufferStream = new stream.PassThrough();
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(bufferStream);

  // doc.pipe(stream);

  // Add logo and border to the first page
  addLogo();
  // addWatermark();
  drawBorder();

  const pageWidth = 595.28;
  const imageWidth = 200;

  // Title styling for OFFER LETTER in uppercase and underlined

  doc.moveDown(5);

  // Define and format candidate name and current date
  const candidateNameText = capitalizeFirstLetter(candidateName);
  const formattedDate = moment().format("MMMM Do, YYYY");

  // Print the candidate name
  doc.fontSize(12).font(font).fillColor("#000000").text(candidateNameText);

  // Move down slightly and add the date directly below the name
  doc.moveDown(0.05);
  doc.text(candidateDetails.branchId.name);
  doc.moveDown(0.05);
  doc.text(formattedDate);
  // Add some space after the date
  doc.moveDown(2);
  doc
    .fontSize(16)
    .font(fontBold)
    .text("OFFER LETTER", { align: "center", underline: true });
  doc.moveDown(2);

  // Addressing candidate
  doc.fontSize(12).font(font).text(`Dear,`, {
    align: "left",
  });
  // Offer letter content with grammatical improvements
  doc.moveDown(1);
  doc
    .font(font)
    .fontSize(12)
    .text(
      `We are pleased to offer you the position of ${position} at ${company} from ${moment(joiningDate).format(
        "MMMM Do, YYYY"
      )} on the following terms and conditions: `,
      { lineGap: 4, align: "justify" }
    );

  doc.moveDown(1);
  // Adding content with headers and formatting
  // Define the fixed margins for headers and content
  const headingMargin = 50; // Moves headings slightly left
  const contentMargin = 72; // Keeps content aligned with the main paragraph
  const contentWidth = 450; // Fixed width for consistent wrapping

  // Helper function to add section with aligned header and content
  function addIndentedSection(doc, heading, content) {
    const headingMargin = 50; // Define margin for heading
    const contentMargin = 70; // Define margin for content
    const contentWidth = doc.page.width - contentMargin - headingMargin; // Width for content
    const lineHeight = 20; // Estimated line height for spacing adjustments

    // Add the heading, positioned slightly to the left
    doc
      .font(fontBold)
      .fontSize(12)
      .text(heading, headingMargin, doc.y, { lineGap: 0.05 });

    // Estimate the height of the content by the length of the content and add new pages as needed
    let contentHeightEstimate = doc.heightOfString(content, {
      width: contentWidth,
      align: "justify",
      lineGap: 1,
    });

    // Check if the content fits on the current page
    if (doc.y + contentHeightEstimate > doc.page.height - 50) {
      // 50 for bottom margin
      doc.addPage();
      doc.y = 50; // Start from a top margin on the new page
    }

    // Add the content aligned with contentMargin, directly below the heading
    doc
      .font(font)
      .fontSize(10) // Adjust font size here as needed
      .text(content, contentMargin, doc.y + 10, {
        width: contentWidth,
        align: "justify",
        lineGap: 1,
      });

    doc.moveDown(1); // Adds spacing after each section
  }

  // new function addeded
  function addIndentedSectionBullet(doc, heading, content) {
    const headingMargin = 50; // Margin for heading
    const contentMargin = 70; // Margin for content
    const contentWidth = doc.page.width - contentMargin - headingMargin; // Width for content

    // Add the heading
    doc
      .font(fontBold)
      .fontSize(12)
      .text(heading, headingMargin, doc.y, { lineGap: 0.05 });

    // Add space between the heading and content
    doc.moveDown(1.5); // Adjust the value for desired space

    // Split content into lines by newline characters
    const contentLines = content
      .trim()
      .split("\n")
      .map((line) => line.trim());

    // Loop through each line to add bullet points
    contentLines.forEach((line, index) => {
      // Check if the current line would exceed the page height, and add a new page if necessary
      if (doc.y + 20 > doc.page.height - 50) {
        // Adjust 50 for bottom margin
        doc.addPage();
        doc.y = 50; // Start from top margin on new page
      }

      // Add each line as a bullet point
      doc
        .font(font)
        .fontSize(10) // Adjust font size if needed
        .text(`• ${line}`, contentMargin, doc.y, {
          width: contentWidth,
          align: "left",
          lineGap: 1,
        });

      doc.moveDown(0.5); // Adds spacing after each bullet point
    });

    doc.moveDown(1); // Adds additional spacing after the section
  }

  // Using the function to add sections with aligned headings and content

  // 1. Reporting
  addIndentedSection(
    doc,
    "1. Reporting:",
    "You will report to your Senior Manager."
  );

  // 2. Responsibilities & Duties
  addIndentedSection(
    doc,
    "2. Responsibilities & Duties:",
    `Your work in the organization will be subject to the rules and regulations of the Company as laid down in relation to conduct, discipline, and other matters. You will always be aware of the responsibilities and duties attached to your position and conduct yourself accordingly.`
  );

  // 3. Remuneration
  addIndentedSection(
    doc,
    "3. Remuneration:",
    `• Fixed Remuneration and Flexi Pay Components: You would be entitled to Total Fixed Pay inclusive of all retrials and Flexi Pay aggregating INR ${lpa} per annum as cost to company. Refer to Annexure -1 for the applicable compensation breakdown.\n• Incentive: You will be entitled to an incentive as per the Company's Incentive Scheme, subject to your performance and contribution.`
  );

  // 4. Month-on-Month Target
  addIndentedSection(
    doc,
    "4. Month-on-Month Target:",
    `• As part of your employment as  ${position}, you will be expected to achieve certain performance targets on a month-to-month basis to meet both personal and company objectives.\n• Target Review Process: Your performance will be reviewed monthly based on these key metrics. Adjustments to targets, if necessary, will be communicated at the start of each quarter. Targets may be adjusted according to business needs, market conditions, and prior performance.`
  );

  addIndentedSection(
    doc,
    "5. Working Hours: ",
    `Your standard working hours will be from 10:00 to 7:00. Any changes in your work schedule will be communicated as needed. `
  );

  doc.moveDown(3);

  // Add footer at the end of the second page
  addFooter();

  doc.moveDown(3);

  // add new page
  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(5);
  addIndentedSection(
    doc,
    "6. Probation Period: ",
    `You will be on probation for a period of 3 months from the date of your appointment. Your confirmation will be subject to maintaining minimum threshold of performance. During the period of probation, this contract of employment is terminable by 30 days (thirty days only) notice on either side or on payment of 30 days of Gross Pay in lieu thereof. `
  );
  doc.moveDown(0.5);

  addIndentedSection(
    doc,
    "7. Background Verification: ",
    `Your appointment is subject to satisfactory Background Verification Check, which will be conducted by an appointed external agency. Non-compliance may lead to withholding of salary and/or termination of employment. `
  );

  doc.moveDown(0.5);

  addIndentedSection(
    doc,
    "8. Leave: ",
    `You will be eligible for leave as per Company's policy prevalent from time to time, which will be notified to you separately`
  );

  doc.moveDown(0.5);
  addIndentedSection(
    doc,
    "9. Other Benefits ",
    `You will be eligible for medical and insurance benefits applicable per Company's policy. These benefits would be in addition to your fixed remuneration. `
  );

  doc.moveDown(0.5);
  addIndentedSection(
    doc,
    "10. Holidays: ",
    `You will be entitled to the public holidays observed by the Company. `
  );

  doc.moveDown(0.5);
  addIndentedSection(
    doc,
    "11. Retirement: ",
    `The retirement age is 58 years.`
  );

  doc.moveDown(0.5);
  addIndentedSection(
    doc,
    "12. Transfer: ",
    `Your initial job posting will be in Indore. You will be liable to be transferred in such capacity that the management may determine, to any other department, branch, unit, factory or establishment under the same management or same principals, whether existing or to be set up in future in any part of India .In such cases, you will be governed by the terms and conditions of service applicable at the new placement. You can also be transferred to another firm or another company, which is an associate/ sister/subsidiaries concern of this company, or in which this company has any interest, either financial or managerial, provided your total emoluments are not adversely affected.  `
  );

  doc.moveDown(0.5);
  addIndentedSection(
    doc,
    "13. Performance Standard: ",
    `You shall maintain high level of performance throughout the year. High level of performance means the standards set by Fin Coopers for a year or for a particular period or more. The performance would be reviewed by the concerned Head of Department from time to time. If the performance is found to be unsatisfactory for consecutive periods /years, you will be liable to be proceeded under the code of conduct and discipline rules. `
  );

  addFooter();

  // third page //

  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(5);

  addIndentedSection(
    doc,
    "14. Confidentiality:",
    `You will always comply with Fin Coopers Code of Conduct, Discipline Rules, Breach of Integrity and prescribed IT Policies and Information Security Policies and, such other policies/ processes, which are either framed or amended from time to time or in force for the time  being, and are available on company's intranet.
       You will maintain secrecy and will not disclose to third persons any of the trade secrets or other confidential information of the Company or its affiliated companies, including but not 
       limited to, proprietary technical data, specifications and methods of manufacture. You will take all appropriate measures necessary to keep such trade secrets and confidential information from being disclosed to, or received by third parties. 
       Such trade secrets, proprietary technical data, specifications and methods of manufacture shall, at all times, remain the property of the Company. 
       This duty of confidentiality will continue to remain in force even after you leave employment with the Company.`
  );
  addIndentedSection(
    doc,
    "15. No Compete Clause :",
    `During the term of your employment with the Company, you shall not, whether on your own behalf or on the behalf of any other person, firm or company (whether as partner, agent, director, employee or consultant or in any other capacity whatsoever) directly or indirectly be engaged in  or interested in any trade or business situated in India or competing with any trade or business  being carried on by the Company. `
  );

  doc.moveDown(1);

  addIndentedSection(
    doc,
    "16. Separation Clause ",
    `This contract of employment is terminable by 60 days’ notice on either side or on payment of 60 days Gross Pay in lieu of notice and either party is not bound to give any reason. However, in the  event of fraud, theft, discrepancy or withholding of any information in the Application form or for  any other form of misconduct by you, your services shall liable to be terminated forthwith and  without and notice pay. 
In the event of your unauthorized absence from duty for the continuous period of 5 working days, you shall be deemed to have relinquished the employment on your own and shall have no right to resume duty. The company shall be fully empowered to settle your final account subject to your having returned all company assets, documents, information in your custody and / or provided to you during the course of your employment with the company. 
`
  );

  addIndentedSection(
    doc,
    "17. AfterSeparation: ",
    `On termination of this contract, you will immediately return to the Company all correspondence,  specifications, formulae, books documents, effects, market data, cost data, drawings or records  etc. belonging to the Company or relating to its business and shall not retain or make any copies  of these items.`
  );

  addIndentedSection(
    doc,
    "18. Conflict of Interest:",
    `You are required to devote your full attention and abilities to your job during  working hours and to act in the best interest of the organization at all times. You must not, without the written consent of the Company, engage directly or indirectly with any other business undertaking wherethere is likely to be conflict of interest with the Company. `
  );

  addFooter();

  // newpage -4 //

  doc.addPage();
  addLogo();
  drawBorder();
  doc.moveDown(10);
  addIndentedSectionBullet(
    doc,
    "You are Requested to brings along the below listed documents on your day of Joining. ",
    `
            Copy of Cum Appointment Letter. 
            Identification Proof (Aadhar Card or Pan Card) 
            Copy Of Academic Certificate. 
            Relieving Letter(you would need to submit recent relieving letter within 60 days of your joining).
            Proof of last drawn compensation 
            Address Proof with Update Current Address 
            Four Passport Size Photo
            One Cancelled Cheque from your current operational Bank account.

      `
  );

  addIndentedSection(
    doc,
    " ",
    `This Offer is valid subject to joining on ${moment(joiningDate).format(
      "MMMM Do, YYYY"
    )}.`
  );

  doc.moveDown(1);

  addIndentedSection(
    doc,
    "",
    `Please confirm that the above terms and conditions are acceptable to you and that you accept\nthe appointment by signing a copy of this letter of appointment. `
  );

  doc.moveDown(1);

  // Now I want to add Yours sincerly and then new line add For and Fin Coopers add which is in boild
  addIndentedSection(doc, "", `Yours sincerely,\nFor ${company}`);

  doc.moveDown(1);

  addIndentedSection(
    doc,
    "",
    `I hereby confirm having read and understood all terms & conditions mentioned above and\naccept employment as per above Letter of Offer. `
  );

  doc.moveDown(1);

  // I want to add Name and Data //

  addIndentedSection(
    doc,
    "",
    `Name: ${candidateName}  \n Date: ${formattedDate}`
  );

  // add the footer
  addFooter();

  //  TABLES//
  // ---------------------------------------Add logo, border, and move content to the next page--------------------------------
  doc.addPage();
  addLogo();
  // addWatermark();
  drawBorder();
  doc.moveDown(12);
  doc
    .fontSize(16)
    .font(fontBold)
    .fillColor("#black") // Set the same color as in the offer letter underline
    .text("Salary Annexure", { align: "center" });

  // Draw the underline
  const titleWidth = doc.widthOfString("Salary Annexure");
  const titleX = (doc.page.width - titleWidth) / 2; // Center the title
  const titleY = doc.y; // Current vertical position

  doc
    .moveTo(titleX, titleY + 3) // Move down slightly for the underline
    .lineTo(titleX + titleWidth, titleY + 3) // Draw the line the width of the title
    .strokeColor("#324e98") // Use the same color as the title
    .lineWidth(1)
    .stroke();

  doc.moveDown(1.5);

  const sampleData = [
    {
      field1: "Fixed Pay Components",
      field2: "Monthly INR",
      field3: "Annually INR",
    },
    { field1: "Basic ", field2: Math.round(basic), field3: basic * 12 },
    {
      field1: "House Rent Allowance",
      field2: Math.round(hra),
      field3: hra * 12,
    },
    {
      field1: "Statutory Bonus Allowance",
      field2: "0",
      field3: "0",
    },
    {
      field1: "Special Allowance",
      field2: Math.round(specialAllowance),
      field3: specialAllowance * 12,
    },
    { field1: "Gross Salary", field2: Math.round(gross), field3: lpa },
    {
      field1: "Company's contribution To EPF(12 % + 1.16% EDIL Of Basic Pay)",
      field2: epf,
      field3: epf * 12,
    },
    {
      field1: "Company's Contribution to ESIC (3.25 % Of Gross Pay)",
      field2: esic,
      field3: esic * 12,
    },
    {
      field1: "Sub Total",
      field2: Math.round(subtotal),
      field3: Math.round(subtotal * 12),
    },
    {
      field1: "Cost Of Company",
      field2: costOfCompany,
      field3: costOfCompany * 12,
    },
    // Add more rows as needed
  ];

  // Call the function to draw the table
  drawThreeColumnTable(sampleData);

  doc.moveDown(1.5);

  const tableData = [
    { field1: "Deduction ", value1: "Per Month" },
    {
      field1: "PF (Employee Contribution @12% of Basic Pay)",
      value1: pfDeduction,
    },
    {
      field1: "ESIC (Employee Contribution @0.75% Of Gross salary)",
      value1: esicDeduction,
    },
    { field1: "Professional Tax", value1: 0 },
    { field1: "Total Deduction", value1: totalDeduction },
  ];
  drawTable(tableData);
  doc.moveDown(1.5);

  const tableDataTwo = [
    { field1: "In Hand Salary Per Month (Approx.) ", value1: inHand },
  ];
  drawTable(tableDataTwo);
  addFooter();

  // Finalize the PDF
  doc.end();
  const chunks = [];
for await (const chunk of bufferStream) {
  chunks.push(chunk);
}
const pdfBuffer = Buffer.concat(chunks);

// Upload to DigitalOcean Spaces
const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');

const pdfFileUrl = `https://cdn.fincooper.in/${pdfFilename}`
return pdfFileUrl; 

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve(pdfFileUrl);
    });
    stream.on("error", reject);
  });
}



  // new function addeded
  function addIndentedSectionBullet(doc, heading, content) {
    const headingMargin = 50; // Margin for heading
    const contentMargin = 70; // Margin for content
    const contentWidth = doc.page.width - contentMargin - headingMargin; // Width for content

    // Add the heading
    doc
      .font(fontBold)
      .fontSize(12)
      .text(heading, headingMargin, doc.y, { lineGap: 0.05 });

    // Add space between the heading and content
    doc.moveDown(1.5); // Adjust the value for desired space

    // Split content into lines by newline characters
    const contentLines = content
      .trim()
      .split("\n")
      .map((line) => line.trim());

    // Loop through each line to add bullet points
    contentLines.forEach((line, index) => {
      // Check if the current line would exceed the page height, and add a new page if necessary
      if (doc.y + 20 > doc.page.height - 50) {
        // Adjust 50 for bottom margin
        doc.addPage();
        doc.y = 50; // Start from top margin on new page
      }

      // Add each line as a bullet point
      doc
        .font(font)
        .fontSize(10) // Adjust font size if needed
        .text(`• ${line}`, contentMargin, doc.y, {
          width: contentWidth,
          align: "left",
          lineGap: 1,
        });

      doc.moveDown(0.5); // Adds spacing after each bullet point
    });

    doc.moveDown(1); // Adds additional spacing after the section
  }

  function addIndentedSection(doc, heading, content) {
    const headingMargin = 50; // Define margin for heading
    const contentMargin = 70; // Define margin for content
    const contentWidth = doc.page.width - contentMargin - headingMargin; // Width for content
    const lineHeight = 20; // Estimated line height for spacing adjustments

    // Add the heading, positioned slightly to the left
    doc
      .font(fontBold)
      .fontSize(12)
      .text(heading, headingMargin, doc.y, { lineGap: 0.05 });

    // Estimate the height of the content by the length of the content and add new pages as needed
    let contentHeightEstimate = doc.heightOfString(content, {
      width: contentWidth,
      align: "justify",
      lineGap: 1,
    });

    // Check if the content fits on the current page
    if (doc.y + contentHeightEstimate > doc.page.height - 50) {
      // 50 for bottom margin
      doc.addPage();
      doc.y = 50; // Start from a top margin on the new page
    }

    // Add the content aligned with contentMargin, directly below the heading
    doc
      .font(font)
      .fontSize(10) // Adjust font size here as needed
      .text(content, contentMargin, doc.y + 10, {
        width: contentWidth,
        align: "justify",
        lineGap: 1,
      });

    doc.moveDown(1); // Adds spacing after each section
  }

// make another offer letter pdf 2

// async function offerLetterPDF2
// (candidateDetails,
//   position,
//   packages,
//   joiningDate,
//   company){

//   const font = "assets/font/Cambria.ttf";
//   const fontBold = "assets/font/Cambria-Bold.ttf";

//   const lpa = packages;
//   const gross = lpa / 12; // Monthly gross salary
//   const basic = gross / 2; // Basic salary (50% of gross)
//   const hra = 0.4 * gross; // 40% of gross
//   const specialAllowance = 0.1 * gross; // 10% of gross

//     // Helper function to draw a border around the page
//     function drawBorder() {
//       const pageHeight = doc.page.height;
//       const margin = 30;
//       const lineWidth = 2.2;
//       const bottomGap = 60;
//       // Draw a left border line
//       doc.lineWidth(lineWidth);
//       doc
//         .moveTo(margin, margin) // Starting point of the line (top-left corner)
//         .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
//         .strokeColor("#324e98") // Set the color of the border
//         .stroke();
//     }

//     // Add the logo to every page //
//     function addLogo() {
//       if (fs.existsSync(pdfLogo)) {
//         doc.image(pdfLogo, 370, 30, {
//           fit: [200, 50],
//           align: "right",
//           valign: "bottom",
//         });
//       } else {
//         console.error(`Logo file not found at: ${pdfLogo}`);
//       }
//     }

//     // Add the watermark to every page //
//     function addWatermark() {
//       if (fs.existsSync(watermarklogo)) {
//         doc.save();
//         doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
  
//         doc.image(
//           watermarklogo,
//           doc.page.width / 2 - 200,
//           doc.page.height / 2 - 200,
//           {
//             fit: [450, 400],
//             opacity: 0.05,
//             align: "center",
//             valign: "center",
//           }
//         );
  
//         doc.restore();
//       } else {
//         console.error(`Logo file not found at: ${watermarklogo}`);
//       }
//     }


//     // Add a footer with border and stylized text //

//     function addFooter() {
//       const pageWidth = doc.page.margins.left;
//       const pageHeight = doc.page.height;
//       doc
//         .font(font)
//         .fontSize(8)
//         .fillColor("#505050")
//         .text(
//           "This offer letter is system-generated and does not require a signature.",
//           pageWidth,
//           pageHeight - 120,
//           { align: "center" }
//         );
  
//       doc
//         .font(fontBold)
//         .fontSize(6.3)
//         .fillColor("#324e98")
//         .text("FinCoopers Capital Pvt Ltd", pageWidth, pageHeight - 80, {
//           align: "center",
//         });
//       doc
//         .font(fontBold)
//         .fontSize(6.3)
//         .fillColor("#000000")
//         .text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", {
//           align: "center",
//         });
//       doc
//         .font(fontBold)
//         .fontSize(6.3)
//         .fillColor("#000000")
//         .text("CIN: 67120MP1994PTC008686", { align: "center" });
//       doc
//         .font(fontBold)
//         .fontSize(6.3)
//         .fillColor("#000000")
//         .text("Phone: +91 7374911911 | Email: hr@fincoopers.com", {
//           align: "center",
//         });
  
//       // Add a separator line above the footer
//       doc
//         .moveTo(50, doc.page.height - 100)
//         .lineTo(doc.page.width - 50, doc.page.height - 100)
//         .strokeColor("#324e98")
//         .lineWidth(2.2)
//         .stroke();
//     }

//     function drawTable(tableData) {
//       // Add Table Header
//       const startX = 50;
//       let startY = doc.y + 10;
//       const columnWidths = [380, 120];
  
//       const keyWidth = Math.round(columnWidths[0]);
//       const valueWidth = Math.round(columnWidths[1]);
//       // console.log(columnWidths[0], keyWidth, valueWidth);
//       //----salary annexure data------
//       const salary =
//         // Render table rows
//         tableData.forEach((row, rowIndex) => {
//           // Alternate row background color
//           doc.lineWidth(0.5);
  
//           let valueRowHeight = 23;
//           let fontSize = 10;
  
//           if ([0, 4].includes(rowIndex)) {
//             // fontSize = 11; // Larger font for specific rows
//             valueRowHeight = 28;
//           }
//           if ([0, 4].includes(rowIndex)) {
//             doc
//               .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//               .fillAndStroke("#00a7ff", "#000000")
//               .rect(startX, startY, keyWidth, valueRowHeight)
//               .fill();
//             doc
//               .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff") // Same alternating color logic
//               .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
//               .fillAndStroke("#00a7ff", "#000000") // Fill with color and stroke
//               .fill();
//           }
//           doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX, startY, keyWidth, valueRowHeight)
//             .stroke("black")
//             .fill();
  
//           // Draw text in each cell
//           doc
//             .font(font)
//             .fillColor("black")
//             .fontSize(fontSize)
//             .text(row.field1, startX + 5, startY + 5, {
//               baseline: "hanging",
//               width: keyWidth,
//             });
//           // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)
  
//           // Alternate row background color
//           doc
//             .fillColor(rowIndex % 2 === 0 ? "#f5f5f5" : "#ffffff")
//             .rect(startX + keyWidth, startY, valueWidth, valueRowHeight)
//             .stroke()
//             .fill();
  
//           // Draw text in each cell
//           doc
//             .font(font)
//             .fillColor("black")
//             .fontSize(fontSize)
//             .text(row.value1, startX + keyWidth + 5, startY + 5, {
//               baseline: "hanging",
//               width: valueWidth,
//             });
  
//           // Move to next row position
//           startY += valueRowHeight;
//         });
  
//       // Add another section as an example
//       // doc.moveDown().fontSize(12).text('Sourcing Details');
  
//       // You can continue adding more tables/sections in a similar fashion
//     }


//     const timestamp = Date.now();
//     const dateFormatted = new Date(timestamp)
//       .toLocaleDateString("en-US")
//       .replace(/\//g, "-");
//     const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`);
//     const candidateNamePDF = capitalizeFirstLetter(
//       candidateDetails.name.replace(/\s+/g, "")
//     );
  
//     const bucketName = 'finexe';
//     const pdfFilename = `${process.env.PATH_BUCKET}/LOS/PDF/OfferLetter-${candidateNamePDF}-${dateFormatted}-${timestamp}.pdf`;

  
//     const bufferStream = new stream.PassThrough();
//     const doc = new PDFDocument({ margin: 50, size: 'A4' });
//     doc.pipe(bufferStream);


//     // Add logo and border to the first page
//     addLogo();
//     // addWatermark();
//     drawBorder();

//     const pageWidth = 595.28;
//     const imageWidth = 200;

//     // Title styling for OFFER LETTER in uppercase and underlined

//     const candidateNameText = capitalizeFirstLetter(candidateName);
//     const formattedDate = moment().format("MMMM Do, YYYY");

//     // Print the candidate name
//     doc.fontSize(12).font(font).fillColor("#000000").text(candidateNameText);
//     doc.moveDown(0.05);
//     doc.text(candidateDetails.branchId.name);
//     doc.moveDown(0.05);
//     doc.text(formattedDate);
//     doc.moveDown(2);
//     doc
//       .fontSize(16)
//       .font(fontBold)
//       .text("OFFER LETTER", { align: "center", underline: true });

//     doc.moveDown(2);

//     doc.fontSize(12).font(font).text(`Dear,`, {
//       align: "left",
//     });

//     doc.moveDown(1);
//     doc
//       .font(font)
//       .fontSize(12)
//       .text(
//         `We are pleased to offer you the position of ${position} at ${company} from ${moment(joiningDate).format(
//           "MMMM Do, YYYY"
//         )} on the following terms and conditions: `,
//         { lineGap: 4, align: "justify" }
//       );

//     doc.moveDown(1);

//       // 1. Reporting
//   addIndentedSection(
//     doc,
//     "1. Reporting:",
//     "You will report to your Senior Manager."
//   );

//   // 2. Responsibilities & Duties
//   addIndentedSection(
//     doc,
//     "2. Responsibilities & Duties:",
//     `Your work in the organization will be subject to the rules and regulations of the Company as laid down in relation to conduct, discipline, and other matters. You will always be aware of the responsibilities and duties attached to your position and conduct yourself accordingly.`
//   );


//   doc.moveDown(3);

//   // Add footer at the end of the second page
//   addFooter();
//   doc.moveDown(3);


//   // Add new Page //
//   doc.addPage();
//   addLogo();
//   drawBorder();
//   doc.moveDown(5);
//   addIndentedSection(
//     doc,
//     "6. Probation Period: ",
//     `You will be on probation for a period of 3 months from the date of your appointment. Your confirmation will be subject to maintaining minimum threshold of performance. During the period of probation, this contract of employment is terminable by 30 days (thirty days only) notice on either side or on payment of 30 days of Gross Pay in lieu thereof. `
//   );
  
//   // Finalize the PDF
//   doc.end();
//   const chunks = [];
// for await (const chunk of bufferStream) {
//   chunks.push(chunk);

//   const pdfBuffer = Buffer.concat(chunks);

//   // Upload to DigitalOcean Spaces
//   const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');
//   const pdfFileUrl = `https://cdn.fincooper.in/${pdfFilename}`
//   return pdfFileUrl;
// }

//   }

async function fetchImageBuffer(imageUrl) {
  console.log('Fetching image from URL:', imageUrl);
  
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' }); // Get image as buffer
  return response.data; // Return the buffer directly
}

export const generateOfferLetterPDF=async(
  candidateDetails,
  position,
  packages,
  joiningDate,
  company,
  acceptanceDate,
  fontSize = 11,        // Default normal font size
  fontBoldSize = 12     // Default bold font size
)=> {
  const font = 'assets/font/Cambria.ttf';
  const fontBold = 'assets/font/Cambria-Bold.ttf';
  const watermarklogo = 'assets/logo/watermark-logo.png';
  const signatureUrl = 'https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742463191890_signature.jpg';
  const bufferStream = new stream.PassThrough();
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(bufferStream);

  // function addLogo() {
  //   if (fs.existsSync(pdfLogo)) {
  //     doc.image(pdfLogo, 370, 30, { fit: [200, 50] });
  //   }
  // }
//   async function addLogo(doc) {
//     const headerUrl = "https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742463951436_header.png";
//     const headerBuffer = await fetchImageBuffer(headerUrl);

//     if (headerBuffer) {
//         const pageWidth = doc.page.width;  // Get full page width
//         const imageHeight = 100;  // Adjusted height

//         doc.image(headerBuffer, 0, 0, {
//             width: pageWidth, // Set width to full page width
//             height: imageHeight, // Keep desired height
//         });
//     } else {
//         // Display "Header Not Found" message at the top
//         doc.font('Helvetica-Bold')
//            .fontSize(14)
//            .fillColor('red')
//            .text("Header Not Found", 10, 10); // Shift text slightly for visibility
//     }

//     doc.moveDown(2); // Add spacing after the header
// }

// async function addfooter(doc) {
//   const headerUrl = "https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742466268308_footer.png";
//   const headerBuffer = await fetchImageBuffer(headerUrl);

//   if (headerBuffer) {
//       const pageWidth = doc.page.width;  // Get full page width
//       const imageHeight = 50;  // Adjusted height

//       doc.image(headerBuffer, 0, 0, {
//           width: pageWidth, // Set width to full page width
//           height: imageHeight, // Keep desired height
//       });
//   } else {
//       // Display "Header Not Found" message at the top
//       doc.font('Helvetica-Bold')
//          .fontSize(14)
//          .fillColor('red')
//          .text("Header Not Found", 10, 10); // Shift text slightly for visibility
//   }

//   doc.moveDown(2); // Add spacing after the header
// }

function drawBorder() {
  const pageHeight = doc.page.height;
  const margin = 30;
  const lineWidth = 2.2;
  const bottomGap = 60;
  // Draw a left border line
  doc.lineWidth(lineWidth);
  doc
    .moveTo(margin, margin) // Starting point of the line (top-left corner)
    .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
    .strokeColor("#324e98") // Set the color of the border
    .stroke();
}

// Function to add logo to every page

const pdfLogo = path.join(
  __dirname,
  "../../../../assets/image/FINCOOPERSLOGO.png"
);

function addLogo() {
  if (fs.existsSync(pdfLogo)) {
    doc.image(pdfLogo, 370, 30, {
      fit: [200, 50],
      align: "right",
      valign: "bottom",
    });
  } else {
    console.error(`Logo file not found at: ${pdfLogo}`);
  }
}


function drawBorder() {
  const pageHeight = doc.page.height;
  const margin = 30;
  const lineWidth = 2.2;
  const bottomGap = 60;
  // Draw a left border line
  doc.lineWidth(lineWidth);
  doc
    .moveTo(margin, margin) // Starting point of the line (top-left corner)
    .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
    .strokeColor("#324e98") // Set the color of the border
    .stroke();
}



  function boldText(doc, text) {
    doc.font(fontBold).fontSize(fontBoldSize).text(text, { continued: true });
    doc.font(font).fontSize(fontSize); // Reset to normal after bold
  }

  function addWatermark() {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { opacity: 0.05 });
      doc.restore();
    }
  }

  function addFooter() {
    doc.font(fontBold).fontSize(8).fillColor('#324e98').text('Fin Coopers Capital Pvt Ltd', { align: 'center' });
    doc.font(font).fontSize(6.5).fillColor('#000000').text('Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)', { align: 'center' });
    doc.text('CIN: 67120MP1994PTC008686', { align: 'center' });
    doc.text('Phone: +91 7374911911 | Email: hr@fincoopers.com', { align: 'center' });
    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor('#324e98').lineWidth(2.2).stroke();
  }

  // await addLogo(doc);
  addLogo();
  drawBorder();
  doc.moveDown(1);
  addWatermark();
  
  doc.moveDown(2);
  doc.font(fontBold).fontSize(16).text('OFFER LETTER', { align: 'center', underline: true });
  doc.moveDown(2);

  doc.font(fontBold).fontSize(fontSize).text(`${moment().format('MMMM Do, YYYY')}`, { align: 'right' });
  
  doc.font(fontBold).fontSize(fontBoldSize).text(`${candidateDetails.name}`, { align: 'left' });
  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(fontBoldSize).text(`${candidateDetails.preferredLocation},`, { align: 'left' });
  doc.moveDown(0.5);
  doc.font(fontBold).fontSize(fontBoldSize).text(`${candidateDetails.state}`, { align: 'left' });
  doc.moveDown(2);
  
  doc.font(fontBold).fontSize(fontBoldSize).text(`Dear ${candidateDetails.name},`);
  doc.moveDown(1);
  
  // Offer Letter Body
  doc.font(font).fontSize(fontSize);
  doc.text(`We're delighted to extend this offer of employment for the position of `, { continued: true });
  boldText(doc, position);
  doc.text(` with `, { continued: true });
  boldText(doc, company);
  doc.text(`. Please review the terms & conditions for your anticipated employment with us.`);
  doc.moveDown(1);

  // Joining Details
  doc.text(`In summary, your joining date will be `, { continued: true });
  boldText(doc, moment(joiningDate).format('MMMM Do, YYYY'));
  doc.text(`, the starting annual CTC will be INR `, { continued: true });
  boldText(doc, packages.toString());
  doc.text(` and your monthly receivable will be INR `, { continued: true });
  boldText(doc, (packages / 12).toFixed(2));
  doc.text(`, which will be directly deposited in your bank account.`);
  doc.moveDown(1);

  // Shift and Working Days
  doc.text(`You will have to serve the morning shift of `, { continued: true });
  boldText(doc, "10:00 AM to 7:00 PM ");
  doc.text(` every `, { continued: true });
  boldText(doc, " Monday to Saturday ,");
  doc.text(` and for the six month of your joining you will be serving an evaluation/probation period. `, { continued: true });
  doc.text(``);
  doc.moveDown(1);

  doc.text(`If you have any questions or require further information, please do not hesitate to contact the HR Department.`);
  doc.moveDown(1);
  
  doc.text(`We look forward to welcoming you to our team and working together to achieve our company’s goals.`);
  doc.moveDown(3);

  // Signature Section//
  doc.font(fontBold).text(`Thanks & Regards,`);
  doc.moveDown(1);
  doc.text(`Payal Soni`, { align: 'left' });
  doc.moveDown(0.5);
  const signatureBuffer = await fetchImageBuffer(signatureUrl);
  // Add the signature image
  doc.image(signatureBuffer, {
      fit: [100, 50], // Adjust size
      align: 'left'
  });

  doc.moveDown(4);
  doc.text(`Human Resource Manager`, { align: 'left' });
  doc.moveDown(1);
  doc.text(`Fin Coopers Capital Private Limited`, { align: 'left' });
  // await addfooter(doc);
  doc.moveDown(3);

  addFooter();

  // Finalize the PDF
  doc.end();
  const chunks = [];
  for await (const chunk of bufferStream) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  // Upload to DigitalOcean Spaces
  const bucketName = 'finexe';
  const pdfFilename = `OfferLetter-${candidateDetails.name.replace(/\s+/g, '')}-${moment().format('YYYYMMDDHHmmss')}.pdf`;
  const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');

  const pdfFileUrl = `https://cdn.fincooper.in/${pdfFilename}`;
  return pdfFileUrl;
}


// Generate appropriate PDF //



export const generateOfferLetterPDF1=async(
  candidateDetails,
  position,
  packages,
  joiningDate,
  company,
  acceptanceDate,
  fontSize = 11,        // Default normal font size
  fontBoldSize = 12     // Default bold font size
)=>{
  const font = 'assets/font/Cambria.ttf';
  const fontBold = 'assets/font/Cambria-Bold.ttf';
  const watermarklogo = 'assets/logo/watermark-logo.png';
  const signatureUrl = 'https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742463191890_signature.jpg';
  const bufferStream = new stream.PassThrough();
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(bufferStream);

  // function addLogo() {
  //   if (fs.existsSync(pdfLogo)) {
  //     doc.image(pdfLogo, 370, 30, { fit: [200, 50] });
  //   }
  // }
//   async function addLogo(doc) {
//     const headerUrl = "https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742463951436_header.png";
//     const headerBuffer = await fetchImageBuffer(headerUrl);

//     if (headerBuffer) {
//         const pageWidth = doc.page.width;  // Get full page width
//         const imageHeight = 100;  // Adjusted height

//         doc.image(headerBuffer, 0, 0, {
//             width: pageWidth, // Set width to full page width
//             height: imageHeight, // Keep desired height
//         });
//     } else {
//         // Display "Header Not Found" message at the top
//         doc.font('Helvetica-Bold')
//            .fontSize(14)
//            .fillColor('red')
//            .text("Header Not Found", 10, 10); // Shift text slightly for visibility
//     }

//     doc.moveDown(2); // Add spacing after the header
// }

// async function addfooter(doc) {
//   const headerUrl = "https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742466268308_footer.png";
//   const headerBuffer = await fetchImageBuffer(headerUrl);

//   if (headerBuffer) {
//       const pageWidth = doc.page.width;  // Get full page width
//       const imageHeight = 50;  // Adjusted height

//       doc.image(headerBuffer, 0, 0, {
//           width: pageWidth, // Set width to full page width
//           height: imageHeight, // Keep desired height
//       });
//   } else {
//       // Display "Header Not Found" message at the top
//       doc.font('Helvetica-Bold')
//          .fontSize(14)
//          .fillColor('red')
//          .text("Header Not Found", 10, 10); // Shift text slightly for visibility
//   }

//   doc.moveDown(2); // Add spacing after the header
// }

function drawBorder() {
  const pageHeight = doc.page.height;
  const margin = 30;
  const lineWidth = 2.2;
  const bottomGap = 60;
  // Draw a left border line
  doc.lineWidth(lineWidth);
  doc
    .moveTo(margin, margin) // Starting point of the line (top-left corner)
    .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
    .strokeColor("#324e98") // Set the color of the border
    .stroke();
}

// Function to add logo to every page

const pdfLogo = path.join(
    __dirname,
    "../../../../assets/image/FINCOOPERSLOGO.png"
  );

function addLogo() {
  if (fs.existsSync(pdfLogo)) {
    doc.image(pdfLogo, 370, 30, {
      fit: [200, 50],
      align: "right",
      valign: "bottom",
    });
  } else {
    console.error(`Logo file not found at: ${pdfLogo}`);
  }
}


function drawBorder() {
  const pageHeight = doc.page.height;
  const margin = 30;
  const lineWidth = 2.2;
  const bottomGap = 60;
  // Draw a left border line
  doc.lineWidth(lineWidth);
  doc
    .moveTo(margin, margin) // Starting point of the line (top-left corner)
    .lineTo(margin, pageHeight - margin - bottomGap) // Ending point of the line (bottom-left corner)
    .strokeColor("#324e98") // Set the color of the border
    .stroke();
}



  function boldText(doc, text) {
    doc.font(fontBold).fontSize(fontBoldSize).text(text, { continued: true });
    doc.font(font).fontSize(fontSize); // Reset to normal after bold
  }

  function addWatermark() {
    if (fs.existsSync(watermarklogo)) {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      doc.image(watermarklogo, doc.page.width / 2 - 200, doc.page.height / 2 - 200, { opacity: 0.05 });
      doc.restore();
    }
  }

  function addFooter() {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;
    doc.font(fontBold).fontSize(8).fillColor('#324e98').text('Fin Coopers Capital Pvt Ltd', pageWidth, pageHeight - 85, { align: 'center' });
    doc.font(font).fontSize(6.5).fillColor('#000000').text('Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)', { align: 'center' });
    doc.text('CIN: 67120MP1994PTC008686', { align: 'center' });
    doc.text('Phone: +91 7374911911 | Email: hr@fincoopers.com', { align: 'center' });
    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor('#324e98').lineWidth(2.2).stroke();
  }

  // await addLogo(doc);
  addLogo();
  drawBorder();
  doc.moveDown(1);
  addWatermark();
  
  
  
  // Offer Letter Body
  
  // Shift and Working Days
 

  // Signature Section//
 

  addFooter();

  // Finalize the PDF
  doc.end();
  const chunks = [];
  for await (const chunk of bufferStream) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  // Upload to DigitalOcean Spaces
  const bucketName = 'finexe';
  const pdfFilename = `OfferLetter-${candidateDetails.name.replace(/\s+/g, '')}-${moment().format('YYYYMMDDHHmmss')}.pdf`;
  const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');

  const pdfFileUrl = `https://cdn.fincooper.in/${pdfFilename}`;
  return pdfFileUrl;
}
async function generateAppointmentPDF(
  candidateDetails,
  position,
  packages,
  joiningDate,
  company,
  acceptanceDate,
  fontSize = 11,        // Default normal font size
  fontBoldSize = 12     // Default bold font size
){
  const font = 'assets/font/Cambria.ttf';
  const fontBold = 'assets/font/Cambria-Bold.ttf';
  const watermarklogo = 'assets/logo/watermark-logo.png';
  const signatureUrl = 'https://cdn.fincooper.in/STAGE/LOS/IMAGE/1742463191890_signature.jpg';
  const bufferStream = new stream.PassThrough();
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(bufferStream);

  function drawBorder() {
    const pageHeight = doc.page.height;
    const margin = 30;
    const lineWidth = 2.2;
    const bottomGap = 60;
    doc.lineWidth(lineWidth);
    doc.moveTo(margin, margin)
       .lineTo(margin, pageHeight - margin - bottomGap)
       .strokeColor('#324e98')
       .stroke();
  }

  function addFooter() {
    doc.font(fontBold).fontSize(8).fillColor('#324e98').text('Fin Coopers Capital Pvt Ltd', { align: 'center' });
    doc.font(font).fontSize(6.5).fillColor('#000000').text('Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)', { align: 'center' });
    doc.text('CIN: 67120MP1994PTC008686', { align: 'center' });
    doc.text('Phone: +91 7374911911 | Email: hr@fincoopers.com', { align: 'center' });
    doc.moveTo(50, doc.page.height - 100).lineTo(doc.page.width - 50, doc.page.height - 100).strokeColor('#324e98').lineWidth(2.2).stroke();
  }

  drawBorder();
  doc.moveDown(1);
  doc.font(fontBold).fontSize(16).text('APPOINTMENT LETTER', { align: 'center', underline: true });
  doc.moveDown(2);

  doc.font(fontBold).fontSize(fontBoldSize).text(`${candidateDetails.employeName}`, { align: 'left' });
  doc.moveDown(0.5);

  doc.font(font).fontSize(fontSize).text(`We are pleased to offer you the position of `, { continued: true });
  doc.font(fontBold).text(position);
  doc.text(` at `, { continued: true });
  doc.font(fontBold).text(company + '.');
  doc.moveDown(1);

  doc.font(font).text(`Your joining date is `, { continued: true });
  doc.font(fontBold).text(moment(joiningDate).format('MMMM Do, YYYY') + '.');
  doc.moveDown(2);

  doc.text(`Please report to the office at `, { continued: true });
  doc.font(fontBold).text(`10:00 AM on your joining date.`);
  doc.moveDown(1);

  doc.text(`We look forward to working with you. If you have any questions, please feel free to contact us.`);
  doc.moveDown(3);

  doc.font(fontBold).text('Thanks & Regards,');
  doc.moveDown(1);
  doc.text('Payal Soni', { align: 'left' });
  doc.moveDown(0.5);
  doc.text('Human Resource Manager', { align: 'left' });
  doc.text('Fin Coopers Capital Private Limited', { align: 'left' });
  doc.moveDown(3);

  addFooter();

  doc.end();
  const chunks = [];
  for await (const chunk of bufferStream) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  const bucketName = 'finexe';
  const pdfFilename = `AppointmentLetter-${candidateDetails.employeName}-${moment().format('YYYYMMDDHHmmss')}.pdf`;
  const url = await uploadToSpaces(bucketName, pdfFilename, pdfBuffer, 'public-read', 'application/pdf');
  const pdfFileUrl = `https://cdn.fincooper.in/${pdfFilename}`;
  return pdfFileUrl;
}





export default { offerLetterPDF  , generateOfferLetterPDF , generateAppointmentPDF,generateOfferLetterPDF1};
