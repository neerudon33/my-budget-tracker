(() => {
  'use strict';
  const KEY='my-budget-tracker-v1';
  const now=new Date();
  const mk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const dk=d=>mk(d)+'-'+String(d.getDate()).padStart(2,'0');
  const fresh=()=>({version:1,currency:'₹',startMonth:mk(now),planTotal:3000,essentials:'yes',accounts:{spending:'SBI',reserves:'Canara'},categories:[
    {id:'food',name:'Food / snacks',type:'spend',monthly:900,opening:0},{id:'mobile',name:'Mobile',type:'spend',monthly:300,opening:0},{id:'transport',name:'Transport',type:'spend',monthly:300,opening:0},{id:'personal',name:'Personal',type:'spend',monthly:300,opening:0},{id:'social',name:'Social / quick plans',type:'spend',monthly:400,opening:0},{id:'academic',name:'Academic / irregular',type:'reserve',monthly:500,opening:0},{id:'emergency',name:'Emergency reserve',type:'reserve',monthly:300,opening:0}],transactions:[]});
  let data;try{data=JSON.parse(localStorage.getItem(KEY))||fresh();}catch{data=fresh();}
  data.categories=data.categories||fresh().categories;data.transactions=data.transactions||[];data.accounts=data.accounts||{spending:'SBI',reserves:'Canara'};data.currency=data.currency||'₹';data.startMonth=data.startMonth||mk(now);data.planTotal=data.planTotal===undefined?3000:data.planTotal;data.essentials=data.essentials||'yes';
  let selected=mk(now),timer;
  const $=s=>document.querySelector(s),all=s=>Array.from(document.querySelectorAll(s));
  const money=n=>data.currency+Math.round(Number(n)||0).toLocaleString('en-IN');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tmonth=t=>String(t.date||'').slice(0,7);
  const monthCount=m=>{const a=data.startMonth.split('-').map(Number),b=m.split('-').map(Number);return Math.max(0,(b[0]-a[0])*12+b[1]-a[1]+1);};
  const txUntil=m=>data.transactions.filter(t=>tmonth(t)<=m);
  function balance(c,m){return Number(c.opening||0)+Number(c.monthly)*monthCount(m)-txUntil(m).filter(t=>t.categoryId===c.id).reduce((s,t)=>s+Number(t.amount),0);}
  function used(c,m){return data.transactions.filter(t=>tmonth(t)===m&&t.categoryId===c.id).reduce((s,t)=>s+Number(t.amount),0);}
  function save(){localStorage.setItem(KEY,JSON.stringify(data));}
  function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>e.classList.remove('show'),2300);}
  function render(){
    $('#month-picker').value=selected;$('#month-state').textContent=selected===mk(now)?'THIS MONTH':'MONTH VIEW';
    const spends=data.categories.filter(c=>c.type==='spend'),reserves=data.categories.filter(c=>c.type==='reserve');
    const spent=spends.reduce((s,c)=>s+used(c,selected),0),limit=spends.reduce((s,c)=>s+Number(c.monthly),0),assigned=data.categories.reduce((s,c)=>s+Number(c.monthly),0);
    $('#hero-budget').textContent=money(data.planTotal);$('#spent-summary').textContent=money(spent)+' spent this month';$('#left-summary').textContent=money(limit-spent)+' monthly spending left';
    $('#overall-progress').style.width=(limit?Math.max(0,Math.min(100,spent/limit*100)):0)+'%';$('#overall-progress').style.background=spent>limit?'#b74b4b':'';
    const notes=[];if(assigned!==Number(data.planTotal))notes.push('Category amounts total '+money(assigned)+', different from the plan total '+money(data.planTotal)+'.');if(data.essentials==='no')notes.push('Hostel and regular meal costs are not separately covered. Revise this plan.');
    $('#hero-note').textContent=notes.join(' ');$('#hero-note').hidden=!notes.length;
    $('#spending-list').innerHTML=spends.length?spends.map(c=>{const b=balance(c,selected),u=used(c,selected),pct=c.monthly?Math.min(100,Math.max(0,u/c.monthly*100)):0;return '<article class="category-card"><div class="cat-head"><div><div class="cat-name">'+esc(c.name)+'</div><div class="cat-sub">'+money(c.monthly)+' this month · '+money(u)+' spent</div></div><div class="cat-balance '+(b<0?'over':'')+'">'+money(b)+'<div class="cat-sub">available</div></div></div><div class="cat-track"><span class="'+(b<0?'over':'')+'" style="width:'+pct+'%"></span></div><div class="cat-foot"><span>'+Math.round(pct)+'% of monthly limit used</span><span>'+esc(data.accounts.spending)+'</span></div></article>';}).join(''):'<div class="empty">Add a spending category in Plan &amp; data.</div>';
    $('#reserve-list').innerHTML=reserves.length?reserves.map(c=>'<article class="category-card reserve-card"><div class="cat-head"><div><div class="cat-name">'+esc(c.name)+'</div><div class="cat-sub">'+money(c.monthly)+' added this month · '+money(used(c,selected))+' used</div></div><div class="cat-balance '+(balance(c,selected)<0?'over':'')+'">'+money(balance(c,selected))+'<div class="cat-sub">fund balance</div></div></div><div class="reserve-actions"><button class="small-button" data-use="'+esc(c.id)+'">Use this fund</button><span class="small-button">'+esc(data.accounts.reserves)+'</span></div></article>').join(''):'<div class="empty">Add a reserve in Plan &amp; data.</div>';
    const recent=data.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
    $('#activity-list').innerHTML=recent.length?recent.map(t=>{const c=data.categories.find(x=>x.id===t.categoryId);return '<div class="activity-item" data-del="'+esc(t.id)+'"><div><div class="activity-name">'+esc(t.note||c?.name||'Entry')+'</div><div class="activity-meta">'+esc(t.date)+' · '+esc(c?.name||'Removed category')+'</div></div><div class="activity-amount">−'+money(t.amount)+'</div></div>';}).join(''):'<div class="empty">Your entries will show here.</div>';
  }
  function fillCategories(preferred){
    const type=$('#tx-type').value,list=data.categories.filter(c=>c.type===type);
    $('#tx-category').innerHTML=list.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+' · '+money(balance(c,selected))+' available</option>').join('');
    if(preferred&&list.some(c=>c.id===preferred))$('#tx-category').value=preferred;
    if(!list.length)$('#tx-category').innerHTML='<option value="">Add this type of category in Plan &amp; data</option>';
    $('#tx-submit').textContent=type==='reserve'?'Record reserve use':'Save expense';$('#transaction-title').textContent=type==='reserve'?'Use a reserve':'Add an expense';
  }
  function openTx(type,id){
    $('#transaction-form').reset();$('#tx-type').value=type||'spend';$('#tx-date').value=dk(now);fillCategories(id);$('#transaction-dialog').showModal();
  }
  $('#add-transaction').onclick=()=>openTx('spend');$('#quick-add').onclick=()=>openTx('spend');
  $('#tx-type').onchange=()=>fillCategories();
  $('#transaction-form').onsubmit=e=>{e.preventDefault();const amount=Math.round(Number($('#tx-amount').value)),id=$('#tx-category').value,date=$('#tx-date').value,cat=data.categories.find(c=>c.id===id);if(!cat||amount<1||!date){toast('Enter an amount, category and date.');return;}if(amount>balance(cat,date.slice(0,7))&&!confirm('This exceeds the current category balance and will make it negative. Continue?'))return;data.transactions.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),categoryId:id,amount,date,note:$('#tx-note').value.trim()});save();$('#transaction-dialog').close();render();toast('Entry saved.');};
  $('#month-picker').onchange=e=>{if(e.target.value){selected=e.target.value;render();}};
  $('#month-prev').onclick=()=>{const a=selected.split('-').map(Number);selected=mk(new Date(a[0],a[1]-2,1));render();};
  $('#month-next').onclick=()=>{const a=selected.split('-').map(Number);selected=mk(new Date(a[0],a[1],1));render();};
  $('#reserve-list').onclick=e=>{const b=e.target.closest('[data-use]');if(b)openTx('reserve',b.dataset.use);};
  $('#activity-list').onclick=e=>{const r=e.target.closest('[data-del]');if(!r)return;const t=data.transactions.find(x=>x.id===r.dataset.del);if(t&&confirm('Delete this '+money(t.amount)+' entry?')){data.transactions=data.transactions.filter(x=>x.id!==t.id);save();render();toast('Entry removed.');}};
  function drawSettings(){const d=fresh();$('#set-currency').value=data.currency;$('#set-total').value=data.planTotal;$('#set-start').value=data.startMonth;$('#set-essentials').value=data.essentials;$('#set-spend-account').value=data.accounts.spending;$('#set-reserve-account').value=data.accounts.reserves;
    $('#settings-categories').innerHTML=data.categories.map((c,i)=>'<div class="setting-row" data-row="'+i+'"><input data-f="name" aria-label="Name" value="'+esc(c.name)+'"><input data-f="monthly" aria-label="Monthly amount" type="number" min="0" value="'+Number(c.monthly)+'"><input data-f="opening" aria-label="Opening balance" type="number" min="0" value="'+Number(c.opening||0)+'"><select data-f="type" aria-label="Fund type"><option value="spend" '+(c.type==='spend'?'selected':'')+'>Spend</option><option value="reserve" '+(c.type==='reserve'?'selected':'')+'>Reserve</option></select><button class="remove-cat" type="button" data-remove="'+i+'" aria-label="Remove">×</button></div>').join('');
  }
  function openSettings(){drawSettings();$('#settings-dialog').showModal();}
  $('#settings-open').onclick=openSettings;$('#settings-nav').onclick=openSettings;
  $('#category-add').onclick=()=>{data.categories.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:'New category',type:'spend',monthly:0,opening:0});drawSettings();};
  $('#settings-categories').onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;const i=Number(b.dataset.remove),c=data.categories[i];if(data.transactions.some(t=>t.categoryId===c.id)&&!confirm('This category has entries. Removing it means those entries will no longer count in category balances. Remove it?'))return;data.categories.splice(i,1);drawSettings();};
  $('#settings-form').onsubmit=e=>{e.preventDefault();all('.setting-row').forEach(r=>{const c=data.categories[Number(r.dataset.row)];if(!c)return;c.name=r.querySelector('[data-f=name]').value.trim()||'Category';c.monthly=Math.max(0,Math.round(Number(r.querySelector('[data-f=monthly]').value)||0));c.opening=Math.max(0,Math.round(Number(r.querySelector('[data-f=opening]').value)||0));c.type=r.querySelector('[data-f=type]').value;});data.currency=$('#set-currency').value.trim()||'₹';data.planTotal=Math.max(0,Math.round(Number($('#set-total').value)||0));data.startMonth=$('#set-start').value||data.startMonth;data.essentials=$('#set-essentials').value;data.accounts={spending:$('#set-spend-account').value.trim()||'Spending',reserves:$('#set-reserve-account').value.trim()||'Reserves'};save();$('#settings-dialog').close();render();toast('Plan updated.');};
  all('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
  $('#export-data').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=url;a.download='budget-backup-'+dk(now)+'.json';a.click();URL.revokeObjectURL(url);toast('Backup downloaded.');};
  $('#import-data').onclick=()=>$('#import-file').click();
  $('#import-file').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{const o=JSON.parse(await f.text());if(!Array.isArray(o.categories)||!Array.isArray(o.transactions))throw Error();if(confirm('Restore this backup and replace the data on this device?')){data=Object.assign(fresh(),o);data.accounts=Object.assign(fresh().accounts,o.accounts||{});save();render();openSettings();toast('Backup restored.');}}catch{alert('That file is not a readable budget backup.');}e.target.value='';};
  $('#reset-data').onclick=()=>{if(confirm('Erase the plan and all recorded entries from this browser?')){data=fresh();selected=mk(now);save();render();openSettings();toast('Data reset.');}};
  if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
  render();
})();
