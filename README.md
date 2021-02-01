# telegrambot
A naive Bot for Telegram using the Telegraf bot framework.

## Pre-requisites
An API key is required. Ask the 'botfather' for one. I use two keys, one for testing and one for production.

## Launch bot
````
node bot.js -apikey telegramapikey
````
Reminder to self: I store the API key in a file ````apikey.text```` which is listed in ````.gitignore```` :
````
node bot.js -apikey `cat apikey.txt`
````
Running the bot under PM2 is the better approach:
````
pm2 start bot.js -- --apikey `cat apikey.txt`
````
Note: Everything before '--' is for PM2, everything after '--' is for bot.js
## Images/Charts displayed by the bot
All the charts are from my `futureplanet.eco` site which uses chart.js to create charts. In order to save charts as PNGs, I use Puppeteer to scrape the site and save the images to the IMG folder. The code for scraping is in my `headless` repo.
https://github.com/hdahle/headless

## The Telegraf bot framework
https://github.com/telegraf/telegraf
