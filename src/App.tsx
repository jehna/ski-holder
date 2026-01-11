import { useState, useEffect, CSSProperties, ChangeEvent } from "react";

import FileSaver from "file-saver";
import { wrap, Remote } from "comlink";

import ThreeContext from "./ThreeContext";
import ReplicadMesh from "./ReplicadMesh";
import { defaultParams, SkiHolderParams } from "./ski";

import cadWorker from "./worker?worker";

interface WorkerAPI {
  createBlob: (params: SkiHolderParams) => Promise<Blob>;
  createMesh: (params: SkiHolderParams) => Promise<{
    faces: { vertices: number[]; triangles: number[]; normals: number[] };
    edges: { vertices: number[]; edges: number[] };
  }>;
}

const cad = wrap<WorkerAPI>(new cadWorker());

export default function ReplicadApp() {
  const [params, setParams] = useState<SkiHolderParams>(defaultParams);
  const [mesh, setMesh] = useState<{
    faces: { vertices: number[]; triangles: number[]; normals: number[] };
    edges: { vertices: number[]; edges: number[] };
  } | null>(null);

  const updateParam = (key: keyof SkiHolderParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const downloadModel = async () => {
    const blob = await cad.createBlob(params);
    FileSaver.saveAs(blob, "ski-holder.stl");
  };

  useEffect(() => {
    cad.createMesh(params).then((m) => setMesh(m));
  }, [params]);

  const inputStyle: CSSProperties = {
    width: "60px",
    textAlign: "right",
    border: "none",
    borderBottom: "1px solid #ccc",
    background: "transparent",
    MozAppearance: "textfield",
    WebkitAppearance: "none",
    appearance: "textfield",
  };

  const inputWrapperStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  };

  const labelStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  };

  const handleChange = (key: keyof SkiHolderParams) => (e: ChangeEvent<HTMLInputElement>) => {
    updateParam(key, parseInt(e.target.value) || 0);
  };

  return (
    <main>
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
      <h1>Ski Holder Designer</h1>
      <p>
        Built with{" "}
        <a
          href="https://replicad.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          replicad
        </a>
      </p>
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div style={{ minWidth: "200px" }}>
          <h3>Parameters</h3>
          <div style={labelStyle}>
            <label htmlFor="thickness">Wall Thickness</label>
            <div style={inputWrapperStyle}>
              <input
                id="thickness"
                type="number"
                step="1"
                min="4"
                max="20"
                value={params.thickness}
                onChange={handleChange("thickness")}
                style={inputStyle}
              />
              <span>mm</span>
            </div>
          </div>
          <div style={labelStyle}>
            <label htmlFor="height">Extrusion Height</label>
            <div style={inputWrapperStyle}>
              <input
                id="height"
                type="number"
                step="1"
                min="5"
                max="30"
                value={params.height}
                onChange={handleChange("height")}
                style={inputStyle}
              />
              <span>mm</span>
            </div>
          </div>
          <div style={labelStyle}>
            <label htmlFor="skiThickness">Ski Thickness</label>
            <div style={inputWrapperStyle}>
              <input
                id="skiThickness"
                type="number"
                step="1"
                min="10"
                max="60"
                value={params.skiThickness}
                onChange={handleChange("skiThickness")}
                style={inputStyle}
              />
              <span>mm</span>
            </div>
          </div>
          <div style={labelStyle}>
            <label htmlFor="skiHeight">Ski Height</label>
            <div style={inputWrapperStyle}>
              <input
                id="skiHeight"
                type="number"
                step="1"
                min="30"
                max="150"
                value={params.skiHeight}
                onChange={handleChange("skiHeight")}
                style={inputStyle}
              />
              <span>mm</span>
            </div>
          </div>
          <div style={labelStyle}>
            <label htmlFor="poleThickness">Pole Diameter</label>
            <div style={inputWrapperStyle}>
              <input
                id="poleThickness"
                type="number"
                step="1"
                min="10"
                max="40"
                value={params.poleThickness}
                onChange={handleChange("poleThickness")}
                style={inputStyle}
              />
              <span>mm</span>
            </div>
          </div>
          <button onClick={downloadModel} style={{ marginTop: "16px", width: "100%" }}>
            Download STL
          </button>
        </div>
        <section style={{ height: "400px", flex: 1 }}>
          {mesh ? (
            <ThreeContext>
              <ReplicadMesh edges={mesh.edges} faces={mesh.faces} />
            </ThreeContext>
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", fontSize: "2em" }}
            >
              Loading...
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
