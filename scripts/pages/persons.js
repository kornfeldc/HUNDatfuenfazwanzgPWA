const PersonsPage = {
    mixins: [utilMixins],
    template: `
    <page-container>
        <div class="above_actions">
            <search v-model="search" @changed="load" />
            <person-line v-for="entry in persons" :person="entry" v-on:click="open(entry)" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button-primary @click="open">Neue Person</button-primary>
                </div>
            </div>
        </div>
    </page-container>
    `,
    data() {
        return {
            search: "",
            persons: []
        };
    },
    mounted() {
        var app = this;
        this.load();
    },
    methods: {
        load() {
            var app = this;
            Person.getList(app.search).then(persons => {
                app.persons = persons;      
            });
        },
        open(entry) {
            router.push({ path: '/person/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}