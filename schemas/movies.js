const z = require('zod')

// creamos el schema de la movie para su validación
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: ' Movie tile is required'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thiller',
      'Sci-Fi',
      'Crime'
    ]),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum genre'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

// partial convierte a todas las propiedades en opcionales
function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}

module.exports = { validateMovie, validatePartialMovie }
