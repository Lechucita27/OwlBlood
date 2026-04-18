// Render helpers: shade, drawOwl, blood, drawOwlDeath, lerpColor, drawPizza, drawSpeciesAttack

// ============================================================
//  DIBUJO LECHUZA
// ============================================================
// Oscurece/aclara un color hex para sombreado y highlights
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=clamp(Math.round(r+amt),0,255);
  g=clamp(Math.round(g+amt),0,255);
  b=clamp(Math.round(b+amt),0,255);
  return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
}
function drawOwl(ctx,cx,cy,facingRight,sp,animFrame,alpha){
  ctx.save();
  if(alpha!==undefined) ctx.globalAlpha=alpha;
  // Sombra bajo la lechuza
  ctx.save();ctx.translate(cx,cy);
  ctx.fillStyle="rgba(0,0,0,0.22)";
  ctx.beginPath();ctx.ellipse(0,24*sp.scale,11*sp.scale,3,0,0,Math.PI*2);ctx.fill();
  ctx.restore();

  ctx.translate(cx,cy);
  if(!facingRight) ctx.scale(-1,1);
  ctx.scale(sp.scale,sp.scale);

  // Animaciones temporales
  const wb=Math.sin(animFrame*0.18)*2;            // aleteo
  const breath=Math.sin(animFrame*0.07)*0.6;      // respiración
  const blinkCycle=animFrame%180;
  const blinking=blinkCycle<6;                    // parpadeo cada 3s aprox
  const headBob=Math.sin(animFrame*0.09)*0.5;

  const darker=shade(sp.bodyColor,-30);
  const lighter=shade(sp.bodyColor,25);
  const bellyCol=shade(sp.bodyColor,35);

  // --- Alas con gradiente ---
  const wingG=ctx.createRadialGradient(0,0,4,0,0,16);
  wingG.addColorStop(0,shade(sp.wingColor,20));
  wingG.addColorStop(1,sp.wingColor);
  ctx.fillStyle=wingG;
  ctx.beginPath();ctx.ellipse(-14,2+wb,8,14,-0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(14,2+wb,8,14,0.3,0,Math.PI*2);ctx.fill();
  // Plumas en las alas (líneas sutiles)
  ctx.strokeStyle=shade(sp.wingColor,-25);ctx.lineWidth=0.8;
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.moveTo(-14,-6+i*5+wb);ctx.quadraticCurveTo(-18,-4+i*5+wb,-18,2+i*4+wb);ctx.stroke();
    ctx.beginPath();ctx.moveTo(14,-6+i*5+wb);ctx.quadraticCurveTo(18,-4+i*5+wb,18,2+i*4+wb);ctx.stroke();
  }

  // --- Cuerpo con gradiente vertical ---
  const bodyG=ctx.createLinearGradient(0,-12,0,22+breath);
  bodyG.addColorStop(0,lighter);
  bodyG.addColorStop(0.5,sp.bodyColor);
  bodyG.addColorStop(1,darker);
  ctx.fillStyle=bodyG;
  ctx.beginPath();ctx.ellipse(0,4+breath,13,17,0,0,Math.PI*2);ctx.fill();
  // Zona del vientre (más clara)
  ctx.globalCompositeOperation="source-atop";
  const bellyG=ctx.createRadialGradient(0,8+breath,2,0,8+breath,11);
  bellyG.addColorStop(0,bellyCol);
  bellyG.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=bellyG;
  ctx.beginPath();ctx.ellipse(0,8+breath,9,10,0,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation="source-over";
  // Textura de plumas (puntitos pequeños)
  ctx.fillStyle="rgba(0,0,0,0.08)";
  for(let i=0;i<10;i++){
    const a=(i*2.3)%(Math.PI*2),r=9+(i%3)*2;
    ctx.beginPath();ctx.arc(Math.cos(a)*r*0.8,4+breath+Math.sin(a)*r,0.9,0,Math.PI*2);ctx.fill();
  }
  // Borde del cuerpo
  ctx.strokeStyle=darker;ctx.lineWidth=0.8;
  ctx.beginPath();ctx.ellipse(0,4+breath,13,17,0,0,Math.PI*2);ctx.stroke();

  if(sp.hasHBars){
    ctx.strokeStyle=sp.hBarColor;ctx.lineWidth=2;
    for(let i=-1;i<=3;i++){const yy=i*4-2,hw=Math.sqrt(Math.max(0,169-yy*yy))*0.9;if(hw>2){ctx.beginPath();ctx.moveTo(-hw,yy+8);ctx.lineTo(hw,yy+8);ctx.stroke();}}
  }
  if(sp.hasStripes){
    ctx.strokeStyle=sp.stripeColor;ctx.lineWidth=1.5;
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*5,-6);ctx.lineTo(i*5,16);ctx.stroke();}
  }
  if(sp.hasSpots){
    const sps=[[-6,-4],[6,-4],[0,2],[-8,6],[8,6],[-4,12],[4,12],[-9,0],[9,0],[0,-8]];
    for(let i=0;i<Math.min(sp.spotCount,sps.length);i++){
      const[sx,sy]=sps[i];
      ctx.fillStyle=shade(sp.spotColor,-20);
      ctx.beginPath();ctx.ellipse(sx,sy+0.5,2.5,2,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=sp.spotColor;
      ctx.beginPath();ctx.ellipse(sx,sy,2.2,1.7,0,0,Math.PI*2);ctx.fill();
    }
  }

  // --- Patas ---
  const ll=sp.hasLongLegs?16:7;
  ctx.strokeStyle=shade(sp.footColor,-15);ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-5,18);ctx.lineTo(-5,18+ll);ctx.moveTo(5,18);ctx.lineTo(5,18+ll);ctx.stroke();
  ctx.strokeStyle=sp.footColor;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-5,18);ctx.lineTo(-5,18+ll);ctx.moveTo(5,18);ctx.lineTo(5,18+ll);ctx.stroke();
  // Garras
  ctx.strokeStyle=shade(sp.footColor,-30);ctx.lineWidth=1.5;const gy=18+ll;
  ctx.beginPath();ctx.moveTo(-9,gy+1);ctx.lineTo(-5,gy);ctx.lineTo(-1,gy+3);ctx.moveTo(1,gy+3);ctx.lineTo(5,gy);ctx.lineTo(9,gy+1);ctx.stroke();
  // Puntas negras de garras
  ctx.fillStyle="#222";
  for(const gx of [-9,-1,1,9]){ctx.beginPath();ctx.arc(gx,gy+2,0.9,0,Math.PI*2);ctx.fill();}

  // --- Cabeza con gradiente ---
  const headG=ctx.createRadialGradient(-4,-17+headBob,2,0,-13+headBob,15);
  headG.addColorStop(0,lighter);
  headG.addColorStop(1,sp.bodyColor);
  ctx.fillStyle=headG;
  ctx.beginPath();ctx.arc(0,-13+headBob,14,0,Math.PI*2);ctx.fill();
  // Sombra lateral sutil (solo lado del hombro/cuello opuesto a la luz)
  ctx.save();ctx.globalAlpha=0.18;ctx.fillStyle=darker;
  ctx.beginPath();ctx.arc(3,-12+headBob,14,-0.4,1.8);ctx.fill();
  ctx.restore();
  // Borde cabeza
  ctx.strokeStyle=darker;ctx.lineWidth=0.8;
  ctx.beginPath();ctx.arc(0,-13+headBob,14,0,Math.PI*2);ctx.stroke();

  if(sp.faceDisk){
    const faceG=ctx.createRadialGradient(0,-12+headBob,2,0,-12+headBob,12);
    faceG.addColorStop(0,"#FFF");
    faceG.addColorStop(1,sp.faceColor);
    ctx.fillStyle=faceG;
    ctx.beginPath();ctx.ellipse(0,-12+headBob,10,12,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=shade(sp.faceColor,-30);ctx.lineWidth=0.8;
    ctx.beginPath();ctx.ellipse(0,-12+headBob,10,12,0,0,Math.PI*2);ctx.stroke();
  }
  if(sp.spectacles){
    ctx.strokeStyle="#F5E8C0";ctx.lineWidth=2.5;
    ctx.beginPath();ctx.arc(-5.5,-15+headBob,7,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(5.5,-15+headBob,7,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-5.5+7,-15+headBob);ctx.lineTo(5.5-7,-15+headBob);ctx.stroke();
  }
  if(sp.hasEarTufts){
    ctx.fillStyle=sp.tuftColor;
    const tH=sp.longTufts?14:9,sway=Math.sin(animFrame*0.11)*1.2;
    ctx.beginPath();ctx.moveTo(-6,-24+headBob);ctx.lineTo(-9-sway,-24-tH+headBob);ctx.lineTo(-3,-26+headBob);ctx.fill();
    ctx.beginPath();ctx.moveTo(6,-24+headBob);ctx.lineTo(9+sway,-24-tH+headBob);ctx.lineTo(3,-26+headBob);ctx.fill();
    // Punta más oscura
    ctx.fillStyle=shade(sp.tuftColor,-30);
    ctx.beginPath();ctx.arc(-9-sway,-24-tH+headBob,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(9+sway,-24-tH+headBob,1.2,0,Math.PI*2);ctx.fill();
  }
  if(sp.hasEyebrows||sp.surprisedBrows){
    ctx.strokeStyle=sp.surprisedBrows?"#FFEEAA":"#FFF";ctx.lineWidth=2;
    const ang=sp.surprisedBrows?0.8:1.2;
    ctx.beginPath();ctx.arc(-5,-16+headBob,5,Math.PI*ang,Math.PI*1.8);ctx.stroke();
    ctx.beginPath();ctx.arc(5,-16+headBob,5,Math.PI*ang,Math.PI*1.8);ctx.stroke();
  }

  // --- Ojos (con parpadeo) ---
  const er=sp.bigEyes?6:4.5;
  const ey=-15+headBob;
  if(blinking){
    ctx.strokeStyle=shade(sp.bodyColor,-50);ctx.lineWidth=1.5;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(-5.5-er,ey);ctx.quadraticCurveTo(-5.5,ey+er*0.5,-5.5+er,ey);ctx.stroke();
    ctx.beginPath();ctx.moveTo(5.5-er,ey);ctx.quadraticCurveTo(5.5,ey+er*0.5,5.5+er,ey);ctx.stroke();
  } else {
    // Sclera
    ctx.fillStyle="#FFFDE0";
    ctx.beginPath();ctx.arc(-5.5,ey,er,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5.5,ey,er,0,Math.PI*2);ctx.fill();
    // Iris con gradiente radial
    const irisG1=ctx.createRadialGradient(-5.5,ey,0.5,-5.5,ey,er*0.65);
    irisG1.addColorStop(0,shade(sp.irisColor,30));irisG1.addColorStop(1,sp.irisColor);
    ctx.fillStyle=irisG1;
    ctx.beginPath();ctx.arc(-5.5,ey,er*0.65,0,Math.PI*2);ctx.fill();
    const irisG2=ctx.createRadialGradient(5.5,ey,0.5,5.5,ey,er*0.65);
    irisG2.addColorStop(0,shade(sp.irisColor,30));irisG2.addColorStop(1,sp.irisColor);
    ctx.fillStyle=irisG2;
    ctx.beginPath();ctx.arc(5.5,ey,er*0.65,0,Math.PI*2);ctx.fill();
    // Pupila
    ctx.fillStyle="#000";
    ctx.beginPath();ctx.arc(-5.5,ey,er*0.32,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5.5,ey,er*0.32,0,Math.PI*2);ctx.fill();
    // Brillo principal
    ctx.fillStyle="rgba(255,255,255,0.9)";
    ctx.beginPath();ctx.arc(-4.5,ey-1,1.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(6.5,ey-1,1.4,0,Math.PI*2);ctx.fill();
    // Micro brillo secundario
    ctx.fillStyle="rgba(255,255,255,0.55)";
    ctx.beginPath();ctx.arc(-6,ey+1,0.6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(5,ey+1,0.6,0,Math.PI*2);ctx.fill();
  }

  // --- Pico con sombra ---
  ctx.fillStyle=shade(sp.beakColor,-25);
  ctx.beginPath();ctx.moveTo(-3.2,-9.5+headBob);ctx.lineTo(3.2,-9.5+headBob);ctx.lineTo(0,-5+headBob);ctx.fill();
  ctx.fillStyle=sp.beakColor;
  ctx.beginPath();ctx.moveTo(-3,-10+headBob);ctx.lineTo(3,-10+headBob);ctx.lineTo(0,-6+headBob);ctx.fill();
  // Highlight del pico
  ctx.fillStyle="rgba(255,255,255,0.35)";
  ctx.beginPath();ctx.moveTo(-2,-9.5+headBob);ctx.lineTo(0,-9.5+headBob);ctx.lineTo(-1,-7+headBob);ctx.fill();

  ctx.restore();
}

// ============================================================
//  MUERTE ÚNICA POR ESPECIE (Game Over)
// ============================================================
function bloodSplat(ctx,cx,cy,count,spread,size){
  for(let i=0;i<count;i++){
    const a=(i/count)*Math.PI*2+Math.random()*0.4,r=spread*(0.5+Math.random()*0.5);
    const bx=cx+Math.cos(a)*r,by=cy+Math.sin(a)*r;
    ctx.fillStyle="#6A0000";
    ctx.beginPath();ctx.arc(bx,by,size*(0.5+Math.random()*0.8),0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#AA0000";
    ctx.beginPath();ctx.arc(bx-0.5,by-0.5,size*0.5*(0.3+Math.random()*0.6),0,Math.PI*2);ctx.fill();
  }
}
function bloodSpray(ctx,cx,cy,angle,len,count){
  ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
  ctx.fillStyle="#8A0000";
  for(let i=0;i<count;i++){
    const t=i/count,x=t*len,r=(1-t)*3+1;
    ctx.beginPath();ctx.ellipse(x,(Math.random()-0.5)*2,r,r*0.7,0,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle="#C00000";
  for(let i=0;i<count*2;i++){
    const t=Math.random(),x=t*len;
    ctx.beginPath();ctx.arc(x,(Math.random()-0.5)*6,Math.random()*1.5+0.5,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawOwlDeath(ctx,cx,cy,sp,dt){
  const style=sp.attackStyle;
  ctx.save();
  switch(style){
    case"silent":{ // Barn Owl — se desvanece en plumas con impresión sangrienta
      const fade=Math.max(0,1-dt/90);
      drawOwl(ctx,cx,cy,true,sp,0,fade*0.9);
      // Plumas cayendo
      for(let i=0;i<12;i++){
        const t=(dt+i*4)*0.015,vy=Math.sin(t)*2,vx=Math.cos(t+i)*1.5;
        const px=cx+vx*30+i*3-20,py=cy+(dt-i*6)*0.8;
        if(py<cy+80){
          ctx.save();ctx.translate(px,py);ctx.rotate(t);
          ctx.fillStyle="#F0E8C8";
          ctx.beginPath();ctx.ellipse(0,0,3,7,0,0,Math.PI*2);ctx.fill();
          // punta ensangrentada
          ctx.fillStyle="#8A0000";
          ctx.beginPath();ctx.ellipse(0,5,1.5,2,0,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
      }
      bloodSplat(ctx,cx,cy+30,12,40,2.5);
      break;
    }
    case"power":{ // Great Horned — aplastado (flattened) con splat
      const squash=Math.min(1,dt/40);
      ctx.save();ctx.translate(cx,cy);ctx.scale(1+squash*0.4,1-squash*0.7);
      drawOwl(ctx,0,0,true,sp,0,1);
      ctx.restore();
      // Roca cayendo al inicio
      if(dt<40){
        const rockY=cy-150+dt*4;
        ctx.fillStyle="#4A4A4A";
        ctx.beginPath();ctx.ellipse(cx,rockY,30,22,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#6A6A6A";
        ctx.beginPath();ctx.ellipse(cx-8,rockY-6,8,5,0,0,Math.PI*2);ctx.fill();
      }
      if(dt>=40){
        bloodSplat(ctx,cx,cy+15,20,55,3);
        // estrellitas de impacto
        ctx.fillStyle="#FFE040";
        for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2,r=40+Math.sin(dt*0.1+i)*5;
          ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.4,2,0,Math.PI*2);ctx.fill();}
      }
      break;
    }
    case"ice":{ // Snowy — congelada y se hace añicos
      if(dt<40){
        drawOwl(ctx,cx,cy,true,sp,0,1);
        // cubo de hielo alrededor
        ctx.save();ctx.globalAlpha=0.55;
        ctx.fillStyle="#AADDFF";
        ctx.fillRect(cx-30,cy-40,60,70);
        ctx.strokeStyle="#FFFFFF";ctx.lineWidth=2;
        ctx.strokeRect(cx-30,cy-40,60,70);
        // brillo
        ctx.fillStyle="#FFFFFF";ctx.globalAlpha=0.35;
        ctx.fillRect(cx-26,cy-36,8,20);
        ctx.restore();
      } else {
        // shards volando
        const f=(dt-40)/40;
        for(let i=0;i<16;i++){
          const a=(i/16)*Math.PI*2,d=f*80;
          const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d-f*30+f*f*40;
          ctx.save();ctx.translate(px,py);ctx.rotate(a+f*3);
          ctx.fillStyle="#DDEEFF";ctx.globalAlpha=Math.max(0,1-f);
          ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(4,4);ctx.lineTo(-3,3);ctx.closePath();ctx.fill();
          // sangre congelada en el shard
          ctx.fillStyle="#AA0000";
          ctx.beginPath();ctx.arc(0,0,1.2,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
      }
      break;
    }
    case"shadow":{ // Spotted — se disuelve en sombra
      const f=Math.min(1,dt/60);
      ctx.save();ctx.globalAlpha=1-f*0.85;
      drawOwl(ctx,cx,cy,true,sp,0,1);
      ctx.restore();
      // humo oscuro
      for(let i=0;i<10;i++){
        const t=(dt+i*5)*0.04;
        const px=cx+Math.sin(t+i)*15,py=cy-t*8-i*4;
        ctx.save();ctx.globalAlpha=Math.max(0,0.5-t*0.02);
        ctx.fillStyle="#2A0040";
        ctx.beginPath();ctx.arc(px,py,10+i,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      bloodSplat(ctx,cx,cy+30,10,45,2.2);
      break;
    }
    case"dust":{ // Burrowing — enterrada, solo patas sobresalen
      // montículo de tierra
      ctx.fillStyle="#6A4020";
      ctx.beginPath();ctx.ellipse(cx,cy+25,55,20,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#8A5028";
      ctx.beginPath();ctx.ellipse(cx-5,cy+18,50,15,0,0,Math.PI*2);ctx.fill();
      // patas sobresaliendo
      if(dt>15){
        ctx.strokeStyle=sp.footColor;ctx.lineWidth=3;ctx.lineCap="round";
        const wiggle=dt<50?Math.sin(dt*0.4)*3:0;
        ctx.beginPath();ctx.moveTo(cx-5,cy+10);ctx.lineTo(cx-7+wiggle,cy-5);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+5,cy+10);ctx.lineTo(cx+7-wiggle,cy-5);ctx.stroke();
        // garras arriba
        ctx.strokeStyle="#222";ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(cx-7+wiggle,cy-5);ctx.lineTo(cx-9+wiggle,cy-9);
        ctx.moveTo(cx-7+wiggle,cy-5);ctx.lineTo(cx-5+wiggle,cy-9);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+7-wiggle,cy-5);ctx.lineTo(cx+5-wiggle,cy-9);
        ctx.moveTo(cx+7-wiggle,cy-5);ctx.lineTo(cx+9-wiggle,cy-9);ctx.stroke();
      }
      // polvo subiendo al inicio
      if(dt<30){
        ctx.fillStyle=`rgba(200,160,100,${(30-dt)/30*0.8})`;
        for(let i=0;i<8;i++){const a=(i/8)*Math.PI;
          ctx.beginPath();ctx.arc(cx+Math.cos(a)*30,cy-dt+Math.sin(a)*10,5+dt*0.3,0,Math.PI*2);ctx.fill();}
      }
      // sangre manchando la tierra
      ctx.fillStyle="#6A0000";
      ctx.beginPath();ctx.ellipse(cx+10,cy+22,8,4,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(cx-15,cy+28,6,3,0,0,Math.PI*2);ctx.fill();
      break;
    }
    case"sonic":{ // Screech — explota en ondas de sonido + sangre
      if(dt<25){
        drawOwl(ctx,cx,cy,true,sp,0,1);
        // vibrando
        ctx.save();ctx.translate(cx,cy);
        for(let i=0;i<3;i++){
          ctx.globalAlpha=(1-i/3)*0.6;
          ctx.strokeStyle="#FF44CC";ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(0,0,20+i*8+dt,0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
      } else {
        // explotado — pedazos volando
        const f=(dt-25)/50;
        for(let i=0;i<12;i++){
          const a=(i/12)*Math.PI*2,d=f*100;
          const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d+f*f*40;
          ctx.save();ctx.translate(px,py);ctx.rotate(a+f*4);
          ctx.fillStyle=sp.bodyColor;
          ctx.beginPath();ctx.ellipse(0,0,4,6,0,0,Math.PI*2);ctx.fill();
          ctx.fillStyle="#8A0000";
          ctx.beginPath();ctx.arc(1,1,2,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
        bloodSpray(ctx,cx,cy,0,40,6);
        bloodSpray(ctx,cx,cy,Math.PI,40,6);
        bloodSpray(ctx,cx,cy,Math.PI/2,40,6);
        bloodSpray(ctx,cx,cy,-Math.PI/2,40,6);
      }
      break;
    }
    case"flurry":{ // Elf — nubecita de plumas + sangre
      if(dt<18){
        drawOwl(ctx,cx,cy,true,sp,0,1-dt/18);
      }
      // poof cloud
      const f=Math.min(1,dt/40);
      ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=1-f;
      ctx.fillStyle="#FFF";
      for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2,r=f*25+5;
        ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,6,0,Math.PI*2);ctx.fill();}
      ctx.restore();
      // plumas pequeñas + sangre
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2;
        const px=cx+Math.cos(a)*(dt*1.5),py=cy+Math.sin(a)*(dt*1.5)+dt*0.5;
        ctx.save();ctx.translate(px,py);ctx.rotate(a+dt*0.05);
        ctx.fillStyle=sp.bodyColor;
        ctx.beginPath();ctx.ellipse(0,0,2,5,0,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
      bloodSplat(ctx,cx,cy,8,30,1.8);
      break;
    }
    case"spin":{ // Barred — espiral al suelo, sangre en espiral
      if(dt<50){
        ctx.save();ctx.translate(cx,cy);ctx.rotate(dt*0.3);
        const sq=Math.max(0.3,1-dt/50);
        ctx.scale(sq,sq);
        drawOwl(ctx,0,0,true,sp,0,1);
        ctx.restore();
      }
      // espiral de sangre en el suelo
      ctx.save();ctx.translate(cx,cy+20);
      ctx.strokeStyle="#8A0000";ctx.lineWidth=3;ctx.lineCap="round";
      ctx.beginPath();
      for(let t=0;t<Math.min(dt*0.15,8);t+=0.1){
        const r=t*3,a=t;
        ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.4);
      }
      ctx.stroke();
      ctx.strokeStyle="#C00000";ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let t=0;t<Math.min(dt*0.15,8);t+=0.1){
        const r=t*3+1.5,a=t+0.3;
        ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*0.4);
      }
      ctx.stroke();
      ctx.restore();
      if(dt>50) bloodSplat(ctx,cx,cy+15,8,30,2);
      break;
    }
    case"fire":{ // Tawny — quemada a carbón
      const burn=Math.min(1,dt/40);
      ctx.save();
      // body fade to black
      ctx.globalAlpha=1;
      const burnedSp=Object.assign({},sp,{
        bodyColor:lerpColor(sp.bodyColor,"#1A1008",burn),
        wingColor:lerpColor(sp.wingColor,"#0A0404",burn),
        faceColor:lerpColor(sp.faceColor,"#2A1810",burn),
        irisColor:lerpColor(sp.irisColor,"#400000",burn)
      });
      drawOwl(ctx,cx,cy,true,burnedSp,0,1);
      ctx.restore();
      // llamas
      if(dt<50){
        for(let i=0;i<6;i++){
          const a=(i/6)*Math.PI*2,flick=Math.sin(dt*0.3+i)*4;
          const fx=cx+Math.cos(a)*15,fy=cy+Math.sin(a)*15-dt*0.3;
          const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,10);
          fg.addColorStop(0,"#FFEE00");fg.addColorStop(0.5,"#FF6600");fg.addColorStop(1,"rgba(200,0,0,0)");
          ctx.fillStyle=fg;
          ctx.beginPath();ctx.arc(fx,fy+flick,10,0,Math.PI*2);ctx.fill();
        }
      }
      // humo
      if(dt>40){
        for(let i=0;i<5;i++){
          const smY=cy-30-i*15-dt*0.5;
          ctx.fillStyle=`rgba(60,60,60,${Math.max(0,0.5-i*0.08)})`;
          ctx.beginPath();ctx.arc(cx+Math.sin(dt*0.05+i)*6,smY,8+i*3,0,Math.PI*2);ctx.fill();
        }
      }
      // cenizas con sangre seca
      ctx.fillStyle="#4A0808";
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;
        ctx.beginPath();ctx.arc(cx+Math.cos(a)*25,cy+Math.sin(a)*25+dt*0.3,1.5,0,Math.PI*2);ctx.fill();}
      break;
    }
    case"boomerang":{ // Long-eared — decapitada, cabeza rodando
      // cuerpo sin cabeza
      ctx.save();ctx.translate(cx,cy);
      // sangre chorreando del cuello (antes del cuerpo para que quede detrás)
      ctx.fillStyle="#8A0000";
      ctx.beginPath();ctx.ellipse(0,-5,6,4,0,0,Math.PI*2);ctx.fill();
      bloodSpray(ctx,0,-3,-Math.PI/2,15+dt*0.3,5);
      bloodSpray(ctx,-2,-2,-Math.PI/2-0.3,12+dt*0.2,4);
      bloodSpray(ctx,2,-2,-Math.PI/2+0.3,12+dt*0.2,4);
      ctx.restore();
      // Cuerpo (sin cabeza) — simulamos recortando
      ctx.save();
      ctx.beginPath();ctx.rect(cx-30,cy-3,60,60);ctx.clip();
      drawOwl(ctx,cx,cy,true,sp,0,1);
      ctx.restore();
      // Cabeza rodando
      const hx=cx+Math.min(dt*2,80),hy=cy+30+Math.abs(Math.sin(dt*0.2))*8;
      ctx.save();ctx.translate(hx,hy);ctx.rotate(dt*0.15);
      ctx.fillStyle=sp.bodyColor;
      ctx.beginPath();ctx.arc(0,0,12,0,Math.PI*2);ctx.fill();
      // ojos X (muerto)
      ctx.strokeStyle="#FFF";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-6,-4);ctx.lineTo(-2,0);ctx.moveTo(-6,0);ctx.lineTo(-2,-4);ctx.stroke();
      ctx.beginPath();ctx.moveTo(2,-4);ctx.lineTo(6,0);ctx.moveTo(2,0);ctx.lineTo(6,-4);ctx.stroke();
      // pico
      ctx.fillStyle=sp.beakColor;
      ctx.beginPath();ctx.moveTo(-2,2);ctx.lineTo(2,2);ctx.lineTo(0,5);ctx.fill();
      // sangre del cuello de la cabeza
      ctx.fillStyle="#8A0000";
      ctx.beginPath();ctx.arc(0,8,3,0,Math.PI*2);ctx.fill();
      ctx.restore();
      break;
    }
    case"jab":{ // Little — apuñalada con daga, sangre a chorro
      drawOwl(ctx,cx,cy,true,sp,0,1);
      // daga clavada
      const stabAng=-Math.PI/4;
      ctx.save();ctx.translate(cx+3,cy-2);ctx.rotate(stabAng);
      // hoja
      ctx.fillStyle="#DDEEFF";
      ctx.beginPath();ctx.moveTo(-20,-2);ctx.lineTo(14,-2);ctx.lineTo(18,0);ctx.lineTo(14,2);ctx.lineTo(-20,2);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#6A7080";ctx.lineWidth=1;ctx.stroke();
      // sangre en la hoja
      ctx.fillStyle="#8A0000";
      ctx.beginPath();ctx.moveTo(5,-2);ctx.lineTo(15,-2);ctx.lineTo(18,0);ctx.lineTo(15,2);ctx.lineTo(5,2);ctx.closePath();ctx.fill();
      // guarda
      ctx.fillStyle="#B8860B";
      ctx.fillRect(-24,-4,4,8);
      // mango
      ctx.fillStyle="#4A2A10";
      ctx.fillRect(-34,-3,10,6);
      ctx.restore();
      // chorro de sangre
      bloodSpray(ctx,cx+3,cy-2,stabAng+Math.PI,20+dt*0.5,8);
      // gotas
      ctx.fillStyle="#8A0000";
      for(let i=0;i<6;i++){
        const t=(dt+i*10)*0.05;
        ctx.beginPath();ctx.arc(cx+i*4-10,cy+10+t*8,1.5,0,Math.PI*2);ctx.fill();
      }
      break;
    }
    case"laser":{ // Spectacled — agujero atravesado por láser
      drawOwl(ctx,cx,cy,true,sp,0,1);
      // agujero
      ctx.save();ctx.translate(cx,cy);
      ctx.fillStyle="#000";
      ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#FF0040";
      ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
      // rayo láser aún visible
      if(dt<30){
        ctx.globalAlpha=(30-dt)/30;
        const lg=ctx.createLinearGradient(-200,0,200,0);
        lg.addColorStop(0,"rgba(0,255,200,0)");lg.addColorStop(0.5,"#00FFDD");lg.addColorStop(1,"rgba(0,255,200,0)");
        ctx.strokeStyle=lg;ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(-200,0);ctx.lineTo(200,0);ctx.stroke();
        ctx.strokeStyle="#FFFFFF";ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(-200,0);ctx.lineTo(200,0);ctx.stroke();
      }
      ctx.restore();
      // sangre saliendo por ambos lados
      bloodSpray(ctx,cx-5,cy,Math.PI,15+dt*0.3,5);
      bloodSpray(ctx,cx+5,cy,0,15+dt*0.3,5);
      break;
    }
    case"drill":{ // Saw-whet — cabeza clavada en el suelo
      ctx.save();ctx.translate(cx,cy);
      // cuerpo invertido
      ctx.scale(0.9,-0.9);
      drawOwl(ctx,0,0,true,sp,0,1);
      ctx.restore();
      // "suelo" donde está clavada
      ctx.fillStyle="#3A2A18";
      ctx.beginPath();ctx.ellipse(cx,cy+30,50,8,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#5A3A20";
      ctx.beginPath();ctx.ellipse(cx,cy+27,45,6,0,0,Math.PI*2);ctx.fill();
      // grietas
      ctx.strokeStyle="#1A0808";ctx.lineWidth=1.5;
      for(let i=-2;i<=2;i++){
        ctx.beginPath();ctx.moveTo(cx+i*8,cy+28);ctx.lineTo(cx+i*12,cy+36+Math.abs(i));ctx.stroke();
      }
      // sangre en el cuello hacia arriba
      ctx.fillStyle="#8A0000";
      ctx.beginPath();ctx.ellipse(cx,cy+28,8,3,0,0,Math.PI*2);ctx.fill();
      bloodSplat(ctx,cx,cy+30,8,25,2);
      // piecitos pataleando
      if(dt<60){
        const kick=Math.sin(dt*0.3)*4;
        ctx.strokeStyle=sp.footColor;ctx.lineWidth=2.5;
        ctx.beginPath();ctx.moveTo(cx-4,cy-10);ctx.lineTo(cx-6+kick,cy-22);
        ctx.moveTo(cx+4,cy-10);ctx.lineTo(cx+6-kick,cy-22);ctx.stroke();
      }
      break;
    }
    case"star":{ // Boreal — explosión estelar con sangre
      if(dt<20){
        drawOwl(ctx,cx,cy,true,sp,0,1);
      } else {
        const f=(dt-20)/60;
        // estrella de sangre
        ctx.save();ctx.translate(cx,cy);
        ctx.fillStyle="#8A0000";
        ctx.beginPath();
        for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2,r=i%2===0?40*Math.min(1,f*2):15*Math.min(1,f*2);
          ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
        ctx.closePath();ctx.fill();
        ctx.fillStyle="#C00000";
        ctx.beginPath();
        for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+0.2,r=i%2===0?30*Math.min(1,f*2):10*Math.min(1,f*2);
          ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
        ctx.closePath();ctx.fill();
        ctx.restore();
        // plumas volando
        for(let i=0;i<10;i++){
          const a=(i/10)*Math.PI*2,d=f*70;
          const px=cx+Math.cos(a)*d,py=cy+Math.sin(a)*d;
          ctx.save();ctx.translate(px,py);ctx.rotate(a);
          ctx.fillStyle=sp.bodyColor;
          ctx.beginPath();ctx.ellipse(0,0,3,6,0,0,Math.PI*2);ctx.fill();
          ctx.restore();
        }
      }
      break;
    }
    default:{
      drawOwl(ctx,cx,cy,true,sp,0,0.7);
      bloodSplat(ctx,cx,cy+30,10,40,2.5);
    }
  }
  ctx.restore();
}

function lerpColor(h1,h2,t){
  const a=parseInt(h1.slice(1),16),b=parseInt(h2.slice(1),16);
  const r=Math.round(lerp((a>>16)&255,(b>>16)&255,t));
  const g=Math.round(lerp((a>>8)&255,(b>>8)&255,t));
  const bl=Math.round(lerp(a&255,b&255,t));
  return "#"+((r<<16)|(g<<8)|bl).toString(16).padStart(6,"0");
}

// ============================================================
//  DIBUJO PIZZA
// ============================================================
function drawPizza(ctx,cx,cy,sc,t){
  ctx.save();
  const pulse=1+Math.sin(t*0.08)*0.025;
  ctx.translate(cx,cy);
  // Sombra bajo la pizza
  ctx.save();ctx.globalAlpha=0.35;ctx.fillStyle="#000";
  ctx.beginPath();ctx.ellipse(2,24*sc,24*sc,5*sc,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.scale(sc*pulse,sc*pulse);

  // === ORILLA (crust con borde irregular y textura) ===
  // Sombra exterior
  ctx.fillStyle="#6A3A18";
  ctx.beginPath();
  for(let i=0;i<=48;i++){const a=(i/48)*Math.PI*2,r=23.4+Math.sin(a*7+1.3)*0.8+Math.sin(a*13+2.1)*0.4;
    const px=Math.cos(a)*r,py=Math.sin(a)*r+0.6;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.closePath();ctx.fill();
  // Crust cocido (gradiente radial)
  const crustG=ctx.createRadialGradient(-4,-4,8,0,0,23);
  crustG.addColorStop(0,"#F0C080");
  crustG.addColorStop(0.55,"#D89A5A");
  crustG.addColorStop(1,"#8A5020");
  ctx.fillStyle=crustG;
  ctx.beginPath();
  for(let i=0;i<=48;i++){const a=(i/48)*Math.PI*2,r=23+Math.sin(a*7+1.3)*0.9+Math.sin(a*13+2.1)*0.4;
    const px=Math.cos(a)*r,py=Math.sin(a)*r;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.closePath();ctx.fill();
  // Burbujas doradas del horno en la orilla
  ctx.fillStyle="#A06028";
  for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2,r=21.5;
    ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,0.9,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle="#FFE8B0";
  for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+0.4,r=20;
    ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r-0.5,1.1,0,Math.PI*2);ctx.fill();}
  // Quemaduras oscuras sutiles
  ctx.fillStyle="rgba(40,20,0,0.35)";
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2+1.2;
    ctx.beginPath();ctx.ellipse(Math.cos(a)*22,Math.sin(a)*22,1.6,0.9,a,0,Math.PI*2);ctx.fill();}

  // === QUESO DERRETIDO en la orilla rellena ===
  const stuffedG=ctx.createRadialGradient(-2,-2,4,0,0,20);
  stuffedG.addColorStop(0,"#FFE070");
  stuffedG.addColorStop(0.7,"#F5C842");
  stuffedG.addColorStop(1,"#C89020");
  ctx.fillStyle=stuffedG;
  ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
  // Chorros de queso saliendo de la orilla
  ctx.fillStyle="#FFD860";
  for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+t*0.004;
    const r1=19.2+Math.sin(a*3+t*0.02)*0.8;
    ctx.beginPath();ctx.ellipse(Math.cos(a)*r1,Math.sin(a)*r1,1.8,1.2,a,0,Math.PI*2);ctx.fill();}

  // === SALSA (forma orgánica, no círculo perfecto) ===
  ctx.fillStyle="#6A180F";
  ctx.beginPath();
  for(let i=0;i<=40;i++){const a=(i/40)*Math.PI*2,r=16.5+Math.sin(a*5+0.6)*1.0+Math.sin(a*9)*0.5;
    const px=Math.cos(a)*r,py=Math.sin(a)*r;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.closePath();ctx.fill();
  // Salsa capa principal
  const sauceG=ctx.createRadialGradient(-3,-3,2,0,0,16);
  sauceG.addColorStop(0,"#D84830");
  sauceG.addColorStop(0.7,"#B83020");
  sauceG.addColorStop(1,"#8A1810");
  ctx.fillStyle=sauceG;
  ctx.beginPath();
  for(let i=0;i<=40;i++){const a=(i/40)*Math.PI*2,r=15.8+Math.sin(a*5+0.6)*1.0+Math.sin(a*9)*0.4;
    const px=Math.cos(a)*r,py=Math.sin(a)*r;
    i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
  ctx.closePath();ctx.fill();
  // Hierbas (orégano / albahaca)
  const herbs=[[-8,-3],[6,-7],[9,5],[-4,8],[-10,2],[2,10],[11,-2],[-6,-8],[4,-4],[-1,4]];
  ctx.fillStyle="#2D5A1A";
  for(const[hx,hy]of herbs){
    ctx.save();ctx.translate(hx,hy);ctx.rotate(hx*hy);
    ctx.beginPath();ctx.ellipse(0,0,1.2,0.5,0,0,Math.PI*2);ctx.fill();
    ctx.restore();}
  ctx.fillStyle="#4A8028";
  for(const[hx,hy]of herbs){
    ctx.beginPath();ctx.arc(hx+0.3,hy-0.3,0.4,0,Math.PI*2);ctx.fill();}

  // === QUESO DERRETIDO sobre la salsa (parches irregulares) ===
  const cheeseSpots=[
    {x:-5,y:-5,r:6.5},{x:4,y:-6,r:5.5},{x:7,y:4,r:5.8},
    {x:-8,y:3,r:5.2},{x:-3,y:8,r:4.8},{x:2,y:2,r:3.6},
    {x:-10,y:-1,r:3.2},{x:9,y:-1,r:3.8},{x:0,y:-10,r:3.4}
  ];
  // Sombra del queso
  ctx.fillStyle="rgba(200,150,30,0.5)";
  for(const s of cheeseSpots){ctx.beginPath();ctx.ellipse(s.x+0.6,s.y+0.8,s.r,s.r*0.85,0,0,Math.PI*2);ctx.fill();}
  // Queso (irregular, derretido)
  for(const s of cheeseSpots){
    const cg=ctx.createRadialGradient(s.x-1,s.y-1,0.5,s.x,s.y,s.r);
    cg.addColorStop(0,"#FFF4A0");
    cg.addColorStop(0.7,"#F5DE50");
    cg.addColorStop(1,"#D8A020");
    ctx.fillStyle=cg;
    ctx.beginPath();
    // forma orgánica
    for(let i=0;i<=18;i++){const a=(i/18)*Math.PI*2,r=s.r*(0.85+Math.sin(a*4+s.x)*0.15);
      const px=s.x+Math.cos(a)*r,py=s.y+Math.sin(a)*r;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}
    ctx.closePath();ctx.fill();
  }
  // Brillo del queso derretido
  ctx.globalAlpha=0.55;ctx.fillStyle="#FFFBCC";
  for(const s of cheeseSpots){ctx.beginPath();ctx.ellipse(s.x-s.r*0.4,s.y-s.r*0.4,s.r*0.35,s.r*0.2,0,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;
  // Huecos por donde asoma la salsa
  ctx.fillStyle="rgba(180,48,32,0.65)";
  for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+t*0.01,r=11;
    ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,0.9,0,Math.PI*2);ctx.fill();}

  // === PEPERONI (con curvatura, aceite, textura) ===
  const pp=[
    [11*Math.cos(0.4),11*Math.sin(0.4)],
    [11*Math.cos(2.3),11*Math.sin(2.3)],
    [11*Math.cos(4.2),11*Math.sin(4.2)],
    [5*Math.cos(1.2),5*Math.sin(1.2)],
    [5*Math.cos(3.4),5*Math.sin(3.4)],
    [5*Math.cos(5.5),5*Math.sin(5.5)]
  ];
  for(const[px,py]of pp){
    // Sombra del peperoni
    ctx.fillStyle="rgba(60,10,10,0.55)";
    ctx.beginPath();ctx.ellipse(px+0.8,py+1.1,4.6,4.2,0,0,Math.PI*2);ctx.fill();
    // Borde oscuro caramelizado
    ctx.fillStyle="#5A0A0A";
    ctx.beginPath();ctx.arc(px,py,4.6,0,Math.PI*2);ctx.fill();
    // Base roja con gradiente
    const pepG=ctx.createRadialGradient(px-1,py-1.5,0.5,px,py,4.3);
    pepG.addColorStop(0,"#E8403A");
    pepG.addColorStop(0.6,"#B8201A");
    pepG.addColorStop(1,"#8A1008");
    ctx.fillStyle=pepG;
    ctx.beginPath();ctx.arc(px,py,4.3,0,Math.PI*2);ctx.fill();
    // Textura moteada (granos del embutido)
    ctx.fillStyle="#6A0A0A";
    for(let i=0;i<5;i++){
      const ang=i*1.7+px,rr=1+Math.sin(i*2.3)*1.2;
      ctx.beginPath();ctx.arc(px+Math.cos(ang)*rr,py+Math.sin(ang)*rr,0.4,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle="#C85040";
    for(let i=0;i<3;i++){
      const ang=i*2.1+py,rr=1.8;
      ctx.beginPath();ctx.arc(px+Math.cos(ang)*rr,py+Math.sin(ang)*rr,0.3,0,Math.PI*2);ctx.fill();}
    // Aceite/grasa brillante (media luna superior)
    ctx.globalAlpha=0.55;ctx.fillStyle="#FFB080";
    ctx.beginPath();ctx.ellipse(px-1,py-1.4,2.2,1.1,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=0.8;ctx.fillStyle="#FFE8C8";
    ctx.beginPath();ctx.ellipse(px-1.3,py-1.7,0.9,0.5,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }

  // === VAPOR (subiendo desde la pizza) ===
  ctx.globalAlpha=0.35;
  for(let i=0;i<3;i++){
    const sx=(i-1)*6,sy=-20-Math.sin(t*0.05+i*2)*4;
    const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,5);
    sg.addColorStop(0,"rgba(255,255,255,0.7)");sg.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=sg;
    ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  // === HILOS DE QUESO ESTIRADO (desde el borde hacia afuera, sutiles) ===
  ctx.strokeStyle="rgba(245,222,80,0.75)";ctx.lineWidth=0.9;ctx.lineCap="round";
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2+0.7+t*0.003;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*8,Math.sin(a)*8);
    ctx.quadraticCurveTo(Math.cos(a)*15,Math.sin(a)*15+Math.sin(t*0.1+i)*1.5,Math.cos(a)*19,Math.sin(a)*19);
    ctx.stroke();}

  // Brillo general sutil en la parte superior
  ctx.globalAlpha=0.15;
  const topG=ctx.createLinearGradient(0,-22,0,0);
  topG.addColorStop(0,"#FFF");topG.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=topG;
  ctx.beginPath();ctx.arc(0,0,22,Math.PI,0);ctx.fill();
  ctx.globalAlpha=1;

  ctx.restore();
}

// ============================================================
//  ATAQUES ÚNICOS POR ESPECIE
// ============================================================
function drawSpeciesAttack(ctx,x,y,angle,style,progress,c1,c2){
  // progress: 0..1  (0 = recién impactó, 1 = desvanecido)
  const fade=1-progress;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.lineCap="round";ctx.lineJoin="round";
  switch(style){
    case"silent": { // Barn Owl — pluma fantasma con 3 zarpazos suaves
      ctx.globalAlpha=fade*0.85;
      const expand=18+progress*14;
      ctx.strokeStyle=c1;ctx.lineWidth=2;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.arc(0,0,expand+i*4,-0.5,0.5);ctx.stroke();}
      // plumón blanco
      ctx.fillStyle=c2;ctx.globalAlpha=fade*0.6;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.ellipse(Math.cos(a)*(10+progress*18),Math.sin(a)*(10+progress*18),3,1.4,a,0,Math.PI*2);ctx.fill();}
      break;
    }
    case"power": { // Great Horned — impacto explosivo con rayos
      ctx.globalAlpha=fade;
      // flash central
      const rad=10+progress*28;
      const grd=ctx.createRadialGradient(0,0,2,0,0,rad);
      grd.addColorStop(0,c1);grd.addColorStop(0.5,c2);grd.addColorStop(1,"transparent");
      ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,0,rad,0,Math.PI*2);ctx.fill();
      // rayos
      ctx.strokeStyle=c1;ctx.lineWidth=3;
      for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*6,Math.sin(a)*6);ctx.lineTo(Math.cos(a)*(22+progress*10),Math.sin(a)*(22+progress*10));ctx.stroke();}
      break;
    }
    case"ice": { // Snowy — copos y cristales
      ctx.globalAlpha=fade;
      ctx.strokeStyle=c1;ctx.lineWidth=2.5;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r=8+progress*20;
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
        // sub-ramas copo
        ctx.beginPath();ctx.moveTo(Math.cos(a)*r*0.6,Math.sin(a)*r*0.6);
        ctx.lineTo(Math.cos(a)*r*0.6+Math.cos(a+1.2)*4,Math.sin(a)*r*0.6+Math.sin(a+1.2)*4);ctx.stroke();
      }
      ctx.fillStyle=c2;for(let i=0;i<5;i++){const a=Math.random()*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*(progress*22),Math.sin(a)*(progress*22),2,0,Math.PI*2);ctx.fill();}
      break;
    }
    case"shadow": { // Spotted — grieta oscura con runas
      ctx.globalAlpha=fade*0.95;
      ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(0,0,22+progress*10,8-progress*4,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=c1;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-10,-4);ctx.lineTo(-2,3);ctx.lineTo(8,-5);ctx.lineTo(20,2);ctx.stroke();
      // humos
      ctx.fillStyle=c1;for(let i=-2;i<=2;i++){ctx.globalAlpha=fade*0.5;ctx.beginPath();ctx.arc(i*8,-6-progress*10,3,0,Math.PI*2);ctx.fill();}
      break;
    }
    case"dust": { // Burrowing — arena levantándose
      ctx.globalAlpha=fade*0.8;
      ctx.fillStyle=c1;
      for(let i=0;i<10;i++){const a=-Math.PI+Math.random()*Math.PI,r=8+progress*20;
        ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r-progress*8,2.5,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle=c2;ctx.lineWidth=3;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-16+i*5,4);ctx.quadraticCurveTo(0,-8,16+i*5,4);ctx.stroke();}
      break;
    }
    case"sonic": { // Screech — ondas de sonido concéntricas
      ctx.globalAlpha=fade*0.9;
      ctx.strokeStyle=c1;ctx.lineWidth=3;
      for(let i=0;i<3;i++){const r=6+progress*26+i*6;ctx.globalAlpha=fade*(0.9-i*0.25);
        ctx.beginPath();ctx.arc(0,0,r,-1.0,1.0);ctx.stroke();}
      ctx.strokeStyle=c2;ctx.lineWidth=1.5;
      for(let i=0;i<3;i++){const r=4+progress*20+i*6;
        ctx.beginPath();ctx.arc(0,0,r,Math.PI-1.0,Math.PI+1.0);ctx.stroke();}
      break;
    }
    case"flurry": { // Elf — ráfaga de mini zarpazos
      ctx.globalAlpha=fade;
      ctx.strokeStyle=c1;ctx.lineWidth=2;
      for(let i=0;i<7;i++){const a=(i/7)*Math.PI*2+progress*2;
        const cx=Math.cos(a)*12,cy=Math.sin(a)*12;
        ctx.beginPath();ctx.moveTo(cx-3,cy-3);ctx.lineTo(cx+3,cy+3);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+3,cy-3);ctx.lineTo(cx-3,cy+3);ctx.stroke();}
      ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,0,4-progress*3,0,Math.PI*2);ctx.fill();
      break;
    }
    case"spin": { // Barred — torbellino en espiral
      ctx.globalAlpha=fade*0.9;
      ctx.rotate(progress*4);
      ctx.strokeStyle=c1;ctx.lineWidth=3;
      ctx.beginPath();
      for(let t=0;t<6;t+=0.1){const r=t*3.2,a=t;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.stroke();
      ctx.strokeStyle=c2;ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let t=0;t<6;t+=0.1){const r=t*3.2+2,a=t+0.4;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.stroke();
      break;
    }
    case"fire": { // Tawny — lenguas de fuego
      ctx.globalAlpha=fade;
      ctx.fillStyle=c1;
      for(let i=-2;i<=2;i++){const a=i*0.4,h=22+progress*14;
        ctx.beginPath();ctx.moveTo(Math.cos(a)*6,Math.sin(a)*6);
        ctx.quadraticCurveTo(Math.cos(a)*h*0.5-Math.sin(a)*6,Math.sin(a)*h*0.5+Math.cos(a)*6,Math.cos(a)*h,Math.sin(a)*h);
        ctx.quadraticCurveTo(Math.cos(a)*h*0.5+Math.sin(a)*6,Math.sin(a)*h*0.5-Math.cos(a)*6,0,0);ctx.fill();}
      ctx.fillStyle=c2;ctx.globalAlpha=fade*0.7;
      ctx.beginPath();ctx.arc(0,0,8-progress*4,0,Math.PI*2);ctx.fill();
      break;
    }
    case"boomerang": { // Long-eared — arco giratorio
      ctx.globalAlpha=fade;
      ctx.rotate(progress*3);
      ctx.strokeStyle=c1;ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(0,0,16+progress*6,-Math.PI*0.7,Math.PI*0.7);ctx.stroke();
      ctx.strokeStyle=c2;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(0,0,14+progress*6,-Math.PI*0.7,Math.PI*0.7);ctx.stroke();
      // puntas
      ctx.fillStyle=c1;
      ctx.beginPath();ctx.arc(Math.cos(Math.PI*0.7)*16,Math.sin(Math.PI*0.7)*16,3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(Math.cos(-Math.PI*0.7)*16,Math.sin(-Math.PI*0.7)*16,3,0,Math.PI*2);ctx.fill();
      break;
    }
    case"jab": { // Little — picotazo triangular
      ctx.globalAlpha=fade;
      ctx.fillStyle=c1;
      ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(20+progress*8,0);ctx.lineTo(-4,8);ctx.closePath();ctx.fill();
      ctx.fillStyle=c2;
      ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(14+progress*6,0);ctx.lineTo(0,4);ctx.closePath();ctx.fill();
      // chispa
      ctx.strokeStyle=c2;ctx.lineWidth=2;
      for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*(18+progress*6),Math.sin(a)*(18+progress*6));ctx.lineTo(Math.cos(a)*(24+progress*6),Math.sin(a)*(24+progress*6));ctx.stroke();}
      break;
    }
    case"laser": { // Spectacled — rayo óptico
      ctx.globalAlpha=fade;
      // rayo
      const grd=ctx.createLinearGradient(-30,0,30,0);
      grd.addColorStop(0,"transparent");grd.addColorStop(0.5,c1);grd.addColorStop(1,"transparent");
      ctx.strokeStyle=grd;ctx.lineWidth=5;
      ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30+progress*10,0);ctx.stroke();
      ctx.strokeStyle=c2;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(30+progress*10,0);ctx.stroke();
      // impacto X
      ctx.strokeStyle=c1;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(8,8);ctx.moveTo(-8,8);ctx.lineTo(8,-8);ctx.stroke();
      break;
    }
    case"drill": { // Saw-whet — taladro rotatorio
      ctx.globalAlpha=fade;
      ctx.rotate(progress*8);
      ctx.fillStyle=c1;
      for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*(18+progress*8),Math.sin(a)*(18+progress*8));
        ctx.lineTo(Math.cos(a+0.6)*8,Math.sin(a+0.6)*8);ctx.closePath();ctx.fill();}
      ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,0,6-progress*3,0,Math.PI*2);ctx.fill();
      break;
    }
    case"star": { // Boreal — explosión estelar
      ctx.globalAlpha=fade;
      ctx.fillStyle=c1;
      ctx.beginPath();
      for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2,r=i%2===0?22+progress*8:8;
        ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.closePath();ctx.fill();
      ctx.fillStyle=c2;
      ctx.beginPath();
      for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+0.3,r=i%2===0?14:5;
        ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}
      ctx.closePath();ctx.fill();
      // chispitas
      ctx.fillStyle=c1;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2+progress*2;
        ctx.beginPath();ctx.arc(Math.cos(a)*(24+progress*10),Math.sin(a)*(24+progress*10),1.8,0,Math.PI*2);ctx.fill();}
      break;
    }
    default: { // fallback: 3 zarpazos clásicos
      ctx.globalAlpha=fade*0.9;ctx.strokeStyle=c1||"#FFE040";ctx.lineWidth=3;
      for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-18+i*7,-12);ctx.lineTo(18+i*7,12);ctx.stroke();}
    }
  }
  ctx.restore();
}
