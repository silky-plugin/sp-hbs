'use strict';
const _ = require('lodash');
const _path = require('path');
const _fs = require('fs');

//获取模块真实路径
function getModuleRealPathName(moduleName, pluginOptions, pageData){
  let dataConfig = pluginOptions.dataConfig;
  //用来支持新版首页 //是否配置了模版映射
  if(dataConfig.moduleMap[moduleName]){
    moduleName = dataConfig.moduleMap[moduleName]
  }

  //获取到上下文环境 用来编译数据路径
  moduleName = moduleName.replace(/<(.+)>/, (match, xPath)=>{
    if(!xPath){
      return undefined
    }
    let value = _.extend({}, pageData)
    let xPathArr = xPath.split('.');
    for(let i = 0, length = xPathArr.length; i < length; i++){
      //TODO _ 也是全局变量的意思 直接忽略 奇葩
      if(xPathArr[i] == '_'){
        continue;
      }
      if(!value[xPathArr[i]]){
        value = undefined;
        break
      }
      value = value[xPathArr[i]]
    }
    return value
  })

  //如果不是
  if(moduleName.indexOf('/') == 0){
    moduleName = _path.join(pluginOptions.cwd(), moduleName)
  }else{
    moduleName = _path.join(pluginOptions.cwd(), pluginOptions.root, moduleName)
  }
  return moduleName;
};

exports.helper = (Handlebars, pluginOptions)=>{
  Handlebars.registerHelper('import', function(moduleName, ...args){
    if(!moduleName){
      throw new Handlebars.Exception('引入不存在模块');
    }

    let handlebarOptions = args.pop();

    //获取模块真实路径
    moduleName = getModuleRealPathName(moduleName, pluginOptions, handlebarOptions.data.root)

    //是否存在html 存在html返回html， 存在hbs返回编译hbs
    let htmlPath,hbsPath;
    htmlPath = hbsPath = moduleName;
    //查看是否存在 ext， 添加后缀
    if(!_path.extname(moduleName)){
      htmlPath = `${moduleName}.html`;
      hbsPath = `${moduleName}.hbs`;
    }

    //如果存在html直接 返回内容
    if(_fs.existsSync(htmlPath) && /(\.html)$/.test(htmlPath)){
      return new Handlebars.SafeString(_fs.readFileSync(htmlPath, 'utf8'))
    }
    //如果html和hbs都不存在则返回 error到编译页面。
    if(!_fs.existsSync(hbsPath)){
      throw new Handlebars.Exception(`引入不存在模块 ${hbsPath}`);
      //console.warn(`引入模块不存在 ${hbsPath}`.red)
      //return new Handlebars.SafeString(`<!-- Error: cannot find module ${moduleName} -->`)
    }

    //如果hbs存在
    let template = Handlebars.compile(_fs.readFileSync(hbsPath, 'utf8'))

    //--------------START
    //将import 进来的数据，扩展一个 $ + index 进行模块内数据引用的方式
    let context = _.extend({}, handlebarOptions.data.root);
    for(let i = 0, length = args.length; i < length; i++){
      context[`$${i}`] = args[i]
    }
    context.$current = context.$0
    //---------------END
    return new Handlebars.SafeString(template(context))
  })
}
