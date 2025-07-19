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
  const aadharModel = require('../../model/aadhaar.model')
  const panCardModel = require('../../model/panComprehensive.model')



  
  
  
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
    // function addFooter() {
    //     const pageWidth = doc.page.margins.left;
    //     const pageHeight = doc.page.height;
    
    //     doc
    //       .font(fontBold)
    //       .fontSize(6.3)
    //       .fillColor("#324e98")
    //       .text("FinCoopers Capital Pvt Ltd", pageWidth, pageHeight - 80, {
    //         align: "center",
    //       });
    //     doc
    //       .font(fontBold)
    //       .fontSize(6.3)
    //       .fillColor("#000000")
    //       .text("Registered Office: 174/3, Nehru Nagar, Indore-452011 (M.P.)", {
    //         align: "center",
    //       });
    //     doc
    //       .font(fontBold)
    //       .fontSize(6.3)
    //       .fillColor("#000000")
    //       .text("CIN: 67120MP1994PTC008686", { align: "center" });
    //     doc
    //       .font(fontBold)
    //       .fontSize(6.3)
    //       .fillColor("#000000")
    //       .text("Phone: +91 7374911911 | Email: hr@fincoopers.com", {
    //         align: "center",
    //       });
    
    //     // Add a separator line above the footer
    //     doc
    //       .moveTo(50, doc.page.height - 100)
    //       .lineTo(doc.page.width - 50, doc.page.height - 100)
    //       .strokeColor("#324e98")
    //       .lineWidth(1)
    //       .stroke();
    //   }

    
    function addFooter() {
        if( partnerName == "GROW MONEY CAPITAL PVT LTD"){
          const pageWidth = doc.page.margins.left;
          const pageHeight = doc.page.height;
      
          doc
            .font(fontBold)
            .fontSize(6.3)
            .fillColor("#324e98")
            .text("Grow Money Capital Pvt Ltd", pageWidth, pageHeight - 80, {
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
       
      }
    
  
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const timestamp = Date.now();
    const pdfFilename = `growDualName.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
  
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
  
    doc.pipe(stream);
  
    // Add logo and border to the first page
    doc.moveDown(5);

    doc
    .fontSize(9)
    .text('Dual Name', { align: 'center' })
    .moveDown(2)
    .text('To,\n\nManager,\n\nGrow Money Capital Pvt Ltd, 401,\n\nNewDelhi House 27 Barakhamba Road,\n\nNew Delhi 11000', { align: 'left' })
    .moveDown(2)
    .moveDown(1.5)
    .text(
      `I  ${allPerameters.name1} S/o/W/o  ${allPerameters.fatherName1} aged  ${allPerameters.age1} ,byFaith ________, residing at  ${allPerameters.adress1} falling within the territorial jurisdiction of police station at  ${allPerameters.policeStation1} ,do hereby solemnly affirm and declare to GROW MONEY (which expression shall include its assigns, nominees and successors in interest) as follows:\n`
    )
    .font(fontBold)
    .fontSize(12)
    .text('DUAL NAME:', {align:"center", underline: true })
    .moveDown(1)
    .font(font)

    .fontSize(9)
    .text(
      `A. I am the deponent herein and a law-abiding citizen of India
       B. B. My name on Pan card (Document Name and ID) is mentioned as
       ${allPerameters.pancardname1} and my name on Aadhar card (Documeent Name and ID)
       is mentioned as ${allPerameters.aadharcardName1}.
       C. Both my said names have been recorded on various documents and all requisite KYC documents are
       available for ________________.
       D. I confirm and declare that both ${allPerameters.pancardname1} and ${allPerameters.aadharcardName1} are my
       names and  I am known by both of these names.
       E. That I declare and undertake to indemnify and keep GROW MONEY indemnified from all losses, cost,penalty, fees, damage etc., due to my dual names.
       F. That I have fully understood the contents of the averments contained in paras A to E of this affidavit, which are true to my personal knowledge and belief, and nothing material has been concealed / suppressed theren from and no part of it is false and that I accordingly swear this affidavit and verify its content on this_______________ day of _________,_________at_____________`
    );
    doc.moveDown(3)

    

  // Second Page
  doc
  .font(font)
  .fontSize(9)
  .text(`Witness no.1  `,{continued:true,align:'left'})
  .text( `Witness no.2  `,{align:'right'})
  .text(`Name:-${allPerameters.witnessName1} `,{continued:true,align:'left'})
  .text(`Name:-${allPerameters.witnessName2} `,{align:'right'})
  .text(`Pan Card Number:-${allPerameters.witpanCard1}   ` ,{continued:true,align:'left'})
  .text(`Pan Card Number:-${allPerameters.witpanCard2} ` ,{align:'right'})
  .text(`Signature:-  `,{continued:true,align:'left'})
   .text(`Signature:-  `,{align:'right'})
    
     
  
      doc.end();
    
      const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
      console.log(pdfFileUrl,"pdfFileUrl")
      doc.pipe(fs.createWriteStream(pdfPath));
      
    //   const objData = {
    //     fileName: pdfFileUrl,
    //     // file: doc.toString('base64')
    //  }
    //   await initESign(objData)
    
      return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          resolve(pdfFileUrl);
        });
        stream.on("error", reject);
      });
    }
    
  
  
  const growDualNamepdf = async(customerId) =>{
      try {
        // console.log(customerId,"in sanction latter") cibilModel finalsanctionModel
        // if (!mongoose.Types.ObjectId.isValid(customerId)) {
        //   // badRequest("Invalid customerId format.");
        //   return badRequest(res, "No loan details provided");

        // }``

  // const incomesectionLatter = async(req,res) =>{
  //   // const naamdevPdf = async(customerId,logo) =>{
  
  //   // const customerId = "673de5ee3ecb1d6e805654a3"
  //        const { customerId } = req.query;

  //   try{
  //   console.log(customerId,"in sanction latter")
    
        // Fetch data using the validated `customerId`
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


        const panno = applicantDetails?.panNo;
  // console.log("BranchNameId",BranchNameId)
      const panDetails = await panCardModel.findOne({ panNo });
  // if (!branchData) {
        //     return badRequest(res, "Branch data not found for the given branchId");
        // }
        const branchName = branchData?.name; 



        const aadharDetails = await aadharModel.findOne({ customerId });
        // const panDetails = await panCardModel.findOne({ customerId });


  
  
        const address = [
          applicantDetails?.permanentAddress?.addressLine1,
          // applicantDetails?.permanentAddress?.addressLine2, aadharModel panCardModel
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
  
        const allPerameters = {
          aadharcardName1:aadharDetails?.Name||"NA",
          pancardname1:"NA"
        }
  
          const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
          console.log("pdfPath", ratannaFinSanctionLetterPdf);
          // console.log("http://localhost:5500" + pdfPath);
      
          if (!pdfPath) {
           console.log("Error generating the Sanction Letter Pdf")
          }
          // success(res, "PDF generated successfully", pdfPath);
          // console.log(pdfPath,"pdfPath pdfPath")
          return pdfPath
        } catch (error) {
          console.log(error);
          // unknownError(res, error);
        }
  }
  
  
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
    growDualNamepdf
  }