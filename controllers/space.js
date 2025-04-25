import prisma from '../prisma/client.js';

async function createSpace(req, res) {
    const { title, description } = req.body;
    const hostId = req.user.id;

    const space = await prisma.space.create({
        data: {
            title,
            description,
            hostId,
        },
    });
    
    res.render("space")
}

export { createSpace };
