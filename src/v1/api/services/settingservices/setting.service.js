import setting from "../../models/settingModel/setting.model.js"
import settingcandidate from "../../models/settingModel/candidatesetting.model.js"
import Postsettingcandidate from "../../models/settingModel/jobPostsetting.model.js"
import Clientsetting from "../../models/settingModel/clientsetting.model.js"


// get setting //

const getsetting = async (organizationId) => {
  try {
    let settings = await setting.findOne({ organizationId });

    if (!settings) {
      settings = await setting.create({ organizationId }); // Use default values
    }

    return settings;
  } catch (error) {
    console.error("Error in getsetting:", error);
    return error;
  }
};

// Update settings
// UPDATE organization-specific settings
const updateSettings = async (data, organizationId) => {
  let settings = await setting.findOne({ organizationId });

  if (!settings) {
    // If settings not found, create them using provided data
    settings = await setting.create({ ...data, organizationId });
    return settings;
  }

  // Update existing settings
  const updatedSetting = await setting.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true }
  );

  return updatedSetting;
};


  // Update candidate setting //

// Update candidate setting
const updatecandidatesetting = async (data, organizationId) => {
  let settings = await settingcandidate.findOne({ organizationId });

  // If not found, create new settings with organizationId
  if (!settings) {
    settings = await settingcandidate.create({ ...data, organizationId });
    return settings;
  }

  // Update and return the updated document
  const updatedSetting = await settingcandidate.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true }
  );

  return updatedSetting;
};

// Get candidate setting
const candidatesetting = async (organizationId) => {
  try {
    let settings = await settingcandidate.findOne({ organizationId });

    if (!settings) {
      settings = await settingcandidate.create({ organizationId }); // default values
    }

    return settings;
  } catch (error) {
    console.error("Error fetching candidate setting:", error);
    return error;
  }
};


  // Job candidate //

// Update job post settings
const updateJobPostSetting = async (data, organizationId) => {
  let settings = await Postsettingcandidate.findOne({ organizationId });

  if (!settings) {
    // Ensure organizationId is added during creation
    settings = await Postsettingcandidate.create({ ...data, organizationId });
    return settings;
  }

  const updatedSetting = await Postsettingcandidate.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true }
  );

  return updatedSetting;
};

// Get job post settings
const getJobPostSetting = async (organizationId) => {
  try {
    let settings = await Postsettingcandidate.findOne({ organizationId });

    if (!settings) {
      settings = await Postsettingcandidate.create({ organizationId }); // Use defaults from schema
    }

    return settings;
  } catch (error) {
    console.error("Error in getJobPostSetting:", error);
    throw error;
  }
};




  // Job candidate //

// Update job post settings
const updateClientSetting = async (data, organizationId) => {
  let settings = await Clientsetting.findOne({ organizationId });

  if (!settings) {
    // Ensure organizationId is added during creation
    settings = await Clientsetting.create({ ...data, organizationId });
    return settings;
  }

  const updatedSetting = await Clientsetting.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true }
  );

  return updatedSetting;
};

// Get job post settings
const getClientSetting = async (organizationId) => {
  try {
    let settings = await Clientsetting.findOne({ organizationId });

    if (!settings) {
      settings = await Clientsetting.create({ organizationId }); // Use defaults from schema
    }

    return settings;
  } catch (error) {
    console.error("Error in getJobPostSetting:", error);
    throw error;
  }
};





  export default {
    getsetting,
    updateSettings,
    candidatesetting,
    updatecandidatesetting,
    updateJobPostSetting,
    getJobPostSetting,
    updateClientSetting,
    getClientSetting
  };