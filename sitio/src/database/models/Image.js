module.exports = (sequelize, dataTypes) => {
    let alias = 'Image';
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: dataTypes.STRING(255)
            //dafaultValue: null
        },
        productId: {
            type: dataTypes.INTEGER,
        }
    };
    let config = {
        tableName: 'images',
        timestamps: false
    };
    const Image = sequelize.define(alias, cols, config)

    return Image;
}