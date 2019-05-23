const SalePage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions" v-if="sale.person && render">
            <sale-person :sale="sale" :person="person" @click="openPerson"/>

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
                    <button-primary @click="save">OK</button-primary>
                </div>
                <div class="control" v-if="sale.articleSum != 0 && !sale.isPayed">
                    <button-success @click="pay">Zahlen</button-success>
                </div>
                <!--<div class="control" v-if="sale.articleSum != 0 && person.credit >= sale.articleSum && !sale.isPayed">
                    <button-success-inverted @click="payWCredit">Alles mit Guthaben zahlen</button-success-inverted>
                </div>-->
                <div class="control">
                    <button-cancel @click="cancel"/>
                </div>
                <div class="control">
                    <button-danger-inverted @click="remove">
                        <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                        </span>
                    </button-danger-inverted>
                </div>
            </div>
        </div>
        <modal-person-chooser ref="personChooser"/>
        <modal-article-chooser ref="articleChooser"/>
        <modal-yesno ref="yesNoRemove" title="Verkauf löschen" text="Soll dieser Verkauf wirklich gelöscht werden?"/>
        <modal-input ref="inp"/>
    </page-container>
    `,
    data() {
        return {
            sale: {},
            person: {},
            render: true,
            saveOnDestroy: false
        };
    },
    destroyed() {
        var app = this;
        if(app.saveOnDestroy)
            app.$root.storedSA = { saleId: app.sale._id, articles: app.sale.articles };
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            if(app.$route.params.id !== "_") {
                Sale.get(app.$route.params.id).then(sale => {
                    app.sale = sale;
                    if(app.sale.person._id === 'bar') {
                        app.person = barPerson;
                        app.restore();
                    }
                    else
                        Person.get(app.sale.person._id).then(person=> { 
                            app.person = person;
                            app.restore();
                        });
                }, () => router.push({ path: "/sales" }) );
            }
            else {
                app.$refs.personChooser.open().then(
                    //person selected
                    person => {

                        //check if there is an open sale for this person
                        if(!person.isBar) {
                            Sale.getOpenedSaleForPerson(person).then(sale => {
                                var firstOnNewSale = true;
                                if(sale) {
                                    app.sale = sale;
                                    firstOnNewSale = false;
                                }
                                else {
                                    app.sale = new Sale();
                                    app.sale.setPerson(person);
                                }
                                app.person = person;
                                if(!app.restore())
                                    app.addArticles(firstOnNewSale);
                            });
                        }
                        else {
                            app.sale = new Sale();
                            app.sale.setPerson(person);
                            app.person = person;
                            if(!app.restore())
                                app.addArticles(true);
                        }
                        
                    }, 
                    //nothing selected:
                    () => router.push({ path: "/sales" }) 
                );
            }
        },
        addArticles(firstOnNewSale) {
            var app = this;
            app.$refs.articleChooser.open(app.sale, app.person, firstOnNewSale).then(modifications => {
                if(modifications) {
                    app.sale.articles = modifications;
                    console.log("add articles after", app.sale.articles);
                    app.calculate();
                }
            }, (rejectMode) => {

                if(rejectMode === "addCredit") 
                    app.addCredit();
                else if(firstOnNewSale === true)
                    router.push({ path: "/sales" });
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
                app.syncing = true;
                app.sale.save().then(()=> {
                    app.syncing=false;
                    router.push({ path: "/sales" });
                });
            }
        },
        pay(amountJustCredit) {
            var app = this;
            app.syncing = true;

            app.sale.save().then(()=> {
                app.syncing = false;
                router.push({ path: "/pay/" + app.sale._id, query: { jc: amountJustCredit } });
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
        },
        addCredit() {
            var app = this;

            //check if there is already credit article
            /*var sa = (app.sale.articles || []).find(sa => sa.article._id === "credit");
            var text = "Guthaben im Wert von € kaufen"
            var price = 0;
            if(sa) {
                text = "Gekauftes Guthaben bearbeiten (0 eingeben um gekauftes Guthaben zu löschen";
                price = sa.article.price;
            }

            app.$refs.inp.open(price, text).then(val => { 
                val = parseFloat(val);
                if(sa) {
                    if(val == 0) {
                        //delete
                        var idx = app.sale.articles.findIndex(sa => sa.article._id === "credit");
                        app.sale.articles.splice(idx, 1);
                    }
                    else
                        sa.article.price = val;
                }
                else if(val !== 0) {
                    app.sale.articles.push({
                        article: {
                            _id: "credit",
                            title: "Guthaben",
                            price: val
                        },
                        amount: 1
                    });
                }
                app.calculate();
                app.pay();
            });*/

            app.$refs.inp.open(0, "Guthaben im Wert von € kaufen").then(val => { 
                val = parseFloat(val);
                if(val > 0) 
                    app.pay(val);                
            });
        },
        openPerson() {
            var app = this;
            if(app.person._id  !== 'bar') {
                app.saveOnDestroy = true;
                router.push({ path: "/person/"+app.person._id, query: { s: app.sale._id } });
            }
        },
        restore() {
            var app = this;
            if(app.$root.storedSA && app.$root.storedSA.saleId === app.sale._id) {
                app.sale.articles = app.$root.storedSA.articles;
                delete app.$root.storedSA;
                return true;
            }
            else
                return false;
        }
    }
}