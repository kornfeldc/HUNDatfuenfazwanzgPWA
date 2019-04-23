Vue.component('person-line', { 
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        <div class="column">
            <i :class="'fa fa-star f200 ' + ( person.isMember ? 'additional-text' : 'has-text-grey-lighter' )"/>
        </div>
        <div class="column is-full">
            <h4 class="title is-4">{{person.fullName}}</h4>
        </div>
    </div>
    `,
    props: {
        person: { type: Object }
    }
 });