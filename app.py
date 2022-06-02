from time import timezone
from tracemalloc import start
from unittest import result
from flask import Flask, session, request, redirect, render_template
import spotipy
from lyricsgenius import Genius
import uuid
import os
import random
from datetime import datetime
import pytz
import re

app = Flask(__name__)

# adapted from exaples/app.py
app.config['SECRET_KEY'] = os.urandom(64)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './.flask_session/'
cache_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)),
 '.spotify_caches/')

GENIUS_TOKEN = os.getenv('GENIUS_TOKEN')
SPOTIPY_CLIENT_ID = os.getenv('SPOTIPY_CLIENT_ID')
SPOTIPY_CLIENT_SECRET = os.getenv('SPOTIPY_CLIENT_SECRET')
SPOTIPY_REDIRECT_URI = os.getenv('SPOTIPY_REDIRECT_URI')

scope='user-top-read'

genius = Genius(GENIUS_TOKEN, remove_section_headers=True, skip_non_songs=True)
PST = pytz.timezone('US/Pacific')

if not os.path.exists(cache_folder):
    os.makedirs(cache_folder)

def current_session_cache_path():
    return cache_folder + session.get('uuid')

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.route('/', methods=['GET', 'POST'])
def index():
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

    start_date = datetime(2022, 5, 26)
    start_date = PST.localize(start_date)
    now = datetime.now()
    now = PST.localize(now)
    num_day = (now - start_date).days
    random.seed(num_day)

    sp = spotipy.Spotify(auth_manager=auth_manager)
    # select song
    if not session.get('song_data') or session.get('song_data')['num_day'] != num_day:
        song_found = False
        while not song_found:
            song, all_tracks = get_random_song_and_list(sp)
            song_str = song['name'] + ' - ' + song['artists'][0]['name']
            genius_song = genius.search_song(remove_feature(song['name']), song['artists'][0]['name'])
            if genius_song:        
                lyrics = format_lyrics(genius_song.lyrics)
                if len(lyrics) >= 6:
                    song_found = True
        session['song_data'] = {'song': song_str, 'all_songs': all_tracks, 'lyrics': lyrics, 'num_day': num_day}
    else:
        print('Pulling', session['song_data']['song'], 'from cache')
    return render_template('play.html', song=session['song_data']['song'],
    all_songs=session['song_data']['all_songs'], lyrics=session['song_data']['lyrics'][:6], day=num_day, id=session['uuid'])

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

def remove_feature(song_title):
    # referred to https://www.reddit.com/r/kustom/comments/a4tfga/any_way_to_remove_the_features_from_song_titles/
    if "(feat." in song_title.lower() or '[feat.' in song_title.lower():
        pattern = "(?i)\s.feat.*?(\)|\])"
    elif "(ft." in song_title.lower() or '[ft.' in song_title.lower():
        pattern = "(?i)\s.ft.*?(\)|\])"
    elif '(with' in song_title.lower() or '[with' in song_title.lower():
        pattern = "(?i)\s.with.*?(\)|\])"
    else:
        return song_title
    result = re.sub(pattern, '', song_title)
    return result

def format_lyrics(lyrics):
    split = lyrics.splitlines()
    split = split[1:]
    result = []
    for line in split:
        if line:
            result.append(line)
    return result

if (__name__ == "main"):
    app.run(debug=True)