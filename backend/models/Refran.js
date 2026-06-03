// Modelo Sequelize para la tabla refranes: primera parte del refrán y tres opciones de respuesta
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

// Sin timestamps: la tabla no requiere createdAt ni updatedAt
}, {timestamps: false});

module.exports = Refran;