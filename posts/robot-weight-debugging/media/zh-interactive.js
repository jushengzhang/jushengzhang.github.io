await Promise.all(['process-data'].map(async id=>{const response=await fetch('media/zh-process-data.json');if(!response.ok)throw new Error('Archive unavailable: '+id);document.getElementById(id).textContent=await response.text()}));
await Promise.all(['results-data'].map(async id=>{const response=await fetch('media/zh-results-data.json');if(!response.ok)throw new Error('Archive unavailable: '+id);document.getElementById(id).textContent=await response.text()}));
await Promise.all(['archive-assets'].map(async id=>{const response=await fetch('media/zh-archive-assets.json');if(!response.ok)throw new Error('Archive unavailable: '+id);document.getElementById(id).textContent=await response.text()}));

(()=>{
const assets=JSON.parse(document.getElementById('archive-assets').textContent),urls=new Map();
function urlFor(key){return assets[key].url}
for(const attr of ['src','poster','href'])document.querySelectorAll('[data-embedded-'+attr+']').forEach(el=>{const key=el.getAttribute('data-embedded-'+attr);el.setAttribute(attr,urlFor(key));if(attr==='href')el.setAttribute('download',assets[key].filename)});
document.querySelectorAll('video').forEach(v=>v.load());
})();
(()=>{const results=JSON.parse(document.getElementById('results-data').textContent);let language='zh',scope='touched';const q=id=>document.getElementById(id);
function draw(){
 if(!results)return;
 const run=results.pi05_language[q('run').value.toLowerCase()];
 const d=scope==='all'?run:run[scope],zh=language==='zh';
 q('bar-original').style.width=d.original_pct+'%';q('bar-edited').style.width=d.edited_pct+'%';
 q('value-original').textContent=d.original_pct.toFixed(1)+'%';q('value-edited').textContent=d.edited_pct.toFixed(1)+'%';
 const delta=(d.delta_pp>=0?'+':'')+d.delta_pp.toFixed(1),p=d.p<.01?d.p.toPrecision(3):d.p.toFixed(3);
 q('readout').textContent=zh?`成功率变化 ${delta} 个百分点；${d.n} 个配对回合中，${d.gain} 次由失败变成功，${d.loss} 次由成功变失败；精确 p=${p}。`:`${delta} pp · n=${d.n} · ${d.gain} repairs / ${d.loss} regressions · exact p=${p}`;
 inspectPrompt();
}
function inspectPrompt(){
 if(!results)return;
 const text=q('prompt').value.trim(),row=results.prompts.find(x=>x.instruction===text),zh=language==='zh';
 q('token-prompt').replaceChildren();q('token-rows').replaceChildren();
 document.querySelectorAll('.video-example').forEach(el=>{const show=row&&(el.dataset.suite||'libero_goal')===row.suite&&el.id==='video-'+row.variant_id;el.hidden=!show;if(!show)el.querySelectorAll('video').forEach(v=>v.pause())});
 if(!row){q('token-prompt').textContent=text;q('prompt-status').textContent=zh?'这条指令不在已完成测试的 765 条指令中。请从下拉建议或录像案例里选择；本页只展示已有记录。':'This instruction is not in the 765-prompt archive. Choose a suggestion or recorded example; no new inference runs here.';return;}
 const recipe=new Map(results.recipe.rows.map(x=>[x.row,x]));let position=0;const shown=new Set();
 for(const token of row.tokens){
  if(token.begin>position)q('token-prompt').append(document.createTextNode(text.slice(position,token.begin)));
  const edit=recipe.get(token.id),piece=text.slice(token.begin,token.end),node=document.createElement(edit?'mark':'span');
  node.textContent=piece;if(edit){node.title=`${edit.piece} [${edit.row}] → ${edit.destination_pieces.join(' / ')}; α=${edit.alpha}`;if(!shown.has(token.id)){const tag=document.createElement('span');tag.className='token-row';tag.textContent=`${edit.piece.replaceAll('▁','_')} → ${edit.destination_pieces.map(x=>x.replaceAll('▁','_')).join('/')} · α=${edit.alpha} · #${edit.row}`;q('token-rows').append(tag);shown.add(token.id)}}
  q('token-prompt').append(node);position=token.end;
 }
 if(position<text.length)q('token-prompt').append(document.createTextNode(text.slice(position)));
 const hasVideo=[...document.querySelectorAll('.video-example')].some(el=>el.id==='video-'+row.variant_id&&(el.dataset.suite||'libero_goal')===row.suite);
 q('prompt-status').textContent=zh?`${row.suite}，变体 ${row.variant_id}，难度 ${row.difficulty}。这条指令用到了 ${shown.size} 个被修改的词元。${hasVideo?'下方是这次实验的对应录像。':'这条指令没有附带录像。'}`:`${row.suite} / ${row.variant_id} · difficulty ${row.difficulty} · ${shown.size} edited token IDs read. ${hasVideo?'Archived paired videos below.':'No video attached for this prompt.'}`;
}
q('run').addEventListener('change',draw);
document.querySelectorAll('[data-scope]').forEach(b=>b.addEventListener('click',()=>{scope=b.dataset.scope;document.querySelectorAll('[data-scope]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()}));
q('prompt-form').addEventListener('submit',e=>{e.preventDefault();inspectPrompt()});q('prompt').addEventListener('change',inspectPrompt);
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{if(!results)return;const row=results.prompts.find(x=>x.suite===(b.dataset.suite||'libero_goal')&&String(x.variant_id)===b.dataset.example);q('prompt').value=row.instruction;inspectPrompt()}));
document.querySelectorAll('.play-pair').forEach(b=>b.addEventListener('click',()=>{b.closest('.video-example').querySelectorAll('video').forEach(v=>{v.currentTime=0;const p=v.play();if(p)p.catch(()=>{})})}));
q('prompts').replaceChildren();for(const row of results.prompts){const option=document.createElement('option');option.value=row.instruction;q('prompts').append(option)}
draw();})();(()=>{
 const root=document.getElementById('process-root');if(!root)return;
 const data=JSON.parse(document.getElementById('process-data').textContent);
 const el=id=>document.getElementById('process-'+id);
 let selected='language',position=1,timer=null;
 const zh=()=>document.documentElement.lang==='zh-CN';
 const t=value=>value[zh()?'zh':'en'];
 const say=(en,cn)=>zh()?cn:en;
 const current=()=>data.cases.find(c=>c.id===selected);
 const text=(id,value)=>{el(id).textContent=value};
 const download=(id,suffix)=>{const a=el(id),name='replay-'+selected+'-'+suffix;a.href=document.querySelector('[data-replay-resource="'+name+'"]').href;a.setAttribute('download',name)};
 function stop(){if(timer){clearInterval(timer);timer=null}text('play',say('▶ Play','▶ 播放'))}
 function move(next,manual=true){if(manual)stop();position=Math.max(1,Math.min(50,next));renderFeedback();renderChart();}
 function renderChart(){
  const c=current(),language=selected==='language',axis=[0,25,50,75,100];
  const y=v=>216-v*1.7,xx=[92,232,372];
  let svg='<svg viewBox="0 0 440 290" role="img" aria-label="'+t(c.chart_title)+'">';
  svg+=axis.map(v=>'<line x1="48" y1="'+y(v)+'" x2="416" y2="'+y(v)+'" stroke="#e3e6e9"/><text class="trace-axis" x="39" y="'+(y(v)+4)+'" text-anchor="end">'+v+'%</text>').join('');
  if(language)svg+='<path d="'+c.chart.map((p,i)=>(i?'L':'M')+xx[i]+','+y(p.edited/p.n*100)).join(' ')+'" fill="none" stroke="#9b4c3d" stroke-width="2.5"/>';
  else svg+='<circle cx="105" cy="18" r="4" fill="#8e9ba6"/><text x="115" y="22" class="trace-axis">'+say('Original','原始')+'</text><circle cx="240" cy="18" r="4" fill="#9b4c3d"/><text x="250" y="22" class="trace-axis">'+say('Edited','修改后')+'</text>';
  c.chart.forEach((p,i)=>{
   const val=p.edited/p.n*100,base=p.original/p.n*100;
   svg+='<g role="button" tabindex="0" data-request="'+p.pass+'" aria-label="'+say('Inspect request ','查看请求 ')+p.pass+'"><title>'+p.original+'/'+p.n+' → '+p.edited+'/'+p.n+'; '+say('request ','请求 ')+p.pass+'</title><rect x="'+(xx[i]-48)+'" y="30" width="96" height="245" fill="transparent" pointer-events="all"/>';
   if(!language)svg+='<line x1="'+xx[i]+'" y1="'+y(base)+'" x2="'+xx[i]+'" y2="'+y(val)+'" stroke="#c8cdd3" stroke-width="3"/><circle cx="'+xx[i]+'" cy="'+y(base)+'" r="5" fill="#8e9ba6"/>';
   svg+='<circle cx="'+xx[i]+'" cy="'+y(val)+'" r="6" fill="#9b4c3d" stroke="'+(position===p.pass?'#8c1515':'white')+'" stroke-width="'+(position===p.pass?3:2)+'"/><text class="trace-value" x="'+xx[i]+'" y="'+(Math.min(y(val),y(base))-18)+'" text-anchor="middle">'+(language?p.edited+'/'+p.n:((val-base)>0?'+':'')+(val-base).toFixed(1)+' pp')+'</text><text x="'+xx[i]+'" y="245" text-anchor="middle">'+t(p.label)+'</text><text class="trace-axis" x="'+xx[i]+'" y="265" text-anchor="middle">'+(language?(i===0?'0':i===1?'0.5':'1.0'):'n = '+p.n)+'</text></g>';
  });
  svg+='</svg>';el('chart').innerHTML=svg;
  el('chart').querySelectorAll('[data-request]').forEach(g=>{g.addEventListener('click',()=>move(+g.dataset.request));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();move(+g.dataset.request)}})});
 }
 function renderFeedback(){
  const c=current(),call=c.calls[position-1];el('range').value=position;
  text('position',say('Request ','请求 ')+position+' / 50 · '+say('turn ','第 ')+call.turn+(zh()?' 轮':''));
  el('range').setAttribute('aria-valuetext',say('Request ','请求 ')+position+' / 50');
  el('prev').disabled=position===1;el('next').disabled=position===50;
  text('call-kind',call.kind==='probe'?say('Fixed-input probe','固定输入探测'):say('Simulator rollout','仿真执行'));
  text('annotation',call.annotation?t(call.annotation):say('Inspect the returned result for this practice request. The candidate and sample can differ between requests.','查看这次练习请求的返回结果。不同请求可能使用不同候选和样本。'));
  const scores=el('scores');scores.replaceChildren();
  for(const arm of ['original','edited'])if(call.scores[arm]){
   const s=call.scores[arm],row=document.createElement('div');row.className='process-score-row '+arm;
   const label=document.createElement('span');label.textContent=arm==='original'?say('Original','原始'):say('Edited','修改后');
   const track=document.createElement('div');track.className='process-score-track';const bar=document.createElement('i');bar.style.width=(100*s.success/s.n)+'%';track.append(bar);
   const value=document.createElement('strong');value.textContent=s.success+'/'+s.n;row.append(label,track,value);scores.append(row);
  }
  if(call.kind==='probe'){
   const count=document.createElement('p');count.className='process-probe-count';count.textContent=String(call.inputs??'—')+' '+say('stored inputs','个已保存输入');scores.append(count);
  }
  const runtime=Object.values(call.scores).some(s=>s.runtime_failures>0);
  text('score-note',runtime?say('Raw tool counts include runtime failures. Valid-pair analysis and retries are documented in the notes.','工具原始计数包含运行失败。有效配对分析与重试见实验笔记。'):call.kind==='probe'?say('A probe returns actions or activations on stored inputs, not a new task-success rate.','探测返回固定输入上的动作或激活，不产生新的任务成功率。'):say('Returned practice-batch counts. Compare the two arms within this request.','这次练习批次返回的计数；比较的是同一次请求中的两组。'));
  text('call-source',call.source);text('tool-json',JSON.stringify({request:call.request,returned_result:call.output},null,2));
  el('ticks').querySelectorAll('span').forEach((tick,i)=>{tick.classList.toggle('active',i===position-1);tick.classList.toggle('future',i>position-1)});
  el('milestones').querySelectorAll('button').forEach(b=>{const active=+b.dataset.request===position;b.setAttribute('aria-current',String(active));if(active){const list=el('milestones'),item=b.getBoundingClientRect(),box=list.getBoundingClientRect();if(item.top<box.top)list.scrollTop+=item.top-box.top-5;else if(item.bottom>box.bottom)list.scrollTop+=item.bottom-box.bottom+5}});
 }
 function renderCase(){
  const c=current();
  root.querySelectorAll('[data-case]').forEach(b=>{const active=b.dataset.case===selected;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});
  el('panel').setAttribute('aria-labelledby','process-'+selected+'-tab');
  text('task-title',t(c.title));text('task-summary',t(c.task));text('task-original',c.prompt);
  text('outcome',t(c.outcome));text('outcome-detail',t(c.outcome_detail));
  text('code-source',c.code_source);text('code',c.code);text('notes',c.notes);text('recipe',JSON.stringify(c.recipe??[],null,2));
  el('recipe-details').hidden=selected!=='language';el('snapshots').hidden=selected!=='language';el('recovery-context').hidden=selected==='language';
  text('chart-title',t(c.chart_title));text('chart-note',t(c.chart_note));text('finish',t(c.final));
  for(const [id,suffix] of [['task-download','task.txt'],['code-download','edit.py'],['notes-download','notes.md'],['log-download','tool_calls.jsonl']])download(id,suffix);
  text('milestone-count',c.initial_steps.length+say(' milestones · scroll to explore',' 个节点 · 可上下滚动'));
  el('milestones').replaceChildren();
  for(const k of c.initial_steps){const call=c.calls[k-1],li=document.createElement('li'),b=document.createElement('button'),n=document.createElement('small'),body=document.createElement('span');b.type='button';b.dataset.request=k;n.textContent=String(k).padStart(2,'0');body.textContent=t(call.annotation);b.append(n,body);b.addEventListener('click',()=>move(k));li.append(b);el('milestones').append(li)}
  el('ticks').replaceChildren();for(const call of c.calls){const tick=document.createElement('span');tick.className=call.kind;el('ticks').append(tick)}
  text('play',timer?say('Ⅱ Pause','Ⅱ 暂停'):say('▶ Play','▶ 播放'));
  renderFeedback();renderChart();
 }
 function selectCase(id){stop();selected=id;position=1;renderCase()}
 root.querySelectorAll('[data-case]').forEach(b=>{b.addEventListener('click',()=>selectCase(b.dataset.case));b.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const id=e.key==='Home'?'language':e.key==='End'?'recovery':selected==='language'?'recovery':'language';selectCase(id);el(id+'-tab').focus()}})});
 el('prev').addEventListener('click',()=>move(position-1));el('next').addEventListener('click',()=>move(position+1));el('range').addEventListener('input',()=>move(+el('range').value));
 el('play').addEventListener('click',()=>{if(timer){stop();return}if(position===50)move(1);text('play',say('Ⅱ Pause','Ⅱ 暂停'));timer=setInterval(()=>{if(position>=50){stop();return}move(position+1,false);if(position===50)stop()},1300)});
 document.addEventListener('site-language-change',renderCase);
 window.addEventListener('pagehide',stop);
 renderCase();
})();


document.getElementById('hero-replay').addEventListener('click',()=>document.querySelectorAll('.hero-video video').forEach(v=>{v.currentTime=0;v.play().catch(()=>{})}));
let printDetails=[];window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('.print-expand')].map(e=>[e,e.open]);printDetails.forEach(([e])=>e.open=true)});window.addEventListener('afterprint',()=>printDetails.forEach(([e,wasOpen])=>e.open=wasOpen));
