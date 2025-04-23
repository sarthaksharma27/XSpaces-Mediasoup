import express from 'express';
const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/index.html");
});

router.get("/signup", (req, res) => {
    res.redirect("/signup.html");
});

router.get("/login", (req, res) => {
    res.redirect("/login.html");
});

export default router;
