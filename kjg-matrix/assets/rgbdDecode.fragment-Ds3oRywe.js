import{S as e,q as a}from"./index-xpuw9GHL.js";const o="rgbdDecodePixelShader",n=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;e.ShadersStore[o]||(e.ShadersStore[o]=n);const d=[a];for(const r of d)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);const s={name:o,shader:n};export{s as rgbdDecodePixelShader};
