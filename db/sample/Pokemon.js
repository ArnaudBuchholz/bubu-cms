"use strict";

module.exports = db => {

    const
        Pokemon = gpf.define({
            $class: "Pokemon",
            $extend: db.Record,

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

    return gpf.http.get("https://pokeapi.co/api/v2/pokemon/")
        .then(response => JSON.parse(response.responseText))
        .then(response => Promise.all(response.results
            .slice(0, 150)
            .map(pokedef => gpf.http.get(pokedef.url))
        ))
        .then(responses => responses.map(response => JSON.parse(response.responseText)))
        .then(pokemons => {
            return db.loadRecords(pokemons.map(data => new Pokemon({
                id: `pokemon.${data.order}`,
                icon: data.sprites.front_default,
                name: data.name
            })));
        });

};
