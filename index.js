'use strict';
const string={type:'string'};
module.exports={name:'professional-resume',apply(ctx){
 ctx.tool({name:'pr_guide',description:'Professional Resume 使用指南、隐私边界、企业调查规范和结构化简历结果格式。首次处理 .pr 简历任务先读取。',parameters:{type:'object',properties:{},additionalProperties:false},scheduling:{resources:[]},handler(){return require('./tasks.js').guide();}});
 ctx.tool({name:'pr_tasks',description:'Professional Resume 的工作区隔离临时任务。按用户提供的任务 ID get 获取选定履历/JD；使用 Aide 联网工具实际调查，按证据生成简历，再 complete 回填。禁止凭空编造经历或来源。create 需用户明确同意；不会读取或解密 .pr 密码。',parameters:{type:'object',properties:{action:{enum:['create','get','complete','result','delete']},id:string,consent:{type:'boolean'},packet:{type:'object'},packetHash:string,result:{type:'object'}},required:['action'],additionalProperties:false},handler(a,api){return require('./tasks.js').createService()(a,api);}});
 ctx.tool({name:'pr_validate',description:'校验 Professional Resume 定制简历、履历依据、调查引用和风险结构；结构校验不证明事实为真。必须提供本次任务 packet 与 result。',parameters:{type:'object',properties:{packet:{type:'object'},result:{type:'object'}},required:['packet','result'],additionalProperties:false},scheduling:{resources:[]},handler(a){require('./src/core.js').validateResult(a.result,a.packet);return {valid:true,notice:'结构与引用关系已校验，事实、原始证据和实时信息仍需核实。'};}});
}};
