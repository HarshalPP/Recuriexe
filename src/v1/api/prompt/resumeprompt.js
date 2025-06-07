export const generateScreeningPrompt = (resume) => {
  return `You are an intelligent resume screening system. Extract the following structured information from the resume provided below and return it in JSON format. This JSON will be used to populate a MongoDB document, so make sure the data types (like strings, arrays, and dates) are correct and follow the schema.

Resume:
"""
${resume}
"""

Return JSON in the following format:

{
  "resume": "${resume}",
  "summary": "",
  "aboutUs": "",
  "resumeDetails": {
    "originalFileName": "",
    "uploadedAt": null,
    "parsedKeywords": [""]
  },
  "profile_Info": {
    "gender": "",
    "dob": null,  // Return as an ISO Date (e.g., 1990-06-15T00:00:00.000Z)
    "address1": "",
    "address2": "",
    "city": "",
    "state": "",
    "country": "",
    "pincode": "",
    "socialAccounts": [""]
  },
  "professional_Experience": [
    {
      "title": "",
      "employementType": "",
      "currentEmployer": "",
      "organization": "",
      "startDate": null,
      "endDate": null,
      "country": "",
      "state": "",
      "city": "",
      "description": ""
    }
  ],
  "education": [
    {
      "educationType": "",
      "degree": "",
      "university": "",
      "startDate": null,
      "endDate": null,
      "numberOfYears": "",
      "finalScore": "",
      "country": "",
      "state": "",
      "city": "",
      "yearOfPassing": "",
      "description": ""
    }
  ],
  "jobAlerts": [""],
  "skills": [""],
  "languagesKnown": [""],
  "jobPreferences": {
    "preferredLocations": [""],
    "jobType": "",
    "noticePeriodInDays": ""
  },
  "expectedSalary": "",
  "currentCTC": "",
  "role": "User",
  "isEmailVerified": false,
  "emailVerifiedDate": null,
  "isProfileCompleted": false,
  "isActive": true,
  "otp": {
    "code": "",
    "expiresAt": null
  },
  "tempPassword": false,
  "socialAuth": {
    "googleId": "",
    "linkedinId": "",
    "githubId": ""
  },
  "lastLogin": null,
  "activeToken": "",
  "passwordChangedAt": null,
  "passwordResetToken": "",
  "passwordResetExpires": null,
  "profileCompletionPercentage": 0,
  "Resume_Analizer": ""
}

📝 Notes:
- Use **null** for missing dates.
- Use **empty strings** or **empty arrays** for missing values.
- Do NOT make up values. Only extract what's in the resume.
- Ensure date fields are valid ISO strings (e.g., "2022-01-01T00:00:00.000Z").
- Do not change the field names or nesting.
- Country always India

Return only valid JSON.
`;
};



export const generateDepartmentPrompt = (inputText) => {
  return `You are an intelligent organization structure parser. From the input text below, extract and return all departments and their sub-departments in clean, valid JSON format.

Input Text:
"""
${inputText}
"""

Return JSON strictly in the following format:

[
  {
    "name": "Department Name",
    "subDepartments": [
      { "name": "Sub-Department 1" },
      { "name": "Sub-Department 2" }
    ]
  },
  {
    "name": "Another Department",
    "subDepartments": [
      { "name": "Sub-Dept A" },
      { "name": "Sub-Dept B" }
    ]
  }
]

📝 Notes:
- Only include departments and their sub-departments.
- Always use the field names: "name" and "subDepartments".
- ⚠️ Only provide **up to 3 subDepartments per department*
- Return an array of departments. Each must have a unique name.
- Return empty array for subDepartments if none exist.
- Do not add text outside of the JSON block.
- Only use information from the input — do not assume or create fictional departments.

Return strictly valid JSON.
`;
};


// 🔹 Prompt generator (without user input)
export const generateDesignationPrompt = (departmentName) => {
  return `You are an intelligent HR assistant. Your task is to generate a list of realistic and commonly used job designations for the "${departmentName}" department in an IT company.

Return a valid JSON array like this:
[
  { "name": "Designation 1" },
  { "name": "Designation 2" }
]

Rules:
- Only include the designation names.
- Do not include descriptions or commentary.
- Response must be valid JSON only — no extra text.`;
};

