import { draw, assembleWire, genericSweep, sketchCircle, Wire, Solid } from "replicad";

export interface SkiHolderParams {
  thickness: number;
  height: number;
  skiThickness: number;
  skiHeight: number;
  poleThickness: number;
}

export const defaultParams: SkiHolderParams = {
  thickness: 8,
  height: 10,
  skiThickness: 32,
  skiHeight: 63,
  poleThickness: 15,
};

export const main = ({
  thickness = 8,
  height = 10,
  skiThickness = 32,
  skiHeight = 63,
  poleThickness = 15,
}: Partial<SkiHolderParams> = {}) => {
  const profile = draw()
    .hLine(skiThickness * 1.2 + thickness / 2)
    .vLine(skiHeight)
    .line(-30, 30)
    .vLine(20)
    .hBulgeArc(poleThickness + thickness, -1)
    .vLine(-20)
    .done();

  const rectSketch = draw()
    .hLine(thickness)
    .vLine(height)
    .hLine(-thickness)
    .vLine(-height)
    .close();

  // Type assertions needed due to incomplete replicad type definitions
  const spine = (profile.sketchOnPlane("XY") as unknown as { wire: Wire }).wire;
  const spineEndPoint = spine.endPoint;
  const elbow = spine.edges[3].startPoint;
  const corner = spine.edges[1].startPoint;
  const neck = spine.edges[2].startPoint;
  const sectionPlane = "YZ";
  const sectionWire = (rectSketch.sketchOnPlane(sectionPlane) as unknown as { wire: Wire }).wire;

  const config = {
    frenet: true,
    forceProfileSpineOthogonality: true,
  };

  const holder = sketchCircle(thickness / 2, {
    plane: "XY",
    origin: spineEndPoint,
  })
    .extrude(height)
    .translate([0, 10, 0]);
  const fastenerLength = 50;
  const fastener = draw()
    .vLine(fastenerLength)
    .hLine(2)
    .vLine(-fastenerLength)
    .hLine(-2)
    .close()
    .sketchOnPlane("XY", neck)
    .extrude(height)
    .rotate(140, neck)
    .translate(-thickness / 2 as unknown as [number, number, number]);

  const spineAssembled = assembleWire([spine]);
  const swept = genericSweep(sectionWire, spineAssembled, config, false)
    .fillet(thickness / 2.01, (e) =>
      e.inPlane("XZ", -spineEndPoint.y).inDirection("Z")
    )
    .fillet(thickness, (e) => e.withinDistance(40, elbow).inDirection("Z"))
    .fillet(thickness, (e) => e.withinDistance(40, corner).inDirection("Z"))
    .fillet(thickness, (e) => e.withinDistance(50, neck).inDirection("Z"))
    .fuse(holder as Solid)
    .fuse(fastener as Solid);

  return swept.clone().fuse(swept.mirror("YZ"));
};
