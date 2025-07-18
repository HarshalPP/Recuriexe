import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import uploadToSpaces from "../../services/spaceservices/space.service.js"

export async function generatePdfFromHtml(htmlContent, req) {
  let browser

  try {
    // Launch Puppeteer with optimized settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    })

    const page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 })

    // Set content and wait for all resources to load
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    })

    // Replace waitForTimeout with a Promise-based delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Ensure directory exists
    const pdfDir = path.join(process.cwd(), "pdf")
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true })
    }

    // Define PDF Path with unique name
    const timestamp = Date.now()
    const fileName = `verification_report_${timestamp}.pdf`
    const pdfPath = path.join(pdfDir, fileName)

    // Generate PDF with enhanced settings
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0.5cm",
        right: "0.5cm",
        bottom: "0.5cm",
        left: "0.5cm",
      },
      displayHeaderFooter: false,
    })

    await browser.close()

    // Read the generated PDF file
    const fileContent = fs.readFileSync(pdfPath)

    // Upload to cloud storage
    const userId = req.user?.serviceId || req.employee?.id || "unknown"
    const contentType = "application/pdf"

    const userFolderPath = `${process.env.PATH_BUCKET}/vendor_management/${userId}`
    const filePathInBucket = `${userFolderPath}/reports/${fileName}`

    const bucketName = "vendor"

    // Upload the file
    const uploadResult = await uploadToSpaces(bucketName, filePathInBucket, fileContent, "public-read", contentType, {
      "Content-Disposition": "inline",
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
    })

    // Clean up the local PDF file
    fs.unlinkSync(pdfPath)

    return {
      report: `https://tech-cdn.fincooper.in/${filePathInBucket}`,
      fileName: fileName,
      fileSize: fileContent.length,
      uploadResult: uploadResult,
    }
  } catch (error) {
    console.error("Error generating PDF:", error)

    // Ensure browser is closed even if there's an error
    if (browser) {
      await browser.close()
    }

    throw new Error(`PDF generation failed: ${error.message}`)
  }
}
