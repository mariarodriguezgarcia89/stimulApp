// Modelo de intruso: cuatro imágenes por ronda, una de ellas es el intruso, con explicación y nivel
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Intruso = sequelize.define('intrusos', {
    id_intruso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imagen_uno: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imagen_dos: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imagen_tres: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    imagen_cuatro: {
        type: DataTypes.STRING,
        allowNull: false,   
    },
    imagen_intrusa: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    nivel: {
        type: DataTypes.STRING,
        allowNull: false,
    }, 
    explicacion: {
        type: DataTypes.STRING,
        allowNull: false,
    }

}, {timestamps: false});

module.exports = Intruso;