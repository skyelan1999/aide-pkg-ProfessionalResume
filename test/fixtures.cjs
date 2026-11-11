'use strict';
const C=require('../src/core.js');
function fixture(){const db=C.sample(),packet=C.packet(db,db.profiles[0].id,db.targets[0].id,[db.profiles[0].entries[0].id]);return {db,packet};}
function result(p){return {protocol:1,profileId:p.profileId,targetId:p.targetId,resume:{headline:'系统工程师',summary:'工业设备需求与系统验证。',sections:[{title:'相关工作经历',items:[{text:'负责接口需求追踪及测试方案编写，配合团队开展工业设备集成验证。',evidenceIds:[p.evidence[0].id],status:'supported'}]}]},research:{status:'unverified',overview:'虚构测试公司，没有进行真实企业调查。',businessDirection:'业务方向待核实。',roleAnalysis:'岗位职责要求系统需求、接口设计与集成验证；需面试核实权责。',sources:[],findings:[{statement:'缺少经营披露。',type:'unknown',confidence:'low',sourceIds:[]}],risks:[{category:'信息不足',level:'unknown',description:'没有可核验公开资料，不能判断经营风险。',sourceIds:[],questions:['能否介绍岗位所在团队与产品线？']}],unknowns:['未查询公开企业资料；仅为自动化测试样本。']},questions:['请核实项目指标。']};}
module.exports={fixture,result};
