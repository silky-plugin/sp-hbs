'use strict'
const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')

const getLibFile = (pluginOptions, moduleName, mergetTo)=>{
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
    return `<link type="text/css" rel="stylesheet" href="/${_path.join(moduleRootRelative, fileNameNoSuffix).replace(/(\\)+/g, "/")}.css" component>`
  }

  if ( _.indexOf(jsArray, suffix) != -1){
    return `<script src="/${_path.join(moduleRootRelative, fileNameNoSuffix).replace(/(\\)+/g, "/")}.js" component></script>`
  }

  throw new Error("模块${moduleName}入口文件${index} 不支持 publib引用")
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

    libArray.sort()
    let mergetTo = args.length == 0 ? libArray.join('_') : args[1]

    let scriptsArray = []
    for(let i = 0, len = libArray.length; i < len; i++){
      scriptsArray.push(getLibFile(pluginOptions, libArray[i], mergetTo))
    }

    return new Handlebars.SafeString(scriptsArray.join(''))
  })
}