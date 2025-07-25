import axios from "axios";
import querystring from "querystring";
import crypto from "crypto";

const CLIENT_ID = process.env.INDEED_CLIENT_ID;
const CLIENT_SECRET = process.env.INDEED_CLIENT_SECRET;
const REDIRECT_URI = process.env.INDEED_REDIRECT_URI;

const AUTH_URL = "https://secure.indeed.com/oauth/v2/authorize";
const TOKEN_URL = "https://apis.indeed.com/oauth/v2/tokens";
const APPINFO_URL = "https://secure.indeed.com/v2/api/appinfo";
const GRAPHQL_URL = "https://apis.indeed.com/graphql";

async function getAppAccessToken() {
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: "employer_access",
  });

  try {
    const { data } = await axios.post(TOKEN_URL, form.toString(), {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("✅ App access token acquired");
    return data.access_token;
  } catch (err) {
    console.error(
      "❌ getAppAccessToken error:",
      err.response?.data || err.message
    );
    throw new Error("Unable to fetch app access token");
  }
}

// Generate a random code_verifier
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

// Generate a code_challenge from a verifier using SHA-256
function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return Buffer.from(hash).toString("base64url");
}

// Build the Indeed authorization URL
function generateAuthUrl(state, code_challenge) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "employer_access offline_access",
    prompt: "select_employer",
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  return `${AUTH_URL}?${params.toString()}`;
}

// Pass `req` as an argument to exchangeCodeForToken
async function exchangeCodeForToken(req, code, code_verifier) {
  const data = {
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code_verifier,
  };

  try {
    const res = await axios.post(TOKEN_URL, querystring.stringify(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: req.headers.cookie || "",
      },
    });
    console.log("✅ Code-for-token exchange successful");
    return res.data;
  } catch (err) {
    console.error(
      "❌ Token Exchange Error:",
      err.response?.data || err.message
    );
    throw new Error("Failed to exchange code for token");
  }
}

async function fetchEmployerList(accessToken) {
  // if no token passed, get the app‐level one automatically
  const token = accessToken || (await getAppAccessToken());

  try {
    const response = await axios.get(APPINFO_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const employers = response.data.employers || [];
    console.log(`✅ Retrieved ${employers.length} employer(s)`);
    return employers;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error("❌ Failed to fetch employers:", errorData);
    throw new Error(`Error fetching employers: ${errorData}`);
  }
}

async function exchangeEmployerToken(refresh_token, employerId) {
  if (!employerId) throw new Error("Missing employer ID");

  const data = {
    grant_type: "refresh_token",
    refresh_token,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    employer: employerId,
  };

  try {
    const response = await axios.post(TOKEN_URL, querystring.stringify(data), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    console.log("✅ Employer-specific token acquired.");
    return response.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error("❌ Employer Token Exchange Error:", errorData);
    throw new Error("Failed to exchange employer token");
  }
}
// CREATE JOB POSTING
async function createJob(accessToken, jobInput) {
  const mutation = {
    query: `
      mutation($input: CreateSourcedJobPostingsInput!) {
        jobsIngest {
          createSourcedJobPostings(input: $input) {
            jobPosting {
              employerJobId
              sourcedPostingId
              jobPostingId
              title
              description
              company {
                name
              }
              location {
                city
                state
                country
              }
              status
              datePublished
              validThrough
            }
            errors {
              message
              code
              field
            }
          }
        }
      }
    `,
    variables: {
      input: {
        postings: [jobInput]
      }
    },
  };
  
  try {
    const response = await axios.post(GRAPHQL_URL, mutation, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = response.data.data?.jobsIngest?.createSourcedJobPostings;
    if (result?.errors && result.errors.length > 0) {
      console.error("❌ Job creation errors:", result.errors);
      throw new Error(`Job creation failed: ${result.errors[0].message}`);
    }

    console.log("✅ Job created successfully");
    return result;
  } catch (err) {
    console.error("❌ Create job error:", err.response?.data || err.message);
    throw new Error(`Failed to create job: ${err.response?.data?.errors?.[0]?.message || err.message}`);
  }
}
// UTILITY FUNCTION TO FORMAT JOB DATA FOR INDEED
function formatJobForIndeed(jobData) {
  return {
    employerJobId: jobData.employerJobId || jobData.id,
    sourceName: jobData.sourceName || "your-ats-name",
    title: jobData.title,
    description: jobData.description,
    company: {
      name: jobData.company?.name || jobData.companyName
    },
    location: {
      city: jobData.location?.city || jobData.city,
      state: jobData.location?.state || jobData.state,
      country: jobData.location?.country || jobData.country || "US"
    },
    datePublished: jobData.datePublished || new Date().toISOString(),
    validThrough: jobData.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    jobType: jobData.jobType || "FULL_TIME",
    ...(jobData.salary && {
      salary: {
        min: jobData.salary.min,
        max: jobData.salary.max,
        currency: jobData.salary.currency || "USD",
        period: jobData.salary.period || "YEAR"
      }
    }),
    ...(jobData.benefits && { benefits: jobData.benefits }),
    ...(jobData.qualifications && { qualifications: jobData.qualifications }),
    ...(jobData.requirements && { requirements: jobData.requirements }),
    ...(jobData.responsibilities && { responsibilities: jobData.responsibilities }),
    ...(jobData.applyUrl && {
      howToApply: {
        applyUrl: jobData.applyUrl
      }
    })
  };
}

export {
  generateCodeVerifier,
  formatJobForIndeed,
  generateCodeChallenge,
  generateAuthUrl,
  exchangeCodeForToken,
  fetchEmployerList,
  exchangeEmployerToken,
  createJob
};

