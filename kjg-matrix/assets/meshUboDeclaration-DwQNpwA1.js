import{r}from"./babylon-CFEYkdvd.js";const e="meshUboDeclaration",s=`struct Mesh {world : mat4x4<f32>,
visibility : f32,};var<uniform> mesh : Mesh;
#define WORLD_UBO
`;r.IncludesShadersStoreWGSL[e]||(r.IncludesShadersStoreWGSL[e]=s);const t={name:e,shader:s};export{t as m};
