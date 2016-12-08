## HBS编译

### 页面数据处理

0. 查看插件配置

```
{
  "sp-hbs":{
    data-config: "demo.js"
  }
}
```

读取`data-config`在运行时的配置数值`demo.js`，
【例如：运行时环境为`production` 先读`production/demo.js`, 在看`normal/demo.js`, 然后 `normal`继承`production`】 
如果没有指定该配置则默认数值为`{}`

`demo.js`:

```js

module.exports = {
  // -------- dataMap和baseUrl配合使用 组合为  baseUrl + dataMap[xxx] 然后用 urlMap 替换值
  //可选配置 default: {}
  "dataMap": {
    "/path/to/hbs or html": "xxx.json"
  },
  //可选配置 仅到存在dataMap时有用
  "baseUrl":"xxxx" 
  // ------- 

  //用于替换 数据地址中的变量 。 比如  baseUrl + dataMap 中含有 {{xxx}} ， 
  //或者页面数据配置中 {{!-- PAGE_DATA: {{xxx}}data.json--}} 含有 {{xxx}}, 那么将用  urlMap 里面的值替换 http
  //可选， Default: {}
  "urlMap":{
    xxx: "http://locahost:3000"
  },

  //------- 共数据方式为 http模式使用
  //提供http head头，用于一些接口校验
  //可选, default: {}
  headers:{
    xxxx:xxx
  },
  //可选, default: {} 提供http 通用查询参数
  queryParams: {
    xxxx:xxx
  }
  //----------------


  //---------- 全局变量 
  /**
  
  在页面中可以通过`__global.globalVar` 来使用全局变量,如：
  <p>{{__global.globalVar}}</p> 编译完成后: <p>this is global var.</p>


  当然如果你觉得  `__global` 变量不好记，或者 觉得该变量名称可能会与页面配置的数据源 冲突，导致页面数据源被全局变量覆盖，那么可以通过 globalRoot来另外指定挂载点。
  如： globalRoot: '__root' 那么页面使用就是 `<p>{{__root.globalVar}}</p>`
  **/
  
  //可选,默认 {}
  global: {
    globalVar: "this is global var."
  }
  //全局变量挂载点
  //可选， 默认 '__global'
  globalRoot: "__global"
  //--------

 // 页面数据格式化。 可选， 默认返回urlData
 //固定接收两个参数， url 页面数据地址， urlData 为根据页面数据地址获取到的数据
 formatPageData: (url, urlData)=>{return urlData}

}
```

具体逻辑是：

以页面请求为: `index.html` 为例

1. 是否存在 `data-map`字段， 如果没有，则  `data-map`设置为 `{}`


2. 读取 `dataMap` 里面的 `index`  该路径是否对应了 `数据地址`, 这里假如对应了 `dataA.json`,

那么查看是否配置了`baseUrl`,如果配置了，那么该数据路径将加上`baseUrl`.

所以，编译 index.html的数据源是:  `baseUrl` + `dataA.json`  =  `DATA-URL`。

然后用 `urlMap` 里面的变量 替换 `DATA-URL`, 得到真正的数据地址 `REAL-DATA-URL`.

(如果 `REAL-DATA-URL` 以`http://` 或者 `https://` 开始，那么去request url数据。
如果不是，读取相应运行时环境下的`json`或`js`文件.  如果`http` `404`，或未找到对应的`js`或`json`,那么抛出 `Error`.）


3. 如果第二步没有对应 `dataA.json` 数据选项，那么进入 `步骤4`

4.  分析文件内容。 读取html或hbs文件里面的配置.

```hbs
{{!-- PAGE_DATA: hello --}}
```

或

```hbs
{{!-- PAGE_DATA: {{main}}hello --}}
```
 
 这里的  `DATA-URL`则是  `PGAE_DATA:`后面的值 `hello` 或 `{{main}}hello`, 然后用 `urlMap`里面的变量 替换 `DATA-URL`. 得到`REAL-DATA-URL`


 然后用`REAL-DATA-URL`去获取页面数据。


5. 若文中不含配置数据源，那么不使用数据编译。



### 已包含的 helper

#### raw

用于你不想通过`silky` 编译的页面内容。使用方法

```handlebars
{{{{raw}}}}
  <script type="text/x-handlebars-template" id="my-template">
      <ul>
          {{#each items}}
              <li><a href="{{url}}" title="{{title}}">{{display}}</a></li>
          {{/each}}
      </ul>
  </script>
  {{{{/raw}}}}
```

编译后得到的页面时：

```
 <script type="text/x-handlebars-template" id="my-template">
    <ul>
        {{#each items}}
            <li><a href="{{url}}" title="{{title}}">{{display}}</a></li>
        {{/each}}
    </ul>
  </script>
```


### helper 扩展

如果你在`silky`已有`help`基础上再次扩展自己的`helper` 请参考 [扩展文档](https://github.com/huyinghuan/slow-cli-2.0/blob/master/docs/dev-registerPluginExt.md)

!!!Note!!!  

1. 扩展的`node_modules` 名称必须符合规则: `sp-xxx-ext` 其中 `xxx` 自己定义

2. 注册扩展时，本插件的扩展 注册名称必须为`hbs:xxx`  其中 `xxx` 自己定义

这里展示一个demo：

```
exports.registerPluginExt = function(cli, options){
  cli.registerExt('hbs:import', function(handlebars){
    handlebars.registerHelper('import', (a, b)=>{
      return a + b
    })
  })
}
```
