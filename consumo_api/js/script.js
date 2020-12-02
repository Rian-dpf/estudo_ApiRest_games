function createGame() {
    let titleInput = document.getElementById("title");
    let priceInput = document.getElementById("price");
    let yearInput = document.getElementById("year");

    let game = {
        title: titleInput.value,
        price: priceInput.value,
        year: yearInput.value,
    };

    axios
        .post("http://127.0.0.1:7854/game", game)
        .then((res) => {
            if (res.status == 200) {
                alert("Game cadastrado!");
            }
        })
        .catch((err) => {});
}

function loadForm(listItem) {
    let id = listItem.getAttribute("data-id");
    let title = listItem.getAttribute("data-title");
    let year = listItem.getAttribute("data-year");
    let price = listItem.getAttribute("data-price");

    document.getElementById("idEdit").value = id;
    document.getElementById("titleEdit").value = title;
    document.getElementById("yearEdit").value = year;
    document.getElementById("priceEdit").value = price;
}

function updateGame() {
    let idInput = document.getElementById("idEdit");
    let titleInput = document.getElementById("titleEdit");
    let priceInput = document.getElementById("priceEdit");
    let yearInput = document.getElementById("yearEdit");

    let game = {
        title: titleInput.value,
        price: priceInput.value,
        year: yearInput.value,
    };

    let id = idInput.value;

    axios
        .put("http://127.0.0.1:7854/game/" + id, game)
        .then((res) => {
            if (res.status == 200) {
                alert("Game atualizado!");
            }
        })
        .catch((err) => {});
}

function deleteGame(listItem) {
    let id = listItem.getAttribute("data-id");
    axios
        .delete("http://127.0.0.1:7854/game/" + id)
        .then((res) => {
            alert("Game deletado!");
        })
        .catch((err) => {
            console.log(err);
        });
}

axios
    .get("http://127.0.0.1:7854/games")
    .then((res) => {
        let games = res.data;

        let list = document.getElementById("games");

        games.forEach((game) => {
            let item = document.createElement("li");

            item.setAttribute("data-id", game.id);
            item.setAttribute("data-title", game.title);
            item.setAttribute("data-price", game.price);
            item.setAttribute("data-year", game.year);

            item.innerHTML = game.id + " - " + game.title + " - $" + game.price + " ";

            let deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "Deletar";
            deleteBtn.addEventListener("click", () => {
                deleteGame(item);
            });

            let editBtn = document.createElement("button");
            editBtn.innerHTML = "Editar";
            editBtn.addEventListener("click", () => {
                loadForm(item);
            });

            item.appendChild(deleteBtn);
            item.appendChild(editBtn);

            list.appendChild(item);
        });
    })
    .catch((err) => {
        console.log(err);
    });