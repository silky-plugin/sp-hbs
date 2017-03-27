'use strict'
const _ = require('lodash')
const _path = require('path')
const _fs = require('fs')
exports.helper = function(Handlebars, pluginOptions){
  Handlebars.registerHelper('pub', function(moduleName, ...args) {
    if(!moduleName){
      throw new Handlebars.Exception('引入不存在模块');
    }
    let handlebarOptions = args.pop();
    let modulesRoot = pluginOptions.getPublicLibDir(moduleName)

    let moduleRootDir = _path.join(pluginOptions.cwd(), modulesRoot);

    try{
      let packageJSON = require(_path.join(moduleRootDir, "package.json"));
      let index = pluginOptions.getPublicLibIndex(moduleName)
      if(!index){
        throw new Error(`找不到组件${moduleName}的入口文件`)
      }
      index = _path.join(moduleRootDir, index)
      let htmlContent = _fs.readFileSync(index, 'utf8');

      //-------- add  'component' attribute to <script>
      let scriptReg = /<script\b\s+[^>]*src\=['"]([^> '"]+)+['"][^>]*>([\s\S]*?)/gm
      htmlContent = htmlContent.replace(scriptReg, (line, match)=>{
        if(/^(http\:|https\:)?\/\//.test(match)){
          return line
        }
        line = line.replace(match, "/" + modulesRoot + "/" + match).replace(/\/\//g,"/")
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
        line = line.replace(match, "/" + modulesRoot + "/" + match).replace(/\/\//g,"/")
        if(line.indexOf("text/css") == -1 && line.indexOf("stylesheet") == -1){
          return line
        }
        return line.replace(/<link\b([^>]+)>/, (href, m)=>{
          return  "<link" + m +  " component>"
        })
      })

      let template = Handlebars.compile(htmlContent)
      //--------------START
     
     
      //-------支持公共组件图片路径
      let context = {__pub: _path.join(pluginOptions.getPublicLibDir(moduleName), "images").replace(/\/\//g,"/")}  
      _.extend(context,  handlebarOptions.data.root);
      //环境pub定义
      if(pluginOptions.dataConfig.getPubImageRoot){
        context.__pub = pluginOptions.dataConfig.getPubImageRoot(moduleName)
      }
      //-----------


       //将import 进来的数据，扩展一个 $ + index 进行模块内数据引用的方式
      for(let i = 0, length = args.length; i < length; i++){
        context[`$${i}`] = args[i]
      }
      context.$current = context.$0
      //---------------END

      //代码统计
      let statistics = pluginOptions.dataConfig.statistics;
      if(!statistics){
        return new Handlebars.SafeString(template(context))
      }
      if(typeof statistics == "string"){
        return new Handlebars.SafeString(template(context) + statistics)
      }
      if(typeof statistics == "function"){
        return new Handlebars.SafeString(statistics(template(context)))
      }

      throw new Error("config statistics is unuseable.")
      
    }catch(e){
      console.log(e)
      throw new Handlebars.Exception('引入不存在模块');
    }
  });
}