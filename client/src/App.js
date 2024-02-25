import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import{useState, useEffect} from 'react';

const CLIENT_ID = "8ed069cbd1cd4b74ba9e7dcccd9aefad";
const CLIENT_SECRET = "b9107bfcaa4a415fa29e1adbc850a97b";

function App() {
  const[searchInput, setSearchInput] = useState("");
  const[accessToken, setAccessToken] = useState("");
  const[albums, setAlbums] = useState([]);

//RUNS ONCE, GOOD FOR SETTING UP A CLIENT OR API SO THAT IT DOESNT TRY TO CONNECT TO API AS SOON AS YOU REFRESH
useEffect(() => {
  //API Access Token
  var authParameters = {
    method: 'POST', 
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET
  }
  //TODO: IMPLEMENT ERROR HANDLING FOR FETCH
  fetch('https://accounts.spotify.com/api/token', authParameters)
    .then(result => result.json())
    .then(data => setAccessToken(data.access_token))
}, [])

//SEARCH - MOST IMPORTANT FUNCTION
//making aysnc bc we use await function
async function search() {
  console.log("Search for: " + searchInput); //taylor swift


  //Get request using search to get the Artist ID
  var searchParameters = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
    }
  }
  var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
    .then(response => response.json())
    //.then(data => { console.log(data)})
    .then(data => {return data.artists.items[0].id});

  console.log("artist ID is " + artistID);
  
  //Get request with Artist ID grab all the albums from that artist
  var returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      setAlbums(data.items);
    });

  //Display those albums to the user



}






console.log(albums);

  return (
    <div className="App">
      <Container>
          <InputGroup className ="mb-3" size="lg">
            <FormControl
              placeholder="Search for Artist"
              type="input"
              onKeyPress={event => {
                if(event.key == "Enter") {
                  search();
                }
              }}
              onChange={event => setSearchInput(event.target.value)}
            />
            <Button onClick={search}>
              Search
            </Button>
          </InputGroup>
      </Container>
      <Container>
        <Row className="mx-2 row row-cols-4">
          {albums.map( (album, i) => {
            console.log(album);
            return (
              <Card>
                <Card.Img src={album.images[0].url}/>
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            )
          })}
        
        </Row>
        
      </Container>
      
    </div>
  );
}

export default App;
