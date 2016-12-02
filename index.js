'use strict';
const _ = require('lodash');
const _url = require('url');
const _path = require('path');
const _fs = require('fs'); 
const _handlebars = require('handlebars');
const _helper = require('./helper');
const _fetchData = require('./fetch-data');
const _getCompileContent = require('./getCompileContent');
const _prepareProcessDataConfig = require('./prepareProcessDataConfig');
const _async = require('async')

var _DefaultSetting = {
  "root": ".",
  "regexp": "(\.html)$",
  "global": "",
  "global-root": "__global"
}


//判断该文件是否需要处理
const isNeedCompile = (pathname)=>{
  let reg = new RegExp(_DefaultSetting.regexp)
  return reg.test(pathname.toLowerCase())
}

exports.registerPlugin = function(cli, options){
  //继承定义
  _.extend(_DefaultSetting, options);

  //预处理页面数据配置
  let _dataConfig = _prepareProcessDataConfig(cli, _DefaultSetting)

  //预处理全局变量
  let globalVarName = _DefaultSetting["global-root"]
  
  let globalVar = {};
  if(_DefaultSetting.global && _DefaultSetting.global.replace(/ /g, "") !== ""){
    globalVar = cli.runtime.getRuntimeEnvFile(_DefaultSetting.global)
  }
  _dataConfig.globalData = {};
  _dataConfig.globalData[globalVarName] = globalVar

  //加载handlebars  helper
  _helper(_handlebars, cli.ext['hbs']);

  cli.registerHook('route:didRequest', (req, data, content, cb)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return cb(null, data, content)
    } 
    
    let templateRoot =  _DefaultSetting.root || "";
    let fakeFilePath = _path.join(cli.cwd, templateRoot, pathname);

    let relativeFilePath = _path.join(templateRoot, pathname);

    //替换路径为hbs
    let realFilePath = fakeFilePath.replace(/(html)$/,'hbs')
    _getCompileContent(cli, data, realFilePath,  relativeFilePath, _dataConfig, (error, data, content)=>{
      if(error){return cb(error)};
      //交给下一个处理器
      cb(null, data, content)
    })
  },1)


  cli.registerHook('build:doCompile', (data, content, cb)=>{
    let inputFilePath = data.inputFilePath;
    if(!/(\.hbs)$/.test(inputFilePath)){
      return cb(null, data, content)
    }
    _getCompileContent(cli, data, inputFilePath, data.inputFileRelativePath  ,_dataConfig, (error, data, content)=>{
      if(error){return  cb(error);}
      if(data.status == 200){
        data.outputFilePath = data.outputFilePath.replace(/(\hbs)$/, "html")
      }

      cb(error, data, content);
    })

  }, 1)
}