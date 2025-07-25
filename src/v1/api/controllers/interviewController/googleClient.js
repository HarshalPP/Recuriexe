import { google } from 'googleapis';
import dotenv from 'dotenv';

const CLIENT_ID = process.env.CLIENT_ID 
const CLIENT_SECRET = process.env.CLIENT_SECRET 
const REDIRECT_URI =  process.env.REDIRECT_URI 

dotenv.config();
if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
        'Missing Google OAuth env vars: set CLIENT_ID, CLIENT_SECRET'
    );
}
export const getOAuth2Client = (redirectURL) => {
    const oauth2 = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        redirectURL?redirectURL:REDIRECT_URI
    );
    oauth2.isTokenExpiring = () => {
        const { expiry_date } = oauth2.credentials;
        if (!expiry_date) return true;
        const FIVE_MIN = 5 * 60 * 1000;
        return Date.now() + FIVE_MIN >= expiry_date;
    };

    return oauth2;
};

export const CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
];
