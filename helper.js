'use strict';
const _import = require('./helper/imports-helper')
const _raw = require('./helper/raw')

module.exports = (Handlebars, helperReigerterQueue, pluginOptions)=>{

  _import(Handlebars, pluginOptions);
  _raw(Handlebars, pluginOptions);

  //加载扩张helper
  helperReigerterQueue = helperReigerterQueue || []
  helperReigerterQueue.forEach(function(element) {
    element(Handlebars, pluginOptions)
  });


}