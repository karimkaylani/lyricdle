//localStorage.clear()
song = formatSongStr(song)
// only show autocomplete if user started typing
var songform = document.getElementById("song-form")
//songform.addEventListener("input", delayList)


var submit = document.getElementById("submit")
submit.addEventListener('click', check)

var skip = document.getElementById("skip")
skip.addEventListener('click', wrong)

var popUpDisplay = document.querySelector('.popup-container'); 
var scoreDisplay = document.querySelector('.score-display')

var lyricContainer = document.querySelector('.lyric-container')
var lines = lyricContainer.children

const one_day = 1000 * 3600 * 24
const now = new Date()

if ((localStorage.getItem('date'))) {
    // if have loaded cookie before
    var cookieDate = parseInt(localStorage.getItem('date'))
    if ((now.getDate() != cookieDate) || (username != localStorage.getItem('username'))) {
        localStorage.clear()
        window.location.replace('../')  
    }
    // if have saved page before
    var score = parseInt(localStorage.getItem('score'))
    var won = (localStorage.getItem('won') === 'true')
    var lost = (localStorage.getItem('lost') === 'true')

    scoreDisplay.textContent = score + '/6'
    for (let i = 0; i < score; i++) {
        if (i > 5) { break }
        lines[i].children[0].style.opacity = '100'
    }
    console.log(lost)
    if (won || lost) {
        if (lost) { scoreDisplay.textContent = 'X/6' }
        showPopup()
    }

} else {
    var score = 1
    var won = false
    var lost = false

    lines[0].children[0].style.opacity = '100'
}


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
    if (won || lost) {
        return
    }
    if (score >= 6) {
        gameOver()
        return
    }
    lines[score].children[0].style.opacity = '100'
    score += 1
    songform.value = ""
    scoreDisplay.textContent = score + '/6'
    save()
}

function correct() {
    displayMessage('Awesome!!')
    showPopup()
    won = true
    save()
}

function gameOver() {
    lost = true
    score = 7
    scoreDisplay.textContent = 'X/6'
    showPopup()
    displayMessage('Sorry :( the song was ' + song)
    save()
}

function showPopup() {
    const completedElement = document.createElement('p')
    completedElement.setAttribute('id', 'title')
    completedElement.textContent = "Lyricdle #" + day
    popUpDisplay.prepend(completedElement)
    popUpDisplay.style.opacity = "95%";

    const close = document.getElementById('dismiss')
    close.addEventListener('click', () => closePopup())

    const share = document.getElementById('share')
    share.addEventListener('click', () => shareScore())
}

function shareScore() {
    var shareScore = score
    if (score > 6) {
        shareScore = 'X'
    }
    var shareMessage = "🎶 Lyricdle #" + day + " " + shareScore + "/6\n\n"
    var emojiLine = ""
    var i = 1
    while (i < 7) {
        if (i > score) {
            emojiLine += '⬜'
        } else if (i < score) {
            emojiLine += '⬛'
        } else {
            emojiLine += '🟩'
        }
        i += 1
    }
    shareMessage += emojiLine + "\n\n" + song + "\nhttps://lyricdle.app"
    shareMessage = shareMessage.replace(/\n$/, ''); // remove last new line character
    console.log(shareMessage)
    navigator.clipboard.writeText(shareMessage)
    displayMessage('Score copied to clipboard!')
}

function closePopup() {
    popUpDisplay.style.opacity = "0";
}

function displayMessage(message) {
    var messageDisplay = document.querySelector('.message-container'); 
    const messageElement = document.createElement('p')
    messageElement.textContent = message;
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 3500)
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

function save() {
    localStorage.setItem('score', score)
    localStorage.setItem('won', won)
    localStorage.setItem('lost', lost)
    localStorage.setItem('username', username)
    localStorage.setItem('date', new Date().getDate())
}