const _fs = require('fs')
const _handlebars = require('handlebars');
const _async = require('async');
const _path = require('path');
const _ = require('lodash');

const _request = require('request');
const _url = require('url');
const _querystring = require('querystring');

//获取页面对应的数据地址
function getDataMap(inputFileRelativePathname, fileContent, dataConfig){
  let dataMap = dataConfig['dataMap'];
  inputFileRelativePathname = inputFileRelativePathname.replace(_path.extname(inputFileRelativePathname), "")
  let dataUrl = dataMap[inputFileRelativePathname];
  //--------------  看是否一一映射了数据地址
  if(dataUrl){
    return _path.join(dataConfig.baseUrl || "", dataUrl)
  }
  // ---- 看文件中是否存在地址映射
  let reg = dataConfig.dataRegexp || /\{\{\!\-\-\s*PAGE_DATA\s*[:]\s*(.+)\s*\-\-\}\}/g;

  if(_.isFunction(reg)){
    return reg(fileContent)
  }

  let result = reg.exec(fileContent)
  let dataUrlInContent = "";
  //获取首个匹配项
  if(result && result[1]){
    return result[1].replace(/\s/g, "")
  }
  return false
}

//判断是否是url
const isUrl = (url)=>{
  return /^((http\:\/\/)|(htpps\:\/\/))/.test(url)
}

//从url获取数据
const getDataFromUrl = (url, dataConfig, cb)=>{
  let headers = dataConfig.headers || {};
  let queryParams = dataConfig.queryParams || {};

  let urlObj = _url.parse(url);

  queryParams = _.extend( _querystring.parse(urlObj.query), queryParams);

  let options = {
    url: `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`,
    qs: queryParams,
    headers: headers,
    timeout: 15000
  };

  _request(options, (error, response, body)=>{
    if (error){
      return cb(error)
    }
    if(response.statusCode != 200){
      return cb(new Error(`错误，${options.url} 状态码${response.statusCode}`))
    }
    try{
      body = JSON.parse(body);
      cb(null, body)
    }catch(e){
      console.error(e)
      cb(new Error("Can not parse body"))
    }
  })
}

const doCompile = (crossData, fileContent, context, cb)=>{
  try{
    let template = _handlebars.compile(fileContent)
    let html = template(context)
    crossData.status = 200
    cb(null, crossData, html)
  }catch(e){
    cb(e)
  }
}

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
    compileContent(cli, fileContent, crossData, inputFileRealPath, inputFileRelativePathname, dataConfig, callback)
  })

}
const compileContent = (cli, fileContent, crossData, inputFileRealPath, inputFileRelativePathname, dataConfig, callback)=>{

  //获取页面相关的数据地址
  let dataURL = getDataMap(inputFileRelativePathname, fileContent, dataConfig)

  //获取全局变量
  let globalVar = {}
  globalVar[dataConfig.globalRoot] = dataConfig.global;
  if(dataConfig.globalRootMount){
    let globalRootMount = [].concat(dataConfig.globalRootMount)
    for(let i = 0, len = globalRootMount.length; i<len; i++){
      globalVar[globalRootMount[i]] = globalVar
    }
  }
  //不含数据地址
  if(!dataURL){
    doCompile(crossData, fileContent, globalVar, callback)
    return
  }
  //编译数据地址
  let dataUrlTemplate = _handlebars.compile(dataURL);
  //真实的数据地址
  dataURL = dataUrlTemplate(dataConfig.urlMap);

  if(!isUrl(dataURL)){
    //作为文件内容读取json，而不直接Require，避免缓存问题
    let context = cli.runtime.getRuntimeEnvFile(dataURL, true);
    let contextData = dataConfig.formatPageData(dataURL, JSON.parse(context))
    doCompile(crossData, fileContent, _.extend(globalVar, contextData, callback))
    return
  }

  getDataFromUrl(dataURL, dataConfig, (err, context)=>{
    cli.log.info(`sp-hbs fetch data from: ${dataURL}`)
    if(err){
      return callback(err)
    }
    context = dataConfig.formatPageData(dataURL, context)
    if(context[dataConfig.globalRoot]){
      cli.log.warn(`！！！页面数据拥有字段${dataConfig.globalRoot}，它全局变量配置的 gloablRoot 挂载点 一致， 全局配置将覆盖此字段！！！`)
    }
    doCompile(crossData, fileContent, _.extend(context, globalVar), callback)
  })
}