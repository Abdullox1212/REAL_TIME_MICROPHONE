const toggleButton = document.getElementById('toggleButton');
const microphoneSelect = document.getElementById('microphoneSelect');
const speakerSelect = document.getElementById('speakerSelect');

let audioContext;
let microphone;
let processor;
let isStarted = false;

async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const microphones = devices.filter(device => device.kind === 'audioinput');
    const speakers = devices.filter(device => device.kind === 'audiooutput');

    microphones.forEach((mic, index) => {
        const option = document.createElement('option');
        option.value = mic.deviceId;
        option.text = mic.label || `Microphone ${index + 1}`;
        microphoneSelect.appendChild(option);
    });

    speakers.forEach((speaker, index) => {
        const option = document.createElement('option');
        option.value = speaker.deviceId;
        option.text = speaker.label || `Speaker ${index + 1}`;
        speakerSelect.appendChild(option);
    });
}

async function startAudioProcessing() {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Get the selected microphone ID
        const micId = microphoneSelect.value;
        const constraints = { audio: { deviceId: micId ? { exact: micId } : undefined } };

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Create media stream source
        microphone = audioContext.createMediaStreamSource(stream);

        // Create script processor
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
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Error accessing microphone: ' + error.message);
    }
}

toggleButton.addEventListener('click', async () => {
    if (!isStarted) {
        await startAudioProcessing();
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

getDevices();
