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

require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(express.json());

const exphbs = require('express-handlebars');
const Handlebars = require('handlebars')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

var User = require('./models/users')
var Movie = require('./models/movies');
const db = new Movie();
const user = new User();

db.initialize(database.movie_url)
    .then(() => {
        app.listen(port, function () {
            console.log(`Server listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

user.initialize(database.user_url)
    .then(() => {
        console.log(`Server already stared on port ${port}`);
    })
    .catch((err) => {
        console.log(err);
    });


function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.SECRET_TOKEN, (error, user) => {
        if (error) return res.sendStatus(403);
        req.user = user
        next();
    })
}

app.get('/checking', authenticateToken, (req, res) => {
    res.send(req.user);
});

app.get('/', function (req, res) {
    res.render('signup', { data: null });
});

app.post('/signup', async function (req, res) {
    try {
        const hashed_password = await bcrypt.hash(req.body.password, 13);
        const accessToken = jwt.sign({ username: req.body.username }, process.env.SECRET_TOKEN);

        const data = { username: req.body.username, password: req.body.password, token: accessToken }

        user.addNewUser(data)
            .then((data) => {
                res.status(201).send("User Successfully Inserted");
            })
            .catch((err) => {
                res.status(500).json({ error: err });
            });
    } catch {
        res.send("Error in data insertion");
    }
});

app.post('/userlogin', (req, res) => {
    const username = "Fenil";
    const user = { name: username };

    const accessToken = jwt.sign(user, process.env.SECRET_TOKEN);
    res.json({ accessToken: accessToken });
})

app.get('/login', function (req, res) {
    res.render('login', {data: null});
})

app.post('/login', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    user.getUserByUsername(req.body)
        .then(async (data) => {
            if (data.length === 0) {
                res.send("Received Null Data")
            } else {
                if(data.password == password){
                    res.send(data.token)
                } else {
                    res.send("Invalid Password")
                }
            }
        })
        .catch((error) => {
            res.send("Cannot find user");
        });

});

app.get('/form', function (req, res) {
    res.render('form', { data: null });
});

app.get('/api/movies', function (req, res) {

    var page = req.query.page || 1;
    var perPage = req.query.perPage || 13;
    var title = req.query.title || null;
    if (!page || !perPage)
        res.status(500).json({ message: "Missing query parameters" });
    else {
        db.getAllMovies(page, perPage, req.query.title)
            .then((data) => {
                if (data.length === 0)
                    res.status(204).json({ message: "No data found" });
                else {
                    res.status(201);
                    //console.log(data)
                    res.render("result.hbs", { data: data });
                }
            })
            .catch((err) => {
                res.status(500).json({ error: err });
            });
    }

});

app.get('/api/movie/:movie_id', function (req, res) {
    let id = req.params.movie_id;

    db.getMovieById(id)
        .then((data) => {
            res.status(201).json(data);
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});

app.get('/addMovie', function (req, res) {
    res.render('addMovie', { data: null });
});

app.post('/api/movies', function (req, res) {

    if (Object.keys(req.body).length === 0)
        res.status(500).json({ error: "No data passed for insertion" });
    else {
        db.addNewMovie(req.body)
            .then((data) => {
                res.status(201).send("Data Successfully Inserted");
            })
            .catch((err) => {
                res.status(500).json({ error: err });
            });
    }

});

app.put('/api/movie/:movie_id', function (req, res) {

    if (Object.keys(req.body).length === 0)
        res.status(500).json({ error: "No data passed for updation" });
    else {
        db.updateMovieById(req.body, req.params.movie_id)
            .then(() => {
                res.status(201).send("Data Successfully Updated");
            })
            .catch((err) => {
                res.status(500).json({ error: err });
            });
    }
});

app.delete('/api/movie/:movie_id', function (req, res) {

    db.deleteMovieById(req.params.movie_id)
        .then(() => {
            res.status(201).send("Movie has been deleted.");
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
});