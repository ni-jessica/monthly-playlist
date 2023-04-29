import "./App.css";
import { useState, useEffect } from "react";
import { getTracks, createPlaylist } from "./endpoints";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const REDIRECT_URI = "http://localhost:3000";
const SCOPE =
  "user-read-playback-state user-library-read user-read-private user-modify-playback-state user-read-recently-played user-top-read playlist-modify-private";

const Tracks = ({ topTracks, recommendedTracks }) => {
  return (
    <div>
      <p className="text-xl font-bold ">
        You have great taste <>&#128525;</>
      </p>

      <div className="mt-12 mb-20 flex flex-col lg:flex-row w-full gap-36 text-left">
        <div>
          <p className="whitespace-nowrap">
            Your top 20 tracks from the last 30 days were:
          </p>
          <ol className="ml-14 mt-4 list-decimal">
            {topTracks.map((track) => (
              <li className="text-left">{track}</li>
            ))}
          </ol>
        </div>
        <div className="-mt-16 lg:mt-0 h-full">
          <p className="whitespace-nowrap">
            Based on your listening activity, check out:
          </p>
          <div>
            <ol className="ml-14 mt-4 list-decimal">
              {recommendedTracks.map((track) => (
                <li className="text-left">{track}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

function GetMonthly() {
  const [accessToken, setAccessToken] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [tracksUri, setTracksUri] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const getStats = async () => {
    const tracks = await getTracks(
      accessToken,
      setTopTracks,
      setRecommendedTracks
    );

    setTracksUri(tracks);
  };
  async function generate() {
    await createPlaylist(tracksUri, accessToken, setPlaylistId);
    setIsGenerated(true);
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
      window.location.hash = "";
    }
  }

  const logout = () => {
    setAccessToken("");
    setPlaylistId("");
    setIsGenerated(false);
  };

  useEffect(() => {
    getToken();

    if (accessToken) {
      getStats();
      return;
    }
  }, [accessToken]);

  return (
    <div className="App">
      <div className="my-28 px-[10%] text-center justify-center font-mono">
        <h1 className="text-7xl font-extrabold">
          Spotify Monthly <br/>
          Playlist Generator
        </h1>

        {!accessToken ? (
          <div id="welcome page">
            <p className="my-12 text-4xl font-extrabold">
              See your monthly favorites, get some recommendations, and create a
              playlist <>&#x2728;</>
            </p>
            <a
              href={`${AUTH_ENDPOINT}?show_dialog=true&client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
            >
              <button className="py-10 px-16 my-8 bg-indigo-800 hover:bg-emerald-600 hover:scale-105 transition duration-500 border rounded-full text-2xl text-white">
                Login using Spotify
              </button>
            </a>
          </div>
        ) : (
          <div className="my-16 flex flex-col justify-center items-center">
            <Tracks
              topTracks={topTracks}
              recommendedTracks={recommendedTracks}
            />

            {/* generator */}
            <p>
              Would you like to create a playlist based off of your top and
              recommended songs?
            </p>
            <button
              className="my-4 py-10 w-full lg:w-3/4 bg-indigo-800 hover:bg-emerald-600 hover:scale-105 transition duration-500 border rounded-full text-2xl text-white whitespace-nowrap"
              onClick={generate}
            >
              Generate playlist!
            </button>
            {isGenerated && (
              <p>
                <>&#127925;</> playlist was successfully generated and added to
                profile <>&#127925;</>
              </p>
            )}

            {/* embbeded player */}
            {playlistId && (
              <iframe
                className="my-10"
                title="Created playlist"
                src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                style={{ minHeight: "650px" }}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            )}

            <button
              className="mt-16 text-xl border-none text-gray-400 hover:text-indigo-800 hover:scale-105 transition duration-500 underline"
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
