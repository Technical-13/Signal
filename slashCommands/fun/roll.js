const { ApplicationCommandType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/fun/roll.js' );

module.exports = {
  name: 'roll',
  group: 'fun',
  name_localizations: {
    de: 'würfeln',
    fr: 'lancer-les-dés',
    fi: 'heitä-noppaa',
    pl: 'rzuć-kostką',
    'sv-SE': 'rulla-tärningen' },
  description: 'Dice Roller (default: 1#1d6±0)',
  type: ApplicationCommandType.ChatInput,
  options: [// dice, sides, sets, modifier
    { type: 4, name: 'dice', description: 'How many dice? (default: 1)' },
    { type: 4, name: 'sides', description: 'How many sides per die? (default: 6)' },
    { type: 4, name: 'sets', description: 'How many sets of dice? (default: 1)' },
    { type: 4, name: 'modifier', description: '± to final roll for each die? (default: 0)' }
  ],
  cooldown: 1000, // Set a cooldown of 1 second
  run: async ( client, interaction ) => {
    try {
      const { guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const intSets = ( options.get( 'sets' ) ? ( options.get( 'sets' ).value || 1 ) : 1 );
      const intDice = ( options.get( 'dice' ) ? ( options.get( 'dice' ).value || 1 ) : 1 );
      const intSides = ( options.get( 'sides' ) ? ( options.get( 'sides' ).value || 6 ) : 6 );
      const intMod = ( options.get( 'modifier' ) ? ( options.get( 'modifier' ).value || null ) : null );

      var intRollTotal = 0;
      var strRollTotal = ( intSets > 1 ? intSets + '#' : '' ) + ( intDice > 1 ? intDice : '' ) + 'd' + intSides + ( intMod != null ? ( intMod < 0 ? ' ' : ' +' ) + intMod : '' ) + ':';

      for ( var set = 1; set <= intSets; set++ ) {
        //    var arrRolls = [];
        var intRollSubtotal = 0;
        var strRollSubtotal = '\n\t(';

        for ( var die = 1; die <= intDice; die++ ) {
          var result = Math.floor( Math.random() * intSides ) + 1;
          intRollSubtotal += result;
          if ( die < intDice ) { strRollSubtotal += result + ') + ('; }
          else { strRollTotal += strRollSubtotal + result + ')'; }
          //    arrRolls.push( result );
        }

        if ( intMod != null && intMod !== 0 ) {
          intRollSubtotal += intMod;
          strRollTotal += ( intMod < 0 ? ' ' : ' +' ) + intMod;
        }
        strRollTotal += ' = ' + intRollSubtotal;

        intRollTotal += intRollSubtotal;

        //    objSets[ set ] = { rolls: arrRolls, mod: intMod, sum: intRollSubtotal };
      }

      if ( intSets > 1 ) {
        strRollTotal += '\nTotal: ' + intRollTotal;
      }

      interaction.reply( { content: strRollTotal } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
}