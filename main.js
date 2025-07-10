let setting = null;

let freq = 0;

const input = document.getElementById('input');

// create web audio api elements
const audioCtx = new AudioContext(); //on or off
const gainNode = audioCtx.createGain(); //volume


// create Oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";
const color_picker = document.getElementById("color");
const vol_slider= document.getElementById('vol-slider');
//define canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //basically the screen

var width = ctx.canvas.width;
var height = ctx.canvas.height;


var counter = 0;

var interval = null;

var reset= false;

var timepernote = 0;
var length = 0;

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
    
    freq = pitch / 10000;
    gainNode.gain.setValueAtTime(vol_slider.value/100, audioCtx.currentTime);
    let localSetting= setInterval(() => {
        gainNode.gain.value = vol_slider.value/100;
    }, 1);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => {
        clearInterval(localSetting);
        gainNode.gain.value = 0;
        console.log("Ending note now");
    }, ((timepernote)-10));
}



function handle(){
    reset = true;
    audioCtx.resume();
    var usernotes= String(input.value);
    var noteslist = [];
    length = usernotes.length;
    timepernote = (6000/length);
    for (i = 0; i < usernotes.length; i++) {
        noteslist.push(notenames.get(usernotes.charAt(i)))
    }
    let j = 0;
    repeat = setInterval(() => {
        if(j<noteslist.length){
            frequency(parseInt(noteslist[j]));
            drawWave();
            j++
        }else{
            clearInterval(repeat)
        }
    }, timepernote)

    gainNode.gain.value=0;
    drawWave();
    //setTimeout(() => {
       
    //    gainNode.gain.value=0;
    //}, timepernote*noteslist.length);
}

function drawWave(){
    clearInterval(interval);
    if(reset){
        ctx.clearRect(0, 0, width, height);  //clears everything inside the canvas, to get rid of any past sine waves
        x = 0;
        y = height/2;
        ctx.moveTo(x, y);  //moves pointer to the left-most middle of the canvas, to draw a new wave from here
        ctx.beginPath(); //this method tells the computer that we’re ready to start painting
    }
    counter=0;
    interval = setInterval(line, 20);
    reset=false;
    
}

function line(){
    if(!freq) return;
    y = height/2 + ((vol_slider.value/100)*40*Math.sin(x*2*Math.PI*freq*0.5*length));
    ctx.lineTo(x, y);
    ctx.stroke();
    x=x+1;
     ctx.strokeStyle = color_picker.value;
    
    counter++;
    if(counter>(timepernote/20)){
        clearInterval(interval);
    }
    ctx.stroke();
}