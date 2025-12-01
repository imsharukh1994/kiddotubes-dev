const video = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const fullBtn = document.getElementById("fullBtn");

// Get VIDEO_ID from URL
const videoId = new URLSearchParams(window.location.search).get("video");

// Set video source from proxy
video.src = `http://localhost:4000/stream?id=${videoId}`;


// Play / Pause
playBtn.onclick = () => {
    if (video.paused) {
        video.play();
        playBtn.textContent = "⏸";
    } else {
        video.pause();
        playBtn.textContent = "▶";
    }
};

// Volume control
volumeBar.oninput = () => {
    video.volume = volumeBar.value;
};

// Seek bar update
video.addEventListener("timeupdate", () => {
    seekBar.value = (video.currentTime / video.duration) * 100;
});

// Seek video
seekBar.oninput = () => {
    video.currentTime = (seekBar.value / 100) * video.duration;
};

// Fullscreen
fullBtn.onclick = () => {
    video.requestFullscreen();
};
