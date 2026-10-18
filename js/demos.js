// Interactive demos. Each: {title, desc, run(el)} ; run returns optional cleanup.
(function(){
const D = window.DEMOS = {};
function cv(el,w,h){const c=document.createElement('canvas');const r=window.devicePixelRatio||1;c.width=w*r;c.height=h*r;c.style.width='100%';c.style.maxWidth=w+'px';c.style.aspectRatio=w+'/'+h;const g=c.getContext('2d');g.scale(r,r);el.appendChild(c);return [c,g];}
function ctl(el,html){const d=document.createElement('div');d.className='demo-ctl';d.innerHTML=html;el.appendChild(d);return d;}
function col(n){return getComputedStyle(document.body).getPropertyValue(n).trim()||'#888';}
function anim(fn){let id,run=true;function f(t){if(!run)return;fn(t);id=requestAnimationFrame(f);}id=requestAnimationFrame(f);return()=>{run=false;cancelAnimationFrame(id);};}

D.pythagoras={title:"Pythagorean theorem: rearrangement proof",desc:"Four copies of a right triangle inside a square of side a+b. Arranged one way, the empty space is c²; arranged another, it is a² + b². Drag the slider to morph between arrangements, and change the triangle's shape.",
run(el){const [c,g]=cv(el,420,420);const k=ctl(el,'<label>Shape a:b <input type=range min=15 max=85 value=35 id=pa></label><label>Rearrange <input type=range min=0 max=100 value=0 id=pt></label><span id=pv></span>');
function draw(){const fa=k.querySelector('#pa').value/100,t=k.querySelector('#pt').value/100;const S=380,o=20,a=S*fa,b=S-a;g.clearRect(0,0,420,420);g.strokeStyle=col('--fg');g.lineWidth=2;g.strokeRect(o,o,S,S);
// arrangement A (c^2 tilted square): triangles at corners
const A=[[[o,o],[o+a,o],[o,o+b]],[[o+a,o],[o+S,o],[o+S,o+a]],[[o+S,o+a],[o+S,o+S],[o+b,o+S]],[[o+b,o+S],[o,o+S],[o,o+b]]];
// arrangement B (a^2 and b^2 squares): two rectangles a x b split
const B=[[[o+a,o],[o+S,o],[o+a,o+a]],[[o+S,o],[o+S,o+a],[o+a,o+a]],[[o,o+a],[o+a,o+a],[o,o+S]],[[o+a,o+a],[o+a,o+S],[o,o+S]]];
const cols=['#e07a5f','#3d85c6','#81b29a','#f2cc8f'];
// fill hole color
g.fillStyle='rgba(150,120,255,.25)';g.fillRect(o,o,S,S);
for(let i=0;i<4;i++){g.beginPath();for(let j=0;j<3;j++){const x=A[i][j][0]*(1-t)+B[i][j][0]*t,y=A[i][j][1]*(1-t)+B[i][j][1]*t;j?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fillStyle=cols[i];g.fill();g.stroke();}
g.fillStyle=col('--fg');g.font='16px sans-serif';
if(t<.05){g.fillText('c²',o+S/2-8,o+S/2+5);}if(t>.95){g.fillText('a²',o+a/2-8,o+a/2+5);g.fillText('b²',o+a+b/2-8,o+a+b/2+5);}
const cc=Math.hypot(a,b);k.querySelector('#pv').textContent=`a=${(a/S*10).toFixed(2)}, b=${(b/S*10).toFixed(2)}: a²+b²=${((a*a+b*b)/S/S*100).toFixed(2)} = c²=${(cc*cc/S/S*100).toFixed(2)}`;}
k.oninput=draw;draw();}};

D.archpi={title:"Archimedes squeezes π",desc:"Inscribed (inside) and circumscribed (outside) regular polygons trap the circle. Archimedes went from 6 to 96 sides. Their half-perimeters bound π.",
run(el){const [c,g]=cv(el,420,420);const k=ctl(el,'<label>Sides <input type=range min=3 max=96 value=6 id=n></label><span id=v></span>');
function draw(){const n=+k.querySelector('#n').value,R=170,cx=210,cy=210;g.clearRect(0,0,420,420);g.lineWidth=2;
g.strokeStyle=col('--fg');g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();
const poly=(r,clr)=>{g.strokeStyle=clr;g.beginPath();for(let i=0;i<=n;i++){const a=i*2*Math.PI/n-Math.PI/2;const x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);i?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();};
poly(R,'#3d85c6');poly(R/Math.cos(Math.PI/n),'#e07a5f');
const lo=n*Math.sin(Math.PI/n),hi=n*Math.tan(Math.PI/n);k.querySelector('#v').innerHTML=`<b>${n}</b>-gon: ${lo.toFixed(6)} &lt; π &lt; ${hi.toFixed(6)} &nbsp; (true π = 3.141593)`;}
k.oninput=draw;draw();}};

D.unitcircle={title:"Euler's formula on the unit circle",desc:"e^(iθ) is a point rotating on the unit circle. Its horizontal shadow is cos θ and its vertical shadow is sin θ — so a rotation produces two waves. At θ = π the point reaches −1: e^(iπ) = −1.",
run(el){const [c,g]=cv(el,640,300);const k=ctl(el,'<button id=pp>Pause</button><label>θ <input type=range min=0 max=628 value=0 id=th></label><span id=v></span>');let play=true,th=0;
k.querySelector('#pp').onclick=e=>{play=!play;e.target.textContent=play?'Pause':'Play'};k.querySelector('#th').oninput=e=>{th=e.target.value/100;play=false;k.querySelector('#pp').textContent='Play'};
return anim(()=>{if(play){th=(th+0.015)%(2*Math.PI);k.querySelector('#th').value=th*100;}
const cx=140,cy=150,R=100;g.clearRect(0,0,640,300);g.strokeStyle=col('--muted');g.lineWidth=1;g.beginPath();g.moveTo(20,cy);g.lineTo(620,cy);g.moveTo(cx,30);g.lineTo(cx,270);g.stroke();
g.strokeStyle=col('--fg');g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();const x=cx+R*Math.cos(th),y=cy-R*Math.sin(th);
g.strokeStyle='#e07a5f';g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(x,y);g.stroke();
g.strokeStyle='#3d85c6';g.beginPath();g.moveTo(cx,cy);g.lineTo(x,cy);g.stroke();g.strokeStyle='#81b29a';g.beginPath();g.moveTo(x,cy);g.lineTo(x,y);g.stroke();
// sine wave
const ox=270;g.lineWidth=2;g.strokeStyle='#81b29a';g.beginPath();for(let t=0;t<=th;t+=0.02){const px=ox+t*55,py=cy-R*Math.sin(t);t?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();
g.strokeStyle='#3d85c6';g.beginPath();for(let t=0;t<=th;t+=0.02){const px=ox+t*55,py=cy-R*Math.cos(t)*0.999;t?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();
g.setLineDash([4,4]);g.strokeStyle=col('--muted');g.beginPath();g.moveTo(x,y);g.lineTo(ox+th*55,y);g.stroke();g.setLineDash([]);
g.fillStyle='#e07a5f';g.beginPath();g.arc(x,y,5,0,7);g.fill();g.fillStyle=col('--fg');g.font='13px sans-serif';g.fillText('green: sin θ   blue: cos θ',ox,25);
k.querySelector('#v').textContent=`θ=${th.toFixed(2)}  e^(iθ) = ${Math.cos(th).toFixed(3)} + ${Math.sin(th).toFixed(3)}i`;});}};

D.conics={title:"Conic sections: slicing a cone",desc:"Change the eccentricity e. e = 0 circle, 0 < e < 1 ellipse, e = 1 parabola, e > 1 hyperbola — the polar equation r = ℓ/(1 + e cos θ), the same form as orbits under gravity. The dot marks the focus (where the Sun sits for a planet).",
run(el){const [c,g]=cv(el,500,380);const k=ctl(el,'<label>Eccentricity e <input type=range min=0 max=200 value=50 id=e></label><span id=v></span>');
function draw(){const e=k.querySelector('#e').value/100,l=90,fx=250,fy=190;g.clearRect(0,0,500,380);g.strokeStyle=col('--muted');g.lineWidth=1;g.beginPath();g.moveTo(0,fy);g.lineTo(500,fy);g.moveTo(fx,0);g.lineTo(fx,380);g.stroke();
g.strokeStyle='#e07a5f';g.lineWidth=2.5;g.beginPath();let pen=false;for(let t=-Math.PI;t<=Math.PI;t+=0.004){const d=1+e*Math.cos(t);if(d<=0.02){pen=false;continue;}const r=l/d;if(r>900){pen=false;continue;}const x=fx+r*Math.cos(t),y=fy-r*Math.sin(t);pen?g.lineTo(x,y):g.moveTo(x,y);pen=true;}g.stroke();
g.fillStyle='#f2cc8f';g.beginPath();g.arc(fx,fy,6,0,7);g.fill();const name=e==0?'circle':e<1?'ellipse':e==1?'parabola':'hyperbola';k.querySelector('#v').innerHTML=`e = ${e.toFixed(2)} → <b>${name}</b>`;}
k.oninput=draw;draw();}};

D.tangent={title:"The derivative: secant becomes tangent",desc:"The slope between two points (secant) approaches the slope at one point (tangent) as h → 0. This limit is the derivative. Curve: f(x) = x³/3 − x.",
run(el){const [c,g]=cv(el,500,340);const k=ctl(el,'<label>x <input type=range min=-200 max=200 value=50 id=x></label><label>h <input type=range min=1 max=200 value=150 id=h></label><span id=v></span>');
const f=x=>x*x*x/3-x,fp=x=>x*x-1,X=x=>250+x*90,Y=y=>170-y*70;
function draw(){const x=k.querySelector('#x').value/100,h=k.querySelector('#h').value/100;g.clearRect(0,0,500,340);g.strokeStyle=col('--muted');g.lineWidth=1;g.beginPath();g.moveTo(0,170);g.lineTo(500,170);g.moveTo(250,0);g.lineTo(250,340);g.stroke();
g.strokeStyle=col('--fg');g.lineWidth=2;g.beginPath();for(let t=-2.8;t<=2.8;t+=0.02){t>-2.8?g.lineTo(X(t),Y(f(t))):g.moveTo(X(t),Y(f(t)));}g.stroke();
const s=(f(x+h)-f(x))/h;g.strokeStyle='#e07a5f';g.beginPath();g.moveTo(X(-3),Y(f(x)+s*(-3-x)));g.lineTo(X(3),Y(f(x)+s*(3-x)));g.stroke();
g.strokeStyle='#81b29a';g.setLineDash([5,4]);g.beginPath();g.moveTo(X(-3),Y(f(x)+fp(x)*(-3-x)));g.lineTo(X(3),Y(f(x)+fp(x)*(3-x)));g.stroke();g.setLineDash([]);
[[x,'#3d85c6'],[x+h,'#e07a5f']].forEach(([p,cl])=>{g.fillStyle=cl;g.beginPath();g.arc(X(p),Y(f(p)),5,0,7);g.fill();});
k.querySelector('#v').innerHTML=`secant slope = ${s.toFixed(4)} &nbsp; tangent slope f'(x) = ${fp(x).toFixed(4)}`;}
k.oninput=draw;draw();}};

D.fourier={title:"Fourier series: building a square wave from sines",desc:"Add odd harmonics sin(nx)/n. More terms → sharper corners. Notice the persistent overshoot near jumps (Gibbs phenomenon, ~9%). Rotating circles (epicycles) show each term as a rotation — Euler's formula again.",
run(el){const [c,g]=cv(el,680,300);const k=ctl(el,'<label>Terms <input type=range min=1 max=40 value=3 id=n></label><select id=w><option value=sq>Square wave</option><option value=saw>Sawtooth</option><option value=tri>Triangle</option></select><span id=v></span>');let t=0;
return anim(()=>{const N=+k.querySelector('#n').value,w=k.querySelector('#w').value;t+=0.02;g.clearRect(0,0,680,300);
const terms=[];for(let i=1;i<=N;i++){let n,a;if(w=='sq'){n=2*i-1;a=4/(Math.PI*n);}else if(w=='saw'){n=i;a=2*(i%2?1:-1)/(Math.PI*n);}else{n=2*i-1;a=8/(Math.PI*Math.PI*n*n)*((i%2)?1:-1);}terms.push([n,a]);}
const S=60,cx=130,cy=150;let x=cx,y=cy;g.lineWidth=1;
for(const [n,a] of terms){const r=S*a;const ph=(w=='tri')?n*t+Math.PI/2:n*t;g.strokeStyle='rgba(128,128,128,.4)';g.beginPath();g.arc(x,y,Math.abs(r),0,7);g.stroke();const nx=x+r*Math.cos(ph),ny=y-r*Math.sin(ph);g.strokeStyle=col('--fg');g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();x=nx;y=ny;}
const ox=280;g.strokeStyle='#e07a5f';g.lineWidth=2;g.beginPath();for(let px=0;px<=390;px++){const tt=t-px/50;let s=0;for(const [n,a] of terms){s+=a*Math.sin(w=='tri'?n*tt+Math.PI/2:n*tt);}const py=cy-S*s;px?g.lineTo(ox+px,py):g.moveTo(ox+px,py);}g.stroke();
g.setLineDash([3,3]);g.strokeStyle=col('--muted');g.beginPath();g.moveTo(x,y);g.lineTo(ox,y);g.stroke();g.setLineDash([]);k.querySelector('#v').textContent=N+' term(s)';});}};

D.lln={title:"Law of large numbers: coin flips",desc:"The running proportion of heads wanders wildly at first, then settles near the true probability. Individual flips stay unpredictable; averages become predictable.",
run(el){const [c,g]=cv(el,640,280);const k=ctl(el,'<label>P(heads) <input type=range min=5 max=95 value=50 id=p></label><button id=r>Restart</button><span id=v></span>');let pts=[],h=0;
k.querySelector('#r').onclick=()=>{pts=[];h=0};k.querySelector('#p').oninput=()=>{pts=[];h=0};
return anim(()=>{const p=k.querySelector('#p').value/100;for(let i=0;i<5&&pts.length<3000;i++){h+=Math.random()<p?1:0;pts.push(h/(pts.length+1));}
g.clearRect(0,0,640,280);const Y=v=>260-v*240;g.strokeStyle='#81b29a';g.setLineDash([5,4]);g.beginPath();g.moveTo(0,Y(p));g.lineTo(640,Y(p));g.stroke();g.setLineDash([]);
g.strokeStyle='#e07a5f';g.lineWidth=2;g.beginPath();pts.forEach((v,i)=>{const x=Math.log(i+1)/Math.log(3001)*630+5;i?g.lineTo(x,Y(v)):g.moveTo(x,Y(v));});g.stroke();
g.fillStyle=col('--fg');g.font='12px sans-serif';g.fillText('flips (log scale) →',520,275);k.querySelector('#v').textContent=`${pts.length} flips, proportion = ${(pts[pts.length-1]||0).toFixed(4)}`;});}};

D.clt={title:"Central limit theorem: summing dice",desc:"Each sample is the sum of n dice. One die gives a flat histogram; as n grows, the histogram becomes a bell curve — regardless of the original shape.",
run(el){const [c,g]=cv(el,640,280);const k=ctl(el,'<label>Dice per sample n <input type=range min=1 max=30 value=1 id=n></label><button id=r>Reset</button><span id=v></span>');let hist={},cnt=0;
const reset=()=>{hist={};cnt=0};k.querySelector('#n').oninput=reset;k.querySelector('#r').onclick=reset;
return anim(()=>{const n=+k.querySelector('#n').value;for(let i=0;i<60;i++){let s=0;for(let j=0;j<n;j++)s+=1+Math.floor(Math.random()*6);hist[s]=(hist[s]||0)+1;cnt++;}
g.clearRect(0,0,640,280);const lo=n,hi=6*n,bw=620/(hi-lo+1),mx=Math.max(...Object.values(hist));g.fillStyle='#3d85c6';
for(let s=lo;s<=hi;s++){const v=(hist[s]||0)/mx*250;g.fillRect(10+(s-lo)*bw,270-v,Math.max(1,bw-1),v);}k.querySelector('#v').textContent=cnt+' samples';});}};

D.konigsberg={title:"Seven bridges of Königsberg",desc:"Click bridges to try to cross each exactly once in a continuous walk. Numbers show how many bridges touch each land mass — all odd, so Euler showed it's impossible. Toggle an extra bridge to see what changes.",
run(el){const [c,g]=cv(el,500,340);const k=ctl(el,'<button id=r>Reset walk</button><label><input type=checkbox id=x> Add 8th bridge</label><span id=v></span>');
const L={N:[250,50],S:[250,290],I:[180,170],E:[400,170]};let B=[['N','I',-25],['N','I',25],['S','I',-25],['S','I',25],['N','E',0],['S','E',0],['I','E',0]];const B8=['N','S',150];
let used=[],cur=null;
function bridges(){return k.querySelector('#x').checked?B.concat([B8]):B;}
function mid(b){const a=L[b[0]],d=L[b[1]];return [(a[0]+d[0])/2+b[2],(a[1]+d[1])/2];}
function draw(){g.clearRect(0,0,500,340);const bs=bridges();g.lineWidth=4;bs.forEach((b,i)=>{const a=L[b[0]],d=L[b[1]],m=mid(b);g.strokeStyle=used.includes(i)?'#e07a5f':col('--muted');g.beginPath();g.moveTo(...a);g.quadraticCurveTo(m[0]*2-(a[0]+d[0])/2,m[1]*2-(a[1]+d[1])/2,...d);g.stroke();g.fillStyle=used.includes(i)?'#e07a5f':'#3d85c6';g.beginPath();g.arc(...m,9,0,7);g.fill();});
Object.entries(L).forEach(([n,p])=>{const deg=bs.filter(b=>b[0]==n||b[1]==n).length;g.fillStyle=cur==n?'#81b29a':col('--card2');g.strokeStyle=col('--fg');g.lineWidth=2;g.beginPath();g.arc(...p,22,0,7);g.fill();g.stroke();g.fillStyle=col('--fg');g.font='bold 15px sans-serif';g.fillText(deg,p[0]-5,p[1]+5);});
const odd=Object.keys(L).filter(n=>bridges().filter(b=>b[0]==n||b[1]==n).length%2).length;k.querySelector('#v').textContent=`Odd land masses: ${odd} → Euler walk ${odd==0||odd==2?'POSSIBLE':'IMPOSSIBLE'}. Used ${used.length}/${bs.length}.`;}
c.onclick=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*500/r.width,y=(e.clientY-r.top)*340/r.height;bridges().forEach((b,i)=>{const m=mid(b);if(Math.hypot(m[0]-x,m[1]-y)<14&&!used.includes(i)){if(cur==null||cur==b[0]||cur==b[1]){cur=cur==null?b[1]:(cur==b[0]?b[1]:b[0]);used.push(i);}}});draw();};
k.querySelector('#r').onclick=()=>{used=[];cur=null;draw()};k.querySelector('#x').onchange=()=>{used=[];cur=null;draw()};draw();}};

D.brach={title:"Brachistochrone race",desc:"Beads slide without friction from top-left to the same end point along a straight line, a parabola, and a cycloid. The cycloid wins even though it is longer.",
run(el){const [c,g]=cv(el,560,320);const k=ctl(el,'<button id=go>Race!</button><span id=v></span>');
const W=480,H=200,ox=40,oy=40;// cycloid through (W,H): solve theta
let th=Math.PI;for(let i=0;i<60;i++){const f=(t)=> (t-Math.sin(t))/(1-Math.cos(t))-W/H;const a=1,bb=2*Math.PI;let lo=0.01,hi=2*Math.PI-0.01;for(let j=0;j<60;j++){const m=(lo+hi)/2;f(m)>0?hi=m:lo=m;}th=(lo+hi)/2;}const R=H/(1-Math.cos(th));
const paths={line:t=>[W*t,H*t],arc:t=>{const r=(W*W+H*H)/(2*W);const a0=Math.PI, a1=Math.PI+Math.asin(H/r)*0+Math.atan2(-H, W-r)+Math.PI;return null;},cyc:t=>{const p=th*t;return [R*(p-Math.sin(p)),R*(1-Math.cos(p))];}};
// build polylines
function poly(fn){const pts=[];for(let i=0;i<=400;i++)pts.push(fn(i/400));return pts;}
const P={Line:poly(t=>[W*t,H*t]),Cycloid:poly(t=>{const p=th*t;return [R*(p-Math.sin(p)),R*(1-Math.cos(p))];}),Parabola:poly(t=>[W*t,H*(1-(1-t)*(1-t))])};
const colors={Line:'#3d85c6',Cycloid:'#e07a5f',Parabola:'#81b29a'};
// time along polyline: dt = ds / v, v = sqrt(2 g y)
const gAcc=400;const T={};for(const n in P){const pts=P[n];let t=0;const ts=[0];for(let i=1;i<pts.length;i++){const ds=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);const ym=(pts[i][1]+pts[i-1][1])/2;t+=ds/Math.sqrt(2*gAcc*Math.max(ym,0.5));ts.push(t);}T[n]=ts;}
let start=null;k.querySelector('#go').onclick=()=>start=performance.now();
k.querySelector('#v').textContent=Object.keys(P).map(n=>`${n}: ${T[n][400].toFixed(3)} s`).join(' · ');
return anim(now=>{g.clearRect(0,0,560,320);const el2=start?(now-start)/1000:0;for(const n in P){g.strokeStyle=colors[n];g.lineWidth=2;g.beginPath();P[n].forEach((p,i)=>i?g.lineTo(ox+p[0],oy+p[1]):g.moveTo(ox+p[0],oy+p[1]));g.stroke();
let idx=T[n].findIndex(x=>x>el2);if(idx<0)idx=400;const p=P[n][idx];g.fillStyle=colors[n];g.beginPath();g.arc(ox+p[0],oy+p[1],7,0,7);g.fill();g.fillText(n,ox+P[n][300][0]+8,oy+P[n][300][1]-6);}});}};

D.symmetry={title:"Symmetry group of a square",desc:"Apply rotations (r) and reflections (s). Every combination is again one of exactly 8 symmetries — the dihedral group D4. Note r·s ≠ s·r: order matters (non-commutative).",
run(el){const [c,g]=cv(el,360,360);const k=ctl(el,'<button id=r>Rotate 90°</button><button id=s>Reflect (vertical axis)</button><button id=z>Reset</button><span id=v></span>');let ang=0,flip=1,hist=[];
function draw(){g.clearRect(0,0,360,360);g.save();g.translate(180,180);g.scale(flip,1);g.rotate(ang*Math.PI/2);const cols=['#e07a5f','#3d85c6','#81b29a','#f2cc8f'];const pts=[[-100,-100],[100,-100],[100,100],[-100,100]];
g.lineWidth=3;g.strokeStyle=col('--fg');g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.stroke();pts.forEach((p,i)=>{g.fillStyle=cols[i];g.beginPath();g.arc(...p,16,0,7);g.fill();g.save();g.translate(...p);g.rotate(-ang*Math.PI/2);g.scale(flip,1);g.fillStyle='#000';g.font='bold 15px sans-serif';g.fillText('ABCD'[i],-5,5);g.restore();});
g.fillStyle=col('--fg');g.beginPath();g.moveTo(-30,-60);g.lineTo(30,-60);g.lineTo(0,-20);g.fill();g.restore();
k.querySelector('#v').textContent='Sequence: '+(hist.join('·')||'identity')+`  ⇒ element: ${flip<0?'s·':''}r^${((ang%4)+4)%4}`;}
k.querySelector('#r').onclick=()=>{ang+=flip;hist.push('r');draw()};k.querySelector('#s').onclick=()=>{flip*=-1;hist.push('s');draw()};k.querySelector('#z').onclick=()=>{ang=0;flip=1;hist=[];draw()};draw();}};

D.logic={title:"Boolean logic gates",desc:"Toggle inputs A and B. Boolean algebra (Boole, 1854) — implemented by switches (Shannon, 1937) — underlies every digital circuit.",
run(el){const d=document.createElement('div');d.className='logic';el.appendChild(d);let A=0,B=0;
function draw(){const rows=[['A AND B',A&B],['A OR B',A|B],['NOT A',1-A],['A XOR B',A^B],['A NAND B',1-(A&B)],['NOT(A AND B) = NOT A OR NOT B (De Morgan)',(1-(A&B))===((1-A)|(1-B))?1:0]];
d.innerHTML=`<div class=demo-ctl><button id=a class="bit b${A}">A = ${A}</button><button id=b class="bit b${B}">B = ${B}</button></div><table class=tt>${rows.map(r=>`<tr><td>${r[0]}</td><td class="bit b${r[1]}">${r[1]}</td></tr>`).join('')}</table>`;
d.querySelector('#a').onclick=()=>{A^=1;draw()};d.querySelector('#b').onclick=()=>{B^=1;draw()};}draw();}};

D.weier={title:"Weierstrass function: continuous but nowhere smooth",desc:"Sum of cosines with geometrically increasing frequency. Zoom in: the jaggedness never goes away — no tangent anywhere.",
run(el){const [c,g]=cv(el,640,300);const k=ctl(el,'<label>a <input type=range min=30 max=90 value=50 id=a></label><label>Terms <input type=range min=1 max=25 value=12 id=n></label><label>Zoom <input type=range min=0 max=60 value=0 id=z></label>');
function draw(){const a=k.querySelector('#a').value/100,N=+k.querySelector('#n').value,z=Math.pow(2,k.querySelector('#z').value/10),b=7;g.clearRect(0,0,640,300);g.strokeStyle='#e07a5f';g.lineWidth=1.3;g.beginPath();
const span=2/z;let ys=[];for(let px=0;px<640;px++){const x=0.3-span/2+px/640*span;let s=0;for(let n=0;n<N;n++)s+=Math.pow(a,n)*Math.cos(Math.pow(b,n)*Math.PI*x);ys.push(s);}const mn=Math.min(...ys),mx=Math.max(...ys);ys.forEach((s,px)=>{const y=280-(s-mn)/(mx-mn||1)*260;px?g.lineTo(px,y):g.moveTo(px,y);});g.stroke();}
k.oninput=draw;draw();}};

D.diagonal={title:"Cantor's diagonal argument",desc:"Here is an attempted 'complete list' of infinite binary sequences. Flip the diagonal digits to build a sequence that differs from row n at position n — so it is not on the list. Shuffle to try another list: it always fails.",
run(el){const d=document.createElement('div');el.appendChild(d);const N=10;let rows;
function gen(){rows=Array.from({length:N},()=>Array.from({length:N},()=>Math.random()<.5?1:0));}
function draw(){const diag=rows.map((r,i)=>1-r[i]);d.innerHTML=`<div class=demo-ctl><button id=sh>New list</button></div><table class=diag>${rows.map((r,i)=>`<tr><th>s${i+1}</th>${r.map((v,j)=>`<td class="${i==j?'dg':''}">${v}</td>`).join('')}<td>…</td></tr>`).join('')}<tr><th>new</th>${diag.map(v=>`<td class=nw>${v}</td>`).join('')}<td>…</td></tr></table><p class=muted>The 'new' sequence differs from s1 in digit 1, from s2 in digit 2, … so it cannot equal any listed sequence.</p>`;d.querySelector('#sh').onclick=()=>{gen();draw()};}
gen();draw();}};

D.lorenz={title:"Lorenz attractor & the butterfly effect",desc:"Two trajectories start 0.00001 apart. They trace the same butterfly-shaped attractor but soon separate completely: deterministic, yet unpredictable.",
run(el){const [c,g]=cv(el,600,420);const k=ctl(el,'<button id=r>Restart</button><span id=v></span>');let A,B,t;const s=10,r=28,b=8/3;
const reset=()=>{A=[1,1,1];B=[1.00001,1,1];t=0;g.clearRect(0,0,600,420);};reset();k.querySelector('#r').onclick=reset;
const step=(p,h)=>{const [x,y,z]=p;return [x+h*s*(y-x),y+h*(x*(r-z)-y),z+h*(x*y-b*z)];};
return anim(()=>{g.fillStyle=col('--bg')+'08';for(let i=0;i<8;i++){const a0=A,b0=B;A=step(A,0.005);B=step(B,0.005);t+=0.005;
[[a0,A,'#e07a5f'],[b0,B,'#3d85c6']].forEach(([p,q,cl])=>{g.strokeStyle=cl;g.lineWidth=1;g.beginPath();g.moveTo(300+p[0]*10,410-p[2]*7.5);g.lineTo(300+q[0]*10,410-q[2]*7.5);g.stroke();});}
k.querySelector('#v').textContent=`t = ${t.toFixed(1)}  separation = ${Math.hypot(A[0]-B[0],A[1]-B[1],A[2]-B[2]).toExponential(2)}`;});}};

D.mandelbrot={title:"Mandelbrot set explorer",desc:"Click to zoom in (shift-click to zoom out). Each pixel c is colored by how fast z → z² + c escapes. The boundary has infinite detail.",
run(el){const [c,g]=cv(el,600,400);const k=ctl(el,'<button id=r>Reset</button><label>Max iterations <input type=range min=50 max=1000 value=200 id=it></label><span id=v></span>');let cx=-0.6,cy=0,sc=3.2;
function draw(){const W=600,H=400,r=window.devicePixelRatio||1;const img=g.createImageData(W*r,H*r);const it=+k.querySelector('#it').value;for(let py=0;py<H*r;py++)for(let px=0;px<W*r;px++){const x0=cx+(px/(W*r)-.5)*sc,y0=cy+(py/(H*r)-.5)*sc*H/W;let x=0,y=0,i=0;while(x*x+y*y<4&&i<it){const xt=x*x-y*y+x0;y=2*x*y+y0;x=xt;i++;}const o=(py*W*r+px)*4;if(i==it){img.data[o]=img.data[o+1]=img.data[o+2]=10;}else{const t=i/it,v=Math.sqrt(t);img.data[o]=255*Math.min(1,v*2.2);img.data[o+1]=255*v*0.9;img.data[o+2]=120+135*Math.sin(v*3);}img.data[o+3]=255;}g.putImageData(img,0,0);k.querySelector('#v').textContent=`center ${cx.toFixed(6)} ${cy>=0?'+':''}${cy.toFixed(6)}i, width ${sc.toExponential(2)}`;}
c.onclick=e=>{const rc=c.getBoundingClientRect();cx+=((e.clientX-rc.left)/rc.width-.5)*sc;cy+=((e.clientY-rc.top)/rc.height-.5)*sc*400/600;sc*=e.shiftKey?3:1/3;draw();};k.querySelector('#r').onclick=()=>{cx=-0.6;cy=0;sc=3.2;draw()};k.querySelector('#it').onchange=draw;draw();}};

D.turing={title:"A tiny Turing machine",desc:"This machine adds 1 to a binary number. Head starts at the rightmost digit: 1 → write 0, move left (carry); 0 or blank → write 1 and halt. Every computer is, in principle, this idea with more states and tape.",
run(el){const d=document.createElement('div');el.appendChild(d);let tape,head,state,steps;
const reset=v=>{tape=('_'+v+'_').split('');head=tape.length-2;state='carry';steps=0;draw();};
function step(){if(state!='carry')return;const s=tape[head];if(s=='1'){tape[head]='0';head--;}else{tape[head]='1';state='HALT';}if(head<0){tape.unshift('_');head=0;}steps++;draw();}
function draw(){d.innerHTML=`<div class=demo-ctl><input id=in value="${tape.join('').replace(/_/g,'')}" size=10><button id=ld>Load</button><button id=st>Step</button><button id=ru>Run</button></div><div class=tape>${tape.map((s,i)=>`<span class="cell ${i==head?'hd':''}">${s}</span>`).join('')}</div><p>State: <b>${state}</b> · steps: ${steps}</p><table class=tt><tr><th>State</th><th>Read</th><th>Write</th><th>Move</th><th>Next</th></tr><tr><td>carry</td><td>1</td><td>0</td><td>Left</td><td>carry</td></tr><tr><td>carry</td><td>0 / _</td><td>1</td><td>—</td><td>HALT</td></tr></table>`;
d.querySelector('#st').onclick=step;d.querySelector('#ru').onclick=()=>{let n=0;const iv=setInterval(()=>{step();if(state!='carry'||++n>50)clearInterval(iv)},350)};d.querySelector('#ld').onclick=()=>reset(d.querySelector('#in').value.replace(/[^01]/g,'')||'0');}
reset('1011');}};

D.mobius={title:"Möbius strip",desc:"A rotating Möbius strip. Follow the colored path: it travels the whole surface and returns to the start on the 'other side' — because there is only one side.",
run(el){const [c,g]=cv(el,500,360);let a=0;
return anim(()=>{a+=0.01;g.clearRect(0,0,500,360);const quads=[];const N=120,M=8;
const P=(u,v)=>{const x=(1+v/2*Math.cos(u/2))*Math.cos(u),y=(1+v/2*Math.cos(u/2))*Math.sin(u),z=v/2*Math.sin(u/2);const ca=Math.cos(a),sa=Math.sin(a);const x2=x*ca-y*sa,y2=x*sa+y*ca;const y3=y2*Math.cos(1)-z*Math.sin(1),z3=y2*Math.sin(1)+z*Math.cos(1);return [250+x2*130,180+y3*130,z3];};
for(let i=0;i<N;i++)for(let j=0;j<M;j++){const u0=i/N*2*Math.PI,u1=(i+1)/N*2*Math.PI,v0=-1+j/M*2,v1=-1+(j+1)/M*2;const q=[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];quads.push([q,(q[0][2]+q[2][2])/2,i,j]);}
quads.sort((x,y)=>x[1]-y[1]);const prog=(a*20)%N;
for(const [q,z,i,j] of quads){const shade=Math.floor(120+z*100);const onPath=(j==3||j==4)&&i<prog;g.fillStyle=onPath?'#e07a5f':`rgb(${shade*0.5},${shade*0.7},${shade})`;g.beginPath();q.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();}});}};

D.noneuclid={title:"Triangles in three geometries",desc:"Angle sums of triangles: flat (Euclidean) = 180°; on a sphere (positive curvature) > 180°; on a hyperbolic plane (negative curvature) < 180°. Increase the triangle size to see the deviation grow — the excess or deficit is proportional to area × curvature.",
run(el){const [c,g]=cv(el,640,260);const k=ctl(el,'<label>Triangle size <input type=range min=5 max=100 value=50 id=s></label><span id=v></span>');
function draw(){const s=k.querySelector('#s').value/100;g.clearRect(0,0,640,260);const bulge=[0,-1,1];const names=['Euclidean (flat)','Spherical (K>0)','Hyperbolic (K<0)'];
// equilateral triangle on sphere radius 1 with side s*π/2: angle via spherical law of cosines
const a=s*Math.PI/2*0.95;const sph=Math.acos((Math.cos(a)-Math.cos(a)**2)/(Math.sin(a)**2))*180/Math.PI*3;const hyp=Math.acos((Math.cosh(a*2)-Math.cosh(a*2)**2)/(-(Math.sinh(a*2)**2)))*180/Math.PI*3;
const sums=[180,sph,hyp];
for(let t=0;t<3;t++){const ox=110+t*210,oy=150,R=40+60*s;const V=[0,1,2].map(i=>[ox+R*Math.cos(-Math.PI/2+i*2*Math.PI/3),oy+R*Math.sin(-Math.PI/2+i*2*Math.PI/3)]);
g.strokeStyle=['#3d85c6','#e07a5f','#81b29a'][t];g.lineWidth=3;g.beginPath();g.moveTo(...V[0]);for(let i=0;i<3;i++){const p=V[i],q=V[(i+1)%3];const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;const dx=mx-ox,dy=my-oy;const f=bulge[t]*0.45*s;g.quadraticCurveTo(mx-dx*f*1.0,my-dy*f*1.0,...q);}g.stroke();
g.fillStyle=col('--fg');g.font='14px sans-serif';g.fillText(names[t],ox-60,30);g.font='bold 15px sans-serif';g.fillText('Σ angles ≈ '+sums[t].toFixed(1)+'°',ox-55,250);}
k.querySelector('#v').textContent='(Curved sides show how "straight lines" — geodesics — look when drawn flat.)';}
k.oninput=draw;draw();}};
})();
