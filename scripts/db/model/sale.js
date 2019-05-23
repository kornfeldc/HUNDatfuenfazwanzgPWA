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

        this.map = ["person", "articles", "saleDate", "payDate","articleSum"];
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

    save() {
        var _this = this;
        return new Promise((resolve,reject) => {
            super.save().then(() => {
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
   
    get sum() {
        return 0;
    }

    get isPayed() {
        return this.payDate !== null;
    }

    get isToday() {
        return this.saleDateDay  === moment().format("DD.MM.YYYY");
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

    static getList(db) {
        return Db.getList(db || DbConfig.actSalesDb, Sale, (a,b)=> {
            return 0;
        });
    }

    static getListFiltered(filter) {
        var _this = this;
        return new Promise((resolve,reject) => {
            
            performance.mark("saleListFiltered_getList");

            _this.getList().then(allSales => {
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

}