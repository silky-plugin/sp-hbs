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
  "root": "/",
  "regexp": "(\.html)$",
  "data-config": false
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

  //挂载配置数据
  _DefaultSetting.dataConfig = _dataConfig
  //挂载工作目录
  _DefaultSetting.cwd = cli.cwd;
  //加载handlebars  helper
  _helper(_handlebars, cli.ext['hbs'], _DefaultSetting);
  cli.registerHook('route:didRequest', (req, data, content, cb)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return cb(null, content)
    }

    let templateRoot =  _DefaultSetting.root || "";
    let fakeFilePath = _path.join(cli.cwd(), templateRoot, pathname);

    let relativeFilePath = _path.join(templateRoot, pathname);

    //替换路径为hbs
    let realFilePath = fakeFilePath.replace(/(html)$/,'hbs')
    _getCompileContent(cli, data, realFilePath, relativeFilePath, _dataConfig, (error, data, content)=>{
      if(error){
        cli.log.error(`出错文件: ${realFilePath}`)
        return cb(error)
      };
      //交给下一个处理器
      cb(null, content)
    })
  },1)


  cli.registerHook('build:doCompile', (buildConfig, data, content, cb)=>{
    let inputFilePath = data.inputFilePath;
    if(!/(\.hbs)$/.test(inputFilePath)){
      return cb(null, content)
    }
    _getCompileContent(cli, data, inputFilePath, data.inputFileRelativePath, _dataConfig, (error, resultData, content)=>{
      if(error){
        return  cb(error);
      }
      _.extend(data, resultData);
      if(data.status == 200){
        data.outputFilePath = data.outputFilePath.replace(/(\hbs)$/, "html")
        data.outputFileRelativePath = data.outputFileRelativePath.replace(/(\hbs)$/, "html")
      }
      cb(error, content);
    })
  }, 1)
  //响应模版下的文件
  cli.registerHook('route:dir', (path, data, next)=>{
    let templateRoot =  _DefaultSetting.root || "/";
    if(path.indexOf(templateRoot) != 0){
      return next()
    }
    console.log(data.fileArray)
    for(let i = 0, length = data.fileArray.length; i < length; i++){
      let fileData = data.fileArray[i];
      if(fileData.isDir){continue};
      data.fileArray[i].href = fileData.href.substring(templateRoot.length).replace(/(\hbs)$/, "html")
    }
    next()
  }, 50)

}