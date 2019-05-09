class Sale extends BaseModel {
    constructor(db) {
        super(DbConfig.saleDb)        
        this.person = null; 
        this.articles = [];
        this.saleDate = moment().format("DD.MM.YYYY HH:mm:ss");
        this.payDate = null;
        this.articleSum = 0;
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

    static getList() {
        return Db.getList(DbConfig.saleDb, Sale, (a,b)=> {
            return 0;
        });
    }

    static getListFiltered(filter) {
        var _this = this;
        return new Promise((resolve,reject) => {
            _this.getList().then(allSales => {

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

                resolve(allSales);
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
        return Db.getEntity(DbConfig.saleDb, Sale, id);
    }

    static getDayList() {
        var _this = this;
        return new Promise((resolve,reject) => {
            _this.getList().then(allSales => {
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

}