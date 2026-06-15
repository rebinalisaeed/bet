import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDoc, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function showMessage(text,type='success'){
  const el=document.createElement('div');
  el.className=`fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl text-white text-center ${type==='error'?'bg-red-600':'bg-green-600'}`;
  el.textContent=text; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
}

export function bottomNav(active='home'){
  return `<nav class="fixed bottom-0 left-0 right-0 z-40 bg-[#081520]/95 backdrop-blur border-t border-white/10">
    <div class="max-w-md mx-auto h-20 grid grid-cols-4 text-xs">
      ${navItem('home.html','ماڵەوە','🏠','home',active)}
      ${navItem('matches.html','یارییەکان','⚽','matches',active)}
      ${navItem('leaderboard.html','ڕیزبەندی','🏆','rank',active)}
      ${navItem('profile.html','پرۆفایل','👤','profile',active)}
    </div></nav>`;
}
function navItem(href,label,icon,key,active){return `<a href="${href}" class="flex flex-col items-center justify-center gap-1 ${active===key?'text-[#00C853]':'text-gray-400'}"><span class="text-2xl">${icon}</span><span>${label}</span></a>`}

export async function loadHeader(){
  const box=document.getElementById('appHeader'); if(!box) return;
  box.innerHTML=`<header class="flex items-center justify-between p-4"><img src="assets/images/logo.png" class="h-12 object-contain"><span class="text-2xl">🔔</span></header>`;
}

export function protect(){ onAuthStateChanged(auth,u=>{ if(!u) location.href='login.html'; }); }

export async function loadUserCard(){
  onAuthStateChanged(auth, async user=>{
    if(!user) return;
    const snap=await getDoc(doc(db,'users',user.uid)); const d=snap.data();
    const name=document.getElementById('userName'); const pts=document.getElementById('userPoints'); const rank=document.getElementById('userRank');
    if(name) name.textContent=d?.username||'بەکارهێنەر'; if(pts) pts.textContent=d?.points??1000; if(rank) rank.textContent=d?.rank?`#${d.rank}`:'--';
  });
}

export async function loadMatches(){
  const wrap=document.getElementById('matchesList'); if(!wrap) return;
  const snap=await getDocs(collection(db,'matches'));
  if(snap.empty){ wrap.innerHTML='<p class="text-gray-400 p-4">هێشتا هیچ یارییەک زیاد نەکراوە.</p>'; return; }
  wrap.innerHTML='';
  snap.forEach(docu=>{ const m=docu.data(); wrap.innerHTML += `<div class="bg-[#102030] rounded-3xl p-4 border border-white/10 mb-4">
    <div class="flex justify-between text-gray-400 text-sm"><span>${m.league||'خول'}</span><span>${m.matchTime||''}</span></div>
    <div class="grid grid-cols-3 items-center text-center py-5"><div><div class="text-3xl">🏟️</div><h3 class="font-bold">${m.homeTeam||'Home'}</h3></div><div class="text-2xl font-black text-[#00C853]">VS</div><div><div class="text-3xl">⚽</div><h3 class="font-bold">${m.awayTeam||'Away'}</h3></div></div>
    <a href="predict.html?id=${docu.id}" class="block text-center bg-[#00C853] rounded-2xl p-3 font-bold">پێشبینی</a>
  </div>`; });
}

export async function loadLeaderboard(){
  const wrap=document.getElementById('leaderboardList'); if(!wrap) return;
  const q=query(collection(db,'users'),orderBy('points','desc'),limit(50)); const snap=await getDocs(q); let i=0; wrap.innerHTML='';
  snap.forEach(s=>{ i++; const u=s.data(); const medal=i===1?'🥇':i===2?'🥈':i===3?'🥉':'#'+i; wrap.innerHTML += `<div class="flex items-center justify-between bg-[#102030] rounded-2xl p-4 mb-3 ${i<=3?'border border-[#FFD700]/40':''}"><div class="flex items-center gap-3"><span class="text-2xl">${medal}</span><div><h3 class="font-bold">${u.username||'User'}</h3><p class="text-gray-400 text-sm">پۆینت</p></div></div><b class="text-[#FFD700]">${u.points||0}</b></div>`; });
}

export async function submitPrediction(matchId,prediction,pointsUsed){
  const user=auth.currentUser; if(!user) return showMessage('تکایە بچۆ ژوورەوە','error');
  await addDoc(collection(db,'predictions'),{ userId:user.uid, matchId, prediction, pointsUsed:Number(pointsUsed), status:'pending', createdAt:serverTimestamp() });
  showMessage('پێشبینیەکەت نێردرا ✅');
}
