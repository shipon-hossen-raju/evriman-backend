import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { LevelRoutes } from "../modules/Level/Level.routes";


const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/level",
    route: LevelRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
