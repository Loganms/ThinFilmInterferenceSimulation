(function () {

if (typeof(ThinFilm) == 'undefined') window.ThinFilm = {};
ThinFilm.init = init;


firstDraw = true;
shouldDraw = false;
lineColor = {};
scale = {};
n1 = {}; 
n2 = {}; 
n3 = {};
allSources = [true, false, false];
redDivs = [document.getElementById("incidentR"), document.getElementById("reflectedR"), document.getElementById("transmittedR")];
greenDivs = [document.getElementById("incidentG"), document.getElementById("reflectedG"), document.getElementById("transmittedG")];
blueDivs = [document.getElementById("incidentB"), document.getElementById("reflectedB"), document.getElementById("transmittedB")];
netDivs = [document.getElementById("incidentNet"), document.getElementById("reflectedNet"), document.getElementById("transmittedNet")];
allDivs = [redDivs, greenDivs, blueDivs, netDivs];
allWavelengths = [660/12.7, 540/12.7, 440/12.7];
defaultSpeed = .010;
defaultResolution = 10;
lineResolution = defaultResolution * 1;


var scale1, scale2, amplitude = 40, wavelengthsIn1, wavelengthsIn2, 
    canvas, context,
    height, width, xAxis,
	divBackground = ["red", "lime", "blue"],
    millisBetweenFrames = 30, draw;

/**
 * Init function.
 * 
 * Initialize variables and begin the animation.
 */
function init() {
    
    canvas = document.getElementById("sineCanvas");
    
    canvas.width = 1020;
    canvas.height = 600;
    
    context = canvas.getContext("2d");
    context.font = '18px sans-serif';
    context.strokeStyle = '#000';
    context.lineJoin = 'round';
    
    height = canvas.height/3;
    width = canvas.width;
    
    xAxis = Math.floor(height/2);
	
	// Default form values
	lineColor = "Red";
	
	scale = 660/12.7;
	
	n1.value = 1; 
	n2.value = 1.6; 
	n3.value = 1.33;
	
	// Visual film thickness is .5 scale of actual value (default 400)
	n2.width = 200;
	n3.width = Math.floor(width/3);
	n1.width = width - n2.width - n3.width;
    
    context.save();
    draw();
}

/**
 * Draw animation function.
 * 
 * This function draws one frame of the animation, waits 30ms, and then calls
 * itself again.
 */
draw = function () {
    if (shouldDraw || firstDraw){
		
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
	
	// Draw thin films
	drawThinFilms();

    // Draw the axes in their own path
    context.beginPath();
    drawAxes();
    context.stroke();
    
    // Set styles for animated graphics
    context.save();
    context.strokeStyle = lineColor;
    context.fillStyle = '#fff';
    context.lineWidth = 2;

    // Draw the sine curve at time draw.t.
    context.beginPath();
    drawSineWaves(draw.t);
	context.stroke();

	// Update interference results
	calculateResults();
	
    // Restore original styles
    context.restore();
    
    // Update the time and draw again
	if (firstDraw){
		firstDraw = false;
	} else {
		draw.seconds = draw.seconds - drawSpeed;
	}
    
    draw.t = draw.seconds*Math.PI;
	}
	
    setTimeout(draw, millisBetweenFrames);
	
};
draw.seconds = 0;
drawSpeed = defaultSpeed;
draw.t = 0;

/**
 *Function to draw thin film rectangles
 */
function drawThinFilms() {
	context.save();
	
	context.fillStyle = '#ffbbcc';
	context.fillRect (width- n3.width, 0, width, canvas.height);
	
	n2.width = document.getElementById("thicknessSlider").value/2;
	
	context.fillStyle = '#d9ccff';
	context.fillRect(width - n3.width - n2.width, 0, n2.width, canvas.height);
	
	n1.width = width - n2.width - n3.width;
	
	context.fillStyle = '#ffffcc';
	context.fillRect(0, 0, n1.width, canvas.height);
	
	context.restore();
}

/**
 * Function to draw axes
 */
function drawAxes() {
    
	scale1 = scale/n1.value;
	
    // Draw 3 X Axes
    context.moveTo(0, xAxis);
    context.lineTo(width, xAxis);
	context.moveTo(0, xAxis*3);
	context.lineTo(n1.width, xAxis*3);
	context.moveTo(0, xAxis*5);
	context.lineTo(width - n3.width, xAxis*5);
    
    // Draw X axis tick at PI
    context.moveTo(Math.PI*scale1, xAxis+5);
    context.lineTo(Math.PI*scale1, xAxis-5);
	context.moveTo(Math.PI*scale1, xAxis*3+5);
    context.lineTo(Math.PI*scale1, xAxis*3-5);
	context.moveTo(Math.PI*scale1, xAxis*5+5);
    context.lineTo(Math.PI*scale1, xAxis*5-5);
}

/**
 * Function to draw sine
 * 
 * The sine curve is drawn in 10px segments starting at the origin. 
 */
function drawSineWaves(t) {
	
	n1.value = document.getElementById("n1ValueSlider").value;
	n2.value = document.getElementById("n2ValueSlider").value;
	n3.value = document.getElementById("n3ValueSlider").value;

	drawIncidentWave(t);
	drawReflectedWave1(t);
	drawReflectedWave2(t);
    
}

function drawIncidentWave(t) {

	// Set the initial x and y, starting at 0,0 and translating to the origin on
    // the canvas.
	
    var x = t;
    var y = -Math.sin(x);
    context.moveTo(0, amplitude*y+xAxis);
    

    // Loop to draw segments through first medium
    for (i = 0; i <= n1.width; i += lineResolution) {
		// Subtract from t to move wave left
        x = t+i/scale1;
		// Times y by -1 to shift phase by PI
        y = -Math.sin(x);
        context.lineTo(i, amplitude*y+xAxis);
    }
	
	// Since scale determines PI marking, 2*Scale is the initial wavelength
	// Find new wavelength for the new medium.
	
	scale2 = scale/n2.value;
	wavelengthsIn1 = n1.width/(2*Math.PI*scale1);
	
	var phaseShift = wavelengthsIn1*Math.PI*2;
	
	// Loop to draw segments through second medium
	for (i = 0; i <= n2.width; i+=lineResolution) {
		x = t+(i/scale2);
		// Phase shift by number of wavelengths already completed in the first medium
		y = -Math.sin(x + phaseShift);
        context.lineTo(i + n1.width, amplitude*y+xAxis);
	}
	
	var scale3 = scale/n3.value;
	wavelengthsIn2 = n2.width/(2*Math.PI*scale2);
	
	phaseShift = (wavelengthsIn1+wavelengthsIn2)*Math.PI*2;
	
	// Loop to draw segments through third medium
	for (i = 0; i <= n3.width; i+=lineResolution) {
		x = t+(i/scale3);
		// Phase shift by number of wavelengths already completed in the first medium
		y = -Math.sin(x + phaseShift);
        context.lineTo(width - n3.width + i, amplitude*y+xAxis);
	}
}

function drawReflectedWave1(t) {

	var phaseShift = wavelengthsIn1*2*Math.PI;

	// Set the initial x and y, starting the function where the incident wave left off 
	// (i.e. Phase shift Y by amount of wavelengths already completed in the first medium).
	
    var x = t;
	
	// Default y behavior assumes the second medium has a greater value than the first so y is negative
	// of incident wave by not multiplying by -1. (see incident wave declaration of y variable includes a negative)
    var y = Math.sin(x + phaseShift);
	
	// Invert y (Phase shift by PI) by multiplying by -1.
	
	if (!(n2.value > n1.value)) {
		y = -y;
	} 
	
	var xDrawOffset = xAxis*3;
    context.moveTo(n1.width, amplitude*y + xDrawOffset);
    
    // Loop to draw segments through first medium
    for (i = 0; i <= n1.width; i += lineResolution) {
        x = t+i/scale1;
		y = Math.sin(x + phaseShift);
        if (!(n2.value > n1.value)) {
			y = -y;
		}
	
		// Reflect the wave across the Y axis by drawing from the first boundary to "0".
		context.lineTo(n1.width - i, amplitude*y + xDrawOffset);
	
    }
}

function drawReflectedWave2(t) {
	
	var phaseShift = (wavelengthsIn1+wavelengthsIn2)*2*Math.PI;
	
	// Set the initial x and y, starting the function where the incident wave left off 
	// (i.e. Phase shift Y by amount of wavelengths already completed in the first and second medium).
	
	var x = t;
	
	// Default y behavior assumes the third medium has a greater value than the second so y is negative
	// of incident wave by not multiplying by -1. (see incident wave declaration of y variable includes a negative)
	
    var y = Math.sin(x + phaseShift);
	
	// Invert y (Phase shift by PI) by multiplying by -1 if .
	
	var isReflectedByHigherMedium = false;
	if (!(n3.value > n2.value)) {
		isReflectedByHigherMedium = true;
		y = -y;
	} 
	
	var xDrawOffset = xAxis*5;
	
	context.moveTo(width - n3.width, amplitude*y + xDrawOffset);
	
	// Loop to draw segments through second medium
	for (i = 0; i <= n2.width; i+=lineResolution) {
		x = t+(i/scale2);
		// Phase shift by number of wavelengths already completed in the first medium
		y = Math.sin(x + phaseShift);
		if (isReflectedByHigherMedium) {
			y = -y;
		} 
		
		// Reflect the wave across the Y axis by drawing from the second boundary to the first "0".
        context.lineTo((n1.width + n2.width) - i, amplitude*y + xDrawOffset);
	}
	
	phaseShift = (wavelengthsIn1 + wavelengthsIn2*2)*2*Math.PI;
	
	// Loop to draw segments through first medium
	for (i = 0; i <= n1.width; i += lineResolution) {
        x = t+i/scale1;
		y = Math.sin(x + phaseShift);
        if (isReflectedByHigherMedium) {
			y = -y;
		}
	
		// Reflect the wave across the Y axis by drawing from the first boundary to "0".
		context.lineTo(n1.width - i, amplitude*y + xDrawOffset);
	
    }
}

/**
 * Function to calculate how much of each light source is either reflected or transmitted.
 */
function calculateResults() {
	
	var incidentNet = {};
	var reflectedNet = {};
	var transmittedNet = {};
	
	for(i = 0; i < 3; i++){
		
		// Set incident color
		
		if (allSources[i]) {
		
			incidentNet[i] = 255;
			allDivs[i][0].style.backgroundColor = divBackground[i];
			
			// Calculate amount of reflected wavelength
			
			var reflectedAmount = 0.0;
			var wavelengthsInFirstMedium = n1.width/(2*Math.PI*(allWavelengths[i]/n1.value));
			var wavelengthsInSecondMedium = n2.width/(2*Math.PI*(allWavelengths[i]/n2.value));
			var reflectedWave1PhaseShift = wavelengthsInFirstMedium * 2 * Math.PI;
			var reflectedWave2PhaseShift = (wavelengthsInFirstMedium + wavelengthsInSecondMedium * 2) * 2 * Math.PI;
			if ( n2.value > n1.value){
				reflectedWave1PhaseShift += Math.PI;
			}
			if ( n3.value > n2.value) {
				reflectedWave2PhaseShift += Math.PI;
			}
			
			// Loop through one oscillation, apply the phase shift for each reflected wave.
			
			for (j = 0; j < 360; j++){
				reflectedAmount = Math.max(reflectedAmount, 0.5 * Math.abs(Math.sin(reflectedWave1PhaseShift + j * Math.PI / 180.0) + Math.sin(reflectedWave2PhaseShift + j * Math.PI / 180.0)));
			}
			
			reflectedNet[i] = Math.round(reflectedAmount * 255);
			allDivs[i][1].style.backgroundColor = rgbComponent(reflectedNet[i], i);
			
			// Calculate amount of transmitted wavelength
			
			var redTransmit = Math.sqrt(1.0 - reflectedAmount * reflectedAmount);
			transmittedNet[i] = Math.round(redTransmit * 255);
			
			allDivs[i][2].style.backgroundColor = rgbComponent(transmittedNet[i], i);
			
		} else {
			
			incidentNet[i] = 0;
			reflectedNet[i] = 0;
			transmittedNet[i] = 0;
			
			for( n = 0; n < 3; n++){
				allDivs[i][n].style.backgroundColor = "black";
			}
		}	
	}
	
	allDivs[3][0].style.backgroundColor = rgb(incidentNet[0], incidentNet[1], incidentNet[2]);
	allDivs[3][1].style.backgroundColor = rgb(reflectedNet[0], reflectedNet[1], reflectedNet[2]);
	allDivs[3][2].style.backgroundColor = rgb(transmittedNet[0], transmittedNet[1], transmittedNet[2]);
	
}

function rgb(r, g, b){
  return ["rgb(",r,",",g,",",b,")"].join("");
}

function rgbComponent(value, pos){
	if (pos == 0) {
		return ["rgb(",value,",0,0)"].join("");
	} else if (pos == 1){
		return ["rgb(0,",value,",0)"].join("");
	} else if (pos == 2){
		return ["rgb(0,0,",value,")"].join("");
	}
  
}

    ThinFilm.init()
    
})();

function updateSources(value, isChecked){
	if (value=="red") {
		allSources[0] = isChecked;
	} else if (value=="green") {
		allSources[1] = isChecked;
	} else if (value=="blue") {
		allSources[2] = isChecked;
	}
	
	firstDraw = true;
}

function changeInterference(colorValue) {
	if (colorValue=="Red") setScale(660);		
	if (colorValue=="Lime") setScale(540);
	if (colorValue=="Blue") setScale(440);
	lineColor = colorValue;
	firstDraw = true;
}

function setScale(nm) {
	scale = nm/12.7;
}

function changeSlider(id, value) {
	if(id=="thicknessSlider") {
		n2.width=value;
		document.getElementById("thicknessValue").innerHTML = parseFloat(value);
	} else if(id=="n1ValueSlider") {
		n1.value=value; 
		document.getElementById("n1Value").innerHTML = parseFloat(value);
	} else if(id=="n2ValueSlider") {
		n2.value=value; 
		document.getElementById("n2Value").innerHTML = parseFloat(value);
	} else if(id=="n3ValueSlider") {
		n3.value=value; 
		document.getElementById("n3Value").innerHTML = parseFloat(value);
	}
	
	firstDraw = true;
	
}

function changeSpeed(speedValue) {
	drawSpeed = defaultSpeed * speedValue;
	firstDraw = true;
}

function changeQuality(qualityValue) {
	lineResolution = defaultResolution / qualityValue;
	firstDraw = true;
}

function hideShow(id) {
	var e = document.getElementById(id);
	console.log(e.style.display);
    if(e.style.display == "block") {
            e.style.display = "none";
    }
    else {
        e.style.display = "block";
    }
}

// Currently specialized for use with Play/Pause button only

function toggle(e, _default, _alternate) {
	if (e.value == _default) {
		shouldDraw = true;
		e.value = _alternate;
	} else {
		shouldDraw = false;
		e.value = _default;
	}
}