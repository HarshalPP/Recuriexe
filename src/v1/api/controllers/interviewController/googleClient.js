import { google } from 'googleapis';
import dotenv from 'dotenv';

const CLIENT_ID = "872671367575-jg9vohru7bc7cj22iitp617iascb9pjn.apps.googleusercontent.com"
const CLIENT_SECRET = "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"
const REDIRECT_URI = 'https://finexe.fincooper.in/callback'

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
