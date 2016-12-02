const _path = require('path');

module.exports = (cli, setting)=>{
  if(!setting['data-config']){
    return {
      dataMap: {},
      urlMap: {}
    }
  }

  let dataConfig = cli.runtime.getRuntimeEnvFile(setting["data-config"])
  if(!dataConfig["dataMap"]){
    dataConfig["dataMap"] = {}
  }
  if(!dataConfig['urlMap']){
    dataConfig['urlMap'] = {}
  }
  //修改data-map配置，使其同时满足 start和 build，主要在于是否设置了 hbs的root目录
  let hbsRoot = setting.root;
  if(hbsRoot){
    let dataMap = {};
    Object.keys(dataConfig["dataMap"]).forEach((key)=>{
      dataMap[_path.join(hbsRoot, key)] = dataConfig["dataMap"][key]
    })
    dataConfig["dataMap"] = dataMap
  }
  return dataConfig
}