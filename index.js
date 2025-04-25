import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());

// Import routers
import staticRouter from './routes/staticRouter.js';
import userRouter from './routes/userRouter.js';
import restrictToLoggedinUserOnly from './middleware/user.js';
import spaceRouter from './routes/spaceRouter.js';

// Use routers
app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/spaces', restrictToLoggedinUserOnly, spaceRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
