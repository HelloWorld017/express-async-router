## express-async-router
An async router for express

### Features
 * automatically detects sync / async.
 * supports all methods (use, get, post, delete, ...)
 * supports param

### Usage
```js
const createAsyncRouter = require('express-async-router');

const router = createAsyncRouter();
router.get('/', myAsyncMiddleware, syncMiddleware, async (req, res, next) => {
	// whatever

	if(somethingErrornous)
		throw new Error("This does not become unhandled rejection");

	// otherwise call next like usual
	next();
});
```

