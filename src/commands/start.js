const { EOL } = require( 'os' );

const makeCommand = require( '../utils/make-command' );
const makeSpinner = require( '../utils/make-spinner' );
const makeBoxen = require( '../utils/make-boxen' );
const { replaceLinks } = require( '../utils/make-link' );

const envUtils = require( '../env-utils' );
const { startAll, start } = require( '../environment' );

exports.command = 'start [<env>] [--pull]';
exports.desc = 'Starts a specific docker environment.';

exports.builder = function( yargs ) {
    yargs.positional( 'env', {
        type: 'string',
        describe: 'Optional. Environment name.',
    } );

    yargs.option( 'pull', {
        description: 'Pull images when environment starts',
        default: false,
        type: 'boolean',
    } );
};

exports.handler = makeCommand( async ( { verbose, pull, env } ) => {
    const spinner = ! verbose ? makeSpinner() : undefined;
    const all = env === 'all';

    let envName = ( env || '' ).trim();
    if ( ! envName ) {
        envName = await envUtils.parseEnvFromCWD();
    }

    if ( ! envName ) {
        envName = await envUtils.promptEnv();
    }

    if ( all ) {
        await startAll( spinner, pull );
    } else {
        await start( envName, spinner, pull );

        // @ts-ignore
        const envPath = await envUtils.getPathOrError( envName, {
            log() {},
            error( err ) {
                if ( spinner ) {
                    throw new Error( err );
                } else {
                    console.error( err );
                }
            },
        } );

        const envHosts = await envUtils.getEnvHosts( envPath );
        if ( Array.isArray( envHosts ) && envHosts.length > 0 ) {
            let info = '';
            const links = {};

            envHosts.forEach( ( host ) => {
                const home = `http://${ host }/`;
                const admin = `http://${ host }/wp-admin/`;

                links[ home ] = home;
                links[ admin ] = admin;

                info += `Homepage: ${ home }${ EOL }`;
                info += `WP admin: ${ admin }${ EOL }`;
                info += EOL;
            } );

            console.log( replaceLinks( makeBoxen()( info ), links ) );
        }
    }
} );