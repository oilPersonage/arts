varying vec2 vUv;
uniform float uOffset;
uniform float uInitOffset;
uniform float uOffsetBetweenImg;


void main() {
    vUv = uv;

    vec2 pos = vec2(position.x, position.y);
    float offset = uOffset;

    if (uInitOffset > 0.) {
        offset = offset + uOffsetBetweenImg * uInitOffset;
    }

    pos.x = pos.x + offset;
    gl_Position = projectionMatrix * viewMatrix * vec4(pos, 0., 1.);
}