//models
const categoryCollection = require('../models/CategoryModel')
const productCollection = require('../models/productsModel')

//get cateogy list
exports.categoryList = async (search, currentPage, noOfList, skipPages) => {
    let findQuery = { isDeleted: false };

    if (search) {
        findQuery.categoryName = {
            "$regex": new RegExp(search, 'i')
        }
    }
    try {
        let totalNoOfList = await categoryCollection.countDocuments({ isDeleted: false })
        let categoryList = await categoryCollection.find(findQuery).skip(skipPages * noOfList).limit(currentPage * noOfList)

        return { categoryList, currentPage, totalNoOfList };
    } catch (err) {
        console.log(err);

    }
}

//add a category
exports.addCategory = async (categoryName, categoryDescription) => {
    try {
        let category = await categoryCollection.findOne({ categoryName });

        if (category) { //checks for the category exist aldready

            if (!category.isDeleted) { //checks the category is not deleted
                return "category Aldready exists"
            }

            //if category is deleted change deleted to flase
            let oldCategory = await categoryCollection.findOneAndUpdate({ categoryName }, { $set: { isDeleted: false } })
            return
        }

        //category does not exist
        const newCategory = new categoryCollection({
            categoryName,
            categoryDescription
        })

        await newCategory.save();

    } catch (err) {
        console.log(err);
    }
}

//edit category
exports.editCategory = async (categoryID, categoryName, categoryDescription) => {
    try {
        let category = await categoryCollection.findOne({ categoryName, _id: { $ne: categoryID } })

        if (category) { //if anoter category with same name exist aldready
            return "category already exists cannot edit"
        }

        await categoryCollection.updateOne({ _id: categoryID }, { categoryName, categoryDescription })
    } catch (err) {
        console.log(err);

    }
}

//delete category
exports.deleteCategory = async (categoryId) => {
    try {
        const productsExists = await productCollection.findOne({ categoryID: categoryId })
        if (productsExists) {
            return "Categories with products cannot delete"
        }
        await categoryCollection.updateOne({ _id: categoryId }, { isDeleted: true })
    } catch (err) {

    }
}