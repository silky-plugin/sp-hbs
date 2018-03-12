const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')

const pathToUrl = (pathname)=>{
  return pathname.replace(/\/\//g,"/").replace(/(\\)+/g, "/")
}

//获取映射关系
function getPubModuleMap(moduleName, pluginOptions){
  let dataConfig = pluginOptions.dataConfig || {};
  if(!dataConfig || !dataConfig.pubModuleMap){
    return moduleName
  }
  return dataConfig.pubModuleMap[moduleName] || moduleName
}
function getModuleContent(moduleName, pluginOptions){
  let originModuleName = moduleName;
  moduleName = getPubModuleMap(moduleName, pluginOptions)
  let index = ""
  // pub "xxx/xxx.hbs" 指定文件位置
  if(moduleName.indexOf('/') != -1){
    let modulePathArray = moduleName.split('/')
    moduleName = modulePathArray.shift()
    index = modulePathArray.join('/')
  }else{
    index = pluginOptions.getPublicLibIndex(moduleName)
  }
  
  if(!index){
    throw new Error(`找不到组件${moduleName}的入口文件`);
  }
  let modulesRoot = pluginOptions.getPublicLibDir(moduleName)
  let moduleRootDir = _path.join(pluginOptions.cwd(), modulesRoot);
  let pubFilePath = _path.join(moduleRootDir, index)
  if(!_fs.existsSync(pubFilePath)){
    throw new Error(`找不到组件${moduleName}的入口文件${pubFilePath}`);
  }
  let htmlContent = _fs.readFileSync(pubFilePath, 'utf8');
  //-------- add  'component' attribute to <script>
  let scriptReg = /<script\b\s+[^>]*src\=['"]([^> '"]+)+['"][^>]*>([\s\S]*?)/gm
  htmlContent = htmlContent.replace(scriptReg, "<!--NEEDJSGLOBAL-->")
  //------- add 'component' attribute to <link>
  let styleReg = /<link\b\s+[^>]*href\=['"]([^> '"]+)+['"][^>]*>([\s\S]*?)/gm
  htmlContent = htmlContent.replace(styleReg, "<!--NEEDCSSGLOBAL-->")

  let importReg = /\{\{\s*import\s+["']?([^}"']+)["']?\}\}/
  let importExists = true

  while(importExists){
    if(htmlContent.match(importReg)){
      htmlContent = htmlContent.replace(importReg, (line, match)=>{
        let filepath = _path.join(moduleRootDir, match);
        if(!_path.extname(filepath)){
          filepath = `${filepath}.hbs`;
        }
        return _fs.readFileSync(filepath, 'utf8')
      })
    }else{
      importExists = false
    }
  }
  //-------支持公共组件图片路径, 和 __pubRoot 公共组件再引用[pub中import]
  let imagesPath = pathToUrl("/"+_path.join(modulesRoot, "image"))
  htmlContent = htmlContent.replace(/\{\{\s*__pub\s*\}\}/g, imagesPath)
  return htmlContent
}

module.exports = (modulestring, pluginOptions)=>{
  let moduleHTML =[]
  modulestring.split(',').forEach(function(item){
    item = item.replace(/\s/g, "")
    if(item == ""){
      return
    }
    moduleHTML.push(getModuleContent(item, pluginOptions))
  })
  return moduleHTML.join('\n')
}