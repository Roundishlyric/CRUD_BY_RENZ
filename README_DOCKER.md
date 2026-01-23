# Run with Docker Compose

## 1) Start everything

From this folder:

```bash
docker compose up --build
```

## 2) Open the app

- Client: http://localhost:3000
- Server: http://localhost:8000
- MongoDB: mongodb://localhost:27017

## Notes
- The server is configured to connect to MongoDB via the compose service name `mongo`.
- Your client code uses `http://localhost:8000` as the API base, which is correct when you open the app in your browser.
- If you get file-watcher issues on Windows, the polling env vars are already enabled.

## Stop

```bash
docker compose down
```
