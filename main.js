onload = (event) => init();
var guess_word;
var undo_stack = [];
var undo_stack_elem = [];
var last_time = 0;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
var startseed;
var letters;
var level;
var last_selected;
function init() {
    document.onclick = (event) => handleClick(event);
    initSeed();
    if (!letters) {// try cookie
        letters = Number(getCookie("letters"));
        level = Number(getCookie("level"));
    }
    if (isNaN(letters)) { // try select
        letters = $("#letters").val();
        level = $("#level").val();
    }
    if (letters < 4)
        letters = 5;
    if (level < 1)
        level = 1;
    $("#letters").val(letters);
    $("#level").val(level);
    setCookie("letters", letters, 730);
    setCookie("level", level, 730);
    $("#letters").on("change", changeGame);
    $("#level").on("change", changeGame);
    initGame();
}

function changeGame() {
    letters = $("#letters").val();
    setCookie("letters", letters, 730);
    level = $("#level").val();
    setCookie("level", level, 730);
    setBckg();
    initGame();
}

function initGame() {
    startseed = seed;
    let seed_url;
    seed_url = letters + level + startseed;
    document.querySelector(':root').style.setProperty('--lw', Math.floor((90-Number(letters))/letters) + "vw");

    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    guess_word = getRandomWord();
    let scrambled_word;
    do {
        scrambled_word = [...guess_word].sort(randomsort).sort(randomsort);
    } while (toEasy(guess_word, scrambled_word))
    console.log(scrambled_word);
    fillLetters(scrambled_word);
    undo_stack = [];
    undo_stack_elem = [];
    last_selected = null;
    $("#games").text(games);
    $("#last").text(last_time);
    $("#total").text(total_time);
    if (games)
        $("#avg").text(Math.round(total_time / games));
    start_time = Date.now();
}

function fillLetters(letters) {
    $('#letters_div').empty();
    letters.forEach((l, i) => {
        var div = $('<div class="letter">' + l + '</div>');
        div.data('l', l);
        div.data('i', i);
        $('#letters_div').append(div)
    })
}
function handleClick(event) {
    let el = $(event.target);
    if (el.hasClass('letter')) {
        effect(el);
        let current_index = $('.letter.selected').data('i');
        let new_index = el.data('i');
        if (new_index == current_index) {
            el.removeClass('selected');
            if (undo_stack_elem.length) {
                undo_stack.pop();
                undo_stack_elem.pop();
                last_selected = undo_stack_elem[undo_stack_elem.length - 1];
                last_selected.removeClass('past-selected').addClass('selected')
            } else {
                last_selected = null;
            }
            return;
        }
        $('.letter.selected').removeClass('selected').addClass('past-selected')
        el.addClass('selected');
        last_selected = el;
        undo_stack.push(el.data('l'));
        undo_stack_elem.push(el);
        if (undo_stack.length == letters) {
            if (undo_stack.join() == guess_word.join()) {
                fillLetters(guess_word)
                $('.letter').addClass('winner');
                games++;
                last_time = Math.round((Date.now() - start_time) / 1000);
                total_time += last_time;
                setTimeout(initGame, 2000);
            } else {
                undo_stack = [];
                undo_stack_elem = [];
                last_selected = null;
                $('.letter').removeClass('selected').removeClass('past-selected')
            }
        }
    }
}
function randomsort(a, b) {
    return rand() * 2 - 1;
}

function rand() {
    seed++;
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function initSeed() {
    if (window.location.hash) {
        letters = Number(window.location.hash.substring(1, 2))
        level = Number(window.location.hash.substring(2, 3))
        seed = window.location.hash.substring(3);
        if (seed.startsWith("e")) {
            gamemode = 1;
            seed = seed.substring(1);
        } else if (seed.startsWith("h")) {
            gamemode = 3;
            seed = seed.substring(1);
        } else {
            gamemode = 2;
        }
        seed = Number(seed)
        if (!isNaN(seed))
            return;
    }
    let now = new Date();
    seed = now.toISOString().replaceAll("-", "").replaceAll("T", "").replaceAll(":", "").substring(2, 12);
    seed = Number(seed + '0000');
}


function getRandomWord() {
    let dw;
    if (level == 1) dw = hrdict1;
    else if (level == 2) dw = hrdict2;
    else if (level == 3) dw = hrdict3;
    else if (level == 4) dw = endict;
    let filtered = dw.filter((word) => {
        word = convertDoubleLetters(word);
        return word.length == letters;
    });
    let i = Math.floor(rand() * filtered.length);
    let word = filtered[i];
    console.log("Random word:", level, word);
    return convertDoubleLetters(word);
}

function convertDoubleLetters(s) {
    var result = [];
    let tmp = s.split(/(NJ|LJ|DŽ)/);
    tmp.forEach((a) => {
        if (a.match(/(NJ|LJ|DŽ)/)) {
            result.push(a);
        } else {
            result.push(...a.split(""));
        }
    });
    return result;
}

function setBckg() {
    var color = (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16);
    var url = "https://bg.siteorigin.com/api/image?2x=0&blend=40&color=%23" + color + "&intensity=10&invert=0&noise=0&pattern=" + g_patterns[Math.floor(Math.random() * g_patterns.length)];
    $('body').css('background-image', 'url(' + url + ')');
}

function effect(el) {
    el.addClass('effect');
    setTimeout((el) => el.removeClass('effect'), 100, el);
}

function toEasy(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] == b[i])
            sum++;
    }
    return sum > 2;
}



