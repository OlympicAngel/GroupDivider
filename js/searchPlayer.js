class SearchPlayer {
    /**
 * calcs the similar lever of 2 strings.
 * 1 is 100% while 0 is 0%
 * @param {String} a 
 * @param {String} b 
 * @returns {Number} 0-1
 */
    static similarString(a, b) {
        let shortWord = a.length < b.length ? a : b,
            longWord = a.length < b.length ? b : a;
        const letterLengthDifrance = longWord.length - shortWord.length;
        let score = letterLengthDifrance //set base score to be the diffrence in letter count
        let missingLetters = 0;
        //for each letter of the sort word (as letters in the longer word get clac-ed in the last line)
        for (let index = 0; index < shortWord.length; index++) {
            const letter = shortWord[index]; //get current letter
            //gets the pos of current letter - in the longer word
            let longWordCurrentLetterIndex = longWord.indexOf(letter, index)
            //if letter doesnt exist - add 1 (biggest value possible)
            if (longWordCurrentLetterIndex == -1) {
                missingLetters++;
                continue;
            }
            //else - calc the position offset in relation of 1 - 0
            //       (0 is the same place, 1 is comletely the other side E.G first and last letters)
            const relativeDiffrence = (longWordCurrentLetterIndex - index) / longWord.length;
            score += relativeDiffrence ** 2; //add pow calc to lower the diffrence the more close it is
            //replace the letter to prevent duplicates while preserving index location of other letters
            longWord = longWord.replace(letter, "?")
        }
        //add to calculation the missing letters, the less letter missing the more similar ratio it will be.
        score += ((missingLetters / shortWord.length) ** 1.3) * shortWord.length
        score /= longWord.length;
        return (1 - score)
    }

    /**
     * 
     * @param {*} arg 
     * @returns {PlayerElement} player
     */
    static find(arg) {
        //if string can be number - convert it. (making it as id)
        if (!isNaN(arg))
            arg = Number(arg);

        switch (typeof arg) {
            case "number":
                return this.#findByID(arg)
                break;
            case "string":
                return this.#findByName(arg)
                break;
        }
        return;
    }

    /**
     * search all players to find specific one
     * @param {String} name 
     */
    static #findByName(name) {
        //search player by direct match name
        let playerRef = players.find((a) => { return a.name == name; });

        if (!playerRef) {//if not found alter to match ratio
            let bestMatchPlayer,
                bestMatchScore = 0;
            for (const player of players) {
                const similarValue = SearchPlayer.similarString(name, player.name);
                //if more then 90% match take it
                if (similarValue > 0.90) {
                    bestMatchPlayer = player;
                    break;
                }
                //allow to take only 70%+ match
                if (similarValue > 0.70 && similarValue > bestMatchScore) {
                    bestMatchPlayer = player;
                    bestMatchScore = similarValue
                }
            }
            playerRef = bestMatchPlayer;
        }
        return playerRef;
    }

    static #findByID(id) {
        return players.find((player => { return player.id == id }));
    }
}