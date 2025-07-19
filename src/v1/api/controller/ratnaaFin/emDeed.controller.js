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
const sanctionModel = require('../../model/finalApproval/sanctionPendency.model')
const finalsanctionModel = require('../../model/finalSanction/finalSnction.model')
const externalBranchModel = require("../../model/externalManager/externalVendorDynamic.model.js");
const newBranchModel = require("../../model/adminMaster/newBranch.model.js");
const lendersModel = require("../../model/lender.model.js");
const { numberToIndianWords } = require("./newApplicant.controller.js")
// const { Document, Packer, Paragraph, TextRun , Table} = require("docx");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    VerticalAlign,
    AlignmentType,
} = require("docx");


const generatePDF = async (allPerameters, sellerOtherDetail, buyerNameOtherDetail) => {

    function getSalutation(detail) {
        let salutation = "Mr."; // default

        if (detail) {
            const gender = detail.gender?.toLowerCase().trim();
            const maritalStatus = detail.maritalStatus?.toLowerCase().trim();

            if (gender === "female") {
                salutation = maritalStatus === "married" ? "Mrs." : "Miss.";
            }
        }

        return salutation;
    }

    // console.log('allPerameters', allPerameters, 'sellerOtherDetail-----', sellerOtherDetail, 'buyerNameOtherDetail----------', buyerNameOtherDetail)

    const sellerSalutation = getSalutation(sellerOtherDetail);
    const buyerSalutation = getSalutation(buyerNameOtherDetail);


    // const currentDate = new Date();
    // const day = currentDate.getDate();
    // const year = currentDate.getFullYear();
    // const monthNumner = currentDate.getMonth() + 1;
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const monthNumner = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = currentDate.getFullYear();


    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[currentDate.getMonth()];

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
                                text: "INSTRUMENT RELATING TO DEPOSIT OF TITLE DEEDS",
                                bold: true,
                                underline: true,
                                size: 34,
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 400 },
                    }),

                    // Instrument intro paragraph
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `THIS INSTRUMENT made at `,
                            }),
                            new TextRun({ text: `${allPerameters?.district?.toUpperCase()}`, bold: true }),
                            new TextRun({ text: " on this " }),
                            new TextRun({ text: `${day}`, bold: true }),
                            new TextRun({ text: " day of " }),
                            new TextRun({ text: `${month?.toUpperCase()} ${year}`, bold: true }),
                            new TextRun({ text: ` (hereinafter referred to as "Deed")` })
                        ],
                        spacing: { after: 200 },
                    }),

                    // By section

                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "BY",
                                size: 28,
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),

                    // Mortgagor details
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${sellerSalutation} ${sellerOtherDetail?.data?.fullName.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName.toUpperCase()}, CAST- ${sellerOtherDetail?.data?.caste.toUpperCase()}`, bold: true }),
                            new TextRun({ text: ", aged about " }),
                            new TextRun({ text: `${sellerOtherDetail?.data?.age}`, bold: true }),
                            new TextRun({ text: " Year, (Aadhar No- " }),
                            new TextRun({ text: `${sellerOtherDetail?.data?.aadharNo}`, bold: true }),
                            new TextRun({ text: ") & " }),
                            new TextRun({ text: `${buyerSalutation} ${buyerNameOtherDetail?.data[0]?.fullName.toUpperCase()} W/O ${buyerNameOtherDetail?.data[0]?.fatherName.toUpperCase()}, CAST- ${buyerNameOtherDetail?.data[0]?.caste.toUpperCase()}`, bold: true }),
                            new TextRun({ text: ", aged about " }),
                            // new TextRun({ text: "48", bold: true }),
                            new TextRun({ text: `${buyerNameOtherDetail?.data[0]?.age} Year, (Aadhar No- ` }),
                            new TextRun({ text: `${buyerNameOtherDetail?.data[0]?.aadharNo}`, bold: true }),
                            new TextRun({ text: ") Both residing at " }),
                            new TextRun({ text: `${allPerameters?.techFullAdress.toUpperCase()}`, bold: true }),
                            new TextRun({ text: `. hereinafter referred to as "the ` }),
                            new TextRun({ text: `Mortgagor"`, bold: true }),
                            new TextRun({ text: `, (which expression shall, unless repugnant to the context or meaning thereof, include his/her heirs, legal representatives, executors and administrators)` })
                        ],
                        spacing: { after: 300 },
                    }),

                    // IN FAVOUR OF - Bold and Centered
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "IN FAVOUR OF",
                                bold: true,
                                size: 28,
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),

                    // Company details
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "RATNAAFIN CAPITAL PRIVATE LIMITED,",
                                bold: true,
                            }),
                            new TextRun({ text: " a company incorporated under the Companies Act, 2013 having its CIN No. " }),
                            new TextRun({ text: "U65929DL2018PTC437822", bold: true }),
                            new TextRun({ text: " and having its Registered Office at " }),
                            new TextRun({ text: `402, BHIKAJI CAMA BHAWAN RING ROAD, BHIKAJI CAMA PLACE NEAR HYATT HOTEL, NEW DELHI- 110066, DELHI, INDIA and Corporate Office AT: 2ND & 3RD FLOOR, THE RIDGE, OPPOSITE NOVOTEL, ISCON CHAR RASTA, AHMEDABAD, GUJARAT, INDIA- 380060.`, bold: true }),
                            new TextRun({ text: " (hereinafter referred to as the " }),
                            new TextRun({ text: `"Company" and/or "the Lender"`, bold: true }),
                            new TextRun({ text: " which expression shall, unless it be repugnant to the subject or context thereof, includes its successors and permitted assigns)" }),
                        ],
                        spacing: { after: 300 },
                    }),

                    // WHEREAS - Bold and Underlined
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "WHEREAS",
                                bold: true,
                                underline: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 1
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[1]" }),
                            new TextRun({ text: " The Lender, at the request of " }),
                            new TextRun({ text: `${sellerSalutation} ${allPerameters?.applicantName?.toUpperCase()} S/O ${allPerameters?.applicantFatherName?.toUpperCase()}`, bold: true }),
                            new TextRun({ text: ` ("Borrower"), have agreed to grant a secured loan facility of ` }),
                            new TextRun({ text: `Rs. ${allPerameters?.finalLoanAmount}/- ${allPerameters?.finalloanWords?.toUpperCase()}`, bold: true }),
                            new TextRun({ text: " to the Borrower pursuant to the terms and conditions of Sanction Letter No. " }),
                            new TextRun({ text: `${allPerameters?.agrementNo}`, bold: true }),
                            new TextRun({ text: " dated " }),
                            new TextRun({ text: `${allPerameters?.agreementdate}("Sanction Letter"), `, bold: true }),
                            new TextRun({ text: `and this mortgage deed is being executed in accordance with the Sanction Letter, read with the Loan agreement executed on or around the date of execution of this deed ` }),
                            new TextRun({ text: `("Loan Agreement").`, bold: true }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 2
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[2]" }),
                            new TextRun({ text: ` In consideration of Lender having agreed to grant the above Loan to the Borrower, the said Mortgagor with an intent to create a registered mortgage by way of Deposit of Title Deeds and secure the repayment thereof, had unconditionally agreed to deposit the original title deeds relating to the immovable properties, more particularly described in the Second Schedule hereunder written belonging to and owned by the Mortgagor ` }),
                            new TextRun({ text: `("Secured Properties").`, bold: true }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 3
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[3]" }),
                            new TextRun({ text: " As agreed " }),
                            new TextRun({ text: `${sellerSalutation} ${sellerOtherDetail?.data?.fullName?.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName?.toUpperCase()} & ${buyerSalutation} ${buyerNameOtherDetail?.data[0]?.fullName?.toUpperCase()} W/O ${buyerNameOtherDetail?.data[0]?.fatherName?.toUpperCase()}`, bold: true }),
                            new TextRun({ text: " being the Mortgagor, has/have deposited the documents of title, evidences, deeds and writings more particularly described in the First Schedule hereunder written relating to the immovable properties more particularly described in the Second Schedule hereunder written and belonging to the Mortgagor with Lender, with an intent to create equitable mortgage by way of first and exclusive charge over the said immovable properties within the meaning of Section 58(f) of the Transfer of Property Act, 1882, in Favor of the Lender, for due repayment of the monies under the said Loan granted to the Borrower by the Lender, together with interest, costs, charges and other monies thereon Under the Loan Agreement/sanction letter, as amended from time to time." }),
                        ],
                        spacing: { after: 200 },
                    }),


                    // Clause 4
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[4]" }),
                            new TextRun({ text: ` The Mortgagor hereby confirm that the documents of title, evidences, deeds and writings more particularly described in the First Schedule (hereinafter referred to as "Documents") hereunder written are genuine, valid, marketable and enforceable at law.` }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 5
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[5]" }),
                            new TextRun({ text: " The Mortgagor further confirms that the immovable property mentioned in the Second Schedule hereunder is his/her/its absolute property and that no other person, body or authority has any right, title or interest in respect of and/or over the said immovable properties and the same is free from any lien, mortgage, charge, encumbrances and distress of any person, body or authority and no litigation is pending in respect thereof and the same is in his/her/its absolute possession and that the mortgage so created by the Mortgagor shall be a continuing security so long as the dues and other monies under the Loan Agreement are not repaid to the Lender in full. The Mortgagor further stated there is no impediment or hindrance under any applicable law or under any contract, suit, proceeding, decree, order, judgment, award or document or instrument preventing the Mortgagor from creating and perfecting the equitable mortgage created on the Immovable Property in favour of the Lender." }),
                        ],
                        spacing: { after: 200 },
                        pageBreakBefore: false, // For page break control
                    }),

                    // Clause 6
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[6]" }),
                            new TextRun({ text: " That this INSTRUMENT is to create the equitable mortgage by deposit of title deeds with the creditor that is to say the Lender, where by such mortgages created by the mortgagors by deposit of title deeds with the creditor shall be registered with the concerned Registrar to record the transaction of the Equitable Mortgage in Favor of the Lender." }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 7
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[7]" }),
                            new TextRun({ text: " The Mortgagor further stated that the Mortgagor has full power and absolute authority (corporate or otherwise) to create equitable mortgage over the Immovable Property in favour of the Lender. Mortgagor also stated that the Mortgagor has obtained all requisite consents, governmental approvals and other authorizations if required for the creation of the equitable mortgage in respect of the Immovable Property in favour of the Lender." }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Clause 8
                    new Paragraph({
                        children: [
                            new TextRun({ text: "[8]" }),
                            new TextRun({ text: " Mortgagor further stated that the Mortgagor has not entered into any contract for transfer, sale, assignment, encumbrance or alienation of the Immovable Property or any part thereof. The Mortgagor has confirmed that the Mortgagor, as the case may be has obtained all requisite consents, governmental approvals, authorizations and clearances including a no objection certificate, if required from the income tax authorities pursuant to Section 281 of the Income Tax Act, 1961 for the creation of the security in respect of the Mortgaged Property in favour of the Lender." }),
                        ],
                        pageBreakAfter: true,
                        spacing: { after: 200 },
                    }),

                    // NOW THIS INSTRUMENT WITNESSETH
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "NOW THIS INSTRUMENT WITNESSETH AS FOLLOWS:",
                                bold: true,
                            }),
                        ],
                        pageBreakBefore: true,
                        spacing: { after: 200 },
                    }),

                    // Main text block
                    new Paragraph({
                        children: [
                            new TextRun({ text: "In consideration of the Lender having granted to the Borrower the above referred Loan, the Mortgagor hereby declare and confirm that the deeds and documents of title, evidences, and writings comprised in the First Schedule hereunder written of the immovable properties, hereditaments and premises more particularly described in the Second Schedule hereunder written that have been deposited by the Mortgagor with Lender on the " }),
                            new TextRun({ text: `${day}/${monthNumner}/${year}`, bold: true }),
                            new TextRun({ text: " (date) with intent to create mortgage by way of first and exclusive charge basis over the said immovable property as mentioned in the Second Schedule, in Favor of Lender by way of deposit of title deeds within the meaning of Section 58(f) of the Transfer of Property Act, 1882, for due repayment to Lender of the all the Outstanding Obligations (as defined in the Loan Agreement) and other monies due under the Loan Agreement together with the Loan, Interest, costs, charges and other monies thereon and continued to remain as security within the meaning of Section 58 (f) of the Transfer of Property Act, 1882 in Favor of the Lender until redeemed by the Mortgagors or foreclosed as per the law in force by the Lender." }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // THE FIRST SCHEDULE - Title
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "THE FIRST SCHEDULE ABOVE REFERRED TO",
                                bold: true,
                                underline: true,
                                size: 28,
                            }),
                        ],
                        pageBreakBefore: true,
                        alignment: "center",
                        spacing: { after: 200 },
                    }),

                    // List of Title Deeds subtitle
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "(List of Title Deeds)",
                                bold: true,
                                italic: true,
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),

                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                        },
                        rows: [
                            // Table header row
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "Sr. No.",
                                                        bold: true,
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "Particulars of Documents",
                                                        bold: true,
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                ],
                            }),
                            // Row 1
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "1.",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "Original Co-Ownership No. ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters.coOwnerShipDeedNo}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " Dated: ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters.coOwnerShipDeedDate}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " Issued By SUB REGISTRAR Tehsil ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters?.Tehsil?.toUpperCase()} DISTRICT ${allPerameters?.district?.toUpperCase()} ${allPerameters?.state?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " In Favour Of ",
                                                    }),
                                                    new TextRun({
                                                        text: `${sellerSalutation} ${sellerOtherDetail?.data?.fullName?.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " & ",
                                                    }),
                                                    new TextRun({
                                                        text: `${buyerSalutation} ${buyerNameOtherDetail?.data[0]?.fullName?.toUpperCase()} W/O ${buyerNameOtherDetail?.data[0]?.fatherName?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: ".",
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Row 2
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "2.",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "Property Tax Receipt No. ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters.taxReciptNo}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " Dated ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters.taxReciptDate}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " FOR CURRENT YEAR ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters?.gramPanchayat?.toUpperCase()} TEHSIL ${allPerameters?.Tehsil?.toUpperCase()} DISTRICT ${allPerameters?.district?.toUpperCase()} ${allPerameters?.state?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " IN FAVOUR OF ",
                                                    }),
                                                    new TextRun({
                                                        text: `${sellerSalutation} ${sellerOtherDetail?.data?.fullName?.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " SEAL & SIGN BY SACHIV",
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Row 3
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "3.",
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        verticalAlign: VerticalAlign.CENTER,
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: "Original Praman Patra Certificate No. ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters?.pramanPatraNo}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " Dated ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters?.praMANpATRADate}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " ",
                                                    }),
                                                    new TextRun({
                                                        text: `${allPerameters.gramPanchayat?.toUpperCase()} TEHSIL ${allPerameters.Tehsil?.toUpperCase()} DISTRICT ${allPerameters.district?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: ` State ${allPerameters.state?.toUpperCase()} `,
                                                    }),
                                                    new TextRun({
                                                        text: `${sellerOtherDetail?.data?.fullName?.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName?.toUpperCase()}`,
                                                        bold: true,

                                                    }),
                                                    new TextRun({
                                                        text: " Seal & Sign By Sarpanch & Sachiv.",
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            // Empty rows (to match your screenshot)
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: {
                                            size: 15,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                    new TableCell({
                                        width: {
                                            size: 85,
                                            type: WidthType.PERCENTAGE,
                                        },
                                        children: [new Paragraph({})],
                                    }),
                                ],
                            }),
                        ],
                    }),


                    // SECOND SCHEDULE Title
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "-: SECOND SCHEDULE ABOVE REFERRED TO :-",
                                bold: true,
                                underline: true,
                                size: 28,
                            }),
                        ],
                        alignment: "center",
                        pageBreakBefore: true,
                        spacing: { before: 300, after: 200 },
                    }),

                    // Description subtitle
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "(Description of immovable property)",
                                bold: true,
                                italic: true,
                            }),
                        ],
                        alignment: "center",
                        spacing: { after: 200 },
                    }),

                    // Property address
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${allPerameters?.techFullAdress?.toUpperCase()}`,
                                bold: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Property boundaries intro
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "The Said property is surrounded by",
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // East boundary
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "On or towards the East :- ",
                            }),
                            new TextRun({
                                text: `${allPerameters?.OnOrTowardsEast}`,
                                // bold: true,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // West boundary
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "On or towards the West :- ",
                            }),
                            new TextRun({
                                text: `${allPerameters?.OnOrTowardsWest}`,
                                // bold: true,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // North boundary
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "On or towards the North :- ",
                            }),
                            new TextRun({
                                text: `${allPerameters?.OnOrTowardsNorth}`,
                                // bold: true,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // South boundary
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "On or towards the South :- ",
                            }),
                            new TextRun({
                                text: `${allPerameters?.OnOrTowardsSouth}`,
                                // bold: true,
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Property details
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "together with (i) all present and future, buildings, structures of every description which are standing, erected or attached to the aforesaid premises or any part thereof and all rights to use common areas and facilities and incidental thereto, together with all present and future liberties, privileges, easements and appurtenances whatsoever to the said premises or any part thereof or usually held, occupied or enjoyed therewith or expected to belong or be appurtenant thereto; and (ii) all plant and machinery attached to the earth or permanently fastened to anything attached to the earth, and such movable parts as they may comprise of.",
                            }),
                        ],
                        pageBreakAfter: true,
                        spacing: { after: 300 },
                    }),

                    // IN WITNESS WHEREOF
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "IN WITNESS WHEREOF THE PARTIES HAVE EXECUTED THIS PRESENTS ON THE DAY AND THE YEAR AS MENTIONED HEREINABOVE",
                                bold: true,
                                size: 28,
                            }),
                        ],
                        pageBreakBefore: true,
                        alignment: "center",
                        spacing: { after: 300 },
                    }),





                    // SIGNED AND DELIVERED
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "SIGNED AND DELIVERED by Within named Mortgagor",
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Mortgagor name 1 with highlighting
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${sellerSalutation} ${sellerOtherDetail?.data?.fullName?.toUpperCase()} S/O ${sellerOtherDetail?.data?.fatherName?.toUpperCase()} AND`,
                                bold: true,
                                ////--/--
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Mortgagor name 2 with highlighting
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${buyerSalutation} ${buyerNameOtherDetail?.data[0]?.fullName?.toUpperCase()} W/O ${buyerNameOtherDetail?.data[0]?.fatherName?.toUpperCase()}.`,
                                bold: true,

                            }),
                        ],
                        spacing: { after: 400 },
                    }),

                    // Witness section
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "In the presence of the following Witnesses: -",
                            }),
                        ],
                        spacing: { after: 300 },
                    }),

                    // Witness signature line 1
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "1. _____________________________",
                            }),
                        ],
                        spacing: { after: 200 },
                    }),

                    // Witness signature line 2
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "2. _____________________________",
                            }),
                        ],
                        spacing: { after: 400 },
                    }),

                    // Represented through section
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "REPRESENTED THROUGH ITS",
                                bold: true,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // Authorized Signatory
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "AUTHORIZED SIGNATORY VIZ.",
                                bold: true,
                            }),
                        ],
                        spacing: { after: 100 },
                    }),

                    // Authorized person name with highlighting
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Mr. ${allPerameters.authorizedperson?.toUpperCase()}`,
                                bold: true,

                            }),
                        ],
                        spacing: { after: 200 },
                    })

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

const ratnaEmDeedPdf = async (customerId, logo, partnerName, res) => {
    try {
        // const data = req.body; // Assuming data comes from the request body

        const customerDetails = await customerModel.findOne({ _id: customerId }).populate('productId')
        const coApplicantDetails = await coApplicantModel.find({ customerId })
        const guarantorDetails = await guarantorModel.findOne({ customerId })
        const applicantDetails = await applicantModel.findOne({ customerId })
        const technicalDetails = await technicalModel.findOne({ customerId })
        const appPdcDetails = await appPdcModel.findOne({ customerId })
        const cibilDetail = await cibilModel.findOne({ customerId })
        const disbuDetail = await DISBURSEMENTModel.findOne({ customerId })
        const creditPdDetails = await creditPdModel.findOne({ customerId });
        const sanctionPendencyDetails = await sanctionModel.findOne({ customerId });
        const finalsanctionDetails = await finalsanctionModel.findOne({ customerId });
        //internalLegalModel
        const internalLegalDATA = await internalLegalModel.findOne({ customerId });

        const fullName = internalLegalDATA?.buyerName


        // const matchingCoApplicant = coApplicantDetails.filter(coApplicant => coApplicant.fullName === fullName);
        // const fatherName = matchingCoApplicant ? matchingCoApplicant?.fatherName : "Not Found";

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





        const fatherName = matchingDetails.length > 0 ? matchingDetails[0] : null;


        const partnerModel = await lendersModel.findOne({
            _id: finalsanctionModel.partnerId,
        });

        const BranchNameId = customerDetails?.branch;
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
        const adharadress = matchingApplicant ? matchingApplicant.localAddress?.addressLine1 : "Not Found";



        const finalLoanAmountWorld = finalsanctionDetails?.finalLoanAmount;

        const finalloanwords = finalLoanAmountWorld ? numberToIndianWords(finalLoanAmountWorld) : "NA";

        const allPerameters = {

            authorizedperson: finalsanctionDetails?.authorizedPerson || "NA",
            agreementdate: formatDate(sanctionPendencyDetails?.loanAgreementDate) || "NA",
            agrementNo: sanctionPendencyDetails?.partnerLoanNo || "NA",

            sellerAdress: adharadress || "NA",
            roi: finalsanctionDetails?.roi || "NA",
            BranchName: branchName || "NA",
            finalLoanAmount: finalsanctionDetails?.finalLoanAmount || "NA",
            finalloanWords: finalloanwords,
            applicantDistrict: applicantDetails?.localAddress?.district || "NA",
            currentDate: formattedDate || "NA",
            partnerName: partnerModel?.fullName || "NA",
            partnerAdress: partnerModel?.registerAddress || "NA",
            partnerCoAdress: partnerModel?.corporateAddress || "NA",
            partnerEmail: partnerModel?.email || "NA",
            partnerContact: partnerModel?.phoneNumber || "NA",
            partnerCinNo: partnerModel?.cinNo || "NA",


            sellerFatherName: internalLegalDATA?.sellerFatherName || "NA",
            sellerName: internalLegalDATA?.sellerName || "NA",
            sellerAadharNo: aadharNo || "NA",

            sealandSignedBy: internalLegalDATA?.SealandSignedBy || "NA",
            buyerName: internalLegalDATA?.buyerName || "NA",
            buyerFatherName: fatherName?.fatherName || "NA",
            buyeraadharNo: fatherName?.aadharNo || "NA",
            ApplicantDistrict: applicantDetails?.localAddress?.district || "NA",
            applicantName: applicantDetails?.fullName || "NA",
            applicantFatherName: applicantDetails?.fatherName || "NA",

            propertyOwnerName: internalLegalDATA?.PropertyOwnerName || "NA",
            propertyOwnerFatherName: internalLegalDATA?.PropertyOwnerFatherName || "NA",

            CoapplicantName: coApplicantDetails?.[0]?.fullName || "NA",
            CoapplicantName1: coApplicantDetails?.[1]?.fullName || "NA",


            techFullAdress: technicalDetails?.fullAddressOfProperty || "NA",
            totalLandArea: technicalDetails?.totalLandArea || "NA",
            propertyOwner: technicalDetails?.nameOfDocumentHolder || "NA",

            appAdress: AppAddress,

            OnOrTowardsNorth: technicalDetails?.northBoundary || "NA",
            OnOrTowardsSouth: technicalDetails?.southBoundary || "NA",
            OnOrTowardsEast: technicalDetails?.eastBoundary || "NA",
            OnOrTowardsWest: technicalDetails?.westBoundary || "NA",

            pramanPatraNo: internalLegalDATA?.pramanPatra?.no || "NA",
            praMANpATRADate: formatDate(internalLegalDATA?.pramanPatra?.date) || "NA",

            gramPanchayat: technicalDetails?.gramPanchayat || "NA",
            Tehsil: technicalDetails?.tehsil || "NA",
            district: technicalDetails?.district || "NA",
            state: technicalDetails?.state || "NA",

            taxReciptNo: internalLegalDATA?.Property_Tax_Reciept?.no || "NA",
            taxReciptDate: formatDate(internalLegalDATA?.Property_Tax_Reciept?.date) || "NA",

            coOwnerShipDeedNo: internalLegalDATA?.co_ownership_deed?.no || "NA",
            coOwnerShipDeedDate: formatDate(internalLegalDATA?.co_ownership_deed?.date) || "NA",

            //gramPanchayat 

            gramPanchayatNo: internalLegalDATA?.gramPanchayat?.no || "NA",
            gramPanchayatDate: formatDate(internalLegalDATA?.gramPanchayat?.date) || "NA",

            emDeedNo: internalLegalDATA?.EM_DEED?.no || "NA",
            emDeedDate: formatDate(internalLegalDATA?.EM_DEED?.date) || "NA",

            landArea: technicalDetails?.totalLandArea || "NA",
        }

        const getSellerAndBuyerDetails = async (sellerName, customerId) => {
            try {
                const normalizedSeller = sellerName;

                // 1. Try match from Applicant Model
                const applicant = await applicantModel.findOne({
                    fullName: { $regex: new RegExp(`^${normalizedSeller}$`, 'i') },
                    customerId: customerId,
                });

                if (applicant) {
                    return {
                        type: 'applicant',
                        data: applicant,
                    };
                }

                // 2. Try match from Co-Applicant Model (multiple entries)
                const coApplicants = await coApplicantModel.find({
                    customerId: customerId,
                    fullName: { $regex: new RegExp(`^${normalizedSeller}$`, 'i') },
                });

                if (coApplicants.length > 0) {
                    return {
                        type: 'coApplicant',
                        data: coApplicants, // return array of matching co-applicants
                    };
                }

                return null;
            } catch (err) {
                console.error('Error fetching seller details:', err);
                throw err;
            }
        };

        const sellerOtherDetail = await getSellerAndBuyerDetails(allPerameters.sellerName, customerId);

        const buyerOtherDetail = await getSellerAndBuyerDetails(allPerameters.buyerName, customerId);

        const pdfBuffer = await generatePDF(allPerameters, sellerOtherDetail, buyerOtherDetail);
        const uploadResponse = await uploadPDFToBucket(pdfBuffer, `RatnaEmDeed${customerDetails?.customerFinId}${Date.now()}.docx`);
        const url = uploadResponse.url
        console.log("url--------", url, "-----------url")


        await finalsanctionModel.findOneAndUpdate(
            { customerId }, // Query to find the specific customer document
            {
                $set: { "ratnaEmDeedPdf_Url": url }
            },
            { new: true, upsert: true } // Options: Return the updated document, don't create a new one
        );

        return (
            {
                emDeedPdf: uploadResponse.url,
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
module.exports = { ratnaEmDeedPdf, uploadPDFToBucket };
