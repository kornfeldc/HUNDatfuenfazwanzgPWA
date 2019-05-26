const PersonsPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container ref="page" :syncing="syncing">
        <div class="above_actions">
            <search v-model="search" @changed="load" />
            <div class="tabs" v-if="!search || search.length == 0">
                <ul>
                    <li v-for="t in types" :class="(tab == t.id ? 'is-active':'')"><a @click="vibrate();tab = t.id;">{{t.shortTitle}}</a></li>
                </ul>
            </div>
            <person-line v-for="entry in persons" :person="entry" v-on:click="vibrate();open(entry);" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button-primary @click="vibrate();open();">Neue Person</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
            types: [
                { id: "top", shortTitle: "TOP" },
                { id: "all", shortTitle: "Alle" },
                { id: "member", shortTitle: "Mitglieder" },
                { id: "nomember", shortTitle: "Kursler" }
            ],
            tab: "top",
            persons: [],
            isMainPage: true,
            first: true
        };
    },
    watch: {
        tab() {
            this.load();
        }
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            if(app.first) app.syncing = true;
            Person.getList(app.search, app.tab).then(persons => {
                app.first = false;
                app.syncing = false;
                app.persons = persons;      
            });
        },
        open(entry) {
            router.push({ path: '/person/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}