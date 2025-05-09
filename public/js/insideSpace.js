document.addEventListener('DOMContentLoaded', function () {
    const collapseBtn = document.querySelector('.space-collapse');
    const spaceDetails = document.querySelector('.space-details');
    const participantsSection = document.querySelector('.participants-section');
    const micStatus = document.querySelector('.mic-status');
    const controlBtns = document.querySelectorAll('.control-btn');

    // UI: Collapse/Expand toggle
    if (collapseBtn && spaceDetails && participantsSection) {
        collapseBtn.addEventListener('click', function () {
            spaceDetails.classList.toggle('hidden');
            participantsSection.classList.toggle('hidden');
        });
    }

    // WebSocket connection
    const socket = io();
    socket.on('connect', () => {
        console.log('Connected to server via WebSocket:', socket.id);
        socket.emit('join-space', { spaceId: 'xyz-123' });
    });

    let micStream = null;
    let device;
    let sendTransport;

    // ⬇️ Moved function here
    async function startProducingMicTrack() {
        const audioTrack = micStream.getAudioTracks()[0];
        try {
            const producer = await sendTransport.produce({
                track: audioTrack,
                codecOptions: {
                    opusStereo: true,
                    opusDtx: true,
                },
            });

            console.log('Started producing audio track');
            micStatus.textContent = 'Mic is streaming...';
        } catch (err) {
            console.error('Error producing audio track:', err);
        }
    }

    // Mic toggle logic
    controlBtns.forEach(btn => {
        btn.addEventListener('click', async function () {
            this.classList.toggle('active');
            const isMicButton = this.querySelector('.icon-mic-off') !== null;

            if (isMicButton) {
                if (this.classList.contains('active')) {
                    micStatus.textContent = 'Mic is on';
                    try {
                        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        console.log('Microphone stream started');

                        if (sendTransport) startProducingMicTrack();
                    } catch (error) {
                        console.error('Error accessing microphone:', error);
                        micStatus.textContent = 'Mic access denied';
                    }
                } else {
                    micStatus.textContent = 'Mic is off';
                    if (micStream) {
                        micStream.getTracks().forEach(track => track.stop());
                        micStream = null;
                        console.log('Microphone stream stopped');
                    }
                }
            }
        });
    });

    // Step 1: Get RTP Capabilities from server
    socket.on('routerRtpCapabilities', async (routerRtpCapabilities) => {
        console.log('Received router RTP capabilities');
        await loadMediasoupDevice(routerRtpCapabilities);
    });

    async function loadMediasoupDevice(routerRtpCapabilities) {
        try {
            device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities });
            console.log('Mediasoup device loaded');
            socket.emit('createSendTransport');
        } catch (error) {
            console.error('Failed to load device', error);
        }
    }

    if (window.IS_HOST) {
        // Step 2: Create send transport
        socket.on('sendTransportCreated', async (data) => {
            const { id, iceParameters, iceCandidates, dtlsParameters } = data;

            sendTransport = device.createSendTransport({
                id,
                iceParameters,
                iceCandidates,
                dtlsParameters,
            });

            console.log('Send transport created');

            // Step 3: DTLS handshake
            sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
                console.log('Sending DTLS parameters to server...');
                socket.emit('connectSendTransport', {
                    transportId: sendTransport.id,
                    dtlsParameters,
                });

                socket.once('transportConnected', () => {
                    console.log('Transport connected');
                    callback();
                });

                socket.once('transportConnectError', (error) => {
                    console.error('DTLS connection error:', error);
                    errback(error);
                });
            });

            // Step 4: Produce event handler
            sendTransport.on('produce', (parameters, callback, errback) => {
                console.log('Sending produce request to server...');
                socket.emit('produce', {
                    transportId: sendTransport.id,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                }, ({ id }) => {
                    console.log('Producer ID received from server:', id);
                    callback({ id });
                });
            });

            // Auto-produce if mic is already active
            if (micStream) startProducingMicTrack();
        });

    } else {
        let recvTransport;

        // Step 2: Request to create receive transport
        socket.emit('createRecvTransport');

        socket.on('recvTransportCreated', async ({ id, iceParameters, iceCandidates, dtlsParameters }) => {
            recvTransport = device.createRecvTransport({
                id,
                iceParameters,
                iceCandidates,
                dtlsParameters,
            });

            console.log('Receive transport created');

            // Step 3: DTLS handshake
            recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
                console.log('Sending DTLS parameters for recv transport...');
                socket.emit('connectRecvTransport', {
                    transportId: recvTransport.id,
                    dtlsParameters,
                });

                socket.once('transportConnected', () => {
                    console.log('Recv transport connected');
                    callback();
                });

                socket.once('transportConnectError', (error) => {
                    console.error('DTLS recv connection error:', error);
                    errback(error);
                });
            });

            // Step 4: Request to consume
            socket.emit('consume', {
                rtpCapabilities: device.rtpCapabilities,
            });
        });

        socket.on('consumeSuccess', async ({ id, producerId, kind, rtpParameters }) => {
            console.log('Consumer parameters received from server');
        
            const consumer = await recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
            });
        
            const track = consumer.track;
        
            // 🧠 Real-time audio analysis (inline)
            const audioContext = new AudioContext();
            const stream = new MediaStream([track]);
            const sourceNode = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
        
            sourceNode.connect(analyser);
            analyser.fftSize = 2048;
        
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
        
            function analyze() {
                analyser.getByteFrequencyData(dataArray);
        
                // Volume (amplitude) estimation
                const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
                console.log('🔊 Volume (avg amplitude):', average.toFixed(2));
        
                // Dominant frequency estimation (basic pitch)
                const sampleRate = audioContext.sampleRate;
                const maxIndex = dataArray.reduce((best, val, i, arr) => val > arr[best] ? i : best, 0);
                const dominantFreq = maxIndex * sampleRate / analyser.fftSize;
                console.log('🎵 Estimated pitch (Hz):', dominantFreq.toFixed(2));
        
                requestAnimationFrame(analyze);
            }
        
            analyze();
        
            // 🔊 Play audio from producer
            const audioElement = document.createElement('audio');
            audioElement.srcObject = stream;
            audioElement.autoplay = true;
            audioElement.playsInline = true;
            document.body.appendChild(audioElement);
        
            console.log('🔈 Audio is playing from producer');
        });
        

        socket.on('consumeError', (err) => {
            console.error('Error consuming:', err);
        });
    }
});
