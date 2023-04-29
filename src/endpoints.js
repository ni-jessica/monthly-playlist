export async function fetchWebApi(endpoint, method, body, accessToken) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method,
      body: JSON.stringify(body),
    });
    return await res.json();
  }

export async function getTracks(accessToken, setTopTracks, setRecommendedTracks) {
    const topTracks = [];
    const id = await getUserId(accessToken)
    console.log(id)
    // get the users top 20 tracks from the last 30 days
    const tracks =  (await fetchWebApi(
      `v1/me/top/tracks?time_range=short_term&limit=20`, 'GET', undefined, accessToken
    )).items;

    tracks?.map(
      ({name, artists}) =>
        topTracks.push(`${name} by ${artists.map(artist => artist.name)}`)
    )

    setTopTracks(topTracks)

    const ids = tracks?.map(track => track.id)
    const uris = tracks?.map(track => track.uri)

    const seedIds = ids.slice(0, 5)
    const recommendedTracks = []
    // get 10 recommended tracks from the top 5
    const recommended = (
      await fetchWebApi(
        `v1/recommendations?limit=10&seed_tracks=${seedIds.join(',')}`,
        "GET", undefined, accessToken
      )
    ).tracks;

    recommended?.map(
      ({name, artists}) =>
        recommendedTracks.push(`${name} by ${artists.map(artist => artist.name)}`)
    )

    setRecommendedTracks(recommendedTracks)

    const recommendedUris = recommended.map(track=>track.uri)
    const allUris = uris.concat(recommendedUris)
    return allUris;
  }

export async function getUserId(accessToken) {
    return (await fetchWebApi(`v1/me`, "GET", undefined, accessToken)).id;
}

function getMonth() {
    const monthList = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    const d = new Date()
    const month = monthList[d.getMonth()]
    const year = d.getFullYear()

    return month + " " + year;
}

export async function createPlaylist(tracksUri, accessToken, setPlaylistId) {
    var userId;

    if (accessToken) {
        userId = await getUserId(accessToken);
        console.log(`creating playlist for : ${userId}`)
    }

    await fetchWebApi(`v1/users/${userId}/playlists`, "POST", {
      name: `${getMonth()}`,
      description: "",
      public: false,
    }, accessToken).then((playlist) => {
      fetchWebApi(
        `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(",")}`,
        "POST", undefined, accessToken
      );
      setPlaylistId(playlist.id);
      console.log(playlist.id)
      return playlist;
    });
}