exports.helper = function(Handlebars){
  Handlebars.registerHelper('compare', function(left, symbol, right, options) {
    let result = (function(){
      switch (symbol) {
        case '==':
          return left == right;
        case '===':
          return left === right;
        case 'in':
          return _.indexOf(right, left) >= 0;
        case '<':
          return left < right;
        case '<=':
          return left <= right;
        case '>':
          return left > right;
        case '>=':
          return left >= right;
        case '!=':
          return left !== right;
        case '!==':
          return left !== right;
        case 'mod':
          return left % right == 0;
      }
    })();

    if (result) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }

  })
}