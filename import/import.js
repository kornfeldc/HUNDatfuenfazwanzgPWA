class Import {
    constructor() {        
        var config = IMPORTCONFIG.db;
        var _this = this;
        DbConfig.parse(config);

        console.log("CheckDb OK");

        DbConfig.initDb().then(()=> {
            console.log("Db initialized");

            var firebaseConfig = IMPORTCONFIG.firebase;
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
                
            var fdb = firebase.firestore();

            //var articleImport = new ArticleImport(fdb);
            //articleImport.load();

            //var personImport = new PersonImport(fdb);
            //personImport.load();

            //var saleImport = new SaleImport(fdb);
            //(saleImport.cleanAndLoad();
            //Sale.calculateTops().then(console.log("tops recalculated"));
        });
    }
}