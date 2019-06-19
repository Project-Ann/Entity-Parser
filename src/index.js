/*
DialogEngine Entities Parser Module

Old version waiting for upgrade

Feel free to improve the code!

--
*/

module.exports =
  /**
   * Parse string
   * @param {string} text - Text that needs to be parsed
   */
  function parse(text) {
    return new Promise((resolve, reject) => {
      private_parse(text)
        .then(function (data) {
          var newArray = [];
          Object.values(data).sort().forEach(function (newData) {
            var _newData = newData;
            if (newData.complete == false) {
              reject({
                dot: newData.start,
                info: "Syntax Error: brace not completed",
                text: text
              })
            }
            if (newData.found.includes("||")) {
              _newData.found = newData.found.trim().split("||").map(x => x.trim());
              _newData.type = "or"
            } else if (newData.found.includes("&&")) {
              _newData.found = newData.found.trim().split("&&").map(x => x.trim());
              _newData.type = "and"
            } else if (newData.found.includes("&")) {
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid or unexpected token, || (or),&& (and) expected",
                text: text
              })
            } else if (newData.found.includes("|")) {
              reject({
                dot: newData.start,
                info: "Syntax Error: Invalid or unexpected token, || (or),&& (and) expected",
                text: text
              })
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
    var data = {}; //Collect entities
    var split = text.split("");
    split.map((value, index) => {
      if (value == "{") {
        if (split[index - 1] !== "$") {
          reject({
            dot: index + 1,
            info: "Brace not started with prefix",
            text: text
          })
        }
      } else if (value == "$") {
        if (split[index + 1] !== "{") {
          reject({
            dot: index + 1,
            info: "No brace found after prefix",
            text: text
          })
        } else {
          data[index + 1] = {
            complete: false,
            start: index,
            found: null
          }
        }
      } else if (value == "}") {
        var inx = Object.keys(data)[Object.keys(data).sort().length - 1];
        if (inx == undefined) {
          reject({
            dot: index + 1,
            info: "Brace start point not found",
            text: text
          })
        } else {
          var newText = text.slice(data[inx].start, index + 1).trim(); //text between braces        
          var characters = /[!@#$%^*()_+\-=\[\]{};':"\\,<>\/?]/; //Unwanted characters inside entities
          var fixedText = newText.split(/[\{$}]+/).filter(x => x.length > 0) //Remove prefix and braces and remove blank elements by filtering it        
          if (characters.test(fixedText[0])) {
            reject({
              dot: data[inx].start,
              info: "SyntaxError: Invalid or unexpected token, || (or),&& (and) expected",
              text: text
            });
          } else if (fixedText.length == 0) {
            reject({
              dot: data[inx].start,
              info: "SyntaxError: empty entity text",
              text: text
            });
          }
          data[inx] = {
            complete: true,
            start: data[inx].start + 1,
            end: index + 1,
            found: fixedText[0]
          };
        }
      }
      if (index == split.length - 1) {
        resolve(data)
      }
    })
  });
}