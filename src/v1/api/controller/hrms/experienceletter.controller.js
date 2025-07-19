const processModel = require("../../model/process.model");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const pdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);
const watermarklogo = path.join(
  __dirname,
  "../../../../../assets/image/watermarklogo.png"
);
// Helper function to capitalize the first letter of each word in a name
function capitalizeFirstLetter(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function experienceLetterPDF(
  employeeDetails,
  resignationDetails,
) {
  // console.log(ESIC);
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  const baseDir = path.join("./uploads/");
  const outputDir = path.join(baseDir, "pdf/");
  
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

  

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
//   console.log(timestamp);
  const dateFormatted = new Date(timestamp)
    .toLocaleDateString("en-US")
    .replace(/\//g, "-");
  const employeeName = capitalizeFirstLetter(`${employeeDetails.employeName}`);
//   console.log(employeeDetails.employeName);
  const employeeNamePDF = capitalizeFirstLetter(
    employeeDetails.employeName.replace(/\s+/g, "")
  );
//   const pdfFilename = `OfferLetter-${employeeNamePDF}-${dateFormatted}-${timestamp}.pdf`;
const pdfFilename = `ExpeienceLetter-${employeeNamePDF}-${dateFormatted}-${timestamp}.pdf`;

  const pdfPath = path.join(outputDir, pdfFilename);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(pdfPath);

  doc.pipe(stream);

  // Add logo and border to the first page
  addLogo();
  // addWatermark();
  drawBorder();

  const pageWidth = 595.28;
  const imageWidth = 200;

  // Title styling for OFFER LETTER in uppercase and underlined

  doc.moveDown(6);

  // Define and format candidate name and current date
  const employeeNameText = capitalizeFirstLetter(employeeName);
  const formattedDate = moment().format("MMMM Do, YYYY");

  // Print the candidate name
  doc.fontSize(12).font(font).fillColor("#000000").text(employeeNameText);

  // Move down slightly and add the date directly below the name
  doc.moveDown(0.1);
  doc.text(employeeDetails.branchId.name);
  doc.moveDown(0.1);
  doc.text(formattedDate);
  // Add some space after the date
  doc.moveDown(2);
  doc
    .fontSize(16)
    .font(fontBold)
    .text("To Whomsoever It May Concern", { align: "center", underline: true });
  doc.moveDown(1.2);
  doc
    .fontSize(16)
    .font(fontBold)
    .text("Experience Letter", { align: "center", underline: true });
  doc.moveDown(2.5);
  

  // Addressing candidate
//   doc.fontSize(12).font(font).text(`Dear,${employeeNameText}`, {
//     align: "left",
//   });
  // Offer letter content with grammatical improvements
//   doc.moveDown(1);
  doc
    .font(font)
    .fontSize(12)
    .text(
      `This is to certify that  ${employeeDetails.salutation} ${employeeNameText}, has worked with  ${employeeDetails.company} as a ${employeeDetails.designationId.name} from  ${moment(employeeDetails.joiningDate).format(
        "MMMM Do, YYYY"
      )} to ${moment(resignationDetails.lastWorkingDateByManager).format(
        "MMMM Do, YYYY"
      )}`,
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
   let refer="";
   let referP="";
   let referPT="";
   if(employeeDetails.gender ==="Male"){
    console.log("------------------")
    refer = "he";
    referP= "his";
    referPT= "him";
   } else if (employeeDetails.gender ==="Female"){
    refer = "she";
    referP= "her";
    referPT= "her";
   } else if (employeeDetails.gender ==="Other"){
    refer = "they";
    referP= "them";
    referPT= "them";
   }
  
  // Using the function to add sections with aligned headings and content

  // 1. Reporting
  doc
    .font(font)
    .fontSize(12)
    .text(
      `In this period ${refer} has shown full Sincerity, Dedication and Hard work towards his concerned job, which has helped in improving the management of the Company. This is to inform that ${employeeDetails.salutation} ${employeeNameText} has been relieved of all ${referP} duties.`,
      { lineGap: 4, align: "justify" }
    );
    doc.moveDown(1);
  
    doc
    .font(font)
    .fontSize(12)
    .text(
      `We wish ${referPT} all the very best for ${referP} future endeavors.`,
      { lineGap: 4, align: "justify" }
    );
  doc.moveDown(1);

    doc
    .font(font)
    .fontSize(12)
    .text(
      `Thank you.`,
      { lineGap: 4, align: "justify" }
    );
  
    doc.moveDown(1);
  
  addIndentedSection(
    doc,
    "Best Regards,"
  );
  addIndentedSection(
    doc,
    "Human Resource Manager"
  );
  // Add footer at the end of the second page
  addFooter();

  doc.end();

  const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve(pdfFileUrl);
    });
    stream.on("error", reject);
  });
}

module.exports = { experienceLetterPDF };
