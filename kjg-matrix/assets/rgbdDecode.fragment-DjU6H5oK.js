import{d as e,l as n}from"./babylon-NbmdZkq4.js";import"./loading-runtime-PPVm8Dsz.js";const o="rgbdDecodePixelShader",d=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;e.ShadersStore[o]||(e.ShadersStore[o]=d);const t=[n];for(const r of t)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);const i={name:o,shader:d};export{i as rgbdDecodePixelShader};
