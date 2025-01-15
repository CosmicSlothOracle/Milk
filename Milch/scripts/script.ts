document.addEventListener('DOMContentLoaded', function() {
    const videoElement = document.getElementById('bgVideo');
    const canvas = document.getElementById('audioVisualizer');
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    let audioSource = null;
    let analyser = null;

    function togglePlay() {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }

    window.togglePlay = togglePlay; // Expose to global scope for button

    if (navigator.mediaDevices.getUserMedia) {
        try {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                .then(function(stream) {
                    if (!audioSource) {
                        audioSource = audioContext.createMediaStreamSource(stream);
                        analyser = audioContext.createAnalyser();
                        audioSource.connect(analyser);
                        analyser.connect(audioContext.destination);
                        visualize();
                    }
                });
        } catch (e) {
            console.error(e);
        }
    }

    function visualize() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(0, 255, 0)';

            ctx.beginPath();

            let sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {

                let v = dataArray[i] / 128.0;
                let y = v * HEIGHT/2;

                if(i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();
        }

        draw();
    }
});
