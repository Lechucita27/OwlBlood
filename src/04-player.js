// Chick, CompanionOwl, Player

// ============================================================
//  CRIAS (3 hijos que siguen a la lechuza — 30% probabilidad)
// ============================================================
class Chick{
  // Las crías duran TODA la partida. Atacan autónomamente; 2 golpes matan.
  // A veces se alejan de la lechuza; si están muy lejos y un enemigo las
  // pilla, se las come (chick.alive=false). Solo vuelven cuando te acercas.
  constructor(species,idx){
    this.species=species;this.idx=idx;
    this.x=0;this.y=0;
    this.animFrame=rnd(0,60);
    // Estados: "follow" | "stray" | "attack" | "eat"
    this.mode="follow";
    this.target=null;        // enemigo objetivo
    this.cooldown=rnd(40,90);
    this.eatTarget=null;     // {x,y}
    this.eatTimer=0;
    this.hitFlash=0;
    this.alive=true;
    // Vagabundeo
    this.strayTimer=rnd(360,900); // frames antes de alejarse
    this.strayDx=0;this.strayDy=0;
    this.strayDuration=0;
    this.deathTimer=0; // para fx al morir
    // Daño que cada cría acumula al enemigo (necesita 2 para matar)
    // Se guarda en el propio enemigo como e._chickHits
    this.sp={...species, scale:species.scale*0.46};
  }
  follow(px,py,facing){
    const offX = (facing?-1:1) * (28 + this.idx*16);
    const offY = 14 + Math.sin(this.animFrame*0.12+this.idx)*2;
    const tx = px+offX, ty = py+offY;
    this.x += (tx-this.x)*0.12;
    this.y += (ty-this.y)*0.12;
  }
  tryAttack(enemies){
    if(this.cooldown>0){this.cooldown--;return;}
    let best=null,bd=999;
    for(const e of enemies){
      if(!e.alive||e.immuneToClaw)continue;
      const d=dist(this.x,this.y,e.x+e.w/2,e.y+e.h/2);
      if(d<160&&d<bd){bd=d;best=e;}
    }
    if(best){this.mode="attack";this.target=best;this.cooldown=0;}
  }
  updateAttack(enemies){
    if(!this.target||!this.target.alive){this.mode="follow";this.target=null;this.cooldown=rnd(40,90);return;}
    const tx=this.target.x+this.target.w/2, ty=this.target.y+this.target.h/2;
    const dx=tx-this.x, dy=ty-this.y, d=Math.hypot(dx,dy);
    if(d<14){
      // Golpe
      if(this.target._chickHits===undefined) this.target._chickHits=0;
      this.target._chickHits++;
      this.hitFlash=10;
      SFX.tone(1100,0.06,"square",0.08,{layers:2,detune:20,rev:0.2});
      SFX.noise(0.04,0.06,1800,{type:"highpass"});
      if(this.target._chickHits>=2){
        // Muere: producir blood y limpiar
        for(let i=0;i<8;i++){/* mini splats ya los dibuja el juego vía spawnKill */}
        const t=this.target;
        // Spawn de kill tipo "garras" en el enemigo
        if(window._gameRef && window._gameRef.player){
          window._gameRef.player.spawnKillFor(t,"garras");
        }
        t.alive=false;
        if(window._gameRef) window._gameRef.player.score+=120;
        SFX.playClawKill();
      }
      this.mode="follow";this.target=null;this.cooldown=rnd(50,110);
    } else {
      this.x += (dx/d)*3.2;
      this.y += (dy/d)*3.2;
    }
  }
  startEating(kx,ky){
    this.mode="eat";
    this.eatTarget={x:kx,y:ky};
    this.eatTimer=0;
    this.x = kx + (this.idx-1)*20;
    this.y = ky - 50 - this.idx*4;
  }
  updateEating(){
    this.eatTimer++;
    const tx=this.eatTarget.x+(this.idx-1)*14, ty=this.eatTarget.y-4;
    this.x += (tx-this.x)*0.18;
    this.y += (ty-this.y)*0.18;
    if(this.eatTimer>75) this.mode="follow";
  }
  updateStray(px,py,enemies){
    // Deriva hacia strayDx/dy; oscilación suave
    this.strayDuration--;
    const wob = Math.sin(this.animFrame*0.08)*0.4;
    this.x += this.strayDx + wob;
    this.y += this.strayDy + Math.cos(this.animFrame*0.09)*0.3;
    // Si el jugador se acerca (<140px), vuelve al follow
    const dP = dist(this.x,this.y,px,py);
    if(dP<140 || this.strayDuration<=0){
      this.mode="follow"; this.cooldown=rnd(60,120);
      this.strayTimer = rnd(480,1200);
      return;
    }
    // Si hay un enemigo muy cerca (<36px) y el jugador lejos (>240px)
    // el enemigo se la come.
    if(dP>240){
      for(const e of enemies){
        if(!e.alive) continue;
        const d=dist(this.x,this.y,e.x+e.w/2,e.y+e.h/2);
        if(d<36){
          this._getEaten(e);
          return;
        }
      }
    }
  }
  _getEaten(enemy){
    this.alive=false;
    this.deathTimer=1;
    SFX.noise(0.25,0.35,800,{type:"lowpass"});
    SFX.tone(220,0.25,"sawtooth",0.25,{layers:2,detune:50,rev:0.35});
    if(window._gameRef){
      // Splat de sangre visual en el juego (si existe sistema de partículas)
      const g=window._gameRef;
      if(g.bloodParticles){
        for(let i=0;i<18;i++){
          const a=Math.random()*Math.PI*2, s=1+Math.random()*4;
          g.bloodParticles.push({x:this.x,y:this.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:40,r:2+Math.random()*3});
        }
      }
    }
  }
  update(enemies,px,py,facing){
    if(!this.alive) return;
    this.animFrame++;
    if(this.hitFlash>0) this.hitFlash--;
    if(this.mode==="follow"){
      this.follow(px,py,facing);
      this.tryAttack(enemies);
      // Decidir si deriva
      this.strayTimer--;
      if(this.strayTimer<=0 && Math.random()<0.6){
        this.mode="stray";
        const a=Math.random()*Math.PI*2;
        const sp=0.6+Math.random()*0.9;
        this.strayDx=Math.cos(a)*sp;
        this.strayDy=Math.sin(a)*sp*0.5 - 0.1;
        this.strayDuration=rnd(180,360);
      } else if(this.strayTimer<=0){
        this.strayTimer=rnd(240,600);
      }
    }
    else if(this.mode==="stray"){ this.updateStray(px,py,enemies); }
    else if(this.mode==="attack") this.updateAttack(enemies);
    else if(this.mode==="eat") this.updateEating();
  }
  draw(ctx){
    if(!this.alive) return;
    ctx.save();
    let peckDip=0;
    if(this.mode==="eat"){
      const pt=(this.eatTimer%12)/12;
      peckDip=Math.sin(pt*Math.PI)*4;
    } else if(this.mode==="attack"){
      peckDip=Math.sin(this.animFrame*0.4)*2;
    }
    if(this.hitFlash>0) ctx.globalAlpha=0.75;
    drawOwl(ctx,this.x,this.y+peckDip,true,this.sp,this.animFrame,1);
    ctx.restore();
  }
}

// ============================================================
//  LECHUZA ALIADA (combatiente 60s)
// ============================================================
class CompanionOwl{
  constructor(species,index){
    this.species=species;this.index=index;
    this.x=0;this.y=0;this.vx=0;this.vy=0;
    this.animFrame=rnd(0,100);this.alpha=0;this.active=false;
    this.battleTimer=1200; // 20 segundos
    this.targetEnemy=null;this.particles=[];
    this.facingRight=true;
    this.attackCooldown=0;
  }
  spawn(px,py){
    this.x=px;this.y=py-40;this.active=true;this.alpha=0;
    for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2,s=1.5+Math.random()*2;this.particles.push({x:this.x,y:this.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color:pick(["#FFD700","#AADDFF","#FFF","#88FFAA"]),life:40,maxLife:40,alpha:1,r:2+Math.random()*3});}
  }
  update(enemies,playerX,playerY){
    if(!this.active)return;
    this.animFrame++;
    if(this.alpha<1)this.alpha=Math.min(1,this.alpha+0.05);
    this.battleTimer--;
    if(this.battleTimer<=0){this.alpha=Math.max(0,this.alpha-0.03);if(this.alpha<=0)this.active=false;return;}
    if(this.attackCooldown>0)this.attackCooldown--;

    // Buscar enemigo más cercano vivo
    let nearest=null,minD=300;
    for(const e of enemies){
      if(!e.alive||e.immuneToClaw)continue;
      const d=dist(this.x,this.y,e.x+e.w/2,e.y+e.h/2);
      if(d<minD){minD=d;nearest=e;}
    }
    this.targetEnemy=nearest;

    if(nearest){
      // Volar hacia el enemigo
      const ex=nearest.x+nearest.w/2,ey=nearest.y+nearest.h/2;
      const dx=ex-this.x,dy=ey-this.y,d=Math.hypot(dx,dy)||1;
      const spd=3.5;
      this.x+=dx/d*spd;this.y+=dy/d*spd;
      this.facingRight=dx>0;
      // Matar al contacto
      if(d<28&&this.attackCooldown===0){nearest.alive=false;this.attackCooldown=40;SFX.playClawKill();}
    } else {
      // Flotar alrededor del jugador
      const offsetX=-35-this.index*32;
      const targetX=playerX+offsetX;
      const targetY=playerY-40+Math.sin(this.animFrame*0.07+this.index)*10;
      this.x=lerp(this.x,targetX,0.06);
      this.y=lerp(this.y,targetY,0.06);
      this.facingRight=true;
    }

    for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;p.life--;p.alpha=p.life/p.maxLife;}
    this.particles=this.particles.filter(p=>p.life>0);
  }
  draw(ctx){
    if(!this.active)return;
    for(const p of this.particles){ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}

    // Halo de combate
    if(this.targetEnemy){
      ctx.save();ctx.globalAlpha=this.alpha*0.25;
      const g=ctx.createRadialGradient(this.x,this.y,2,this.x,this.y,24);
      g.addColorStop(0,"#FF8820");g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x,this.y,24,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }

    // Dibujar al tamaño del jugador (escala completa de la especie)
    drawOwl(ctx,this.x,this.y,this.facingRight,this.species,this.animFrame,this.alpha*0.92);

    // Barra de vida (tiempo restante)
    const barW=28,barH=4;
    const bx=this.x-barW/2,by=this.y+20;
    const frac=this.battleTimer/1200;
    ctx.save();ctx.globalAlpha=this.alpha*0.8;
    ctx.fillStyle="rgba(0,0,0,0.5)";ctx.fillRect(bx,by,barW,barH);
    ctx.fillStyle=frac>0.4?"#44FF44":"#FF8800";ctx.fillRect(bx,by,barW*frac,barH);
    ctx.restore();
  }
}

// ============================================================
//  JUGADOR
// ============================================================
class Player{
  constructor(species){
    this.x=60;this.y=300;this.w=32;this.h=40;
    this.vx=0;this.vy=0;this.onGround=false;this.facingRight=true;
    this.health=4; // ← 4 corazones
    this.score=0;this.invincible=0;this.animFrame=0;
    this.species=species;this.standingPlatform=null;this.dead=false;
    // Habilidad garras
    this.clawCooldown=0;
    this.clawActive=false;
    this.clawFrame=0;
    this.clawTargetX=0;this.clawTargetY=0;
    this.clawStartX=0;this.clawStartY=0;
    this.clawEffects=[]; // {x,y,angle,timer,maxTimer,style,c1,c2}
    this.savedVx=0;this.savedVy=0;
    this.trail=[];         // motion trail durante el dash
    this.windupParticles=[];
    this.screenShake=0;
    this.killFx=[]; // animaciones de muerte de enemigos
    this.weapon=null; // {type, ammo}
    this.fireCooldown=0;
  }
  equipWeapon(type){
    this.weapon={type, ammo:type.ammo};
  }
  fireWeapon(game){
    if(!this.weapon||this.fireCooldown>0||this.weapon.ammo<=0) return;
    const t=this.weapon.type;
    this.fireCooldown=t.fireRate;
    this.weapon.ammo--;
    // Dirección hacia el ratón (world-space)
    const cam=game.camera;
    const targetWX = game.mouse.x + cam.x;
    const targetWY = game.mouse.y;
    const px=this.x+16, py=this.y+22;
    let dx=targetWX-px, dy=targetWY-py;
    let d=Math.hypot(dx,dy);
    if(d<1){dx=this.facingRight?1:-1;dy=0;d=1;}
    const dirx=dx/d, diry=dy/d;
    // Facing según ratón
    this.facingRight = dirx>=0;
    const ox=px + dirx*18;
    const oy=py + diry*8;
    for(let i=0;i<t.pellets;i++){
      const ang=(Math.random()-0.5)*t.spread*2;
      const cs=Math.cos(ang), sn=Math.sin(ang);
      const vx=(dirx*cs - diry*sn)*t.spd;
      const vy=(dirx*sn + diry*cs)*t.spd;
      game.bullets.push(new Bullet(ox,oy,vx,vy,t.dmg,true,this));
    }
    playWeaponSound(t.sound);
    // Retroceso
    this.vx-=dirx*0.8;
    this.screenShake=Math.max(this.screenShake,4);
    if(this.weapon.ammo<=0){
      setTimeout(()=>{this.weapon=null;},80);
      SFX.tone(200,0.15,"sawtooth",0.08);
    }
  }

  // Selecciona 1 de 2-3 tipos de asesinato. Si hay crías activas, añade "alimentar".
  spawnKill(enemy){
    const options=["comer","garras"];
    const hasChicks = window._gameRef && window._gameRef.chicks && window._gameRef.chicks.some(c=>c.alive);
    if(hasChicks) options.push("alimentar");
    const type = pick(options);
    this.spawnKillFor(enemy,type);
  }
  spawnKillFor(enemy,type){
    const maxFrames = type==="comer" ? 135 : (type==="alimentar" ? 110 : 55);
    this.killFx.push({
      x:enemy.x+enemy.w/2, y:enemy.y+enemy.h/2,
      ex:enemy.x, ey:enemy.y, ew:enemy.w, eh:enemy.h,
      frame:0, max:maxFrames, type, sp:this.species,
      facingRight:this.facingRight,
      splats:[],
    });
    // Si es alimentar, lanzar a las crías a comer
    if(type==="alimentar" && window._gameRef && window._gameRef.chicks){
      for(const c of window._gameRef.chicks){ if(c.alive) c.startEating(enemy.x+enemy.w/2, enemy.y+enemy.h/2); }
    }
  }

  activateClaw(enemies){
    if(this.clawCooldown>0||this.clawActive)return;
    // Buscar enemigo más cercano
    let best=null,bestD=999;
    for(const e of enemies){
      if(!e.alive||e.immuneToClaw)continue;
      const d=dist(this.x+16,this.y+20,e.x+e.w/2,e.y+e.h/2);
      if(d<bestD){bestD=d;best=e;}
    }
    const range=240;
    if(best&&bestD<range){
      this.clawActive=true;this.clawFrame=0;
      this.clawStartX=this.x+16;this.clawStartY=this.y+20;
      this.clawTargetX=best.x+best.w/2;this.clawTargetY=best.y+best.h/2;
      this.savedVx=this.vx;this.savedVy=this.vy;
      this._clawTarget=best;
      SFX.playSpecies(this.species.attackStyle);
    } else {
      // Sin enemigo: lunada hacia adelante
      this.clawActive=true;this.clawFrame=0;
      const lx=this.facingRight?this.x+80:this.x-80;
      this.clawTargetX=lx;this.clawTargetY=this.y-20;
      this.clawStartX=this.x+16;this.clawStartY=this.y+20;
      this._clawTarget=null;
      SFX.playSpecies(this.species.attackStyle);
    }
  }

  handleInput(input,enemies){
    if(this.dead||this.clawActive)return;
    if(input.left){this.vx=-SPD;this.facingRight=false;}
    else if(input.right){this.vx=SPD;this.facingRight=true;}
    else{this.vx*=0.75;if(Math.abs(this.vx)<0.1)this.vx=0;}
    if(input.jumpPressed&&this.onGround){this.vy=JUMP_FORCE;this.onGround=false;SFX.playJump();}
    if(input.clawPressed){this.activateClaw(enemies);input.clawPressed=false;}
    input.jumpPressed=false;
  }

  updateClaw(enemies){
    // Actualizar partículas de windup siempre (aunque no estemos atacando, para que se desvanezcan)
    for(const p of this.windupParticles){p.life--;p.a=(p.ox-this.x)*0.08;p.b=(p.oy-this.y)*0.08;
      p.ox-=p.a;p.oy-=p.b;}
    this.windupParticles=this.windupParticles.filter(p=>p.life>0);
    // Actualizar efectos de impacto
    for(const e of this.clawEffects) e.timer++;
    this.clawEffects=this.clawEffects.filter(e=>e.timer<e.maxTimer);
    // Actualizar animaciones de kill y disparar sonidos/blood splats
    for(const k of this.killFx){
      k.frame++;
      if(k.type==="comer"){
        // Inicializar gibs/chunks y puddle la primera vez
        if(k.frame===1){
          k.gibs=[];
          k.puddle=[]; // charcos que crecen
          k.drips=[]; // gotas que caen del pico
          k.chunks=[]; // pedazos arrancados
        }
        // Cada ciclo de pico (cada 18 frames) dispara un mordisco
        const bitePhases=[10,28,46,64,82,100];
        if(bitePhases.includes(k.frame)){
          const idx=bitePhases.indexOf(k.frame);
          // Splats alrededor de la presa
          for(let i=0;i<4;i++){
            k.splats.push({x:k.x+rnd(-18,18),y:k.y+rnd(-6,12),r:rnd(2.5,5),a:1});
          }
          // Charco que crece bajo la presa
          k.puddle.push({x:k.x+rnd(-20,20),y:k.y+k.eh*0.35+rnd(-2,4),r:rnd(6,12),a:0.85});
          // Gibs voladores
          const gibCount=idx<3?3:2;
          for(let i=0;i<gibCount;i++){
            const ang=rnd(-Math.PI*0.8,-Math.PI*0.2);
            k.gibs.push({
              x:k.x, y:k.y,
              vx:Math.cos(ang)*rnd(1.5,4),
              vy:Math.sin(ang)*rnd(2.5,5),
              r:rnd(1.5,3.5), life:40,
              col:pick(["#6A0000","#8A0000","#AA0000","#5A0008"])
            });
          }
          // Chunk grande que la lechuza arranca
          if(idx<4){
            k.chunks.push({
              x:k.x+rnd(-4,4), y:k.y-8,
              vx:(k.facingRight?1:-1)*rnd(1,2.5), vy:-rnd(3,5),
              r:rnd(3,5), life:45, rot:0, vr:rnd(-0.3,0.3)
            });
          }
          // Sonidos: pico clack + sangre húmeda + tirón
          SFX.tone(900+idx*40,0.06,"square",0.09,{layers:2,detune:25,rev:0.25});
          SFX.noise(0.08,0.08,800,{type:"lowpass",q:1.5,rev:0.3});
          SFX.tone(180,0.1,"sawtooth",0.07,{layers:1});
          if(idx%2===0) SFX.tone(420,0.12,"triangle",0.06,{layers:2,detune:15,rev:0.35});
        }
        // Drips constantes del pico mientras come
        if(k.frame>=10 && k.frame<110 && k.frame%4===0){
          k.drips.push({x:k.x+(k.facingRight?8:-8)+rnd(-2,2),y:k.y-4,vy:0.5,life:30});
        }
        // Actualizar gibs
        if(k.gibs){
          for(const g of k.gibs){g.x+=g.vx;g.y+=g.vy;g.vy+=0.25;g.life--;
            // Al aterrizar dejar splat
            if(g.life===1){k.splats.push({x:g.x,y:g.y,r:g.r*0.9,a:0.9});}
          }
          k.gibs=k.gibs.filter(g=>g.life>0);
        }
        if(k.chunks){
          for(const c of k.chunks){c.x+=c.vx;c.y+=c.vy;c.vy+=0.25;c.rot+=c.vr;c.life--;
            if(c.life===1){k.splats.push({x:c.x,y:c.y,r:c.r*1.2,a:0.95});}
          }
          k.chunks=k.chunks.filter(c=>c.life>0);
        }
        if(k.drips){
          for(const d of k.drips){d.y+=d.vy;d.vy+=0.35;d.life--;
            if(d.life===1){k.puddle.push({x:d.x,y:d.y,r:rnd(2,4),a:0.8});}
          }
          k.drips=k.drips.filter(d=>d.life>0);
        }
      } else if(k.type==="garras"){
        if(k.frame===6||k.frame===16||k.frame===26){
          k.splats.push({x:k.x+rnd(-14,14),y:k.y+rnd(-8,10),r:rnd(2,4.5),a:1});
          SFX.noise(0.08,0.1,2200,{type:"highpass",rev:0.25});
          SFX.tone(520+k.frame*8,0.08,"sawtooth",0.09,{layers:2,detune:18});
        }
      } else if(k.type==="alimentar"){
        // 3 crías comiendo — pecks intermitentes
        if(k.frame>25 && k.frame%10===0 && k.frame<100){
          k.splats.push({x:k.x+rnd(-18,18),y:k.y+rnd(-6,10),r:rnd(1.5,3.5),a:1});
          SFX.tone(1200+Math.random()*400,0.05,"square",0.07,{layers:2,detune:25});
          SFX.noise(0.04,0.05,2400,{type:"bandpass",q:3});
        }
      }
    }
    this.killFx=this.killFx.filter(k=>k.frame<k.max);
    // Actualizar trail fade
    for(const t of this.trail) t.life--;
    this.trail=this.trail.filter(t=>t.life>0);
    if(this.screenShake>0) this.screenShake--;

    if(!this.clawActive)return;
    this.clawFrame++;
    const f=this.clawFrame;
    const sp=this.species;

    // -- Fase 1: WINDUP (0..18) — carga con partículas convergiendo
    if(f<=CLAW_WINDUP){
      const t=f/CLAW_WINDUP;
      // Pequeño retroceso sutil
      const back=this.facingRight?-4:4;
      this.x=lerp(this.clawStartX,this.clawStartX+back,t)-16;
      this.y=this.clawStartY-20-Math.sin(t*Math.PI)*3;
      // Generar partículas de windup (convergen hacia la lechuza)
      if(f%2===0){
        for(let i=0;i<2;i++){
          const a=Math.random()*Math.PI*2,r=28+Math.random()*12;
          this.windupParticles.push({
            ox:this.clawStartX+Math.cos(a)*r,
            oy:this.clawStartY+Math.sin(a)*r,
            color: i===0?sp.atkColor:sp.atkColor2,
            life:10+Math.floor(Math.random()*6),
            r:1.8+Math.random()*1.8
          });
        }
      }
    }
    // -- Fase 2: DASH (18..42) — embestida con motion trail
    else if(f<=CLAW_DASH){
      const t=(f-CLAW_WINDUP)/(CLAW_DASH-CLAW_WINDUP);
      // easeInOutQuart para sensación "snappy"
      const ease=t<0.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2;
      this.x=lerp(this.clawStartX,this.clawTargetX,ease)-16;
      this.y=lerp(this.clawStartY,this.clawTargetY,ease)-20;
      // Trail (cada 2 frames)
      if(f%2===0){
        this.trail.push({x:this.x+16,y:this.y+20,facing:this.facingRight,life:10,maxLife:10});
      }
    }
    // -- Fase 3: IMPACT (42..52) — daño + efectos únicos
    else if(f<=CLAW_IMPACT){
      if(f===CLAW_DASH+1){
        // Aplicar daño en el primer frame de impacto
        const angle=Math.atan2(this.clawTargetY-this.clawStartY,this.clawTargetX-this.clawStartX);
        const ex=this.clawTargetX,ey=this.clawTargetY;
        if(this._clawTarget&&this._clawTarget.alive){
          this.spawnKill(this._clawTarget);
          this._clawTarget.alive=false;this.score+=150;SFX.playClawKill();
        }
        // Efecto principal
        this.clawEffects.push({x:ex,y:ey,angle,timer:0,maxTimer:32,
          style:sp.attackStyle,c1:sp.atkColor,c2:sp.atkColor2});
        // Secundario pequeño para impacto
        this.clawEffects.push({x:ex+rnd(-6,6),y:ey+rnd(-6,6),angle:angle+0.6,timer:0,maxTimer:18,
          style:sp.attackStyle,c1:sp.atkColor2,c2:sp.atkColor});
        this.screenShake=10;
      }
      // Pequeño rebote
      const t=(f-CLAW_DASH)/(CLAW_IMPACT-CLAW_DASH);
      const push=this.facingRight?-3:3;
      this.x=this.clawTargetX-16+push*Math.sin(t*Math.PI);
      this.y=this.clawTargetY-20-Math.sin(t*Math.PI)*2;
    }
    // -- Fase 4: RECOVERY (52..60)
    else {
      // Se queda en sitio; nada que hacer
    }

    if(this.clawFrame>=CLAW_FRAMES){
      this.clawActive=false;
      this.clawCooldown=CLAW_CD;
      this.vx=this.savedVx*0.3;this.vy=this.savedVy*0.3;
    }
  }

  resolveCollisions(platforms){
    if(this.clawActive)return; // no resolver colisiones durante el ataque
    this.standingPlatform=null;
    this.x+=this.vx;this.x=clamp(this.x,0,WORLD_W-this.w);
    for(const p of platforms){
      const pb=p.getBounds();
      if(aabb(this,pb)){if(this.vx>0){this.x=pb.x-this.w;this.vx=0;}else if(this.vx<0){this.x=pb.x+pb.w;this.vx=0;}}
    }
    this.vy+=GRAVITY;if(this.vy>15)this.vy=15;
    this.onGround=false;this.y+=this.vy;
    for(const p of platforms){
      const pb=p.getBounds();
      if(aabb(this,pb)){
        if(this.vy>0){this.y=pb.y-this.h;this.vy=0;this.onGround=true;this.standingPlatform=p;}
        else if(this.vy<0){this.y=pb.y+pb.h;this.vy=0;}
      }
    }
    if(this.standingPlatform instanceof MovingPlatform)this.x+=this.standingPlatform.dx;
  }

  checkEnemyCollisions(enemies){
    if(this.invincible>0||this.clawActive)return;
    for(const e of enemies){
      if(!e.alive)continue;
      if(aabb(this,e.getBounds())){
        if(!e.immuneToStomp&&this.vy>0&&this.y+this.h<e.y+e.h*0.55){
          this.spawnKill(e);
          e.alive=false;this.vy=-8;this.score+=100;SFX.playStomp();
        } else {
          // Lanzar animación de ataque del enemigo sobre el jugador
          if(typeof e.startAttack==="function") e.startAttack(this.x+16,this.y+18);
          this.takeDamage(e.damage!==undefined?e.damage:1);
        }
        break;
      }
    }
  }

  takeDamage(amount=1){this.health-=amount;this.invincible=90;if(this.health<=0){this.health=0;this.dead=true;}SFX.playHurt();}

  update(input,platforms,enemies,pizza){
    if(this.dead){this.vy+=GRAVITY;this.y+=this.vy;return;}
    this.animFrame++;if(this.invincible>0)this.invincible--;
    if(this.clawCooldown>0)this.clawCooldown--;
    if(this.fireCooldown>0) this.fireCooldown--;
    // Disparo (solo si tiene arma)
    if(input.fire && this.weapon && window._gameRef){
      this.fireWeapon(window._gameRef);
    }
    this.handleInput(input,enemies);
    this.updateClaw(enemies);
    this.resolveCollisions(platforms);
    this.checkEnemyCollisions(enemies);
    if(this.y>CH+100){this.dead=true;this.health=0;}
    if(!pizza.collected&&aabb(this,pizza.getBounds())){pizza.collect();SFX.playPizza();}
  }

  draw(ctx){
    const sp=this.species;
    // Motion trail (detrás del jugador)
    for(const t of this.trail){
      const a=(t.life/t.maxLife)*0.45;
      drawOwl(ctx,t.x,t.y+4,t.facing,sp,this.animFrame,a);
    }
    // Partículas de windup convergentes
    for(const p of this.windupParticles){
      ctx.save();ctx.globalAlpha=Math.min(1,p.life/10);
      ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.ox,p.oy,p.r,0,Math.PI*2);ctx.fill();
      // estela
      ctx.globalAlpha*=0.4;ctx.fillStyle=p.color;
      ctx.beginPath();ctx.arc(p.ox+p.a*3,p.oy+p.b*3,p.r*0.6,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // Aura durante windup (pulsante con colores de la especie)
    if(this.clawActive&&this.clawFrame<=CLAW_WINDUP){
      const t=this.clawFrame/CLAW_WINDUP;
      ctx.save();ctx.globalAlpha=0.55*t;
      const g=ctx.createRadialGradient(this.x+16,this.y+20,2,this.x+16,this.y+20,30);
      g.addColorStop(0,sp.atkColor);g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x+16,this.y+20,30,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // Streak radial durante dash
    if(this.clawActive&&this.clawFrame>CLAW_WINDUP&&this.clawFrame<=CLAW_DASH){
      const ang=Math.atan2(this.clawTargetY-this.clawStartY,this.clawTargetX-this.clawStartX);
      ctx.save();ctx.translate(this.x+16,this.y+20);ctx.rotate(ang);
      ctx.globalAlpha=0.5;
      const grd=ctx.createLinearGradient(-40,0,10,0);
      grd.addColorStop(0,"transparent");grd.addColorStop(1,sp.atkColor);
      ctx.fillStyle=grd;
      ctx.beginPath();ctx.moveTo(-40,-6);ctx.lineTo(10,0);ctx.lineTo(-40,6);ctx.closePath();ctx.fill();
      ctx.restore();
    }
    const alpha=(this.invincible>0&&Math.floor(this.invincible/6)%2===0)?0.35:1.0;
    // Leve shake durante dash
    let ox=0,oy=0;
    if(this.screenShake>0){ox=(Math.random()-0.5)*this.screenShake*0.4;oy=(Math.random()-0.5)*this.screenShake*0.4;}
    drawOwl(ctx,this.x+16+ox,this.y+20+4+oy,this.facingRight,sp,this.animFrame,alpha);
    // Efectos de impacto (se dibujan por encima)
    for(const e of this.clawEffects){
      drawSpeciesAttack(ctx,e.x,e.y,e.angle,e.style,e.timer/e.maxTimer,e.c1,e.c2);
    }
    // Animaciones de kill
    for(const k of this.killFx) this._drawKillFx(ctx,k);
  }

  _drawKillFx(ctx,k){
    const t=k.frame/k.max;
    const sp=k.sp;
    ctx.save();
    // Blood splats acumulados (siempre visibles)
    for(const s of k.splats){
      ctx.fillStyle="#6A0000"; ctx.globalAlpha=s.a;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#AA0000";
      ctx.beginPath(); ctx.arc(s.x-0.5,s.y-0.5,s.r*0.55,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    if(k.type==="comer"){
      const fade=Math.max(0,1-Math.max(0,t-0.85)/0.15);
      // --- 1) Charco de sangre creciendo bajo la presa (capa más baja) ---
      if(k.puddle){
        for(const p of k.puddle){
          ctx.save();
          ctx.globalAlpha=p.a;
          // Sombra del charco
          const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*1.6);
          grd.addColorStop(0,"#8A0000");
          grd.addColorStop(0.6,"#5A0008");
          grd.addColorStop(1,"rgba(60,0,0,0)");
          ctx.fillStyle=grd;
          ctx.beginPath();
          ctx.ellipse(p.x,p.y,p.r*1.6,p.r*0.7,0,0,Math.PI*2);
          ctx.fill();
          // Centro más oscuro
          ctx.fillStyle="#4A0004";
          ctx.beginPath();
          ctx.ellipse(p.x,p.y,p.r*0.9,p.r*0.4,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }
      // --- 2) Silueta del cadáver rasgado (con vísceras expuestas) ---
      ctx.save();
      const shrink=Math.max(0.15,1-t*0.95);
      ctx.globalAlpha=Math.max(0.25,1-t)*0.9;
      // Cuerpo base
      ctx.fillStyle="#1C0F08";
      ctx.beginPath();
      ctx.ellipse(k.x,k.y+k.eh*0.28,(k.ew*0.58)*shrink,(k.eh*0.32)*shrink,0,0,Math.PI*2);
      ctx.fill();
      // Vísceras expuestas (rojo interior visible conforme progresa)
      if(k.frame>15){
        ctx.fillStyle="#7A0008";
        const vt=Math.min(1,(k.frame-15)/40);
        ctx.beginPath();
        ctx.ellipse(k.x+(k.facingRight?-3:3),k.y+k.eh*0.22,
          (k.ew*0.32)*shrink*vt,(k.eh*0.2)*shrink*vt,0,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle="#B00010";
        ctx.beginPath();
        ctx.ellipse(k.x+(k.facingRight?-3:3),k.y+k.eh*0.22,
          (k.ew*0.18)*shrink*vt,(k.eh*0.12)*shrink*vt,0,0,Math.PI*2);
        ctx.fill();
      }
      // Heridas abiertas (rasgaduras irregulares)
      if(k.frame>20){
        ctx.strokeStyle="#3A0004";
        ctx.lineWidth=1.5;
        for(let i=0;i<3;i++){
          const a=(i/3)*Math.PI*2+k.frame*0.02;
          const r1=(k.ew*0.2)*shrink, r2=(k.ew*0.42)*shrink;
          ctx.beginPath();
          ctx.moveTo(k.x+Math.cos(a)*r1, k.y+k.eh*0.28+Math.sin(a)*r1*0.5);
          ctx.lineTo(k.x+Math.cos(a)*r2, k.y+k.eh*0.28+Math.sin(a)*r2*0.5);
          ctx.stroke();
        }
      }
      ctx.restore();
      // --- 3) Chunks voladores (pedazos de carne) ---
      if(k.chunks){
        for(const c of k.chunks){
          ctx.save();
          ctx.translate(c.x,c.y);
          ctx.rotate(c.rot);
          ctx.globalAlpha=Math.min(1,c.life/30);
          // Pedazo principal (carne)
          ctx.fillStyle="#8A0010";
          ctx.beginPath();
          ctx.ellipse(0,0,c.r,c.r*0.65,0,0,Math.PI*2);
          ctx.fill();
          // Borde oscuro
          ctx.strokeStyle="#3A0004";ctx.lineWidth=0.8;
          ctx.stroke();
          // Highlight
          ctx.fillStyle="#C80020";
          ctx.beginPath();
          ctx.ellipse(-c.r*0.3,-c.r*0.3,c.r*0.35,c.r*0.2,0,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
          // Estela de gotas
          ctx.save();
          ctx.globalAlpha=0.4;
          ctx.fillStyle="#6A0000";
          ctx.beginPath();
          ctx.arc(c.x-c.vx*2,c.y-c.vy*2,c.r*0.4,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }
      // --- 4) Gibs pequeños (salpicaduras voladoras) ---
      if(k.gibs){
        for(const g of k.gibs){
          ctx.save();
          ctx.globalAlpha=Math.min(1,g.life/30);
          ctx.fillStyle=g.col;
          ctx.beginPath();
          ctx.arc(g.x,g.y,g.r,0,Math.PI*2);
          ctx.fill();
          // Highlight
          ctx.fillStyle="#D00020";
          ctx.beginPath();
          ctx.arc(g.x-0.6,g.y-0.6,g.r*0.4,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }
      // --- 5) Gotas cayendo del pico ---
      if(k.drips){
        for(const d of k.drips){
          ctx.save();
          ctx.globalAlpha=Math.min(1,d.life/20);
          ctx.fillStyle="#8A0000";
          ctx.beginPath();
          ctx.ellipse(d.x,d.y,1.2,2.4,0,0,Math.PI*2);
          ctx.fill();
          ctx.fillStyle="#C00010";
          ctx.beginPath();
          ctx.arc(d.x-0.3,d.y-0.5,0.8,0,Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      }
      // --- 6) Lechuza comiendo con pico ensangrentado ---
      const peckT=(k.frame%18)/18;
      const peckDip=Math.sin(peckT*Math.PI)*12;
      const tug=Math.sin(peckT*Math.PI*2)*(k.facingRight?4:-4);
      ctx.save();
      ctx.globalAlpha=fade;
      const ox=k.x+tug, oy=k.y-16+peckDip;
      drawOwl(ctx,ox,oy,k.facingRight,sp,k.frame*2,fade);
      // Pico ensangrentado: mancha roja sobre el pico
      ctx.save();
      ctx.translate(ox+(k.facingRight?4:-4), oy+8);
      ctx.fillStyle="#8A0000";
      ctx.beginPath();
      ctx.ellipse(0,0,5,3,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle="#C00010";
      ctx.beginPath();
      ctx.arc(-1,-0.5,1.5,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
      // Gota colgando del pico mientras tira
      if(peckT>0.3 && peckT<0.7){
        ctx.save();
        ctx.fillStyle="#8A0000";
        ctx.translate(ox+(k.facingRight?8:-8), oy+10);
        ctx.beginPath();
        ctx.ellipse(0,peckT*6,1.4,3,0,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
      // Hebra de carne tirada entre pico y cuerpo (durante el "tug")
      if(peckT>0.35 && peckT<0.65){
        ctx.save();
        ctx.strokeStyle="#9A0010";
        ctx.lineWidth=1.8;
        ctx.lineCap="round";
        ctx.beginPath();
        const bx=ox+(k.facingRight?6:-6), by=oy+9;
        const ex=k.x, ey=k.y+2;
        const mx=(bx+ex)/2+Math.sin(peckT*Math.PI)*3;
        const my=(by+ey)/2+4;
        ctx.moveTo(bx,by);
        ctx.quadraticCurveTo(mx,my,ex,ey);
        ctx.stroke();
        ctx.strokeStyle="#C80020";
        ctx.lineWidth=0.8;
        ctx.stroke();
        ctx.restore();
      }
      // Spray adicional cuando arranca pedazo
      if(peckT<0.15){
        ctx.translate(ox+(k.facingRight?6:-6),oy+10);
        ctx.rotate(k.facingRight?0.3:Math.PI-0.3);
        bloodSpray(ctx,0,0,0,14+peckT*24,6);
      }
      ctx.restore();
      // --- 7) Al final: pequeños huesos expuestos ---
      if(t>0.75){
        const boneFade=Math.min(1,(t-0.75)/0.2);
        ctx.save();
        ctx.globalAlpha=boneFade*fade;
        ctx.fillStyle="#E8DDC0";
        // Costillas estilizadas
        for(let i=-1;i<=1;i++){
          ctx.beginPath();
          ctx.ellipse(k.x+i*4,k.y+k.eh*0.2,1,3,0,0,Math.PI*2);
          ctx.fill();
        }
        // Cráneo pequeño
        ctx.beginPath();
        ctx.arc(k.x+(k.facingRight?-8:8),k.y+k.eh*0.28,3,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    } else if(k.type==="garras"){
      // Garras: 3 zarpazos diagonales cruzados + chorros de sangre
      const slashes=[
        {start:0,  end:18, ang:-0.6},
        {start:10, end:28, ang: 0.6},
        {start:20, end:38, ang:-0.3},
      ];
      // Cadáver desgarrado que se desvanece
      const shrink=Math.max(0,1-t);
      ctx.save();
      ctx.globalAlpha=Math.max(0.2,1-t)*0.85;
      ctx.fillStyle="#2A1A10";
      ctx.beginPath();
      ctx.ellipse(k.x,k.y+k.eh*0.25,(k.ew*0.5)*shrink,(k.eh*0.3)*shrink,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
      for(const s of slashes){
        if(k.frame<s.start||k.frame>s.end+10) continue;
        const local=(k.frame-s.start)/(s.end-s.start);
        const prog=Math.min(1,local);
        const alpha=Math.max(0,1-(local-1));
        ctx.save();
        ctx.translate(k.x,k.y);
        ctx.rotate(s.ang);
        ctx.globalAlpha=alpha;
        // 3 líneas de garra (rojas/blancas)
        for(let i=-1;i<=1;i++){
          const off=i*6;
          ctx.strokeStyle=i===0?"#FFFFFF":sp.atkColor;
          ctx.lineWidth=i===0?3:2;
          ctx.lineCap="round";
          ctx.beginPath();
          ctx.moveTo(-22,off);
          ctx.lineTo(-22+44*prog,off);
          ctx.stroke();
          // Reflejo rojo sangre
          ctx.strokeStyle="#C00010";
          ctx.lineWidth=1.2;
          ctx.beginPath();
          ctx.moveTo(-22,off+1);
          ctx.lineTo(-22+44*prog,off+1);
          ctx.stroke();
        }
        // Chorro de sangre al final del slash
        if(local>=0.5&&local<=1){
          bloodSpray(ctx,-22+44*prog,0,0,14,5);
          bloodSpray(ctx,-22+44*prog,0,Math.PI,12,4);
        }
        ctx.restore();
      }
      // Splat final grande
      if(k.frame>38){
        const fa=Math.max(0,1-(k.frame-38)/15);
        ctx.globalAlpha=fa;
        bloodSplat(ctx,k.x,k.y,10,22,2.5);
        ctx.globalAlpha=1;
      }
    } else if(k.type==="alimentar"){
      // Cadáver encogiéndose mientras las crías lo devoran
      const shrink=Math.max(0.1, 1-t*0.95);
      ctx.save();
      ctx.globalAlpha=Math.max(0.15,1-t)*0.85;
      ctx.fillStyle="#2A1A10";
      ctx.beginPath();
      ctx.ellipse(k.x,k.y+k.eh*0.3,(k.ew*0.55)*shrink,(k.eh*0.3)*shrink,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
      // Pequeños chorros de sangre al ritmo de los pecks
      if(k.frame>25 && k.frame<100 && k.frame%10<2){
        for(let i=0;i<3;i++){
          const ang=(i-1)*0.6;
          bloodSpray(ctx,k.x+(i-1)*10,k.y,ang,10,3);
        }
      }
      // Texto ambiente
      if(k.frame<50){
        ctx.save();
        ctx.globalAlpha=Math.max(0,1-k.frame/50)*0.7;
        ctx.fillStyle="#FFB040";
        ctx.font="bold 11px monospace";
        ctx.textAlign="center";
        ctx.fillText("¡A COMER!",k.x,k.y-30);
        ctx.restore();
      }
    }
    ctx.restore();
  }
}

