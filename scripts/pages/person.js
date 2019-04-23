const PersonPage = {
    template: `
    <div class="p-std">
        <div class="field">
            <label class="label">Nachname</label>
            <div class="control">
                <input class="input" type="text" placeholder="Nachname" v-model="person.lastName"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Vorname</label>
            <div class="control">
                <input class="input" type="text" placeholder="Vorname" v-model="person.firstName"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Telefon</label>
            <div class="control">
                <input class="input" type="number" placeholder="Telefon" v-model="person.phoneNr"/>
            </div>
        </div>
        <div class="field">
            <label class="checkbox">
                <input type="checkbox" v-model="person.isMember">
                Ist Mitglied
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
            person: {}
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
                db.getPersons().then(persons => {
                    var p = persons.find(person => person._id === app.$route.params.id);
                    app.person = p;
                });
            }
            else 
                app.person = new Person();
        },
        save() {
            var app = this;
            app.person.save().then(()=> {
                router.push({ path: "/persons" });
            });
        },
        cancel() {
            router.push({ path: "/persons" });
        }
    }
}