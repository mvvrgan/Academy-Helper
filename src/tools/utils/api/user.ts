import * as utils from "../utils"
import { v4 as uuid } from 'uuid';


export function get(identity?: string, value?: string | number) {
    if (!identity || !value) {
        return new Promise<string | []>((resolve, reject) => {
            utils.apps.mysql.query(`SELECT * FROM users`)
                .then(users => {
                    resolve(users);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
    return new Promise<string | []>((resolve, reject) => {
        utils.apps.mysql.query(`SELECT * FROM users WHERE ${identity} = ?`, [value])
            .then(users => {
                resolve(users);
            })
            .catch(err => {
                reject(err);
            });
    });
};

export function create(discordid: number | string, robloxid?: number | string) {
    return new Promise((resolve, reject) => {
        let userid = uuid();
        
        //if (!robloxid) robloxid = '';

        utils.apps.mysql.query("INSERT INTO users (`userid`, `discordid`, `robloxid`) VALUES (?,?,?)", [userid, discordid, robloxid])
            .then(() => {
                resolve({
                    message: `[API] Successfully created a new user!`, 
                    data: {
                        userid,
                        discordid
                    }
                });
            })
            .catch(err => {
                if (err.code == 'ER_DUP_ENTRY') err = `There is already a user with similar details!`;
                reject(err);
            });
    });
};