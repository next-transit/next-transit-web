var config = {},
	fs = require('fs');
	local = {},
	agency = {};

if(fs.existsSync(__dirname + '/../../../config/local.json')) {
	local = require('../../../config/local.json');
}

if(fs.existsSync(__dirname + '/../../../config/agency.json')) {
	local = require('../../../config/agency.json');
}

config.debug_assets = process.env.DEBUG_ASSETS || local.debug_assets;
config.mail_username = process.env.MAIL_USERNAME || local.mail_username;
config.mail_password = process.env.MAIL_PASSWORD || local.mail_password;

config.database_url = process.env.DATABASE_URL || local.database_url || agency.database_url;

module.exports = config;