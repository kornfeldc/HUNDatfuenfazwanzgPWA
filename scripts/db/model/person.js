class Person extends BaseModel {
    constructor(db) {
        super(DbConfig.personDb)
        this.firstName = "";
        this.lastName = "";
        this.phoneNr = "";
        this.isMember = false;
        this.personGroup = ""; 
        this.mainPersonId = "";
        this.relatedPersons = [];
        this.credit = 0.0;
        this.topSaleCount = 0;
        this.topSaleSum = 0.0;
        this.saleCount = 0;
        this.saleSum = 0.0;
        this.articleCounts = {};
        this.topArticleCounts = {};
        this.map = [
            "firstName","lastName","isMember","credit","personGroup","mainPersonId",
            "relatedPersons","topSaleCount", "saleCount", "topSaleSum", "saleSum",
            "articleCounts", "topArticleCounts"];
    }

    get fullName() {
        return this.lastName + " " + this.firstName;
    }

    get nameWithGroup() {
        if(this.personGroup && this.personGroup.length > 0)
            return this.personGroup;
        return this.fullName;
    }

    static get(id) {
        return Db.getEntity(DbConfig.personDb, Person, id);
    }

    static getList(search, tab) {
        
        return Db.getList(DbConfig.personDb, Person, (a,b)=> {
            if(tab === "top") {
                if (a.topSaleCount < b.topSaleCount)
                    return 1;
                if ( a.topSaleCount > b.topSaleCount)
                    return -1;
                return 0;
            }
            else {
                if (a.fullName < b.fullName)
                    return -1;
                if ( a.fullName > b.fullName)
                    return 1;
                return 0;
            }
        }, (person) => {
            var ret = true;
            if(tab === "member")
                ret = person.isMember;
            else if(tab === "nomember")
                ret = !person.isMember;
            else if(tab === "top")
                ret = person.topSaleCount > 0;

            return (ret && !search) || (search && person.fullName.toLowerCase().indexOf(search.toLowerCase()) >= 0);
        });
    }

    static correctPersons() {
        this.getList().then(persons => {
            persons.forEach(person => {
                
                var changedPerson = false;
                if(person.mainPersonId && person.mainPersonId.length > 0 && (!person.personGroup || person.personGroup.length == 0)) {
                    //person has a mainPersonId but no group => remove mainPersonId
                    person.mainPersonId = null;
                    changedPerson = true;
                }

                if(person.personGroup && person.personGroup.length > 0) {
                    //person has a group => calculate mainPersonId

                    //find all persons matching the group
                    var groupPersons = persons.filter(p2 => p2.personGroup == person.personGroup);
                    
                    var minId = groupPersons[0]._id;
                    groupPersons.forEach(gp => minId = gp._id < minId ? gp._id : minId);

                    if(person.mainPersonId !== minId) {
                        person.mainPersonId = minId;
                        changedPerson = true;
                    }

                    //build related persons
                    var relatedPersons = [];
                    groupPersons.filter(gp => gp._id !== person._id).forEach(gp => relatedPersons.push({ _id: gp._id, fullName: gp.fullName }));

                    if(JSON.stringify(person.relatedPersons) !== JSON.stringify(relatedPersons)) {
                        person.relatedPersons = relatedPersons;
                        changedPerson = true;
                    }
                }

                if(changedPerson) {
                    person.save();
                }
            });
        });
    }
}

const barPerson = {
    _id: "bar",
    fullName: "Barverkauf",
    nameWithGroup: "Barverkauf",
    isBar: true,
    credit: 0
};