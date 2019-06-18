/*jshint node:true, mocha:true */

'use strict';
var assert = require('assert');
require('should');
var parser = require("../src/index");

describe('parser()', function() {
  it('Have to give 2 entity', () => {
    parser("Hi ${users.name}! How is the ${users.guest}")
    .then((entity) => {
      entity.length.should.be.exactly(2)
    }).catch(function(){})
  })
});