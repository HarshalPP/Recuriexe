import axios from 'axios';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';


export async function signDocumentWithSignzy(req) {
  try {
    
    // Step 1: Load PDF and convert to base64
    const pdfPath = process.cwd()+'/pdf/1751632057659.pdf'; // Replace with your actual file
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64PDF = pdfBuffer.toString('base64');

    // Step 2: Define signer details
    const invitees = [
      {
        signerName: 'John Doe',
        signerMobile: '9589517945', // 10-digit mobile
        signerEmail: 'sharmahari9589@gmail.com',
        signerGender: 'MALE',
        signatureType: 'AADHAARESIGN-OTP',
        cancelBySigner: true,
        additionalSignatureTypes: ['AADHAARESIGN-FINGERPRINT'],
        postVerification: ['OTP'],
        signatures: [
          {
            pageNo: ['1-Last'],
            signaturePosition: ['BOTTOMLEFT']
          }
        ]
      }
    ];

    // Step 3: Prepare request payload
    const payload = {
      pdf: base64PDF,
      contractName: 'DemoContract',
      contractExecuterName: 'Signzy',
      successRedirectUrl: 'https://signzy.com/success',
      failureRedirectUrl: 'https://signzy.com/failure',
      crossOtpVerification: true,
      signerdetail: invitees,
      workflow: true,
      isParallel: true,
      redirectTime: 5,
      locationCaptureMethod: 'iP',
      initiationEmailSubject: 'Please sign the document',
      emailPdfCustomNameFormat: 'SIGNERNAME',
      signOnStamp: true,
      clickwrapConfigurableText: 'I agree to the eSign terms'
    };

    // Step 4: Set headers
    const headers = {
      Authorization: '3Ghi2XGNEhlMMq69dSnnLLRFHu4AD8G3', // Replace with real API key
      'Content-Type': 'application/json',
      'x-uniqueReferenceId': uuidv4()
    };

    // Step 5: Make API request
    const { data } = await axios.post(
      'https://api.signzy.app/api',
      payload,
      { headers }
    );

    console.log('✔ Contract initiated');
    console.log('Contract ID:', data.contractId);
    console.log('Signer URL:', data.signerdetail?.[0]?.workflowUrl);
  } catch (err) {
    console.error('❌ Error initiating eSign:', err.response?.data || err.message);
  }
}

