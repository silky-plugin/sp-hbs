const _helper = require('./helper');
const _ = require('lodash');
const _fs = require('fs-extra');
const _path = require('path')
const _handlebars = require('handlebars');
const _getPageData = require('./getPreviewPageData')

module.exports = (cli, _DefaultSetting)=>{
  //加载handlebars  helper
  _helper.normal(_handlebars, cli.ext['hbs'], _DefaultSetting);
  cli.registerHook('build:doCompile', async (buildConfig, data, content)=>{
    let inputFilePath = data.inputFilePath;
    if(!/(\.hbs)$/.test(inputFilePath)){
      return content
    }
    if(!_fs.existsSync(inputFilePath)){
      return content
    }
    let fileContent = _fs.readFileSync(inputFilePath, "utf8")
    let pageData = await _getPageData(cli, fileContent, data, inputFilePath, data.inputFileRelativePath,  Object.assign({}, _DefaultSetting.dataConfig))
    let template = _handlebars.compile(fileContent)
    let html = template(pageData)
    data.status = 200
    data.outputFilePath = data.outputFilePath.replace(/(hbs)$/, "html")
    data.outputFileRelativePath = data.outputFileRelativePath.replace(/(hbs)$/, "html")
    return html
  }, 1)

  cli.registerHook('build:end', async (buildConfig)=>{
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
    return
  }, 1)
}