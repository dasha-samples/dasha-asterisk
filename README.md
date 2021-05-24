# dasha-asterisk
Asterisk config generator 

Generates config for astersk pjsip.conf (chan_pjsip)

## How to use

Learn docs for configuring Dasha SIP
* https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls/
* https://docs.dasha.ai/en-us/default/tutorials/sip-outbound-calls/

Use this application for generating Asterisk configuration

* `git clone https://github.com/dasha-samples/dasha-asterisk.git`
* `cd dasha-asterisk`
* `npm i`
* `node index.js in <configName>` - for getting configuration of calls **from** Asterisk to Dasha
* `node index.js out <configName>` - for getting configuration of calls **to** Asterisk from Dasha

