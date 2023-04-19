import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from 'react';

import {CLIENT_ID} from './env.tsx'

async function GetMonthly() {
  
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const REDIRECT_URI = "http://localhost:3000"

  const [accessToken, setAccessToken] = useState("");
  const [top20, setTop20] = useState([]);

  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method,
      body:JSON.stringify(body)
    });
    return await res.json();
  }
  
  async function getTopTracks(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return (await fetchWebApi(
      'v1/me/top/tracks?time_range=short_term&limit=5', 'GET'
    )).items;
  }
  
  const topTracks = await getTopTracks();

  console.log(
    topTracks?.map(
      ({name, artists}) =>
        `${name} by ${artists.map(artist => artist.name).join(', ')}`
    )
  );

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    // get the access token
    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      setAccessToken(token)

      window.location.hash = ""
    }

  }, [])

  const logout = () => {
    setAccessToken("")
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>
          Login with Spotify to create a playlist with your top songs for the month!
          </h1>
          {!accessToken ?
          <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
          : <button onClick={logout}>logout</button>
        }
        </div>
      </header>
    </div>
  );
}

export default GetMonthly;
