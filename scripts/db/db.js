class Db {

    static getEntity(queryDb, model, id) {
        return new Promise((resolve,reject) => {
            queryDb.get(id).then(doc => {
                var entity = new model();
                entity.load(doc);
                resolve(entity);
            }, () => reject());
        });
    }

    static getList(queryDb, model, sort, filter) {
        return new Promise((resolve,reject) => {
            queryDb.allDocs({ include_docs: true }).then(docs => {

                var list = [];
                docs.rows.forEach(row => { 
                    var entity = new model();
                    entity.load(row.doc);

                    if(!filter || (filter && filter(entity)))
                        list.push(entity);
                });

                sort && list.sort(sort);
                resolve(list);
            });
        });
    }
}
