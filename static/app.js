var songform = document.getElementById("song-form")
songform.addEventListener("input", delayList)

function delayList() {
    if (songform.value.length > 1) {
        console.log(songform)
        songform.setAttribute("list", "songdata")
    } else {
        songform.setAttribute("list", "")
    }
}