/* ═══════════════════════════════════════════════════════════════
   MEEZAN SHARED JS
═══════════════════════════════════════════════════════════════ */

// Sticky header scroll handler (marketing pages)
(function(){
  const hdr = document.getElementById('site-hdr');
  if(hdr){
    window.addEventListener('scroll', () => {
      hdr.classList.toggle('scrolled', window.scrollY > 60);
    });
  }
})();

// Currency toggle (pricing page)
window.setCurr = function(c){
  const prices = {
    'p-starter':  { usd:'مجاناً',   jod:'مجاناً' },
    'pj-starter': { usd:'للأبد',    jod:'للأبد' },
    'p-pro':      { usd:'$149<span>/شهر</span>',  jod:'١١٠<span> دينار/شهر</span>' },
    'pj-pro':     { usd:'أو ١١٠ دينار أردني',     jod:'أو $149 دولار' },
    'p-firm':     { usd:'$399<span>/شهر</span>',  jod:'٢٩٠<span> دينار/شهر</span>' },
    'pj-firm':    { usd:'أو ٢٩٠ دينار أردني',     jod:'أو $399 دولار' },
    'p-ent':      { usd:'تواصل معنا', jod:'تواصل معنا' },
    'pj-ent':     { usd:'تسعير مخصص', jod:'تسعير مخصص' },
  };
  Object.keys(prices).forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.innerHTML = prices[id][c];
  });
  document.querySelectorAll('.curr-btn').forEach(b=>{
    b.classList.toggle('on', b.textContent.includes(c==='usd'?'USD':'JOD'));
  });
};

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    item.classList.toggle('open');
    const icon = item.querySelector('.faq-icon');
    if(icon) icon.textContent = item.classList.contains('open') ? '−' : '+';
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
  });
});
