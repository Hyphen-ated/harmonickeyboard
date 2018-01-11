var keycodeIsPressed = {}; // we're keeping track of all keys that are held down for easy reference.
var noteNameToHz = {}; // maps the name of a note like "#5" or "7b3" to the hz of that note given the current tonic. 
var octaveAdjustment = {}; // keep track of whether the user has pushed each note to a higher or lower tonic
var keyLetterToNoteName = {}; // maps a letter (or number) on the qwerty keyboard to the note name like "#5" that it should play
var mouseNoteName = 0; // note name of the button that's currently being clicked by the mouse

//set up the sound synthesizer. we're just going to pass this guy a hz and then tell it when to stop playing.
var synth = new Tone.PolySynth(8, Tone.Synth);
synth.set("volume", -30); 
var synthprops = {
	oscillator : {
  	type : 'triangle8'
  },
  envelope : {
  	attack : 0.03,
    decay : 1,
    sustain: 0.7,
    release: 2
  }
};
synth.set(synthprops);
synth.toMaster();


//changes the octave of the tone "hz" so it's between tonic and tonic*2
function octave(tonic, hz) {
    while(hz < tonic) {
        hz *= 2;                
    }
    while(hz > tonic * 2) {
        hz /= 2;
    }
    return hz;
}

function setTonic(hz) {
    noteNameToHz = {
        "1":   hz,
        "5":   octave(hz, hz*3),
        "2":   octave(hz, hz*3*3),
        "6+":  octave(hz, hz*3*3*3),
        "4":   octave(hz, hz/3),
        "b7-": octave(hz, hz/3/3),
        "3":   octave(hz, hz*5),
        "7":   octave(hz, hz*5*3),
        "#4+": octave(hz, hz*5*3*3),
        "6":   octave(hz, hz*5/3),
        "2-":  octave(hz, hz*5/3/3),
        "#5":  octave(hz, hz*5*5),
        "#2":  octave(hz, hz*5*5*3),
        "#1":  octave(hz, hz*5*5/3),
        "#7":  octave(hz, hz*5*5*5),
        "b6":  octave(hz, hz/5),
        "b3":  octave(hz, hz/5*3),
        "b7":  octave(hz, hz/5*3*3),
        "b2-": octave(hz, hz/5/3),
        "7b3": octave(hz, hz/3*7),
        "7b7": octave(hz, hz*7),
        "74+": octave(hz, hz*7*3),
        "7b5": octave(hz, hz/5*7),
    }
}


function playNote(noteName) {
    var hz = noteNameToHz[noteName];
    if(!hz) return;
    hz *= octaveAdjustment[noteName];
    console.log(hz);
    synth.triggerAttack(hz);
}

//iterate over all the buttons on the piano
document.querySelectorAll('.notekey').forEach(function(button){
    
    //the underlined part is the letter of the keyboard key to play that button.
    //this behavior is driven by that data in the html
    var keyboardKey = button.getElementsByTagName("u")[0].innerText;
    keyLetterToNoteName[keyboardKey] = button.id;
    octaveAdjustment[button.id] = 1;

	var hz = 0;
	button.addEventListener('mousedown', function(ev){
		//play the note on mouse down
		playNote(ev.target.id);
		mouseNoteName = ev.target.id;						
	})	
})

document.addEventListener('mouseup', function(e){
    if (mouseNoteName != 0) {
        var hz = noteNameToHz[mouseNoteName];
        hz *= octaveAdjustment[mouseNoteName];
        synth.triggerRelease(hz);
        mouseNoteName = 0;
    }
});


window.onkeydown = function(e) {   
    if(keycodeIsPressed[e.keyCode]) { 
        //ignore all auto-repeats
        return;
    } 
    keycodeIsPressed[e.keyCode] = true;
    if(mouseNoteName) {
        //they can change the octave of a button if they press shift/space while clicking it.
        if (e.keyCode == 16) { //shift    
            var hz = noteNameToHz[mouseNoteName] * octaveAdjustment[mouseNoteName];
            synth.triggerRelease(hz);
            octaveAdjustment[mouseNoteName] *= 2;
            playNote(mouseNoteName);
            return;            
        } else if (e.keyCode == 32) { //space
            var hz = noteNameToHz[mouseNoteName] * octaveAdjustment[mouseNoteName];
            synth.triggerRelease(hz);
            octaveAdjustment[mouseNoteName] /= 2;
            playNote(mouseNoteName);
            return;
        }
    }               
    
    var key = e.key.toUpperCase();       
    var note = keyLetterToNoteName[key];   
    if (!note) return; 
    document.getElementById(note).classList.add("keypressed");
    
    playNote(note);
}

window.onkeyup = function(e) {
    var wasPressed = keycodeIsPressed[e.keyCode];
    keycodeIsPressed[e.keyCode] = false;
    var key = e.key.toUpperCase();
    
    var note = keyLetterToNoteName[key];    
    if (!note) return;
    document.getElementById(note).classList.remove("keypressed");
        
    if(wasPressed) {
        synth.triggerRelease(noteNameToHz[note]);
    }
}

function updateTonic() {
    var hz = document.getElementById("tonicInput").value;
    setTonic(hz)
}

var noteDefinitions = 
    [
        ["C0", 16.35],
        ["C#0", 17.32],
        ["D0", 18.35],
        ["D#0", 19.45],
        ["E0", 20.60],
        ["F0", 21.83],
        ["F#0", 23.12],
        ["G0", 24.50],
        ["G#0", 25.96],
        ["A0", 27.50],
        ["A#0", 29.14],
        ["B0", 30.87],
        ["C1", 32.70],
        ["C#1", 34.65],
        ["D1", 36.71],
        ["D#1", 38.89],
        ["E1", 41.20],
        ["F1", 43.65],
        ["F#1", 46.25],
        ["G1", 49.00],
        ["G#1", 51.91],
        ["A1", 55.00],
        ["A#1", 58.27],
        ["B1", 61.74],
        ["C2", 65.41],
        ["C#2", 69.30],
        ["D2", 73.42],
        ["D#2", 77.78],
        ["E2", 82.41],
        ["F2", 87.31],
        ["F#2", 92.50],
        ["G2", 98.00],
        ["G#2", 103.83],
        ["A2", 110.00],
        ["A#2", 116.54],
        ["B2", 123.47],
        ["C3", 130.81],
        ["C#3", 138.59],
        ["D3", 146.83],
        ["D#3", 155.56],
        ["E3", 164.81],
        ["F3", 174.61],
        ["F#3", 185.00],
        ["G3", 196.00],
        ["G#3", 207.65],
        ["A3", 220.00],
        ["A#3", 233.08],
        ["B3", 246.94],
        ["C4", 261.63],
        ["C#4", 277.18],
        ["D4", 293.66],
        ["D#4", 311.13],
        ["E4", 329.63],
        ["F4", 349.23],
        ["F#4", 369.99],
        ["G4", 392.00],
        ["G#4", 415.30],
        ["A4", 440.00],
        ["A#4", 466.16],
        ["B4", 493.88],
        ["C5", 523.25],
        ["C#5", 554.37],
        ["D5", 587.33],
        ["D#5", 622.25],
        ["E5", 659.25],
        ["F5", 698.46],
        ["F#5", 739.99],
        ["G5", 783.99],
        ["G#5", 830.61],
        ["A5", 880.00],
        ["A#5", 932.33],
        ["B5", 987.77],
    ];

var keyDropdown = document.getElementById("keyDropdown");
for(var i =0; i < noteDefinitions.length; ++i) {
    def = noteDefinitions[i];
    var option = document.createElement("option");
    option.text = def[0];
    option.value = def[1];
    keyDropdown.add(option);
}
keyDropdown.value = "261.63";

function updateTonicDropdown() {
    var hz = keyDropdown.options[keyDropdown.selectedIndex].value;
    var inp = document.getElementById("tonicInput");
    inp.value = hz;
    setTonic(hz);
}

setTonic(261.63);
