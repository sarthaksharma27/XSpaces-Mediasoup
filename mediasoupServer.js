import mediasoup from 'mediasoup';

let worker;
let router;
const transports = new Map(); // Stores WebRTC transports by socket ID
const producers = new Map();  // Stores producers by socket ID

// Initialize Mediasoup worker and router
const createMediasoupWorker = async () => {
  try {
    worker = await mediasoup.createWorker();
    router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
      ],
    });
    console.log('Mediasoup worker and router initialized');
  } catch (err) {
    console.error('Error initializing Mediasoup:', err);
  }
};

// Get router RTP capabilities
const getRouterRtpCapabilities = () => {
  if (!router) throw new Error('Router not initialized');
  return router.rtpCapabilities;
};

const createWebRtcTransport = async (socket, transportType) => { 
  try {
    const transportOptions = {
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    };

    let transport;

    if (transportType === 'send') {
      transport = await router.createWebRtcTransport(transportOptions);
      transports.set(`${socket.id}_send`, transport);

      socket.emit('sendTransportCreated', {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });

      console.log('Send transport created for socket', socket.id);
    } else if (transportType === 'recv') {
      transport = await router.createWebRtcTransport(transportOptions);
      transports.set(`${socket.id}_recv`, transport);

      socket.emit('recvTransportCreated', {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });

      console.log('Receive transport created for socket', socket.id);
    } else {
      console.error('Invalid transport type');
    }
  } catch (err) {
    console.error('Error creating WebRTC transport:', err);
  }
};

// Connect DTLS to a transport
const connectTransport = async (socket, transportId, dtlsParameters) => {
  const transport = transports.get(socket.id);
  if (!transport) {
    console.error('Transport not found');
    return;
  }

  try {
    await transport.connect({ dtlsParameters });
    socket.emit('transportConnected');
  } catch (err) {
    console.error('Transport DTLS connect error:', err);
    socket.emit('transportConnectError', err.message);
  }
};

// Create a producer from client's media track
const handleProducer = async (socket, transportId, kind, rtpParameters, appData) => {
  const transport = transports.get(socket.id);
  if (!transport) {
    console.error('Transport not found for producing');
    return;
  }

  try {
    const producer = await transport.produce({ kind, rtpParameters, appData });
    producers.set(socket.id, producer);
    socket.emit('producerCreated', { id: producer.id });
  } catch (err) {
    console.error('Error creating producer:', err);
    socket.emit('produceError', err.message);
  }
};

// Find a transport by ID
const getTransportById = (transportId) => {
  for (const transport of transports.values()) {
    if (transport.id === transportId) return transport;
  }
  return null;
};

// Add producer reference
const addProducer = (socketId, producer) => {
  producers.set(socketId, producer);
};

export {
  createMediasoupWorker,
  getRouterRtpCapabilities,
  createWebRtcTransport,
  connectTransport,
  handleProducer,
  getTransportById,
  addProducer,
};
