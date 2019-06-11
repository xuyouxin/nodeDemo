import BaseService from "./BaseService";

export default class GoodsService extends BaseService {

    findAllGoods() {

        const strQuery = "select * from seafood_goods";

        return this.executeSql(strQuery);
    }

    addGoods({name, price, num}) {

        let addSql = 'INSERT INTO seafood_goods(name, price, num) VALUES (?, ?, ?) ';
        let addSqlParams = [name, price, num];

        return this.executeSql(addSql, addSqlParams);
    }

    updateGoods({id, name, price, num}) {

        let sql = 'update seafood_goods set name = ?, price = ?, num = ? where id = ?';
        let params = [name, price, num, id];

        return this.executeSql(sql, params);
    }

    deleteGoods(id) {
        let sql = 'delete from seafood_goods where id = ?';
        let params = [id];

        return this.executeSql(sql, params);
    }
}