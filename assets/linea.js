/* ══════════════════════════════════════════════════════════════
   LA LINEA
   Il segno del marchio come strada verticale: scorri e scendi
   lungo la linea magenta al centro. A sinistra e a destra
   compaiono i messaggi. Alla fine la linea ruota e si posa
   come il trattino del logo: freeze | studio.
   Canvas 2D, disegno additivo, nessuna dipendenza.
   ══════════════════════════════════════════════════════════════ */
(function(){
  const cv=document.getElementById('tela');
  if(!cv)return;
  const ctx=cv.getContext('2d',{alpha:false});
  const palco=document.getElementById('palco');
  const eroe=document.getElementById('eroe');
  const ridotto=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;

  let W=0,H=0,DPR=1,FASCIA=false;
  function ridimensiona(){
    DPR=Math.min(devicePixelRatio||1,2);
    W=palco.clientWidth;H=palco.clientHeight;
    FASCIA=W<=760;
    cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
    cv.style.width=W+'px';cv.style.height=H+'px';
    semina();
  }

  /* ── il mondo ── */
  const NODI=[],POLVERE=[];
  function semina(){
    NODI.length=0;
    for(let i=0;i<40;i++){
      NODI.push({t:i/40,lato:i%2?1:-1,off:0.18+((i*29)%60)/100*0.9,vel:0.9+((i*13)%30)/100});
    }
    POLVERE.length=0;
    const n=Math.round(Math.min(140,W*H/10000));
    for(let i=0;i<n;i++){
      POLVERE.push({x:Math.random(),t:Math.random(),d:(Math.random()-.5)*0.6+0.5,s:Math.random()*6.28});
    }
  }

  /* prospettiva verticale: t va da 0 (lontano, in alto) a 1 (vicino, in basso) */
  const T_ALTO=-0.06;
  function proiY(t){ return H*(T_ALTO+(1.10-T_ALTO)*t*t*0.62+t*0.42); }
  function scalaT(t){ return 0.13+0.87*t*t; }

  /* ── stato ── */
  let p=0,mostrato=0,raf=null,ultimo=0,visibile=true,t0=performance.now();
  function progresso(){
    const tot=eroe.offsetHeight-innerHeight;
    return Math.min(1,Math.max(0,(scrollY-eroe.offsetTop)/(tot||1)));
  }

  function alone(x,y,r,col,a){
    if(r<=0||a<=0)return;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,'rgba('+col+','+a+')');
    g.addColorStop(0.42,'rgba('+col+','+(a*0.24).toFixed(4)+')');
    g.addColorStop(1,'rgba('+col+',0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill();
  }

  /* ── disegno ── */
  function disegna(k,tempo){
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#070910');g.addColorStop(0.5,'#0B0D12');g.addColorStop(1,'#06070B');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

    /* u: quanto siamo dentro la posa finale del logo */
    const grezzo=Math.min(1,Math.max(0,(k-0.68)/0.17));   // ruota prima, cosi il titolo arriva dopo
    const u=grezzo*grezzo*(3-2*grezzo);

    ctx.globalCompositeOperation='lighter';

    /* gelo sospeso, scorre verso il basso mentre si avanza */
    POLVERE.forEach(d=>{
      let t=(d.t+k*d.d*1.4+tempo*0.000012)%1;
      const y=proiY(t),s=scalaT(t);
      const x=(d.x-0.5)*W*(0.35+1.15*s)+W/2;
      const a=(0.04+s*0.17)*(0.55+0.45*Math.sin(tempo*0.0012+d.s))*(1-u*0.75);
      if(a<=0.004)return;
      ctx.fillStyle='rgba(191,217,232,'+a.toFixed(4)+')';
      ctx.beginPath();ctx.arc(x,y,0.5+s*1.7,0,6.2832);ctx.fill();
    });

    /* ── la linea ──
       si disegna verticale, poi ruota verso l'orizzontale
       e si accorcia fino alla misura del trattino del logo. */
    const MEZZA_LOGO=Math.max(20,Math.min(52,W*0.036));
    const Y_LOGO=H*0.355;                      // il trattino si posa in alto, non al centro
    ctx.save();
    ctx.translate(W/2,Y_LOGO);
    ctx.rotate(-Math.PI/2*u);

    const passi=54;
    /* bagliore di fondo lungo la linea */
    for(let i=0;i<=10;i++){
      const t=i/10;
      const yy=(proiY(t)-Y_LOGO)*(1-u)+(t-0.5)*MEZZA_LOGO*2*u;
      const s=scalaT(t);
      alone(0,yy,(W*0.13*s+26)*(1-u*0.72),'246,33,136',(0.05+0.05*s)*(1-u*0.35));
    }
    /* nucleo, tre passate */
    [[22,0.05],[9,0.16],[3.2,0.98]].forEach(([sp,al])=>{
      ctx.beginPath();
      for(let i=0;i<=passi;i++){
        const t=i/passi;
        const yV=proiY(t)-Y_LOGO;
        const yL=(t-0.5)*MEZZA_LOGO*2;
        const y=yV+(yL-yV)*u;
        const s=scalaT(t);
        const x=Math.sin(tempo*0.0004+t*4.2)*2.2*s*(1-u);
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.strokeStyle='rgba(246,33,136,'+al+')';
      ctx.lineWidth=(sp*(0.18+0.82*(1-u)))+ (u*Math.max(3,MEZZA_LOGO*0.17));
      ctx.lineCap='round';
      ctx.stroke();
    });
    ctx.restore();

    /* i nodi che sfilano ai due lati */
    if(u<0.98){
      NODI.forEach(nd=>{
        let t=(nd.t+k*nd.vel)%1;
        const y=proiY(t),s=scalaT(t);
        if(s<0.02||y<-40||y>H+40)return;
        const x=W/2+nd.lato*(W*0.055+W*0.30*s)*nd.off;
        const a=Math.min(0.55,s*0.8)*(1-u);
        alone(x,y,(6+s*40),'246,33,136',a*0.42);
        ctx.fillStyle='rgba(255,216,238,'+(a*0.9).toFixed(4)+')';
        ctx.beginPath();ctx.arc(x,y,Math.max(0.6,s*2.6),0,6.2832);ctx.fill();
      });
    }

    /* il fondo del corridoio */
    alone(W/2,proiY(0),W*0.24*(1-u*0.7),'246,33,136',0.11*(1-u*0.6));
    ctx.globalCompositeOperation='source-over';
    palco.style.setProperty('--u',u.toFixed(3));
  }

  /* ── ciclo ── */
  function passo(now){
    const dt=Math.min(100,now-(ultimo||now));ultimo=now;
    mostrato+=(p-mostrato)*(1-Math.pow(1-0.13,dt/16.667));
    if(Math.abs(p-mostrato)<0.0004)mostrato=p;
    disegna(mostrato,now-t0);
    aggiornaFlusso(mostrato);
    aggiornaStazioni(mostrato);
    raf=visibile?requestAnimationFrame(passo):null;
    if(!visibile)ultimo=0;
  }
  function onScroll(){
    p=progresso();
    if(raf===null&&visibile){ultimo=0;raf=requestAnimationFrame(passo)}
  }

  /* ── il flusso: dati, nomi e telefoni che sfilano lungo la linea ── */
  const OGG=[...document.querySelectorAll('.flusso .oggetto')].map(el=>({
    el, video:el.querySelector('video'),
    k0:parseFloat(el.dataset.k0), dur:parseFloat(el.dataset.dur),
    lato:parseFloat(el.dataset.lato), spread:parseFloat(el.dataset.x),
    op:-1, acceso:false, visto:false
  }));
  function aggiornaFlusso(k){
    /* in fascia il flusso muore mentre la linea si posa: sotto c'è l'H1 in arrivo */
    const grezzo=Math.min(1,Math.max(0,(k-0.68)/0.17));
    const posa=grezzo*grezzo*(3-2*grezzo);
    OGG.forEach(o=>{
      const u=(k-o.k0)/o.dur;
      if(u<=-0.02||u>=1.02||(FASCIA&&posa>=1)){
        if(o.op!==0){o.op=0;o.el.style.opacity='0'}
        if(o.video&&o.acceso){o.video.pause();o.acceso=false}
        return;
      }
      const t=Math.min(1,Math.max(0,u));
      let y=proiY(t); const sc=scalaT(t);
      if(FASCIA)y=H*0.50+(y+H*0.06)*0.492;
      const x=W/2+o.lato*(W*0.075+W*0.30*sc)*o.spread;
      const dentro=Math.min(1,t/0.14), fuori=1-Math.min(1,Math.max(0,(t-0.82)/0.18));
      const op=Math.max(0,dentro*fuori)*Math.min(1,0.25+sc*1.5)*(FASCIA?1-posa:1);
      o.el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) translate(-50%,-50%) scale('+(0.45+sc*0.85).toFixed(3)+')';
      if(Math.abs(op-o.op)>0.01){o.op=op;o.el.style.opacity=op.toFixed(3)}
      if(o.video){
        if(!o.visto&&op>0.05){o.visto=true;o.video.preload='auto';o.video.load()}
        if(op>0.12&&!o.acceso){o.video.play().catch(()=>{});o.acceso=true}
        else if(op<=0.12&&o.acceso){o.video.pause();o.acceso=false}
      }
    });
  }

  /* ── stazioni ── */
  const stazioni=[...document.querySelectorAll('.stazione')].map(el=>({
    el,a:parseFloat(el.dataset.a),b:parseFloat(el.dataset.b),op:-1,k:-1
  }));
  const smooth=(v,e0,e1)=>{const t=Math.min(1,Math.max(0,(v-e0)/(e1-e0)));return t*t*(3-2*t)};
  const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
  let caricaK=0;
  function aggiornaStazioni(v){
    stazioni.forEach((st,i)=>{
      const f=Math.min(0.02,(st.b-st.a)/3);
      const dentro=i===0?1:smooth(v,st.a,st.a+f);
      const fuori=i===stazioni.length-1?0:smooth(v,st.b-f,st.b);
      const op=dentro*(1-fuori);
      let k=clamp((v-st.a)/Math.min(0.025,(st.b-st.a)*0.35),0,1);
      if(i===0)k=Math.max(k,caricaK);
      if(Math.abs(op-st.op)>0.004){
        st.op=op;st.el.style.opacity=op.toFixed(3);
        st.el.style.visibility=op<0.02?'hidden':'visible';
      }
      if(Math.abs(k-st.k)>0.008){st.k=k;st.el.style.setProperty('--k',k.toFixed(3))}
    });
  }
  function rampa(){
    const s0=performance.now();
    (function r(t){caricaK=Math.min(1,(t-s0)/900);aggiornaStazioni(mostrato);if(caricaK<1)requestAnimationFrame(r)})(s0);
  }

  /* ── avvio e cancelli ── */
  function fermaTutto(){
    if(raf!==null){cancelAnimationFrame(raf);raf=null}
    document.documentElement.classList.add('fermo');
    stazioni.forEach(st=>{st.el.style.opacity=1;st.el.style.setProperty('--k',1)});
    p=mostrato=1;disegna(1,0);aggiornaFlusso(1);
  }
  function avvia(){
    ridimensiona();
    if(ridotto()){fermaTutto();return}
    addEventListener('scroll',onScroll,{passive:true});
    onScroll();rampa();
  }
  addEventListener('resize',()=>{ridimensiona();ridotto()?disegna(1,0):onScroll()});
  new IntersectionObserver(es=>es.forEach(e=>{
    visibile=e.isIntersecting;
    if(visibile&&!ridotto()&&raf===null){ultimo=0;raf=requestAnimationFrame(passo)}
  }),{threshold:0}).observe(eroe);
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',e=>{
    if(e.matches){removeEventListener('scroll',onScroll);fermaTutto()}
    else{document.documentElement.classList.remove('fermo');
         addEventListener('scroll',onScroll,{passive:true});onScroll()}
  });
  addEventListener('visibilitychange',()=>{
    if(document.hidden){if(raf!==null){cancelAnimationFrame(raf);raf=null}}
    else if(visibile&&!ridotto()&&raf===null){ultimo=0;raf=requestAnimationFrame(passo)}
  });
  avvia();
})();
