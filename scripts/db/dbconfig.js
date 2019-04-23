const REPLICATED = true;

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