import { Delete, Get, Post } from "../router/createControllerFactory";
import { ControllerFactory } from "../router/PeerApplication";

export const UserControllerFactory = (factory: ControllerFactory) => factory(
  Post("user", () => {}),
  Get("users", (req, res, next) => {
    res.payload.data = "data 1";
    console.log("Gets 1");
    next();
  }),
  Get("user", (req, res, next) => {
    console.log("Get 2", res.payload.data);
  }),
  Delete("user", () => {
    console.log("Delete 1");
  }),
  Get("user/:id", () => {})
);
