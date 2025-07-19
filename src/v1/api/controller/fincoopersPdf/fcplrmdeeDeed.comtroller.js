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
const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js");


  const mongoose = require("mongoose");
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
const externalBranchModel = require("../../model/externalManager/externalVendorDynamic.model.js");
const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
const lendersModel = require("../../model/lender.model.js");
const { Document, Packer, Paragraph, TextRun } = require("docx");

  const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/gmcpl logo.png"
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

const generatePDF = async (allPerameters) => {

  const doc = new Document({
    styles: {
      paragraphStyles: [
          {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                  size: 26,  
              },
          },
      ],
  },
    sections: [
        {
          properties: {
            page: {
                size: "A4", 
                margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 }, 
            },
        },
            children: [
               
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `WITHOUT POSSESSION DEEDFOR LOAN AMOUNT ${allPerameters.finalLoanAmount} /-`,
                            bold: true,
                            underline: true,
                            size: 30,
                        }),
                    ],
                    alignment: "center",
                    spacing: { after: 400 },
                }),

                // new Paragraph({
                //     text: "(HOME LOAN)",
                //     bold: true,
                //     underline: true,
                //     spacing: { after: 200 },
                // }),

                new Paragraph({
                    text: `This memorandum made at ${allPerameters.applicantDistrict}  on dated   ${allPerameters.currentDate} , Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}  (Property Owner) ID NO.  ${allPerameters.propertyPanNo}   hereinafter called "THE MORTGAGOR" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his, executors, administrators and assigns) of the ONE PART, and FIN COOPERS CAPITAL PVT.LTD. having its Registered Office 174/3,Nehru Nagar,Indore-452011(M.P)  and also a Branch Office at ${allPerameters.BranchName}  (M.P.) hereinafter called as "THE MORTGAGEE" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his/her/their heirs, executors, administrators and assigns) of the OTHER PART.`,
                    spacing: { after: 300 },
                }),

                new Paragraph({
                    text: `WHEREAS the Mortgagor is the absolute owner of the immovable property at  ${allPerameters.techFullAdress}.`,
                    spacing: { after: 300 },
                }),

                

                new Paragraph({
                    text: `AND WHEREAS the mortgagee at the request of the mortgagor has sanctioned issued in favor of Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}  to the Mortgagor against the mortgage of the said property belonging to the Mortgagor to be secured by way of Mortgage by deposit of documents more particularly described in the SECOND SCHEDULE hereunder written to the property.`,
                    bold: true,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                    text: `AND WHEREAS with intent to create a security of Mortgage by deposit of documents of the said property with the Mortgagee, the Mortgagor has agreed to do upon having the repayment thereof with interest thereon in the manner agreed to pay and between the parties hereto as also on several terms and conditions mentioned on the loan documents executed by the Mortgagor in favor of Mortgagee.`,
                    spacing: { after: 200 },
                    pageBreakBefore: false, 

                }),

                new Paragraph({
                    text: `AND WHEREAS the Mortgagor have already  deposited with the Mortgagee at its Branch Office at Indorethe documents and the documents, particularly described in the SECOND SCHEDULE hereunder written relating to the said property, more particularly described in the FIRST SCHEDULE hereunder written and belonging to mortgagor with intent that the same will be mortgage charged as security to the Mortgagee for the credit facility (more fully described in the Third Schedule below) granted to Mortgagor by the mortgagee with interest, expenses thereon at the request of the mortgagor. Further it was stated at the physical possession of the property has not been given to the Company.`,
                    spacing: { after: 100 },
                }),

                new Paragraph({
                    text: `AND WHEREAS the Mortgagor have agreed to record the oral completed transaction of mortgage by deposit of  documents more particularly described in the FIRST SCHEDULE hereunder written and belonging to the MORTGAGOR.`,
                    bold: true,
                    underline: true,
                    spacing: { after: 150 },
                }),


                new Paragraph({
                    text: `NOW THIS MEMORANDUM WITNESSETH ALSO RECORD AS FOLLOWS: `,
                    spacing: { after: 100 },
                }),
                new Paragraph({
                  text: `1.	The mortgagor declare and record that the  deeds and documents and writings comprised in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule, hereunder written, had been deposited by the Mortgagor with FIN COOPERS CAPITAL PVT.LTD. at their ${allPerameters.BranchName}  branch of the mortgagee on dated ${allPerameters.currentDate}  and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith. `,
                  spacing: { after: 250 },
              }),

                new Paragraph({
                    text: `2.	The mortgagor further declare and record that the  deeds and documents and writings comprising in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule accepted by said Mr. ${allPerameters.authorizedperson}  he Authorized person of FIN COOPERS CAPITAL PVT.LTD. at their ${allPerameters.BranchName}  branch of the mortgagee on dated  ${allPerameters.currentDate}   and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor ${allPerameters.roi} with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith.`,
                    bold: true,
                    underline: true,
                    spacing: { after: 250 },
                }),

                new Paragraph({
                  text: `In witness where of the mortgagor & mortgagee have hereunto set and subscribed their hands the day and year hereinabove written.`,
                  bold: true,
                  underline: true,
                  spacing: { after: 200 },
              }),

              new Paragraph({
                children: [
                    new TextRun({
                        text: "The First Schedule above referred to ",
                        bold: true,
                        underline: true,
                        size: 28,
                    }),
                ],
                alignment: "center",
                spacing: { after: 300 },
            }),

            new Paragraph({
              children: [
                  new TextRun({
                      text: "Property Address – ",
                      bold: true,
                  }),
              ],
              alignment: "left",
              spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
                new TextRun({
                    text: "All that piece and parcel of  ",
                    bold: true,
                }),
            ],
            alignment: "left",
            spacing: { after: 200 },
        }),

        new Paragraph({
          children: [
              new TextRun({
                  text: `${allPerameters.techFullAdress}`,
                  bold: true,
                  color: "FF0000", 

              }),
          ],
          alignment: "left",
          spacing: { after: 200 },
      }),

        new Paragraph({
          text: `AREA:- ${allPerameters.totalLandArea}  sq. fit.`,
          bold: true,
          underline: false,
          spacing: { after: 200 },
      }),

      new Paragraph({
        text: `Bounded  by  :-   `,
        bold: true,
        underline: true,
        spacing: { after: 200 },
    }),

    
            new Paragraph({
              children: [
                  new TextRun({
                      text: `East  - ${allPerameters.OnOrTowardsEast}`,
                      color: "FF0000", 
                      bold: true,
                  }),
              ],
              spacing: { after: 100 },
          }),
          
          new Paragraph({
              children: [
                  new TextRun({
                      text: `West  - ${allPerameters.OnOrTowardsWest}`,
                      color: "FF0000",
                      bold: true,
                  }),
              ],
              spacing: { after: 100 },
          }),
          
          new Paragraph({
              children: [
                  new TextRun({
                      text: `North - ${allPerameters.OnOrTowardsNorth}`,
                      color: "FF0000",
                      bold: true,
                  }),
              ],
              spacing: { after: 100 },
          }),
          
          new Paragraph({
              children: [
                  new TextRun({
                      text: `South - ${allPerameters.OnOrTowardsSouth}`,
                      color: "FF0000", 
                      bold: true,
                  }),
              ],
              spacing: { after: 300 },
          }),

          new Paragraph({
            children: [
                new TextRun({
                    text: "The Second Schedule above referred to - ",
                    bold: true,
                    underline: true,
                    size: 28,
                }),
            ],
            alignment: "center",
            spacing: { after: 300 },
        }),
          

                new Paragraph({
                    text: "List of Documents of Properties:",
                    bold: true,
                    underline: true,
                    spacing: { after: 200 },
                }),

              //   new Paragraph({
              //     // children: [
              //     //     new TextRun({
              //     //         text: "Original property details ",
              //     //     }),
              //     // ],
              //     children: [
              //       new TextRun({
              //         text: `ORIGINAL GRAM PANCHAYAT PATTA NO. ${allPerameters.OnOrTowardsSouth}   DATED 22-12-2024  ISSUED BY SARPANCH & SACHIV TEHSIL ALOT DISTRICT RATLAM IN FAVOUR OF Mrs. RESAM BAI W/O Mr.PANNA LAL JI  SEAL & SIGN BY SARPANCH & SACHIV`,
              //         bold: false,
              //       }),
              //   ],
              //     spacing: { after: 300 },
              // }),
                new Paragraph({
                    text: `ORIGINAL GRAM PANCHAYAT PATTA NO. ${allPerameters.gramPanchayatNo}   DATED ${allPerameters.gramPanchayatDate}  ISSUED BY SARPANCH & SACHIV Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} IN FAVOUR OF Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}  SEAL & SIGN BY SARPANCH & SACHIV`,
                    spacing: { after: 200 },
                }),
                new Paragraph({
                  // children: [
                  //     new TextRun({
                  //         text: "Original property details ",
                  //     }),
                  // ],
                  children: [
                    new TextRun({
                      text: `PROPERTY TAX RECEIPT NO. ${allPerameters.taxReciptNo}  DATED  ${allPerameters.taxReciptDate}  FOR CURRENT YEAR Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} IN FAVOUR OF Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}  SEAL & SIGN BY ${allPerameters.sealandSignedBy} `,
                      bold: false,
                    }),
                ],
                  spacing: { after: 300 },
              }),

                // new Paragraph({
                //     text: "AREA: 2080 sq. ft.",
                //     bold: true,
                //     spacing: { after: 200 },
                // }),

                new Paragraph({
                  children: [
                      new TextRun({
                          text: "The   Third   Schedule   above   referred   to ",
                          bold: true,
                          underline: true,
                          size: 28,
                      }),
                  ],
                  alignment: "center",
                  spacing: { after: 300 },
              }),

              new Paragraph({
                text: `The mortgagor has sanctioned issued in favour of Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}  (LOAN AMOUNT of Rupees   ${allPerameters.finalLoanAmount} /- )`,
                bold: true,
                spacing: { after: 160 },
            }),

            new Paragraph({
              text: `Signed, sealed and delivered by the`,
              spacing: { after: 160 },
          }),

          new Paragraph({
            text: `Mr. ${allPerameters.propertyOwnerName} S/O ${allPerameters.propertyOwnerFatherName}   ( Mortgagor)`,
            spacing: { after: 160 },
        }),

       
    new Paragraph({
      text: `Through its authorized signatoryz`,
      spacing: { after: 160 },
  }),
  new Paragraph({
    text: `Mr. ${allPerameters.authorizedperson} `,
    spacing: { after: 100 },
}),
            //     new Paragraph({
            //       text: "", // Empty paragraph
            //       pageBreakBefore: true, // Yeh Page 3 start karega
            //   }),

            //   new Paragraph({
            //     text: "", // Empty paragraph
            //     pageBreakBefore: true, // Yeh Page 3 start karega
            // }),
            ],
        },
    ],
});

return new Promise((resolve, reject) => {
    Packer.toBuffer(doc)
        .then((buffer) => {
            resolve(buffer);
        })
        .catch((err) => {
            reject(err);
        });
});
};

// Second Function: Call PDF Generator
const fcplRmDeedPdf = async (customerId,logo,partnerName,res) => {
  try {
    // const data = req.body; // Assuming data comes from the request body
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
    //internalLegalModel
    const internalLegalDATA = await internalLegalModel.findOne({ customerId });
  
    const partnerModel = await lendersModel.findOne({
      _id: finalsanctionModel.partnerId,
    });
  
    const BranchNameId = customerDetails?.branch;
    // console.log("BranchNameId",BranchNameId)  
          const branchData = await newBranchModel.findById(BranchNameId);
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
        applicantDetails?.permanentAddress?.addressLine1,
        applicantDetails?.permanentAddress?.addressLine2,
        applicantDetails?.permanentAddress?.city,
        applicantDetails?.permanentAddress?.district,
        applicantDetails?.permanentAddress?.state,
        applicantDetails?.permanentAddress?.pinCode
      ].filter(Boolean).join(', ');
  
      const timestamp = Date.now();
  
  // Convert timestamp to a Date object
  const currentDate = new Date(timestamp);
  
  // Format the date to dd/mm/yy
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
  });
  
  const formatDate = (praMANpATRADate) => {
  if (!praMANpATRADate) return "NA"; // Agar DOB available nahi hai to "NA" return kare
  const date = new Date(praMANpATRADate); // Date object me convert kare
  const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
  const year = String(date.getFullYear()).slice(); // Sirf last 2 digits le
  return `${day}-${month}-${year}`; // Final format
  };


  const AppAddress = applicantDetails?.fullName === internalLegalDATA?.sellerName
  ? (applicantDetails?.localAddress?.addressLine1 || 'NA')
  : coApplicantDetails?.[0]?.fullName === internalLegalDATA?.sellerName
    ? coApplicantDetails[0]?.localAddress?.addressLine1 || 'NA'
    : 'NA';

     const proprtyownerFatherName = internalLegalDATA?.PropertyOwnerFatherName || "NA";
    const proprtyownerName = internalLegalDATA?.PropertyOwnerName || "NA";
    
    // Pehle applicantModel me search karein
    let matchingApplicant = await applicantModel.findOne({
        fullName: proprtyownerName,
        fatherName: proprtyownerFatherName
    });

    console.log("matchingApplicant",matchingApplicant)
    
    // Agar applicantModel me nahi mila, tab coApplicantModel me search karein
    if (!matchingApplicant) {
      matchingApplicant = await coApplicantModel.findOne({
          fullName: proprtyownerName,
          fatherName: proprtyownerFatherName,
          docType: "panCard"  
      });
  }
  
  // PAN Number nikalne ka logic
  const panNo = matchingApplicant 
      ? (matchingApplicant.panNo || matchingApplicant.docNo) 
      : "Not Found";
  
  console.log("Matching PAN No:", panNo);
      
      const allPerameters = {
        authorizedperson:finalsanctionDetails?.authorizedPerson||"NA",
        propertyPanNo:panNo||"",
        roi:finalsanctionDetails?.roi||"NA",
        BranchName:branchName||"NA",
        finalLoanAmount:finalsanctionDetails?.finalLoanAmount||"NA",
        applicantDistrict:applicantDetails?.localAddress?.district||"NA",
        currentDate:formattedDate||"NA",
        partnerName:partnerModel?.fullName||"NA",
        partnerAdress:partnerModel?.registerAddress||"NA",
        partnerCoAdress:partnerModel?.corporateAddress||"NA",
        partnerEmail:partnerModel?.email||"NA",
        partnerContact:partnerModel?.phoneNumber||"NA",
        partnerCinNo:partnerModel?.cinNo||"NA",
  
  
        sellerFatherName:internalLegalDATA?.sellerFatherName||"NA",
      sealandSignedBy:internalLegalDATA?.SealandSignedBy||"NA",
        sellerName:internalLegalDATA?.sellerName||"NA",
        buyerName:internalLegalDATA?.buyerName||"NA",
        applicantName:applicantDetails?.fullName||"NA",
        applicantFatherName:applicantDetails?.fatherName||"NA",

        propertyOwnerName:internalLegalDATA?.PropertyOwnerName||"NA",
        propertyOwnerFatherName:internalLegalDATA?.PropertyOwnerFatherName||"NA",
  
        CoapplicantName:coApplicantDetails?.[0]?.fullName||"NA",
        CoapplicantName1:coApplicantDetails?.[1]?.fullName||"NA",

  
        techFullAdress:technicalDetails?.fullAddressOfProperty||"NA",
        totalLandArea:technicalDetails?.totalLandArea||"NA",
        propertyOwner:technicalDetails?.nameOfDocumentHolder||"NA",
  
        appAdress:AppAddress,
  
        OnOrTowardsNorth: technicalDetails?.northBoundary|| "NA",
        OnOrTowardsSouth: technicalDetails?.southBoundary|| "NA",
        OnOrTowardsEast: technicalDetails?.eastBoundary|| "NA",
        OnOrTowardsWest: technicalDetails?.westBoundary|| "NA",
  
        pramanPatraNo:internalLegalDATA?.pramanPatra?.no||"NA",
        praMANpATRADate:formatDate(internalLegalDATA?.pramanPatra?.date)||"NA",
        gramPanchayat:technicalDetails?.gramPanchayat||"NA",
        Tehsil:technicalDetails?.tehsil||"NA",
        district:technicalDetails?.district||"NA",
        state:technicalDetails?.state||"NA",
  
        taxReciptNo:internalLegalDATA?.Property_Tax_Reciept?.no||"NA",
        taxReciptDate:formatDate(internalLegalDATA?.Property_Tax_Reciept?.date)||"NA",
  
        coOwnerShipDeedNo:internalLegalDATA?.co_ownership_deed?.no||"NA",
        coOwnerShipDeedDate:formatDate(internalLegalDATA?.co_ownership_deed?.date)||"NA",

        //gramPanchayat 

        gramPanchayatNo:internalLegalDATA?.gramPanchayat?.no||"NA",
        gramPanchayatDate:formatDate(internalLegalDATA?.gramPanchayat?.date)||"NA",
  
        emDeedNo:internalLegalDATA?.EM_DEED?.no||"NA",
        emDeedDate:formatDate(internalLegalDATA?.EM_DEED?.date)||"NA",
  
        landArea:technicalDetails?.totalLandArea||"NA",
      }
      console.log(allPerameters,"allPerameters")


    // Call the generatePDF function to create the PDF
    const pdfBuffer = await generatePDF(allPerameters,logo,partnerName);
   console.log(pdfBuffer,"pdfBuffer")


    // Pass the generated PDF buffer to the third function for upload
    const uploadResponse = await uploadPDFToBucket(pdfBuffer, `fcplRmDeed${Date.now()}.docx`);
         const url = uploadResponse.url
         console.log(url,"url")

         await finalsanctionModel.findOneAndUpdate(
          { customerId }, // Query to find the specific customer document
          {
            $set: { "GmRMdeeDpdf_Url": url } 
          },
        { new: true, upsert: true } // Options: Return the updated document, don't create a new one
      );


    // return ({
    //   success: true,
    //   message: 'PDF generated and uploaded successfully!',
    //   url: uploadResponse.url,
    // });
    return (
      {
      rmDeedPdf:uploadResponse.url,
    });
  } 
  catch (error) {
    console.log(error);
    // return unknownError(res, error);
  }
};

const uploadPDFToBucket = async (pdfBuffer, fileName) => {
  try {
    const filePathInBucket = `${process.env.PATH_BUCKET}/LOS/PDF/${fileName}`;
    const bucketName = 'finexe'; 
    const contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, pdfBuffer, 'public-read', contentType);

    return { url: `https://cdn.fincooper.in/${filePathInBucket}` };
  } catch (error) {
    console.error('Error uploading PDF to bucket:', error);
    throw new Error('Upload failed');
  }
};

// module.exports = { handlePDFGeneration };



  module.exports = {  fcplRmDeedPdf,uploadPDFToBucket };
  