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

MovieSchema = new Schema({

    plot: String,
    genres: Array,
    runtime: Number,
    cast: Array,
    num_mflix_comments: Number,
    title: String,
    fullplot: String,
    countries: Array,
    released: Date,
    directors: Array,
    rated: String,
    awards: {
        wins: Number,
        nominations: Number,
        text: String
    },
    lastupdated: String,
    year: Number,
    imdb: {
        rating: Number,
        votes: Number,
        id: Number
    },
    type: String,
    tomatoes: {
        viewer: {
            rating: Number,
            numReviews: Number,
            meter: Number
        },
        lastUpdated: Date
    }
});

module.exports = class MovieDB {
    constructor() {
        this.Movie = null;
    }

    initialize(connectionURL) {
        return new Promise((resolve, reject) => {
            const db = mongoose.createConnection(connectionURL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            db.once("error", (err) => {
                reject(err);
            });
            db.once("open", () => {
                this.Movie = db.model("movies", MovieSchema);
                resolve();
            });
        });
    }

    getAllMovies(page, perPage, title) {
        let findBy = title ? { title } : {};

        if (+page && +perPage) {
            return this.Movie.find(findBy)
                .sort({ movie_id: +1 })
                .skip((page - 1) * +perPage)
                .limit(+perPage)
                .lean()
                .exec();
        }

        return Promise.reject(
            new Error("page and perPage query parameters must be valid numbers")
        );
    }

    async addNewMovie(data) {
        console.log(data);
        const newMovie = new this.Movie(data);
        await newMovie.save();
        return newMovie;
    }

    getMovieById(id) {
        return this.Movie.findOne({ _id: id }).lean().exec();
    }

    updateMovieById(data, id) {
        return this.Movie.updateOne({ _id: id }, { $set: data }).lean().exec();
    }

    deleteMovieById(id) {
        return this.Movie.deleteOne({ _id: id }).exec();
    }

}
