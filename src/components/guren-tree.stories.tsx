import React, { useState } from "react";
import { GurenTree } from "./guren-tree";

export default { title: "GurenTree" };

const NodeText = ({ children }: { children: React.ReactNode }) => (
    <span
        style={{
            color: "#ffffff",
            fontFamily: "menlo, sans-serif",
            textAlign: "center"
        }}
    >
        {children}
    </span>
);

export const basic = () => (
    <GurenTree
        origin={{ x: 100, y: 100 }}
        centerAction={{
            node: (
                <NodeText>
                    Breached the firewall!
                    <br />
                    Whats your next choice?
                </NodeText>
            ),
            onSelect: () => alert("Select a choice plox")
        }}
        actions={[
            {
                node: <NodeText>Enter Mainframe</NodeText>,
                onSelect: () => alert("We are in!")
            },
            {
                node: <NodeText>Sniff around</NodeText>,
                onSelect: () => alert("Sneaky Sneaky")
            },
            {
                node: <NodeText>Party hard</NodeText>,
                onSelect: () => alert("Hackz0r")
            },
            {
                node: (
                    <div>
                        <div>
                            <NodeText>Emergency kitten!</NodeText>
                        </div>
                    </div>
                ),
                onSelect: () => alert("Kitten is on the way!")
            },
            {
                node: <NodeText>👾 Fight space invaders 👾</NodeText>,
                onSelect: () => alert("Pew Pew Pew!")
            }
        ]}
        onClose={() => alert("onClose")}
        styles={{
            primaryColor: "#2081a5",
            secondaryColor: "#e01073",
            modalBackdropColor: "#000000EE"
        }}
    />
);

export const originPositions = () => {
    const [origin, setOrigin] = useState<{ x: number; y: number } | void>();

    const showMenu = (event: any) =>
        setOrigin({
            x: event.clientX,
            y: event.clientY
        });

    return (
        <div>
            <button style={{ position: "absolute" }} onClick={showMenu}>
                Show Menu
            </button>
            <button
                style={{ position: "absolute", left: "50%" }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{ position: "absolute", right: "0" }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{ position: "absolute", top: "50%" }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{ position: "absolute", top: "50%", left: "50%" }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{ position: "absolute", top: "50%", right: "0" }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{ position: "absolute", bottom: 0 }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            <button
                style={{
                    position: "absolute",
                    bottom: 0,
                    right: "0",
                    height: "45%",
                    width: "75%"
                }}
                onClick={showMenu}
            >
                Show Menu
            </button>
            {origin && (
                <GurenTree
                    origin={origin}
                    centerAction={{
                        node: (
                            <NodeText>
                                Breached the firewall!
                                <br />
                                Whats your next choice?
                            </NodeText>
                        ),
                        onSelect: () => alert("Select a choice plox")
                    }}
                    actions={[
                        {
                            node: <NodeText>Enter Mainframe</NodeText>,
                            onSelect: () => alert("We are in!")
                        },
                        {
                            node: <NodeText>Sniff around</NodeText>,
                            onSelect: () => alert("Sneaky Sneaky")
                        },
                        {
                            node: (
                                <NodeText>
                                    <ul>
                                        <li>Get Hoodie</li>
                                        <li>Get Guy Fawkes mask</li>
                                        <li>Sell data to highest bidder</li>
                                    </ul>
                                </NodeText>
                            ),
                            onSelect: () => alert("Hackz0r")
                        },
                        {
                            node: (
                                <div>
                                    <div>
                                        <NodeText>Emergency kitten!</NodeText>
                                    </div>
                                    <img src="https://placekitten.com/201/201" />
                                </div>
                            ),
                            onSelect: () => alert("Kitten is on the way!")
                        },
                        {
                            node: (
                                <NodeText>👾 Fight space invaders 👾</NodeText>
                            ),
                            onSelect: () => alert("Pew Pew Pew!")
                        }
                    ]}
                    onClose={() => setOrigin()}
                    styles={{
                        primaryColor: "#2081a5",
                        secondaryColor: "#e01073",
                        modalBackdropColor: "#00000033"
                    }}
                />
            )}
        </div>
    );
};

export const keyboardShortcuts = () => {
    const [origin, setOrigin] = useState<{ x: number; y: number } | void>();

    const showMenu = (event: any) =>
        setOrigin({
            x: event.clientX,
            y: event.clientY
        });

    return (
        <div>
            <button style={{ position: "absolute" }} onClick={showMenu}>
                Show Menu
            </button>
            {origin && (
                <GurenTree
                    origin={origin}
                    centerAction={{
                        node: (
                            <NodeText>
                                'X' to close. <br />
                                'Q' selects nonexisting,
                                <br />
                                therefore closing, too.
                            </NodeText>
                        ),
                        onSelect: () => alert("Select a choice plox")
                    }}
                    actions={[
                        {
                            node: <NodeText>Upper option: 'W'</NodeText>,
                            onSelect: () => alert("'Upper option' selected")
                        },
                        {
                            node: <NodeText>Upper left option: 'E'</NodeText>,
                            onSelect: () =>
                                alert("'Upper left option' selected")
                        },
                        {
                            node: <NodeText>Bottom right option: 'D'</NodeText>,
                            onSelect: () =>
                                alert("'Bottom right option' selected")
                        },
                        {
                            node: <NodeText>Bottom option: 'S'</NodeText>,
                            onSelect: () => alert("'Bottom option' selected")
                        },
                        {
                            node: <NodeText>Bottom left option: 'A'</NodeText>,
                            onSelect: () =>
                                alert("'Bottom left option' selected")
                        }
                    ]}
                    onClose={() => setOrigin()}
                    styles={{
                        primaryColor: "#2081a5",
                        secondaryColor: "#e01073",
                        modalBackdropColor: "#00000033"
                    }}
                />
            )}
        </div>
    );
};

export const notes = () => (
    <div>
        <ul>
            <li>
                Move basic styles like lines, blocks, borders etc... to its own
                utility library
            </li>
        </ul>
    </div>
);
