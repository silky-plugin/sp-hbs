### HISTORY
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