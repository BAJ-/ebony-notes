/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from '../button';

describe("Actor::Button", () => {
  const ctxDrawImageMock = jest.fn();
  const ctxBeginPathMock = jest.fn();
  const ctxMoveToMock = jest.fn();
  const ctxLineToMock = jest.fn();
  const ctxQuadraticCurveToMock = jest.fn();
  const ctxClosePathMock = jest.fn();
  const ctxRectMock = jest.fn();
  const ctxFillMock = jest.fn();
  const ctxStrokeMock = jest.fn();
  const ctxFontMock = "";
  const ctxFillTextMock = jest.fn();

  const ctxMock = {
    // @ts-ignore
    drawImage: ctxDrawImageMock,
    beginPath: ctxBeginPathMock,
    moveTo: ctxMoveToMock,
    lineTo: ctxLineToMock,
    quadraticCurveTo: ctxQuadraticCurveToMock,
    closePath: ctxClosePathMock,
    rect: ctxRectMock,
    fillStyle: "",
    fill: ctxFillMock,
    strokeStyle: "",
    stroke: ctxStrokeMock,
    font: ctxFontMock,
    fillText: ctxFillTextMock
  };

  afterEach(() => {
    ctxMock.fillStyle = "";
    ctxMock.strokeStyle = "";
    ctxMock.font = "";
    jest.clearAllMocks();
  });

  test("draw: image", () => {
    const mainImage = new Image();
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      () => {/* noob */},
      { img: { main: mainImage }}
    );

    // @ts-ignore
    button.draw(ctxMock);
    expect(ctxDrawImageMock).toHaveBeenCalledWith(mainImage, 1, 2, 10, 20);
  });

  test("draw: image hover", () => {
    const hoverImage = new Image();
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      () => {/* noob */},
      { img: { hover: hoverImage }}
    );

    button.hasChanged({
      mousemove: { x: 2, y: 3 }
    });

    // @ts-ignore
    button.draw(ctxMock);
    expect(ctxDrawImageMock).toHaveBeenCalledWith(hoverImage, 1, 2, 10, 20);
  });

  test("draw: rect", () => {
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      () => {/* noob */},
      { draw: { main: { bgColor: "green", borderColor: "blue" } } }
    );

    // @ts-ignore
    button.draw(ctxMock);
    expect(ctxRectMock).toHaveBeenCalledWith(1, 2, 10, 20);
    expect(ctxMock.fillStyle).toEqual("green");
    expect(ctxFillMock).toHaveBeenCalled();
    expect(ctxMock.strokeStyle).toEqual("blue");
    expect(ctxStrokeMock).toHaveBeenCalled();
  });

  test("draw: rect rounded", () => {
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      () => {/* noob */},
      { draw: {
          radius: { tl: 3, tr: 4, bl: 5, br: 6 },
          main: { bgColor: "green" }
        }
      }
    );

    // @ts-ignore
    button.draw(ctxMock);
    expect(ctxBeginPathMock).toHaveBeenCalled();
    expect(ctxMoveToMock).toHaveBeenCalledWith(1 + 3, 2);
    expect(ctxLineToMock.mock.calls[0]).toEqual([1 + 10 - 4, 2]);
    expect(ctxQuadraticCurveToMock.mock.calls[0]).toEqual([1 + 10, 2, 1 + 10, 2 + 4]);
    expect(ctxLineToMock.mock.calls[1]).toEqual([1 + 10, 2 + 20 - 6]);
    expect(ctxQuadraticCurveToMock.mock.calls[1]).toEqual([1 + 10, 2 + 20, 1 + 10 - 6, 2 + 20]);
    expect(ctxLineToMock.mock.calls[2]).toEqual([1 + 5, 2 + 20]);
    expect(ctxQuadraticCurveToMock.mock.calls[2]).toEqual([1, 2 + 20, 1, 2 + 20 - 5]);
    expect(ctxLineToMock.mock.calls[3]).toEqual([1, 2 + 3]);
    expect(ctxQuadraticCurveToMock.mock.calls[3]).toEqual([1, 2, 1 + 3, 2]);
    expect(ctxClosePathMock).toHaveBeenCalled();
    expect(ctxMock.fillStyle).toEqual("green");
    expect(ctxFillMock).toHaveBeenCalled();
  });

  test("hasChanged: clickPosition -> clicked", () => {
    const onClickMock = jest.fn();
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      onClickMock,
      { draw: { main: { bgColor: "green" } } }
    );

    const changedDown = button.hasChanged({
      mousemove: { x: 2, y: 3 },
      mousedown: { x: 2, y: 3 }
    });
    expect(onClickMock).not.toHaveBeenCalled();
    expect(changedDown).toEqual(true);

    const changedDownHold = button.hasChanged({
      mousemove: { x: 2, y: 3 },
      mousedown: { x: 2, y: 3 }
    });
    expect(onClickMock).not.toHaveBeenCalled();
    expect(changedDownHold).toEqual(false);

    const changedUp = button.hasChanged({
      mousemove: { x: 2, y: 3 },
      mouseup: { x: 2, y: 3 }
    });
    expect(onClickMock).toHaveBeenCalled();
    expect(changedUp).toEqual(true);
  });

  test("hasChanged: clickPosition -> not clicked", () => {
    const onClickMock = jest.fn();
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      onClickMock,
      { draw: { main: { bgColor: "green" } } }
    );

    const changedDown = button.hasChanged({
      mousemove: { x: 0, y: 3 },
      mousedown: { x: 0, y: 3 }
    });
    expect(onClickMock).not.toHaveBeenCalled();
    expect(changedDown).toEqual(false);

    const changedUp = button.hasChanged({
      mousemove: { x: 0, y: 3 },
      mouseup: { x: 0, y: 3 }
    });
    expect(onClickMock).not.toHaveBeenCalled();
    expect(changedUp).toEqual(false);
  });

  test("hasChanged: hover -> un-hover", () => {
    const button = new Button(
      {x: 1, y: 2},
      {width: 10, height: 20},
      () => {/* noob */},
      { draw: { main: { bgColor: "green" } } }
    );

    // Hover
    const changedHover = button.hasChanged({
      mousemove: { x: 1, y: 3 }
    });
    expect(changedHover).toEqual(true);

    // No change
    const changedHoverNoChange = button.hasChanged({
      mousemove: { x: 1, y: 3 }
    });
    expect(changedHoverNoChange).toEqual(false);

    // Un-hover
    const changedUnHover = button.hasChanged({
      mousemove: { x: 0, y: 3 }
    });
    expect(changedUnHover).toEqual(true);
  });
});
