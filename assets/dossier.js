/* Il dossier del caso studio: si apre a tutto schermo, alterna chiaro e scuro,
   i numeri salgono da zero e i video stanno nei telefoni con i comandi veri. */
(function(){
  const stile=document.createElement('style');
  stile.textContent=`
  .dossier{position:fixed;inset:0;z-index:120;background:var(--carta);color:var(--inchiostro);
    overflow-y:auto;overscroll-behavior:contain;transform:translateY(100%);visibility:hidden;
    transition:transform .7s var(--e1),visibility 0s linear .7s}
  .dossier.on{transform:none;visibility:visible;transition:transform .7s var(--e1),visibility 0s}
  .chiudi{position:fixed;top:18px;right:clamp(16px,4vw,44px);z-index:130;width:50px;height:50px;border-radius:99px;
    border:1px solid var(--linea-chiara);background:rgba(239,241,245,.92);backdrop-filter:blur(10px);
    cursor:pointer;font-size:17px;color:var(--inchiostro);transition:.3s var(--e1);line-height:1}
  .chiudi:hover{background:var(--accent);color:#fff;border-color:var(--accent);transform:rotate(90deg)}

  /* testa */
  .d-testa{padding:clamp(64px,10vh,116px) 0 clamp(24px,4vh,44px);position:relative;overflow:hidden}
  .d-testa h2{font-family:var(--display);font-weight:900;letter-spacing:-.05em;line-height:.94;
    font-size:clamp(38px,7.4vw,108px);margin-top:12px}
  .d-testa .sotto{margin-top:14px;font-size:clamp(16px,1.8vw,25px);color:#54505F;max-width:32ch;line-height:1.34;font-weight:500}
  .d-riga{height:3px;background:var(--accent);border-radius:2px;margin-top:30px;
    transform:scaleX(0);transform-origin:left;transition:transform 1.1s var(--e1) .25s}
  .dossier.on .d-riga{transform:scaleX(1)}
  .d-meta{display:flex;flex-wrap:wrap;gap:22px;margin-top:24px}
  .d-meta div{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#5F5B6B}
  .d-meta b{display:block;color:var(--inchiostro);margin-top:5px;font-weight:700;letter-spacing:0;text-transform:none;font-size:13.5px;font-family:var(--testo)}

  /* fascia scura dei numeri */
  .d-numeri{background:var(--canvas);color:var(--text-primary);position:relative;overflow:hidden}
  .d-numeri::after{content:"";position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(ellipse 70% 120% at 50% 120%,rgba(246,33,136,.16),transparent 66%)}
  .d-griglia{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
  .d-cella{padding:clamp(26px,4vw,52px) clamp(12px,1.8vw,26px);border-right:1px solid rgba(191,217,232,.13)}
  .d-cella:last-child{border-right:0}
  .d-cella b{display:block;font-family:var(--mono);font-weight:700;font-size:clamp(24px,3.4vw,46px);
    letter-spacing:-.05em;color:#fff;font-variant-numeric:tabular-nums}
  .d-cella.forte b{color:var(--accent)}
  .d-cella span{display:block;margin-top:9px;font-family:var(--mono);font-size:9.5px;letter-spacing:.15em;text-transform:uppercase;color:#96A0AE}
  .d-cella i{display:block;width:22px;height:2px;background:var(--accent);border-radius:2px;margin-bottom:16px;
    transform:scaleX(0);transform-origin:left;transition:transform .7s var(--e1)}
  .d-numeri.viva .d-cella i{transform:scaleX(1)}
  .d-cella:nth-child(2) i{transition-delay:.09s}
  .d-cella:nth-child(3) i{transition-delay:.18s}
  .d-cella:nth-child(4) i{transition-delay:.27s}

  /* capitoli */
  .d-cap{display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,64px);padding:clamp(46px,7vh,90px) 0}
  .d-col{display:flex;flex-direction:column;gap:clamp(24px,3.6vh,42px)}
  .d-cap h3{font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-scuro,#C2005F);font-weight:700;
    display:flex;align-items:center;gap:10px}
  .d-cap h3::before{content:"";width:16px;height:2px;background:var(--accent);border-radius:2px;flex:none}
  .d-cap p{margin-top:12px;font-size:clamp(15px,1.32vw,17.5px);line-height:1.74;color:#3E3B47}

  /* telefoni */
  .d-sezione{padding-bottom:clamp(46px,7vh,86px)}
  .d-titoletto{font-family:var(--mono);font-size:10.5px;letter-spacing:.22em;text-transform:uppercase;color:#5F5B6B;
    margin-bottom:22px;display:flex;align-items:center;gap:10px}
  .d-titoletto::before{content:"";width:16px;height:2px;background:var(--accent);border-radius:2px}
  .telefoni{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:clamp(14px,2vw,26px)}
  .telefoni:empty{display:none}
  .player{border-radius:30px;overflow:hidden;background:#0B0D12;border:6px solid #0B0D12;position:relative;
    box-shadow:0 26px 60px -26px rgba(11,13,18,.55);transition:transform .5s var(--e1)}
  .player:hover{transform:translateY(-5px)}
  .player video{aspect-ratio:9/16;width:100%;object-fit:cover;background:#000;display:block}
  .comandi{display:flex;align-items:center;gap:8px;padding:10px 11px;background:#0B0D12}
  .cmd{width:32px;height:32px;flex:none;border-radius:99px;border:1px solid rgba(191,217,232,.22);
    background:rgba(191,217,232,.08);color:#EDF1F7;cursor:pointer;font-size:11px;display:grid;place-items:center;transition:.25s;padding:0}
  .cmd:hover{background:var(--accent);border-color:var(--accent);color:#fff}
  .tempo{flex:1;height:4px;border-radius:99px;background:rgba(191,217,232,.2);cursor:pointer;position:relative;overflow:hidden}
  .tempo i{position:absolute;inset:0 auto 0 0;width:0;background:var(--accent)}
  .vol{width:52px;accent-color:var(--accent);cursor:pointer}

    .strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:9px}
  @media(max-width:640px){.strip{grid-template-columns:repeat(2,1fr)}}
  .strip.singola{display:block;max-width:300px}
  .strip.singola img{aspect-ratio:auto;height:auto;filter:none;border:1px solid var(--linea-chiara)}
  .d-nota{margin-top:14px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;
    text-transform:uppercase;color:#5F5B6B}
  .strip:empty{display:none}
  .strip img{width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;border-radius:12px;filter:grayscale(1);transition:filter .5s var(--e2),transform .5s var(--e1)}
  .strip img:hover{filter:none;transform:scale(1.02)}
  .attesa{padding:clamp(26px,3.6vw,44px);border:1px dashed var(--linea-chiara);border-radius:10px;
    text-align:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#6B6776}
  .d-fonte{padding-bottom:clamp(50px,8vh,92px);font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;color:#5F5B6B}
  .d-chiusa{border-top:1px solid var(--linea-chiara);padding:clamp(40px,6vh,72px) 0 clamp(50px,8vh,92px)}
  .d-chiusa h3{font-family:var(--display);font-weight:900;font-size:clamp(22px,3vw,40px);letter-spacing:-.04em}
  .d-chiusa p{margin-top:12px;color:#54505F;font-size:16px;max-width:44ch}
  .d-bottone{display:inline-flex;align-items:center;margin-top:24px;background:var(--accent);color:#0B0D12;
    text-decoration:none;padding:15px 28px;border-radius:99px;font-weight:500;font-size:15px;transition:.3s var(--e1)}
  .d-bottone:hover{background:var(--accent-hover);transform:translateY(-2px)}
  @media(max-width:900px){.d-cap{grid-template-columns:1fr}}
  @media(pointer:coarse){
    .comandi{gap:10px;padding:12px}
    .cmd{width:44px;height:44px;font-size:13px}
    .tempo{height:12px;border-radius:99px}
    .vol{width:70px;height:26px}
    .chiudi{width:52px;height:52px}
  }
  @media(prefers-reduced-motion:reduce){.dossier,.d-riga,.d-cella i,.player{transition:none}}`;
  document.head.appendChild(stile);

  const d=document.createElement('div');
  d.className='dossier';d.id='dossier';d.setAttribute('role','dialog');
  d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Caso studio');
  d.innerHTML='<button class="chiudi" id="chiudi" aria-label="Chiudi il caso studio">&#10005;</button><div id="d-corpo"></div>';
  document.body.appendChild(d);
  const corpo=document.getElementById('d-corpo');
  let apertoDa=null;
  const ridotto=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ── i numeri salgono da zero ── */
  function animaNumero(el){
    const testo=el.dataset.valore;
    const m=testo.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if(!m||ridotto()){el.textContent=testo;return}
    const [,pre,num,post]=m;
    const decimale=num.includes(',');
    const pulito=parseFloat(num.replace(/\./g,'').replace(',','.'));
    if(!isFinite(pulito)){el.textContent=testo;return}
    const t0=performance.now(),dur=1400;
    (function tick(t){
      const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,3);
      const v=pulito*e;
      const mostra=decimale
        ? v.toFixed(1).replace('.',',')
        : Math.round(v).toLocaleString('it-IT');
      el.textContent=pre+mostra+post;
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  }

  function player(id,n){
    return `<div class="player">
      <video src="assets/casi/${id}/v${n}.mp4" poster="assets/casi/${id}/v${n}.jpg" playsinline loop muted preload="metadata"
             onerror="this.closest('.player').remove()"></video>
      <div class="comandi">
        <button class="cmd play" type="button" aria-label="Riproduci o metti in pausa">&#9654;</button>
        <button class="cmd indietro" type="button" aria-label="Indietro di dieci secondi">&#8630;</button>
        <div class="tempo" role="slider" aria-label="Avanzamento" tabindex="0"><i></i></div>
        <button class="cmd audio" type="button" aria-label="Attiva o disattiva l'audio">&#128263;</button>
        <input class="vol" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
      </div></div>`;
  }

  function collega(){
    corpo.querySelectorAll('.player').forEach(p=>{
      const v=p.querySelector('video'),play=p.querySelector('.play'),ind=p.querySelector('.indietro'),
            aud=p.querySelector('.audio'),vol=p.querySelector('.vol'),
            tempo=p.querySelector('.tempo'),riemp=p.querySelector('.tempo i');
      play.onclick=()=>{v.paused?v.play():v.pause()};
      v.onplay=()=>{play.innerHTML='&#10073;&#10073;'};
      v.onpause=()=>{play.innerHTML='&#9654;'};
      ind.onclick=()=>{v.currentTime=Math.max(0,v.currentTime-10)};
      aud.onclick=()=>{v.muted=!v.muted;aud.innerHTML=v.muted?'&#128263;':'&#128266;'};
      vol.oninput=()=>{v.volume=+vol.value;if(+vol.value>0&&v.muted){v.muted=false;aud.innerHTML='&#128266;'}};
      v.ontimeupdate=()=>{if(v.duration)riemp.style.width=(v.currentTime/v.duration*100)+'%'};
      tempo.onclick=e=>{const r=tempo.getBoundingClientRect();
        if(v.duration)v.currentTime=Math.min(Math.max((e.clientX-r.left)/r.width,0),1)*v.duration};
      // partono da soli in loop quando entrano in campo, e si possono fermare
      if(!ridotto()){
        let fermatoAMano=false;
        play.addEventListener('click',()=>{fermatoAMano=!v.paused},true);
        new IntersectionObserver(es=>es.forEach(e=>{
          if(e.isIntersecting){ if(!fermatoAMano) v.play().catch(()=>{}) }
          else v.pause();
        }),{threshold:.3}).observe(v);
      }
    });
  }

  window.apriDossier=function(i){
    const c=CASI[i];
    apertoDa=document.activeElement;
    corpo.innerHTML=`
      <div class="wrap d-testa">
        <p class="occhiello">${c.settore}</p>
        <h2>${c.cliente}</h2>
        <p class="sotto">${c.tit}</p>
        <div class="d-riga"></div>
        <div class="d-meta">
          <div>Periodo<b>${c.periodo}</b></div>
          <div>Canali<b>${c.canali}</b></div>
          <div>Fonte dei dati<b>${c.fonte}</b></div>
        </div>
      </div>

      <div class="d-numeri" id="d-numeri">
        <div class="wrap"><div class="d-griglia">
          ${c.dati.map((k,n)=>`<div class="d-cella ${n===0?'forte':''}"><i></i><b data-valore="${k[0]}">${k[0].match(/\\d/)?'0':k[0]}</b><span>${k[1]}</span></div>`).join('')}
        </div></div>
      </div>

      <div class="wrap">
        <div class="d-cap">
          <div class="d-col">${c.cap.slice(0,2).map(x=>`<div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div>
          <div class="d-col">${c.cap.slice(2).map(x=>`<div><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')}</div>
        </div>

        <div class="d-sezione">
          <p class="d-titoletto">I contenuti</p>
          <div class="telefoni">${Array.from({length:13},(_,i)=>i+1).map(n=>player(c.id,n)).join('')}</div>
        </div>

        <div class="d-sezione">
          <p class="d-titoletto">Dal lavoro</p>
          <div class="strip">${Array.from({length:18},(_,i)=>i+1).map(n=>`<img src="assets/casi/${c.id}/f${n}.jpg" alt="" loading="lazy" width="1600" height="2000" onerror="this.remove()">`).join('')}</div>
          ${c.notaFoto?`<p class="d-nota">${c.notaFoto}</p>`:''}
        </div>

        <p class="d-fonte">Periodo di confronto e fonte dichiarati in alto. I numeri non sono arrotondati a favore.</p>
        <div class="d-chiusa">
          <h3>Vuoi lo stesso lavoro sulla tua attività?</h3>
          <p>Raccontaci cosa deve cambiare. Ti rispondiamo con la nostra lettura del problema.</p>
          <a class="d-bottone" href="index.html#parliamone">Parliamone</a>
        </div>
      </div>`;
    clearTimeout(timerSvuota);
    d.classList.add('on');
    document.body.classList.add('bloccato');
    ['nav','main'].forEach(t=>{const el=document.querySelector(t);if(el)el.setAttribute('inert','')});
    const fo=document.querySelector('footer');if(fo)fo.setAttribute('inert','');
    d.scrollTop=0;
    collega();
    document.getElementById('chiudi').focus();

    const fascia=document.getElementById('d-numeri');
    new IntersectionObserver((es,ob)=>es.forEach(e=>{
      if(e.isIntersecting){
        fascia.classList.add('viva');
        corpo.querySelectorAll('.d-cella b').forEach(animaNumero);
        ob.disconnect();
      }
    }),{threshold:.35,root:d}).observe(fascia);

    setTimeout(()=>{
      const st=corpo.querySelector('.strip');
      if(st&&st.querySelectorAll('img').length===1)st.classList.add('singola');
      corpo.querySelectorAll('.d-sezione').forEach(sez=>{
        const griglia=sez.querySelector('.telefoni,.strip');
        if(griglia&&!griglia.children.length){
          if(griglia.classList.contains('telefoni')){
            griglia.outerHTML='<div class="attesa">Video di questo progetto in arrivo</div>';
          }else sez.remove();
        }
      });
    },1900);
  };

  let timerSvuota=null;
  function chiudi(){
    d.classList.remove('on');
    document.body.classList.remove('bloccato');
    corpo.querySelectorAll('video').forEach(v=>v.pause());
    ['nav','main'].forEach(t=>{const el=document.querySelector(t);if(el)el.removeAttribute('inert')});
    const f=document.querySelector('footer');if(f)f.removeAttribute('inert');
    clearTimeout(timerSvuota);
    timerSvuota=setTimeout(()=>{corpo.innerHTML=''},760);
    if(apertoDa&&apertoDa.focus)apertoDa.focus();
  }
  document.getElementById('chiudi').addEventListener('click',chiudi);
  addEventListener('keydown',e=>{
    if(!d.classList.contains('on'))return;
    if(e.key==='Escape'){chiudi();return}
    if(e.key!=='Tab')return;
    const f=[...d.querySelectorAll('button,input,a[href],[tabindex]:not([tabindex="-1"])')]
      .filter(el=>el.offsetParent!==null);
    if(!f.length)return;
    const primo=f[0],ultimo=f[f.length-1];
    if(e.shiftKey&&document.activeElement===primo){e.preventDefault();ultimo.focus()}
    else if(!e.shiftKey&&document.activeElement===ultimo){e.preventDefault();primo.focus()}
  });
})();
