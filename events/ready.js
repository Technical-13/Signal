const client = require( '..' );
const chalk = require( 'chalk' );
const config = require( '../config.json' );
const parse = require( '../functions/parser.js' );

client.on( 'ready', async rdy => {
  const activityTypes = { 'Playing': 0, 'Streaming': 1, 'Listening': 2, 'Watching': 3, 'Custom': 4, 'Competing': 5 };
  await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: '🥱 Just waking up...' } ], status: 'dnd' } );

  const today = ( new Date() );
  const objTimeString = {"hour":"2-digit","hourCycle":"h24","minute":"2-digit","second":"2-digit","timeZone":"America/New_York","timeZoneName":"short"};
  const botTime = today.toLocaleTimeString( 'en-US', objTimeString );
  console.log( chalk.bold( `The bot owner's local time is ${botTime}.` ) );
  const hour = parseInt( botTime.split( ':' )[ 0 ] );
  const myTime = ( hour >= 5 && hour < 12 ? 'morning' : ( hour >= 12 && hour < 18 ? 'afternoon' : ( hour >= 18 && hour < 23 ? 'evening' : 'nighttime' ) ) );
  const myCup = ( hour >= 5 && hour < 12 ? 'my ' : ( hour >= 12 && hour < 18 ? 'an ' : 'a ' ) ) + myTime;
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Watching, name: 'my ' + myTime + ' coffee brew...' } ], status: 'dnd' } ); }, 15000 );
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes.Custom, name: 'Drinking ' + myCup + ' cup of ☕' } ], status: 'idle' } ); }, 60000 );
  const firstActivity = config.activities[ 0 ];
  setTimeout( async () => { await client.user.setPresence( { activities: [ { type: activityTypes[ firstActivity.type ], name: firstActivity.name } ], status: 'online' } ); }, 180000 );

  const servingGuilds = [ { type: 'Custom', name: 'Watching {{bot.servers}} servers.' } ];
  const servingUsers = [ { type: 'Custom', name: 'Listening to {{bot.users}} members.' } ];
  const botUptime = [ { type: 'Custom', name: 'Uptime: {{bot.uptime}}' } ];
  const cycleActivities = [].concat( config.activities, servingGuilds, servingUsers, botUptime );
  const intActivities = cycleActivities.length;
  var iAct = 1;
  setInterval( async () => {
    let activityIndex = ( iAct++ % intActivities );
    let thisActivity = cycleActivities[ activityIndex ];
    let actType = activityTypes[ thisActivity.type ];
    let actName = await parse( thisActivity.name, { uptime: { getWeeks: true } } );
    await client.user.setPresence( { activities: [ { type: actType, name: actName } ], status: 'online' } );
  }, 300000 );

  console.log( chalk.bold.magentaBright( `Successfully logged in as: ${client.user.tag}` ) );
} );