import opencascade from "replicad-opencascadejs/src/replicad_single.js";
import opencascadeWasm from "replicad-opencascadejs/src/replicad_single.wasm?url";
import { setOC } from "replicad";
import { expose } from "comlink";

import { main as drawSkiHolder, SkiHolderParams } from "./ski";

let loaded = false;
const init = async () => {
  if (loaded) return Promise.resolve(true);

  const OC = await opencascade({
    locateFile: () => opencascadeWasm,
  });

  loaded = true;
  setOC(OC);

  return true;
};
const started = init();

async function createBlob(params: SkiHolderParams) {
  await started;
  return drawSkiHolder(params).blobSTL();
}

async function createMesh(params: SkiHolderParams) {
  await started;
  const model = drawSkiHolder(params);
  return {
    faces: model.mesh(),
    edges: model.meshEdges(),
  };
}

expose({ createBlob, createMesh });
