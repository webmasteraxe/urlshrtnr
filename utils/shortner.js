/**
 * Created by championswimmer on 24/11/16.
 */

const db = require('./db');
var alphabet = "0123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var base = alphabet.length;
var codes = [];
var resp = [];
var singleCode = [];

//Generate randomcode for single url
const getRandomCode = function (num) {
    let randCode = "";
        let numb = num;
  		for (var i = 0; i < numb; i++) {
	        randCode += alphabet[Math.floor((Math.random() * base))];
    	}
    return randCode;

};

//Generate randomcode for Bulk Urls & Insert data
 const getBulkInput = function(inputReq,done) {
  for(i=0; i<inputReq.length;i++){
      if(Array.isArray(inputReq[i].url)){
          for(j=0; j<inputReq[i].url.length;j++){
          if(inputReq[i].num === undefined){
          resp.push({
              code : getRandomCode(6),
              domainName : inputReq[i].domain,
              longURL : inputReq[i].url[j]
          });
          codes.push(getRandomCode(6));

      } else {
          resp.push({
              code : getRandomCode(inputReq[i].num),
              domainName : inputReq[i].domain,
              longURL : inputReq[i].url[j]
          });
          codes.push(getRandomCode(inputReq[i].num));
      }
      }
  } else {
      if(inputReq[i].num === undefined){
          resp.push({
              code : getRandomCode(6),
              domainName : inputReq[i].domain,
              longURL : inputReq[i].url
          });
          codes.push(getRandomCode(6));

      } else {
          resp.push({
              code : getRandomCode(inputReq[i].num),
              domainName : inputReq[i].domain,
              longURL : inputReq[i].url
          });
          codes.push(getRandomCode(inputReq[i].num));
      }
  }
  }
  db.findAll(codes, function (response) {
    console.log("codes -->",codes);
    console.log("response -->",response);
      if(response == undefined){
        db.bulkUrl(resp, function (response) {
          console.log("resp -->",resp);
          console.log("response -->",response);
          done(resp);
        }, function (error) {
            console.log("BulkInsertError-->",error);
            done(error);
        });
      } else {
        getBulkInput(inputReq,done);
      }
  }, function (error) {
      console.log("BulkFindError-->",error);
      done(error);
  });
};

module.exports = {
    shorten: function (num, domain, url, code, done) {
        let alias = null;
		code = getRandomCode(num);
 		db.addUrl(code, domain , url, alias, function (shortcode, existed, longURL) {
            var shrtUrl = domain + shortcode;
            done(shortcode,shrtUrl, existed, longURL);
        }, function (error) {
            console.log(error);
            done(null)
        });


    },

    bulkInsert: function(inputReq,done){
        getBulkInput(inputReq,done);

    },

    expand: function(shortcode, from, done) {
        db.fetchUrl(shortcode, from, function (url) {
            done(url);
        }, function (error) {
            console.log(error);
            done(null)
        });
    },
    stats: function (page,size,fullUrl) {
        return db.urlStats({page,size}).then( ({urls,lastPage})=>{
                    let nextPage= page==lastPage ? null : page+1;
                    let prevPage = page==1 ? null : page-1 ;

                    if(nextPage)
                        nextPage = fullUrl + `?page=${nextPage}&size=${size}`;
                    if(prevPage)
                        prevPage = fullUrl + `?page=${prevPage}&size=${size}`;

                    return {urls,prevPage,nextPage,lastPage};
                });
    }
};
