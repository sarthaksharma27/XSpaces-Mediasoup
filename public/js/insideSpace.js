document.addEventListener('DOMContentLoaded', function () {
    // Collapse/Expand UI logic
    const collapseBtn = document.querySelector('.space-collapse');
    const spaceDetails = document.querySelector('.space-details');
    const participantsSection = document.querySelector('.participants-section');

    if (collapseBtn && spaceDetails && participantsSection) {
        collapseBtn.addEventListener('click', function () {
            spaceDetails.classList.toggle('hidden');
            participantsSection.classList.toggle('hidden');
        });
    }

    // Mic toggle logic
    let micStream = null;
    const controlBtns = document.querySelectorAll('.control-btn');

    controlBtns.forEach(btn => {
        btn.addEventListener('click', async function () {
            this.classList.toggle('active');
            const micStatus = document.querySelector('.mic-status');

            const isMicButton = this.querySelector('.icon-mic-off') !== null;

            if (isMicButton) {
                if (this.classList.contains('active')) {
                    micStatus.textContent = 'Mic is on';
                    try {
                        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        console.log('Microphone stream started:', micStream);
                    } catch (error) {
                        console.error('Error accessing microphone:', error);
                        micStatus.textContent = 'Mic access denied';
                    }
                } else {
                    micStatus.textContent = 'Mic is off';
                    if (micStream) {
                        micStream.getTracks().forEach(track => track.stop());
                        micStream = null;
                        console.log('Microphone stream stopped.');
                    }
                }
            }
        });
    });

    // End space button
    const endBtn = document.querySelector('.end-btn');
    if (endBtn) {
        endBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to end this space?')) {
                window.location.href = '/spaces';
            }
        });
    }

    // WebSocket connection
    const socket = io();

    socket.on('connect', () => {
        console.log('Connected to server via WebSocket:', socket.id);
    });

    let device;
    let sendTransport;

    // Handle RTP Capabilities
    socket.on('routerRtpCapabilities', async (routerRtpCapabilities) => {
        console.log('Received Router RTP Capabilities:', routerRtpCapabilities);
        await loadMediasoupDevice(routerRtpCapabilities);
    });

    async function loadMediasoupDevice(routerRtpCapabilities) {
        try {
            device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities });
            console.log('Mediasoup Device loaded:', device.rtpCapabilities);

            // Once device is ready, request a transport
            socket.emit('createSendTransport');
        } catch (error) {
            console.error('Failed to load Mediasoup device:', error);
        }
    }

    // Receive transport info from server and create send transport
    socket.on('sendTransportCreated', async (data) => {
        const { id, iceParameters, iceCandidates, dtlsParameters } = data;

        sendTransport = device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
        });

        console.log('Send transport created on client:', sendTransport);
    });

});
