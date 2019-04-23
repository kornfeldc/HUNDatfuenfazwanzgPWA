const ArticlesPage = {
    template: `
    <div class="p-std">
        <div class="above_actions">
            <article-line v-for="entry in articles" :article="entry" v-on:click="open(entry)" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button class="button is-link" @click="open">Neuer Artikel</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            articles: []
        };
    },
    mounted() {
        var app = this;
        this.load();
    },
    methods: {
        load() {
            var app = this;
            db.getArticles().then(articles => {
                app.articles = articles;    
            });
        },
        open(entry) {
            router.push({ path: 'article/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}