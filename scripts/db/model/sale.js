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
        return this.payDate != null;
    }

    static getList() {
        return Db.getList(DbConfig.saleDb, Sale, (a,b)=> {
            return 0;
        });
    }

    static get(id) {
        return Db.getEntity(DbConfig.saleDb, Sale, id);
    }

}