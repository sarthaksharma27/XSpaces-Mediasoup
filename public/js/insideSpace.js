document.addEventListener('DOMContentLoaded', function() {
    // Collapse button functionality
    const collapseBtn = document.querySelector('.space-collapse');
    const spaceDetails = document.querySelector('.space-details');
    const participantsSection = document.querySelector('.participants-section');
    
    collapseBtn.addEventListener('click', function() {
        spaceDetails.classList.toggle('hidden');
        participantsSection.classList.toggle('hidden');
    });

    // Store mic stream
    let micStream = null;

    // Control buttons functionality
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', async function() {
            this.classList.toggle('active');

            // Handle mic button specifically
            if (this.querySelector('.icon-mic-off')) {
                const micStatus = document.querySelector('.mic-status');
                if (this.classList.contains('active')) {
                    micStatus.textContent = 'Mic is on';

                    try {
                        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        console.log('Microphone stream:', micStream);

                        // You can do further processing or send this stream to the mediasoup server later
                    } catch (error) {
                        console.error('Error accessing microphone:', error);
                        micStatus.textContent = 'Mic access denied';
                    }

                } else {
                    micStatus.textContent = 'Mic is off';

                    // Stop all tracks if mic is turned off
                    if (micStream) {
                        micStream.getTracks().forEach(track => track.stop());
                        micStream = null;
                        console.log('Microphone stream stopped.');
                    }
                }
            }
        });
    });

    // End button functionality
    const endBtn = document.querySelector('.end-btn');
    endBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to end this space?')) {
            // Handle ending the space - redirect or API call
            window.location.href = '/spaces';
        }
    });
});

const socket = io(); 

socket.on('connect', () => {
  console.log('Connected to server via WebSocket:', socket.id);
});

