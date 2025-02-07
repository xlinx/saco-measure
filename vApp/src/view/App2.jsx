import * as React from "react";
import Moveable from "react-moveable";
import './App2.css'
export default function App2() {
    const targetRef = React.useRef(null);
    const moveableRef = React.useRef(null);

    return (
        <div className="root2">
            <div className="container" style={{
                left: "200px",
                top: "100px",
                width: "500px",
                height: "500px",
                border: "1px solid #ccc",
            }}>
                <div className="target element1" style={{
                    width: "100px",
                    height: "100px",
                    left: "0px",
                    top: "120px",
                }}>Element1</div>
                <div className="target element2" style={{
                    width: "100px",
                    height: "100px",
                    left: "400px",
                    top: "120px",
                }}>Element2</div>
                <div className="target element3" style={{
                    width: "300px",
                    height: "100px",
                    top: "400px",
                    left: "50px",
                }}>Element3</div>
                <div className="target element4" ref={targetRef} style={{
                    width: "150px",
                    height: "125px",
                }}>Target</div>
                <Moveable
                    ref={moveableRef}
                    target={targetRef}
                    draggable={true}
                    scalable={true}
                    rotatable={true}
                    snappable={true}
                    isDisplaySnapDigit={true}
                    isDisplayInnerSnapDigit={false}
                    snapGap={true}
                    snapDirections={{"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true}}
                    elementSnapDirections={{"top":true,"left":true,"bottom":true,"right":true,"center":true,"middle":true}}
                    // snapThreshold={50}
                    maxSnapElementGuidelineDistance={150}
                    elementGuidelines={[".element1", ".element2", ".element3"]}
                    onRender={e => {
                        e.target.style.cssText += e.cssText;
                    }}
                    onSnap={e => {
                        console.log(e.guidelines, e.elements);
                    }}
                />
            </div>
        </div>
    );
}