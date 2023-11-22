export const handleResponse = (res: Response): Response => {
    if (res.status !== 200) throw res.status;
    return res;
};

export const sum = (a: number, b: number) => a + b
