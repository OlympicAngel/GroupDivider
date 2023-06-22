class Team {
    static autoId = 0;
    #color;
    constructor(name) {
        this.id = Team.autoId;
        this.name = name;
        /**@type {Player[]} */
        this.players = []
        /** @type {HTMLDivElement} */
        this.element = document.createElement("div");
        this.element.className = "team"
        this.#color = "transparent";
        Team.autoId++;
    }

    get size() {
        return this.players.length;
    }

    /**
     * adds a player to team
     * @param {PlayerElement} p 
     */
    addPlayer(p) {
        p.teamId = this.id;
        this.players.push(p);
        p.color = this.#color;
        this.log(`Adding ${p.displayName} to team.`)

        this.element.append(p.element)
    }

    /**
     * remove a player from the team
     * @param {PlayerElement} p 
     */
    removePlayer(p) {
        this.log(`Removing ${p.displayName} to team.`)
        let playerIndex = this.players.indexOf(p)
        if (playerIndex == -1)
            return false && this.log(`Could not remove player / ${p.displayName}; he not in the team.`)
        this.players.splice(playerIndex, 1)
        p.teamId = undefined;
        p.color = "transparent";

        try { this.element.removeChild(p.element) } catch (e) { }

    }



    /**
     * evaluate the bond strength of a player within the team.
     * @param {Player} p 
     * @returns {Number}
     */
    playerBond(p) {
        //if no players in team
        if (this.size == 0)
            return 0;

        let bondVal = p.inPoolCount;
        for (const teamPlayer of this.players) {
            if (p == teamPlayer) //prevent comparing bond of the same player
                continue

            let pBond = p.bondTo(teamPlayer) * 1.5 + //how close teamPlayer is to p
                teamPlayer.bondTo(p); //how close p to teamPlayer
            bondVal += pBond;
        }
        const calcValue = bondVal * 0.5 + 0.5 * bondVal / this.size;
        return calcValue;
    }

    /**
     * sum whole team bond value
     * @returns {Number}
     */
    bond() {
        return this.players.reduce((a, b) => { return a + this.playerBond(b) }, 0)
    }

    /**
     * 
     * @returns {Player}
     */
    lessBondedPlayer() {
        let lessBondedPlayer;
        let lessBondedPlayer_score = Infinity;
        for (let x = 0; x < this.players.length; x++) {
            const t_p = this.players[x];
            const bondScore = this.playerBond(t_p);
            if (bondScore < lessBondedPlayer_score) {
                lessBondedPlayer = t_p;
                lessBondedPlayer_score = bondScore
            }
        }
        return lessBondedPlayer
    }

    static log = true;
    log(data) {
        console.log(`[TEAM ${this.displayName}]: `, data)
    }

    empty() {
        this.players.forEach(player => {
            this.removePlayer(player)
        });
    }

    get displayName() {
        return `${this.name || "?"}#${this.id}`
    }

    set color(color) {
        this.#color = color;
        //for each player in team update color
        this.players.forEach(p => {
            p.color = color;
        });

        this.element.setAttribute("style", "--color: " + color)
    }

    get color() {
        return this.#color
    }
}