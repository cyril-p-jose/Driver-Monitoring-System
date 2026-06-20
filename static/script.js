const yawning =
document.getElementById("yawning");


const video = document.getElementById("video");

const drowsiness =
document.getElementById("drowsiness");

const faceStatus =
document.getElementById("faceStatus");

const alarm = new Audio("/static/alarm.mp3");

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

let eyesClosedStart = null;

// Distance between two landmarks
function distance(p1, p2){

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;

    return Math.sqrt(dx * dx + dy * dy);
}

faceMesh.onResults(results => {

    if(
        results.multiFaceLandmarks &&
        results.multiFaceLandmarks.length > 0
    ){

        faceStatus.innerHTML =
        "Face Detected";

        const face =
        results.multiFaceLandmarks[0];

        // Left Eye Landmarks
        const leftTop = face[159];
        const leftBottom = face[145];
        const leftLeft = face[33];
        const leftRight = face[133];

        const eyeHeight =
        distance(leftTop, leftBottom);

        const eyeWidth =
        distance(leftLeft, leftRight);

        const EAR =
        eyeHeight / eyeWidth;

        console.log("EAR:", EAR);

        if(EAR < 0.15){

            if(!eyesClosedStart){

                eyesClosedStart =
                Date.now();

            }

            const closedTime =
            Date.now() - eyesClosedStart;

            if(closedTime > 2000){

                drowsiness.innerHTML =
                "🚨 DROWSINESS DETECTED";

                alarm.play();
            }

        }
        else{

            eyesClosedStart = null;

            drowsiness.innerHTML =
            "Normal";
        }

    }
    else{

        faceStatus.innerHTML =
        "No Face";

        drowsiness.innerHTML =
        "No Face";
    }

});

video.addEventListener(
"loadeddata",
async () => {

    async function detect(){

        await faceMesh.send({
            image: video
        });

        requestAnimationFrame(detect);
    }

    detect();
});
