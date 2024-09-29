let mediaRecorder;
let audioChunks = [];
let recognition;
let isRecognizing = false;
let recordingTime = 0;
let timerInterval;
let isRecording = false; // Track recording state

const newRecordingBtn = document.getElementById("newRecordingBtn");
const logoutBtn = document.getElementById("logoutBtn");
const recordingSection = document.getElementById("recordingSection");
const conversationsSection = document.getElementById("conversationsSection");
const conversationsList = document.getElementById("conversationsList");
const modal = document.getElementById("conversationModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementsByClassName("close")[0];

newRecordingBtn.addEventListener("click", showRecordingSection);
logoutBtn.addEventListener("click", logout);
closeModal.addEventListener("click", closeConversationModal);
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    closeConversationModal();
  }
});

// Add these functions
function showRecordingSection() {
  recordingSection.style.display = "block";
  conversationsSection.style.display = "none";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function closeConversationModal() {
  modal.style.display = "none";
}

document
  .getElementById("recordButton")
  .addEventListener("click", toggleRecording);

async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// async function startRecording() {
//   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   mediaRecorder = new MediaRecorder(stream);

//   mediaRecorder.start();
//   isRecording = true;

//   document.getElementById("recordButton").querySelector("img").src =
//     "./recording.png"; // Change to a recording image
//   startTimer();

//   mediaRecorder.addEventListener("dataavailable", (event) => {
//     audioChunks.push(event.data);
//   });
// }

// function stopRecording() {
//   mediaRecorder.stop();
//   isRecording = false;

//   mediaRecorder.addEventListener("stop", async () => {
//     const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
//     audioChunks = []; // Reset the audio chunks

//     // Create a FormData object and append the audio file
//     const formData = new FormData();
//     formData.append("file", audioBlob, "recording.wav");

//     try {
//       // Send the audio file to the FastAPI endpoint
//       const response = await fetch("http://localhost:8000/fairnote/", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         displayFairNoteData(data);
//       } else {
//         console.error("Error sending file to server");
//         document.getElementById("message").innerText =
//           "Error processing audio. Please try again.";
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       document.getElementById("message").innerText =
//         "Error processing audio. Please try again.";
//     }
//   });

//   // Reset the record button image and stop the timer
//   document.getElementById("recordButton").querySelector("img").src =
//     "./start-recording.png";
//   stopTimer();
// }

function displayFairNoteData(data) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = `
        <h2>FairNote Summary</h2>
        <p><strong>Company Name:</strong> ${data.company_name}</p>
        <p><strong>Recruiter Name:</strong> ${data.recruiter_name}</p>
        <p><strong>Contact Details:</strong> ${data.contact_details}</p>
        <h3>Summary</h3>
        <p>${data.summary}</p>
        <h3>Follow-up Email</h3>
        <pre>${data.follow_up_email}</pre>
    `;
  saveConversation(data);
  addConversationCard(data);
}

function saveConversation(data) {
  let conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
  data.date = new Date().toISOString();
  conversations.unshift(data);
  localStorage.setItem("conversations", JSON.stringify(conversations));
}

function addConversationCard(data) {
  const card = document.createElement("div");
  card.className = "conversation-card";
  card.innerHTML = `
        <h3>${data.company_name}</h3>
        <p><strong>Recruiter:</strong> ${data.recruiter_name}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
    `;
  card.addEventListener("click", () => showConversationDetails(data));
  conversationsList.prepend(card);
}

function showConversationDetails(data) {
  modalContent.innerHTML = `
        <h2>${data.company_name}</h2>
        <p><strong>Recruiter Name:</strong> ${data.recruiter_name}</p>
        <p><strong>Contact Details:</strong> ${data.contact_details}</p>
        <h3>Summary</h3>
        <p>${data.summary}</p>
        <h3>Follow-up Email</h3>
        <pre id="followUpEmail">${data.follow_up_email}</pre>
        <button class="copy-btn" onclick="copyToClipboard()">Copy Email to Clipboard</button>
    `;
  modal.style.display = "block";
}

function copyToClipboard() {
  const followUpEmail = document.getElementById("followUpEmail");
  const textArea = document.createElement("textarea");
  textArea.value = followUpEmail.textContent;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  // Optional: Show a message that the text was copied
  alert("Follow-up email copied to clipboard!");
}

function startTimer() {
  recordingTime = 0; // Reset time
  document.getElementById("timer").innerText = formatTime(recordingTime);
  timerInterval = setInterval(() => {
    recordingTime++;
    document.getElementById("timer").innerText = formatTime(recordingTime);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.start();
  isRecording = true;

  document.getElementById("recordButton").querySelector("img").src =
    "./recording.png";
  startTimer();

  mediaRecorder.addEventListener("dataavailable", (event) => {
    audioChunks.push(event.data);
  });
}

async function stopRecording() {
  mediaRecorder.stop();
  isRecording = false;

  mediaRecorder.addEventListener("stop", async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("https://fairnote2.onrender.com/fairnote/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        displayFairNoteData(data);
      } else if (response.status === 401) {
        document.getElementById("message").innerText =
          "Session expired. Please login again.";
        setTimeout(() => (window.location.href = "index.html"), 2000);
      } else {
        console.error("Error sending file to server");
        document.getElementById("message").innerText =
          "Error processing audio. Please try again.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("message").innerText =
        "Error processing audio. Please try again.";
    }
  });

  document.getElementById("recordButton").querySelector("img").src =
    "./start-recording.png";
  stopTimer();

  recordingTime = 0;
  document.getElementById("timer").innerText = formatTime(recordingTime);
}

function loadPreviousConversations() {
  const conversations = JSON.parse(
    localStorage.getItem("conversations") || "[]",
  );
  conversations.forEach(addConversationCard);
}

loadPreviousConversations();
