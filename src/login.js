import Amplify, { Auth } from 'aws-amplify';
import axios from 'axios';
import awsconfig from './aws-exports';

// Amplify get it's configuration from the js file in 
// thie directory, it sets up things like the region
// content bucket, cloudfront url, ddb table, and
// cognito credentials
//

Amplify.configure(awsconfig);

console.log(Auth);

// This function can be called to add a new user
// part of the signUp flow involves the user verification bits too.
//
// We are using async functions so we need to have this declared as async
// at the top level.
async function signUp(username,password,email,phone_number) {
	try {
		let user = await Auth.signUp({
			username: username, 
			password: password, 
			attributes: { 
				email: email, 
				phone_number: phone_number 
			}
		});
		console.log(user);
		document.getElementById('user').innerHTML = JSON.stringify(user,null,2);
	} catch (E) {
		console.log(E);	
	}
}

// If you decide to implement the MFA support
// you can submit the code via this function
// so signIn -> MFA challenge -> confirmSignUp

async function confirmSignUp(username, code) {
	try {
		await Auth.confirmSignUp(username, code);
	} catch (E)  {
		console.log(E);	
	}
}

async function signIn(username,password) {
	try {
		let user = await Auth.signIn(username,password);
		console.log(user)
		document.getElementById('user').innerHTML = JSON.stringify(user,null,2);
		// If this is the first time we a signing in we need to change the password
    	if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
			// these are the required attributes, supplying them again is optional
        		const { requiredAttributes } = user.challengeParam; 
			// we will cheat and just set it to the one we used :)
			// the object would contain the req attributes	
        		Auth.completeNewPassword(user,password, {}); 
		} 

		let token = "";
		for(var i = 0; i<localStorage.length; i++){
			const ithKey = localStorage.key(i);
			if(ithKey.endsWith('accessToken')){
				token = localStorage.getItem(ithKey);
				break;
			}
		}

		let instance = axios.create({
			baseURL: 'https://flask-service.8e8rajss1pgl4.eu-west-1.cs.amazonlightsail.com',
			headers: {
				Accept: "application/json",
    			"Content-Type": "application/json;charset=UTF-8",
    			"Cache-Control": "no-store",
				Authorization: `Basic ${token}`
			}
		});

		Auth.currentCredentials().then(user => {
			instance.post('/api/user/attachpolicy', {Principal: user.identityId})
			.then((res) => {
				console.log('attach policy success: ', res);
				// eslint-disable-next-line no-restricted-globals
				location.href = "/";
			})
			.catch(err => { 
				console.log('attach policy failure: ', err);
				// eslint-disable-next-line no-restricted-globals
				location.href = "/";
			});
		});
		// eslint-disable-next-line no-restricted-globals
		// location.href = "/";
	} catch (E) {
		console.log(E);	
	}
}

async function resendConfirmationCode(username) {
    try {
        await Auth.resendSignUp(username);
        console.log('code resent successfully');
    } catch (E) {
        console.log(E);
    }
}

async function changePassword(user) {
	try {
		return Auth.changePassword(user, 'oldPassword', 'newPassword');
	} catch (E) {
        	console.log(E);
	}
}

if (document.getElementById('signin')) {
	document.getElementById('signin').addEventListener('click', () => {
		var username = document.getElementById('username').value;
		var password = document.getElementById('password').value;
		console.log(username,password);
		if (username && password) {
			signIn(username,password);	
		}
	})
}
else 
	if (document.getElementById('signup')) {
		document.getElementById('signup').addEventListener('click', () => {
			var username = document.getElementById('username').value;
			var password = document.getElementById('password').value;
			var email = document.getElementById('email').value;
			var phone_number = document.getElementById('phone_number').value;
			console.log(username,password,email,phone_number);
			if (username && password,email,phone_number) {
				signUp(username,password,email,phone_number);	
			}
		})
	}