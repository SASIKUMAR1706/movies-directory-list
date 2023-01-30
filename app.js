const express = require("express");

const path = require("path"); //core module created
const databasePath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3"); //driver connect

const app = express();
app.use(express.json()); //middle ware # in Http lo Request in body

let database = null;

const intializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://loclhost:3000");
    });
  } catch (e) {
    console.log("DataBase Error:${e.message}");
    process.exit(1);
  }
};

intializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API1 get  APP.METHOD (PATH,HANDLER)

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name 
    FROM movie;`;
  const moviesQuery = await database.all(getMoviesQuery);
  response.send(
    moviesQuery.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//API3 get APP.METHOD (PATH,HANDLER)

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovieIdQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId};`;
  const movieIdQuery = await database.get(getmovieIdQuery); //return a promise object
  response.send(convertMovieDbObjectToResponseObject(movieIdQuery));
});

//API2 post APP.METHOD (PATH,HANDLER)

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const movieCreateQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}');`;
  await database.run(movieCreateQuery);

  response.send("Movie Successfully Added");
});

//API4 put method

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie 
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE 
    movie_id=${movieId};`;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API5 delete method

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieIdQuery = `
    DELETE FROM movie
    WHERE movie_id='${movieId}';`;
  await database.run(deleteMovieIdQuery);
  response.send("Movie Removed");
});

//API6 get method in directories

app.get("/directors/", async (request, response) => {
  const getDirectoriesQueries = `
        SELECT *
        FROM 
        director;`;
  const directQueries = await database.all(getDirectoriesQueries);
  response.send(
    directQueries.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//API7 GET METHOD IN director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await database.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
