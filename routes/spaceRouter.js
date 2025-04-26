import express from 'express';
import { createSpace } from '../controllers/space.js';
import prisma from '../prisma/client.js';

const router = express.Router();

router.get('/', async(req, res) => {
  const spaces = await prisma.space.findMany();

  res.render("spaces", { spaces });
});

router.post('/', createSpace);

router.get('/:id', async (req, res) => {
  const spaceId = req.params.id;
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      host: true,
    },
  });

  if (!space) {
    return res.status(404).send('Space not found');
  }

  res.render("insideSpace", { space, host: space.host });
});

export default router;
