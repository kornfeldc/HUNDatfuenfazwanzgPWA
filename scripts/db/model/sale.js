class Sale extends BaseModel {
    constructor(db) {
        super(saleDb)
        this.person = {
            _id: "",
            name: ""
        };
        this.articles = [];
        this.saleDate = moment().format("DD.MM.YYYY HH:mm:ss");
        this.payDate = null;
        this.map = ["person", "articles", "saleDate", "payDate"];
    }
}