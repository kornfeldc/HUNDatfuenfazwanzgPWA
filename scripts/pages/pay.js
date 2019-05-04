const PayPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <div class="p-std">
        <div class="above_actions">
            pay sale: {{$route.params.id}}
        </div>
        <div class="actions">
            <div class="field is-grouped">
                <div class="control">
                    <button class="button is-link" @click="save">OK</button>
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
            if(app.$route.params.id !== "_") 
                Sale.get(app.$route.params.id).then(sale => app.sale=sale);
            else
                router.push({ path: "/sales" });
        },
        save() {
            var app = this;
            app.sale.payDate = moment().format("DD.MM.YYYY HH:mm:ss");
            app.sale.save().then(()=> {
                router.push({ path: "/sales" });
            });
        },
        cancel() {
            var app = this;
            router.push({ path: "/sale/"+app.sale._id });
        }
    }
}