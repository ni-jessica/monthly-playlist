import "./App.css";
import { useState, useEffect } from "react";
import { getTracks, createPlaylist } from "./endpoints";
import { CLIENT_ID } from "./env.tsx";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const REDIRECT_URI = "http://localhost:3000";
const SCOPE =
  "user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-recently-played user-top-read playlist-modify-private";

const TopTracks = ({ topTracks, recommendedTracks }) => {
  return (
    <div>
      You have great taste!
      <div className="my-12 flex flex-row w-full gap-36">
        <div>
          Your top 20 tracks for this month were:
          <ol className="list-decimal">
            {topTracks.map((track) => (
              <li className="text-left">{track}</li>
            ))}
          </ol>
        </div>
        <div>
          <p>Based on your listening activity, check out...</p>
          <p>These songs:</p>
          <ol className="list-decimal">
            {recommendedTracks.map((track) => (
              <li className="text-left">{track}</li>
            ))}
          </ol>

          <p>This album:</p>

          <p>This artist:</p>
        </div>
      </div>
    </div>
  );
};

function GetMonthly() {
  const [accessToken, setAccessToken] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  // const [tracksUri, setTracksUri] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);

  async function generate() {
    const tracksUri = await getTracks(
      accessToken,
      setTopTracks,
      setRecommendedTracks
    );
    createPlaylist(tracksUri, accessToken, setPlaylistId);
  }

  function getToken() {
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
      console.log(token);
      window.location.hash = "";
    }
  }

  const logout = () => {
    setAccessToken("");
    setPlaylistId("");
  };

  useEffect(() => {
    getToken();
  }, [accessToken]);

  return (
    <div className="App">
      <div className="my-32 px-[10%] text-center justify-center font-mono">
        <h1 className="text-7xl font-extrabold">
          Spotify Monthly <br></br>
          Playlist Generator
        </h1>

        {!accessToken ? (
          <div>
            <p className="my-12 text-4xl font-extrabold">
              Login to see your monthly recap, get some recommendations, and
              create a playlist :{`)`}
            </p>
            <a
              href={`${AUTH_ENDPOINT}?show_dialog=true&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            >
              <button className="py-10 px-16 my-8 bg-green-600 rounded-3xl text-2xl text-white">
                Login using Spotify
              </button>
            </a>
          </div>
        ) : (
          <div className="my-16 flex flex-col justify-center items-center">
            <TopTracks
              topTracks={topTracks}
              recommendedTracks={recommendedTracks}
            />
            <p className="">
              Would you like to create a playlist based off of your top and
              recommended songs?
            </p>
            <button
              className="my-4 py-10 w-2/3 bg-green-600 rounded-3xl text-2xl text-white"
              onClick={generate}
            >
              Generate playlist!
            </button>
            {playlistId && (
              <iframe
                className="my-10"
                title="Created playlist"
                src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                style={{ minHeight: "360px" }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            )}

            <button
              className="mt-16 text-xl border-none text-gray-400 hover:text-green-500 underline"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetMonthly;
