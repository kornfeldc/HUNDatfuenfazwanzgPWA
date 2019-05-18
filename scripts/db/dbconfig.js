class DbConfig {
    
    static REPLICATED = false;
    static USESYNC = true;
    
    static PERSONDBNAME = "persons";
    static ARTICLEDBNAME = "articles";
    static SALEDBNAME = "sales";

    static personDb = null;
    static remotePersonDb = null;
    static articleDb = null;
    static remoteArticleDb = null;
    static saleDb = null;
    static remoteSaleDb = null;
    
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

            if(DbConfig.personDb === null && DbConfig.getGroupInfo()) {
                var groupInfo = DbConfig.getGroupInfo();
                
                DbConfig.personDb = new PouchDB(`${groupInfo.db}-${DbConfig.PERSONDBNAME}`);
                DbConfig.articleDb = new PouchDB(`${groupInfo.db}-${DbConfig.ARTICLEDBNAME}`);
                DbConfig.saleDb = new PouchDB(`${groupInfo.db}-${DbConfig.SALEDBNAME}`);
                
                if(DbConfig.USESYNC) {
                    DbConfig.remotePersonDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.PERSONDBNAME}`)
                    DbConfig.remoteArticleDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ARTICLEDBNAME}`)
                    DbConfig.remoteSaleDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.SALEDBNAME}`)
                
                    DbConfig.personDb.sync(DbConfig.remotePersonDb).on("complete", () => {
                        DbConfig.articleDb.sync(DbConfig.remoteArticleDb).on("complete", () => {
                            DbConfig.saleDb.sync(DbConfig.remoteSaleDb).on("complete", () => {

                                //setup live sync
                                DbConfig.personDb.sync(DbConfig.remotePersonDb,{ live: true}).on("change", () => {  });
                                DbConfig.articleDb.sync(DbConfig.remoteArticleDb,{ live: true}).on("change", () => {  });
                                DbConfig.saleDb.sync(DbConfig.remoteSaleDb,{ live: true}).on("change", () => {  });

                                resolve();
                            });
                        });
                    });
                }
                else
                    resolve();
            }
            else
                resolve();
        });
    }

    static logout() {
        storage.clear("group");
        DbConfig.personDb = null;
        DbConfig.articleDb = null;
        DbConfig.saleDb = null;
        DbConfig.remotePersonDb = null;
        DbConfig.remoteArticleDb = null;
        DbConfig.remoteSaleDb = null;
    }
}