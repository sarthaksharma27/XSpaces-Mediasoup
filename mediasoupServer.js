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
        console.log("Mediasoup Worker and Router created successfully");
    } catch (error) {
        console.error("Error creating Mediasoup worker/router:", error);
    }
};

const getRouterRtpCapabilities = () => {
    if (!router) {
        throw new Error("Router is not created yet!");
    }
    return router.rtpCapabilities;
};

export { createMediasoupWorker, getRouterRtpCapabilities };
