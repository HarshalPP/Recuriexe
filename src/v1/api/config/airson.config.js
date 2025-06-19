import dotenv from 'dotenv';


dotenv.config();
export const AIRSON_API_CONFIG = {
    baseUrl: "https://airson.in/api", // 
    clientUrl: process.env.CLIENT_URL || "https://example.com/api", // Your webhook endpoint 
    contentType: "application/x-www-form-urlencoded", // 
    responseType: "application/json", // 
    timeout: 30000 // 30 seconds 
};