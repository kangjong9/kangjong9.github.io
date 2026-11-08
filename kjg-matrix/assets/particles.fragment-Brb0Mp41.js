import{h as e}from"./babylon-CO-UT0bg.js";import{c as l,a as n}from"./clipPlaneFragment-DFr-BSTh.js";import{i,a as t}from"./imageProcessingFunctions-ai-PTQdZ.js";import{l as s}from"./logDepthDeclaration-Cu861-b2.js";import{h as p}from"./helperFunctions-mzY1Rgyg.js";import{f as m,a as f}from"./fogFragment-w81twRHU.js";import{l as c}from"./logDepthFragment-D4YRjPeW.js";import"./loading-runtime-PPVm8Dsz.js";const r="particlesPixelShader",o=`varying vUV: vec2f;varying vColor: vec4f;uniform textureMask: vec4f;var diffuseSamplerSampler: sampler;var diffuseSampler: texture_2d<f32>;
#include<clipPlaneFragmentDeclaration>
#include<imageProcessingDeclaration>
#include<logDepthDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
#ifdef RAMPGRADIENT
varying remapRanges: vec4f;var rampSamplerSampler: sampler;var rampSampler: texture_2d<f32>;
#endif
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var textureColor: vec4f=textureSample(diffuseSampler,diffuseSamplerSampler,input.vUV);var baseColor: vec4f=(textureColor*uniforms.textureMask+( vec4f(1.,1.,1.,1.)-uniforms.textureMask))*input.vColor;
#ifdef RAMPGRADIENT
var alpha: f32=baseColor.a;var remappedColorIndex: f32=clamp((alpha-input.remapRanges.x)/input.remapRanges.y,0.0,1.0);var rampColor: vec4f=textureSample(rampSampler,rampSamplerSampler,vec2f(1.0-remappedColorIndex,0.));baseColor=vec4f(baseColor.rgb*rampColor.rgb,baseColor.a);var finalAlpha: f32=baseColor.a;baseColor.a=clamp((alpha*rampColor.a-input.remapRanges.z)/input.remapRanges.w,0.0,1.0);
#endif
#ifdef BLENDMULTIPLYMODE
var sourceAlpha: f32=input.vColor.a*textureColor.a;baseColor=vec4f(baseColor.rgb*sourceAlpha+ vec3f(1.0)*(1.0-sourceAlpha),baseColor.a);
#endif
#include<logDepthFragment>
#include<fogFragment>(color,baseColor)
#ifdef IMAGEPROCESSINGPOSTPROCESS
baseColor=vec4f(toLinearSpaceVec3(baseColor.rgb),baseColor.a);
#else
#ifdef IMAGEPROCESSING
baseColor=vec4f(toLinearSpaceVec3(baseColor.rgb),baseColor.a);baseColor=applyImageProcessing(baseColor);
#endif
#endif
fragmentOutputs.color=baseColor;
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStoreWGSL[r]||(e.ShadersStoreWGSL[r]=o);const S=[l,i,s,p,t,m,n,c,f];for(const a of S)e.IncludesShadersStoreWGSL[a.name]||(e.IncludesShadersStoreWGSL[a.name]=a.shader);const F={name:r,shader:o};export{F as particlesPixelShaderWGSL};
