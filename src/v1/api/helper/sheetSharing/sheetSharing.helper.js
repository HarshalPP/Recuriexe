const { returnFormatter } = require("../../formatter/common.formatter");
const sheetShareDetail = require("../../model/sheetSharing/sheet.model");

async function createSheetShare(data) {
  try {
    const newSheetShare = await sheetShareDetail.create(data);
    return returnFormatter(
      true,
      "Sheet share created successfully",
      newSheetShare
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}


async function getAllSheetShares() {
  try {
    const sheetShares = await sheetShareDetail
      .find()
      .populate("creator")
      .populate("sharedWith.user");
    return returnFormatter(
      true,
      "All sheet shares retrieved successfully",
      sheetShares
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getSheetShareById(shareId) {
  try {
    const sheetShare = await sheetShareDetail
      .findById(shareId)
      .populate("creator")
      .populate("sharedWith.user");

    if (!sheetShare) {
      return returnFormatter(false, "Sheet share not found");
    }
    return returnFormatter(true, "Sheet share found", sheetShare);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getSheetShareOfUser(userId) {
  try {
    const personalSheet = await sheetShareDetail
      .find({creator:userId})
      .populate({path:"creator",select:"_id employeName"})
      .populate({path:"sharedWith.user",select:"_id employeName"});
  
    return returnFormatter(true, "Sheet share found",personalSheet);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function getSharedSheetWithUser(userId) {
  try {
      const shareSheet = await sheetShareDetail
      .find({ "sharedWith.user": userId }) 
      .populate({path:"creator",select:"_id employeName"})
      .populate({path:"sharedWith.user", select:"_id employeName"})

  
    return returnFormatter(true, "Sheet share found", shareSheet);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function updateSheetShareById(shareId, data) {
  try {
    const updatedSheetShare = await sheetShareDetail
      .findByIdAndUpdate(shareId, data, { new: true })
      .populate("creator")
      .populate("sharedWith.user");

    if (!updatedSheetShare) {
      return returnFormatter(false, "Sheet share not found for update");
    }
    return returnFormatter(
      true,
      "Sheet share updated successfully",
      updatedSheetShare
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

async function deleteSheetShareById(shareId) {
  try {
    const deletedSheetShare = await sheetShareDetail.findByIdAndDelete(shareId);
    if (!deletedSheetShare) {
      return returnFormatter(false, "Sheet share not found for deletion");
    }
    return returnFormatter(
      true,
      "Sheet share deleted successfully",
      deletedSheetShare
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// Export the CRUD methods (and returnFormatter if needed)
module.exports = {
  createSheetShare,
  getAllSheetShares,
  getSheetShareById,
  updateSheetShareById,
  deleteSheetShareById,
  getSheetShareOfUser,
  getSharedSheetWithUser
};
