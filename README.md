# Entity-Parser
Entity parser for DialogEngine

# Parsing texts

```js
    parser("Hi ${users.name}! How is the ${users.guest}")
    .then((entity) => {
      /*
        [
          {
            complete: true,
            start: 3,
            end: 15,
            found: 'users.name',
            type: 'single'
          },
          {
            complete: true,
            start: 29,
            end: 42,
            found: 'users.guest',
            type: 'single'
          }
        ]
      */
    }).catch(function(err){
      console.log(err)
    })
```

# Run tests

```bash

$ npm test

```
