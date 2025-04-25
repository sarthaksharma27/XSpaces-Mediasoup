import jwt from 'jsonwebtoken';

function restrictToLoggedinUserOnly(req, res, next) {
  const token = req.cookies.uid;
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, 'Sarthak$123@$');
    // console.log(verified);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default restrictToLoggedinUserOnly;