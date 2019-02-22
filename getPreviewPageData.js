const _path = require('path');
const _ = require('lodash');
const _request = require('request');
const _url = require('url');
const _querystring = require('querystring');
const _handlebars = require('handlebars');

//获取页面对应的数据地址
function getDataMap(inputFileRelativePathname, contentDataURL, dataConfig){
  let dataMap = dataConfig['dataMap'];
  inputFileRelativePathname = inputFileRelativePathname.replace(_path.extname(inputFileRelativePathname), "")
  let dataUrl = dataMap[inputFileRelativePathname];
  //--------------  看是否一一映射了数据地址
  if(dataUrl){
    return _path.join(dataConfig.baseUrl || "", dataUrl)
  }
  return contentDataURL
}

//判断是否是url
const isUrl = (url)=>{
  return /^((http\:\/\/)|(htpps\:\/\/))/.test(url)
}

//从url获取数据
const getDataFromUrl = async (url, dataConfig)=>{
  let headers = dataConfig.headers || {};
  let queryParams = dataConfig.queryParams || {};

  let urlObj = _url.parse(url);

  queryParams = _.extend( _querystring.parse(urlObj.query), queryParams);

  let options = {
    url: `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`,
    qs: queryParams,
    headers: headers,
    timeout: 5000
  };
  return new Promise((resolve, reject)=>{
    _request(options, (error, response, body)=>{
      if (error){
        return reject(error)
      }
      if(response.statusCode != 200){
        return reject(new Error(`错误，${options.url} 状态码${response.statusCode}`))
      }
      try{
        body = JSON.parse(body);
        resolve(body)
      }catch(e){
        console.error(e)
        reject(new Error("Can not parse body"))
      }
    })
  })
  
}

function compileURL(dataURL, data){
  return dataURL.replace(/\{\{([^\}\}]*)\}\}/g, (line, match)=>{
    let z = match.split(".")
    let url = data
    z.forEach(element => {
      url = url[element]
    });
    return url
  })
}

module.exports =  async function(cli, contentDataURL, crossData, inputFileRealPath, inputFileRelativePathname, dataConfig, cb){
  //获取全局变量
  let globalVar = {}
  globalVar[dataConfig.globalRoot] = dataConfig.global;
  if(dataConfig.globalRootMount){
    let globalRootMount = [].concat(dataConfig.globalRootMount)
    for(let i = 0, len = globalRootMount.length; i<len; i++){
      globalVar[globalRootMount[i]] = globalVar
    }
  }
  if(crossData.pageData){
    return _.extend(globalVar, dataConfig.formatPageData(inputFileRealPath, crossData.pageData))
  }
  //获取页面相关的数据地址
  let dataURL = getDataMap(inputFileRelativePathname, contentDataURL, dataConfig)
   //不含数据地址
   if(!dataURL){
    return globalVar
  }
  //编译数据地址 真实的数据地址
  dataURL = compileURL(dataURL, dataConfig.urlMap)
  if(!isUrl(dataURL)){
    //作为文件内容读取json，而不直接Require，避免缓存问题
    let context = cli.runtime.getRuntimeEnvFile(dataURL, true);
    let contextData = dataConfig.formatPageData(dataURL, JSON.parse(context))
    return _.extend(globalVar, contextData)
  }
  let start = Date.now()
  let context = await getDataFromUrl(dataURL, dataConfig)
  cli.log.info(`sp-hbs fetch data from: ${dataURL} use ${Date.now() - start} ms`)
  context = dataConfig.formatPageData(dataURL, context)
  if(context[dataConfig.globalRoot]){
    cli.log.warn(`！！！页面数据拥有字段${dataConfig.globalRoot}，它全局变量配置的 gloablRoot 挂载点 一致， 全局配置将覆盖此字段！！！`)
  }
  return _.extend(context, globalVar)
}