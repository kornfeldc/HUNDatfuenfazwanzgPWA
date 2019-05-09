const SalePage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <div class="p-std">
        <div class="above_actions" v-if="sale.person && render">
            <sale-person :sale="sale" :person="person"/>

            <div class="box">
                <div class="media p-1">
                    <div class="media-content">
                        Summe <button class="ml-std button is-small is-outlined is-link" @click="addArticles" v-if="!sale.isPayed">Artikel hinzufügen</button>
                    </div>
                    <div class="media-right title is-5">
                        {{format(sale.articleSum)}}
                    </div>
                </div>

                <div class="pt-1">&nbsp;</div>
                <div class="flx col g1 pt-1">
                    <sale-article-line v-for="saleArticle in sale.articles" mode="sale" :article="saleArticle.article" :sale="sale" @modify="(article,amount)=>modify(article,amount)"/>
                </div>
            
            </div>

        </div>
        <div class="actions" v-if="sale.person">
            <div class="field is-grouped">
                <div class="control">
                    <button class="button is-link" @click="save">OK</button>
                </div>
                <div class="control" v-if="sale.articleSum != 0 && !sale.isPayed">
                    <button class="button is-success" @click="pay">Zahlen</button>
                </div>
                <div class="control" v-if="sale.articleSum != 0 && person.credit >= sale.articleSum && !sale.isPayed">
                    <button class="button is-success is-outlined" @click="payWCredit">Alles mit Guthaben zahlen</button>
                </div>
                <div class="control">
                    <button class="button is-danger is-outlined" @click="remove">Löschen</button>
                </div>
                <div class="control">
                    <button class="button is-text" @click="cancel">Abbrechen</button>
                </div>
            </div>
        </div>
        <modal-person-chooser ref="personChooser"/>
        <modal-article-chooser ref="articleChooser" :sale="sale"/>
        <modal-yesno ref="yesNoRemove" title="Verkauf löschen" text="Soll dieser Verkauf wirklich gelöscht werden?"/>
    </div>
    `,
    data() {
        return {
            sale: {},
            person: {},
            render: true
        };
    },
    mounted() {
        var app = this;
        app.load();
    },
    methods: {
        load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                Sale.get(app.$route.params.id).then(sale => {
                    app.sale = sale;
                    Person.get(app.sale.person._id).then(person=>app.person = person);
                });
            }
            else {
                app.$refs.personChooser.open().then(
                    //person selected
                    person => {
                        app.sale = new Sale();
                        app.person = person;
                        app.sale.setPerson(person);
                        app.addArticles();
                    }, 
                    //nothing selected:
                    () => router.push({ path: "/sales" }) 
                );
            }
        },
        addArticles() {
            var app = this;
            console.log("add articles before", app.sale.articles);
            app.$refs.articleChooser.open().then(modifications => {
                if(modifications) {
                    app.sale.articles = modifications;
                    console.log("add articles after", app.sale.articles);
                    app.calculate();
                }
                
            });
        },
        modify(article, amount) {
            var app = this;
            app.sale.articles.find(a => a.article._id === article._id).amount = amount;
            app.calculate();
        },
        calculate() {
            var app = this;
            app.sale.calculate();
            app.render = false;
            app.$nextTick(()=>app.render=true);
        },
        save() {
            var app = this;
            if(app.sale.isPayed)
                app.cancel();
            else {
                app.sale.save().then(()=> {
                    router.push({ path: "/sales" });
                });
            }
        },
        pay() {
            var app = this;
            app.sale.save().then(()=> {
                router.push({ path: "/pay/" + app.sale._id });
            });
        },
        payWCredit() {
            alert("Todo");
        },
        remove() {
            var app = this;
            if(app.$route.params.id !== "_") {
                app.$refs.yesNoRemove.open().then(() => {
                    app.sale.remove().then(() => router.push({ path: "/sales" }));
                });
            }
            else
                app.cancel();
        },
        cancel() {
            router.push({ path: "/sales" });
        }
    }
}