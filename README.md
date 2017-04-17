# HBS编译

## 基本使用

```
{
  "sp-hbs":{
    "root": "template" #可选。默认 "/" 配置hbs所在的目录， 在老版的silky中，hbs一般放在了template中，新版默认在根目录
    "data-config": "hbs.config.js" #可选 指定一些hbs的参数，和编译
  }
}
```

## data-config 相关配置

### 配置文件读取顺序
如上文配置`data-config:"hbs.config.js"` silky将去读取 `hbs.config.js`的内容作为hbs编译参数和相关配置数据
不同环境下，读取的文件位置规定如下：
【配置文件一般放在.silky文件夹。默认没有生成，需要新建。 .silky 目录下一般有三种目录（默认不存在，根据需要新建）： normal, production, develop】

在 `sr start`命令下 读取的顺序是 `.silky/develop/hbs.config.js` -> `.silky/normal/hbs.config.js`
在 `sr build`命令下 读取的顺序是 `.silky/production/hbs.config.js` -> `.silky/normal/hbs.config.js`

如果第一个文件不存在则读取下一个文件， 如果 环境文件夹【把develop,production称为环境文件夹】和`normal`文件下都存在配置文件，那么 环境文件下的配置将会覆盖 `normal`文件夹
下的配置。 一般是`normal`继承`develop或者production`,仅做一层继承

### 配置文件的格式
`hbs.config.js`:
```
module.exports = {
  ...
  ...
}
```

### 配置文件 字段使用

#### 全局变量 global

`hbs.config.js`:
```
module.exports = {
  global:{
    "field": "this field value" 
  }
  globalVar: "__global" //可选，默认为 __global
}
```

通过配置 `global`的值，可以通过`{{__global.field}}` 在hbs中使用该值。如：

```
module.exports = {
  global:{
    "imageRoot": "http://img.mgtv.com" 
  }
  globalVar: "__global"
}
```

那么在 `xxx.hbs`中使用

```
<html>
...
<body>
  <img src="{{__global.imageRoot}}/sr/a.png">
</body>
</html>
```
在`start`中，或者`build`中编译为
```
<html>
...
<body>
  <img src="http://img.mgtv.com/sr/a.png">
</body>
</html>
```

通过修改 `globalVar`的值来修改全局变量的挂载点,如：`globalVar: "__root"`, 那么使用为:

```
<html>
...
<body>
  <img src="{{__root.imageRoot}}/sr/a.png">
</body>
</html>
```

## 高级使用 【结合数据编译页面】

数据获取。

#### 方式一： 指定具体页面和相对应数据

hbs.config.js 配置

```js

module.exports = {
  // -------- dataMap和baseUrl配合使用 组合为  baseUrl + dataMap[xxx] 然后用 urlMap 替换值
  //可选配置 default: {}
  "dataMap": {
    "/path/to/a.hbs": ":{{port}}xxx.json"
  },
  //可选配置 仅到存在dataMap时有用, 这个配置可以省略。 比如上面的写成  "/path/to/a.hbs": "http://localhost:{{port}}xxx.json"
  "baseUrl": "http://locahost"
  // -------

  //可选， Default: {}
  "urlMap":{
    port: "3000"
    server: "http://localhost"
  },
  //上面三个参数组合的意思就是  hbs.compliewith("http://locahost"+ ":{{port}}/xxx.json",  {port: "3000"}) 得到了 http://localhost:3000/xxx.json

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
}

```

#### 方式二： 通过页面注释获取数据地址

通过在hb始终配置
```html
{{!-- PAGE_DATA: {{server}}:{{port}}/a.json  --}}
```
那么通过上文`urlMap`的配置，得到的数据接口地址是：

```
http://localhost:3000/a.json 
```

那么将用`a.json`来编译这个页面

      高级应用：通过配置 `dataRegexp` 可以正则自己的注释. dataRegexp可以是个正则表达式 也可以是个接收文件内容的函数，函数返回数据地址或者false


### 格式化页面数据

从接口拿到到数据可能不符合页面要求，那么可以根据下面的配置选项，格式化拿到的数据
```js
module.exports = {
  ...
 // 页面数据格式化。 可选， 默认返回urlData
 //固定接收两个参数， url 页面数据地址， urlData 为根据页面数据地址获取到的数据
 formatPageData: (url, urlData)=>{return urlData}
 ...
```


## 公共组件开发规范

### Silky配置

#### 第一种配置
可以在项目中边开发，边测试。通过配置 `silky-pubPath`指定开发中的组件文件夹

package.json
```

{
  "silky-pubPath":"pub-module"
  "sp-hbs":{
  }
}
```

#### 第二种 当成独立项目开发组件

这个时候不需要进行任何配置，按平时开发一般html状态进行即可


### 公共组件规范（暂定）

#### 文件结构

```
  module-name
      |--------package.json  #必须，包含version， name，index【可有可无，默认为index.html】
      |------- index.html or index.hbs or 其他【在index中定义】
      |------- images [图片必须放到images目录下]
      |------- 其他
```

#### 组件结构

```
按平时写html时写就好了。该引用就引用，所有的css,js引用 全部 以 / 开始，表示组件根目录如：

<link rel="stylesheet" href="/css/index.css" type="text/css">
<script src="/js/module-A-component.js"></script>
<script src="/js/module-A-1-component.js"></script>
<div>
  this  Pub A
</div>

```

另外注意，所有出现在 less,css,html中的图片路径，必须以`__pub`代替`images`如：
less:
```
 background-image: url("@{__pub}/a.jpg");
```
指定的代表的就是 `/images/a.jpg`

html:

```
  <img src="{{__pub}}/b.png">
```
表示就是`/images/b.png`

#### 如何开发一个公共组件

进入工作目录

```
sr init -p pub-m
sr install
```
即可，该命令会会初始化一个公共组件的demo，然后编辑修改 `silky-pubpath`配置对应的文件夹，开发自己的组件即可


#### 如何发布

在自己的公共组件目录下，记得 编辑 package.json的name,version字段，每次升级都需要升级version的版本号

```
mgtv publish
```
即可

#### 如果安装
在其他依赖该组件等工程下
```
silky install moduleName 即可。
```

#### 使用

见下文 `helper`部分的`pub`和`publib`


## 已包含的 helper

### import

引入模块
{{import "Axx.hbs" data1, data2}}
后面可以跟多个数据，用来编译`Axx.hbs`,在`Axx.hbs`里面，通过使用`$0`,`$1`来使用按顺序使用数据

### pub

引入公共组件
```
{{pub "A" data1, data2}}
```

#### publib

用公共库(纯js或者纯css项目)

```
{{publib "jquery"}}
```

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

如果你在`silky`已有`help`基础上再次扩展自己的`helper` 请参考 示例：https://github.com/silky-plugin/sp-hbs-scan-ext

