import "./App.css";
import { useState, useEffect} from "react";
import { CLIENT_ID } from "./env.tsx";

function GetMonthly() {
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const REDIRECT_URI = "http://localhost:3000";

  const [accessToken, setAccessToken] = useState("");
  const [trackIds, setTrackIds] = useState([]);
  const [trackUris, setTrackUris] = useState([]);
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

  async function getTopTracks() {
    // const tracks =  await fetchWebApi(
    //   `v1/me/top/tracks?time_range=short_term&limit=20`, 'GET'
    // );

    const id = await fetchWebApi(
      `v1/me/top/tracks?time_range=short_term&limit=20`,
      "GET"
    );
    console.log(id);
    // console.log(tracks)

    // console.log(
    //   tracks?.map(
    //     ({name, artists}) =>
    //       `${name} by ${artists.map(artist => artist.name).join(', ')}`
    //   )
    // );

    // const ids = tracks?.map(track => track.id)
    // const uris = tracks?.map(track=> track.uri)
    // setTrackIds(ids)
    // setTrackUris(uris)
  }

  async function getRecommendations() {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-recommendations
    const tracks = (
      await fetchWebApi(
        `v1/recommendations?limit=10&seed_tracks=${trackIds.join(",")}`,
        "GET"
      )
    ).tracks;

    console.log(
      tracks?.map(
        ({ name, artists }) =>
          `${name} by ${artists.map((artist) => artist.name).join(", ")}`
      )
    );

    const ids = tracks?.map((track) => track.id);
    const uris = tracks?.map((track) => track.uri);

    const allIds = trackIds.push(ids);
    const allUris = trackUris.push(uris);

    setTrackIds(allIds);
    setTrackUris(allUris);
  }

  async function getUserId() {
    const id = (await fetchWebApi(`v1/me`, "GET")).id;

    setUserId(id);
  }

  async function createPlaylist(tracksUri) {
    await fetchWebApi(`v1/users/${userId}/playlists`, "POST", {
      name: "Monthly playlist",
      description: "",
      public: false,
    }).then((playlist) => {
      fetchWebApi(
        `v1/playlists/${playlist.id}/tracks?uris=${trackUris.join(",")}`,
        "POST"
      );
      setPlaylistId(playlist.id);
      return playlist;
    });

    const createdPlaylist = await createPlaylist(trackUris);
    console.log(createdPlaylist.name, createdPlaylist.id);
  }

  function generate() {
    getTopTracks();
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
              href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            >
              Login to Spotify
            </a>
          ) : (
            <div>
                <button className="block bg-black" onClick={generate}>
                  Generate playlist
                </button>
              <button onClick={logout}>logout</button>
            </div>
          )}

          {!playlistId ? (
            // <iframe
            //   title="Spotify Embed: Recommendation Playlist "
            //   src={`https://open.spotify.com/embed/playlist/7qOAs1sscWpsY8FdIOlpDH?utm_source=generator&theme=0`}
            //   width="100%"
            //   height="100%"
            //   style={{ minHeight: '360px' }}
            //   frameBorder="0"
            //   allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            //   loading="lazy"
            // />
            <></>
          ) : (
            <div></div>
          )}
        </div>
      </header>
    </div>
  );
}

export default GetMonthly;
