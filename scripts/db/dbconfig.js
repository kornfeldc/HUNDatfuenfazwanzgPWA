class DbConfig {
    
    static REPLICATED = false;
    
    static GROUPDBNAME = "groups";

    static PERSONDBNAME = "persons";
    static ARTICLEDBNAME = "articles";
    static SALEDBNAME = "sales";

    static groupDb = new PouchDB(DbConfig.GROUPDBNAME);
    static remoteGroupDb;

    static personDb = null;
    static remotePersonDb = null;
    static articleDb = null;
    static remoteArticleDb = null;
    static saleDb = null;
    static remoteSaleDb = null;
    
    constructor() {

        /*

        this.groupInfo = null;
        this.url = url;

        var actGroupInfo = storage.get("group");
        if(actGroupInfo && actGroupInfo) 
            this.groupInfo = actGroupInfo;
        
        this.groupDb = new PouchDB(DbConfig.GROUPDBNAME);
        this.remoteGroupDb = new PouchDB(`${DbConfig.BASEURL}${DbConfig.GROUPDBNAME}`);
        this.groupDb.sync(this.remoteGroupDb).on("complete", () => {
            console.log("pdbsynced");
        });        */


    }

    static isLoggedIn() {
        var groupInfo = DbConfig.getGroupInfo();
        var loggedIn = groupInfo && groupInfo.db && groupInfo.db.length > 0;
        if(loggedIn)
            DbConfig.initDb();
        return loggedIn;
    } 

    static getGroupInfo() {
        return storage.get("group");
    }

    static checkDb(url, email) {
        return new Promise((resolve,reject) => {
            DbConfig.remoteGroupDb = new PouchDB(`${url}${DbConfig.GROUPDBNAME}`);
            DbConfig.groupDb.sync(DbConfig.remoteGroupDb).on("complete", () => {
                console.log("synced");
                DbConfig.groupDb.allDocs({include_docs:true}).then(docs => {
                    if(docs && docs.rows) {
                        var entry = docs.rows.find(r => r.doc.access.split(',').includes(email));
                        if(entry) {
                            storage.set("group", {
                                db: entry.doc.db,
                                title: entry.doc.title,
                                url: url
                            });
                            resolve();
                        }
                        else
                            reject();
                    }
                    else
                        reject();
                });
            });
        });
    }

    static initDb() {
        if(DbConfig.personDb === null && DbConfig.getGroupInfo()) {
            var groupInfo = DbConfig.getGroupInfo();
            
            DbConfig.personDb = new PouchDB(`${groupInfo.db}-${DbConfig.PERSONDBNAME}`);
            DbConfig.articleDb = new PouchDB(`${groupInfo.db}-${DbConfig.ARTICLEDBNAME}`);
            DbConfig.saleDb = new PouchDB(`${groupInfo.db}-${DbConfig.SALEDBNAME}`);
            
            DbConfig.remotePersonDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.PERSONDBNAME}`)
            DbConfig.remoteArticleDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.ARTICLEDBNAME}`)
            DbConfig.remoteSaleDb = new PouchDB(`${groupInfo.url}${groupInfo.db}-${DbConfig.SALEDBNAME}`)

            DbConfig.personDb.sync(DbConfig.remotePersonDb,{ live: true});
            DbConfig.articleDb.sync(DbConfig.remoteArticleDb,{ live: true});
            DbConfig.saleDb.sync(DbConfig.remoteSaleDb,{ live: true});
        }
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

//var dbConfig = new DbConfig();

/*
const REPLICATED = true;

const USERDB = "users";

//const BASEURL = "http://127.0.0.1:5984/";
const BASEURL = "https://couchdb-667a56.smileupps.com/";
const PERSONDB = "og125persons";
const ARTICLEDB = "og125articles";
const SALEDB = "og125sales";

var personDb = new PouchDB(PERSONDB);
var remotePersonDb = new PouchDB(`${BASEURL}${PERSONDB}`);

var articleDb = new PouchDB(ARTICLEDB);
var remoteArticleDb = new PouchDB(`${BASEURL}${ARTICLEDB}`);

var saleDb = new PouchDB(SALEDB);
var remoteSaleDb = new PouchDB(`${BASEURL}${SALEDB}`);

if(REPLICATED) {
    personDb.sync(remotePersonDb,{ live: true});
    articleDb.sync(remoteArticleDb,{ live: true});
    saleDb.sync(remoteSaleDb,{ live: true});
}
else {
    personDb.replicate.to(remotePersonDb);
    articleDb.replicate.to(remoteArticleDb);
    saleDb.replicate.to(remoteSaleDb);
}
*/