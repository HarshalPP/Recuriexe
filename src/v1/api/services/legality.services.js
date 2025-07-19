const { default: axios } = require("axios")
const fs = require('fs');
const path = require("path");
const coApplicantModel = require("../model/co-Applicant.model");
const applicantModel = require("../model/applicant.model.js");
const guarantorModel = require("../model/guarantorDetail.model");
const finalModel = require("../model/finalSanction/finalSnction.model.js");


const baseUrl = 'https://app1.leegality.com/api/v3.0/'

async function initESign(signingData, customerId) {

    const applicantData = await applicantModel.findOne({ customerId })
    const coAppData = await coApplicantModel.find({ customerId })
    const guarantorData = await guarantorModel.findOne({ customerId })
    const finalData = await finalModel.findOne({ customerId })

    const base64Files = await Promise.all(signingData.map(async (fileUrl) => {
        try {
            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            const base64String = Buffer.from(response.data).toString('base64'); // Convert to base64

            return {
                name: path.basename(fileUrl),
                file: base64String,
                mimeType: 'application/pdf'
            };
        } catch (error) {
            console.error(`Failed to fetch file from URL: ${fileUrl}`, error.message);
            return null;
        }
    }));
    // console.log(finalData,"finalDatafinalDatafinalData")
    const validFiles = base64Files.filter(file => file !== null);
    // console.log("validFilesvalidFilesvalidFiles",finalData.pdfSelection)



    let invitees
    if (finalData && finalData.pdfSelection == "acg" || finalData.pdfSelection.toUpperCase() == "ACG") {
        invitees = [
            {
                name: applicantData?.fullName,
                email: applicantData?.email?.toLowerCase(),
                phone: applicantData?.mobileNo,
            },
            {
                name: coAppData[0]?.fullName,
                email: coAppData[0]?.email?.toLowerCase(),
                phone: coAppData[0]?.mobileNo,
            },
            {
                name: guarantorData?.fullName,
                email: guarantorData?.email?.toLowerCase(),
                phone: guarantorData?.mobileNo,
            }
        ]
        console.log(invitees, "invitees<<>><<>><<>>")
        const bodyData = {
            profileId: "WyQnfCJ",
            file: {
                name: applicantData?.fullName,
                file: validFiles[0].file,
                additionalFiles: validFiles.slice(1).map(f => f.file)
            },
            invitees: invitees,
            irn: "abcd123"
        };
        try {
            const response = await axios.post(baseUrl + 'sign/request', bodyData, {
                headers: {
                    'X-Auth-Token': process.env.LEGALITY_AUTH_TOKEN,
                    "Content-Type": "application/json"
                }
            });

            console.log(response.data, "Response Data in eSign:", JSON.stringify(response.data));

            const invitees = response.data?.data?.invitees || [];
            
            const obj = {
                "documentId": response.data?.data?.documentId || "",
                "applicant": invitees[0]?.signUrl || "",
                "coApplicant": invitees[1]?.signUrl || "",
                "guarantor": invitees[2]?.signUrl || ""
            };
            
            console.log(obj, "<><><");
            
            // Check if all required fields have values
            const allDocumentsPresent = Object.values(obj).every(value => value !== "");
            
            return allDocumentsPresent ? obj : response.data;
            

        } catch (error) {
            console.error("Error in eSign Request:", error.message);
            return {
                "applicant": "",
                "coApplicant": "",
                "guarantor": ""
            };
        }

    }

    if (finalData && finalData.pdfSelection == "ac" || finalData.pdfSelection.toUpperCase() == "AC") {
        invitees = [
            {
                name: applicantData?.fullName,
                email: applicantData?.email?.toLowerCase(),
                phone: applicantData?.mobileNo,
            },
            {
                name: coAppData[0]?.fullName,
                email: coAppData[0]?.email?.toLowerCase(),
                phone: coAppData[0]?.mobileNo,
            },
        ]

        const bodyData = {
            profileId: "WyQnfCJ",
            file: {
                name: applicantData?.fullName,
                file: validFiles[0].file,
                additionalFiles: validFiles.slice(1).map(f => f.file)
            },
            invitees: invitees,
            irn: "abcd123"
        };

        try {
            const response = await axios.post(baseUrl + 'sign/request', bodyData, {
                headers: {
                    'X-Auth-Token': process.env.LEGALITY_AUTH_TOKEN,
                    "Content-Type": "application/json"
                }
            });

            console.log(response.data, "Response Data in eSign:", JSON.stringify(response.data?.data?.invitees));

            const invitees = response.data?.data?.invitees || [];
            
            const obj = {
                "documentId": response.data?.data?.documentId || "",
                "applicant": invitees[0]?.signUrl || "",
                "coApplicant": invitees[1]?.signUrl || ""
            };
            
            console.log(obj, "<><><");
            
            // Check if all required fields have values
            const allDocumentsPresent = Object.values(obj).every(value => value !== "");
            
            return allDocumentsPresent ? obj : response.data;
            

        } catch (error) {
            console.error("Error in eSign Request:", error.message);
            return {
                "applicant": "",
                "coApplicant": "",
            };
        }
    }

    if (finalData && finalData.pdfSelection == "acc" || finalData.pdfSelection.toUpperCase() == "ACC") {
        invitees = [
            {
                name: applicantData?.fullName,
                email: applicantData?.email?.toLowerCase(),
                phone: applicantData?.mobileNo,
            },
            {
                name: coAppData[0]?.fullName,
                email: coAppData[0]?.email?.toLowerCase(),
                phone: coAppData[0]?.mobileNo,
            },
            {
                name: coAppData[1]?.fullName,
                email: coAppData[1]?.email?.toLowerCase(),
                phone: coAppData[1]?.mobileNo,
            },
        ]

        const bodyData = {
            profileId: "WyQnfCJ",
            file: {
                name: applicantData?.fullName,
                file: validFiles[0].file,
                additionalFiles: validFiles.slice(1).map(f => f.file)
            },
            invitees: invitees,
            irn: "abcd123"
        };

        try {
            const response = await axios.post(baseUrl + 'sign/request', bodyData, {
                headers: {
                    'X-Auth-Token': process.env.LEGALITY_AUTH_TOKEN,
                    "Content-Type": "application/json"
                }
            });

            console.log(response.data, "Response Data in eSign:", JSON.stringify(response.data?.data?.invitees));

            const invitees = response.data?.data?.invitees || [];
            
            const obj = {
                "applicant": invitees[0]?.signUrl || "",
                "coApplicant": invitees[1]?.signUrl || "",
                "coApplicantTwo": invitees[2]?.signUrl || ""
            };
            
            console.log(obj, "<><><");
            
            // Check if all fields in `obj` have values
            const allDocumentsPresent = Object.values(obj).every(url => url !== "");
            
            return allDocumentsPresent ? obj : response.data;
            

        } catch (error) {
            console.error("Error in eSign Request:", error.message);
            return {
                "applicant": "",
                "coApplicant": "",
                "coApplicantTwo": ""
            };
        }
    }

    if (finalData && finalData.pdfSelection == "accg" || finalData.pdfSelection.toUpperCase() == "ACCG") {
        invitees = [
            {
                name: applicantData?.fullName,
                email: applicantData?.email?.toLowerCase(),
                phone: applicantData?.mobileNo,
            },
            {
                name: coAppData[0]?.fullName,
                email: coAppData[0]?.email?.toLowerCase(),
                phone: coAppData[0]?.mobileNo,
            },
            {
                name: coAppData[1]?.fullName,
                email: coAppData[1]?.email?.toLowerCase(),
                phone: coAppData[1]?.mobileNo,
            },
            {
                name: guarantorData?.fullName,
                email: guarantorData?.email,
                phone: guarantorData?.mobileNo,
            }
        ]

        console.log(invitees,"inviteesinviteesinvitees")

        const bodyData = {
            profileId: "WyQnfCJ",
            file: {
                name: applicantData?.fullName,
                file: validFiles[0].file,
                additionalFiles: validFiles.slice(1).map(f => f.file)
            },
            invitees: invitees,
            irn: "abcd123"
        };

        try {
            const response = await axios.post(baseUrl + 'sign/request', bodyData, {
                headers: {
                    'X-Auth-Token': process.env.LEGALITY_AUTH_TOKEN,
                    "Content-Type": "application/json"
                }
            });

            console.log(response.data, "Response Data in eSign:", JSON.stringify(response.data));

            const invitees = response.data?.data?.invitees || [];
            
            const obj = {
                "applicant": invitees[0]?.signUrl || "",
                "coApplicant": invitees[1]?.signUrl || "",
                "coApplicantTwo": invitees[2]?.signUrl || "",
                "guarantor": invitees[3]?.signUrl || ""
            };
            
            // Check if all fields in `obj` have values
            const allDocumentsPresent = Object.values(obj).every(url => url !== "");
            
            if (allDocumentsPresent) {
                return obj;
            } else {
                return response?.data;
            }

        } catch (error) {
            console.error("Error in eSign Request:", error.message);
            return {
                "applicant": "",
                "coApplicant": "",
                "coApplicantTwo": ""
            };
        }
    }

    if (finalData && finalData.pdfSelection == "acccg" || finalData.pdfSelection.toUpperCase() == "ACCCG") {
        invitees = [
            {
                name: applicantData?.fullName,
                email: applicantData?.email?.toLowerCase(),
                phone: applicantData?.mobileNo,
            },
            {
                name: coAppData[0]?.fullName,
                email: coAppData[0]?.email?.toLowerCase(),
                phone: coAppData[0]?.mobileNo,
            },
            {
                name: coAppData[1]?.fullName,
                email: coAppData[1]?.email?.toLowerCase(),
                phone: coAppData[1]?.mobileNo,
            },
            {
                name: coAppData[2]?.fullName,
                email: coAppData[2]?.email?.toLowerCase(),
                phone: coAppData[2]?.mobileNo,
            },
            {
                name: guarantorData?.fullName,
                email: guarantorData?.email,
                phone: guarantorData?.mobileNo,
            }
        ]

        console.log(invitees,"inviteesinviteesinvitees")

        const bodyData = {
            profileId: "WyQnfCJ",
            file: {
                name: applicantData?.fullName,
                file: validFiles[0].file,
                additionalFiles: validFiles.slice(1).map(f => f.file)
            },
            invitees: invitees,
            irn: "abcd123"
        };

        try {
            const response = await axios.post(baseUrl + 'sign/request', bodyData, {
                headers: {
                    'X-Auth-Token': process.env.LEGALITY_AUTH_TOKEN,
                    "Content-Type": "application/json"
                }
            });

            // console.log(response.data, "Response Data in eSign:", JSON.stringify(response.data));

            const invitees = response.data?.data?.invitees || [];
            
            const obj = {
                "applicant": invitees[0]?.signUrl || "",
                "coApplicant": invitees[1]?.signUrl || "",
                "coApplicantTwo": invitees[2]?.signUrl || "",
                "coApplicantThree": invitees[3]?.signUrl || "",
                "guarantor": invitees[4]?.signUrl || ""
            };
            
            // Check if all fields in `obj` have values
            const allDocumentsPresent = Object.values(obj).every(url => url !== "");
            console.log(allDocumentsPresent,"allDocumentsPresentallDocumentsPresentallDocumentsPresent")
            return allDocumentsPresent ? obj : response.data;

        } catch (error) {
            console.error("Error in eSign Request:", error.message);
            return {
                "applicant": "",
                "coApplicant": "",
                "coApplicantTwo": ""
            };
        }
    }

}

module.exports = {
    initESign
}