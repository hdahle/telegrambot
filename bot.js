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

bot.catch((err, ctx) => {
  //console.log(ctx)
  console.log('Bot Error ' + ctx.updateType
    + '\n  Ctx:' + ctx)
});

function logMessage(user, msg) {
  console.log(moment().format("YY-MM-DD hh:mm"), user, msg)
}

function startAndHelp(ctx) {
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, 'Start');
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'eia oil')
  return ctx.replyWithPhoto({ source: 'img/plotEiaOil.png' },
    Extra.caption('Global oil production is about *100 million barrels per day*, and it is increasing. Most of the increase is due to the sharp growth in US shale oil').markdown()
  )
})
bot.action('eiagas', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'eia gas')
  return ctx.replyWithPhoto({ source: 'img/plotEiaGas.png' },
    Extra.caption('This chart shows annual production in billion cubic metres.').markdown()
  )
})
bot.action('eiacoal', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'eia coal')
  return ctx.replyWithPhoto({ source: 'img/plotEiaCoal.png' },
    Extra.caption('This chart shows annual production in million metric tons. *China represents 45%* of total coal production').markdown()
  )
})
bot.action('eiael', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'eia el')
  return ctx.replyWithPhoto({ source: 'img/plotEiaEl.png' })
})
bot.action('emissionsbyfueltype', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'emissions by fuel type')
  return ctx.replyWithPhoto({ source: 'img/plotEmissionsByFuelType.png' },
    Extra.caption('Coal is still the biggest source of CO2 emissions, but gas is growing faster'))
})
bot.action('emissionsnorway', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'emissions norway')
  return ctx.replyWithPhoto(
    { source: 'img/plotEmissionsNorway.png' },
    Extra.caption('Annual GHG emissions in Norway since 1990')
  )
})

//
// CORONA BEER
//
bot.hears(/corona beer/i, (ctx) => {
  console.log(ctx.from)
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
  ctx.replyWithPhoto({ source: 'img/' + 'corona-beer.jpg' });
})

//
// CORONA CHART country
//
bot.hears(/co[rv][a-z]+[ ]+chart[ ]+([a-zA-Z][a-zA-Z\' \-]+)/i, (ctx) => {
  let country = ctx.match[1].toLowerCase();
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
  let fn = 'ch1.png';

  console.log(filename);
  try {
    let filename = 'covid' + country.replace(/[^a-z]/gi, "_") + '.png';
    ctx.replyWithPhoto({ source: 'img/' + 'covid-UK.png' },
      Extra.caption('⚰️ Number of deaths in ' + country)
    );

  } catch (err) {
    console.log('File not found', filename);
  }
})

//
// CORONA LIST - respond with list of countries we have data for
//
bot.hears(/co[rv][a-z]+[ ]+list/i, async (ctx) => {
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
  ctx.reply(ctx.update.message.from.first_name + ', please wait while we get the list of countries we have data for');
  try {
    const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
    const results = await response.json();
    const countries = results.data.map(d => d.country).join('\n');
    ctx.reply(countries);
    setTimeout(() => {
      ctx.replyWithMarkdown('Just type *corona* followed by a country in this list to get the latest information');
    }, 1000);
  }
  catch (err) {
    console.log('Error hears(co2):', err)
    ctx.reply('Ouch, something went wrong, sorry 😟')
  }
})

//
// CORONA REGION TOP/ALL/BOT
//
bot.action(/coronaregion[ ](europe|afr|latin a|north[ern]* a|asia|ocea)[a-z]*[ ]+(top|all|bot|sorted)/i, async (ctx) => {
  let reg = ctx.match[1].toLowerCase();
  let grp = (ctx.match[2] === undefined) ? null : ctx.match[2].toLowerCase();
  //let grr = (ctx.match[3] === undefined) ? null : ctx.match[3].toLowerCase();
  logMessage(ctx.update.callback_query.from.first_name, 'hears: eur/afr/.../ocea grp');
  let countries = [];
  try {
    const response = await fetch("https://api.dashboard.eco/covid-confirmed-summary");
    const results = await response.json();
    console.log('coro', reg, 'results:', results.data.length)
    countries = results.data.filter(d => {
      if (d.region) {
        let r = d.region.toLowerCase().startsWith(reg);
        if (r) return r;
        return d.region.toLowerCase().includes(reg);
      } else {
        return false;
      }
    });
    console.log('countries:', countries.length);
  }
  catch (err) {
    ctx.reply('Ouch, something went wrong, sorry 😟')
    return;
  }
  if (grp !== 'sorted') countries.sort((a, b) => b.this14 / b.population - a.this14 / a.population);
  if (grp === 'top') countries = countries.slice(0, 10);
  if (grp === 'bot') countries = countries.slice(-10);
  // Now run through all countries, build list of trends and data for each country
  let str = '*' + countries[0].region + '*\n'
    + 'New cases per 100.000, 14 days ending '
    + moment(countries[0].data[countries[0].data.length - 1].t).format('dddd, MMM D')
    + '\n'
    + 'The symbols illustrate the trend over the last 3 weeks\n\n';
  countries.forEach(c => {
    if (c.data.length < 36) return;
    let d0 = c.data[c.data.length - 1].y - c.data[c.data.length - 15].y;
    let d1 = c.data[c.data.length - 8].y - c.data[c.data.length - 22].y;
    let d2 = c.data[c.data.length - 15].y - c.data[c.data.length - 29].y;
    let d3 = c.data[c.data.length - 22].y - c.data[c.data.length - 36].y;
    let t0 = (d0 > d1) ? '📈' : '📉';
    let t1 = (d1 > d2) ? '📈' : '📉';
    let t2 = (d2 > d3) ? '📈' : '📉';
    let rate = (Math.trunc(d0 / c.population) / 10);
    rate = (rate > 10) ? Math.trunc(rate) : rate;
    // Add a line for each country
    str += t2 + t1 + t0 + c.country + ' *' + rate + '*\n'
  });
  str += '\n_Country data is updated every morning_'
  ctx.replyWithMarkdown(str);
})


//
// CORONA country REGION
//
bot.hears(/co[rv][a-z]+[ ]+([a-zA-Z][a-zA-Z\' \-]+)[ ]+reg/i, async (ctx) => {
  let country = ctx.match[1].toLowerCase();
  logMessage(ctx.update.message.from.first_name, 'hears:coro country reg:' + country);
  if (country === "uk") country = "united kingdom";
  let c = [];
  try {
    const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
    const results = await response.json();
    c = results.data.find((x) => x.country.toLowerCase().includes(country.toLowerCase()));
  }
  catch (err) {
    console.log('Error hears (CORONA country REGION):', err);
    ctx.reply('Ouch, something went wrong getting data from the cloud, sorry 😟');
    return;
  }
  if (c === undefined || c === null) {
    ctx.reply('Sorry, no data for ' + country);
    return;
  }
  // Now get ALL regions
  let date = c.region[0].data[c.region[0].data.length - 1].t;
  let str = '*' + c.country + '*\nNew cases per 100.000, 14 days ending '
    + moment(date, 'YYYYWW').add(6, 'd').format('dddd, MMM D')
    + '\nThe symbols show the trend over the last 3 weeks\n';
  // Build a list of regions
  let l = [];
  c.region.forEach(reg => {
    let d = reg.data;
    let len = reg.data.length;
    l.push({
      v: [d[len - 1].v, d[len - 2].v, d[len - 3].v, d[len - 4].v, d[len - 5].v],
      c: [
        d[len - 1].v > d[len - 2].v ? '📈' : '📉',
        d[len - 2].v > d[len - 3].v ? '📈' : '📉',
        d[len - 3].v > d[len - 4].v ? '📈' : '📉',
        d[len - 4].v > d[len - 5].v ? '📈' : '📉',
      ],
      name: reg.name
    });
  });
  // Then sort the list based on most recent 14-day value
  l.sort((a, b) => b.v[0] - a.v[0]);
  // Then build the resulting string ready for printing
  l.forEach(x => {
    str += '\n' + x.c[2] + x.c[1] + x.c[0] + ' ' + x.name + ': *' + x.v[0] + '*' //+ ' (was ' + x.v[1] + ')'
  });
  str += '\n\n_Regional data is updated weekly, usually late Wednesday_'
  ctx.replyWithMarkdown(str);
})

//
// CORONA REGION
//
bot.hears(/co[rv][a-z]+[ ]+reg/i, async (ctx) => {
  logMessage(ctx.update.message.from.first_name, 'hears:coro region');
  ctx.reply(ctx.update.message.from.first_name + ', getting list of countries we have regional data for...');
  try {
    const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
    const results = await response.json();
    const countries = results.data.map(d => d.country).join('\n');
    ctx.reply(countries);
    setTimeout(() => {
      ctx.replyWithMarkdown('Try something like this:\n*corona* ' + results.data[0].country + ' *region*');
    }, 1000);
  }
  catch (err) {
    console.log('Error hears(corona region):', err)
    ctx.reply('Ouch, something went wrong, sorry 😟')
  }
})

//
// CORONA COUNTRY - respond with deaths and cases
//
bot.hears(/co[rv][a-z]+[ ]+([a-zA-Z][a-zA-Z\' \-]+)/i, async (ctx) => {
  let country = ctx.match[1].toLowerCase();
  logMessage(ctx.update.message.from.first_name, 'hears:coro ' + country);
  // catch some common spellings, the name matching really should be improved
  country = (country == "north america") ? "Northern America" : country;
  country = (country == "usa") ? "US" : country;
  // occasionally let the user know we're getting data from JHU
  if (Math.random() > 0.8) {
    ctx.reply(ctx.update.message.from.first_name + ', please wait - getting data from Johns Hopkins University');
  }

  // Fetch 'deaths' and 'confirmed' from API server
  let cDeaths;
  let cCases;

  // Fetchs DEATHS from API server
  try {
    const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
    const results = await response.json();
    // Find country: First try a full match
    cDeaths = results.data.find((x) => x.country.toLowerCase() === country);
    // Then try matching the start
    if (cDeaths === undefined) {
      cDeaths = results.data.find((x) => x.country.toLowerCase().startsWith(country));
    }
    if (cDeaths === undefined) {
      cDeaths = results.data.find((x) => x.country.toLowerCase().includes(country));
    }
  }
  catch (err) {
    logMessage('Unable to fetch covid-deaths-summary,', err);
    ctx.reply('Unable to find that, sorry 😟. Try again?');
    return;
  }

  // Fetch confirmed CASES from API server
  try {
    const response = await fetch("https://api.dashboard.eco/covid-confirmed-summary");
    const results = await response.json();
    // Find country: First try a full match
    cCases = results.data.find((x) => x.country.toLowerCase() === country);
    // Then try matching the start
    if (cCases === undefined) {
      cCases = results.data.find((x) => x.country.toLowerCase().startsWith(country));
    }
    if (cCases === undefined) {
      cCases = results.data.find((x) => x.country.toLowerCase().includes(country));
    }
  }
  catch (err) {
    logMessage('Unable to fetch covid-confirmed-summary:', err);
    ctx.reply('Unable to find that, sorry 😟. Try again?');
    return;
  }

  // We have fetched cDeaths and cCases
  logMessage('covid-confirmed-summary and covid-deaths-summary ok', cDeaths.country + ' ' + cDeaths.region);
  // Deaths: dRate is deaths per 100.000
  let dRate = Math.trunc(cDeaths.total / cDeaths.population) / 10;
  dRate = (dRate > 10) ? Math.trunc(dRate) : dRate;
  // Cases: cRate is number of cases per 100.000 over the last 14 days
  let cRate = Math.trunc(cCases.this14 / cCases.population) / 10;
  cRate = (cRate > 10) ? Math.trunc(cRate) : cRate;
  // Filename 
  let filename = 'img/covid-' + cDeaths.country.replace(/[^a-z]/gi, "_") + '.png';

  try {
    if (fs.existsSync(filename)) {
      ctx.replyWithPhoto(
        { source: filename },
        {
          caption: 'Total deaths so far: *' + cDeaths.total + '*\nDeaths per 100.000: *' + dRate + '*\n' + 'Cases per 100.000 last 14 days: *' + cRate + '*',
          parse_mode: 'Markdown'
        }
      );
    } else {
      logMessage('File not found:', filename)
      ctx.replyWithMarkdown(
        '*' + cDeaths.country + '*\nTotal deaths so far: *' + cDeaths.total + '*\nDeaths per 100.000: *' + dRate + '*\n' + 'Cases per 100.000 last 14 days: *' + cRate + '*'
      );
    }
  } catch (err) {
    console.error(err)
  }

  // If COUNTRY is actually a GLOBAL REGION, let user have a list of contries within the region
  logMessage('Looking for countries within global Region', cDeaths.country + ' ' + cDeaths.region);
  if (cDeaths.region === 'world') {
    let inlineKbd = [
      Markup.callbackButton('All', 'coronaregion ' + cDeaths.country + ' all'),
      Markup.callbackButton('Alphabetical', 'coronaregion ' + cDeaths.country + ' sorted'),
      Markup.callbackButton('Top 10', 'coronaregion ' + cDeaths.country + ' top'),
      Markup.callbackButton('Bottom 10', 'coronaregion ' + cDeaths.country + ' bot')
    ];
    if (cDeaths.country === 'Oceania' || cDeaths.country === 'Northern America') {
      inlineKbd.pop(); inlineKbd.pop();
    }
    setTimeout(() => {
      ctx.replyWithMarkdown('Overview of countries in *' + cDeaths.country + '*:',
        Markup.inlineKeyboard(inlineKbd).extra()
      );
    }, 500);
    return;
  }

  // Now see if we have REGIONAL data for the country we're looking at
  logMessage('Looking for subnnational regions within country', cDeaths.country + ' ' + cDeaths.region);
  let cr = null;
  try {
    const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
    const results = await response.json();
    console.log(country, cDeaths.country);
    cr = results.data.find((x) => x.country.toLowerCase().startsWith((country === 'uk') ? 'united kingdom' : cDeaths.country.toLowerCase()));
  }
  catch (err) {
    ctx.reply('Ouch, something went wrong getting data from the cloud, sorry 😟');
    return;
  }
  if (cr === undefined || cr === null) {
    return;
  }

  setTimeout(() => {
    ctx.replyWithMarkdown('More information on regions in *' + cr.country + '*:',
      Markup.inlineKeyboard([
        Markup.callbackButton('All', 'detail ' + cr.country + ' all'),
        Markup.callbackButton('Alphabetical', 'detail ' + cr.country + ' sorted'),
        Markup.callbackButton('Top 10', 'detail ' + cr.country + ' top'),
        Markup.callbackButton('Bottom 10', 'detail ' + cr.country + ' bot')
      ]).extra()
    );
  }, 500);

})

//
// CORONA REGION TOP/ALL/BOT
//
bot.action(/detail+[ ]+([a-zA-Z][a-zA-Z\' \-]+)[ ]+(top|bot|all|sorted)/i, async (ctx) => {
  let country = ctx.match[1].toLowerCase();
  let grp = ctx.match[2].toLowerCase();
  if (country === "uk") country = "united kingdom";
  logMessage(ctx.update.callback_query.from.first_name, 'action: detail country grp:' + country + grp);
  let c = [];
  try {
    const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
    const results = await response.json();
    c = results.data.find((x) => x.country.toLowerCase().includes(country.toLowerCase()));
  }
  catch (err) {
    console.log('A detail country / Error:', err);
    ctx.reply('Ouch, something went wrong getting data from the cloud, sorry 😟');
    return;
  }
  if (c === undefined || c === null) {
    ctx.reply('Sorry, no data for ' + country);
    return;
  }
  // Now get ALL regions
  let date = c.region[0].data[c.region[0].data.length - 1].t;
  let str = '*' + c.country + '*\nNew cases per 100.000, 14 days ending '
    + moment(date, 'YYYYWW').add(6, 'd').format('dddd, MMM D')
    + '\nThe symbols show the trend over the last 4 weeks\n';
  // Build a list of regions
  let l = [];
  c.region.forEach(reg => {
    let d = reg.data;
    let len = reg.data.length;
    l.push({
      v: [d[len - 1].v, d[len - 2].v, d[len - 3].v, d[len - 4].v, d[len - 5].v],
      c: [
        d[len - 1].v > d[len - 2].v ? '📈' : '📉',
        d[len - 2].v > d[len - 3].v ? '📈' : '📉',
        d[len - 3].v > d[len - 4].v ? '📈' : '📉',
        d[len - 4].v > d[len - 5].v ? '📈' : '📉',
      ],
      name: reg.name
    });
  });
  if (grp !== 'sorted') l.sort((a, b) => b.v[0] - a.v[0]);
  if (grp === 'top') l = l.slice(0, 10);
  if (grp === 'bot') l = l.slice(-10);
  // Build resulting string, one line per region
  l.forEach(x => {
    str += '\n' + x.c[2] + x.c[1] + x.c[0] + ' ' + x.name + ': *' + x.v[0] + '*' //+ ' (was ' + x.v[1] + ')'
  });
  str += '\n\n_Regional data is updated weekly, usually late Wednesday_'
  ctx.replyWithMarkdown(str);
})

//
// Corona - respond with World chart
//
bot.hears(/(corona)|(covid)/i, (ctx) => {
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'corona top20')
  return ctx.replyWithPhoto({ source: 'img/corona-deaths-top-20.png' },
    Extra.caption('These are the countries with the highest number of deaths per million, we update this chart every day.').markdown())
})

//
// CO2 - respond with current atmospheric CO2 level from Maunaloa
//
bot.hears(/co2/i, async (ctx) => {
  const firstname = ctx.update.message.from.first_name;
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'co2last10')
  return ctx.replyWithPhoto({ source: 'img/co2-annual.png' },
    Extra.caption('The chart uses data from *NOAA ESRL Global Monitoring Division* and shows the atmospheric CO2 levels for each of the last 10 years. ' +
      'There is a consistent increase in CO2 of about *0.5 - 0.6% per year*. ' +
      '\nIn 2020 the atmospheric CO2 levels are higher than ever before, as indicated by the upper line in the chart. ' +
      'This chart is updated daily based on measurements from the Mauna Loa Observatory').markdown()
  )
})
bot.action('co2last2000', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'co2last2000')
  return ctx.replyWithPhoto({ source: 'img/plotLawDome.png' },
    Extra.caption('Atmospheric CO2 levels were quite stable for about 2000 years - until the start of the *Industrial Revolution*').markdown()
  )
})
bot.action('co2last5M', (ctx) => {
  console.log(moment().format('YY-MM-DD hh:mm'), ctx.update.callback_query.from.username, 'co2last5M')
  return ctx.replyWithPhoto({ source: 'img/plotVostok.png' },
    Extra.caption('Ice-cores drilled in Antarctica contain trapped air bubbles going back several hundred thousand years. ' +
      'Homo Sapiens has been around for about 200.000 years. ' +
      'Atmospheric *CO2 levels were about 180-280ppm* during this time - until the Industrial Revolution ' +
      'when mankind started burning coal and releasing CO2 into the atmosphere').markdown()
  )
})

//
// Sealevel - Respond with text and button for chart
//
bot.hears(/sea[ ]*l/i, async (ctx) => {
  const firstname = ctx.update.message.from.first_name;
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, ctx.update.message.text);
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
  logMessage(ctx.update.message.from.username, ctx.update.message.text);
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! I don't know how to respond to that`)
})

// Do it
bot.launch();
