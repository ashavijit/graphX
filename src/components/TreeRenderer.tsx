import {
  Canvas,
  Edge,
  MarkerArrow,
  Node,
  CanvasRef,
  CanvasDirection,
} from "reaflow";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { TreeState } from "../lib/types";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import EventContext from "../lib/EventContext";
import { Item, Menu, TriggerEvent, useContextMenu } from "react-contexify";
import Toastify from "toastify-js";

const EmptyElt = () => {
  return null;
};

const NODE_MENU_ID = "node-menu";

const TreeRenderer = ({
  nodes,
  edges,
  depth,
  width,
  height,
  direction,
}: TreeState & {
  width: number;
  height: number;
  direction: CanvasDirection;
}) => {
  const [paneWidth, setPaneWidth] = useState(2000);
  const [paneHeight, setPaneHeight] = useState(2000);

  const canvasRef = useRef<CanvasRef>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  const { show } = useContextMenu({
    id: NODE_MENU_ID,
  });

  const calculatePaneWidthAndHeight = useCallback(() => {
    let newHeight = 0;
    let newWidth = 0;
    canvasRef?.current?.layout?.children?.forEach((node) => {
      if (node.y + node.height > newHeight) newHeight = node.y + node.height;
      if (node.x + node.width > newWidth) newWidth = node.x + node.width;
    });

    
    setPaneHeight(newHeight < height ? height : newHeight + 100);
    setPaneWidth(newWidth < width ? width : newWidth + 100);
  }, [width, height]);

  const eventContext = useContext(EventContext);

  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.centerView(1);
    }
  }, [eventContext.zoom]);

  function handleContextMenu(event: TriggerEvent, data: any) {
    event.preventDefault();

    show(event, {
      props: { data },
    });
  }

  const copyNode = async ({ props }: any) => {
    await navigator.clipboard.writeText(JSON.stringify(props.data.node || {}));
    Toastify({
      text: "Copied Node to clipboard 🎉",
      duration: 2000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(135deg,#42E695,#3BB2B8)",
      },
    }).showToast();
  };

  const copyTree = async ({ props }: any) => {
    await navigator.clipboard.writeText(JSON.stringify(props.data.tree || {}));
    Toastify({
      text: "Copied Tree to clipboard 🎉",
      duration: 2000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(135deg,#42E695,#3BB2B8)",
      },
    }).showToast();
  };

  if (nodes.length === 0 && edges.length === 0) return null;

  return (
    <>
      <TransformWrapper
        wheel={{ step: 0.1 }}
        limitToBounds={false}
        maxScale={depth + 1}
        zoomAnimation={{
          animationType: "linear",
        }}
        ref={transformRef}
      >
        <TransformComponent>
          <Canvas
            key={direction}
            className="canvas"
            nodes={nodes}
            edges={edges}
            node={({ ...props }) => {
              return (
                <Node
                  {...props}
                  style={{ stroke: "#1a192b", fill: "white", strokeWidth: 1 }}
                  label={<EmptyElt />}
                >
                  {(event) => (
                    <foreignObject
                      height={event.height}
                      width={event.width}
                      x={0}
                      y={0}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                      }}
                    >
                      <div
                        className="p-2.5"
                        onContextMenu={(evt) =>
                          handleContextMenu(evt, event.node.data)
                        }
                      >
                        <div className="whitespace-pre mx-auto inline-block">
                          {props.properties.text}
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </Node>
              );
            }}
            arrow={<MarkerArrow style={{ fill: "#b1b1b7" }} />}
            edge={<Edge className="edge" />}
            fit={true}
            readonly={true}
            dragEdge={null}
            dragNode={null}
            ref={canvasRef}
            onLayoutChange={calculatePaneWidthAndHeight}
            maxHeight={paneHeight}
            maxWidth={paneWidth}
            width={width}
            height={height}
            zoomable={false}
            direction={direction}
          />
        </TransformComponent>
      </TransformWrapper>
      <Menu id={NODE_MENU_ID} theme="graphize">
        <Item onClick={copyNode}>📦 Copy Node</Item>
        <Item onClick={copyTree}>🎄 Copy Tree</Item>
      </Menu>
    </>
  );
};

export default TreeRenderer;
