// Interactive physics demos. Each: {title, desc, run(el)}; run returns optional cleanup.
(function(){
const D = window.DEMOS = {};
function cv(el,w,h){const c=document.createElement('canvas');const r=window.devicePixelRatio||1;c.width=w*r;c.height=h*r;c.style.width='100%';c.style.maxWidth=w+'px';c.style.aspectRatio=w+'/'+h;const g=c.getContext('2d');g.scale(r,r);el.appendChild(c);return [c,g];}
function ctl(el,html){const d=document.createElement('div');d.className='demo-ctl';d.innerHTML=html;el.appendChild(d);return d;}
function col(n){return getComputedStyle(document.body).getPropertyValue(n).trim()||'#888';}
function anim(fn){let id,run=true,last=performance.now();function f(t){if(!run)return;const dt=Math.max(0,Math.min(0.05,(t-last)/1000));last=t;fn(dt,t);id=requestAnimationFrame(f);}id=requestAnimationFrame(f);return()=>{run=false;cancelAnimationFrame(id);};}
const V=(k,id)=>+k.querySelector('#'+id).value;
const txt=(g,s,x,y,c,f)=>{g.fillStyle=c||col('--fg');g.font=f||'13px sans-serif';g.fillText(s,x,y);};
function wl2rgb(nm){let r=0,g=0,b=0;if(nm>=380&&nm<440){r=-(nm-440)/60;b=1}else if(nm<490){g=(nm-440)/50;b=1}else if(nm<510){g=1;b=-(nm-510)/20}else if(nm<580){r=(nm-510)/70;g=1}else if(nm<645){r=1;g=-(nm-645)/65}else if(nm<=780){r=1}let f=1;if(nm<420&&nm>=380)f=.3+.7*(nm-380)/40;else if(nm>700)f=.3+.7*(780-nm)/80;if(nm<380||nm>780)return 'rgb(120,120,120)';return `rgb(${Math.round(255*r*f)},${Math.round(255*g*f)},${Math.round(255*b*f)})`;}

D.projectile={title:"Galileo's projectile: two independent motions",desc:"A ball is launched at an angle. Horizontally it moves steadily (inertia); vertically it falls with constant acceleration. Together: a parabola. The grey ball is simply dropped from the launch height at the same moment — notice it falls exactly in step with the launched ball's vertical motion. No air resistance.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Angle <input type=range id=a min=5 max=85 value=45></label><label>Speed <input type=range id=v min=5 max=30 value=20></label><label>Height <input type=range id=h min=0 max=20 value=0></label><button id=go>Launch</button><span id=o></span>');
let t=0,running=false;const G=9.81;k.querySelector('#go').onclick=()=>{t=0;running=true};k.oninput=()=>{t=0;running=false};
return anim(dt=>{if(running)t+=dt;const a=V(k,'a')*Math.PI/180,v=V(k,'v'),h=V(k,'h');const vx=v*Math.cos(a),vy=v*Math.sin(a);const T=(vy+Math.sqrt(vy*vy+2*G*h))/G;const R=vx*T,H=h+vy*vy/2/G;
const sc=Math.min(560/Math.max(R,10),260/Math.max(H,5)),ox=40,oy=310;if(t>T){t=T;running=false;}
g.clearRect(0,0,640,340);g.strokeStyle=col('--muted');g.beginPath();g.moveTo(20,oy);g.lineTo(630,oy);g.stroke();
g.setLineDash([4,4]);g.strokeStyle='#3d85c6';g.beginPath();for(let s=0;s<=T;s+=T/100){const x=ox+vx*s*sc,y=oy-(h+vy*s-G*s*s/2)*sc;s?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.setLineDash([]);
const x=ox+vx*t*sc,y=oy-(h+vy*t-G*t*t/2)*sc,yd=oy-Math.max(0,h-G*t*t/2)*sc;
g.fillStyle='#999';g.beginPath();g.arc(ox-15,yd,6,0,7);g.fill();g.fillStyle='#e07a5f';g.beginPath();g.arc(x,y,7,0,7);g.fill();
g.strokeStyle='#81b29a';g.beginPath();g.moveTo(x,y);g.lineTo(x+(vx)*3,y);g.moveTo(x,y);g.lineTo(x,y-(vy-G*t)*3);g.stroke();
txt(g,'green arrows: horizontal velocity (constant) and vertical velocity (changing)',20,20,col('--muted'),'12px sans-serif');
k.querySelector('#o').innerHTML=`Range <b>${R.toFixed(1)} m</b> · max height ${H.toFixed(1)} m · flight ${T.toFixed(2)} s`;});}};

D.pendulum={title:"The pendulum: isochronism and its limits",desc:"Simulated exactly (full nonlinear equation). For small swings the period is almost independent of amplitude and equals 2π√(L/g). Try large amplitudes: the true period grows — Galileo's isochronism is only approximate, which is why Huygens invented the cycloidal pendulum.",
run(el){const [c,g]=cv(el,640,320);const k=ctl(el,'<label>Length L (m) <input type=range id=L min=0.2 max=3 step=0.1 value=1></label><label>Amplitude (°) <input type=range id=A min=2 max=170 value=20></label><label>g <select id=g><option value=9.81>Earth 9.81</option><option value=1.62>Moon 1.62</option><option value=24.8>Jupiter 24.8</option></select></label><span id=o></span>');
let th,w,tt,lastCross,period=0,prev;const reset=()=>{th=V(k,'A')*Math.PI/180;w=0;tt=0;lastCross=null;period=0;prev=th;};reset();k.oninput=reset;k.querySelector('#g').onchange=reset;const hist=[];
return anim(dt=>{const L=V(k,'L'),G=+k.querySelector('#g').value;const n=20,h=dt/n;for(let i=0;i<n;i++){const f=(a)=>-G/L*Math.sin(a);const k1=w,l1=f(th),k2=w+h/2*l1,l2=f(th+h/2*k1),k3=w+h/2*l2,l3=f(th+h/2*k2),k4=w+h*l3,l4=f(th+h*k3);const nth=th+h/6*(k1+2*k2+2*k3+k4);w+=h/6*(l1+2*l2+2*l3+l4);tt+=h;if(prev>0&&nth<=0&&w<0){if(lastCross!=null)period=tt-lastCross;lastCross=tt;}prev=nth;th=nth;}
hist.push(th);if(hist.length>300)hist.shift();
g.clearRect(0,0,640,320);const px=160,py=30,R=110*Math.min(1.6,Math.sqrt(L));const bx=px+R*Math.sin(th),by=py+R*Math.cos(th);g.strokeStyle=col('--fg');g.lineWidth=2;g.beginPath();g.moveTo(px-40,py);g.lineTo(px+40,py);g.moveTo(px,py);g.lineTo(bx,by);g.stroke();g.fillStyle='#3d85c6';g.beginPath();g.arc(bx,by,12,0,7);g.fill();
g.strokeStyle=col('--muted');g.lineWidth=1;g.beginPath();g.moveTo(330,160);g.lineTo(630,160);g.stroke();g.strokeStyle='#e07a5f';g.lineWidth=2;g.beginPath();hist.forEach((a,i)=>{const x=330+i,y=160-a*60;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();txt(g,'angle vs time',330,20,col('--muted'));
const T0=2*Math.PI*Math.sqrt(L/G);k.querySelector('#o').innerHTML=`Small-angle formula T₀ = ${T0.toFixed(3)} s · simulated T = ${period?period.toFixed(3)+' s':'…'}${period?` (${((period/T0-1)*100).toFixed(1)}% longer)`:''}`;});}};

D.kepler={title:"Kepler's laws: ellipses and equal areas",desc:"A planet orbits the Sun (at one focus). Coloured wedges are swept in equal time intervals — they have equal areas even though the planet moves fast near the Sun and slowly far away (Kepler's 2nd law, i.e. conservation of angular momentum). Change eccentricity and size to explore the 3rd law: T² ∝ a³.",
run(el){const [c,g]=cv(el,640,380);const k=ctl(el,'<label>Eccentricity <input type=range id=e min=0 max=0.9 step=0.01 value=0.6></label><label>Semi-major axis a (AU) <input type=range id=a min=0.4 max=2 step=0.05 value=1></label><span id=o></span>');
let M=0;const cols=['#e07a5f55','#3d85c655','#81b29a55','#f2cc8f88','#9b5de555','#e0b0ff55'];
return anim(dt=>{const e=V(k,'e'),a=V(k,'a');const T=Math.pow(a,1.5);M+=dt*2*Math.PI/(T*4);const S=150,cx=320,cy=190;const A=a*S,B=A*Math.sqrt(1-e*e),fx=cx+A*e;
const pos=Mm=>{let E=Mm;for(let i=0;i<30;i++)E=E-(E-e*Math.sin(E)-Mm)/(1-e*Math.cos(E));return [cx+A*Math.cos(E),cy-B*Math.sin(E)];};
g.clearRect(0,0,640,380);g.strokeStyle=col('--muted');g.beginPath();g.ellipse(cx,cy,A,B,0,0,7);g.stroke();
for(let s=0;s<6;s++){const m0=s*2*Math.PI/12*2,m1=m0+2*Math.PI/12;g.fillStyle=cols[s];g.beginPath();g.moveTo(fx,cy);for(let j=0;j<=20;j++){const p=pos(m0+(m1-m0)*j/20);g.lineTo(p[0],p[1]);}g.closePath();g.fill();}
g.fillStyle='#f4a261';g.beginPath();g.arc(fx,cy,12,0,7);g.fill();const p=pos(M),p2=pos(M+.01);g.fillStyle='#3d85c6';g.beginPath();g.arc(p[0],p[1],7,0,7);g.fill();
const r=Math.hypot(p[0]-fx,p[1]-cy)/S,v=Math.sqrt(2/r-1/a);g.strokeStyle='#3d85c6';g.beginPath();g.moveTo(fx,cy);g.lineTo(p[0],p[1]);g.stroke();
txt(g,'Each wedge = same time interval (1/12 orbit) → same area',12,20,col('--muted'));
k.querySelector('#o').innerHTML=`Period T = ${T.toFixed(2)} yr (T² = ${(T*T).toFixed(2)} = a³ = ${(a*a*a).toFixed(2)}) · distance ${r.toFixed(2)} AU · speed ${(29.8*v).toFixed(1)} km/s`;});}};

D.interference={title:"Double-slit interference",desc:"Waves from two slits overlap. Bright where crests meet crests, dark where crests meet troughs. The graph on the right is the brightness on the screen. Tick 'which-slit detector' to see what happens when we learn which slit each particle took: the interference disappears and you get just two humps (as in quantum experiments with electrons and photons).",
run(el){const W=640,H=320;const [c,g]=cv(el,W,H);const k=ctl(el,'<label>Wavelength <input type=range id=l min=8 max=40 value=18></label><label>Slit separation <input type=range id=d min=20 max=140 value=60></label><label><input type=checkbox id=w> which-slit detector</label><label><input type=checkbox id=an checked> animate</label>');
const img=g.createImageData?null:null;let ph=0;const off=document.createElement('canvas');off.width=200;off.height=160;const og=off.getContext('2d');const id=og.createImageData(200,160);
return anim(dt=>{if(k.querySelector('#an').checked)ph+=dt*4;const lam=V(k,'l'),d=V(k,'d'),wh=k.querySelector('#w').checked;const kk=2*Math.PI/lam;const sx=40,s1=H/2-d/2,s2=H/2+d/2;
for(let j=0;j<160;j++)for(let i=0;i<200;i++){const x=i*2.4+sx+2,y=j*2;const r1=Math.hypot(x-sx,y-s1),r2=Math.hypot(x-sx,y-s2);let v;if(wh){v=(Math.cos(kk*r1-ph)/Math.sqrt(r1+20))**2+(Math.cos(kk*r2-ph)/Math.sqrt(r2+20))**2;v*=10;}else{v=(Math.cos(kk*r1-ph)/Math.sqrt(r1+20)+Math.cos(kk*r2-ph)/Math.sqrt(r2+20))*6;v=v*v/2;}const q=Math.min(255,v*180);const o=(j*200+i)*4;id.data[o]=q*0.4;id.data[o+1]=q*0.7;id.data[o+2]=q;id.data[o+3]=255;}
og.putImageData(id,0,0);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=true;g.drawImage(off,sx,0,480,H);g.fillStyle=col('--fg');g.fillRect(sx-4,0,4,H);g.clearRect(sx-4,s1-4,4,8);g.clearRect(sx-4,s2-4,4,8);
const L=480;g.strokeStyle='#f2cc8f';g.lineWidth=2;g.beginPath();for(let y=0;y<H;y++){const r1=Math.hypot(L,y-s1),r2=Math.hypot(L,y-s2);const env=1;const I=wh?(Math.exp(-(((y-s1)/90)**2))+Math.exp(-(((y-s2)/90)**2)))/2:Math.cos(kk*(r1-r2)/2)**2*(Math.exp(-(((y-s1)/90)**2))+Math.exp(-(((y-s2)/90)**2)))/2*2;const x=530+I*90;y?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.lineWidth=1;txt(g,'screen',560,14,col('--muted'));});}};

D.doppler={title:"Doppler effect and the sound barrier",desc:"A moving source emits circular wavefronts, each centred where the source was when it was emitted. Ahead, wavefronts bunch up (higher pitch); behind, they spread out (lower pitch). Push the speed past the wave speed (Mach 1) to see a shock cone — a sonic boom.",
run(el){const [c,g]=cv(el,640,320);const k=ctl(el,'<label>Source speed / wave speed <input type=range id=v min=0 max=1.8 step=0.05 value=0.5></label><span id=o></span>');let t=0,x=60,waves=[],lastE=0;k.oninput=()=>{x=60;waves=[];};
return anim(dt=>{t+=dt;const m=V(k,'v'),cw=110;x+=m*cw*dt;if(x>600){x=60;waves=[];}if(t-lastE>0.25){waves.push([x,t]);lastE=t;}waves=waves.filter(w=>(t-w[1])*cw<700);
g.clearRect(0,0,640,320);g.strokeStyle='#3d85c6';waves.forEach(w=>{g.beginPath();g.arc(w[0],160,(t-w[1])*cw,0,7);g.stroke();});g.fillStyle='#e07a5f';g.beginPath();g.arc(x,160,8,0,7);g.fill();
const f0=440;k.querySelector('#o').innerHTML=m<1?`Emitted 440 Hz → heard ahead <b>${(f0/(1-m)).toFixed(0)} Hz</b>, behind <b>${(f0/(1+m)).toFixed(0)} Hz</b>`:`Mach ${m.toFixed(2)}: supersonic — shock cone half-angle ${(Math.asin(1/m)*180/Math.PI).toFixed(0)}°`;});}};

D.fieldlines={title:"Electric field lines of two charges",desc:"Faraday's picture: lines start on positive charges and end on negative ones; where they crowd, the field is strong. Change the charges' signs and sizes. Like charges: lines push apart (repulsion). Opposite charges: lines connect (attraction).",
run(el){const [c,g]=cv(el,640,380);const k=ctl(el,'<label>Left charge <input type=range id=q1 min=-3 max=3 value=2></label><label>Right charge <input type=range id=q2 min=-3 max=3 value=-2></label><label>Separation <input type=range id=s min=60 max=360 value=220></label>');
function draw(){const q1=V(k,'q1'),q2=V(k,'q2'),s=V(k,'s');const Q=[[320-s/2,190,q1],[320+s/2,190,q2]];g.clearRect(0,0,640,380);
const E=(x,y)=>{let ex=0,ey=0;Q.forEach(([qx,qy,q])=>{const dx=x-qx,dy=y-qy,r2=dx*dx+dy*dy,r=Math.sqrt(r2);ex+=q*dx/(r2*r);ey+=q*dy/(r2*r);});return [ex,ey];};
g.strokeStyle=col('--muted');g.lineWidth=1.2;Q.forEach(([qx,qy,q])=>{if(q==0)return;const n=Math.abs(q)*8;for(let i=0;i<n;i++){const a=2*Math.PI*i/n;let x=qx+8*Math.cos(a),y=qy+8*Math.sin(a);const dir=q>0?1:-1;g.beginPath();g.moveTo(x,y);for(let st=0;st<900;st++){const [ex,ey]=E(x,y);const m=Math.hypot(ex,ey);if(!m)break;x+=dir*2*ex/m;y+=dir*2*ey/m;g.lineTo(x,y);if(x<0||x>640||y<0||y>380)break;if(Q.some(([a2,b2,q2])=>q2*dir<0&&Math.hypot(x-a2,y-b2)<6))break;}g.stroke();}});
Q.forEach(([qx,qy,q])=>{g.fillStyle=q>0?'#e07a5f':q<0?'#3d85c6':'#999';g.beginPath();g.arc(qx,qy,12,0,7);g.fill();txt(g,q>0?'+'+q:q<0?String(q):'0',qx-7,qy+5,'#fff','bold 13px sans-serif');});}
k.oninput=draw;draw();}};

D.carnot={title:"The Carnot cycle on a pressure–volume diagram",desc:"An ideal gas engine runs between a hot reservoir T_H and a cold one T_C: isothermal expansion (absorbs heat), adiabatic expansion (cools), isothermal compression (releases heat), adiabatic compression (warms). The enclosed area is the net work. Efficiency depends only on the two temperatures.",
run(el){const [c,g]=cv(el,640,360);const k=ctl(el,'<label>T_H (K) <input type=range id=th min=350 max=1500 value=800></label><label>T_C (K) <input type=range id=tc min=200 max=600 value=300></label><span id=o></span>');let u=0;
return anim(dt=>{let TH=V(k,'th'),TC=Math.min(V(k,'tc'),TH-20);const gm=1.4,n=1,R=8.314;const V1=1,V2=2.5;const V3=V2*Math.pow(TH/TC,1/(gm-1)),V4=V1*Math.pow(TH/TC,1/(gm-1));
const P=(Vv,T)=>n*R*T/Vv;const segs=[[V1,V2,'iso',TH],[V2,V3,'adi',TH],[V3,V4,'iso',TC],[V4,V1,'adi',TC]];const pts=[];segs.forEach(([a,b,ty,T])=>{for(let i=0;i<=60;i++){const Vv=a+(b-a)*i/60;let p;if(ty=='iso')p=P(Vv,T);else{const p0=P(a,T);p=p0*Math.pow(a/Vv,gm);}pts.push([Vv,p]);}});
const vmax=Math.max(V3,V4)*1.05,pmax=P(V1,TH)*1.05;const X=v=>60+v/vmax*550,Y=p=>320-p/pmax*290;g.clearRect(0,0,640,360);g.strokeStyle=col('--muted');g.beginPath();g.moveTo(60,10);g.lineTo(60,320);g.lineTo(620,320);g.stroke();txt(g,'Volume →',560,340,col('--muted'));txt(g,'Pressure',8,20,col('--muted'));
g.fillStyle='rgba(129,178,154,.3)';g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.fill();
const cl=['#e07a5f','#9b5de5','#3d85c6','#9b5de5'];segs.forEach((s,j)=>{g.strokeStyle=cl[j];g.lineWidth=3;g.beginPath();for(let i=0;i<=60;i++){const p=pts[j*61+i];i?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1]));}g.stroke();});g.lineWidth=1;
u=(u+dt*0.25)%1;const p=pts[Math.floor(u*pts.length)];g.fillStyle=col('--fg');g.beginPath();g.arc(X(p[0]),Y(p[1]),6,0,7);g.fill();
const names=['1→2 isothermal expansion at T_H (heat in)','2→3 adiabatic expansion (cools)','3→4 isothermal compression at T_C (heat out)','4→1 adiabatic compression (warms)'];txt(g,names[Math.floor(u*4)],300,30);
k.querySelector('#o').innerHTML=`Carnot efficiency η = 1 − T_C/T_H = <b>${((1-TC/TH)*100).toFixed(1)}%</b>`;});}};

D.gas={title:"Ideal gas: molecules make pressure",desc:"Each dot is a molecule. Pressure is the average push of molecules bouncing off the walls; temperature sets their average speed. Squeeze the volume or heat the gas and watch the measured pressure rise, keeping PV/T roughly constant. The histogram shows the Maxwell–Boltzmann spread of speeds.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Temperature <input type=range id=T min=50 max=600 value=300></label><label>Volume (box width) <input type=range id=W min=120 max=400 value=360></label><span id=o></span>');
const N=160;let P=[];for(let i=0;i<N;i++){const a=Math.random()*7,s=Math.sqrt(-2*Math.log(Math.random()+1e-9));P.push({x:20+Math.random()*300,y:20+Math.random()*280,vx:0,vy:0});}let Tcur=300;const setT=T=>{const f=Math.sqrt(T/Tcur);P.forEach(p=>{p.vx*=f;p.vy*=f;});Tcur=T;};
P.forEach(p=>{const a=Math.random()*7;const s=60*Math.sqrt(-2*Math.log(Math.random()+1e-9));p.vx=s*Math.cos(a);p.vy=s*Math.sin(a);});
let imp=0,acc=0,pAvg=0;
return anim(dt=>{const T=V(k,'T');if(T!=Tcur){const ke=P.reduce((s,p)=>s+p.vx*p.vx+p.vy*p.vy,0)/N;const target=ke*T/Tcur;setT(T);}const W=V(k,'W');const x0=20,y0=20,Hh=280;
P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<x0){p.x=2*x0-p.x;p.vx*=-1;imp+=2*Math.abs(p.vx);}if(p.x>x0+W){p.x=Math.max(x0+1,Math.min(2*(x0+W)-p.x,x0+W));p.vx=-Math.abs(p.vx);imp+=2*Math.abs(p.vx);}if(p.y<y0){p.y=2*y0-p.y;p.vy*=-1;imp+=2*Math.abs(p.vy);}if(p.y>y0+Hh){p.y=2*(y0+Hh)-p.y;p.vy*=-1;imp+=2*Math.abs(p.vy);}});
// random pair collisions for thermalization
for(let i=0;i<8;i++){const a=P[Math.floor(Math.random()*N)],b=P[Math.floor(Math.random()*N)];if(a!==b&&Math.hypot(a.x-b.x,a.y-b.y)<12){const t1=a.vx;a.vx=b.vx;b.vx=t1;}}
acc+=dt;if(acc>0.5){const per=2*(W+Hh);const p=imp/acc/per;pAvg=pAvg?pAvg*0.6+p*0.4:p;imp=0;acc=0;}
g.clearRect(0,0,640,340);g.strokeStyle=col('--fg');g.lineWidth=2;g.strokeRect(x0,y0,W,Hh);g.fillStyle='#888';g.fillRect(x0+W,y0,6,Hh);g.lineWidth=1;g.fillStyle='#3d85c6';P.forEach(p=>{g.beginPath();g.arc(p.x,p.y,3,0,7);g.fill();});
const bins=new Array(20).fill(0);P.forEach(p=>{const s=Math.hypot(p.vx,p.vy);const b=Math.min(19,Math.floor(s/(9*Math.sqrt(T/300))));bins[b]++;});const hx=450,hy=300;txt(g,'speed distribution',hx,30,col('--muted'));bins.forEach((b,i)=>{g.fillStyle='#e07a5f';g.fillRect(hx+i*8,hy-b*3,7,b*3);});
const area=W*Hh/1e4;k.querySelector('#o').innerHTML=`Measured pressure P ≈ ${pAvg.toFixed(1)} · volume V ∝ ${area.toFixed(1)} · PV/T ≈ ${(pAvg*area/T).toFixed(3)} (should stay ~constant)`;});}};

D.entropy={title:"Entropy: why gases mix and never unmix",desc:"Molecules start in the left half. Remove the partition and they spread out. Nothing forbids them from all returning to the left — but there are astronomically more arrangements with them spread out. Entropy S = k ln W counts those arrangements; the graph shows it rising to its maximum and then only flickering.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Molecules <input type=range id=n min=4 max=200 value=80></label><button id=r>Reset (all on left)</button><span id=o></span>');let P=[],hist=[],open=false;
const lnC=(n,r)=>{let s=0;for(let i=1;i<=r;i++)s+=Math.log((n-r+i)/i);return s;};
const reset=()=>{const N=V(k,'n');P=[];for(let i=0;i<N;i++){const a=Math.random()*7;P.push({x:25+Math.random()*130,y:25+Math.random()*270,vx:90*Math.cos(a),vy:90*Math.sin(a)});}hist=[];open=false;setTimeout(()=>open=true,800);};reset();k.querySelector('#r').onclick=reset;k.querySelector('#n').oninput=reset;
return anim(dt=>{P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<20){p.x=40-p.x;p.vx*=-1}if(p.x>340){p.x=680-p.x;p.vx*=-1}if(p.y<20){p.y=40-p.y;p.vy*=-1}if(p.y>300){p.y=600-p.y;p.vy*=-1}if(!open&&p.x>178&&p.vx>0){p.x=356-p.x;p.vx*=-1}});
const N=P.length,nl=P.filter(p=>p.x<180).length;const S=lnC(N,nl),Smax=lnC(N,Math.floor(N/2));hist.push(S/Smax);if(hist.length>260)hist.shift();
g.clearRect(0,0,640,340);g.strokeStyle=col('--fg');g.strokeRect(20,20,320,280);if(!open){g.lineWidth=3;g.beginPath();g.moveTo(180,20);g.lineTo(180,300);g.stroke();g.lineWidth=1;}else{g.setLineDash([3,5]);g.beginPath();g.moveTo(180,20);g.lineTo(180,300);g.stroke();g.setLineDash([]);}
g.fillStyle='#e07a5f';P.forEach(p=>{g.beginPath();g.arc(p.x,p.y,3,0,7);g.fill();});
g.strokeStyle=col('--muted');g.strokeRect(370,40,260,200);g.strokeStyle='#81b29a';g.lineWidth=2;g.beginPath();hist.forEach((h,i)=>{const x=370+i,y=240-h*190;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();g.lineWidth=1;txt(g,'entropy / max entropy',370,30,col('--muted'));
const pAll=Math.pow(0.5,N);k.querySelector('#o').innerHTML=`Left: ${nl}, right: ${N-nl} · arrangements W = C(${N},${nl}) ≈ e^${S.toFixed(1)} · chance all ${N} are on the left at a given moment: ${pAll<1e-300?'< 10⁻³⁰⁰':pAll.toExponential(1)}`;});}};

D.lightclock={title:"Light clocks and time dilation",desc:"Each clock is a light pulse bouncing between two mirrors; one bounce = one tick. Seen from the platform, the moving clock's light travels a longer zig-zag path at the same speed c — so it ticks more slowly. Raise the speed toward c and compare tick counts.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Speed v/c <input type=range id=v min=0 max=0.99 step=0.01 value=0.6></label><button id=r>Reset</button><span id=o></span>');let t=0;k.querySelector('#r').onclick=()=>t=0;k.oninput=()=>t=0;
return anim(dt=>{t+=dt;const b=V(k,'v'),gm=1/Math.sqrt(1-b*b);const Hh=110,cp=150;const T0=2*Hh/cp;
g.clearRect(0,0,640,340);const draw=(x,y,ph,label,n)=>{g.strokeStyle=col('--fg');g.lineWidth=3;g.beginPath();g.moveTo(x-25,y);g.lineTo(x+25,y);g.moveTo(x-25,y-Hh);g.lineTo(x+25,y-Hh);g.stroke();g.lineWidth=1;const f=ph%1,hy=f<.5?y-f*2*Hh:y-(1-f)*2*Hh;g.fillStyle='#f2cc8f';g.beginPath();g.arc(x,hy,6,0,7);g.fill();txt(g,label,x-40,y+20);txt(g,'ticks: '+n,x-40,y+38,'#e07a5f','bold 14px sans-serif');};
draw(80,150,t/T0,'at rest',Math.floor(t/T0));
const span=500,xm=130+((t*b*cp)%span);const ph=t/(T0*gm);
g.strokeStyle='#f2cc8f88';g.beginPath();const st=Math.max(0,t-3);for(let s=st;s<=t;s+=0.01){const xx=130+((s*b*cp)%span),f=(s/(T0*gm))%1,yy=f<.5?310-f*2*Hh:310-(1-f)*2*Hh;if(xx<130+((Math.max(st,s-0.01))*b*cp)%span-5){g.stroke();g.beginPath();g.moveTo(xx,yy);}else g.lineTo(xx,yy);}g.stroke();
draw(xm,310,ph,'moving at '+b.toFixed(2)+'c',Math.floor(ph));
k.querySelector('#o').innerHTML=`γ = 1/√(1−v²/c²) = <b>${gm.toFixed(3)}</b>: the moving clock ticks ${gm.toFixed(2)}× slower as seen from the platform.`;});}};

D.lorentz={title:"Spacetime diagram & Lorentz transformation",desc:"Horizontal axis: space x; vertical: time ct. Light travels on the 45° lines. A moving observer's time axis (ct′) and space axis (x′) tilt symmetrically toward the light line. Events A and B lie on a horizontal line — simultaneous for you — but on different x′-parallel lines: not simultaneous for the moving observer (relativity of simultaneity).",
run(el){const [c,g]=cv(el,520,520);const k=ctl(el,'<label>Observer speed v/c <input type=range id=v min=-0.9 max=0.9 step=0.01 value=0.5></label><span id=o></span>');
function draw(){const b=V(k,'v'),gm=1/Math.sqrt(1-b*b);const O=260,S=50;const X=x=>O+x*S,Y=t=>O-t*S;g.clearRect(0,0,520,520);
g.strokeStyle=col('--border')||'#ccc';for(let i=-5;i<=5;i++){g.beginPath();g.moveTo(X(i),0);g.lineTo(X(i),520);g.moveTo(0,Y(i));g.lineTo(520,Y(i));g.stroke();}
g.strokeStyle='#f2cc8f';g.lineWidth=2;g.beginPath();g.moveTo(X(-6),Y(-6));g.lineTo(X(6),Y(6));g.moveTo(X(-6),Y(6));g.lineTo(X(6),Y(-6));g.stroke();
g.strokeStyle=col('--fg');g.beginPath();g.moveTo(X(-6),Y(0));g.lineTo(X(6),Y(0));g.moveTo(X(0),Y(-6));g.lineTo(X(0),Y(6));g.stroke();
// primed grid: lines of constant t' and x'
g.lineWidth=1;g.strokeStyle='#3d85c655';for(let i=-5;i<=5;i++){// x'=i: x = gamma(i + b t')..., param by t'
g.beginPath();for(let tp=-8;tp<=8;tp+=16){const x=gm*(i+b*tp),t=gm*(tp+b*i);tp<0?g.moveTo(X(x),Y(t)):g.lineTo(X(x),Y(t));}g.stroke();g.beginPath();for(let xp=-8;xp<=8;xp+=16){const x=gm*(xp+b*i),t=gm*(i+b*xp);xp<0?g.moveTo(X(x),Y(t)):g.lineTo(X(x),Y(t));}g.stroke();}
g.lineWidth=2.5;g.strokeStyle='#3d85c6';g.beginPath();g.moveTo(X(-6*b),Y(-6));g.lineTo(X(6*b),Y(6));g.moveTo(X(-6),Y(-6*b));g.lineTo(X(6),Y(6*b));g.stroke();g.lineWidth=1;
txt(g,'x',505,O-6);txt(g,'ct',O+6,14);txt(g,"ct′",X(4.6*b)+6,Y(4.6),'#3d85c6');txt(g,"x′",X(4.6)+4,Y(4.6*b)-6,'#3d85c6');txt(g,'light',X(4.4)+4,Y(4.8),'#c9a227');
const ev=[['A',-2.5,1],['B',2.5,1]];ev.forEach(([n,x,t])=>{g.fillStyle='#e07a5f';g.beginPath();g.arc(X(x),Y(t),6,0,7);g.fill();txt(g,n,X(x)+8,Y(t)-6,'#e07a5f','bold 14px sans-serif');});
const tp=([n,x,t])=>gm*(t-b*x);k.querySelector('#o').innerHTML=`γ = ${gm.toFixed(3)} · In your frame A and B both happen at ct = 1. In the moving frame: ct′(A) = ${tp(ev[0]).toFixed(2)}, ct′(B) = ${tp(ev[1]).toFixed(2)}.`;}
k.oninput=draw;draw();}};

D.photoelectric={title:"Photoelectric effect",desc:"Light shines on a metal. Each photon carries energy E = hf. If that exceeds the metal's work function φ, it can free one electron with kinetic energy hf − φ. Brightness changes how many photons (and electrons) there are — not each electron's energy. Try bright red light on sodium: nothing happens.",
run(el){const [c,g]=cv(el,640,320);const k=ctl(el,'<label>Wavelength (nm) <input type=range id=l min=150 max=750 value=400></label><label>Brightness <input type=range id=I min=1 max=20 value=8></label><label>Metal <select id=m><option value=2.28>Sodium (φ≈2.3 eV)</option><option value=4.3>Zinc (φ≈4.3 eV)</option><option value=5.1>Gold (φ≈5.1 eV)</option><option value=2.1>Caesium (φ≈2.1 eV)</option></select></label><span id=o></span>');
let ph=[],el2=[],acc=0;
return anim(dt=>{const lam=V(k,'l'),I=V(k,'I'),phi=+k.querySelector('#m').value;const E=1240/lam,K=E-phi;acc+=dt*I*3;while(acc>1){acc--;ph.push({x:40+Math.random()*120,y:20+Math.random()*30});}
g.clearRect(0,0,640,320);g.fillStyle='#999';g.fillRect(220,40,30,240);txt(g,'metal',215,300,col('--muted'));
const colr=wl2rgb(lam);ph.forEach(p=>{p.x+=dt*260;p.y+=dt*120;});ph=ph.filter(p=>{if(p.x>=220){if(K>0)el2.push({x:250,y:p.y,v:40*Math.sqrt(K)+20});return false;}return true;});
g.strokeStyle=colr;g.lineWidth=2;ph.forEach(p=>{g.beginPath();for(let s=0;s<16;s++){const xx=p.x-s*1.6,yy=p.y-s*0.75+Math.sin(s*1.4)*3;s?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();});g.lineWidth=1;
el2.forEach(e=>e.x+=e.v*dt*3);el2=el2.filter(e=>e.x<640);g.fillStyle='#3d85c6';el2.forEach(e=>{g.beginPath();g.arc(e.x,e.y,4,0,7);g.fill();});
txt(g,lam<380?'ultraviolet (invisible)':lam>700?'deep red':'',40,300,col('--muted'));
k.querySelector('#o').innerHTML=`Photon energy hf = ${E.toFixed(2)} eV · ${K>0?`electron kinetic energy up to <b>${K.toFixed(2)} eV</b>`:'<b>below threshold — no electrons, however bright</b>'}`;});}};

D.bohr={title:"Bohr atom: energy levels and spectral lines",desc:"Hydrogen's electron can only have energies Eₙ = −13.6 eV/n². Choose a jump from an upper level to a lower one: the emitted photon carries exactly the energy difference, which fixes its wavelength and colour. Jumps down to n = 2 give the visible Balmer series.",
run(el){const [c,g]=cv(el,640,360);const k=ctl(el,'<label>From n = <select id=a><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option><option>7</option></select></label><label>to n = <select id=b><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label><span id=o></span>');let t=0;
return anim(dt=>{t+=dt;let a=+k.querySelector('#a').value,b=+k.querySelector('#b').value;g.clearRect(0,0,640,360);const Y=E=>40+(-E/13.6)*0+ (1+E/13.6)*0;const yE=E=>330-290*(1-Math.pow(-E/13.6,0.4));
for(let n=1;n<=7;n++){const E=-13.6/n/n,y=yE(E);g.strokeStyle=col('--muted');g.beginPath();g.moveTo(40,y);g.lineTo(260,y);g.stroke();if(n<=5)txt(g,`n=${n}  ${E.toFixed(2)} eV`,270,y+4,col('--muted'),'11px sans-serif');else if(n==6)txt(g,'n=6, 7 … → 0 eV',270,y-2,col('--muted'),'11px sans-serif');}txt(g,'(vertical scale compressed)',40,24,col('--muted'),'11px sans-serif');
const cx=480,cy=170;for(let n=1;n<=4;n++){g.strokeStyle=col('--border')||'#ccc';g.beginPath();g.arc(cx,cy,n*n*9+6,0,7);g.stroke();}g.fillStyle='#e07a5f';g.beginPath();g.arc(cx,cy,5,0,7);g.fill();
const valid=a>b;const r=valid?((t%2)<1?a:b):a;const ang=t*3/(r);const rr=Math.min(r*r*9+6,150);g.fillStyle='#3d85c6';g.beginPath();g.arc(cx+rr*Math.cos(ang),cy+rr*Math.sin(ang),5,0,7);g.fill();
if(!valid){k.querySelector('#o').textContent='Choose an upper level above the lower one.';return;}
const dE=13.6*(1/b/b-1/a/a),lam=1240/dE;g.strokeStyle=wl2rgb(lam);g.lineWidth=3;g.beginPath();g.moveTo(150,yE(-13.6/a/a));g.lineTo(150,yE(-13.6/b/b));g.stroke();g.lineWidth=1;
// spectrum bar
const sx=40,sw=560,sy=345;for(let nm=380;nm<=750;nm+=2){g.fillStyle=wl2rgb(nm)+'';g.globalAlpha=.25;g.fillRect(sx+(nm-380)/370*sw,sy-12,3,12);}g.globalAlpha=1;
[3,4,5,6,7].forEach(n=>{const l=1240/(13.6*(1/4-1/n/n));g.fillStyle=wl2rgb(l);g.fillRect(sx+(l-380)/370*sw,sy-12,3,12);});
const series=b==1?'Lyman (ultraviolet)':b==2?'Balmer (visible)':b==3?'Paschen (infrared)':'Brackett (infrared)';k.querySelector('#o').innerHTML=`Photon energy ${dE.toFixed(2)} eV → wavelength <b>${lam.toFixed(0)} nm</b> · ${series} series`;});}};

D.box={title:"Particle in a box: quantized standing waves",desc:"An electron trapped between two walls can only have wavefunctions that fit as whole half-wavelengths — like a guitar string. Each fit (n = 1, 2, 3…) has energy ∝ n². The blue curve is ψ (oscillating in time); the orange area is |ψ|², the probability of finding the particle. Superpose n = 1 and 2 to see the probability slosh back and forth.",
run(el){const [c,g]=cv(el,640,320);const k=ctl(el,'<label>State n <input type=range id=n min=1 max=8 value=1></label><label><input type=checkbox id=s> superpose n=1 and n=2</label><span id=o></span>');let t=0;
return anim(dt=>{t+=dt;const n=V(k,'n'),sup=k.querySelector('#s').checked;const x0=60,L=520,base=250;g.clearRect(0,0,640,320);g.fillStyle='#8888';g.fillRect(x0-10,30,10,240);g.fillRect(x0+L,30,10,240);
const psi=(x)=>{const w=m=>m*m*1.2;if(!sup){const a=Math.sin(n*Math.PI*x);return [a*Math.cos(w(n)*t),-a*Math.sin(w(n)*t)];}const a1=Math.sin(Math.PI*x)/Math.SQRT2,a2=Math.sin(2*Math.PI*x)/Math.SQRT2;return [a1*Math.cos(w(1)*t)+a2*Math.cos(w(2)*t),-a1*Math.sin(w(1)*t)-a2*Math.sin(w(2)*t)];};
g.fillStyle='rgba(242,140,40,.35)';g.beginPath();g.moveTo(x0,base);for(let i=0;i<=200;i++){const x=i/200,p=psi(x);g.lineTo(x0+x*L,base-(p[0]*p[0]+p[1]*p[1])*90);}g.lineTo(x0+L,base);g.fill();
g.strokeStyle='#3d85c6';g.lineWidth=2;g.beginPath();for(let i=0;i<=200;i++){const x=i/200,p=psi(x);const y=base-120-p[0]*60;i?g.lineTo(x0+x*L,y):g.moveTo(x0+x*L,y);}g.stroke();g.lineWidth=1;
g.strokeStyle=col('--muted');g.beginPath();g.moveTo(x0,base);g.lineTo(x0+L,base);g.moveTo(x0,base-120);g.lineTo(x0+L,base-120);g.stroke();txt(g,'ψ (real part)',x0+4,base-190,'#3d85c6');txt(g,'|ψ|² probability',x0+4,base-6,'#c76b1a');
const E=n*n*0.376;k.querySelector('#o').innerHTML=sup?'Superposition: no definite energy; probability oscillates at a frequency set by E₂ − E₁.':`Energy Eₙ = n²h²/8mL² = <b>${E.toFixed(2)} eV</b> for an electron in a 1 nm box (n=${n}); ${n-1} node${n==2?'':'s'} inside.`;});}};

D.tunneling={title:"Quantum tunneling through a barrier",desc:"A quantum particle meets a barrier higher than its energy. Classically it must bounce back. Quantum mechanically its wave decays inside the barrier and, if the barrier is thin enough, part of it emerges on the other side. The transmission probability is computed exactly for a rectangular barrier — notice how sensitive it is to width.",
run(el){const [c,g]=cv(el,640,320);const k=ctl(el,'<label>Particle energy / barrier height <input type=range id=e min=0.05 max=1.5 step=0.01 value=0.6></label><label>Barrier width (nm) <input type=range id=w min=0.05 max=1.5 step=0.01 value=0.4></label><span id=o></span>');let t=0;
const cx=(a,b)=>({r:a,i:b}),add=(a,b)=>cx(a.r+b.r,a.i+b.i),mul=(a,b)=>cx(a.r*b.r-a.i*b.i,a.r*b.i+a.i*b.r),div=(a,b)=>{const d=b.r*b.r+b.i*b.i;return cx((a.r*b.r+a.i*b.i)/d,(a.i*b.r-a.r*b.i)/d)},ex=z=>{const m=Math.exp(z.r);return cx(m*Math.cos(z.i),m*Math.sin(z.i))},sc=(a,s)=>cx(a.r*s,a.i*s);
return anim(dt=>{t+=dt;const e=V(k,'e'),wn=V(k,'w');const V0=1.0;/* eV */const hb2m=0.0381;/* eV nm^2 for electron: hbar^2/2m */const kk=Math.sqrt(e*V0/hb2m);const q2=(e-1)*V0/hb2m;const q=q2<0?cx(0,Math.sqrt(-q2)):cx(Math.sqrt(q2),0);/* q imaginary=kappa when below */
// wave: region1 e^{ikx}+r e^{-ikx}, region2 A e^{iqx}+B e^{-iqx}, region3 t e^{ikx}; solve by matching at 0 and a
const a=wn,K=cx(kk,0),iq=mul(cx(0,1),q);const Q=q;// use iq for exponent
// unknowns via standard formula
const ka=cx(0,kk*a);const qa=mul(iq,cx(a,0));const e1=ex(qa),e2=ex(sc(qa,-1));
// From boundary conditions: t*e^{ika} = A e1 + B e2 ; ik t e^{ika} = iq(A e1 - B e2)
// => A = t e^{ika}(1 + k/q)/(2 e1), B = t e^{ika}(1 - k/q)/(2 e2)
const kq=div(K,Q);const Ac=div(add(cx(1,0),kq),sc(e1,2)),Bc=div(add(cx(1,0),sc(kq,-1)),sc(e2,2));// times t e^{ika}
// at x=0: 1 + r = A + B ; ik(1 - r) = iq(A - B)  => 2 = (A+B) + (q/k)(A-B)
const qk=div(Q,K);const S=add(add(Ac,Bc),mul(qk,add(Ac,sc(Bc,-1))));const teika=div(cx(2,0),S);const tt=div(teika,ex(ka));const T=tt.r*tt.r+tt.i*tt.i;const A=mul(Ac,teika),B=mul(Bc,teika);const r=add(add(A,B),cx(-1,0));
g.clearRect(0,0,640,320);const x0=280,S2=200/1.0,base=230;const X=x=>x0+x*S2;g.fillStyle='rgba(155,93,229,.25)';g.fillRect(X(0),base-150,a*S2,150);txt(g,'barrier',X(0)+2,base-155,'#9b5de5');g.strokeStyle='#f2cc8f';g.setLineDash([5,4]);g.beginPath();g.moveTo(0,base-150*e);g.lineTo(640,base-150*e);g.stroke();g.setLineDash([]);txt(g,'particle energy',5,base-150*e-5,'#c9a227');
const ph=ex(cx(0,-3*t));g.strokeStyle='#3d85c6';g.lineWidth=2;g.beginPath();for(let px=0;px<=640;px+=2){const x=(px-x0)/S2;let psi;if(x<0)psi=add(ex(cx(0,kk*x)),mul(r,ex(cx(0,-kk*x))));else if(x<=a)psi=add(mul(A,ex(mul(iq,cx(x,0)))),mul(B,ex(sc(mul(iq,cx(x,0)),-1))));else psi=mul(tt,ex(cx(0,kk*x)));psi=mul(psi,ph);const y=base-60-psi.r*35;px?g.lineTo(px,y):g.moveTo(px,y);}g.stroke();g.lineWidth=1;txt(g,'Re ψ',8,base-110,'#3d85c6');
k.querySelector('#o').innerHTML=`Electron, barrier 1 eV: transmission probability T = <b>${(T*100).toPrecision(3)}%</b>${e<1?' (classically: 0%)':' (classically: 100%)'}`;});}};

D.decay={title:"Radioactive decay and half-life",desc:"Each square is a nucleus. Every instant, each has the same small chance of decaying — no memory, no internal clock. You can't predict any single one, yet the population halves in a fixed time. The graph compares the random count with the exponential law.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Half-life (s) <input type=range id=h min=0.5 max=8 step=0.5 value=2></label><button id=r>Restart</button><span id=o></span>');const N0=400;let alive,t,hist;const reset=()=>{alive=new Array(N0).fill(true);t=0;hist=[];};reset();k.querySelector('#r').onclick=reset;k.oninput=reset;
return anim(dt=>{const th=V(k,'h'),lam=Math.LN2/th;t+=dt;const p=1-Math.exp(-lam*dt);for(let i=0;i<N0;i++)if(alive[i]&&Math.random()<p)alive[i]=false;const n=alive.filter(Boolean).length;hist.push([t,n]);
g.clearRect(0,0,640,340);for(let i=0;i<N0;i++){const x=20+(i%20)*13,y=20+Math.floor(i/20)*15;g.fillStyle=alive[i]?'#e07a5f':'#8884';g.fillRect(x,y,10,12);}
const gx=310,gy=310,gw=310,gh=280,tm=th*5;g.strokeStyle=col('--muted');g.beginPath();g.moveTo(gx,gy-gh);g.lineTo(gx,gy);g.lineTo(gx+gw,gy);g.stroke();
g.strokeStyle='#3d85c6';g.setLineDash([4,4]);g.beginPath();for(let s=0;s<=tm;s+=tm/100){const x=gx+s/tm*gw,y=gy-N0*Math.exp(-lam*s)/N0*gh;s?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();g.setLineDash([]);
for(let j=1;j<=4;j++){const x=gx+j*th/tm*gw;g.strokeStyle='#8884';g.beginPath();g.moveTo(x,gy);g.lineTo(x,gy-gh);g.stroke();txt(g,j+'×t½',x-14,gy+14,col('--muted'),'11px sans-serif');}
g.strokeStyle='#e07a5f';g.lineWidth=2;g.beginPath();hist.forEach(([s,m],i)=>{if(s>tm)return;const x=gx+s/tm*gw,y=gy-m/N0*gh;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();g.lineWidth=1;
k.querySelector('#o').innerHTML=`t = ${t.toFixed(1)} s · remaining ${n} of ${N0} · expected ${(N0*Math.exp(-lam*t)).toFixed(0)}`;});}};

D.curvature={title:"Curved spacetime (illustration)",desc:"A rough 'rubber sheet' picture: a central mass makes a dip in a grid, and a test body follows a curved path around it. Tick 'relativistic precession' to add the small general-relativistic correction (greatly exaggerated) that makes the orbit's closest point slowly rotate — the effect that explained Mercury's anomalous 43″ per century. The sheet is only an analogy: in reality it is spacetime, including time, that curves.",
run(el){const [c,g]=cv(el,640,400);const k=ctl(el,'<label>Central mass <input type=range id=m min=1 max=10 value=5></label><label><input type=checkbox id=p checked> relativistic precession (exaggerated)</label><button id=r>Restart orbit</button>');let s;const reset=()=>{s={x:180,y:0,vx:0,vy:Math.sqrt(V(k,'m')*1500/180)*0.8,tr:[]};};reset();k.querySelector('#r').onclick=reset;k.querySelector('#m').oninput=reset;
return anim(dt=>{const M=V(k,'m')*1500,pr=k.querySelector('#p').checked;const n=10,h=dt/n;for(let i=0;i<n;i++){const r=Math.hypot(s.x,s.y);const L=s.x*s.vy-s.y*s.vx;let a=-M/(r*r);if(pr)a*=1+3*L*L/(r*r)/(4e5);s.vx+=a*s.x/r*h;s.vy+=a*s.y/r*h;s.x+=s.vx*h;s.y+=s.vy*h;}s.tr.push([s.x,s.y]);if(s.tr.length>1500)s.tr.shift();
g.clearRect(0,0,640,400);const cx=320,cy=200,depth=V(k,'m')*5;const proj=(x,y)=>{const r=Math.hypot(x,y);const z=-depth*300/(r+40);return [cx+x,cy+y*0.45-z*0.6];};
g.strokeStyle=col('--muted');g.globalAlpha=.5;for(let i=-300;i<=300;i+=30){g.beginPath();for(let j=-300;j<=300;j+=10){const p=proj(i,j);j==-300?g.moveTo(p[0],p[1]):g.lineTo(p[0],p[1]);}g.stroke();g.beginPath();for(let j=-300;j<=300;j+=10){const p=proj(j,i);j==-300?g.moveTo(p[0],p[1]):g.lineTo(p[0],p[1]);}g.stroke();}g.globalAlpha=1;
const c0=proj(0,0);g.fillStyle='#f4a261';g.beginPath();g.arc(c0[0],c0[1],10+V(k,'m'),0,7);g.fill();
g.strokeStyle='#3d85c6';g.beginPath();s.tr.forEach((p,i)=>{const q=proj(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.stroke();const q=proj(s.x,s.y);g.fillStyle='#3d85c6';g.beginPath();g.arc(q[0],q[1],6,0,7);g.fill();});}};

D.blackbody={title:"Blackbody radiation and Planck's law",desc:"How bright a hot object glows at each wavelength. Raise the temperature: the curve grows enormously (∝ T⁴ in total) and its peak shifts to shorter wavelengths (Wien's law) — from invisible infrared to red, white and blue-white. The dashed curve is the classical Rayleigh–Jeans prediction, which shoots up at short wavelengths: the 'ultraviolet catastrophe' that Planck's quantum resolved.",
run(el){const [c,g]=cv(el,640,340);const k=ctl(el,'<label>Temperature (K) <input type=range id=T min=1000 max=12000 step=100 value=5800></label><label><input type=checkbox id=rj checked> classical prediction</label><span id=o></span>');
function draw(){const T=V(k,'T');const h=6.626e-34,cc=3e8,kb=1.381e-23;const B=l=>2*h*cc*cc/Math.pow(l,5)/(Math.exp(h*cc/(l*kb*T))-1),RJ=l=>2*cc*kb*T/Math.pow(l,4);const lmax=2.898e-3/T;const Bmax=B(lmax);
const X=nm=>50+nm/3000*570,Y=v=>300-v/Bmax*250;g.clearRect(0,0,640,340);for(let nm=380;nm<750;nm+=2){g.fillStyle=wl2rgb(nm);g.globalAlpha=.25;g.fillRect(X(nm),40,2,260);}g.globalAlpha=1;
g.strokeStyle=col('--muted');g.beginPath();g.moveTo(50,30);g.lineTo(50,300);g.lineTo(625,300);g.stroke();for(let nm=0;nm<=3000;nm+=500){txt(g,nm+'',X(nm)-10,316,col('--muted'),'11px sans-serif');}txt(g,'wavelength (nm)',520,334,col('--muted'),'11px sans-serif');
g.strokeStyle='#e07a5f';g.lineWidth=2.5;g.beginPath();for(let nm=20;nm<=3000;nm+=5){const y=Y(B(nm*1e-9));nm==20?g.moveTo(X(nm),y):g.lineTo(X(nm),Math.max(20,y));}g.stroke();g.lineWidth=1;
if(k.querySelector('#rj').checked){g.setLineDash([5,4]);g.strokeStyle=col('--fg');g.beginPath();let st=false;for(let nm=100;nm<=3000;nm+=5){const y=Y(RJ(nm*1e-9));if(y<20){st=false;continue;}st?g.lineTo(X(nm),y):(g.moveTo(X(nm),y),st=true);}g.stroke();g.setLineDash([]);}
// colour swatch approx
const Bs=(l,TT)=>1/Math.pow(l,5)/(Math.exp(h*cc/(l*kb*TT))-1);const ch=l=>Bs(l,T)/Bs(l,5800);let r=ch(650e-9),gg=ch(550e-9),b=ch(450e-9);const mx=Math.max(r,gg,b);g.fillStyle=`rgb(${255*r/mx|0},${255*gg/mx|0},${255*b/mx|0})`;g.beginPath();g.arc(590,60,20,0,7);g.fill();txt(g,'glow colour',555,95,col('--muted'),'11px sans-serif');
k.querySelector('#o').innerHTML=`Peak λ = 2.898 mm·K / T = <b>${(lmax*1e9).toFixed(0)} nm</b> · total power ∝ T⁴ (${(Math.pow(T/5800,4)).toFixed(2)}× the Sun's surface)`;}
k.oninput=draw;draw();}};

D.doublependulum={title:"Chaos: the double pendulum",desc:"Two double pendulums start with angles differing by only 0.001°. At first they move identically; soon they diverge completely. The laws are fully deterministic — yet long-term prediction is impossible without infinitely precise starting data. This is sensitive dependence on initial conditions.",
run(el){const [c,g]=cv(el,640,400);const k=ctl(el,'<label>Initial angle (°) <input type=range id=a min=30 max=179 value=120></label><label>Difference (°) <select id=d><option value=0.001>0.001</option><option value=0.01>0.01</option><option value=0.1>0.1</option></select></label><button id=r>Restart</button><span id=o></span>');
const G=9.81,L1=1,L2=1,m1=1,m2=1;let S,t;const f=s=>{const [a1,a2,w1,w2]=s;const d=a1-a2,den=2*m1+m2-m2*Math.cos(2*d);const A1=(-G*(2*m1+m2)*Math.sin(a1)-m2*G*Math.sin(a1-2*a2)-2*Math.sin(d)*m2*(w2*w2*L2+w1*w1*L1*Math.cos(d)))/(L1*den);const A2=(2*Math.sin(d)*(w1*w1*L1*(m1+m2)+G*(m1+m2)*Math.cos(a1)+w2*w2*L2*m2*Math.cos(d)))/(L2*den);return [w1,w2,A1,A2];};
const rk=(s,h)=>{const ad=(a,b,c2)=>a.map((x,i)=>x+b[i]*c2);const k1=f(s),k2=f(ad(s,k1,h/2)),k3=f(ad(s,k2,h/2)),k4=f(ad(s,k3,h));return s.map((x,i)=>x+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i]));};
const reset=()=>{const a=V(k,'a')*Math.PI/180,d=+k.querySelector('#d').value*Math.PI/180;S=[{s:[a,a,0,0],tr:[],c:'#e07a5f'},{s:[a+d,a,0,0],tr:[],c:'#3d85c6'}];t=0;};reset();k.querySelector('#r').onclick=reset;k.oninput=reset;k.querySelector('#d').onchange=reset;
return anim(dt=>{t+=dt;S.forEach(P=>{for(let i=0;i<20;i++)P.s=rk(P.s,dt/20);});g.clearRect(0,0,640,400);const ox=320,oy=150,R=110;
S.forEach(P=>{const [a1,a2]=P.s;const x1=ox+R*Math.sin(a1),y1=oy+R*Math.cos(a1),x2=x1+R*Math.sin(a2),y2=y1+R*Math.cos(a2);P.tr.push([x2,y2]);if(P.tr.length>250)P.tr.shift();g.strokeStyle=P.c+'66';g.beginPath();P.tr.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle=P.c;g.lineWidth=2.5;g.beginPath();g.moveTo(ox,oy);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.lineWidth=1;g.fillStyle=P.c;g.beginPath();g.arc(x1,y1,6,0,7);g.arc(x2,y2,6,0,7);g.fill();});
const da=Math.abs(S[0].s[1]-S[1].s[1])*180/Math.PI;k.querySelector('#o').innerHTML=`t = ${t.toFixed(1)} s · difference in lower arm angle: <b>${da<0.01?da.toExponential(1):da.toFixed(2)}°</b>`;});}};
})();
