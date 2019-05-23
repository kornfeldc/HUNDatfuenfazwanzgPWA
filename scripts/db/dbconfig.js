class DbConfig {
    
    static PERSONSDBNAME = "persons";
    static ARTICLESDBNAME = "articles";
    static ALLSALESDBNAME = "sales";
    static ACTSALESDBNAME = "actsales";

    static personsDb = null;
    static remotePersonsDb = null;
    static articlesDb = null;
    static remoteArticlesDb = null;
    static allSalesDb = null;
    static remoteAllSalesDb = null;
    static actSalesDb = null;
    static remoteActSalesDb = null;
    
    constructor() {
    }

    static parse(data) {
        return new Promise((resolve, reject) => {
            var config = data;
            storage.set("group", {
                db: config.id,
                title: config.name,
                url: config.dbUrl
            });
            resolve();
        });
    }

    static isLoggedIn() {
        var groupInfo = DbConfig.getGroupInfo();
        return groupInfo && groupInfo.db && groupInfo.db.length > 0;
    } 

    static getLoggedIn(params) {
        var groupInfo = DbConfig.getGroupInfo();
        var loggedIn = groupInfo && groupInfo.db && groupInfo.db.length > 0;
        if(loggedIn) 
            return DbConfig.initDb();
        return null;
    } 

    static getGroupInfo() {
        return storage.get("group");
    }

    static initDb() {
        return new Promise((resolve,reject) => {

            if(DbConfig.personsDb === null && DbConfig.getGroupInfo()) {
                var groupInfo = DbConfig.getGroupInfo();
                
                DbConfig.personsDb = new PouchDB(`${groupInfo.db}-${DbConfig.PERSONSDBNAME}`);
                DbConfig.articlesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ARTICLESDBNAME}`);
                DbConfig.allSalesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ALLSALESSDBNAME}`);
                DbConfig.actSalesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ACTSALESDBNAME}`);
                                
                DbConfig.remotePersonsDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.PERSONSDBNAME}`);
                DbConfig.remoteArticlesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ARTICLESDBNAME}`);
                DbConfig.remoteAllSalesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ALLSALESDBNAME}`);
                DbConfig.remoteActSalesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ACTSALESDBNAME}`);

                console.log("start personSync");
                DbConfig.personsDb.sync(DbConfig.remotePersonsDb, { batch_size: 300})
                    .on("complete", () => {
                        console.log("completed personSync");
                        console.log("start articleSync");
                        DbConfig.articlesDb.sync(DbConfig.remoteArticlesDb, { batch_size: 300})
                            .on("complete", () => {
                                console.log("completed articleSync");
                                console.log("start actSalesSync");
                                DbConfig.actSalesDb.sync(DbConfig.remoteActSalesDb, { batch_size: 300})
                                    .on("complete", () => {
                                        console.log("completed actSalesSync");
                                        
                                        //setup live sync
                                        DbConfig.personsDb.sync(DbConfig.remotePersonsDb,{ live: true}).on("change", () => { console.log("changes in persons"); });
                                        DbConfig.articlesDb.sync(DbConfig.remoteArticlesDb,{ live: true}).on("change", () => { console.log("changes in articles") });
                                        DbConfig.actSalesDb.sync(DbConfig.remoteActSalesDb,{ live: true}).on("change", () => { console.log("chanegs in actSales") });

                                        resolve(); 
                                        //start all sales sync but dont wait for it
                                        console.log("start allSalesSync");
                                        DbConfig.allSalesDb.sync(DbConfig.remoteAllSalesDb, { batch_size: 300})
                                            .on("complete", () => {
                                                console.log("completed allSalesSync");
                                            })
                                            .on("error", (err) => { console.log("error in allSalesSync", err) });

                                        resolve();
                                    })
                                    .on("error", (err) => { console.log("error in articleSync", err) });

                            })
                            .on("error", (err) => { console.log("error in articleSync", err) });

                    })
                    .on("error", (err) => { console.log("error in personSync", err) });
            }
            else
                resolve();
        });
    }

    static logout() {
        storage.clear("group");
        DbConfig.personsDb = null;
        DbConfig.articlesDb = null;
        DbConfig.actSalesDb = null;
        DbConfig.allSalesDb = null;
        DbConfig.remotePersonsDb = null;
        DbConfig.remoteArticlesDb = null;
        DbConfig.remoteActSalesDb = null;    
        DbConfig.remoteAllSalesDb = null;    
    }
}