const locationModel = require("../model/location.log.mode");

// Simulate Saving to a Database

exports.saveLocation = async (data) => {
  try {
    // Simulate Saving Data
    // Current date and time
    const currentDate = new Date();
    // Extract Indian Date
    const indianDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // Extract Indian Time
    const indianTime = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    let saveData = {
      userId: data.userId,
      lat: data.lat,
      long: data.long,
      date: indianDate,
      time: indianTime,
    };
    await locationModel.create(saveData);
  } catch (err) {
    console.error("Error saving location:", err);
    throw err;
  }
};

exports.todayLocationHistory = async (userId) => {
  try {

    // Get Indian Date
    const indianDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const indianTime = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    console.log(indianTime);

    let locationHistory = await locationModel.find({
      userId,
      date: indianDate,
    });

    return locationHistory;
  } catch (err) {
    console.error("Error saving location:", err);
    throw err;
  }
};
