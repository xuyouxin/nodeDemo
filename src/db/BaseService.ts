import * as Config from './config'

const mysql = require('mysql');

export class BaseService {
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