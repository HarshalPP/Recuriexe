import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { returnFormatter } from "../../formatters/common.formatter.js";
import mongoose from "mongoose";
import uploadToSpaces from "../../services/commandServices/uploadToSpace.service.js";
import htmlDocx from "html-docx-js"; 
import OrganizationModel from "../../models/organizationModel/organization.model.js";
import reportTemplateModel from "../../models/reportTemplateModel/reportTemplate.model.js";
import reportCaseModel from "../../models/reportinitModel/reportInitt.model.js";



//--------------------------------------------- accordong to sir ------------------------------------------------



export async function generatePdfFunc(req, res) {
  try {
    // 1️⃣ Fetch template
    const template = await reportTemplateModel.findById(req.body.tempId);
    if (!template) {
      return returnFormatter(false, "Template not found");
    }

    // 2️⃣ Fetch init data
    const initData = await reportCaseModel.findById(req.body.caseId).populate([
      { path: "reportTypeId", model: "reportType" },
      { path: "doneBy", model: "employee" },
      { path: "formValues.fieldId", model: "inputField" }
    ]);
    
    if (!initData) {
      return returnFormatter(true, "No init data found", []);
    }

    const jobInit = initData;
    const serviceId = new mongoose.Types.ObjectId(req.employee.organizationId);

    // 4️⃣ Fetch organization data
    const organizationVendor = await OrganizationModel.findOne({ organizationId: serviceId });

//     // 5️⃣ Merge job data
//     const mergedJobData = {
//       ...jobInit.toObject(),
//       organization: organizationVendor,
//     };
// console.log(m);

    // 6️⃣ Prepare placeholders
    const placeholders = {};
    const fieldCategories = [{ fields: jobInit.formValues || [] }];

fieldCategories.forEach(category => {
  category.fields.forEach(field => {
    const label = field?.fieldId?.label;
    if (label) {
      const key = `{${label}}`;

      // Handle value array and fallback to "N/A"
      const rawVal = Array.isArray(field.value) ? field.value[0] : field.value;
      const val = rawVal !== undefined && rawVal !== null ? rawVal : "N/A";

      placeholders[key] = val;
    }
  });
});


    // 7️⃣ Replace placeholders in HTML
    let html = template.htmlContent;

    const isImageUrl = (url) => {
      return typeof url === 'string' && /\.(jpeg|jpg|png|gif|bmp|webp|svg)$/i.test(url);
    };

    for (const [placeholder, value] of Object.entries(placeholders)) {
      let processedValue = value;

      if (Array.isArray(value)) {
        processedValue = value.map(val => {
          if (typeof val === "string" && val.includes("\n")) {
            return val
              .split("\n")
              .map(line => line.trim())
              .filter(Boolean)
              .join("<br/>");
          } else if (isImageUrl(val)) {
            return `<img src="${val}" style="width:100px;height:auto;max-height:100px;object-fit:contain;margin:2px;" alt="Image" />`;
          }
          return val;
        }).join("<br/>");
      } else if (typeof value === "string" && value.includes("\n")) {
        processedValue = value
          .split("\n")
          .map(line => line.trim())
          .filter(Boolean)
          .join("<br/>");
      } else if (isImageUrl(value)) {
        processedValue = `<img src="${value}" style="width:100px;height:auto;max-height:100px;object-fit:contain;" alt="Image" />`;
      }

      html = html.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), processedValue);
    }

    // 9️⃣ Replace additional known placeholders
    html = html.replace(/{doneBy}/g, jobInit?.doneBy?.basicDetails?.fullName || '');

    // 🔟 Generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfDir = path.join(process.cwd(), "pdf");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const timestamp = Date.now();
    const fileName = `${timestamp}.pdf`;
    const pdfPath = path.join(pdfDir, fileName);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    // 1️⃣1️⃣ Generate Word docx
    const wordFileName = `${timestamp}.docx`;
    const wordPath = path.join(pdfDir, wordFileName);

    const docxBlob = htmlDocx.asBlob(html);
    const docxBuffer = Buffer.from(await docxBlob.arrayBuffer());
    fs.writeFileSync(wordPath, docxBuffer);

    // 1️⃣2️⃣ Upload PDF
    const userId = req.employee.organizationId;
    const pdfContent = fs.readFileSync(pdfPath);
    const pdfFilePathInBucket = `vendor_management/${userId}/documents/${fileName}`;
    await uploadToSpaces('vendor', pdfFilePathInBucket, pdfContent, 'public-read', 'application/pdf', {
      'Content-Disposition': 'inline',
      'Content-Type': 'application/pdf'
    });



    // 1️⃣4️⃣ Clean up local files
    fs.unlinkSync(pdfPath);


    await reportCaseModel.findByIdAndUpdate(req.body.caseId, {
      workStatus: "completed",
      reportStatus: "generated",
      reportDate: new Date(),
      $push: {
        reportUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
      }
    });

    // 1️⃣6️⃣ Return PDF and Word URLs
    return (returnFormatter(true, "PDF and Word files generated and uploaded successfully!", {
      pdfUrl: `https://tech-cdn.fincooper.in/${pdfFilePathInBucket}`,
    }));

  } catch (error) {
    console.error("PDF/Word generation error:", error);
    return res.json(returnFormatter(false, error.message));
  }
}