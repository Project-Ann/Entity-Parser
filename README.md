# Entity-Parser
Entity parser for DialogEngine

# Parsing texts

```js
parse("Hi ${users.name}! How is the ${users.guest && user.friend}, Today is a ${weather.degree || weather.fahr}")
    .then((entity) => {
      /*
      List of entities
        [
          {
            complete: true,
            start: 4,
            end: 16,
            found: 'users.name',
            type: 'single'
          },
          {
            complete: true,
            start: 30,
            end: 58,
            found: ['users.guest', 'user.friend'],
            type: 'and'
          },
          {
            complete: true,
            start: 67,
            end: 99,
            found: ['weather.degree', 'weather.fahr'],
            type: 'or'
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