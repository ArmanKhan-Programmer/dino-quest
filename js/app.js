import { DinoGame } from './game.js';
import { Sound } from './sound.js';
import { questionFor } from '../data/questions.js';

const $=id=>document.getElementById(id), sound=new Sound();
let used=new Set(),question=null,noticeTimer;
const ui={score:$('score'),best:$('high-score'),lives:$('lives'),level:$('level'),progress:$('progress-bar'),progressText:$('progress-text'),start:$('start-screen'),quiz:$('quiz-screen'),pause:$('pause-screen'),over:$('gameover-screen')};
const game=new DinoGame($('game-canvas'),sound,{
 update:s=>{ui.score.textContent=String(s.score).padStart(4,'0');ui.best.textContent=String(Math.max(s.best,s.score)).padStart(4,'0');ui.lives.textContent='♥ '.repeat(s.lives).trim()||'—';ui.level.textContent=s.level;ui.progress.style.width=`${Math.min(100,(s.quests%3)/3*100)}%`;ui.progressText.textContent=`${s.quests%3} / 3 quests`;},
 quiz:level=>showQuiz(level),success:()=>{},notice:msg=>toast(msg),over:won=>showOver(won)
});
function play(){sound.wake();ui.start.classList.add('hidden');ui.over.classList.add('hidden');game.start()}
function newGame(){used.clear();game.reset();play()}
function showQuiz(level){question=questionFor(level,used);used.add(question.q);$('quiz-topic').textContent=`${question.topic.toUpperCase()} QUEST · LEVEL ${level}`;$('quiz-count').textContent='Checkpoint question';$('question-text').textContent=question.q;const box=$('answer-options');box.innerHTML='';question.a.forEach((answer,i)=>{const b=document.createElement('button');b.innerHTML=`<b>${'ABCD'[i]}.</b> ${answer}`;b.onclick=()=>answer(i,b);box.append(b)});ui.quiz.classList.remove('hidden')}
function answer(index,button){const correct=index===question.correct;const buttons=[...$('answer-options').children];buttons.forEach(b=>b.disabled=true);button.classList.add(correct?'correct':'wrong');if(!correct)buttons[question.correct].classList.add('correct');setTimeout(()=>{ui.quiz.classList.add('hidden');game.answer(correct)},correct?650:900)}
function showOver(won){$('final-score').textContent=Math.floor(game.score);$('final-best').textContent=Math.max(game.best,Math.floor(game.score));$('final-level').textContent=game.level;$('gameover-title').textContent=won?'Legendary explorer!':'Your next quest awaits';$('gameover-copy').textContent=won?'You conquered the trail with curiosity and courage.':'Every answer makes you stronger. Give the trail another try!';ui.over.classList.remove('hidden')}
function toast(msg){let el=document.querySelector('.toast');if(!el){el=document.createElement('div');el.className='toast';document.querySelector('.game-card').append(el)}el.textContent=msg;el.classList.add('show');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.remove('show'),1300)}
$('start-btn').onclick=play;$('restart-btn').onclick=newGame;$('restart-from-pause').onclick=newGame;$('pause-btn').onclick=()=>{if(game.state==='playing'){game.pause();ui.pause.classList.remove('hidden')}};$('resume-btn').onclick=()=>{ui.pause.classList.add('hidden');game.resume()};
$('sound-toggle').onclick=e=>{sound.muted=!sound.muted;e.currentTarget.textContent=sound.muted?'×':'♪';if(!sound.muted)sound.wake()};
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if((e.code==='Space'||e.code==='ArrowUp')){if(game.state==='ready'||game.state==='over')play();else game.jump()}if(e.code==='ArrowDown')game.duck(true);if(e.code==='KeyP'||e.code==='Escape'){if(game.state==='playing'){$('pause-btn').click()}else if(game.state==='paused')$('resume-btn').click()}});addEventListener('keyup',e=>{if(e.code==='ArrowDown')game.duck(false)});
$('jump-btn').onpointerdown=e=>{e.preventDefault();game.jump()};$('duck-btn').onpointerdown=e=>{e.preventDefault();game.duck(true)};$('duck-btn').onpointerup=$('duck-btn').onpointerleave=()=>game.duck(false);$('game-canvas').onpointerdown=()=>{if(game.state==='playing')game.jump();else if(game.state==='ready')play()};
