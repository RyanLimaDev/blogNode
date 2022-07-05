const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
require('../models/Postagem')
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/post', (req, res) => {
    res.send('Posts')
})

router.get('/categorias', (req, res) => {
    Categoria.find().sort({date:'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch( (err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {
    
    let errors = [];

    if(!req.body.nome || typeof req.body.nome == 'undefined' || typeof req.body.nome == 'null'){
        errors.push({text: 'Nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == 'undefined' || typeof req.body.slug == 'null'){
        errors.push({text: 'Slug inválido'})
    }

    if(req.body.nome.length < 2){
        errors.push({text: 'Nome pequeno demais'})
    }

    if(errors.length > 0){
        res.render('admin/addcategorias', {errors: errors})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria, tente novamente')
            res.redirect('/admin')
        }) 
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria} ).catch((err) => {
            req.flash('error_msg', 'Essa categoria não existe')
            res.redirect('/admin/categorias')
        })
    })
    
})

router.post('/categorias/edit', (req, res) => {

    let error = [];

    if(!req.body.nome || typeof req.body.nome == 'undefined' || typeof req.body.nome == 'null'){
        error.push({text: 'Nome invalido'})
    }

    if(!req.body.slug || typeof req.body.slug == 'undefined' || typeof req.body.slug == 'null'){
        error.push({text: 'Slug invalido'})
    }

    if(req.body.nome.length < 2){
        error.push({text: 'Nome pequeno demais'})
    }

    if(error.length > 0){
        req.flash('error_msg', 'Houve um erro na edição, por favor tente novamente')
        res.redirect('/admin/categorias')
    }else{

        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
    
            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            }).catch( (err) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria')
                res.redirect('/admin/categorias')
            })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria')
            res.redirect('/admin/categorias')
        })
    }
 
})

router.post('/categorias/delete', (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', (req,res) => {
    Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagem) => {
        res.render('admin/postagens', {postagens: postagem})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
    
})

router.get('/postagens/add', (req,res) => {
    Categoria.find().then( (categoria) => {
        res.render('admin/addpostagem', {categorias: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar as categorias')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/nova', (req,res) => {

    let error = []

    if (req.body.categoria == '0') {
        error.push({text: 'Categoria invalida, adicione uma categoria'})
    }

    if(error.length > 0) {
        res.render('/admin/addpostagem', {errors: error})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem salva com sucesso')
            res.redirect('/admin/postagens')
        }).catch( (err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a postagem')
            res.redirect('/admin/postagens')
        })
    }

})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao localizar a postagem')
    })
    
})

router.post('/postagens/edit', (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a postagem')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao localizar a postagem a ser editada')
    })
})

router.post('/postagens/delete', (req, res) => {
    Postagem.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao deletar a postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router