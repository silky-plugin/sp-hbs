
exports.helper = (Handlebars)=>{

  Handlebars.registerHelper('getImage', function(image, options) {
    var url, suffix, type, size;
    type = options.split('_')[0];
    size = options.split('_')[1];
    if(Object.prototype.toString.call(image) == '[object String]') {
        url = image;
    } else {
        image = image || {};
        switch(type) {
            case 'H':
                url = image.pcImgUrl || image.imgHUrl || image.squareImgUrl || image.imgHVUrl
                break;
            case 'V':
                url = image.pcImgUrl || image.imgHVUrl || image.squareImgUrl || image.imgHUrl
                break;
            case 'S':
                url = image.pcImgUrl || image.squareImgUrl || image.imgHUrl || image.imgHVUrl
                break;
            default:
                url = image.pcImgUrl || image.imgHUrl || image.squareImgUrl || image.imgHVUrl
                break;
        }
    }
    if(size && url && url.length) {
        var suffix = url.split('.').pop()
        url = url + "_" + size + "." +suffix;
    }
    return url;
  });
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

  });
  Handlebars.registerHelper('json', function(value) {
    return new Handlebars.SafeString(JSON.stringify(value))
  });
  Handlebars.registerHelper('ifEqual', function(left, right, options){
    if(left == right){
      return options.fn(this)
    }else{
      return options.inverse(this)
    }
  })
}