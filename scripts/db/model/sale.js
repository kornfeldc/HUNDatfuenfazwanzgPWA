class Sale extends BaseModel {
    constructor(db) {
        super(DbConfig.actSalesDb)        
        this.person = null; 
        this.articles = [];
        /*
        this.articles[
            {
                article: {
                    _id: "",
                    title: "Bier",
                    price: 2
                },
                amount: 2
            }
        ];
        */

        this.saleDate = moment().format("DD.MM.YYYY HH:mm:ss");
        this.payDate = null;
        
        this.articleSum = 0.0;
        this.inclTip = 0.0;
        this.given = 0.0;

        this.toPay = 0.0;
        this.toReturn = 0.0;

        this.usedCredit = false;
        this.personCreditBefore = 0.0;
        this.personCreditAfter = 0.0;
        
        this.addAdditionalCredit = 0.0;

        this.map = ["person", "articles", "saleDate", "payDate","articleSum", "inclTip", "given", "toPay", "toReturn", "usedCredit", "personCreditBefore", "personCreditAfter", "addAdditionalCredit"];
    }

    copy(db) {
        var c = new Sale(db);
        c = Sale.setProps(this, c);
        return c;
    }

    static setProps(from, to) {
        to._id = from._id;
        to.person = from.person;
        to.articles = from.articles;
        to.saleDate = from.saleDate;
        to.payDate = from.payDate;
        to.articleSum = from.articleSum;
        to.inclTip = from.inclTip;
        to.given = from.given;
        to.toPay = from.toPay;
        to.toReturn = from.toReturn;
        to.usedCredit = from.usedCredit;
        to.personCreditBefore = from.personCreditBefore;
        to.personCreditAfter = from.personCreditAfter;
        to.addAdditionalCredit = from.addAdditionalCredit;
        return to;
    }

    setPerson(person) {
        if(!this.person) this.person = {};
        this.person._id = person._id;
        this.person.fullName = person.fullName;
        this.person.nameWithGroup = person.nameWithGroup || person.fullName;
    }

    calculate() {
        var _this = this;
        var copy = JSON.parse(JSON.stringify(_this.articles));
        _this.articles = [];
        copy.filter(c => c.amount > 0).forEach(c => _this.articles.push(c));
        _this.articleSum = 0;
        _this.articles.forEach(a => _this.articleSum += a.article.price * a.amount);
    }

    get saleDayShort() {
        return moment(this.saleDate, "DD.MM.YYYY HH:mm:ss").format("DD.MM.");
    }

    remove() {
        var _this = this;
        return new Promise((resolve, reject) => {
            if(_this.db === DbConfig.actSalesDb) {
                //remove from both databases
                console.log("remove from both databases");

                Db.getEntity(DbConfig.allSalesDb, Sale, _this._id)
                    .then(allsale => {
                        DbConfig.allSalesDb.remove(allsale.doc).then(() => {
                            super.remove().then(() => resolve());
                        });
                    })
                    .catch(() => {
                        super.remove().then(() => resolve());
                    });
            }
            else 
                super.remove().then(() => resolve());
        });
    }

    save() {
        var _this = this;
        return new Promise((resolve,reject) => {
            super.save().then(() => {

                if(_this.db === DbConfig.actSalesDb) {

                    //check if sale exists in allSales
                    Db.getEntity(DbConfig.allSalesDb, Sale, _this._id)
                        .then(allsale => {
                            console.log("actsale found in allSales");
                            allsale = Sale.setProps(_this, allsale);
                            DbConfig.allSalesDb.put(allsale.toDoc()).then(() => {
                                resolve();
                                //start async calculation
                                if(_this.isPayed) {
                                    setTimeout(function() {
                                        Sale.calculateTops();
                                    });
                                }        
                            });
                        })
                        .catch(() => {
                            console.log("actsale NOT found in allSales");
                            var copiedSale = _this.copy(DbConfig.allSalesDb);
                            DbConfig.allSalesDb.put(copiedSale.toObj()).then(() => {
                                resolve();
                                //start async calculation
                                if(_this.isPayed) {
                                    setTimeout(function() {
                                        Sale.calculateTops();
                                    });
                                }        
                            });
                        });
                }
                else {
                    console.log("save saved just to allDb");
                    resolve();
                    //start async calculation
                    if(_this.isPayed) {
                        setTimeout(function() {
                            Sale.calculateTops();
                        });
                    }
                }
            });
        });
    }
   
    get sum() {
        return 0;
    }

    get isPayed() {
        return this.payDate !== null;
    }

    get isToday() {
        return this.saleDateDay  === moment().format("DD.MM.YYYY");
    }

    get isAct() {
        return this.isToday || !this.isPayed;
    }

    get salePayDateDay() {
        if(this.payDate !== null)
            return moment(this.payDate,"DD.MM.YYYY HH:mm:SS").format("DD.MM.YYYY");
        return "";
    }

    get saleDateDay() {
        return moment(this.saleDate,"DD.MM.YYYY HH:mm:SS").format("DD.MM.YYYY");
    }

    get saleDateAsNr() {
        return parseInt(moment(this.saleDate, "DD.MM.YYYY HH:mm:ss").format("YYYYMMDD"),10);
    }

    static getAllSalesList() {
        return Sale.getList(DbConfig.allSalesDb);
    }

    static getList(db) {
        return Db.getList(db || DbConfig.actSalesDb, Sale, (a,b)=> {
            return 0;
        });
    }

    static getListFiltered(filter) {
        var _this = this;
        return new Promise((resolve,reject) => {
            
            performance.mark("saleListFiltered_getList");

            var getter = filter.day === moment().format("DD.MM.YYYY") ?
                Sale.cleanAndGetActList :
                Sale.getAllSalesList;

            getter().then(allSales => {
                performance.measure("saleListFiltered_getList", "saleListFiltered_getList");
                performance.mark("saleListFiltered_filter");

                if(filter.day === moment().format("DD.MM.YYYY")) {
                    //toda: get all opened + all done for today
                    allSales = allSales.filter(sale =>
                        !sale.isPayed || (sale.saleDateDay === filter.day || sale.salePayDateDay == filter.day)
                    );
                }
                else 
                    allSales = allSales.filter(sale => sale.saleDateDay === filter.day);

                _this.sortSales(allSales);
                _this.addSpecialProperties(allSales);

                performance.measure("saleListFiltered_filter", "saleListFiltered_filter");
                console.log(performance.getEntriesByType("measure"));
                resolve(allSales);
            });
        });
    }

    static getOpenedSaleForPerson(person) {
        var _this = this;
        return new Promise((resolve,reject) => {
            _this.getList().then(allSales => {
                var sale = allSales.find(sale => !sale.isPayed && sale.person._id === person._id);
                resolve(sale);
            });
        });
    }

    static sortSales(sales) {
        //sort: opened, day, name
        sales.sort(
            firstBy("isPayed")
            .thenBy("saleDateAsNr",-1)
            .thenBy("person.NameWithGroup")
        );
    }

    static addSpecialProperties(sales) {
        for(var i = 0; i < sales.length; i++) {
            if(!sales[i].isPayed && i == 0)
                sales[i].isFirstUnpayed = true;
            if(sales[i].isPayed && (i == 0 || !sales[i-1].isPayed))
                sales[i].isFirstPayed = true;
        }
    }

    static get(id) {
        return new Promise((resolve, reject) => {
            Db.getEntity(DbConfig.actSalesDb, Sale, id)
                .then(x => resolve(x))
                .catch(() => {
                    Db.getEntity(DbConfig.allSalesDb, Sale, id)
                        .then(x => resolve(x))
                        .catch(() => reject());        
                });
        });
    }

    static getDayList() {
        var _this = this;
        return new Promise((resolve,reject) => {
            _this.getList(DbConfig.allSalesDb).then(allSales => {
                var dayList = [];

                allSales.forEach(sale => {
                    var dayEntry = dayList.find(de => de.day === sale.saleDateDay);
                    if(!dayEntry) {
                        dayEntry = {
                            day: sale.saleDateDay,
                            dayNr: sale.saleDateAsNr,
                            dayText: sale.isToday ? "HEUTE" : moment(sale.saleDateDay,"DD.MM.YYYY").format("dd, DD.MM.YYYY"),
                            topay: sale.isPayed ? 0 : sale.articleSum,
                            payed: sale.isPayed ? sale.articleSum : 0
                        };
                        dayList.push(dayEntry);
                    }
                    else {
                        dayEntry.topay += sale.isPayed ? 0 : sale.articleSum;
                        dayEntry.payed += sale.isPayed ? sale.articleSum : 0;
                    }
                });

                //check if today is in list
                if(!dayList.find(dayEntry => dayEntry.day === moment().format("DD.MM.YYYY"))) {
                    dayList.push(
                        {
                            day: moment().format("DD.MM.YYYY"),
                            dayNr: moment().format("YYYYMMDD"),
                            dayText: "HEUTE",
                            topay: 0,
                            payed: 0
                        }
                    );
                }


                dayList.sort(firstBy("dayNr",-1));
                resolve(dayList);
            });
        });
    }

    static calculateTops() {
        var _this = this;
        
        //reference Day for Tops (last 6 months)
        var referenceDayAsNr = parseInt(moment().add({months: -6}).format("YYYYMMDD"),0);

        return new Promise((resolve,reject) => {
            performance.mark("calculateTops");
            _this.getList(DbConfig.allSalesDb).then(allSales => {
                
                var topSales = allSales.filter(sale => sale.saleDateAsNr >= referenceDayAsNr);
                Person.getList().then(persons => {
                    Article.getList().then(articles => {

                        var bulk = [];

                        persons.forEach(person => {
                            //calculate all person salescounts and tops
                            var personAllSales = allSales.filter(s => s.person && s.person._id === person._id);
                            var personTopSales = topSales.filter(s => s.person && s.person._id === person._id);

                            var articleCounts = {};
                            var topArticleCounts = {};
                            var saleCount = personAllSales ? personAllSales.length : 0;
                            var topSaleCount = personTopSales ? personTopSales.length : 0;
                            var saleSum = 0.0;
                            var topSaleSum = 0.0;

                            personAllSales && personAllSales.forEach(s => {
                                saleSum += s.articleSum;
                                s.articles && s.articles.forEach(sa => {
                                    var aid = sa.article._id;
                                    if(!articleCounts[aid])
                                        articleCounts[aid] = 0;
                                    articleCounts[aid] += sa.amount;
                                });
                            });
                            personTopSales && personTopSales.forEach(s => { 
                                topSaleSum += s.articleSum;
                                s.articles && s.articles.forEach(sa => {
                                    var aid = sa.article._id;
                                    if(!topArticleCounts[aid])
                                        topArticleCounts[aid] = 0;
                                    topArticleCounts[aid] += sa.amount;
                                });
                            });

                            if(
                                JSON.stringify(person.articleCounts) != JSON.stringify(articleCounts) ||
                                JSON.stringify(person.topArticleCounts) != JSON.stringify(topArticleCounts) ||
                                person.saleCount != saleCount ||
                                person.topSaleCount != topSaleCount ||
                                person.saleSum != saleSum ||
                                person.topSaleSum != topSaleSum
                            ) {
                                console.log("person changed", person.fullName);
                                person.articleCounts = articleCounts;
                                person.topArticleCounts = topArticleCounts;
                                person.saleCount = saleCount;
                                person.topSaleCount = topSaleCount;
                                person.saleSum = saleSum;
                                person.topSaleSum = topSaleSum;
                                bulk.push(person.getDbDoc());
                            }
                        });

                        DbConfig.personsDb.bulkDocs(bulk).then(() => {
                            performance.measure("calculateTops", "calculateTops");
                            console.log(performance.getEntriesByType("measure"));
                            resolve();
                        });
                    });
                });

            });
        });
    }

    static cleanAndGetActList() {
        return new Promise((resolve, reject) => {
            Sale.getList(DbConfig.actSalesDb).then(actSales => {
                var retSales = [];
                var deleteSales = [];
                (actSales||[]).forEach(sale => {
                    if(sale.isAct) 
                        retSales.push(sale);
                    else {
                        sale._deleted = true;
                        deleteSales.push(sale.getDbDoc());
                    }
                });

                if(deleteSales.length > 0) {
                    console.log("actSales for removing", deleteSales);
                    DbConfig.actSalesDb.bulkDocs(deleteSales).then(() => resolve(retSales));
                }
                else {
                    console.log("no actSales for removing");
                    resolve(retSales);
                }
            });
        });
    }

    static migrateOpended() {
        Sale.getAllSalesList().then(allSales => {
            Sale.cleanAndGetActList().then(actSales => {
                var filteredAll = allSales.filter(as => as.isAct);
                filteredAll.forEach(fa => {
                    if(!actSales.find(as => as._id === fa._id)) {
                        //copy from all sale to act sale
                        var copiedSale = fa.copy(DbConfig.actSalesDb);
                        console.log("sale for migration", copiedSale);
                        DbConfig.actSalesDb.put(copiedSale.toObj());
                    }
                });
            });
        });
    }
}