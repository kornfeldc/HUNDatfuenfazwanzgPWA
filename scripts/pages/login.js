const LoginPage = {
    template: `
    <div class="p-std">
        <div class="field">
            <label class="label">User</label>
            <div class="control">
                <input class="input" type="text" placeholder="User" v-model="user" id="user"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Passwort</label>
            <div class="control">
                <input class="input" type="password" placeholder="Passwort" v-model="password"/>
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
            user: "",
            password: "",
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
            app.loading=true;
            var hash = (app.user+app.password).hashCode();
            $.ajax({
                url: "configs/"+hash+".json",
                success: data => {
                    if(data) 
                        DbConfig.parse(data).then(() => {
                            app.invalid = false;
                            app.loading = false;
                            router.push({path: "/sales"});
                        });
                    else 
                        app.loginfailed();
                },
                error: app.loginfailed
            });
        },
        loginfailed() {
            var app = this;
            app.loading = false;
            app.invalid=true;
        }
    }
}