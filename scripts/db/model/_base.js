class BaseModel {
    constructor(db) {
        this.db = db;
        this.doc = null;
        this._id = uuidv4();
        this.map = [];
    }

    checkMap() {
        if(this.map.length == 0)
            alert("no map set for object");
        if(!this.map.includes("_id"))
            this.map.push("_id");
    }

    toObj() {
        this.checkMap();
        var ret = {};
        this.map.forEach(property => ret[property] = this[property]);
        return ret;
    }

    toDoc() {
        var _this = this;
        this.checkMap();
        if(this.doc) {
            this.map.forEach(property => _this.doc[property] = _this[property]);
        }
        return this.doc;
    }

    load(doc) {
        var _this = this;
        this.checkMap();
        this.doc = doc;
        this.map.forEach(property => _this[property] = doc[property]);
    }

    save() {
        var _this = this;
        console.log("save1", _this);
        console.log("save2", _this.toObj());
        return new Promise(resolve => {
            if(this.doc === null) {
                //new
                console.log("save - insert", _this.toObj());
                _this.db.put(_this.toObj()).then(()=>resolve());
            }
            else {
                console.log("save - update", _this.toDoc());
                _this.db.put(_this.toDoc()).then(()=>resolve());
            }
        }); 
    }

    remove() {
        return this.db.remove(this.doc);
    }
}