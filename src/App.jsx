import './App.scss';
import React from "react";
import SpotifyWebApi from 'spotify-web-api-js';


const spotifyApi = new SpotifyWebApi();

class App extends React.Component {
  constructor(){
    super();
    const params = this.getHashParams();
    const token = params.access_token;

    if (token) {
      spotifyApi.setAccessToken(token);
    }
    
    this.state = {
      active: false,
      loggedIn: token ? true : false,
      nowPlaying: { name: 'Not Checked', albumArt:'', artist:''},
      topArtists: [ {name: '', image: ''}],
      playlists: [{name: '', image: '', id: ''}],
      tracks: [{name: '', image:'', id: ''}],
      recs: [{name: '', image:'', id: '', url: ''}]
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url,
              artist: response.item.artists[0].name
            }
        });
      })
  }

  
  getTopArtists(){
    spotifyApi.getMyTopArtists({ limit: 10})
      .then((response) => {
        let names = response.items.map( e => e.name);
        let images = response.items.map( e => e.images[0].url);
        this.setState({
          topArtists: names.map((n, i) => ({name: n, image: images[i]}))
        });
      })
  }

  getMyPlaylists(){
    spotifyApi.getUserPlaylists()
      .then((response) => {
        let names = response.items.map( e => e.name);
        let images = response.items.map( e => e.images[0].url);
        let ids = response.items.map( e => e.id);
        this.setState({
          active: !this.state.active,
          playlists: names.map((n, i) => ({name: n, image: images[i], id: ids[i]}))
        });
      })
  }

  getPlaylistTracks(id){
    spotifyApi.getPlaylistTracks(id)
    .then((response) => {
      console.log(response.items[0].track)
      let names = response.items.map( e => e.track.name);
      let images = response.items.map(e => e.track.album.images[0].url);
      let ids = response.items.map(e => e.track.id);      
      // let images = response.items.map( e => e.images[0].url);

      this.setState({
        tracks: names.map((n, i) => ({name: n, image: images[i], id: ids[i]} ))
    });

    console.log(this.state.tracks)
    })
  }

  randomizeTracks(tracks) {
    var rands = [],
    n = 5,
    i = 0;

    while (n--) {
        i = Math.floor(Math.random() * (n+1));
        rands.push(tracks[i].id);
        tracks.splice(i,1);
    }

    return rands;
  }

  getRecommendations(){
    var acoust = document.getElementById('acoust').value;
    var dance = document.getElementById('dance').value;
    var energy = document.getElementById('energy').value;
    var pop = document.getElementById('pop').value;
    var speech = document.getElementById('speech').value;
    var valence = document.getElementById('valence').value;
    
    var seed = [acoust, dance, energy, pop, speech, valence]

    // spotifyApi.getRecommendations({seed_genres: ["indie-pop", "indie", "k-pop", "hip-hop", "r-n-b"], max_acousticness: seed[0], max_danceability: seed[1], max_energy: seed[2], max_popularity: seed[3], max_speechiness: seed[4],  limit: 10})
    spotifyApi.getRecommendations({seed_tracks: this.randomizeTracks(this.state.tracks), max_acousticness: seed[0], max_danceability: seed[1], max_energy: seed[2], max_popularity: seed[3], max_speechiness: seed[4], max_valence: seed[5],  limit: 10})
    .then((response) => {
      let names = response.tracks.map( e => e.name);
      let images = response.tracks.map(e => e.album.images[0].url);
      let ids = response.tracks.map(e => e.id);      
      let urls = response.tracks.map(e => e.external_urls.spotify);      

      this.setState({
        recs: names.map((n, i) => ({name: n, image: images[i], id: ids[i], url: urls[i]} ))
    });
    })
  }

  getOAuthToken() {
    this.useCallback(callback => {
      const token = this.getHashParams().access_token;
      callback(token);
    })
  } 


  render() {

    return (
      <div className="App">
      <a href={`http://localhost:8888`}>Login
                        to Spotify</a>
        
        {/*}
        <div>
          Now Playing: { this.state.nowPlaying.name }
        </div>
        
        <div>
        By: {this.state.nowPlaying.artist}
        </div>
        
        <div>
          <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }} alt='album-img'/>
        </div>

        <div>Artists: 
         <ul className='artist-list'>
          {this.state.topArtists.map(({name, image}) => <li>{name}
          
          <img className='artist-img' src={image} alt='artist-img'></img></li>)}
         </ul>
        </div>
    */}

        <div> <h1>Playlists</h1>
        { this.state.loggedIn &&
          <button className='play-button' onClick={() => this.getMyPlaylists()}>
            My Playlists
          </button>
        }

         <ul className='playlist-list'>
          {this.state.playlists.map(({name, image, id}) => 
          
          <li className= {'playlist ' + this.state.active} key={name}> 
          <img className='playlist-img' src={image} alt=''></img>
          <div>{name}</div>
          {this.state.loggedIn && <button className='button' onClick={() => this.getPlaylistTracks(id)}>
            See Tracks
          </button>}
          </li>
          )}
         </ul>

        <h1>Tracks</h1>
         <ul className='track-list'>
          {this.state.tracks.map(({name, image, id}) =>  
          <li className= {'tracks ' + this.state.active} key={name}> 
          <div>
          <img className='track-img' src={image} alt=''></img>
          {name}</div>
          </li>
          )}
         </ul>

        </div>
        
        {/*
        { this.state.loggedIn &&
          <button onClick={() => this.getNowPlaying()}>
            Check Now Playing
          </button>
        }
        
        { this.state.loggedIn &&
          <button onClick={() => this.getTopArtists()}>
            Check Top Artists
          </button>
        }
      */}

        <div> 
        <h1>Recommendations</h1>

        <h3>Acousticness</h3>
        <input type='range' min='0' max='1' step='0.1' id='acoust'/> 

        <h3>Danceability</h3>
        <input type='range' min='0' max='1' step='0.1' id='dance'/>

        <h3>Energy</h3>
        <input type='range' min='0' max='1' step='0.1' id='energy'/>

        <h3>Popularity</h3>
        <input type='range' min='0' max='100' step='1' id='pop'/>

        <h3>Wordiness</h3>
        <input type='range' min='0' max='1' step='0.1' id='speech'/>
        
        <h3>Happiness</h3>
        <input type='range' min='0' max='1' step='0.1' id='valence'/>
        

        <div>
        { this.state.loggedIn &&
          <button className='rec-button' onClick={() => this.getRecommendations()}>
            Get Playlist Recommendations
          </button>
        }
        </div>


         <ul className='rec-list'>
          {this.state.recs.map(({name, image, id, url}) =>  
          <li className= {'recs ' + this.state.active} key={name}> 
          <div>
            <img className='rec-img' src={image} alt=''></img>
            <a className='link' href= {url} target="_blank" rel="noreferrer noopener">{name}</a>
          </div>
          </li>
          )}
         </ul>

        </div>

      </div>
    );
  }
}

export default App;
