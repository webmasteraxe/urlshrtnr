/**
 * Created by championswimmer on 25/11/16.
 */
const Sequelize = require('sequelize');


//This is so that BIGINT is treated at integer in JS
require('pg').defaults.parseInt8 = true;
//We have made sure that we do not use integers larger than 2^53 in our logic

const DB_HOST = process.env.NODE_MYSQL_HOST || "localhost";
const DB_USER = process.env.SHORTURL_SQL_USER || "postgres";
const DB_PASS = process.env.SHORTURL_SQL_PASSWORD || "adithya784";
const DB_NAME = process.env.SHORTURL_SQL_DBNAME || "shorturl";

const DATABASE_URL = process.env.DATABASE_URL || ('postgres://' + DB_USER + ":" + DB_PASS + "@" + DB_HOST + ":5432/" + DB_NAME);
console.log("DATABASE_URL",DATABASE_URL);

const sequelize = new Sequelize(DATABASE_URL, {
    host: DB_HOST,
    dialect: 'postgres',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});


const URL = sequelize.define('url', {
    code: {type: Sequelize.STRING, primaryKey: true},
    domainName : {type: Sequelize.STRING, primaryKey: true},
    longURL: {type: Sequelize.STRING},
    hits: {type: Sequelize.INTEGER, defaultValue: 0},
    expiresAt : {type: Sequelize.DATE}
});

const Event = sequelize.define('event', {
    time: {type: Sequelize.DATE},
    from: {type: Sequelize.STRING}
});

const Alias = sequelize.define('alias', {});

const User = sequelize.define('user', {
    username: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING}
});

Event.belongsTo(URL);

//sequelize.sync(); //Normal case
sequelize.sync({force: true}); //If schema changes NOTE: It will drop/delete old data


module.exports = {
    addUrl: function (code, domain ,longURL, alias, done, failed) {
        if (!alias) {
            URL.findOrCreate({
                where: {
                    code : code,
                    domainName : domain
                },
                defaults: {
                    code : code,
                    domainName : domain,
                    longURL : longURL,
                    expiresAt : null
                }

            }).spread(function (url, created) {
                done(url.code, !created, url.longURL);
            }).catch(function (error) {
                console.log(error);
                failed(error);
            })
        } else {
            //TODO: handle longer than 9 with alias map
        }
    },

    bulkUrl : function (resp, done, failed) {
            URL.bulkCreate(resp).spread((results, metadata) => {
              console.log("BulkResults -->",results);
                done(results);
            }).catch(function (error) {
                console.log(error);
                failed(error);
            })
    },

    findAll : function(codes,done,failed){
      URL.findAll({ where: { code: codes }}).spread((results, metadata) => {
        console.log("findAllResults -->",results);
        done(results);
          // Raw query - use spread
        }).catch(function (error) {
            console.log("findAllResultserror -->",error);
            failed(error);
        })
    },

    fetchUrl: function (code, from, done, failed) {
        URL.findById(code).then(function (url) {
            done(url.longURL);
        }).catch(function (error) {
            failed(error)
        })
    },
    urlStats: function ( {page,size} ) {

    const offset = (page - 1) * size;
    return URL.findAndCountAll({
                order : [ [ 'hits', 'DESC' ] ],
                limit : size,
                offset: offset
            }).then(data=>{
                if (offset > data.count || offset < 0)
                    throw new Error('Pagination Error : Out of Error Range');

                const lastPage = Math.ceil(data.count/size);
                return { urls : data.rows,lastPage};
            });
    }
};
