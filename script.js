let isLoginForm = true;

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("registerButton").addEventListener("click", register);
document.getElementById("switchForm").addEventListener("click", toggleForm);

function toggleForm(e) {
  e.preventDefault();
  isLoginForm = !isLoginForm;
  document.getElementById("loginForm").style.display = isLoginForm
    ? "block"
    : "none";
  document.getElementById("registerForm").style.display = isLoginForm
    ? "none"
    : "block";
  document.getElementById("switchForm").textContent = isLoginForm
    ? "Register here"
    : "Login here";
  document.getElementById("toggleForm").innerHTML = isLoginForm
    ? 'Don\'t have an account? <a href="#" id="switchForm">Register here</a>'
    : 'Already have an account? <a href="#" id="switchForm">Login here</a>';
  document.getElementById("switchForm").addEventListener("click", toggleForm);
  document.getElementById("message").textContent = "";
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://fairnote2.onrender.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      window.location.href = "recording.html";
    } else {
      document.getElementById("message").textContent = "Invalid credentials";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("message").textContent =
      "An error occurred. Please try again.";
  }
}

async function register() {
  const email = document.getElementById("regEmail").value;
  const name = document.getElementById("regName").value;
  const password = document.getElementById("regPassword").value;

  try {
    const response = await fetch("https://fairnote2.onrender.com/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    });

    if (response.ok) {
      document.getElementById("message").textContent =
        "Registration successful. Please login.";
      toggleForm({ preventDefault: () => {} });
    } else {
      document.getElementById("message").textContent =
        "Registration failed. Please try again.";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("message").textContent =
      "An error occurred. Please try again.";
  }
}
