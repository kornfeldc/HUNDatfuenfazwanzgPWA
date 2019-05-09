class Article extends BaseModel {
    constructor(db) {
        super(DbConfig.articleDb)
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;
        this.map = ["title", "type", "price", "isFavorite"];
    }

    static getTypes() {
        return [
            { id: "alcoholic", title: "Getränk - Alkoholisch", shortTitle: "Alkoholisch" },
            { id: "nonalcoholic", title: "Getränk - Antialkoholisch", shortTitle: "Antialkoholisch" },
            { id: "snack", title: "Snack", shortTitle: "Snacks" }
        ];
    }

    static getList(search) {
        return Db.getList(DbConfig.articleDb, Article, (a,b)=> {
            if (a.title < b.title)
                return -1;
            if ( a.title > b.title)
                return 1;
            return 0;
        }, (article) => {
            return !search || article.title.toLowerCase().indexOf(search.toLowerCase()) >= 0;
        });
    }

    static get(id) {
        return Db.getEntity(DbConfig.articleDb, Article, id);
    }
}