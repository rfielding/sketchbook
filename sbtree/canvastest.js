function trylog(msg) {
    if(console && console.log) {
        console.log(msg);
    }
}

var micInputContext = {
    buflen: 512
    ,bins: 0
    ,samples: 0
    ,crossings: 0
    ,prevVal: 0
    ,valMax: 0
    ,valMin: 0
    ,avgFreq: 440 
    ,pitchAngle: 0
    ,avgCents : 1200 
    ,maxBin : 0
    ,maxBinValue : 0

    ,findFreq: function() {
        var diff = 1.0;
        var md = this.analyser.minDecibels;
        //Initialize buffers
        this.analysisRawBuf[0] = 0.0;
        for(var i=1; i<this.buflen; i++) {
            var m = this.freqBuf[i];
            var v = (m - md) * diff;
            this.analysisRawBuf[i] = v;
            if(this.analysisRawBuf[i] < 0) {
              this.analysisRawBuf[i] = 0.0;
            }
            this.analysisBuf[i] = 0.0;
        }
        for(var i=0; i<this.buflen; i++) {

            this.analysisBuf[i] += 0.0001*this.analysisRawBuf[i]

            //this.analysisBuf[i] += 0.001*this.analysisRawBuf[i/2];
            //this.analysisBuf[i] += this.analysisRawBuf[i/3]/3;
            //this.analysisBuf[i] += this.analysisRawBuf[i/4]/4;
            //this.analysisBuf[i] += this.analysisRawBuf[i/5]/5;
            //this.analysisBuf[i] += this.analysisRawBuf[i/8]/8;
            //this.analysisBuf[i] += this.analysisRawBuf[i/16]/16;
        }
        var hmax=3;
        //Find the max value for correlated wave length (in samples)
        for(var i=0; i<this.buflen; i++) {
            for(var h=1; h<hmax; h++) {
                var v = this.analysisRawBuf[i];
                this.analysisBuf[i/h] *= v*h;
            }
        }
        //Find max 
        this.maxBinValue = 0;
        this.maxBin = 0;      
        var maxBinValue = 0;
        var maxBin = 0;
        for(var i=0; i<this.buflen; i++) {
            if( this.analysisBuf[i] > maxBinValue) {
                maxBinValue = this.analysisBuf[i];
                maxBin = i;
            }
        }
        //Set pitch angle
        if( maxBin > 4 ) {
            this.maxBin = maxBin;
            this.maxBinValue = maxBinValue;

            var topitchAngle =
                Math.PI*2 * 
                ((1200*Math.log(this.maxBin)/Math.log(2)+0.5)%1200)/1200.0;

            while( topitchAngle >= Math.PI ) {
                topitchAngle -= Math.PI*2;
            }
            while( topitchAngle < -Math.PI) {
                topitchAngle += Math.PI*2;
            }
            while( this.pitchAngle >= Math.PI ) {
                this.pitchAngle -= Math.PI*2;
            }
            while( this.pitchAngle < -Math.PI) {
                this.pitchAngle += Math.PI*2;
            }
            if(topitchAngle - this.pitchAngle < -Math.PI) {
                topitchAngle += 2*Math.PI
            }
            if(this.pitchAngle - topitchAngle < -Math.PI) {
                this.pitchAngle += 2*Math.PI
            }

            a = (0.95 + maxBinValue/256)
            b = 1 - a
 
            this.pitchAngle = this.pitchAngle*a + topitchAngle*b;

            this.avgCents = Math.floor(1200*this.pitchAngle/(Math.PI*2));
        }
    }

    ,audioAnalyse: function() {
        if(this.audioContext) {
            this.analyser.getFloatFrequencyData(this.freqBuf);
            this.analyser.getByteTimeDomainData(this.timeBuf);
            this.bins = this.analyser.frequencyBinCount;
            this.findFreq();
        }
    }
 
    ,audioSetup: function() {
        this.analysisBuf = new Float32Array(this.buflen);
        this.analysisRawBuf = new Float32Array(this.buflen);
        this.freqBuf = new Float32Array(this.buflen);
        this.timeBuf = new Uint8Array(this.buflen);
        if(navigator.getUserMedia) {
            var me = this;
            var args = {audio:true};
            var callback = function(stream) {
                trylog("open mic succeed");
                me.audioContext = new AudioContext();
                me.microphone = me.audioContext.createMediaStreamSource(stream);
                me.analyser = me.audioContext.createAnalyser();
                me.microphone.connect(me.analyser);
            }
            var failcallback = function(stream) {
                trylog("open mic fail");
            }
            navigator.getUserMedia(args, callback, failcallback);
        }
    }
}

var tunerContext = {
    limit: 81
    ,tooComplex: 3.0
    ,density: 1.0
    ,pitchAngle: 0
    ,pitchAngledx1: 0
    ,pitchAngledx2: 0

    ,findPrimes : function() {
        this.primes = new Array()
        this.primeCount = 0;
        for(var p=2; p<this.limit; p++) {
            var isPrime = true;
            for(var n=2; isPrime && n<p; n++) {
                if(p%n == 0) {
                    isPrime = false;    
                } 
            }
            if(isPrime == true) {
                this.primes.push(p);
                this.primeCount++;
            }    
        }
    }

    ,findLabels : function() {
        //var sharp = "#";
        //var flat  = "-";
        var sharp = "♯";
        var flat  = "♭";
        this.labels = new Array();
        this.labels[0]  = "A";
        this.labels[1]  = "B"+flat;
        this.labels[2]  = "B";
        this.labels[3]  = "C";
        this.labels[4]  = "C"+sharp;
        this.labels[5]  = "D";
        this.labels[6]  = "E"+flat;
        this.labels[7]  = "E";
        this.labels[8]  = "F";
        this.labels[9]  = "F"+sharp;
        this.labels[10] = "G";
        this.labels[11] = "G"+sharp;
    }

    ,gcd: function(n,d) {
        while(d != 0) {
            var z = n % d;
            n = d;
            d = z;
        }
        return n; 
    }

    ,normalizeComplexity: function(n,d,c) {
        return c / this.limit;
    }

    //Do a squared some of odd n*d prime factors
    ,estimateComplexity: function(n,d) {
        var answer = 0.0;
        var nd = n*d;
        for(var i=0; i < this.primeCount && nd > 1; i++) {
            var p = this.primes[i];
            while(nd%p == 0 && nd > 1) {
                nd /= p;
                if(p%2 == 1) {
                    answer += p*p;
                } 
            }
        }
        return answer; 
    }

    ,canvasSetup: function() {
        this.canvas = document.getElementById('myCanvas');
        this.context = this.canvas.getContext('2d');
        this.context.font = '8pt Verdana';
        this.cx = this.canvas.width/2;
        this.cy = this.canvas.height/2;
        this.radius;
        if(this.cx > this.cy) {
            this.radius = this.density*this.cy;
        } else {
            this.radius = this.density*this.cx;
        }
        this.context.fillStyle = '#ff0000';
        this.context.textAlign = "center";
    }

    ,doCentsBackgroundFine: function() {
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.radiusExtra = 10;
        var increments = 120;
        this.context.fillStyle = '#ff00ff';
        this.context.strokeStyle = '#8888ff';
        this.context.beginPath();
        for(var i=0; i < increments; i++) {
            var angle = (2*Math.PI * i) / increments;
            var x1 =  this.radius * Math.sin( angle );
            var y1 = -this.radius * Math.cos( angle );
            var r2 = this.radius + 5 + this.radiusExtra * (increments%5==0);  
            var x2 =  r2 * Math.sin( angle );
            var y2 = -r2 * Math.cos( angle );
            this.context.moveTo( this.cx + x2, this.cy + y2);
            this.context.lineTo( this.cx + x1, this.cy + y1);
        }
        this.context.stroke();
    }

    ,doCentsBackgroundCoarse: function() {
        var increments = 12;
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.strokeStyle = '#ff0000';
        this.context.strokeStyle = '#0000ff';
        for(var i=0; i < increments; i++) {
            var angle = (2*Math.PI * i) / increments;
            var x1 = this.radius * Math.sin( angle );
            var y1 = -this.radius * Math.cos( angle );
            this.context.moveTo( this.cx, this.cy );
            this.context.lineTo( this.cx + x1, this.cy + y1 );
        }
        this.context.stroke();
    }

    ,doCentsLabels: function() {
        this.context.beginPath();
        var increments = 12;
        var radius = this.radius + 15;
        this.context.fillStyle = "#8888ff";
        this.context.font = 'Bold 18pt Verdana';
        for(var i=0; i < increments; i++) {
            var angle = (2*Math.PI * i) / increments;
            var x1 =  radius * Math.sin( angle );
            var y1 = -radius * Math.cos( angle );

            this.context.save();
            this.context.translate( this.cx + x1, this.cy + y1 );
            if(Math.PI/2 < angle && angle < 3*Math.PI/2) {
                this.context.rotate( angle );
            } else {
                this.context.rotate( angle );
            }
            this.context.translate( -this.cx - x1, -this.cy - y1 );
            this.context.fillText( this.labels[i], this.cx + x1, this.cy + y1 );
            this.context.restore();
        }
        this.context.stroke();
    }

    ,doCentsBackground: function() {
        this.doCentsBackgroundCoarse();
        this.doCentsBackgroundFine();
        this.doCentsLabels();
     }

    ,doPrecomputePitchRatios: function() {
        this.fractions = new Array();
        for(var num = 1; num <= this.limit; num++) {
            for(var den = 1; den <= this.limit; den++) {
                var n = num;
                var d = den;

                //move value from range [1,2)
                var octDrops = 0;
                var val = (1.0 * n)/d;
                while( val < 1.0 || val >= 2.0) {
                    if( val < 1.0 ) {
                        val *= 2;
                        n   *= 2;
                    }
                    if( val >= 2.0) {
                        if(d%2==0) {
                            octDrops += 1;
                        }
                        val /= 2;
                        d   *= 2;
                    }
                }

                //See if it's the lowest representation
                //If we dropped octaves with an even denominator,
                //then it was already accounted for in earlier iteration
                var g = this.gcd(n,d);
                if(g == 1 || (n==1 && d==1) && octDrops<2) {
                    //compute its complexity
                    var complexity = this.estimateComplexity(n,d);
                    var ncomplexity = this.normalizeComplexity(n,d,complexity); 
                    if(ncomplexity < this.tooComplex) {
                        var angle = 2 * Math.PI * Math.log(val)/Math.log(2);
                        var fraction = {};
                        fraction.ncomplexity = ncomplexity;
                        fraction.angle = angle;
                        fraction.num = n;
                        fraction.den = d; 
                        this.fractions.push(fraction);
                    }
                }
            }
        }
    }

    ,forEachFraction: function(ctx,fun) {
        for(var f=0; f < this.fractions.length; f++) {
            var ncomplexity = this.fractions[f].ncomplexity;
            var angle = this.fractions[f].angle;
            var n = this.fractions[f].num;
            var d = this.fractions[f].den;
            var r  = this.radius * ncomplexity;
            var x2 =  (this.radius) * Math.sin( angle );
            var y2 = -(this.radius) * Math.cos( angle );
            var x1 =  x2 * ncomplexity;
            var y1 =  y2 * ncomplexity;
            fun(ctx,this.cx,this.cy,ncomplexity,angle,n,d,r,x1,y1,x2,y2);
        }
    }

    ,doPitchRatios: function() {
        this.context.lineWidth = 0.125;

        var drawTextBody = function(ctx,cx,cy,ncomplexity,angle,n,d,r,x1,y1,x2,y2) {
            ctx.save();
            ctx.translate( cx,cy );
            ctx.translate( x1,y1 );
            ctx.fillStyle = '#ffff00';
            if(angle > Math.PI) {
                ctx.rotate( Math.PI/2 + angle );
                ctx.fillText( n+":"+d, 0-20, 0+3.25 );
            } else {
                ctx.rotate( -Math.PI/2 + angle );
                ctx.fillText( n+":"+d, 0+20, 0+3.25 );
            }
            ctx.fillStyle = '#ff0000';
            ctx.fillText( "|", 0, 0+3.25 );
            ctx.restore();
        }

        var lineBody = function(ctx,cx,cy,ncomplexity,angle,n,d,r,x1,y1,x2,y2) {
            ctx.moveTo( cx + x1, cy + y1);
            ctx.lineTo( cx + x2, cy + y2);
        }

        var dotsBody = function(ctx,cx,cy,ncomplexity,angle,n,d,r,x1,y1,x2,y2) {
            ctx.arc(cx + x1, cy + y1, 3, 0, 2*Math.PI, false);
        }

        this.context.strokeStyle = '#00ff00';

        this.context.beginPath();
        this.forEachFraction(this.context,lineBody);
        this.context.stroke();

        this.context.beginPath();
        this.forEachFraction(this.context,drawTextBody);
        this.context.fill();

        this.context.strokeStyle = '#ffffff';
        this.context.beginPath();
        this.context.moveTo( this.cx, this.cy);
        this.context.lineTo( this.cx, this.cy - 800);
        this.context.stroke();
    }

    ,doDrawIntonationWheel: function() {
        this.doCentsBackground();
    }

    ,doClear: function() {
        this.context.beginPath();
        this.context.fillStyle = '#000000';
        this.context.strokeStyle = '#ffff00';
        this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height );
        this.context.stroke();
    }

    ,doDrawThisMark: function() {
        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = 'rgba(255,255,255,128)';
        var x1 = this.radius * 4 * Math.sin( micInputContext.pitchAngle );
        var y1 = this.radius * 4 * -Math.cos( micInputContext.pitchAngle );
        this.context.moveTo( this.cx, this.cy );
        this.context.lineTo( this.cx + x1, this.cy + y1 );
        this.context.stroke();

    }

    ,doDrawCentsLegend: function(x,y) {
        this.context.save();
        this.context.fillStyle = 'rgba(255,255,255,128)';
        this.context.textAlign = "left";
        this.context.font = 'Bold 12pt Verdana';
        var angle = micInputContext.pitchAngle;
        while(angle < 0) {
          angle += 2*Math.PI;
        }
        while(angle >= 2*Math.PI) {
          angle -= 2*Math.PI;
        }
        var cents = (Math.floor(120000 * angle / (2*Math.PI))%120000)/100;
        //var hertz = (Math.floor(44000 * Math.pow(2,angle/(2*Math.PI))))/100;
        var hertz = Math.floor(micInputContext.avgFreq);
        this.context.beginPath();
        this.context.fillText(cents+"¢ from root",x,y);
        var note = ((Math.floor((cents-50)/100))+1)%12;
        var centsoff = (Math.floor(100*(cents - note*100)))/100;
        this.context.fillText(this.labels[note]+" "+centsoff+"¢",x,y+20);
        //this.context.fillText(hertz+"hz",x,y+40);
        this.context.fill();
        this.context.restore();
    }

    ,doDraw: function() {
        this.context.save();
        var x1 =  this.radius * Math.sin( micInputContext.pitchAngle );
        var y1 = -this.radius * Math.cos( micInputContext.pitchAngle );
        this.doClear();
        this.context.translate( -x1, -y1 );
        this.doPitchRatios();
        this.doDrawIntonationWheel();
        this.doDrawThisMark();
        this.context.restore();
        this.doDrawCentsLegend(75,50);
        this.doDrawFFT();
    }

    ,doDrawFFT: function() {
        var bins = micInputContext.bins/4;
        if(bins==0)return;
        var w = this.canvas.width;
        var h = this.canvas.height;
        var h2 = h/2;
        var diff = 1;
        var c = h;
        var difft = 0.5;

        this.context.strokeStyle = 'rgba(255,127,127,16)';
        this.context.beginPath();
        this.context.moveTo(0 , h2);
        for(var i=0; i<bins; i++) {
            var n = (1.0*i*w)/bins;
            //var m = micInputContext.freqBuf[i];
            var v = micInputContext.analysisBuf[i]; 
            this.context.lineTo(n , h2 - v);
        }
        this.context.stroke();

        this.context.strokeStyle = 'rgba(127,255,127,16)';
        this.context.beginPath();
        this.context.moveTo(0 , h);
        var md = micInputContext.analyser.minDecibels;
        for(var i=0; i<bins; i++) {
            var n = (1.0*i*w)/bins;
            var m = micInputContext.freqBuf[i];
            var v = (m - md) * diff;
            this.context.lineTo(n , h - v);
        }
        this.context.stroke();

        this.context.beginPath();
        this.context.strokeStyle = 'rgba(127,127,255,16)';
        this.context.moveTo(0, c + 127);
        for(var i=0; i<bins; i++) {
            var n = (1.0*i*w)/bins;
            var v = micInputContext.timeBuf[i]*difft;
            this.context.lineTo(n, c - v);
        } 
        this.context.stroke();

        var label1 = Math.floor(micInputContext.avgFreq) + "hz";
        var label2 = Math.floor(micInputContext.avgCents) + "¢";
        var label3 = micInputContext.maxBin + " bin";
        this.context.fillStyle = 'rgba(255,255,255,127)';
        this.context.beginPath();
        //this.context.fillText(label1, 75, this.canvas.height - 70);
        this.context.fillText(label2, 75, this.canvas.height - 90);
        this.context.fillText(label3, 75, this.canvas.height - 110);
        this.context.fill();
    }

    ,init : function() {
        this.avgFreq = 0;
        this.avgMaxi = 0;
        this.findPrimes();
        this.doPrecomputePitchRatios();
        this.findLabels();
        this.canvasSetup();
    }
}

function doMonkeyPatching() {
    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
    }
    if(!window.requestAnimationFrame) {
        window.requestAnimationFrame = setTimeout;
    }
    if(!window.AudioContext) {
        window.AudioContext = window.webkitAudioContext;
    }
    if(!navigator.getUserMedia) {
        navigator.getUserMedia = navigator.webkitGetUserMedia;
    } 
}

function doTuner() {
    doMonkeyPatching();
    tunerContext.init();
    tunerContext.doDraw();
    window.requestAnimationFrame(reDraw);
    micInputContext.audioSetup();
}

function reDraw() {
    micInputContext.audioAnalyse();
    tunerContext.doDraw();
    window.requestAnimationFrame(reDraw);
}

