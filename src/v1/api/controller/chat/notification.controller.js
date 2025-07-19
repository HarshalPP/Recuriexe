const axios = require("axios");
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

async function sendPushNotification({ recipientIds = [], message, data = {} }) {
  if (!recipientIds.length) {
    console.warn("❌ No recipientIds provided.");
    return;
  }

  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: recipientIds,
        contents: { en: message },
        isChromeWeb: true,
        data,
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Notification Sent:", response.data);
  } catch (error) {
    console.error("❌ OneSignal Error:", error.response?.data || error.message);
  }
}

module.exports = { sendPushNotification };
