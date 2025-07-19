const {
    success,
    unknownError,
    serverValidation,
    badRequest,
  } = require("../../../../../globalHelper/response.globalHelper");

  const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


const CategoryVideo = require("../../model/website/categoryvideo.model");


//  Add the category //

async function Addcategory(req, res){
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return serverValidation(res, errors.array());
        }
        const {category}=req.body;
        const categoryExist = await CategoryVideo.findOne({category: category});
        if(categoryExist){
            return badRequest(res, "Category already exist");
        }
        const Addcategory = new CategoryVideo({
            category: category
        });
        const categoryVideo = await Addcategory.save();
        return success(res, "Category added successfully", categoryVideo);
    } catch (error) {
        return unknownError(res, error.message);
    }
}

// make api to get all the category //

async function getAllCategory(req, res) {
    try {
        const { category } = req.query;
        let categories;

        if (category) {
            console.log(category);
            categories = await CategoryVideo.find({ category })
        } else {
            categories = await CategoryVideo.find()
                .sort({ createdAt: -1 });
        }
        return success(res, "Category List", categories);
    } catch (error) {
        return unknownError(res, error.message);
    }
}


async function AddcategoryVideo(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return serverValidation(res, errors.array());
        }

        const { videoUrl, videotitle, id } = req.body;

        const categoryExist = await CategoryVideo.findOne({ _id: id });
        if (!categoryExist) {
            return badRequest(res, "Category not found");
        }

        const updateCategory = await CategoryVideo.findOneAndUpdate(
            { _id: id },
            {
                $push: {
                    video: {
                        videoUrl: videoUrl,
                        videotitle: videotitle
                    }
                }
            },
            { new: true }
        );

        return success(res, "VideoUrl Add successfully", updateCategory);
    } catch (error) {
        return unknownError(res, error.message);
    }
}



// Now I have to make a api to filter category and get the video url //

async function getVideoUrl(req, res){
    try {
        const {category}=req.params;
        const categoryExist = await CategoryVideo.findOne({category: category});
        if(!categoryExist){
            return badRequest(res, "Category not found");
        }
        return success(res, "Category video", categoryExist);
    }
    catch (error) {
        return unknownError(res, error.message);
    }
}


// Delete the category video
async function deleteCategoryvideo(req, res) {
    try {
        const { categoryId } = req.params;
        const { videoUrl } = req.query; 

        if (!categoryId) {
            return error(res, "Category ID is required");
        }

        if (videoUrl) {
            await CategoryVideo.findByIdAndUpdate(categoryId, {
                $pull: { video: { videoUrl: videoUrl } }
            });
            
            const category = await CategoryVideo.findById(categoryId);
            if (category.video.length === 0) {
                await CategoryVideo.findByIdAndDelete(categoryId);
                return success(res, "Category and video deleted successfully.");
            }

            return success(res, "Video and title deleted from category successfully.");
        } else {
            await CategoryVideo.findByIdAndDelete(categoryId);
            return success(res, "Category deleted successfully.");
        }
    } catch (error) {
        return unknownError(res, error.message);
    }
}



module.exports = {
    Addcategory,
    getAllCategory,
    AddcategoryVideo,
    getVideoUrl,
    deleteCategoryvideo
}

