const SalePage = {
    template: `
    <div class="p-std">
        <div class="above_actions">
            sale: {{$route.params.id}}
        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control">
                    <button class="button is-link" @click="save">OK</button>
                </div>
                <div class="control">
                    <button class="button is-link" @click="pay">Zahlen</button>
                </div>
                <div class="control">
                    <button class="button is-text" @click="cancel">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            sale: {}
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
                db.getSales().then(sales => {
                    var s = sales.find(sale => sale._id === app.$route.params.id);
                    app.sale = s;
                });
            }
            else 
                app.sale = new Sale();
        },
        save() {
            var app = this;
            app.sale.save().then(()=> {
                router.push({ path: "/sales" });
            });
        },
        pay() {
            var app = this;
            app.sale.save().then(()=> {
                router.push({ path: "/pay/" + app.sale._id });
            });
        },
        cancel() {
            router.push({ path: "/sales" });
        }
    }
}