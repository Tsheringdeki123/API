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
- A web page (HTML, CSS, JavaScript) to add, tick, filter and delete tasks

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
│   └── schema.sql            creates the tasks table and seed rows
├── public/                   the web page, served by Express
│   ├── index.html
│   ├── style.css
│   └── script.js
├── src/
│   ├── db.js                 MySQL connection pool
│   ├── routes/               URL + method -> controller
│   ├── controllers/          validation, status codes, responses
│   └── models/               SQL queries only
├── server.js                 entry point
├── test-db.js                one-time database connection test
├── .env                      your secrets (not committed)
├── .gitignore
└── package.json
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

### 5. Test the connection

```
node test-db.js
```

You should see `Connected to MySQL`. You can delete `test-db.js` afterwards.

## Run the project

```
npm run dev
```

Then open **http://localhost:3000** in your browser to use the web page.

To run without nodemon:

```
node server.js
```

## API endpoints

| Method | URL | What it does | Success |
|---|---|---|---|
| GET | `/tasks` | List all tasks, newest first | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Replace title and completed | 200 |
| PATCH | `/tasks/:id` | Change title and/or completed | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |

### Example requests

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

Mark a task as done:

```
PATCH http://localhost:3000/tasks/7
Content-Type: application/json

{ "completed": true }
```

### Error responses

| Status | When | Body |
|---|---|---|
| 400 | Missing or empty title, or `completed` is not true/false | `{ "error": "Title is required" }` |
| 404 | No task with that id | `{ "error": "Task not found" }` |
| 500 | Database or server problem | `{ "error": "Internal Server Error" }` |

## The web page

The page in `public/` talks to the API and lets you:

- add a task
- tick a task as done (or undo it)
- delete a task
- filter by All, To do and Done

Express serves it with this line in `server.js`:

```js
app.use(express.static('public'));
```

Open it through the server (`http://localhost:3000`). Opening `index.html` by double-clicking will not work, because the page needs the server to reach the API.

## Testing checklist

| Test | Expected |
|---|---|
| `GET /tasks` | 200 and a list of tasks |
| `POST /tasks` with `{ "title": "My task" }` | 201 and the new task |
| `GET /tasks/9999` | 404 `Task not found` |
| `PATCH /tasks/1` with `{ "completed": true }` | 200, `completed` is true |
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
| Page shows JSON instead of the UI | Open `http://localhost:3000/index.html`, and check the `express.static` line is above the `/` route |
| Page looks unstyled | Hard refresh with Ctrl+F5 |

## Security notes

- Passwords live in `.env`, which is never committed.
- Every value from the client goes through a `?` placeholder, never string concatenation.
- Error stacks are logged on the server and never sent to the client.
