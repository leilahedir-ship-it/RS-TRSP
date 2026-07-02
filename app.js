const screens=[...document.querySelectorAll('.screen')];
let current='homeScreen';
let historyStack=[];
let user={nom:'',prenom:'',site:'',poste:''};
let qIndex=0;
let selected=null;
let results=[];
let lastScore=0;

const questions=[
  {q:"Quel équipement de sécurité est obligatoire lors des livraisons et tournées ?", a:["Gilet haute visibilité","Casque de protection","Chaussures de ville","Gants en cuir"], ok:0},
  {q:"Que devez-vous faire en cas de fatigue importante au volant ?", a:["Continuer pour finir plus vite","S'arrêter dans un endroit sécurisé et prévenir le chef d'équipe","Boire uniquement un café","Ouvrir la fenêtre et accélérer"], ok:1},
  {q:"Quelle est la bonne pratique pour soulever un colis lourd ?", a:["Dos rond et jambes tendues","Bras éloignés du corps","Plier les jambes et garder le dos droit","Porter seul même si le colis est trop lourd"], ok:2},
  {q:"En cas d'accident du travail, que faut-il faire en priorité ?", a:["Ne rien dire si ce n'est pas grave","Prévenir le chef d'équipe ou la direction rapidement","Attendre la fin de journée","Poster une photo dans le groupe"], ok:1},
  {q:"Avant le départ en tournée, quel contrôle est essentiel ?", a:["Uniquement le niveau de carburant","État général du véhicule, pneus, feux et documents","La musique dans le véhicule","La météo uniquement"], ok:1},
  {q:"Pourquoi respecter les temps de pause est important ?", a:["Pour éviter la fatigue et réduire le risque d'accident","Pour perdre du temps","Ce n'est pas obligatoire","Uniquement pour manger"], ok:0},
  {q:"Que devez-vous faire en cas d'accident de la route ?", a:["Prévenir uniquement votre chef d'équipe","Remplir un constat si nécessaire et prévenir votre chef d'équipe","Ne rien faire si les dégâts sont mineurs","Appeler directement l'assurance sans informer l'entreprise"], ok:1},
  {q:"Quel comportement réduit le risque routier ?", a:["Téléphoner en conduisant","Respecter les distances de sécurité","Se dépêcher pour rattraper un retard","Consulter le GPS en roulant"], ok:1},
  {q:"Les chaussures de sécurité servent principalement à :", a:["Faire professionnel","Protéger les pieds contre chocs, chutes d'objets et glissades","Tenir chaud","Remplacer les pauses"], ok:1},
  {q:"Si une situation dangereuse est constatée, il faut :", a:["La garder pour soi","La signaler pour éviter un accident","Attendre qu'un collègue s'en occupe","Continuer normalement"], ok:1},
  {q:"Quelle est une source de risques psychosociaux chez les chauffeurs-livreurs ?", a:["Pression des délais et isolement","Port du gilet","Véhicule propre","Lecture d'une consigne"], ok:0},
  {q:"En cas de colis trop lourd ou encombrant, il est préférable de :", a:["Forcer pour aller vite","Demander de l'aide ou utiliser un moyen adapté","Le porter sur l'épaule en courant","Le faire glisser dans les escaliers"], ok:1},
  {q:"Le téléphone au volant est :", a:["Autorisé pour les urgences client","Un facteur important d'accident","Sans danger à faible vitesse","Autorisé avec un message court"], ok:1},
  {q:"Le DUERP sert à :", a:["Lister et évaluer les risques professionnels","Remplacer le contrat de travail","Suivre les congés","Organiser les tournées"], ok:0},
  {q:"La prévention des risques doit être :", a:["Uniquement administrative","Collective, régulière et appliquée au terrain","Réservée à la direction","Faite une fois puis oubliée"], ok:1}
];

function showScreen(id,push=true){
  if(push && current!==id) historyStack.push(current);
  screens.forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  current=id;
  document.getElementById('backBtn').style.visibility=(id==='homeScreen')?'hidden':'visible';
  window.scrollTo(0,0);
  if(id==='dashboardScreen') renderDashboard();
}

function goBack(){
  const prev=historyStack.pop();
  if(prev) showScreen(prev,false);
  else showScreen('homeScreen',false);
}

function resetQuiz(){
  qIndex=0;
  selected=null;
  results=[];
  document.getElementById('quizError').textContent='';
  renderQuestion();
}

function startQuiz(){
  resetQuiz();
  showScreen('quizScreen');
}

function saveUser(){
  const error=document.getElementById('formError');
  user.nom=document.getElementById('nom').value.trim();
  user.prenom=document.getElementById('prenom').value.trim();
  user.site=document.getElementById('site').value;
  user.poste=document.getElementById('poste').value;
  if(!user.nom || !user.prenom || !user.site || !user.poste){
    error.textContent="Merci de compléter toutes les informations.";
    return;
  }
  error.textContent="";
  showScreen('introScreen');
}

function renderQuestion(){
  const q=questions[qIndex];
  selected=null;
  document.getElementById('qLabel').textContent=`QUESTION ${qIndex+1} / ${questions.length}`;
  document.getElementById('progressBar').style.width=`${((qIndex+1)/questions.length)*100}%`;
  document.getElementById('questionText').textContent=q.q;
  document.getElementById('quizError').textContent="";
  const box=document.getElementById('answers');
  box.innerHTML="";
  q.a.forEach((txt,i)=>{
    const div=document.createElement('button');
    div.type='button';
    div.className='answer';
    div.innerHTML=`<span class="radio"></span><span>${txt}</span>`;
    div.addEventListener('click',()=>{
      selected=i;
      document.querySelectorAll('.answer').forEach(a=>a.classList.remove('selected'));
      div.classList.add('selected');
    });
    box.appendChild(div);
  });
  document.getElementById('nextBtn').textContent=(qIndex===questions.length-1)?"Voir mes résultats →":"Suivant →";
}

function nextQuestion(){
  if(selected===null){
    document.getElementById('quizError').textContent="Sélectionnez une réponse pour continuer.";
    return;
  }
  const q=questions[qIndex];
  results.push({
    question:q.q,
    selected:selected,
    correct:q.ok,
    selectedText:q.a[selected],
    correctText:q.a[q.ok],
    isCorrect:selected===q.ok
  });
  if(qIndex<questions.length-1){
    qIndex++;
    renderQuestion();
  }else{
    showResults();
  }
}

function showResults(){
  lastScore=Math.round((results.filter(r=>r.isCorrect).length/questions.length)*100);
  const valid=lastScore>=70;
  document.getElementById('scorePct').textContent=lastScore+"%";
  document.getElementById('circle').style.background=`conic-gradient(${valid?'var(--vert)':'var(--rouge-rs)'} ${lastScore*3.6}deg, #d9dee6 0deg)`;
  document.getElementById('resultTitle').className=valid?'success':'fail';
  document.getElementById('resultTitle').textContent=valid?'FÉLICITATIONS !':'À REVOIR';
  document.getElementById('resultMsg').innerHTML=valid
    ? `Vous avez obtenu un score supérieur au minimum requis de 70 %.<br><br>Continuez à appliquer les bonnes pratiques au quotidien.`
    : `Votre score est inférieur au minimum requis de 70 %. Merci de recommencer le parcours avant la prise de poste.`;
  document.getElementById('certBtn').style.display=valid?'block':'none';
  renderRecap();
  saveAttempt(lastScore,valid);
  showScreen('resultScreen');
}

function renderRecap(){
  const recap=document.getElementById('recap');
  recap.innerHTML=results.map((r,i)=>`
    <div class="recap-item ${r.isCorrect?'ok':'ko'}">
      <strong>${r.isCorrect?'✓':'✕'}</strong>
      <div>
        <strong>Question ${i+1}</strong><br>
        ${r.question}<br>
        <small>Votre réponse : ${r.selectedText}</small><br>
        ${!r.isCorrect ? `<small>Bonne réponse : ${r.correctText}</small>` : ''}
      </div>
    </div>
  `).join('');
}

function saveAttempt(score,valid){
  const attempts=JSON.parse(localStorage.getItem('rs_attempts')||'[]');
  attempts.unshift({
    name:(user.prenom+" "+user.nom).trim()||"Collaborateur",
    site:user.site,
    poste:user.poste,
    score,
    valid,
    date:new Date().toLocaleDateString('fr-FR')
  });
  localStorage.setItem('rs_attempts',JSON.stringify(attempts.slice(0,30)));
}

function showCertificate(){
  document.getElementById('certName').textContent=((user.prenom+" "+user.nom).trim()||"Collaborateur").toUpperCase();
  document.getElementById('certScore').textContent=lastScore+" %";
  document.getElementById('certDate').textContent=new Date().toLocaleDateString('fr-FR');
  showScreen('certificateScreen');
}

function renderDashboard(){
  const attempts=JSON.parse(localStorage.getItem('rs_attempts')||'[]');
  const done=attempts.length;
  const valid=attempts.filter(a=>a.valid).length;
  const avg=done?Math.round(attempts.reduce((s,a)=>s+a.score,0)/done):0;
  document.getElementById('trainedCount').textContent=valid;
  document.getElementById('avgScore').textContent=avg+"%";
  document.getElementById('quizCount').textContent=done;
  document.getElementById('pendingCount').textContent=Math.max(0,done-valid);
  const demo=attempts.length?attempts:[
    {name:"Leila HEDIR",valid:true,score:87,date:"02/07/2026"},
    {name:"Karim B.",valid:true,score:80,date:"02/07/2026"},
    {name:"Sarah L.",valid:false,score:60,date:"01/07/2026"}
  ];
  document.getElementById('activityTable').innerHTML=demo.slice(0,6).map(a=>`
    <tr>
      <td>${a.name}</td>
      <td class="${a.valid?'oktxt':'kotxt'}">${a.valid?'Réussi':'Échoué'}</td>
      <td>${a.score}%</td>
      <td>${a.date}</td>
    </tr>
  `).join('');
}

function clearData(){
  localStorage.removeItem('rs_attempts');
  renderDashboard();
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-go]').forEach(btn=>{
    btn.addEventListener('click',()=>showScreen(btn.dataset.go));
  });
  document.getElementById('backBtn').addEventListener('click',goBack);
  document.getElementById('dashboardBtn').addEventListener('click',()=>showScreen('dashboardScreen'));
  document.getElementById('saveUserBtn').addEventListener('click',saveUser);
  document.getElementById('startQuizBtn').addEventListener('click',startQuiz);
  document.getElementById('nextBtn').addEventListener('click',nextQuestion);
  document.getElementById('retryBtn').addEventListener('click',startQuiz);
  document.getElementById('homeBtn').addEventListener('click',()=>showScreen('homeScreen'));
  document.getElementById('certBtn').addEventListener('click',showCertificate);
  document.getElementById('printBtn').addEventListener('click',()=>window.print());
  document.getElementById('clearDataBtn').addEventListener('click',clearData);
});

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
