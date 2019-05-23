class SaleImport {
    constructor(fdb) {
        this.sales = [];
        this.fdb = fdb;
    }

    clean() {
        var _this = this;
        return Db.deleteAll(DbConfig.allSalesDb).then(() => console.log("deleted"), () => console.log("error on delete all"));
    }

    cleanAndLoad() {
        var _this = this;
        return Db.deleteAll(DbConfig.allSalesDb).then(() => { console.log("deleted"); _this.load(); }, () => console.log("error on delete all"));
    }

    load() {
        var _this = this;
        return new Promise(resolve => {
            _this.fdb.collection("sales").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    _this.sales.push($.extend(doc.data(), { _id: doc.id }));
                });
                console.log("loaded sales from firestore",_this.sales.length);
                _this.parse();
            });
        });
    }

    parse() {
        var _this = this;
        return new Promise(resolve => {

            //get act Sales
            Sale.getList().then(dbSales => {

                console.log("dbSales",dbSales);
                var bulk = [];

                _this.sales.forEach(isale => {
                    console.log("isale", isale);

                    if(isale) {
                        
                        var articles = [];
                        var articleSum = 0.0;
                        if(isale.articles) {
                            isale.articles.forEach(ia => {
                                var a = {
                                    article: {
                                        _id: ia.articleId,
                                        title: ia.articleText,
                                        price: ia.singlePrice
                                    },
                                    amount: ia.amount
                                };
                                articles.push(a);

                                articleSum += ia.singlePrice * ia.amount;
                            });
                        }

                        var sale = {
                            _id: isale._id,
                            person: isale.personId.length > 0 ? {
                                _id: isale.personId,
                                fullName: isale.personLastName + " " + isale.personFirstName,
                                nameWithGroup: isale.personLinkName || (isale.personLastName + " " + isale.personFirstName)
                            } : {
                                _id: "bar",
                                fullName: "Barverkauf",
                                nameWithGroup: "Barverkauf"
                            },

                            articles: articles,
                            articleSum: articleSum,

                            saleDate: isale.dayStr + " 00:00:00",
                            payDate: isale.payed === 1 ? isale.dayStr + " 00:00:00" : null
                        };

                        var dbSale = dbSales.find(dba => dba._id === sale._id);
                        
                        if(!dbSale) {
                            dbSale = new Sale();
                            dbSale = $.extend(dbSale,sale);
                            bulk.push(dbSale.getDbDoc());
                            
                        }
                        else if(false) {
                            dbSale = $.extend(dbSale,sale);
                            dbSale.save();                    
                        }
                    }
                });

                DbConfig.allSalesDb.bulkDocs(bulk).then(() => {
                    Sale.calculateTops().then(resolve);
                });
            });            
        });
    }
}