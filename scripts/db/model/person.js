class Person extends BaseModel {
    constructor(db) {
        super(personDb)
        this.firstName = "";
        this.lastName = "";
        this.phoneNr = "";
        this.isMember = false;
        this.map = ["firstName","lastName","isMember"];
    }

    get fullName() {
        return this.lastName + "  " + this.firstName;
    }
}