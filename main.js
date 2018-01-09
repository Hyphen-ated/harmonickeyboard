props = {
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

var synth = new Tone.PolySynth(8, Tone.Synth);
synth.set("volume", -30); 
synth.set(props);

synth.toMaster();

var vol = new Tone.Volume(-24);


var keyboard = {};

noteMapping = {}

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
    noteMapping = {
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

keyMapping = {};
pressedKeys = {};
mouseHz = -1;
document.querySelectorAll('.notekey').forEach(function(button){

    var keyboardKey = button.getElementsByTagName("u")[0].innerText;
    keyMapping[keyboardKey] = button.id;

	var hz = 0;
	button.addEventListener('mousedown', function(ev){
		//play the note on mouse down
		hz = noteMapping[ev.target.id];
		if(keyboard[16]) { //shift to octave up
		    hz *= 2;
		} else if (keyboard[32]) { //space to octave down
		    hz /= 2;
		}
		console.log(hz);
		mouseHz = hz;
		synth.triggerAttack(hz);
						
	})
	
})

document.addEventListener('mouseup', function(e){
    if (mouseHz > 0) {
        synth.triggerRelease(mouseHz);
        mouseHz = -1;
    }
});


window.onkeydown = function(e) {    
    keyboard[e.keyCode] = true;
    var key = e.key.toUpperCase();
    if(pressedKeys[key]) return;
    
    var note = keyMapping[key];   
    if (!note) return; 
    document.getElementById(note).classList.add("keypressed");
    
    var hz = noteMapping[note];
    if (!hz) return;
    if(keyboard[16]) { //shift to octave up
        hz *= 2;
    } else if (keyboard[32]) { //space to octave down
        hz /= 2;
    }
    console.log(hz);
    synth.triggerAttack(hz);
    pressedKeys[key] = hz;
}

window.onkeyup = function(e) {
    keyboard[e.keyCode] = false;
    var key = e.key.toUpperCase();
    
    var note = keyMapping[key];    
    if (!note) return;
    document.getElementById(note).classList.remove("keypressed");
        
    var hz = pressedKeys[key];
    if(hz && hz > 0) {
        synth.triggerRelease(hz);
    }
    pressedKeys[key] = false;
}

function updateTonic() {
    var hz = document.getElementById("tonicInput").value;
    setTonic(hz)
}

setTonic(261.63);
