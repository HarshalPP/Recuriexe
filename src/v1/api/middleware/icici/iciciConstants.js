import "dotenv/config";

const BASE = (process.env.ICICI_PAYMENR_URL ||
  "https://payuatrbac.icicibank.com").replace(/\/+$/, "");

const BANK = process.env.ICICI_BANK_ID || "24520";

export const VERSION = "1";

const CONSTANTS = {
  VERSION,
  GATEWAYURL: `${BASE}/accesspoint/angularBackEnd/requestproxypass`,
  STATUSURL: `${BASE}/accesspoint/v1/${BANK}/checkStatusMerchantKit`,
  REFUNDURL: `${BASE}/accesspoint/v1/${BANK}/createRefundFromMerchantKit`,
};

export default CONSTANTS; 
