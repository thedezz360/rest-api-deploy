const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
// middleware que solo parcea json y solo procesa las request que tengan un header especifico
app.use(express.json())
app.disable('x-powered-by')

const PORT = process.env.PORT ?? 3000

// origenes aceptados para peticiones
const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'http://movies.com'
]

// Todos los recursos que sean MOVIES  se identifican con /movies
// recuperar todas las peliculas
app.get('/movies', (req, res) => {
  // establecemos cabecera para permitir cors de este recurso
  // recuperamos la cabecera origin que nos trae la request
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }
  // intentamos recuperar el parametro genre
  const { genre } = req.query
  // comprobamos si hemos recuperado el parametro
  if (genre) {
    const filteredMovies = movies.filter((movie) => {
      return movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    })
    return res.json(filteredMovies)
  }
  res.json(movies)
})

// obtener una movie por su id

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

// crear nueva movie

app.post('/movies', (req, res) => {
  // validamos el body
  const result = validateMovie(req.body)

  // comprobamos si tenemos algun error
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // creamos la nueva movie
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // añadimos la movie
  movies.push(newMovie)

  // respondemos
  res.status(201).json(newMovie)
})

// eliminar
app.delete('/movies/:id', (req, res) => {
  // recuperamos la cabecera origin que nos trae la request
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// actualizar solo una parte de una movie

app.patch('/movies/:id', (req, res) => {
  // validamos el body
  const result = validatePartialMovie(req.body)

  // comprobamos la validacion
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params

  const movieindex = movies.findIndex((movie) => movie.id === id)

  // obtenemos el index de la movie que se desea actualizar
  if (movieindex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  // actualizamos la movie
  const updateMovie = {
    ...movies[movieindex],
    ...result.data
  }

  // guardamos la updateMovie
  movies[movieindex] = updateMovie

  // respondemos
  return res.json(updateMovie)
})

// agregamos el option para permitir el delete desde otros origenes
app.options('/movies/:id', (req, res) => {
  const origin = req.header('origin')
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  }
  res.send(200)
})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
