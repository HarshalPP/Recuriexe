// utils/googleClient.js
import { google } from 'googleapis';
import dotenv from 'dotenv';

const CLIENT_ID = "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com"
// const CLIENT_SECRET = "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"
const CLIENT_SECRET = "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"
const REDIRECT_URI = 'https://finexe.fincooper.in/callback'


// const CLIENT_ID = "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com"
// const CLIENT_SECRET = "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"
// const REDIRECT_URI = 'https://finexe.fincooper.in/callback'

// REDIRECT_URI=https://finexe.fincooper.in/callback
// CLIENT_ID=96723624360-diipk9vl279otus9qcdp5bmm0dess1bh.apps.googleusercontent.com
// CLIENT_SECRET=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
// ACCESS_TOKEN=ya29.a0AS3H6Nze4Ivb-PTC5MleGCuPLExQ0u399XCZc9nz2AZ2njcGWvc8rghpiltIhrT1gHrixa8LPqOGxip2N_00Zfn0Q1kz2Y3S4pAwzOmua1sxfX1eiRsCbMOXEeEgSnTqVLkgwShp2A5oNjtDgs2Rq7f8eiKrmfv8pPInFaUBaCgYKAS0SARASFQHGX2MiHz62IteppY64ZTlocrxTmQ0175
// REFRESH_TOKEN=1//0gCRpUj6-Bt_ICgYIARAAGBASNwF-L9IrofH_1PmPml0lVdRsmahXJnYHa2GCxj8PEcnz3X167UtSQTI-xdW_zeVCRqqF6bl8KyM
// EXPIRY_DATE=1751440014544

dotenv.config();   // .env से VARIABLE पढ़ने के लिये

// --- quick sanity‑check --------------------------------------------------
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error(
        'Missing Google OAuth env vars: set CLIENT_ID, CLIENT_SECRET, REDIRECT_URI'
    );
}
// -------------------------------------------------------------------------

/**
 * एक नया OAuth2 client बनाकर return करता है।
 * हर call पर fresh instance मिलता है, ताकि concurrent requests टकराएँ नहीं.
 */
export const getOAuth2Client = () => {
    const oauth2 = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );
    console.log('oauth2', oauth2)
    /**
     * Helper: क्या access_token expire होने वाला है?
     * true => 5 मिनिट से कम validity बची है या कोई expiry_date ही नहीं.
     */
    oauth2.isTokenExpiring = () => {
        const { expiry_date } = oauth2.credentials;
        if (!expiry_date) return true;                 // अगर expiry पता नहीं → refresh कर लो
        const FIVE_MIN = 5 * 60 * 1000;                // 5 minutes in ms
        return Date.now() + FIVE_MIN >= expiry_date;   // about‑to‑expire?
    };

    return oauth2;
};

/**
 * Common scopes एक constant में रख लो; कभी‑भी import करके इस्तेमाल कर सकते हो
 */
export const CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
];
