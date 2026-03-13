const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Juego = sequelize.define('juegos', {

    id_juego: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING,
    },

    descripcion: {
        type: DataTypes.TEXT,
    },

    categoria_cognitiva: {
        type: DataTypes.STRING,
    },

    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

});

module.exports = Juego;

