import setting from "../../models/settingModel/setting.model.js"
import settingcandidate from "../../models/settingModel/candidatesetting.model.js"


// get setting //

const getsetting = async()=>{
    try {

        let settings = await setting.findOne()
        if (!settings) {
            settings = new setting(); // use default schema values
            await settings.save();
          }

          return settings;


    } catch (error) {   
        console.log(error)
        return error;
    }
}


// Update settings
const updateSettings = async (data) => {
    let settings = await setting.findOne();
    if (!settings) {
      setting = new setting(); 
    }

      // Use findByIdAndUpdate with new data and return the updated document
  const updatedSetting = await setting.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true } // Return the updated document
  );

  return updatedSetting;


  };


  // Update candidate setting //

const updatecandidatesetting = async (data) => {
  let settings = await settingcandidate.findOne();

  // If no existing settings, create a new one
  if (!settings) {
    settings = await settingcandidate.create(data);
    return settings;
  }

  // If settings exist, update them
  const updatedSetting = await settingcandidate.findByIdAndUpdate(
    settings._id,
    { $set: data },
    { new: true }
  );

  return updatedSetting;
};




  // get candidate setting //

  const candidatesetting = async()=>{
    try {

        let settings = await settingcandidate.findOne()
        if (!settings) {
            settings = new settingcandidate(); // use default schema values
            await settings.save();
          }

          return settings;


    } catch (error) {   
        console.log(error)
        return error;
    }

  }



  export default {
    getsetting,
    updateSettings,
    candidatesetting,
    updatecandidatesetting
  };