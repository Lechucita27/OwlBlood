// Constantes, biomas, util, SoundSystem, drawRR, OWL_SPECIES

// ============================================================
//  CONSTANTES
// ============================================================
const CW = 800, CH = 450;
const GRAVITY      = 0.52;
const JUMP_FORCE   = -12.5;
const SPD          = 4.2;
let   WORLD_W      = 5400; // mutable: se expande en modo Battle Royale
const BLOCK_INT    = 1200; // 20s
const CLAW_CD      = 300;  // 5s
const CLAW_FRAMES  = 60;   // fases: windup(0-18) dash(18-42) impact(42-52) recovery(52-60)
const CLAW_WINDUP  = 18;
const CLAW_DASH    = 42;   // frame en que se aplica el daño
const CLAW_IMPACT  = 52;

// ============================================================
//  BIOMAS (pasto/plataformas aleatorios)
// ============================================================
const BIOMES = [
  { key:"forest",    name:"Bosque Nocturno",  body:"#5D4E37", top:"#7BBF4E",  topHi:"#A0D870", movCol:"#4A7B9D", movTop:"#6FAACC",
    skyA:"#1a1a4a", skyB:"#2a3a6a", skyC:"#4a6a9a", hill:"#1E3A2A", deco:"forest",    fxColor:"#FFE070" },
  { key:"snow",      name:"Tundra Nevada",    body:"#607080", top:"#D8EEFF",  topHi:"#FFFFFF", movCol:"#4866A0", movTop:"#88AACC",
    skyA:"#080C20", skyB:"#101828", skyC:"#182840", hill:"#1A2030", deco:"snow",      fxColor:"#FFFFFF" },
  { key:"desert",    name:"Desierto Árido",   body:"#AA7A18", top:"#E8C050",  topHi:"#F5D870", movCol:"#C88830", movTop:"#E8A840",
    skyA:"#180800", skyB:"#341400", skyC:"#602800", hill:"#2A1400", deco:"desert",    fxColor:"#F5D870" },
  { key:"cave",      name:"Cueva Mágica",     body:"#342848", top:"#883AAA",  topHi:"#CC66FF", movCol:"#4A3868", movTop:"#7844A8",
    skyA:"#04000A", skyB:"#0C0020", skyC:"#180040", hill:"#120020", deco:"cave",      fxColor:"#CC66FF" },
  { key:"volcanic",  name:"Volcán Activo",    body:"#4A1A08", top:"#CC4400",  topHi:"#FF7700", movCol:"#8A2800", movTop:"#C84400",
    skyA:"#180000", skyB:"#380800", skyC:"#581400", hill:"#280400", deco:"volcanic",  fxColor:"#FF7700" },
  { key:"celestial", name:"Jardín Celestial", body:"#4A3078", top:"#B888FF",  topHi:"#E0BFFF", movCol:"#6A50A0", movTop:"#A888E0",
    skyA:"#1A0833", skyB:"#3A1866", skyC:"#6A3AAA", hill:"#2A1850", deco:"celestial", fxColor:"#FFDDFF" },
];
let currentBiome = BIOMES[0];

// ============================================================
//  UTILIDADES
// ============================================================
function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }
function rnd(lo,hi){ return Math.floor(Math.random()*(hi-lo+1))+lo; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function aabb(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
function dist(ax,ay,bx,by){ return Math.hypot(ax-bx,ay-by); }
// ============================================================
//  SISTEMA DE SONIDO (Web Audio API - sintético)
// ============================================================
class SoundSystem{
  constructor(){ this.ctx=null;this.enabled=true;this.masterVol=0.38;this.unlocked=false; }
  unlock(){
    if(this.unlocked)return;
    try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)();
      if(this.ctx.state==="suspended") this.ctx.resume();
      this._buildBus();
      this.unlocked=true;
    }catch(e){ this.enabled=false; }
  }
  // Bus: dry path + reverb send (feedback delay network = pseudo reverb)
  _buildBus(){
    const c=this.ctx;
    this.master=c.createGain(); this.master.gain.value=this.masterVol;
    // Suave limitador vía compressor
    this.comp=c.createDynamicsCompressor();
    this.comp.threshold.value=-14; this.comp.knee.value=18; this.comp.ratio.value=4;
    this.comp.attack.value=0.003; this.comp.release.value=0.18;
    this.master.connect(this.comp).connect(c.destination);
    // Reverb bus
    this.revSend=c.createGain(); this.revSend.gain.value=1.0;
    // Dos líneas de delay con feedback cruzado para cola difusa
    const d1=c.createDelay(1.5), d2=c.createDelay(1.5);
    d1.delayTime.value=0.071; d2.delayTime.value=0.113;
    const fb1=c.createGain(), fb2=c.createGain();
    fb1.gain.value=0.42; fb2.gain.value=0.36;
    const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=3200;
    const wet=c.createGain(); wet.gain.value=0.18;
    this.revSend.connect(d1); this.revSend.connect(d2);
    d1.connect(fb1).connect(d2); d2.connect(fb2).connect(d1);
    d1.connect(lp); d2.connect(lp); lp.connect(wet).connect(this.master);
  }
  _dest(){ return this.master; }
  _wet(){ return this.revSend; }
  // ADSR envelope
  _adsr(g,t,a,d,s,r,peak){
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(peak,t+a);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002,peak*s),t+a+d);
    g.gain.setValueAtTime(Math.max(0.0002,peak*s),t+a+d+r*0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+a+d+r);
  }
  // Tono con capas detuned + envelope + pan + reverb send
  tone(freq,dur,type="sine",vol=0.18,opts={}){
    if(!this.enabled||!this.ctx)return;
    const t=this.ctx.currentTime;
    const detune=opts.detune!==undefined?opts.detune:7;
    const layers=opts.layers||2;
    const pan=opts.pan||0;
    const rev=opts.rev!==undefined?opts.rev:0.22;
    const a=opts.a||0.006, d=opts.d||dur*0.25, s=opts.s||0.35, r=opts.r||dur*0.7;
    const panner=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;
    if(panner) panner.pan.value=pan;
    const g=this.ctx.createGain();
    this._adsr(g,t,a,d,s,r,vol);
    const out= panner?(g.connect(panner),panner):g;
    out.connect(this._dest());
    const revG=this.ctx.createGain(); revG.gain.value=rev;
    out.connect(revG).connect(this._wet());
    for(let i=0;i<layers;i++){
      const o=this.ctx.createOscillator();
      o.type=type;
      o.frequency.setValueAtTime(freq,t);
      if(layers>1) o.detune.value=(i-(layers-1)/2)*detune*2;
      o.connect(g);
      o.start(t); o.stop(t+a+d+r+0.05);
    }
  }
  sweep(f1,f2,dur,type="sine",vol=0.15,opts={}){
    if(!this.enabled||!this.ctx)return;
    const t=this.ctx.currentTime;
    const layers=opts.layers||2;
    const detune=opts.detune!==undefined?opts.detune:6;
    const pan=opts.pan||0;
    const rev=opts.rev!==undefined?opts.rev:0.2;
    const curve=opts.curve||"exp";
    const panner=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;
    if(panner) panner.pan.value=pan;
    const g=this.ctx.createGain();
    this._adsr(g,t,0.008,dur*0.3,0.4,dur*0.7,vol);
    const out= panner?(g.connect(panner),panner):g;
    out.connect(this._dest());
    const revG=this.ctx.createGain(); revG.gain.value=rev;
    out.connect(revG).connect(this._wet());
    for(let i=0;i<layers;i++){
      const o=this.ctx.createOscillator();
      o.type=type;
      o.frequency.setValueAtTime(f1,t);
      if(curve==="lin") o.frequency.linearRampToValueAtTime(Math.max(1,f2),t+dur);
      else o.frequency.exponentialRampToValueAtTime(Math.max(1,f2),t+dur);
      if(layers>1) o.detune.value=(i-(layers-1)/2)*detune*2;
      o.connect(g);
      o.start(t); o.stop(t+dur+0.05);
    }
  }
  noise(dur,vol=0.12,cutoff=1200,opts={}){
    if(!this.enabled||!this.ctx)return;
    const t=this.ctx.currentTime;
    const type=opts.type||"lowpass";
    const q=opts.q||0.7;
    const pan=opts.pan||0;
    const rev=opts.rev!==undefined?opts.rev:0.15;
    const buf=this.ctx.createBuffer(1,Math.max(32,Math.floor(this.ctx.sampleRate*dur)),this.ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length*0.3);
    const src=this.ctx.createBufferSource();src.buffer=buf;
    const f=this.ctx.createBiquadFilter();f.type=type;f.frequency.value=cutoff;f.Q.value=q;
    const g=this.ctx.createGain();
    this._adsr(g,t,0.004,dur*0.2,0.5,dur*0.8,vol);
    const panner=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;
    if(panner) panner.pan.value=pan;
    src.connect(f).connect(g);
    const out= panner?(g.connect(panner),panner):g;
    out.connect(this._dest());
    const revG=this.ctx.createGain(); revG.gain.value=rev;
    out.connect(revG).connect(this._wet());
    src.start(t);
  }
  // FM para texturas metálicas/campana
  fm(carrier,mod,modDepth,dur,vol=0.14,opts={}){
    if(!this.enabled||!this.ctx)return;
    const t=this.ctx.currentTime;
    const pan=opts.pan||0;
    const rev=opts.rev!==undefined?opts.rev:0.3;
    const c=this.ctx.createOscillator(); c.type=opts.cType||"sine"; c.frequency.value=carrier;
    const m=this.ctx.createOscillator(); m.type=opts.mType||"sine"; m.frequency.value=mod;
    const mg=this.ctx.createGain(); mg.gain.value=modDepth;
    m.connect(mg).connect(c.frequency);
    const g=this.ctx.createGain();
    this._adsr(g,t,0.005,dur*0.2,0.25,dur*0.85,vol);
    const panner=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;
    if(panner) panner.pan.value=pan;
    c.connect(g);
    const out= panner?(g.connect(panner),panner):g;
    out.connect(this._dest());
    const revG=this.ctx.createGain(); revG.gain.value=rev;
    out.connect(revG).connect(this._wet());
    c.start(t); m.start(t); c.stop(t+dur+0.1); m.stop(t+dur+0.1);
  }
  _delay(fn,ms){ setTimeout(fn,ms); }
  // Sonido único por estilo de ataque de lechuza (capas, envolventes, reverb)
  playSpecies(style){
    if(!this.ctx)return;
    switch(style){
      case"silent":
        this.sweep(1100,180,0.55,"sine",0.09,{layers:3,detune:12,rev:0.55});
        this.noise(0.4,0.04,500,{rev:0.6});
        break;
      case"power":
        this.sweep(220,55,0.35,"sawtooth",0.22,{layers:3,detune:14,rev:0.25});
        this.tone(48,0.4,"square",0.2,{layers:1,rev:0.15});
        this._delay(()=>this.noise(0.15,0.1,1800,{type:"bandpass",q:3,rev:0.2}),40);
        break;
      case"ice":
        this.sweep(1800,3200,0.3,"sine",0.13,{layers:3,detune:22,rev:0.55});
        this.sweep(2400,3800,0.25,"triangle",0.09,{layers:2,detune:18,rev:0.6});
        this._delay(()=>this.fm(2600,1800,400,0.35,0.07,{rev:0.6}),60);
        break;
      case"shadow":
        this.sweep(360,80,0.6,"sine",0.16,{layers:3,detune:9,rev:0.5});
        this.noise(0.35,0.06,260,{rev:0.55});
        this._delay(()=>this.sweep(180,60,0.4,"sawtooth",0.08,{rev:0.45}),120);
        break;
      case"dust":
        this.noise(0.4,0.16,650,{q:1.2,rev:0.25});
        this._delay(()=>this.noise(0.18,0.08,900,{type:"highpass",rev:0.3}),70);
        this.sweep(420,180,0.3,"triangle",0.06,{rev:0.3});
        break;
      case"sonic":
        this.sweep(1600,380,0.35,"square",0.13,{layers:2,detune:8,rev:0.3});
        this.sweep(800,220,0.3,"sawtooth",0.1,{layers:2,detune:14,rev:0.3});
        this._delay(()=>this.sweep(2200,1400,0.15,"square",0.08,{rev:0.35}),100);
        break;
      case"flurry":
        for(let i=0;i<8;i++) this._delay(()=>this.tone(1700+i*170,0.07,"square",0.09,{layers:2,detune:10,pan:(i%2?0.3:-0.3),rev:0.3}),i*28);
        break;
      case"spin":
        this.sweep(380,1100,0.28,"triangle",0.13,{layers:2,detune:8,pan:-0.3,rev:0.3});
        this._delay(()=>this.sweep(1100,380,0.25,"triangle",0.11,{layers:2,detune:8,pan:0.3,rev:0.3}),140);
        this._delay(()=>this.noise(0.18,0.05,2600,{type:"bandpass",q:4}),220);
        break;
      case"fire":
        this.sweep(180,720,0.4,"sawtooth",0.18,{layers:3,detune:14,rev:0.3});
        this.noise(0.35,0.1,2400,{q:0.8,rev:0.25});
        this._delay(()=>this.noise(0.25,0.06,600,{rev:0.35}),80);
        break;
      case"boomerang":
        this.sweep(560,1200,0.22,"sine",0.14,{layers:2,detune:10,pan:-0.4,rev:0.35});
        this._delay(()=>this.sweep(1200,480,0.24,"sine",0.13,{layers:2,detune:10,pan:0.4,rev:0.35}),180);
        break;
      case"jab":
        this.tone(2600,0.07,"square",0.15,{layers:2,detune:20,rev:0.2});
        this._delay(()=>this.tone(2000,0.09,"square",0.1,{rev:0.25}),55);
        this._delay(()=>this.noise(0.06,0.08,3200,{type:"highpass"}),10);
        break;
      case"laser":
        this.sweep(3400,380,0.32,"sawtooth",0.12,{layers:3,detune:18,rev:0.4});
        this._delay(()=>this.sweep(380,180,0.25,"sine",0.1,{rev:0.45}),260);
        break;
      case"drill":
        for(let i=0;i<12;i++) this._delay(()=>this.tone(560+i*45,0.05,"square",0.08,{layers:2,detune:15,rev:0.2}),i*20);
        this.noise(0.3,0.05,1400,{type:"bandpass",q:5});
        break;
      case"star":
        this.sweep(520,1700,0.18,"sine",0.14,{layers:2,detune:9,rev:0.45});
        this._delay(()=>this.fm(1500,750,300,0.35,0.1,{rev:0.5}),130);
        this._delay(()=>this.tone(2100,0.2,"triangle",0.08,{layers:2,detune:12,rev:0.5}),200);
        break;
      default:
        this.tone(800,0.1,"square",0.12);
    }
  }
  // Sonido único por enemigo
  playEnemy(t){
    if(!this.ctx)return;
    switch(t){
      case"crow":
        this.sweep(560,200,0.24,"sawtooth",0.15,{layers:3,detune:14,rev:0.25});
        this._delay(()=>this.sweep(440,160,0.18,"square",0.1,{rev:0.3}),80);
        break;
      case"cat":
        this.sweep(780,320,0.2,"triangle",0.12,{layers:2,detune:15,rev:0.3});
        this._delay(()=>this.sweep(520,120,0.15,"sawtooth",0.1,{layers:2,detune:18,rev:0.3}),90);
        this._delay(()=>this.noise(0.1,0.05,1800,{type:"highpass"}),0);
        break;
      case"bat":
        this.sweep(2400,700,0.24,"square",0.09,{layers:3,detune:20,pan:-0.3,rev:0.3});
        this._delay(()=>this.sweep(2000,900,0.2,"square",0.07,{pan:0.3,rev:0.3}),110);
        break;
      case"snake":
        this.noise(0.35,0.12,2800,{type:"bandpass",q:2.5,rev:0.3});
        this.sweep(240,540,0.22,"sawtooth",0.1,{layers:2,detune:12,rev:0.3});
        break;
      case"ghost":
        this.sweep(110,420,0.6,"sine",0.14,{layers:3,detune:18,rev:0.6});
        this.sweep(440,200,0.45,"triangle",0.09,{layers:2,detune:14,rev:0.6});
        this._delay(()=>this.fm(320,160,80,0.4,0.07,{rev:0.65}),120);
        break;
      case"wasp":
        this.sweep(1200,1500,0.35,"sawtooth",0.1,{layers:3,detune:8,rev:0.2});
        this._delay(()=>this.sweep(1500,900,0.18,"sawtooth",0.09,{layers:2,detune:10,rev:0.25}),170);
        break;
      case"spike":
        this.tone(200,0.09,"square",0.2,{layers:2,detune:8,rev:0.15});
        this.tone(95,0.18,"sawtooth",0.16,{layers:1,rev:0.2});
        this._delay(()=>this.noise(0.08,0.08,500,{rev:0.2}),20);
        break;
    }
  }
  playStomp(){
    this.tone(200,0.09,"square",0.2,{layers:2,detune:10,rev:0.15});
    this.tone(80,0.18,"sine",0.14,{rev:0.15});
    this.noise(0.06,0.12,800,{type:"lowpass",rev:0.1});
  }
  playClawKill(){
    this.noise(0.05,0.1,4000,{type:"highpass",q:2,rev:0.2});
    this.sweep(1600,400,0.18,"square",0.1,{layers:2,detune:20,rev:0.3});
    this._delay(()=>this.tone(360,0.22,"triangle",0.13,{layers:2,detune:8,rev:0.35}),40);
  }
  playJump(){
    this.sweep(300,620,0.14,"square",0.09,{layers:2,detune:12,rev:0.25});
    this._delay(()=>this.sweep(620,820,0.08,"sine",0.06,{rev:0.3}),60);
  }
  playBlock(){
    this.fm(880,1320,200,0.25,0.12,{rev:0.4});
    this._delay(()=>this.tone(1320,0.18,"sine",0.1,{layers:2,detune:10,rev:0.45}),90);
    this._delay(()=>this.tone(1980,0.22,"triangle",0.08,{layers:2,detune:14,rev:0.5}),180);
  }
  playPizza(){
    const n=[523,659,784,880,1047,1319,1568];
    for(let i=0;i<n.length;i++)
      this._delay(()=>this.tone(n[i],0.3,"triangle",0.13,{layers:2,detune:8,pan:Math.sin(i)*0.25,rev:0.5}),i*75);
    this._delay(()=>this.fm(1760,880,300,0.5,0.1,{rev:0.6}),n.length*75);
  }
  playHurt(){
    this.sweep(480,100,0.32,"sawtooth",0.18,{layers:3,detune:20,rev:0.2});
    this.noise(0.18,0.08,900,{q:1.5,rev:0.2});
    this._delay(()=>this.sweep(220,60,0.2,"square",0.1,{rev:0.25}),120);
  }
  playCompanion(){
    this.tone(880,0.14,"sine",0.1,{layers:2,detune:8,pan:-0.2,rev:0.5});
    this._delay(()=>this.tone(1320,0.16,"sine",0.1,{layers:2,detune:10,pan:0.2,rev:0.5}),100);
    this._delay(()=>this.fm(1760,880,200,0.25,0.1,{rev:0.6}),220);
  }
  // Ambiente ocasional por bioma (más rico)
  playAmbient(biomeKey){
    if(!this.ctx||Math.random()>0.012) return;
    switch(biomeKey){
      case"forest":
        this.sweep(2100+Math.random()*400,2500+Math.random()*300,0.18,"sine",0.045,{layers:2,detune:20,pan:Math.random()*1.2-0.6,rev:0.55});
        break;
      case"snow":
        this.sweep(420,280,0.7,"sine",0.04,{layers:2,detune:30,rev:0.7});
        this.noise(0.4,0.02,400,{q:0.5,rev:0.6});
        break;
      case"desert":
        this.sweep(520,360,1.0,"sine",0.035,{layers:2,detune:15,rev:0.5});
        this.noise(0.6,0.03,550,{q:0.8,rev:0.5});
        break;
      case"cave":
        this.tone(170+Math.random()*50,0.55,"sine",0.05,{layers:2,detune:10,rev:0.75});
        if(Math.random()<0.3) this._delay(()=>this.tone(80,0.4,"sine",0.06,{rev:0.8}),200);
        break;
      case"volcanic":
        this.noise(0.5,0.06,360,{q:0.6,rev:0.35});
        if(Math.random()<0.4) this.sweep(100,60,0.6,"sawtooth",0.05,{rev:0.3});
        break;
      case"celestial":
        this.fm(900+Math.random()*500,400,150,0.45,0.05,{pan:Math.random()*1.4-0.7,rev:0.75});
        break;
    }
  }
}
const SFX=new SoundSystem();

function drawRR(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// ============================================================
//  14 ESPECIES
// ============================================================
const OWL_SPECIES = [
  { name:"Lechuza de Campanario", nameEn:"Barn Owl",           bodyColor:"#C8A96E",wingColor:"#8B6914",faceColor:"#FFF",   eyeColor:"#3D2B00",irisColor:"#8B6914",beakColor:"#E8D5A0",footColor:"#C8A96E", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:1.00,faceDisk:true, hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"silent",    atkColor:"#FFF5C0", atkColor2:"#E8D5A0" },
  { name:"Búho Real",             nameEn:"Great Horned Owl",   bodyColor:"#7B5B3A",wingColor:"#5C4020",faceColor:"#C4A46B",eyeColor:"#000",   irisColor:"#FFD700",beakColor:"#C8A020",footColor:"#7B5B3A", hasEarTufts:true, tuftColor:"#3A2510",hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:1.00,faceDisk:false,hasHBars:true, hBarColor:"#5C4020",hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"power",     atkColor:"#FFD700", atkColor2:"#FF8800" },
  { name:"Lechuza Nival",         nameEn:"Snowy Owl",          bodyColor:"#F0F0F0",wingColor:"#D8D8D8",faceColor:"#FFF",   eyeColor:"#000",   irisColor:"#FFD700",beakColor:"#A0A0A0",footColor:"#E8E8E8", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#333",  spotCount:7, hasLongLegs:false,scale:1.05,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"ice",       atkColor:"#AADDFF", atkColor2:"#FFFFFF" },
  { name:"Lechuza Moteada",       nameEn:"Spotted Owl",        bodyColor:"#3D2B1F",wingColor:"#2A1A10",faceColor:"#7D5B40",eyeColor:"#000",   irisColor:"#8B5A2B",beakColor:"#8B6040",footColor:"#3D2B1F", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#DDD",  spotCount:10,hasLongLegs:false,scale:1.00,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"shadow",    atkColor:"#6A00AA", atkColor2:"#220044" },
  { name:"Lechuza Llanera",       nameEn:"Burrowing Owl",      bodyColor:"#C4A46B",wingColor:"#9C7840",faceColor:"#E8D090",eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#D4A840",footColor:"#C4A46B", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:true, scale:1.00,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:true, bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"dust",      atkColor:"#D4A840", atkColor2:"#8B6914" },
  { name:"Autillo Americano",     nameEn:"Screech Owl",        bodyColor:"#8A8A8A",wingColor:"#666",   faceColor:"#AAA",   eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#BBB",   footColor:"#888",    hasEarTufts:true, tuftColor:"#555",   hasStripes:true, stripeColor:"#555", hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:0.85,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"sonic",     atkColor:"#FF44CC", atkColor2:"#AA00AA" },
  { name:"Lechuza Enana",         nameEn:"Elf Owl",            bodyColor:"#9C8B6E",wingColor:"#7A6B50",faceColor:"#BBA880",eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#C8A86E",footColor:"#9C8B6E", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:0.62,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:true, longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"flurry",    atkColor:"#FFE040", atkColor2:"#FFFFFF" },
  { name:"Lechuza Barrada",       nameEn:"Barred Owl",         bodyColor:"#7D6B52",wingColor:"#5C4A34",faceColor:"#C4B49A",eyeColor:"#000",   irisColor:"#4A3020",beakColor:"#B0A080",footColor:"#7D6B52", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:1.00,faceDisk:true, hasHBars:true, hBarColor:"#C4B49A",hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"spin",      atkColor:"#E8DDB5", atkColor2:"#7D6B52" },
  { name:"Cárabo Común",          nameEn:"Tawny Owl",          bodyColor:"#B5712A",wingColor:"#8A5010",faceColor:"#E8C070",eyeColor:"#000",   irisColor:"#000",   beakColor:"#D4A040",footColor:"#B5712A", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#D4A060",spotCount:6, hasLongLegs:false,scale:1.00,faceDisk:true, hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"fire",      atkColor:"#FF4400", atkColor2:"#FFDD00" },
  { name:"Búho Chico",            nameEn:"Long-eared Owl",     bodyColor:"#9B6B3A",wingColor:"#7A5020",faceColor:"#E8C070",eyeColor:"#000",   irisColor:"#FF8800",beakColor:"#C09040",footColor:"#9B6B3A", hasEarTufts:true, tuftColor:"#4A2C10",hasStripes:true, stripeColor:"#7A5020",hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:0.95,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:true, spectacles:false,surprisedBrows:false, attackStyle:"boomerang", atkColor:"#FF8800", atkColor2:"#FFD700" },
  { name:"Mochuelo Europeo",      nameEn:"Little Owl",         bodyColor:"#7A6B52",wingColor:"#5A4B34",faceColor:"#C4B09A",eyeColor:"#000",   irisColor:"#F0E040",beakColor:"#A09060",footColor:"#7A6B52", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#EEE",  spotCount:8, hasLongLegs:false,scale:0.72,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:true, bigEyes:false,longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"jab",       atkColor:"#F0E040", atkColor2:"#FFFFFF" },
  { name:"Lechuza de Anteojos",   nameEn:"Spectacled Owl",     bodyColor:"#2C2010",wingColor:"#1A1008",faceColor:"#F5E8C0",eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#C8A020",footColor:"#3A2A10", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:false,spotColor:null,spotCount:0, hasLongLegs:false,scale:1.00,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:false,longTufts:false,spectacles:true, surprisedBrows:false, attackStyle:"laser",     atkColor:"#00FFDD", atkColor2:"#FFFFFF" },
  { name:"Mochuelo Americano",    nameEn:"Saw-whet Owl",       bodyColor:"#A06040",wingColor:"#784020",faceColor:"#E8D0A0",eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#C8A060",footColor:"#A06040", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#F5E0C0",spotCount:9, hasLongLegs:false,scale:0.58,faceDisk:false,hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:true, longTufts:false,spectacles:false,surprisedBrows:false, attackStyle:"drill",     atkColor:"#FFA040", atkColor2:"#F5E0C0" },
  { name:"Lechuza Boreal",        nameEn:"Boreal Owl",         bodyColor:"#8B7060",wingColor:"#6A5040",faceColor:"#F0E8D0",eyeColor:"#000",   irisColor:"#F5D020",beakColor:"#C8B090",footColor:"#8B7060", hasEarTufts:false,tuftColor:null,  hasStripes:false,stripeColor:null,hasSpots:true, spotColor:"#FFFAE0",spotCount:6, hasLongLegs:false,scale:0.80,faceDisk:true, hasHBars:false,hBarColor:null,  hasEyebrows:false,bigEyes:true, longTufts:false,spectacles:false,surprisedBrows:true, attackStyle:"star",      atkColor:"#FFFAE0", atkColor2:"#88CCFF" },
];
