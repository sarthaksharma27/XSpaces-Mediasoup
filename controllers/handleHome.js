import prisma from '../prisma/client.js';

async function handleHome(req, res) {
    const userId = req.cookies.uid;

    if (!userId) {
        return res.redirect("/login.html");
    }

    const spaces = await prisma.space.findMany({
        where: { hostId: userId },
    });

    if (spaces.length === 0) {
        return res.render("spaces", { spaces: [], message: "You don't have any spaces yet. Create a new space!" });
    }

    res.render("spaces", { spaces });
}

export { handleHome };
