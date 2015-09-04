exports.pinkNoise = function( ctx, bufferSize ) {

	var b0, b1, b2, b3, b4, b5, b6, node
	
	b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0
	node = ctx.createScriptProcessor(bufferSize, 1, 1)
	
	node.onaudioprocess = function(e) {
		
		// http://noisehack.com/generate-noise-web-audio-api/
		var output = e.outputBuffer.getChannelData(0)
		
		for (var i = 0; i < bufferSize; i++) {
			var white = Math.random() * 2 - 1
			b0 = 0.99886 * b0 + white * 0.0555179
			b1 = 0.99332 * b1 + white * 0.0750759
			b2 = 0.96900 * b2 + white * 0.1538520
			b3 = 0.86650 * b3 + white * 0.3104856
			b4 = 0.55000 * b4 + white * 0.5329522
			b5 = -0.7616 * b5 - white * 0.0168980
			output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
			output[i] *= 0.11 // (roughly) compensate for gain
			b6 = white * 0.115926
		}
	}
	
	return node
}

exports.oscillator = function( ctx, type, frequency ) {
	/*
		enum OscillatorType {
		  "sine",
		  "square",
		  "sawtooth",
		  "triangle",
		  "custom"
		}
	*/
	
	var node = ctx.createOscillator()
	node.type = type || "sawtooth"
	node.frequency.value = frequency || 2000
	
	return node
}
	
exports.gain = function( ctx ) {
	var node = ctx.createGain()
	node.gain.value = 1
	return node
}
	
exports.panner = function( ctx ) {
	
	ctx.listener.setPosition(0, 0, 0);
	
	var node = ctx.createPanner();
	
	node.panningModel = 'equalpower';
	node.coneOuterGain = 0.1;
	node.coneOuterAngle = 180;
	node.coneInnerAngle = 0;
	
	return node;
}
	
exports.bandpass = function( ctx ) {

	var node = ctx.createBiquadFilter()
	
	node.type = "bandpass"
	node.frequency.value = 440
	node.Q.value = 0.5
	
	return node
}