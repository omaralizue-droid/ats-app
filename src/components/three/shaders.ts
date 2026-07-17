// All GLSL shaders as typed TypeScript strings
// ────────────────────────────────────────────

/* ─── Shared Perlin 3D Noise (Classic) ─────────────────────────────────── */
const NOISE_GLSL = /* glsl */`
vec4 _permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 _taylorInvSqrt(vec4 r){return 1.7928429140015 - 0.8537347209531*r;}
vec3 _fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec3 P){
  vec3 Pi0=floor(P),Pi1=Pi0+vec3(1.);
  Pi0=mod(Pi0,289.);Pi1=mod(Pi1,289.);
  vec3 Pf0=fract(P),Pf1=Pf0-vec3(1.);
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
  vec4 iy=vec4(Pi0.yy,Pi1.yy);
  vec4 iz0=Pi0.zzzz,iz1=Pi1.zzzz;
  vec4 ixy=_permute(_permute(ix)+iy);
  vec4 ixy0=_permute(ixy+iz0),ixy1=_permute(ixy+iz1);
  vec4 gx0=ixy0/7.,gy0=fract(floor(gx0)/7.)-.5;
  gx0=fract(gx0);
  vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
  vec4 sz0=step(gz0,vec4(0.));
  gx0-=sz0*(step(0.,gx0)-.5);gy0-=sz0*(step(0.,gy0)-.5);
  vec4 gx1=ixy1/7.,gy1=fract(floor(gx1)/7.)-.5;
  gx1=fract(gx1);
  vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
  vec4 sz1=step(gz1,vec4(0.));
  gx1-=sz1*(step(0.,gx1)-.5);gy1-=sz1*(step(0.,gy1)-.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x),g100=vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010=vec3(gx0.z,gy0.z,gz0.z),g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x),g101=vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011=vec3(gx1.z,gy1.z,gz1.z),g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0=_taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;
  vec4 norm1=_taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;
  float n000=dot(g000,Pf0),n100=dot(g100,vec3(Pf1.x,Pf0.yz));
  float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)),n110=dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001=dot(g001,vec3(Pf0.xy,Pf1.z)),n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011=dot(g011,vec3(Pf0.x,Pf1.yz)),n111=dot(g111,Pf1);
  vec3 fxyz=_fade(Pf0);
  vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fxyz.z);
  vec2 nyz=mix(nz.xy,nz.zw,fxyz.y);
  return 2.2*mix(nyz.x,nyz.y,fxyz.x);
}

float fbm3(vec3 p, int oct){
  float v=0.,a=.5,f=1.;
  for(int i=0;i<8;i++){
    if(i>=oct)break;
    v+=a*cnoise(p*f);a*=.5;f*=2.1;
  }
  return v;
}
`

/* ─── AI Core — Vertex ─────────────────────────────────────────────────── */
export const coreVertexShader = /* glsl */`
${NOISE_GLSL}

uniform float uTime;
uniform vec2  uMouse;
uniform float uMobile;

varying vec3  vNormal;
varying vec3  vPos;
varying vec3  vWorldPos;
varying float vDisp;
varying float vFresnel;

void main(){
  vec3 pos  = position;
  vec3 nor  = normalize(normal);
  float t   = uTime * .28;

  int octaves = uMobile > .5 ? 3 : 5;

  // ── Layer 1: Slow large-scale morphing ──────────────────────────────────
  float d1 = fbm3(pos*.7 + vec3(t*.18, t*.12, t*.09), octaves);
  // ── Layer 2: Medium ripples ─────────────────────────────────────────────
  float d2 = fbm3(pos*1.6 + vec3(-t*.26, t*.2, -t*.16), octaves-1);
  // ── Layer 3: Fine surface churn ──────────────────────────────────────────
  float d3 = cnoise(pos*3.8 + vec3(t*.7, -t*.5, t*.6));

  // Mouse sculpts the shape
  vec3 mDir  = normalize(vec3(uMouse, .6));
  float mDot = dot(nor, mDir);
  float mInf = length(uMouse) * .12 * mDot;

  // Breathing pulse
  float breath = sin(t*1.6 + d1*3.14159) * .032;

  float disp = d1*.32 + d2*.14 + d3*.05 + mInf + breath;
  vDisp      = disp;

  vec3 newPos  = pos + nor * disp;
  vPos         = newPos;
  vWorldPos    = (modelMatrix * vec4(newPos,1.)).xyz;
  vNormal      = normalize(normalMatrix * nor);

  // Fresnel precomputed in vertex
  vec3 camDir  = normalize(cameraPosition - vWorldPos);
  vFresnel     = pow(1. - abs(dot(vNormal, camDir)), 3.2);

  gl_Position  = projectionMatrix * modelViewMatrix * vec4(newPos,1.);
}
`

/* ─── AI Core — Fragment ───────────────────────────────────────────────── */
export const coreFragmentShader = /* glsl */`
uniform float uTime;
uniform vec2  uMouse;

varying vec3  vNormal;
varying vec3  vPos;
varying vec3  vWorldPos;
varying float vDisp;
varying float vFresnel;

// IQ color palette
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d){
  return a + b * cos(6.28318*(c*t+d));
}

void main(){
  vec3 N       = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float t      = uTime * .2;

  // ── Primary body color ──────────────────────────────────────────────────
  vec3 bodyCol = palette(
    vDisp*.6 + t*.3,
    vec3(.03,.04,.18),   // base: very dark navy
    vec3(.12,.08,.3),    // amplitude
    vec3(1.,.7,.5),      // frequency
    vec3(0.,.1,.45)      // phase
  );

  // ── Subsurface scatter (fake, efficient) ────────────────────────────────
  float sss     = pow(max(0., dot(N, normalize(vec3(1.,1.,.5)))), 4.);
  vec3  subsurf = vec3(.0,.18,.55) * sss * 1.8;

  // ── Mouse-driven rim light ──────────────────────────────────────────────
  vec3  rimDir  = normalize(vec3(uMouse.x, uMouse.y, .9));
  float rim     = pow(1. - max(0., dot(N, rimDir)), 5.);
  vec3  rimCol  = vec3(.15,.45,1.) * rim * 2.5;

  // ── Energy flow lines (animated sine lattice) ───────────────────────────
  float fx  = sin(vPos.y*9. + uTime*2.2 + vDisp*6.) * .5 + .5;
  float fy  = sin(vPos.x*7. - uTime*1.8) * .5 + .5;
  float flow = fx * fy;
  vec3  energyCol = vec3(.05,.4,1.) * flow * .45;

  // ── Internal pulse ──────────────────────────────────────────────────────
  float pulse   = sin(uTime*2.1)*.5+.5;
  vec3  inner   = vec3(.02,.1,.45) * pulse * (1.-vFresnel) * 2.;

  // ── Chromatic Fresnel edge ──────────────────────────────────────────────
  vec3  fresnelGlow = vec3(
    vFresnel*.15,
    vFresnel*.45,
    vFresnel
  ) * 2.8;

  // ── Combine ─────────────────────────────────────────────────────────────
  vec3 col = bodyCol*.55 + subsurf + rimCol + energyCol + inner + fresnelGlow;

  // Filmic tone (simple)
  col = col / (1. + col);
  col = pow(col, vec3(.88));

  float alpha = .78 + vFresnel * .22;
  gl_FragColor = vec4(col, alpha);
}
`

/* ─── Cosmic Background — Vertex (full-screen quad) ───────────────────── */
export const bgVertexShader = /* glsl */`
varying vec2 vUv;
void main(){
  vUv         = uv;
  gl_Position = vec4(position.xy, 1., 1.); // bypass camera, fill screen
}
`

/* ─── Cosmic Background — Fragment (domain-warped FBM nebula) ─────────── */
export const bgFragmentShader = /* glsl */`
uniform float uTime;
uniform vec2  uResolution;
uniform float uMobile;

varying vec2 vUv;

// Hash & 2D noise
float hash2(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise2(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  float a=hash2(i),b=hash2(i+vec2(1,0)),c=hash2(i+vec2(0,1)),d=hash2(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

// Rotating FBM — IQ warp magic
mat2 rot2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float fbm2(vec2 p){
  float v=0.,a=.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  int oct = uMobile > .5 ? 4 : 7;
  for(int i=0;i<7;i++){
    if(i>=oct)break;
    v+=a*noise2(p);p=m*p;a*=.5;
  }
  return v;
}

// IQ color palette — deep cosmos
vec3 cosmicPalette(float t){
  vec3 a=vec3(.02,.015,.06);    // near-black deep violet
  vec3 b=vec3(.04,.03,.1);      // subtle color range
  vec3 c=vec3(.9,.7,.4);        // frequency
  vec3 d=vec3(0.,.12,.48);      // phase offset
  return a + b*cos(6.28318*(c*t+d));
}

void main(){
  // Centered UV (-1 to 1)
  vec2 uv = vUv * 2. - 1.;
  uv.x   *= uResolution.x / uResolution.y;

  float ts = uTime * .06; // ultra slow evolution

  // ── Domain warp layer 1 ─────────────────────────────────────────────────
  vec2 q = vec2(
    fbm2(uv + vec2(.0,.0) + ts),
    fbm2(uv + vec2(5.2,1.3) + ts*.8)
  );

  // ── Domain warp layer 2 (warp the warp) ────────────────────────────────
  vec2 r = vec2(
    fbm2(uv + 4.*q + vec2(1.7,9.2) + ts*.6),
    fbm2(uv + 4.*q + vec2(8.3,2.8) - ts*.5)
  );

  // ── Final FBM with double-warped input ─────────────────────────────────
  float f = fbm2(uv + 4.*r + ts*.4);

  // ── Color ───────────────────────────────────────────────────────────────
  vec3 col = cosmicPalette(f + length(r)*.4 - ts*.15);

  // Faint nebula brightening at warp peaks
  float nebulaGlow = smoothstep(.6, .9, f) * .06;
  col += vec3(.08,.12,.4) * nebulaGlow;

  // Radial depth vignette
  float vignette = 1. - smoothstep(.4, 1.5, length(uv)*.7);
  col *= vignette * .85 + .15;

  // Hard-clamp to avoid blowout
  col = clamp(col, 0., 1.);

  gl_FragColor = vec4(col, 1.);
}
`

/* ─── Cursor energy trail (WebGL2 fragment) ────────────────────────────── */
export const trailFragmentShader = /* glsl */`
uniform float uTime;
uniform vec2  uMouse;
uniform vec2  uResolution;

varying vec2 vUv;

void main(){
  vec2 uv    = vUv;
  vec2 mouse = uMouse * .5 + .5; // to UV space
  float d    = length(uv - mouse);
  float glow = smoothstep(.12, .0, d);
  vec3  col  = vec3(.1,.4,1.) * glow * .4;
  gl_FragColor = vec4(col, glow * .35);
}
`
