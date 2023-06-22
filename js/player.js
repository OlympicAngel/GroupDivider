
class Player {
    static i = 0;
    #name;
    #teamId;

    /**
     * @param {String} name 
     * @param {Number} subs 
     * @param {Number[]} prefers 
     */
    constructor(prefers = [], name, subs) {

        this.prefers = prefers;
        this.#name = name;
        this.id = Player.i
        this.#teamId = -1;
        this.inPoolCount = 0;
        Player.i++;
    }

    get name() { return this.#name };
    set name(n) { this.#name = n }

    get teamId() { return this.#teamId };
    set teamId(n) { this.#teamId = n }


    get displayName() {
        return (this.name || "?") + " #" + this.id;
    }

    /**
     * @returns {Team}
     */
    get team() {
        return (window.teams || teams).find((t) => { return t.id == this.teamId })
    }

    /**
     * return a value of how close is the bond of a player
     * @param {Player} player 
     * @returns {Number}
     */
    bondTo(p, formate = false) {
        this.PreferList_2_ID();
        let bondVal = 0;
        for (let i = 0; i < this.prefers.length; i++) {
            if (this.prefers[i] == p.id) { //if p is in player's prefer list
                bondVal = 1 - (i / this.prefers.length) ** 2; //from 0 to 1 how desired is he (1 is most)
                break;
            }
        }

        console.log(bondVal)
        return (formate) ? (~~(bondVal * 100) + "%") : bondVal;
    }

    toString() {
        return this.displayName
    }

    /**
     * for each prefer that is a string try to convert to Player obj
     * @returns 
     */
    PreferList_2_ID() {
        const errors = [];
        if (!window.players)
            return errors;
        for (let i = 0; i < this.prefers.length; i++) {
            const preferName = this.prefers[i];
            //if preferName is not an id reference
            if (preferName == undefined || typeof preferName == "number")
                continue;

            //search the player by name
            const playerRef = SearchPlayer.find(preferName)

            //if still no match skip and log for error showup GUI
            if (!playerRef) {
                errors.push(preferName);
                continue;
            }
            this.prefers[i] = playerRef.id// if did found player ref - replace the text with it
        }

        return errors;
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class PlayerElement extends Player {
    /** @type {HTMLDivElement} */
    element;

    constructor(...args) {
        super(...args)
        this.element = this.#createElement();

        this.name;
        this.teamId;
    }


    get #elementID() {
        return "player-" + this.id;
    }

    #createElement() {
        const el = document.createElement("div");
        el.setAttribute("id", this.#elementID);
        el.innerText = this.name

        return el;
    }

    set name(name) {
        super.name = name
        if (this.element)
            this.element.innerText = name
    }
    get name() { return super.name }

    set teamId(id) {
        super.teamId = id;
        if (this.element)
            this.element.setAttribute("team", id)
    }
    get teamId() { return super.teamId }


    set color(c) {
        if (this.element)
            this.element.style.setProperty("--color", c);
    }

}