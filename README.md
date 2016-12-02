## HBS编译

### 全局变量
可以通过`global`字段来配置

```js
"sp-hbs":{
  global: "hbs-global.js"
}
```

在页面中可以通过`__global.xxx` 来使用全局变量

如：

hbs-global.js:

```
module.exports = {
  "globalVar": "this is global var"
}
```

在页面里面使用

```handlebars
....
<p>{{__global.globalVar}}</p>
```

当然如果你觉得  `__global` 变量不好记，或者 觉得该变量名称可能会与页面配置的数据 冲突，覆盖掉页面配置的数据，那么可以通过

```
"sp-hbs":{
  global: "hbs-global.js"
}

```


### 数据处理

0. 查看插件配置

```
{
  "sp-hbs":{
    data-config: "demo.js"
  }
}
```

读取`data-config`在运行时的配置数值`demo.js`，【例如：运行时环境为`production` 先读`production/demo.js`, 在看`normal/demo.js`, 然后 `normal`继承`production`】 如果没有指定该配置则默认数值为`{}`

1. 查看配置`demo.js` 里的 `data-map`字段， 如果没有，则  `data-map`设置为 `{}`


2. 读取 `dataMap` 里面该路径是否对应了 `数据地址`, 如果有数据路径，那么查看是否配置了`baseUrl`,如果配置了，那么该数据路径将加上`baseUrl`
 
(以`http://` 或者 `https://` 开始读取url数据，路径则 读取相应运行时环境下的`json`或`js`文件）

3. 如果第二步没有配置该文件对应的 数据选项，那么进入 `步骤4`

4.  分析文件内容。 读取文件里面的配置.

```hbs
{{!-- PAGE_DATA: hello --}}
```

或

```hbs
{{!-- PAGE_DATA: {{main}}hello --}}
```

查看 `data-config`在运行时的配置数值`demo.js`， 如果没有指定该配置则默认数值为`{}`

使用`demo.js`里面的`urlMap`字段 编译 `PGAE_DATA:`后面的值， 如果得到的数据地址 以`http://` 或者 `https://` 开始读取url数据，路径则 读取相应运行时环境下的`json`或`js`文件

如果`404`，或未找到对应的`js`或`json`,那么抛出 `Error`.

5. 若文中不含配置，那么不使用数据编译。

### 页面数据配置说明

#### 通过文件配置数据

`data-config:demo.js`:

```js

module.exports = {
  // -------- dataMap和baseUrl配合使用 组合为  baseUrl + dataMap[xxx] 然后用 urlMap 替换值
  "dataMap": { //可选配置
    "xxx": "xxx.json"
  },
  "baseUrl":"xxxx" //可选配置 仅到存在dataMap时有用
  // ------- 

  //用于替换 数据地址中的变量 。 比如  baseUrl + dataMap 中含有 {{xxx}} ， 或者页面数据配置中 {{!-- PAGE_DATA: {{xxx}}data.json--}} 含有 {{xxx}}, 那么将用  urlMap 里面的值替换 http
  "urlMap":{
    xxx: "http://locahost:3000"
  },

  //------- 共数据方式为 http模式使用
  //提供http head头，用于一些接口校验
  headers:{
    xxxx:xxx
  },
  //提供http 通用查询参数
  queryParams: {
    xxxx:xxx
  }
  //----------------
}
```

#### 通过页面配置数据

在`hbs`头部通过`{{!-- PAGE_DATA: xxx --}}` 进行配置页面数据如：

```handlebars

{{!-- PAGE_DATA {{xxx}}/data.json --}}
<html>
xxx
</html>

```

其中有效数据配置为 `{{xxx}}/data.json` 这个链接中包含的 `{{xxx}}` 变量将用 配置文件中 `urlMap` 中的数据替换。


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
