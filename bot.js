/*
 * Telegram BOT experiments using 'telegraf'
 * https://github.com/telegraf/telegraf
 *
 * H. Dahle, 2020
 */

// We need moment for date-math
var moment = require('moment');
var fs = require('fs');

// Parse command line, get the Telegram API Key
var argv = require('minimist')(process.argv.slice(2));
let apiKey = argv.apikey;
if (!apiKey) {
  console.log('Usage: tbot --apikey <telegram api key>');
  return;
}

// List of available PNGs
fs.readdir('img', function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function (file) {
    console.log(file);
  });
});


const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(apiKey);
var fetch = require('node-fetch');

//
// Start - welcome message
//
bot.start((ctx) => {
  ctx.reply('Hi ' + ctx.update.message.from.first_name + '!');
  ctx.reply('Here are some commands you can try:\n' +
    '/start - this help\n' +
    '/co2 - current and historical CO2 levels\n' +
    '/renewables - solar, wind, etc\n' +
    '/emissions - greenhouse gas emissions' +
    '/fossil - oil, gas, coal statistics\n' +
    '/sealevel - global sea level rise\n' +
    'Click on any of these, or just type in the command word without the leading \'\/\''
  )
});

//
// Renewables
//
bot.hears(/[Rr]enewable/, (ctx) => {
  ctx.reply('Available charts on renewable energy:',
    Markup.inlineKeyboard([
      Markup.callbackButton('Cost of renewable power', 'irena'),
      Markup.callbackButton('Cost of electricity generation', 'eialcoe'),
    ]).extra()
  )
});
bot.action('irena', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/irena-cost-of-renewables.png' })
})
bot.action('eialcoe', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/eia-cost-of-electricity.png' })
})

//
// Emissions
//
bot.hears(/[Ee]mission/, (ctx) => {
  ctx.reply('The annual greenhouse gas emissions are now above 50 billion tons CO2 equivalents per year. That is equivalent to almost 7 tons of CO2 per person on the planet');
  ctx.replyWithPhoto({ source: 'img/wri-emissions-2016.png' })
  ctx.reply('Other statistics',
    Markup.inlineKeyboard([
      Markup.callbackButton('By Income Group', 'oxfam'),
      Markup.callbackButton('Norway', 'emissionsnorway'),
      Markup.callbackButton('By Fuel Type', 'emissionsbyfueltype'),
      Markup.callbackButton('By Region', 'emissionsbyregion'),
      Markup.callbackButton('CO2 vs GDP', 'co2vsgdp')
    ]).extra()
  )
});
bot.action('irena', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/irena-cost-of-renewables.png' })
})
bot.action('oxfam', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/oxfam-2020.png' })
})
bot.action('co2vsgdp', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/co2-vs-gdp.png' })
})
bot.action('emissionsbyregion', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsByRegion.png' })
})
//
// Fossil fuels - Respond with text and button for charts
//
bot.hears(/[Ff]ossil/, (ctx) => {
  ctx.reply('We have a few charts on fossil fuels, try one of these',
    Markup.inlineKeyboard([
      Markup.callbackButton('Oil production', 'eiaoil'),
      Markup.callbackButton('Gas production', 'eiagas'),
      Markup.callbackButton('Coal production', 'eiacoal'),
      Markup.callbackButton('Emissions Norway', 'emissionsnorway'),
      Markup.callbackButton('Emissions by Fuel Type', 'emissionsbyfueltype')
    ]).extra()
  )
})
bot.action('eiaoil', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaOil.png' })
})
bot.action('eiagas', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaGas.png' })
})
bot.action('eiacoal', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaCoal.png' })
})
bot.action('eiael', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaEl.png' })
})
bot.action('emissionsbyfueltype', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsByFuelType.png' })
})
bot.action('emissionsnorway', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsNorway.png' })
})

//
// Fossil fuels - Respond with text and button for charts
//
bot.hears(/[Cc]orona/, (ctx) => {
  ctx.reply('Number of deaths per day, worldwide:');
  ctx.replyWithPhoto({ source: 'img/ch1.png' })
  ctx.reply('Other Corona data:',
    Markup.inlineKeyboard([
      Markup.callbackButton('Deaths, Top 20', 'corona-deaths-top-20')
    ]).extra()
  )
})
bot.action('corona-deaths-top-20', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/corona-deaths-top-20.png' })
})

//
// CO2 - Respond with text and buttons for three images
//
bot.hears(/[Cc][Oo]2/, (ctx) => {
  let firstname = ctx.update.message.from.first_name;
  console.log(ctx.update.message.from.first_name);
  ctx.reply(firstname + ', please wait while I get the latest CO2 measurements from NOAA Earth Systems Research Lab in Hawaii');
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
      let days = Math.trunc(moment.duration(moment().diff(moment(d.date))).as('days'));
      let s = (days == 1) ? yesterday : days + ' days ago\n'
      ctx.reply('The atmospheric CO2 level is ' + d.value + 'ppm measured ' + s +
        'This is ' + d.change1yr + '% higher than a year ago, and ' + d.change10yr + '% higher than 10 years ago 🤔\n');
      ctx.reply('We have a few charts that illustrate the CO2 level over time - have a look!',
        Markup.inlineKeyboard([
          Markup.callbackButton('Last 10 years', 'co2last10'),
          Markup.callbackButton('Last 2000 years', 'co2last2000'),
          Markup.callbackButton('Last half million years', 'co2last5M')
        ]).extra()
      )
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})
bot.action('co2last10', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/co2-annual.png' })
})
bot.action('co2last2000', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotLawDome.png' })
})
bot.action('co2last5M', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotVostok.png' })
})

//
// Sealevel - Respond with text and button for chart
//
bot.hears(/[Ss]ea[ ]*level/, (ctx) => {
  let firstname = ctx.update.message.from.first_name;
  console.log(ctx.update.message.from.first_name);
  ctx.reply(firstname + ', please wait while I get the latest sea level measurements from CSIRO in Australia');
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
  fetch("https://api.dashboard.eco/CSIRO_Alt")
    .then(status)
    .then(json)
    .then(results => {
      let latest = results.data.pop();
      let first = results.data.shift();
      ctx.reply('The latest data is from ' + moment(latest.t).format('MMMM D') +
        ' and shows that global sea level has increased by ' + (latest.y - first.y) + 'mm since ' + moment(first.t).format('MMMM D, YYYY'));
      ctx.reply('We also have a chart that shows the sea level rise since 1880',
        Markup.inlineKeyboard([
          Markup.callbackButton('Sea level rise since 1880', 'sealevel')
        ]).extra()
      )
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})
bot.action('sealevel', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotSeaLevel.png' })
})

//
// Catch all for actions we don't know how to handle
//
bot.action(/.+/, (ctx) => {
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! I don't know how to respond to that`)
})

// Do it
bot.launch();
