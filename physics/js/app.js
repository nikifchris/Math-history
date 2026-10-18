(function(){
const $=s=>document.querySelector(s), app=$('#app');
const E=Object.fromEntries(ERAS.map(e=>[e.id,e])), P=Object.fromEntries(PEOPLE.map(p=>[p.id,p])), F=Object.fromEntries(FIELDS.map(f=>[f.id,f])), C=Object.fromEntries(CONCEPTS.map(c=>[c.id,c]));
const eraIdx=Object.fromEntries(ERAS.map((e,i)=>[e.id,i]));
// reverse deps
const leadsTo={};CONCEPTS.forEach(c=>c.deps.forEach(d=>(leadsTo[d]=leadsTo[d]||[]).push(c.id)));
// people of concept (union of concept.people and person.contributions)
const conceptPeople={};CONCEPTS.forEach(c=>conceptPeople[c.id]=new Set(c.people));PEOPLE.forEach(p=>p.contributions.forEach(x=>conceptPeople[x]&&conceptPeople[x].add(p.id)));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let done=store.get('ph_done'), seen=store.get('ph_seen');
const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const fmtY=y=>y<0?`${-y} BCE`:`${y}`;
const pl=id=>P[id]?`<a class=chip href="#/person/${id}">${esc(P[id].name)}</a>`:'';
const fl=id=>F[id]?`<a class=chip href="#/field/${id}">${F[id].icon} ${esc(F[id].name)}</a>`:'';
const cl=id=>C[id]?`<a class="chip type-${C[id].type}" href="#/concept/${id}">${done[id]?'✓ ':''}${esc(C[id].name)}</a>`:'';
const el=id=>E[id]?`<a class=chip href="#/era/${id}" style="border-color:${E[id].color}">${esc(E[id].name)}</a>`:'';
const initials=n=>n.replace(/\(.*?\)/g,'').split(/[\s-]+/).filter(w=>/^[A-ZÉĀ]/.test(w)).slice(0,2).map(w=>w[0]).join('');
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
const impactCards=list=>list&&list.length?`<div class=impact>${list.map(i=>`<div class=card><div class=ic>${IMPACT_TYPES[i.to]?.icon||'•'}</div><b>${IMPACT_TYPES[i.to]?.label||i.to}</b><p>${i.text}</p></div>`).join('')}</div>`:'';
function math(){if(window.renderMathInElement){try{renderMathInElement(app,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})}catch(e){console.warn(e)}}}
let cleanups=[];
function mountDemo(id,host){const d=DEMOS[id];if(!d)return;const box=document.createElement('div');box.className='demo';box.innerHTML=`<h3>🔬 ${esc(d.title)}</h3><p class=muted>${esc(d.desc)}</p>`;host.appendChild(box);const c=d.run(box);if(typeof c==='function')cleanups.push(c);}
const LAYERS=[['simple','1 · Simple','In one breath'],['intuitive','2 · Intuitive','Picture it'],['formal','3 · Formal','The precise statement'],['philosophy','4 · Philosophical','What it means for how we think']];
function layerWidget(c,start='simple'){const id='lw'+Math.random().toString(36).slice(2,8);
return `<div class=lw id=${id} data-c="${c.id}"><div class=layers>${LAYERS.map(([k,l])=>`<button data-k=${k} class="${k==start?'on':''}">${l}</button>`).join('')}<button data-k=all>Show all layers</button></div><div class=layer-body>${layerHTML(c,start)}</div></div>`;}
function layerHTML(c,k){if(k=='all')return LAYERS.map(([kk,l,s])=>`<div class=lbl>${l} — ${s}</div><p>${c[kk]}</p>`).join('');const L=LAYERS.find(x=>x[0]==k);return `<div class=lbl>${L[1]} — ${L[2]}</div><p>${c[k]}</p>${k!='philosophy'?`<p class="small muted">Go deeper → use the next layer above.</p>`:''}`;}
document.addEventListener('click',e=>{const b=e.target.closest('.lw .layers button');if(!b)return;const w=b.closest('.lw');w.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b));w.querySelector('.layer-body').innerHTML=layerHTML(C[w.dataset.c],b.dataset.k);math();});
document.addEventListener('click',e=>{const b=e.target.closest('.done-btn');if(!b)return;const id=b.dataset.id;if(done[id])delete done[id];else done[id]=Date.now();store.set('ph_done',done);b.classList.toggle('on',!!done[id]);b.textContent=done[id]?'✓ Understood':'Mark as understood';});
const doneBtn=id=>`<button class="done-btn ${done[id]?'on':''}" data-id="${id}">${done[id]?'✓ Understood':'Mark as understood'}</button>`;

const V={};
V.home=()=>{const t=CONCEPTS[Math.floor(Date.now()/864e5)%CONCEPTS.length];const greats=PEOPLE.filter(p=>p.greatness>=5);
return `<section class=hero><div class=muted>An interactive encyclopedia · from Thales to gravitational waves</div><h1>The story of physics, told through the minds that made it</h1>
<p>Explore ${ERAS.length} eras, ${PEOPLE.length} great physicists, ${FIELDS.length} fields and ${CONCEPTS.length} laws, theories, experiments and ideas. Each idea opens in four layers — <b>simple → intuitive → formal → philosophical</b> — with notes on what it led to in engineering, technology, the other sciences and human thought. Written for curious engineers, not specialists.</p>
<p><a class=chip href="#/timeline">🕰 Start with the timeline</a> <a class=chip href="#/paths">🧭 Follow a learning path</a> <a class=chip href="#/map">🌳 See the idea family tree</a> <a class=chip href="#/demos">🔬 Play with demos</a></p></section>
<div class=section><h2>Idea of the day</h2><a class=card href="#/concept/${t.id}"><span class="tag type-${t.type}">${t.type}</span><h3>${esc(t.name)}</h3><p>${t.simple}</p></a></div>
<div class=section><h2>Ways to explore</h2><div class=grid>${[['#/timeline','🕰','Timeline','Every great mind placed in time, era by era.'],['#/eras','🏛','Eras','Why, what and how physics changed in each age.'],['#/people','👤','People','Profiles: life, works, theorems, legacy.'],['#/fields','🗂','Fields','The branches of physics, their ideas and philosophy.'],['#/concepts','💡','Ideas','Laws, theories, experiments and concepts in four layers of depth.'],['#/map','🌳','Idea family tree','How each idea depends on earlier ones.'],['#/paths','🧭','Learning paths','Guided routes such as "Path to quantum mechanics".'],['#/impact','🏗','Impact','What physics made possible, as a historian sees it.'],['#/glossary','📖','Glossary','Plain-language definitions.']].map(x=>`<a class=card href="${x[0]}"><h3>${x[1]} ${x[2]}</h3><p>${x[3]}</p></a>`).join('')}</div></div>
<div class=section><h2>The ages of physics</h2><div class=grid>${ERAS.map(e=>`<a class="card era-strip" style="--c:${e.color}" href="#/era/${e.id}"><span class="small muted">${e.span}</span><h3>${esc(e.name)}</h3><p>${esc(e.summary)}</p></a>`).join('')}</div></div>
<div class=section><h2>The giants</h2><div class=grid>${greats.map(personCard).join('')}</div></div>`;};
function personCard(p){return `<a class=card href="#/person/${p.id}"><div class=phead><div class=portrait style="background:${E[p.era].color};width:48px;height:48px;font-size:1.1rem">${initials(p.name)}</div><div><h3>${esc(p.name)}</h3><span class="small muted">${p.dates}</span></div></div><p>${esc(p.tagline)}</p></a>`;}

V.eras=()=>`<h1 class=page>The Ages of Physics</h1><p class=sub>Physics grew from the questions, instruments and needs of each age. Each age asks new questions — and each answer opens new fields.</p>
${ERAS.map((e,i)=>`<a class="card era-strip" style="--c:${e.color};margin-bottom:1rem" href="#/era/${e.id}"><span class="small muted">${i+1} · ${e.span}</span><h3>${esc(e.name)}</h3><p>${esc(e.summary)}</p><div>${PEOPLE.filter(p=>p.era==e.id).map(p=>`<span class=tag>${esc(p.name)}</span>`).join('')}</div></a>`).join('')}`;
V.era=id=>{const e=E[id];if(!e)return nf();const i=eraIdx[id],pr=ERAS[i-1],nx=ERAS[i+1];const ppl=PEOPLE.filter(p=>p.era==id).sort((a,b)=>a.year-b.year);const cs=CONCEPTS.filter(c=>c.era==id).sort((a,b)=>a.year-b.year);
return `<div class=crumbs><a href="#/eras">Eras</a> › ${i+1}</div><h1 class=page style="color:${e.color}">${esc(e.name)}</h1><p class=sub>${e.span} — ${esc(e.summary)}</p>
<div class=wwh><div class=card><h3>Why?</h3><p>${e.why}</p></div><div class=card><h3>What?</h3><p>${e.what}</p></div><div class=card><h3>How?</h3><p>${e.how}</p></div></div>
<div class=cols><div><div class=section><h2>Historical context</h2><p>${e.context}</p></div><div class=section><h2>Legacy — the historian's view</h2><p class=quote>${e.legacy}</p></div>
<div class=section><h2>Great minds of this age</h2><div class=grid>${ppl.map(personCard).join('')||'<p class=muted>See the people view for contributors.</p>'}</div></div>
<div class=section><h2>Ideas born in this age</h2>${cs.map(c=>`<details class=deep><summary>${esc(c.name)} <span class="tag type-${c.type}">${c.type}</span> <span class="small muted">${fmtY(c.year)}</span></summary><p>${c.simple}</p><p><a href="#/concept/${c.id}">Open full page →</a></p></details>`).join('')||'<p class=muted>—</p>'}</div></div>
<div class=side><div class=card><h3>Fields active</h3>${e.fields.map(fl).join('')}</div><div class=card><h3>Navigate</h3>${pr?`<p>← <a href="#/era/${pr.id}">${esc(pr.name)}</a></p>`:''}${nx?`<p>→ <a href="#/era/${nx.id}">${esc(nx.name)}</a></p>`:''}</div></div></div>`;};

V.people=q=>{const params=new URLSearchParams(q||'');const fe=params.get('era')||'',ff=params.get('field')||'',so=params.get('sort')||'chrono';let list=PEOPLE.slice();if(fe)list=list.filter(p=>p.era==fe);if(ff)list=list.filter(p=>p.fields.includes(ff));list.sort(so=='great'?(a,b)=>b.greatness-a.greatness||a.year-b.year:so=='name'?(a,b)=>a.name.localeCompare(b.name):(a,b)=>a.year-b.year);
return `<h1 class=page>The Great Physicists</h1><p class=sub>${PEOPLE.length} profiles. Stars indicate (subjectively) breadth and depth of influence, to help you prioritize.</p>
<div class=toolbar><select id=fe><option value="">All eras</option>${ERAS.map(e=>`<option value=${e.id} ${fe==e.id?'selected':''}>${esc(e.name)}</option>`).join('')}</select><select id=ff><option value="">All fields</option>${FIELDS.map(f=>`<option value=${f.id} ${ff==f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select><select id=so><option value=chrono>Chronological</option><option value=great ${so=='great'?'selected':''}>Most influential first</option><option value=name ${so=='name'?'selected':''}>A–Z</option></select><span class=muted>${list.length} shown</span></div>
<div class=grid>${list.map(p=>personCard(p).replace('</a>',`<div class="small stars">${stars(p.greatness)}</div></a>`)).join('')}</div>`;};
V.person=id=>{const p=P[id];if(!p)return nf();const e=E[p.era];const sorted=PEOPLE.slice().sort((a,b)=>a.year-b.year),k=sorted.indexOf(p);const related=PEOPLE.filter(o=>o!==p&&o.fields.some(f=>p.fields.includes(f))).sort((a,b)=>Math.abs(a.year-p.year)-Math.abs(b.year-p.year)).slice(0,6);
seen['p:'+id]=1;store.set('ph_seen',seen);
return `<div class=crumbs><a href="#/people">People</a> › <a href="#/era/${e.id}">${esc(e.name)}</a></div>
<div class=phead style="margin:.6rem 0"><div class=portrait style="background:${e.color}">${initials(p.name)}</div><div><h1 class=page>${esc(p.name)}</h1><div class=sub style="margin:0">${p.dates} · ${esc(p.place)} <span class=stars>${stars(p.greatness)}</span></div></div></div>
<p class=quote>${esc(p.tagline)}</p>
<div class=cols><div>
<div class=section><h2>Life & context</h2><p>${p.life}</p></div>
<div class=section><h2>Key ideas & discoveries</h2><ul>${p.ideas.map(x=>`<li>${x}</li>`).join('')}</ul></div>
${p.contributions.length?`<div class=section><h2>Laws, theories & experiments — dive deeper</h2><p class="muted small">Each opens in four layers. Start simple; go formal or philosophical when ready.</p>${p.contributions.filter(c=>C[c]).map(c=>`<details class=deep><summary>${esc(C[c].name)} <span class="tag type-${C[c].type}">${C[c].type}</span>${done[c]?' ✓':''}</summary>${layerWidget(C[c])}<p><b>Why it matters:</b> ${C[c].why}</p><p><a href="#/concept/${c}">Full page, demos and connections →</a></p></details>`).join('')}</div>`:''}
<div class=section><h2>Way of thinking</h2><p>${p.philosophy}</p></div>
<div class=section><h2>Legacy</h2><p>${p.legacy}</p></div>${p.note?`<div class=section><h2>⚖️ Historical note & disputes</h2><p>${p.note}</p></div>`:''}
<div class=section><h2>What it led to — impact</h2>${impactCards(p.impact)}</div>
</div><div class=side>
<div class=card><h3>Major works</h3><ul class=small>${p.works.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>
<div class=card><h3>Era</h3>${el(p.era)}<p class=small>${esc(e.summary)}</p></div>
<div class=card><h3>Fields</h3>${p.fields.map(fl).join('')}</div>
<div class=card><h3>Related minds</h3>${related.map(pl).join('')}</div>
<div class=card><h3>Chronology</h3>${sorted[k-1]?`<p class=small>← ${pl(sorted[k-1].id)}</p>`:''}${sorted[k+1]?`<p class=small>→ ${pl(sorted[k+1].id)}</p>`:''}</div>
</div></div>`;};

V.fields=()=>`<h1 class=page>Fields of Physics</h1><p class=sub>As time passes, new branches grow from old ones. Grouped by the era in which each field took recognizable shape.</p>
${ERAS.map(e=>{const fs=FIELDS.filter(f=>f.era==e.id);return fs.length?`<div class=section><h2 style="color:${e.color}">${esc(e.name)}</h2><div class=grid>${fs.map(f=>`<a class=card href="#/field/${f.id}"><h3>${f.icon} ${esc(f.name)}</h3><p>${esc(f.core.slice(0,160))}…</p></a>`).join('')}</div></div>`:''}).join('')}`;
V.field=id=>{const f=F[id];if(!f)return nf();const ppl=PEOPLE.filter(p=>p.fields.includes(id)||f.people.includes(p.id)).sort((a,b)=>a.year-b.year);const cs=CONCEPTS.filter(c=>c.fields.includes(id)||f.concepts.includes(c.id)).sort((a,b)=>a.year-b.year);
return `<div class=crumbs><a href="#/fields">Fields</a></div><h1 class=page>${f.icon} ${esc(f.name)}</h1><p class=sub>Took shape in: ${el(f.era)}</p>
<div class=cols><div><div class=section><h2>Origins</h2><p>${f.origin}</p></div><div class=section><h2>Core idea</h2><p>${f.core}</p></div><div class=section><h2>Philosophy</h2><p class=quote>${f.philosophy}</p></div>
<div class=section><h2>Key ideas</h2><ul>${f.keyIdeas.map(x=>`<li>${x}</li>`).join('')}</ul></div>
<div class=section><h2>Laws, theories & experiments (chronological)</h2>${cs.map(c=>`<details class=deep><summary>${esc(c.name)} <span class="tag type-${c.type}">${c.type}</span> <span class="small muted">${fmtY(c.year)}</span></summary>${layerWidget(c)}<p><a href="#/concept/${c.id}">Full page →</a></p></details>`).join('')}</div>
<div class=section><h2>Where it is used</h2><p>${f.applications}</p></div></div>
<div class=side><div class=card><h3>Key people</h3>${ppl.map(pl).join('')}</div><div class=card><h3>Progress</h3>${progressBar(cs.map(c=>c.id))}</div></div></div>`;};
function progressBar(ids){const n=ids.filter(i=>done[i]).length;return `<div class=bar><i style="width:${ids.length?100*n/ids.length:0}%"></i></div><p class=small>${n} / ${ids.length} understood</p>`;}

V.concepts=q=>{const params=new URLSearchParams(q||'');const ty=params.get('type')||'',fe=params.get('field')||'';let list=CONCEPTS.slice().sort((a,b)=>a.year-b.year);if(ty)list=list.filter(c=>c.type==ty);if(fe)list=list.filter(c=>c.fields.includes(fe));
return `<h1 class=page>Laws, Theories, Experiments & Ideas</h1><p class=sub>${CONCEPTS.length} entries, in chronological order. Each has four layers of depth, connections and impact. ${CONCEPTS.filter(c=>c.demo).length} include interactive demos (🔬).</p>
<div class=toolbar><select id=ty><option value="">All types</option>${['law','theory','concept','experiment','open-question'].map(t=>`<option ${ty==t?'selected':''}>${t}</option>`).join('')}</select><select id=cf><option value="">All fields</option>${FIELDS.map(f=>`<option value=${f.id} ${fe==f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select><span class=muted>${list.length} shown</span></div>
<div class=grid>${list.map(c=>`<a class=card href="#/concept/${c.id}"><span class="tag type-${c.type}">${c.type}</span> <span class="small muted">${fmtY(c.year)}</span>${c.demo?' 🔬':''}${done[c.id]?' ✓':''}<h3>${esc(c.name)}</h3><p>${c.simple}</p></a>`).join('')}</div>`;};
V.concept=id=>{const c=C[id];if(!c)return nf();seen['c:'+id]=1;store.set('ph_seen',seen);const inPaths=PATHS.filter(p=>p.steps.includes(id));
return `<div class=crumbs><a href="#/concepts">Ideas</a> › ${el(c.era)}</div><h1 class=page>${esc(c.name)}</h1><p class=sub><span class="tag type-${c.type}">${c.type}</span> ${fmtY(c.year)} · ${c.fields.map(fl).join('')} ${doneBtn(id)}</p>
${layerWidget(c)}
<div id=demoHost></div>
<div class=cols><div><div class=section><h2>Why it matters</h2><p>${c.why}</p></div>${c.note?`<div class=section><h2>⚖️ Historical note & disputes</h2><p>${c.note}</p></div>`:''}
<div class=section><h2>The historian's view — what it led to</h2>${impactCards(c.impact)||'<p class=muted>See connected ideas.</p>'}</div>
<div class=section><h2>Idea family</h2><p><b>Builds on:</b> ${c.deps.map(cl).join('')||'<span class=muted>a starting point — no prerequisites</span>'}</p><p><b>Leads to:</b> ${(leadsTo[id]||[]).map(cl).join('')||'<span class=muted>—</span>'}</p><p class=small><a href="#/map?focus=${id}">See it in the idea family tree →</a></p></div></div>
<div class=side><div class=card><h3>People</h3>${[...conceptPeople[id]].map(pl).join('')}</div>${c.math&&c.math.length?`<div class=card><h3>🧮 The mathematics behind it</h3><p class=small>Opens the companion encyclopedia of mathematics:</p>${c.math.map(m=>`<a class=chip target=_blank rel=noopener href="https://nikifchris.github.io/Math-history/#/concept/${m[0]}">∑ ${esc(m[1])} ↗</a>`).join('')}</div>`:''}${inPaths.length?`<div class=card><h3>In learning paths</h3>${inPaths.map(p=>`<a class=chip href="#/path/${p.id}">${p.icon} ${esc(p.name)}</a>`).join('')}</div>`:''}</div></div>`;};
V.concept.after=id=>{const c=C[id];if(c&&c.demo)mountDemo(c.demo,$('#demoHost'));};

V.timeline=q=>{const W=300;const showC=(new URLSearchParams(q||'')).get('ideas')=='1';let html=`<h1 class=page>Interactive Timeline</h1><p class=sub>Each era gets equal width (ancient spans are compressed so recent centuries stay readable). Click any name.</p><div class=toolbar><a class=chip href="#/timeline${showC?'':'?ideas=1'}">${showC?'Hide':'Show'} laws & ideas</a></div><div class=tl-wrap><div class=tl style="width:${ERAS.length*W+40}px">`;
const xOf=(era,y)=>{const e=E[era],i=eraIdx[era];const f=Math.min(1,Math.max(0,(y-e.start)/(e.end-e.start)));return 20+i*W+f*(W-40);};
ERAS.forEach((e,i)=>html+=`<div class=tl-era style="left:${20+i*W}px;width:${W}px;--c:${e.color}"><b>${esc(e.name)}</b><span class=muted>${e.span}</span></div>`);html+='<div class=tl-axis></div>';
const items=PEOPLE.map(p=>({x:xOf(p.era,p.year),label:p.name.replace(/\s*\(.*\)/,'').replace('Marie Skłodowska-Curie','Marie Curie'),href:'#/person/'+p.id,c:false,col:E[p.era].color}));
(window.MILESTONES||[]).forEach(m=>items.push({x:xOf(m.era,m.y),label:'◆ '+m.t,href:'#/era/'+m.era,c:true,col:'#999'}));if(showC)CONCEPTS.forEach(c=>items.push({x:xOf(c.era,c.year),label:c.name,href:'#/concept/'+c.id,c:true}));
items.sort((a,b)=>a.x-b.x);const rows=[];items.forEach(it=>{const w=it.label.length*6.4+16;let r=0;while(rows[r]!==undefined&&rows[r]>it.x)r++;rows[r]=it.x+w+4;it.r=r;});
items.forEach(it=>html+=`<a class="tl-p ${it.c?'c':''}" href="${it.href}" style="left:${it.x}px;top:${80+it.r*27}px;${it.col?`border-left:3px solid ${it.col}`:''}">${esc(it.label)}</a>`);
const H=Math.max(640,100+rows.length*27);return html.replace('class=tl style="','class=tl style="height:'+H+'px;')+'</div></div><p class="legend muted">Solid boxes: people · dashed boxes: ◆ historical milestones and (optionally) laws & ideas. Scroll horizontally →</p>';};

V.map=q=>{const params=new URLSearchParams(q||'');const focus=params.get('focus')||'',ff=params.get('field')||'';
// depth = longest path from roots
const depth={};const dfs=id=>{if(depth[id]!=null)return depth[id];depth[id]=0;const c=C[id];depth[id]=c.deps.length?1+Math.max(...c.deps.map(dfs)):0;return depth[id];};CONCEPTS.forEach(c=>dfs(c.id));
const cols={};CONCEPTS.forEach(c=>(cols[depth[c.id]]=cols[depth[c.id]]||[]).push(c));Object.values(cols).forEach(a=>a.sort((x,y)=>x.year-y.year));
const NW=170,NH=26,GX=60,GY=10;const pos={};let maxR=0;Object.entries(cols).forEach(([d,a])=>{a.forEach((c,i)=>{pos[c.id]=[20+d*(NW+GX),20+i*(NH+GY)];});maxR=Math.max(maxR,a.length);});
const W=20+(Object.keys(cols).length)*(NW+GX),H=40+maxR*(NH+GY);
let svg=`<svg width=${W} height=${H} xmlns="http://www.w3.org/2000/svg">`;CONCEPTS.forEach(c=>c.deps.forEach(d=>{const a=pos[d],b=pos[c.id];svg+=`<path class=edge data-a=${d} data-b=${c.id} d="M${a[0]+NW},${a[1]+NH/2} C${a[0]+NW+GX/2},${a[1]+NH/2} ${b[0]-GX/2},${b[1]+NH/2} ${b[0]},${b[1]+NH/2}"/>`;}));
CONCEPTS.forEach(c=>{const [x,y]=pos[c.id];const lab=c.name.length>27?c.name.slice(0,26)+'…':c.name;svg+=`<g class="node ${done[c.id]?'done':''}" data-id=${c.id} transform="translate(${x},${y})"><title>${esc(c.name)} (${fmtY(c.year)})</title><rect width=${NW} height=${NH} rx=7 style="stroke:${E[c.era].color}"/><text x=8 y=17>${esc(lab)}</text></g>`;});svg+='</svg>';
return `<h1 class=page>The Idea Family Tree</h1><p class=sub>Every idea rests on earlier ones. Columns go left → right from foundational ideas to those built on them. Hover (or tap) a node to highlight its ancestors and descendants; click to open. Border color = era.</p>
<div class=filters><button data-f="" class="${ff?'':'on'}">All fields</button>${FIELDS.filter(f=>CONCEPTS.some(c=>c.fields.includes(f.id))).map(f=>`<button data-f=${f.id} class="${ff==f.id?'on':''}">${f.icon} ${esc(f.name)}</button>`).join('')}</div>
<div class=map-wrap id=mapw>${svg}</div>`;};
V.map.after=q=>{const params=new URLSearchParams(q||'');const focus=params.get('focus'),ff=params.get('field');const w=$('#mapw');
const anc=id=>{const s=new Set([id]);const st=[id];while(st.length){const x=st.pop();C[x].deps.forEach(d=>{if(!s.has(d)){s.add(d);st.push(d);}});}return s;};
const desc=id=>{const s=new Set([id]);const st=[id];while(st.length){const x=st.pop();(leadsTo[x]||[]).forEach(d=>{if(!s.has(d)){s.add(d);st.push(d);}});}return s;};
const hl=id=>{if(!id){w.querySelectorAll('.node,.edge').forEach(n=>n.classList.remove('hl','dim'));return;}const S=new Set([...anc(id),...desc(id)]);w.querySelectorAll('.node').forEach(n=>{n.classList.toggle('hl',S.has(n.dataset.id));n.classList.toggle('dim',!S.has(n.dataset.id));});w.querySelectorAll('.edge').forEach(e=>{const on=S.has(e.dataset.a)&&S.has(e.dataset.b);e.classList.toggle('hl',on);e.classList.toggle('dim',!on);});};
const fieldF=()=>{if(!ff)return;w.querySelectorAll('.node').forEach(n=>n.classList.toggle('dim',!C[n.dataset.id].fields.includes(ff)));w.querySelectorAll('.edge').forEach(e=>e.classList.add('dim'));};
w.querySelectorAll('.node').forEach(n=>{n.onmouseenter=()=>hl(n.dataset.id);n.onmouseleave=()=>{hl(focus);fieldF();};n.onclick=()=>location.hash='#/concept/'+n.dataset.id;});
document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>location.hash='#/map'+(b.dataset.f?'?field='+b.dataset.f:''));
if(focus){hl(focus);const n=w.querySelector(`.node[data-id="${focus}"]`);if(n){const t=n.getAttribute('transform').match(/[\d.]+/g);w.scrollTo(t[0]-200,t[1]-200);}}fieldF();};

V.paths=()=>`<h1 class=page>Learning Paths</h1><p class=sub>Guided journeys through the ideas, in an order that builds understanding. Your progress is saved in this browser.</p><div class=grid>${PATHS.map(p=>`<a class=card href="#/path/${p.id}"><h3>${p.icon} ${esc(p.name)}</h3><p>${esc(p.desc)}</p><p class=small>${p.steps.length} steps</p>${progressBar(p.steps)}</a>`).join('')}</div>`;
V.path=id=>{const p=PATHS.find(x=>x.id==id);if(!p)return nf();const next=p.steps.find(s=>!done[s]);
return `<div class=crumbs><a href="#/paths">Paths</a></div><h1 class=page>${p.icon} ${esc(p.name)}</h1><p class=sub>${esc(p.desc)}</p>${progressBar(p.steps)}${next?`<p><a class=chip href="#/concept/${next}">▶ Continue: ${esc(C[next].name)}</a></p>`:'<p>🎉 Path complete!</p>'}
<ol class=path-steps>${p.steps.map(s=>{const c=C[s];const who=[...conceptPeople[s]].slice(0,3).map(x=>P[x].name.split(' ').slice(-1)[0]).join(', ');return `<li class="${done[s]?'done':''}"><a href="#/concept/${s}"><b>${esc(c.name)}</b></a> <span class="small muted">${fmtY(c.year)}${who?' · '+esc(who):''}</span><br><span class=small>${c.simple}</span></li>`}).join('')}</ol>`;};

V.demos=()=>{const used={};CONCEPTS.forEach(c=>{if(c.demo)(used[c.demo]=used[c.demo]||[]).push(c.id)});return `<h1 class=page>Interactive Demos</h1><p class=sub>${Object.keys(DEMOS).length} hands-on visualizations. Play first; understanding follows.</p><div class=grid>${Object.entries(DEMOS).map(([k,d])=>`<a class=card href="#/demo/${k}"><h3>🔬 ${esc(d.title)}</h3><p>${esc(d.desc.slice(0,140))}…</p>${(used[k]||[]).map(i=>`<span class=tag>${esc(C[i].name)}</span>`).join('')}</a>`).join('')}</div>`;};
V.demo=id=>{if(!DEMOS[id])return nf();const rel=CONCEPTS.filter(c=>c.demo==id);return `<div class=crumbs><a href="#/demos">Demos</a></div><div id=demoHost></div><p>Related: ${rel.map(c=>cl(c.id)).join('')}</p>`;};
V.demo.after=id=>mountDemo(id,$('#demoHost'));

V.impact=q=>{const t=(new URLSearchParams(q||'')).get('to')||'';const rows=[];PEOPLE.forEach(p=>(p.impact||[]).forEach(i=>rows.push({...i,src:pl(p.id),y:p.year})));CONCEPTS.forEach(c=>(c.impact||[]).forEach(i=>rows.push({...i,src:cl(c.id),y:c.year})));
const list=rows.filter(r=>!t||r.to==t).sort((a,b)=>a.y-b.y);
return `<h1 class=page>The Historian's View: What Physics Made Possible</h1><p class=sub>Physics rarely stays in the laboratory. These ${rows.length} connections trace how ideas flowed into engineering, technology, the other sciences and the way humanity thinks — often decades or centuries after their discovery.</p>
<div class=filters><a class=chip href="#/impact">All</a>${Object.entries(IMPACT_TYPES).map(([k,v])=>`<a class=chip href="#/impact?to=${k}" style="${t==k?'border-color:var(--accent)':''}">${v.icon} ${v.label} (${rows.filter(r=>r.to==k).length})</a>`).join('')}</div>
<div class=section><h2>Recurring patterns</h2><div class=grid>
<div class=card><h3>🔥 Engines before theory</h3><p>Steam engines worked decades before Carnot asked why; thermodynamics then told engineers the limits. Practice often leads, and theory explains and extends.</p></div>
<div class=card><h3>⏳ The long delay</h3><p>Faraday's induction (1831) became the power grid ~50 years later; Einstein's stimulated emission (1917) became the laser in 1960; general relativity (1915) became a GPS correction in the 1970s–90s.</p></div>
<div class=card><h3>🧩 Unification</h3><p>Newton joined heaven and earth; Maxwell joined electricity, magnetism and light; Einstein joined space and time; the electroweak theory joined two forces. Each merger made physics simpler and deeper.</p></div>
<div class=card><h3>🚧 Limits are knowledge</h3><p>No perpetual motion (thermodynamics), no faster-than-light signals (relativity), no simultaneous exact position and momentum (Heisenberg): physics often advances by discovering what is impossible.</p></div>
<div class=card><h3>🔭 New instruments, new worlds</h3><p>The telescope, the vacuum pump, the spectroscope, the cloud chamber, the particle accelerator and the laser interferometer each opened a realm nobody could have reasoned their way into.</p></div>
<div class=card><h3>🧮 Mathematics as language</h3><p>Conic sections, calculus, Fourier analysis, group theory, Riemannian geometry and Hilbert spaces were often ready before physics needed them. See the companion <a href="https://nikifchris.github.io/Math-history/" target=_blank rel=noopener>Mathematica Historia</a>.</p></div>
</div></div>
<div class=section><h2>All connections (chronological by source)</h2><div class=impact>${list.map(r=>`<div class=card><div class=ic>${IMPACT_TYPES[r.to]?.icon}</div><div class=small>${fmtY(r.y)} · ${r.src}</div><p>${r.text}</p></div>`).join('')}</div></div>`;};

V.glossary=()=>`<h1 class=page>Glossary</h1><p class=sub>Plain-language definitions of terms used throughout.</p><dl class=gloss>${GLOSSARY.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([t,d])=>`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl>`;
V.progress=()=>{const n=Object.keys(done).filter(k=>C[k]).length;const ps=Object.keys(seen).filter(k=>k.startsWith('p:')).length;
return `<h1 class=page>Your Progress</h1><p class=sub>Stored only in this browser (localStorage).</p><div class=grid><div class=card><h3>Ideas understood</h3>${progressBar(CONCEPTS.map(c=>c.id))}</div><div class=card><h3>Profiles visited</h3><p>${ps} / ${PEOPLE.length}</p></div><div class=card><h3>Ideas visited</h3><p>${Object.keys(seen).filter(k=>k.startsWith('c:')).length} / ${CONCEPTS.length}</p></div></div>
<div class=section><h2>By field</h2><div class=grid>${FIELDS.map(f=>{const ids=CONCEPTS.filter(c=>c.fields.includes(f.id)).map(c=>c.id);return ids.length?`<a class=card href="#/field/${f.id}"><h3>${f.icon} ${esc(f.name)}</h3>${progressBar(ids)}</a>`:''}).join('')}</div></div>
<div class=section><h2>By path</h2><div class=grid>${PATHS.map(p=>`<a class=card href="#/path/${p.id}"><h3>${p.icon} ${esc(p.name)}</h3>${progressBar(p.steps)}</a>`).join('')}</div></div>
<p><button id=reset>Reset progress</button></p>`;};
V.progress.after=()=>{$('#reset').onclick=()=>{if(confirm('Reset all progress?')){done={};seen={};store.set('ph_done',done);store.set('ph_seen',seen);route();}}};

V.search=q=>{const s=decodeURIComponent((new URLSearchParams(q||'')).get('q')||'').toLowerCase().trim();if(!s)return '<h1 class=page>Search</h1><p>Type in the search box above.</p>';
const score=(txt,boost)=>{txt=txt.toLowerCase();return txt.includes(s)?boost:0;};
const R=[];PEOPLE.forEach(p=>{const sc=score(p.name,10)+score(p.tagline+p.ideas.join(' '),3)+score(p.life+p.legacy,1);if(sc)R.push([sc,`<a class=card href="#/person/${p.id}"><span class=tag>person</span><h3>${esc(p.name)}</h3><p>${esc(p.tagline)}</p></a>`]);});
CONCEPTS.forEach(c=>{const sc=score(c.name,10)+score(c.simple,3)+score(c.intuitive+c.formal+c.philosophy+c.why,1);if(sc)R.push([sc,`<a class=card href="#/concept/${c.id}"><span class="tag type-${c.type}">${c.type}</span><h3>${esc(c.name)}</h3><p>${c.simple}</p></a>`]);});
FIELDS.forEach(f=>{const sc=score(f.name,10)+score(f.core+f.philosophy,2);if(sc)R.push([sc,`<a class=card href="#/field/${f.id}"><span class=tag>field</span><h3>${f.icon} ${esc(f.name)}</h3></a>`]);});
ERAS.forEach(e=>{const sc=score(e.name,10)+score(e.what+e.why,1);if(sc)R.push([sc,`<a class=card href="#/era/${e.id}"><span class=tag>era</span><h3>${esc(e.name)}</h3></a>`]);});
GLOSSARY.forEach(([t,d])=>{if((t+d).toLowerCase().includes(s))R.push([5,`<a class=card href="#/glossary"><span class=tag>glossary</span><h3>${esc(t)}</h3><p>${esc(d)}</p></a>`]);});
R.sort((a,b)=>b[0]-a[0]);return `<h1 class=page>Search: “${esc(s)}”</h1><p class=sub>${R.length} results</p><div class=grid>${R.map(r=>r[1]).join('')}</div>`;};
function nf(){return '<h1 class=page>Not found</h1><p><a href="#/">Home</a></p>';}

function route(){cleanups.forEach(f=>f());cleanups=[];const h=location.hash.replace(/^#\/?/,'');const [path,q]=h.split('?');const [view,id]=path.split('/');const v=V[view||'home']||nf;
const arg=id!==undefined?decodeURIComponent(id):q;app.innerHTML=typeof v==='function'?v(arg):nf();if(v.after)v.after(arg);
document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')=='#/'+view));$('#nav').classList.remove('open');
// filters on list pages
const bind=(sel,key,base)=>{const x=$(sel);if(x)x.onchange=()=>{const p=new URLSearchParams(q||'');x.value?p.set(key,x.value):p.delete(key);location.hash='#/'+base+'?'+p.toString();};};
bind('#fe','era','people');bind('#ff','field','people');bind('#so','sort','people');bind('#ty','type','concepts');bind('#cf','field','concepts');
math();if(!id||view!='map')window.scrollTo(0,0);document.title=(app.querySelector('h1')?.textContent||'')+' · Physica Historia';}
window.addEventListener('hashchange',route);window.addEventListener('load',math);
$('#menuBtn').onclick=()=>$('#nav').classList.toggle('open');
let st;$('#search').addEventListener('input',e=>{clearTimeout(st);st=setTimeout(()=>{location.hash='#/search?q='+encodeURIComponent(e.target.value)},250)});
if(localStorage.getItem('ph_theme')=='dark'||(!localStorage.getItem('ph_theme')&&matchMedia('(prefers-color-scheme: dark)').matches))document.body.classList.add('dark');
$('#theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('ph_theme',document.body.classList.contains('dark')?'dark':'light');route();};
route();
})();
