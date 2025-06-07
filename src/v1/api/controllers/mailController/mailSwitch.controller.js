import { addOrUpdateMailSwitch, fetchMailSwitch  } from '../../helper/mail/mailSwitch.helper.js';
import { created, success ,  badRequest, unknownError  } from '../../formatters/globalResponse.js';
import admin from '../../services/notification/firebaseNotification.js';


// ------------------------------------ save mail switch ------------------------------------//

export async function saveMailSwitch(req, res) {
    try {
        const { status, message, data } = await addOrUpdateMailSwitch(req);
        return status ? created(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

//------------------------------------ get mail switch ------------------------------------//
export async function getMailSwitch(req, res) {
    try {
        const { status, message, data } = await fetchMailSwitch(req);
        return status ? success(res, message, data) : badRequest(res, message);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


// ------------------------------------ notification get ------------------------------------//

// export async function notificationGet(req, res) {
//     try {
//         const { status, message, data } = await fetchNotification(req);
//         return status ? success(res, message, data) : badRequest(res, message);
//     } catch (error) {
//         return unknownError(res, error.message);
//     }
// }


export async function notificationGet(req ,res) {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title,
      body,
    },
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Error sending FCM:", error);
    res.status(500).json({ success: false, error });
  }
};
