varying vec2 vUv;


void main() {
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * vec4(position, 1);
}