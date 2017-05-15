'use strict'
const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')

const pathToUrl = (pathname)=>{
  return pathname.replace(/\/\//g,"/").replace(/(\\)+/g, "/")
}

exports.helper = function(Handlebars, pluginOptions){
  Handlebars.registerHelper('pub', function(moduleName, ...args) {
    if(!moduleName){
      throw new Handlebars.Exception('引入不存在模块');
    }
    let handlebarOptions = args.pop();

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
      throw new Handlebars.Exception(`找不到组件${moduleName}的入口文件`);
    }

    let modulesRoot = pluginOptions.getPublicLibDir(moduleName)
    let moduleRootDir = _path.join(pluginOptions.cwd(), modulesRoot);
    let pubFilePath = _path.join(moduleRootDir, index)
    if(!_fs.existsSync(pubFilePath)){
      throw new Handlebars.Exception(`找不到组件${moduleName}的入口文件${pubFilePath}`);
    }
    let htmlContent = _fs.readFileSync(pubFilePath, 'utf8');
    //-------- add  'component' attribute to <script>
    let scriptReg = /<script\b\s+[^>]*src\=['"]([^> '"]+)+['"][^>]*>([\s\S]*?)/gm
    htmlContent = htmlContent.replace(scriptReg, (line, match)=>{
      if(/^(http\:|https\:)?\/\//.test(match)){
        return line
      }
      line = pathToUrl(line.replace(match, "/" + modulesRoot + "/" + match))
      return line.replace(/<script\b([^>]+)>/, (href, m)=>{
        return  "<script" + m +  " component>"
      })
    })
    //------- add 'component' attribute to <link>
    let styleReg = /<link\b\s+[^>]*href\=['"]([^> '"]+)+['"][^>]*>([\s\S]*?)/gm
    htmlContent = htmlContent.replace(styleReg, (line, match)=>{
      if(/^(http\:|https\:)?\/\//.test(match)){
        return line
      }
      line = pathToUrl(line.replace(match, "/" + modulesRoot + "/" + match))
      if(line.indexOf("text/css") == -1 && line.indexOf("stylesheet") == -1){
        return line
      }
      return line.replace(/<link\b([^>]+)>/, (href, m)=>{
        return  "<link" + m +  " component>"
      })
    })
    let template = Handlebars.compile(htmlContent)
    //--------------START

    //-------支持公共组件图片路径, 和 __pubRoot 公共组件再引用[pub中import]
    let imagesPath = pathToUrl("/"+_path.join(modulesRoot, "image"))
    let context = {__pub: imagesPath, __pubRoot:moduleRootDir}
    context[moduleName+"_img"] = imagesPath

    _.extend(context,  handlebarOptions.data.root);
    //环境pub定义
    if(pluginOptions.dataConfig.getPubImageRoot){
      context.__pub = pluginOptions.dataConfig.getPubImageRoot(moduleName)
    }
    //-----------

    //是否不要代码统计
    let needStatistics = true
    if(args[args.length -1] == "__ns"){
      needStatistics = false
      //移除
      args.pop()
    }

    //将import 进来的数据，扩展一个 $ + index 进行模块内数据引用的方式
    for(let i = 0, length = args.length; i < length; i++){
      context[`$${i}`] = args[i]
    }
    if(context.$0){
      context.$current = context.$0
    }
    //---------------END
    let html = template(context)
    //代码统计
    let statistics = pluginOptions.dataConfig.statistics;
    if(!statistics || !needStatistics){
      return new Handlebars.SafeString(html)
    }
    if(typeof statistics == "string"){
      return new Handlebars.SafeString(html + statistics)
    }
    if(typeof statistics == "function"){
      return new Handlebars.SafeString(statistics(html))
    }
    throw new Error("config statistics is unuseable.")
  });
}