// Carregando modulos
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { engine } = require('express-handlebars')
const path = require('path')
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const { connect } = require('http2')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
require('./models/Categoria')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const passport = require('passport')
require('./config/auth')(passport)
// Configurações
    // Session
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            next()
        })
    //Engine
        app.engine('handlebars', engine({defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        }
    }));
        app.set('view engine', 'handlebars');
        app.set('views', path.join(__dirname, 'views'));
    // Body Parser
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(bodyParser.json())
    // Mongoose
        mongoose.connect('mongodb://localhost/blogapp').then(() => console.log('Conectado com sucesso')
        ).catch(
           (err) => console.log('Erro ao se conectar ' + err)
        )
    // Public
        app.use(express.static(path.join(__dirname, 'public')))
// Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({date: 'desc'}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/404')
        })
    })

    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Esta postagem não existe')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })
    
    app.get('/categorias', (req, res) => {
        Categoria.find().then((categoria) => {
            res.render('categoria/index' , {categoria: categoria})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render('categoria/postagens' , {categoria: categoria, postagens: postagens})
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao listar as postagens')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
            
            
            
            //res.render('categoria/index' , {categoria: categoria})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao carregar a pagina desta categoria')
            res.redirect('/')
        })
    })

    app.use ('/admin', admin);
    
    app.use ('/usuarios', usuarios);

    app.get('/404', (req, res) => {
        res.send('Error 404!')
    })

// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log('Tá aberto pessoal')
})