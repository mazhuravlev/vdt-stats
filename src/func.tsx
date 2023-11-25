export const handleResponse = (res: Response): Response => {
    if (res.status !== 200) throw res.status;
    return res;
};

export const sum = (a: number, b: number) => a + b

export const findLongestStreak = (days: number[]): number => {
    const x = days.slice().sort().reduce((a, c) => {
        const streak = a.prev + 1 === c;
        if (streak) {
            a.streaks[a.streaks.length - 1]++
        } else if (a.streaks[a.streaks.length - 1] != 0) {
            a.streaks.push(1)
        }
        a.prev = c
        return a
    }, { prev: 0, streaks: [1], streak: false })

    return Math.max(...x.streaks)
}

export function assertDefined<T>(t: T | undefined | null, message?: any): T {
    if (t === undefined || t === null) throw `assertDefined ${message}`
    return t
}

export const assertString = (value: unknown): string => {
    if (typeof value === 'string') return value
    throw `assertString ${value}`
}

export function assertTrue(value: boolean) {
    if (!value) throw 'assertTrue'
}

export const parseTrackName = (trackName: string): { map: string, track: string } => {
    const parts = trackName.split('/').map(x => x.trim())
    if (parts.length === 2) {
        return { map: parts[0], track: parts[1] }
    }
    throw `parseTrackName '${trackName}'`
}