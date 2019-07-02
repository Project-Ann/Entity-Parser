/*
MIT License

Copyright (c) 2019 Project Ann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Made by Ahmetcan Aksu

Feel free to improve
--
*/
const convert = (from, to) => str => Buffer.from(str, from).toString(to);
const utf8ToHex = convert('utf8', 'hex');
const hexToUtf8 = convert('hex', 'utf8');

module.exports = {
  parse: parse,
  decode: unParse
}
/**
 * Parse string to entities
 * @param {string} text   - Text that needs to be parsed
 * @param {Object} config - Parse Config
 * @param {string} config.prefix - Parser prefix Example: [prefix]{user.name} !{user.name} ${user.name}
 */
function parse(_text, {
  prefix, // Ex: [prefix]{entity} 
}) {
  var text = _text.newTrim() //Clear all the white spaces from text
  return new Promise((resolve, reject) => {
    private_parse(text, {
        prefix: prefix,
        start: "{", //Can be changed next version
        end: "}" //This too
      })
      .then(function (data) { //Private parser this parser for debuging syntax. This will be shortened 
        var newArray = [];
        Object.values(data).sort().forEach(function (newData) {
          var _newData = newData;
          if (newData.complete == false) { //There is an entity body that not completed. This should be catched by private_parse. BUG
            reject({
              dot: newData.start,
              info: "Syntax Error: brace not completed",
              text: text
            })
          }
          if (newData.found.includes("||")) { //OR ex: user.name or user.nickname
            if (newData.found.trim().split("||").map(x => x.trim()).filter(x => x.length == 0).length !== 0) { //This will catch empty spaces after operators. Ex: user.name||user.nickname||
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid entity body, operators must be covered with texts",
                text: text
              })
            } else if (newData.found.trim().split("||").map(x => x.trim()).filter(x => x.includes("&&")).length !== 0) { //This will catch if different operators will be used in same entity body. Ex: user.name||user.nicname&&user.guest
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid entity body, cant use different operators in same entity body",
                text: text
              })
            }
            _newData.found = newData.found.trim().split("||").map(x => x.trim()); //This will split to selected operators ["user.name","user.nickname"]
            _newData.type = "or" //Operator type
          } else if (newData.found.includes("&&")) {
            if (newData.found.trim().split("&&").map(x => x.trim()).filter(x => x.length == 0).length !== 0) { //This will catch empty spaces after operators. Ex: user.name&&user.nickname&&
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid entity body, operators must be covered with texts",
                text: text
              })
            } else if (newData.found.trim().split("&&").map(x => x.trim()).filter(x => x.includes("||")).length !== 0) { //This will catch if different operators will be used in same entity body. Ex: user.name&&user.nicname||user.guest
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid entity body, cant use different operators in same entity body",
                text: text
              })
            }
            _newData.found = newData.found.trim().split("&&").map(x => x.trim());
            _newData.type = "and"
          } else if (newData.found.includes("&")) { //Worst way to catch syntax error but, works for now
            reject({
              dot: newData.start,
              info: "Syntax Error: Invalid or unexpected token, || (or),&& (and) expected",
              text: text
            })
          } else if (newData.found.includes("|")) { //Same
            reject({
              dot: newData.start,
              info: "Syntax Error: Invalid or unexpected token, || (or),&& (and) expected",
              text: text
            })
          } else {
            _newData.type = "single"; //Entity body does not includes any kinda operators, this is an single
          }
          newArray.push(_newData)
        });
        resolve({
          toArray: function () {
            return newArray
          },
          encoded: function () {
            return utf8ToHex(JSON.stringify(newArray)); //This is an special request
          }
        });
      })
      .catch(function (err) {
        reject(err); //If something goes wrong with private_parse we will catch
      })
  })
}
/**
 * unParse string with parsed data
 * @param {string} text   - Text that needs to be parsed
 * @param {Object} config - Parse Config
 * @param {string} config.prefix - Parser prefix Example: [prefix]{user.name} !{user.name} ${user.name}
 */
function unParse(_text, {
  hex
}) {
  var text = _text.newTrim()
  return new Promise((resolve, reject) => {
    var data;
    try {
      data = JSON.parse(hexToUtf8(hex)); //Convert hex to string
    } catch (err) {
      reject({
        info: "Unable to parse unParsed data, data must be hex",
        err: err
      })
    }
    var all = {};
    data.forEach(function (_data) {
      if (ObjectCheck(_data) !== true) { //Catch parsed data error
        reject({
          info: "Broken unParsed data",
          err: ObjectCheck(_data)
        })
      }
      var pos = _data.nextWord == null ? text.length : text.indexOf(_data.nextWord);
      var pre = _data.startAfterNextWord == null ? _data.start - 1 : text.toString().split(_data.prevNextWord)[0].length + _data.startAfterNextWord + _data.prevNextWord.length
      var found = text.slice(pre, pos).trim();
      if (found.includes(" ")) {
        reject({
          info: "Unexpected input",
          err: found
        })
      }
      all[_data.found] = {
        pos: pos,
        pre: pre,
        found: found,
      }
    });
    resolve(all)
  })
}

function ObjectCheck(data) {
  if (typeof data.complete !== "boolean")
    return "Type of data.complete is not an boolean";
  else if (typeof data.start !== "number")
    return "Type of data.start is not an number";
  else if (typeof data.end !== "number")
    return "Type of data.end is not an number";
  else if (data.nextWord !== null && typeof data.nextWord !== "string")
    return "Type of data.nextWord is not null or string";
  else if (typeof data.found !== "object" && typeof data.found !== "string")
    return "Type of data.found is not array or string";
  else if (typeof data.type !== "string")
    return "Type of data.type is not an string";
  else if (data.type !== "or" && data.type !== "and" && data.type !== "single")
    return "Type of data.type is not or & and & single";
  else
    return true
}

function private_parse(text, {
  prefix,
  start,
  end
}) {
  return new Promise((resolve, reject) => {
    var data = {}; //Collect entities
    var split = text.split("");
    split.map((value, index) => {
      if (value == start) { //İndex is an start
        if (split[index - 1] !== prefix) { //We cant find prefix before the start
          reject({
            dot: index + 1,
            info: "Brace not started with prefix",
            text: text
          })
        }
      } else if (value == prefix) { //Text started with prefix
        if (split[index + 1] !== start) { //Cant found start after prefix
          reject({
            dot: index + 1,
            info: "No brace found after prefix",
            text: text
          })
        } else {
          var newIndex = null;
          var prevNext = null
          if (Object.keys(data).length !== 0) {
            var lastNextWord = Object.values(data)[Object.keys(data).length - 1].nextWord
            prevNext = lastNextWord;
            newIndex = text.split(lastNextWord)[1].indexOf(prefix)
          }
          data[index + 1] = { //Everything is fine adding this record
            complete: false,
            start: index,
            startAfterNextWord: newIndex,
            prevNextWord: prevNext,
            found: null
          }
        }
      } else if (value == end) { //End point seen
        var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
        if (inx == undefined) { //Cant find opened entity before the end point throwing err
          reject({
            dot: index + 1,
            info: "Brace start point not found",
            text: text
          })
        } else {
          var newText = text.slice(data[inx].start, index + 1).trim(); //text between braces        
          var _characters = "/[!@#$%^*()_+\-=\[\]{};':\"\\,<>\/?]/"; //Unwanted characters inside entities
          var characters = _characters.replace(prefix, "").replace(start, "").replace(end, ""); //Replace prefix,start and end
          var charactersRegExp = new RegExp(characters, "g"); //Regexp
          var fixedText = newText.split(prefix).filter(x => x.length > 0)[0].split(start).filter(x => x.length > 0)[0].split(end).filter(x => x.length > 0) //Remove prefix and braces and remove blank elements by filtering it        
          if (charactersRegExp.test(fixedText[0])) { //Check characters in entity body
            reject({
              dot: data[inx].start,
              info: "SyntaxError: Invalid or unexpected token, || (or),&& (and) expected",
              text: text
            });
          } else if (fixedText.length == 0) { //Entity body is empty
            reject({
              dot: data[inx].start,
              info: "SyntaxError: empty entity text",
              text: text
            });
          } else if (fixedText[0].includes(" ")) { //Entity body includes white spaces
            reject({
              dot: data[inx].start,
              info: "SyntaxError: entity body cannot include blank spaces",
              text: text
            });
          }
          var entityIndex = text.split(" ").findIndex(x => x == text.slice(data[inx].start, index + 1)); //Find entity index on all the text
          var nextWord = entityIndex == text.split(" ").length ? null : text.split("")[index + 1] == " " ? text.split(" ")[entityIndex + 1] : text.split("")[index + 1]; //Find the next world after entity
          data[inx] = { //Complete the task
            complete: true,
            start: data[inx].start + 1,
            end: index + 1,
            nextWord: nextWord == undefined ? null : nextWord,
            startAfterNextWord: data[inx].startAfterNextWord,
            prevNextWord: data[inx].prevNextWord,
            found: fixedText[0]
          };
        }
      }
      if (index == split.length - 1) { //All the text analyzed resolve process
        resolve(data)
      }
    })
  });
}

Object.prototype.newTrim = function () { //This will remove extra white spaces
  return (((this.toString()).trim()).toString().replace(/[]/g, "").trim()).toString().replace(/\s+/g, ' ').trim();
}