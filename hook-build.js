const _helper = require('./helper');
const _ = require('lodash');
const _getCompileContent = require('./getCompileContent');
const _fs = require('fs-extra');
const _path = require('path')
const _handlebars = require('handlebars');
module.exports = (cli, _DefaultSetting)=>{
  //加载handlebars  helper
  _helper.normal(_handlebars, cli.ext['hbs'], _DefaultSetting);
  cli.registerHook('build:doCompile', (buildConfig, data, content, cb)=>{
    let inputFilePath = data.inputFilePath;
    if(!/(\.hbs)$/.test(inputFilePath)){
      return cb(null, content)
    }
    _getCompileContent(cli, data, inputFilePath, data.inputFileRelativePath, _DefaultSetting.dataConfig, (error, resultData, content)=>{
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