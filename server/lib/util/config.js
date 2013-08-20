var config = {},
	fs = require('fs');
	local = {};

if(fs.existsSync(__dirname + '/../../local.json')) {
	local = require('../../local.json');	
}

config.debug_assets = process.env.DEBUG_ASSETS || local.debug_assets;
config.database_url = process.env.DATABASE_URL || local.database_url;
config.mail_username = process.env.MAIL_USERNAME || local.mail_username;
config.mail_password = process.env.MAIL_PASSWORD || local.mail_password;

module.exports = config;