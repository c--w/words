const N = 50;
var coords;
var g_rows;
var g_cols;
function fillBoard(words) { //instantiator object for making gameboards
    words = words.reverse();
    let grid = new Array(N); //create 2 dimensional array for letter grid
    for (var i = 0; i < N; i++) {
        grid[i] = new Array(N);
        for (var j = 0; j < N; j++) {
            grid[i][j] = '';
        }
    }
    let word = cdl(words[0]);
    let startx = N / 2 - 2;
    let starty = N / 2;
    coords = [];
    let coord = { x: startx, y: starty, l: word.length, all: [] }
    coords.push(coord);
    for (let i = 0; i < word.length; i++) {
        grid[starty][startx + i] = word[i];
        coord.all.push({ x: startx + i, y: starty })
    }
    let minx = startx;
    let miny = starty;
    let maxx = 0;
    let maxy = 0;
    for (let i = 1; i < words.length; i++) {
        word = cdl(words[i]);
        let yf = i % 2;
        let xf = 1 - yf
        coord = placeWord(word, xf, yf);
        coords.push(coord);
        if (coord.x < minx)
            minx = coord.x;
        if (coord.y < miny)
            miny = coord.y;
    }

    function placeWord(word, xf, yf) {
        let best_score = -1;
        let best_coord = { l: word.length, all: [] };
        let NN = N - 8;
        for (let cnt = 0; cnt < NN * NN; cnt++) {
            let iii = (397 * cnt) % (NN * NN);
            let x = iii % NN;
            let y = Math.floor(iii / NN);
            let score = 0;
            for (let i = 0; i < word.length; i++) {
                let c = word[i];
                let xx = x + i * xf;
                let yy = y + i * yf;
                if (grid[yy][xx] == c) {
                    if (coords.find((coord, ii) => {
                        let yyf = ii % 2;
                        let xxf = 1 - yyf;
                        return yyf == yf && coord.all.find(c => c.x == xx && c.y == yy);
                    })) { // never use chars of same oriented word
                        score = -1;
                        break;
                    } else {
                        score++;
                    }
                } else if (grid[y + i * yf][x + i * xf] != '') { // clash with another word
                    score = -1;
                    break;
                }
            }
            if (score > best_score) {
                best_score = score;
                best_coord.x = x;
                best_coord.y = y;
            }
        }
        for (let i = 0; i < word.length; i++) {
            c = word[i];
            grid[best_coord.y + i * yf][best_coord.x + i * xf] = c;
            best_coord.all.push({ x: best_coord.x + i * xf, y: best_coord.y + i * yf })
        }
        return best_coord;
    }
    coords.forEach((c, i) => {
        let yf = i % 2;
        let xf = 1 - yf
        if (c.x < minx) {
            minx = c.x;
        }
        if (c.y < miny) {
            miny = c.y;
        }
        if (c.x + c.l * xf > maxx) {
            maxx = c.x + c.l * xf;
        }
        if (c.y + c.l * yf > maxy) {
            maxy = c.y + c.l * yf;
        }
    });
    let rows = g_rows = maxy - miny || 1;
    let cols = g_cols = maxx - minx || 1;
    let grid2 = new Array(rows); //create 2 dimensional array for letter grid
    let width = 100 / cols-0.5;
    $('#all_words_div').empty();
    $('#all_words_div').css("grid-template-columns", "repeat(" + cols + ", min(" + width + "vmin, 60px))");
    $('#all_words_div').css("grid-template-rows", "repeat(" + rows + ", min(" + width + "vmin, 60px))");
    $('#all_words_div').css("font-size", "min(" + width / 2 + "vmin, 30px)");
    for (var i = 0; i < rows; i++) {
        grid2[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            let l = grid[i + miny][j + minx];;
            grid2[i][j] = l;
            let div = $('<div>');
            div.html(l);
            if (l)
                div.addClass('full');
            $('#all_words_div').append(div);
        }
    }
    let all_divs = $($('#all_words_div div'));
    let color_step = Math.floor(360 / words.length);
    coords.forEach((c, i) => {
        let yf = i % 2;
        let xf = 1 - yf
        let color = "hsl(" + color_step * i + "deg 100% 90% / 0.5)";
        c.x = c.x - minx;
        c.y = c.y - miny;
        for (let j = 0; j < c.l; j++) {
            let xx = c.x + j * xf;
            let yy = c.y + j * yf;
            let div = $(all_divs[yy * cols + xx])
            let bckg = $('<div class="bckg">');
            bckg.css("background", color);
            div.append(bckg);
            if (i % 2) {
                if (j == 0) {
                    div.css('border-bottom-color', '#ccc')
                } else if (j == c.l - 1) {
                    div.css('border-top-color', '#ccc')
                } else {
                    div.css('border-top-color', '#ccc')
                    div.css('border-bottom-color', '#ccc')
                }
            } else {
                if (j == 0) {
                    div.css('border-right-color', '#ccc')
                } else if (j == c.l - 1) {
                    div.css('border-left-color', '#ccc')
                } else {
                    div.css('border-right-color', '#ccc')
                    div.css('border-left-color', '#ccc')
                }

            }
        }
    })
    console.table(grid2);
}