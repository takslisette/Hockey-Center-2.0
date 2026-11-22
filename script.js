
/*
    Hockey Center 2.0
    Projekti 3 - JavaScript ulkoisilla kirjastoilla

    Käytetyt kirjastot:
    - jQuery: AJAX, DOM-käsittely ja tapahtumankuuntelijat
    - Bootstrap 5: käyttöliittymän ulkoasu
*/

// NHL API -osoitteet
const API_URL = "https://proxy.cors.dev/https://api-web.nhle.com/v1/standings/now";

const GAMES_API_URL = "https://proxy.cors.dev/https://api-web.nhle.com/v1/score/now";

const STANDINGS_API_URL = API_URL;

// Tallennetaan NHL-joukkueet tähän taulukkoon
let allTeams = [];


// ==========================================
// 1. NHL-JOUKKUEIDEN HAKEMINEN
// ==========================================

function getTeams() {

    $("#teams").text("Ladataan joukkueita...");

    // Haetaan tiedot jQuery AJAX -kutsulla
    $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {

            // Tarkistetaan, että joukkueita löytyi
            if (!data.standings) {
                $("#teams").text("Joukkueita ei löytynyt.");
                return;
            }

            // Tallennetaan joukkueet
            allTeams = data.standings;

            // Näytetään joukkuekortit
            displayTeams(allTeams);

            // Täytetään joukkuevalikko
            populateTeamSelect(allTeams);
        },

        error: function(xhr, status, error) {

            console.error("Joukkueiden API-virhe:", status, error);

            $("#teams").text(
                "Joukkueiden lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 2. JOUKKUEKORTTIEN NÄYTTÄMINEN
// ==========================================

function displayTeams(teams) {

    const teamsContainer = $("#teams");

    // Tyhjennetään vanhat kortit
    teamsContainer.empty();

    if (!teams || teams.length === 0) {
        teamsContainer.text("Joukkueita ei löytynyt.");
        return;
    }

    // Käydään joukkueet läpi
    teams.forEach(function(team) {

        // Luodaan kortti jQueryllä
        const teamCard = $("<div>").addClass("team-card");

        // Joukkueen logo
        const logo = $("<img>")
            .attr("src", team.teamLogo)
            .attr("alt", team.teamName.default + " logo")
            .addClass("team-logo");

        // Joukkueen nimi
        const name = $("<h3>")
            .text(team.teamName.default);

        // Pisteet
        const points = $("<p>")
            .text("Pisteet: " + team.points);

        // Voitot
        const wins = $("<p>")
            .text("Voitot: " + team.wins);

        // Tappiot
        const losses = $("<p>")
            .text("Tappiot: " + team.losses);

        // Lisätään tiedot korttiin
        teamCard.append(
            logo,
            name,
            points,
            wins,
            losses
        );

        // Lisätään kortti sivulle
        teamsContainer.append(teamCard);
    });
}


// ==========================================
// 3. JOUKKUEIDEN HAKUTOIMINTO
// ==========================================

function initializeSearch() {

    // Kuunnellaan hakukentän kirjoittamista
    $("#teamSearch").on("input", function() {

        // Luetaan hakusana
        const searchText = $(this)
            .val()
            .toLowerCase();

        // Suodatetaan joukkueet
        const filteredTeams = allTeams.filter(function(team) {

            return team.teamName.default
                .toLowerCase()
                .includes(searchText);
        });

        // Näytetään hakutulokset
        displayTeams(filteredTeams);
    });
}


// ==========================================
// 4. NHL-OTTELUIDEN HAKEMINEN
// ==========================================

function getGames() {

    $("#games").text("Ladataan otteluita...");

    $.ajax({
        url: GAMES_API_URL,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {

            displayGames(data.games);
        },

        error: function(xhr, status, error) {

            console.error("Otteluiden API-virhe:", status, error);

            $("#games").text(
                "Otteluiden lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 5. NHL-OTTELUIDEN NÄYTTÄMINEN
// ==========================================

function displayGames(games) {

    const gamesContainer = $("#games");

    gamesContainer.empty();

    if (!games || games.length === 0) {
        gamesContainer.text("Tänään ei ole NHL-otteluita.");
        return;
    }

    games.forEach(function(game) {

        const gameCard = $("<div>")
            .addClass("team-card");

        // Koti- ja vierasjoukkue
        const homeTeam = $("<h3>")
            .text(
                game.homeTeam.abbrev + " " +
                (game.homeTeam.score ?? "-")
            );

        const awayTeam = $("<h3>")
            .text(
                game.awayTeam.abbrev + " " +
                (game.awayTeam.score ?? "-")
            );

        // Ottelun tila
        const status = $("<p>")
            .text("Ottelun tila: " + game.gameState);

        gameCard.append(
            homeTeam,
            awayTeam,
            status
        );

        gamesContainer.append(gameCard);
    });
}


// ==========================================
// 6. NHL-SARJATAULUKON HAKEMINEN
// ==========================================

function getStandings() {

    $("#standings").text("Ladataan sarjataulukkoa...");

    $.ajax({
        url: STANDINGS_API_URL,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {

            displayStandings(data.standings);
        },

        error: function(xhr, status, error) {

            console.error("Sarjataulukon API-virhe:", status, error);

            $("#standings").text(
                "Sarjataulukon lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 7. SARJATAULUKON NÄYTTÄMINEN
// ==========================================

function displayStandings(teams) {

    const standingsContainer = $("#standings");

    standingsContainer.empty();

    if (!teams || teams.length === 0) {
        standingsContainer.text("Sarjataulukkoa ei löytynyt.");
        return;
    }

    // Luodaan taulukko
    // Luodaan tumma Bootstrap-taulukko
const table = $("<table>")
    .addClass("table table-dark table-striped table-hover");

    // Taulukon otsikkorivi
    const headerRow = $("<tr>");

    const headers = [
        "Sija",
        "Joukkue",
        "Ottelut",
        "Voitot",
        "Pisteet"
    ];

    headers.forEach(function(headerText) {

        const th = $("<th>").text(headerText);

        headerRow.append(th);
    });

    const thead = $("<thead>").append(headerRow);
    const tbody = $("<tbody>");

    // Järjestetään joukkueet pisteiden mukaan
    const sortedTeams = [...teams].sort(function(a, b) {
        return b.points - a.points;
    });

    // Lisätään joukkueet taulukkoon
    sortedTeams.forEach(function(team, index) {

        const row = $("<tr>");

        row.append(
            $("<td>").text(index + 1),
            $("<td>").text(team.teamName.default),
            $("<td>").text(team.gamesPlayed),
            $("<td>").text(team.wins),
            $("<td>").text(team.points)
        );

        tbody.append(row);
    });

    table.append(thead, tbody);

    // Bootstrapin responsiivinen taulukko
    const tableWrapper = $("<div>")
        .addClass("table-responsive");

    tableWrapper.append(table);

    standingsContainer.append(tableWrapper);
}


// ==========================================
// 8. JOUKKUEVALIKON TÄYTTÄMINEN
// ==========================================

function populateTeamSelect(teams) {

    const teamSelect = $("#teamSelect");

    // Poistetaan vanhat valinnat
    teamSelect.empty();

    // Lisätään oletusvalinta
    teamSelect.append(
        $("<option>")
            .val("")
            .text("Valitse NHL-joukkue")
    );

    // Lisätään NHL-joukkueet valikkoon
    teams.forEach(function(team) {

        const option = $("<option>")
            .val(team.teamAbbrev.default)
            .text(team.teamName.default);

        teamSelect.append(option);
    });
}


// ==========================================
// 9. VALITUN JOUKKUEEN OTTELUOHJELMA
// ==========================================

function getTeamSchedule(teamAbbrev) {

    const scheduleUrl =
        "https://proxy.cors.dev/https://api-web.nhle.com/v1/club-schedule-season/"
        + encodeURIComponent(teamAbbrev) + "/now";

    $("#teamSchedule").text("Ladataan otteluohjelmaa...");

    $.ajax({
        url: scheduleUrl,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {

            displayTeamSchedule(data.games);
        },

        error: function(xhr, status, error) {

            console.error("Otteluohjelman API-virhe:", status, error);

            $("#teamSchedule").text(
                "Otteluohjelman lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 10. JOUKKUEEN OTTELUOHJELMAN NÄYTTÄMINEN
// ==========================================

function displayTeamSchedule(games) {

    const scheduleContainer = $("#teamSchedule");

    scheduleContainer.empty();

    if (!games || games.length === 0) {

        scheduleContainer.text("Otteluita ei löytynyt.");
        return;
    }

    games.forEach(function(game) {

        const gameCard = $("<div>")
            .addClass("team-card");

        // Ottelun päivämäärä
        const date = $("<p>")
            .text("Päivämäärä: " + game.gameDate);

        // Ottelun joukkueet ja tulos
        const teams = $("<h3>")
            .text(
                game.awayTeam.abbrev + " " +
                (game.awayTeam.score ?? "-") +
                " – " +
                (game.homeTeam.score ?? "-") +
                " " + game.homeTeam.abbrev
            );

        // Ottelun tila
        const status = $("<p>")
            .text("Ottelun tila: " + game.gameState);

        gameCard.append(
            date,
            teams,
            status
        );

        scheduleContainer.append(gameCard);
    });
}


// ==========================================
// 11. JOUKKUEVALIKON TAPAHTUMANKUUNTELIJA
// ==========================================

function initializeTeamSelect() {

    $("#teamSelect").on("change", function() {

        const selectedTeam = $(this).val();

        if (selectedTeam) {

            // Haetaan valitun joukkueen ottelut
            getTeamSchedule(selectedTeam);

        } else {

            $("#teamSchedule").text(
                "Valitse joukkue nähdäksesi sen otteluohjelman."
            );
        }
    });
}


// ==========================================
// 12. SOVELLUKSEN KÄYNNISTÄMINEN
// ==========================================


// ==========================================
// 13. SUOSIKKIJOUKKUEEN TALLENTAMINEN
// ==========================================

function initializeFavorites() {

    // Haetaan aiemmin tallennettu suosikkijoukkue
    const savedFavorite = localStorage.getItem("favoriteTeam");

    // Näytetään tallennettu suosikki sivulla
    if (savedFavorite) {
        $("#favoriteTeam").text(
            "⭐ Suosikkijoukkueesi: " + savedFavorite
        );
    }

    // Kuunnellaan tallennuspainikkeen klikkausta
    $("#saveFavorite").on("click", function() {

        // Haetaan valittu joukkue pudotusvalikosta
        const selectedTeam = $("#teamSelect").val();

        // Tarkistetaan, että joukkue on valittu
        if (!selectedTeam) {
            $("#favoriteTeam").text(
                "Valitse ensin joukkue!"
            );
            return;
        }

        // Haetaan joukkueen nimi valikosta
        const teamName = $("#teamSelect option:selected").text();

        // Tallennetaan suosikkijoukkue selaimeen
        localStorage.setItem("favoriteTeam", teamName);

        // Näytetään tallennettu joukkue käyttäjälle
        $("#favoriteTeam").text(
            "⭐ Suosikkijoukkueesi: " + teamName
        );

        console.log("Suosikkijoukkue tallennettu:", teamName);
    });
}



// ==========================================
// SOVELLUKSEN KÄYNNISTÄMINEN
// ==========================================

$(document).ready(function() {

    console.log("Hockey Center 2.0 käynnistyy!");

    initializeSearch();
    initializeTeamSelect();

    // Käynnistetään suosikkijoukkueen tallennus
    initializeFavorites();

    getTeams();
    getGames();
    getStandings();

});

