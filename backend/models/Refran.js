// Modelo de refrán: primera parte y tres opciones de respuesta (dos incorrectas y una correcta)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Refran = sequelize.define('refranes', {

    id_refran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    primera_parte: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    opcion_uno: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    opcion_dos: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    opcion_correcta: {
        type: DataTypes.STRING,
        allowNull: false,
    }

}, {timestamps: false});

module.exports = Refran;