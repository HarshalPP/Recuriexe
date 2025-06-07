
import express from 'express';
import { 
  initiateLinkedInLogin,
  handleLinkedInCallback,
  linkedinLogout 
} from "../../controllers/OAuthController/linkedInController.js"



const router = express.Router();


router.get('/linkedin', initiateLinkedInLogin);


router.get('/linkedin/callback', handleLinkedInCallback);


router.post('/linkedin/logout', linkedinLogout);

export default router;