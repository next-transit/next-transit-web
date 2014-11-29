An [Express](https://github.com/visionmedia/express) wrapper library that provides enhanced routing and controller handling.

## Installation

	$ npm install shack

## Use just like express

```js
var shack = require('shack');
var app = shack();

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(3000);
```

## Define routes in a dedicated JSON file

```js
{
	"get /users": { "action":"users" },
	"post /users/:id": { "action":"users:update" },
	"put /users/:id": { "action":"users:create" }
}
```

## Define controllers with actions instead of routes

```js
var ctrl = require('shack').controller('users');

// A default "index" action is always created

ctrl.action('create', function(req, res, success) {
	// Save user
	User.save({}, function(user) {
		success(user);
	});
});

modules.exports = ctrl;
```

## Features

  * Build on [Express](https://github.com/visionmedia/express)
  * Elegant, dedicated routing file
  * Controller pattern focused on actions instead of specifically http requests
  * Sensible defaults for common behaviors
  * Easily default whole controllers or actions to JSON
  * "before" and "after" handlers for common pre- or post-action behaviors
