// Sample data for spaces
const spacesData = {
    live: [
        {
            id: 1,
            title: "Backend Development Best Practices",
            status: "LIVE",
            host: "Jane Developer",
            listeners: 523
        },
        {
            id: 2,
            title: "Building Scalable APIs with Node.js",
            status: "LIVE",
            host: "Tech Explorer",
            listeners: 248
        }
    ],
    upcoming: [
        {
            id: 3,
            title: "Database Optimization Techniques",
            status: "SCHEDULED",
            host: "Database Guru",
            scheduledFor: "Tomorrow, 3:00 PM"
        },
        {
            id: 4,
            title: "Microservices Architecture Deep Dive",
            status: "SCHEDULED",
            host: "System Architect",
            scheduledFor: "April 25, 7:00 PM"
        }
    ]
};

// DOM References
const createSpaceBtn = document.getElementById('createSpaceBtn');
const createSpaceModal = document.getElementById('createSpaceModal');
const closeBtn = document.querySelector('.close-btn');
const createSpaceForm = document.getElementById('createSpaceForm');
const liveSpacesList = document.getElementById('liveSpacesList');
const upcomingSpacesList = document.getElementById('upcomingSpacesList');

// Function to display spaces
function displaySpaces() {
    // Display live spaces
    liveSpacesList.innerHTML = '';
    spacesData.live.forEach(space => {
        const spaceCard = document.createElement('div');
        spaceCard.className = 'space-card';
        spaceCard.dataset.id = space.id;
        
        spaceCard.innerHTML = `
            <div class="space-status">${space.status}</div>
            <h3 class="space-title">${space.title}</h3>
            <div class="space-host">
                <div class="host-img"></div>
                <span>Hosted by ${space.host}</span>
            </div>
            <div class="space-listeners">
                <div class="listeners-avatars">
                    <div class="listener-img"></div>
                    <div class="listener-img"></div>
                    <div class="listener-img"></div>
                </div>
                <span class="listeners-count">${space.listeners} listening</span>
            </div>
        `;
        
        liveSpacesList.appendChild(spaceCard);
    });

    // Display upcoming spaces
    upcomingSpacesList.innerHTML = '';
    spacesData.upcoming.forEach(space => {
        const spaceCard = document.createElement('div');
        spaceCard.className = 'space-card';
        spaceCard.dataset.id = space.id;
        
        spaceCard.innerHTML = `
            <div class="space-status">${space.status}</div>
            <h3 class="space-title">${space.title}</h3>
            <div class="space-host">
                <div class="host-img"></div>
                <span>Hosted by ${space.host}</span>
            </div>
            <div class="space-listeners">
                <span class="listeners-count">${space.scheduledFor}</span>
            </div>
        `;
        
        upcomingSpacesList.appendChild(spaceCard);
    });
}

// Function to handle space click
function handleSpaceClick(e) {
    const spaceCard = e.target.closest('.space-card');
    if (spaceCard) {
        const spaceId = spaceCard.dataset.id;
        // Here you would redirect to the specific space
        console.log(`Opening space with ID: ${spaceId}`);
        // Example: window.location.href = `/space/${spaceId}`;
    }
}

// Initialize modal functionality
function initModal() {
    // Open modal
    createSpaceBtn.addEventListener('click', () => {
        createSpaceModal.style.display = 'block';
        
        // Set default date time (current time + 1 hour)
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const dateTimeString = now.toISOString().slice(0, 16);
        document.getElementById('spaceDate').value = dateTimeString;
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        createSpaceModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createSpaceModal) {
            createSpaceModal.style.display = 'none';
        }
    });

    // Handle form submission
    createSpaceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('spaceTitle').value;
        const description = document.getElementById('spaceDescription').value;
        const dateTime = document.getElementById('spaceDate').value;
        
        const dateObj = new Date(dateTime);
        const now = new Date();
        
        // Create new space object
        const newSpace = {
            id: spacesData.live.length + spacesData.upcoming.length + 1,
            title: title,
            host: "You",
            description: description
        };
        
        // Check if the space should be live now or scheduled
        if (dateObj <= now) {
            newSpace.status = "LIVE";
            newSpace.listeners = 0;
            spacesData.live.unshift(newSpace);
        } else {
            newSpace.status = "SCHEDULED";
            newSpace.scheduledFor = formatDateTime(dateObj);
            spacesData.upcoming.unshift(newSpace);
        }
        
        // Update display
        displaySpaces();
        
        // Close the modal
        createSpaceModal.style.display = 'none';
        
        // Reset form
        createSpaceForm.reset();
    });
}

// Helper function to format date and time
function formatDateTime(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateStr;
    if (isToday) {
        dateStr = "Today";
    } else if (isTomorrow) {
        dateStr = "Tomorrow";
    } else {
        const options = { month: 'long', day: 'numeric' };
        dateStr = date.toLocaleDateString('en-US', options);
    }
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displaySpaces();
    initModal();
    
    // Add event listeners for space clicks
    liveSpacesList.addEventListener('click', handleSpaceClick);
    upcomingSpacesList.addEventListener('click', handleSpaceClick);
});