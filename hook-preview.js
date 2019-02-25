const _helper = require('./helper');
const _handlebars = require('handlebars');
const _path = require('path')
const _ = require('lodash');
const _fs = require('fs')
const _getPageData = require('./getPreviewPageData')
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
      let content = _fs.readFileSync(filePath, 'utf8')
      let result = /\{\{\!\-\-\s*PAGE_DATA\s*[:]\s*(.+)\s*\-\-\}\}/g.exec(content)
      let dataURL = false;
          //获取首个匹配项
      if(result && result[1]){
        dataURL = result[1].replace(/\s/g, "")
      }
      viewCache[_path.join(relativeDir, fileName)] = {
        fn: _handlebars.compile(content),
        dataURL: dataURL
      }
      console.log(`缓存 ${fileName} ...`)
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
  console.log("开始缓存")
  initViewCache(viewDir, "/")
  console.log("缓存完成")
  cli.registerHook('preview:project:update', ()=>{
    console.log("开始刷新缓存...")
    initViewCache(viewDir, "/")
    console.log("刷新缓存完成")
  })
  cli.registerHook('preview:compile', async (req, data, content)=>{
    let pathname = data.realPath;
    //如果不需要编译
    if(!isNeedCompile(pathname)){
      return content
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
    let fileTemplate = viewCache[relativeFilePath.replace(/(html)$/,'hbs')]
    let pageData = await _getPageData(cli, fileTemplate.dataURL, data, realFilePath, relativeFilePath, originDataConfig)
    let html = fileTemplate.fn(pageData)
    data.status = 200
    return html
  })
}