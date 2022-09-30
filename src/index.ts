import handler from "./handler";

export interface Env {
    B2URL: string;
    B2BUCKET: string;
    PATH_PREFIX: string;
    REDIRECT_URL: string;
}

export default {
    fetch: handler,
};
