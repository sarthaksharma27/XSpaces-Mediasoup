  // Sample data for the space
  const spaceData = {
    title: "test space",
    isLive: true
};

const hostData = {
    name: "Sarthak",
    username: "sarthak",
    avatar: "/images/avatar.jpg" // Path to your avatar image
};

// Sample listeners data if needed
const listenersData = [
    // Add listener objects here if needed
];

// You could use these in your backend to render the EJS template
// In a real app, this would come from your server

document.addEventListener('DOMContentLoaded', function() {
    // Collapse button functionality
    const collapseBtn = document.querySelector('.space-collapse');
    const spaceDetails = document.querySelector('.space-details');
    const participantsSection = document.querySelector('.participants-section');
    
    collapseBtn.addEventListener('click', function() {
        spaceDetails.classList.toggle('hidden');
        participantsSection.classList.toggle('hidden');
    });

    // Control buttons functionality
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // Handle mic button specifically
            if (this.querySelector('.icon-mic-off')) {
                const micStatus = document.querySelector('.mic-status');
                if (this.classList.contains('active')) {
                    micStatus.textContent = 'Mic is on';
                } else {
                    micStatus.textContent = 'Mic is off';
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