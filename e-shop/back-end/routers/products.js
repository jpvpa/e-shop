const express = require('express');
const { Category } = require('../models/category');
const {Product} = require('../models/product');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpg' : 'jpg',
    'image/jpeg' : 'jpeg'

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid){
            uploadError=null;
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
  const uploadOptions = multer({ storage: storage })

// http://localhost:3000/api/v1/products
router.get('/',async (req,res) =>{
    //.select('name image') los valores de name e image se van a mostrar solamente .select(name image -_id) los valores
    // de name e image  se van a mostrar pero los de -_id no por el menos que se le agrego ("-")
    const productList = await Product.find().populate('category');
    if(!productList){
        res.status(500).json({success:false});
    }
    res.send(productList);
})
router.get('/:id',async (req,res) =>{
    //.populate('category'); obtener los detalles de la categoria
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({success:false});
    }
    res.send(product);
})
router.post(`/`,uploadOptions.single('image'), async (req,res) =>{
    let category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');
    const file = req.file
    if(!file) return res.status(400).send('No image in the request');
    const fileName = req.file.filename
    const basePath= `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });
    console.log(req.body)
    product = await product.save();
    if(!product){
        return res.status(500).send('The product cannot be created');
    }
    res.send(product);

})

router.put('/:id', uploadOptions.single('image'),async (req,res)=>{
    let category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid Product');

    const file = req.file;
    let imagepath;
    if(file) {
        const fileName = req.file.filename
        const basePath= `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    }else{
        imagepath= product.image;
    }
    

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    },
    {
       new: true 
    });
    if(!updatedProduct)
    return res.status(404).send('The product cannot be updated');
    res.send(updatedProduct);
})
router.delete(`/:id`, (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid prduct ID');
    }
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success: true, message:"The Product is deleted"});
        }else{
            return res.status(404).json({success: false, message:"The Product is not found"});
        }
        
    }).catch(err=>{
        return res.status(400).json({success: false, error:err})
    })
})

router.get('/get/count',async (req,res) =>{
    let productCount = await Product.countDocuments();
    if(!productCount){
        res.status(500).json({success:false});
    }
    res.send({productCount: productCount});
})

router.get('/get/featured/:count',async (req,res) =>{
    const count = req.params.count ? req.params.count : 0
    let products = await Product.find({
        isFeatured:true
    }).limit(+count);
    if(!products){
        res.status(500).json({success:false});
    }
    res.send(products);
})
router.get('/',async (req,res) =>{
    //query parameters ttp://localhost:3000/api/v1/products?categories=Computer
    let filter = {};
    if(req.query.categories){
        const filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success:false});
    }
    res.send(productList);
})

router.put('/gallery-product/:id',uploadOptions.array('images',10), async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid product ID');
    }
    const files = req.files;
    let imagesPaths = []
    const basePath= `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    if(files){
        files.map(file =>{
            console.log(file.fileName)
            imagesPaths.push(`${basePath}${file.filename}`)
        })
    }

    const product = await Product.findByIdAndUpdate(req.params.id, {
        images:imagesPaths
    },
    {
       new: true 
    });

    if(!product)
    return res.status(500).send('The product cannot be updated');
    res.send(product);

})


module.exports = router;