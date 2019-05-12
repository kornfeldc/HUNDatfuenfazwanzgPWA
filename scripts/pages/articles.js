const ArticlesPage = {
    mixins: [utilMixins],
    template: `
    <page-container>
        <div class="above_actions">
            <search v-model="search" @changed="load" />
            <article-line v-for="entry in articles" :article="entry" v-on:click="open(entry)" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button-primary @click="open">Neuer Artikel</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
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
            Article.getList(app.search).then(articles => {
                app.articles = articles;    
            });
        },
        open(entry) {
            router.push({ path: '/article/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}