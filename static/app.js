song = formatSongStr(song)
// only show autocomplete if user started typing
var songform = document.getElementById("song-form")
songform.addEventListener("input", delayList)

var submit = document.getElementById("submit")
submit.addEventListener('click', check)

var skip = document.getElementById("skip")
skip.addEventListener('click', wrong)

var popUpDisplay = document.querySelector('.popup-container'); 

if (localStorage.getItem('html')) {

} else {
    
}

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
    displayMessage('Awesome job!')
    showPopup()
    won = true
}

function gameOver() {
    lost = true
    score = 7
    console.log('You lost :(')
    showPopup()
    displayMessage('Sorry :( the song was ' + song)
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
    localStorage.setItem('hrml', document.body.innerHTML)

}