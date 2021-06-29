'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var techSchema = Schema( {
  userId: ObjectId,
  item: String,
  description: String,
  customselect: String,
  iwant: String,
  contact: String,
} );

module.exports = mongoose.model( 'Tech', techSchema );
