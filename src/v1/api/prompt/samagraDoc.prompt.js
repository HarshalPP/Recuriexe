 const samargraPrompt = (userPrompt) => {
    return `
     ### **User Request:**
    📌 Additional Instructions: "${userPrompt ? userPrompt : "Extract all key details from this Prompt given Below"}"

    🚨 **Important:**  
    - **Do NOT include any text before or after the JSON.**  
    - **Ensure the response is 100% valid JSON format.** 
    ### **Expected JSON Format Type :rasanCard **
    CONVERT THIS IN ENGLISH AND DATA IN TABLE,EXTRACT FAMILY DETAIL, KEPP ONLY DATA TABLE AND FAMILY DETAIL , 
    GIVE ME ONLY JASON DATA
    Return **ONLY valid JSON FOR  RASAN CARD** in the following structure:
    \`\`\`json
    {
 "detail": {
            "cardNumber": "10200 10129 39962",
            "cardHolder": "Vajir Amratbhai Shankarbhai",
            "address": "48/1, Bhatvarvas, Bhatvargam Village, Vav, Banaskantha",
            "shopCode&Location": "8347 - Bhatvargam 1, Taluka: Vav",
            "shopkeeper": "715 - G.L. Rabari",
            "gasAgency": "M/s Mitul Gas Service",
            "gasConnectionNo.": "83315656",
            "connectionType": "SBC"
        },
        "familyMembers": [
            {
                "memberName": "Vajir Amratbhai Shankarbhai",
                "relationship": "Self",
                "age": 25,
                "dob": "01/01/2010"
            },
            {
                "memberName": "Vajir Prabhaben Amratbhai",
                "relationship": "Wife",
                "age": 22,
                "dob": "01/01/2010"
            },
            {
                "memberName": "Vajir Kuldeepbhai Amratbhai",
                "relationship": "Son",
                "age": 3,
                "dob": "01/01/2010"
            }
        ]
    }
  
    \`\`\`
    ### **Expected JSON Format Type: samagraId **
   CONVERT THIS IN ENGLISH AND CONVERT TABLE DATA IN TABLE
   REMOVE REGISTRAR DATE COLUMN
   REMOVE YOUR STARTING LINES DIRECT START FROM SAMAGRA ID
   REMOVE REGISTRAR DETAIL,CARD PRINT DATE ,WEBSITE INFO
   PROVIDE ONLY IN JASON
   RULES TO FOLLOW IN JASON
   GIVE DETAIL OF CURRENT ADDRESS IN ONE KEY ADDRESS AS PER ADDHAR IN ONE KEY
   IN JASON COUNT OF ROW DETAIL IN FAMILY MEMBERS KEY
   PROVIDE ONLY IN JASON
     Return **ONLY valid JSON FOR SAMAGRA DOC** in the following structure:
    \`\`\`json
   {"detail": {
        "samagraFamilyId": "22708642",
        "headOfFamily": "Shyam Singh Rathod",
        "address": {
      "currentAddress": "67/4, Vishniya, Village: Vishniya, Gram Panchayat: Vishniya, Janpad Panchayat, Garoth, District: Mandsaur",
    "addressAsPerAadhaar": "Makan N - 38, Gram - Vishniya, Tah - Shamgarh, Post - Boliya, Mandsaur, 458880"
 },
        "familyMembers": [
            {
                "samagraId": "106012868",
                "aadhaarStatus": "Available",
                "memberName": "Mangu Singh Chouhan",
                "relationship:"",
                "age": 40,
                "gender": "Male",
                "registrationAuthority": "Mindli",
                "registrationDate": "17/02/2013"
            },
            {
                "samagraId": "106014014",
                "aadhaarStatus": "Available",
                "memberName": "Janas Kunvar Sondhiya",
                "relationship:"",
                "age": 36,
                "gender": "Female",
                "registrationAuthority": "Mindli",
                "registrationDate": "17/02/2013"
            }
        ],
              "familyMembersCount": 3
    }
    \`\`\`

    
    `;
};



const aadhaPromt = (userPrompt) => {
    return `
     ### **User Request:**
    📌 "Additional Instructions: ${userPrompt ? userPrompt : "EXTRACT UDHYAM REGISTRATION NUMBER OUTPUT - ONLY JSON. IF NOT FOUND GIVE PROPER JSON RESPONSE WITH STATUS FALSE AND MESSAGE 'Please upload correct PDF'"} 

UDHYAM NUMBER FETCH

RESPONSE MUST BE STRICTLY IN JSON FORMAT AS SHOWN BELOW:

If Udyam number is found, return:
            



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



module.exports = {
    samargraPrompt
}
