const toggleButton = document.getElementById('toggleButton');

let audioContext;
let microphone;
let processor;
let isStarted = false;

toggleButton.addEventListener('click', async () => {
    if (!isStarted) {
        // Start the audio processing
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);

        // Create an AudioProcessor
        processor = audioContext.createScriptProcessor(1024, 1, 1);
        processor.onaudioprocess = (event) => {
            const inputBuffer = event.inputBuffer;
            const outputBuffer = event.outputBuffer;

            for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++) {
                const inputData = inputBuffer.getChannelData(channel);
                const outputData = outputBuffer.getChannelData(channel);

                for (let sample = 0; sample < inputBuffer.length; sample++) {
                    outputData[sample] = inputData[sample];
                }
            }
        };

        // Connect microphone to processor and processor to destination
        microphone.connect(processor);
        processor.connect(audioContext.destination);

        // Update button state
        toggleButton.textContent = 'Stop';
        isStarted = true;
    } else {
        // Stop the audio processing
        microphone.disconnect();
        processor.disconnect();
        audioContext.close();

        // Update button state
        toggleButton.textContent = 'Start';
        isStarted = false;
    }
});
