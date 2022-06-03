import * as discord from "discord.js";
import * as fs from "fs";
import * as utils from "./utils/utils";

export async function start() {
    this.Commands = []

    let Client = utils.apps.discord.Client
    
    Client.user.setActivity(`${5} users`, {
        type: 'WATCHING'
    });
    
    fs.readdir(`${__dirname}/../commands`, (err, files) => {
        files.forEach(async file => {
            let filename = file.split('.').slice(0, -1).join('.');
            let path = `../commands/${file}`;

            let command = require(`../commands/${file}`)
            let data = command.data
            this.Commands.push(command)

            // Creates the command
            getApp(Client).commands.post({ data: data })
        });
    });

    console.log(`Discord Slash Commands have been created!`)

    Client.on(`interactionCreate`, interaction => {
        if (!interaction.isCommand()) return;

        let command = this.Commands.find(command => command.data.name === interaction.commandName)
        if (!command) return;

        command.run(interaction, Client)
    });
}

function getApp (Client: any, guildId?: number) {
    const app = Client.api.applications(Client.user.id)
    if (guildId) {
        app.guilds(guildId)
    }
    return app
}