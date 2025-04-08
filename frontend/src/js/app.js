const POINT_LIFETIME = 12000;
const GREEN = 0x00ff00;
const RED = 0xff0000;
const WHITE = 0xffffff;

let scene, camera, renderer, globe;
let points = [];
let receivedPackages = [];
let activityChart;

let isDragging = false;
let targetRotation = { x: 0, y: 0 };

function init() {
    setupScene();            // scene settings
    setupGlobe();            // globe settings
    setupLights();           // lights
    setupVis();              // some additional visualisations
    setupEventListeners();   // for interactivity 
    initActivityChart();     // statistics chart
    startDataFetching();     // get data from the server
    animate();               // animation settings
}

// Firstly, setup the scene with Three js: set scene, camera, and renderer
function setupScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

// Globe creation and appealling settings
function setupGlobe() {
    // geometry (triangular polygon) and materials (appearance of objects) for globe creation:
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpMap: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_normal_2048.jpg'),
        bumpScale: 0.05,
        specularMap: new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_specular_2048.jpg'),
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    // create the globe itself and add it to the scene:
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
}

// Setup lights: ambient (globally illuminates all objects) adn directional (gets emitted in a specific direction)
function setupLights() {
    const ambLight = new THREE.AmbientLight(0x404040);
    const directionalLight = new THREE.DirectionalLight(WHITE, 1);    
    directionalLight.position.set(1, 1, 1);
    // add lights to the scene:
    scene.add(ambLight);
    scene.add(directionalLight);
}

// Add some visually appealing features: clouds, stars, and autorotation
function setupVis() {
    // CLOUDS
    // in the same manner: geometry and material for object creation, then add an object to the scene
    const cloudGeometry = new THREE.SphereGeometry(1.005, 32, 32);
    const cloudMap = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_clouds_1024.png')
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.4
    });
    clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    // STARS
    // generate positions for 10_000 stars
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVertices.push(x, y, z);
    }
    // the same geometry and material for objects that will be created, creation, and adding to the scene
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: WHITE,
        size: 0.9
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // AUTOROTATION
    // OrbitControls object for autorotation (will be activated in the animate())
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    autoRotate = true;                  // variable to control the state, controls.autoRotate must be set to this var
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.5;
}

// Combination of eventListeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    // Helping variable rotationButton to change autorotation state (on/off), linked to button from html
    const rotationButton = document.getElementById('rotation-toggle');
    rotationButton.addEventListener('click', function () {
        autoRotate = !autoRotate;
        controls.autoRotate = autoRotate;
        if (autoRotate) {
            rotationButton.textContent = 'Pause Autorotation';
        } else {
            rotationButton.textContent = 'Resume Autorotation';
        }
    });
}

function addPoint(lat, lng, suspicious, ip) {
    // Create the point (with geometry and material)
    const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.01),
        new THREE.MeshBasicMaterial({ 
            color: suspicious ? RED : GREEN
        })
    );
    // assign a position for this point, add it to the globe, and set it to look at the camera (us)
    point.position.copy(latLongToVector3(lat, lng, 1.01));
    globe.add(point);
    point.lookAt(camera.position);
    
    // create DOM content:
    const pointElement = createPointElement(suspicious, lat, lng, ip);
    // and appens a new point to array
    points.push({ 
        container: point, 
        element: pointElement,
    });
    // remove point after 10 seconds
    setTimeout(() => removePoint(point, pointElement), POINT_LIFETIME);
}

// This function will create the DOM content
// It handles points appearance: the point itself and point's label
// label can be seen while hovering
// Check the schema how it would look in the html file
function createPointElement(suspicious, lat, lng, ip) {

// Schema:
{/* <div class="point">              -- element
    <div class="point-marker"></div> -- marker - the point itself
    <div class="point-label">        -- label
        <p>Coords: ...</p>           -- coords
        <p>IP: ...</p>               -- ipAddr
    </div>
</div> */}

    const element = document.createElement('div');
    element.className = `point`;
    
    // required for displaying tooltips
    const marker = document.createElement('div');
    marker.className = 'point-marker';
    if (suspicious) {                 // if suspicious, it should have another color,
        marker.classList.add('sus');  // thus add a class to overwrite background color
    }
    
    const label = document.createElement('div');
    label.className = 'point-label';

    const coords = document.createElement('p');
    coords.textContent = `Coords: ${lat.toFixed(2)}, ${lng.toFixed(2)}`;

    const ipAddr = document.createElement('p');
    ipAddr.textContent = `IP: ${ip}`;

    // combine according to the schema
    label.appendChild(coords);
    label.appendChild(ipAddr);
    label.style.display = 'none';
    
    element.appendChild(marker);
    element.appendChild(label);
    
    // handle hovering:
    element.addEventListener('mouseenter', () => {
        label.style.display = 'block';
    });
    element.addEventListener('mouseleave', () => {
        label.style.display = 'none';
    });
    
    // append the resulting element to the DOM
    document.body.appendChild(element);
    return element;
}

// Removing function: removes the `element` from DOM and points from globe
function removePoint(container, element) {
    globe.remove(container);
    if (element && element.parentNode) {
        element.remove();
    }
    points = points.filter(p => p.container !== container);
}

// Helping function for converting latitude longitude values into Vector3
// Guarantees the correct points placing (I checked)
function latLongToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// helps resize window properly, without flying in space dots/points
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// async data functions - get data from server's endpoints
async function fetchPackages() {
    try {
        const response = await fetch('/api/packages');
        const newPackages = await response.json();
        // compare 2 arrays and from the new one task only last new packages
        // for each new package run addPoint(), their removal will be handles there
        if (newPackages.length > receivedPackages.length) {
            newPackages.slice(receivedPackages.length).forEach(pkg => {
                addPoint(pkg.latitude, pkg.longitude, pkg.suspicious, pkg.ip);
            });
            receivedPackages = newPackages;  // update received packages array
        }
    } catch (error) {
        console.error('Packages fetch error:', error);
    }
}

async function updateStats() {
    // Received STATS dict:{
    // 'total_packages': len(data_store),
    // 'suspicious_packages': sum(1 for p in data_store if p.get('suspicious', 0)),
    // 'top_locations': [{'lat': loc[0], 'lng': loc[1], 'count': count}],
    // 'continents': [{'continent': cont, 'count': count}]
    // }

    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        // update simple stats 
        document.getElementById('total-packages').textContent = stats.total_packages;
        document.getElementById('suspicious-packages').textContent = stats.suspicious_packages;

        // list of top locations: create points in the ordered lists
        const locationsBody = document.getElementById('locations-body');
        locationsBody.innerHTML = stats.top_locations.map(coords => 
            `<tr>
                <td>${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}</td>
                <td>${coords.count}</td>
            </tr>`
        ).join('');
        
        // update the bar plot with continents
        updateActivityChart(stats.continents);
    } catch (error) {
        console.error('Stats fetch error:', error);
    }
}

function startDataFetching() {
    fetchPackages();
    // fetch packages and stats each second
    setInterval(fetchPackages, 1000);
    setInterval(updateStats, 1000);
}

// Chart functions, set the metadata
function initActivityChart() {
    const plot = document.getElementById('activity-bar').getContext('2d');
    activityChart = new Chart(plot, {
        type: 'bar',
        data: { labels: [], datasets: [{
            label: 'Packages by Continent',
            data: [],
            backgroundColor: 'rgba(5, 113, 113, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]},
        options: {
            responsive: false,
            scales: {
                y: { beginAtZero: true },
                x: {}
            }
        }
    });
}

// gotten data is 
function updateActivityChart(continentData) {
    // to avoid empty bars for some continents, recreate labels for this plot every time when
    // stats are fetched. This approach allows to see only "valid" continents
    activityChart.data.labels = continentData.map(item => item.continent);
    activityChart.data.datasets[0].data = continentData.map(item => item.count);
    activityChart.update();
}

function animate() {
    requestAnimationFrame(animate);   // schedule the next frame, creating a continuous 60fps loop
    controls.update();                // 'controls' for autorotation 
    clouds.rotation.y += 0.0008;      // set clouds speed
    
    // for each point on the globe:
    points.forEach(point => {
        const worldPosition = new THREE.Vector3();
        point.container.getWorldPosition(worldPosition);
        
        // check if point is in front of camera: z-test and dot product test
        const isInFront = worldPosition.z <= 1;
        const pointNormal = worldPosition.clone().normalize();
        const cameraToPoint = new THREE.Vector3().subVectors(worldPosition, camera.position).normalize();
        const isFacingCamera = pointNormal.dot(cameraToPoint) < 0;
        
        // only show if both conditions are met
        const isVisible = isInFront && isFacingCamera;
        point.element.style.display = isVisible ? 'flex' : 'none';
        
        if (isVisible) {
            // get 2D coordinates on the screen!
            worldPosition.project(camera);
            const x = (worldPosition.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-worldPosition.y * 0.5 + 0.5) * window.innerHeight;
            // and draw them: set margins from a screen's borders
            point.element.style.left = `${x}px`;
            point.element.style.top = `${y}px`;
        }
    });
    // and render
    renderer.render(scene, camera);
}

init();