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

const earValue =
document.getElementById("earValue");

let eyesClosedStart = null;
let drowsyDetected = false;

function playAlarm(){

const audioContext =
new (
window.AudioContext ||
window.webkitAudioContext
)();

const oscillator =
audioContext.createOscillator();

oscillator.frequency.value = 1000;

oscillator.connect(
audioContext.destination
);

oscillator.start();

setTimeout(() => {

oscillator.stop();

}, 500);

}

document
.getElementById("startButton")
.addEventListener("click", () => {

playAlarm();

});

function distance(p1,p2){

const dx = p1.x - p2.x;
const dy = p1.y - p2.y;

return Math.sqrt(
dx*dx + dy*dy
);

}

navigator.mediaDevices
.getUserMedia({
video:true
})
.then(stream=>{

video.srcObject = stream;

})
.catch(error=>{

console.error(error);

});

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
"✅ Face Detected";

const face =
results.multiFaceLandmarks[0];

face.forEach(point=>{

ctx.beginPath();

ctx.arc(
point.x * canvas.width,
point.y * canvas.height,
1.5,
0,
Math.PI*2
);

ctx.fillStyle =
"#00ffff";

ctx.fill();

});

const nose =
face[1];

if(nose.x < 0.45){

headPose.innerHTML =
"➡ Looking Right";

}
else if(nose.x > 0.55){

headPose.innerHTML =
"⬅ Looking Left";

}
else{

headPose.innerHTML =
"⬆ Looking Forward";

}

const leftTop = face[159];
const leftBottom = face[145];
const leftLeft = face[33];
const leftRight = face[133];

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

earValue.innerHTML =
EAR.toFixed(2);

if(EAR < 0.28){

if(!eyesClosedStart){

eyesClosedStart =
Date.now();

}

const closedTime =
Date.now() -
eyesClosedStart;

if(closedTime > 1000){

drowsiness.innerHTML =
"🚨 DROWSY";

if(!drowsyDetected){

drowsyDetected = true;

playAlarm();

}

}

}
else{

eyesClosedStart = null;

drowsiness.innerHTML =
"✅ Normal";

drowsyDetected = false;

}

}
else{

faceStatus.innerHTML =
"❌ No Face";

headPose.innerHTML = "-";

drowsiness.innerHTML = "-";

earValue.innerHTML = "-";

}

});

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
