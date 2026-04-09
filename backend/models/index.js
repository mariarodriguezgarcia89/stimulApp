// Importamos la instancia de conexión a MariaDB configurada en config/database.js.
const sequelize = require('../config/database');

// Importamos cada modelo desde su archivo individual
const Usuario = require('./Usuario');
const Juego = require('./Juego');
const Tokens = require('./Tokens');
const Partida = require('./Partida');
const Estadistica = require('./Estadistica');

// Las asociaciones definen las relaciones entre tablas, equivalente a las
// claves foráneas del SQL. Sequelize las usa para construir JOINs automáticos
// cuando se usa 'include' en las consultas.

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
    Estadistica
};
