import type React from "react";
import SvgBase, {
  Circle as CircleBase,
  Line as LineBase,
  Path as PathBase,
  Rect as RectBase,
  type CircleProps,
  type LineProps,
  type PathProps,
  type RectProps,
  type SvgProps,
} from "react-native-svg";

export const Svg = SvgBase as unknown as React.FC<SvgProps>;
export const Circle = CircleBase as unknown as React.FC<CircleProps>;
export const Line = LineBase as unknown as React.FC<LineProps>;
export const Path = PathBase as unknown as React.FC<PathProps>;
export const Rect = RectBase as unknown as React.FC<RectProps>;
