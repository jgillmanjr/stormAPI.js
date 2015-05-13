/*
 * stormAPI.js
 */

var stormAPI = function (userName, password, apiVersion, baseURI) {
	this.userName = userName;
	this.password = password;

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
		},
		async: false // This will change once credentials are verified
	};

	/*
	 * Verify the credentials and get the token. Also set async to true.
	 */
	this.checkAuthResult = this.checkAuth();
	if (!this.checkAuthResult.status) {
		console.log(this.checkAuthResult.message);
	}
};

stormAPI.prototype.checkAuth = function () {
	this.lastXHR = this.apiCall(['account','auth','token']);

	var success = {status: false, message: ''}; // Return whether the auth worked or not

	if (this.lastXHR.status == 200) {
		this.password = this.lastXHR.responseJSON.token;
		success.status = true;
		success.message = 'Credentials Correct';
	} else if (this.lastXHR.status == 401) {
		success.message = 'Invalid Credentials';
	} else {
		success.message = 'An HTTP code of ' + this.lastXHR.status + ' was returned.';
	}

	return success;
};

stormAPI.prototype.apiCall = function (method, params) {
	/*
	 * Build the endpoint URI
	 */
	this.callParams.url = this.systemURI + '/' + method.join('/');

	/*
	 * Inject params if passed in
	 */
	if (params) {
		this.callParams.data = JSON.stringify({params: params});
	}

	/*
	 * Make the call and return the jqXHR object (Keep in mind, this is deferred)
	 */
	this.lastXHR = $.ajax(this.callParams);
	return this.lastXHR;
};
