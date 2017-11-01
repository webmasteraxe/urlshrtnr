var supertest = require("supertest");
var should = require("should");
var request = supertest.agent("https://url-shtenr-stage.herokuapp.com/api/v1/");



describe("MyShotlr Application",function(){

  it("Get All Stats", function (done) {
      request
          .get("stats")
          .expect("Content-type",/json/)
  .expect(200) // THis is HTTP response
  .end(function(err,res){
    // HTTP status should be 200
    res.status.should.equal(200);
    done();
  });
  });

  it("Check Home Page",function(done){

    //calling ADD api
    request
    .get('https://url-shtenr-stage.herokuapp.com/')
    .expect("Content-type",/json/)
  .expect(200) // THis is HTTP response
  .end(function(err,res){
    // HTTP status should be 200
    res.status.should.equal(200);
    done();
  });
  });

 });


// //Require the dev-dependencies
// let chai = require('chai');
// let chaiHttp = require('chai-http');
// let server = require('../server/server');
// let should = chai.should();
// chai.use(chaiHttp);
// /*
//   * Test the /GET route
//   */
// describe('Bulkify', () => {
//       it('Bulkify Urls', (done) => {
//         chai.request(server)
//    .post('/api/v1/bulkify')
//    .send([
//     {
//         "num": "5",
//         "domain": "http://apsw.us/",
//         "url": "https://www.androidwiz.in"
//     },
//     {
//         "num": "6",
//         "domain": "http://apsw.us/",
//         "url": "https://www.nearbuy.com"
//     }
// ])
//    .end((err,res) => {
//                res.should.have.status(200);
//                res.body.should.be.a('array');
//                done();
//    })
//             });
//   });
