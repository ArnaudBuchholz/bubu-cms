"use strict";

const
    fs = require("fs"),
    path = require("path"),
    cachedPokemons = path.join(__dirname, "cache", "pokemons.json"),

    asyncRead = fileName => new Promise((resolve, reject) => {
        fs.readFile(fileName, (err, content) => err
            ? reject(err)
            : resolve(content)
        )
    })
;

module.exports = db => {

    const
        Pokemon = gpf.define({
            $class: "Pokemon",
            $extend: db.Record,

            _statusState1: db.Record.STATE.show,
            _statusState2: db.Record.STATE.show,

            constructor: function (raw) {
                // const
                //     calories = parseInt(raw.calories, 10),
                //     portions = parseInt(raw.portions, 10);
                // this._number = Math.floor(calories / portions);
                // this._icon = `/images/recipe/${raw.id}.jpg`;
                // this._statusText1 = portions.toString();
                // this._statusText2 = raw.ready + "m";
                this.$super(raw);
            }

        });

    return asyncRead(cachedPokemons)
        .then(fileContent => JSON.parse(fileContent.toString()))
        .catch(() => gpf.http.get("https://pokeapi.co/api/v2/pokemon/")
            .then(response => JSON.parse(response.responseText))
            .then(response => {
                const pokemons = [];
                return gpf.forEachAsync(response.results, (result, idx) => {
                    console.log(`Downloading ${result.url}`);
                    return gpf.http.get(result.url)
                        .then(response => JSON.parse(response.responseText))
                        .then(pokemon => {
                            pokemons[idx] = pokemon;
                        })
                }).then(() => pokemons)
            })
            .then(pokemons => {
                fs.writeFile(cachedPokemons, JSON.stringify(pokemons));
                return pokemons;
            })
        )
        .then(pokemons => {
            return db.loadRecords(pokemons.map(data => new Pokemon({
                id: `pokemon.${data.order}`,
                icon: data.sprites.front_default,
                name: data.name,
                number: data.order,
                statusText1: data.height,
                statusText2: data.weight,
                tags: data.types.map(type => type.type.name).join(" ")
            })));
        });

};
