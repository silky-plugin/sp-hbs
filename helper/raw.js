exports.helper = function(Handlebars){
  Handlebars.registerHelper('raw', function(options) {
    return options.fn();
  });
}