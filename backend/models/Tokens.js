// Modelo Sequelize para la tabla tokens: almacena tokens de recuperación de contraseña con fecha de expiración
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tokens = sequelize.define('tokens', {

    id_tokens: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    token: {
        type: DataTypes.STRING,
        unique: true
    },

    expira_en: {
        type: DataTypes.DATE,
        allowNull: false
    },

    usado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

});

module.exports = Tokens;