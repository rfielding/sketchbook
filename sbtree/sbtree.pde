static int[] computePrimes(int n) {
  int[] answer = new int[n];
  int idx=0;
  for(int i=2; i<n && idx<n; i++)
  {
    int divisors=0;
    for(int j=2; j<i; j++)
    {
      if(i%j == 0)
      {
        divisors++;
      }
    }
    if(divisors==0)
    {
      answer[idx] = i;
      idx++;
    }
  }
  return answer;
}

//needs to be as high as any denominator or numerator we want to use
public static int[] primes = computePrimes(64);


class Fraction
{
  public int num;
  public int den;
  public float rWidth=6;
  public float complexity=1;
  public float value=0;  
  public float angle=0;  

  public String showAs;
  
  public Fraction(int n,int d)
  {
    num = n;
    den = d;
    //Move into right octave from 1.0 to 2.0 value
    while(value < 1.0 || value >= 2.0) {
      value = (1.0 * num)/den;
      if(value < 1.0)num*=2;
      if(value >= 2.0)den*=2;
      value = (1.0 * num)/den;
    }
    //Put into reduced form
    int g = gcd(num,den);
    num /= g;
    den /= g;
    angle = (float) ( 2 * Math.PI * Math.log(value) / Math.log(2) );
    computeComplexity();
    findShowAs();
  }
  
  private void findShowAs()
  {
    showAs = num + ":" + den;
    /*
    if( (num-den)*(num-den) > 1 )
    {
      //It's not already a superparticular ratio
      //see if it's octave equivalent to one.
      
      //Will doubling denominator create a sp?
      if( (num-2*den)*(num-2*den) == 1 )
      {
        if(num%2==1)
        {
          showAs = "2*"+(num)+":"+(2*den);  
        }
        else
        {
          showAs = "2*"+(num/2)+":"+(den);
        }
      }
      else
      {
        if( num%2==0 && (num/2-den)*(num/2-den) == 1 )
        {
          showAs = "2*"+(num/2)+":"+den;
        }
      }
    }
    */
  }
  
  private int gcd(int a, int b)
  {
    if(a < b)
    {
      int t = b;
      b = a;
      a = t;
    }
    if(b==0)return a;
    return gcd(b,a%b);
  }
  
  private void computeComplexity()
  {
    complexity = 1;
    int factors = num*den;
    int lastFactors = -1;
    for(int i=0;i<primes.length;i++)
    {
      //Prevent infinite loop
      int p=primes[i];
      while(p > 0 && factors >= p && (factors % p) == 0)
      {
        factors /= p;
        //Doing sum of primes for a measure at the moment.
        if(p>2)
        {
          complexity += p*p;
        }
      } 
      lastFactors = factors; 
    }
  }
  
  public float getAngle()
  {
    return angle;
  }
  
  public float getValue()
  {
    return value;
  }
  
  public void drawAt(float rim,float dist,float cx,float cy)
  {
    dist = (rim+dist)/2;
    float x = (float) (dist*Math.sin(angle));
    float y = (float) (dist*-Math.cos(angle));
    textAlign(CENTER);
    fill(color(255,255,0,(int)(255 * (20.0/complexity))));
    pushMatrix();
    translate(cx+x,cy+y+4);
    if(angle < PI)
    {
      rotate(-PI/2 + angle);
    }
    else
    {
      rotate(PI/2 + angle);
    }
    text(showAs, 0,0);
    popMatrix();
  }
}

class SBTree
{
  public Fraction[] fractions;
  public float maxComplexity = 0;
  
  public SBTree(int depth)
  {
    fractions = new Fraction[depth*depth];
    for(int j=0; j<depth;j++)
    {
      for(int i=0; i<depth;i++)
      {
        int k = i*depth+j;
        fractions[k] = new Fraction(i+1,j+1);
        if(fractions[k].complexity > maxComplexity)
        {
          maxComplexity += fractions[k].complexity;
        }
      }
    }
  }  
}

SBTree sb = new SBTree(32);

int thisframe=0;

void setup()
{
  //size(800,800);
  size(1200,1200);
  rectMode(CENTER);
}

void draw()
{
  background(0);
  //smooth();
  float tooComplex = 1000;
  float r = width * 7;
  float cx = width/2;
  float cy = height/2;
  float minr = 0;
  float centsr=280;
  textAlign(CENTER);
  
  //stroke(color(255,255,255,64));
  //line(cx,cy,mouseX,mouseY);
  
  String[] note = {
    "A","B-","B","C","C+","D","E-","E","F","F+","G","A+"
  };
  for(int i=0; i<1200; i++)
  {
      float centsr2 = 
        centsr + 
        ((i%100)==0?1:0)*10 + 
        ((i%50)==0?1:0)*3 + 
        ((i%10)==0?1:0)*5 + 
        5;
        
      float angle = (2*PI*i)/1200;
      float x1 = (float) (centsr*Math.sin(angle));
      float y1 = (float) (centsr*-Math.cos(angle));    
      float x2 = (float) (centsr2*Math.sin(angle));
      float y2 = (float) (centsr2*-Math.cos(angle));    
      stroke(color(0,0,255,64));
      fill(color(64,64,255,128));
      noFill();
      int toCenter=(i%100==0)?0:1;
      line(cx+x1*toCenter,cy+y1*toCenter,cx+x2,cy+y2);
      if(toCenter==0)
      text(note[(i/100)],cx+x2,cy+y2);
  }
    
  for(int i=0; i<sb.fractions.length; i++)
  {
    float angle = sb.fractions[i].getAngle();
    if(sb.fractions[i].complexity < tooComplex)
    {
      float complexity = sb.fractions[i].complexity / sb.maxComplexity;
      float dist = minr + r*complexity;
      float x = (float) (dist*Math.sin(angle));
      float y = (float) (dist*-Math.cos(angle));
      float x2 = (float) (centsr*Math.sin(angle));
      float y2 = (float) (centsr*-Math.cos(angle));
      stroke(color(0,255,0,255));
      stroke(color(0,255,0,16*(1-complexity)));
      line(cx+x,cy+y,cx+x2,cy+y2);
      stroke(color(0,255,0,3*(1-complexity)));
      noFill();
      ellipse(cx,cy,2*dist,2*dist);
      stroke(color(255,0,0,255));
      fill(color(255,64,64,255));
      ellipse(cx+x,cy+y,5,5);
      noFill();
    }
  }
  for(int i=0; i<sb.fractions.length; i++)
  {
    float angle = sb.fractions[i].getAngle();
    if(sb.fractions[i].complexity < tooComplex)
    {
      float complexity = sb.fractions[i].complexity / sb.maxComplexity;
      float dist = minr + r*complexity;
      sb.fractions[i].drawAt(centsr,dist,cx,cy);
    }
  }
  fill(color(255,255,255,255));
  text("Sum Of Squared Odd Prime Factors Metric - rob.fielding@gmail.com", 200,30);
  if(thisframe%100==0)save("/home/rfieldin/sumofsquaredprimefactorsmetric.png");
  thisframe++;
}

