import { paraglideMiddleware } from "./paraglide/server.js";

export const onRequest = (context, next) => {
    return paraglideMiddleware(context.request, ({ request }) => next(request));
};
