import * as discord from "discord.js";
import * as fs from "fs";
import * as utils from "./utils/utils";

export async function start() {
    this.Commands = []

    let Client = utils.apps.discord.Client
    console.log(Client.guilds.cache.get(process.env.DISCORD_GUILD).memberCount)
    Client.user.setActivity(`the Olympics`, {
        type: 'COMPETING',
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
        // if the interaction was not created in the discord guild then reply with an error
        if (interaction.guildId !== process.env.DISCORD_GUILD) {
            interaction.reply({
                content: `This command can only be used in the Discord server!`
            })
            return;
        }

        let logChannel:discord.TextChannel = Client.channels.cache.get("955861798437924956") as discord.TextChannel
        logChannel.send({ embeds: [
            new discord.MessageEmbed()
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`Used command: ${command.data.name}`)
                .setColor('#eb4334')
                .setFooter('Academy Helper')
                .setTimestamp()
        ]})

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