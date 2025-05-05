# TuneUp Web Client (Angular)

A modern, TypeScript‐based front‑end for TuneUp, built with Angular. Implements responsive UIs for interacting with TuneUp server APIs.

---

##  Prerequisites

* **Node.js 18+** (includes npm)
* **Angular CLI** (`npm install -g @angular/cli`)
* **Docker & Docker Compose** *(optional)*
* Back‑end Service: Ensure the TuneUp back‑end is running (see tuneupServer/README.md https://github.com/andrewMorrison20/tuneupServer).

---

##  Configuration & Conventions

* **Environment files** live under `src/environments/`:

  * `environment.ts` (development)
  * `environment.prod.ts` (production)
* **API Base URL** is configured in environments:

  ```ts
  // src/environments/environment.ts
  export const environment = {
    production: false,
    apiBaseUrl: 'http://localhost:8080'
  };
  ```

---

##  Running Locally (without Docker)

1. **Install dependencies**

   ```bash
   npm ci
   ```
2. **Start the development server**

   ```bash
   ng serve --open
   ```
3. The app will launch at `http://localhost:4200` with live reload enabled.

---

##  Running Locally (with Docker)

A Dockerfile is provided for production‑style builds and Nginx serving.

1. **Build & run**

   ```bash
   docker build -t tuneup-frontend:dev .
   docker run -d \
     -p 4200:80 \
     --name tuneup-web-client \
     tuneup-frontend:dev
    ```
   or pull the latest image from the docker registry.
   ```
   docker pull andrewm95/tuneupwebclient:latest
   docker run -d \
   -p 4200:80 \
   --name tuneup-web-client \
   andrewm95/tuneupwebclient:latest
   ```
   In powershell
    ```
    docker build -t tuneup-frontend-dev .
    docker run -d `
     -p 4200:4200 `
    --name tuneup-frontend-dev `
    tuneup-frontend-dev
    ```
     ```
    docker pull andrewm95/tuneupwebclient:latest
    docker run -d `
    -p 4200:4200 `
    --name tuneup-web-client `
    andrewm95/tuneupwebclient:latest
    ```
2. Visit `http://localhost:4200` to browse the containerized app.

---

##  Building for Production

```bash
npm run build -- --configuration=production
```

* Output appears in `dist/<your-app-name>/`
* You can then serve the contents of that folder with any static web server (e.g. Nginx).

---

##  Security Considerations

* **CORS**: Ensure the back‑end API allows requests from your front‑end origin.
* **Environment secrets**: Do **not** commit sensitive keys or URLs in code; use CI/CD environment variables for production builds.

---

##  Further Reading

* [Angular Documentation](https://angular.io/docs)
* [Dockerizing Angular Apps](https://docs.docker.com/samples/angular/)


---

##  Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit your changes & push (`git push origin feature/xyz`)
4. Open a Pull Request and request review from the front‑end team


