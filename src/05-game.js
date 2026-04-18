// buildLevel y clase Game

// ============================================================
//  NIVEL
// ============================================================
function buildLevel(){
  const platforms=[],enemies=[];
  // Suelos
  platforms.push(new Platform(0,390,940,60));
  platforms.push(new Platform(1000,390,600,60));
  platforms.push(new Platform(1720,390,680,60));
  platforms.push(new Platform(2700,390,120,60));
  platforms.push(new Platform(3200,390,1000,60));
  platforms.push(new Platform(4300,390,1000,60));
  platforms.push(new Platform(4100,220,1200,30,"#7B5B3A"));

  // — Sección 1 —
  platforms.push(new Platform(160,320,110,18));
  platforms.push(new Platform(340,260,110,18));
  platforms.push(new Platform(540,300,110,18));
  platforms.push(new Platform(720,235,110,18));
  enemies.push(new WalkingEnemy(170,292,160,270));
  enemies.push(new SnakeEnemy(400,376,340,800));
  enemies.push(new WalkingEnemy(540,272,540,640));

  // — Sección 2 —
  platforms.push(new Platform(960,330,80,18));
  platforms.push(new MovingPlatform(1100,285,90,18,1100,1250,1.6));
  platforms.push(new Platform(1310,248,110,18));
  platforms.push(new Platform(1480,308,110,18));
  platforms.push(new Platform(1620,355,100,18));
  enemies.push(new WalkingEnemy(1310,220,1310,1410));
  enemies.push(new WaspEnemy(1130,160,1020,1510));
  enemies.push(new JumpingEnemy(1490,280,1480,1580));
  enemies.push(new GhostEnemy(1700,280));
  enemies.push(new SpikeTrap(1060,370));

  // — Sección 3: Escalera —
  platforms.push(new Platform(1780,330,100,18));
  platforms.push(new Platform(1940,278,100,18));
  platforms.push(new Platform(2100,228,100,18));
  platforms.push(new Platform(2270,188,120,18));
  platforms.push(new Platform(2440,238,110,18));
  platforms.push(new Platform(2600,298,110,18));
  enemies.push(new JumpingEnemy(1940,250,1940,2030));
  enemies.push(new WalkingEnemy(2270,160,2270,2380));
  enemies.push(new BatEnemy(2110,158,2010,2610));
  enemies.push(new SnakeEnemy(2440,224,2440,2540));
  enemies.push(new GhostEnemy(2600,230));
  enemies.push(new WaspEnemy(2200,120,2050,2580));
  enemies.push(new SpikeTrap(2370,370));

  // — Sección 4: Móviles —
  platforms.push(new MovingPlatform(2740,308,85,18,2740,2900,1.8));
  platforms.push(new MovingPlatform(2920,248,85,18,2920,3080,2.0));
  platforms.push(new MovingPlatform(3080,308,85,18,3080,3170,1.5));
  enemies.push(new WalkingEnemy(2600,270,2600,2710));
  enemies.push(new JumpingEnemy(3210,360,3210,3390));
  enemies.push(new BatEnemy(2870,188,2740,3160));
  enemies.push(new GhostEnemy(3000,250));

  // — Sección 5: Tramo denso —
  platforms.push(new Platform(3300,308,120,18));
  platforms.push(new Platform(3480,248,120,18));
  platforms.push(new Platform(3670,298,120,18));
  platforms.push(new Platform(3840,348,120,18));
  enemies.push(new WalkingEnemy(3300,280,3300,3410));
  enemies.push(new JumpingEnemy(3480,220,3480,3590));
  enemies.push(new WalkingEnemy(3840,320,3840,3950));
  enemies.push(new SnakeEnemy(3670,284,3670,3780));
  enemies.push(new BatEnemy(3510,178,3310,4010));
  enemies.push(new GhostEnemy(3700,220));
  enemies.push(new WaspEnemy(3400,130,3300,4050));
  enemies.push(new SpikeTrap(3600,370));
  enemies.push(new SpikeTrap(3900,370));

  // — Sección 6: Meta —
  platforms.push(new Platform(4070,348,100,18));
  platforms.push(new Platform(4220,298,100,18));
  platforms.push(new Platform(4370,258,100,18));
  enemies.push(new WalkingEnemy(4220,190,4220,4510));
  enemies.push(new JumpingEnemy(4520,190,4420,4810));
  enemies.push(new BatEnemy(4320,148,4220,4910));
  enemies.push(new GhostEnemy(4600,180));
  enemies.push(new SnakeEnemy(4700,376,4600,4980));

  const pizza=new Pizza(5070,172);
  return{platforms,enemies,pizza};
}

// ============================================================
//  GAME
// ============================================================
class Game{
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext("2d");
    this.state="menu";
    this.input={left:false,right:false,jump:false,jumpPressed:false,clawPressed:false};
    this.lastTime=0;this.menuOwlIndex=0;this.menuOwlTimer=0;this.menuBlink=0;
    this.menuOption=0; // 0=Campaign, 1=Battle Royale
    this.brKills=0; this.brWave=1; this.brSpawnTimer=0;
    this.winParticles=[];this.companions=[];this.secretBlock=null;
    this.blockTimer=0;this.blockFlash=0;
    this.stars=Array.from({length:70},()=>({x:Math.random()*WORLD_W,y:Math.random()*200,r:Math.random()*1.8+0.5,alpha:Math.random()*0.5+0.3}));
    this.biomeFx=[]; // partículas ambientales animadas
    this.bindInput();
  }
  initBiomeFx(){
    this.biomeFx=[];
    const n=80;
    for(let i=0;i<n;i++){
      this.biomeFx.push({
        x:Math.random()*CW,
        y:Math.random()*CH,
        vx:(Math.random()-0.5)*0.6,
        vy:(Math.random()-0.5)*0.6,
        r:Math.random()*2+0.5,
        t:Math.random()*Math.PI*2,
        hue:Math.random()
      });
    }
  }
  updateBiomeFx(){
    const key=currentBiome.key;
    for(const p of this.biomeFx){
      p.t+=0.04;
      switch(key){
        case"forest":   p.x+=p.vx*0.4;p.y+=Math.sin(p.t*1.5)*0.3;break; // luciérnagas flotando
        case"snow":     p.x+=p.vx*0.3;p.y+=1.2+Math.sin(p.t)*0.2;if(p.y>CH)p.y=-5; break; // nieve cayendo
        case"desert":   p.x+=1.5;p.y+=Math.sin(p.t*3)*0.3;if(p.x>CW)p.x=-5; break; // arena con viento
        case"cave":     p.y-=0.6;p.x+=Math.sin(p.t)*0.3;if(p.y<-5)p.y=CH+5; break; // esporas subiendo
        case"volcanic": p.y-=1.4+Math.random()*0.5;p.x+=(Math.random()-0.5)*0.5;if(p.y<-5){p.y=CH+5;p.x=Math.random()*CW;} break; // brasas
        case"celestial":p.x+=p.vx;p.y+=p.vy+Math.sin(p.t)*0.3;
                        if(p.x<0)p.x=CW;if(p.x>CW)p.x=0;if(p.y<0)p.y=CH;if(p.y>CH)p.y=0; break;
      }
    }
    SFX.playAmbient(key);
  }
  drawBiomeFx(ctx){
    const key=currentBiome.key;
    for(const p of this.biomeFx){
      const flicker=0.5+Math.sin(p.t*3)*0.5;
      ctx.save();
      switch(key){
        case"forest":
          ctx.globalAlpha=flicker*0.9;
          const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          g.addColorStop(0,"#FFF");g.addColorStop(0.3,"#FFE070");g.addColorStop(1,"rgba(255,224,112,0)");
          ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);ctx.fill();
          ctx.fillStyle="#FFFFC0";ctx.beginPath();ctx.arc(p.x,p.y,p.r*0.7,0,Math.PI*2);ctx.fill();
          break;
        case"snow":
          ctx.globalAlpha=0.8;ctx.fillStyle="#FFFFFF";
          ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
          // estrella de copo pequeña
          ctx.strokeStyle="#FFFFFF";ctx.lineWidth=0.6;ctx.globalAlpha=0.5;
          for(let i=0;i<3;i++){const a=(i/3)*Math.PI;
            ctx.beginPath();ctx.moveTo(p.x-Math.cos(a)*p.r*1.6,p.y-Math.sin(a)*p.r*1.6);
            ctx.lineTo(p.x+Math.cos(a)*p.r*1.6,p.y+Math.sin(a)*p.r*1.6);ctx.stroke();}
          break;
        case"desert":
          ctx.globalAlpha=0.45;ctx.fillStyle="#F5D870";
          ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*1.4,p.r*0.5,0,0,Math.PI*2);ctx.fill();
          break;
        case"cave":
          ctx.globalAlpha=flicker*0.7;
          const gc=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
          gc.addColorStop(0,"#EE99FF");gc.addColorStop(1,"rgba(204,102,255,0)");
          ctx.fillStyle=gc;ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);ctx.fill();
          ctx.fillStyle="#FFDDFF";ctx.beginPath();ctx.arc(p.x,p.y,p.r*0.6,0,Math.PI*2);ctx.fill();
          break;
        case"volcanic":
          ctx.globalAlpha=flicker;
          const gv=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
          gv.addColorStop(0,"#FFEE00");gv.addColorStop(0.4,"#FF6600");gv.addColorStop(1,"rgba(255,30,0,0)");
          ctx.fillStyle=gv;ctx.beginPath();ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2);ctx.fill();
          break;
        case"celestial":
          ctx.globalAlpha=flicker*0.9;
          const gs=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
          const hue=Math.floor(p.hue*360);
          gs.addColorStop(0,"#FFFFFF");gs.addColorStop(0.3,`hsl(${hue},100%,80%)`);gs.addColorStop(1,"rgba(255,255,255,0)");
          ctx.fillStyle=gs;ctx.beginPath();ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2);ctx.fill();
          // estrella 4 puntas
          ctx.strokeStyle="#FFFFFF";ctx.lineWidth=0.8;
          ctx.beginPath();ctx.moveTo(p.x-p.r*3,p.y);ctx.lineTo(p.x+p.r*3,p.y);
          ctx.moveTo(p.x,p.y-p.r*3);ctx.lineTo(p.x,p.y+p.r*3);ctx.stroke();
          break;
      }
      ctx.restore();
    }
  }
  bindInput(){
    // --- Ratón (disparo en Battle Royale) ---
    this.mouse={x:CW/2,y:CH/2,down:false};
    const canvas=this.canvas||document.querySelector("canvas");
    const getMouse=(e)=>{
      const r=(canvas||document.body).getBoundingClientRect();
      const sx=(e.clientX-r.left)*(CW/r.width);
      const sy=(e.clientY-r.top)*(CH/r.height);
      return {x:sx,y:sy};
    };
    const target = canvas||window;
    target.addEventListener("mousemove",e=>{
      const m=getMouse(e);this.mouse.x=m.x;this.mouse.y=m.y;
    });
    target.addEventListener("mousedown",e=>{
      if(e.button===0){SFX.unlock();this.mouse.down=true;this.input.fire=true;e.preventDefault();}
    });
    target.addEventListener("mouseup",e=>{
      if(e.button===0){this.mouse.down=false;this.input.fire=false;}
    });
    target.addEventListener("contextmenu",e=>e.preventDefault());
    window.addEventListener("keydown",e=>{
      SFX.unlock();
      if(["ArrowLeft","a","A"].includes(e.key))  this.input.left=true;
      if(["ArrowRight","d","D"].includes(e.key)) this.input.right=true;
      if(["ArrowUp","w","W"," "].includes(e.key)&&!this.input.jump){this.input.jump=true;this.input.jumpPressed=true;}
      if(["z","Z","e","E"].includes(e.key)) this.input.clawPressed=true;
      if(["f","F","j","J","x","X"].includes(e.key)) this.input.fire=true;
      // Navegación del menú
      if(this.state==="menu"){
        if(["ArrowUp","w","W"].includes(e.key)){ this.menuOption=(this.menuOption+1)%2; SFX.tone(700,0.06,"square",0.08); }
        if(["ArrowDown","s","S"].includes(e.key)){ this.menuOption=(this.menuOption+1)%2; SFX.tone(500,0.06,"square",0.08); }
        if(e.key==="Enter"||e.key===" "){
          if(this.menuOption===0) this.startGame();
          else this.startBattleRoyale();
        }
      }
      if((e.key==="r"||e.key==="R")&&this.state!=="playing"&&this.state!=="battleroyale"){
        if(this.lastMode==="br") this.startBattleRoyale(); else this.startGame();
      }
      if(["ArrowLeft","ArrowRight","ArrowUp"," "].includes(e.key))e.preventDefault();
    });
    window.addEventListener("keyup",e=>{
      if(["ArrowLeft","a","A"].includes(e.key))  this.input.left=false;
      if(["ArrowRight","d","D"].includes(e.key)) this.input.right=false;
      if(["ArrowUp","w","W"," "].includes(e.key)){this.input.jump=false;}
      if(["f","F","j","J","x","X"].includes(e.key)) this.input.fire=false;
    });
  }
  startGame(){
    SFX.unlock();
    currentBiome=pick(BIOMES);
    const sp=pick(OWL_SPECIES);
    this.player=new Player(sp);
    const lvl=buildLevel();
    this.platforms=lvl.platforms;this.enemies=lvl.enemies;this.pizza=lvl.pizza;
    this.camera=new Camera();this.timer=0;this.state="playing";
    this.winParticles=[];this.companions=[];this.secretBlock=null;
    this.blockTimer=0;this.blockFlash=0;
    // 50% de probabilidad: la lechuza aparece con 3 crías que duran toda la partida
    this.chicks=[];
    if(Math.random()<0.5){
      for(let i=0;i<3;i++) this.chicks.push(new Chick(sp,i));
    }
    window._gameRef=this;
    this.initBiomeFx();
  }
  startBattleRoyale(){
    SFX.unlock();
    currentBiome=pick(BIOMES);
    // MAPA ENORME
    WORLD_W = 18000;
    const sp=pick(OWL_SPECIES);
    this.player=new Player(sp);
    // Reubicar jugador en mitad del mapa
    this.player.x=WORLD_W/2; this.player.y=300;
    // Generar plataformas procedural
    const platforms=[];
    // Suelo con huecos ocasionales
    let gx=0;
    while(gx<WORLD_W){
      const segW=rnd(400,900);
      platforms.push(new Platform(gx,390,segW,60));
      gx+=segW+(Math.random()<0.2?rnd(80,140):0);
    }
    // Islas flotantes
    for(let i=0;i<60;i++){
      const px=rnd(100,WORLD_W-200);
      const py=rnd(160,340);
      const pw=rnd(90,180);
      platforms.push(new Platform(px,py,pw,18));
    }
    // Torres / paredes ocasionales
    for(let i=0;i<16;i++){
      const px=rnd(200,WORLD_W-400);
      platforms.push(new Platform(px,220,40,170));
    }
    this.platforms=platforms;
    this.enemies=[];
    this.pizza={collected:true,particles:[],update:()=>{},getBounds:()=>({x:-9e9,y:-9e9,w:1,h:1}),draw:()=>{}};
    this.camera=new Camera();this.timer=0;this.state="battleroyale";
    this.winParticles=[];this.companions=[];this.secretBlock=null;
    this.blockTimer=0;this.blockFlash=0;
    this.chicks=[];
    if(Math.random()<0.5) for(let i=0;i<3;i++) this.chicks.push(new Chick(sp,i));
    this.brKills=0; this.weaponPickups=[]; this.bullets=[]; this.botsDead=0;
    this.lastMode="br";
    window._gameRef=this;
    this.initBiomeFx();
    // --- Armas por todos lados (~180) ---
    const N_WEAPONS=180;
    for(let i=0;i<N_WEAPONS;i++){
      const w=randomWeapon();
      const x=rnd(80,WORLD_W-80);
      this.weaponPickups.push(new WeaponPickup(w,x,340));
    }
    // --- 100 IA Lechuzas ---
    this.bots=[];
    for(let i=0;i<100;i++){
      const botSp=pick(OWL_SPECIES);
      let bx;
      do { bx=rnd(60,WORLD_W-60); } while(Math.abs(bx-this.player.x)<600);
      this.bots.push(new BotOwl(botSp,bx,rnd(100,300)));
    }
    // --- Zona (gas tipo Fortnite) ---
    this.zone = {
      cx:WORLD_W/2, cy:CH/2,
      halfW:WORLD_W/2+50, halfH:CH/2+50,
      nextCx:WORLD_W/2, nextCy:CH/2,
      nextHalfW:WORLD_W/2+50, nextHalfH:CH/2+50,
    };
    this.zonePhase=0;      // 0..N
    this.zoneTimer=60*45;  // 45s hasta primer cierre
    this.zoneClosing=false;
    this.zoneCloseLeft=0;
    this._pickNextZone();
  }
  _pickNextZone(){
    const shrink=[1.0,0.65,0.4,0.24,0.12,0.04,0.01];
    const s=shrink[Math.min(this.zonePhase+1,shrink.length-1)];
    const cur=this.zone;
    const nhW=Math.max(180,(WORLD_W/2)*s);
    const nhH=Math.max(140,(CH/2)*s);
    // El próximo centro está dentro del actual
    const mx=clamp(cur.cx+rnd(-cur.halfW*0.4,cur.halfW*0.4),nhW+50,WORLD_W-nhW-50);
    const my=clamp(cur.cy+rnd(-cur.halfH*0.3,cur.halfH*0.3),nhH+40,CH-nhH-40);
    this.zone.nextCx=mx;this.zone.nextCy=my;
    this.zone.nextHalfW=nhW;this.zone.nextHalfH=nhH;
  }
  isInsideZone(x,y){
    const z=this.zone;
    return Math.abs(x-z.cx)<z.halfW && Math.abs(y-z.cy)<z.halfH;
  }
  updateZone(){
    if(this.zoneClosing){
      this.zoneCloseLeft--;
      const f=this.zoneCloseLeft/this.zoneCloseDur;
      const z=this.zone;
      z.cx = z.nextCx + (this.zoneStart.cx-z.nextCx)*f;
      z.cy = z.nextCy + (this.zoneStart.cy-z.nextCy)*f;
      z.halfW = z.nextHalfW + (this.zoneStart.halfW-z.nextHalfW)*f;
      z.halfH = z.nextHalfH + (this.zoneStart.halfH-z.nextHalfH)*f;
      if(this.zoneCloseLeft<=0){
        this.zoneClosing=false;
        this.zonePhase++;
        this.zoneTimer=60*(35-Math.min(this.zonePhase*4,25));
        this._pickNextZone();
      }
    } else {
      this.zoneTimer--;
      if(this.zoneTimer<=0){
        this.zoneClosing=true;
        this.zoneCloseDur=60*12; // 12s cerrando
        this.zoneCloseLeft=this.zoneCloseDur;
        this.zoneStart={cx:this.zone.cx,cy:this.zone.cy,halfW:this.zone.halfW,halfH:this.zone.halfH};
        SFX.tone(220,0.6,"sawtooth",0.14,{layers:3,detune:30,rev:0.5});
      }
    }
  }
  spawnSecretBlock(){
    const px=this.player.x;
    const cands=this.platforms.filter(p=>Math.abs((p.x+p.w/2)-px)<700&&p.h<=30&&p.y>100);
    if(!cands.length)return;
    const pl=pick(cands);
    this.secretBlock=new SecretBlock(pl.x+rnd(8,Math.max(8,pl.w-44)),pl.y-42);
    this.blockFlash=80;
  }
  update(){
    if(this.state==="menu"){this.menuOwlTimer++;this.menuBlink++;if(this.menuOwlTimer>90){this.menuOwlTimer=0;this.menuOwlIndex=(this.menuOwlIndex+1)%OWL_SPECIES.length;}return;}
    if(this.state==="playing"){
      this.timer++;if(this.blockFlash>0)this.blockFlash--;
      // Bloque secreto
      this.blockTimer++;
      if(this.blockTimer>=BLOCK_INT){this.blockTimer=0;if(!this.secretBlock||this.secretBlock.collected)this.spawnSecretBlock();}
      if(this.secretBlock){
        this.secretBlock.update();
        if(!this.secretBlock.collected&&aabb(this.player,this.secretBlock.getBounds())){
          this.secretBlock.collect();this.player.score+=300;
          const sp=pick(OWL_SPECIES);
          const c=new CompanionOwl(sp,this.companions.length);
          c.spawn(this.player.x+16,this.player.y);this.companions.push(c);
          if(this.companions.length>6)this.companions.shift();
          SFX.playBlock();SFX.playCompanion();
        }
      }
      // Aliadas
      const activeComps=this.companions.filter(c=>c.active);
      for(const c of this.companions) c.update(this.enemies,this.player.x+16,this.player.y+20);
      // Plataformas y enemigos
      for(const p of this.platforms) p.update();
      const px=this.player.x+16,py=this.player.y+20;
      for(const e of this.enemies){
        if(e instanceof JumpingEnemy)e.update(this.platforms,px);
        else if(e instanceof GhostEnemy)e.update(this.platforms,px,py);
        else e.update(this.platforms,px);
      }
      this.player.update(this.input,this.platforms,this.enemies,this.pizza);
      // Crías: atacan autónomamente (2 hits para matar)
      if(this.chicks){
        for(const c of this.chicks) c.update(this.enemies,this.player.x+16,this.player.y+20,this.player.facingRight);
      }
      this.pizza.update();
      this.updateBiomeFx();
      this.camera.update(px);
      if(this.pizza.collected&&this.pizza.particles.length===0){this.state="win";this.spawnWinParticles();}
      if(this.player.dead&&this.player.y>CH+200){this.state="gameover";this.deathTimer=0;this.deathBloodDrops=[];SFX.playHurt();}
      return;
    }
    // ---------- BATTLE ROYALE ----------
    if(this.state==="battleroyale"){
      this.timer++;
      this.updateZone();
      for(const p of this.platforms) p.update();
      const px=this.player.x+16, py=this.player.y+20;
      // Bots (solo actualizan si están relativamente cerca O si quedan pocos)
      const alive=this.bots.filter(b=>b.alive);
      const simulateAll = alive.length<=30;
      for(const b of this.bots){
        if(!b.alive){
          if(b.deathTimer<120) b.update(this);
          continue;
        }
        if(simulateAll || Math.abs(b.x-this.player.x)<2400) b.update(this);
        else {
          // Lejos: solo daño por gas y físicas mínimas
          b.vy+=GRAVITY;if(b.vy>15)b.vy=15;b.y+=b.vy;
          if(b.y>CH+200){b.alive=false;this.botsDead++;continue;}
          for(const pl of this.platforms){
            const pb=pl.getBounds();
            if(aabb(b,pb)){if(b.vy>0){b.y=pb.y-b.h;b.vy=0;}}
          }
          if(this.zone && !this.isInsideZone(b.x+b.w/2,b.y+b.h/2) && this.timer%30===0){
            b.hp-=0.5;if(b.hp<=0) b._die(this,"gas");
          }
        }
      }
      // Daño de gas al jugador
      if(!this.isInsideZone(this.player.x+16,this.player.y+20) && this.timer%30===0 && this.player.invincible<=0){
        this.player.takeDamage(0.5);
        this.player.invincible=30;
      }
      // Aliadas / Crías
      for(const c of this.companions) c.update(this.enemies,this.player.x+16,this.player.y+20);
      this.player.update(this.input,this.platforms,this.enemies,this.pizza);
      if(this.chicks){
        for(const c of this.chicks) c.update(this.enemies,this.player.x+16,this.player.y+20,this.player.facingRight);
      }
      // Pickups
      for(const wp of this.weaponPickups) wp.update();
      for(const wp of this.weaponPickups){
        if(!wp.picked && aabb(this.player,wp.getBounds())){
          wp.picked=true;
          this.player.equipWeapon(wp.type);
          const rar=RARITIES[wp.type.rarity];
          SFX.tone(1400,0.1,"square",0.12,{layers:2,detune:15,rev:0.35});
          SFX.tone(1800,0.16,"sine",0.1,{rev:0.45});
          if(wp.type.rarity==="mitico"){SFX.fm(2400,1200,400,0.35,0.12,{rev:0.6});}
        }
      }
      this.weaponPickups=this.weaponPickups.filter(w=>!w.picked);
      // Balas
      for(const b of this.bullets) b.update(null,this);
      this.bullets=this.bullets.filter(b=>b.alive);
      this.updateBiomeFx();
      this.camera.update(px);
      // Condición de victoria
      const alivePlayer=!this.player.dead;
      const aliveBots=this.bots.filter(b=>b.alive).length;
      if(alivePlayer && aliveBots===0){
        this.state="win";this.spawnWinParticles();
      }
      if(this.player.dead&&this.player.y>CH+200){this.state="gameover";this.deathTimer=0;this.deathBloodDrops=[];SFX.playHurt();}
      return;
    }
    this.pizza.update();this.timer++;
    for(const p of this.winParticles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.05;p.life--;p.alpha=p.life/p.maxLife;}
    this.winParticles=this.winParticles.filter(p=>p.life>0);
    if(this.state==="gameover"){
      if(this.deathTimer===undefined) this.deathTimer=0;
      this.deathTimer++;
      // Gotas de sangre animadas (puddle growing)
      if(this.deathBloodDrops===undefined) this.deathBloodDrops=[];
      if(this.deathTimer<120 && this.deathTimer%6===0){
        this.deathBloodDrops.push({x:(Math.random()-0.5)*80,y:-20,vy:1+Math.random()*2,r:1+Math.random()*2.5,life:60});
      }
      for(const d of this.deathBloodDrops){d.y+=d.vy;d.vy+=0.25;d.life--;}
      this.deathBloodDrops=this.deathBloodDrops.filter(d=>d.life>0);
    }
  }
  spawnWinParticles(){
    const cols=["#F5C842","#C0392B","#9B2020","#F5E642","#7BBF4E","#4A7B9D","#FFF"];
    for(let i=0;i<80;i++)this.winParticles.push({x:CW/2+(Math.random()-0.5)*200,y:CH/2-50,vx:(Math.random()-0.5)*5,vy:-Math.random()*6-2,color:pick(cols),life:80+Math.random()*60,maxLife:140,alpha:1,r:3+Math.random()*5});
  }
  gameLoop(ts){this.lastTime=ts;try{this.update();}catch(e){console.error("update error:",e);}try{this.draw();}catch(e){console.error("draw error:",e);}requestAnimationFrame(t=>this.gameLoop(t));}
  start(){requestAnimationFrame(ts=>{this.lastTime=ts;this.gameLoop(ts);});}

  draw(){
    const ctx=this.ctx;
    if(this.state==="menu")    {this.drawMenu(ctx);return;}
    if(this.state==="win")     {this.drawWin(ctx);return;}
    if(this.state==="gameover"){this.drawGameOver(ctx);return;}
    if(this.state==="battleroyale"){this.drawBattleRoyale(ctx);return;}
    this.drawPlaying(ctx);
  }

  drawBattleRoyale(ctx){
    const camX=this.camera.x;
    this.drawSky(ctx,camX);
    this.camera.apply(ctx);
    // Culling: solo dibuja lo visible
    const visL=camX-60, visR=camX+CW+60;
    for(const p of this.platforms){
      const pb=p.getBounds();
      if(pb.x+pb.w<visL||pb.x>visR) continue;
      p.draw(ctx);
    }
    for(const wp of this.weaponPickups){
      if(wp.x<visL||wp.x>visR) continue;
      wp.draw(ctx);
    }
    // Bots visibles
    for(const b of this.bots){
      if(b.x<visL||b.x>visR) continue;
      b.draw(ctx);
    }
    for(const c of this.companions) c.draw(ctx);
    if(this.chicks) for(const c of this.chicks) c.draw(ctx);
    this.player.draw(ctx);
    // Arma con apuntado hacia el ratón
    if(this.player.weapon){
      const w=this.player.weapon.type;
      const mx=this.mouse.x+camX, my=this.mouse.y;
      const px=this.player.x+16, py=this.player.y+22;
      let dx=mx-px, dy=my-py, d=Math.hypot(dx,dy)||1;
      const ang=Math.atan2(dy,dx);
      ctx.save();
      ctx.translate(px,py);
      ctx.rotate(ang);
      ctx.fillStyle=w.color;
      ctx.fillRect(6,-2,14*w.size,4*w.size);
      ctx.fillStyle="#222";
      ctx.fillRect(6+12*w.size,-1,w.barrelL*0.5,2);
      ctx.restore();
    }
    for(const b of this.bullets) b.draw(ctx);
    // Dibujar la zona (gas tipo Fortnite)
    this._drawZone(ctx,camX);
    this.camera.reset(ctx);
    this.drawBRHUD(ctx);
    this._drawMinimap(ctx);
    this._drawCrosshair(ctx);
  }

  _drawZone(ctx,camX){
    const z=this.zone;
    // 1) Overlay morado/rojo en TODO lo que está fuera de la zona
    ctx.save();
    const gasCol = this.zoneClosing?"rgba(220,40,180,0.32)":"rgba(180,40,220,0.2)";
    ctx.fillStyle=gasCol;
    // Usamos fillRule evenodd dibujando mundo + hueco zona
    ctx.beginPath();
    ctx.rect(camX-200,-200,CW+400,CH+400);
    ctx.rect(z.cx-z.halfW, z.cy-z.halfH, z.halfW*2, z.halfH*2);
    ctx.fill("evenodd");
    // Patrón de franjas animadas fuera
    ctx.globalAlpha=0.15;
    ctx.strokeStyle="#FF40CC";ctx.lineWidth=2;
    const off=(this.timer%20);
    for(let i=-CH;i<CH*2;i+=16){
      ctx.beginPath();
      ctx.moveTo(camX-100,i+off);
      ctx.lineTo(camX+CW+100,i+off-200);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    // 2) Frontera pulsante de la próxima zona (azul) mientras cierra
    if(this.zoneClosing){
      ctx.strokeStyle="#40D0FF";
      ctx.lineWidth=3;
      ctx.setLineDash([10,6]);
      ctx.strokeRect(z.nextCx-z.nextHalfW,z.nextCy-z.nextHalfH,z.nextHalfW*2,z.nextHalfH*2);
      ctx.setLineDash([]);
    }
    // 3) Frontera actual
    ctx.strokeStyle=this.zoneClosing?"#FF4080":"#A040FF";
    ctx.lineWidth=3;
    ctx.strokeRect(z.cx-z.halfW,z.cy-z.halfH,z.halfW*2,z.halfH*2);
    ctx.restore();
  }

  _drawMinimap(ctx){
    const w=180, h=46, x=CW-w-8, y=CH-h-8;
    ctx.save();
    ctx.fillStyle="rgba(0,0,0,0.6)";
    drawRR(ctx,x,y,w,h,6);ctx.fill();
    ctx.strokeStyle="#445566";ctx.lineWidth=1;
    drawRR(ctx,x,y,w,h,6);ctx.stroke();
    const sx=w/WORLD_W, sy=h/CH;
    // Zona
    const z=this.zone;
    ctx.fillStyle="rgba(160,60,220,0.25)";
    ctx.fillRect(x+(z.cx-z.halfW)*sx, y+(z.cy-z.halfH)*sy, z.halfW*2*sx, z.halfH*2*sy);
    ctx.strokeStyle="#B050FF";ctx.lineWidth=1;
    ctx.strokeRect(x+(z.cx-z.halfW)*sx, y+(z.cy-z.halfH)*sy, z.halfW*2*sx, z.halfH*2*sy);
    if(this.zoneClosing){
      ctx.strokeStyle="#40D0FF";ctx.setLineDash([3,2]);
      ctx.strokeRect(x+(z.nextCx-z.nextHalfW)*sx, y+(z.nextCy-z.nextHalfH)*sy, z.nextHalfW*2*sx, z.nextHalfH*2*sy);
      ctx.setLineDash([]);
    }
    // Bots (puntos rojos)
    ctx.fillStyle="#FF4040";
    for(const b of this.bots){
      if(!b.alive) continue;
      ctx.fillRect(x+b.x*sx-1, y+b.y*sy-1, 2, 2);
    }
    // Jugador (verde)
    ctx.fillStyle="#40FF80";
    ctx.fillRect(x+this.player.x*sx-2, y+this.player.y*sy-2, 4, 4);
    ctx.restore();
  }

  _drawCrosshair(ctx){
    const x=this.mouse.x, y=this.mouse.y;
    ctx.save();
    ctx.strokeStyle="#FF4040";ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(x-8,y);ctx.lineTo(x-3,y);
    ctx.moveTo(x+3,y);ctx.lineTo(x+8,y);
    ctx.moveTo(x,y-8);ctx.lineTo(x,y-3);
    ctx.moveTo(x,y+3);ctx.lineTo(x,y+8);
    ctx.stroke();
    ctx.fillStyle="#FF4040";
    ctx.fillRect(x-0.5,y-0.5,1,1);
    ctx.restore();
  }

  drawBRHUD(ctx){
    const p=this.player;
    ctx.fillStyle="rgba(0,0,0,0.55)";
    drawRR(ctx,8,8,210,42,6);ctx.fill();
    drawRR(ctx,CW/2-100,8,200,42,6);ctx.fill();
    drawRR(ctx,CW-200,8,192,52,6);ctx.fill();
    // Corazones
    ctx.font="18px serif";
    for(let i=0;i<4;i++){
      const v=p.health-i;
      const ch = v>=1?"❤️":(v>=0.5?"💔":"🖤");
      ctx.fillText(ch,14+i*28,36);
    }
    // Vivos / Kills / Zona centro
    const alive = 1 + (this.bots?this.bots.filter(b=>b.alive).length:0);
    ctx.fillStyle="#FFD700";ctx.font="bold 13px monospace";ctx.textAlign="center";
    ctx.shadowBlur=4;ctx.shadowColor="#000";
    ctx.fillText(`🦉 VIVOS: ${alive}/101  ·  💀 ${this.brKills||0}`,CW/2,26);
    ctx.fillStyle = (this.zonePhase||0) >= 3 ? "#FF4060" : "#A070FF";
    const zs = this.zoneTimer!=null ? Math.max(0,Math.floor(this.zoneTimer/60)) : 0;
    ctx.fillText(`☣ ZONA ${(this.zonePhase||0)+1}  ·  ${this.zoneClosing?"CERRANDO":zs+"s"}`,CW/2,44);
    ctx.shadowBlur=0;
    // Arma a la derecha
    ctx.textAlign="left";
    if(p.weapon){
      const w=p.weapon;
      ctx.fillStyle="#FFE070";ctx.font="bold 13px monospace";
      ctx.fillText(w.type.name, CW-190, 26);
      // Barra de munición
      const frac=w.ammo/w.type.ammo;
      ctx.fillStyle="#333";ctx.fillRect(CW-190,34,170,10);
      ctx.fillStyle=frac>0.3?"#50C060":"#C04040";
      ctx.fillRect(CW-190,34,170*frac,10);
      ctx.fillStyle="#FFF";ctx.font="bold 10px monospace";
      ctx.fillText(`${w.ammo} / ${w.type.ammo}`,CW-185,52);
    } else {
      ctx.fillStyle="#888";ctx.font="bold 13px monospace";
      ctx.fillText("SIN ARMA · recoge pickups",CW-194,26);
      ctx.font="10px monospace";ctx.fillStyle="#666";
      ctx.fillText("Click izq / F para disparar",CW-194,44);
    }
    // Badge BETA
    ctx.save();
    ctx.fillStyle="#FFB020";
    ctx.fillRect(8,54,60,16);
    ctx.fillStyle="#201500";
    ctx.font="bold 10px monospace";ctx.textAlign="center";
    ctx.fillText("BETA",38,66);
    ctx.restore();
    ctx.textAlign="left";
  }

  drawSky(ctx,camX){
    const bm=currentBiome;
    const g=ctx.createLinearGradient(0,0,0,CH);
    g.addColorStop(0,bm.skyA);g.addColorStop(0.5,bm.skyB);g.addColorStop(1,bm.skyC);
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
    // Estrellas
    ctx.save();ctx.translate(-camX*0.15,0);
    for(const s of this.stars){ctx.globalAlpha=s.alpha;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x%(WORLD_W*0.15+800),s.y,s.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;ctx.restore();
    // Luna / Sol según bioma
    ctx.save();ctx.translate(-camX*0.05,0);
    if(bm.deco==="desert"){ctx.fillStyle="#FFF060";ctx.beginPath();ctx.arc(680,55,30,0,Math.PI*2);ctx.fill();ctx.fillStyle="#FFEE40";ctx.beginPath();ctx.arc(680,55,22,0,Math.PI*2);ctx.fill();}
    else if(bm.deco==="volcanic"){ctx.fillStyle="#FF6600";ctx.globalAlpha=0.7;ctx.beginPath();ctx.arc(680,70,35,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    else{ctx.fillStyle="#F5E8A0";ctx.beginPath();ctx.arc(680,60,28,0,Math.PI*2);ctx.fill();ctx.fillStyle="#E8D880";ctx.beginPath();ctx.arc(692,54,24,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    // Colinas
    ctx.save();ctx.translate(-camX*0.25,0);
    ctx.fillStyle=bm.hill;ctx.beginPath();ctx.moveTo(-50,CH);
    for(let x=-50;x<WORLD_W*0.3;x+=60)ctx.quadraticCurveTo(x+30,280+Math.sin(x*0.02)*40,x+60,CH-80);
    ctx.lineTo(WORLD_W*0.3+100,CH);ctx.fill();ctx.restore();
    // Partículas animadas del bioma (en viewport, no world)
    this.drawBiomeFx(ctx);
  }

  drawPlaying(ctx){
    const camX=this.camera.x;
    this.drawSky(ctx,camX);
    this.camera.apply(ctx);
    for(const p of this.platforms)p.draw(ctx);
    this.drawGoalPost(ctx);
    this.pizza.draw(ctx);
    if(this.secretBlock)this.secretBlock.draw(ctx);
    for(const e of this.enemies)e.draw(ctx);
    for(const c of this.companions)c.draw(ctx);
    if(this.chicks) for(const c of this.chicks) c.draw(ctx);
    this.player.draw(ctx);
    // Efectos de ataque enemigo se dibujan encima del jugador
    for(const e of this.enemies){ if(e.atk) e.drawAttackFx(ctx); }
    this.camera.reset(ctx);
    this.drawHUD(ctx);
  }

  drawGoalPost(ctx){
    ctx.fillStyle="#C8A020";ctx.fillRect(5060,140,10,82);ctx.fillRect(5020,136,90,10);
    ctx.fillStyle="#FF4444";ctx.fillRect(5022,146,86,28);
    ctx.fillStyle="#FFF";ctx.font="bold 11px monospace";ctx.textAlign="center";ctx.fillText("META!",5067,165);
  }

  drawHUD(ctx){
    const p=this.player;
    // Fondo HUD superior
    ctx.fillStyle="rgba(0,0,0,0.5)";
    drawRR(ctx,8,8,196,42,6);ctx.fill();
    drawRR(ctx,CW/2-90,8,180,42,6);ctx.fill();
    drawRR(ctx,CW-178,8,170,42,6);ctx.fill();

    // 4 Corazones con soporte de medio corazón
    ctx.font="18px serif";
    for(let i=0;i<4;i++){
      const v=p.health-i;
      const ch = v>=1?"❤️":(v>=0.5?"💔":"🖤");
      ctx.fillText(ch,14+i*28,36);
    }

    // Timer
    ctx.fillStyle="#FFD700";ctx.font="bold 14px monospace";ctx.textAlign="center";
    ctx.shadowBlur=4;ctx.shadowColor="#000";
    ctx.fillText(`⏱ ${Math.floor(this.timer/60)}s`,CW/2,28);ctx.shadowBlur=0;

    // Bioma
    ctx.fillStyle="#CCDDFF";ctx.font="9px monospace";
    ctx.fillText(currentBiome.name,CW/2,42);

    // Score
    ctx.fillStyle="#FFD700";ctx.font="bold 14px monospace";ctx.textAlign="right";
    ctx.shadowBlur=4;ctx.shadowColor="#000";
    ctx.fillText(`★ ${p.score}`,CW-14,26);ctx.shadowBlur=0;
    const compCount=this.companions.filter(c=>c.active).length;
    ctx.fillStyle=compCount>0?"#88FFAA":"#7799AA";ctx.font="10px monospace";
    ctx.fillText(compCount>0?`🦉 ×${compCount} aliadas`:p.species.name,CW-14,40);

    // === HABILIDAD GARRAS ===
    const cdPct=p.clawCooldown/CLAW_CD;
    const ready=p.clawCooldown===0&&!p.clawActive;
    // Caja de habilidad
    const bx=8,by=58;
    ctx.fillStyle="rgba(0,0,0,0.6)";drawRR(ctx,bx,by,62,44,6);ctx.fill();
    // Ícono
    ctx.font="22px serif";ctx.textAlign="center";
    ctx.globalAlpha=ready?1.0:0.45;
    ctx.fillText("🦅",bx+18,by+26);
    ctx.globalAlpha=1;
    // Texto
    ctx.fillStyle=ready?"#FFD700":"#888";ctx.font="bold 9px monospace";ctx.textAlign="center";
    ctx.fillText("GARRAS",bx+31,by+38);
    ctx.fillStyle="#AAA";ctx.font="8px monospace";
    ctx.fillText("Z / E",bx+31,by+48);
    // Barra de recarga
    if(!ready&&!p.clawActive){
      ctx.fillStyle="rgba(255,255,255,0.15)";drawRR(ctx,bx+1,by+42,60,4,2);ctx.fill();
      ctx.fillStyle="#4488FF";drawRR(ctx,bx+1,by+42,60*(1-cdPct),4,2);ctx.fill();
    } else if(ready){
      ctx.fillStyle="#44FF88";drawRR(ctx,bx+1,by+42,60,4,2);ctx.fill();
    } else if(p.clawActive){
      // Pulso durante ataque
      ctx.fillStyle="#FFE040";ctx.globalAlpha=0.8+Math.sin(p.clawFrame*0.4)*0.2;
      drawRR(ctx,bx,by,62,44,6);ctx.stroke();ctx.globalAlpha=1;
    }

    // Indicador bloque secreto
    if(this.secretBlock&&!this.secretBlock.collected){
      if(Math.floor(this.timer/20)%2===0){
        ctx.fillStyle="rgba(0,0,0,0.5)";drawRR(ctx,CW/2-120,CH-28,240,22,5);ctx.fill();
        ctx.fillStyle="#FFD700";ctx.font="bold 12px monospace";ctx.textAlign="center";
        ctx.fillText("⭐ ¡HAY UN BLOQUE SECRETO! ⭐",CW/2,CH-13);
      }
    } else {
      const bW=130,bX=CW/2-bW/2,bY=CH-20;
      const prog=this.blockTimer/BLOCK_INT;
      ctx.fillStyle="rgba(0,0,0,0.4)";drawRR(ctx,bX,bY,bW,8,3);ctx.fill();
      ctx.fillStyle=prog>0.8?"#FFD700":"#4466AA";drawRR(ctx,bX,bY,bW*prog,8,3);ctx.fill();
      ctx.fillStyle="#AAA";ctx.font="8px monospace";ctx.textAlign="center";
      ctx.fillText("? próx. bloque",CW/2,bY-3);
    }
    if(this.blockFlash>0){ctx.save();ctx.globalAlpha=(this.blockFlash/80)*0.25;ctx.fillStyle="#FFD700";ctx.fillRect(0,0,CW,CH);ctx.restore();}
    ctx.textAlign="left";
  }

  drawMenu(ctx){
    const g=ctx.createLinearGradient(0,0,0,CH);
    g.addColorStop(0,"#0D0D2B");g.addColorStop(1,"#1A2A4A");
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
    for(const s of this.stars){ctx.globalAlpha=s.alpha;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x%CW,s.y,s.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    ctx.fillStyle="#F5E8A0";ctx.beginPath();ctx.arc(680,70,35,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#E8D880";ctx.beginPath();ctx.arc(695,62,30,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.font="bold 58px monospace";ctx.textAlign="center";ctx.shadowBlur=24;ctx.shadowColor="#B3001B";ctx.fillStyle="#E8E8E8";ctx.fillText("OWLBLOOD",CW/2,100);ctx.shadowBlur=0;ctx.font="20px monospace";ctx.fillStyle="#FF4040";ctx.fillText("¡La Pizza Sangrienta!",CW/2,135);ctx.restore();
    const sp=OWL_SPECIES[this.menuOwlIndex];
    drawOwl(ctx,CW/2,245,true,sp,this.menuOwlTimer*2);
    ctx.font="bold 15px monospace";ctx.textAlign="center";ctx.fillStyle="#AADDFF";ctx.shadowBlur=6;ctx.shadowColor="#002244";ctx.fillText(sp.name,CW/2,298);ctx.fillStyle="#7799AA";ctx.font="11px monospace";ctx.fillText(`(${sp.nameEn}) ${this.menuOwlIndex+1}/${OWL_SPECIES.length}`,CW/2,316);ctx.shadowBlur=0;
    // --- Selector de modo ---
    const opts=[
      {label:"CAMPAÑA",      sub:"La Pizza Sangrienta"},
      {label:"BATTLE ROYALE", sub:"BETA · con armas", beta:true},
    ];
    const boxY=340, boxH=38;
    for(let i=0;i<opts.length;i++){
      const selected=this.menuOption===i;
      const y=boxY+i*46;
      ctx.save();
      if(selected){
        ctx.shadowBlur=16;ctx.shadowColor="#FF2030";
        ctx.fillStyle="rgba(120,0,10,0.55)";
      } else {
        ctx.fillStyle="rgba(0,0,0,0.4)";
      }
      drawRR(ctx,CW/2-170,y,340,boxH,8);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle=selected?"#FF4050":"#334455";ctx.lineWidth=selected?2:1;
      drawRR(ctx,CW/2-170,y,340,boxH,8);ctx.stroke();
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.font="bold 17px monospace";
      ctx.fillStyle=selected?"#FFF":"#BBCCDD";
      ctx.fillText(opts[i].label,CW/2-30,y+boxH/2);
      ctx.font="10px monospace";
      ctx.fillStyle=selected?"#FFB0B0":"#778899";
      ctx.fillText(opts[i].sub,CW/2+100,y+boxH/2);
      // Indicador ▶
      if(selected&&Math.floor(this.menuBlink/20)%2===0){
        ctx.fillStyle="#FF3040";ctx.font="bold 18px monospace";
        ctx.fillText("▶",CW/2-150,y+boxH/2);
      }
      // Badge BETA
      if(opts[i].beta){
        ctx.save();
        ctx.fillStyle="#FFB020";
        ctx.font="bold 9px monospace";
        ctx.fillRect(CW/2+130,y+4,36,12);
        ctx.fillStyle="#201500";
        ctx.fillText("BETA",CW/2+148,y+10);
        ctx.restore();
      }
      ctx.restore();
      ctx.textBaseline="alphabetic";
    }
    ctx.textAlign="center";
    ctx.font="10px monospace";ctx.fillStyle="#99AABB";
    ctx.fillText("↑/↓ cambiar · ENTER seleccionar",CW/2,boxY+110);
    drawPizza(ctx,90,385,0.6,this.menuBlink);drawPizza(ctx,CW-90,385,0.6,this.menuBlink+20);
    ctx.textAlign="left";
  }

  drawWin(ctx){
    const g=ctx.createLinearGradient(0,0,0,CH);g.addColorStop(0,"#0A2A0A");g.addColorStop(1,"#1A4A1A");
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
    for(const p of this.winParticles){ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}
    ctx.save();ctx.font="bold 38px monospace";ctx.textAlign="center";ctx.shadowBlur=20;ctx.shadowColor="#FFD700";ctx.fillStyle="#FFD700";ctx.fillText("¡CONSEGUISTE LA PIZZA!",CW/2,90);ctx.shadowBlur=0;ctx.restore();
    drawPizza(ctx,CW/2,CH/2-20,2.4,this.timer);
    const active=this.companions.filter(c=>c.active);
    for(let i=0;i<Math.min(active.length,4);i++) drawOwl(ctx,80+i*160,CH-85,i%2===0,active[i].species,this.timer*2+i*25);
    drawOwl(ctx,CW/2-110,CH-85,true,this.player.species,this.timer*2);
    drawOwl(ctx,CW/2+110,CH-85,false,this.player.species,this.timer*2+15);
    const secs=Math.floor(this.timer/60);
    const tBonus=Math.max(0,300-secs)*10,hBonus=this.player.health*200,cBonus=active.length*150,total=this.player.score+tBonus+hBonus+cBonus;
    ctx.font="bold 13px monospace";ctx.textAlign="center";ctx.fillStyle="#FFF";
    ctx.fillText(`⏱ +${tBonus}  ❤️ +${hBonus}  🦉 +${cBonus}`,CW/2,CH-110);
    ctx.fillStyle="#FFD700";ctx.font="bold 19px monospace";ctx.fillText(`★ PUNTUACIÓN FINAL: ${total} ★`,CW/2,CH-90);
    if(Math.floor(this.timer/40)%2===0){ctx.font="13px monospace";ctx.fillStyle="#AAFFAA";ctx.fillText("Presiona R para jugar de nuevo",CW/2,CH-14);}
    ctx.textAlign="left";
  }

  drawGameOver(ctx){
    const dt=this.deathTimer||0;
    const g=ctx.createLinearGradient(0,0,0,CH);g.addColorStop(0,"#2A0000");g.addColorStop(1,"#0A0000");
    ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
    // Flash inicial rojo
    if(dt<20){ctx.fillStyle=`rgba(200,0,0,${(20-dt)/20*0.6})`;ctx.fillRect(0,0,CW,CH);}
    // Título
    ctx.save();ctx.font="bold 58px monospace";ctx.textAlign="center";
    ctx.shadowBlur=25;ctx.shadowColor="#FF0000";ctx.fillStyle="#FF4444";
    const shake=dt<30?(Math.random()-0.5)*6:0;
    ctx.fillText("GAME OVER",CW/2+shake,130);ctx.shadowBlur=0;ctx.restore();

    // Escena de muerte única por especie
    const cx=CW/2,cy=CH/2-10;
    drawOwlDeath(ctx,cx,cy,this.player.species,dt);

    // Charco/gotas de sangre animadas
    ctx.save();ctx.translate(cx,cy+50);
    // charco creciendo
    const puddleSize=Math.min(60,dt*0.8);
    if(puddleSize>0){
      const pg=ctx.createRadialGradient(0,0,2,0,0,puddleSize);
      pg.addColorStop(0,"#8A0000");pg.addColorStop(0.7,"#5A0000");pg.addColorStop(1,"rgba(30,0,0,0)");
      ctx.fillStyle=pg;
      ctx.beginPath();ctx.ellipse(0,0,puddleSize,puddleSize*0.35,0,0,Math.PI*2);ctx.fill();
      // brillo
      ctx.fillStyle="rgba(220,40,40,0.5)";
      ctx.beginPath();ctx.ellipse(-puddleSize*0.3,-puddleSize*0.1,puddleSize*0.3,puddleSize*0.08,0,0,Math.PI*2);ctx.fill();
    }
    // gotas cayendo
    for(const d of (this.deathBloodDrops||[])){
      ctx.globalAlpha=Math.min(1,d.life/30);
      ctx.fillStyle="#B00000";
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      // estela
      ctx.fillStyle="rgba(160,0,0,0.4)";
      ctx.beginPath();ctx.ellipse(d.x,d.y-d.vy*2,d.r*0.7,d.r*1.5,0,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    ctx.restore();

    // Texto
    ctx.font="18px monospace";ctx.textAlign="center";ctx.fillStyle="#CCAAAA";
    ctx.fillText(`Tu ${this.player.species.name} cayó...`,CW/2,CH/2+120);
    ctx.font="13px monospace";ctx.fillStyle="#AA8888";
    ctx.fillText(`Score: ${this.player.score}  |  Aliadas invocadas: ${this.companions.length}`,CW/2,CH/2+144);
    if(dt>60 && Math.floor(Date.now()/600)%2===0){
      ctx.font="bold 16px monospace";ctx.fillStyle="#FF8888";
      ctx.fillText("Presiona R para intentarlo de nuevo",CW/2,CH-30);
    }
    ctx.textAlign="left";
  }
}
