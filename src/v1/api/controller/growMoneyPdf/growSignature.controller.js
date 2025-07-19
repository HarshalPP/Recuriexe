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
    //     const pageWidth = doc.page.margins.l eft;
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
    const pdfFilename = `growSignature.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
  
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
  
    doc.pipe(stream);
  
    // Add logo and border to the first page
    doc.moveDown(5);

    doc
    .font(fontBold)
    .fontSize(12)
    .text('Signature/DOB Affidavit', { align: 'center' })
    .moveDown(3);
    // .text('To,\n\nManager,\n\nGrow Money Capital Pvt Ltd, 401,\n\nNewDelhi House 27 Barakhamba Road,\n\nNew Delhi 11000', { align: 'left' })
    // .moveDown(2)
    doc
    .font(font)

    .fontSize(9)
    .text(
      `I _______________________________________ S/D/W of Mr _______________________________________, resident of ___________________________  _____________________________,do hereby solemnly affirm and declare as under:-\n`
    )
    
    .moveDown(1)
    .font(font)

    .fontSize(10)
    .text(
      `
       1. That the deponent is the citizen of India.
       2. That the deponent is the permanent resident of the above-mentioned address.
       3- That the exact/correct/actual date of birth of the deponent is ____________________________ whereas the date of
       birth mentioned in ____________________________(KYC document/s) is _________________.
       4- That the deponent has no other documentary proof regarding his/her date of birth.
       5- That my specimen signatures are as under -

       Name:-
       
       x________________                                                                                                         x___________________
       Specimen Signature 1                                                                                                      Specimen Signature 1  `
    );
    doc.moveDown(1)
    doc
    .moveDown(1)
    .font(fontBold)

    .fontSize(10)
    .text(
      `                                                                                                                          Deponent`
    )
    .font(fontBold)

    .fontSize(10)
    .text(
      `                                                                                                                   x_________________________`
    );
   
    doc
    .font(font)
    .fontSize(9)
    .text(`
        Verified that the contents of my above affidavit are true to best of my knowledge and belief and nothing concealed therein.
        
       Verified at_______________on___________
        
                                                                                                                            Deponent
                                                                                                                        x____________________`, )
    .moveDown(2);

    

  // Second Page
  doc
    .font(font)
    .fontSize(9)
    .text(`Witness no.1  `,{continued:true,align:'left'})
    .text( ` Witness no.2  `,{align:'right'})
    .text(`Name:-  `,{continued:true,align:'left'})
    .text( `Name:-  `,{align:'right'})
    .text( `Pan Card Number:-   ` ,{continued:true,align:'left'})
    .text( `Pan Card Number:-   ` ,{align:'right'})
    .text( `Signature:-  `,{continued:true,align:'left'})
     .text( `Signature:-  `,{align:'right'})
    
     
  
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
    
  
  
  const growSignaturepdf = async(customerId) =>{
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
  
  
        const address = [
          applicantDetails?.permanentAddress?.addressLine1,
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
  
        const allPerameters = {
          processingfees:disbuDetail?.kfsDetails?.processingFees || "NA",//page no.1
          insuranceCharges:disbuDetail?.kfsDetails?.insuranceCharges || "NA",//page no.1
          docCharges:disbuDetail?.kfsDetails?.documentsCharges || "NA",//page no.1
          cersaiCharges:disbuDetail?.kfsDetails?.cersaiCharges || "NA",//page no.1
          pENDENCYlOANnumber:disbuDetail?.preDisbursementForm?.loanNumber || "NA",//page no.1
          sanctionpendencyDate:disbuDetail?.preDisbursementForm?.dateOfSanction || "NA",//page no.1
          customerName : applicantDetails?.fullName || "NA",//page no.1
          address : address,
          KAndA: KAndA,
          customerID: disbuDetail?.preDisbursementForm?.partnerCustomerID || "NA",
          loanBorrowerName : applicantDetails?.fullName || "NA",
          loanCoborrowerName : coApplicantDetails[0]?.fullName || "NA" ,
          loanCoborrowerNameTwo : coApplicantDetails[1]?.fullName || "NA" ,
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
          PURPOSEoFlOAN:finalsanctionDetails?.EndUseOfLoan || "NA",
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
          Construction: ` ${technicalDetails?.totalBuiltUpArea} __ Sq. Ft`
        }
  
          const pdfPath = await ratannaFinSanctionLetterPdf(allPerameters);
          // console.log("pdfPath", ratannaFinSanctionLetterPdf);
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
    growSignaturepdf
  }