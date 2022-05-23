from unittest import result
from flask import Flask, session, request, redirect, render_template
import spotipy
from lyricsgenius import Genius
import uuid
import os
import random
import datetime

app = Flask(__name__)

# adapted from exaples/app.py
app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './.flask_session/'
cache_folder = os.path.join(os.getcwd(), '.spotify_caches/')

GENIUS_TOKEN = os.environ['GENIUS_TOKEN']
SPOTIPY_CLIENT_ID = os.environ['SPOTIPY_CLIENT_ID']
SPOTIPY_CLIENT_SECRET = os.environ['SPOTIPY_CLIENT_SECRET']
SPOTIPY_REDIRECT_URI = os.environ['SPOTIPY_REDIRECT_URI']

scope='user-library-read user-top-read'

genius = Genius(GENIUS_TOKEN)

if not os.path.exists(cache_folder):
    os.makedirs(cache_folder)

def current_session_cache_path():
    return cache_folder + session.get('uuid')

@app.route('/', methods=['GET', 'POST'])
def index():
    num_day = (datetime.datetime.now() - datetime.datetime(2022, 5, 22)).days
    random.seed(num_day)
    if not session.get('uuid'):
        # assign unique session 
        session['uuid'] = str(uuid.uuid4())

    cache_handler = spotipy.CacheFileHandler(cache_path=current_session_cache_path())
    auth_manager = spotipy.oauth2.SpotifyOAuth(scope=scope,
                                                cache_handler=cache_handler, 
                                                show_dialog=True, client_id=SPOTIPY_CLIENT_ID,
                                                client_secret=SPOTIPY_CLIENT_SECRET,
                                                redirect_uri=SPOTIPY_REDIRECT_URI)

    if request.args.get("code"):
        # redirect from spotify
        auth_manager.get_access_token(request.args.get("code"))
        return redirect('/')

    if not auth_manager.validate_token(cache_handler.get_cached_token()):
        #Display sign in link when no token
        auth_url = auth_manager.get_authorize_url()
        return render_template('landing.html', auth_url=auth_url)

    sp = spotipy.Spotify(auth_manager=auth_manager)
    session['username'] = sp.current_user()['id']
    # select song
    song, all_tracks = get_random_song_and_list(sp)
    song_str = song['name'],'-',song['artists'][0]['name']
    genius_song = genius.search_song(song['name'], song['artists'][0]['name'])
    #genius_song = genius.search_song('sdlkfgkdkg', 'fdklgndskjgnds')
    if not genius_song:
        return "Sorry, we couldn't find lyrics for today's song :("
    lyrics = format_lyrics(genius_song.lyrics)
    # assign session object here
    session['all_songs'] = all_tracks
    session['song'] = song_str
    session['lyrics'] = lyrics
    session['num_day'] = num_day
    return redirect('/play')

@app.route('/play')
def play():
    if not session.get('song'):
        return redirect('/')
    return render_template('play.html', song=session['song'],
    all_songs=session['all_songs'], lyrics=session['lyrics'][:6], day=session['num_day'],
    username=session['username'])

def get_random_song_and_list(user):
    tracks = user.current_user_top_tracks(limit=50, time_range='medium_term')['items']
    tracks.extend(user.current_user_top_tracks(limit=50, time_range='long_term')['items'])
    value = random.randint(0, len(tracks)-1)
    all_tracks = []
    for i, track in enumerate(tracks):
        if i == value:
            song = track
        all_tracks.append(track['name'] + ' - ' + track['artists'][0]['name'])
    return song, list(set(all_tracks))

def format_lyrics(lyrics):
    split = lyrics.splitlines()
    split = split[1:]
    result = []
    for line in split:
        if (line and line[0] != '['):
            result.append(line)
    return result


if (__name__ == "main"):
    app.run(debug=True)