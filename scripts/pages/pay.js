const PayPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <div class="p-std">
        <div class="above_actions">
            <sale-person :sale="sale" :person="person" mode="pay" v-model="useCredit"/>
            <div>&nbsp;</div>
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column is-centered" style="text-align:center">
                    <div class="title is-6">zu bezahlen</div>
                    <div :class="'subtitle is-2 '+ getColor('toPay',toPay)">{{format(toPay)}}</div>
                </div>
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">retour</div>
                    <div :class="'subtitle is-2 '+ getColor('toReturn',toReturn)">{{format(toReturn)}}</div>
                </div>
                <div class="column is-centered" style="text-align:center">
                    <div class="title is-6">neues Guth.</div>
                    <div :class="'subtitle is-2 '+ getColor('newCredit',newCredit)">{{format(newCredit)}}</div>
                </div>
            </div>
            <div>&nbsp;</div>
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">inkl. Trinkggeld</div>
                    <div :class="'subtitle is-2 '+ getColor('inclTip',sale.inclTip)" @click="openInput('inclTip')">{{format(sale.inclTip)}}</div>
                    <div>
                        <button class="button is-rounded is-danger" @click="modify('inclTip','-')">-</button>
                        <button class="button is-rounded is-success" @click="modify('inclTip','+')">+</button>
                    </div>
                </div>
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">gegeben</div>
                    <div :class="'subtitle is-2 '+ getColor('given',sale.given)" @click="openInput('given')">{{format(sale.given)}}</div>
                    <div>
                        <button class="button is-rounded is-danger" @click="modify('given','-')">-</button>
                        <button class="button is-rounded is-success" @click="modify('given','+')">+</button>
                    </div>
                </div>
                <div class="column  is-centered" style="text-align:center">
                    <div class="title is-6">Guth. aufladen</div>
                    <div :class="'subtitle is-2 '+ getColor('addAdditionalCredit',sale.addAdditionalCredit)" @click="openInput('addAdditionalCredit')">{{format(sale.addAdditionalCredit)}} </div>
                    <div>
                        <button class="button is-rounded is-danger" @click="modify('addAdditionalCredit','-')">-</button>
                        <button class="button is-rounded is-success" @click="modify('addAdditionalCredit','+')">+</button>
                    </div>
                </div>
            </div>
            <div class="px-std columns is-mobile is-vcentered">
               
            </div>
        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control" v-if="allowPay">
                    <button-success @click="save">Fertig</button-success>
                </div>
                <div class="control">
                    <button-cancel @click="cancel"/>
                </div>
            </div>
        </div>
        <modal-input ref="inp"/>
    </div>
    `,
    data() {
        return {
            sale: {},
            person: {},
            useCredit: false
        };
    },
    computed: {
        allowPay() {
            var app = this;
            return app.sale.given >= app.toPay;
        },
        toPay() {
            var app = this;
            var val = 0;
            if(app.useCredit && app.person.credit >= app.sale.articleSum)
                val = 0;
            else if(app.useCredit)
                val = app.sale.articleSum - app.person.credit;
            else
                val = app.sale.articleSum;
            return Math.round(val*10)/10;
        },
        baseToReturn() {
            var app = this;
            return app.sale.given - app.sale.inclTip;
        },
        toReturn() {
            var app = this;
            return app.baseToReturn - app.sale.addAdditionalCredit;
        },
        newCredit() {
            var app = this;
            if(app.person) {
                if(!app.useCredit)
                    return app.person.credit + app.sale.addAdditionalCredit;
                else 
                    return Math.max(app.person.credit - app.sale.articleSum + app.sale.addAdditionalCredit,0);
            }
            return 0;
        }
    },
    watch: {
        useCredit() {
            var app = this;
            app.recalc("initial");
        }
    },
    mounted() {
        var app = this;
        app.load();
    },
    methods: {
        getColor(mode,val) {
            var app = this;
            if(mode == "toPay" && app.toPay > 0)
                return "warning-text";
            else if(mode == "toPay")
                return "has-text-success";
            else if(mode == "toReturn" && app.toReturn > 0)
                return "has-text-danger has-text-weight-bold";
            else if(mode == "newCredit" && app.person.credit > app.newCredit) 
                return "has-text-danger";
            else if(mode == "newCredit" && app.person.credit < app.newCredit) 
                return "has-text-link";
            else if(val === 0)
                return "has-text-grey-light";
            return "";
        },
        load() {
            var app = this;
            if(app.$route.params.id !== "_") 
                Sale.get(app.$route.params.id).then(sale => { 
                    app.sale=sale;
                    Person.get(app.sale.person._id).then(person=> { app.person = person; app.afterLoad() });
                });
            else
                router.push({ path: "/sales" });
        },
        afterLoad() {
            var app = this;
            if(app.person.credit > app.sale.articleSum)
                app.useCredit = true;
            app.recalc("initial");
        },
        save() {
            var app = this

            app.sale.personCreditBefore = app.person.credit;
            app.sale.personCreditAfter = app.newCredit;
            app.sale.toReturn = app.toReturn;
            app.sale.toPay = app.toPay;
            app.sale.usedCredit = app.useCredit;

            if(app.newCredit !== app.person.credit) {
                app.person.credit = app.newCredit;
                app.person.save();
            }

            app.sale.payDate = moment().format("DD.MM.YYYY HH:mm:ss");
            app.sale.save().then(()=> {
                router.push({ path: "/sales" });
            });
        },
        cancel() {
            var app = this;
            router.push({ path: "/sale/"+app.sale._id });
        },
        openInput(mode) {
            var app = this;
            if(mode === "given") 
                app.$refs.inp.open(app.sale.given, "gegeben").then(val => { app.setValue("given", val); app.recalc("given"); });
            else if(mode === "addAdditionalCredit")
                app.$refs.inp.open(app.sale.addAdditionalCredit, "Guthaben aufladen").then(val => { app.setValue("addAdditionalCredit", val); app.recalc(); });
            else if(mode === "inclTip")
                app.$refs.inp.open(app.sale.inclTip, "inklusive Trinkgeld").then(val => { app.setValue("inclTip", val); app.recalc("inclTip"); });
        },
        modify(prop,dir) {
            var app = this;
            var newVal = app.sale[prop];
            if(dir === "+" || app.sale[prop] > 0) {
                var step = dir === "-" ? -0.5 : 0.5;
                var inv = 1.0 / step;
                if(app.sale[prop] === Math.round(app.sale[prop] * inv) / inv)
                    newVal += step;
                else {
                    var newVal = Math.round(app.sale[prop] * inv) / inv;
                    if(dir === "+" && newVal <= app.sale[prop]) 
                        newVal =  Math.round((newVal+step) * inv) / inv;
                }
                
            }

            if(newVal !== app.sale[prop]) {
                app.setValue(prop,newVal);
                app.recalc(prop);
            }
        },
        setValue(prop, value) {
            var app = this;
            
            if(prop === "given" && value < app.toPay)
                return false;

            if(prop === "addAdditionalCredit") {
                var maxAvailableAdditionalCredit = app.baseToReturn;
                if(value > maxAvailableAdditionalCredit)
                    return false;
            }
            app.sale[prop] = parseFloat(value);
        },
        recalc(mode) {
            var app = this;

            if(mode === "initial") {
                app.sale.inclTip = app.toPay;
                app.sale.given = app.toPay;
                app.sale.addAdditionalCredit = 0.0;
            }

            if(app.sale.inclTip < app.toPay) 
                app.sale.inclTip = app.toPay;
            
            if(mode === "inclTip" && app.sale.given < app.sale.inclTip)
                app.sale.given = app.sale.inclTip;
            if(mode === "given" && app.sale.given < app.sale.inclTip)
                app.sale.inclTip = app.sale.given;

            if(mode === "given" || mode === "inclTip") {
                if(app.toReturn < 0)
                    app.sale.addAdditionalCredit = 0;
            }
        }
    }
}