let setting = null;

let freq = 0;

const input = document.getElementById('input');
const audioCtx = new AudioContext(); 
const gainNode = audioCtx.createGain(); 


const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";
const colorPicker = document.getElementById("color");
const volSlider= document.getElementById('vol-slider');

const waveformSelect = document.getElementById("waveform");

const recordingToggle = document.getElementById('record');

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); 

var width = ctx.canvas.width;
var height = ctx.canvas.height;


var counter = 0;

var interval = null;

var reset= false;

var timePerNote = 0;
var length = 0;

var blob, recorder = null;
var chunks = [];

ctx.lineWidth = 2.5;
ctx.lineJoin = 'round';
ctx.lineCap = 'round';

notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);


oscillator.start();
gainNode.gain.value=0;


function frequency(pitch) {
    freq = pitch / 10000;
    oscillator.type = waveformSelect.value;
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);

    const gain = volSlider.value / 100;
    const startTime = audioCtx.currentTime;
    const stopTime = startTime + (timePerNote- 10) / 1000; // convert ms to sec

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, stopTime);

    console.log("Note from", startTime.toFixed(3), "to", stopTime.toFixed(3));
}




function handle() {
    reset = true;
    audioCtx.resume();

    const usernotes = String(input.value);
    const noteslist = [];
    length = usernotes.length;
    timePerNote = 6000 / length;

    for (let i = 0; i < length; i++) {
        noteslist.push(notenames.get(usernotes.charAt(i)));
    }

    const now = audioCtx.currentTime;
    let totalDelay = 0;

    noteslist.forEach((pitch, index) => {
        const noteStart = now + totalDelay / 1000; 
        setTimeout(() => {
            freq=pitch/10000;
            scheduleNote(pitch, audioCtx.currentTime);
            drawWave()
        }, totalDelay);
        totalDelay += timePerNote;
    });

    gainNode.gain.value = 0;
    drawWave();
}

/*

*/
function drawWave(){
    clearInterval(interval);
    if(reset){
        ctx.clearRect(0, 0, width, height);  
        
        x = 0;
        y = height/2;
        ctx.moveTo(x, y);  
        ctx.beginPath(); 
    }
    counter=0;
    interval = setInterval(line, 20);
    reset=false;
    
}

function line(){
    const waveColor = colorPicker.value;
    ctx.strokeStyle = waveColor;
    ctx.shadowBlur=20;
    ctx.shadowColor=waveColor;
    ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(x,y);
    if(!freq) return;
    y = height/2 + ((volSlider.value/100)*40*Math.sin(x*2*Math.PI*freq*0.5*length));
    ctx.lineTo(x, y);
    ctx.stroke();
    x=x+1;
     ctx.strokeStyle = colorPicker.value;
    
    counter++;
    if(counter>(timePerNote/20)){
        clearInterval(interval);
        ctx.shadowBlur=0;
    }
    ctx.stroke();
}

function scheduleNote(pitch, startTime) {
    freq = pitch / 10000;
    oscillator.type = waveformSelect.value;
    oscillator.frequency.setValueAtTime(pitch, startTime);

    const gain = volSlider.value / 100;
    const release = 0.01;

    const stopTime = startTime + (timePerNote - 10) / 1000;

    gainNode.gain.cancelScheduledValues(startTime);


    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
    gainNode.gain.setValueAtTime(gain, stopTime - release);
    gainNode.gain.linearRampToValueAtTime(0, stopTime);

    console.log(`Scheduled ${pitch}Hz at ${startTime.toFixed(3)}s`);
}

function startRecording(){
    const canvasStream = canvas.captureStream(20);
    const audioDestination = audioCtx.createMediaStreamDestination();
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track =>
    combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    gainNode.connect(audioDestination);
    recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm'});
    recorder.ondataavailable = e => {
    if (e.data.size > 0) {
        chunks.push(e.data);
    }
    };


    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);

    };
    recorder.start();
}

var is_recording = false;
function toggle(){
    is_recording = !is_recording
    if(is_recording){
        recordingToggle.innerHTML = "Stop Recording";
        startRecording();
    } else {
        recordingToggle.innerHTML = "Start Recording";
        recorder.stop();
    }
}
