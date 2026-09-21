const W=1200,H=520,GROUND=410;

// Canvas runner adapted from the supplied Dino Runner's logical-resolution approach.
export class DinoGame {
  constructor(canvas, sound, events){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.sound=sound;this.events=events;
    this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=W*this.dpr;this.canvas.height=H*this.dpr;this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.best=+localStorage.getItem('dinoQuestBest')||0;this.raf=0;this.last=0;this.reset();
  }
  reset(){this.state='ready';this.score=0;this.lives=3;this.level=1;this.quests=0;this.speed=7;this.distance=0;this.quizAt=720;this.nextObstacle=300;this.obstacles=[];this.powers=[];this.particles=[];this.clouds=Array.from({length:7},(_,i)=>({x:i*210+Math.random()*100,y:50+Math.random()*110,s:.45+Math.random()*.65}));this.stars=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*270,r:Math.random()*1.7}));this.dino={x:150,y:GROUND-66,w:56,h:66,vy:0,duck:false,onGround:true,trail:0,shield:0};this.flash=0;this.send();}
  start(){if(this.state==='playing')return;this.state='playing';this.last=performance.now();cancelAnimationFrame(this.raf);this.loop(this.last)}
  pause(){if(this.state==='playing'){this.state='paused';cancelAnimationFrame(this.raf)}}
  resume(){if(this.state==='paused')this.start()}
  jump(){if(this.state!=='playing')return;if(this.dino.onGround){this.dino.vy=-17;this.dino.onGround=false;this.dino.duck=false;this.sound.jump();this.burst(this.dino.x+20,GROUND,8,'#9be9db')}}
  duck(on){if(this.state==='playing'&&this.dino.onGround)this.dino.duck=on}
  beginQuiz(){if(this.state!=='playing')return;this.state='quiz';cancelAnimationFrame(this.raf);this.events.quiz(this.level)}
  answer(correct){if(this.state!=='quiz')return;if(correct){this.score+=100+this.level*25;this.quests++;if(this.quests%3===0){this.level++;this.speed+=.75;this.sound.level();this.events.notice(`Level ${this.level} unlocked!`)}else this.sound.correct();this.events.success();}else{this.lives--;this.sound.wrong();this.events.notice('One heart lost');if(this.lives<=0){this.end(false);return;}}this.quizAt=this.distance+Math.max(670,930-this.level*40);this.state='playing';this.send();this.start()}
  end(won=false){this.state='over';cancelAnimationFrame(this.raf);this.best=Math.max(this.best,Math.floor(this.score));localStorage.setItem('dinoQuestBest',this.best);this.events.over(won)}
  send(){this.events.update({score:Math.floor(this.score),best:this.best,lives:this.lives,level:this.level,quests:this.quests,progress:(this.distance%this.quizAt)/Math.max(this.quizAt,1)});}
  loop(t){const dt=Math.min(2,(t-this.last)/16.67||1);this.last=t;this.update(dt);this.draw();if(this.state==='playing')this.raf=requestAnimationFrame(x=>this.loop(x));}
  update(dt){
    this.distance+=this.speed*dt;this.score+=.16*this.speed*dt;this.flash=Math.max(0,this.flash-dt*.04);
    const d=this.dino;d.vy+=.82*dt;d.y+=d.vy*dt;if(d.y>=GROUND-(d.duck?42:66)){d.y=GROUND-(d.duck?42:66);d.vy=0;d.onGround=true}d.trail+=dt;d.shield=Math.max(0,d.shield-dt);
    if(this.distance>=this.nextObstacle){this.spawnObstacle();this.nextObstacle=this.distance+Math.max(190,360-this.level*18)+Math.random()*170}
    if(this.level>=2&&Math.random()<.0022*dt&&this.powers.length<1)this.spawnPower();
    for(const o of this.obstacles)o.x-=this.speed*dt;for(const p of this.powers){p.x-=this.speed*dt;p.spin+=.15*dt}this.obstacles=this.obstacles.filter(o=>o.x+o.w>-30);this.powers=this.powers.filter(p=>p.x>-30);
    const box={x:d.x+7,y:d.y+6,w:d.w-15,h:d.duck?35:d.h-10};
    for(const o of this.obstacles)if(hit(box,o)){if(d.shield>0){o.x=-100;this.burst(o.x+o.w,o.y,17,'#ffd166');continue;}this.crash();return;}
    for(const p of this.powers)if(hit(box,{x:p.x,y:p.y,w:30,h:30})){p.x=-100;d.shield=420;this.score+=50;this.sound.power();this.burst(p.x+15,p.y,18,'#ffd166');this.events.notice('Star shield!');}
    for(const q of this.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=.09*dt;q.life-=dt}this.particles=this.particles.filter(q=>q.life>0);
    if(Math.floor(this.distance)%15===0)this.send();if(this.distance>=this.quizAt)this.beginQuiz();
  }
  spawnObstacle(){const type=this.level>=3&&Math.random()<.35?'bird':this.level>=2&&Math.random()<.4?'double':'rock';let o={x:W+30,type};if(type==='bird')Object.assign(o,{y:GROUND-130-Math.random()*45,w:54,h:30});else if(type==='double')Object.assign(o,{y:GROUND-48,w:76,h:48});else Object.assign(o,{y:GROUND-55,w:32+Math.random()*22,h:55});this.obstacles.push(o)}
  spawnPower(){this.powers.push({x:W+20,y:190+Math.random()*125,spin:0})}
  crash(){this.lives--;this.sound.hit();this.flash=1;this.burst(this.dino.x+30,this.dino.y+30,22,'#ff7182');this.obstacles=[];this.nextObstacle=this.distance+330;if(this.lives<=0){this.end(false);return;}this.send();this.events.notice('Ouch! Keep going.')}
  burst(x,y,n,color){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*4;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:18+Math.random()*22,color,size:2+Math.random()*4})}}
  draw(){const c=this.ctx;c.clearRect(0,0,W,H);this.sky(c);this.mountains(c);this.ground(c);for(const p of this.powers)this.drawPower(c,p);for(const o of this.obstacles)this.drawObstacle(c,o);this.drawDino(c);for(const q of this.particles){c.globalAlpha=Math.min(1,q.life/20);c.fillStyle=q.color;c.fillRect(q.x,q.y,q.size,q.size)}c.globalAlpha=1;if(this.flash){c.fillStyle=`rgba(255,80,110,${this.flash*.18})`;c.fillRect(0,0,W,H)}}
  sky(c){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#101e4b');g.addColorStop(.65,'#213b6a');g.addColorStop(1,'#4b5a76');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#d9f5ff';for(const s of this.stars){c.globalAlpha=.25+s.r*.18;c.fillRect(s.x,s.y,s.r,s.r)}c.globalAlpha=1;c.fillStyle='#ffdb87';c.beginPath();c.arc(960,104,47,0,Math.PI*2);c.fill();for(const cl of this.clouds){let x=(cl.x-this.distance*.14*cl.s)%(W+160);if(x<-120)x+=W+180;c.fillStyle='#b9d2ed22';c.beginPath();c.ellipse(x,cl.y,58*cl.s,17*cl.s,0,0,7);c.ellipse(x+34*cl.s,cl.y-8,43*cl.s,19*cl.s,0,0,7);c.fill()}}
  mountains(c){const shift=(this.distance*.27)%420;c.fillStyle='#182c52';for(let x=-420-shift;x<W+420;x+=420){c.beginPath();c.moveTo(x,GROUND);c.lineTo(x+170,190);c.lineTo(x+320,GROUND);c.fill()}c.fillStyle='#263c62';const s=(this.distance*.47)%290;for(let x=-290-s;x<W+290;x+=290){c.beginPath();c.moveTo(x,GROUND);c.lineTo(x+125,265);c.lineTo(x+250,GROUND);c.fill()}}
  ground(c){c.fillStyle='#17223a';c.fillRect(0,GROUND,W,H-GROUND);c.fillStyle='#4ae6d1';c.fillRect(0,GROUND, W,3);c.fillStyle='#425474';const off=(this.distance*1.3)%54;for(let x=-off;x<W;x+=54)c.fillRect(x,GROUND+30,30,3);c.fillStyle='#2e4266';for(let x=(this.distance*.75)%75-75;x<W;x+=75)c.fillRect(x,GROUND+75,48,3)}
  drawDino(c){const d=this.dino;const bob=d.onGround?Math.sin(this.distance*.5)*1.5:0;c.save();c.translate(d.x,d.y+bob);if(d.shield>0){c.strokeStyle='#ffd166';c.lineWidth=3;c.globalAlpha=.45+Math.sin(this.distance*.4)*.2;c.beginPath();c.arc(28,28,43,0,Math.PI*2);c.stroke();c.globalAlpha=1}c.fillStyle='#4ae6d1';if(d.duck){c.fillRect(3,13,53,29);c.fillRect(42,3,22,30);c.fillStyle='#0d2940';c.fillRect(55,10,4,4);c.fillStyle='#4ae6d1';c.fillRect(12,39,8,8);c.fillRect(39,39,8,8)}else{c.fillRect(0,14,37,37);c.fillRect(27,0,30,38);c.fillRect(48,9,11,18);c.fillRect(7,47,9,19);c.fillRect(29,47,9,19);c.fillStyle='#0d2940';c.fillRect(45,10,5,5);c.fillRect(51,26,14,6);c.fillStyle='#60f1db';c.fillRect(0,27,9,8)}c.restore()}
  drawObstacle(c,o){c.save();if(o.type==='bird'){c.fillStyle='#ff8793';c.translate(o.x,o.y);c.beginPath();c.moveTo(0,15);c.lineTo(18,0);c.lineTo(26,14);c.lineTo(42,3);c.lineTo(54,18);c.lineTo(27,27);c.closePath();c.fill();c.fillStyle='#19233c';c.fillRect(39,13,4,4)}else{c.fillStyle=o.type==='double'?'#a47dff':'#ff8d75';c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle='#d7b0ff';c.fillRect(o.x+7,o.y+10,7,11);if(o.type==='double')c.fillRect(o.x+o.w-20,o.y-27,16,27)}c.restore()}
  drawPower(c,p){c.save();c.translate(p.x+15,p.y+15);c.rotate(p.spin);c.fillStyle='#ffd166';c.beginPath();for(let i=0;i<10;i++){const r=i%2?7:15,a=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.fill();c.restore()}
}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
