#define PI 3.14159265359

uniform vec2 uResolution;
uniform vec2 position;
uniform float uTime;
uniform float uHover;
uniform float uIndex;
uniform sampler2D uTexture;
varying vec2 vUv;
uniform float uRatio;
uniform float uBigSizeShow;


void main(){
    vec2 st = gl_FragCoord.xy/uResolution;

    vec4 texture = texture2D(uTexture, vUv);
    vec4 grayTexture = vec4(texture.y / 1.1, texture.y / 1.1, texture.y / 1.1, 1.);
    vec4 finalColor = mix(grayTexture, texture, uHover);
    if (uBigSizeShow > 0.) {
        finalColor = texture;
    }
    gl_FragColor = finalColor;

}
