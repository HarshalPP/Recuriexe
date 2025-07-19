const electricityBillPrompt = (userPrompt) => {
    return `
     ### **User Request:**
    📌 Additional Instructions: "${userPrompt ? userPrompt : "Extract all key details from this Prompt given Below"}"

    customerName
     customerId
address IN ONE LINE


ONLY PROVIDE THIS DATA IN A TABLE NO OTHER DATA REQUIRED
 
GIVE RESPONSE ONLY IN JASON
  
    \`\`\`
    ### **Expected JSON Format  **
  
    \`\`\`json
    { 
    "customerNameAsPerElectricityBill": "VAJIR AMRATBHAI SHANKARBHAI", 
    "customerBillId": "71697/10227/1", 
    "addressAsPerElectricityBill": "BHATVARGAM, 
    village: BHATVARGAM,
     taluka: VAV,
      district: BANAS KANTHA" 
      }
     
              
    \`\`\`

    
    `;
};


const shopIncomePrompt = (userPrompt, shopName,incomeDetail ) => {
    return `
Generate a structured income and expense statement in Indian Rupees (INR) for ${shopName}.
Utilize provided income details from ${incomeDetail}, which represents all sources of income for this shop  and populate the statement using these income sources.
Present the output as an object, with a json table format for the income and expense data.
Only include "category" and "amount" fields in both income and expenses, and keep all amounts empty.
Exclude subcategories and notes from the table.
Additionally, provide 10 concise discussion questions to assess the borrower's creditworthiness,
excluding any questions related to loan repayment. The questions should also be included in the json output.



    \`\`\`
    example Like That only for Response Format
   {
    "shopName": "shyam  shop",
    "incomeDetail":"pan "
    "currency": "INR",
    "incomeExpenseStatement": {
        "income": [
            {
                "category": "Pan Shop Sales",
                "amount": 
            },
            {
                "category": "Other Business Income",
                "amount": 
            }
        ],
        "expenses": [
            {
                "category": "Raw Materials",
                "amount": 
            },
            {
                "category": "Shop Rent",
                "amount": 
            },
            {
                "category": "Utilities",
                "amount": 
            },
            {
                "category": "Labor Wages",
                "amount": 
            },
            {
                "category": "Miscellaneous Expenses",
                "amount": 
            }
        ],
        "netIncome": 
    },
    "creditworthinessDiscussionQuestions": [
        "How long have you been running Nikit Pan Sadan?",
        "What is your average daily sales volume?",
        "Do you maintain proper records of sales and expenses?",
        "What percentage of your customers are regulars?",
        "Have you faced any major disruptions in business in the past year?",
        "What are the peak business hours and peak seasons for your shop?",
        "Do you have any other source of income apart from this shop?",
        "How do you handle sudden price hikes in raw materials?",
        "Do you purchase inventory on credit from suppliers?",
        "Do you have a business savings account where income is regularly deposited?"
    ]
}
    \`\`\`
    ${userPrompt ? userPrompt : ""}
    `;
};

const udhyamPrompt = (userPrompt) => {
    return `
     ### **User Request:**
    📌 "Additional Instructions: ${userPrompt ? userPrompt : "EXTRACT UDHYAM REGISTRATION NUMBER OUTPUT - ONLY JSON. IF NOT FOUND GIVE PROPER JSON RESPONSE WITH STATUS FALSE AND MESSAGE 'Please upload correct PDF'"} 

UDHYAM NUMBER FETCH

RESPONSE MUST BE STRICTLY IN JSON FORMAT AS SHOWN BELOW:

If Udyam number is found, return:
            "udyamdata": {
                "udyamNumber": "UDYAM-MP-37-0039585",
                "Name of Enterprise": "SHANKAR LAL GURJUR",
                "Type of Enterprise": "",
                "Major Activity": "Manufacturing",
                "Social Category": "OBC",
                "Date of Incorporation": "01/01/2012",
                "Date of Commencement of Production/Business": "01/01/2012",
                "Organisation Type": "Proprietary",
                "MSME-DFO": "INDORE",
                "DIC Name": "RATLAM",
                "Official address of Enterprise": {
                    "Flat/Door/Block No": "MAKAN 248",
                    "Name of Premises/ Building": "WARD 12",
                    "Road/Street/Lane": "KOTHADI TAL",
                    "Village/Town": "KOTHADI TAL",
                    "Block": "ALOT",
                    "City": "TAL",
                    "District": "RATLAM",
                    "State": "MADHYA PRADESH",
                    "Pin": "457118",
                    "Email": "SHANKARLALGURJARGUEJAR@GMAIL.COM",
                    "Mobile": "96*****697"
                },
                "Unit(s) Details": [
                    {
                        "SN": 1,
                        "Unit_Name": "DAIRY FORM",
                        "Flat": "MAKAN 248",
                        "Building": "WARD 12",
                        "Road": "KOTHADITAL",
                        "Village/Town": "KOTHADI TAL",
                        "Block": "ALOT",
                        "City": "TAL",
                        "District": "RATLAM",
                        "State": "MADHYA PRADESH",
                        "Pin": "457118"
                    }
                ],
            },
            status:"true"
        



If Udyam number is not found or PDF is incorrect, return:
{
    "status": false,
    "subCode": 400,
    "message": "Please upload correct PDF",
    "error": "UDHYAM NUMBER NOT FOUND",
    "items": {}
}

IMPORTANT: The response must always be a **VALID JSON OBJECT** — do not return plain text, HTML, or any other format.
"
    `;
};

const properPaperPrompt = (userPrompt) => {
    return `
     ### **User Request:**
    📌 "Additional Instructions: ${userPrompt ? userPrompt : "NEED TO EXTRACT DATA IN BELOW FORMATE CONVERT TO ENGILSH IF REQUIRED Property Holder InformationName of Document HolderFather NameRelation with ApplicantProperty Location DetailsHouse No.Survey No.Patwari Halka No.Ward No.PINCODEVillage NameGram PanchayatTehsilDistrictStateFull Address of the PropertyProperty Address and LandmarkProperty Property SpecificationsType of PropertyTotal Land Area (In sq.ft)Total Built-up Area (In sq.ft)Type of ConstructionQuality of ConstructionAge of PropertyProperty BoundariesEast BoundaryWest BoundaryNorth BoundarySouth Boundary 'Please upload correct PDF'"} 

  Please Given Proper JSON Data

    `;
};



  // Aadhar verification prompt
  const generateAadharVerificationPrompt = (expectedNumber) => {
    return `
      You are an intelligent Aadhaar card verification system. I need you to:
      
      1. Extract the 12-digit Aadhaar number from the document image.
      2. Extract the person's name, date of birth, and gender if visible.
      3. Verify if the extracted Aadhaar number matches: ${expectedNumber}
      
      ONLY PROVIDE DATA IN JSON FORMAT AS SPECIFIED BELOW. DO NOT INCLUDE ANY EXPLANATIONS OR MARKDOWN.
      
      Required JSON format:
      {
        "extractedNumber": "123456789012",
        "name": "FULL NAME AS SHOWN",
        "dob": "DD/MM/YYYY",
        "gender": "Male or Female"
      }
    `;
  };
  
  // PAN verification prompt
  const generatePanVerificationPrompt = (expectedNumber) => {
    return `
      You are an intelligent PAN card verification system. I need you to:
      
      1. Extract the 10-character PAN number from the document image.
      2. Extract the person's name and date of birth if visible.
      3. Verify if the extracted PAN number matches: ${expectedNumber}
      
      ONLY PROVIDE DATA IN JSON FORMAT AS SPECIFIED BELOW. DO NOT INCLUDE ANY EXPLANATIONS OR MARKDOWN.
      
      Required JSON format:
      {
        "extractedNumber": "ABCDE1234F",
        "name": "FULL NAME AS SHOWN",
        "dob": "DD/MM/YYYY"
      }
    `;
  };
  
  const coOwnershipDeedPrompt = (userPrompt, documentType) => {
    let defaultInstruction = "";
  
    if (documentType === "pramanPatra") {
      defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karamak.`;
    } else if (documentType === "taxReceipt") {
      defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as rasid number.`;
    } else if (documentType === "coOwnershipDeed") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'pick all the information from the digitally signed and return only one object not multiple time Date&Time' as extract Date only, 'Signature' as Designation (if it's from Sub Registrar (SR) then Sub Registrar, if from Registrar then Registrar). Extract number as Registration Number.`;
    }
    else if (documentType === "gramPanchayatPatta") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karamak`;
    }
    else if (documentType === "nocCertificate") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karamak.`;
    }
    else if (documentType === "buildingPermission") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karamak.`;
    }
    else if (documentType === "mutationCertificate") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karmak full date.`;
    }
    else if (documentType === "ownershipCertificate") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as karmak full date.`;
    }
    else if (documentType === "sevenPagerTaxReceipt") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as rasid no left side 
        .`;
    }
    else if (documentType === "draftingDocument") {
        defaultInstruction = `NEED TO EXTRACT DATA IN BELOW FORMAT. CONVERT TO ENGLISH IF REQUIRED. 'dinak' as Date, 'hastashar' as Signature (if it's from Sachiv then Sachiv, if from sarpanch then Sarpanch, if both then Sachiv&Sarpanch). Extract number as rasid no left side 
        .`;
    }
     else {
      defaultInstruction = userPrompt || "Please provide instructions for this document type.";
    }
    return `
  ### **User Request:**
  📌 Additional Instructions: ${userPrompt || defaultInstruction}
  
  Please provide proper JSON data with the following fields:
  - date
  - signature
  - number
  `;
  };

  const propertyDetailPrompt = (userPrompt, documentType) => {
    let defaultInstruction = "";
  
    if (documentType === "ownershipCertificate") {
        defaultInstruction = `NEED TO EXTRACT DATA IN THE FOLLOWING FORMAT. CONVERT TO ENGLISH IF REQUIRED. 

        - 'Prathi Shree/Shreemati' as propertyOwnerName  
        - 'Pita/Pati Shree' as fatherName  
        - Extract correct Patwari Halka Number as patwariHalkaNumber (e.g., it's 13 but currently getting 23)  
        - 'Ward No.' as wardNo  
        - Correct Khasra No. as surveyNo (e.g., it's 738 but getting wrong)  
        - 'Gram' as both gramPanchayat and villageName  
        - 'Tehsil' as tehsil (currently getting 'Punner' but it should be 'Khujner')  
        - 'Jila' as district  
        - 'State' should be extracted using bracketValue()  
        - 'Purv me' as eastBoundary  
        - 'Pashim me' as westBoundary  
        - 'Uttar me' as northBoundary  
        - 'Dakshin me' as southBoundary  
        - 'Kul Chhetrafal' in square feet as landArea (e.g., it's 800)
        
        Make sure the values extracted are accurate and do not require manual correction.`;
        
    }else if (documentType === "pramanPatraCertificate") {
        defaultInstruction = `NEED TO EXTRACT DATA IN THE FOLLOWING FORMAT. CONVERT TO ENGLISH IF REQUIRED. 
        HANDLE HANDWRITTEN TEXT CAREFULLY. IF NUMBERS ARE UNCLEAR OR AMBIGUOUS (e.g., '05' looking like '09'), USE CONTEXT TO DETERMINE THE MOST LIKELY CORRECT VALUE.
    
        - 'Shree' as propertyOwnerName  
        - 'Pita' as fatherName  
        - Extract correct Patwari Halka Number as patwariHalkaNumber (ensure it's accurate even if handwritten, like 05 not 09)  
        - 'Ward No.' as wardNo  (ensure it's accurate even if handwritten, like 05 not 09) 
        - 'Gram' as both gramPanchayat and villageName  
        - 'Plot/Makan/Khadar/Khasra' as surveryNo (ensure correctness — e.g., it may be 201 but misread)  
        - 'Tehsil' as tehsil (if detected as 'Punner', correct to 'Khujner' based on context)  
        - 'Jila' as district  
        - 'State' should be extracted using bracketValue()  
        - 'Purv me' as eastBoundary  
        - 'Pashim me' as westBoundary  
        - 'Uttar me' as northBoundary  
        - 'Dakshin me' as southBoundary  
        - 'Kul Chhetrafal' in square feet as landArea (e.g., it’s 800 — ensure correct unit and number even if handwritten)
    
        FOCUS ON ACCURACY. PRIORITIZE MEANING AND CONTEXT OVER DIRECT TEXT MATCHING.`;
    
    } else {
      defaultInstruction = userPrompt || "Please provide instructions for this document type.";
    }
    return `
  ### **User Request:**
  📌 Additional Instructions: ${userPrompt || defaultInstruction}
  
  Please provide proper JSON data with the following fields:
  - propertyOwnerName
  - fatherName
  - patwariHalkaNumber
  - wardNo
  - surveryNo
  - villageName
  - gramPanchayat
  - tehsil
  - district
  - state
  - eastBoundary
  - westBoundary
  - northBoundary
  - southBoundary
  - landArea
  ` ;
  };
  
  
module.exports = {
    electricityBillPrompt,
    shopIncomePrompt,
    udhyamPrompt,
    properPaperPrompt,
    generateAadharVerificationPrompt,
    generatePanVerificationPrompt,
    coOwnershipDeedPrompt,
    propertyDetailPrompt
}
