class PersonImport {
    constructor(fdb) {
        this.persons = [];
        this.fdb = fdb;
    }

    load() {
        var _this = this;
        return new Promise(resolve => {
            _this.fdb.collection("persons").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    _this.persons.push($.extend(doc.data(), { _id: doc.id }));
                });
                console.log("loaded persons from firestore",_this.persons.length);
                _this.parse();
            });
        });
    }

    parse() {
        var _this = this;
        return new Promise(resolve => {

            //get act Persons
            Person.getList().then(dbPersons => {

                console.log("dbPersons",dbPersons);
                var bulk = [];
                _this.persons.forEach(iperson => {
                    console.log("iperson", iperson);

                    if(iperson) {
                        

                        var person = {
                            _id: iperson._id,
                            firstName: iperson.firstName,
                            lastName: iperson.lastName,
                            credit: iperson.credit,
                            isMember: iperson.member == 1
                        };

                        var dbPerson = dbPersons.find(dba => dba._id === person._id);
                        
                        if(!dbPerson) {
                            dbPerson = new Person();
                            dbPerson = $.extend(dbPerson,person);
                            bulk.push(dbPerson.getDbDoc());         
                        }
                        else if(dbPerson.firstName !== person.firstName || dbPerson.lastName !== person.lastName || dbPerson.credit !== person.credit) {
                            dbPerson = $.extend(dbPerson,person);
                            bulk.push(dbPerson.getDbDoc());         
                        }
                    }
                });

                DbConfig.personDb.bulkDocs(bulk);

                resolve();
            });            
        });
    }
}