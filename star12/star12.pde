int N = 12;
float radius = 200;
float ellipseRadius = 20;
int paper = 600;
float polarX;
float polarY;

void setup() {
  size(paper,paper);
}

void draw() {
  int skip=5;
  int from=0;
  int span=12;
  for(int i=0; i<span; i++) {
    lineAt(from,radius,from+skip,radius);
    from = from + skip;
  }
  for(int i=0; i<N; i++) {
    ellipseAt(i, radius);
  }
}

void polarToCartesian(float i,float radius) {
    float theta = i * 2*PI/N;
    polarX = radius * cos(theta) + width/2;
    polarY = radius * sin(theta) + height/2;
}

void ellipseAt(int i, float radiusi) {
  polarToCartesian(i, radiusi);
  ellipse(polarX,polarY,ellipseRadius,ellipseRadius);
}

void lineAt(int i, float radiusi, int j, float radiusj) {
  polarToCartesian(i,radiusi);
  float x1 = polarX;
  float y1 = polarY;
  polarToCartesian(j,radiusj);
  float x2 = polarX;
  float y2 = polarY;
  line(x1,y1,x2,y2);
}
