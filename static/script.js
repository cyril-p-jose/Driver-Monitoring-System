// =========================
// ELEMENTS
// =========================

const video =
document.getElementById("video");

const canvas =
document.getElementById("canvas");

const ctx =
canvas.getContext("2d");

const faceStatus =
document.getElementById("faceStatus");

const headPose =
document.getElementById("headPose");

const drowsiness =
document.getElementById("drowsiness");

const yawning =
document.getElementById("yawning");

const scoreElement =
document.getElementById("score");

const drowsyCountElement =
document.getElementById("drowsyCount");

const yawnCountElement =
document.getElementById("yawnCount");

const historyList =
document.getElementById("history");

// =========================
// VARIABLES
// =========================

let score = 100;

let drowsyCount = 0;
let yawnCount = 0;

let drowsyDetected = false;
let yawnDetected = false;

let eyesClosedStart = null;

let lastPenaltyTime = 0;

// =========================
// ALARM
// =========================

const alarm =
new Audio("/static/alarm.mp3");

alarm.loop = true;

// =========================
// HISTORY
// =========================

function addHistory(message){

    if(!historyList) return;

    const item =
    document.createElement("li");

    const time =
    new Date().toLocaleTimeString();

    item.innerHTML =
    `${time} - ${message}`;

    historyList.prepend(item);

    while(historyList.children.length > 20){

        historyList.removeChild(
            historyList.lastChild
        );
    }
}

// =========================
// SCORE
// =========================

function reduceScore(points){

    if(
        Date.now() -
        lastPenaltyTime <
        5000
    ){
        return;
    }

    score =
    Math.max(
        0,
        score - points
    );

    scoreElement.innerHTML =
    score;

    lastPenaltyTime =
    Date.now();
}

// =========================
// COLORS
// =========================

function setStatusColor(
    element,
    type
){

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

// =========================
// DISTANCE
// =========================

function distance(
    p1,
    p2
){

    const dx =
    p1.x - p2.x;

    const dy =
    p1.y - p2.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

// =========================
// CAMERA
// =========================

navigator.mediaDevices
.getUserMedia({
    video:true
})
.then(stream=>{

    video.srcObject =
    stream;

    video.play();

    console.log(
        "Camera Started"
    );

})
.catch(error=>{

    console.error(
        "Camera Error:",
        error
    );

});

// =========================
// MEDIAPIPE
// =========================

const faceMesh =
new FaceMesh({

    locateFile:file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`

});

faceMesh.setOptions({

    maxNumFaces:1,

    refineLandmarks:true,

    minDetectionConfidence:0.5,

    minTrackingConfidence:0.5

});

// =========================
// RESULTS
// =========================

faceMesh.onResults(results=>{

    canvas.width =
    video.videoWidth;

    canvas.height =
    video.videoHeight;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if(
        results.multiFaceLandmarks &&
        results.multiFaceLandmarks.length > 0
    ){

        faceStatus.innerHTML =
        "Face Detected";

        setStatusColor(
            faceStatus,
            "normal"
        );

        const face =
        results.multiFaceLandmarks[0];

        // =====================
        // DRAW LANDMARKS
        // =====================

        face.forEach(point=>{

            ctx.beginPath();

            ctx.arc(
                point.x *
                canvas.width,

                point.y *
                canvas.height,

                1.5,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
            "#00ffff";

            ctx.fill();

        });

        // =====================
        // HEAD POSE
        // =====================

        const nose =
        face[1];

        const leftCheek =
        face[234];

        const rightCheek =
        face[454];

        const leftDistance =
        Math.abs(
            nose.x -
            leftCheek.x
        );

        const rightDistance =
        Math.abs(
            rightCheek.x -
            nose.x
        );

        if(
            leftDistance >
            rightDistance + 0.03
        ){

            headPose.innerHTML =
            "➡ Looking Right";

        }
        else if(
            rightDistance >
            leftDistance + 0.03
        ){

            headPose.innerHTML =
            "⬅ Looking Left";

        }
        else{

            headPose.innerHTML =
            "⬆ Looking Forward";

        }

        // =====================
        // YAWNING
        // =====================

        const mouthTop =
        face[13];

        const mouthBottom =
        face[14];

        const mouthLeft =
        face[78];

        const mouthRight =
        face[308];

        const mouthHeight =
        distance(
            mouthTop,
            mouthBottom
        );

        const mouthWidth =
        distance(
            mouthLeft,
            mouthRight
        );

        const MAR =
        mouthHeight /
        mouthWidth;

        if(MAR > 0.30){

            yawning.innerHTML =
            "🥱 Yawning";

            setStatusColor(
                yawning,
                "warning"
            );

            if(!yawnDetected){

                yawnDetected =
                true;

                yawnCount++;

                yawnCountElement.innerHTML =
                yawnCount;

                addHistory(
                    "🥱 Yawning Detected"
                );

                reduceScore(5);
            }

        }
        else{

            yawning.innerHTML =
            "No";

            setStatusColor(
                yawning,
                "normal"
            );

            yawnDetected =
            false;
        }

        // =====================
        // DROWSINESS
        // =====================

        const leftTop =
        face[159];

        const leftBottom =
        face[145];

        const leftLeft =
        face[33];

        const leftRight =
        face[133];

        const eyeHeight =
        distance(
            leftTop,
            leftBottom
        );

        const eyeWidth =
        distance(
            leftLeft,
            leftRight
        );

        const EAR =
        eyeHeight /
        eyeWidth;

        if(EAR < 0.15){

            if(
                !eyesClosedStart
            ){

                eyesClosedStart =
                Date.now();
            }

            const closedTime =
            Date.now() -
            eyesClosedStart;

            if(
                closedTime >
                2000
            ){

                drowsiness.innerHTML =
                "🚨 DROWSINESS";

                setStatusColor(
                    drowsiness,
                    "danger"
                );

                if(
                    !drowsyDetected
                ){

                    drowsyDetected =
                    true;

                    drowsyCount++;

                    drowsyCountElement.innerHTML =
                    drowsyCount;

                    addHistory(
                        "🚨 Drowsiness Detected"
                    );

                    reduceScore(10);

                    alarm.play()
                    .catch(()=>{});
                }

            }

        }
        else{

            eyesClosedStart =
            null;

            drowsiness.innerHTML =
            "Normal";

            setStatusColor(
                drowsiness,
                "normal"
            );

            drowsyDetected =
            false;

            alarm.pause();

            alarm.currentTime =
            0;
        }

    }
    else{

        faceStatus.innerHTML =
        "No Face";

        setStatusColor(
            faceStatus,
            "danger"
        );

        drowsiness.innerHTML =
        "No Face";

        headPose.innerHTML =
        "-";

        alarm.pause();

        alarm.currentTime =
        0;
    }

});

// =========================
// START DETECTION
// =========================

video.addEventListener(
"loadeddata",
async ()=>{

    async function detect(){

        await faceMesh.send({
            image:video
        });

        requestAnimationFrame(
            detect
        );
    }

    detect();

});
