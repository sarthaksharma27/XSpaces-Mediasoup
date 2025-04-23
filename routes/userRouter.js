import express from 'express';
import { handleUserSignup, handleUserLogin } from '../controllers/user.js';

const router = express.Router();

router.post("/login", handleUserLogin);
router.post("/signup", handleUserSignup);

export default router;
