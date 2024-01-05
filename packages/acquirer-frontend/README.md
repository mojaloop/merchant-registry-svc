## Getting Started

```bash
npm install
```

```bash
npm run dev
```

## Configuration

| Environment Variables     | Default Values                 | Description                                                                                |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `VITE_PORT`               | `5172`                         | Port number for the Vite development server.                                               |
| `VITE_HOST`               | `0.0.0.0`                      | Host IP address for the Vite development server.                                           |
| `VITE_API_URL`            | `http://localhost:5555/api/v1` | The base URL for the Backend Acquirer API, used by the Vite application for backend calls. |
| `VITE_RECAPTCHA_SITE_KEY` | `recaptcha-site-key`           | Frontend Site key for Google reCAPTCHA. (Change in production)                             |

## Development Notes

- `acquirer-frontend` uses an import sorting package to enforce consistency. You need to add the folder name in the `importOrder` array in the `.prettierc` file whenever you add a new folder under `src` folder to make it work.

- Always place CSS imports at the lowest to avoid a quirk of the import sorting algorithm. You can see the standard to follow in the `main.tsx`.
