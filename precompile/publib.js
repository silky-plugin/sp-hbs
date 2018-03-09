const _ = require('lodash')
const getLibFile = (pluginOptions, moduleName)=>{
  let index = pluginOptions.getPublicLibIndex(moduleName)
  if(!index){
    throw new Error(`模块${moduleName}未指定 index 入口文件`)
  }
  let suffix = index.split('.').pop()
  let fileNameNoSuffix = index.replace(/\.\w+$/, "")

  let cssArray = ["css", "less", "sass"]
  let jsArray = ["coffee", "js", "ts"]

  if ( _.indexOf(cssArray, suffix) != -1){
    return "css"
  }

  if ( _.indexOf(jsArray, suffix) != -1){
    return "js"
  }
  return ""
}

function getModuleContent(moduleName, pluginOptions){
  let scriptsArray = []
  let fileExt = getLibFile(pluginOptions, moduleName)
  if(fileExt == "css"){
    scriptsArray.push("<!--NEEDCSSGLOBAL-->")
  }
  if(fileExt == "js"){
    scriptsArray.push("<!--NEEDJSGLOBAL-->")
  }
  return scriptsArray.join('')
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