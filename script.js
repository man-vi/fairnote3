document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple validation
    if (username === 'admin' && password === 'password123') {
        // Redirect to the voice recording page
        window.location.href = 'recording.html'; // Ensure this matches the file name
    } else {
        const messageDiv = document.getElementById('message');
        messageDiv.style.color = 'red';
        messageDiv.innerText = 'Invalid username or password.';
    }
});
