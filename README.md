# Entity-Parser
Entity parser for DialogEngine

# Parsing texts

```js
    parser("Hi ${users.name}! How is the ${users.guest}")
    .then((entity) => {
      /*

      */
    }).catch(function(err){
      console.log(err)
    })
```

# Run tests

```bash

$ npm test

```