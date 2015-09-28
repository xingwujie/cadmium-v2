var viewer = new Cesium.Viewer('cesiumContainer', {
    scene3DOnly : true,
    baseLayerPicker : false,
    infoBox : false,
    animation : false,
    timeline : false,
    navigationHelpButton : false,
    geocoder : false,
    imageryProvider : new Cesium.TileMapServiceImageryProvider({
        //url : Cesium.buildModuleUrl('/Cesium/Assets/Textures/NaturalEarthII')
        url : ('../../public/javascripts/Cesium/Assets/Textures/NaturalEarthII'),
        maximumLevel : 5
    }),
    /*imageryProvider : new Cesium.BingMapsImageryProvider({
        url : '//dev.virtualearth.net',
        mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
    }),
    imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
        url : 'http://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi?SERVICE=WMTS&request=GetCapabilities',
        layer : 'MODIS_Terra_SurfaceReflectance_Bands121',
        style : 'default',
        format : 'image/jpeg',
        tileMatrixSetID : 'EPSG4326_250m',
        // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
        maximumLevel: 9,
        credit : new Cesium.Credit('U. S. Geological Survey'),
        proxy: new Cesium.DefaultProxy('/proxy/')
    }),*/
    /*terrainProvider : new Cesium.CesiumTerrainProvider({
        url : '//cesiumjs.org/stk-terrain/tilesets/world/tiles'
    }),*/
    creditContainer: "hidden"
});

var scene = viewer.scene;
var ellipsoid = scene.globe.ellipsoid;
var handler;
var i = 0;
var msg = 'default';
var socket = io();
var camera = scene.camera;

//MIL STD 2525
var RendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
var msa = armyc2.c2sd.renderer.utilities.MilStdAttributes;

/**
 * PICKING HANDLERS
 */
function assetCollection(e){
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    if (e.target.value == 0) {
        viewer.dataSources.remove(assetStream);
        indicator.style.backgroundColor = '#ff0000';
    }else{
        viewer.dataSources.add(assetStream);
        indicator.style.backgroundColor = '#adff2f';
    }
}
function trackCollection(e){
    var value = e.target.value;
    var keys = Object.keys(currentGeometry);
    var targetKey = [];
    for (var i=0; i < keys.length; i++) {
        var current = keys[i].slice(0,1);
        if (current == 'T'){
            targetKey.push(keys[i]);
        }
    }
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    for (var i=0; i < targetKey.length; i++) {
        var attributes = currentGeometry[targetKey[i]].getGeometryInstanceAttributes(targetKey[i]);
        if (value == 0) {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
            indicator.style.backgroundColor = '#ff0000';
        } else {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
            indicator.style.backgroundColor = '#adff2f';
        }
    }
}
function selectInputs(e) {
    var value = e.target.value;
    var instances = currentGeometry[e.target.id]._numberOfInstances;
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    for (var i=0; i < instances; i++) {
        var targetId = ("" + e.target.id) + i;
        var attributes = currentGeometry[e.target.id].getGeometryInstanceAttributes(targetId);
        if (value == 0) {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
            indicator.style.backgroundColor = '#ff0000';
        } else {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
            indicator.style.backgroundColor = '#adff2f';
        }
    }
}

/**
 * ACQUIRE/C2 INCOMING & OUTGOING DATA
 */

//INCOMING FROM ACQUIRE BACKEND
socket.on('defendedArea', function(grid) {
    console.log(grid);
    return;

    var rectangle = scene.primitives.add(new Cesium.RectanglePrimitive({
        rectangle: Cesium.Rectangle.fromDegrees(
            grid.bounds.west,
            grid.bounds.south,
            grid.bounds.east,
            grid.bounds.north),
        show: true
    }));

    var svgDataDeclare = "data:image/svg+xml,";
    var svgCircle = '<circle cx="10" cy="10" r="10" stroke="black" stroke-width="3" fill="purple" /> ';
    var svgPrefix = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" xml:space="preserve">';
    var svgSuffix = "</svg>";
    var svgString = svgPrefix + svgCircle + svgSuffix;

    // create the cesium entity
    var svgEntityImage = svgDataDeclare + svgString;

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('xml:space', 'preserve');
    svg.setAttribute('width', '50px');
    svg.setAttribute('height', '50px');
    svg.setAttribute('x', '0px');
    svg.setAttribute('y', '0px');
    var circle = document.createElement('circle');
    circle.setAttribute('cx', 10);
    circle.setAttribute('cy', 10);
    circle.setAttribute('r', 10);
    circle.setAttribute('stroke', 'black');
    circle.setAttribute('stroke-width', 3);
    circle.setAttribute('fill', 'purple');
    svg.appendChild(circle);

    //rectangle.material = Cesium.Material.fromType('Color');
    rectangle.material = new Cesium.Material({
        fabric : {
            type: 'Image',
            uniforms: {
                //image: svgEntityImage
                image: svgDataDeclare + svg.outerHTML
            }
        }
    });
});
//INIT ACQUIRE
$(document).ready(function() {
    $('input[type=radio][name=algorithmRadio]').change(function() {
        if (this.value == 'algStadium') {
            $('#algOne').hide();
            $('#algTwo').show();
            $('#stadiumType').prop('checked','true');
        }
        else{
            $('#algOne').show();
            $('#algTwo').hide();
            $('#sensorsType').prop('checked','true');
        }
    });
});
function optimize() {
    var algorithm = $("#optimizeModal").find("#psoAlgorithm").is(':checked') ? 'PARTICLE_SWARM' :
        $("#optimizeModal").find("#evolutionaryAlgorithm").is(':checked') ? 'EVOLUTIONARY' :
        $("#optimizeModal").find("#greedyAlgorithm").is(':checked') ? 'GREEDY' :
        $("#optimizeModal").find("#stadiumAlgorithm").is(':checked') ? 'STADIUM' : '';

    var type = $("#optimizeModal").find("#sensorsType").is(':checked') ? 'SENSORS' :
        $("#optimizeModal").find("#weaponsType").is(':checked') ? 'WEAPONS' :
        $("#optimizeModal").find("#weaponsSensorsType").is(':checked') ? 'WEAPONS_SENSORS' :
        $("#optimizeModal").find("#stadiumType").is(':checked') ? 'STADIUM' : '';

    console.log('Optimizing ' + type + ' and ' + algorithm);
    socket.emit('startOptimization', algorithm, type);
}
function stopOptimization() {
    console.log("Stopping optimization");
    socket.emit('stopOptimization');
}
function evaluateScenario() {
    console.log("Evaluating scenario");
    clearHeatmap();
    socket.emit('evaluateScenario');
}
function generateThreats() {
    if(!$("#generateThreatsItem").hasClass("disabled")) {
        console.log("Generating threats");
        socket.emit('generateThreats');
    }
}

//HEAT MAP
var heatMap = [];
socket.on('defendedArea', function(grid) {
    heatMap = heatMap.concat(voronoiGrid(grid));
});
function voronoiGrid(grid) {
    console.log("Displaying grid");
    var voronoi = d3.geom.voronoi();
    voronoi.clipExtent([[grid.bounds.west, grid.bounds.south], [grid.bounds.east, grid.bounds.north]]);
    voronoi.x(function(d) {
        return d.lon;
    });
    voronoi.y(function(d) {
        return d.lat;
    });

    var polygons = voronoi(grid.points);

    var primitives = [];

    for(var i in polygons) {
        var vertices = [];
        for(var j in polygons[i]) {
            if(Array.isArray(polygons[i][j])) {
                vertices = vertices.concat(polygons[i][j]);
            }
        }
        var pg = new Cesium.Polygon({
            positions: Cesium.Cartesian3.fromDegreesArray(vertices),
            material: new Cesium.Material({
                fabric : {
                    type : 'Color',
                    uniforms : {
                        //color : new Cesium.Color(1.0 - grid.points[i].avgPk, grid.points[i].avgPk, 0.0, 0.6)
                        color : new Cesium.Color(
                            red(2 * (1 - grid.points[i].maxPk) - 1),
                            green(2 * (1 - grid.points[i].maxPk) - 1),
                            blue(2 * (1 - grid.points[i].maxPk) - 1), 0.6)
                    }
                }
            })
        });
        scene.primitives.add(pg);
        primitives.push(pg);
    }

    return primitives;
}
function interpolate(val, y0, x0, y1, x1) {
    return (val-x0)*(y1-y0)/(x1-x0) + y0;
}
function base(val) {
    if ( val <= -0.75 ) return 0;
    else if ( val <= -0.25 ) return interpolate( val, 0.0, -0.75, 1.0, -0.25 );
    else if ( val <= 0.25 ) return 1.0;
    else if ( val <= 0.75 ) return interpolate( val, 1.0, 0.25, 0.0, 0.75 );
    else return 0.0;
}
function red(val) {
    return base(val - 0.5);
}
function green(val) {
    return base(val);
}
function blue(val) {
    return base(val + 0.5);
}
function clearHeatmap() {
    for(var p in heatMap) {
        scene.primitives.remove(heatMap[p]);
    }
    heatMap = [];
}

//CLEAR DATA
function clearData(callback) {
    console.log('Clearing existing data');
    var dbType = [
        {createType: 'createVolume', typeData: ['remove', 'sensor'], db: 'sensor'},
        {createType: 'createVolume', typeData: ['remove', 'weapon'], db: 'weapon'},
        {createType: 'createTrack', typeData: ['remove'], db: 'track'},
        {createType: 'createAsset', typeData: ['remove'], db: 'asset'}
    ];
    for (var i=0; i < 4; i++){
        socket.emit('findAll', dbType[i].db, dbType[i], function (cb, dbType) {
            if (cb.length > 0) {
                for (var i = 0; i < cb.length; i++) {
                    if (i>0) dbType.typeData.pop();
                    dbType.typeData.push(cb[i]);
                    Acquire[dbType.createType].apply(null, dbType.typeData);
                }
            }else{console.log('Database \"' + dbType.db + '\" contained no data')}
            if (dbType.db == 'asset'){
                document.getElementById('entityList').innerHTML = '';
                if(callback) {
                    callback();
                }
            }
        });
    }
}
//NEW SCENARIO
function newScenario() {
    clearData(function(){
        socket.emit('newF');
    });
}

//REFRESH FROM DATABASE
function refreshData() {
    clearData(function() {
        console.log('Refreshing data');
        var db = [
            {dbType: 'sensor', cType: 'createVolume', pt: 'sensor'},
            {dbType: 'weapon', cType: 'createVolume', pt: 'weapon'},
            {dbType: 'track', cType: 'createTrack'},
            {dbType: 'asset', cType: 'createAsset'}
        ];
        for (var i=0; i < 4; i++) {
            socket.emit('refreshAll', db[i], function (cb) {
                for (var rA in cb) {
                    Acquire[cb[rA].createType].apply(null, cb[rA].dbData);
                }
            });
        }
    });
}

/**
 * CESIUM ELEMENT CONSTRUCTION/UPDATING
 */
socket.on('loadElement', function(createType, dbData){
    if(dbData) {
        Acquire[createType].apply(null, dbData);
    }
});
socket.on('updateElement', function(createType, dbData){
    if (dbData) {
        Acquire[createType].apply(null, dbData);
        dbData[0] = 'add';
        Acquire[createType].apply(null, dbData);
    }
});

/**
 * SCENARIO LOADING
 */
function openScenario() {
    socket.emit('openFile', function (dirs) {
        if (dirs.length > 0) {
            var scene = document.getElementById('scenarios');
            scene.innerHTML = '';
            for (var i = 0; i < dirs.length; i++) {
                var opt = document.createElement('option');
                opt.setAttribute('value', dirs[i]);
                opt.innerHTML = dirs[i];
                opt.required = true;
                scene.size = i + 1;
                scene.appendChild(opt);
            }
        }
        $('#openModal').modal();
    })
}
function loadScenario(){
    var e = document.getElementById('scenarios');
    var sel = e.options[e.selectedIndex].value;
    clearData(function() {
        socket.emit('getScenario', sel, function (msg) {
            $('#generateThreatsItem').removeClass('disabled');
            if (msg == 'pop') {
                console.log(msg);
            }
        })
    })
}

/**
 * SCENARIO SAVING
 */
function saveScenario() {
    document.getElementById('saveDialog').style.display = 'block';
}
function saveFile() {
    document.getElementById('saveDialog').style.display = 'none';
    var name = document.getElementById('scenarioName').value;
    socket.emit('saveScenario', name, function(cb){
        console.log(cb);
    });
}

/**
 * IMPORT FILE LOADING
 */
function importFile() {
    document.getElementById('importDialog').style.display = 'block';
}
document.getElementById('files').onchange = handleFileSelect;
function handleFileSelect() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var files = document.getElementById('files');
        var names = [];
        for (var i=0; i < files.files.length; i++) {
            names.push('<tr><td><p>', files.files.item(i).name, '</p></td></tr>');
        }
        document.getElementById('fileNames').innerHTML = '<table><tr><th><h4>Files</h4></th></tr>' + names.join('') + '</table>';
    } else {
        alert('The File APIs are not fully supported by your browser.');
    }
}
function loadFile(){
    document.getElementById('importDialog').style.display = 'none';
    var inp = document.getElementById('files');
    for (var i=0; i < inp.files.length; i++) {
        var file = inp.files[i];
        var r = new FileReader();
        r.i = i;
        r.ftype = getFileType(inp.files.item(i).name);
        r.onload = function(e) {
            var text = e.target.result;
            var dataArray = text.split(/\r\n|\n|\r/);
            for (var i=0; i < dataArray.length; i++) {
                var line = dataArray[i];
                socket.emit('importFile', this.ftype, line)
            }
        };
        r.readAsText(file);
    }
}
function getFileType(name){
    var nm = name.toLowerCase();
    if (nm.indexOf('radar') > -1){
        return 'loadSensor';
    }else if(nm.indexOf('launcher') > -1){
        return 'loadWeapon';
    }else if(nm.indexOf('threat') > -1){
        if (nm.indexOf('area') > -1){
            return 'loadAsset';
        }else {
            return 'loadThreat';
        }
    }else if(nm.indexOf('region') > -1 || nm.indexOf('area') > -1 || nm.indexOf('asset') > -1){
        return 'loadAsset';
    }else{
        console.log('File type unidentifiable')
    }
}

/**
 * PAGE LOAD
 */
function start() {
    //LOAD MIL STD 2525 FONTS
    if (armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded()) {
        console.log("fonts loaded fast");
        fontsLoaded = true;
    }
    else {
        fontCheckTimer = setTimeout(checkFonts, 1000);
    }
    //TABS
    var container = document.getElementById("tabContainer");
    var tabcon = document.getElementById("tabscontent");
    var navitem = document.getElementById("tabHeader_1");
    var ident = navitem.id.split("_")[1];

    navitem.parentNode.setAttribute("data-current", ident);
    navitem.setAttribute("class", "tabActiveHeader");
    var pages = tabcon.getElementsByClassName("tabpage");

    for (i = 1; i < pages.length; i++) {
        pages.item(i).style.display = "none";
    }

    var tabs = container.getElementsByTagName("li");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].onclick = displayPage;
    }

    // on click of one of tabs
    function displayPage() {
        var current = this.parentNode.getAttribute("data-current");
        //remove class of activetabheader and hide old contents
        document.getElementById("tabHeader_" + current).removeAttribute("class");
        document.getElementById("tabpage_" + current).style.display = "none";

        var ident = this.id.split("_")[1];
        //add class of activetabheader to new active tab and show contents
        this.setAttribute("class", "tabActiveHeader");
        document.getElementById("tabpage_" + ident).style.display = "block";
        this.parentNode.setAttribute("data-current", ident);
    }
}

/**
 * FUNCTIONS
 */
var logging = document.getElementById('logging');
function loggingMessage(message) {
    logging.innerHTML = message;
}
var fontCheckTimer = null;
var retries = 15;
var attempts = 0;
var fontsLoaded = false;

function checkFonts()
{
    if(armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded())
    {
        console.log("fonts loaded");
        fontsLoaded = true;
    }
    else if(attempts < retries)
    {
        attempts++;
        fontCheckTimer = setTimeout(checkFonts, 1000);
        console.log("fonts loading...");
        //sometimes font won't register until after a render attempt
        armyc2.c2sd.renderer.MilStdIconRenderer.Render("SHAPWMSA-------",{});
    }
    else
    {
        console.log("fonts didn't load or status couldn't be determined for " + retries + " seconds.");
        //Do actions to handle font failure to load scenario
    }
}

function slideDown(container, distance) {
    var box = document.getElementById(container);
    ( box.style.bottom == distance || box.style.bottom == '' )
        ? box.style.bottom = '1em'
        : box.style.bottom = distance;
}
function slideLeft() {
    var box = document.getElementById('leftHide');
    var text = document.getElementById('lhToggleA');
    if ( box.style.left == '0em' || box.style.left == '0' || box.style.left == '') {
        box.style.left = '-22.75em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'
    } else {
        box.style.left = '0em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>'
    }
}
function slideRight() {
    var box = document.getElementById('rightHide');
    var text = document.getElementById('rhToggleA');
    if ( box.style.right == '0em' || box.style.right == '' ) {
        box.style.right = '-19.75em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>';
    }else{
        box.style.right = '0em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>';
    }
}
function screenshotDiag(){
    var ovCont = document.getElementById('scOverlay');
    ovCont.innerHTML = '';
    cesiumWidget.render();
    var overlay = cesiumWidget.canvas.toDataURL('image/png');
    var image = document.createElement('img');
    image.src = overlay;
    ovCont.appendChild(image);
    ovCont.style.display = 'block';
    document.getElementById('save1').style.display = 'block';
    document.getElementById('save2').style.display = 'none';
    document.getElementById('saveImgDialog').style.display = 'block';
}
function screenshot(){
    document.getElementById('saving').style.display = 'block';
    document.getElementById('saveImgDialog').style.display = 'none';
    document.getElementById('save1').style.display = 'none';
    document.getElementById('save2').style.display = 'block';
    html2canvas(document.body, {
        onrendered: function(canvas) {
            document.getElementById('saving').style.display = 'none';
            var img = canvas.toDataURL('image/png');
            console.log(img);
            var a = document.getElementById('screenSave');
            a.href = img;
            a.download = document.getElementById('imgName').value + '.png';
            document.getElementById('saveImgDialog').style.display = 'block';
            document.getElementById('scOverlay').style.display = 'none';
        }
    });
}
