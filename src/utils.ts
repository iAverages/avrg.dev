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

export const retry = <T>(
	tries: number,
	wait: number,
	fn: () => Promise<T>,
	signal?: AbortSignal,
): Promise<T> => {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new Error("Aborted"));
			return;
		}

		fn()
			.then(resolve)
			.catch((error: Error) => {
				if (tries === 1) {
					reject(error);
					return;
				}

				let timeout: number | null = null;

				const onAbort = () => {
					clearTimeout(timeout);
					reject(new Error("Aborted"));
				};

				if (signal) signal.addEventListener("abort", onAbort, { once: true });

				timeout = setTimeout(() => {
					if (signal) signal.removeEventListener("abort", onAbort);
					retry(tries - 1, wait, fn, signal).then(resolve, reject);
				}, wait);
			});
	});
};
