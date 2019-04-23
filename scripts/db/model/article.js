class Article extends BaseModel {
    constructor(db) {
        super(articleDb)
        this.title = "";
        this.type = "";
        this.price = 0.0;
        this.isFavorite = false;
        this.map = ["title", "type", "price", "isFavorite"];
    }

    get validTypes() {
        return ["alcoholic","nonalcoholoc","snack", "credit"];
    }
}