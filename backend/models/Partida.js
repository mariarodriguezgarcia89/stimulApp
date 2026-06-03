// Modelo Sequelize para la tabla partidas: registra cada sesión de juego con puntuación, duración y nivel
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Partida = sequelize.define('partidas', {

    id_partida: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    juego_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    nivel: {
        type: DataTypes.ENUM('facil', 'dificil'),
        allowNull: false
    },

    puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    duracion_segundos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    completada: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },

    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

module.exports = Partida;