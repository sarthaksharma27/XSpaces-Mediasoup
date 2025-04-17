document.getElementById('signup-btn').addEventListener('click', function () {
    let hasError = false;

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Reset error messages
    document.getElementById('username-error').style.display = 'none';
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';

    // Validate username
    if (!username || username.length < 3) {
        document.getElementById('username-error').style.display = 'block';
        hasError = true;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('email-error').style.display = 'block';
        hasError = true;
    }

    // Validate password
    if (!password || password.length < 8) {
        document.getElementById('password-error').style.display = 'block';
        hasError = true;
    }

    if (hasError) return;

    // Prepare data
    const userData = {
        username,
        email,
        password
    };

    console.log('Submitting user data:', userData);

    // Example API call
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/onboarding';
            } else {
                alert('Signup failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error during signup:', error);
            alert('An error occurred during signup. Please try again.');
        });
});
