// routes/googleAuth.js
import { google } from 'googleapis';
import { getOAuth2Client } from './googleClient.js';
import {
    success,
    badRequest,
    notFound,
    unknownError,
} from "../../formatters/globalResponse.js";

export const createAauthURLByEmail = async (req, res) => {
    const { hrEmail } = req.query;              // hr@xyz.com
    const oauth2 = getOAuth2Client();
    if (!hrEmail) {
        return badRequest(res, "HR Email Is Required")
    }
    const url = oauth2.generateAuthUrl({
        access_type: 'offline',        // refresh_token pane ke liye
        prompt: 'consent',             // refresh_token har org ko first time mile
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ],
        // state me jo chahe pass karo (orgId, hrId etc.)
        state: JSON.stringify({ hrEmail }),
    });                                    //  <--   :contentReference[oaicite:0]{index=0}

    res.json({ authUrl: url });
}

const GOOGLE_REDIRECT = 'https://finexe.fincooper.in/callback'

import HrCred from '../../models/InterviewDetailsModel/hrCredential.model.js';


// 1. फ़ाइल के टॉप पर (module‑scope) डुप्लिकेट‑code guard
const usedCodes = new Set();          // memory‑only; Prod में Redis लगाइये

export const oauth2callback = async (req, res) => {
    try {
        /* 1️⃣  Basic validation */
        const { code, state } = req.query;
        if (!code) return badRequest(res, 'Missing "code" param');
        if (!state) return badRequest(res, 'Missing "state" param');

        /* 1‑A: same code दो‑बार तो नहीं?  (browser refresh / double‑click) */
        if (usedCodes.has(code)) {
            return badRequest(res, 'OAuth code already used');   // ⬅️ यही पहले crash कर रहा था
        }
        console.log('0')
        const { hrEmail } = JSON.parse(state);
        if (!hrEmail) return badRequest(res, '"hrEmail" absent in state');

        /* 2️⃣  Exchange code → tokens */
        console.log('1')
        console.log("Code:", code);
        console.log("Redirect URI:", getOAuth2Client.redirectUri);

        const oauth2 = getOAuth2Client();   // uses process.env.GOOGLE_REDIRECT
        console.log('2')
        /* 2‑A: redirect_uri को explicit pass करो ⇒ byte‑for‑byte match */

        const { tokens } = await oauth2.getToken({
            code,
            redirect_uri: GOOGLE_REDIRECT,           // ⬅️ hard‑match
        });
        console.log('3')
        const { access_token, refresh_token, expiry_date } = tokens || {};
        if (!access_token) return unknownError(res, 'No access_token returned by Google');

        /* 3️⃣  Upsert DB */
        console.log('4')
        await HrCred.findOneAndUpdate(
            { hrEmail },
            {
                hrEmail,
                accessToken: access_token,
                ...(refresh_token && { refreshToken: refresh_token }),
                expiryDate: expiry_date,
            },
            { upsert: true }
        );

        console.log('5')
        /* 3‑A: mark code as used (10‑min TTL) */
        usedCodes.add(code);
        setTimeout(() => usedCodes.delete(code), 600_000);

        console.log('6')
        /* 4️⃣  Redirect success page */
      return res.redirect('https://finexe.fincooper.in/google-integration-success');
    } catch (err) {
        console.error('[oauth2callback] unexpected error:', err);
        return unknownError(res, 'Internal server error');
    }
};

