var db = {

    getPersons() {
        return new Promise((resolve,reject) => {
            personDb.allDocs({ include_docs: true }).then(docs => {

                var persons = [];
                docs.rows.forEach(row => { 
                    var person = new Person();
                    person.load(row.doc);
                    persons.push(person);
                });

                persons.sort((a,b) => {
                    if (a.fullName < b.fullName)
                        return -1;
                    if ( a.fullName > b.fullName)
                        return 1;
                    return 0;
                });

                resolve(persons);
            });
        });
    },

    getArticles() {
        return new Promise((resolve,reject) => {
            articleDb.allDocs({ include_docs: true }).then(docs => {

                var articles = [];
                docs.rows.forEach(row => { 
                    var article = new Article();
                    article.load(row.doc);
                    articles.push(article);
                });

                articles.sort((a,b) => {
                    if (a.title < b.title)
                        return -1;
                    if ( a.title > b.title)
                        return 1;
                    return 0;
                });

                resolve(articles);
            });
        });
    },

    getSales() {
        return new Promise((resolve,reject) => {
            saleDb.allDocs({ include_docs: true }).then(docs => {

                var sales = [];
                docs.rows.forEach(row => { 
                    var sale = new Sale();
                    sale.load(row.doc);
                    sales.push(sale);
                });

                sales.sort((a,b) => {
                    //todo
                    return 0;
                });

                resolve(sales);
            });
        });
    }
};