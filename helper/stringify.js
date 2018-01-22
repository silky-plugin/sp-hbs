exports.helper = (Handlebars, pluginOptions)=>{
  Handlebars.registerHelper('stringify', function(...args){
    return new Handlebars.SafeString(JSON.stringify(args[0])) 
  })
}