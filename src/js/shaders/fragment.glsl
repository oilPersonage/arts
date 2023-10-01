#define PI 3.14159265359

uniform vec2 uResolution;
uniform vec2 position;
uniform float uTime;
uniform float uHover;
uniform float uIndex;
uniform sampler2D uTexture;
varying vec2 vUv;
uniform float uRatio;
uniform float uParallaxForce;
uniform float uParallaxOffset;

mat2 scale(vec2 _scale){
    return mat2(_scale.x, 0.0,
    0.0, _scale.y);
}

void main(){
    vec2 st = vUv;
    st -= vec2(0.5);
    st = scale(vec2(0.9)) * st;
    st += vec2(0.5);
    st.x += uParallaxOffset;

    vec4 texture = texture2D(uTexture, st);
    //    vec4 grayTexture = vec4(texture.y / 1.1, texture.y / 1.1, texture.y / 1.1, 1.);
    //    vec4 finalColor = mix(grayTexture, texture, uHover);
    gl_FragColor = texture;

}
