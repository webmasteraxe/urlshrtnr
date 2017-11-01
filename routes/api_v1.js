/**
 * Created by championswimmer on 14/12/16.
 */
const express = require('express');
const config = require('../config.json');
const route = express.Router();
const shortner = require('../utils/shortner');
const SHORTENER_SECRET = process.env.SHORTURL_SECRET || "cb@123";


route.post('/shorten', function (req, res) {
    console.log("req --> ", req.body);
    let url = req.body.url;
    let num = req.body.num;
    let domain = req.body.domain;
    let secret = req.body.secret;
    let code = null;
    if (secret == SHORTENER_SECRET) {
        console.log('Using secret');
        code = req.body.code;
        if (code && code.length > 9) {
            console.log('Too long code');
            return res.send("We do not support larger than 9 character");
        }
    }

    shortner.shorten(num, domain, url, code, function (shortcode,shrtUrl, existed, longURL) {

        res.send({
            shortcode,shrtUrl, existed, longURL
        });
    });
});


route.post('/bulkify', function(req,res){
    let inputReq = req.body;
    let inputLength = req.headers['content-length'];
    console.log("Total Size -->",inputLength);
    var err = null;
    if(inputLength < 90000){
        for(i=0; i<inputReq.length;i++){
            if(inputReq[i].domain === undefined || inputReq[i].domain === "" ){
                err.push("Domain is mandatory ");
            }else if(inputReq[i].url === undefined || inputReq[i].url === "" ){
                err.push("Url is mandatory ");
            }
        }
        if(err === null){
            shortner.bulkInsert(inputReq, function (resp,done) {
            return res.status(200).send(resp);
            });
        } else {
                console.log("Err --->",err);
                return res.status(400).send(err);
            }
        }else{
            return res.status(400).send("Input Request Length Exceeds");
        }

});




route.get('/expand/:shortcode', function (req, res) {
    console.log("requested url -->", req.params.shortcode);

    if(req.params.shortcode.length > 9) {
        console.log("requested url -->", req.params.shortcode);
        res.redirect(200, '/opensmspro');
    }

    if (!req.params.shortcode || req.params.shortcode.length == 0) {
        console.log("requested url -->", req.params.shortcode);
        res.send({
            status: 501,
            message: "Wrong shortcode, or no shortcode given"
        })
    } else {
        shortner.expand(req.params.shortcode, req.headers.referer, function (URL) {
            console.log("requested url -->", req.params.shortcode);
            console.log("found url -->", req.params.shortcode, req.headers.referer);
            if (URL) {
                res.send({
                    status: 200,
                    url: URL
                })
            } else {
                res.send({
                    status: 501,
                    message: "Server error"
                })
            }
        });
    }

});

route.get('/stats', function (req, res) {
    const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl.split("?").shift() ;

    let {page,size} = req.query ;
    page = parseInt(page) || 1;
    size = parseInt(size) || config.PAGINATION_SIZE;

    shortner.stats(page,size,fullUrl).then( ({urls,prevPage,nextPage,lastPage})=>{
        const meta = { prevPage,nextPage,lastPage };
        res.json({urls,meta});
    }).catch(err=>{
        console.error(err);
        res.send ({
            code: 501,
            message: "Error occured"
        })
    });
});

route.use((req, res) => {
    res.send("This is not the way to use the api")
});

module.exports = route;
