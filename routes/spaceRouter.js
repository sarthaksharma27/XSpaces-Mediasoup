import express from 'express';
import { createSpace } from '../controllers/space.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.render("spaces");
});

router.post('/', createSpace);

export default router;
