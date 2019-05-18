const ArticlesPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="load" />
            <div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li :class="(tab == 'favorites' ? 'is-active':'')"><a @click="tab = 'favorites'">Favoriten</a></li>
                    <li v-for="at in articleTypes" :class="(tab == at.id ? 'is-active':'')"><a @click="tab = at.id">{{at.shortTitle}}</a></li>
                </ul>
            </div>
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
            articleTypes: Article.getTypes(),
            tab: "favorites",
            articles: [],
            isMainPage: true
        };
    },
    watch: {
        tab() {
            this.load();
        }
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            app.syncing=true;
            Article.getList(app.search, app.tab).then(articles => {
                app.syncing=false;
                app.articles = articles;    
            });
        },
        open(entry) {
            router.push({ path: '/article/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}