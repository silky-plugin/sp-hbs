'use strict';
const _ = require('lodash');
const _imports = require('./imports')
exports.helper = function(Handlebars, pluginOptions){
    Handlebars.registerHelper('loop', function(name, condition, options){
        if(arguments.length != 3){
          return console.log("Loop必需提供两个参数").red
        }
        //循环
        condition = condition || []
        let isNumber = typeof(condition) == 'number'
        let list =  isNumber ? [1..condition] : condition
        let results = []
      
        _.map(list, function(item, index){
          let current =  _.isObject(item) ? item : {$current: item}
          current.$index = index
          let context = _.extend(current, options.data.root)
          let templateHTMLOpt = _imports.getCompileHtml(name, pluginOptions, options)
          if (templateHTMLOpt.error){
            throw new Handlebars.Exception(templateHTMLOpt.error)
          }else if(!templateHTMLOpt.compile){
            results.push(new Handlebars.SafeString(templateHTMLOpt.content))
          }else{
            let template = Handlebars.compile(templateHTMLOpt.content)
            results.push(template(context))
          }
        })
        return new Handlebars.SafeString(results.join(''))
    })
}
