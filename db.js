const { Client } = require('pg');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const port = process.env.PORT || 3000;

const client = new Client({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database_name',
  password: 'your_password',
  port: 5432, // The default PostgreSQL port is 5432
});

// Connect to the PostgreSQL database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database:', err);
  });

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url);
  const queryParams = querystring.parse(reqUrl.query);

  switch (req.method) {
    case 'GET':
      if (reqUrl.pathname === '/tasks') {
        // Read all tasks
        client.query('SELECT * FROM tasks', (err, result) => {
          if (err) {
            console.error('Error retrieving tasks:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error retrieving tasks' }));
          } else {
            const tasks = result.rows;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tasks));
          }
        });
      } else if (reqUrl.pathname.startsWith('/tasks/') && queryParams.id) {
        // Read a specific task by ID
        const taskId = parseInt(queryParams.id);
        client.query('SELECT * FROM tasks WHERE id = $1', [taskId], (err, result) => {
          if (err) {
            console.error('Error retrieving task:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error retrieving task' }));
          } else {
            const task = result.rows[0];
            if (!task) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Task not found' }));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(task));
            }
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      break;
    case 'POST':
      if (reqUrl.pathname === '/tasks') {
        // Create a new task
        let requestBody = '';
        req.on('data', (data) => {
          requestBody += data;
        });
        req.on('end', () => {
          const newTask = JSON.parse(requestBody);
          client.query('INSERT INTO tasks (description, done) VALUES ($1, $2) RETURNING *', [newTask.description, newTask.done], (err, result) => {
            if (err) {
              console.error('Error creating task:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Error creating task' }));
            } else {
              const createdTask = result.rows[0];
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(createdTask));
            }
          });
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      break;
    case 'PUT':
      if (reqUrl.pathname.startsWith('/tasks/') && queryParams.id) {
        // Update a task by ID
        const taskId = parseInt(queryParams.id);
        let requestBody = '';
        req.on('data', (data) => {
          requestBody += data;
        });
        req.on('end', () => {
          const updatedTask = JSON.parse(requestBody);
          client.query('UPDATE tasks SET description = $1, done = $2 WHERE id = $3 RETURNING *', [updatedTask.description, updatedTask.done, taskId], (err, result) => {
            if (err) {
              console.error('Error updating task:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Error updating task' }));
            } else {
              const updatedTask = result.rows[0];
              if (!updatedTask) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Task not found' }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedTask));
              }
            }
          });
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      break;
    case 'DELETE':
      if (reqUrl.pathname.startsWith('/tasks/') && queryParams.id) {
        // Delete a task by ID
        const taskId = parseInt(queryParams.id);
        client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId], (err, result) => {
          if (err) {
            console.error('Error deleting task:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error deleting task' }));
          } else {
            const deletedTask = result.rows[0];
            if (!deletedTask) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Task not found' }));
            } else {
              res.writeHead(204);
              res.end();
            }
          }
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      break;
    default:
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
