'use strict';
const _ = require('lodash');
const _prepareProcessDataConfig = require('./prepareProcessDataConfig');

var _DefaultSetting = {
  "root": "/",
  "regexp": "(\.html)$",
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
  //加载不同helper
  //TODO
  //检查 插件版本对silky的要求避免安装错误
  switch(cli.options.runType){
    case "precompile":
      let prebuildHook = require('./hook-prebuild')
      prebuildHook(cli, _DefaultSetting)
      break
    case "preview":
      let previewHook = require('./hook-preview')
      previewHook(cli, _DefaultSetting)
      break
    case "dev":
      let devHook = require('./hook-dev')
      devHook(cli, _DefaultSetting)
      break
    case "build":
      let buildHook = require('./hook-build')
      buildHook(cli, _DefaultSetting)
      break
    default:
      console.log("不可识别运行类别")
  }
}