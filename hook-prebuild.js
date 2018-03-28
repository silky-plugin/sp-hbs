const _pubFile = require('./prebuild/pub')
const _publibFile = require('./prebuild/publib')
const _pubImport = require('./prebuild/import')
const _ = require('lodash');

module.exports = (cli, pluginOptions)=>{
  cli.registerHook('precompile:include', async (buildConfig, content)=>{
     let pubReg = /\{\{\s*pub\s+["']?([^}"']+)["']?\}\}/
     let publibReg = /\{\{\s*publib\s+["']?([^}"']+)["']?\}\}/
     let importReg = /\{\{\s*import\s+["']?([^}"']+)["']?\}\}/
     let pubExists = true
     let publibExists = true
     let importExists = true
     let errQueue = []
     while(importExists  || publibExists || pubExists){
       if(content.match(pubReg)){
         content = content.replace(pubReg, (line, match)=>{
           try{
             let pubConent = _pubFile(match, pluginOptions)
             return pubConent
           }catch(e){
             errQueue.push(e)
             return "Error happen!!!"
           }
         })
       }else{
         pubExists = false
       }
   
       if(content.match(publibReg)){
         content = content.replace(publibReg, (line, match)=>{
           try{
             let publibConent = _publibFile(match, pluginOptions)
             return publibConent
           }catch(e){
             errQueue.push(e)
             return "Error happen!!!"
           }
         })
       }else{
         publibExists = false
       }
   
       if(content.match(importReg)){
         content= content.replace(importReg, (line, match)=>{
           try{
             let importConent = _pubImport(match, pluginOptions)
             return importConent
           }catch(e){
             errQueue.push(e)
             return "Error happen!!!"
           }
         })
       }else{
         importExists = false
       }
     }
    if(errQueue.length){
       console.log(errQueue)
       throw new Error("errQueue")
    }
    return content
  })
}

 