const video = document.getElementById("video");
const statusText = document.getElementById("drowsiness");

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

faceMesh.onResults(results => {

    if(results.multiFaceLandmarks &&
       results.multiFaceLandmarks.length > 0){

        statusText.innerHTML =
        "Face Detected";

    }
    else{

        statusText.innerHTML =
        "No Face";

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
