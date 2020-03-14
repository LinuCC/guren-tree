import React from "react";
import { createUseStyles } from "react-jss";

import { Position, hex2rgba } from "../util";

type SvgStroke200Styles = { color: string };

type SvgStroke200Props = {
    stops: Position[];
    closing?: boolean;
    className?: string;
} & SvgStroke200Styles;

const useSvgStroke200Styles = createUseStyles({
    strokeLine: ({ color }: SvgStroke200Styles) => ({
        fill: hex2rgba(color, 0.2),
        stroke: color,
        strokeWidth: 4
    })
});

export const SvgStroke200 = ({
    stops,
    closing = false,
    color,
    className
}: SvgStroke200Props) => {
    const classes = useSvgStroke200Styles({ color });
    return (
        <path
            vectorEffect="non-scaling-stroke"
            className={`${classes.strokeLine} ${className ? className : ""}`}
            d={[
                ...stops.map(({ x, y }, i) =>
                    i === 0 ? `m ${x} ${y}` : `L ${x} ${y}`
                ),
                ...(closing ? ["Z"] : [])
            ].join(" ")}
            fill="none"
        />
    );
};
