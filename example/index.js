var parser = require("../src/index");

var parseText = "Hello ${ai.name||ai.nickname}! How is the weather in ${user.location} ?";
var normalText= "Hello Ann! How is the weather in Istanbul ?";

parser.parse(parseText,{
    prefix:"$",
})
  .then(function(data) {
    console.log(data.toArray());
    console.log("Parsing right now!")
    setTimeout(function() {
      parser.decode(normalText,{
        hex:data.encoded()
      })
      .then(function(data){
        console.log(data);
      })
      .catch(function(err){
        console.log(err)
      })
    },2000)
  })
  .catch(function(err){
    console.log(err);
  });

  
