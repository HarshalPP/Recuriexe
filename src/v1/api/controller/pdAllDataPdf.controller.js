const {
    success,
    unknownError,
  } = require("../../../../globalHelper/response.globalHelper");
  const PDFDocument = require("pdfkit");
  const stream = require('stream');
  const sharp = require('sharp');
  const processModel = require("../model/process.model");
  const externalManagerModel = require("../model/externalManager/externalVendorDynamic.model");
  const pdModel = require("../model/credit.Pd.model");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const axios = require('axios');
  const employeeModel = require('../model/adminMaster/employe.model')
  const designationModel = require('../model/adminMaster/newDesignation.model')
  const cibilDetailModel = require('../model/cibilDetail.model')
  const customerModel = require('../model/customer.model')
  const applicantModel = require('../model/applicant.model')
  const coApplicantModel = require('../model/co-Applicant.model')
  const guarantorModel = require('../model/guarantorDetail.model')
  const newBrnachModel = require('../model/adminMaster/newBranch.model')
  const uploadToSpaces = require("../services/spaces.service")
  const fs = require("fs");
  const moment = require("moment");





async function fetchImageBuffer(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    // Check if image has transparency (PNG or WebP format)
    const metadata = await sharp(imageBuffer).metadata();
    const hasAlpha = metadata.hasAlpha || imageUrl.toLowerCase().includes('.png') || imageUrl.toLowerCase().includes('.webp');

    // Process image with appropriate settings to preserve transparency
    if (hasAlpha) {
      return await sharp(imageBuffer)
        .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80 }) // Use PNG for transparent images
        .toBuffer();
    } else {
      return await sharp(imageBuffer)
        .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true, background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .toBuffer();
    }
  } catch (error) {
    console.error(`Error fetching/compressing image from ${imageUrl}:`, error.message);
    return null;
  }
}


// Function to validate image URL
function isValidImageUrl(url) {
  if (!url) return false;
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const urlLower = url.toLowerCase();
  return validImageExtensions.some(ext => urlLower.includes(ext));
}

// Function to safely process image
async function safelyProcessImage(doc, imageUrl, xOffset, yOffset, options) {
  try {
    if (!imageUrl || !isValidImageUrl(imageUrl)) {
      return false;
    }

    const imageBuffer = await fetchImageBuffer(imageUrl);
    if (!imageBuffer) {
      return false;
    }

    doc.image(imageBuffer, xOffset, yOffset, options);
    return true;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error.message);
    return false;
  }
}


async function generatePdfWithAllData(res, customerId) {
    try {
      // Data fetching section
      const pdType = 'creditPd';
      const customerCibilDetail = await cibilDetailModel.findOne({ customerId: customerId });
      const data = await pdModel.findOne({ customerId });
      const employeeData = await employeeModel.findById(data?.pdId);
      const designationDetail = await designationModel.findById(employeeData?.designationId)
      
      const customerBranch = await newBrnachModel.findById(employeeData?.branchId).select('name');
      const applicantFormDetail = await applicantModel.findOne({ customerId: customerId });
      const coApplicantFormDetail = await coApplicantModel.find({ customerId: customerId });
      const gurantorFormDetail = await guarantorModel.findOne({ customerId: customerId });
      
      const customerAllDetails = await customerModel.aggregate([
        { $match: { _id: new ObjectId(customerId) } },
        {
          $lookup: {
            from: "applicantdetails",
            localField: "_id",
            foreignField: "customerId",
            as: "applicantDetail"
          }
        },
        {
          $project: {
            "applicantDetail.__v": 0, "applicantDetail.updatedAt": 0, "applicantDetail.status": 0, "applicantDetail.remarkMessage": 0,
            "applicantDetail.createdAt": 0, "applicantDetail._id": 0, "applicantDetail.customerId": 0, "applicantDetail.employeId": 0,
          },
        },
        {
          $lookup: {
            from: "coapplicantdetails",
            localField: "_id",
            foreignField: "customerId",
            as: "coapplicantdetail"
          }
        },
        {
          $project: {
            "coapplicantdetail.__v": 0, "coapplicantdetail.updatedAt": 0, "coapplicantdetail.status": 0, "coapplicantdetail.remarkMessage": 0,
            "coapplicantdetail.createdAt": 0, "coapplicantdetail._id": 0, "coapplicantdetail.customerId": 0, "coapplicantdetail.employeId": 0,
          },
        },
        {
          $lookup: {
            from: "guarantordetails",
            localField: "_id",
            foreignField: "customerId",
            as: "guarantordetail"
          }
        },
        {
          $project: {
            "guarantordetail.__v": 0, "guarantordetail.updatedAt": 0, "guarantordetail.status": 0, "guarantordetail.remarkMessage": 0,
            "guarantordetail.createdAt": 0, "guarantordetail._id": 0, "guarantordetail.customerId": 0, "guarantordetail.employeId": 0,
          },
        },
      ])
      
      const formattedDate = moment(customerAllDetails[0].createdAt).format('YYYY-MM-DDTHH:mm:ss A');

      // Setup PDF generation
      const font = 'assets/font/Cambria.ttf';
      const fontBold = 'assets/font/Cambria-Bold.ttf';
  
      // Direct path handling
      const baseDir = `${process.env.PATH_BUCKET}/LOS/`;
      const outputDir = `${baseDir}PDF/`;
  
      // Create directory if doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
  
      // Generate PDF filename
      const timestamp = Date.now();
      const executiveName = customerAllDetails[0].executiveName;
      const customerFinId = customerAllDetails[0].customerFinId;
      const sanitizedExecutiveName = executiveName.replace(/[^a-zA-Z0-9]/g, "-");
      const pdfFilename = `${sanitizedExecutiveName}-${customerFinId}-${timestamp}.pdf`;
  
      // Setup streams for PDF generation
      const bufferStream = new stream.PassThrough();
      // const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        compress: true, // Enable PDF compression
        pdfVersion: '1.7',
      });
  
      // Pipe document to both buffer stream and file
      doc.pipe(bufferStream);
  
  
      // Special function for logo to ensure transparency is preserved
      async function addLogoToPDF(doc, imageUrl, xCenter, imageWidth) {
        try {
          // Fetch the image as a buffer
          const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
          const imageBuffer = Buffer.from(response.data, "binary");
  
          // Process logo specifically to preserve transparency
          const processedLogo = await sharp(imageBuffer)
            .resize({ width: imageWidth, fit: 'inside', withoutEnlargement: true })
            .png({ quality: 100 }) // Use higher quality for the logo
            .toBuffer();
  
          // Add the processed image to the PDF
          doc.image(processedLogo, xCenter, 50, { width: imageWidth });
        } catch (error) {
          console.error("❌ Error loading logo:", error.message);
        }
      }
  
      // Define PDF properties
      const pageWidth = 595.28;
      const imageWidth = 150;
      const xCenter = (pageWidth - imageWidth) / 1.15;
      // Logo URL
      const pdfLogo = "https://cdn.fincooper.in/PROD/LOS/IMAGE/1738241040517_FINCOOPERSLOGO.png";
      // Call the function to add logo (ensure doc is already initialized)
      await addLogoToPDF(doc, pdfLogo, xCenter, imageWidth);
  
  
  
      // Header
      doc.moveDown(2.3);
      doc.fontSize(15).font(fontBold).text(`CUSTOMER INTERNAL VERIFICATION REPORT (ALL DATA)`, { align: 'center' });
      doc.moveDown(0.5);
  
      // Function to draw section header
      function drawSectionHeader(title) {
        const pageWidth = doc.page.width;
        const titleWidth = doc.widthOfString(title.toUpperCase())
        const columnWidth = 480;
        const xOffset = (pageWidth - columnWidth) / 2;
        const xCenter = (pageWidth - titleWidth) / 2;
  
        doc
          .rect(xOffset, doc.y, columnWidth, 20)
          .fillAndStroke('#00a7ff', '#a2a6a3')
          .fillColor('#000000')
          .font(fontBold)
          .fontSize(12)
          .text(title.toUpperCase(), xCenter, doc.y + 5);
        doc.moveDown(1);
      }
  
      // Function to calculate text height
      function calculateTextHeight(text, width, fontSize) {
        // Set font size for measurement
        doc.fontSize(fontSize);
  
        // Calculate height needed for the text
        const textOptions = {
          width: width - 10, // Subtract padding
          align: 'left'
        };
  
        return doc.heightOfString(text, textOptions);
      }
  
      // Function to draw row
      function drawRow(key, value, yPosition, cellHeight) {
        const pageWidth = doc.page.width;
        const keyWidth = 180;
        const valueWidth = 300;
        const fontSize = 7.2;
        const padding = 5;
  
        // Calculate x-center offset to center the whole row
        const xOffset = (pageWidth - (keyWidth + valueWidth)) / 2;
  
        // Calculate required height for both key and value text
        const keyHeight = calculateTextHeight(key.toUpperCase(), keyWidth, fontSize);
        const valueHeight = calculateTextHeight(value, valueWidth, fontSize);
  
        // Use the larger of the two heights, or the minimum cell height
        const actualCellHeight = Math.max(cellHeight, keyHeight + (padding * 2), valueHeight + (padding * 2));
  
        // Calculate vertical centering offsets
        const keyYOffset = (actualCellHeight - keyHeight) / 2;
        const valueYOffset = (actualCellHeight - valueHeight) / 2;
  
        // Draw key cell
        doc
          .rect(xOffset, yPosition, keyWidth, actualCellHeight)
          .stroke()
          .font(font)
          .fillColor('#000000')
          .fontSize(fontSize);
  
        // Draw key text with vertical centering
        doc.text(
          key.toUpperCase(),
          xOffset + padding,
          yPosition + keyYOffset,
          {
            width: keyWidth - (padding * 2),
            align: 'left'
          }
        );
  
        // Draw value cell
        doc
          .rect(xOffset + keyWidth, yPosition, valueWidth, actualCellHeight)
          .stroke()
          .font(font)
          .fillColor('#000000')
          .fontSize(fontSize);
  
        // Draw value text with vertical centering
        doc.text(
          value,
          xOffset + keyWidth + padding,
          yPosition + valueYOffset,
          {
            width: valueWidth - (padding * 2),
            align: 'left'
          }
        );
  
        return actualCellHeight;
      }
  
  
      //     const pageHeight = doc.page.height;
  
  
      const bottomMargin = 90;
  
  
  
      // Function to add section
      function addSection(title, contentArray) {
        const minCellHeight = 20;
        const pageHeight = doc.page.height;
        let yPosition = doc.y + 20;
        let isFirstPage = true;
  
        // Draw the section header only on the first page
        if (isFirstPage) {
          const currentYPosition = doc.y;
          const bottomMarginTitle = 120;
          if (currentYPosition + minCellHeight > pageHeight - bottomMarginTitle) {
            addFooter();
            doc.addPage();
            yPosition = doc.y + 20;
          }
          drawSectionHeader(title);
          isFirstPage = false;
        }
  
        contentArray.forEach(([key, value]) => {
          // Pre-calculate the cell height needed for this row
          const pageWidth = doc.page.width;
          const keyWidth = 180;
          const valueWidth = 300;
          const fontSize = 7.2;
          const padding = 5;
  
          const keyHeight = calculateTextHeight(key.toUpperCase(), keyWidth, fontSize);
          const valueHeight = calculateTextHeight(value, valueWidth, fontSize);
          const requiredCellHeight = Math.max(minCellHeight, keyHeight + (padding * 2), valueHeight + (padding * 2));
  
          // Check if we need a new page
          if (yPosition + requiredCellHeight > pageHeight - bottomMargin) {
            addFooter();
            doc.addPage();
            yPosition = doc.y + 20;
  
            if (isFirstPage) {
              drawSectionHeader(title);
              isFirstPage = false;
            }
          }
  
          // Draw the row and get the actual height used
          const actualCellHeight = drawRow(key, value, yPosition, minCellHeight);
          yPosition += actualCellHeight;
        });
  
        doc.moveDown(1.5);
      }
  
      // Function to add footer
      function addFooter() {
        const pageWidth = doc.page.margins.left;
        const pageHeight = doc.page.height;
  
        doc.font(fontBold).fontSize(6.3).fillColor("#324e98").text('Fin Coopers Capital PVT LTD', pageWidth, pageHeight - 80, { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('Registered Office Address: 174/3, Nehru Nagar, Indore-452011 (M.P.)', { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('CIN: 67120MP1994PTC008686', { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('Mobile No: +91 7374911911 E-mail: info@fincoopers.com', { align: 'center' });
      }
  
  
      const applicantData = [
        [customerAllDetails[0]?.customerFinId || ''],
        [customerAllDetails[0]?.applicantDetail[0]?.fullName || ' '],
        [customerAllDetails[0]?.applicantDetail[0]?.fatherName || ' '],
        [customerAllDetails[0]?.applicantDetail[0]?.motherName || ' '],
        [customerAllDetails[0]?.applicantDetail[0]?.spouseName || ' '],
        [customerAllDetails[0]?.applicantDetail[0]?.mobileNo || ' '],
        ['self'],
        [customerAllDetails[0]?.applicantDetail[0]?.dob || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.email || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.houseLandMark || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.alternateMobileNo || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.noOfyearsAtCurrentAddress || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.gender || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.religion || 'N/A'],
        ['india'],
        [customerAllDetails[0]?.applicantDetail[0]?.caste || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.maritalStatus || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.education || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.permanentAddress?.addressLine1 || 'N/A'],
        [customerAllDetails[0]?.applicantDetail[0]?.noOfDependentWithCustomer || 'N/A'],

        /////----------------------------------------------------------/////--------------------------------------
        [customerAllDetails[0]?.applicantDetail[0]?.applicantType || ''],
        [customerAllDetails[0]?.applicantDetail[0]?.businessType || ''],
        [customerAllDetails[0]?.applicantDetail[0]?.occupation || ''],
        [customerAllDetails[0]?.applicantDetail[0]?.residenceType || ''],
        [customerAllDetails[0]?.applicantDetail[0]?.category || ''],
        // [customerAllDetails[0]?.applicantDetail[0]?.occupation || ''],
      ];
  
    //   console.log('customerAllDetails[0]?.coapplicantdetail[0]?.dob', customerAllDetails[0]?.coapplicantdetail[0]?.dob)
  
      const coApplicantData = [
        [''],
        [customerAllDetails[0]?.coapplicantdetail[0]?.fullName || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.fatherName || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.motherName || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.spouseName || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.mobileNo || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.relationWithApplicant ? customerAllDetails[0]?.coapplicantdetail[0]?.relationWithApplicant : ''],
        [customerAllDetails[0]?.coapplicantdetail[0]?.dob ? customerAllDetails[0]?.coapplicantdetail[0]?.dob : ''],
        [customerAllDetails[0]?.coapplicantdetail[0]?.email || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.houseLandMark || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.alternateMobileNo || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.noOfyearsAtCurrentAddress || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.gender || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.religion || 'N/A'],
        ['india'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.caste || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.maritalStatus || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.education || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.permanentAddress?.addressLine1 || 'N/A'],
        [''],
        [customerAllDetails[0]?.coapplicantdetail[0]?.coApplicantType || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.businessType || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.occupation || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.residenceType || 'N/A'],
        [customerAllDetails[0]?.coapplicantdetail[0]?.category || 'N/A'],
      ];
  
  
      // Main draw table function
      async function drawApplicantTable(doc, applicantData, coApplicantData, applicantImageUrl, coApplicantImageUrl) {
        // Define constants
        const pageWidth = doc.page.width - 50;
        const tableWidth = pageWidth - 95;
        const particularWidth = tableWidth * 0.25;
        const applicantWidth = tableWidth * 0.407;
        const coApplicantWidth = tableWidth * 0.407;
        const minCellHeight = 20;
        const headerHeight = 25;
        const imageSize = 80;
        const borderColor = '#808080';
        const headerColor = '#00b3ff';
        const fontSizeHeader = 10;
        const fontSizeCell = 8;
  
        // Starting position
        let yPosition = doc.y + 20;
  
        // Define particulars array
        const particulars = [
          'FIN NO', 'NAME', 'FATHER NAME', 'MOTHER NAME',
          'SPOUSE/WIFE NAME', 'MOBILE NUMBER', 'RELATION WITH APPLICANT',
          'DATE OF BIRTH', 'EMAIL ID', 'HOUSE LANDMARK',
          'ALTERNATE MOBILE NO', 'NO. OF YEARS AT CURRENT ADDRESS',
          'GENDER', 'RELIGION', 'NATIONALITY', 'CASTE',
          'MARITAL STATUS', 'EDUCATIONAL DETAILS', 'ADDRESS',
          'NO. OF DEPENDENTS WITH CUSTOMER',
          'APPLICANT TYPE' ,
          'BUSINESS TYPE', 'ACCUPATION','RESIDENCE TYPE',
          'CATEGORY',
        ];
  
        // Draw table headers
        const headers = ['Particulars', 'Applicant Details', 'Co-Applicant Details'];
        const columnWidths = [particularWidth, applicantWidth, coApplicantWidth];
        let xPosition = 57;
  
        headers.forEach((header, index) => {
          doc.rect(xPosition, yPosition, columnWidths[index], headerHeight)
            .fill(headerColor);
  
          doc.fillAndStroke('#00a7ff', '#a2a6a3')
            .fillColor('black')
            .font(fontBold)
            .fontSize(fontSizeHeader)
            .text(header, xPosition + 5, yPosition + 7, {
              width: columnWidths[index] - 10,
              align: 'center'
            });
  
          xPosition += columnWidths[index];
        });
  
        yPosition += headerHeight;
  
        // Calculate image positions
        const applicantImageX = 57 + particularWidth + 5;
        const coApplicantImageX = 57 + particularWidth + applicantWidth + 5;
        const imageY = yPosition;
  
        // Function to calculate text height
        function calculateTextHeight(text, width, fontSize) {
          doc.fontSize(fontSize);
          return doc.heightOfString(text, { width });
        }
  
        // Draw data rows
        particulars.forEach((particular, index) => {
          const particularHeight = calculateTextHeight(particular, particularWidth - 10, 7.2);
          const applicantHeight = calculateTextHeight(applicantData[index] || '', applicantWidth - (index < 2 ? imageSize + 10 : 10), 7.2);
          const coApplicantHeight = calculateTextHeight(coApplicantData[index] || '', coApplicantWidth - (index < 2 ? imageSize + 10 : 10), 7.2);
  
          const cellHeight = Math.max(minCellHeight, particularHeight + 10, applicantHeight + 10, coApplicantHeight + 10);
  
          const particularPadding = (cellHeight - particularHeight) / 2;
          const applicantPadding = (cellHeight - applicantHeight) / 2;
          const coApplicantPadding = (cellHeight - coApplicantHeight) / 2;
  
          // Draw cell borders
          doc.rect(57, yPosition, particularWidth, cellHeight)
            .strokeColor(borderColor)
            .lineWidth(0.5)
            .stroke();
  
          doc.rect(57 + particularWidth, yPosition, applicantWidth, cellHeight)
            .stroke();
  
          doc.rect(57 + particularWidth + applicantWidth, yPosition, coApplicantWidth, cellHeight)
            .stroke();
  
          // Draw cell content
          doc.font(font)
            .fillColor('#000000')
            .fontSize(7.2);
  
          doc.text(particular, 62, yPosition + particularPadding, {
            width: particularWidth - 10
          });
  
          if (applicantData[index]) {
            doc.text(applicantData[index], 57 + particularWidth + 5, yPosition + applicantPadding, {
              width: applicantWidth - (index < 2 ? imageSize + 10 : 10)
            });
          }
  
          if (coApplicantData[index]) {
            doc.text(coApplicantData[index], 57 + particularWidth + applicantWidth + 5, yPosition + coApplicantPadding, {
              width: coApplicantWidth - (index < 2 ? imageSize + 10 : 10)
            });
          }
  
          yPosition += cellHeight;
        });
  
        // Handle images
        try {
          // Process and add applicant image
          if (applicantImageUrl && isValidImageUrl(applicantImageUrl)) {
            const applicantImageBuffer = await fetchImageBuffer(applicantImageUrl);
            if (applicantImageBuffer) {
              doc.image(applicantImageBuffer, applicantImageX + applicantWidth - imageSize - 10, imageY, {
                width: imageSize,
                height: imageSize
              });
            } else {
              doc.fontSize(10)
                .fillColor('red')
                .text('Image Not Available', applicantImageX + applicantWidth - imageSize - 10, imageY, {
                  width: imageSize,
                  align: 'center'
                });
            }
          }
  
          // Process and add co-applicant image
          if (coApplicantImageUrl && isValidImageUrl(coApplicantImageUrl)) {
            const coApplicantImageBuffer = await fetchImageBuffer(coApplicantImageUrl);
            if (coApplicantImageBuffer) {
              doc.image(coApplicantImageBuffer, coApplicantImageX + coApplicantWidth - imageSize - 10, imageY, {
                width: imageSize,
                height: imageSize
              });
            } else {
              doc.fontSize(10)
                .fillColor('red')
                .text('Image Not Available', coApplicantImageX + coApplicantWidth - imageSize - 10, imageY, {
                  width: imageSize,
                  align: 'center'
                });
            }
          }
        } catch (error) {
          console.error('Error processing images:', error);
          doc.fontSize(10)
            .fillColor('red')
            .text('Error Loading Images', applicantImageX + 5, imageY);
        }
  
        return yPosition;
      }
  
      // Call the function with your data
      await drawApplicantTable(
        doc,
        applicantData,
        coApplicantData,
        data.applicantImage,
        data.coApplicantImage?.[0]
      );
  
  
  
  
      doc.moveDown(3);
  
      const agricultureBusinessDetails = [];
      const MilkBusinessDetails = [];
      const incomeSourceDetails = [];
      const otherIncomeDetails = [];
  

      const cibilAnalysisData = [
        ['reason of dpd', data?.cibilAnalysis?.reasonforDPD || 'N/A'],
        ['details Of Current Loans', data?.cibilAnalysis?.detailsOfCurrentLoans || 'N/A'],
        ['Total Loans', data?.cibilAnalysis?.TotalLoans || 'N/A'],
        ['pd Reply To Cibil Remarks', data?.pdReplyToCibilRemarks  || 'N/A'],
      ];
  
      addSection('Cibil Analysis', cibilAnalysisData)
  


      data.incomeSource.forEach((source) => {
        if (source.incomeSourceType === 'agricultureBusiness') {
          agricultureBusinessDetails.push(
            ['Agri Land Details', 'YES'],
            ['Name Of Agri Owner', (Array.isArray(source.agricultureBusiness?.nameOfAgriOwner) && source.agricultureBusiness?.nameOfAgriOwner.length > 0)
              ? source.agricultureBusiness?.nameOfAgriOwner.join(', ')
              : 'N/A'
            ],
            ['Relation With Applicant', source.agricultureBusiness?.relationOfApplicant || 'N/A'],
            // ['KHASRA SURVEY NO', source.agricultureBusiness?.kasraSurveyNo || 'N/A'],
            ['Agri Land In (ACRE)', source.agricultureBusiness?.agriLandInBigha || 'N/A'],
            ['Agriculture Doing From (No. of Years)', source.agricultureBusiness?.agriDoingFromNoOfYears || 'N/A'],
            ['Address As Per Pawti', source.agricultureBusiness?.addressAsPerPawti || 'N/A'],
            // ['Village Name', source.agricultureBusiness?.villageName || 'N/A'],
            ['Agri Land Survey No', source.agricultureBusiness?.agriLandSurveyNo || 'N/A'],
            ['How much corp sold (In Amt)', source.agricultureBusiness?.howmuchcorpsoldInAmt || 'N/A'], // Comma added here
            ['Agri Income Yearly', source.agricultureBusiness?.agriIncomeYearly || 'N/A'],
          );
        }
        if (source.incomeSourceType === 'milkBusiness') {
          MilkBusinessDetails.push(
            ['Number Of Cattrels', source.milkBusiness?.numberOfCattrels || 'N/A'],
            ['No Of Milk Giving Cattles', source.milkBusiness?.noOfMilkGivingCattles || 'N/A'],
            ['Breed Of Cattles',
              Array.isArray(source.milkBusiness?.breedOfCattles) && source.milkBusiness?.breedOfCattles.length > 0
                ? source.milkBusiness?.breedOfCattles.join(', ')
                : 'N/A'
            ],
            ['Total Milk Supply Per Day', source.milkBusiness?.totalMilkSupplyPerDay || 'N/A'],
            ['Name Of Dairy', source.milkBusiness?.nameOfDairy || 'N/A'],
            ['Dairy Owner Mobile Number', source.milkBusiness?.dairyOwnerMobNo || 'N/A'],
            ['Dairy Address', source.milkBusiness?.dairyAddress || 'N/A'],
            ['Milk Provide From Since Year', source.milkBusiness?.milkprovideFromSinceYear || 'N/A'],
            ['Doing From No. Of Years', source.milkBusiness?.doingFromNoOfYears || 'N/A'],
            ['Monthly Income By Milk Business', source.milkBusiness?.monthlyIncomeMilkBusiness || 'N/A'],
  
          );
  
        }
        if (source.incomeSourceType === 'salaryIncome') {
          incomeSourceDetails.push(
            ['company Name', source.salaryIncome?.companyName || 'N/A'],
            ['Address Of Salary Provider', source.salaryIncome?.addressOfSalaryProvider || 'N/A'],
            ['mob NO. Salary Provider', source.salaryIncome?.MobNoOfSalaryProvider || 'N/A'],
            ['Doing From No. Years', source.salaryIncome?.doingFromNoYears || 'N/A'],
            ['Salary Paid Through', source.salaryIncome?.salaryPaidThrouch || 'N/A'],
            ['Monthly Net Salary', source.salaryIncome?.monthlyNetSalary || 'N/A'],
  
          );
        }
  
        if (source.incomeSourceType === 'other') {
          otherIncomeDetails.push(
            ['Nature Of Business', source.other?.natureOfBusiness || 'N/A'],
            ['Monthly Income', source.other?.monthlyIncome || 'N/A'], // Added comma here
            ['yearly Income', source.other?.yearlyIncome || 'N/A'],
            ['discription Of Business', source.other?.discriptionOfBusiness || 'N/A'], // Fixed field name for clarity
            // ['Bussiness From Since Year', source.other?.bussinessFromSinceYear || 'N/A'],
          );
  
        }
      });
  
      if (agricultureBusinessDetails.length > 0) {
        addSection('Agriculture Business Details', agricultureBusinessDetails);
      }
  
      if (MilkBusinessDetails.length > 0) {
        addSection('Milk Business Details', MilkBusinessDetails);
      }
  
  
  
      if (incomeSourceDetails.length > 0) {
        addSection('salary income Details', incomeSourceDetails);
      }
  
      if (otherIncomeDetails.length > 0) {
        addSection('Other Business Details', otherIncomeDetails);
      }
  
      const totalIncomeDetailsData = [
        ['Total Yearly Income', data.totalIncomeDetails?.totalYearlyIncome || 'N/A'],
        ['Total Monthly Income', data.totalIncomeDetails?.totalMonthlyIncome || 'N/A'],
        ['Total Expenses Yearly', data.totalIncomeDetails?.totalExpensesYearly || 'N/A'],
        ['Total Expenses Monthly', data.totalIncomeDetails?.totalExpensesMonthly || 'N/A'],
      ];
  
      addSection('Total Income Details', totalIncomeDetailsData)
  
      let PROPERTYDETAILSCOLLATERAL = [];
  
      PROPERTYDETAILSCOLLATERAL.push(
        ['NAME OF PROPERTY OWNER', data.property?.propertyOwnerName || 'N/A'],
        // ['Father Name', data.property?.fatherName || 'N/A'],
        ['Relation with Applicant', data.property?.relationWithApplicant || 'N/A'],
        ['how Many Floors', data.property?.howManyFloors || 'N/A'],
        ['actual Usage Of Property', data.property?.accommodationDetails?.actualUsageOfProperty || 'N/A'],
  
        ['type Of Structure', data.property?.accommodationDetails?.typeOfStructure || 'N/A'],
        ['availability Of Local Transport', data.property?.collateralsDetails?.availabilityOfLocalTransport || 'N/A'],
  
        ['Electricity and Gas Connection', data.property.accommodationDetails?.electricityAndGasConnection || 'N/A'],
        ['Doors and Windows Availability', data.property?.doorsAndWindowsAreAvailable || 'N/A'],
        ['Kitchen and Lat Bath Availability', data.property?.kitchenAndLatBathAvailable || 'N/A'],
        ['Surrounding  Area development %', data.property?.accommodationDetails?.developmentOfSurroundingArea || 'N/A'],
        ['Maintenance of the Property', data.property?.MaintenanceOfTheProperty || 'N/A'],
        ['Class of Locality', data.property.collateralsDetails?.classOfLocality || 'N/A'],
        ['Status of the Land/Flat', data.property.collateralsDetails?.statusOfTheLandFlat || 'N/A'],
      );
      addSection('PROPERTY DETAILS', PROPERTYDETAILSCOLLATERAL);
  
  
  
      const assetDetailData = [];
  
      // Add header for reference details
      (data.assetDetails || []).forEach((assetDetail, index) => {
        const assetIndex = index + 1; // Use 1-based index for reference details
        assetDetailData.push([`Asset Name - ${assetIndex}`, assetDetail.name || 'N/A']);
        assetDetailData.push([`ASSET PARCHASE value - ${assetIndex}`, assetDetail.purchaseValue || 'N/A']);
        assetDetailData.push([`ASSET MARKET VALUE - ${assetIndex}`, assetDetail.marketValue || 'N/A']);
      });
  
      assetDetailData.push(
        ['Total Purchase Value', data.total?.totalPurchaseValue || 'N/A'],
        ['Total Market Value', data.total?.totalMarketValue || 'N/A']
      );
  
      addSection('ASSET DETAIL', assetDetailData);
  
  
      const referenceData = [];
  
      // Add header for reference details
      (data.referenceDetails || []).forEach((reference, index) => {
        const referenceIndex = index + 1; // Use 1-based index for reference details
  
        referenceData.push([`Reference - ${referenceIndex} Name`, reference.name || 'N/A']);
        referenceData.push([`Reference - ${referenceIndex} Address`, reference.address || 'N/A']);
        referenceData.push([`Reference - ${referenceIndex} Relation`, reference.relation || 'N/A']);
        referenceData.push([`Reference - ${referenceIndex} Mobile Number`, reference.mobileNumber || 'N/A']);
      });
  
      // Call addSection or a similar function to add this data to your PDF
      addSection('Reference Details', referenceData);
  
      const policeStation = [
        ['Station Name', data.policeStation?.staionName || 'N/A'],
        ['Station Address', data.policeStation?.stationAdress || 'N/A']
      ]
      addSection('Police Station Details', policeStation)
  
  
      const loanRequirementDetailsData = [];
      loanRequirementDetailsData.push(
        ['Loan Amount Demanded by Customer', data.approveLoanDetails?.demandLoanAmountByCustomer || 'N/A'],
        ['EMI Amount Comfort', data.approveLoanDetails?.EMI || 'N/A'],
        ['Loan Tenure Comfort', data.approveLoanDetails?.Tenure || 'N/A'],
        ['End Use of Loan', data.approveLoanDetails?.endUseOfLoan || 'N/A'],
        ['Eligible Loan Amount', data.approveLoanDetails?.approvedAmount || 'N/A'],
        ['Final Decision', data.approveLoanDetails?.finalDecision || 'N/A'],
        ['PD REMARK', data.remarkByPd || 'N/A']
      );
      addSection('Loan Requirement Details', loanRequirementDetailsData)
  
  
      const employeeDetail = [];
      const formattedUpdate = data?.bdCompleteDate;
      employeeDetail.push(
        ['EMPLOYEE ID', employeeData?.employeUniqueId || ''],
        ['DONE BY', employeeData?.employeName.toUpperCase() || ''],
        ['BRANCH NAME', customerBranch?.name.toUpperCase() || ''],
        ['DATE OF PD', formattedUpdate]
      );
  
      addSection('pd Done Detail', employeeDetail);
  
  
      // Process images function updated for URLs
      function processImages(data) {
        const allImages = [];
  
        const addImageIfExists = (key, label) => {
          if (data[key]) {
            const imageUrl = data[key];
            allImages.push({
              imageUrl,
              label: `${label} \n\n`
            });
          }
        };
  
        const imageKeys = [
          'selfiWithCustomer',
          'photoWithLatLong',
          'rightSide',
          'mainRoad',
          'latLongPhoto',
          'landmarkPhoto',
          'SSSMPhoto',
          'gasDiaryPhoto',
          'electricityBillPhoto',
          'meterPhoto',
          'udyamCertificate'
        ];
  
        const imageLabels = [
          'Selfie With Customer',
          'Photo With Lat Long',
          'Right Side',
          'Main Road',
          'Lat Long Photo',
          'Landmark Photo',
          'Samagra Photo',
          'Gas Diary Photo',
          'Electricity Bill Photo',
          'Meter Photo',
          'Udyam Certificate'
        ];
  
        imageKeys.forEach((key, index) => {
          addImageIfExists(key, imageLabels[index]);
        });
  
        return allImages;
      }
  
  
  
  
  
  
  
  
      // Updated function to process agriculture images
      function processAgricultureImages(data) {
        const cdnBaseUrl = 'https://cdn.fincooper.in/STAGE/LOS/IMAGE/';
  
  
        const imageCollections = {
          agricultureImages: [],
          agricultureLandImages: [],
          propertyOtherImages: [],
          workImages: [],
          houseInsideImages: [],
          milkImages: [],
          animalImages: [],
          salaryImages: [],
          last3MonthSalarySlipImage: [],
          familyMemberImages: [],
          incomeOtherImages: []
        };
  
        // Helper function to process image arrays
        const addImages = (photos, collection) => {
          if (!photos) return;
  
          photos.forEach(photo => {
            if (photo) {
              collection.push({
                imageUrl: photo // Directly use the given image URL
              });
            }
          });
        };
  
        // Process income sources
        if (data.incomeSource) {
          data.incomeSource.forEach(source => {
            addImages(source.agricultureBusiness?.agriculturePhotos, imageCollections.agricultureImages);
            addImages(source.agricultureBusiness?.agricultureLandImage, imageCollections.agricultureLandImages);
            addImages(source.milkBusiness?.milkPhotos, imageCollections.milkImages);
            addImages(source.milkBusiness?.animalPhotos, imageCollections.animalImages);
            addImages(source.salaryIncome?.salaryPhotos, imageCollections.salaryImages);
            addImages(source.other?.incomeOtherImages, imageCollections.incomeOtherImages);
          });
        }
  
        // Process other image categories
        addImages(data.familyMemberPhotos, imageCollections.familyMemberImages);
        addImages(data.propertyOtherPhotos, imageCollections.propertyOtherImages);
        addImages(data.workPhotos, imageCollections.workImages);
        addImages(data.houseInsidePhoto, imageCollections.houseInsideImages);
  
        return imageCollections;
      }
  
      // Updated function to add image grid
      async function addImageGrid(doc, images, columnsPerRow, spacing) {
        const imageWidth = 150;
        const imageHeight = 100;
        // const imageWidth = 120; // Reduced from 150
        // const imageHeight = 80; // Reduced from 100
        const imageSpacingX = 20;
        const imageSpacingY = 10;
  
        let xOffset = doc.page.margins.left;
        let yOffset = doc.y + spacing;
        let validImageCount = 0;
  
        for (const image of images) {
          try {
            if (!image.imageUrl || !isValidImageUrl(image.imageUrl)) {
              continue;
            }
  
            const columnIndex = validImageCount % columnsPerRow;
            xOffset = doc.page.margins.left + (imageWidth + imageSpacingX) * columnIndex;
  
            if (validImageCount > 0 && columnIndex === 0) {
              yOffset += imageHeight + imageSpacingY;
            }
  
            if (yOffset + imageHeight > doc.page.height - doc.page.margins.bottom) {
              doc.addPage();
              yOffset = doc.page.margins.top + spacing;
            }
  
            const success = await safelyProcessImage(doc, image.imageUrl, xOffset, yOffset, {
              width: imageWidth,
              height: imageHeight,
            });
  
            if (success) {
              validImageCount++;
            }
          } catch (error) {
            console.error(`Error processing image ${image.imageUrl}:`, error.message);
          }
        }
  
        return yOffset + imageHeight + spacing;
      }
  
      // Updated function to add images with heading
      async function addImagesWithHeading(doc, heading, images, columnsPerRow, spacing) {
        try {
          const validImages = images.filter(image =>
            image && image.imageUrl && isValidImageUrl(image.imageUrl)
          );
  
          if (validImages.length > 0) {
            const headingWidth = doc.widthOfString(heading);
            const centerX = (doc.page.width - doc.page.margins.left - doc.page.margins.right - headingWidth) / 2 + doc.page.margins.left;
  
            doc.moveDown(-1);
            doc.fontSize(12).text(heading, centerX, doc.y, {
              align: 'left',
              underline: true,
            });
            doc.moveDown(-4);
  
            doc.y = await addImageGrid(doc, validImages, columnsPerRow, spacing);
          }
        } catch (error) {
          console.log(`Error in addImagesWithHeading for ${heading}:`, error.message);
        }
      }
  
      // Process and add all images
      const allImages = processImages(data);
  
  
  
      if (allImages.length > 0) {
        doc
          .font('Helvetica-Bold') // Set font to bold
          .fontSize(15)
          .text('All Images', { align: 'left' })
          .moveDown(0.5); // Add some spacing below the text
  
        await addImageGrid(doc, allImages, 3, 70);
      }
  
      doc.addPage();
  
      const {
        agricultureImages,
        agricultureLandImages,
        incomeOtherImages,
        milkImages,
        animalImages,
        salaryImages,
        familyMemberImages,
        propertyOtherImages,
        workImages,
        houseInsideImages
      } = processAgricultureImages(data);
  
      // Add all image categories
      await addImagesWithHeading(doc, 'Family Member Images', familyMemberImages, 3, 70);
      await addImagesWithHeading(doc, 'Agriculture Images', agricultureImages, 3, 70);
      await addImagesWithHeading(doc, 'Agriculture Land Images', agricultureLandImages, 3, 70);
      await addImagesWithHeading(doc, 'Milk Images', milkImages, 3, 70);
      await addImagesWithHeading(doc, 'Income Other Images', incomeOtherImages, 3, 70);
      await addImagesWithHeading(doc, 'Animal Images', animalImages, 3, 70);
      await addImagesWithHeading(doc, 'Salary Images', salaryImages, 3, 70);
      await addImagesWithHeading(doc, 'Property Photos', propertyOtherImages, 3, 70);
      await addImagesWithHeading(doc, 'Work Images', workImages, 3, 70);
      await addImagesWithHeading(doc, 'House Inside Images', houseInsideImages, 3, 70);
  
      // Finalize PDF
      doc.end();
  
  
      // Collect chunks from buffer stream
      const chunks = [];
      for await (const chunk of bufferStream) {
        chunks.push(chunk);
      }
  
      // Create buffer from chunks
      const pdfBuffer = Buffer.concat(chunks);
  
      // Define bucket parameters
      const bucketName = 'finexe'; // Your bucket name
      const pdfPath = `${process.env.PATH_BUCKET}/LOS/PDF/${pdfFilename}`; // Path in bucket
      // const contentType = req.file.mimetype;
      // Upload PDF to spaces (Digital Ocean/S3)
      const da = await uploadToSpaces(bucketName, pdfPath, pdfBuffer, 'public-read', 'application/pdf');
  
      // Return the CDN URL
      const fileUrl = `https://cdn.fincooper.in/${pdfPath}`;
      console.log('✅ PDF generated successfully:', fileUrl);
      return { pdReport: fileUrl };
  
      // return { pdReport: fileUrl };
  
    } catch (error) {
      console.error(error);
      return unknownError(res, error);
    }
  }


module.exports  = { generatePdfWithAllData }
