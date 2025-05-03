import mediasoup from 'mediasoup';

let worker;
let router;

const createMediasoupWorker = async () => {
  try {
    worker = await mediasoup.createWorker();
    router = await worker.createRouter({
      mediaCodecs: [{
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      }],
    });
    console.log("Mediasoup Worker and Router created");
  } catch (err) {
    console.error("Mediasoup init error:", err);
  }
};

const getRouterRtpCapabilities = () => {
  if (!router) throw new Error("Router not created yet");
  return router.rtpCapabilities;
};

const createWebRtcTransport = async (socket) => {
  try {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    console.log('WebRtcTransport created:', transport.id);

    // Send transport params back to the client
    socket.emit('sendTransportCreated', {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  } catch (err) {
    console.error('Error creating WebRtcTransport:', err);
  }
};

export {
  createMediasoupWorker,
  getRouterRtpCapabilities,
  createWebRtcTransport,
};
