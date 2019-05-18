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
            performance.mark("allDocs");
            queryDb.allDocs({ include_docs: true }).then(docs => {

                performance.measure("measure all docs","allDocs");
                performance.mark("loadDocs");

                var list = [];
                docs.rows.forEach(row => { 
                    var entity = new model();
                    entity.load(row.doc);

                    if(!filter || (filter && filter(entity)))
                        list.push(entity);
                });

                performance.measure("measure loadDocs", "loadDocs");
                performance.mark("sort");

                sort && list.sort(sort);
                performance.measure("sort", "sort");

                console.log(performance.getEntriesByType("measure"));

                resolve(list);
            });
        });
    }

    static deleteAll(queryDb) {
        return new Promise((resolve, reject) =>  {
            queryDb.allDocs({ include_docs: true }).then(docs => {
                var list = [];
                docs.rows.forEach(row => { 
                    row.doc._deleted = true;
                    list.push(row.doc);
                });
                console.log("list to delete", list);
                queryDb.bulkDocs(list).then(resolve, reject);
            });
        });
    }
}
