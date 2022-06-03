import * as express from "express";
import fetch from 'node-fetch';
import * as fs from "fs";

export class Router {
    server: any
    router: any

    constructor(server: any) {
        this.server = server;
        this.router = express.Router()

        /* Main Pages */
        this.router.get('/', (request, response) => {
            return response.status(200).render('index');
        });
        this.router.get('/link', (request, response) => {
            return response.status(200).render('link');
        });

        /* Authenticating */
        this.router.get('/login', (request, response) => {
            return response.status(200).redirect("https://discord.com/api/oauth2/authorize?client_id=717826033096589376&redirect_uri=http%3A%2F%2Flocalhost%2Fauthredir&response_type=code&scope=identify");
        });

        this.router.get('/authredir', async (request, response) => {
            let code = request.query.code
            if (code) {
                try {
                    const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                        method: 'POST',
                        body: new URLSearchParams({
                            client_id: process.env.DISCORD_ID,
                            client_secret: process.env.DISCORD_SECRET,
                            code,
                            grant_type: 'authorization_code',
                            redirect_uri: `http://localhost/authredir`,
                            scope: 'identify',
                        }),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    });
        
                    const oauthData = await oauthResult.json();
                    response.cookie('access_token', oauthData.access_token, {maxAge: oauthData.expires_in})
                    response.cookie('refresh_token', oauthData.refresh_token, {maxAge: 9999999999999})
                } catch (error) {
                    console.log(error);
                    // NOTE: An unauthorized token will not throw an error;
                    // it will return a 401 Unauthorized response in the try block above
                    return response.redirect('../')
                }
            }

            return response.status(200).redirect('../link');
        });
    };

    getRouter() {
        return this.router;
    };
}