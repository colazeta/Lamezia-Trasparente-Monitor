import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// L'API è servita dietro il proxy di Replit (e dal proxy del sito), quindi
// `req.ip` deve essere risolto dall'header X-Forwarded-For per identificare la
// sorgente reale delle richieste (usato dalla protezione anti-abuso della
// rilevanza).
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(
  (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    req.log?.error({ err }, "Unhandled request error");
    if (res.headersSent) {
      return;
    }
    res.status(500).json({ error: "Errore interno del server" });
  },
);

export default app;
