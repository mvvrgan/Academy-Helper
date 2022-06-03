import * as express from "express";
import * as path from 'path';

import * as index from '../routes/index';
import * as api from '../routes/api';

/* Functions */
export function start (port: number) {
    this.app = express();

    //
    this.app.use(function (request, response, next) { response.removeHeader('X-Powered-By'); next(); })
    this.app.use(express.json())

    // Routes
    this.app.use('/', new index.Router(this).getRouter());
    this.app.use('/api', new api.Router(this).getRouter());
    this.app.use('/assets', express.static(__dirname + '/assets'));

    // Front end
    this.app.set('views', path.join(__dirname, '../views'))
    this.app.set('view engine', 'ejs')
    this.app.set('trust proxy', 1)

    this.app.listen(port, () => console.log(`[SERVER] Listening on port: ${port}.`))
}