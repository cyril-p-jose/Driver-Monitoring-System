const video = document.getElementById("video");

const drowsiness =
document.getElementById("drowsiness");

const faceStatus =
document.getElementById("faceStatus");

navigator.mediaDevices
.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
});

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

let lastFaceTime = Date.now();

faceMesh.onResults(results => {

    if(results.multiFaceLandmarks &&
       results.multiFaceLandmarks.length > 0){

        faceStatus.innerHTML =
        "Face Detected";

        drowsiness.innerHTML =
        "Normal";

        lastFaceTime = Date.now();

    }
    else{

        faceStatus.innerHTML =
        "No Face";

        if(Date.now() - lastFaceTime > 3000){

            drowsiness.innerHTML =
            "ALERT";

        }

    }

});

video.addEventListener("loadeddata", async () => {

    async function detect(){

        await faceMesh.send({
            image: video
        });

        requestAnimationFrame(detect);
    }

    detect();

});
