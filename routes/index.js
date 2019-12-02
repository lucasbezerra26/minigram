const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise')
const multer = require('multer')


const storage = multer.diskStorage({

	destination : (req,file,cb)=>{
		cb(null,"public/uploads")
	},
	filename: (req,file,cb)=>{
		cb(null , file.originalname)
	}

}) 
const uploadFile = multer({storage})


async function connectToDB(req,res,next){

	try{
		router.db = await mysql.createConnection({
			host:'localhost',
			user:'root',
			password:'Lucas123',
			database:'meu_minigram'
		})
		console.log("CONNECTED...")

	}
	catch(error){
		console.log("NOT CONNECTED!")
	}
	
	next()
}
router.use(connectToDB)


const redirectLogin = (req,res,next)=>{
	if(!req.session.userId){
		res.redirect('/login')
	}else{
		next()
	}


}

const redirectFeed = (req,res,next)=>{
	if(req.session.userId){
		res.redirect('/')
	}else{
		next()
	}
	

}

// Methods GETs

router.get('/',redirectLogin,(req,res)=>{
	res.render('index')
})

router.get('/login',redirectFeed,(req,res)=>{
	res.render('login')
})

router.get('/cadastrar',redirectFeed,(req,res)=>{
	res.render('cadastro',{
		buttom: "Entrar",
		urlPath: '/login'
	})
})
router.get('/perfil',redirectLogin,async(req,res)=>{
	
	const[publicacoes, col] = await router.db.execute(`SELECT*FROM publicacoes WHERE usuario=? ORDER BY id DESC`,[req.session.userId])

	res.render('perfil',{
		publicacoes:publicacoes,
		user: req.session.user
	})
})
router.get('/publicar',redirectLogin,(req,res)=>{
	res.render('publicar')
})
router.get('/feed',async(req,res)=>{

	const[publicacoes, col] = await router.db.execute(`SELECT*FROM publicacoes WHERE usuario=? ORDER BY id DESC`,[req.session.userId])

	res.render('feed',{
		buttom: "Publicar",
		urlPath: '/publicar',
		publicacoes:publicacoes,
		user: req.session.user
	})
})

router.get('/logout',redirectLogin,(req,res)=>{
	req.session.destroy(err=>{
		if(err){
			res.redirect('/')
		}

		res.clearCookie('minigram_session')
		res.redirect('/login')
	})
})

// Methods POST
router.post('/cadastrar',async(req,res)=>{
	const name  = req.body.name
	const username  = req.body.username
	const email  = req.body.email
	const password = req.body.password
	
	try{

		await router.db.execute(`INSERT INTO usuarios(
			nome,username,senha,email) VALUES(?,?,?,?)`,[name,username,,password,email])

	}catch(error){
		console.log(error)
	}

	res.redirect('/login')
})

router.post('/login',async(req,res)=>{
	const username  = req.body.username
	const password = req.body.password
	console.log(username , password)
	try{
	
		const[user , col] = await router.db.execute(`SELECT*FROM usuarios WHERE username=? AND senha=? `,[username,password])
		console.log(user)
		if(user.length == 0){
			res.render('login',{
				errorMessage:'Oops! Usuário e/ou Senha Incorretos.'
			})
		}
		else{
			req.session.userId = user[0].id
			req.session.user = user[0]
			res.redirect('/feed')
		}
	}
	
	catch(error){
		console.log(error)
	}
})


router.post('/publicar',uploadFile.single('img'),async(req,res)=>{
	const local = req.body.local
	const legenda = req.body.legenda
	const filtro = req.body.filtro
	const fileNameImage = req.file.filename
	const user = req.session.userId

	try{

		await router.db.execute(`INSERT INTO publicacoes(
			localizacao, legenda,filtro,foto,usuario) VALUES(?,?,?,?,?)`,[local , legenda , filtro , fileNameImage , user])

		res.redirect('/feed')
	}catch(error){
		console.log(error)
	}

})

router.post('/api/', uploadFile.single('img'),async(req,res)=>{
	const local = req.body.location
	const legenda = req.body.subtitle
	const filtro = req.body.filtro

	// console.log(req.file)
	const fileNameImage = req.file.filename
	const instagram = req.body.instagram
	// console.log(instagram)
	// console.log("local:", local, "legenda", legenda, "filtro", filtro, "fileNameImage", fileNameImage)

	try{

		const [user, col] = await router.db.execute(`SELECT * FROM usuarios WHERE username=?`, [instagram])
		console.log(user)


		await router.db.execute(`INSERT INTO publicacoes(
			localizacao, legenda,filtro,foto,usuario) VALUES(?,?,?,?,?)`,[local , legenda , filtro , fileNameImage , user[0].id])

		res.status(200).send({'status': 'ok'})
	}catch(error){
		res.status(400).send({'status': 'error'})
		console.log(error)
	}

})

module.exports = router;
