Vue.component('modal-person-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Person auswählen</p>
            <button class="delete" aria-label="close" @click="cancel"></button>
        </header>
        <section class="modal-card-body">
            <person-line v-for="entry in persons" :person="entry" v-on:click="choose(entry)" :key="entry._id"/>
        </section>
        </div>
    </div>
    `,
    props: {
    },
    data() {
        return {
            resolve: null,
            reject: null,
            persons: []
        };
    },
    methods: {
        open() {
            var app = this;
            Person.getList().then(persons => {
                app.persons = persons;      
                $(app.$refs.modal).addClass("is-active");
            });   
            
            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        },
        choose(person) {
            var app = this;
            if(person.mainPersonId && person.mainPersonId.length > 0) {
                Person.get(person.mainPersonId).then(mainPerson => {
                    $(app.$refs.modal).removeClass("is-active");
                    app.resolve(mainPerson);
                });
            }
            else {
                $(app.$refs.modal).removeClass("is-active");
                app.resolve(person);
            }
        }
    }
 });