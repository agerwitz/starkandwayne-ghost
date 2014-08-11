var path = require('path'),
    config, mysql;

var env = process.env.NODE_ENV || 'development';
var production = env == 'production';

var cfCore = {};
var sqlCredentials = {};
var mailCredentials = {};
if (production) {
  var cfEnv = require("cf-env");
  var pkg   = require("./package.json");
  var cfCore = cfEnv.getCore({name: pkg.name});
  var sqlCredentials = cfEnv.getService("ghost-pg-prod").credentials;
  var mailCredentials = cfEnv.getService("shared-mail").credentials;
}
console.log(sqlCredentials);
console.log(mailCredentials);

config = {
    development: {
      url: 'http://localhost:2368',
      database: {
        client: 'sqlite3',
        connection: {
            filename: path.join(__dirname, '/content/data/ghost-dev.db')
        },
        debug: true
      },
      server: {
        host: '127.0.0.1',
        port: '2368'
      },
      paths: {
        contentPath: path.join(__dirname, '/content/')
      }
    },
    // Cloud Foundry
    production: {
      url: cfCore.url,
      mail: {
        transport: 'SMTP',
        options: {
          service: 'Sendgrid',
          auth: {
            user: mailCredentials.username,
            pass: mailCredentials.password,
          }
        }
      },
      database: {
        client: 'pg',
        connection: sqlCredentials.uri,
        pool: {
          min: 2,
          max: 4
        },
        debug: false
      },
      server: {
        host: cfCore.bind,
        port: cfCore.port
      },
      logging: false
    },

};
module.exports = config;
