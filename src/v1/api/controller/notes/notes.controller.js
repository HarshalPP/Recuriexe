const {
    success,
    unknownError,
    serverValidation,
    badRequest,
    notFound,
  } = require("../../../../../globalHelper/response.globalHelper");
  
  const { validationResult } = require("express-validator");
  const mongoose = require("mongoose");
  const ObjectId = mongoose.Types.ObjectId;
  const employeModel = require("../../model/adminMaster/employe.model")
  const boardModel = require("../../model/notes/board.model");
  const subBoardModel = require("../../model/notes/subBoard.model");
  const notesModel = require("../../model/notes/notes.model");

 // ------------------board Add---------------------------------------
  async function boardAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const { title} = req.body;

      // Assuming you have user ID from token
      const tokenId = new ObjectId(req.Id) 
  
      const boardDetail = await boardModel.create({
        title,
        createdBy: tokenId,
      });
  
      success(res, "Note Board Added Successfully", boardDetail);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
  } 

//  ------------------Share Board With Access-------------------------
async function shareBoard(req, res) {
  try {
    const { boardId, sharedWith } = req.body;

    // Validate input
    const formattedShares = sharedWith.map((user) => {
      if (!user.employeeId || !["view", "edit"].includes(user.access)) {
        throw new Error("Each sharedWith entry must include employeeId and valid access ('view' or 'edit')");
      }
      return {
        employeeId: new ObjectId(user.employeeId),
        access: user.access,
      };
    });

    // Fetch the board
    const board = await boardModel.findById(boardId);
    if (!board) return notFound(res, "BoardId not found");

    // Create a map of existing shares for fast lookup
    const existingMap = new Map();
    board.sharedWith.forEach((entry) => {
      existingMap.set(entry.employeeId.toString(), entry);
    });

    // Update existing entries or add new ones
    for (const newEntry of formattedShares) {
      const empIdStr = newEntry.employeeId.toString();
      const existing = existingMap.get(empIdStr);

      if (existing) {
        // Update access if different
        if (existing.access !== newEntry.access) {
          existing.access = newEntry.access;
        }
      } else {
        board.sharedWith.push(newEntry); // Insert new entry
      }
    }

    await board.save();

    success(res, "Board shared successfully", board);
  } catch (error) {
    console.error("Error sharing board:", error);
    unknownError(res, error);
  }
}

// ----------- GET /api/board/shared-with/:boardId
async function getBoardSharedEmployees(req, res) {
  try {
    const { boardId } = req.query;

    const board = await boardModel.findById(boardId).populate({
      path: 'sharedWith.employeeId',
      select: '_id employeName employeUniqueId employeePhoto workEmail', // Adjust if your field is named differently
      model: 'employee', // Use actual model name if different
    });

    if (!board) return notFound(res, 'Board not found');

    const sharedList = board.sharedWith.map((item) => ({
      _id: item.employeeId?._id || '',
      employeName: item.employeeId?.employeName || '',
      employeUniqueId: item.employeeId?.employeUniqueId || '',
      employeePhoto: item.employeeId?.employeePhoto || '',
      workEmail: item.employeeId?.workEmail || '',
      access: item.access,
    }));

    success(res, 'Shared employee list fetched successfully', sharedList);
  } catch (error) {
    console.error('Error fetching shared employee list:', error);
    unknownError(res, error);
  }
}

   // ------------------ Get All Board Detail By TokenId----------------------------
async function getAllBoardsByTokenId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);

    // Step 1: Get only 'active' boards created by the user
    const boards = await boardModel.find({ createdBy: tokenId, status: "active" });

    // Step 2: Attach last 3 subBoards and 5 notes per subBoard
    const boardsWithSubBoards = await Promise.all(
      boards.map(async (board) => {
        const subBoards = await subBoardModel
          .find({ boardId: board._id })
          .sort({ createdAt: -1 })
          .limit(3);

        // Attach last 5 notes to each subBoard
        const subBoardsWithNotes = await Promise.all(
          subBoards.map(async (subBoard) => {
            const notes = await notesModel
              .find({ subBoardId: subBoard._id })
              .sort({ createdAt: -1 })
              .limit(5);

            return {
              ...subBoard.toObject(),
              notes: notes || [],
            };
          })
        );

        return {
          ...board.toObject(),
          subBoards: subBoardsWithNotes || [],
        };
      })
    );

    success(res, "Get All Active Boards with SubBoards and Notes", boardsWithSubBoards);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
} 


   // ------------------Board List Add---------------------------------------
  async function subBoardAdd(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
      const { title,boardId} = req.body;
      const boardList = await subBoardModel.create({
        title,
        boardId
      });
  
      success(res, "Board List Added Successfully", boardList);
    } catch (error) {
      console.error(error);
      unknownError(res, error);
    }
  } 

  // ------------------ Get All Sub Board----------------------------
  async function getAllBoardList(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        const boardId = req.query.boardId;
        const boardList = await subBoardModel.find({boardId:boardId,status: "active" });
        success(res, "Get All BoardList Detail",boardList);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };

    // ------------------Get All BoardNotes By ListId----------------------------
  async function getAllBoardNotesByListId(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        const subBoardId = req.query.subBoardId;
        const boardList = await subBoardModel.findById({_id:subBoardId});
        if(!boardList){
          return notFound(res,"BoardList Id Not Found")
        }
        const boardNotesDetail = await notesModel.find({subBoardId:subBoardId,status: "active"})
        if(!boardNotesDetail){
          return badRequest(res,"No Record Found", [])
        }
        success(res, "Get All BoardNotes Detail",boardNotesDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };
  
  // ------------------Notes Add---------------------------------------
async function notesAdd(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { title, content, bgColor, subBoardId, type, reminderDate, reminderTime } = req.body;
    const tokenId = new ObjectId(req.Id);

    const noteData = {
      title,
      content,
      bgColor,
      type,
    };

    if (type === "notes") {
      noteData.createdBy = tokenId;
      noteData.subBoardId = null;
    } else if (type === "board") {
      noteData.subBoardId = subBoardId;
      noteData.createdBy = null;
    }

    // Combine reminderDate and reminderTime into reminderAt
    if (reminderDate && reminderTime) {
      const [year, month, day] = reminderDate.split("-").map(Number);

      // Handle AM/PM format (e.g., "10:30 AM" or "03:45 PM")
      const timeParts = reminderTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (!timeParts) {
        return badRequest(res, "Invalid reminderTime format. Use HH:MM AM/PM.");
      }

      let hour = parseInt(timeParts[1], 10);
      const minute = parseInt(timeParts[2], 10);
      const meridian = timeParts[3].toUpperCase();

      // Convert to 24-hour format
      if (meridian === "PM" && hour !== 12) hour += 12;
      if (meridian === "AM" && hour === 12) hour = 0;

      const reminderAt = new Date(year, month - 1, day, hour, minute);
      noteData.reminderAt = reminderAt;
    }

    const newNote = await notesModel.create(noteData);

    success(res, "Note Added Successfully", newNote);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}

  
//  ------------------Share Notes With Access-------------------------
  async function shareNotes(req, res) {
  try {
    const { notesId, sharedWith } = req.body;

    // Validate input
    const formattedShares = sharedWith.map((user) => {
      if (!user.employeeId || !["view", "edit"].includes(user.access)) {
        throw new Error("Each sharedWith entry must include employeeId and valid access ('view' or 'edit')");
      }
      return {
        employeeId: new ObjectId(user.employeeId),
        access: user.access,
      };
    });

    // Fetch the board
    const notesDetail = await notesModel.findById(notesId);
    if (!notesDetail) return notFound(res, "BoardId not found");

    // Create a map of existing shares for fast lookup
    const existingMap = new Map();
    notesDetail.sharedWith.forEach((entry) => {
      existingMap.set(entry.employeeId.toString(), entry);
    });

    // Update existing entries or add new ones
    for (const newEntry of formattedShares) {
      const empIdStr = newEntry.employeeId.toString();
      const existing = existingMap.get(empIdStr);

      if (existing) {
        // Update access if different
        if (existing.access !== newEntry.access) {
          existing.access = newEntry.access;
        }
      } else {
        notesDetail.sharedWith.push(newEntry); // Insert new entry
      }
    }

    await notesDetail.save();

    success(res, "Notes shared successfully", notesDetail);
  } catch (error) {
    console.error("Error sharing board:", error);
    unknownError(res, error);
  }
}

// ----------- GET /api/Notes/shared-with/:notesId
async function getNotesSharedEmployees(req, res) {
  try {
    const { notesId } = req.query;

    const notesSetail = await notesModel.findById(notesId).populate({
      path: 'sharedWith.employeeId',
      select: '_id employeName employeUniqueId employeePhoto workEmail', // Adjust if your field is named differently
      model: 'employee', // Use actual model name if different
    });

    if (!notesSetail) return notFound(res, 'notesId not found');

    const sharedList = notesSetail.sharedWith.map((item) => ({
      _id:item.employeeId?._id || "",
      employeName: item.employeeId?.employeName || '',
      employeUniqueId: item.employeeId?.employeUniqueId || '',
      employeePhoto: item.employeeId?.employeePhoto || '',
      workEmail: item.employeeId?.workEmail || '',
      access: item.access,
    }));

    success(res, 'Shared employee list fetched successfully', sharedList);
  } catch (error) {
    console.error('Error fetching shared employee list:', error);
    unknownError(res, error);
  }
}
  
  // ------------------Get All Notes Detail----------------------------
  async function getAllNotesByTokenId(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errorName: "serverValidation",
          errors: errors.array(),
        });
      }
        const tokenId = new ObjectId(req.Id);
        const notesDetail = await notesModel.find({createdBy:tokenId ,status: "active"});
        success(res, "Get All Notes Detail",notesDetail);
    } catch (error) {
      console.log(error);
      unknownError(res, error);
    }
  };


  // ------------------Admin Master Board Soft Delete-----------------------------------
async function boardDeleteApi(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const boardId  = req.body.boardId;

    if (!ObjectId.isValid(boardId)) {
      return badRequest(res, "Invalid Board ID");
    }

    const boardObjectId = new ObjectId(boardId);

    // 1. Update status of board
    const boardUpdate = await boardModel.findByIdAndUpdate(
      boardObjectId,
      { $set: { status: "delete" } },
      { new: true }
    );

    if (!boardUpdate) {
      return notFound(res, "Board not found");
    }

    // 2. Update status of all subBoards under this board
    const subBoardUpdate = await subBoardModel.updateMany(
      { boardId: boardObjectId },
      { $set: { status: "delete" } }
    );

    // 3. Get subBoard IDs to update their notes
    const subBoards = await subBoardModel.find(
      { boardId: boardObjectId },
      { _id: 1 }
    ).lean();

    const subBoardIds = subBoards.map(sb => sb._id);

    // 4. Update status of notes under these subBoards
    const notesUpdate = await notesModel.updateMany(
      { subBoardId: { $in: subBoardIds } },
      { $set: { status: "delete" } }
    );

    // Success response
    success(res, "Board and related subBoards and notes soft-deleted successfully", {
      board: boardUpdate,
      subBoardsModified: subBoardUpdate.modifiedCount,
      notesModified: notesUpdate.modifiedCount,
    });

  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}


// ------------------Admin Master Notes Soft Delete-----------------------------------
async function notesDeleteAPi(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { notesId } = req.body;

    if (!ObjectId.isValid(notesId)) {
      return badRequest(res, "Invalid Notes ID");
    }

    // Update status to "delete" instead of deleting
    const updatedNote = await notesModel.findByIdAndUpdate(
      notesId,
      { $set: { status: "delete" } },
      { new: true }
    );

    if (!updatedNote) {
      return notFound(res, "Notes Id Not Found");
    }

    success(res, "Note status updated to 'delete' successfully", updatedNote);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}


  // ---------------Admin Update Notes-----------------------------------------
async function updateNotes(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const { notesId, title, content, bgColor, reminderDate, reminderTime } = req.body;

    if (!notesId || notesId.trim() === "") {
      return badRequest(res, "Please Select notesId");
    }

    const existingNote = await notesModel.findById({ _id: new ObjectId(notesId) });
    if (!existingNote) {
      return badRequest(res, "notesId Not Found");
    }

    const updateData = {
      ...(title && { title }),
      ...(content && { content }),
      ...(bgColor && { bgColor }),
    };

    // Handle reminder update or removal
    if (reminderDate && reminderTime) {
      // Format: "11:00 AM"
      const [year, month, day] = reminderDate.split("-").map(Number);
      const timeParts = reminderTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

      if (!timeParts) {
        return badRequest(res, "Invalid reminderTime format. Use HH:MM AM/PM.");
      }

      let hour = parseInt(timeParts[1], 10);
      const minute = parseInt(timeParts[2], 10);
      const meridian = timeParts[3].toUpperCase();

      if (meridian === "PM" && hour !== 12) hour += 12;
      if (meridian === "AM" && hour === 12) hour = 0;

      updateData.reminderAt = new Date(year, month - 1, day, hour, minute, 0, 0);
    } 
    // else if (reminderDate === "" && reminderTime === "") 
     else if
    (
      (reminderDate === "" && reminderTime === "") ||
      (reminderDate === null && reminderTime === null)
    )
      {
      // Explicitly remove reminder
      updateData.reminderAt = null;
    }

    const updatedNote = await notesModel.findByIdAndUpdate(notesId, updateData, { new: true });
    success(res, "Note updated successfully", updatedNote);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


//--------------------Share Notes And Board With Me Get Api --------------
async function getSharedDataByType(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);
    const type = req.query.type || "all";
    let result = {};

    // Helper to populate sharedBy
    const populateSharedBy = async (note) => {
      let employee = null;

      if (note.type === "board" && note.subBoardId) {
        const subBoard = await subBoardModel.findById(note.subBoardId).lean();
        if (subBoard?.boardId) {
          const board = await boardModel.findById(subBoard.boardId).lean();
          if (board?.createdBy) {
            employee = await employeModel.findById(board.createdBy).lean();
          }
        }
      } else if (note.createdBy) {
        employee = await employeModel.findById(note.createdBy).lean();
      }

      return employee
        ? {
            _id: employee._id || "",
            employeName: employee.employeName || "",
            employeUniqueId: employee.employeUniqueId || "",
            workEmail: employee.workEmail || "",
            employeePhoto: employee.employeePhoto || "",
          }
        : {};
    };

    // Get shared notes
    if (type === "notes" || type === "all") {
  const sharedNotes = await notesModel.find({
    status: "active",
    "sharedWith.employeeId": tokenId,
  }).sort({ createdAt: -1 }).lean();

  for (let note of sharedNotes) {
    // Filter only matching sharedWith entry
    note.sharedWith = (note.sharedWith || []).filter(sw =>
      sw.employeeId?.toString() === tokenId.toString()
    );

    // Populate sharedBy
    note.sharedBy = await populateSharedBy(note);
  }

  result.sharedNotes = sharedNotes || [];
}


    // Get shared boards
    if (type === "board" || type === "all") {
  const sharedBoards = await boardModel.find({
    status: "active",
    "sharedWith.employeeId": tokenId,
  }).lean();

  const boardsWithSubBoardsAndNotes = await Promise.all(
    sharedBoards.map(async (board) => {
      // Filter only matching sharedWith entry
      board.sharedWith = (board.sharedWith || []).filter(sw =>
        sw.employeeId?.toString() === tokenId.toString()
      );

      // Add sharedBy info
      if (board.createdBy) {
        const creator = await employeModel.findById(board.createdBy).lean();
        board.sharedBy = creator
          ? {
              employeName: creator.employeName || "",
              employeUniqueId: creator.employeUniqueId || "",
              workEmail: creator.workEmail || "",
              employeePhoto: creator.employeePhoto || "",
            }
          : {};
      } else {
        board.sharedBy = {};
      }

      // Get active subBoards
      const subBoards = await subBoardModel.find({
        boardId: board._id,
        status: "active",
      }).sort({ createdAt: -1 }).lean();

      const subBoardsWithNotes = await Promise.all(
        subBoards.map(async (subBoard) => {
          // Only get notes shared with this tokenId
          const notes = await notesModel.find({
            subBoardId: subBoard._id,
            status: "active",
            "sharedWith.employeeId": tokenId,
          }).sort({ createdAt: -1 }).lean();

          for (let note of notes) {
            // Filter only matching sharedWith entry
            note.sharedWith = (note.sharedWith || []).filter(sw =>
              sw.employeeId?.toString() === tokenId.toString()
            );

            note.sharedBy = await populateSharedBy(note);
          }

          return {
            ...subBoard,
            notes: notes || [],
          };
        })
      );

      return {
        ...board,
        subBoards: subBoardsWithNotes || [],
      };
    })
  );

  result.sharedBoards = boardsWithSubBoardsAndNotes || [];
}


    success(res, "Get Shared Data Successfully", result);
  } catch (error) {
    console.error(error);
    unknownError(res, error);
  }
}

//----------------REMINDERS ADD ON NOTES----------------------------------------
async function notesUpdateReminder(req, res) {
  try {
    const { notesId, newDate, newTime } = req.body;

    if (!ObjectId.isValid(notesId)) {
      return badRequest(res, "Invalid Notes ID");
    }

    const note = await notesModel.findById(notesId);
    if (!note) return notFound(res, "Note not found");

    if (!newDate && !newTime) {
      return badRequest(res, "Please provide either newDate or newTime");
    }

    let existingReminder = note.reminderAt || new Date();
    let updatedReminder = new Date(existingReminder);

    // Update date part if provided (expects "YYYY-MM-DD")
    if (newDate) {
      const [year, month, day] = newDate.split("-").map(Number);
      updatedReminder.setFullYear(year);
      updatedReminder.setMonth(month - 1);
      updatedReminder.setDate(day);
    }

    // Update time part if provided (expects format like "10:05 AM" or "3:45 PM")
    if (newTime) {
      const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i;
      const match = newTime.match(timeRegex);

      if (!match) {
        return badRequest(res, "Invalid time format. Expected format HH:MM AM/PM");
      }

      let hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const meridian = match[3] ? match[3].toUpperCase() : null;

      if (meridian === "PM" && hour !== 12) {
        hour += 12;
      } else if (meridian === "AM" && hour === 12) {
        hour = 0;
      }

      updatedReminder.setHours(hour);
      updatedReminder.setMinutes(minute);
      updatedReminder.setSeconds(0);
      updatedReminder.setMilliseconds(0);
    }

    note.reminderAt = updatedReminder;
    await note.save();

    success(res, "Reminder updated successfully", note);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}

// ----------------GET ALL MREINDER NOTES BY TOKENID----------------------------
async function getRemindersNotesByTokenId(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errorName: "serverValidation",
        errors: errors.array(),
      });
    }

    const tokenId = new ObjectId(req.Id);

    // Find notes by createdBy = tokenId, reminderAt not null, status active (optional)
    const notesDetail = await notesModel
      .find({
        createdBy: tokenId,
        reminderAt: { $ne: null },  // reminderAt not null
        status: "active",           // optional: only active notes
      })
      .sort({ reminderAt: -1 })   // sort descending by reminderAt (latest first)
      .lean();

    success(res, "Get All Notes Detail with Reminders", notesDetail);
  } catch (error) {
    console.log(error);
    unknownError(res, error);
  }
}


//update board title
async function updateBoardTitle(req, res) {
  try {
    const { boardId, title } = req.body;
    const userId = req.Id; // Assume req.Id me login user ka id hai

    if (!boardId || !title) {
      return badRequest(res, "boardId and title are required");
    }

    // Find board and check creator
    const board = await boardModel.findById(boardId);
    if (!board) return notFound(res, "Board not found");

    if (String(board.createdBy) !== String(userId)) {
      return badRequest(res, "You are not authorized to update this board");
    }

    board.title = title;
    await board.save();

    success(res, "Board title updated successfully", board);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}

//update subBoard title
async function updateSubBoardTitle(req, res) {
  try {
    const { subBoardId, title } = req.body;
    const userId = req.Id;

    if (!subBoardId || !title) {
      return badRequest(res, "subBoardId and title are required");
    }

    // Find subBoard
    const subBoard = await subBoardModel.findById(subBoardId);
    if (!subBoard) return notFound(res, "SubBoard not found");

    // Find parent board to check creator
    const board = await boardModel.findById(subBoard.boardId);
    if (!board) return notFound(res, "Parent Board not found");

    if (String(board.createdBy) !== String(userId)) {
      return badRequest(res, "You are not authorized to update this subBoard");
    }

    subBoard.title = title;
    await subBoard.save();

    success(res, "SubBoard title updated successfully", subBoard);
  } catch (error) {
    console.error(error);
    unknownError(res, error.message);
  }
}

  module.exports = {
    boardAdd,
    shareBoard,
    getBoardSharedEmployees,
    getAllBoardsByTokenId,
    subBoardAdd,
    getAllBoardList,
    getAllBoardNotesByListId,
    notesAdd,
    shareNotes,
    getNotesSharedEmployees,
    getAllNotesByTokenId,
    notesDeleteAPi,
    boardDeleteApi,
    updateNotes,
    getSharedDataByType,
    notesUpdateReminder,
    getRemindersNotesByTokenId,
    updateBoardTitle,
    updateSubBoardTitle
  };
