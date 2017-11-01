/**
 * Created by championswimmer on 14/12/16.
 */
const express = require('express');
const route = express.Router();

const shortner = require('../utils/shortner');


route.get('/:shortcode', (req, res, next) => {
    console.log(req.params.shortcode);
    if (!req.params.shortcode || req.params.shortcode.length == 0) {
        next();
    }

    shortner.expand(req.params.shortcode, req.headers.referer, function (URL) {
        if (!URL) {
            next();
        } else {
            res.redirect(URL);
        }
    });

});

module.exports = route;