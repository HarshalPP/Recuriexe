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
  const lendersModel = require("../../model/lender.model.js");
  const aadhaarModel = require("../../model/aadhaar.model.js");
  const panModel = require("../../model/panComprehensive.model.js");

  
  
  
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
        doc.image(pdfLogo, 400, 50, {
          fit: [150, 50],
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
    // const pdfFilename = `ratnaDobSign.pdf`;
    // const pdfPath = path.join(outputDir, pdfFilename);
  
    // const doc = new PDFDocument({ margin: 50, size: "A4" });
    // const stream = fs.createWriteStream(pdfPath);
  
    // doc.pipe(stream);
  
    // Add logo and border to the first page
    // addLogo();
    // drawBorder();
    doc.moveDown(5);

    doc
    .fontSize(9)
    .text(`Date : ${allPerameters.date}`, { align: 'right' })
    .moveDown(2)
    .text(`To,\n\nManager,\n\n${allPerameters.partnerName },\n\n ${allPerameters.adress}`, { align: 'left' })
    .moveDown(2)
    .text('Dear Sir,')
    .moveDown(1.5)
    .text(
      `I  ${allPerameters.name} S/o,  ${allPerameters.fatherName} resident of ${allPerameters.customerAdress} aged about  ${allPerameters.age} do hereby solemnly affirm and declare as under :-\n`
    )
    .font(fontBold)
    .fontSize(12)
    .text('DUAL NAME:', {align:"center", underline: true })
    .moveDown(1)
    .font(font)

    .fontSize(9)
    .text(
      `1. That my name is  ${allPerameters.name}\n\n2. That I wish to avail credit facilities in form of Agri Micro Lap as per Facility Number ${allPerameters.loanNo} from Ratnaafin Capital Private Limited.\n\n3. That correct spelling of my name is as above that the document provided for the purpose of availing Credit Facilities / providing Guarantee / providing Security, has mis-spelt my name. The documents however, belongs to me.\n\n4. My full name when expanded read as ${allPerameters.adharname}/${allPerameters.PanName}/${allPerameters.voterName}\n\n5 .That I hereby instruct the bank to accept the documents provided by me for the purpose of availing Credit Facilities /  providing Guarantee / providing Security, bearing any of the above-mentioned names.\n\n6. That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors harmless for any loss or damage caused to it due to acceptance of my above request.`
    );
    doc.moveDown(2)

    

  // Second Page
  doc
    .font(fontBold)
    .fontSize(12)
    .text('(DUAL SIGNATURE):', {align:"center", underline: true })
    .moveDown(1)
    .font(font)
    .fontSize(9)
    .text(
      `1.That my name is ${allPerameters.name}\n\n` +
      '2.That I have following Bank accounts with bank: -\n\n' +
      `NA in the name of NA\n\n` +
      '3.That I have two signatures namely,\n\n\n\n' +
      '__________________________________     ______________________________________\n\n' +
      'Signature 1                                                       Signature 2\n\n' +
      '4.That apart from the aforesaid signatures, I do not sign in any other manner.\n\n' 
    );
    doc.addPage();

    
    doc.moveDown(5);
    doc
    .font(font)
    .fontSize(9)
    .text(
      '5.That I hereby instruct the bank to accept and honour all the instruments / instructions issued / given by me bearing ' +
      'any of the above-mentioned signatures.\n\n' +
      '6.That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors ' +
      'harmless for any loss or damage caused to it due to acceptance of my request to honour instruments and instructions ' +
      'bearing any of the above-mentioned signatures.\n\n'
    )
    .font(fontBold)
    .fontSize(12)
    .text('AND (DUAL DOB):', {align:"center",underline: true })
    .moveDown(1.6)
    .font(font)
    .fontSize(9)
    .text(
      `1.That my name is ${allPerameters.name}\n\n` +
      `2.As per Pan Card my DOB is ${allPerameters.panDob} as per ` +
      `Aadhar Card DOB is ${allPerameters.adharDob} and as per ` +
      `Voter Id DOB is ${allPerameters.voterDob}.\n\n` +
      `3.Please consider the DOB as ${allPerameters.panDob} which is as per Pan Card\n\n` +
      'Sincerely,'
    );
    
     
  
//   addFooter()
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
    async function ratannaFinSanctionLetterPdf1(allPerameters1) {
  
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
          doc.image(pdfLogo, 400, 50, {
            fit: [150, 50],
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
      // const pdfFilename = `ratnaDobSign.pdf`;
      // const pdfPath = path.join(outputDir, pdfFilename);
    
      // const doc = new PDFDocument({ margin: 50, size: "A4" });
      // const stream = fs.createWriteStream(pdfPath);
    
      // doc.pipe(stream);
    
      // Add logo and border to the first page
      // addLogo();
      // drawBorder();
      doc.moveDown(5);
  
      doc
      .fontSize(9)
      .text(`Date : ${allPerameters1.date}`, { align: 'right' })
      .moveDown(2)
      .text(`To,\n\nManager,\n\n${allPerameters1.partnerName },\n\n ${allPerameters1.adress}`, { align: 'left' })
      .moveDown(2)
      .text('Dear Sir,')
      .moveDown(1.5)
      .text(
        `I  ${allPerameters1.name} S/o,  ${allPerameters1.fatherName} resident of ${allPerameters1.customerAdress} aged about  ${allPerameters1.age} do hereby solemnly affirm and declare as under :-\n`
      )
      .font(fontBold)
      .fontSize(12)
      .text('DUAL NAME:', {align:"center", underline: true })
      .moveDown(1)
      .font(font)
  
      .fontSize(9)
      .text(
        `1. That my name is  ${allPerameters1.name}\n\n2. That I wish to avail credit facilities in form of Agri Micro Lap as per Facility Number ${allPerameters1.loanNo} from Ratnaafin Capital Private Limited.\n\n3. That correct spelling of my name is as above that the document provided for the purpose of availing Credit Facilities / providing Guarantee / providing Security, has mis-spelt my name. The documents however, belongs to me.\n\n4. My full name when expanded read as ${allPerameters1.adharname}/${allPerameters1.PanName}/${allPerameters1.voterName}\n\n5 .That I hereby instruct the bank to accept the documents provided by me for the purpose of availing Credit Facilities /  providing Guarantee / providing Security, bearing any of the above-mentioned names.\n\n6. That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors harmless for any loss or damage caused to it due to acceptance of my above request.`
      );
      doc.moveDown(2)
  
      
  
    // Second Page
    doc
      .font(fontBold)
      .fontSize(12)
      .text('(DUAL SIGNATURE):', {align:"center", underline: true })
      .moveDown(1)
      .font(font)
      .fontSize(9)
      .text(
        `1.That my name is ${allPerameters1.name}\n\n` +
        '2.That I have following Bank accounts with bank: -\n\n' +
        `NA in the name of NA\n\n` +
        '3.That I have two signatures namely,\n\n\n\n' +
        '__________________________________     ______________________________________\n\n' +
        'Signature 1                                                       Signature 2\n\n' +
        '4.That apart from the aforesaid signatures, I do not sign in any other manner.\n\n' 
      );
      doc.addPage();
  
      
      doc.moveDown(5);
      doc
      .font(font)
      .fontSize(9)
      .text(
        '5.That I hereby instruct the bank to accept and honour all the instruments / instructions issued / given by me bearing ' +
        'any of the above-mentioned signatures.\n\n' +
        '6.That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors ' +
        'harmless for any loss or damage caused to it due to acceptance of my request to honour instruments and instructions ' +
        'bearing any of the above-mentioned signatures.\n\n'
      )
      .font(fontBold)
      .fontSize(12)
      .text('AND (DUAL DOB):', {align:"center",underline: true })
      .moveDown(1.6)
      .font(font)
      .fontSize(9)
      .text(
        `1.That my name is ${allPerameters1.name}\n\n` +
        `2.As per Pan Card my DOB is ${allPerameters1.panDob} as per ` +
        `Aadhar Card DOB is ${allPerameters1.adharDob} and as per ` +
        `Voter Id DOB is ${allPerameters1.voterDob}.\n\n` +
        `3.Please consider the DOB as ${allPerameters1.panDob} which is as per Pan Card\n\n` +
        'Sincerely,'
      );
      
       
    
  //   addFooter()
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

      async function ratannaFinSanctionLetterPdf2(allPerameters2) {
  
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
            doc.image(pdfLogo, 400, 50, {
              fit: [150, 50],
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
        // const pdfFilename = `ratnaDobSign.pdf`;
        // const pdfPath = path.join(outputDir, pdfFilename);
      
        // const doc = new PDFDocument({ margin: 50, size: "A4" });
        // const stream = fs.createWriteStream(pdfPath);
      
        // doc.pipe(stream);
      
        // Add logo and border to the first page
        // addLogo();
        // drawBorder();
        doc.moveDown(5);
    
        doc
        .fontSize(9)
        .text(`Date : ${allPerameters2.date}`, { align: 'right' })
        .moveDown(2)
        .text(`To,\n\nManager,\n\n${allPerameters2.partnerName },\n\n ${allPerameters2.adress}`, { align: 'left' })
        .moveDown(2)
        .text('Dear Sir,')
        .moveDown(1.5)
        .text(
          `I  ${allPerameters2.name} S/o,  ${allPerameters2.fatherName} resident of ${allPerameters2.customerAdress} aged about  ${allPerameters2.age} do hereby solemnly affirm and declare as under :-\n`
        )
        .font(fontBold)
        .fontSize(12)
        .text('DUAL NAME:', {align:"center", underline: true })
        .moveDown(1)
        .font(font)
    
        .fontSize(9)
        .text(
          `1. That my name is  ${allPerameters2.name}\n\n2. That I wish to avail credit facilities in form of Agri Micro Lap as per Facility Number ${allPerameters2.loanNo} from Ratnaafin Capital Private Limited.\n\n3. That correct spelling of my name is as above that the document provided for the purpose of availing Credit Facilities / providing Guarantee / providing Security, has mis-spelt my name. The documents however, belongs to me.\n\n4. My full name when expanded read as ${allPerameters2.adharname}/${allPerameters2.PanName}/${allPerameters2.voterName}\n\n5 .That I hereby instruct the bank to accept the documents provided by me for the purpose of availing Credit Facilities /  providing Guarantee / providing Security, bearing any of the above-mentioned names.\n\n6. That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors harmless for any loss or damage caused to it due to acceptance of my above request.`
        );
        doc.moveDown(2)
    
        
    
      // Second Page
      doc
        .font(fontBold)
        .fontSize(12)
        .text('(DUAL SIGNATURE):', {align:"center", underline: true })
        .moveDown(1)
        .font(font)
        .fontSize(9)
        .text(
          `1.That my name is ${allPerameters2.name}\n\n` +
          '2.That I have following Bank accounts with bank: -\n\n' +
          `NA in the name of NA\n\n` +
          '3.That I have two signatures namely,\n\n\n\n' +
          '__________________________________     ______________________________________\n\n' +
          'Signature 1                                                       Signature 2\n\n' +
          '4.That apart from the aforesaid signatures, I do not sign in any other manner.\n\n' 
        );
        doc.addPage();
    
        
        doc.moveDown(5);
        doc
        .font(font)
        .fontSize(9)
        .text(
          '5.That I hereby instruct the bank to accept and honour all the instruments / instructions issued / given by me bearing ' +
          'any of the above-mentioned signatures.\n\n' +
          '6.That I hereby agree and undertake to hold the Ratnaafin Capital Private Limited and its officers and Directors ' +
          'harmless for any loss or damage caused to it due to acceptance of my request to honour instruments and instructions ' +
          'bearing any of the above-mentioned signatures.\n\n'
        )
        .font(fontBold)
        .fontSize(12)
        .text('AND (DUAL DOB):', {align:"center",underline: true })
        .moveDown(1.6)
        .font(font)
        .fontSize(9)
        .text(
          `1.That my name is ${allPerameters2.name}\n\n` +
          `2.As per Pan Card my DOB is ${allPerameters2.panDob} as per ` +
          `Aadhar Card DOB is ${allPerameters2.adharDob} and as per ` +
          `Voter Id DOB is ${allPerameters2.voterDob}.\n\n` +
          `3.Please consider the DOB as ${allPerameters2.panDob} which is as per Pan Card\n\n` +
          'Sincerely,'
        );
        
         
      
    //   addFooter()
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
    
  
  
  const ratnaDobSignForm = async(customerId,selections ) =>{
      try {

        // const customerSelections = selections.split(','); // This part is correct
        // console.log(customerSelections,"customerSelections"); // "acg"
       console.log(selections,"selections"); // "acg"

       
        const customerDetails = await customerModel.find({ _id: customerId });
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
        const partnerModel = await lendersModel.findOne({
          _id: finalsanctionDetails.partnerId,
        });
        //get aaDhar data
        const aadhaarNo = applicantDetails?.aadharNo;
        const aadhaarData = await aadhaarModel.findOne({aadharNo:aadhaarNo});

        const aadhaarName = aadhaarData?.Name; 


        const aadharDob = aadhaarData?.DOB; 

        //get pan data
        const PanNO = applicantDetails?.panNo;
        const panData = await panModel.findOne({panNumber:PanNO});

        //coApp
        const coAppaadhaarNo = coApplicantDetails?.aadharNo;
        const coAppaadhaarData = await aadhaarModel.findOne({aadharNo:coAppaadhaarNo});

        const coAppPanNO = coApplicantDetails?.[0]?.docType === 'panCard' ? coApplicantDetails?.[0]?.docNo:'N/A';
        const coApppanData = await panModel.findOne({panNumber:coAppPanNO});

        //gau
        const gauaadhaarNo = guarantorDetails?.aadharNo;
        const gauaadhaarData = await aadhaarModel.findOne({aadharNo:gauaadhaarNo});

        const gauPanNO = guarantorDetails?.[0]?.docType === 'panCard' ? guarantorDetails?.[0]?.docNo:'N/A';
        const gaupanData = await panModel.findOne({panNumber:gauPanNO});


      
  
        const address = [
          applicantDetails?.localAddress?.addressLine1,
          // applicantDetails?.permanentAddress?.addressLine2,  //panModel Name DOB
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
  
        // console.log("KAndA",KAndA)`

        const timestamp = Date.now();

// Convert timestamp to a Date object
const currentDate = new Date(timestamp);

// Format the date to dd/mm/yy
const formattedDate = currentDate.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
  
        const allPerameters = {
          date:formattedDate||"NA",
          partnerName:partnerModel?.fullName||"NA",
          adress:partnerModel?.registerAddress||"NA",
          name : applicantDetails?.fullName || "NA",
          fatherName:applicantDetails?.fatherName||"NA",
          customerAdress:applicantDetails?.localAddress?.addressLine1||"NA",
          age:applicantDetails?.age||"NA",
          
          adharname:aadhaarData?.Name||"NA",
          adharDob:aadhaarData?.DOB||"na",

          PanName:panData?.full_name||"NA",
          panDob:panData?.dob||"NA",
  
          voterName:"",
          voterDob:"NA",

          loanNo:sanctionPendencyDetails?.partnerLoanNo || "NA",


        }
        console.log(allPerameters,"allPerameters")
        const allPerameters1 = {
          date:formattedDate||"NA",
          partnerName:partnerModel?.fullName||"NA",
          adress:partnerModel?.registerAddress||"NA",

          name : coApplicantDetails[0]?.fullName || "NA",
          fatherName:coApplicantDetails[0]?.fatherName||"NA",
          customerAdress:coApplicantDetails[0]?.localAddress?.addressLine1||"NA",
          age:coApplicantDetails[0]?.age||"NA",
          
          adharname:coAppaadhaarData?.Name||"NA",
          adharDob:coAppaadhaarData?.DOB||"na",

          PanName:coApppanData?.full_name||"NA",
          panDob:coApppanData?.dob||"NA",
  
          voterName:"",
          voterDob:"NA",

          loanNo:sanctionPendencyDetails?.partnerLoanNo || "NA",




        }
        const allPerameters2 = {
          date:formattedDate||"NA",
          partnerName:partnerModel?.fullName||"NA",
          adress:partnerModel?.registerAddress||"NA",

          name : guarantorDetails?.fullName || "NA",
          fatherName:guarantorDetails?.fatherName||"NA",
          customerAdress:guarantorDetails?.localAddress?.addressLine1||"NA",
          age:guarantorDetails?.age||"NA",
          
          adharname:gauaadhaarData?.Name||"NA",
          adharDob:gauaadhaarData?.DOB||"na",

          PanName:gaupanData?.full_name||"NA",
          panDob:gaupanData?.dob||"NA",
  
          voterName:"",
          voterDob:"NA",

          loanNo:sanctionPendencyDetails?.partnerLoanNo || "NA",



        }
  
          // const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
          // // console.log("pdfPath", ratannaFinSanctionLetterPdf);
          // // console.log("http://localhost:5500" + pdfPath);
      
          // if (!pdfPath) {
          //  console.log("Error generating the Sanction Letter Pdf")
          // }
          // // success(res, "PDF generated successfully", pdfPath);
          // // console.log(pdfPath,"pdfPath pdfPath")
          // return pdfPath

          let pdfPath = ""; // Initialize pdfPath to avoid undefined errors

    if (selections === "applicant") {
      pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
      console.log(pdfPath, "applicant");
    } else if (selections === "coapplicant") {
      pdfPath = await ratannaFinSanctionLetterPdf1(allPerameters1);
      console.log(pdfPath, "coapplicant");
    } else if (selections === "gaurantor") {
      pdfPath = await ratannaFinSanctionLetterPdf2(allPerameters2);
      console.log(pdfPath, "gaurantor");
    } else {
      throw new Error("Invalid selection type");
    }

    if (!pdfPath) {
      console.log("Error generating the Sanction Letter PDF");
      return { error: "PDF generation failed" };
    }
          const uploadResponse = await uploadPDFToBucket(pdfPath, `ratnaDobSign${Date.now()}.pdf`);
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
          // return pdfPath
          // success(res, "PDF generated successfully", pdfPath);
          // return pdfPath
          return (
            {
              ratnaaDobform:url,
          });
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
    ratnaDobSignForm
  }