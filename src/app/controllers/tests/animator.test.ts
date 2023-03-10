import { Animator } from '../animator';

describe("Controller::Animator", () => {
  // We are calling `requestAnimationFrame` from the animationLoop, so we want to avoid
  // keep doing that in tests.
  let animationCount = 0;
  const animationFrameMock = jest.fn(animationLoopFn => {
    if (animationCount === 0) {
      animationCount++;
      animationLoopFn(animationCount);
    }
    return animationCount;
  });

  // @ts-ignore
  const window: Window = {
    requestAnimationFrame: animationFrameMock
  };

  // Foreground context
  const ctxFgClearRectMock = jest.fn();
  const ctxFgMock = {
    clearRect: ctxFgClearRectMock
  };
  // Background context
  const ctxBgClearRectMock = jest.fn();
  const ctxBgMock = {
    clearRect: ctxBgClearRectMock
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("No actors", () => {
    new Animator(
      window,
      // @ts-ignore
      ctxBgMock,
      ctxFgMock,
      { width: 100, height: 100 }
    );

    expect(animationFrameMock).toHaveBeenCalled();
  });
});
