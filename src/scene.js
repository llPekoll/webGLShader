import * as THREE from 'three';
import { BufferAttribute } from 'three';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import mask from './imgs/mask.png'
import afrika from './imgs/afrika.jpg'
import afrika2 from './imgs/dany.jpg'
import gsap from 'gsap';


let renderer;
let time = 0;
let cube;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 3000);
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let point = new THREE.Vector2();
let material;
let move=0;
let textures
camera.position.z = 1000;


const addMesh = () => {

    textures = [
        new THREE.TextureLoader().load(afrika),
        new THREE.TextureLoader().load(afrika2),
        new THREE.TextureLoader().load(mask)
    ]
    material = new THREE.ShaderMaterial({
        fragmentShader: fragment,
        vertexShader: vertex,
        uniforms:{
            progress:{type:'f',value:0},
            text1:{type:'t',value:textures[0]},
            text2:{type:'t',value:textures[1]},
            move:{type:'f',value:0},
            mouse:{type:'v2',value:null},
            mousePressed:{type:'f',value:0},
            time:{type:'f',value:0}
        },
        side: THREE.DoubleSide,
        transparent:true,
        depthTest:false,
        depthWrite:false,
    });
    let n = 512*512;
    let geometry = new THREE.BufferGeometry();
    let position = new THREE.BufferAttribute(new Float32Array(n*3),3);
    let coordinates = new THREE.BufferAttribute(new Float32Array(n*3),3);
    let speeds = new THREE.BufferAttribute(new Float32Array(n),1);
    let offset = new THREE.BufferAttribute(new Float32Array(n),1);
    let direction = new THREE.BufferAttribute(new Float32Array(n),1);
    let press = new THREE.BufferAttribute(new Float32Array(n),1);


    const rand = (a,b) => a +(b-a)*Math.random();
    let index = 0;
    for(let i =0;i<512;i++){
        let posX = i - 256;
        for(let j =0;j<512;j++){
            position.setXYZ(index, posX*2, (j-256)*2,0)
            coordinates.setXYZ(index,i,j,0)
            offset.setX(index, rand(-1000,1000))
            speeds.setX(index, rand(0.4,1))
            direction.setX(index,Math.random()>0.5?1:-1)
            press.setX(index, rand(0.4,1))
            index++;
        }
    }
    geometry.setAttribute("position",position)
    geometry.setAttribute("aCoordinates",coordinates)
    geometry.setAttribute("aSpeed",speeds)
    geometry.setAttribute("aOffset",offset)
    geometry.setAttribute("aDirection",direction)
    geometry.setAttribute("aPress",press)
    cube = new THREE.Points(geometry, material);
    scene.add(cube);

    mouseEffects();
}

const mouseEffects = () => {
    const test = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(2000,2000),
        new THREE.MeshBasicMaterial()
    )
    window.addEventListener('mousewheel',(e)=>{
        // console.log(e.wheelDeltaY/1000)
        move += e.wheelDeltaY/4000;
    })

    window.addEventListener('mousedown',(e)=>{
        gsap.to(material.uniforms.mousePressed,{
            duration:1,
            value:1,
            ease:"elastic.out(1,0.3)"
        })
    })
    window.addEventListener('mouseup',(e)=>{
        gsap.to(material.uniforms.mousePressed,{
            duration:1,
            value:0,
            ease:"elastic.out(1,0.3)"
        })
    })

    window.addEventListener('mousemove',(e)=>{
        mouse.x = (e.clientX/window.innerWidth)*2-1;
        mouse.y = -(e.clientY/window.innerHeight)*2+1;

        raycaster.setFromCamera(mouse, camera);
        let intersect = raycaster.intersectObjects([test]);
        point.x = intersect[0].point.x;
        point.y = intersect[0].point.y;
        // console.log(intersect[0].point);
    }, false);

}


const animate = () => {

    time ++;
    let next = Math.floor(move+ 40)%2;
    let prev = (Math.floor(move+ 40)+1)%2;
    material.uniforms.time.value = time;
    material.uniforms.move.value = move;
    material.uniforms.mouse.value = point;
    material.uniforms.text1.value = textures[next]
    material.uniforms.text2.value = textures[prev]
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createScene = (el) => {
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
//   let controls = new OrbitControls(camera, renderer.domElement)
  resize();
  addMesh();
  animate();
}

window.addEventListener('resize', resize);