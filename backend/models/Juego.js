// Modelo Sequelize para la tabla juegos: catálogo de juegos disponibles con su categoría cognitiva
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
