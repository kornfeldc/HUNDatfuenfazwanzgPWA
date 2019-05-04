const ArticlePage = {
    mixins: [sessionMixin,mandatoryMixin,utilMixins],
    template: `
    <div class="p-std">
        <div class="field">
            <label class="label">Bezeichnung</label>
            <div class="control">
                <input :class="getInputClass(article,'title')" type="text" placeholder="Bezeichnung" v-model="article.title"/>
            </div>
            <p class="help is-danger" v-if="!hasValue(article,'title')">
                Bitte ausfüllen
            </p>
        </div>
        <div class="field">
            <label class="label">Art</label>
            <div class="control">
                <div class="select">
                    <select v-model="article.type" :class="getInputClass(article,'type')">
                        <option value="alcoholic">Getränk - Alkoholisch</option>
                        <option value="nonalcoholic">Getränk - Antialkoholisch</option>
                        <option value="snack">Snack</option>
                        <option value="credit">Guthaben</option>
                    </select>
                </div>
            </div>
            <p class="help is-danger" v-if="!hasValue(article,'type')">
                Bitte ausfüllen
            </p>
        </div>
        <div class="field">
            <label class="label">Preis</label>
            <div class="control">
                <input :class="getInputClass(article,'price')" type="number" placeholder="Preis" v-model="article.price" style="width:100px;text-align:right"/>
            </div>
            <p class="help is-danger" v-if="!hasValue(article,'price')">
                Bitte ausfüllen
            </p>
        </div>
        <div class="field">
            <label class="checkbox">
                <input type="checkbox" v-model="article.isFavorite">
                Ist Favorit
            </label>
        </div>
        <div class="field is-grouped">
            <div class="control">
                <button class="button is-link" @click="save">Speichern</button>
            </div>
            <div class="control">
                <button class="button is-text" @click="cancel">Abbrechen</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            article: {}
        };
    },
    mounted() {
        var app = this;
        app.load();
    },
    methods: {
        load() {
            var app = this;
            if(app.$route.params.id !== "_") 
                Article.get(app.$route.params.id).then(article => app.article = article);
            else 
                app.article = new Article();
        },
        save() {
            var app = this;
            app.article.save().then(()=> {
                router.push({ path: "/articles" });
            });
        },
        cancel() {
            router.push({ path: "/articles" });
        }
    }
}