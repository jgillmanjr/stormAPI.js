/*
 * stormAPI.js
 */

var stormAPI = function (userName, password, apiVersion, baseURI) {
	this.userName = userName;
	this.password = password;
	this.tokenExpiration = null;

	/*
	 * Specify what API is being called. Defaults to production public
	 */
	if (baseURI === undefined) {
		this.baseURI = 'https://api.stormondemand.com';
	} else {
		this.baseURI = baseURI;
	}

	/*
	 * Specify API version. Default to v1
	 */
	if (apiVersion === undefined) {
		this.apiVersion = 'v1';
	} else {
		this.apiVersion = apiVersion;
	}

	/*
	 * Build the systemURI
	 */
	this.systemURI = this.baseURI + '/' + apiVersion;

	/*
	 * Template call parameters
	 * The url will change as needed
	 */
	this.callParams = {
		dataType: 'json',
		url: this.systemURI,
		method: 'POST',
		headers: {
			Authorization: 'Basic ' + window.btoa(this.userName + ':' + this.password)
		}
	};

	/*
	 * Verify the credentials and get the token and expiration
	 */
	this.checkAuthResult = this.checkAuth();
	if (!this.checkAuthResult.status) {
		console.log(this.checkAuthResult.message);
	}
};

/*
 * Check credentials
 */
stormAPI.prototype.checkAuth = function () {
	this.callParams.headers.Authorization = 'Basic ' + window.btoa(this.userName + ':' + this.password); // Just in case this.password was changed
	this.apiCall(['account','auth','token'], false, false);

	var success = {status: false, message: ''}; // Return whether the auth worked or not

	if (this.lastXHR.status == 200) {
		this.password = this.lastXHR.responseJSON.token;
		this.callParams.headers.Authorization = 'Basic ' + window.btoa(this.userName + ':' + this.password);
		this.tokenExpiration = parseInt(this.lastXHR.responseJSON.expires); // Using parseInt because sometimes the expiration will come back as a string...
		success.status = true;
		success.message = 'Credentials Correct';
	} else if (this.lastXHR.status == 401) {
		success.message = 'Invalid Credentials';
	} else {
		success.message = 'An HTTP code of ' + this.lastXHR.status + ' was returned.';
	}

	return success;
};

/*
 * Get the time remaining until token expiration
 * This number can be skewed if there is a difference between workstation time and the time of the API server
 */
stormAPI.prototype.tokenTimeLeft = function () {
	var browserTime = parseInt(Date.now()/1000); // Convert to seconds
	var timeLeft = this.tokenExpiration - browserTime;
	return timeLeft;
};

/*
 * Make an API call
 *
 * @param array method - The endpoint to be called with the components comprised as elements of an array
 * @param object params - An optional argument to pass in parameters as part of the call. Pass false if you want to use no params but specify async
 * @param boolean async - An optional argument for whether or not the call should be asynchronous
 */
stormAPI.prototype.apiCall = function (method, params, async) {
	/*
	 * Build the endpoint URI
	 */
	this.callParams.url = this.systemURI + '/' + method.join('/');

	/*
	 * Inject params if passed in. Clean out if not.
	 */
	if (params) {
		this.callParams.data = JSON.stringify({params: params});
	} else {
		delete this.callParams.data;
	}

	/*
	 * Should the call be asynchronous? Default to true if not specified.
	 */
	if (async === undefined) {
		this.callParams.async = true;
	} else {
		this.callParams.async = async;
	}

	/*
	 * Make the call and return the jqXHR object
	 */
	this.lastXHR = $.ajax(this.callParams);
	return this.lastXHR;
};
