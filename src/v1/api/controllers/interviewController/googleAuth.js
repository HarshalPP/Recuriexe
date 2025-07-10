import { google } from 'googleapis';
import { getOAuth2Client } from './googleClient.js';
import {
    success,
    badRequest,
    notFound,
    unknownError,
} from "../../formatters/globalResponse.js";
const GOOGLE_REDIRECT = 'https://finexe.fincooper.in/callback'
// import hrCredential from '../../models/InterviewDetailsModel/hrCredential.model.js';
const usedCodes = new Set();



export const createAuthURLByEmail = async (req, res) => {
    try {
        const { hrEmail ,redirectURL } = req.query;
        if (!hrEmail) {
            return badRequest(res, "HR Email Is Required.");
        }

        // if (!redirectURL) {
        //     return badRequest(res, "Redirect URL Is Required.");
        // }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(hrEmail)) {
            return badRequest(res, "Invalid e‑mail format.");
        }

        const oauth2 = getOAuth2Client(redirectURL);

        const authUrl = oauth2.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events",
            ],
            state: JSON.stringify({ hrEmail }),
        });

        return success(res, "OAuth URL generated.", { authUrl });

    } catch (error) {
        console.log('error', error)
        return unknownError(res, error);
    }
};




export const oauth2callback = async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code) return badRequest(res, 'Missing "code" param');
        if (!state) return badRequest(res, 'Missing "state" param');

        if (usedCodes.has(code)) {
            return badRequest(res, 'OAuth code already used');
        }
        const { hrEmail } = JSON.parse(state);
        if (!hrEmail) return badRequest(res, '"hrEmail" absent in state');


        const oauth2 = getOAuth2Client();

        const { tokens } = await oauth2.getToken({
            code,
            redirect_uri: GOOGLE_REDIRECT,
        });
        const { access_token, refresh_token, expiry_date } = tokens || {};
        if (!access_token) return unknownError(res, 'No access_token returned by Google');

        await hrCredential.findOneAndUpdate(
            { hrEmail },
            {
                hrEmail,
                accessToken: access_token,
                ...(refresh_token && { refreshToken: refresh_token }),
                expiryDate: expiry_date,
            },
            { upsert: true }
        );

        usedCodes.add(code);
        setTimeout(() => usedCodes.delete(code), 600_000);
        return success(res, `${hrEmail} Generated Credential`, { authUrl });
        // return res.redirect('https://finexe.fincooper.in/google-integration-success');
    } catch (err) {
        console.error('[oauth2callback] unexpected error:', err);
        return unknownError(res, 'Internal server error', err);
    }
};

