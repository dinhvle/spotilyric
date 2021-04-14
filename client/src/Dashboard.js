import useAuth from "./useAuth";
import { Container, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  clientId: "787970b0fe4a4a20a733ea1ab6585388",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("hello");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");

  function chooseTrack(track) {
    setPlayingTrack(track);
    setLyrics("");
  }

  useEffect(() => {
    if (!playingTrack) return;
    axios
      .get("/api/lyrics", {
        params: {
          track: playingTrack.title,
          artist: playingTrack.artist,
        },
      })
      .then((res) => {
        setLyrics(res.data.lyrics);
      });
  }, [playingTrack]);

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 800);

    return () => {
      clearInterval(timerId);
    };
  }, [search]);

  useEffect(() => {
    if (!debouncedSearch) return setSearchResults([]);
    if (!accessToken) return;

    spotifyApi.searchTracks(debouncedSearch).then((res) => {
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );

          return {
            albumUrl: smallestAlbumImage.url,
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
          };
        })
      );
    });
  }, [debouncedSearch, accessToken]);

  return (
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search Songs/Artists"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="d-flex flex-row my-2" style={{ overflowY: "auto" }}>
        <div className="flex-fill">
          {searchResults.map((track) => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              chooseTrack={chooseTrack}
            />
          ))}
        </div>
        {searchResults.length !== 0 && (
          <div className="flex-fill text-center" style={{ whiteSpace: "pre" }}>
            {lyrics}
          </div>
        )}
      </div>
      <div className="d-flex flex-row my-2">
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
