/*
 * Telegram BOT experiments using 'telegraf'
 * https://github.com/telegraf/telegraf
 *
 * H. Dahle, 2020
 */


// Parse command line, get the Telegram API Key
var argv = require('minimist')(process.argv.slice(2));
let apiKey = argv.apikey; // filename from cmd line
if (!apiKey) {
  console.log('Usage: tbot --apikey <telegram api key>');
  return;
}
const { Telegraf } = require('telegraf')
const bot = new Telegraf(apiKey);

var fetch = require('node-fetch')

bot.start((ctx) => ctx.reply('Welcome ' + ctx.update.message.from.first_name + '!'))

bot.help((ctx) => ctx.reply(
  'Hi! These are some commands you can try:\n' +
  '/help - this help\n' +
  '/co2 - get the current CO2 levels\n' +
  '/renewables - latest information on renewable energy sources'
));

bot.on('sticker', (ctx) => ctx.reply('Nice sticker 👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

bot.hears('renewable', (ctx) => ctx.replyWithPhoto({ source: 'img/ig-irena-2020.png' }))
bot.hears('emissions', (ctx) => ctx.replyWithPhoto({ source: 'img/ig-oxfam-1080x1080.png' }))
bot.hears('wri', (ctx) => ctx.replyWithPhoto({ source: 'img/ig-wri-1080x1080.png' }))

bot.hears('co2', (ctx) => {
  let firstname = ctx.update.message.from.first_name
  console.log(ctx.update.message.from.first_name)
  ctx.reply(firstname + ', please wait while I get the latest CO2 measurements for you')
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
      console.log(results)
      let d = results.data.pop();
      let y1 = (d.value - d.valueLastYear) / d.valueLastYear * 100
      y1 = Math.trunc(y1 * 100) / 100
      let y10 = (d.value - d.value10yrsAgo) / d.value10yrsAgo * 100
      y10 = Math.trunc(y10 * 100) / 100
      ctx.reply(
        'Atmospheric CO2: ' + d.value + 'ppm (measured at ' + d.date + '). ' +
        'This is ' + y1 + '% higher than a year ago, and ' + y10 + '% higher than 10 years ago 🤔')
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})

bot.launch()
