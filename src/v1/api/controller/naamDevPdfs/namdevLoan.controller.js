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
    const internalLegalModel = require("../../model/finalApproval/internalLegal.model.js"); 
  
  const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/gmcpl logo.png"
  );
 
  const watermarklogo = path.join(
    __dirname,
    "../../../../assets/image/watermarklogo.png"
  );
  
  
  async function sanctionLetterPdf(allPerameters,logo,partnerName) {
    const font = "assets/font/Cambria.ttf";
    const fontBold = "assets/font/Cambria-Bold.ttf";
    const Hindi = 'assets/font/Hind-Regular.ttf'
    const HindiBold = 'assets/font/Hind-Bold.ttf'


    
  
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
  
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => console.log('PDF generated successfully!'));
  
   
  
    // add logo to every page
    // function addLogo() {
    //   if (fs.existsSync(logo)) {
    //     doc.image(logo, 400, 50, {
    //       fit: [150, 50],
    //       align: "left",
    //       valign: "bottom",
    //     });
    //   } else {
    //     console.error(`Logo file not found at: ${pdfLogo}`);
    //   }
    // }
  
    
  
   
  
    
    
  
    const timestamp = Date.now();
 
    doc.font(Hindi).fontSize(14).text('सुविधा समझौता', { align: 'center' });
    doc.moveDown(1);

    // doc.font(hindi).fontSize(12).text('यह ऋण अनुबंध, इस ऋण अनुबंध को संदिभत करेगा और इसम समय-समय पर संशोिधत िकए गए अनुसूिचयों और प रिश ों को शािमल करेगा।', { align: 'left' });
    // doc.moveDown(2);
    // doc.text('ऋणी और ऋणदाता को यहां बाद म सामूिहक प से "प " कहा जाएगा और गत प से "प " के प म संदिभत िकया जाएगा।', { align: 'left' });
    // doc.moveDown(2);
    // doc.text('जहां तक: ऋणी ने कंपनी से अनुरोध िकया है िक वह ऋणी को ऋण द,े और गारंटर ने इस ऋण की गारंटी देने पर सहमित की है।', { align: 'left' });
    // doc.moveDown(2);
    // doc.text('अब यह समझौता सा देता है और यह यहां पर समझा गया है िक पािटयों के बीच िन ानुसार सहमित है:', { align: 'left' });
    // doc.moveDown(2);
    // doc.text('1. प रभाषाएँ', { align: 'bold' });
    // doc.text('1.1 "अित र सुर ा" का अथ है वह अित र सुर ा जो सुर ा दाता ारा ुत की जा सकती है।', { align: 'left' });
    // doc.text('1.2 " ासंिगक कानून" का अथ है कोई भी अिधिनयम, कानून, िविनयमन, अ ादेश, िनयम जो म करण पर अिधकार े रखने वाली ािधकरण ारा कानून के प म भावी हो।', { align: 'left' });

  function addHeader(doc) {
          if (!doc || typeof doc.font !== "function") {
            throw new Error("Invalid PDFDocument instance passed to addHeader.");
          }
        
          // Add the advocate's name and title
          doc
            .font(Hindi)
            .fontSize(12)
            .text(`यह ऋण अनुबंध, इस ऋण अनुबंध को संदर्भित करेगा और इसमें समय-समय पर संशोधित किए गए अनुसूचियों और परिवर्तनों को शामिल करेगा (आगे "ऋण अनुबंध" के रूप में संदर्भित)। यह अनुबंध दिनांक और स्थान पर संपन्न हुआ है जैसा कि नीचे दी गई अनुसूची में लिखा है, जो कि ऋणी (ऋणी) और/या सह-ऋणी (सह-ऋणी) के रूप में विण्टित है (विण्टित) (विण्टित) के बीच है, जिनका पंजीकृत कार्यालय/कार्यालय/निवास स्थान नीचे दी गई अनुसूची में विशेष रूप से विण्टित है, जिसे यहां बाद में "ऋणी" कहा जाएगा (जिसका अर्थ उसके संदर्भ या अर्थ के विपरीत नहीं होगा, इसे अपने अधिकारों और अधिकारों को संदर्भित करने के लिए समझा जाएगा)। सुविधा के लिए, चाहे विण्टित रूप से या सामूहिक रूप से, जैसा कि संदर्भ की आवश्यकता हो सकती है; पहले भाग में; और दूसरे भाग में, गारंटर जिसके विवरण नीचे दी गई अनुसूची में लिखे हैं; और`, 80, 30, { align: "left" });
        
          doc
            .fontSize(12)
            .font(Hindi)
            .text(`तीसरे भाग में, नामदेव फिनवेस्ट प्राइवेट लिमिटेड, जो कंपनियों अधिनियम, 1956 (2013) के अर्थ के अंतर्गत एक गैर-बैंकिंग वित्तीय कंपनी है, जिसका पंजीकृत कार्यालय एस 1, एस 7-एस 8, दूसरी मंजिल, श्रीनाथ गाजिया, नीर सागर मार्केट, भांकरोटा, अजमेर रोड, जयपुर 302026 पर स्थित है और भारत में उस पते पर शाखा है जैसा कि नीचे दी गई अनुसूची में लिखा है, जिसे यहां बाद में "कंपनी" कहा जाएगा (जिसका अर्थ उसके संदर्भ या अर्थ के विपरीत नहीं होगा, इसे अपने अधिकारों और अधिकारों को संदर्भित करने के लिए समझा जाएगा)। ऋणी और ऋणदाता को यहां बाद में सामूहिक रूप से "पार्टी" कहा जाएगा और विण्टित रूप से "पार्टी" के रूप में संदर्भित किया जाएगा। जहां तक: ऋणी ने कंपनी से अनुरोध किया है कि वह ऋणी को ऋण दे, और गारंटर ने इस ऋण की गारंटी देने पर सहमति दी है। `, 80, 55, { align: "left" });
        
          // Add the logo aligned to the left of the name and title
          
        
          // Add contact details aligned to the right but left-aligned text
          const addressStartY = 50; // Starting Y position for the address
          const addressX = doc.page.width - 260; // Adjust X position closer to the right margin
          
          doc
            .font(Hindi)
            .fontSize(12)
            // .text(`यह ऋण अनुबंध, इस ऋण अनुबंध को संदर्भित करेगा और इसमें समय-समय पर संशोधित किए गए अनुसूचियों और परिवर्तनों को शामिल करेगा (आगे "ऋण अनुबंध" के रूप में संदर्भित)। यह अनुबंध दिनांक और स्थान पर संपन्न हुआ है जैसा कि नीचे दी गई अनुसूची में लिखा है, जो कि ऋणी (ऋणी) और/या सह-ऋणी (सह-ऋणी) के रूप में विण्टित है (विण्टित) (विण्टित) के बीच है, जिनका पंजीकृत कार्यालय/कार्यालय/निवास स्थान नीचे दी गई अनुसूची में विशेष रूप से विण्टित है, जिसे यहां बाद में "ऋणी" कहा जाएगा (जिसका अर्थ उसके संदर्भ या अर्थ के विपरीत नहीं होगा, इसे अपने अधिकारों और अधिकारों को संदर्भित करने के लिए समझा जाएगा)। सुविधा के लिए, चाहे विण्टित रूप से या सामूहिक रूप से, जैसा कि संदर्भ की आवश्यकता हो सकती है; पहले भाग में; और दूसरे भाग में, गारंटर जिसके विवरण नीचे दी गई अनुसूची में लिखे हैं; और `, addressX, addressStartY, { align: "left" })
            // .text("South Tukoganj, Indore [M.P.]", addressX, addressStartY + 15, { align: "left" })
            // .text("Residence: 2-J, 16/2, Manikbagh,", addressX, addressStartY + 30, { align: "left" })
            // .text("Choithram Road, Indore [M.P.]", addressX, addressStartY + 45, { align: "left" })
            // .text("Mob. No.: 97550-97878", addressX, addressStartY + 60, { align: "left" })
            // .text("E-mail:", addressX, addressStartY + 75, { align: "left",continued:true });
            // const email = "advocate.makhan@yahoo.in";
    //      const emailY = addressStartY + 75; // Y position for the email
    //   doc
    //   .fillColor("blue")
    //      // Change text color to blue to indicate a link
    //     .text(email, addressX, emailY, { align: "left", link: `mailto:${email}` });
        
          // Add a line divider
          doc
            .moveTo(50, addressStartY + 110)
            // .lineTo(doc.page.width - 50, addressStartY + 110)
            .stroke();
        }
      
        addHeader(doc);

  
  
  
   
    doc.end();
  
  
  
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
  };
  
  // ------------------  create pdf ---------------------------------------
    const namdevLoanPdf = async(customerId,logo,partnerName) =>{
  
    try{
    console.log(customerId,"in sanction latter")
  
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
    const internalLegalDATA = await internalLegalModel.findOne({ customerId });
  
    const partnerModel = await lendersModel.findOne({
      _id: finalsanctionDetails.partnerId,
    });
  
    const BranchNameId = customerDetails?.branch;
          const branchData = await newBranchModel.findById(BranchNameId);
         
          const branchName = branchData?.name; 
  
  
  
  
    
  
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
  
        CoapplicantName:coApplicantDetails?.[0]?.fullName||"NA",
        CoapplicantName1:coApplicantDetails?.[1]?.fullName||"",
  
  
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
        const pdfPath = await sanctionLetterPdf(allPerameters,logo,partnerName);
        
    
        if (!pdfPath) {
         console.log("Error generating the Sanction Letter Pdf")
        }const uploadResponse = await uploadPDFToBucket(pdfPath, `NamdevLoandocument${Date.now()}.pdf`);
        const url = uploadResponse.url
        console.log(url,"url")        
        await finalsanctionModel.findOneAndUpdate(
            { customerId }, 
            {
              $set: { "naamDevPdflink.naamDevLoanPdf": url } 
            },
          { new: true, upsert: true } 
        );
        console.log(pdfPath,"sanction pdfpath")
        
        return (
          {
            namdevLoan:url,
        });
      } catch (error) {
        console.log(error);
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
  
  
  
  
  module.exports = { sanctionLetterPdf, namdevLoanPdf };
  