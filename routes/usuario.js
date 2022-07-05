const { hash } = require('bcryptjs')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')
require('../config/auth')(passport)

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {

    let erros = [];

    if(!req.body.nome || typeof req.body.nome == 'undefined' || typeof req.body.nome == 'null'){
        erros.push({text: 'Nome invalido'})
    }

    if(!req.body.email || typeof req.body.email == 'undefined' || typeof req.body.email == 'null'){
        erros.push({text: 'Email invalido'})
    }

    if(!req.body.senha || typeof req.body.senha == 'undefined' || typeof req.body.senha == 'null'){
        erros.push({text: 'Senha invalida'})
    }

    if(req.body.senha.length < 4){
        erros.push({text: 'Senha muito curta'})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({text: 'As senhas são diferentes tente novamente'})
    }

    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Esse email já foi cadastrado')
                res.redirect('/usuarios/registro')
            }else{

                const novoUsuario = new Usuario ({
                    nome: req.body.nome,
                    senha: req.body.senha,
                    email: req.body.email
                })


                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuario')
                            res.redirect('/')
                        }else{
                            novoUsuario.senha = hash

                            novoUsuario.save().then(() => {
                                req.flash('success_msg', 'Usuario criado com sucesso')
                                res.redirect('/')
                            }).catch((err) => {
                                req.flash('error_msg', 'Houve um erro ao criar o usuario, tente novamente!')
                                res.redirect('/usuarios/registro')
                            })
                        }
                    })
                })

            }

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })

    }
})

router.get('/login', (req, res, next) => {
    res.render('usuarios/login')
})


router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
    
}) 


module.exports = router