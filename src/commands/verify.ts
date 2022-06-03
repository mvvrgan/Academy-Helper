import * as utils from "../tools/utils/utils";
import * as discord from "discord.js";
import * as roblox from "noblox.js";
import axios from "axios";

const data = {
    name: 'verify',
    description: 'Verify your Roblox account with Purchasing Hub!'
};

async function run (interaction:any, client: any) {
    await interaction.deferReply();

    let user = (await utils.user.get('discordid', interaction.user.id))[0];

    if (!user) {
        await utils.user.create(interaction.user.id)
            .then(async response => {
                user = (await utils.user.get('discordid', interaction.user.id))[0];
            })
            .catch(err => {
                return interaction.editReply(err);
            });
    };

    axios.get(`https://v3.blox.link/developer/discord/${user['discordid']}`, {headers: {'api-key': process.env.BLOXLINK_KEY}})
        .then(async response => {
            response = response.data;

            if (!response['user']['robloxId']) return;
            let row = new discord.MessageActionRow()
                .addComponents(
                    new discord.MessageButton()
                        .setCustomId(`VERIFY1_${response['user']['robloxId']}`)
                        .setStyle('DANGER')
                        .setEmoji('977274677267410974'),
                    new discord.MessageButton()
                        .setCustomId(`VERIFY2_${response['user']['robloxId']}`)
                        .setStyle('SUCCESS')
                        .setEmoji('977274723346026496')
                );

            let Embed = utils.apps.discord.Embed;
            Embed.setTitle(`Hey, are you ${await roblox.getUsernameFromId(response['user']['robloxId'])}?`);
            Embed.setDescription(`We searched for your accounts linked to the Bloxlink Database, would you like to verify as ${await roblox.getUsernameFromId(response['user']['robloxId'])}?`)
            Embed.setThumbnail((await roblox.getPlayerThumbnail(response['user']['robloxId'], '420x420', 'png', false, 'headshot'))[0]['imageUrl']);
            Embed.setTimestamp();

            interaction.editReply({embeds: [Embed], components: [row]});

            let cancelEvent = client.on('interactionCreate', cancelFunc);
            function cancelFunc (buttonInteraction) {
                if (!buttonInteraction.isButton()) return; if (buttonInteraction.customId != `VERIFY1_${response['user']['robloxId']}`) return;
                cancelEvent.removeListener('interactionCreate', cancelFunc);

                manualVerification()
            };

            let confirmEvent = client.on('interactionCreate', confirmFunc);
            function confirmFunc (buttonInteraction) {
                if (!buttonInteraction.isButton()) return; if (buttonInteraction.customId != `VERIFY1_${response['user']['robloxId']}`) return;
                confirmEvent.removeListener('interactionCreate', confirmFunc);
                
                utils.user.create(interaction.user.id, response['user']['robloxId'])
                    .then(async () => {
                        return interaction.editReply(`Thank you for verifying your account, ${await roblox.getUsernameFromId(response['user']['robloxId'])}!`);
                    })
                    .catch(() => {
                        return interaction.editReply(`There was an unexpected error! Please try again.`);
                    });
            };

            function manualVerification () {
                
            }
        })
        .catch(err => {
            
        });
};

export {data, run};