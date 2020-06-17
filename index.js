const { Server } = require('ws');
const fetch = require('node-fetch');

class App {
  constructor() {
    this._movies = null;
    this._server = new Server({ port: process.env.PORT || 5000 });
    this._webSocket = null;
  }

  async run() {
    await this._getMovies();
    this._server.on('connection', (webSocket) => {
      this._webSocket = webSocket;
      console.log('One more client connected');
      this._webSocket.on('close', () => {
        console.log('One more client closed');
      });

      const loopEveryFiveSeconds = () => {
        const movies = this._movies;
        const ws = this._webSocket;

        function sendSeeds() {
          const randomNumber = Math.floor((Math.random() * (movies.length - 1)));
          const movie = movies[randomNumber];
          ws.send(`**Informasi** Film ${movie.title} sudah tayang di bioskop! Jangan lupa untuk menonton yah!`);

          setTimeout(sendSeeds, 5000);
        }

        sendSeeds();
      };

      loopEveryFiveSeconds();
    });
  }

  async _getMovies() {
    const response = await fetch('https://api.themoviedb.org/3/movie/now_playing?api_key=4a6eac5979a646031dc1c7a3cd7a2697&language=en-us&page=1');
    const responseJson = await response.json();
    this._movies = responseJson.results;
  }
}

const app = new App();
app.run();
