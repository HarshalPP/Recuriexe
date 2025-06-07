import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema;


const mailSwitchSchema = new mongoose.Schema({

  organizationId: { type: ObjectId, ref: "Organization", default :null },
  masterMailStatus: {
    type: Boolean,
    default: false,
  },
  hrmsMail: {
    hrmsMail: {
      type: Boolean,
      default: false,
    },
    jobApplyMail: {
      type: Boolean,
      default: false,
    },
    interviewSchedule: {
      type: Boolean,
      default: false,
    },
    reInterviewSchedule: {
      type: Boolean,
      default: false,
    },
    leaveMailToEmployee: {
      type: Boolean,
      default: false,
    },
    leaveMailToManager: {
      type: Boolean,
      default: false,
    },
    leaveApprovelMail: {
      type: Boolean,
      default: false,
    },
    sendPreOfferMail: {
      type: Boolean,
      default: false,
    },
    sendPreOfferLetterMail: {
      type: Boolean,
      default: false,
    },
    sendPreOfferLetterFinexe: {
      type: Boolean,
      default: false,
    },
  },
},
{
  timestamps: true
}
);

const mailSwitchModel = model('mailSwitch', mailSwitchSchema);

export default mailSwitchModel;
