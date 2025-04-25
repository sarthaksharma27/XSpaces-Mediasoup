import express from 'express';
import { handleSpace } from '../controllers/space.js'; 

const router = express.Router();

router.get('/', handleSpace);

export default router;
