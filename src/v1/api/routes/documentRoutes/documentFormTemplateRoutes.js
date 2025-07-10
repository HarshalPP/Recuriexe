import express from 'express';
import {
  createDocumentFormTemplate, getAllDocumentFormTemplates, getDocumentFormTemplateById, updateDocumentFormTemplate,getCandidatDocumentFormById
  // toggleTemplateActive, toggleFieldActive
} from '../../controllers/document/documentFormTemplateController.js';
import { verifyEmployeeToken } from "../../middleware/authicationmiddleware.js";

const router = express.Router();

router.post('/add', verifyEmployeeToken, createDocumentFormTemplate);
router.get('/getAll',verifyEmployeeToken,getAllDocumentFormTemplates);
router.get('/detail/:id',verifyEmployeeToken, getDocumentFormTemplateById);
router.post('/update/:id', verifyEmployeeToken,updateDocumentFormTemplate);
router.get('/candidatDocumentForm', verifyEmployeeToken, getCandidatDocumentFormById);

// router.patch('/:id/active',verifyEmployeeToken , toggleTemplateActive);
// router.patch('/:templateId/fields/:fieldId/active',verifyEmployeeToken ,  toggleFieldActive);

export default router