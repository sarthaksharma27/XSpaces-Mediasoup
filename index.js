const socketToSpaceMap = new Map(); 

// Imports
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import methodOverride from 'method-override';
import http from 'http';
import { Server } from 'socket.io';

import {
  createMediasoupWorker,
  getRouterRtpCapabilities,
  createWebRtcTransport,
  connectTransport,
  handleProducer,
  getTransportById,
  addProducer,
  getProducerBySpaceId,
  getTransportBySocket,
  router
} from './mediasoupServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// View and middleware setup
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Routes
import staticRouter from './routes/staticRouter.js';
import userRouter from './routes/userRouter.js';
import restrictToLoggedinUserOnly from './middleware/user.js';
import spaceRouter from './routes/spaceRouter.js';
import profileRouter from './routes/profileRouter.js';

app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/space', restrictToLoggedinUserOnly, spaceRouter);
app.use('/profile', restrictToLoggedinUserOnly, profileRouter);

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-space', ({ spaceId }) => {
    if (!spaceId) {
      return socket.emit('error', 'Missing space ID');
    }
    socketToSpaceMap.set(socket.id, spaceId);
    console.log(`Socket ${socket.id} joined space ${spaceId}`);
  });

  // Step 1: Send RTP Capabilities
  socket.emit('routerRtpCapabilities', getRouterRtpCapabilities());

  // Step 2: Create send transport
  socket.on('createSendTransport', async () => {
    console.log('Client requested send transport');
    await createWebRtcTransport(socket, 'send'); 
    console.log('Send transport setup complete');
  });

  // Step 3: Handle DTLS connection
  socket.on('connectSendTransport', async ({ transportId, dtlsParameters }) => {
    const transport = getTransportById(transportId);
    if (!transport) {
      return socket.emit('transportConnectError', 'Transport not found');
    }

    try {
      await transport.connect({ dtlsParameters });
      console.log('Transport connected:', transportId);
      socket.emit('transportConnected');
    } catch (err) {
      console.error('Transport connect error:', err);
      socket.emit('transportConnectError', err.message);
    }
  });

  // Step 4: Handle track production
  socket.on('produce', async ({ transportId, kind, rtpParameters, appData }, callback) => {
    console.log('Received produce request');
    const spaceId = socketToSpaceMap.get(socket.id); 
    if (!spaceId) {
      return socket.emit('produceError', 'You must join a space first');
    }

    await handleProducer(socket, transportId, kind, rtpParameters, appData, spaceId);
    const producer = getProducerBySpaceId(spaceId);
    if (producer) {
      callback({ id: producer.id });
    }
  });

  // Here is the consumer code //////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////

  // Step 2: Create recv transport
  socket.on('createRecvTransport', async () => {
    console.log('Client requested recv transport');
    await createWebRtcTransport(socket, 'recv'); 
    console.log('recv transport setup complete');
  });

  // Step 3: DTLS handshake for recvTransport (Consumer Side)
  socket.on('connectRecvTransport', async ({ transportId, dtlsParameters }) => {
    const transport = getTransportById(transportId);
  
    if (!transport) {
        console.error('Transport not found for ID:', transportId);
        return socket.emit('transportConnectError', 'Transport not found');
    }

    try {
        await transport.connect({ dtlsParameters });
        console.log('Transport connected via DTLS:', transportId);
        socket.emit('transportConnected');
    } catch (err) {
        console.error('Transport connection failed:', err);
        socket.emit('transportConnectError', err.message);
    }
  });

  // Step 4: Handle consumer logic
  socket.on('consume', async ({ rtpCapabilities }) => {
    const spaceId = socketToSpaceMap.get(socket.id); 
    const producer = getProducerBySpaceId(spaceId);
    console.log("Hello this is sarthak", producer);
    

    if (!producer) {
      return socket.emit('consumeError', 'No producer available');
    }

    if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
      return socket.emit('consumeError', 'Cannot consume');
    }

    const transport = getTransportBySocket(socket.id, 'recv'); // ✅ use helper for correct transport
    if (!transport) {
      return socket.emit('consumeError', 'Receive transport not found');
    }

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: false,
    });

    socket.emit('consumeSuccess', {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socketToSpaceMap.delete(socket.id); // clean up map
  });

});

// Server startup
const startServer = async () => {
  await createMediasoupWorker();
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
