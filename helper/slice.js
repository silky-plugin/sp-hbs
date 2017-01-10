 const _  = require('lodash')

exports.helper = function(Handlebars){
  Handlebars.registerHelper('slice',  (data, ...args)=>{
    if (!_.isArray(data)) {
        console.log('slice helper 参数必须存在且为数组');
        return '';
    }
    let options = args.pop();
    let params = args;

    let start = params[0] || 0;
    let end = params[1] || data.length;

    data = data.slice(start, end);

    let ret = '';
    _.forEach(data, (v, i) => {
        let d = null;
        if (options.data) {
            d = Handlebars.createFrame(options.data);
            d.index = i;
            d.context = JSON.stringify(v);
        }
        ret += options.fn(v, {
            data: d
        });
    });

    return ret;
  });
}