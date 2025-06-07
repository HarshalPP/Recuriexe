import express from 'express';
import { verifyEmployeeToken } from '../../middleware/authicationmiddleware.js';

import {
    createAllocated,
    getAllAllocated,
    getAllocatedById,
    updateAllocated,
    deleteAllocated
} from '../../controllers/AllocatedController/allocated.controller.js';

const router = express.Router();
router.post('/create', verifyEmployeeToken, createAllocated);
router.get('/getAllAllocated', verifyEmployeeToken, getAllAllocated);
router.get('/getAllocatedById/:id', verifyEmployeeToken, getAllocatedById);
router.post('/updateAllocated/:id', verifyEmployeeToken , updateAllocated);
router.post('/deleteAllocated/:id', verifyEmployeeToken , deleteAllocated);

export default router;
