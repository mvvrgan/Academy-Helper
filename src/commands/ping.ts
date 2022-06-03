import * as utils from "../tools/utils/utils";

const data = {
    name: 'ping',
    description: 'ping pong!'
}

function run (interaction: any, client: any) {
    interaction.editReply(`pong! (${Math.round(client.ws.ping)}ms)`)
}

export {data, run}