class Db {

    static getEntity(queryDb, model, id) {
        return new Promise((resolve,reject) => {
            queryDb.get(id).then(doc => {
                var entity = new model();
                entity.load(doc);
                resolve(entity);
            });
        });
    }

    static getList(queryDb, model, sort) {
        return new Promise((resolve,reject) => {
            queryDb.allDocs({ include_docs: true }).then(docs => {

                var list = [];
                docs.rows.forEach(row => { 
                    var entity = new model();
                    entity.load(row.doc);
                    list.push(entity);
                });
                sort && list.sort(sort);
                resolve(list);
            });
        });
    }
}