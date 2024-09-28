let mediaRecorder;
let audioChunks = [];
let recognition;
let isRecognizing = false;
let recordingTime = 0;
let timerInterval;
let isRecording = false; // Track recording state

document.getElementById('recordButton').addEventListener('click', toggleRecording);

// Check if browser supports Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.onstart = () => {
        isRecognizing = true;
        document.getElementById('message').innerText = 'Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('message').innerText = `Transcription: ${transcript}`;
        isRecognizing = false;
    };

    recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        isRecognizing = false;
    };

    recognition.onend = () => {
        isRecognizing = false;
    };
} else {
    alert('Speech recognition not supported in this browser.');
}

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();
    isRecording = true;

    document.getElementById('recordButton').querySelector('img').src = 'images/recording.png'; // Change to a recording image
    startTimer();

    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
    });

    // Start speech recognition
    if (!isRecognizing) {
        recognition.start();
    }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;

    mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = []; // Reset the audio chunks

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(audioBlob);
        downloadLink.download = 'recording.wav'; // Set the default file name
        document.body.appendChild(downloadLink); // Append to the body (required for Firefox)

        // Programmatically click the link to trigger the download
        downloadLink.click();

        // Remove the link after triggering the download
        document.body.removeChild(downloadLink);

        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = URL.createObjectURL(audioBlob);
        document.getElementById('message').appendChild(audioElement);

        // Stop speech recognition
        if (isRecognizing) {
            recognition.stop();
        }
    });

    // Reset the record button image and stop the timer
    document.getElementById('recordButton').querySelector('img').src = 'images/start-recording.png';
    stopTimer();
}


function startTimer() {
    recordingTime = 0; // Reset time
    document.getElementById('timer').innerText = formatTime(recordingTime);
    timerInterval = setInterval(() => {
        recordingTime++;
        document.getElementById('timer').innerText = formatTime(recordingTime);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
