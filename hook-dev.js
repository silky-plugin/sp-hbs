const _helper = require('./helper');
const _ = require('lodash');
const _getCompileContent = require('./getCompileContent');
const _handlebars = require('handlebars');
const _path = require('path')
const _getPageData = require('./getPreviewPageData')
const _fs = require('fs')
module.exports = (cli, _DefaultSetting)=>{
  //判断该文件是否需要处理
  let isNeedCompile = (pathname)=>{
    let reg = new RegExp(_DefaultSetting.regexp)
    return reg.test(pathname.toLowerCase())
  }
  
  //加载handlebars  helper
  _helper.normal(_handlebars, cli.ext['hbs'], _DefaultSetting);


  cli.registerHook('route:didRequest', async (req, data, content)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return content
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

    if(!_fs.existsSync(realFilePath)){
      return content
    }
    let fileContent = _fs.readFileSync(realFilePath, 'utf8')
    let pageData = await _getPageData(cli, fileContent, data, realFilePath, relativeFilePath, originDataConfig)
    let template = _handlebars.compile(fileContent)
    data.status = 200
    return template(pageData)
  },1)

  //响应模版下的文件
  cli.registerHook(['route:dir', 'preview:dir'], async (path, data)=>{
    let templateRoot =  _DefaultSetting.root || "/";
    if(path.indexOf(templateRoot) != 0){
      return
    }
    for(let i = 0, length = data.fileArray.length; i < length; i++){
      let fileData = data.fileArray[i];
      if(fileData.isDir){continue};
      data.fileArray[i].href = fileData.href.substring(templateRoot.length).replace(/(hbs)$/, "html")
    }
    return
  }, 50)
}