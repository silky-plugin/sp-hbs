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
        isNumber = typeof(condition) == 'number'
        list =  isNumber ? [1..condition] : condition
        let results = []
      
        _.map(list, function(item, index){
          let current =  _.isObject(item) ? item : {$current: item}
          current.$index = index
          context = _.extend(current, options.data.root)
          let template = _imports.getCompileHtml(name, options)
          results.push(template(context))
        })
        return new Handlebars.SafeString(results.join(''))
    })
}
