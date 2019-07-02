# Entity-Parser
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser?ref=badge_shield)

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


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FProject-Ann%2FEntity-Parser?ref=badge_large)