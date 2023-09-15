#define PI 3.14159265359

uniform vec4 uResolution;
uniform float uTime;
uniform float uHover;
uniform sampler2D uTexture;
varying vec2 vUv;
uniform float uRatio;
// YUV to RGB matrix
//
void main(){
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    //    vec2 vUv = (uv - vec2(0.5))*uResolution.zw + vec2(0.5);
    vec4 texture = texture2D(uTexture, vUv);
    vec4 grayTexture = vec4(texture.y / 1.3, texture.y / 1.3, texture.y / 1.3, 1.);
    gl_FragColor = mix(grayTexture, texture, uHover);
}