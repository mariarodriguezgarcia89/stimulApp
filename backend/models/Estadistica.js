// Modelo de estadísticas: resumen agregado por usuario y juego (mejor puntuación, media, total de partidas)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estadisticas = sequelize.define('estadisticas_usuario', {

    id_estadisticas: {
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

    mejor_puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    total_partidas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    puntuacion_media: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false
    },

    ultima_partida: {
        type: DataTypes.DATE,
        allowNull: false
    }

});

module.exports = Estadisticas;
