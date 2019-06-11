import * as Config from './config'

import * as mysql from 'mysql'

export default class DbManager {

    connection;

    constructor() {
        this.connection = mysql.createConnection({
            host: Config.DB_HOST,
            port: Config.DB_PORT,
            database: Config.DB_DATABASE,
            user: Config.DB_USER,
            password: Config.DB_PASSWORD
        });
    }

    connect() {
        this.connection.connect();
    }

    disconnect() {
        this.connection.end();
    }
}