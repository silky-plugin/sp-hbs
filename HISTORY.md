### HISTORY
v1.5.0-rc1

增加预览环境下的文件缓存刷新， hook 为 `preview:project:update`

v1.4.9-beta
增加编译页面数据获取途径

v1.4.8
修复sr https 启动没有加载helper的bug

v1.4.7
增加 stringify helper
修复 页面配置数据url 结合 变量编译错误bug

v1.4.6
  支持`sr preview`

v1.4.5
  修复一个本地json数据bug
v1.4.2

  修复loop带来的bug

v1.4.1

  增加 loop 和justloop两条指令

v1.3.6
  修复data fetch bug

v1.3.5
  修复data fetch bug

v1.3.3 
  remove console.log
v1.3.2
  bug修复。 在build的时候，加载helper还没完成，build进程已开始，导致miss helper。

v1.3.0
删除不必要的helper

v1.2.1
修复windows图片路径不正确问题

v1.2.0
修复pub组件 中使用import 路径错误问题

v1.1.1
  增加 为 pub 指令 添加统计代码功能

  使用方式为 `data-config`指向的配置文件中，增加`statistics`字段：

```
{
  statistics: "这是统计代码"
  //或者
   statistics: function(helperContent){
     return helperContent+"这是统计代码"
   }
}
```

v1.1.0
  增加公共组件 图片处理方式

v1.0.7

  1. 修改获取组件 index文件的方式

v1.0.6

  1. 修复bug

v1.0.4
增加 `pub` 功能

v1.0.3

支持文件夹内hbs文件跳转