Ball ball;
float lastMouseX;
float lastMouseY;

void setup() {
  size(600,600);
  background(0,0,0);
  ball = new Ball(width,height);
}

void draw() {
  fadescr(0,0,0);
  
  ball.draw();
  ball.push(mouseX-lastMouseX, mouseY-lastMouseY);
  ball.fall();
  ball.bounce(0,0,width,height);
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

//Here is a ball
class Ball {
  float speedX=0;
  float speedY=0;
  float posX=0;
  float posY=0;
 
  Ball(float w, float h) {
    posX = w/2;
    posY = w/2;
  }
  
  void draw() {
    ellipse(posX,posY,20,20);
  }
  
  void push(float dx, float dy) {
    speedX += dx*0.01;
    speedY += dy*0.01;
    posX += speedX;
    posY += speedY;
    speedX *= 0.995;
    speedY *= 0.995;
  }
  
  void bounce(float x1,float y1,float x2,float y2) {
    float dx;
    float dy;
    
    if(posX < x1 || posX > x2)
    {
      speedX = -speedX;
    }
    if(posY < y1 || posY > y2)
    {
      speedY = -speedY;
    }
  }
  
  void fall() {
    speedY += 0.1;
  }
}

//Fade the screen to this color
void fadescr(int r, int g, int b) { 
  int red, green, blue;
  loadPixels();
  for (int i = 0; i < pixels.length; i++) {
    red = (pixels[i] >> 16) & 0x000000ff; 
    green = (pixels[i] >> 8) & 0x000000ff; 
    blue = pixels[i] & 0x000000ff; 
    pixels[i] = (((red+((r-red)>>3)) << 16) | ((green+((g-green)>>3)) << 8) | (blue+((b-blue)>>3)));
  } 
  updatePixels();
}
