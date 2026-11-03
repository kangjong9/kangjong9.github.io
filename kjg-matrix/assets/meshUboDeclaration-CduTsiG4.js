import{o as s}from"./babylon-rE-0nigO.js";const e="meshUboDeclaration",o=`struct Mesh {world : mat4x4<f32>,
visibility : f32,};var<uniform> mesh : Mesh;
#define WORLD_UBO
`;s.IncludesShadersStoreWGSL[e]||(s.IncludesShadersStoreWGSL[e]=o);const t={name:e,shader:o};export{t as m};
