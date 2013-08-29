var config = {},
	fs = require('fs');
	local = {};

if(fs.existsSync(__dirname + '/../../../config/local.json')) {
	local = require('../../../config/local.json');
}

config.debug_assets = process.env.DEBUG_ASSETS || local.debug_assets;
config.mail_username = process.env.MAIL_USERNAME || local.mail_username;
config.mail_password = process.env.MAIL_PASSWORD || local.mail_password;

config.database_url = process.env.DATABASE_URL || local.database_url[local.agency];

config.agency = process.env.AGENCY || local.agency;

module.exports = config;