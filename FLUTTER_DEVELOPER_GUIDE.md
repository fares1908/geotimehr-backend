# GeoTime HR Backend Guide for Flutter Developers

Here is a friendly, comprehensive guide to the GeoTime HR Node.js backend, translated specifically for a Flutter developer's mental model.

Since the project has over 40 files, we will trace a complete "vertical slice" from the server entry point all the way down to a specific feature (Authentication). This will give you the exact mental map of how the entire codebase works file by file!

---

## 📄 server.js

**Purpose in one line:** Starts the server and connects to the database.

**Flutter equivalent:** `main.dart` (the `void main()` function that calls `runApp()`).

**Code breakdown:**

- `require('./config/db')`: Imports our database connection logic. (Like `import 'config/db.dart'`).
- `require('./app')`: Imports the Express app configuration (all the routes and setup).
- `connectDB()`: An `async` function that connects to MongoDB Atlas.
- `app.listen(port)`: Starts the web server listening on port 3000, just like an app launching on a device.

**Key concepts used:** `async/await`, module importing.

**How it connects to other files:** This is the absolute starting point. It calls `config/db.js` to connect to data, and wraps `app.js` to serve the API.

---

## 📄 app.js

**Purpose in one line:** Configures the Express framework, adds global security rules, and wires up all the API routes.

**Flutter equivalent:** `MaterialApp` widget setup (where you define your global themes, `Navigator` or `GoRouter` setup, and global state providers).

**Code breakdown:**

- `const app = express()`: Initializes the Express application.
- `app.use(helmet())` / `app.use(cors())`: Adds global middleware. This is like wrapping your `MaterialApp` in global providers or applying a global HTTP Interceptor that adds security headers to every request.
- `app.use(express.json())`: Tells the server to automatically parse incoming JSON data. (Like `jsonDecode()` in Dart, but automatic for every incoming HTTP call).
- `app.use('/api', require('./routes'))`: Says "For any web request starting with `/api`, go look at the `routes/index.js` file to figure out where it should go."
- `app.use(errorHandler)`: A global catch-block for any crashes. Similar to `FlutterError.onError`.

**Key concepts used:** global middleware, routing.

**How it connects to other files:** Called by `server.js`. It imports all your security middleware from `middleware/` and all your routes from `routes/index.js`.

---

## 📄 config/env.js

**Purpose in one line:** Loads and safely checks environment variables (like API keys and ports).

**Flutter equivalent:** `flutter_dotenv` package or `envied` (reading from a `.env` file).

**Code breakdown:**

- `const { env } = process`: Grabs the system's environment variables.
- `const REQUIRED = ["PORT", "MONGODB_URI"...]`: A list of keys we absolutely need.
- `if (missing.length > 0) throw new Error(...)`: A fail-safe. If you forgot your `.env` file, the app crashes immediately with a helpful error message instead of failing silently later.
- `const config = { ... }`: Exports a strongly-typed, clean object so the rest of the app doesn't have to call `process.env` directly.

**Key concepts used:** process environment, fail-fast error handling.

**How it connects to other files:** Almost every file imports this (like database connection, JWT signing) to get secret keys safely.

---

## 📄 models/User.js

**Purpose in one line:** Defines the shape of the User data in the database and handles saving/retrieving it.

**Flutter equivalent:** A Dart Data Class (e.g., `class User { ... }`) combined with a Repository class that handles SQLite or Firebase Firestore calls. Mongoose does both in one!

**Code breakdown:**

- `new mongoose.Schema({ ... })`: Defines the exact fields a User must have (name, email, organization ID).
- `type: mongoose.Schema.Types.ObjectId, ref: "Organization"`: A foreign key. It tells Mongoose "This ID points to a document in the Organization collection."
- `schema.pre("save", async ...)`: A "hook". Right before solving to the DB, it intercepts the save, checks if the password was modified, and hashes it using `bcrypt` for security.
- `schema.methods.comparePassword`: Adds a helper function to the model to verify login attempts.
- `schema.set("toJSON", { transform: ... })`: Automatically strips out the `passwordHash` anytime we send a User object back as JSON (so we don't accidentally leak passwords to the frontend).

**Key concepts used:** Mongoose Schemas, password hashing (bcrypt), pre-save hooks.

**How it connects to other files:** Controllers import this model to query the database (e.g., `User.findById()`).

---

## 📄 middleware/auth.js

**Purpose in one line:** Intercepts incoming HTTP requests to check if the user is safely logged in.

**Flutter equivalent:** A Dio Interceptor in Dart (specifically `onRequest` interceptor) or a Route Guard in `GoRouter`.

**Code breakdown:**

- `const token = req.headers.authorization.split(" ")[1]`: Extracts the Bearer token from the incoming HTTP headers.
- `jwt.verify(token, jwtSecret)`: Mathematically verifies the token hasn't been tamped with and hasn't expired.
- `const user = await User.findOne(...)`: Looks up the user from the database to ensure they haven't been deleted or deactivated since the token was issued.
- `req.user = { userId, orgId, role }`: Attaches the user's details to the request object, so the controller (the next step) knows exactly who is making the request.
- `next()`: Says "This request is safe, move on to the next function."

**Key concepts used:** JWT (JSON Web Tokens), middleware chain, `try/catch/next`.

**How it connects to other files:** Placed inside route definitions (`routes/*.js`) to protect specific endpoints before they reach the Controller.

---

## 📄 routes/auth.routes.js

**Purpose in one line:** Maps URL web addresses to specific logic functions.

**Flutter equivalent:** `GoRouter` or `MaterialApp` routing tables where you map a string `'/login'` to a specific `LoginScreen()` widget.

**Code breakdown:**

- `const router = express.Router()`: Creates a mini routing map.
- `router.post("/login", [authLimiter, validate(loginSchema)], login)`: Says "When a POST request hits `/login`, first run the rate limiter, then run the Joi validation schema, and if both pass, execute the `login` controller function."
- `module.exports = router`: Exports this mini map so `app.js` can use it.

**Key concepts used:** Express Routers, array-based middleware chaining.

**How it connects to other files:** Imported by `routes/index.js`. It explicitly links validation middleware and backend Controllers together.

---

## 📄 controllers/auth.controller.js

**Purpose in one line:** The actual "brain" or business logic for authentication.

**Flutter equivalent:** A BLoC (Business Logic Component), `Riverpod` Notifier, or a ViewModel. It takes an event (request), processes it, and emits a state (response).

**Code breakdown:**

- `const login = async (req, res, next) => {`: The handler function. `req` is the incoming data (like `event` in BLoC), `res` is how we send back data (like `emit()` in BLoC).
- `try { ... } catch (err) { next(err) }`: We wrap everything in try/catch. If anything crashes, `next(err)` sends it to the global error handler in `app.js` so the server doesn't die.
- `const { email, password } = req.body`: Grabs the data the front-end sent us.
- `const user = await User.findOne({ email })`: Queries MongoDB for the user. (Same as Dart: `await firestore.collection('users').where('email'...`)
- `if (!user) return sendError(...)`: Easy check. If no user, send back HTTP 401 Unauthorized.
- `const token = signToken(...)`: Generates a JWT string that acts as a digital passport for modern web apps.
- `return sendSuccess(res, { token, user })`: Uses our custom utility function (`utils/response.js`) to send cleanly formatted JSON back to the Flutter app!

**Key concepts used:** `async/await`, database querying, JWT signing, custom HTTP responses.

**How it connects to other files:** Called directly by the Routes. Imports MongoDB models to interact with the database and Utils to format the JSON response.

---

## 📊 Node.js vs Flutter/Dart Comparison Table

| Node.js Concept      | Flutter/Dart Equivalent            | Notes                                                                                    |
| -------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `require('file')`    | `import 'file.dart'`               | Node uses CommonJS. It acts just like a Flutter import.                                  |
| `module.exports = X` | `export` / Public classes          | Makes the file's functions available to other files.                                     |
| `async` / `await`    | `async` / `await`                  | They work **exactly the same** in JS and Dart! Both run on a single-threaded event loop. |
| `Middleware`         | `Dio Interceptor` / `Route Guards` | Functions that intercept a request _before_ it reaches its final destination.            |
| `Mongoose Model`     | `Data Class` + `Repository`        | A Dart `Class` merged with the database query tools.                                     |
| `JWT Token`          | `Firebase Auth Token`              | The long string of text used to prove the user is logged in.                             |
| `.env` file          | `flutter_dotenv` / `BuildConfig`   | Where you hide secret API keys securely outside of source code.                          |
| `Express Router`     | `GoRouter` routes / `Navigator`    | The switchboard that maps URLs to code.                                                  |
| `try / catch / next` | `try / catch` in a BLoC            | How we catch crashes safely. `next(err)` passes the error up the chain context.          |
| `Promise.all`        | `Future.wait`                      | Running multiple database queries at the exact same time to save milliseconds.           |
