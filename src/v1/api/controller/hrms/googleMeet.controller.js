const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
// const { JWT } = google.auth;
// const serviceAccountKeyFile = require("../../../../../hrms.json");
// const path = require("path");
// const serviceAccountKeyFilePath = path.resolve(__dirname, "../../../../../hrms.json");

// // Initialize JWT client with service account key
// const jwtClient = new JWT({
//   keyFile: serviceAccountKeyFilePath,
//   scopes: ["https://www.googleapis.com/auth/calendar"],
//   subject: "admin@fincoopers.com", // Admin account for domain-wide delegation
// });
// async function createGoogleMeetLink(
//   date,
//   time,
//   candidateEmail,
//   candidateName,
//   jobTitle,
//   companyName,
//   interviewerName,
//   hostEmail // Specify which user to impersonate for creating this event
// ) {
//   try {
//     // Impersonate the host
//     jwtClient.subject = hostEmail;
// // console.log(hostEmail)
//     const calendar = google.calendar({ version: "v3", auth: jwtClient });

//     const eventStartTime = new Date(date + "T" + time);
//     const eventEndTime = new Date(eventStartTime);
//     eventEndTime.setMinutes(eventStartTime.getMinutes() + 60); // 60 minute interview

//     const event = {
//       summary: `${jobTitle} Interview of ${candidateName}`,
//       location: "Google Meet",
//       description: `Conduct Interview of ${candidateName} for the ${jobTitle} position at ${companyName}.`,
//       start: {
//         dateTime: eventStartTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       end: {
//         dateTime: eventEndTime.toISOString(),
//         timeZone: "Asia/Kolkata",
//       },
//       attendees: [{ email: candidateEmail }],
//       conferenceData: {
//         createRequest: {
//           requestId: "some-random-string",
//           conferenceSolutionKey: {
//             type: "hangoutsMeet",
//           },
//         },
//       },
//     };
// // console.log(event)
//     const eventResponse = await calendar.events.insert({
//       calendarId: "primary", // Use impersonated user's calendar
//       resource: event,
//       conferenceDataVersion: 1,
//     });
//     console.log(eventResponse.data.hangoutLink)

//     return eventResponse.data.hangoutLink;
//   } catch (error) {
//     console.error("Error creating Google Meet link:", error.message); // Detailed error message
//     console.error("Full error details:", error); // Full error for troubleshooting
//     throw new Error("Failed to create Google Meet link");
//   }
// }

// module.exports = {
//   createGoogleMeetLink,
// };


//-----------------------------------------------------------------------------------------------------------------------
// Set Up for  Google OAuth2.0 Client
const oAuth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
// Load tokens from environment variables or secure storage
async function loadTokens() {
  const tokens = {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    expiry_date: parseInt(process.env.EXPIRY_DATE, 10), // Ensure it's a number
  };
// console.log(process.env.REFRESH_TOKEN)
  oAuth2Client.setCredentials(tokens);
  return tokens;
}

// Save tokens securely (implement this based on your setup)
async function saveTokens(tokens) {
  // Save tokens to environment variables, database, or secure storage
  process.env.ACCESS_TOKEN = tokens.access_token;
  process.env.REFRESH_TOKEN = tokens.refresh_token;
  process.env.EXPIRY_DATE = tokens.expiry_date.toString();
  // console.log("new",process.env.REFRESH_TOKEN);
}

// Refresh tokens if expired
async function refreshAccessTokenIfNeeded() {
  const tokens = await loadTokens();
  console.log("Checking token expiration...");
  
  // if (new Date().getTime() >= tokens.expiry_date|| true) {

  if (new Date().getTime() >= tokens.expiry_date) {
    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      console.log("Tokens refreshed successfully");
      // console.log("credentials",credentials);
      oAuth2Client.setCredentials(credentials);
      await saveTokens(credentials); // Save updated tokens
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Failed to refresh access token");
    }
  }
}

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

//Create Google Meet Link Function
async function createGoogleMeetLink(
  date,
  time,
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  interviewerName
) {
  try {
    await refreshAccessTokenIfNeeded();
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
    // const res = await calendar.calendarList.list();
    // const calendars = res.data.items;
    // console.log(calendars);fincoopers8@gmail.com
    const eventStartTime = new Date(date + "T" + time);
    const eventEndTime = new Date(eventStartTime);
    eventEndTime.setMinutes(eventStartTime.getMinutes() + 60); // 60 minute interview

    const event = {
      summary: `${jobTitle} Interview of ${candidateName}`,
      location: "Google Meet",
      description: `Conduct Interview of ${candidateName} for the ${jobTitle} position at ${companyName}.`,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: "Asia/Kolkata",
      },
      attendees: [{ email: candidateEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 }, // Email reminder 1 hour before
          { method: "popup", minutes: 15 }, // Popup reminder 15 minutes before
        ],
      },
      conferenceData: {
        createRequest: {
          requestId: "some-random-string",
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const eventResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });
    // console.log(eventResponse);
    return eventResponse.data.hangoutLink;
  } catch (error) {
    console.error(`Error creating Google Meet link: ${error}`);
    throw new Error("Failed to create Google Meet link");
  }
}

// // Generate the Authorization URL:

// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: "offline", // Ensures you get a refresh token
//   scope: ["https://www.googleapis.com/auth/calendar"],
// });
// console.log("Authorize this app by visiting this URL:", authUrl);

// const code =
  // "4/0AeanS0bCHoyLRdrEtwYG-Dl-CTmhm3EO8LSFTDkFush0xcc_5-De6geieSK1i156xdHEGg&"; // Replace with your actual code
// const code =
//   "4/0AQlEd8xl_FrbVckob2LNiAHbS3LCGaOwMAfr07rHGxCvlVJ__K5S5QCmTKfm0BkmRBIc4w&";

// //Get the Refresh Token
// async function getTokens() {
//   const { tokens } = await oAuth2Client.getToken(code);
//   console.log("Access Token:", tokens.access_token);
//   console.log("Refresh Token:", tokens.refresh_token);
//   console.log("Expiry Date:", tokens.expiry_date);
// }

// getTokens();

//
// async function checkMeetLink(auth, calendarId, eventId) {
//   const calendar = google.calendar({ version: "v3", auth });

//   const event = await calendar.events.get({
//     calendarId: calendarId,
//     eventId: eventId,
//   });

//   if (event.data.hangoutLink) {
//     console.log("Google Meet Link:", event.data.hangoutLink);
//     // Further verification logic can be added here.
//     return event.data.hangoutLink;
//   } else {
//     console.log("No Google Meet link found for this event.");
//   }
// }

// Replace with your auth credentials, calendar ID, and event ID
// checkMeetLink(auth, "fincoopers8@gmail.com", "eventId");

module.exports = {
  createGoogleMeetLink,
};
