// Modelo Sequelize para la tabla usuarios: datos personales, credenciales, foto de perfil y datos del cuidador
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('usuarios', {

    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING,
    },

    apellidos: {
        type: DataTypes.STRING,
    },

    email: {
        type: DataTypes.STRING,
        unique: true
    },

    password_hash: {
        type: DataTypes.STRING
    },

    fecha_nacimiento: {
        type: DataTypes.DATE
    },

    foto_perfil: {
        type: DataTypes.STRING
    },

    email_cuidador: {
        type: DataTypes.STRING
    },

    nombre_cuidador: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

});

module.exports = Usuario;