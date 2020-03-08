import { useEffect, useRef } from "react";

export const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef<() => void | undefined>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect((): (() => void) | void => {
        function tick() {
            if (savedCallback.current !== undefined) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};
