'use strict';
const _path = require('path')
const _fs = require('fs')

module.exports = (Handlebars, helperReigerterQueue, pluginOptions)=>{
  //动态加载helper
  let fileList = _fs.readdirSync(_path.join(__dirname, "helper"))
  fileList.forEach((filename)=>{
    console.log(filename)
    let fn = require(_path.join(__dirname, "helper", filename))
    fn.helper(Handlebars, pluginOptions)
  })


  //加载扩张helper
  helperReigerterQueue = helperReigerterQueue || []
  helperReigerterQueue.forEach(function(element) {
    element(Handlebars, pluginOptions)
  });


}