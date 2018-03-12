const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')

module.exports = (moduleName, pluginOptions)=>{
  let importModuleName = moduleName
  if(!moduleName){
    throw new Error('引入不存在模块,请检查页面数据');
  }
  let dataConfig = pluginOptions.dataConfig;
  //用来支持新版首页 //是否配置了模版映射
  if(dataConfig.moduleMap[moduleName]){
    moduleName = dataConfig.moduleMap[moduleName]
  }
  moduleFilePath = _path.join(pluginOptions.cwd(), pluginOptions.root, moduleName)
  
  let hbsFilePath, htmlFilePath;


  if(!_path.extname(moduleFilePath)){
    hbsFilePath = `${moduleFilePath}.hbs`;
    htmlFilePath =`${moduleFilePath}.html`;
  }

  //如果存在html直接 返回内容
  if(_fs.existsSync(htmlFilePath) && /(\.html)$/.test(htmlPath)){
    return _fs.readFileSync(htmlFilePath, 'utf8')
  }
  //如果存在hbs直接  返回内容
  if(_fs.existsSync(hbsFilePath) && /(\.hbs)$/.test(hbsFilePath)){
    return _fs.readFileSync(hbsFilePath, 'utf8')
  }
  return new Error(`找不到模板${moduleName}`)
}