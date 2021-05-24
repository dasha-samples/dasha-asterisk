const dasha = require("@dasha.ai/sdk");
const { options } = require("yargs");
const yargs = require("yargs");

function parseArgs() {
  const argv = yargs
    .command("out", "Generate Asterisk config for calls from Dasha")
    .command("in", "Generate Asterisk config for calls to Dasha")
    .option("config", {
      description: "Name of sip config",
      alias: "c",
      type: "string",
    })
    .demandCommand(1, "You need to select in or out command")
    .help()
    .alias("help", "h").argv;
  return argv;
}

async function generateOutConfig(configName) {
  const configs = await dasha.sip.outboundConfigs.listConfigs();
  const config = configs[configName];
  if (config === undefined) {
    console.error(`Config '${configName}' not found`);
    for (const c of Object.entries(configs)) {
      console.error(`Expected: '${c[0]}'`);
    }
    return false;
  }
  console.log(
    `; Auto generated from config '${configName}' for dasha.ai pjsip.conf at '${config.server}'`
  );
  console.log(`; replate <password> to your actual password`);
  //aors
  console.log(``);
  console.log(`[${config.account}]`);
  console.log(`type = aor`);
  console.log(`max_contacts = 1`);
  //auth
  console.log(``);
  console.log(`[${config.account}]`);
  console.log(`type = auth`);
  console.log(`auth_type = userpass`);
  console.log(`username = ${config.account}`);
  console.log(`password = <password>`);

  //endpoint
  console.log(``);
  console.log(`[${config.account}]`);
  console.log(`type = endpoint`);
  console.log(`auth = ${config.account}`);
  console.log(`aors = ${config.account}`);
  console.log(`context = from-dasha-${configName}`);
  console.log(`disallow = all`);
  console.log(`allow = alaw`);
  console.log(`allow = ulaw`);

  console.log(``);
  console.log(`; END of auto-generated config`);

  console.log(
    `; for extensions.conf, uncomment lines bellow and replace <your-trunk> to your PSTN provide trunk name`
  );
  console.log(`; [from-dasha-${configName}]`);
  console.log(
    "; exten => _X.,1,Verbose(0, \"Calling from '${CALLERID(num)}' to '${EXTEN}'\")"
  );
  console.log("; same  => n,Dial(PJSIP/${EXTEN}@<your-trunk>,60)");
  console.log(`; same  => n,Hangup()`);
}

async function generateInConfig(configName) {
  const configs = await dasha.sip.inboundConfigs.listConfigs();
  const config = configs[configName];
  if (config === undefined) {
    console.error(`Config '${configName}' not found`);
    for (const c of Object.entries(configs)) {
      console.error(`Expected: '${c[0]}'`);
    }
    return false;
  }
  const username = /sip:(\S+)@/.exec(config.uri)[1];

  console.log(
    `; Auto generated from config '${configName}' for dasha.ai '${config.applicationName}' in group '${config.groupName}'`
  );
  console.log(`; replate <password> to your actual password`);
  //aors
  console.log(``);
  console.log(`[to-dasha-${configName}]`);
  console.log(`type = aor`);
  console.log(`contact = ${config.uri}`);
  //auth
  console.log(``);
  console.log(`[to-dasha-${configName}]`);
  console.log(`type = auth`);
  console.log(`auth_type = userpass`);
  console.log(`username = ${username}`);
  console.log(`password = <password>`);

  //endpoint
  console.log(``);
  console.log(`[to-dasha-${configName}]`);
  console.log(`type = endpoint`);
  console.log(`outbound_auth = to-dasha-${configName}`);
  console.log(`aors = to-dasha-${configName}`);
  console.log(`context = to-dasha-${configName}`);
  console.log(`disallow = all`);
  console.log(`allow = alaw`);
  console.log(`allow = ulaw`);

  console.log(``);
  console.log(`; END of auto-generated config`);

  console.log(
    `; for extensions.conf, uncomment lines bellow and replace <your-trunk> to your PSTN provide trunk name`
  );
  console.log(`; [some-exten]`);
  console.log(
    "; exten => _X.,1,Verbose(0, \"Calling from '${CALLERID(num)}' to '${EXTEN}'\")"
  );
  console.log(`; same  => n,Dial(PJSIP/to-dasha-${configName},60)`);
  console.log(`; same  => n,Hangup()`);
}

async function main() {
  const argv = parseArgs();
  if (argv.config === undefined) {
    console.warn("config is requried");
    process.exit(1);
  }

  if (argv._.includes("out")) {
    if (!(await generateOutConfig(argv.config))) {
      process.exit(1);
    }
    return;
  }
  if (argv._.includes("in")) {
    if (!(await generateInConfig(argv.config))) {
      process.exit(1);
    }
    return;
  }
}

main();
