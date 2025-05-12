import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { spaces: true },
    });

    res.render('profile', { user });
});

router.delete('/delete', async (req, res) => {
    const userId = req.user.id;
  
    try {
      await prisma.space.deleteMany({
        where: { hostId: userId },
      });
  
      await prisma.user.delete({
        where: { id: userId },
      });
  
      res.render('index');
    } catch (error) {
      console.error(error);
      res.status(500).send('Something went wrong while deleting your account.');
    }
  });
  

export default router;
