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
var css_transforms = new Array(7);
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
    changeGame();
}

function changeGame() {
    letters = $("#letters").val();
    setCookie("letters", letters, 730);
    level = $("#level").val();
    setCookie("level", level, 730);
    last_time = 0;
    total_time = 0;
    games = 0;
    start_time = 0;
    setBckg();
    $('#letters_div').removeClass('row4 row5 row6 row7');
    $('#letters_div').removeClass('circle4 circle5 circle6 circle7');
    initGame();
}

function initGame() {
    startseed = seed;
    let seed_url;
    seed_url = letters + level + startseed;

    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    $("#seed").attr('title', startseed);
    guess_word = getRandomWord();
    scrambleAndFill();
    updateStats();
    start_time = Date.now();
}

function scrambleAndFill() {
    let scrambled_word = [...guess_word].sort(randomsort).sort(randomsort);
    fillLetters(scrambled_word);
    undo_stack = [];
    undo_stack_elem = [];
    last_selected = null;
    hint_ind = 0;
}

function hint() {
    start_time -= 20*1000*(undo_stack.length+1);
    let elem = $('.letter:not(.selected):not(.past-selected)').toArray().find(l => $(l).data('l') == guess_word[undo_stack.length]);
    handleClick({target: elem});
    hint_ind++;
}

function updateStats() {
    $("#games").text(games);
    $("#last").text(last_time);
    $("#total").text(total_time);
    if (!games)
        return;
    let avg = Math.round(total_time / games);
    $("#avg").text(avg);
    let key = 'words' + games + '-' + letters + '-' + level;
    let best = localStorage.getItem(key);
    if (best) {
        best = Number(best);
        if (avg < best) {
            best = avg;
        }
    } else {
        best = avg;
    }
    localStorage.setItem(key, best);
    $("#best-games").text(games);
    $("#best").text(best);
}

function fillLetters(letters_arr) {
    $('#letters_div').empty();
    $('#letters_div').removeClass("circle" + letters);
    $('#letters_div').addClass("row" + letters);
    letters_arr.forEach((l, i) => {
        var div = $('<div class="letter">' + l + '</div>');
        div.data('l', l);
        div.data('i', i);
        $('#letters_div').append(div)
    })
    setTimeout(() => {
        for (let i = 0; i < letters; i++) {
            const target_css = $('.letter:nth-of-type(' + (i + 1) + ')').css('transform');
            css_transforms[i] = target_css;
        }        
        $('#letters_div').addClass("circle" + letters);
    }, 0)

}
function handleClick(event) {
    let el = $(event.target);
    if (el.hasClass('letter')) {
        effect(el);
        if (el.hasClass('past-selected')) {
            return;
        }
        let current_index = $('.letter.selected').data('i');
        let new_index = el.data('i');
        if (new_index == current_index) {
            el.removeClass('selected');
            if (undo_stack_elem.length) {
                undo_stack.pop();
                undo_stack_elem.pop();
                last_selected = undo_stack_elem[undo_stack_elem.length - 1];
                if (last_selected)
                    last_selected.removeClass('past-selected').addClass('selected')
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
                //fillLetters(guess_word)
                setTimeout(() => {
                    $('#letters_div').removeClass('circle'+letters);
                }, 620)

                setTimeout(animateLetters, 310)
                setTimeout(() => {
                    $('.letter').addClass('winner');
                }, 500)
                games++;
                last_time = Math.round((Date.now() - start_time) / 1000);
                total_time += last_time;
                setTimeout(initGame, 3000);
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
    return Math.random() * 2 - 1;
}

function animateLetters() {
    for (let i = 0; i < letters; i++) {
        const source = $('.letter:nth-of-type(' + ($(undo_stack_elem[i]).data('i') + 1) + ')');

        setTimeout((source, i) => {
            $(source).css('transform',  css_transforms[i]);
        }, 10, source, i);
    }
}
function rand() {
    seed++;
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function initSeed() {
    if (window.location.hash) {
        letters = Number(window.location.hash.substring(1, 2))
        level = Number(window.location.hash.substring(2, 3))
        seed = window.location.hash.substring(3);
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
