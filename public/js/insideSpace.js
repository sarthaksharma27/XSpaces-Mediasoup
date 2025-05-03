document.addEventListener('DOMContentLoaded', function () {
    const collapseBtn = document.querySelector('.space-collapse');
    const spaceDetails = document.querySelector('.space-details');
    const participantsSection = document.querySelector('.participants-section');
    collapseBtn.addEventListener('click', function () {
        spaceDetails.classList.toggle('hidden');
        participantsSection.classList.toggle('hidden');
    });

    let micStream = null;
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', async function () {
            this.classList.toggle('active');
            if (this.querySelector('.icon-mic-off')) {
                const micStatus = document.querySelector('.mic-status');
                if (this.classList.contains('active')) {
                    micStatus.textContent = 'Mic is on';
                    try {
                        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        console.log('Microphone stream:', micStream);
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

    const endBtn = document.querySelector('.end-btn');
    endBtn.addEventListener('click', function () {
        if (confirm('Are you sure you want to end this space?')) {
            window.location.href = '/spaces';
        }
    });

    const socket = io();
    socket.on('connect', () => {
        console.log('Connected to server via WebSocket:', socket.id);
    });

    socket.on('routerRtpCapabilities', (routerRtpCapabilities) => {
        console.log('Received Router RTP Capabilities:', routerRtpCapabilities);
        loadMediasoupDevice(routerRtpCapabilities);
    });

    let device;

    async function loadMediasoupDevice(routerRtpCapabilities) {
        device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities });
        console.log('Mediasoup Device loaded successfully:', device.rtpCapabilities);
    }
});
