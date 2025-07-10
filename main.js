const input = document.getElementById('input');

// create web audio api elements
const audioCtx = new AudioContext(); //on or off
const gainNode = audioCtx.createGain(); //volume


// create Oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

//define canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //basically the screen

var amplitude = 40;

var counter = 0;

var interval = null;

//mapping notes to frequency
notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);


//Silencing volume at the beginning
oscillator.start();
gainNode.gain.value=0;


function frequency(pitch){
    
    freq=pitch/10000;

    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime+1);

}



function handle(){
    
    var usernotes= String(input.value);
    frequency(notenames.get(usernotes));

    audioCtx.resume();
    gainNode.gain.value=0;
    frequency(input.value);
    drawWave();
   
}

function drawWave(){
    ctx.clearRect(0, 0, width, height);  //clears everything inside the canvas, to get rid of any past sine waves
    x = 0;
    y = height/2;
    ctx.moveTo(x, y);  //moves pointer to the left-most middle of the canvas, to draw a new wave from here
    ctx.beginPath(); //this method tells the computer that we’re ready to start painting
    counter=0;
    interval = setInterval(line, 20);
    if(counter>50){
        clearInterval(interval);
    }
}

function line(){
    y = height/2 + (amplitude*Math.sin(x*2*Math.PI*freq));
    ctx.lineTo(x, y);
    ctx.stroke();
    x=x+1;

    counter++;
}