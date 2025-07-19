const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper.js");
  
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
    const uploadToSpaces = require("../../services/spaces.service.js");
    
      const { EventEmitter } = require('events');
    const myEmitter = new EventEmitter(); 
    const mongoose = require('mongoose')
  
  const customerModel = require('../../model/customer.model.js')
  const coApplicantModel = require('../../model/co-Applicant.model.js')
  const guarantorModel = require('../../model/guarantorDetail.model.js')
  const applicantModel = require('../../model/applicant.model.js')
  const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel.js')
  const appPdcModel = require('../../model/branchPendency/appPdc.model.js')
  const disbursementModel =require('../../model/fileProcess/disbursement.model.js')
  // const finalSanctionModel = require('../../model/fileProcess/finalSanction.model.js')
  const gtrPdcModel = require('../../model/branchPendency/gtrPdc.model.js')
  const creditPdModel = require('../../model/credit.Pd.model.js')
  const UdhyamModel = require('../../model/udyam.model.js');
  const branchUdhyamModel = require('../../model/branchPendency/udhyamKyc.model.js');
  const finalsanctionModel =  require('../../model/finalSanction/finalSnction.model.js')
  const DISBURSEMENTModel = require('../../model/fileProcess/disbursement.model.js')
  const sanctionModel =  require('../../model/finalApproval/sanctionPendency.model.js')
  const externalBranchModel = require("../../model/externalManager/externalVendorDynamic.model.js");
  const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
  const bankDeatilsKycs = require('../../model/branchPendency/bankStatementKyc.model.js');
  const externalManagerModel = require('../../model/externalManager/externalVendorDynamic.model')
  const employeeModel = require('../../model/adminMaster/employe.model')
  const designationModel = require("../../model/adminMaster/newDesignation.model")
  const processModel = require("../../model/process.model");
  const productModel =require("../../model/adminMaster/product.model");
  const lenderModel = require("../../model/lender.model.js");


  
  const cibilModel = require("../../model/cibilDetail.model")

  
  
  
  
  const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/FINCOOPERSLOGO.png"
  );
  
 
  
  async function generatePdf(allPerameters,skipPages) {
    const font = "assets/font/Cambria.ttf";
    const fontBold = "assets/font/Cambria-Bold.ttf";
   
  
    const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50, size: "A4" });
    
      // Buffer to hold the PDF content
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => console.log('PDF generated successfully!'));
  
   
    doc.moveDown(4);
    doc.fontSize(15).font(fontBold).fillColor('#00BFFF').text("IntrnalCam Pdf",{ align: "center" });
  
  
 
  
  
    // for sectionA//
  
    // function drawTable(sectionTitle, data) {
    //   doc.moveDown(1);
    //   const titleHeight = 20;
    //   const titleX = 48;
    //   const pageMargin = 48; // Margin on each side
    //   const titleWidth = doc.page.width - 2 * titleX;
    
    //   // Start drawing the table
    //   const startX = titleX; // Start X position for the table
    //   let startY = doc.y + titleHeight; // Start Y position for the table
    //   const rowHeight = 20; // Default row height
    
    //   // Set fixed column widths
    //   const columnWidths = [150, 350, 70];
    
    //   // Draw the special row at the top of the table (Loan Details)
    //   const specialRowHeight = 23; // Height of the special row
    //   const specialRowText = `${sectionTitle}`; // Text for the special row
    //   const specialRowColor = "#0066B1"; // Light blue background color#00BFFF. 0066B1
    
    //   // Draw the special row with background color
    //   doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    //     .fill(specialRowColor)
    //     .strokeColor("#151B54")
    //     .lineWidth(1)
    //     .stroke();
    
    //   // Add black border around the special row
    //   doc.rect(startX, startY, titleWidth, specialRowHeight)  // Span the entire width
    //     .strokeColor("#000000") // Black border
    //     .lineWidth(1)
    //     .stroke();
    
    //   // Add text inside the special row
    //   doc.font(fontBold)
    //     .fontSize(10)
    //     .fillColor("white")
    //     .text(specialRowText, startX + 5, startY + 8);
    
    //   // Move the Y position down after the special row
    //   startY += specialRowHeight;
    
    //   // Draw the actual table rows
    //   data.forEach((row) => {
    //     const minRowHeight = 20;
    //     const extraHeightPerLine = 3;  // Additional height for each line of overflow
    
    //     // Calculate the height needed for the cell content
    //     const keyTextHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, fontSize: 8 });
    //     const valueTextHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, fontSize: 8 });
    
    //     // Determine the number of lines based on text height and base line height (e.g., 10 per line)
    //     const keyLines = Math.ceil(keyTextHeight / 10);
    //     const valueLines = Math.ceil(valueTextHeight / 10);
    
    //     // Calculate extra height if content requires more lines than default row height
    //     const extraHeight = (Math.max(keyLines, valueLines) - 1) * extraHeightPerLine;
    
    //     // Use the maximum height needed for either cell content or the minimum row height plus extra height
    //     const cellHeight = Math.max(keyTextHeight, valueTextHeight, minRowHeight) + extraHeight;
    
    //     // Draw key cell border
    //     doc.rect(startX, startY, columnWidths[0], cellHeight)
    //       .strokeColor("black")
    //       .lineWidth(1)
    //       .stroke();
    
    //     // Draw value cell border
    //     doc.rect(startX + columnWidths[0], startY, columnWidths[1], cellHeight)
    //       .strokeColor("black")
    //       .lineWidth(1)
    //       .stroke();
    
    //     // Add text to the key cell (wrapped if necessary)
    //     doc.font(font)
    //       .fontSize(8)
    //       .fillColor("#000000")
    //       .text(row.key, startX + 5, startY + 5, {
    //         align: "left",
    //         width: columnWidths[0] - 10,
    //         lineBreak: true,
    //       });
    
    //     // Check if this row should display a checkbox with or without a checkmark
    //     if (row.key === "Same as Communication address") {
    //       const checkboxX = startX + columnWidths[0] + 10;
    //       const checkboxY = startY + 5;
    
    //       // Draw checkbox border
    //       doc.rect(checkboxX, checkboxY, 10, 10).stroke();
    
    //       // Draw checkmark if the value is "YES"
    //       if (row.value === "YES") {
    //         doc.moveTo(checkboxX + 2, checkboxY + 5)
    //           .lineTo(checkboxX + 5, checkboxY + 8)
    //           .lineTo(checkboxX + 8, checkboxY + 2)
    //           .strokeColor("black")
    //           .stroke();
    //       }
    //     } else {
    //       // Add text to the value cell (wrapped if necessary)
    //       doc.text(row.value, startX + columnWidths[0] + 15, startY + 5, {
    //         align: "left",
    //         width: columnWidths[1] - 10,
    //         lineBreak: true,
    //       });
    //     }
    
    //     // Move startY down by the height of the current cell for the next row
    //     startY += cellHeight;
    //   });
    // }
    
    // doc.font(fontBold)
    //   .fontSize(11)
    //   .fillColor('black')
    //   .text("Section 1: Application Details", { underline: true  });
  
  
    // // Loan Details Section
    // const loanDetails = [
    //   { key: "Loan Amount Requested", value:`${allPerameters.loanAmountRequested}` },
    //   { key: "Loan Tenure Requested (in months)", value: `${allPerameters.tenure}` },
    //   { key: "Loan Purpose", value:`${allPerameters.loanPurpose}`},
    //   { key: "Loan Type", value:`${allPerameters.loanType}` },
    // ];
    // drawTable("Loan Details", loanDetails);
    // doc.moveDown()
  
   
    
    
    // doc.addPage();
    // drawBorder()
      //   // addLogo(doc);(doc);(doc);
    // doc.moveDown(2)
    doc.font(fontBold).fontSize(11).text("Section 2: Application Details", { underline: true,align: "center" });
  
  
  
   
    
  
  
  
  
  
  //original working code

  ///----------------------------------------------------------------------Deal Summary Data-------------------------------------------------------------------------------
  
  function drawTablenew(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = titleX;
    let startY = doc.y + titleHeight;
    const columnWidthsFirst5 = [125, 375];
    const columnWidths = [125, 125, 125, 125];
    const imageWidth = 100;
  
    // Title Section with Borders
    doc.rect(startX, startY, titleWidth, titleHeight)
      .fill("#0066B1")
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
  
    doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);
  
    startY += titleHeight;
  
    const imageSpanRows = 5;
    const imageHeight = imageSpanRows * 21.5;
  
    // Iterate through the data and draw rows
    data.forEach((row, index) => {
      // Determine row height based on text
      let rowHeight = 20; // Default row height
      if (index < 5) {
        rowHeight = Math.max(
          doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
          doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
        ) + 10; // Add padding
      } else {
        rowHeight = Math.max(
          doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
          doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
        ) + 10; // Add padding
      }
  
      const rowY = startY;
  
      // Draw row cells based on layout
      if (index < 5) {
        doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
          .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });
  
        // if (index === 0) {
        //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
        //     .strokeColor("black")
        //     .lineWidth(1)
        //     .stroke();
  
        //   if (fs.existsSync(imagePath)) {
        //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
        //       fit: [imageWidth - 10, imageHeight - 10],
        //     });
        //   } else {
        //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
        //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        //   }
        // }
      } else {
        // Four-column layout
        for (let i = 0; i < 4; i++) {
          doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        }
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
      }
  
      startY += rowHeight; // Move to the next row
    });
  }
  const applicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs Applicant Mother's Name
    { key: "Applicant Type", value: `${allPerameters.appType}` },
    { key: "Business Type", value: `${allPerameters.buisnessType}` },
    { key: "Applicant Name", value: `${allPerameters.borrowerName}`},
    { key: "Applicant Father's/Spouse Name", value: `${allPerameters.appFather}` },
    { key: "Applicant Mother's Name.", value: `${allPerameters.appMother}` },
  
    { key1: "Mobile No.", value1: `${allPerameters.appMob1}`, key2: "Mobile No2.", value2: `${allPerameters.appMob2}` },
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.appEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1:`${allPerameters.appEdu}`, key2: "Religion", value2: `${allPerameters.appReligion}`},
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1:`${allPerameters.appDOB}`, key2: "Nationality", value2: `${allPerameters.appNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1: `${allPerameters.appGender}`, key2: "Category", value2: `${allPerameters.appCategory}` },
    { key1: "Marital Status", value1: `${allPerameters.appMaritalStatus}`, key2: "No. of Dependents", value2: `${allPerameters.appNoOfDependentd}`},
    { key1: "Pan Number", value1: `${allPerameters.appPan}`, key2: "Voter Id Number ", value2: `${allPerameters.AppVoterId}` },
    { key1: "Aadhar Number", value1: `${allPerameters.appAdhar}`, key2: "Udyam Number", value2: `${allPerameters.appUshyamAdharNumber}`},
    // { key1: "Aadhar Number", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  
  // //console.log("Applicant Details Data:", applicantDetailsData);
  // const imagePath = "./uploads/applicant_photo.jpg";
  
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
  // const imagePath = path.join(__dirname, `../../../../..${allPerameters.appImage}`);
  
  
  const sectionTitle = "Applicant Details";
  drawTablenew(sectionTitle, applicantDetailsData, imagePath);
  
  
   
  
    doc.moveDown()

    const pageWidth = doc.page.width; 

    // async function addImageWithLabel(doc, label, imageUrl, position = "left") {
    //     const imageWidth = 200;
    //     const imageHeight = 140;

    //     // 🔹 Set X Position (Left or Right)
    //     const xPosition = position === "right" ? pageWidth - imageWidth - 50 : 50;

    //     // 🔹 Move Down to Create Space
    //     doc.moveDown(1.5);

    //     // 🔹 Add Label Above Image
    //     doc.fontSize(14).text(label, xPosition, doc.y);

    //     // 🔹 Fetch Image as Buffer
    //     try {
    //         const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    //         const imageBuffer = Buffer.from(response.data, "binary");

    //         // 🔹 Get Current Y Position
    //         const yPosition = doc.y + 5; // Little spacing

    //         // 🔹 Draw Border Around Image
    //         doc.rect(xPosition, yPosition, imageWidth, imageHeight).stroke();

    //         // 🔹 Add Image at Specified Position
    //         doc.image(imageBuffer, xPosition, yPosition, { fit: [imageWidth, imageHeight] });

    //         console.log(`✅ Image added: ${label} at ${position}`);
    //     } catch (error) {
    //         console.error(`❌ Failed to load image for ${label}:`, error);
    //         doc.fontSize(12).text("Image not available", xPosition, doc.y + 20);
    //     }

    //     doc.moveDown(1.5); // Move down for next element
    // }
    // doc.font(fontBold).fontSize(11).text("All Documents", { underline: true,align: "center" });


    // await addImageWithLabel(doc, "Aadhar Card Front", `${allPerameters.appaadharFrontImage}`, "left");
    // await addImageWithLabel(doc, "Aadhar Card Back", `${allPerameters.appaadharBackImage}`, "right");
    // doc.moveDown(3); // Move down for next element
    // await addImageWithLabel(doc, "Pan Card Front", `${allPerameters.panFrontImage}`, "left");
    // doc.moveDown(3); // Move down for next element
    // // await addImageWithLabel(doc, "Driving License", `${allPerameters.panBackImage}`, "right");

    // doc.addPage()
    // await addImageWithLabel(doc, "Driving License", `${allPerameters.panBackImage}`, "left");

    // await addImageWithLabel(doc, "Voter Card Front", `${allPerameters.voterIdImage}`, "right");

    // doc.moveDown(10); // Move down for next element



  
    
  //   drawTablenew(doc, "Co-Applicant Details", applicantDetails, imagelogo);
  function createStyledTable1(doc, title, tableData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  
    // Determine table width based on the first-row column widths
    const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (full-width, blue background, with black border)
    const titleHeight = 20; // Fixed title height
    doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title row border
      .stroke();
  
    // Add the title text
    doc
      .fillColor('white') // Black text
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
    // Move to the next row
    startY += titleHeight;
  
    // Process table rows
    tableData.forEach((row, rowIndex) => {
      // Determine column widths
      const isFirstRow = rowIndex === 0;
      const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
      const numColumns = columnWidths.length;
  
      // Calculate the row height dynamically based on the tallest cell
      let rowHeight = 0;
      const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
        const columnWidth = columnWidths[colIndex] - 10; // Account for padding
        return doc.heightOfString(cell || 'NA', {
          width: columnWidth,
          align: 'left',
        });
      });
      rowHeight = Math.max(...cellHeights) + 10; // Add padding
  
      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
  doc.addPage()

  
    const title = [" Present/Communication Address"]; // For the first row
    const tableData = [
      { col1: "Address as per Aadhar ", col2: `${allPerameters.loacalAdharAdress}` }, // First row (2 columns)
      { col1: "Landmark ", col2: `${allPerameters.appLandmark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.localCity}` }, // Subsequent rows (4 columns)
      { col1: "District Name ", col2: `${allPerameters.localDistrict}`, col3: "State", col4: `${allPerameters.loacalState}` },
      { col1: "Country", col2: `${allPerameters.appCountry}`, col3: "PIN Code ", col4: `${allPerameters.localPin}` },
      { col1: "Present Address is ", col2: `${allPerameters.appResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.AppYearsAtCureentAdress}` },
    
    ];
  createStyledTable1(doc, title, tableData);
  
  
    
  
  
    doc.addPage();
      //   // addLogo(doc);(doc);(doc);
    // drawBorder()
    doc.moveDown(3)
    doc.font(fontBold).fontSize(11).text("SECTION 2:Co-Applicant Details", { underline: true ,align: "center"});
  
 
  function drawTablenew1(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = titleX;
    let startY = doc.y + titleHeight;
    const columnWidthsFirst5 = [125, 375];
    const columnWidths = [125, 125, 125, 125];
    const imageWidth = 100;
  
    // Title Section with Borders
    doc.rect(startX, startY, titleWidth, titleHeight)
      .fill("#0066B1")
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
  
    doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);
  
    startY += titleHeight;
  
    const imageSpanRows = 5;
    const imageHeight = imageSpanRows * 22;
  
    // Iterate through the data and draw rows
    data.forEach((row, index) => {
      // Determine row height based on text
      let rowHeight = 20; // Default row height
      if (index < 5) {
        rowHeight = Math.max(
          doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
          doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
        ) + 10; // Add padding
      } else {
        rowHeight = Math.max(
          doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
          doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
        ) + 10; // Add padding
      }
  
      const rowY = startY;
  
      // Draw row cells based on layout
      if (index < 5) {
        doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
          .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });
  
        // if (index === 0) {
        //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
        //     .strokeColor("black")
        //     .lineWidth(1)
        //     .stroke();
  
        //   if (fs.existsSync(imagePath)) {
        //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
        //       fit: [imageWidth - 10, imageHeight - 10],
        //     });
        //   } else {
        //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
        //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        //   }
        // }
      } else {
        // Four-column layout
        for (let i = 0; i < 4; i++) {
          doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        }
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
      }
  
      startY += rowHeight; // Move to the next row
    });
  }
  
  const coapplicantDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType}` },
    { key: "Business Type", value: `${allPerameters.coAppbuiType}` },
    { key: "Co-Applicant Name", value: `${allPerameters.coAppName}` },
    { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather}` },
    { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother}` },
    { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob1}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.coAppEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.coAppEdu}`, key2: "Religion", value2: `${allPerameters.coAppreligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob}`, key2: "Nationality", value2: `${allPerameters.coAppNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1:  `${allPerameters.coAppGender}`, key2: "Category", value2:  `${allPerameters.coAppCategory}` },
    { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd}`},
    { key1: "Pan Number", value1:  `${allPerameters.coAppPan}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId}` },
    { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
    
    
    
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
      const imagePath1 = await saveImageLocally1(`${allPerameters.co1Image}`);
    
    const sectionTitle1 = "Co-Applicant Details";
    drawTablenew1(sectionTitle1, coapplicantDetailsData, imagePath1);
    doc.moveDown()
  
  
 
  function createStyledTablep(doc, title, tableData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  
    // Determine table width based on the first-row column widths
    const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (full-width, blue background, with black border)
    const titleHeight = 20; // Fixed title height
    doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title row border
      .stroke();
  
    // Add the title text
    doc
      .fillColor('white') // Black text
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
    // Move to the next row
    startY += titleHeight;
  
    // Process table rows
    tableData.forEach((row, rowIndex) => {
      // Determine column widths
      const isFirstRow = rowIndex === 0;
      const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
      const numColumns = columnWidths.length;
  
      // Calculate the row height dynamically based on the tallest cell
      let rowHeight = 0;
      const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
        const columnWidth = columnWidths[colIndex] - 10; // Account for padding
        return doc.heightOfString(cell || 'NA', {
          width: columnWidth,
          align: 'left',
        });
      });
      rowHeight = Math.max(...cellHeights) + 10; // Add padding
  
      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  doc.addPage()

    const titlep = [" Present/Communication Address"]; // For the first row
    const tableDatap = [
      { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress}` }, // First row (2 columns)
        { col1: "Landmark ", col2:  `${allPerameters.coappLandMark}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity}` }, // Subsequent rows (4 columns)
        { col1: "District Name ", col2:  `${allPerameters.coAppdistrict}`, col3: "State", col4:  `${allPerameters.coAppState}` },
        { col1: "Country", col2:  `${allPerameters.coAppCountry}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN}` },
        { col1: "Present Address is ", col2:  `${allPerameters.coResidence}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress}` },
      
      ];
  createStyledTablep(doc, titlep, tableDatap);
  doc.moveDown(3)
  
  
    doc.addPage();
    //   // addLogo(doc);(doc);(doc);
  // drawBorder()
  doc.moveDown(3)
  doc.font(fontBold).fontSize(11).text("SECTION 2: Additional Co-Applicant Details", { underline: true,align: "center" });
  
 
  function drawTablenewa(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = titleX;
    let startY = doc.y + titleHeight;
    const columnWidthsFirst5 = [125, 375];
    const columnWidths = [125, 125, 125, 125];
    const imageWidth = 100;
  
    // Title Section with Borders
    doc.rect(startX, startY, titleWidth, titleHeight)
      .fill("#0066B1")
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
  
    doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);
  
    startY += titleHeight;
  
    const imageSpanRows = 5;
    const imageHeight = imageSpanRows * 22;
  
    // Iterate through the data and draw rows
    data.forEach((row, index) => {
      // Determine row height based on text
      let rowHeight = 20; // Default row height
      if (index < 5) {
        rowHeight = Math.max(
          doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
          doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
        ) + 10; // Add padding
      } else {
        rowHeight = Math.max(
          doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
          doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
        ) + 10; // Add padding
      }
  
      const rowY = startY;
  
      // Draw row cells based on layout
      if (index < 5) {
        doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
          .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });
  
        // if (index === 0) {
        //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
        //     .strokeColor("black")
        //     .lineWidth(1)
        //     .stroke();
  
        //   if (fs.existsSync(imagePath)) {
        //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
        //       fit: [imageWidth - 10, imageHeight - 10],
        //     });
        //   } else {
        //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
        //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        //   }
        // }
      } else {
        // Four-column layout
        for (let i = 0; i < 4; i++) {
          doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        }
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
      }
  
      startY += rowHeight; // Move to the next row
    });
  }
  
  const coapplicantDetailsDataa = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.coAppType2}` },
  { key: "Business Type", value: `${allPerameters.coAppbuiType2}` },
  { key: "Co-Applicant Name", value: `${allPerameters.coAppName2}` },
  { key: "Co-Applicant Father's/Spouse Name", value: `${allPerameters.coAppFather2}` },
  { key: "Co-Applicant Mother's Name", value: `${allPerameters.coAppMother2}` },
  { key1: "Relation With Applicant", value1: `${allPerameters.corelwithApp2}`,key2:"Mobile No.1",value2:`${allPerameters.coAppMob12}`},
  
  // Row 6 - 4 columns
  { key1: "Email ID", value1: `${allPerameters.coAppEmail2}` },
  
  // Row 7 - 2 columns with key-value pair
  { key1: "Educational Details", value1: `${allPerameters.coAppEdu2}`, key2: "Religion", value2: `${allPerameters.coAppreligion2}` },
  
  // Row 8 - 4 columns
  { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.coAPPDob2}`, key2: "Nationality", value2: `${allPerameters.coAppNationality2}` },
  
  // Remaining rows - 4 columns layout
  { key1: "Gender", value1:  `${allPerameters.coAppGender2}`, key2: "Category", value2:  `${allPerameters.coAppCategory2}` },
  { key1: "Marital Status", value1:  `${allPerameters.coAppMarritalStatus2}`, key2: "No. of Dependents", value2:  `${allPerameters.coAppNoOfDependentd2}`},
  { key1: "Pan Number", value1:  `${allPerameters.coAppPan2}`, key2: "Voter Id Number", value2:  `${allPerameters.coAppvoterId2}` },
  { key1: "Aadhar Number", value1:  `${allPerameters.coAPPAdhar2}`, key2: "Udyam Number", value2:  `${allPerameters.coAppUdhyamAaadharNo2}` },
  // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
  
  
  
  
  
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
  
  
  
  const imagePatha = await saveImageLocally2(`${allPerameters.co2Image}`);
  
  const sectionTitlea = "Co-Applicant Details";
  drawTablenewa(sectionTitlea, coapplicantDetailsDataa, imagePatha);
  doc.moveDown()
  doc.addPage()


  function createStyledTablep1(doc, title, tableData) {
    const startX = 50; // Starting X position
    let startY = doc.y + 10; // Starting Y position
    const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
    const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
  
    // Determine table width based on the first-row column widths
    const tableWidth = Math.max(
      columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
      columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
    );
  
    // Draw the title (full-width, blue background, with black border)
    const titleHeight = 20; // Fixed title height
    doc
      .fillColor('#0066B1') // Blue background
      .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
      .fill()
      .lineWidth(0.5)
      .strokeColor('black')
      .rect(startX, startY, tableWidth, titleHeight) // Title row border
      .stroke();
  
    // Add the title text
    doc
      .fillColor('white') // Black text
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
  
    // Move to the next row
    startY += titleHeight;
  
    // Process table rows
    tableData.forEach((row, rowIndex) => {
      // Determine column widths
      const isFirstRow = rowIndex === 0;
      const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
      const numColumns = columnWidths.length;
  
      // Calculate the row height dynamically based on the tallest cell
      let rowHeight = 0;
      const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
        const columnWidth = columnWidths[colIndex] - 10; // Account for padding
        return doc.heightOfString(cell || 'NA', {
          width: columnWidth,
          align: 'left',
        });
      });
      rowHeight = Math.max(...cellHeights) + 10; // Add padding
  
      // Alternating row colors
      const isGrayRow = rowIndex % 2 === 0;
      const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
  
      // Draw background for the row
      doc
        .fillColor(rowColor)
        .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
        .fill();
  
      // Draw cell borders and content
      Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
        const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
  
        // Draw border
        doc
          .lineWidth(0.5)
          .strokeColor('black')
          .rect(cellX, startY, columnWidths[colIndex], rowHeight)
          .stroke();
  
        // Add text content
        doc
          .fillColor('black')
          .font('Helvetica')
          .fontSize(7)
          .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
      });
  
      // Move to the next row
      startY += rowHeight;
    });
  }
  
  const titlep1 = [" Present/Communication Address"]; // For the first row
  const tableDatap1 = [
    { col1: "Address as per Aadhar ", col2:  `${allPerameters.coAppAdharAdress2}` }, // First row (2 columns)
    { col1: "Landmark ", col2:  `${allPerameters.coappLandMark2}`, col3: "Name of City/Town/Village", col4:  `${allPerameters.coAppcity2}` }, // Subsequent rows (4 columns)
    { col1: "District Name ", col2:  `${allPerameters.coAppdistrict2}`, col3: "State", col4:  `${allPerameters.coAppState2}` },
    { col1: "Country", col2:  `${allPerameters.coAppCountry2}`, col3: "PIN Code ", col4:  `${allPerameters.coAppPIN2}` },
    { col1: "Present Address is ", col2:  `${allPerameters.coResidence2}`, col3: "No. of Years at current address", col4:  `${allPerameters.coAppNoOfYearsATCurrentAddress2}` },
    ];
  createStyledTablep1(doc, titlep1, tableDatap1);
 
  
  
  
  
  
  
  
  
  
 
    doc.addPage();
    // drawBorder()
      //   // addLogo(doc);(doc);(doc);
    doc.moveDown(3)
  
    doc.font(fontBold).fontSize(11).text("SECTION 3:Guarantor Details", { underline: true ,align: "center"});
    
  
  
  
   
  function drawTablenew2(sectionTitle, data) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = titleX;
    let startY = doc.y + titleHeight;
    const columnWidthsFirst5 = [125, 375];
    const columnWidths = [125, 125, 125, 125];
    const imageWidth = 100;
  
    // Title Section with Borders
    doc.rect(startX, startY, titleWidth, titleHeight)
      .fill("#0066B1")
      .strokeColor("black")
      .lineWidth(1)
      .stroke();
  
    doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);
  
    startY += titleHeight;
  
    const imageSpanRows = 5;
    const imageHeight = imageSpanRows * 21.5;
  
    // Iterate through the data and draw rows
    data.forEach((row, index) => {
      // Determine row height based on text
      let rowHeight = 20; // Default row height
      if (index < 5) {
        rowHeight = Math.max(
          doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
          doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
        ) + 10; // Add padding
      } else {
        rowHeight = Math.max(
          doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
          doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
          doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
        ) + 10; // Add padding
      }
  
      const rowY = startY;
  
      // Draw row cells based on layout
      if (index < 5) {
        doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
          .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });
  
        // if (index === 0) {
        //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
        //     .strokeColor("black")
        //     .lineWidth(1)
        //     .stroke();
  
        //   if (fs.existsSync(imagePath)) {
        //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
        //       fit: [imageWidth - 10, imageHeight - 10],
        //     });
        //   } else {
        //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
        //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
        //   }
        // }
      } else {
        // Four-column layout
        for (let i = 0; i < 4; i++) {
          doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
        }
  
        doc.font("Helvetica").fontSize(8).fillColor("#000000")
          .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
          .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
      }
  
      startY += rowHeight; // Move to the next row
    });
  }
  
  const gauranterDetailsData = [
    // First 5 rows - 2 columns with key-value pairs
    { key: "Applicant Type", value: `${allPerameters.guaType}` },
    { key: "Business Type", value: `${allPerameters.guaBuisType}` },
    { key: "Guarantor  Name", value: `${allPerameters.guaName}` },
    { key: `Guarantor Father's/Spouse Name`, value: `${allPerameters.guaFather}` },
    { key: "Guarantor Mother's Name", value: `${allPerameters.guaMother}` },


    { key1: "Mobile No 1", value1: `${allPerameters.guaMobile}`,key2:"Mobile No.2",value2:`${allPerameters.guaMobileNo2}`},
  
    // Row 6 - 4 columns
    { key1: "Email ID", value1: `${allPerameters.guaEmail}` },
  
    // Row 7 - 2 columns with key-value pair
    { key1: "Educational Details", value1: `${allPerameters.guaEdu}`, key2: "Religion", value2: `${allPerameters.giaReligion}` },
  
    // Row 8 - 4 columns
    { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.guaDob}`, key2: "Nationality", value2: `${allPerameters.guaNationality}` },
  
    // Remaining rows - 4 columns layout
    { key1: "Gender", value1: `${allPerameters.guaGender}`, key2: "Category", value2: `${allPerameters.guaCategory}` },
    { key1: "Marital Status", value1: `${allPerameters.guaMaritialStatus}`, key2: "No. of Dependents", value2: `${allPerameters.guaNoOfDependent}` },
    { key1: "Pan Number", value1: `${allPerameters.guaPan}`, key2: "Voter Id Number", value2: `${allPerameters.guaVoterId}` },
    { key1: "Aadhar Number", value1: `${allPerameters.guaAdhar}`, key2: "Udyam Number", value2: `${allPerameters.guaUdhyam}` },
    // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
    // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
  ];
    
    
    
    
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
      const imagePath2 = await saveImageLocally3(`${allPerameters.guaImage}`);
    
    const sectionTitle2 = "Guarantor Details";
    drawTablenew2(sectionTitle2, gauranterDetailsData, imagePath2);
    doc.moveDown()
  
  
    
    doc.addPage()

   
    function createStyledTablep3(doc, title, tableData) {
      const startX = 50; // Starting X position
      let startY = doc.y + 10; // Starting Y position
      const columnWidthsFirstRow = [110, 390]; // 2 columns for the first row
      const columnWidthsOtherRows = [110, 140, 110, 140]; // 4 columns for other rows
    
      // Determine table width based on the first-row column widths
      const tableWidth = Math.max(
        columnWidthsFirstRow.reduce((acc, width) => acc + width, 0),
        columnWidthsOtherRows.reduce((acc, width) => acc + width, 0)
      );
    
      // Draw the title (full-width, blue background, with black border)
      const titleHeight = 20; // Fixed title height
      doc
        .fillColor('#0066B1') // Blue background
        .rect(startX, startY, tableWidth, titleHeight) // Title row rectangle
        .fill()
        .lineWidth(0.5)
        .strokeColor('black')
        .rect(startX, startY, tableWidth, titleHeight) // Title row border
        .stroke();
    
      // Add the title text
      doc
        .fillColor('white') // Black text
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(title, startX + 5, startY + 5, { width: tableWidth - 10, align: 'left' });
    
      // Move to the next row
      startY += titleHeight;
    
      // Process table rows
      tableData.forEach((row, rowIndex) => {
        // Determine column widths
        const isFirstRow = rowIndex === 0;
        const columnWidths = isFirstRow ? columnWidthsFirstRow : columnWidthsOtherRows;
        const numColumns = columnWidths.length;
    
        // Calculate the row height dynamically based on the tallest cell
        let rowHeight = 0;
        const cellHeights = Object.values(row).slice(0, numColumns).map((cell, colIndex) => {
          const columnWidth = columnWidths[colIndex] - 10; // Account for padding
          return doc.heightOfString(cell || 'NA', {
            width: columnWidth,
            align: 'left',
          });
        });
        rowHeight = Math.max(...cellHeights) + 10; // Add padding
    
        // Alternating row colors
        const isGrayRow = rowIndex % 2 === 0;
        const rowColor = isGrayRow ? '#f5f5f5' : '#ffffff';
    
        // Draw background for the row
        doc
          .fillColor(rowColor)
          .rect(startX, startY, columnWidths.reduce((acc, width) => acc + width, 0), rowHeight)
          .fill();
    
        // Draw cell borders and content
        Object.values(row).slice(0, numColumns).forEach((cell, colIndex) => {
          const cellX = startX + columnWidths.slice(0, colIndex).reduce((acc, width) => acc + width, 0);
    
          // Draw border
          doc
            .lineWidth(0.5)
            .strokeColor('black')
            .rect(cellX, startY, columnWidths[colIndex], rowHeight)
            .stroke();
    
          // Add text content
          doc
            .fillColor('black')
            .font('Helvetica')
            .fontSize(7)
            .text(cell || 'NA', cellX + 5, startY + 5, { width: columnWidths[colIndex] - 10, align: 'left' });
        });
    
        startY += rowHeight;
      });
    }
    
    //   const titlep3 = [" Present/Communication Address"]; // For the first row
    // const tableDatap3 = [
    //   { col1: "Address as per Aadhar ", col2: `${allPerameters.gualoacalAdharAdress}` }, // First row (2 columns)
    //   { col1: "Landmark ", col2: `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.gualocalCity}` }, // Subsequent rows (4 columns)
    //   { col1: "District Name ", col2: `${allPerameters.gualocalDistrict}`, col3: "State", col4: `${allPerameters.gualoacalState}` },
    //   { col1: "Country", col2: `${allPerameters.guaGender}`, col3: "PIN Code ", col4: `${allPerameters.guaGender}` },
    //   { col1: "Present Address is ", col2: `${allPerameters.guaResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.gualocalPin}` },
    // ];
    // createStyledTablep3(doc, titlep3, tableDatap3);
    
  
  
    
  
    // drawTable("Permanent Address", GuarnatorParentAddress);
    // doc.moveDown(3);

    // const imageUrl = "https://cdn.fincooper.in/STAGE/LOS/IMAGE/1740657212701_1738394790686_APP. ADHAR FRONT (1).JPG";

    //     // 🔹 Fetch Image as Buffer
    //     const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    //     const imageBuffer = Buffer.from(response.data, "binary");

    //     // 🔹 Embed Image in PDF
    //     doc.image(imageBuffer, 100, 100, { width: 300 });

    
    // const imageWidth = 200; 
    // const imageHeight = 140; 

    // const xPosition = 50; // 50px margin from left
    // const rightPosition = pageWidth - imageWidth - 50; // 50px margin from right

    // const gauAdharFront =`${allPerameters.aadharFrontImage}`

    //     // 🔹 Fetch Image as Buffer
    //     const response = await axios.get(gauAdharFront, { responseType: "arraybuffer" });
    //     const imageBuffer = Buffer.from(response.data, "binary");

    // const yPosition = doc.y;

       


    //     // doc.rect(100, yPosition, imageWidth, imageHeight).stroke(); 

    //     // doc.image(imageBuffer, 100, yPosition, { fit: [imageWidth, imageHeight], align: "left" });

    //     doc.rect(xPosition, yPosition, imageWidth, imageHeight).stroke();

    //     // 🔹 Add Image at Left Position
    //     doc.image(imageBuffer, xPosition, yPosition, { fit: [imageWidth, imageHeight],continued: true });

       
    
        // 🔹 Example Usage
//         await addImageWithLabel(doc, "Aadhar Card Front", `${allPerameters.aadharFrontImage}`, "left");
//         await addImageWithLabel(doc, "Aadhar Card Back", `${allPerameters.aadharBackImage}`, "right");
//         doc.moveDown(3); // Move down for next element
//         await addImageWithLabel(doc, "Additional Document", `${allPerameters.docImage}`, "left");

    
// doc.addPage()
const titlep3 = [" Present/Communication Address"]; // For the first row
const tableDatap3 = [
  { col1: "Address as per Aadhar ", col2: `${allPerameters.gualoacalAdharAdress}` }, // First row (2 columns)
  { col1: "Landmark ", col2: `${allPerameters.guaLandMark}`, col3: "Name of City/Town/Village", col4: `${allPerameters.gualocalCity}` }, // Subsequent rows (4 columns)
  { col1: "District Name ", col2: `${allPerameters.gualocalDistrict}`, col3: "State", col4: `${allPerameters.gualoacalState}` },
  { col1: "Country", col2: `India`, col3: "PIN Code ", col4: `${allPerameters.gualocalPin}` },
  { col1: "Present Address is ", col2: `${allPerameters.guaResidence}`, col3: "No. of Years at current address", col4: `${allPerameters.guaYearsCurrentAddress}` },
];
createStyledTablep3(doc, titlep3, tableDatap3);

//-------------------------------------------------------------Deal Summary Tab End Here ---------------------------------------------------------------------------------
//---------------------------------------------------------------CIBIL DETAIL--------------------------------------------------------

doc.addPage()
doc.moveDown(3)
const textWidthCIBIL = doc.widthOfString("Cibil details", { font: fontBold, size: 20 });
const centerXCIBIL = (pageWidth - textWidthCIBIL) / 2; // Calculate center position

doc
  .font(fontBold)
  .fontSize(11)
  .text("Cibil details", centerXCIBIL, doc.y, { underline: true });

  function drawTable3333(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const columnWidths = [250, 250]; // Key and Value columns
  
    // Draw Special Row (Header)
    const specialRowHeight = 20;
    doc.rect(startX, startY, titleWidth, specialRowHeight)
        .fill("#1E90FF")
        .strokeColor("#151B54")
        .lineWidth(1)
        .stroke();
  
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("black")
        .text(sectionTitle, startX + 5, startY + 8);
  
    startY += specialRowHeight; // Move below the header
  
    // Draw table rows dynamically
    data.forEach((row, index) => {
        // Calculate text height dynamically
        const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
        const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });
  
        const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20
  
        // Draw Key cell
        doc.rect(startX, startY, columnWidths[0], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Draw Value cell
        doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Add Key and Value text
        doc.font(font)
            .fontSize(10)
            .fillColor("#000000")
            .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
            .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });
  
        // Move Y position for next row
        startY += rowHeight;
    });
  }
    const applicantDetails3333 = [
  
      {
        key:"Fin Id", value: `${allPerameters.customerFinId}`
      }, {
        key: "Product", value: `${allPerameters.Product}`
      }, {
        key: "Loan Amount", value: `${allPerameters.loanAmount}`
      }, {
        key: "ROI", value: `${allPerameters.roi}`
      }, {
        key: "Tenure", value: `${allPerameters.tenure}`
      }, {
        key: "EMI", value: `${allPerameters.emi}`
      }, {
        key: "Sales Person", value: `${allPerameters.salesPerson}`
      }, {
        key: "Branch", value: `${allPerameters.Branch}`
      }
      // ,
      //  {
      //   key: "Landmark", value: `${allPerameters.landmark}`
      // }, {
      //   key: "City", value: `${allPerameters.city}`
      // }, {
      //   key: "District", value: `${allPerameters.districtName}`
      // }, {
      //   key: "State", value: `${allPerameters.state}`
      // }, {
      //   key: "Pin Code", value: `${allPerameters.pinCode}`
      // }, {
      //   key: "Mobile NO", value: `${allPerameters.mobileNumber}`
      // }, {
      //   key: "Email Id", value: `${allPerameters.emailId}`
      // }
      // , {
      //   key: "Year At Current Adress", value: `${allPerameters.noOfYearsInCurrentAddress}`
      // }
      // , {
      //   key: "Buisness Premises", value: `${allPerameters.businessPremises}`
      // }
    ];
   
    drawTable3333("Customer Information", applicantDetails3333);
  
// function tableFunction22(tableData, columnHeaders) {
//   const startX = 50; 
//   let startY = doc.y + 10; 
//   const boxWidth = 500; 
//   const numFields = columnHeaders.length;  // Columns dynamically based on fields
//   const fieldWidth = boxWidth / numFields; 

//   let totalHeight = 0;

//   // Calculate total height dynamically
//   tableData.forEach((row) => {
//       let rowHeight = 0;
//       columnHeaders.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10; 
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });
//       totalHeight += rowHeight;
//   });

//   doc.lineWidth(0.5);

//   // Draw outer table border
//   doc
//       .fillColor("#f0f0f0")
//       .rect(startX, startY, boxWidth, totalHeight) 
//       .stroke("black")
//       .fill();

//   // Loop through the data and draw the text inside the box
//   tableData.forEach((row) => {
//       let currentX = startX;
//       let rowHeight = 0;

//       columnHeaders.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10;
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });

//       columnHeaders.forEach((field) => {
//           doc
//               .fillColor("#f5f5f5")
//               .rect(currentX, startY, fieldWidth, rowHeight)
//               .stroke("black");

//           doc
//               .font('Helvetica')
//               .fillColor("black")
//               .fontSize(7.2);

//           doc.text(row[field] || '', currentX + 5, startY + 5, {
//               baseline: "hanging",
//               width: fieldWidth - 10,
//               align: "left",
//           });

//           currentX += fieldWidth;
//       });

//       startY += rowHeight;
//   });
// }

// // ✅ **Extract Dynamic Headers from `mergedData`**
// const mergedData = allPerameters.mergedData;

// // Get all unique keys (column names)
// const columnHeaders = [...new Set(mergedData.flatMap(Object.keys))];

// // ✅ **Convert `mergedData` to Table Format Dynamically**
// const requiredTable22 = [Object.fromEntries(columnHeaders.map(field => [field, field.toUpperCase()]))];

// // Convert each data row
// mergedData.forEach((item) => {
//   const rowData = {};
//   columnHeaders.forEach(field => {
//       rowData[field] = item[field] !== undefined ? item[field].toString() : '';  // Convert values to string
//   });
//   requiredTable22.push(rowData);
// });

// // Call table function
// tableFunction22(requiredTable22, columnHeaders);

// function tableFunction22(doc, tableData, columnHeaders) {
//   const startX = 50; 
//   let startY = doc.y + 10; 
//   const boxWidth = 500; 
//   const numFields = columnHeaders.length;  
//   const fieldWidth = boxWidth / numFields; 
//   const pageHeight = doc.page.height - 50; // Available page height excluding margin
//   const rowSpacing = 5; // Space between rows

//   doc.lineWidth(0.5);

//   // ✅ **Draw Headers (First Page)**
//   let currentX = startX;
//   let rowHeight = 20; // Header row height
//   doc.fillColor("#dcdcdc");

//   columnHeaders.forEach((field) => {
//       doc
//           .rect(currentX, startY, fieldWidth, rowHeight)
//           .stroke("black")
//           .fill();

//       doc
//           .font('Helvetica-Bold')
//           .fillColor("black")
//           .fontSize(8)
//           .text(field.toUpperCase(), currentX + 5, startY + 5, {
//               width: fieldWidth - 10,
//               align: "left",
//           });

//       currentX += fieldWidth;
//   });

//   startY += rowHeight + rowSpacing;

//   // ✅ **Loop Through Data & Handle Page Breaks**
//   tableData.forEach((row, index) => {
//       let rowHeight = 0;

//       columnHeaders.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10;
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });

//       // ✅ **Check If Page Overflow**
//       if (startY + rowHeight > pageHeight) {
//           doc.addPage();
//           startY = 50; // Reset Y position
//           doc.fillColor("#dcdcdc");

//           // ✅ **Re-draw Headers on New Page**
//           let headerX = startX;
//           columnHeaders.forEach((field) => {
//               doc
//                   .rect(headerX, startY, fieldWidth, 20)
//                   .stroke("black")
//                   .fill();

//               doc
//                   .font('Helvetica-Bold')
//                   .fillColor("black")
//                   .fontSize(8)
//                   .text(field.toUpperCase(), headerX + 5, startY + 5, {
//                       width: fieldWidth - 10,
//                       align: "left",
//                   });

//               headerX += fieldWidth;
//           });

//           startY += 25; // Move below header
//       }

//       // ✅ **Draw Table Row**
//       let currentX = startX;
//       columnHeaders.forEach((field) => {
//           doc
//               .fillColor("#ffffff") // Background
//               .rect(currentX, startY, fieldWidth, rowHeight)
//               .stroke("black");

//           doc
//               .font('Helvetica')
//               .fillColor("black")
//               .fontSize(7.2)
//               .text(row[field] || '', currentX + 5, startY + 5, {
//                   width: fieldWidth - 10,
//                   align: "left",
//               });

//           currentX += fieldWidth;
//       });

//       startY += rowHeight + rowSpacing; // Move to next row
//   });
// }
doc.addPage()

//cibil detail

// function tableFunctioncibil(tableData) {
//   // Add Table Header
//   const startX = 50; // Starting X position for the box
//   let startY = doc.y + 10; // Starting Y position for the box
//   const boxWidth = 500; // Total width of the box
//   const numFields = 5; // Now 5 fields
//   const fieldWidth = boxWidth / numFields; // Calculate width for each column

//   // Calculate the total height needed for the entire box
//   let totalHeight = 0;

//   // Calculate the height for each row and determine the total height of the box
//   tableData.forEach((row) => {
//       let rowHeight = 0;
//       const fields = ["field1", "field2", "field3", "field4", "field5"]; // Now 5 fields
//       fields.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });
//       totalHeight += rowHeight;
//   });

//   // Set normal (thin) line width
//   doc.lineWidth(0.5); 

//   // Draw the outer rectangle for the box
//   doc
//       .fillColor("#f0f0f0") 
//       .rect(startX, startY, boxWidth, totalHeight) 
//       .stroke("black") 
//       .fill();

//   // Loop through the data and draw the text inside the box
//   tableData.forEach((row) => {
//       let currentX = startX; 
//       let rowHeight = 0;
//       const fields = ["field1", "field2", "field3", "field4", "field5"]; 

//       fields.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });

//       // Draw rectangles for each field in the row
//       fields.forEach((field) => {
//           doc
//               .fillColor("#f5f5f5")
//               .rect(currentX, startY, fieldWidth, rowHeight)
//               .stroke("black");

//           doc
//               .font('Helvetica')
//               .fillColor("black")
//               .fontSize(7.2);

//           // Align field3 (Relationship) to center, rest left
//           const align = field === "field3" ? "center" : "left";

//           doc.text(row[field], currentX + 5, startY + 5, {
//               baseline: "hanging",
//               width: fieldWidth - 10,
//               align: align,
//           });

//           // Move to the next column
//           currentX += fieldWidth;
//       });

//       // Move to the next row
//       startY += rowHeight;
//   });
// }

// const requiredTablecibil = [
//   { field1: "Member Name", field2: "Relationship", field3: "Age", field4: "DOB", field5: "Gender" }, // Header Row
//   { field1: `${allPerameters.memberName}`, field2: `${allPerameters.relationship}`, field3: `${allPerameters.age}`, field4: `${allPerameters.dob}`, field5: `${allPerameters.gender}` },
//   { field1: `${allPerameters.memberName1}`, field2: `${allPerameters.relationship1}`, field3: `${allPerameters.age1}`, field4: `${allPerameters.dob1}`, field5: `${allPerameters.gender1}` },
//   { field1: `${allPerameters.memberName2}`, field2: `${allPerameters.relationship2}`, field3: `${allPerameters.age2}`, field4: `${allPerameters.dob2}`, field5: `${allPerameters.gender2}` },
//   { field1: `${allPerameters.memberName3}`, field2: `${allPerameters.relationship3}`, field3: `${allPerameters.age3}`, field4: `${allPerameters.dob3}`, field5: `${allPerameters.gender3}` },
//   { field1: `${allPerameters.memberName4}`, field2: `${allPerameters.relationship4}`, field3: `${allPerameters.age4}`, field4: `${allPerameters.dob4}`, field5: `${allPerameters.gender4}` },
  
// ];

// // Call the function to create the table
// tableFunctioncibil(requiredTablecibil);

function tableFunctioncibil(tableData) {
  // Add Table Header
  const startX = 50; // Starting X position for the box
  let startY = doc.y + 10; // Starting Y position for the box
  const boxWidth = 500; // Total width of the box
  const numFields = 4; // Only 4 fields now
  const fieldWidth = boxWidth / numFields; // Calculate width for each column

  // Calculate the total height needed for the entire box
  let totalHeight = 0;

  // Calculate the height for each row and determine the total height of the box
  tableData.forEach((row) => {
      // Calculate row height based on the content in each field
      let rowHeight = 0;
      const fields = ["field1", "field2", "field3", "field4"]; // Only 4 fields
      fields.forEach((field) => {
          const fieldTextHeight = doc
              .font('Helvetica')
              .fontSize(7.2)
              .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
          rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
      });
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
      let rowHeight = 0;
      const fields = ["field1", "field2", "field3", "field4"]; // Only 4 fields
      fields.forEach((field) => {
          const fieldTextHeight = doc
              .font('Helvetica')
              .fontSize(7.2)
              .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
          rowHeight = Math.max(rowHeight, fieldTextHeight);
      });

      // Draw rectangles for each field in the row
      fields.forEach((field) => {
          doc
              .fillColor("#f5f5f5")
              .rect(currentX, startY, fieldWidth, rowHeight)
              .stroke("black");

          doc
              .font('Helvetica')
              .fillColor("black")
              .fontSize(7.2);

          // Align field3 (Relationship) to center, rest left
          const align = field === "field3" ? "center" : "left";

          doc.text(row[field], currentX + 5, startY + 5, {
              baseline: "hanging",
              width: fieldWidth - 10,
              align: align,
          });

          // Move to the next column
          currentX += fieldWidth;
      });

      // Move to the next row
      startY += rowHeight;
  });
}
const requiredTablecibil = [
  { field1: "Detail", field2: "Date", field3: "Fetch By", field4: "Cibil Score" },
  { field1: `Applicant`, field2: `${allPerameters.fetchDate1}`, field3: `${allPerameters.cibilEmployee1}`, field4: `${allPerameters.applicantCibilScore}`},
  { field1: `Co Applicant`, field2: `${allPerameters.fetchDate2}`, field3: `${allPerameters.cibilEmployee2}`, field4: `${allPerameters.coApplicantCibilScore1}`},
  { field1: `co Applicant 2`, field2: `${allPerameters.fetchDate3}`, field3: `${allPerameters.cibilEmployee3}`, field4: `${allPerameters.coApplicantCibilScore2}`},
  { field1: `co Applicant 3`, field2: `${allPerameters.fetchDate4}`, field3: `${allPerameters.cibilEmployee4}`, field4: `${allPerameters.coApplicantCibilScore3}`},
  { field1: `guarantor`, field2: `${allPerameters.fetchDate5}`, field3: `${allPerameters.cibilEmployee5}`, field4: `${allPerameters.guarantorCibilScore}`},
];

// Call the function to create the table
tableFunctioncibil(requiredTablecibil); 



doc.addPage()


doc
  .font(fontBold)
  .fontSize(11)
  .text("Active Loan Details", centerXCIBIL, doc.y, { underline: true });

function tableFunction22(doc, tableData, columnHeaders) {
  const startX = 50; 
  let startY = doc.y + 10; 
  const boxWidth = 500; 
  const numFields = columnHeaders.length;  
  const fieldWidth = boxWidth / numFields; 
  const pageHeight = doc.page.height - 50; 
  const rowSpacing = 5; 

  doc.lineWidth(0.5);

  // ✅ **Draw Headers (ONLY ONCE)**
  let currentX = startX;
  let rowHeight = 33; 
  doc.fillColor("#dcdcdc");

  columnHeaders.forEach((field) => {
      doc
          .rect(currentX, startY, fieldWidth, rowHeight)
          .stroke("black")
          .fill();

      doc
          .font('Helvetica-Bold')
          .fillColor("black")
          .fontSize(8)
          .text(field.toUpperCase(), currentX + 5, startY + 5, {
              width: fieldWidth - 10,
              align: "center",
          });

      currentX += fieldWidth;
  });

  startY += rowHeight + rowSpacing;

  // ✅ **Loop Through Data & Handle Page Breaks**
  tableData.forEach((row, index) => {
      let maxHeight = 0; // ✅ Track max height for row

      // ✅ **Find Maximum Row Height**
      columnHeaders.forEach((field) => {
          const text = row[field] ? row[field].toString() : "";
          const textHeight = doc.heightOfString(text, {
              width: fieldWidth - 10,
              align: "left"
          });
          maxHeight = Math.max(maxHeight, textHeight);
      });

      let dynamicRowHeight = maxHeight + 10; // ✅ Extra Padding

      // ✅ **Check If Page Overflow**
      if (startY + dynamicRowHeight > pageHeight) {
          doc.addPage();
          startY = 50; // Reset Y position
      }

      // ✅ **Draw Table Row**
      let currentX = startX;
      columnHeaders.forEach((field) => {
          doc
              .fillColor("#ffffff") 
              .rect(currentX, startY, fieldWidth, dynamicRowHeight)
              .stroke("black");

          doc
              .font('Helvetica')
              .fillColor("black")
              .fontSize(8)
              .text(row[field] || '', currentX + 5, startY + 5, {
                  width: fieldWidth - 10,
                  align: "left",
              });

          currentX += fieldWidth;
      });

      startY += dynamicRowHeight + rowSpacing; 
  });
}

const mergedData = allPerameters.mergedData;

const columnHeaders = [...new Set(mergedData.flatMap(Object.keys))];

// ✅ **Convert `mergedData` to Table Format**
// const requiredTable22 = [Object.fromEntries(columnHeaders.map(field => [field, field.toUpperCase()]))];

// mergedData.forEach((item) => {
//   const rowData = {};
//   columnHeaders.forEach(field => {
//       rowData[field] = item[field] !== undefined ? item[field].toString() : '';  
//   });
//   requiredTable22.push(rowData);
// });



const requiredTable22 = [];
mergedData.forEach((item) => {
    const rowData = {};
    columnHeaders.forEach(field => {
        rowData[field] = item[field] !== undefined ? item[field].toString() : '';  
    });
    requiredTable22.push(rowData);
});

// ✅ **Pass `doc` to the Function**
tableFunction22(doc, requiredTable22, columnHeaders);


doc.addPage()
doc.moveDown(3)
const textWidthpd = doc.widthOfString("Udhyuam details", { font: fontBold, size: 20 });
const centerXpd = (pageWidth - textWidthpd) / 2; 

doc
  .font(fontBold)
  .fontSize(11)
  .text("Pd details", centerXpd, doc.y, { underline: true });

function drawTable33(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}
  const applicantDetails33 = [

    {
      key:"CustomerFin Id", value: `${allPerameters.customerFinId}`
    }, {
      key: "Login Date", value: `${allPerameters.loginDate}`
    }, {
      key: "Cibil Date", value: `${allPerameters.cibilDate}`
    }, {
      key: "Pd Done Date", value: `${allPerameters.pdDate}`
    }, {
      key: "Pd Done BY", value: `${allPerameters.pdDoneBy}`
    }, {
      key: "Employee Code", value: `${allPerameters.employeeCode}`
    }, {
      key: "Branch", value: `${allPerameters.branchName}`
    }, {
      key: "Designation", value: `${allPerameters.designation}`
    }
    // ,
    //  {
    //   key: "Landmark", value: `${allPerameters.landmark}`
    // }, {
    //   key: "City", value: `${allPerameters.city}`
    // }, {
    //   key: "District", value: `${allPerameters.districtName}`
    // }, {
    //   key: "State", value: `${allPerameters.state}`
    // }, {
    //   key: "Pin Code", value: `${allPerameters.pinCode}`
    // }, {
    //   key: "Mobile NO", value: `${allPerameters.mobileNumber}`
    // }, {
    //   key: "Email Id", value: `${allPerameters.emailId}`
    // }
    // , {
    //   key: "Year At Current Adress", value: `${allPerameters.noOfYearsInCurrentAddress}`
    // }
    // , {
    //   key: "Buisness Premises", value: `${allPerameters.businessPremises}`
    // }
  ];
 
  drawTable33("Pd Details", applicantDetails33);


//---------------------------------------------------------------Final Sanction Tab data---------------------------------------------------------------------------------------

doc.addPage()

function drawTablenew34(sectionTitle, data) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 375];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      // if (index === 0) {
      //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
      //     .strokeColor("black")
      //     .lineWidth(1)
      //     .stroke();

      //   if (fs.existsSync(imagePath)) {
      //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
      //       fit: [imageWidth - 10, imageHeight - 10],
      //     });
      //   } else {
      //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
      //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
      //   }
      // }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

const rasanCardData = [
  // First 5 rows - 2 columns with key-value pairs
  { key: "familyDetail Type", value: `${allPerameters.familyDetailType}` },
  { key: "card Number", value: `${allPerameters.cardNumber}` },
  { key: "card Holder", value: `${allPerameters.cardHolder}` },
  { key: `address`, value: `${allPerameters.address}` },
  { key: "shop Code And Location", value: `${allPerameters.shopCodeAndLocation}` },


  { key1: "shopkeeper", value1: `${allPerameters.shopkeeper}`,key2:"gasAgency",value2:`${allPerameters.gasAgency}`},

  // Row 6 - 4 columns
  { key1: "gas Connection No", value1: `${allPerameters.gasConnectionNo}` },

  // Row 7 - 2 columns with key-value pair
  { key1: "connection Type", value1: `${allPerameters.connectionType}`, key2: "rasanCardDoc", value2: `${allPerameters.rasanCardDoc}` },

  // Row 8 - 4 columns
  // { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.guaDob}`, key2: "rasanCard Doc", value2: `${allPerameters.guaNationality}` },

  // Remaining rows - 4 columns layout
  // { key1: "Gender", value1: `${allPerameters.guaGender}`, key2: "Category", value2: `${allPerameters.guaCategory}` },
  // { key1: "Marital Status", value1: `${allPerameters.guaMaritialStatus}`, key2: "No. of Dependents", value2: `${allPerameters.guaNoOfDependent}` },
  // { key1: "Pan Number", value1: `${allPerameters.guaPan}`, key2: "Voter Id Number", value2: `${allPerameters.guaVoterId}` },
  // { key1: "Aadhar Number", value1: `${allPerameters.guaAdhar}`, key2: "Udyam Number", value2: `${allPerameters.guaUdhyam}` },
  // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];
  
  const sectio2 = "Rasan Card";
  drawTablenew34(sectio2, rasanCardData);
  doc.moveDown(3)
  // doc.font(fontBold).fontSize(11).text("Family Members", { underline: true ,align: "center"});

  doc
  .font(fontBold)
  .fontSize(11)
  .text("Family Members", centerXpd, doc.y, { underline: true });
function tableFunction(tableData) {
  // Add Table Header
  const startX = 50; // Starting X position for the box
  let startY = doc.y + 10; // Starting Y position for the box
  const boxWidth = 500; // Total width of the box
  const numFields = 4; // Only 4 fields now
  const fieldWidth = boxWidth / numFields; // Calculate width for each column

  // Calculate the total height needed for the entire box
  let totalHeight = 0;

  // Calculate the height for each row and determine the total height of the box
  tableData.forEach((row) => {
      // Calculate row height based on the content in each field
      let rowHeight = 0;
      const fields = ["field1", "field2", "field3", "field4"]; // Only 4 fields
      fields.forEach((field) => {
          const fieldTextHeight = doc
              .font('Helvetica')
              .fontSize(7.2)
              .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
          rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
      });
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
      let rowHeight = 0;
      const fields = ["field1", "field2", "field3", "field4"]; // Only 4 fields
      fields.forEach((field) => {
          const fieldTextHeight = doc
              .font('Helvetica')
              .fontSize(7.2)
              .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
          rowHeight = Math.max(rowHeight, fieldTextHeight);
      });

      // Draw rectangles for each field in the row
      fields.forEach((field) => {
          doc
              .fillColor("#f5f5f5")
              .rect(currentX, startY, fieldWidth, rowHeight)
              .stroke("black");

          doc
              .font('Helvetica')
              .fillColor("black")
              .fontSize(7.2);

          // Align field3 (Relationship) to center, rest left
          const align = field === "field3" ? "center" : "left";

          doc.text(row[field], currentX + 5, startY + 5, {
              baseline: "hanging",
              width: fieldWidth - 10,
              align: align,
          });

          // Move to the next column
          currentX += fieldWidth;
      });

      // Move to the next row
      startY += rowHeight;
  });
}
const requiredTable = [
  { field1: "member Name", field2: "relationship", field3: "age", field4: "dob" },
  { field1: `${allPerameters.memberName}`, field2: `${allPerameters.relationship}`, field3: `${allPerameters.age}`, field4: `${allPerameters.dob}`},
  { field1: `${allPerameters.memberName1}`, field2: `${allPerameters.relationship1}`, field3: `${allPerameters.age1}`, field4: `${allPerameters.dob1}`},
  { field1: `${allPerameters.memberName2}`, field2: `${allPerameters.relationship2}`, field3: `${allPerameters.age2}`, field4: `${allPerameters.dob2}`},
  { field1: `${allPerameters.memberName3}`, field2: `${allPerameters.relationship3}`, field3: `${allPerameters.age3}`, field4: `${allPerameters.dob3}`},
  { field1: `${allPerameters.memberName4}`, field2: `${allPerameters.relationship4}`, field3: `${allPerameters.age4}`, field4: `${allPerameters.dob4}`},
  { field1: `${allPerameters.memberName5}`, field2: `${allPerameters.relationship5}`, field3: `${allPerameters.age5}`, field4: `${allPerameters.dob5}`},
  { field1: `${allPerameters.memberName6}`, field2: `${allPerameters.relationship6}`, field3: `${allPerameters.age6}`, field4: `${allPerameters.dob6}`},
  { field1: `${allPerameters.memberName7}`, field2: `${allPerameters.relationship7}`, field3: `${allPerameters.age7}`, field4: `${allPerameters.dob7}`},

];

// Call the function to create the table
tableFunction(requiredTable);  

doc.addPage()

function drawTablenew345(sectionTitle, data) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = titleX;
  let startY = doc.y + titleHeight;
  const columnWidthsFirst5 = [125, 375];
  const columnWidths = [125, 125, 125, 125];
  const imageWidth = 100;

  // Title Section with Borders
  doc.rect(startX, startY, titleWidth, titleHeight)
    .fill("#0066B1")
    .strokeColor("black")
    .lineWidth(1)
    .stroke();

  doc.font("Helvetica-Bold").fontSize(10).fillColor("white").text(sectionTitle, startX + 5, startY + 5);

  startY += titleHeight;

  const imageSpanRows = 5;
  const imageHeight = imageSpanRows * 21.5;

  // Iterate through the data and draw rows
  data.forEach((row, index) => {
    // Determine row height based on text
    let rowHeight = 20; // Default row height
    if (index < 5) {
      rowHeight = Math.max(
        doc.heightOfString(row.key || "", { width: columnWidthsFirst5[0] - 10, align: "left" }),
        doc.heightOfString(row.value || "", { width: columnWidthsFirst5[1] - 10, align: "left" })
      ) + 10; // Add padding
    } else {
      rowHeight = Math.max(
        doc.heightOfString(row.key1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.value1 || "", { width: columnWidths[0] - 10, align: "left" }),
        doc.heightOfString(row.key2 || "", { width: columnWidths[2] - 10, align: "left" }),
        doc.heightOfString(row.value2 || "", { width: columnWidths[3] - 10, align: "left" })
      ) + 10; // Add padding
    }

    const rowY = startY;

    // Draw row cells based on layout
    if (index < 5) {
      doc.rect(startX, rowY, columnWidthsFirst5[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      doc.rect(startX + columnWidthsFirst5[0], rowY, columnWidthsFirst5[1], rowHeight).strokeColor("black").lineWidth(1).stroke();

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key, startX + 5, rowY + 5, { width: columnWidthsFirst5[0] - 10 })
        .text(row.value, startX + columnWidthsFirst5[0] + 5, rowY + 5, { width: columnWidthsFirst5[1] - 10 });

      // if (index === 0) {
      //   doc.rect(startX + columnWidthsFirst5[0] + columnWidthsFirst5[1], rowY, imageWidth, imageHeight)
      //     .strokeColor("black")
      //     .lineWidth(1)
      //     .stroke();

      //   if (fs.existsSync(imagePath)) {
      //     doc.image(imagePath, startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 5, rowY + 5, {
      //       fit: [imageWidth - 10, imageHeight - 10],
      //     });
      //   } else {
      //     doc.font("Helvetica-Bold").fontSize(10).fillColor("#ff0000")
      //       .text("Image Not Found", startX + columnWidthsFirst5[0] + columnWidthsFirst5[1] + 10, rowY + imageHeight / 2 - 10);
      //   }
      // }
    } else {
      // Four-column layout
      for (let i = 0; i < 4; i++) {
        doc.rect(startX + i * columnWidths[0], rowY, columnWidths[0], rowHeight).strokeColor("black").lineWidth(1).stroke();
      }

      doc.font("Helvetica").fontSize(8).fillColor("#000000")
        .text(row.key1, startX + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value1, startX + columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.key2, startX + 2 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 })
        .text(row.value2, startX + 3 * columnWidths[0] + 5, rowY + 5, { width: columnWidths[0] - 10 });
    }

    startY += rowHeight; // Move to the next row
  });
}

const rasanCardData1 = [
  // First 5 rows - 2 columns with key-value pairs
  { key: "Samagra FamilyId", value: `${allPerameters.samagraFamilyId}` },
  { key: "Head Of Family", value: `${allPerameters.headOfFamily}` },
  { key: "Samagra Id Doc", value: `${allPerameters.samagraIdDoc}` },
  { key: `Current Address`, value: `${allPerameters.currentAddress}` },
  { key: "Address As Per Aadhaar", value: `${allPerameters.addressAsPerAadhaar}` },


  // { key1: "shopkeeper", value1: `${allPerameters.shopkeeper}`,key2:"gasAgency",value2:`${allPerameters.gasAgency}`},

  // // Row 6 - 4 columns
  // { key1: "gas Connection No", value1: `${allPerameters.gasConnectionNo}` },

  // // Row 7 - 2 columns with key-value pair
  // { key1: "connection Type", value1: `${allPerameters.connectionType}`, key2: "rasanCardDoc", value2: `${allPerameters.rasanCardDoc}` },

  // Row 8 - 4 columns
  // { key1: "Date Of Birth/Incorporation", value1: `${allPerameters.guaDob}`, key2: "rasanCard Doc", value2: `${allPerameters.guaNationality}` },

  // Remaining rows - 4 columns layout
  // { key1: "Gender", value1: `${allPerameters.guaGender}`, key2: "Category", value2: `${allPerameters.guaCategory}` },
  // { key1: "Marital Status", value1: `${allPerameters.guaMaritialStatus}`, key2: "No. of Dependents", value2: `${allPerameters.guaNoOfDependent}` },
  // { key1: "Pan Number", value1: `${allPerameters.guaPan}`, key2: "Voter Id Number", value2: `${allPerameters.guaVoterId}` },
  // { key1: "Aadhar Number", value1: `${allPerameters.guaAdhar}`, key2: "Udyam Number", value2: `${allPerameters.guaUdhyam}` },
  // { key1: "District Name", value1: "RATLAM", key2: "State", value2: "MADHYA PRADESH" },
  // { key1: "Country", value1: "INDIA", key2: "PIN Code", value2: "457339" }
];
  
  const sectio21 = "Samagra Family Id";
  drawTablenew345(sectio21, rasanCardData1);
  doc.moveDown()
  // doc.font(fontBold).fontSize(15).text("Family Members", { underline: true ,align: "center"});

  doc.moveDown(3)
  const textWidthfamily = doc.widthOfString("Family Members", { font: fontBold, size: 20 });
  const centerfamily = (pageWidth - textWidthfamily) / 2; // Calculate center position
  
  doc
    .font(fontBold)
    .fontSize(11)
    .text("Family Members", centerfamily, doc.y, { underline: true });

  function tableFunction1(tableData) {
    // Add Table Header
    const startX = 50; // Starting X position for the box
    let startY = doc.y + 10; // Starting Y position for the box
    const boxWidth = 500; // Total width of the box
    const numFields = 7; // Now 7 fields
    const fieldWidth = boxWidth / numFields; // Calculate width for each column
  
    // Calculate the total height needed for the entire box
    let totalHeight = 0;
  
    // Calculate the height for each row and determine the total height of the box
    tableData.forEach((row) => {
        let rowHeight = 0;
        const fields = ["field1", "field2", "field3", "field4", "field5", "field6", "field7"]; // Only 7 fields
        fields.forEach((field) => {
            const fieldTextHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
            rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
        });
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
        let rowHeight = 0;
        const fields = ["field1", "field2", "field3", "field4", "field5", "field6", "field7"]; // 7 fields
        fields.forEach((field) => {
            const fieldTextHeight = doc
                .font('Helvetica')
                .fontSize(7.2)
                .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
            rowHeight = Math.max(rowHeight, fieldTextHeight);
        });
  
        // Draw rectangles for each field in the row
        fields.forEach((field) => {
            doc
                .fillColor("#f5f5f5")
                .rect(currentX, startY, fieldWidth, rowHeight)
                .stroke("black");
  
            doc
                .font('Helvetica')
                .fillColor("black")
                .fontSize(7.2);
  
            // Align specific fields differently (if needed)
            const align = field === "field3" ? "center" : "left"; // Example: Center align 'field3'
  
            doc.text(row[field], currentX + 5, startY + 5, {
                baseline: "hanging",
                width: fieldWidth - 10,
                align: align,
            });
  
            // Move to the next column
            currentX += fieldWidth;
        });
  
        // Move to the next row
        startY += rowHeight;
    });
  }
  
  // ✅ **Updated Required Table with 7 Fields**
  const requiredTable1 = [
    { field1: "Samagra Id", field2: "aadhaar Status", field3: "Member Name", field4: "Age", field5: "Gender", field6: "Registration Authority", field7: "Registration Date" },
    { field1: `${allPerameters.samagraId1}`, field2: `${allPerameters.aadhaarStatus1}`, field3: `${allPerameters.memberName1}`, field4: `${allPerameters.age1}`, field5: `${allPerameters.gender1}`, field6: `${allPerameters.registrationAuthority1}`, field7: `${allPerameters.registrationDate1}` },
    { field1: `${allPerameters.samagraId2}`, field2: `${allPerameters.aadhaarStatus2}`, field3: `${allPerameters.memberName2}`, field4: `${allPerameters.age2}`, field5: `${allPerameters.gender2}`, field6: `${allPerameters.registrationAuthority2}`, field7: `${allPerameters.registrationDate2}` },
    { field1: `${allPerameters.samagraId3}`, field2: `${allPerameters.aadhaarStatus3}`, field3: `${allPerameters.memberName3}`, field4: `${allPerameters.age3}`, field5: `${allPerameters.gender3}`, field6: `${allPerameters.registrationAuthority3}`, field7: `${allPerameters.registrationDate3}` },
    { field1: `${allPerameters.samagraId4}`, field2: `${allPerameters.aadhaarStatus4}`, field3: `${allPerameters.memberName4}`, field4: `${allPerameters.age4}`, field5: `${allPerameters.gender4}`, field6: `${allPerameters.registrationAuthority4}`, field7: `${allPerameters.registrationDate4}` },
    { field1: `${allPerameters.samagraId5}`, field2: `${allPerameters.aadhaarStatus5}`, field3: `${allPerameters.memberName5}`, field4: `${allPerameters.age5}`, field5: `${allPerameters.gender5}`, field6: `${allPerameters.registrationAuthority5}`, field7: `${allPerameters.registrationDate5}` },
    { field1: `${allPerameters.samagraId6}`, field2: `${allPerameters.aadhaarStatus6}`, field3: `${allPerameters.memberName6}`, field4: `${allPerameters.age6}`, field5: `${allPerameters.gender6}`, field6: `${allPerameters.registrationAuthority6}`, field7: `${allPerameters.registrationDate6}` },
    { field1: `${allPerameters.samagraId7}`, field2: `${allPerameters.aadhaarStatus7}`, field3: `${allPerameters.memberName7}`, field4: `${allPerameters.age7}`, field5: `${allPerameters.gender7}`, field6: `${allPerameters.registrationAuthority7}`, field7: `${allPerameters.registrationDate7}` },
    { field1: `${allPerameters.samagraId8}`, field2: `${allPerameters.aadhaarStatus8}`, field3: `${allPerameters.memberName8}`, field4: `${allPerameters.age8}`, field5: `${allPerameters.gender8}`, field6: `${allPerameters.registrationAuthority8}`, field7: `${allPerameters.registrationDate8}` },

  ];

// Call the function to create the table
tableFunction1(requiredTable1);  


// doc.font(fontBold).fontSize(11).text("Udhyuam details", { underline: true ,align: "center"});
// const pageWidth = doc.page.width; // Get total page width

doc.addPage()
doc.moveDown(3)
const textWidth = doc.widthOfString("Udhyuam details", { font: fontBold, size: 20 });
const centerX = (pageWidth - textWidth) / 2; // Calculate center position

doc
  .font(fontBold)
  .fontSize(11)
  .text("Udhyuam details", centerX, doc.y, { underline: true });

function drawTable3(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const applicantDetails = [

    {
      key:"Udyam Registration Number", value: `${allPerameters.udhyamRegistrationNo}`
    }, {
      key: "Organisation Name", value: `${allPerameters.OrganisationName}`
    }, {
      key: "Type Of Organisation", value: `${allPerameters.typeOfOrganisation}`
    }, {
      key: "Major Activity", value: `${allPerameters.natureOfBusiness}`
    }, {
      key: "MSME Classification", value: `${allPerameters.MsmeClassification}`
    }, {
      key: "Date Of Incorporation", value: `${allPerameters.dateOfIncorporation}`
    }, {
      key: "", value: ``
    }, {
      key: "Full Adress", value: `${allPerameters.fullAddress}`
    }, {
      key: "Landmark", value: `${allPerameters.landmark}`
    }, {
      key: "City", value: `${allPerameters.city}`
    }, {
      key: "District", value: `${allPerameters.districtName}`
    }, {
      key: "State", value: `${allPerameters.state}`
    }, {
      key: "Pin Code", value: `${allPerameters.pinCode}`
    }, {
      key: "Mobile NO", value: `${allPerameters.mobileNumber}`
    }, {
      key: "Email Id", value: `${allPerameters.emailId}`
    }
    , {
      key: "Year At Current Adress", value: `${allPerameters.noOfYearsInCurrentAddress}`
    }
    , {
      key: "Buisness Premises", value: `${allPerameters.businessPremises}`
    }
  ];

  drawTable3("Udyam Details", applicantDetails);
doc.addPage()
const textWidthbank = doc.widthOfString("Bank details - Applicant", { font: fontBold, size: 20 });
const centerXbank = (pageWidth - textWidthbank) / 2; // Calculate center position

doc
  .font(fontBold)
  .fontSize(11)
  .text("Bank details - Applicant", centerXbank, doc.y, { underline: true });
// function tableFunction2(tableData) {
//   // Add Table Header
//   const startX = 50; // Starting X position for the box
//   let startY = doc.y + 10; // Starting Y position for the box
//   const boxWidth = 500; // Total width of the box
//   const numFields = 7; // Now 7 fields
//   const fieldWidth = boxWidth / numFields; // Calculate width for each column

//   // Calculate the total height needed for the entire box
//   let totalHeight = 0;

//   // Calculate the height for each row and determine the total height of the box
//   tableData.forEach((row) => {
//       let rowHeight = 0;
//       const fields = ["field1", "field2", "field3", "field4", "field5", "field6", "field7"]; // Only 7 fields
//       fields.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
//           rowHeight = Math.max(rowHeight, fieldTextHeight); // Get the maximum height for the row
//       });
//       totalHeight += rowHeight; // Accumulate the total height
//   });

//   // Set normal (thin) line width
//   doc.lineWidth(0.5); // Set normal border thickness

//   // Draw the outer rectangle for the box
//   doc
//       .fillColor("#f0f0f0") // Box background color
//       .rect(startX, startY, boxWidth, totalHeight) // Total height of the box
//       .stroke("black") // Border color
//       .fill();

//   // Loop through the data and draw the text inside the box
//   tableData.forEach((row, rowIndex) => {
//       let currentX = startX; // Reset the starting X position for each row
//       let rowHeight = 0;
//       const fields = ["field1", "field2", "field3", "field4", "field5", "field6", "field7"]; // 7 fields
//       fields.forEach((field) => {
//           const fieldTextHeight = doc
//               .font('Helvetica')
//               .fontSize(7.2)
//               .heightOfString(row[field] || '', { width: fieldWidth }) + 10; // Add padding
//           rowHeight = Math.max(rowHeight, fieldTextHeight);
//       });

//       // Draw rectangles for each field in the row
//       fields.forEach((field) => {
//           doc
//               .fillColor("#f5f5f5")
//               .rect(currentX, startY, fieldWidth, rowHeight)
//               .stroke("black");

//           doc
//               .font('Helvetica')
//               .fillColor("black")
//               .fontSize(7.2);

//           // Align specific fields differently (if needed)
//           const align = field === "field3" ? "center" : "left"; // Example: Center align 'field3'

//           doc.text(row[field], currentX + 5, startY + 5, {
//               baseline: "hanging",
//               width: fieldWidth - 10,
//               align: align,
//           });

//           // Move to the next column
//           currentX += fieldWidth;
//       });

//       // Move to the next row
//       startY += rowHeight;
//   });
// }

// const requiredTable2 = [
//   { field1: "Bank Detail", field2: "Account No.",field3: "IFSC Code", field4: "Bank Name", field5: "Acc Holder Name", field6: "Branch Name", field7: "Account Type" },
//   { field1: `1`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   { field1: `2`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   { field1: `3`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   // { field1: `4`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   // { field1: `4`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   // { field1: `4`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   // { field1: `4`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },
//   // { field1: `4`, field2: ``, field3: ``, field4: ``, field5: ``, field6: ``, field7: `` },

// ];

// Call the function to create the table
// tableFunction2(requiredTable2);  
function drawTableBankDetailorg(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const Bankdetailsorg = [

    {
      key:"Account Number", value: `${allPerameters.accNo}`
    }, {
      key: "IFSC CODE", value: `${allPerameters.ifscCode}`
    }, {
      key: "Bank Name", value: `${allPerameters.bankName}`
    }, {
      key: "Account   Holder Name", value: `${allPerameters.accHolderName}`
    }, {
      key: "Branch Name", value: `${allPerameters.branchName}`
    }, {
      key: "Account Type", value: `${allPerameters.accType}`
    }
    // {
    //   key: "Village Name", value: `${allPerameters.villageName}`
    // }, {
    //   key: "Gram Panchayat", value: `${allPerameters.gramPanchayat}`
    // }, {
    //   key: "Tehsil", value: `${allPerameters.tehsil}`
    // }, {
    //   key: "District", value: `${allPerameters.district}`
    // }, {
    //   key: "State", value: `${allPerameters.state}`
    // }, {
    //   key: "East Boundary", value: `${allPerameters.eastBoundary}`
    // }, {
    //   key: "West Boundary", value: `${allPerameters.westBoundary}`
    // }, {
    //   key: "North Boundary", value: `${allPerameters.northBoundary}`
    // }
    // , {
    //   key: "South Boundary", value: `${allPerameters.southBoundary}`
    // }
    // , {
    //   key: "land Area(In Sq.ft)", value: `${allPerameters.totalLandArea}`
    // }, {
    //   key: "Full Adress Of Property", value: `${allPerameters.fullAddressOfProperty}`
    // }
  ];

  drawTableBankDetailorg("Repayment Bank details", Bankdetailsorg);

  doc.addPage()
// doc.moveDown(3)
// const textWidthbank = doc.widthOfString("Bank details - Applicant", { font: fontBold, size: 20 });
// const centerXbank = (pageWidth - textWidthbank) / 2; // Calculate center position

doc
  .font(fontBold)
  .fontSize(11)
  .text("Property Paper details", centerXbank, doc.y, { underline: true });

function drawTableBankDetail(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const Bankdetails = [

    {
      key:"Name of Document Holder", value: `${allPerameters.nameOfDocumentHolder}`
    }, {
      key: "Father Name", value: `${allPerameters.fatherName}`
    }, {
      key: "Relation With Applicant", value: `${allPerameters.relationWithApplicant}`
    }, {
      key: "House NO", value: `${allPerameters.houseNo}`
    }, {
      key: "Patwari Halka No", value: `${allPerameters.patwariHalkaNo}`
    }, {
      key: "Ward No", value: `${allPerameters.wardNo}`
    }, {
      key: "PinCode", value: `${allPerameters.pinCode}`
    }, {
      key: "Village Name", value: `${allPerameters.villageName}`
    }, {
      key: "Gram Panchayat", value: `${allPerameters.gramPanchayat}`
    }, {
      key: "Tehsil", value: `${allPerameters.tehsil}`
    }, {
      key: "District", value: `${allPerameters.district}`
    }, {
      key: "State", value: `${allPerameters.state}`
    }, {
      key: "East Boundary", value: `${allPerameters.eastBoundary}`
    }, {
      key: "West Boundary", value: `${allPerameters.westBoundary}`
    }, {
      key: "North Boundary", value: `${allPerameters.northBoundary}`
    }
    , {
      key: "South Boundary", value: `${allPerameters.southBoundary}`
    }
    , {
      key: "land Area(In Sq.ft)", value: `${allPerameters.totalLandArea}`
    }, {
      key: "Full Adress Of Property", value: `${allPerameters.fullAddressOfProperty}`
    }
  ];

  drawTableBankDetail("Property Paper details", Bankdetails);


  doc.addPage()
  // doc.moveDown(3)
  // const textWidthbank = doc.widthOfString("Bank details - Applicant", { font: fontBold, size: 20 });
  // const centerXbank = (pageWidth - textWidthbank) / 2; // Calculate center position
  
  doc
    .font(fontBold)
    .fontSize(11)
    .text("Internal Legal Report", centerXbank, doc.y, { underline: true });
  
  function drawTableBankDetail1(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const columnWidths = [250, 250]; // Key and Value columns
  
    // Draw Special Row (Header)
    const specialRowHeight = 20;
    doc.rect(startX, startY, titleWidth, specialRowHeight)
        .fill("#1E90FF")
        .strokeColor("#151B54")
        .lineWidth(1)
        .stroke();
  
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("black")
        .text(sectionTitle, startX + 5, startY + 8);
  
    startY += specialRowHeight; // Move below the header
  
    // Draw table rows dynamically
    data.forEach((row, index) => {
        // Calculate text height dynamically
        const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
        const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });
  
        const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20
  
        // Draw Key cell
        doc.rect(startX, startY, columnWidths[0], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Draw Value cell
        doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Add Key and Value text
        doc.font(font)
            .fontSize(10)
            .fillColor("#000000")
            .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
            .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });
  
        // Move Y position for next row
        startY += rowHeight;
    });
  }
  
  
    const Bankdetails1 = [
  
      {
        key:"Loan Type", value: `${allPerameters.appType}`
      }, {
        key: "Property Paper Type", value: `${allPerameters.buisnessType}`
      }, {
        key: "Legal Type", value: `${allPerameters.borrowerName}`
      }, {
        key: "Buyer Name", value: `${allPerameters.appFather}`
      }, {
        key: "Seller Name", value: `${allPerameters.appMother}`
      }, {
        key: "Seller Father Name", value: `${allPerameters.appMob1}`
      }, {
        key: "", value: ``
      }, {
        key: "Praman Patra", value: `${allPerameters.appEmail}`
      }, {
        key: "Tax Recipt", value: `${allPerameters.appEdu}`
      }, {
        key: "Signed By In Tax Recipt", value: `${allPerameters.appDOB}`
      }
      // , {
      //   key: "District", value: `${allPerameters.appGender}`
      // }, {
      //   key: "State", value: `${allPerameters.appMaritalStatus}`
      // }, {
      //   key: "East Boundary", value: `${allPerameters.appPan}`
      // }, {
      //   key: "West Boundary", value: `${allPerameters.appAdhar}`
      // }, {
      //   key: "North Boundary", value: `${allPerameters.AppVoterId}`
      // }
      // , {
      //   key: "South Boundary", value: `${allPerameters.AppVoterId}`
      // }
      // , {
      //   key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
      // }, {
      //   key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
      // }
    ];
  
    drawTableBankDetail1("Internal Legal Report", Bankdetails1);
  
    doc.addPage()
// doc.moveDown(3)
// const textWidthbank = doc.widthOfString("Bank details - Applicant", { font: fontBold, size: 20 });
// const centerXbank = (pageWidth - textWidthbank) / 2; // Calculate center position

doc
  .font(fontBold)
  .fontSize(11)
  .text("Cam details", centerXbank, doc.y, { underline: true });

// function drawTableBankDetail2(sectionTitle, data, imagePath) {
//   doc.moveDown(1);
//   const titleHeight = 20;
//   const titleX = 48;
//   const titleWidth = doc.page.width - 2 * titleX;

//   const startX = 49; // Table X position
//   let startY = doc.y + titleHeight; // Start table after title
//   const columnWidths = [250, 250]; // Key and Value columns

//   // Draw Special Row (Header)
//   const specialRowHeight = 20;
//   doc.rect(startX, startY, titleWidth, specialRowHeight)
//       .fill("#1E90FF")
//       .strokeColor("#151B54")
//       .lineWidth(1)
//       .stroke();

//   doc.font(fontBold)
//       .fontSize(10)
//       .fillColor("black")
//       .text(sectionTitle, startX + 5, startY + 8);

//   startY += specialRowHeight; // Move below the header

//   // Draw table rows dynamically
//   data.forEach((row, index) => {
//       // Calculate text height dynamically
//       const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
//       const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

//       const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

//       // Draw Key cell
//       doc.rect(startX, startY, columnWidths[0], rowHeight)
//           .strokeColor("black")
//           .lineWidth(1)
//           .stroke();

//       // Draw Value cell
//       doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
//           .strokeColor("black")
//           .lineWidth(1)
//           .stroke();

//       // Add Key and Value text
//       doc.font(font)
//           .fontSize(10)
//           .fillColor("#000000")
//           .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
//           .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

//       // Move Y position for next row
//       startY += rowHeight;
//   });
// }


//   const Bankdetails2 = [

//     {
//       key:"Name of Document Holder", value: `${allPerameters.appType}`
//     }, {
//       key: "Father Name", value: `${allPerameters.buisnessType}`
//     }, {
//       key: "Relation With Applicant", value: `${allPerameters.borrowerName}`
//     }, {
//       key: "House NO", value: `${allPerameters.appFather}`
//     }, {
//       key: "Patwari Halka No", value: `${allPerameters.appMother}`
//     }, {
//       key: "Ward No", value: `${allPerameters.appMob1}`
//     }, {
//       key: "PinCode", value: ``
//     }, {
//       key: "Village Name", value: `${allPerameters.appEmail}`
//     }, {
//       key: "Gram Panchayat", value: `${allPerameters.appEdu}`
//     }, {
//       key: "Tehsil", value: `${allPerameters.appDOB}`
//     }, {
//       key: "District", value: `${allPerameters.appGender}`
//     }, {
//       key: "State", value: `${allPerameters.appMaritalStatus}`
//     }, {
//       key: "East Boundary", value: `${allPerameters.appPan}`
//     }, {
//       key: "West Boundary", value: `${allPerameters.appAdhar}`
//     }, {
//       key: "North Boundary", value: `${allPerameters.AppVoterId}`
//     }
//     , {
//       key: "South Boundary", value: `${allPerameters.AppVoterId}`
//     }
//     , {
//       key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
//     }, {
//       key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
//     }
//   ];

  // drawTableBankDetail2("Cam", Bankdetails2);

  function tableFunction221(doc, tableData, columnHeaders) {
    const startX = 50; 
    let startY = doc.y + 10; 
    const boxWidth = 500; 
    const numFields = columnHeaders.length;  
    const fieldWidth = boxWidth / numFields; 
    const pageHeight = doc.page.height - 50; 
    const rowSpacing = 5; 
  
    doc.lineWidth(0.5);
  
    let currentX = startX;
    let rowHeight = 33; 
    doc.fillColor("#dcdcdc");
  
    columnHeaders.forEach((field) => {
        doc
            .rect(currentX, startY, fieldWidth, rowHeight)
            .stroke("black")
            .fill();
  
        doc
            .font('Helvetica-Bold')
            .fillColor("black")
            .fontSize(8)
            .text(field.toUpperCase(), currentX + 5, startY + 5, {
                width: fieldWidth - 10,
                align: "center",
            });
  
        currentX += fieldWidth;
    });
  
    startY += rowHeight + rowSpacing;
  
    tableData.forEach((row, index) => {
        let maxHeight = 0; 
  
        columnHeaders.forEach((field) => {
            const text = row[field] ? row[field].toString() : "";
            const textHeight = doc.heightOfString(text, {
                width: fieldWidth - 10,
                align: "left"
            });
            maxHeight = Math.max(maxHeight, textHeight);
        });
  
        let dynamicRowHeight = maxHeight + 10; 
  
        if (startY + dynamicRowHeight > pageHeight) {
            doc.addPage();
            startY = 50; // Reset Y position
        }
  
        let currentX = startX;
        columnHeaders.forEach((field) => {
            doc
                .fillColor("#ffffff") 
                .rect(currentX, startY, fieldWidth, dynamicRowHeight)
                .stroke("black");
  
            doc
                .font('Helvetica')
                .fillColor("black")
                .fontSize(8)
                .text(row[field] || '', currentX + 5, startY + 5, {
                    width: fieldWidth - 10,
                    align: "left",
                });
  
            currentX += fieldWidth;
        });
  
        startY += dynamicRowHeight + rowSpacing; 
    });
  }
  
  const mergedData1 = allPerameters.agri;
  
  const columnHeaders1 = [...new Set(mergedData1.flatMap(Object.keys))];
  
  
  
  const requiredTable221 = [];
  mergedData1.forEach((item) => {
      const rowData = {};
      columnHeaders1.forEach(field => {
          rowData[field] = item[field] !== undefined ? item[field].toString() : '';  
      });
      requiredTable221.push(rowData);
  });
  
  tableFunction221(doc, requiredTable221, columnHeaders1);

  //-----------------------------------------------next page---------------------------
  doc.addPage()
  doc
  .font(fontBold)
  .fontSize(11)
  .text("Property Valuation Detail", centerXbank, doc.y, { underline: true });

function drawTableBankDetail3(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const Bankdetails3 = [

    {
      key:"Property LandMark", value: `${allPerameters.propertyLandmark}`
    }, {
      key: "Latitude Of Property", value: `${allPerameters.latitude}`
    }, {
      key: "Logitude Of Property", value: `${allPerameters.longitude}`
    }, {
      key: "Type Of Property", value: `${allPerameters.propertyType}`
    },  {
      key: "Type Of Construction", value: `${allPerameters.constructionType}`
    }, {
      key: "Age Of Property", value: `${allPerameters.propertyAge}`
    }, {
      key: "Land Value", value: `${allPerameters.landValue}`
    }, {
      key: "Construction Vlaue", value: `${allPerameters.constructionValue}`
    }, {
      key: "Fair Market Value Of Land", value: `${allPerameters.fairMarketValueOfLand}`
    }, {
      key: "Realizable Value", value: `${allPerameters.realizableValue}`
    }, {
      key: "Buily UP Area(In Sq.ft)", value: `${allPerameters.totalBuiltUpArea}`
    }, {
      key: "Ltv", value: `${allPerameters.Ltv}`
    }
    // , {
    //   key: "West Boundary", value: `${allPerameters.appAdhar}`
    // }, {
    //   key: "North Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "South Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
    // }, {
    //   key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
    // }
  ];

  drawTableBankDetail3("Property Valuation Detail", Bankdetails3);

  
  doc.addPage()
  doc
  .font(fontBold)
  .fontSize(11)
  .text("Final Sanction Detail", centerXbank, doc.y, { underline: true });

function drawTableBankDetail4(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const Bankdetails4 = [

    {
      key:"Final Loan Amount", value: `${allPerameters.finalLoanAmount}`
    }, {
      key: "Loan Amount In Words", value: `${allPerameters.loanAmountInWords}`
    }, {
      key: "Rate Of Interest(ROI)", value: `${allPerameters.roi}`
    }, {
      key: "Tenure(In Months)", value: `${allPerameters.tenureInMonth}`
    }, {
      key: "EMI Amount", value: `${allPerameters.emiAmount}`
    }, {
      key: "FOIR %", value: `${allPerameters.foir}`
    }, {
      key: "LTV %", value: `${allPerameters.ltv}`
    }, {
      key: "Customer Profile", value: `${allPerameters.customerProfile}`
    }, {
      key: "Customer Segment", value: `${allPerameters.customerSegment}`
    }
    // , {
    //   key: "Fair Market Value Of Land", value: `${allPerameters.appDOB}`
    // }, {
    //   key: "Realizable Value", value: `${allPerameters.appGender}`
    // }, {
    //   key: "Buily UP Area(In Sq.ft)", value: `${allPerameters.appMaritalStatus}`
    // }, {
    //   key: "Ltv", value: `${allPerameters.appPan}`
    // }
    // , {
    //   key: "West Boundary", value: `${allPerameters.appAdhar}`
    // }, {
    //   key: "North Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "South Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
    // }, {
    //   key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
    // }
  ];

  drawTableBankDetail4("Final Sanction Detail", Bankdetails4);

  doc.addPage()
  doc
  .font(fontBold)
  .fontSize(11)
  .text("Charges Detail", centerXbank, doc.y, { underline: true });

function drawTableBankDetail5(sectionTitle, data, imagePath) {
  doc.moveDown(1);
  const titleHeight = 20;
  const titleX = 48;
  const titleWidth = doc.page.width - 2 * titleX;

  const startX = 49; // Table X position
  let startY = doc.y + titleHeight; // Start table after title
  const columnWidths = [250, 250]; // Key and Value columns

  // Draw Special Row (Header)
  const specialRowHeight = 20;
  doc.rect(startX, startY, titleWidth, specialRowHeight)
      .fill("#1E90FF")
      .strokeColor("#151B54")
      .lineWidth(1)
      .stroke();

  doc.font(fontBold)
      .fontSize(10)
      .fillColor("black")
      .text(sectionTitle, startX + 5, startY + 8);

  startY += specialRowHeight; // Move below the header

  // Draw table rows dynamically
  data.forEach((row, index) => {
      // Calculate text height dynamically
      const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
      const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });

      const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20

      // Draw Key cell
      doc.rect(startX, startY, columnWidths[0], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Draw Value cell
      doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
          .strokeColor("black")
          .lineWidth(1)
          .stroke();

      // Add Key and Value text
      doc.font(font)
          .fontSize(10)
          .fillColor("#000000")
          .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
          .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });

      // Move Y position for next row
      startY += rowHeight;
  });
}


  const Bankdetails5 = [

    {
      key:"processing Fees", value: `${allPerameters.processingFees}`
    }, {
      key: "documents Charges", value: `${allPerameters.documentsCharges}`
    }, {
      key: "insurance Charges", value: `${allPerameters.insuranceCharges}`
    }, {
      key: "cersai Charges", value: `${allPerameters.cersaiCharges}`
    }
    // , {
    //   key: "EMI Amount", value: `${allPerameters.appMother}`
    // }, {
    //   key: "FOIR %", value: `${allPerameters.appMob1}`
    // }, {
    //   key: "LTV %", value: ``
    // }, {
    //   key: "Customer Profile", value: `${allPerameters.appEmail}`
    // }, {
    //   key: "Customer Segment", value: `${allPerameters.appEdu}`
    // }
    // , {
    //   key: "Fair Market Value Of Land", value: `${allPerameters.appDOB}`
    // }, {
    //   key: "Realizable Value", value: `${allPerameters.appGender}`
    // }, {
    //   key: "Buily UP Area(In Sq.ft)", value: `${allPerameters.appMaritalStatus}`
    // }, {
    //   key: "Ltv", value: `${allPerameters.appPan}`
    // }
    // , {
    //   key: "West Boundary", value: `${allPerameters.appAdhar}`
    // }, {
    //   key: "North Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "South Boundary", value: `${allPerameters.AppVoterId}`
    // }
    // , {
    //   key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
    // }, {
    //   key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
    // }
  ];

  drawTableBankDetail5("Charges Detail", Bankdetails5);

  function drawTableBankDetail6(sectionTitle, data, imagePath) {
    doc.moveDown(1);
    const titleHeight = 20;
    const titleX = 48;
    const titleWidth = doc.page.width - 2 * titleX;
  
    const startX = 49; // Table X position
    let startY = doc.y + titleHeight; // Start table after title
    const columnWidths = [250, 250]; // Key and Value columns
  
    // Draw Special Row (Header)
    const specialRowHeight = 20;
    doc.rect(startX, startY, titleWidth, specialRowHeight)
        .fill("#1E90FF")
        .strokeColor("#151B54")
        .lineWidth(1)
        .stroke();
  
    doc.font(fontBold)
        .fontSize(10)
        .fillColor("black")
        .text(sectionTitle, startX + 5, startY + 8);
  
    startY += specialRowHeight; // Move below the header
  
    // Draw table rows dynamically
    data.forEach((row, index) => {
        // Calculate text height dynamically
        const keyHeight = doc.heightOfString(row.key, { width: columnWidths[0] - 10, align: "left" });
        const valueHeight = doc.heightOfString(row.value, { width: columnWidths[1] - 10, align: "left" });
  
        const rowHeight = Math.max(20, keyHeight, valueHeight) + 10; // Ensure minimum height of 20
  
        // Draw Key cell
        doc.rect(startX, startY, columnWidths[0], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Draw Value cell
        doc.rect(startX + columnWidths[0], startY, columnWidths[1], rowHeight)
            .strokeColor("black")
            .lineWidth(1)
            .stroke();
  
        // Add Key and Value text
        doc.font(font)
            .fontSize(10)
            .fillColor("#000000")
            .text(row.key, startX + 5, startY + 5, { align: "left", width: columnWidths[0] - 10 })
            .text(row.value, startX + columnWidths[0] + 5, startY + 5, { align: "left", width: columnWidths[1] - 10 });
  
        // Move Y position for next row
        startY += rowHeight;
    });
  }
  
  
    const Bankdetails6 = [
  
      {
        key:"Benchmark Interest Rate", value: `${allPerameters.benchmarkinterestRate}`
      }, {
        key: "Spread Interest Rate", value: `${allPerameters.SpreadInterestRate}`
      }, {
        key: "APR %", value: `${allPerameters.annualPercentageRateAprPercentage}`
      }, {
        key: "EPI (in amount)", value: `${allPerameters.epi}`
      }
      , {
        key: "EPI (in numbers)", value: `${allPerameters.noOfEpi}`
      }, 
      //   key: "FOIR %", value: `${allPerameters.appMob1}`
      // }, {
      //   key: "LTV %", value: ``
      // }, {
      //   key: "Customer Profile", value: `${allPerameters.appEmail}`
      // }, {
      //   key: "Customer Segment", value: `${allPerameters.appEdu}`
      // }
      // , {
      //   key: "Fair Market Value Of Land", value: `${allPerameters.appDOB}`
      // }, {
      //   key: "Realizable Value", value: `${allPerameters.appGender}`
      // }, {
      //   key: "Buily UP Area(In Sq.ft)", value: `${allPerameters.appMaritalStatus}`
      // }, {
      //   key: "Ltv", value: `${allPerameters.appPan}`
      // }
      // , {
      //   key: "West Boundary", value: `${allPerameters.appAdhar}`
      // }, {
      //   key: "North Boundary", value: `${allPerameters.AppVoterId}`
      // }
      // , {
      //   key: "South Boundary", value: `${allPerameters.AppVoterId}`
      // }
      // , {
      //   key: "land Area(In Sq.ft)", value: `${allPerameters.AppVoterId}`
      // }, {
      //   key: "Full Adress Of Property", value: `${allPerameters.AppVoterId}`
      // }
    ];
  
    drawTableBankDetail6("KFS Detail", Bankdetails6);
    doc.end();
  
    // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
  
    // const objData = {
    //     fileName: pdfFileUrl,
    //     file: doc.toString('base64')
    // }
    // await initESign(objData)
  
    // return new Promise((resolve, reject) => {
    //     stream.on("finish", () => {
    //       resolve(pdfFileUrl);
    //     });
    //     stream.on("error", reject);
    //   });
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  
  }
  
  async function InternalCampdf(req,res) {
    try {
        let { customerId } = req.query;

  
      // Fetch details from the database
      
      const customerDetails = await customerModel.findOne({ _id: customerId });
      const coApplicantDetails = await coApplicantModel.find({ customerId: new mongoose.Types.ObjectId(customerId) });
      const guarantorDetails = await guarantorModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const applicantDetails = await applicantModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const technicalDetails = await technicalModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const appPdcDetails = await appPdcModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const disbuDetail  = await DISBURSEMENTModel.findOne({customerId})
      const finalSanctionDetails = await finalsanctionModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const gtrPdcDetail = await gtrPdcModel.findOne({ customerId: new mongoose.Types.ObjectId(customerId) });
      const creditPdDetails = await creditPdModel.findOne({ customerId });
      const udhyamDetails = await UdhyamModel.findOne({ customerId });
      const branchUdhyam = await   branchUdhyamModel.findOne({ customerId });
      const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
      const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
      const bankKycsDEtails = await bankDeatilsKycs.findOne({ customerId });
      const Cibil = await cibilModel.findOne({  customerId })

      // const cibildata=getCibilDetailsLoanDetailsData(customerId)
      // console.log(cibildata,"cibildata")
  
  
      console.log(customerDetails,"customerDetails")
  
      const BranchNameId = customerDetails?.branch;
    
          
      const guarantorAddress =
         guarantorDetails?.[0] ? 
         [
          guarantorDetails[0].localAddress?.addressLine1,
          
        ].filter(Boolean).join(', ') : "NA";
  
        const coborroweraddress = coApplicantDetails?.[0] ? [
          coApplicantDetails[0].localAddress?.addressLine1,
          
        ].filter(Boolean).join(', ') : "NA";
  
        const address = [
          applicantDetails?.permanentAddress?.addressLine1,
          // applicantDetails?.permanentAddress?.addressLine2,
        ].filter(Boolean).join(', ');
  
        const localaddress = [
          applicantDetails?.localAddress?.addressLine1,
          // applicantDetails?.localAddress?.addressLine2,
          // applicantDetails?.localAddress?.city,
          // applicantDetails?.localAddress?.state,
          // applicantDetails?.localAddress?.district,
          // applicantDetails?.localAddress?.pinCode,
        ].filter(Boolean).join(', ');
  
        const gualocaladdress = [
  
          guarantorDetails?.localAddress?.addressLine1,
          // guarantorDetails?.localAddress?.addressLine2,
          guarantorDetails?.localAddress?.city,
          guarantorDetails?.localAddress?.state,
          guarantorDetails?.localAddress?.district,
          guarantorDetails?.localAddress?.pinCode,
        ].filter(Boolean).join(', ');
        
  
        const formatDate = (dob) => {
          if (!dob) return "NA"; // Agar DOB available nahi hai to "NA" return kare
          const date = new Date(dob); // Date object me convert kare
          const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
          const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
          return `${day}-${month}-${year}`; // Final format
      };


      const formatDate1 = (dateString) => {
        if (!dateString) return "NA"; 
        
        // Convert "T07:24:43 PM" to "T19:24:43" (24-hour format)
        let correctedDateString = dateString.replace(
            /(\d{2}):(\d{2}):(\d{2}) (\w{2})/,
            (match, hh, mm, ss, ampm) => {
                let hours = parseInt(hh, 10);
                if (ampm.toLowerCase() === "pm" && hours !== 12) hours += 12;
                if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
                return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
            }
        );
    
        // Parse corrected date
        const date = new Date(correctedDateString);
        if (isNaN(date)) return "Invalid Date";
    
        const day = String(date.getDate()).padStart(2, '0'); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
    };
    
  
        const formatAadhaar = (aadhaarNo) => {
          if (!aadhaarNo || aadhaarNo.length !== 12) {
            return "Invalid Aadhaar";
          }
          return "XXXXXXXX" + aadhaarNo.slice(-4);
        };
  
  
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

        //------------------------------------------get pd api start---------------

        const processData = await processModel.findOne({ customerId }).lean();
 const loginDate = processData?.salesCompleteDate || "";
 // Fetch cibilDate from cibilModel
 const cibilData = await cibilModel.findOne({ customerId }).lean();
 
 let cibilDate = null;
 if (cibilData && cibilData.applicantFetchHistory && cibilData.applicantFetchHistory.length > 0) {
 const lastFetch = cibilData.applicantFetchHistory[cibilData.applicantFetchHistory.length - 1];
 cibilDate = lastFetch.fetchDate || "";
}
// Fetch pdDate from externalManagerModel
const vendorData = await externalManagerModel.findOne({ customerId }).lean();
const pdDate = vendorData?.creditPdCompleteDate || null;
const employeeData = await employeeModel.findById(vendorData?.creditPdId);
const designationDetail = await designationModel.findById(employeeData?.designationId)
const customerBranch = await newBranchModel.findById(employeeData?.branchId).select('name');
const formattedDate = moment(customerDetails?.createdAt).format('YYYY-MM-DDTHH:mm:ss A');
   

const cibilDetail = await cibilModel.findOne({ customerId: customerId })
.select("applicantCibilDetail coApplicantData")
.lean();

//----------------------------pd api end here-----------------------------------

//-------------------------------cibil api start here----------------------------------------
const ownershipMap = {
  '1': 'INDIVIDUAL',
  '2': 'AUTHORISED USER',
  '3': 'GUARANTOR',
  '4': 'JOINT',
  '5': 'DECEASED'
};

const accountTypeMap = {
  '01': 'Auto Loan (Personal)',
  '02': 'HOUSING LOAN',
  '03': 'PROPERTY LOAN',
  '04': 'LOAN AGAINST SHARES/SECURITIES',
  '05': 'PERSONAL LOAN',
  '06': 'CONSUMER LOAN',
  '07': 'GOLD LOAN',
  '08': 'EDUCATION LOAN',
  '09': 'LOAN TO PROFESSIONAL',
  '10': 'CREDIT CARD',
  '11': 'LEASING',
  '12': 'OVERDRAFT',
  '13': 'TWO-WHEELER LOAN',
  '14': 'NON-FUNDED CREDIT FACILITY',
  '15': 'LOAN AGAINST BANK DEPOSITS',
  '16': 'FLEET CARD',
  '17': 'COMMERCIAL VEHICLE LOAN',
  '18': 'TELCO – WIRELESS',
  '19': 'TELCO – BROADBAND',
  '20': 'TELCO – LANDLINE',
  '21': 'SELLER FINANCING',
  '22': 'SELLER FINANCING SOFT',
  '23': 'GECL LOAN SECURED',
  '24': 'GECL LOAN UNSECURED',
  '31': 'SECURED CREDIT CARD',
  '32': 'USED CAR LOAN',
  '33': 'CONSTRUCTION EQUIPMENT LOAN',
  '34': 'TRACTOR LOAN',
  '35': 'CORPORATE CREDIT CARD',
  '36': 'KISAN CREDIT CARD',
  '37': 'LOAN ON CREDIT CARD',
  '38': 'PRIME MINISTER JAAN DHAN YOJANA - OVERDRAFT',
  '39': 'MUDRA LOANS – SHISHU / KISHOR / TARUN',
  '40': 'MICROFINANCE – BUSINESS LOAN',
  '41': 'MICROFINANCE – PERSONAL LOAN',
  '42': 'MICROFINANCE – HOUSING LOAN',
  '43': 'MICROFINANCE – OTHER',
  '44': 'PRADHAN MANTRI AWAS YOJANA - CREDIT LINK SUBSIDY SCHEME MAY CLSS',
  '50': 'BUSINESS LOAN – SECURED',
  '51': 'BUSINESS LOAN – GENERAL',
  '52': 'BUSINESS LOAN – PRIORITY SECTOR – SMALL BUSINESS'
};



function mapCreditData(data) {
  return data?.map(item => ({
    index: item.index || "",
    loanType: accountTypeMap[item.accountType] || '',
    ownership: ownershipMap[item.ownershipIndicator] || '',
    loanAmount: item.highCreditAmount || 0,
    currentOutstanding: item.currentBalance || 0,
    monthlyEMI: item.emiAmount || 0,
    loanStatus: item.loanStatus || "",
    obligated: item.obligated || "",
    actionStatus: item.actionStatus || "active",
    obligationConsidered: ["yes", "YES", "Yes"].includes(item.obligated) ? item.emiAmount : 0
  })) || [];
}

// const applicantActiveLoanDetail = cibilDetail?.applicantCibilDetail[0]?.creditData[0]?.accounts || [];
const applicantActiveLoanDetail = 
    Array.isArray(cibilDetail?.applicantCibilDetail) && cibilDetail?.applicantCibilDetail.length > 0 &&
    Array.isArray(cibilDetail?.applicantCibilDetail[0]?.creditData) && cibilDetail?.applicantCibilDetail[0]?.creditData.length > 0
    ? cibilDetail.applicantCibilDetail[0].creditData[0].accounts 
    : [];




const coApplicantDetailsByID = [];
// const coapplicantActiveLoanDetail = 
//     Array.isArray(cibilDetail?.applicantCibilDetail) && cibilDetail?.applicantCibilDetail.length > 0 &&
//     Array.isArray(cibilDetail?.applicantCibilDetail[0]?.creditData) && cibilDetail?.applicantCibilDetail[0]?.creditData.length > 0
//     ? cibilDetail.applicantCibilDetail[0].creditData[0].accounts 
//     : [];

if (cibilDetail.coApplicantData && cibilDetail.coApplicantData.length > 0) {
  cibilDetail.coApplicantData.forEach(coApplicant => {
    if (coApplicant._id && coApplicant.coApplicantCibilDetail && coApplicant.coApplicantCibilDetail.length > 0) {
      // Map the accounts for this co-applicant
      const accounts = coApplicant.coApplicantCibilDetail.flatMap(detail => {
        return mapCreditData(detail?.creditData[0]?.accounts || []);
      });

      if (accounts.length > 0) {
        coApplicantDetailsByID.push({
          // _id: coApplicant._id,
          // accounts: accounts
           accounts
        });
      }
    }
  });
}

console.log("responseData///----------",mapCreditData(applicantActiveLoanDetail))
console.log("coApplicantDetailsByID----///----------",coApplicantDetailsByID)

// const coApplicantAccounts= coApplicantDetailsByID?.coApplicantDetail?.flatMap(item => item.accounts) || [] 
// console.log(coApplicantAccounts,"coApplicantAccounts")

// const cibilFetch = {
//   ...mapCreditData(applicantActiveLoanDetail), // Spread function result
//   ...accounts // Spread object directly
// };

const coApplicantDetailsFlattened = coApplicantDetailsByID.map(item => ({
  ...item, 
  accounts: item.accounts.map(account => ({ ...account })) // Spread to extract inner objects
}))[0]; // Since coApplicantDetailsByID is an array, taking the first object

const cibilFetch = {
  ...mapCreditData(applicantActiveLoanDetail),
  ...coApplicantDetailsFlattened
};

console.log("cibilFetching",cibilFetch);

const mergedData = Object.values(cibilFetch).flat();
console.log("mergedData",mergedData);
// console.log("mergedData",);



//customer data 
const product =customerDetails?.productId;
const productDataa = await productModel.findById({_id:product});
         
          const productName = productDataa?.productName; 

//customer Branch detail
const Branch =customerDetails?.branch;
const branchData = await newBranchModel.findById({_id:Branch});
         
          const branchName = branchData?.city; 

          //customer employee name

const employee=customerDetails?.employeId;
const employeeDataa = await employeeModel.findById({_id:employee});
         
          const employeeName = employeeDataa?.employeName; 


          //partner
          const lender = finalsanctionDetails?.partnerId
          console.log()
          const partner= await lenderModel.findById({_id:lender});
          const partnerNames = partner?.fullName
          console.log("partnerNames",partnerNames)

          const isGrowMoney =  partnerNames === "grow money capital pvt ltd"
          
      
          // Data filtering
          const filteredData = isGrowMoney
            ? {
                agricultureIncome: finalsanctionDetails?.agricultureIncome,
                milkIncomeCalculation: finalsanctionDetails?.milkIncomeCalculation,
                otherIncomeCalculation: finalsanctionDetails?.otherIncomeCalculation,
                totalIncomeMonthlyCalculation: finalsanctionDetails?.totalIncomeMonthlyCalculation,
              }
            : {
                agricultureRatnaIncome: finalsanctionDetails?.agricultureRatnaIncome.details,
                milkRatnaIncomeCalculation: finalsanctionDetails?.milkRatnaIncomeCalculation,
                otherBusinessIncomeCalculation: finalsanctionDetails?.otherBusinessIncomeCalculation,
              };

              console.log("filteredData",JSON.stringify(filteredData, null, 2))
//fetched civil app employee
              fetchedegau =Cibil?.guarantorFetchHistory?.length ? Cibil.guarantorFetchHistory.slice(-1)[0].cibilEmployeeId:"";
              const applicantgau = await employeeModel.findById({_id:fetchedegau});
         
          const appfetgau = applicantgau?.employeName; 


          //fetched civil gau employee
          fetchedeapp =Cibil?.applicantFetchHistory?.length ? Cibil.applicantFetchHistory.slice(-1)[0].cibilEmployeeId:"";
          const applicantcibil = await employeeModel?.findById({_id:fetchedeapp});
     
      const appfetched = applicantcibil?.employeName; 

      //fetched civil co3 employee
      fetchedecoapp =Cibil?.coApplicantData?.[0]?.coApplicantFetchHistory?.length ? Cibil?.coApplicantData?.[0]?.coApplicantFetchHistory.slice(-1)[0].cibilEmployeeId: "";
      const coapplicantcibil = await employeeModel?.findById({_id:fetchedecoapp});
 
  const coappfetched = coapplicantcibil?.employeName; 

  //fetched civil co2 employee
//   fetchedecoapp2 =Cibil?.coApplicantData?.[2]?.coApplicantFetchHistory?.length ? Cibil?.coApplicantData?.[2]?.coApplicantFetchHistory.slice(-1)[0].cibilEmployeeId: "";
//   const coapplicantcibil2 = await employeeModel?.findById({_id:fetchedecoapp2});

// const coappfetched2 = coapplicantcibil2?.employeName; 

const fetchedecoapp2 = Cibil?.coApplicantData?.[2]?.coApplicantFetchHistory?.length 
    ? Cibil.coApplicantData[2].coApplicantFetchHistory.slice(-1)[0].cibilEmployeeId 
    : null;  // "" ki jagah null use karein, taki `findById()` me error na aaye

const coapplicantcibil2 = fetchedecoapp2 ? await employeeModel.findById(fetchedecoapp2) : null; 

const coappfetched2 = coapplicantcibil2?.employeName || "";  // Agar undefined ho to default "NA" return kare


//fetched civil co1 employee
const fetchedecoapp1 = Cibil?.coApplicantData?.[1]?.coApplicantFetchHistory?.length 
    ? Cibil.coApplicantData[1].coApplicantFetchHistory.slice(-1)[0].cibilEmployeeId 
    : null;  // "" ki jagah null use karein, taki `findById()` me error na aaye

const coapplicantcibil1 = fetchedecoapp1 ? await employeeModel.findById(fetchedecoapp1) : null; 

const coappfetched1 = coapplicantcibil1?.employeName || "";  // Agar undefined ho to default "NA" return kare






          const fetcheddate =Cibil?.applicantFetchHistory?.length ? Cibil.applicantFetchHistory.slice(-1)[0].fetchDate: ""

//           agridata=finalsanctionDetails?.agricultureIncomeNew?.details;
//           console.log("agridata",agridata)
              
// // agricultureconstmergedData = Object.values(agridata).flat();
// const agricultureconstmergedData = agridata.map(({ _id, ...rest }) => rest);

let transformedDatad = []; // Global scope me define karein

const agridata = finalsanctionDetails?.agricultureIncomeNew?.details;

if (Array.isArray(agridata)) {
  transformedDatad = agridata.map((item) => {
    const plainItem = item.toObject ? item.toObject() : item;
    const { _id, ...rest } = plainItem;
    return rest;
  });
}

// const mergedObject = Object.assign({}, ...transformedDatad);
// const transformedData = {};
// transformedDatad.forEach((item, index) => {
//   transformedData[`${index + 1}`] = item;
// });

// console.log("mergedObject",mergedObject);


console.log("transformedData",transformedDatad); // Global variable me stored data ko access karein

          
// --------------------------cibil api end here-----------------------------
// Prepare parameters
      const allParameters = {
        agri:transformedDatad||"",
        mergedData:mergedData||"",

        fetchDate1:formatDate1(fetcheddate),
              cibilEmployee1:appfetched||"",
        applicantCibilScore:Cibil?.applicantCibilScore||"",

        fetchDate2:formatDate1(Cibil?.coApplicantData?.[0]?.coApplicantFetchHistory?.length ? Cibil?.coApplicantData?.[0]?.coApplicantFetchHistory.slice(-1)[0].fetchDate: ""),
        cibilEmployee2:coappfetched,
        coApplicantCibilScore1:Cibil?.coApplicantData?.[0]?.coApplicantCibilScore||"",

        fetchDate3:formatDate1(Cibil?.coApplicantData?.[1]?.coApplicantFetchHistory?.length ? Cibil?.coApplicantData?.[1]?.coApplicantFetchHistory.slice(-1)[0].fetchDate: ""),
        cibilEmployee3:coappfetched1,
        coApplicantCibilScore2:Cibil?.coApplicantData?.[1]?.coApplicantCibilScore||"",

        fetchDate4:formatDate1(Cibil?.coApplicantData?.[2]?.coApplicantFetchHistory?.length ? Cibil?.coApplicantData?.[2]?.coApplicantFetchHistory.slice(-1)[0].fetchDate: ""),
        cibilEmployee4:coappfetched2,
        coApplicantCibilScore3:Cibil?.coApplicantData?.[2]?.coApplicantCibilScore||"",

        fetchDate5:formatDate1(Cibil?.guarantorFetchHistory?.length ? Cibil.guarantorFetchHistory.slice(-1)[0].fetchDate: ""),
        cibilEmployee5:appfetgau,
        guarantorCibilScore:Cibil?.guarantorCibilScore||"",

        Product:productName||"",
        salesPerson:employeeName||"",
        Branch:branchName||"",
        loanAmount:        customerDetails?.loanAmount||"",
        roi:                customerDetails?.roi||"",
        tenure:             customerDetails?.tenure||"",
        emi:               customerDetails?.customerFinId||"",
        //pd data
        customerFinId: customerDetails?.customerFinId||"",

        createDate:formattedDate||"",      
        loginDate:loginDate||"",
        cibilDate:cibilDate||"",
        pdDate: pdDate||"",
       designation:designationDetail?.name || '',
       employeeCode:employeeData?.employeUniqueId || '',
       branchName:customerBranch?.name.toUpperCase() || '',
       pdDoneBy :employeeData?.employeName.toUpperCase() || '',
        //samgra id  family  
        samagraId1 :creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.samagraId || "",//page no.1
        aadhaarStatus1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.aadhaarStatus || "",
        memberName1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.memberName || "",
        age1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.age || "",
        gender1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.gender || "",
        registrationAuthority1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.registrationAuthority || "",
        registrationDate1:creditPdDetails?.samagraIdDetail?.familyMembers?.[0]?.registrationDate || "",

        samagraId2 :creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.samagraId || "",//page no.1
        aadhaarStatus2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.aadhaarStatus || "",
        memberName2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.memberName || "",
        age2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.age || "",
        gender2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.gender || "",
        registrationAuthority2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.registrationAuthority || "",
        registrationDate2:creditPdDetails?.samagraIdDetail?.familyMembers?.[1]?.registrationDate || "",

        samagraId3 :creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.samagraId || "",//page no.1
        aadhaarStatus3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.aadhaarStatus || "",
        memberName3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.memberName || "",
        age3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.age || "",
        gender3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.gender || "",
        registrationAuthority3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.registrationAuthority || "",
        registrationDate3:creditPdDetails?.samagraIdDetail?.familyMembers?.[2]?.registrationDate || "",

        samagraId4 :creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.samagraId || "",//page no.1
        aadhaarStatus4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.aadhaarStatus || "",
        memberName4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.memberName || "",
        age4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.age || "",
        gender4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.gender || "",
        registrationAuthority4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.registrationAuthority || "",
        registrationDate4:creditPdDetails?.samagraIdDetail?.familyMembers?.[3]?.registrationDate || "",

        samagraId5 :creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.samagraId || "",//page no.1
        aadhaarStatus5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.aadhaarStatus || "",
        memberName5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.memberName || "",
        age5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.age || "",
        gender5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.gender || "",
        registrationAuthority5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.registrationAuthority || "",
        registrationDate5:creditPdDetails?.samagraIdDetail?.familyMembers?.[4]?.registrationDate || "",

        samagraId6 :creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.samagraId || "",//page no.1
        aadhaarStatus6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.aadhaarStatus || "",
        memberName6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.memberName || "",
        age6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.age || "",
        gender6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.gender || "",
        registrationAuthority6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.registrationAuthority || "",
        registrationDate6:creditPdDetails?.samagraIdDetail?.familyMembers?.[5]?.registrationDate || "",

        samagraId7 :creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.samagraId || "",//page no.1
        aadhaarStatus7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.aadhaarStatus || "",
        memberName7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.memberName || "",
        age7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.age || "",
        gender7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.gender || "",
        registrationAuthority7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.registrationAuthority || "",
        registrationDate7:creditPdDetails?.samagraIdDetail?.familyMembers?.[6]?.registrationDate || "",

        samagraId8 :creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.samagraId || "",//page no.1
        aadhaarStatus8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.aadhaarStatus || "",
        memberName8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.memberName || "",
        age8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.age || "",
        gender8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.gender || "",
        registrationAuthority8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.registrationAuthority || "",
        registrationDate8:creditPdDetails?.samagraIdDetail?.familyMembers?.[7]?.registrationDate || "",


        //rasan family
        memberName:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[0]?.memberName || "":"",
        relationship:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[0]?.relationship || "":"",
        age:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[0]?.age || "":"",
        dob:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[0]?.dob || "":"",

        memberName1:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[1]?.memberName || "":"",
        relationship1:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[1]?.relationship || "":"",
        age1:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[1]?.age || "":"",
        dob1:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[1]?.dob || "":"",


        memberName2:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[2]?.memberName || "":"",
        relationship2:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[2]?.relationship || "":"",
        age2:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[2]?.age || "":"",
        dob2:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[2]?.dob || "":"",


        memberName3:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[3]?.memberName || "":"",
        relationship3:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[3]?.relationship || "":"",
        age3:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[3]?.age || "":"",
        dob3:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[3]?.dob || "":"",



        memberName4:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[4]?.memberName || "":"",
        relationship4:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[4]?.relationship || "":"",
        age4:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[4]?.age || "":"",
        dob4:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[4]?.dob || "":"",



        memberName5:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[5]?.memberName || "":"",
        relationship5:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[5]?.relationship || "":"",
        age5:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[5]?.age || "":"",
        dob5:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[5]?.dob || "":"",



        memberName6:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[6]?.memberName || "":"",
        relationship6:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[6]?.relationship || "":"",
        age6:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[6]?.age || "":"",
        dob6:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[6]?.dob || "":"",


        memberName7:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[7]?.memberName || "":"",
        relationship7:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[7]?.relationship || "":"",
        age7:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[7]?.age || "":"",
        dob7:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.familyMembers?.[7]?.dob || "":"",

        nameOfDocumentHolder: technicalDetails?.totalLandArea || "NA",
  fatherName: technicalDetails?.fatherName || "NA",
  relationWithApplicant: technicalDetails?.relationWithApplicant || "NA",
  houseNo: technicalDetails?.houseNo || "NA",
  surveyNo: technicalDetails?.surveyNo || "NA",
  patwariHalkaNo: technicalDetails?.patwariHalkaNo || "NA",
  wardNo: technicalDetails?.wardNo || "NA",
  villageName: technicalDetails?.villageName || "NA",
  gramPanchayat: technicalDetails?.gramPanchayat || "NA",
  tehsil: technicalDetails?.tehsil || "NA",
  district: technicalDetails?.district || "NA",
  state: technicalDetails?.state || "NA",
  pinCode: technicalDetails?.pinCode || "NA",
  fullAddressOfProperty: technicalDetails?.fullAddressOfProperty || "NA",
  eastBoundary: technicalDetails?.eastBoundary || "NA",
  westBoundary: technicalDetails?.westBoundary || "NA",
  northBoundary: technicalDetails?.northBoundary || "NA",
  southBoundary: technicalDetails?.southBoundary || "NA",
  valuationDoneBy: technicalDetails?.valuationDoneBy || "NA",
  developmentPercentage: technicalDetails?.developmentPercentage || "NA",
  remarkByApproval: technicalDetails?.remarkByApproval || "NA",
  Ltv: technicalDetails?.Ltv || "NA",
  distanceOfMap: technicalDetails?.distanceOfMap || "NA",
  propertyLandmark: technicalDetails?.propertyLandmark || "NA",
  latitude: technicalDetails?.latitude || "NA",
  longitude: technicalDetails?.longitude || "NA",
  propertyType: technicalDetails?.propertyType || "NA",
  totalLandArea: technicalDetails?.totalLandArea || "NA",
  totalBuiltUpArea: technicalDetails?.totalBuiltUpArea || "NA",
  constructionType: technicalDetails?.constructionType || "NA",
  constructionQuality: technicalDetails?.constructionQuality || "NA",
  propertyAge: technicalDetails?.propertyAge || "NA",
  landValue: technicalDetails?.landValue || "NA",
  constructionValue: technicalDetails?.constructionValue || "NA",
  fairMarketValueOfLand: technicalDetails?.fairMarketValueOfLand || "NA",
  realizableValue: technicalDetails?.realizableValue || "NA",

  //disbus Kfs Details
  processingFees: disbuDetail?.kfsDetails?.processingFees || "NA",
  documentsCharges:disbuDetail?.kfsDetails?.documentsCharges || "NA",
  insuranceCharges:disbuDetail?.kfsDetails?.insuranceCharges || "NA",
  cersaiCharges:disbuDetail?.kfsDetails?.cersaiCharges || "NA",
  preEmiInterest: disbuDetail?.kfsDetails?.preEmiInterest || "NA",
  benchmarkinterestRate: disbuDetail?.kfsDetails?.benchmarkinterestRate || "NA",
  SpreadInterestRate: disbuDetail?.kfsDetails?.SpreadInterestRate || "NA",
  annualPercentageRateAprPercentage: disbuDetail?.kfsDetails?.annualPercentageRateAprPercentage || "NA",
  epi:disbuDetail?.kfsDetails?.epi || "NA",
  noOfEpi:disbuDetail?.kfsDetails?.noOfEpi || "NA",

  // Udyam details  branchUdhyam

  udhyamRegistrationNo:    branchUdhyam?.udhyamRegistrationNo || "NA",
  OrganisationName:        branchUdhyam?.OrganisationName || "NA",
  typeOfOrganisation:      branchUdhyam?.typeOfOrganisation || "NA",
  natureOfBusiness:        branchUdhyam?.natureOfBusiness || "NA",
  MsmeClassification:      branchUdhyam?.MsmeClassification || "NA",
  dateOfIncorporation:     branchUdhyam?.dateOfIncorporation || "NA",

  fullAddress:     branchUdhyam?.AddressOfFirm?.fullAddress || "NA",
      landmark:     branchUdhyam?.AddressOfFirm?.landmark || "NA",
      city:     branchUdhyam?.AddressOfFirm?.city || "NA",
      districtName:     branchUdhyam?.AddressOfFirm?.districtName || "NA",
      state:     branchUdhyam?.AddressOfFirm?.state || "NA",
      country:     branchUdhyam?.AddressOfFirm?.country || "NA",
      pinCode:     branchUdhyam?.AddressOfFirm?.pinCode || "NA",
      mobileNumber:     branchUdhyam?.AddressOfFirm?.mobileNumber || "NA",
      emailId:     branchUdhyam?.AddressOfFirm?.emailId || "NA",
      noOfYearsInCurrentAddress:     branchUdhyam?.AddressOfFirm?.noOfYearsInCurrentAddress || "NA",
      businessPremises:     branchUdhyam?.AddressOfFirm?.businessPremises || "NA",

      //final sanction finalsanctionDetails

      foir: finalsanctionDetails?.foir || "NA",
      ltv: finalsanctionDetails?.ltv || "NA",
      customerProfile: finalsanctionDetails?.customerProfile || "NA",
      customerSegment: finalsanctionDetails?.customerSegment || "NA",
      // applicantName: finalsanctionDetails?.applicantName || "NA",
      // fatherName: finalsanctionDetails?.fatherName || "NA",
      // contact: finalsanctionDetails?.contact || "NA",
      finalLoanAmount: finalsanctionDetails?.finalLoanAmount || "NA",
      loanAmountInWords: finalsanctionDetails?.loanAmountInWords || "NA",
      tenureInWords: finalsanctionDetails?.tenureInWords || "NA",
      tenureInMonth: finalsanctionDetails?.tenureInMonth || "NA",
      roi: finalsanctionDetails?.roi || "NA",
      emiAmount: finalsanctionDetails?.emiAmount || "NA",

  //        allPerameterss = Array.isArray(creditPdData?.rasanCardDetail?.familyMembers) 
  // ? creditPdData.rasanCardDetail.familyMembers 
  // : [],
  // familydata:JSON.parse(JSON.stringify(creditPdDetails?.rasanCardDetail?.familyMembers || [])),


       

        // partnerbranchName:branchData?.city||"NA",
        date:formatDate(sanctionPendencyDetails?.sanctionDate) || "NA",
        date1:customerDetails.createdAt
        ? `${customerDetails.createdAt.getDate()}-${customerDetails.createdAt.getMonth() + 1}-${customerDetails.createdAt.getFullYear()}`: "NA",
          customerNO:sanctionPendencyDetails?.partnerCustomerId|| "NA",
  
  
  
        loacalAdharAdress:applicantDetails?.localAddress?.addressLine1||"NA",
          localDistrict:applicantDetails?.localAddress?.district||"NA",
          localCity:applicantDetails?.localAddress?.city||"NA",
          loacalState:applicantDetails?.localAddress?.state||"NA",
          localPin:applicantDetails?.localAddress?.pinCode||"NA",
  
        pENDENCYlOANnumber:disbuDetail?.preDisbursementForm?.loanNumber || "NA",//page no.1
        sanctionpendencyDate:formatDate(sanctionPendencyDetails?.sanctionDate) || "NA",
        loanAmountRequested: finalSanctionDetails?.finalLoanAmount|| "NA",
                    tenure: finalSanctionDetails?.tenureInMonth||"NA",
                    sourceType : "NA",
                    loanPurpose:finalSanctionDetails?.EndUseOfLoan || "NA",
                    loanType: "Secured",//page no.1
        
                // applicant details udhyamDetails
                appType : creditPdDetails?.applicant?.applicantType || "NA",//page no.1
                buisnessType : creditPdDetails?.applicant?.businessType || "NA",//page no.1
                borrowerName : applicantDetails?.fullName || "NA",//page no.1
                appFather : applicantDetails?.fatherName || "NA",//page no.1
                appMother : applicantDetails?.motherName || "NA",//page no.1
                appMob1 : applicantDetails?.mobileNo || "NA",//page no.1
                appMob2 : applicantDetails?.mobileNo || "NA",//page no.1
                appEmail : applicantDetails?.email || "NA",//page no.1
                appEdu : applicantDetails?.education || "NA",//page no.1
                appDOB : formatDate(applicantDetails?.dob) || "NA",
                appGender : applicantDetails?.gender || "NA",//page no.1
                appMaritalStatus : applicantDetails?.maritalStatus || "NA",//page no.1
                appPan : applicantDetails?.panNo || "NA",//page no.1
                appAdhar : applicantDetails?.aadharNo?formatAadhaar(applicantDetails.aadharNo):"NA",//page no.1
                AppVoterId : applicantDetails?.voterIdNo || "NA",//page no.1
                appReligion:applicantDetails?.religion || "NA",
                // appNationality:creditPdDetails?.applicant?.nationality || "NA",
                appNationality: "Indian",
  
                appCategory:applicantDetails?.category || "NA",
                appNoOfDependentd:creditPdDetails?.applicant?.noOfDependentWithCustomer || "NA",
                appUshyamAdharNumber:branchUdhyam?.udhyamRegistrationNo || "NA",
        
        
        
                //   communicationAddress
                appadharadress : applicantDetails?.localAddress?.addressLine1||"NA",
                appCityName :applicantDetails?.localAddress?.city||"NA",
                appdistrict :applicantDetails?.localAddress?.district||"NA",
                AppPin : applicantDetails?.localAddress?.pinCode||"NA",
                AppState :applicantDetails?.localAddress?.state||"NA",
                AppYearsAtCureentAdress : creditPdDetails?.applicant?.noOfyearsAtCurrentAddress || "NA",
                appLandmark: creditPdDetails?.applicant?.houseLandMark || "NA",
                appCountry:"India",
                appResidence:creditPdDetails?.applicant?.residenceType || "NA",
                appPRESentAdress:applicantDetails?.localAddress?.addressLine1||"NA",
        
                //employeement buisness details udhyamDetails
                appudhyam: branchUdhyam?.udhyamRegistrationNo || "NA",
                occupation:creditPdDetails?.applicant?.occupation || "NA",
                monthlyIncome: "NA",
                isSelfEmployed:"NA",
                otherIncome:"NA",
                firstName:branchUdhyam?.OrganisationName || "NA",
                firmType:branchUdhyam?.typeOfOrganisation || "NA",
                // natureBuisness:otherBuisnessData?.natureOfBuisness || "NA",
                natureBuisness: branchUdhyam?.natureOfBusiness ||"NA",
  
                msmeClassification:branchUdhyam?.MsmeClassification||"NA",
  
                //registered entity
                entityAdress: branchUdhyam?.AddressOfFirm?.fullAddress || "NA",
                entityLandmark: branchUdhyam?.AddressOfFirm?.landmark  || "NA",
                entityCityTown:branchUdhyam?.AddressOfFirm?.city || "NA",
                entityDistrict:branchUdhyam?.AddressOfFirm?.districtName || "NA",
                entityState:branchUdhyam?.AddressOfFirm?.state || "NA",
                entityCountry:branchUdhyam?.AddressOfFirm?.country || "NA",
                entitypin:branchUdhyam?.AddressOfFirm?.pinCode || "NA",
                entityMobile:branchUdhyam?.AddressOfFirm?.mobileNumber || "NA",
                entityemail:branchUdhyam?.AddressOfFirm?.emailId || "NA",
                //coApplicant details
                coAppType : creditPdDetails?.co_Applicant?.[0]?.coApplicantType || "NA",
                coAppbuiType:creditPdDetails?.co_Applicant?.[0]?.businessType || "NA",
        
                coAppName : coApplicantDetails?.[0]?.fullName || "NA",//page no.1
                coRelWithApp : coApplicantDetails?.[0]?.relationWithApplicant || "NA",//page no.1
                coAppFather : coApplicantDetails?.[0]?.fatherName || "NA",//page no.1
                coAppMother : coApplicantDetails?.[0]?.motherName || "NA",//page no.1
                coAppMob1 : coApplicantDetails?.[0]?.mobileNo || "NA",//page no.1
                corelwithApp:coApplicantDetails?.[0]?.relationWithApplicant || "NA",
        
                // appMob2 : coApplicantDetails?.mobileNo || "NA",//page no.1
                coAppEmail : coApplicantDetails?.[0]?.email || "NA",//page no.1
                coAppEdu : coApplicantDetails?.[0]?.education || "NA",//page no.1
                coAPPDob : formatDate(coApplicantDetails?.[0]?.dob) || "NA",//page no.1
                coAppGender : coApplicantDetails?.[0]?.gender || "NA",//page no.1
                coAppMarritalStatus : coApplicantDetails?.[0]?.maritalStatus || "NA",//page no.1
                coAppPan : coApplicantDetails?.[0]?.docType === 'panCard' ? coApplicantDetails?.[0]?.docNo || '':'NA',
                coAPPAdhar : coApplicantDetails?.[0]?.aadharNo ?formatAadhaar(coApplicantDetails[0].aadharNo):"NA",//page no.1
                coAppvoterId :coApplicantDetails?.[0]?.docType === 'voterId' ? coApplicantDetails?.[0]?.docNo || '':'NA',
                coAppreligion:coApplicantDetails?.[0]?.religion || "NA",
                // coAppNationality:creditPdDetails?.co_Applicant?.[0]?.nationality || "NA",
                coAppNationality: "Indian",
  
                coAppCategory:coApplicantDetails?.[0]?.category || "NA",
                coAppNoOfDependentd:"NA",
                coAppUdhyamAaadharNo:"NA",
        
                //   communicationAddress
                coAppAdharAdress : coborroweraddress || "NA",
                coAppcity : coApplicantDetails?.[0]?.localAddress?.city|| "NA",
                coAppdistrict : coApplicantDetails?.[0]?.localAddress?.district|| "NA",
                coAppPIN : coApplicantDetails?.[0]?.localAddress?.pinCode|| "NA",
                coAppState : coApplicantDetails?.[0]?.localAddress?.state|| "NA",
                coAppcurentAdress :creditPdDetails?.co_Applicant?.[0]?.noOfyearsAtCurrentAddress || "NA",
                coappLandMark:creditPdDetails?.co_Applicant?.[0]?.houseLandMark || "NA",
                coAppCountry:"India",
                coResidence:creditPdDetails?.co_Applicant?.[0]?.residenceType || "NA",
  
                coAppNoOfYearsATCurrentAddress:creditPdDetails?.co_Applicant?.[0]?.noOfyearsAtCurrentAddress || "NA",
        
                 //coApplicant details 2
                 coAppType2 : creditPdDetails?.co_Applicant?.[1]?.coApplicantType || "NA",
                 coAppbuiType2:creditPdDetails?.co_Applicant?.[1]?.businessType || "NA",
        
         
                 coAppName2 : coApplicantDetails?.[1]?.fullName || "NA",//page no.1
                 coRelWithApp2 : coApplicantDetails?.[1]?.relationWithApplicant || "NA",//page no.1
                 coAppFather2 : coApplicantDetails?.[1]?.fatherName || "NA",//page no.1
                 coAppMother2 : coApplicantDetails?.[1]?.motherName || "NA",//page no.1
                 coAppMob12 : coApplicantDetails?.[1]?.mobileNo || "NA",//page no.1
                 corelwithApp2:coApplicantDetails?.[1]?.relationWithApplicant || "NA",
         
                 // appMob2 : coApplicantDetails?.mobileNo || "NA",//page no.1
                 coAppEmail2 : coApplicantDetails?.[1]?.email || "NA",//page no.1
                 coAppEdu2 : coApplicantDetails?.[1]?.education || "NA",//page no.1
                 coAPPDob2 : formatDate(coApplicantDetails?.[1]?.dob) || "NA",//page no.1
                 coAppGender2 : coApplicantDetails?.[1]?.gender || "NA",//page no.1
                 coAppMarritalStatus2 : coApplicantDetails?.[1]?.maritalStatus || "NA",//page no.1
                 coAppPan2 : coApplicantDetails?.[1]?.docType === 'panCard' ? coApplicantDetails?.[1]?.docNo || '':'NA',
                 coAPPAdhar2 : coApplicantDetails?.[1]?.aadharNo  ?formatAadhaar(coApplicantDetails[1].aadharNo):"NA",
                 coAppvoterId2 : coApplicantDetails?.[1]?.docType === 'voterId' ? coApplicantDetails?.[1]?.docNo || '':'NA',
                 coAppreligion2:coApplicantDetails?.[1]?.religion || "NA",
                //  coAppNationality2:creditPdDetails?.co_Applicant?.[1]?.nationality || "NA",
                coAppNationality2: "Indian",
  
                 coAppCategory2:creditPdDetails?.co_Applicant?.[1]?.category || "NA",
                 coAppNoOfDependentd2:"NA",
                 coAppUdhyamAaadharNo2:"NA",
         
                 //   communicationAddress
                 coAppAdharAdress2 : coborroweraddress || "NA",
                 coAppcity2 : coApplicantDetails?.[1]?.localAddress?.city|| "NA",
                 coAppdistrict2 : coApplicantDetails?.[1]?.localAddress?.district|| "NA",
                 coAppPIN2 : coApplicantDetails?.[1]?.localAddress?.pinCode|| "NA",
                 coAppState2 : coApplicantDetails?.[1]?.localAddress?.state|| "NA",
                 coAppcurentAdress2 : creditPdDetails?.co_Applicant?.[1]?.noOfyearsAtCurrentAddress || "NA",
                 coappLandMark2:creditPdDetails?.co_Applicant?.[1]?.houseLandMark || "NA",
                 coAppCountry2:"India",
                 coResidence2:"Owned",
                 coAppNoOfYearsATCurrentAddress2:creditPdDetails?.co_Applicant?.[1]?.noOfyearsAtCurrentAddress || "NA",
                 coappocuupation1:creditPdDetails?.co_Applicant?.[0]?.occupation || "NA",
                 coappocuupation2:creditPdDetails?.co_Applicant?.[1]?.occupation || "NA",
        
              //   coBorrowername: coApplicantDetails?.[0]?.fullName || "NA",
              //   constitutionCoBorrower:"INDIVIDUAL",
              //   panTanCin : coApplicantDetails?.docNo || "NA",
              // coBorroweraddress: coborroweraddress,
              // coBorroeremail: coApplicantDetails?.[0]?.email || "NA",
              // coBorrowerphoneNo: coApplicantDetails?.[0]?.mobileNo || "NA",
         
              //guarantor details
        
              guaType : creditPdDetails?.guarantor?.guarantorType || "NA",
              guaBuisType:creditPdDetails?.guarantor?.businessType||"NA",
              guaName : guarantorDetails?.fullName || "NA",//page no.1
              guaRelWithApplicant : guarantorDetails?.relationWithApplicant || "NA",//page no.1
              guaFather : guarantorDetails?.fatherName || "NA",//page no.1
              guaMother : guarantorDetails?.motherName || "NA",//page no.1
              guaMobile : guarantorDetails?.mobileNo || "NA",//page no.1
              guaMobileNo2 : guarantorDetails?.mobileNo || "NA",//page no.1
              guaEmail : guarantorDetails?.email || "NA",//page no.1
              guaEdu : guarantorDetails?.education || "NA",//page no.1
              giaReligion:guarantorDetails?.religion||"NA",
              guaDob : formatDate(guarantorDetails?.dob) || "NA",//page no.1
              guaNationality:creditPdDetails?.guarantor?.nationality||"NA",
              guaGender : guarantorDetails?.gender || "NA",//page no.1
              guaMaritialStatus : guarantorDetails?.maritalStatus || "NA",//page no.1
  
              
              // guaPan : guarantorDetails?.docNo || "NA",//page no.1
              guaAdhar : guarantorDetails?.aadharNo? formatAadhaar(guarantorDetails.aadharNo):"NA",//page no.1
              // guaVoterId : guarantorDetails?.docNo || "NA",//page no.1
               guaPan: guarantorDetails?.docType === 'panCard' ? guarantorDetails?.docNo || '':'NA',
  
            guaVoterId : guarantorDetails?.docType === 'voterId' ? guarantorDetails?.docNo || '':'NA',
              guaCategory:creditPdDetails?.guarantor?.category||"NA",
              guaNoOfDependent:"na",
              guaUdhyam:"na",
        
                //   communicationAddress gua creditPdDetails?.guarantor?.occupation || "NA",
  
                gualoacalAdharAdress:guarantorDetails?.localAddress?.addressLine1||"NA",
                gualocalDistrict:guarantorDetails?.localAddress?.district||"NA",
                gualocalCity:guarantorDetails?.localAddress?.city||"NA",
                gualoacalState:guarantorDetails?.localAddress?.state||"NA",
                gualocalPin:guarantorDetails?.localAddress?.pinCode||"NA",     
  
                guaAdressAdhar :guarantorDetails?.localAddress?.addressLine1||"NA",
                guaCity : guarantorDetails?.localAddress?.city||"NA",
                guaDist : guarantorDetails?.localAddress?.district||"NA",
                guaPin : guarantorDetails?.localAddress?.pinCode||"NA",     
                guaState : guarantorDetails?.localAddress?.state||"NA",
                guaYearsCurrentAddress : creditPdDetails?.guarantor?.noOfyearsAtCurrentAddress || "NA",
                guapRESENTaddress:gualocaladdress,
                guaLandMark: creditPdDetails?.guarantor?.houseLandMark || "NA",
                guaResidence:creditPdDetails?.guarantor?.residenceType || "NA",
                guaCountry:"India",
                gauOccupation:creditPdDetails?.guarantor?.occupation || "NA",

                //------------------------------rasan card number------------------------
                familyDetailType:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.familyDetailType||"":"",

                cardNumber:creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.cardNumber||"":"",
                cardHolder:      creditPdDetails?.familyDetailType === "rasanCard"?creditPdDetails?.rasanCardDetail?.cardHolder||"":"",
                address:          creditPdDetails?.familyDetailType === "rasanCard" ?  creditPdDetails?.rasanCardDetail?.address||"":"",
                shopCodeAndLocation:creditPdDetails?.familyDetailType === "rasanCard" ?creditPdDetails?.rasanCardDetail?.shopCodeAndLocation||"":"",
                shopkeeper:       creditPdDetails?.familyDetailType === "rasanCard" ?  creditPdDetails?.rasanCardDetail?.shopkeeper||"":"",
                gasAgency:        creditPdDetails?.familyDetailType === "rasanCard" ?  creditPdDetails?.rasanCardDetail?.gasAgency||"":"",
                gasConnectionNo:   creditPdDetails?.familyDetailType === "rasanCard" ? creditPdDetails?.rasanCardDetail?.gasConnectionNo||"":"",
                connectionType:    creditPdDetails?.familyDetailType === "rasanCard" ? creditPdDetails?.rasanCardDetail?.connectionType||"":"",
                rasanCardDoc:      creditPdDetails?.familyDetailType === "rasanCard" ? creditPdDetails?.rasanCardDetail?.rasanCardDoc||"":"",

                samagraFamilyId: creditPdDetails?.familyDetailType === "samagraId" ?creditPdDetails.samagraIdDetail?.samagraFamilyId||"":"",
                headOfFamily:   creditPdDetails?.familyDetailType === "samagraId" ?creditPdDetails.samagraIdDetail?.headOfFamily||"":"",
                samagraIdDoc:     creditPdDetails?.familyDetailType === "samagraId" ?creditPdDetails.samagraIdDetail?.samagraIdDoc||"":"",
                currentAddress:    creditPdDetails?.familyDetailType === "samagraId" ?creditPdDetails.samagraIdDetail?.address?.currentAddress||"":"",
                addressAsPerAadhaar:creditPdDetails?.familyDetailType === "samagraId" ?creditPdDetails.samagraIdDetail?.address?.addressAsPerAadhaar||"":"",
        
                //colletral Address
                technicalFullADDRESS : technicalDetails?.fullAddressOfProperty || "NA",
                propertyHolder: technicalDetails?.nameOfDocumentHolder || "NA",
                relationWithborrow: technicalDetails?.relationWithApplicant || "NA",
                sreaInSqFt: technicalDetails?.totalLandArea || "NA",
                propertyaGE: technicalDetails?.propertyAge || "NA",
                marketValue: technicalDetails?.fairMarketValueOfLand || "NA",
                //bank Details
        
                bankName : bankDetail?.bankName|| "NA",
                branchName :bankDetail?.branchName|| "NA",
                accNo : bankDetail?.accountNumber|| "NA",
                accType : bankDetail?.accountType|| "NA",
                ifscCode : bankDetail?.ifscCode || "NA",
                accHolderName:bankDetail?.acHolderName||"NA",
        
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
        
                appdate : applicantDetails?.permanentAddress?.years || "NA",
                appImage:applicantDetails?.applicantPhoto||"NA",
                co1Image:coApplicantDetails?.[0]?.coApplicantPhoto||"NA",
                co2Image:coApplicantDetails?.[1]?.coApplicantPhoto||"NA",
                guaImage:guarantorDetails?.guarantorPhoto||"NA",
  
  
      };
      console.log(allParameters,"allParameters")
  
      const partnerData = await finalsanctionModel.findOne({ customerId });
      
         
  
      
      // Generate PDF with skipped pages
      
         pdfPath = await generatePdf(allParameters );
        console.log(pdfPath, "coapplicant");
      
     
  
      if (!pdfPath) {
        console.log("Error generating the Sanction Letter PDF");
        return { error: "PDF generation failed" };
      }
     
            const uploadResponse = await uploadPDFToBucket(pdfPath, `InternalCam${Date.now()}.pdf`);
            const url = uploadResponse.url
            console.log(url,"url")   
        
            console.log(pdfPath,"sanction pdfpath")
            // return pdfPath
            success(res, "PDF generated successfully", {
                APPLICATION_FORM:url,
            });
            // return pdfPath
            // return (
            //   {
            //     APPLICATION_FORM:url,
            // });
  
    } catch (error) {
      console.error(error);
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
  
  
  module.exports = { generatePdf, InternalCampdf };
  