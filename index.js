import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import methodOverride from 'method-override';
import http from 'http';
import { Server } from 'socket.io';
import { createMediasoupWorker, getRouterRtpCapabilities, createWebRtcTransport } from './mediasoupServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);           
const io = new Server(server);                   

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
app.use('/profile', restrictToLoggedinUserOnly, profileRouter);

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the router RTP capabilities when the client connects
  socket.emit('routerRtpCapabilities', getRouterRtpCapabilities());

  // Listen for transport creation request from the client
  socket.on('createSendTransport', async () => {
    console.log('Client requested to create a send transport');

    // Request the server to create the WebRtcTransport and send back transport parameters
    await createWebRtcTransport(socket);

    console.log('Send transport creation completed');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const startServer = async () => {
  await createMediasoupWorker(); 
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
