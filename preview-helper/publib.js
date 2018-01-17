'use strict'
const _ = require('lodash')
const getLibFile = (pluginOptions, moduleName)=>{
  let index = pluginOptions.getPublicLibIndex(moduleName)
  if(!index){
    throw new Error(`模块${moduleName}未指定 index 入口文件`)
  }
  let moduleRootRelative = pluginOptions.getPublicLibDir(moduleName)

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
exports.helper = function(Handlebars, pluginOptions){
  Handlebars.registerHelper('publib', function(moduleName, ...args) {
    let handlebarOptions = args.pop();
    //模块相对项目路径
    let libArray =[]
    moduleName.split(',').forEach(function(item){
      item = item.replace(/\s/g, "")
      if(item == ""){
        return
      }
      libArray.push(item)
    })

    let scriptsArray = []

    for(let i = 0, len = libArray.length; i < len; i++){
      let fileExt = getLibFile(pluginOptions, libArray[i])
      if(fileExt == "css"){
        scriptsArray.push("<!--NEEDCSSGLOBAL-->")
      }
      if(fileExt == "js"){
        scriptsArray.push("<!--NEEDJSGLOBAL-->")
      }
    }
    return new Handlebars.SafeString(scriptsArray.join(''))
  })
}