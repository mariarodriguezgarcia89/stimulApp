const sequelize = require('../config/database');

//Importar modelos
const Usuario = require('./Usuario');
const Juego = require('./Juego');
const Tokens = require('./Tokens');
const Partida = require('./Partida');
const Estadistica = require('./Estadistica');

//Realizar asociaciones entre modelos
Usuario.hasMany(Partida, { foreignKey: 'usuario_id' });
Partida.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Juego.hasMany(Partida, { foreignKey: 'juego_id' });
Partida.belongsTo(Juego, { foreignKey: 'juego_id' });
Usuario.hasOne(Tokens, { foreignKey: 'usuario_id' });
Tokens.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Estadistica, { foreignKey: 'usuario_id' });
Estadistica.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Juego.hasMany(Estadistica, { foreignKey: 'juego_id' });
Estadistica.belongsTo(Juego, { foreignKey: 'juego_id' });

//Exportar modelos para usarlos en rutas
module.exports = {
    Usuario,
    Juego,
    Tokens,
    Partida,
    Estadistica
};

//Sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
    .then(() => console.log('Modelos sincronizados con la base de datos'))
    .catch(err => console.error('Error al sincronizar modelos:', err));