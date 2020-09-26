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
const fetch = require('node-fetch');

function startAndHelp(ctx) {
  ctx.reply('Hi ' + ctx.update.message.from.first_name + '!');
  setTimeout(function () {
    ctx.reply('Here are some commands you can try:\n' +
      '/start - this help\n\n' +
      '⚰️ /corona - Worldwide and country-specific data\n' +
      '📈 /co2 - current and historical CO2 levels\n' +
      '☀️ /renewables - solar, wind, etc\n' +
      '🏭 /emissions - greenhouse gas emissions\n' +
      '🛢️ /fossil - oil, gas, coal statistics\n' +
      '⚡ /electricity - global electricity production\n' +
      '🌊 /sealevel - global sea level rise\n' +
      '🌡️ /temperature - global warming'
    )
  }, 1000)
  setTimeout(function () {
    ctx.replyWithMarkdown('You can also just type one of the keywords above - try typing in `co2` or `fossil` and see what happens. ' +
      'Just type `help` if you get stuck'
    )
  }, 2000)
}

//
// Start - welcome message
//
bot.start((ctx) => { startAndHelp(ctx) });
bot.hears(/(start)|(help)/i, (ctx) => { startAndHelp(ctx) })



//
// Temperature - Global warming
//
bot.hears(/(temp)|(warming)|(global warming)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/plotGlobalTemp.png' },
    Extra.caption('This chart includes three datasets, all indicating global warming:' +
      '*NASA GISTEMPv4* - shows *1 degree C* increase since 1951-1980\n' +
      '*HadCRUT4* - shows the same trend\n' +
      '*UAH Alabama* - uses a different reference but the trend is clear'
    ).markdown()
  );
  setTimeout(function () {
    ctx.reply('Global warming is more serious in the polar regions. We have a chart on warming in the Arctic - click the button if you are interested',
      Markup.inlineKeyboard([
        Markup.callbackButton('Warming in the Arctic', 'svalbard'),
      ]).extra()
    )
  }, 3000);
});
bot.action('svalbard', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotSvalbardTemp.png' },
    Extra.caption('Data from The Norwegian Meteorological Institute and The Norwegian Centre for Climate Services indicate that temperatures in the Arctic, as measured at Svalbard Airport (78.24 degrees North), are now at least *5°C* higher than 50-100 years ago.').markdown());
})

//
// Renewables
//
bot.hears(/renewab/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.reply('Available charts 📈 on renewable energy:',
    Markup.inlineKeyboard([
      Markup.callbackButton('Cost of renewable power', 'irena'),
      Markup.callbackButton('Cost of electricity generation', 'eialcoe'),
    ]).extra()
  )
});
bot.action('irena', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/irena-cost-of-renewables.png' },
    Extra.caption('IRENA reports a clear trend in total cost of ⚡ electricity for renewable power generation: ' +
      'New solar and wind power plants are now less expensive than most coal-fired plants. ' +
      'Since 2010, the *cost of solar power has decreased by 82%*. ' +
      'The grey band in the chart represents the range of costs for fossil fuel based plants.').markdown());
})
bot.action('eialcoe', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/eia-cost-of-electricity.png' },
    Extra.caption('US Energy Information Administration has estimated the cost of electricity generation for new plants coming online in the United States in 2025. ' +
      '*Photovoltaic solar plants will be the least expensive*, with roughly the same costs as geothermal, combined cycle natural gas, and onshore wind turbines. ' +
      'Surprisingly, coal-fired plants will remain an expensive option.').markdown());
})

//
// Emissions
//
bot.hears(/emissi/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithMarkdown('The annual greenhouse gas emissions are now above *50 billion tons* CO2 equivalents per year. That is equivalent to almost 7 tons of CO2 per person on the planet');
  ctx.replyWithPhoto({ source: 'img/wri-emissions-2016.png' })
  setTimeout(function () {
    ctx.reply('Other 📈 charts you might like:',
      Markup.inlineKeyboard([
        [
          Markup.callbackButton('By Income Group', 'oxfam'),
          Markup.callbackButton('Norway', 'emissionsnorway'),
          Markup.callbackButton('By Fuel Type', 'emissionsbyfueltype')
        ], [
          Markup.callbackButton('By Region', 'emissionsbyregion'),
          Markup.callbackButton('CO2 vs GDP', 'co2vsgdp')
        ]
      ]).extra()
    )
  }, 3000);
});
bot.action('oxfam', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/oxfam-2020.png' })
})
bot.action('co2vsgdp', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/co2-vs-gdp.png' })
})
bot.action('emissionsbyregion', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsByRegion.png' },
    Extra.caption('Emissions in Europe and North America are declining. Asia is driving the growth. ' +
      'Asian countries have lower emissions per capita than Western countries, ' +
      'emissions will increase as more people move towards a higher standard of living')
  )
})

//
// Electricity
//
bot.hears(/electr/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/plotEiaEl.png' },
    Extra.caption('The growth in electricity production is mainly in China. Figures are in 1000 TWh (terawatt hours)')
  )
  setTimeout(function () {
    ctx.replyWithMarkdown('We also have some charts on the *cost* of electricity production, try clicking one of these:',
      Markup.inlineKeyboard([
        Markup.callbackButton('Cost of renewable power', 'irena'),
        Markup.callbackButton('Cost of electricity generation', 'eialcoe'),
      ]).extra()
    )
  }, 3000)
})

//
// Fossil fuels - Respond with text and button for charts
//
bot.hears(/(fossil)|(coal)|(oil)|(gas)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.reply('We have a few charts on fossil fuels, try one of these',
    Markup.inlineKeyboard([
      [
        Markup.callbackButton('Oil production', 'eiaoil'),
        Markup.callbackButton('Gas production', 'eiagas'),
        Markup.callbackButton('Coal production', 'eiacoal')
      ], [
        Markup.callbackButton('Emissions Norway', 'emissionsnorway'),
        Markup.callbackButton('Emissions by Fuel Type', 'emissionsbyfueltype'),
        Markup.callbackButton('Emissions by Region', 'emissionsbyregion')
      ]
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
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsByFuelType.png' },
    Extra.caption('Coal is still the biggest source of CO2 emissions, but gas is growing faster'))
})
bot.action('emissionsnorway', (ctx) => {
  return ctx.replyWithPhoto(
    { source: 'img/plotEmissionsNorway.png' },
    Extra.caption('Annual GHG emissions in Norway since 1990')
  )
})

//
// Corona country
//
bot.hears(/corona (.+)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Match:', ctx.match[1]);
  let country = ctx.match[1].toLowerCase();
  let fn = 'ch1.png';
  switch (country) {
    case 'world': break;
    case 'uk': fn = 'ch2.png'; break;
    case 'united kingdom': fn = 'ch2.png'; break;
    case 'us': fn = 'ch3.png'; break;
    case 'united states': fn = 'ch3.png'; break;
    case 'sweden': fn = 'ch4.png'; break;
    case 'spain': fn = 'ch5.png'; break;
    case 'peru': fn = 'ch6.png'; break;
    case 'norway': fn = 'ch7.png'; break;
    case 'italy': fn = 'ch8.png'; break;
    case 'france': fn = 'ch9.png'; break;
    default: fn = 'ch1.png'; country = 'the world'; break;
  }
  ctx.replyWithPhoto({ source: 'img/' + fn },
    Extra.caption('⚰️ Number of deaths in ' + country)
  );
})


bot.hears(/(corona)|(covid)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/ch1.png' },
    Extra.caption('⚰️ Number of deaths per day, worldwide')
  );
  setTimeout(function () {
    ctx.reply('Other related data:',
      Markup.inlineKeyboard([
        Markup.callbackButton('⚰️ Deaths, Top 20 Countries', 'corona-deaths-top-20')
      ]).extra()
    )
  }, 2000);
  setTimeout(function () {
    ctx.replyWithMarkdown('Hint: You can also type `corona spain` or `corona us` ... and so on')
  }, 4000);
})
bot.action('corona-deaths-top-20', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/corona-deaths-top-20.png' })
})

function replyCo210(ctx) {
  return ctx.replyWithPhoto({ source: 'img/co2-annual.png' },
    Extra.caption('The chart uses data from *NOAA ESRL Global Monitoring Division* and shows the atmospheric CO2 levels for each of the last 10 years. ' +
      'There is a consistent increase in CO2 of about *0.5 - 0.6% per year*. ' +
      '\nIn 2020 the atmospheric CO2 levels are higher than ever before, as indicated by the upper line in the chart. ' +
      'This chart is updated daily based on measurements from the Mauna Loa Observatory').markdown()
  )
}
function replyCo22000(ctx) {
  return ctx.replyWithPhoto({ source: 'img/plotLawDome.png' },
    Extra.caption('Atmospheric CO2 levels were quite stable for about 2000 years - until the start of the *Industrial Revolution*').markdown()
  )
}
function replyCo2500K(ctx) {
  return ctx.replyWithPhoto({ source: 'img/plotVostok.png' },
    Extra.caption('Ice-cores drilled in Antarctica contain trapped air bubbles going back several hundred thousand years. ' +
      'Homo Sapiens has been around for about 200.000 years. ' +
      'Atmospheric *CO2 levels were about 180-280ppm* during this time - until the Industrial Revolution ' +
      'when mankind started burning coal and releasing CO2 into the atmosphere').markdown()
  )
}

//
// CO2 - Respond with text and buttons for three images
//
bot.hears(/co2[ ]+([0-9]+)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Match:', ctx.match[1]);
  switch (parseInt(ctx.match[1], 10)) {
    case 10: return replyCo210(ctx); break;
    case 2000: return replyCo22000(ctx); break;
    case 500000: return replyCo2500K(ctx); break;
    default:
  }
  return ctx.reply('I am not sure what you are asking...😕')
});

bot.hears(/co2/i, (ctx) => {
  let firstname = ctx.update.message.from.first_name;
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.reply(firstname + ', please wait while we get the latest CO2 measurements from NOAA Earth Systems Research Lab in Hawaii');
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
      //console.log(results);
      let d = results.data.pop();
      let days = Math.trunc(moment.duration(moment().diff(moment(d.date))).as('days'));
      let s = (days == 1) ? 'yesterday\n' : days + ' days ago\n'
      ctx.replyWithMarkdown('The atmospheric CO2 level is *' + Math.trunc(d.value) + 'ppm* measured ' + s +
        'This is ' + d.change1yr + '% higher than a year ago, and ' + d.change10yr + '% higher than 10 years ago 🤔\n');
      // Wait a bit before sending more info
      setTimeout(function () {
        ctx.reply('We have a few charts that illustrate the CO2 level over time - have a look!',
          Markup.inlineKeyboard([
            Markup.callbackButton('📈 10 years', 'co2last10'),
            Markup.callbackButton('📈 2000 years', 'co2last2000'),
            Markup.callbackButton('📈 500.000 years', 'co2last5M')
          ]).extra()
        )
      }, 3000);
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})
bot.action('co2last10', (ctx) => {
  return replyCo210(ctx);
})
bot.action('co2last2000', (ctx) => {
  return replyCo22000(ctx)
})
bot.action('co2last5M', (ctx) => {
  return replyCo2500K(ctx);
})

//
// Sealevel - Respond with text and button for chart
//
bot.hears(/sea[ ]*l/i, (ctx) => {
  let firstname = ctx.update.message.from.first_name;
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
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
      let days = moment.duration(moment(latest.t).diff(moment(first.t))).as('days');
      let perDecade = Math.trunc(10 * 365 * (latest.y - first.y) / days);
      let caption = 'The latest data is from ' + moment(latest.t).format('MMMM D') +
        ' and shows that global sea level has increased by *' + (latest.y - first.y) +
        'mm* since ' + moment(first.t).format('MMMM D, YYYY') + '. This is about *' +
        perDecade + 'mm* per decade';
      ctx.replyWithPhoto({ source: 'img/plotSeaLevel.png' }, Extra.caption(caption).markdown());
    })
    .catch(err => {
      ctx.reply('Something went wrong, no measurements available right now 😬')
      console.log('Error', err)
    })
})
bot.action('sealevel', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotSeaLevel.png' }, Extra.caption(''))
})

//
// Catch all for actions we don't know how to handle
//
bot.action(/.+/, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Unresolved');
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! I don't know how to respond to that`)
})

// Do it
bot.launch();
