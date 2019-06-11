import {BaseService} from "./BaseService";

export class UserService extends BaseService {

    async findAllUsers(callback) {

        this.connect();

        const strQuery = "select * from seafood_user";

        return await this.connection.query(strQuery, (err, result) => {
            this.disconnect();

            if (err) {
                throw err;
            }

            console.log(result);
            callback(result);
        });
    }

    addUser(user, callback?) {
        let addSql = 'INSERT INTO seafood_user(name, age) VALUES (?, ?) ';
        let addSqlParams = [user.name, user.age];

        this.connection.query(addSql, addSqlParams, callback);
    }
}