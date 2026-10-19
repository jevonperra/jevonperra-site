(function(){
  'use strict';
  /* header border after scroll */
  var top=document.querySelector('.top');
  if(top){var f=function(){top.classList.toggle('scrolled',window.scrollY>8)};f();window.addEventListener('scroll',f,{passive:true});}

  /* latest videos: page ships with a list; refresh it from /api/latest when available */
  var list=document.getElementById('video-list');
  function fmt(iso){try{return new Date(iso+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}catch(e){return iso}}
  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
  function card(v,first){
    var a=el('a','video'+(first?' first':''));a.href='https://www.youtube.com/watch?v='+encodeURIComponent(v.id);
    var th=el('div','thumb'),img=document.createElement('img');img.src='https://i.ytimg.com/vi/'+encodeURIComponent(v.id)+'/hqdefault.jpg';img.alt='';img.loading='lazy';img.width=480;img.height=360;th.appendChild(img);a.appendChild(th);
    var t=el('time',null,fmt(v.published));t.dateTime=v.published;
    if(first){var m=el('div','meta');m.appendChild(el('span','label','Newest video'));m.appendChild(el('h3',null,v.title));m.appendChild(t);a.appendChild(m)}
    else{a.appendChild(el('h3',null,v.title));a.appendChild(t)}
    return a;
  }
  if(list&&window.fetch){
    fetch('/api/latest',{headers:{'Accept':'application/json'}}).then(function(r){return r.ok?r.json():null}).then(function(d){
      if(!d||!d.videos||!d.videos.length)return;
      var frag=document.createDocumentFragment();
      d.videos.slice(0,7).forEach(function(v,i){frag.appendChild(card(v,i===0))});
      list.replaceChildren(frag);
    }).catch(function(){});
  }

  /* contact form via Web3Forms */
  var FORM_KEY='d84dac91-1fc5-4ddb-becc-5c79cb5de964';
  var form=document.getElementById('contact-form');
  if(form){
    var err=document.getElementById('form-error'),btn=form.querySelector('button[type="submit"]');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=form.name.value.trim(),email=form.email.value.trim(),msg=form.message.value.trim();
      if(form.botcheck&&form.botcheck.value)return;
      var bad=null;
      if(!name)bad=[form.name,'Enter your name.'];
      else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))bad=[form.email,'Enter an email so I can reply.'];
      else if(!msg)bad=[form.message,'Write a message.'];
      [form.name,form.email,form.message].forEach(function(f){f.removeAttribute('aria-invalid')});
      if(bad){bad[0].setAttribute('aria-invalid','true');bad[0].focus();err.textContent=bad[1];return}
      err.textContent='';btn.disabled=true;var orig=btn.textContent;btn.textContent='Sending';
      fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({access_key:FORM_KEY,subject:'jevonperra.com message from '+name,from_name:'jevonperra.com',replyto:email,name:name,email:email,message:msg})})
      .then(function(r){return r.json().then(function(d){if(!r.ok||!d.success)throw new Error(d.message||'failed')})})
      .then(function(){form.reset();location.href='/thanks.html'})
      .catch(function(){err.textContent='The message did not send. Try again in a minute, or reach me on LinkedIn.'})
      .finally(function(){btn.disabled=false;btn.textContent=orig});
    });
  }

  /* analytics consent */
  (function(){
    var box=document.getElementById('consent');if(!box)return;
    var c=null;try{c=localStorage.getItem('ga-consent')}catch(e){}
    function grant(){if(window.gtag)gtag('consent','update',{analytics_storage:'granted'})}
    if(c==='yes'){grant();return}
    if(c==='no')return;
    box.hidden=false;
    document.getElementById('consent-yes').addEventListener('click',function(){try{localStorage.setItem('ga-consent','yes')}catch(e){}grant();box.hidden=true});
    document.getElementById('consent-no').addEventListener('click',function(){try{localStorage.setItem('ga-consent','no')}catch(e){}box.hidden=true});
  })();
})();
