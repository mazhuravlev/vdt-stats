import React from "react";
import { Subject, debounceTime } from "rxjs";

export function useDebounce<T>(time: number, defaultValue: T): [T, (v: T) => void] {
    const [value, setValue] = React.useState(defaultValue);
    const [value$] = React.useState(() => new Subject<T>());
    React.useEffect(() => {
        const sub = value$.pipe(debounceTime(time)).subscribe(setValue);
        return () => sub.unsubscribe();
    }, [time, value$]);
    return [value, (v) => value$.next(v)];
}