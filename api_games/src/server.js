const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./database/db");
const Game = require("./database/game");
const User = require("./database/user");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

const JWTSecret = "uhdfuiufn$oe&i475*";

function auth(req, res, next) {
    const authToken = req.headers["authorization"];

    if (authToken != undefined) {
        const bearer = authToken.split(" ");
        const token = bearer[1];

        jwt.verify(token, JWTSecret, (err, data) => {
            if (err) {
                res.status(401);
                res.json({ err: "Não autorizado!" });
            } else {
                req.token = token;
                req.loggedUser = { id: data.id, email: data.email };
                next();
            }
        });
        console.log(bearer);
    } else {
        res.status(401);
        res.json({ err: "Token inválido!" });
    }
}

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

app.get("/games", auth, async(req, res) => {
    try {
        const games = await Game.findAll();
        games ? res.status(200).json(games) : res.sendStatus(204);
    } catch (err) {
        console.log(err);
        return res.sendStatus(400);
    }
});

app.get("/game/:id", auth, async(req, res) => {
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

app.post("/game", auth, (req, res) => {
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

app.delete("/game/:id", auth, (req, res) => {
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

app.put("/game/:id", auth, (req, res) => {
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

app.post("/user", (req, res) => {
    const { email, password } = req.body;

    if (email != undefined) {
        if (password != undefined) {
            User.findOne({
                where: {
                    email: email,
                },
            }).then((user) => {
                if (user == undefined) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(password, salt);

                    User.create({
                            email: email,
                            password: hash,
                        })
                        .then(() => {
                            res.sendStatus(200);
                        })
                        .catch((e) => {
                            console.log(e);
                        });
                } else {
                    res.sendStatus(422);
                }
            });
        } else {
            res.status(400);
            res.json({ err: "Digite uma senha" });
        }
    } else {
        res.status(400);
        res.json({ err: "Digite um email" });
    }
});

app.post("/auth", (req, res) => {
    const { email, password } = req.body;

    if (email != undefined) {
        User.findOne({
            where: {
                email: email,
            },
        }).then((user) => {
            if (user != undefined) {
                const correct = bcrypt.compareSync(password, user.password);

                if (correct) {
                    jwt.sign({ id: user.id, email: user.email },
                        JWTSecret, {
                            expiresIn: "48h",
                        },
                        (err, token) => {
                            if (err) {
                                res.status(400);
                                res.json({ err: "Falha interna" });
                            } else {
                                res.status(200);
                                res.json({ token: token });
                            }
                        }
                    );
                } else {
                    res.status(400);
                    res.json({ err: "Senha incorreta!" });
                }
            } else {
                res.status(404);
                res.json({ err: "O usuário não existe na base de dados!" });
            }
        });
    } else {
        res.status(400);
        res.json({ err: "Digite o email!" });
    }
});

app.listen(7854, () => {
    console.log("API Rodando!");
});