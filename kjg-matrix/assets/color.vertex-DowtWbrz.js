import{S as e,p as r,q as t,r as a,s as d,t as c,u as l,v as s,w as f,x as V,y as x,z as u}from"./index-Cb9BwFvl.js";const n="colorVertexShader",o=`attribute vec3 position;
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#ifdef FOG
uniform mat4 view;
#endif
#include<instancesDeclaration>
uniform mat4 viewProjection;
#ifdef MULTIVIEW
uniform mat4 viewProjectionR;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);
#ifdef MULTIVIEW
if (gl_ViewID_OVR==0u) {gl_Position=viewProjection*worldPos;} else {gl_Position=viewProjectionR*worldPos;}
#else
gl_Position=viewProjection*worldPos;
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<vertexColorMixing>
#define CUSTOM_VERTEX_MAIN_END
}`;e.ShadersStore[n]||(e.ShadersStore[n]=o);const S=[r,t,a,d,c,l,s,f,V,x,u];for(const i of S)e.IncludesShadersStore[i.name]||(e.IncludesShadersStore[i.name]=i.shader);const E={name:n,shader:o};export{E as colorVertexShader};
