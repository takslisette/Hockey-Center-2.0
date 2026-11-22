
/*
    Hockey Center 2.0
    Projekti 3

    jQuery: AJAX, DOM ja tapahtumankuuntelijat
    Bootstrap 5: käyttöliittymä
    localStorage: suosikkijoukkueen tallentaminen
*/

// NHL API -osoitteet
const API_URL =
    "https://proxy.cors.dev/https://api-web.nhle.com/v1/standings/now";

const GAMES_API_URL =
    "https://proxy.cors.dev/https://api-web.nhle.com/v1/score/now";

// Kaikki NHL-joukkueet
let allTeams = [];


// ==========================================
// 1. NHL-JOUKKUEIDEN HAKEMINEN
// ==========================================

function getTeams() {

    $("#teams").text("Ladataan joukkueita...");

    $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {

            if (!Array.isArray(data.standings)) {
                $("#teams").text("Joukkueita ei löytynyt.");
                return;
            }

            allTeams = data.standings;

            displayTeams(allTeams);
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

    const container = $("#teams");

    container.empty();

    if (!teams || teams.length === 0) {
        container.text("Joukkueita ei löytynyt.");
        return;
    }

    teams.forEach(function(team) {

        const card = $("<div>")
            .addClass("team-card");

        const logo = $("<img>")
            .attr("src", team.teamLogo)
            .attr("alt", team.teamName.default + " logo")
            .addClass("team-logo");

        const name = $("<h3>")
            .text(team.teamName.default);

        const points = $("<p>")
            .text("Pisteet: " + team.points);

        const wins = $("<p>")
            .text("Voitot: " + team.wins);

        const losses = $("<p>")
            .text("Tappiot: " + team.losses);

        card.append(logo, name, points, wins, losses);

        container.append(card);
    });
}


// ==========================================
// 3. JOUKKUEIDEN HAKUTOIMINTO
// ==========================================

function initializeSearch() {

    $("#teamSearch").on("input", function() {

        const searchText = $(this).val().toLowerCase();

        const filteredTeams = allTeams.filter(function(team) {

            return team.teamName.default
                .toLowerCase()
                .includes(searchText);
        });

        displayTeams(filteredTeams);
    });
}


// ==========================================
// 4. PÄIVÄN NHL-OTTELUIDEN HAKEMINEN
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

            console.error("Otteluvirhe:", status, error);

            $("#games").text(
                "Otteluiden lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 5. OTTELUIDEN NÄYTTÄMINEN
// ==========================================

function displayGames(games) {

    const container = $("#games");

    container.empty();

    if (!games || games.length === 0) {
        container.text("Tänään ei ole NHL-otteluita.");
        return;
    }

    games.forEach(function(game) {

        const card = $("<div>")
            .addClass("team-card");

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

        const status = $("<p>")
            .text("Ottelun tila: " + game.gameState);

        card.append(homeTeam, awayTeam, status);

        container.append(card);
    });
}


// ==========================================
// 6. SARJATAULUKON HAKEMINEN
// ==========================================

function getStandings() {

    $("#standings").text("Ladataan sarjataulukkoa...");

    $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json",
        timeout: 15000,

        success: function(data) {
            displayStandings(data.standings);
        },

        error: function(xhr, status, error) {

            console.error("Sarjataulukon virhe:", status, error);

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

    const container = $("#standings");

    container.empty();

    if (!teams || teams.length === 0) {
        container.text("Sarjataulukkoa ei löytynyt.");
        return;
    }

    // Bootstrapin tumma taulukko
    const table = $("<table>")
        .addClass("table table-dark table-striped table-hover");

    const thead = $("<thead>");
    const tbody = $("<tbody>");

    const headerRow = $("<tr>");

    const headers = [
        "Sija",
        "Joukkue",
        "Ottelut",
        "Voitot",
        "Pisteet"
    ];

    headers.forEach(function(header) {

        headerRow.append(
            $("<th>").text(header)
        );
    });

    thead.append(headerRow);

    // Järjestetään joukkueet pisteiden mukaan
    const sortedTeams = [...teams].sort(function(a, b) {
        return b.points - a.points;
    });

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

    const wrapper = $("<div>")
        .addClass("table-responsive");

    wrapper.append(table);

    container.append(wrapper);
}


// ==========================================
// 8. JOUKKUEVALIKON TÄYTTÄMINEN
// ==========================================

function populateTeamSelect(teams) {

    const select = $("#teamSelect");

    select.empty();

    select.append(
        $("<option>")
            .val("")
            .text("Valitse NHL-joukkue")
    );

    teams.forEach(function(team) {

        const option = $("<option>")
            .val(team.teamAbbrev.default)
            .text(team.teamName.default);

        select.append(option);
    });
}


// ==========================================
// 9. JOUKKUEEN OTTELUOHJELMAN HAKEMINEN
// ==========================================

function getTeamSchedule(teamAbbrev) {

    const scheduleUrl =
        "https://proxy.cors.dev/https://api-web.nhle.com/v1/club-schedule-season/" +
        encodeURIComponent(teamAbbrev) + "/now";

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

            console.error("Otteluohjelman virhe:", status, error);

            $("#teamSchedule").text(
                "Otteluohjelman lataaminen epäonnistui."
            );
        }
    });
}


// ==========================================
// 10. OTTELUOHJELMAN NÄYTTÄMINEN
// ==========================================

function displayTeamSchedule(games) {

    const container = $("#teamSchedule");

    container.empty();

    if (!games || games.length === 0) {
        container.text("Otteluita ei löytynyt.");
        return;
    }

    games.forEach(function(game) {

        const card = $("<div>")
            .addClass("team-card");

        const date = $("<p>")
            .text("Päivämäärä: " + game.gameDate);

        const teams = $("<h3>")
            .text(
                game.awayTeam.abbrev + " " +
                (game.awayTeam.score ?? "-") +
                " – " +
                (game.homeTeam.score ?? "-") +
                " " + game.homeTeam.abbrev
            );

        const status = $("<p>")
            .text("Ottelun tila: " + game.gameState);

        card.append(date, teams, status);

        container.append(card);
    });
}


// ==========================================
// 11. JOUKKUEVALIKON KUUNTELIJA
// ==========================================

function initializeTeamSelect() {

    $("#teamSelect").on("change", function() {

        const selectedTeam = $(this).val();

        if (selectedTeam) {

            getTeamSchedule(selectedTeam);

        } else {

            $("#teamSchedule").text(
                "Valitse joukkue nähdäksesi sen otteluohjelman."
            );
        }
    });
}


// ==========================================
// 12. SUOSIKKIJOUKKUEEN TALLENTAMINEN
// ==========================================

function initializeFavorites() {

    // Haetaan aikaisemmin tallennettu suosikki
    const savedFavorite = localStorage.getItem("favoriteTeam");

    if (savedFavorite) {

        $("#favoriteTeam").text(
            "⭐ Suosikkijoukkueesi: " + savedFavorite
        );
    }

    // Tallennuspainikkeen tapahtumankuuntelija
    $("#saveFavorite").on("click", function() {

        const selectedTeam = $("#teamSelect").val();

        // Tarkistetaan, että joukkue on valittu
        if (!selectedTeam) {

            $("#favoriteTeam").text(
                "Valitse ensin joukkue!"
            );

            return;
        }

        // Haetaan joukkueen nimi
        const teamName = $("#teamSelect option:selected").text();

        // Tallennetaan suosikki selaimen muistiin
        localStorage.setItem("favoriteTeam", teamName);

        // Näytetään tallennettu suosikki
        $("#favoriteTeam").text(
            "⭐ Suosikkijoukkueesi: " + teamName
        );

        console.log("Suosikkijoukkue tallennettu:", teamName);
    });
}


// ==========================================
// 13. SOVELLUKSEN KÄYNNISTÄMINEN
// ==========================================

// Odotetaan, että HTML on latautunut
$(document).ready(function() {

    console.log("Hockey Center 2.0 käynnistyy!");

    // Tapahtumankuuntelijat
    initializeSearch();
    initializeTeamSelect();
    initializeFavorites();

    // API-tietojen hakeminen
    getTeams();
    getGames();
    getStandings();

});
