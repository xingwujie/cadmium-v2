/**
 * Created by Brent on 6/1/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var track = new Schema({
    hdr: [],
    id: String,
    name: String,
    times: [],
    positions: [],
    velocity: [],
    colors: [],
    rcs: Number,
    tValid: Number,
    beta: Number,
    radIntensity: Number,
    identity : String,
    classification: String,
    lastThreatTruth: Boolean,
    cType: String,
    create: String
},{ id: false });

mongoose.model('track', track, 'track');
