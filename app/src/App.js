import "./App.css";
import { useState, useEffect} from "react";
import { CLIENT_ID } from "./env.tsx";

function GetMonthly() {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";
  const SCOPE = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-recently-played user-top-read playlist-modify-private';

  let trackUris = [];
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [playlistId, setPlaylistId] = useState("");

  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method,
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  async function getUserId() {
    const id = (await fetchWebApi(`v1/me`, "GET")).id;
    setUserId(id);
  }

  async function getTracks() {
    // get the users top 20 tracks from the last 30 days
    const tracks =  (await fetchWebApi(
      `v1/me/top/tracks?time_range=short_term&limit=20`, 'GET'
    )).items;

    console.log("top 20 tracks: \n" +
      tracks?.map(
        ({name, artists}) =>
          `${name} by ${artists.map(artist => artist.name).join(', ')}`
      )
    );

    const ids = tracks?.map(track => track.id)
    const uris = tracks?.map(track=> track.uri)

    const seedIds = ids.slice(0, 5)
    
    // get 10 recommended tracks from the top 5
    const recommended = (
      await fetchWebApi(
        `v1/recommendations?limit=10&seed_tracks=${seedIds.join(',')}`,
        "GET"
      )
    ).tracks;

    console.log( "reccomended tracks: \n" +
      recommended?.map(
        ({ name, artists }) =>
          `${name} by ${artists.map((artist) => artist.name).join(", ")}`
      )
    );

    const recommendedUris = recommended.map(track=>track.uri)
    uris.push(recommendedUris)
    trackUris = uris;
  }

  async function createPlaylist(tracksUri) {
    console.log(tracksUri);
    await fetchWebApi(`v1/users/${userId}/playlists`, "POST", {
      name: `${getMonth()}`,
      description: "",
      public: false,
    }).then((playlist) => {
      fetchWebApi(
        `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(",")}`,
        "POST"
      );
      setPlaylistId(playlist.id);
      console.log(playlist.id)
      return playlist;
    });
  }

  async function generate() {
    await getTracks();
    createPlaylist(trackUris);
  }

  async function getToken() {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    // get the access token
    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];
      setAccessToken(token);
      window.location.hash = "";
    }
  }

  useEffect(() => {
    getToken();

    if (accessToken) {
      getUserId();
    }
  }, [accessToken, userId]);

  const logout = () => {
    setAccessToken("");
  };

  function getMonth() {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const d = new Date();
    return month[d.getMonth()];
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>
            Login with Spotify to create a playlist with your top songs for the
            month!
          </h1>
          {!accessToken ? (
            <a
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            >
              Login to Spotify
            </a>
          ) : (
            <div className="flex flex-col justify-center items-center">
                <button className= "bg-black p-6 my-8" onClick={generate}>
                  Generate playlist
                </button>
                
                <button className= "bg-black p-6 my-8" onClick={logout}>logout</button>
            </div>
          )}

          {playlistId ? (
            <iframe
              title="Created playlist"
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="100%"
              style={{ minHeight: '360px' }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          ) : (
            <div></div>
          )}
        </div>
      </header>
    </div>
  );
}

export default GetMonthly;
