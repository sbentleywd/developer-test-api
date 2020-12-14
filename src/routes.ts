import { Application } from "express";
import testRoutes from "./routes/test.routes";
import liveRoutes from "./routes/live.routes";

export default (app: Application): void => {
	testRoutes(app);
	liveRoutes(app);
};
