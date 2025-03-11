import React, { CSSProperties, forwardRef, useMemo } from "react";
import {
  Freeze,
  getRemotionEnvironment,
  Sequence,
  SequenceProps,
  useCurrentFrame,
} from "remotion";

export type PremountedSequenceProps = SequenceProps & {
  premountFor: number;
  style?: CSSProperties;
};

const PremountedSequenceRefForwardingFunction: React.ForwardRefRenderFunction<
  HTMLDivElement,
  PremountedSequenceProps
> = ({ premountFor, from = 0, style: passedStyle, ...otherProps }, ref) => {
  const frame = useCurrentFrame();

  if (otherProps.layout === "none") {
    throw new Error('`<PremountedSequence>` does not support layout="none"');
  }

  // Determine if we're in the premount period.
  const active =
    frame < from &&
    frame >= from - premountFor &&
    !getRemotionEnvironment().isRendering;

  const style: CSSProperties = useMemo(() => {
    return {
      ...passedStyle,
      opacity: active ? 0 : 1,
      pointerEvents: active ? "none" : (passedStyle?.pointerEvents ?? "auto"),
    };
  }, [active, passedStyle]);

  return (
    <Freeze frame={from} active={active}>
      <Sequence ref={ref} from={from} style={style} {...otherProps} />
    </Freeze>
  );
};

export const PremountedSequence = forwardRef(
  PremountedSequenceRefForwardingFunction,
);
