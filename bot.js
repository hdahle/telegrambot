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
//const { count } = require('console');


bot.catch((err, ctx) => {
  console.log('Bot Error ' + ctx.updateType
    + '\n  Error code:' + err.code
    + '\n  Error descr:' + err.description)
});

function startAndHelp(ctx) {
  ctx.reply('Hi ' + ctx.update.message.from.first_name + '!');
  setTimeout(function () {
    ctx.reply('Here are some commands you can try:\n\n' +
      '⚰️ /corona - cases and deaths\n' +
      '📈 /co2 - atmospheric CO2 levels\n' +
      '☀️ /renewables - solar, wind, etc\n' +
      '🏭 /emissions - greenhouse gases\n' +
      '🛢️ /fossil - oil, gas, coal \n' +
      '⚡ /electricity - global production\n' +
      '🌊 /sealevel - sea level rise\n' +
      '🌡️ /temperature - global warming\n' +
      '🧊 /ice - ice melting \n'
    )
  }, 1000)
  setTimeout(function () {
    ctx.replyWithMarkdown('Try typing in `co2` or `fossil` and see what happens. ')
  }, 2000)
  setTimeout(function () {
    ctx.replyWithMarkdown('Just type `help` if you get stuck')
  }, 3000)
}

//
// Start - welcome message
//
bot.start((ctx) => { startAndHelp(ctx) });
bot.hears(/(start)|(help)/i, (ctx) => { startAndHelp(ctx) });

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
    Extra.caption('Data from The Norwegian Meteorological Institute show that temperatures in the Arctic, as measured at Svalbard Airport (78.24 degrees North), are now at least *5°C* higher than 50-100 years ago.').markdown());
})

//
// Ice extent
//
bot.hears(/^ice/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/ArcticIce.png' },
    Extra.caption('The National Snow And Ice Data Center in the US monitors sea ice in the polar regions. ' +
      'This chart shows ice extent in the Arctic for each year since 1979. ' +
      'In the Arctic, sea ice cover is at its lowest in September before the onset of winter. ' +
      'July 2020 had the least amount of ice for any July month since measurements started.'
    ).markdown()
  );
  setTimeout(function () {
    ctx.replyWithMarkdown('You may also be interested in rising sea levels - try typing in *sea level*!')
  }, 3000);
});

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
  setTimeout(() => {
    ctx.reply('Other emissions charts 📈 you might like:',
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

  setTimeout(function () {
    ctx.replyWithMarkdown('We also have some charts on the *cost* of electricity production, try clicking one of these:',
      Markup.inlineKeyboard([
        Markup.callbackButton('Cost of renewable power', 'irena'),
        Markup.callbackButton('Cost of electricity generation', 'eialcoe'),
      ]).extra()
    )
  }, 3000);
  return ctx.replyWithPhoto({ source: 'img/plotEiaEl.png' },
    Extra.caption('The growth in electricity production is mainly in China. Figures are in 1000 TWh (terawatt hours)')
  );
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
  return ctx.replyWithPhoto({ source: 'img/plotEiaOil.png' },
    Extra.caption('Global oil production is about *100 million barrels per day*, and it is increasing. Most of the increase is due to the sharp growth in US shale oil').markdown()
  )
})
bot.action('eiagas', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaGas.png' },
    Extra.caption('This chart shows annual production in billion cubic metres.').markdown()
  )
})
bot.action('eiacoal', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/plotEiaCoal.png' },
    Extra.caption('This chart shows annual production in million metric tons. *China represents 45%* of total coal production').markdown()
  )
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
// Corona beer
//
bot.hears(/corona beer/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/' + 'corona-beer.jpg' });
})

//
// Corona chart country
//
bot.hears(/co[rv][a-z]+ chart (.+)/i, (ctx) => {
  let country = ctx.match[1].toLowerCase();
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Match:', country);
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

//
// Corona list - respond with list of countries we havd data for
//
bot.hears(/co[rv][a-z]+ list/i, async (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.reply(ctx.update.message.from.first_name + ', please wait while we get the list of countries we have data for');
  try {
    const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
    const results = await response.json();
    const countries = results.data.map(d => d.country).join('\n');
    ctx.reply(countries);
    ctx.replyWithMarkdown('Just type *corona* followed by a country in this list to get the latest information');
  }
  catch (err) {
    console.log('Error hears(co2):', err)
    ctx.reply('Ouch, something went wrong, sorry 😟')
  }
})

//
// Corona country - respond with deaths and cases
//
bot.hears(/co[rv][a-z]+ (.+)/i, async (ctx) => {
  let country = ctx.match[1];
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Match:', country);
  // catch some common spellings, the name matching really should be improved
  country = (country.toLowerCase() == "north america") ? "Northern America" : country;
  country = (country.toLowerCase() == "usa") ? "US" : country;
  // occasionally let the user know we're getting data from JHU
  if (Math.random() > 0.8) {
    ctx.reply(ctx.update.message.from.first_name + ', please wait while we get the latest data from Johns Hopkins University');
  }
  setTimeout(async () => {
    try {
      const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
      const results = await response.json();
      // now try to find country in the data array
      const c = results.data.find((x) => country.toLowerCase() == x.country.toLowerCase());
      if (c === undefined) {
        ctx.replyWithMarkdown('Sorry, no data for ' + country + '\nType *corona list* for a list of countries');
        return;
      }
      const trend = (c.thisWeek > c.prevWeek) ? ' 📈 (up ' : ' 📉 (down '
      ctx.replyWithMarkdown(c.country
        + ' total deaths: ' + c.total + ' 💀  '
        + '\nLast seven days: ' + c.thisWeek + trend
        + 'from: ' + c.prevWeek + ')'
        + '\nTotal deaths per 100.000: ' + Math.trunc(c.total / c.population) / 10
      );
    }
    catch (err) {
      console.log('Error hears(corona country):', err);
      ctx.reply('Unable to find that, sorry 😟')
    }
    setTimeout(async () => {
      try {
        const response = await fetch("https://api.dashboard.eco/covid-confirmed-summary");
        const results = await response.json();
        // now try to find country in the data array
        const c = results.data.find((x) => country.toLowerCase() == x.country.toLowerCase());
        if (c === undefined) {
          ctx.reply('Sorry, no data for ' + country);
          return;
        }
        const trend = (c.thisWeek > c.prevWeek) ? ' 📈 (up ' : ' 📉 (down '
        //console.log(c);
        ctx.replyWithMarkdown(c.country
          + ' total cases: ' + c.total + ' 😷'
          + '\nLast seven days: ' + c.thisWeek + trend
          + 'from: ' + c.prevWeek + ')'
          + '\nNew cases per 100.000: ' + Math.trunc(c.thisWeek / c.population) / 10
        );
      }
      catch (err) {
        console.log('Error hears(corona country):', err)
        ctx.reply('Unable to find that, sorry 😟')
      }
    }, 250);
  }, 250);
})

//
// Corona - respond with World chart
//
bot.hears(/(corona)|(covid)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  setTimeout(() => {
    ctx.reply('Other related data:',
      Markup.inlineKeyboard([
        Markup.callbackButton('⚰️ Deaths, Top 20 Countries', 'corona-deaths-top-20')
      ]).extra()
    )
  }, 1000);
  setTimeout(() => {
    ctx.replyWithMarkdown('Hint: You can also type `corona spain` or `corona brazil` ... and so on')
  }, 2000);
  return ctx.replyWithPhoto({ source: 'img/ch1.png' },
    Extra.caption('⚰️ Number of deaths per day, worldwide')
  );
})
bot.action('corona-deaths-top-20', (ctx) => {
  return ctx.replyWithPhoto({ source: 'img/corona-deaths-top-20.png' },
    Extra.caption('These are the countries with the highest number of deaths per million, we update this chart every day.').markdown())
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
// CO2 YEARS - Respond with text and buttons for three images
//
bot.hears(/co2[ ]+([0-9]+)/i, (ctx) => {
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Match:', ctx.match[1]);
  switch (parseInt(ctx.match[1], 10)) {
    case 10: return replyCo210(ctx); break;
    case 2000: return replyCo22000(ctx); break;
    case 500000: return replyCo2500K(ctx); break;
    default:
  }
  return ctx.reply('I do not know how to respond...😕')
});

//
// CO2 - respond with current atmospheric CO2 level from Maunaloa
//
bot.hears(/co2/i, async (ctx) => {
  const firstname = ctx.update.message.from.first_name;
  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text);
  ctx.reply(firstname + ', please wait while we get the latest CO2 measurements from NOAA Earth Systems Research Lab in Hawaii');
  try {
    const response = await fetch("https://api.dashboard.eco/maunaloaco2-daily");
    const results = await response.json();
    const { date, value, change1yr, change10yr } = results.data.pop();
    const days = Math.trunc(moment.duration(moment().diff(moment(date))).as('days'));
    const caption = 'The atmospheric CO2 level is *' + Math.trunc(value) + 'ppm* measured '
      + ((days == 1) ? 'yesterday\n' : (days.toString()) + ' days ago\n')
      + 'This is ' + change1yr + '% higher than a year ago, and '
      + change10yr + '% higher than 10 years ago 🤔\n';
    ctx.replyWithMarkdown(caption)
  }
  catch (err) {
    console.log('Error hears(co2):', err)
    ctx.reply('Oops ... unable to fetch data, sorry 😟')
  }
  // Wait a bit before sending more info
  setTimeout(function () {
    ctx.reply('We have a few charts that illustrate the CO2 level over time - have a look!',
      Markup.inlineKeyboard([
        Markup.callbackButton('📈 10 years', 'co2last10'),
        Markup.callbackButton('📈 2000 years', 'co2last2000'),
        Markup.callbackButton('📈 500.000 years', 'co2last5M')
      ]).extra()
    )
  }, 2000);
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
bot.hears(/sea[ ]*l/i, async (ctx) => {
  const firstname = ctx.update.message.from.first_name;
  console.log('User:', firstname, 'Text:', ctx.update.message.text);
  ctx.reply(firstname + ', please wait while I get the latest sea level measurements from CSIRO in Australia');
  try {
    const response = await fetch("https://api.dashboard.eco/CSIRO_Alt");
    const results = await response.json();
    const latest = results.data.pop();
    const first = results.data.shift();
    const days = moment.duration(moment(latest.t).diff(moment(first.t))).as('days');
    const perDecade = Math.trunc(10 * 365 * (latest.y - first.y) / days);
    const caption = 'The latest data is from ' + moment(latest.t).format('MMMM D') +
      ' and shows that global sea level has increased by *' + (latest.y - first.y) +
      'mm* since ' + moment(first.t).format('MMMM D, YYYY') + '. This is about *' +
      perDecade + 'mm* per decade';
    ctx.replyWithPhoto({ source: 'img/plotSeaLevel.png' }, Extra.caption(caption).markdown());
  }
  catch (err) {
    ctx.reply('Something went wrong, no measurements available right now 😬')
    console.log('Error hears(sealevel):', err)
  }
})

//
// Catch all for actions we don't know how to handle
//
bot.action(/.+/, (ctx) => {
  //  console.log('User:', ctx.update.message.from.first_name, 'Text:', ctx.update.message.text, 'Unresolved');
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! I don't know how to respond to that`)
})

// Do it
bot.launch();
