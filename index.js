import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import methodOverride from 'method-override';

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
app.use(methodOverride('_method'));

// Import routers
import staticRouter from './routes/staticRouter.js';
import userRouter from './routes/userRouter.js';
import restrictToLoggedinUserOnly from './middleware/user.js';
import spaceRouter from './routes/spaceRouter.js';
import profileRouter from './routes/profileRouter.js';

// Use routers
app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/space', restrictToLoggedinUserOnly, spaceRouter);
app.use('/profile', restrictToLoggedinUserOnly, profileRouter)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
