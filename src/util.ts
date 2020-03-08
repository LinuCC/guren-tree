import { DimensionsObject } from "./use-dimensions";

export const anchors = [
    "topLeft",
    "top",
    "topRight",
    "right",
    "bottomRight",
    "bottom",
    "bottomLeft",
    "left"
] as const;

export const anchors6 = [
    "topLeft",
    "top",
    "topRight",
    "bottomRight",
    "bottom",
    "bottomLeft"
] as const;

export type Anchor = typeof anchors[number];
export type Position = { x: number; y: number };
export type MenuAction = {
    node: React.ReactNode;
    onSelect?: (
        event: any,
        options: {
            onCloseMenu: () => void;
        }
    ) => void;
};

/// Not-yet-rendered tree item, we don't know its size yet
export type GurenTreeItemModelPlaceholder = {
    type: "GurenTreeItemModelPlaceholder";
    menuAction: MenuAction;
    origin: Position;
};

export type GurenTreeItemModel = {
    type: "GurenTreeItemModel";
    menuAction: MenuAction;
    rect: DimensionsObject | {};
    origin: Position;
    anchors: {
        [key in Anchor]: { active: boolean; pos: Position };
    };
};

export const get4WayDirection = (
    origin: Position,
    target: Position
): Anchor | void => {
    if (target.x - origin.x < 0 && target.y - origin.y < 0) {
        return "topLeft";
    } else if (target.x - origin.x >= 0 && target.y - origin.y < 0) {
        return "topRight";
    } else if (target.x - origin.x >= 0 && target.y - origin.y >= 0) {
        return "bottomRight";
    } else if (target.x - origin.x < 0 && target.y - origin.y >= 0) {
        return "bottomLeft";
    }
};

export const get6WayDirection = (
    origin: Position,
    target: Position
): Anchor => {
    if (target.x - origin.x < 0 && target.y - origin.y < 0) {
        return "topLeft";
    } else if (target.x - origin.x == 0 && target.y - origin.y < 0) {
        return "top";
    } else if (target.x - origin.x > 0 && target.y - origin.y < 0) {
        return "topRight";
    } else if (target.x - origin.x > 0 && target.y - origin.y >= 0) {
        return "bottomRight";
    } else if (target.x - origin.x == 0 && target.y - origin.y > 0) {
        return "bottom";
    } else if (target.x - origin.x < 0 && target.y - origin.y >= 0) {
        return "bottomLeft";
    } else {
        throw new Error("Should never happen");
    }
};

export const arrayRotate: <S extends any>(
    arr: Array<S>,
    count: number
) => Array<S> = (arr, count) => {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
    return arr;
};

export const hex2rgba = (hex: string, alpha = 1) => {
    const [r, g, b] = (hex.match(/\w\w/g) || ["0", "0", "0"]).map(x =>
        parseInt(x, 16)
    );
    return `rgba(${r},${g},${b},${alpha})`;
};
