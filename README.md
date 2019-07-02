# Entity-Parser
Entity parser for DialogEngine

[![Build Status](https://travis-ci.org/Project-Ann/Entity-Parser.svg?branch=master)](https://travis-ci.org/Project-Ann/Entity-Parser) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser?ref=badge_shield)

```shell

  $ npm i entity-parser

```

# Parsing texts

```js
entityParser.parse("Hello ${ai.name||ai.nickname}! How is the weather in ${user.location} ?",{
    prefix:"$", // ${entity}
})
  .then(function(data) {
    console.log(data.toArray());
      /*
      //List of entities
      [
        {
          complete: true,
          start: 7,
          end: 29,
          nextWord: '!',
          startAfterNextWord: null,
          prevNextWord: null,
          found: ['ai.name', 'ai.nickname'],
          type: 'or'
        },
        {
          complete: true,
          start: 54,
          end: 69,
          nextWord: '?',
          startAfterNextWord: 23,
          prevNextWord: '!',
          found: 'user.location',
          type: 'single'
        }
      ]
      //Encoded data for decoding 
        console.log(data.encoded());
        5b7b22636f6d706c657465223a747275652c227374617274223a372c22656e64223a32392c226e65787...
      */
    }).catch(function(err){
      console.log(err)
    })
```

# Decoding parsed texts

```js
      var encodedData = "5b7b22636f6d706c657465223a747275652c227374617274223a372c22656e64223a32392c226e65787..."
      parser.decode("Hello Ann! How is the weather in Istanbul ?",{
        hex: encodedData
      })
      .then(function(data){
        console.log(data);    
        /*
        //List of data
          {
            'ai.name,ai.nickname': {
              pos: 9,
              pre: 6,
              found: 'Ann'
            },
            'user.location': {
              pos: 42,
              pre: 33,
              found: 'Istanbul'
            }
          }
        */
      })
      .catch(function(err){
        console.log(err)
      })
```

# Run tests

```bash

$ npm test

```


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser?ref=badge_large)