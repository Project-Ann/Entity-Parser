/*
DialogEngine Entities Parser Module

Old version waiting for upgrade

Feel free to improve the code!

--

balanced-match  (MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var balanced = require("balanced-match");
var characters = /[!@#$%^*()_+\-=\[\]{};':"\\,<>\/?]/;
module.exports=function parse(text) {
  return new Promise((resolve, reject) => {
    private_parse(text)
    .then(function (data) {
      var newArray = [];
      Object.values(data).sort().forEach(function(newData) {
        var _newData = newData;
        if(newData.found == null){        
          reject({
            dot: 0,
            info: "Syntax Error",
            text: text
          })
        } else if(newData.found.includes("$")) {
          _newData.found = newData.found.replace("{","");
          _newData.found = newData.found.replace("}","");
          _newData.found = newData.found.replace("$","");
        }
        if(_newData.found.length==0) {
          reject({
            dot: _newData.start,
            info: "Entities cannot be empty",
            text: text
          })
        } else if(characters.test(_newData.found)) {
          reject({
            dot: _newData.start,
            info: "Entities cannot includes special characters",
            text: text
          })
        }
        if(newData.found.includes("||")) {
          _newData.found = newData.found.trim().split("||");
          _newData.type = "or"
        } else if(newData.found.includes("&&")) {
          _newData.found = newData.found.trim().split("&&");
          _newData.type = "and"
        } else {
          _newData.type = "single";
        }

        newArray.push(_newData)
      })
      resolve(newArray);
    })
    .catch(function (err) {
      reject(err);
    })
  })
}
function private_parse(text) {
  return new Promise((resolve, reject) => {
    var matc = balanced('${', '}', text);
    if(matc==undefined) {
      reject({
        dot:0,
        info:"noEntities",
        text:text
      })
    }
    var data = {};
    if (matc.pre.length == 0) { //Check before found entity
      var post = matc.post.split("");
      post.map((value, index) => {
        if (value == "{") {
          if (post[index - 1] !== "$") { //Text didn't started with entity
            reject({
              dot: matc.end + index + 1,
              info: "Brace not started with prefix",
              text: text
            })
          }

        } else if (value == "$") {
          if (post[index + 1] !== "{") { //Check brace started
            reject({
              dot: matc.end + index + 1,
              info: "No brace found after prefix",
              text: text
            }) //Braces not found after prefix
          } else { //Brace started
            data[index + 1] = {
              complete: false,
              start: index,
              found: null
            }
          }
        } else if (value == "}") {
          var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
          if(inx==undefined) {
            reject({
              dot: matc.end + index + 1,
              info: "Brace start point not found",
              text: text
            })
          } else {
            data[inx] = {
              complete: true,
              start: matc.end +data[inx].start+1,
              end: matc.end +index + 1,
              found: matc.post.slice(data[inx].start, index + 1)
            };
          }
        }
        if (index == post.length - 1) {
          data[matc.start] = {
            complete:true,
            start:matc.start,
            end:matc.end,
            found:matc.body
          }
          resolve(data)
        }
      })
    } else if(matc.post.length == 0) {
      var pre = matc.pre.split("");
      pre.map((value, index) => {
        if (value == "{") {
          if (pre[index - 1] !== "$") { //Prefix not found before the letter
            reject({
              dot: matc.end + index + 1,
              info: "Brace not started with prefix",
              text: text
            })
          }

        } else if (value == "$") {
          if (pre[index + 1] !== "{") { //Check brace started
            reject({
              dot: matc.end + index + 1,
              info: "No brace found after prefix",
              text: text
            }) //prefixden sonra { kullanılmadı
          } else { //Brace started
            data[index + 1] = {
              complete: false,
              start: index,
              found: null
            }
          }
        } else if (value == "}") {
          var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
          data[inx] = {
            complete: true,
            start: matc.end+data[inx].start+1,
            end: matc.end+index+1,
            found: matc.pre.slice(data[inx].start, index + 1)
          };
        }
        if (index == pre.length - 1) {
          data[matc.start] = {
            complete:true,
            start:matc.start,
            end:matc.end,
            found:matc.body
          }
          resolve(data)
        }
      });
    } else {
      var pre = matc.pre.split("");
      pre.map((value, index) => {
        if (value == "{") {
          if(pre[index - 1] == undefined) {
            reject({
              dot: index,
              info: "Brace not started with prefix",
              text: text
            })
          } else if(pre[index - 1] !== "$") { //
            reject({
              dot: matc.end + index + 1,
              info: "Brace not started with prefix",
              text: text
            })
          }

        } else if (value == "$") {
          if (pre[index + 1] !== "{") { //Check brace started
            reject({
              dot: matc.end + index + 1,
              info: "No brace found after prefix",
              text: text
            }) //prefixden sonra { kullanılmadı
          } else { //Brace started
            data[index + 1] = {
              complete: false,
              start: index,
              found: null
            }
          }
        } else if (value == "}") {
          var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
          data[inx] = {
            complete: true,
            start: matc.end+data[inx].start+1,
            end: matc.end+index+1,
            found: matc.pre.slice(data[inx].start, index + 1)
          };
        }
        if (index == pre.length - 1) {
          var post = matc.post.split("");
          post.map((value, index) => {
            if (value == "{") {
    
              if (post[index - 1] !== "$") {
                reject({
                  dot: matc.end + index + 1,
                  info: "Brace not started with prefix",
                  text: text
                })
              }
    
            } else if (value == "$") {
              if (post[index + 1] !== "{") { //Check brace started
                reject({
                  dot: matc.end + index + 1,
                  info: "No brace found after prefix",
                  text: text
                }) //prefixden sonra { kullanılmadı
              } else { //Brace started
                data[index + 1] = {
                  complete: false,
                  start: index,
                  found: null
                }
              }
            } else if (value == "}") {
              var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
              data[inx] = {
                complete: true,
                start: matc.end+data[inx].start+1,
                end: matc.end+index+1,
                found: matc.post.slice(data[inx].start, index + 1)
              };
            }
            if (index == post.length - 1) {
              data[matc.start] = {
                complete:true,
                start:matc.start,
                end:matc.end,
                found:matc.body
              }
              resolve(data)
            }
          })
        }
      })
    }
  });
}