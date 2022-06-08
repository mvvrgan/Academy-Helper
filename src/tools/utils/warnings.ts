import * as utils from "./utils";
import { v4 as uuidv4 } from 'uuid';

/* Functions */

export function get(id: number | string) {
    return new Promise(async (resolve, reject) => {
        utils.infractions.getTarget(id)
            .then(infractions => {
                if (infractions.length == 0) return reject("There were not warnings found!")

                infractions.forEach(infraction => {
                    utils.apps.mysql.query(`SELECT * FROM warnings WHERE infractionid = ?`, [infraction.infractionid])
                        .then(warnings => {
                            if (warnings.length > 0) {
                                return resolve({
                                    warningdata: warnings[0],
                                    infractiondata: infraction
                                })
                            }
                            else {
                                return reject("There were not warnings found!")
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
    utils.apps.mysql.query(`INSERT INTO infractions (infractionid, action, actor, target, reason) VALUES (?, ?, ?, ?, ?)`, [infactionid, 'WARNING', actor, target, reason])
    return utils.apps.mysql.query(`INSERT INTO warnings (infractionid, expires) VALUES (?, ?)`, [infactionid, datetime])
};

export function remove(infractionid: string) {
    return utils.apps.mysql.query(`DELETE FROM warnings WHERE infractionid = ?`, [infractionid])
};

export function check() {
    return new Promise(async (resolve, reject) => {
        utils.apps.mysql.query(`SELECT * FROM warnings`)
            .then(warnings => {
                if (warnings.length > 0) {
                    warnings.forEach(warning => {
                        let warningexpire = new Date(warning['expires'])
                        let timenow = new Date()

                        if (timenow > warningexpire) {
                            remove(warning.infractionid)
                        }
                    });
                }
            });
    });
};

export function startCheck() {
    setInterval(check, 1000)
}