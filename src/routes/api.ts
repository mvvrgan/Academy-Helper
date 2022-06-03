import * as express from "express";
import * as fs from "fs";

export class Router {
    server: any
    router: any

    constructor(server: any) {
        this.server = server;
        this.router = express.Router()

        // Root Route
        this.router.get('/', (request, response) => {
            return response.status(200).send({
                message: 'API Online'
            });
        });

        // Other API Routes
        fs.readdir(`src/endpoints`, (err, files) => {
            files.forEach(file => {
                let filename = file.split('.').slice(0, -1).join('.');
                let path = `../endpoints/${file}`;
                
                require(path).initiate(this.router, filename)
            });
        });
    };

    getRouter() {
        return this.router;
    };
}