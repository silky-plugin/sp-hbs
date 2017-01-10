exports.helper = function(Handlebars){
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
}