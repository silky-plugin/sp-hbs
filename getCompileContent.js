const _fs = require('fs-extra')
const _path = require('path');
const _handlebars = require('handlebars');
const _getPageData = require('./getPageData')
const _ = require('lodash')
/**
 * Desc: 根据实际路径获取文件内容
 * params <cli>
 * params <crossData> 调用hook过程中的传递的数据
 * params <realFilePath> string ,真实文件路径
 * params <relativPpathname> string, 相对文件路径
 * params <dataConfig> JSONObject
 */
module.exports = (cli, crossData, inputFileRealPath, inputFileRelativePathname, dataConfig, callback)=>{
  if(!_fs.existsSync(inputFileRealPath)){
    return callback(null, crossData, "");
  }
  _fs.readFile(inputFileRealPath, "utf8", (error, fileContent)=>{
    if(error){
      return callback(error, crossData, "")
    }
    if(crossData.pageData){
      let template = _handlebars.compile(fileContent)
      let html = template(dataConfig.formatPageData(crossData.realPath, crossData.pageData))
      crossData.status = 200
      callback(null, crossData, html)
      return
    }
    _getPageData(cli, fileContent, crossData, inputFileRealPath, inputFileRelativePathname, dataConfig, (err, pageData)=>{
      if(err){
        return callback(err)
      }
      try{
        let template = _handlebars.compile(fileContent)
        let html = template(pageData)
        crossData.status = 200
        callback(null, crossData, html)
      }catch(e){
        callback(e)
      }
    })
  })
}
