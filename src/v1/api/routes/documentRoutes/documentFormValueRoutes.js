import express from 'express';
import { createDocumentFormValue , updateDocumentFormValue , getAllDocumentFormValues , getDocumentFormValueById } from '../../controllers/document/documentFormValue.Controller.js';
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

const router = express.Router();

router.post('/add', verifyEmployeeToken, createDocumentFormValue);
router.get('/detail/:id', verifyEmployeeToken, getDocumentFormValueById)
router.get('/getAll', verifyEmployeeToken, getAllDocumentFormValues);
router.post('/update/:id', verifyEmployeeToken, updateDocumentFormValue)

export default router;
