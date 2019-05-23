class ArticleImport {
    constructor(fdb) {
        this.articles = [];
        this.fdb = fdb;
    }

    load() {
        var _this = this;
        return new Promise(resolve => {
            _this.fdb.collection("articles").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    _this.articles.push($.extend(doc.data(), { _id: doc.id }));
                });
                console.log("loaded articles from firestore",_this.articles.length);
                _this.parse();
            });
        });
    }

    parse() {
        var _this = this;
        return new Promise(resolve => {

            //get act Articles
            Article.getList().then(dbArticles => {

                console.log("dbArticles",dbArticles);

                var bulk = [];

                _this.articles.forEach(iarticle => {
                    console.log("iarticle", iarticle);

                    if(iarticle.category && iarticle.category.length > 0) {
                        var type = iarticle.category;
                        if(type == "meal" || type == "sweet")
                            type = "snack";

                        var article = {
                            _id: iarticle._id,
                            title: iarticle.title,
                            price: iarticle.price,
                            isFavorite: iarticle.favorite == 1,
                            type: type
                        };

                        var dbArticle = dbArticles.find(dba => dba._id === article._id);
                        console.log("dbArticle",dbArticle);
                        if(!dbArticle) {
                            dbArticle = new Article();
                            dbArticle = $.extend(dbArticle,article);
                            bulk.push(dbArticle.getDbDoc());     
                        }
                        else if(dbArticle.title !== article.title || dbArticle.price !== article.price) {
                            dbArticle = $.extend(dbArticle,article);
                            bulk.push(dbArticle.getDbDoc());
                        }
                    }
                    else
                        console.log("article blocked, no category");
                });

                console.log("bulkdocs", bulk);
                DbConfig.articlesDb.bulkDocs(bulk);

                resolve();
            });            
        });
    }
}