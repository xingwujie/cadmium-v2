/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {

    function Vapor(){
        /*
            optimize
            stopOptimization
            generateThreats
            evaluateScenario
            clearHeatmap
        */
    }

    Vapor.prototype.optimize = function() {
        var algorithm = $("#optimizeModal").find("#psoAlgorithm").is(':checked') ? 'PARTICLE_SWARM' :
            $("#optimizeModal").find("#evolutionaryAlgorithm").is(':checked') ? 'EVOLUTIONARY' :
                $("#optimizeModal").find("#greedyAlgorithm").is(':checked') ? 'GREEDY' :
                    $("#optimizeModal").find("#stadiumAlgorithm").is(':checked') ? 'STADIUM' : '';

        var type = $("#optimizeModal").find("#sensorsType").is(':checked') ? 'SENSORS' :
            $("#optimizeModal").find("#sensorsTypeTwo").is(':checked') ? 'SENSORS' :
                $("#optimizeModal").find("#weaponsType").is(':checked') ? 'WEAPONS' :
                    $("#optimizeModal").find("#weaponsSensorsType").is(':checked') ? 'WEAPONS_SENSORS' :
                        $("#optimizeModal").find("#stadiumType").is(':checked') ? 'STADIUM' : '';

        console.log('Optimizing ' + type + ' and ' + algorithm);
        socket.emit('startOptimization', algorithm, type);
    };

    Vapor.prototype.stopOptimization = function() {
        console.log("Stopping optimization");
        socket.emit('stopOptimization');
    };

    Vapor.prototype.generateThreats = function() {
        if (!$("#generateThreatsItem").hasClass("disabled")) {
            console.log("Generating threats");
            socket.emit('generateThreats');
        }
    };

    Vapor.prototype.evaluateScenario = function() {
        console.log("Evaluating scenario");
        clearHeatmap();
        socket.emit('evaluateScenario');
    };

    Vapor.prototype.clearHeatmap = function() {
        for(var p in heatMap) {
            scene.primitives.remove(heatMap[p]);
        }
        heatMap = [];
    };

    Vapor.prototype.entHandler = function(action){
        var data = {};
        $('#pickedList :input').each(function(){
            var id = this.id;
            data[id] = $(this).val();
        });
        if (action == 'update') {
            updateEntity(data)
        }else if (action == 'move') {
            socket.emit('searchID', action, data.cType, data.id, function(cb, msg){
                moveEntity(cb)
            })
        }else if(action == 'delete') {
            deleteEntity(data)
        }
    };
    
    Vapor.prototype.updateEntity = function(data){
        var self = this;
        self[data.create]('remove', data);
        (function(data) {
            socket.emit('updateData', data.id, data.cType, data, function (cb) {
                self[cb.create]('add', cb);
                $('#pickedList').html('');
                self.displayElementData(cb.id, cb.cType, '#pickedList');
            });
        })(data);
    };
    
    Vapor.prototype.moveEntity = function(data){
        var self = this;
        var mousePosition = new Cesium.Cartesian2();
        var mousePositionProperty = new Cesium.CallbackProperty(
            function(time, result){
                var position = scene.camera.pickEllipsoid(mousePosition, undefined, result);
                var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
                cartographic.height = 0.0;
                return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
            },
            false);

        var dragging = false;
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var rem = {id: data.id};
        var dt, icon;
        (data.cType == 'sensor') ? icon = "SFGPESR---*****" : icon = "SFGPEWM---*****";
        handler.setInputAction(
            function(click) {
                var pickLoc = Cesium.Cartesian3.fromDegrees(data.Lon, data.Lat);
                var pickedObject = scene.pick(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pickLoc));
                if (Cesium.defined(pickedObject)) {
                    dragging = true;
                    scene.screenSpaceCameraController.enableRotate = false;
                    self.createVolume('remove', rem);
                    dt = self.createIcon(icon, 'dragTemp', data.name, data.Lon, data.Lat, 0);
                    Cesium.Cartesian2.clone(click.position, mousePosition);
                    dt.position = mousePositionProperty;
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_DOWN
        );

        handler.setInputAction(
            function(movement) {
                if (dragging) {
                    Cesium.Cartesian2.clone(movement.endPosition, mousePosition);
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        );

        handler.setInputAction(
            function(click) {
                if(dragging) {
                    dragging = false;
                    scene.screenSpaceCameraController.enableRotate = true;
                    viewer.entities.removeById('dragTemp');
                    var cp = scene.camera.pickEllipsoid(click.position);
                    var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cp);
                    var positions = [Cesium.Cartographic.fromRadians(cartographic.longitude, cartographic.latitude)];
                    var promise = Cesium.sampleTerrain(terrainProvider, 11, positions);
                    Cesium.when(promise, function (updatedPositions) {
                        cartographic.height = positions[0].height;
                        data.Lat = Cesium.Math.toDegrees(cartographic.latitude);
                        data.Lon = Cesium.Math.toDegrees(cartographic.longitude);
                        data.Alt = cartographic.height;
                        data.latlonalt = [data.Lon, data.Lat, data.Alt];
                        socket.emit('updateData', data.id, data.cType, data, function(cb){
                            self.createVolume('add', cb);
                        });
                        handler = handler && handler.destroy();
                    });
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_UP
        );
    };
    
    Vapor.prototype.deleteEntity = function(data){
        var self = this;
        self[data.create]('remove', data);
        socket.emit('removeData', data.cType, data.id);
    };

    exports.Vapor = Vapor;
})(this);

$(document).ready(function() {
    $('input[type=radio][name=algorithmRadio]').change(function() {
        if (this.value == 'algStadium') {
            $('#algOne').hide();
            $('#algTwo').show();
            $('#sensorsTypeTwo').prop('checked','true');
        }
        else{
            $('#algOne').show();
            $('#algTwo').hide();
            $('#sensorsType').prop('checked','true');
        }
    });
});