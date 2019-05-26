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

    static sync(localDb, remoteDb, name) {
        return new Promise((resolve, reject) => {
            console.log("start "+name+"Sync");
            $(document).trigger("dbSyncStart", { db: name });

            localDb.sync(remoteDb)
                .then(() => {
                    console.log("completed "+name+"Sync");
                    $(document).trigger("dbSyncStop", { db: name });
                    resolve();
                })
                .catch(() => reject());
        });
    }

    static setupLiveSync() {
        console.log("setup Live Sync");
        DbConfig.personsDb.sync(DbConfig.remotePersonsDb,{ live: true, retry: true }).on("change", ()=> $(document).trigger("dbChanged", { db: "persons" }));
        DbConfig.articlesDb.sync(DbConfig.remoteArticlesDb,{ live: true, retry: true}).on("change", ()=> $(document).trigger("dbChanged", { db: "articles" }));
        DbConfig.actSalesDb.sync(DbConfig.remoteActSalesDb,{ live: true, retry: true}).on("change", ()=> $(document).trigger("dbChanged", { db: "actSales" }));
    }

    static initDb() {
        return new Promise((resolve,reject) => {
            
            if(DbConfig.personsDb === null && DbConfig.getGroupInfo()) {
                var groupInfo = DbConfig.getGroupInfo();
                
                console.log("initDb");

                DbConfig.personsDb = new PouchDB(`${groupInfo.db}-${DbConfig.PERSONSDBNAME}`);
                DbConfig.articlesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ARTICLESDBNAME}`);
                DbConfig.allSalesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ALLSALESSDBNAME}`);
                DbConfig.actSalesDb = new PouchDB(`${groupInfo.db}-${DbConfig.ACTSALESDBNAME}`);
                                
                DbConfig.remotePersonsDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.PERSONSDBNAME}`);
                DbConfig.remoteArticlesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ARTICLESDBNAME}`);
                DbConfig.remoteAllSalesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ALLSALESDBNAME}`);
                DbConfig.remoteActSalesDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ACTSALESDBNAME}`);

                Promise.all([
                    DbConfig.sync(DbConfig.personsDb, DbConfig.remotePersonsDb, "persons"),
                    DbConfig.sync(DbConfig.articlesDb, DbConfig.remoteArticlesDb, "articles"),
                    DbConfig.sync(DbConfig.actSalesDb, DbConfig.remoteActSalesDb, "actSales")
                ])
                .then(() => {
                    console.log("initDb Promises fullfilled");
                    resolve(); //callback to ui
                    DbConfig.setupLiveSync();
                    return DbConfig.sync(DbConfig.allSalesDb, DbConfig.remoteAllSalesDb, "allSales");
                })
                .then(() => {
                    console.log("initDb allSales done");

                    //remove this line later
                    Sale.migrateOpended();

                    return DbConfig.allSalesDb.sync(DbConfig.remoteAllSalesDb,{ live: true, retry: true }).on("change", () => $(document).trigger("dbChanged", { db: "allSales" }));
                })
                .catch((err) => { 
                    console.log("syncError", err); 
                    resolve(); 
                    DbConfig.setupLiveSync(); 
                    DbConfig.allSalesDb.sync(DbConfig.remoteAllSalesDb,{ live: true, retry: true }).on("change", () => $(document).trigger("dbChanged", { db: "allSales" })); 
                });
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