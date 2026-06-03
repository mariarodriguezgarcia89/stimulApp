// Centraliza los modelos Sequelize, define las asociaciones entre entidades y exporta todo junto
const sequelize = require('../config/database');

// Modelos de cada entidad de la base de datos
const Usuario = require('./Usuario');
const Juego = require('./Juego');
const Tokens = require('./Tokens');
const Partida = require('./Partida');
const Estadistica = require('./Estadistica');
const Refran = require('./Refran');
const Intruso = require('./Intruso');

// Asociaciones entre modelos (equivalente a claves foráneas en SQL)
// Un usuario puede tener muchas partidas. Una partida pertenece a un usuario.
Usuario.hasMany(Partida, { foreignKey: 'usuario_id' });
Partida.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Un juego puede tener muchas partidas. Una partida pertenece a un juego.
Juego.hasMany(Partida, { foreignKey: 'juego_id' });
Partida.belongsTo(Juego, { foreignKey: 'juego_id' });

// Un usuario tiene un token de recuperación de contraseña.
Usuario.hasOne(Tokens, { foreignKey: 'usuario_id' });
Tokens.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Un usuario tiene estadísticas por juego (máximo una fila por combinación usuario+juego).
Usuario.hasMany(Estadistica, { foreignKey: 'usuario_id' });
Estadistica.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Un juego tiene estadísticas de varios usuarios.
Juego.hasMany(Estadistica, { foreignKey: 'juego_id' });
Estadistica.belongsTo(Juego, { foreignKey: 'juego_id' });

// Exportamos la instancia de conexión y todos los modelos
module.exports = {
    sequelize,
    Usuario,
    Juego,
    Tokens,
    Partida,
    Estadistica,
    Refran, 
    Intruso
};
