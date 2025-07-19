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
  const mongoose = require('mongoose')

  //   const vv = require("../../../../../assets/image/FINCOOPERSLOGO.png")
  const pdfLogo = path.join(
    __dirname,
    "../../../../../assets/image/image_1727359738344.file_1727075312891.ratnaafin (1).png"
  );

  const sharp = require('sharp');
  const customerModel = require('../../model/customer.model')
  const coApplicantModel = require('../../model/co-Applicant.model')
  const guarantorModel = require('../../model/guarantorDetail.model')
  const applicantModel = require('../../model/applicant.model')
  const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel')
  const appPdcModel = require('../../model/branchPendency/appPdc.model')
  const creditPdModel = require('../../model/credit.Pd.model')
  const approverFormModel = require("../../model/branchPendency/approverTechnicalFormModel.js")
const { initESign } = require('../../services/legality.services.js')

// const pdfLogo = path.join(
//     __dirname,
//     "../../../../assets/image/FINCOOPERSLOGO.png"
//   );
  const watermarklogo = path.join(
    __dirname,
    "../../../../assets/image/watermarklogo.png"
  );



  async function generateApplicantPdf(allPerameters,pdfLogo) {

    const font = "assets/font/Cambria.ttf"
    const fontBold = "assets/font/Cambria-Bold.ttf"
    const baseDir = path.join("./uploads/");
    const outputDir = path.join(baseDir, "pdf/");

    // Create a document
    // Pipe its output somewhere, like to a file or HTTP response
    // doc.pipe(fs.createWriteStream('output.pdf'));
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const pdfFilename = `applicantLatter.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
    const doc = new PDFDocument({ size: 'A4', margins: { top: 60, left: 50, right: 50, bottom: 50 } });
    // const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
    console.log(pdfPath,"pdfPathpdfPath")
    doc.pipe(stream);

    // Helper function to add a section title
    function addSectionTitle(title) {
        doc.fontSize(10.2).font(fontBold).text(title, { underline: true, align: "left" });
        doc.moveDown(0.5);
    }

    // Helper function to add a field
    function addField(label, value, options = {}) {
        const fontSize = options.fontSize || 8.3;
        const labelWidth = options.labelWidth || 200;
        const labelFontStyle = options.labelFontBold ? fontBold : font;
        const valueFontStyle = options.valueFontBold ? fontBold : font;

        doc.fontSize(fontSize);
        doc.font(labelFontStyle).text(label, { continued: true, width: labelWidth });
        doc.font(valueFontStyle).text(` ${value}`);
    }

    function drawTable(tableTitle, tableData) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500];

        const keyWidth = Math.round(columnWidths[0] * 1 / 3)
        const valueWidth = Math.round(columnWidths[0] * 2 / 3)
        console.log(columnWidths[0], keyWidth, valueWidth);


        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20).fillAndStroke('#00a7ff', "#000000");
        doc.font(fontBold).fillColor('black').fontSize(9.5)
            .text(tableTitle, startX + 5, startY + 5, { baseline: 'hanging' })

        // Reset fill color to white for table rows
        startY += 20;

        // Define table data (replace this with the actual data you want)

        // Render table rows
        tableData.forEach((row, rowIndex) => {
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX, startY, keyWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font)
                .fillColor('black').fontSize(8.3)
                .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging' })
            // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + keyWidth, startY, valueWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font)
                .fillColor('black').fontSize(7.2)
                .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging' })

            // Move to next row position
            startY += 20;
        });

        // Add another section as an example
        // doc.moveDown().fontSize(12).text('Sourcing Details');

        // You can continue adding more tables/sections in a similar fashion


    }
    function drawTableWithHeaderFooter(tableHeader, tableData, tableFooter) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500];

        const keyWidth = Math.round(columnWidths[0] * 1 / 3)
        const valueWidth = Math.round(columnWidths[0] * 2 / 3)
        console.log(columnWidths[0], keyWidth, valueWidth);


        // Set fill color for the header background
        doc.fillColor('#ffffff')
            .rect(startX, startY, (keyWidth * 3), 20)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.font(fontBold)
            .fillColor('black').fontSize(9)
            .text(tableHeader, startX + 5, startY + 5, { baseline: 'hanging', align: 'center' })

        // Reset fill color to white for table rows
        startY += 20;

        // Define table data (replace this with the actual data you want)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            if (rowIndex == 0 || rowIndex == 1 || rowIndex == 5) {
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX, startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

                // Alternate row background color
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX + keyWidth, startY, valueWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: valueWidth })

                // Move to next row position
                startY += 25;
            } else if (rowIndex == 10 || rowIndex == 12) {
                // Alternate row background color
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX, startY, keyWidth, 90)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

                // Alternate row background color
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX + keyWidth, startY, valueWidth, 90)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: valueWidth })

                // Move to next row position
                startY += 90;
            } else {
                // Alternate row background color
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX, startY, keyWidth, 40)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

                // Alternate row background color
                doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                    .rect(startX + keyWidth, startY, valueWidth, 40)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: valueWidth })

                // Move to next row position
                startY += 40;
            }
        });

        // Set fill color for the header background
        doc.fillColor('#ffffff')
            .rect(startX, startY, (keyWidth * 3), 20)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.font(font)
            .fillColor('black').fontSize(7.2)
            .text(tableFooter, startX + 5, startY + 5, { baseline: 'hanging' })
        // Add another section as an example
        // doc.moveDown().fontSize(12).text('Sourcing Details');

        // You can continue adding more tables/sections in a similar fashion


    }

    function drawLoanTypeTable(tableData) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500];

        const keyWidth = Math.round(columnWidths[0] * 1 / 4)


        // Set fill color for the header background
        // Alternate row background color
        doc.fillColor('#ffffff')
            .rect(startX, startY, (keyWidth * 2), 25)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.font(fontBold)
            .fillColor('black').fontSize(8.3)
            .text("UNSECURED", startX + 5, startY + 5, { baseline: 'hanging', align: "center", width: (keyWidth * 2) })

        doc.fillColor('#ffffff')
            .rect(startX + (keyWidth * 2), startY, keyWidth, 25)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.font(fontBold)
            .fillColor('black').fontSize(8.3)
            .text("SECURED", startX + (keyWidth * 2) + 5, startY + 5, { baseline: 'hanging' })


        doc.fillColor('#ffffff')
            .rect(startX + (keyWidth * 3), startY, keyWidth, 25)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.font(fontBold)
            .fillColor('black').fontSize(8.3)
            .text("P&M", startX + (keyWidth * 3) + 5, startY + 5, { baseline: 'hanging' })

        // Reset fill color to white for table rows
        startY += 25;

        // Define table data (replace this with the actual data you want)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            if (rowIndex == 19) {
                addFooter()
                doc.addPage()
                addHeader()
                doc.moveDown()
                startY = doc.y + 10
            }

            if (rowIndex == 4 || rowIndex == 5 || rowIndex == 7 || rowIndex == 9 || rowIndex == 22 || rowIndex == 23 || rowIndex == 25 || rowIndex == 26 || rowIndex == 27 || rowIndex == 28 || rowIndex == 29 || rowIndex == 28 || rowIndex == 31 || rowIndex == 32 || rowIndex == 38) {
                doc.fillColor('#ffffff')
                    .rect(startX, startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })

                // Alternate row background color
                doc.fillColor('#ffffff')
                    .rect(startX + keyWidth, startY, (keyWidth * 3), 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(rowIndex == 7 ? fontBold : font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: (keyWidth * 3) })
            }

            else if (rowIndex == 8 || rowIndex == 12 || rowIndex == 18 || rowIndex == 19 || rowIndex == 39) {
                doc.fillColor('#ffffff')
                    .rect(startX, startY, (keyWidth * 4), 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: (keyWidth * 4), align: 'center' })
            } else if (rowIndex == 20) {
                doc.fillColor('#ffffff')
                    .rect(startX, startY, (keyWidth * 2), 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: (keyWidth * 2) })

                // Alternate row background color
                doc.fillColor('#ffffff')
                    .rect(startX + (keyWidth * 2), startY, (keyWidth * 2), 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + (keyWidth * 2) + 5, startY + 5, { baseline: 'hanging', width: (keyWidth * 2) })
            } else if (rowIndex == 24) {

                doc.fillColor('#ffffff')
                    .rect(startX, startY, keyWidth, 50)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

                // Alternate row background color
                doc.fillColor('#ffffff')
                    .rect(startX + keyWidth, startY, keyWidth, 50)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // Alternate row background color

                doc.fillColor('#ffffff')
                    .rect(startX + (keyWidth * 2), startY, keyWidth, 50)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value2, startX + (keyWidth * 2) + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // Alternate row background color

                doc.fillColor('#ffffff')
                    .rect(startX + (keyWidth * 3), startY, keyWidth, 50)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value3, startX + (keyWidth * 3) + 5, startY + 5, { baseline: 'hanging', width: keyWidth })

                startY += 25;

            } else {
                // Alternate row background color
                doc.fillColor('#ffffff')
                    .rect(startX, startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(fontBold)
                    .fillColor('black').fontSize(7.2)
                    .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

                // Alternate row background color
                doc.fillColor('#ffffff')
                    .rect(startX + keyWidth, startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value1, startX + keyWidth + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // Alternate row background color

                doc.fillColor('#ffffff')
                    .rect(startX + (keyWidth * 2), startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value2, startX + (keyWidth * 2) + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
                // Alternate row background color

                doc.fillColor('#ffffff')
                    .rect(startX + (keyWidth * 3), startY, keyWidth, 25)
                    .stroke()
                    .fill()

                // Draw text in each cell
                doc.font(font)
                    .fillColor('black').fontSize(7.2)
                    .text(row.value3, startX + (keyWidth * 3) + 5, startY + 5, { baseline: 'hanging', width: keyWidth })
            }

            // Move to next row position
            startY += 25;
        });

        // Add another section as an example
        // doc.moveDown().fontSize(12).text('Sourcing Details');

        // You can continue adding more tables/sections in a similar fashion


    }

    function drawTableWithoutTitle(tableData) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;
        const columnWidths = [500];

        const singleColumnWidth = Math.round(columnWidths[0] * 1 / 4)
        const valueWidth = Math.round(columnWidths[0] * 1 / 4)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX, startY, singleColumnWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(fontBold)
                .fillColor('black').fontSize(8.3)
                .text(row.field1, startX + 5, startY + 5, { baseline: 'middle', width: singleColumnWidth })
            // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + singleColumnWidth, startY, valueWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(fontBold)
                .fillColor('black').fontSize(7.2)
                .text(row.value1, startX + singleColumnWidth + 5, startY + 5, { baseline: 'middle', width: singleColumnWidth })
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + (singleColumnWidth * 2), startY, valueWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(fontBold)
                .fillColor('black').fontSize(7.2)
                .text(row.value2, startX + (singleColumnWidth * 2) + 5, startY + 5, { baseline: 'middle', width: singleColumnWidth })
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + (singleColumnWidth * 3), startY, valueWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(fontBold)
                .fillColor('black').fontSize(7.2)
                .text(row.value3, startX + (singleColumnWidth * 3) + 5, startY + 5, { baseline: 'middle', width: singleColumnWidth })


            // Move to next row position
            startY += 20;
        });

        // Add another section as an example
        // doc.moveDown().fontSize(12).text('Sourcing Details');

        // You can continue adding more tables/sections in a similar fashion


    }

    function drawTableWithImage(tableTitle, tableData, imageBuffer1, imageBuffer2) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;

        const columnWidths = [500];

        const nonImageWidth = Math.round(columnWidths[0] * 1 / 4)
        const imageWidth = Math.round(columnWidths[0] * 2 / 4)


        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20).fillAndStroke('#00a7ff', "#000000");
        doc.font(fontBold).fillColor('black').fontSize(9.5)
            .text(tableTitle, startX + 5, startY + 5, { baseline: 'hanging' })

        // Reset fill color to white for table rows
        startY += 20;
        const columnY = startY

        // Define table data (replace this with the actual data you want)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX, startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font).fillColor('black').fontSize(8.3)
                .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging' })
            // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + nonImageWidth, startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font).fillColor('black').fontSize(7.6)
                .text(row.value1, startX + nonImageWidth + 5, startY + 5, { baseline: 'hanging' })

            // Move to next row position
            startY += 20;
        });

        doc.fillColor()
            .rect(startX + imageWidth, columnY, nonImageWidth, 140)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.fillColor('black')
            .image(imageBuffer1, startX + imageWidth + 5, columnY + 5)

        doc.fillColor()
            .rect(startX + imageWidth + nonImageWidth, columnY, nonImageWidth, 140)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.fillColor('black')
            .image(imageBuffer2, startX + imageWidth + nonImageWidth + 5, columnY + 5)
        // Add another section as an example
        // doc.moveDown().fontSize(12).text('Sourcing Details');

        // You can continue adding more tables/sections in a similar fashion


    }

    function drawTableWithSingleImage(tableTitle, tableData, imageBuffer1) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;

        const columnWidths = [500];

        const nonImageWidth = Math.round(columnWidths[0] * 1 / 4)
        const imageWidth = Math.round(columnWidths[0] * 2 / 4)


        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20).fillAndStroke('#00a7ff', "#000000");
        doc.font(fontBold).fillColor('black').fontSize(9.5)
            .text(tableTitle, startX + 5, startY + 5, { baseline: 'hanging' })

        // Reset fill color to white for table rows
        startY += 20;
        const columnY = startY

        // Define table data (replace this with the actual data you want)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX, startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font).fillColor('black').fontSize(8.3)
                .text(row.field1, startX + 5, startY + 5, { baseline: 'hanging' })
            // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + nonImageWidth, startY, (nonImageWidth * 2), 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font).fillColor('black').fontSize(7.6)
                .text(row.value1, startX + nonImageWidth + 5, startY + 5, { baseline: 'hanging' })

            // Move to next row position
            startY += 20;
        });

        doc.fillColor()
            .rect(startX + (nonImageWidth * 3), columnY, nonImageWidth, 140)
            .stroke()
            .fill()

        // Draw text in each cell
        doc.fillColor('black')
            .image(imageBuffer1, startX + (nonImageWidth * 3) + 5, columnY + 5)

    }

    function drawTableWithDifferentWidthSize(tableTitle, tableSubTitle, tableData, tableSubFooter, tableFooter) {


        // Add Table Header
        const startX = 50;
        let startY = doc.y + 10;

        const columnWidths = [500];

        const nonImageWidth = Math.round(columnWidths[0] * 1 / 4)
        const imageWidth = Math.round(columnWidths[0] * 2 / 4)


        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20).stroke("#000000");
        doc.font(fontBold).fillColor('black').fontSize(7)
            .text(tableTitle, startX + 5, startY + 5, { align: 'center' })

        // Reset fill color to white for table rows
        startY += 20;
        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 20).stroke("#000000");
        doc.font(font).fillColor('black').fontSize(7)
            .text(tableSubTitle, startX + 5, startY + 5)

        // Reset fill color to white for table rows
        startY += 20;
        const columnY = startY

        // Define table data (replace this with the actual data you want)


        // Render table rows
        tableData.forEach((row, rowIndex) => {
            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX, startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(font).fillColor('black').fontSize(7)
                .text(row.field1, startX + 5, startY + 5, { width: nonImageWidth, baseline: 'hanging' })
            // .text(row.value1, startX + columnWidths[0] + 5, startY + 5)

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + nonImageWidth, startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(rowIndex == 0 ? fontBold : font).fillColor('black').fontSize(7.6)
                .text(row.value1, startX + nonImageWidth + 5, startY + 5, { baseline: 'hanging' })

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + (nonImageWidth * 2), startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(rowIndex == 0 ? fontBold : font).fillColor('black').fontSize(7.6)
                .text(row.value2, startX + (nonImageWidth * 2) + 5, startY + 5, { baseline: 'hanging' })

            // Alternate row background color
            doc.fillColor(rowIndex % 2 === 0 ? '#f5f5f5' : '#ffffff')
                .rect(startX + (nonImageWidth * 3), startY, nonImageWidth, 20)
                .stroke()
                .fill()

            // Draw text in each cell
            doc.font(rowIndex == 0 ? fontBold : font).fillColor('black').fontSize(7)
                .text(row.value3, startX + (nonImageWidth * 3) + 5, startY + 5, { baseline: 'hanging' })

            // Move to next row position
            startY += 20;
        });

        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 30).stroke("#000000");
        doc.font(font).fillColor('black').fontSize(7)
            .text(tableSubFooter, startX + 5, startY + 5)

        // Reset fill color to white for table rows
        startY += 30;
        // Set fill color for the header background
        doc.rect(startX, startY, columnWidths.reduce((a, b) => a + b), 30).stroke("#000000");
        doc.font(font).fillColor('black').fontSize(7)
            .text(tableFooter, startX + 5, startY + 5)

        // Reset fill color to white for table rows
        startY += 30;


    }

    function addFooter() {
        const pageWidth = doc.page.margins.left;
        const pageHeight = doc.page.height;

        doc.font(fontBold).fontSize(6.3).fillColor("#00a7ff").text('Fin Coopers Capital PVT LTD', pageWidth, pageHeight - 80, { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('Registered Office Address: 174/3, Nehru Nagar, Indore-452011 (M.P.)', { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('CIN: 67120MP1994PTC008686', { align: 'center' });
        doc.font(fontBold).fontSize(6.3).fillColor("#000000").text('Mobile No: +91 7374911911 E-mail: info@fincoopers.com', { align: 'center' });
    }

    function addHeader() {
        // Header
        console.log(doc.page.width);
        // doc.image(pdfLogo, 400, 20, { fit: [150, 50], align: "right", valign: "bottom" });

        // doc.image(pdfLogo, 400, 20, { fit: [150, 80], align: 'right', valign: 'bottom' })
        doc.moveDown(3)
    }

    // --------------------page1-------------------------------------//

    // Header
    addHeader()
    doc.moveDown();

    doc.font(font).fontSize(8.9).text('For priority processing of your application, please complete all sections of your application in CAPITAL LETTERS.(Tick boxes where appropriate and write N.A. if not applicable. All fields are mandatory)', { align: 'left' });
    doc.moveDown();

    // Date and Application No.
    addField('Date', '23/09/2024', { fontSize: 8.3, labelFontBold: true, valueFontBold: true });
    addField('Application No.', 'GEN261', { fontSize: 8.3, labelFontBold: true, valueFontBold: true });
    doc.moveDown();

    // Section 1: Application Details
    addSectionTitle('Section 1: Application Details');
    const loanTableData = [
        { field1: 'Loan Amount Requested:', value1: `${allPerameters.loanAmountRequested}` },
        { field1: 'Loan Tenure Requested (in months)', value1: `${allPerameters.tenure}` },
        { field1: 'Loan Purpose:', value1: 'INCREASING MILK BUSINESS' },
        { field1: 'Loan Type:', value1: 'SECURED' }
    ];
    drawTable('Loan Details', loanTableData)
    doc.moveDown();

    const sourcingTableData = [
        { field1: 'Source Type', value1: `${allPerameters.sourceType}` },
        { field1: 'Gro Partner Name', value1: 'N/A' },
        { field1: 'Sourcing Agent Name', value1: 'N/A' },
        { field1: 'Sourcing Agent Code', value1: 'N/A' },
        { field1: 'Source Agent Location', value1: 'N/A' },
        { field1: 'Sourcing RM Name', value1: 'N/A' },
        { field1: 'Sourcing RM Code', value1: 'N/A' },
    ];
    drawTable('Loan Details', sourcingTableData)
    doc.moveDown();

    // Product Program Details
    const productProgramDetailsData = [
        { field1: 'Industry Type', value1: 'GENESIS' },
        { field1: 'Sub Industry Type', value1: 'GENESIS' },
        { field1: 'Product Type', value1: 'SECURED' },
        { field1: 'Program', value1: 'SL-GENESIS PROGRAMME SECURED' },
        { field1: 'Property Value', value1: 'Rs.500000' },
        { field1: 'BT EMI Value', value1: 'NA' },
        { field1: 'Secured/Un-Secured', value1: 'SECURED' },
    ];

// const imagePath = path.join(__dirname, '..', '..', '..','..','..');
// const imagePaths = path.join(imagePath, 'uploads', 'file_1731760648975.1.jpg');
// console.log(imagePaths,"<><><><>")
//     const imageBuffer1 = await sharp(imagePaths).resize(115, 130).toBuffer()
//     const imageBuffer2 = await sharp(imagePaths).resize(115, 130).toBuffer()

//     drawTableWithImage('Product Program Details', productProgramDetailsData, imageBuffer1, imageBuffer2);
    doc.moveDown();
    addFooter()
    // --------------------page2-------------------------------------//

    doc.addPage();

    addHeader()
    doc.moveDown();
    // Section 2: Applicant Details
    addSectionTitle('SECTION 2: Applicant Details');

    // Applicant Details
    const applicantDetailData = [
        { field1: 'Applicant Type', value1: `${allPerameters.applicantType}` },
        { field1: 'Business Type', value1: `${allPerameters.businessType}` },
        { field1: 'Applicant Name', value1: `${allPerameters.applicantName}` },
        { field1: 'PSL Classification', value1: `${allPerameters.sourceType}` }
    ];
    drawTable('Applicant Details', applicantDetailData)
    doc.moveDown();

    const tableTitle = "Revised MSME Classification applicable w.e.f 1st July 2020"
    const tableSubTitle = "Composite Criteria#: Investment in Plant & Machinery/equipment and Annual Turnover"
    const tableSubFooter = "# Meaning of Composite Criteria - If an enterprise crosses the ceiling limits specified for its present category in either of the two criteria of investment or turnover, it will cease to exist in that category and be placed in the next higher category but no enterprise shall be placed in the lower category unless it goes below the ceiling limits specified for its present category in both the criteria of investment as well as turnover"
    const tableFooter = "*All units with Goods and Services Tax Identification Number (GSTIN) listed against the same Permanent Account Number (PAN) shall be collectively treated as one enterprise and the turnover and investment figures for all of such entities shall be seen together and only the aggregate values will be considered for deciding the category as micro, small or medium enterprise."
    const msmeDetailData = [
        { field1: 'Enterprise Classification', value1: 'Micro', value2: 'Small', value3: 'Medium' },
        { field1: 'Investment in Plant and Machinery or Equipment, not exceeding,', value1: '₹ 1 Crore', value2: '₹ 10 Crore', value3: '₹ 50 Crore' },
        { field1: 'Annual Turnover, not exceeding ', value1: '₹ 50 Crore', value2: '₹ 50 Crore', value3: '₹ 250 Crore' },
    ];
    drawTableWithDifferentWidthSize(tableTitle, tableSubTitle, msmeDetailData, tableSubFooter, tableFooter)
    doc.moveDown();

    // Current Office Address / Communication Address
    const communicationAddressData = [
        { field1: 'Address', value1: `${allPerameters.currentAddress}` },
        { field1: 'Tel (STD Code)', value1: `${allPerameters.tel}` },
        { field1: 'Mobile', value1: `${allPerameters.mobile}` },
        { field1: 'Years at current address', value1: `${allPerameters.yearsAtCurrentAddress}` },
        { field1: 'Email ID', value1: `${allPerameters.emailId}` }
    ];
    drawTable('Current Office Address / Communication Address', communicationAddressData)
    doc.moveDown();

    // Current Office Address / Communication Address
    const officeAddressData = [
        { field1: 'Address', value1: `${allPerameters.registeredAddress}` },
        { field1: 'Tel (STD Code)', value1: `${allPerameters.registeredTel}` },
        { field1: 'Mobile', value1: `${allPerameters.registeredMobile}` },
        { field1: 'Years at current address', value1: `${allPerameters.registeredYearsAtCurrentAddress}` },
        { field1: 'Email ID', value1: `${allPerameters.registeredEmailId}` },
        { field1: 'Date of Birth/Incorporation :', value1: `${allPerameters.registeredDob}` },
        { field1: 'GST No.', value1: `${allPerameters.registeredGstNo}` },
        { field1: 'CIBIL Consent :', value1: `${allPerameters.registeredCibil}` },
        { field1: 'CIN/UDYOG ADHAAR :', value1: `${allPerameters.registeredCIn}` },
        { field1: 'PAN :', value1: `${allPerameters.registeredPan}` },
        { field1: 'TAN No. :', value1: `${allPerameters.registeredTan}` },

    ];
    drawTable('Registered Address/Corporate Office Address', officeAddressData)
    doc.moveDown();
    addFooter()

    // --------------------page3-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown();
    addSectionTitle("Section 3: Co-applicant/Guarantor Details")
    const coApplicantData = [
        { field1: 'Co-Applicant/Guarantor Name', value1: `${allPerameters.CoApplicantName}` },
        { field1: 'Type', value1: `${allPerameters.CoApplicantType}` },
        { field1: 'Role', value1: 'CO-APPLICANT' },
        { field1: 'Relation with Applicant', value1: `${allPerameters.relationwithApplicant}` }
    ];
    drawTable('Co-Applicant / Guarantor Details - 1', coApplicantData);
    doc.moveDown();

    const permanentAddressData = [
        { field1: 'Address', value1: `${allPerameters.coPermanentAddress}` },
        { field1: 'Tel (STD Code)', value1: `${allPerameters.coPermanentTel}` },
        { field1: 'Mobile', value1: `${allPerameters.coPermanentMobile}` },
        { field1: 'Email ID', value1: `${allPerameters.coPermanentEmailId}` },
        { field1: 'Years at permanent residence', value1: `${allPerameters.coPermanentYearAtPermanet}` },
        { field1: 'PAN', value1: `${allPerameters.coPermanentPan}` },
        { field1: 'Gender', value1: `${allPerameters.coPermanentGender}` },
        { field1: 'Education Qualification', value1: `${allPerameters.coPermanentEducation}` },
        { field1: 'Address Proof Type', value1: `${allPerameters.coPermanentAddress}` },
        { field1: 'Date of Birth', value1: `${allPerameters.coPermanentDOB}` }
    ];
    drawTable('Permanent Address', permanentAddressData);
    doc.moveDown();

    const currentResidenceData = [
        { field1: 'Address', value1: `${allPerameters.currentAddress}`  },
        { field1: 'Tel(STD Code)', value1: `${allPerameters.currentTel}`  },
        { field1: 'Mobile', value1: `${allPerameters.currentMobile}` },
        { field1: 'Email ID', value1: `${allPerameters.currentEmail}`  },
        { field1: 'Years at current residence', value1: `${allPerameters.currentYearAtCurrent}`  },
        { field1: 'PAN', value1: `${allPerameters.currentPan}`  }
    ];
    drawTable('Current Residence Address / Communication Address', currentResidenceData);
    doc.moveDown();

    // Product Program Details
    const gtrDetailsData = [
        { field1: 'Industry Type', value1: 'GENESIS' },
        { field1: 'Sub Industry Type', value1: 'GENESIS' },
        { field1: 'Product Type', value1: 'SECURED' },
        { field1: 'Program', value1: 'SL-GENESIS PROGRAMME SECURED' },
        { field1: 'Property Value', value1: 'Rs.500000' },
        { field1: 'BT EMI Value', value1: 'NA' },
        { field1: 'Secured/Un-Secured', value1: 'SECURED' },
    ];

    // const imageBuffer3 = await sharp(imagePaths).resize(115, 130).toBuffer()

    // drawTableWithSingleImage("Co-Applicant / Guarantor Details - 2", gtrDetailsData, imageBuffer3)
    doc.moveDown();
    addFooter()
    // --------------------page4-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown();
    const permanentAddressGTRData = [
        { field1: 'Address', value1: `${allPerameters.currentPan}` },
        { field1: 'Tel (STD Code)', value1: `${allPerameters.coPermanentTelTwo}` },
        { field1: 'Mobile', value1: `${allPerameters.coPermanentMobileTwo}` },
        { field1: 'Email ID', value1: `${allPerameters.coPermanentEmailIdTwo}` },
        { field1: 'Years at permanent residence', value1: `${allPerameters.coPermanentYearAtPermanetTwo}` },
        { field1: 'PAN', value1: `${allPerameters.coPermanentPanTwo}` },
        { field1: 'Gender', value1: `${allPerameters.coPermanentGenderTwo}` },
        { field1: 'Education Qualification', value1: `${allPerameters.coPermanentEducationTwo}` },
        { field1: 'Address Proof Type', value1: `${allPerameters.coPermanentAddressTwo}` },
        { field1: 'Date of Birth', value1: `${allPerameters.coPermanentDOBTwo}` }
    ];
    drawTable('Permanent Address', permanentAddressGTRData);
    doc.moveDown();

    const currentResidenceGTRData = [
        { field1: 'Address', value1: `${allPerameters.colocalAddressTwo}` },
        { field1: 'Tel(STD Code)', value1: `${allPerameters.colocalAddressTel}` },
        { field1: 'Mobile', value1: `${allPerameters.colocalAddressMobile}` },
        { field1: 'Email ID', value1: `${allPerameters.colocalAddressEmail}` },
        { field1: 'Years at Current Residence', value1: `${allPerameters.colYearAtCurrentResidenceTwo}` },
        { field1: 'PAN', value1: `${allPerameters.coPanTwo}` }
    ];
    drawTable('Current Residence Address / Communication Address', currentResidenceGTRData);
    doc.moveDown();

    addSectionTitle("Section 4: Collateral Details")
    const collateralDetailsData = [
        { field1: 'Type', value1: 'RESIDENTIAL' },
        { field1: 'Address', value1: `${allPerameters.collateralsAddress}` }
    ];
    drawTable('Collaterals Details', collateralDetailsData);
    doc.moveDown();

    addSectionTitle("Section 5: Banking Details")
    const bankingDetailsData = [
        { field1: 'Name of Bank', value1: `${allPerameters.nameOfBank}` },
        { field1: 'Branch', value1: `${allPerameters.branch}` },
        { field1: 'Account No', value1: `${allPerameters.accountNo}` },
        { field1: 'Account Type', value1: `${allPerameters.accountType}` },
        { field1: 'If overdraft, Limit', value1: `${allPerameters.limit}` },
        { field1: 'No of years', value1: `${allPerameters.NoofYears}` }
    ];
    drawTable('Bank Detail', bankingDetailsData);
    doc.moveDown();
    addFooter()

    // --------------------page5-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown(2);
    addField('Application No. :', 'GEN261', { fontSize: 7.2, labelFontBold: false, valueFontBold: false });
    doc.moveDown(2);

    doc.font(font).fontSize(7.2).text('We acknowledge the receipt of your application for availment of Loan & the same will be processed within a period of 15 days from today', { align: 'left' });
    doc.moveDown(2);

    // Date and Application No.
    addField('Date', '23/09/2024', { fontSize: 7.2, labelFontBold: false, valueFontBold: false });
    addField('Name of RM/Gen Partner', '', { fontSize: 7.2, labelFontBold: false, valueFontBold: false });
    doc.moveDown(4);

    addField('Signature :', '', { fontSize: 7.2, labelFontBold: false, valueFontBold: false });
    doc.moveDown(2);
    addField('COMMON DECLARATIONS', '', { fontSize: 8.6, labelFontBold: true, valueFontBold: false });
    doc.moveDown(0.5);
    doc.font(font).fontSize(7.2).text('I/We hereby acknowledge and conf irm that:', { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text('1. I hereby declare that I am not involved in any type of production or trading activity that comes under International Finance Corporation exclusion list', { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("*Production or trade in any product or activity deemed illegal, pharmaceuticals, pesticides/herbicides, ozone-depleting substances, PCB's, wildlife, weapons, munitions, alcoholic beverages (excluding beer and wine), tobacco, Gambling, casinos, radioactive materials, unbonded asbestos f ibers, drift net f ishing in the marine environment.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("2. The executive of Fin Coopers Capital Pvt Ltd (Lender), collecting the application/documents has informed me/us of the applicable schedule of charges, fees, commissions, and key facts, as more particularly mentioned in the “Schedule of charges” on the website of the company.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("3. Submission of loan application to the lender does not imply automatic approval by the lender and the lender will decide the quantum of the loan at its sole & absolute discretion. The lender in its sole and absolute discretion may either approve or reject the application for granting the loan. In case of rejection, the lender shall not be required to give any reason.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("4. I/We authorized and give consent to Fin Coopers Capital Pvt Ltd to disclose, without noticing me/us, the information furnished by me/us in the application form(s)/ related documents executed/to be executed in the relation to the facilities to be availed by me/us from Fin Coopers Capital Pvt Ltd, to other branches/Subsidiaries/aff iliates/credit Bureaus/to the credit information Bureaus of India (CIBIL)/Rating Agencies/service provider, Banks/f inancial institutes, governmental/regulatory authorities or third parties who may need, process & publish the information in such manner and through such medium as it may be deemed necessary by the lender/RBI, including publishing the name as part of wilful defaulter's list from time to time, as also use for KYC information verif ication, credit risk analysis or for any other purposes as the lender deemed necessary", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("5. I/We declare that all the particulars and information and documents provided with this form are genuine, true, correct, complete, and up to date in all respects and that I/We have not withheld/suppressed any information/document whatsoever. I/We also authorized Fin Coopers Capital Pvt Ltd to use the documents, download records from CKYCR using the KYC identif ier submitted, video record the KYC document, personal discussion, and any other information provided herewith to extract additional information from the various public domains, including but not limited to CIBIL/Bureau report, Perf ios report, etc. or for any other regulatory & compliance-related matters, prior to sanction/post sanction.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("6. I/We have been informed of the documents to be submitted with the loan application form and have submitted the same. I/We shall furnish any additional documents as and when required by the lender.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("7. The executive collection of the application/documents has informed me/us of the rate of interest and approach for gradation of risk and rational of charging different rates of interest to different categories of borrowers, the particulars whereof have specif ied in the Loan Application form.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("8. “The rate of interest is arrived at based on various factors such as cost of funds, administrative cost, risk premium, margin, etc. The decision to give a loan and the interest rate applicable to each loan account are assessed on a case-to-case basis, based on multiple parameters such as borrower profile, repayment capacity, the asset being f inanced, borrower's other financial commitments, past repayment track record, if any, security, tenure,etc. The rate of interest is subject to change as the situation warrants and is subject to the discretion of the company”.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("9. The credit decision is based on the credit model which includes factors like credit history, repayment track record, banking habit, business stability & cash f low analysis which is assessed through a combination of personal discussion and documentation.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("10. Incomplete/defective application will not be processed and the lender shall not be responsible in any manner for the resulting delay or otherwise.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("11. Loan foreclose charges should be as per sanction terms.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("12. The loan term as sanctioned are applicable for the specif ied product as indicated in the loan application and are valid for the period of 60 days only. Where for some reason, there is a delay in concluding the loan, the lender reserve the right to revise the loan term as may be applicable at the time of actual loan availment upon providing a copy of revisions to me/us.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("13. All the particulars and the information and details are given/f illed in this application form are true, correct, complete, and up to date in all respects, and I/We have not withheld any information whatsoever.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("14. Any fault or misrepresentation in the documents will be my/our sole responsibility and Fin Coopers Capital Pvt Ltd has the authority to take rightful action against any such fault/misrepresentation.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("15. I/we shall inform the lender regarding any changes in my/our address(s) or my employment or profession, or any material deviation from the information provided in the loan application form.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("16. I/We hereby conf irm that I/we am/are competent and fully authorized to give declarations, undertaking, etc and to execute and submit this application form and all other documents for the purpose of availing the loan, creation of security, and representing generally for all the purpose", { align: 'left' });
    doc.moveDown(0.2);
    addFooter()
    // --------------------page6-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown(2);
    doc.font(font).fontSize(7.2).text("17. I/We acknowledge and understand that the application/processing fees collected from me/us by Fin Coopers Capital Pvt Ltd, is for reviewing the loan application as per its own parameters and its not refundable to me/us under any circumstances whatsoever, irrespective of whether Fin Coopers Capital Pvt Ltd sanction this loan application of mine or not. No cash has been given by me/us to any person for whatsoever reason related to the loan application.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("18. The lender has the right to retain the documents along with the photographs submitted with the loan application, and the same will not be returned to the applicant.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("19. I/We authorize and give consent to Fin Coopers Capital Pvt Ltd for communicating with me/us regularly via sms/email/calls/whatsapp/other social media applications.", { align: 'left' });
    doc.font(font).fontSize(7.2).text("20. Mobile number provided for receiving OTP is registered in the name of borrower/applicant/co-applicant/or its main promoter/director/partner and I/we hereby authorize you/subsidiaries/aff iliates/third party vendor for sending any promotional/transactional sms.Further I/We confirm that the provided number/s are not registered with DO NOT DISTURB (DND).", { align: 'left' });
    doc.font(font).fontSize(7.2).text("21. I/we have read & understood the contents of the application. Additionally, the contents of the same have been read out to me/us in our vernacular language(s), & we have understood the same.", { align: 'left' });
    doc.moveDown(2);
    addField('OTHER TERMS & CONDITIONS:', '', { fontSize: 8.6, labelFontBold: true, valueFontBold: false });
    doc.moveDown(0.5);
    doc.font(font).fontSize(7.2).text('1. Payment: No cash/bearer cheque has been collected from me up-front towards processing the loan application.', { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("2. Details with respect to the EMI presentation dates, number of EMIs, amount, and other terms & conditions of the loan will be communicated separately along with the welcome letter.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("3. No discount/fees gifts or any other commitment is given whatsoever which is not documented in the loan agreement by the lender or any of its authorized representative(s).", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("4. The lender shall make all attempts to process the application and disburse the loan within 30 (thirty) working days from the date of the completion and submission of all relevant loan documents as specif ied therein", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("5. Other charges: Loan processing fees would be up to 4% of the loan amount.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("6. Charges which are in nature of fees are exclusive of good and service tax. Goods and services tax and other government levies, as applicable, would be charged additionally", { align: 'left' });
    doc.font(font).fontSize(7.2).text("7. GENESIS shall have a right to either process and disburse the entire loan amount singly or jointly together with such other co-lending partners i.e.bank/NBFCs as it may be deemed fit.", { align: 'left' });
    doc.moveDown(4);
    doc.font(font).fontSize(7.2).text("If applicant / borrower require any clarif ication regarding their application / loan, they may write into :", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(fontBold).fontSize(7.2).text("Fin Coopers Capital Pvt Ltd, Registered Off ice Address: 174/3,Nehru Nagar,Indore-452011 (M.P.) or email us at: genesispvtltd9@gmail.com", { align: 'left' });
    doc.moveDown(2);
    doc.font(fontBold).fontSize(7.2).text("The brand Fin Coopers Capital is presented by Fin Coopers Capital Pvt Ltd.", { align: 'left' });
    doc.moveDown(0.2);
    doc.font(font).fontSize(7.2).text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", { align: 'left' });
    doc.moveDown(2);


    const signDetailsData = [
        { field1: '', value1: '', value2: "", value3: "" },
        { field1: 'Signature Applicant (Authorised Signatory)', value1: 'Signature Co-Applicant-1/Guarantor-1 (Authorised Signatory)', value2: "Signature Co-Applicant-2/Guarantor-2 (Authorised Signatory)", value3: "Signature Guarantor (Authorised Signatory)" },
    ];
    drawTableWithoutTitle(signDetailsData)

    addFooter()

    // --------------------page7-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown(2);
    doc.font(fontBold).fontSize(8.9).text("Yes, I am interested in receiving periodic updates from Fin Coopers Capital Pvt Ltd.", { align: 'center' });
    doc.moveDown(); doc.font(fontBold).fontSize(8.3).text("Attention: PLEASE READ CAREFULLY BEFORE SIGNING ACKNOWLEDGEMENT FORM", { align: 'center' });
    doc.moveDown();
    doc.moveDown(); doc.font(font).fontSize(8.9).text("I/We refer to application Sr. No dated submitted by me/us to Genesis Securities Pvt Ltd.. I/We have been provided the following information and have accordingly filled up the aforesaid form.", { align: 'left' });
    doc.moveDown();
    const loanTypeTableData = [
        { field1: 'Min Loan Amount Possible (Rs. in lakhs)', value1: '10', value2: '50', value3: '10' },
        { field1: 'Max Loan Amount Possible (Rs. in lakhs)', value1: '25', value2: '500', value3: '500' },
        { field1: 'Tenure (Yrs.)', value1: '1-3 yrs', value2: '5-10 yrs', value3: '1-4 yrs' },
        { field1: 'ROI (%)', value1: '14% - 20%', value2: '8% - 24%', value3: '11% - 17%' },
        { field1: 'Pre-EMI (Rs.)', value1: 'Pre-EMI interest to be paid from the day of the disbursement (fully & partially) till the date of commencement of EMI. ROI will be same as that for EMI', value2: 'Same as Unsecured', value3: 'Same as Unsecured' },
        { field1: 'EMI (Rs.)', value1: 'EMI will be based on final loan amount, rate of interest and tenor approved.', value2: 'Same as Unsecured', value3: 'Same as Unsecured' },
        { field1: 'Rate Type', value1: 'Fixed', value2: 'Floating', value3: 'Floating' },
        { field1: 'Type of transaction', value1: 'Charges', value2: '', value3: '' },
        // Section A: Loan Processing Fee
        { field1: 'A. Loan Processing Fee', value1: 'Charges', value2: '', value3: '' },
        { field1: 'Loan Applied -- First or Incremental', value1: 'Up to 4% of the loan amount sanctioned. This is a non-refundable fee.', value2: 'Up to 4% of loan sanctioned', value3: 'Same as Unsecured' },
        { field1: 'File Charges', value1: 'NA', value2: 'Rs 5900/- GST included', value3: 'Rs 2500/-' },
        { field1: 'Legal Verification Charges', value1: 'NA', value2: 'At actuals', value3: 'Rs 2500/-' },
        { field1: 'Technical Verification Charges/ valuation', value1: 'NA', value2: 'At actuals', value3: 'Rs 6500/-' },
        // Section B: Part Prepayment / Foreclosure Charges
        { field1: 'B. Part Prepayment / Foreclosure Charges', value1: 'Charges', value2: '', value3: '' },
        { field1: 'Early Payments within 12 months of loan sanction', value1: 'NA', value2: '6% of Principal outstanding foreclosed within 12 months of sanction', value3: 'NA' },
        { field1: 'Early payment after 12 months of loan sanction', value1: 'NA', value2: '4%', value3: 'NA' },
        { field1: 'Foreclosure Charges', value1: '% of Principal Outstanding for Loan Foreclosed within 12 months', value2: '6%', value3: '6%' },
        { field1: '', value1: '% of Principal Outstanding for Loan Foreclosed after 12 months', value2: '4%', value3: '4%' },
        { field1: 'There are no charges on foreclosure or pre-payment on f loating rate term loans sanctioned to individual borrowers. The above part prepayment and foreclosure charges are subject to the regulatory requirements and directions prescribed by Reserve Bank of India from Time to time', value1: '', value2: '', value3: '' },
        { field1: 'C.Other Charges', value1: '', value2: '', value3: '' },
        { field1: 'PDC/ ECS/ NACH Bounce Charges / per transaction', value1: 'Rs 750/-', value2: '', value3: '' },
        { field1: 'Field collection charges per EMI', value1: 'NA', value2: 'NA', value3: 'NA' },
        { field1: 'Repayment instrument change/ swap charges', value1: 'Rs 1000/-', value2: '', value3: '' },
        { field1: 'EMI repayment cycle date change', value1: 'Rs 1000/-', value2: '', value3: '' },
        { field1: 'Modification of loan terms after first disbursement including but not limited to re-scheduling of loan repayment term, addition/deletion of coborrowers etc', value1: 'Up to 2% of outstanding principal amount (As on the date of transaction)', value2: 'Up to 2% of outstanding principal amount', value3: 'Up to 2% of outstanding principal amount' },
        { field1: 'Issuance of duplicate income tax certificate', value1: 'Rs 500/-', value2: '', value3: '' },
        { field1: 'Issuance of Duplicate No objection certificate (NOC)', value1: 'Rs 500/-', value2: '', value3: '' },
        { field1: 'Duplicate Statement of Accounts (SOA)', value1: 'Rs 500/-', value2: '', value3: '' },
        { field1: 'Document retrieval', value1: 'Rs 1000/-', value2: '', value3: '' },
        { field1: 'Loan Cancellation Charges', value1: 'Rs 20000 + rate of interest from the date of disbursement till date of request of cancellation', value2: '', value3: '' },
        { field1: 'Cersai Charges', value1: 'NA', value2: 'Rs 500/-', value3: 'Rs 500/-' },
        { field1: 'Renewal Charges', value1: 'NA', value2: '', value3: '' },
        { field1: 'Tranche release charges', value1: 'NA', value2: '', value3: '' },
        { field1: 'RTO transfer charges**', value1: 'NA', value2: 'NA', value3: 'Rs 10000/-' },
        { field1: 'Duplicate RC issuance charges **', value1: 'NA', value2: 'NA', value3: 'Rs 10000/-' },
        { field1: 'MOD Registration Expenses', value1: 'NA', value2: 'NA', value3: 'NA' },
        { field1: 'Stamp Duty and Documentation', value1: 'NA', value2: 'NA', value3: 'NA' },
        { field1: 'EC', value1: 'NA', value2: 'NA', value3: 'NA' },
        { field1: 'Penal Charges', value1: '3% p.m on Instalment overdue', value2: '', value3: '' },
        { field1: '* Please note that above fee and charges are exclusive of GST, education cess and other government taxes, levies etc. The above schedule of charges is subject to change and will be at the sole discretion of Genesis Securities Pvt Ltd, The Changes will be available on Genesis', value1: '', value2: '', value3: '' }
    ];
    drawLoanTypeTable(loanTypeTableData)

    addFooter()

    // --------------------page8-------------------------------------//

    doc.addPage()
    addHeader()
    doc.moveDown(2);
    const documentData = [
        { field1: 'Application Form', value1: 'Completed application form duly signed by all applicants, guarantors, and co-applicants (if any)' },
        { field1: 'Photograph', value1: 'Signed coloured photograph of each applicant (except non-individuals), individual guarantors and co-applicants (if any)' },
        { field1: 'Age Proof (For individuals): [Copy of any one of the following]', value1: 'Passport (Not Expired), Pan Card OR Form 60, Voters ID card with complete date of Birth, Driving License (Not Expired), High School Mark sheet/ Certificate, LIC policy bond with latest premium paid receipt (Minimum 12 months in force), Sr Citizen ID card issued by Govt Body, Birth Certificate/ Corporation Certificate (Should have name mentioned on it).' },
        { field1: 'Signature Verification [Copy of any one of the following] (wherever applicable)', value1: 'Passport (Not Expired), Pan Card OR Form 60, Driving License (Not Expired), Copy of any cheque issued in favor of Genesis Securities Pvt Ltd. (Subject to cheque must be cleared), Identity card with applicants photograph & sign issued by Central/State Government Departments, Original Bankers Verification (not older than 30 days)' },
        { field1: 'Income Proof*', value1: 'Latest ITR, Latest Form 16, Latest Salary Slip/Certificate, Latest Audited Financials, Bank details with last 3 months salary credited, Add- Business Proof-Qualification Certificate/Certificate of Practice (COP), Shop Act License/MOA & AOA/Sales TaxNat registration/Partnership Deed.' },
        { field1: 'Property Document*', value1: 'Copy of original sales deed, Allotment possession letter, NOC from society and other documents as per legal report. The application will be assessed quickly after receiving the required documents.' },
        { field1: 'Proof of Identity & Address: (For Individual /Authorized Person)', value1: "Passport (not expired), PAN Card, Voter's Identity Card issue by Election Commission of India, Driving License, Proof of Possession of Aadhar (Voluntary), Job Card Issued by NREGA duly signed by office of State Govt and Letter issued by the National Population Register containing details of name and address, Ration Card, Bank Statement, Electricity/Telephone Bill, Sale deed/property purchase agreement (for owned properties)" },
        { field1: 'For Companies: [Certified copies of each of the following documents or the equivalent e-documents]', value1: 'Certificate of Incorporation, Memorandum and Article of Association, PAN of the company, A resolution from the board of Directors and Power of Attorney granted to its managers, officers or employee to transact on its behalf, *Documents relating to authorized signatory, beneficial owners, managers, officers or employees, as the case may be, holding an attorney to transact on its behalf.' },
        { field1: 'For Partnership Firm: [Certified copies of each of the following documents or the equivalent e-documents]', value1: 'Registration Certificate, Partnership Deed, PAN of the Partnership Firm, * Documents relating to Partners beneficial owner, or authorised signatories, as the case may be, holding an attorney to transact on its behalf.' },
        { field1: 'For Trust: [Certified copies of each of the following documents or the equivalent e-documents]', value1: "Registration Certificate, Trust Deed, PAN No. or Form 60 of Trust, * Documents relating to beneficial owner, trustees' managers, officers or employees as the case may be, holding an attorney to transact on its behalf." },
        { field1: 'For Sole Proprietorship: [Certified copy of any two* of the following documents in the name of the proprietary concern]', value1: "* Proof of Identity/Address of Individual, Registration Certificate, Certificate/licence issued by the municipal authorities under Shop and Establishment Act., Sales and income tax returns, CST/VAT/ GST certificate (provisional/final), Certificate/registration document issued by Sales Tax/Service Tax/Professional Tax authorities, Importer Exporter Code issued by the office of DGFT or License/ Certificate of practice issued in name of the Proprietary concern by professional body incorporated under statute, The complete Income Tax Return in the name of the sole proprietor where the firm's name and income is reflected duly authenticated/acknowledged by the Income Tax Authorities, Utility bills such as electricity, water, and landline telephone bills in the name of the proprietary concern. " },
        { field1: 'For Society/ Unregistered Partnership Firm: [Certified copy of any two* of the following documents in the name of the proprietary concern]', value1: 'Board Resolution of the Society/ Firm, PAN or Form 60 of the Society/ Firm, *Documents relating to beneficial owner, office bearers, authorised signatories, managers, officers or employees, as the case may be, holding an attorney to transact on its behalf, such information as may be required by the company to collectively establish the legal existence of such an association or body of individuals' },
        { field1: 'Note', value1: '1)* Documents relating to beneficial owner, managers, partners, trustees, officers or employees, authorised signatories, as the case may be, holding an attorney to transact on its behalf: Same list of documents as for the Individual/ Authorised Person as mentioned above. 2) All the customer documentation to be self-attested. In case of bank statement and financials first and last page needs to be self-attested. 3) The Partnership Deed and the MOA & AOA should be attested stating ‘Certified that this is duly Amended & Latest True copy. 4) All documents to be signed by the customer and OS done by our FTE/Contractual employee/ FIN COOPERS Authorized Representative 5) Form INC 22A shall be accepted as a proof of change in the address of the Company. 6) Driving License - Booklet form is not accepted as KYC document Please quote the Application Reference Number mentioned in the slip for any enquiry(ies). * Requirement of documents might vary according to the scheme chosen.' }
    ];

    drawTableWithHeaderFooter("DOCUMENTS REQUIRED", documentData, "Please quote the Application Reference Number mentioned in the slip for any enquiry(ies).*Requirement of documents might vary according to the scheme chosen.")

    addFooter()

    doc.end();

    const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;


    // const objData = {
    //     fileName: pdfFileUrl,
    //     file: doc.toString('base64')
    // }
    // await initESign(objData)

    return new Promise((resolve, reject) => {
        stream.on("finish", () => {
          resolve(pdfFileUrl);
        });
        stream.on("error", reject);
      });
}

// const applicantLatter = async(customerId,pdfLogo) =>{
    const applicantLatter = async(customerId) =>{

    try {

            // const customerId = new mongoose.Types.ObjectId("66f54fe9a99b5329c43fe0b2");
        console.log(customerId,"in sanction latter")
        const customerDetails = await customerModel.findOne({_id:customerId}).populate('productId')  
        const coApplicantDetails = await coApplicantModel.find({customerId})
        const guarantorDetails = await guarantorModel.findOne({customerId})  
        const applicantDetails = await applicantModel.findOne({customerId})
        const technicalDetails = await technicalModel.findOne({customerId})
        const appPdcDetails = await appPdcModel.findOne({customerId})
        const creditPdDetails = await creditPdModel.findOne({customerId})
        const approverFormDetails = await approverFormModel.findOne({customerId})

        const permanentAddress = [
            applicantDetails?.permanentAddress?.addressLine1,
            applicantDetails?.permanentAddress?.addressLine2,
            applicantDetails?.permanentAddress?.city,
            applicantDetails?.permanentAddress?.district,
            applicantDetails?.permanentAddress?.state,
            applicantDetails?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const localAddress = [
            applicantDetails?.localAddress?.addressLine1,
            applicantDetails?.localAddress?.addressLine2,
            applicantDetails?.localAddress?.city,
            applicantDetails?.localAddress?.district,
            applicantDetails?.localAddress?.state,
            applicantDetails?.localAddress?.pinCode
          ].filter(Boolean).join(', ');

          const CoPermanentAddress = [
            coApplicantDetails[0]?.permanentAddress?.addressLine1,
            coApplicantDetails[0]?.permanentAddress?.addressLine2,
            coApplicantDetails[0]?.permanentAddress?.city,
            coApplicantDetails[0]?.permanentAddress?.district,
            coApplicantDetails[0]?.permanentAddress?.state,
            coApplicantDetails[0]?.permanentAddress?.pinCode
          ].filter(Boolean).join(', ');

          const CoLocalAddress = [
            coApplicantDetails[0]?.localAddress?.addressLine1,
            coApplicantDetails[0]?.localAddress?.addressLine2,
            coApplicantDetails[0]?.localAddress?.city,
            coApplicantDetails[0]?.localAddress?.district,
            coApplicantDetails[0]?.localAddress?.state,
            coApplicantDetails[0]?.localAddress?.pinCode
          ].filter(Boolean).join(', ');

        const allPerameters = {
            applicantPhoto: applicantDetails?.applicantPhoto || "",
            coApplicantPhoto: coApplicantDetails?.coApplicantPhoto || "",
            gurantorPhoto: guarantorDetails?.applicantPhoto || "",
            loanAmountRequested: customerDetails?.loanAmount || "NA",// page no 1
            tenure: customerDetails?.tenure || "NA",
            sourceType : "NA",
            businessType : creditPdDetails?.applicant?.businessType || "NA",
            applicantType: applicantDetails?.applicant?.applicantType || "NA",
            applicantName : applicantDetails?.fullName || "NA",// page no 2
            pslClassification  : "NA",
            currentAddress : localAddress || "NA",// current address
            tel : "NA",
            mobile : applicantDetails?.mobileNo || "NA",
            yearsAtCurrentAddress: "NA",
            emailId: applicantDetails?.email || "NA",
            // dob: applicantDetails?.dob || "NA",
            // gstNumber: "NA",
            // cibilConsent:"NA",
            // udyogAdhar: "NA",
            // pan: applicantDetails?.panNo || "NA",
            // tanNo:" NA",
            registeredAddress: localAddress || "NA",
            registeredTel: "NA",
            registeredMobile: applicantDetails?.mobileNo || "NA",
            registeredYearsAtCurrentAddress: permanentAddress || "NA",
            registeredEmailId: applicantDetails?.email || "NA",
            registeredDob: applicantDetails?.dob || "NA",
            registeredGstNo: "NA",
            registeredCibil: "NA",
            registeredCIn: "NA",
            registeredPan: applicantDetails?.panNo || "NA",
            registeredTan: "NA",
            CoApplicantName: coApplicantDetails[0]?.fullName || guarantorDetails?.fullName || "NA",// page 3
            CoApplicantType: creditPdDetails?.co_Applicant[0]?.coApplicantType || "NA",
            relationwithApplicant: coApplicantDetails[0]?.relationWithApplicant || "NA",
            coPermanentAddress: CoPermanentAddress || "",
            coPermanentTel: "NA",
            coPermanentMobile: coApplicantDetails[0]?.mobileNo || "NA",
            coPermanentEmailId: coApplicantDetails[0]?.email || "NA",
            coPermanentYearAtPermanet : "NA",
            coPermanentPan: coApplicantDetails[0]?.pan || "NA" ,
            coPermanentGender: coApplicantDetails[0]?.gender || "NA",
            coPermanentEducation: coApplicantDetails[0]?.education || "NA",
            coPermanentAddress: coApplicantDetails[0]?.email || "NA",
            coPermanentDOB: coApplicantDetails[0]?.dob || "NA",
            currentAddress: CoLocalAddress || "NA",
            currentTel: "NA",
            currentMobile:  coApplicantDetails[0]?.mobileNo || "NA",
            currentEmail: coApplicantDetails[0]?.email || "NA",
            currentYearAtCurrent: "NA",
            currentPan: coApplicantDetails[0]?.pan || "NA",
            coPermanentAddressTwo: CoPermanentAddress || "",//co-2 page no 4
            coPermanentTelTwo : "NA",
            coPermanentMobileTwo : coApplicantDetails[1]?.mobileNo || "NA",
            coPermanentEmailIdTwo : coApplicantDetails[1]?.email || "NA",
            coPermanentYearAtPermanetTwo : "NA",
            coPermanentPanTwo : coApplicantDetails[1]?.pan || "NA" ,
            coPermanentGenderTwo : coApplicantDetails[1]?.gender || "NA",
            coPermanentEducationTwo : coApplicantDetails[1]?.education || "NA",
            coPermanentAddressTwo : coApplicantDetails[1]?.email || "NA",
            coPermanentDOBTwo : coApplicantDetails[1]?.dob || "NA",
            colocalAddressTwo : CoLocalAddress || "NA",
            colocalAddressTel: "NA",
            colocalAddressMobile:  coApplicantDetails[1]?.mobileNo || "NA",
            colocalAddressEmail: coApplicantDetails[1]?.email || "NA",
            colYearAtCurrentResidenceTwo: "NA",
            coPanTwo : coApplicantDetails[1]?.pan || "NA",
            collateralsType: "RESIDENTIAL",
            collateralsAddress: approverFormDetails?.fullAddressOfProperty || "NA",
            nameOfBank: creditPdDetails?.bankDetail?.nameOfBank || "NA",// bank Details
            branch: creditPdDetails?.bankDetail?.branchName || "NA",
            accountNo : creditPdDetails?.bankDetail?.accountNo || "NA",
            accountType : creditPdDetails?.bankDetail?.accountType || "NA",
            limit:"NA",
            NoofYears:"NA"
        }
        // const pdfPath = await generateApplicantPdf(allPerameters,pdfLogo);
        const pdfPath = await generateApplicantPdf(allPerameters);

        console.log("pdfPath", pdfPath);
        console.log("http://localhost:5500" + pdfPath);
    
        if (!pdfPath) {
        //   return res.status(500).json({
        //     errorName: "pdfGenerationError",
        //     message: "Error generating the applicant Letter Pdf",
        //   });
      
        // console.log("Error generating the applicant Letter Pdf")
        }
        // success("PDF generated successfully", pdfPath);
        console.log(pdfPath,"pdfPath pdfPath")
        return pdfPath
      } catch (error) {
        console.log(error);
        // unknownError(res, error);
      }
}

// const applicantLatter = async(req,res) =>{
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//           return serverValidation({
//             errorName: "serverValidation",
//             errors: errors.array(),
//           });
//         }
        
    
//         const pdfPath = await generateApplicantPdf(req);
//         console.log("pdfPath", pdfPath);
//         console.log("http://localhost:5500" + pdfPath);
    
//         if (!pdfPath) {
//           return res.status(500).json({
//             errorName: "pdfGenerationError",
//             message: "Error generating the applicant Letter Pdf",
//           });
//         }
//         success(res, "PDF generated successfully", pdfPath);
//       } catch (error) {
//         console.log(error);
//         unknownError(res, error);
//       }
// }

module.exports = {
    applicantLatter
}