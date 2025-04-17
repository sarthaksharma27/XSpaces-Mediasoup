document.getElementById('login-btn').addEventListener('click', function() {
    // Reset error messages
    document.getElementById('username-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    let hasError = false;
    
    if (!username) {
        document.getElementById('username-error').style.display = 'block';
        hasError = true;
    }
    
    if (!password) {
        document.getElementById('password-error').style.display = 'block';
        hasError = true;
    }
    
    if (!hasError) {
        // Send data to your backend API
        console.log('Attempting login with:', { username, password });
        
        // Example API call - replace with your actual backend endpoint
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/home'; // Redirect to home on successful login
            } else {
                alert('Login failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again.');
        });
    }
});

document.getElementById('signup-redirect').addEventListener('click', function() {
    window.location.href = 'signup.html'; // Redirect to signup page
});