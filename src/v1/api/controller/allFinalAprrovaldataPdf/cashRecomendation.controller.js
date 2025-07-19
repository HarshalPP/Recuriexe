const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");
  const PDFDocument = require("pdfkit");
  const mongoose = require("mongoose");

  const path = require("path");
  const fs = require("fs");
  const moment = require("moment");
  const { validationResult } = require("express-validator");
  const stream = require('stream')
  //   const { uploadToSpaces } = require("../../services/spaces.service.js")
  const uploadToSpaces = require("../../services/spaces.service.js");
  
    const { EventEmitter } = require('events');
  const myEmitter = new EventEmitter(); 
   const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/FINCOOPERSLOGO.png"
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
  const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
  

  
  
  
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
        doc.image(pdfLogo, 403, 40, {
          fit: [150, 32],
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
    // const pdfFilename = `IncomeSanctionLetter.pdf`;
    // const pdfPath = path.join(outputDir, pdfFilename);
  
    // const doc = new PDFDocument({ margin: 50, size: "A4" });
    // const stream = fs.createWriteStream(pdfPath);
  
    // doc.pipe(stream);
  
    // Add logo and border to the first page
    // addLogo();
    // drawBorder();
    // doc.moveDown(3);
    
    //   doc
    //   .fontSize(9)
    //   .font(fontBold)
    //   .text("INCOME SANCTION LETTER", { align: "center", underline: true });
    // doc.moveDown(2);
  
    // const startX = 50; // Set a left margin
    // const startY = doc.y; // Get the current Y position
    // doc
    //   .fontSize(7)
    //   .font('Helvetica')
    //   .text(`FIN No.:-${allPerameters.FINId}`, startX, doc.y, { align: "left", x: 50 }) // Adjusting x to align left
    //   .text(`Date: ${allPerameters.sanctionpendencyDate}`, { align: "right", x: 450 })
    //   .moveDown(1);
    
    // doc
    //   .font(fontBold)
    //   .fontSize(8)
    //   .text(`CUSTOMER NAME:${allPerameters.customerName}`, startX, doc.y, { align: "left", x: 50 })
    //   .moveDown(1);
    
    // doc
    //   .font("Helvetica")
    //   .fontSize(8)
    //   .text(`ADDRESS AS PER ADDHAR :${allPerameters.address}`,startX, doc.y, { align: "left", x: 50 })
    //   .moveDown(1);
    
    // doc
    //   .font(fontBold)
    //   .fontSize(8)
    //   .text(`K/A: ${allPerameters.KAndA}`,startX, doc.y, { align: "left", x: 50 })
    //   .moveDown(1);
    
    // doc
    //   .font('Helvetica')
    //   .fontSize(8)
    //   .text(`(Borrower & Co-Borrower hereinafter collectively referred to as the “Borrower”)\nWith reference to your application for financial assistance and further to our recent discussions we set out below the broad terms and conditions of the proposed facility.\nYour loan account details and the loan repayment schedule are attached herewith for your reference.`, { align: "left", x: 50 })
    //   .moveDown(1);
    
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
    
      // addFooter()

      function drawTable(sectionTitle, data) {
        const titleHeight = 18;
        const titleX = 48;
        const pageMargin = 48; // Margin on each side
        const titleWidth = doc.page.width - 2 * titleX;
      
        // Start drawing the table
        const startX = titleX; // Start X position for the table
        let startY = doc.y + titleHeight; // Start Y position for the table
        const rowHeight = 15; // Default row height
      
        // Set fixed column widths
        // const columnWidths = [150, 350, 70];
        const columnWidths = [200, titleWidth - 200];

      
        // Draw the special row at the top of the table (Loan Details)
        const specialRowHeight = 18; // Height of the special row
        const specialRowText = `${sectionTitle}`; // Text for the special row
        const specialRowColor = "#005A6D"; // Light blue background color#00BFFF.
      
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
        // doc.font(fontBold)
        //   .fontSize(10)
        //   .fillColor("black")
        //   .text(specialRowText, startX + 5, startY + 8);

        // Add text inside the special row with center alignment
doc.font(fontBold)
.fontSize(8)
.fillColor("white")
.text(specialRowText, startX, startY + 8, {
  align: "center",
  width: titleWidth, // Ensure the text spans the entire width
});

      
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
            .fontSize(7)
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
  
      const loanDetails = [
        { key: "BRANCH NAME", value:`${allPerameters.branchName}` },
        { key: "Customer Name", value: `${allPerameters.customerName}` },
        { key: "Customer Contact No", value:`${allPerameters.contactNo}`},
        { key: "LOAN AMOUNT", value:`${allPerameters.loanAmount}` },
        { key: "TENURE", value:`${allPerameters.tenure}` },
        { key: "IRR", value:`${allPerameters.irr}` },
        { key: "EMI", value:`${allPerameters.emi}` },

      ];
      drawTable("Loan Details", loanDetails);
  
      //-------------------------------------- new page 2-------------------------------------------------------
    // doc.addPage()
     doc.moveDown()
  
    function drawCustomTable(title, data) {
      doc.moveDown(1);
  
      const pageMargin = 48;
      const titleWidth = doc.page.width - 2 * pageMargin;
      const startX = pageMargin;
      let startY = doc.y;
  
      const headerHeight = 18;
      const rowHeight = 15;
  
      // Column widths
      const colWidths = [200, titleWidth - 200];
  
      // Draw Header Box with Border
      doc.rect(startX, startY, titleWidth, headerHeight).stroke(); // Draw border first
      doc.save().fillColor("#005A6D").rect(startX, startY, titleWidth, headerHeight).fill().restore(); // Fill background
  
      // Header Title
      doc.font(fontBold)
          .fontSize(8)
          .fillColor("white")
          .text(title, startX, startY + 6, {
              align: "center",
              width: titleWidth,
          });
  
      startY += headerHeight;
  
      // Draw column headers with background color
      doc.rect(startX, startY, colWidths[0], rowHeight).stroke();
      doc.rect(startX + colWidths[0], startY, colWidths[1], rowHeight).stroke();
  
      doc.save().fillColor("#CFE2F3").rect(startX, startY, colWidths[0], rowHeight).fill().restore(); // Light Blue for "Particulars"
      doc.save().fillColor("#CFE2F3").rect(startX + colWidths[0], startY, colWidths[1], rowHeight).fill().restore(); // Light Blue for "Details"
  
      doc.font(fontBold)
          .fontSize(8)
          .fillColor("black")
          .text("Particulars", startX + 5, startY + 5, { width: colWidths[0], align: "left" });
  
      doc.text("Detail", startX + colWidths[0] + 5, startY + 5, { width: colWidths[1], align: "left" });
  
      startY += rowHeight;
  
      // Draw rows
      data.forEach((row, index) => {
          let cellHeight = Math.max(
              doc.heightOfString(row.key, { width: colWidths[0] - 10, fontSize: 9 }),
              doc.heightOfString(row.value, { width: colWidths[1] - 10, fontSize: 9 })
          ) + 10;
  
          // Alternate row colors
          // if (index % 2 === 0) {
          //     doc.save().fillColor("#F9F9F9").rect(startX, startY, titleWidth, cellHeight).fill().restore();
          // }
  
          // Draw borders
          doc.rect(startX, startY, colWidths[0], cellHeight).stroke();
          doc.rect(startX + colWidths[0], startY, colWidths[1], cellHeight).stroke();
  
          // Add text
          doc.font(font)
              .fontSize(7)
              .fillColor("#000000")
              .text(row.key, startX + 5, startY + 5, { width: colWidths[0] - 10 });
  
          doc.text(row.value, startX + colWidths[0] + 5, startY + 5, { width: colWidths[1] - 10 });
  
          startY += cellHeight;
      });
  }
  
  // Sample Data
  const customerDetails = [
      { key: "Profile of Customer", value: `APPLICANT ${allPerameters.applicantName} IS RESIDENCE OF ${allPerameters.applicantAddress} SELF EMPLOYED INVOLVE IN AGRICULTURE AND MILK SUPPLY BUSINESS FROM PAST ${allPerameters.agriExperiance} YEARS, APPLICANT IS HAVING ${allPerameters.totalLand} BIGHA OF PRODUCTIVE AGRICULTURE LAND WHICH IS IN THE NAME OF MR. ${allPerameters.propertyHolderName} GENERALLY CULTIVATE WHEAT, SOYABEAN, AND SEASONAL VEGETABLES, APPLICANT IS GROSS EARNING AROUND RS. 100250 CALCULATED TAKING RS.25000/- PER BIGHA PER ANNUM ,GROSS MONTHLY INCOME FROM THIS BUSINESS IS AROUND RS.${allPerameters.agrimonthlyIncome} APPLICANT IS ALSO INVOLVE IN MILK BUSINESS HAVING 5 CATTLES MILK GIVING ANIMALS GIVING MILK AROUND 30 LTR PER DAY WHICH IS SOLD TO NEARBY DAIRY , DAIRY NAME IS CHUDAWAT DUD DAIRY FROM THIS BUSINESS APPLICANT IS EARNING AROUND RS. 36000 PER MONTH. ALSO EARNING THROUGH OTHER SOURCE / SALARY RS. PER MONTH. CUSTOMER IS ALSO ENGAGED IN BUSINESS NATURE FROM LAST YEARS AND EARNING RS PER MONTH.` },
      { key: "Age for Financial Applicants", value: `Applicant age is ${allPerameters.applicantAge} years\nCo-Applicant-1 age is ${allPerameters.coapplicant1} years\nCo-Applicant age-2 is ${allPerameters.coapplicant2Age} years` },
      { key: "Co-Applicants", value: `Name: ${allPerameters.coApplicant1Name}, Relation: ${allPerameters.coApplicant1relation}\nName: ${allPerameters.coApplicant2Name}, Relation: ${allPerameters.coApplicant2Relation}` },
      { key: "Minimum Experience", value: `Agriculture Business – more than ${allPerameters.agriExperiance} years\nMilk Business Income – Past 2 years` },
      { key: "Residence Stability", value: `${allPerameters.residenceAbility}` },
      { key: "Financial Guarantor", value: `Name: ${allPerameters.gauranterName}, Total Wealth: Rs. 1900000, CIBIL Score: -1` },
      { key: "Geo Limit", value: `${allPerameters.geoLimit}` },
      { key: "Loan Amount Required", value: `${allPerameters.loanAmountRequired}` },
      { key: "Bureau Score", value: `Applicant CIBIL : -1, Co-Applicant CIBIL -1` },
      { key: "End Use Of loan", value: `${allPerameters.endUseOfLoan}` },
      { key: "Tenure (Guided by the Age Norms)", value: `${allPerameters.loantenure}` },
      { key: "LTV Norms", value: `${allPerameters.ltv}%` },
      { key: "Type collateral", value: `${allPerameters.colletralType}` },
      { key: "Income Considered for Eligibility (Yearly)", value: `Agriculture Income – Rs. ${allPerameters.agriYearlyIncome}
      Income From Milk –Rs.${allPerameters.MilkYearlyIncome}
      Income From Other source / Salary –Rs. ${allPerameters.OtherYearlyIncome}` },
      { key: "FOIR Norms", value:`FOIR - ${allPerameters.foir}%` },

  ];
  
  drawCustomTable("Customer Brief Profile and Financial Analysis", customerDetails);
  
  
      doc.end();
    
      // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
      // console.log(pdfFileUrl,"pdfFileUrl")
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
    
  
  
  const CashRecomendationPdf= async(req,res) =>{
      try {

        let { customerId } = req.query;
       
        const customerDetails = await customerModel.findById({ _id: (customerId) });
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
        const Cibil = await cibilModel.findOne({  customerId })
        
  
        const address = [
          applicantDetails?.localAddress?.addressLine1,
          // applicantDetails?.permanentAddress?.addressLine2,
          // applicantDetails?.permanentAddress?.city,
          // applicantDetails?.permanentAddress?.district,
          // applicantDetails?.permanentAddress?.state,
          // applicantDetails?.permanentAddress?.pinCode
        ].filter(Boolean).join(', ');
  
        const KAndA = [
          applicantDetails?.fullName,
          coApplicantDetails[0]?.fullName,
          guarantorDetails?.fullName
        ].filter(Boolean).join(', ');
  

        // console.log("KAndA",KAndA)
        const formatDate = (praMANpATRADate) => {
          if (!praMANpATRADate) return "NA"; // Agar DOB available nahi hai to "NA" return kare
          const date = new Date(praMANpATRADate); // Date object me convert kare
          const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
          const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
          return `${day}-${month}-${year}`; // Final format
          };
  
          const timestamp = Date.now();
  
          // Convert timestamp to a Date object
          const currentDate = new Date(timestamp);
          
          // Format the date to dd/mm/yy
          const formattedDate = currentDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
          });


          const BranchNameId = customerDetails?.branch;
          // console.log("BranchNameId",BranchNameId) bankDeatilsKycs
                let branchData = await newBranchModel.findById({_id:BranchNameId});
        // if (!branchData) {
        //     return badRequest(res, "Branch data not found for the given branchId");
        // }
        const Tenure = customerDetails?.tenure;

        console.log("Tenure",Tenure)

        const branchName = branchData?.city; 
        const allPerameters = {
          branchName:branchData?.city||"NA",
          customerName:customerDetails?.executiveName||"NA",
          contactNo:customerDetails?.mobileNo||"NA",
          loanAmount:customerDetails?.loanAmount||"NA",
          irr:customerDetails?.roi||"NA",
          emi:customerDetails?.emi||"NA",
          tenure:customerDetails?.tenure||"NA",


          applicantName:applicantDetails?.fullName||"",
          applicantAddress:applicantDetails?.localAddress?.addressLine1||"",
          agriExperiance:"",
          totalLand:technicalDetails?.totalLandArea||"",
          propertyHolderName:technicalDetails?.nameOfDocumentHolder||"",
          agrimonthlyIncome:"",
          applicantAge:applicantDetails?.age||"",
          coApplicant1Name:coApplicantDetails?.[0]?.fullName||"",
          coapplicant1:coApplicantDetails?.[0]?.age||"",
          coApplicant1relation:coApplicantDetails?.[0]?.relationWithApplicant||"",
          coApplicant2Name:coApplicantDetails?.[1]?.fullName||"",
          coapplicant2Age:coApplicantDetails?.[1]?.age||"",
          coApplicant2Relation:coApplicantDetails?.[1]?.relationWithApplicant||"",
          residenceAbility:"",
          gauranterName:guarantorDetails?.fullName||"",
          geoLimit:technicalDetails?.distanceOfMap||"",
          loanAmountRequired:finalsanctionDetails?.finalLoanAmount||"",
          endUseOfLoan:finalsanctionDetails?.EndUseOfLoan||"",
          loantenure:finalsanctionDetails?.tenureInMonth||"",
          ltv:finalsanctionDetails?.ltv||"",
          colletralType:"",

          agriYearlyIncome:"",
          MilkYearlyIncome:"",
          OtherYearlyIncome:"",
          foir:finalsanctionDetails?.foir||"",

        }

        console.log("allPerameters",allPerameters)
          const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
          
      
          if (!pdfPath) {
           console.log("Error generating the Sanction Letter Pdf")
          }
          
          const uploadResponse = await uploadPDFToBucket(pdfPath, `Fwd:CaseRecommendedForApproval${Date.now()}.pdf`);
          const url = uploadResponse.url
          console.log(url,"url")        
        //   await finalsanctionModel.findOneAndUpdate(
        //   { customerId }, // Query to find the specific customer document
        //   {
        //     preSanctionStatus: "approve",
        //     incomesectionLatterUrl: url,
        //     generateSanctionLatterStatus:"complete"          },
        //   { new: true, upsert: false } // Options: Return the updated document, don't create a new one
        // );
          console.log(pdfPath,"sanction pdfpath")
          
          success(res, "PDF generated successfully", {
            CashRecomendationForApproval:url,
        });
         
           } catch (error) {
          console.log(error);
          unknownError(res, error);
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

  module.exports = {
    CashRecomendationPdf
  }