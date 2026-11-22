import { NODE_ENV } from "../config/config.js";

function globalErrMiddleware(err, req, res, next) {
  console.log({ err });

  NODE_ENV === "DEV"
    ? res
        .status(err.cause?.statusCode || 400)
        .json({ errMsg: err.message, errStack: err.stack, extra: err.cause })
    : res
        .status(err.cause?.statusCode || 400)
        .json({ errMsg: err.message, extra: err.cause });
}

export default globalErrMiddleware;
