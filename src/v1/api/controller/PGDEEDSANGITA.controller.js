const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../globalHelper/response.globalHelper");
  
  const PDFDocument = require("pdfkit");
  const path = require("path");
  const fs = require("fs");
  const moment = require("moment");
  const { validationResult } = require("express-validator");
  
  const pdfLogo = path.join(
    __dirname,
    "../../../../assets/image/FINCOOPERSLOGO.png"
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
  
  async function sanctionLetterPdf(req) {
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
  
    // watermark function
    function addWatermark() {
      if (fs.existsSync(watermarklogo)) {
        doc.save();
        doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
  
        doc.image(
          watermarklogo,
          doc.page.width / 2 - 200,
          doc.page.height / 2 - 200,
          {
            fit: [450, 400],
            opacity: 0.05,
            align: "center",
            valign: "center",
          }
        );
  
        doc.restore();
      } else {
        console.error(`Logo file not found at: ${watermarklogo}`);
      }
    }
  
    // Footer with border and stylized text
    function addFooter() {
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
  
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const timestamp = Date.now();
    // const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`); // Capitalize name
    const pdfFilename = `PGDEEDSANGITA.pdf`;
    const pdfPath = path.join(outputDir, pdfFilename);
  
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(pdfPath);
  
    doc.pipe(stream);
  
    // Add logo and border to the first page
    addLogo();
    //   addWatermark();
    drawBorder();

    doc.moveDown(8);
    doc
      .fontSize(12)
      .font(fontBold)
      .text("PERSONAL GUARANTEE", { align: "center" });
    doc.moveDown(1);
  
    // Title styling for OFFER LETTER in uppercase and underlined
    doc.moveDown(3);
    // doc
    //   .fontSize(12)
    //   .font(fontBold)
    //   .text("KANHAIYALAL DANGI", { align: "center",  underline: true  });
    //   doc.moveDown(0.2);
    // Draw the text first
doc.fontSize(12)
.font(fontBold)
// .text("KANHAIYALAL DANGI", { align: "center" });
.text(`${req.body.guarantor}`, { align: "center" });


// Get the text width to calculate line size
const textWidth = doc.widthOfString(`${req.body.guarantor}`);
const textX = (doc.page.width - textWidth) / 2;  // Center align

// Draw a gray line manually below the text
doc.moveDown(0.2)
.strokeColor('gray')         // Set the color to gray
.lineWidth(1)                // Set the thickness of the line
.moveTo(textX, doc.y)        // Start point of the line
.lineTo(textX + textWidth, doc.y)  // End point of the line
.stroke();                   // Actually draw the line


// Draw a horizontal line (you can adjust the coordinates and width as needed)
//     doc.moveTo(80, doc.y)  // Start point (x1, y1) where y is the current cursor position
//    .lineTo(500, doc.y)  // End point (x2, y2)
//    .stroke("gray");           // Actually draw the line  
//     doc.moveDown(0.2);
    doc.fontSize(10).text('(as the Guarantor)', { align: 'center' });

    doc.moveDown(4);

  // In favour of Lender
  doc.fontSize(12).text('IN FAVOUR OF', { align: 'center' });
  doc.moveDown(6);

  doc.fontSize(12).text('FIN COOPERS CAPITAL PVT LTD', { align: 'center' });
  doc.fontSize(10).text('(as the Lender)', { align: 'center' });
  doc.moveDown(3);

  doc.fontSize(12).text('AND', { align: 'center' });
  doc.moveDown(1.5);

  doc.moveDown(4);

//   doc.moveTo(80, doc.y)  // Start point (x1, y1) where y is the current cursor position
//   .lineTo(500, doc.y)  // End point (x2, y2)
//   .stroke("gray");           // Actually draw the line  
//    doc.moveDown(0.2);
doc.moveDown(0.2)
doc.fontSize(12).text(`${req.body.lender}`, { align: 'center' });
doc
.strokeColor('gray')         // Set the color to gray
.lineWidth(1)                // Set the thickness of the line
.moveTo(textX, doc.y)        // Start point of the line
.lineTo(textX + textWidth, doc.y)  // End point of the line
.stroke();        
doc.moveDown(0.2);

   doc.fontSize(10).text('(as the lender)', { align: 'center' });

   addFooter();

   //---------------------------------new page-------------------------------------------
     doc.addPage();
    addLogo();
    drawBorder();
  doc.moveDown(12);


  // Deed of Guarantee
  doc.font(font).fontSize(12).text('DEED OF GUARANTEE', { align: 'center', underline: true });
  doc.moveDown(2);

  // Body Content
//   doc.fontSize(10).text('This DEED'+ <b>TEST</b>+' OF GUARANTEE (this "Deed") is made at PACHORE, on this 10 day Of OCTOBER, 2024 ("Execution Date"):', {
//     align: 'left',
//     indent: 40,
//     lineGap: 5,
//   });

doc.font(font).fontSize(10).text('This DEED', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true
  })
  // .font('Helvetica-Bold').text(' TEST', {
  //   continued: true, // Allows the text to continue on the same line
  // })
  .font(font).fontSize(10).text(' OF GUARANTEE (this "Deed") is made at ', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true
  })
  .font('Helvetica-Bold').text(`${req.body.deedOfGuarantee?.place}`, {
    continued: true, 
  })
  .font('Helvetica').text(' , on this ', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true

  })
  .font('Helvetica-Bold').text(`${req.body.deedOfGuarantee?.day} `, {
    continued: true,
  })
  .font('Helvetica').text(' ,  day Of', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true

  })
  .font('Helvetica-Bold').text(` ${req.body.deedOfGuarantee?.month}`, {
  })
  .font('Helvetica').text(` , ${req.body.deedOfGuarantee?.year} ("Execution Date"):`, {
    align: 'left',
    indent: 40,
    lineGap: 5,

  })
  
  doc.moveDown(0.5);

  doc.text('BY', { align: 'center', indent: 40,    lineGap: 5,
  });
  doc.moveDown(0.5); 

  doc.
  font(fontBold).text(`${req.body.deedOfGuarantee?.name}`, {
    align: 'left', indent: 40,
    continued: true,
  })
  .font(font).text(
    ', Indian resident, aged ,',
    { align: 'left', indent: 40, lineGap: 5 , continued: true,
    }

  )
  .
  font(fontBold).text(`${req.body.deedOfGuarantee?.age}`, {
    align: 'left', indent: 40,
    continued: true,
  })
  .font(font).text(
    ', son of MR.,',
    { align: 'left', indent: 40, lineGap: 5,    continued: true,
    }
  )
  .
  font(fontBold).text(`${req.body.deedOfGuarantee?.sonOf}`, {
    align: 'left', indent: 40,
    continued: true,
  })
  .font(font).text(
    ' , PAN ',
    { align: 'left', indent: 40, lineGap: 5 ,    continued: true,
    }
  )
  .
  // font(fontBold).text(' JIRPD2229E\n', {
    font(fontBold).text(`${req.body.deedOfGuarantee?.pan}`, {

    align: 'left', indent: 40,
  })
  
    .font(font).text(
      ' residing at ,',
      { align: 'left', indent: 40, lineGap: 5,    continued: true,
      }
    )
    .
  font(fontBold).text(`${req.body.deedOfGuarantee?.place}`, {
    align: 'left', indent: 40,
    continued: true,
  })
  .font(font).text(
    ' (here in after referred to as "Guarantor", which expression shall, unless\n repugnant to the subject or context thereof, include his heirs, executors, administrators, successors-in-\ninterest and permitted assigns),',
    { align: 'left', indent: 40, lineGap: 5 }
  )


  doc.moveDown(0.5);
  doc.text('IN FAVOUR OF', { align: 'center', indent: 40 });
  doc.moveDown(1);

  doc.font(font).text(
    'FIN COOPERS CAPITAL PVT LTD, a company incorporated under the Companies Act, 1956 with corporate\n identity number 67120MP1994PTC008686, registered as a non-banking financial services company\n within the meaning of the Reserve Bank of India ("RBI") Act, 1934 and having its registered office at \n174/3 Nehru Nagar, Indore - 452011 (M.P.) (here in after referred to as the            .',
    { align: 'left', indent: 40,lineGap: 5 ,continued: true,
    }
  )
  .
  font(fontBold).text(`      "${req.body.deedOfGuarantee?.refferedAs}"`, {
    align: 'left', indent: 40,lineGap:  5,continued: true,

  })
  .font(font).text(
    ', which expression\nshall, unless repugnant to the subject or context thereof, be deemed to include its successors, transferees,\nnovatees, and assigns).',
    { align: 'left', indent: 40, lineGap: 5 }
  )
  ;
  
  doc.moveDown(1.5);

  doc.fontSize(12).text('AND', { align: 'center' });
  doc.moveDown(2);

 

  doc.fontSize(10)
  .font(font)
  .text(`${req.body.deedOfGuarantee?.companyName} a company incorporated under the Companies Act, 1956/2013 and having its \nregistered office at                   `, {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true 
  })
  .font(fontBold)
  .text(`${req.body.deedOfGuarantee?.place}`, {
    continued: true  // bold part on the same line
  })
  .font(font)
  .text(' as a non-banking financial services company with the RBI (here in \nafter referred to as the "Lender 2", which expression shall, unless repugnant to the context or meaning\n thereof,be deemed to include its successors, transferees, novatees, and assigns).', {
    align: 'left',
    indent: 40,
    lineGap: 5
  });

doc.moveDown(2);  // Moves down by 2 lines for spacing
doc.font(font)
  .text('Lender 1 and Lender 2 are hereinafter collectively referred to as the "Lenders" and individually as', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: false  // continue on the same line
  })
  .font(fontBold)
  .text('"Lender"', {
    indent: 40,

    align: 'left'
  });

  doc.moveDown(0.5);

  // doc
  // .
  // font(font).fontSize(10).text(
  //   'Guarantor and the Lender are hereinafter collectively referred to as the',
  //   { align: 'left', indent: 40,lineGap:  5, }
  // )
  // .
  // font(fontBold).text(' "Parties" and', {
  //   align: 'left', indent: 40,lineGap:  5,

  // })
  // .font(font).text(
  //   'individually as\n a ',
  //   { align: 'left', indent: 40,lineGap:  5,}
  // )
  // .
  // font(fontBold).text(' \n"Party",', {
  //   align: 'left', indent: 40,lineGap:  5,

  // })
  // .font(font).text(
  //   ' , as the context may so require.',
  //   { align: 'left', indent: 40, lineGap: 5 }
  // );
  doc
  .font(font)
  .text('Guarantor and the Lender are hereinafter collectively referred to as the ', {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true  // keep the next text on the same line
  })
  .font(fontBold)
  .text('"Parties" and', {
    continued: true  // continue on the same line
  })
  .font(font)
  .text(' individually as a', {
    continued: false  
  })
  .font(fontBold)
  .text('"Party"', {
    indent: 40,
    continued: true  
  })
  .font(font)
  .text(' ,as the context may so require.', {
    align: 'left',
    indent: 40,
    lineGap: 5
  });

  
  addFooter();

   //---------------------------------new page-------------------------------------------
     doc.addPage();
    addLogo();
    drawBorder();
  doc.moveDown(12);


  doc.font('Helvetica-Bold').fontSize(10).text('WHERE AS', { align: 'center'});
  doc.moveDown(3);
  
  // Adding WHEREAS clauses
  // doc.font(font).text(
  //   'A. In terms of the facility agreement dated 10/10/2024 ("Facility Agreement"), the Lenders have granted\n or agreed to grant to SANGITA BAI (hereinafter referred to as the "Borrower", which expression\n shall, unless repugnant to the subject, context or meaning thereof, be deemed to include its successors and permitted assigns) a term loan facility for the amount of 500000/- (Indian Rupees FIVE LAKH) ("Facility") on the terms and conditions and securities mentioned in the Facility Agreement and the other documents executed/to be executed between the Borrower and the Lenders with respect to the Facility;',
  //   { align: 'left', indent: 40, lineGap: 5 }
  // );
  doc
  .font(font)
  .text(`A. In terms of the facility agreement dated ${req.body.whereAs?.date} (`, {
    align: 'left',
    indent: 40,
    lineGap: 5,
    continued: true  
  })
  .font(fontBold)
  .text('"Facility Agreement"', {
    indent: 40,
    lineGap: 5,

    continued: true  
  })
  .font(font)
  .text('), the Lenders have\n', {
    indent: 40,
    lineGap: 5,

    continued: false
  })
  .font(font)
  .text('granted or agreed to grant to ', {
    indent: 40,
    lineGap: 5,


    continued: true
  })
  .font(fontBold)
  .text(`${req.body.whereAs?.grantTo}`, { 
    continued: true,
    indent: 40,
    lineGap: 5,
  })
  .font(font)
  .text(' (hereinafter referred to as the ', {
    continued: true
  })
  .font(fontBold)
  .text('"Borrower"', { 
    indent: 40,
    lineGap: 5,
    continued: true
  })
  .font(font)
  .text(', which \n', {
    indent: 40,
    lineGap: 5,
    continued: false
  })
  .font(font)
  .text(`expression shall, unless repugnant to the subject, context or meaning thereof, be deemed to include its \nsuccessors and permitted assigns) a term loan facility for the amount of ${req.body.whereAs?.rs}/- (Indian Rupees                  `, {
    indent: 40,
    lineGap: 5,
    continued: false
  })
  .font(fontBold)
  .text(`${req.body.whereAs?.textRs}\n`, { 
    indent: 40,
    lineGap: 5,
    continued: true
  })
  .font(font)
  .text(')"Facility") on the terms and conditions and securities mentioned in the Facility Agreement\n and the other documents executed/to be executed between the Borrower and the Lenders with respect\n to the Facility;', {
    align: 'left',
    indent: 40,
    lineGap: 5
  });


  doc.moveDown();
  doc.text(
    'B. The Guarantor has perused a copy of the Facility Agreement and other related documents ("Finance\n Documents") and is aware of and has understood the contents thereof;',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();

  doc.text(
    'C. One of the conditions on which the Facility is provided to the Borrower is that the Guarantor shall \ngive an irrevocable and unconditional personal guarantee in favour of the Lender for guaranteeing the\n due repayment of the Facility by the Borrower together with interest thereon, costs, charges, and \nexpenses and all other moneys as hereinafter contained;',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    'D. The Lender has called upon the Guarantor to give a guarantee which the Guarantor has, at the request\n of the Borrower, agreed to do in the manner hereinafter appearing;',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    'E. Capitalized terms used in this Deed and not specifically defined shall have the respective meaning\n assigned to them in the aforesaid Facility Agreement.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown(2);
  doc.text('NOW THESE PRESENTS WITNESSES AS FOLLOWS:', { align: 'left', indent: 40, underline: true });
  doc.moveDown();

  doc.text(
    '1. In consideration of the Lenders agreeing to provide the Facility to the Borrower, the Guarantor hereby\n agrees to issue this Deed in favour of the Lenders on the terms and conditions contained in this Deed.',
    { align: 'left', indent: 40, lineGap: 5 }
  );
  
  doc.moveDown();
  doc.text(
    '2. The Borrower has under the Facility Agreement agreed to duly and punctually repay/pay the entire\n outstanding amounts pertaining to the Facility stipulated in or payable under the Facility Agreement\n and other Finance Documents, and perform and comply with all the other terms, conditions, and\n covenants contained in the Facility Agreement and other Finance Documents.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();

  addFooter();

   //---------------------------------new page-------------------------------------------
     doc.addPage();
    addLogo();
    drawBorder();
  doc.moveDown(12);

  doc.font(font).fontSize(10).text(
    '3. The Guarantor does hereby irrevocably and unconditionally guarantee the due repayment to the\n Lenders on demand without demur and/or contestation and notwithstanding any dispute between the\n Lenders and the Borrower, of all the amounts including the principal sum of Rs. 500000/- along with\n interest, costs, and other charges as applicable under the said Facility and all indebtedness due and\n payable by the Borrower to the Lenders thereunder or any part thereof for the time being outstanding\n under the said Facility granted/agreed to be granted by the Lenders to the Borrower and all interest,\n commission, costs, charges, and expenses and all other moneys whatsoever due, owing, and payable by\n the Borrower to the Lender thereunder ("Said Dues"), in the event of failure on the part of the\n Borrower in repaying the same to the Lenders or discharging its liability thereunder (the decision of the\n Lenders as to such default/failure of the Borrower being final, conclusive, and binding on the Guarantor).',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown(1.5);
  doc.text(
    '4. The obligations hereunder bind the Guarantor and are also independent of the obligations of the\n Borrower, and a separate action may be brought and prosecuted against the Guarantor alone or\n jointly with the Borrower.',
    { align: 'left', indent: 40, lineGap: 5 }
  );
  
  doc.moveDown();
  doc.text(
    '5. In the event of the Guarantor\'s failure to pay to the Lenders the above monies in respect of the Said\n Dues forthwith on demand made by either or both the Lenders, then in such event, the aforesaid amount\n shall bear and carry Interest along with Default Interest at the rate mentioned in the Facility Agreement \nor such other rate as either or both the Lenders may in its/their absolute discretion stipulate, from the\n date of demand till the date of payment by the Guarantor.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown(2);
//   doc.text('...', { align: 'center' });

  // Add more clauses or content as needed...

  // Add a new page if necessary
//   doc.addPage();

  // Page 3 content
  doc.fontSize(10).text(
    '6. The Guarantor hereby represents and warrants to the Lenders on a continuing basis, that:',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown(0.5);
  doc.text(
    '(a) The Guarantor has full power and competence to execute this Deed and perform his obligations\n under the terms of this Deed and has the authority to own assets and to conduct the business,\n which he/she/it conducts and/or proposes to conduct and has taken all legal and other actions\n necessary or advisable to authorize the execution, delivery and performance of this Deed and to\n enable the Guarantor to lawfully enter into and comply with his obligations in this Deed\n and any other document to be executed along with any other authorization required to make this\n Deed admissible in evidence;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(b) This Deed and all documents, here under as required, when executed by the Guarantor will\n be valid and binding obligations of the Guarantor and enforceable in accordance with their\n respective terms;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(c) That the Guarantor is not in violation of and shall not violate any covenant, condition and\n stipulation under any existing agreement entered into by the Guarantor with any third party,\n ',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  addFooter();

   //---------------------------------new page-------------------------------------------
     doc.addPage();
    addLogo();
    drawBorder();
  doc.moveDown(12);
  doc.font(font).fontSize(10).text('by executing this Deed in favour of the Lenders in the manner herein mentioned;',
    { align: 'left', indent: 60, lineGap: 5 }
  )

  doc.moveDown();
  doc.font(font).fontSize(10).text(
    '(d) As on the date of execution of this Deed, there exists no security interest over any of the assets\n (whether movable, immovable, tangible or intangible) of the Guarantor which can adversely\n impact the performance of Guarantor under this Deed;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  // Move to new page (Page 4)
//   doc.addPage();
doc.moveDown();

  doc.fontSize(10).text(
    '(e) The Guarantor has received, read and understood the terms and conditions of the Facility\n Agreement and each of the Finance Documents (including this Deed) and agrees to be bound\n by all the terms and provisions thereof and hereof;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(f) There is no litigation, arbitration, administrative action, suit, proceeding or investigation\n pending or to the best knowledge of the Guarantor threatened by or against the Guarantor\n or the property of the Guarantor before any court of law or government authority or any other\n competent authority which might have a material effect on the financial and other affairs of the\n Guarantor or which might put into question the validity, enforceability or performance of this Deed\n or any of its provisions;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(g) All consents, approvals, clearances, permissions, authorizations or requirements required from\n any governmental authority or from any creditor of the Borrower or Guarantor or any other\n person for or in connection with the execution, validity and performance of this Deed have been\n obtained and are in full force and effect and have not been, or threatened to be, revoked or \ncancelled; and no other authorizations, approvals of and notice to any person is required for:',
    { align: 'left', indent: 60, lineGap: 5 }
  )
  .text(
    '(a) the due execution, delivery, filing or performance by the Guarantor of this Deed;',
    { align: 'left', indent: 80, lineGap: 5 }
  )
  .text(
    ' (b) the exercise by the Lender of its rights under this Deed;',
    { align: 'left', indent: 80, lineGap: 5 }
  )

  doc.moveDown();
  doc.text(
    '(h) The Guarantor shall intimate the Lenders, without delay, on the invocation of any of the\n Guarantor’s other guarantees, if any, by any third party;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(i) The net-worth certificate of the Guarantor furnished to the Lender is true and correct as\n on the date hereof;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(j) All information communicated to or supplied by or on behalf of the Guarantor to the Lenders\n from time to time in a form and manner acceptable to the Lenders is true, fair, correct and\n complete in all respects as on the date on which it was communicated or supplied; and nothing\n has occurred since the date of communication or supply of any information to the Lenders which\n renders such information untrue or misleading in any material respect;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(k) The Guarantor shall not be entitled to, and shall not claim immunity for himself or any of his',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  addFooter();

  // --------------------------- new page ---------------------------------
  doc.addPage();
  addLogo();
 drawBorder();
doc.moveDown(12);
doc.font(font).fontSize(10).text(
  '( assets from any suit, execution, attachment or other legal process in any proceedings in relation to\n this Deed;',
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();

  doc.font(font).fontSize(10).text(
    '(l) In the event of any disagreement or dispute between the Lenders and the Guarantor regarding\n the materiality or reasonableness of any matter including any event, occurrence, circumstance,\n change, fact, information, document, authorization, proceeding, act, omission, claims, breach,\n default or otherwise, the opinion of the Lenders as to the materiality or reasonableness of any\n of the foregoing shall be final and binding on the Guarantor;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(m) Any admission or acknowledgment given or deemed to have been given or any part payment\n made by the Borrower in respect of the Outstanding Amounts shall be binding on the\n Guarantor and the Guarantor shall not raise any objection in relation thereto;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(n) The Guarantor waives all his rights and remedies available to a Guarantor in Law, contract or in\n equity or otherwise howsoever and particularly those provided in Sections 132, 133, 134, 135,\n 136, 137, 138, 139 and 141 of the Indian Contract Act, 1872;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(o) The Guarantor has complied with all the laws, rules, regulations, and guidelines to the extent\n applicable on the Guarantor ("Applicable Law") in relation to the conduct of his business and\n is not subject to any present, potential, or threatened liability by reason of non-compliance with\n such Applicable Law;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '7. The Guarantor hereby indemnifies the Lenders and shall keep the Lenders indemnified and save\n harmless at all times while the Facility is/are outstanding, due and payable by the Borrower to the\n Lenders, against all actions, proceedings, claims and demands, duties, penalties, taxes, losses, damages,\n costs (including legal costs), charges (including stamp duty) and expenses and other liability what so \never which may be brought and made against or sustained or incurred by the Lenders by reason of\n having granted/agreed to grant the Facility to the Borrower.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  // Move to new page (Page 6)

  doc.text(
    '8. The Guarantor hereby unconditionally agrees and undertakes that:',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(i) his/her/its obligations under this Deed are continuing and shall extend to the ultimate balance\n of sums payable under the Facility Agreement;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(ii) he/she/it shall not sell, transfer, assign, dispose of, mortgage, charge, pledge or create any lien\n or in any way encumber his present and future immovable and movable properties, whether\n as sole or joint owner, whose sale, transfer, assignment, mortgage, charge, pledge or encumbrance\n would lead to a diminution in the net worth of the Guarantor, as provided in the net-worth ',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  addFooter();

  // --------------------------- new page ---------------------------------
  doc.addPage();
  addLogo();
 drawBorder();
doc.moveDown(12);
doc.font(font).fontSize(10).text(('\ncertificate as of the date of this Deed, submitted by the Guarantor to the Lenders, without the\n Lenders prior written consent till the obligations under this Deed are discharged in full;'),
{ align: 'left', indent: 60, lineGap: 5 }

);
doc.moveDown();
  doc.font(font).fontSize(10).text(
    '(iii) he/she/it shall make best efforts to cause the Borrower to duly and punctually repay all the\n Outstanding Amounts, including but not limited to any and all sums advanced by the Lender in\n order to preserve the Security or preserve its security interest in the Security, together with\n reasonable legal fees and court costs whatsoever stipulated in or payable under the Facility\n Agreement, and perform and comply with all the other terms, conditions and covenants contained\n in the Facility Agreement and other Finance Documents;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(iv) a certificate/statement in writing signed by a duly authorized official of either or both the\n Lenders shall act as conclusive evidence against the Guarantor of the amount for the time being\n due to the Lenders from the Borrower/Guarantor;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(v) it shall not be necessary for either or both the Lenders (i) to obtain judgment against the\n Borrower or the Guarantor in any court or other tribunal; or (ii) to make or file any claim\n in a bankruptcy or liquidation of the Borrower or the Guarantor; or (iii) to take any action\n or enforce its rights whatsoever against the Borrower or the Guarantor under the Facility\n Agreement or other Finance Documents;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(vi) the Guarantor waives the requirement of all such notices, formalities and rights to which it\n would otherwise be entitled to, and any term of this Deed or any other Finance Document\n shall not be required to be satisfied or fulfilled before proceeding against the Guarantor;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(vii) this Deed may be enforced by either or both the Lenders without having to exercise first\n recourse against any other security or rights or taking any other steps or proceedings against\n the Guarantor or any other person and may be enforced for any balance due even after either or\n both the Lenders have resorted to one or more other means of obtaining payment or discharge of\n the monies, obligations and liabilities hereby secured.',
    { align: 'left', indent: 60, lineGap: 5 }
  );
doc.moveDown();
  doc.text(
    '7. The Guarantor hereby indemnifies the Lenders and shall keep the Lenders indemnified and save\n harmless at all times while the Facility is/are outstanding, due and payable by the Borrower to\n the Lenders, against all actions, proceedings, claims and demands, duties, penalties, taxes, losses,\n damages, costs (including legal costs), charges (including stamp duty) and expenses and other\n liability whatsoever which may be brought and made against or sustained or incurred by the\n Lenders by reason of having granted/agreed to grant the Facility to the Borrower.',
    { align: 'left', indent: 40, lineGap: 5 }
  );


  addFooter();

  // ----------------------------------- new page ---------------------------------------------------------------------
  doc.addPage();
  addLogo();
 drawBorder();
doc.moveDown(12);

  
  doc.moveDown();
  doc.font(font).fontSize(10).text(
    '8. The Guarantor hereby unconditionally agrees and undertakes that:',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(i) his/her/its obligations under this Deed are continuing and shall extend to the ultimate balance of\n sums payable under the Facility Agreement;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(ii) he/she/it shall not sell, transfer, assign, dispose of, mortgage, charge, pledge or create any lien\n or in any way encumber his present and future immovable and movable properties, whether as sole\n or joint owner, whose sale, transfer, assignment, mortgage, charge, pledge or encumbrance would\n lead to a diminution in the net worth of the Guarantor, as provided in the net-worth certificate\n as of the date of this Deed, submitted by the Guarantor to the Lenders, without the Lenders\'\n prior written consent till the obligations under this Deed are discharged in full;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  // Move to new page (Page 8)
//   doc.addPage();

  doc.text(
    '(iii) he/she/it shall make best efforts to cause the Borrower to duly and punctually repay the\n Outstanding Amounts, including but not limited to any and all sums advanced by the Lender in\n order to preserve the Security or preserve its security interest in the Security, together with\n reasonable legal fees and court costs whatsoever stipulated in or payable under the Facility\n Agreement, and perform and comply with all the other terms, conditions and covenants\n contained in the Facility Agreement and other Finance Documents;',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '9. The Guarantor represents and warrants that the execution, delivery, and performance of this Deed\n does not conflict with or result in the breach of or constitute a default under any law, contract or\n agreement to which the Guarantor is a party or by which the Guarantor is bound.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '10. The Lenders may proceed against the Guarantor without first proceeding against the Borrower or\n any other person and without enforcing any other security that the Lenders may hold.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '11. This Deed is a continuing guarantee and shall remain in force and effect until the Borrower has fully\n repaid the Facility and all sums due under the Facility Agreement, and the Lenders have confirmed\n in writing the full discharge of the Borrower.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  // Move to new page (Page 9)
  // doc.addPage();
  doc.moveDown();

  doc.text(
    '12. The rights of the Lenders under this Deed are in addition to and not in derogation of the rights of the\n Lenders under any other guarantee or security now or hereafter held by the Lenders.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '13. This Deed shall not be affected by any absorption or amalgamation of the Lenders with any other\n company or concern or by any change in the Lenders\' constitution.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '14. The Guarantor shall not revoke this Deed during the subsistence of the Facility. Any such revocation\n shall not be effective unless the Lenders have expressly confirmed the same in writing.',
    { align: 'left', indent: 40, lineGap: 5 }
  );



addFooter();

//---------------------------------------- new page -------------------------------------------

doc.
addPage();
addLogo();
drawBorder();

doc.moveDown(12);

doc.font(font).fontSize(10).text(
  '15. Any indebtedness of the Borrower now or hereafter held by the Guarantor is hereby subordinated to\n the indebtedness of the Borrower to the Lenders and such indebtedness of the Borrower to the\n Guarantor, if the Lenders so requests, shall be collected, enforced and received by the Guarantor as trust\n for the Lenders and be paid over to the Lenders on account of the indebtedness of the Borrower to the\n Lenders but without reducing or affecting in any manner the liability of the Guarantor under the\n other provisions of this Deed.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '16. The either or both of the Lenders may proceed against and recover from the Guarantor’s property,\n including any credit balance or security held/to be held in future, by either or both of the Lenders\n on the Guarantor’s account by sale and/or otherwise and allocate and apply the net proceeds of sale\n and realization thereof and any other monies in either or both the Lender\'s hands standing to the\n Guarantor’s credit or belonging to the Guarantor on any account whatsoever, independently of the\n other in such order and in such manner as either or both the Lenders may think fit in or towards the\n payment of any monies payable by the Borrower/Guarantor to the Lenders hereunder.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 10)
// doc.addPage();

doc.text(
  '17. The Guarantor hereby undertakes to do, execute and perform on demand and at the Guarantor\'s cost\n all such acts, deeds and things as either or both the Lenders may require as further security or for \nindemnifying the Lenders hereunder and if so required by either or both the Lenders, to deposit with\n the Lenders cash or any security acceptable to the Lenders to cover the total liability and obligations of\n the Guarantor under this Deed.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '18. Any demand made under this Deed shall be deemed to have been duly given to the Guarantor by the\n Lender by sending the notice thereof through any e-mail, or sent by courier, registered post, and/or hand\n delivery at the address or e-mail ID as provided below, marked for the attention of the person(s) or\n department specified herein or on such address of the Guarantor as mentioned anywhere else in this \nDeed:',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(`Address: ${req.body.guarantorInformation?.address}`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Attention: ${req.body.guarantorInformation?.attention}`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Telephone: ${req.body.guarantorInformation?.telePhone}`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Email: ${req.body.guarantorInformation?.email}`, { align: 'left', indent: 40, lineGap: 5 });

doc.moveDown(1.5);
doc.text(
  '19. All demands shall be effective (a) if sent by e-mail, when sent; (b) if sent by hand delivery, when\n delivered; (c) if sent by courier, 3 (three) working days after deposit with a courier, and (d) if sent\n by registered letter, when the registered letter would, in the ordinary course of post,\n be delivered, whether actually delivered or not.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '20. Any demand made by either or both the Lenders upon the Guarantor pursuant to a demand notice ',
  { align: 'left', indent: 40, lineGap: 5 }
);

addFooter();

//------------------------------ next page -----------------------------------------------

doc.
addPage();
addLogo();
drawBorder();
doc.moveDown(12);

doc.font(font).fontSize(10).text(('shall be conclusive evidence that:'),
{ align: 'left', indent: 40, lineGap: 5 }
);

doc.font(font).fontSize(10).text(
  '20. Any demand made by either or both the Lenders upon the Guarantor pursuant to a demand notice\n shall be conclusive evidence that:',
  { align: 'left', indent: 40, lineGap: 5 }
);
doc.moveDown();
doc.text('(i) The Guarantor\'s liability hereunder has accrued; and', { align: 'left', indent: 60, lineGap: 5 });
doc.moveDown();

doc.text(
  '(ii) The extent of the Guarantor\'s liability is the amount shown in such demand notice.',
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();


// Move to new page (Page 11)
// doc.addPage();

doc.text(
  '21. The Lenders\' decision shall be final and binding on the Guarantor in respect of all matters concerning\n the amounts and/or this Deed.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '22. To the intent that the Lenders may obtain satisfaction of the whole of the Lenders\' claim against the\n Borrower, either or both the Lenders may enforce and recover upon this Deed for the full amount hereby\n guaranteed and interest thereon, notwithstanding any such proof or composition as stated in Clause 13\n above, and notwithstanding any other guarantee, security or remedy which either or both the Lenders\n may hold or be entitled to in respect of the sum hereby secured or any part thereof, and not with \nstanding any charges for interest which may be debited in the Lenders\' account for the Borrower or\ns in any count upon which the Borrower is liable.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '23. If at the time any demand is made under this Deed, any amount shall be due or owing or payable to \nthe Lenders by the Borrower in any currency or currencies other than that in which any Facility is/are\n expressed to have been granted, then (a) the obligation of the Guarantor shall be to make payment in\n such currency or currencies, but the Lenders shall be entitled, at its discretion, to require payment either\n in such currency or currencies or in the currency of the said Facility, or partly in one way and partly in\n the other, and (b) the said Facility shall be treated as a limit expressed in such other currency or (if more\n than one such other currency is involved) as a limit in the aggregate expressed in such other\n currency or currencies.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 12)
// doc.addPage();

doc.text(
  '24. Each payment to be made by the Guarantor under this Deed shall be made to the Lenders in the same\n currency as the said Facility, at the same place as that applicable to the Borrower\'s obligation or at the\n Lender\'s office address mentioned in this Deed or at such other place as that Lender shall designate. All\n such payments shall be made in full without set-off or counterclaim and free and clear of and without\n deduction of or withholding for or on account of any tax of any nature now or hereafter imposed.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '25. This Deed shall not be affected by any change in the constitution of the Borrower how so ever or\n by its absorption or by its amalgamation with any other company.',
  { align: 'left', indent: 40, lineGap: 5 }
);
doc.moveDown();



addFooter();

//-------------------------- next page -------------------------------------------------------

 doc.
 addPage();
 addLogo();
 drawBorder();

 doc.moveDown(12);
 doc.font(font).fontSize(10).text(
  '26. This Deed shall not be determined or in any manner prejudiced by any absorption and amalgamation\n or reconstitution or alteration in the status or change in the constitution of either or both the Lenders,\n but it shall inure and be available for the absorbing or amalgamated or reconstituted or altered or\n changed authority or body.',
  { align: 'left', indent: 40, lineGap: 5 }
);


 doc.moveDown();
 
  doc.font(font).fontSize(10).text(
    '27. This Deed shall be in addition and not in substitution of any other guarantee for the Borrower signed\n by the Guarantor that either or both the Lenders may at any time hold.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '28. In order to give effect to this Deed, the Lenders shall be entitled to act as if the Guarantor is the\n principal debtor to the Lenders for all payments and covenants hereby guaranteed.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '29. The Guarantor agrees that the Guarantor shall not be entitled to claim the benefit of any legal\n consequences of any variation of any contract entered into by the Borrower with the Lenders, the\n liability in respect of which is guaranteed by the Guarantor as aforesaid.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  // Move to new page (Page 13)
  // doc.addPage();
  doc.moveDown();

  doc.text(
    '30. The absence or infirmity of borrowing powers on the part of the Borrower or any irregularity in the\n exercise thereof shall not affect the Guarantor\'s liability, and any monies advanced to the Borrower shall\n be deemed to be due and owing notwithstanding such absence, infirmity, or irregularity, and this\n Deed shall not be affected by any change in the name, by death or otherwise howsoever.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '31. This Deed shall not be affected by the death, incapacity, or any other contractual inability of the\n Guarantor. In such a case, the liabilities and obligations of the Guarantor shall be transferred to the legal\n representatives, legal heirs, permitted assigns, or successors, as the case may be. It shall be the duty of\n the legal representatives, legal heirs, permitted assigns, or successors, as the case may be, to keep the\n Lenders informed of any such incident, death or incapacity, etc., and intimate the same in writing with a\n new contact and address that can be used by the Lenders.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '32. The Guarantor hereby declares and agrees that he has not received and shall not, without the prior\n consent in writing of the Lenders, receive any security, fee, or commission from the Borrower for\n giving this Deed so long as any monies remain due and payable by the Borrower to the Lenders under\n the Facility Agreement.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '33. This Deed shall be enforceable against the Guarantor notwithstanding that the securities created/to\n be created by the Borrower or by the Guarantor or any other collateral securities that either or both\n the Lenders might obtain/have obtained from the Guarantor or the Borrower or any negotiable or other\n securities referred to herein or to which it may extend or be applicable shall at the time of proceedings\n being taken against the Guarantor on this Deed be outstanding or unrealized.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  addFooter();


//-------------------------------new page --------------------------------------------------------------
  doc.addPage();
  addLogo();
  drawBorder()

  doc.moveDown(12);

  doc.font(font).fontSize(10).text(
    '34. In addition to all liens upon, and rights of set-off against the monies, securities, or other property of\n the Guarantor given/available to the Lenders by/under the Applicable Law, the Lenders shall have a right\n of lien upon and a right of set-off against, all monies, securities, and other property of the Guarantor\n now or hereafter in the possession of or on deposit with the Lenders, whether held in a general or\n special account or deposit, or for safekeeping or otherwise. Every such lien and right of set-off may be\n exercised without demand upon or notice to the Guarantor. No lien or right of set-off shall be deemed to\n have been waived by any act or conduct on the part of either or both the Lenders, or by any neglect to\n exercise such right of set-off or to enforce such lien, or by any delay in so doing, and every right of\n set-off and lien shall continue in full force and effect until such rights of set-off or lien is specifically\n waived or released by an instrument in writing executed by either or both the Lenders.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '35. The Guarantor hereby accepts and confirms that as a precondition to the grant of the Facility by the\n Lenders to the Borrower, and the Guarantor in turn furnishing this Guarantee in relation there to, the\n Lenders may require consent of the Guarantor for disclosure of information and data relating to the\n Guarantor, any credit facility availed of by the Guarantor in relation thereto, and default, if any,\n committed in the discharge thereof.',
    { align: 'left', indent: 40, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(a) Accordingly, the Guarantor hereby agrees and gives consent for the disclosure by either or both\n the Lenders of all or any such:',
    { align: 'left', indent: 60, lineGap: 5 }
  );
  doc.text(
    '(1) Information and data relating to the Guarantor;',
    { align: 'left', indent: 80, lineGap: 5 }
  );
  doc.text(
    '(2) Information or data relating to the Guarantor’s obligations in any credit facility granted/to\n be granted by the Lenders and guaranteed by the Guarantor; and',
    { align: 'left', indent: 80, lineGap: 5 }
  );
  doc.text(
    '(3) Default, if any, committed by the Guarantor in discharge of such obligation, as the Lenders\n may deem appropriate and necessary,to disclose and furnish to Trans Union CIBIL Limited\n and any other agency authorized in this behalf by the Reserve Bank of India.',
    { align: 'left', indent: 80, lineGap: 5 }
  );


  // doc.text(
  //   // 'to disclose and furnish to Trans Union CIBIL Limited and any other agency authorized in this behalf by the Reserve Bank of India.',
  //   { align: 'left', indent: 40, lineGap: 5 }
  // );

  doc.moveDown();
  doc.text(
    '(b) The Guarantor further declares that all the information and data furnished by the Guarantor to\n the Lenders are and shall be true and correct.',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.moveDown();
  doc.text(
    '(c) The Guarantor further undertakes and declares that:',
    { align: 'left', indent: 60, lineGap: 5 }
  );

  doc.text(
    '(i) The Trans Union CIBIL Limited and any other agency so authorized may use, process the\n said information and data disclosed by either or both the Lenders in the manner as deemed\n fit by it/them; and',
    { align: 'left', indent: 80, lineGap: 5 }
  );

  doc.moveDown();
  

 addFooter();

 //---------------------------------------- new page --------------------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();

doc.moveDown(12)

doc.font(font).fontSize(10).text(
  '36. This Deed shall inure for the benefit of the Lenders\' successors, transferees, novatees, and assigns,\n and shall be binding on the Guarantor, his estate, effects, heirs, legal representatives, executors,\n administrators, successors, and permitted assigns. The Guarantor shall not be entitled to assign his\n obligations and/or rights (if any) under this Deed without the Lenders\' prior written permission there of.',
  { align: 'left', indent: 40, lineGap: 5 }
);
doc.moveDown();
doc.text(
  '37. The Guarantor specifically agrees and confirms that all matters concerning this Deed or arising\n there from or relating thereto, shall be governed by and construed in all respects with Indian laws,\n and any matter or issues arising hereunder or any dispute hereunder shall, at the option/discretion of\n the Lenders, be subject to the exclusive jurisdiction of the courts as may be chosen by the Lender/s\n in its/their discretion.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '38. It shall be lawful for either or both of the Lenders or its/their agent(s), nominees, officer(s), or\n employee(s) forthwith and without any notice to the Guarantor to enter into or upon any place or\n premises where any of the receivables and books of accounts, papers, documents, and vouchers and\n other records relating thereto may be situated or kept stored, and for the purpose of such entry, if\n necessary, to do all acts, deeds, and things deemed necessary by either or both of the Lenders, and to\n inspect, value, insure, superintend disposal and/or take particulars of all or any part of the receivables\n and/or the security, and check any statement, accounts, reports, and information.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 16)
// doc.addPage();
doc.moveDown();

doc.text(
  '39. It is hereby expressly agreed between the Parties that even if by any act of legislation and/or by any\n act of the state and/or central government, the Borrower\'s debts under the said Facility to the \nLenders are suspended or cancelled, the Guarantor shall never the less be bound to pay to the Lenders\n all the amounts demanded by either or both of the Lenders from the Guarantor hereunder.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '40. Either or both of the Lenders shall be at liberty to exercise any powers or authority exercisable\n hereunder and to file any suits or legal proceedings for recovery of the outstanding amounts under\n the Facility along with other charges, and to take steps to realize or enforce this Deed, in the manner\n it/they think fit, either jointly or severally.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '41. No failure or delay on the part of either or both the Lenders to exercise any power, right, or remedy\n under this Deed shall operate as a waiver thereof, nor shall any single or partial exercise by either or\n both the Lenders of any power, right, or remedy preclude any other or further exercise there of, or\n the exercise of any other power, right, or remedy. The remedies provided in this Deed are cumulative\n and are not exclusive of any remedies provided under the Applicable Law.',
  { align: 'left', indent: 40, lineGap: 5 }
);
addFooter();

//--------------------------------- next page ----------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();

doc.moveDown(10);

doc.moveDown(2);
doc.moveDown();
doc.font(font).fontSize(10).text(
  '42. The Guarantor agrees to be bound by this Deed notwithstanding that any other person/entity \nintended to execute or to be bound by any other guarantee or assurance under or pursuant to the \nFinance Documents may not do so, or may not be effectually bound, and not with standing that \nsuch other guarantee or assurance may be determined, or be or become invalid or unenforceable \nagainst any other person/entity, whether or not the deficiency is known to the Lenders or any of them.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 17)
 doc.moveDown();

doc.text(
  '43. If, at any time, any provision of this Deed is or becomes illegal, invalid, or unenforceable in any \nrespect under any law of any jurisdiction, neither the legality, validity, or enforceability of the \nremaining provisions nor the legality, validity, or enforceability of such provision in any other respect or \nunder the law of any other jurisdiction will be affected or impaired in any way.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '44. The terms of this Deed may be amended only by an instrument in writing signed by the Guarantor \nand by an authorized signatory on behalf of the Lenders.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown(2);
doc.font(fontBold).text('Signature:', { align: 'left', indent: 40 });
doc.moveDown();

// doc.text('Name: KANHAIYALAL DANGI ', { align: 'left', indent: 40 });
doc.font('Times-Roman').text('Name: ', {
  align: 'left',
  indent: 40,
  continued: true 
});

doc.font('Times-Bold').fontSize(13).text(`${req.body.guarantorNameandsign?.name}`, {
  align: 'left'
})
.text('                       (Guarantor)', { align: 'left' })
;
// doc.fontSize(10).text('(Guarantor)', { align: 'left' });

addFooter();

//--------------------------------- next page ----------------------------------------------------------------

doc.addPage();
addLogo();
drawBorder();

doc.moveDown(10);

doc.moveDown(2);
doc.font(fontBold).fontSize(10). text('SCHEDULE-I', { align: 'center', underline: true });
doc.moveDown();
doc.text('Form of Demand Certificate', { align: 'center' });

doc.moveDown(2);
doc.font(font).text(`Dated: ${req.body.formofDemandCertificate?.date}`, { align: 'left', indent: 40 });

doc.moveDown();

doc.text('________________________________', { align: 'left', indent: 40 });

doc.moveDown();
doc.text('_____________  ________________', { align: 'left', indent: 40 });

doc.moveDown();
doc.text('_______________________________', { align: 'left', indent: 40 });

doc.moveDown();
doc.text('Dear Sir,', { align: 'left', indent: 40 });
doc.moveDown();
doc.font(fontBold).text(
  'Re: Payment under Deed of Guarantee dated [•]',
  { align: 'left', indent: 40 }
);

doc.moveDown();
doc.font(font).text(
  `We refer to the Deed of Guarantee dated [•], as amended from time to time ("Guarantee Deed") executed \nby Mr. ${req.body.formofDemandCertificate?.executedBy} in favour of FIN COOPERS CAPITAL PVT LTD and ${req.body.formofDemandCertificate?.comapnyName2}`,
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 18)
// doc.addPage();
doc.moveDown();

doc.text(
  'This is a demand certificate issued under the provisions of the Guarantee Deed.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
  
doc.text('Please note that an amount of INR[•]Is outstanding from the[3 or rower in terms of the Facility \n Agreement dated fill.',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  `Accordingly, we hereby give you notice pursuant to the Guarantee Deed that you are required to make \n  payment of INR [•] to the Lender towards the discharge of the Outstanding Amounts.`,
  { width:500,align: 'left', indent: 40, lineGap: 5 , }
);

doc.moveDown();

doc.moveDown();

doc.text(
  'Please make such payment on or before [•] in the following account:',
  { align: 'left', indent: 40, lineGap: 5 }
);
doc.moveDown(4);
doc.text(
  `Capitalised terms used herein and not defined shall have the meanings ascribed to such terms in the\n Guarantee Deed.`,
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.font(fontBold).text('Yours faithfully,,', { align: 'left', indent: 40 });

doc.moveDown();
doc.font(font).text(`For ; ${req.body.formofDemandCertificate?.yourfaithfully},`, { align: 'left', indent: 40 });

doc.moveDown();
doc.text('(Authorized Signatory),', { align: 'left', indent: 40 });

doc.moveDown();
doc.text('______________________,', { align: 'left', indent: 40 });


addFooter();
  

    //Format the borrower details to the left side
    // doc
    //   .font(font)
    //   .fontSize(8)
    //   .fillColor("black")
    //   .text(
    //     `Date: 25/09/2024\n` +
    //       `Name of Borrower: PARMANAND BALAI\n` +
    //       `Address of Borrower: MAKAN N96 WARD N17, FATEHPURCHIKALI FATEHPUCRKHEDA, MANDSAUR, MADHYA PRADESH 458990\n` +
    //       `Mobile No. of Borrower: 7489524050\n` +
    //       `Name of Co-borrowers: LILABAI BALAI\n` +
    //       `Name of Guarantor: RAMESHWAR\n` +
    //       `Branch Name: SHAMGARH\n` +
    //       `Subject: Loan Number: GEN280\n`,
    //     {
    //       lineGap: 2,
    //       align: "left",
    //     }
    //   );  
  
    // Add a function to draw black table borders
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
  
    // const loanTableData = [
    //   { field1: "Loan Type ", value1: "Loan (“Facility”)" },
    //   { field1: "Program Name", value1: "SECURED PROGRAM" },
    //   { field1: "Loan Amount Sanctioned", value1: "Rs. 430000" },
    //   { field1: "Purpose of the Loan", value1: "Business Purpose" },
    //   { field1: "Tenure of the Loan", value1: "47 months" },
    //   { field1: "Principal Moratorium (applicable months)", value1: "NA" },
    //   { field1: "Interest Type", value1: "Floating" },
    //   { field1: "Interest Payable", value1: "Monthly" },
    //   { field1: "Current FIN COOPERS Reference Rate", value1: "15% per annum" },
    //   {
    //     field1: "Applicable Floating Rate of Interest (Current URR +/- Margin)",
    //     value1: "15% + 8% =23%per annum",
    //   },
    //   {
    //     field1: "Installment Amount/ Graded Installments",
    //     value1: "Rs 13963 for a period of 47 months",
    //   },
    //   {
    //     field1: "Break up of total amount payable (Excluding Pre EMI)",
    //     value1:
    //       "Principal: Rs. 430000   |   Interest: Rs. 226215  |   Total: Rs. 656215",
    //   },
    //   { field1: "Frequency of repayment", value1: "10th of every month" },
    //   {
    //     field1:
    //       "EMI/ Installment date (Exact dates of repayment depends on the disbursement date and the same shall be mentioned in the loan agreement and repayment schedule whicand repayment schedule which shall be shared with the Borrower post disbursement)",
    //     value1: "SECURED",
    //   },
    //   { field1: "IMD Received", value1: "NIL" },
    //   {
    //     field1: "Fees and Other Charges",
    //     value1:
    //       "Processing Fee: 2 % + GST Pre-EMI (Per Day): As Applicable Fee received with Application Form: NA CERSAI charges: As applicable (* subject to realization of funds)",
    //   },
    //   { field1: "Number of Advance Installments", value1: "SECURED" },
    //   { field1: "Installment Mode", value1: "NACH/ CHEQUE" },
    //   {
    //     field1: "Details of the security to be provided for the loan",
    //     value1:
    //       "HOUSE NO 85 SURVEY NO 122 PATWARI HALKA NO 77 WARD NO 07 VILLAGE RASULPURA GRAM PANCHYAT KALPONI TEHSIL KHUJNER DISTRICT RAJGARH STATE MADHYA PRADESH PIN CODE 465687",
    //   },
    //   {
    //     field1: "DSRA",
    //     value1: "NA",
    //   },
    //   {
    //     field1:
    //       "Foreclosure Charges* Please note that there are no charges on foreclosure or prepayment on floating rate term loans sanctioned    only to individual borrowers for other than business purposes",
    //     value1:
    //       "6% of principal outstanding for loan foreclosed within 12 months of loan sanction.· 4% of principal outstanding for loan foreclosed after 12 months of loan sanction",
    //   },
    // ];
    // drawTable(loanTableData);
    addFooter();
    //---------------------------------------------------new page---------------------------------------------------------------
  //   doc.addPage();
  //   addLogo();
  //   drawBorder();
  
  //   doc.moveDown(15);
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       `Please note that the facility will be subject to the following terms and conditions:
  
  // Current FIN COOPERS Reference Rate:
  // 1.Applicable rate of interest is annualized & floating/fixed in nature and is linked to benchmark FIN COOPERS Reference Rate (URR%) on the date of disbursement and may be notified/announced by FIN COOPERS.
  // 2.This sanction is subject to positive credit reports with a credit information company and the FCUI, if reported payment/clearance of processing/ arrangement fee.
  // 3.Any material fact concerning the borrower's/guarantor's income/ability to repay/any other relevant aspect should be disclosed and not suppressed or concealed in your proposal for the Facility.
  // 4.Disbursement of the Facility (if any, shall be released only after the receipt of required property title documents, any other documents and details to the satisfaction of FIN COOPERS).
  // 5.All statutory taxes, duties and levies under the applicable laws, as amended from time to time, shall be additionally payable by you.`,
  //       {
  //         lineGap: 2,
  //         align: "left",
  //         align: "justify",
  //       }
  //     );
  //   doc.moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       `The additional sanction conditions applicable are:
  
  // 1.Positive FI Report
  // 2.Technical Report to be uploaded in DOPS`,
  //       {
  //         lineGap: 1,
  //         align: "left",
  //         align: "justify",
  //       }
  //     );
  //   doc.moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       `We wish to inform you that the issuance of this in-principle sanction letter shall not guarantee the loan disbursement which will be done at the sole discretion of FIN COOPERS. It shall neither constitute an offer nor a contract.
  
  // As and when execution of this sanction, you are requested to furnish a copy of letter duly signed and accepted by you and other co-borrower(s). The sanction is valid for a period of 60 days from the date of issuance.
  
  // FIN COOPERS reserves the rights to assign/sell/transfer or secure the sanctioned amount under the Facility or any part thereof with any other financial institution or as may be stipulated by FIN COOPERS in its absolute discretion. In case of such transfer/assignment, the taking over bank/assignee will also have the right to step into the rights and obligations of FIN COOPERS under the Facility and carry out a valuation, if required.
  
  // For any query you may have regarding the sanctioning of this loan facility, kindly contact our customer service team through any of the channels mentioned below.
  
  
  // Yours Sincerely,
  
  
  // Authorized Signatory
  // FIN COOPERS CAPITAL PVT LTD`,
  //       {
  //         lineGap: 1,
  //         align: "left",
  //         align: "justify",
  //       }
  //     );
  //   doc.moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       `I/We understand and accept the above terms and conditions for availing the Facility.
  // Applicant Name: RADHA BAI                                                      Co-applicant Name: MANOJ NAGAR
  // Signature:                                                                          Signature:
        
  
  // Place: PACHORE                                                                 Place: PACHORE
  // Date: 10/10/2024                                                               Date: 10/10/2024
  
  // Guarantor Name: KAILASHCHANDRA NAGAR
  // Signature:
  
  
  // Place: PACHORE
  // Date: 10/10/2024
  // `,
  //       {
  //         lineGap: 1,
  //         align: "left",
  //         align: "justify",
  //       }
  //     );
  //   doc.moveDown(1);
  //   // Add footer at the end of the second page
  //   addFooter();
  //   //------------------------------------------------------------new page----------------------------------------------
  //   doc.addPage();
  //   addLogo();
  //   drawBorder();
  //   // Add title and content from the image
  //   doc.moveDown(13);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text("For any inquiry:")
  //     .moveDown(0.2);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text("Call us at: +91 7374911911")
  //     .text("Email us at: info@fincoopers.com")
  //     .text(
  //       "Write to us at — FIN COOPERS CAPITAL Pvt Ltd. 174/3 Nehru Nagar, Indore-452011 (MP)"
  //     )
  //     .moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text("Other terms and conditions", { underline: true })
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text(
  //       "1. Disbursement shall be subject to execution of transaction documents and creation of security and the facility/loan agreement and other transaction documents may/will contain terms and conditions in addition to or in modification of those set out in this letter."
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text(
  //       "2. The continuance of the Facility is subject to cancellation and/or repayment to FIN COOPERS on demand without assigning any reason for the same."
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(9)
  //     .fillColor("black")
  //     .text(
  //       "3. The Repayments shall be made to the designated bank account of FIN COOPERS, details of which are as under or such other designated account as may be intimated by FIN COOPERS to the borrower:"
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text("   Bank Account Number - 777750987979")
  //     .text("   Bank Account Name - FIN COOPERS CAPITAL PVT LTD")
  //     .text("   Bank Name - ICICI BANK")
  //     .text("   Branch Name - Molar Patar")
  //     .text("   IFSC Code - ICIC00000041")
  //     .moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "4. FIN COOPERS is entitled to add, delete or modify all or any of the terms and conditions for the facility and/or the Standard Terms applicable to the Facility."
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "5. The borrower(s) shall immediately intimate FIN COOPERS in the event of any change in the repayment capacity of the borrower, including a loss/change of job/profession or any change in the information submitted earlier."
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "6. You have an option to insure the secured loan by obtaining an insurance policy for the loan facility availed in full or part disbursal. You are free to avail insurance from any of the insurance intermediaries and companies operating in the market. We will not bind you to buy insurance premium separately as applicable."
  //     )
  //     .moveDown(0.5);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "7. Please note that risk-based pricing is determined based on the risk associated with the type of loan (Risk Gradation), cost of funds, tenor of the loan, collateral provided, and your credit score. In addition, there is a regular interest and risk rate grid where interest rates and weighted averages with a comparison of offerings. An additional premium may be charged in some cases. Risk Pricing is a primary driver behind the determination of interest rates as a function of the credit standing, historical performance of the customer/borrower, and some other factors within the grading scale of the lending institution."
  //     )
  //     .moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "FIN COOPERS is entitled to take any action for interest reset by FIN COOPERS on the sanctioned proposed loan facility. FIN COOPERS shall not be obligated to issue any letter post such reset. This letter will form part of the proposed loan facility."
  //     )
  //     .moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text(
  //       "In case of a floating rate loan, the interest rate shall be linked to the rate of the RBI Variable URR. Interest shall increase or decrease with any revision in URR."
  //     )
  //     .moveDown(1);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text("Clarification on due dates and defaults:")
  //     .text(
  //       "If any of the amounts or instalments are not received before the Lender’s fixed due date, the same shall be considered as overdue and reported in the credit bureau’s record."
  //     )
  //     .moveDown(3);
  
  //   doc
  //     .font(font)
  //     .fontSize(8)
  //     .fillColor("black")
  //     .text("FIN COOPERS CAPITAL PRIVATE LIMITED")
  //     .text("Registered Office Address: 174/3, Nehru Nagar, Indore-452011 (M.P.)")
  //     .text("CIN: 61720MP1994PTC008866")
  //     .text("Mobile No: +91 7374911911")
  //     .text("Email: info@fincoopers.com");
  //   addFooter();
  
    // Finalize the PDF
    doc.end();
  
    const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;
  
    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(pdfFileUrl);
      });
      stream.on("error", reject);
    });
  }
  
  // ------------------HRMS  create offer letter pdf ---------------------------------------
  
  async function generatePgDeedSangitaPdf(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return serverValidation({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }

      const pdfPath = await sanctionLetterPdf(req);
      // console.log("pdfPath", pdfPath);
      console.log("http://localhost:5500" + pdfPath);
  
      if (!pdfPath) {
        return res.status(500).json({
          errorName: "pdfGenerationError",
          message: "Error generating the Sanction Letter Pdf",
        });
      }
  
      success(res, "PDF generated successfully", pdfPath);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  }
  
  module.exports = { sanctionLetterPdf, generatePgDeedSangitaPdf };
  