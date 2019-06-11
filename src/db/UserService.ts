import BaseService from "./BaseService";

export default class UserService extends BaseService {

    findAllUsers() {

        const strQuery = "select * from seafood_user";

        return this.executeSql(strQuery);
    }

    async promiseTest() {
        return new Promise((resolve => {
            resolve("this is promise test");
        }))
    }

    addUser({name, age}) {

        let addSql = 'INSERT INTO seafood_user(name, age) VALUES (?, ?) ';
        let addSqlParams = [name, age];

        return this.executeSql(addSql, addSqlParams);
    }

    updateUser({id, name, age}) {

        let sql = 'update seafood_user set name = ?, age = ? where id = ?';
        let params = [name, age, id];

        return this.executeSql(sql, params);
    }

    deleteUser(id) {
        let sql = 'delete from seafood_user where id = ?';
        let params = [id];

        return this.executeSql(sql, params);
    }
}