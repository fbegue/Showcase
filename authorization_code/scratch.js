// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
var request = require('request');

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
	},
	handle(handlerInput) {
		const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';
		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};

const options = {
	url: 'https://api.spotify.com/v1/me/player/currently-playing',
	headers: {
		"Accept": "application/json",
		"Content-Type": "application/json",
		"Authorization":"Bearer BQCp_1bVgy7O5AMQr8XRXmAl_qgOcPa6BhmYasPzSq8IWBStcH8GatqcsvCuuMfA3z-n5mNOvGIkfi2HGJUeRuV9yalKpTKCMuXttZHM2de_ZVNOyYPnKEOk2gmBvJGArvaMcy68GCog2AU3pGZLyiYjVXWMsuQgXOGkVifC6liwIK4_ZIgsREb05NsyVTP648tphN3GKRBGxmwNRfeaSIgUmrU9zM9h8pfJh_gKG0f6mq8LcCarUgWag3tvKqQO570eWll71o4I5x2M_fszntyao2E"
	}
};

var get = function(){
	request.get(options, function (error, response, body) {
			return "test"
		}
	);
}



const HelloWorldIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
	},
	handle(handlerInput) {

		var t =  function(){
			return new Promise(function(done, fail) {
				// 			setTimeout(function(){
				//                 done("testProm")
				//             },3000)

				request.get(options, function (error, response, body) {

						//"https://api.spotify.com/v1/me/tracks?ids=0FhBANnxcQBgD3tQ75WFAn"
						var options2 = {
							url: 'https://api.spotify.com/v1/me/tracks?ids=' + body.item.id,
							headers: {
								"Accept": "application/json",
								"Content-Type": "application/json",
								"Authorization":"Bearer BQCp_1bVgy7O5AMQr8XRXmAl_qgOcPa6BhmYasPzSq8IWBStcH8GatqcsvCuuMfA3z-n5mNOvGIkfi2HGJUeRuV9yalKpTKCMuXttZHM2de_ZVNOyYPnKEOk2gmBvJGArvaMcy68GCog2AU3pGZLyiYjVXWMsuQgXOGkVifC6liwIK4_ZIgsREb05NsyVTP648tphN3GKRBGxmwNRfeaSIgUmrU9zM9h8pfJh_gKG0f6mq8LcCarUgWag3tvKqQO570eWll71o4I5x2M_fszntyao2E"
							}
						};

						request.put(options2, function (error, response, body) {
							done(body)

						})

					}
				);

			})
		}

		const speakOutput = 'Hello World!';
		var retSpeak = function(){
			// setTimeout(function(){
			//     return "Success"
			// },3000)
			return "Success";
		};

		//  const speakOutput = res;

		// return handlerInput.responseBuilder
		//     .speak(speakOutput)
		//     //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
		//     .getResponse();
		// })


		return t().then(function(res){
			return handlerInput.responseBuilder
			// .speak(speakOutput)
				.speak(res)
				// .speak(post())
				//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
				.getResponse();
		})

		// return handlerInput.responseBuilder
		//     .speak(speakOutput)
		//     .getResponse();


	}



};
const HelpIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speakOutput = 'You can say hello to me! How can I help?';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};
const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
				|| Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speakOutput = 'Goodbye!';
		return handlerInput.responseBuilder
			.speak(speakOutput)
			.getResponse();
	}
};
const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		// Any cleanup logic goes here.
		return handlerInput.responseBuilder.getResponse();
	}
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
	},
	handle(handlerInput) {
		const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
		const speakOutput = `You just triggered ${intentName}`;

		return handlerInput.responseBuilder
			.speak(speakOutput)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`~~~~ Error handled: ${error.stack}`);
		const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
	.addRequestHandlers(
		LaunchRequestHandler,
		HelloWorldIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler,
		IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
	)
	.addErrorHandlers(
		ErrorHandler,
	)
	.lambda();
