require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Encryption function
const encryptData = (data, key, iv) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
};

// Decryption function
const decryptData = (data, key, iv) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(data, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

// Build eNACH request payload
const buildENachRequest = (data) => ({
    trxnno: data.trxnno,
    enach_amount: data.amount,
    frequencydeduction: data.frequency,
    mandatestartdate: data.startDate,
    mandateenddate: data.endDate,
    accounttype: 'SA', // Savings Account
    authenticationmode: 'N', // Net Banking
    accountnumber: data.accountNumber,
    accountholdername: data.accountHolderName,
    emailid: data.email,
    mobileno: data.mobile,
    merchantid: process.env.MERCHANT_ID,
    subbillerid: process.env.SUBBILLER_ID,
    redirecturl: 'https://your-redirect-url.com',
    responseurl: 'https://your-response-url.com',
    mandatecategory: 'B001' // e.g., Bill Payment
});

// Send eNACH request
const sendENachRequest = async (requestData) => {
    const key = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16).toString('hex');
    const encryptedReq = encryptData(JSON.stringify(requestData), key, iv);

    const payload = {
        param: `${process.env.MERCHANT_ID}.${iv}.${encryptedReq}`
    };

    try {
        const response = await axios.post('https://uat.camspay.com/api/v1/instanach', payload);
        return response.data;
    } catch (error) {
        console.error('Error sending eNACH request:', error);
        throw error;
    }
};

// Handle eNACH response decryption
const handleENachResponse = (response) => {
    const [iv, encryptedData] = response.res.split('.');
    const decryptedResponse = decryptData(encryptedData, process.env.ENCRYPTION_KEY, iv);
    return JSON.parse(decryptedResponse);
};

// Route to initiate eNACH
app.post('/api/enach/register', async (req, res) => {
    const requestData = buildENachRequest(req.body);
    try {
        const response = await sendENachRequest(requestData);
        const decryptedResponse = handleENachResponse(response);
        res.json(decryptedResponse);
    } catch (error) {
        res.status(500).json({ error: 'Failed to initiate eNACH' });
    }
});

// Callback endpoint to handle responses from CAMSPay
app.post('/api/enach/response', (req, res) => {
    const response = req.body;
    const decryptedResponse = handleENachResponse(response);
    console.log('Received callback:', decryptedResponse);
    // Process the callback data as needed
    res.status(200).send('Callback received');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
