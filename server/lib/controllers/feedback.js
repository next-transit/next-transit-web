var mailer = require('nodemailer'),
	config = require('../util/config'),
	ctrl = require('./controller').create('feedback'),
	smtp = mailer.createTransport('SMTP', {
		service: 'Gmail',
		auth: {
			user: config.mail_username,
			pass: config.mail_password
		}
	});

ctrl.action('index', function(req, res, callback) {
	callback({ title:'Feedback' });
});

ctrl.action('submit', { json:true }, function(req, res, callback) {
	var body = '<p><strong>From:</strong> ' + (req.body.name || '<em>Not given</em>') + '</p>' + 
				'<p><strong>Email:</strong> ' + (req.body.email || '<em>Not given</em>') + '</p>' + 
				'<p><strong>Message:</strong> &quot;' + (req.body.message || '').replace('\n', '<br>\n') + '&quot;</p>',
		mail = {
			from: 'nextsepta@gmail.com <NEXT|Septa>',
			to: 'nextsepta@gmail.com',
			subject: 'Feedback',
			html: body 
		};

	smtp.sendMail(mail, function(error, res) {
		if(error) {
			console.log(error);
			callback({ success:false });
		} else {
			callback({ success:true });
		}
	});
});

module.exports = ctrl;