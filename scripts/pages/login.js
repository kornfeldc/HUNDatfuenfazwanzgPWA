const LoginPage = {
    template: `
    <div class="p-std">
        <div class="field">
            <label class="label">Db-Url</label>
            <div class="control">
                <input class="input" type="text" placeholder="Url" v-model="dbUrl"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Email</label>
            <div class="control">
                <input class="input" type="text" placeholder="Email" v-model="email"/>
            </div>
            <p class="help is-danger" v-if="invalid">
                Ungültige Daten
            </p>
        </div>
        <div class="pt-1">&nbsp;</div>
        <div class="field is-grouped">
            <div class="control">
                <button :class="'button is-link '+(loading?'is-loading':'')" @click="login">Einloggen</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            dbUrl: "",
            email: "",
            loading: false,
            invalid: false
        };
    },
    mounted() {
        var app = this;
        this.load();
    },
    methods: {
        load() {
            var app = this;
            if(DbConfig.isLoggedIn()) 
                router.push({ path: "/sales "});
        },
        login() {
            var app = this;
            app.loading = true;
            DbConfig.checkDb(app.dbUrl, app.email).then(() => {
                app.invalid = false;
                app.loading = false;
                router.push({path: "/sales"});
            }, () => {
                //error
                app.loading = false;
                app.invalid = true;
            });
        }
    }
}