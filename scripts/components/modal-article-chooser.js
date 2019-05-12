Vue.component('modal-article-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Artikel hinzufügen</p>
                <button class="delete" aria-label="close" @click="cancel"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                <search v-model="search" @changed="load" />
                <div class="tabs" v-if="!search || search.length == 0">
                    <ul>
                        <li :class="(tab == 'favorites' ? 'is-active':'')"><a @click="tab = 'favorites'">Favoriten</a></li>
                        <li v-for="at in articleTypes" :class="(tab == at.id ? 'is-active':'')"><a @click="tab = at.id">{{at.shortTitle}}</a></li>
                    </ul>
                </div>
                <sale-article-line v-for="article in articles" :article="article" v-show="showArticle(article)" :sale="sale" :key="article._id" @modify="(article,amount)=>modify(article,amount)"/>
            </section>
            <footer class="modal-card-foot">
                <button-primary @click="ok">OK</button-primary>
                <button-cancel @click="cancel"/>
            </footer>
        </div>
    </div>
    `,
    props: {
        sale: { type: Object }
    },
    data() {
        return {
            search: "",
            resolve: null,
            reject: null,
            articleTypes: Article.getTypes(),
            tab: "favorites",
            articles: [],
            modifications: [],
            render: true
        };
    },
    methods: {
        open() {
            var app = this;
            app.tab = "favorites";
            app.load(); 

            app.modifications = [];
            if(app.sale.articles && app.sale.articles.forEach) {
                app.sale.articles.forEach(sa => {
                    app.modifications.push({
                        article: sa.article,
                        amount: sa.amount
                    });
                });
            }

            console.log("open chooser", app.modifications);
            app.render=false;
            app.$nextTick(()=>app.render=true);

            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        load() {
            var app = this;
            Article.getList(app.search).then(articles => {
                app.articles = articles;
                $(app.$refs.modal).addClass("is-active");
            });  
        },
        showArticle(article) {
            var app = this;
            if(app.search && app.search.length > 0)
                return true;

            if(app.tab === "favorites" && article.isFavorite)
                return true;
            return app.tab === article.type;
        },
        modify(article,amount) {
            var app = this;
            if(app.modifications.find(m => m.article._id === article._id)) 
                app.modifications.find(m => m.article._id === article._id).amount = amount;
            else 
                app.modifications.push({
                    article: article,
                    amount: amount
                });
        },
        ok() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            console.log("article chooser modifications", app.modifications);
            app.resolve(app.modifications);
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        }
    }
 });