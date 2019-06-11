export default class BaseService {

    constructor(readonly connection) {
    }

    executeSql(sql, params?) {

        return new Promise((resolve => {
            this.connection.query(sql, params, (err, data) => {
                if (err) {
                    resolve({
                        message: err.message
                    })
                }
                resolve(data);
            });
        }))
    }
}