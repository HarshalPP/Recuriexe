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
                            text: "DECLARATION",
                            bold: true,
                            underline: true,
                            size: 34,
                        }),
                    ],
                    alignment: "center",
                    spacing: { after: 400 },
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: "(MEMORANDUM OF DEPOSIT OF TITLE DEEDS)",
                            bold: true,
                            underline: true,
                            size: 30,
                        }),
                    ],
                    alignment: "center",
                    spacing: { after: 400 },
                }),

                new Paragraph({
                    text: "(HOME LOAN)",
                    bold: true,
                    underline: true,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                    text: `This memorandum made at  ${allPerameters.applicantDistrict}  on dated ${allPerameters.currentDate}, between 1- Mr. ${allPerameters.sellerName} S/O ${allPerameters.sellerFatherName } (Adhar Card No. ${allPerameters.sellerAadharNo})  2- Mrs. ${allPerameters.buyerName} S/O ${allPerameters.buyerFatherName} (Aadha Card No. ${allPerameters.buyeraadharNo}). ${allPerameters.sellerAdress} (Property Owner) hereinafter called "THE MORTGAGOR/ S" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his, executors, administrators and assigns) of the ONE PART, and GROW MONEY CAPITAL PVT LTD having its Registered Office at 174/3 Nehru Nagar Indore - 452011 (M.P.) hereinafter called as "THE MORTGAGEE" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his/ her/their heirs, executors, administrators and assigns) of the OTHER PART. `,
                    spacing: { after: 300 },
                }),
                new Paragraph({
                    text: `WHEREAS the Mortgagor is the absolute owner of the immovable property at ${allPerameters.techFullAdress}. AND WHEREAS the mortgagee at the request of the mortgagor has sanctioned and granted credit facility vide sanction letter reference No. ${allPerameters.agrementNo}  dated    ${allPerameters.agreementdate}   issued in favor of 1- ${allPerameters.sellerName} S/O ${allPerameters.sellerFatherName}, 2- ${allPerameters.buyerName} S/O ${allPerameters.buyerFatherName}, ${allPerameters.sellerAdress} to the Mortgagor against the mortgage of the said property belonging to the Mortgagor to be secured by way of Equitable Mortgage by deposit of title deeds and documents more particularly described in the SECOND SCHEDULE hereunder written to the property.  `,
                    spacing: { after: 300 },
                }),

                new Paragraph({
                    text: "AND WHEREAS with intent to create a security of Equitable Mortgage by deposit the title deed of the said property with the Mortgagee, the Mortgagor has agreed to do upon having the repayment thereof with interest thereon in the manner agreed to pay and between the parties hereto as also on several terms and conditions mentioned on the loan documents executed by the Mortgagor in favor of Mortgagee. ",
                    bold: true,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                    text: `AND WHEREAS the Mortgagor have already deposited with the Mortgagee at its Branch Office at Indore the Title Deeds and the documents, particularly described in the SECOND SCHEDULE hereunder written relating to the said property, more particularly described in the FIRST SCHEDULE hereunder written and belonging to mortgagor with intent that the same will be equitably charged as security to `,
                    spacing: { after: 200 },
                    pageBreakBefore: false, 
                }),

                new Paragraph({
                    text: `the Mortgagee for the credit facility (more fully described in the Third Schedule below) granted to Mortgagor by the mortgagee with interest, expenses thereon at the request of the mortgagor. Further it was stated at the physical possession of the property has not been given to the Company. `,
                    spacing: { after: 100 },
                }),

                new Paragraph({
                    text: "AND WHEREAS the Mortgagor have agreed to record the oral completed transaction of equitable mortgage by deposit of title deeds and documents more particularly described in the FIRST SCHEDULE hereunder written and belonging to the MORTGAGOR. ",
                    bold: true,
                    underline: true,
                    spacing: { after: 100 },
                }),

                new Paragraph({
                    text: `${allPerameters.techFullAdress}`,
                    spacing: { after: 150 },
                }),

                new Paragraph({
                    text: `NOW THIS MEMORANDUM WITNESSETH ALSO RECORD AS FOLLOWS: `,
                    spacing: { after: 50 },
                }),
                new Paragraph({
                  text: `1.The mortgagor declare and record that the  deeds and documents and writings comprised in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule, hereunder written, had been deposited by the Mortgagor with GROW MONEY CAPITAL PVT LTD  at their ${allPerameters.applicantDistrict}  branch of the mortgagee on dated ${allPerameters.currentDate} and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith. `,
                  spacing: { after: 200 },
              }),

                new Paragraph({
                    text: `2.The mortgagor further declare and record that the  deeds and documents and writings comprising in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule accepted by said Mr. ${allPerameters.authorizedperson} he Authorized person of GROW MONEY CAPITAL PVT LTD  at their ${allPerameters.applicantDistrict}   branch of the mortgagee on dated ${allPerameters.currentDate} and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor ${allPerameters.roi}% with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith.`,
                    bold: true,
                    underline: true,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                  text: `In witness where of the mortgagor & mortgagee have hereunto set and subscribed their hands the day and year hereinabove written. `,
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

                new Paragraph({
                //   children: [
                //       new TextRun({
                //           text: "Original property details ",
                //       }),
                //   ],
                  children: [
                    new TextRun({
                      text: `Original Co-Ownership Deed No. ${allPerameters.coOwnerShipDeedNo} Dated ${allPerameters.coOwnerShipDeedDate}  ISSUED BY SUB REGISTRAR Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} In Favour of ${allPerameters.sellerName} and ${allPerameters.buyerName} `,
                      bold: false,
                    }),
                ],
                  spacing: { after: 300 },
              }),
                new Paragraph({
                    text: `Property Tax Receipt No.${allPerameters.taxReciptNo} Dated ${allPerameters.taxReciptDate} For Current Year Gram Panchyat ${allPerameters.gramPanchayat} Tehsil  ${allPerameters.Tehsil} District  ${allPerameters.district} State  ${allPerameters.state} In Favour of ${allPerameters.sellerName} S/o ${allPerameters.sellerFatherName} Seal & Sign By ${allPerameters.sealandSignedBy}.`,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                    text: `AREA: ${allPerameters.finalLoanAmount} sq. ft.`,
                    bold: true,
                    spacing: { after: 200 },
                }),

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
                text: `Granted loan vide bank sanction letter ref. No. ${allPerameters.agrementNo }  (LOAN AMOUNT of Rupees (Rs.${allPerameters.finalLoanAmount})/-`,
                bold: true,
                spacing: { after: 100 },
            }),

        //     new Paragraph({
        //       text: `No.  ${allPerameters.coOwnerShipDeedNo }`,
        //       spacing: { after: 100 },
        //   }),

        //   new Paragraph({
        //     text: `(LOAN AMOUNT of Rupe               /- (${allPerameters.finalLoanAmount}) `,
        //     spacing: { after: 100 },
        // }),

        new Paragraph({
          text: `Signed, sealed and delivered by the`,
          spacing: { after: 100 },
      }),

      new Paragraph({
        text: `( Mortgagor)`,
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

const GmemDeedPdf = async (customerId,logo,partnerName,res) => {
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

    const fullName = internalLegalDATA?.buyerName

    console.log("findBuyerFather",fullName)

    // const matchingCoApplicant = coApplicantDetails.filter(coApplicant => coApplicant.fullName === fullName);
    // console.log("matchingCoApplicant",matchingCoApplicant)
    // const fatherName = matchingCoApplicant ? matchingCoApplicant?.fatherName : "Not Found";
    // console.log("Father's Name:", fatherName);

    // const matchingFatherNames = coApplicantDetails
    // .filter(coApplicant => coApplicant.fullName === fullName)
    // .map(coApplicant => coApplicant.fatherName)
    //aadharNo
    // .map(coApplicant => coApplicant.aadharNo)

    const matchingDetails = coApplicantDetails
    .filter(coApplicant => coApplicant.fullName === fullName)
    .map(coApplicant => ({
        fatherName: coApplicant.fatherName,
        aadharNo: coApplicant.aadharNo
    }));

// console.log("Matching Details:", matchingDetails);



// console.log("Father Names:",matchingFatherNames);

const fatherName = matchingDetails.length > 0 ? matchingDetails[0] : null; 

console.log("final Father Names:",fatherName);


    
  
    const partnerModel = await lendersModel.findOne({
      _id: finalsanctionModel.partnerId,
    });
  
    const BranchNameId = customerDetails?.branch;
    // console.log("BranchNameId",BranchNameId)  
          const branchData = await newBranchModel.findById(BranchNameId);
          const branchName = branchData?.name; 

     
  
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

    const sellerFatherName = internalLegalDATA?.sellerFatherName || "NA";
const sellerName = internalLegalDATA?.sellerName || "NA";


// Pehle applicantModel me search karein
let matchingApplicant = await applicantModel.findOne({
    fullName: sellerName,
    fatherName: sellerFatherName
});

// Agar applicantModel me nahi mila, tab coApplicantModel me search karein
if (!matchingApplicant) {
    matchingApplicant = await coApplicantModel.findOne({
        fullName: sellerName,
        fatherName: sellerFatherName
    });
}

// Final Aadhar Number
const aadharNo = matchingApplicant ? matchingApplicant.aadharNo : "Not Found";
console.log("Matching Aadhar No:", aadharNo);
const adharadress= matchingApplicant ? matchingApplicant.localAddress?.addressLine1 : "Not Found";




      
    const allPerameters = {
        authorizedperson:finalsanctionDetails?.authorizedPerson||"NA",
        agreementdate:formatDate(sanctionPendencyDetails?.loanAgreementDate) || "NA",
        agrementNo:sanctionPendencyDetails?.partnerLoanNo || "NA",



        sellerAdress:adharadress||"NA",
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
        sellerName:internalLegalDATA?.sellerName||"NA",
        sellerAadharNo:aadharNo||"NA",

      sealandSignedBy:internalLegalDATA?.SealandSignedBy||"NA",
        buyerName:internalLegalDATA?.buyerName||"NA",
        buyerFatherName:fatherName?.fatherName||"NA",
        buyeraadharNo:fatherName?.aadharNo||"NA",
        
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

    const pdfBuffer = await generatePDF(allPerameters,logo,partnerName);
   console.log(pdfBuffer,"pdfBuffer")
    const uploadResponse = await uploadPDFToBucket(pdfBuffer, `GmEmDeed${Date.now()}.docx`);
         const url = uploadResponse.url
         console.log(url,"url")


         await finalsanctionModel.findOneAndUpdate(
            { customerId }, // Query to find the specific customer document
            {
              $set: { "GmEMdeeDpdf_Url": url } 
            },
          { new: true, upsert: true } // Options: Return the updated document, don't create a new one
        );
    
    return (
      {
      emDeedPdf:uploadResponse.url,
    });
  } 
  catch (error) {
    console.log(error);
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

  module.exports = {  GmemDeedPdf,uploadPDFToBucket };
   