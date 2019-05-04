class Article extends BaseModel {
    constructor(db) {
        super(DbConfig.articleDb)
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;
        this.map = ["title", "type", "price", "isFavorite"];
    }

    get validTypes() {
        return ["alcoholic","nonalcoholoc","snack", "credit"];
    }

    static getList() {
        return Db.getList(DbConfig.articleDb, Article, (a,b)=> {
            if (a.title < b.title)
                return -1;
            if ( a.title > b.title)
                return 1;
            return 0;
        });
    }

    static get(id) {
        return Db.getEntity(DbConfig.articleDb, Article, id);
    }
}