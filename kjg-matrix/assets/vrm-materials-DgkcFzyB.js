import{bC as Er,a_ as ge,j as z,G as Pr,bD as Rr}from"./ExtrasAsMetadata-DRsWgM6F.js";import{bJ as Cr,aV as Nr,bu as Lr,b9 as Dr,bK as Or,bv as br,bL as yr,bw as wr,bM as Fr,bN as Ur,bO as Wr,bx as Vr,br as Xr,bt as Br,bs as kr,bP as Gr,bq as Hr,bQ as zr,bp as Yr,bg as Qr,bR as $r,bj as jr,bk as Kr,bh as qr,bi as Zr,aT as Jr,bS as en,bT as tn,bc as rn,bd as nn,b7 as an,aX as sn,be as on,a$ as ln,bU as hn,bV as Q,aO as U,bf as dn,aM as B,bo as xe,aW as un,S as fn,bW as cn,b3 as ct,bC as mn,aK as pn,bF as gn,M as W,b as N,K as Ie,bX as mt,E as Ce,L as P,V as d,T as me,Q as S,bY as re,bZ as _n,aJ as Mn,b_ as pt,b$ as X,bH as R,c0 as Tn,aP as A}from"./babylon-CO-UT0bg.js";import{p as gt}from"./vrm-motion-CIZq_-LT.js";import"./environmentTextureTools.pure-CJh8mEGH.js";import"./loading-runtime-PPVm8Dsz.js";import"./workerPool-CfMXSLnf.js";import"./index-CfBH8AQu.js";Cr();class M{}M.BindSceneUniformBuffer=Nr;M.PrepareDefinesForMergedUV=Lr;M.BindTextureMatrix=Dr;M.GetFogState=Or;M.PrepareDefinesForMisc=br;M.PrepareDefinesForCamera=yr;M.PrepareDefinesForFrameBoundValues=wr;M.PrepareDefinesForBones=Fr;M.PrepareDefinesForMorphTargets=Ur;M.PrepareDefinesForBakedVertexAnimation=Wr;M.PrepareDefinesForAttributes=Vr;M.PrepareDefinesForMultiview=Xr;M.PrepareDefinesForOIT=Br;M.PrepareDefinesForPrePass=kr;M.PrepareDefinesForLight=Gr;M.PrepareDefinesForLights=Hr;M.PrepareUniformsAndSamplersForLight=zr;M.PrepareUniformsAndSamplersList=Yr;M.HandleFallbacksForShadows=Qr;M.PrepareAttributesForMorphTargetsInfluencers=$r;M.PrepareAttributesForMorphTargets=jr;M.PrepareAttributesForBakedVertexAnimation=Kr;M.PrepareAttributesForBones=qr;M.PrepareAttributesForInstances=Zr;M.PushAttributesForInstances=Jr;M.BindLightProperties=en;M.BindLight=tn;M.BindLights=rn;M.BindFogParameters=nn;M.BindBonesParameters=an;M.BindMorphTargetParameters=sn;M.BindLogDepth=on;var Ne;(function(e){e[e.Created=1]="Created",e[e.Disposed=2]="Disposed",e[e.GetDefineNames=4]="GetDefineNames",e[e.PrepareUniformBuffer=8]="PrepareUniformBuffer",e[e.IsReadyForSubMesh=16]="IsReadyForSubMesh",e[e.PrepareDefines=32]="PrepareDefines",e[e.BindForSubMesh=64]="BindForSubMesh",e[e.PrepareEffect=128]="PrepareEffect",e[e.GetAnimatables=256]="GetAnimatables",e[e.GetActiveTextures=512]="GetActiveTextures",e[e.HasTexture=1024]="HasTexture",e[e.FillRenderTargetTextures=2048]="FillRenderTargetTextures",e[e.HasRenderTargetTextures=4096]="HasRenderTargetTextures",e[e.HardBindForSubMesh=8192]="HardBindForSubMesh"})(Ne||(Ne={}));var E;(function(e){e[e.Checkbox=0]="Checkbox",e[e.Slider=1]="Slider",e[e.Vector3=2]="Vector3",e[e.Quaternion=3]="Quaternion",e[e.Color3=4]="Color3",e[e.String=5]="String",e[e.Button=6]="Button",e[e.Options=7]="Options",e[e.Tab=8]="Tab",e[e.FileButton=9]="FileButton",e[e.Vector2=10]="Vector2"})(E||(E={}));Er();var An=Object.create,dt=Object.defineProperty,Sn=Object.getOwnPropertyDescriptor,or=(e,t)=>(t=Symbol[e])?t:Symbol.for("Symbol."+e),ae=e=>{throw TypeError(e)},lr=(e,t,i)=>t in e?dt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,_t=(e,t)=>dt(e,"name",{value:t,configurable:!0}),vn=e=>[,,,An(e?.[or("metadata")]??null)],hr=["class","method","getter","setter","accessor","field","value","get","set"],fe=e=>e!==void 0&&typeof e!="function"?ae("Function expected"):e,xn=(e,t,i,r,a)=>({kind:hr[e],name:t,metadata:r,addInitializer:n=>i._?ae("Already initialized"):a.push(fe(n||null))}),dr=(e,t)=>lr(t,or("metadata"),e[3]),h=(e,t,i,r)=>{for(var a=0,n=e[t>>1],s=n&&n.length;a<s;a++)t&1?n[a].call(i):r=n[a].call(i,r);return r},p=(e,t,i,r,a,n)=>{var s,o,u,g,c,m=t&7,v=!!(t&8),T=!!(t&16),I=m>3?e.length+1:m?v?1:2:0,b=hr[m+5],k=m>3&&(e[I-1]=[]),J=e[I]||(e[I]=[]),L=m&&(!T&&!v&&(a=a.prototype),m<5&&(m>3||!T)&&Sn(m<4?a:{get[i](){return Mt(this,n)},set[i](D){return Tt(this,n,D)}},i));m?T&&m<4&&_t(n,(m>2?"set ":m>1?"get ":"")+i):_t(a,i);for(var y=r.length-1;y>=0;y--)g=xn(m,i,u={},e[3],J),m&&(g.static=v,g.private=T,c=g.access={has:T?D=>In(a,D):D=>i in D},m^3&&(c.get=T?D=>(m^1?Mt:En)(D,a,m^4?n:L.get):D=>D[i]),m>2&&(c.set=T?(D,F)=>Tt(D,a,F,m^4?n:L.set):(D,F)=>D[i]=F)),o=(0,r[y])(m?m<4?T?n:L[b]:m>4?void 0:{get:L.get,set:L.set}:a,g),u._=1,m^4||o===void 0?fe(o)&&(m>4?k.unshift(o):m?T?n=o:L[b]=o:a=o):typeof o!="object"||o===null?ae("Object expected"):(fe(s=o.get)&&(L.get=s),fe(s=o.set)&&(L.set=s),fe(s=o.init)&&k.unshift(s));return m||dr(e,a),L&&dt(a,i,L),T?m^4?n:L:a},_=(e,t,i)=>lr(e,typeof t!="symbol"?t+"":t,i),ut=(e,t,i)=>t.has(e)||ae("Cannot "+i),In=(e,t)=>Object(t)!==t?ae('Cannot use the "in" operator on this value'):e.has(t),Mt=(e,t,i)=>(ut(e,t,"read from private field"),i?i.call(e):t.get(e)),C=(e,t,i)=>t.has(e)?ae("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),Tt=(e,t,i,r)=>(ut(e,t,"write to private field"),r?r.call(e,i):t.set(e,i),i),En=(e,t,i)=>(ut(e,t,"access private method"),i),At,St,vt,xt,It,Et,Pt,Rt,Ct,Nt,Lt,Dt,Ot,bt,yt,wt,Ft,Ut,Wt,Vt,Xt,Bt,kt,Gt,Ht,zt,Yt,Qt,$t,jt,Kt,qt,Zt,Jt,ei,ti,ii,ri,ni,ai,si,oi,li,hi,di,ui,fi,ci,mi,pi,gi,_i,Mi,Ti,Ai,Si,vi,xi,Ii,Ei,Pi,Ri,Ci,Ni,Li,Di,Oi,bi,yi,wi,Fi,Ui,Wi,Vi,De,l,f,Oe,be,ye,we,Fe,Ue,We,Ve,Xe,Be,ke,Ge,He,ze,Ye,Qe,$e,je,Ke,qe,Ze,Je,et;function Xi(e,t){let i=e;for(;i;){if(i===t)return!0;let r=i.getTransformNode?.();if(r&&r===t)return!0;i=i.parent}return!1}function Pn(e,t){let i=e.getIndices(),r=e.getVerticesData(B.MatricesIndicesKind),a=e.getVerticesData(B.MatricesWeightsKind);if(!i||!r||!a)return null;let n=e.isVerticesDataPresent(B.MatricesIndicesExtraKind)?e.getVerticesData(B.MatricesIndicesExtraKind):null,s=e.isVerticesDataPresent(B.MatricesWeightsExtraKind)?e.getVerticesData(B.MatricesWeightsExtraKind):null,o=new Set(t),u=m=>{let v=m*4;for(let T=0;T<4;T++)if(a[v+T]>0&&o.has(r[v+T]))return!0;if(n&&s){for(let T=0;T<4;T++)if(s[v+T]>0&&o.has(n[v+T]))return!0}return!1},g=[];for(let m=0;m+2<i.length;m+=3){let v=i[m],T=i[m+1],I=i[m+2];u(v)||u(T)||u(I)||g.push(v,T,I)}let c=e.clone(`${e.name}(erase)`,e.parent);return c.makeGeometryUnique(),c.setIndices(g),c}var ur=class ce{static DEFAULT_FIRSTPERSON_ONLY_LAYER_MASK=268435456;static DEFAULT_THIRDPERSON_ONLY_LAYER_MASK=536870912;meshAnnotations=[];headBone;createdMeshes=[];_firstPersonOnlyLayerMask=ce.DEFAULT_FIRSTPERSON_ONLY_LAYER_MASK;_thirdPersonOnlyLayerMask=ce.DEFAULT_THIRDPERSON_ONLY_LAYER_MASK;_initialized=!1;constructor(t){this.headBone=t}get firstPersonOnlyLayerMask(){return this._firstPersonOnlyLayerMask}get thirdPersonOnlyLayerMask(){return this._thirdPersonOnlyLayerMask}setup(t={}){this._initialized||(this._initialized=!0,this._firstPersonOnlyLayerMask=t.firstPersonOnlyLayerMask??ce.DEFAULT_FIRSTPERSON_ONLY_LAYER_MASK,this._thirdPersonOnlyLayerMask=t.thirdPersonOnlyLayerMask??ce.DEFAULT_THIRDPERSON_ONLY_LAYER_MASK,this.meshAnnotations.forEach(i=>{i.meshes.forEach(r=>{switch(i.type){case"firstPersonOnly":r.layerMask=this._firstPersonOnlyLayerMask;break;case"thirdPersonOnly":r.layerMask=this._thirdPersonOnlyLayerMask;break;case"auto":this.createHeadlessModel(r)}})}))}dispose(){for(;this.createdMeshes.length>0;)this.createdMeshes.pop().dispose();this.meshAnnotations=null}createHeadlessModel(t){if(!t.skeleton||!t.isVerticesDataPresent(B.MatricesIndicesKind)){Xi(t,this.headBone)&&(t.layerMask=this._thirdPersonOnlyLayerMask);return}let i=[];if(t.skeleton.bones.forEach((a,n)=>{Xi(a,this.headBone)&&i.push(n)}),i.length===0){t.layerMask|=this._firstPersonOnlyLayerMask|this._thirdPersonOnlyLayerMask;return}t.layerMask=this._thirdPersonOnlyLayerMask;let r=Pn(t,i);r&&(r.layerMask=this._firstPersonOnlyLayerMask,this.createdMeshes.push(r))}},Rn=class extends Error{boneName;name="BoneNotFoundError";constructor(e){super(`Bone:${e} NotFound`),this.boneName=e}};function Cn(e){switch(e){case"Both":return"both";case"ThirdPersonOnly":return"thirdPersonOnly";case"FirstPersonOnly":return"firstPersonOnly";default:return"auto"}}var Nn=class extends ur{constructor(e,t,i){super(t),(e?.meshAnnotations??[]).forEach(r=>{let a=i(r.mesh);!a||a.length===0||this.meshAnnotations.push({meshes:a,type:Cn(r.firstPersonFlag)})})}},Ln=class{nodeMap;constructor(e){this.nodeMap=e}dispose(){this.nodeMap=null}get hips(){return this.getMandatoryBone("hips")}get leftUpperLeg(){return this.getMandatoryBone("leftUpperLeg")}get rightUpperLeg(){return this.getMandatoryBone("rightUpperLeg")}get leftLowerLeg(){return this.getMandatoryBone("leftLowerLeg")}get rightLowerLeg(){return this.getMandatoryBone("rightLowerLeg")}get leftFoot(){return this.getMandatoryBone("leftFoot")}get rightFoot(){return this.getMandatoryBone("rightFoot")}get spine(){return this.getMandatoryBone("spine")}get chest(){return this.getMandatoryBone("chest")}get neck(){return this.getMandatoryBone("neck")}get head(){return this.getMandatoryBone("head")}get leftShoulder(){return this.getMandatoryBone("leftShoulder")}get rightShoulder(){return this.getMandatoryBone("rightShoulder")}get leftUpperArm(){return this.getMandatoryBone("leftUpperArm")}get rightUpperArm(){return this.getMandatoryBone("rightUpperArm")}get leftLowerArm(){return this.getMandatoryBone("leftLowerArm")}get rightLowerArm(){return this.getMandatoryBone("rightLowerArm")}get leftHand(){return this.getMandatoryBone("leftHand")}get rightHand(){return this.getMandatoryBone("rightHand")}get leftToes(){return this.getOptionalBone("leftToes")}get rightToes(){return this.getOptionalBone("rightToes")}get leftEye(){return this.getOptionalBone("leftEye")}get rightEye(){return this.getOptionalBone("rightEye")}get jaw(){return this.getOptionalBone("jaw")}get leftThumbProximal(){return this.getOptionalBone("leftThumbProximal")}get leftThumbIntermediate(){return this.getOptionalBone("leftThumbIntermediate")}get leftThumbDistal(){return this.getOptionalBone("leftThumbDistal")}get leftIndexProximal(){return this.getOptionalBone("leftIndexProximal")}get leftIndexIntermediate(){return this.getOptionalBone("leftIndexIntermediate")}get leftIndexDistal(){return this.getOptionalBone("leftIndexDistal")}get leftMiddleProximal(){return this.getOptionalBone("leftMiddleProximal")}get leftMiddleIntermediate(){return this.getOptionalBone("leftMiddleIntermediate")}get leftMiddleDistal(){return this.getOptionalBone("leftMiddleDistal")}get leftRingProximal(){return this.getOptionalBone("leftRingProximal")}get leftRingIntermediate(){return this.getOptionalBone("leftRingIntermediate")}get leftRingDistal(){return this.getOptionalBone("leftRingDistal")}get leftLittleProximal(){return this.getOptionalBone("leftLittleProximal")}get leftLittleIntermediate(){return this.getOptionalBone("leftLittleIntermediate")}get leftLittleDistal(){return this.getOptionalBone("leftLittleDistal")}get rightThumbProximal(){return this.getOptionalBone("rightThumbProximal")}get rightThumbIntermediate(){return this.getOptionalBone("rightThumbIntermediate")}get rightThumbDistal(){return this.getOptionalBone("rightThumbDistal")}get rightIndexProximal(){return this.getOptionalBone("rightIndexProximal")}get rightIndexIntermediate(){return this.getOptionalBone("rightIndexIntermediate")}get rightIndexDistal(){return this.getOptionalBone("rightIndexDistal")}get rightMiddleProximal(){return this.getOptionalBone("rightMiddleProximal")}get rightMiddleIntermediate(){return this.getOptionalBone("rightMiddleIntermediate")}get rightMiddleDistal(){return this.getOptionalBone("rightMiddleDistal")}get rightRingProximal(){return this.getOptionalBone("rightRingProximal")}get rightRingIntermediate(){return this.getOptionalBone("rightRingIntermediate")}get rightRingDistal(){return this.getOptionalBone("rightRingDistal")}get rightLittleProximal(){return this.getOptionalBone("rightLittleProximal")}get rightLittleIntermediate(){return this.getOptionalBone("rightLittleIntermediate")}get rightLittleDistal(){return this.getOptionalBone("rightLittleDistal")}get upperChest(){return this.getOptionalBone("upperChest")}getMandatoryBone(e){let t=this.nodeMap[e];if(!t)throw new Rn(e);return t}getOptionalBone(e){return this.nodeMap&&this.nodeMap[e]||null}},Dn=(e,t,i,r,a)=>{let n=a*a*a,s=a*a,o=t-e,u=-2*n+3*s,g=n-2*s+a,c=n-s;return e+o*u+i*g+r*c},On=(e,t)=>{if(e.length<8)throw Error("evaluateCurve: Invalid curve detected! (Array length must be 8 at least)");if(e.length%4!=0)throw Error("evaluateCurve: Invalid curve detected! (Array length must be multiples of 4");let i;for(i=0;;i++){if(e.length<=4*i)return e[4*i-3];if(t<=e[4*i])break}let r=i-1;if(r<0)return e[4*r+5];let a=e[4*r],n=e[4*i],s=(t-a)/(n-a),o=e[4*r+1],u=e[4*i+1],g=e[4*r+3],c=e[4*i+2];return Dn(o,u,g,c,s)},bn=class{curve=[0,0,0,1,1,1,1,0];curveXRangeDegree=90;curveYRangeDegree=10;constructor(e,t,i){e!==void 0&&(this.curveXRangeDegree=e),t!==void 0&&(this.curveYRangeDegree=t),i!==void 0&&(this.curve=i)}map(e){let t=Math.min(Math.max(e,0),this.curveXRangeDegree)/this.curveXRangeDegree;return this.curveYRangeDegree*On(this.curve,t)}};function fr(e){let t=e;return t.getAbsolutePosition?t.getAbsolutePosition():t.globalPosition??null}var $={LookUp:"lookup",LookDown:"lookdown",LookLeft:"lookleft",LookRight:"lookright"},Bi=(function(e){return e.VRM_USE_GLTFSHADER="VRM_USE_GLTFSHADER",e.VRMMToon="VRM/MToon",e.VRMUnlitTransparentZWrite="VRM/UnlitTransparentZWrite",e})({}),_e=Math.PI/180,yn=class{curveHorizontalInner;curveHorizontalOuter;curveVerticalDown;curveVerticalUp;type="Bone";leftEye;rightEye;restQuatLeftEye=S.Identity();restQuatRightEye=S.Identity();constructor(e,t,i,r,a,n){this.curveHorizontalInner=i,this.curveHorizontalOuter=r,this.curveVerticalDown=a,this.curveVerticalUp=n,this.leftEye=e,this.rightEye=t,e&&e.rotationQuaternion&&(this.restQuatLeftEye=e.rotationQuaternion.clone()),t&&t.rotationQuaternion&&(this.restQuatRightEye=t.rotationQuaternion.clone())}applyYawPitch(e,t){this.leftEye&&this.applyEuler(this.leftEye,this.restQuatLeftEye,this.calcYawRad(e,this.curveHorizontalInner,this.curveHorizontalOuter),this.calcPitchRad(t)),this.rightEye&&this.applyEuler(this.rightEye,this.restQuatRightEye,this.calcYawRad(e,this.curveHorizontalOuter,this.curveHorizontalInner),this.calcPitchRad(t))}calcYawRad(e,t,i){return e<0?-_e*t.map(-e):_e*i.map(e)}calcPitchRad(e){return e<0?-_e*this.curveVerticalDown.map(-e):_e*this.curveVerticalUp.map(e)}applyEuler(e,t,i,r){let a=S.RotationYawPitchRoll(i,r,0);e.rotationQuaternion=t.multiply(a)}},wn=class{blendShapeProxy;curveHorizontal;curveVerticalDown;curveVerticalUp;type="BlendShape";constructor(e,t,i,r){this.blendShapeProxy=e,this.curveHorizontal=t,this.curveVerticalDown=i,this.curveVerticalUp=r}applyYawPitch(e,t){t<0?(this.blendShapeProxy.morphingPreset($.LookUp,0),this.blendShapeProxy.morphingPreset($.LookDown,this.curveVerticalDown.map(-t))):(this.blendShapeProxy.morphingPreset($.LookDown,0),this.blendShapeProxy.morphingPreset($.LookUp,this.curveVerticalUp.map(t))),e<0?(this.blendShapeProxy.morphingPreset($.LookLeft,0),this.blendShapeProxy.morphingPreset($.LookRight,this.curveHorizontal.map(-e))):(this.blendShapeProxy.morphingPreset($.LookRight,0),this.blendShapeProxy.morphingPreset($.LookLeft,this.curveHorizontal.map(e)))}},ki=180/Math.PI,Gi=Math.PI/180,Fn=new d,Un=new d,Wn=new W,Vn=class{autoUpdate=!0;target=null;applier;firstPersonBone;firstPersonBoneOffset;_yaw=0;_pitch=0;get yaw(){return this._yaw}get pitch(){return this._pitch}constructor(e,t,i,r){this.firstPersonBone=e;let a=t?.firstPersonBoneOffset;this.firstPersonBoneOffset=a?new d(a.x,a.y,a.z):d.Zero(),this.applier=this.constructApplier(t,i,r)}lookAt(e){if(!this.applier||!this.firstPersonBone)return;let t=this.firstPersonBone.getWorldMatrix(),i=d.TransformCoordinatesToRef(this.firstPersonBoneOffset,t,Fn),r=e.subtractToRef(i,Un);if(r.lengthSquared()<1e-12)return;r.normalize();let a=t.invertToRef(Wn),n=d.TransformNormalToRef(r,a,r);n.normalize();let s=Math.atan2(n.y,Math.sqrt(n.x*n.x+n.z*n.z)),o=Math.atan2(-n.x,-n.z);this._yaw=o*ki,this._pitch=s*ki,this.applier.applyYawPitch(this._yaw,this._pitch)}reset(){this._yaw=0,this._pitch=0,this.applier&&this.applier.applyYawPitch(0,0)}update(){if(!this.target||!this.autoUpdate)return;let e=fr(this.target);e&&this.lookAt(e)}getLookAtWorldPosition(){return this.firstPersonBone?d.TransformCoordinates(this.firstPersonBoneOffset,this.firstPersonBone.getWorldMatrix()):null}getLookAtWorldDirection(){if(!this.firstPersonBone)return null;let e=S.RotationYawPitchRoll(this._yaw*Gi,this._pitch*Gi,0),t=new W;e.toRotationMatrix(t);let i=d.TransformNormal(d.Backward(),t);return d.TransformNormal(i,this.firstPersonBone.getWorldMatrix()).normalize()}constructApplier(e,t,i){if(!e)return null;let r=e.lookAtHorizontalInner,a=e.lookAtHorizontalOuter,n=e.lookAtVerticalDown,s=e.lookAtVerticalUp;if(!a||!n||!s)return null;switch(e.lookAtTypeName){case"Bone":return r?new yn(t.leftEye,t.rightEye,q(r),q(a),q(n),q(s)):null;case"BlendShape":return new wn(i,q(a),q(n),q(s));default:return null}}};function q(e){return new bn(typeof e.xRange=="number"?e.xRange:void 0,typeof e.yRange=="number"?e.yRange:void 0,e.curve)}function Xn(){return[{label:"DiffuseColor",propertyName:"diffuseColor",type:E.Color3},{label:"AmbientColor",propertyName:"ambientColor",type:E.Color3},{label:"EmissiveColor",propertyName:"emissiveColor",type:E.Color3},{label:"ShadeColor",propertyName:"shadeColor",type:E.Color3},{label:"RimColor",propertyName:"rimColor",type:E.Color3},{label:"OutlineColor",propertyName:"outlineColor",type:E.Color3},{label:"ReceiveShadowRate",propertyName:"receiveShadowRate",type:E.Slider,min:0,max:1,step:.01},{label:"ShadingGradeRate",propertyName:"shadingGradeRate",type:E.Slider,min:0,max:1,step:.01},{label:"ShadeShift",propertyName:"shadeShift",type:E.Slider,min:-1,max:1,step:.01},{label:"ShadeToony",propertyName:"shadeToony",type:E.Slider,min:0,max:1,step:.01},{label:"LightColorAttenuation",propertyName:"lightColorAttenuation",type:E.Slider,min:0,max:1,step:.01},{label:"IndirectLightIntensity",propertyName:"indirectLightIntensity",type:E.Slider,min:0,max:1,step:.01},{label:"RimLightingMix",propertyName:"rimLightingMix",type:E.Slider,min:0,max:1,step:.01},{label:"RimFresnelPower",propertyName:"rimFresnelPower",type:E.Slider,min:.01,max:100,step:4},{label:"RimLift",propertyName:"rimLift",type:E.Slider,min:0,max:1,step:.01},{label:"OutlineWidth",propertyName:"outlineWidth",type:E.Slider,min:.01,max:1,step:.01},{label:"OutlineScaledMaxDistance",propertyName:"outlineScaledMaxDistance",type:E.Slider,min:1,max:10,step:.01},{label:"OutlineLightingMix",propertyName:"outlineLightingMix",type:E.Slider,min:0,max:1,step:.01},{label:"DebugMode",propertyName:"debugMode",type:E.Slider,min:0,max:2,step:1},{label:"OutlineWidthMode",propertyName:"outlineWidthMode",type:E.Slider,min:0,max:2,step:1},{label:"OutlineColorMode",propertyName:"outlineColorMode",type:E.Slider,min:0,max:1,step:1},{label:"CullMode",propertyName:"cullMode",type:E.Slider,min:0,max:2,step:1},{label:"OutlineCullMode",propertyName:"outlineCullMode",type:E.Slider,min:0,max:2,step:1},{label:"AlphaCutOff",propertyName:"alphaCutOff",type:E.Slider,min:0,max:1,step:.01},{label:"UV Animation Scroll X",propertyName:"uvAnimationScrollX",type:E.Slider,min:-1,max:1,step:.1},{label:"UV Animation Scroll Y",propertyName:"uvAnimationScrollY",type:E.Slider,min:-1,max:1,step:.1},{label:"UV Animation Rotation",propertyName:"uvAnimationRotation",type:E.Slider,min:-.5,max:.5,step:.01}]}var Bn="MToonOutline",kn=class cr{scene;material;static rendererId=0;name;_engine;_renderPassId;constructor(t,i){this.scene=t,this.material=i,this.name=`${Bn}_${i.name}_${cr.rendererId++}`,this.scene._addComponent(this),this._engine=this.scene.getEngine(),this._renderPassId=this._engine.createRenderPassId("Outline Renderer")}register(){this.scene._afterRenderingMeshStage.registerStep(pn.STEP_AFTERRENDERINGMESH_OUTLINE,this,this._afterRenderingMesh)}rebuild(){}dispose(){this._engine.releaseRenderPassId(this._renderPassId)}render(t,i,r){r??=this._renderPassId;let a=t.effect;if(!a||!a.isReady()||!this.scene.activeCamera)return;let n=t._getDrawWrapper(r,!0);if(!n||(n.setEffect(a),!n.effect||!n.effect.isReady()))return;let s=t.getMesh(),o=s._internalAbstractMeshDataInfo._actAsRegularMesh?s:null,u=t.getRenderingMesh(),g=o||u;this.material.applyOutlineCullMode(),this.material.enableOutlineRender(),this._engine.enableEffect(n),this.isHardwareInstancedRendering(t,i)||u._bind(t,a,this.material.fillMode),this.material._preBind(a),u._processRendering(g,t,a,this.material.fillMode,i,this.isHardwareInstancedRendering(t,i),(c,m,v)=>{v&&v.bindForSubMesh(m,g,t)},this.material),this.material.restoreOutlineCullMode(),this.material.disaableOutlineRender()}_afterRenderingMesh(t,i,r){if(!this.willRender(i))return;let a=this._engine.cullBackFaces;this._engine.cullBackFaces=!1,this.render(i,r,this._renderPassId),this._engine.cullBackFaces=a}isHardwareInstancedRendering(t,i){return!this._engine.getCaps().instancedArrays||i.visibleInstances[t._id]===null||i.visibleInstances[t._id]===void 0?!1:t.getRenderingMesh().hasThinInstances}willRender(t){let i=t.getMaterial();return!(!i||i.getClassName()!=="MToonMaterial"||i.getOutlineRendererName()!==this.name)}},Gn=class extends gn{CUSTOMUSERLIGHTING=!0;MTOON_OUTLINE_WIDTH_WORLD=!1;MTOON_OUTLINE_WIDTH_SCREEN=!1;MTOON_OUTLINE_COLOR_FIXED=!1;MTOON_OUTLINE_COLOR_MIXED=!1;MTOON_DEBUG_NORMAL=!1;MTOON_DEBUG_LITSHADERRATE=!1;SHADE=!1;SHADEDIRECTUV=0;RECEIVE_SHADOW=!1;RECEIVE_SHADOWDIRECTUV=0;SHADING_GRADE=!1;SHADING_GRADEDIRECTUV=0;SHADING_SHIFT=!1;SHADING_SHIFTDIRECTUV=0;RIM=!1;RIMDIRECTUV=0;MATCAP=!1;MATCAPDIRECTUV=0;OUTLINE_WIDTH=!1;OUTLINE_WIDTHDIRECTUV=0;UV_ANIMATION_MASK=!1;UV_ANIMATION_MASKDIRECTUV=0;MAINUV1=!1;MAINUV2=!1;MAINUV3=!1;MAINUV4=!1;MAINUV5=!1;MAINUV6=!1;DIFFUSE=!1;DIFFUSEDIRECTUV=0;BAKED_VERTEX_ANIMATION_TEXTURE=!1;EMISSIVE=!1;EMISSIVEDIRECTUV=0;BUMP=!1;BUMPDIRECTUV=0;PARALLAX=!1;PARALLAXOCCLUSION=!1;CLIPPLANE=!1;CLIPPLANE2=!1;CLIPPLANE3=!1;CLIPPLANE4=!1;CLIPPLANE5=!1;CLIPPLANE6=!1;ALPHATEST=!1;DEPTHPREPASS=!1;ALPHAFROMDIFFUSE=!1;POINTSIZE=!1;FOG=!1;NORMAL=!1;UV1=!1;UV2=!1;UV3=!1;UV4=!1;UV5=!1;UV6=!1;VERTEXCOLOR=!1;VERTEXALPHA=!1;NUM_BONE_INFLUENCERS=0;BonesPerMesh=0;BONETEXTURE=!1;BONES_VELOCITY_ENABLED=!1;INSTANCES=!1;THIN_INSTANCES=!1;OBJECTSPACE_NORMALMAP=!1;LOGARITHMICDEPTH=!1;TWOSIDEDLIGHTING=!1;SHADOWFLOAT=!1;MORPHTARGETS=!1;MORPHTARGETS_POSITION=!1;MORPHTARGETS_NORMAL=!1;MORPHTARGETS_TANGENT=!1;MORPHTARGETS_UV=!1;MORPHTARGETS_UV2=!1;MORPHTARGETS_COLOR=!1;NUM_MORPH_INFLUENCERS=0;MORPHTARGETS_TEXTURE=!1;MORPHTARGETTEXTURE_HASPOSITIONS=!1;MORPHTARGETTEXTURE_HASNORMALS=!1;MORPHTARGETTEXTURE_HASUVS=!1;MORPHTARGETTEXTURE_HASTANGENTS=!1;MORPHTARGETTEXTURE_HASUV2S=!1;MORPHTARGETTEXTURE_HASCOLORS=!1;NONUNIFORMSCALING=!1;PREMULTIPLYALPHA=!1;ALPHATEST_AFTERALLALPHACOMPUTATIONS=!1;ALPHABLEND=!0;PREPASS=!1;PREPASS_IRRADIANCE=!1;PREPASS_IRRADIANCE_INDEX=-1;PREPASS_ALBEDO_SQRT=!1;PREPASS_ALBEDO_SQRT_INDEX=-1;PREPASS_DEPTH=!1;PREPASS_DEPTH_INDEX=-1;PREPASS_NORMAL=!1;PREPASS_NORMAL_INDEX=-1;PREPASS_POSITION=!1;PREPASS_POSITION_INDEX=-1;PREPASS_VELOCITY=!1;PREPASS_VELOCITY_INDEX=-1;PREPASS_REFLECTIVITY=!1;PREPASS_REFLECTIVITY_INDEX=-1;SCENE_MRT_COUNT=0;IMAGEPROCESSING=!1;VIGNETTE=!1;VIGNETTEBLENDMODEMULTIPLY=!1;VIGNETTEBLENDMODEOPAQUE=!1;TONEMAPPING=0;TONEMAPPING_ACES=!1;CONTRAST=!1;COLORCURVES=!1;COLORGRADING=!1;COLORGRADING3D=!1;SAMPLER3DGREENDEPTH=!1;SAMPLER3DBGRMAP=!1;DITHER=!1;IMAGEPROCESSINGPOSTPROCESS=!1;SKIPFINALCOLORCLAMP=!1;MULTIVIEW=!1;ORDER_INDEPENDENT_TRANSPARENCY=!1;ORDER_INDEPENDENT_TRANSPARENCY_16BITS=!1;IS_REFLECTION_LINEAR=!1;IS_REFRACTION_LINEAR=!1;EXPOSURE=!1;FLIP_U=!1;FLIP_V=!1;constructor(e){super(e),this.rebuild()}setReflectionMode(e){throw Error("This material cannot use `setReflectionMode`")}},Hn=`// it will be replaced to UboDeclaration(WebGL2) or VertexDeclaration(WebGL1).\r
\r
layout(std140, column_major) uniform;\r
\r
uniform Material\r
{\r
    // Color & Texture\r
    vec4 vDiffuseColor;\r
    vec2 vDiffuseInfos;\r
    mat4 diffuseMatrix;\r
    vec4 vEmissiveColor;\r
    vec2 vEmissiveInfos;\r
    mat4 emissiveMatrix;\r
    vec3 vBumpInfos;\r
    mat4 bumpMatrix;\r
    vec3 vShadeColor;\r
    vec3 vMatcapColor;\r
    vec2 vShadeInfos;\r
    mat4 shadeMatrix;\r
    vec2 vReceiveShadowInfos;\r
    mat4 receiveShadowMatrix;\r
    vec2 vShadingGradeInfos;\r
    mat4 shadingGradeMatrix;\r
    vec2 vShadingShiftInfos;\r
    mat4 shadingShiftMatrix;\r
    vec3 vRimColor;\r
    vec2 vRimInfos;\r
    mat4 rimMatrix;\r
    vec2 vMatCapInfos;\r
    mat4 matCapMatrix;\r
    vec4 vOutlineColor;\r
    vec2 vOutlineWidthInfos;\r
    mat4 outlineWidthMatrix;\r
    vec2 vUvAnimationMaskInfos;\r
    mat4 uvAnimationMaskMatrix;\r
\r
    // babylon specific\r
    vec2 vTangentSpaceParams;\r
    float pointSize;\r
\r
    // MToon params\r
    float shadingGradeRate;\r
    float receiveShadowRate;\r
    float shadeShift;\r
    float shadeToony;\r
    float shadingShiftTextureScale;\r
    float lightColorAttenuation;\r
    float indirectLightIntensity;\r
    float rimLightingMix;\r
    float rimFresnelPower;\r
    float rimLift;\r
    float outlineWidth;\r
    float outlineScaledMaxDistance;\r
    float outlineLightingMix;\r
    float uvAnimationScrollX;\r
    float uvAnimationScrollY;\r
    float uvAnimationRotation;\r
\r
    vec3 vEyeUp;\r
    float alphaCutOff;\r
    vec3 vAmbientColor;\r
    float aspect;\r
    float isOutline;\r
    vec4 time;\r
};\r
\r
// babylon specific\r
#include<sceneUboDeclaration>\r
#include<meshUboDeclaration>\r
`,zn=`// Uniforms\r
uniform mat4 viewProjection;\r
uniform mat4 view;\r
uniform mat4 projection;\r
uniform float outlineWidth;\r
uniform float outlineScaledMaxDistance;\r
uniform float outlineLightingMix;\r
uniform float isOutline;\r
uniform float aspect;\r
\r
#ifdef DIFFUSE\r
uniform mat4 diffuseMatrix;\r
uniform vec2 vDiffuseInfos;\r
#endif\r
\r
#ifdef EMISSIVE\r
uniform vec2 vEmissiveInfos;\r
uniform mat4 emissiveMatrix;\r
#endif\r
\r
#ifdef BUMP\r
uniform vec3 vBumpInfos;\r
uniform mat4 bumpMatrix;\r
#endif\r
\r
#ifdef SHADE\r
uniform vec2 vShadeInfos;\r
uniform mat4 shadeMatrix;\r
#endif\r
\r
#ifdef RECEIVE_SHADOW\r
uniform vec2 vReceiveShadowInfos;\r
uniform mat4 receiveShadowMatrix;\r
#endif\r
\r
#ifdef SHADING_GRADE\r
uniform vec2 vShadingGradeInfos;\r
uniform mat4 shadingGradeMatrix;\r
#endif\r
\r
#ifdef SHADING_SHIFT\r
uniform vec2 vShadingShiftInfos;\r
uniform mat4 shadingShiftMatrix;\r
#endif\r
\r
#ifdef RIM\r
uniform vec2 vRimInfos;\r
uniform mat4 rimMatrix;\r
#endif\r
\r
#ifdef MATCAP\r
uniform vec2 vMatCapInfos;\r
uniform mat4 matCapMatrix;\r
#endif\r
\r
#ifdef OUTLINE_WIDTH\r
uniform vec2 vOutlineWidthInfos;\r
uniform mat4 outlineWidthMatrix;\r
#endif\r
\r
#ifdef UV_ANIMATION_MASK\r
uniform vec2 vUvAnimationMaskInfos;\r
uniform mat4 uvAnimationMaskMatrix;\r
#endif\r
\r
#ifdef POINTSIZE\r
uniform float pointSize;\r
#endif\r
`,Yn=`uniform vec4 vEyePosition;\r
\r
// Colors\r
uniform vec4 vDiffuseColor;\r
uniform vec3 vEmissiveColor;\r
uniform vec3 vShadeColor;\r
uniform vec3 vMatcapColor;\r
uniform vec3 vRimColor;\r
uniform vec4 vOutlineColor;\r
uniform vec3 vAmbientColor;\r
\r
uniform vec3 vEyeUp;\r
uniform float aspect;\r
uniform float alphaCutOff;\r
uniform float visibility;\r
uniform float isOutline;\r
uniform vec4 time;\r
\r
// Samplers\r
#ifdef DIFFUSE\r
uniform vec2 vDiffuseInfos;\r
#endif\r
\r
#ifdef EMISSIVE\r
uniform vec2 vEmissiveInfos;\r
#endif\r
\r
#ifdef BUMP\r
uniform vec3 vBumpInfos;\r
uniform vec2 vTangentSpaceParams;\r
#endif\r
\r
#ifdef SHADE\r
uniform vec2 vShadeInfos;\r
#endif\r
\r
#ifdef RECEIVE_SHADOW\r
uniform vec2 vReceiveShadowInfos;\r
#endif\r
\r
#ifdef SHADING_GRADE\r
uniform vec2 vShadingGradeInfos;\r
#endif\r
\r
#ifdef SHADING_SHIFT\r
uniform vec2 vShadingShiftInfos;\r
#endif\r
\r
#ifdef RIM\r
uniform vec2 vRimInfos;\r
#endif\r
\r
#ifdef MATCAP\r
uniform vec2 vMatCapInfos;\r
#endif\r
\r
#ifdef OUTLINE_WIDTH\r
uniform vec2 vOutlineWidthInfos;\r
#endif\r
\r
#ifdef UV_ANIMATION_MASK\r
uniform vec2 vUvAnimationMaskInfos;\r
#endif\r
\r
// MToon params\r
uniform float shadingGradeRate;\r
uniform float receiveShadowRate;\r
uniform float shadeShift;\r
uniform float shadeToony;\r
uniform float shadingShiftTextureScale;\r
uniform float lightColorAttenuation;\r
uniform float indirectLightIntensity;\r
uniform float rimLightingMix;\r
uniform float rimFresnelPower;\r
uniform float rimLift;\r
uniform float outlineWidth;\r
uniform float outlineScaledMaxDistance;\r
uniform float outlineLightingMix;\r
uniform float uvAnimationScrollX;\r
uniform float uvAnimationScrollY;\r
uniform float uvAnimationRotation;\r
`,Qn=`\r
/**\r
* Compute Directional or Point light direction\r
*/\r
vec3 computeLightDirection(vec4 lightData) {\r
    return normalize(mix(lightData.xyz - vPositionW, -lightData.xyz, lightData.w));\r
}\r
\r
/**\r
* Compute Spot Light direction\r
*/\r
vec3 computeSpotLightDirection(vec4 lightData) {\r
    return normalize(lightData.xyz - vPositionW);\r
}\r
\r
/**\r
* Compute Hemispheric light direction\r
*/\r
vec3 computeHemisphericLightDirection(vec4 lightData, vec3 vNormal) {\r
    return normalize(lightData.xyz);\r
}\r
\r
/**\r
* Compute MToon diffuse lighting\r
*/\r
vec4 computeMToonDiffuseLighting(vec3 worldView, vec3 worldNormal, vec2 mainUv, vec3 lightDirection, vec4 lightDiffuse, float shadowAttenuation) {\r
    float _receiveShadow = receiveShadowRate;\r
#ifdef RECEIVE_SHADOW\r
    _receiveShadow = _receiveShadow * texture2D(receiveShadowSampler, mainUv).r * vReceiveShadowInfos.y;\r
#endif\r
\r
    float _shadingGrade = 0.0;\r
#ifdef SHADING_GRADE\r
    _shadingGrade = 1.0 - texture2D(shadingGradeSampler, mainUv).r * vShadingGradeInfos.y;\r
#endif\r
    _shadingGrade = 1.0 - shadingGradeRate * _shadingGrade;\r
\r
    // Lighting\r
    vec3 _lightColor = lightDiffuse.rgb * step(0.5, length(lightDirection)); // length(lightDir) is zero if directional light is disabled.\r
    float _dotNL = dot(lightDirection, worldNormal);\r
#ifdef MTOON_FORWARD_ADD\r
    float _lightAttenuation = 1.0;\r
#else\r
    float _lightAttenuation = shadowAttenuation * mix(1.0, shadowAttenuation, _receiveShadow);\r
#endif\r
\r
    // lighting intensity\r
    float _lightIntensity = _dotNL;\r
    _lightIntensity = _lightIntensity * 0.5 + 0.5; // from [-1, +1] to [0, 1]\r
    _lightIntensity = _lightIntensity * _lightAttenuation; // receive shadow\r
    _lightIntensity = _lightIntensity * _shadingGrade; // darker\r
    _lightIntensity = _lightIntensity * 2.0 - 1.0; // from [0, 1] to [-1, +1]\r
#ifdef SHADING_SHIFT\r
    // MToon 1.0: shadingShiftFactor + shadingShiftTexture.r * shadingShiftTextureScale\r
    _lightIntensity += texture2D(shadingShiftSampler, mainUv).r * vShadingShiftInfos.y * shadingShiftTextureScale;\r
#endif\r
    // tooned. mapping from [minIntensityThreshold, maxIntensityThreshold] to [0, 1]\r
    float _maxIntensityThreshold = mix(1.0, shadeShift, shadeToony);\r
    float _minIntensityThreshold = shadeShift;\r
    _lightIntensity = clamp((_lightIntensity - _minIntensityThreshold) / max(EPS_COL, (_maxIntensityThreshold - _minIntensityThreshold)), 0.0, 1.0);\r
\r
    // Albedo color\r
    vec3 _shade = vShadeColor;\r
#ifdef SHADE\r
    _shade = _shade * texture2D(shadeSampler, mainUv).rgb * vShadeInfos.y;\r
#endif\r
\r
    vec4 _lit = vDiffuseColor;\r
#ifdef DIFFUSE\r
    _lit = _lit * texture2D(diffuseSampler, mainUv) * vDiffuseInfos.y;\r
#endif\r
    vec3 _col = mix(_shade.rgb, _lit.rgb, _lightIntensity);\r
\r
    // Direct Light\r
    vec3 _lighting = _lightColor;\r
    _lighting = mix(_lighting, vec3(max(EPS_COL, max(_lighting.x, max(_lighting.y, _lighting.z)))), lightColorAttenuation); // color atten\r
#ifdef MTOON_FORWARD_ADD\r
    _lighting *= 0.5; // darken if additional light\r
    _lighting *= min(0, dotNL) + 1.0; // darken dotNL < 0 area by using half lambert\r
    _lighting *= shadowAttenuation; // darken if receiving shadow\r
#else\r
    // base light does not darken.\r
#endif\r
    _col *= _lighting;\r
\r
    // Indirect Light\r
#ifdef MTOON_FORWARD_ADD\r
#else\r
    vec3 _toonedGI = vAmbientColor.rgb; // TODO: GI\r
    vec3 _indirectLighting = mix(_toonedGI, vAmbientColor.rgb, indirectLightIntensity);\r
    _indirectLighting = mix(_indirectLighting, vec3(max(EPS_COL, max(_indirectLighting.x, max(_indirectLighting.y, _indirectLighting.z)))), lightColorAttenuation); // color atten\r
    _col += _indirectLighting * _lit.rgb;\r
\r
    _col = min(_col.rgb, _lit.rgb); // comment out if you want to PBR absolutely.\r
#endif\r
\r
    // parametric rim lighting\r
#ifdef MTOON_FORWARD_ADD\r
    vec3 _staticRimLighting = vec3(0.0);\r
    vec3 _mixedRimLighting = _lighting;\r
#else\r
    vec3 _staticRimLighting = vec3(1.0);\r
    vec3 _mixedRimLighting = _lighting + _indirectLighting;\r
#endif\r
    vec3 _rimLighting = mix(_staticRimLighting, _mixedRimLighting, rimLightingMix);\r
    vec3 _rimColor = vRimColor.rgb;\r
#ifdef RIM\r
    _rimColor = _rimColor * texture2D(rimSampler, vRimUV + mainUv).rgb * vRimInfos.y;\r
#endif\r
    vec3 _rim = pow(clamp(1.0 - dot(worldNormal, worldView) + rimLift, 0.0, 1.0), rimFresnelPower) * _rimColor.rgb;\r
    _col += mix(_rim * _rimLighting, vec3(0.0), isOutline);\r
\r
    // additive matcap\r
#ifdef MTOON_FORWARD_ADD\r
#else\r
#ifdef MATCAP\r
    vec3 _worldViewUp = normalize(vEyeUp - worldView * dot(worldView, vEyeUp));\r
    vec3 _worldViewRight = normalize(cross(worldView, _worldViewUp));\r
    vec2 _matCapUv = vec2(dot(_worldViewRight, worldNormal), dot(_worldViewUp, worldNormal)) * 0.5 + 0.5;\r
    // uv.y is reversed\r
    _matCapUv.y = (1.0 - _matCapUv.y);\r
    vec3 _matCapLighting = texture2D(matCapSampler, _matCapUv).rgb * vMatCapInfos.y * vMatcapColor;\r
    _col += mix(_matCapLighting, vec3(0.0), isOutline);\r
#endif\r
#endif\r
\r
    // Emission\r
#ifdef MTOON_FORWARD_ADD\r
#else\r
    vec3 _emission = vEmissiveColor.rgb;\r
#ifdef EMISSIVE\r
    _emission *= texture2D(emissiveSampler, mainUv).rgb * vEmissiveInfos.y;\r
#endif\r
    _col += mix(_emission, vec3(0.0), isOutline);\r
#endif\r
\r
    float _alpha = 1.0;\r
\r
#if defined(ALPHABLEND) || defined(ALPHATEST)\r
    _alpha = mix(_lit.a, _lit.a * vOutlineColor.a, isOutline);\r
#endif\r
\r
    // outline\r
#ifdef MTOON_OUTLINE_COLOR_FIXED\r
    _col = mix(_col, vOutlineColor.rgb, isOutline);\r
#elif defined(MTOON_OUTLINE_COLOR_MIXED)\r
    _col = mix(_col, vOutlineColor.rgb * mix(vec3(1.0), _col, outlineLightingMix), isOutline);\r
#else\r
#endif\r
\r
    // debug\r
#ifdef MTOON_DEBUG_NORMAL\r
    #ifdef MTOON_FORWARD_ADD\r
        return vec4(0.0);\r
    #else\r
        return vec4(worldNormal * 0.5 + 0.5, _lit.a);\r
    #endif\r
#elif defined(MTOON_DEBUG_LITSHADERATE)\r
    #ifdef MTOON_FORWARD_ADD\r
        return vec4(0.0);\r
    #else\r
        return vec4(_lightIntensity, _lit.a);\r
    #endif\r
#endif\r
\r
    return vec4(_col, _alpha);\r
}\r
`,$n=`// replace vBumpUV to mainUv\r
vec2 uvOffset = vec2(0.0, 0.0);\r
\r
#if defined(BUMP) || defined(PARALLAX) || defined(DETAIL)\r
    #ifdef NORMALXYSCALE\r
        float normalScale = 1.0;\r
    #elif defined(BUMP)\r
        float normalScale = vBumpInfos.y;\r
    #else\r
        float normalScale = 1.0;\r
    #endif\r
\r
    #if defined(TANGENT) && defined(NORMAL)\r
        mat3 TBN = vTBN;\r
    #elif defined(BUMP)\r
        // vec2 TBNUV = gl_FrontFacing ? vBumpUV : -vBumpUV;\r
        vec2 TBNUV = gl_FrontFacing ? mainUv : -mainUv;\r
        mat3 TBN = cotangent_frame(normalW * normalScale, vPositionW, TBNUV, vTangentSpaceParams);\r
    #else\r
        vec2 TBNUV = gl_FrontFacing ? vDetailUV : -vDetailUV;\r
        mat3 TBN = cotangent_frame(normalW * normalScale, vPositionW, TBNUV, vec2(1., 1.));\r
    #endif\r
#elif defined(ANISOTROPIC)\r
    #if defined(TANGENT) && defined(NORMAL)\r
        mat3 TBN = vTBN;\r
    #else\r
        // flip the uv for the backface\r
        vec2 TBNUV = gl_FrontFacing ? vMainUV1 : -vMainUV1;\r
        mat3 TBN = cotangent_frame(normalW, vPositionW, TBNUV, vec2(1., 1.));\r
    #endif\r
#endif\r
\r
#ifdef PARALLAX\r
    mat3 invTBN = transposeMat3(TBN);\r
\r
    #ifdef PARALLAXOCCLUSION\r
        // uvOffset = parallaxOcclusion(invTBN * -viewDirectionW, invTBN * normalW, vBumpUV, vBumpInfos.z);\r
        uvOffset = parallaxOcclusion(invTBN * -viewDirectionW, invTBN * normalW, mainUv, vBumpInfos.z);\r
    #else\r
        uvOffset = parallaxOffset(invTBN * viewDirectionW, vBumpInfos.z);\r
    #endif\r
#endif\r
\r
#ifdef DETAIL\r
    vec4 detailColor = texture2D(detailSampler, vDetailUV + uvOffset);\r
    vec2 detailNormalRG = detailColor.wy * 2.0 - 1.0;\r
    float detailNormalB = sqrt(1. - saturate(dot(detailNormalRG, detailNormalRG)));\r
    vec3 detailNormal = vec3(detailNormalRG, detailNormalB);\r
#endif\r
\r
#ifdef BUMP\r
    #ifdef OBJECTSPACE_NORMALMAP\r
        // normalW = normalize(texture2D(bumpSampler, vBumpUV).xyz  * 2.0 - 1.0);\r
        normalW = normalize(texture2D(bumpSampler, mainUv).xyz  * 2.0 - 1.0);\r
        normalW = normalize(mat3(normalMatrix) * normalW);\r
    #elif !defined(DETAIL)\r
        // normalW = perturbNormal(TBN, texture2D(bumpSampler, vBumpUV + uvOffset).xyz, vBumpInfos.y);\r
        normalW = perturbNormal(TBN, texture2D(bumpSampler, mainUv + uvOffset).xyz, vBumpInfos.y);\r
    #else\r
        // vec3 bumpNormal = texture2D(bumpSampler, vBumpUV + uvOffset).xyz * 2.0 - 1.0;\r
        vec3 bumpNormal = texture2D(bumpSampler, mainUv + uvOffset).xyz * 2.0 - 1.0;\r
        // Reference for normal blending: https://blog.selfshadow.com/publications/blending-in-detail/\r
        #if DETAIL_NORMALBLENDMETHOD == 0 // whiteout\r
            detailNormal.xy *= vDetailInfos.z;\r
            vec3 blendedNormal = normalize(vec3(bumpNormal.xy + detailNormal.xy, bumpNormal.z * detailNormal.z));\r
        #elif DETAIL_NORMALBLENDMETHOD == 1 // RNM\r
            detailNormal.xy *= vDetailInfos.z;\r
            bumpNormal += vec3(0.0, 0.0, 1.0);\r
            detailNormal *= vec3(-1.0, -1.0, 1.0);\r
            vec3 blendedNormal = bumpNormal * dot(bumpNormal, detailNormal) / bumpNormal.z - detailNormal;\r
        #endif\r
        normalW = perturbNormalBase(TBN, blendedNormal, vBumpInfos.y);\r
    #endif\r
#elif defined(DETAIL)\r
        detailNormal.xy *= vDetailInfos.z;\r
        normalW = perturbNormalBase(TBN, detailNormal, vDetailInfos.z);\r
#endif\r
`,jn=`#ifdef LIGHT{X}\r
    #if defined(SHADOWONLY) || defined(LIGHTMAP) && defined(LIGHTMAPEXCLUDED{X}) && defined(LIGHTMAPNOSPECULAR{X})\r
        //No light calculation\r
    #else\r
        #ifdef PBR\r
            // Compute Pre Lighting infos\r
            #ifdef SPOTLIGHT{X}\r
                preInfo = computePointAndSpotPreLightingInfo(light{X}.vLightData, viewDirectionW, normalW);\r
            #elif defined(POINTLIGHT{X})\r
                preInfo = computePointAndSpotPreLightingInfo(light{X}.vLightData, viewDirectionW, normalW);\r
            #elif defined(HEMILIGHT{X})\r
                preInfo = computeHemisphericPreLightingInfo(light{X}.vLightData, viewDirectionW, normalW);\r
            #elif defined(DIRLIGHT{X})\r
                preInfo = computeDirectionalPreLightingInfo(light{X}.vLightData, viewDirectionW, normalW);\r
            #endif\r
\r
            preInfo.NdotV = NdotV;\r
\r
            // Compute Attenuation infos\r
            #ifdef SPOTLIGHT{X}\r
                #ifdef LIGHT_FALLOFF_GLTF{X}\r
                    preInfo.attenuation = computeDistanceLightFalloff_GLTF(preInfo.lightDistanceSquared, light{X}.vLightFalloff.y);\r
                    preInfo.attenuation *= computeDirectionalLightFalloff_GLTF(light{X}.vLightDirection.xyz, preInfo.L, light{X}.vLightFalloff.z, light{X}.vLightFalloff.w);\r
                #elif defined(LIGHT_FALLOFF_PHYSICAL{X})\r
                    preInfo.attenuation = computeDistanceLightFalloff_Physical(preInfo.lightDistanceSquared);\r
                    preInfo.attenuation *= computeDirectionalLightFalloff_Physical(light{X}.vLightDirection.xyz, preInfo.L, light{X}.vLightDirection.w);\r
                #elif defined(LIGHT_FALLOFF_STANDARD{X})\r
                    preInfo.attenuation = computeDistanceLightFalloff_Standard(preInfo.lightOffset, light{X}.vLightFalloff.x);\r
                    preInfo.attenuation *= computeDirectionalLightFalloff_Standard(light{X}.vLightDirection.xyz, preInfo.L, light{X}.vLightDirection.w, light{X}.vLightData.w);\r
                #else\r
                    preInfo.attenuation = computeDistanceLightFalloff(preInfo.lightOffset, preInfo.lightDistanceSquared, light{X}.vLightFalloff.x, light{X}.vLightFalloff.y);\r
                    preInfo.attenuation *= computeDirectionalLightFalloff(light{X}.vLightDirection.xyz, preInfo.L, light{X}.vLightDirection.w, light{X}.vLightData.w, light{X}.vLightFalloff.z, light{X}.vLightFalloff.w);\r
                #endif\r
            #elif defined(POINTLIGHT{X})\r
                #ifdef LIGHT_FALLOFF_GLTF{X}\r
                    preInfo.attenuation = computeDistanceLightFalloff_GLTF(preInfo.lightDistanceSquared, light{X}.vLightFalloff.y);\r
                #elif defined(LIGHT_FALLOFF_PHYSICAL{X})\r
                    preInfo.attenuation = computeDistanceLightFalloff_Physical(preInfo.lightDistanceSquared);\r
                #elif defined(LIGHT_FALLOFF_STANDARD{X})\r
                    preInfo.attenuation = computeDistanceLightFalloff_Standard(preInfo.lightOffset, light{X}.vLightFalloff.x);\r
                #else\r
                    preInfo.attenuation = computeDistanceLightFalloff(preInfo.lightOffset, preInfo.lightDistanceSquared, light{X}.vLightFalloff.x, light{X}.vLightFalloff.y);\r
                #endif\r
            #else\r
                preInfo.attenuation = 1.0;\r
            #endif\r
\r
            // Simulates Light radius for diffuse and spec term\r
            // clear coat is using a dedicated roughness\r
            #ifdef HEMILIGHT{X}\r
                preInfo.roughness = roughness;\r
            #else\r
                preInfo.roughness = adjustRoughnessFromLightProperties(roughness, light{X}.vLightSpecular.a, preInfo.lightDistance);\r
            #endif\r
\r
            // Diffuse contribution\r
            #ifdef HEMILIGHT{X}\r
                info.diffuse = computeHemisphericDiffuseLighting(preInfo, light{X}.vLightDiffuse.rgb, light{X}.vLightGround);\r
            #elif defined(SS_TRANSLUCENCY)\r
                info.diffuse = computeDiffuseAndTransmittedLighting(preInfo, light{X}.vLightDiffuse.rgb, subSurfaceOut.transmittance);\r
            #else\r
                info.diffuse = computeDiffuseLighting(preInfo, light{X}.vLightDiffuse.rgb);\r
            #endif\r
\r
            // Specular contribution\r
            #ifdef SPECULARTERM\r
                #ifdef ANISOTROPIC\r
                    info.specular = computeAnisotropicSpecularLighting(preInfo, viewDirectionW, normalW, anisotropicOut.anisotropicTangent, anisotropicOut.anisotropicBitangent, anisotropicOut.anisotropy, clearcoatOut.specularEnvironmentR0, specularEnvironmentR90, AARoughnessFactors.x, light{X}.vLightDiffuse.rgb);\r
                #else\r
                    info.specular = computeSpecularLighting(preInfo, normalW, clearcoatOut.specularEnvironmentR0, specularEnvironmentR90, AARoughnessFactors.x, light{X}.vLightDiffuse.rgb);\r
                #endif\r
            #endif\r
\r
            // Sheen contribution\r
            #ifdef SHEEN\r
                #ifdef SHEEN_LINKWITHALBEDO\r
                    // BE Carefull: Sheen intensity is replacing the roughness value.\r
                    preInfo.roughness = sheenOut.sheenIntensity;\r
                #else\r
                    #ifdef HEMILIGHT{X}\r
                        preInfo.roughness = sheenOut.sheenRoughness;\r
                    #else\r
                        preInfo.roughness = adjustRoughnessFromLightProperties(sheenOut.sheenRoughness, light{X}.vLightSpecular.a, preInfo.lightDistance);\r
                    #endif\r
                #endif\r
                info.sheen = computeSheenLighting(preInfo, normalW, sheenOut.sheenColor, specularEnvironmentR90, AARoughnessFactors.x, light{X}.vLightDiffuse.rgb);\r
            #endif\r
\r
            // Clear Coat contribution\r
            #ifdef CLEARCOAT\r
                // Simulates Light radius\r
                #ifdef HEMILIGHT{X}\r
                    preInfo.roughness = clearcoatOut.clearCoatRoughness;\r
                #else\r
                    preInfo.roughness = adjustRoughnessFromLightProperties(clearcoatOut.clearCoatRoughness, light{X}.vLightSpecular.a, preInfo.lightDistance);\r
                #endif\r
\r
                info.clearCoat = computeClearCoatLighting(preInfo, clearcoatOut.clearCoatNormalW, clearcoatOut.clearCoatAARoughnessFactors.x, clearcoatOut.clearCoatIntensity, light{X}.vLightDiffuse.rgb);\r
\r
                #ifdef CLEARCOAT_TINT\r
                    // Absorption\r
                    absorption = computeClearCoatLightingAbsorption(clearcoatOut.clearCoatNdotVRefract, preInfo.L, clearcoatOut.clearCoatNormalW, clearcoatOut.clearCoatColor, clearcoatOut.clearCoatThickness, clearcoatOut.clearCoatIntensity);\r
                    info.diffuse *= absorption;\r
                    #ifdef SPECULARTERM\r
                        info.specular *= absorption;\r
                    #endif\r
                #endif\r
\r
                // Apply energy conservation on diffuse and specular term.\r
                info.diffuse *= info.clearCoat.w;\r
                #ifdef SPECULARTERM\r
                    info.specular *= info.clearCoat.w;\r
                #endif\r
                #ifdef SHEEN\r
                    info.sheen *= info.clearCoat.w;\r
                #endif\r
            #endif\r
        #else\r
            #ifdef SPOTLIGHT{X}\r
                info = computeSpotLighting(viewDirectionW, normalW, light{X}.vLightData, light{X}.vLightDirection, light{X}.vLightDiffuse.rgb, light{X}.vLightSpecular.rgb, light{X}.vLightDiffuse.a, glossiness);\r
            #elif defined(HEMILIGHT{X})\r
                info = computeHemisphericLighting(viewDirectionW, normalW, light{X}.vLightData, light{X}.vLightDiffuse.rgb, light{X}.vLightSpecular.rgb, light{X}.vLightGround, glossiness);\r
            #elif defined(POINTLIGHT{X}) || defined(DIRLIGHT{X})\r
                info = computeLighting(viewDirectionW, normalW, light{X}.vLightData, light{X}.vLightDiffuse.rgb, light{X}.vLightSpecular.rgb, light{X}.vLightDiffuse.a, glossiness);\r
            #endif\r
        #endif\r
\r
        #ifdef PROJECTEDLIGHTTEXTURE{X}\r
            info.diffuse *= computeProjectionTextureDiffuseLighting(projectionLightSampler{X}, textureProjectionMatrix{X});\r
        #endif\r
    #endif\r
\r
    #ifdef SHADOW{X}\r
        #ifdef SHADOWCSM{X}\r
            for (int i = 0; i < SHADOWCSMNUM_CASCADES{X}; i++)\r
            {\r
                #ifdef SHADOWCSM_RIGHTHANDED{X}\r
                    diff{X} = viewFrustumZ{X}[i] + vPositionFromCamera{X}.z;\r
                #else\r
                    diff{X} = viewFrustumZ{X}[i] - vPositionFromCamera{X}.z;\r
                #endif\r
                if (diff{X} >= 0.) {\r
                    index{X} = i;\r
                    break;\r
                }\r
            }\r
\r
            #ifdef SHADOWCSMUSESHADOWMAXZ{X}\r
            if (index{X} >= 0)\r
            #endif\r
            {\r
                #if defined(SHADOWPCF{X})\r
                    #if defined(SHADOWLOWQUALITY{X})\r
                        shadow = computeShadowWithCSMPCF1(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                    #elif defined(SHADOWMEDIUMQUALITY{X})\r
                        shadow = computeShadowWithCSMPCF3(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                    #else\r
                        shadow = computeShadowWithCSMPCF5(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                    #endif\r
                #elif defined(SHADOWPCSS{X})\r
                    #if defined(SHADOWLOWQUALITY{X})\r
                        shadow = computeShadowWithCSMPCSS16(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                    #elif defined(SHADOWMEDIUMQUALITY{X})\r
                        shadow = computeShadowWithCSMPCSS32(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                    #else\r
                        shadow = computeShadowWithCSMPCSS64(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                    #endif\r
                #else\r
                    shadow = computeShadowCSM(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                #endif\r
\r
                #ifdef SHADOWCSMDEBUG{X}\r
                    shadowDebug{X} = vec3(shadow) * vCascadeColorsMultiplier{X}[index{X}];\r
                #endif\r
\r
                #ifndef SHADOWCSMNOBLEND{X}\r
                    float frustumLength = frustumLengths{X}[index{X}];\r
                    float diffRatio = clamp(diff{X} / frustumLength, 0., 1.) * cascadeBlendFactor{X};\r
                    if (index{X} < (SHADOWCSMNUM_CASCADES{X} - 1) && diffRatio < 1.)\r
                    {\r
                        index{X} += 1;\r
                        float nextShadow = 0.;\r
                        #if defined(SHADOWPCF{X})\r
                            #if defined(SHADOWLOWQUALITY{X})\r
                                nextShadow = computeShadowWithCSMPCF1(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                            #elif defined(SHADOWMEDIUMQUALITY{X})\r
                                nextShadow = computeShadowWithCSMPCF3(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                            #else\r
                                nextShadow = computeShadowWithCSMPCF5(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                            #endif\r
                        #elif defined(SHADOWPCSS{X})\r
                            #if defined(SHADOWLOWQUALITY{X})\r
                                nextShadow = computeShadowWithCSMPCSS16(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                            #elif defined(SHADOWMEDIUMQUALITY{X})\r
                                nextShadow = computeShadowWithCSMPCSS32(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                            #else\r
                                nextShadow = computeShadowWithCSMPCSS64(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w, lightSizeUVCorrection{X}[index{X}], depthCorrection{X}[index{X}], penumbraDarkness{X});\r
                            #endif\r
                        #else\r
                            nextShadow = computeShadowCSM(float(index{X}), vPositionFromLight{X}[index{X}], vDepthMetric{X}[index{X}], shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
                        #endif\r
\r
                        shadow = mix(nextShadow, shadow, diffRatio);\r
                        #ifdef SHADOWCSMDEBUG{X}\r
                            shadowDebug{X} = mix(vec3(nextShadow) * vCascadeColorsMultiplier{X}[index{X}], shadowDebug{X}, diffRatio);\r
                        #endif\r
                    }\r
                #endif\r
            }\r
        #elif defined(SHADOWCLOSEESM{X})\r
            #if defined(SHADOWCUBE{X})\r
                shadow = computeShadowWithCloseESMCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.depthValues);\r
            #else\r
                shadow = computeShadowWithCloseESM(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.shadowsInfo.w);\r
            #endif\r
        #elif defined(SHADOWESM{X})\r
            #if defined(SHADOWCUBE{X})\r
                shadow = computeShadowWithESMCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.depthValues);\r
            #else\r
                shadow = computeShadowWithESM(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.z, light{X}.shadowsInfo.w);\r
            #endif\r
        #elif defined(SHADOWPOISSON{X})\r
            #if defined(SHADOWCUBE{X})\r
                shadow = computeShadowWithPoissonSamplingCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.x, light{X}.depthValues);\r
            #else\r
                shadow = computeShadowWithPoissonSampling(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #endif\r
        #elif defined(SHADOWPCF{X})\r
            #if defined(SHADOWLOWQUALITY{X})\r
                shadow = computeShadowWithPCF1(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #elif defined(SHADOWMEDIUMQUALITY{X})\r
                shadow = computeShadowWithPCF3(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #else\r
                shadow = computeShadowWithPCF5(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.yz, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #endif\r
        #elif defined(SHADOWPCSS{X})\r
            #if defined(SHADOWLOWQUALITY{X})\r
                shadow = computeShadowWithPCSS16(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #elif defined(SHADOWMEDIUMQUALITY{X})\r
                shadow = computeShadowWithPCSS32(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #else\r
                shadow = computeShadowWithPCSS64(vPositionFromLight{X}, vDepthMetric{X}, depthSampler{X}, shadowSampler{X}, light{X}.shadowsInfo.y, light{X}.shadowsInfo.z, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #endif\r
        #else\r
            #if defined(SHADOWCUBE{X})\r
                shadow = computeShadowCube(light{X}.vLightData.xyz, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.depthValues);\r
            #else\r
                shadow = computeShadow(vPositionFromLight{X}, vDepthMetric{X}, shadowSampler{X}, light{X}.shadowsInfo.x, light{X}.shadowsInfo.w);\r
            #endif\r
        #endif\r
\r
        #ifdef SHADOWONLY\r
            #ifndef SHADOWINUSE\r
                #define SHADOWINUSE\r
            #endif\r
            globalShadow += shadow;\r
            shadowLightCount += 1.0;\r
        #endif\r
    #else\r
        shadow = 1.;\r
    #endif\r
\r
    #ifndef SHADOWONLY\r
        #ifdef CUSTOMUSERLIGHTING\r
            // Compute and reflect MToon lighting\r
            #ifdef SPOTLIGHT{X}\r
                lightDirection = computeSpotLightDirection(light{X}.vLightData);\r
            #elif defined(HEMILIGHT{X})\r
                lightDirection = computeHemisphericLightDirection(light{X}.vLightData, normalW.xyz);\r
            #elif defined(POINTLIGHT{X}) || defined(DIRLIGHT{X})\r
                lightDirection = computeLightDirection(light{X}.vLightData);\r
            #endif\r
            mtoonDiffuse = computeMToonDiffuseLighting(viewDirectionW.xyz, normalW.xyz, mainUv, lightDirection, light{X}.vLightDiffuse.rgba, shadow);\r
            diffuseBase += mtoonDiffuse.rgb;\r
            alpha = min(alpha, mtoonDiffuse.a);\r
            #if defined(ALPHATEST) && ALPHATEST\r
                alpha = (alpha - alphaCutOff) / max(fwidth(alpha), EPS_COL) + 0.5; // Alpha to Coverage\r
                if (alpha < alphaCutOff) {\r
                    discard;\r
                }\r
                alpha = 1.0; // Discarded, otherwise it should be assumed to have full opacity\r
            #else\r
                if (alpha - 0.0001 < 0.000) { // Slightly improves rendering with layered transparency\r
                    discard;\r
                }\r
            #endif\r
        #elif defined(LIGHTMAP) && defined(LIGHTMAPEXCLUDED{X})\r
            diffuseBase += lightmapColor.rgb * shadow;\r
            #ifdef SPECULARTERM\r
                #ifndef LIGHTMAPNOSPECULAR{X}\r
                    specularBase += info.specular * shadow * lightmapColor.rgb;\r
                #endif\r
            #endif\r
            #ifdef CLEARCOAT\r
                #ifndef LIGHTMAPNOSPECULAR{X}\r
                    clearCoatBase += info.clearCoat.rgb * shadow * lightmapColor.rgb;\r
                #endif\r
            #endif\r
            #ifdef SHEEN\r
                #ifndef LIGHTMAPNOSPECULAR{X}\r
                    sheenBase += info.sheen.rgb * shadow;\r
                #endif\r
            #endif\r
        #else\r
            #ifdef SHADOWCSMDEBUG{X}\r
                diffuseBase += info.diffuse * shadowDebug{X};\r
            #else\r
                diffuseBase += info.diffuse * shadow;\r
            #endif\r
            #ifdef SPECULARTERM\r
                specularBase += info.specular * shadow;\r
            #endif\r
            #ifdef CLEARCOAT\r
                clearCoatBase += info.clearCoat.rgb * shadow;\r
            #endif\r
            #ifdef SHEEN\r
                sheenBase += info.sheen.rgb * shadow;\r
            #endif\r
        #endif\r
    #endif\r
#endif\r
`,Kn=`// it is based on default.vertex.fx\r
// This include is special, it will be replaced to UboDeclaration(WebGL2) or VertexDeclaration(WebGL1).\r
// @see effect.ts\r
#include<__decl__mtoonVertex>\r
\r
// Attributes\r
\r
#define CUSTOM_VERTEX_BEGIN\r
\r
attribute vec3 position;\r
#ifdef NORMAL\r
attribute vec3 normal;\r
#endif\r
#ifdef TANGENT\r
attribute vec4 tangent;\r
#endif\r
#ifdef UV1\r
attribute vec2 uv;\r
#endif\r
#include<uvAttributeDeclaration>[2..7]\r
#ifdef VERTEXCOLOR\r
attribute vec4 color;\r
#endif\r
\r
#include<helperFunctions>\r
\r
#include<bonesDeclaration>\r
#include<bakedVertexAnimationDeclaration>\r
\r
// Uniforms\r
#include<instancesDeclaration>\r
#include<prePassVertexDeclaration>\r
\r
#include<mainUVVaryingDeclaration>[1..7]\r
\r
#include<samplerVertexDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse)\r
// # include<samplerVertexDeclaration>(_DEFINENAME_,DETAIL,_VARYINGNAME_,Detail)\r
// # include<samplerVertexDeclaration>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient)\r
// # include<samplerVertexDeclaration>(_DEFINENAME_,OPACITY,_VARYINGNAME_,Opacity)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive)\r
// # include<samplerVertexDeclaration>(_DEFINENAME_,LIGHTMAP,_VARYINGNAME_,Lightmap)\r
// # if defined(SPECULARTERM)\r
// # include<samplerVertexDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular)\r
// # endif\r
#include<samplerVertexDeclaration>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,OUTLINE_WIDTH,_VARYINGNAME_,OutlineWidth)\r
#include<samplerVertexDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask)\r
\r
// Additional Uniforms\r
#ifdef OUTLINE_WIDTH\r
    uniform sampler2D outlineWidthSampler;\r
#endif\r
\r
// Output\r
varying vec3 vPositionW;\r
#ifdef NORMAL\r
varying vec3 vNormalW;\r
#endif\r
\r
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR)\r
varying vec4 vColor;\r
#endif\r
\r
#include<bumpVertexDeclaration>\r
\r
#include<clipPlaneVertexDeclaration>\r
\r
#include<fogVertexDeclaration>\r
#include<__decl__lightVxFragment>[0..maxSimultaneousLights]\r
\r
#include<morphTargetsVertexGlobalDeclaration>\r
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]\r
\r
// # ifdef REFLECTIONMAP_SKYBOX\r
// varying vec3 vPositionUVW;\r
// # endif\r
\r
// # if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\r
// varying vec3 vDirectionW;\r
// # endif\r
\r
#include<logDepthDeclaration>\r
#define CUSTOM_VERTEX_DEFINITIONS\r
\r
void main(void) {\r
\r
    #define CUSTOM_VERTEX_MAIN_BEGIN\r
\r
    vec3 positionUpdated = position;\r
#ifdef NORMAL\r
    vec3 normalUpdated = normal;\r
#endif\r
#ifdef TANGENT\r
    vec4 tangentUpdated = tangent;\r
#endif\r
#ifdef UV1\r
    vec2 uvUpdated = uv;\r
#endif\r
\r
#include<morphTargetsVertexGlobal>\r
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]\r
\r
// # ifdef REFLECTIONMAP_SKYBOX\r
//     vPositionUVW = positionUpdated;\r
// # endif\r
\r
#define CUSTOM_VERTEX_UPDATE_POSITION\r
\r
#define CUSTOM_VERTEX_UPDATE_NORMAL\r
\r
#include<instancesVertex>\r
\r
#if defined(PREPASS) && defined(PREPASS_VELOCITY) && !defined(BONES_VELOCITY_ENABLED)\r
    // Compute velocity before bones computation\r
    vCurrentPosition = viewProjection * finalWorld * vec4(positionUpdated, 1.0);\r
    vPreviousPosition = previousViewProjection * finalPreviousWorld * vec4(positionUpdated, 1.0);\r
#endif\r
\r
#include<bonesVertex>\r
#include<bakedVertexAnimation>\r
\r
    // Texture coordinates\r
#ifndef UV1\r
    vec2 uvUpdated = vec2(0., 0.);\r
#endif\r
#ifdef MAINUV1\r
    vMainUV1 = uvUpdated;\r
#endif\r
#include<uvVariableDeclaration>[2..7]\r
\r
    float outlineTex = 1.0;\r
    if (isOutline == 1.0) {\r
#ifdef OUTLINE_WIDTH\r
    #if OUTLINE_WIDTHDIRECTUV == 0\r
        if (vOutlineWidthInfos.x == 0.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uvUpdated, 1.0, 0.0));\r
        }\r
        #ifdef UV2\r
        else if (vOutlineWidthInfos.x == 1.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uv2, 1.0, 0.0));\r
        }\r
        #endif\r
        #ifdef UV3\r
        else if (vOutlineWidthInfos.x == 2.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uv3, 1.0, 0.0));\r
        }\r
        #endif\r
        #ifdef UV4\r
        else if (vOutlineWidthInfos.x == 3.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uv4, 1.0, 0.0));\r
        }\r
        #endif\r
        #ifdef UV5\r
        else if (vOutlineWidthInfos.x == 4.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uv5, 1.0, 0.0));\r
        }\r
        #endif\r
        #ifdef UV6\r
        else if (vOutlineWidthInfos.x == 5.)\r
        {\r
            vOutlineWidthUV = vec2(outlineWidthMatrix * vec4(uv6, 1.0, 0.0));\r
        }\r
        #endif\r
    #elif defined(MAINUV1)\r
        vec2 vOutlineWidthUV = vMainUV1;\r
    #elif defined(MAINUV2)\r
        vec2 vOutlineWidthUV = vMainUV2;\r
    #else\r
        vec2 vOutlineWidthUV = vec2(0., 0.);\r
    #endif\r
        outlineTex = texture2D(outlineWidthSampler, vOutlineWidthUV).r * vOutlineWidthInfos.y;\r
#endif\r
\r
#if defined(MTOON_OUTLINE_WIDTH_WORLD) && defined(NORMAL)\r
        // move slightly world normal\r
        vec3 outlineOffset = 0.01 * outlineWidth * outlineTex * length(transposeMat3(inverseMat3(mat3(finalWorld))) * normalUpdated) * normalUpdated;\r
        positionUpdated += outlineOffset;\r
#endif\r
    } // End isOutline == 1.0\r
\r
    vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);\r
\r
#ifdef NORMAL\r
    mat3 normalWorld = mat3(finalWorld);\r
\r
    #if defined(INSTANCES) && defined(THIN_INSTANCES)\r
        vNormalW = normalUpdated / vec3(dot(normalWorld[0], normalWorld[0]), dot(normalWorld[1], normalWorld[1]), dot(normalWorld[2], normalWorld[2]));\r
        vNormalW = normalize(normalWorld * vNormalW);\r
    #else\r
        #ifdef NONUNIFORMSCALING\r
            normalWorld = transposeMat3(inverseMat3(normalWorld));\r
        #endif\r
\r
        vNormalW = normalize(normalWorld * normalUpdated);\r
    #endif\r
#endif\r
\r
#define CUSTOM_VERTEX_UPDATE_WORLDPOS\r
\r
#ifdef MULTIVIEW\r
    if (gl_ViewID_OVR == 0u) {\r
        gl_Position = viewProjection * worldPos;\r
    } else {\r
        gl_Position = viewProjectionR * worldPos;\r
    }\r
#else\r
    gl_Position = viewProjection * worldPos;\r
#endif\r
\r
    if (isOutline == 1.0) {\r
#if defined(MTOON_OUTLINE_WIDTH_SCREEN) && defined(NORMAL)\r
        vec3 viewNormal = transposeMat3(inverseMat3(mat3(view) * mat3(finalWorld))) * normalUpdated;\r
        vec3 clipNormal = mat3(projection) * viewNormal;\r
        vec2 projectedNormal = normalize(clipNormal.xy);\r
        projectedNormal *= min(gl_Position.w, outlineScaledMaxDistance);\r
        projectedNormal.x /= aspect; // aspect in original mtoon is y/x. aspect in babylon is x/y.\r
        gl_Position.xy += 0.01 * outlineWidth * outlineTex * projectedNormal * clamp(1.0 - abs(normalize(viewNormal).z), 0.0, 1.0); // ignore offset when normal toward camera\r
#endif\r
\r
        gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic from three-vrm\r
    }\r
\r
    worldPos = finalWorld * vec4(positionUpdated, 1.0);\r
    vPositionW = vec3(worldPos);\r
\r
#include<prePassVertex>\r
\r
// # if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\r
//     vDirectionW = normalize(vec3(finalWorld * vec4(positionUpdated, 0.0)));\r
// # endif\r
\r
    #include<samplerVertexImplementation>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_MATRIXNAME_,diffuse,_INFONAME_,DiffuseInfos.x)\r
    // # include<samplerVertexImplementation>(_DEFINENAME_,DETAIL,_VARYINGNAME_,Detail,_MATRIXNAME_,detail,_INFONAME_,DetailInfos.x)\r
    // # include<samplerVertexImplementation>(_DEFINENAME_,AMBIENT,_VARYINGNAME_,Ambient,_MATRIXNAME_,ambient,_INFONAME_,AmbientInfos.x)\r
    // # include<samplerVertexImplementation>(_DEFINENAME_,OPACITY,_VARYINGNAME_,Opacity,_MATRIXNAME_,opacity,_INFONAME_,OpacityInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_MATRIXNAME_,emissive,_INFONAME_,EmissiveInfos.x)\r
    // # include<samplerVertexImplementation>(_DEFINENAME_,LIGHTMAP,_VARYINGNAME_,Lightmap,_MATRIXNAME_,lightmap,_INFONAME_,LightmapInfos.x)\r
    // # if defined(SPECULARTERM)\r
    // # include<samplerVertexImplementation>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_MATRIXNAME_,specular,_INFONAME_,SpecularInfos.x)\r
    // # endif\r
    #include<samplerVertexImplementation>(_DEFINENAME_,BUMP,_VARYINGNAME_,Bump,_MATRIXNAME_,bump,_INFONAME_,BumpInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade,_MATRIXNAME_,shade,_INFONAME_,ShadeInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow,_MATRIXNAME_,receiveShadow,_INFONAME_,ReceiveShadowInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade,_MATRIXNAME_,shadingGrade,_INFONAME_,ShadingGradeInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim,_MATRIXNAME_,rim,_INFONAME_,RimInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_MATRIXNAME_,matCap,_INFONAME_,MatCapInfos.x)\r
    #include<samplerVertexImplementation>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_MATRIXNAME_,uvAnimationMask,_INFONAME_,uvAnimationMaskInfos.x)\r
\r
#include<bumpVertex>\r
#include<clipPlaneVertex>\r
#include<fogVertex>\r
#include<shadowsVertex>[0..maxSimultaneousLights]\r
\r
#ifdef VERTEXCOLOR\r
    vColor = color;\r
#elif defined(INSTANCESCOLOR) && INSTANCESCOLOR\r
    vColor = instanceColor;\r
#endif\r
\r
#include<pointCloudVertex>\r
#include<logDepthVertex>\r
\r
#define CUSTOM_VERTEX_MAIN_END\r
\r
}\r
`,qn=`#include<__decl__mtoonFragment>\r
\r
#extension GL_OES_standard_derivatives : enable\r
\r
#include<prePassDeclaration>[SCENE_MRT_COUNT]\r
#include<oitDeclaration>\r
\r
#define CUSTOM_FRAGMENT_BEGIN\r
\r
#ifdef LOGARITHMICDEPTH\r
#extension GL_EXT_frag_depth : enable\r
#endif\r
\r
// Constants\r
// 注意: 不能 #define RECIPROCAL_PI2 —— helperFunctions(Babylon 8+) 以\r
// "const float RECIPROCAL_PI2" 提供该常量, 宏会把声明替换成 "const float 0.15915494=..." 导致 GLSL 语法错误\r
#define PI_2 6.28318530718\r
#define EPS_COL 0.00001\r
\r
// Input\r
varying vec3 vPositionW;\r
\r
#ifdef NORMAL\r
varying vec3 vNormalW;\r
#endif\r
\r
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR)\r
varying vec4 vColor;\r
#endif\r
\r
#include<mainUVVaryingDeclaration>[1..7]\r
\r
// Helper functions\r
#include<helperFunctions>\r
\r
// Lights\r
#include<__decl__lightFragment>[0..maxSimultaneousLights]\r
\r
#include<lightsFragmentFunctions>\r
#include<shadowsFragmentFunctions>\r
\r
// Samplers\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,DIFFUSE,_VARYINGNAME_,Diffuse,_SAMPLERNAME_,diffuse)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,EMISSIVE,_VARYINGNAME_,Emissive,_SAMPLERNAME_,emissive)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADE,_VARYINGNAME_,Shade,_SAMPLERNAME_,shade)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,RECEIVE_SHADOW,_VARYINGNAME_,ReceiveShadow,_SAMPLERNAME_,receiveShadow)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADING_GRADE,_VARYINGNAME_,ShadingGrade,_SAMPLERNAME_,shadingGrade)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,SHADING_SHIFT,_VARYINGNAME_,ShadingShift,_SAMPLERNAME_,shadingShift)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,RIM,_VARYINGNAME_,Rim,_SAMPLERNAME_,rim)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,MATCAP,_VARYINGNAME_,MatCap,_SAMPLERNAME_,matCap)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,OUTLINE_WIDTH,_VARYINGNAME_,OutlineWidth,_SAMPLERNAME_,outlineWidth)\r
#include<samplerFragmentDeclaration>(_DEFINENAME_,UV_ANIMATION_MASK,_VARYINGNAME_,UvAnimationMask,_SAMPLERNAME_,uvAnimationMask)\r
\r
#include<mtoonFragmentFunctions>\r
\r
// # ifdef REFRACTION\r
\r
// # ifdef REFRACTIONMAP_3D\r
// uniform samplerCube refractionCubeSampler;\r
// # else\r
// uniform sampler2D refraction2DSampler;\r
// # endif\r
\r
// # endif\r
\r
// # if defined(SPECULARTERM)\r
//     # include<samplerFragmentDeclaration>(_DEFINENAME_,SPECULAR,_VARYINGNAME_,Specular,_SAMPLERNAME_,specular)\r
// # endif\r
\r
// // Fresnel\r
// # include<fresnelFunction>\r
\r
// // Reflection\r
// # ifdef REFLECTION\r
// # ifdef REFLECTIONMAP_3D\r
// uniform samplerCube reflectionCubeSampler;\r
// # else\r
// uniform sampler2D reflection2DSampler;\r
// # endif\r
\r
// # ifdef REFLECTIONMAP_SKYBOX\r
// varying vec3 vPositionUVW;\r
// # else\r
// # if defined(REFLECTIONMAP_EQUIRECTANGULAR_FIXED) || defined(REFLECTIONMAP_MIRROREDEQUIRECTANGULAR_FIXED)\r
// varying vec3 vDirectionW;\r
// # endif\r
\r
// # endif\r
\r
// # include<reflectionFunction>\r
\r
// # endif\r
\r
#include<imageProcessingDeclaration>\r
\r
#include<imageProcessingFunctions>\r
\r
#include<bumpFragmentMainFunctions>\r
#include<bumpFragmentFunctions>\r
#include<clipPlaneFragmentDeclaration>\r
#include<logDepthDeclaration>\r
#include<fogFragmentDeclaration>\r
\r
#define CUSTOM_FRAGMENT_DEFINITIONS\r
\r
void main(void) {\r
#ifdef MTOON_CLIP_IF_OUTLINE_IS_NONE\r
    #ifdef MTOON_OUTLINE_WIDTH_WORLD\r
    #elif defined(MTOON_OUTLINE_WIDTH_SCREEN)\r
    #else\r
        discard;\r
    #endif\r
#endif\r
\r
#define CUSTOM_FRAGMENT_MAIN_BEGIN\r
\r
#include<oitFragment>\r
\r
#include<clipPlaneFragment>\r
\r
    vec3 viewDirectionW = normalize(vEyePosition.xyz - vPositionW);\r
\r
    // Base color\r
    vec4 baseColor = vec4(1., 1., 1., 1.);\r
    vec3 diffuseColor = vec3(1., 1., 1.);\r
\r
    // Alpha\r
    float alpha = 1.0;\r
\r
    // Bump\r
#ifdef NORMAL\r
    vec3 normalW = normalize(vNormalW);\r
#else\r
    vec3 normalW = normalize(-cross(dFdx(vPositionW), dFdy(vPositionW)));\r
#endif\r
\r
#include<depthPrePass>\r
\r
    // Ambient color\r
    vec3 baseAmbientColor = vec3(1., 1., 1.);\r
    float glossiness = 0.;\r
\r
    // Lighting\r
    vec3 diffuseBase = vec3(0., 0., 0.);\r
    lightingInfo info;\r
    float shadow = 1.;\r
    vec3 lightDirection = vec3(0.0, 1.0, 0.0);\r
    vec4 mtoonDiffuse = vec4(0.0, 0.0, 0.0, 1.0);\r
\r
    // MToon UV\r
    // All textures will use diffuse(_MainTex) UV\r
    vec2 mainUv = vec2(0.0);\r
#ifdef DIFFUSE\r
    mainUv += vDiffuseUV;\r
#elif defined(MAINUV1)\r
    mainUv += vMainUV1;\r
#elif defined(MAINUV2)\r
    mainUv += vMainUV2;\r
#endif\r
\r
    // uv anim\r
    float uvAnim = time.y;\r
#ifdef UV_ANIMATION_MASK\r
    uvAnim *= texture2D(uvAnimationMaskSampler, mainUv).r;\r
#endif\r
    // translate uv in bottom-left origin coordinates.\r
    // uv is reversed\r
    mainUv += vec2(-uvAnimationScrollX, -uvAnimationScrollY) * uvAnim;\r
    // rotate uv counter-clockwise around (0.5, 0.5) in bottom-left origin coordinates.\r
    float rotateRad = uvAnimationRotation * PI_2 * uvAnim;\r
    vec2 rotatePivot = vec2(0.5, 0.5);\r
    mainUv = mat2(cos(rotateRad), -sin(rotateRad), sin(rotateRad), cos(rotateRad)) * (mainUv - rotatePivot) + rotatePivot;\r
\r
#ifdef FLIP_U\r
    mainUv.x = 1.0 - mainUv.x;\r
#endif\r
#ifdef FLIP_V\r
    mainUv.y = 1.0 - mainUv.y;\r
#endif\r
\r
#include<mtoonBumpFragment>\r
\r
#ifdef TWOSIDEDLIGHTING\r
    normalW = gl_FrontFacing ? normalW : -normalW;\r
#endif\r
\r
// include customized lightFragment\r
#include<mtoonLightFragment>[0..maxSimultaneousLights]\r
\r
    vec3 finalDiffuse = clamp(diffuseBase, 0.0, 1.0) * baseColor.rgb;\r
\r
    // Composition\r
    vec4 color = vec4(finalDiffuse, clamp(alpha, 0.0, 1.0));\r
\r
    color.rgb = max(color.rgb, 0.);\r
#include<logDepthFragment>\r
#include<fogFragment>\r
\r
// Apply image processing if relevant. As this applies in linear space,\r
// We first move from gamma to linear.\r
#ifdef IMAGEPROCESSINGPOSTPROCESS\r
    color.rgb = toLinearSpace(color.rgb);\r
#else\r
    #ifdef IMAGEPROCESSING\r
        // FIXME: support image processing\r
        // color.rgb = toLinearSpace(color.rgb);\r
        // color = applyImageProcessing(color);\r
    #endif\r
#endif\r
\r
    color.a *= visibility;\r
\r
#ifdef PREMULTIPLYALPHA\r
    // Convert to associative (premultiplied) format if needed.\r
    color.rgb *= color.a;\r
#endif\r
\r
#ifdef PREPASS\r
    float writeGeometryInfo = color.a > 0.4 ? 1.0 : 0.0;\r
\r
    gl_FragData[0] = color; // We can't split irradiance on std material\r
\r
    #ifdef PREPASS_POSITION\r
    gl_FragData[PREPASS_POSITION_INDEX] = vec4(vPositionW, writeGeometryInfo);\r
    #endif\r
\r
    #ifdef PREPASS_VELOCITY\r
    vec2 a = (vCurrentPosition.xy / vCurrentPosition.w) * 0.5 + 0.5;\r
    vec2 b = (vPreviousPosition.xy / vPreviousPosition.w) * 0.5 + 0.5;\r
\r
    vec2 velocity = abs(a - b);\r
    velocity = vec2(pow(velocity.x, 1.0 / 3.0), pow(velocity.y, 1.0 / 3.0)) * sign(a - b) * 0.5 + 0.5;\r
\r
    gl_FragData[PREPASS_VELOCITY_INDEX] = vec4(velocity, 0.0, writeGeometryInfo);\r
    #endif\r
\r
    #ifdef PREPASS_IRRADIANCE\r
        gl_FragData[PREPASS_IRRADIANCE_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo); //  We can't split irradiance on std material\r
    #endif\r
\r
    #ifdef PREPASS_DEPTH\r
        gl_FragData[PREPASS_DEPTH_INDEX] = vec4(vViewPos.z, 0.0, 0.0, writeGeometryInfo); // Linear depth\r
    #endif\r
\r
    #ifdef PREPASS_NORMAL\r
        gl_FragData[PREPASS_NORMAL_INDEX] = vec4((view * vec4(normalW, 0.0)).rgb, writeGeometryInfo); // Normal\r
    #endif\r
\r
    #ifdef PREPASS_ALBEDO_SQRT\r
        gl_FragData[PREPASS_ALBEDO_SQRT_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo); // We can't split albedo on std material\r
    #endif\r
    #ifdef PREPASS_REFLECTIVITY\r
        #if defined(SPECULAR)\r
            gl_FragData[PREPASS_REFLECTIVITY_INDEX] = vec4(specularMapColor.rgb, specularMapColor.a * writeGeometryInfo);\r
        #else\r
            gl_FragData[PREPASS_REFLECTIVITY_INDEX] = vec4(0.0, 0.0, 0.0, writeGeometryInfo);\r
        #endif\r
    #endif\r
#endif\r
\r
#if !defined(PREPASS) || defined(WEBGL2)\r
    gl_FragColor = color;\r
#endif\r
\r
#if ORDER_INDEPENDENT_TRANSPARENCY\r
    if (fragDepth == nearestDepth) {\r
        frontColor.rgb += color.rgb * color.a * alphaMultiplier;\r
        frontColor.a = 1.0 - alphaMultiplier * (1.0 - color.a);\r
    } else {\r
        backColor += color;\r
    }\r
#endif\r
\r
#define CUSTOM_FRAGMENT_MAIN_END\r
\r
}\r
`,tt={effect:null,subMesh:null},Hi=(function(e){return e[e.None=0]="None",e[e.WorldCorrdinates=1]="WorldCorrdinates",e[e.ScreenCoordinates=2]="ScreenCoordinates",e})({}),V=(f=class extends(De=mn,Vi=[X("diffuseTexture")],Wi=[R("_markAllSubMeshesAsTexturesAndMiscDirty")],Ui=[X("emissiveTexture")],Fi=[R("_markAllSubMeshesAsTexturesDirty")],wi=[X("bumpTexture")],yi=[R("_markAllSubMeshesAsTexturesDirty")],bi=[X("shadeTexture")],Oi=[R("_markAllSubMeshesAsTexturesDirty")],Di=[X("receiveShadowTexture")],Li=[R("_markAllSubMeshesAsTexturesDirty")],Ni=[X("shadingGradeTexture")],Ci=[R("_markAllSubMeshesAsTexturesDirty")],Ri=[X("shadingShiftTexture")],Pi=[R("_markAllSubMeshesAsTexturesDirty")],Ei=[X("rimTexture")],Ii=[R("_markAllSubMeshesAsTexturesDirty")],xi=[X("matCapTexture")],vi=[R("_markAllSubMeshesAsTexturesDirty")],Si=[X("outlineWidthTexture")],Ai=[R("_markAllSubMeshesAsTexturesDirty")],Ti=[X("outlineWidthTexture")],Mi=[R("_markAllSubMeshesAsTexturesDirty")],_i=[Tn("diffuse")],gi=[A("ambient")],pi=[A("emissive")],mi=[A("shade")],ci=[A("matcap")],fi=[A("rim")],ui=[A("outline")],di=[R("_markAllSubMeshesAsTexturesDirty")],hi=[R("_markAllSubMeshesAsTexturesDirty")],li=[R("_markAllSubMeshesAsTexturesDirty")],oi=[A("disableLighting")],si=[R("_markAllSubMeshesAsLightsDirty")],ai=[A()],ni=[A("useAlphaFromDiffuseTexture")],ri=[R("_markAllSubMeshesAsTexturesAndMiscDirty")],ii=[A("maxSimultaneousLights")],ti=[R("_markAllSubMeshesAsLightsDirty")],ei=[A("invertNormalMapX")],Jt=[R("_markAllSubMeshesAsTexturesDirty")],Zt=[A("invertNormalMapY")],qt=[R("_markAllSubMeshesAsTexturesDirty")],Kt=[A("twoSidedLighting")],jt=[R("_markAllSubMeshesAsTexturesDirty")],$t=[A()],Qt=[A()],Yt=[A()],zt=[A()],Ht=[A()],Gt=[A()],kt=[A()],Bt=[A()],Xt=[A()],Vt=[A()],Wt=[A()],Ut=[A()],Ft=[A()],wt=[A()],yt=[A()],bt=[A()],Ot=[A()],Dt=[A("alphaTest")],Lt=[A()],Nt=[A()],Ct=[A("debugMode")],Rt=[R("_markAllSubMeshesAsMiscDirty")],Pt=[R("_markAllSubMeshesAsMiscDirty")],Et=[A()],It=[A()],xt=[R("_markAllSubMeshesAsMiscDirty")],vt=[A("flipU")],St=[A("flipV")],At=[A()],De){constructor(e,t){super(e,t),h(l,5,this),_(this,"_diffuseTexture",h(l,100,this,null)),h(l,103,this),C(this,Oe,h(l,8,this,null)),h(l,11,this),_(this,"_emissiveTexture",h(l,104,this,null)),h(l,107,this),C(this,be,h(l,12,this,null)),h(l,15,this),_(this,"_bumpTexture",h(l,108,this,null)),h(l,111,this),C(this,ye,h(l,16,this,null)),h(l,19,this),_(this,"_shadeTexture",h(l,112,this,null)),h(l,115,this),C(this,we,h(l,20,this,null)),h(l,23,this),_(this,"_receiveShadowTexture",h(l,116,this,null)),h(l,119,this),C(this,Fe,h(l,24,this,null)),h(l,27,this),_(this,"_shadingGradeTexture",h(l,120,this,null)),h(l,123,this),C(this,Ue,h(l,28,this,null)),h(l,31,this),_(this,"_shadingShiftTexture",h(l,124,this,null)),h(l,127,this),C(this,We,h(l,32,this,null)),h(l,35,this),_(this,"_rimTexture",h(l,128,this,null)),h(l,131,this),C(this,Ve,h(l,36,this,null)),h(l,39,this),_(this,"_matCapTexture",h(l,132,this,null)),h(l,135,this),C(this,Xe,h(l,40,this,null)),h(l,43,this),_(this,"_outlineWidthTexture",h(l,136,this,null)),h(l,139,this),C(this,Be,h(l,44,this,null)),h(l,47,this),_(this,"_uvAnimationMaskTexture",h(l,140,this,null)),h(l,143,this),C(this,ke,h(l,48,this,null)),h(l,51,this),_(this,"diffuseColor",h(l,144,this,new N(1,1,1))),h(l,147,this),_(this,"ambientColor",h(l,148,this,new N(0,0,0))),h(l,151,this),_(this,"emissiveColor",h(l,152,this,new N(0,0,0))),h(l,155,this),_(this,"shadeColor",h(l,156,this,new N(.97,.81,.86))),h(l,159,this),_(this,"matcapColor",h(l,160,this,new N(1,1,1))),h(l,163,this),_(this,"rimColor",h(l,164,this,new N(0,0,0))),h(l,167,this),_(this,"outlineColor",h(l,168,this,new N(0,0,0))),h(l,171,this),C(this,Ge,h(l,52,this,!1)),h(l,55,this),C(this,He,h(l,56,this,!1)),h(l,59,this),C(this,ze,h(l,60,this,!1)),h(l,63,this),_(this,"_disableLighting",h(l,172,this,!1)),h(l,175,this),C(this,Ye,h(l,64,this,!1)),h(l,67,this),_(this,"useObjectSpaceNormalMap",!1),_(this,"useParallax",!1),_(this,"useParallaxOcclusion",!1),_(this,"specularSupported",!1),_(this,"useLightmapAsShadowmap",!1),_(this,"useVertexColor",!1),_(this,"useBones",!0),_(this,"useMorphTargets",!0),_(this,"useVertexAlpha",!1),_(this,"useBakedVertexAnimation",!1),_(this,"alphaCutOff",h(l,176,this,.4)),h(l,179,this),_(this,"_useAlphaFromDiffuseTexture",h(l,180,this,!0)),h(l,183,this),C(this,Qe,h(l,68,this,!0)),h(l,71,this),_(this,"_maxSimultaneousLights",h(l,184,this,4)),h(l,187,this),C(this,$e,h(l,72,this,4)),h(l,75,this),_(this,"_invertNormalMapX",h(l,188,this,!0)),h(l,191,this),C(this,je,h(l,76,this,!0)),h(l,79,this),_(this,"_invertNormalMapY",h(l,192,this,!0)),h(l,195,this),C(this,Ke,h(l,80,this,!0)),h(l,83,this),_(this,"_twoSidedLighting",h(l,196,this,!1)),h(l,199,this),C(this,qe,h(l,84,this,!1)),h(l,87,this),_(this,"_imageProcessingConfiguration"),_(this,"_imageProcessingObserver",null),_(this,"detailMap"),_(this,"_renderTargets",new ln(16)),_(this,"_globalAmbientColor",new N(0,0,0)),_(this,"_timeVector4",new Ie(0,0,0,0)),_(this,"_bumpScale",1),_(this,"_receiveShadowRate",1),_(this,"_shadingGradeRate",1),_(this,"_shadeShift",0),_(this,"_shadeToony",.9),_(this,"_shadingShiftTextureScale",1),_(this,"_lightColorAttenuation",0),_(this,"_indirectLightIntensity",.1),_(this,"_rimLightingMix",0),_(this,"_rimFresnelPower",1),_(this,"_rimLift",0),_(this,"_outlineWidth",.5),_(this,"_outlineScaledMaxDistance",1),_(this,"_outlineLightingMix",1),_(this,"_uvAnimationScrollX",0),_(this,"_uvAnimationScrollY",0),_(this,"_uvAnimationRotation",0),_(this,"_alphaTest",h(l,200,this,!1)),h(l,203,this),_(this,"_alphaBlend",!1),_(this,"_debugMode",h(l,204,this,0)),h(l,207,this),C(this,Ze,h(l,88,this,0)),h(l,91,this),_(this,"outlineRenderer"),_(this,"_outlineWidthMode",0),_(this,"isOutline",0),C(this,Je,h(l,92,this,1)),h(l,95,this),_(this,"_cullMode",2),_(this,"_outlineCullMode",h(l,208,this,1)),h(l,211,this),C(this,et,h(l,96,this,1)),h(l,99,this),_(this,"storedCullMode",2),_(this,"flipU",h(l,212,this,!1)),h(l,215,this),_(this,"flipV",h(l,216,this,!1)),h(l,219,this),this.detailMap=new hn(this),this._attachImageProcessingConfiguration(null),this.getRenderTargetTextures=()=>(this._renderTargets.reset(),this._eventInfo.renderTargets=this._renderTargets,this._callbackPluginEventFillRenderTargetTextures(this._eventInfo),this._renderTargets),Q.IncludesShadersStore.mtoonUboDeclaration||(Q.IncludesShadersStore.mtoonUboDeclaration=Hn,Q.IncludesShadersStore.mtoonVertexDeclaration=zn,Q.IncludesShadersStore.mtoonFragmentDeclaration=Yn,Q.IncludesShadersStore.mtoonFragmentFunctions=Qn,Q.IncludesShadersStore.mtoonLightFragment=jn,Q.IncludesShadersStore.mtoonBumpFragment=$n,Q.ShadersStore.mtoonVertexShader=Kn,Q.ShadersStore.mtoonFragmentShader=qn),this.inspectableCustomProperties=this.inspectableCustomProperties||[],this.inspectableCustomProperties.push(...Xn())}get appendedTextures(){return[this._diffuseTexture,this._emissiveTexture,this._bumpTexture,this._shadeTexture,this._receiveShadowTexture,this._shadingGradeTexture,this._shadingShiftTexture,this._rimTexture,this._matCapTexture,this._outlineWidthTexture,this._uvAnimationMaskTexture]}get appendedActiveTextures(){return this.appendedTextures.filter(e=>e!==null)}get imageProcessingConfiguration(){return this._imageProcessingConfiguration}set imageProcessingConfiguration(e){this._attachImageProcessingConfiguration(e),this._markAllSubMeshesAsTexturesDirty()}_attachImageProcessingConfiguration(e){e!==this._imageProcessingConfiguration&&(this._imageProcessingConfiguration&&this._imageProcessingObserver&&this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver),this._imageProcessingConfiguration=e||this.getScene().imageProcessingConfiguration,this._imageProcessingConfiguration&&(this._imageProcessingObserver=this._imageProcessingConfiguration.onUpdateParameters.add(()=>{this._markAllSubMeshesAsImageProcessingDirty()})))}get isPrePassCapable(){return!1}get cameraColorCurvesEnabled(){return this.imageProcessingConfiguration.colorCurvesEnabled}set cameraColorCurvesEnabled(e){this.imageProcessingConfiguration.colorCurvesEnabled=e}get cameraColorGradingEnabled(){return this.imageProcessingConfiguration.colorGradingEnabled}set cameraColorGradingEnabled(e){this.imageProcessingConfiguration.colorGradingEnabled=e}get cameraToneMappingEnabled(){return this._imageProcessingConfiguration.toneMappingEnabled}set cameraToneMappingEnabled(e){this._imageProcessingConfiguration.toneMappingEnabled=e}get cameraExposure(){return this._imageProcessingConfiguration.exposure}set cameraExposure(e){this._imageProcessingConfiguration.exposure=e}get cameraContrast(){return this._imageProcessingConfiguration.contrast}set cameraContrast(e){this._imageProcessingConfiguration.contrast=e}get cameraColorGradingTexture(){return this._imageProcessingConfiguration.colorGradingTexture}set cameraColorGradingTexture(e){this._imageProcessingConfiguration.colorGradingTexture=e}get cameraColorCurves(){return this._imageProcessingConfiguration.colorCurves}set cameraColorCurves(e){this._imageProcessingConfiguration.colorCurves=e}get bumpScale(){return this._bumpScale}set bumpScale(e){this._bumpScale=e}get receiveShadowRate(){return this._receiveShadowRate}set receiveShadowRate(e){this._receiveShadowRate=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get shadingGradeRate(){return this._shadingGradeRate}set shadingGradeRate(e){this._shadingGradeRate=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get shadeShift(){return this._shadeShift}set shadeShift(e){this._shadeShift=Math.max(-1,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get shadeToony(){return this._shadeToony}set shadeToony(e){this._shadeToony=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get shadingShiftTextureScale(){return this._shadingShiftTextureScale}set shadingShiftTextureScale(e){this._shadingShiftTextureScale=e,this._markAllSubMeshesAsLightsDirty()}get lightColorAttenuation(){return this._lightColorAttenuation}set lightColorAttenuation(e){this._lightColorAttenuation=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get indirectLightIntensity(){return this._indirectLightIntensity}set indirectLightIntensity(e){this._indirectLightIntensity=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get rimLightingMix(){return this._rimLightingMix}set rimLightingMix(e){this._rimLightingMix=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get rimFresnelPower(){return this._rimFresnelPower}set rimFresnelPower(e){this._rimFresnelPower=Math.max(0,Math.min(100,e)),this._markAllSubMeshesAsLightsDirty()}get rimLift(){return this._rimLift}set rimLift(e){this._rimLift=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsLightsDirty()}get outlineWidth(){return this._outlineWidth}set outlineWidth(e){this._outlineWidth=Math.max(.01,Math.min(1,e)),this._markAllSubMeshesAsAttributesDirty()}get outlineScaledMaxDistance(){return this._outlineScaledMaxDistance}set outlineScaledMaxDistance(e){this._outlineScaledMaxDistance=Math.max(1,Math.min(10,e)),this._markAllSubMeshesAsAttributesDirty()}get outlineLightingMix(){return this._outlineLightingMix}set outlineLightingMix(e){this._outlineLightingMix=Math.max(0,Math.min(1,e)),this._markAllSubMeshesAsAttributesDirty()}get uvAnimationScrollX(){return this._uvAnimationScrollX}set uvAnimationScrollX(e){this._uvAnimationScrollX=e,this._markAllSubMeshesAsMiscDirty()}get uvAnimationScrollY(){return this._uvAnimationScrollY}set uvAnimationScrollY(e){this._uvAnimationScrollY=e,this._markAllSubMeshesAsMiscDirty()}get uvAnimationRotation(){return this._uvAnimationRotation}set uvAnimationRotation(e){this._uvAnimationRotation=e,this._markAllSubMeshesAsMiscDirty()}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest=e,this._transparencyMode=e?this.alphaBlend?U.MATERIAL_ALPHATESTANDBLEND:U.MATERIAL_ALPHATEST:this.alphaBlend?U.MATERIAL_ALPHABLEND:U.MATERIAL_OPAQUE,this._markAllSubMeshesAsMiscDirty()}get alphaBlend(){return this._alphaBlend}set alphaBlend(e){this._alphaBlend=e,e?(this.backFaceCulling=!0,this._transparencyMode=this.alphaTest?U.MATERIAL_ALPHATESTANDBLEND:U.MATERIAL_ALPHABLEND):this._transparencyMode=this.alphaTest?U.MATERIAL_ALPHATEST:U.MATERIAL_OPAQUE,this._markAllSubMeshesAsMiscDirty()}get outlineWidthMode(){return this._outlineWidthMode}set outlineWidthMode(e){this._outlineWidthMode=e,e!==0&&!this.outlineRenderer&&(this.outlineRenderer=new kn(this.getScene(),this)),this._markAllSubMeshesAsMiscDirty()}enableOutlineRender(){this.isOutline=1}disaableOutlineRender(){this.isOutline=0}get cullMode(){return this._cullMode}set cullMode(e){switch(this._cullMode=e,this._cullMode){case 0:this.backFaceCulling=!1,this.sideOrientation=U.ClockWiseSideOrientation,this.twoSidedLighting=!1;break;case 1:this.backFaceCulling=!0,this.sideOrientation=U.CounterClockWiseSideOrientation,this.twoSidedLighting=!0;break;case 2:this.backFaceCulling=!0,this.sideOrientation=U.ClockWiseSideOrientation,this.twoSidedLighting=!1}this._markAllSubMeshesAsMiscDirty()}applyOutlineCullMode(){this.storedCullMode=this.cullMode,this.cullMode=this._outlineCullMode}restoreOutlineCullMode(){this.cullMode=this.storedCullMode}getOutlineRendererName(){return this.outlineRenderer?this.outlineRenderer.name:""}get hasRenderTargetTextures(){return!1}getClassName(){return"MToonMaterial"}get useLogarithmicDepth(){return this._useLogarithmicDepth}set useLogarithmicDepth(e){let t=e&&this.getScene().getEngine().getCaps().fragmentDepthSupported;this._useLogarithmicDepth!==t&&(this._useLogarithmicDepth=t,this._markAllSubMeshesAsMiscDirty())}needAlphaBlending(){return this._disableAlphaBlending?!1:this.alpha<1||this._shouldUseAlphaFromDiffuseTexture()}needAlphaTesting(){return this._hasTransparencyMode&&this._transparencyModeIsTest||this._alphaTest?!0:this._hasAlphaChannel()&&(this._transparencyMode==null||this._transparencyMode===U.MATERIAL_ALPHATEST)}_shouldUseAlphaFromDiffuseTexture(){return this._diffuseTexture!=null&&this._diffuseTexture.hasAlpha&&this._useAlphaFromDiffuseTexture&&this._transparencyMode!==U.MATERIAL_OPAQUE}_hasAlphaChannel(){return this._diffuseTexture!==null&&this._diffuseTexture.hasAlpha}getAlphaTestTexture(){return this._diffuseTexture}isReadyForSubMesh(e,t,i=!1){this._uniformBufferLayoutBuilt||this.buildUniformLayout();let r=t._drawWrapper;if(r.effect&&this.isFrozen&&r._wasPreviouslyReady&&r._wasPreviouslyUsingInstances===i)return!0;t.materialDefines||=(this._callbackPluginEventGeneric(Ne.GetDefineNames,this._eventInfo),new Gn);let a=this.getScene(),n=t.materialDefines;if(this._isReadyForSubMesh(t))return!0;let s=a.getEngine(),o=!1;n._needNormals=M.PrepareDefinesForLights(a,e,n,this.specularSupported,this._maxSimultaneousLights,this._disableLighting),this.outlineWidthMode!==0&&(n._needNormals=!0),this.applyDefines(n),M.PrepareDefinesForMultiview(a,n);let u=this.needAlphaBlendingForMesh(e)&&a.useOrderIndependentTransparency;if(M.PrepareDefinesForOIT(a,n,u),n._areTexturesDirty){this._eventInfo.hasRenderTargetTextures=!1,this._callbackPluginEventHasRenderTargetTextures(this._eventInfo),n._needUVs=!1;for(let g=1;g<=ge.MAX_SUPPORTED_UV_SETS;++g)n["MAINUV"+g]=!1;if(a.texturesEnabled){if(!this.isReadyForTexture(this._diffuseTexture,n,"DIFFUSE")||!this.isReadyForTexture(this._emissiveTexture,n,"EMISSIVE")||!this.isReadyForTexture(this._shadeTexture,n,"SHADE")||!this.isReadyForTexture(this._receiveShadowTexture,n,"RECEIVE_SHADOW")||!this.isReadyForTexture(this._shadingGradeTexture,n,"SHADING_GRADE")||!this.isReadyForTexture(this._shadingShiftTexture,n,"SHADING_SHIFT")||!this.isReadyForTexture(this._rimTexture,n,"RIM")||!this.isReadyForTexture(this._matCapTexture,n,"MATCAP")||!this.isReadyForTexture(this._outlineWidthTexture,n,"OUTLINE_WIDTH")||!this.isReadyForTexture(this._uvAnimationMaskTexture,n,"UV_ANIMATION_MASK"))return!1;if(a.getEngine().getCaps().standardDerivatives&&this._bumpTexture){if(!this._bumpTexture.isReady())return!1;M.PrepareDefinesForMergedUV(this._bumpTexture,n,"BUMP"),n.PARALLAX=this.useParallax,n.PARALLAXOCCLUSION=this.useParallaxOcclusion,n.OBJECTSPACE_NORMALMAP=this.useObjectSpaceNormalMap}else n.BUMP=!1,n.PARALLAX=!1,n.PARALLAXOCCLUSION=!1;n.TWOSIDEDLIGHTING=!this._backFaceCulling&&this._twoSidedLighting}else n.DIFFUSE=!1,n.EMISSIVE=!1,n.SHADE=!1,n.RECEIVE_SHADOW=!1,n.SHADING_GRADE=!1,n.SHADING_SHIFT=!1,n.RIM=!1,n.MATCAP=!1,n.OUTLINE_WIDTH=!1,n.BUMP=!1,n.UV_ANIMATION_MASK=!1;n.ALPHAFROMDIFFUSE=this._shouldUseAlphaFromDiffuseTexture(),n.PREMULTIPLYALPHA=this.alphaMode===ge.ALPHA_PREMULTIPLIED||this.alphaMode===ge.ALPHA_PREMULTIPLIED_PORTERDUFF,n.ALPHATEST_AFTERALLALPHACOMPUTATIONS=this.transparencyMode!==null,n.ALPHABLEND=this.transparencyMode===null||this.needAlphaBlendingForMesh(e)}if(this._eventInfo.isReadyForSubMesh=!0,this._eventInfo.defines=n,this._callbackPluginEventIsReadyForSubMesh(this._eventInfo),!this._eventInfo.isReadyForSubMesh)return!1;if(n._areImageProcessingDirty&&this._imageProcessingConfiguration){if(!this._imageProcessingConfiguration.isReady())return!1;this._imageProcessingConfiguration.prepareDefines(n)}if(this.flipU!==n.FLIP_U&&(n.FLIP_U=this.flipU,n.markAsUnprocessed()),this.flipV!==n.FLIP_V&&(n.FLIP_V=this.flipV,n.markAsUnprocessed()),M.PrepareDefinesForMisc(e,a,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),n),M.PrepareDefinesForFrameBoundValues(a,s,this,n,i,null,t.getRenderingMesh().hasThinInstances),this._eventInfo.defines=n,this._eventInfo.mesh=e,this._callbackPluginEventPrepareDefinesBeforeAttributes(this._eventInfo),M.PrepareDefinesForAttributes(e,n,this.useVertexColor,this.useBones,this.useMorphTargets,this.useVertexAlpha,this.useBakedVertexAnimation),this._callbackPluginEventPrepareDefines(this._eventInfo),n.isDirty){let g=n._areLightsDisposed;n.markAsProcessed();let c=new dn;n.BUMP&&c.addFallback(0,"BUMP"),n.PARALLAX&&c.addFallback(1,"PARALLAX"),n.PARALLAXOCCLUSION&&c.addFallback(0,"PARALLAXOCCLUSION"),n.FOG&&c.addFallback(1,"FOG"),n.POINTSIZE&&c.addFallback(0,"POINTSIZE"),n.LOGARITHMICDEPTH&&c.addFallback(0,"LOGARITHMICDEPTH"),M.HandleFallbacksForShadows(n,c,this._maxSimultaneousLights),n.MULTIVIEW&&c.addFallback(0,"MULTIVIEW");let m=[B.PositionKind];n.NORMAL&&m.push(B.NormalKind),n.TANGENT&&m.push(B.TangentKind);for(let y=1;y<=ge.MAX_SUPPORTED_UV_SETS;++y)n["UV"+y]&&m.push(`uv${y===1?"":y}`);n.INSTANCESCOLOR&&m.push(B.ColorInstanceKind),M.PrepareAttributesForBones(m,e,n,c),M.PrepareAttributesForInstances(m,n),M.PrepareAttributesForMorphTargets(m,e,n),M.PrepareAttributesForBakedVertexAnimation(m,e,n);let v="world.view.viewProjection.vEyePosition.vLightsType.vAmbientColor.visibility.vFogInfos.vFogColor.pointSize.mBones.vClipPlane.vClipPlane2.vClipPlane3.vClipPlane4.vClipPlane5.vClipPlane6.logarithmicDepthConstant.vTangentSpaceParams.alphaCutOff.boneTextureWidth.morphTargetTextureInfo.morphTargetTextureIndices.vDiffuseColor.vDiffuseInfos.diffuseMatrix.vEmissiveColor.vEmissiveInfos.emissiveMatrix.vBumpInfos.bumpMatrix.vShadeColor.vShadeInfos.shadeMatrix.vReceiveShadowInfos.receiveShadowMatrix.vShadingGradeInfos.shadingGradeMatrix.vRimColor.vRimInfos.RimMatrix.vMatCapInfos.MatCapMatrix.vOutlineColor.vOutlineWidthInfos.outlineWidthMatrix.aspect.isOutline.shadingGradeRate.receiveShadowRate.shadeShift.shadeToony.rimLightingMix.rimFresnelPower.rimLift.lightColorAttenuation.indirectLightIntensity.outlineWidth.outlineScaledMaxDistance.outlineLightingMix.uvAnimationScrollX.uvAnimationScrollY.uvAnimationRotation.vEyeUp.time.projection".split("."),T=["diffuseSampler","ambientSampler","emissiveSampler","bumpSampler","boneSampler","morphTargets","oitDepthSampler","oitFrontColorSampler","shadeSampler","receiveShadowSampler","shadingGradeSampler","shadingShiftSampler","rimSampler","matCapSampler","outlineWidthSampler","uvAnimationMaskSampler"],I=["Material","Scene","Mesh"];this._eventInfo.fallbacks=c,this._eventInfo.fallbackRank=0,this._eventInfo.defines=n,this._eventInfo.uniforms=v,this._eventInfo.attributes=m,this._eventInfo.samplers=T,this._eventInfo.uniformBuffersNames=I,this._eventInfo.customCode=void 0,this._eventInfo.mesh=e,this._callbackPluginEventGeneric(Ne.PrepareEffect,this._eventInfo),xe&&(xe.PrepareUniforms(v,n),xe.PrepareSamplers(T,n)),M.PrepareUniformsAndSamplersList({uniformsNames:v,uniformBuffersNames:I,samplers:T,defines:n,maxSimultaneousLights:this._maxSimultaneousLights});let b={},k=n.toString(),J=t.effect,L=a.getEngine().createEffect("mtoon",{attributes:m,uniformsNames:v,uniformBuffersNames:I,samplers:T,defines:k,fallbacks:c,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this._maxSimultaneousLights,maxSimultaneousMorphTargets:n.NUM_MORPH_INFLUENCERS},processFinalCode:b.processFinalCode,processCodeAfterIncludes:this._eventInfo.customCode,multiTarget:n.PREPASS},s);if(L)if(this._onEffectCreatedObservable&&(tt.effect=L,tt.subMesh=t,this._onEffectCreatedObservable.notifyObservers(tt)),this.allowShaderHotSwapping&&J&&!L.isReady()){if(n.markAsUnprocessed(),o=this.isFrozen,g)return n._areLightsDisposed=!0,!1}else a.resetCachedMaterial(),t.setEffect(L,n,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(n._renderId=a.getRenderId(),t._drawWrapper._wasPreviouslyReady=!o,t._drawWrapper._wasPreviouslyUsingInstances=i,!0)}buildUniformLayout(){let e=this._uniformBuffer;e.addUniform("vDiffuseColor",4),e.addUniform("vDiffuseInfos",2),e.addUniform("diffuseMatrix",16),e.addUniform("vEmissiveColor",3),e.addUniform("vEmissiveInfos",2),e.addUniform("emissiveMatrix",16),e.addUniform("vBumpInfos",3),e.addUniform("bumpMatrix",16),e.addUniform("vShadeColor",3),e.addUniform("vMatcapColor",3),e.addUniform("vShadeInfos",2),e.addUniform("shadeMatrix",16),e.addUniform("vReceiveShadowInfos",2),e.addUniform("receiveShadowMatrix",16),e.addUniform("vShadingGradeInfos",2),e.addUniform("shadingGradeMatrix",16),e.addUniform("vShadingShiftInfos",2),e.addUniform("shadingShiftMatrix",16),e.addUniform("vRimColor",3),e.addUniform("vRimInfos",2),e.addUniform("rimMatrix",16),e.addUniform("vMatCapInfos",2),e.addUniform("matCapMatrix",16),e.addUniform("vOutlineColor",3),e.addUniform("vOutlineWidthInfos",2),e.addUniform("outlineWidthMatrix",16),e.addUniform("vUvAnimationMaskInfos",2),e.addUniform("uvAnimationMaskMatrix",16),e.addUniform("vTangentSpaceParams",2),e.addUniform("pointSize",1),e.addUniform("shadingGradeRate",1),e.addUniform("receiveShadowRate",1),e.addUniform("shadeShift",1),e.addUniform("shadeToony",1),e.addUniform("shadingShiftTextureScale",1),e.addUniform("lightColorAttenuation",1),e.addUniform("indirectLightIntensity",1),e.addUniform("rimLightingMix",1),e.addUniform("rimFresnelPower",1),e.addUniform("rimLift",1),e.addUniform("outlineWidth",1),e.addUniform("outlineScaledMaxDistance",1),e.addUniform("outlineLightingMix",1),e.addUniform("uvAnimationScrollX",1),e.addUniform("uvAnimationScrollY",1),e.addUniform("uvAnimationRotation",1),e.addUniform("vEyeUp",3),e.addUniform("alphaCutOff",1),e.addUniform("vAmbientColor",3),e.addUniform("aspect",1),e.addUniform("isOutline",1),e.addUniform("time",4),e.addUniform("visibility",1),super.buildUniformLayout()}bindForSubMesh(e,t,i){let r=this.getScene(),a=i.materialDefines,n=i.effect;if(!a||!n)return;this._activeEffect=n,t.getMeshUniformBuffer().bindToEffect(n,"Mesh"),t.transferToEffect(e),this._uniformBuffer.bindToEffect(n,"Material"),this._eventInfo.subMesh=i,this._callbackPluginEventHardBindForSubMesh(this._eventInfo),a.OBJECTSPACE_NORMALMAP&&(e.toNormalMatrix(this._normalMatrix),this.bindOnlyNormalMatrix(this._normalMatrix));let s=this._mustRebind(r,n,i,t.visibility);M.BindBonesParameters(t,n);let o=this._uniformBuffer;if(s){this.bindViewProjection(n),(!o.useUbo||!this.isFrozen||!o.isSync)&&(r.texturesEnabled&&(this.bindTexture(this._diffuseTexture,o,n,"diffuse","vDiffuseInfos"),this.bindTexture(this._emissiveTexture,o,n,"emissive","vEmissiveInfos"),this._bumpTexture&&r.getEngine().getCaps().standardDerivatives&&(o.updateFloat3("vBumpInfos",this._bumpTexture.coordinatesIndex,1/this._bumpTexture.level,this._bumpScale),M.BindTextureMatrix(this._bumpTexture,o,"bump"),n.setTexture("bumpSampler",this._bumpTexture),r._mirroredCameraPosition?o.updateFloat2("vTangentSpaceParams",this._invertNormalMapX?1:-1,this._invertNormalMapY?1:-1):o.updateFloat2("vTangentSpaceParams",this._invertNormalMapX?-1:1,this._invertNormalMapY?-1:1)),this.bindTexture(this._shadeTexture,o,n,"shade","vShadeInfos"),this.bindTexture(this._receiveShadowTexture,o,n,"receiveShadow","vReceiveShadowInfos"),this.bindTexture(this._shadingGradeTexture,o,n,"shadingGrade","vShadingGradeInfos"),this.bindTexture(this._shadingShiftTexture,o,n,"shadingShift","vShadingShiftInfos"),this.bindTexture(this._rimTexture,o,n,"rim","vRimInfos"),this.bindTexture(this._matCapTexture,o,n,"matCap","vMatCapInfos"),this.bindTexture(this._outlineWidthTexture,o,n,"outlineWidth","vOutlineWidthInfos"),this.bindTexture(this._uvAnimationMaskTexture,o,n,"uvAnimationMask","vUvAnimationMaskInfos"),this._hasAlphaChannel()&&o.updateFloat("alphaCutOff",this.alphaCutOff)),this.pointsCloud&&o.updateFloat("pointSize",this.pointSize),o.updateFloat("receiveShadowRate",this._receiveShadowRate),o.updateFloat("shadingGradeRate",this._shadingGradeRate),o.updateFloat("shadeShift",this._shadeShift),o.updateFloat("shadeToony",this._shadeToony),o.updateFloat("shadingShiftTextureScale",this._shadingShiftTextureScale),o.updateFloat("lightColorAttenuation",this._lightColorAttenuation),o.updateFloat("indirectLightIntensity",this._indirectLightIntensity),o.updateFloat("rimLightingMix",this._rimLightingMix),o.updateFloat("rimFresnelPower",this._rimFresnelPower),o.updateFloat("rimLift",this._rimLift),o.updateFloat("outlineWidth",this._outlineWidth),o.updateFloat("outlineScaledMaxDistance",this._outlineScaledMaxDistance),o.updateFloat("outlineLightingMix",this._outlineLightingMix),o.updateFloat("uvAnimationScrollX",this._uvAnimationScrollX),o.updateFloat("uvAnimationScrollY",this._uvAnimationScrollY),o.updateFloat("uvAnimationRotation",this._uvAnimationRotation),r.ambientColor.multiplyToRef(this.ambientColor,this._globalAmbientColor),o.updateColor3("vAmbientColor",this._globalAmbientColor),o.updateColor4("vDiffuseColor",this.diffuseColor,this.alpha),o.updateColor3("vEmissiveColor",this.emissiveColor),o.updateColor3("vShadeColor",this.shadeColor),o.updateColor3("vMatcapColor",this.matcapColor),o.updateColor3("vRimColor",this.rimColor),o.updateColor4("vOutlineColor",this.outlineColor,1),o.updateVector3("vEyeUp",r.activeCamera.upVector));let u=r;u.useOrderIndependentTransparency&&this.needAlphaBlendingForMesh(t)&&u.depthPeelingRenderer&&u.depthPeelingRenderer.bind(n),this._eventInfo.subMesh=i,this._callbackPluginEventBindForSubMesh(this._eventInfo),un(n,this,r),this.bindEyePosition(n)}else r.getEngine()._features.needToAlwaysBindUniformBuffers&&(this._needToBindSceneUbo=!0);if(s||!this.isFrozen){r.lightsEnabled&&!this._disableLighting&&M.BindLights(r,t,n,a,this._maxSimultaneousLights),(r.fogEnabled&&t.applyFog&&r.fogMode!==fn.FOGMODE_NONE||t.receiveShadows)&&this.bindView(n),M.BindFogParameters(r,t,n),a.NUM_MORPH_INFLUENCERS&&M.BindMorphTargetParameters(t,n),a.BAKED_VERTEX_ANIMATION_TEXTURE&&t.bakedVertexAnimationManager?.bind(n,a.INSTANCES),this.useLogarithmicDepth&&M.BindLogDepth(a,n,r),this._imageProcessingConfiguration&&!this._imageProcessingConfiguration.applyByPostProcess&&this._imageProcessingConfiguration.bind(this._activeEffect),o.updateFloat("aspect",r.getEngine().getAspectRatio(r.activeCamera)),o.updateFloat("isOutline",this.isOutline);let u=cn.Now/1e3;this._timeVector4.set(u/20,u,u*2,u*3),o.updateVector4("time",this._timeVector4)}this._afterBind(t,this._activeEffect),o.update()}getAnimatables(){let e=super.getAnimatables();for(let t of this.appendedActiveTextures)t.animations&&t.animations.length>0&&e.push(t);return e}getActiveTextures(){return super.getActiveTextures().concat(this.appendedActiveTextures)}hasTexture(e){if(super.hasTexture(e))return!0;for(let t of this.appendedActiveTextures)if(t===e)return!0;return!1}dispose(e,t){if(delete this.outlineRenderer,t)for(let i of this.appendedActiveTextures)i.dispose();this._imageProcessingConfiguration&&this._imageProcessingObserver&&this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver),super.dispose(e,t)}clone(e){let t=ct.Clone(()=>new f(e,this.getScene()),this);return t.name=e,t.id=e,this.stencil.copyTo(t.stencil),t}static Parse(e,t,i){let r=ct.Parse(()=>new f(e.name,t),e,t,i);return e.stencil&&r.stencil.parse(e.stencil,t,i),r}bindTexture(e,t,i,r,a){e&&(this._uniformBuffer.updateFloat2(a,e.coordinatesIndex,e.level),M.BindTextureMatrix(e,t,r),i.setTexture(`${r}Sampler`,e))}isReadyForTexture(e,t,i){return e?e.isReadyOrNotBlocking()?(M.PrepareDefinesForMergedUV(e,t,i),!0):!1:(t[i]=!1,!0)}applyDefines(e){switch(this._debugMode){case 1:e.MTOON_DEBUG_NORMAL!==!0&&(e.MTOON_DEBUG_NORMAL=!0,e.MTOON_DEBUG_LITSHADERATE=!1,e.markAsUnprocessed());break;case 2:e.MTOON_DEBUG_LITSHADERATE!==!0&&(e.MTOON_DEBUG_NORMAL=!1,e.MTOON_DEBUG_LITSHADERATE=!0,e.markAsUnprocessed());break;case 0:e.MTOON_DEBUG_NORMAL===!0&&(e.MTOON_DEBUG_NORMAL=!1,e.markAsUnprocessed()),e.MTOON_DEBUG_LITSHADERATE===!0&&(e.MTOON_DEBUG_LITSHADERATE=!1,e.markAsUnprocessed())}switch(this.outlineWidthMode){case 1:e.MTOON_OUTLINE_WIDTH_WORLD!==!0&&(e.MTOON_OUTLINE_WIDTH_WORLD=!0,e.MTOON_OUTLINE_WIDTH_SCREEN=!1,e.markAsUnprocessed());break;case 2:e.MTOON_OUTLINE_WIDTH_SCREEN!==!0&&(e.MTOON_OUTLINE_WIDTH_WORLD=!1,e.MTOON_OUTLINE_WIDTH_SCREEN=!0,e.markAsUnprocessed());break;case 0:(e.MTOON_OUTLINE_WIDTH_SCREEN!==!1||e.MTOON_OUTLINE_WIDTH_WORLD!==!1)&&(e.MTOON_OUTLINE_WIDTH_SCREEN=!1,e.MTOON_OUTLINE_WIDTH_WORLD=!1,e.markAsUnprocessed())}switch(this.outlineColorMode){case 0:e.MTOON_OUTLINE_COLOR_FIXED!==!0&&(e.MTOON_OUTLINE_COLOR_FIXED=!0,e.MTOON_OUTLINE_COLOR_MIXED=!1,e.markAsUnprocessed());break;case 1:e.MTOON_OUTLINE_COLOR_MIXED!==!0&&(e.MTOON_OUTLINE_COLOR_FIXED=!1,e.MTOON_OUTLINE_COLOR_MIXED=!0,e.markAsUnprocessed())}}},l=vn(De),Oe=new WeakMap,be=new WeakMap,ye=new WeakMap,we=new WeakMap,Fe=new WeakMap,Ue=new WeakMap,We=new WeakMap,Ve=new WeakMap,Xe=new WeakMap,Be=new WeakMap,ke=new WeakMap,Ge=new WeakMap,He=new WeakMap,ze=new WeakMap,Ye=new WeakMap,Qe=new WeakMap,$e=new WeakMap,je=new WeakMap,Ke=new WeakMap,qe=new WeakMap,Ze=new WeakMap,Je=new WeakMap,et=new WeakMap,p(l,4,"diffuseTexture",Wi,f,Oe),p(l,4,"emissiveTexture",Fi,f,be),p(l,4,"bumpTexture",yi,f,ye),p(l,4,"shadeTexture",Oi,f,we),p(l,4,"receiveShadowTexture",Li,f,Fe),p(l,4,"shadingGradeTexture",Ci,f,Ue),p(l,4,"shadingShiftTexture",Pi,f,We),p(l,4,"rimTexture",Ii,f,Ve),p(l,4,"matCapTexture",vi,f,Xe),p(l,4,"outlineWidthTexture",Ai,f,Be),p(l,4,"uvAnimationMaskTexture",Mi,f,ke),p(l,4,"useEmissiveAsIllumination",di,f,Ge),p(l,4,"linkEmissiveWithDiffuse",hi,f,He),p(l,4,"useReflectionOverAlpha",li,f,ze),p(l,4,"disableLighting",si,f,Ye),p(l,4,"useAlphaFromDiffuseTexture",ri,f,Qe),p(l,4,"maxSimultaneousLights",ti,f,$e),p(l,4,"invertNormalMapX",Jt,f,je),p(l,4,"invertNormalMapY",qt,f,Ke),p(l,4,"twoSidedLighting",jt,f,qe),p(l,2,"bumpScale",$t,f),p(l,2,"receiveShadowRate",Qt,f),p(l,2,"shadingGradeRate",Yt,f),p(l,2,"shadeShift",zt,f),p(l,2,"shadeToony",Ht,f),p(l,2,"shadingShiftTextureScale",Gt,f),p(l,2,"lightColorAttenuation",kt,f),p(l,2,"indirectLightIntensity",Bt,f),p(l,2,"rimLightingMix",Xt,f),p(l,2,"rimFresnelPower",Vt,f),p(l,2,"rimLift",Wt,f),p(l,2,"outlineWidth",Ut,f),p(l,2,"outlineScaledMaxDistance",Ft,f),p(l,2,"outlineLightingMix",wt,f),p(l,2,"uvAnimationScrollX",yt,f),p(l,2,"uvAnimationScrollY",bt,f),p(l,2,"uvAnimationRotation",Ot,f),p(l,2,"alphaTest",Lt,f),p(l,2,"alphaBlend",Nt,f),p(l,4,"debugMode",Rt,f,Ze),p(l,4,"outlineColorMode",Pt,f,Je),p(l,2,"cullMode",Et,f),p(l,4,"outlineCullMode",xt,f,et),p(l,2,"useLogarithmicDepth",At,f),p(l,5,"_diffuseTexture",Vi,f),p(l,5,"_emissiveTexture",Ui,f),p(l,5,"_bumpTexture",wi,f),p(l,5,"_shadeTexture",bi,f),p(l,5,"_receiveShadowTexture",Di,f),p(l,5,"_shadingGradeTexture",Ni,f),p(l,5,"_shadingShiftTexture",Ri,f),p(l,5,"_rimTexture",Ei,f),p(l,5,"_matCapTexture",xi,f),p(l,5,"_outlineWidthTexture",Si,f),p(l,5,"_uvAnimationMaskTexture",Ti,f),p(l,5,"diffuseColor",_i,f),p(l,5,"ambientColor",gi,f),p(l,5,"emissiveColor",pi,f),p(l,5,"shadeColor",mi,f),p(l,5,"matcapColor",ci,f),p(l,5,"rimColor",fi,f),p(l,5,"outlineColor",ui,f),p(l,5,"_disableLighting",oi,f),p(l,5,"alphaCutOff",ai,f),p(l,5,"_useAlphaFromDiffuseTexture",ni,f),p(l,5,"_maxSimultaneousLights",ii,f),p(l,5,"_invertNormalMapX",ei,f),p(l,5,"_invertNormalMapY",Zt,f),p(l,5,"_twoSidedLighting",Kt,f),p(l,5,"_alphaTest",Dt,f),p(l,5,"_debugMode",Ct,f),p(l,5,"_outlineCullMode",It,f),p(l,5,"flipU",vt,f),p(l,5,"flipV",St,f),dr(l,f),f),oe={_MainTex:"albedoTexture"},Me={_Color:"albedoColor"},le={_MainTex:"diffuseTexture",_EmissionMap:"emissiveTexture",_BumpMap:"bumpTexture",_ShadeTexture:"shadeTexture",_ReceiveShadowTexture:"receiveShadowTexture",_ShadingGradeTexture:"shadingGradeTexture",_RimTexture:"rimTexture",_SphereAdd:"matCapTexture",_OutlineWidthTexture:"outlineWidthTexture",_UvAnimMaskTexture:"uvAnimationMaskTexture"},Te={_Color:"diffuseColor",_ShadeColor:"shadeColor",_RimColor:"rimColor",_EmissionColor:"emissiveColor",_OutlineColor:"outlineColor"};function zi(e){return e.match(/^(_[^_]+)/)?.[1]??null}var Zn=class{materialValues;m_materialMap={};m_materialSetterMap={};m_materialValueMap={};m_used={};baseValueCache={};materialValuesToApply={};constructor(e,t){this.materialValues=t,e.length!==0&&t.length!==0&&(e.forEach(i=>{(i instanceof V||i instanceof re)&&(this.m_materialMap[i.name]=i)}),t.forEach(i=>{let r=this.makeBindingKey(i);if(this.m_materialSetterMap[r])return;let a=this.m_materialMap[i.materialName];if(!a)return;let n=this.getMaterialProperty(a,i.propertyName);if(!n||i.targetValue.length!==4)return;this.baseValueCache[r]=n,this.materialValuesToApply[r]=i;let s=Ie.FromArray(i.targetValue),o=i.propertyName;(a instanceof re?Object.keys(oe):Object.keys(le)).some(u=>o.startsWith(u))&&(s.w*=-1),o.endsWith("_ST_S")?this.m_materialSetterMap[r]=this.createSetter(a,o,n,s,"u"):o.endsWith("_ST_T")?this.m_materialSetterMap[r]=this.createSetter(a,o,n,s,"v"):this.m_materialSetterMap[r]=this.createSetter(a,o,n,s,null)}))}createSetter(e,t,i,r,a){return(n,s)=>{let o=s?i.add(r.subtract(i).scale(n)):this.getMaterialProperty(e,t).add(r.subtract(i).scale(n));if(a===null){this.updateMaterialProperty(e,t,o);return}let u=this.getMaterialProperty(e,t);a==="u"?(u.x=o.x,u.z=o.z):(u.y=o.y,u.w=o.w),this.updateMaterialProperty(e,t,u)}}makeBindingKey(e){return`${e.materialName}_${e.propertyName}_${e.targetValue.join("-")}`}makeTargetKey(e){return`${e.materialName}_${e.propertyName}`}morphing(e){this.accumulateValue(e),this.apply()}accumulateValue(e){this.materialValues.forEach(t=>{let i=this.makeBindingKey(t);this.m_materialValueMap[i]?this.m_materialValueMap[i]+=e:this.m_materialValueMap[i]=e})}apply(){this.m_used={},Object.entries(this.materialValuesToApply).forEach(([e,t])=>{let i=this.makeTargetKey(t);if(!(i in this.m_used)){let a=this.m_materialMap[t.materialName],n=this.baseValueCache[e].clone(),s=t.propertyName;if(s.endsWith("_ST_S")){let o=this.getMaterialProperty(a,s);n.y=o.y,n.w=o.w}else if(s.endsWith("_ST_T")){let o=this.getMaterialProperty(a,s);n.x=o.x,n.z=o.z}this.updateMaterialProperty(a,s,n),this.m_used[i]=!0}let r=this.m_materialSetterMap[e];r&&r(this.m_materialValueMap[e],!1)}),this.m_materialValueMap={}}getMaterialProperty(e,t){let i=zi(t);if(!i)return null;if(e instanceof re){if(oe[i])return this.convertTextureIntoVector4WhenNotNull(e[oe[i]]);if(Me[i])return this.convertColorIntoVector4(e[Me[i]],e.alpha)}else{if(le[i])return this.convertTextureIntoVector4WhenNotNull(e[le[i]]);if(Te[i])return this.convertColorIntoVector4(e[Te[i]],e.alpha)}return null}convertTextureIntoVector4WhenNotNull(e){if(!e)return null;let t=e;return new Ie(t.uScale,t.vScale,t.uOffset,t.vOffset)}convertColorIntoVector4(e,t){return new Ie(e.r,e.g,e.b,t)}updateMaterialProperty(e,t,i){let r=zi(t);r&&(e instanceof re?oe[r]?this.updateTextureWhenNotNull(e[oe[r]],i):Me[r]&&(r==="_Color"&&(e.alpha=i.w),this.updateColor(e[Me[r]],i)):le[r]?this.updateTextureWhenNotNull(e[le[r]],i):Te[r]&&(r==="_Color"&&(e.alpha=i.w),this.updateColor(e[Te[r]],i)))}updateTextureWhenNotNull(e,t){if(e){let i=e;i.uScale=t.x,i.vScale=t.y,i.uOffset=t.z,i.vOffset=t.w}}updateColor(e,t){e.r=t.x,e.g=t.y,e.b=t.z}},mr=class{loader;constructor(e){this.loader=e}generate(e,t,i,r,a){let n=this.findMaterialPropertyByName(t.name,this.getMaterialProperties());if(!n||!i)return null;i.alphaIndex=n.renderQueue;let s=this.createMaterialByShader(e,t,r,n);return s?(a(s),s instanceof V?this.loadMToonTexturesAsync(e,s,n):Promise.resolve(s)):null}getMaterialProperties(){let e=this.loader.gltf.extensions;return e?e.VRM?.materialProperties?e.VRM.materialProperties:e.VCAST_vci_material_unity?.materials??[]:[]}findMaterialPropertyByName(e,t){if(!e||!t)return null;let i=t.filter(r=>r.name===e);return i.length===0?null:(i.length>=2&&this.loader.log(`Duplicated vrm material name found: ${e}`),i[i.length-1])}loadMToonTexturesAsync(e,t,i){let r=[],a=i.vectorProperties._MainTex;if(!a)return Promise.resolve(t);let n=(s,o)=>{x(s,u=>{r.push(this.loader.loadTextureInfoAsync(`${e}/textures/${s}`,{index:u},g=>{let c=g;c.uOffset=a[0],c.vOffset=a[1],c.uScale=a[2],c.vScale=a[3],o(g)}))})};return n(i.textureProperties._MainTex,s=>{(t.alphaBlend||t.alphaTest)&&(s.hasAlpha=!0),t.diffuseTexture=s}),n(i.textureProperties._ShadeTexture,s=>t.shadeTexture=s),n(i.textureProperties._BumpMap,s=>t.bumpTexture=s),n(i.textureProperties._ReceiveShadowTexture,s=>t.receiveShadowTexture=s),n(i.textureProperties._ShadingGradeTexture,s=>t.shadingGradeTexture=s),n(i.textureProperties._RimTexture,s=>t.rimTexture=s),n(i.textureProperties._SphereAdd,s=>t.matCapTexture=s),n(i.textureProperties._EmissionMap,s=>t.emissiveTexture=s),n(i.textureProperties._OutlineWidthTexture,s=>t.outlineWidthTexture=s),n(i.textureProperties._UvAnimMaskTexture,s=>t.uvAnimationMaskTexture=s),Promise.all(r).then(()=>t)}createMaterialByShader(e,t,i,r){if(r.shader===Bi.VRMMToon){let a=new V(t.name||`MToonMaterial${t.index}`,this.loader.babylonScene);return this.setMToonMaterialProperties(a,r),a}if(r.shader===Bi.VRMUnlitTransparentZWrite){let a=this.loader.createMaterial(e,t,i);return a.disableDepthWrite=!1,a.forceDepthWrite=!0,a}return null}setMToonMaterialProperties(e,t){x(t.floatProperties._Cutoff,i=>e.alphaCutOff=i),x(t.vectorProperties._Color,i=>{e.diffuseColor=new N(i[0],i[1],i[2]),e.alpha=i[3]}),x(t.vectorProperties._ShadeColor,i=>{e.shadeColor=new N(i[0],i[1],i[2])}),x(t.floatProperties._BumpScale,i=>e.bumpScale=i),x(t.floatProperties._ReceiveShadowRate,i=>e.receiveShadowRate=i),x(t.floatProperties._ShadingGradeRate,i=>e.shadingGradeRate=i),x(t.floatProperties._ShadeShift,i=>e.shadeShift=i),x(t.floatProperties._ShadeToony,i=>e.shadeToony=i),x(t.floatProperties._LightColorAttenuation,i=>e.lightColorAttenuation=i),x(t.floatProperties._IndirectLightIntensity,i=>e.indirectLightIntensity=i),x(t.vectorProperties._RimColor,i=>{e.rimColor=new N(i[0],i[1],i[2])}),x(t.floatProperties._RimLightingMix,i=>e.rimLightingMix=i),x(t.floatProperties._RimFresnelPower,i=>e.rimFresnelPower=i),x(t.floatProperties._RimLift,i=>e.rimLift=i),x(t.vectorProperties._EmissionColor,i=>{e.emissiveColor=new N(i[0],i[1],i[2])}),x(t.floatProperties._OutlineWidth,i=>e.outlineWidth=i),x(t.floatProperties._OutlineScaledMaxDistance,i=>e.outlineScaledMaxDistance=i),x(t.vectorProperties._OutlineColor,i=>{e.outlineColor=new N(i[0],i[1],i[2])}),x(t.floatProperties._OutlineLightingMix,i=>e.outlineLightingMix=i),x(t.floatProperties._UvAnimScrollX,i=>e.uvAnimationScrollX=i),x(t.floatProperties._UvAnimScrollY,i=>e.uvAnimationScrollY=i),x(t.floatProperties._UvAnimRotation,i=>e.uvAnimationRotation=i),x(t.floatProperties._DebugMode,i=>e.debugMode=i),x(t.floatProperties._BlendMode,i=>{switch(i){case 0:e.alphaBlend=!1,e.alphaTest=!1;break;case 1:e.alphaBlend=!1,e.alphaTest=!0,e.alphaMode=Ce.ALPHA_COMBINE;break;case 2:e.alphaBlend=!0,e.alphaTest=!1,e.alphaMode=Ce.ALPHA_COMBINE}}),x(t.floatProperties._OutlineWidthMode,i=>e.outlineWidthMode=i),x(t.floatProperties._OutlineColorMode,i=>e.outlineColorMode=i),x(t.floatProperties._CullMode,i=>e.cullMode=i),x(t.floatProperties._OutlineCullMode,i=>e.outlineCullMode=i),x(t.keywordMap._ALPHABLEND_ON,i=>e.alphaBlend=i),x(t.keywordMap._ALPHATEST_ON,i=>e.alphaTest=i),x(t.floatProperties._ZWrite,i=>{e.forceDepthWrite=Math.round(i)===1,e.forceDepthWrite&&(e.disableDepthWrite=!1)})}};function x(e,t){e!==void 0&&t(e)}var pr="VCAST_vci_material_unity",Jn=class{loader;name=pr;enabled=!0;constructor(e){this.loader=e}dispose(){this.loader=null}_loadMaterialAsync(e,t,i,r,a){return new mr(this.loader).generate(e,t,i,r,a)}};z.RegisterExtension(pr,e=>new Jn(e));function gr(e){return e._internalMetadata?.gltf?.pointers??[]}function H(e,t,i,r){for(let a=t;a<e.length;a++){let n=e[a];for(let s of gr(n)){let o=s.match(i);if(o){r(parseInt(o[1],10),n);break}}}}var it="vciManagers",ea=class{meta;embeddedScript;audios;subItems;colliderNodes;rigidbodyNodes;jointNodes;decodeAsync;scene;gltfNodes;transformNodeCache={};meshesFrom;_rootMesh;constructor(e,t,i,r,a,n){this.scene=i,this.gltfNodes=t,this.meshesFrom=r,this._rootMesh=this.scene.meshes[r]??null,this.meta=e?.VCAST_vci_meta??null,this.embeddedScript=null,this.audios=[],this.subItems=[],this.colliderNodes=[],this.rigidbodyNodes=[],this.jointNodes=[],this.constructTransformNodeCache(a),this.constructNodeExtensions();let s=e?.VCAST_vci_embedded_script;s?.scripts&&(this.embeddedScript={scripts:s.scripts.map(u=>({name:u.name,mimeType:u.mimeType,targetEngine:u.targetEngine,text:""})),entryPoint:s.entryPoint});let o=e?.VCAST_vci_audios;this.audios=(o?.audios??[]).map(u=>({name:u.name,mimeType:u.mimeType,data:new ArrayBuffer(0)})),this.decodeAsync=this.decodeBufferViews(s?.scripts??[],o?.audios??[],n)}get rootMesh(){return this._rootMesh}dispose(){this.gltfNodes=null,this.transformNodeCache=null,this.subItems=null,this.colliderNodes=null,this.rigidbodyNodes=null,this.jointNodes=null,this.embeddedScript=null,this.audios=null,this._rootMesh=null}findTransformNode(e){return this.transformNodeCache[e]||null}getSubItem(e){return this.subItems.find(t=>t.node===e)??null}constructTransformNodeCache(e){H(this.scene.transformNodes,e,/^\/nodes\/(\d+)$/,(t,i)=>{this.transformNodeCache[t]=i}),H(this.scene.meshes,this.meshesFrom,/^\/nodes\/(\d+)$/,(t,i)=>{this.transformNodeCache[t]=this.transformNodeCache[t]??i})}constructNodeExtensions(){this.gltfNodes&&this.gltfNodes.forEach((e,t)=>{let i=e.extensions;if(!i)return;let r=i.VCAST_vci_item,a=i.VCAST_vci_collider,n=i.VCAST_vci_rigidbody,s=i.VCAST_vci_joints;if(!r&&!a&&!n&&!s)return;let o=this.findTransformNode(t);if(!o){P.Warn(`VCI node extension found but TransformNode missing: nodes/${t}`);return}r&&this.subItems.push({nodeIndex:t,node:o,item:r}),a?.colliders&&this.colliderNodes.push({nodeIndex:t,node:o,colliders:a.colliders}),n?.rigidbodies&&this.rigidbodyNodes.push({nodeIndex:t,node:o,rigidbodies:n.rigidbodies}),s?.joints&&this.jointNodes.push({nodeIndex:t,node:o,joints:s.joints})})}async decodeBufferViews(e,t,i){let r=this.embeddedScript;r&&await Promise.all(e.map(async(a,n)=>{try{let s=await i(a.source,`VCAST_vci_embedded_script/scripts/${n}/source`);r.scripts[n].text=new TextDecoder("utf-8").decode(s)}catch(s){P.Error(`Failed to decode VCI embedded script ${a.name}: ${s}`)}})),await Promise.all(t.map(async(a,n)=>{try{let s=await i(a.bufferView,`VCAST_vci_audios/audios/${n}/bufferView`);this.audios[n].data=s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength)}catch(s){P.Error(`Failed to decode VCI audio ${a.name}: ${s}`)}}))}},_r=["VCAST_vci_meta","VCAST_vci_embedded_script","VCAST_vci_audios"],Mr=["VCAST_vci_item","VCAST_vci_collider","VCAST_vci_rigidbody","VCAST_vci_joints"],ta=[..._r,...Mr],Yi=new WeakSet,ia=class{loader;name;enabled=!0;meshesFrom;transformNodesFrom;constructor(e,t){this.loader=e,this.name=t,this.meshesFrom=this.loader.babylonScene.meshes.length-1,this.transformNodesFrom=this.loader.babylonScene.transformNodes.length}dispose(){this.loader=null}loadSceneAsync(e,t){return this.loader.loadSceneAsync(e,t).then(()=>this.setupAsync())}setupAsync(){let e=this.loader;if(Yi.has(e))return Promise.resolve();Yi.add(e);let t=e.gltf,i=e.babylonScene,r=_r.some(s=>t.extensions?.[s]!==void 0),a=t.nodes?.some(s=>Mr.some(o=>s.extensions?.[o]!==void 0))??!1;if(!r&&!a)return Promise.resolve();let n=new ea(t.extensions,t.nodes,i,this.meshesFrom,this.transformNodesFrom,(s,o)=>{let u=t.bufferViews?.[s];return u?e.loadBufferViewAsync(`${o}/bufferViews/${s}`,u):Promise.reject(Error(`${o}: bufferView ${s} not found`))});return i.metadata=i.metadata||{},i.metadata[it]=i.metadata.vciManagers||[],i.metadata[it].push(n),i.onDisposeObservable.add(()=>{n.dispose(),i.metadata[it]=[]}),n.decodeAsync}};for(let e of ta)z.RegisterExtension(e,t=>new ia(t,e));var ra=class{radius;sphere;constructor(e,t){this.radius=e,this.sphere=t}},na=class{transform;colliders=[];constructor(e){this.transform=e}addCollider(e,t){let i=_n.CreateSphere(`${this.transform.name}_ColliderSphere`,{segments:6,diameter:t*2,updatable:!0},this.transform.getScene());i.setParent(this.transform),i.setPositionWithLocalVector(e),i.setEnabled(!1),this.colliders.push(new ra(t,i))}},Qi=W.Identity(),O=new d,he=new d,aa=new d,$i=new S,w=new W,ee=new W,sa=class{center;radius;transform;initialLocalMatrix;initialLocalRotation;initialLocalChildPosition;centerSpaceBoneLength;centerSpacePosition;boneAxis;currentTail=new d;prevTail=new d;nextTail=new d;constructor(e,t,i){this.center=e,this.radius=t,this.transform=i,i.rotationQuaternion||=i.rotation.toQuaternion();let r=i.getWorldMatrix();this.centerSpacePosition=r.getTranslation(),this.initialLocalMatrix=i._localMatrix.clone(),this.initialLocalRotation=i.rotationQuaternion.clone();let a=i.getChildTransformNodes(!0);this.initialLocalChildPosition=a.length===0?i.position.clone().normalize().scaleInPlace(.07):a[0].position.clone(),d.TransformCoordinatesToRef(this.initialLocalChildPosition,r,this.currentTail),this.prevTail.copyFrom(this.currentTail),this.nextTail.copyFrom(this.currentTail),this.boneAxis=this.initialLocalChildPosition.normalizeToNew(),d.TransformCoordinatesToRef(this.initialLocalChildPosition,r,O),this.centerSpaceBoneLength=O.subtractInPlace(this.centerSpacePosition).length(),e&&(this.getMatrixWorldToCenter(w),d.TransformCoordinatesToRef(this.currentTail,w,this.currentTail),d.TransformCoordinatesToRef(this.prevTail,w,this.prevTail),d.TransformCoordinatesToRef(this.nextTail,w,this.nextTail),r.multiplyToRef(w,w),w.getTranslationToRef(this.centerSpacePosition),d.TransformCoordinatesToRef(this.initialLocalChildPosition,w,O),this.centerSpaceBoneLength=O.subtractInPlace(this.centerSpacePosition).length())}update(e,t,i,r){if(Number.isNaN(this.transform.getAbsolutePosition().x))return;this.getMatrixWorldToCenter(w),this.transform.getWorldMatrix().multiplyToRef(w,w),w.getTranslationToRef(this.centerSpacePosition),this.getMatrixWorldToCenter(ee),this.getParentMatrixWorld().multiplyToRef(ee,ee),this.nextTail.copyFrom(this.currentTail),O.copyFrom(this.currentTail).subtractInPlace(this.prevTail).scaleInPlace(1-t),this.nextTail.addInPlace(O),O.copyFrom(this.boneAxis),d.TransformCoordinatesToRef(O,this.initialLocalMatrix,O),d.TransformCoordinatesToRef(O,ee,O),O.subtractInPlace(this.centerSpacePosition).normalize().scaleInPlace(e),this.nextTail.addInPlace(O),this.nextTail.addInPlace(i),this.nextTail.subtractInPlace(this.centerSpacePosition).normalize().scaleInPlace(this.centerSpaceBoneLength).addInPlace(this.centerSpacePosition),this.collide(r,this.nextTail),this.prevTail.copyFrom(this.currentTail),this.currentTail.copyFrom(this.nextTail),this.initialLocalMatrix.multiplyToRef(ee,w);let a=w.invert();d.TransformCoordinatesToRef(this.nextTail,a,O),O.normalizeToRef(he),S.FromUnitVectorsToRef(this.boneAxis,he,$i);let n=$i;this.initialLocalRotation.multiplyToRef(n,this.transform.rotationQuaternion),this.transform.computeWorldMatrix(!0)}getMatrixWorldToCenter(e){return this.center?this.center.getWorldMatrix().invertToRef(e):e.copyFrom(Qi),e}getParentMatrixWorld(){return this.transform.parent?this.transform.parent.getWorldMatrix():Qi}collide(e,t){let i=this.getMatrixWorldToCenter(ee);e.forEach(r=>{r.colliders.forEach(a=>{a.sphere.computeWorldMatrix().multiplyToRef(i,w),w.getTranslationToRef(O);let n=O,s=a.sphere.absoluteScaling,o=Math.max(Math.abs(s.x),Math.abs(s.y),Math.abs(s.z)),u=a.radius*o,g=this.radius+u;if(t.subtractToRef(n,he),he.lengthSquared()<=g*g){let c=he.copyFrom(t).subtractInPlace(n).normalize(),m=aa.copyFrom(n).addInPlace(c.scaleInPlace(g));t.copyFrom(m.subtractInPlace(this.centerSpacePosition).normalize().scaleInPlace(this.centerSpaceBoneLength).addInPlace(this.centerSpacePosition))}})})}},oa=class{comment;stiffness;gravityPower;gravityDir;dragForce;center;hitRadius;colliderGroups;verlets=[];activeBones;constructor(e,t,i,r,a,n,s,o,u){this.comment=e,this.stiffness=t,this.gravityPower=i,this.gravityDir=r,this.dragForce=a,this.center=n,this.hitRadius=s,this.colliderGroups=u,this.activeBones=o.filter(g=>g!==null),this.activeBones.forEach(g=>{[g].concat(g.getChildTransformNodes()).forEach(c=>{this.verlets.push(new sa(this.center,this.hitRadius,c))})})}update(e){let t=this.stiffness*e,i=this.gravityDir.scale(this.gravityPower*e);this.verlets.forEach(r=>{r.update(t,this.dragForce,i,this.colliderGroups)})}},la=class{ext;springs;constructor(e,t){this.ext=e;let i=this.constructColliderGroups(t);this.springs=this.constructSprings(t,i)}dispose(){this.springs.length=0}update(e){let t=Math.max(0,Math.min(16.666,e))/1e3;this.springs.forEach(i=>{i.update(t)})}constructColliderGroups(e){if(!this.ext.colliderGroups||!this.ext.colliderGroups.length)return[];let t=[];return this.ext.colliderGroups.forEach(i=>{let r=new na(e(i.node));i.colliders.forEach(a=>{r.addCollider(new d(a.offset.x,a.offset.y,a.offset.z),a.radius)}),t.push(r)}),t}constructSprings(e,t){if(!this.ext.boneGroups||!this.ext.boneGroups.length)return[];let i=[];return this.ext.boneGroups.forEach(r=>{let a=(r.bones||[]).map(o=>e(o)),n=(r.colliderGroups||[]).map(o=>t[o]),s=r.gravityDir??{x:0,y:-1,z:0};i.push(new oa(r.comment,r.stiffiness,r.gravityPower,new d(-s.x,s.y,s.z).normalize(),r.dragForce,e(r.center),r.hitRadius,a,n))}),i}},ha=class{ext;scene;meshesFrom;transformNodesFrom;materialsNodesFrom;isBinaryMorphMap={};morphTargetMap={};materialValueBindingMergerMap={};presetMorphTargetMap={};morphValueMap={};transformNodeMap={};transformNodeCache={};meshCache={};_humanoidBone;_rootMesh;_lookAt=null;_firstPerson;springBoneController;constructor(e,t,i,r,a){this.ext=e,this.scene=t,this.meshesFrom=i,this.transformNodesFrom=r,this.materialsNodesFrom=a,this._rootMesh=this.scene.meshes[this.meshesFrom],this.meshCache=this.constructMeshCache(),this.transformNodeCache=this.constructTransformNodeCache(),this.springBoneController=new la(this.ext.secondaryAnimation,this.findTransformNode.bind(this)),this.ext.blendShapeMaster&&this.ext.blendShapeMaster.blendShapeGroups&&(this.constructIsBinaryMap(),this.constructMorphTargetMap(),this.constructMaterialValueBindingMergerMap()),this.constructTransformNodeMap(),this._humanoidBone=new Ln(this.transformNodeMap),this._firstPerson=new Nn(this.ext.firstPerson,this.getFirstPersonBone(),this.findMeshes.bind(this)),this._lookAt=new Vn(this.getFirstPersonBone(),this.ext.firstPerson,this._humanoidBone,this)}async update(e){this._lookAt&&this._lookAt.update(),this.springBoneController.update(e)}dispose(){this.springBoneController.dispose(),this._humanoidBone.dispose(),this._firstPerson.dispose(),this.morphTargetMap=null,this.materialValueBindingMergerMap=null,this.presetMorphTargetMap=null,this.morphValueMap=null,this.transformNodeMap=null,this.transformNodeCache=null,this.meshCache=null,this._rootMesh=null,this._lookAt=null,this._firstPerson=null}morphing(e,t){let i=this.calcMorphValue(e,t);this.morphValueMap[e]=i,this.morphTargetMap[e]&&this.morphTargetMap[e].forEach(r=>{r.target.influence=i*(r.weight/100)}),this.materialValueBindingMergerMap[e]&&this.materialValueBindingMergerMap[e].morphing(i)}morphingPreset(e,t){if(!this.presetMorphTargetMap[e])return;let i=this.calcMorphValue(e,t);this.morphValueMap[e]=i,this.presetMorphTargetMap[e].forEach(r=>{r.target.influence=i*(r.weight/100)})}getMorphingValue(e){return this.morphValueMap[e]??0}resetMorphing(){Object.keys(this.morphTargetMap).forEach(e=>{this.morphing(e,0)}),Object.keys(this.presetMorphTargetMap).forEach(e=>{this.morphingPreset(e,0)})}calcMorphValue(e,t){let i=Math.max(0,Math.min(1,t));return this.isBinaryMorphMap[e]?+(i>.5):i}getMorphingList(){return Object.keys(this.morphTargetMap)}getFirstPersonCameraPosition(){let e=this.getFirstPersonBone();if(!e||!this.ext.firstPerson)return null;let t=e.getAbsolutePosition(),i=this.ext.firstPerson.firstPersonBoneOffset;return new d(t.x+i.x,t.y+i.y,t.z+i.z)}getFirstPersonBone(){return!this.ext.firstPerson||typeof this.ext.firstPerson.firstPersonBone!="number"?null:this.findTransformNode(this.ext.firstPerson.firstPersonBone)}get meta(){return this.ext.meta}get lookAt(){return this._lookAt}get firstPerson(){return this._firstPerson}get humanoidBone(){return this._humanoidBone}get rootMesh(){return this._rootMesh}findTransformNode(e){return this.transformNodeCache[e]||null}findMeshes(e){return this.meshCache[e]||null}constructIsBinaryMap(){this.ext.blendShapeMaster.blendShapeGroups.forEach(e=>{this.isBinaryMorphMap[e.name]=e.isBinary})}constructMorphTargetMap(){this.ext.blendShapeMaster.blendShapeGroups.forEach(e=>{e.binds&&e.binds.forEach(t=>{let i=this.findMeshes(t.mesh);if(!i){P.Warn(`Undefined BlendShapeBind Mesh: ${JSON.stringify(t)}`);return}i.forEach(r=>{let a=r.morphTargetManager;if(!a){P.Warn(`Undefined morphTargetManager: ${JSON.stringify(t)}`);return}let n=a.getTarget(t.index);this.morphTargetMap[e.name]=this.morphTargetMap[e.name]||[],this.morphTargetMap[e.name].push({target:n,weight:t.weight}),e.presetName&&(this.presetMorphTargetMap[e.presetName]=this.presetMorphTargetMap[e.presetName]||[],this.presetMorphTargetMap[e.presetName].push({target:n,weight:t.weight}))})})})}constructMaterialValueBindingMergerMap(){let e=this.scene.materials.slice(this.materialsNodesFrom);this.ext.blendShapeMaster.blendShapeGroups.forEach(t=>{t.materialValues&&(this.materialValueBindingMergerMap[t.name]=new Zn(e,t.materialValues))})}constructTransformNodeMap(){this.ext.humanoid.humanBones.forEach(e=>{let t=this.findTransformNode(e.node);t&&(this.transformNodeMap[e.bone]=t)})}constructTransformNodeCache(){let e={};return H(this.scene.transformNodes,this.transformNodesFrom,/^\/nodes\/(\d+)/,(t,i)=>{e[t]=i}),H(this.scene.meshes,this.meshesFrom,/^\/nodes\/(\d+)/,(t,i)=>{e[t]=e[t]??i}),e}constructMeshCache(){let e={};return H(this.scene.meshes,this.meshesFrom,/^\/meshes\/(\d+)/,(t,i)=>{e[t]=e[t]||[],e[t].push(i)}),e}},Ee="VRM",rt="vrmManagers",da=class{loader;name=Ee;enabled=!0;meshesFrom=0;transformNodesFrom=0;materialsFrom=0;constructor(e){this.loader=e,this.meshesFrom=this.loader.babylonScene.meshes.length-1,this.transformNodesFrom=this.loader.babylonScene.transformNodes.length,this.materialsFrom=this.loader.babylonScene.materials.length}dispose(){this.loader=null}onReady(){if(!this.loader.gltf.extensions||!this.loader.gltf.extensions[Ee])return;let e=this.loader.babylonScene,t=new ha(this.loader.gltf.extensions[Ee],this.loader.babylonScene,this.meshesFrom,this.transformNodesFrom,this.materialsFrom);e.metadata=e.metadata||{},e.metadata[rt]=e.metadata.vrmManagers||[],e.metadata[rt].push(t),this.loader.babylonScene.onDisposeObservable.add(()=>{t.dispose(),this.loader.babylonScene.metadata[rt]=[]})}_loadVertexDataAsync(e,t,i){return!t.extras||!t.extras.targetNames||(i.metadata=i.metadata||{},i.metadata.vrmTargetNames=t.extras.targetNames),null}_loadMaterialAsync(e,t,i,r,a){return new mr(this.loader).generate(e,t,i,r,a)}};z.RegisterExtension(Ee,e=>new da(e));var ua=class{name="vrm";extensions={".vrm":{isBinary:!0},".vci":{isBinary:!0},".vrma":{isBinary:!0}};createPlugin(){return new Pr}};mt&&mt.RegisterPlugin(new ua);var j={LookUp:"lookUp",LookDown:"lookDown",LookLeft:"lookLeft",LookRight:"lookRight"},fa=["hips","spine","head","leftUpperLeg","leftLowerLeg","leftFoot","rightUpperLeg","rightLowerLeg","rightFoot","leftUpperArm","leftLowerArm","leftHand","rightUpperArm","rightLowerArm","rightHand"],ca={leftThumbProximal:"leftThumbMetacarpal",leftThumbIntermediate:"leftThumbProximal",rightThumbProximal:"rightThumbMetacarpal",rightThumbIntermediate:"rightThumbProximal"},ma=class{nodeMap={};constructor(e,t){Object.entries(e.humanBones||{}).forEach(([r,a])=>{let n=ca[r]??r,s=t(a.node);s&&(this.nodeMap[n]=s)});let i=fa.filter(r=>!this.nodeMap[r]);if(i.length>0)throw Error(`VRM 1.0 humanoid is missing required bones: ${i.join(", ")}`)}dispose(){this.nodeMap=null}getBone(e){return this.nodeMap[e]??null}getBoneNames(){return Object.keys(this.nodeMap)}get hips(){return this.require("hips")}get spine(){return this.require("spine")}get chest(){return this.optional("chest")}get upperChest(){return this.optional("upperChest")}get neck(){return this.optional("neck")}get head(){return this.require("head")}get leftEye(){return this.optional("leftEye")}get rightEye(){return this.optional("rightEye")}get jaw(){return this.optional("jaw")}get leftShoulder(){return this.optional("leftShoulder")}get rightShoulder(){return this.optional("rightShoulder")}get leftUpperArm(){return this.require("leftUpperArm")}get leftLowerArm(){return this.require("leftLowerArm")}get leftHand(){return this.require("leftHand")}get rightUpperArm(){return this.require("rightUpperArm")}get rightLowerArm(){return this.require("rightLowerArm")}get rightHand(){return this.require("rightHand")}get leftUpperLeg(){return this.require("leftUpperLeg")}get leftLowerLeg(){return this.require("leftLowerLeg")}get leftFoot(){return this.require("leftFoot")}get leftToes(){return this.optional("leftToes")}get rightUpperLeg(){return this.require("rightUpperLeg")}get rightLowerLeg(){return this.require("rightLowerLeg")}get rightFoot(){return this.require("rightFoot")}get rightToes(){return this.optional("rightToes")}get leftThumbMetacarpal(){return this.optional("leftThumbMetacarpal")}get leftThumbProximal(){return this.optional("leftThumbProximal")}get leftThumbDistal(){return this.optional("leftThumbDistal")}get leftIndexProximal(){return this.optional("leftIndexProximal")}get leftIndexIntermediate(){return this.optional("leftIndexIntermediate")}get leftIndexDistal(){return this.optional("leftIndexDistal")}get leftMiddleProximal(){return this.optional("leftMiddleProximal")}get leftMiddleIntermediate(){return this.optional("leftMiddleIntermediate")}get leftMiddleDistal(){return this.optional("leftMiddleDistal")}get leftRingProximal(){return this.optional("leftRingProximal")}get leftRingIntermediate(){return this.optional("leftRingIntermediate")}get leftRingDistal(){return this.optional("leftRingDistal")}get leftLittleProximal(){return this.optional("leftLittleProximal")}get leftLittleIntermediate(){return this.optional("leftLittleIntermediate")}get leftLittleDistal(){return this.optional("leftLittleDistal")}get rightThumbMetacarpal(){return this.optional("rightThumbMetacarpal")}get rightThumbProximal(){return this.optional("rightThumbProximal")}get rightThumbDistal(){return this.optional("rightThumbDistal")}get rightIndexProximal(){return this.optional("rightIndexProximal")}get rightIndexIntermediate(){return this.optional("rightIndexIntermediate")}get rightIndexDistal(){return this.optional("rightIndexDistal")}get rightMiddleProximal(){return this.optional("rightMiddleProximal")}get rightMiddleIntermediate(){return this.optional("rightMiddleIntermediate")}get rightMiddleDistal(){return this.optional("rightMiddleDistal")}get rightRingProximal(){return this.optional("rightRingProximal")}get rightRingIntermediate(){return this.optional("rightRingIntermediate")}get rightRingDistal(){return this.optional("rightRingDistal")}get rightLittleProximal(){return this.optional("rightLittleProximal")}get rightLittleIntermediate(){return this.optional("rightLittleIntermediate")}get rightLittleDistal(){return this.optional("rightLittleDistal")}require(e){let t=this.nodeMap[e];if(!t)throw Error(`VRM 1.0 humanoid bone not found: ${e}`);return t}optional(e){return this.nodeMap[e]??null}},pa=class{material;supported;colorProperty=null;constructor(e,t){switch(this.material=e,t){case"color":e instanceof V?this.colorProperty="diffuseColor":e instanceof re?this.colorProperty="albedoColor":e instanceof pt&&(this.colorProperty="diffuseColor");break;case"emissionColor":(e instanceof V||e instanceof re||e instanceof pt)&&(this.colorProperty="emissiveColor");break;case"shadeColor":e instanceof V&&(this.colorProperty="shadeColor");break;case"rimColor":e instanceof V&&(this.colorProperty="rimColor");break;case"outlineColor":e instanceof V&&(this.colorProperty="outlineColor");break;case"matcapColor":e instanceof V&&(this.colorProperty="matcapColor")}this.supported=this.colorProperty!==null}read(e){if(!this.colorProperty)return e;let t=this.material[this.colorProperty];return t?.r!==void 0&&e.set(t.r,t.g,t.b),e}write(e){if(!this.colorProperty)return;let t=this.material[this.colorProperty];t?.copyFrom&&t.copyFrom(e)}},ga=class{accessor;initialColor=new N;targetColor;tmpColor=new N;constructor(e,t,i){this.accessor=new pa(e,t),this.targetColor=new N(i[0]??1,i[1]??1,i[2]??1),this.accessor.supported&&this.accessor.read(this.initialColor)}get supported(){return this.accessor.supported}clearAppliedWeight(){this.accessor.supported&&this.accessor.write(this.initialColor)}applyWeight(e){!this.accessor.supported||e===0||(this.accessor.read(this.tmpColor),this.tmpColor.set(this.tmpColor.r+(this.targetColor.r-this.initialColor.r)*e,this.tmpColor.g+(this.targetColor.g-this.initialColor.g)*e,this.tmpColor.b+(this.targetColor.b-this.initialColor.b)*e),this.accessor.write(this.tmpColor))}},_a=class{textures=[];initials=[];targetScale;targetOffset;constructor(e,t,i){this.targetScale={x:t?.[0]??1,y:t?.[1]??1},this.targetOffset={x:i?.[0]??0,y:i?.[1]??0},e.getActiveTextures().forEach(r=>{r instanceof Mn&&(this.textures.push(r),this.initials.push({uScale:r.uScale,vScale:r.vScale,uOffset:r.uOffset,vOffset:r.vOffset}))})}clearAppliedWeight(){this.textures.forEach((e,t)=>{e.uScale=this.initials[t].uScale,e.vScale=this.initials[t].vScale,e.uOffset=this.initials[t].uOffset,e.vOffset=this.initials[t].vOffset})}applyWeight(e){e!==0&&this.textures.forEach((t,i)=>{t.uScale+=(this.targetScale.x-this.initials[i].uScale)*e,t.vScale+=(this.targetScale.y-this.initials[i].vScale)*e,t.uOffset+=(this.targetOffset.x-this.initials[i].uOffset)*e,t.vOffset+=(this.targetOffset.y-this.initials[i].vOffset)*e})}},ji=class{target;weight;constructor(e,t){this.target=e,this.weight=t}},Ma=class{name;isBinary;overrideBlink;overrideLookAt;overrideMouth;_weight=0;morphTargetBinds=[];materialColorBinds=[];textureTransformBinds=[];constructor(e,t,i,r){this.name=e,this.isBinary=t.isBinary??!1,this.overrideBlink=t.overrideBlink??"none",this.overrideLookAt=t.overrideLookAt??"none",this.overrideMouth=t.overrideMouth??"none",(t.morphTargetBinds??[]).forEach(a=>{i(a.node).forEach(n=>{let s=n.morphTargetManager;if(!s||a.index>=s.numTargets){P.Warn(`VRM1: morph target bind index ${a.index} is out of range on node ${a.node}`);return}this.morphTargetBinds.push(new ji(s.getTarget(a.index),a.weight??1))})}),(t.materialColorBinds??[]).forEach(a=>{let n=r(a.material);if(!n){P.Warn(`VRM1: material color bind references unknown material ${a.material}`);return}let s=new ga(n,a.type,a.targetValue);if(!s.supported){P.Warn(`VRM1: material ${n.name} does not support color bind type: ${a.type}`);return}this.materialColorBinds.push(s)}),(t.textureTransformBinds??[]).forEach(a=>{let n=r(a.material);if(!n){P.Warn(`VRM1: texture transform bind references unknown material ${a.material}`);return}this.textureTransformBinds.push(new _a(n,a.scale,a.offset))})}getMorphTargetBinds(){return this.morphTargetBinds.map(e=>({target:e.target,weight:e.weight}))}replaceMorphTargetBinds(e){let t=new Set(e.map(i=>i.target));this.morphTargetBinds.forEach(i=>{t.has(i.target)||(i.target.influence=0)}),this.morphTargetBinds.length=0,e.forEach(i=>{this.morphTargetBinds.push(new ji(i.target,i.weight))})}get weight(){return this._weight}set weight(e){this._weight=Math.min(1,Math.max(0,e))}get outputWeight(){return this.isBinary?+(this._weight>.5):this._weight}overrideAmount(e){switch(e){case"block":return+(this.outputWeight>0);case"blend":return this.outputWeight;default:return 0}}clearAppliedWeight(){this.morphTargetBinds.forEach(e=>{e.target.influence!==0&&(e.target.influence=0)}),this.materialColorBinds.forEach(e=>{e.clearAppliedWeight()}),this.textureTransformBinds.forEach(e=>{e.clearAppliedWeight()})}applyWeight(e){let t=this.outputWeight*e;this.isBinary&&t<1&&(t=0),t!==0&&(this.morphTargetBinds.forEach(i=>{i.target.influence+=t*i.weight}),this.materialColorBinds.forEach(i=>{i.applyWeight(t)}),this.textureTransformBinds.forEach(i=>{i.applyWeight(t)}))}dispose(){this.morphTargetBinds=null,this.materialColorBinds=null,this.textureTransformBinds=null}},Ta=class{blinkExpressionNames=["blink","blinkLeft","blinkRight"];lookAtExpressionNames=["lookLeft","lookRight","lookUp","lookDown"];mouthExpressionNames=["aa","ee","ih","oh","ou"];expressions=[];expressionMap={};_wasAnyActive=!1;constructor(e,t,i){if(!e)return;let r=(a,n)=>{if(!n||this.expressionMap[a])return;let s=new Ma(a,n,t,i);this.expressions.push(s),this.expressionMap[a]=s};Object.entries(e.preset??{}).forEach(([a,n])=>r(a,n)),Object.entries(e.custom??{}).forEach(([a,n])=>r(a,n))}dispose(){this.expressions.forEach(e=>{e.dispose()}),this.expressions=null,this.expressionMap=null}get expressionNames(){return this.expressions.map(e=>e.name)}getExpression(e){return this.expressionMap[e]??null}getValue(e){return this.expressionMap[e]?.weight??0}setValue(e,t){let i=this.expressionMap[e];i&&(i.weight=t)}update(){let e=0,t=0,i=0,r=!1;this.expressions.forEach(a=>{a.weight>0&&(r=!0),e+=a.overrideAmount(a.overrideBlink),t+=a.overrideAmount(a.overrideLookAt),i+=a.overrideAmount(a.overrideMouth)}),!(!r&&!this._wasAnyActive)&&(this._wasAnyActive=r,this.expressions.forEach(a=>{a.clearAppliedWeight()}),this.expressions.forEach(a=>{let n=this.getCategoryMultiplier(a,e,t,i);a.applyWeight(n)}))}getCategoryMultiplier(e,t,i,r){return this.blinkExpressionNames.includes(e.name)?Math.max(0,1-t):this.lookAtExpressionNames.includes(e.name)?Math.max(0,1-i):this.mouthExpressionNames.includes(e.name)?Math.max(0,1-r):1}},Aa=.01,Ae=class{inputMaxValue;outputScale;constructor(e,t){this.inputMaxValue=Math.max(e?.inputMaxValue??90,Aa),this.outputScale=e?.outputScale??t}map(e){let t=Math.min(Math.max(e/this.inputMaxValue,0),1);return this.outputScale*t}},te=Math.PI/180,Ki=new S;function qi(e){return e?(e.rotationQuaternion||=e.rotation.toQuaternion(),{node:e,restLocalRotation:e.rotationQuaternion.clone()}):null}var Sa=class{rangeMapHorizontalInner;rangeMapHorizontalOuter;rangeMapVerticalDown;rangeMapVerticalUp;type="bone";leftEye;rightEye;constructor(e,t,i,r,a){this.rangeMapHorizontalInner=t,this.rangeMapHorizontalOuter=i,this.rangeMapVerticalDown=r,this.rangeMapVerticalUp=a,this.leftEye=qi(e.leftEye),this.rightEye=qi(e.rightEye)}applyYawPitch(e,t){let i;if(i=t<0?-te*this.rangeMapVerticalUp.map(-t):te*this.rangeMapVerticalDown.map(t),this.leftEye){let r=e<0?-te*this.rangeMapHorizontalInner.map(-e):te*this.rangeMapHorizontalOuter.map(e);this.applyRotation(this.leftEye,r,i)}if(this.rightEye){let r=e<0?-te*this.rangeMapHorizontalOuter.map(-e):te*this.rangeMapHorizontalInner.map(e);this.applyRotation(this.rightEye,r,i)}}applyRotation(e,t,i){S.RotationYawPitchRollToRef(t,i,0,Ki),e.restLocalRotation.multiplyToRef(Ki,e.node.rotationQuaternion)}},va=class{expressionManager;rangeMapHorizontalOuter;rangeMapVerticalDown;rangeMapVerticalUp;type="expression";constructor(e,t,i,r){this.expressionManager=e,this.rangeMapHorizontalOuter=t,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r}applyYawPitch(e,t){t<0?(this.expressionManager.setValue(j.LookDown,0),this.expressionManager.setValue(j.LookUp,this.rangeMapVerticalUp.map(-t))):(this.expressionManager.setValue(j.LookUp,0),this.expressionManager.setValue(j.LookDown,this.rangeMapVerticalDown.map(t))),e<0?(this.expressionManager.setValue(j.LookLeft,0),this.expressionManager.setValue(j.LookRight,this.rangeMapHorizontalOuter.map(-e))):(this.expressionManager.setValue(j.LookRight,0),this.expressionManager.setValue(j.LookLeft,this.rangeMapHorizontalOuter.map(e)))}},Zi=180/Math.PI,xa=new d,Ji=new d,Ia=new W,Ea=class{autoUpdate=!0;target=null;applier;headBone;offsetFromHeadBone;restHeadWorldMatrix;restLeft;restUp;restFront;_yaw=0;_pitch=0;_dirWorld=null;get yaw(){return this._yaw}get pitch(){return this._pitch}constructor(e,t,i,r){this.headBone=e;let a=t?.offsetFromHeadBone;this.offsetFromHeadBone=a?new d(a[0],a[1],a[2]):new d(0,.06,0),e.computeWorldMatrix(!0),this.restHeadWorldMatrix=e.getWorldMatrix().clone(),this.restLeft=d.TransformNormal(d.Right(),this.restHeadWorldMatrix).normalize(),this.restUp=d.TransformNormal(d.Up(),this.restHeadWorldMatrix).normalize(),this.restFront=d.TransformNormal(d.Forward(),this.restHeadWorldMatrix).normalize();let n=t?.type??"bone",s=n==="expression"?1:10,o=new Ae(t?.rangeMapHorizontalInner,s),u=new Ae(t?.rangeMapHorizontalOuter,s),g=new Ae(t?.rangeMapVerticalDown,s),c=new Ae(t?.rangeMapVerticalUp,s);this.applier=n==="expression"?r?new va(r,u,g,c):null:new Sa(i,o,u,g,c)}lookAt(e){if(!this.applier)return;this.headBone.computeWorldMatrix(!0);let t=this.headBone.getWorldMatrix(),i=d.TransformCoordinatesToRef(this.offsetFromHeadBone,t,xa),r=e.subtractToRef(i,Ji);if(r.lengthSquared()<1e-12)return;r.normalize(),this._dirWorld||=new d,this._dirWorld.copyFrom(r);let a=t.invertToRef(Ia),n=d.TransformNormalToRef(r,a,Ji);d.TransformNormalToRef(n,this.restHeadWorldMatrix,n),n.normalize();let s=d.Dot(n,this.restLeft),o=d.Dot(n,this.restUp),u=d.Dot(n,this.restFront),g=Math.sqrt(s*s+u*u);this._yaw=Math.atan2(s,u)*Zi,this._pitch=Math.atan2(-o,g)*Zi,this.applier.applyYawPitch(this._yaw,this._pitch)}setYawPitch(e,t){this._yaw=e,this._pitch=t,this._dirWorld=null,this.applier?.applyYawPitch(e,t)}reset(){this._yaw=0,this._pitch=0,this._dirWorld=null,this.applier?.applyYawPitch(0,0)}update(){if(!this.target||!this.autoUpdate)return;let e=fr(this.target);e&&this.lookAt(e)}getLookAtWorldPosition(){return this.headBone.computeWorldMatrix(!0),d.TransformCoordinates(this.offsetFromHeadBone,this.headBone.getWorldMatrix())}getLookAtWorldDirection(){return this._dirWorld?this._dirWorld:(this.headBone.computeWorldMatrix(!0),d.TransformNormal(d.Forward(),this.headBone.getWorldMatrix()).normalize())}},Pa=class extends ur{constructor(e,t,i){super(t),(e?.meshAnnotations??[]).forEach(r=>{let a=i(r.node);a.length!==0&&this.meshAnnotations.push({meshes:a,type:r.type??"auto"})})}getFirstPersonCameraPosition(){return this.headBone.getAbsolutePosition()}};function Tr(e,t,i,r){let a=[],n=new Map,s=o=>{let u=n.get(o);if(u!=="done"){if(u==="trying"){P.Warn(`circular dependency detected in ${r}`);return}n.set(o,"trying");for(let g of i(o)){let c=g;for(;c;){for(let m of t.get(c)??[])m!==o&&s(m);c=c.parent}}n.set(o,"done"),a.push(o)}};return e.forEach(o=>{s(o)}),a}var er=new d,tr=class{node;shape;constructor(e,t,i){this.node=t;let r=i?.shape;if(r?.plane){let a=r.plane;this.shape={kind:"plane",offset:new d(a.offset?.[0]??0,a.offset?.[1]??0,a.offset?.[2]??0),normal:new d(a.normal?.[0]??0,a.normal?.[1]??0,a.normal?.[2]??1).normalize()}}else if(r?.capsule){let a=r.capsule;this.shape={kind:"capsule",offset:new d(a.offset?.[0]??0,a.offset?.[1]??0,a.offset?.[2]??0),radius:a.radius??0,tail:new d(a.tail?.[0]??0,a.tail?.[1]??0,a.tail?.[2]??0),inside:a.inside??!1}}else if(r?.sphere){let a=r.sphere;this.shape={kind:"sphere",offset:new d(a.offset?.[0]??0,a.offset?.[1]??0,a.offset?.[2]??0),radius:a.radius??0,inside:a.inside??!1}}else if(e.shape.capsule){let a=e.shape.capsule;this.shape={kind:"capsule",offset:new d(a.offset?.[0]??0,a.offset?.[1]??0,a.offset?.[2]??0),radius:a.radius??0,tail:new d(a.tail?.[0]??0,a.tail?.[1]??0,a.tail?.[2]??0),inside:!1}}else{let a=e.shape.sphere??{};this.shape={kind:"sphere",offset:new d(a.offset?.[0]??0,a.offset?.[1]??0,a.offset?.[2]??0),radius:a.radius??0,inside:!1}}}collide(e,t){this.node.computeWorldMatrix(!0);let i=this.node.getWorldMatrix();if(this.shape.kind==="plane"){let o=d.TransformCoordinates(this.shape.offset,i),u=d.TransformNormal(this.shape.normal,i).normalize(),g=d.Dot(e.subtract(o),u)-t;g<0&&e.addInPlace(u.scale(-g));return}let r=d.TransformCoordinates(this.shape.offset,i);if(this.shape.kind==="capsule"){let o=this.shape.tail.subtract(this.shape.offset),u=r.add(d.TransformNormal(o,i)).subtract(r),g=u.lengthSquared();if(g>0){let c=d.Dot(e.subtract(r),u)/g,m=Math.min(Math.max(c,0),1);r.addInPlace(u.scale(m))}}let a=e.subtract(r),n=a.length(),s=this.shape.inside?this.shape.radius-t-n:n-t-this.shape.radius;if(s<0&&n>1e-12){let o=this.shape.inside?-1/n:1/n;er.copyFrom(a).scaleInPlace(o*-s),e.addInPlace(er)}}},nt=W.Identity(),de=new d,G=new d,Ra=new d,ir=new S,Se=new W,rr=new W,Ca=class{bone;child;center=null;colliders;settings;initialLocalMatrix;initialLocalRotation;initialLocalChildPosition;boneAxis;gravityDir;currentTail=new d;prevTail=new d;constructor(e,t,i,r=[]){this.bone=e,this.child=t,this.settings=i,this.colliders=r,this.gravityDir=i.gravityDir.clone(),e.rotationQuaternion||=e.rotation.toQuaternion(),e.computeWorldMatrix(!0),this.initialLocalMatrix=e._localMatrix.clone(),this.initialLocalRotation=e.rotationQuaternion.clone(),this.initialLocalChildPosition=t&&t.position.lengthSquared()>1e-12?t.position.clone():e.position.clone().normalize().scaleInPlace(.07),this.boneAxis=this.initialLocalChildPosition.clone().normalize(),this.setInitState()}setInitState(){this.updateMatrixWorld(),this.currentTail.copyFrom(this.getWorldTailPosition(new d)),this.prevTail.copyFrom(this.currentTail)}reset(){this.bone.rotationQuaternion=this.initialLocalRotation.clone(),this.setInitState()}update(e){if(e<=0)return;this.updateMatrixWorld();let t=this.bone.getWorldMatrix().getTranslation(),i=this.getWorldBoneLength(t),r=Ra.copyFrom(this.currentTail);r.addInPlace(de.copyFrom(this.currentTail).subtractInPlace(this.prevTail).scaleInPlace(1-this.settings.dragForce)),d.TransformCoordinatesToRef(r,this.getMatrixCenterToWorld(rr),r),d.TransformNormalToRef(this.boneAxis,this.initialLocalMatrix,G),d.TransformNormalToRef(G,this.getParentMatrixWorld(),G),G.normalize().scaleInPlace(this.settings.stiffness*e),r.addInPlace(G),G.copyFrom(this.gravityDir).scaleInPlace(this.settings.gravityPower*e),r.addInPlace(G),r.subtractInPlace(t).normalize().scaleInPlace(i).addInPlace(t),this.colliders.forEach(a=>{a.collide(r,this.settings.hitRadius),r.subtractInPlace(t).normalize().scaleInPlace(i).addInPlace(t)}),this.prevTail.copyFrom(this.currentTail),d.TransformCoordinatesToRef(r,this.getMatrixWorldToCenter(rr),this.currentTail),this.initialLocalMatrix.multiplyToRef(this.getParentMatrixWorld(),Se),Se.invert(),d.TransformCoordinatesToRef(r,Se,G),G.normalize(),S.FromUnitVectorsToRef(this.boneAxis,G,ir),this.initialLocalRotation.multiplyToRef(ir,this.bone.rotationQuaternion),this.bone.computeWorldMatrix(!0)}getDependencies(){let e=[];return this.bone.parent&&e.push(this.bone.parent),this.colliders.forEach(t=>{e.push(t.node)}),e}updateMatrixWorld(){this.bone.computeWorldMatrix(!0),this.center&&this.center.computeWorldMatrix(!0)}getWorldTailPosition(e){let t=this.getMatrixWorldToCenter(Se);return d.TransformCoordinatesToRef(this.initialLocalChildPosition,this.bone.getWorldMatrix(),de),d.TransformCoordinatesToRef(de,t,e)}getWorldBoneLength(e){return this.child?(this.child.computeWorldMatrix(!0),d.Distance(e,this.child.getAbsolutePosition())):(d.TransformCoordinatesToRef(this.initialLocalChildPosition,this.bone.getWorldMatrix(),de),d.Distance(e,de))}getMatrixCenterToWorld(e){return this.center?e.copyFrom(this.center.getWorldMatrix()):e.copyFrom(nt)}getMatrixWorldToCenter(e){return this.center?e.copyFrom(this.center.getWorldMatrix()).invert():e.copyFrom(nt)}getParentMatrixWorld(){return this.bone.parent?this.bone.parent.getWorldMatrix():nt}},Na=class{joints=[];sortedJoints=null;jointMapByNode=new Map;constructor(e,t){let i=this.constructColliders(e,t),r=this.constructColliderGroups(e,i);this.constructSprings(e,t,r)}dispose(){this.joints.length=0,this.sortedJoints=null,this.jointMapByNode.clear()}reset(){this.getSortedJoints().forEach(e=>{e.reset()})}update(e){this.getSortedJoints().forEach(t=>{t.update(e)})}constructColliders(e,t){let i=new Map;return(e.colliders??[]).forEach((r,a)=>{let n=t(r.node);if(!n){P.Warn(`VRM1: spring bone collider ${a} references unknown node ${r.node}`);return}let s=r.extensions?.VRMC_springBone_extended_collider;if(s&&s.specVersion!=="1.0"){P.Warn(`VRM1: unsupported extended collider specVersion '${s.specVersion}'. Falling back to the base shape.`),i.set(a,new tr(r,n));return}i.set(a,new tr(r,n,s))}),i}constructColliderGroups(e,t){let i=[];return(e.colliderGroups??[]).forEach(r=>{i.push((r.colliders??[]).map(a=>t.get(a)).filter(a=>a!==void 0))}),i}constructSprings(e,t,i){(e.springs??[]).forEach(r=>{let a=[];(r.colliderGroups??[]).forEach(o=>{a.push(...i[o]??[])});let n=r.center===void 0?null:t(r.center),s=r.joints??[];for(let o=0;o+1<s.length;o++){let u=t(s[o].node),g=t(s[o+1].node);if(!u||!g){P.Warn(`VRM1: spring "${r.name??""}" joint ${o} references unknown node`);continue}let c=new Ca(u,g,this.createJointSettings(s[o]),a);c.center=n,this.joints.push(c);let m=this.jointMapByNode.get(u)??[];m.push(c),this.jointMapByNode.set(u,m)}}),this.sortedJoints=null}createJointSettings(e){let t=e.gravityDir??[0,-1,0];return{hitRadius:e.hitRadius??0,stiffness:e.stiffness??1,gravityPower:e.gravityPower??0,gravityDir:new d(-t[0],t[1],t[2]),dragForce:e.dragForce??.4}}getSortedJoints(){return this.sortedJoints||=Tr(this.joints,this.jointMapByNode,e=>e.getDependencies(),"spring bones"),this.sortedJoints}},ie=new d,La=new d,Ar=new W,Da=new W,K=new S,ne=new S,at=new S,ft=class{destination;source;weight=1;constructor(e,t,i){this.destination=e,this.source=t,this.weight=i,e.rotationQuaternion||=e.rotation.toQuaternion(),t.rotationQuaternion||=t.rotation.toQuaternion()}getDependencies(){return[this.source]}},Oa=class extends ft{dstRestQuat=new S;invSrcRestQuat=new S;constructor(e,t,i){super(e,t,i)}setInitState(){this.dstRestQuat.copyFrom(this.destination.rotationQuaternion),S.InverseToRef(this.source.rotationQuaternion,this.invSrcRestQuat)}update(){this.invSrcRestQuat.multiplyToRef(this.source.rotationQuaternion,K),this.dstRestQuat.multiplyToRef(K,ne),S.SlerpToRef(this.dstRestQuat,ne,this.weight,this.destination.rotationQuaternion)}},ba=class extends ft{dstRestQuat=new S;invDstRestQuat=new S;invSrcRestQuatMulDstRestQuat=new S;rollAxis;constructor(e,t,i,r){super(e,t,i),this.rollAxis=r==="X"?new d(1,0,0):r==="Y"?new d(0,1,0):new d(0,0,1)}setInitState(){this.dstRestQuat.copyFrom(this.destination.rotationQuaternion),S.InverseToRef(this.dstRestQuat,this.invDstRestQuat),this.invSrcRestQuatMulDstRestQuat.copyFrom(S.Inverse(this.source.rotationQuaternion).multiply(this.dstRestQuat))}update(){this.invDstRestQuat.multiplyToRef(this.source.rotationQuaternion,K),K.multiplyToRef(this.invSrcRestQuatMulDstRestQuat,ne);let e=ne,t=d.TransformNormalToRef(this.rollAxis,e.toRotationMatrix(Ar),ie),i=S.FromUnitVectorsToRef(t,this.rollAxis,at);this.dstRestQuat.multiplyToRef(i,K),K.multiplyToRef(e,at),S.SlerpToRef(this.dstRestQuat,at,this.weight,this.destination.rotationQuaternion)}},ya=class extends ft{dstRestQuat=new S;aimAxis;constructor(e,t,i,r){super(e,t,i);let[a,n,s]={PositiveX:[1,0,0],NegativeX:[-1,0,0],PositiveY:[0,1,0],NegativeY:[0,-1,0],PositiveZ:[0,0,1],NegativeZ:[0,0,-1]}[r]??[0,0,1];this.aimAxis=new d(a,n,s)}setInitState(){this.dstRestQuat.copyFrom(this.destination.rotationQuaternion)}getDependencies(){let e=[this.source];return this.destination.parent&&e.push(this.destination.parent),e}update(){if(this.destination.computeWorldMatrix(!0),this.source.computeWorldMatrix(!0),this.source.getAbsolutePosition().subtractToRef(this.destination.getAbsolutePosition(),ie),ie.lengthSquared()<1e-12)return;ie.normalize();let e=this.destination.parent?this.destination.parent.getWorldMatrix():W.IdentityReadOnly,t=Ar.copyFrom(e).invert(),i=d.TransformNormalToRef(ie,t,ie).normalize(),r=d.TransformNormalToRef(this.aimAxis,this.dstRestQuat.toRotationMatrix(Da),La).normalize();S.FromUnitVectorsToRef(r,i,K),K.multiplyToRef(this.dstRestQuat,ne),S.SlerpToRef(this.dstRestQuat,ne,this.weight,this.destination.rotationQuaternion)}},wa=class{constraints=[];constraintsByDestination=new Map;sortedConstraints=null;addConstraint(e){this.constraints.push(e);let t=this.constraintsByDestination.get(e.destination)??[];t.push(e),this.constraintsByDestination.set(e.destination,t),this.sortedConstraints=null}setInitState(){this.constraints.forEach(e=>{e.setInitState()})}update(){this.sortedConstraints||=Tr(this.constraints,this.constraintsByDestination,e=>e.getDependencies(),"node constraints");for(let e=0;e<this.sortedConstraints.length;e++)this.sortedConstraints[e].update()}dispose(){this.constraints.length=0,this.constraintsByDestination.clear(),this.sortedConstraints=null}},Fa=class{meta;humanoid;expressionManager;lookAt;firstPerson;springBoneController;nodeConstraintManager;rootMesh;scene;gltfNodes;transformNodeCache={};meshesByGltfMeshIndex={};materialCache={};disposed=!1;constructor(e,t,i,r,a,n,s){this.scene=t,this.gltfNodes=s,this.rootMesh=this.constructMeshesAndRoot(i),this.constructTransformNodeCache(r,i),this.constructMaterialCache(a),e?(this.meta=e.meta,this.humanoid=new ma(e.humanoid,this.findTransformNode.bind(this)),this.expressionManager=new Ta(e.expressions,this.findMeshesByNode.bind(this),this.findMaterial.bind(this)),this.lookAt=new Ea(this.humanoid.head,e.lookAt,this.humanoid,this.expressionManager),this.firstPerson=new Pa(e.firstPerson,this.humanoid.head,this.findMeshesByNode.bind(this))):(this.meta=null,this.humanoid=null,this.expressionManager=null,this.lookAt=null,this.firstPerson=null),this.springBoneController=n?new Na(n,this.findTransformNode.bind(this)):null;let o=new wa;this.attachNodeConstraints(o,s),this.nodeConstraintManager=o}dispose(){this.disposed||(this.disposed=!0,this.humanoid?.dispose(),this.expressionManager?.dispose(),this.firstPerson?.dispose(),this.springBoneController?.dispose(),this.nodeConstraintManager?.dispose(),this.transformNodeCache=null,this.meshesByGltfMeshIndex=null,this.materialCache=null,this.gltfNodes=null)}update(e){if(this.lookAt?.update(),this.expressionManager?.update(),this.nodeConstraintManager?.update(),this.springBoneController){let t=Math.max(0,Math.min(16.666,e))/1e3;this.springBoneController.update(t)}}getFirstPersonCameraPosition(){return this.firstPerson?.getFirstPersonCameraPosition()??null}findTransformNode(e){return this.transformNodeCache[e]??null}findMeshesByNode(e){let t=this.gltfNodes?.[e];return!t||t.mesh===void 0?[]:this.meshesByGltfMeshIndex[t.mesh]??[]}findMaterial(e){return this.materialCache[e]??null}attachNodeConstraints(e,t){(t??[]).forEach((i,r)=>{let a=i.extensions?.VRMC_node_constraint?.constraint;if(!a)return;let n=this.findTransformNode(r);if(!n)return;let{roll:s,aim:o,rotation:u}=a,g=null;if(s){let c=this.findTransformNode(s.source);g=c&&new ba(n,c,s.weight??1,s.rollAxis)}else if(o){let c=this.findTransformNode(o.source);g=c&&new ya(n,c,o.weight??1,o.aimAxis)}else if(u){let c=this.findTransformNode(u.source);g=c&&new Oa(n,c,u.weight??1)}g&&e.addConstraint(g)}),e.setInitState()}constructTransformNodeCache(e,t){H(this.scene.transformNodes,e,/^\/nodes\/(\d+)$/,(i,r)=>{this.transformNodeCache[i]=r}),H(this.scene.meshes,t,/^\/nodes\/(\d+)$/,(i,r)=>{this.transformNodeCache[i]=this.transformNodeCache[i]??r})}constructMeshesAndRoot(e){H(this.scene.meshes,e,/^\/meshes\/(\d+)/,(i,r)=>{(this.meshesByGltfMeshIndex[i]=this.meshesByGltfMeshIndex[i]??[]).push(r)});let t=this.scene.meshes[e];return t?.id==="__root__"?t:null}constructMaterialCache(e){H(this.scene.materials,e,/^\/materials\/(\d+)$/,(t,i)=>{this.materialCache[t]=i})}},Pe="vrm1Managers",Ua=class{loader;name="VRMC_vrm";enabled=!0;meshesFrom;transformNodesFrom;materialsFrom;constructor(e){this.loader=e,this.meshesFrom=this.loader.babylonScene.meshes.length-1,this.transformNodesFrom=this.loader.babylonScene.transformNodes.length,this.materialsFrom=this.loader.babylonScene.materials.length}dispose(){this.loader=null}onReady(){let e=this.loader.gltf.extensions?.VRMC_vrm;e&&Sr(this.loader,this.meshesFrom,this.transformNodesFrom,this.materialsFrom,e,this.loader.gltf.extensions?.VRMC_springBone)}};function Sr(e,t,i,r,a,n){let s=e.babylonScene,o=new Fa(a,s,t,i,r,n,e.gltf.nodes);return s.metadata=s.metadata||{},s.metadata[Pe]=s.metadata.vrm1Managers||[],s.metadata[Pe].push(o),s.onDisposeObservable.add(()=>{o.dispose(),s.metadata[Pe]=[]}),o}var Wa=class{loader;name="VRMC_springBone";enabled=!0;meshesFrom;transformNodesFrom;materialsFrom;constructor(e){this.loader=e,this.meshesFrom=this.loader.babylonScene.meshes.length-1,this.transformNodesFrom=this.loader.babylonScene.transformNodes.length,this.materialsFrom=this.loader.babylonScene.materials.length}dispose(){this.loader=null}onReady(){let e=this.loader.gltf.extensions?.VRMC_springBone;if(!e)return;let t=this.loader.babylonScene.metadata?.[Pe];t&&t.length>0||Sr(this.loader,this.meshesFrom,this.transformNodesFrom,this.materialsFrom,void 0,e)}};z.RegisterExtension("VRMC_vrm",e=>new Ua(e)),z.RegisterExtension("VRMC_springBone",e=>new Wa(e));var Va=Math.PI*2,Xa=class{loader;name="VRMC_materials_mtoon";enabled=!0;constructor(e){this.loader=e}dispose(){this.loader=null}_loadMaterialAsync(e,t,i,r,a){let n=t.extensions?.[this.name];if(!n||!i)return null;let s=new V(t.name||`MToon1Material${t.index}`,this.loader.babylonScene);return this.setProperties(s,n,t),s._internalMetadata={gltf:{pointers:[e]}},i.alphaIndex=this.calcAlphaIndex(n,t),a(s),this.loadTexturesAsync(e,s,n,t).then(()=>s)}calcAlphaIndex(e,t){return t.alphaMode==="BLEND"?1e3+(e.transparentWithZWrite?0:10)+(e.renderQueueOffsetNumber??0):t.alphaMode==="MASK"?100:0}setProperties(e,t,i){let r=(i.pbrMetallicRoughness??{}).baseColorFactor??[1,1,1,1];switch(e.diffuseColor=new N(r[0],r[1],r[2]),e.alpha=r[3]??1,i.alphaMode){case"BLEND":e.alphaBlend=!0,e.alphaTest=!1,e.alphaMode=Ce.ALPHA_COMBINE,t.transparentWithZWrite&&(e.forceDepthWrite=!0,e.disableDepthWrite=!1);break;case"MASK":e.alphaBlend=!1,e.alphaTest=!0,e.alphaMode=Ce.ALPHA_COMBINE,e.alphaCutOff=i.alphaCutoff??.5}i.doubleSided&&(e.backFaceCulling=!1);let a=t.shadeColorFactor??[1,1,1];e.shadeColor=new N(a[0],a[1],a[2]);let n=t.shadingToonyFactor??.9,s=t.shadingShiftFactor??0;e.shadeToony=(s+n)/(2-n+s),e.shadeShift=n-s-1,e.indirectLightIntensity=1-(t.giEqualizationFactor??.9);let o=t.matcapFactor??[1,1,1];e.matcapColor=new N(o[0],o[1],o[2]);let u=t.parametricRimColorFactor??[0,0,0];e.rimColor=new N(u[0],u[1],u[2]),e.rimLightingMix=t.rimLightingMixFactor??1,e.rimFresnelPower=t.parametricRimFresnelPowerFactor??5,e.rimLift=t.parametricRimLiftFactor??0;let g=i.emissiveFactor??[0,0,0],c=i.extensions?.VRMC_materials_hdr_emissiveMultiplier;c&&P.Warn("VRMC_materials_hdr_emissiveMultiplier extension is archived. Use KHR_materials_emissive_strength instead.");let m=c?.emissiveMultiplier??1;e.emissiveColor=new N(g[0]*m,g[1]*m,g[2]*m);let v=t.outlineWidthFactor??0;if(t.outlineWidthMode&&t.outlineWidthMode!=="none"&&v>0){e.outlineWidthMode=t.outlineWidthMode==="worldCoordinates"?Hi.WorldCorrdinates:Hi.ScreenCoordinates,e.outlineWidth=v*(t.outlineWidthMode==="worldCoordinates"?100:200);let T=t.outlineColorFactor??[0,0,0];e.outlineColor=new N(T[0],T[1],T[2]),e.outlineLightingMix=t.outlineLightingMixFactor??1}e.uvAnimationScrollX=t.uvAnimationScrollXSpeedFactor??0,e.uvAnimationScrollY=-(t.uvAnimationScrollYSpeedFactor??0),e.uvAnimationRotation=(t.uvAnimationRotationSpeedFactor??0)/Va,t.shadingShiftTexture&&((t.shadingShiftTexture.texCoord??0)!==0&&P.Warn(`VRM1: shadingShiftTexture only supports texCoord 0: ${e.name}`),e.shadingShiftTextureScale=t.shadingShiftTexture.scale??1)}loadTexturesAsync(e,t,i,r){let a=[],n=r.pbrMetallicRoughness??{},s=(o,u,g=!0)=>{!o||typeof o.index!="number"||a.push(this.loader.loadTextureInfoAsync(`${e}/textures/${o.index}`,o,c=>{let m=c;m.gammaSpace!==void 0&&(m.gammaSpace=g),u(c)}))};return s(n.baseColorTexture,o=>{(t.alphaBlend||t.alphaTest)&&(o.hasAlpha=!0),t.diffuseTexture=o}),s(i.shadeMultiplyTexture,o=>t.shadeTexture=o),s(i.shadingShiftTexture,o=>t.shadingShiftTexture=o,!1),s(r.normalTexture,o=>{t.bumpTexture=o,t.bumpScale=r.normalTexture?.scale??1},!1),s(r.emissiveTexture,o=>t.emissiveTexture=o),s(i.matcapTexture,o=>t.matCapTexture=o),s(i.rimMultiplyTexture,o=>t.rimTexture=o),s(i.outlineWidthMultiplyTexture,o=>t.outlineWidthTexture=o,!1),s(i.uvAnimationMaskTexture,o=>t.uvAnimationMaskTexture=o,!1),Promise.all(a).then(()=>t)}};z.RegisterExtension("VRMC_materials_mtoon",e=>new Xa(e));var Re="VRMC_materials_hdr_emissiveMultiplier",Ba=class{loader;name=Re;enabled=!0;observer;constructor(e){this.loader=e,this.observer=this.loader.parent.onMaterialLoadedObservable.add(t=>this.applyMultiplier(t))}dispose(){this.observer.remove(),this.loader=null}applyMultiplier(e){let t=gr(e).find(n=>n.startsWith("/materials/")),i=t?parseInt(t.match(/^\/materials\/(\d+)/)?.[1]??"",10):NaN;if(Number.isNaN(i))return;let r=this.loader.gltf.materials?.[i]?.extensions?.[Re];if(!r)return;P.Warn(`${Re} extension is archived. Use 'KHR_materials_emissive_strength' instead.`);let a=e.emissiveColor;a&&a.scaleInPlace(r.emissiveMultiplier??1)}};z.RegisterExtension(Re,e=>new Ba(e));function Z(e,t){let i=t?.get(e);if(i)return i;e.computeWorldMatrix(!1);let r=e.parent instanceof me&&e.parent.getClassName()!=="Mesh"?e.parent:null,a=r?e._localMatrix.multiply(Z(r,t)):e._localMatrix.clone();return t?.set(e,a),a}var nr=180/Math.PI,st=new S,ve=new S,ar=new S,ot=new d,ue=new d,ka=class{loop=!0;animation;manager;bindings=[];expressionTracks;hipsBinding=null;_time=0;constructor(e,t){this.animation=e,this.manager=t;let i=t.humanoid;if(!i)throw Error("VRM1AnimationController requires a VRM 1.0 model with humanoid");this.expressionTracks=e.expressionTracks;let r=new Map;for(let a of i.getBoneNames()){let n=i.getBone(a);if(!n||!n.rotationQuaternion)continue;let s=e.humanoidRotationTracks.get(a)??null,o=n.rotationQuaternion.clone(),u=n.parent instanceof me?n.parent:null,g=S.Identity();if(u&&Z(u,r).decompose(void 0,g,void 0),this.bindings.push({bone:n,track:s,parentWorldRest:g,parentWorldRestPB:g.multiply(o)}),a==="hips"&&u){let c=Z(n,r),m=d.TransformCoordinates(d.Zero(),c),v=e.restHipsPosition.y,T=v>1e-6?m.y/v:1,I=Z(u,r).clone();I.invert(),this.hipsBinding={hips:n,parentGltfWorldInv:I,scaleFactor:T,restLocalPosition:n.position.clone()}}}}get time(){return this._time}set time(e){let t=this.animation.duration;this._time=this.loop&&t>0?(e%t+t)%t:Math.max(0,e)}update(e){this._time+=e/1e3,this.loop&&this.animation.duration>0&&(this._time%=this.animation.duration),this.applyAtTime(this._time)}applyAtTime(e){for(let r of this.bindings){let a=r.track?sr(r.track,e,st):st.copyFrom(S.Identity());S.InverseToRef(r.parentWorldRest,ve),ve.multiplyToRef(a,ar),ar.multiplyToRef(r.parentWorldRestPB,r.bone.rotationQuaternion)}let t=this.animation.hipsPositionTrack;if(this.hipsBinding&&t&&t.values.length>0){let[r,a]=ht(t.times,e),n=t.values[Math.min(r+1,t.values.length-1)];d.LerpToRef(t.values[r],n,a,ot),ot.scaleInPlace(this.hipsBinding.scaleFactor),d.TransformCoordinatesToRef(ot,this.hipsBinding.parentGltfWorldInv,ue),this.hipsBinding.hips.position.copyFrom(ue)}for(let[r,a]of this.expressionTracks){if(a.values.length===0)continue;let[n,s]=ht(a.times,e),o=a.values[Math.min(n+1,a.values.length-1)],u=a.values[n]+(o-a.values[n])*s;this.manager.expressionManager?.setValue(r,Math.max(0,Math.min(1,u)))}let i=this.manager.lookAt;i&&this.animation.lookAtTrack&&(sr(this.animation.lookAtTrack,e,st).toEulerAnglesToRef(ue),i.setYawPitch(ue.y*nr,ue.x*nr))}resetPose(){for(let e of this.bindings)S.InverseToRef(e.parentWorldRest,ve),e.bone.rotationQuaternion.copyFrom(ve).multiplyInPlace(e.parentWorldRestPB);this.hipsBinding&&this.hipsBinding.hips.position.copyFrom(this.hipsBinding.restLocalPosition)}},Ga=class{duration;restHipsPosition;hipsPositionTrack;humanoidRotationTracks=new Map;expressionTracks=new Map;lookAtTrack;constructor(e){this.restHipsPosition=e.restHipsPosition,this.hipsPositionTrack=e.hipsPositionTrack,this.humanoidRotationTracks=e.humanoidRotationTracks,this.expressionTracks=e.expressionTracks,this.lookAtTrack=e.lookAtTrack;let t=0,i=[e.hipsPositionTrack,e.lookAtTrack,...e.humanoidRotationTracks.values(),...e.expressionTracks.values()];for(let r of i)if(r)for(let a of r.times)t=Math.max(t,a);this.duration=t}createController(e){return new ka(this,e)}};function ht(e,t){if(e.length===0||t<=e[0]||e.length===1)return[0,0];for(let i=e.length-1;i>=0;i--)if(e[i]<=t){let r=e[i+1]-e[i];return[i,r>0?(t-e[i])/r:0]}return[0,0]}function sr(e,t,i){let[r,a]=ht(e.times,t);return r+1>=e.values.length||a===0?i.copyFrom(e.values[r]):S.SlerpToRef(e.values[r],e.values[r+1],a,i)}var lt="vrm1Animations",Ha=new Set(["1.0","1.0-draft"]),za=class{loader;name="VRMC_vrm_animation";enabled=!0;transformNodesFrom;animationGroupsFrom;constructor(e){this.loader=e,this.transformNodesFrom=this.loader.babylonScene.transformNodes.length,this.animationGroupsFrom=this.loader.babylonScene.animationGroups.length}dispose(){this.loader=null}onReady(){let e=this.loader.gltf.extensions?.VRMC_vrm_animation;if(!e)return;if(this.loader.parent.animationStartMode=Rr.NONE,!e.specVersion)P.Warn("VRM Animation: specVersion is missing. Assuming 1.0.");else if(Ha.has(e.specVersion))e.specVersion==="1.0-draft"&&P.Warn("VRM Animation: specVersion is 1.0-draft. Some behaviors may be different.");else{P.Warn(`VRM Animation: unsupported specVersion '${e.specVersion}'. Ignoring the extension.`);return}let t={};H(this.loader.babylonScene.transformNodes,this.transformNodesFrom,/^\/nodes\/(\d+)$/,(T,I)=>{t[T]=I});let i=new Map,r=new Map,a=new Map,n=new Map;Object.entries(e.humanoid?.humanBones??{}).forEach(([T,I])=>{let b=t[I.node];if(!b)return;r.set(T,b),a.set(b,T);let k=S.Identity();Z(b,i).decompose(void 0,k,void 0),n.set(b,k)}),r.size===0&&P.Warn("VRM Animation: no humanoid bones are mapped.");let s=r.get("hips"),o=d.Zero(),u=W.Identity();if(s){o=d.TransformCoordinates(d.Zero(),Z(s,i)),o.y<.001&&P.Warn("VRM Animation: restHipsPosition.y is nearly 0. The .vrma might violate the VRM T-pose requirement.");let T=s.parent instanceof me?s.parent:null;T&&(u=Z(T,i))}let g=new Map;[...Object.entries(e.expressions?.preset??{}),...Object.entries(e.expressions?.custom??{})].forEach(([T,I])=>{let b=t[I.node];b&&g.set(b,T)});let c=e.lookAt?t[e.lookAt.node]??null:null,m=this.loader.babylonScene.animationGroups.slice(this.animationGroupsFrom).map(T=>{let I=new Map,b=null,k=new Map,J=null;return T.targetedAnimations.forEach(L=>{let y=L.target,D=a.get(y),F=L.animation,se=F.getKeys(),pe=se.map(Y=>Y.frame/F.framePerSecond);if(D)if(F.targetProperty==="rotationQuaternion"){let Y=S.Inverse(n.get(y)),Le=this.getNearestMappedParentRest(y,a,n,i,u),vr=se.map(xr=>{let Ir=xr.value;return Le.multiply(Ir).multiply(Y)});I.set(D,{times:pe,values:vr})}else if(F.targetProperty==="position"){if(D!=="hips"){P.Warn(`VRM Animation: translation track on '${D}' is not permitted. Ignoring the track.`);return}b={times:pe,values:se.map(Y=>d.TransformCoordinates(Y.value.clone(),u))}}else P.Warn(`VRM Animation: '${F.targetProperty}' track on humanoid bone '${D}' is not permitted. Ignoring the track.`);else if(g.has(y)){if(F.targetProperty!=="position"){P.Warn(`VRM Animation: invalid path '${F.targetProperty}' for an expression node. Ignoring the track.`);return}let Y=se.map(Le=>Le.value.x);k.set(g.get(y),{times:pe,values:Y})}else if(c&&y===c){if(F.targetProperty!=="rotationQuaternion"){P.Warn(`VRM Animation: invalid path '${F.targetProperty}' for the lookAt node. Ignoring the track.`);return}J={times:pe,values:se.map(Y=>Y.value.clone())}}}),new Ga({restHipsPosition:o,hipsPositionTrack:b,humanoidRotationTracks:I,expressionTracks:k,lookAtTrack:J})}),v=this.loader.babylonScene;v.metadata=v.metadata||{},v.metadata[lt]=v.metadata.vrm1Animations||[],v.metadata[lt].push(...m),v.onDisposeObservable.add(()=>{v.metadata[lt]=[]})}getNearestMappedParentRest(e,t,i,r,a){let n=e.parent instanceof me?e.parent:null;for(;n;){let o=t.has(n)?i.get(n):void 0;if(o)return o;n=n.parent instanceof me?n.parent:null}let s=new S;return a.decompose(void 0,s,void 0),s}};z.RegisterExtension("VRMC_vrm_animation",e=>new za(e));const Ya={_Cutoff:"alphaCutOff",_BumpScale:"bumpScale",_ReceiveShadowRate:"receiveShadowRate",_ShadingGradeRate:"shadingGradeRate",_ShadeShift:"shadeShift",_ShadeToony:"shadeToony",_LightColorAttenuation:"lightColorAttenuation",_IndirectLightIntensity:"indirectLightIntensity",_RimLightingMix:"rimLightingMix",_RimFresnelPower:"rimFresnelPower",_RimLift:"rimLift",_OutlineWidth:"outlineWidth",_OutlineScaledMaxDistance:"outlineScaledMaxDistance",_OutlineLightingMix:"outlineLightingMix",_UvAnimScrollX:"uvAnimationScrollX",_UvAnimScrollY:"uvAnimationScrollY",_UvAnimRotation:"uvAnimationRotation",_DebugMode:"debugMode",_OutlineWidthMode:"outlineWidthMode",_OutlineColorMode:"outlineColorMode",_CullMode:"cullMode",_OutlineCullMode:"outlineCullMode"},Qa={_Color:"diffuseColor",_ShadeColor:"shadeColor",_RimColor:"rimColor",_EmissionColor:"emissiveColor",_OutlineColor:"outlineColor"},$a={_MainTex:"diffuseTexture",_ShadeTexture:"shadeTexture",_BumpMap:"bumpTexture",_ReceiveShadowTexture:"receiveShadowTexture",_ShadingGradeTexture:"shadingGradeTexture",_RimTexture:"rimTexture",_SphereAdd:"matCapTexture",_EmissionMap:"emissiveTexture",_OutlineWidthTexture:"outlineWidthTexture",_UvAnimMaskTexture:"uvAnimationMaskTexture"},ja=new Set(["_BumpMap","_ReceiveShadowTexture","_ShadingGradeTexture","_OutlineWidthTexture","_UvAnimMaskTexture"]);class Ka{constructor(t){this.loader=t}loader;name="VRM";order=-100;enabled=!0;dispose(){}source(t){return this.loader.gltf.extensions?.VRM?.materialProperties?.[t.index]}createMaterial(t,i,r){const a=this.source(i);if(a?.shader!=="VRM/MToon")return null;const n=new V(i.name??`material-${i.index}`,this.loader.babylonScene);return n.fillMode=r,n.imageProcessingConfiguration=new xe,gt(n),n.metadata={originalVrmMaterial:structuredClone(a),sourceMaterialIndex:i.index},n}loadMaterialPropertiesAsync(t,i,r){const a=this.source(i);if(!(r instanceof V)||!a)return null;const n=a.floatProperties??{},s=a.vectorProperties??{};for(const[c,m]of Object.entries(Ya))n[c]!==void 0&&Reflect.set(r,m,n[c]);gt(r);for(const[c,m]of Object.entries(Qa))s[c]&&(r[m]=N.FromArray(s[c]).toLinearSpace());s._Color?.[3]!==void 0&&(r.alpha=s._Color[3]);const o=n._BlendMode??0;r.alphaBlend=o===2||o===3,r.alphaTest=o===1,r.alphaMode=2,r.forceDepthWrite=n._ZWrite===1||o===3,r.disableDepthWrite=r.alphaBlend&&!r.forceDepthWrite;const u=s._MainTex??[0,0,1,1],g=Object.entries($a).flatMap(([c,m])=>{const v=a.textureProperties?.[c];return v===void 0||v<0?[]:[this.loader.loadTextureInfoAsync(`${t}/extensions/VRM/${c}`,{index:v,nonColorData:ja.has(c)},T=>{const I=T;I.uOffset=u[0],I.vOffset=u[1],I.uScale=u[2],I.vScale=u[3],c==="_MainTex"&&(I.hasAlpha=r.alphaBlend||r.alphaTest),r[m]=I})]});return Promise.all(g).then(()=>{})}onReady(){for(const t of this.loader.babylonScene.meshes){const i=t.material?.metadata?.originalVrmMaterial;i?.renderQueue!==void 0&&i.renderQueue>=0&&(t.alphaIndex=i.renderQueue)}}}function ns(){z.UnregisterExtension("VRM"),z.RegisterExtension("VRM",e=>new Ka(e))}export{Qa as VRM_COLOR_PROPERTIES,ns as registerOriginalVrmMaterials};
