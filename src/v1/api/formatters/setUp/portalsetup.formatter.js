import PortalModel from "../../models/PortalSetUp/portalsetup.js"

export const createPortalService = async (data) => {
  if (!data.organizationId) {
    throw new Error("Organization ID is required");
  }

  return await PortalModel.create(data);
};


export const getAllPortalsService = async () => {
  return await PortalModel.find().populate('organizationId')
};



export const getPortalByIdService = async (id) => {
  return await PortalModel.findById(id);
};

export const updatePortalService = async (id, data) => {
  return await PortalModel.findByIdAndUpdate(id, data, { new: true });
};

export const deletePortalService = async (id) => {
  return await PortalModel.findByIdAndDelete(id);
};
