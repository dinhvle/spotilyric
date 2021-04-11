import useAuth from "./useAuth";
import { Container, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: "336cc5f653c948679d20e75dd48b99d3",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [searchResults, setSearchResults] = useState([]);
  console.log(searchResults);

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
      <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
        Songs
      </div>
      <div>Bottom</div>
    </Container>
  );
}
