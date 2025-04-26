import express from 'express';
import { createSpace } from '../controllers/space.js';
import prisma from '../prisma/client.js';
import {join, leave} from '../controllers/participant.js';

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

router.post('/:id/join', join); 
router.post('/:id/leave', leave);
// router.get('/:id/participants', getAllParticipants);

export default router;
