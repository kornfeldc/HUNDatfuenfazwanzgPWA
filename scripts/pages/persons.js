const PersonsPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <div class="p-std">
        <div class="above_actions">
            <person-line v-for="entry in persons" :person="entry" v-on:click="open(entry)" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button class="button is-link" @click="open">Neue Person</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
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
            Person.getList().then(persons => {
                app.persons = persons;      
            });
        },
        open(entry) {
            router.push({ path: '/person/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}