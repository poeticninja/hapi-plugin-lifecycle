/**
* Dependencies.
*/
var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');
var Loader = require('..');

// Test shortcuts
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var before = lab.before;
var it = lab.it;
var expect = Code.expect;

describe('Lifecycle', function(){

  it('loads plugins in order', function(done){

      var server = new Hapi.Server();
      server.connection();

      var one = function (server, options, next) {

        server.expose('value', 'one');

        var child = function (server, options, next) {

            server.expose('value', 'a');
            return next();
        };

        child.attributes = {
            name: 'a'
        };

        server.plugins.lifecycle.register('start', child, function(err){
          if (err) throw err;
        });

        return next();
      };

      one.attributes = {
          name: 'one'
      };


      // Plugin Two
      var two = function (server, options, next) {

        server.expose('value', 'two');

        var child = function (server, options, next) {

            expect(server.plugins.a).to.exist();
            expect(server.plugins.a.value).to.equal('a');

            server.expose('value', 'b');
            return next();
        };

        child.attributes = {
            name: 'b'
        };

        server.plugins.lifecycle.register('middle', child, function(err){
          if (err) throw err;
        });

        return next();
      };

      two.attributes = {
          name: 'two'
      };


      // Plugin Three
      var three = function (server, options, next) {

        server.expose('value', 'three');

        var child = function (server, options, next) {

            expect(server.plugins.b).to.exist();
            expect(server.plugins.b.value).to.equal('b');

            server.expose('value', 'c');
            return next();
        };

        child.attributes = {
            name: 'c'
        };

        server.plugins.lifecycle.register('last', child, function(err){
          if (err) throw err;
        });

        return next();
      };

      three.attributes = {
          name: 'three'
      };


      // Plugin Four
      var four = function (server, options, next) {

        server.expose('value', 'four');

        var child = function (server, options, next) {

            expect(server.plugins.a).to.exist();
            expect(server.plugins.a.value).to.equal('a');

            server.expose('value', 'd');
            return next();
        };

        child.attributes = {
            name: 'd'
        };

        server.plugins.lifecycle.register('last', child, function(err){
          if (err) throw err;
        });


        return next();
      };

      four.attributes = {
          name: 'four'
      };

      server.register([
        {
          register: Loader,
          options: ['start','middle', 'last']
        },
        {
          register: four
        },
        {
          register: three
        },
        {
          register: two
        },
        {
          register: one
        }
      ], function(err){
        expect(err).to.not.exist();

        expect(server.plugins.one.value).to.equal('one');
        expect(server.plugins.two.value).to.equal('two');
        expect(server.plugins.three.value).to.equal('three');
        expect(server.plugins.four.value).to.equal('four');

        server.start(function (err) {
          expect(err).to.not.exist();

          expect(server.plugins.a.value).to.equal('a');
          expect(server.plugins.b.value).to.equal('b');
          expect(server.plugins.c.value).to.equal('c');
          expect(server.plugins.d.value).to.equal('d');

          done();

        });

      });



  });

});
