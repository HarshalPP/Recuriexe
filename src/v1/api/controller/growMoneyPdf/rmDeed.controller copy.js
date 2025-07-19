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
//   require('dotenv').config(); // if using a .env file
//   const { S3Client,PutObjectCommand  } = require('@aws-sdk/client-s3');
  
//   const spacesEndpoint = 'https://blr1.digitaloceanspaces.com';
  
  
//   const s3Client = new S3Client({
//       endpoint: spacesEndpoint,
//       region: 'blr1', // DigitalOcean ignores this, but it's required by the AWS SDK
//       credentials: {
//         accessKeyId: process.env.DO_SPACES_KEY,
//         secretAccessKey: process.env.DO_SPACES_SECRET,
//       },
//       // If you have DNS issues with virtual-hosted style ("bucket.region.digitaloceanspaces.com"),
//       // you can try forcing path-style requests:
//       // forcePathStyle: true,
//     });
  
//   /**
//    * Uploads a file to DigitalOcean Spaces
//    *
//    * @param {string} bucketName - The name of your DigitalOcean Space.
//    * @param {string} filePathInBucket - The path (Key) within the bucket, e.g. 'uploads/image.jpg'.
//    * @param {stream|Buffer} fileContent - File data as a stream or buffer.
//    * @param {string} [acl='public-read'] - Access control, default is 'public-read'.
//    * @param {string} [contentType] - Optional content/mime type (e.g., 'image/jpeg').
//    * @returns {Promise<object>} - Resolves with the upload data (including the file's URL).
//    */
//   async function uploadToSpaces(bucketName, filePathInBucket, fileContent, acl = 'public-read', contentType) {
//     const params = {
//       Bucket: bucketName,
//       Key: filePathInBucket,
//       Body: fileContent,
//       ACL: acl,
//     };
  
  
//     // Send the PutObjectCommand
//     const command = new PutObjectCommand(params);
//     const response = await s3Client.send(command);
//     return response
//     if (contentType) {
//       params.ContentType = contentType;
//     }
  
//     // 's3Client.upload' returns a managed upload object with a .promise() method.
//     const data = await s3Client.upload(params).promise();
//     return data; // data.Location will be the file URL if ACL is public
//   }
const generatePDF = async (allPerameters) => {
  const font = "assets/font/Cambria.ttf";
    const fontBold = "assets/font/Cambria-Bold.ttf";
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument();

  // Buffer to hold the PDF content
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => console.log('PDF generated successfully!'));

  // Adding content to the PDF
  // doc.text(`Hello, ${data.name}! This is your generated PDF.`, { align: 'center' });
  function drawTable(tableData) {
    // Add Table Header
    const startX = 50;
    let startY = doc.y + 10;
    const columnWidths = [500];

    const keyWidth = Math.round((columnWidths[0] * 1) / 2);
    const valueWidth = Math.round((columnWidths[0] * 1) / 2);
    // console.log(columnWidths[0], keyWidth, valueWidth);

    // Reset fill color to white for table rows

    // Define table data (replace this with the actual data you want)

    // Render table rows
    tableData.forEach((row, rowIndex) => {
      // Alternate row background color
      doc.lineWidth(0.5);

      let valueRowHeight = 20;

      if ([13, 15, 18, 20].includes(rowIndex)) {
        valueRowHeight = 38.5;
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
        .fontSize(7.2)
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
        .fontSize(7.2)
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

  const startX = 50; // Set a left margin


// doc.moveDown(10);
const logoPath = path.join(
__dirname,
"../../../../../assets/image/legal.png"
);
//    addHeader(doc, logoPath);
//    
doc   .fontSize(15).font(fontBold).text('WITHOUT POSSESSION DEEDFOR LOAN AMOUNT 300000/- ', { align: 'center' }).moveDown(2);


doc.moveDown(1);
doc
.fontSize(12)
.fillColor("black")
.font('Helvetica-Bold')
// .text('9. Conclusion', {align:`left`});
// doc.moveDown()
// y += 20;
doc.font('Helvetica').text(`This memorandum made at RATLAM on dated   26/12/2024, Mrs. RESAM BAI W/O Mr.PANNA LAL JI (Property Owner) ID NO. IHNPB0008R  hereinafter called "THE MORTGAGOR" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his, executors, administrators and assigns) of the ONE PART, and GROW MONEY CAPITAL PVT LTD. having its Registered Office at 401, New Delhi House,27 Barakhamba Road, Connaught Place, New Delhi-110001  and also a Branch Office at MANDSOUR (M.P.) hereinafter called as "THE MORTGAGEE" (which expression shall unless it be repugnant to the context or meaning thereof be deemed to include his/her/their heirs, executors, administrators and assigns) of the OTHER PART.  `, {align: 'left' }).moveDown();

doc.font('Helvetica')
  .text(
`WHEREAS the Mortgagor is the absolute owner of the immovable property at   HOUSE NO 33 SURVEY NO 103 PATWARI HALKA NO 21 WARD NO 11 VILLAGE GADDUKHEDI GRAM PANCHYAT BISA KHEDA TEHSIL ALOT DISTRICT RATLAM STATE MADHYA PRADESH PIN CODE 457118. `,{align:'left'}).moveDown()
      doc.font('Helvetica')
      doc.font('Helvetica').text(`AND WHEREAS the mortgagee at the request of the mortgagor has sanctioned issued in favor of Mrs. RESAM BAI W/O Mr.PANNA LAL JI to the Mortgagor against the mortgage of the said property belonging to the Mortgagor to be secured by way of Mortgage by deposit of documents more particularly described in the SECOND SCHEDULE hereunder written to the property. `,{align:'left'}).moveDown()

      doc.font('Helvetica').text(`AND WHEREAS with intent to create a security of Mortgage by deposit of documents of the said property with the Mortgagee, the Mortgagor has agreed to do upon having the repayment thereof with interest thereon in the manner agreed to pay and between the parties hereto as also on several terms and conditions mentioned on the loan documents executed by the Mortgagor in favor of Mortgagee. AND WHEREAS the Mortgagor have already  deposited with the Mortgagee at its Branch Office at Indorethe documents and the documents, particularly described in the SECOND SCHEDULE hereunder written relating to the said property, more particularly described in the FIRST SCHEDULE hereunder written and belonging to mortgagor with intent that the same will be mortgage charged as security to the Mortgagee for the credit facility (more fully described in the Third Schedule below) granted to Mortgagor by the mortgagee with interest, expenses thereon at the request of the mortgagor. Further it was stated at the physical possession of the property has not been given to the Company. `,{align:'left'}).moveDown() 
      .text(`AND WHEREAS the Mortgagor have agreed to record the oral completed transaction  of mortgage by deposit of  documents more particularly described in the FIRST SCHEDULE hereunder written and belonging to the MORTGAGOR. `,{ align: 'left' });

 
  



      
  doc.addPage();
 //  addHeader(doc, logoPath);

  // addHeader();

  y = 170;
  doc
  .fontSize(12)
  .fillColor("black")
  .font('Helvetica-Bold')
  // .text('9. Conclusion', {align:`left`});
  // doc.moveDown()
  // y += 20;
  doc.font('Helvetica').text(`NOW THIS MEMORANDUM WITNESSETH ALSO RECORD AS FOLLOWS:`,50,145, {align: 'left' }).moveDown();

  doc.font('Helvetica')
    .text(
  `1.The mortgagor declare and record that the  deeds and documents and writings comprised in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule, hereunder written, had been deposited by the Mortgagor with GROW MONEY CAPITAL PVT LTD.  at their Mandsour branch of the mortgagee on dated 26-12-2024 and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith. `,{align:'left'}).moveDown(2)
        doc.font('Helvetica')
        doc.font('Helvetica').text(`2.The mortgagor further declare and record that the  deeds and documents and writings comprising in the Second Schedule hereunder written relating to the said property, more particularly described in the First Schedule accepted by said Mr. VINOD BARAGI he Authorized person of GROW MONEY CAPITAL PVT LTD.  at their Mandsour branch of the mortgagee on dated 26-12-2024 and by way of mortgage security by deposit of  deeds and documents for securing loan/credit facility granted by the mortgagee to the Mortgagor 23%with interest thereon and for all costs, charges and expenses incurred by the mortgagee in connection therewith. `,{align:'left'}).moveDown(3)

        doc.font('Helvetica').text(`In witness where of the mortgagor & mortgagee have hereunto set and subscribed their hands the day and year hereinabove written. `,{align:'left'}).moveDown(2) 
        .font('Helvetica-Bold').text(
  `The First Schedule above referred to `,{ align: 'center' ,underline:true}).moveDown()
  .text(`Property Address – `,{align:'left'}).moveDown()
  .text(`All that piece and parcel of  `,{align:'left'}).moveDown()
  .text(`HOUSE NO 33 SURVEY NO 103 PATWARI HALKA NO 21 WARD NO 11 VILLAGE GADDUKHEDI GRAM PANCHYAT BISA KHEDA TEHSIL ALOT DISTRICT RATLAM STATE MADHYA PRADESH PIN CODE 457118.`,{align:'left'}).moveDown(2)
  .text(`AREA:- 2750  sq. fit.`,{align:'left'})






  doc.addPage();
  //  addHeader(doc, logoPath);
 
   // addHeader();
 
   y = 170;
   doc
   .fontSize(12)
   .fillColor("black")
   .font('Helvetica-Bold')
   .text(`Bounded  by  :-   `,{align:'left',underline:true}).moveDown(2)
   .font('Helvetica')
   .text( 
`East  - ${allPerameters.OnOrTowardsEast}

West  - ${allPerameters.OnOrTowardsWest}

North - ${allPerameters.OnOrTowardsNorth}

South - ${allPerameters.OnOrTowardsSouth}`,{align:'left'}).moveDown(2)
.font('Helvetica-Bold')
   .text(`The Second Schedule above referred to - `,{align:'center',underline:true}).moveDown(2)
   .font('Helvetica')
   .text(`List   of   documents   of   properties–   `,{align:'left',underline:true}).moveDown(2)
   .text(`ORIGINAL GRAM PANCHAYAT PATTA NO. KRAMANK/33/JA./  DATED 22-12-2024 ISSUED BY SARPANCH & SACHIV TEHSIL ALOT DISTRICT RATLAM IN FAVOUR OF Mrs. RESAM BAI W/O Mr.PANNA LAL JI SEAL & SIGN BY SARPANCH & SACHIV `,{align:'left'}).moveDown(2)
   .text(`PROPERTY TAX RECEIPT NO. 33 DATED  14-11-2024 FOR CURRENT YEAR GRAM PANCHYAT BISA KHEDA TEHSIL ALOT DISTRICT RATLAM IN FAVOUR OF Mrs. RESAM BAI W/O Mr.PANNA LAL JI SEAL & SIGN BY SARPANCH & SACHIV   `,{align:'left'}).moveDown(2)
   .font('Helvetica-Bold')
   .text(`The   Third   Schedule   above   referred   to `,{align:'left',underline:true}).moveDown(1)
   .text(`The mortgagor has sanctioned issued in favour of  Mrs. RESAM BAI W/O Mr.PANNA LAL JI  `,{align:'left',underline:false,continued:true})
   
   .font('Helvetica')
   .text(`(LOAN AMOUNT of Rupees   300000/- ) `,{align:'left',underline:false}).moveDown(0.5)

   .text(`Signed, sealed and delivered by the `,{align:'left',underline:false}).moveDown(0.5)
   .font('Helvetica-Bold')
   .text(`Mrs. RESAM BAI W/O Mr. PANNA LAL JI  ( Mortgagor) `,{align:'left',underline:false}).moveDown(0.5)
   .font('Helvetica')
   .text(`SIGNED BY/ON BEHALF OF MORTGAGEE 

Through its authorized signatoryz  `,{align:'left',underline:false}).moveDown(0.5)
.font('Helvetica-Bold')
   .text(`Mr. VIJAY BERAGI  `,{align:'left',underline:false}).moveDown()
   doc.end();

  // Returning the generated PDF buffer
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
};

// Second Function: Call PDF Generator
const GmRmDeedPdf = async (customerId,logo,partnerName,res) => {
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
      
      const allPerameters = {
        date:formattedDate||"NA",
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
  
        CoapplicantName:coApplicantDetails?.[0]?.fullName||"NA",
        CoapplicantName1:coApplicantDetails?.[1]?.fullName||"NA",

  
        techFullAdress:technicalDetails?.fullAddressOfProperty||"NA",
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
  
        taxReciptNo:internalLegalDATA?.taxReceipt?.no||"NA",
        taxReciptDate:formatDate(internalLegalDATA?.taxReceipt?.date)||"NA",
  
        coOwnerShipDeedNo:internalLegalDATA?.co_ownership_deed?.no||"NA",
        coOwnerShipDeedDate:formatDate(internalLegalDATA?.co_ownership_deed?.date)||"NA",
  
        emDeedNo:internalLegalDATA?.EM_DEED?.no||"NA",
        emDeedDate:formatDate(internalLegalDATA?.EM_DEED?.date)||"NA",
  
        landArea:technicalDetails?.totalLandArea||"NA",
      }
      console.log(allPerameters,"allPerameters")


    // Call the generatePDF function to create the PDF
    const pdfBuffer = await generatePDF(allPerameters,logo,partnerName);
   console.log(pdfBuffer,"pdfBuffer")


    // Pass the generated PDF buffer to the third function for upload
    const uploadResponse = await uploadPDFToBucket(pdfBuffer, `GmRmDeed${Date.now()}.pdf`);
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
    const contentType = 'application/pdf';

    const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, pdfBuffer, 'public-read', contentType);

    return { url: `https://cdn.fincooper.in/${filePathInBucket}` };
  } catch (error) {
    console.error('Error uploading PDF to bucket:', error);
    throw new Error('Upload failed');
  }
};

// module.exports = { handlePDFGeneration };



  module.exports = {  GmRmDeedPdf,uploadPDFToBucket };
  