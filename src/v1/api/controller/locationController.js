const locationHelper = require('../helper/locationHelper.js');
const { badRequest, parseJwt, success, unknownError, unauthorized } = require("../../../../globalHelper/response.globalHelper");


// Handle WebSocket Location Updates
exports.handleLocation = async (socket, data) => {
  try {
    // Save Location Using Helper
      if (data.userId) {
        await locationHelper.saveLocation(data);
    
        // Broadcast to All Clients
        socket.broadcast.emit('receive_location', data);
      }
  } catch (err) {
    console.error('Error in handleLocation:', err);
  }
};

// Handle REST API Updates (Optional)
exports.updateLocation = async (req, res) => {
  try {
    const { userId,lat, long } = req.body;
    if (!userId || !lat || !long) {
      return res.status(400).json({ error: 'Invalid location data' });
    }

    await locationHelper.saveLocation(req.body);
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTodayLocationHistoryByUserId = async (req,res) =>{
  try {
    const { userId } = req.params;
    if (!userId) {
      return badRequest (res,'Invalid location data' );
    }

    let locationHistory =  await locationHelper.todayLocationHistory(userId);
    return success( res, 'Location updated successfully',locationHistory );
  } catch (err) {
    return badRequest( res,err );
  }
}
