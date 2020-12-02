const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./database/db");
const Game = require("./database/games");
const cors = require("cors");
const app = express();

app.use(cors());

// Body-Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// database
connection
    .authenticate()
    .then(() => {
        console.log("Conectado!");
    })
    .catch((err) => {
        console.log(err);
    });

app.get("/games", async(req, res) => {
    try {
        const games = await Game.findAll();
        games ? res.status(200).json(games) : res.sendStatus(204);
    } catch (err) {
        console.log(err);
        return res.sendStatus(400);
    }
});

app.get("/game/:id", async(req, res) => {
    let id = req.params.id;
    if (isNaN(id)) {
        res.sendStatus(400);
    } else {
        try {
            let gameReturned = await Game.findOne({
                where: {
                    id: id,
                },
            });
            res.status(200).json({ game: gameReturned });
        } catch (err) {
            console.log(err);
            res.sendStatus(500);
        }
    }
});

app.post("/game", (req, res) => {
    const { title, price, year } = req.body;

    if (title != undefined && price != undefined && year != undefined) {
        Game.create({
                title: title,
                price: price,
                year: year,
            })
            .then(() => {
                res.sendStatus(200);
            })
            .catch((err) => {
                res.sendStatus(400);
            });
    } else {
        res.sendStatus(400);
    }
});

app.delete("/game/:id", (req, res) => {
    let id = req.params.id;

    if (isNaN(id)) {
        res.sendStatus(400);
    } else {
        Game.destroy({
                where: {
                    id: id,
                },
            })
            .then(() => {
                res.sendStatus(200);
            })
            .catch((err) => {
                console.log(err);
            });
    }
});

app.put("/game/:id", (req, res) => {
    let id = req.params.id;

    let { title, price, year } = req.body;

    if (isNaN(id)) {
        res.sendStatus(400);
    } else {
        Game.findOne({
            where: {
                id: id,
            },
        }).then((game) => {
            if (game != undefined) {
                Game.update({
                        title: title,
                        price: price,
                        year: year,
                    }, {
                        where: {
                            id: id,
                        },
                    })
                    .then(() => {
                        res.sendStatus(200);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                res.sendStatus(400);
            }
        });
    }
});

app.listen(7854, () => {
    console.log("API Rodando!");
});