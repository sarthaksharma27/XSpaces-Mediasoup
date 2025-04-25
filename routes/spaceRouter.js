import express from 'express';
import { createSpace } from '../controllers/space.js';
import prisma from '../prisma/client.js';

const router = express.Router();

router.get('/', async(req, res) => {
  const spaces = await prisma.space.findMany();

  res.render("spaces", { spaces });
});

router.post('/', createSpace);

export default router;
