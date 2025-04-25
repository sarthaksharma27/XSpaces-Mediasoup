import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routers
import staticRouter from './routes/staticRouter.js';
import userRouter from './routes/userRouter.js';
import restrictToLoggedinUserOnly from './middleware/user.js';
import homeRouter from './routes/homeRouter.js';

// Use routers
app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/home', restrictToLoggedinUserOnly, homeRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
