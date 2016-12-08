const _path = require('path');
const _ = require('lodash')
module.exports = (cli, setting)=>{
  let defConfig = {
    dataMap: {},
    urlMap: {},
    moduleMap: {},
    global: {},
    globalRoot: "__global",
    formatPageData: (url, context)=>{return context}
  }

  if(!setting['data-config']){
    return defConfig
  }

  let dataConfig = cli.runtime.getRuntimeEnvFile(setting["data-config"])
  
  dataConfig = _.extend({}, defConfig, dataConfig)

  //修改data-map配置，使其同时满足 start和 build，主要在于是否设置了 hbs的root目录
  let hbsRoot = setting.root;
  if(!hbsRoot){
    return dataConfig
  }

  let dataMap = {};
  Object.keys(dataConfig["dataMap"]).forEach((key)=>{
    dataMap[_path.join(hbsRoot, key)] = dataConfig["dataMap"][key]
  })
  dataConfig["dataMap"] = dataMap;

  return dataConfig
}