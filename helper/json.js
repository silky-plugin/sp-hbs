exports.helper = function(Handlebars){
  Handlebars.registerHelper('json', function(value) {
    return new Handlebars.SafeString(JSON.stringify(value))
  });
}