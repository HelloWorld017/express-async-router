const {Router} = require('express');

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

function wrapAsyncHandler(fn, nextLocation = null) {
	return (...fnArgs) => {
		const nextAt = nextLocation === null ? fnArgs.length - 1 : nextLocation;
		const nextOriginal = fnArgs[nextAt];
		
		let nextCalled = false;
		fnArgs[nextAt] = (...nextArgs) => {
			nextCalled = true;
			return nextOriginal(...nextArgs);
		};
		
		fn(...fnArgs).catch(err => {
			if(!nextCalled) {
				nextOriginal(err);
				return;
			}
			
			console.error("Error after next() called!");
			console.error(err);
		});
	};
}

module.exports = function createAsyncRouter() {
	const router = new Router();
	const monkeyPatchNames = [
		"all", "checkout", "copy", "delete", "get", "head",
		"lock", "merge", "mkactivity", "mkcol", "move",
		"m-search", "notify", "options", "patch", "post",
		"purge", "put", "report", "search", "subscribe",
		"trace", "unlock", "unsubscribe", "use"
	];
	
	return new Proxy(router, {
		get(target, name) {
			if(monkeyPatchNames.includes(name)) {
				return (...args) => {
					return target[name](
						...args.map(fn => {
							if(!(fn instanceof AsyncFunction)) return fn;
							
							return wrapAsyncHandler(fn);
						})
					);
				};
			}
			
			if(name === 'param') {
				return (...args) => {
					if(args[args.length - 1] instanceof AsyncFunction) {
						args[args.length - 1] = wrapAsyncHandler(
							args[args.length - 1],
							2
						);
					}
					
					return target[name](...args);
				};
			}
			
			return target[name];
		}
	});
};