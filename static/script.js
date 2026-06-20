const headPose =
document.getElementById("headPose");

const historyList =
document.getElementById("history");
function addHistory(message){

    const item =
    document.createElement("li");

    const time =
    new Date().toLocaleTimeString();

    item.innerHTML =
    `${time} - ${message}`;

    historyList.prepend(item);
}
addHistory(
"🚨 Drowsiness Detected"
);
addHistory(
"🥱 Yawning Detected"
);


const scoreElement =
document.getElementById("score");

let score = 100;
let lastPenaltyTime = 0;

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
     const nose = face[1];

if(nose.x < 0.40){

    headPose.innerHTML =
    "⬅ Looking Left";

    addHistory(
        "⚠ Looking Left"
    );

    if(Date.now() - lastPenaltyTime > 5000){

        score = Math.max(0, score - 2);

        scoreElement.innerHTML = score;

        lastPenaltyTime = Date.now();
    }

}
else if(nose.x > 0.60){

    headPose.innerHTML =
    "➡ Looking Right";

    addHistory(
        "⚠ Looking Right"
    );

    if(Date.now() - lastPenaltyTime > 5000){

        score = Math.max(0, score - 2);

        scoreElement.innerHTML = score;

        lastPenaltyTime = Date.now();
    }

}
else{

    headPose.innerHTML =
    "⬆ Looking Forward";

}
        // Mouth landmarks

const mouthTop = face[13];
const mouthBottom = face[14];

const mouthLeft = face[78];
const mouthRight = face[308];

const mouthHeight =
distance(mouthTop, mouthBottom);

const mouthWidth =
distance(mouthLeft, mouthRight);

const MAR =
mouthHeight / mouthWidth;

if(MAR > 0.30){

  yawning.innerHTML =
"🥱 Yawning";

setStatusColor(
    yawning,
    "warning"
);
    if(Date.now() - lastPenaltyTime > 5000){

    score = Math.max(0, score - 5);

    scoreElement.innerHTML = score;

    lastPenaltyTime = Date.now();
}

}
else{

    yawning.innerHTML =
    "No";

}

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

setStatusColor(
    drowsiness,
    "danger"
);
                if(Date.now() - lastPenaltyTime > 5000){

    score = Math.max(0, score - 10);

    scoreElement.innerHTML = score;

    lastPenaltyTime = Date.now();
}

                alarm.play();
            }

        }
        else{

            eyesClosedStart = null;

           drowsiness.innerHTML =
"Normal";

setStatusColor(
    drowsiness,
    "normal"
);
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

function setStatusColor(element, type){

    if(type === "normal"){

        element.style.color =
        "#22c55e";

    }
    else if(type === "warning"){

        element.style.color =
        "#facc15";

    }
    else{

        element.style.color =
        "#ef4444";
    }
}
