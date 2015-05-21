stormAPI.js
===========

A JavaScript library to utilize Liquid Web's Storm API

## Requirements ##
stormAPI.js requires jQuery

## Usage ##

### Instantiation ###
The minimum parameters required are the credentials for the account user you want to use:

```
apiObj = new stormAPI('userName', 'password'); // Defaults to version 1 of the API
```

Alternately, you can also supply the version of the API you want to use (`v1` or `bleed` for right now):

```
apiObj = new stormAPI('userName', 'password', 'bleed');
```

During the instantiation process, the credentials supplied will be verified. If they are good, a token will be generated and will replace the password for increased security (this way someone couldn't take a peek at the browsers console and get your password).

If the credentials aren't accepted, a 401 Status Code will be returned. At this point, the easiest thing to do would be to reinstantiate with proper credentials, although you could manually update the `password` and/or `user` property of the object and call the `checkAuth()` method.

### Usage ###

Again, usage is fairly straight forward. The method is called in the following format: `stormAPI.apiCall(method, params, async)`. It returns a [jqXHR object](http://api.jquery.com/jQuery.ajax/#jqXHR).

The `method` param is passed in as an array comprised of the elements of the API method. So for example, if you wished to call the `storm/server/list` method, you would pass in `['storm','server','list']`.

The `params` and `async` arguments are optional. `async` will default to `true`. If you wish to specify async without specifying API parameters, just pass in `false` for the `params` argument.

The following is an example that would return the JSON for a list of Storm servers using the `bleed` version and explicitely setting `async` without API parameters:

```
apiClient = new stormAPI('user', 'pass', 'bleed');

apiClient.apiCall(['storm','server','list'], false, true).done(function () {
	console.log(apiClient.lastXHR.responseJSON);
});
```

#### stormAPI.simpleCall() ####
If you're looking for a quick call that's synchronous and you don't want to deal with the jqXHR object, then `stormAPI.simpleCall` method is right for you.

If successful, it will return an object based on the parsed JSON that was returned. If an HTTP code other than 200 is returned, a string will be returned indicating what it was.

Please note that API generated exeptions (as seen [here](https://www.liquidweb.com/storm/api/docs/tutorials/exceptions.html)) will still be returned as a regularly parsed JSON object.

### Other Things ###

The library contains a `tokenTimeLeft()` method which gives an idea of how much time is left on the token before expiration. Note that the time left is dependant upon how close the browser time matches the API server's time, so if the system clock is off for the client, the actual time remaining could be misrepresented.
