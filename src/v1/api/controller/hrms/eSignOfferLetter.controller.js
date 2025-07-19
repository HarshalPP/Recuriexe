const processModel = require("../../model/process.model");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const pdfLogo = path.join(
  __dirname,
  "../../../../../assets/image/FINCOOPERSLOGO.png"
);

async function offerLetterPDF(
  candidateDetails,
  candidateMoreDetails,
  salary,
  joiningDate
) {
  // console.log(candidateMoreDetails);
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  const baseDir = path.join("./uploads/");
  const outputDir = path.join(baseDir, "pdf/");

  function addFooter() {
    const pageWidth = doc.page.margins.left;
    const pageHeight = doc.page.height;

    doc
      .font(fontBold)
      .fontSize(6.3)
      .fillColor("#324e98")
      .text("Fin Coopers Capital PVT LTD", pageWidth, pageHeight - 80, {
        align: "center",
      });
    doc
      .font(fontBold)
      .fontSize(6.3)
      .fillColor("#000000")
      .text(
        "Registered Office Address: 174/3, Nehru Nagar, Indore-452011 (M.P.)",
        { align: "center" }
      );
    doc
      .font(fontBold)
      .fontSize(6.3)
      .fillColor("#000000")
      .text("CIN: 67120MP1994PTC008686", { align: "center" });
    doc
      .font(fontBold)
      .fontSize(6.3)
      .fillColor("#000000")
      .text("Mobile No: +91 7374911911 E-mail: hr@fincoopers.com", {
        align: "center",
      });
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const candidateName = `${candidateDetails.name}`;
  const pdfFilename = `OfferLetter-${candidateName}.pdf`;
  const pdfPath = path.join(outputDir, pdfFilename);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const stream = fs.createWriteStream(pdfPath);

  doc.pipe(stream);
  const pageWidth = 595.28;
  const imageWidth = 200;
  const xCenter = (pageWidth - imageWidth) / 1.1;

  // Add watermark (logo) on each page
  function addWatermark() {
    const logoX = (doc.page.width - 400) / 2; // Center the logo
    const logoY = doc.page.height - 450; // Move the logo closer to the bottom of the page
    doc.image(pdfLogo, logoX, logoY, {
      width: 300,
      opacity: 0.3, // Set opacity to a very light value
    });
  }
  // Add watermark on the first page
  // addWatermark();
  // Add logo if exists
  if (fs.existsSync(pdfLogo)) {
    // doc.image(pdfLogo, xCenter, 50, { width: imageWidth }); // Adjusted y-position for tighter layout
    doc.image(pdfLogo, 400, 20, {
      fit: [150, 50],
      align: "right",
      valign: "bottom",
    });
  } else {
    console.error(`Logo file not found at: ${pdfLogo}`);
  }

  // Offer letter title styling
  doc.moveDown(4); // Reduce vertical space between logo and title

  // Add candidate ID immediately below offer letter
  doc.fontSize(14).font(font).text(`Offer Letter`, { align: "center" });
  doc.moveDown(2); // Reduce vertical space between logo and title

  // Add candidate name and date on the same line
  const candidateNameText = `${candidateName}`;
  const formattedDate = moment().format("MMMM Do, YYYY");

  // Measure text width to position the date on the same line as the candidate's name
  const candidateNameWidth = doc.widthOfString(candidateNameText);
  const dateWidth = doc.widthOfString(formattedDate);
  doc.moveDown(0.5); // Reduce vertical space between logo and title

  // Add candidate name (left-aligned)
  doc.fontSize(12).font(font).text(candidateNameText, {
    continued: true, // Keep on the same line
  });

  // Add the date (right-aligned)
  doc.text(formattedDate, pageWidth - dateWidth - 50); // Position date to the right
  doc.moveDown(0.5); // Reduce vertical space between logo and title

  // Add candidate's address on the left side
  doc.text(`${candidateMoreDetails.permanentAddress}`, { align: "left" });
  doc.moveDown(0.5); // Reduce vertical space between logo and title

  doc.text(
    `${candidateMoreDetails.permanentAddressCity}, ${candidateMoreDetails.permanentAddressState}`,
    {
      align: "left",
    }
  );

  // Add space between the address and the greeting
  doc.moveDown(3);

  // Addressing candidate
  doc.text(`Dear ${candidateDetails.name},`, { align: "left" });

  // Main offer content
  doc.moveDown(1);
  doc.text(
    `We are pleased to offer you the position of ${candidateDetails.position} at Fin Coopers Capital Pvt Ltd. Please review terms & conditions for your anticipated employment with us. ` +
      `In summary, your joining date will be ${moment(joiningDate).format(
        "MMMM Do, YYYY"
      )}, ` +
      `with an annual salary of ${salary}. ` +
      `We look forward to having you on our team ` +
      `and working together to achieve great things.`,
    { lineGap: 4 } // Adjust line spacing for better readability
  );

  // Additional offer details
  doc.moveDown(1.5); // Adjust space between paragraphs
  doc.text(
    `Please review the terms and conditions of this offer, and let us know if you have any questions. We are excited to have you join us!`,
    { lineGap: 4 } // Line gap between sentences
  );

  // Sign off
  doc.moveDown(2);
  doc.text(`Sincerely,`, { align: "left" });
  doc.moveDown(1);
  doc.text(`FinCoopers Capital Pvt Ltd`, { align: "left" });
  addFooter();
  // Finalize the PDF
  doc.end();

  const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      console.log("pdfFileUrl", `http://localhost:5500${pdfFileUrl}`);
      resolve(pdfFileUrl); // Resolve with the PDF URL
    });
    stream.on("error", reject);
  });

  //end
}

module.exports = { offerLetterPDF };
