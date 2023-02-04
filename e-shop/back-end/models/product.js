const mongoose = require ('mongoose');
const { Category } = require('./category');

const productSchema = mongoose.Schema ({
    name: {type: String, required:true},
    description: {type: String, required:true},
    richDescription: {type: String, default:''},
    image: {type: String, default:''},
    images: [{type: String}],
    brand: {type: String},
    price: {type: String, default:0},
    category: {type: mongoose.Schema.Types.ObjectId, ref:'Category', required: true},
    countInStock: {type: Number, required:true, min:0, max:255},
    rating: {type: Number, default:0},
    numReviews: {type: Number, default:0},
    isFeatured: {type: Boolean, default:false},
    dataCreated: {type: Date, default:Date.now}
})
//quitar el _ en el id
productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});
productSchema.set('toJSON', {
    vitruals: true,
});

exports.Product = mongoose.model('Product', productSchema);