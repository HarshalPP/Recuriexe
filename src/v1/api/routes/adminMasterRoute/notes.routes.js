const express = require("express");
const router = express.Router();

const {
    boardAdd, shareBoard, getBoardSharedEmployees, getAllBoardsByTokenId, 
    subBoardAdd, getAllBoardList, getAllBoardNotesByListId,
    notesAdd, shareNotes, getNotesSharedEmployees, 
    getAllNotesByTokenId,
    notesDeleteAPi, boardDeleteApi,
    updateNotes , getSharedDataByType , notesUpdateReminder ,getRemindersNotesByTokenId,
    updateBoardTitle, updateSubBoardTitle
                } = require("../../controller/notes/notes.controller")

router.post("/boardAdd",boardAdd)
router.post("/shareBoard",shareBoard)
router.get("/getBoardSharedEmployees",getBoardSharedEmployees)
router.get("/getAllBoardsByTokenId", getAllBoardsByTokenId)
router.post("/subBoardAdd", subBoardAdd)
router.get("/getAllSubBoard", getAllBoardList)
router.get("/getAllBoardNotesBysubBoardId",getAllBoardNotesByListId)
router.post("/add",notesAdd)
router.post("/shareNotes",shareNotes)
router.get("/getNotesSharedEmployees",getNotesSharedEmployees)
router.get("/getAllNotesByTokenId", getAllNotesByTokenId)
router.post("/delete", notesDeleteAPi)
router.post("/boardDelete",boardDeleteApi)
router.post("/update", updateNotes)
router.get("/getSharedDataByType", getSharedDataByType)
router.post("/notesUpdateReminder",notesUpdateReminder)
router.get("/remindersNotesByTokenId",getRemindersNotesByTokenId)

// Express router me add karein
router.post('/update/boardTitle', updateBoardTitle);
router.post('/update/subBoardTitle', updateSubBoardTitle);

 module.exports = router;
 