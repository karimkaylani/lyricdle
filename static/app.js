//localStorage.clear()
var songform = document.getElementById("song-form")
var submit = document.getElementById("submit")
submit.addEventListener('click', check)

var skip = document.getElementById("skip")
skip.addEventListener('click', wrong)

var gameContainer = document.querySelector('.game-container')

var popUpDisplay = document.querySelector('.popup-container'); 
var scoreDisplay = document.querySelector('.score-display')

var lyricContainer = document.querySelector('.lyric-container')
var lines = lyricContainer.children

if ((localStorage.getItem('date')) && (day == parseInt(localStorage.getItem('date')))) {
    // if have loaded cookie before
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
        createPopup()
    }

} else {
    localStorage.clear()
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
    won = true
    createPopup()
    save()
}

function gameOver() {
    lost = true
    score = 7
    scoreDisplay.textContent = 'X/6'
    createPopup()
    displayMessage('Sorry :( the song was ' + song)
    save()
}

function createPopup() {
    const completedElement = document.createElement('p')
    completedElement.setAttribute('id', 'title')
    if (won) {
        completedElement.textContent = "You got it!"
    } else {
        completedElement.textContent = "Sorry :("
    }
    popUpDisplay.prepend(completedElement)
    popUpDisplay.style.opacity = "100%";

    const songTitle = document.getElementById('song-title')
    songTitle.textContent = "The song was:\n" + song

    const close = document.getElementById('dismiss')
    close.addEventListener('click', () => closePopup())

    const share = document.getElementById('share')
    share.addEventListener('click', () => shareScore())

    const scoreIcon = document.getElementById('leaderboard')
    scoreIcon.style.opacity = "100"
    scoreIcon.addEventListener('click', () => showPopup())
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

function showPopup() {
    popUpDisplay.style.opacity = "100";
}

function displayMessage(message) {
    var messageDisplay = document.querySelector('.message-container'); 
    const messageElement = document.createElement('p')
    messageElement.textContent = message;
    messageDisplay.append(messageElement)
    setTimeout(() => messageDisplay.removeChild(messageElement), 3500)
}

function save() {
    localStorage.setItem('score', score)
    localStorage.setItem('won', won)
    localStorage.setItem('lost', lost)
    localStorage.setItem('date', day)
}