import express from 'express';
import { handleHome } from '../controllers/handleHome.js'; 

const router = express.Router();

router.get('/', handleHome);

export default router;
