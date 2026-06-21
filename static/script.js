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

const faceMesh =
new FaceMesh({

    locateFile:file=>
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
        "Face Detected";

        const face =
        results.multiFaceLandmarks[0];

        face.forEach(point=>{

            ctx.beginPath();

            ctx.arc(
                point.x * canvas.width,
                point.y * canvas.height,
                2,
                0,
                Math.PI*2
            );

            ctx.fillStyle =
            "#00ffff";

            ctx.fill();

        });

        const nose =
        face[1];

        if(nose.x < 0.4){

            headPose.innerHTML =
            "⬅ Looking Left";

        }
        else if(nose.x > 0.6){

            headPose.innerHTML =
            "➡ Looking Right";

        }
        else{

            headPose.innerHTML =
            "⬆ Looking Forward";

        }

    }
    else{

        faceStatus.innerHTML =
        "No Face";

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
