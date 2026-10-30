# Task List API (SYD204)

A REST API for managing tasks, with a simple web page to use it. It is built with **Node.js**, **Express** and **MySQL** (hosted on Aiven), and organised with the **MVC** pattern.

Author: Tshering Deki, SYD204 Backend Unit

## Features

- Create, read, update and delete tasks (full CRUD)
- Tasks are stored in MySQL, so they survive server restarts
- Input validation with clear error messages (400, 404, 500)
- SQL injection protection with parameterised queries (`?` placeholders)
- Secrets kept in a `.env` file, never in the code
- Connection pool for fast database access
- A web page (HTML, CSS, JavaScript) to add, tick, filter and delete tasks, with a counter of tasks still to do

## Tech stack

| Part | Tool |
|---|---|
| Runtime | Node.js (v18 or higher) |
| Web framework | Express |
| Database | MySQL 8 on Aiven Cloud |
| Database driver | mysql2 |
| Config | dotenv |
| Dev tool | nodemon |
| Frontend | HTML, CSS, JavaScript (no framework) |

## Project structure

```
TaskAPIs-main/
├── database/
│   └── schema.sql            creates the tasks table and 6 starter tasks
├── public/                   the web page, served by Express
│   ├── index.html
│   ├── style.css
│   └── script.js
├── src/
│   ├── db.js                 MySQL connection pool
│   ├── routes/
│   │   └── taskRoutes.js     URL + method -> controller function
│   ├── controllers/
│   │   └── taskController.js validation, status codes, responses
│   └── models/
│       └── taskModel.js      SQL queries only
├── server.js                 entry point
├── test-db.js                one-time database connection test
├── .env                      your secrets (not committed)
├── .gitignore
├── package.json
└── README.md
```

### How a request travels (MVC)

```
Browser / Postman
      |
   Route         which URL and method?
      |
  Controller     validate, call the model, send the reply
      |
    Model        run the SQL
      |
    MySQL        permanent storage
```

## Setup

### 1. Install packages

```
npm install
```

### 2. Create your Aiven database user

1. Open the class MySQL service `mysql-20713dd0` on Aiven.
2. Go to **Users** and click **Create service user**.
3. Choose your own username and the `caching_sha2_password` method.
4. Copy the generated password straight away.

### 3. Create the `.env` file

Create a file named `.env` in the project root:

```
PORT=3000
DB_HOST=mysql-20713dd0-rub-a06b.b.aivencloud.com
DB_PORT=15308
DB_USER=your_aiven_username
DB_PASS=your_aiven_password
DB_NAME=defaultdb
DB_SSL=REQUIRED
```

Never commit this file. It is listed in `.gitignore`.

### 4. Create the table

Open `database/schema.sql` in MySQL Workbench (connected to the Aiven server with SSL on) and run it. Do not run `CREATE DATABASE`, because `defaultdb` already exists.

The file creates the `tasks` table and adds 6 starter tasks. It is safe to run again: it will not add the starter tasks twice.

### 5. Test the connection

```
npm run test:db
```

You should see `Connected to MySQL`. You can delete `test-db.js` afterwards (and remove the `test:db` line from `package.json`).

## Run the project

```
npm run dev
```

The terminal should show:

```
Server running at http://localhost:3000
GET    /api
GET    /tasks
POST   /tasks
GET    /tasks/:id
PUT    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
```

Hold **Ctrl** and click the `http://localhost:3000` link to open the web page in your browser. You can also type the address into the browser yourself.

To run without nodemon:

```
npm start
```

## API endpoints

| Method | URL | What it does | Success |
|---|---|---|---|
| GET | `/api` | Health check | 200 |
| GET | `/tasks` | List all tasks, newest first | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Replace title and completed (both required) | 200 |
| PATCH | `/tasks/:id` | Change title and/or completed | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |

### Example requests

Health check:

```
GET http://localhost:3000/api
```

Response (200):

```json
{ "message": "Task API is ready!", "version": "MySQL + MVC" }
```

Create a task:

```
POST http://localhost:3000/tasks
Content-Type: application/json

{ "title": "Learn Express" }
```

Response (201):

```json
{
  "id": 7,
  "title": "Learn Express",
  "completed": 0,
  "created_at": "2026-10-28T09:00:00.000Z",
  "updated_at": "2026-10-28T09:00:00.000Z"
}
```

`completed` is `0` for not done and `1` for done (MySQL stores true/false as a number).

Mark a task as done:

```
PATCH http://localhost:3000/tasks/7
Content-Type: application/json

{ "completed": true }
```

### Error responses

| Status | When | Body |
|---|---|---|
| 400 | Missing or empty title (POST, PUT) | `{ "error": "Title is required" }` |
| 400 | `completed` is not true/false (POST, PUT, PATCH) | `{ "error": "completed must be true or false" }` |
| 400 | PATCH with neither `title` nor `completed` | `{ "error": "Provide title or completed to update" }` |
| 400 | PATCH with an empty title | `{ "error": "Title cannot be empty" }` |
| 404 | No task with that id | `{ "error": "Task not found" }` |
| 500 | Database or server problem | `{ "error": "Internal Server Error" }` |

## The web page

The page in `public/` talks to the API and lets you:

- add a task
- tick a task as done (or undo it)
- delete a task
- filter by All, To do and Done
- see how many tasks are still to do (for example "2 of 6 still to do") and the date each task was added

Express serves it with these lines in `server.js`:

```js
app.use(express.static(path.join(__dirname, 'public')));
```

Open it through the server (`http://localhost:3000`). Opening `index.html` by double-clicking will not work, because the page needs the server to reach the API.

## Testing checklist

| Test | Expected |
|---|---|
| `GET /api` | 200 and `Task API is ready!` |
| `GET /tasks` | 200 and a list of tasks |
| `POST /tasks` with `{ "title": "My task" }` | 201 and the new task |
| `GET /tasks/9999` | 404 `Task not found` |
| `PATCH /tasks/1` with `{ "completed": true }` | 200, `completed` is `1` |
| `PATCH /tasks/1` with `{}` | 400 `Provide title or completed to update` |
| `PUT /tasks/1` with `{ "title": "x" }` | 400 `completed must be true or false` |
| `DELETE /tasks/<id>` | 204, then GET returns 404 |
| `POST /tasks` with `{}` | 400 `Title is required` |
| `POST /tasks` with `{ "title": "'; DROP TABLE tasks; --" }` | 201, saved as plain text, table still exists |
| Create a task, restart the server, `GET /tasks` | The task is still there |

## Common problems

| Problem | Fix |
|---|---|
| `'nodemon' is not recognized` | Run `npm install` first |
| `Access denied` | Check `DB_USER` and `DB_PASS` in `.env` |
| Connection times out | Check `DB_PORT=15308` and `DB_SSL=REQUIRED` |
| `Table 'tasks' doesn't exist` | Run `database/schema.sql` in Workbench |
| `req.body` is undefined | `app.use(express.json())` must come before the routes |
| Port 3000 already in use | Stop the old server with Ctrl+C |
| Page shows JSON instead of the UI | Open `http://localhost:3000` (not `/api` or `/tasks`), and make sure `express.static` comes before the routes in `server.js` |
| Page looks unstyled | Hard refresh with Ctrl+F5 |

## Security notes

- Passwords live in `.env`, which is never committed.
- Every value from the client goes through a `?` placeholder. The only dynamic SQL is the column list in `PATCH`, and it is built from fixed column names, never from user input.
- Error stacks are logged on the server and never sent to the client. For 500 errors the client only sees `Internal Server Error`.
