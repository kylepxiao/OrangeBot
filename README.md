# Orange Bot
A node.js bot that monitors Twitter for negative/positive Home Depot experiences using the "Twit" Twitter API.
The IBM Watson Tone Analyzer was implemented to determine whether the tweet had a negative or positive feedback and then used the nodemailer API to send a report to a Home Depot attendant so they can contact the customer.<br/>

# Dependencies
"Twit" Twitter API<br/>
IBM Watson Tone Analyzer<br/> 
Nodemailer API<br/>
Twitter account<br/>
Two email accounts (one for the bot, one for the Home Depot attendant)