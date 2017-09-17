/**
 * Team: grinddontstop
 * Date: 9/17/17
 * Twitter bot that checks latest tweet with homedepot keyword and addresses it accordingly
 */
console.log('starting orangebot...\n');

//stores JSON tweet post
var tweet

//remembers last checked post
var lastCheckedId = 0;

//Twitter API
var Twit = require('twit');

//configuration for bot account
var config = require('./config');

//configuration for IBM tone analysis API
var analyzer = require('./analyzer');

//IBM tone analysis API
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

//creates instance of tone analysis
var toneAnalyzer = new ToneAnalyzerV3(analyzer);

//email API
var nodemailer = require('nodemailer');

//creates instances of Twitter API with account configurations
var T = new Twit(config);

/**
 * Reports negative post to attendant's email address
 * @param {Object} tw JSON tweet post
 */
function report(tw) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
           user: 'thdgds@gmail.com',
           pass: '1234567890thd'
        }
        });
        
        var mailOptions = {
        from: 'thdgds@gmail.com',
        to: 'thdgds.attendant@gmail.com',
        subject: 'Suspected Cusomer Dissatisfaction',
        text: "twitter.com/" + tw.user.screen_name + "/status/" + tw.id_str + "\n" + tw.text + "\n" + JSON.stringify(tw.user)
        };
        
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
           console.log(error);
        } else {
           console.log('Email sent: ' + info.response);
        }
    });
}

/**
 * Responds to positive comment by prompting tweeter to leave a review
 * @param {Object} tw JSON tweet post
 */
function askReview(tw) {
    T.post('statuses/update', { status: '@' + tw.user.screen_name + ' we appreciate your feedback. Would you consider leaving a review at http://www.homedepot.com/?' }, postData);
}

/**
 * Performs operations on analyzed tone and decides what to do accordingly
 * @param {Object} err 
 * @param {Object} tone 
 */
function analyze(err, tone) {
    if (err){
        console.log(err);
    } else if (tweet == null) {
        console.log('undefined tweet');
    } else {
        var filteredData = tone['document_tone']['tone_categories'][0]['tones'];
        var badAverage = 0;
        var goodAverage = 0;
        for(var i=0; i<filteredData.length; i++) {
            var id = filteredData[i]['tone_id'];
            var score = filteredData[i]['score'];
            switch(id) {
                case 'anger':
                    badAverage += 10 * score;
                    break;
                case 'disgust':
                    badAverage += 3 * score;
                    break;
                case 'fear':
                    badAverage += score;
                    break;
                case 'joy':
                    goodAverage += score;
                    break;
                case 'sadness':
                    badAverage += score;
                    break;
                default:
                    break;
            }
        }
        badAverage = badAverage / 15;
        console.log("Negativity Index: " + badAverage + ", " + "Positivity Index: " + goodAverage)
        if (badAverage > 0.25) {
            report(tweet);
        } else if (goodAverage > 0.5) {
            askReview(tweet);
        }
    }
}

/**
 * Defines procedure for handling data after posting
 * @param {Object} err 
 * @param {Object} data 
 * @param {Object} response 
 */
function postData(err, data, response) {
   if(err) {
       console.log(err);
   } else {
       console.log("Post Sent!");
   }
}

/**
 * Gets latest tweet data and passes it into functions that analyze it
 * @param {Object} err 
 * @param {Object} data 
 * @param {Object} response 
 */
function gotData(err, data, response) {
    if (data != null && data.statuses != null) {
        tweet = data.statuses[data.statuses.length - 1];
    }
    if (tweet != null && tweet.id != lastCheckedId) {
        console.log(tweet.text);
        toneAnalyzer.tone({ text: tweet.text }, analyze);
        lastCheckedId = tweet.id;
    }
}

/**
 * Wrapper function for get
 */
function run() {
    T.get('search/tweets', {q: 'homedepot', count: 1}, gotData);
}

//Repeat searching every 30 seconds
var mainProcess = setInterval(run, 30000)
