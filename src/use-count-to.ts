import { useInterval } from "./use-interval";
import { useState, useEffect } from "react";

export const useCountTo = ({
    max,
    delay
}: {
    max: number;
    delay: number | null;
}): number => {
    const [count, setCount] = useState(0);
    const [delayStatus, setDelayStatus] = useState<number | null>(delay);
    useEffect(() => {
        setDelayStatus(delay);
    }, [delay]);
    useInterval(() => {
        if (count < max) {
            setCount(count + 1);
        }
        if (count >= max) {
            // Stop the timer
            setDelayStatus(null);
        }
    }, delayStatus);
    return count;
};
