const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }); // Generate the BABYLON 3D engine
var data = null;

function GetAPI(isbn) {
    const apiUrl = ('https://openlibrary.org/isbn/' + isbn + '.json')
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log(
                'Nome do livro:', data.title ,
                '\nPublicado em:', data.publish_date ,
                '\nEditora:' , data.publishers[0]
            )
            console.log('Resposta Completa:', data);

            dataExtracted = data;
            
            return data;
        })
        .catch(error => {
            console.error('Erro ao acessar a API:', error);
        });
}

function waitForFrames(scene, frameCount, callback) {
    let currentFrame = 0;

    const observer = scene.onBeforeRenderObservable.add(() => {
        currentFrame++;
        if (currentFrame >= frameCount) {
            scene.onBeforeRenderObservable.remove(observer); // Para de observar
            callback(); // Executa a função após os frames
        }
    });
}

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 11.5, new BABYLON.Vector3(-1.5, -2.1, 8 ));
    camera.attachControl(canvas, true);
    camera.panningSensibility = 0;
    camera.wheelDeltaPercentage = 0.01;
    

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 0, 0));
    light.intensity = 0.8;
    light.direction = new BABYLON.Vector3(1, 1, -4);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 2, height: 2 });
    ground.material = new BABYLON.StandardMaterial("myMaterial", scene)
    ground.material.emissiveColor = new BABYLON.Color3(0, 0, 0)

    const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 });
    box.position = new BABYLON.Vector3(0, 0.5, 0)
    box.material = new BABYLON.StandardMaterial("boxMaterial", scene)
    //camera.setTarget(box.position)
    camera.setTarget(box.position)

    var inputPlane = BABYLON.MeshBuilder.CreatePlane('inputPlane');
    inputPlane.position.y = 0.125;
    inputPlane.position.z = -0.51;
    inputPlane.position.x = -0.13;
    inputPlane.scaling.x = 0.8;
    inputPlane.scaling.y = 0.8;

    var plane = BABYLON.MeshBuilder.CreatePlane('plane');
    plane.position.y = 0.125;
    plane.position.z = -0.51;
    plane.position.x = 0.35;
    plane.scaling.x = 0.2;
    plane.scaling.y = 0.2;

    var screenPlane = BABYLON.MeshBuilder.CreatePlane('screen')
    screenPlane.position.y = 0.6;
    screenPlane.position.z = -0.51;
    screenPlane.position.x = 0;
    screenPlane.scaling.x = 0.9;
    screenPlane.scaling.y = 0.7;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1024, 1024);
    advancedTexture.background = "black";

    var advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(inputPlane, 1024, 1024);
    advancedTexture2.background = "transparent";

    var advancedTexture3 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(screenPlane, 1024, 1024);
    advancedTexture3.background = "black";

    var screen = new BABYLON.GUI.InputTextArea()
    screen.width = 1;
    screen.fontSize = 50;
    screen.height = 1;
    screen.text = "";
    screen.color = "white";
    screen.background = "black";
    advancedTexture3.addControl(screen);

    livro = "9780747532699"

    var input = new BABYLON.GUI.InputText();
    input.width = 0.8;
    input.fontSize = 100;
    input.height = 0.25;
    input.text = livro;
    input.color = "pink";
    input.background = "black";
    advancedTexture2.addControl(input);

    var button1 = BABYLON.GUI.Button.CreateSimpleButton('but1','Click Me')
    advancedTexture.addControl(button1);
    button1.height = 1;
    button1.width = 1;
    button1.color = 'white';
    button1.fontSize = 100;
    button1.background = 'pink';
    button1.onPointerUpObservable.add(function() {
        GetAPI(input.text);
        waitForFrames(scene, 300, () => {
            try { 
                screen.text = screen.text + "\n" + dataExtracted.title + "\n";
            } catch(erro) {
                console.error("Livro não encontrado ou erro no preenchimento.")
                alert("Preenche direito aí, na moral?")
            }
        })
    })
    
    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});