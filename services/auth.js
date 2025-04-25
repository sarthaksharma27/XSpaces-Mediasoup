import jwt from "jsonwebtoken";

const secret = "Sarthak$123@$";

export function setUser(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        secret, 
        {
            expiresIn: '1h',
        }
    );
}
