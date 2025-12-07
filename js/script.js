document.addEventListener('DOMContentLoaded',function(){
  document.getElementById('year').textContent = new Date().getFullYear();
  
  
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', function(){
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    mainNav.classList.toggle('open');
  });

  document.addEventListener('click', function(e){
    if(!mainNav.contains(e.target) && !navToggle.contains(e.target)){
      if(mainNav.classList.contains('open')){ mainNav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(prefersReduced){ target.scrollIntoView({behavior:'auto',block:'start'}); }
        else { target.scrollIntoView({behavior:'smooth',block:'start'}); }
        
        if(mainNav.classList.contains('open')){ mainNav.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
      }
    });
  });

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name || !email || !message){
      status.textContent = 'Merci de remplir tous les champs.';
      return;
    }
    status.textContent = 'Envoi simulé (aucun serveur configuré).';
    setTimeout(()=>{ status.textContent = 'Message simulé : merci !'; form.reset(); }, 800);
  });

  const siteHeader = document.querySelector('.site-header');
  const onScroll = () => {
    if(window.scrollY > 80) siteHeader.classList.add('shrink'); else siteHeader.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll);

  
  
  const contrastToggle = document.createElement('button');
  contrastToggle.className = 'contrast-toggle';
  contrastToggle.textContent = 'Contraste';
  contrastToggle.setAttribute('aria-pressed','false');
  contrastToggle.style.marginLeft = '1rem';
  document.querySelector('.header-inner').appendChild(contrastToggle);
  const applyContrast = (on) => { document.documentElement.classList.toggle('high-contrast', on); contrastToggle.setAttribute('aria-pressed', String(on)); };
  const saved = localStorage.getItem('highContrast') === 'true';
  applyContrast(saved);
  contrastToggle.addEventListener('click', ()=>{ const on = !(document.documentElement.classList.contains('high-contrast')); applyContrast(on); localStorage.setItem('highContrast', String(on)); });

  
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item img'));
  const lightbox = document.getElementById('lightbox');
  if(lightbox && galleryItems.length){
    const lbImg = lightbox.querySelector('.lightbox-img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;
    const openAt = (i)=>{
      const img = galleryItems[i];
      const full = img.getAttribute('data-full') || img.src;
      lbImg.src = full; lbImg.alt = img.alt || '';
      lbCaption.textContent = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      lightbox.setAttribute('aria-hidden','false');
      currentIndex = i;
      btnClose.focus();
    };
    const close = ()=>{ lightbox.setAttribute('aria-hidden','true'); galleryItems[currentIndex].focus(); };
    galleryItems.forEach((img, i)=>{
      img.tabIndex = 0;
      img.addEventListener('click', ()=> openAt(i));
      img.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openAt(i); } });
    });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', ()=> openAt((currentIndex-1+galleryItems.length)%galleryItems.length));
    btnNext.addEventListener('click', ()=> openAt((currentIndex+1)%galleryItems.length));
    document.addEventListener('keydown', (e)=>{
      if(lightbox.getAttribute('aria-hidden')==='false'){
        if(e.key==='Escape') close();
        if(e.key==='ArrowLeft') btnPrev.click();
        if(e.key==='ArrowRight') btnNext.click();
      }
    });
  }
});