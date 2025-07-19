const mongoose = require("mongoose");
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const mailSwitchesSchema = new Schema({
  finexeVersion : { type: String, enum :["STAGE","PROD"], default: "STAGE" },
  masterMailStatus: { type: Boolean, default: false },
  // login mail 
  loginMail: { type: Boolean, default: false },
  todayLoginCompleteMail: { type: Boolean, default: false },
  //cibil mail 
  cibilMail: { type: Boolean, default: false },
  cibilSubmitTimeMailSend: { type: Boolean, default: false },
  todayCibilQueryMail: { type: Boolean, default: false },
  checkCibilPendingFileMailSendMorning: { type: Boolean, default: false },
  checkCibilPendingFileMailSendAfternoon: { type: Boolean, default: false },
  // pd mail 
  pdMail: { type: Boolean, default: false },
  pdNotCompleteFilesMailFunctionMorning: { type: Boolean, default: false },
  pdNotCompleteFilesMailFunctionAfternoon: { type: Boolean, default: false },
  pdNotCompleteFilesMailFunctionEvening: { type: Boolean, default: false },
  mailSendCustomerPdDone: { type: Boolean, default: false },
  totalPdPendingMailMorning:{ type: Boolean, default: false },  //add 07/05 date
  // vendor mail
  vendorMail: { type: Boolean, default: false },
  rcuAssignMail: { type: Boolean, default: false },
  legalAssignMail: { type: Boolean, default: false },
  legalFiAssignMail: { type: Boolean, default: false },
  technicalAssignMail: { type: Boolean, default: false },
  rmTaggingAssignMail: { type: Boolean, default: false },
  vendorApproveForLoginMail: { type: Boolean, default: false },
  sendPendingVendorEmailsAfternoon: { type: Boolean, default: false },
  sendPendingVendorEmailsEvening: { type: Boolean, default: false },
  mailSendVendorLoginCredentials: { type: Boolean, default: false },

  // new file management mail
  newFileManagementMail: { type: Boolean, default: false },
  sanctionSubmissionMail: { type: Boolean, default: false },

  // collection Mail
  collectionMail: { type: Boolean, default: false },
  collectionVisitMailMorning: { type: Boolean, default: false },
  collectionVisitMailAfterNoon: { type: Boolean, default: false },
  collectionVisitMailEvening: { type: Boolean, default: false },
  collectionTargetIncompleteMailMorning: { type: Boolean, default: false },
  collectionTargetIncompleteMailAfterNoon: { type: Boolean, default: false },
  collectionTargetIncompleteMailEvening: { type: Boolean, default: false },
  collectionZeroVisitEmiWarningsMailMorning: { type: Boolean, default: false },
  collectionZeroVisitEmiWarningsMailAfterNoon: { type: Boolean, default: false },
  collectionZeroVisitEmiWarningsMailEvening: { type: Boolean, default: false },
  collectionRevisitRemindersMailMorning: { type: Boolean, default: false },
  collectionRevisitRemindersMailAfterNoon: { type: Boolean, default: false },
  collectionRevisitRemindersMailEvening: { type: Boolean, default: false },
  collectionZeroVisitEmiWarningsMailEvening: { type: Boolean, default: false },
  collectionPatnerWiseMailMorning: { type: Boolean, default: false },
  collectionPatnerWiseMailAfterNoon: { type: Boolean, default: false },
  collectionPatnerWiseMailEvening: { type: Boolean, default: false },

  hrmsMail: { type: Boolean, default: false },

  leadMail: { type: Boolean, defaoult: false },
  zeroleadEmployeeMailMorning: { type: Boolean, default: false },
  zeroleadmanagerMailMorning: { type: Boolean, default: false },
  zeroleadEmployeeMailAfternoon: { type: Boolean, default: false },
  zeroleadmanagerMailAfternoon: { type: Boolean, default: false },
  threeDaysZeroLeadMailMorning: { type: Boolean, default: false },
  loginPaymentstatueMorning :  { type: Boolean, default: false },
  dailySalesTeamPerformanceEmailsEvening : { type: Boolean, default: false },
  dailyZeroPdPerformanceEmailsEvening : { type: Boolean, default: false },
  howManyPdCompleteAndRejectEvening : { type: Boolean, default: false },
  howManyPdFileCompleteTodayMorning : { type: Boolean, default: false },
  
}, {
  timestamps: false
});

const mailSwitchesModel = mongoose.model("mailSwitche", mailSwitchesSchema);

module.exports = mailSwitchesModel;
