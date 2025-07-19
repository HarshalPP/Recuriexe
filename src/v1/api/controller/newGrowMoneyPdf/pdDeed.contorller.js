const {
  success,
  unknownError,
  serverValidation,
  badRequest,
} = require("../../../../../globalHelper/response.globalHelper");;

const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const { validationResult } = require("express-validator");
  const stream = require('stream')
  //   const { uploadToSpaces } = require("../../services/spaces.service.js")
  const uploadToSpaces = require("../../services/spaces.service.js");
  const mongoose = require("mongoose");

  
    const { EventEmitter } = require('events');
  const myEmitter = new EventEmitter();
const pdfLogo = path.join(
  __dirname,
  "../../../../assets/image/FINCOOPERSLOGO.png"
);
const watermarklogo = path.join(
  __dirname,
  "../../../../assets/image/watermarklogo.png"
);

const customerModel = require('../../model/customer.model.js')
const coApplicantModel = require('../../model/co-Applicant.model')
const guarantorModel = require('../../model/guarantorDetail.model')
const applicantModel = require('../../model/applicant.model')
const technicalModel = require('../../model/branchPendency/approverTechnicalFormModel')
const appPdcModel = require('../../model/branchPendency/appPdc.model')
const { initESign } = require('../../services/legality.services.js')
const extnalvenderModel = require("../../model/externalManager/externalVendorDynamic.model")
const sanctionModel =  require('../../model/finalApproval/sanctionPendency.model')
const finalsanctionModel =  require('../../model/finalSanction/finalSnction.model')
const externalBranchModel = require("../../model/adminMaster/newBranch.model.js");

// Helper function to capitalize the first letter of each word in a name
function capitalizeFirstLetter(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

async function PgDeedLetterPdf(allPerameters, logo,partnerName) {
  const font = "assets/font/Cambria.ttf";
  const fontBold = "assets/font/Cambria-Bold.ttf";
  // const baseDir = path.join("./uploads/");
  // const outputDir = path.join(baseDir, "pdf/");

  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  // Buffer to hold the PDF content
  const buffers = [];
  doc.on('data', (chunk) => buffers.push(chunk));
  doc.on('end', () => console.log('PDF generated successfully!'));

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
  // function addLogo() {
  //   if (fs.existsSync(logo)) {
  //     doc.image(logo, 400, 50, {
  //       fit: [150, 50],
  //       align: "right",
  //       valign: "bottom",
  //     });
  //   } else {
  //     console.error(`Logo file not found at: ${logo}`);
  //   }
  // }

   const FinpdfLogo = path.join(
          __dirname,
          "../../../../../assets/image/FINCOOPERSLOGO.png"
        );
  
      function addLogo() {
            if (fs.existsSync(FinpdfLogo)) {
              doc.image(FinpdfLogo, 400, 50, { fit: [150, 50], align: "left", valign: "bottom" });
            } else {
              console.error(`Logo file not found at: ${FinpdfLogo}`);
            }
        
            if (fs.existsSync(logo)) {
                    doc.image(logo, 40, 50, {
                      fit: [150, 50],
                      align: "right",
                      valign: "bottom",
                    });
                  } else {
                    console.error(`Left logo file not found at: ${logo}`);
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
    if( partnerName == "GROW MONEY CAPITAL PVT LTD"){
      const pageWidth = doc.page.margins.left;
      const pageHeight = doc.page.height;
  
      doc
        .font(fontBold)
        .fontSize(6.3)
        .fillColor("#324e98")
        .text("Grow Money Capital Pvt Ltd", pageWidth, pageHeight - 80, {
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
    }else {
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
   
  }

  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir, { recursive: true });
  // }

  const timestamp = Date.now();
  // const candidateName = capitalizeFirstLetter(`${candidateDetails.name}`); // Capitalize name
  // const pdfFilename = `PGDEEDSANGITA.pdf`;
  // const pdfPath = path.join(outputDir, pdfFilename);

  // const doc = new PDFDocument({ margin: 50, size: "A4" });
  // const stream = fs.createWriteStream(pdfPath);

  // doc.pipe(stream);

  // Add logo and border to the first page
  //addLogo();
  //   addWatermark();
  //drawBorder();

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
.text(`${allPerameters.guarantorName}`, { align: "center" });


// Get the text width to calculate line size
const textWidth = doc.widthOfString(``);
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

doc.fontSize(12).text('GROW MONEY CAPITAL PVT LTD', { align: 'center' });
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
doc.fontSize(12).text(``, { align: 'center' });
doc
.strokeColor('gray')         // Set the color to gray
.lineWidth(1)                // Set the thickness of the line
.moveTo(textX, doc.y)        // Start point of the line
.lineTo(textX + textWidth, doc.y)  // End point of the line
.stroke();        
doc.moveDown(0.2);

 doc.fontSize(10).text('(as the lender)', { align: 'center' });

//  addFooter();

 //---------------------------------new page-------------------------------------------
   doc.addPage();
  ////addLogo();
//  //drawBorder();
doc.moveDown(7);


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
.font('Helvetica-Bold').text(` ${allPerameters.place}`, {
  continued: true, 
})
.font('Helvetica').text(' , on this ', {
  align: 'left',
  indent: 40,
  lineGap: 5,
  continued: true

})
.font('Helvetica-Bold').text(`${allPerameters.day} `, {
  continued: true,
})
.font('Helvetica').text(',day Of', {
  align: 'left',
  indent: 40,
  lineGap: 5,
  continued: true

})
.font('Helvetica-Bold').text(` ${allPerameters.month}`, {
  continued: true
})

.font('Helvetica').text(` ,\n ${allPerameters.year} ("Execution Date"):`, {
  align: 'left',
  indent: 40,
  lineGap: 5,

})

doc.moveDown(0.5);

doc.text('BY', { align: 'center', indent: 40,    lineGap: 5,
});
doc.moveDown(0.5); 

doc.
font(fontBold).text(`${allPerameters.guarantorName}`, {
  align: 'left', indent: 40,
  continued: true,
})
.font(font).text(
  ' , Indian resident, aged ,',
  { align: 'left', indent: 40, lineGap: 5 , continued: true,
  }

)
.
font(fontBold).text(`${allPerameters.guarantorAge}`, {
  align: 'left', indent: 40,
  continued: true,
})
.font(font).text(
  ', son of MR.',
  { align: 'left', indent: 40, lineGap: 5,    continued: true,
  }
)
.
font(fontBold).text(`${allPerameters.guarantorFatherName}`, {
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
  font(fontBold).text(`${allPerameters.guarantorPanNo}`, {

  align: 'left', indent: 40,continued: true
})

  .font(font).text(
    ' residing at ,',
    { align: 'left', indent: 40, lineGap: 5,    continued: true,
    }
  )
  .
font(fontBold).text(`${allPerameters.place}`, {
  align: 'left', indent: 40,
})
.font(font).text(
  `(here in after referred to as "Guarantor", which expression shall, unless repugnant to the subject or\n context thereof, include his heirs, executors, administrators, successors-in - interest and permitted\n assigns),`,
  { align: 'left', indent: 40, lineGap: 5 }
)


doc.moveDown(0.5);
doc.text('IN FAVOUR OF', { align: 'center', indent: 40 });
doc.moveDown(1);

doc.font(font).text(
  `GROW MONEY CAPITAL PVT LTD, a company incorporated under the Companies Act, 1956 with \ncorporate identity number U74899DL1995PTC069216, registered as a non-banking financial \nservices company with in the meaning of the Reserve Bank of India ("RBI") Act, 1934 and having \nits registered office at 401,New Delhi House,27 Barakhamba Road, Connaught Place,New Delhi-`,
  { align: 'left', indent: 40,lineGap: 5 ,
  }
)
doc.font(font).text(
  `110001 (M.P.)  (here in after referred to as the.`,
  { align: 'left', indent: 40,lineGap: 5,continued: true ,
  }
)
.
font(fontBold).text(`"Lender 1"`, {
  align: 'left', indent: 40,lineGap:  5,continued: true,

})
.font(font).text(
  ', which expression shall, unless repugnant to the subject or context there of,be \ndeemed to include its successors, transferes, novatees, and assigns).',
  { align: 'left', indent: 40, lineGap: 5 }
)
;

doc.moveDown(1.5);

doc.fontSize(12).text('AND', { align: 'center' });
doc.moveDown(2);



doc.fontSize(10)
.font(font)
.text(`_________________________ a company incorporated under the Companies Act, 1956/2013 and having its \nregistered office at                   `, {
  align: 'left',
  indent: 40,
  lineGap: 5,
  continued: true 
})
.font(fontBold)
.text(`${allPerameters.place}`, {
  continued: true  // bold part on the same line
})
.font(font)
.text(' as a non-banking financial services company with the RBI (here \nin after referred to as the "Lender 2", which expression shall, unless repugnant to the context or meaning \nthereof,be deemed to include its successors, transferees, novatees, and assigns).', {
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


// addFooter();

 //---------------------------------new page-------------------------------------------
   doc.addPage();
  ////addLogo();
//  //drawBorder();
doc.moveDown(7);


doc.font('Helvetica-Bold').fontSize(10).text('WHERE AS', { align: 'center'});
doc.moveDown(3);

// Adding WHEREAS clauses
// doc.font(font).text(
//   'A. In terms of the facility agreement dated 10/10/2024 ("Facility Agreement"), the Lenders have granted\n or agreed to grant to SANGITA BAI (hereinafter referred to as the "Borrower", which expression\n shall, unless repugnant to the subject, context or meaning thereof, be deemed to include its successors and permitted assigns) a term loan facility for the amount of 500000/- (Indian Rupees FIVE LAKH) ("Facility") on the terms and conditions and securities mentioned in the Facility Agreement and the other documents executed/to be executed between the Borrower and the Lenders with respect to the Facility;',
//   { align: 'left', indent: 40, lineGap: 5 }
// );
doc
.font(font)
.text(`A. In terms of the facility agreement dated ${allPerameters.aggrementDate} (`, {
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
.text(`${allPerameters.customerName}`, { 
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
  // continued: true
})
.font(font)
.text(', which ', {
  indent: 40,
  lineGap: 5,
  continued: true
})
.font(font)
.text(`expression shall, unless repugnant to the subject, context or meaning thereof, be deemed to \ninclude its successors and permitted assigns) a term loan facility for the amount of ${allPerameters.loanAmount}/-                `, {
  indent: 40,
  lineGap: 5,
  continued: false
})
.text(`(Indian Rupees  `, {
  indent: 40,
  lineGap: 5,
  continued: true
})
.font(fontBold)
.text(`${allPerameters.loanAmountinwords}\n`, { 
  indent: 40,
  lineGap: 5,
  continued: true
})
.font(font)
.text(')"Facility") on the terms and conditions and securities \nmentioned in the Facility Agreement and the other documents executed/to be executed between the \nBorrower and the Lenders with respect to the Facility;', {
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

// doc.moveDown();

// addFooter();

 //---------------------------------new page-------------------------------------------
doc.addPage();
// addLogo();
// drawBorder();
doc.moveDown(7);

doc.font(font).fontSize(10).text(
  `3. The Guarantor does hereby irrevocably and unconditionally guarantee the due repayment to the\n Lenders on demand without demur and/or contestation and notwithstanding any dispute between the\n Lenders and the Borrower, of all the amounts including the principal sum of Rs. ${allPerameters.loanAmount}- along with\n interest, costs, and other charges as applicable under the said Facility and all indebtedness due and\n payable by the Borrower to the Lenders thereunder or any part thereof for the time being outstanding\n under the said Facility granted/agreed to be granted by the Lenders to the Borrower and all interest,\n commission, costs, charges, and expenses and all other moneys whatsoever due, owing, and payable by\n the Borrower to the Lender thereunder ("Said Dues"), in the event of failure on the part of the\n Borrower in repaying the same to the Lenders or discharging its liability thereunder (the decision of the\n Lenders as to such default/failure of the Borrower being final, conclusive, and binding on the Guarantor).`,
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

// addFooter();

 //---------------------------------new page-------------------------------------------
   doc.addPage();
  //addLogo();
//  //drawBorder();
doc.moveDown(7);
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
  '(e) The Guarantor has received, read and understood the terms and conditions of the Facility\n Agreement and each of the Finance Documents (including this Deed) and agrees to be bound\n by all the terms and provisions thereof and here of;',
  { align: 'justify', indent: 60, lineGap: 5 }
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
doc.text(`
       a. the execution or entering into by the Guarantor of this Deed constitutes, and performance of his
       obligations under this Deed will constitute, private and commercial acts done and performed for 
       private and commercial purposes;`,
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(ii) The net-worth certificate of the Guarantor furnished to the Lender is true and correct as\n on the date hereof;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(ii) The net-worth certificate of the Guarantor furnished to the Lender is true and correct as\n on the date hereof;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(iii) All information communicated to or supplied by or on behalf of the Guarantor to the Lenders\n from time to time in a form and manner acceptable to the Lenders is true, fair, correct and\n complete in all respects as on the date on which it was communicated or supplied; and nothing\n has occurred since the date of communication or supply of any information to the Lenders which\n renders such information untrue or misleading in any material respect;',
  { align: 'left', indent: 60, lineGap: 5 }
);

// doc.moveDown();
// doc.text(
//   '(k) The Guarantor shall not be entitled to, and shall not claim immunity for himself or any of his',
//   { align: 'left', indent: 60, lineGap: 5 }
// );

// addFooter();

// --------------------------- new page ---------------------------------
doc.addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);
doc.font(font).fontSize(10)
.text(
  '(b) The Guarantor shall not be entitled to, and shall not claim immunity for himself or any of his',
  { align: 'left', indent: 60, lineGap: 5 }
).text(
`assets from any suit, execution, attachment or other legal process in any proceedings in relation to
 this Deed;`,
{ align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();

doc.font(font).fontSize(10).text(
  '(c) In the even of any disagreement or dispute between the Lenders and the Guarantor regarding\n the materiality or reasonableness of any matter including any event, occurrence, circumstance,\n change, fact, information, document, authorization, proceeding, act, omission, claims, breach,\n default or otherwise, the opinion of the Lenders as to the materiality or reasonableness of any\n of the foregoing shall be final and binding on the Guarantor;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(d) Any admission or acknowledgment given or deemed to have been given or any part payment\n made by the Borrower in respect of the Outstanding Amounts shall be binding on the\n Guarantor and the Guarantor shall not raise any objection in relation thereto;',
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();
doc.text(
  '(o) All documents provided by the Guarantor in connection with this Deed are genuine;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(p) The Guarantor waives all his rights and remedies available to a Guarantor in Law, contract or in\n equity or otherwise howsoever and particularly those provided in Sections 132, 133, 134, 135,\n 136, 137, 138, 139 and 141 of the Indian Contract Act, 1872;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(q) The Guarantor has complied with all the laws, rules, regulations, and guidelines to the extent\n applicable on the Guarantor ("Applicable Law") in relation to the conduct of his business and\n is not subject to any present, potential, or threatened liability by reason of non-compliance with\n such Applicable Law;',
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();
doc.text(
  `(r) hat the Guarantor shall maintain his net worth to the satisfaction of the Lenders. The
    Guarantor further agrees and confirms that he shall furnish a certificate from a
    chartered account ant certifying his net worth on annual basis to the Lenders;`,
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();
doc.text(
  `(s) The Guarantor shall pay all stamp duty and other similar charges/ taxes payable in
   respect of this Deed, and, within 3 (three) Business Days of demand, indemnify the
   Lenders against any cost, loss or liability that the Lenders may incur/suffer in relation
   to any or all stamp duty, and other similar taxes payable in respect of this Deed.`,
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.text(
  '7. The Guarantor hereby indemnifies the Lenders and shall keep the Lenders indemnified and save\n harmless at all times while the Facility is/are outstanding, due and payable by the Borrower to the\n Lenders, against all actions, proceedings, claims and demands, duties, penalties, taxes, losses, damages,\n costs (including legal costs), charges (including stamp duty) and expenses and other liability what so \never which may be brought and made against or sustained or incurred by the Lenders by reason of\n having granted/agreed to grant the Facility to the Borrower.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// addFooter();

// ----------------------------------- new page ---------------------------------------------------------------------
doc.addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);
// doc.moveDown();

// Move to new page (Page 6)

doc.font(font).fontSize(10).text(
  '8. The Guarantor hereby unconditionally agrees and undertakes that:',
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(a) his/her/its obligations under this Deed are continuing and shall extend to the ultimate balance\n of sums payable under the Facility Agreement;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(b) he/she/it shall not sell, transfer, assign, dispose of, mortgage, charge, pledge or create any lien\n or in any way encumber his present and future immovable and movable properties, whether\n as sole or joint owner, whose sale, transfer, assignment, mortgage, charge, pledge or encumbrance\n would lead to a diminution in the net worth of the Guarantor, as provided in the net-worth ',
  { align: 'left', indent: 60, lineGap: 5 }
)
.text(('\ncertificate as of the date of this Deed, submitted by the Guarantor to the Lenders, without the\n Lenders prior written consent till the obligations under this Deed are discharged in full;'),
{ align: 'left', indent: 60, lineGap: 5 }

);

doc.moveDown();
doc.font(font).fontSize(10).text(
  '(c) he/she/it shall make best efforts to cause the Borrower to duly and punctually repay all the\n Outstanding Amounts, including but not limited to any and all sums advanced by the Lender in\n order to preserve the Security or preserve its security interest in the Security, together with\n reasonable legal fees and court costs whatsoever stipulated in or payable under the Facility\n Agreement, and perform and comply with all the other terms, conditions and covenants contained\n in the Facility Agreement and other Finance Documents;',
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  '(d) a certificate/statement in writing signed by a duly authorized official of either or both the\n Lenders shall act as conclusive evidence against the Guarantor of the amount for the time being\n due to the Lenders from the Borrower/Guarantor;',
  { align: 'left', indent: 60, lineGap: 5 }
);
doc.moveDown();
doc.text(`
(e) its Shall not be necessary for either or both the Lender (i) to obtain judgment against
the Borrower or the Guarantor in any court or other tribunal; or (ii) to make or file
any claim in a bankruptcy or liquidation of the Borrower or the Guarantor; or (iii) to
take any action or enforce his rights whatsoever against the Borrower or the Guarantor
under the Facility Agreement or other Finance Documents. The Guarantor hereby waives the
requirement of all such notices, formalities and rights to which it would otherwise been
titled to, and any term of this Deed or any other Finance Document, shall not be required to 
be satisfied or fulfilled before proceeding against the Guarantor. This Deed may be enforced by
either or both theLenders, without having to exercise first recourse against any other security 
or rights or taking any other steps or proceedings against the Guarantor or any other person and
may been forced for any balance due even after either or both the Lender has/have resorted
to anyone or more other means of obtaining payment or discharge of the monies obligations and
liabilities hereby secured;
  `,
  { align: 'left', indent: 60, lineGap: 5 }
);


// addFooter();

// --------------------------- new page ---------------------------------
doc.addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);
doc.font(font).fontSize(10)
// .text(('\ncertificate as of the date of this Deed, submitted by the Guarantor to the Lenders, without the\n Lenders prior written consent till the obligations under this Deed are discharged in full;'),
// { align: 'left', indent: 60, lineGap: 5 }

// );
// // doc.moveDown();
// doc.font(font).fontSize(10).text(
//   '(iii) he/she/it shall make best efforts to cause the Borrower to duly and punctually repay all the\n Outstanding Amounts, including but not limited to any and all sums advanced by the Lender in\n order to preserve the Security or preserve its security interest in the Security, together with\n reasonable legal fees and court costs whatsoever stipulated in or payable under the Facility\n Agreement, and perform and comply with all the other terms, conditions and covenants contained\n in the Facility Agreement and other Finance Documents;',
//   { align: 'left', indent: 60, lineGap: 5 }
// );

// doc.moveDown();
doc.text(
 `(f) he/she/ its hall not revoke this Deed during the subsistence of any of the Outstanding Amounts
  under the Facility Agreement; and

  (g) The Guarantor shall promptly inform the Lenders of the occurrence of any event which might
  adversely affect his ability to perform his obligation sunder this Deed and of any Event of Default
  forth with upon becoming aware there of and will from time to time, if requested by the Lender,
  confirm to the', enders in writing, that, save as otherwise stated in such confirmation, no Event of
  Default has occurred and is continuing.`,
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();

doc.text(
  `
9. Either or both the Lenders shall be at liberty, and shall have full discretionary power without the
Guarantor's further assent and knowledge and without in anyway affecting 0 the Guarantor's liability
under this Deed, and the Guarantor here by waive the rights available to him as surety under the 
applicable provisions of the Indian Contract Act, 7872,or its statutory modification or re-enactment
there of:

  (a) To renew/ vary/ enlarge/ release/ amend the terms and conditions of the Facility or any term,
  advance, credit entered into with/granted to tie Borrower; or

  (b) To hold over, renew, or give up in whole or in part, and from time to time, any bills,
  notes, mortgages, charges, liens or other securities received or to be received from the
  Borrower either alone or jointly with any other person or persons or from any other
  person or persons bearing the name of the Borrower; or

  (c) To vary or exchange or release any securities held or to be held by the Lender for or on
  account of the monies intended to be here by secured or any part thereof and to renew
  any bills, notes or other negotiable securities; or

  (d) To release or discharge the Borrower or any person liable with or for the
  Borrower as a guarantor or otherwise; or

  (e) to do any act or omission, the legal consequence of which is to discharge the
  Borrower or any person liable for or with the Borrower as aforesaid; or

  (f) to postpone for any time or from time to time the exercise of any power or
  powers conferred upon the Lender by Applicable Law or otherwise and to`,
  { align: 'justify', indent: 60, lineGap: 5,    width: 500,  }
);

// addFooter();

// ----------------------------------- new page ---------------------------------------------------------------------
doc.addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);


doc.moveDown();
doc.font(font).fontSize(10).text(
  `Exercise the a meat anytime and in any manner and either to enforce or for bear to
  enforce the covenants or agreements entered into by the Lender with the Borrower
  or any other remedies or securities available to the Lender; or`,
  { align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
doc.text(
  `
(g) to enter into any composition or compound with or promise to grant/extend time or any
other indulgence or not to sue, either the Borrower or any other person liable as
surety, or collaterally liable for the Borrower, as the Lender may deem fit,

And the Guarantor shall not be released by any exercise by the Lenders of its/their
liberty with reference to the matters aforesaid or any of them.`,
  { align: 'left', indent: 60, lineGap: 5 }
);

doc.moveDown();
doc.text(
  `
9A.The Guarantor shall not be released by any actoro mission on the part of the Lenders or 
by any other matter or thing what so ever which under the Applicable Law relating to sureties
would have the effect of so releasing the Guarantor. This includes:

 (i) anytime or waiver granted to, or composition with, any person;

(ii) any release of any person under the terms of any composition or arrangement;

(iii) the taking, variation, compromise, exchange, renewal or release of, or refusal
or neglect to perfect, take up or enforce, any rights against, or Security Interest
over assets of, any person;

(iv) any non-presentation or non-observance of any formality or other
requirement in respect of any instrument or any failure to realize the full value
of any security;

(v) any in capacity, insolvency or lack of power, authority or legal personality
of or dissolution or change in the member sorts at us of any person;

(vi) any amendment or variation of any of the Finance Documents;

(vii) any composition or compounding, forgiveness or other indulgence granted to
the Borrower or any other person in relation to the Facility or any other
document or Security Interest created pursuant there to;

`,
{ align: 'left', indent: 60, lineGap: 5 }
);

// addFooter();

// ----------------------------------- new page ---------------------------------------------------------------------
doc.addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);
doc.font(font).fontSize(10).text(`

(viii) any unenforceability, illegality, invalidity or non-provability of any obligation
of any person under any document or Security Interest on any ground;

(ix) any change in the constitution, ownership, change of name, or corporate
existence of any person or any absorption, merger or amalgamation of any
person with any other company, corporation or concern;

(x) any insolvency, liquidation, bankruptcy, winding up, dissolution,Reorganization,
de-merger or similar situation or proceeding in respect of any person;

(xi) any change in the management of any person or takeover of
the management of the any person by any Governmental Authority;

(xii) ) acquisition or nationalization of the Borrower and/or of any of its
undertaking(s)pursuant to any Applicable Law;

(xiii) )any failure to take, or fully take, or any release, discharge, exchange or
substitution of any guarantee, bond or security contemplated or
otherwise agreed to be taken in respect of any of the obligations of the
Borrower under any document relating to the Facility;

(xiv) )any act of legislation and/or by any act of State and/or God by which the
Borrower's debt sunder the Facility or any payments under this, is suspended
or cancelled; or

(xv) Any other act, even to remission (including, without limitation, any
amendment, waiver, supplement or modification to any document relating to
Facility) which might operate to discharge, impair or otherwise affect the
enforceability of any of the obligations contained in this Deed.

  `,
  { align: 'left', indent: 60, lineGap: 5 }
);


doc.text(
  `
  10. The Guarantor shall also not be entitled to look into or consider any question or dispute which
  may arise between the Lenders as the creditor and the Borrower as to repayment by the
  Borrower to the Lender of all the Outstanding Amounts under the said Facility together with
  all interest, costs, charges and expenses in respect there of or otherwise how so ever.`,
  { align: 'left', indent: 40, lineGap: 5 }
);

// addFooter();

//---------------------------------------- new page -------------------------------------------

doc.
addPage();
//addLogo();
//drawBorder();

doc.moveDown(7);

doc.font(font).fontSize(10)

doc.text(
  `
  11. This Deed shall remain in full force and effect until the Borrower is fully discharged by the
Lenders of all the liabilities under the Facility and until the Borrower has got the discharge
confirmed in writing from Lenders and all the dues and claims of the Lenders here under or
relating to the Facility have been paid or satisfied.

12. Further, this Deed shall be applicable to the ultimate balance that may become due to the
Lenders from the Borrower under the Facility not withstanding that the Facility account is
maintained by the Lenders for the Borrower in respect of such Facility, may in the mean
time or at any time or times have been in credit or may have disclose dare deuced or nil
balance, and until repayment of such balance the Lenders shall been titled to retain, realize
or otherwise dispose of in such manner as the Lenders may think fit any securities, now or
here after held by the Lenders and without any liability to account to the Guarantor or any
appropriation of such securities or of the proceeds thereof until the said ultimate balance
shall have been satisfied.

13. Notwithstanding the Lenders receiving payments from the Borrower/ the
Guarantor or any person or persons as aforesaid, or from any Security held by the
Lenders of the whole or any part of the amount hereby guaranteed, if the Borrower
shall become bankrupt or insolvent or shall pass are solution for voluntary winding-
up or shall be ordered to be wound-up by an order of the court, or shall enter into any
arrangement scheme including rehabilitation scheme approved b y banks/ financial
institutions/ National Company Law Tribunal etc., compromise with its creditor or creditors,
the Lenders shall be at liberty, without discharging the Guarantor's liability, to make or
assent to any compromises, compositions or arrangements and to rank as creditors and to
prove against the estate of the Borrower for the full amount of the Lenders' claim and to
receive dividends, composition or other payments there upon to the entire exclusion and
surrender of all the Guarantor's rights as surety in competition with the Lenders ,
notwithstanding the statute so bankruptcy or any rule flaw or equity to the contrary, unless
all the Said Dues as afore said have been paid in full to the satisfaction of the Lenders.

14. Further if the Guarantor now has or shall here after take any security from the Borrower in
respect of the Guarantor's liability under this Deed, the Guarantor will not prove in the
bankruptcy or insolvency or winding-up of the Borrower in respect thereof to the Lender's
prejudice and such security shall stand as a security for the Lender and shall forthwith be
deposited with the Lenders.
  `,
  { align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 9)
// doc.addPage();
// doc.moveDown();

// doc.text(
//   '12. The rights of the Lenders under this Deed are in addition to and not in derogation of the rights of the\n Lenders under any other guarantee or security now or hereafter held by the Lenders.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '13. This Deed shall not be affected by any absorption or amalgamation of the Lenders with any other\n company or concern or by any change in the Lenders\' constitution.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '14. The Guarantor shall not revoke this Deed during the subsistence of the Facility. Any such revocation\n shall not be effective unless the Lenders have expressly confirmed the same in writing.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );



// addFooter();

//---------------------------------------- new page -------------------------------------------

doc.
addPage();
//addLogo();
//drawBorder();

doc.moveDown(7);

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
doc.text(`Address  : ________________`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Attention: ________________`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Telephone: ________________`, { align: 'left', indent: 40, lineGap: 5 });
doc.text(`Email    : ________________ `, { align: 'left', indent: 40, lineGap: 5 });

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

// addFooter();

//------------------------------ next page -----------------------------------------------

doc.
addPage();
//addLogo();
//drawBorder();
doc.moveDown(7);

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
'23. If at the time any demand is made under this Deed, any amount shall be due or owing or payable to \nthe Lenders by the Borrower in any currency or currencies other than that in which any Facility is/are\n expressed to have been granted, then (a) the obligation of the Guarantor shall be to make payment in\n such currency or currencies, but the Lenders shall be entitled, at its discretion, to require payment either\n in such currency or currencies or in the currency of the said Facility, or partly in one way and partly in\n the other, and (b) the said Facility shall be treated as a limit expressed in such other currency or (if more\n than one such other currency is involved) as a limit in the aggregate expressed in such other  currency \nor currencies and for this purpose the said limit shall be deemed to have been expressed in such other\n currency or currencies converted at the rate or respective rates of exchange to be determined by the \nLenders to be effective at the date of payment (or each respective payment) by the Guarantor.',
{ align: 'left', indent: 40, lineGap: 5 }
);

// Move to new page (Page 12)
// doc.addPage();

doc.text(
'24. Each payment to be made by the Guarantor under this Deed shall be made to the Lenders in the same\n currency as the said Facility, at the same place as that applicable to the Borrower\'s obligation or at the\n Lender\'s office address mentioned in this Deed or at such other place as that Lender shall designate. All\n such payments shall be made in full without set-off or counterclaim and free and clear of and without\n deduction of or withholding for or on account of any tax of any nature now or hereafter imposed.',
{ align: 'left', indent: 40, lineGap: 5 }
);

// doc.moveDown();
// doc.text(
// '25. This Deed shall not be affected by any change in the constitution of the Borrower how so ever or\n by its absorption or by its amalgamation with any other company.',
// { align: 'left', indent: 40, lineGap: 5 }
// );
// doc.moveDown();



// addFooter();

//-------------------------- next page -------------------------------------------------------
// doc.
// addPage();
// //addLogo();
// //drawBorder();

// doc.moveDown(12);

// doc.font(font).fontSize(10).text(
//   `If any such payment shall be subject to any such tax or if the Guarantor shall be required
// legally to make any such deduction or with holding, the Guarantor shall pay such tax, shall
// ensure that such payment, deduction or with holding will not exceed the minimum legal
// liability therefore and shall simultaneously pay to the Lenders such additional amount as
// may be necessary to enable the Lenders to receive, after all such payments, deductions and
// with holdings, a ‘net amount equal to the full amount payable under this Deed. If the
// Guarantor shall make any such payment, deduction or with holding, the Guarantor shall,
// within30 (thirty) days thereafter forward to the Lenders an official receipt or other official
// documentation evidencing such payment or the payment of such deduction or with holding.
// As used in this Clause, the term "tax" includes all levies, imposts, duties, charges, fees,
// deductions, with holdings, turn over tax, transaction tax, stamp tax and any other
// restrictions or conditions resulting in a charge`,
//   { align: 'left', indent: 40, lineGap: 5 }
//   ).moveDown();
// doc.font(font).fontSize(10).text(
//   '25. This Deed shall not be affected by any change in the constitution of the Borrower how so ever or\n by its absorption or by its amalgamation with any other company.',
//   { align: 'left', indent: 40, lineGap: 5 }
//   );
//   doc.moveDown();
//   doc.font(font).fontSize(10).text(
//     '26. This Deed shall not be determined or in any manner prejudiced by any absorption and amalgamation\n or reconstitution or alteration in the status or change in the constitution of either or both the Lenders,\n but it shall inure and be available for the absorbing or amalgamated or reconstituted or altered or\n changed authority or body.',
//     { align: 'left', indent: 40, lineGap: 5 }
//     );


//     addFooter();
    //---------------------------------------------------------------


doc.
addPage();
//addLogo();
//drawBorder();

doc.moveDown(7);
doc.font(font).fontSize(10).text(
  `If any such payment shall be subject to any such tax or if the Guarantor shall be required
legally to make any such deduction or with holding, the Guarantor shall pay such tax, shall
ensure that such payment, deduction or with holding will not exceed the minimum legal
liability therefore and shall simultaneously pay to the Lenders such additional amount as
may be necessary to enable the Lenders to receive, after all such payments, deductions and
with holdings, a ‘net amount equal to the full amount payable under this Deed. If the
Guarantor shall make any such payment, deduction or with holding, the Guarantor shall,
within30 (thirty) days thereafter forward to the Lenders an official receipt or other official
documentation evidencing such payment or the payment of such deduction or with holding.
As used in this Clause, the term "tax" includes all levies, imposts, duties, charges, fees,
deductions, with holdings, turn over tax, transaction tax, stamp tax and any other
restrictions or conditions resulting in a charge`,
  { align: 'left', indent: 40, lineGap: 5 }
  ).moveDown();
doc.font(font).fontSize(10).text(
  '25. This Deed shall not be affected by any change in the constitution of the Borrower how so ever or\n by its absorption or by its amalgamation with any other company.',
  { align: 'left', indent: 40, lineGap: 5 }
  );
  doc.moveDown();
  doc.font(font).fontSize(10).text(
    '26. This Deed shall not be determined or in any manner prejudiced by any absorption and amalgamation\n or reconstitution or alteration in the status or change in the constitution of either or both the Lenders,\n but it shall inure and be available for the absorbing or amalgamated or reconstituted or altered or\n changed authority or body.',
    { align: 'left', indent: 40, lineGap: 5 }
    );


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
// doc.moveDown();

// doc.text(
//   '30. The absence or infirmity of borrowing powers on the part of the Borrower or any irregularity in the\n exercise thereof shall not affect the Guarantor\'s liability, and any monies advanced to the Borrower shall\n be deemed to be due and owing notwithstanding such absence, infirmity, or irregularity, and this\n Deed shall not be affected by any change in the name, by death or otherwise howsoever.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '31. This Deed shall not be affected by the death, incapacity, or any other contractual inability of the\n Guarantor. In such a case, the liabilities and obligations of the Guarantor shall be transferred to the legal\n representatives, legal heirs, permitted assigns, or successors, as the case may be. It shall be the duty of\n the legal representatives, legal heirs, permitted assigns, or successors, as the case may be, to keep the\n Lenders informed of any such incident, death or incapacity, etc., and intimate the same in writing with a\n new contact and address that can be used by the Lenders.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '32. The Guarantor hereby declares and agrees that he has not received and shall not, without the prior\n consent in writing of the Lenders, receive any security, fee, or commission from the Borrower for\n giving this Deed so long as any monies remain due and payable by the Borrower to the Lenders under\n the Facility Agreement.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '33. This Deed shall be enforceable against the Guarantor notwithstanding that the securities created/to\n be created by the Borrower or by the Guarantor or any other collateral securities that either or both\n the Lenders might obtain/have obtained from the Guarantor or the Borrower or any negotiable or other\n securities referred to herein or to which it may extend or be applicable shall at the time of proceedings\n being taken against the Guarantor on this Deed be outstanding or unrealized.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// addFooter();


//-------------------------------new page --------------------------------------------------------------
doc.addPage();
//addLogo();
// drawBorder()

doc.moveDown(7);

doc.font(font).fontSize(10).text(
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
).moveDown();
doc.text(
  '34. In addition to all liens upon, and rights of set-off against the monies, securities, or other property of\n the Guarantor given/available to the Lenders by/under the Applicable Law, the Lenders shall have a right\n of lien upon and a right of set-off against, all monies, securities, and other property of the Guarantor\n now or hereafter in the possession of or on deposit with the Lenders, whether held in a general or\n special account or deposit, or for safekeeping or otherwise. Every such lien and right of set-off may be\n exercised without demand upon or notice to the Guarantor. No lien or right of set-off shall be deemed to\n have been waived by any act or conduct on the part of either or both the Lenders, or by any neglect to\n exercise such right of set-off or to enforce such lien, or by any delay in so doing, and every right of\n set-off and lien shall continue in full force and effect until such rights of set-off or lien is specifically\n waived or released by an instrument in writing executed by either or both the Lenders.',
  { align: 'left', indent: 40, lineGap: 5 }
);

// doc.moveDown();
// doc.text(
//   '35. The Guarantor hereby accepts and confirms that as a precondition to the grant of the Facility by the\n Lenders to the Borrower, and the Guarantor in turn furnishing this Guarantee in relation there to, the\n Lenders may require consent of the Guarantor for disclosure of information and data relating to the\n Guarantor, any credit facility availed of by the Guarantor in relation thereto, and default, if any,\n committed in the discharge thereof.',
//   { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '(a) Accordingly, the Guarantor hereby agrees and gives consent for the disclosure by either or both\n the Lenders of all or any such:',
//   { align: 'left', indent: 60, lineGap: 5 }
// );
// doc.text(
//   '(1) Information and data relating to the Guarantor;',
//   { align: 'left', indent: 80, lineGap: 5 }
// );
// doc.text(
//   '(2) Information or data relating to the Guarantor’s obligations in any credit facility granted/to\n be granted by the Lenders and guaranteed by the Guarantor; and',
//   { align: 'left', indent: 80, lineGap: 5 }
// );
// doc.text(
//   '(3) Default, if any, committed by the Guarantor in discharge of such obligation, as the Lenders\n may deem appropriate and necessary,to disclose and furnish to Trans Union CIBIL Limited\n and any other agency authorized in this behalf by the Reserve Bank of India.',
//   { align: 'left', indent: 80, lineGap: 5 }
// );


// // doc.text(
// //   // 'to disclose and furnish to Trans Union CIBIL Limited and any other agency authorized in this behalf by the Reserve Bank of India.',
// //   { align: 'left', indent: 40, lineGap: 5 }
// // );

// doc.moveDown();
// doc.text(
//   '(b) The Guarantor further declares that all the information and data furnished by the Guarantor to\n the Lenders are and shall be true and correct.',
//   { align: 'left', indent: 60, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
//   '(c) The Guarantor further undertakes and declares that:',
//   { align: 'left', indent: 60, lineGap: 5 }
// );

// doc.text(
//   `(i) the Trans Union GIBIL Limited and any other agency so authorized may use, process the said
//   information and data disclosed by either or both the Lender in the manner as deemed fit by it/
//   them; and`,
//   { align: 'left', indent: 80, lineGap: 5 }
// );

// doc.text(
//   `(ii) the Trans Union CIVIL Limited and any other agency so authorized may furnish for
//   consideration, the processed information and data or products thereof prepared by them
//   to banks/ financial institutions and other credit grantors or registered users ,as may
//   be specified by the RBI in this behalf.`,
//   { align: 'left', indent: 80, lineGap: 5 }
// );


// doc.moveDown();


// addFooter();

//---------------------------------------- new page --------------------------------------------------------------------------

doc.addPage();
//addLogo();
//drawBorder();

doc.moveDown(7)

doc.font(font).fontSize(10)
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
  `(i) the Trans Union GIBIL Limited and any other agency so authorized may use, process the said
  information and data disclosed by either or both the Lender in the manner as deemed fit by it/
  them; and`,
  { align: 'left', indent: 80, lineGap: 5 }
);

doc.text(
  `(ii) the Trans Union CIVIL Limited and any other agency so authorized may furnish for
  consideration, the processed information and data or products thereof prepared by them
  to banks/ financial institutions and other credit grantors or registered users ,as may
  be specified by the RBI in this behalf.`,
  { align: 'left', indent: 80, lineGap: 5 }
);
doc.text(
'36. This Deed shall inure for the benefit of the Lenders\' successors, transferees, novatees, and assigns,\n and shall be binding on the Guarantor, his estate, effects, heirs, legal representatives, executors,\n administrators, successors, and permitted assigns. The Guarantor shall not be entitled to assign his\n obligations and/or rights (if any) under this Deed without the Lenders\' prior written permission there of.',
{ align: 'left', indent: 40, lineGap: 5 }
);
doc.moveDown();
doc.text(
'37. The Guarantor specifically agrees and confirms that all matters concerning this Deed or arising\n there from or relating thereto, shall be governed by and construed in all respects with Indian laws,\n and any matter or issues arising hereunder or any dispute hereunder shall, at the option/discretion of\n the Lenders, be subject to the exclusive jurisdiction of the courts as may be chosen by the Lender/s\n in its/their discretion.',
{ align: 'left', indent: 40, lineGap: 5 }
);

doc.moveDown();
// doc.text(
// '38. It shall be lawful for either or both of the Lenders or its/their agent(s), nominees, officer(s), or\n employee(s) forthwith and without any notice to the Guarantor to enter into or upon any place or\n premises where any of the receivables and books of accounts, papers, documents, and vouchers and\n other records relating thereto may be situated or kept stored, and for the purpose of such entry, if\n necessary, to do all acts, deeds, and things deemed necessary by either or both of the Lenders, and to\n inspect, value, insure, superintend disposal and/or take particulars of all or any part of the receivables\n and/or the security, and check any statement, accounts, reports, and information.',
// { align: 'left', indent: 40, lineGap: 5 }
// );

// // Move to new page (Page 16)
// // doc.addPage();
// doc.moveDown();

// doc.text(
// '39. It is hereby expressly agreed between the Parties that even if by any act of legislation and/or by any\n act of the state and/or central government, the Borrower\'s debts under the said Facility to the \nLenders are suspended or cancelled, the Guarantor shall never the less be bound to pay to the Lenders\n all the amounts demanded by either or both of the Lenders from the Guarantor hereunder.',
// { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
// '40. Either or both of the Lenders shall be at liberty to exercise any powers or authority exercisable\n hereunder and to file any suits or legal proceedings for recovery of the outstanding amounts under\n the Facility along with other charges, and to take steps to realize or enforce this Deed, in the manner\n it/they think fit, either jointly or severally.',
// { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown();
// doc.text(
// '41. No failure or delay on the part of either or both the Lenders to exercise any power, right, or remedy\n under this Deed shall operate as a waiver thereof, nor shall any single or partial exercise by either or\n both the Lenders of any power, right, or remedy preclude any other or further exercise there of, or\n the exercise of any other power, right, or remedy. The remedies provided in this Deed are cumulative\n and are not exclusive of any remedies provided under the Applicable Law.',
// { align: 'left', indent: 40, lineGap: 5 }
// );
// addFooter();

//--------------------------------- next page ----------------------------------------------------------------

doc.addPage();
//addLogo();
//drawBorder();

doc.moveDown(7);

// doc.moveDown(2);
// doc.moveDown();
doc.font(font).fontSize(10)
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
  doc.text(
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
doc.font(font).fontSize(10)

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
  
  doc.font('Times-Bold').fontSize(13).text(`${allPerameters.guarantorName}`, {
  align: 'left'
  })
  .text('                       (Guarantor)', { align: 'left' })
  ;
// doc.text(
// '44. The terms of this Deed may be amended only by an instrument in writing signed by the Guarantor \nand by an authorized signatory on behalf of the Lenders.',
// { align: 'left', indent: 40, lineGap: 5 }
// );

// doc.moveDown(2);
// doc.font(fontBold).text('Signature:', { align: 'left', indent: 40 });
// doc.moveDown();

// // doc.text('Name: KANHAIYALAL DANGI ', { align: 'left', indent: 40 });
// doc.font('Times-Roman').text('Name: ', {
// align: 'left',
// indent: 40,
// continued: true 
// });

// doc.font('Times-Bold').fontSize(13).text(`${allPerameters.guarantorName}`, {
// align: 'left'
// })
// .text('                       (Guarantor)', { align: 'left' })
// ;
// doc.fontSize(10).text('(Guarantor)', { align: 'left' });

// addFooter();

//--------------------------------- next page ----------------------------------------------------------------
// doc.addPage();
// //addLogo();
// //drawBorder();
// doc.moveDown(10);

// doc.moveDown(2);
// doc.moveDown();
// doc.font(font).fontSize(10)

// doc.text(
//   '44. The terms of this Deed may be amended only by an instrument in writing signed by the Guarantor \nand by an authorized signatory on behalf of the Lenders.',
//   { align: 'left', indent: 40, lineGap: 5 }
//   );
  
//   doc.moveDown(2);
//   doc.font(fontBold).text('Signature:', { align: 'left', indent: 40 });
//   doc.moveDown();
  
//   // doc.text('Name: KANHAIYALAL DANGI ', { align: 'left', indent: 40 });
//   doc.font('Times-Roman').text('Name: ', {
//   align: 'left',
//   indent: 40,
//   continued: true 
//   });
  
//   doc.font('Times-Bold').fontSize(13).text(`${allPerameters.guarantorName}`, {
//   align: 'left'
//   })
//   .text('                       (Guarantor)', { align: 'left' })
//   ;

// addFooter();

doc.addPage();
//addLogo();
//drawBorder();

const startX = 50; // Set a left margin


doc.moveDown(7);

// doc.moveDown(2);
doc.font(fontBold).fontSize(10). text('SCHEDULE-I', { align: 'center', underline: true });
doc.moveDown();
doc.text('Form of Demand Certificate', { align: 'center' });

doc.moveDown(2);
doc.font(font).text(`Dated: ${allPerameters.date}`, { align: 'left', indent: 40 });

// doc.moveDown();

// doc.text('________________________________', { align: 'left', indent: 40 });

// doc.moveDown();
// doc.text('_____________  ________________', { align: 'left', indent: 40 });

// doc.moveDown();
// doc.text('_______________________________', { align: 'left', indent: 40 });

doc.moveDown(1);

doc
.fontSize(7)
.font('Helvetica')
// .text(`To,`, {  align: 'left', indent: 40 })
// doc.moveDown(0.5);

// doc
// .fontSize(8)
// .font('Helvetica')
// .text(`The Manager,`, {  align: 'left', indent: 40 })
doc.moveDown(0.5);

// doc
// .fontSize(8)
// .font('Helvetica')
// .text(`GROW MONEY CAPITAL PVT LTD`,
//   {  align: 'left', indent: 40 })
// doc.moveDown(0.5);

// doc
// .fontSize(8)
// .font('Helvetica')
// .text(`Flat No. 401, New Delhi House 27, Barakhamba Road New Delhi DL 110001`, {  align: 'left', indent: 40 })
// doc.moveDown(2);

doc.moveDown();
doc.text('Dear Sir,', { align: 'left', indent: 40 });
doc.moveDown();
doc.font(fontBold).text(
'Re: Payment under Deed of Guarantee dated [•]',
{ align: 'left', indent: 40 }
);

doc.moveDown();
doc.font(font).text(
`We refer to the Deed of Guarantee dated [•], as amended from time to time ("Guarantee Deed") executed \nby Mr. ${allPerameters.customerName} in favour of GROWMONEY CAPITAL PVT LTD and _____________`,
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

doc.text(`Please note that an amount of INR[•] ${allPerameters.loanAmount}Is outstanding from the[3 or rower in terms of the Facility \n Agreement dated fill.`,
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
doc.font(font).text(`For ; ${allPerameters.guarantorName},`, { align: 'left', indent: 40 });

doc.moveDown();
doc.text('(Authorized Signatory),', { align: 'left', indent: 40 });

doc.moveDown();
doc.text('______________________,', { align: 'left', indent: 40 });


// addFooter();


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
  // addFooter();
  //---------------------------------------------------new page---------------------------------------------------------------
//   doc.addPage();
//   //addLogo();
//   //drawBorder();

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
//   //addLogo();
//   //drawBorder();
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

  // const pdfFileUrl = `/uploads/pdf/${pdfFilename}`;

  // return new Promise((resolve, reject) => {
  //   stream.on("finish", () => {
  //     resolve(pdfFileUrl);
  //   });
  //   stream.on("error", reject);
  // });
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

// ------------------HRMS  create offer letter pdf ---------------------------------------

async function growPgDeedPdf(customerId, logo,partnerName) {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return serverValidation({
    //     errorName: "serverValidation",
    //     errors: errors.array(),
    //   });
    // }
    // const customerId = new mongoose.Types.ObjectId("66a091726a30f89113407e8c");
    console.log(partnerName,"partnerName<>>><><><><><>")
    const customerDetails = await customerModel.findOne({_id:customerId}).populate('productId')  
    const coApplicantDetails = await coApplicantModel.find({customerId})
    const guarantorDetails = await guarantorModel.findOne({customerId})  
    const applicantDetails = await applicantModel.findOne({customerId})
    const technicalDetails = await technicalModel.findOne({customerId})
    const appPdcDetails = await appPdcModel.findOne({customerId})
    const extnalvenderDetails = await extnalvenderModel.findOne({customerId}).populate('branchNameId')
    const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
    const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
    const BranchNameId = customerDetails?.branch;
      // console.log("BranchNameId",BranchNameId)
            const branchData = await externalBranchModel.findById({_id:BranchNameId});
            // if (!branchData) {
            //     return badRequest(res, "Branch data not found for the given branchId");
            // }
            // const newBranch = 
            const branchName = branchData?.city; 
    // console.log(extnalvenderDetails,"extnalvenderDetails<><>",extnalvenderDetails.createdAt)

    const date = new Date(sanctionPendencyDetails?.loanAgreementDate);

// Format 1: 15 NOV 2024
const day = date.getDate(); // 15
const month = date.toLocaleString("en-US", { month: "short" }); // Nov
const year = date.getFullYear(); // 2024

// Format 2: 15/11/2024
const options2 = { day: "2-digit", month: "2-digit", year: "numeric" };
const format2 = date.toLocaleDateString("en-GB", options2).replace(/-/g, "/");

console.log(format2); // 15/11/2024

const guarantorAddress = [
  guarantorDetails?.permanentAddress?.addressLine1,
  // guarantorDetails?.permanentAddress?.addressLine2,
  // guarantorDetails?.permanentAddress?.city,
  // guarantorDetails?.permanentAddress?.district,
  // guarantorDetails?.permanentAddress?.state,
  // guarantorDetails?.permanentAddress?.pinCode
].filter(Boolean).join(', ');

const formatDate = (praMANpATRADate) => {
  if (!praMANpATRADate) return "NA"; 
  const date = new Date(praMANpATRADate); // Date object me convert kar dega
  const day = String(date.getDate()).padStart(2, '0'); // Day format me 2 sirf digits dega
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month format me 2 digits (0-based index ke liye +1)
  const year = String(date.getFullYear()).slice(); 
  return `${day}-${month}-${year}`; // Final format
  };
    const allPerameters = {
      customerName : applicantDetails?.fullName || "NA",//page no.1
      address : guarantorAddress||"NA",
      // KAndA: KAndA,
      customerID: customerDetails?.customerFinId || "NA",
      loanBorrowerName : applicantDetails?.fullName || "NA",
      loanCoborrowerName : coApplicantDetails[0]?.fullName || "NA" ,
      loanCoborrowerNameTwo : coApplicantDetails[1]?.fullName || "NA" ,
      guarantorName : guarantorDetails?.fullName || "NA",
      guarantorAge:guarantorDetails?.age || "NA",
      guarantorFatherName: guarantorDetails?.fatherName || "NA",
      guarantorPanNo: guarantorDetails?.docType === 'panCard' ? guarantorDetails?.docNo || '':'NA',
      lenderName:"NA",
      place: branchName || "NA",
      day: day || "NA",
      month: month || "NA",
      year: year || "NA",
      age: applicantDetails?.age || "NA",
      fatherName:applicantDetails?.fatherName || "NA",
      panNo:applicantDetails?.panNo || "NA",
      companyName:"NA",
      aggrementDate:formatDate(sanctionPendencyDetails?.loanAgreementDate) || "NA",
      grantTo:"NA",
      // loanAmount: customerDetails?.loanAmount || "NA",
      loanAmount: finalsanctionDetails?.finalLoanAmount|| "NA",
      loanAmountinwords:finalsanctionDetails?.loanAmountInWords|| "NA",
      textRs:"NA",
      refferedAs:"NA",
      attention:"NA",
      telePhone:"NA",
      email:applicantDetails?.email || "NA",
      date:formatDate(sanctionPendencyDetails?.loanAgreementDate) || "NA",
      executedBy:"NA",
      comapnyName2:"NA",
      yourfaithfully:"NA"
    }

    const pdfPath = await PgDeedLetterPdf(allPerameters, logo,partnerName);

    const uploadResponse = await uploadPDFToBucket(pdfPath, `GrowMoney_SanctionLatter${Date.now()}.pdf`);
        const url = uploadResponse.url
        console.log(url,"url")        
       const tt= await finalsanctionModel.findOneAndUpdate(
          { customerId }, // Query to find the specific customer document
          {
            $set: { "growMoneyPdfUrls.growPgDeedPdf": url } // Dot notation for nested update
          },
        { new: true, upsert: false } // Options: Return the updated document, don't create a new one
      );
        console.log(pdfPath,"sanction pdfpath")
        // return pdfPath
        // success(res, "PDF generated successfully", pdfPath);
        // return pdfPath
        return (
          {
            GUARANTER_DEED:url,
        });
        
        // success(res, "PDF generated successfully", pdfPath);
        // console.log(pdfPath,"pdfPath pdfPath")
        // return pdfPath
      
    // console.log("pdfPath", pdfPath);
    // console.log("http://localhost:5500" + pdfPath);

    // if (!pdfPath) {
    //   return res.status(500).json({
    //     errorName: "pdfGenerationError",
    //     message: "Error generating the Sanction Letter Pdf",
    //   });
    // }

    // success(res, "PDF generated successfully", pdfPath);
    // return pdfPath
  } catch (error) {
    console.log(error);
    unknownError(res, error);
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
module.exports = { PgDeedLetterPdf, growPgDeedPdf };
