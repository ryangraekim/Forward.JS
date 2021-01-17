module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Home', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
          type: DataTypes.STRING(20),
          allowNull: false
      }
    }, {
      tableName: 'Home',
    });
  };