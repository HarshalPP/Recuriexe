import VerificationDocument from "../models/verificationModel/document.model.js"

export const createVerificationDocument = async ({ name, label, company }) => {
  if (!name || !label) throw new Error("Name and label are required");

  const existing = await VerificationDocument.findOne({ name });
  if (existing) throw new Error(" name already exists");

  const doc = await VerificationDocument.create({ name, label });
  return doc;
};

export const getVerificationDocuments = async () => {
  return await VerificationDocument.find({status:"true"});
};

export const deleteVerificationDocument = async ({ id, company }) => {
  const doc = await VerificationDocument.findOneAndDelete({ _id: id });
  if (!doc) throw new Error("Document not found");
  return doc;
};

export const updateVerificationDocument = async ({ id, name, label , status }) => {
  const doc = await VerificationDocument.findOneAndUpdate(
    { _id: id },
    { name, label , status },
    { new: true }
  );

  if (!doc) throw new Error("Document not found");
  return doc;
};
