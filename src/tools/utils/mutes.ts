import * as utils from "./utils";
import { v4 as uuidv4 } from 'uuid';

/* Functions */

export function get(id: number | string) {
    return new Promise(async (resolve, reject) => {
        utils.infractions.getTarget(id)
            .then(infractions => {
                if (infractions.length == 0) return reject("There were not mutes found!")

                infractions.forEach(infraction => {
                    utils.apps.mysql.query(`SELECT * FROM mutes WHERE infractionid = ?`, [infraction.infractionid])
                        .then(mutes => {
                            if (mutes.length > 0) {
                                return resolve({
                                    mutedata: mutes[0],
                                    infractiondata: infraction
                                })
                            }
                            else {
                                return reject("There were not mutes found!")
                            }
                        })
                });
            })
            .catch(err => {
                console.log(err);
            })
    });
};

export function create(actor: string, target: string, reason: string, datetime: string) {
    let infactionid = utils.uuidToBase64(uuidv4())
    utils.apps.mysql.query(`INSERT INTO infractions (infractionid, action, actor, target, reason) VALUES (?, ?, ?, ?, ?)`, [infactionid, 'MUTE', actor, target, reason])
    return utils.apps.mysql.query(`INSERT INTO mutes (infractionid, expires) VALUES (?, ?)`, [infactionid, datetime])
};

export function remove(infractionid: string) {
    return utils.apps.mysql.query(`DELETE FROM mutes WHERE infractionid = ?`, [infractionid])
};

export function check() {
    return new Promise(async (resolve, reject) => {
        utils.apps.mysql.query(`SELECT * FROM mutes`)
            .then(mutes => {
                if (mutes.length > 0) {
                    mutes.forEach(async mute => {
                        let muteexpire = new Date(mute['expires'])
                        let timenow = new Date()
                        
                        let infraction = await utils.infractions.get(mute.infractionid)
                        if (utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(infraction[0].target)) {
                            if (!utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(infraction[0].target).roles.cache.has('955861799234850846')) {
                                await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(infraction[0].target).roles.add('955861799234850846')
                            }
                        }

                        if (timenow > muteexpire) {
                            remove(mute.infractionid)
                                .then(async () => {
                                    let infraction = await utils.infractions.get(mute.infractionid)
                                    await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.cache.get(infraction[0].target).roles.remove('955861799234850846')
                                })
                        }
                    });
                }
            });
    });
};

export function startCheck() {
    setInterval(check, 1000)
}