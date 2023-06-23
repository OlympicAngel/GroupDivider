/** @type {Player[]} */
var players = []

const teams = [new Team(), new Team(), new Team()];

/**
 * @param {SubmitEvent} e 
 */
function NewPlayer(e) {
    e.preventDefault();

    const input = document.querySelector("#newPlayerInput");
    const username = input.value;
    input.value = ""

    //if name already exist
    const otherPlayerWithTheSameName = SearchPlayer.find(username);
    if (otherPlayerWithTheSameName) {
        let errorDesc = `השם "${username}" כבר מופיע ברשימת שחקנים!`
        if (otherPlayerWithTheSameName.name != username)
            errorDesc = `השם שהוזן ממש דומה לשם של משתמש אחר: "${otherPlayerWithTheSameName.name}".
יש להשתמש בשם אחר יחודי יותר.`
        return alert(errorDesc)
    }

    const newPlayer = new PlayerElement([], username, 0);
    players.push(newPlayer)


    //add to user select on dropbox
    let opt = document.createElement("option")
    opt.textContent = newPlayer.displayName;
    opt.value = newPlayer.id;
    document.querySelector("#playerPrefferSelect").append(opt)

    //add to autocomplete dataset
    let dataListOpt = opt.cloneNode()
    dataListOpt.setAttribute("player", newPlayer.id)
    dataListOpt.value = newPlayer.name;
    document.querySelector("#playerList").append(dataListOpt)

    document.getElementById("teamView").append(newPlayer.element)

    updatePlayerEditDiv();
    RenderTeams();
}

function deletePlayer() {
    const deletePlayer = getEditPagePlayer();
    if (!confirm("האם למחוק את השחקן: " + deletePlayer.name))
        return;
    const removeFromPrefer = confirm("השחקן מיד ימחק!\nלפני זה, האם להסיר את השחקן הזה מהעדפות של שאר השחקנים?");
    //for each player remove from prefer
    players.forEach(player => {
        for (let i = 0; i < player.prefers.length; i++) {
            if (player.prefers[i] == deletePlayer.id) {
                if (removeFromPrefer) {
                    player.prefers.splice(i, 1);
                    i--;
                }
                else {
                    player.prefers[i] = deletePlayer.name
                }

            }
        }
    });


    //remove from player array
    for (let i = 0; i < players.length; i++) {
        if (players[i].id == deletePlayer.id) {
            players.splice(i, 1);
            break;
        }
    }

    document.querySelector(`#playerList option[player="${deletePlayer.id}"]`).remove();
    document.querySelector(`#playerPrefferSelect option[value="${deletePlayer.id}"]`).remove();

    deletePlayer.element.remove();

    teams.forEach((team) => {
        team.empty();
    })

    updatePlayerEditDiv();//update player setting GUI;
    RenderTeams();
}

/**
 * get a PlayerElement reference of current selected player to edit
 * @returns {PlayerElement}
 */
function getEditPagePlayer() {
    const selectOpt = document.querySelector("#playerPrefferSelect")
    const selectedPlayerID = selectOpt.options[selectOpt.selectedIndex].value;
    return SearchPlayer.find(selectedPlayerID)
}


/**
 * visually updates the player prefer edit GUI
 */
function updatePlayerEditDiv() {
    /** @type {HTMLInputElement} */
    const el = document.getElementById("playerEdit")
    //disables the GUI if no players
    el.classList[players.length ? "remove" : "add"]("disabled")

    const selectOpt = document.querySelector("#playerPrefferSelect")
    if (selectOpt && selectOpt.options.length == 0)
        return;

    const selectedPlayer = getEditPagePlayer();

    document.querySelector("#teamView div.selected")?.classList.remove("selected")
    document.querySelector(`#player-` + selectedPlayer.id).classList.add("selected")

    document.querySelectorAll("#teamView div.link").forEach((el) => {
        el.classList.remove("link")
    })



    //update name input
    document.querySelector("#editName").value = selectedPlayer.name;
    //updates the prefer list inputs 
    let preferListEl = document.querySelectorAll("#freferOpts input")
    for (let index = 0; index < preferListEl.length; index++) {
        /** @type {HTMLInputElement} */
        const element = preferListEl[index],
            preferStr = selectedPlayer.prefers[index],
            prefer = SearchPlayer.find(preferStr);

        if (prefer) {
            prefer.element.classList.add("link");
        }

        //show name from player -> fallback to original input if fail -> fallback to none if undefined input value.
        element.value = (prefer && prefer.name) || preferStr || "";

        element.nextElementSibling.className = "icon " + ((element.value.length <= 2 || element.value && SearchPlayer.find(element.value)) ? "none" : "");

    }
}

/**
 * adds & removes the amount of possible prefers per player
 * Triggers on settings change
 * @param {HTMLInputElement} el 
 */
function settings_referCountChange(el) {
    let container = document.getElementById("freferOpts");
    let cPlayer = getEditPagePlayer();
    el.value = ~~(el.value)
    const preferCount = Number(el.value);

    let htmlStr = ""
    for (let index = 1; index < preferCount + 1; index++) {
        htmlStr += `<label for="prefer ${index}">${index}:</label>
                    <input id="prefer ${index}" class="inline" list="playerList" value="${SearchPlayer.find(cPlayer.prefers[index - 1])?.name || cPlayer.prefers[index - 1]}"
                            minlength="2" placeholder="שחקן מועדף מספר #${index}" oninput="updatePreferList(event)">
                    <span class="icon none"></span><label></label>
                    <br>`
    }
    container.innerHTML = htmlStr;
}


/**
 * adds & removes the amount of teams
 * Triggers on settings change
 * @param {HTMLInputElement} el 
 */
function settings_teamCountChange(el) {
    el.value = ~~(el.value)
    const teamCount = Number(el.value);

    //create new teams
    for (let index = teams.length; index < teamCount; index++) {
        teams[index] = new Team();
    }

    teams.forEach((team) => {
        team.empty();
    })

    //remove teams if needed
    const removedTeams = teams.splice(teamCount);
    removedTeams.forEach((team) => {
        team.element.remove();
    })
    RenderTeams();
}

function onEditPlayerName_input(e) {
    const currentName = e.target.value;
    let p;
    //if length is below2 OR if name already exist in players array
    if (currentName.length < 2 || (p = SearchPlayer.find(currentName), p && p != getEditPagePlayer())) {
        document.querySelector("#nameExistError").setAttribute("shown", true)
    }
    else {
        document.querySelector("#nameExistError").setAttribute("shown", false)
    }
}

function onUpdatePlayerName() {
    document.querySelector("#nameExistError").setAttribute("shown", false)

    const player = getEditPagePlayer();
    const editNameInput = document.querySelector("#editName");
    const name = editNameInput.value;

    //if new name is not good - revert to old name
    if (name.length < 2 || SearchPlayer.find(name)) {
        editNameInput.value = player.name;
        return;
    }

    player.name = name;
    const dataList_opt = document.querySelector(`#playerList option[player="${player.id}"]`);
    if (dataList_opt)
        dataList_opt.value = name;

    const select_opt = document.querySelector(`#playerPrefferSelect option[value="${player.id}"]`);
    if (select_opt)
        select_opt.textContent = player.displayName;

}

let preferOnChangeUpdateTimeout;
const preferOnChangeUpdateTimeout_delay = 0.5;
let preferSameNameTimeout;
/**
 * updates player's prefer list when user write new player names on input(s)
 */
function updatePreferList(event) {
    clearTimeout(preferOnChangeUpdateTimeout)
    clearTimeout(preferSameNameTimeout)
    preferOnChangeUpdateTimeout = setTimeout(RenderTeams, preferOnChangeUpdateTimeout_delay * 1000)

    const cPlayer = getEditPagePlayer();
    cPlayer.prefers = [];

    const inputs = document.querySelectorAll("#freferOpts input");
    for (let input of inputs) {
        let name = input.value;

        const removeAlerts = () => {
            input.nextElementSibling.classList.remove("good")
            input.nextElementSibling.classList.remove("none")
            input.nextElementSibling.classList.remove("error")
        }

        if (name.length <= 2) {
            removeAlerts();
            input.nextElementSibling.classList.add("none")
            continue;
        }

        const searchedPlayer = SearchPlayer.find(name);
        if (name == cPlayer.name || (searchedPlayer && searchedPlayer.name == cPlayer.name)) {
            input.nextElementSibling.classList.add("error")
            preferSameNameTimeout = setTimeout(() => {
                removeAlerts();
                input.nextElementSibling.classList.add("none")
                input.value = ""
            }, preferOnChangeUpdateTimeout_delay * 1000 - 20);
            continue;
        }

        if (searchedPlayer && searchedPlayer != name) {
            input.nextElementSibling.classList.add("good")
            searchedPlayer.element.classList.add("link");
        }
        else {
            removeAlerts();
        }

        cPlayer.prefers.push(name)
    }
}

function shufflePlayers() {
    shuffle(players)
    RenderTeams();
}


/**
 * update teams GUI
 */
function RenderTeams() {
    clearTimeout(preferOnChangeUpdateTimeout)
    sortTeams();

    const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
        '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
        '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
        '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
        '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
        '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
        '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
        '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
        '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
        '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];
    teams.forEach((team, index) => {
        if (team.color != colors[index]) {
            team.color = colors[index];
            document.getElementById("teamView").append(team.element)
        }
    });
}

//main team sort function
function sortTeams() {
    teams.forEach((team) => {
        team.empty();
    })

    const playerPool = [...players]
    let playerCount = players.length;
    for (let player of playerPool) {
        console.warn("\n" + player.displayName)
        //if not in team
        if (!player.team) {
            const team = getSmallestTeam(); //get least full team
            team.addPlayer(player)
        }

        //convert names to player obj
        player.PreferList_2_ID();

        //for each preference
        for (let i = 0; i < player.prefers.length && player.teamId != -1; i++) {
            let wantPlayer = SearchPlayer.find(player.prefers[i]) //get player ref by the id stored at prefer list
            //if not a player
            if (!(wantPlayer instanceof Player))
                continue;

            //if wanted player is the same team
            if (wantPlayer.team == player.team)
                continue

            console.log(`\t${wantPlayer.displayName} bonded to ${player.displayName} / ${player.bondTo(wantPlayer, true)}`);

            const otherTeam = wantPlayer.team;
            const playerTeam = player.team

            //if wanted player is not on team just add him
            if (!wantPlayer.team) {
                console.log(`\t${wantPlayer.displayName} & has no team.`)
                player.team.addPlayer(wantPlayer)
            }
            else {
                //if wanted player is in other team

                console.log(`\t${wantPlayer.displayName} has a bond to ${player.displayName} but he is in team ${otherTeam.displayName} - comparing bond strength`)

                //compare wanted player bond value for each team
                if (otherTeam.playerBond(wantPlayer) > playerTeam.playerBond(wantPlayer)) {
                    console.log(`\tfailed to move ${wantPlayer.displayName} from ${otherTeam.displayName} to #${otherTeam.displayName} - older bond is stronger`);
                    continue
                }
                console.log(`\tmoving ${wantPlayer.displayName} from team ${otherTeam.displayName} to team ${playerTeam.displayName} - newer bond is stronger`);

                //if bond is lesser move player to current team;

                otherTeam.removePlayer(wantPlayer)
                playerTeam.addPlayer(wantPlayer)
            }

            //if team is not full keep going
            if (playerTeam.size <= Math.ceil(playerCount / teams.length))
                continue;

            //if full check for less bonded player and remove it.


            const lessBondedPlayer = playerTeam.lessBondedPlayer();
            playerTeam.removePlayer(lessBondedPlayer);
            console.log(`\tAfter moving => team is to big, removing ${lessBondedPlayer.displayName} as he has the lowest bond score`);

            playerPool.push(lessBondedPlayer)// re-adding to player list to the play could be join in other cycle
            lessBondedPlayer.inPoolCount++;
        }
    }
}

/**
 * get smallest team
 * @returns {Team}
 */
function getSmallestTeam() {
    return teams.sort((a, b) => {
        return a.size < b.size ? -1 : 1
    })[0]
}


function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}