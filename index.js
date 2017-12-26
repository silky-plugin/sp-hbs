'use strict';
const _ = require('lodash');
const _url = require('url');
const _path = require('path');
const _fs = require('fs-extra');
const _handlebars = require('handlebars');
const _helper = require('./helper');
const _getCompileContent = require('./getCompileContent');
const _prepareProcessDataConfig = require('./prepareProcessDataConfig');
const _async = require('async')

var _DefaultSetting = {
  "root": "/",
  "regexp": "(\.html)$",
  "data-config": false,
  "publib-to-dir":[{
    "path-match":"/js/publib/",
    "module":[],
    "dir":""
  }]
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
  //挂载工具函数
  _DefaultSetting.getPublicLibIndex = cli.getPublicLibIndex
  _DefaultSetting.getPublicLibDir = cli.getPublicLibDir
  _DefaultSetting.enviroment = cli.options.enviroment
  //加载handlebars  helper
  _helper(_handlebars, cli.ext['hbs'], _DefaultSetting);


  cli.registerHook('route:didRequest', (req, data, content, cb)=>{
    let pathname = data.realPath;
    if(path.indexOf("/publib/"))
  })

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
        data.outputFilePath = data.outputFilePath.replace(/(hbs)$/, "html")
        data.outputFileRelativePath = data.outputFileRelativePath.replace(/(hbs)$/, "html")
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
    for(let i = 0, length = data.fileArray.length; i < length; i++){
      let fileData = data.fileArray[i];
      if(fileData.isDir){continue};
      data.fileArray[i].href = fileData.href.substring(templateRoot.length).replace(/(hbs)$/, "html")
    }
    next()
  }, 50)

  cli.registerHook('build:end', (buildConfig, cb)=>{
    for(let key in cli.options.pluginsConfig){
      if(key.indexOf('sp') == 0){
        continue
      }
      let moduleImagesDir = _path.join(cli.cwd(), cli.options.pubModulesDir, key, "image")
      let outputImageDir =  _path.join(cli.options.buildConfig.outdir, "image", key)
      if(_fs.existsSync(moduleImagesDir)){
        _fs.copySync(moduleImagesDir, outputImageDir)
        cli.log.info(`pub modules copy dir '${key}/image' to '/image/${key}'`)
      } 
    }
    cb(null)
  }, 1)
}