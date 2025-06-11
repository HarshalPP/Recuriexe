import express from "express";
const router = express.Router();
import {  boardAdd, shareBoard, getBoardSharedEmployees, getAllBoardsByTokenId, 
          subBoardAdd, getAllBoardList, getAllBoardNotesByListId,
          notesAdd, shareNotes, getNotesSharedEmployees, 
          getAllNotesByTokenId,
          notesDeleteAPi, boardDeleteApi,
          updateNotes , getSharedDataByType , notesUpdateReminder ,getRemindersNotesByTokenId,
            updateBoardTitle, updateSubBoardTitle
          
         } from "../../controllers/notesController/notes.controller.js"
import {verifyEmployeeToken} from "../../middleware/authicationmiddleware.js"


router.post("/boardAdd", verifyEmployeeToken , boardAdd)
router.post("/shareBoard", verifyEmployeeToken , shareBoard)
router.get("/getBoardSharedEmployees", verifyEmployeeToken , getBoardSharedEmployees)
router.get("/getAllBoardsByTokenId", verifyEmployeeToken ,  getAllBoardsByTokenId)
router.post("/subBoardAdd", verifyEmployeeToken ,  subBoardAdd)
router.get("/getAllSubBoard", verifyEmployeeToken ,  getAllBoardList)
router.get("/getAllBoardNotesBysubBoardId", verifyEmployeeToken , getAllBoardNotesByListId)
router.post("/add", verifyEmployeeToken , notesAdd)
router.post("/shareNotes", verifyEmployeeToken , shareNotes)
router.get("/getNotesSharedEmployees", verifyEmployeeToken , getNotesSharedEmployees)
router.get("/getAllNotesByTokenId", verifyEmployeeToken ,  getAllNotesByTokenId)
router.post("/delete", verifyEmployeeToken ,  notesDeleteAPi)
router.post("/boardDelete", verifyEmployeeToken , boardDeleteApi)
router.post("/update", verifyEmployeeToken ,  updateNotes)
router.get("/getSharedDataByType", verifyEmployeeToken ,  getSharedDataByType)
router.post("/notesUpdateReminder", verifyEmployeeToken , notesUpdateReminder)
router.get("/remindersNotesByTokenId", verifyEmployeeToken , getRemindersNotesByTokenId)

router.post('/update/boardTitle',verifyEmployeeToken, updateBoardTitle);
router.post('/update/subBoardTitle',verifyEmployeeToken, updateSubBoardTitle);

export default router;