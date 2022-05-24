song = formatSongStr(song)
// only show autocomplete if user started typing
var songform = document.getElementById("song-form")
songform.addEventListener("input", delayList)

var submit = document.getElementById("submit")
submit.addEventListener('click', check)

var skip = document.getElementById("skip")
skip.addEventListener('click', wrong)

var score = 1
var won = false
var lost = false


var lyricContainer = document.querySelector('.lyric-container')
var lines = lyricContainer.children
lines[0].children[0].style.opacity = '100'

function check() {
    if (won || lost) {return}
    var input = songform.value
    if (input == song) {
        correct()
    } else {
        wrong()
    }
}

function wrong() {
    if (won || lost) {return}
    if (score >= 6) {
        gameOver()
        return
    }
    lines[score].children[0].style.opacity = '100'
    score += 1
    songform.value = ""
    var scoreDisplay = document.querySelector('.score-display')
    scoreDisplay.textContent = score + '/6'
}

function correct() {
    console.log('You win!')
    won = true
}

function gameOver() {
    lost = true
    console.log('You lost :(')
}


function delayList() {
    if (songform.value.length > 1) {
        songform.setAttribute("list", "songdata")
    } else {
        songform.setAttribute("list", "")
    }
}

function formatSongStr(song) {
    var str = song.replaceAll('[', '')
    str = str.replaceAll(']', '')
    str = str.replaceAll(',', '')
    str = str.replaceAll('"', '')
    return str
}