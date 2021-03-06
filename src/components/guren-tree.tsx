import React, {useEffect, useState, useCallback} from "react";
import {createUseStyles} from "react-jss";

import {
    anchors,
    anchors6,
    get4WayDirection,
    get6WayDirection,
    arrayRotate,
    MenuAction,
    Position,
    Anchor,
    GurenTreeItemModelPlaceholder,
    GurenTreeItemModel,
    hex2rgba
} from "../util";
import {useDimensions, DimensionsObject} from "../use-dimensions";
import {useCountTo} from "../use-count-to";

import {GurenTreeItem} from "./guren-tree-item";
import {SvgStroke200} from "./drawing";

const addPositions = (a: Position, b: Position): Position => ({
    x: a.x + b.x,
    y: a.y + b.y
});

type GurenTreeStyles = {
    primaryColor: string;
    secondaryColor: string;
    modalBackdropColor: string;
};

const useStyles = createUseStyles({
    positioned: {
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    container: ({modalBackdropColor}: GurenTreeStyles) => ({
        composes: "$positioned",
        backgroundColor: modalBackdropColor,
        zIndex: "1000",
        width: "100%",
        height: "100%"
    }),
    originContainer: {
        position: "absolute",
        width: "100%",
        height: "100%"
    },
    circleContainer: {
        position: "absolute",
        width: "100%",
        height: "100%",
        zIndex: "1000"
    },
    originDot: ({primaryColor, secondaryColor}: GurenTreeStyles) => ({
        stroke: secondaryColor,
        fill: primaryColor,
        strokeWidth: "5",
        r: 8,
        "&:hover": {
            r: 15
        }
    }),
    originLine: ({secondaryColor}: GurenTreeStyles) => ({
        fill: hex2rgba(secondaryColor, 0.2),
        stroke: secondaryColor,
        strokeWidth: 4
    })
});

type GurenTreeProps = {
    origin: Position;
    centerAction: MenuAction;
    actions: MenuAction[];
    classNames?: string[];
    styles: GurenTreeStyles;
    onClose: () => void;
};

export const GurenTree = (props: GurenTreeProps) => (
    <GurenTreeContainer {...props} />
);

const GurenTreeContainer = (props: GurenTreeProps) => {
    const classes = useStyles(props.styles);
    const [containerRef, containerRect] = useDimensions();
    const center =
        "width" in containerRect
            ? {
                x: containerRect.width / 2,
                y: containerRect.height / 2
            }
            : undefined;

    return (
        <div ref={containerRef} className={classes.container}>
            {"width" in containerRect && center && (
                <GurenTreeLayer
                    center={center}
                    containerRect={containerRect}
                    {...props}
                />
            )}
        </div>
    );
};

type GurenTreeLayerProps = GurenTreeProps & {
    center: Position;
    containerRect: DimensionsObject;
};

type ClickOrigin = {type: "ClickOrigin"; pos: Position; centerAnchor: Anchor};
type CenterItemNodes = {
    [key in Anchor]:
    | GurenTreeItemModelPlaceholder
    | GurenTreeItemModel
    | ClickOrigin
    | void;
};

const centerItemNodesAppendClickOriginNode = ({
    centerItemNodes,
    containerCenter,
    originPos
}: {
    centerItemNodes: CenterItemNodes;
    containerCenter: Position;
    originPos: Position;
}) => {
    const originToRootAnchor: Anchor | void = get4WayDirection(
        containerCenter,
        originPos
    );
    if (originToRootAnchor) {
        const clickOrigin: ClickOrigin = {
            type: "ClickOrigin",
            pos: originPos,
            centerAnchor: originToRootAnchor
        };
        return {
            ...centerItemNodes,
            [originToRootAnchor]: clickOrigin
        };
    }
    return centerItemNodes;
};

// Asserts that input is truthy, throwing immediately if not:
function assert(input: any, message?: string): asserts input {
    // <-- not a typo
    if (!input) throw new Error(message || "Not a truthy value");
}

const getClickOriginAnchor = ({
    itemNodes
}: {
    itemNodes: CenterItemNodes;
}): Anchor | void => {
    const clickOriginData: [Anchor, ClickOrigin] | void = Object.entries(
        itemNodes
    ).find<[Anchor, ClickOrigin]>(
        (
            value: [
                Anchor,
                (
                    | ClickOrigin
                    | GurenTreeItemModelPlaceholder
                    | GurenTreeItemModel
                    | void
                )
            ]
        ): value is [Anchor, ClickOrigin] =>
            !!value[1] && value[1].type === "ClickOrigin"
    );
    return clickOriginData ? clickOriginData[0] : undefined;
};

const centerItemNodesAppendChildItems = ({
    centerItemNodes,
    childItems,
    centerPosition,
    activeAnchors
}: {
    centerItemNodes: CenterItemNodes;
    childItems: Array<MenuAction>;
    centerPosition: Position;
    activeAnchors: Array<Anchor>;
}) => {
    const clickOriginData: Anchor | void = getClickOriginAnchor({
        itemNodes: centerItemNodes
    });

    let centerItemFreeAnchors = [...activeAnchors];
    if (clickOriginData) {
        // If a click origin exists, make sure to start adding the items from
        // the first free anchor behind the centerItems anchor linking to the
        // `clickOrigin`.
        let clickOriginIndex = centerItemFreeAnchors.indexOf(clickOriginData);
        assert(
            clickOriginIndex > -1,
            "Could not find clickOrigin for some reason"
        );

        centerItemFreeAnchors = arrayRotate(
            [
                ...centerItemFreeAnchors.slice(0, clickOriginIndex),
                ...centerItemFreeAnchors.slice(clickOriginIndex + 1)
            ],
            clickOriginIndex
        );
    }

    const newCenterItemNodes = {...centerItemNodes};
    childItems.forEach((childItem: MenuAction, index) => {
        if (centerItemFreeAnchors.length <= index) {
            return;
        }
        const anchorToChildItem = centerItemFreeAnchors[index];

        const childItemPosition = moveTreeChildRelativeToParent({
            anchorParentToChild: anchorToChildItem,
            parentPosition: centerPosition
        });
        newCenterItemNodes[anchorToChildItem] = {
            type: "GurenTreeItemModelPlaceholder",
            menuAction: childItem,
            origin: childItemPosition
        };
    });

    return newCenterItemNodes;
};

const generateEmptyCenterItemNodes = (): CenterItemNodes =>
    anchors.reduce(
        (obj, curr) => ({...obj, [curr]: undefined}),
        {}
    ) as CenterItemNodes;

export const GurenTreeLayer = ({
    origin,
    centerAction,
    actions,
    // classNames,
    onClose,
    styles,

    center
}: GurenTreeLayerProps) => {
    const activeAnchors = [...anchors6];
    const [centerItemModel, setCenterItemModel] = useState<
        GurenTreeItemModel | GurenTreeItemModelPlaceholder
    >({
        type: "GurenTreeItemModelPlaceholder",
        menuAction: centerAction,
        origin
    });
    const [centerItemNodes, setCenterItemNodes] = useState<CenterItemNodes>(
        generateEmptyCenterItemNodes()
    );
    const [clickOriginAnchor, setClickOriginAnchor] = useState<Anchor>(
        activeAnchors[0]
    );

    useEffect(() => {
        /// Triggers complete rerendering & recalculation of items & positions
        let newCenterItemNodes: CenterItemNodes = generateEmptyCenterItemNodes();
        newCenterItemNodes = centerItemNodesAppendClickOriginNode({
            centerItemNodes: newCenterItemNodes,
            containerCenter: center,
            originPos: origin
        });
        setClickOriginAnchor(
            getClickOriginAnchor({
                itemNodes: newCenterItemNodes
            }) || activeAnchors[0]
        );

        newCenterItemNodes = centerItemNodesAppendChildItems({
            activeAnchors,
            centerItemNodes: newCenterItemNodes,
            childItems: actions,
            centerPosition: center
        });
        setCenterItemNodes(() => newCenterItemNodes);
    }, []);

    const updateChildItemModel = useCallback(
        (centerItemAnchor: Anchor) => (model: GurenTreeItemModel) => {
            setCenterItemNodes(nodes => ({
                ...nodes,
                [centerItemAnchor]: model
            }));
        },
        [setCenterItemNodes, centerItemNodes]
    );

    const onItemSelect = useCallback(
        (anchor: Anchor, event: any) => {
            const item:
                | GurenTreeItemModelPlaceholder
                | GurenTreeItemModel
                | ClickOrigin
                | void = centerItemNodes[anchor];
            if (!item) {
                // User selected non-existing item (?)
                console.warn(`Non-existing item of anchor ${anchor} selected.`);
            } else if ("menuAction" in item) {
                if (item.menuAction.onSelect) {
                    item.menuAction.onSelect(event, {onCloseMenu: onClose});
                }
            } else if (item.type === "ClickOrigin") {
                // user selected the anchor that is connected to the back-circle
                onClose();
                return;
            }
        },
        [centerItemNodes, onClose]
    );
    useTreeShortcuts({
        onDirectionSelect: onItemSelect,
        onCenterItemSelect: centerAction.onSelect,
        onClose
    });

    const [show, setShow] = useState(false);
    useEffect(() => {
        // Makes it so that it renders again, this time starting animations
        setShow(true);
    });

    const sortedAnchors = arrayRotate(
        [...activeAnchors],
        (activeAnchors as Anchor[]).indexOf(clickOriginAnchor)
    );

    const itemAnimationDelay = 75;
    const itemAnimCounter = useCountTo({
        max: actions.length + 1,
        delay: show && (!origin || clickOriginAnchor) ? itemAnimationDelay : null
    });
    useEffect(() => {
        // Offset anim counter so that it has time to create the
        // `clickOriginAnchor` before animating items in.
        const activationAnchor = sortedAnchors[itemAnimCounter - 1];
        if (activationAnchor) {
            setCenterItemNodes((nodes: CenterItemNodes) => {
                return {
                    ...nodes,
                    [activationAnchor]: {
                        ...nodes[activationAnchor],
                        visible: true
                    }
                };
            });
        }
    }, [itemAnimCounter]);

    return (
        <>
            {centerItemModel.type === "GurenTreeItemModel" && (
                <GurenTreeLayerItemConnect
                    centerItem={centerItemModel}
                    centerItemNodes={centerItemNodes}
                    styles={styles}
                    onClose={onClose}
                />
            )}
            <GurenTreeItem
                visible
                styles={{secondaryColor: styles.secondaryColor}}
                activeCorners={{
                    topLeft: true,
                    topRight: true,
                    bottomLeft: true,
                    bottomRight: true
                }}
                origin={center}
                menuAction={centerItemModel.menuAction}
                onClick={event =>
                    centerAction.onSelect &&
                    centerAction.onSelect(event, {onCloseMenu: onClose})
                }
                onUpdateDimensions={setCenterItemModel}
            >
                {centerAction.node}
            </GurenTreeItem>
            {sortedAnchors
                .map((anchor: Anchor): [
                    Anchor,
                    (
                        | void
                        | GurenTreeItemModelPlaceholder
                        | GurenTreeItemModel
                        | ClickOrigin
                    )
                ] => [anchor, centerItemNodes[anchor]])
                .filter((value): value is [
                    Anchor,
                    GurenTreeItemModel | GurenTreeItemModelPlaceholder
                ] => {
                    const [, item] = value;
                    return (
                        !!item &&
                        (item.type === "GurenTreeItemModel" ||
                            item.type === "GurenTreeItemModelPlaceholder")
                    );
                })
                .map(([anchor, item]) => {
                    return (
                        <GurenTreeItem
                            key={anchor}
                            styles={{
                                secondaryColor: styles.secondaryColor
                            }}
                            activeCorners={{
                                topLeft: true,
                                topRight: true,
                                bottomLeft: true,
                                bottomRight: true
                            }}
                            origin={item.origin}
                            menuAction={item.menuAction}
                            visible={"visible" in item && item.visible}
                            onClick={event =>
                                item.menuAction.onSelect &&
                                item.menuAction.onSelect(event, {
                                    onCloseMenu: onClose
                                })
                            }
                            onUpdateDimensions={updateChildItemModel(anchor)}
                        >
                            {item.menuAction.node}
                        </GurenTreeItem>
                    );
                })}
        </>
    );
};

type GurenTreeLayerItemConnectProps = {
    clickOrigin?: Position;
    centerItem: GurenTreeItemModel;
    centerItemNodes: CenterItemNodes;
    styles: GurenTreeStyles;
    onClose: () => void;
};

const GurenTreeLayerItemConnect = ({
    clickOrigin,
    centerItem,
    centerItemNodes,
    styles,
    onClose
}: GurenTreeLayerItemConnectProps) => {
    const classes = useStyles(styles);

    const centerItemToClickOriginAnchor =
        clickOrigin && get4WayDirection(centerItem.origin, clickOrigin);

    return (
        <svg className={classes.originContainer} onClick={onClose}>
            {Object.entries(centerItemNodes).map(([anchor, value]) => {
                if (value === undefined) {
                    return null;
                }
                switch (value.type) {
                    case "ClickOrigin":
                        const clickOrigin = value;
                        return (
                            <>
                                <SvgStroke200
                                    stops={[
                                        clickOrigin.pos,
                                        addPositions(
                                            centerItem.origin,
                                            centerItem.anchors[anchor].pos
                                        )
                                    ]}
                                    color={styles.secondaryColor}
                                />
                                <circle
                                    r={8}
                                    className={classes.originDot}
                                    cx={clickOrigin.pos.x}
                                    cy={clickOrigin.pos.y}
                                />
                            </>
                        );
                    case "GurenTreeItemModel":
                        const treeItem = value;
                        if (!treeItem.visible) {
                            return null;
                        }
                        const anchorToCenterDir = get6WayDirection(
                            treeItem.origin,
                            centerItem.origin
                        );
                        const fromPos = addPositions(
                            treeItem.origin,
                            treeItem.anchors[anchorToCenterDir].pos
                        );
                        const toPos = addPositions(
                            centerItem.origin,
                            centerItem.anchors[anchor].pos
                        );
                        return (
                            <SvgStroke200
                                key={anchor}
                                stops={[fromPos, toPos]}
                                color={styles.secondaryColor}
                            />
                        );
                    case "GurenTreeItemModelPlaceholder":
                        return null;
                }
            })}
            {centerItemToClickOriginAnchor !== undefined &&
                clickOrigin !== undefined && (
                    <SvgStroke200
                        stops={[
                            clickOrigin,
                            addPositions(
                                addPositions(
                                    centerItem.origin,
                                    centerItem.anchors[
                                        centerItemToClickOriginAnchor
                                    ].pos
                                ),
                                {x: -window.scrollX, y: 0}
                            )
                        ]}
                        color={styles.secondaryColor}
                    />
                )}
        </svg>
    );
};

const moveTreeChildRelativeToParent = ({
    anchorParentToChild,
    parentPosition
}: {
    anchorParentToChild: Anchor;
    parentPosition: Position;
}) => {
    switch (anchorParentToChild) {
        case "topLeft":
            return {
                x: parentPosition.x - 300,
                y: parentPosition.y - 100
            };
        case "top":
            return {
                x: parentPosition.x,
                y: parentPosition.y - 200
            };
        case "topRight":
            return {
                x: parentPosition.x + 300,
                y: parentPosition.y - 100
            };
        case "right":
            return {
                x: parentPosition.x + 350,
                y: parentPosition.y
            };
        case "bottomRight":
            return {
                x: parentPosition.x + 300,
                y: parentPosition.y + 100
            };
        case "bottom":
            return {
                x: parentPosition.x,
                y: parentPosition.y + 200
            };
        case "bottomLeft":
            return {
                x: parentPosition.x - 300,
                y: parentPosition.y + 100
            };
        case "left":
            return {
                x: parentPosition.x - 350,
                y: parentPosition.y
            };
        default:
            return {
                x: parentPosition.x,
                y: parentPosition.y
            };
    }
};

const useTreeShortcuts = ({
    onDirectionSelect,
    onCenterItemSelect,
    onClose
}: {
    onDirectionSelect: (anchor: Anchor, event: any) => void;
    onCenterItemSelect?: (
        event: any,
        options: {
            onCloseMenu: () => void;
        }
    ) => void;
    onClose: () => void;
}) => {
    const handleKeypress = useCallback(
        event => {
            let anchor: Anchor | void = undefined;

            switch (event.key) {
                case "r":
                    onClose();
                    break;
                case "s":
                    onCenterItemSelect
                        ? onCenterItemSelect(event, {
                            onCloseMenu: onClose
                        })
                        : onClose();
                    break;
                case "q":
                    anchor = "topLeft";
                    break;
                case "w":
                    anchor = "top";
                    break;
                case "e":
                    anchor = "topRight";
                    break;
                case "d":
                    anchor = "right";
                    break;
                case "c":
                    anchor = "bottomRight";
                    break;
                case "x":
                    anchor = "bottom";
                    break;
                case "z":
                    anchor = "bottomLeft";
                    break;
                case "a":
                    anchor = "left";
                    break;
            }

            anchor && onDirectionSelect(anchor, event);
        },
        [onClose, onDirectionSelect]
    );

    useEffect(() => {
        window.addEventListener("keypress", handleKeypress);
        return () => {
            window.removeEventListener("keypress", handleKeypress);
        };
    }, [handleKeypress]);
};
