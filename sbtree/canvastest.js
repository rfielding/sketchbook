var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

//context.fillStyle = '#000000';
context.fillStyle = '#ff0000';
context.textAlign = "center";
/*
context.beginPath();
context.moveTo(100, 150);
context.lineTo(450, 50);
context.lineWidth = 10;
context.lineCap = 'round';
context.strokeStyle = '#ffff00';
context.stroke();
*/
var cx = canvas.width/2;
var cy = canvas.height/2;
var isCounterClockwise = false;
var radius;
if(cx > cy) {
   radius = cy/2;
} else {
   radius = cx/2;
}


var sharp = "#";
var flat  = "-";
var labels = new Array();
labels[0]  = "A";
labels[1]  = "B"+flat;
labels[2]  = "B";
labels[3]  = "C";
labels[4]  = "C"+sharp;
labels[5]  = "D";
labels[6]  = "E"+flat;
labels[7]  = "E";
labels[8]  = "F";
labels[9]  = "F"+sharp;
labels[10] = "G";
labels[11] = "G"+sharp;

context.beginPath();
context.fillStyle = '#ffffff';
context.fillRect(0,0,canvas.width,canvas.height);
context.stroke();

context.beginPath();
context.lineWidth = 1;
context.strokeStyle = '#0000ff';
//context.fillStyle = '#00ff00';
//context.fill();
context.arc(cx,cy, radius, 0, 2*Math.PI, isCounterClockwise);
context.stroke();


var equaltemp = 12;
var increments = equaltemp*10;

context.strokeStyle = '#0000ff';
context.beginPath();
for(var i=0; i < increments; i++) {

    var angle = (2*Math.PI * i) / increments;
    var x1 = radius * Math.sin( angle );
    var y1 = -radius * Math.cos( angle );

    context.lineWidth = 0.5 * ((i%1)==0);
    context.moveTo(cx,cy);
    context.lineTo(cx+x1,cy+y1);
}
context.stroke();

context.strokeStyle = '#000000';
context.lineWidth = 1;
var radiusExtra = 10;
context.save();
context.fillStyle = '#0000ff';
context.beginPath();
for(var i=0; i < equaltemp; i++) {
    var angle = (2*Math.PI * i) / equaltemp;
    var x1 =  (radius) * Math.sin( angle );
    var y1 = -(radius) * Math.cos( angle );
    var x2 =  (radius+radiusExtra) * Math.sin( angle );
    var y2 = -(radius+radiusExtra) * Math.cos( angle );
    context.fillText(labels[i], cx+x2, cy+y2);
    context.moveTo(cx,cy);
    context.lineTo(cx+x1,cy+y1);
}
context.stroke();
context.restore();

function gcd(n,d) {
    while(d != 0) {
        var z = n % d;
        n = d;
        d = z;
    }
    return n; 
}

var limit=36;

//Generate a list of primes up to limit
var primes = new Array();
var primeCount = 0;
for(var p=2; p<limit; p++) {
    var isPrime = true;
    for(var n=2; isPrime && n<p; n++) {
        if(p%n == 0) {
            isPrime = false;    
        } 
    }
    if(isPrime == true) {
        primes.push(p);
        primeCount++;
    }    
}

//Do a squared some of odd n*d prime factors
function estimateComplexity(n,d) {
    var answer = 0.0;
    var nd = n*d;
    for(var i=0; i < primeCount && nd > 1; i++) {
        var p = primes[i];
        while(nd%p == 0 && nd > 1) {
            nd /= p;
            if(p%2 == 1) {
                answer += p*p;
            } 
        }
    }

    return answer; 
}

function normalizeComplexity(n,d,c) {
    return c / (limit);
}


context.lineWidth = 0.25;
for(var num=1; num<=limit; num++) {
    for(var den=1; den<=limit; den++) {
        var n = num;
        var d = den;

        //move value from range [1,2)
        var val = (1.0 * n)/d;
        while( val < 1.0 || val >= 2.0) {
            if( val < 1.0 ) {
                val *= 2;
                n   *= 2;
            }
            if( val >= 2.0) {
                val /= 2;
                d   *= 2;
            }
        }

        //See if it's the lowest representation
        var g = gcd(n,d);
        if(g == 1 || (n==1 && d==1)) {
            //compute its complexity
            var complexity = estimateComplexity(n,d);
            var ncomplexity = normalizeComplexity(n,d,complexity); 
            var angle = 2 * Math.PI * Math.log(val)/Math.log(2);
            var r  = (radius*ncomplexity);
            var x1 =  r * Math.sin( angle );
            var y1 = -r * Math.cos( angle );
            var x2 =  (radius) * Math.sin( angle );
            var y2 = -(radius) * Math.cos( angle );

            context.strokeStyle = '#ff0000';
            context.beginPath();
            context.arc(cx,cy, r, 0, 2*Math.PI, isCounterClockwise);
            context.stroke();

            context.beginPath();
            context.save();
              context.translate( cx,cy );
              context.translate( x1,y1 );
              context.strokeStyle = '#000000';
              if(angle > Math.PI) {
                  context.rotate(Math.PI/2+angle);
                  context.fillStyle = '#000000';
                  context.fillText(n+":"+d, 0-20,0+3);
              } else {
                  context.rotate(Math.PI+Math.PI/2+angle);
                  context.fillStyle = '#000000';
                  context.fillText(n+":"+d, 0+20,0+3);
              }
              context.strokeStyle = '#ff0000';
              context.fillStyle = '#ff0000';
              context.arc(0,0, 5, 0, 2*Math.PI, isCounterClockwise);
            context.fill();
            context.stroke();
            context.restore();

            context.strokeStyle = '#00ff00';
            context.beginPath();
            context.arc(cx,cy, r, 0, 2*Math.PI, isCounterClockwise);
            context.stroke();

            context.beginPath();
            var xr =  (radius) * Math.sin( angle );
            var yr = -(radius) * Math.cos( angle );
            context.moveTo(cx+xr,cx+yr);
            context.lineTo(cx+x1,cy+y1);
            context.stroke();
        }    
    }
}