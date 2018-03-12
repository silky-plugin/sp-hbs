const _helper = require('./helper');
const _ = require('lodash');
const _getCompileContent = require('./getCompileContent');
const _handlebars = require('handlebars');
const _path = require('path')
module.exports = (cli, _DefaultSetting)=>{
  //判断该文件是否需要处理
  let isNeedCompile = (pathname)=>{
    let reg = new RegExp(_DefaultSetting.regexp)
    return reg.test(pathname.toLowerCase())
  }
  
  //加载handlebars  helper
  _helper.normal(_handlebars, cli.ext['hbs'], _DefaultSetting);
  cli.registerHook('route:didRequest', (req, data, content, cb)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return cb(null, content)
    }
    let templateRoot =  _DefaultSetting.root || "";
    let fakeFilePath = _path.join(cli.cwd(), templateRoot, pathname);

    let relativeFilePath = _path.join(templateRoot, pathname);
    //处理查询参数
    let originDataConfig = Object.assign({}, _DefaultSetting.dataConfig)

    if(originDataConfig.urlMap){
      originDataConfig.urlMap.queryParams = _.extend({}, originDataConfig.urlMap.queryParams, req.query)
    }
    //替换路径为hbs
    let realFilePath = fakeFilePath.replace(/(html)$/,'hbs')
    _getCompileContent(cli, data, realFilePath, relativeFilePath, originDataConfig, (error, data, content)=>{
      if(error){
        cli.log.error(`出错文件: ${realFilePath}`)
        return cb(error)
      };
      //交给下一个处理器
      cb(null, content)
    })
  },1)
  //响应模版下的文件
  cli.registerHook(['route:dir', 'preview:dir'], (path, data, next)=>{
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
}