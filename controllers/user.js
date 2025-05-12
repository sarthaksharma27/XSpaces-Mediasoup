import prisma from '../prisma/client.js';
import { setUser } from '../services/auth.js';

async function handleUserSignup(req, res) {
    const { username, email, password } = req.body;
    
    await prisma.user.create({
        data: {
            username,
            email,
            password,
        },
    });

    res.render("login");
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            email,
            password,
        },
    });

    if (!user) {
        console.error(`User not found for email: ${email}. Invalid credentials.`);
        return res.render("signup")  
    }

    const token = setUser(user);
    res.cookie("uid", token);
    res.redirect("/space")
}

export { handleUserSignup, handleUserLogin };
