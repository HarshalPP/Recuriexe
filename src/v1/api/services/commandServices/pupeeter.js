import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import uploadToSpaces from './uploadToSpace.service.js';

export async function generatePdfFromHtml(htmlContent,req) {
    try {
        // Launch headless browser
         // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Ensure directory exists
    const pdfDir = path.join(process.cwd(), "pdf");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // Define PDF Path with unique name to avoid conflicts
    const fileName = `${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, fileName);

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    // Now upload the generated PDF file
    const userId = req.user.serviceId;
    const contentType = 'application/pdf';
    const fileContent = fs.readFileSync(pdfPath);

    // Construct the user-specific folder path
    const userFolderPath = `${process.env.PATH_BUCKET}/vendor_management/${userId}`;
    const filePathInBucket = `${userFolderPath}/documents/${fileName}`;

    // Check if user folder exists in Spaces
    const bucketName = 'vendor';

    // Upload the file
    const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, fileContent, 'public-read', contentType, {
      'Content-Disposition': 'inline',
      'Content-Type': contentType
    });

    // Clean up the local PDF file
    fs.unlinkSync(pdfPath);

    return  {report: `https://tech-cdn.fincooper.in/${filePathInBucket}`}

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
