import express from 'express';
import { createDocumentFormValue , updateDocumentFormValue , getAllDocumentFormValues , getDocumentFormValueById } from '../../controllers/document/documentFormValue.Controller.js';
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

const router = express.Router();

router.post('/add',  createDocumentFormValue);
router.get('/detail',  getDocumentFormValueById)
router.get('/getAll',  getAllDocumentFormValues);
router.post('/update/:id',  updateDocumentFormValue)

export default router;
