const fs = require('fs');
const path = require('path');


const db = require("../database/models");
const Op = db.Sequelize.Op;

module.exports = {
    add: (req, res) => {
        res.render('productAdd', {
            productos,
            categorias
        })
    },
    save: (req, res) => {
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            const { name, description, price, discount, category, colors } = req.body;
            if (req.files) {
                var imagenes = req.files.map(imagen => imagen.filename)
            }
            let producto = {
                id: productos[productos.length - 1].id + 1,
                name,
                description,
                price: +price,
                images: req.files.length != 0 ? imagenes : ["default-image.png"],
                discount: +discount,
                category,
                colors

            }
            productos.push(producto);
            fs.writeFileSync(productsFilePath, JSON.stringify(productos, null, 2), 'utf-8')
            res.redirect('/')
        } else {
            return res.render('productAdd', {
                errors: errors.mapped(),
                categorias
            })
        }
    },
    detail: (req, res) => {
        let categorias = db.Category.findAll(); 
        let producto = db.Product.findByPk(req.params.id,{
                    include : [
                {
                    association : 'imagenes',
                },
                {
                    association : 'category',
                }
             ]
        })
        Promise.all([categorias,producto]) 
        .then(([categorias,producto]) => {
            // return res.send(producto); 
            db.Product.findAll({
                where : {
                    id : {[Op.ne]: producto.id},
                    categoryId : producto.category.id,
                },
                include :[
                    {association: 'imagenes'},
                    {association: 'category'}
                ]
            }).then((relacionados) => {          
                return res.render('detail',{
                relacionados,
                producto,
                categorias
                })
            })
        }).catch(error => console.log(error))
    },
    search: (req, res) => {
        let categorias = db.Category.findAll();
        let result = db.Product.findAll({
            where : {
            [Op.or] : [
                {
                    name :  {[Op.substring] : req.query.search}
                },
                {
                    description : {[Op.substring] : req.query.search}
                }
            ]
            },
        include : [
            {association : 'imagenes'}  
        ]
        })
        Promise.all([categorias,result]) 
        .then(([categorias,result]) => res.render('resultSearch',{
            result,
            categorias,
            search : req.query.search
        })).catch(error => console.log(error))
    },
    edit: (req, res) => {
        let producto = productos.find(producto => producto.id === +req.params.id);
        return res.render('productEdit', {
            productos,
            producto,
            categorias
        })
    },
    update: (req, res) => {
            const {name, description,price,cuotas,categoryId,colors,stock} = req.body;
    
            db.Product.update(
                {
                    name : name.trim(),
                    description : description.trim(),
                    price,
                    cuotas,
                    categoryId,
                    colors,
                    stock
                },
                {
                    where : {
                        id : req.params.id
                    }
                }
            ).then( () =>   res.redirect('/products/vistaAdmin'))
            .catch(error => console.log(error))
            }
    ,
    vistaAdmin: (req, res) => {
        {
            let categorias = db.Category.findAll();
            let productos = db.Product.findAll({
                include : [
                    {
                        association : 'imagenes',
                    },
                    {
                        association : 'category',
                    }
                ]
            })
            Promise.all([categorias,productos])
            .then(([categorias,productos]) =>{
            return res.render('listaProductsAdmin',{
                categorias,
                productos  
                })
                // return res.send(resultado);
            }).catch(error => console.log(error));
    
            }
    },
    categoriasProduct: (req, res) => {
        let categoria = db.Category.findByPk(req.params.id);
        let categorias = db.Category.findAll();
        let resultado = db.Product.findAll({
            where : {
                categoryId : req.params.id
            },
            include : [
                {association : 'imagenes'},
                {association : 'category'},  
            ]
        })
        Promise.all([categorias,resultado,categoria]) 
        .then(([categorias,resultado,categoria]) =>{
            // return res.send(resultado);
            return res.render('categorias', {
                resultado,
                categorias,
                categoria
        }).catch(error => console.log(error))
    })
    },
    remove: (req, res) => {
        db.Product.destroy({
            where : {
                id : req.params.id
            },
            include : [
                {association : 'imagenes'},
                {association : 'category'},  
            ]
        }).then(() => res.redirect('/products/vistaAdmin'))
        .catch(error => console.log(error))
     },
    productos: (req, res) => {
        let categorias = db.Category.findAll();
        let productos = db.Product.findAll({
            include : [
                {
                    association : 'imagenes',
                },
                {
                    association : 'category',
                }
            ]
        })
        Promise.all([categorias,productos])
        .then(([categorias,productos]) =>{
        return res.render('vistaProduct',{
            categorias,
            productos  
            })
            // return res.send(resultado);
        }).catch(error => console.log(error));

    }
}