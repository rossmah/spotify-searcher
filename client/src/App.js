import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Col, Card, Dropdown } from 'react-bootstrap';
import{useState, useEffect} from 'react';

// Spotify API Credentials
const CLIENT_ID = "8ed069cbd1cd4b74ba9e7dcccd9aefad";
const CLIENT_SECRET = "b9107bfcaa4a415fa29e1adbc850a97b";

function App() {
  //State Variables
  const[searchInput, setSearchInput] = useState("");
  const[searchType, setSearchType] = useState("");
  const[selectedSearchType, setSelectedSearchType] = useState("");
  const[accessToken, setAccessToken] = useState("");
  const[albums, setAlbums] = useState([]);
  const[searchedAlbum, setSearchedAlbum] = useState("");
  const[songs, setSongs] = useState([]);
  const[artist, setArtist] = useState("");

  // Function to fetch access token from Spotify API
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const authParameters = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
        };

        const response = await fetch('https://accounts.spotify.com/api/token', authParameters);
        if (!response.ok) {
          throw new Error('Failed to fetch access token');
        }

        const data = await response.json();
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Error fetching access token:', error.message);
        // Display error message to the user
        alert('Failed to fetch access token. Please try again later.');
      }
    };
    fetchAccessToken();
  }, []);


  //Function to perform search based on selected search type (Artist, Song, Album)
  async function search() {
    try {
      setSearchType(selectedSearchType);
      
      //Get request using search to get the Artist ID
      var searchParameters = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        }
      }

      //Handles search based on Artist
      if(searchType === 'artist'){
        //Fetch Artist ID
        const artistResponse  = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters);
        if (!artistResponse.ok) {
          throw new Error('Failed to fetch artist data');
        }
        const artistData = await artistResponse.json();
        const artistID = artistData.artists.items[0].id;
      
        //Fetch Artist's Albums (based on Artist ID)
        const albumsResponse = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters);
        if (!albumsResponse.ok) {
          throw new Error('Failed to fetch artist albums');
        }
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData.items);

        //Fetch Artist Information (based on Artist ID)
        const artistInfoResponse  = await fetch('https://api.spotify.com/v1/artists/' + artistID, searchParameters);
        if (!artistInfoResponse.ok) {
          throw new Error('Failed to fetch artist information');
        }
        const artistInfoData = await artistInfoResponse.json();
        setArtist(artistInfoData);

      }
      //Handles search based on Album
      else if (searchType === 'album') {
        //Fetch Album ID
        const albumResponse = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=album', searchParameters);
        if(!albumResponse.ok) {
          throw new Error('Failed to fetch album data');
        } 
        const albumData = await albumResponse.json();
        const albumID = albumData.albums.items[0].id;

        //Fetch Album Information (based on Album ID)
        const searchedAlbumResponse = await fetch('https://api.spotify.com/v1/albums/' + albumID, searchParameters);
        if(!searchedAlbumResponse.ok) {
          throw new Error('Failed to fetch searched album data');
        }
        const searchedAlbumData = await searchedAlbumResponse.json(0);
        setSearchedAlbum(searchedAlbumData);

      }
      //Handles search based on Song
      else if (searchType === 'song') {
        //Fetch Songs that match search
        const searchedSongResponse = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=track', searchParameters);
        if(!searchedSongResponse.ok) {
          throw new Error('Failed to fetch searched song data');
        }
        const searchedSongData = await searchedSongResponse.json(0);
        setSongs(searchedSongData.tracks.items);
      }
    } catch (error){
      console.error('Error during search:', error.message);
      alert('Error during search: ', error.message);
    }
  }

  //Function to get dropdown text based on user's selected search type
  const getDropdownText = () => {
    if (selectedSearchType) {
      return `Search By ${selectedSearchType.charAt(0).toUpperCase() + selectedSearchType.slice(1)}`;
    } else {
      return 'Search Type';
    }
  };

  // Function to convert milliseconds to Minutes:Seconds format
  function formatDuration(durationMs) {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  }

  //useEffect to trigger search once searchType changes (when 'Search' button is clicked)
  //Created due to the program's asynchronous nature, so that search() does not run before searchType can be set
  useEffect(() => {
    if (searchType) {
      search();
    }
  }, [searchType]);

  //Function to validate search input. Checks for empty searches, and searches more than 100 characters
  const validateSearchInput = () => {
    const MAX_SEARCH_LENGTH = 100;

    if (searchInput.trim() === '') {
      alert('Please enter a search criteria.');
      return false;
    }
    if (searchInput.trim().length > MAX_SEARCH_LENGTH) {
      alert(`Please enter a search criteria with fewer than ${MAX_SEARCH_LENGTH} characters.`);
      return false;
    }
    return true;
  };

  //Function to validate that a search type has been selected
  const validateSearchType = () => {
    if (!selectedSearchType) {
      alert('Please select a search type.');
      return false;
    }
    return true;
  };


  //--------FRONTEND DISPLAY SECTION----------------
  //GUI Display will vary based on type of information queried
  return (
    <div className="App">
      <Container>
          <InputGroup className ="mb-3" size="lg">
          <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {getDropdownText()}
              </Dropdown.Toggle>
              <Dropdown.Menu className=".dropdown-toggle">
                <Dropdown.Item onClick={() => setSelectedSearchType('artist')}>Search For Artist</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedSearchType('song')}>Search For Song</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedSearchType('album')}>Search For Album</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <FormControl
              placeholder="Search Criteria"
              type="input"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
            />
            <Button className=".dropdown-toggle" onClick={() => {
              if (validateSearchInput() && validateSearchType()) {
                search(); 
              }
              }}>Search</Button>
          </InputGroup>
      </Container>

      {searchType === 'artist' && artist && (
        <Container>
          <Row className="justify-content-center mb-3">
            <Col md={4}>
              <Card className="border-0">
                <Card.Img src={artist.images[0].url}/>
                <Card.Body>
                  <Card.Title>{artist.name}</Card.Title>
                  <Card.Text>                      
                  Genres: {artist.genres.join(', ')}
                  <br/>
                  Spotify Followers: {artist.followers.total}
                  </Card.Text> 
                </Card.Body>
              </Card>
            </Col>
            </Row>
            <Row>
            <Col>
              <Row className="row-cols-4">
                {albums.map( (album, i) => {
                  return (
                    <Col key={i} className="mb-3">
                      <Card className="border-0">
                        <Card.Img src={album.images[0].url}/>
                        <Card.Body>
                          <Card.Title>{album.name}</Card.Title>
                          <Card.Text>
                            Total Tracks: {album.total_tracks}
                            <br />
                            Release Date: {album.release_date}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </Col>
          </Row>
        </Container>
      )}

      {searchType === 'album' && searchedAlbum && (
        <Container>
          <Row className="mx-2">
            <Col md={6}>
              <Card className="border-0">
                <Card.Img src={searchedAlbum.images[0].url}/>
                </Card></Col>
                <Col md={6}>
                <Card className="border-0">
                <Card.Body>
                  <Card.Title>{searchedAlbum.name}</Card.Title>
                  <Card.Text>
                    Artist: {searchedAlbum.artists[0].name}
                    <br/>
                    Total Tracks: {searchedAlbum.total_tracks}
                    <br />
                    Release Date: {searchedAlbum.release_date}
                    <br />
                    <b>Track List:</b>
                    <ol style={{paddingLeft: '20px'}}>
                      {searchedAlbum.tracks.items.map((track, index) => (
                        <li key={index} style={{textAlign:'left'}}>{track.name}</li>
                      ))}
                    </ol>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )}

      {searchType === 'song' && (
        <Container>
          <Row className="row row-cols-4">
            {songs.map( (song, i) => {
              //console.log(album);
              return (
                <Card className="mb-3 border-0">
                  <Card.Img src={song.album.images[0].url}/>
                  <Card.Body>
                    <Card.Title>{song.name}</Card.Title>
                    <Card.Text>
                  Artist: {song.artists[0].name}
                  <br />
                  Release Date: {song.album.release_date}
                  <br />
                  Duration: {formatDuration(song.duration_ms)}
                </Card.Text>
                  </Card.Body>
                </Card>
              )
            })}
          </Row>
        </Container>
      )}
      </div>
    );
}
export default App;
