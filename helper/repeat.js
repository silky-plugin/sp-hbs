 const _  = require('lodash')

exports.helper = function(Handlebars){
    Handlebars.registerHelper('repeat',  (count, options)=>{
        count = ~~count
        let self = this
        html = ''
        for(let index = 0; index < count; index++){
            self.$index = index
            html += options.fn(self)
        }
        return html
    });
}