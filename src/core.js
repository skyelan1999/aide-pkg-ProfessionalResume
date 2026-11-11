'use strict';
(function(root){
 const encoder=new TextEncoder(), clone=x=>JSON.parse(JSON.stringify(x)), uid=()=>crypto.randomUUID(), now=()=>new Date().toISOString();
 const MAX=15*1024*1024, PACKET_MAX=160*1024;
 const kinds=['experience','project','education','skill','certification','language','publication','award','volunteer','other'];
 function assert(v,message){if(!v)throw Error(message);}
 function string(v,max=20000){return typeof v==='string'&&v.length<=max;}
 function bytes(x){return encoder.encode(JSON.stringify(x)).length;}
 function array(v){assert(Array.isArray(v),'需要数组');return v;}
 function unique(rows){const ids=new Set();for(const r of rows){assert(r&&string(r.id,100)&&r.id&&!ids.has(r.id),'记录 ID 缺失或重复');ids.add(r.id);}return ids;}
 function fresh(){return {format:'professional-resume',schemaVersion:1,id:uid(),title:'我的职业资料库',revision:0,createdAt:now(),updatedAt:now(),profiles:[],targets:[],resumes:[],applications:[],tasks:[]};}
 function profile(){return {id:uid(),name:'新建个人档案',headline:'',email:'',phone:'',city:'',website:'',summary:'',preferences:'',entries:[],custom:{}};}
 function entry(kind='experience'){return {id:uid(),kind,title:'',organization:'',start:'',end:'',role:'',description:'',contribution:'',outcomes:'',evidence:'',verified:false};}
 function target(){return {id:uid(),company:'',legalName:'',website:'',location:'',role:'',jd:'',salary:'',notes:'',language:'zh-CN',research:null};}
 function validate(db){
  assert(db&&db.format==='professional-resume'&&db.schemaVersion===1,'不支持的资料库版本');
  assert(string(db.id,100)&&db.id&&string(db.title,300)&&Number.isSafeInteger(db.revision)&&db.revision>=0,'资料库元数据错误');
  assert(bytes(db)<=MAX,'当前资料库超过 15 MiB，请拆分为多个 .pr 文件');
  const pids=unique(array(db.profiles)),tids=unique(array(db.targets));unique(array(db.resumes));unique(array(db.applications));unique(array(db.tasks));
  for(const p of db.profiles){assert(string(p.name,300)&&string(p.summary)&&p.custom&&typeof p.custom==='object'&&!Array.isArray(p.custom),'个人档案错误');unique(array(p.entries));for(const e of p.entries)assert(kinds.includes(e.kind)&&string(e.title,500)&&string(e.description)&&string(e.contribution)&&string(e.outcomes)&&string(e.evidence)&&typeof e.verified==='boolean','履历条目错误');}
  for(const t of db.targets)assert(string(t.company,500)&&string(t.role,500)&&string(t.jd,60000)&&['zh-CN','en','bilingual'].includes(t.language),'岗位信息错误');
  for(const r of db.resumes){assert(pids.has(r.profileId)&&tids.has(r.targetId)&&string(r.title,500)&&string(r.markdown,250000),'简历关联或正文错误');unique(array(r.versions));}
  return db;
 }
 function bump(db){db.revision++;db.updatedAt=now();validate(db);return db;}
 function packet(db,profileId,targetId,selected){
  validate(db);const p=db.profiles.find(p=>p.id===profileId),t=db.targets.find(t=>t.id===targetId);assert(p&&t&&t.company.trim()&&t.role.trim()&&t.jd.trim(),'请选择个人档案并填写公司、岗位和职责');
  const chosen=new Set(selected);assert(chosen.size>0,'请至少选择一条履历证据');const entries=p.entries.filter(e=>chosen.has(e.id));assert(entries.length===chosen.size,'履历选择已变化');
  const evidence=entries.map(e=>({id:e.id,kind:e.kind,title:e.title,organization:e.organization,start:e.start,end:e.end,role:e.role,description:e.description,contribution:e.contribution,outcomes:e.outcomes,evidence:e.evidence,verified:e.verified}));
  const cleanTarget=clone(t);delete cleanTarget.research;
  const value={protocol:1,profileId:p.id,targetId:t.id,databaseId:db.id,createdAt:now(),candidate:{headline:p.headline,summary:p.summary,city:p.city,preferences:p.preferences},evidence,target:cleanTarget};
  assert(bytes(value)<=PACKET_MAX,'本次资料超过 160 KiB，请减少所选条目');return value;
 }
 function validatePacket(p){assert(p&&p.protocol===1&&string(p.databaseId,100)&&string(p.profileId,100)&&string(p.targetId,100)&&p.candidate&&p.target&&string(p.target.company,500)&&p.target.company.trim()&&string(p.target.role,500)&&p.target.role.trim()&&string(p.target.jd,60000)&&p.target.jd.trim(),'任务资料无效');assert(bytes(p)<=PACKET_MAX,'任务超过 160 KiB');unique(array(p.evidence));assert(p.evidence.length>0,'任务缺少履历');for(const e of p.evidence)assert(kinds.includes(e.kind)&&string(e.title,500)&&string(e.description)&&string(e.contribution)&&typeof e.verified==='boolean','任务履历无效');return p;}
 function publicURL(v){try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!!u.hostname&&!/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/.test(u.hostname)&&!/^\[|^\d+(?:\.\d+){3}$/.test(u.hostname);}catch(_){return false;}}
 function validateResult(result,p){
  validatePacket(p);assert(result&&result.protocol===1&&result.profileId===p.profileId&&result.targetId===p.targetId,'结果与个人/岗位不匹配');assert(bytes(result)<=220*1024,'结果超过 220 KiB');
  const r=result.resume;assert(r&&string(r.headline,500)&&string(r.summary,10000)&&Array.isArray(r.sections)&&r.sections.length>0&&r.sections.length<=40,'简历结构无效');
  const eids=new Set(p.evidence.map(e=>e.id));
  for(const s of r.sections){assert(string(s.title,300)&&Array.isArray(s.items)&&s.items.length<=200,'简历章节无效');for(const item of s.items){assert(string(item.text,10000)&&Array.isArray(item.evidenceIds)&&item.evidenceIds.length>0&&item.evidenceIds.every(id=>eids.has(id)),'简历陈述缺少有效履历依据');assert(['supported','needs_confirmation'].includes(item.status),'需要标记陈述核实状态');if(item.status==='supported')assert(item.evidenceIds.every(id=>p.evidence.find(e=>e.id===id)?.verified),'未核实履历不能生成已支持陈述');}}
  const research=result.research;assert(research&&['researched','unverified'].includes(research.status)&&string(research.overview)&&string(research.businessDirection)&&string(research.roleAnalysis)&&Array.isArray(research.sources)&&research.sources.length<=60,'企业调查结构无效');
  const sources=unique(research.sources);for(const s of research.sources)assert(publicURL(s.url)&&string(s.title,500)&&['official','filing','government','recruiting','media','other'].includes(s.kind)&&Number.isFinite(Date.parse(s.checkedAt))&&s.checkedAt.length<=35,'来源需要公开 HTTPS 链接、标题、类别和查询日期');
  if(research.status==='researched')assert(sources.size>0,'已调查状态需要来源');
  for(const f of array(research.findings)){assert(string(f.statement)&&['fact','inference','unknown'].includes(f.type)&&['high','medium','low'].includes(f.confidence)&&Array.isArray(f.sourceIds)&&f.sourceIds.every(id=>sources.has(id)),'调查发现结构或来源错误');if(f.type!=='unknown')assert(f.sourceIds.length>0,'事实和推断均需来源');}
  for(const risk of array(research.risks)){assert(string(risk.category,200)&&string(risk.description)&&['low','medium','high','unknown'].includes(risk.level)&&Array.isArray(risk.sourceIds)&&risk.sourceIds.every(id=>sources.has(id))&&Array.isArray(risk.questions)&&risk.questions.every(q=>string(q,2000)),'风险结构错误');if(['medium','high'].includes(risk.level))assert(risk.sourceIds.length>0,'中高风险判断需要来源');}
  assert(Array.isArray(research.unknowns)&&research.unknowns.every(v=>string(v,2000))&&Array.isArray(result.questions)&&result.questions.every(v=>string(v,2000)),'待核实问题无效');return result;
 }
 function markdown(result,p){validateResult(result,p);const r=result.resume;return '# '+r.headline+'\n\n'+r.summary+'\n\n'+r.sections.map(s=>'## '+s.title+'\n\n'+s.items.map(i=>'- '+i.text+(i.status==='needs_confirmation'?' 【待本人核实】':'')).join('\n')).join('\n\n')+'\n';}
 function applyResult(db,task,result){
  validateResult(result,task.packet);assert(task.packet.databaseId===db.id&&db.profiles.some(p=>p.id===result.profileId)&&db.targets.some(t=>t.id===result.targetId),'原档案/岗位已删除，不能导入');assert(!db.resumes.some(r=>r.taskId===task.id),'该任务结果已导入');
  const record={id:uid(),profileId:result.profileId,targetId:result.targetId,title:task.packet.target.company+' · '+task.packet.target.role,taskId:task.id,status:'draft',createdAt:now(),updatedAt:now(),markdown:markdown(result,task.packet),result:clone(result),sourceSnapshot:clone(task.packet),versions:[]};
  db.resumes.push(record);db.targets.find(t=>t.id===record.targetId).research=clone(result.research);bump(db);return record;
 }
 function saveVersion(r,text){assert(string(text,250000),'正文过长');r.versions.push({id:uid(),createdAt:now(),markdown:r.markdown});r.markdown=text;r.updatedAt=now();r.status='draft';}
 function keywords(text){return [...new Set((text.toLowerCase().match(/[a-z][a-z0-9+#./-]{1,30}|[\u4e00-\u9fff]{2,12}/g)||[]))].filter(w=>!['the','and','with','for','that','this','工作职责','任职要求','岗位职责','我们'].includes(w));}
 function match(text,jd){const terms=keywords(jd),found=terms.filter(k=>text.toLowerCase().includes(k));return {terms,found,missing:terms.filter(k=>!found.includes(k)),ratio:terms.length?Math.round(found.length/terms.length*100):0,label:'字面关键词覆盖率；不代表 ATS 评分或录用概率'};}
 function sample(){const db=fresh(),p=profile(),t=target();p.name='陈晓（虚构示例）';p.headline='系统工程师';p.city='天津';p.summary='面向工业设备的需求分析与系统验证。以下数据均为虚构示例。';p.entries=[{...entry('experience'),title:'工业设备系统设计',organization:'示例科技有限公司（虚构）',start:'2023-06',end:'2026-06',role:'系统工程师',description:'参与需求分析、接口设计与集成验证。',contribution:'本人负责接口需求追踪及测试方案编写；硬件设计由团队承担。',outcomes:'形成可追踪的验证记录；无已核实量化提升指标。',evidence:'虚构示例：接口清单与测试报告',verified:true},{...entry('project'),title:'设备监测项目（虚构）',contribution:'负责跨模块问题定位和验证用例维护。',description:'采集设备状态，支持故障复现与接口联调。',outcomes:'指标待补充。',evidence:'待补充',verified:false}];t.company='示例工业企业（虚构）';t.role='系统工程师';t.jd='负责工业设备系统需求、接口设计、集成验证、跨团队沟通。熟悉 Python，能够维护需求追踪及测试报告。';db.profiles.push(p);db.targets.push(t);return db;}
 const api={MAX,PACKET_MAX,kinds,clone,uid,now,assert,string,bytes,fresh,profile,entry,target,validate,bump,packet,validatePacket,validateResult,markdown,applyResult,saveVersion,match,publicURL,sample};
 if(typeof module!=='undefined')module.exports=api;else root.PRCore=api;
})(globalThis);
