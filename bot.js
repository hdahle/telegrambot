/*
 * Telegram BOT experiments using 'telegraf'
 * https://github.com/telegraf/telegraf
 *
 * H. Dahle, 2020
 */

// We need moment for date-math
var moment = require('moment');

// Parse command line, get the Telegram API Key
var argv = require('minimist')(process.argv.slice(2));
let apiKey = argv.apikey;
if (!apiKey) {
  console.log('Usage: tbot --apikey <telegram api key>');
  return;
}
const { Telegraf } = require('telegraf');
const bot = new Telegraf(apiKey);

var fetch = require('node-fetch');

bot.start((ctx) => ctx.reply('Welcome ' + ctx.update.message.from.first_name + '!'));

bot.help((ctx) => ctx.reply(
  'Hi! These are some commands you can try:\n' +
  '/help - this help\n' +
  '/co2 - get the current CO2 levels\n' +
  '/renewables - latest information on renewable energy sources'
));

bot.on('sticker', (ctx) => ctx.reply('Nice sticker 👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.hears('renewable', (ctx) => ctx.replyWithPhoto({ source: 'img/irena-cost-of-renewables-canvas-png.png' }));
bot.hears('emissions', (ctx) => ctx.replyWithPhoto({ source: 'img/oxfam-2020-canvas-png.png' }));
bot.hears('wri', (ctx) => ctx.replyWithPhoto({ source: 'img/wri-emissions-2016-canvas-png.png' }));
bot.hears('corona', (ctx) => ctx.replyWithMediaGroup([
  {
    media: { source: 'img/corona-deaths-per-capita-canvas-png.png' },
    caption: "Deaths per capita per region",
    type: 'photo'
  },
  {
    media: { source: 'img/corona-deaths-top-20-canvas-png.png' },
    caption: "Countries with highest fatality rates",
    type: 'photo'
  }
]));

bot.hears('co2', (ctx) => {
  let firstname = ctx.update.message.from.first_name;
  console.log(ctx.update.message.from.first_name);
  ctx.reply(firstname + ', please wait while I get the latest CO2 measurements for you');
  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      console.log(response)
      return Promise.reject(new Error(response.statusText))
    }
  }
  function json(response) {
    return response.json()
  }
  fetch("https://api.dashboard.eco/maunaloaco2-daily")
    .then(status)
    .then(json)
    .then(results => {
      console.log(results);
      let d = results.data.pop();
      let daysago = Math.trunc(moment.duration(moment().diff(moment(d.date))).as('days'));
      ctx.reply(
        'The atmospheric CO2 level is ' + d.value + 'ppm measured ' + daysago + ' days ago.\n' +
        'This is ' + d.change1yr + '% higher than a year ago, and ' + d.change10yr + '% higher than 10 years ago 🤔\n' +
        'CO2 levels were between 180-280ppm for hundreds of thousands of years until the beginning of the industrial age.'
      );
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})

bot.launch();
