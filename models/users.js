/********************************************************************************************************
*
* ITE5315 – Project
* 
* I declare that this assignment is my own work in accordance with Humber Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Group member Names: Fenilkumar Bhanavadiya, Shally Sharma 
* Student IDs: N01478115, N01474806 
* Date: 1st December 2022 
*
*********************************************************************************************************/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

UserSchema = new Schema({

    username: String,
    password: String,
    token: String

});

//module.exports = mongoose.model('Users', UserSchema);

module.exports = class UserDB {
    constructor() {
        this.User = null;
    }

    initialize(connectionURL) {
        return new Promise((resolve, reject) => {
            const user = mongoose.createConnection(connectionURL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            user.once("error", (err) => {
                reject(err);
            });
            user.once("open", () => {
                this.User = user.model("users", UserSchema);
                resolve();
            });
        });
    }

    getUserByUsername(data){
        return this.User.findOne({ username: data.username }).lean().exec();
    }

    async addNewUser(data) {
        console.log(data);
        const newUser = new this.User(data);
        await newUser.save();
        return newUser;
    }

}
