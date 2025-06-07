import mailSwitchModel from '../../models/mailModel/mailSwitch.model.js';
import { formatMailSwitchData } from '../../formatters/mail.formatter.js';
import { returnFormatter } from '../../formatters/common.formatter.js';
// import admin from '../services/notification/firebaseNotification.js';
import mongoose from 'mongoose';

//------------------------------------ save mail switch ------------------------------------//

export async function addOrUpdateMailSwitch(req) {
    try {
        const organizationId = req.employee.organizationId
        const formattedData = formatMailSwitchData(req , organizationId);
  let existing = await mailSwitchModel.findOne({organizationId: new mongoose.Types.ObjectId(organizationId)});

if (existing) {
    const updated = {
        ...existing._doc,
        ...formattedData,
        hrmsMail: {
            ...existing.hrmsMail,
            ...formattedData.hrmsMail
        }
    };

    await mailSwitchModel.updateOne({ _id: existing._id }, { $set: updated });
    return returnFormatter(true, "Mail switch updated", updated);
} else {
    const created = await mailSwitchModel.create(formattedData);
    return returnFormatter(true, "Mail switch created", created);
}

    } catch (error) {
        return returnFormatter(false, error.message);
    }
}

//------------------------------------ get mail switch ------------------------------------//
export async function fetchMailSwitch(req) {
    try {
        const organizationId = req.employee.organizationId
        const data = await mailSwitchModel.findOne({organizationId: new mongoose.Types.ObjectId(organizationId)}).lean();
        if (!data) {
            return returnFormatter(false, "Mail switch data not found");
        }
        return returnFormatter(true, "Mail switch data fetched", data);
    } catch (error) {
        return returnFormatter(false, error.message);
    }
}
 

//------------------------------------ notification get ------------------------------------//

// export async function fetchNotification() {
//   const { token, title, body } = req.body;

//   const message = {
//     notification: {
//       title,
//       body,
//     },
//     token,
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     res.status(200).json({ success: true, response });
//   } catch (error) {
//     console.error("Error sending FCM:", error);
//     res.status(500).json({ success: false, error });
//   }
// };
