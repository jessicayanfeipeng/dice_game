class DiceGame {
    constructor(number_players) {
        this.dice = new Dice();
        this.game_over = false;
        this.current_round = 0;
        this.players_array = [];
        this.number_players = number_players;
        this.initialize_players(this.number_players);
        this.enable_playing_field();
    }

    initialize_players(num_players) {
        for (let i = 0; i < num_players; i++) {
            let name = this.get_random_name();
            this.players_array.push(new Player(name));
        }
    }

    get_random_name() {
        const names = ["Adam", "Bob", "Charlie", "David", "Ellen", "Frank", "George", "Helen", "Ivy", "Jennifer", "Kris", "Louis", "Mandy", "Nancy", "Olivier", "Peter", "Richard", "Steve", "Tina", "Victor", "Wendy", "Yvonne", "Zoe"];
        const random_name = names[Math.floor(Math.random() * names.length)];
        return random_name;
    }

    enable_playing_field() {
        // hide choose number of players buttons and rules
        $('div.prompt').css('display', 'none');
        // show roll dice and new game buttons
        $('div.controls').css('display', 'flex');
        // initiate the playing field
        this.create_dynamic_playing_field();
    }

    create_dynamic_playing_field() {
        const container = $('div.container');
        const field = $('div.field');

        // show round number
        container.append(`
            <div id="round">
                <p>
                    Round: <span>${this.current_round}</span>
                </p>
            </div>
        `);

        for (let i = 0; i < this.players_array.length; i++) {
            const name = `${this.players_array[i].name}`;
            const player = `player ${i + 1}`;
            const dice_1 = `${name}_dice_1`;
            const img_1 = `${name}_img_1`;
            const dice_2 = `${name}_dice_2`;
            const img_2 = `${name}_img_2`;

            /*
             * Display:
             *  1. name of the player
             *  2. player X
             *  3. default dice pictures
             *  4. values of dice: null
             *  5. round score: null
             *  6. total score: null
             */
            field.append(`
                <div class="${name} column">
                    <p class="player-name">${name}</p>
                    <p>${player}</p>
                    <div class="dice_column">
                        <div class="dices">
                            <div>
                                <img class="${img_1}" src="images/1_dot_dice.png">
                                <p>Value: <span class="${dice_1}"></span></p>
                            </div>
                            <div>
                                <img class="${img_2}" src="images/1_dot_dice.png">
                                <p>Value: <span class="${dice_2}"></span></p>
                            </div>
                        </div>
                        <div class="score">
                            <p>Round: <span class="round"></span></p>
                            <p>Total: <span class="total"></span></p>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    roll_player_dice() {
        for (let i = 0; i < this.players_array.length; i++) {
            const player = this.players_array[i];
            // roll 2 dice for each player
            player.dice_1_val = Math.floor(Math.random() * 6 + 1);
            player.dice_2_val = Math.floor(Math.random() * 6 + 1);
            // update display with each roll
            this.update_dice_field(player);
        }
        // with each roll, check if it is round 3 yet
        this.evaluate_end_of_round();
    }

    /*
     * Display:
     *  1. dice pictures
     *  2. value of each die
     *  3. round score
     *  4. total score
     */
    update_dice_field(player) {
        const dice_img_1 = this.dice.map[player.dice_1_val]['source'];
        const dice_img_2 = this.dice.map[player.dice_2_val]['source'];
        const round_score = this.calculate_round_score(player);
        $(`span.${player.dice_1}`).text(player.dice_1_val);
        $(`span.${player.dice_2}`).text(player.dice_2_val);
        $(`img.${player.img_1}`).attr("src", `images/${dice_img_1}`);
        $(`img.${player.img_2}`).attr("src", `images/${dice_img_2}`);
        $(`div.${player.name} span.round`).text(round_score);
        $(`div.${player.name} span.total`).text(player.total_score);
    }

    calculate_round_score(player) {
        let round_score;
        if (player.dice_1_val === 1 || player.dice_2_val === 1) {
            round_score = 0;
        } else if (player.dice_1_val === player.dice_2_val) {
            round_score = (player.dice_1_val + player.dice_2_val) * 2;
        }
        else {
            round_score = player.dice_1_val + player.dice_2_val;
        }
        player.total_score += round_score;
        return round_score;
    }

    evaluate_end_of_round() {
        this.current_round++;
        $('div#round span').text(this.current_round);
        if (this.current_round === 3) {
            this.declare_winner();
        }
    }

    declare_winner() {
        const winning_text = this.get_players_with_highest_score();
        this.show_popup_box_declaring_winner(winning_text);
        $('div#round').text(winning_text);
        this.game_over = true;
    }

    get_players_with_highest_score() {
        let highest_score = 0;
        let player_with_highest_score;
        let players_tied = [];
        let winner_text;

        for (let i = 0; i < this.players_array.length; i++) {
            const player = this.players_array[i];
            const player_score = player.total_score;
            if (player_score === highest_score) {
                players_tied.push(player_with_highest_score);
                players_tied.push(player.name);
            }

            if (player_score > highest_score) {
                player_with_highest_score = player.name;
                highest_score = player_score;
                players_tied = [];
            }
        }

        if (players_tied.length) {
            winner_text = `There are ${players_tied.length} winners! ${players_tied} have the same highest score of ${highest_score}.`;
        } else {
            winner_text = `${player_with_highest_score} is the winner with total score of: ${highest_score}!`;
        }

        return winner_text;
    }

    show_popup_box_declaring_winner(winning_text) {
        const modal = $('#popup');
        const span = document.getElementsByClassName("close")[0];

        modal.fadeTo(1000, 1);
        $('div#popup p').text(winning_text);
        span.addEventListener('click', () => {
            modal.css('opacity', 0)
        });
    }
}

class Dice {
    constructor() {
        this.map = {
            1: { "value": 1, "source": "1_dot_dice.png" },
            2: { "value": 2, "source": "2_dot_dice.png" },
            3: { "value": 3, "source": "3_dot_dice.png" },
            4: { "value": 4, "source": "4_dot_dice.png" },
            5: { "value": 5, "source": "5_dot_dice.png" },
            6: { "value": 6, "source": "6_dot_dice.png" },
        };
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.dice_1_val;
        this.dice_2_val;
        this.dice_1 = `${name}_dice_1`;
        this.dice_2 = `${name}_dice_2`;
        this.img_1 = `${name}_img_1`;
        this.img_2 = `${name}_img_2`;
        this.total_score = 0;
    }
}

const selected_number_players = document.getElementById("choices");
const roll_dice_button = document.getElementById("roll_dice");
const new_game_button = document.getElementById("new_game");

selected_number_players.addEventListener('click', (event) => {
    const is_button = event.target.nodeName === 'BUTTON';
    if (!is_button) {
        return;
    }
    const number_players = parseInt(event.target.textContent.substring(0, 1));
    start_game(number_players);
});

roll_dice_button.addEventListener('click', (event) => {
    if (!dice_game.game_over) {
        dice_game.roll_player_dice();
    } else {
        roll_dice_button.disabled = true;
    }
});

new_game_button.addEventListener('click', (event) => {
    location.reload();
});

function start_game(number_players) {
    dice_game = new DiceGame(number_players);
}