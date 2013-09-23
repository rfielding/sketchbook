

var tunerContext = {
    limit: 81
    ,pangle: 0

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
        var sharp = "#";
        var flat  = "-";
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
        this.cx = this.canvas.width/2;
        this.cy = this.canvas.height/2;
        this.radius;
        if(this.cx > this.cy) {
            this.radius = 0.8*this.cy;
        } else {
            this.radius = 0.8*this.cx;
        }
        this.context.fillStyle = '#ff0000';
        this.context.textAlign = "center";
    }

    ,doCentsBackgroundFine: function() {
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 1;
        this.radiusExtra = 20;
        var increments = 1200;
        this.context.fillStyle = '#ff00ff';
        this.context.strokeStyle = '#0000ff';
        this.context.beginPath();
        for(var i=0; i < increments; i++) {
            var angle = (2*Math.PI * i) / increments;
            var x1 =  this.radius * Math.sin( angle );
            var y1 = -this.radius * Math.cos( angle );
            var r2 = this.radius + this.radiusExtra - 2*(1+(i%5!=0)+(i%10!=0)+(i%25!=0)+(i%50!=0));
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
        this.context.fillStyle = "#ffffff";
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

    ,doPitchRatios: function() {
        this.context.lineWidth = 0.125;

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
                    var angle = 2 * Math.PI * Math.log(val)/Math.log(2);
                    var r  = this.radius * ncomplexity;
                    var x1 =  r * Math.sin( angle );
                    var y1 = -r * Math.cos( angle );
                    var x2 =  (this.radius) * Math.sin( angle );
                    var y2 = -(this.radius) * Math.cos( angle );

                    this.context.strokeStyle = '#ff0000';

                    this.context.beginPath();
                    this.context.save();
                    this.context.translate( this.cx,this.cy );
                    this.context.translate( x1,y1 );
                    this.context.strokeStyle = '#000000';
                    if(angle > Math.PI) {
                        this.context.rotate( Math.PI/2 + angle );
                        this.context.fillStyle = '#ffff00';
                        this.context.fillStyle = '#ffff00';
                        this.context.fillText( n+":"+d, 0-20, 0+3 );
                    } else {
                        this.context.rotate( -Math.PI/2 + angle );
                        this.context.fillStyle = '#ffff00';
                        this.context.fillText( n+":"+d, 0+20, 0+3 );
                    }

                    this.context.strokeStyle = '#ff0000';
                    this.context.fillStyle = '#ff0000';
                    var isCounterClockwise = false;
                    this.context.arc(0, 0, 3, 0, 2*Math.PI, isCounterClockwise);

                    this.context.fill();
                    this.context.stroke();
                    this.context.restore();

                    this.context.lineWidth = 0.25 / (1+ncomplexity);
                    this.context.strokeStyle = '#00ff00';
                    this.context.beginPath();
                    this.context.arc( this.cx, this.cy, r, 0, 2*Math.PI, isCounterClockwise);
                    this.context.moveTo( this.cx + x1, this.cy + y1);
                    this.context.lineTo( this.cx + x2, this.cy + y2);
                    this.context.stroke();
                }
            }
        }
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
        var x1 = this.radius * 2 * Math.sin( this.pangle );
        var y1 = this.radius * 2 * -Math.cos( this.pangle );
        this.context.moveTo( this.cx, this.cy );
        this.context.lineTo( this.cx + x1, this.cy + y1 );
        this.context.stroke();
    }

    ,doDraw: function() {
        this.doClear();
        this.doDrawIntonationWheel();
        this.doPitchRatios();
        this.doDrawThisMark();
    }

    ,init : function() {
        this.findPrimes();
        this.findLabels();
        this.canvasSetup();
    }
}

function doTuner() {
    tunerContext.init();
    tunerContext.doDraw();
}

function reDraw() {
    tunerContext.pangle += Math.random()*0.1 - 0.05;
    tunerContext.doDraw();
    setTimeout("reDraw()", 100);
}

setTimeout("reDraw()", 100);

