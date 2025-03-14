const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Song = sequelize.define('Song', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        playlist_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Playlists',
                key: 'id',
            },
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        artist: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return Song;
};