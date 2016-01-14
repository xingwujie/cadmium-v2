/**
 * Created by Brent on 12/11/2015.
 */

(function(exports){


    function BirdsEye(){
        /*
            startBirdsEye
            stopBirdsEye
         */
    }


    BirdsEye.prototype.startBirdsEye = function() {
        var satAlgorithm = $("input[name=satAlgorithmRadio]:checked").val();
        var bmAlgorithm = $("input[name=bmAlgorithmRadio]:checked").val();

        console.log('Starting Simulation');
        socket.emit('startOptimization', {sat_algorithm: satAlgorithm, bm_algorithm: bmAlgorithm, bigioType: "com.a2i.message.StartMessage"});
    };

    BirdsEye.prototype.stopBirdsEye = function() {
        console.log("Stopping Simulation");
        socket.emit('stopOptimization');
    };

    exports.BirdsEye = BirdsEye;
})(this);