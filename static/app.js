localStorage.clear()
console.log(id)
song = song.substring(1,song.length-1)
var songform = document.getElementById("song-form")
var submit = document.getElementById("submit")
submit.addEventListener('click', check)

var skip = document.getElementById("skip")
skip.addEventListener('click', wrong)

var gameContainer = document.querySelector('.game-container')

var popUpDisplay = document.querySelector('.popup-container'); 
var popUp = document.querySelector('.popup-items'); 
var scoreDisplay = document.querySelector('.score-display')

var lyricContainer = document.querySelector('.lyric-container')
var lines = lyricContainer.children

window.onclick = function(event) {
    if (event.target == popUpDisplay) {
        popUpDisplay.style.display = "none";
    }
}

// keep track of streak
var numGamesPlayed = 0
var currentStreak = 0
var highestStreak = 0

if (localStorage.getItem('numGamesPlayed') != null) {
    numGamesPlayed = parseInt(localStorage.getItem('numGamesPlayed'))
    currentStreak = parseInt(localStorage.getItem('currentStreak'))
    highestStreak = parseInt(localStorage.getItem('highestStreak'))
}

console.log(numGamesPlayed)

if ((localStorage.getItem('id')) && (day == parseInt(localStorage.getItem('date')))
&& (id == localStorage.getItem('id'))) {
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
    save()
}


function check() {
    if (won || lost) {return}
    var input = songform.value
    console.log(input)
    console.log(song)
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
    numGamesPlayed += 1
    currentStreak += 1
    if (currentStreak > highestStreak) {
        highestStreak = currentStreak
    }
    displayMessage('Awesome!!')
    won = true
    createPopup()
    save()
}

function gameOver() {
    numGamesPlayed += 1
    currentStreak = 0
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
    popUp.prepend(completedElement)
    showPopup()

    const songTitle = document.getElementById('song-title')
    songTitle.textContent = song

    const close = document.getElementById('close')
    close.addEventListener('click', () => closePopup())

    const share = document.getElementById('share')
    share.addEventListener('click', () => shareScore())

    const currStreakElem = document.getElementById('curr-streak')
    const longestStreakElem = document.getElementById('longest-streak')
    const daysPlayedElem = document.getElementById('days-played')

    currStreakElem.innerHTML += currentStreak.toString()
    longestStreakElem.innerHTML += highestStreak.toString()
    daysPlayedElem.innerHTML += numGamesPlayed.toString()

    const scoreIcon = document.getElementById('leaderboard')
    scoreIcon.style.display = "block"
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
    popUpDisplay.style.display = "none";
}

function showPopup() {
    popUpDisplay.style.display = "block";
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
    localStorage.setItem('id', id)

    localStorage.setItem('numGamesPlayed', numGamesPlayed)
    localStorage.setItem('currentStreak', currentStreak)
    localStorage.setItem('highestStreak', highestStreak)
}