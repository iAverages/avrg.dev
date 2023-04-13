export const formatHeaders = (headers: Headers, cacheTime?: number) => {
    const newHeaders: Record<string, string> = {};
    headers.forEach((v, k) => {
        if (!k.match(/^x-bz/i)) {
            newHeaders[k] = v;
        }
    });
    if (cacheTime) newHeaders["cache-control"] = `public, max-age=${cacheTime}`;

    return newHeaders;
};
