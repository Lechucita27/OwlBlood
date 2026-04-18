// Camera, rarezas, armas, Bullet, BotOwl, Platform(es), Enemies, SpikeTrap, Pizza, SecretBlock

// ============================================================
//  CAMERA
// ============================================================
class Camera{
  constructor(){this.x=0;}
  update(tx){this.x=lerp(this.x,tx-CW/2,0.1);this.x=clamp(this.x,0,WORLD_W-CW);}
  apply(ctx){ctx.save();ctx.translate(-this.x,0);}
  reset(ctx){ctx.restore();}
}

// ============================================================
//  PLATFORM  (bioma-aware)
// ============================================================
// ============================================================
//  ARMAS (Battle Royale)
// ============================================================
// ==== RAREZAS ====
const RARITIES = {
  comun : {name:"Común",  color:"#B8B8B8", glow:"#888888", weight:50},
  raro  : {name:"Raro",   color:"#3DA5FF", glow:"#2060C0", weight:30},
  epico : {name:"Épico",  color:"#C050FF", glow:"#7010B0", weight:15},
  mitico: {name:"Mítico", color:"#FFD700", glow:"#FF6000", weight:5},
};

const WEAPON_TYPES=[
  // --- COMÚN ---
  {id:"pistola",      rarity:"comun",  name:"Pistola",        ammo:18, dmg:1,   fireRate:10, spd:11, spread:0.04, pellets:1, color:"#BBB",   barrelL:14, size:0.9, sound:"pistol"},
  {id:"revolver",     rarity:"comun",  name:"Revólver",       ammo:6,  dmg:2,   fireRate:24, spd:12, spread:0.02, pellets:1, color:"#884028",barrelL:12, size:1.0, sound:"pistol"},
  {id:"shotgunBas",   rarity:"comun",  name:"Escopeta",       ammo:8,  dmg:1,   fireRate:30, spd:10, spread:0.22, pellets:5, color:"#7A5030",barrelL:16, size:1.1, sound:"shotgun"},
  {id:"smg",          rarity:"comun",  name:"SMG",            ammo:40, dmg:1,   fireRate:5,  spd:12, spread:0.1,  pellets:1, color:"#555",   barrelL:12, size:0.8, sound:"smg"},
  {id:"rifleBas",     rarity:"comun",  name:"Rifle Básico",   ammo:24, dmg:1,   fireRate:14, spd:13, spread:0.03, pellets:1, color:"#403020",barrelL:18, size:1.1, sound:"rifle"},
  {id:"picoLigero",   rarity:"comun",  name:"Pico Ligero",    ammo:99, dmg:1,   fireRate:16, spd:9,  spread:0,    pellets:1, color:"#E8D5A0",barrelL:8,  size:0.7, sound:"pistol", melee:true},

  // --- RARO ---
  {id:"dualPistol",   rarity:"raro",   name:"Pistolas Gemelas",ammo:30, dmg:1,  fireRate:6,  spd:12, spread:0.08, pellets:1, color:"#DDD",   barrelL:14, size:0.9, sound:"pistol"},
  {id:"shotgunPump",  rarity:"raro",   name:"Escopeta Pump",  ammo:10, dmg:2,   fireRate:32, spd:11, spread:0.18, pellets:6, color:"#3A2A1A",barrelL:18, size:1.2, sound:"shotgun"},
  {id:"uzi",          rarity:"raro",   name:"Uzi Sangre",     ammo:60, dmg:1,   fireRate:3,  spd:13, spread:0.14, pellets:1, color:"#AA0020",barrelL:10, size:0.8, sound:"smg"},
  {id:"rifleBurst",   rarity:"raro",   name:"Rifle Ráfaga",   ammo:30, dmg:1,   fireRate:18, spd:14, spread:0.04, pellets:3, color:"#2A3A2A",barrelL:18, size:1.1, sound:"rifle", burst:true},
  {id:"ballesta",     rarity:"raro",   name:"Ballesta",       ammo:10, dmg:3,   fireRate:28, spd:16, spread:0.005,pellets:1, color:"#5A3A20",barrelL:22, size:1.2, sound:"rifle"},

  // --- ÉPICO ---
  {id:"sniper",       rarity:"epico",  name:"Francotirador",  ammo:5,  dmg:5,   fireRate:40, spd:22, spread:0,    pellets:1, color:"#1A1A1A",barrelL:28, size:1.4, sound:"rifle"},
  {id:"minigun",      rarity:"epico",  name:"Minigun",        ammo:120,dmg:1,   fireRate:2,  spd:13, spread:0.14, pellets:1, color:"#222",   barrelL:18, size:1.4, sound:"smg"},
  {id:"lanzagranadas",rarity:"epico",  name:"Lanzagranadas",  ammo:5,  dmg:4,   fireRate:36, spd:10, spread:0.02, pellets:1, color:"#3A5A2A",barrelL:16, size:1.2, sound:"shotgun", explode:40},
  {id:"plasmaRifle",  rarity:"epico",  name:"Rifle Plasma",   ammo:18, dmg:3,   fireRate:10, spd:15, spread:0,    pellets:1, color:"#00AACC",barrelL:20, size:1.2, sound:"rifle", plasma:true},
  {id:"recortadaX2",  rarity:"epico",  name:"Recortada Doble",ammo:4,  dmg:2,   fireRate:36, spd:11, spread:0.32, pellets:12,color:"#2A1A10",barrelL:12, size:1.0, sound:"shotgun"},

  // --- MÍTICO ---
  {id:"railgun",      rarity:"mitico", name:"Railgun",        ammo:3,  dmg:8,   fireRate:60, spd:28, spread:0,    pellets:1, color:"#00FFDD",barrelL:30, size:1.6, sound:"rifle", railgun:true},
  {id:"pizzaCannon",  rarity:"mitico", name:"Cañón Pizza",    ammo:6,  dmg:6,   fireRate:40, spd:12, spread:0.03, pellets:1, color:"#F5C842",barrelL:18, size:1.5, sound:"shotgun", pizza:true, explode:55},
  {id:"bloodReaper",  rarity:"mitico", name:"Segador Sangre", ammo:80, dmg:2,   fireRate:4,  spd:15, spread:0.06, pellets:1, color:"#8A0000",barrelL:22, size:1.4, sound:"smg", blood:true},
  {id:"picoDivino",   rarity:"mitico", name:"Pico Divino",    ammo:40, dmg:3,   fireRate:8,  spd:18, spread:0,    pellets:1, color:"#FFF5A0",barrelL:18, size:1.3, sound:"rifle", divine:true},
];

// Selección ponderada por rareza
function pickWeaponByRarity(rarity){
  const pool=WEAPON_TYPES.filter(w=>w.rarity===rarity);
  return pick(pool);
}
function randomWeapon(){
  const total=Object.values(RARITIES).reduce((a,b)=>a+b.weight,0);
  let r=Math.random()*total;
  for(const k of Object.keys(RARITIES)){
    r-=RARITIES[k].weight;
    if(r<=0) return pickWeaponByRarity(k);
  }
  return pickWeaponByRarity("comun");
}

// ==== Set reducido para Battle Royale estilo Dan The Man 2 ====
// 6 armas esenciales: pistola, revólver, escopeta, uzi, rifle, sniper.
const BR_WEAPON_IDS = new Set(["pistola","revolver","shotgunBas","uzi","rifleBas","sniper"]);
function pickBRWeaponByRarity(rarity){
  const pool=WEAPON_TYPES.filter(w=>w.rarity===rarity && BR_WEAPON_IDS.has(w.id));
  return pool.length?pick(pool):null;
}
function randomWeaponBR(){
  // Pesos re-normalizados sobre las rarezas que existen en el set BR
  const rars=["comun","raro","epico"];
  const weights={comun:55, raro:30, epico:15};
  const total=rars.reduce((a,k)=>a+weights[k],0);
  let r=Math.random()*total;
  for(const k of rars){
    r-=weights[k];
    if(r<=0){ const w=pickBRWeaponByRarity(k); if(w) return w; }
  }
  return pickBRWeaponByRarity("comun") || WEAPON_TYPES.find(w=>w.id==="pistola");
}

class WeaponPickup{
  constructor(type,x,y){
    this.type=type;this.x=x;this.y=y;this.w=32;this.h=20;
    this.t=Math.random()*60;this.picked=false;this.vy=0;this.grounded=false;
  }
  update(){
    this.t++;
    if(!this.grounded){
      this.vy+=0.4;this.y+=this.vy;
      if(this.y>=376){this.y=376;this.grounded=true;this.vy=0;}
    }
  }
  getBounds(){return{x:this.x-16,y:this.y-10,w:this.w,h:this.h};}
  draw(ctx){
    const rar=RARITIES[this.type.rarity];
    ctx.save();
    const bob=Math.sin(this.t*0.06)*2;
    ctx.translate(this.x,this.y+bob);
    // Halo pulsante con color de rareza
    const pulse=0.7+Math.sin(this.t*0.08)*0.3;
    const g=ctx.createRadialGradient(0,0,4,0,0,26*pulse);
    g.addColorStop(0,rar.color+"CC");
    g.addColorStop(0.6,rar.glow+"44");
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
    // Arma
    ctx.fillStyle=this.type.color;
    ctx.fillRect(-10,-3,20,6);
    ctx.fillStyle="#333";
    ctx.fillRect(-12,-1,4,8);
    ctx.fillStyle="#1A1A1A";
    ctx.fillRect(6,-1.5,this.type.barrelL*0.45,3);
    // Contorno rareza
    ctx.strokeStyle=rar.color;ctx.lineWidth=1.2;
    ctx.strokeRect(-11,-4,22,8);
    // Etiqueta
    ctx.fillStyle=rar.color;
    ctx.font="bold 9px monospace";
    ctx.textAlign="center";
    ctx.shadowBlur=5;ctx.shadowColor=rar.glow;
    ctx.fillText(this.type.name,0,-12);
    ctx.shadowBlur=0;
    ctx.restore();
  }
}

class Bullet{
  constructor(x,y,vx,vy,dmg,fromPlayer=true,src=null){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.dmg=dmg;
    this.life=80;this.alive=true;this.fromPlayer=fromPlayer;this.src=src;
    this.trail=[];
    // Colores según origen del arma
    this.col=fromPlayer?"#FFFA70":"#FF6060";
    this.col2=fromPlayer?"#FF9020":"#C02020";
  }
  update(enemies,game){
    this.trail.push({x:this.x,y:this.y});
    if(this.trail.length>6) this.trail.shift();
    this.x+=this.vx;this.y+=this.vy;
    this.life--;
    if(this.life<=0||this.x<0||this.x>WORLD_W||this.y<0||this.y>CH){this.alive=false;return;}
    // Plataformas grandes bloquean
    for(const p of game.platforms){
      const pb=p.getBounds();
      if(pb.h>=50 && this.x>pb.x && this.x<pb.x+pb.w && this.y>pb.y && this.y<pb.y+pb.h){
        this.alive=false;return;
      }
    }
    // Colisión con jugador (de bots)
    if(!this.fromPlayer && game.player && !game.player.dead && (game.player.invincible||0)<=0){
      const b={x:game.player.x,y:game.player.y,w:32,h:40};
      if(this.x>b.x&&this.x<b.x+b.w&&this.y>b.y&&this.y<b.y+b.h){
        game.player.takeDamage(this.dmg*0.5);
        this.alive=false;return;
      }
    }
    // Colisión con enemigos clásicos (modo campaña)
    if(this.fromPlayer && enemies){
      for(const e of enemies){
        if(!e.alive) continue;
        if(this.x>e.x&&this.x<e.x+e.w&&this.y>e.y&&this.y<e.y+e.h){
          if(e._hp===undefined) e._hp=e.immuneToStomp?3:2;
          e._hp-=this.dmg;
          SFX.noise(0.04,0.08,1600,{type:"highpass"});
          if(e._hp<=0){
            if(game.player&&game.player.spawnKillFor) game.player.spawnKillFor(e,"garras");
            e.alive=false; if(game.player) game.player.score+=80;
          }
          this.alive=false;return;
        }
      }
    }
    // Colisión con bots
    if(game.bots){
      for(const b of game.bots){
        if(!b.alive||b===this.src) continue;
        if(this.x>b.x&&this.x<b.x+b.w&&this.y>b.y&&this.y<b.y+b.h){
          b.takeHit(this.dmg,game,this.fromPlayer?game.player:this.src);
          SFX.noise(0.03,0.07,2000,{type:"highpass"});
          this.alive=false;return;
        }
      }
    }
  }
  draw(ctx){
    for(let i=0;i<this.trail.length;i++){
      const t=this.trail[i],a=i/this.trail.length;
      ctx.save();ctx.globalAlpha=a*0.55;ctx.fillStyle=this.col;
      ctx.beginPath();ctx.arc(t.x,t.y,1.6,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.save();
    ctx.fillStyle=this.col;
    ctx.beginPath();ctx.arc(this.x,this.y,2.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=this.col2;
    ctx.beginPath();ctx.arc(this.x-this.vx*0.15,this.y-this.vy*0.15,1.2,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

// ============================================================
//  BOT OWL (IA Battle Royale)
// ============================================================
class BotOwl{
  constructor(species,x,y){
    this.species=species;
    this.x=x;this.y=y;this.vx=0;this.vy=0;
    this.w=28;this.h=36;
    this.facingRight=Math.random()<0.5;
    this.onGround=false;
    this.hp=4;
    this.alive=true;
    this.deathTimer=0;
    this.animFrame=rnd(0,60);
    this.weapon={type:randomWeaponBR(),ammo:99}; // munición infinita simplificada
    this.state="wander"; // "wander" | "chase" | "flee"
    this.target=null;
    this.fireCd=rnd(30,90);
    this.wanderDir=(Math.random()<0.5?-1:1);
    this.wanderTimer=rnd(30,120);
    this.jumpCd=rnd(30,120);
    this.hurtFlash=0;
    this.id=Math.floor(Math.random()*100000);
    // Cada bot es de una "especie" aleatoria con escala un poco reducida
    this.sp={...species,scale:species.scale*0.95};
    // IA extra: memoria de posición previa del objetivo (para predicción de liderato)
    this._lastTx=0;this._lastTy=0;this._lastTvx=0;this._lastTvy=0;
    this.strafeDir=(Math.random()<0.5?-1:1);
    this.strafeTimer=rnd(30,90);
    this.dodgeCd=0;
    this.aggro=0.55+Math.random()*0.35; // 0.55..0.9: cuánto persigue vs. huye
    this.skill=0.3+Math.random()*0.65;  // 0.3..0.95: precisión
  }
  getBounds(){return{x:this.x,y:this.y,w:this.w,h:this.h};}
  update(game){
    if(!this.alive){this.deathTimer++;this.vy+=GRAVITY;this.y+=this.vy;return;}
    this.animFrame++;
    if(this.hurtFlash>0)this.hurtFlash--;
    // Gravedad + colisiones simples
    this.vy+=GRAVITY;if(this.vy>15)this.vy=15;
    // Mov X
    this.x+=this.vx;
    this.x=clamp(this.x,10,WORLD_W-this.w-10);
    for(const p of game.platforms){
      const pb=p.getBounds();
      if(aabb(this,pb)){
        if(this.vx>0){this.x=pb.x-this.w;this.vx=0;}
        else if(this.vx<0){this.x=pb.x+pb.w;this.vx=0;}
      }
    }
    // Mov Y
    this.onGround=false;this.y+=this.vy;
    for(const p of game.platforms){
      const pb=p.getBounds();
      if(aabb(this,pb)){
        if(this.vy>0){this.y=pb.y-this.h;this.vy=0;this.onGround=true;}
        else if(this.vy<0){this.y=pb.y+pb.h;this.vy=0;}
      }
    }
    if(this.y>CH+200){this.alive=false;return;}

    // Daño por gas
    if(game.zone && !game.isInsideZone(this.x+this.w/2,this.y+this.h/2)){
      if(game.timer%30===0){this.hp-=0.5;this.hurtFlash=10;if(this.hp<=0)this._die(game,"gas");}
    }

    // Buscar objetivo más cercano (jugador o bot)
    const mx=this.x+this.w/2,my=this.y+this.h/2;
    let best=null,bd=600;
    // jugador
    if(game.player&&!game.player.dead){
      const d=dist(mx,my,game.player.x+16,game.player.y+20);
      if(d<bd){bd=d;best={e:game.player,isPlayer:true};}
    }
    for(const o of game.bots){
      if(o===this||!o.alive) continue;
      const d=dist(mx,my,o.x+o.w/2,o.y+o.h/2);
      if(d<bd){bd=d;best={e:o,isPlayer:false};}
    }
    // Estado
    const hpFrac=this.hp/4;
    if(best && bd<450){
      if(hpFrac<0.35 && bd<220) this.state="flee";
      else this.state="chase";
      this.target=best;
    } else { this.state="wander"; this.target=null; }
    if(this.dodgeCd>0) this.dodgeCd--;
    if(this.strafeTimer>0) this.strafeTimer--; else { this.strafeDir*=-1; this.strafeTimer=rnd(25,70); }

    // --- Recoger arma si hay una mejor muy cerca (upgrade oportunista) ---
    if(game.weaponPickups && this.onGround){
      for(const wp of game.weaponPickups){
        if(wp.picked) continue;
        if(Math.abs(wp.x-mx)<22 && Math.abs(wp.y-my)<30){
          const cur=this.weapon?this.weapon.type:null;
          const upgrade = !cur || (wp.type.dmg*10 + wp.type.pellets*3) > (cur.dmg*10 + cur.pellets*3);
          if(upgrade){ this.weapon={type:wp.type,ammo:99}; wp.picked=true; }
        }
      }
    }

    // --- Esquivar balas hostiles cercanas ---
    if(this.onGround && this.dodgeCd<=0 && game.bullets){
      for(const bu of game.bullets){
        if(bu.src===this) continue;
        // proyectil que avanza hacia el bot
        const dx=(this.x+this.w/2)-bu.x, dy=(this.y+this.h/2)-bu.y;
        const d2=dx*dx+dy*dy;
        if(d2<120*120){
          const vd=dx*bu.vx+dy*bu.vy;
          if(vd<0){ // se acerca
            this.vy=-10.5; this.dodgeCd=40; break;
          }
        }
      }
    }

    // Comportamiento
    if((this.state==="chase"||this.state==="flee") && this.target){
      const te=this.target.e;
      const tx=this.target.isPlayer?te.x+16:te.x+te.w/2;
      const ty=this.target.isPlayer?te.y+20:te.y+te.h/2;
      // velocidad estimada del target (para lead)
      const tvx = tx-this._lastTx, tvy = ty-this._lastTy;
      this._lastTx=tx;this._lastTy=ty;this._lastTvx=tvx;this._lastTvy=tvy;
      this.facingRight = tx>mx;

      if(this.state==="flee"){
        // Alejarse, pero sin dejar de mirar y seguir disparando
        this.vx = this.facingRight?-1.6:1.6;
      } else {
        // Distancia ideal según arma
        const idealClose = 120, idealFar = 260;
        if(bd>idealFar) this.vx = this.facingRight?1.7:-1.7;
        else if(bd<idealClose) this.vx = this.facingRight?-1.1:1.1;
        else {
          // Estamos "en rango": strafe lateral para hacer la AI más lúdica
          this.vx = this.strafeDir*1.2;
        }
      }
      // Salto deliberado: si target está arriba y hay suelo, salta
      if(this.onGround){
        if(ty < my-50 && Math.random()<0.06) this.vy=-11;
        else if(Math.random()<0.006) this.vy=-9;
      }
      // Disparar con predicción (lead aim) + inexactitud según skill
      if(this.fireCd<=0){
        const leadT = Math.min(35, bd/this.weapon.type.spd * 0.9);
        const aimX = tx + tvx*leadT*this.skill;
        const aimY = ty + tvy*leadT*this.skill;
        // Añadir pequeño error según skill (bots tontos disparan más desviado)
        const errAmp = (1-this.skill)*40;
        const aimXE = aimX + (Math.random()-0.5)*errAmp;
        const aimYE = aimY + (Math.random()-0.5)*errAmp;
        this._fire(game,aimXE,aimYE);
        // Cadencia modulada por aggro
        this.fireCd = Math.max(3, Math.round(this.weapon.type.fireRate / this.aggro)) + rnd(0,10);
      } else this.fireCd--;
    } else {
      // Vagar hacia el centro de la zona
      if(this.wanderTimer<=0){
        this.wanderTimer=rnd(60,180);
        if(game.zone){
          const dz=(game.zone.cx-mx);
          if(Math.abs(dz)>game.zone.halfW*0.6) this.wanderDir=Math.sign(dz)||1;
          else this.wanderDir=Math.random()<0.5?-1:1;
        } else {
          this.wanderDir=Math.random()<0.5?-1:1;
        }
      }
      this.wanderTimer--;
      this.vx = this.wanderDir*1.0;
      if(this.onGround && this.jumpCd<=0){this.vy=-9;this.jumpCd=rnd(60,140);}
      this.jumpCd--;
      if(this.fireCd>0) this.fireCd--;
    }
  }
  _fire(game,tx,ty){
    const mx=this.x+this.w/2, my=this.y+this.h/2+2;
    const dx=tx-mx, dy=ty-my, d=Math.hypot(dx,dy)||1;
    const t=this.weapon.type;
    const dirx=dx/d, diry=dy/d;
    for(let i=0;i<t.pellets;i++){
      const sp=(Math.random()-0.5)*t.spread*2;
      const cs=Math.cos(sp), sn=Math.sin(sp);
      const vx=(dirx*cs - diry*sn)*t.spd;
      const vy=(dirx*sn + diry*cs)*t.spd;
      game.bullets.push(new Bullet(mx,my,vx,vy,t.dmg,false,this));
    }
    // Sonido atenuado por distancia al jugador
    const pd=dist(mx,my,game.player.x+16,game.player.y+20);
    if(pd<700){
      const prev=SFX.masterVol;
      if(SFX.master) SFX.master.gain.value=prev*Math.max(0.15,1-pd/700);
      playWeaponSound(t.sound);
      setTimeout(()=>{if(SFX.master) SFX.master.gain.value=prev;},90);
    }
  }
  takeHit(dmg,game,src){
    this.hp-=dmg;
    this.hurtFlash=14;
    if(this.hp<=0) this._die(game,"hit",src);
  }
  _die(game,cause,src){
    if(!this.alive) return;
    this.alive=false;this.deathTimer=0;
    // Splat local
    if(cause!=="gas") SFX.playHurt();
    // Drop del arma
    if(this.weapon && Math.random()<0.7){
      game.weaponPickups.push(new WeaponPickup(this.weapon.type,this.x+this.w/2,this.y));
    }
    game.brKills += (src===game.player)?1:0;
    game.botsDead++;
  }
  draw(ctx){
    if(!this.alive){
      // Caída estilo muñeco
      ctx.save();
      ctx.globalAlpha=Math.max(0,1-this.deathTimer/60);
      ctx.translate(this.x+this.w/2, this.y+this.h/2);
      ctx.rotate(this.deathTimer*0.08);
      drawOwl(ctx,0,0,this.facingRight,this.sp,this.animFrame,1);
      ctx.restore();
      if(this.deathTimer<30) bloodSplat(ctx,this.x+this.w/2,this.y+this.h,6,18,2);
      return;
    }
    ctx.save();
    if(this.hurtFlash>0 && this.hurtFlash%4<2) ctx.globalAlpha=0.55;
    drawOwl(ctx,this.x+this.w/2, this.y+this.h/2+2, this.facingRight, this.sp, this.animFrame, 1);
    // Armita
    const w=this.weapon?.type;
    if(w){
      const dir=this.facingRight?1:-1;
      ctx.save();
      ctx.translate(this.x+this.w/2+dir*8, this.y+this.h/2+6);
      ctx.scale(dir,1);
      ctx.fillStyle=w.color;ctx.fillRect(0,-2,12*w.size,4*w.size);
      ctx.fillStyle="#1A1A1A";ctx.fillRect(10*w.size,-1.5,w.barrelL*0.4,3);
      ctx.restore();
    }
    // HP bar pequeña
    const barW=26, barH=3;
    const bx=this.x+this.w/2-barW/2, by=this.y-6;
    ctx.fillStyle="#000";ctx.fillRect(bx-1,by-1,barW+2,barH+2);
    ctx.fillStyle="#C01020";ctx.fillRect(bx,by,barW*(this.hp/4),barH);
    ctx.restore();
  }
}

// Sonido por tipo de arma
function playWeaponSound(id){
  switch(id){
    case"pistol":
      SFX.tone(620,0.05,"square",0.13,{layers:2,detune:30,rev:0.2});
      SFX.noise(0.05,0.1,3000,{type:"highpass",rev:0.3});
      SFX.tone(200,0.08,"sawtooth",0.1);
      break;
    case"shotgun":
      SFX.noise(0.15,0.22,1200,{q:1.5,rev:0.35});
      SFX.tone(160,0.2,"sawtooth",0.18,{layers:2,detune:12});
      SFX.tone(90,0.3,"sine",0.14);
      break;
    case"rifle":
      SFX.tone(540,0.08,"square",0.18,{layers:3,detune:20,rev:0.3});
      SFX.noise(0.09,0.14,2600,{type:"highpass",rev:0.4});
      SFX.tone(140,0.15,"sawtooth",0.14);
      break;
    case"smg":
      SFX.tone(800,0.03,"square",0.1,{layers:2,detune:30});
      SFX.noise(0.03,0.08,2400,{type:"highpass"});
      break;
  }
}

class Platform{
  constructor(x,y,w,h,override){
    this.x=x;this.y=y;this.w=w;this.h=h;
    this.override=override||null; // null = usa bioma
    this._deco=[];
    this._buildDeco();
  }
  _buildDeco(){
    const deco=currentBiome.deco;
    this._deco=[];
    const n=Math.floor(this.w/28);
    for(let i=0;i<n;i++) this._deco.push({t:deco,ox:10+i*28+rnd(0,14),r:rnd(0,100)});
  }
  update(){}
  get bodyCol(){ return this.override||currentBiome.body; }
  get topCol(){  return currentBiome.top;  }
  get topHi(){   return currentBiome.topHi;}
  draw(ctx){
    // Cuerpo
    ctx.fillStyle=this.bodyCol; drawRR(ctx,this.x,this.y,this.w,this.h,4); ctx.fill();
    // Capa superior (pasto/nieve/arena)
    ctx.fillStyle=this.topCol; drawRR(ctx,this.x,this.y,this.w,7,3); ctx.fill();
    // Highlight
    ctx.fillStyle=this.topHi; ctx.globalAlpha=0.4; drawRR(ctx,this.x+2,this.y+1,this.w-4,3,2); ctx.fill(); ctx.globalAlpha=1;
    // Decoración de bioma
    for(const d of this._deco) this._drawDeco(ctx,this.x+d.ox,this.y,d.t,d.r);
    // Borde
    ctx.strokeStyle="rgba(0,0,0,0.25)";ctx.lineWidth=1; drawRR(ctx,this.x,this.y,this.w,this.h,4); ctx.stroke();
  }
  _drawDeco(ctx,x,y,type,r){
    switch(type){
      case"forest":
        if(r<40){ctx.fillStyle="#55AA22";for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*4-4,y);ctx.lineTo(x+i*4-6,y-6);ctx.lineTo(x+i*4-2,y-6);ctx.fill();}}
        break;
      case"snow":
        ctx.fillStyle="#EEEEFF";ctx.globalAlpha=0.6;
        ctx.beginPath();ctx.ellipse(x,y-2,5,3,0,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
        break;
      case"desert":
        if(r<30){ctx.strokeStyle="#C8A020";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y);ctx.quadraticCurveTo(x-3,y-4,x,y);ctx.quadraticCurveTo(x+3,y-4,x+6,y);ctx.stroke();}
        break;
      case"cave":
        if(r<35){ctx.fillStyle="#AA44CC";ctx.globalAlpha=0.8;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x+i*5-5,y);ctx.lineTo(x+i*5-7,y-9-i*2);ctx.lineTo(x+i*5-3,y-9-i*2);ctx.fill();}ctx.globalAlpha=1;}
        break;
      case"volcanic":
        if(r<25){ctx.fillStyle="#FF6600";ctx.globalAlpha=0.7;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x,y-8);ctx.lineTo(x+4,y);ctx.fill();ctx.globalAlpha=1;}
        break;
    }
  }
  getBounds(){return{x:this.x,y:this.y,w:this.w,h:this.h};}
}

class MovingPlatform extends Platform{
  constructor(x,y,w,h,sx,ex,spd){
    super(x,y,w,h);
    this.startX=sx;this.endX=ex;this.speed=spd;this.dir=1;this.prevX=x;
  }
  update(){
    this.prevX=this.x;this.x+=this.speed*this.dir;
    if(this.x>=this.endX){this.x=this.endX;this.dir=-1;}
    if(this.x<=this.startX){this.x=this.startX;this.dir=1;}
  }
  get dx(){return this.x-this.prevX;}
  draw(ctx){
    ctx.fillStyle=currentBiome.movCol; drawRR(ctx,this.x,this.y,this.w,this.h,4); ctx.fill();
    ctx.fillStyle=currentBiome.movTop; drawRR(ctx,this.x,this.y,this.w,5,3); ctx.fill();
    ctx.strokeStyle="rgba(0,0,0,0.3)";ctx.lineWidth=1; drawRR(ctx,this.x,this.y,this.w,this.h,4); ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,0.45)";ctx.font="9px monospace";ctx.textAlign="center";ctx.fillText("◄►",this.x+this.w/2,this.y+this.h/2+4);
  }
}

// ============================================================
//  ENEMIGOS BASE
// ============================================================
class Enemy{
  constructor(x,y,ps,pe){
    this.x=x;this.y=y;this.w=28;this.h=24;this.vx=1.5;this.vy=0;
    this.onGround=false;this.alive=true;this.patrolStart=ps;this.patrolEnd=pe;
    this.dir=1;this.animFrame=0;this.immuneToStomp=false;
    this.atk=null; // {frame, max, tx, ty}
    this.soundId="crow";
    this.damage=1; // corazones que quita al jugador
  }
  startAttack(tx,ty){ this.atk={frame:0,max:this._atkMax(),tx:tx,ty:ty}; SFX.playEnemy(this.soundId); }
  _atkMax(){ return 45; }
  updateAttack(){ if(this.atk){ this.atk.frame++; if(this.atk.frame>=this.atk.max) this.atk=null; } }
  drawAttackFx(ctx){}
  applyGravity(){this.vy+=GRAVITY;if(this.vy>14)this.vy=14;}
  resolveCollisions(platforms){
    this.y+=this.vy;this.onGround=false;
    for(const p of platforms){
      const pb=p.getBounds();
      if(aabb(this,pb)){
        if(this.vy>0){this.y=pb.y-this.h;this.vy=0;this.onGround=true;}
        else if(this.vy<0){this.y=pb.y+pb.h;this.vy=0;}
      }
    }
    this.x+=this.vx*this.dir;
    if(this.x<=this.patrolStart){this.x=this.patrolStart;this.dir=1;}
    if(this.x>=this.patrolEnd){this.x=this.patrolEnd;this.dir=-1;}
  }
  getBounds(){return{x:this.x,y:this.y,w:this.w,h:this.h};}
}

// --- Cuervo caminador ---
class WalkingEnemy extends Enemy{
  constructor(x,y,ps,pe){super(x,y,ps,pe);this.vx=1.5;this.damage=0.5;/* Cuervo nerfeado: medio corazón */}
  update(platforms){this.animFrame++;this.applyGravity();this.resolveCollisions(platforms);this.updateAttack();}
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+14,this.y+12);if(this.dir<0)ctx.scale(-1,1);
    ctx.fillStyle="#2A2A3A";ctx.beginPath();ctx.ellipse(0,2,12,10,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(6,-7,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#444";ctx.beginPath();ctx.moveTo(14,-7);ctx.lineTo(18,-5);ctx.lineTo(14,-3);ctx.fill();
    ctx.fillStyle="#FF2020";ctx.beginPath();ctx.arc(9,-9,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(10,-9,1.5,0,Math.PI*2);ctx.fill();
    const la=Math.sin(this.animFrame*0.25)*3;
    ctx.strokeStyle="#333";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(-4,10);ctx.lineTo(-4-la,18);ctx.moveTo(4,10);ctx.lineTo(4+la,18);ctx.stroke();
    ctx.restore();
  }
  // Cuervo: picotazo rápido
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;
    const t=frame/max;
    ctx.save();
    // Línea de embestida desde el cuervo al objetivo
    if(t<0.5){
      const e=t/0.5;
      const sx=this.x+14,sy=this.y+5;
      const cx=lerp(sx,tx,e),cy=lerp(sy,ty,e);
      ctx.globalAlpha=0.8;ctx.strokeStyle="#555";ctx.lineWidth=3;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(cx,cy);ctx.stroke();
      ctx.strokeStyle="#FF2020";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(cx,cy);ctx.stroke();
    } else {
      // Impacto: estrellita roja
      const e=(t-0.5)/0.5;ctx.globalAlpha=1-e;
      ctx.translate(tx,ty);ctx.rotate(frame*0.3);
      ctx.strokeStyle="#FF2020";ctx.lineWidth=2;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r=4+e*10;
        ctx.beginPath();ctx.moveTo(Math.cos(a)*3,Math.sin(a)*3);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
      ctx.fillStyle="#FFE040";ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
}

// --- Gato saltador ---
class JumpingEnemy extends Enemy{
  constructor(x,y,ps,pe){super(x,y,ps,pe);this.vx=2.0;this.jumpCooldown=rnd(40,80);this.coiling=false;this.soundId="cat";}
  update(platforms,px){
    this.animFrame++;this.applyGravity();this.resolveCollisions(platforms);this.updateAttack();
    this.jumpCooldown--;
    if(this.jumpCooldown<=0&&this.onGround&&Math.abs((this.x+14)-px)<220){this.vy=JUMP_FORCE*0.82;this.jumpCooldown=rnd(70,110);}
    this.coiling=this.jumpCooldown<18&&this.onGround;
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+14,this.y+12);if(this.dir<0)ctx.scale(-1,1);
    const sq=this.coiling?0.7:1;
    ctx.fillStyle="#D4700A";ctx.beginPath();ctx.ellipse(0,2*sq,13,10/sq,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#A05000";ctx.lineWidth=2;
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*5,-4*sq);ctx.lineTo(i*5,8*sq);ctx.stroke();}
    ctx.fillStyle="#D4700A";ctx.beginPath();ctx.arc(9,-8*sq,9,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(4,-16*sq);ctx.lineTo(7,-24*sq);ctx.lineTo(11,-16*sq);ctx.fill();
    ctx.beginPath();ctx.moveTo(12,-16*sq);ctx.lineTo(15,-23*sq);ctx.lineTo(18,-16*sq);ctx.fill();
    ctx.fillStyle="#20FF40";ctx.beginPath();ctx.ellipse(7,-9*sq,3,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(13,-9*sq,3,2.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(8,-9*sq,1,2,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(14,-9*sq,1,2,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#FFF";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(5,-6*sq);ctx.lineTo(-3,-5*sq);ctx.moveTo(5,-5*sq);ctx.lineTo(-3,-3*sq);ctx.stroke();
    if(this.coiling){ctx.fillStyle="#FF8C00";for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*4-2,-8);ctx.lineTo(i*4,-18);ctx.lineTo(i*4+2,-8);ctx.fill();}}
    ctx.restore();
  }
  // Saltador: 3 zarpazos diagonales
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    for(let i=0;i<3;i++){
      const ph=(t*1.5)-i*0.18;
      if(ph<=0||ph>=1)continue;
      const alpha=Math.sin(ph*Math.PI);
      ctx.globalAlpha=alpha;
      ctx.strokeStyle="#FF8C00";ctx.lineWidth=3;ctx.lineCap="round";
      const ox=(i-1)*6;
      ctx.beginPath();ctx.moveTo(-14+ox,-10);ctx.lineTo(14+ox,10);ctx.stroke();
      ctx.strokeStyle="#FFF";ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(-14+ox,-10);ctx.lineTo(14+ox,10);ctx.stroke();
    }
    ctx.restore();
  }
}

// --- Murciélago ---
class BatEnemy extends Enemy{
  constructor(x,y,ps,pe){
    super(x,y,ps,pe);this.w=26;this.h=18;this.vx=2.2;this.baseY=y;this.timer=Math.random()*Math.PI*2;this.flapFrame=0;this.soundId="bat";
  }
  update(platforms,px){
    this.animFrame++;this.flapFrame++;this.timer+=0.04;this.updateAttack();
    this.y=this.baseY+Math.sin(this.timer)*35;
    this.x+=this.vx*this.dir;
    if(this.x<=this.patrolStart){this.x=this.patrolStart;this.dir=1;}
    if(this.x>=this.patrolEnd){this.x=this.patrolEnd;this.dir=-1;}
  }
  // Murciélago: mordida con X roja y gotas
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    // Colmillos (2 triángulos blancos cerrándose)
    const open=Math.sin(t*Math.PI);
    ctx.fillStyle="#FFF";
    ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(-4,-8);ctx.lineTo(-6,-2+open*4);ctx.fill();
    ctx.beginPath();ctx.moveTo(8,-8);ctx.lineTo(4,-8);ctx.lineTo(6,-2+open*4);ctx.fill();
    // X sanguinolenta
    if(t>0.3){
      const e=(t-0.3)/0.7;ctx.globalAlpha=1-e;
      ctx.strokeStyle="#AA0020";ctx.lineWidth=3;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(-10,-6);ctx.lineTo(10,6);ctx.moveTo(-10,6);ctx.lineTo(10,-6);ctx.stroke();
    }
    // Gotas cayendo
    if(t>0.5){
      ctx.fillStyle="#AA0020";ctx.globalAlpha=1-t;
      for(let i=0;i<3;i++){const drop=(t-0.5)*20+i*4;
        ctx.beginPath();ctx.arc((i-1)*5,drop,1.8,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+13,this.y+9);if(this.dir<0)ctx.scale(-1,1);
    const fa=Math.sin(this.flapFrame*0.35)*0.6;
    ctx.fillStyle="#3A0A4A";
    ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-14,-10+fa*20,-20,-2);ctx.quadraticCurveTo(-14,4,-2,6);ctx.fill();
    ctx.beginPath();ctx.moveTo(2,0);ctx.quadraticCurveTo(14,-10+fa*20,20,-2);ctx.quadraticCurveTo(14,4,2,6);ctx.fill();
    ctx.fillStyle="#5A1A6A";ctx.beginPath();ctx.ellipse(0,1,7,9,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(0,-9,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#3A0A4A";ctx.beginPath();ctx.moveTo(-4,-15);ctx.lineTo(-7,-22);ctx.lineTo(-1,-16);ctx.fill();
    ctx.beginPath();ctx.moveTo(4,-15);ctx.lineTo(7,-22);ctx.lineTo(1,-16);ctx.fill();
    ctx.fillStyle="#FF3030";ctx.beginPath();ctx.arc(-2.5,-10,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(2.5,-10,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(-2.5,-10,1,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(2.5,-10,1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#FFF";ctx.beginPath();ctx.moveTo(-2,-3);ctx.lineTo(-1,2);ctx.lineTo(0,-3);ctx.fill();ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(1,2);ctx.lineTo(2,-3);ctx.fill();
    ctx.restore();
  }
  getBounds(){return{x:this.x+4,y:this.y+2,w:18,h:14};}
}

// --- Serpiente (NUEVO) ---
class SnakeEnemy extends Enemy{
  constructor(x,y,ps,pe){
    super(x,y,ps,pe);this.w=44;this.h=14;this.vx=2.6;this.timer=0;this.soundId="snake";
  }
  update(platforms){
    this.animFrame++;this.timer+=0.12;this.updateAttack();
    this.applyGravity();this.resolveCollisions(platforms);
  }
  // Serpiente: embestida con colmillos
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();
    const sx=this.x+this.w/2,sy=this.y+this.h/2;
    // Cuello estirándose
    if(t<0.5){
      const e=t/0.5;
      ctx.strokeStyle="#4AAA28";ctx.lineWidth=7;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(sx,sy);
      ctx.quadraticCurveTo(lerp(sx,tx,0.5),sy-10*Math.sin(e*Math.PI),lerp(sx,tx,e),lerp(sy,ty,e));
      ctx.stroke();
      // cabeza en la punta
      ctx.fillStyle="#4AAA28";ctx.beginPath();ctx.arc(lerp(sx,tx,e),lerp(sy,ty,e),7,0,Math.PI*2);ctx.fill();
    } else {
      // colmillos en el target
      const e=(t-0.5)/0.5;ctx.globalAlpha=1-e;
      ctx.translate(tx,ty);
      ctx.fillStyle="#FFF";
      ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(-2,-6);ctx.lineTo(-3.5,2+e*4);ctx.fill();
      ctx.beginPath();ctx.moveTo(5,-6);ctx.lineTo(2,-6);ctx.lineTo(3.5,2+e*4);ctx.fill();
      // gotas verdes de veneno
      ctx.fillStyle="#44DD22";
      for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2,r=4+e*14;
        ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.8,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x,this.y+this.h/2);if(this.dir<0)ctx.scale(-1,1);
    const segments=8;
    ctx.strokeStyle="#3A8A20";ctx.lineWidth=10;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.beginPath();
    for(let i=0;i<=segments;i++){
      const px=i*(this.w/segments);
      const py=Math.sin(this.timer+i*0.7)*5;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    }
    ctx.stroke();
    // Escamas
    ctx.strokeStyle="#2A6A10";ctx.lineWidth=1.5;
    for(let i=1;i<segments-1;i++){
      const px=i*(this.w/segments)+4;
      const py=Math.sin(this.timer+i*0.7)*5;
      ctx.beginPath();ctx.moveTo(px-4,py-3);ctx.lineTo(px,py+3);ctx.lineTo(px+4,py-3);ctx.stroke();
    }
    // Cabeza
    ctx.fillStyle="#4AAA28";ctx.beginPath();ctx.ellipse(this.w+4,Math.sin(this.timer)*5,9,6,0,0,Math.PI*2);ctx.fill();
    // Lengua
    ctx.strokeStyle="#FF2020";ctx.lineWidth=1.5;
    const hx=this.w+4,hy=Math.sin(this.timer)*5;
    ctx.beginPath();ctx.moveTo(hx+8,hy);ctx.lineTo(hx+14,hy-2);ctx.moveTo(hx+8,hy);ctx.lineTo(hx+14,hy+2);ctx.stroke();
    // Ojos
    ctx.fillStyle="#FF4040";ctx.beginPath();ctx.arc(hx+2,hy-3,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(hx+3,hy-3,1,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  getBounds(){return{x:this.x,y:this.y+2,w:this.w+16,h:10};}
}

// --- Fantasma (NUEVO - inmune a pisotones) ---
class GhostEnemy{
  constructor(x,y){
    this.x=x;this.y=y;this.w=30;this.h=34;this.alive=true;this.animFrame=0;
    this.immuneToStomp=true;this.dir=1;this.timer=Math.random()*Math.PI*2;
    this.targetX=x;this.targetY=y;
    this.atk=null;
  }
  startAttack(tx,ty){ this.atk={frame:0,max:55,tx,ty}; SFX.playEnemy("ghost"); }
  updateAttack(){ if(this.atk){ this.atk.frame++; if(this.atk.frame>=this.atk.max) this.atk=null; } }
  update(platforms,px,py){
    this.animFrame++;this.timer+=0.03;this.updateAttack();
    // Deriva hacia el jugador lentamente
    const dx=px-this.x-15,dy=py-this.y-17;
    const d=Math.hypot(dx,dy)||1;
    const spd=0.9;
    this.x+=dx/d*spd;this.y+=dy/d*spd;
    this.dir=dx>0?1:-1;
    // Bob suave
    this.y+=Math.sin(this.timer)*0.5;
  }
  getBounds(){return{x:this.x+6,y:this.y+6,w:18,h:22};}
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+15,this.y+17);
    const bob=Math.sin(this.animFrame*0.07)*4;
    ctx.globalAlpha=0.72;
    // Cuerpo fantasmal
    ctx.fillStyle="#AACCFF";
    ctx.beginPath();ctx.arc(0,-5+bob,14,Math.PI,0);
    ctx.quadraticCurveTo(14,16+bob,8,12+bob);
    ctx.quadraticCurveTo(4,20+bob,0,12+bob);
    ctx.quadraticCurveTo(-4,20+bob,-8,12+bob);
    ctx.quadraticCurveTo(-14,16+bob,-14,0+bob);
    ctx.fill();
    // Contorno brillante
    ctx.globalAlpha=0.5;ctx.strokeStyle="#DDEEFF";ctx.lineWidth=1.5;ctx.stroke();
    ctx.globalAlpha=0.85;
    // Ojos huecos
    ctx.fillStyle="#2244AA";ctx.beginPath();ctx.ellipse(-5,-4+bob,4,5,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(5,-4+bob,4,5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#88AAEE";ctx.beginPath();ctx.arc(-5,-4+bob,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5,-4+bob,2,0,Math.PI*2);ctx.fill();
    // Boca
    ctx.strokeStyle="#2244AA";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,4+bob,5,0.2,Math.PI-0.2);ctx.stroke();
    // "SOLO GARRAS" texto flotante
    if(Math.floor(this.animFrame/40)%3===0){
      ctx.globalAlpha=0.7;ctx.fillStyle="#FFCCFF";ctx.font="7px monospace";ctx.textAlign="center";
      ctx.fillText("¡usa Z!",0,-24+bob);
    }
    ctx.restore();
  }
  // Fantasma: espiral de posesión + X espectral
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    // Espiral
    ctx.globalAlpha=(1-t)*0.9;
    ctx.strokeStyle="#AACCFF";ctx.lineWidth=2.5;
    ctx.rotate(t*6);
    ctx.beginPath();
    for(let i=0;i<4;i+=0.15){const r=4+i*4,a=i*2;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
    ctx.stroke();
    ctx.strokeStyle="#FFFFFF";ctx.lineWidth=1;
    ctx.beginPath();
    for(let i=0;i<4;i+=0.15){const r=4+i*4+2,a=i*2+0.4;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
    ctx.stroke();
    // X espectral al final
    if(t>0.5){
      const e=(t-0.5)/0.5;ctx.globalAlpha=e*(1-e)*4;
      ctx.strokeStyle="#DDEEFF";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-12,-12);ctx.lineTo(12,12);ctx.moveTo(-12,12);ctx.lineTo(12,-12);ctx.stroke();
    }
    // Almas flotando hacia arriba
    ctx.fillStyle="#AACCFF";
    for(let i=0;i<4;i++){ctx.globalAlpha=(1-t)*0.7;
      ctx.beginPath();ctx.arc((i-1.5)*7,-t*30+i*4,2.2,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
}

// --- Avispa (NUEVO - vuela en zig-zag y embiste) ---
class WaspEnemy extends Enemy{
  constructor(x,y,ps,pe){
    super(x,y,ps,pe);this.w=26;this.h=20;this.baseY=y;this.timer=Math.random()*Math.PI*2;
    this.vx=3.0;this.wingFrame=0;this.diveTimer=rnd(60,140);this.diving=false;this.diveY=0;this.soundId="wasp";
  }
  update(platforms,px){
    this.animFrame++;this.wingFrame+=3;this.timer+=0.08;this.updateAttack();
    this.diveTimer--;
    if(!this.diving&&this.diveTimer<=0&&Math.abs((this.x+13)-px)<180){this.diving=true;this.diveY=this.baseY+70;this.diveTimer=rnd(140,220);}
    if(this.diving){
      this.y=lerp(this.y,this.diveY,0.12);
      if(Math.abs(this.y-this.diveY)<3){this.diving=false;}
    } else {
      this.y=this.baseY+Math.sin(this.timer)*18;
    }
    this.x+=this.vx*this.dir;
    if(this.x<=this.patrolStart){this.x=this.patrolStart;this.dir=1;}
    if(this.x>=this.patrolEnd){this.x=this.patrolEnd;this.dir=-1;}
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+13,this.y+10);if(this.dir<0)ctx.scale(-1,1);
    // Alas (transparentes vibrando)
    const wf=Math.sin(this.wingFrame*0.9)*0.4+0.7;
    ctx.globalAlpha=0.55;ctx.fillStyle="#DDEEFF";
    ctx.beginPath();ctx.ellipse(-4,-8,7,10*wf,-0.3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(4,-8,7,10*wf,0.3,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    // Cuerpo con bandas
    ctx.fillStyle="#F5D020";ctx.beginPath();ctx.ellipse(0,2,10,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#1A1A1A";
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.ellipse(i*4,2,1.8,7,0,0,Math.PI*2);ctx.fill();}
    // Cabeza
    ctx.fillStyle="#1A1A1A";ctx.beginPath();ctx.arc(8,0,5,0,Math.PI*2);ctx.fill();
    // Antenas
    ctx.strokeStyle="#1A1A1A";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(10,-3);ctx.quadraticCurveTo(13,-8,15,-10);ctx.moveTo(12,-3);ctx.quadraticCurveTo(15,-6,16,-8);ctx.stroke();
    // Ojos
    ctx.fillStyle="#FF2040";ctx.beginPath();ctx.arc(9,-1,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(11,-1,1.5,0,Math.PI*2);ctx.fill();
    // Aguijón
    ctx.fillStyle="#333";ctx.beginPath();ctx.moveTo(-9,2);ctx.lineTo(-14,0);ctx.lineTo(-9,4);ctx.fill();
    ctx.fillStyle="#FFF";ctx.beginPath();ctx.arc(-13,1,0.8,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  getBounds(){return{x:this.x+2,y:this.y+2,w:22,h:16};}
  // Avispa: aguijonazo con gota de veneno
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    if(t<0.4){
      // aguijón perforando
      const e=t/0.4;ctx.globalAlpha=1;
      ctx.fillStyle="#F5D020";
      ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(4+e*8,0);ctx.lineTo(-8,8);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#1A1A1A";ctx.lineWidth=1.5;ctx.stroke();
      // punta negra
      ctx.fillStyle="#1A1A1A";
      ctx.beginPath();ctx.arc(4+e*8,0,1.5,0,Math.PI*2);ctx.fill();
    } else {
      // veneno estallando
      const e=(t-0.4)/0.6;ctx.globalAlpha=1-e;
      ctx.fillStyle="#BBFF20";
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2,r=4+e*16;
        ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2.5-e,0,Math.PI*2);ctx.fill();}
      // gotas grandes
      ctx.fillStyle="#88DD20";
      ctx.beginPath();ctx.arc(0,e*10,3-e*2,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle="#F5D020";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,8+e*10,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }
}

// --- Araña: cuelga de una tela, baja y sube ---
class SpiderEnemy extends Enemy{
  constructor(x,ceilY,minY,maxY){
    super(x,ceilY,x,x);
    this.w=22;this.h=18;this.ceilY=ceilY;this.minY=minY;this.maxY=maxY;
    this.vx=0;this.phase=Math.random()*Math.PI*2;this.soundId="spider";
    this.damage=1;
  }
  update(platforms,px){
    this.animFrame++;this.updateAttack();
    // Movimiento senoidal vertical entre minY y maxY
    this.phase+=0.035;
    const t=(Math.sin(this.phase)+1)/2; // 0..1
    this.y=lerp(this.minY,this.maxY,t);
    // Baja/sube más rápido si el jugador está cerca horizontalmente
    const dx=Math.abs(px-(this.x+this.w/2));
    if(dx<90) this.phase+=0.03;
  }
  draw(ctx){
    if(!this.alive)return;
    // Hilo desde el techo
    ctx.strokeStyle="rgba(220,220,255,0.55)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(this.x+this.w/2,this.ceilY);ctx.lineTo(this.x+this.w/2,this.y+3);ctx.stroke();
    // Cuerpo
    ctx.save();ctx.translate(this.x+this.w/2,this.y+10);
    ctx.fillStyle="#1A0A20";ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#2A1030";ctx.beginPath();ctx.arc(-5,-2,4,0,Math.PI*2);ctx.fill();
    // Ojos
    ctx.fillStyle="#FF2060";
    for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j+=2){
      ctx.beginPath();ctx.arc(-5+i*1.5,-2+j*1.2,0.9,0,Math.PI*2);ctx.fill();
    }
    // Patas (8)
    const wig=Math.sin(this.animFrame*0.3)*2;
    ctx.strokeStyle="#1A0A20";ctx.lineWidth=1.8;ctx.lineCap="round";
    for(let i=0;i<4;i++){
      const a=0.4+i*0.4;
      ctx.beginPath();
      ctx.moveTo(-3,0);ctx.lineTo(-10-i*2,4+wig+i);ctx.lineTo(-12-i*2,10+wig);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3,0);ctx.lineTo(10+i*2,4-wig+i);ctx.lineTo(12+i*2,10-wig);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Araña: ataque mordisco venenoso
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    // Colmillos cruzados
    ctx.globalAlpha=Math.sin(t*Math.PI);
    ctx.strokeStyle="#9020FF";ctx.lineWidth=3;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(8,8);ctx.moveTo(-8,8);ctx.lineTo(8,-8);ctx.stroke();
    // Gotas de veneno
    if(t>0.4){
      ctx.fillStyle="#5A00AA";
      for(let i=0;i<3;i++){
        const d=(t-0.4)*25+i*5;
        ctx.beginPath();ctx.arc((i-1)*6,d,1.8,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }
}

// --- Rata: rápido, pequeño, huye cuando recibe el ataque ---
class RatEnemy extends Enemy{
  constructor(x,y,ps,pe){
    super(x,y,ps,pe);
    this.w=24;this.h=16;this.vx=2.6;this.soundId="rat";this.damage=0.5;
  }
  update(platforms,px){
    this.animFrame++;this.applyGravity();
    // Correr rápido, y si el jugador está detrás, cambiar dirección
    const myCx=this.x+this.w/2;
    if(Math.abs(px-myCx)<180){
      const want=px<myCx?1:-1; // huir
      if(want!==this.dir) this.dir=want;
      this.vx=3.4;
    } else this.vx=2.6;
    this.resolveCollisions(platforms);this.updateAttack();
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+12,this.y+8);if(this.dir<0)ctx.scale(-1,1);
    // Cuerpo alargado
    ctx.fillStyle="#6A5040";ctx.beginPath();ctx.ellipse(0,3,12,6,0,0,Math.PI*2);ctx.fill();
    // Cabeza
    ctx.fillStyle="#7A5848";ctx.beginPath();ctx.arc(9,0,5.5,0,Math.PI*2);ctx.fill();
    // Orejas redondas
    ctx.fillStyle="#5A3830";
    ctx.beginPath();ctx.arc(6,-5,2.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(10,-5.5,2.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#F090A0";
    ctx.beginPath();ctx.arc(6,-5,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(10,-5.5,1.2,0,Math.PI*2);ctx.fill();
    // Ojo negro y hocico
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(11,-1,1.1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#F090A0";ctx.beginPath();ctx.arc(14,1.5,1.4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(14.5,1.5,0.5,0,Math.PI*2);ctx.fill();
    // Bigotes
    ctx.strokeStyle="rgba(240,240,240,0.6)";ctx.lineWidth=0.6;
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(13,2+i*0.6);ctx.lineTo(19,1+i*1.5);ctx.stroke();}
    // Cola serpenteante
    const w=Math.sin(this.animFrame*0.4)*3;
    ctx.strokeStyle="#6A5040";ctx.lineWidth=2;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-11,3);ctx.quadraticCurveTo(-18,3+w,-22,1-w);ctx.stroke();
    // Patitas corriendo
    const run=Math.sin(this.animFrame*0.6)*3;
    ctx.strokeStyle="#5A3830";ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(-4,8);ctx.lineTo(-4-run,12);ctx.moveTo(4,8);ctx.lineTo(4+run,12);ctx.stroke();
    ctx.restore();
  }
  // Rata: arañazo + dientes
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    ctx.globalAlpha=Math.sin(t*Math.PI);
    ctx.strokeStyle="#F0E0C0";ctx.lineWidth=2;ctx.lineCap="round";
    // 3 líneas de arañazo rápidas
    for(let i=-1;i<=1;i++){
      ctx.beginPath();ctx.moveTo(-10,i*3);ctx.lineTo(10,i*3+t*4);ctx.stroke();
    }
    // Dientes blancos
    if(t>0.3){
      ctx.globalAlpha=1-(t-0.3)/0.7;
      ctx.fillStyle="#FFF";
      ctx.beginPath();ctx.moveTo(-3,-4);ctx.lineTo(-1,1);ctx.lineTo(1,-4);ctx.fill();
      ctx.beginPath();ctx.moveTo(1,-4);ctx.lineTo(3,1);ctx.lineTo(5,-4);ctx.fill();
    }
    ctx.restore();
  }
}

// --- Cuervo en Picado: vuela alto y se lanza en diagonal cuando jugador está debajo ---
class DiveCrow extends Enemy{
  constructor(x,y,ps,pe){
    super(x,y,ps,pe);
    this.w=28;this.h=20;this.vx=1.6;
    this.baseY=y;this.diving=false;this.diveTimer=0;
    this.diveCool=rnd(90,180);this.soundId="divecrow";
    this.damage=1;
  }
  update(platforms,px){
    this.animFrame++;this.updateAttack();
    if(this.diving){
      // Diagonal descendente; si choca con plataforma o pasa px, vuelve
      this.diveTimer++;
      this.y+=5;this.x+=this.dir*3.5;
      if(this.y>this.baseY+160 || this.diveTimer>60){
        this.diving=false;this.diveTimer=0;
        this.diveCool=rnd(110,200);
      }
    } else {
      // Patrulla horizontal en altura
      this.y=lerp(this.y,this.baseY+Math.sin(this.animFrame*0.06)*8,0.1);
      this.x+=this.vx*this.dir;
      if(this.x<=this.patrolStart){this.x=this.patrolStart;this.dir=1;}
      if(this.x>=this.patrolEnd){this.x=this.patrolEnd;this.dir=-1;}
      this.diveCool--;
      // Si jugador cerca verticalmente bajo el cuervo, inicia picado
      const dx=px-(this.x+this.w/2);
      if(this.diveCool<=0 && Math.abs(dx)<60){
        this.diving=true;this.diveTimer=0;
        this.dir = dx>=0?1:-1;
        SFX.playEnemy("divecrow");
      }
    }
  }
  draw(ctx){
    if(!this.alive)return;
    ctx.save();ctx.translate(this.x+14,this.y+10);if(this.dir<0)ctx.scale(-1,1);
    // Cuerpo
    const ang = this.diving?0.7:0;
    ctx.rotate(ang);
    ctx.fillStyle="#151525";
    ctx.beginPath();ctx.ellipse(0,0,13,8,0,0,Math.PI*2);ctx.fill();
    // Cabeza
    ctx.beginPath();ctx.arc(10,-3,6,0,Math.PI*2);ctx.fill();
    // Pico amarillo-naranja largo
    ctx.fillStyle="#E8A040";
    ctx.beginPath();ctx.moveTo(16,-3);ctx.lineTo(22,-1);ctx.lineTo(16,1);ctx.fill();
    // Ojo
    ctx.fillStyle="#FFD700";ctx.beginPath();ctx.arc(11,-4,1.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#000";ctx.beginPath();ctx.arc(11.5,-4,0.9,0,Math.PI*2);ctx.fill();
    // Alas: abiertas y aleteando
    const flap=this.diving?-0.6:Math.sin(this.animFrame*0.35)*0.5;
    ctx.fillStyle="#0A0A18";
    ctx.save();ctx.rotate(flap);
    ctx.beginPath();ctx.ellipse(-4,-4,10,4,-0.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.save();ctx.rotate(-flap);
    ctx.beginPath();ctx.ellipse(-4,4,10,4,0.3,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.restore();
    // Línea de trayectoria durante picado
    if(this.diving){
      ctx.save();
      ctx.strokeStyle="rgba(255,60,60,0.35)";ctx.lineWidth=2;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.moveTo(this.x+14,this.y+10);
      ctx.lineTo(this.x+14+this.dir*40,this.y+10+60);
      ctx.stroke();ctx.setLineDash([]);
      ctx.restore();
    }
  }
  // Cuervo diver: pico en triángulo
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    ctx.globalAlpha=Math.sin(t*Math.PI);
    ctx.fillStyle="#E8A040";
    ctx.beginPath();ctx.moveTo(-12,-8);ctx.lineTo(8+t*8,0);ctx.lineTo(-12,8);ctx.fill();
    // Plumas cayendo
    ctx.fillStyle="#151525";ctx.globalAlpha*=0.8;
    for(let i=0;i<4;i++){
      const d=t*20+i*3;const a=(i-1.5)*0.25;
      ctx.beginPath();
      ctx.save();ctx.translate(Math.cos(a)*10,Math.sin(a)*10+d);ctx.rotate(a);
      ctx.ellipse(0,0,3,1,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    ctx.restore();
  }
}

// --- Trampa de Pinchos (NUEVO - estática, inmune a todo, hiere al tocar) ---
class SpikeTrap{
  constructor(x,y){
    this.x=x;this.y=y;this.w=42;this.h=20;this.alive=true;this.animFrame=0;
    this.immuneToStomp=true;this.immuneToClaw=true;this.dir=1;this.atk=null;this.soundId="spike";
  }
  startAttack(tx,ty){ this.atk={frame:0,max:45,tx,ty}; SFX.playEnemy("spike"); }
  updateAttack(){ if(this.atk){ this.atk.frame++; if(this.atk.frame>=this.atk.max) this.atk=null; } }
  update(){ this.animFrame++; this.updateAttack(); }
  getBounds(){return{x:this.x+2,y:this.y+6,w:this.w-4,h:this.h-6};}
  draw(ctx){
    // Base metálica
    ctx.fillStyle="#3A3A48";drawRR(ctx,this.x,this.y+10,this.w,10,2);ctx.fill();
    ctx.fillStyle="#5A5A68";drawRR(ctx,this.x+2,this.y+11,this.w-4,2,1);ctx.fill();
    // Pinchos (con leve vibración)
    const vib=Math.sin(this.animFrame*0.3)*0.5;
    const n=Math.floor(this.w/7);
    for(let i=0;i<n;i++){
      const sx=this.x+4+i*6;
      ctx.fillStyle="#999";
      ctx.beginPath();ctx.moveTo(sx,this.y+10+vib);ctx.lineTo(sx+3,this.y-4+vib);ctx.lineTo(sx+6,this.y+10+vib);ctx.fill();
      // Highlight
      ctx.strokeStyle="#CCC";ctx.lineWidth=0.8;
      ctx.beginPath();ctx.moveTo(sx+1,this.y+8+vib);ctx.lineTo(sx+3,this.y-3+vib);ctx.stroke();
      // Punta oscura
      ctx.fillStyle="#444";
      ctx.beginPath();ctx.arc(sx+3,this.y-4+vib,0.8,0,Math.PI*2);ctx.fill();
    }
    // Tornillos en base
    ctx.fillStyle="#777";
    ctx.beginPath();ctx.arc(this.x+4,this.y+15,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(this.x+this.w-4,this.y+15,1.2,0,Math.PI*2);ctx.fill();
  }
  drawAttackFx(ctx){
    if(!this.atk)return;
    const {frame,max,tx,ty}=this.atk;const t=frame/max;
    ctx.save();ctx.translate(tx,ty);
    // Líneas de impacto con chispas
    ctx.globalAlpha=1-t;
    ctx.strokeStyle="#FFE040";ctx.lineWidth=2.5;ctx.lineCap="round";
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2,r=5+t*18;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*3,Math.sin(a)*3);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
    }
    // Exclamaciones rojas (¡!)
    ctx.fillStyle="#FF2020";ctx.font="bold 10px monospace";ctx.textAlign="center";
    ctx.fillText("¡!",0,-10-t*8);
    ctx.restore();
  }
}

// ============================================================
//  PIZZA
// ============================================================
class Pizza{
  constructor(x,y){this.x=x;this.y=y;this.w=48;this.h=48;this.collected=false;this.animTimer=0;this.particles=[];}
  update(){
    this.animTimer++;
    for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.2;p.life--;p.alpha=p.life/p.maxLife;}
    this.particles=this.particles.filter(p=>p.life>0);
  }
  collect(){
    this.collected=true;
    for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2,s=2+Math.random()*3;this.particles.push({x:this.x+24,y:this.y+24,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,color:["#F5C842","#C0392B","#9B2020","#F5E642"][i%4],life:40,maxLife:40,alpha:1,r:3+Math.random()*3});}
  }
  draw(ctx){
    for(const p of this.particles){ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(this.collected)return;
    const bob=Math.sin(this.animTimer*0.05)*3;
    const g=ctx.createRadialGradient(this.x+24,this.y+24+bob,5,this.x+24,this.y+24+bob,38);
    g.addColorStop(0,"rgba(255,220,50,0.35)");g.addColorStop(1,"rgba(255,220,50,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x+24,this.y+24+bob,38,0,Math.PI*2);ctx.fill();
    drawPizza(ctx,this.x+24,this.y+24+bob,1.05,this.animTimer);
    if(this.animTimer%60<40){const ax=this.x+24,ay=this.y-12+Math.sin(this.animTimer*0.1)*4;ctx.fillStyle="rgba(255,220,50,0.85)";ctx.beginPath();ctx.moveTo(ax,ay+10);ctx.lineTo(ax-7,ay);ctx.lineTo(ax+7,ay);ctx.fill();}
  }
  getBounds(){return{x:this.x+8,y:this.y+8,w:32,h:32};}
}

// ============================================================
//  BLOQUE SECRETO
// ============================================================
class SecretBlock{
  constructor(x,y){this.x=x;this.y=y;this.w=36;this.h=36;this.collected=false;this.animTimer=0;this.particles=[];this.spawnTimer=0;}
  update(){
    this.animTimer++;if(this.spawnTimer<30)this.spawnTimer++;
    for(const p of this.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;p.life--;p.alpha=p.life/p.maxLife;}
    this.particles=this.particles.filter(p=>p.life>0);
  }
  collect(){
    this.collected=true;
    for(let i=0;i<20;i++){const a=(i/20)*Math.PI*2,s=2+Math.random()*4;this.particles.push({x:this.x+18,y:this.y+18,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,color:pick(["#FFD700","#FFF700","#FFF","#FFB700"]),life:50,maxLife:50,alpha:1,r:2+Math.random()*4});}
  }
  draw(ctx){
    for(const p of this.particles){ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();}
    if(this.collected)return;
    const t=this.animTimer,appear=Math.min(1,this.spawnTimer/30);
    const bob=Math.sin(t*0.06)*4,pulse=1+Math.sin(t*0.12)*0.08;
    ctx.save();ctx.globalAlpha=appear;ctx.translate(this.x+18,this.y+18+bob);ctx.scale(pulse*appear,pulse*appear);
    const g=ctx.createRadialGradient(0,0,6,0,0,36);g.addColorStop(0,"rgba(255,230,0,0.5)");g.addColorStop(1,"rgba(255,150,0,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,36,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#FFE040"; drawRR(ctx,-18,-18,36,36,6); ctx.fill();
    ctx.strokeStyle="#FFB700";ctx.lineWidth=2.5; drawRR(ctx,-18,-18,36,36,6); ctx.stroke();
    ctx.fillStyle="rgba(255,255,200,0.55)"; drawRR(ctx,-16,-16,18,8,3); ctx.fill();
    ctx.fillStyle="#8B4500";ctx.font="bold 22px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.shadowBlur=4;ctx.shadowColor="#FFB700";ctx.fillText("?",0,1);ctx.shadowBlur=0;
    for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+t*0.05,rx=Math.cos(a)*22,ry=Math.sin(a)*8;ctx.globalAlpha=appear*0.7;ctx.fillStyle="#FFD700";ctx.beginPath();ctx.arc(rx,ry,3,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  getBounds(){if(this.collected)return{x:-9999,y:-9999,w:0,h:0};return{x:this.x+4,y:this.y+4,w:28,h:28};}
}
