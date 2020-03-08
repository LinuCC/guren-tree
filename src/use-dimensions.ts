import { useState, useCallback, useLayoutEffect } from "react";

// https://github.com/Microsoft/TypeScript/issues/28502
declare const ResizeObserver: any;

export type DimensionsObject = {
    width: number;
    height: number;
    top: number;
    left: number;
    x: number;
    y: number;
    right: number;
    bottom: number;
};

function getDimensionObject(node: HTMLElement): DimensionsObject {
    const rect: any = node.getBoundingClientRect();

    return {
        width: rect.width,
        height: rect.height,
        top: "x" in rect ? rect.x : rect.top,
        left: "y" in rect ? rect.y : rect.left,
        x: "x" in rect ? rect.x : rect.left,
        y: "y" in rect ? rect.y : rect.top,
        right: rect.right,
        bottom: rect.bottom
    };
}

export function useDimensions({
    liveMeasure = true,
    scrollNode = window
} = {}): [React.Ref<any>, DimensionsObject | {}, HTMLElement | null] {
    const [dimensions, setDimensions] = useState<DimensionsObject | {}>({});
    const [node, setNode] = useState<HTMLElement | null>(null);

    const ref = useCallback(node => {
        setNode(node);
    }, []);

    useLayoutEffect((): (() => void) | void => {
        if (node && scrollNode) {
            console.info(scrollNode);
            const measure = () => {
                console.info("MEASURING");
                window.requestAnimationFrame(() =>
                    setDimensions(getDimensionObject(node))
                );
            };
            measure();

            if (liveMeasure) {
                scrollNode.addEventListener("resize", measure);
                scrollNode.addEventListener("scroll", measure);
                const resizeObserver = new ResizeObserver(measure);
                resizeObserver.observe(node);

                return () => {
                    resizeObserver.unobserve(node);
                    scrollNode.removeEventListener("resize", measure);
                    scrollNode.removeEventListener("scroll", measure);
                };
            }
        }
    }, [node, scrollNode]);

    return [ref, dimensions, node];
}
