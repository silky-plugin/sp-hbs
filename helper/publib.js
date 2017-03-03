'use strict'
const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')

const getLibFile = (pluginOptions, moduleName, mergetTo)=>{
  let modulesDir = pluginOptions["pub-modules"]
  let moduleRootRelative = _path.join("/",modulesDir, moduleName)
  let moduleRootAbsolute = _path.join(pluginOptions.cwd(), moduleRootRelative)
  if(!_fs.existsSync(_path.join(moduleRootAbsolute, "package.json"))){
    throw new Error(`引入不存在模块: ${moduleName}`);
  }

  let packageJSON = require(_path.join(moduleRootAbsolute, "package.json"));
  let index = packageJSON.index
  if(!index){
    //
    let files = _fs.readdirSync(moduleRootAbsolute)
    for(let i = 0, len = files.length; i < len; i++){
      if(/^index\./.test(files[i])){
        index = files[i]
        break
      }
    }
    if(!index){
      throw new Error(`模块${moduleName}未指定 index 入口文件`)
    }
    let suffix = index.split('.').pop()

    let fileNameNoSuffix = index.replace(/\.\w+$/, "")

    let cssArray = ["css", "less", "sass"]
    let jsArray = ["coffee", "js", "ts"]

    if ( _.indexOf(cssArray, suffix) != -1){
      return `<link type="text/css" rel="stylesheet" href="${_path.join(moduleRootRelative, fileNameNoSuffix)}.css" component>`
    }

    if ( _.indexOf(jsArray, suffix) != -1){
      return `<script src="${_path.join(moduleRootRelative, fileNameNoSuffix)}.js" component></script>`
    }

    throw new Error("模块${moduleName}入口文件${index} 不支持 publib引用")

  }
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