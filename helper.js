'use strict';
module.exports = (Handlebars, helperReigerterQueue)=>{
  //跳过handlebar编译
  Handlebars.registerHelper('raw', function(options) {
    return options.fn();
  
  });
  
  //加载扩张helper
  helperReigerterQueue = helperReigerterQueue || []
  helperReigerterQueue.forEach(function(element) {
    element(Handlebars)
  });


}