const video = document.getElementById('camera');

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video:true})
    .then(function(stream) {
        video.srcObject = stream;
    })
    .catch(err => {
        console.log(err);
    });
}