var config = {},
	fs = require('fs');
	local = {};

if(fs.existsSync(__dirname + '/../../../config/local.json')) {
	local = require('../../../config/local.json');
}

config.debug_assets = process.env.DEBUG_ASSETS || local.debug_assets;
config.verbose = process.env.VERBOSE || local.verbose;
config.mail_username = process.env.MAIL_USERNAME || local.mail_username;
config.mail_password = process.env.MAIL_PASSWORD || local.mail_password;

config.data_url = process.env.DATA_URL || local.data_url;
config.data_api_key = process.env.DATA_API_KEY || local.data_api_key;

config.agency = process.env.AGENCY || local.agency;

module.exports = config;