export default async (response: Response) => {
    const json = (await response.json()) as Record<string, any>;
    return json.status;
};
