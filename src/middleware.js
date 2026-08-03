import { paraglideMiddleware } from "./paraglide/server.js";

export const onRequest = (context, next) => {
    if (context.isPrerendered) {
        return next();
    }

    return paraglideMiddleware(context.request, () => next());
};
