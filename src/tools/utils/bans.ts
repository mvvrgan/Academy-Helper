import * as utils from "./utils";
import { v4 as uuidv4 } from 'uuid';

/* Functions */

export function get(id: number | string) {
    return new Promise(async (resolve, reject) => {
        utils.infractions.getTarget(id)
            .then(infractions => {
                if (infractions.length == 0) return reject("There were not bans found!")

                infractions.forEach(infraction => {
                    utils.apps.mysql.query(`SELECT * FROM bans WHERE infractionid = ?`, [infraction.infractionid])
                        .then(bans => {
                            if (bans.length > 0) {
                                return resolve({
                                    bandata: bans[0],
                                    infractiondata: infraction
                                })
                            }
                            else {
                                return reject("There were not bans found!")
                            }
                        })
                });
            })
            .catch(err => {
                console.log(err);
            })
    });
};

export function create(actor:string, target:string, reason:string, datetime:string) {
    return new Promise(async (resolve, reject) => {
        let infactionid = utils.uuidToBase64(uuidv4())
        utils.apps.mysql.query(`INSERT INTO infractions (infractionid, action, actor, target, reason) VALUES (?, ?, ?, ?, ?)`, [infactionid, 'BAN', actor, target, reason])
        utils.apps.mysql.query(`INSERT INTO bans (infractionid, expires) VALUES (?, ?)`, [infactionid, datetime])
    });
};

export function remove(infractionid: string) {
    return utils.apps.mysql.query(`DELETE FROM bans WHERE infractionid = ?`, [infractionid])
};

export function check() {
    return new Promise(async (resolve, reject) => {
        utils.apps.mysql.query(`SELECT * FROM bans`)
            .then(bans => {
                if (bans.length > 0) {
                    bans.forEach(ban => {
                        let banexpire = new Date(ban['expires'])
                        let timenow = new Date()

                        if (timenow > banexpire) {
                            remove(ban.infractionid)
                                .then(async () => {
                                    let infraction = await utils.infractions.get(ban.infractionid)
                                    await utils.apps.discord.Client.guilds.cache.get(process.env.DISCORD_GUILD).members.unban(infraction[0].target)
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