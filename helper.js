'use strict';
const _path = require('path')
const _fs = require('fs')
const _importsHelp = require('./helper/imports')
const _loopHelp = require('./helper/loop')
const _rawHelp = require('./helper/raw')
const _repeatHelp = require('./helper/repeat')
const _sliceHelp = require('./helper/slice')
const _scanExtHelp = require('./preview-helper/scan-ext')
const _pubHelp = require("./preview-helper/pub")
const _publibHelp = require('./preview-helper/publib')
exports.normal = (Handlebars, helperReigerterQueue, pluginOptions)=>{
  //动态加载helper
  let fileList = _fs.readdirSync(_path.join(__dirname, "helper"))
  fileList.forEach((filename)=>{
    let fn = require(_path.join(__dirname, "helper", filename))
    fn.helper(Handlebars, pluginOptions)
  })
  //加载扩张helper
  helperReigerterQueue = helperReigerterQueue || []
  helperReigerterQueue.forEach(function(element) {
    element(Handlebars, pluginOptions)
  });
}

exports.preview = (Handlebars, pluginOptions)=>{
  _importsHelp.helper(Handlebars, pluginOptions)
  _loopHelp.helper(Handlebars, pluginOptions)
  _pubHelp.helper(Handlebars, pluginOptions)
  _publibHelp.helper(Handlebars, pluginOptions)
  _rawHelp.helper(Handlebars, pluginOptions)
  _repeatHelp.helper(Handlebars, pluginOptions)
  _sliceHelp.helper(Handlebars, pluginOptions)
  _scanExtHelp.helper(Handlebars)
}