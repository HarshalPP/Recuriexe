import dotenv from 'dotenv';


dotenv.config();
// ...existing code...
export const AIRPHONE_API_CONFIG = {
    baseUrl: "https://airson.in/api",
    clientUrl: process.env.CLIENT_URL,
    contentType: "application/x-www-form-urlencoded",
    responseType: "application/json",
      authToken: 'DqazlkMZ6Rk3nHLyyDDHLqLUh9vSav7DadnLmzxSz76FWYYDQRtY1fsoyN4PMC1S',
    timeout: 30000
};
