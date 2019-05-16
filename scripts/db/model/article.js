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
            { id: "alcoholic", title: "Getränk - Alkoholisch", shortTitle: "Alk." },
            { id: "nonalcoholic", title: "Getränk - Antialkoholisch", shortTitle: "Antialk." },
            { id: "snack", title: "Snack", shortTitle: "Snacks" }
        ];
    }

    static getList(search, tab, sale, person) {

        //TODO get person from sale and sort/filter by person specific TOP

        return Db.getList(DbConfig.articleDb, Article, (a,b)=> {
            if(tab === "top") {
                
                var ac = 0;
                var bc = 0;

                if(person && person.topArticleCounts && person.topArticleCounts[a._id])
                    ac = person.topArticleCounts[a._id];
                if(person && person.topArticleCounts && person.topArticleCounts[b._id])
                    bc = person.topArticleCounts[b._id];

                if (ac > bc)
                    return -1;
                if ( ac < bc)
                    return 1;
                return 0;
            }
            else {
                if (a.title < b.title)
                    return -1;
                if ( a.title > b.title)
                    return 1;
                return 0;
            }
        }, (article) => {
            var ret = true;
            if(tab === "favorites") 
                ret = article.isFavorite;
            else if(tab === "top")
                ret = person && person.topArticleCounts && person.topArticleCounts[article._id] && person.topArticleCounts[article._id] > 0;
            else if(tab)
                ret = article.type === tab;

            return (ret && !search) || (search && article.title.toLowerCase().indexOf(search.toLowerCase()) >= 0);
        });
    }

    static get(id) {
        return Db.getEntity(DbConfig.articleDb, Article, id);
    }
}