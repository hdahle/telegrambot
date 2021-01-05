/*
 * Telegram BOT experiments using 'telegraf'
 * https://github.com/telegraf/telegraf
 *
 * H. Dahle, 2021
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
  console.log('coronabot: images', files.length)
});

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf(apiKey);
const fetch = require('node-fetch');

bot.catch((err, ctx) => {
  console.log('Bot Error ' + ctx.updateType + ',  Ctx:' + ctx)
});

function logMessage(user, msg = '') {
  console.log(moment().format("YY-MM-DD hh:mm"), user, msg)
}

function startAndHelp(ctx) {
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, 'Start');
  ctx.reply('Hi ' + ctx.update.message.from.first_name + '!');
  setTimeout(function () {
    ctx.reply('Here are some commands you can try:\n\n' +
      'world\n' +
      'list\n' +
      'top\n' +
      'euro\n' +
      'france\n' +
      '...or just type in the first few letters of a country or world region and see what happens\n'
    )
  }, 1000)
  setTimeout(function () {
    ctx.replyWithMarkdown('Just type `help` for this message')
  }, 3000)
}


//
// START, HELP - welcome message
//
bot.start((ctx) => { startAndHelp(ctx) });
bot.hears(/start/i, (ctx) => { startAndHelp(ctx) });
bot.hears(/help/i, (ctx) => { startAndHelp(ctx) });

//
// NEWs about the update
//
bot.hears(/coro/i, (ctx) => {
  logMessage(ctx.update.message.from.username + '/' + ctx.update.message.from.first_name, 'Start');
  ctx.replyWithMarkdown('Hi ' + ctx.update.message.from.first_name + '!\n' +
    'The bot has been updated and simplified!\n' +
    'You should no longer type *corona country*\n' +
    'Just type in the first few letters of the country name and hit enter\n' +
    'Enjoy!'
  );
});


//
// LIST - respond with list of countries we have data for
//
bot.hears(/list/i, async (ctx) => {
  logMessage(ctx.update.message.from.first_name, ctx.update.message.text);
  ctx.reply(ctx.update.message.from.first_name + ', please wait while we get the list of countries we have data for');
  try {
    const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
    const results = await response.json();
    const countries = results.data.map(d => d.country).join('\n');
    ctx.reply(countries);
    setTimeout(() => {
      ctx.replyWithMarkdown('Just type the first letter of the name of a country in this list to get the latest information');
    }, 1000);
  }
  catch (err) {
    logMessage('Unable to fetch covid-deaths-summary,', err);
    ctx.reply('Ouch, something went wrong, sorry 😟. Please try again!')
  }
})


//
// COUNTRY - respond with deaths and cases
//
bot.hears(/([a-zA-Z][a-zA-Z\' \-]+)/i, async (ctx) => {
  let country = ctx.match[1].toLowerCase();
  logMessage(ctx.update.message.from.first_name, 'hears:coro ' + country);
  // catch some common spellings, the name matching really should be improved
  country = (country == "north america") ? "Northern America" : country;
  country = (country == "usa") ? "us" : country;
  // occasionally let the user know we're getting data from JHU
  if (Math.random() > 0.8) {
    ctx.reply(ctx.update.message.from.first_name + ', please wait - getting data from Johns Hopkins University');
  }

  // Fetchs DEATHS from API server
  let results;
  try {
    const response = await fetch("https://api.dashboard.eco/covid-deaths-summary");
    results = await response.json();
  }
  catch (err) {
    logMessage('Unable to fetch covid-deaths-summary');
    ctx.reply('Unable to find that, sorry 😟. Try again?');
    return;
  }

  if (!('data' in results)) {
    logMessage('Fetch covid-deaths-summary: no \'data\' in results');
    return;
  }

  // Find country: First try a full match
  let cDeaths = results.data.find((x) => x.country.toLowerCase() === country);
  // Then try matching the start
  if (cDeaths === undefined) {
    cDeaths = results.data.find((x) => x.country.toLowerCase().startsWith(country));
  }
  if (cDeaths === undefined) {
    cDeaths = results.data.find((x) => x.country.toLowerCase().includes(country));
  }
  if (cDeaths === undefined) {
    ctx.replyWithMarkdown('Unable to find *' + country + '* -  sorry 😟');
    return;
  }

  // Fetch confirmed CASES from API server
  try {
    const response = await fetch("https://api.dashboard.eco/covid-confirmed-summary");
    results = await response.json();
  }
  catch (err) {
    logMessage('Unable to fetch covid-confirmed-summary:');
    ctx.reply('Unable to find that, sorry 😟. Try again?');
    return;
  }

  // Find country: First try a full match
  let cCases = results.data.find((x) => x.country.toLowerCase() === country);
  // Then try matching the start
  if (cCases === undefined) {
    cCases = results.data.find((x) => x.country.toLowerCase().startsWith(country));
  }
  if (cCases === undefined) {
    cCases = results.data.find((x) => x.country.toLowerCase().includes(country));
  }
  if (cCases === undefined) {
    ctx.replyWithMarkdown('Unable to find *' + country + '* -  sorry 😟');
    return;
  }

  // We have fetched cDeaths and cCases
  logMessage('covid-confirmed-summary and covid-deaths-summary ok, ' + cDeaths.country + ' ' + cDeaths.region);
  // Deaths: dRate is deaths per 100.000
  let dRate = Math.trunc(cDeaths.total / cDeaths.population) / 10;
  dRate = (dRate > 10) ? Math.trunc(dRate) : dRate;
  // Cases: cRate is number of cases per 100.000 over the last 14 days
  let cRate = Math.trunc(cCases.this14 / cCases.population) / 10;
  cRate = (cRate > 10) ? Math.trunc(cRate) : cRate;

  // Display the PNG image if it exists
  let filename = 'img/covid-' + cDeaths.country.replace(/[^a-z]/gi, "_") + '.png';
  if (fs.existsSync(filename)) {
    logMessage('Found file', filename)
    ctx.replyWithPhoto({ source: filename });
  } else {
    logMessage('File not found:', filename)
  }

  // Text reply
  let botReply = '*' + cDeaths.country + '*\nTotal deaths so far: *' + cDeaths.total + '*\nDeaths per 100.000: *' + dRate + '*\n' + 'Cases per 100.000 last 14 days: *' + cRate + '*';

  // Build the inline keyboard
  let inlineKbd = [];

  if (cDeaths.country.toLowerCase() === 'world') {
    logMessage('Build inline kbd for', cDeaths.country);
    inlineKbd = [
      Markup.callbackButton('World regions', 'coronaregion ' + cDeaths.country + ' all'),
      Markup.callbackButton('Top 20 countries', 'corona-deaths-top-20'),
    ];
  } else if (cDeaths.region === 'world') {
    logMessage('Build inline keyboard for Global Region:', cDeaths.country + ' ' + cDeaths.region);
    inlineKbd = [
      Markup.callbackButton('All', 'coronaregion ' + cDeaths.country + ' all'),
      Markup.callbackButton('Alphabetical', 'coronaregion ' + cDeaths.country + ' sorted'),
      Markup.callbackButton('Top 10', 'coronaregion ' + cDeaths.country + ' top'),
      Markup.callbackButton('Bottom 10', 'coronaregion ' + cDeaths.country + ' bot')
    ];
    // Do not list Top 10 and Bottom 10 for regiosn with too few countries
    if (cDeaths.country === 'Oceania' || cDeaths.country === 'Northern America') {
      inlineKbd.pop(); inlineKbd.pop();
    }
  } else {
    logMessage('Build inline kbd, Subnational regions within country: ' + cDeaths.country + ' ' + cDeaths.region);
    try {
      const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
      results = await response.json();
    }
    catch (err) {
      ctx.reply('Ouch, something went wrong getting data from the cloud, sorry 😟');
      return;
    }
    // Special case: UK, country data from Johns Hopkins uses UK but regional data from ECDC uses United Kingdom
    if (country.toLowerCase() === 'uk') {
      cDeaths.country = 'United Kingdom';
    }
    let cr = results.data.find((x) => x.country.toLowerCase().startsWith(cDeaths.country.toLowerCase()));
    if (cr === undefined || cr === null || !('country' in cr)) {
      logMessage('No regions for', cDeaths.country)
    } else {
      inlineKbd = [
        Markup.callbackButton('All', 'detail ' + cr.country + ' all'),
        Markup.callbackButton('Alphabetical', 'detail ' + cr.country + ' sorted'),
        Markup.callbackButton('Top 10', 'detail ' + cr.country + ' top'),
        Markup.callbackButton('Bottom 10', 'detail ' + cr.country + ' bot')
      ];
    }
  }

  setTimeout(() => {
    ctx.replyWithMarkdown(botReply, Markup.inlineKeyboard(inlineKbd).extra());
  }, 500);
})


//
// DETAIL COUNTRY TOP/ALL/BOTTOM, from ECDC data
//
bot.action(/detail+[ ]+([a-zA-Z][a-zA-Z\' \-]+)[ ]+(top|bot|all|sorted)/i, async (ctx) => {
  let country = ctx.match[1].toLowerCase();
  let grp = ctx.match[2].toLowerCase();
  if (country === "uk") country = "united kingdom";
  logMessage(ctx.update.callback_query.from.first_name, 'action: detail country grp:' + country + ' ' + grp);
  let c = [];
  try {
    const response = await fetch("https://api.dashboard.eco/ecdc-weekly");
    const results = await response.json();
    c = results.data.find((x) => x.country.toLowerCase().includes(country.toLowerCase()));
  }
  catch (err) {
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
    if (len < 5) {
      logMessage('WARNING', 'Missing data for ' + country + ' ' + reg.name);
    }
    if (len >= 5) {
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
    }
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

bot.action('corona-deaths-top-20', (ctx) => {
  logMessage(ctx.update.callback_query.from.username, 'corona top20')
  return ctx.replyWithPhoto({ source: 'img/corona-deaths-top-20.png' },
    Extra.caption('These are the countries with the highest number of deaths per million, we update this chart every day.').markdown())
})


//
// CORONA REGION TOP/ALL/BOT
//
bot.action(/coronaregion (europe|afr|latin a|north[ern]* a|asia|ocea|world|xworld)[a-z]*[ ]+(top|all|bot|sorted|chart)/i, async (ctx) => {
  let reg = ctx.match[1].toLowerCase();
  let grp = (ctx.match[2] === undefined) ? null : ctx.match[2].toLowerCase();
  let displayChart = ctx.match[2] == 'chart';

  logMessage(ctx.update.callback_query.from.first_name, 'coronaregion ' + reg);

  let countries = [];
  try {
    const response = await fetch("https://api.dashboard.eco/covid-confirmed-summary");
    const results = await response.json();
    countries = results.data.filter(d => {
      if (d.region) {
        let r = d.region.toLowerCase().startsWith(reg);
        if (r) return r;
        return d.region.toLowerCase().includes(reg);
      } else {
        return false;
      }
    });
  }
  catch (err) {
    ctx.reply('Ouch, something went wrong, sorry 😟')
    return;
  }
  console.log(countries[0].region)


  // Display the PNG image if it exists
  if (displayChart) {
    let filename = 'img/covid-' + countries[0].region.replace(/[^a-z]/gi, "_") + '.png';
    if (fs.existsSync(filename)) {
      logMessage('Found file', filename)
      ctx.replyWithPhoto({ source: filename });
    } else {
      logMessage('File not found:', filename)
    }
  }

  if (grp !== 'sorted') countries.sort((a, b) => b.this14 / b.population - a.this14 / a.population);
  if (grp === 'top') countries = countries.slice(0, 10);
  if (grp === 'bot') countries = countries.slice(-10);
  // Now run through all countries, build list of trends and data for each country
  let str = '*' + countries[0].region + '*\n'
    + 'New cases per 100.000, 14 days ending '
    + moment(countries[0].data[countries[0].data.length - 1].t).format('dddd, MMM D')
    + '\n'
    + 'The 📈 and 📉symbols show trends for the last 3 weeks\n\n';
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

  if (reg === 'world') {
    let inlineKbd = countries.map(x => Markup.callbackButton(x.country, 'coronaregion ' + x.country + ' chart'))
    ctx.replyWithMarkdown(str, Markup.inlineKeyboard(inlineKbd).extra());
  } else {
    ctx.replyWithMarkdown(str, []);
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
