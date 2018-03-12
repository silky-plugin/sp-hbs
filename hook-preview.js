const _helper = require('./helper');
const _handlebars = require('handlebars');
const _path = require('path')
const _ = require('lodash');
const _fs = require('fs')
const _getPageData = require('./getPageData')
var viewCache = {}

const initViewCache = function(dir, relativeDir){
  if(!_fs.existsSync(dir)){
    return []
  }
  let files = _fs.readdirSync(dir)
  files.forEach((fileName)=>{
    let filePath = _path.join(dir, fileName);
    if(_fs.statSync(filePath).isDirectory()){
      initViewCache(filePath,  _path.join(relativeDir, fileName))
    }else{
      viewCache[_path.join(relativeDir, fileName)] = _fs.readFileSync(filePath, 'utf8')
    }
  })
}

module.exports = (cli, _DefaultSetting)=>{
  _helper.preview(_handlebars, _DefaultSetting)
  //判断该文件是否需要处理
  let isNeedCompile = (pathname)=>{
    let reg = new RegExp(_DefaultSetting.regexp)
    return reg.test(pathname.toLowerCase())
  }
  let viewDir = cli.options.buildConfig.outdir
  
  if(!_path.isAbsolute(viewDir)){
    viewDir = _path.join(cli.cwd(), viewDir)
  }
  initViewCache(viewDir, "/")

  cli.registerHook('preview:compile', (req, data, content, cb)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return cb(null, content)
    }
    let templateRoot =  _DefaultSetting.root || "";
    let fakeFilePath = _path.join(viewDir, templateRoot, pathname);

    let relativeFilePath = _path.join(templateRoot, pathname);
    //处理查询参数
    let originDataConfig = Object.assign({}, _DefaultSetting.dataConfig)

    if(originDataConfig.urlMap){
      originDataConfig.urlMap.queryParams = _.extend({}, originDataConfig.urlMap.queryParams, req.query)
    }
    //替换路径为hbs
    let realFilePath = fakeFilePath.replace(/(html)$/,'hbs')
    let fileContent = viewCache[relativeFilePath.replace(/(html)$/,'hbs')]
    _getPageData(cli, fileContent, data, realFilePath, relativeFilePath, originDataConfig, (err, pageData)=>{
      if(err){
        return cb(err)
      }
      try{
        let template = _handlebars.compile(fileContent)
        let html = template(pageData)
        data.status = 200
        cb(null, html)
      }catch(e){
        cb(e)
      }
    })
  })
}