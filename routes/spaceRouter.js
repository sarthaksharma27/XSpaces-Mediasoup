import express from 'express';
import { createSpace } from '../controllers/space.js';
import prisma from '../prisma/client.js';
// import { join, leave} from '../controllers/participant.js';
import { joinSpace, leaveSpace } from '../services/participantService.js';

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

  res.render("insideSpace", { space, host: space.host, user: req.user });
});
 
router.post('/:id/join', async (req, res) => {
  const spaceId = req.params.id;
  const userId = req.user.id;
  const role = req.body.role || 'listener';
  await joinSpace(spaceId, userId, role);
  res.status(200).send(`User ${userId} joined as ${role}`);
});


router.post('/:id/leave', async(req, res) => {
  const spaceId = req.params.id;
  const userId = req.user.id;
  await leaveSpace(spaceId, userId);
  res.status(200).send(`User ${userId} left the space`);
});

router.delete('/:id/destroy', async (req, res) => {
  const spaceId = req.params.id;
  const userId = req.user.id;
  try {
    // Ensure the logged-in user is the host (owner) of the space
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
    });

    if (space.hostId !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this space." });
    }

    await prisma.space.delete({
      where: { id: spaceId },
    });

    res.render("spaces")
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete space.' });
  }
});


// router.post('/:id/join', join);
// router.post('/:id/leave', leave);
// router.get('/:id/participants', getAllParticipants);

export default router;
