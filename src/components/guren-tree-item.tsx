import React, { useRef, useEffect } from "react";
import { createUseStyles } from "react-jss";

import { MenuAction, Position, hex2rgba, GurenTreeItemModel } from "../util";
import { useDimensions } from "../use-dimensions";
import { SvgStroke200 } from "./drawing";

const CORNER_SIZE = 30;

type GurenTreeItemStyles = {
    secondaryColor: string;
};

const useGurenTreeItemStyles = createUseStyles({
    positioned: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    container: ({ secondaryColor }: GurenTreeItemStyles) => ({
        cursor: "pointer",
        position: "absolute",
        minHeight: CORNER_SIZE * 2,
        minWidth: 200,
        "&:hover, &:focus": {
            outline: "none",
            "& $borderPath": {
                fill: hex2rgba(secondaryColor, 0.8)
            }
        }
    }),
    borderContainer: {
        position: "relative"
    },
    border: {
        position: "absolute",
        width: "100%",
        height: "100%",
        transition: "opacity 0.1s",
        opacity: 1
    },
    borderPath: ({ secondaryColor }: GurenTreeItemStyles) => ({
        stroke: secondaryColor,
        strokeWidth: 4,
        fill: hex2rgba(secondaryColor, 0.75),
        width: "100%",
        height: "100%"
        // minHeight: CORNER_SIZE * 2,
        // minWidth: 200
    }),
    contentContainer: {
        display: "flex",
        width: "100%",
        height: "100%"
    },
    content: {
        zIndex: 1,
        padding: [10, 20],
        width: "100%",
        // For some reason he doesn't like the `height: 100%`
        minHeight: CORNER_SIZE * 2 - 10 * 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
});

type GurenTreeItemProps = {
    origin: Position;
    children: React.ReactNode;
    activeCorners: {
        topLeft: boolean;
        topRight: boolean;
        bottomLeft: boolean;
        bottomRight: boolean;
    };
    // classNames?: string;
    styles: GurenTreeItemStyles;
    menuAction: MenuAction;
    onClick?: (event: any) => void;
    onUpdateDimensions: (dimensions: GurenTreeItemModel) => void;
};

export const GurenTreeItem = ({
    origin, // center of where this component should be rendered
    children,
    activeCorners,
    // classNames,
    styles,
    menuAction,
    onClick,
    onUpdateDimensions
}: GurenTreeItemProps) => {
    const [ref, rect] = useDimensions();

    // If I set values to 0, it removes half of the stroke because it renders
    // some of it outside the boundary (for example a 4px wide stroke would
    // render 2px outside the boundary), so I need to account for that.
    const halfBorderPathStrokeWidth = 4 / 2;

    const realCornerSize = CORNER_SIZE + halfBorderPathStrokeWidth;

    const classes = useGurenTreeItemStyles(styles);

    const onUpdateDimensionsRef = useRef(onUpdateDimensions);
    onUpdateDimensionsRef.current = onUpdateDimensions;

    useEffect(() => {
        if ("width" in rect) {
            const halfWidth = rect.width / 2;
            const halfHeight = rect.height / 2;
            onUpdateDimensionsRef.current &&
                onUpdateDimensionsRef.current({
                    type: "GurenTreeItemModel",
                    rect,
                    origin,
                    menuAction,
                    anchors: {
                        topLeft: {
                            active: false,
                            pos: {
                                x: realCornerSize / 2 - halfWidth,
                                y: realCornerSize / 2 - halfHeight
                            }
                        },
                        top: {
                            active: false,
                            pos: {
                                x: 0,
                                y: -halfHeight
                            }
                        },
                        topRight: {
                            active: false,
                            pos: {
                                x: halfWidth - realCornerSize / 2,
                                y: realCornerSize / 2 - halfHeight
                            }
                        },
                        right: {
                            active: false,
                            pos: {
                                x: halfWidth,
                                y: 0
                            }
                        },
                        bottomRight: {
                            active: false,
                            pos: {
                                x: halfWidth - realCornerSize / 2,
                                y: halfHeight - realCornerSize / 2
                            }
                        },
                        bottom: {
                            active: false,
                            pos: {
                                x: 0,
                                y: halfHeight
                            }
                        },
                        bottomLeft: {
                            active: false,
                            pos: {
                                x: realCornerSize / 2 - halfWidth,
                                y: halfHeight - realCornerSize / 2
                            }
                        },
                        left: {
                            active: false,
                            pos: {
                                x: -halfWidth,
                                y: 0
                            }
                        }
                    }
                });
        }
    }, [rect, realCornerSize]);

    const borderPaths =
        rect && "width" in rect && "height" in rect
            ? [
                  activeCorners.topLeft
                      ? { x: halfBorderPathStrokeWidth, y: CORNER_SIZE }
                      : {
                            x: halfBorderPathStrokeWidth,
                            y: halfBorderPathStrokeWidth
                        },
                  { x: CORNER_SIZE, y: halfBorderPathStrokeWidth },
                  activeCorners.topRight
                      ? {
                            x: rect.width - CORNER_SIZE,
                            y: halfBorderPathStrokeWidth
                        }
                      : {
                            x: rect.width - halfBorderPathStrokeWidth,
                            y: halfBorderPathStrokeWidth
                        },
                  { x: rect.width - halfBorderPathStrokeWidth, y: CORNER_SIZE },
                  activeCorners.bottomRight
                      ? {
                            x: rect.width - halfBorderPathStrokeWidth,
                            y: rect.height - CORNER_SIZE
                        }
                      : {
                            x: rect.width - halfBorderPathStrokeWidth,
                            y: rect.height - halfBorderPathStrokeWidth
                        },
                  {
                      x: rect.width - CORNER_SIZE,
                      y: rect.height - halfBorderPathStrokeWidth
                  },
                  activeCorners.bottomLeft
                      ? {
                            x: CORNER_SIZE,
                            y: rect.height - halfBorderPathStrokeWidth
                        }
                      : {
                            x: halfBorderPathStrokeWidth,
                            y: rect.height - halfBorderPathStrokeWidth
                        },
                  { x: halfBorderPathStrokeWidth, y: rect.height - CORNER_SIZE }
              ]
            : null;

    console.warn("Rerender item");
    return (
        <div
            ref={ref}
            className={classes.container}
            style={
                "width" in rect && "height" in rect
                    ? {
                          left: origin.x - rect.width / 2,
                          top: origin.y - rect.height / 2
                      }
                    : { left: 0, top: 0, visibility: "hidden" }
            }
            tabIndex={1}
            onClick={onClick}
        >
            <div className="borderContainer">
                <svg
                    preserveAspectRatio="none"
                    className={classes.border}
                    style={!borderPaths ? { opacity: 0 } : undefined}
                >
                    {borderPaths && (
                        <SvgStroke200
                            stops={borderPaths}
                            color={styles.secondaryColor}
                            closing
                        />
                    )}
                </svg>
            </div>
            <div className={classes.contentContainer}>
                <div className={classes.content}>
                    {typeof children === "function"
                        ? children({ anim: { entered: true } })
                        : children}
                </div>
            </div>
        </div>
    );
};
