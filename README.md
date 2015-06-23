# FoxxSupertest
HTTP assertions adopted from [Supertest](https://github.com/visionmedia/supertest#supertest-) for ArangoDB Foxx

# About
[Foxx](https://www.arangodb.com/foxx/) is a great Javascript framework built inside ArangoDB's server, this makes the queries to the database amazingly fast over the ordinary driver, for example Node.Js. However, provding high-level abstraction for testing HTTP is the aim for this module, which allows the developer to focus more on a faster development cycle.


## Requirements
You will need to have **at least ArangoDb 2.6** installed.

## Installation
`npm install foxxsupertest`


## Instructions
You will need to pass the following option when you first initialize the module:
* `applicationContext` : This is the default global application context variable within your Foxx app.
* `serverAddress` : Your ArangoDB server address, e.g: `http://localhost:8529`.
* `baseURL` : Your database mounting point (not the Foxx mounting point), e.g: `/_db/_system`.



## Examples
FoxxSupertest works well with Mocha shipped-in with ArangoDB 2.6. The following examples demonstrate how it works as it differ a little bit from the original Supertest:

```javascript
let request = require("foxxsupertest")(applicationContext, "http://localhost:8529");
describe("GET /test", function(){
  it("should responds with 200", function(done){
    request
      .get('/test')
      .expect(200)
      .end(function(err, res){
        if(err) throw err;
        done();
      });
  });
}
```
As the original SuperTest, you can add many `expect` with different types:

```javascript
let request = require("foxxsupertest")(applicationContext, "http://localhost:8529");
describe("GET /test", function(){
  it("should responds with json and 200", function(done){
    request
      .get('/test')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if(err) throw err;
        done();
      });
  });
}
```

If you want to add headers and content to your request, you will need to add them to the request options since FoxxSupertest uses the [request module](https://docs.arangodb.com/ModuleRequest/index.html) shipped with ArangoDB to simulate the http requests:

```javascript
let request = require("foxxsupertest")(applicationContext, "http://localhost:8529");
describe("GET /users", function(){
  it("should responds with json and 200", function(done){
    request
      .post('/test',{
        auth: {
          username : "test",
          password : "test"
        },
        body: {
          content: "content to post"
        },
        json: true
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if(err) throw err;
        done();
      });
  });
}
```

## API
FoxxSupertest uses the similar API which Supertest uses:

### .expect(status[, fn])

  Assert response `status` code.

### .expect(status, body[, fn])

  Assert response `status` code and `body`.

### .expect(body[, fn])

  Assert response `body` text with a string, regular expression, or
  parsed body object.

### .expect(field, value[, fn])

  Assert header `field` `value` with a string or regular expression.
  
### .end(fn)
Perform the request and invoke `fn(err, res)`.


## Notes
As we mentioend before, this module was adopted from Supertest, hence we resued some of the original source code to work with this module

## Author
Omar A. Al-Safi (omarsmak@gmail.com, omar@fedger.io)

## License
MIT
