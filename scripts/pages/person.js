const PersonPage = {
    mixins: [sessionMixin,mandatoryMixin,utilMixins],
    template: `
        <div class="p-std">
            <div class="field">
            <label class="label">Vorname</label>
            <div class="control">
                <input :class="getInputClass(person,'firstName')" type="text" placeholder="Vorname" v-model="person.firstName"/>
            </div>
            <p class="help is-danger" v-if="!hasValue(person,'firstName')">
                Bitte ausfüllen
            </p>
        </div>
        <div class="field">
            <label class="label">Nachname</label>
            <div class="control">
                <input class="input" type="text" placeholder="Nachname" v-model="person.lastName"/>
            </div>
        </div>
        <div class="field">
            <label class="label">Telefon</label>
            <div class="control">
                <input class="input" type="number" placeholder="Telefon" v-model="person.phoneNr"/>
            </div>
        </div>
        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input type="checkbox" v-model="person.isMember">
                    Ist Mitglied
                </label>
            </div>
        </div>
        <div class="field">
            <div class="control">
                <label class="checkbox">
                    <input type="checkbox" v-model="isPersonGroup">
                    Zusammenhängende Personen
                </label>
            </div>
        </div>
        <div class="field" v-if="isPersonGroup">
            <div class="control">
                <input :class="getInputClass(person,'personGroup')" type="text" placeholder="Personengruppe" v-model="person.personGroup"/>
            </div>
            <p class="help is-danger" v-if="!hasValue(person,'personGroup')">
                Bitte ausfüllen
            </p>
        </div>
        <div class="pt-1">&nbsp;</div>
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
            person: {},
            isPersonGroup: false
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
                Person.get(app.$route.params.id).then(person => { 
                    app.person = person;
                    app.isPersonGroup = app.person.personGroup && app.person.personGroup.length > 0;
                });
            else 
                app.person = new Person();
        },
        save() {
            var app = this;
            app.person.save().then(()=> {
                Person.correctPersons();
                router.push({ path: "/persons" });
            });
        },
        cancel() {
            router.push({ path: "/persons" });
        }
    }
}